
import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BeneficiarySearchProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function BeneficiarySearch({ value, onChange, disabled = false }: BeneficiarySearchProps) {
  const [searchValue, setSearchValue] = useState('');
  const [showResults, setShowResults] = useState(false);

  const { data: beneficiaries, isLoading } = useQuery({
    queryKey: ['beneficiaries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('*')
        .order('last_name');
      
      if (error) throw error;
      return data || [];
    },
  });

  const filteredBeneficiaries = useMemo(() => {
    if (!beneficiaries || !searchValue.trim()) return beneficiaries || [];
    
    const searchLower = searchValue.toLowerCase();
    return beneficiaries.filter(beneficiary => {
      const firstName = (beneficiary.first_name || '').toLowerCase();
      const lastName = (beneficiary.last_name || '').toLowerCase();
      const email = (beneficiary.email || '').toLowerCase();
      
      return firstName.includes(searchLower) || 
             lastName.includes(searchLower) || 
             email.includes(searchLower);
    });
  }, [beneficiaries, searchValue]);

  const selectedBeneficiary = beneficiaries?.find(b => b.id === value);

  useEffect(() => {
    if (selectedBeneficiary) {
      setSearchValue(`${selectedBeneficiary.last_name} ${selectedBeneficiary.first_name}`);
    } else {
      setSearchValue('');
    }
  }, [selectedBeneficiary]);

  const handleInputChange = (inputValue: string) => {
    if (disabled) return;
    
    setSearchValue(inputValue);
    setShowResults(true);
    
    if (!inputValue.trim()) {
      onChange('');
    }
  };

  const handleSelect = (beneficiaryId: string) => {
    if (disabled) return;
    
    onChange(beneficiaryId);
    const selected = beneficiaries?.find(b => b.id === beneficiaryId);
    if (selected) {
      setSearchValue(`${selected.last_name} ${selected.first_name}`);
    }
    setShowResults(false);
  };

  const handleInputFocus = () => {
    if (!disabled) {
      setShowResults(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setShowResults(false);
      if (selectedBeneficiary) {
        setSearchValue(`${selectedBeneficiary.last_name} ${selectedBeneficiary.first_name}`);
      }
    }, 200);
  };

  useEffect(() => {
    if (selectedBeneficiary && !showResults && !searchValue) {
      setSearchValue(`${selectedBeneficiary.last_name} ${selectedBeneficiary.first_name}`);
    }
  }, [selectedBeneficiary, showResults, searchValue]);

  return (
    <FormItem>
      <FormLabel>Bénéficiaire *</FormLabel>
      <div className="relative">
        <Input
          value={searchValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={disabled ? "" : "Rechercher un bénéficiaire..."}
          disabled={isLoading || disabled}
          className={disabled ? "bg-gray-100 cursor-not-allowed" : ""}
        />
        
        {showResults && !disabled && (
          <Card className="absolute top-full left-0 right-0 mt-1 max-h-64 overflow-y-auto z-50 bg-white border shadow-lg">
            {isLoading ? (
              <div className="p-3 text-center text-gray-500">Chargement...</div>
            ) : filteredBeneficiaries?.length === 0 ? (
              <div className="p-3 text-center text-gray-500">Aucun bénéficiaire trouvé</div>
            ) : (
              <div className="py-1">
                {filteredBeneficiaries?.map((beneficiary) => (
                  <div
                    key={beneficiary.id}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-50 flex items-center gap-2"
                    onMouseDown={() => handleSelect(beneficiary.id)}
                  >
                    <Check
                      className={`h-4 w-4 ${
                        value === beneficiary.id ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="font-medium">
                        {beneficiary.last_name} {beneficiary.first_name}
                      </p>
                      {beneficiary.email && (
                        <p className="text-sm text-gray-500">
                          {beneficiary.email}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
      <FormMessage />
    </FormItem>
  );
}

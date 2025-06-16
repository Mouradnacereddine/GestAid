
import React, { useState, useMemo } from 'react';
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { useDonors } from '@/hooks/useDonors';

interface DonorSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function DonorSearch({ value, onChange }: DonorSearchProps) {
  const [searchValue, setSearchValue] = useState('');
  const [showResults, setShowResults] = useState(false);

  const { data: donors, isLoading } = useDonors();

  const filteredDonors = useMemo(() => {
    if (!donors || !searchValue.trim()) return donors || [];
    
    const searchLower = searchValue.toLowerCase();
    return donors.filter(donor => {
      const name = (donor.name || '').toLowerCase();
      const email = (donor.email || '').toLowerCase();
      const phone = (donor.phone || '').toLowerCase();
      const reference = `DON-${donor.id.slice(-8).toUpperCase()}`.toLowerCase();
      
      return name.includes(searchLower) || 
             email.includes(searchLower) || 
             phone.includes(searchLower) ||
             reference.includes(searchLower);
    });
  }, [donors, searchValue]);

  const selectedDonor = donors?.find(d => d.id === value);

  const handleInputChange = (inputValue: string) => {
    setSearchValue(inputValue);
    setShowResults(true);
    
    // Si l'input est vidé, on efface aussi la sélection
    if (!inputValue.trim()) {
      onChange('');
    }
  };

  const handleSelect = (donorId: string) => {
    onChange(donorId);
    const selected = donors?.find(d => d.id === donorId);
    if (selected) {
      setSearchValue(selected.name);
    }
    setShowResults(false);
  };

  const handleSelectNone = () => {
    onChange('none');
    setSearchValue('Aucun donateur');
    setShowResults(false);
  };

  const handleInputFocus = () => {
    setShowResults(true);
    if (selectedDonor || value === 'none') {
      setSearchValue('');
    }
  };

  const handleInputBlur = () => {
    // Délai pour permettre le clic sur un élément de la liste
    setTimeout(() => {
      setShowResults(false);
      // Restaurer le nom du donateur sélectionné si aucune sélection n'a été faite
      if (selectedDonor && value !== 'none') {
        setSearchValue(selectedDonor.name);
      } else if (value === 'none') {
        setSearchValue('Aucun donateur');
      }
    }, 200);
  };

  // Afficher le nom du donateur sélectionné quand on n'est pas en train de chercher
  React.useEffect(() => {
    if (selectedDonor && !showResults && value !== 'none') {
      setSearchValue(selectedDonor.name);
    } else if (value === 'none' && !showResults) {
      setSearchValue('Aucun donateur');
    }
  }, [selectedDonor, showResults, value]);

  return (
    <FormItem>
      <FormLabel>Donateur</FormLabel>
      <div className="relative">
        <Input
          value={searchValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder="Rechercher un donateur..."
          disabled={isLoading}
        />
        
        {showResults && (
          <Card className="absolute top-full left-0 right-0 mt-1 max-h-64 overflow-y-auto z-50 bg-white border shadow-lg">
            {isLoading ? (
              <div className="p-3 text-center text-gray-500">Chargement...</div>
            ) : (
              <div className="py-1">
                <div
                  className="px-3 py-2 cursor-pointer hover:bg-gray-50 flex items-center gap-2"
                  onMouseDown={handleSelectNone}
                >
                  <Check
                    className={`h-4 w-4 ${
                      value === 'none' ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-600">Aucun donateur</p>
                  </div>
                </div>
                {filteredDonors?.length === 0 ? (
                  <div className="p-3 text-center text-gray-500">Aucun donateur trouvé</div>
                ) : (
                  filteredDonors?.map((donor) => (
                    <div
                      key={donor.id}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-50 flex items-center gap-2"
                      onMouseDown={() => handleSelect(donor.id)}
                    >
                      <Check
                        className={`h-4 w-4 ${
                          value === donor.id ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{donor.name}</p>
                        <div className="flex gap-2 text-sm text-gray-500">
                          <span>DON-{donor.id.slice(-8).toUpperCase()}</span>
                          {donor.email && <span>• {donor.email}</span>}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </Card>
        )}
      </div>
      <FormMessage />
    </FormItem>
  );
}

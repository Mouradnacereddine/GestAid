
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';

interface BeneficiarySelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function BeneficiarySelect({ value, onChange }: BeneficiarySelectProps) {
  const { data: beneficiaries } = useQuery({
    queryKey: ['beneficiaries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('*')
        .order('last_name');
      if (error) throw error;
      return data;
    },
  });

  return (
    <FormItem>
      <FormLabel>Bénéficiaire *</FormLabel>
      <Select onValueChange={onChange} value={value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un bénéficiaire" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {beneficiaries?.map((beneficiary) => (
            <SelectItem key={beneficiary.id} value={beneficiary.id}>
              {beneficiary.last_name} {beneficiary.first_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
}

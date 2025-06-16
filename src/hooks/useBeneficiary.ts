
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useBeneficiary(beneficiaryId?: string) {
  return useQuery({
    queryKey: ['beneficiary', beneficiaryId],
    queryFn: async () => {
      if (!beneficiaryId) return null;
      
      console.log('Récupération du bénéficiaire:', beneficiaryId);
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('id', beneficiaryId)
        .maybeSingle();
      
      if (error) {
        console.error('Erreur lors de la récupération du bénéficiaire:', error);
        throw error;
      }
      
      console.log('Bénéficiaire récupéré:', data);
      return data;
    },
    enabled: !!beneficiaryId,
  });
}

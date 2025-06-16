
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useBeneficiaries() {
  return useQuery({
    queryKey: ['beneficiaries'],
    queryFn: async () => {
      console.log('Récupération des bénéficiaires...');
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erreur lors de la récupération des bénéficiaires:', error);
        throw error;
      }
      
      console.log('Bénéficiaires récupérés:', data);
      return data;
    },
  });
}

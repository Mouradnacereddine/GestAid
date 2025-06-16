
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useDonors() {
  return useQuery({
    queryKey: ['donors'],
    queryFn: async () => {
      console.log('Récupération des donateurs...');
      const { data, error } = await supabase
        .from('donors')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erreur lors de la récupération des donateurs:', error);
        throw error;
      }
      
      console.log('Donateurs récupérés:', data);
      return data;
    },
  });
}

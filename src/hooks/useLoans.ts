
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useLoans() {
  return useQuery({
    queryKey: ['loans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loans')
        .select(`
          id,
          created_at,
          loan_date,
          expected_return_date,
          actual_return_date,
          beneficiary_id,
          notes,
          loan_number,
          contract_signed,
          beneficiaries (
            first_name,
            last_name,
            email
          ),
          loan_articles (
            *,
            articles (
              id,
              name,
              identifier,
              state
            )
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching loans:', error);
        throw error;
      }
      
      return data || [];
    },
  });
}

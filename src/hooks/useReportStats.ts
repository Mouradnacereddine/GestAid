
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useReportStats() {
  return useQuery({
    queryKey: ['report-stats'],
    queryFn: async () => {
      const [articlesRes, loansRes, beneficiariesRes, transactionsRes] = await Promise.all([
        supabase.from('articles').select('id, status, created_at'),
        supabase.from('loans').select('id, loan_date, actual_return_date'),
        supabase.from('beneficiaries').select('id, created_at'),
        supabase.from('financial_transactions').select('id, amount, type, transaction_date')
      ]);

      return {
        articles: articlesRes.data || [],
        loans: loansRes.data || [],
        beneficiaries: beneficiariesRes.data || [],
        transactions: transactionsRes.data || []
      };
    },
  });
}

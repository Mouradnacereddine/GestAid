
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export function useFinancialData(dateRange: { from: Date; to: Date }) {
  return useQuery({
    queryKey: ['financial-reports', dateRange],
    queryFn: async () => {
      console.log('Fetching transactions for date range:', dateRange);
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .gte('transaction_date', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('transaction_date', format(dateRange.to, 'yyyy-MM-dd'))
        .order('transaction_date', { ascending: true });
      
      if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }
      console.log('Fetched transactions:', data);
      console.log('Number of transactions:', data?.length || 0);
      
      // Log each transaction with details
      data?.forEach((transaction, index) => {
        console.log(`Transaction ${index + 1}:`, {
          id: transaction.id,
          type: transaction.type,
          amount: transaction.amount,
          category: transaction.category,
          description: transaction.description,
          date: transaction.transaction_date
        });
      });
      
      return data || [];
    },
    // Assurer que les données ne sont pas mises en cache de manière incorrecte
    staleTime: 30000, // 30 secondes
    refetchOnWindowFocus: false,
  });
}

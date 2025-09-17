import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useArticles() {
  return useQuery({
    queryKey: ['articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          categories(name),
          donors(name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching articles:', error);
        throw error;
      }

      return data || [];
    },
  });
}

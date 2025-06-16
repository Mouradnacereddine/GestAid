
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Article {
  id: string;
  name: string;
  identifier: string;
  categories?: {
    name: string;
  };
}

export function useArticleSearch() {
  const [searchValue, setSearchValue] = useState('');

  const { data: articlesRaw, isLoading } = useQuery({
    queryKey: ['available-articles'],
    queryFn: async () => {
      console.log('Fetching articles...');
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          categories (name)
        `)
        .eq('status', 'disponible')
        .order('name');
      
      if (error) {
        console.error('Error fetching articles:', error);
        throw error;
      }
      
      const result = data || [];
      console.log('Articles fetched:', result);
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });

  const articles = Array.isArray(articlesRaw) ? articlesRaw : [];

  const safeArticles = useMemo(() => {
    if (!Array.isArray(articles)) {
      console.warn('Articles is not an array:', articles);
      return [];
    }
    return articles.filter(a => a && typeof a === 'object' && a.id);
  }, [articles]);

  const filteredArticles = useMemo(() => {
    if (!searchValue?.trim()) return safeArticles;
    
    const searchLower = searchValue.toLowerCase();
    const filtered = safeArticles.filter(article => {
      const name = String(article?.name || '').toLowerCase();
      const identifier = String(article?.identifier || '').toLowerCase();
      const categoryName = String(article?.categories?.name || '').toLowerCase();
      
      return name.includes(searchLower) || 
             identifier.includes(searchLower) || 
             categoryName.includes(searchLower);
    });
    
    console.log('Filtered articles:', filtered);
    return filtered;
  }, [safeArticles, searchValue]);

  return {
    articles: safeArticles,
    filteredArticles,
    searchValue,
    setSearchValue,
    isLoading,
  };
}


import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ArticleSelectorProps {
  selectedArticles: string[];
  onToggleArticle: (articleId: string) => void;
}

export function ArticleSelector({ selectedArticles, onToggleArticle }: ArticleSelectorProps) {
  const { data: availableArticles } = useQuery({
    queryKey: ['available-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          categories (name)
        `)
        .eq('status', 'disponible')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-4">
      <FormLabel>Articles à prêter *</FormLabel>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto border rounded-md p-4">
        {availableArticles?.map((article) => (
          <div
            key={article.id}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedArticles.includes(article.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onToggleArticle(article.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-sm">{article.name}</p>
                <p className="text-xs text-gray-500">{article.identifier}</p>
                <Badge variant="outline" className="text-xs mt-1">
                  {article.categories?.name}
                </Badge>
              </div>
              <div className="ml-2">
                {selectedArticles.includes(article.id) ? (
                  <Minus className="h-4 w-4 text-blue-600" />
                ) : (
                  <Plus className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {selectedArticles.length > 0 && (
        <div className="p-3 bg-green-50 rounded-md">
          <p className="text-sm text-green-800">
            {selectedArticles.length} article(s) sélectionné(s)
          </p>
        </div>
      )}
      <FormMessage />
    </div>
  );
}

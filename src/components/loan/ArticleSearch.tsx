
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ArticleSearchProps {
  selectedArticles: string[];
  onToggleArticle: (articleId: string) => void;
}

export function ArticleSearch({ selectedArticles, onToggleArticle }: ArticleSearchProps) {
  const [searchValue, setSearchValue] = useState('');
  const [showResults, setShowResults] = useState(false);

  const { data: articles, isLoading } = useQuery({
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
      return data || [];
    },
  });

  const filteredArticles = useMemo(() => {
    if (!articles || !searchValue.trim()) return articles || [];
    
    const searchLower = searchValue.toLowerCase();
    return articles.filter(article => {
      const name = (article.name || '').toLowerCase();
      const identifier = (article.identifier || '').toLowerCase();
      const categoryName = (article.categories?.name || '').toLowerCase();
      
      return name.includes(searchLower) || 
             identifier.includes(searchLower) || 
             categoryName.includes(searchLower);
    });
  }, [articles, searchValue]);

  const selectedArticleDetails = useMemo(() => {
    if (!articles) return [];
    return articles.filter(article => selectedArticles.includes(article.id));
  }, [articles, selectedArticles]);

  const handleInputFocus = () => {
    setShowResults(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  };

  const handleSelect = (articleId: string) => {
    onToggleArticle(articleId);
    setSearchValue('');
  };

  const handleRemove = (articleId: string) => {
    onToggleArticle(articleId);
  };

  return (
    <div className="space-y-4">
      <FormLabel>Articles à prêter *</FormLabel>
      
      {/* Articles sélectionnés */}
      {selectedArticleDetails.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-green-50 rounded-md">
          {selectedArticleDetails.map((article) => (
            <Badge key={article.id} variant="secondary" className="flex items-center gap-1">
              <span>{article.name}</span>
              <button
                type="button"
                onClick={() => handleRemove(article.id)}
                className="ml-1 hover:bg-red-100 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Barre de recherche */}
      <div className="relative">
        <div className="flex gap-2">
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder="Rechercher un article à ajouter..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setShowResults(!showResults)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {showResults && (
          <Card className="absolute top-full left-0 right-0 mt-1 max-h-64 overflow-y-auto z-50 bg-white border shadow-lg">
            {isLoading ? (
              <div className="p-3 text-center text-gray-500">Chargement...</div>
            ) : filteredArticles?.length === 0 ? (
              <div className="p-3 text-center text-gray-500">Aucun article trouvé</div>
            ) : (
              <div className="py-1">
                {filteredArticles?.map((article) => (
                  <div
                    key={article.id}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-50 flex items-center gap-2"
                    onMouseDown={() => handleSelect(article.id)}
                  >
                    <Check
                      className={`h-4 w-4 ${
                        selectedArticles.includes(article.id) ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{article.name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{article.identifier}</span>
                        {article.categories?.name && (
                          <Badge variant="outline" className="text-xs">
                            {article.categories.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>

      {selectedArticles.length > 0 && (
        <div className="text-sm text-gray-600">
          {selectedArticles.length} article(s) sélectionné(s)
        </div>
      )}
      
      <FormMessage />
    </div>
  );
}

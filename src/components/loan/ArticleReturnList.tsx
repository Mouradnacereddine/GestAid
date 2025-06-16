
import React from 'react';
import { FormLabel } from '@/components/ui/form';
import { ArticleReturnItem } from './ArticleReturnItem';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ArticleReturnListProps {
  loanArticles: any[];
  selectedArticles: Set<string>;
  onArticleSelection: (articleId: string, checked: boolean) => void;
  onArticleStateUpdate: (articleId: string, field: 'return_state' | 'return_notes', value: string) => void;
}

export function ArticleReturnList({
  loanArticles,
  selectedArticles,
  onArticleSelection,
  onArticleStateUpdate
}: ArticleReturnListProps) {
  const articlesToReturn = loanArticles.filter(la => !la.returned_at);
  const returnedArticles = loanArticles.filter(la => la.returned_at);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="space-y-4">
      {articlesToReturn.length > 0 && (
        <>
          <FormLabel>Sélectionner les articles à retourner</FormLabel>
          <div className="text-sm text-gray-600 mb-4">
            Cochez les articles qui sont retournés. Les articles non cochés restent en prêt.
          </div>
          
          {articlesToReturn.map((loanArticle) => {
            const articleId = loanArticle.articles?.id || loanArticle.article_id;
            const isSelected = selectedArticles.has(articleId);
            
            return (
              <ArticleReturnItem
                key={articleId}
                loanArticle={loanArticle}
                isSelected={isSelected}
                onSelectionChange={onArticleSelection}
                onStateChange={onArticleStateUpdate}
              />
            );
          })}
        </>
      )}

      {returnedArticles.length > 0 && (
        <>
          {articlesToReturn.length > 0 && <Separator className="my-6" />}
          <h4 className="text-md font-medium text-gray-800">Articles déjà retournés</h4>
          <div className="space-y-3">
            {returnedArticles.map((loanArticle) => (
               <div key={loanArticle.id} className="flex justify-between items-center p-3 bg-gray-100 rounded-lg border border-gray-200 opacity-70">
                <div>
                  <p className="font-medium text-gray-700">{loanArticle.articles?.name}</p>
                  <p className="text-sm text-gray-500">{loanArticle.articles?.identifier}</p>
                   {loanArticle.return_notes && <p className="text-xs text-gray-500 mt-1">Notes: {loanArticle.return_notes}</p>}
                </div>
                <div className="text-right text-sm">
                   <Badge variant="secondary" className="capitalize mb-1">{loanArticle.return_state?.replace(/_/g, ' ') || 'Bon'}</Badge>
                   <p className="text-gray-600">Retourné le {formatDate(loanArticle.returned_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}


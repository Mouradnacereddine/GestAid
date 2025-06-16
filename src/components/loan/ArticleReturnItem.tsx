
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const stateOptions = [
  { value: 'neuf', label: 'Neuf' },
  { value: 'tres_bon', label: 'Très bon' },
  { value: 'bon', label: 'Bon' },
  { value: 'usage', label: 'Usagé' },
  { value: 'a_reparer', label: 'À réparer' },
];

interface ArticleReturnItemProps {
  loanArticle: any;
  isSelected: boolean;
  onSelectionChange: (articleId: string, checked: boolean) => void;
  onStateChange: (articleId: string, field: 'return_state' | 'return_notes', value: string) => void;
}

export function ArticleReturnItem({
  loanArticle,
  isSelected,
  onSelectionChange,
  onStateChange
}: ArticleReturnItemProps) {
  const articleId = loanArticle.articles?.id || loanArticle.article_id;

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center gap-4 mb-4">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelectionChange(articleId, checked as boolean)}
        />
        <div className="flex-1">
          <p className="font-medium">{loanArticle.articles?.name}</p>
          <p className="text-sm text-gray-500">{loanArticle.articles?.identifier}</p>
        </div>
        <Badge variant="outline">
          État initial: {loanArticle.articles?.state}
        </Badge>
      </div>

      {isSelected && (
        <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FormLabel>État au retour</FormLabel>
            <Select 
              onValueChange={(value) => onStateChange(articleId, 'return_state', value)}
              defaultValue="bon"
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner l'état" />
              </SelectTrigger>
              <SelectContent>
                {stateOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <FormLabel>Notes sur le retour</FormLabel>
            <Textarea 
              placeholder="Observations sur l'état..."
              onChange={(e) => onStateChange(articleId, 'return_notes', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

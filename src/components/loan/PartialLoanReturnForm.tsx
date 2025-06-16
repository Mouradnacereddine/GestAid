import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, CheckCircle } from 'lucide-react';
import { usePartialLoanReturn } from '@/hooks/usePartialLoanReturn';
import { LoanInfoDisplay } from './LoanInfoDisplay';
import { ArticleReturnList } from './ArticleReturnList';

const partialReturnSchema = z.object({
  actual_return_date: z.string().min(1, 'La date de retour est requise'),
  return_notes: z.string().optional(),
  returned_articles: z.array(z.string()).min(1, 'Au moins un article doit être retourné'),
  articles_return_states: z.array(z.object({
    article_id: z.string().min(1, 'ID article requis'),
    return_state: z.enum(['neuf', 'tres_bon', 'bon', 'usage', 'a_reparer']),
    return_notes: z.string().optional(),
  })).min(1, 'Au moins un état d\'article doit être défini'),
});

type PartialReturnFormData = z.infer<typeof partialReturnSchema>;

interface PartialLoanReturnFormProps {
  onClose: () => void;
  loan: any;
  loanArticles: any[];
}

export function PartialLoanReturnForm({ onClose, loan, loanArticles }: PartialLoanReturnFormProps) {
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set());

  const form = useForm<PartialReturnFormData>({
    resolver: zodResolver(partialReturnSchema),
    defaultValues: {
      actual_return_date: new Date().toISOString().split('T')[0],
      return_notes: '',
      returned_articles: [],
      articles_return_states: [],
    },
  });

  const partialReturnMutation = usePartialLoanReturn(loan);

  const handleArticleSelection = (articleId: string, checked: boolean) => {
    const newSelectedArticles = new Set(selectedArticles);
    let newArticleStates = form.getValues('articles_return_states');

    if (checked) {
      newSelectedArticles.add(articleId);
      if (!newArticleStates.some(s => s.article_id === articleId)) {
        newArticleStates.push({ article_id: articleId, return_state: 'bon' as const, return_notes: '' });
      }
    } else {
      newSelectedArticles.delete(articleId);
    }

    setSelectedArticles(newSelectedArticles);
    form.setValue('returned_articles', Array.from(newSelectedArticles));
    form.setValue('articles_return_states', newArticleStates);
  };

  const updateArticleState = (articleId: string, field: 'return_state' | 'return_notes', value: string) => {
    const currentStates = form.getValues('articles_return_states');
    const updatedStates = currentStates.map(s => 
      s.article_id === articleId 
        ? { ...s, [field]: value }
        : s
    );
    form.setValue('articles_return_states', updatedStates);
  };

  const onSubmit = (data: PartialReturnFormData) => {
    const submitData = {
      actual_return_date: data.actual_return_date,
      return_notes: data.return_notes,
      returned_articles: data.returned_articles,
      articles_return_states: data.articles_return_states.filter(s => 
        data.returned_articles.includes(s.article_id)
      ) as Array<{
        article_id: string;
        return_state: "neuf" | "tres_bon" | "bon" | "usage" | "a_reparer";
        return_notes?: string;
      }>,
    };

    partialReturnMutation.mutate(submitData, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <div className="w-full max-w-4xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <CheckCircle className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold">Retour Partiel - {loan.loan_number}</h2>
      </div>

      <LoanInfoDisplay loan={loan} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="actual_return_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de retour effective *</FormLabel>
                <FormControl>
                  <input
                    {...field}
                    type="date"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <ArticleReturnList
            loanArticles={loanArticles}
            selectedArticles={selectedArticles}
            onArticleSelection={handleArticleSelection}
            onArticleStateUpdate={updateArticleState}
          />

          <FormField
            control={form.control}
            name="return_notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes générales sur le retour</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Notes générales sur le retour partiel..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={partialReturnMutation.isPending || selectedArticles.size === 0}>
              {partialReturnMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer le retour ({selectedArticles.size} article{selectedArticles.size > 1 ? 's' : ''})
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

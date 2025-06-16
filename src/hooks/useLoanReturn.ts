
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export function useLoanReturn() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (loanId: string) => {
      if (!user) throw new Error("Utilisateur non authentifié pour effectuer un retour.");

      const returnDate = new Date().toISOString();
      
      // 1. Get associated loan articles
      const { data: loanArticles, error: articlesError } = await supabase
        .from('loan_articles')
        .select('article_id')
        .eq('loan_id', loanId);

      if (articlesError) throw articlesError;

      const articleIds = loanArticles.map(la => la.article_id);

      // 2. Update loan_articles entries
      if (articleIds.length > 0) {
        const { error: updateLoanArticlesError } = await supabase
          .from('loan_articles')
          .update({
            return_state: 'bon',
            returned_at: returnDate,
            returned_by: user.id,
          })
          .eq('loan_id', loanId)
          .in('article_id', articleIds);
        if (updateLoanArticlesError) throw updateLoanArticlesError;

        // 3. Update articles status
        const { error: updateArticlesError } = await supabase
          .from('articles')
          .update({ status: 'disponible', state: 'bon' })
          .in('id', articleIds);
        if (updateArticlesError) throw updateArticlesError;
      }

      // 4. Update the loan itself
      const { error: loanUpdateError } = await supabase
        .from('loans')
        .update({
          actual_return_date: returnDate,
          returned_by: user.id
        })
        .eq('id', loanId);
      
      if (loanUpdateError) throw loanUpdateError;
    },
    onSuccess: () => {
      toast({ title: 'Prêt retourné avec succès' });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['available-articles'] });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erreur lors du retour du prêt',
        description: error.message,
      });
    },
  });
}


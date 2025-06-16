
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useLoanDelete() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (loanId: string) => {
      // 1. Get associated articles
      const { data: loanArticles, error: loanArticlesError } = await supabase
        .from('loan_articles')
        .select('article_id')
        .eq('loan_id', loanId);

      if (loanArticlesError) throw loanArticlesError;

      const articleIds = loanArticles.map(la => la.article_id);

      // 2. Set articles status back to 'disponible'
      if (articleIds.length > 0) {
        const { error: updateError } = await supabase
          .from('articles')
          .update({ status: 'disponible' })
          .in('id', articleIds);
        if (updateError) throw updateError;
      }

      // 3. Delete loan_articles entries
      const { error: deleteLoanArticlesError } = await supabase
        .from('loan_articles')
        .delete()
        .eq('loan_id', loanId);
      
      if (deleteLoanArticlesError) throw deleteLoanArticlesError;

      // 4. Delete the loan
      const { error: deleteLoanError } = await supabase
        .from('loans')
        .delete()
        .eq('id', loanId);
      
      if (deleteLoanError) throw deleteLoanError;
    },
    onSuccess: () => {
      toast({ title: 'Prêt supprimé avec succès' });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['available-articles'] });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erreur lors de la suppression du prêt',
        description: error.message,
      });
    },
  });
}

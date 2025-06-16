
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface PartialReturnData {
  actual_return_date: string;
  return_notes?: string;
  returned_articles: string[];
  articles_return_states: Array<{
    article_id: string;
    return_state: 'neuf' | 'tres_bon' | 'bon' | 'usage' | 'a_reparer';
    return_notes?: string;
  }>;
}

export function usePartialLoanReturn(loan: any) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: PartialReturnData) => {
      if (!user) throw new Error('Utilisateur non connecté');

      const returnDate = data.actual_return_date ? new Date(data.actual_return_date).toISOString() : new Date().toISOString();

      // 1. Update the selected articles in loan_articles
      for (const articleId of data.returned_articles) {
        const articleState = data.articles_return_states.find(s => s.article_id === articleId);

        const { error: articleLoanError } = await supabase
          .from('loan_articles')
          .update({
            return_state: articleState?.return_state || 'bon',
            return_notes: articleState?.return_notes || null,
            returned_at: returnDate,
            returned_by: user.id,
          })
          .eq('loan_id', loan.id)
          .eq('article_id', articleId);

        if (articleLoanError) throw articleLoanError;

        // 2. Update the article's main status and state
        const { error: articleError } = await supabase
          .from('articles')
          .update({
            status: 'disponible',
            state: articleState?.return_state || 'bon',
          })
          .eq('id', articleId);

        if (articleError) throw articleError;
      }

      // 3. Check if all articles for the loan are now returned
      const { data: allLoanArticles, error: fetchAllError } = await supabase
        .from('loan_articles')
        .select('returned_at')
        .eq('loan_id', loan.id);
      
      if (fetchAllError) throw fetchAllError;

      const allReturned = allLoanArticles.every(la => la.returned_at);

      // 4. Update the loan status if all articles are returned
      if (allReturned) {
        const { error: loanError } = await supabase
          .from('loans')
          .update({
            actual_return_date: returnDate,
            returned_by: user.id,
            notes: data.return_notes ? `${loan.notes || ''}\n\nRetour final: ${data.return_notes}` : loan.notes,
          })
          .eq('id', loan.id);
        if (loanError) throw loanError;
      } else if (data.return_notes) {
        // 5. Or just add notes for the partial return
        const partialNote = `Retour partiel le ${new Date(returnDate).toLocaleDateString('fr-FR')}: ${data.returned_articles.length} article(s) retourné(s).`;
        const { error: loanNoteError } = await supabase
          .from('loans')
          .update({
            notes: `${loan.notes || ''}\n\n${partialNote}\nNotes: ${data.return_notes}`,
          })
          .eq('id', loan.id);
        if (loanNoteError) throw loanNoteError;
      }
    },
    onSuccess: () => {
      toast({ title: 'Retour enregistré avec succès' });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['available-articles'] });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erreur lors du retour',
        description: error.message,
      });
    },
  });
}


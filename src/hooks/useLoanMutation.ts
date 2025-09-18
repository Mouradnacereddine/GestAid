
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LoanFormData } from '@/components/loan/LoanFormSchema';

export function useLoanMutation(onClose: () => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: LoanFormData & { selectedArticles: string[] }) => {
      if (!user) throw new Error('Utilisateur non connecté');

      // Créer le prêt (loan_number sera généré automatiquement par le trigger)
      const loanData = {
        beneficiary_id: data.beneficiary_id,
        loaned_by: user.id,
        expected_return_date: data.expected_return_date,
        notes: data.notes || null,
        contract_signed: data.contract_signed,
        loan_number: '', // Valeur temporaire, sera remplacée par le trigger
      };

      console.log('Création du prêt avec les données:', loanData);

      // attach agency_id to loan from current profile
      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('agency_id')
        .eq('id', user.id)
        .single();
      if (profErr) throw profErr;

      const { data: loan, error: loanError } = await supabase
        .from('loans')
        .insert({ ...loanData, agency_id: profile?.agency_id })
        .select()
        .single();

      if (loanError) {
        console.error('Erreur Supabase insert (prêt):', loanError);
        throw loanError;
      }

      console.log('Prêt créé avec succès:', loan);

      // Ajouter les articles au prêt
      const loanArticles = data.selectedArticles.map(articleId => ({
        loan_id: loan.id,
        article_id: articleId,
      }));

      console.log('Ajout des articles au prêt:', loanArticles);

      const { error: articlesError } = await supabase
        .from('loan_articles')
        .insert(loanArticles);

      if (articlesError) {
        console.error('Erreur Supabase insert (loan_articles):', articlesError);
        throw articlesError;
      }

      // Mettre à jour le statut des articles
      const { error: updateError } = await supabase
        .from('articles')
        .update({ status: 'en_pret' })
        .in('id', data.selectedArticles);

      if (updateError) {
        console.error('Erreur Supabase update (articles):', updateError);
        throw updateError;
      }

      console.log('Prêt créé avec succès, articles mis à jour');
    },
    onSuccess: () => {
      toast({ title: 'Prêt créé avec succès' });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['available-articles'] });
      onClose();
    },
    onError: (error: any) => {
      console.error('Erreur lors de la création du prêt:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur lors de la création',
        description: error?.message || 'Impossible de créer le prêt.',
      });
    },
  });
}

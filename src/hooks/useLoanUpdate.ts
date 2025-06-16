
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoanFormData } from '@/components/loan/LoanFormSchema';

interface UpdateLoanData extends LoanFormData {
    loanId: string;
    initialArticles: string[];
}

export function useLoanUpdate(onClose: () => void) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateLoanData) => {
            const { loanId, ...loanData } = data;
            
            // En mode édition, on ne modifie que la date de retour prévue et les notes
            const { error: loanUpdateError } = await supabase
                .from('loans')
                .update({
                    expected_return_date: loanData.expected_return_date,
                    notes: loanData.notes,
                    contract_signed: loanData.contract_signed,
                })
                .eq('id', loanId);

            if (loanUpdateError) throw loanUpdateError;

            // On ne modifie plus les articles en mode édition
            // Les articles restent inchangés une fois le prêt créé
        },
        onSuccess: () => {
            toast({ title: 'Prêt mis à jour avec succès' });
            queryClient.invalidateQueries({ queryKey: ['loans'] });
            queryClient.invalidateQueries({ queryKey: ['articles'] });
            queryClient.invalidateQueries({ queryKey: ['available-articles'] });
            onClose();
        },
        onError: (error: any) => {
            toast({
                variant: 'destructive',
                title: 'Erreur lors de la mise à jour',
                description: error.message,
            });
        },
    });
}

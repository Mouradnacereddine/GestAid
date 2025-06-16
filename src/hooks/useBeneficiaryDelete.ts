
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useBeneficiaryDelete(onClose: () => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (beneficiaryId: string) => {
      console.log('Suppression du bénéficiaire:', beneficiaryId);
      
      const { error } = await supabase
        .from('beneficiaries')
        .delete()
        .eq('id', beneficiaryId);
      
      if (error) {
        console.error('Erreur lors de la suppression:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({ title: 'Bénéficiaire supprimé avec succès' });
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      onClose();
    },
    onError: (error: any) => {
      console.error('Erreur lors de la suppression:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur lors de la suppression',
        description: error?.message || 'Impossible de supprimer le bénéficiaire.',
      });
    },
  });
}

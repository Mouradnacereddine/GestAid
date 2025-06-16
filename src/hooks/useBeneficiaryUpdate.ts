
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BeneficiaryFormData } from '@/components/beneficiary/BeneficiaryFormSchema';

export function useBeneficiaryUpdate(beneficiaryId: string, onClose: () => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BeneficiaryFormData) => {
      console.log('Tentative de mise à jour avec les données:', data);
      
      const beneficiaryData = {
        first_name: data.first_name,
        last_name: data.last_name,
        birth_date: data.birth_date || null,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        notes: data.notes || null,
        consent_given: data.consent_given,
        consent_date: data.consent_given ? new Date().toISOString() : null,
      };
      
      const { error } = await supabase
        .from('beneficiaries')
        .update(beneficiaryData)
        .eq('id', beneficiaryId);
      
      if (error) {
        console.error('Erreur Supabase update (bénéficiaire):', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({ title: 'Bénéficiaire modifié avec succès' });
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      queryClient.invalidateQueries({ queryKey: ['beneficiary', beneficiaryId] });
      onClose();
    },
    onError: (error: any) => {
      console.error('Erreur complète:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur lors de la modification',
        description: error?.message || 'Impossible de modifier le bénéficiaire.',
      });
    },
  });
}

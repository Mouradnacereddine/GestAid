
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BeneficiaryFormData } from '@/components/beneficiary/BeneficiaryFormSchema';

export function useBeneficiaryMutation(onClose: () => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BeneficiaryFormData) => {
      console.log('Tentative d\'insertion avec les données:', data);
      
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
      
      // Attach agency_id to beneficiaries
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');
      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('agency_id')
        .eq('id', user.id)
        .single();
      if (profErr) throw profErr;

      const { error } = await supabase.from('beneficiaries').insert([{ ...beneficiaryData, agency_id: profile?.agency_id }]);
      if (error) {
        console.error('Erreur Supabase insert (bénéficiaire):', error);
        console.error('Détails de l\'erreur:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
    },
    onSuccess: () => {
      toast({ title: 'Bénéficiaire créé avec succès' });
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      onClose();
    },
    onError: (error: any) => {
      console.error('Erreur complète:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur lors de la création',
        description: error?.message || 'Impossible d\'ajouter le bénéficiaire.',
      });
    },
  });
}

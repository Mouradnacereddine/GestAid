
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DonorFormData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  type: string;
}

export function useDonorMutation(onClose: () => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DonorFormData) => {
      console.log('Tentative d\'insertion avec les données:', data);
      
      const donorData = {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        type: data.type,
      };
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');
      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('agency_id')
        .eq('id', user.id)
        .single();
      if (profErr) throw profErr;

      const { error } = await supabase.from('donors').insert([{ ...donorData, agency_id: profile?.agency_id }]);
      if (error) {
        console.error('Erreur Supabase insert (donateur):', error);
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
      toast({ title: 'Donateur créé avec succès' });
      queryClient.invalidateQueries({ queryKey: ['donors'] });
      onClose();
    },
    onError: (error: any) => {
      console.error('Erreur complète:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur lors de la création',
        description: error?.message || 'Impossible d\'ajouter le donateur.',
      });
    },
  });
}


import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Typage explicite pour le bénéficiaire
export interface Beneficiary {
  id: string;
  first_name: string;
  last_name: string;
  birth_date?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  consent_given: boolean;
  created_at?: string;
}

export function useBeneficiary(beneficiaryId?: string) {
  return useQuery<Beneficiary | null>({
    queryKey: ['beneficiary', beneficiaryId],
    queryFn: async () => {
      if (!beneficiaryId) return null;
      
      console.log('Récupération du bénéficiaire:', beneficiaryId);
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('id', beneficiaryId)
        .maybeSingle();
      
      if (error) {
        console.error('Erreur lors de la récupération du bénéficiaire:', error);
        throw error;
      }
      
      console.log('Bénéficiaire récupéré:', data);
      // On s'assure que tous les champs attendus sont présents pour satisfaire le typage
      if (!data) return null;
      return {
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        birth_date: data.birth_date ?? '',
        phone: data.phone ?? '',
        email: data.email ?? '',
        address: data.address ?? '',
        notes: data.notes ?? '',
        consent_given: typeof data.consent_given === 'boolean' ? data.consent_given : false,
        created_at: data.created_at ?? '',
      };

    },
    enabled: !!beneficiaryId,
  });
}

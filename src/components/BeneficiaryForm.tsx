
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { BeneficiaryFormFields } from '@/components/beneficiary/BeneficiaryFormFields';
import { beneficiarySchema, BeneficiaryFormData } from '@/components/beneficiary/BeneficiaryFormSchema';
import { AccessDenied } from '@/components/beneficiary/AccessDenied';
import { useBeneficiaryMutation } from '@/hooks/useBeneficiaryMutation';
import { useBeneficiaryUpdate } from '@/hooks/useBeneficiaryUpdate';
import { useBeneficiary } from '@/hooks/useBeneficiary';
import { useUserProfile } from '@/hooks/useUserProfile';

interface BeneficiaryFormProps {
  onClose: () => void;
  beneficiaryId?: string;
}

export function BeneficiaryForm({ onClose, beneficiaryId }: BeneficiaryFormProps) {
  const { user } = useAuth();
  const { data: userProfile } = useUserProfile();
  const { data: beneficiaryData, isLoading: isLoadingBeneficiary } = useBeneficiary(beneficiaryId);
  const createMutation = useBeneficiaryMutation(onClose);
  const updateMutation = useBeneficiaryUpdate(beneficiaryId || '', onClose);

  const isEditMode = !!beneficiaryId;

  const form = useForm<BeneficiaryFormData>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      birth_date: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
      consent_given: false,
    },
  });

  // Charger les données du bénéficiaire dans le formulaire lors de l'édition
  useEffect(() => {
    if (beneficiaryData && isEditMode) {
      console.log('Chargement des données dans le formulaire:', beneficiaryData);
      
      // Formater la date si elle existe
      const formattedDate = beneficiaryData.birth_date 
        ? new Date(beneficiaryData.birth_date).toISOString().split('T')[0]
        : '';
      
      form.reset({
        first_name: beneficiaryData.first_name || '',
        last_name: beneficiaryData.last_name || '',
        birth_date: formattedDate,
        phone: beneficiaryData.phone || '',
        email: beneficiaryData.email || '',
        address: beneficiaryData.address || '',
        notes: beneficiaryData.notes || '',
        consent_given: beneficiaryData.consent_given || false,
      });
      
      console.log('Formulaire réinitialisé avec:', {
        first_name: beneficiaryData.first_name || '',
        last_name: beneficiaryData.last_name || '',
        birth_date: formattedDate,
        phone: beneficiaryData.phone || '',
        email: beneficiaryData.email || '',
        address: beneficiaryData.address || '',
        notes: beneficiaryData.notes || '',
        consent_given: beneficiaryData.consent_given || false,
      });
    }
  }, [beneficiaryData, isEditMode, form]);

  const onSubmit = (data: BeneficiaryFormData) => {
    console.log('Utilisateur actuel:', user);
    console.log('Rôle utilisateur:', userProfile?.role);
    console.log('Mode édition:', isEditMode);
    console.log('Données soumises:', data);
    
    if (isEditMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  // Afficher un message si l'utilisateur n'a pas les droits nécessaires
  if (userProfile && !['admin', 'gestionnaire'].includes(userProfile.role)) {
    return <AccessDenied onClose={onClose} userRole={userProfile.role} />;
  }

  // Afficher un loader pendant le chargement des données du bénéficiaire
  if (isEditMode && isLoadingBeneficiary) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        Chargement des données...
      </div>
    );
  }

  const isLoading = isEditMode ? updateMutation.isPending : createMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <BeneficiaryFormFields control={form.control} />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Modifier le bénéficiaire' : 'Créer le bénéficiaire'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

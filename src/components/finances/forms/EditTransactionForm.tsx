
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Form, FormField } from '@/components/ui/form';
import { DonorSearch } from '@/components/article/DonorSearch';
import { TransactionTypeAmount } from './TransactionTypeAmount';
import { TransactionCategory } from './TransactionCategory';
import { TransactionDateDescription } from './TransactionDateDescription';
import { TransactionFormActions } from './TransactionFormActions';
import { transactionSchema, TransactionFormData } from './TransactionFormSchema';

interface Transaction {
  id: string;
  type: 'entree' | 'sortie';
  amount: number;
  category: string;
  description?: string;
  transaction_date: string;
  related_entity_id?: string | null;
  related_entity_type?: string | null;
}

interface EditTransactionFormProps {
  transaction: Transaction;
  onClose: () => void;
}

export function EditTransactionForm({ transaction, onClose }: EditTransactionFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

// Récupérer le donateur lié si la transaction référence une donation
  const { data: donationData } = useQuery({
    queryKey: ['donation', transaction.related_entity_id],
    queryFn: async () => {
      if (!transaction.related_entity_id || transaction.related_entity_type !== 'donation') return null;
      
      const { data, error } = await supabase
        .from('donations')
        .select('id, donor_id')
        .eq('id', transaction.related_entity_id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!transaction.related_entity_id && transaction.related_entity_type === 'donation',
  });
  
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      description: transaction.description || '',
      transaction_date: transaction.transaction_date,
      donor_id: '',
    },
  });

  // Update donor_id when donation data is loaded
  useEffect(() => {
    if (donationData?.donor_id) {
      form.setValue('donor_id', donationData.donor_id);
    }
  }, [donationData, form]);

  const selectedType = form.watch('type');

  // Reset category when type changes to ensure validation
  useEffect(() => {
    if (selectedType && selectedType !== transaction.type) {
      // Only reset category if type has actually changed from original
      form.setValue('category', '');
    }
  }, [selectedType, form, transaction.type]);

  const updateTransactionMutation = useMutation({
    mutationFn: async (data: TransactionFormData) => {
      if (!user) throw new Error('Utilisateur non connecté');

      const updateData: any = {
        type: data.type,
        category: data.category,
        amount: data.amount,
        description: data.description,
        transaction_date: data.transaction_date,
      };

      // Gestion du donateur pour les recettes
      if (data.type === 'entree') {
        const hasExistingDonation = !!transaction.related_entity_id && transaction.related_entity_type === 'donation';
        const donorSelected = data.donor_id && data.donor_id.trim() !== '' && data.donor_id !== 'none';

        if (donorSelected) {
          if (hasExistingDonation) {
            // Mettre à jour la donation existante
            const { error: donationUpdateError } = await supabase
              .from('donations')
              .update({
                donor_id: data.donor_id,
                amount: data.amount,
                donation_date: data.transaction_date,
                donation_type: 'financier',
                description: data.description || `Transaction financière - ${data.category}`,
              })
              .eq('id', transaction.related_entity_id);
            if (donationUpdateError) throw donationUpdateError;

            updateData.related_entity_id = transaction.related_entity_id;
            updateData.related_entity_type = 'donation';
          } else {
            // Créer une nouvelle donation et la lier à la transaction
            const { data: donation, error: donationError } = await supabase
              .from('donations')
              .insert({
                donor_id: data.donor_id,
                amount: data.amount,
                donation_date: data.transaction_date,
                donation_type: 'financier',
                description: data.description || `Transaction financière - ${data.category}`,
              })
              .select()
              .single();
            if (donationError) throw donationError;

            updateData.related_entity_id = donation.id;
            updateData.related_entity_type = 'donation';
          }
        } else if (hasExistingDonation) {
          // Aucun donateur sélectionné: supprimer la donation liée et détacher
          await supabase
            .from('donations')
            .delete()
            .eq('id', transaction.related_entity_id);
          updateData.related_entity_id = null;
          updateData.related_entity_type = null;
        }
      } else {
        // Dépense: s'assurer qu'il n'y a pas d'association de donation
        updateData.related_entity_id = null;
        updateData.related_entity_type = null;
      }

      const { error } = await supabase
        .from('financial_transactions')
        .update(updateData)
        .eq('id', transaction.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-overview'] });
      toast.success('Transaction modifiée avec succès');
      onClose();
    },
    onError: (error) => {
      console.error('Erreur modification transaction:', error);
      toast.error('Erreur lors de la modification de la transaction');
    },
  });

  const onSubmit = (data: TransactionFormData) => {
    updateTransactionMutation.mutate(data);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Modifier la Transaction</DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <TransactionTypeAmount control={form.control} />
          
          <TransactionCategory control={form.control} selectedType={selectedType} />

          {/* Donateur search - maintenant disponible en modification */}
          {selectedType === 'entree' && (
            <FormField
              control={form.control}
              name="donor_id"
              render={({ field }) => (
                <DonorSearch
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
          )}

          <TransactionDateDescription control={form.control} />

          <TransactionFormActions 
            onClose={onClose}
            isLoading={updateTransactionMutation.isPending}
            isEdit={true}
          />
        </form>
      </Form>
    </>
  );
}

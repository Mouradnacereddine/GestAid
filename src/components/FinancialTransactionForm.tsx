
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Form, FormField } from '@/components/ui/form';
import { DonorSearch } from '@/components/article/DonorSearch';
import { TransactionTypeAmount } from '@/components/finances/forms/TransactionTypeAmount';
import { TransactionCategory } from '@/components/finances/forms/TransactionCategory';
import { TransactionDateDescription } from '@/components/finances/forms/TransactionDateDescription';
import { TransactionFormActions } from '@/components/finances/forms/TransactionFormActions';
import { transactionSchema, TransactionFormData } from '@/components/finances/forms/TransactionFormSchema';

interface FinancialTransactionFormProps {
  onClose: () => void;
}

export function FinancialTransactionForm({ onClose }: FinancialTransactionFormProps) {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'entree',
      category: '',
      amount: 0,
      description: '',
      transaction_date: new Date().toISOString().split('T')[0],
      donor_id: '',
    },
  });

  const selectedType = form.watch('type');

  const createTransactionMutation = useMutation({
    mutationFn: async (data: TransactionFormData) => {
      if (!user) throw new Error('Utilisateur non connecté');

      // Préparer les données de transaction
      const transactionData: any = {
        type: data.type,
        category: data.category,
        amount: data.amount,
        description: data.description,
        transaction_date: data.transaction_date,
        created_by: user.id,
        agency_id: profile?.agency_id, // Ajout pour satisfaire la policy RLS
      };

      // Associer un donateur uniquement pour les recettes et si un donateur est choisi
      if (data.type === 'entree' && data.donor_id && data.donor_id.trim() !== '' && data.donor_id !== 'none') {
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
        transactionData.related_entity_id = donation.id;
        transactionData.related_entity_type = 'donation';

        // Also ensure the created donation carries the same agency_id as the transaction
        if (profile?.agency_id) {
          const { error: updDonErr } = await supabase
            .from('donations')
            .update({ agency_id: profile.agency_id })
            .eq('id', donation.id);
          if (updDonErr) throw updDonErr;
        }
      }

      const { error } = await supabase.from('financial_transactions').insert(transactionData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-overview'] });
      toast.success('Transaction créée avec succès');
      onClose();
    },
    onError: (error) => {
      console.error('Erreur création transaction:', error);
      toast.error('Erreur lors de la création de la transaction');
    },
  });

  const onSubmit = (data: TransactionFormData) => {
    createTransactionMutation.mutate(data);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Nouvelle Transaction Financière</DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <TransactionTypeAmount control={form.control} />
          
          <TransactionCategory control={form.control} selectedType={selectedType} />

          {/* Donateur search - surtout utile pour les recettes */}
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
            isLoading={createTransactionMutation.isPending}
            isEdit={false}
          />
        </form>
      </Form>
    </>
  );
}

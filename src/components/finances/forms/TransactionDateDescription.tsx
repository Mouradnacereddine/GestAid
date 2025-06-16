
import React from 'react';
import { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TransactionFormData } from './TransactionFormSchema';

interface TransactionDateDescriptionProps {
  control: Control<TransactionFormData>;
}

export function TransactionDateDescription({ control }: TransactionDateDescriptionProps) {
  return (
    <>
      <FormField
        control={control}
        name="transaction_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Date de transaction *</FormLabel>
            <FormControl>
              <Input
                type="date"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Description de la transaction..."
                rows={3}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

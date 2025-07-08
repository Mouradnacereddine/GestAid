
import React from 'react';
import { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { TransactionFormData } from './TransactionFormSchema';

interface TransactionTypeAmountProps {
  control: Control<TransactionFormData>;
}

export function TransactionTypeAmount({ control }: TransactionTypeAmountProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type de transaction *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="entree">Recette</SelectItem>
                <SelectItem value="sortie">Dépense</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Montant *</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={field.value === 0 ? '' : field.value}
                onChange={e => {
                  const val = e.target.value;
                  // Si l'utilisateur efface tout, on passe une chaîne vide
                  if (val === '') field.onChange('');
                  else field.onChange(parseFloat(val));
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

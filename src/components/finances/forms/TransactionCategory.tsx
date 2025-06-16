
import React from 'react';
import { Control, UseFormWatch } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransactionFormData, expenseCategories, incomeCategories } from './TransactionFormSchema';

interface TransactionCategoryProps {
  control: Control<TransactionFormData>;
  selectedType: 'entree' | 'sortie' | undefined;
}

export function TransactionCategory({ control, selectedType }: TransactionCategoryProps) {
  return (
    <FormField
      control={control}
      name="category"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Catégorie *</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {(selectedType === 'entree' ? incomeCategories : expenseCategories).map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

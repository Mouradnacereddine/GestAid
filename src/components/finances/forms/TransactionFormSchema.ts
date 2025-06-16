
import { z } from 'zod';

export const transactionSchema = z.object({
  type: z.enum(['entree', 'sortie']),
  category: z.string().min(1, 'La catégorie est requise'),
  amount: z.number().positive('Le montant doit être positif'),
  description: z.string().optional(),
  transaction_date: z.string().min(1, 'La date est requise'),
  donor_id: z.string().optional(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

export const expenseCategories = [
  'Loyer et charges',
  'Électricité et eau',
  'Téléphone et internet',
  'Transport',
  'Matériel et fournitures',
  'Réparations et maintenance',
  'Assurances',
  'Frais bancaires',
  'Marketing et communication',
  'Formation',
  'Autre'
];

export const incomeCategories = [
  'Dons particuliers',
  'Dons entreprises',
  'Subventions publiques',
  'Ventes articles',
  'Événements',
  'Prestations de service',
  'Autre'
];

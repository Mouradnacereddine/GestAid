
import * as z from 'zod';

export const beneficiarySchema = z.object({
  first_name: z.string().min(1, 'Le prénom est requis'),
  last_name: z.string().min(1, 'Le nom est requis'),
  birth_date: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
  consent_given: z.boolean().default(false),
});

export type BeneficiaryFormData = z.infer<typeof beneficiarySchema>;


import * as z from 'zod';

export const loanSchema = z.object({
  beneficiary_id: z.string().min(1, 'Le bénéficiaire est requis'),
  expected_return_date: z.string().min(1, 'La date de retour est requise'),
  notes: z.string().optional(),
  contract_signed: z.boolean().default(false),
  articles: z.array(z.string()).min(1, 'Au moins un article est requis'),
});

export type LoanFormData = z.infer<typeof loanSchema>;

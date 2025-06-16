import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, X, CheckCircle } from 'lucide-react';

const returnSchema = z.object({
  actual_return_date: z.string().min(1, 'La date de retour est requise'),
  return_notes: z.string().optional(),
  articles_return_states: z.array(z.object({
    article_id: z.string(),
    return_state: z.enum(['neuf', 'tres_bon', 'bon', 'usage', 'a_reparer']),
    return_notes: z.string().optional(),
  })),
});

type LoanReturnFormData = z.infer<typeof returnSchema>;

interface LoanReturnFormProps {
  onClose: () => void;
  loan: any;
  loanArticles: any[];
}

export function LoanReturnForm({ onClose, loan, loanArticles }: LoanReturnFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const form = useForm<LoanReturnFormData>({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      actual_return_date: new Date().toISOString().split('T')[0],
      return_notes: '',
      articles_return_states: loanArticles.map(la => ({
        article_id: la.article_id,
        return_state: 'bon',
        return_notes: '',
      })),
    },
  });

  const returnMutation = useMutation({
    mutationFn: async (data: LoanReturnFormData) => {
      if (!user) throw new Error('Utilisateur non connecté');
      
      const returnDate = data.actual_return_date ? new Date(data.actual_return_date).toISOString() : new Date().toISOString();

      // Mettre à jour le prêt
      const { error: loanError } = await supabase
        .from('loans')
        .update({
          actual_return_date: returnDate,
          returned_by: user.id,
          notes: data.return_notes ? `${loan.notes || ''}\n\nRetour: ${data.return_notes}` : loan.notes,
        })
        .eq('id', loan.id);

      if (loanError) throw loanError;

      // Mettre à jour les articles du prêt
      for (const articleReturn of data.articles_return_states) {
        const { error: articleLoanError } = await supabase
          .from('loan_articles')
          .update({
            return_state: articleReturn.return_state,
            return_notes: articleReturn.return_notes || null,
            returned_at: returnDate,
            returned_by: user.id,
          })
          .eq('loan_id', loan.id)
          .eq('article_id', articleReturn.article_id);

        if (articleLoanError) throw articleLoanError;

        // Mettre à jour le statut et l'état de l'article
        const { error: articleError } = await supabase
          .from('articles')
          .update({
            status: 'disponible',
            state: articleReturn.return_state,
          })
          .eq('id', articleReturn.article_id);

        if (articleError) throw articleError;
      }
    },
    onSuccess: () => {
      toast({ title: 'Retour enregistré avec succès' });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['available-articles'] });
      onClose();
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Erreur lors du retour',
        description: error.message,
      });
    },
  });

  const onSubmit = (data: LoanReturnFormData) => {
    returnMutation.mutate(data);
  };

  const stateOptions = [
    { value: 'neuf', label: 'Neuf' },
    { value: 'tres_bon', label: 'Très bon' },
    { value: 'bon', label: 'Bon' },
    { value: 'usage', label: 'Usagé' },
    { value: 'a_reparer', label: 'À réparer' },
  ];

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Retour de Prêt - {loan.loan_number}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Informations du prêt</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Bénéficiaire:</span> {loan.beneficiaries?.first_name} {loan.beneficiaries?.last_name}
            </div>
            <div>
              <span className="font-medium">Date de retour prévue:</span> {new Date(loan.expected_return_date).toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="actual_return_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de retour effective *</FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      type="date"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>État des articles au retour</FormLabel>
              {loanArticles.map((loanArticle, index) => (
                <div key={loanArticle.article_id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                      <p className="font-medium">{loanArticle.articles?.name}</p>
                      <p className="text-sm text-gray-500">{loanArticle.articles?.identifier}</p>
                    </div>
                    <Badge variant="outline">
                      État initial: {loanArticle.articles?.state}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`articles_return_states.${index}.return_state`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>État au retour</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner l'état" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {stateOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`articles_return_states.${index}.return_notes`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes sur le retour</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Observations sur l'état..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>

            <FormField
              control={form.control}
              name="return_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes générales sur le retour</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Notes générales sur le retour du prêt..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={returnMutation.isPending}>
                {returnMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmer le retour
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

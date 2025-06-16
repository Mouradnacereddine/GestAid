
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { loanSchema, LoanFormData } from '@/components/loan/LoanFormSchema';
import { useLoanMutation } from '@/hooks/useLoanMutation';
import { useLoanUpdate } from '@/hooks/useLoanUpdate';
import { BeneficiarySearch } from '@/components/loan/BeneficiarySearch';
import { ArticleSearch } from '@/components/loan/ArticleSearch';
import { useToast } from '@/hooks/use-toast';

interface LoanFormProps {
  onClose: () => void;
  loan?: any;
}

export function LoanForm({ onClose, loan }: LoanFormProps) {
  const isEditMode = !!loan;
  const { toast } = useToast();
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [initialArticles, setInitialArticles] = useState<string[]>([]);
  const createMutation = useLoanMutation(onClose);
  const updateMutation = useLoanUpdate(onClose);

  const form = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      beneficiary_id: '',
      expected_return_date: '',
      notes: '',
      contract_signed: false,
      articles: [],
    },
  });

  useEffect(() => {
    if (isEditMode && loan) {
      const loanArticlesIds = loan.loan_articles?.map((la: any) => la.articles.id) || [];
      form.reset({
        beneficiary_id: loan.beneficiary_id,
        expected_return_date: loan.expected_return_date ? new Date(loan.expected_return_date).toISOString().split('T')[0] : '',
        notes: loan.notes || '',
        contract_signed: loan.contract_signed || false,
        articles: loanArticlesIds,
      });
      setSelectedArticles(loanArticlesIds);
      setInitialArticles(loanArticlesIds);
    } else {
      form.reset({
        beneficiary_id: '',
        expected_return_date: '',
        notes: '',
        contract_signed: false,
        articles: [],
      });
      setSelectedArticles([]);
      setInitialArticles([]);
    }
  }, [loan, isEditMode, form]);

  const onSubmit = (data: LoanFormData) => {
    if (isEditMode) {
      // En mode édition, on ne permet que la modification de la date et des notes
      const updateData = {
        loanId: loan.id,
        beneficiary_id: data.beneficiary_id,
        expected_return_date: data.expected_return_date,
        notes: data.notes,
        contract_signed: data.contract_signed,
        articles: initialArticles, // On garde les articles initiaux
        initialArticles,
      };
      updateMutation.mutate(updateData);
    } else {
      createMutation.mutate({ 
        ...data, 
        selectedArticles: selectedArticles
      });
    }
  };

  const toggleArticle = (articleId: string) => {
    if (isEditMode) return; // Pas de modification des articles en mode édition
    
    setSelectedArticles(prev => {
      const newSelection = prev.includes(articleId)
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId];
      
      return newSelection;
    });
  };

  // Sync articles with form only in creation mode
  useEffect(() => {
    if (!isEditMode) {
      form.setValue('articles', selectedArticles);
    }
  }, [selectedArticles, form, isEditMode]);

  return (
    <>
      <DialogHeader className="px-6 pt-6">
        <DialogTitle>{isEditMode ? `Modifier le Prêt n°${loan.loan_number}` : 'Nouveau Prêt'}</DialogTitle>
        <DialogDescription>
          {isEditMode ? "Vous pouvez modifier la date de retour prévue et les notes du prêt." : "Créer un nouveau prêt d'articles pour un bénéficiaire"}
        </DialogDescription>
      </DialogHeader>
      <div className="px-6 pb-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="beneficiary_id"
                render={({ field }) => (
                  <BeneficiarySearch
                    value={field.value || ''}
                    onChange={field.onChange}
                    disabled={isEditMode}
                  />
                )}
              />

              <FormField
                control={form.control}
                name="expected_return_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de retour prévue *</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Notes sur le prêt..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contract_signed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isEditMode}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Contrat signé
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Le contrat de prêt a été signé par le bénéficiaire.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {isEditMode ? (
              <div className="space-y-4">
                <FormLabel>Articles du prêt</FormLabel>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-600 mb-3">
                    Les articles de ce prêt ne peuvent pas être modifiés après création.
                  </p>
                  <div className="space-y-2">
                    {loan.loan_articles?.map((loanArticle: any) => (
                      <div key={loanArticle.articles.id} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div>
                          <p className="font-medium text-sm">{loanArticle.articles.name}</p>
                          <p className="text-xs text-gray-500">{loanArticle.articles.identifier}</p>
                        </div>
                        <div className="text-xs text-gray-500">
                          {loanArticle.returned_at ? 'Retourné' : 'En prêt'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <ArticleSearch
                selectedArticles={selectedArticles}
                onToggleArticle={toggleArticle}
              />
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={
                  (isEditMode && updateMutation.isPending) ||
                  (!isEditMode && createMutation.isPending) ||
                  (!isEditMode && selectedArticles.length === 0)
                }
              >
                {(isEditMode && updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isEditMode && createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'Enregistrer les modifications' : 'Créer le prêt'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}

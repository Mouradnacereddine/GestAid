
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { DonorSearch } from '@/components/article/DonorSearch';

const articleSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  category_id: z.string().min(1, 'La catégorie est requise'),
  state: z.enum(['neuf', 'tres_bon', 'bon', 'usage', 'a_reparer']),
  donor_id: z.string().optional(),
  estimated_value: z.string().optional(),
  storage_location: z.string().optional(),
  maintenance_notes: z.string().optional(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

interface ArticleFormProps {
  onClose: () => void;
  articleId?: string;
  defaultValues?: any;
}

export function ArticleForm({ onClose, articleId, defaultValues }: ArticleFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      name: '',
      category_id: '',
      state: 'bon',
      donor_id: '',
      estimated_value: '',
      storage_location: '',
      maintenance_notes: '',
      ...(defaultValues || {}),
    },
  });

  // Chargement pour l'édition d'un article existant
  useEffect(() => {
    if (articleId) {
      (async () => {
        const { data } = await supabase.from('articles').select('*').eq('id', articleId).single();
        if (data) {
          form.reset({
            name: data.name || '',
            category_id: data.category_id || '',
            state: data.state || 'bon',
            donor_id: data.donor_id || '',
            estimated_value: data.estimated_value?.toString() || '',
            storage_location: data.storage_location || '',
            maintenance_notes: data.maintenance_notes || '',
          });
        }
      })();
    } else {
      form.reset({
        name: '',
        category_id: '',
        state: 'bon',
        donor_id: '',
        estimated_value: '',
        storage_location: '',
        maintenance_notes: '',
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: donors } = useQuery({
    queryKey: ['donors'],
    queryFn: async () => {
      const { data, error } = await supabase.from('donors').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ArticleFormData) => {
      const articleData = {
        name: data.name,
        category_id: data.category_id,
        state: data.state,
        estimated_value: data.estimated_value ? parseFloat(data.estimated_value) : null,
        donor_id: data.donor_id === 'none' || !data.donor_id ? null : data.donor_id,
        storage_location: data.storage_location || null,
        maintenance_notes: data.maintenance_notes || null,
        identifier: null, // Passer null pour déclencher le trigger
      };
      
      const { error } = await supabase.from('articles').insert(articleData as any);
      if (error) {
        console.error('Erreur Supabase insert:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({ title: 'Article créé avec succès' });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erreur lors de la création',
        description: error?.message || "Impossible d'ajouter l'article.",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ArticleFormData) => {
      if (!articleId) return;
      const articleData = {
        name: data.name,
        category_id: data.category_id,
        state: data.state,
        estimated_value: data.estimated_value ? parseFloat(data.estimated_value) : null,
        donor_id: data.donor_id === 'none' || !data.donor_id ? null : data.donor_id,
        storage_location: data.storage_location || null,
        maintenance_notes: data.maintenance_notes || null,
      };
      const { error } = await supabase.from('articles').update(articleData).eq('id', articleId);
      if (error) {
        console.error('Erreur Supabase update:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({ title: 'Article modifié avec succès' });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erreur lors de la modification',
        description: error?.message || "Impossible de modifier l'article.",
      });
    },
  });

  const onSubmit = (data: ArticleFormData) => {
    if (articleId) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const stateOptions = [
    { value: 'neuf', label: 'Neuf' },
    { value: 'tres_bon', label: 'Très bon' },
    { value: 'bon', label: 'Bon' },
    { value: 'usage', label: 'Usagé' },
    { value: 'a_reparer', label: 'À réparer' },
  ];

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l'article *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Fauteuil roulant" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category_id"
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
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
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
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>État *</FormLabel>
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
              name="donor_id"
              render={({ field }) => (
                <DonorSearch
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />

            <FormField
              control={form.control}
              name="estimated_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valeur estimée</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" step="0.01" placeholder="0.00" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="storage_location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lieu de stockage</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Entrepôt A, Étagère 3" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="maintenance_notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes de maintenance</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Notes sur l'état ou la maintenance nécessaire..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) &&
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {articleId ? "Enregistrer" : "Créer l'article"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

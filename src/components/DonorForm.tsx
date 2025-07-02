
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useDonors } from '@/hooks/useDonors';

const donorSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  type: z.enum(['particulier', 'entreprise', 'association']),
});

type DonorFormData = z.infer<typeof donorSchema>;

interface DonorFormProps {
  onClose: () => void;
  donorId?: string;
}

export function DonorForm({ onClose, donorId }: DonorFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: donors } = useDonors();
  
  const isEditing = !!donorId;
  type Donor = {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    created_at: string;
    type: 'particulier' | 'entreprise' | 'association';
  };
  const donor = isEditing ? (donors?.find(d => d.id === donorId) as Donor) : null;

  const form = useForm<DonorFormData>({
    resolver: zodResolver(donorSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      type: 'particulier',
    },
  });

  useEffect(() => {
    if (donor) {
      form.reset({
        name: donor.name,
        email: donor.email || '',
        phone: donor.phone || '',
        address: donor.address || '',
        type: (donor.type as 'particulier' | 'entreprise' | 'association') || 'particulier',
      });
    }
  }, [donor, form]);

  const createMutation = useMutation({
    mutationFn: async (data: DonorFormData) => {
      const donorData = {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        type: data.type,
      };
      
      if (isEditing) {
        const { error } = await supabase
          .from('donors')
          .update(donorData)
          .eq('id', donorId);
        if (error) {
          console.error('Erreur Supabase update (donateur):', error);
          throw error;
        }
      } else {
        // Récupérer l'utilisateur connecté
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("Utilisateur non connecté");
        }
        // Récupérer le profil pour l'agency_id
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('agency_id')
          .eq('id', user.id)
          .single();
        if (profileError) {
          throw new Error("Impossible de récupérer le profil utilisateur");
        }
        // Ajouter agency_id au payload
        const donorDataWithAgency = {
          ...donorData,
          agency_id: userProfile.agency_id,
        };
        const { error } = await supabase.from('donors').insert([donorDataWithAgency]);
        if (error) {
          console.error('Erreur Supabase insert (donateur):', error);
          throw error;
        }
      }
    },
    onSuccess: () => {
      toast({ 
        title: isEditing ? 'Donateur modifié avec succès' : 'Donateur créé avec succès'
      });
      queryClient.invalidateQueries({ queryKey: ['donors'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: isEditing ? 'Erreur lors de la modification' : 'Erreur lors de la création',
        description: error?.message || `Impossible ${isEditing ? 'de modifier' : 'd\'ajouter'} le donateur.`,
      });
    },
  });

  const onSubmit = (data: DonorFormData) => {
    createMutation.mutate(data);
  };

  const typeOptions = [
    { value: 'particulier', label: 'Particulier' },
    { value: 'entreprise', label: 'Entreprise' },
    { value: 'association', label: 'Association' },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Jean Dupont" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {typeOptions.map((option) => (
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="exemple@email.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="01 23 45 67 89" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Adresse complète" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Modifier le donateur' : 'Créer le donateur'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

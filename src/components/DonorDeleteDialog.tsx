
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useDonors } from '@/hooks/useDonors';

interface DonorDeleteDialogProps {
  donorId: string;
  onClose: () => void;
}

export function DonorDeleteDialog({ donorId, onClose }: DonorDeleteDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: donors } = useDonors();
  
  const donor = donors?.find(d => d.id === donorId);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('donors')
        .delete()
        .eq('id', donorId);
      
      if (error) {
        console.error('Erreur lors de la suppression du donateur:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Donateur supprimé',
        description: 'Le donateur a été supprimé avec succès.',
      });
      queryClient.invalidateQueries({ queryKey: ['donors'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erreur lors de la suppression',
        description: error?.message || 'Impossible de supprimer le donateur.',
      });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <AlertDialog open={true} onOpenChange={() => !deleteMutation.isPending && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer le donateur</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer le donateur{' '}
            <strong>{donor?.name}</strong> ?
            <br />
            <br />
            Cette action est irréversible et supprimera définitivement toutes les informations associées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

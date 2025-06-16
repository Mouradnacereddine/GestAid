
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useArticleDeletion() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast({ title: 'Article supprimé avec succès' });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erreur lors de la suppression',
        description: error?.message || 'Impossible de supprimer l\'article.',
      });
    },
  });
}

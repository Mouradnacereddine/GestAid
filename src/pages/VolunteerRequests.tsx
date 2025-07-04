import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface VolunteerRequest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  agency_id: string;
  agency_name: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

const fetchVolunteerRequests = async () => {
  const { data, error } = await supabase
    .from('volunteer_signup_requests')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data as VolunteerRequest[];
};

export default function VolunteerRequests() {
  const queryClient = useQueryClient();

  const { data: requests, isLoading, isError, error } = useQuery({
    queryKey: ['volunteerRequests'],
    queryFn: fetchVolunteerRequests,
  });

  const approveMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { data, error } = await supabase.functions.invoke('approve-volunteer-request', {
        body: { request_id: requestId },
      });

      if (error) {
        throw error;
      }
      if (data && data.error) {
        throw new Error(data.error);
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Demande approuvée', {
        description: "Le bénévole a été invité et la demande a été marquée comme approuvée.",
      });
      queryClient.invalidateQueries({ queryKey: ['volunteerRequests'] });
    },
    onError: async (error: any) => {
      console.error('Detailed error from Supabase:', error);
      let errorMessage = "Une erreur inattendue est survenue.";

      if (error.context && typeof error.context.json === 'function') {
        try {
          const functionError = await error.context.json();
          errorMessage = functionError.error || "La fonction Edge a renvoyé une erreur sans message.";
        } catch (e) {
          errorMessage = "Impossible de lire la réponse d'erreur de la fonction Edge.";
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error("Erreur lors de l'approbation", {
        description: errorMessage,
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase.rpc('reject_volunteer_request', { 
        request_id: requestId,
      });

      if (error) {
        console.error('Detailed error from Supabase:', error);
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success('La demande a été rejetée.');
      queryClient.invalidateQueries({ queryKey: ['volunteerRequests'] });
    },
    onError: (error: Error) => {
      console.error("Detailed error from Supabase:", error);
      toast.error('Erreur lors du rejet', {
        description: error.message,
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500">
        Une erreur est survenue : {error?.message || 'Erreur inconnue'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Demandes de bénévoles en attente</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Prénom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Agence</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests?.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.last_name}</TableCell>
                  <TableCell>{request.first_name}</TableCell>
                  <TableCell>{request.email}</TableCell>
                  <TableCell>{request.agency_name}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => approveMutation.mutate(request.id)}
                      disabled={approveMutation.isPending}
                    >
                      Approuver
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => rejectMutation.mutate(request.id)}
                      disabled={rejectMutation.isPending}
                    >
                      Rejeter
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

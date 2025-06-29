import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface AdminRequest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  agency_name: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const fetchAdminRequests = async () => {
  const { data, error } = await supabase
    .from('admin_signup_requests')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data as AdminRequest[];
};

export default function AdminRequests() {


  const queryClient = useQueryClient();

  const { data: requests, isLoading, isError, error } = useQuery({
    queryKey: ['adminRequests'],
    queryFn: fetchAdminRequests,
  });

  const approveMutation = useMutation({
    mutationFn: async (requestId: string) => {
      // Invoke the new Edge Function
      const { data, error } = await supabase.functions.invoke('approve-admin-request', {
        body: { request_id: requestId },
      });

      // The Edge Function returns a detailed error message in the response body
      if (error) {
        console.error('Function invocation error:', error);
        // Try to parse the error from the function's response if available
        const functionError = data?.error || error.message;
        throw new Error(functionError);
      }
    },
    onSuccess: () => {
      toast.success('La demande a été approuvée.');
      queryClient.invalidateQueries({ queryKey: ['adminRequests'] });
    },
    onError: (error) => {
      console.error("Detailed error from Supabase:", error);
      toast.error(`L'action a échoué : ${error.message}`);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (requestId: string) => {
      // The reject function does not have permission issues, so we can still use RPC.
      const { error } = await supabase.rpc('reject_admin_request', { 
        request_id: requestId,
      });

      if (error) {
        console.error('Detailed error from Supabase:', error);
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success('La demande a été rejetée.');
      queryClient.invalidateQueries({ queryKey: ['adminRequests'] });
    },
    onError: (error) => {
      console.error("Detailed error from Supabase:", error);
      toast.error(`L'action a échoué : ${error.message}`);
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /> Chargement des demandes...</div>;
  }

  if (isError) {
    return <div className="p-8 text-red-600">Erreur: {error.message}</div>;
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Demandes d'inscription Administrateur</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Agence</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">Aucune demande en attente</TableCell>
                </TableRow>
              ) : (
                requests?.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.first_name} {request.last_name}</TableCell>
                    <TableCell>{request.email}</TableCell>
                    <TableCell>{request.agency_name}</TableCell>
                    <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button 
                        size="sm" 
                        onClick={() => approveMutation.mutate(request.id)}
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                      >
                        {approveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Approuver
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => rejectMutation.mutate(request.id)}
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                      >
                        Rejeter
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface AdminRequest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  agency_name: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function AdminRequests() {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('admin_signup_requests')
      .select('*')
      .eq('status', 'pending');

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les demandes.',
      });
    } else {
      setRequests(data as AdminRequest[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (requestId: string, action: 'approve' | 'reject') => {
    setActionLoading(prev => ({ ...prev, [requestId]: true }));

    const rpcName = action === 'approve' ? 'approve_admin_request' : 'reject_admin_request';
    const { error } = await supabase.rpc(rpcName, { request_id: requestId });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message,
      });
    } else {
      toast({
        title: 'Succès',
        description: `La demande a été ${action === 'approve' ? 'approuvée' : 'rejetée'}.`,
      });
      // Refresh list
      setRequests(prev => prev.filter(req => req.id !== requestId));
    }

    setActionLoading(prev => ({ ...prev, [requestId]: false }));
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Demandes d'accès Administrateur</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Agence</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length > 0 ? (
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>{req.first_name} {req.last_name}</TableCell>
                    <TableCell>{req.email}</TableCell>
                    <TableCell>{req.agency_name}</TableCell>
                    <TableCell>{new Date(req.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAction(req.id, 'approve')}
                        disabled={actionLoading[req.id]}
                      >
                        {actionLoading[req.id] ? '...' : 'Approuver'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleAction(req.id, 'reject')}
                        disabled={actionLoading[req.id]}
                      >
                        Rejeter
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Aucune demande en attente.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

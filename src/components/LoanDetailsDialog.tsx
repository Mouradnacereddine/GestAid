import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface LoanDetailsDialogProps {
  loan: any;
  isOpen: boolean;
  onClose: () => void;
}

export function LoanDetailsDialog({ loan, isOpen, onClose }: LoanDetailsDialogProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatusBadge = (loan: any) => {
    if (loan.actual_return_date) {
      return <Badge className="bg-green-500 text-white">Retourné</Badge>;
    }
    
    const expectedDate = new Date(loan.expected_return_date);
    const today = new Date();
    
    if (expectedDate < today) {
      return <Badge className="bg-red-500 text-white">En retard</Badge>;
    }
    
    return <Badge className="bg-blue-500 text-white">En cours</Badge>;
  };

  if (!loan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Détails du prêt {loan.loan_number || 'Sans numéro'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informations générales */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Informations générales</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Numéro de prêt</p>
                <p className="font-medium">{loan.loan_number || 'Non généré'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Statut</p>
                <div className="mt-1">{getStatusBadge(loan)}</div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date de prêt</p>
                <p className="font-medium">{formatDate(loan.loan_date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Retour prévu</p>
                <p className="font-medium">{formatDate(loan.expected_return_date)}</p>
              </div>
              {loan.actual_return_date && (
                <div>
                  <p className="text-sm text-gray-600">Retour effectif</p>
                  <p className="font-medium">{formatDate(loan.actual_return_date)}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Contrat signé</p>
                <Badge variant={loan.contract_signed ? "outline" : "destructive"} 
                       className={loan.contract_signed ? "text-green-600 border-green-600" : ""}>
                  {loan.contract_signed ? 'Oui' : 'Non'}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Bénéficiaire */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Bénéficiaire</h3>
            <div>
              <p className="font-medium">
                {loan.beneficiaries?.last_name} {loan.beneficiaries?.first_name}
              </p>
              {loan.beneficiaries?.email && (
                <p className="text-sm text-gray-600">{loan.beneficiaries.email}</p>
              )}
            </div>
          </Card>

          {/* Articles */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Articles prêtés</h3>
            <div className="space-y-2">
              {loan.loan_articles?.map((loanArticle: any) => (
                <div key={loanArticle.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{loanArticle.articles?.name}</p>
                    <p className="text-sm text-gray-600">{loanArticle.articles?.identifier}</p>
                  </div>
                  {loanArticle.returned_at ? (
                    <Badge className="bg-green-100 text-green-800">
                      Retourné le {formatDate(loanArticle.returned_at)}
                    </Badge>
                  ) : (
                    <Badge variant="outline">En prêt</Badge>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Notes */}
          {loan.notes && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Notes</h3>
              <p className="text-sm">{loan.notes}</p>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

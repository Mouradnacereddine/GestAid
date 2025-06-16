
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LoanStatusBadge } from './LoanStatusBadge';
import { LoanTableActions } from './LoanTableActions';

interface Loan {
  id: string;
  loan_number: string;
  loan_date: string;
  expected_return_date: string;
  actual_return_date?: string;
  contract_signed: boolean;
  beneficiaries?: {
    first_name: string;
    last_name: string;
  };
  loan_articles?: Array<{
    returned_at?: string;
    articles: {
      id: string;
      name: string;
      identifier: string;
      state: string;
    };
  }>;
}

interface LoanTableRowProps {
  loan: Loan;
  onViewDetails: (loan: Loan) => void;
  onQuickReturn: (loan: Loan) => void;
  onPartialReturn: (loan: Loan) => void;
  onEdit: (loan: Loan) => void;
  onDelete: (loan: Loan) => void;
  isDeleting: boolean;
  isReturning: boolean;
}

export function LoanTableRow({
  loan,
  onViewDetails,
  onQuickReturn,
  onPartialReturn,
  onEdit,
  onDelete,
  isDeleting,
  isReturning
}: LoanTableRowProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const isCompletelyReturned = (loan: Loan) => {
    // Vérifier si le prêt a une date de retour effective
    if (loan.actual_return_date) return true;
    
    // Ou si tous les articles individuels sont retournés
    if (loan.loan_articles && loan.loan_articles.length > 0) {
      return loan.loan_articles.every(article => article.returned_at);
    }
    
    return false;
  };

  const isOverdue = (loan: Loan) => {
    if (isCompletelyReturned(loan)) return false;
    return new Date(loan.expected_return_date) < new Date();
  };

  return (
    <TableRow key={loan.id}>
      <TableCell className="font-mono text-sm">
        {loan.loan_number}
      </TableCell>
      <TableCell>
        {loan.beneficiaries ? 
          `${loan.beneficiaries.first_name} ${loan.beneficiaries.last_name}` : 
          'N/A'
        }
      </TableCell>
      <TableCell>{formatDate(loan.loan_date)}</TableCell>
      <TableCell className={isOverdue(loan) ? 'text-red-600 font-medium' : ''}>
        {formatDate(loan.expected_return_date)}
      </TableCell>
      <TableCell>
        {loan.actual_return_date ? formatDate(loan.actual_return_date) : '-'}
      </TableCell>
      <TableCell>
        <Badge variant="outline">
          {loan.loan_articles?.length || 0} article{(loan.loan_articles?.length || 0) > 1 ? 's' : ''}
        </Badge>
      </TableCell>
      <TableCell>
        <LoanStatusBadge loan={loan} />
      </TableCell>
      <TableCell>
        {loan.contract_signed ? (
          <Badge className="bg-green-100 text-green-800">Signé</Badge>
        ) : (
          <Badge className="bg-orange-100 text-orange-800">Non signé</Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        <LoanTableActions
          loan={loan}
          onViewDetails={onViewDetails}
          onQuickReturn={onQuickReturn}
          onPartialReturn={onPartialReturn}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={isDeleting}
          isReturning={isReturning}
        />
      </TableCell>
    </TableRow>
  );
}

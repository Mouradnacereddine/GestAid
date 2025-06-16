
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface Loan {
  actual_return_date?: string;
  expected_return_date: string;
  loan_articles?: Array<{
    returned_at?: string;
  }>;
}

interface LoanStatusBadgeProps {
  loan: Loan;
}

export function LoanStatusBadge({ loan }: LoanStatusBadgeProps) {
  const isCompletelyReturned = (loan: Loan) => {
    // Vérifier si le prêt a une date de retour effective
    if (loan.actual_return_date) return true;
    
    // Ou si tous les articles individuels sont retournés
    if (loan.loan_articles && loan.loan_articles.length > 0) {
      return loan.loan_articles.every(article => article.returned_at);
    }
    
    return false;
  };

  const isPartiallyReturned = (loan: Loan) => {
    if (!loan.loan_articles || loan.loan_articles.length === 0) return false;
    
    const returnedCount = loan.loan_articles.filter(article => article.returned_at).length;
    return returnedCount > 0 && returnedCount < loan.loan_articles.length;
  };

  const isOverdue = (loan: Loan) => {
    if (isCompletelyReturned(loan)) return false;
    return new Date(loan.expected_return_date) < new Date();
  };

  if (isCompletelyReturned(loan)) {
    return <Badge className="bg-green-500 text-white">Retourné</Badge>;
  }
  
  if (isPartiallyReturned(loan)) {
    return <Badge className="bg-yellow-500 text-white">Retour partiel</Badge>;
  }
  
  if (isOverdue(loan)) {
    return <Badge className="bg-red-500 text-white">En retard</Badge>;
  }
  
  return <Badge className="bg-blue-500 text-white">En cours</Badge>;
}

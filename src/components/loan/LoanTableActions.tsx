
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, CheckCircle, Eye, RotateCcw } from 'lucide-react';

interface Loan {
  id: string;
  actual_return_date?: string;
}

interface LoanTableActionsProps {
  loan: Loan;
  onViewDetails: (loan: Loan) => void;
  onQuickReturn: (loan: Loan) => void;
  onPartialReturn: (loan: Loan) => void;
  onEdit: (loan: Loan) => void;
  onDelete: (loan: Loan) => void;
  isDeleting: boolean;
  isReturning: boolean;
}

export function LoanTableActions({
  loan,
  onViewDetails,
  onQuickReturn,
  onPartialReturn,
  onEdit,
  onDelete,
  isDeleting,
  isReturning
}: LoanTableActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewDetails(loan)}
        title="Voir détails"
      >
        <Eye className="h-4 w-4" />
      </Button>
      
      {!loan.actual_return_date && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onQuickReturn(loan)}
            title="Retour rapide (tous les articles)"
            disabled={isReturning}
          >
            <CheckCircle className="h-4 w-4 text-green-600" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPartialReturn(loan)}
            title="Retour partiel"
          >
            <RotateCcw className="h-4 w-4 text-blue-600" />
          </Button>
        </>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onEdit(loan)}
        title="Modifier"
      >
        <Edit className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(loan)}
        title="Supprimer"
        disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}

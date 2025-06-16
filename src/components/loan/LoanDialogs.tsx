
import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { LoanReturnForm } from '@/components/LoanReturnForm';
import { PartialLoanReturnForm } from '@/components/loan/PartialLoanReturnForm';
import { LoanDetailsDialog } from '@/components/LoanDetailsDialog';

interface Loan {
  id: string;
  loan_number: string;
  loan_date: string;
  expected_return_date: string;
  actual_return_date?: string;
  contract_signed: boolean;
  notes?: string;
  beneficiaries?: {
    first_name: string;
    last_name: string;
  };
  loan_articles?: Array<{
    articles: {
      id: string;
      name: string;
      identifier: string;
      state: string;
    };
  }>;
}

interface LoanDialogsProps {
  selectedLoan: Loan | null;
  showReturnDialog: boolean;
  showPartialReturnDialog: boolean;
  showDetailsDialog: boolean;
  onCloseReturnDialog: () => void;
  onClosePartialReturnDialog: () => void;
  onCloseDetailsDialog: () => void;
}

export function LoanDialogs({
  selectedLoan,
  showReturnDialog,
  showPartialReturnDialog,
  showDetailsDialog,
  onCloseReturnDialog,
  onClosePartialReturnDialog,
  onCloseDetailsDialog
}: LoanDialogsProps) {
  return (
    <>
      <Dialog open={showReturnDialog} onOpenChange={onCloseReturnDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          {selectedLoan && (
            <LoanReturnForm
              loan={selectedLoan}
              loanArticles={selectedLoan.loan_articles || []}
              onClose={onCloseReturnDialog}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showPartialReturnDialog} onOpenChange={onClosePartialReturnDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogTitle>Retour Partiel</DialogTitle>
          <DialogDescription>
            Sélectionnez les articles à retourner et leur état.
          </DialogDescription>
          {selectedLoan && (
            <PartialLoanReturnForm
              loan={selectedLoan}
              loanArticles={selectedLoan.loan_articles || []}
              onClose={onClosePartialReturnDialog}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showDetailsDialog} onOpenChange={onCloseDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogTitle>Détails du prêt</DialogTitle>
          <DialogDescription>
            Informations complètes sur le prêt et les articles associés.
          </DialogDescription>
          {selectedLoan && (
            <LoanDetailsDialog 
              loan={selectedLoan}
              isOpen={showDetailsDialog}
              onClose={onCloseDetailsDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

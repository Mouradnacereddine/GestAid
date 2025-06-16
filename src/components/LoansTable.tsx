
import React, { useState } from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLoanReturn } from '@/hooks/useLoanReturn';
import { LoanTableRow } from '@/components/loan/LoanTableRow';
import { LoanDialogs } from '@/components/loan/LoanDialogs';

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

interface LoansTableProps {
  loans: Loan[];
  onEdit: (loan: Loan) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function LoansTable({ loans, onEdit, onDelete, isDeleting }: LoansTableProps) {
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [showPartialReturnDialog, setShowPartialReturnDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const returnMutation = useLoanReturn();

  const handleDelete = (loan: Loan) => {
    const confirmDelete = window.confirm("Supprimer ce prêt ? Cette action est irréversible.");
    if (confirmDelete) {
      onDelete(loan.id);
    }
  };

  const handleQuickReturn = (loan: Loan) => {
    const confirmReturn = window.confirm("Marquer tous les articles comme retournés ? Cette action ne peut pas être annulée.");
    if (confirmReturn) {
      returnMutation.mutate(loan.id);
    }
  };

  const handlePartialReturn = (loan: Loan) => {
    setSelectedLoan(loan);
    setShowPartialReturnDialog(true);
  };

  const handleDetailedReturn = (loan: Loan) => {
    setSelectedLoan(loan);
    setShowReturnDialog(true);
  };

  const handleViewDetails = (loan: Loan) => {
    setSelectedLoan(loan);
    setShowDetailsDialog(true);
  };

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Prêt</TableHead>
              <TableHead>Bénéficiaire</TableHead>
              <TableHead>Date de prêt</TableHead>
              <TableHead>Date retour prévue</TableHead>
              <TableHead>Date retour effective</TableHead>
              <TableHead>Articles</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Contrat</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans.map((loan) => (
              <LoanTableRow
                key={loan.id}
                loan={loan}
                onViewDetails={handleViewDetails}
                onQuickReturn={handleQuickReturn}
                onPartialReturn={handlePartialReturn}
                onEdit={onEdit}
                onDelete={handleDelete}
                isDeleting={isDeleting}
                isReturning={returnMutation.isPending}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <LoanDialogs
        selectedLoan={selectedLoan}
        showReturnDialog={showReturnDialog}
        showPartialReturnDialog={showPartialReturnDialog}
        showDetailsDialog={showDetailsDialog}
        onCloseReturnDialog={() => {
          setShowReturnDialog(false);
          setSelectedLoan(null);
        }}
        onClosePartialReturnDialog={() => {
          setShowPartialReturnDialog(false);
          setSelectedLoan(null);
        }}
        onCloseDetailsDialog={() => {
          setShowDetailsDialog(false);
          setSelectedLoan(null);
        }}
      />
    </>
  );
}

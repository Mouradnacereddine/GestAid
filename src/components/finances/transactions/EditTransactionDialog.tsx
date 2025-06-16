
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { EditTransactionForm } from '../forms/EditTransactionForm';

interface Transaction {
  id: string;
  type: 'entree' | 'sortie';
  amount: number;
  category: string;
  description?: string;
  transaction_date: string;
  donation_id?: string;
  donations?: {
    donors: {
      name: string;
    };
  };
}

interface EditTransactionDialogProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditTransactionDialog({ transaction, isOpen, onClose }: EditTransactionDialogProps) {
  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <EditTransactionForm transaction={transaction} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}

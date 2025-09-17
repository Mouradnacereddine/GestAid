
import React from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrency } from '@/utils/currency';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Edit, Trash2 } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'entree' | 'sortie';
  amount: number;
  category: string;
  description?: string;
  transaction_date: string;
  related_entity_id?: string | null;
  related_entity_type?: string | null;
  donations?: {
    donors: {
      name: string;
    };
  };
}

interface TransactionRowProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
}

export function TransactionRow({ transaction, onDelete, onEdit }: TransactionRowProps) {
  const { currency } = useCurrency();
  const reference = `REF-${transaction.id.slice(0, 8).toUpperCase()}`;
  
  const handleDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
      onDelete(transaction.id);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(transaction.id);
    }
  };
  
  return (
    <TableRow key={transaction.id}>
      <TableCell className="font-mono text-sm">{reference}</TableCell>
      <TableCell>
        {new Date(transaction.transaction_date).toLocaleDateString('fr-FR')}
      </TableCell>
      <TableCell>
        <Badge
          variant={transaction.type === 'entree' ? 'default' : 'destructive'}
          className="flex items-center gap-1 w-fit"
        >
          {transaction.type === 'entree' ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {transaction.type === 'entree' ? 'Recette' : 'Dépense'}
        </Badge>
      </TableCell>
      <TableCell>{transaction.category}</TableCell>
      {/* Colonne Donateur - seulement visible pour les recettes */}
      {transaction.type === 'entree' ? (
        <TableCell>
          {transaction.donations?.donors?.name || '-'}
        </TableCell>
      ) : (
        <TableCell>-</TableCell>
      )}
      <TableCell className="max-w-xs truncate">
        {transaction.description || '-'}
      </TableCell>
      <TableCell className="text-right font-medium">
        <span className={transaction.type === 'entree' ? 'text-green-600' : 'text-red-600'}>
          {transaction.type === 'entree' ? '+' : '-'}
          {formatCurrency(Number(transaction.amount), currency)}
        </span>
      </TableCell>
      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="h-8 w-8 p-0 hover:bg-blue-50"
          >
            <Edit className="h-4 w-4 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-8 w-8 p-0 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}


import React from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrency } from '@/utils/currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Transaction {
  id: string;
  type: 'entree' | 'sortie';
  amount: number;
  category?: string;
  description?: string;
  transaction_date: string;
  donations?: { donors?: { name?: string } };
}

interface TransactionDetailsTableProps {
  transactions: Transaction[];
}

export function TransactionDetailsTable({ transactions }: TransactionDetailsTableProps) {
  const { currency } = useCurrency();
  console.log('=== TransactionDetailsTable RENDER START ===');
  console.log('TransactionDetailsTable - Transactions received:', transactions);
  console.log('TransactionDetailsTable - Number of transactions:', transactions?.length || 0);

  if (!transactions || transactions.length === 0) {
    console.log('TransactionDetailsTable - No transactions to display');
    return (
      <Card>
        <CardHeader>
          <CardTitle>Détail des Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            Aucune transaction disponible pour la période sélectionnée
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log('TransactionDetailsTable - About to render table with transactions');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Détail des Transactions ({transactions.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Donateur</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead className="text-right">Débit</TableHead>
                <TableHead className="text-right">Crédit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction, index) => {
                console.log(`TransactionDetailsTable - Rendering transaction ${index + 1}:`, transaction);
                
                try {
                  const formattedDate = format(new Date(transaction.transaction_date), 'dd/MM/yyyy', { locale: fr });
                  const typeLabel = transaction.type === 'entree' ? 'Recette' : 'Dépense';
                  const amount = Number(transaction.amount) || 0;
                  const debit = transaction.type === 'sortie' ? amount : 0;
                  const credit = transaction.type === 'entree' ? amount : 0;
                  const reference = `REF-${transaction.id.slice(0, 8).toUpperCase()}`;
                  const donorName = transaction.type === 'entree' ? (transaction as any)?.donations?.donors?.name || '' : '';
                  
                  console.log(`TransactionDetailsTable - Row ${index + 1} data:`, {
                    reference,
                    date: formattedDate,
                    type: typeLabel,
                    category: transaction.category,
                    donor: donorName,
                    description: transaction.description,
                    amount,
                    debit,
                    credit
                  });
                  
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-sm">{reference}</TableCell>
                      <TableCell className="font-medium">{formattedDate}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.type === 'entree' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {typeLabel}
                        </span>
                      </TableCell>
                      <TableCell>{transaction.category || 'Non catégorisé'}</TableCell>
                      <TableCell>{donorName || '-'}</TableCell>
                      <TableCell className="max-w-xs truncate">{transaction.description || '-'}</TableCell>
                      <TableCell className={`text-right font-semibold ${
                        transaction.type === 'entree' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'entree' ? '+' : '-'}{formatCurrency(amount, currency)}
                      </TableCell>
                      <TableCell className="text-right text-red-600 font-medium">
                        {debit > 0 ? formatCurrency(debit, currency) : '-'}
                      </TableCell>
                      <TableCell className="text-right text-green-600 font-medium">
                        {credit > 0 ? formatCurrency(credit, currency) : '-'}
                      </TableCell>
                    </TableRow>
                  );
                } catch (error) {
                  console.error(`Error rendering transaction ${index + 1}:`, error, transaction);
                  return (
                    <TableRow key={transaction.id || `error-${index}`}>
                      <TableCell colSpan={9} className="text-center text-red-500">
                        Erreur d'affichage de la transaction
                      </TableCell>
                    </TableRow>
                  );
                }
              })}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 text-sm text-gray-500">
          Total : {transactions.length} transaction{transactions.length > 1 ? 's' : ''}
        </div>
      </CardContent>
    </Card>
  );
}

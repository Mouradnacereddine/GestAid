
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Plus, TrendingUp } from 'lucide-react';
import { FinancialTransactionForm } from '@/components/FinancialTransactionForm';

interface TransactionTableHeaderProps {
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
}

export function TransactionTableHeader({ isFormOpen, setIsFormOpen }: TransactionTableHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Transactions Récentes
        </CardTitle>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-humanitarian-blue hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <FinancialTransactionForm onClose={() => setIsFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </CardHeader>
  );
}

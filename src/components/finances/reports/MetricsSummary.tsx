
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Calculator, FileText } from 'lucide-react';

interface MetricsSummaryProps {
  totalRevenue: number;
  totalExpenses: number;
  netResult: number;
  transactionCount: number;
}

export function MetricsSummary({
  totalRevenue,
  totalExpenses,
  netResult,
  transactionCount
}: MetricsSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Recettes</p>
              <p className="text-2xl font-bold text-green-600">
                {totalRevenue.toLocaleString('fr-FR')} €
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Dépenses</p>
              <p className="text-2xl font-bold text-red-600">
                {totalExpenses.toLocaleString('fr-FR')} €
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-red-600 rotate-180" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Résultat Net</p>
              <p className={`text-2xl font-bold ${netResult >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netResult.toLocaleString('fr-FR')} €
              </p>
            </div>
            <Calculator className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nb. Transactions</p>
              <p className="text-2xl font-bold text-blue-600">
                {transactionCount}
              </p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

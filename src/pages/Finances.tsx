import React from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Landmark, FileBarChart, TrendingUp, AlertTriangle, Receipt } from 'lucide-react';
import { FinancialOverview } from '@/components/finances/FinancialOverview';
import { TransactionsTable } from '@/components/finances/TransactionsTable';
import { FinancialAlerts } from '@/components/finances/FinancialAlerts';
import { FinancialReports } from '@/components/finances/FinancialReports';

export default function Finances() {
  const { currency } = useCurrency();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Landmark className="h-8 w-8 text-humanitarian-blue" />
          Gestion Financière ({currency})
        </h1>
        <p className="text-gray-600 mt-2">
          Suivi complet des recettes, dépenses et analyse financière de l'association
        </p>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <FileBarChart className="h-4 w-4" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alertes
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Rapports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <FinancialOverview />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <TransactionsTable />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <FinancialAlerts />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <FinancialReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}

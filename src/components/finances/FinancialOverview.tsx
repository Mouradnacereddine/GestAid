
import React, { useMemo } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrency } from '@/utils/currency';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StatsCard } from '@/components/StatsCard';
import { TrendingUp, TrendingDown, Wallet, CreditCard, Receipt } from 'lucide-react';
import { useFinancialCalculations } from '@/utils/financialCalculations';
import { MetricsSummary } from '@/components/finances/reports/MetricsSummary';
import { MonthlyEvolutionChart } from '@/components/finances/reports/MonthlyEvolutionChart';
import { CategoryBarChart } from '@/components/finances/reports/CategoryBarChart';
import { ExpenseDistributionChart } from '@/components/finances/reports/ExpenseDistributionChart';

export function FinancialOverview() {
  const { currency } = useCurrency();
  const { data: transactions } = useQuery({
    queryKey: ['financial-overview'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .order('transaction_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Utiliser le hook pour les calculs financiers
  const { totalRevenue, totalExpenses, categoryData, monthlyEvolution, expenseDistribution } = useFinancialCalculations(transactions);

  // Mémoriser tous les calculs pour éviter les re-renders
  const financialStats = useMemo(() => {
    if (!transactions) return null;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthTransactions = transactions.filter(t => {
      const date = new Date(t.transaction_date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const previousMonthTransactions = transactions.filter(t => {
      const date = new Date(t.transaction_date);
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return date.getMonth() === prevMonth && date.getFullYear() === prevYear;
    });

    const totalRevenueCurrent = currentMonthTransactions
      .filter(t => t.type === 'entree')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpensesCurrent = currentMonthTransactions
      .filter(t => t.type === 'sortie')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const prevTotalRevenue = previousMonthTransactions
      .filter(t => t.type === 'entree')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const prevTotalExpenses = previousMonthTransactions
      .filter(t => t.type === 'sortie')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = totalRevenueCurrent - totalExpensesCurrent;
    const prevBalance = prevTotalRevenue - prevTotalExpenses;

    // Calcul des tendances - mémorisées
    const revenueTrend = prevTotalRevenue > 0 
      ? ((totalRevenueCurrent - prevTotalRevenue) / prevTotalRevenue) * 100 
      : totalRevenueCurrent > 0 ? 100 : 0;

    const expensesTrend = prevTotalExpenses > 0 
      ? ((totalExpensesCurrent - prevTotalExpenses) / prevTotalExpenses) * 100 
      : totalExpensesCurrent > 0 ? 100 : 0;

    const balanceTrend = prevBalance !== 0 
      ? ((balance - prevBalance) / Math.abs(prevBalance)) * 100 
      : balance > 0 ? 100 : balance < 0 ? -100 : 0;

    return {
      totalRevenue: totalRevenueCurrent,
      totalExpenses: totalExpensesCurrent,
      balance,
      currentMonthTransactions,
      revenueTrend: {
        value: Math.abs(revenueTrend),
        isPositive: revenueTrend >= 0
      },
      expensesTrend: {
        value: Math.abs(expensesTrend),
        isPositive: expensesTrend <= 0
      },
      balanceTrend: {
        value: Math.abs(balanceTrend),
        isPositive: balanceTrend >= 0
      }
    };
  }, [transactions]);

  if (!financialStats) {
    return <div className="text-center p-4">Chargement des données financières...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Cartes de statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Recettes du mois"
          value={formatCurrency(financialStats.totalRevenue, currency)}
          description="vs mois précédent"
          icon={TrendingUp}
          trend={financialStats.revenueTrend}
        />
        
        <StatsCard
          title="Dépenses du mois"
          value={formatCurrency(financialStats.totalExpenses, currency)}
          description="vs mois précédent"
          icon={TrendingDown}
          trend={financialStats.expensesTrend}
        />
        
        <StatsCard
          title="Solde mensuel"
          value={formatCurrency(financialStats.balance, currency)}
          description="vs mois précédent"
          icon={financialStats.balance >= 0 ? Wallet : CreditCard}
          trend={financialStats.balanceTrend}
        />
        
        <StatsCard
          title="Nb. transactions"
          value={financialStats.currentMonthTransactions.length.toString()}
          description="ce mois-ci"
          icon={Receipt}
        />
      </div>

      {/* Métriques résumées pour l'ensemble des données */}
      <MetricsSummary
        totalRevenue={totalRevenue}
        totalExpenses={totalExpenses}
        netResult={totalRevenue - totalExpenses}
        transactionCount={transactions?.length || 0}
      />

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyEvolutionChart data={monthlyEvolution} />
        <CategoryBarChart data={categoryData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <ExpenseDistributionChart data={expenseDistribution} />
      </div>
    </div>
  );
}


import React, { useState } from 'react';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useReportPeriod } from '@/hooks/useReportPeriod';
import { useFinancialCalculations } from '@/utils/financialCalculations';
import { exportAccountingData } from '@/utils/csvExport';
import { ReportFilters } from './reports/ReportFilters';
import { MetricsSummary } from './reports/MetricsSummary';
import { MonthlyEvolutionChart } from './reports/MonthlyEvolutionChart';
import { ExpenseDistributionChart } from './reports/ExpenseDistributionChart';
import { CategoryBarChart } from './reports/CategoryBarChart';
import { TransactionDetailsTable } from './reports/TransactionDetailsTable';

type ExportFormat = 'french' | 'international';

export function FinancialReports() {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('french');
  
  const { reportPeriod, dateRange, setDateRange, handlePeriodChange } = useReportPeriod();
  const { data: transactions, isLoading } = useFinancialData(dateRange);
  
  const {
    totalRevenue,
    totalExpenses,
    netResult,
    categoryData,
    monthlyEvolution,
    expenseDistribution
  } = useFinancialCalculations(transactions);

  console.log('=== FinancialReports MAIN COMPONENT ===');
  console.log('FinancialReports - IsLoading:', isLoading);
  console.log('FinancialReports - Transactions count:', transactions?.length || 0);
  console.log('FinancialReports - Raw transactions for table:', transactions);

  // Export comptable avec format
  const handleExport = () => {
    if (transactions) {
      exportAccountingData(transactions, exportFormat);
    }
  };

  // Afficher le loader pendant le chargement
  if (isLoading) {
    console.log('FinancialReports - Showing loading state');
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Chargement des données financières...</div>
        </div>
      </div>
    );
  }

  console.log('FinancialReports - Rendering main content with data loaded');

  return (
    <div className="space-y-6">
      <ReportFilters
        reportPeriod={reportPeriod}
        dateRange={dateRange}
        exportFormat={exportFormat}
        onPeriodChange={handlePeriodChange}
        onDateRangeChange={setDateRange}
        onExportFormatChange={setExportFormat}
        onExport={handleExport}
      />

      <MetricsSummary
        totalRevenue={totalRevenue}
        totalExpenses={totalExpenses}
        netResult={netResult}
        transactionCount={transactions?.length || 0}
      />

      <TransactionDetailsTable transactions={transactions || []} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyEvolutionChart data={monthlyEvolution} />
        <ExpenseDistributionChart data={expenseDistribution} />
      </div>

      <CategoryBarChart data={categoryData} />
    </div>
  );
}

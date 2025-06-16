
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ReportsDataProvider } from './ReportsDataProvider';
import { ReportsHeader } from './ReportsHeader';
import { ReportsOverview } from './ReportsOverview';
import { ReportsCharts } from './ReportsCharts';
import { ReportsFilters } from './ReportsFilters';
import { ReportGenerator } from '@/components/ReportGenerator';

interface ReportsFiltersState {
  reportType: string;
  period: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

function ReportsContent({ 
  filters, 
  setFilters 
}: { 
  filters: ReportsFiltersState;
  setFilters: React.Dispatch<React.SetStateAction<ReportsFiltersState>>;
}) {
  const { toast } = useToast();

  const handleGenerateReport = () => {
    toast({
      title: 'Rapport actualisé',
      description: 'Les données ont été mises à jour avec succès'
    });
  };

  const updateFilter = <K extends keyof ReportsFiltersState>(
    key: K, 
    value: ReportsFiltersState[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-8">
      <ReportsHeader />
      <ReportsOverview />
      <ReportsCharts />
      <ReportsFilters
        {...filters}
        setReportType={(value) => updateFilter('reportType', value)}
        setPeriod={(value) => updateFilter('period', value)}
        setDateRange={(value) => updateFilter('dateRange', value)}
        onGenerateReport={handleGenerateReport}
      />
      <ReportGenerator />
    </div>
  );
}

export function ReportsContainer() {
  const [filters, setFilters] = useState<ReportsFiltersState>({
    reportType: 'articles',
    period: 'month',
    dateRange: {
      from: undefined,
      to: undefined
    }
  });

  return (
    <ReportsDataProvider {...filters}>
      <ReportsContent filters={filters} setFilters={setFilters} />
    </ReportsDataProvider>
  );
}

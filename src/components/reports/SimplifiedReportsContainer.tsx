
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, BarChart3 } from 'lucide-react';
import { ReportFormatSelector } from './ReportFormatSelector';
import { useReportStats } from '@/hooks/useReportStats';
import { useReportGeneration } from '@/hooks/useReportGeneration';
import { ReportStatsOverview } from './ReportStatsOverview';
import { ReportConfiguration } from './ReportConfiguration';
import { ReportPreview } from './ReportPreview';

type ExportFormat = 'french' | 'international';

const reportTypes = [
  { id: 'articles', name: 'Rapport des Articles', description: 'État du stock et des articles' },
  { id: 'loans', name: 'Rapport des Prêts', description: 'Historique et statistiques des prêts' },
  { id: 'beneficiaries', name: 'Rapport des Bénéficiaires', description: 'Liste et activité des bénéficiaires' },
  { id: 'financial', name: 'Rapport Financier', description: 'Transactions et bilans financiers' },
  { id: 'activity', name: 'Rapport d\'Activité', description: 'Aperçu global de l\'activité' },
  { id: 'donors', name: 'Rapport des Donateurs', description: 'Statistiques des donations' }
];

export function SimplifiedReportsContainer() {
  const [reportType, setReportType] = useState('');
  const [period, setPeriod] = useState('');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [exportFormat, setExportFormat] = useState<ExportFormat>('french');

  const { data: stats, refetch } = useReportStats();
  const { generateReport } = useReportGeneration();

  const handleGenerateReport = () => {
    generateReport(reportType, dateRange, exportFormat);
  };

  const handleReset = () => {
    setReportType('');
    setPeriod('');
    setDateRange({});
  };

  const selectedReportType = reportTypes.find(r => r.id === reportType);

  return (
    <div className="space-y-6">
      <ReportStatsOverview stats={stats} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Générateur de Rapports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ReportConfiguration
            reportType={reportType}
            period={period}
            dateRange={dateRange}
            onReportTypeChange={setReportType}
            onPeriodChange={setPeriod}
            onDateRangeChange={setDateRange}
          />

          <ReportFormatSelector
            exportFormat={exportFormat}
            onExportFormatChange={setExportFormat}
          />

          <ReportPreview
            selectedReportType={selectedReportType}
            exportFormat={exportFormat}
            dateRange={dateRange}
            period={period}
          />

          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button 
              onClick={handleGenerateReport}
              className="bg-humanitarian-blue hover:bg-blue-700"
              disabled={!reportType}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Générer et Télécharger (CSV)
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => refetch()}
            >
              <Download className="h-4 w-4 mr-2" />
              Actualiser les données
            </Button>

            <Button 
              variant="outline"
              onClick={handleReset}
            >
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

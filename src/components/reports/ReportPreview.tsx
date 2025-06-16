
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ReportPreviewProps {
  selectedReportType: { id: string; name: string; description: string } | undefined;
  exportFormat: 'french' | 'international';
  dateRange: { from?: Date; to?: Date };
  period: string;
}

const reportTypes = [
  { id: 'articles', name: 'Rapport des Articles', description: 'État du stock et des articles' },
  { id: 'loans', name: 'Rapport des Prêts', description: 'Historique et statistiques des prêts' },
  { id: 'beneficiaries', name: 'Rapport des Bénéficiaires', description: 'Liste et activité des bénéficiaires' },
  { id: 'financial', name: 'Rapport Financier', description: 'Transactions et bilans financiers' },
  { id: 'activity', name: 'Rapport d\'Activité', description: 'Aperçu global de l\'activité' },
  { id: 'donors', name: 'Rapport des Donateurs', description: 'Statistiques des donations' }
];

const periodOptions = [
  { id: 'week', name: 'Cette semaine' },
  { id: 'month', name: 'Ce mois' },
  { id: 'quarter', name: 'Ce trimestre' },
  { id: 'year', name: 'Cette année' },
  { id: 'custom', name: 'Période personnalisée' }
];

export function ReportPreview({ 
  selectedReportType, 
  exportFormat, 
  dateRange, 
  period 
}: ReportPreviewProps) {
  if (!selectedReportType) return null;

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="font-medium mb-2">Aperçu du rapport</h3>
      <div className="space-y-2 text-sm">
        <p><strong>Type:</strong> {selectedReportType.name}</p>
        <p><strong>Description:</strong> {selectedReportType.description}</p>
        <p><strong>Format:</strong> {exportFormat === 'french' ? 'Format Français (CSV)' : 'Format International (CSV)'}</p>
        <p><strong>Période:</strong> {
          dateRange.from && dateRange.to 
            ? `${format(dateRange.from, 'dd/MM/yyyy', { locale: fr })} au ${format(dateRange.to, 'dd/MM/yyyy', { locale: fr })}`
            : period && period !== 'custom'
            ? periodOptions.find(p => p.id === period)?.name || 'Toutes les données'
            : 'Toutes les données'
        }</p>
      </div>
    </div>
  );
}

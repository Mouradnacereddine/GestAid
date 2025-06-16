
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-picker";

interface ReportConfigurationProps {
  reportType: string;
  period: string;
  dateRange: { from?: Date; to?: Date };
  onReportTypeChange: (value: string) => void;
  onPeriodChange: (value: string) => void;
  onDateRangeChange: (range: { from?: Date; to?: Date }) => void;
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

export function ReportConfiguration({
  reportType,
  period,
  dateRange,
  onReportTypeChange,
  onPeriodChange,
  onDateRangeChange
}: ReportConfigurationProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Type de rapport *</label>
        <Select value={reportType} onValueChange={onReportTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un type" />
          </SelectTrigger>
          <SelectContent>
            {reportTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                <div className="flex flex-col">
                  <span>{type.name}</span>
                  <span className="text-xs text-gray-500">{type.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Période</label>
        <Select value={period} onValueChange={onPeriodChange}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une période" />
          </SelectTrigger>
          <SelectContent>
            {periodOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Dates personnalisées {period === 'custom' && '*'}
        </label>
        <DatePickerWithRange
          date={{ from: dateRange.from, to: dateRange.to }}
          onSelect={(range) => onDateRangeChange({ 
            from: range?.from, 
            to: range?.to 
          })}
          className={period !== 'custom' ? 'opacity-50 pointer-events-none' : ''}
        />
      </div>
    </div>
  );
}

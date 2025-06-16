
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Filter, Download, MapPin, Globe } from 'lucide-react';

type ExportFormat = 'french' | 'international';

interface ReportFiltersProps {
  reportPeriod: string;
  dateRange: { from: Date; to: Date };
  exportFormat: ExportFormat;
  onPeriodChange: (period: string) => void;
  onDateRangeChange: (range: { from: Date; to: Date }) => void;
  onExportFormatChange: (format: ExportFormat) => void;
  onExport: () => void;
}

export function ReportFilters({
  reportPeriod,
  dateRange,
  exportFormat,
  onPeriodChange,
  onDateRangeChange,
  onExportFormatChange,
  onExport
}: ReportFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Paramètres du Rapport
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Période prédéfinie
            </label>
            <Select value={reportPeriod} onValueChange={onPeriodChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-month">Mois en cours</SelectItem>
                <SelectItem value="last-month">Mois dernier</SelectItem>
                <SelectItem value="last-3-months">3 derniers mois</SelectItem>
                <SelectItem value="last-6-months">6 derniers mois</SelectItem>
                <SelectItem value="current-year">Année en cours</SelectItem>
                <SelectItem value="last-year">Année dernière</SelectItem>
                <SelectItem value="custom">Période personnalisée</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Période personnalisée
            </label>
            <DatePickerWithRange
              date={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  onDateRangeChange({ from: range.from, to: range.to });
                }
              }}
            />
          </div>

          <div className="flex items-end">
            <Button onClick={onExport} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Export Comptable
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Format d'export
          </label>
          <RadioGroup 
            value={exportFormat} 
            onValueChange={(value: ExportFormat) => onExportFormatChange(value)}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <RadioGroupItem value="french" id="french" />
              <Label htmlFor="french" className="flex items-center gap-2 cursor-pointer flex-1">
                <MapPin className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="font-medium">Format Français</div>
                  <div className="text-sm text-gray-600">Séparateur: point-virgule (;) • Décimales: virgule (,)</div>
                </div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <RadioGroupItem value="international" id="international" />
              <Label htmlFor="international" className="flex items-center gap-2 cursor-pointer flex-1">
                <Globe className="h-4 w-4 text-green-600" />
                <div>
                  <div className="font-medium">Format International</div>
                  <div className="text-sm text-gray-600">Séparateur: virgule (,) • Décimales: point (.)</div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}

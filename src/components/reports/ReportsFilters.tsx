
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Filter } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-picker";

interface ReportsFiltersProps {
  reportType: string;
  setReportType: (value: string) => void;
  period: string;
  setPeriod: (value: string) => void;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  setDateRange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  onGenerateReport: () => void;
}

export function ReportsFilters({
  reportType,
  setReportType,
  period,
  setPeriod,
  dateRange,
  setDateRange,
  onGenerateReport
}: ReportsFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtres et Options de Rapport
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de rapport
            </label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="articles">Articles</SelectItem>
                <SelectItem value="loans">Prêts</SelectItem>
                <SelectItem value="beneficiaries">Bénéficiaires</SelectItem>
                <SelectItem value="donors">Donateurs</SelectItem>
                <SelectItem value="financial">Financier</SelectItem>
                <SelectItem value="activity">Activité</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Période prédéfinie
            </label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="quarter">Ce trimestre</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
                <SelectItem value="custom">Période personnalisée</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Période personnalisée
            </label>
            <DatePickerWithRange
              date={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range) => setDateRange({ 
                from: range?.from, 
                to: range?.to 
              })}
              className={period !== 'custom' ? 'opacity-50 pointer-events-none' : ''}
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-6 pt-4 border-t">
          <div className="text-sm text-gray-600">
            <p>• Rapports générés en temps réel</p>
            <p>• Export disponible via le générateur ci-dessous</p>
            <p>• Données synchronisées avec la base</p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onGenerateReport}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Actualiser les données
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface LoanFiltersProps {
  statusFilter: string;
  contractFilter: string;
  onStatusChange: (value: string) => void;
  onContractChange: (value: string) => void;
  onClearFilters: () => void;
}

export function LoanFilters({
  statusFilter,
  contractFilter,
  onStatusChange,
  onContractChange,
  onClearFilters
}: LoanFiltersProps) {
  const activeFiltersCount = [statusFilter, contractFilter].filter(filter => filter && filter !== 'all').length;

  const handleStatusChange = (value: string) => {
    onStatusChange(value === 'all' ? '' : value);
  };

  const handleContractChange = (value: string) => {
    onContractChange(value === 'all' ? '' : value);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex gap-2">
        <Select value={statusFilter || 'all'} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Statut du prêt" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="en_cours">En cours</SelectItem>
            <SelectItem value="en_retard">En retard</SelectItem>
            <SelectItem value="retourne">Retourné</SelectItem>
          </SelectContent>
        </Select>

        <Select value={contractFilter || 'all'} onValueChange={handleContractChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Contrat" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="true">Contrat signé</SelectItem>
            <SelectItem value="false">Contrat non signé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-6 px-2"
          >
            <X className="h-3 w-3" />
            Effacer
          </Button>
        </div>
      )}
    </div>
  );
}

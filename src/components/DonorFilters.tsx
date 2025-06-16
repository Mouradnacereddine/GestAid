
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface DonorFiltersProps {
  typeFilter: string;
  onTypeChange: (value: string) => void;
  onClearFilters: () => void;
}

export function DonorFilters({
  typeFilter,
  onTypeChange,
  onClearFilters
}: DonorFiltersProps) {
  const activeFiltersCount = [typeFilter].filter(filter => filter && filter !== 'all').length;

  const handleTypeChange = (value: string) => {
    onTypeChange(value === 'all' ? '' : value);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex gap-2">
        <Select value={typeFilter || 'all'} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type de donateur" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="particulier">Particulier</SelectItem>
            <SelectItem value="entreprise">Entreprise</SelectItem>
            <SelectItem value="association">Association</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {activeFiltersCount} filtre actif
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

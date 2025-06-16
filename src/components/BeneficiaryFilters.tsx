
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface BeneficiaryFiltersProps {
  consentFilter: string;
  onConsentChange: (value: string) => void;
  onClearFilters: () => void;
}

export function BeneficiaryFilters({
  consentFilter,
  onConsentChange,
  onClearFilters
}: BeneficiaryFiltersProps) {
  const activeFiltersCount = [consentFilter].filter(filter => filter && filter !== 'all').length;

  const handleConsentChange = (value: string) => {
    onConsentChange(value === 'all' ? '' : value);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex gap-2">
        <Select value={consentFilter || 'all'} onValueChange={handleConsentChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Consentement RGPD" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="true">Consentement donné</SelectItem>
            <SelectItem value="false">Consentement non donné</SelectItem>
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

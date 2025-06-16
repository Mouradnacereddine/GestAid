
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface ArticleFiltersProps {
  statusFilter: string;
  stateFilter: string;
  categoryFilter: string;
  onStatusChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onClearFilters: () => void;
  categories: Array<{ id: string; name: string }>;
}

export function ArticleFilters({
  statusFilter,
  stateFilter,
  categoryFilter,
  onStatusChange,
  onStateChange,
  onCategoryChange,
  onClearFilters,
  categories
}: ArticleFiltersProps) {
  const activeFiltersCount = [statusFilter, stateFilter, categoryFilter].filter(filter => filter && filter !== 'all').length;

  const handleStatusChange = (value: string) => {
    onStatusChange(value === 'all' ? '' : value);
  };

  const handleStateChange = (value: string) => {
    onStateChange(value === 'all' ? '' : value);
  };

  const handleCategoryChange = (value: string) => {
    onCategoryChange(value === 'all' ? '' : value);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex gap-2">
        <Select value={statusFilter || 'all'} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="disponible">Disponible</SelectItem>
            <SelectItem value="en_pret">En prêt</SelectItem>
            <SelectItem value="en_reparation">En réparation</SelectItem>
            <SelectItem value="retire">Retiré</SelectItem>
          </SelectContent>
        </Select>

        <Select value={stateFilter || 'all'} onValueChange={handleStateChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="État" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les états</SelectItem>
            <SelectItem value="neuf">Neuf</SelectItem>
            <SelectItem value="bon">Bon</SelectItem>
            <SelectItem value="moyen">Moyen</SelectItem>
            <SelectItem value="mauvais">Mauvais</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter || 'all'} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
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

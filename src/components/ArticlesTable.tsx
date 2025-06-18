import React from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrency } from '@/utils/currency';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { getStateLabel, getStatusColor, getStatusLabel } from '@/utils/articleUtils';

interface Article {
  id: string;
  name: string;
  identifier: string;
  status: string;
  state: string;
  storage_location?: string;
  estimated_value?: number;
  maintenance_notes?: string;
  categories?: { name: string };
  donors?: { name: string };
  created_at?: string;
}

interface ArticlesTableProps {
  articles: Article[];
  onEdit: (article: Article) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function ArticlesTable({ articles, onEdit, onDelete, isDeleting }: ArticlesTableProps) {
  const { currency } = useCurrency();
  const handleDelete = (article: Article) => {
    const confirmDelete = window.confirm("Supprimer cet article ? Cette action est irréversible.");
    if (confirmDelete) {
      onDelete(article.id);
    }
  };

  const formatValue = (value?: number) => {
    return value ? formatCurrency(value, currency) : '-';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Identifiant</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>État</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Lieu de stockage</TableHead>
            <TableHead>Valeur estimée</TableHead>
            <TableHead>Donateur</TableHead>
            <TableHead>Date de création</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.map((article) => (
            <TableRow key={article.id}>
              <TableCell className="font-mono text-sm">
                {article.identifier}
              </TableCell>
              <TableCell className="font-medium">
                {article.name}
              </TableCell>
              <TableCell>
                {article.categories?.name || 'Sans catégorie'}
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {getStateLabel(article.state)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={`${getStatusColor(article.status)} text-white`}>
                  {getStatusLabel(article.status)}
                </Badge>
              </TableCell>
              <TableCell>
                {article.storage_location || '-'}
              </TableCell>
              <TableCell>
                {formatValue(article.estimated_value)}
              </TableCell>
              <TableCell>
                {article.donors?.name || '-'}
              </TableCell>
              <TableCell>
                {formatDate(article.created_at)}
              </TableCell>
              <TableCell className="max-w-xs">
                {article.maintenance_notes ? (
                  <div className="truncate text-sm text-gray-600" title={article.maintenance_notes}>
                    {article.maintenance_notes}
                  </div>
                ) : '-'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(article)}
                    title="Modifier"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(article)}
                    title="Supprimer"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

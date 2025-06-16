
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, MapPin, Euro, User, Edit, Trash2 } from 'lucide-react';
import { getStateLabel, getStatusColor } from '@/utils/articleUtils';

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
}

interface ArticleCardProps {
  article: Article;
  onEdit: (article: Article) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function ArticleCard({ article, onEdit, onDelete, isDeleting }: ArticleCardProps) {
  const handleDelete = () => {
    const confirmDelete = window.confirm("Supprimer cet article ? Cette action est irréversible.");
    if (confirmDelete) {
      onDelete(article.id);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{article.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColor(article.status)} text-white`}>
              {article.status?.replace('_', ' ')}
            </Badge>
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
              onClick={handleDelete}
              title="Supprimer"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          {article.identifier}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Package className="h-4 w-4 text-gray-500" />
          <span>{article.categories?.name || 'Sans catégorie'}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline">
            {getStateLabel(article.state)}
          </Badge>
        </div>

        {article.storage_location && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{article.storage_location}</span>
          </div>
        )}

        {article.estimated_value && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Euro className="h-4 w-4" />
            <span>{article.estimated_value}€</span>
          </div>
        )}

        {article.donors?.name && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>Don de {article.donors.name}</span>
          </div>
        )}

        {article.maintenance_notes && (
          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
            <strong>Notes:</strong> {article.maintenance_notes}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

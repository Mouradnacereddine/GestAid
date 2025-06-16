
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus } from 'lucide-react';

interface ArticlesEmptyStateProps {
  onAddArticle: () => void;
}

export function ArticlesEmptyState({ onAddArticle }: ArticlesEmptyStateProps) {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun article</h3>
        <p className="text-gray-600 mb-4">Commencez par ajouter votre premier article à l'inventaire.</p>
        <Button onClick={onAddArticle}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un Article
        </Button>
      </CardContent>
    </Card>
  );
}

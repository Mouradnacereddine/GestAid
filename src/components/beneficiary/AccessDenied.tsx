
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

interface AccessDeniedProps {
  onClose: () => void;
  userRole?: string;
}

export function AccessDenied({ onClose, userRole }: AccessDeniedProps) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Accès Refusé</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-red-600">
          Vous n'avez pas les permissions nécessaires pour ajouter des bénéficiaires. 
          Seuls les administrateurs et gestionnaires peuvent effectuer cette action.
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Votre rôle actuel: {userRole || 'Non défini'}
        </p>
      </CardContent>
    </Card>
  );
}


import React from 'react';
import { Button } from '@/components/ui/button';

interface TransactionFormActionsProps {
  onClose: () => void;
  isLoading: boolean;
  isEdit?: boolean;
}

export function TransactionFormActions({ onClose, isLoading, isEdit = false }: TransactionFormActionsProps) {
  return (
    <div className="flex justify-end gap-2 pt-4">
      <Button type="button" variant="outline" onClick={onClose}>
        Annuler
      </Button>
      <Button 
        type="submit" 
        disabled={isLoading}
        className="bg-humanitarian-blue hover:bg-blue-700"
      >
        {isLoading 
          ? (isEdit ? 'Modification...' : 'Création...') 
          : (isEdit ? 'Modifier la Transaction' : 'Créer la Transaction')
        }
      </Button>
    </div>
  );
}

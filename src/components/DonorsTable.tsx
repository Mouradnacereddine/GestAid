
import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDonors } from '@/hooks/useDonors';
import { Loader2, Users, Edit, Trash2 } from 'lucide-react';
import { SearchInput } from '@/components/SearchInput';
import { DonorFilters } from '@/components/DonorFilters';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DonorForm } from '@/components/DonorForm';
import { DonorDeleteDialog } from '@/components/DonorDeleteDialog';

export function DonorsTable() {
  const { data: donors, isLoading, error } = useDonors();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [editingDonor, setEditingDonor] = useState<string | null>(null);
  const [deletingDonor, setDeletingDonor] = useState<string | null>(null);

  const filteredDonors = useMemo(() => {
    if (!donors) return [];

    return donors.filter((donor) => {
      // Generate reference for search
      const reference = `DON-${donor.id.slice(-8).toUpperCase()}`;
      
      // Search filter
      const matchesSearch = !searchTerm || 
        donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (donor.email && donor.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (donor.phone && donor.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (donor.address && donor.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        reference.toLowerCase().includes(searchTerm.toLowerCase());

      // Type filter
      const matchesType = !typeFilter || donor.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [donors, searchTerm, typeFilter]);

  const handleClearFilters = () => {
    setTypeFilter('');
    setSearchTerm('');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Chargement des donateurs...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <p className="text-red-600">Erreur lors du chargement des donateurs: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'particulier':
        return 'Particulier';
      case 'entreprise':
        return 'Entreprise';
      case 'association':
        return 'Association';
      default:
        return type;
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'particulier':
        return 'default';
      case 'entreprise':
        return 'secondary';
      case 'association':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Rechercher par référence, nom, email, téléphone ou adresse..."
            />
          </div>
        </div>

        <DonorFilters
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
          onClearFilters={handleClearFilters}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Liste des Donateurs ({filteredDonors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDonors.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8">
                <Users className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 text-center">
                  {donors && donors.length > 0 ? 'Aucun donateur ne correspond aux critères de recherche' : 'Aucun donateur enregistré'}
                </p>
                {donors && donors.length > 0 && (
                  <p className="text-gray-500 text-sm text-center mt-2">
                    Modifiez vos critères de recherche ou filtres
                  </p>
                )}
                {(!donors || donors.length === 0) && (
                  <p className="text-gray-500 text-sm text-center mt-2">
                    Cliquez sur "Ajouter un Donateur" pour commencer
                  </p>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Adresse</TableHead>
                    <TableHead>Date d'ajout</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDonors.map((donor) => (
                    <TableRow key={donor.id}>
                      <TableCell className="font-mono text-sm">
                        DON-{donor.id.slice(-8).toUpperCase()}
                      </TableCell>
                      <TableCell className="font-medium">{donor.name}</TableCell>
                      <TableCell>
                        <Badge variant={getTypeBadgeVariant(donor.type || 'particulier')}>
                          {getTypeLabel(donor.type || 'particulier')}
                        </Badge>
                      </TableCell>
                      <TableCell>{donor.email || '-'}</TableCell>
                      <TableCell>{donor.phone || '-'}</TableCell>
                      <TableCell className="max-w-xs truncate" title={donor.address || ''}>
                        {donor.address || '-'}
                      </TableCell>
                      <TableCell>
                        {new Date(donor.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingDonor(donor.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setDeletingDonor(donor.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog pour modifier un donateur */}
      <Dialog open={!!editingDonor} onOpenChange={() => setEditingDonor(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le donateur</DialogTitle>
            <DialogDescription>
              Modifiez les informations du donateur. Les champs marqués d'un * sont obligatoires.
            </DialogDescription>
          </DialogHeader>
          <DonorForm 
            onClose={() => setEditingDonor(null)} 
            donorId={editingDonor || undefined}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog pour supprimer un donateur */}
      {deletingDonor && (
        <DonorDeleteDialog
          donorId={deletingDonor}
          onClose={() => setDeletingDonor(null)}
        />
      )}
    </>
  );
}

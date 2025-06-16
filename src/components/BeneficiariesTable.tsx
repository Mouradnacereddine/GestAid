
import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBeneficiaries } from '@/hooks/useBeneficiaries';
import { Loader2, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { BeneficiaryForm } from '@/components/BeneficiaryForm';
import { BeneficiaryDeleteDialog } from '@/components/BeneficiaryDeleteDialog';
import { SearchInput } from '@/components/SearchInput';
import { BeneficiaryFilters } from '@/components/BeneficiaryFilters';

export function BeneficiariesTable() {
  const { data: beneficiaries, isLoading, error } = useBeneficiaries();
  const [editingBeneficiary, setEditingBeneficiary] = useState<string | null>(null);
  const [deletingBeneficiary, setDeletingBeneficiary] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [consentFilter, setConsentFilter] = useState('');

  const filteredBeneficiaries = useMemo(() => {
    if (!beneficiaries) return [];

    return beneficiaries.filter((beneficiary) => {
      // Generate reference for search
      const reference = `BEN-${beneficiary.id.slice(-8).toUpperCase()}`;
      
      // Recherche textuelle
      const matchesSearch = searchTerm === '' || 
        beneficiary.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        beneficiary.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        beneficiary.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        beneficiary.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reference.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtre consentement
      const matchesConsent = consentFilter === '' || 
        beneficiary.consent_given.toString() === consentFilter;

      return matchesSearch && matchesConsent;
    });
  }, [beneficiaries, searchTerm, consentFilter]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setConsentFilter('');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Chargement des bénéficiaires...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600">Erreur lors du chargement des bénéficiaires.</p>
        </CardContent>
      </Card>
    );
  }

  if (!beneficiaries || beneficiaries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Liste des Bénéficiaires</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Aucun bénéficiaire enregistré pour le moment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            Liste des Bénéficiaires ({filteredBeneficiaries.length}
            {beneficiaries && filteredBeneficiaries.length !== beneficiaries.length && (
              <span> sur {beneficiaries.length}</span>
            )})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Rechercher par référence, nom, email ou téléphone..."
            className="max-w-md"
          />

          <BeneficiaryFilters
            consentFilter={consentFilter}
            onConsentChange={setConsentFilter}
            onClearFilters={handleClearFilters}
          />

          {filteredBeneficiaries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Aucun bénéficiaire ne correspond à vos critères de recherche</p>
              <Button variant="outline" onClick={handleClearFilters}>
                Effacer les filtres
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Nom Complet</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Date de naissance</TableHead>
                  <TableHead>Consentement RGPD</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBeneficiaries.map((beneficiary) => (
                  <TableRow key={beneficiary.id}>
                    <TableCell className="font-mono text-sm">
                      BEN-{beneficiary.id.slice(-8).toUpperCase()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {beneficiary.first_name} {beneficiary.last_name}
                    </TableCell>
                    <TableCell>{beneficiary.email || '-'}</TableCell>
                    <TableCell>{beneficiary.phone || '-'}</TableCell>
                    <TableCell>
                      {beneficiary.birth_date 
                        ? new Date(beneficiary.birth_date).toLocaleDateString('fr-FR')
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant={beneficiary.consent_given ? 'default' : 'secondary'}>
                        {beneficiary.consent_given ? 'Donné' : 'Non donné'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(beneficiary.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingBeneficiary(beneficiary.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setDeletingBeneficiary(beneficiary.id)}
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

      {/* Dialog pour modifier un bénéficiaire */}
      <Dialog open={!!editingBeneficiary} onOpenChange={() => setEditingBeneficiary(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le bénéficiaire</DialogTitle>
            <DialogDescription>
              Modifiez les informations du bénéficiaire. Les champs marqués d'un * sont obligatoires.
            </DialogDescription>
          </DialogHeader>
          <BeneficiaryForm 
            onClose={() => setEditingBeneficiary(null)} 
            beneficiaryId={editingBeneficiary || undefined}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog pour supprimer un bénéficiaire */}
      {deletingBeneficiary && (
        <BeneficiaryDeleteDialog
          beneficiaryId={deletingBeneficiary}
          onClose={() => setDeletingBeneficiary(null)}
        />
      )}
    </>
  );
}

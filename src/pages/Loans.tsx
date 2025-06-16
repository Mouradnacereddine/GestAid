import React, { useState, useMemo } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { BreadcrumbNav } from '@/components/BreadcrumbNav';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { LoanForm } from '@/components/LoanForm';
import { LoansTable } from '@/components/LoansTable';
import { LoanDetailsDialog } from '@/components/LoanDetailsDialog';
import { SearchInput } from '@/components/SearchInput';
import { LoanFilters } from '@/components/LoanFilters';
import { useLoans } from '@/hooks/useLoans';
import { useLoanReturn } from '@/hooks/useLoanReturn';
import { useLoanDelete } from '@/hooks/useLoanDelete';

export default function Loans() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [contractFilter, setContractFilter] = useState('');
  const { data: loans, isLoading, error } = useLoans();
  const returnMutation = useLoanReturn();
  const deleteMutation = useLoanDelete();

  const getLoanStatus = (loan: any) => {
    // Vérifier si le prêt est complètement retourné
    const isCompletelyReturned = loan.actual_return_date || 
      (loan.loan_articles && loan.loan_articles.length > 0 && 
       loan.loan_articles.every((article: any) => article.returned_at));
    
    if (isCompletelyReturned) return 'retourne';
    
    const expectedDate = new Date(loan.expected_return_date);
    const today = new Date();
    
    if (expectedDate < today) return 'en_retard';
    return 'en_cours';
  };

  const filteredLoans = useMemo(() => {
    if (!loans) return [];

    return loans.filter((loan) => {
      // Recherche textuelle
      const matchesSearch = searchTerm === '' || 
        loan.loan_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${loan.beneficiaries?.first_name} ${loan.beneficiaries?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.beneficiaries?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.loan_articles?.some((la: any) => 
          la.articles.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          la.articles.identifier.toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Filtres
      const loanStatus = getLoanStatus(loan);
      const matchesStatus = statusFilter === '' || loanStatus === statusFilter;
      const matchesContract = contractFilter === '' || 
        loan.contract_signed.toString() === contractFilter;

      return matchesSearch && matchesStatus && matchesContract;
    });
  }, [loans, searchTerm, statusFilter, contractFilter]);

  const handleOpenDialog = () => {
    setSelectedLoan(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedLoan(null);
  };

  const handleEditLoan = (loan: any) => {
    setSelectedLoan(loan);
    setIsDialogOpen(true);
  };

  const handleDeleteLoan = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setContractFilter('');
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <BreadcrumbNav />
        <div className="p-6">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Prêts</h1>
              <p className="text-gray-600">
                Suivez et gérez les prêts d'articles - {filteredLoans?.length || 0} prêt{filteredLoans?.length > 1 ? 's' : ''}
                {loans && filteredLoans?.length !== loans?.length && (
                  <span> sur {loans?.length} total</span>
                )}
              </p>
            </div>
            <Button className="flex items-center gap-2" onClick={handleOpenDialog}>
              <Plus className="h-4 w-4" />
              Nouveau Prêt
            </Button>
          </div>

          <div className="space-y-4 mb-6">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Rechercher par numéro, bénéficiaire, article..."
              className="max-w-md"
            />

            <LoanFilters
              statusFilter={statusFilter}
              contractFilter={contractFilter}
              onStatusChange={setStatusFilter}
              onContractChange={setContractFilter}
              onClearFilters={handleClearFilters}
            />
          </div>
          
          {isLoading ? (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-center text-gray-600">Chargement des prêts...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-center text-red-600">Erreur lors du chargement des prêts</p>
            </div>
          ) : !filteredLoans || filteredLoans.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center py-8">
                {searchTerm || statusFilter || contractFilter ? (
                  <>
                    <p className="text-gray-600 mb-4">Aucun prêt ne correspond à vos critères de recherche</p>
                    <Button variant="outline" onClick={handleClearFilters}>
                      Effacer les filtres
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 mb-4">Aucun prêt enregistré</p>
                    <Button onClick={handleOpenDialog}>
                      <Plus className="h-4 w-4 mr-2" />
                      Créer votre premier prêt
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <LoansTable
                loans={filteredLoans}
                onEdit={handleEditLoan}
                onDelete={handleDeleteLoan}
                isDeleting={deleteMutation.isPending}
              />
            </div>
          )}

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            if (!open) {
              handleCloseDialog();
            }
          }}>
            <DialogContent 
              className="max-w-4xl max-h-[90vh] overflow-y-auto p-0"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <LoanForm onClose={handleCloseDialog} loan={selectedLoan} />
            </DialogContent>
          </Dialog>

          <LoanDetailsDialog
            loan={selectedLoan}
            isOpen={isDetailsOpen}
            onClose={() => {
              setIsDetailsOpen(false);
              setSelectedLoan(null);
            }}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

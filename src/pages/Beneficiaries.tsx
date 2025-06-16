
import React, { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { BreadcrumbNav } from '@/components/BreadcrumbNav';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { BeneficiaryForm } from '@/components/BeneficiaryForm';
import { BeneficiariesTable } from '@/components/BeneficiariesTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function Beneficiaries() {
  const [showForm, setShowForm] = useState(false);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <BreadcrumbNav />
        <div className="p-6">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Bénéficiaires</h1>
              <p className="text-gray-600">Gérez les informations des bénéficiaires</p>
            </div>
            <Button 
              className="flex items-center gap-2"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-4 w-4" />
              Ajouter un Bénéficiaire
            </Button>
          </div>
          
          <BeneficiariesTable />
        </div>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau bénéficiaire</DialogTitle>
              <DialogDescription>
                Remplissez les informations du bénéficiaire. Les champs marqués d'un * sont obligatoires.
              </DialogDescription>
            </DialogHeader>
            <BeneficiaryForm onClose={() => setShowForm(false)} />
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}

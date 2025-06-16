
import React, { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { BreadcrumbNav } from '@/components/BreadcrumbNav';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DonorForm } from '@/components/DonorForm';
import { DonorsTable } from '@/components/DonorsTable';

export default function Donors() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <BreadcrumbNav />
        <div className="p-6">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Donateurs</h1>
              <p className="text-gray-600">Gérez les informations des donateurs</p>
            </div>
            <Button 
              className="flex items-center gap-2"
              onClick={() => setIsFormOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Ajouter un Donateur
            </Button>
          </div>
          
          <DonorsTable />

          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau donateur</DialogTitle>
                <DialogDescription>
                  Remplissez les informations du donateur. Les champs marqués d'un * sont obligatoires.
                </DialogDescription>
              </DialogHeader>
              <DonorForm onClose={handleCloseForm} />
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

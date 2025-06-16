
import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { BreadcrumbNav } from '@/components/BreadcrumbNav';
import { SimplifiedReportsContainer } from '@/components/reports/SimplifiedReportsContainer';

export default function Reports() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <BreadcrumbNav />
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Rapports et Analyses</h1>
            <p className="text-gray-600 mt-2">
              Génération de rapports personnalisés et analyse des données de l'association
            </p>
          </div>
          <SimplifiedReportsContainer />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

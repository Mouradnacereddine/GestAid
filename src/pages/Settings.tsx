
import React from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { BreadcrumbNav } from '@/components/BreadcrumbNav';

export default function Settings() {
  const { currency, setCurrency } = useCurrency();
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <BreadcrumbNav />
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
            <p className="text-gray-600">Configuration de l'application</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Devise</h2>
            <div className="flex items-center">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="block w-full max-w-xs p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="DZD">Dinar Algérien (DZD)</option>
                <option value="USD">Dollar Américain (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
              <p className="ml-4 text-gray-600">Devise sélectionnée : <strong>{currency}</strong></p>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

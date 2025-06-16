
import React, { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { BreadcrumbNav } from '@/components/BreadcrumbNav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessagingCenter } from '@/components/MessagingCenter';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { StockAlerts } from '@/components/StockAlerts';
import { ReportGenerator } from '@/components/ReportGenerator';
import { MessageSquare, QrCode, AlertTriangle, FileText } from 'lucide-react';

export default function Management() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <BreadcrumbNav />
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Gestion Avancée</h1>
            <p className="text-gray-600">Outils de gestion et communication</p>
          </div>

          <Tabs defaultValue="messaging" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="messaging" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Messagerie
              </TabsTrigger>
              <TabsTrigger value="qr-labels" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                Étiquettes QR
              </TabsTrigger>
              <TabsTrigger value="alerts" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Alertes Stock
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Rapports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="messaging" className="space-y-6">
              <MessagingCenter />
            </TabsContent>

            <TabsContent value="qr-labels" className="space-y-6">
              <QRCodeGenerator />
            </TabsContent>

            <TabsContent value="alerts" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StockAlerts />
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Configuration des Alertes</h2>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Les alertes sont automatiquement générées en fonction des seuils configurés 
                      dans les paramètres de l'application.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <ReportGenerator />
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

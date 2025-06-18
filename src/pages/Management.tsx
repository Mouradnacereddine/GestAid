
import React, { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { BreadcrumbNav } from '@/components/BreadcrumbNav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessagingCenter } from '@/components/MessagingCenter';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';

import { MessageSquare, QrCode } from 'lucide-react';

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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="messaging" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Messagerie
              </TabsTrigger>
              <TabsTrigger value="qr-labels" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                Étiquettes QR
              </TabsTrigger>
            </TabsList>

            <TabsContent value="messaging" className="space-y-6">
              <MessagingCenter />
            </TabsContent>

            <TabsContent value="qr-labels" className="space-y-6">
              <QRCodeGenerator />
            </TabsContent>




          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

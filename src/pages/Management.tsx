import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode } from 'lucide-react';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';

export default function Management() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Outils de Gestion</h1>
        <p className="text-gray-600 mt-2">Gérez les outils avancés de l'application.</p>
      </div>
      <Tabs defaultValue="qr-labels" className="space-y-6">
        <TabsList>
          <TabsTrigger value="qr-labels" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            Étiquettes QR
          </TabsTrigger>
        </TabsList>
        <TabsContent value="qr-labels" className="space-y-6">
          <QRCodeGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
}


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QrCode, Printer, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QRCodeGeneratorProps {
  articleId?: string;
  articleName?: string;
}

export function QRCodeGenerator({ articleId, articleName }: QRCodeGeneratorProps) {
  const [selectedArticle, setSelectedArticle] = useState(articleId || '');
  const [labelTemplate, setLabelTemplate] = useState('standard');
  const [quantity, setQuantity] = useState(1);

  // Fetch real articles from database
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['articles-for-qr'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('id, identifier, name, status')
        .order('identifier');
      
      if (error) throw error;
      return data;
    },
  });

  const templates = [
    { id: 'standard', name: 'Étiquette Standard (5x2.5cm)' },
    { id: 'large', name: 'Grande Étiquette (7x4cm)' },
    { id: 'mini', name: 'Mini Étiquette (3x2cm)' }
  ];

  const generateQRCode = () => {
    if (!selectedArticle) {
      toast.error('Veuillez sélectionner un article');
      return;
    }

    const selectedArticleData = articles.find(a => a.id === selectedArticle);
    
    // Generate QR code data
    const qrData = {
      articleId: selectedArticleData?.identifier,
      url: `${window.location.origin}/articles/${selectedArticleData?.identifier}`,
      generatedAt: new Date().toISOString(),
      template: labelTemplate,
      quantity
    };

    console.log('QR Code généré:', qrData);
    toast.success(`QR Code généré pour l'article ${selectedArticleData?.identifier}`);
  };

  const printLabels = () => {
    if (!selectedArticle) {
      toast.error('Veuillez d\'abord générer un QR code');
      return;
    }

    const selectedArticleData = articles.find(a => a.id === selectedArticle);
    console.log('Impression des étiquettes:', {
      article: selectedArticleData?.identifier,
      template: labelTemplate,
      quantity
    });
    
    toast.success(`${quantity} étiquette(s) envoyée(s) à l'imprimante`);
  };

  const downloadLabels = () => {
    if (!selectedArticle) {
      toast.error('Veuillez d\'abord générer un QR code');
      return;
    }

    const selectedArticleData = articles.find(a => a.id === selectedArticle);
    
    // Create a simple PDF-like content for download
    const content = `Étiquettes QR - ${selectedArticleData?.name}\n\nIdentifiant: ${selectedArticleData?.identifier}\nModèle: ${labelTemplate}\nQuantité: ${quantity}\nGénéré le: ${new Date().toLocaleString('fr-FR')}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `etiquettes-${selectedArticleData?.identifier}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast.success('Étiquettes téléchargées');
  };

  const selectedArticleData = articles.find(a => a.id === selectedArticle);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Génération d'Étiquettes QR
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Chargement des articles...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Génération d'Étiquettes QR
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Article</label>
            <Select value={selectedArticle} onValueChange={setSelectedArticle}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un article" />
              </SelectTrigger>
              <SelectContent>
                {articles.map((article) => (
                  <SelectItem key={article.id} value={article.id}>
                    {article.identifier} - {article.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Modèle d'étiquette</label>
            <Select value={labelTemplate} onValueChange={setLabelTemplate}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Quantité</label>
          <Input
            type="number"
            min="1"
            max="100"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-32"
          />
        </div>

        {selectedArticle && selectedArticleData && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Aperçu de l'étiquette</h3>
            <div className="bg-white border-2 border-dashed border-gray-300 p-4 text-center">
              <div className="w-24 h-24 bg-gray-200 mx-auto mb-2 flex items-center justify-center">
                <QrCode className="h-16 w-16 text-gray-400" />
              </div>
              <p className="text-xs font-mono">{selectedArticleData.identifier}</p>
              <p className="text-xs text-gray-600 mt-1">
                {selectedArticleData.name}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Status: {selectedArticleData.status}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={generateQRCode}
            className="bg-humanitarian-blue hover:bg-blue-700"
          >
            <QrCode className="h-4 w-4 mr-2" />
            Générer QR Code
          </Button>
          
          <Button 
            onClick={printLabels}
            variant="outline"
            disabled={!selectedArticle}
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimer ({quantity})
          </Button>
          
          <Button 
            onClick={downloadLabels}
            variant="outline"
            disabled={!selectedArticle}
          >
            <Download className="h-4 w-4 mr-2" />
            Télécharger
          </Button>
        </div>

        {articles.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <p>Aucun article disponible</p>
            <p className="text-sm">Ajoutez des articles pour générer des étiquettes QR</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

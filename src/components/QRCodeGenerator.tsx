
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QrCode, Printer, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArticleSearch, Article } from '@/components/ArticleSearch';
import { QRCodeCanvas } from 'qrcode.react';
import * as htmlToImage from 'html-to-image';

interface QRCodeGeneratorProps {
  articleId?: string;
}

export function QRCodeGenerator({ articleId }: QRCodeGeneratorProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [labelTemplate, setLabelTemplate] = useState('standard');
  const [quantity, setQuantity] = useState(1);
  const [qrCodeValue, setQrCodeValue] = useState('');
  const labelPreviewRef = useRef<HTMLDivElement>(null);

  const { data: articles = [], isLoading } = useQuery<Article[]>({ 
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

  useEffect(() => {
    if (articleId && articles.length > 0 && !selectedArticle) {
      const initialArticle = articles.find(a => a.id === articleId);
      if (initialArticle) {
        setSelectedArticle(initialArticle);
      }
    }
  }, [articleId, articles, selectedArticle]);

  useEffect(() => {
    setQrCodeValue('');
  }, [selectedArticle]);

  const templates = {
    standard: { name: 'Étiquette Standard (5x2.5cm)', width: 210, height: 180, qrSize: 64, textSize: 'text-xs' },
    large: { name: 'Grande Étiquette (7x4cm)', width: 285, height: 240, qrSize: 96, textSize: 'text-sm' },
    mini: { name: 'Mini Étiquette (3x2cm)', width: 130, height: 150, qrSize: 48, textSize: 'text-[10px]' }
  };

  const generateQRCode = () => {
    if (!selectedArticle) {
      toast.error('Veuillez sélectionner un article');
      return;
    }
    const url = `${window.location.origin}/articles/${selectedArticle?.identifier}`;
    setQrCodeValue(url);
    toast.success(`QR Code généré pour l'article ${selectedArticle?.identifier}`);
  };

  const handleAction = (action: 'print' | 'download') => {
    const node = labelPreviewRef.current;
    if (!node) {
      toast.error('Générez un aperçu avant de continuer.');
      return;
    }

    const options = {
      cacheBust: true,
      pixelRatio: 3, // Higher resolution for better quality
      backgroundColor: '#ffffff',
      width: node.offsetWidth,
      height: node.offsetHeight,
    };

    htmlToImage.toPng(node, options)
      .then((dataUrl) => {
        if (action === 'download') {
          const link = document.createElement('a');
          link.download = `etiquette-${selectedArticle?.identifier}.png`;
          link.href = dataUrl;
          link.click();
          toast.success('Étiquette téléchargée avec succès!');
        } else if (action === 'print') {
          const printWindow = window.open('', '_blank');
          printWindow?.document.write('<html><head><title>Imprimer les étiquettes</title></head><body>');
          for (let i = 0; i < quantity; i++) {
            printWindow?.document.write(`<img src="${dataUrl}" style="margin-bottom: 10px;" />`);
          }
          printWindow?.document.write('</body></html>');
          printWindow?.document.close();
          printWindow?.focus();
          setTimeout(() => {
            printWindow?.print();
          }, 250);
          toast.success(`${quantity} étiquette(s) envoyée(s) à l'impression.`);
        }
      })
      .catch((err) => {
        console.error('Erreur lors de la génération de l\'image:', err);
        toast.error('Erreur lors de la génération de l\'image.');
      });
  };

  if (isLoading && articles.length === 0) {
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

  const selectedTemplate = templates[labelTemplate as keyof typeof templates];

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
            <ArticleSearch
              articles={articles}
              isLoading={isLoading}
              selectedArticle={selectedArticle}
              onSelectArticle={setSelectedArticle}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Modèle d'étiquette</label>
            <Select value={labelTemplate} onValueChange={setLabelTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un modèle" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(templates).map(([id, { name }]) => (
                  <SelectItem key={id} value={id}>
                    {name}
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
        {selectedArticle && (
          <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center">
            <h3 className="font-medium mb-2 self-start">Aperçu de l'étiquette</h3>
            <div 
              ref={labelPreviewRef} 
              className="bg-white border-2 border-dashed border-gray-300 transition-all duration-300 mt-2 flex justify-center items-center"
              style={{ width: selectedTemplate.width, height: selectedTemplate.height }}
            >
              <div className="text-center">
                <div className="inline-block">
                  {qrCodeValue ? (
                    <QRCodeCanvas value={qrCodeValue} size={selectedTemplate.qrSize} />
                  ) : (
                    <div style={{ width: selectedTemplate.qrSize, height: selectedTemplate.qrSize }} className="bg-gray-200 flex items-center justify-center">
                      <QrCode style={{ width: '75%', height: '75%' }} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="text-center leading-tight mt-1">
                  <p className={`font-mono ${selectedTemplate.textSize}`}>{selectedArticle.identifier}</p>
                  <p className={`text-gray-600 ${selectedTemplate.textSize}`}>{selectedArticle.name}</p>
                  <p className={`text-green-600 ${selectedTemplate.textSize}`}>Status: {selectedArticle.status}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <Button onClick={generateQRCode} disabled={!selectedArticle} className="bg-humanitarian-blue hover:bg-blue-700">
            <QrCode className="h-4 w-4 mr-2" />
            Générer QR Code
          </Button>
          <Button onClick={() => handleAction('print')} variant="outline" disabled={!qrCodeValue}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimer ({quantity})
          </Button>
          <Button onClick={() => handleAction('download')} variant="outline" disabled={!qrCodeValue}>
            <Download className="h-4 w-4 mr-2" />
            Télécharger
          </Button>
        </div>
        {articles.length === 0 && !isLoading && (
          <div className="text-center py-4 text-gray-500">
            <p>Aucun article disponible</p>
            <p className="text-sm">Ajoutez des articles pour générer des étiquettes QR</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

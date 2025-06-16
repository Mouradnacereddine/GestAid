
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Package, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StockAlert {
  id: string;
  type: 'low_stock' | 'overdue_return' | 'maintenance_due';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  articleId?: string;
  created_at: string;
}

export function StockAlerts() {
  const { toast } = useToast();

  const { data: overdueLoans } = useQuery({
    queryKey: ['overdue-loans'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('loans')
        .select(`
          *,
          beneficiaries(first_name, last_name),
          loan_articles(articles(name, identifier))
        `)
        .is('actual_return_date', null)
        .lt('expected_return_date', today);
      
      if (error) throw error;
      return data;
    },
  });

  const { data: maintenanceArticles } = useQuery({
    queryKey: ['maintenance-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'en_maintenance');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: articleCounts } = useQuery({
    queryKey: ['article-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('status')
        .eq('status', 'disponible');
      
      if (error) throw error;
      return data;
    },
  });

  const generateAlerts = (): StockAlert[] => {
    const alerts: StockAlert[] = [];

    // Alertes de retours en retard
    overdueLoans?.forEach((loan) => {
      const expectedReturn = new Date(loan.expected_return_date);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - expectedReturn.getTime()) / (1000 * 60 * 60 * 24));
      
      alerts.push({
        id: `overdue-${loan.id}`,
        type: 'overdue_return',
        title: 'Retour en retard',
        description: `Prêt ${loan.loan_number} - Retard de ${daysDiff} jour(s)`,
        severity: daysDiff > 7 ? 'high' : 'medium',
        created_at: loan.expected_return_date
      });
    });

    // Alertes de maintenance
    maintenanceArticles?.forEach((article) => {
      alerts.push({
        id: `maintenance-${article.id}`,
        type: 'maintenance_due',
        title: 'Maintenance requise',
        description: `${article.name} (${article.identifier}) nécessite une maintenance`,
        severity: 'medium',
        articleId: article.identifier,
        created_at: article.updated_at || article.created_at
      });
    });

    // Alerte de stock faible (si moins de 3 articles disponibles)
    const availableCount = articleCounts?.length || 0;
    if (availableCount < 3) {
      alerts.push({
        id: 'low-stock',
        type: 'low_stock',
        title: 'Stock faible',
        description: `Seulement ${availableCount} articles disponibles`,
        severity: 'medium',
        created_at: new Date().toISOString()
      });
    }

    return alerts;
  };

  const alerts = generateAlerts();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'low_stock': return Package;
      case 'overdue_return': return Clock;
      case 'maintenance_due': return AlertTriangle;
      default: return AlertTriangle;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'high': return 'Urgent';
      case 'medium': return 'Important';
      case 'low': return 'À surveiller';
      default: return 'Normal';
    }
  };

  const handleAlertAction = (alert: StockAlert) => {
    switch (alert.type) {
      case 'overdue_return':
        toast({
          title: "Action requise",
          description: "Contactez le bénéficiaire pour le retour"
        });
        break;
      case 'low_stock':
        toast({
          title: "Stock faible",
          description: "Envisagez de solliciter de nouveaux dons"
        });
        break;
      case 'maintenance_due':
        toast({
          title: "Maintenance",
          description: "Planifiez la maintenance de l'article"
        });
        break;
    }
  };

  const dismissAlert = (alertId: string) => {
    toast({
      title: "Alerte notée",
      description: "L'alerte a été prise en compte"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Alertes Stock ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Aucune alerte</p>
              <p className="text-sm">Tout est en ordre</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const IconComponent = getAlertIcon(alert.type);
              return (
                <div
                  key={alert.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4 text-gray-600" />
                      <span className="font-medium text-sm">{alert.title}</span>
                      <Badge className={`text-white text-xs ${getSeverityColor(alert.severity)}`}>
                        {getSeverityLabel(alert.severity)}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(alert.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {alert.description}
                  </p>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAlertAction(alert)}
                      className="bg-humanitarian-blue hover:bg-blue-700"
                    >
                      Traiter
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => dismissAlert(alert.id)}
                    >
                      Noter
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}

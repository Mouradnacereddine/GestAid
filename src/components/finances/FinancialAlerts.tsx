
import React from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrency } from '@/utils/currency';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, TrendingUp, Info, CheckCircle } from 'lucide-react';

export function FinancialAlerts() {
  const { currency } = useCurrency();
  const { data: transactions } = useQuery({
    queryKey: ['financial-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .order('transaction_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Calculs pour les alertes
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthTransactions = transactions?.filter(t => {
    const date = new Date(t.transaction_date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }) || [];

  const totalRevenue = currentMonthTransactions
    .filter(t => t.type === 'entree')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = currentMonthTransactions
    .filter(t => t.type === 'sortie')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalRevenue - totalExpenses;
  const expenseRatio = totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0;

  // Analyse des catégories de dépenses
  const expensesByCategory = currentMonthTransactions
    .filter(t => t.type === 'sortie')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const topExpenseCategory = Object.entries(expensesByCategory)
    .sort(([,a], [,b]) => b - a)[0];

  // Génération des alertes
  const alerts = [];

  // Alerte solde négatif
  if (balance < 0) {
    alerts.push({
      type: 'error',
      icon: AlertTriangle,
      title: 'Solde négatif',
      description: `Le solde mensuel est de ${formatCurrency(balance, currency)}. Attention aux liquidités.`,
      severity: 'high'
    });
  }

  // Alerte ratio dépenses/recettes élevé
  if (expenseRatio > 90 && totalRevenue > 0) {
    alerts.push({
      type: 'warning',
      icon: TrendingDown,
      title: 'Ratio dépenses élevé',
      description: `Les dépenses représentent ${expenseRatio.toFixed(1)}% des recettes ce mois-ci.`,
      severity: 'medium'
    });
  }

  // Alerte catégorie de dépense dominante
  if (topExpenseCategory && topExpenseCategory[1] > totalExpenses * 0.4) {
    alerts.push({
      type: 'info',
      icon: Info,
      title: 'Catégorie de dépense importante',
      description: `${topExpenseCategory[0]} représente ${((topExpenseCategory[1] / totalExpenses) * 100).toFixed(1)}% des dépenses totales.`,
      severity: 'low'
    });
  }

  // Alerte solde positif et équilibré
  if (balance > 0 && expenseRatio < 80 && totalRevenue > 0) {
    alerts.push({
      type: 'success',
      icon: CheckCircle,
      title: 'Situation financière saine',
      description: `Solde positif de ${formatCurrency(balance, currency)} avec un ratio dépenses/recettes de ${expenseRatio.toFixed(1)}%.`,
      severity: 'positive'
    });
  }

  // Alerte pas de transactions
  if (currentMonthTransactions.length === 0) {
    alerts.push({
      type: 'info',
      icon: Info,
      title: 'Aucune transaction ce mois-ci',
      description: 'Aucune transaction financière enregistrée pour le mois en cours.',
      severity: 'low'
    });
  }

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'error': return 'destructive';
      case 'warning': return 'default';
      case 'success': return 'default';
      default: return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'positive': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Alertes et Indicateurs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.length === 0 ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Aucune alerte particulière pour le moment.
            </AlertDescription>
          </Alert>
        ) : (
          alerts.map((alert, index) => (
            <Alert key={index} variant={getAlertVariant(alert.type)}>
              <alert.icon className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{alert.title}</div>
                  <div className="text-sm mt-1">{alert.description}</div>
                </div>
                <Badge className={getSeverityColor(alert.severity)}>
                  {alert.severity === 'high' && 'Critique'}
                  {alert.severity === 'medium' && 'Important'}
                  {alert.severity === 'low' && 'Info'}
                  {alert.severity === 'positive' && 'Positif'}
                </Badge>
              </AlertDescription>
            </Alert>
          ))
        )}

        {/* Métriques rapides */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {currentMonthTransactions.length}
            </div>
            <div className="text-sm text-gray-600">Transactions ce mois</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {expenseRatio.toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">Ratio dépenses/recettes</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

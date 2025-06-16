
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FileText, Download, Calendar as CalendarIcon, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

export function ReportGenerator() {
  const [reportType, setReportType] = useState('');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [showFromCalendar, setShowFromCalendar] = useState(false);
  const [showToCalendar, setShowToCalendar] = useState(false);

  // Fetch data for report statistics
  const { data: stats } = useQuery({
    queryKey: ['report-stats'],
    queryFn: async () => {
      const [articlesRes, loansRes, beneficiariesRes, transactionsRes] = await Promise.all([
        supabase.from('articles').select('id, status, created_at'),
        supabase.from('loans').select('id, loan_date, actual_return_date'),
        supabase.from('beneficiaries').select('id, created_at'),
        supabase.from('financial_transactions').select('id, amount, type, transaction_date')
      ]);

      return {
        articles: articlesRes.data || [],
        loans: loansRes.data || [],
        beneficiaries: beneficiariesRes.data || [],
        transactions: transactionsRes.data || []
      };
    },
  });

  const reportTypes = [
    { id: 'articles', name: 'Rapport des Articles', description: 'État du stock et des articles' },
    { id: 'loans', name: 'Rapport des Prêts', description: 'Historique et statistiques des prêts' },
    { id: 'beneficiaries', name: 'Rapport des Bénéficiaires', description: 'Liste et activité des bénéficiaires' },
    { id: 'financial', name: 'Rapport Financier', description: 'Transactions et bilans financiers' },
    { id: 'activity', name: 'Rapport d\'Activité', description: 'Aperçu global de l\'activité' },
    { id: 'donors', name: 'Rapport des Donateurs', description: 'Statistiques des donations' }
  ];

  const generateReport = async () => {
    if (!reportType) {
      toast.error('Veuillez sélectionner un type de rapport');
      return;
    }

    const fromDate = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : '';
    const toDate = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : '';

    try {
      let reportData: any = {};
      let fileName = '';

      switch (reportType) {
        case 'articles':
          const { data: articles } = await supabase
            .from('articles')
            .select(`
              *,
              donors(name)
            `)
            .gte('created_at', fromDate || '1900-01-01')
            .lte('created_at', toDate || '2099-12-31');
          
          reportData = {
            type: 'Rapport des Articles',
            period: `${fromDate || 'Début'} au ${toDate || 'Fin'}`,
            totalArticles: articles?.length || 0,
            availableArticles: articles?.filter(a => a.status === 'disponible').length || 0,
            loanedArticles: articles?.filter(a => a.status === 'en_pret').length || 0,
            maintenanceArticles: articles?.filter(a => a.status === 'en_maintenance').length || 0,
            articles: articles || []
          };
          fileName = `rapport-articles-${Date.now()}.json`;
          break;

        case 'loans':
          const { data: loans } = await supabase
            .from('loans')
            .select(`
              *,
              beneficiaries(first_name, last_name),
              loan_articles(articles(name, identifier))
            `)
            .gte('loan_date', fromDate || '1900-01-01')
            .lte('loan_date', toDate || '2099-12-31');
          
          reportData = {
            type: 'Rapport des Prêts',
            period: `${fromDate || 'Début'} au ${toDate || 'Fin'}`,
            totalLoans: loans?.length || 0,
            activeLoans: loans?.filter(l => !l.actual_return_date).length || 0,
            returnedLoans: loans?.filter(l => l.actual_return_date).length || 0,
            loans: loans || []
          };
          fileName = `rapport-prets-${Date.now()}.json`;
          break;

        case 'beneficiaries':
          const { data: beneficiaries } = await supabase
            .from('beneficiaries')
            .select('*')
            .gte('created_at', fromDate || '1900-01-01')
            .lte('created_at', toDate || '2099-12-31');
          
          reportData = {
            type: 'Rapport des Bénéficiaires',
            period: `${fromDate || 'Début'} au ${toDate || 'Fin'}`,
            totalBeneficiaries: beneficiaries?.length || 0,
            newBeneficiaries: beneficiaries?.filter(b => 
              new Date(b.created_at) >= (dateRange.from || new Date('1900-01-01'))
            ).length || 0,
            beneficiaries: beneficiaries || []
          };
          fileName = `rapport-beneficiaires-${Date.now()}.json`;
          break;

        case 'financial':
          const { data: transactions } = await supabase
            .from('financial_transactions')
            .select('*')
            .gte('transaction_date', fromDate || '1900-01-01')
            .lte('transaction_date', toDate || '2099-12-31');
          
          const totalRevenue = transactions?.filter(t => t.type === 'entree').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
          const totalExpenses = transactions?.filter(t => t.type === 'sortie').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
          
          reportData = {
            type: 'Rapport Financier',
            period: `${fromDate || 'Début'} au ${toDate || 'Fin'}`,
            totalTransactions: transactions?.length || 0,
            totalRevenue,
            totalExpenses,
            balance: totalRevenue - totalExpenses,
            transactions: transactions || []
          };
          fileName = `rapport-financier-${Date.now()}.json`;
          break;

        case 'activity':
          reportData = {
            type: 'Rapport d\'Activité Global',
            period: `${fromDate || 'Début'} au ${toDate || 'Fin'}`,
            totalArticles: stats?.articles.length || 0,
            totalLoans: stats?.loans.length || 0,
            totalBeneficiaries: stats?.beneficiaries.length || 0,
            totalTransactions: stats?.transactions.length || 0,
            generatedAt: new Date().toISOString()
          };
          fileName = `rapport-activite-${Date.now()}.json`;
          break;

        case 'donors':
          const { data: donors } = await supabase
            .from('donors')
            .select(`
              *,
              donations(amount, donation_date)
            `);
          
          reportData = {
            type: 'Rapport des Donateurs',
            period: `${fromDate || 'Début'} au ${toDate || 'Fin'}`,
            totalDonors: donors?.length || 0,
            totalDonations: donors?.reduce((sum, d) => sum + (d.donations?.length || 0), 0) || 0,
            donors: donors || []
          };
          fileName = `rapport-donateurs-${Date.now()}.json`;
          break;
      }

      // Create and download the report
      const content = JSON.stringify(reportData, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Rapport généré et téléchargé avec succès');
      
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      toast.error('Erreur lors de la génération du rapport');
    }
  };

  const selectedReportType = reportTypes.find(r => r.id === reportType);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Générateur de Rapports
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Type de rapport</label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un type de rapport" />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  <div className="flex flex-col">
                    <span>{type.name}</span>
                    <span className="text-xs text-gray-500">{type.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Période (optionnel)</label>
          <div className="flex gap-4">
            <div className="flex-1">
              <Popover open={showFromCalendar} onOpenChange={setShowFromCalendar}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? format(dateRange.from, 'dd/MM/yyyy', { locale: fr }) : 'Date de début'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => {
                      setDateRange({ ...dateRange, from: date });
                      setShowFromCalendar(false);
                    }}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex-1">
              <Popover open={showToCalendar} onOpenChange={setShowToCalendar}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.to ? format(dateRange.to, 'dd/MM/yyyy', { locale: fr }) : 'Date de fin'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => {
                      setDateRange({ ...dateRange, to: date });
                      setShowToCalendar(false);
                    }}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Report Preview */}
        {selectedReportType && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Aperçu du rapport</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Type:</strong> {selectedReportType.name}</p>
              <p><strong>Description:</strong> {selectedReportType.description}</p>
              <p><strong>Période:</strong> {
                dateRange.from && dateRange.to 
                  ? `${format(dateRange.from, 'dd/MM/yyyy', { locale: fr })} au ${format(dateRange.to, 'dd/MM/yyyy', { locale: fr })}`
                  : 'Toutes les données'
              }</p>
            </div>
          </div>
        )}

        {/* Statistics Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.articles.length}</div>
              <div className="text-sm text-blue-800">Articles</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{stats.loans.length}</div>
              <div className="text-sm text-green-800">Prêts</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.beneficiaries.length}</div>
              <div className="text-sm text-purple-800">Bénéficiaires</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.transactions.length}</div>
              <div className="text-sm text-orange-800">Transactions</div>
            </div>
          </div>
        )}

        {/* Generate Report Button */}
        <div className="flex gap-2">
          <Button 
            onClick={generateReport}
            className="bg-humanitarian-blue hover:bg-blue-700 flex-1"
            disabled={!reportType}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Générer le Rapport
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => {
              setReportType('');
              setDateRange({});
            }}
          >
            Réinitialiser
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

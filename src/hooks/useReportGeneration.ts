
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { exportReportData } from '@/utils/reportExport';
import { toast } from 'sonner';

export function useReportGeneration() {
  const generateReport = async (
    reportType: string,
    dateRange: { from?: Date; to?: Date },
    exportFormat: 'french' | 'international'
  ) => {
    if (!reportType) {
      toast.error('Veuillez sélectionner un type de rapport');
      return;
    }

    const fromDate = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : '';
    const toDate = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : '';

    try {
      let reportData: any = {};

      switch (reportType) {
        case 'articles':
          const { data: articles } = await supabase
            .from('articles')
            .select(`*, categories(name), donors(name)`)
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
          break;

        case 'loans':
          const { data: loans } = await supabase
            .from('loans')
            .select(`*, beneficiaries(first_name, last_name), loan_articles(articles(name, identifier))`)
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
          break;

        case 'donors':
          const { data: donors } = await supabase
            .from('donors')
            .select(`*, donations(amount, donation_date)`);
          
          reportData = {
            type: 'Rapport des Donateurs',
            period: `${fromDate || 'Début'} au ${toDate || 'Fin'}`,
            totalDonors: donors?.length || 0,
            totalDonations: donors?.reduce((sum, d) => sum + (d.donations?.length || 0), 0) || 0,
            donors: donors || []
          };
          break;

        default:
          // Get stats for activity report
          const [articlesRes, loansRes, beneficiariesRes, transactionsRes] = await Promise.all([
            supabase.from('articles').select('id, status, created_at'),
            supabase.from('loans').select('id, loan_date, actual_return_date'),
            supabase.from('beneficiaries').select('id, created_at'),
            supabase.from('financial_transactions').select('id, amount, type, transaction_date')
          ]);

          reportData = {
            type: 'Rapport d\'Activité Global',
            period: `${fromDate || 'Début'} au ${toDate || 'Fin'}`,
            totalArticles: articlesRes.data?.length || 0,
            totalLoans: loansRes.data?.length || 0,
            totalBeneficiaries: beneficiariesRes.data?.length || 0,
            totalTransactions: transactionsRes.data?.length || 0,
            generatedAt: new Date().toISOString()
          };
      }

      exportReportData(reportData, exportFormat);
      toast.success('Rapport généré et téléchargé avec succès');
      
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      toast.error('Erreur lors de la génération du rapport');
    }
  };

  return { generateReport };
}


import { format } from 'date-fns';

type ExportFormat = 'french' | 'international';

interface BaseReportData {
  type: string;
  period: string;
  generatedAt?: string;
  [key: string]: any;
}

export function exportReportData(reportData: BaseReportData, exportFormat: ExportFormat) {
  console.log('=== Report Export Start ===');
  console.log('Report data to export:', reportData);
  console.log('Export format:', exportFormat);

  const formatConfig = {
    french: {
      separator: ';',
      decimalSeparator: ',',
      bom: '\ufeff',
      dateFormat: 'fr-FR'
    },
    international: {
      separator: ',',
      decimalSeparator: '.',
      bom: '',
      dateFormat: 'en-US'
    }
  };

  const config = formatConfig[exportFormat];
  const isInternational = exportFormat === 'international';

  let csvContent = '';
  let fileName = '';

  // Génération du contenu CSV selon le type de rapport
  switch (reportData.type) {
    case 'Rapport des Articles':
      csvContent = generateArticlesCSV(reportData, config, isInternational);
      fileName = `rapport_articles_${exportFormat === 'french' ? 'fr' : 'int'}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
      break;

    case 'Rapport des Prêts':
      csvContent = generateLoansCSV(reportData, config, isInternational);
      fileName = `rapport_prets_${exportFormat === 'french' ? 'fr' : 'int'}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
      break;

    case 'Rapport des Bénéficiaires':
      csvContent = generateBeneficiariesCSV(reportData, config, isInternational);
      fileName = `rapport_beneficiaires_${exportFormat === 'french' ? 'fr' : 'int'}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
      break;

    case 'Rapport Financier':
      csvContent = generateFinancialCSV(reportData, config, isInternational);
      fileName = `rapport_financier_${exportFormat === 'french' ? 'fr' : 'int'}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
      break;

    case 'Rapport des Donateurs':
      csvContent = generateDonorsCSV(reportData, config, isInternational);
      fileName = `rapport_donateurs_${exportFormat === 'french' ? 'fr' : 'int'}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
      break;

    default:
      csvContent = generateActivityCSV(reportData, config, isInternational);
      fileName = `rapport_activite_${exportFormat === 'french' ? 'fr' : 'int'}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
  }

  // Créer et télécharger le fichier
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('CSV file downloaded:', fileName);
  } else {
    console.error('Download not supported');
  }
}

function generateArticlesCSV(reportData: any, config: any, isInternational: boolean): string {
  const csvRows = [];
  
  // En-têtes
  const headers = isInternational 
    ? ['Identifier', 'Name', 'Category', 'Status', 'State', 'Donor', 'Acquisition Date', 'Estimated Value']
    : ['Identifiant', 'Nom', 'Catégorie', 'Statut', 'État', 'Donateur', 'Date d\'acquisition', 'Valeur estimée'];
    
  csvRows.push(headers.join(config.separator));

  // Données
  reportData.articles?.forEach((article: any) => {
    const row = [
      article.identifier || '',
      article.name || '',
      article.categories?.name || (isInternational ? 'Uncategorized' : 'Non catégorisé'),
      article.status || '',
      article.state || '',
      article.donors?.name || '',
      article.acquisition_date ? format(new Date(article.acquisition_date), 'dd/MM/yyyy') : '',
      article.estimated_value ? formatAmount(article.estimated_value, config) : ''
    ];
    
    csvRows.push(escapeCSVRow(row, config).join(config.separator));
  });

  return config.bom + csvRows.join('\n');
}

function generateLoansCSV(reportData: any, config: any, isInternational: boolean): string {
  const csvRows = [];
  
  // En-têtes
  const headers = isInternational 
    ? ['Loan Number', 'Beneficiary', 'Loan Date', 'Expected Return', 'Actual Return', 'Status', 'Articles']
    : ['Numéro de prêt', 'Bénéficiaire', 'Date de prêt', 'Retour prévu', 'Retour effectif', 'Statut', 'Articles'];
    
  csvRows.push(headers.join(config.separator));

  // Données
  reportData.loans?.forEach((loan: any) => {
    const beneficiaryName = `${loan.beneficiaries?.first_name || ''} ${loan.beneficiaries?.last_name || ''}`.trim();
    const articles = loan.loan_articles?.map((la: any) => la.articles?.name).join(', ') || '';
    const status = loan.actual_return_date ? 
      (isInternational ? 'Returned' : 'Retourné') : 
      (isInternational ? 'Active' : 'En cours');
    
    const row = [
      loan.loan_number || '',
      beneficiaryName,
      loan.loan_date ? format(new Date(loan.loan_date), 'dd/MM/yyyy') : '',
      loan.expected_return_date ? format(new Date(loan.expected_return_date), 'dd/MM/yyyy') : '',
      loan.actual_return_date ? format(new Date(loan.actual_return_date), 'dd/MM/yyyy') : '',
      status,
      articles
    ];
    
    csvRows.push(escapeCSVRow(row, config).join(config.separator));
  });

  return config.bom + csvRows.join('\n');
}

function generateBeneficiariesCSV(reportData: any, config: any, isInternational: boolean): string {
  const csvRows = [];
  
  // En-têtes
  const headers = isInternational 
    ? ['First Name', 'Last Name', 'Email', 'Phone', 'Address', 'Registration Date']
    : ['Prénom', 'Nom', 'Email', 'Téléphone', 'Adresse', 'Date d\'inscription'];
    
  csvRows.push(headers.join(config.separator));

  // Données
  reportData.beneficiaries?.forEach((beneficiary: any) => {
    const row = [
      beneficiary.first_name || '',
      beneficiary.last_name || '',
      beneficiary.email || '',
      beneficiary.phone || '',
      beneficiary.address || '',
      beneficiary.created_at ? format(new Date(beneficiary.created_at), 'dd/MM/yyyy') : ''
    ];
    
    csvRows.push(escapeCSVRow(row, config).join(config.separator));
  });

  return config.bom + csvRows.join('\n');
}

function generateFinancialCSV(reportData: any, config: any, isInternational: boolean): string {
  const csvRows = [];
  
  // En-têtes
  const headers = isInternational 
    ? ['Date', 'Type', 'Category', 'Donor', 'Description', 'Amount', 'Debit', 'Credit']
    : ['Date', 'Type', 'Catégorie', 'Donateur', 'Description', 'Montant', 'Débit', 'Crédit'];
    
  csvRows.push(headers.join(config.separator));

  // Données
  reportData.transactions?.forEach((transaction: any) => {
    const typeLabel = transaction.type === 'entree' 
      ? (isInternational ? 'Revenue' : 'Recette') 
      : (isInternational ? 'Expense' : 'Dépense');
    const amount = Number(transaction.amount) || 0;
    const debit = transaction.type === 'sortie' ? amount : '';
    const credit = transaction.type === 'entree' ? amount : '';
    
    const donorName = transaction.type === 'entree' ? (transaction as any)?.donations?.donors?.name || '' : '';

    const row = [
      transaction.transaction_date ? format(new Date(transaction.transaction_date), 'dd/MM/yyyy') : '',
      typeLabel,
      transaction.category || (isInternational ? 'Uncategorized' : 'Non catégorisé'),
      donorName,
      transaction.description || '',
      formatAmount(amount, config),
      formatAmount(debit, config),
      formatAmount(credit, config)
    ];
    
    csvRows.push(escapeCSVRow(row, config).join(config.separator));
  });

  return config.bom + csvRows.join('\n');
}

function generateDonorsCSV(reportData: any, config: any, isInternational: boolean): string {
  const csvRows = [];
  
  // En-têtes
  const headers = isInternational 
    ? ['Name', 'Type', 'Email', 'Phone', 'Address', 'Total Donations', 'Total Amount']
    : ['Nom', 'Type', 'Email', 'Téléphone', 'Adresse', 'Nombre de dons', 'Montant total'];
    
  csvRows.push(headers.join(config.separator));

  // Données
  reportData.donors?.forEach((donor: any) => {
    const totalAmount = donor.donations?.reduce((sum: number, donation: any) => sum + (Number(donation.amount) || 0), 0) || 0;
    
    const row = [
      donor.name || '',
      donor.type || (isInternational ? 'Individual' : 'Particulier'),
      donor.email || '',
      donor.phone || '',
      donor.address || '',
      (donor.donations?.length || 0).toString(),
      formatAmount(totalAmount, config)
    ];
    
    csvRows.push(escapeCSVRow(row, config).join(config.separator));
  });

  return config.bom + csvRows.join('\n');
}

function generateActivityCSV(reportData: any, config: any, isInternational: boolean): string {
  const csvRows = [];
  
  // En-têtes du résumé
  const summaryHeaders = isInternational 
    ? ['Metric', 'Value']
    : ['Métrique', 'Valeur'];
    
  csvRows.push(summaryHeaders.join(config.separator));

  // Données de résumé
  const summaryData = [
    [isInternational ? 'Total Articles' : 'Total Articles', reportData.totalArticles?.toString() || '0'],
    [isInternational ? 'Total Loans' : 'Total Prêts', reportData.totalLoans?.toString() || '0'],
    [isInternational ? 'Total Beneficiaries' : 'Total Bénéficiaires', reportData.totalBeneficiaries?.toString() || '0'],
    [isInternational ? 'Total Transactions' : 'Total Transactions', reportData.totalTransactions?.toString() || '0']
  ];

  summaryData.forEach(row => {
    csvRows.push(escapeCSVRow(row, config).join(config.separator));
  });

  return config.bom + csvRows.join('\n');
}

function formatAmount(value: number | string, config: any): string {
  if (value === '' || value === 0) return '';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return numValue.toFixed(2).replace('.', config.decimalSeparator);
}

function escapeCSVRow(row: string[], config: any): string[] {
  return row.map(field => {
    const fieldStr = String(field);
    if (fieldStr.includes(config.separator) || fieldStr.includes('\n') || fieldStr.includes('\r') || fieldStr.includes('"')) {
      return `"${fieldStr.replace(/"/g, '""')}"`;
    }
    return fieldStr;
  });
}

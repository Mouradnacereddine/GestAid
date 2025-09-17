
import { format } from 'date-fns';

type ExportFormat = 'french' | 'international';

interface Transaction {
  id: string;
  transaction_date: string;
  type: 'entree' | 'sortie';
  category?: string;
  description?: string;
  amount: number;
  donations?: { donors?: { name?: string } };
}

export function exportAccountingData(transactions: Transaction[], exportFormat: ExportFormat) {
  console.log('=== CSV Export Start ===');
  console.log('Transactions to export:', transactions);
  console.log('Export format:', exportFormat);
  
  if (!transactions || transactions.length === 0) {
    console.log('No transactions to export');
    return;
  }

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

  console.log('Using config:', config);

  const csvRows = [];
  
  // En-têtes avec colonne Référence
  const headers = isInternational 
    ? ['Reference', 'Date', 'Type', 'Category', 'Donor', 'Description', 'Amount', 'Debit', 'Credit']
    : ['Référence', 'Date', 'Type', 'Catégorie', 'Donateur', 'Description', 'Montant', 'Débit', 'Crédit'];
    
  csvRows.push(headers.join(config.separator));
  console.log('Headers:', headers);

  // Données avec référence
  transactions.forEach((transaction, index) => {
    console.log(`Processing transaction ${index + 1} for export:`, transaction);
    
    try {
      const formattedDate = format(new Date(transaction.transaction_date), 'dd/MM/yyyy');
      const typeLabel = transaction.type === 'entree' 
        ? (isInternational ? 'Revenue' : 'Recette') 
        : (isInternational ? 'Expense' : 'Dépense');
      const amount = Number(transaction.amount) || 0;
      const debit = transaction.type === 'sortie' ? amount : '';
      const credit = transaction.type === 'entree' ? amount : '';
      const reference = `REF-${transaction.id.slice(0, 8).toUpperCase()}`;
      
      // Formatage des montants selon la locale
      const formatAmount = (value: number | string) => {
        if (value === '' || value === 0) return '';
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        return numValue.toFixed(2).replace('.', config.decimalSeparator);
      };

      const donorName = transaction.type === 'entree' ? (transaction as any)?.donations?.donors?.name || '' : '';

      const rowData = [
        reference,
        formattedDate,
        typeLabel,
        transaction.category || (isInternational ? 'Uncategorized' : 'Non catégorisé'),
        donorName,
        transaction.description || '',
        formatAmount(amount),
        formatAmount(debit),
        formatAmount(credit)
      ];

      // Échapper les données qui contiennent des caractères spéciaux
      const escapedRowData = rowData.map(field => {
        const fieldStr = String(field);
        if (fieldStr.includes(config.separator) || fieldStr.includes('\n') || fieldStr.includes('\r') || fieldStr.includes('"')) {
          return `"${fieldStr.replace(/"/g, '""')}"`;
        }
        return fieldStr;
      });

      csvRows.push(escapedRowData.join(config.separator));
      console.log(`Row ${index + 1} data:`, escapedRowData);
      
    } catch (error) {
      console.error(`Error processing transaction ${index + 1}:`, error);
    }
  });

  const csvContent = config.bom + csvRows.join('\n');
  console.log('Final CSV content length:', csvContent.length);
  console.log('CSV preview (first 200 chars):', csvContent.substring(0, 200));

  // Créer et télécharger le fichier
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const formatLabel = exportFormat === 'french' ? 'fr' : 'int';
    const filename = `export_comptable_${formatLabel}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('CSV file downloaded:', filename);
  } else {
    console.error('Download not supported');
  }
}

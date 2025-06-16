
import { useMemo } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Transaction {
  id: string;
  type: 'entree' | 'sortie';
  amount: number;
  category?: string;
  description?: string;
  transaction_date: string;
}

export function useFinancialCalculations(transactions?: Transaction[]) {
  // Calculs des métriques avec logs détaillés
  const totalRevenue = useMemo(() => {
    const revenues = transactions?.filter(t => t.type === 'entree') || [];
    console.log('Revenue transactions:', revenues);
    const total = revenues.reduce((sum, t) => {
      const amount = Number(t.amount);
      console.log(`Adding revenue: ${amount} from transaction:`, t);
      return sum + amount;
    }, 0);
    console.log('Total revenue calculated:', total);
    return total;
  }, [transactions]);

  const totalExpenses = useMemo(() => {
    const expenses = transactions?.filter(t => t.type === 'sortie') || [];
    console.log('Expense transactions:', expenses);
    const total = expenses.reduce((sum, t) => {
      const amount = Number(t.amount);
      console.log(`Adding expense: ${amount} from transaction:`, t);
      return sum + amount;
    }, 0);
    console.log('Total expenses calculated:', total);
    return total;
  }, [transactions]);

  const netResult = totalRevenue - totalExpenses;
  console.log('Net result:', netResult);

  // Données par catégorie - logique corrigée
  const categoryData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      console.log('No transactions available for category calculation');
      return [];
    }

    console.log('Processing transactions for categories:', transactions);

    const categoryMap = new Map<string, { recettes: number; depenses: number }>();

    // Traiter chaque transaction
    transactions.forEach(transaction => {
      const category = transaction.category || 'Non catégorisé';
      const amount = Number(transaction.amount) || 0;
      
      console.log(`Processing transaction for category "${category}":`, {
        type: transaction.type,
        amount: amount,
        originalAmount: transaction.amount
      });
      
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { recettes: 0, depenses: 0 });
      }

      const categoryStats = categoryMap.get(category)!;
      
      if (transaction.type === 'entree') {
        categoryStats.recettes += amount;
        console.log(`Added ${amount} to recettes for category "${category}". New total: ${categoryStats.recettes}`);
      } else if (transaction.type === 'sortie') {
        categoryStats.depenses += amount;
        console.log(`Added ${amount} to depenses for category "${category}". New total: ${categoryStats.depenses}`);
      }
    });

    // Convertir en tableau et calculer les totaux
    const result = Array.from(categoryMap.entries()).map(([category, stats]) => {
      const categoryResult = {
        category,
        recettes: stats.recettes,
        depenses: stats.depenses,
        total: stats.recettes - stats.depenses,
        type: stats.recettes > stats.depenses ? 'entree' : 'sortie'
      };
      console.log(`Final category result for "${category}":`, categoryResult);
      return categoryResult;
    }).sort((a, b) => Math.abs(b.total) - Math.abs(a.total));

    console.log('Final calculated category data:', result);
    return result;
  }, [transactions]);

  // Évolution mensuelle
  const monthlyEvolution = transactions?.reduce((acc, t) => {
    const month = format(new Date(t.transaction_date), 'yyyy-MM');
    const existing = acc.find(item => item.month === month);
    
    if (existing) {
      if (t.type === 'entree') {
        existing.recettes += Number(t.amount);
      } else {
        existing.depenses += Number(t.amount);
      }
      existing.solde = existing.recettes - existing.depenses;
    } else {
      acc.push({
        month,
        monthLabel: format(new Date(t.transaction_date), 'MMM yyyy', { locale: fr }),
        recettes: t.type === 'entree' ? Number(t.amount) : 0,
        depenses: t.type === 'sortie' ? Number(t.amount) : 0,
        solde: t.type === 'entree' ? Number(t.amount) : -Number(t.amount)
      });
    }
    return acc;
  }, [] as Array<{ month: string; monthLabel: string; recettes: number; depenses: number; solde: number }>)
  .sort((a, b) => a.month.localeCompare(b.month)) || [];

  // Répartition des dépenses pour le graphique en secteurs
  const expenseDistribution = transactions?.filter(t => t.type === 'sortie')
    .reduce((acc, t) => {
      const existing = acc.find(item => item.name === t.category);
      if (existing) {
        existing.value += Number(t.amount);
      } else {
        acc.push({ name: t.category, value: Number(t.amount) });
      }
      return acc;
    }, [] as Array<{ name: string; value: number }>)
    .sort((a, b) => b.value - a.value) || [];

  return {
    totalRevenue,
    totalExpenses,
    netResult,
    categoryData,
    monthlyEvolution,
    expenseDistribution
  };
}

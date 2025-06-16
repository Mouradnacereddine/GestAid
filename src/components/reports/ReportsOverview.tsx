
import React from 'react';
import { StatsCard } from "@/components/StatsCard";
import { Package, Users, HandHeart, AlertCircle } from "lucide-react";
import { useReportsData } from './ReportsDataProvider';

export function ReportsOverview() {
  const { stats } = useReportsData();
  
  console.log('ReportsOverview stats:', stats);
  
  const availableArticles = stats?.articles.filter(a => a.status === 'disponible').length || 0;
  const activeLoans = stats?.loans.filter(l => !l.actual_return_date).length || 0;
  const overdueLoans = stats?.loans.filter(l => 
    !l.actual_return_date && new Date(l.expected_return_date) < new Date()
  ).length || 0;

  // Calculer les vraies tendances basées sur les données du mois précédent
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const lastMonthLoans = stats?.loans.filter(l => {
    const loanDate = new Date(l.loan_date);
    return loanDate.getMonth() === lastMonth && loanDate.getFullYear() === lastMonthYear;
  }).length || 0;

  const currentMonthLoans = stats?.loans.filter(l => {
    const loanDate = new Date(l.loan_date);
    return loanDate.getMonth() === currentMonth && loanDate.getFullYear() === currentYear;
  }).length || 0;

  const loanTrend = lastMonthLoans > 0 
    ? Math.round(((currentMonthLoans - lastMonthLoans) / lastMonthLoans) * 100)
    : 0;

  const overdueTrend = overdueLoans > 0 && activeLoans > 0
    ? Math.round((overdueLoans / activeLoans) * 100)
    : 0;

  // Create trend objects safely
  const articlesTrend = (availableArticles > 0 && stats?.articles && stats.articles.length > 0) ? { 
    value: Math.round((availableArticles / stats.articles.length) * 100), 
    isPositive: true 
  } : undefined;

  const loansTrend = (loanTrend !== 0) ? { 
    value: Math.abs(loanTrend), 
    isPositive: loanTrend > 0 
  } : undefined;

  const beneficiariesTrend = (stats?.beneficiaries && stats.beneficiaries.length > 0) ? { 
    value: stats.beneficiaries.length, 
    isPositive: true 
  } : undefined;

  const overdueTrendObj = (overdueTrend > 0) ? { 
    value: overdueTrend, 
    isPositive: false 
  } : undefined;

  console.log('Trend objects:', {
    articlesTrend,
    loansTrend,
    beneficiariesTrend,
    overdueTrendObj
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCard
        title="Articles disponibles"
        value={availableArticles.toString()}
        description="prêts à être empruntés"
        icon={Package}
        trend={articlesTrend}
      />
      
      <StatsCard
        title="Prêts actifs"
        value={activeLoans.toString()}
        description="en cours"
        icon={HandHeart}
        trend={loansTrend}
      />
      
      <StatsCard
        title="Bénéficiaires actifs"
        value={stats?.beneficiaries.length.toString() || '0'}
        description="total enregistrés"
        icon={Users}
        trend={beneficiariesTrend}
      />
      
      <StatsCard
        title="Retards"
        value={overdueLoans.toString()}
        description="prêts en retard"
        icon={AlertCircle}
        trend={overdueTrendObj}
      />
    </div>
  );
}

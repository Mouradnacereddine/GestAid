import React from 'react';
import { StatsCard } from '@/components/StatsCard';
import { QuickActions } from '@/components/QuickActions';
import { RecentActivity } from '@/components/RecentActivity';
import { Package, Users, FileText, Heart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function Dashboard() {
  const { data: articlesCount } = useQuery({
    queryKey: ['articles-count'],
    queryFn: async () => {
      const { count, error, data } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: false });
      console.log('Articles data:', data, 'Error:', error, 'Count:', count);
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: beneficiariesCount } = useQuery({
    queryKey: ['beneficiaries-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('beneficiaries')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: activeLoansCount } = useQuery({
    queryKey: ['active-loans-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('loans')
        .select('*', { count: 'exact', head: true })
        .is('actual_return_date', null);
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: donorsCount } = useQuery({
    queryKey: ['donors-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('donors')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: availableArticlesCount } = useQuery({
    queryKey: ['available-articles-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'disponible');
      if (error) throw error;
      return count || 0;
    },
  });

  // Calculate real trends based on data (monthly comparison)
  const { data: monthlyStats } = useQuery({
    queryKey: ['monthly-stats'],
    queryFn: async () => {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      // Get current month and last month data
      const [articlesRes, loansRes, beneficiariesRes, donorsRes] = await Promise.all([
        supabase.from('articles').select('created_at'),
        supabase.from('loans').select('loan_date'),
        supabase.from('beneficiaries').select('created_at'),
        supabase.from('donors').select('created_at')
      ]);

      const articles = articlesRes.data || [];
      const loans = loansRes.data || [];
      const beneficiaries = beneficiariesRes.data || [];
      const donors = donorsRes.data || [];

      // Count items created in current month
      const currentMonthArticles = articles.filter(item => {
        const date = new Date(item.created_at);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }).length;

      const currentMonthLoans = loans.filter(item => {
        const date = new Date(item.loan_date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }).length;

      const currentMonthBeneficiaries = beneficiaries.filter(item => {
        const date = new Date(item.created_at);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }).length;

      const currentMonthDonors = donors.filter(item => {
        const date = new Date(item.created_at);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }).length;

      // Count items created in last month
      const lastMonthArticles = articles.filter(item => {
        const date = new Date(item.created_at);
        return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
      }).length;

      const lastMonthLoans = loans.filter(item => {
        const date = new Date(item.loan_date);
        return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
      }).length;

      const lastMonthBeneficiaries = beneficiaries.filter(item => {
        const date = new Date(item.created_at);
        return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
      }).length;

      const lastMonthDonors = donors.filter(item => {
        const date = new Date(item.created_at);
        return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
      }).length;

      // Calculate trends (percentage change) - only show if there's meaningful data
      const calculateTrend = (current: number, previous: number) => {
        // Don't show trend if no previous data and current data is minimal
        if (previous === 0 && current <= 2) return undefined;
        // Don't show trend if both values are 0
        if (previous === 0 && current === 0) return undefined;
        // Calculate normal percentage change
        if (previous === 0) return { value: 100, isPositive: true };
        
        const change = ((current - previous) / previous) * 100;
        // Only show significant changes (> 5%)
        if (Math.abs(change) < 5) return undefined;
        
        return {
          value: Math.abs(Math.round(change)),
          isPositive: change >= 0
        };
      };

      return {
        articles: calculateTrend(currentMonthArticles, lastMonthArticles),
        loans: calculateTrend(currentMonthLoans, lastMonthLoans),
        beneficiaries: calculateTrend(currentMonthBeneficiaries, lastMonthBeneficiaries),
        donors: calculateTrend(currentMonthDonors, lastMonthDonors)
      };
    },
  });

  const statsData = [
    {
      title: "Articles Total",
      value: articlesCount?.toString() || "0",
      description: `${availableArticlesCount || 0} disponibles`,
      icon: Package
    },
    {
      title: "Bénéficiaires",
      value: beneficiariesCount?.toString() || "0",
      description: "Personnes enregistrées",
      icon: Users,
      trend: monthlyStats?.beneficiaries
    },
    {
      title: "Prêts Actifs",
      value: activeLoansCount?.toString() || "0",
      description: "En cours actuellement",
      icon: FileText
    },
    {
      title: "Donateurs",
      value: donorsCount?.toString() || "0",
      description: "Personnes et organisations",
      icon: Heart,
      trend: monthlyStats?.donors
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
        <p className="text-gray-600">Vue d'ensemble de votre système de prêt humanitaire.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne Principale */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {statsData.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </div>
          <RecentActivity />
        </div>

        {/* Colonne Latérale */}
        <div className="lg:col-span-1 space-y-6">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}

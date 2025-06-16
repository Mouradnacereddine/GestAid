
import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ReportsData {
  articles: any[];
  loans: any[];
  beneficiaries: any[];
  donors: any[];
}

interface ReportsContextType {
  stats: ReportsData | undefined;
  refetch: () => void;
  isLoading: boolean;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

interface ReportsDataProviderProps {
  children: ReactNode;
  reportType: string;
  period: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

export function ReportsDataProvider({ 
  children, 
  reportType, 
  period, 
  dateRange 
}: ReportsDataProviderProps) {
  const { data: stats, refetch, isLoading } = useQuery({
    queryKey: ['reports-stats', reportType, period, dateRange],
    queryFn: async () => {
      const [articlesResult, loansResult, beneficiariesResult, donorsResult] = await Promise.all([
        supabase.from('articles').select('*'),
        supabase.from('loans').select('*'),
        supabase.from('beneficiaries').select('*'),
        supabase.from('donors').select('*')
      ]);

      return {
        articles: articlesResult.data || [],
        loans: loansResult.data || [],
        beneficiaries: beneficiariesResult.data || [],
        donors: donorsResult.data || []
      };
    },
  });

  return (
    <ReportsContext.Provider value={{ stats, refetch, isLoading }}>
      {children}
    </ReportsContext.Provider>
  );
}

export function useReportsData() {
  const context = useContext(ReportsContext);
  if (context === undefined) {
    throw new Error('useReportsData must be used within a ReportsDataProvider');
  }
  return context;
}

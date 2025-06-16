
import React from 'react';

interface ReportStatsOverviewProps {
  stats: {
    articles: any[];
    loans: any[];
    beneficiaries: any[];
    transactions: any[];
  } | undefined;
}

export function ReportStatsOverview({ stats }: ReportStatsOverviewProps) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-blue-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-blue-600">{stats.articles.length}</div>
        <div className="text-sm text-blue-800">Articles</div>
      </div>
      <div className="bg-green-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-green-600">{stats.loans.length}</div>
        <div className="text-sm text-green-800">Prêts</div>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-purple-600">{stats.beneficiaries.length}</div>
        <div className="text-sm text-purple-800">Bénéficiaires</div>
      </div>
      <div className="bg-orange-50 p-4 rounded-lg text-center">
        <div className="text-2xl font-bold text-orange-600">{stats.transactions.length}</div>
        <div className="text-sm text-orange-800">Transactions</div>
      </div>
    </div>
  );
}

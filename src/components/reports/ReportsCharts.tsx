
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { useReportsData } from './ReportsDataProvider';

export function ReportsCharts() {
  const { stats } = useReportsData();

  // Données pour le graphique en secteurs des statuts d'articles
  const articleStatusData = React.useMemo(() => {
    if (!stats?.articles) return [];
    
    const statusCounts = stats.articles.reduce((acc: any, article) => {
      acc[article.status] = (acc[article.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status === 'disponible' ? 'Disponible' : 
            status === 'en_pret' ? 'En prêt' :
            status === 'en_maintenance' ? 'En maintenance' : 'Hors service',
      value: count,
      color: status === 'disponible' ? '#22c55e' : 
             status === 'en_pret' ? '#3b82f6' :
             status === 'en_maintenance' ? '#f59e0b' : '#ef4444'
    }));
  }, [stats?.articles]);

  // Données pour l'évolution des prêts sur les 6 derniers mois
  const loanTrendData = React.useMemo(() => {
    if (!stats?.loans) return [];
    
    const now = new Date();
    const monthsData = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7);
      const monthName = date.toLocaleString('fr-FR', { month: 'short', year: 'numeric' });
      
      const loansInMonth = stats.loans.filter(loan => 
        loan.loan_date && loan.loan_date.startsWith(monthKey)
      ).length;
      
      const returnsInMonth = stats.loans.filter(loan => 
        loan.actual_return_date && loan.actual_return_date.startsWith(monthKey)
      ).length;
      
      monthsData.push({
        month: monthName,
        prêts: loansInMonth,
        retours: returnsInMonth
      });
    }
    
    return monthsData;
  }, [stats?.loans]);

  // Données pour la répartition par état des articles
  const articleStateData = React.useMemo(() => {
    if (!stats?.articles) return [];
    
    const stateCounts = stats.articles.reduce((acc: any, article) => {
      acc[article.state] = (acc[article.state] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(stateCounts).map(([state, count]) => ({
      état: state === 'neuf' ? 'Neuf' :
            state === 'tres_bon' ? 'Très bon' :
            state === 'bon' ? 'Bon' :
            state === 'usage' ? 'Usagé' : 'À réparer',
      nombre: count
    }));
  }, [stats?.articles]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Répartition des articles par statut</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{}}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={articleStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {articleStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Évolution des prêts et retours</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{}}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={loanTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line type="monotone" dataKey="prêts" stroke="#3b82f6" strokeWidth={2} name="Nouveaux prêts" />
                <Line type="monotone" dataKey="retours" stroke="#22c55e" strokeWidth={2} name="Retours" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Répartition par état des articles</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{}}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={articleStateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="état" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="nombre" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statistiques détaillées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="font-medium text-green-800">Taux de retour à temps</span>
              <span className="text-2xl font-bold text-green-600">
                {stats?.loans ? Math.round((stats.loans.filter(l => l.actual_return_date && new Date(l.actual_return_date) <= new Date(l.expected_return_date)).length / stats.loans.length) * 100) : 0}%
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="font-medium text-blue-800">Durée moyenne de prêt</span>
              <span className="text-2xl font-bold text-blue-600">
                {stats?.loans ? Math.round(stats.loans.filter(l => l.actual_return_date).reduce((acc, loan) => {
                  const start = new Date(loan.loan_date);
                  const end = new Date(loan.actual_return_date);
                  return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
                }, 0) / stats.loans.filter(l => l.actual_return_date).length || 0) : 0} jours
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="font-medium text-purple-800">Articles les plus empruntés</span>
              <span className="text-2xl font-bold text-purple-600">
                {stats?.articles.filter(a => a.status === 'en_pret').length || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

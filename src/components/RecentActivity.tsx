
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Package, Users, FileText, ArrowRight } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function RecentActivity() {
  const { data: recentArticles } = useQuery({
    queryKey: ['recent-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*, categories(name)')
        .order('created_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const { data: recentLoans } = useQuery({
    queryKey: ['recent-loans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loans')
        .select(`
          *,
          beneficiaries(first_name, last_name),
          loan_articles(articles(name))
        `)
        .order('created_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const { data: recentBeneficiaries } = useQuery({
    queryKey: ['recent-beneficiaries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const activities = [
    ...(recentArticles?.map(article => ({
      id: article.id,
      type: 'article' as const,
      title: `Nouvel article ajouté: ${article.name}`,
      description: `Catégorie: ${article.categories?.name || 'Non définie'}`,
      time: article.created_at,
      status: article.status,
      icon: Package
    })) || []),
    ...(recentLoans?.map(loan => ({
      id: loan.id,
      type: 'loan' as const,
      title: `Nouveau prêt: ${loan.loan_number}`,
      description: `Bénéficiaire: ${loan.beneficiaries?.first_name} ${loan.beneficiaries?.last_name}`,
      time: loan.created_at,
      status: loan.actual_return_date ? 'returned' : 'active',
      icon: FileText
    })) || []),
    ...(recentBeneficiaries?.map(beneficiary => ({
      id: beneficiary.id,
      type: 'beneficiary' as const,
      title: `Nouveau bénéficiaire: ${beneficiary.first_name} ${beneficiary.last_name}`,
      description: `Email: ${beneficiary.email || 'Non renseigné'}`,
      time: beneficiary.created_at,
      status: 'active',
      icon: Users
    })) || [])
  ]
  .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  .slice(0, 5);

  const getStatusColor = (type: string, status: string) => {
    if (type === 'article') {
      switch (status) {
        case 'disponible': return 'bg-green-500';
        case 'en_pret': return 'bg-blue-500';
        case 'en_maintenance': return 'bg-yellow-500';
        case 'hors_service': return 'bg-red-500';
        default: return 'bg-gray-500';
      }
    }
    if (type === 'loan') {
      return status === 'returned' ? 'bg-green-500' : 'bg-blue-500';
    }
    return 'bg-humanitarian-blue';
  };

  const getStatusLabel = (type: string, status: string) => {
    if (type === 'article') {
      const labels = {
        'disponible': 'Disponible',
        'en_pret': 'En prêt',
        'en_maintenance': 'Maintenance',
        'hors_service': 'Hors service'
      };
      return labels[status as keyof typeof labels] || status;
    }
    if (type === 'loan') {
      return status === 'returned' ? 'Retourné' : 'Actif';
    }
    return 'Actif';
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Clock className="h-5 w-5" />
          Activité Récente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Aucune activité récente</p>
            <p className="text-sm">Les nouvelles activités apparaîtront ici</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="p-2 rounded-lg bg-humanitarian-blue/10 text-humanitarian-blue">
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(activity.time).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    className={`${getStatusColor(activity.type, activity.status)} text-white text-xs`}
                  >
                    {getStatusLabel(activity.type, activity.status)}
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

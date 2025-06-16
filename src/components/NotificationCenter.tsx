
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'loan_overdue' | 'maintenance_due' | 'low_stock' | 'return_reminder';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  priority: 'low' | 'medium' | 'high';
}

export function NotificationCenter() {
  const { toast } = useToast();
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([]);

  const { data: loans } = useQuery({
    queryKey: ['loans-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loans')
        .select(`
          *,
          beneficiaries(first_name, last_name),
          loan_articles(articles(name))
        `)
        .is('actual_return_date', null);
      
      if (error) throw error;
      return data;
    },
  });

  const { data: articles } = useQuery({
    queryKey: ['articles-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'en_maintenance');
      
      if (error) throw error;
      return data;
    },
  });

  const generateNotifications = (): Notification[] => {
    const notifications: Notification[] = [];
    const now = new Date();

    // Prêts en retard basés sur les vraies données
    loans?.forEach((loan) => {
      const expectedReturn = new Date(loan.expected_return_date);
      if (expectedReturn < now) {
        const daysDiff = Math.floor((now.getTime() - expectedReturn.getTime()) / (1000 * 60 * 60 * 24));
        notifications.push({
          id: `overdue-${loan.id}`,
          type: 'loan_overdue',
          title: 'Prêt en retard',
          message: `Le prêt ${loan.loan_number} de ${loan.beneficiaries?.first_name} ${loan.beneficiaries?.last_name} est en retard de ${daysDiff} jour(s)`,
          read: false,
          created_at: loan.expected_return_date,
          priority: daysDiff > 7 ? 'high' : 'medium'
        });
      } else if (expectedReturn.getTime() - now.getTime() < 2 * 24 * 60 * 60 * 1000) {
        // Rappel de retour (moins de 2 jours)
        notifications.push({
          id: `reminder-${loan.id}`,
          type: 'return_reminder',
          title: 'Rappel de retour',
          message: `Le prêt ${loan.loan_number} doit être retourné bientôt`,
          read: false,
          created_at: loan.created_at,
          priority: 'medium'
        });
      }
    });

    // Articles en maintenance basés sur les vraies données
    articles?.forEach((article) => {
      notifications.push({
        id: `maintenance-${article.id}`,
        type: 'maintenance_due',
        title: 'Maintenance requise',
        message: `L'article ${article.name} (${article.identifier}) nécessite une maintenance`,
        read: false,
        created_at: article.updated_at || article.created_at,
        priority: 'medium'
      });
    });

    return notifications.filter(n => !dismissedNotifications.includes(n.id));
  };

  const notifications = generateNotifications();

  const dismissNotification = (notificationId: string) => {
    setDismissedNotifications(prev => [...prev, notificationId]);
    toast({
      title: "Notification fermée",
      description: "La notification a été marquée comme lue"
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'loan_overdue':
        return <AlertTriangle className="h-4 w-4" />;
      case 'return_reminder':
        return <Clock className="h-4 w-4" />;
      case 'maintenance_due':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Aucune notification</p>
              <p className="text-sm">Toutes les notifications sont à jour</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border ${
                  notification.read ? 'bg-gray-50' : 'bg-white border-humanitarian-blue'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-1 rounded ${getPriorityColor(notification.priority)} text-white`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                        {notification.title}
                      </h4>
                      <p className={`text-sm ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissNotification(notification.id)}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

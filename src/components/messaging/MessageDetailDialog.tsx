import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getPriorityColor, getPriorityLabel, getDisplayName, Message, Profile } from './MessageUtils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface MessageDetailDialogProps {
  message: Message | null;
  userId?: string;
  onClose: () => void;
  onReply: (replyData: {
    recipient_ids: string[];
    subject: string;
    content: string;
    priority: 'low' | 'normal' | 'high';
  }) => void;
}

export function MessageDetailDialog({ message, userId, onClose, onReply }: MessageDetailDialogProps) {
  const { data: allRecipients, isLoading } = useQuery({
    queryKey: ['message-recipients', message?.conversation_id],
    queryFn: async () => {
      if (!message?.conversation_id) return [];
      const { data, error } = await supabase
        .from('messages')
        .select('recipient:profiles!messages_recipient_id_fkey(id, first_name, last_name, email)')
        .eq('conversation_id', message.conversation_id);
      if (error) throw error;
      // Pour éviter les doublons et s'assurer que le profil est bien là
      const uniqueRecipients = data
        .map(d => d.recipient)
        .filter((r): r is Profile => r !== null)
        .filter((r, index, self) => self.findIndex(p => p.id === r.id) === index);
      return uniqueRecipients;
    },
    enabled: !!message?.conversation_id,
  });

  if (!message) return null;

  const handleReply = () => {
    // Si l'utilisateur est l'expéditeur, il répond à tous les destinataires.
    // Sinon, il répond uniquement à l'expéditeur.
    const recipientIds =
      message.sender_id === userId
        ? allRecipients?.map(r => r.id) ?? [message.recipient_id]
        : [message.sender_id];

    onReply({
      recipient_ids: recipientIds,
      subject: `Re: ${message.subject}`,
      content: `\n\n--- Message original ---\nDe : ${getDisplayName(message.sender || undefined)}\nLe : ${new Date(message.created_at).toLocaleString('fr-FR')}\nSujet : ${message.subject}\n\n${message.content}`,
      priority: 'normal',
    });
    onClose();
  };
  
  const senderDisplayName = message.sender ? getDisplayName(message.sender) : 'Inconnu';
  
  const isSentByCurrentUser = message.sender_id === userId;

  return (
    <Dialog open={!!message} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{message.subject}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col text-sm text-gray-600 gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold">De :</span>
                <span>{senderDisplayName}</span>
              </div>
              <Badge className={`text-white ${getPriorityColor(message.priority)}`}>
                {getPriorityLabel(message.priority)}
              </Badge>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold">À :</span>
              {isLoading ? (
                <span>Chargement...</span>
              ) : (
                <span className="flex-1">
                  {allRecipients?.map(r => getDisplayName(r)).join(', ')}
                </span>
              )}
            </div>
             <div className="text-xs text-gray-500 self-end">
               {new Date(message.created_at).toLocaleString('fr-FR')}
             </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
            <Button 
              className="bg-humanitarian-blue hover:bg-blue-700"
              onClick={handleReply}
            >
              Répondre
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

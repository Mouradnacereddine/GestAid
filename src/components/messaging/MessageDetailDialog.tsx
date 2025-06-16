
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getPriorityColor, getPriorityLabel, getDisplayName } from './MessageUtils';

interface Message {
  id: string;
  subject: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  created_at: string;
  read: boolean;
  priority: 'low' | 'normal' | 'high';
  sender?: {
    first_name: string;
    last_name: string;
  };
  recipient?: {
    first_name: string;
    last_name: string;
  };
}

interface MessageDetailDialogProps {
  message: Message | null;
  userId?: string;
  onClose: () => void;
  onReply: (replyData: {
    recipient_id: string;
    subject: string;
    content: string;
    priority: 'low' | 'normal' | 'high';
  }) => void;
}

export function MessageDetailDialog({ message, userId, onClose, onReply }: MessageDetailDialogProps) {
  if (!message) return null;

  const handleReply = () => {
    onReply({
      recipient_id: message.sender_id === userId 
        ? message.recipient_id 
        : message.sender_id,
      subject: `Re: ${message.subject}`,
      content: '',
      priority: 'normal'
    });
    onClose();
  };

  return (
    <Dialog open={!!message} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{message.subject}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>{getDisplayName(message, userId)}</span>
              <Badge className={`text-white ${getPriorityColor(message.priority)}`}>
                {getPriorityLabel(message.priority)}
              </Badge>
            </div>
            <span>{new Date(message.created_at).toLocaleString('fr-FR')}</span>
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

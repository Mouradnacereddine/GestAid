import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Users } from 'lucide-react';
import { getPriorityColor, getPriorityLabel, getRecipientPreview, Message } from './MessageUtils';

interface MessageItemProps {
  message: Message;
  userId?: string;
  onClick: (message: Message) => void;
}

export function MessageItem({ message, userId, onClick }: MessageItemProps) {
  const isSentByMe = message.sender_id === userId;
  
  // Dans la liste, on ne peut pas connaître tous les destinataires sans une requête supplémentaire.
  // On affiche donc une indication générique si plusieurs destinataires.
  // La logique exacte dépend de si 'recipients' est peuplé ici.
  // Pour l'instant, on se base sur le `recipient` principal.
  const recipientDisplay = getRecipientPreview(message, userId);
  
  return (
    <div
      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
        !message.read && !isSentByMe 
          ? 'bg-blue-50 border-blue-200' 
          : 'hover:bg-gray-50'
      }`}
      onClick={() => onClick(message)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {isSentByMe ? <User className="h-4 w-4 text-gray-500" /> : <User className="h-4 w-4 text-gray-500" /> }
          <span className="font-medium text-sm">{recipientDisplay}</span>
          <Badge className={`text-white text-xs ${getPriorityColor(message.priority)}`}>
            {getPriorityLabel(message.priority)}
          </Badge>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          {new Date(message.created_at).toLocaleString('fr-FR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
      <h3 className={`font-medium ${
        !message.read && !isSentByMe 
          ? 'text-blue-900' 
          : 'text-gray-900'
      }`}>
        {message.subject}
      </h3>
      <p className="text-sm text-gray-600 truncate mt-1">
        {message.content}
      </p>
    </div>
  );
}


import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, User } from 'lucide-react';
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

interface MessageItemProps {
  message: Message;
  userId?: string;
  onClick: (message: Message) => void;
}

export function MessageItem({ message, userId, onClick }: MessageItemProps) {
  return (
    <div
      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
        !message.read && message.recipient_id === userId 
          ? 'bg-blue-50 border-blue-200' 
          : 'hover:bg-gray-50'
      }`}
      onClick={() => onClick(message)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-sm">{getDisplayName(message, userId)}</span>
          <Badge className={`text-white text-xs ${getPriorityColor(message.priority)}`}>
            {getPriorityLabel(message.priority)}
          </Badge>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          {new Date(message.created_at).toLocaleDateString('fr-FR')}
        </div>
      </div>
      <h3 className={`font-medium ${
        !message.read && message.recipient_id === userId 
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

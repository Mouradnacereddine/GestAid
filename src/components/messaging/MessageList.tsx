
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare } from 'lucide-react';
import { MessageItem } from './MessageItem';

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

interface MessageListProps {
  messages: Message[];
  userId?: string;
  onMessageClick: (message: Message) => void;
}

export function MessageList({ messages, userId, onMessageClick }: MessageListProps) {
  return (
    <ScrollArea className="h-96">
      <div className="space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Aucun message</p>
            <p className="text-sm">Commencez une conversation</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              userId={userId}
              onClick={onMessageClick}
            />
          ))
        )}
      </div>
    </ScrollArea>
  );
}

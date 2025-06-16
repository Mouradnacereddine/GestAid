import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MessageList } from '@/components/messaging/MessageList';
import { ComposeMessageDialog, MessageFormData } from '@/components/messaging/ComposeMessageDialog';
import { MessageDetailDialog } from '@/components/messaging/MessageDetailDialog';
import { v4 as uuidv4 } from 'uuid';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

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
  recipients?: Profile[];
  conversation_id: string;
}

export function MessagingCenter() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCompose, setShowCompose] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [initialMessageData, setInitialMessageData] = useState<Partial<MessageFormData> | undefined>(undefined);

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', user?.id],
    queryFn: async () => {
        if (!user?.id) return [];
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(first_name, last_name),
          recipient:profiles!messages_recipient_id_fkey(first_name, last_name)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Regrouper les messages par conversation_id
      const conversations = new Map<string, Message>();
      
      (data as Message[]).forEach(message => {
        const convId = message.conversation_id || message.id; // Fallback for old messages
        
        // Pour les messages envoyés par l'utilisateur courant, on ne veut qu'une seule entrée par conversation
        if (message.sender_id === user.id) {
          if (!conversations.has(convId)) {
            conversations.set(convId, { ...message, conversation_id: convId });
          }
        } else { // Pour les messages reçus, chaque message est une entrée unique
          conversations.set(message.id, { ...message, conversation_id: convId });
        }
      });
      
      return Array.from(conversations.values());
    },
    enabled: !!user?.id
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: MessageFormData) => {
      if (!user) {
        toast.error("Vous devez être connecté pour envoyer un message.");
        throw new Error("User not authenticated");
      }

      const { recipient_ids, cc_recipient_ids, subject, content, priority } = messageData;

      const allRecipientIds = [...new Set([...recipient_ids, ...(cc_recipient_ids || [])])];
      
      if (allRecipientIds.length === 0) {
        toast.error("Veuillez sélectionner au moins un destinataire.");
        throw new Error("No recipients selected");
      }
      
      const conversation_id = uuidv4();

      const messagesToInsert = allRecipientIds.map(recipientId => ({
        recipient_id: recipientId,
        subject,
        content,
        priority,
        sender_id: user.id,
        read: false,
        conversation_id,
      }));

      const { data, error } = await supabase
        .from('messages')
        .insert(messagesToInsert);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast.success('Message envoyé avec succès');
      setShowCompose(false);
      setInitialMessageData(undefined);
    },
    onError: (err) => {
      console.error("Message sending failed:", err);
      toast.error("Erreur lors de l'envoi du message");
    }
  });

  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    }
  });

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    if (!message.read && message.recipient_id === user?.id) {
      markAsReadMutation.mutate(message.id);
    }
  };

  const handleReply = (replyData: Partial<MessageFormData>) => {
    setInitialMessageData(replyData);
    setShowCompose(true);
  };

  const handleNewMessageClick = () => {
    setInitialMessageData(undefined);
    setShowCompose(true);
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messagerie Interne
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Chargement des messages...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messagerie Interne ({messages.length})
          </CardTitle>
          <Button 
            onClick={handleNewMessageClick}
            className="bg-humanitarian-blue hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Message
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <MessageList
          messages={messages}
          userId={user?.id}
          onMessageClick={handleMessageClick}
        />
      </CardContent>

      <ComposeMessageDialog
        open={showCompose}
        onOpenChange={(isOpen) => {
          setShowCompose(isOpen);
          if (!isOpen) {
            setInitialMessageData(undefined);
          }
        }}
        onSend={(data) => sendMessageMutation.mutate(data)}
        isSending={sendMessageMutation.isPending}
        currentUserId={user?.id}
        initialData={initialMessageData}
      />

      <MessageDetailDialog
        message={selectedMessage}
        userId={user?.id}
        onClose={() => setSelectedMessage(null)}
        onReply={handleReply}
      />
    </Card>
  );
}

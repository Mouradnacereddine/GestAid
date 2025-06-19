
-- Créer la table messages pour le système de messagerie interne
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read BOOLEAN NOT NULL DEFAULT false,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high'))
);

-- Créer les index pour améliorer les performances
CREATE INDEX messages_sender_id_idx ON public.messages(sender_id);
CREATE INDEX messages_recipient_id_idx ON public.messages(recipient_id);
CREATE INDEX messages_created_at_idx ON public.messages(created_at DESC);
CREATE INDEX messages_conversation_id_idx ON public.messages(conversation_id);

-- Activer RLS (Row Level Security)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir les messages où ils sont expéditeur ou destinataire
CREATE POLICY "Users can view their messages" ON public.messages
  FOR SELECT USING (
    sender_id = auth.uid() OR recipient_id = auth.uid()
  );

-- Politique pour permettre aux utilisateurs de créer des messages
CREATE POLICY "Users can create messages" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
  );

-- Politique pour permettre aux utilisateurs de mettre à jour leurs messages reçus (marquer comme lu)
CREATE POLICY "Users can update received messages" ON public.messages
  FOR UPDATE USING (
    recipient_id = auth.uid()
  );

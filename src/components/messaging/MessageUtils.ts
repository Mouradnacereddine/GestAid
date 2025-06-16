export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

export interface Message {
  id: string;
  subject: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  created_at: string;
  read: boolean;
  priority: 'low' | 'normal' | 'high';
  sender?: Profile;
  recipient?: Profile;
  recipients?: Profile[];
  conversation_id: string;
}

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-500';
    case 'normal': return 'bg-blue-500';
    case 'low': return 'bg-gray-500';
    default: return 'bg-blue-500';
  }
};

export const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'high': return 'Urgent';
    case 'normal': return 'Normal';
    case 'low': return 'Faible';
    default: return 'Normal';
  }
};

export const getDisplayName = (profile?: Profile | null) => {
  if (!profile) return 'Utilisateur inconnu';
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ');
  return name || profile.email || 'Utilisateur inconnu';
};

export const getConversationDisplay = (message: Message, userId?: string) => {
  if (message.sender_id === userId) {
    // Si l'utilisateur est l'expéditeur, on pourrait vouloir afficher les destinataires
    // Pour l'instant, on affiche "Vous" et le sujet pour la clarté.
    // L'aperçu du message montrera les destinataires dans le dialogue de détail.
    return `Vous : ${message.subject}`;
  }
  // Si l'utilisateur est le destinataire, on affiche le nom de l'expéditeur
  return getDisplayName(message.sender);
};

export const getRecipientPreview = (message: Message, userId?: string) => {
    if (message.sender_id === userId) {
        if (!message.recipient) return 'Destinataire inconnu';
        return `À : ${getDisplayName(message.recipient)}`;
    }
    return `De : ${getDisplayName(message.sender)}`;
}

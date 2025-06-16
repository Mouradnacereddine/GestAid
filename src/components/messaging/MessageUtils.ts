
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

export const getDisplayName = (message: any, userId?: string) => {
  if (message.sender_id === userId) {
    return `À: ${message.recipient?.first_name} ${message.recipient?.last_name}`;
  }
  return `De: ${message.sender?.first_name} ${message.sender?.last_name}`;
};

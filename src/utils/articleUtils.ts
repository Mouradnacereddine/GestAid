
export const getStateLabel = (state: string) => {
  const stateLabels: Record<string, string> = {
    'neuf': 'Neuf',
    'tres_bon': 'Très bon',
    'bon': 'Bon',
    'usage': 'Usage',
    'a_reparer': 'À réparer'
  };
  return stateLabels[state] || state;
};

export const getStatusColor = (status: string) => {
  const statusColors: Record<string, string> = {
    'disponible': 'bg-green-500',
    'en_pret': 'bg-orange-500',
    'maintenance': 'bg-red-500',
    'retire': 'bg-gray-500'
  };
  return statusColors[status] || 'bg-gray-500';
};

export const getStatusLabel = (status: string) => {
  const statusLabels: Record<string, string> = {
    'disponible': 'Disponible',
    'en_pret': 'En prêt',
    'maintenance': 'Maintenance',
    'retire': 'Retiré'
  };
  return statusLabels[status] || status;
};

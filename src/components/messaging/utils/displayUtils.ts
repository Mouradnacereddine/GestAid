
interface Profile {
  id: string;
  first_name: string;
  last_name: string;
}

export const getDisplayName = (profile: Profile) => {
  const firstName = profile.first_name?.trim() || '';
  const lastName = profile.last_name?.trim() || '';
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  } else if (firstName) {
    return firstName;
  } else if (lastName) {
    return lastName;
  } else {
    return `Utilisateur ${profile.id.slice(-8)}`;
  }
};

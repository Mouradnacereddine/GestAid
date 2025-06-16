
import React from 'react';
import { Check } from 'lucide-react';
import { getDisplayName } from './utils/displayUtils';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
}

interface ProfileItemProps {
  profile: Profile;
  isSelected: boolean;
  onSelect: (profileId: string) => void;
}

export function ProfileItem({ profile, isSelected, onSelect }: ProfileItemProps) {
  return (
    <div
      className="px-3 py-2 cursor-pointer hover:bg-gray-50 flex items-center gap-2"
      onMouseDown={() => onSelect(profile.id)}
    >
      <Check
        className={`h-4 w-4 ${
          isSelected ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div className="flex-1">
        <p className="font-medium">
          {getDisplayName(profile)}
        </p>
        {profile.email && (
          <p className="text-sm text-gray-500">{profile.email}</p>
        )}
      </div>
    </div>
  );
}

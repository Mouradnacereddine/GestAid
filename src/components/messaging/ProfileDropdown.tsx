
import React from 'react';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { ProfileItem } from './ProfileItem';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
}

interface ProfileDropdownProps {
  profiles: Profile[] | undefined;
  filteredProfiles: Profile[] | undefined;
  isLoading: boolean;
  error: Error | null;
  selectedValue: string;
  onSelect: (profileId: string) => void;
  onSelectNone: () => void;
}

export function ProfileDropdown({
  profiles,
  filteredProfiles,
  isLoading,
  error,
  selectedValue,
  onSelect,
  onSelectNone
}: ProfileDropdownProps) {
  return (
    <Card className="absolute top-full left-0 right-0 mt-1 max-h-64 overflow-y-auto z-50 bg-white border shadow-lg">
      {isLoading ? (
        <div className="p-3 text-center text-gray-500">Chargement...</div>
      ) : error ? (
        <div className="p-3 text-center text-red-500">
          Erreur: {error.message}
        </div>
      ) : (
        <div className="py-1">
          <div
            className="px-3 py-2 cursor-pointer hover:bg-gray-50 flex items-center gap-2"
            onMouseDown={onSelectNone}
          >
            <Check
              className={`h-4 w-4 ${
                !selectedValue ? 'opacity-100' : 'opacity-0'
              }`}
            />
            <div className="flex-1">
              <p className="font-medium text-gray-600">Aucun destinataire</p>
            </div>
          </div>
          {filteredProfiles?.length === 0 ? (
            <div className="p-3 text-center text-gray-500">
              {profiles?.length === 0 
                ? 'Aucun profil trouvé dans la base de données'
                : 'Aucun destinataire trouvé pour cette recherche'
              }
            </div>
          ) : (
            filteredProfiles?.map((profile) => (
              <ProfileItem
                key={profile.id}
                profile={profile}
                isSelected={selectedValue === profile.id}
                onSelect={onSelect}
              />
            ))
          )}
        </div>
      )}
    </Card>
  );
}

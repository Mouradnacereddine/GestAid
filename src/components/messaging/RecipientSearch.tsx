import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

interface RecipientSearchProps {
  value: string;
  onChange: (value: string) => void;
  currentUserId?: string;
}

export function RecipientSearch({ value, onChange, currentUserId }: RecipientSearchProps) {
  const [searchValue, setSearchValue] = useState('');
  const [showResults, setShowResults] = useState(false);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['profiles-search', searchValue],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .limit(20);
      
      if (searchValue) {
        query = query.or(`first_name.ilike.%${searchValue}%,last_name.ilike.%${searchValue}%,email.ilike.%${searchValue}%`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Error fetching profiles:', error);
        throw error;
      }
      
      const filtered = data?.filter(profile => {
        if (currentUserId && profile.id === currentUserId) {
          return false;
        }
        return true;
      }) || [];
      
      return filtered;
    },
  });

  const selectedProfile = useMemo(() => 
    profiles.find((profile: Profile) => profile.id === value),
    [profiles, value]
  );

  const getDisplayName = (profile: Profile) => {
    const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ');
    return name || profile.email || 'Utilisateur sans nom';
  };
  
  const handleInputChange = (inputValue: string) => {
    setSearchValue(inputValue);
    setShowResults(true);
    if (!inputValue.trim()) {
      onChange('');
    }
  };

  const handleSelect = (profileId: string) => {
    onChange(profileId);
    const selected = profiles.find(p => p.id === profileId);
    if (selected) {
      setSearchValue(getDisplayName(selected));
    }
    setShowResults(false);
  };

  const handleInputFocus = () => {
    setShowResults(true);
    if (selectedProfile) {
      setSearchValue('');
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setShowResults(false);
      if (selectedProfile) {
        setSearchValue(getDisplayName(selectedProfile));
      } else {
        setSearchValue('');
      }
    }, 200);
  };
  
  useEffect(() => {
    if (selectedProfile && !showResults) {
      setSearchValue(getDisplayName(selectedProfile));
    }
  }, [selectedProfile, showResults]);

  return (
    <FormItem>
      <FormLabel>Destinataire *</FormLabel>
      <div className="relative">
        <FormControl>
          <Input
            value={searchValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder="Rechercher un destinataire..."
            disabled={isLoading}
            autoComplete="off"
          />
        </FormControl>
        
        {showResults && (
          <Card className="absolute top-full left-0 right-0 mt-1 max-h-64 overflow-y-auto z-50 bg-background border shadow-lg">
            {isLoading ? (
              <div className="p-3 text-center text-muted-foreground">Recherche...</div>
            ) : (
              <div className="py-1">
                {profiles.length === 0 ? (
                  <div className="p-3 text-center text-muted-foreground">Aucun destinataire trouvé.</div>
                ) : (
                  profiles.map((profile) => (
                    <div
                      key={profile.id}
                      className="px-3 py-2 cursor-pointer hover:bg-muted flex items-center gap-2"
                      onMouseDown={() => handleSelect(profile.id)}
                    >
                      <Check
                        className={`h-4 w-4 ${
                          value === profile.id ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{getDisplayName(profile)}</p>
                        {profile.email && profile.email !== getDisplayName(profile) && (
                          <span className="text-xs text-muted-foreground">{profile.email}</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </Card>
        )}
      </div>
      <FormMessage />
    </FormItem>
  );
}

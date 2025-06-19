import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

interface RecipientSearchProps {
  value: string[];
  onChange: (value: string[]) => void;
  currentUserId?: string;
  label: string;
  placeholder?: string;
  excludeIds?: string[];
}

export function RecipientSearch({ 
  value, 
  onChange, 
  currentUserId, 
  label,
  placeholder = "Rechercher un destinataire...",
  excludeIds = []
}: RecipientSearchProps) {
  const [searchValue, setSearchValue] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedProfiles, setSelectedProfiles] = useState<Profile[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['profiles-search', searchValue, currentUserId, excludeIds],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('id, first_name, last_name');

      if (currentUserId) {
        query = query.neq('id', currentUserId);
      }
      
      if (searchValue) {
        query = query.or(`first_name.ilike.%${searchValue}%,last_name.ilike.%${searchValue}%`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Error fetching profiles:', error);
        throw error;
      }
      
      const filtered = data?.filter(profile => {
        if (value.includes(profile.id)) return false; // Don't show already selected
        if (excludeIds.includes(profile.id)) return false; // Don't show excluded IDs
        return true;
      }) || [];
      
      return filtered;
    },
    enabled: showResults,
  });

  const { data: initialProfiles } = useQuery({
    queryKey: ['profiles-initial', value],
    queryFn: async () => {
      if (!value || value.length === 0) return [];
      const { data, error } = await supabase.from('profiles').select('id, first_name, last_name').in('id', value);
      if (error) throw error;
      return data || [];
    },
    enabled: value.length > 0 && selectedProfiles.length !== value.length,
  });

  useEffect(() => {
    if (initialProfiles) {
      setSelectedProfiles(initialProfiles);
    } else if (value.length === 0) {
      setSelectedProfiles([]);
    }
  }, [initialProfiles, value]);

  const getDisplayName = (profile: Profile) => {
    const nameParts = [profile.first_name, profile.last_name].filter(Boolean);
    const uniqueNameParts = [...new Set(nameParts)];
    const name = uniqueNameParts.join(' ');
    return name || 'Utilisateur sans nom';
  };
  
  const handleSelect = (profile: Profile) => {
    onChange([...value, profile.id]);
    setSearchValue('');
  };

  const handleUnselect = (profileId: string) => {
    const newSelectedIds = value.filter(id => id !== profileId);
    onChange(newSelectedIds);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    setShowResults(true);
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  };

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <div className="relative">
        <div className={cn(
          "flex flex-wrap gap-1 items-center p-1 border rounded-md min-h-[40px] transition-all",
          isFocused ? "ring-2 ring-ring ring-offset-2" : ""
        )}>
          {selectedProfiles.map(profile => (
            <Badge key={profile.id} variant="secondary" className="flex items-center gap-1.5 py-1">
              {getDisplayName(profile)}
              <X 
                className="h-3.5 w-3.5 cursor-pointer rounded-full hover:bg-muted-foreground/20" 
                onClick={() => handleUnselect(profile.id)} 
              />
            </Badge>
          ))}
        <FormControl>
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={value.length === 0 ? placeholder : ""}
            autoComplete="off"
            className="flex-1 border-none shadow-none focus-visible:ring-0 h-auto p-1 bg-transparent"
          />
        </FormControl>
        </div>
        
        {showResults && (
          <Card className="absolute top-full left-0 right-0 mt-1 max-h-64 overflow-y-auto z-50 bg-background border shadow-lg">
            {isLoading ? (
              <div className="p-3 text-center text-muted-foreground">Recherche...</div>
            ) : (
              <div className="py-1">
                {profiles.length === 0 && searchValue ? (
                  <div className="p-3 text-center text-muted-foreground">Aucun destinataire trouvé.</div>
                ) : (
                  profiles.map((profile) => (
                    <div
                      key={profile.id}
                      className="px-3 py-2 cursor-pointer hover:bg-muted flex items-center gap-2"
                      onMouseDown={() => handleSelect(profile)}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{getDisplayName(profile)}</p>
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

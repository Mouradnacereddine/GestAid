
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  console.log('🔍 Fetching profiles for messaging...');
  
  const { data: profiles = [], isLoading, error } = useQuery({
    queryKey: ['profiles-search', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .limit(20);
      
      if (searchTerm) {
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Error fetching profiles:', error);
        throw error;
      }
      
      // Filter out current user
      const filtered = data?.filter(profile => {
        if (currentUserId && profile.id === currentUserId) {
          console.log('❌ Excluding current user:', currentUserId);
          return false;
        }
        return true;
      }) || [];
      
      console.log('✅ Profiles loaded:', filtered);
      return filtered;
    },
    retry: 3,
    retryDelay: 1000,
  });

  console.log('🔄 RecipientSearch state:', {
    profilesCount: profiles.length,
    isLoading,
    error: error?.message,
    currentUserId
  });

  const selectedProfile = profiles.find((profile: Profile) => profile.id === value);

  const getDisplayName = (profile: Profile) => {
    const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ');
    return name || profile.email || 'Utilisateur sans nom';
  };

  return (
    <FormItem>
      <FormLabel>Destinataire *</FormLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between text-left font-normal"
            >
              {selectedProfile ? (
                <span className="flex flex-col items-start">
                  <span>{getDisplayName(selectedProfile)}</span>
                  {selectedProfile.email && selectedProfile.email !== getDisplayName(selectedProfile) && (
                    <span className="text-xs text-gray-500">{selectedProfile.email}</span>
                  )}
                </span>
              ) : (
                <span className="text-muted-foreground">Sélectionner un destinataire...</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Rechercher un destinataire..." 
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? 'Recherche en cours...' : 'Aucun destinataire trouvé.'}
              </CommandEmpty>
              {profiles.length > 0 && (
                <CommandGroup>
                  {profiles.map((profile: Profile) => (
                    <CommandItem
                      key={profile.id}
                      value={profile.id}
                      onSelect={() => {
                        onChange(profile.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === profile.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col flex-1">
                        <span className="font-medium">{getDisplayName(profile)}</span>
                        {profile.email && profile.email !== getDisplayName(profile) && (
                          <span className="text-xs text-gray-500">{profile.email}</span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  );
}

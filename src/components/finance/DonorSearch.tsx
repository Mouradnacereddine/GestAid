
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DonorSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function DonorSearch({ value, onChange }: DonorSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: donors, isLoading } = useQuery({
    queryKey: ['donors-search', searchTerm],
    queryFn: async () => {
      let query = supabase.from('donors').select('id, name, type, email');
      
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }
      
      const { data, error } = await query.order('name').limit(10);
      
      if (error) throw error;
      return data || [];
    },
  });

  const selectedDonor = donors?.find(donor => donor.id === value);

  return (
    <FormItem>
      <FormLabel>Donateur (optionnel)</FormLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between text-left font-normal"
            >
              {selectedDonor ? (
                <span className="flex items-center gap-2">
                  <span>{selectedDonor.name}</span>
                  <span className="text-xs text-gray-500">({selectedDonor.type})</span>
                </span>
              ) : (
                <span className="text-muted-foreground">Rechercher un donateur...</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Rechercher un donateur..." 
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? 'Recherche en cours...' : 'Aucun donateur trouvé.'}
              </CommandEmpty>
              <CommandGroup>
                {value && (
                  <CommandItem
                    value=""
                    onSelect={() => {
                      onChange('');
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className="h-4 w-4" />
                      <span className="text-gray-500 italic">Aucun donateur sélectionné</span>
                    </div>
                  </CommandItem>
                )}
                {donors?.map((donor) => (
                  <CommandItem
                    key={donor.id}
                    value={donor.id}
                    onSelect={() => {
                      onChange(donor.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === donor.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{donor.name}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {donor.type}
                        </span>
                      </div>
                      {donor.email && (
                        <span className="text-xs text-gray-500">{donor.email}</span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  );
}

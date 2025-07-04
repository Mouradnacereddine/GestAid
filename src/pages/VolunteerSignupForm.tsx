import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function VolunteerSignupForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [agencies, setAgencies] = useState([]);
  const [agencyInput, setAgencyInput] = useState('');
  const [filteredAgencies, setFilteredAgencies] = useState([]);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '' });

  useEffect(() => {
    supabase.from('agencies').select('id, name').then(({ data }) => {
      setAgencies(data || []);
    });
  }, []);

  useEffect(() => {
    setFilteredAgencies(
      agencies.filter(a => a.name.toLowerCase().includes(agencyInput.toLowerCase()))
    );
  }, [agencyInput, agencies]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgency) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Veuillez sélectionner une agence.'
      });
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.from('volunteer_signup_requests').insert({
      ...form,
      agency_id: selectedAgency.id,
      status: 'pending',
    });
    setIsLoading(false);
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message
      });
    } else {
      toast({
        title: 'Demande envoyée',
        description: 'Votre demande a été soumise et sera examinée par un administrateur.'
      });
      setForm({ first_name: '', last_name: '', email: '' });
      setAgencyInput('');
      setSelectedAgency(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="volunteer-firstName">Prénom</Label>
          <Input
            id="volunteer-firstName"
            name="firstName"
            type="text"
            value={form.first_name}
            onChange={e => setForm({ ...form, first_name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="volunteer-lastName">Nom</Label>
          <Input
            id="volunteer-lastName"
            name="lastName"
            type="text"
            value={form.last_name}
            onChange={e => setForm({ ...form, last_name: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="volunteer-email">Email</Label>
        <Input
          id="volunteer-email"
          name="email"
          type="email"
          placeholder="votre.email@exemple.com"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2 relative">
        <Label htmlFor="agency-search">Agence</Label>
        <Input
          id="agency-search"
          name="agency"
          type="text"
          placeholder="Rechercher une agence..."
          autoComplete="off"
          value={agencyInput}
          onChange={e => {
            setAgencyInput(e.target.value);
            setSelectedAgency(null);
          }}
          required
        />
        {agencyInput && filteredAgencies.length > 0 && !selectedAgency && (
          <ul className="absolute z-10 bg-white border w-full mt-1 rounded shadow max-h-40 overflow-y-auto">
            {filteredAgencies.map(a => (
              <li
                key={a.id}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSelectedAgency(a);
                  setAgencyInput(a.name);
                }}
              >
                {a.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <Button type="submit" className="w-full bg-humanitarian-green hover:bg-green-700" disabled={isLoading}>
        {isLoading ? 'Envoi...' : 'Envoyer la demande'}
      </Button>
    </form>
  );
}

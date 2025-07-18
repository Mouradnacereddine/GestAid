
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import VolunteerSignupForm from './VolunteerSignupForm';

export default function Auth() {
  const { user, signIn, isSigningIn } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    await signIn({ email, password });
  };

  const handleRequestAccess = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const agencyName = formData.get('agencyName') as string;

    // On n'essaie plus de créer l'agence côté front, seulement agency_name
    const { error } = await supabase
      .from('admin_signup_requests')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        agency_name: agencyName
      });

    if (error) {
      if (error.code === '23505') {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Une demande avec cette adresse e-mail a déjà été soumise.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: `Une erreur est survenue lors de l'envoi de votre demande: ${error.message}`,
        });
      }
    } else {
      toast({
        title: 'Demande envoyée',
        description: 'Votre demande a été soumise et sera examinée par le superadmin.',
      });
    }

    setIsLoading(false);
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-humanitarian-blue/10 to-humanitarian-green/10 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-humanitarian-red" />
            <h1 className="text-2xl font-bold text-gray-900">Lending Aid Compass</h1>
          </div>
          <p className="text-gray-600">Gestion de prêts humanitaires</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bienvenue</CardTitle>
            <CardDescription>
              Connectez-vous ou créez un compte pour accéder à l'application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
  <TabsTrigger value="signin">Se connecter</TabsTrigger>
  <TabsTrigger value="request-admin">Demande Admin</TabsTrigger>
  <TabsTrigger value="request-volunteer">Demande Bénévole</TabsTrigger>
</TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="votre.email@exemple.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-humanitarian-blue hover:bg-blue-700"
                    disabled={isSigningIn}
                  >
                    {isSigningIn ? 'Connexion...' : 'Se connecter'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="request-admin">
  <form onSubmit={handleRequestAccess} className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="firstName">Prénom</Label>
        <Input id="firstName" name="firstName" type="text" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastName">Nom</Label>
        <Input id="lastName" name="lastName" type="text" required />
      </div>
    </div>
    <div className="space-y-2">
      <Label htmlFor="signup-email">Email</Label>
      <Input id="signup-email" name="email" type="email" placeholder="votre.email@exemple.com" required />
    </div>
    <div className="space-y-2">
      <Label htmlFor="agencyName">Nom de l'agence</Label>
      <Input id="agencyName" name="agencyName" type="text" required />
    </div>
    <Button type="submit" className="w-full bg-humanitarian-green hover:bg-green-700" disabled={isLoading}>
      {isLoading ? 'Envoi...' : 'Envoyer la demande'}
    </Button>
  </form>
</TabsContent>

<TabsContent value="request-volunteer">
  <VolunteerSignupForm />
</TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

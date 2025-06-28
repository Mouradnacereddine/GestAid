
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'superadmin' | 'admin' | 'benevole';

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  agency_id: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Gère la session et l'état de l'utilisateur
  useEffect(() => {
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      // Le chargement s'arrêtera dans l'effet suivant, une fois le profil chargé
    });

    return () => subscription.unsubscribe();
  }, []);

  // Gère la récupération du profil, qui dépend de l'utilisateur
  useEffect(() => {
    // Ne rien faire si l'utilisateur n'est pas encore défini
    if (!user) {
      setProfile(null);
      // Si la session est chargée mais qu'il n'y a pas d'utilisateur, on arrête de charger
      if (session !== undefined) {
        setLoading(false);
      }
      return;
    }

    let isMounted = true;
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role, agency_id')
        .eq('id', user.id)
        .single();

      if (isMounted) {
        if (error) {
          console.error('Erreur de récupération du profil:', error);
          setProfile(null);
        } else {
          setProfile(data as Profile);
        }
        setLoading(false); // Le chargement est terminé ici
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [user, session]); // Se redéclenche si l'utilisateur ou la session change

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: error.message,
      });
    } else {
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté.",
      });
    }

    return { error };
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur d'inscription",
        description: error.message,
      });
    } else {
      toast({
        title: "Inscription réussie",
        description: "Veuillez vérifier votre email pour confirmer votre compte.",
      });
    }

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur de déconnexion",
        description: error.message,
      });
    } else {
      toast({
        title: "Déconnexion réussie",
        description: "Vous êtes maintenant déconnecté.",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type UserRole = 'superadmin' | 'admin' | 'benevole';

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  agency_id: string | null;
  currency?: string | null; // Ajout pour devise personnalisée
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (args: { email: string; password: string }) => void;
  signUp: (args: { email: string; password: string; firstName: string; lastName: string }) => void;
  signOut: () => void;
  isSigningIn: boolean;
  isSigningUp: boolean;
  isSigningOut: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const user = session?.user ?? null;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoadingInitial(false);
    });

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingInitial(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: profile, isLoading: isLoadingProfile } = useQuery<Profile | null>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role, agency_id')
        .eq('id', user.id)
        .single();
      if (error) {
        // Don't throw here, as it could be a new user without a profile yet
        console.error('Error fetching profile:', error.message);
        return null;
      }
      return data;
    },
    enabled: !!user,
  });

  const signInMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Connexion réussie');
      queryClient.invalidateQueries(); // Invalidate all queries to refetch user-specific data
    },
    onError: (error) => {
      toast.error('Erreur de connexion', { description: error.message });
    },
  });

  const signUpMutation = useMutation({
    mutationFn: async ({ email, password, firstName, lastName }: { email: string; password: string; firstName: string; lastName: string }) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName },
        },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.info('Inscription réussie', { description: 'Veuillez vérifier votre email pour confirmer votre compte.' });
    },
    onError: (error) => {
      toast.error("Erreur d'inscription", { description: error.message });
    },
  });

  const signOutMutation = useMutation({
    mutationFn: async () => {
      // 1) If we have a session, try a GLOBAL sign-out first to revoke tokens server-side
      try {
        const { data: sessionRes } = await supabase.auth.getSession();
        if (sessionRes?.session) {
          const { error: globalErr } = await supabase.auth.signOut({ scope: 'global' });
          if (globalErr) {
            const msg = String(globalErr.message || '').toLowerCase();
            // Ignore common forbidden/403 responses in some environments
            if (!msg.includes('forbidden') && !msg.includes('403')) {
              throw globalErr;
            }
          }
        }
      } catch (err) {
        console.warn('Global sign-out attempt returned:', err);
      }

      // 2) Always try local sign-out to clear this device
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch (err) {
        console.warn('Local sign-out returned:', err);
      }

      // 3) Belt-and-suspenders: manually clear Supabase auth keys from localStorage
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const keys = Object.keys(window.localStorage);
          for (const k of keys) {
            if (k.startsWith('sb-') || k.includes('supabase.auth.token')) {
              window.localStorage.removeItem(k);
            }
          }
        }
      } catch (err) {
        console.warn('Manual localStorage cleanup failed:', err);
      }
    },
    onSuccess: () => {
      toast.success('Déconnexion réussie');
      queryClient.setQueryData(['profile', user?.id], null); // Clear profile on sign out
      queryClient.clear(); // Clear all data
    },
    onError: (error) => {
      // Even if we land here unexpectedly, the local session was cleared above.
      toast.error('Erreur de déconnexion (session locale nettoyée)');
      console.error('Logout error details:', error);
    },
  });

  const value = {
    user,
    profile: profile ?? null,
    session,
    loading: loadingInitial || (!!user && isLoadingProfile),
    signIn: signInMutation.mutate,
    signUp: signUpMutation.mutate,
    signOut: signOutMutation.mutate,
    isSigningIn: signInMutation.isPending,
    isSigningUp: signUpMutation.isPending,
    isSigningOut: signOutMutation.isPending,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

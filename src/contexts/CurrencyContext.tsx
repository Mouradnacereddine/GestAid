import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

// Define the shape of the context data
interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
}

// Create the context with a default value
const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Define the props for the provider component
interface CurrencyProviderProps {
  children: ReactNode;
}

// Create the provider component
export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const { user, profile } = useAuth();
  const [currency, setCurrencyState] = useState<string>('DZD');
  const [loading, setLoading] = useState<boolean>(true);

  // Charger la devise depuis le profil utilisateur
  useEffect(() => {
    if (profile && profile.currency) {
      setCurrencyState(profile.currency);
      setLoading(false);
    } else if (profile && !profile.currency) {
      setCurrencyState('DZD');
      setLoading(false);
    }
  }, [profile]);

  // Fonction pour changer la devise et la sauvegarder côté Supabase
  const setCurrency = async (newCurrency: string) => {
    setCurrencyState(newCurrency);
    if (user) {
      await supabase
        .from('profiles')
        .update({ currency: newCurrency })
        .eq('id', user.id);
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

// Create a custom hook for easy context consumption
export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

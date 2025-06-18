import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

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
  const [currency, setCurrencyState] = useState<string>(() => {
    // Get the stored currency from localStorage or default to 'DZD'
    return localStorage.getItem('app-currency') || 'DZD';
  });

  useEffect(() => {
    // Save the currency to localStorage whenever it changes
    localStorage.setItem('app-currency', currency);
  }, [currency]);

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
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

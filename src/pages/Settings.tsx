import React from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';

export default function Settings() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600 mt-2">Gérez les paramètres de l'application.</p>
      </div>

      <div className="space-y-6">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Paramètres de la Devise</h2>
          <div className="flex items-center">
            <label htmlFor="currency-select" className="mr-4 font-medium text-gray-700">Choisissez une devise :</label>
            <select
              id="currency-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as 'DZD' | 'USD' | 'EUR')}
              className="block w-full max-w-xs p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="DZD">Dinar Algérien (DZD)</option>
              <option value="USD">Dollar Américain (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </div>
           <p className="mt-4 text-gray-600">Devise actuellement sélectionnée : <strong>{currency}</strong></p>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { createContext, useContext } from 'react';

// Helper function to resolve dot-notation string keys
const getTranslation = (dict: any, keyString: string) => {
  const keys = keyString.split('.');
  let result = dict;
  for (const k of keys) {
    if (result && typeof result === 'object') {
      result = result[k];
    } else {
      return keyString;
    }
  }
  return result || keyString;
};

type I18nContextType = {
  locale: string;
  dict: any;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ 
  locale, 
  dict, 
  children 
}: { 
  locale: string; 
  dict: any; 
  children: React.ReactNode; 
}) {
  const t = (key: string) => getTranslation(dict, key);

  return (
    <I18nContext.Provider value={{ locale, dict, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}

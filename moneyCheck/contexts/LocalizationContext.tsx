import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import en from '../localization/en.json';
import tr from '../localization/tr.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const i18n = new I18n({
  en,
  tr,
});

// Set the locale once at the beginning of your app
i18n.locale = Localization.locale;
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

const LANGUAGE_KEY = '@moneyCheck_language';

interface LocalizationContextType {
  t: (key: string, options?: any) => string;
  locale: string;
  setLocale: (locale: string) => Promise<void>;
  isRTL: boolean;
}

const LocalizationContext = createContext<LocalizationContextType>({
  t: (key: string) => key,
  locale: 'en',
  setLocale: async () => {},
  isRTL: false,
});

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};

interface LocalizationProviderProps {
  children: ReactNode;
}

export const LocalizationProvider = ({ children }: LocalizationProviderProps) => {
  const [locale, setLocaleState] = useState(i18n.locale);

  useEffect(() => {
    // Load saved language preference
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (savedLanguage) {
          i18n.locale = savedLanguage;
          setLocaleState(savedLanguage);
        }
      } catch (error) {
        console.error('Error loading language preference:', error);
      }
    };
    loadLanguage();
  }, []);

  const setLocale = async (newLocale: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, newLocale);
      i18n.locale = newLocale;
      setLocaleState(newLocale);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  const t = (key: string, options?: any) => {
    return i18n.t(key, options);
  };

  const isRTL = Localization.isRTL;

  return (
    <LocalizationContext.Provider value={{ t, locale, setLocale, isRTL }}>
      {children}
    </LocalizationContext.Provider>
  );
};

// Export i18n instance for direct use if needed
export { i18n };


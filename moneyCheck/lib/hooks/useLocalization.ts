// Hook for accessing localized strings and managing language preferences
import { useState, useEffect } from 'react';
import { getLocales } from 'expo-localization';

export function useLocalization() {
  const [locale, setLocale] = useState<string>('tr-TR');
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    const locales = getLocales();
    const deviceLocale = locales[0]?.languageCode || 'tr';
    setLocale(deviceLocale === 'tr' ? 'tr-TR' : 'en-US');
  }, []);

  const t = (key: string): string => {
    return translations[key] || key;
  };

  return { locale, t, setLocale };
}

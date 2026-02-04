import React, { createContext, useContext, useMemo, useState } from 'react';
import vi from '@/locales/vi.json';

type Translations = typeof vi;

const defaultLocale = 'vi';
const messages: Record<string, Translations> = {
  vi,
};

const I18nContext = createContext({
  locale: defaultLocale,
  t: (path: string, vars?: Record<string, any>) => path,
  setLocale: (l: string) => {},
});

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocale] = useState<string>(defaultLocale);

  const t = useMemo(() => {
    return (path: string, vars?: Record<string, any>) => {
      const parts = path.split('.');
      let cur: any = messages[locale] || {};
      for (const p of parts) {
        if (cur && typeof cur === 'object' && p in cur) cur = cur[p];
        else { cur = path; break; }
      }
      if (typeof cur === 'string' && vars) {
        return cur.replace(/\{(.*?)\}/g, (_, key) => vars[key] ?? '');
      }
      return typeof cur === 'string' ? cur : path;
    };
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);

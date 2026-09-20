import React, { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { I18nManager } from 'react-native';
import { AppSettings, defaultSettings, storage } from '@/services/storage';
import { palettes, ThemePalette } from '@/constants/theme';
import { Language, translations } from '@/constants/translations';

export interface SettingsContextValue {
  ready: boolean;
  settings: AppSettings;
  palette: ThemePalette;
  isRTL: boolean;
  t: (key: keyof typeof translations['en']) => string;
  setLanguage: (lang: Language) => Promise<void>;
  setTheme: (theme: 'dark' | 'light') => Promise<void>;
  replaceSettings: (settings: AppSettings) => Promise<void>;
}

export const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const s = await storage.getSettings();
      setSettings(s);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    // Best-effort RTL alignment for text without forcing native restart.
    const wantRTL = settings.language === 'ar';
    if (I18nManager.isRTL !== wantRTL) {
      try {
        I18nManager.allowRTL(wantRTL);
      } catch {}
    }
  }, [settings.language]);

  const persist = useCallback(async (next: AppSettings) => {
    setSettings(next);
    await storage.saveSettings(next);
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    await persist({ ...settings, language: lang });
  }, [settings, persist]);

  const setTheme = useCallback(async (theme: 'dark' | 'light') => {
    await persist({ ...settings, theme });
  }, [settings, persist]);

  const replaceSettings = useCallback(async (next: AppSettings) => {
    await persist(next);
  }, [persist]);

  const palette = palettes[settings.theme];
  const isRTL = settings.language === 'ar';

  const t = useCallback(
    (key: keyof typeof translations['en']) => {
      const dict = translations[settings.language] ?? translations.en;
      return (dict as any)[key] ?? (translations.en as any)[key] ?? key;
    },
    [settings.language],
  );

  const value = useMemo<SettingsContextValue>(
    () => ({ ready, settings, palette, isRTL, t, setLanguage, setTheme, replaceSettings }),
    [ready, settings, palette, isRTL, t, setLanguage, setTheme, replaceSettings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

"use client";

import { createContext, useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import type {
  Dictionary,
  Locale,
  Localized,
  TranslationKey,
  TranslationParams,
} from "@/types";
import { dictionaries } from "@/locales";
import { DEFAULT_LOCALE, localize, translate } from "@/lib/i18n";
import { readStoredLocale, subscribeToLocale, writeStoredLocale } from "@/services/localeStorage";

export interface LocaleContextValue {
  currentLocale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: TranslationParams) => string;
  /** Picks the active-locale variant of a domain field such as `project.summary`. */
  localize: <T>(value: Localized<T>) => T;
  dictionary: Dictionary;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);

/** Server and first client render both use the default locale, so hydration never mismatches. */
const getServerLocale = (): Locale => DEFAULT_LOCALE;

export function LocaleProvider({ children }: { children: ReactNode }) {
  const currentLocale = useSyncExternalStore(subscribeToLocale, readStoredLocale, getServerLocale);

  useEffect(() => {
    document.documentElement.lang = currentLocale;
  }, [currentLocale]);

  const setLocale = useCallback((locale: Locale) => writeStoredLocale(locale), []);

  const value = useMemo<LocaleContextValue>(() => {
    const dictionary = dictionaries[currentLocale];
    return {
      currentLocale,
      setLocale,
      dictionary,
      t: (key, params) => translate(dictionary, key, params),
      localize: (field) => localize(field, currentLocale),
    };
  }, [currentLocale, setLocale]);

  return <LocaleContext value={value}>{children}</LocaleContext>;
}

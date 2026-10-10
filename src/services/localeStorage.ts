import type { Locale } from "@/types";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n";

const STORAGE_KEY = "mcb.locale";
const CHANGE_EVENT = "mcb:locale-change";

/** Fallback for when localStorage throws (Safari private mode, blocked storage). */
let memoryLocale: Locale | null = null;

export function readStoredLocale(): Locale {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isLocale(stored) ? stored : DEFAULT_LOCALE;
  } catch {
    return memoryLocale ?? DEFAULT_LOCALE;
  }
}

export function writeStoredLocale(locale: Locale): void {
  memoryLocale = locale;
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Persistence is best-effort; `memoryLocale` keeps the current session consistent.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Notifies on same-tab writes and cross-tab `storage` events. */
export function subscribeToLocale(onChange: () => void): () => void {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", handleStorage);
  };
}

import type { Dictionary, Locale, Localized, TranslationKey, TranslationParams } from "@/types";

export const LOCALES = ["en", "tr"] as const satisfies readonly Locale[];

export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Turkish-specific letters decide the log locale when the client does not send one. */
export function inferLocale(text: string): Locale {
  return /[çğıöşüÇĞİÖŞÜ]/.test(text) ? "tr" : "en";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

/** Resolves a dot-notated key; falls back to the key itself so missing copy is visible, not blank. */
export function translate(
  dictionary: Dictionary,
  key: TranslationKey,
  params?: TranslationParams,
): string {
  let node: unknown = dictionary;
  for (const segment of key.split(".")) {
    if (!isRecord(node) || !(segment in node)) return key;
    node = node[segment];
  }
  return typeof node === "string" ? interpolate(node, params) : key;
}

export function localize<T>(value: Localized<T>, locale: Locale): T {
  return value[locale];
}

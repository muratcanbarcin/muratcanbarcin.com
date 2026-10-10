import type { Locale, Localized } from "@/types";

/**
 * Static month names instead of `Intl.DateTimeFormat`: Node and browser ICU builds can disagree
 * on abbreviations, which would surface as hydration mismatches.
 */
const MONTHS: Localized<readonly string[]> = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  tr: ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"],
};

const YEAR_MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;

interface YearMonth {
  year: number;
  /** 1-based. */
  month: number;
}

export function parseYearMonth(value: string): YearMonth | null {
  const match = YEAR_MONTH_PATTERN.exec(value);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]) };
}

/** `"2026-08"` → `"Aug 2026"` (en) / `"Ağu 2026"` (tr); unparseable input is returned unchanged. */
export function formatYearMonth(value: string, locale: Locale): string {
  const parsed = parseYearMonth(value);
  if (!parsed) return value;
  return `${MONTHS[locale][parsed.month - 1]} ${parsed.year}`;
}

const RELATIVE_UNITS: readonly [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

/**
 * `"3 days ago"` / `"3 gün önce"`. Only call on the client after data arrives — relative
 * output depends on `now`, so it must never be part of the server-rendered HTML.
 */
export function formatRelativeTime(isoDate: string, now: number, locale: Locale): string {
  const elapsedSeconds = Math.max(0, (now - Date.parse(isoDate)) / 1000);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  for (const [unit, seconds] of RELATIVE_UNITS) {
    if (elapsedSeconds >= seconds) return formatter.format(-Math.floor(elapsedSeconds / seconds), unit);
  }
  return formatter.format(0, "minute");
}

/** Inclusive month count, so `2026-03 → 2026-06` is 4 months. */
export function monthsBetweenInclusive(start: string, end: string): number | null {
  const from = parseYearMonth(start);
  const to = parseYearMonth(end);
  if (!from || !to) return null;
  const months = (to.year - from.year) * 12 + (to.month - from.month) + 1;
  return months > 0 ? months : null;
}

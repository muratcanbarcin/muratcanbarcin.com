export type Locale = "en" | "tr";

/** A value that must be provided for every supported locale. */
export type Localized<T> = Record<Locale, T>;

export type LocalizedString = Localized<string>;

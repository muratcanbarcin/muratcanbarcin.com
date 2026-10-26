export interface SiteSocialCopy {
  openGraphDescription: string;
  twitterDescription: string;
  imageAlt: string;
  /** Role line drawn on the generated social card. */
  imageRole: string;
  /** Highlight chips drawn on the generated social card. */
  imageTagline: string[];
}

export interface SiteConfig {
  /** Canonical origin without a trailing slash. */
  url: string;
  name: string;
  websiteName: string;
  title: string;
  titleTemplate: string;
  /** Schema.org `jobTitle`. Kept separate from the on-page headline. */
  jobTitle: string;
  givenName: string;
  familyName: string;
  username: string;
  alternateNames: readonly string[];
  description: string;
  social: SiteSocialCopy;
  /** Open Graph locale, e.g. `en_US`. */
  locale: string;
  alternateLocales: string[];
  keywords: string[];
  knowsAbout: string[];
}

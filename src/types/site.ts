export interface SiteSocialCopy {
  openGraphDescription: string;
  twitterDescription: string;
  imageAlt: string;
  /** Rendered as the `[ a • b • c ]` terminal tag on generated social cards. */
  imageTagline: string[];
}

export interface SiteConfig {
  /** Canonical origin without a trailing slash. */
  url: string;
  name: string;
  websiteName: string;
  title: string;
  titleTemplate: string;
  description: string;
  social: SiteSocialCopy;
  /** Open Graph locale, e.g. `en_US`. */
  locale: string;
  alternateLocales: string[];
  keywords: string[];
  knowsAbout: string[];
}

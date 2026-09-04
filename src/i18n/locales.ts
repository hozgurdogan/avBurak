/**
 * The three locales the site is published in.
 *
 * `tr` is first because it is the default: `/` redirects there, and it is the
 * fallback when neither the NEXT_LOCALE cookie nor Accept-Language matches.
 */
export const locales = ['tr', 'en', 'ar'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'tr';

/** Locales written right-to-left. Drives `dir` on <html> and the RTL variants. */
const rtlLocales = new Set<Locale>(['ar']);

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getDirection(locale: Locale): 'ltr' | 'rtl' {
  return rtlLocales.has(locale) ? 'rtl' : 'ltr';
}

/**
 * BCP 47 tags used for `hreflang`, `<html lang>` and Intl formatting.
 * `tr-TR` and `ar` are deliberate: the Arabic edition addresses Gulf and MENA
 * readers generally rather than one country, so it stays region-neutral.
 */
export const localeTags: Record<Locale, string> = {
  tr: 'tr-TR',
  en: 'en-GB',
  ar: 'ar',
};

/** Endonyms for the language switcher - each language names itself. */
export const localeNames: Record<Locale, string> = {
  tr: 'Türkçe',
  en: 'English',
  ar: 'العربية',
};

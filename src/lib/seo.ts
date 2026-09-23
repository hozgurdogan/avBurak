import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';
import { localeTags, type Locale } from '@/i18n/locales';

/**
 * Per-page metadata: canonical URL, and the Open Graph / Twitter fields the
 * SEO audit (rapor/, 2026-09-18) flagged as missing entirely. One call per
 * `generateMetadata`, so every indexable page gets the same shape instead of
 * each file reinventing it - see the audit's P0/P1 list, items 3 and 7.
 *
 * `path` is the Turkish URL segment shared by all three locales (this site's
 * routing convention - see `src/i18n/routing.ts`), without a locale prefix
 * and without a leading slash: `''` for the home page, `'profil'`,
 * `'calisma-alanlari/is-hukuku'`, and so on.
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  languages,
  ogType = 'website',
}: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  /** Pass through an existing `alternates.languages` map (hreflang) - e.g.
   *  from `getArticleAlternates` - to merge it with the canonical below
   *  rather than one silently overwriting the other. */
  languages?: Record<string, string>;
  ogType?: 'website' | 'article';
}): Metadata {
  const canonicalPath = `/${locale}${path ? `/${path}` : ''}`;

  // Static pages keep the same Turkish path segment in every locale (see
  // `src/i18n/routing.ts`), so the hreflang set can be derived from `path`
  // alone. A page whose path genuinely differs per locale - only articles,
  // since their slugs are user-authored per translation - passes its own
  // `languages` map instead, which takes precedence.
  const defaultLanguages = Object.fromEntries(
    routing.locales.map((l) => [l, `/${l}${path ? `/${path}` : ''}`]),
  );

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
      languages: languages ?? defaultLanguages,
    },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      siteName: 'Av. Burak Uğur Öztürk',
      locale: localeTags[locale].replace('-', '_'),
      type: ogType,
      alternateLocale: routing.locales
        .filter((l) => l !== locale)
        .map((l) => localeTags[l as Locale].replace('-', '_')),
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

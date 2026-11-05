import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';
import { localeTags, type Locale } from '@/i18n/locales';
import { languageAlternates, SITE_NAME } from '@/lib/site';

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
  image,
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
  image?: string | null;
}): Metadata {
  const canonicalPath = `/${locale}${path ? `/${path}` : ''}`;

  // The file-convention `[locale]/opengraph-image.tsx` route is only picked
  // up automatically when a segment has *no* `generateMetadata` of its own -
  // every public page here does, and Next replaces (rather than merges) the
  // inherited `openGraph`/`twitter` objects once a page returns its own. The
  // 22 Ekim 2026 structural audit caught this: `twitter:card` was already
  // `summary_large_image`, but no page actually shipped an `og:image`, since
  // this object was never pointed at the route. Pointing every page at the
  // same shared, per-locale image (rather than per-page OG images) matches
  // the simpler scope that route was built for.
  const ogImage = {
    url: image ?? `/${locale}/opengraph-image`,
    ...(!image || image.endsWith('/opengraph-image') || image.endsWith('/share-image') ? { width: 1200, height: 630 } : {}),
    alt: 'Av. Burak Uğur Öztürk',
  };

  // Static pages keep the same Turkish path segment in every locale (see
  // `src/i18n/routing.ts`), so the hreflang set can be derived from `path`
  // alone. A page whose path genuinely differs per locale - only articles,
  // since their slugs are user-authored per translation - passes its own
  // `languages` map instead, which takes precedence.
  const defaultLanguages = Object.fromEntries(
    routing.locales.map((l) => [l, `/${l}${path ? `/${path}` : ''}`]),
  );
  const fullTitle = path && title !== SITE_NAME ? `${title} — ${SITE_NAME}` : title;

  return {
    title: { absolute: fullTitle },
    description,
    alternates: {
      canonical: canonicalPath,
      languages: languageAlternates(languages ?? defaultLanguages),
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalPath,
      siteName: 'Av. Burak Uğur Öztürk',
      locale: localeTags[locale].replace('-', '_'),
      type: ogType,
      alternateLocale: routing.locales
        .filter((l) => l !== locale)
        .map((l) => localeTags[l as Locale].replace('-', '_')),
      images: [ogImage],
    },
    twitter: {
      // 'summary_large_image' now that every locale has a real share image
      // (src/app/[locale]/opengraph-image.tsx) - 'summary' renders it as a
      // small thumbnail, wasting the card.
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage.url],
    },
  };
}

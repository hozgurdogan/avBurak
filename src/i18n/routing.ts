import { defineRouting } from 'next-intl/routing';
import { defaultLocale, locales } from './locales';

/**
 * Routing configuration shared by the middleware, the navigation helpers and
 * the request config.
 *
 * `localePrefix: 'always'` keeps every URL explicit (`/tr/...`, `/en/...`,
 * `/ar/...`). The alternative - hiding the prefix for the default locale -
 * would give the Turkish edition two addresses (`/` and `/tr/`), which then has
 * to be papered over with canonical tags. Being explicit is cheaper.
 *
 * Path segments stay Turkish in every locale (`/en/makaleler`, not
 * `/en/articles`). That is what the brief specifies, and it keeps one URL shape
 * per page across all three editions, so a shared link resolves the same way
 * whichever language the recipient reads.
 */
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
  // Detection order is cookie first, then Accept-Language - handled by the
  // middleware. The cookie is the only one this site sets without consent,
  // which is permitted because it is strictly necessary to serve the page.
  localeDetection: true,
  localeCookie: {
    name: 'NEXT_LOCALE',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  },
  // Default true makes the middleware itself emit an HTTP `Link:
  // rel="alternate"` header, built by swapping the locale prefix on the
  // *current* pathname - correct for a route whose path is identical
  // across locales, wrong for an article's `/makaleler/<slug>`, since each
  // locale has its own, different slug. The SEO review (16 Ekim 2026)
  // found exactly this: a Turkish article's response header advertised
  // EN/AR article URLs built from its own TR slug, which 404 because no
  // such URL was ever published. `pageMetadata()` (src/lib/seo.ts) already
  // emits the correct, per-page HTML `<link rel="alternate">` set (real
  // translated slugs for articles, via `getArticleAlternates`; the shared
  // path for every static page) - disabling this stops the two
  // mechanisms from disagreeing.
  alternateLinks: false,
});

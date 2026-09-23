import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { PageViewBeacon } from '@/components/analytics/page-view-beacon';
import { CookieConsentBanner } from '@/components/analytics/cookie-consent-banner';
import { JsonLd } from '@/components/seo/json-ld';
import { buildLegalServiceSchema } from '@/lib/structured-data';
import type { Locale } from '@/i18n/locales';

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * The public site's chrome: header, `<main>` (the skip link's target) and
 * footer. Every marketing/content route sits under this group; `/admin` is a
 * sibling of `(public)`, not a child, so it never picks this up - see the
 * note in `[locale]/layout.tsx`. That is also why the site-wide
 * `LegalService` schema (the SEO audit's P1 "Organization/Person" item)
 * lives here rather than in the root layout: the admin panel is not a
 * business listing.
 *
 * `CookieConsentBanner` decides its own visibility client-side (reads
 * `document.cookie` after mount) rather than this layout checking the cookie
 * server-side with `cookies()` - calling that dynamic API here would force
 * every page under this layout out of static generation, which is a much
 * larger cost than the banner's brief post-hydration appearance on a first
 * visit. `PageViewBeacon` is always rendered; the server side
 * (`recordPageView`) is what no-ops without consent, not this component.
 */
export default async function PublicLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  return (
    <>
      <JsonLd data={buildLegalServiceSchema(locale as Locale)} />
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <PageViewBeacon />
      <CookieConsentBanner />
    </>
  );
}

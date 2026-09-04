import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { getDirection, localeTags, type Locale } from '@/i18n/locales';
import { fontVariables } from '@/lib/fonts';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { SkipLink } from '@/components/layout/skip-link';
import '../globals.css';

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

/** Pre-renders all three locales at build time instead of on first request. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home.meta' });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t('title'),
      // Inner pages append the practice name rather than a marketing strapline.
      template: `%s — ${t('title')}`,
    },
    description: t('description'),
    // No indexing directives beyond the defaults; robots.txt and per-route
    // metadata arrive in Phase 6.
    formatDetection: { telephone: false, address: false, email: false },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Opts this subtree into static rendering; without it every page using
  // translations would be forced to render dynamically on each request.
  setRequestLocale(locale);

  const typedLocale = locale as Locale;

  return (
    <html
      lang={localeTags[typedLocale]}
      dir={getDirection(typedLocale)}
      className={fontVariables}
      suppressHydrationWarning
    >
      <body className="flex min-h-dvh flex-col bg-canvas text-ink antialiased">
        <NextIntlClientProvider>
          <SkipLink />
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

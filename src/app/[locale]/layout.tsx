import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { getDirection, localeTags, type Locale } from '@/i18n/locales';
import { fontVariables } from '@/lib/fonts';
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

/**
 * The real root layout - the one that renders `<html>`/`<body>`, because
 * `lang`/`dir` cannot be decided before the locale segment is read.
 *
 * Deliberately thin: it holds only what every route under this locale needs
 * (fonts, direction, the translation provider, the skip link). The public
 * site's header/footer chrome lives one level down in `(public)/layout.tsx`
 * so that `/admin` - a sibling of `(public)`, not a child of it - never
 * inherits the public nav or footer. Route groups don't affect the URL: this
 * is a rendering split, not a routing one.
 */
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
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

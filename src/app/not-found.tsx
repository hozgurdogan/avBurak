import Link from 'next/link';
import { fontVariables } from '@/lib/fonts';
import './globals.css';

/**
 * Root-level not-found: served for a path that never reaches the `[locale]`
 * segment at all (middleware normally redirects `/` to `/tr` before that
 * could happen, but a malformed or bot-probed path can still land here). The
 * root layout renders nothing of its own (see `app/layout.tsx`), so this file
 * renders the full `<html>`/`<body>` itself and imports the design tokens
 * directly, rather than inheriting them from a locale layout it never reaches.
 *
 * No `next-intl` here - there is no locale to resolve. The copy is Turkish,
 * the site's default locale, with a short English line beneath it, and the
 * link goes to `/`, which the middleware then routes to the right locale.
 */
export default function RootNotFound() {
  return (
    <html lang="tr" dir="ltr" className={fontVariables}>
      <body className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-gutter text-center text-ink antialiased">
        <p className="label text-gold-800">Hata 404</p>
        <h1 className="mt-4 font-display text-display-sm font-normal text-ink">
          Aradığınız sayfa bulunamadı
        </h1>
        <p className="mt-3 text-sm text-ink-muted">Page not found.</p>
        <div className="mt-10">
          <Link
            href="/"
            className="border-b border-current pb-0.5 text-xs font-medium uppercase tracking-label text-gold-800 hover:text-ink"
          >
            Anasayfaya dön — Home
          </Link>
        </div>
      </body>
    </html>
  );
}

'use client';

// Error boundaries must be Client Components in Next.js - this is the one
// place on the site a runtime error surfaces to the visitor instead of a
// blank screen.

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function LocaleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('error');

  useEffect(() => {
    // No third-party error reporting on this site (see the KVKK/privacy
    // constraints) - a server-side console line is what's available.
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto flex max-w-wide flex-col items-start px-gutter py-section">
      <p className="label text-gold-800">{t('label')}</p>
      <h1 className="mt-4 font-display text-display-sm font-normal text-ink">{t('title')}</h1>
      <p className="measure mt-6 text-md text-ink-muted">{t('body')}</p>
      <div className="mt-10">
        <button
          type="button"
          onClick={reset}
          className="bg-navy-900 px-6 py-3.5 text-xs font-medium uppercase tracking-label text-canvas transition-colors duration-base hover:bg-navy-800"
        >
          {t('retry')}
        </button>
      </div>
    </section>
  );
}

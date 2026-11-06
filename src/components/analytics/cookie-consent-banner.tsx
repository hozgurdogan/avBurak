'use client';

// Client component: it decides visibility after mount via the consent API
// (the preference cookie is HttpOnly),
// see (public)/layout.tsx for why that check happens client-side,
// not happen server-side) and has to react to a button press without a full
// page reload.

import { useEffect, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { configureGa4 } from '@/lib/ga4-client';

export function CookieConsentBanner() {
  const t = useTranslations('cookieConsent');
  const [visible, setVisible] = useState(false);
  const [ga4Enabled, setGa4Enabled] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    void fetch('/api/consent', { cache: 'no-store' })
      .then((response) => response.json())
      .then(({ choice, ga4Enabled: enabled, ga4Answered }) => {
        if (active) {
          setGa4Enabled(enabled === true);
          setVisible((choice !== 'accepted' && choice !== 'declined') || (enabled === true && !ga4Answered));
        }
      })
      .catch(() => { if (active) setVisible(true); });
    const openSettings = () => {
      void fetch('/api/consent', { cache: 'no-store' }).then((response) => response.json())
        .then((consent) => { if (active) { setGa4Enabled(consent.ga4Enabled === true); setVisible(true); } })
        .catch(() => { if (active) setVisible(true); });
    };
    window.addEventListener('open-cookie-settings', openSettings);
    return () => { active = false; window.removeEventListener('open-cookie-settings', openSettings); };
  }, []);

  if (!visible) return null;

  const respond = (accepted: boolean) => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/consent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accepted, ga4Accepted: accepted && ga4Enabled }),
        });
        if (!response.ok) return;
        if (!accepted) configureGa4(null, false);
        setVisible(false);
        window.dispatchEvent(new Event('consent-updated'));
      } catch {
        // Keep the banner available for a retry; failed requests aren't consent.
      }
    });
  };

  return (
    <div
      role="region"
      aria-label={t('label')}
      className="cookie-consent-position fixed inset-x-0 z-50 border-t border-rule bg-canvas/95 px-gutter py-5 backdrop-blur-frost"
    >
      <div className="mx-auto flex max-w-wide flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-md text-ink-muted">
          {t.rich(ga4Enabled ? 'bodyGa4' : 'body', {
            link: (chunks) => (
              <Link href="/kvkk" className="underline hover:text-ink">
                {chunks}
              </Link>
            ),
          })}
        </p>
        <div className="flex shrink-0 items-center gap-6">
          <button
            type="button"
            onClick={() => respond(false)}
            disabled={isPending}
            className="label-lg text-ink-muted transition-colors duration-base hover:text-ink disabled:opacity-60"
          >
            {t('decline')}
          </button>
          <button
            type="button"
            onClick={() => respond(true)}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-sm bg-navy-900 px-5 py-2.5 text-sm font-medium uppercase tracking-label text-canvas transition-colors duration-base ease-out-editorial hover:bg-navy-800 disabled:opacity-60"
          >
            {t('accept')}
          </button>
        </div>
      </div>
    </div>
  );
}

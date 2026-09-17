'use client';

// Client component: it decides its own visibility from `document.cookie`
// after mount (see the note in (public)/layout.tsx for why that check does
// not happen server-side) and has to react to a button press without a full
// page reload.

import { useEffect, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const CONSENT_COOKIE_NAME = 'cookie_consent';

function hasAnsweredConsent(): boolean {
  return document.cookie
    .split('; ')
    .some((entry) => entry.startsWith(`${CONSENT_COOKIE_NAME}=`));
}

export function CookieConsentBanner() {
  const t = useTranslations('cookieConsent');
  const [visible, setVisible] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!hasAnsweredConsent()) setVisible(true);
  }, []);

  if (!visible) return null;

  const respond = (accepted: boolean) => {
    startTransition(async () => {
      try {
        await fetch('/api/consent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accepted }),
        });
      } finally {
        setVisible(false);
      }
    });
  };

  return (
    <div
      role="region"
      aria-label={t('label')}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-rule bg-canvas/95 px-gutter py-5 backdrop-blur-frost"
      style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="mx-auto flex max-w-wide flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm text-ink-muted">
          {t.rich('body', {
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
            className="inline-flex items-center gap-2 rounded-sm bg-navy-900 px-5 py-2.5 text-xs font-medium uppercase tracking-label text-canvas transition-colors duration-base ease-out-editorial hover:bg-navy-800 disabled:opacity-60"
          >
            {t('accept')}
          </button>
        </div>
      </div>
    </div>
  );
}

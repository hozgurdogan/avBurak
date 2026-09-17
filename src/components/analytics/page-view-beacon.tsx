'use client';

// Client component: needs to notice every client-side navigation, which a
// server component cannot observe. Fires a same-origin POST to our own
// /api/track - no script tag, no third-party host, nothing that the site's
// CSP `connect-src 'self'` does not already allow. The server decides
// whether anything gets recorded (src/lib/analytics.ts): a silent no-op
// unless the visitor has accepted the cookie banner.

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { usePathname } from '@/i18n/navigation';

export function PageViewBeacon() {
  const pathname = usePathname();
  const locale = useLocale();

  useEffect(() => {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname, locale }),
      keepalive: true,
    }).catch(() => undefined);
  }, [pathname, locale]);

  return null;
}

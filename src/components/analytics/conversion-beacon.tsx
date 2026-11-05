'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { trackGa4 } from '@/lib/ga4-client';

export function ConversionBeacon() {
  const locale = useLocale();
  const pathname = usePathname();
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest('a') : null;
      if (!link) return;
      const name = link.protocol === 'tel:' ? 'phone_click' : link.hostname === 'wa.me' ? 'whatsapp_click' : null;
      if (!name) return;
      trackGa4(name, `/${locale}${pathname === '/' ? '' : pathname}`, locale);
      void fetch('/api/events', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true,
        body: JSON.stringify({ name, locale, path: pathname }),
      }).catch(() => undefined);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [locale, pathname]);
  return null;
}

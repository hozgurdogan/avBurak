'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { configureGa4, trackGa4 } from '@/lib/ga4-client';

export function Ga4Beacon() {
  const locale = useLocale();
  const pathname = usePathname();
  useEffect(() => {
    const controller = new AbortController();
    let generation = 0;
    const update = async () => {
      const requestGeneration = ++generation;
      try {
        const response = await fetch('/api/consent', { cache: 'no-store', signal: controller.signal });
        if (!response.ok) return;
        const consent = await response.json();
        if (controller.signal.aborted || requestGeneration !== generation) return;
        configureGa4(consent.measurementId, consent.ga4Allowed === true);
        trackGa4('page_view', `/${locale}${pathname === '/' ? '' : pathname}`, locale);
      } catch { /* No consent response means no Google request. */ }
    };
    void update();
    window.addEventListener('consent-updated', update);
    return () => { controller.abort(); window.removeEventListener('consent-updated', update); };
  }, [locale, pathname]);
  return null;
}

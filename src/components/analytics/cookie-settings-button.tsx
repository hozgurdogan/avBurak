'use client';

import { useTranslations } from 'next-intl';

export function CookieSettingsButton() {
  const t = useTranslations('cookieConsent');
  return <button type="button" className="text-md hover:text-gold-300"
    onClick={() => window.dispatchEvent(new Event('open-cookie-settings'))}>{t('settings')}</button>;
}

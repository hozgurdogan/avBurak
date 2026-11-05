type AnalyticsWindow = Window & {
  dataLayer?: unknown[][];
  gtag?: (...args: unknown[]) => void;
  [key: `ga-disable-${string}`]: boolean;
};

let activeId: string | null = null;
let lastPath: string | null = null;

export function configureGa4(measurementId: string | null, allowed: boolean) {
  if (typeof window === 'undefined') return;
  const browser = window as unknown as AnalyticsWindow;
  if (!allowed || !measurementId || !/^G-[A-Z0-9]+$/.test(measurementId)) {
    if (activeId) {
      browser[`ga-disable-${activeId}`] = true;
      browser.gtag?.('consent', 'update', { analytics_storage: 'denied' });
    }
    activeId = null;
    lastPath = null;
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0]?.trim();
      if (!name || !/^_ga(?:_|$)/.test(name)) continue;
      const domains = ['', location.hostname, `.${location.hostname}`];
      for (const domain of domains) document.cookie = `${name}=; Max-Age=0; Path=/${domain ? `; Domain=${domain}` : ''}`;
    }
    return;
  }
  if (activeId === measurementId) return;
  if (activeId) browser[`ga-disable-${activeId}`] = true;
  browser.dataLayer ??= [];
  browser.gtag ??= (...args: unknown[]) => { browser.dataLayer!.push(args); };
  browser[`ga-disable-${measurementId}`] = false;
  browser.gtag('consent', 'default', {
    analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
  });
  browser.gtag('consent', 'update', { analytics_storage: 'granted' });
  browser.gtag('js', new Date());
  browser.gtag('config', measurementId, {
    send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false,
    page_location: `${location.origin}${location.pathname}`, page_referrer: '',
    cookie_expires: 60 * 60 * 24 * 396,
  });
  if (!document.getElementById('ga4-script')) {
    const script = document.createElement('script');
    script.id = 'ga4-script'; script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);
  }
  activeId = measurementId;
}

export function trackGa4(name: 'page_view' | 'phone_click' | 'whatsapp_click' | 'contact_submit', path: string, locale: string) {
  if (!activeId || typeof window === 'undefined') return;
  const cleanPath = path.split(/[?#]/)[0]!;
  if (name === 'page_view' && lastPath === cleanPath) return;
  if (name === 'page_view') lastPath = cleanPath;
  (window as unknown as AnalyticsWindow).gtag?.('event', name, {
    send_to: activeId, page_location: `${location.origin}${cleanPath}`, page_path: cleanPath,
    page_referrer: '', language: locale,
  });
}

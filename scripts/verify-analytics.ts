import assert from 'node:assert/strict';
import { ga4Configuration } from '../src/lib/ga4-config';
import { configureGa4, trackGa4 } from '../src/lib/ga4-client';

assert.deepEqual(ga4Configuration({}), { enabled: false, measurementId: null });
assert.equal(ga4Configuration({ GA4_ENABLED: 'true', GA4_MEASUREMENT_ID: 'invalid' }).enabled, false);
assert.equal(ga4Configuration({ GA4_MEASUREMENT_ID: 'G-TEST123' }).enabled, false);
assert.equal(ga4Configuration({ GA4_ENABLED: 'true', GA4_MEASUREMENT_ID: 'G-TEST123' }).enabled, true);

const scripts: Record<string, unknown>[] = [];
const cookieWrites: string[] = [];
const browser: Record<string, unknown> = {};
const doc = {
  get cookie() { return '_ga=old; _ga_TEST=old; NEXT_LOCALE=tr'; },
  set cookie(value: string) { cookieWrites.push(value); },
  getElementById: () => scripts[0] ?? null,
  createElement: () => ({}),
  head: { appendChild: (script: Record<string, unknown>) => scripts.push(script) },
};
Object.defineProperty(globalThis, 'window', { value: browser, configurable: true });
Object.defineProperty(globalThis, 'document', { value: doc, configurable: true });
Object.defineProperty(globalThis, 'location', { value: { origin: 'https://burakugurozturk.av.tr', pathname: '/tr', hostname: 'burakugurozturk.av.tr' }, configurable: true });

configureGa4(null, false);
trackGa4('phone_click', '/tr/iletisim', 'tr');
assert.equal(scripts.length, 0, 'No Google script without consent');
assert.equal(browser.dataLayer, undefined, 'No Google events without consent');
configureGa4('G-TEST123', true);
assert.equal(scripts.length, 1);
const events = Reflect.get(browser, 'dataLayer') as unknown[][];
assert.deepEqual(events[0], ['consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' }]);
trackGa4('page_view', '/tr/iletisim?q=private', 'tr');
trackGa4('page_view', '/tr/iletisim?q=private', 'tr');
assert.equal(events.filter((args) => args[0] === 'event' && args[1] === 'page_view').length, 1);
const parameters = events.at(-1)![2] as Record<string, string>;
assert.equal(parameters.page_location, 'https://burakugurozturk.av.tr/tr/iletisim');
assert.equal(parameters.page_referrer, '');
configureGa4(null, false);
const count = events.length;
trackGa4('contact_submit', '/tr/iletisim', 'tr');
assert.equal(events.length, count, 'Revocation stops further events');
assert.equal(browser['ga-disable-G-TEST123'], true);
assert.ok(cookieWrites.some((cookie) => cookie.startsWith('_ga=;')));
assert.ok(cookieWrites.every((cookie) => !cookie.startsWith('NEXT_LOCALE=')));
console.log('GA4 checks passed: disabled-by-default, consent, event privacy, deduplication and withdrawal.');

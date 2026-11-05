import assert from 'node:assert/strict';
import http from 'node:http';

async function main() {
  const base = process.env.SEO_TEST_ORIGIN || 'http://127.0.0.1:3210';
  const get = (path, options = {}) => fetch(base + path, { redirect: 'manual', signal: AbortSignal.timeout(20000), ...options });
  for (const path of ['/', '/tr/']) {
    const response = await get(path);
    assert.equal(response.status, 301, path);
    assert.equal(new URL(response.headers.get('location'), base).pathname, '/tr');
  }
  // Native fetch discards a custom Host; use http.request for the host variant.
  const www = await new Promise((resolve, reject) => {
    http.get(base + '/', { headers: { host: 'www.burakugurozturk.av.tr' } }, (response) => {
      response.resume(); resolve(response);
    }).on('error', reject);
  });
  assert.equal(www.statusCode, 301);
  assert.equal(www.headers.location, 'https://burakugurozturk.av.tr/tr');
  for (const path of ['/tr/profil', '/tr/bolgeler/esenyurt', '/ar/bolgeler/mimaroba', '/ar/sss']) {
    const response = await get(path);
    assert.equal(response.status, 200, path);
    assert.equal(response.headers.get('strict-transport-security'), 'max-age=31536000');
    const html = await response.text();
    assert.match(html, /hrefLang="x-default"/i);
    assert.equal(html.match(/<title>(.*?)<\/title>/s)?.[1], html.match(/<meta property="og:title" content="([^"]+)"/s)?.[1], path);
    if (path.startsWith('/ar')) assert.match(html, /<html[^>]+lang="ar"[^>]+dir="rtl"/);
    if (path.endsWith('/sss')) assert.match(html, /"@type":"FAQPage"/);
    if (path.endsWith('/esenyurt')) {
      const links = new Set([...html.matchAll(/href="\/tr\/calisma-alanlari\/([^"?#]+)/g)].map((match) => match[1]));
      assert.equal(links.size, 11);
      assert.ok(html.includes('rayp.adalet.gov.tr'));
      assert.ok(!html.includes('google.com/maps/dir/'));
    }
  }
  const robots = await (await get('/robots.txt')).text();
  assert.ok(robots.includes('Disallow: /ar/admin'));
  assert.ok(robots.includes('Sitemap: https://burakugurozturk.av.tr/sitemap.xml'));
  const consent = await get('/api/consent');
  assert.equal(consent.headers.get('cache-control'), 'no-store');
  const initialConsent = await consent.json();
  assert.equal(initialConsent.choice, null);
  assert.equal(initialConsent.ga4Allowed, false);
  assert.equal(initialConsent.measurementId, null);
  const declined = await get('/api/consent', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ accepted: false }) });
  assert.equal(declined.status, 200);
  assert.ok(declined.headers.get('set-cookie').includes('Secure'));
  const remembered = await get('/api/consent', { headers: { cookie: 'cookie_consent=declined' } });
  const declinedConsent = await remembered.json();
  assert.equal(declinedConsent.choice, 'declined');
  assert.equal(declinedConsent.ga4Allowed, false);
  const oldConsent = await get('/api/consent', { headers: { cookie: 'cookie_consent=accepted' } });
  assert.equal((await oldConsent.json()).ga4Allowed, false, 'Old first-party consent must not grant Google consent');
  if (initialConsent.ga4Enabled) {
    const save = async (body) => {
      const response = await get('/api/consent', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      assert.equal(response.status, 200);
      const cookie = response.headers.getSetCookie().map((value) => value.split(';')[0]).join('; ');
      return (await get('/api/consent', { headers: { cookie } })).json();
    };
    assert.equal((await save({ accepted: true })).ga4Allowed, false, 'Old clients cannot grant undisclosed GA4 consent');
    const allowed = await save({ accepted: true, ga4Accepted: true });
    assert.equal(allowed.ga4Allowed, true);
    assert.match(allowed.measurementId, /^G-/);
    const revoked = await save({ accepted: false, ga4Accepted: false });
    assert.equal(revoked.ga4Allowed, false);
    assert.equal(revoked.measurementId, null);
  }
  const event = await get('/api/events', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'phone_click', locale: 'tr', path: '/iletisim' }) });
  assert.equal(event.status, 204);
  console.log('Production HTTP SEO checks passed.');
}
main().catch((error) => { console.error(error); process.exitCode = 1; });

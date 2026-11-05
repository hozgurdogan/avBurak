import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const base = 'http://127.0.0.1:3210';
const origin = 'https://burakugurozturk.av.tr';
const decode = (value) => value.replaceAll('&amp;', '&').replaceAll('&#x27;', "'").replaceAll('&quot;', '"');
const text = (html) => decode(html.replace(/<[^>]+>/g, ''));
const get = (path, options = {}) => fetch(base + path, { redirect: 'manual', signal: AbortSignal.timeout(20000), ...options });

async function main() {
  const articleLinks = new Set();
  for (const locale of ['tr', 'en', 'ar']) {
    const messages = JSON.parse(await readFile(`messages/${locale}.json`, 'utf8'));
    for (const [slug, copy] of Object.entries(messages.serviceRegions)) {
      const path = `/${locale}/bolgeler/${slug}`;
      const response = await get(path);
      assert.equal(response.status, 200, path);
      const html = await response.text();
      const head = html.slice(0, html.indexOf('</head>'));
      assert.ok(head.includes('<meta name="description"'), `Description must be in head: ${path}`);
      const h1s = [...html.matchAll(/<h1\b[^>]*>(.*?)<\/h1>/gs)];
      assert.equal(h1s.length, 1, path);
      assert.ok(h1s[0][0].includes('text-display-sm'), 'Heading font size must survive class merging');
      assert.equal(text(h1s[0][1]), copy.h1);
      assert.equal(decode(html.match(/<title>(.*?)<\/title>/s)[1]), copy.pageTitle);
      assert.ok(html.includes(`href="${origin}${path}"`));
      assert.ok(!html.includes('google.com/maps/dir/'));
      assert.ok(!html.includes('<iframe'));
      const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
      assert.equal(ids.length, new Set(ids).size, 'Unique DOM IDs');
      for (const anchor of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(anchor[1]), `Broken outline ${path}#${anchor[1]}`);
      for (const link of html.matchAll(/href="(\/(?:tr|en|ar)\/makaleler\/[^"?#]+)"/g)) articleLinks.add(link[1]);
      if (locale === 'en') assert.ok(!html.includes('href="/en/makaleler/kiraci-erken-cikarsa-kalan-kira"'));
    }
  }
  for (const path of articleLinks) {
    const response = await get(path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1, `One H1 in ${path}`);
  }
  for (const slug of ['velayetin-degistirilmesi-davasi', 'mirastan-mal-kacirma-muris-muvazaasi']) {
    const response = await get(`/tr/makaleler/${slug}`);
    assert.equal(response.status, 200);
    assert.equal([...((await response.text()).matchAll(/<h1\b/g))].length, 1);
  }
  for (const path of ['/bolgeler/beylikduzu', '/calisma-alanlari/is-hukuku', '/bolgeler/beylikduzu/']) {
    const response = await get(path, { headers: { cookie: 'NEXT_LOCALE=en', 'accept-language': 'en' } });
    assert.equal(response.status, 301);
    assert.equal(new URL(response.headers.get('location'), base).pathname, `/tr${path.replace(/\/$/, '')}`);
  }
  const home = await (await get('/tr')).text();
  assert.equal(decode(home.match(/<title>(.*?)<\/title>/s)[1]), 'Av. Burak Uğur Öztürk | Hukuki Danışmanlık ve Dava Takibi');
  console.log(`Regional HTTP checks passed: 24 pages, ${articleLinks.size} real fixture article links, single H1 and permanent legacy redirects.`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; });

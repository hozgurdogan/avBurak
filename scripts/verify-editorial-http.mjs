import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const plan = JSON.parse(readFileSync('src/content/seo-rev3.json', 'utf8'));
const base = process.env.SEO_TEST_ORIGIN || 'http://127.0.0.1:3210';
const decode = (text) => text.replaceAll('&amp;', '&').replaceAll('&#x27;', "'").replaceAll('&quot;', '"');
const get = (path) => fetch(base + path, { signal: AbortSignal.timeout(20000) });
const sitemap = await (await get('/sitemap.xml')).text();
for (const article of plan) {
  const path = `/tr/makaleler/${article.slug}`;
  const response = await get(path);
  assert.equal(response.status, 200, path);
  const html = await response.text();
  const head = html.slice(0, html.indexOf('</head>'));
  assert.equal(decode(head.match(/<title>(.*?)<\/title>/s)?.[1]), article.metaTitle);
  assert.equal(decode(head.match(/<meta name="description" content="([^"]*)"/)?.[1]), article.metaDescription);
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
  assert.ok(html.includes(`href="https://burakugurozturk.av.tr${path}"`));
  assert.ok(!/hrefLang="(?:en|ar)"/i.test(head), 'No invented article translations');
  assert.ok(html.includes('<blockquote>') && html.includes('<table>'));
  assert.ok(html.includes('href="tel:+905436766533"'));
  const messageLinks = [...html.matchAll(/href="(https:\/\/wa.me\/[^\"]+\?text=[^\"]+)"/g)];
  assert.ok(messageLinks.some((match) => new URL(decode(match[1])).searchParams.get('text')?.includes(article.title)), path);
  for (const region of article.regions) assert.ok(html.includes(`href="/tr/bolgeler/${region}"`));
  if (article.checklist) {
    const pdf = await get(`/belgeler/${article.checklist}-belge-listesi.pdf`);
    assert.equal(pdf.status, 200);
    assert.match(pdf.headers.get('content-type'), /application\/pdf/);
  }
  assert.ok(sitemap.includes(`https://burakugurozturk.av.tr${path}`));
  for (const json of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
    const schema = JSON.parse(json[1]);
    if (schema['@type'] === 'Article') { assert.equal(schema.headline, article.title); assert.ok(schema.datePublished); }
  }
}
for (const locale of ['tr', 'en', 'ar']) {
  for (const path of [`/${locale}/calisma-alanlari/ceza-hukuku`, `/${locale}/bolgeler/beylikduzu-bosanma-avukati`]) {
    const response = await get(path); assert.equal(response.status, 200, path);
    const html = await response.text(); assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
    assert.ok(sitemap.includes(path));
  }
}
assert.equal((await get('/tr/makaleler/unpublished-editorial-fixture')).status, 404);
assert.ok(!sitemap.includes('unpublished-editorial-fixture'));
const earlyExit = await (await get('/tr/makaleler/kiraci-erken-cikarsa-kalan-kira')).text();
assert.ok(earlyExit.includes('/tr/makaleler/ev-sahibi-evden-cikmami-istiyor'));
console.log('Editorial HTTP checks passed: 9 articles, native links, real metadata, PDFs, 6 localized service pages, sitemap and unpublished isolation.');

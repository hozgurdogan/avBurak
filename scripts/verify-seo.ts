import assert from 'node:assert/strict';
import { pageMetadata } from '../src/lib/seo';
import { articleExcerpt, articleModifiedAt, languageAlternates } from '../src/lib/site';
import { buildArticleSchema } from '../src/lib/structured-data';
import { renderArticleMarkdown } from '../src/lib/markdown';
import { slugify } from '../src/lib/slug';
import { prisma } from '../src/lib/prisma';
import sitemap from '../src/app/sitemap';
import { businessProfile } from '../src/lib/business-profile';

async function main() {
  assert.equal(businessProfile({}).geo, null, 'Do not publish approximate office coordinates');
  assert.deepEqual(businessProfile({ GOOGLE_BUSINESS_PROFILE_URL: 'https://google.com.evil.example/business' }).sameAs, []);
  const verified = businessProfile({ GOOGLE_BUSINESS_PROFILE_URL: 'https://maps.app.goo.gl/test',
    BUSINESS_LATITUDE: '41.034', BUSINESS_LONGITUDE: '28.675',
    BUSINESS_HOURS_JSON: '[{"days":["Monday"],"opens":"09:00","closes":"18:00"}]' });
  assert.equal(verified.hours.length, 1);
  assert.equal(verified.sameAs.length, 1);
  assert.equal(verified.geo?.latitude, 41.034);
  assert.equal(businessProfile({ BUSINESS_LATITUDE: '999', BUSINESS_LONGITUDE: '28' }).geo, null);
  assert.equal(slugify('İlgili Hesaplama Aracı'), 'ilgili-hesaplama-araci');
  const markdown = '## İlgili Hesaplama Aracı\n\n## Aynı\n\n## Aynı\n\n## Ayni-1\n\n## مقدمة\n\n## مقدمة';
  const rendered = await renderArticleMarkdown(markdown);
  assert.equal(rendered.headings[0]?.id, 'ilgili-hesaplama-araci');
  assert.deepEqual(rendered.headings, (await renderArticleMarkdown(markdown)).headings);
  const ids = [...rendered.html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length, 'All heading and legacy IDs must be unique');
  assert.ok(rendered.html.includes('id="i̇lgili-hesaplama-aracı"'), 'Old Turkish fragments still resolve');
  for (const heading of rendered.headings) assert.ok(rendered.html.includes(`href="#${heading.id}"`));

  const published = new Date('2026-10-07T12:00:00Z');
  const modified = new Date('2026-10-02T12:00:00Z');
  assert.equal(articleModifiedAt(published, modified), published);
  const schema = buildArticleSchema({ locale: 'tr', path: 'makaleler/test', title: 'Test', description: 'Test', datePublished: published, dateModified: modified });
  assert.equal(schema.dateModified, schema.datePublished);
  assert.equal(schema.mainEntityOfPage, schema.url);
  assert.ok(schema.image.startsWith('https://'));
  assert.ok(articleExcerpt('kelime '.repeat(100)).length <= 160);
  assert.equal(articleExcerpt('Kısa özet.'), 'Kısa özet.');
  assert.deepEqual(languageAlternates({ en: '/en/test' }), { en: '/en/test', 'x-default': '/en/test' });
  const metadata = pageMetadata({ locale: 'tr', path: 'profil', title: 'Profil', description: 'Test' });
  assert.deepEqual(metadata.title, { absolute: 'Profil — Av. Burak Uğur Öztürk' });
  assert.equal(metadata.openGraph?.title, 'Profil — Av. Burak Uğur Öztürk');
  assert.equal(metadata.alternates?.languages?.['x-default'], '/tr/profil');

  const original = prisma.article.findMany;
  // The sitemap must use real translated slugs, never invent missing translations.
  prisma.article.findMany = (async () => [
    { locale: 'tr', slug: 'turkce', groupId: 'a', publishedAt: published, updatedAt: modified },
    { locale: 'en', slug: 'english', groupId: 'a', publishedAt: published, updatedAt: modified },
    { locale: 'ar', slug: 'arabic-only', groupId: 'b', publishedAt: published, updatedAt: modified },
  ]) as typeof prisma.article.findMany;
  try {
    const entries = await sitemap();
    const article = entries.find((entry) => entry.url.endsWith('/tr/makaleler/turkce'))!;
    assert.ok(article.alternates?.languages?.en?.endsWith('/en/makaleler/english'));
    assert.equal(article.alternates?.languages?.ar, undefined);
    assert.equal(article.lastModified, published);
    for (const entry of entries) {
      assert.ok(entry.alternates?.languages?.['x-default']);
      assert.ok(Object.values(entry.alternates!.languages!).every((url) => url?.startsWith('https://')));
    }
  } finally { prisma.article.findMany = original; }
  console.log('SEO checks passed: anchors, dates, metadata, excerpts and multilingual sitemap.');
}
main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });

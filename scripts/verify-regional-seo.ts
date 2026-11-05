import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pageMetadata } from '../src/lib/seo';
import { renderArticleMarkdown } from '../src/lib/markdown';
import { serviceRegionSlugs } from '../src/content/service-regions';
import { regionArticles, regionPracticeAreas, regionsForArticle } from '../src/content/region-guides';
import { articleEditorial } from '../src/content/article-editorial';
import { getRegionArticles } from '../src/lib/articles';
import { prisma } from '../src/lib/prisma';
import { cn } from '../src/lib/cn';

async function main() {
  assert.ok(cn('font-display text-display-sm font-normal', 'text-ink').includes('text-display-sm'));
  assert.ok(cn('text-md', 'text-ink-muted').includes('text-md'));
  assert.equal(cn('text-display-sm', 'text-display'), 'text-display');
  for (const locale of ['tr', 'en', 'ar'] as const) {
    const messages = JSON.parse(readFileSync(`messages/${locale}.json`, 'utf8'));
    for (const slug of serviceRegionSlugs) {
      const copy = messages.serviceRegions[slug];
      assert.ok(copy.summary && copy.cardSummary && copy.sections.length >= 2 && copy.faq.length >= 2);
      assert.equal(copy.directions, undefined);
      assert.ok(regionPracticeAreas[slug].length);
      assert.ok(regionArticles[slug].length);
      assert.equal(new Set(copy.sections.map((section: { id: string }) => section.id)).size, copy.sections.length);
      const meta = pageMetadata({ locale, path: `bolgeler/${slug}`, title: copy.pageTitle, description: copy.summary, brandTitle: false });
      assert.deepEqual(meta.title, { absolute: copy.pageTitle });
      assert.equal(meta.openGraph?.title, copy.pageTitle);
      assert.equal(meta.alternates?.canonical, `/${locale}/bolgeler/${slug}`);
      if (locale === 'tr') {
        assert.equal(copy.pageTitle, `${copy.name} Avukat | Av. Burak Uğur Öztürk`);
        assert.equal(copy.h1, `${copy.name}${slug === 'mimaroba' ? '' : ' Avukat'} Av. Burak Uğur Öztürk`);
      }
    }
    const mimaroba = JSON.stringify(messages.serviceRegions.mimaroba);
    assert.ok(!/ayrı bir şube|no separate.*branch|فرع مستقل/.test(mimaroba));
  }
  const title = 'Velayetin Değiştirilmesi Davası';
  const markdown = `# ${title}\n\n## Başvuru\n\nMetin.\n\n### Belgeler\n\nMetin.`;
  const normalized = await renderArticleMarkdown(markdown, [title]);
  assert.ok(!normalized.html.includes('<h1'));
  assert.ok(!normalized.html.includes(title));
  assert.deepEqual(normalized.headings.map((heading) => heading.level), [2, 3]);
  const mixed = await renderArticleMarkdown('# Farklı bölüm\n\n## Alt bölüm\n\nMetin.');
  assert.ok(!mixed.html.includes('<h1'));
  assert.deepEqual(mixed.headings.map((heading) => heading.level), [2, 3]);
  const repeated = await renderArticleMarkdown(`# ${title.toLocaleUpperCase('tr')}\n\n# Bölge\n\n# Sık Sorulan Sorular\n\n# Sonuç`, [title]);
  assert.ok(!repeated.html.includes('<h1'));
  assert.equal(repeated.headings.length, 3);
  assert.equal(articleEditorial('tr', 'kiraci-erken-cikarsa-kalan-kira')?.metaTitle, 'Kiracı Erken Çıkarsa Kalan Kirayı Öder mi?');
  assert.equal(articleEditorial('en', 'kiraci-erken-cikarsa-kalan-kira'), undefined);
  assert.ok(regionsForArticle('kiraci-erken-cikarsa-kalan-kira').includes('mimaroba'));

  const original = prisma.article.findMany;
  let call = 0;
  prisma.article.findMany = (async () => ++call === 1
    ? [{ slug: 'kiraci-erken-cikarsa-kalan-kira', groupId: 'lease' }, { slug: 'sigortasiz-calistim-hizmet-tespiti-davasi', groupId: 'employment' }]
    : [{ id: 'en-lease', groupId: 'lease', slug: 'tenant-leaves-early', title: 'Tenant leaves early', summary: 'Documents and handover records.', publishedAt: new Date(), coverImage: null, categories: [], readMinutes: 2 }]
  ) as unknown as typeof prisma.article.findMany;
  try {
    const links = await getRegionArticles('en', ['kiraci-erken-cikarsa-kalan-kira', 'sigortasiz-calistim-hizmet-tespiti-davasi']);
    assert.equal(links.length, 1, 'An untranslated article must not produce a link');
    assert.equal(links[0]?.slug, 'tenant-leaves-early');
    assert.equal(links[0]?.referenceSlug, 'kiraci-erken-cikarsa-kalan-kira');
  } finally { prisma.article.findMany = original; }
  console.log('Regional SEO checks passed: 24 guides, exact titles, heading hierarchy and real translated article links.');
}
main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });

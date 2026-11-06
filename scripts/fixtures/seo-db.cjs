// Explicit Node preload for local HTTP tests; never imported by the application.
if (process.env.SEO_FIXTURE !== '1') throw new Error('This fixture requires SEO_FIXTURE=1 and must never be loaded by the live server.');

const lease = 'kiraci-erken-cikarsa-kalan-kira';
const employment = 'sigortasiz-calistim-hizmet-tespiti-davasi';
const custody = 'velayetin-degistirilmesi-davasi';
const inheritance = 'mirastan-mal-kacirma-muris-muvazaasi';
function article(locale, slug, groupId, title, contentMd) {
  return { id: `${locale}-${slug}`, locale, slug, groupId, title, summary: 'Local fixture for verifying editorial titles, related guides and translated links.',
    contentMd, metaTitle: null, metaDescription: null, categories: [], coverImage: null,
    status: 'PUBLISHED', publishedAt: new Date('2026-01-01T12:00:00Z'), updatedAt: new Date('2026-01-02T12:00:00Z'), readMinutes: 2 };
}
const rows = [
  article('tr', lease, 'lease', 'Kiracı Erken Çıkarsa Kalan Kira', '# Kiracı Erken Çıkarsa Kalan Kira\n\n## Teslim belgeleri\n\nSözleşme ve teslim kaydı.\n\n## Değerlendirme\n\nHer dosya ayrı incelenir.'),
  article('en', 'tenant-leaves-early-fixture', 'lease', 'Tenant leaves early', '# Tenant leaves early\n\n## Documents\n\nContract and handover records.'),
  article('ar', 'tenant-ar-fixture', 'lease', 'الإخلاء المبكر', '# الإخلاء المبكر\n\n## الوثائق\n\nالعقد وسجلات التسليم.'),
  article('tr', employment, 'employment', 'Sigortasız Çalıştım: Hizmet Tespiti Davası', '# Sigortasız Çalıştım: Hizmet Tespiti Davası\n\n## Çalışma kayıtları\n\nBelgeler değerlendirilir.'),
  article('tr', custody, 'custody', 'Velayetin Değiştirilmesi Davası', '# Velayetin Değiştirilmesi Davası\n\n## Başvuru\n\nDosya belgeleri.\n\n### İnceleme\n\nDosyaya göre değerlendirme.'),
  article('tr', inheritance, 'inheritance', 'Mirastan Mal Kaçırma: Muris Muvazaası', '# Mirastan Mal Kaçırma: Muris Muvazaası\n\n## Tapu kaydı\n\nKayıtlar incelenir.'),
];
if (process.env.EDITORIAL_FIXTURE === '1') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- This fixture is a CommonJS Node preload.
  const { readFileSync } = require('node:fs');
  const plan = JSON.parse(readFileSync('src/content/seo-rev3.json', 'utf8'));
  const messages = JSON.parse(readFileSync('messages/tr.json', 'utf8'));
  for (const item of plan) {
    const row = article('tr', item.slug, `rev3-${item.id}`, item.title, readFileSync(`prisma/content/seo-rev3/${item.slug}.md`, 'utf8'));
    Object.assign(row, { summary: item.metaDescription, metaTitle: item.metaTitle, metaDescription: item.metaDescription,
      categories: [{ category: { slug: item.category, translations: [{ locale: 'tr', name: messages.practiceAreas[item.category].name }] } }] });
    rows.push(row);
  }
  const appendices = JSON.parse(readFileSync('prisma/content/seo-rev3/appendices.json', 'utf8'));
  for (const item of appendices) rows.push(article('tr', item.slug, `old-${item.slug}`, item.slug, item.markdown));
  rows.push({ ...article('tr', 'unpublished-editorial-fixture', 'draft', 'Unpublished draft', 'Draft'), status: 'DRAFT' });
}
function matches(row, where = {}) {
  if (where.locale && row.locale !== where.locale) return false;
  if (where.status && row.status !== where.status) return false;
  if (typeof where.slug === 'string' && row.slug !== where.slug) return false;
  if (where.slug?.in && !where.slug.in.includes(row.slug)) return false;
  if (typeof where.groupId === 'string' && row.groupId !== where.groupId) return false;
  if (where.groupId?.in && !where.groupId.in.includes(row.groupId)) return false;
  if (where.id?.not && row.id === where.id.not) return false;
  if (where.categories) {
    const slug = where.categories.some?.category?.slug;
    if (!row.categories.some(({ category }) => typeof slug === 'string' ? category.slug === slug : slug?.in?.includes(category.slug))) return false;
  }
  return true;
}
globalThis.prisma = {
  article: {
    findMany: async (query = {}) => rows.filter((row) => matches(row, query.where)).slice(query.skip ?? 0, query.take ? (query.skip ?? 0) + query.take : undefined),
    findFirst: async (query) => rows.find((row) => matches(row, query.where)) ?? null,
    count: async (query = {}) => rows.filter((row) => matches(row, query.where)).length,
  },
  category: { findMany: async () => [] },
};

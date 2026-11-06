import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { PrismaClient } from '@prisma/client';
import nextEnv from '@next/env';

const readJson = (file) => JSON.parse(readFileSync(resolve(file), 'utf8'));
export function loadEditorialRelease() {
  return { articles: readJson('src/content/seo-rev3.json').map((article) => ({ ...article,
    contentMd: readFileSync(resolve('prisma/content/seo-rev3', `${article.slug}.md`), 'utf8').trim(),
  })), appendices: readJson('prisma/content/seo-rev3/appendices.json') };
}
const minutes = (text) => Math.max(1, Math.ceil(text.split(/\s+/u).length / 200));
const normalize = (text) => text.toLocaleLowerCase('tr').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

/** Never reseed users, overwrite CMS edits, reset dates or invent translations. */
export async function importEditorialRelease(db, { apply = false, publishIds = [], now = new Date(), release = loadEditorialRelease() } = {}) {
  if (publishIds.some((id) => !release.articles.some((article) => article.id === id))) throw new Error('Unknown article ID.');
  if (new Set(publishIds).size !== publishIds.length) throw new Error('Duplicate publication ID.');
  if (publishIds.length > 2) throw new Error('The editorial plan allows at most two publications per seven days.');
  const current = await db.article.findMany({ where: { locale: 'tr', slug: { in: [...release.articles.map((a) => a.slug), ...release.appendices.map((a) => a.slug)] } } });
  const cutoff = new Date(now.getTime() - 7 * 86400000);
  const recent = current.filter((a) => a.status === 'PUBLISHED' && a.publishedAt && a.publishedAt > cutoff && release.articles.some((item) => item.slug === a.slug));
  const newlyPublished = release.articles.filter((a) => publishIds.includes(a.id) && !current.some((row) => row.slug === a.slug && row.status === 'PUBLISHED'));
  if (recent.length + newlyPublished.length > 2) throw new Error('Two articles have already been published within the last seven days.');
  const result = { mode: apply ? 'apply' : 'preview', articles: release.articles.map((article) => ({ id: article.id, wave: article.wave, slug: article.slug,
    action: current.some((row) => row.slug === article.slug) ? 'preserve-existing' : 'create-draft',
    publish: publishIds.includes(article.id),
  })), appendices: release.appendices.map((appendix) => {
    const existing = current.find((article) => article.slug === appendix.slug);
    return { slug: appendix.slug, action: !existing ? 'missing-article' : normalize(existing.contentMd).includes(normalize(appendix.heading)) ? 'already-present' : 'append-section' };
  }) };
  if (!apply) return result;
  if (result.appendices.some((item) => item.action === 'missing-article')) throw new Error('An existing article is missing; no changes applied. Run without --apply to inspect.');
  const author = await db.user.findFirst({ where: { role: 'ADMIN' }, orderBy: { createdAt: 'asc' }, select: { id: true } });
  if (!author) throw new Error('No existing administrator author found; no users will be created.');
  await db.$transaction(async (tx) => {
    const categoryIds = new Map();
    for (const slug of new Set(release.articles.map((article) => article.category))) {
      const category = await tx.category.upsert({ where: { slug }, update: {}, create: { slug, position: slug === 'ceza-hukuku' ? 15 : 14 } });
      categoryIds.set(slug, category.id);
      for (const locale of ['tr', 'en', 'ar']) {
        const name = readJson(`messages/${locale}.json`).practiceAreas[slug].name;
        await tx.categoryTr.upsert({ where: { categoryId_locale: { categoryId: category.id, locale } }, update: {}, create: { categoryId: category.id, locale, name } });
      }
    }
    for (const article of release.articles) {
      const existing = current.find((row) => row.slug === article.slug);
      let id = existing?.id;
      if (!existing) {
        const group = await tx.articleGroup.create({ data: {} });
        const row = await tx.article.create({ data: {
          groupId: group.id, locale: 'tr', slug: article.slug, title: article.title, summary: article.metaDescription,
          metaTitle: article.metaTitle, metaDescription: article.metaDescription, contentMd: article.contentMd,
          readMinutes: minutes(article.contentMd), status: 'DRAFT', publishedAt: null, authorId: author.id,
          categories: { create: { categoryId: categoryIds.get(article.category) } },
        } });
        id = row.id;
      }
      if (publishIds.includes(article.id) && existing?.status !== 'PUBLISHED') {
        await tx.article.update({ where: { id }, data: { status: 'PUBLISHED', publishedAt: now } });
      }
    }
    for (const appendix of release.appendices) {
      if (result.appendices.find((item) => item.slug === appendix.slug).action !== 'append-section') continue;
      const existing = current.find((article) => article.slug === appendix.slug);
      const contentMd = `${existing.contentMd.trim()}\n\n${appendix.markdown}\n`;
      // Abort the transaction rather than overwrite an edit made during import.
      const changed = await tx.article.updateMany({ where: { id: existing.id, updatedAt: existing.updatedAt }, data: { contentMd, readMinutes: minutes(contentMd) } });
      if (changed.count !== 1) throw new Error(`Concurrent edit detected for ${appendix.slug}; retry after reviewing the draft.`);
    }
  }, { timeout: 30000 });
  return result;
}

async function main() {
  nextEnv.loadEnvConfig(process.cwd());
  const publishArg = process.argv.find((arg) => arg.startsWith('--publish='));
  const publishIds = publishArg ? publishArg.slice('--publish='.length).split(',').map(Number) : [];
  const db = new PrismaClient();
  try { console.log(JSON.stringify(await importEditorialRelease(db, { apply: process.argv.includes('--apply'), publishIds }), null, 2)); }
  finally { await db.$disconnect(); }
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) main().catch((error) => { console.error(error.message); process.exitCode = 1; });

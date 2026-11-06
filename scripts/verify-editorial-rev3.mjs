import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { test } from 'node:test';
import { loadEditorialRelease, importEditorialRelease } from './import-editorial-rev3.mjs';

const release = loadEditorialRelease();
function database() {
  let sequence = 0;
  let state = { articles: release.appendices.map((item) => ({ id: `old-${item.slug}`, locale: 'tr', slug: item.slug, title: 'Existing CMS title', contentMd: 'Existing editorial content.', status: 'PUBLISHED', publishedAt: new Date('2025-01-01'), updatedAt: new Date('2026-01-01') })), categories: [], translations: [], groups: [] };
  const db = {
    article: {
      findMany: async () => structuredClone(state.articles),
      create: async ({ data }) => { const row = { ...data, id: `article-${++sequence}`, updatedAt: new Date() }; state.articles.push(row); return row; },
      update: async ({ where, data }) => { const row = state.articles.find((item) => item.id === where.id); Object.assign(row, data); return row; },
      updateMany: async ({ where, data }) => { const row = state.articles.find((item) => item.id === where.id && +item.updatedAt === +where.updatedAt); if (!row) return { count: 0 }; Object.assign(row, data, { updatedAt: new Date() }); return { count: 1 }; },
    },
    user: { findFirst: async () => ({ id: 'existing-author' }) },
    category: { upsert: async ({ where, create }) => { let row = state.categories.find((item) => item.slug === where.slug); if (!row) { row = { ...create, id: `category-${++sequence}` }; state.categories.push(row); } return row; } },
    categoryTr: { upsert: async ({ create }) => { if (!state.translations.some((item) => item.categoryId === create.categoryId && item.locale === create.locale)) state.translations.push(create); } },
    articleGroup: { create: async () => { const row = { id: `group-${++sequence}` }; state.groups.push(row); return row; } },
    $transaction: async (fn) => { const snapshot = structuredClone(state); try { return await fn(db); } catch (error) { state = snapshot; throw error; } },
    state: () => state,
  };
  return db;
}

test('Content package: exact slugs, short metadata, clean Markdown and real checklists', () => {
  assert.equal(release.articles.length, 9);
  assert.equal(new Set(release.articles.map((a) => a.slug)).size, 9);
  for (const article of release.articles) {
    assert.ok(article.metaTitle.length <= 60, article.slug);
    assert.ok(article.metaDescription.length <= 155, article.slug);
    assert.ok(article.contentMd.startsWith('> **Kısaca.**'), article.slug);
    assert.ok(!/^# /m.test(article.contentMd));
    assert.ok(!/\[BAĞLANTI|Doğrulayın|YAYIN METNİ|Kelime sayısı|Genişletme \(/i.test(article.contentMd));
    assert.ok(article.contentMd.includes('| Konu | Süre / kural | Dayanak |'));
    assert.ok(article.documents.length >= 5);
    assert.ok(article.contentMd.split(/\s+/).length > 750, article.slug);
    if (article.checklist) assert.ok(existsSync(`public/belgeler/${article.checklist}-belge-listesi.pdf`));
  }
  assert.equal(release.articles.find((a) => a.id === 6).category, 'ceza-hukuku');
  for (const locale of ['tr', 'en', 'ar']) {
    const messages = JSON.parse(readFileSync(`messages/${locale}.json`, 'utf8'));
    assert.ok(messages.practiceAreas['ceza-hukuku'].name);
    assert.ok(messages.articleDetail.whatsappMessage.includes('{title}'));
  }
});

test('Preview never writes; apply is repeatable and leaves all nine articles as drafts', async () => {
  const db = database();
  const before = structuredClone(db.state());
  const preview = await importEditorialRelease(db);
  assert.equal(preview.mode, 'preview');
  assert.deepEqual(db.state(), before);
  await importEditorialRelease(db, { apply: true });
  assert.equal(db.state().articles.filter((a) => a.status === 'DRAFT').length, 9);
  assert.ok(db.state().articles.filter((a) => a.status === 'DRAFT').every((a) => a.publishedAt === null && a.authorId === 'existing-author'));
  const first = structuredClone(db.state());
  await importEditorialRelease(db, { apply: true });
  assert.deepEqual(db.state(), first, 'A second import must not rewrite dates, text or categories');
  assert.ok(db.state().articles.filter((a) => a.id.startsWith('old-')).every((a) => a.title === 'Existing CMS title' && +a.publishedAt === +new Date('2025-01-01')));
});

test('Publication uses the actual date, preserves CMS edits and enforces the rolling limit', async () => {
  const db = database();
  await importEditorialRelease(db, { apply: true });
  const draft = db.state().articles.find((a) => a.slug === release.articles[0].slug);
  draft.contentMd = 'Reviewed CMS content';
  const now = new Date('2026-11-10T09:00:00Z');
  await importEditorialRelease(db, { apply: true, publishIds: [1, 2], now });
  assert.equal(draft.contentMd, 'Reviewed CMS content');
  assert.equal(draft.publishedAt.toISOString(), now.toISOString());
  await importEditorialRelease(db, { apply: true, publishIds: [1, 2], now });
  await assert.rejects(importEditorialRelease(db, { apply: true, publishIds: [3], now }), /seven days/);
  await assert.rejects(importEditorialRelease(db, { apply: true, publishIds: [3, 4, 9], now }), /at most two/);
  await importEditorialRelease(db, { apply: true, publishIds: [3, 9], now: new Date('2026-11-18T09:00:00Z') });
  assert.equal(db.state().articles.filter((a) => a.status === 'DRAFT').length, 5);
});

test('Missing original or a concurrent edit aborts the complete transaction', async () => {
  const missing = database(); missing.state().articles.pop();
  await assert.rejects(importEditorialRelease(missing, { apply: true }), /missing/);
  assert.equal(missing.state().groups.length, 0);
  const conflict = database(); conflict.article.updateMany = async () => ({ count: 0 });
  await assert.rejects(importEditorialRelease(conflict, { apply: true }), /Concurrent edit/);
  assert.equal(conflict.state().groups.length, 0);
  assert.equal(conflict.state().articles.length, 3);
});

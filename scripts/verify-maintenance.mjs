import assert from 'node:assert/strict';
import { retentionCutoff, runMaintenance } from './site-maintenance.mjs';
import { mergeRedirects } from './install-seo-redirects.mjs';

assert.equal(retentionCutoff(new Date('2025-03-31T12:30:00Z')).toISOString(), '2024-02-29T12:30:00.000Z');
assert.equal(retentionCutoff(new Date('2026-03-31T12:30:00Z')).toISOString(), '2025-02-28T12:30:00.000Z');
const original = '# Passenger settings\nPassengerAppRoot /home/test/app\nSetEnv EXAMPLE unchanged\n';
const rules = 'RewriteEngine On\nRewriteRule ^$ https://burakugurozturk.av.tr/tr [R=301,L]';
const merged = mergeRedirects(original, rules);
assert.ok(merged.endsWith(original));
assert.equal(mergeRedirects(merged, rules), merged);
assert.throws(() => mergeRedirects('# BEGIN AVBURAK SEO\n', rules));

let writes = 0;
const fake = {
  article: { findMany: async () => [{ id: 'a', slug: 'test', publishedAt: new Date('2026-10-07'), updatedAt: new Date('2026-10-02') }] },
  pageView: { count: async () => 2 }, conversionEvent: { count: async () => 3 }, visitor: { count: async () => 1 },
  $transaction: () => { writes++; throw new Error('Dry run must not write'); },
};
const result = await runMaintenance(fake);
assert.equal(result.mode, 'read-only');
assert.equal(result.invalidDates.length, 1);
assert.equal(writes, 0);
await assert.rejects(runMaintenance(fake, { apply: true }), /Choose/);
const calls = [];
const remember = (table, options) => { calls.push({ table, options }); return Promise.resolve({ count: 1 }); };
const writeFake = {
  ...fake,
  article: { ...fake.article, updateMany: (options) => remember('articles', options) },
  pageView: { ...fake.pageView, deleteMany: (options) => remember('page_views', options) },
  conversionEvent: { ...fake.conversionEvent, deleteMany: (options) => remember('conversion_events', options) },
  visitor: { ...fake.visitor, deleteMany: (options) => remember('visitors', options) },
  $transaction: (operations) => Promise.all(operations),
};
const applied = await runMaintenance(writeFake, { apply: true, repairDates: true, pruneAnalytics: true, now: new Date('2026-11-05T12:00:00Z') });
assert.deepEqual(calls.map((call) => call.table), ['articles', 'page_views', 'conversion_events', 'visitors']);
assert.equal(calls[0].options.where.updatedAt.toISOString(), '2026-10-02T00:00:00.000Z', 'Concurrent edits are guarded');
assert.equal(calls[1].options.where.createdAt.lt.toISOString(), '2025-10-05T12:00:00.000Z');
assert.equal(calls[3].options.where.pageViews.none.createdAt.gte.toISOString(), '2025-10-05T12:00:00.000Z', 'Recent visitors are preserved');
assert.deepEqual(applied.changedRows, [1, 1, 1, 1]);
console.log('Maintenance checks passed: month boundaries, read-only default and idempotent Passenger-safe merge.');

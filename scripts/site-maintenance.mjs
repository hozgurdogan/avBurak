import { PrismaClient } from '@prisma/client';
import nextEnv from '@next/env';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

export function retentionCutoff(now = new Date()) {
  const cutoff = new Date(now);
  const day = cutoff.getUTCDate();
  cutoff.setUTCDate(1);
  cutoff.setUTCMonth(cutoff.getUTCMonth() - 13);
  const lastDay = new Date(Date.UTC(cutoff.getUTCFullYear(), cutoff.getUTCMonth() + 1, 0)).getUTCDate();
  cutoff.setUTCDate(Math.min(day, lastDay));
  return cutoff;
}

export async function runMaintenance(prisma, { apply = false, repairDates = false, pruneAnalytics = false, now = new Date() } = {}) {
  if (apply && !repairDates && !pruneAnalytics) throw new Error('Choose --repair-dates and/or --prune-analytics with --apply.');
  const cutoff = retentionCutoff(now);
  const oldVisitors = { lastSeenAt: { lt: cutoff }, pageViews: { none: { createdAt: { gte: cutoff } } } };
  const articles = await prisma.article.findMany({
    where: { publishedAt: { not: null } }, select: { id: true, slug: true, publishedAt: true, updatedAt: true },
  });
  const invalidDates = articles.filter((article) => article.publishedAt && article.updatedAt < article.publishedAt);
  const [pageViews, conversions, visitors] = await Promise.all([
    prisma.pageView.count({ where: { createdAt: { lt: cutoff } } }),
    prisma.conversionEvent.count({ where: { createdAt: { lt: cutoff } } }),
    prisma.visitor.count({ where: oldVisitors }),
  ]);
  const result = { mode: apply ? 'apply' : 'read-only', cutoff: cutoff.toISOString(),
    invalidDates: invalidDates.map(({ slug, publishedAt, updatedAt }) => ({ slug, publishedAt, updatedAt })),
    expiredAnalytics: { pageViews, conversions, visitors } };
  if (!apply) return result;
  const operations = [];
  if (repairDates) operations.push(...invalidDates.map((article) => prisma.article.updateMany({
    // Do not overwrite a concurrent editor's change after the read above.
    where: { id: article.id, updatedAt: article.updatedAt, publishedAt: article.publishedAt },
    data: { updatedAt: article.publishedAt },
  })));
  if (pruneAnalytics) operations.push(
    prisma.pageView.deleteMany({ where: { createdAt: { lt: cutoff } } }),
    prisma.conversionEvent.deleteMany({ where: { createdAt: { lt: cutoff } } }),
    prisma.visitor.deleteMany({ where: oldVisitors }),
  );
  result.changedRows = operations.length ? (await prisma.$transaction(operations)).map((operation) => operation.count) : [];
  return result;
}

async function main() {
  nextEnv.loadEnvConfig(process.cwd());
  const prisma = new PrismaClient();
  try {
    console.log(JSON.stringify(await runMaintenance(prisma, {
      apply: process.argv.includes('--apply'), repairDates: process.argv.includes('--repair-dates'),
      pruneAnalytics: process.argv.includes('--prune-analytics'),
    }), null, 2));
  } finally { await prisma.$disconnect(); }
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch((error) => { console.error(error); process.exitCode = 1; });
}

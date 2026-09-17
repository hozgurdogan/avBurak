import 'server-only';
import { prisma } from '@/lib/prisma';

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function daysAgo(n: number): Date {
  const date = startOfDay(new Date());
  date.setDate(date.getDate() - n);
  return date;
}

export type AnalyticsSummary = {
  totalVisitors: number;
  newVisitorsToday: number;
  newVisitorsThisWeek: number;
  newVisitorsThisMonth: number;
  pageViewsToday: number;
  pageViewsThisWeek: number;
  pageViewsThisMonth: number;
};

/** Headline counts for the analytics dashboard's stat row. "New visitors"
 *  buckets by `firstSeenAt`; a visitor who first appeared last month and
 *  came back today counts toward today's page views but not today's new
 *  visitors - that is the distinction the dashboard is for. */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const today = startOfDay(new Date());
  const weekAgo = daysAgo(6);
  const monthAgo = daysAgo(29);

  const [
    totalVisitors,
    newVisitorsToday,
    newVisitorsThisWeek,
    newVisitorsThisMonth,
    pageViewsToday,
    pageViewsThisWeek,
    pageViewsThisMonth,
  ] = await Promise.all([
    prisma.visitor.count(),
    prisma.visitor.count({ where: { firstSeenAt: { gte: today } } }),
    prisma.visitor.count({ where: { firstSeenAt: { gte: weekAgo } } }),
    prisma.visitor.count({ where: { firstSeenAt: { gte: monthAgo } } }),
    prisma.pageView.count({ where: { createdAt: { gte: today } } }),
    prisma.pageView.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.pageView.count({ where: { createdAt: { gte: monthAgo } } }),
  ]);

  return {
    totalVisitors,
    newVisitorsToday,
    newVisitorsThisWeek,
    newVisitorsThisMonth,
    pageViewsToday,
    pageViewsThisWeek,
    pageViewsThisMonth,
  };
}

export type DailyVisitorCount = { date: string; count: number };

/** Unique visitors per day for the trailing `days` days, oldest first - the
 *  dashboard's bar chart. A raw query rather than loading every page view
 *  into memory: `COUNT(DISTINCT visitorId)` is what SQL is for. */
export async function getDailyVisitorCounts(days = 30): Promise<DailyVisitorCount[]> {
  const since = daysAgo(days - 1);

  const rows = await prisma.$queryRaw<{ day: Date; count: bigint }[]>`
    SELECT DATE(createdAt) AS day, COUNT(DISTINCT visitorId) AS count
    FROM page_views
    WHERE createdAt >= ${since}
    GROUP BY DATE(createdAt)
  `;

  const byDay = new Map(rows.map((row) => [new Date(row.day).toISOString().slice(0, 10), Number(row.count)]));

  const result: DailyVisitorCount[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const key = daysAgo(i).toISOString().slice(0, 10);
    result.push({ date: key, count: byDay.get(key) ?? 0 });
  }
  return result;
}

/** Total page views per day for the trailing `days` days, oldest first -
 *  companion to `getDailyVisitorCounts` (that one counts unique visitors,
 *  this one every view - the gap between the two is how much repeat
 *  browsing is happening, not just repeat visiting). */
export async function getDailyPageViewCounts(days = 30): Promise<DailyVisitorCount[]> {
  const since = daysAgo(days - 1);

  const rows = await prisma.$queryRaw<{ day: Date; count: bigint }[]>`
    SELECT DATE(createdAt) AS day, COUNT(*) AS count
    FROM page_views
    WHERE createdAt >= ${since}
    GROUP BY DATE(createdAt)
  `;

  const byDay = new Map(rows.map((row) => [new Date(row.day).toISOString().slice(0, 10), Number(row.count)]));

  const result: DailyVisitorCount[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const key = daysAgo(i).toISOString().slice(0, 10);
    result.push({ date: key, count: byDay.get(key) ?? 0 });
  }
  return result;
}

export type LocaleCount = { locale: string; count: number };

/** Page views by locale over the trailing `days` days - which of the three
 *  editions is actually being read. Sorted in JS rather than via Prisma's
 *  `orderBy` on an aggregate: one fewer thing that can go wrong for three
 *  rows that get re-sorted in memory anyway. */
export async function getLocaleBreakdown(days = 30): Promise<LocaleCount[]> {
  const since = daysAgo(days - 1);

  const grouped = await prisma.pageView.groupBy({
    by: ['locale'],
    where: { createdAt: { gte: since } },
    _count: { locale: true },
  });

  return grouped
    .map((row) => ({ locale: row.locale, count: row._count.locale }))
    .sort((a, b) => b.count - a.count);
}

export type TopPage = { path: string; views: number };

/** Most-viewed paths over the trailing `days` days. `path` already has its
 *  locale segment stripped (see PageView.path in schema.prisma), so the same
 *  page in different languages is counted together. Sorted in JS for the
 *  same reason as `getLocaleBreakdown` above. */
export async function getTopPages(days = 30, limit = 10): Promise<TopPage[]> {
  const since = daysAgo(days - 1);

  const grouped = await prisma.pageView.groupBy({
    by: ['path'],
    where: { createdAt: { gte: since } },
    _count: { path: true },
  });

  return grouped
    .map((row) => ({ path: row.path, views: row._count.path }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

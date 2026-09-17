import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getAnalyticsSummary, getDailyVisitorCounts, getTopPages } from '@/lib/admin/analytics';
import { VisitorChart } from '@/components/admin/visitor-chart';

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Visit analytics. Every number here comes from the site's own first-party,
 * consent-gated cookie (src/lib/analytics.ts) - no Google Analytics, no
 * external service. That also means it only counts visitors who accepted
 * the cookie banner; a visitor who declined, or who never got the chance to
 * answer because JavaScript never ran, is invisible here by design, not by
 * bug.
 */
export default async function AdminAnalyticsPage() {
  const t = await getTranslations('admin.analytics');

  // TEMPORARY diagnostic try/catch (2026-09-18): the site's generic error
  // boundary hides the real message in production, and the host's log files
  // could not be located, so this surfaces the actual error - admin-only
  // page, so a stack trace here is not a public exposure. Remove once the
  // underlying bug is found and fixed.
  let summary, dailyCounts, topPages;
  try {
    [summary, dailyCounts, topPages] = await Promise.all([
      getAnalyticsSummary(),
      getDailyVisitorCounts(30),
      getTopPages(30, 10),
    ]);
  } catch (error) {
    return (
      <div className="max-w-content">
        <h1 className="font-display text-3xl font-normal text-ink">{t('title')}</h1>
        <div className="mt-10 border-t border-danger pt-6">
          <p className="label text-danger">Debug - gerçek hata</p>
          <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-all text-xs text-ink">
            {error instanceof Error ? `${error.name}: ${error.message}\n\n${error.stack}` : String(error)}
          </pre>
        </div>
      </div>
    );
  }

  const statRows: Array<{ label: string; value: number }> = [
    { label: t('totalVisitors'), value: summary.totalVisitors },
    { label: t('newVisitorsToday'), value: summary.newVisitorsToday },
    { label: t('newVisitorsWeek'), value: summary.newVisitorsThisWeek },
    { label: t('newVisitorsMonth'), value: summary.newVisitorsThisMonth },
    { label: t('pageViewsToday'), value: summary.pageViewsToday },
    { label: t('pageViewsWeek'), value: summary.pageViewsThisWeek },
    { label: t('pageViewsMonth'), value: summary.pageViewsThisMonth },
  ];

  return (
    <div className="max-w-content">
      <h1 className="font-display text-3xl font-normal text-ink">{t('title')}</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">{t('lead')}</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statRows.map((row) => (
          <div key={row.label} className="border-t border-rule pt-4">
            <p className="text-4xl font-display font-normal text-ink" dir="ltr">
              {row.value}
            </p>
            <p className="label mt-2 text-ink-faint">{row.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 border-t border-rule pt-8">
        <h2 className="label text-gold-800">{t('chartTitle')}</h2>
        <div className="mt-6">
          <VisitorChart data={dailyCounts} emptyLabel={t('chartEmpty')} />
        </div>
      </div>

      <div className="mt-14 border-t border-rule pt-8">
        <h2 className="label text-gold-800">{t('topPagesTitle')}</h2>

        {topPages.length > 0 ? (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border-b border-rule pb-3 text-start font-normal text-ink-faint">
                    {t('pathColumn')}
                  </th>
                  <th className="border-b border-rule pb-3 text-end font-normal text-ink-faint">
                    {t('viewsColumn')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {topPages.map((page) => (
                  <tr key={page.path}>
                    <td className="border-b border-rule-soft py-3 pe-6 text-ink" dir="ltr">
                      {page.path}
                    </td>
                    <td className="border-b border-rule-soft py-3 text-end text-ink" dir="ltr">
                      {page.views}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-6 text-sm text-ink-muted">{t('topPagesEmpty')}</p>
        )}
      </div>
    </div>
  );
}

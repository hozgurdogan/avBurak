import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { localeNames, type Locale } from '@/i18n/locales';
import { cn } from '@/lib/cn';
import {
  getAnalyticsSummary,
  getDailyVisitorCounts,
  getDailyPageViewCounts,
  getLocaleBreakdown,
  getTopPages,
} from '@/lib/admin/analytics';
import { resetAnalytics } from '@/actions/analytics';
import { VisitorChart } from '@/components/admin/visitor-chart';
import { CategoryBarList } from '@/components/admin/category-bar-list';
import { ConfirmSubmitButton } from '@/components/admin/confirm-submit-button';

export const metadata: Metadata = { robots: { index: false, follow: false } };

const dayOptions = [7, 30, 90] as const;
type DayOption = (typeof dayOptions)[number];

function parseDays(value: string | undefined): DayOption {
  const parsed = Number(value);
  return (dayOptions as readonly number[]).includes(parsed) ? (parsed as DayOption) : 30;
}

type PageProps = {
  searchParams: Promise<{ gun?: string }>;
};

/**
 * Visit analytics. Every number here comes from the site's own first-party,
 * consent-gated cookie (src/lib/analytics.ts) - no Google Analytics, no
 * external service. That also means it only counts visitors who accepted
 * the cookie banner; a visitor who declined, or who never got the chance to
 * answer because JavaScript never ran, is invisible here by design, not by
 * bug.
 *
 * The headline stat row (today/this week/this month) is always calendar-
 * based, regardless of the `gun` filter below - it is a fixed reference
 * point. The filter only changes the window the charts and the top-pages
 * table look at, the same "kategori"/"sayfa" pattern the articles index
 * uses: a query param, no client state.
 */
export default async function AdminAnalyticsPage({ searchParams }: PageProps) {
  const { gun } = await searchParams;
  const days = parseDays(gun);

  const [t, summary, dailyVisitorCounts, dailyPageViewCounts, localeBreakdown, topPages] = await Promise.all([
    getTranslations('admin.analytics'),
    getAnalyticsSummary(),
    getDailyVisitorCounts(days),
    getDailyPageViewCounts(days),
    getLocaleBreakdown(days),
    getTopPages(days, 10),
  ]);

  const statRows: Array<{ label: string; value: number }> = [
    { label: t('totalVisitors'), value: summary.totalVisitors },
    { label: t('newVisitorsToday'), value: summary.newVisitorsToday },
    { label: t('newVisitorsWeek'), value: summary.newVisitorsThisWeek },
    { label: t('newVisitorsMonth'), value: summary.newVisitorsThisMonth },
    { label: t('pageViewsToday'), value: summary.pageViewsToday },
    { label: t('pageViewsWeek'), value: summary.pageViewsThisWeek },
    { label: t('pageViewsMonth'), value: summary.pageViewsThisMonth },
  ];

  const localeItems = localeBreakdown.map((row) => ({
    label: localeNames[row.locale as Locale] ?? row.locale,
    count: row.count,
  }));

  return (
    <div className="max-w-content">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl font-normal text-ink">{t('title')}</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-muted">{t('lead')}</p>
        </div>
        <form action={resetAnalytics}>
          <ConfirmSubmitButton
            confirmMessage={t('resetConfirm')}
            className="label-lg text-danger transition-colors duration-base hover:text-ink"
          >
            {t('resetButton')}
          </ConfirmSubmitButton>
        </form>
      </div>

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

      <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-6">
        <span className="label text-ink-faint">{t('filterLabel')}</span>
        <nav className="flex items-center gap-6">
          {dayOptions.map((option) => (
            <Link
              key={option}
              href={`/admin/panel/analiz?gun=${option}`}
              className={cn(
                'label-lg pb-1 transition-colors duration-base',
                option === days
                  ? 'border-b border-gold-500 text-ink'
                  : 'border-b border-transparent text-ink-muted hover:text-ink',
              )}
            >
              {t(`filter${option}`)}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-10 border-t border-rule pt-8">
        <h2 className="label text-gold-800">{t('visitorsChartTitle', { days })}</h2>
        <div className="mt-6">
          <VisitorChart data={dailyVisitorCounts} emptyLabel={t('chartEmpty')} />
        </div>
      </div>

      <div className="mt-14 border-t border-rule pt-8">
        <h2 className="label text-gold-800">{t('pageViewsChartTitle', { days })}</h2>
        <div className="mt-6">
          <VisitorChart data={dailyPageViewCounts} emptyLabel={t('chartEmpty')} />
        </div>
      </div>

      <div className="mt-14 border-t border-rule pt-8">
        <h2 className="label text-gold-800">{t('localeChartTitle', { days })}</h2>
        <div className="mt-6 max-w-sm">
          <CategoryBarList items={localeItems} emptyLabel={t('chartEmpty')} />
        </div>
      </div>

      <div className="mt-14 border-t border-rule pt-8">
        <h2 className="label text-gold-800">{t('topPagesTitle', { days })}</h2>

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

import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getDashboardStats, getTranslationMatrix } from '@/lib/admin/dashboard';
import { locales } from '@/i18n/locales';
import { cn } from '@/lib/cn';

/** Dashboard root: two headline counts and the translation-completeness
 * matrix the brief asks for - which locales each article group is published
 * in, at a glance. */
export default async function AdminDashboardPage() {
  const [user, t, stats, matrix] = await Promise.all([
    getCurrentUser(),
    getTranslations('admin.dashboard'),
    getDashboardStats(),
    getTranslationMatrix(),
  ]);

  return (
    <div className="max-w-content">
      <h1 className="font-display text-3xl font-normal text-ink">{t('title')}</h1>
      {user ? <p className="mt-2 text-sm text-ink-muted">{t('welcome', { name: user.name })}</p> : null}

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="border-t border-rule pt-4">
          <p className="text-4xl font-display font-normal text-ink">{stats.unreadMessages}</p>
          <p className="label mt-2 text-ink-faint">{t('messagesStat')}</p>
        </div>
        <div className="border-t border-rule pt-4">
          <p className="text-4xl font-display font-normal text-ink">{stats.publishedArticles}</p>
          <p className="label mt-2 text-ink-faint">{t('articlesStat')}</p>
        </div>
      </div>

      <div className="mt-14 border-t border-rule pt-8">
        <h2 className="label text-gold-800">{t('translationTitle')}</h2>
        <p className="mt-2 text-sm text-ink-muted">{t('translationLead')}</p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-rule pb-3 text-start font-normal text-ink-faint">
                  {/* article title column, unlabeled */}
                </th>
                {locales.map((locale) => (
                  <th
                    key={locale}
                    className="border-b border-rule pb-3 text-start font-normal uppercase tracking-label text-ink-faint"
                  >
                    {locale}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row) => (
                <tr key={row.groupId}>
                  <td className="border-b border-rule-soft py-3 pe-6 text-ink">{row.label}</td>
                  {locales.map((locale) => {
                    const cell = row.status[locale];
                    return (
                      <td key={locale} className="border-b border-rule-soft py-3 pe-6">
                        <span
                          className={cn(
                            'label',
                            cell === 'PUBLISHED'
                              ? 'text-gold-800'
                              : cell === 'DRAFT'
                                ? 'text-ink-muted'
                                : 'text-ink-faint',
                          )}
                        >
                          {cell === 'PUBLISHED'
                            ? t('statusPublished')
                            : cell === 'DRAFT'
                              ? t('statusDraft')
                              : t('statusMissing')}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-xs text-ink-faint">{t('articlesComingSoon')}</p>
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getAdminArticles } from '@/lib/admin/articles';
import { cn } from '@/lib/cn';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminArticlesPage() {
  const [t, articles] = await Promise.all([
    getTranslations('admin.articlesPage'),
    getAdminArticles(),
  ]);

  const dateFormatter = new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    numberingSystem: 'latn',
  });

  return (
    <div className="max-w-content">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-normal text-ink">{t('title')}</h1>
        <Link
          href="/admin/panel/makaleler/yeni"
          className="label-lg border-b border-current pb-0.5 text-ink transition-colors duration-base hover:text-gold-800"
        >
          {t('newArticle')}
        </Link>
      </div>

      {articles.length > 0 ? (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-rule pb-3 text-start font-normal text-ink-faint">
                  {t('titleColumn')}
                </th>
                <th className="border-b border-rule pb-3 text-start font-normal text-ink-faint">
                  {t('localeColumn')}
                </th>
                <th className="border-b border-rule pb-3 text-start font-normal text-ink-faint">
                  {t('statusColumn')}
                </th>
                <th className="border-b border-rule pb-3 text-start font-normal text-ink-faint">
                  {t('updatedColumn')}
                </th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id}>
                  <td className="border-b border-rule-soft py-3 pe-6">
                    <Link
                      href={`/admin/panel/makaleler/${article.id}`}
                      className="text-ink transition-colors duration-base hover:text-gold-800"
                    >
                      {article.title}
                    </Link>
                  </td>
                  <td className="border-b border-rule-soft py-3 pe-6 uppercase text-ink-muted" dir="ltr">
                    {article.locale}
                  </td>
                  <td className="border-b border-rule-soft py-3 pe-6">
                    <span
                      className={cn('label', article.status === 'PUBLISHED' ? 'text-gold-800' : 'text-ink-faint')}
                    >
                      {article.status === 'PUBLISHED' ? t('statusPublished') : t('statusDraft')}
                    </span>
                  </td>
                  <td className="border-b border-rule-soft py-3 text-ink-muted" dir="ltr">
                    {dateFormatter.format(article.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-8 text-sm text-ink-muted">{t('empty')}</p>
      )}
    </div>
  );
}

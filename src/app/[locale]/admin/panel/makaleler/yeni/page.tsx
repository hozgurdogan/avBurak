import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { locales, type Locale } from '@/i18n/locales';
import { getCategoryOptions } from '@/lib/admin/articles';
import { createArticle } from '@/actions/articles';
import { ArticleForm } from '@/components/admin/article-form';

export const metadata: Metadata = { robots: { index: false, follow: false } };

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function NewArticlePage({ params }: PageProps) {
  const { locale } = await params;
  const [t, categories] = await Promise.all([
    getTranslations('admin.articleForm'),
    getCategoryOptions(locale as Locale),
  ]);

  return (
    <div className="max-w-narrow">
      <div className="mb-8">
        <Link href="/admin/panel/makaleler" className="label-lg text-ink-muted hover:text-ink">
          ← {t('back')}
        </Link>
      </div>

      <h1 className="font-display text-2xl font-normal text-ink">{t('newTitle')}</h1>

      <div className="mt-8">
        <ArticleForm action={createArticle} locales={locales} categories={categories} submitLabel={t('create')} />
      </div>
    </div>
  );
}

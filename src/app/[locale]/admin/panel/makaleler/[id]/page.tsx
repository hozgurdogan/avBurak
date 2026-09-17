import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { locales, type Locale } from '@/i18n/locales';
import { getAdminArticleById, getCategoryOptions } from '@/lib/admin/articles';
import { updateArticle, deleteArticle } from '@/actions/articles';
import { ArticleForm } from '@/components/admin/article-form';
import { ConfirmSubmitButton } from '@/components/admin/confirm-submit-button';

export const metadata: Metadata = { robots: { index: false, follow: false } };

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function EditArticlePage({ params }: PageProps) {
  const { locale, id } = await params;

  const [t, article, categories] = await Promise.all([
    getTranslations('admin.articleForm'),
    getAdminArticleById(id),
    getCategoryOptions(locale as Locale),
  ]);

  if (!article) {
    notFound();
  }

  const updateWithId = updateArticle.bind(null, article.id);
  const deleteWithId = deleteArticle.bind(null, article.id);

  return (
    <div className="max-w-narrow">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link href="/admin/panel/makaleler" className="label-lg text-ink-muted hover:text-ink">
          ← {t('back')}
        </Link>
        <form action={deleteWithId}>
          <ConfirmSubmitButton
            confirmMessage={t('deleteConfirm')}
            className="label-lg text-danger transition-colors duration-base hover:text-ink"
          >
            {t('delete')}
          </ConfirmSubmitButton>
        </form>
      </div>

      <h1 className="font-display text-2xl font-normal text-ink">{t('editTitle')}</h1>

      <div className="mt-8">
        <ArticleForm
          action={updateWithId}
          locales={locales}
          categories={categories}
          defaultValues={article}
          submitLabel={t('save')}
        />
      </div>
    </div>
  );
}

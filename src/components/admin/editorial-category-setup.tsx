'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { prepareEditorialCategories } from '@/actions/articles';
import type { EditorialCategorySetupState } from '@/actions/articles';

const initialState: EditorialCategorySetupState = { status: 'idle' };

export function EditorialCategorySetup() {
  const t = useTranslations('admin.articlesPage');
  const [state, formAction, isPending] = useActionState(prepareEditorialCategories, initialState);

  return (
    <section className="mt-6 border border-rule bg-paper px-5 py-4">
      <p className="text-sm leading-relaxed text-ink-muted">{t('categorySetupHelp')}</p>
      <form action={formAction} className="mt-4">
        <button
          type="submit"
          disabled={isPending}
          className="label border-b border-current pb-0.5 text-ink transition-colors duration-base hover:text-gold-800 disabled:opacity-50"
        >
          {isPending ? t('categorySetupPending') : t('categorySetupButton')}
        </button>
      </form>
      {state.status === 'success' ? (
        <p role="status" className="mt-3 text-sm text-gold-800">
          {t('categorySetupSuccess', { count: state.updatedArticles ?? 0 })}
        </p>
      ) : null}
      {state.status === 'error' ? (
        <p role="alert" className="mt-3 text-sm text-danger">
          {state.errorCode === 'missing-articles' ? t('categorySetupMissing') : t('categorySetupError')}
        </p>
      ) : null}
    </section>
  );
}

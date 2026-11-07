'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { applySeoArticleAppendices } from '@/actions/articles';
import type { SeoArticleAppendixState } from '@/actions/articles';

const initialState: SeoArticleAppendixState = { status: 'idle' };

export function SeoArticleAppendixSetup() {
  const t = useTranslations('admin.articlesPage');
  const [state, formAction, isPending] = useActionState(applySeoArticleAppendices, initialState);

  return (
    <section className="mt-4 border border-rule bg-paper px-5 py-4">
      <p className="text-sm leading-relaxed text-ink-muted">{t('appendixSetupHelp')}</p>
      <form action={formAction} className="mt-4">
        <button
          type="submit"
          disabled={isPending}
          className="label border-b border-current pb-0.5 text-ink transition-colors duration-base hover:text-gold-800 disabled:opacity-50"
        >
          {isPending ? t('appendixSetupPending') : t('appendixSetupButton')}
        </button>
      </form>
      {state.status === 'success' ? (
        <p role="status" className="mt-3 text-sm text-gold-800">
          {t('appendixSetupSuccess', {
            updated: state.updatedArticles ?? 0,
            present: state.alreadyPresent ?? 0,
          })}
        </p>
      ) : null}
      {state.status === 'error' ? (
        <p role="alert" className="mt-3 text-sm text-danger">
          {state.errorCode === 'missing-articles'
            ? t('appendixSetupMissing')
            : state.errorCode === 'partial-articles'
              ? t('appendixSetupPartial')
              : t('appendixSetupError')}
        </p>
      ) : null}
    </section>
  );
}

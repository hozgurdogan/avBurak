'use client';

// Client component: useActionState needs the client runtime to track pending
// state and per-field errors between submits - same pattern as
// change-password-form.tsx and the public contact form.

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import type { ArticleFormState } from '@/actions/articles';
import type { Locale } from '@/i18n/locales';
import { cn } from '@/lib/cn';

const initialState: ArticleFormState = { status: 'idle' };

/** `articleSchema` (src/lib/validation/article.ts) sets each Zod issue's
 *  message to a short code, not prose - mapped to a translated string here,
 *  the same approach as the public contact form. */
const fieldErrorMessageKeys = {
  too_short: 'errorTooShort',
  too_long: 'errorTooLong',
  required: 'errorRequired',
  slug_taken: 'errorSlugTaken',
} as const;

const fieldClass =
  'w-full border-b border-rule bg-transparent px-0 py-3 text-ink placeholder:text-ink-faint ' +
  'focus:border-gold-800 focus:outline-none transition-colors duration-base';

export type ArticleFormDefaults = {
  locale: string;
  title: string;
  slug: string;
  summary: string;
  contentMd: string;
  status: string;
  categoryIds: string[];
};

export function ArticleForm({
  action,
  locales,
  categories,
  defaultValues,
  submitLabel,
}: {
  action: (prevState: ArticleFormState, formData: FormData) => Promise<ArticleFormState>;
  locales: readonly Locale[];
  categories: Array<{ id: string; name: string }>;
  defaultValues?: ArticleFormDefaults;
  submitLabel: string;
}) {
  const t = useTranslations('admin.articleForm');
  const [state, formAction, isPending] = useActionState(action, initialState);

  const fieldErrorMessage = (code?: string) =>
    code && code in fieldErrorMessageKeys
      ? t(fieldErrorMessageKeys[code as keyof typeof fieldErrorMessageKeys])
      : t('errorValidation');

  return (
    <form action={formAction} noValidate className="flex flex-col gap-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="locale" className="label text-ink-faint">
            {t('locale')}
          </label>
          <select
            id="locale"
            name="locale"
            defaultValue={defaultValues?.locale ?? locales[0]}
            dir="ltr"
            className={cn(fieldClass, 'mt-2')}
          >
            {locales.map((locale) => (
              <option key={locale} value={locale}>
                {locale.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status" className="label text-ink-faint">
            {t('status')}
          </label>
          <select
            id="status"
            name="status"
            defaultValue={defaultValues?.status ?? 'DRAFT'}
            className={cn(fieldClass, 'mt-2')}
          >
            <option value="DRAFT">{t('statusDraft')}</option>
            <option value="PUBLISHED">{t('statusPublished')}</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="title" className="label text-ink-faint">
          {t('title')} <span aria-hidden="true">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={180}
          defaultValue={defaultValues?.title}
          className={cn(fieldClass, 'mt-2')}
        />
        {state.fieldErrors?.title ? (
          <p className="mt-2 text-xs text-danger">{fieldErrorMessage(state.fieldErrors.title)}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="slug" className="label text-ink-faint">
          {t('slug')} <span aria-hidden="true">*</span>
        </label>
        <input
          id="slug"
          name="slug"
          type="text"
          required
          maxLength={180}
          dir="ltr"
          defaultValue={defaultValues?.slug}
          className={cn(fieldClass, 'mt-2')}
        />
        <p className="mt-2 text-xs leading-normal text-ink-faint">{t('slugHint')}</p>
        {state.fieldErrors?.slug ? (
          <p className="mt-2 text-xs text-danger">{fieldErrorMessage(state.fieldErrors.slug)}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="summary" className="label text-ink-faint">
          {t('summary')} <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="summary"
          name="summary"
          required
          rows={3}
          maxLength={400}
          defaultValue={defaultValues?.summary}
          className={cn(fieldClass, 'mt-2 resize-y')}
        />
        {state.fieldErrors?.summary ? (
          <p className="mt-2 text-xs text-danger">{fieldErrorMessage(state.fieldErrors.summary)}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="contentMd" className="label text-ink-faint">
          {t('content')} <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="contentMd"
          name="contentMd"
          required
          rows={18}
          dir="auto"
          defaultValue={defaultValues?.contentMd}
          className={cn(fieldClass, 'mt-2 resize-y font-mono text-sm leading-relaxed')}
        />
        <p className="mt-2 text-xs leading-normal text-ink-faint">{t('contentHint')}</p>
        {state.fieldErrors?.contentMd ? (
          <p className="mt-2 text-xs text-danger">{fieldErrorMessage(state.fieldErrors.contentMd)}</p>
        ) : null}
      </div>

      <fieldset>
        <legend className="label text-ink-faint">{t('categories')}</legend>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                name="categoryIds"
                value={category.id}
                defaultChecked={defaultValues?.categoryIds.includes(category.id)}
                className="h-4 w-4 border border-rule accent-gold-800"
              />
              {category.name}
            </label>
          ))}
        </div>
      </fieldset>

      <div role="alert">
        {state.errorCode === 'generic' ? <p className="text-sm text-danger">{t('errorGeneric')}</p> : null}
        {state.errorCode === 'validation' && !state.fieldErrors ? (
          <p className="text-sm text-danger">{t('errorValidation')}</p>
        ) : null}
      </div>

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="bg-navy-900 px-6 py-3.5 text-xs font-medium uppercase tracking-label text-canvas transition-colors duration-base hover:bg-navy-800 disabled:opacity-60"
        >
          {isPending ? t('submitting') : submitLabel}
        </button>
      </div>
    </form>
  );
}

'use client';

// Client component: useActionState needs the client runtime to surface
// success/error state between submits.

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { changePassword, type ChangePasswordState } from '@/actions/auth';

const changePasswordInitialState: ChangePasswordState = { status: 'idle' };

const fieldClass =
  'w-full border-b border-rule bg-transparent px-0 py-3 text-ink placeholder:text-ink-faint ' +
  'focus:border-gold-800 focus:outline-none transition-colors duration-base';

export function ChangePasswordForm() {
  const t = useTranslations('admin.password');
  const [state, formAction, isPending] = useActionState(changePassword, changePasswordInitialState);

  if (state.status === 'success') {
    return (
      <p role="status" className="border-t border-rule pt-6 text-md text-ink">
        {t('success')}
      </p>
    );
  }

  return (
    <form action={formAction} noValidate className="flex max-w-sm flex-col gap-6">
      <div>
        <label htmlFor="currentPassword" className="label text-ink-faint">
          {t('current')}
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          dir="ltr"
          className={`${fieldClass} mt-2`}
        />
      </div>
      <div>
        <label htmlFor="newPassword" className="label text-ink-faint">
          {t('new')}
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          minLength={12}
          autoComplete="new-password"
          dir="ltr"
          className={`${fieldClass} mt-2`}
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="label text-ink-faint">
          {t('confirm')}
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={12}
          autoComplete="new-password"
          dir="ltr"
          className={`${fieldClass} mt-2`}
        />
      </div>

      {state.status === 'error' ? (
        <p className="text-sm text-danger">
          {state.errorCode === 'current-password'
            ? t('errorCurrent')
            : state.errorCode === 'validation'
              ? t('errorValidation')
              : t('errorGeneric')}
        </p>
      ) : null}

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="bg-navy-900 px-6 py-3.5 text-xs font-medium uppercase tracking-label text-canvas transition-colors duration-base hover:bg-navy-800 disabled:opacity-60"
        >
          {isPending ? t('submitting') : t('submit')}
        </button>
      </div>
    </form>
  );
}

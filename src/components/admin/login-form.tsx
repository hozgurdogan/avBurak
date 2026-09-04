'use client';

// Client component: useActionState needs the client runtime to surface the
// login action's error state between submits.

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { login, type LoginState } from '@/actions/auth';
import { cn } from '@/lib/cn';

const loginInitialState: LoginState = { status: 'idle' };

const fieldClass =
  'w-full border-b border-rule-invert bg-transparent px-0 py-3 text-canvas placeholder:text-mist-muted ' +
  'focus:border-gold-300 focus:outline-none transition-colors duration-base';

export function LoginForm() {
  const t = useTranslations('admin.login');
  const [state, formAction, isPending] = useActionState(login, loginInitialState);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-6">
      <div>
        <label htmlFor="email" className="label text-mist-muted">
          {t('email')}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          dir="ltr"
          className={cn(fieldClass, 'mt-2')}
        />
      </div>
      <div>
        <label htmlFor="password" className="label text-mist-muted">
          {t('password')}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          dir="ltr"
          className={cn(fieldClass, 'mt-2')}
        />
      </div>

      {state.status === 'error' ? (
        <p className="text-sm text-danger">
          {state.errorCode === 'rate-limit'
            ? t('errorRateLimit')
            : state.errorCode === 'validation'
              ? t('errorValidation')
              : t('errorInvalid')}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="bg-canvas px-6 py-3.5 text-xs font-medium uppercase tracking-label text-navy-900 transition-colors duration-base hover:bg-paper disabled:opacity-60"
      >
        {isPending ? t('submitting') : t('submit')}
      </button>
    </form>
  );
}

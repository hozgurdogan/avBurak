'use client';

// Client component: useActionState needs the client runtime to track pending
// state and the server action's returned errors between submits.

import { useActionState, useId } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { submitContactForm, contactFormInitialState } from '@/actions/contact';
import { cn } from '@/lib/cn';

const fieldClass =
  'w-full border-b border-rule bg-transparent px-0 py-3 text-ink placeholder:text-ink-faint ' +
  'focus:border-gold-800 focus:outline-none transition-colors duration-base';

/**
 * The only form on the public site. KVKK requires the consent checkbox to be
 * unchecked by default - there is no `defaultChecked` anywhere below - and the
 * honeypot field (`company`) must stay invisible to every real visitor,
 * sighted or on a screen reader, which is what the `honeypot` utility in
 * globals.css does.
 */
export function ContactForm() {
  const t = useTranslations('contactPage.form');
  const locale = useLocale();
  const [state, formAction, isPending] = useActionState(submitContactForm, contactFormInitialState);
  const consentId = useId();

  if (state.status === 'success') {
    return (
      <p role="status" className="border-t border-rule pt-6 text-md text-ink">
        {t('success')}
      </p>
    );
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-6">
      <input type="hidden" name="locale" value={locale} />

      <div className="honeypot" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input type="text" id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="label text-ink-faint">
            {t('name')} <span aria-hidden="true">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={120}
            autoComplete="name"
            className={cn(fieldClass, 'mt-2')}
          />
          {state.fieldErrors?.name ? (
            <p className="mt-2 text-xs text-danger">{state.fieldErrors.name}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="email" className="label text-ink-faint">
            {t('email')} <span aria-hidden="true">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={180}
            autoComplete="email"
            dir="ltr"
            className={cn(fieldClass, 'mt-2')}
          />
          {state.fieldErrors?.email ? (
            <p className="mt-2 text-xs text-danger">{state.fieldErrors.email}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="label text-ink-faint">
            {t('phone')}
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            maxLength={40}
            autoComplete="tel"
            dir="ltr"
            className={cn(fieldClass, 'mt-2')}
          />
        </div>
        <div>
          <label htmlFor="subject" className="label text-ink-faint">
            {t('subject')} <span aria-hidden="true">*</span>
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            required
            maxLength={160}
            className={cn(fieldClass, 'mt-2')}
          />
          {state.fieldErrors?.subject ? (
            <p className="mt-2 text-xs text-danger">{state.fieldErrors.subject}</p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor="message" className="label text-ink-faint">
          {t('message')} <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={4000}
          rows={6}
          className={cn(fieldClass, 'mt-2 resize-y')}
        />
        {state.fieldErrors?.message ? (
          <p className="mt-2 text-xs text-danger">{state.fieldErrors.message}</p>
        ) : null}
      </div>

      <div className="flex items-start gap-3 border-t border-rule pt-6">
        <input
          id={consentId}
          name="consent"
          type="checkbox"
          value="yes"
          required
          className="mt-1 h-4 w-4 shrink-0 border border-rule accent-gold-800"
        />
        <label htmlFor={consentId} className="text-sm text-ink-muted">
          {t.rich('consent', {
            link: (chunks) => (
              <Link href="/kvkk" className="underline hover:text-ink">
                {chunks}
              </Link>
            ),
          })}
        </label>
      </div>
      {state.errorCode === 'consent' ? <p className="text-xs text-danger">{t('errorConsent')}</p> : null}

      {state.errorCode === 'rate-limit' ? (
        <p className="text-sm text-danger">{t('errorRateLimit')}</p>
      ) : null}
      {state.errorCode === 'generic' ? <p className="text-sm text-danger">{t('errorGeneric')}</p> : null}
      {state.errorCode === 'validation' && !state.fieldErrors ? (
        <p className="text-sm text-danger">{t('errorValidation')}</p>
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

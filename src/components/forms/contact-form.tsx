'use client';

// Client component: useActionState needs the client runtime to track pending
// state and the server action's returned errors between submits.

import { useActionState, useId } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { submitContactForm, type ContactFormState } from '@/actions/contact';
import { cn } from '@/lib/cn';

const contactFormInitialState: ContactFormState = { status: 'idle' };

const fieldClass =
  'w-full border-b border-rule bg-transparent px-0 py-3 text-ink placeholder:text-ink-faint ' +
  'focus:border-gold-800 focus:outline-none transition-colors duration-base';

/**
 * The only form on the public site. KVKK requires the consent checkbox to be
 * unchecked by default - there is no `defaultChecked` anywhere below - and the
 * honeypot field (`company`) must stay invisible to every real visitor,
 * sighted or on a screen reader, which is what the `honeypot` utility in
 * globals.css does.
 *
 * Labels sit above their fields and stay there. The "floating label" pattern
 * was considered and rejected: it doubles as the placeholder, so it vanishes
 * the moment the visitor starts typing, leaving a filled-in field with no
 * visible name - the worst case being someone returning to a long message to
 * check what they were asked. It also renders the label at a smaller size and
 * lower contrast than the value it describes. Neither is a trade worth making
 * on the one form a prospective client has to fill in correctly.
 */
export function ContactForm() {
  const t = useTranslations('contactPage.form');
  const locale = useLocale();
  const [state, formAction, isPending] = useActionState(submitContactForm, contactFormInitialState);
  const consentId = useId();
  // Prefix for the per-field error ids that `aria-describedby` points at, so a
  // screen reader reads the validation message as part of the field rather than
  // as loose text the visitor has to go hunting for.
  const errorId = useId();

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
            aria-invalid={state.fieldErrors?.name ? true : undefined}
            aria-describedby={state.fieldErrors?.name ? `${errorId}-name` : undefined}
            className={cn(fieldClass, 'mt-2')}
          />
          {state.fieldErrors?.name ? (
            <p id={`${errorId}-name`} className="mt-2 text-xs text-danger">
              {state.fieldErrors.name}
            </p>
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
            aria-invalid={state.fieldErrors?.email ? true : undefined}
            aria-describedby={state.fieldErrors?.email ? `${errorId}-email` : undefined}
            className={cn(fieldClass, 'mt-2')}
          />
          {state.fieldErrors?.email ? (
            <p id={`${errorId}-email`} className="mt-2 text-xs text-danger">
              {state.fieldErrors.email}
            </p>
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
            aria-invalid={state.fieldErrors?.subject ? true : undefined}
            aria-describedby={state.fieldErrors?.subject ? `${errorId}-subject` : undefined}
            className={cn(fieldClass, 'mt-2')}
          />
          {state.fieldErrors?.subject ? (
            <p id={`${errorId}-subject`} className="mt-2 text-xs text-danger">
              {state.fieldErrors.subject}
            </p>
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
          aria-invalid={state.fieldErrors?.message ? true : undefined}
          aria-describedby={state.fieldErrors?.message ? `${errorId}-message` : undefined}
          className={cn(fieldClass, 'mt-2 resize-y')}
        />
        {state.fieldErrors?.message ? (
          <p id={`${errorId}-message`} className="mt-2 text-xs text-danger">
            {state.fieldErrors.message}
          </p>
        ) : null}
      </div>

      <div className="flex items-start gap-3 border-t border-rule pt-6">
        <input
          id={consentId}
          name="consent"
          type="checkbox"
          value="yes"
          required
          aria-invalid={state.errorCode === 'consent' ? true : undefined}
          aria-describedby={state.errorCode === 'consent' ? `${errorId}-consent` : undefined}
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
      {/* Form-level failures live in an assertive region: unlike the per-field
          messages above, nothing on the page has focus that would announce
          them, so a screen-reader user submitting the form would otherwise get
          silence and no idea why nothing happened. */}
      <div role="alert">
        {state.errorCode === 'consent' ? (
          <p id={`${errorId}-consent`} className="text-xs text-danger">
            {t('errorConsent')}
          </p>
        ) : null}
        {state.errorCode === 'rate-limit' ? (
          <p className="text-sm text-danger">{t('errorRateLimit')}</p>
        ) : null}
        {state.errorCode === 'generic' ? (
          <p className="text-sm text-danger">{t('errorGeneric')}</p>
        ) : null}
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
          {isPending ? t('submitting') : t('submit')}
        </button>
      </div>
    </form>
  );
}

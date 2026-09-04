'use client';

// Client component: the whole point is that a figure appears the moment the
// reader presses the button, without a round trip. Nothing typed into these
// fields is transmitted anywhere - the arithmetic runs in the browser and the
// values are never sent to the server, which is also what keeps a form asking
// about someone's sentence or their estate out of our logs entirely.

import { useMemo, useState, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { PARAMETERS_VERIFIED, parameters } from '@/content/tools/parameters';
import { getTool } from '@/lib/tools/registry';
import type { Formatters, ToolResult } from '@/lib/tools/types';
import { cn } from '@/lib/cn';

const fieldClass =
  'w-full border-b border-rule bg-transparent px-0 py-3 text-ink ' +
  'focus:border-gold-800 focus:outline-none transition-colors duration-base ease-out-editorial';

function defaultsFor(slug: string): Record<string, string> {
  const tool = getTool(slug);
  if (!tool) return {};
  return Object.fromEntries(tool.fields.map((field) => [field.id, field.defaultValue ?? '']));
}

export function Calculator({ slug }: { slug: string }) {
  const t = useTranslations('tools');
  const locale = useLocale();
  const tool = getTool(slug);

  const [values, setValues] = useState<Record<string, string>>(() => defaultsFor(slug));
  const [result, setResult] = useState<ToolResult | null>(null);

  // `numberingSystem: 'latn'` is not a default we can rely on: the Arabic
  // edition would otherwise render Arabic-Indic digits, and the brief requires
  // Western digits in every locale.
  const format = useMemo<Formatters>(() => {
    const money = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'TRY',
      numberingSystem: 'latn',
      maximumFractionDigits: 2,
    });
    const percent = new Intl.NumberFormat(locale, {
      style: 'percent',
      numberingSystem: 'latn',
      maximumFractionDigits: 2,
    });
    return {
      money: (value) => money.format(value),
      number: (value, fractionDigits = 0) =>
        new Intl.NumberFormat(locale, {
          numberingSystem: 'latn',
          maximumFractionDigits: fractionDigits,
        }).format(value),
      percent: (ratio) => percent.format(ratio),
      date: (value) =>
        new Intl.DateTimeFormat(locale, {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          numberingSystem: 'latn',
        }).format(value),
    };
  }, [locale]);

  if (!tool) return null;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResult(tool.compute(values, format));
  };

  const onReset = () => {
    setValues(defaultsFor(slug));
    setResult(null);
  };

  const setValue = (id: string, value: string) =>
    setValues((previous) => ({ ...previous, [id]: value }));

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
      <form onSubmit={onSubmit} className="lg:col-span-7">
        <h2 className="label border-t border-rule pt-6 text-gold-800">{t('form.inputsLabel')}</h2>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {tool.fields.map((field) => {
            const label = t(`${slug}.fields.${field.id}`);
            const inputId = `${slug}-${field.id}`;
            return (
              <div key={field.id} className={field.type === 'select' ? 'sm:col-span-2' : undefined}>
                <label htmlFor={inputId} className="label text-ink-faint">
                  {label}
                  {field.required ? <span aria-hidden="true"> *</span> : null}
                </label>

                {field.type === 'select' ? (
                  <select
                    id={inputId}
                    value={values[field.id] ?? ''}
                    onChange={(event) => setValue(field.id, event.target.value)}
                    className={cn(fieldClass, 'mt-2')}
                  >
                    {(field.options ?? []).map((option) => (
                      <option key={option} value={option}>
                        {t(`${slug}.options.${field.id}_${option}`)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={inputId}
                    type={field.type === 'date' ? 'date' : 'number'}
                    inputMode={field.type === 'date' ? undefined : 'decimal'}
                    step={field.step ?? (field.type === 'integer' ? 1 : 'any')}
                    min={field.min}
                    max={field.max}
                    required={field.required}
                    value={values[field.id] ?? ''}
                    onChange={(event) => setValue(field.id, event.target.value)}
                    dir="ltr"
                    className={cn(fieldClass, 'mt-2')}
                  />
                )}

                {field.hasHint ? (
                  <p className="mt-2 text-xs leading-normal text-ink-faint">
                    {t(`${slug}.fields.${field.id}Hint`)}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-6 border-t border-rule pt-6">
          <button
            type="submit"
            className="group inline-flex items-center gap-3 rounded-sm bg-navy-900 px-6 py-3.5 text-xs font-medium uppercase tracking-label text-canvas transition-colors duration-base ease-out-editorial hover:bg-navy-800"
          >
            {t('form.submit')}
            <svg
              viewBox="0 0 24 12"
              width="22"
              height="11"
              aria-hidden="true"
              focusable="false"
              className="mirror-rtl shrink-0 transition-transform duration-base ease-out-editorial group-hover:translate-x-1"
            >
              <path
                d="M0 6h21M16 1l5 5-5 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="square"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={onReset}
            className="label-lg border-b border-current pb-0.5 text-ink-muted transition-colors duration-base ease-out-editorial hover:text-gold-800"
          >
            {t('form.reset')}
          </button>
        </div>
      </form>

      {/* The result is an assertive live region: the figure appears without a
          navigation, so nothing would otherwise tell a screen-reader user that
          pressing the button produced anything. */}
      <div className="lg:col-span-4 lg:col-start-9" aria-live="polite">
        <div className="border border-rule-neutral bg-paper p-8">
          <h2 className="label text-gold-800">{t('form.resultLabel')}</h2>

          {result === null ? (
            <p className="mt-5 text-sm text-ink-faint">{t('form.idle')}</p>
          ) : result.ok ? (
            <>
              <dl className="mt-5 flex flex-col divide-y divide-rule-neutral">
                {result.rows.map((row) => (
                  <div
                    key={row.id}
                    className={cn(
                      'flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3',
                      row.emphasis && 'border-t border-rule',
                    )}
                  >
                    <dt
                      className={cn(
                        'text-sm',
                        row.emphasis ? 'text-ink' : 'text-ink-muted',
                      )}
                    >
                      {t(`${slug}.results.${row.id}`)}
                    </dt>
                    <dd
                      className={cn(
                        'tabular-nums',
                        row.emphasis
                          ? 'font-display text-2xl text-ink'
                          : 'text-sm text-ink',
                      )}
                      dir="ltr"
                    >
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>

              {result.noteIds && result.noteIds.length > 0 ? (
                <ul className="mt-6 flex flex-col gap-3 border-t border-rule pt-6">
                  {result.noteIds.map((noteId) => (
                    <li key={noteId} className="text-xs leading-normal text-ink-muted">
                      {t(`${slug}.notes.${noteId}`)}
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          ) : (
            <p role="alert" className="mt-5 text-sm text-danger">
              {t(`errors.${result.errorId}`)}
            </p>
          )}
        </div>

        {/* Which period's statutory figures the arithmetic used. A reader who
            knows the ceiling changed last month can see immediately that this
            page has not caught up yet. */}
        {tool.usesParameters && tool.usesParameters.length > 0 ? (
          <dl className="mt-6 flex flex-col gap-3 border-t border-rule pt-6">
            {tool.usesParameters.map((key) => (
              <div key={key} className="flex flex-wrap items-baseline justify-between gap-x-4">
                <dt className="text-xs text-ink-faint">{t(`parameters.${key}`)}</dt>
                <dd className="text-xs text-ink-muted" dir="ltr">
                  {key === 'stampDutyRate'
                    ? format.percent(parameters[key].value)
                    : format.money(parameters[key].value)}
                  {' · '}
                  {format.date(new Date(`${parameters[key].asOf}T00:00:00Z`))}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        {!PARAMETERS_VERIFIED ? (
          <p className="mt-6 border-s-2 border-danger bg-danger-soft p-4 text-xs leading-normal text-ink">
            {t('form.parametersUnverified')}
          </p>
        ) : null}
      </div>
    </div>
  );
}

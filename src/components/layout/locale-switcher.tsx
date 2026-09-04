'use client';

// Client component: reads the current pathname and query so the switch keeps
// the visitor on the page they are already looking at.

import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { locales, localeNames, type Locale } from '@/i18n/locales';
import { cn } from '@/lib/cn';

/**
 * Three links rather than a dropdown: it is one tab stop per language, needs no
 * JavaScript to operate, and reads as a masthead element rather than a form
 * control. Navigating through next-intl's `Link` with an explicit `locale` sets
 * the NEXT_LOCALE cookie via the middleware, so the choice survives the next
 * visit.
 */
export function LocaleSwitcher({ surface = 'light' }: { surface?: 'light' | 'navy' }) {
  const t = useTranslations('locale');
  const active = useLocale() as Locale;
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = Object.fromEntries(searchParams.entries());

  return (
    <nav aria-label={t('change')} className="flex items-center">
      <ul className="flex items-center">
        {locales.map((locale, index) => {
          const isActive = locale === active;
          return (
            <li key={locale} className="flex items-center">
              {index > 0 ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    'mx-2 h-3 w-px',
                    surface === 'navy' ? 'bg-rule-invert' : 'bg-rule',
                  )}
                />
              ) : null}
              <Link
                href={{ pathname, query }}
                locale={locale}
                hrefLang={locale}
                lang={locale}
                aria-current={isActive ? 'true' : undefined}
                title={localeNames[locale]}
                className={cn(
                  'label-lg px-1 py-2 transition-colors duration-base ease-out-editorial',
                  isActive
                    ? surface === 'navy'
                      ? 'text-gold-300'
                      : 'text-gold-800'
                    : surface === 'navy'
                      ? 'text-mist-muted hover:text-canvas'
                      : 'text-ink-faint hover:text-ink',
                )}
              >
                <span className="sr-only">{t('current')}: </span>
                {locale.toUpperCase()}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * Rendered while the query-string-aware switcher suspends during static
 * generation. Identical markup, minus query preservation, so there is no visual
 * change when the real one hydrates.
 */
export function LocaleSwitcherFallback({ surface = 'light' }: { surface?: 'light' | 'navy' }) {
  return (
    <div className="flex items-center" aria-hidden="true">
      {locales.map((locale, index) => (
        <span key={locale} className="flex items-center">
          {index > 0 ? (
            <span
              className={cn('mx-2 h-3 w-px', surface === 'navy' ? 'bg-rule-invert' : 'bg-rule')}
            />
          ) : null}
          <span
            className={cn(
              'label-lg px-1 py-2',
              surface === 'navy' ? 'text-mist-muted' : 'text-ink-faint',
            )}
          >
            {locale.toUpperCase()}
          </span>
        </span>
      ))}
    </div>
  );
}

import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Monogram } from '@/components/brand/monogram';

/**
 * Rendered for any unmatched path inside a locale segment (an invalid
 * article/practice-area slug, or `notFound()` called explicitly) and for an
 * unsupported locale segment itself. Still inside `[locale]/layout.tsx`, so
 * `getTranslations()` resolves the request's locale normally - no explicit
 * locale argument needed here.
 */
export default async function LocaleNotFound() {
  const t = await getTranslations('notFound');

  return (
    <section className="mx-auto flex max-w-wide flex-col items-start px-gutter py-section">
      <Monogram className="w-12 text-ink-faint" />
      <p className="label mt-8 text-gold-800">{t('label')}</p>
      <h1 className="mt-4 font-display text-display-sm font-normal text-ink">{t('title')}</h1>
      <p className="measure mt-6 text-md text-ink-muted">{t('body')}</p>
      <div className="mt-10">
        <Link
          href="/"
          className="group inline-flex items-center gap-3 border-b border-current pb-0.5 text-xs font-medium uppercase tracking-label text-gold-800 hover:text-ink"
        >
          {t('home')}
        </Link>
      </div>
    </section>
  );
}

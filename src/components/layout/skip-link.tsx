import { useTranslations } from 'next-intl';

/**
 * First focusable element on every page. Invisible until focused, at which
 * point `sr-focusable` pins it to the top-inline-start corner - which mirrors
 * automatically in Arabic because the utility uses logical properties.
 */
export function SkipLink() {
  const t = useTranslations('nav');
  return (
    <a href="#main" className="sr-focusable">
      {t('skipToContent')}
    </a>
  );
}

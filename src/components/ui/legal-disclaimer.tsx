import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

/**
 * The disclaimer required by the bar association's advertising regulation:
 * the content is general information, is not legal advice, and does not create
 * an attorney–client relationship.
 *
 * This component is the single source of that text. It is rendered at the foot
 * of every article and in the site footer, in whichever language the visitor is
 * reading - which is why the copy lives in `messages/*.json` and not here.
 */
export function LegalDisclaimer({
  className,
  surface = 'light',
}: {
  className?: string;
  surface?: 'light' | 'navy';
}) {
  const t = useTranslations('disclaimer');

  return (
    <aside
      className={cn(
        'border-t pt-6',
        surface === 'navy' ? 'border-rule-invert' : 'border-rule',
        className,
      )}
    >
      <h2
        className={cn(
          'label mb-3',
          surface === 'navy' ? 'text-gold-500' : 'text-gold-800',
        )}
      >
        {t('title')}
      </h2>
      <p
        className={cn(
          'measure text-sm',
          surface === 'navy' ? 'text-mist-muted' : 'text-ink-muted',
        )}
      >
        {t('body')}
      </p>
    </aside>
  );
}

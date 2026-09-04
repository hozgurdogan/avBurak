import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type SectionHeadingProps = {
  /** Zero-padded ordinal, e.g. "01". Omit on sections that are not numbered. */
  number?: string;
  label: string;
  title: ReactNode;
  lead?: ReactNode;
  as?: 'h1' | 'h2' | 'h3';
  /** Navy sections invert the label colour; gold-800 is unreadable on navy. */
  surface?: 'light' | 'navy';
  className?: string;
  id?: string;
};

/**
 * The numbered editorial heading: a small-caps letter-spaced label with a gold
 * rule mark, then the serif title beneath it.
 *
 * The label colour switches with the surface because of the measured contrast
 * of the accent: gold-500 is 2.18:1 on the cream canvas (unreadable at any
 * size) but 7.61:1 on navy. So light surfaces get gold-800 and navy surfaces
 * get gold-500. This is the one place that rule is easy to get wrong, so it is
 * decided here rather than at each call site.
 */
export function SectionHeading({
  number,
  label,
  title,
  lead,
  as: Heading = 'h2',
  surface = 'light',
  className,
  id,
}: SectionHeadingProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <p
        className={cn(
          'label flex items-center gap-3',
          surface === 'navy' ? 'text-gold-500' : 'text-gold-800',
        )}
      >
        {number ? (
          <>
            <span aria-hidden="true">{number}</span>
            <span className="rule-mark" aria-hidden="true" />
          </>
        ) : (
          <span className="rule-mark" aria-hidden="true" />
        )}
        <span>{label}</span>
      </p>

      <Heading
        id={id}
        className={cn(
          'font-display text-display-sm font-normal',
          surface === 'navy' ? 'text-canvas' : 'text-ink',
        )}
      >
        {title}
      </Heading>

      {lead ? (
        <p
          className={cn(
            'measure text-md',
            surface === 'navy' ? 'text-mist' : 'text-ink-muted',
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}

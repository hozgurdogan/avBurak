import type { ComponentProps, ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

type Variant = 'solid' | 'outline' | 'quiet';
type Surface = 'light' | 'navy';

type ActionLinkProps = {
  href: ComponentProps<typeof Link>['href'];
  children: ReactNode;
  variant?: Variant;
  surface?: Surface;
  className?: string;
  /** Renders a plain anchor instead of the locale-aware Link. */
  external?: boolean;
};

/**
 * The only link treatment in the design.
 *
 * There is no gold fill and no gold gradient anywhere: gold is a hairline and a
 * label colour, never a surface. `solid` is the navy field, `outline` is a
 * hairline box, `quiet` is an underlined text link with a trailing arrow.
 *
 * The arrow carries `mirror-rtl`, so it points leftwards in Arabic. The
 * monogram, the telephone glyph and the map pin deliberately do not.
 */
const base =
  'group inline-flex items-center gap-3 text-xs font-medium uppercase tracking-label ' +
  'transition-colors duration-base ease-out-editorial';

const styles: Record<Variant, Record<Surface, string>> = {
  solid: {
    light: 'bg-navy-900 text-canvas px-6 py-3.5 rounded-sm hover:bg-navy-800',
    navy: 'bg-canvas text-navy-900 px-6 py-3.5 rounded-sm hover:bg-paper',
  },
  outline: {
    light: 'border border-rule text-ink px-6 py-3.5 rounded-sm hover:border-gold-500 hover:text-gold-800',
    navy: 'border border-rule-invert text-canvas px-6 py-3.5 rounded-sm hover:border-gold-300 hover:text-gold-300',
  },
  quiet: {
    light: 'text-gold-800 hover:text-ink',
    navy: 'text-gold-300 hover:text-canvas',
  },
};

function Arrow() {
  return (
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
  );
}

export function ActionLink({
  href,
  children,
  variant = 'quiet',
  surface = 'light',
  className,
  external = false,
}: ActionLinkProps) {
  const content = (
    <>
      <span className={variant === 'quiet' ? 'border-b border-current pb-0.5' : undefined}>
        {children}
      </span>
      <Arrow />
    </>
  );

  const classes = cn(base, styles[variant][surface], className);

  if (external) {
    return (
      <a href={String(href)} className={classes} rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}

import { cn } from '@/lib/cn';

type MonogramProps = {
  className?: string;
  /**
   * `mark` is the header lockup. `watermark` is the oversized, very low opacity
   * treatment used once on the home page - the single signature element of the
   * design. There is deliberately no parallax hairline elsewhere: the brief
   * allows one restrained flourish, not three.
   */
  variant?: 'mark' | 'watermark';
  title?: string;
};

/**
 * The BÜÖ lockup.
 *
 * The letterforms are set in the display serif rather than traced as bezier
 * paths: the site already self-hosts Cormorant Garamond, so using it here keeps
 * the monogram identical to the headings it sits above, stays crisp at any size
 * because SVG text is vector, and cannot drift out of sync if the typeface is
 * ever changed. The diaereses on Ü and Ö come from the font's own glyphs, which
 * is why they are correctly positioned rather than drawn as separate dots.
 *
 * The lockup itself - the proportions, the letter-spacing, the gold hairline
 * rule beneath and the two short flanking strokes - is composed here.
 *
 * `shapeRendering="crispEdges"` on the rules keeps the 1px hairline from
 * blurring to grey when the mark is rendered at 32px in the header.
 */
export function Monogram({ className, variant = 'mark', title }: MonogramProps) {
  const isWatermark = variant === 'watermark';

  return (
    <svg
      viewBox="0 0 132 46"
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
      className={cn('block h-auto', className)}
    >
      {title ? <title>{title}</title> : null}

      <text
        x="66"
        y="30"
        textAnchor="middle"
        className="font-display"
        fontSize="30"
        fontWeight={isWatermark ? 300 : 400}
        letterSpacing="2.5"
        fill="currentColor"
      >
        BÜÖ
      </text>

      {/* Gold hairline underscore, inset from the letters. */}
      <line
        x1="30"
        y1="39.5"
        x2="102"
        y2="39.5"
        stroke="var(--color-gold-500)"
        strokeWidth="1"
        shapeRendering="crispEdges"
      />
      {/* Two short flanking strokes at a lighter weight, so the rule reads as a
          rule mark rather than an underline. */}
      <line
        x1="8"
        y1="39.5"
        x2="22"
        y2="39.5"
        stroke="var(--color-gold-500)"
        strokeWidth="1"
        strokeOpacity="0.45"
        shapeRendering="crispEdges"
      />
      <line
        x1="110"
        y1="39.5"
        x2="124"
        y2="39.5"
        stroke="var(--color-gold-500)"
        strokeWidth="1"
        strokeOpacity="0.45"
        shapeRendering="crispEdges"
      />
    </svg>
  );
}

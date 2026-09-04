import type { ArticleHeading } from '@/lib/markdown';

type ArticleTocProps = {
  headings: ArticleHeading[];
  /** Localised "İçindekiler" label. */
  label: string;
  className?: string;
};

/**
 * The article outline, rendered as plain anchors.
 *
 * Deliberately a server component with no JavaScript: a scroll-spy would need
 * an IntersectionObserver on the client for a decoration that adds nothing to
 * a reader who can already see where they are on the page. Smooth scrolling and
 * the offset under the sticky header both come from `globals.css`
 * (`scroll-behavior` and `scroll-padding-block-start`), and both switch off
 * under `prefers-reduced-motion` there.
 *
 * The gold hairline on the inline start edge is the same rule that separates
 * every other block in the design - it is a border, never a shadow or a fill.
 */
export function ArticleToc({ headings, label, className }: ArticleTocProps) {
  if (headings.length < 3) {
    // Below three sections an outline is longer than the thing it summarises.
    return null;
  }

  return (
    <nav aria-labelledby="article-toc-label" className={className}>
      <h2 id="article-toc-label" className="label text-gold-800">
        {label}
      </h2>
      <ol className="mt-4 flex flex-col gap-3 border-s border-rule ps-4">
        {headings.map((heading) => (
          <li key={heading.id} className={heading.level === 3 ? 'ps-4' : undefined}>
            <a
              href={`#${heading.id}`}
              className="text-sm leading-snug text-ink-muted transition-colors duration-base ease-out-editorial hover:text-gold-800"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

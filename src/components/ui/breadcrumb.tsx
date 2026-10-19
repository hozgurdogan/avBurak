import { Link } from '@/i18n/navigation';
import type { BreadcrumbItem } from '@/lib/structured-data';

/**
 * The visible counterpart to `buildBreadcrumbSchema`'s JSON-LD (same
 * `items` shape, so callers compute the trail once and pass it to both) -
 * the SEO review (16 Ekim 2026) flagged that only the invisible structured
 * data existed, with no on-page trail for a visitor to actually click
 * through.
 */
export function Breadcrumb({ items, label }: { items: BreadcrumbItem[]; label: string }) {
  return (
    <nav aria-label={label} className="mb-8">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-ink-faint">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-2">
              {index > 0 ? (
                <span aria-hidden="true" className="text-ink-faint">
                  /
                </span>
              ) : null}
              {isLast ? (
                <span aria-current="page" className="text-ink-muted">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.path ? `/${item.path}` : '/'}
                  className="transition-colors duration-base ease-out-editorial hover:text-gold-800"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

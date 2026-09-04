import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/locales';
import { getArticles, getCategories } from '@/lib/articles';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/motion/reveal';
import { cn } from '@/lib/cn';

type PageProps = {
  params: Promise<{ locale: string }>;
  // Query params are Turkish, matching the rest of the site's URL vocabulary
  // (kategori = category, sayfa = page): kategori=<slug>, sayfa=<n>, q=<text>.
  searchParams: Promise<{ kategori?: string; sayfa?: string; q?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'articlesPage.meta' });
  return { title: t('title'), description: t('description') };
}

/**
 * The article index. Filtering and pagination live entirely in the URL query
 * string rather than client state, so the list is a plain `<a>`/`<form
 * method="get">` interaction that needs no JavaScript and is itself
 * link-shareable and bookmarkable.
 *
 * Not statically generated: the category/page/search combination is
 * unbounded, and every combination reads live from the database anyway.
 */
export default async function ArticlesIndexPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { kategori, sayfa, q } = await searchParams;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const typedLocale = locale as Locale;

  const page = Math.max(1, Number.parseInt(sayfa ?? '1', 10) || 1);

  const [t, tArticle, categories, result] = await Promise.all([
    getTranslations('articlesPage'),
    getTranslations('article'),
    getCategories(typedLocale),
    getArticles(typedLocale, { category: kategori, page, q, pageSize: 9 }),
  ]);

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    numberingSystem: 'latn',
  });

  const buildHref = (overrides: { kategori?: string | null; sayfa?: number }) => {
    const next = new URLSearchParams();
    const nextCategory = overrides.kategori !== undefined ? overrides.kategori : kategori;
    if (nextCategory) next.set('kategori', nextCategory);
    if (q) next.set('q', q);
    const nextPage = overrides.sayfa ?? 1;
    if (nextPage > 1) next.set('sayfa', String(nextPage));
    const qs = next.toString();
    return qs ? `/makaleler?${qs}` : '/makaleler';
  };

  return (
    <section className="mx-auto max-w-wide px-gutter py-section">
      <SectionHeading as="h1" label={t('label')} title={t('title')} lead={t('lead')} />

      <div className="mt-10 flex flex-col gap-8 border-t border-rule pt-8 lg:flex-row lg:items-start lg:justify-between">
        <nav aria-label={t('filterLabel')} className="flex flex-wrap gap-x-6 gap-y-3">
          <Link
            href={buildHref({ kategori: null })}
            className={cn(
              'label-lg pb-1 transition-colors duration-base',
              !kategori
                ? 'border-b border-gold-500 text-ink'
                : 'border-b border-transparent text-ink-muted hover:text-ink',
            )}
          >
            {t('filterAll')}
          </Link>
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={buildHref({ kategori: category.slug })}
              className={cn(
                'label-lg pb-1 transition-colors duration-base',
                kategori === category.slug
                  ? 'border-b border-gold-500 text-ink'
                  : 'border-b border-transparent text-ink-muted hover:text-ink',
              )}
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <form method="get" action="/makaleler" role="search" className="flex items-end gap-3">
          {kategori ? <input type="hidden" name="kategori" value={kategori} /> : null}
          <div>
            <label htmlFor="q" className="label text-ink-faint">
              {t('searchLabel')}
            </label>
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={q}
              placeholder={t('searchPlaceholder')}
              className="mt-2 w-48 border-b border-rule bg-transparent px-0 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-gold-800 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="border-b border-rule pb-2 text-xs font-medium uppercase tracking-label text-ink-muted hover:border-gold-500 hover:text-ink"
          >
            {t('searchSubmit')}
          </button>
        </form>
      </div>

      {result.items.length > 0 ? (
        <ul className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {result.items.map((article, i) => (
            <Reveal as="li" key={article.id} index={i % 4}>
              <Link
                href={`/makaleler/${article.slug}`}
                className="group flex h-full flex-col border-t border-rule pt-6"
              >
                {article.categories[0] ? (
                  <span className="label text-gold-800">{article.categories[0].name}</span>
                ) : null}
                <h2 className="mt-3 font-display text-xl font-normal text-ink transition-colors duration-base group-hover:text-gold-800">
                  {article.title}
                </h2>
                <p className="mt-3 flex-1 text-sm text-ink-muted">{article.summary}</p>
                <p className="mt-4 text-xs text-ink-faint">
                  {article.publishedAt
                    ? tArticle('publishedOn', { date: dateFormatter.format(article.publishedAt) })
                    : null}
                  {' · '}
                  {tArticle('readingTime', { minutes: article.readMinutes })}
                </p>
              </Link>
            </Reveal>
          ))}
        </ul>
      ) : (
        <p className="mt-12 border-t border-rule pt-8 text-sm text-ink-muted">{t('empty')}</p>
      )}

      {result.totalPages > 1 ? (
        <nav
          aria-label={t('pageLabel', { page: result.page, totalPages: result.totalPages })}
          className="mt-14 flex items-center justify-between border-t border-rule pt-8"
        >
          {result.page > 1 ? (
            <Link href={buildHref({ sayfa: result.page - 1 })} className="label-lg text-ink hover:text-gold-800">
              {t('prevPage')}
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}
          <span className="text-xs text-ink-faint">
            {t('pageLabel', { page: result.page, totalPages: result.totalPages })}
          </span>
          {result.page < result.totalPages ? (
            <Link href={buildHref({ sayfa: result.page + 1 })} className="label-lg text-ink hover:text-gold-800">
              {t('nextPage')}
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}
        </nav>
      ) : null}
    </section>
  );
}

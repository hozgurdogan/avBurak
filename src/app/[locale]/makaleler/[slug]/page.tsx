import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/locales';
import { getArticleBySlug, getArticleAlternates, getRelatedArticles } from '@/lib/articles';
import { renderArticleMarkdown } from '@/lib/markdown';
import { ActionLink } from '@/components/ui/action-link';
import { LegalDisclaimer } from '@/components/ui/legal-disclaimer';
import { Reveal } from '@/components/motion/reveal';

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const article = await getArticleBySlug(locale as Locale, slug);
  if (!article) return {};

  const alternates = await getArticleAlternates(article.groupId);

  return {
    title: article.metaTitle ?? article.title,
    description: article.metaDescription ?? article.summary,
    alternates: {
      languages: Object.fromEntries(
        Object.entries(alternates).map(([l, s]) => [l, `/${l}/makaleler/${s}`]),
      ),
    },
  };
}

/**
 * Article detail. Not statically generated: articles are edited through the
 * (forthcoming) admin panel and read live from the database, so a rebuild is
 * not required for new or updated content to appear.
 */
export default async function ArticleDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const typedLocale = locale as Locale;

  const article = await getArticleBySlug(typedLocale, slug);
  if (!article) {
    notFound();
  }

  const [tDetail, tArticle, html, related] = await Promise.all([
    getTranslations('articleDetail'),
    getTranslations('article'),
    renderArticleMarkdown(article.contentMd),
    getRelatedArticles(
      typedLocale,
      article.categories.map((c) => c.slug),
      article.id,
      3,
    ),
  ]);

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    numberingSystem: 'latn',
  });

  return (
    <article className="mx-auto max-w-wide px-gutter py-section">
      <div className="mb-10">
        <ActionLink href="/makaleler" variant="quiet">
          {tDetail('back')}
        </ActionLink>
      </div>

      <header className="max-w-narrow">
        {article.categories[0] ? (
          <p className="label flex items-center gap-3 text-gold-800">
            <span className="rule-mark" aria-hidden="true" />
            {article.categories[0].name}
          </p>
        ) : null}
        <h1 className="mt-6 font-display text-display-sm font-normal text-ink">{article.title}</h1>
        <p className="mt-6 text-xs text-ink-faint">
          {article.publishedAt
            ? tArticle('publishedOn', { date: dateFormatter.format(article.publishedAt) })
            : null}
          {' · '}
          {tArticle('readingTime', { minutes: article.readMinutes })}
        </p>
      </header>

      <div
        className="prose-article measure mt-12 text-md leading-prose text-ink-muted"
        // Sanitised server-side by rehype-sanitize before this ever reaches the
        // client - see src/lib/markdown.ts.
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <LegalDisclaimer className="mt-16 max-w-narrow" />

      {related.length > 0 ? (
        <div className="mt-16 border-t border-rule pt-10">
          <h2 className="label text-gold-800">{tDetail('relatedLabel')}</h2>
          <ul className="mt-8 grid gap-10 md:grid-cols-3 md:gap-8">
            {related.map((item, i) => (
              <Reveal as="li" key={item.id} index={i}>
                <Link
                  href={`/makaleler/${item.slug}`}
                  className="group flex h-full flex-col border-t border-rule pt-6"
                >
                  <h3 className="font-display text-xl font-normal text-ink transition-colors duration-base group-hover:text-gold-800">
                    {item.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm text-ink-muted">{item.summary}</p>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}

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
import { ArticleToc } from '@/components/ui/article-toc';
import { LegalDisclaimer } from '@/components/ui/legal-disclaimer';
import { Reveal } from '@/components/motion/reveal';
import { pageMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/seo/json-ld';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { buildBreadcrumbSchema, buildArticleSchema } from '@/lib/structured-data';
import { articleExcerpt, articleModifiedAt } from '@/lib/site';
import { articleSources } from '@/lib/article-sources';

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const article = await getArticleBySlug(locale as Locale, slug);
  if (!article) return {};

  const alternates = await getArticleAlternates(article.groupId);

  return pageMetadata({
    locale: locale as Locale,
    path: `makaleler/${slug}`,
    title: article.metaTitle ?? article.title,
    description: article.metaDescription ?? article.summary,
    languages: Object.fromEntries(
      Object.entries(alternates).map(([l, s]) => [l, `/${l}/makaleler/${s}`]),
    ),
    ogType: 'article',
    image: article.coverImage ?? `/${locale}/makaleler/${slug}/share-image`,
  });
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

  const [tDetail, tArticle, tNav, rendered, related] = await Promise.all([
    getTranslations('articleDetail'),
    getTranslations('article'),
    getTranslations('nav'),
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

  const breadcrumbItems = [
    { name: tNav('home'), path: '' },
    { name: tNav('articles'), path: 'makaleler' },
    { name: article.title, path: `makaleler/${slug}` },
  ];
  const sources = articleSources(article.contentMd);

  return (
    <>
    <JsonLd data={buildBreadcrumbSchema(typedLocale, breadcrumbItems)} />
    <JsonLd
      data={buildArticleSchema({
        locale: typedLocale,
        path: `makaleler/${slug}`,
        title: article.title,
        description: article.summary,
        datePublished: article.publishedAt,
        dateModified: article.updatedAt,
        image: article.coverImage ?? `/${locale}/makaleler/${slug}/share-image`,
      })}
    />
    <article className="bg-canvas-deep">
    <div className="mx-auto max-w-wide px-gutter py-section">
      <div className="mb-10">
        <Breadcrumb items={breadcrumbItems} label={tNav('breadcrumb')} />
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
        <p className="mt-6 text-sm text-ink-faint">
          {article.publishedAt
            ? tArticle('publishedOn', { date: dateFormatter.format(article.publishedAt) })
            : null}
          {' · '}
          {tArticle('readingTime', { minutes: article.readMinutes })}
          {/* Guards against showing a "güncelleme" date earlier than the
              publish date - the same data inconsistency the Article JSON-LD
              clamps in `buildArticleSchema` (src/lib/structured-data.ts). */}
          <> · {tArticle('updatedOn', { date: dateFormatter.format(articleModifiedAt(article.publishedAt, article.updatedAt)) })}</>
          {' · '}
          <Link href="/profil" className="transition-colors duration-base hover:text-gold-800">
            {tArticle('byAuthor', { name: 'Burak Uğur Öztürk' })}
          </Link>
        </p>
      </header>

      {/* The outline is placed before the body in the DOM so that on a phone -
          where it collapses out of the sidebar - it is read and seen ahead of
          the article it describes, not stranded after it. */}
      <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-8">
        <aside className="lg:col-span-3 lg:col-start-10 lg:row-start-1">
          <ArticleToc
            headings={rendered.headings}
            label={tDetail('tocLabel')}
            className="lg:sticky lg:top-28"
          />
        </aside>

        <div className="lg:col-span-7 lg:col-start-1 lg:row-start-1">
          <div
            className="prose-article measure text-md leading-prose text-ink-muted"
            // Sanitised server-side by rehype-sanitize before this ever reaches
            // the client - see src/lib/markdown.ts.
            dangerouslySetInnerHTML={{ __html: rendered.html }}
          />

          {sources.length > 0 ? (
            <section className="mt-12 border-t border-rule pt-6">
              <h2 className="label text-gold-800">{tDetail('sourcesLabel')}</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {sources.map((source) => <li key={source.number}>
                  <a href={source.url} className="text-ink-muted underline hover:text-gold-800">{source.name}</a>
                </li>)}
              </ul>
            </section>
          ) : null}
          <LegalDisclaimer className="mt-16" />
          <aside className="mt-10 border-t border-rule pt-6" aria-label={tDetail('authorLabel')}>
            <p className="label text-gold-800">{tDetail('authorLabel')}</p>
            <Link href="/profil" className="mt-3 inline-block text-lg text-ink hover:text-gold-800">
              Av. Burak Uğur Öztürk
            </Link>
            <p className="mt-2 text-sm text-ink-muted">{tDetail('authorDescription')}</p>
          </aside>
        </div>
      </div>

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
                  <h3 className="font-display text-2xl font-normal text-ink transition-colors duration-base group-hover:text-gold-800">
                    {item.title}
                  </h3>
                  <p className="mt-3 line-clamp-4 flex-1 text-md text-ink-muted">{articleExcerpt(item.summary)}</p>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
    </article>
    </>
  );
}

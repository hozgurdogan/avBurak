import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/locales';
import {
  practiceAreaSlugs,
  practiceAreaNumber,
  type PracticeAreaSlug,
} from '@/content/practice-areas';
import { getArticlesByCategory } from '@/lib/articles';
import { SectionHeading } from '@/components/ui/section-heading';
import { ActionLink } from '@/components/ui/action-link';
import { Reveal } from '@/components/motion/reveal';

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

function isPracticeAreaSlug(value: string): value is PracticeAreaSlug {
  return (practiceAreaSlugs as readonly string[]).includes(value);
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    practiceAreaSlugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isPracticeAreaSlug(slug)) return {};

  const t = await getTranslations({ locale, namespace: 'practiceAreas' });
  return {
    title: t(`${slug}.name`),
    description: t(`${slug}.summary`),
    alternates: {
      // Turkish path segments stay identical across locales (see i18n/routing.ts),
      // so the slug does not change between languages.
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}/calisma-alanlari/${slug}`]),
      ),
    },
  };
}

/** Detail page for a single field of work, with its related published articles. */
export default async function PracticeAreaDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;

  if (!hasLocale(routing.locales, locale) || !isPracticeAreaSlug(slug)) {
    notFound();
  }

  setRequestLocale(locale);
  const typedLocale = locale as Locale;
  const index = practiceAreaSlugs.indexOf(slug);

  const [tAreas, tAreasPage, tDetail, tArticle, related] = await Promise.all([
    getTranslations({ locale, namespace: 'practiceAreas' }),
    getTranslations({ locale, namespace: 'practiceAreasPage' }),
    getTranslations({ locale, namespace: 'practiceAreaDetail' }),
    getTranslations({ locale, namespace: 'article' }),
    getArticlesByCategory(typedLocale, slug, 3),
  ]);

  const body = tAreas.raw(`${slug}.body`) as string[];

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    numberingSystem: 'latn',
  });

  return (
    <>
      <section className="mx-auto max-w-wide px-gutter py-section">
        <div className="mb-10">
          <ActionLink href="/calisma-alanlari" variant="quiet">
            {tDetail('back')}
          </ActionLink>
        </div>

        <SectionHeading
          as="h1"
          number={practiceAreaNumber(index)}
          label={tAreasPage('label')}
          title={tAreas(`${slug}.name`)}
          lead={tAreas(`${slug}.summary`)}
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-8">
            <div className="measure flex flex-col gap-5 text-md leading-prose text-ink-muted">
              {body.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-10">
              <ActionLink href="/iletisim" variant="solid">
                {tDetail('contactCta')}
              </ActionLink>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-wide px-gutter py-section-sm">
          <h2 className="label text-gold-800">{tDetail('relatedLabel')}</h2>

          {related.length > 0 ? (
            <ul className="mt-8 grid gap-10 md:grid-cols-3 md:gap-8">
              {related.map((article, i) => (
                <Reveal as="li" key={article.id} index={i}>
                  <Link
                    href={`/makaleler/${article.slug}`}
                    className="group flex h-full flex-col border-t border-rule pt-6"
                  >
                    <h3 className="font-display text-xl font-normal text-ink transition-colors duration-base group-hover:text-gold-800">
                      {article.title}
                    </h3>
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
            <p className="mt-6 text-sm text-ink-muted">{tDetail('relatedEmpty')}</p>
          )}
        </div>
      </section>
    </>
  );
}

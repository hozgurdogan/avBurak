import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/locales';
import { practiceAreaSlugs, practiceAreaNumber } from '@/content/practice-areas';
import { getLatestArticles } from '@/lib/articles';
import { SectionHeading } from '@/components/ui/section-heading';
import { ActionLink } from '@/components/ui/action-link';
import { Monogram } from '@/components/brand/monogram';
import { Reveal } from '@/components/motion/reveal';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home.meta' });
  return { title: t('title'), description: t('description') };
}

/**
 * The home page is the one place the monogram appears at watermark scale - the
 * single restrained signature element the brief allows. It sits behind the
 * hero copy at very low opacity rather than as a photograph or a gradient.
 */
export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const typedLocale = locale as Locale;

  const [tHero, tPractice, tProfile, tArticles, tContact, tPracticeAreas, tArticle] =
    await Promise.all([
      getTranslations({ locale, namespace: 'home.hero' }),
      getTranslations({ locale, namespace: 'home.practice' }),
      getTranslations({ locale, namespace: 'home.profile' }),
      getTranslations({ locale, namespace: 'home.articles' }),
      getTranslations({ locale, namespace: 'home.contact' }),
      getTranslations({ locale, namespace: 'practiceAreas' }),
      getTranslations({ locale, namespace: 'article' }),
    ]);

  const latestArticles = await getLatestArticles(typedLocale, 3);

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    // Explicit per the brief: Western digits throughout the Arabic edition,
    // regardless of what the deployment's ICU build would default to.
    numberingSystem: 'latn',
  });

  return (
    <>
      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                              */}
      {/* ---------------------------------------------------------------- */}
      <section data-surface="navy" className="relative overflow-hidden bg-navy-900">
        <Monogram
          variant="watermark"
          className="pointer-events-none absolute -end-16 -top-24 w-[34rem] text-canvas opacity-[0.04] sm:w-[42rem]"
        />
        <div className="relative mx-auto max-w-wide px-gutter py-section">
          <div className="max-w-narrow">
            <p className="label flex items-center gap-3 text-gold-500">
              <span className="rule-mark" aria-hidden="true" />
              {tHero('label')}
            </p>
            <h1 className="mt-6 font-display text-display font-normal text-canvas">
              {tHero('title')}
            </h1>
            <p className="measure mt-8 text-lg text-mist">{tHero('credential')}</p>
            <p className="measure mt-4 text-md text-mist-muted">{tHero('lead')}</p>
            <div className="mt-10 flex flex-wrap items-center gap-8">
              <ActionLink href="/iletisim" variant="solid" surface="navy">
                {tHero('contact')}
              </ActionLink>
              {/* Both CTAs lead to the same page, so the secondary one skips
                  straight to the form rather than repeating the primary link.
                  The offset under the sticky header comes from
                  `scroll-padding-block-start` in globals.css. */}
              <ActionLink href="/iletisim#form" variant="quiet" surface="navy">
                {tHero('appointment')}
              </ActionLink>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Practice areas                                                    */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-wide px-gutter py-section">
        <SectionHeading
          number="01"
          label={tPractice('label')}
          title={tPractice('title')}
          lead={tPractice('lead')}
        />

        <ol className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-12">
          {practiceAreaSlugs.map((slug, index) => (
            <Reveal
              as="li"
              key={slug}
              index={index % 4}
              className={
                index % 3 === 0
                  ? 'lg:col-span-5 lg:col-start-1'
                  : index % 3 === 1
                    ? 'lg:col-span-5 lg:col-start-8'
                    : 'lg:col-span-5 lg:col-start-3'
              }
            >
              <Link
                href={`/calisma-alanlari/${slug}`}
                className="group block border-t border-rule pt-6"
              >
                <span className="label text-gold-800" aria-hidden="true">
                  {practiceAreaNumber(index)}
                </span>
                <h3 className="mt-3 font-display text-2xl font-normal text-ink transition-colors duration-base group-hover:text-gold-800">
                  {tPracticeAreas(`${slug}.name`)}
                </h3>
                <p className="mt-3 measure text-sm text-ink-muted">
                  {tPracticeAreas(`${slug}.summary`)}
                </p>
              </Link>
            </Reveal>
          ))}
        </ol>

        <div className="mt-14">
          <ActionLink href="/calisma-alanlari" variant="outline">
            {tPractice('all')}
          </ActionLink>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Profile                                                           */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-paper">
        <div className="mx-auto max-w-wide px-gutter py-section-sm">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-8">
            <div className="lg:col-span-4">
              <SectionHeading number="02" label={tProfile('label')} title={tProfile('title')} />
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <p className="measure text-md leading-prose text-ink-muted">{tProfile('body')}</p>
              <div className="mt-8">
                <ActionLink href="/profil" variant="quiet">
                  {tProfile('link')}
                </ActionLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Articles                                                          */}
      {/* ---------------------------------------------------------------- */}
      {latestArticles.length > 0 ? (
        <section className="mx-auto max-w-wide px-gutter py-section">
          <SectionHeading
            number="03"
            label={tArticles('label')}
            title={tArticles('title')}
            lead={tArticles('lead')}
          />

          <ul className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {latestArticles.map((article, index) => (
              <Reveal as="li" key={article.id} index={index}>
                <Link
                  href={`/makaleler/${article.slug}`}
                  className="group flex h-full flex-col border-t border-rule pt-6"
                >
                  {article.categories[0] ? (
                    <span className="label text-gold-800">{article.categories[0].name}</span>
                  ) : null}
                  <h3 className="mt-3 font-display text-xl font-normal text-ink transition-colors duration-base group-hover:text-gold-800">
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

          <div className="mt-14">
            <ActionLink href="/makaleler" variant="outline">
              {tArticles('all')}
            </ActionLink>
          </div>
        </section>
      ) : null}

      {/* ---------------------------------------------------------------- */}
      {/* Contact                                                           */}
      {/* ---------------------------------------------------------------- */}
      <section data-surface="navy" className="bg-navy-900">
        <div className="mx-auto max-w-wide px-gutter py-section-sm">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-8">
            <div className="lg:col-span-6">
              <SectionHeading
                number="04"
                label={tContact('label')}
                title={tContact('title')}
                surface="navy"
              />
            </div>
            <div className="lg:col-span-5 lg:col-start-8">
              <p className="measure text-md text-mist">{tContact('body')}</p>
              <div className="mt-8">
                <ActionLink href="/iletisim" variant="outline" surface="navy">
                  {tContact('link')}
                </ActionLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

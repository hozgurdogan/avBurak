import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/locales';
import {
  serviceRegionSlugs,
  serviceRegionNumber,
  type ServiceRegionSlug,
} from '@/content/service-regions';
import { SectionHeading } from '@/components/ui/section-heading';
import { ActionLink } from '@/components/ui/action-link';
import { pageMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/seo/json-ld';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { buildBreadcrumbSchema } from '@/lib/structured-data';
import { practiceAreaSlugs } from '@/content/practice-areas';
import { buyukcekmeceJudicialRegions, jurisdictionSource, regionArticles, regionPracticeAreas, relatedRegions,
  type RegionSection, type RegionQuestion } from '@/content/region-guides';
import { getRegionArticles } from '@/lib/articles';
import { articleExcerpt } from '@/lib/site';
import { practiceAreaToolSlugs } from '@/content/practice-area-tools';
import { ArticleToc } from '@/components/ui/article-toc';
import { localFamilyService } from '@/content/local-family-service';

// Related articles come from the live CMS, including their real translated slugs.
export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

function isServiceRegionSlug(value: string): value is ServiceRegionSlug {
  return (serviceRegionSlugs as readonly string[]).includes(value);
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => serviceRegionSlugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale) || !isServiceRegionSlug(slug)) return {};

  const t = await getTranslations({ locale, namespace: 'serviceRegions' });
  return pageMetadata({
    locale: locale as Locale,
    path: `bolgeler/${slug}`,
    // A bare district name as the title/H1 was flagged by the SEO audit
    // (rapor/, 10 Ekim 2026) as unhelpfully thin - `pageTitle`/`h1` below
    // are the fuller, district + "avukat" phrased copy it recommended.
    title: t(`${slug}.pageTitle`),
    description: t(`${slug}.summary`),
    brandTitle: false,
  });
}

/** Detail page for one of the three regional pages - see the index
 *  (`bolgeler/page.tsx`) and `src/content/service-regions.ts`. */
export default async function ServiceRegionDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;

  if (!hasLocale(routing.locales, locale) || !isServiceRegionSlug(slug)) {
    notFound();
  }

  setRequestLocale(locale);
  const typedLocale = locale as Locale;
  const index = serviceRegionSlugs.indexOf(slug);

  const [tRegions, tRegionsPage, tDetail, tAreas, tNav, tTools, articles] = await Promise.all([
    getTranslations({ locale, namespace: 'serviceRegions' }),
    getTranslations({ locale, namespace: 'serviceRegionsPage' }),
    getTranslations({ locale, namespace: 'serviceRegionDetail' }),
    getTranslations({ locale, namespace: 'practiceAreas' }),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'tools' }),
    getRegionArticles(typedLocale, regionArticles[slug]),
  ]);

  const body = tRegions.raw(`${slug}.body`) as string[];
  const sections = tRegions.raw(`${slug}.sections`) as RegionSection[];
  const questions = tRegions.raw(`${slug}.faq`) as RegionQuestion[];
  const hasJurisdiction = buyukcekmeceJudicialRegions.has(slug);
  const tools = [...new Set(regionPracticeAreas[slug].flatMap((area) => practiceAreaToolSlugs[area] ?? []))].slice(0, 5);
  const relatedAreas = slug === 'esenyurt'
    ? practiceAreaSlugs
    : regionPracticeAreas[slug];
  const outline = [
    ...sections.map((section) => ({ id: section.id, text: section.title, level: 2 as const })),
    ...(hasJurisdiction ? [{ id: 'adli-yargi-cevresi', text: tRegions(`${slug}.jurisdictionTitle`), level: 2 as const }] : []),
    { id: 'sik-sorulan-sorular', text: tDetail('faqTitle'), level: 2 as const },
    ...(articles.length ? [{ id: 'ilgili-makaleler', text: tDetail('articlesTitle'), level: 2 as const }] : []),
  ];

  const breadcrumbItems = [
    { name: tNav('home'), path: '' },
    { name: tRegionsPage('label'), path: 'bolgeler' },
    { name: tRegions(`${slug}.name`), path: `bolgeler/${slug}` },
  ];

  return (
    <>
      <JsonLd data={buildBreadcrumbSchema(typedLocale, breadcrumbItems)} />
      <section className="bg-canvas-deep">
        <div className="mx-auto max-w-wide px-gutter py-section">
          <div className="mb-10">
            <Breadcrumb items={breadcrumbItems} label={tNav('breadcrumb')} />
            <ActionLink href="/bolgeler" variant="quiet">
              {tDetail('back')}
            </ActionLink>
          </div>

          <SectionHeading
            as="h1"
            number={serviceRegionNumber(index)}
            label={tRegionsPage('label')}
            title={tRegions(`${slug}.h1`)}
            lead={tRegions(`${slug}.summary`)}
          />

          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-8">
              <div className="measure flex flex-col gap-5 text-md leading-prose text-ink-muted">
                {body.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              <ArticleToc headings={outline} label={tDetail('tocLabel')} className="mt-10" />
              {sections.map((section) => <section key={section.id} id={section.id} className="mt-12 border-t border-rule pt-8">
                <h2 className="font-display text-2xl text-ink">{section.title}</h2>
                <div className="measure mt-4 space-y-4 text-md leading-prose text-ink-muted">
                  {section.paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
                </div>
              </section>)}
              {hasJurisdiction ? <section id="adli-yargi-cevresi" className="mt-12 border-t border-rule pt-8">
                <h2 className="font-display text-2xl text-ink">{tRegions(`${slug}.jurisdictionTitle`)}</h2>
                {slug === 'mimaroba' ? <p className="measure mt-4 text-md leading-prose text-ink-muted">{tDetail('mimarobaJurisdictionIntro')}</p> : null}
                <p className="measure mt-4 text-md leading-prose text-ink-muted">{tDetail('jurisdictionText')}</p>
                <p className="measure mt-4 text-sm leading-prose text-ink-muted">{tDetail('jurisdictionCaveat')}</p>
                <a href={jurisdictionSource} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm text-gold-800 underline">{tDetail('jurisdictionSource')}</a>
              </section> : null}
              <section id="sik-sorulan-sorular" className="mt-12 border-t border-rule pt-8">
                <h2 className="font-display text-2xl text-ink">{tDetail('faqTitle')}</h2>
                <div className="mt-6 space-y-8">
                  {questions.map((item) => {
                    const linkedArticle = articles.find((article) => article.referenceSlug === item.articleRef);
                    return <div key={item.question}>
                      <h3 className="text-lg font-medium text-ink">{item.question}</h3>
                      <p className="measure mt-3 text-md leading-prose text-ink-muted">{item.answer}</p>
                      {linkedArticle ? <p className="mt-3"><Link href={`/makaleler/${linkedArticle.slug}`} className="text-sm text-gold-800 underline">{linkedArticle.title}</Link></p> : null}
                    </div>;
                  })}
                </div>
              </section>
              {articles.length > 0 ? <section id="ilgili-makaleler" className="mt-12 border-t border-rule pt-8">
                <h2 className="font-display text-2xl text-ink">{tDetail('articlesTitle')}</h2>
                <p className="measure mt-4 text-md text-ink-muted">{tDetail('articlesLead')}</p>
                <ul className="mt-6 space-y-6">
                  {articles.map((article) => <li key={article.id}>
                    <Link href={`/makaleler/${article.slug}`} className="font-display text-xl text-ink underline decoration-rule underline-offset-4 hover:text-gold-800">{article.title}</Link>
                    <p className="measure mt-2 text-sm text-ink-muted">{articleExcerpt(article.summary)}</p>
                  </li>)}
                </ul>
              </section> : null}

              <div className="mt-10">
                <ActionLink href="/iletisim" variant="solid">
                  {tDetail('contactCta')}
                </ActionLink>
              </div>
            </div>

            <aside className="lg:col-span-4">
              <div className="border-t border-rule pt-8">
                <h2 className="label text-ink-faint">{tDetail('relatedAreasLabel')}</h2>
                <ul className="mt-4 flex flex-col gap-3">
                  {slug === 'beylikduzu' ? <li><Link href="/bolgeler/beylikduzu-bosanma-avukati" className="text-md text-ink underline hover:text-gold-800">{localFamilyService[typedLocale].title}</Link></li> : null}
                  {relatedAreas.map((areaSlug) => (
                    <li key={areaSlug}>
                      <Link
                        href={`/calisma-alanlari/${areaSlug}`}
                        className="text-md text-ink transition-colors duration-base hover:text-gold-800"
                      >
                        {tAreas(`${areaSlug}.name`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              {tools.length > 0 ? <section className="mt-10 border-t border-rule pt-8">
                <h2 className="label text-ink-faint">{tDetail('toolsTitle')}</h2>
                <ul className="mt-4 space-y-3">{tools.map((tool) => <li key={tool}>
                  <Link href={`/hesaplama-araclari/${tool}`} className="text-md text-ink hover:text-gold-800">{tTools(`${tool}.name`)}</Link>
                </li>)}</ul>
              </section> : null}
              {relatedRegions[slug]?.length ? <section className="mt-10 border-t border-rule pt-8">
                <h2 className="label text-ink-faint">{tDetail('regionsTitle')}</h2>
                <ul className="mt-4 space-y-3">{relatedRegions[slug]!.map((region) => <li key={region}>
                  <Link href={`/bolgeler/${region}`} className="text-md text-ink hover:text-gold-800">{tRegions(`${region}.guideLink`)}</Link>
                </li>)}</ul>
              </section> : null}
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}

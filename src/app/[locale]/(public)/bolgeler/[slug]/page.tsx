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
import { buildBreadcrumbSchema } from '@/lib/structured-data';

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
  if (!isServiceRegionSlug(slug)) return {};

  const t = await getTranslations({ locale, namespace: 'serviceRegions' });
  return pageMetadata({
    locale: locale as Locale,
    path: `bolgeler/${slug}`,
    title: t(`${slug}.name`),
    description: t(`${slug}.summary`),
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

  const [tRegions, tRegionsPage, tDetail, tAreas, tNav] = await Promise.all([
    getTranslations({ locale, namespace: 'serviceRegions' }),
    getTranslations({ locale, namespace: 'serviceRegionsPage' }),
    getTranslations({ locale, namespace: 'serviceRegionDetail' }),
    getTranslations({ locale, namespace: 'practiceAreas' }),
    getTranslations({ locale, namespace: 'nav' }),
  ]);

  const body = tRegions.raw(`${slug}.body`) as string[];
  const relatedAreas = tRegions.raw(`${slug}.relatedAreas`) as string[];

  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema(typedLocale, [
          { name: tNav('home'), path: '' },
          { name: tRegionsPage('label'), path: 'bolgeler' },
          { name: tRegions(`${slug}.name`), path: `bolgeler/${slug}` },
        ])}
      />
      <section className="bg-canvas-deep">
        <div className="mx-auto max-w-wide px-gutter py-section">
          <div className="mb-10">
            <ActionLink href="/bolgeler" variant="quiet">
              {tDetail('back')}
            </ActionLink>
          </div>

          <SectionHeading
            as="h1"
            number={serviceRegionNumber(index)}
            label={tRegionsPage('label')}
            title={tRegions(`${slug}.name`)}
            lead={tRegions(`${slug}.summary`)}
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

            <aside className="lg:col-span-4">
              <div className="border-t border-rule pt-8">
                <h2 className="label text-ink-faint">{tDetail('relatedAreasLabel')}</h2>
                <ul className="mt-4 flex flex-col gap-3">
                  {relatedAreas.map((areaSlug) => (
                    <li key={areaSlug}>
                      <Link
                        href={`/calisma-alanlari/${areaSlug}`}
                        className="text-sm text-ink transition-colors duration-base hover:text-gold-800"
                      >
                        {tAreas(`${areaSlug}.name`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}

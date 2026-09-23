import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/locales';
import { serviceRegionSlugs, serviceRegionNumber } from '@/content/service-regions';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/motion/reveal';
import { pageMetadata } from '@/lib/seo';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'serviceRegionsPage.meta' });
  return pageMetadata({
    locale: locale as Locale,
    path: 'bolgeler',
    title: t('title'),
    description: t('description'),
  });
}

/**
 * The index of the three regional pages the SEO audit recommends
 * (rapor/, 2026-09-18, section 08) - a handful of genuinely distinct pages,
 * not one templated page per district. See `src/content/service-regions.ts`.
 */
export default async function ServiceRegionsPage({ params }: PageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const [t, tRegions] = await Promise.all([
    getTranslations('serviceRegionsPage'),
    getTranslations('serviceRegions'),
  ]);

  return (
    <section className="bg-canvas-deep">
      <div className="mx-auto max-w-wide px-gutter py-section">
        <SectionHeading as="h1" label={t('label')} title={t('title')} lead={t('lead')} />

        <ol className="mt-14 grid gap-x-8 gap-y-12 md:grid-cols-3">
          {serviceRegionSlugs.map((slug, index) => (
            <Reveal as="li" key={slug} index={index}>
              <Link href={`/bolgeler/${slug}`} className="group block border-t border-rule pt-6">
                <span className="label text-gold-800" aria-hidden="true">
                  {serviceRegionNumber(index)}
                </span>
                <h2 className="mt-3 font-display text-2xl font-normal text-ink transition-colors duration-base group-hover:text-gold-800">
                  {tRegions(`${slug}.name`)}
                </h2>
                <p className="mt-3 measure text-sm text-ink-muted">{tRegions(`${slug}.summary`)}</p>
              </Link>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

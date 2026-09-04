import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { practiceAreaSlugs, practiceAreaNumber } from '@/content/practice-areas';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/motion/reveal';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'practiceAreasPage.meta' });
  return { title: t('title'), description: t('description') };
}

/** The index of all six fields of work, each linking to its own detail page. */
export default async function PracticeAreasPage({ params }: PageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const [t, tAreas] = await Promise.all([
    getTranslations('practiceAreasPage'),
    getTranslations('practiceAreas'),
  ]);

  return (
    <section className="mx-auto max-w-wide px-gutter py-section">
      <SectionHeading as="h1" label={t('label')} title={t('title')} lead={t('lead')} />

      <ol className="mt-14 grid gap-x-8 gap-y-12 md:grid-cols-2">
        {practiceAreaSlugs.map((slug, index) => (
          <Reveal as="li" key={slug} index={index % 4}>
            <Link href={`/calisma-alanlari/${slug}`} className="group block border-t border-rule pt-6">
              <span className="label text-gold-800" aria-hidden="true">
                {practiceAreaNumber(index)}
              </span>
              <h2 className="mt-3 font-display text-2xl font-normal text-ink transition-colors duration-base group-hover:text-gold-800">
                {tAreas(`${slug}.name`)}
              </h2>
              <p className="mt-3 measure text-sm text-ink-muted">{tAreas(`${slug}.summary`)}</p>
            </Link>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { tools, toolNumber } from '@/lib/tools/registry';
import { SectionHeading } from '@/components/ui/section-heading';
import { LegalDisclaimer } from '@/components/ui/legal-disclaimer';
import { Reveal } from '@/components/motion/reveal';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'toolsPage.meta' });
  return { title: t('title'), description: t('description') };
}

/**
 * The index of the calculators.
 *
 * Note what the heading does NOT say: the word "ücretsiz" was in the brief for
 * this page and is not here. A price statement - including a price of zero -
 * is advertising, and the advertising regulation the rest of this site is
 * built around does not carve out an exception for free things.
 */
export default async function ToolsPage({ params }: PageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const [t, tTools] = await Promise.all([getTranslations('toolsPage'), getTranslations('tools')]);

  return (
    <section className="mx-auto max-w-wide px-gutter py-section">
      <SectionHeading as="h1" label={t('label')} title={t('title')} lead={t('lead')} />

      <ol className="mt-14 border-t border-rule">
        {tools.map((tool, index) => (
          <Reveal as="li" key={tool.slug} index={index % 3}>
            <Link
              href={`/hesaplama-araclari/${tool.slug}`}
              className="group grid items-baseline gap-x-8 gap-y-3 border-b border-rule py-8 lg:grid-cols-12"
            >
              <span className="label text-gold-800 lg:col-span-1" aria-hidden="true">
                {toolNumber(index)}
              </span>
              <h2 className="font-display text-2xl font-normal text-ink transition-colors duration-base ease-out-editorial group-hover:text-gold-800 lg:col-span-4">
                {tTools(`${tool.slug}.name`)}
              </h2>
              <p className="text-sm text-ink-muted lg:col-span-6">
                {tTools(`${tool.slug}.summary`)}
              </p>
              <span
                aria-hidden="true"
                className="hidden text-gold-800 opacity-0 transition-opacity duration-base ease-out-editorial group-hover:opacity-100 lg:col-span-1 lg:block lg:justify-self-end"
              >
                <svg viewBox="0 0 24 12" width="22" height="11" focusable="false" className="mirror-rtl">
                  <path
                    d="M0 6h21M16 1l5 5-5 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="square"
                  />
                </svg>
              </span>
            </Link>
          </Reveal>
        ))}
      </ol>

      <LegalDisclaimer className="mt-16 max-w-narrow" />
    </section>
  );
}

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/locales';
import { getTool, tools, toolSlugs } from '@/lib/tools/registry';
import { ActionLink } from '@/components/ui/action-link';
import { LegalDisclaimer } from '@/components/ui/legal-disclaimer';
import { Calculator } from '@/components/tools/calculator';
import { pageMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/seo/json-ld';
import { buildBreadcrumbSchema } from '@/lib/structured-data';
import { practiceAreasForTool } from '@/content/practice-area-tools';

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => toolSlugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale) || !getTool(slug)) return {};

  const t = await getTranslations({ locale, namespace: 'tools' });
  return pageMetadata({
    locale: locale as Locale,
    path: `hesaplama-araclari/${slug}`,
    title: t(`${slug}.name`),
    description: t(`${slug}.summary`),
  });
}

export default async function ToolPage({ params }: PageProps) {
  const { locale, slug } = await params;

  if (!hasLocale(routing.locales, locale) || !getTool(slug)) {
    notFound();
  }

  setRequestLocale(locale);
  const typedLocale = locale as Locale;

  const [t, tPage, tNav, tAreas] = await Promise.all([
    getTranslations('tools'),
    getTranslations('toolsPage'),
    getTranslations('nav'),
    getTranslations('practiceAreas'),
  ]);

  const others = tools.filter((tool) => tool.slug !== slug).slice(0, 3);
  const relatedAreas = practiceAreasForTool(slug);

  return (
    <>
    <JsonLd
      data={buildBreadcrumbSchema(typedLocale, [
        { name: tNav('home'), path: '' },
        { name: tNav('tools'), path: 'hesaplama-araclari' },
        { name: t(`${slug}.name`), path: `hesaplama-araclari/${slug}` },
      ])}
    />
    <section className="bg-canvas-deep">
    <div className="mx-auto max-w-wide px-gutter py-section">
      <div className="mb-10">
        <ActionLink href="/hesaplama-araclari" variant="quiet">
          {tPage('back')}
        </ActionLink>
      </div>

      <header className="max-w-narrow">
        <p className="label flex items-center gap-3 text-gold-800">
          <span className="rule-mark" aria-hidden="true" />
          {tPage('label')}
        </p>
        <h1 className="mt-6 font-display text-display-sm font-normal text-ink">
          {t(`${slug}.name`)}
        </h1>
        <p className="measure mt-6 text-md leading-prose text-ink-muted">{t(`${slug}.intro`)}</p>
        {relatedAreas.length > 0 ? (
          <p className="mt-4 text-sm text-ink-muted">
            {relatedAreas.map((areaSlug, i) => (
              <span key={areaSlug}>
                {i > 0 ? ' · ' : null}
                <Link
                  href={`/calisma-alanlari/${areaSlug}`}
                  className="underline decoration-rule underline-offset-2 transition-colors duration-base hover:text-gold-800"
                >
                  {tAreas(`${areaSlug}.name`)}
                </Link>
              </span>
            ))}
          </p>
        ) : null}
      </header>

      <div className="mt-14">
        <Calculator slug={slug} />
      </div>

      <LegalDisclaimer className="mt-16 max-w-narrow" />

      <div className="mt-16 border-t border-rule pt-10">
        <h2 className="label text-gold-800">{tPage('otherToolsLabel')}</h2>
        <ul className="mt-8 grid gap-10 md:grid-cols-3 md:gap-8">
          {others.map((tool) => (
            <li key={tool.slug}>
              <Link
                href={`/hesaplama-araclari/${tool.slug}`}
                className="group flex h-full flex-col border-t border-rule pt-6"
              >
                <h3 className="font-display text-xl font-normal text-ink transition-colors duration-base ease-out-editorial group-hover:text-gold-800">
                  {t(`${tool.slug}.name`)}
                </h3>
                <p className="mt-3 flex-1 text-sm text-ink-muted">{t(`${tool.slug}.summary`)}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
    </section>
    </>
  );
}

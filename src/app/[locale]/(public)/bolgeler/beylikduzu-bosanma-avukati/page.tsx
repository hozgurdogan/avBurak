import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { isLocale } from '@/i18n/locales';
import { Link } from '@/i18n/navigation';
import { localFamilyService } from '@/content/local-family-service';
import { getRegionArticles } from '@/lib/articles';
import { pageMetadata } from '@/lib/seo';
import { buildBreadcrumbSchema } from '@/lib/structured-data';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { JsonLd } from '@/components/seo/json-ld';
import { SectionHeading } from '@/components/ui/section-heading';
import { ArticleContact } from '@/components/ui/article-contact';
import { LegalDisclaimer } from '@/components/ui/legal-disclaimer';

export const dynamic = 'force-dynamic';
const path = 'bolgeler/beylikduzu-bosanma-avukati';
type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = localFamilyService[locale];
  return pageMetadata({ locale, path, title: copy.title, description: copy.summary, brandTitle: false });
}

export default async function LocalFamilyPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const copy = localFamilyService[locale];
  const [nav, detail, articles] = await Promise.all([
    getTranslations('nav'), getTranslations('articleDetail'),
    getRegionArticles(locale, ['bosanmak-istiyorum-nereden-baslamaliyim', 'anlasmali-bosanma-nasil-yapilir', 'nafaka-artirim-davasi-nasil-acilir']),
  ]);
  const crumbs = [{ name: nav('home'), path: '' }, { name: 'Beylikdüzü', path: 'bolgeler/beylikduzu' }, { name: copy.label, path }];
  return <>
    <JsonLd data={buildBreadcrumbSchema(locale, crumbs)} />
    <section className="bg-canvas-deep"><div className="mx-auto max-w-wide px-gutter py-section">
      <Breadcrumb items={crumbs} label={nav('breadcrumb')} />
      <div className="mt-10"><SectionHeading as="h1" label={copy.label} title={copy.title} lead={copy.summary} /></div>
      <div className="measure mt-12 space-y-10">
        {copy.sections.map((section) => <section key={section.title}><h2 className="font-display text-2xl text-ink">{section.title}</h2><p className="mt-4 text-md leading-prose text-ink-muted">{section.body}</p></section>)}
        <p><Link href="/bolgeler/beylikduzu" className="text-ink-muted underline">Beylikdüzü</Link> · <Link href="/calisma-alanlari/bosanma-aile-hukuku" className="text-ink-muted underline">{copy.label}</Link></p>
        {articles.length ? <section><h2 className="label text-gold-800">{detail('relatedLabel')}</h2><ul className="mt-4 space-y-3">{articles.map((article) => <li key={article.id}><Link href={`/makaleler/${article.slug}`} className="text-md text-ink-muted underline">{article.title}</Link></li>)}</ul></section> : null}
        <ArticleContact title={copy.label} />
        <LegalDisclaimer />
      </div>
    </div></section>
  </>;
}

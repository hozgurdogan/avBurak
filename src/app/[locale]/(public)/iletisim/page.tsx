import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { SectionHeading } from '@/components/ui/section-heading';
import { ContactForm } from '@/components/forms/contact-form';
import { office, formatAddress, telHref, whatsappHref } from '@/content/office';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contactPage.meta' });
  return { title: t('title'), description: t('description') };
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const [t, tFooter] = await Promise.all([
    getTranslations('contactPage'),
    getTranslations('footer'),
  ]);

  const tel = telHref();
  const whatsapp = whatsappHref();

  return (
    <section className="mx-auto max-w-wide px-gutter py-section">
      <SectionHeading as="h1" label={t('label')} title={t('title')} lead={t('lead')} />

      <div className="mt-14 grid gap-14 lg:grid-cols-12 lg:gap-8">
        {/* Anchor target for the home page's secondary "appointment" CTA. */}
        <div id="form" className="lg:col-span-7">
          <ContactForm />
        </div>

        <aside className="lg:col-span-4 lg:col-start-9">
          <div className="border-t border-rule pt-8">
            <h2 className="label text-gold-800">{t('directLabel')}</h2>
            <ul className="mt-4 flex flex-col gap-2 text-sm text-ink">
              {tel ? (
                <li>
                  <a href={tel} className="hover:text-gold-800" dir="ltr">
                    <span className="sr-only">{tFooter('phone')}: </span>
                    {office.phone}
                  </a>
                </li>
              ) : null}
              {office.email ? (
                <li>
                  <a href={`mailto:${office.email}`} className="hover:text-gold-800" dir="ltr">
                    <span className="sr-only">{tFooter('email')}: </span>
                    {office.email}
                  </a>
                </li>
              ) : null}
              {whatsapp ? (
                <li>
                  <a
                    href={whatsapp}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="hover:text-gold-800"
                  >
                    {tFooter('whatsapp')}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>

          <div className="mt-10 border-t border-rule pt-8">
            <h2 className="label text-gold-800">{t('officeLabel')}</h2>
            <address className="mt-4 text-sm not-italic leading-prose text-ink">
              {formatAddress()}
            </address>
            <p className="label mt-6 text-ink-faint">
              {tFooter('barRegistration', {
                bar: office.bar.association,
                registryNo: office.bar.registryNo,
              })}
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

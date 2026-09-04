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
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-t border-rule pt-6">
            <h2 className="label text-gold-800">{t('formLabel')}</h2>
            <p className="text-xs text-ink-faint">{t('requiredNote')}</p>
          </div>
          <div className="mt-8">
            <ContactForm />
          </div>
        </div>

        {/* The direct-contact details sit on the raised paper surface so the
            page reads as two distinct routes to the office - fill in the form,
            or call - rather than a form with a column of loose text next to it. */}
        <aside className="lg:col-span-4 lg:col-start-9">
          <div className="border border-rule-neutral bg-paper p-8">
            <h2 className="label text-gold-800">{t('directLabel')}</h2>
            <ul className="mt-5 flex flex-col divide-y divide-rule-neutral text-sm text-ink">
              {tel ? (
                <li className="pb-3">
                  <a
                    href={tel}
                    className="transition-colors duration-base ease-out-editorial hover:text-gold-800"
                    dir="ltr"
                  >
                    <span className="sr-only">{tFooter('phone')}: </span>
                    {office.phone}
                  </a>
                </li>
              ) : null}
              {office.email ? (
                <li className="py-3">
                  <a
                    href={`mailto:${office.email}`}
                    className="transition-colors duration-base ease-out-editorial hover:text-gold-800"
                    dir="ltr"
                  >
                    <span className="sr-only">{tFooter('email')}: </span>
                    {office.email}
                  </a>
                </li>
              ) : null}
              {whatsapp ? (
                <li className="pt-3">
                  <a
                    href={whatsapp}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="transition-colors duration-base ease-out-editorial hover:text-gold-800"
                  >
                    {tFooter('whatsapp')}
                  </a>
                </li>
              ) : null}
            </ul>

            <h2 className="label mt-8 border-t border-rule pt-8 text-gold-800">
              {t('officeLabel')}
            </h2>
            <address className="mt-4 text-sm not-italic leading-prose text-ink">
              {formatAddress()}
            </address>

            <p className="label mt-8 border-t border-rule pt-6 text-ink-faint">
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

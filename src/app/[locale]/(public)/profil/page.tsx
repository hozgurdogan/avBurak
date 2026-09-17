import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { SectionHeading } from '@/components/ui/section-heading';
import { ActionLink } from '@/components/ui/action-link';
import { office } from '@/content/office';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'profilePage.meta' });
  return { title: t('title'), description: t('description') };
}

export default async function ProfilePage({ params }: PageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const t = await getTranslations('profilePage');
  const approachBody = t.raw('approachBody') as string[];

  return (
    <section className="bg-canvas-deep">
    <div className="mx-auto max-w-wide px-gutter py-section">
      <SectionHeading as="h1" label={t('label')} title={t('title')} />

      <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-8">
          <p className="measure text-md leading-prose text-ink-muted">{t('intro')}</p>

          <div className="mt-10 border-t border-rule pt-8">
            <h2 className="label text-gold-800">{t('approachTitle')}</h2>
            <div className="mt-4 measure flex flex-col gap-5 text-md leading-prose text-ink-muted">
              {approachBody.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="mt-10 border-t border-rule pt-8">
            <h2 className="label text-gold-800">{t('scopeTitle')}</h2>
            <div className="mt-4">
              <ActionLink href="/calisma-alanlari" variant="quiet">
                {t('scopeLinkText')}
              </ActionLink>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4">
          {/* /public/images/profil.jpg - drop the real portrait there; nothing
              else in this component needs to change. Until the file exists the
              browser shows a broken-image icon here, which is harmless.

              Plain <img>, not next/image: the optimizer needs `sharp` at
              request time, and this cPanel/Passenger host has already shown
              process-limit failures (see next.config.ts) - not worth risking
              for a single portrait. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/profil.jpg"
            alt={t('portraitAlt')}
            width={480}
            height={600}
            className="aspect-[4/5] w-full border border-rule-neutral object-cover"
          />

          <dl className="mt-8 flex flex-col gap-6 border-t border-rule pt-8">
            <div>
              <dt className="label text-ink-faint">{t('admissionLabel')}</dt>
              <dd className="mt-2 text-sm text-ink">{office.bar.association}</dd>
            </div>
            <div>
              <dt className="label text-ink-faint">{t('languagesLabel')}</dt>
              <dd className="mt-2 text-sm text-ink">{t('languages')}</dd>
            </div>
          </dl>

          <div className="mt-8">
            <ActionLink href="/iletisim" variant="solid">
              {t('contactCta')}
            </ActionLink>
          </div>
        </aside>
      </div>
    </div>
    </section>
  );
}

import { getTranslations } from 'next-intl/server';
import { SectionHeading } from '@/components/ui/section-heading';
import { ActionLink } from '@/components/ui/action-link';

/**
 * The navy-on-canvas contact band that closes every public page, right above
 * the (also navy) footer. Originally the home page's own "04 İletişim"
 * section; promoted into the shared layout (2026-10-10, at the client's
 * request) so the brand's navy/white pairing shows up on every page, not
 * only the home page, without copy-pasting the section into each one.
 */
export async function ContactCtaBand() {
  const t = await getTranslations('home.contact');

  return (
    <section data-surface="navy" className="bg-navy-900">
      <div className="mx-auto max-w-wide px-gutter py-section-sm">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-8">
          <div className="lg:col-span-6">
            <SectionHeading label={t('label')} title={t('title')} surface="navy" />
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="measure text-md text-mist">{t('body')}</p>
            <div className="mt-8">
              <ActionLink href="/iletisim" variant="outline" surface="navy">
                {t('link')}
              </ActionLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

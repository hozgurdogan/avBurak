import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Monogram } from '@/components/brand/monogram';
import { LegalDisclaimer } from '@/components/ui/legal-disclaimer';
import { office, formatAddress, telHref, whatsappHref } from '@/content/office';

const siteLinks = [
  { href: '/calisma-alanlari', key: 'practiceAreas' },
  { href: '/profil', key: 'profile' },
  { href: '/makaleler', key: 'articles' },
  { href: '/hesaplama-araclari', key: 'tools' },
  { href: '/iletisim', key: 'contact' },
] as const;

/**
 * The footer carries three things the bar association's regulation requires on
 * every page: the bar registration line, the full office address, and a link to
 * the KVKK notice. The disclaimer sits here as well as under each article.
 *
 * Server component - it reads no browser state, so none of this ships as JS.
 */
export function SiteFooter() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const tSite = useTranslations('site');
  const tel = telHref();
  const whatsapp = whatsappHref();

  return (
    <footer data-surface="navy" className="bg-navy-900 text-mist">
      <div className="mx-auto max-w-wide px-gutter py-section-sm">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Monogram className="w-16 text-canvas" />
            <p className="mt-5 font-display text-xl text-canvas">{tSite('attorney')}</p>
            <p className="label mt-2 text-gold-500">
              {t('barRegistration', {
                bar: office.bar.association,
                registryNo: office.bar.registryNo,
              })}
            </p>
          </div>

          <div className="lg:col-span-3">
            <h2 className="label text-gold-500">{t('officeTitle')}</h2>
            <address className="mt-4 text-sm not-italic text-mist">{formatAddress()}</address>
          </div>

          <div className="lg:col-span-2">
            <h2 className="label text-gold-500">{t('contactTitle')}</h2>
            <ul className="mt-4 flex flex-col gap-2 text-sm">
              {tel ? (
                <li>
                  <a href={tel} className="hover:text-gold-300" dir="ltr">
                    <span className="sr-only">{t('phone')}: </span>
                    {office.phone}
                  </a>
                </li>
              ) : null}
              {office.email ? (
                <li>
                  <a href={`mailto:${office.email}`} className="hover:text-gold-300" dir="ltr">
                    <span className="sr-only">{t('email')}: </span>
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
                    className="hover:text-gold-300"
                  >
                    {t('whatsapp')}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h2 className="label text-gold-500">{t('navTitle')}</h2>
            <ul className="mt-4 flex flex-col gap-2 text-sm">
              {siteLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-gold-300">
                    {tNav(item.key)}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/kvkk" className="hover:text-gold-300">
                  {t('kvkk')}
                </Link>
              </li>
              <li>
                <Link href="/gizlilik" className="hover:text-gold-300">
                  {t('privacy')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <LegalDisclaimer surface="navy" className="mt-14 border-rule-invert" />

        <p className="mt-10 text-xs text-mist-muted">{t('rights', { year: new Date().getFullYear() })}</p>
      </div>
    </footer>
  );
}

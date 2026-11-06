import { useTranslations } from 'next-intl';
import { office, telHref, whatsappHref } from '@/content/office';

export function MobileContactBar() {
  const t = useTranslations('footer');
  return (
    <>
      <div className="mobile-contact-spacer lg:hidden" aria-hidden="true" />
      <div className="mobile-contact-bar fixed inset-x-0 bottom-0 z-50 grid grid-cols-2 border-t border-white/15 bg-navy-900 text-canvas lg:hidden">
        <a href={whatsappHref() ?? undefined} target="_blank" rel="noopener noreferrer" className="flex min-h-16 items-center justify-center gap-2 border-e border-white/20 px-2 text-sm font-medium hover:bg-navy-800 focus-visible:outline-offset-[-4px]">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 11.5a8.5 8.5 0 0 1-12.7 7.4L3 20l1.1-4.3A8.5 8.5 0 1 1 20 11.5Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="m8 7 2 3-1 1c1 2 2 3 4 4l1-1 3 2c-1 2-3 2-5 1-3-1-6-4-6-7 0-1 1-3 2-3Z" />
          </svg>
          {t('whatsapp')}
        </a>
        <a href={telHref() ?? undefined} aria-label={`${t('phone')}: ${office.phone}`} className="flex min-h-16 items-center justify-center gap-2 px-2 text-sm font-medium hover:bg-navy-800 focus-visible:outline-offset-[-4px]">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="m7 3 3 5-2 2c1 3 3 5 6 6l2-2 5 3c0 3-2 4-4 4C10 20 4 14 3 7c0-2 1-4 4-4Z" />
          </svg>
          <span dir="ltr" className="whitespace-nowrap">{office.phone}</span>
        </a>
      </div>
    </>
  );
}

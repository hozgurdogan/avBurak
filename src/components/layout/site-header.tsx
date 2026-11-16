'use client';

// Client component: the home header changes appearance on scroll, while all
// other public pages use a navy masthead. It also owns the mobile menu state.

import { Suspense, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { LocaleSwitcher, LocaleSwitcherFallback } from './locale-switcher';
import { office, telHref, whatsappHref } from '@/content/office';
import { Monogram } from '@/components/brand/monogram';
import { ActionLink } from '@/components/ui/action-link';
import { cn } from '@/lib/cn';

const navItems = [
  { href: '/calisma-alanlari', key: 'practiceAreas' },
  { href: '/bolgeler', key: 'regions' },
  { href: '/profil', key: 'profile' },
  { href: '/makaleler', key: 'articles' },
  { href: '/hesaplama-araclari', key: 'tools' },
  { href: '/sss', key: 'faq' },
  { href: '/iletisim', key: 'contact' },
] as const;

export function SiteHeader() {
  const t = useTranslations('nav');
  const tSite = useTranslations('site');
  const tFooter = useTranslations('footer');
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const tel = telHref();
  const whatsapp = whatsappHref();

  // The frosted treatment appears only once the page has left the top, so the
  // header reads as part of the page at rest and as a surface in motion.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Route change closes the menu; Escape closes it from the keyboard.
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-colors duration-slow ease-out-editorial',
        isHome
          ? scrolled
            ? 'border-b border-rule bg-canvas/85 backdrop-blur-frost backdrop-saturate-150'
            : 'border-b border-transparent bg-transparent'
          : 'border-b border-navy-600 bg-navy-900 text-canvas',
      )}
      data-surface={isHome ? 'light' : 'navy'}
    >
      {/* Slim utility strip: direct-contact channels and the locale switcher,
          kept off the main row so the logo and primary nav never have to
          compete with a phone number for space. Desktop only - the mobile
          menu carries the same links in its own, roomier layout. */}
      {tel || whatsapp ? (
        <div className={cn('hidden border-b lg:block', isHome ? 'border-rule-soft' : 'border-navy-600')}>
          <div className="mx-auto flex max-w-wide items-center justify-end gap-6 px-gutter py-2">
            {tel ? (
              <a
                href={tel}
                dir="ltr"
                className={cn('label transition-colors duration-base ease-out-editorial', isHome ? 'text-ink-faint hover:text-gold-800' : 'text-mist-muted hover:text-gold-300')}
              >
                <span className="sr-only">{tFooter('phone')}: </span>
                {office.phone}
              </a>
            ) : null}
            {whatsapp ? (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className={cn('label transition-colors duration-base ease-out-editorial', isHome ? 'text-ink-faint hover:text-gold-800' : 'text-mist-muted hover:text-gold-300')}
              >
                {tFooter('whatsapp')}
              </a>
            ) : null}
            <Suspense fallback={<LocaleSwitcherFallback surface={isHome ? 'light' : 'navy'} />}>
              <LocaleSwitcher surface={isHome ? 'light' : 'navy'} />
            </Suspense>
          </div>
        </div>
      ) : null}

      <div className="mx-auto flex max-w-wide items-center justify-between gap-3 px-gutter py-5 xl:gap-6">
        <Link
          href="/"
          className={cn('flex min-w-0 items-center gap-2 leading-tight sm:gap-3', isHome ? 'text-ink' : 'text-canvas')}
        >
          <Monogram className={cn('h-6 w-auto shrink-0 sm:h-9', isHome ? 'text-ink' : 'text-canvas')} />
          <span className="flex min-w-0 flex-col">
            <span className={cn('font-display text-sm sm:text-lg', isHome ? 'text-ink' : 'text-canvas')}>{tSite('attorney')}</span>
            <span className={cn('label whitespace-nowrap', isHome ? 'text-ink-faint' : 'text-mist-muted')}>{tSite('role')}</span>
          </span>
        </Link>

        <nav aria-label={t('primary')} className="hidden lg:block">
          <ul className="flex items-center gap-7 whitespace-nowrap">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'label-lg pb-1 transition-colors duration-base ease-out-editorial',
                      isActive
                        ? isHome ? 'border-b border-gold-500 text-ink' : 'border-b border-gold-500 text-canvas'
                        : isHome ? 'border-b border-transparent text-ink-muted hover:text-ink' : 'border-b border-transparent text-mist-muted hover:text-canvas',
                    )}
                  >
                    {t(item.key)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-5">
          <div className="hidden lg:block">
            <ActionLink href="/iletisim" variant="outline" surface={isHome ? 'light' : 'navy'} className="whitespace-nowrap">
              {t('getInTouch')}
            </ActionLink>
          </div>

          {/* Shown whenever the utility strip above is hidden (no phone/
              WhatsApp configured, or below the lg breakpoint where that
              strip never renders) so the switcher is never lost entirely. */}
          <div className={cn('hidden sm:block', tel || whatsapp ? 'lg:hidden' : undefined)}>
            <Suspense fallback={<LocaleSwitcherFallback surface={isHome ? 'light' : 'navy'} />}>
              <LocaleSwitcher surface={isHome ? 'light' : 'navy'} />
            </Suspense>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className={cn('flex min-h-11 min-w-11 items-center justify-center gap-3 lg:hidden', isHome ? 'text-ink' : 'text-canvas')}
          >
            <span className={cn('label sr-only whitespace-nowrap sm:not-sr-only', isHome ? 'text-ink-muted' : 'text-mist-muted')}>
              {menuOpen ? t('closeMenu') : t('openMenu')}
            </span>
            <span aria-hidden="true" className="flex w-6 flex-col gap-[5px]">
              <span className={cn('h-px w-full', isHome ? 'bg-ink' : 'bg-canvas')} />
              <span className={cn('h-px w-full', isHome ? 'bg-ink' : 'bg-canvas', menuOpen && 'opacity-0')} />
              <span className={cn('h-px w-full', isHome ? 'bg-ink' : 'bg-canvas')} />
            </span>
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        hidden={!menuOpen}
        className={cn('border-t lg:hidden', isHome ? 'border-rule bg-canvas' : 'border-navy-600 bg-navy-900')}
      >
        <nav aria-label={t('primary')} className="mx-auto max-w-wide px-gutter py-6">
          <ul className="flex flex-col">
            {navItems.map((item) => (
              <li key={item.href} className={cn('border-b last:border-b-0', isHome ? 'border-rule-soft' : 'border-navy-600')}>
                <Link
                  href={item.href}
                  className={cn('block py-4 font-display text-2xl', isHome ? 'text-ink' : 'text-canvas')}
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>

          {tel || whatsapp ? (
            <div className={cn('mt-6 flex flex-col gap-3 border-b pb-6', isHome ? 'border-rule-soft' : 'border-navy-600')}>
              {tel ? (
                <a href={tel} dir="ltr" className={cn('label-lg', isHome ? 'text-ink' : 'text-canvas')}>
                  <span className="sr-only">{tFooter('phone')}: </span>
                  {office.phone}
                </a>
              ) : null}
              {whatsapp ? (
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={cn('label-lg', isHome ? 'text-ink' : 'text-canvas')}>
                  {tFooter('whatsapp')}
                </a>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6 sm:hidden">
            <Suspense fallback={<LocaleSwitcherFallback surface={isHome ? 'light' : 'navy'} />}>
              <LocaleSwitcher surface={isHome ? 'light' : 'navy'} />
            </Suspense>
          </div>
        </nav>
      </div>
    </header>
  );
}

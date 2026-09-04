'use client';

// Client component: the header changes appearance on scroll and owns the
// mobile menu's open/closed state. Both need browser events.

import { Suspense, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { Monogram } from '@/components/brand/monogram';
import { LocaleSwitcher, LocaleSwitcherFallback } from './locale-switcher';
import { cn } from '@/lib/cn';

const navItems = [
  { href: '/calisma-alanlari', key: 'practiceAreas' },
  { href: '/profil', key: 'profile' },
  { href: '/makaleler', key: 'articles' },
  { href: '/hesaplama-araclari', key: 'tools' },
  { href: '/iletisim', key: 'contact' },
] as const;

export function SiteHeader() {
  const t = useTranslations('nav');
  const tSite = useTranslations('site');
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
        scrolled
          ? 'border-b border-rule bg-canvas/85 backdrop-blur-frost backdrop-saturate-150'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex max-w-wide items-center justify-between gap-6 px-gutter py-4">
        <Link
          href="/"
          className="flex items-center gap-4 text-ink"
          aria-label={tSite('monogramLabel')}
        >
          <Monogram className="w-[3.25rem]" />
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="font-display text-lg text-ink">{tSite('attorneyShort')}</span>
            <span className="label text-ink-faint">{tSite('role')}</span>
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <nav aria-label={t('primary')} className="hidden lg:block">
            <ul className="flex items-center gap-8">
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
                          ? 'border-b border-gold-500 text-ink'
                          : 'border-b border-transparent text-ink-muted hover:text-ink',
                      )}
                    >
                      {t(item.key)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="hidden sm:block">
            <Suspense fallback={<LocaleSwitcherFallback />}>
              <LocaleSwitcher />
            </Suspense>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="flex items-center gap-3 lg:hidden"
          >
            <span className="label text-ink-muted">
              {menuOpen ? t('closeMenu') : t('openMenu')}
            </span>
            <span aria-hidden="true" className="flex w-6 flex-col gap-[5px]">
              <span className="h-px w-full bg-ink" />
              <span className={cn('h-px w-full bg-ink', menuOpen && 'opacity-0')} />
              <span className="h-px w-full bg-ink" />
            </span>
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        hidden={!menuOpen}
        className="border-t border-rule bg-canvas lg:hidden"
      >
        <nav aria-label={t('primary')} className="mx-auto max-w-wide px-gutter py-6">
          <ul className="flex flex-col">
            {navItems.map((item) => (
              <li key={item.href} className="border-b border-rule-soft last:border-b-0">
                <Link
                  href={item.href}
                  className="block py-4 font-display text-2xl text-ink"
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 sm:hidden">
            <Suspense fallback={<LocaleSwitcherFallback />}>
              <LocaleSwitcher />
            </Suspense>
          </div>
        </nav>
      </div>
    </header>
  );
}

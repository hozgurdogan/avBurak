import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Monogram } from '@/components/brand/monogram';
import { logout } from '@/actions/auth';
import type { CurrentUser } from '@/lib/auth/session';

const navItems = [
  { href: '/admin/panel', key: 'dashboard' },
  { href: '/admin/panel/mesajlar', key: 'messages' },
  { href: '/admin/panel/sifre', key: 'password' },
] as const;

/**
 * The admin chrome: a fixed navy sidebar (nav, current user, sign-out) and a
 * light content well. Deliberately not the public `SiteHeader`/`SiteFooter` -
 * this is a tool, not a marketing surface, and the two should not be
 * mistakable for each other.
 */
export async function AdminShell({ user, children }: { user: CurrentUser; children: ReactNode }) {
  const t = await getTranslations('admin.nav');

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside
        data-surface="navy"
        className="flex shrink-0 flex-col justify-between gap-10 bg-navy-900 px-gutter py-8 lg:w-64"
      >
        <div>
          <Link href="/admin/panel" className="inline-flex text-canvas">
            <Monogram className="w-10" />
          </Link>
          <nav aria-label={t('dashboard')} className="mt-10">
            <ul className="flex flex-col gap-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="label-lg block py-2 text-mist-muted transition-colors duration-base hover:text-canvas"
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="border-t border-rule-invert pt-6">
          <p className="text-sm text-canvas">{user.name}</p>
          <p className="text-xs text-mist-muted" dir="ltr">
            {user.email}
          </p>
          <div className="mt-4 flex flex-col items-start gap-2">
            <Link href="/" className="label-lg text-gold-300 hover:text-canvas">
              {t('viewSite')}
            </Link>
            <form action={logout}>
              <button type="submit" className="label-lg text-mist-muted hover:text-canvas">
                {t('logout')}
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main id="main" className="flex-1 bg-canvas px-gutter py-10">
        {children}
      </main>
    </div>
  );
}

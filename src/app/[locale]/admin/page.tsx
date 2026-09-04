import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound, redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { getCurrentUser } from '@/lib/auth/session';
import { Monogram } from '@/components/brand/monogram';
import { LoginForm } from '@/components/admin/login-form';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.login.meta' });
  return { title: t('title'), robots: { index: false, follow: false } };
}

/**
 * The admin login page. Public, unlike everything under `/admin/panel` - the
 * middleware only starts gating once the path includes `/panel`, and this is
 * where an already-authenticated visit is bounced forward instead.
 */
export default async function AdminLoginPage({ params }: PageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (user) {
    redirect('/admin/panel');
  }

  const t = await getTranslations('admin.login');

  return (
    <section
      id="main"
      data-surface="navy"
      className="flex min-h-dvh items-center justify-center bg-navy-900 px-gutter py-section"
    >
      <div className="w-full max-w-sm">
        <Monogram className="w-14 text-canvas" />
        <p className="label mt-8 text-gold-500">{t('eyebrow')}</p>
        <h1 className="mt-3 font-display text-3xl font-normal text-canvas">{t('title')}</h1>

        <div className="mt-10">
          <LoginForm />
        </div>
      </div>
    </section>
  );
}

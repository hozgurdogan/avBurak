import { getTranslations } from 'next-intl/server';
import { ChangePasswordForm } from '@/components/admin/change-password-form';

export default async function AdminChangePasswordPage() {
  const t = await getTranslations('admin.password');

  return (
    <div className="max-w-content">
      <h1 className="font-display text-3xl font-normal text-ink">{t('title')}</h1>
      <div className="mt-10">
        <ChangePasswordForm />
      </div>
    </div>
  );
}

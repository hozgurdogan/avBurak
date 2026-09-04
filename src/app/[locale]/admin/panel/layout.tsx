import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { AdminShell } from '@/components/admin/admin-shell';

// Never indexed - middleware already blocks anonymous access, this is a
// second, independent reason for a crawler to stay out.
export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * The authoritative auth gate. `middleware.ts` already redirected here any
 * request whose session cookie fails signature/expiry verification - this
 * layout additionally confirms the session row still exists in the database,
 * which is what makes sign-out (or an admin deleted elsewhere) take effect
 * immediately rather than "once the JWT expires".
 */
export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/admin');
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}

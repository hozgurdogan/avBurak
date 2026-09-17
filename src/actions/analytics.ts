'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/session';

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/admin');
  }
  return user;
}

/**
 * Deletes every `Visitor` row and, via the cascade on `PageView.visitorId`,
 * every page view with it - an irreversible wipe of all first-party
 * visit-analytics data. Gated on the calling form by
 * `ConfirmSubmitButton`'s `confirm()` dialog, but re-checked here too: a
 * Server Action is a public HTTP endpoint regardless of which page's form
 * calls it, so the admin-only page around it is not a substitute for this.
 */
export async function resetAnalytics(): Promise<void> {
  await requireAdmin();
  await prisma.visitor.deleteMany({});
  revalidatePath('/[locale]/admin/panel/analiz', 'page');
}

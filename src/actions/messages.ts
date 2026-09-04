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

/** All mutations below re-check the session themselves - a Server Action is a
 * public HTTP endpoint regardless of which page's form calls it, so the
 * protected layout guarding the page is not a substitute for this. */

export async function markMessageRead(id: string): Promise<void> {
  await requireAdmin();
  await prisma.contactMessage.update({
    where: { id },
    data: { status: 'READ', readAt: new Date() },
  });
  revalidatePath('/[locale]/admin/panel/mesajlar', 'page');
  revalidatePath('/[locale]/admin/panel/mesajlar/[id]', 'page');
}

export async function archiveMessage(id: string): Promise<void> {
  await requireAdmin();
  await prisma.contactMessage.update({ where: { id }, data: { status: 'ARCHIVED' } });
  revalidatePath('/[locale]/admin/panel/mesajlar', 'page');
  revalidatePath('/[locale]/admin/panel/mesajlar/[id]', 'page');
}

export async function deleteMessage(id: string): Promise<void> {
  await requireAdmin();
  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath('/[locale]/admin/panel/mesajlar', 'page');
  redirect('/admin/panel/mesajlar');
}

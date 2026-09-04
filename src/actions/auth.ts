'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { loginSchema, changePasswordSchema } from '@/lib/validation/auth';
import { verifyPassword, hashPassword, DUMMY_PASSWORD_HASH } from '@/lib/auth/password';
import { createSession, destroySession, getCurrentUser } from '@/lib/auth/session';
import { getClientIp, hashIp } from '@/lib/ip';
import { checkRateLimit } from '@/lib/rate-limit';

// A "use server" file may only export async functions - not a constant. The
// initial-state objects that used to live here have moved to the client
// components that need them; the types stay (types are erased, so they are
// exempt from that constraint).
export type LoginState = {
  status: 'idle' | 'error';
  errorCode?: 'validation' | 'rate-limit' | 'invalid-credentials';
};

/**
 * Order matters here, same as the contact form: rate limit before touching
 * the password hash, one generic error for both "no such account" and "wrong
 * password" so a login attempt can never be used to enumerate admin emails,
 * and a dummy-hash comparison on the not-found path so the two cases take
 * about the same time.
 */
export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { status: 'error', errorCode: 'validation' };
  }

  const ip = await getClientIp();
  const ipHash = hashIp(ip);

  const allowed = await checkRateLimit('login', ipHash, { max: 8, windowMs: 10 * 60 * 1000 });
  if (!allowed) {
    return { status: 'error', errorCode: 'rate-limit' };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  const passwordOk = await verifyPassword(parsed.data.password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);

  if (!user || !passwordOk) {
    return { status: 'error', errorCode: 'invalid-credentials' };
  }

  const userAgent = (await headers()).get('user-agent') ?? undefined;
  await createSession(user.id, { userAgent, ipHash });

  redirect('/admin/panel');
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect('/admin');
}

export type ChangePasswordState = {
  status: 'idle' | 'success' | 'error';
  errorCode?: 'validation' | 'current-password' | 'generic';
};

export async function changePassword(
  _prevState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const user = await getCurrentUser();
  if (!user) {
    // The protected layout should already have redirected before this can be
    // reached, but a Server Action is a public endpoint regardless of what
    // rendered the form that calls it.
    redirect('/admin');
  }

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!parsed.success) {
    return { status: 'error', errorCode: 'validation' };
  }

  const record = await prisma.user.findUnique({ where: { id: user.id } });
  if (!record) {
    return { status: 'error', errorCode: 'generic' };
  }

  const currentOk = await verifyPassword(parsed.data.currentPassword, record.passwordHash);
  if (!currentOk) {
    return { status: 'error', errorCode: 'current-password' };
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { status: 'success' };
}

import 'server-only';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { SESSION_COOKIE_NAME, signSessionToken, verifySessionToken } from './token';

const maxAgeSeconds = Number(process.env.SESSION_MAX_AGE ?? 28800);

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

/**
 * Creates a `Session` row and signs a cookie carrying only its id. Called
 * from the login Server Action only - Server Actions are the one place
 * `cookies().set()` is allowed to run.
 */
export async function createSession(
  userId: string,
  meta: { userAgent?: string; ipHash?: string },
): Promise<void> {
  const expiresAt = new Date(Date.now() + maxAgeSeconds * 1000);
  const session = await prisma.session.create({
    data: { userId, expiresAt, userAgent: meta.userAgent, ipHash: meta.ipHash },
  });

  const token = await signSessionToken(session.id, maxAgeSeconds);
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds,
  });
}

/**
 * The authoritative check: unlike `verifySessionToken` (signature and expiry
 * only), this also confirms the `Session` row has not been deleted - which is
 * what makes sign-out immediate everywhere rather than "until the JWT
 * expires". Safe to call from any Server Component, layout or Server Action.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  const session = await prisma.session.findUnique({
    where: { id: payload.sid },
    select: {
      expiresAt: true,
      user: { select: { id: true, email: true, name: true, role: true } },
    },
  });

  if (!session || session.expiresAt.getTime() < Date.now()) return null;

  // Sliding "last seen" marker, best-effort - a failure here should never
  // block the request that triggered it.
  void prisma.session
    .update({ where: { id: payload.sid }, data: { lastSeenAt: new Date() } })
    .catch(() => undefined);

  return session.user;
}

/** Deletes the session row (revoking it immediately) and clears the cookie. */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    const payload = await verifySessionToken(token);
    if (payload) {
      await prisma.session.delete({ where: { id: payload.sid } }).catch(() => undefined);
    }
  }

  store.delete(SESSION_COOKIE_NAME);
}

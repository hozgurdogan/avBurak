// Deliberately NOT `server-only`: this module is imported by `middleware.ts`,
// which Next.js compiles for the Edge runtime by default - no Node APIs, no
// Prisma. `jose` is pure Web Crypto, so it is the one piece of the session
// system that can run there. The database-backed half (create/read/destroy a
// session row) lives in `./session.ts` instead, imported only by Server
// Components and Server Actions, which do run under Node.

import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE_NAME = 'buo_session';

const secretValue = process.env.AUTH_SECRET;
const secret = secretValue ? new TextEncoder().encode(secretValue) : null;

export type SessionTokenPayload = { sid: string };

/** Signs a token carrying only the session row's id - never the user or role. */
export async function signSessionToken(sessionId: string, maxAgeSeconds: number): Promise<string> {
  if (!secret) {
    throw new Error('AUTH_SECRET is not set - cannot sign a session token.');
  }
  return new SignJWT({ sid: sessionId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .sign(secret);
}

/**
 * Verifies signature and expiry only - it never touches the database, so it
 * cannot know whether the session row behind `sid` still exists. That check
 * happens in `getCurrentUser()` (`./session.ts`), which is what makes sign-out
 * genuinely revocable. This function is the fast, Edge-safe first gate in
 * `middleware.ts`; a token that passes here can still be rejected there.
 */
export async function verifySessionToken(token: string): Promise<SessionTokenPayload | null> {
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return typeof payload.sid === 'string' ? { sid: payload.sid } : null;
  } catch {
    return null;
  }
}

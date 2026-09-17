import 'server-only';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { COOKIES_REQUIRE_HTTPS } from '@/lib/cookies';

/**
 * First-party, cookie-based visit tracking - no third-party script, no
 * request ever leaves this server. Two cookies, both plain preference/id
 * values rather than signed tokens (nothing sensitive rides on them):
 *
 * - `cookie_consent`: "accepted" | "declined", set once the visitor answers
 *   the banner (`CookieConsentBanner`). Absent means "not asked yet".
 * - `visitor_id`: a random id, created only after consent is "accepted".
 *   No IP, user agent or other fingerprint is stored against it - see the
 *   `Visitor` model's own comment in schema.prisma.
 *
 * `recordPageView` is the only export public pages call (via `/api/track`),
 * and it silently does nothing without consent - callers never need to
 * check first.
 */

export const CONSENT_COOKIE = 'cookie_consent';
export const VISITOR_COOKIE = 'visitor_id';

const CONSENT_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
// ~13 months: long enough for year-over-year comparison, short enough that
// nobody is tracked indefinitely - the common convention for this kind of
// first-party analytics cookie.
const VISITOR_MAX_AGE = 60 * 60 * 24 * 396;

export async function getConsentChoice(): Promise<'accepted' | 'declined' | null> {
  const store = await cookies();
  const value = store.get(CONSENT_COOKIE)?.value;
  return value === 'accepted' || value === 'declined' ? value : null;
}

/** Only callable from a Server Action or a Route Handler - both are allowed
 *  to call `cookies().set()`. */
export async function setConsent(accepted: boolean): Promise<void> {
  const store = await cookies();
  store.set(CONSENT_COOKIE, accepted ? 'accepted' : 'declined', {
    httpOnly: true,
    secure: COOKIES_REQUIRE_HTTPS,
    sameSite: 'lax',
    path: '/',
    maxAge: CONSENT_MAX_AGE,
  });
  if (!accepted) {
    store.delete(VISITOR_COOKIE);
  }
}

/**
 * Records one page view. No-ops (does not touch the database) unless the
 * visitor has already accepted the cookie banner. Creates the `Visitor` row
 * and cookie on that visitor's first tracked view; every view after that
 * reuses the same id and bumps `lastSeenAt`.
 */
export async function recordPageView(path: string, locale: string): Promise<void> {
  const store = await cookies();
  if (store.get(CONSENT_COOKIE)?.value !== 'accepted') return;

  const cookieVisitorId = store.get(VISITOR_COOKIE)?.value;
  const existing = cookieVisitorId
    ? await prisma.visitor.findUnique({ where: { id: cookieVisitorId }, select: { id: true } })
    : null;

  let visitorId: string;
  if (existing) {
    visitorId = existing.id;
    // Empty update - only here to bump `lastSeenAt` (`@updatedAt`).
    await prisma.visitor.update({ where: { id: visitorId }, data: {} });
  } else {
    const visitor = await prisma.visitor.create({ data: {} });
    visitorId = visitor.id;
    store.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      secure: COOKIES_REQUIRE_HTTPS,
      sameSite: 'lax',
      path: '/',
      maxAge: VISITOR_MAX_AGE,
    });
  }

  await prisma.pageView.create({ data: { visitorId, path, locale } });
}

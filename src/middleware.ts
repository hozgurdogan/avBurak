import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';
import { locales } from '@/i18n/locales';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/token';

const intlMiddleware = createMiddleware(routing);

// /{locale}/admin/panel/... - everything under the admin shell except the
// login page itself, which lives at /{locale}/admin.
const protectedAdminPattern = new RegExp(`^/(${locales.join('|')})/admin/panel(?:/|$)`);

// Paths middleware should never touch: Next internals, route handlers,
// admin-uploaded files, and anything else with a file extension (favicon.ico,
// robots.txt, og images, ...).
//
// This is deliberately a plain-JS check run *inside* the middleware function
// rather than expressed as a negative-lookahead in `config.matcher` below.
// A lookahead-based matcher (`'/((?!api|_next|...).*)'` - the pattern
// next-intl's own docs show, and what this file used at first) compiles to a
// regex that is valid on its own, but this Next.js version's middleware
// matcher compiler failed to honour it silently: `config.matcher` fell back
// to matching nothing beyond `/`, so every non-root route - `/profil`,
// `/admin/panel`, a bare `/makaleler` - skipped middleware entirely and fell
// through to Next's file-based 404 instead of getting the locale prefix
// next-intl is supposed to add. A broad `/:path*` matcher plus this manual
// check is less elegant but was verified to actually run on every request.
function isExcludedPath(pathname: string): boolean {
  return (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/uploads') ||
    /\.[^/]+$/.test(pathname)
  );
}

/**
 * Runs the locale middleware first, then layers a fast, Edge-safe auth gate
 * on top for admin routes: it checks the session cookie's signature and
 * expiry only (via `jose`, which needs no Node APIs), not whether the
 * session row still exists in the database - that authoritative check
 * happens in `admin/panel/layout.tsx`, which does run under Node and can
 * reach Prisma. A token that passes here can still be rejected there (e.g.
 * after sign-out from another device). This two-layer split is what lets the
 * gate run at the edge without pulling Prisma's native query engine into the
 * Edge runtime bundle.
 */
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isExcludedPath(pathname)) {
    return NextResponse.next();
  }

  const intlResponse = intlMiddleware(request);

  if (protectedAdminPattern.test(pathname)) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const payload = token ? await verifySessionToken(token) : null;

    if (!payload) {
      const locale = pathname.split('/')[1] ?? routing.defaultLocale;
      return NextResponse.redirect(new URL(`/${locale}/admin`, request.url));
    }
  }

  return intlResponse;
}

// Intentionally broad - see `isExcludedPath` above for why the exclusions
// live in code rather than here.
export const config = {
  matcher: ['/:path*'],
};

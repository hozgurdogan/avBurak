import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

/**
 * Resolves the locale for every incoming request: NEXT_LOCALE cookie first,
 * then Accept-Language, then the default. A bare `/` is redirected to the
 * resolved locale, so `/` never renders content of its own.
 */
export default createMiddleware(routing);

export const config = {
  matcher: [
    /*
     * Everything except:
     *  - /api      (route handlers, e.g. the container health check)
     *  - /_next    (build output)
     *  - /uploads  (admin-uploaded cover images)
     *  - files with an extension (favicon.ico, robots.txt, og images, ...)
     */
    '/((?!api|_next|uploads|.*\..*).*)',
  ],
};

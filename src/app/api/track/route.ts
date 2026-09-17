import { NextResponse, type NextRequest } from 'next/server';
import { recordPageView } from '@/lib/analytics';
import { isLocale } from '@/i18n/locales';

/**
 * First-party page-view beacon (`PageViewBeacon`). No response body needed -
 * the client never reads the result - so every path returns 204. A
 * malformed or spoofed body just means nothing gets recorded; it can never
 * throw back to the visitor's page.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json().catch(() => null);
  const path = typeof body?.path === 'string' ? body.path.slice(0, 300) : null;
  const locale = typeof body?.locale === 'string' && isLocale(body.locale) ? body.locale : null;

  if (path && locale) {
    await recordPageView(path, locale).catch(() => undefined);
  }

  return new NextResponse(null, { status: 204 });
}

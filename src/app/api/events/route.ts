import { NextResponse, type NextRequest } from 'next/server';
import { recordConversion } from '@/lib/conversions';
import { isLocale } from '@/i18n/locales';

export async function POST(request: NextRequest) {
  if (request.headers.get('sec-fetch-site') === 'cross-site') return new NextResponse(null, { status: 403 });
  const body = await request.json().catch(() => null);
  if ((body?.name === 'phone_click' || body?.name === 'whatsapp_click') &&
      isLocale(body.locale) && typeof body.path === 'string' && body.path.startsWith('/')) {
    await recordConversion(body.name, body.locale, body.path).catch(() => undefined);
  }
  return new NextResponse(null, { status: 204 });
}

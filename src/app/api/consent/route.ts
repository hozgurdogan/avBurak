import { NextResponse, type NextRequest } from 'next/server';
import { getAnalyticsConsent, setConsent } from '@/lib/analytics';

export async function GET() {
  return NextResponse.json(await getAnalyticsConsent(), { headers: { 'Cache-Control': 'no-store' } });
}

/** Records the visitor's answer to the cookie banner (`CookieConsentBanner`).
 *  Declining still returns 200 - refusing consent is not an error. */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json().catch(() => null);
  const accepted = body?.accepted === true;
  await setConsent(accepted, body?.ga4Accepted === true);
  return NextResponse.json({ ok: true });
}

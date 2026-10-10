import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getTranslations } from 'next-intl/server';

/**
 * The shared social-preview card for every page (link previews, Google
 * Business-style result cards, WhatsApp/X/Facebook unfurls). Before this,
 * `pageMetadata()` set `openGraph.title`/`description` but no `images`, so
 * any consumer that renders a preview card had nothing to show but a blank
 * or generic placeholder - which is what the client flagged from a live
 * Google result card (10 Ekim 2026): "site resmi o" ("that [globe] is the
 * site's own image") - i.e. the absence of a real one is itself the bug.
 *
 * One shared image per locale rather than per page: a bespoke card per
 * route is a much larger effort for a mostly-text law-firm site where the
 * firm name and field of work matter more than an illustration.
 *
 * One font file for every locale, Latin and Arabic alike - see `icon.tsx`
 * for the full reasoning (WOFF2 unsupported by this build's font parser,
 * and the self-hosted Inter is a variable font that parser also rejects;
 * IBM Plex Sans Arabic is static and carries full Latin coverage).
 */
export const alt = 'Av. Burak Uğur Öztürk';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'site' });
  const tHero = await getTranslations({ locale, namespace: 'home.hero' });

  const isRtl = locale === 'ar';

  const fontData = await readFile(
    join(process.cwd(), 'src/assets/fonts/og/ibm-plex-sans-arabic-600.ttf'),
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: isRtl ? 'flex-end' : 'flex-start',
          padding: '0 96px',
          background: '#0a1128',
          direction: isRtl ? 'rtl' : 'ltr',
          textAlign: isRtl ? 'right' : 'left',
        }}
      >
        <div style={{ display: 'flex', fontSize: 40, fontWeight: 600, color: '#c5a059', letterSpacing: 4 }}>
          BUÖ
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 28,
            fontSize: 64,
            fontWeight: 600,
            color: '#f4f1ea',
            lineHeight: 1.15,
          }}
        >
          {t('attorneyShort')}
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 24,
            fontSize: 30,
            fontWeight: 400,
            color: '#c9d0dc',
            maxWidth: 920,
            lineHeight: 1.4,
          }}
        >
          {tHero('focus')}
        </div>
        <div style={{ display: 'flex', marginTop: 44, width: 160, height: 5, background: '#c5a059' }} />
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'IBM Plex Sans Arabic', data: fontData, style: 'normal', weight: 600 }],
    },
  );
}

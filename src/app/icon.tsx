import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * A rasterised (PNG) favicon alongside `icon.svg`. Google Search's favicon
 * crawler has a documented history of being slow or unreliable with
 * SVG-only favicons (the SEO review, 10 Ekim 2026, found Google still
 * showing its generic globe placeholder for this site in search results).
 * Shipping both gives every consumer - browsers, Google, anything else -
 * a format it is guaranteed to handle.
 *
 * `src/assets/fonts/og/ibm-plex-sans-arabic-600.ttf` is a one-off,
 * build-time-only decompression of the site's own self-hosted WOFF2 file
 * (via `wawoff2`, not committed as a dependency - see the commit that
 * added this file). Two things ruled out the obvious alternative, Inter:
 * this build's bundled `satori`/`resvg` can only parse TTF/OTF and errors
 * on WOFF2 directly (`Unsupported OpenType signature wOF2`); and the
 * self-hosted Inter file is a *variable* font, whose `fvar` table this
 * same font parser fails on even once decompressed to TTF. IBM Plex Sans
 * Arabic ships as static weights and happens to carry full Latin coverage
 * (it is designed as a Latin+Arabic pairing), so one file covers "BUÖ"
 * here with no further conversion. This route is statically generated once
 * at build time, so there is no runtime cost to reading a font file here.
 */
export const size = { width: 192, height: 192 };
export const contentType = 'image/png';

export default async function Icon() {
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
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a1128',
          borderRadius: 28,
        }}
      >
        <div
          style={{
            color: '#f4f1ea',
            fontSize: 84,
            fontWeight: 600,
            letterSpacing: 2,
          }}
        >
          BUÖ
        </div>
        <div style={{ marginTop: 16, width: 96, height: 4, background: '#c5a059' }} />
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'IBM Plex Sans Arabic', data: fontData, style: 'normal', weight: 600 }],
    },
  );
}

import localFont from 'next/font/local';

/**
 * Typography loading strategy
 * ---------------------------
 * Every face is self-hosted from `src/assets/fonts` and emitted by
 * `next/font/local`, so the browser never contacts a font CDN at runtime (a
 * Google Fonts request would leak visitor IPs to a third party - see the README
 * section "Regulatory constraints").
 *
 * Each family is loaded once *per unicode subset* rather than once per family.
 * That is deliberate. `next/font/local` builds a single `@font-face` per call
 * and cannot express a different `unicode-range` for each `src` entry, so one
 * call covering "latin + latin-ext" would let the first face claim the whole
 * range and Turkish glyphs (g-breve, s-cedilla, dotted-I) would silently fall
 * back to a system serif. Splitting the calls and composing the families into a
 * CSS font stack restores correct per-character fallback:
 *
 *     --font-display: var(--font-display-latin), var(--font-display-latin-ext), ...
 *
 * The `unicode-range` values are the ones Google Fonts ships for these subsets,
 * so the split matches the byte boundaries of the downloaded files exactly.
 * They are written out in full at every call site because the font loader
 * rejects identifiers: "Font loader values must be explicitly written literals."
 */

/* -------------------------------------------------------------------------- */
/* Latin display - Cormorant Garamond, variable axis clamped to 300-500.       */
/* The brief forbids bold display weights, so the axis is capped here and no    */
/* stylesheet can reach for 700.                                               */
/* -------------------------------------------------------------------------- */

export const displayLatin = localFont({
  src: '../assets/fonts/cormorant-garamond-latin.woff2',
  weight: '300 500',
  style: 'normal',
  display: 'swap',
  variable: '--font-display-latin',
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    },
  ],
  adjustFontFallback: 'Times New Roman',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
  // Headlines are the LCP element on nearly every route.
  preload: true,
});

/** Carries the Turkish letters that the `latin` subset does not. */
export const displayLatinExt = localFont({
  src: '../assets/fonts/cormorant-garamond-latin-ext.woff2',
  weight: '300 500',
  style: 'normal',
  display: 'swap',
  variable: '--font-display-latin-ext',
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
    },
  ],
  adjustFontFallback: 'Times New Roman',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
  // Turkish is the default locale, so extended Latin is on the critical path.
  preload: true,
});

/* -------------------------------------------------------------------------- */
/* Latin body - Inter, variable axis 400-600.                                  */
/* -------------------------------------------------------------------------- */

export const bodyLatin = localFont({
  src: '../assets/fonts/inter-latin.woff2',
  weight: '400 600',
  style: 'normal',
  display: 'swap',
  variable: '--font-body-latin',
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    },
  ],
  adjustFontFallback: 'Arial',
  fallback: ['system-ui', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
  preload: true,
});

export const bodyLatinExt = localFont({
  src: '../assets/fonts/inter-latin-ext.woff2',
  weight: '400 600',
  style: 'normal',
  display: 'swap',
  variable: '--font-body-latin-ext',
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
    },
  ],
  adjustFontFallback: 'Arial',
  fallback: ['system-ui', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
  // 85 kB, and only needed for body copy rather than headings, so it is fetched
  // on demand instead of competing with the display faces for the LCP budget.
  // The size-adjusted Arial fallback keeps the swap from shifting layout.
  preload: false,
});

/* -------------------------------------------------------------------------- */
/* Arabic - the Latin serifs carry no Arabic glyphs at all, so the AR locale    */
/* swaps the entire stack. Latin characters inside Arabic copy (proper nouns,   */
/* "KVKK", digits) fall through to the Latin faces above via the font stack.    */
/* -------------------------------------------------------------------------- */

export const displayArabic = localFont({
  src: '../assets/fonts/noto-naskh-arabic.woff2',
  weight: '400 700',
  style: 'normal',
  display: 'swap',
  variable: '--font-display-ar',
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0600-06FF, U+0750-077F, U+0870-088E, U+0890-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC, U+102E0-102FB, U+10E60-10E7E, U+10EC2-10EC4, U+10EFC-10EFF, U+1EE00-1EE03, U+1EE05-1EE1F, U+1EE21-1EE22, U+1EE24, U+1EE27, U+1EE29-1EE32, U+1EE34-1EE37, U+1EE39, U+1EE3B, U+1EE42, U+1EE47, U+1EE49, U+1EE4B, U+1EE4D-1EE4F, U+1EE51-1EE52, U+1EE54, U+1EE57, U+1EE59, U+1EE5B, U+1EE5D, U+1EE5F, U+1EE61-1EE62, U+1EE64, U+1EE67-1EE6A, U+1EE6C-1EE72, U+1EE74-1EE77, U+1EE79-1EE7C, U+1EE7E, U+1EE80-1EE89, U+1EE8B-1EE9B, U+1EEA1-1EEA3, U+1EEA5-1EEA9, U+1EEAB-1EEBB, U+1EEF0-1EEF1',
    },
  ],
  adjustFontFallback: false,
  fallback: ['Noto Naskh Arabic', 'Traditional Arabic', 'serif'],
  preload: false,
});

export const bodyArabic = localFont({
  src: [
    { path: '../assets/fonts/ibm-plex-sans-arabic-300.woff2', weight: '300', style: 'normal' },
    { path: '../assets/fonts/ibm-plex-sans-arabic-400.woff2', weight: '400', style: 'normal' },
    { path: '../assets/fonts/ibm-plex-sans-arabic-500.woff2', weight: '500', style: 'normal' },
    { path: '../assets/fonts/ibm-plex-sans-arabic-600.woff2', weight: '600', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-body-ar',
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0600-06FF, U+0750-077F, U+0870-088E, U+0890-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC, U+102E0-102FB, U+10E60-10E7E, U+10EC2-10EC4, U+10EFC-10EFF, U+1EE00-1EE03, U+1EE05-1EE1F, U+1EE21-1EE22, U+1EE24, U+1EE27, U+1EE29-1EE32, U+1EE34-1EE37, U+1EE39, U+1EE3B, U+1EE42, U+1EE47, U+1EE49, U+1EE4B, U+1EE4D-1EE4F, U+1EE51-1EE52, U+1EE54, U+1EE57, U+1EE59, U+1EE5B, U+1EE5D, U+1EE5F, U+1EE61-1EE62, U+1EE64, U+1EE67-1EE6A, U+1EE6C-1EE72, U+1EE74-1EE77, U+1EE79-1EE7C, U+1EE7E, U+1EE80-1EE89, U+1EE8B-1EE9B, U+1EEA1-1EEA3, U+1EEA5-1EEA9, U+1EEAB-1EEBB, U+1EEF0-1EEF1',
    },
  ],
  adjustFontFallback: false,
  fallback: ['IBM Plex Sans Arabic', 'Segoe UI', 'Tahoma', 'sans-serif'],
  preload: false,
});

/**
 * Every font variable, ready to drop on `<html>`. The Arabic faces are always
 * declared but only referenced by the font stack when `lang="ar"`, so a Turkish
 * or English visitor never downloads them.
 */
export const fontVariables = [
  displayLatin.variable,
  displayLatinExt.variable,
  bodyLatin.variable,
  bodyLatinExt.variable,
  displayArabic.variable,
  bodyArabic.variable,
].join(' ');

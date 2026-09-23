/**
 * The three regional pages recommended by the SEO audit (rapor/,
 * 2026-09-18, section 08): a handful of genuinely distinct pages rather
 * than one templated page per district. Esenyurt is the office's real
 * location; Büyükçekmece and Beylikdüzü are served without a second office
 * there, which each page says plainly - see the audit's "Yerel sayfa kalite
 * eşiği" note about never disguising a template as a local page.
 *
 * Names and body copy are translated content (see `serviceRegions.<slug>` in
 * `messages/*.json`), same split as `practice-areas.ts`.
 */
export const serviceRegionSlugs = ['esenyurt', 'buyukcekmece', 'beylikduzu'] as const;

export type ServiceRegionSlug = (typeof serviceRegionSlugs)[number];

export function serviceRegionNumber(index: number): string {
  return String(index + 1).padStart(2, '0');
}

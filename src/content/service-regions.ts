/**
 * The regional pages recommended by the SEO audit (rapor/, 2026-09-18,
 * section 08): genuinely distinct pages rather than one templated page per
 * district. Esenyurt is the office's real location; every other region is
 * served without a second office there, which each page says plainly - see
 * the audit's "Yerel sayfa kalite eşiği" note about never disguising a
 * template as a local page.
 *
 * `avcilar`, `kucukcekmece`, `silivri`, `catalca` and `mimaroba` were added
 * 2026-10-10 at the client's request, matching the service-area district
 * list already named on the contact page and in the footer
 * (`serviceAreaDistricts` / `footer.serviceAreasNote`). `mimaroba` is a
 * neighbourhood of Büyükçekmece, not a separate ilçe, so its content
 * explicitly says so rather than implying a sixth district; `catalca`
 * reuses the already-established fact (see the Büyükçekmece page's own
 * body copy) that Büyükçekmece Adliyesi is generally the competent court
 * there. No specific courthouse is named for avcilar/kucukcekmece/silivri -
 * unlike catalca/mimaroba, unconfirmed court-jurisdiction claims are a real
 * accuracy risk, so those three pages use the same generically-true
 * "depends on the case" phrasing instead of guessing.
 *
 * Names and body copy are translated content (see `serviceRegions.<slug>` in
 * `messages/*.json`), same split as `practice-areas.ts`.
 */
export const serviceRegionSlugs = [
  'esenyurt',
  'buyukcekmece',
  'beylikduzu',
  'avcilar',
  'kucukcekmece',
  'silivri',
  'catalca',
  'mimaroba',
] as const;

export type ServiceRegionSlug = (typeof serviceRegionSlugs)[number];

export function serviceRegionNumber(index: number): string {
  return String(index + 1).padStart(2, '0');
}

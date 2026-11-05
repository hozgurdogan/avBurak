/**
 * The regional pages recommended by the SEO audit (rapor/, 2026-09-18,
 * section 08): genuinely distinct pages rather than one templated page per
 * district. The 6 November revision uses topic-specific document preparation,
 * FAQs and real published article links, without office/branch or travel copy.
 *
 * `avcilar`, `kucukcekmece`, `silivri`, `catalca` and `mimaroba` were added
 * 2026-10-10 at the client's request, matching the service-area district
 * list already named on the contact page and in the footer
 * (`serviceAreaDistricts` / `footer.serviceAreasNote`). `mimaroba` is a
 * neighbourhood of Büyükçekmece, not a separate ilçe, so its content
 * explains this in its judicial-area section. Confirmed judicial areas and
 * related article groups are maintained in `region-guides.ts`; no courthouse
 * is inferred for the other regions from geography alone.
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

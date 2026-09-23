import type { PracticeAreaSlug } from './practice-areas';

/**
 * Which calculators belong to which practice area - the internal linking
 * the SEO audit asks for (rapor/, 2026-09-18, section 10: "Araçlar ile
 * hizmet/makale sayfaları arasında iç link"). Deliberately a manual map
 * rather than a guess from naming: `infaz-hesaplama` (parole/sentence
 * calculation) is criminal-execution law, not `icra-hukuku` (debt
 * enforcement) despite the similar Turkish names, and this site has no
 * criminal-law practice area to link it to yet - so it is left unmapped
 * here rather than attached to the wrong page.
 */
export const practiceAreaToolSlugs: Partial<Record<PracticeAreaSlug, readonly string[]>> = {
  'is-hukuku': ['kidem-tazminati', 'yillik-izin', 'fazla-mesai', 'issizlik-maasi', 'is-kazasi-tazminat'],
  'bosanma-aile-hukuku': ['nafaka-artirim'],
  'kira-hukuku': ['kira-artis-orani'],
  'miras-hukuku': ['miras-payi'],
};

/** Reverse lookup for a tool's detail page: which practice area(s) it
 *  belongs to, derived from the map above rather than duplicated. */
export function practiceAreasForTool(toolSlug: string): PracticeAreaSlug[] {
  return (Object.keys(practiceAreaToolSlugs) as PracticeAreaSlug[]).filter((areaSlug) =>
    practiceAreaToolSlugs[areaSlug]?.includes(toolSlug),
  );
}

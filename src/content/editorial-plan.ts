import plan from './seo-rev3.json';

export const editorialPlan = plan;
export const plannedArticle = (slug: string | undefined) => plan.find((article) => article.slug === slug);

const contextualArticles: Record<string, number[]> = {
  'tahliye-taahhudu-ne-zaman-gecerlidir': [1, 9],
  'kiraci-erken-cikarsa-kalan-kira': [9],
  'odeme-emrine-itiraz-suresi-ve-sonuclari': [1],
  'isten-cikarildim-ne-yapmaliyim': [2],
  'kidem-tazminati-hangi-hallerde-alinir': [2],
  'anlasmali-bosanma-nasil-yapilir': [3],
  'mirasin-reddi-uc-aylik-sure-ve-sonuclari': [4],
  'ortakligin-giderilmesi-davasi': [4],
  'ayipli-mal-tuketici-haklari': [5],
  'yabanci-yatirimcilar-icin-turkiyede-sirket-kurulusu': [7],
};

/** Resolve through published translation groups before creating any links. */
export function editorialRelatedSlugs(trSlug: string | undefined): string[] {
  if (!trSlug) return [];
  const contextual = contextualArticles[trSlug];
  if (contextual) return contextual.map((id) => plan.find((article) => article.id === id)!.slug);
  return [...new Set([
    ...(plannedArticle(trSlug)?.related ?? []),
    ...plan.filter((article) => article.related.includes(trSlug)).map((article) => article.slug),
  ])];
}

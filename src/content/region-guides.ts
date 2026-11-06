import type { ServiceRegionSlug } from './service-regions';
import type { PracticeAreaSlug } from './practice-areas';
import { editorialPlan } from './editorial-plan';

/** Sources: the user's 6 November guide and the official report, page 3. */
export const jurisdictionSource = 'https://rayp.adalet.gov.tr/resimler/17/dosya/evrak2026-04-03-10-01-0603-04-202610-02-am.pdf#page=3';
export const buyukcekmeceJudicialRegions = new Set<ServiceRegionSlug>(['esenyurt', 'buyukcekmece', 'beylikduzu', 'mimaroba']);

export type RegionSection = { id: string; title: string; paragraphs: string[] };
export type RegionQuestion = { question: string; answer: string; articleRef?: string };

/** Real published TR slugs identify translation groups; URLs are always resolved from the DB. */
const existingRegionArticles: Record<ServiceRegionSlug, string[]> = {
  esenyurt: ['sigortasiz-calistim-hizmet-tespiti-davasi', 'kidem-tazminati-hangi-hallerde-alinir', 'is-kazasi-tazminat-davasi'],
  beylikduzu: ['kiraci-erken-cikarsa-kalan-kira', 'kidem-tazminati-hangi-hallerde-alinir', 'tuketici-hakem-heyeti-kararina-itiraz'],
  mimaroba: ['kiraci-erken-cikarsa-kalan-kira', 'kira-depozitosu-iadesi', 'miras-kalan-ev-ecrimisil-davasi', 'mirasin-reddi-uc-aylik-sure-ve-sonuclari'],
  buyukcekmece: ['tr-makaleler-kira-bedelinin-tespiti-davasi', 'mirastan-mal-kacirma-muris-muvazaasi', 'bosanmada-mal-paylasimi'],
  avcilar: ['tahliye-taahhudu-ne-zaman-gecerlidir', 'kiraci-erken-cikarsa-kalan-kira', 'odeme-emrine-itiraz-suresi-ve-sonuclari'],
  kucukcekmece: ['tuketici-hakem-heyeti-kararina-itiraz', 'ayipli-mal-tuketici-haklari', 'kira-depozitosu-iadesi'],
  silivri: ['ortakligin-giderilmesi-davasi', 'sufa-onalim-hakki-davasi', 'miras-kalan-ev-ecrimisil-davasi'],
  catalca: ['kamulastirmasiz-el-atma-fiili-hukuki-el-atma', 'ortakligin-giderilmesi-davasi', 'mirastan-mal-kacirma-muris-muvazaasi'],
};

// Preserve existing links as fallbacks until each new article is published.
export const regionArticles = Object.fromEntries(Object.entries(existingRegionArticles).map(([region, slugs]) => [region,
  [...new Set([...editorialPlan.filter((article) => article.regions.includes(region)).sort((a, b) => a.order - b.order).map((article) => article.slug), ...slugs])],
])) as Record<ServiceRegionSlug, string[]>;

export const regionPracticeAreas: Record<ServiceRegionSlug, PracticeAreaSlug[]> = {
  esenyurt: ['is-hukuku', 'icra-hukuku', 'bosanma-aile-hukuku', 'kira-hukuku', 'miras-hukuku', 'sirketler-hukuku'],
  beylikduzu: ['kira-hukuku', 'is-hukuku', 'icra-hukuku', 'bosanma-aile-hukuku', 'tuketici-hukuku'],
  mimaroba: ['kira-hukuku', 'miras-hukuku', 'bosanma-aile-hukuku', 'is-hukuku'],
  buyukcekmece: ['kira-hukuku', 'miras-hukuku', 'bosanma-aile-hukuku', 'is-hukuku'],
  avcilar: ['kentsel-donusum-hukuku', 'kira-hukuku', 'is-hukuku', 'icra-hukuku'],
  kucukcekmece: ['tuketici-hukuku', 'kira-hukuku', 'icra-hukuku'],
  silivri: ['miras-hukuku', 'kira-hukuku', 'is-hukuku'],
  catalca: ['miras-hukuku', 'kira-hukuku', 'tazminat-hukuku'],
};

export const relatedRegions: Partial<Record<ServiceRegionSlug, ServiceRegionSlug[]>> = {
  mimaroba: ['buyukcekmece'], buyukcekmece: ['mimaroba'],
};

export function regionsForArticle(trSlug: string | undefined) {
  if (!trSlug) return [];
  return (Object.keys(regionArticles) as ServiceRegionSlug[]).filter((region) => regionArticles[region].includes(trSlug));
}

export const additionalArticleCategories = [
  {
    slug: 'kentsel-donusum-hukuku',
    position: 12,
    names: {
      tr: 'Kentsel Dönüşüm Hukuku',
      en: 'Urban Transformation Law',
      ar: 'قانون التحول الحضري',
    },
  },
  {
    slug: 'tuketici-hukuku',
    position: 13,
    names: {
      tr: 'Tüketici Hukuku',
      en: 'Consumer Law',
      ar: 'قانون حماية المستهلك',
    },
  },
  {
    slug: 'ceza-hukuku',
    position: 14,
    names: {
      tr: 'Ceza Hukuku',
      en: 'Criminal Law',
      ar: 'القانون الجنائي',
    },
  },
] as const;

export const editorialCategoryAssignments = [
  { articleSlug: 'ikinci-el-arac-ayipli-cikti', categorySlug: 'tuketici-hukuku' },
  { articleSlug: 'ibana-para-gonderdim-dolandirildim', categorySlug: 'ceza-hukuku' },
  { articleSlug: 'kentsel-donusum-sozlesme-kira-yardimi', categorySlug: 'kentsel-donusum-hukuku' },
] as const;

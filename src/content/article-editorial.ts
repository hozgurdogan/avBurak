/** Presentation-only edits: never rewrite CMS content, URLs or update timestamps. */
const titles: Record<string, { title: string; metaTitle: string }> = {
  'sigortasiz-calistim-hizmet-tespiti-davasi': {
    title: 'Sigortasız Çalıştım, Ne Yapmalıyım?', metaTitle: 'Sigortasız Çalıştım: Hizmet Tespiti Davası',
  },
  'tuketici-hakem-heyeti-kararina-itiraz': {
    title: 'Tüketici Hakem Heyeti Kararına Nasıl İtiraz Edilir?', metaTitle: 'Tüketici Hakem Heyeti Kararına İtiraz',
  },
  'kiraci-erken-cikarsa-kalan-kira': {
    title: 'Kiracı Evi Erken Boşaltırsa Kalan Kiraları Öder mi?', metaTitle: 'Kiracı Erken Çıkarsa Kalan Kirayı Öder mi?',
  },
};

export function articleEditorial(locale: string, slug: string) {
  return locale === 'tr' ? titles[slug] : undefined;
}

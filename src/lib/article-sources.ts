/** Show only laws explicitly cited by number in the article, never inferred advice. */
const laws = [
  { number: '4857', name: '4857 sayılı İş Kanunu' },
  { number: '1475', name: '1475 sayılı İş Kanunu (m. 14)' },
  { number: '6098', name: '6098 sayılı Türk Borçlar Kanunu' },
  { number: '4721', name: '4721 sayılı Türk Medeni Kanunu' },
  { number: '2004', name: '2004 sayılı İcra ve İflas Kanunu' },
  { number: '6100', name: '6100 sayılı Hukuk Muhakemeleri Kanunu' },
  { number: '6102', name: '6102 sayılı Türk Ticaret Kanunu' },
  { number: '5275', name: '5275 sayılı Ceza ve Güvenlik Tedbirlerinin İnfazı Hakkında Kanun' },
];

export function articleSources(markdown: string) {
  return laws.filter((law) => new RegExp(`\\b${law.number}\\b`).test(markdown))
    .map((law) => ({ ...law, url: `https://www.mevzuat.gov.tr/mevzuatmetin/1.5.${law.number}.pdf` }));
}

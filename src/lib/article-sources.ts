/** Resolve law numbers cited in the article or its editorial source list. */
const laws = [
  { number: '4857', name: '4857 sayılı İş Kanunu' },
  { number: '1475', name: '1475 sayılı İş Kanunu (m. 14)' },
  { number: '6098', name: '6098 sayılı Türk Borçlar Kanunu' },
  { number: '4721', name: '4721 sayılı Türk Medeni Kanunu' },
  { number: '2004', name: '2004 sayılı İcra ve İflas Kanunu' },
  { number: '6100', name: '6100 sayılı Hukuk Muhakemeleri Kanunu' },
  { number: '6102', name: '6102 sayılı Türk Ticaret Kanunu' },
  { number: '5275', name: '5275 sayılı Ceza ve Güvenlik Tedbirlerinin İnfazı Hakkında Kanun' },
  { number: '5237', name: '5237 sayılı Türk Ceza Kanunu' },
  { number: '5271', name: '5271 sayılı Ceza Muhakemesi Kanunu' },
  { number: '6325', name: '6325 sayılı Hukuk Uyuşmazlıklarında Arabuluculuk Kanunu' },
  { number: '7036', name: '7036 sayılı İş Mahkemeleri Kanunu' },
  { number: '6502', name: '6502 sayılı Tüketicinin Korunması Hakkında Kanun' },
  { number: '6306', name: '6306 sayılı Afet Riski Altındaki Alanların Dönüştürülmesi Hakkında Kanun' },
  { number: '4787', name: '4787 sayılı Aile Mahkemelerinin Kuruluş, Görev ve Yargılama Usullerine Dair Kanun' },
  { number: '6284', name: '6284 sayılı Ailenin Korunması ve Kadına Karşı Şiddetin Önlenmesine Dair Kanun' },
  { number: '1136', name: '1136 sayılı Avukatlık Kanunu' },
  { number: '6183', name: '6183 sayılı Amme Alacaklarının Tahsil Usulü Hakkında Kanun' },
  { number: '7338', name: '7338 sayılı Veraset ve İntikal Vergisi Kanunu' },
];

export function articleSources(markdown: string) {
  return laws.filter((law) => new RegExp(`\\b${law.number}\\b`).test(markdown))
    .map((law) => ({ ...law, url: `https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=${law.number}&MevzuatTur=1&MevzuatTertip=${['2004', '6183', '7338'].includes(law.number) ? 3 : 5}` }));
}

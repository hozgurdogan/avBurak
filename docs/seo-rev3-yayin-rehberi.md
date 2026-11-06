# 7 Kasım 2026 içerik güncellemesi

Kaynak: `rapor/SEO-Makale-ve-Bolge-Plani-Revize3.pdf` (6 Kasım 2026, 38 sayfa).

## Hazır paket

- PDF'deki dokuz makalenin H1, SEO title, meta açıklama ve slug'ları korundu. Türkçe gövdeler `prisma/content/seo-rev3/` içinde; Kısaca kutuları, doğrulanan dayanak tabloları, konuya özgü karşılaştırmalar ve belge hazırlığı bölümleri var.
- Ceza Hukuku, çalışma alanlarına ve makale kategorilerine eklendi. Çalışma alanı Türkçe, İngilizce ve Arapça hazır; dolandırıcılık makalesi Türkçe. İnfaz hesaplama aracı bu alana bağlandı.
- Dokuz yeni makale CMS'ye **taslak** olarak aktarılır. Hazırlama/kaynak kontrol tarihi yayın tarihi sayılmaz. Mevcut CMS düzenlemeleri tekrar aktarımda ezilmez; gerçek yayın anında `publishedAt` yazılır.
- Kıdem tazminatı, kira tespiti ve ödeme emrine itiraz yazılarına PDF'nin üç eki eklenir. Başlık ve URL'ler korunur. Aynı bölüm ikinci kez eklenmez. Aktarım sırasında eşzamanlı düzenleme varsa işlem geri alınır.
- Sekiz bölgenin makale tercihleri güncellendi. Önce yeni yayınlar, ardından mevcut rehberler gösterilir; her bölgede en fazla beş bağlantı. Bağlantılar CMS'deki **yayınlanmış** çeviri gruplarından çözülür. Taslak ve eksik çeviriye bağlantı üretilmez.
- Yeni/eski makaleler arasında PDF'nin karşılıklı bağlantı planı uygulanır. Makale 1 ve 9, ikisi de yayınlandığında birbirine bağlanır.
- Beylikdüzü boşanma hizmet sayfası: `/tr/bolgeler/beylikduzu-bosanma-avukati`. Gerçek EN/AR karşılıkları da var. Beylikdüzü bölgesinden, aile hukuku alanından ve ilgili yeni makaleden bağlantı verilir; sitemap'e eklenmiştir.
- Ana sayfanın Türkçe title'ı: `Esenyurt Avukat | Av. Burak Uğur Öztürk`. Bölge H1'leri önceki güncellemede zaten PDF'deki biçimdedir. Çalışma alanlarında H1'e Esenyurt bağlamı eklendi, avukat adı alt satırda gösterilir. Makale SEO title'ına marka soneki eklenmez.
- Makalelerin WhatsApp bağlantısının hazır mesajında okunan makalenin başlığı bulunur. Telefon bağlantısı ortak ofis numarasını kullanır. Mevcut izin temelli dönüşüm takibi bu bağlantılarda da çalışır.
- Kira, iş, aile, miras/taşınmaz için dört indirilebilir tek sayfalık PDF: `public/belgeler/`. Yeni ilgili makalelerde belge listesi ve indirme bağlantısı gösterilir.
- Mobil üst başlıkta monogram ve menü yerleşimi dar ekrana uyarlandı; isim ve “Avukat” etiketi gereksiz satırlara bölünmez. Kısaca kutusu ve tablolar mevcut renk/font düzeniyle biçimlendirildi.

## cPanel'de uygulama

Üretim `.next` dosyaları Git'e dahildir. Sunucuda yeniden derleme veya veritabanı şeması değişikliği gerekmez. Tüm seed'i çalıştırmayın.

Terminalde önce cPanel **Setup Node.js App** ekranının gösterdiği sanal ortam etkinleştirme komutunu kullanın; aşağıdaki `node` komutları sitenin mevcut Node ortamında çalışmalıdır.

```bash
cd ~/repositories/avburak-app
git pull --ff-only origin main
node scripts/import-editorial-rev3.mjs
```

Son komut yalnız önizlemedir. Beklenen çıktı: 9 `create-draft` ve 3 `append-section`; kategori ve yazarlar mevcut veritabanından alınır. Eksik hedef yazı varsa uygulama hiçbir şeyi değiştirmeden durur.

```bash
node scripts/import-editorial-rev3.mjs --apply
touch tmp/restart.txt
```

Bu komut yeni makaleleri taslak oluşturur, üç mevcut yazıya ekleri uygular. Sonraki çalıştırmalarda oluşturulmuş makaleler değiştirilmez. Panelde taslak metinler incelenip düzenlenebilir.

## Yayın sırası ve son inceleme

PDF, metinlerin Av. Burak Uğur Öztürk tarafından hukuki/editoryal incelemeden geçirilmesini ve haftada en fazla iki yazı yayınlanmasını istiyor. Otomatik tarihli toplu yayın kurulmadı. Yayınlamak istediğiniz yazıları inceleyip panelden yayınlayın; alternatif olarak aşağıdaki komutları **ilgili gün geldiğinde, inceleme tamamlandıktan sonra** çalıştırın. Komut yedi günlük dönemde en fazla iki yeni paket makalesine izin verir.

| Sıra | Kimlik | Yazı | Önerilen zaman |
| --- | --- | --- | --- |
| 1 | 1 | Kiracı kirayı ödemiyor | İlk hafta |
| 2 | 2 | Maaşım ödenmiyor | İlk hafta |
| 3 | 3 | Boşanmak istiyorum | İkinci hafta |
| 4 | 9 | Ev sahibi çıkmamı istiyor | İkinci hafta |
| 5 | 4 | Miras tapu intikali | Üçüncü/dördüncü hafta |
| 6 | 7 | Limited şirket ortağı | Çekirdek kümeden sonra |
| 7 | 8 | Kentsel dönüşüm | Çekirdek kümeden sonra |
| 8 | 5 | Ayıplı ikinci el araç | Çekirdek kümeden sonra |
| 9 | 6 | IBAN dolandırıcılığı | En son |

```bash
# İncelenen ilk iki yazıyı, çalıştırıldığı anda yayınlar:
node scripts/import-editorial-rev3.mjs --apply --publish=1,2
touch tmp/restart.txt

# En erken yedi gün sonra, sonraki iki yazı için:
node scripts/import-editorial-rev3.mjs --apply --publish=3,9
touch tmp/restart.txt
```

Panelden yayınlama, komutun yedi günlük sınırını uygulamaz; editör takvimi takip etmelidir. Yeni yayınlar dinamik sitemap, bölge sayfaları ve ilgili makale bağlantılarında sonraki istekte görünür. Taslakların kendilerine ait herkese açık URL'leri 404 döner.

## Sonraki editoryal konular

PDF Bölüm 7'deki başlıklar ayrı önerilerdir. Beylikdüzü hizmet sayfası bu sürümde tamamlandı. “Nafaka artırım davası” sitede zaten `/tr/makaleler/nafaka-artirim-davasi-nasil-acilir` adresinde var; yeni rakip URL açılmadı, boşanma yazısından mevcut rehbere bağlandı. Esenyurt/Beylikdüzü adli yargı bilgileri bölge rehberlerinde resmî kaynakla zaten bulunuyor. Aylık kira artışı mevcut hesaplama aracına bağlandı; yeni ve zamanla eskiyecek ikinci oran sayfası oluşturulmadı.

Fazla mesai ispat rehberi ve yabancılar için EN/AR kira rehberi sonraki içerik konularıdır. PDF yalnız ilk üç yazı için İngilizce **özet taslağı** sunuyor; bu özetler tam çeviri gibi yayınlanmadı. Arapça kaynak özetleri Türkçe Kısaca kutularıdır. Gerçek çeviri hazırlanıp aynı CMS grubunda yayınlanana kadar yeni dokuz makaleye EN/AR hreflang verilmez.

İngilizce özet taslakları:

1. If a tenant stops paying rent, collecting the debt and evicting the tenant are two separate questions, and the route chosen determines the deadlines. Start by documenting the unpaid amount month by month, then decide with a lawyer between an enforcement proceeding, a formal notice or a lawsuit. This summary is general information, not legal advice.
2. If your salary is not paid, requesting payment, refusing to work under the legal conditions and terminating the contract for just cause are different steps with different consequences. Document unpaid months, payslips and bank records before you leave the job, and have the reason for termination reviewed. This summary is general information, not legal advice.
3. The first step in a divorce is to assess whether the spouses agree, what the children need and how each spouse will be supported. Keep documents and messages lawfully, and seek protection measures immediately if there is a safety risk. This summary is general information, not legal advice.

## Kaynak ve ölçüm notları

7 Kasım 2026 tarihinde mevzuat.gov.tr üzerinden kontrol edilen kritik noktalar: TBK m.315, 351, 352; İİK m.269 (doğru tertip: 3); İş Kanunu m.24, 32, 34; 6325 m.18/B; 7036 m.3; 6502 m.12, 73/A; TMK m.168; 4787 m.4; CMK m.158; TTK m.614, 630, 638; 6306 m.6; 6183 m.35; 7338 m.9. Resmî metin sayfalarına bağlantılar yazılarda bulunur. TKGM intikal bilgi notu, GİB kanun metni, Çalışma Bakanlığı soruları, EGM siber suç bilgisi ve KDB finansal destek/kılavuz bağlantıları eklendi. Sabit dönüşüm desteği tutarı veya başvuru son günü yazılmadı.

Search Console'a bu sürümde erişilmedi; daha önce ertelenen işlem sürüyor. Yayın günleri ayrıca not edilmeli. 15 Eylül–6 Kasım 2026 mevcut yazı tabanı ile yeni makalelerin ilk 28 günlük dönemi karıştırılmamalı; eşit uzunlukta dönemlerde sorgu/sayfa bazında karşılaştırılmalı. Her yeni yayından sonra URL Denetimi yapılmalı; sitemap yeni yayınları otomatik içerir. Veri görülmeden sıralama veya tıklanma artışı sonucu çıkarılmadı.

## Kontrol komutları

```bash
node --test scripts/verify-editorial-rev3.mjs
node --conditions=react-server --import tsx scripts/verify-regional-seo.ts
npm run lint
npm run typecheck
```

HTTP/görsel kontroller yerel üretim sunucusunda açıkça etkinleştirilen test verisiyle yapılır (`SEO_FIXTURE=1 EDITORIAL_FIXTURE=1`). Bu preload canlı sunucuda kullanılmaz; gerçek veritabanı üzerinde aktarım uygulanmış gibi raporlanmaz.

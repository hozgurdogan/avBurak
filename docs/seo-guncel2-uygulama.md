# Güncel SEO rehberi uygulaması — 6 Kasım 2026

Kaynak: `rapor/SEO_Duzeltme_Rehberi_Guncel2.pdf`, 8 sayfa. Önceki rehberle çelişen yeni metin ve kaldırma talepleri esas alındı.

## Uygulananlar

- Sekiz bölgenin Türkçe H1 ve title değerleri rapordaki tabloyla eşleştirildi. Mimaroba H1'i **Mimaroba Av. Burak Uğur Öztürk**, Beylikdüzü H1'i **Beylikdüzü Avukat Av. Burak Uğur Öztürk**. Title/OG/Twitter aynı editoryal başlığı kullanır; marka ikinci kez eklenmez.
- Ana sayfa H1'i korundu. Türkçe title **Av. Burak Uğur Öztürk | Hukuki Danışmanlık ve Dava Takibi** oldu. EN/AR başlıkları da kendi dillerinde güncellendi.
- Sekiz bölgenin açıklamaları, kısa kart odakları ve açıklayıcı bağlantı metinleri yenilendi. Bölge listesi tüm sekiz bölgeyi kapsar.
- TR/EN/AR olmak üzere 24 bölge rehberinde konuya özgü bölümler, belge hazırlığı, çalışan içindekiler bağlantıları ve SSS bulunur. Ulaşım, yol tarifi, otopark/süre ve Mimaroba büro/şube paragrafları kaldırıldı. İletişim sayfasındaki gerçek adres ve harita korundu.
- Esenyurt, Beylikdüzü, Büyükçekmece ve Mimaroba rehberlerinde doğrulanmış adli yargı çevresi bilgisi ve dosya bazında görev/yetki ayrımı kullanıldı. Diğer ilçeler için bu rapordan yetki çıkarımı yapılmadı; eski Çatalca/Büyükçekmece genellemesi kaldırıldı.
- Kaynak bağlantısı: [Bakırköy Adliyesi 2025 Faaliyet Raporu, Mart 2026, s. 3](https://rayp.adalet.gov.tr/resimler/17/dosya/evrak2026-04-03-10-01-0603-04-202610-02-am.pdf#page=3). Büyükçekmece yargı çevresinin üç ilçesi resmî kaynaktan kontrol edildi.
- Bölge rehberleri çalışma alanlarına, ilgili hesaplama araçlarına ve gerçekten yayımlanmış makalelere bağlanır. Mimaroba/Büyükçekmece çapraz bağlantısı eklendi. Makalelerde konuya uygun bölge rehberlerine geri bağlantılar vardır.
- Makale bağlantıları sabit tahmini EN/AR adresleri değildir: doğrulanmış TR yazının çeviri grubu üzerinden yalnız o dilde yayımlanan gerçek slug kullanılır. Çevirisi yoksa o dilde bağlantı gösterilmez. Yeni site yönetimi makalesi veya yayımlanmamış bir yazı uydurulmadı.
- Hizmet tespiti, tüketici hakem heyetine itiraz ve kiracının erken çıkışı makalelerinin gösterim başlıkları rapora uyarlandı. Makale URL'leri, CMS gövdesi ve yayın/güncelleme tarihleri değiştirilmedi. Editoryal gösterim kuralları `src/content/article-editorial.ts` dosyasındadır.
- Markdown içindeki sayfa başlığını tekrarlayan H1 kaldırılır; kalan gövde başlıkları H2/H3 hiyerarşisine indirilir. Değişiklik tüm eski makalelerde gösterim sırasında uygulanır; yeniden seed gerekmez.
- `/bolgeler/...` ve `/calisma-alanlari/...` gibi eski dil öneksiz genel adresler kalıcı 301 ile `/tr/...` adresine gider. Kök/www/son eğik çizgi normalizasyonuyla tek uygulama yönlendirmesinde birleştirilir. Diğer dil algılama akışı korunur.
- Mobil kontrolde bulunan ortak stil birleştirme hatası giderildi: `text-display-sm` ve `text-md` gibi özel yazı boyutları metin rengi sanılarak düşürülmüyor. Mobil başlık menüsü için marka satırı küçülebilir/satır kırabilir hale getirildi. Görünür marka metniyle çelişen erişilebilir ad kaldırıldı.
- Açık panel zeminindeki küçük metin kontrastları düzeltildi: `ink-faint` 4,83:1, `gold-800` 4,90:1. Başlık ve küçük metinler mevcut tasarımın aynı renk ailesinde kalır.
- Dinamik metadata akışı kapatıldı; title, açıklama ve canonical tüm istemciler için HTML `head` bölümünde tamamlanır. Bu, yeni dinamik bölge rehberlerinde mobil SEO kontrolünün açıklamayı kaçırmasını önler.

## Kontrol ve veri sınırı

`seo-guncel2-yayin-oncesi.json`, 6 Kasım yayın öncesindeki 24 canlı bölge sayfasının HTTP durumlarını, başlıklarını ve canonical adreslerini kaydeder. İki eski adresin o anda 307 döndüğü görüldü; yeni 301 davranışı yerel production çıktısında test edildi. Bu dosya Search Console başlangıç verisi değildir.

Raporda adı geçen velayet ve muris muvazaası yazılarında canlı yayın öncesi beşer H1 bulundu. Yeni gösterim hiyerarşisi, bu tür çoklu H1 içerikleri ve büyük/küçük harf farkı içeren tekrarlarla test edildi.

Kontroller:

```bash
npm run lint
npm run typecheck
node --conditions=react-server --import tsx scripts/verify-regional-seo.ts
node --conditions=react-server --import tsx scripts/verify-seo.ts
npm run build
```

Gerçek MySQL erişimi olmadan production HTTP kontrolü için yalnız yerel testte:

```bash
SEO_FIXTURE=1 NODE_ENV=production HOSTNAME=127.0.0.1 PORT=3210 node --require ./scripts/fixtures/seo-db.cjs server.js
node scripts/verify-regional-http.mjs
node scripts/verify-seo-http.mjs
```

Fixture dosyası uygulama tarafından içe aktarılmaz; yalnız açık `--require` ve `SEO_FIXTURE=1` ile çalışır. Canlı sunucuda bu test başlatma komutunu kullanmayın. Kontrol, 24 rehberin HTTP 200 durumunu, tek H1'i, başlık boyutunu, metadata'nın head içinde olmasını, ToC hedeflerini, mevcut çeviri bağlantılarını ve kalıcı yönlendirmeleri kapsar. Gerçek canlı veritabanına yazılmadı.

Mobil Lighthouse ölçümü `seo-guncel2-mobil-yerel.json` dosyasındadır. Bu, yeni production çıktısının yerel fixture ile laboratuvar kontrolüdür; canlı kullanıcı Core Web Vitals, INP veya Search Console verisi değildir. Yeni gerçek canlı hız ölçümü yayın sonrasında tekrarlanmalıdır.

Son yerel mobil sonuç: performans **84**, erişilebilirlik **100**, en iyi uygulamalar **100**, SEO **100**; LCP **2,1 sn**, CLS **0**. Yerel fixture, makine yükü ve içerik farkı nedeniyle bu performans puanı önceki canlı ana sayfa ölçümüyle doğrudan karşılaştırılmaz. Meta açıklamanın head içinde olması ve küçük metin kontrastı auditleri geçti; son mobil ekran görüntüsü incelendi.

## Yayın

Yeni paket, veritabanı şeması veya migration eklenmedi. Önceki uygulama kurulumu güncelse cPanel Node ortamında:

```bash
cd ~/repositories/avburak-app
git pull --ff-only origin main
touch tmp/restart.txt
```

Pull hata verirse durun; restart'a geçmeyin. `.next` build çıktısı commit ile gönderilir. OneDrive çakışmalarına karşı build geçici klasörde alınmış, sonra proje köküne taşınarak HTTP ile sınanmıştır.

## Yayın sonrası

1. Her bölge için H1, title/OG, açıklama ve kendi canonical adresini kontrol edin. EN/AR karşılıklarını ve gerçek makale bağlantılarını kontrol edin.
2. `/bolgeler/beylikduzu` ve `/calisma-alanlari/is-hukuku` adresleri 301; `/tr/...` hedefleri 200 olmalıdır. Hostingin uygulamadan önceki HTTP→HTTPS kuralı ayrıca cPanel katmanında yönetilir; bu çalışma onu değiştirmedi.
3. Mimaroba metninde kaldırılan ulaşım ve şube paragrafları bulunmamalıdır. İletişim sayfası ve footer gerçek büro adresini göstermeye devam eder.
4. Velayet/muris muvazaası ve üç editoryal makalede tek H1 ve doğru başlıkları kontrol edin. Güncelleme tarihi sırf görünüm değişti diye ileri taşınmaz.
5. Mobil Lighthouse'u canlıda tekrarlayın. Search Console mülk seçimi, Google'ın seçtiği canonical, URL Denetimi/yeniden dizine ekleme ve 28 günlük sorgu karşılaştırması, kullanıcının önceki tercihi doğrultusunda sonraya bırakıldı. Bu hesap işlemlerinin tamamlandığı veya bir sıralama artışı olduğu iddia edilmez.

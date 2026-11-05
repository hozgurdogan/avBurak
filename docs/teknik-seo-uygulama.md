# Teknik SEO uygulaması — 5 Kasım 2026

Kaynak: `rapor/teknik-seo-yapilacaklar.pdf` (16 Ekim 2026, 5 sayfa).

## Uygulananlar ve mevcut doğrulamalar

| PDF maddesi | Kod tarafındaki durum |
| --- | --- |
| Makale tarihleri | Görünür son güncelleme, Article JSON-LD ve sitemap aynı tarih korumasını kullanır. CMS kaydında güncelleme tarihi yayın tarihinden erken olamaz. Eski canlı kayıtlar için aşağıdaki salt okunur kontrol mevcut. |
| Türkçe anchor | ASCII Türkçe slug sistemi mevcut. Benzersizlik çakışmaları giderildi; Arapça başlıklar için zamandan bağımsız ID; eski Türkçe/İ/ı anchor'ları için uyumluluk ID'leri eklendi. Markdown her istekte işlendiği için eski makaleler de yeniden işlenir. Makale URL slug'ları değiştirilmedi. |
| hreflang / canonical | Her sayfanın kendi canonical'ı korunur; `x-default` eklendi. Makalelerde yalnızca gerçekten yayımlanmış çeviriler ve gerçek slug'ları kullanılır. Dil seçici, makale çeviri bağlantılarını metadata'dan okur; çevirisi olmayan dilde makale listesine gider. |
| robots / sitemap | Üç dil, araçlar, bölgeler ve yayımlanmış makaleler listelenir. XML hreflang ve `x-default` eklendi. Dil önekli yönetici yolları robots'tan çıkarıldı. Statik sayfalara sahte lastmod üretilmez. |
| Yönlendirme | Uygulamada `/` → `/tr`, www → kanonik alan adı ve son eğik çizgi için 301. HTTP dönüşümü hosting katmanındadır; tek adım için `deployment/cpanel-seo.htaccess` hazırlanmıştır. |
| JSON-LD | Mevcut LegalService / Article / BreadcrumbList korundu; Article mainEntityOfPage ve image, LegalService image / knowsLanguage, görünür SSS ile birebir FAQPage eklendi. Yorum veya puan şeması eklenmedi. |
| Meta / H1 | Ana sayfanın kısa açıklaması zaten mevcut. Konum ve çalışma alanlarını belirten görünür alt başlık güçlendirildi. Bölge açıklamaları ve ulaşım bilgileri genişletildi. HTML title, OG title ve Twitter title eşitlendi. |
| Sosyal görseller | Ortak 1200×630 OG ve büyük Twitter kartı zaten mevcut. Makaleler kapak görselini kullanır; kapak yoksa başlığa özel 1200×630 kart üretilir. |
| Gezinme / içerik | Bölge ve makale breadcrumb'ları zaten mevcut. Esenyurt çalışma alanları tek kaynakta bulunan 11 alanın tamamını gösterir. Bölgelere özgü belge hazırlığı/ulaşım bilgisi ve gerçek Esenyurt bürosunun haritası eklendi; ikinci büro iddiası yok. İlgili makale özetleri en çok 160 karakter. Yazar kutusu, son güncelleme, makalede numarası açıkça geçen kanunların resmî kaynakları eklendi. |
| Performans / erişilebilirlik | Fontlar yerel, swap/preload zaten mevcut. Profil fotoğrafı boyutlu ve yüksek öncelikli; haritalar lazy ve sabit oranlı. Form etiketleri, KVKK onayı, honeypot/rate-limit, atlama bağlantısı ve odak stilleri mevcut. Gerçek CWV ölçümü aşağıda ayrılmıştır. |
| HTTPS | 5 Kasım canlı kontrolde geçerli TLS ve HTTP 200 doğrulandı. Production HSTS (yalnız ana host, bir yıl) açıldı; üretim çerezleri Secure oldu. Subdomain/preload iddiası eklenmedi. |
| Etkileşimler | Analiz onayından sonra telefon/WhatsApp tıklaması ve gerçek başarılı form gönderimi birinci taraf olarak sayılır. Yönetim → Ziyaret Analizi bölümünde 7/30/90 gün sayımları vardır. Mesaj, telefon numarası, IP veya ziyaretçi kimliği olay tablosuna yazılmaz. İzin verilmezse kayıt yapılmaz. Google'a veri aktarımı eklenmedi. |
| İzin arayüzü | HttpOnly izin çerezi artık `document.cookie` ile okunmaz; sunucudan GET ile alınır. Kaydetme başarısızsa banner kaybolmaz. İlk kabul edilen sayfa da sayılır. Gizlilik/KVKK açıklamaları güncellendi. |

## cPanel yayını

Önce normal veritabanı yedeğini alın. cPanel **Setup Node.js App** ekranındaki sanal ortam etkinleştirme komutunu çalıştırın. Ardından:

```bash
cd ~/repositories/avburak-app
git status --short
git pull --ff-only origin main
CHECKPOINT_DISABLE=1 npx prisma generate
npx prisma migrate deploy
touch tmp/restart.txt
```

Bu değişiklik `conversion_events` tablosunu ekler. Migration ve Prisma generate tamamlanmadan yeniden başlatmayın. Paket bağımlılıkları değişmedi; build `.next` ile birlikte gönderilir. Bu belgenin bulunması, commit/push veya hosting yayını yapıldığı anlamına gelmez.

`deployment/cpanel-seo.htaccess` satırlarını mevcut HTTPS yönlendirmelerinin **üstüne**, Passenger satırlarını koruyarak birleştirin. Dosya bir uygulama kökü `.htaccess` dosyası olarak otomatik kurulmaz. CDN/proxy HTTPS'i sonlandırıyorsa hosting sağlayıcısının güvenilir HTTPS değişkeniyle uyarlayın; yanlış `%{HTTPS}` kontrolü döngü yaratabilir. Hostingin zorunlu HTTPS yönlendirmesi uygulamadan önce çalıştığından yalnız `git pull` bu katmanı değiştirmez.

### Canlı veride eski tarihleri inceleme

```bash
npx tsx scripts/check-article-dates.ts
```

Varsayılan salt okunurdur. Yayın tarihinin doğruluğunu CMS'te kontrol edin. Yayın tarihi doğruysa, yedek sonrasında `--apply` güncelleme tarihini yayın tarihine eşitler; bilinmeyen bir geçmiş düzenleme tarihi icat etmez. Bu bakım komutu burada canlı veritabanına karşı çalıştırılmamıştır. Host `tsx` alt işlemini engelliyorsa phpMyAdmin ile önce şu sorguyu kullanın:

```sql
SELECT id, slug, publishedAt, updatedAt
FROM articles
WHERE publishedAt IS NOT NULL AND updatedAt < publishedAt;
```

## Hesap veya hosting erişimi gerektiren kalan işlemler

- **Search Console:** DNS alan adı özelliği doğrulaması, sitemap gönderimi, dizinleme ve geliştirmeler raporları. URL-prefix doğrulaması tercih edilirse `GOOGLE_SITE_VERIFICATION` değerini build ortamına ekleyin ve yeniden build alın. Kodda sahte doğrulama değeri yoktur.
- **Google Business Profile:** gerçek profil URL'si, doğrulanmış çalışma saatleri, kesin büro koordinatları ve varsa baro profil bağlantısı olmadan `sameAs`/açılış saatleri uydurulmadı. Profilin NAP bilgileri siteyle eşleştirilmeli.
- **GA4:** izin, CSP ve metinleriyle kod entegrasyonu hazırdır; gerçek ölçüm kimliği verilmediği için kapalıdır. Çalışma anında ortam değişkenleriyle açılabilir. Ayrıntılar: [hosting ve analiz tamamlama](hosting-ve-analiz-tamamlama.md).
- **Core Web Vitals:** PageSpeed Insights mobil ölçümü, gerçek kullanıcı INP/CLS/LCP ve Search Console saha verisi yayın sonrasında incelenmelidir. Ölçülmemiş hız puanı veya hedefe ulaşıldığı iddia edilmez.
- **Yayın sonrası:** tüm şablonları Rich Results Test / Schema Markup Validator ile, robots ve sitemap'i HTTP 200 ile, http/www/kök/son-slash varyantlarını Location başlıklarıyla yeniden kontrol edin.
- **Saklama:** `node scripts/site-maintenance.mjs` salt okunur kontrol sağlar; `--prune-analytics --apply` 13 takvim ayından eski analiz kayıtlarını temizler. Hazır komutun günlük cron'a eklenmesi hosting erişimi gerektirir. Bu çalışma canlı verileri silmedi.

## Yerel kontroller

```bash
npm run lint
npm run typecheck
node --conditions=react-server --import tsx scripts/verify-seo.ts
npm run build
# Ayrı terminalde production sunucusu 3210 portunda çalışırken:
node scripts/verify-seo-http.mjs
```

Regresyon kontrolü Türkçe/tekrarlı/Arapça başlıkları, eski fragment uyumluluğunu, tarih korumasını, özet uzunluğunu, başlık tutarlılığını ve gerçek çeviri slug'larıyla çok dilli sitemap'i sınar. Veritabanı fixture'ı yalnız test sürecinde sorgu fonksiyonunu değiştirir; gerçek veritabanına yazmaz.

Production build ve yerel HTTP kontrolleri tamamlandı. HTTP kontrolü 301 yönlendirmeleri, title/og:title eşitliği, x-default, Arapça RTL, FAQPage, 11 çalışma alanı, HSTS, robots, izin tercihini hatırlama ve onaysız etkileşim isteklerini kapsar. Gerçek MySQL üzerinde migration, izinli olay yazımı ve makale görseli canlı verisiyle uçtan uca kontrol edilmedi; bu makinede DATABASE_URL yoktur. Build bu nedenle bazı mevcut dinamik sayfa denemelerinde Prisma uyarıları basar; tamamlanma kodu 0'dır.

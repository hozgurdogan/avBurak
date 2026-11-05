# Canlı SEO kontrolü — 5 Kasım 2026

Son SEO sürümünün canlıda olduğu, güncel stil dosyası, HSTS ve yeni SEO etiketleri ile doğrulandı.

## Tamamlanan ölçüm ve doğrulamalar

- Sitemap HTTP 200; 163 URL, XML dil alternatifleri ve x-default mevcut.
- Sitemap'teki 49 makalenin tamamı ve üç dilde ana sayfa/SSS ile iki bölge sayfası dahil toplam 57 sayfa kontrol edildi.
- Kontrol edilen sayfalar HTTP 200; HTML title/og:title tutarlı; canonical ve x-default mevcut.
- 49 makalenin herkese açık Article şemasında güncelleme tarihi yayın tarihinden önce değil.
- Makale paylaşım görselleri HTTP 200; PNG olanlar 1200×630 olarak doğrulandı.
- www kök adresi ve `/tr/` tek 301 ile kanonik `/tr` adresine gidiyor.
- HTTP kök adresinde hostingin `http → https / → /tr` zinciri hâlâ iki adım. Bu katman Git deposundan otomatik değişmez.

Ham sonuç: `canli-seo-kontrol.json`. Yeniden çalıştırma: `node scripts/audit-live-seo.mjs`.

## Mobil Lighthouse laboratuvar sonucu

| Ölçüm | Sonuç |
| --- | --- |
| Performans | 91/100 |
| Erişilebilirlik | 100/100 |
| En iyi uygulamalar | 100/100 |
| SEO | 100/100 |
| LCP | 2,2 saniye |
| CLS | 0,001 |
| FCP | 1,5 saniye |
| TBT | 320 ms |

Ölçüm canlı Türkçe ana sayfada, Lighthouse 12, varsayılan mobil simülasyonla yapıldı. Tek laboratuvar ölçümüdür; gerçek kullanıcı Core Web Vitals/INP sonucu değildir. TBT, INP yerine raporlanmamalıdır. Google PageSpeed API çağrısı HTTP 429 kota hatası verdi; sonuç bu nedenle yerel resmî Lighthouse CLI ile üretildi. INP/saha verileri Search Console veya CrUX erişimiyle ayrıca kontrol edilmelidir.

Tam inceleme: `lighthouse-mobile.html`. Ham veri: `lighthouse-mobile.json`.

## Erişim nedeniyle tamamlanamayan hesap/hosting işleri

1. **cPanel/.htaccess:** mevcut Passenger ayarlarını koruyarak hazırlanan yönlendirme kurallarının mevcut hosting dosyasına birleştirilmesi. Giriş adresi/erişilebilir oturum yok. Kayıtlı bir SSH yapılandırması da bulunmadı.
2. **Search Console:** mülk doğrulaması, sitemap gönderimi, dizinleme ve saha verisi raporları. Doğrulanmış hesap erişimi yok.
3. **Google Business Profile:** gerçek işletme profil bağlantısı, çalışma saatleri ve kesin koordinatlarla NAP/sameAs eşleştirmesi. Profil erişimi ve doğrulanmış bilgiler yok.
4. **GA4:** hesabın/stream'in kurulması veya mevcut ölçüm kimliğiyle entegrasyon. Ölçüm kimliği yok; Google'a analiz aktarımı etkinleştirilmedi. Mevcut izinli birinci taraf sayaçlar korunuyor.
5. **Ham veritabanı tarihleri:** herkese açık çıktılar tutarlı; kayıtların asıl publishedAt/updatedAt değerlerini görmek ve gerektiğinde düzeltmek için CMS veya veritabanı erişimi gerekiyor. Bu çalışma canlı veritabanına yazmadı.
6. **Analiz saklama bakımı:** 13 aylık kayıtlar için hosting zamanlanmış bakımının kontrolü/kurulumu cPanel erişimi gerektiriyor; veriler silinmedi.

Tarayıcı erişim servisi bu oturumda bağlantı kuramadı; açık Google/cPanel oturumlarına erişilemedi. Eklenti keşfinde rapor okuma için Windsor.ai bulundu ancak bağlantısı yapılmadı. Hesapların kurulmuş/doğrulanmış olduğu iddia edilmez; şifrelerin sohbet üzerinden paylaşılması gerekmez.

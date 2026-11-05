# Hosting, analiz ve işletme bilgileri — 5 Kasım 2026

Search Console kullanıcı talebiyle sonraya bırakıldı.

## GA4 entegrasyonu

Kod hazırdır; gerçek bir ölçüm kimliği olmadan kapalıdır. cPanel Node.js uygulamasının ortam değişkenlerine aşağıdaki gerçek değerleri girin:

```dotenv
GA4_ENABLED=true
GA4_MEASUREMENT_ID=G_GERCEK_KIMLIK_YERINE_G_DEGERINIZ
```

İkinci satırdaki örnek kimlik kasıtlı olarak geçersizdir; yerine Google Analytics → Yönetici → Veri akışları → Web akışındaki **G- ile başlayan gerçek kimliği** yazın. Bu ayarlar sunucuda çalışma anında okunur: `touch tmp/restart.txt` yeterlidir, kimlik için yeni build gerekmez. Kimlik gizli anahtar değildir; parola/API anahtarı paylaşmayın.

- Google etiketi yalnız GA4 açık, kimlik geçerli ve yeni Google aktarım onayı verilmişse yüklenir. Eski birinci taraf onayı GA4'ü etkinleştirmez.
- Olaylar: `page_view`, `phone_click`, `whatsapp_click`, `contact_submit`. Form olayı yalnız gerçek kayıt başarılı olduğunda üretilir; honeypot sahte başarısı sayılmaz.
- URL sorguları/hash, form metni, e-posta veya telefon numarası olay parametrelerine eklenmez. Google bağlantının IP adresini teknik olarak görebilir; bu aktarım onay/gizlilik metinlerinde açıklanır.
- Reklam depolaması, reklam kişiselleştirmesi ve Google Signals kapalıdır.
- Sayfa altındaki **Çerez tercihleri** düğmesi onayı geri çekmeye izin verir; Google olayları durur ve erişilebilir GA çerezleri temizlenir.
- GA4 web akışında otomatik form/çıkış tıklaması/page-view ölçümlerini kapatın; bu olaylar uygulama tarafından gönderildiği için çift sayım oluşmasın. Olaylar göründükten sonra telefon/WhatsApp/form olaylarını ihtiyaca göre önemli etkinlik olarak işaretleyin.
- GA4 saklama ayarını ayrıca belirleyin. Bu kod Google hesabı veya web akışı oluşturmaz; gerçek kimlik verilmediğinden bu çalışma sırasında Google'a ziyaret verisi aktarımı açılmadı.

## İşletme profil bilgileri

Gerçek işletme URL'si, baro profil URL'si, kesin koordinatlar ve çalışma saatleri girilmedikçe bunlar uydurularak gösterilmez. Esenyurt'un yaklaşık koordinatları artık büronun kesin noktası olarak JSON-LD'ye yazılmaz. Doğrulanmış değerler **build ortamında** aşağıdaki alanlara verilebilir:

```dotenv
# Örnek biçimlerdir; gerçek değerlerle doldurulmalıdır.
GOOGLE_BUSINESS_PROFILE_URL=https://maps.app.goo.gl/GERCEK_PROFIL
BAR_PROFILE_URL=https://www.istanbulbarosu.org.tr/GERCEK_PROFIL
BUSINESS_LATITUDE=GERCEK_ENLEM
BUSINESS_LONGITUDE=GERCEK_BOYLAM
BUSINESS_HOURS_JSON=[{"days":["Monday","Tuesday","Wednesday","Thursday","Friday"],"opens":"09:00","closes":"18:00"}]
```

Saatler yalnız örnektir; büronun gerçek gün/saatleri doğrulanmalıdır. Hatalı URL/koordinat/saat verileri gösterilmez. Doğru bilgiler girilip yeniden build alındığında profil bağlantıları ve saatler hem JSON-LD'de hem iletişim sayfasında görünür. Harita mevcut gerçek açık adres üzerinden çalışmayı sürdürür.

## Hosting yönlendirmesini kurma

Önce cPanel'de alan adının gerçek document root'unu öğrenin. Passenger uygulama kökü ile alan adı document root'u aynı olmak zorunda değildir. Node sanal ortamını etkinleştirin ve uygulama dizininde önce önizleyin:

```bash
node scripts/install-seo-redirects.mjs --target /home/KULLANICI/GERCEK_DOCUMENT_ROOT/.htaccess
```

Görünen hedef ve önizleme doğruysa:

```bash
node scripts/install-seo-redirects.mjs --target /home/KULLANICI/GERCEK_DOCUMENT_ROOT/.htaccess --apply
```

Araç mevcut dosyayı kullanıcı evindeki `.avburak-backups` dizinine yedekler; yedek document root içine alınamaz. Mevcut Passenger satırları korunur. SEO bloğu idempotenttir; tekrar çalıştırma kural çoğaltmaz. Kurallar proxy arkasında `%{HTTPS}` değerine güvenmez. Mevcut hosting HTTP→HTTPS kuralı diğer temiz URL'ler için korunur. Hosting/CDN HTTPS yönlendirmesini `.htaccess` okunmadan önce yapıyorsa paneldeki zorunlu yönlendirme sırası ayrıca düzenlenmelidir.

Sonra `http://burakugurozturk.av.tr`, `https://www.burakugurozturk.av.tr`, kök adres ve `/tr/` için Location başlıklarını kontrol edin. HTTP kök adresinin doğrudan `https://burakugurozturk.av.tr/tr` adresine gitmesi hedeflenir. Sunucu dosyasına erişim olmadığından burada gerçek hosting dosyası değiştirilmedi.

## Veritabanı ve 13 aylık saklama bakımı

Bakım aracı `.env`/cPanel ortamını okur ve `tsx`/esbuild alt işlemi gerektirmez:

```bash
node scripts/site-maintenance.mjs
```

Varsayılan **salt okunurdur**: yayın tarihinden eski güncelleme kayıtlarını ve 13 takvim ayından eski analiz kayıtlarının sayılarını gösterir. Tamamı için önce normal veritabanı yedeği alın. Yayın tarihlerinin doğru olduğunu CMS'ten kontrol ettikten sonra:

```bash
node scripts/site-maintenance.mjs --repair-dates --apply
node scripts/site-maintenance.mjs --prune-analytics --apply
```

Tarih düzeltmesi, arada başka bir yönetici kaydı değiştirmişse üzerine yazmaz. Analiz bakımı yalnız eski page-view, dönüşüm ve artık güncel ziyaret kaydı olmayan eski ziyaretçi satırlarını temizler; iletişim mesajlarını, kullanıcıları, makaleleri veya oturumları silmez. Yazma işlemleri transaction ile yapılır.

Günlük cPanel Cron Job için, sanal ortamın gerçek Node yolunu ve gerçek uygulama kökünü kullanın:

```text
15 3 * * * cd /home/KULLANICI/repositories/avburak-app && /home/KULLANICI/GERCEK_NODE_YOLU/node scripts/site-maintenance.mjs --prune-analytics --apply
```

Bu bir komut şablonudur; cPanel erişimi olmadığı için cron kurulmadı, canlı veriler silinmedi veya değiştirilmedi.

## Yayın

```bash
cd ~/repositories/avburak-app
git pull --ff-only origin main
CHECKPOINT_DISABLE=1 npx prisma generate
npx prisma migrate deploy
touch tmp/restart.txt
```

Yeni paket veya migration eklenmedi; önceki `conversion_events` migration'ının mevcut olması gerekir. `.next` yeni build ile gönderilir. GA4'in gerçek ortam değerleri ayrı olarak girilene kadar Google entegrasyonu kapalı kalır.

## Kontroller

GA4 izin/geri çekme, SEO, bakım, lint ve TypeScript kontrolleri geçti. Production HTTP kontrolü GA4 çalışma anında açıkken de yapıldı: eski/birinci taraf onayı Google izni vermedi, açık GA4 onayı izin verdi ve geri çekme izni kapattı. HTTP testleri tarayıcıda Google etiketi çalıştırmaz; gerçek Google hesabına test verisi gönderilmedi. Sahte test kimliği yalnız yerel test sürecinin ortamında kullanıldı, uygulama build'ine eklenmedi.

OneDrive `.next` manifestlerine çakışma kopyaları oluşturduğu için son başarılı build OneDrive dışındaki geçici bir klasörde alındı ve çıktısı projeye aktarıldı. Ardından proje klasöründen production sunucusu başlatılarak çıktı doğrulandı. OneDrive çakışma kopyaları ve geçici araçlar Git'e dahil edilmez.

```bash
node --conditions=react-server --import tsx scripts/verify-analytics.ts
node scripts/verify-maintenance.mjs
node --conditions=react-server --import tsx scripts/verify-seo.ts
npm run lint
npm run typecheck
npm run build
```

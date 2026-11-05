import type { Locale } from '@/i18n/locales';
import type { LegalPageContent } from './kvkk';

/**
 * Gizlilik Politikası / Privacy Policy - broader than the KVKK notice: site
 * usage, cookies, fonts and third-party resources, security posture. The two
 * documents overlap deliberately; a visitor should be able to read either one
 * on its own.
 *
 * <!-- REVIEW WITH COUNSEL: working draft, matching what this codebase
 * actually does today (no analytics, no font CDN, no tracking pixel, one
 * necessary cookie). Update immediately if any of that changes. -->
 */
export const privacyContent: Record<Locale, LegalPageContent> = {
  tr: {
    title: 'Gizlilik Politikası',
    updated: 'Son güncelleme: Eylül 2026',
    intro:
      'Bu gizlilik politikası, bu internet sitesinin ziyaret edilmesi ve iletişim formunun kullanılması sırasında hangi bilgilerin ne şekilde işlendiği hakkında genel bilgi vermek amacıyla hazırlanmıştır. Kişisel verilerinizin işlenmesine ilişkin ayrıntılı bilgi için KVKK Aydınlatma Metni’ne başvurunuz.',
    sections: [
      {
        heading: '1. Kapsam',
        body: 'Bu politika, internet sitesinin tüm sayfaları için geçerlidir. İletişim talepleri ve isteğe bağlı ziyaret istatistikleri için veri işlenir; reklam hedefleme veya yeniden pazarlama yapılmaz.',
      },
      {
        heading: '2. Çerezler ve İzleme',
        body: 'Dil tercihi ve yönetici oturumu için gerekli çerezler kullanılır. İzin verirseniz ziyaretler ile telefon, WhatsApp tıklamaları ve başarılı form gönderimi sayıları kendi sunucumuzda tutulur. GA4 ayrıca etkinleştirilmişse, Google’a aktarımın açıklandığı bildirimde yeni onayınız alınmadan Google etiketi yüklenmez. Eski birinci taraf analiz onayı GA4 onayı sayılmaz. GA4 sayfa, dil, etkileşim ve analiz çerezi bilgilerini Google’a iletebilir; bağlantı sırasında IP adresiniz Google tarafından görülebilir ve veriler yurt dışındaki sunucularda işlenebilir. Form içeriği, e-posta, telefon numarası ve URL sorgu parametreleri GA4 olaylarına eklenmez. Sayfa altındaki Çerez tercihleri düğmesiyle izninizi geri çekebilirsiniz.',
      },
      {
        heading: '3. Yazı Tipleri ve Üçüncü Taraf Kaynaklar',
        body: 'Yazı tipleri kendi sunucumuzdan sunulur. İletişim ve bölge sayfalarındaki Google Maps haritası yüklendiğinde Google sunucularına bağlantı kurulur; bu sırada IP adresiniz Google tarafından görülebilir ve Google kendi çerezlerini kullanabilir. Harita, isteğe bağlı birinci taraf ziyaret istatistiklerinden ayrı bir üçüncü taraf hizmetidir.',
      },
      {
        heading: '4. İletişim Formu',
        body: 'İletişim formu aracılığıyla iletilen bilgiler, yalnızca talebinizin değerlendirilmesi amacıyla kullanılır ve pazarlama iletişimi için kullanılmaz. Ayrıntılar için KVKK Aydınlatma Metni’ne bakınız.',
      },
      {
        heading: '5. Veri Güvenliği',
        body: 'İletilen veriler, yalnızca yetkili kişilerin erişimine açık bir ortamda saklanmaktadır. Makul teknik ve idari tedbirler alınmakta olup, internet üzerinden hiçbir iletimin veya hiçbir depolama sisteminin mutlak güvenlik sağlayamayacağı bilinmelidir.',
      },
      {
        heading: '6. Politikada Değişiklik',
        body: 'Bu gizlilik politikası, mevzuat değişiklikleri veya sitede yapılan değişiklikler doğrultusunda güncellenebilir. Güncel sürüm daima bu sayfada yayımlanır; önemli değişikliklerde güncelleme tarihi yukarıda belirtilir.',
      },
      {
        heading: '7. İletişim',
        body: 'Bu politikaya ilişkin sorularınız için iletişim sayfasında yer alan bilgiler üzerinden büroya ulaşabilirsiniz.',
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: September 2026',
    intro:
      'This privacy policy explains, in general terms, what information is processed and how while you browse this website or use the contact form. For details on how your personal data is processed, see the KVKK Privacy Notice.',
    sections: [
      {
        heading: '1. Scope',
        body: 'This policy applies to all pages of this website. Data supports contact requests and optional visit statistics; advertising targeting and remarketing are not used.',
      },
      {
        heading: '2. Cookies and Tracking',
        body: 'Necessary cookies support language preferences and administrator sessions. With permission, visits, phone and WhatsApp clicks, and successful form counts are stored on our server. If GA4 is enabled, its Google tag loads only after fresh consent to the notice explaining Google data sharing; existing first-party consent does not authorise GA4. GA4 may send page, language, interaction and analytics-cookie information to Google; Google can see your IP address during the connection and may process data on servers abroad. Form contents, email addresses, phone numbers and URL query parameters are not included in GA4 events. You can withdraw permission using Cookie preferences in the footer.',
      },
      {
        heading: '3. Fonts and Third-Party Resources',
        body: 'Fonts are served from our own server. When Google Maps on contact or regional pages loads, your browser connects to Google, which can see your IP address and may use its own cookies. Maps is a separate third-party service from the optional first-party visit statistics.',
      },
      {
        heading: '4. Contact Form',
        body: 'Information submitted through the contact form is used solely to assess your request, and is never used for marketing communication. See the KVKK Privacy Notice for further detail.',
      },
      {
        heading: '5. Data Security',
        body: 'Submitted data is stored in an environment accessible only to authorised individuals. Reasonable technical and administrative measures are in place, though no transmission over the internet or storage system can be guaranteed absolutely secure.',
      },
      {
        heading: '6. Changes to This Policy',
        body: 'This privacy policy may be updated to reflect changes in the law or on the site. The current version is always published on this page; the date above is updated whenever a material change is made.',
      },
      {
        heading: '7. Contact',
        body: 'For questions about this policy, you may reach the office through the details on the contact page.',
      },
    ],
  },
  ar: {
    title: 'سياسة الخصوصية',
    updated: 'آخر تحديث: سبتمبر 2026',
    intro:
      'توضح سياسة الخصوصية هذه، بشكل عام، ما هي المعلومات التي تتم معالجتها وكيفية ذلك أثناء تصفحكم لهذا الموقع أو استخدامكم لنموذج التواصل. للاطلاع على تفاصيل معالجة بياناتكم الشخصية، يرجى مراجعة نص الإفصاح الخاص بـ KVKK.',
    sections: [
      {
        heading: '1. النطاق',
        body: 'تسري هذه السياسة على جميع صفحات الموقع. تُعالج البيانات لطلبات التواصل وإحصاءات الزيارة الاختيارية، دون استهداف إعلاني أو إعادة تسويق.',
      },
      {
        heading: '2. ملفات تعريف الارتباط والتتبع',
        body: 'تُستخدم ملفات ضرورية للغة وجلسة المدير. بعد الموافقة، تُحفظ الزيارات ونقرات الهاتف وواتساب وعدد النماذج الناجحة على خادمنا. عند تفعيل GA4، لا تُحمّل علامة Google إلا بعد موافقة جديدة على إشعار يوضح مشاركة البيانات؛ الموافقة السابقة على تحليل الطرف الأول لا تكفي. قد تتلقى Google بيانات الصفحة واللغة والتفاعل وملفات التحليل، وقد ترى عنوان IP عند الاتصال وتعالج البيانات على خوادم خارج البلاد. لا تُضاف محتويات النماذج أو البريد أو أرقام الهاتف أو معاملات البحث في الروابط إلى أحداث GA4. يمكن سحب الموافقة من زر تفضيلات ملفات الارتباط أسفل الصفحة.',
      },
      {
        heading: '3. الخطوط والموارد من طرف ثالث',
        body: 'تُقدّم الخطوط من خادمنا. عند تحميل خرائط Google في صفحات التواصل أو المناطق، يتصل المتصفح بخوادم Google التي قد ترى عنوان IP وتستخدم ملفات تعريف ارتباط خاصة بها. الخرائط خدمة خارجية منفصلة عن إحصاءات الزيارة الاختيارية من الطرف الأول.',
      },
      {
        heading: '4. نموذج التواصل',
        body: 'تُستخدَم المعلومات المُرسَلة عبر نموذج التواصل فقط لتقييم طلبكم، ولا تُستخدَم أبداً لأغراض تسويقية. للمزيد من التفاصيل، يرجى مراجعة نص الإفصاح الخاص بـ KVKK.',
      },
      {
        heading: '5. أمن البيانات',
        body: 'تُخزَّن البيانات المُرسَلة في بيئة لا يمكن الوصول إليها إلا للأشخاص المخوّلين. تُتَّخذ تدابير تقنية وإدارية معقولة، مع العلم أنه لا يمكن ضمان أمان مطلق لأي عملية نقل عبر الإنترنت أو أي نظام تخزين.',
      },
      {
        heading: '6. التعديلات على هذه السياسة',
        body: 'يجوز تحديث سياسة الخصوصية هذه لتعكس التغييرات في التشريعات أو في الموقع. يُنشَر الإصدار الحالي دائماً على هذه الصفحة؛ ويُحدَّث التاريخ أعلاه عند إجراء أي تغيير جوهري.',
      },
      {
        heading: '7. التواصل',
        body: 'للاستفسارات المتعلقة بهذه السياسة، يمكنكم التواصل مع المكتب عبر البيانات الموجودة في صفحة الاتصال.',
      },
    ],
  },
};

import type { Locale } from '@/i18n/locales';

/**
 * KVKK Aydınlatma Metni (Data Controller's Disclosure Text under Law No.
 * 6698). Structured content rather than translation-file strings, because it
 * is a legal document with headings and paragraphs, not interface copy.
 *
 * <!-- REVIEW WITH COUNSEL: this is a working draft, written to match the
 * data this codebase actually collects (contact-form fields, hashed IP,
 * locale/session cookie only). It must be reviewed by the office's own
 * counsel before launch, in every language, and updated immediately if the
 * data collected ever changes (e.g. analytics, uploads, a newsletter). -->
 */

export type LegalSection = { heading: string; body: string };
export type LegalPageContent = {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

export const kvkkContent: Record<Locale, LegalPageContent> = {
  tr: {
    title: 'KVKK Aydınlatma Metni',
    updated: 'Son güncelleme: Eylül 2026',
    intro:
      'Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, bu internet sitesi üzerinden kişisel verilerinizin işlenmesine ilişkin olarak veri sorumlusu sıfatıyla Av. Burak Uğur Öztürk tarafından aydınlatma yükümlülüğünün yerine getirilmesi amacıyla hazırlanmıştır.',
    sections: [
      {
        heading: '1. Veri Sorumlusu',
        body: 'Bu internet sitesi kapsamında işlenen kişisel verileriniz bakımından veri sorumlusu, İstanbul Barosu’na kayıtlı avukat olarak faaliyet gösteren Av. Burak Uğur Öztürk’tür.',
      },
      {
        heading: '2. İşlenen Kişisel Veriler',
        body: 'İletişim formu aracılığıyla; ad soyad, e-posta adresi, telefon numarası (paylaşılması hâlinde) ve mesaj içeriğiniz işlenmektedir. Ayrıca form gönderiminde kötüye kullanımın önlenmesi amacıyla IP adresiniz geri döndürülemeyecek şekilde şifrelenerek (hash) kaydedilmekte, ham IP adresi hiçbir şekilde saklanmamaktadır.',
      },
      {
        heading: '3. İşleme Amaçları',
        body: 'Kişisel verileriniz; iletişim formu üzerinden ilettiğiniz talebin değerlendirilmesi, tarafınızla iletişime geçilmesi ve talep edilmesi hâlinde hukuki danışmanlık sürecinin yürütülmesi ile form gönderimlerinde kötüye kullanımın (spam, otomatik gönderim) önlenmesi amaçlarıyla sınırlı olarak işlenmektedir.',
      },
      {
        heading: '4. Hukuki Sebep',
        body: 'Kişisel verileriniz, KVKK’nın 5. maddesinin 2. fıkrasının (c) bendinde yer alan “bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması” hukuki sebebine, bu kapsama girmeyen işlemler bakımından ise açık rızanıza dayanılarak işlenmektedir.',
      },
      {
        heading: '5. Aktarım',
        body: 'Kişisel verileriniz, yalnızca kanuni bir yükümlülüğün yerine getirilmesi veya yetkili kamu kurum ve kuruluşlarının talebi hâlinde, ilgili mevzuatın öngördüğü sınırlar dahilinde aktarılabilir. Verileriniz, bu metinde belirtilenler dışında herhangi bir üçüncü kişiyle paylaşılmamakta, pazarlama amacıyla kullanılmamaktadır.',
      },
      {
        heading: '6. Saklama Süresi',
        body: 'Kişisel verileriniz, işlenme amacının gerektirdiği süre boyunca ve ilgili mevzuatta öngörülen zamanaşımı süreleri saklı kalmak kaydıyla saklanmakta, bu sürelerin sona ermesini müteakip silinmekte veya anonim hâle getirilmektedir.',
      },
      {
        heading: '7. KVKK Kapsamındaki Haklarınız',
        body: 'KVKK’nın 11. maddesi uyarınca; kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme, yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme, eksik veya yanlış işlenmişse düzeltilmesini isteme, KVKK’nın 7. maddesinde öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme, düzeltme ve silme işlemlerinin verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme, münhasıran otomatik sistemlerle analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme ve kanuna aykırı işleme sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme haklarına sahipsiniz.',
      },
      {
        heading: '8. Başvuru Yöntemi',
        body: 'Yukarıda sayılan haklarınızı kullanmak amacıyla taleplerinizi, iletişim sayfasında yer alan e-posta adresi üzerinden veya yazılı olarak büro adresine iletebilirsiniz. Başvurunuz, niteliğine göre en kısa sürede ve en geç otuz gün içinde sonuçlandırılır.',
      },
      {
        heading: '9. Çerezler',
        body: 'Bu internet sitesi; dil tercihinizi hatırlamak için gerekli, birinci taraf bir çerez dışında hiçbir çerez kullanmamaktadır. Üçüncü taraf analiz, reklam veya izleme amaçlı hiçbir çerez veya benzeri teknoloji bulunmamaktadır. Bu kapsam dışında bir çerez kullanılmaya başlanması hâlinde, ziyaretçilerden ayrıca onay alınacaktır.',
      },
    ],
  },
  en: {
    title: 'KVKK Information Notice',
    updated: 'Last updated: September 2026',
    intro:
      'This notice is prepared to fulfil the disclosure obligation under Law No. 6698 on the Protection of Personal Data (“KVKK”), regarding the processing of your personal data through this website by Av. Burak Uğur Öztürk, acting as data controller.',
    sections: [
      {
        heading: '1. Data Controller',
        body: 'The data controller for personal data processed through this website is Av. Burak Uğur Öztürk, an attorney registered with the Istanbul Bar Association.',
      },
      {
        heading: '2. Personal Data Processed',
        body: 'Through the contact form, the following are processed: your full name, email address, phone number (if provided) and the content of your message. In addition, your IP address is recorded only as an irreversible salted hash, for the purpose of preventing abuse of form submissions - the raw IP address is never stored.',
      },
      {
        heading: '3. Purposes of Processing',
        body: 'Your personal data is processed solely for assessing the request you submit through the contact form, contacting you, carrying out a legal consultation should you request one, and preventing abuse (spam, automated submissions) of the contact form.',
      },
      {
        heading: '4. Legal Basis',
        body: 'Your personal data is processed on the legal basis set out in article 5(2)(c) of the KVKK - being directly related to the establishment or performance of a contract - or, where that basis does not apply, on the basis of your explicit consent.',
      },
      {
        heading: '5. Transfer',
        body: 'Your personal data may only be transferred where required to fulfil a legal obligation, or upon the request of a competent public authority, within the limits set by applicable law. It is not shared with any third party beyond what is stated in this notice, and is not used for marketing.',
      },
      {
        heading: '6. Retention Period',
        body: 'Your personal data is retained for as long as the purpose of processing requires, subject to the statutory limitation periods under applicable law, and is deleted or anonymised once those periods expire.',
      },
      {
        heading: '7. Your Rights Under the KVKK',
        body: 'Under article 11 of the KVKK, you have the right to: learn whether your personal data is being processed; request information about such processing; learn the purpose of processing and whether it is used in line with that purpose; know the third parties to whom your data is transferred, domestically or abroad; request correction of incomplete or inaccurate data; request deletion or destruction of your data under the conditions set out in article 7; request that any correction or deletion be notified to third parties to whom the data was transferred; object to a result that is to your detriment arising solely from automated analysis; and claim compensation for damage arising from unlawful processing.',
      },
      {
        heading: '8. How to Apply',
        body: 'To exercise the rights listed above, you may submit your request via the email address on the contact page, or in writing to the office address. Your request will be resolved as soon as possible, and no later than thirty days.',
      },
      {
        heading: '9. Cookies',
        body: 'This website uses no cookie other than a necessary, first-party cookie that remembers your language preference. There is no third-party analytics, advertising or tracking cookie or similar technology. Should a cookie outside this scope ever be introduced, visitor consent will be obtained separately beforehand.',
      },
    ],
  },
  ar: {
    title: 'نص الإفصاح الخاص بحماية البيانات الشخصية (KVKK)',
    updated: 'آخر تحديث: سبتمبر 2026',
    intro:
      'أُعِدّ هذا النص للوفاء بالتزام الإفصاح بموجب القانون رقم 6698 بشأن حماية البيانات الشخصية ("KVKK")، فيما يتعلق بمعالجة بياناتكم الشخصية عبر هذا الموقع الإلكتروني من قبل المحامي بوراك أوغور أوزتورك، بصفته المتحكم بالبيانات.',
    sections: [
      {
        heading: '1. المتحكم بالبيانات',
        body: 'المتحكم بالبيانات الشخصية التي تُعالَج عبر هذا الموقع هو المحامي بوراك أوغور أوزتورك، المسجّل لدى نقابة المحامين في إسطنبول.',
      },
      {
        heading: '2. البيانات الشخصية التي تتم معالجتها',
        body: 'عبر نموذج التواصل، تتم معالجة: الاسم الكامل، والبريد الإلكتروني، ورقم الهاتف (في حال تقديمه)، ومحتوى رسالتكم. كما يُسجَّل عنوان IP الخاص بكم فقط بصيغة تجزئة (hash) مشفّرة لا يمكن عكسها، وذلك لغرض منع إساءة استخدام النموذج - ولا يُخزَّن عنوان IP الأصلي مطلقاً.',
      },
      {
        heading: '3. أغراض المعالجة',
        body: 'تُعالَج بياناتكم الشخصية فقط لغرض تقييم الطلب المُقدَّم عبر نموذج التواصل، والتواصل معكم، وتنفيذ عملية الاستشارة القانونية في حال طلبها، ومنع إساءة استخدام النموذج (الرسائل العشوائية، الإرسال الآلي).',
      },
      {
        heading: '4. الأساس القانوني',
        body: 'تُعالَج بياناتكم الشخصية استناداً إلى الأساس القانوني المنصوص عليه في المادة 5/2(ج) من قانون KVKK - كونها مرتبطة مباشرة بإنشاء أو تنفيذ عقد - أو، في حال عدم انطباق هذا الأساس، استناداً إلى موافقتكم الصريحة.',
      },
      {
        heading: '5. النقل',
        body: 'لا يجوز نقل بياناتكم الشخصية إلا في حال وجود التزام قانوني أو بناءً على طلب جهة عامة مختصة، وضمن الحدود التي تفرضها التشريعات المعمول بها. لا تتم مشاركة بياناتكم مع أي طرف ثالث خارج ما هو منصوص عليه في هذا النص، ولا تُستخدم لأغراض تسويقية.',
      },
      {
        heading: '6. مدة الاحتفاظ بالبيانات',
        body: 'تُحفَظ بياناتكم الشخصية طوال المدة التي يقتضيها غرض المعالجة، مع مراعاة مدد التقادم القانونية المنصوص عليها في التشريعات المعمول بها، وتُحذَف أو تُجعَل مجهولة الهوية عند انتهاء تلك المدد.',
      },
      {
        heading: '7. حقوقكم بموجب قانون KVKK',
        body: 'بموجب المادة 11 من قانون KVKK، يحق لكم: معرفة ما إذا كانت بياناتكم الشخصية تُعالَج أم لا؛ وطلب معلومات حول تلك المعالجة؛ ومعرفة غرض المعالجة ومدى استخدامها بما يتوافق مع ذلك الغرض؛ ومعرفة الأطراف الثالثة التي تُنقَل إليها بياناتكم، داخل البلاد أو خارجها؛ وطلب تصحيح البيانات الناقصة أو غير الدقيقة؛ وطلب حذف أو إتلاف بياناتكم وفق الشروط المنصوص عليها في المادة 7؛ وطلب إخطار الأطراف الثالثة التي نُقلت إليها البيانات بأي تصحيح أو حذف؛ والاعتراض على أي نتيجة ضارة بكم تنشأ حصراً عن تحليل آلي بحت؛ والمطالبة بالتعويض عن الضرر الناجم عن المعالجة غير القانونية.',
      },
      {
        heading: '8. كيفية تقديم الطلب',
        body: 'لممارسة الحقوق المذكورة أعلاه، يمكنكم تقديم طلبكم عبر البريد الإلكتروني المذكور في صفحة الاتصال، أو كتابياً إلى عنوان المكتب. سيُبَتّ في طلبكم في أقرب وقت ممكن، وفي موعد أقصاه ثلاثون يوماً.',
      },
      {
        heading: '9. ملفات تعريف الارتباط (الكوكيز)',
        body: 'لا يستخدم هذا الموقع أي ملف تعريف ارتباط باستثناء ملف ضروري من الطرف الأول يحفظ تفضيل اللغة لديكم. لا توجد أي ملفات تعريف ارتباط أو تقنيات مشابهة من طرف ثالث لأغراض التحليل أو الإعلان أو التتبع. وفي حال البدء باستخدام أي ملف تعريف ارتباط خارج هذا النطاق مستقبلاً، ستُؤخَذ موافقة الزوار على ذلك بشكل منفصل ومسبق.',
      },
    ],
  },
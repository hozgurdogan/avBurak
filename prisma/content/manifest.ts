/**
 * Seed manifest.
 *
 * Article bodies live next to this file as Markdown so that the seed script
 * stays readable and the copy can be reviewed as prose rather than as string
 * literals. Everything that is *metadata* - slugs, titles, summaries, SEO
 * fields, category assignments - is declared here.
 *
 * Slugs are Latin throughout, including for Arabic: the transliteration keeps
 * URLs copy-pasteable, avoids percent-encoded links in shared documents, and
 * matches the transliteration the admin editor applies when an author types an
 * Arabic title.
 */

export type SeedLocale = 'tr' | 'en' | 'ar';

export interface SeedCategory {
  slug: string;
  position: number;
  names: Record<SeedLocale, string>;
}

export interface SeedArticleTranslation {
  slug: string;
  title: string;
  summary: string;
  metaTitle: string;
  metaDescription: string;
}

export interface SeedArticleGroup {
  /** Directory under prisma/content that holds tr.md, en.md and ar.md. */
  key: string;
  /** Category slugs, referencing `seedCategories` below. */
  categories: string[];
  /** ISO date used as publishedAt for every locale of the group. */
  publishedAt: string;
  translations: Record<SeedLocale, SeedArticleTranslation>;
}

export const seedCategories: SeedCategory[] = [
  {
    slug: 'sirketler-hukuku',
    position: 1,
    names: {
      tr: 'Şirketler Hukuku',
      en: 'Corporate Law',
      ar: 'قانون الشركات',
    },
  },
  {
    slug: 'yabanci-yatirim',
    position: 2,
    names: {
      tr: 'Yabancı Yatırım',
      en: 'Foreign Investment',
      ar: 'الاستثمار الأجنبي',
    },
  },
  {
    slug: 'gayrimenkul-hukuku',
    position: 3,
    names: {
      tr: 'Gayrimenkul Hukuku',
      en: 'Real Estate Law',
      ar: 'قانون العقارات',
    },
  },
  {
    slug: 'ticari-sozlesmeler',
    position: 4,
    names: {
      tr: 'Ticari Sözleşmeler',
      en: 'Commercial Contracts',
      ar: 'العقود التجارية',
    },
  },
  {
    slug: 'tahkim-ve-uyusmazlik-cozumu',
    position: 5,
    names: {
      tr: 'Tahkim ve Uyuşmazlık Çözümü',
      en: 'Arbitration and Dispute Resolution',
      ar: 'التحكيم وتسوية المنازعات',
    },
  },
  {
    slug: 'kisisel-verilerin-korunmasi',
    position: 6,
    names: {
      tr: 'Kişisel Verilerin Korunması',
      en: 'Data Protection',
      ar: 'حماية البيانات الشخصية',
    },
  },
  // Added 2026-09-23 alongside the practice-area repositioning in
  // src/content/practice-areas.ts (see that file's comment for why the
  // three categories above are kept rather than removed). Slugs match
  // `practiceAreaSlugs` exactly so `getArticlesByCategory` in
  // src/lib/articles.ts resolves without a mapping table.
  {
    slug: 'is-hukuku',
    position: 7,
    names: {
      tr: 'İş Hukuku',
      en: 'Labour Law',
      ar: 'قانون العمل',
    },
  },
  {
    slug: 'icra-hukuku',
    position: 8,
    names: {
      tr: 'İcra Hukuku',
      en: 'Enforcement Law',
      ar: 'قانون التنفيذ',
    },
  },
  {
    slug: 'bosanma-aile-hukuku',
    position: 9,
    names: {
      tr: 'Boşanma ve Aile Hukuku',
      en: 'Divorce and Family Law',
      ar: 'قانون الطلاق والأسرة',
    },
  },
  {
    slug: 'kira-hukuku',
    position: 10,
    names: {
      tr: 'Kira Hukuku',
      en: 'Tenancy Law',
      ar: 'قانون الإيجار',
    },
  },
  {
    slug: 'miras-hukuku',
    position: 11,
    names: {
      tr: 'Miras Hukuku',
      en: 'Inheritance Law',
      ar: 'قانون الإرث',
    },
  },
];

export const seedArticleGroups: SeedArticleGroup[] = [
  {
    key: 'company-formation',
    categories: ['sirketler-hukuku', 'yabanci-yatirim'],
    publishedAt: '2026-02-11T09:00:00.000Z',
    translations: {
      tr: {
        slug: 'yabanci-yatirimcilar-icin-turkiyede-sirket-kurulusu',
        title: 'Yabancı Yatırımcılar İçin Türkiye’de Şirket Kuruluşu',
        summary:
          'Eşit muamele ilkesi, şirket türünün seçimi, kuruluş aşamaları ve tescil sonrası yükümlülükler bakımından Türk Ticaret Kanunu ve Doğrudan Yabancı Yatırımlar Kanunu çerçevesinde genel bir bakış.',
        metaTitle: 'Yabancı Yatırımcılar İçin Türkiye’de Şirket Kuruluşu',
        metaDescription:
          'Türkiye’de yabancı sermayeli şirket kuruluşu: şirket türü seçimi, asgari sermaye, apostil ve tercüme gereklilikleri, MERSİS ve ticaret sicili aşamaları ile tescil sonrası yükümlülükler.',
      },
      en: {
        slug: 'company-formation-in-turkiye-for-foreign-investors',
        title: 'Company Formation in Türkiye for Foreign Investors',
        summary:
          'An overview of equal treatment, the choice of corporate form, the stages of incorporation and the obligations that follow registration, under the Turkish Commercial Code and the Foreign Direct Investment Law.',
        metaTitle: 'Company Formation in Türkiye for Foreign Investors',
        metaDescription:
          'Incorporating a foreign-owned company in Türkiye: choice of corporate form, minimum capital, apostille and translation requirements, the MERSIS and trade registry stages, and post-registration obligations.',
      },
      ar: {
        slug: 'tasis-al-sharikat-fi-turkiya-lil-mustathmirin-al-ajanib',
        title: 'تأسيس الشركات في تركيا للمستثمرين الأجانب',
        summary:
          'عرض عام لمبدأ المساواة في المعاملة، واختيار شكل الشركة، ومراحل التأسيس، والالتزامات اللاحقة للقيد، في إطار قانون التجارة التركي وقانون الاستثمار الأجنبي المباشر.',
        metaTitle: 'تأسيس الشركات في تركيا للمستثمرين الأجانب',
        metaDescription:
          'تأسيس شركة برأس مال أجنبي في تركيا: اختيار شكل الشركة، والحد الأدنى لرأس المال، ومتطلبات الأبوستيل والترجمة، ومراحل نظام MERSIS والسجل التجاري، والالتزامات اللاحقة للقيد.',
      },
    },
  },
  {
    key: 'property-acquisition',
    categories: ['gayrimenkul-hukuku', 'yabanci-yatirim'],
    publishedAt: '2026-04-08T09:00:00.000Z',
    translations: {
      tr: {
        slug: 'yabancilarin-tasinmaz-edinimi-ve-tapu-sureci',
        title: 'Yabancıların Taşınmaz Edinimi ve Tapu Süreci',
        summary:
          'Tapu Kanunu’nun 35. maddesi çerçevesinde edinim sınırları, zorunlu değerleme raporu, döviz mevzuatı, tapu müdürlüğündeki işlem ve edinim sonrası yükümlülükler.',
        metaTitle: 'Yabancıların Türkiye’de Taşınmaz Edinimi ve Tapu Süreci',
        metaDescription:
          'Yabancıların Türkiye’de taşınmaz edinimi: kanuni sınırlar, askeri bölge uygunluk yazısı, zorunlu değerleme raporu, DASK, tapu harcı, satış vaadi sözleşmesi ve miras bakımından uygulanacak hukuk.',
      },
      en: {
        slug: 'real-estate-acquisition-and-title-deed-process-for-non-residents',
        title: 'Real Estate Acquisition and the Title Deed Process for Non-Residents',
        summary:
          'Acquisition limits under article 35 of the Land Registry Law, the mandatory valuation report, currency formalities, the transaction before the land registry, and obligations after acquisition.',
        metaTitle: 'Real Estate Acquisition in Türkiye for Non-Residents',
        metaDescription:
          'Acquiring immovable property in Türkiye as a foreign national: statutory limits, military zone clearance, the mandatory valuation report, compulsory earthquake insurance, transfer tax, promise-to-sell agreements and the law applicable to succession.',
      },
      ar: {
        slug: 'tamalluk-al-ajanib-lil-aqarat-wa-ijraat-al-tabu',
        title: 'تملّك الأجانب للعقارات وإجراءات السجل العقاري',
        summary:
          'حدود التملّك في إطار المادة 35 من قانون السجل العقاري، وتقرير التقييم الإلزامي، وقواعد النقد الأجنبي، والمعاملة أمام مديرية السجل العقاري، والالتزامات اللاحقة للتملّك.',
        metaTitle: 'تملّك الأجانب للعقارات في تركيا وإجراءات السجل العقاري',
        metaDescription:
          'تملّك العقارات في تركيا للأجانب: الحدود القانونية، وموافقة المناطق العسكرية، وتقرير التقييم الإلزامي، والتأمين الإلزامي ضد الزلازل، ورسم نقل الملكية، وعقد الوعد بالبيع، والقانون الواجب التطبيق على الميراث.',
      },
    },
  },
  {
    key: 'arbitration-clauses',
    categories: ['tahkim-ve-uyusmazlik-cozumu', 'ticari-sozlesmeler'],
    publishedAt: '2026-06-17T09:00:00.000Z',
    translations: {
      tr: {
        slug: 'sinir-otesi-sozlesmelerde-tahkim-sartlari',
        title: 'Sınır Ötesi Sözleşmelerde Tahkim Şartları',
        summary:
          'Milletlerarası Tahkim Kanunu ve New York Sözleşmesi çerçevesinde tahkime elverişlilik, şartın asgari unsurları, çok aşamalı şartlar, iptal ve tenfiz ile sık rastlanan kusurlu şartlar.',
        metaTitle: 'Sınır Ötesi Sözleşmelerde Tahkim Şartları',
        metaDescription:
          'Türk hukukuyla bağlantılı sözleşmelerde tahkim şartı: tahkime elverişlilik, tahkim yeri, hakem sayısı, dil, ayrılabilirlik ilkesi, geçici hukuki koruma, iptal davası ve yabancı hakem kararlarının tenfizi.',
      },
      en: {
        slug: 'arbitration-clauses-in-cross-border-contracts',
        title: 'Arbitration Clauses in Cross-Border Contracts',
        summary:
          'Arbitrability, the minimum content of a clause, multi-tier provisions, setting aside and enforcement, and the defective clauses seen most often — under the International Arbitration Law and the New York Convention.',
        metaTitle: 'Arbitration Clauses in Cross-Border Contracts',
        metaDescription:
          'Drafting an arbitration clause in a contract connected with Turkish law: arbitrability, seat, number of arbitrators, language, separability, interim relief, setting aside and enforcement of foreign awards.',
      },
      ar: {
        slug: 'shurut-al-tahkim-fi-al-uqud-abr-al-hudud',
        title: 'شروط التحكيم في العقود العابرة للحدود',
        summary:
          'قابلية النزاع للتحكيم، والمضمون الأدنى للشرط، والشروط متعددة المراحل، ودعوى البطلان والتنفيذ، والشروط المعيبة الشائعة، في إطار قانون التحكيم الدولي واتفاقية نيويورك.',
        metaTitle: 'شروط التحكيم في العقود العابرة للحدود',
        metaDescription:
          'صياغة شرط التحكيم في عقد متصل بالقانون التركي: قابلية النزاع للتحكيم، ومقر التحكيم، وعدد المحكَّمين، واللغة، واستقلال الشرط، والحماية المؤقتة، ودعوى البطلان، وتنفيذ الأحكام الأجنبية.',
      },
    },
  },
  // Added 2026-09-23: first six B2C/local-SEO articles from the report's
  // content plan, one per practice-area cluster (İş, İcra, Aile, Kira,
  // Miras clusters — İş covered twice). Dates are staggered ~2/week to
  // mirror the recommended publishing cadence.
  {
    key: 'ise-iade-basvuru',
    categories: ['is-hukuku'],
    publishedAt: '2026-09-23T09:00:00.000Z',
    translations: {
      tr: {
        slug: 'ise-iade-davasi-basvuru-suresi-ve-arabuluculuk',
        title: 'İşe İade Davası: Başvuru Süresi ve Zorunlu Arabuluculuk',
        summary:
          'İş güvencesi kapsamındaki bir işçi için bir aylık zorunlu arabuluculuk başvuru süresi, arabuluculuk sürecinin işleyişi ve anlaşma sağlanamazsa dava açma süresi.',
        metaTitle: 'İşe İade Davası: Başvuru Süresi ve Zorunlu Arabuluculuk',
        metaDescription:
          'İşe iade davasında bir aylık arabuluculuk başvuru süresi, arabuluculuk süreci, anlaşma sağlanamazsa iki haftalık dava açma süresi ve sık yapılan usul hataları.',
      },
      en: {
        slug: 'reinstatement-lawsuit-deadlines-and-mandatory-mediation',
        title: 'Reinstatement Lawsuit: Deadlines and Mandatory Mediation',
        summary:
          'The one-month deadline to apply for mandatory mediation for an employee covered by job security, how mediation works, and the deadline to sue if no settlement is reached.',
        metaTitle: 'Reinstatement Lawsuit: Deadlines and Mandatory Mediation',
        metaDescription:
          'The one-month mediation application deadline in a reinstatement case, how mediation works, the two-week deadline to sue if no settlement is reached, and common procedural mistakes.',
      },
      ar: {
        slug: 'dawa-al-awda-ila-al-amal-al-muhal-wa-al-wasata-al-ilzamiya',
        title: 'دعوى العودة إلى العمل: المهل والوساطة الإلزامية',
        summary:
          'مهلة الشهر الواحد للتقدم بطلب الوساطة الإلزامية للعامل المشمول بضمان الوظيفة، وسير عملية الوساطة، ومهلة رفع الدعوى في حال عدم التوصل إلى اتفاق.',
        metaTitle: 'دعوى العودة إلى العمل: المهل والوساطة الإلزامية',
        metaDescription:
          'مهلة الشهر الواحد للتقدم بطلب الوساطة في دعوى العودة إلى العمل، وسير عملية الوساطة، ومهلة الأسبوعين لرفع الدعوى، والأخطاء الإجرائية الشائعة.',
      },
    },
  },
  {
    key: 'odeme-emrine-itiraz',
    categories: ['icra-hukuku'],
    publishedAt: '2026-09-26T09:00:00.000Z',
    translations: {
      tr: {
        slug: 'odeme-emrine-itiraz-suresi-ve-sonuclari',
        title: 'Ödeme Emrine İtiraz: Süre ve Sonuçları',
        summary:
          'İlamsız icra takibinde ödeme emrine itirazın yedi günlük süresi, itirazın takibi kendiliğinden durdurma etkisi ve alacaklının itirazın kaldırılması ile itirazın iptali yolları.',
        metaTitle: 'Ödeme Emrine İtiraz: Süre ve Sonuçları',
        metaDescription:
          'Ödeme emrine yedi gün içinde itiraz etmenin sonuçları, takibin kendiliğinden durması, alacaklının itirazın kaldırılması ve itirazın iptali davası seçenekleri.',
      },
      en: {
        slug: 'objecting-to-a-payment-order-deadline-and-effects',
        title: 'Objecting to a Payment Order: Deadline and Effects',
        summary:
          'The seven-day deadline to object to a payment order in an enforcement proceeding without a judgment, the automatic-stay effect of an objection, and the creditor\'s two routes to overcome it.',
        metaTitle: 'Objecting to a Payment Order: Deadline and Effects',
        metaDescription:
          'The seven-day deadline to object to a payment order, the effect of an objection on enforcement, and the creditor\'s options: setting the objection aside or an action to annul it.',
      },
      ar: {
        slug: 'al-itirad-ala-amr-al-daf-al-muhla-wa-al-nataij',
        title: 'الاعتراض على أمر الدفع: المهلة والنتائج',
        summary:
          'مهلة الأيام السبعة للاعتراض على أمر الدفع في التنفيذ بدون حكم، وأثر الاعتراض في وقف التنفيذ تلقائيًا، والطريقان اللذان يمكن للدائن اتباعهما.',
        metaTitle: 'الاعتراض على أمر الدفع: المهلة والنتائج',
        metaDescription:
          'مهلة الأيام السبعة للاعتراض على أمر الدفع، وأثر الاعتراض في وقف إجراءات التنفيذ، وخيارا الدائن: رفع الاعتراض أو دعوى إبطال الاعتراض.',
      },
    },
  },
  {
    key: 'anlasmali-bosanma-protokolu',
    categories: ['bosanma-aile-hukuku'],
    publishedAt: '2026-09-30T09:00:00.000Z',
    translations: {
      tr: {
        slug: 'anlasmali-bosanma-protokolunde-bulunmasi-gerekenler',
        title: 'Anlaşmalı Boşanma Protokolünde Bulunması Gerekenler',
        summary:
          'Anlaşmalı boşanmanın bir yıllık evlilik süresi şartı, protokolde yer alması gereken yedi unsur (velayet, nafaka, tazminat, mal rejimi dahil) ve duruşmanın işleyişi.',
        metaTitle: 'Anlaşmalı Boşanma Protokolünde Bulunması Gerekenler',
        metaDescription:
          'Anlaşmalı boşanma şartları, protokolde bulunması gereken velayet, nafaka, tazminat ve mal rejimi hükümleri, duruşma süreci ve sık yapılan hatalar.',
      },
      en: {
        slug: 'what-an-uncontested-divorce-protocol-must-include',
        title: 'What an Uncontested Divorce Protocol Must Include',
        summary:
          'The one-year marriage requirement for an uncontested divorce, the seven elements a protocol must cover (custody, alimony, compensation, and property regime included), and how the hearing proceeds.',
        metaTitle: 'What an Uncontested Divorce Protocol Must Include',
        metaDescription:
          'Conditions for an uncontested divorce, the custody, alimony, compensation and property-regime terms a protocol must include, how the court hearing proceeds, and common mistakes.',
      },
      ar: {
        slug: 'ma-yajib-an-yatadamanahu-brotokol-al-talaq-bil-taradi',
        title: 'ما يجب أن يتضمنه بروتوكول الطلاق بالتراضي',
        summary:
          'شرط استمرار الزواج لمدة سنة واحدة للطلاق بالتراضي، والعناصر السبعة الواجب تضمينها في البروتوكول (الحضانة والنفقة والتعويض وتصفية النظام المالي)، وسير الجلسة.',
        metaTitle: 'ما يجب أن يتضمنه بروتوكول الطلاق بالتراضي',
        metaDescription:
          'شروط الطلاق بالتراضي، وأحكام الحضانة والنفقة والتعويض وتصفية النظام المالي الواجب توفرها في البروتوكول، وسير جلسة المحكمة، والأخطاء الشائعة.',
      },
    },
  },
  {
    key: 'tahliye-taahhudu',
    categories: ['kira-hukuku'],
    publishedAt: '2026-10-03T09:00:00.000Z',
    translations: {
      tr: {
        slug: 'tahliye-taahhudu-ne-zaman-gecerlidir',
        title: 'Tahliye Taahhüdü Ne Zaman Geçerlidir?',
        summary:
          'Tahliye taahhüdünün geçerli sayılması için kira sözleşmesi kurulduktan sonra imzalanması gerekliliği, bir aylık başvuru süresi ve icra ile dava yoluyla tahliye seçenekleri.',
        metaTitle: 'Tahliye Taahhüdü Ne Zaman Geçerlidir?',
        metaDescription:
          'Tahliye taahhüdünün geçerlilik şartı olan imza zamanlaması, bir aylık tahliye başvuru süresi, icra yoluyla ve dava yoluyla tahliye seçenekleri ile sık yapılan hatalar.',
      },
      en: {
        slug: 'when-is-a-vacation-commitment-valid',
        title: 'When Is a Vacation Commitment Valid?',
        summary:
          'Why a vacation commitment must be signed after the lease is formed to be valid, the one-month deadline to apply for eviction, and the two available eviction routes.',
        metaTitle: 'When Is a Vacation Commitment Valid?',
        metaDescription:
          'The timing requirement for a valid vacation commitment, the one-month deadline to apply for eviction, eviction through enforcement versus litigation, and common mistakes.',
      },
      ar: {
        slug: 'mata-yakun-tahhud-al-ikhla-sahihan',
        title: 'متى يكون تعهد الإخلاء صحيحًا؟',
        summary:
          'ضرورة توقيع تعهد الإخلاء بعد إنشاء عقد الإيجار لكي يكون صحيحًا، ومهلة الشهر الواحد للتقدم بطلب الإخلاء، وطريقا الإخلاء عن طريق التنفيذ والدعوى.',
        metaTitle: 'متى يكون تعهد الإخلاء صحيحًا؟',
        metaDescription:
          'شرط توقيت توقيع تعهد الإخلاء الصحيح، ومهلة الشهر الواحد للتقدم بطلب الإخلاء، والإخلاء عن طريق التنفيذ أو الدعوى، والأخطاء الشائعة.',
      },
    },
  },
  {
    key: 'kidem-tazminati-sartlari',
    categories: ['is-hukuku'],
    publishedAt: '2026-10-07T09:00:00.000Z',
    translations: {
      tr: {
        slug: 'kidem-tazminati-hangi-hallerde-alinir',
        title: 'Kıdem Tazminatı Hangi Hallerde Alınır?',
        summary:
          'Kıdem tazminatına hak kazanmanın bir yıllık kıdem şartı, tazminatın ödendiği fesih halleri (haklı fesih, emeklilik, evlilik, askerlik dahil) ve ödenmeyen haller.',
        metaTitle: 'Kıdem Tazminatı Hangi Hallerde Alınır?',
        metaDescription:
          'Kıdem tazminatı şartları: bir yıllık kıdem, hangi fesih hallerinde ödendiği, hangi hallerde ödenmediği, hesaplamanın esası ve tavan uygulaması.',
      },
      en: {
        slug: 'when-is-severance-pay-owed',
        title: 'When Is Severance Pay Owed?',
        summary:
          'The one-year service requirement for severance pay, the terminations that trigger it (just-cause termination, retirement, marriage, military service included), and when it is not owed.',
        metaTitle: 'When Is Severance Pay Owed?',
        metaDescription:
          'Severance pay conditions: the one-year service requirement, which terminations trigger it, when it is not owed, and the basis of calculation and statutory cap.',
      },
      ar: {
        slug: 'mata-yustahaqq-tawidh-nihayat-al-khidma',
        title: 'متى يُستحق تعويض نهاية الخدمة؟',
        summary:
          'شرط الخدمة لمدة سنة واحدة لاستحقاق تعويض نهاية الخدمة، وحالات الإنهاء التي تُستحق فيها (الإنهاء لسبب مشروع والتقاعد والزواج والخدمة العسكرية)، والحالات التي لا يُستحق فيها.',
        metaTitle: 'متى يُستحق تعويض نهاية الخدمة؟',
        metaDescription:
          'شروط تعويض نهاية الخدمة: خدمة سنة واحدة، وحالات الإنهاء التي يُستحق فيها التعويض، والحالات التي لا يُستحق فيها، وأساس الاحتساب والحد الأقصى القانوني.',
      },
    },
  },
  {
    key: 'mirasin-reddi',
    categories: ['miras-hukuku'],
    publishedAt: '2026-10-10T09:00:00.000Z',
    translations: {
      tr: {
        slug: 'mirasin-reddi-uc-aylik-sure-ve-sonuclari',
        title: 'Mirasın Reddi: Üç Aylık Süre ve Sonuçları',
        summary:
          'Mirasın reddi için üç aylık hak düşürücü sürenin başlangıcı, ret usulü, kimlerin reddedebileceği ve hükmen ret hâli.',
        metaTitle: 'Mirasın Reddi: Üç Aylık Süre ve Sonuçları',
        metaDescription:
          'Mirasın reddi için üç aylık süre, sürenin başlangıcı, ret usulü, kimlerin reddedebileceği, hükmen ret hâli ve sık yapılan hatalar.',
      },
      en: {
        slug: 'disclaiming-an-inheritance-the-three-month-deadline',
        title: 'Disclaiming an Inheritance: The Three-Month Deadline',
        summary:
          'When the three-month deadline to disclaim an inheritance starts, how to disclaim, who may disclaim, and deemed disclaimer by operation of law.',
        metaTitle: 'Disclaiming an Inheritance: The Three-Month Deadline',
        metaDescription:
          'The three-month deadline to disclaim an inheritance, when it starts, how to disclaim, who may disclaim, deemed disclaimer, and common mistakes.',
      },
      ar: {
        slug: 'rad-al-tarika-mahlat-al-thalatha-ashhur-wa-nataijuha',
        title: 'رد التركة: مهلة الأشهر الثلاثة ونتائجها',
        summary:
          'بداية مهلة الأشهر الثلاثة السقوطية لرد التركة، وكيفية الرد، ومن يحق له الرد، وحالة الرد الحكمي بحكم القانون.',
        metaTitle: 'رد التركة: مهلة الأشهر الثلاثة ونتائجها',
        metaDescription:
          'مهلة الأشهر الثلاثة لرد التركة، وبداية احتسابها، وكيفية الرد، ومن يحق له الرد، وحالة الرد الحكمي، والأخطاء الشائعة.',
      },
    },
  },
];

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
];

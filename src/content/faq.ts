import type { Locale } from '@/i18n/locales';

/**
 * FAQ content. Structured here rather than as `messages/*.json` interface
 * strings for the same reason as `legal/kvkk.ts` and `legal/privacy.ts`: this
 * is prose organised into headings and paragraphs, not short UI copy, and
 * keeping it as data means the page component stays a plain renderer.
 *
 * Every answer here is general legal information, consistent with the site's
 * one absolute rule for this kind of content: nothing case-specific, no
 * outcome or success claims, no client detail of any kind.
 */

export type FaqItem = { question: string; answer: string };
export type FaqCategory = { heading: string; items: FaqItem[] };
export type FaqPageContent = {
  meta: { title: string; description: string };
  label: string;
  title: string;
  lead: string;
  categories: FaqCategory[];
  note: string;
};

export const faqContent: Record<Locale, FaqPageContent> = {
  tr: {
    meta: {
      title: 'Sıkça Sorulan Sorular',
      description:
        'Büronun çalışma şekli ve iş hukuku, icra hukuku, kira hukuku, boşanma ve aile hukuku, tahkim ile KVKK alanlarında sıkça sorulan sorular.',
    },
    label: 'SSS',
    title: 'Sıkça Sorulan Sorular',
    lead: 'Aşağıdaki sorular ve yanıtlar genel bilgilendirme amaçlıdır; somut bir mesele hakkında görüş için iletişim formunu kullanabilirsiniz.',
    categories: [
      {
        heading: 'Genel',
        items: [
          {
            question: 'Sitenizde yer alan bilgiler hukuki tavsiye niteliğinde mi?',
            answer:
              'Hayır. Sitede yer alan içerikler yalnızca genel bilgilendirme amaçlıdır ve avukat-müvekkil ilişkisi doğurmaz. Somut bir hukuki mesele hakkında karar vermeden önce, durumunuza özel hukuki görüş almanız gerekir.',
          },
          {
            question: 'Randevu almadan önce dosyamla ilgili ön bilgi verebilir misiniz?',
            answer:
              'Genel süreç ve mevzuat hakkında ön bilgi verilebilir; ancak dosyaya özel değerlendirme, ilgili belgelerin incelenmesini gerektirir. Bu nedenle detaylı değerlendirme için bir görüşme planlanması önerilir.',
          },
          {
            question: 'Yabancı dilde hizmet alabilir miyim?',
            answer: 'Büro Türkçe, İngilizce ve Arapça dillerinde hizmet vermektedir.',
          },
          {
            question: 'Görüşmeler yüz yüze mi, uzaktan mı yapılıyor?',
            answer:
              'Talebe göre hem ofiste yüz yüze hem de görüntülü/telefon görüşmesi şeklinde randevu planlanabilir.',
          },
        ],
      },
      {
        heading: 'Şirketler Hukuku',
        items: [
          {
            question: "Türkiye'de şirket kurmak için hangi belgeler gerekiyor?",
            answer:
              'Şirket türüne göre değişmekle birlikte genel olarak kurucuların kimlik bilgileri, esas sözleşme taslağı, sermaye tutarı ve varsa yabancı ortaklara ilişkin belgeler gerekir. Sürecin başında dosyanıza özel bir kontrol listesi hazırlanabilir.',
          },
          {
            question: 'Şirket türü seçimi (limited/anonim) neye göre yapılmalı?',
            answer:
              'Ortak sayısı, sermaye yapısı, gelecekteki yatırım/pay devri planları ve vergisel unsurlar bu seçimi etkiler. Bu nedenle her iki türün avantaj ve dezavantajlarının somut duruma göre değerlendirilmesi önerilir.',
          },
          {
            question: 'Pay devri işlemi ne kadar sürer?',
            answer:
              'Şirket türüne, esas sözleşmedeki devir kısıtlamalarına ve tarafların hazırlık durumuna göre değişir; genel kurul veya devir sözleşmesi süreçleri süreyi etkileyen unsurlardır.',
          },
        ],
      },
      {
        heading: 'Kira Hukuku',
        items: [
          {
            question: 'Kiracı, kira sözleşmesini süresinden önce feshedebilir mi?',
            answer:
              'Sözleşmede erken fesih hakkı düzenlenmişse bu hükme göre hareket edilir; düzenlenmemişse tarafların anlaşması veya kanunda öngörülen haklı sebeplerin varlığı aranır.',
          },
          {
            question: 'Kira bedeli artışı hangi sınırlara tabidir?',
            answer:
              'Konut ve çatılı işyeri kiralarında artış oranı, bir önceki kira yılına ait tüketici fiyat endeksindeki (TÜFE) değişim oranını geçemez; sözleşmede farklı bir oran kararlaştırılmışsa da bu üst sınır esas alınır.',
          },
          {
            question: 'Kiraya veren, kiracıyı hangi hallerde tahliye edebilir?',
            answer:
              'Kira bedelinin ödenmemesi, sözleşmeye aykırı kullanım, kiraya verenin veya yakınlarının konut ihtiyacı, yeniden inşa/imar gibi kanunda sayılan belirli sebeplerin varlığı halinde tahliye talep edilebilir; her sebep için ayrı usul ve süre şartları vardır.',
          },
          {
            question: 'Tahliye taahhüdü nedir, nasıl geçerli olur?',
            answer:
              'Kiracının belirli bir tarihte taşınmazı boşaltacağını yazılı olarak taahhüt ettiği belgedir; geçerli olması için kiracı tarafından kira sözleşmesi kurulduktan sonra serbest iradeyle imzalanmış olması gerekir.',
          },
        ],
      },
      {
        heading: 'İcra Hukuku',
        items: [
          {
            question: 'İcra takibi nasıl başlatılır?',
            answer:
              'Alacaklının, alacağına dayanak oluşturan belge ve bilgilerle icra dairesine başvurarak ilamlı veya ilamsız icra takibi başlatması yoluyla süreç işletilir.',
          },
          {
            question: 'Borçlu, icra takibine nasıl itiraz edebilir?',
            answer:
              'İlamsız takiplerde borçlu, ödeme emrinin tebliğinden itibaren yasal süre içinde icra dairesine itiraz ederek takibi durdurabilir; itirazın kaldırılması veya itirazın iptali gibi sonraki aşamalar alacaklı tarafından işletilebilir.',
          },
          {
            question: 'Haciz işlemi hangi mallar üzerinde uygulanabilir?',
            answer:
              'Kural olarak borçlunun haczedilebilir nitelikteki taşınır ve taşınmaz malları ile alacakları haczedilebilir; kanunda sayılan bazı mal ve haklar (örneğin belirli asgari geçim kalemleri) haciz dışında tutulmuştur.',
          },
          {
            question: 'İflas ve icra takibi arasındaki fark nedir?',
            answer:
              'İcra takibi, belirli bir alacağın tahsiline yönelik bireysel bir yoldur; iflas ise borçlunun mal varlığının tüm alacaklılar için topluca tasfiyesini amaçlayan kolektif bir süreçtir ve yalnızca iflasa tabi borçlular hakkında uygulanabilir.',
          },
        ],
      },
      {
        heading: 'İş Hukuku',
        items: [
          {
            question: 'İşçi, haklı nedenle iş sözleşmesini feshedebilir mi?',
            answer:
              "İş Kanunu'nun ilgili maddesinde sayılan hallerin (ücretin ödenmemesi, sağlık sebepleri, ahlak ve iyiniyet kurallarına aykırılık gibi) varlığı halinde işçi, sözleşmeyi haklı nedenle derhal feshedebilir ve buna bağlı bazı tazminat haklarına sahip olabilir.",
          },
          {
            question: 'Kıdem ve ihbar tazminatı arasındaki fark nedir?',
            answer:
              'Kıdem tazminatı, belirli koşullarla kanunda sayılan sona erme hallerinde çalışma süresine bağlı olarak ödenir; ihbar tazminatı ise fesih bildirim sürelerine uyulmaması halinde karşı tarafa ödenen bir tazminattır.',
          },
          {
            question: 'İşe iade davası açma süresi ne kadardır?',
            answer:
              'İş sözleşmesinin geçersiz feshedildiğini düşünen işçi, fesih bildiriminin tebliğinden itibaren kanunda öngörülen süre içinde arabuluculuğa başvurmalı, anlaşma sağlanamazsa dava süreci işletilebilir.',
          },
          {
            question: 'Fazla mesai ücreti nasıl hesaplanır ve ispatlanır?',
            answer:
              'Fazla çalışma, haftalık normal çalışma süresinin aşılması halinde söz konusu olur ve ücreti kanunda öngörülen zamlı oranla hesaplanır; ispat genellikle yazılı belgeler, tanık beyanı veya işyeri kayıtlarına dayanır.',
          },
        ],
      },
      {
        heading: 'Tahkim ve Uyuşmazlık Çözümü',
        items: [
          {
            question: 'Tahkim ile dava arasındaki fark nedir?',
            answer:
              'Tahkimde uyuşmazlık, taraflarca seçilen hakem(ler) tarafından çözülür ve genellikle daha hızlı, gizli bir süreçtir. Dava ise devlet mahkemelerinde yürütülen kamuya açık bir yargılamadır.',
          },
          {
            question: "Yabancı bir hakem kararı Türkiye'de nasıl tenfiz edilir?",
            answer:
              'New York Sözleşmesi çerçevesinde, ilgili hakem kararının Türk mahkemelerinde tenfiz davası yoluyla tanınması ve icra edilebilir hale getirilmesi gerekir.',
          },
          {
            question: 'Sözleşmeye tahkim şartı koymak zorunlu mu?',
            answer:
              'Hayır, ancak taraflar uyuşmazlık halinde tahkimi tercih ediyorsa bunun sözleşmede açıkça ve geçerli şekilde düzenlenmesi gerekir.',
          },
        ],
      },
      {
        heading: 'Kişisel Verilerin Korunması (KVKK)',
        items: [
          {
            question: "Her şirketin KVKK uyum çalışması yapması zorunlu mu?",
            answer:
              'Kişisel veri işleyen tüm gerçek ve tüzel kişiler KVKK kapsamındadır; şirketin büyüklüğü ve veri işleme faaliyetinin niteliğine göre yükümlülükler farklılaşabilir.',
          },
          {
            question: 'Veri ihlali durumunda ne yapılmalı?',
            answer:
              "Kişisel Verileri Koruma Kurumu'na ve etkilenen ilgili kişilere yasal süreler içinde bildirim yapılması gerekir; bildirim süreci ve içeriği ihlalin niteliğine göre planlanmalıdır.",
          },
          {
            question: 'Aydınlatma metni ve açık rıza arasındaki fark nedir?',
            answer:
              'Aydınlatma metni, veri işleme faaliyeti hakkında ilgili kişiyi bilgilendirme yükümlülüğüdür; açık rıza ise belirli işleme faaliyetleri için ilgili kişinin özgür iradesiyle verdiği onaydır. Her veri işleme faaliyeti açık rıza gerektirmez.',
          },
        ],
      },
    ],
    note: 'Bu SSS içeriği genel bilgilendirme amaçlıdır, hukuki tavsiye niteliği taşımaz. Sorularınızı büronun iletişim formu üzerinden iletebilirsiniz.',
  },
  en: {
    meta: {
      title: 'Frequently Asked Questions',
      description:
        'Frequently asked questions about how the office works and about labour law, enforcement law, tenancy law, divorce and family law, arbitration, and data protection.',
    },
    label: 'FAQ',
    title: 'Frequently Asked Questions',
    lead: 'The questions and answers below are for general information; use the contact form for an opinion on a specific matter.',
    categories: [
      {
        heading: 'General',
        items: [
          {
            question: 'Is the information on this site legal advice?',
            answer:
              'No. The content on this site is for general information only and does not create an attorney-client relationship. Before deciding on a specific legal matter, you should obtain legal advice tailored to your situation.',
          },
          {
            question: 'Can you give preliminary information about my case before I book an appointment?',
            answer:
              'General information about procedure and legislation can be given; a case-specific assessment, however, requires reviewing the relevant documents. A meeting is recommended for a detailed assessment.',
          },
          {
            question: 'Can I be served in a foreign language?',
            answer: 'The office provides services in Turkish, English, and Arabic.',
          },
          {
            question: 'Are meetings held in person or remotely?',
            answer:
              'Appointments can be arranged either in person at the office or by video/phone call, depending on your preference.',
          },
        ],
      },
      {
        heading: 'Corporate Law',
        items: [
          {
            question: 'What documents are required to establish a company in Turkey?',
            answer:
              "This varies by company type, but generally the founders' identity documents, a draft articles of association, the amount of capital, and, where applicable, documents for foreign shareholders are required. A checklist tailored to your file can be prepared at the outset.",
          },
          {
            question: 'What should the choice of company type (limited/joint-stock) be based on?',
            answer:
              'The number of shareholders, the capital structure, future investment or share-transfer plans, and tax considerations all affect this choice. Evaluating the advantages and disadvantages of each type against your specific circumstances is recommended.',
          },
          {
            question: 'How long does a share transfer take?',
            answer:
              "It depends on the company type, any transfer restrictions in the articles of association, and how prepared the parties are; the general assembly or transfer-agreement process are among the factors that affect the timeline.",
          },
        ],
      },
      {
        heading: 'Tenancy Law',
        items: [
          {
            question: 'Can a tenant terminate the lease before its term ends?',
            answer:
              'If the lease provides an early-termination right, that clause governs; if not, either the parties must agree or one of the just causes recognised by law must be present.',
          },
          {
            question: 'What limits apply to rent increases?',
            answer:
              'For residential and covered-workplace leases, the increase rate cannot exceed the change in the twelve-month average consumer price index (CPI) for the preceding rental year; this ceiling applies even if the lease sets a different rate.',
          },
          {
            question: 'On what grounds can a landlord evict a tenant?',
            answer:
              "Eviction may be sought on grounds set out in law, such as non-payment of rent, use contrary to the lease, the landlord's or a close relative's need for housing, or reconstruction/redevelopment; each ground has its own procedure and time limits.",
          },
          {
            question: 'What is a vacation commitment, and when is it valid?',
            answer:
              'It is a document in which the tenant undertakes in writing to vacate the property by a specific date; to be valid, it must be signed by the tenant of their own free will after the lease has already been formed.',
          },
        ],
      },
      {
        heading: 'Enforcement Law',
        items: [
          {
            question: 'How is an enforcement proceeding (icra takibi) started?',
            answer:
              'The creditor applies to the enforcement office with the documents and information supporting the claim, initiating either a judgment-based or a judgment-free enforcement proceeding.',
          },
          {
            question: 'How can a debtor object to an enforcement proceeding?',
            answer:
              'In judgment-free proceedings, the debtor can halt the proceeding by objecting to the enforcement office within the statutory period after service of the payment order; the creditor may then pursue the annulment or removal of that objection.',
          },
          {
            question: 'What assets can a seizure (haciz) be applied to?',
            answer:
              "As a rule, the debtor's attachable movable and immovable property and receivables can be seized; certain assets and rights listed in law (for example, certain minimum subsistence items) are exempt from seizure.",
          },
          {
            question: 'What is the difference between bankruptcy and an enforcement proceeding?',
            answer:
              "An enforcement proceeding is an individual route to collect a specific debt; bankruptcy is a collective process aimed at liquidating the debtor's entire assets for all creditors together, and it applies only to debtors subject to bankruptcy.",
          },
        ],
      },
      {
        heading: 'Labour Law',
        items: [
          {
            question: 'Can an employee terminate the employment contract for just cause?',
            answer:
              'Where one of the grounds listed in the relevant article of the Labour Law is present (such as unpaid wages, health reasons, or conduct contrary to good faith and morality), the employee may terminate the contract immediately for just cause and may be entitled to certain related compensation.',
          },
          {
            question: 'What is the difference between severance pay and notice pay?',
            answer:
              'Severance pay is paid, subject to certain conditions, for termination grounds listed in law, based on length of service; notice pay is compensation owed to the other party when the statutory notice periods for termination are not observed.',
          },
          {
            question: 'How long do I have to file a reinstatement lawsuit?',
            answer:
              'An employee who believes their contract was invalidly terminated must apply for mediation within the period set by law after service of the termination notice; if no settlement is reached, litigation may follow.',
          },
          {
            question: 'How is overtime pay calculated and proven?',
            answer:
              'Overtime arises when the normal weekly working time is exceeded, and it is paid at the premium rate set by law; proof usually relies on written records, witness statements, or workplace records.',
          },
        ],
      },
      {
        heading: 'Arbitration and Dispute Resolution',
        items: [
          {
            question: 'What is the difference between arbitration and litigation?',
            answer:
              'In arbitration, the dispute is resolved by an arbitrator or arbitrators chosen by the parties, and the process is generally faster and confidential. Litigation, by contrast, is a public proceeding conducted before state courts.',
          },
          {
            question: 'How is a foreign arbitral award recognised in Turkey?',
            answer:
              'Under the framework of the New York Convention, the arbitral award must be recognised and made enforceable through a recognition-and-enforcement (tenfiz) action before Turkish courts.',
          },
          {
            question: 'Is it mandatory to include an arbitration clause in a contract?',
            answer:
              'No, but if the parties want to use arbitration for future disputes, the clause must be included in the contract clearly and validly.',
          },
        ],
      },
      {
        heading: 'Data Protection (KVKK)',
        items: [
          {
            question: 'Must every company carry out KVKK compliance work?',
            answer:
              'All natural and legal persons who process personal data fall within the scope of the Data Protection Law (KVKK); the specific obligations vary with the size of the company and the nature of its data-processing activities.',
          },
          {
            question: 'What should be done in the event of a data breach?',
            answer:
              'Notification must be made to the Personal Data Protection Authority and to the affected data subjects within the statutory time limits; the notification process and content should be planned according to the nature of the breach.',
          },
          {
            question: 'What is the difference between a privacy notice and explicit consent?',
            answer:
              'A privacy notice is the obligation to inform the data subject about a processing activity; explicit consent is the freely given approval of the data subject for specific processing activities. Not every processing activity requires explicit consent.',
          },
        ],
      },
    ],
    note: 'This FAQ content is for general information only and does not constitute legal advice. You can send your questions through the office\'s contact form.',
  },
  ar: {
    meta: {
      title: 'الأسئلة الشائعة',
      description:
        'أسئلة شائعة حول طريقة عمل المكتب وحول قانون العمل، وقانون التنفيذ، وقانون الإيجار، وقانون الطلاق والأسرة، والتحكيم، وحماية البيانات الشخصية.',
    },
    label: 'الأسئلة الشائعة',
    title: 'الأسئلة الشائعة',
    lead: 'الأسئلة والأجوبة أدناه لغرض المعلومات العامة فقط؛ يمكنكم استخدام نموذج الاتصال للحصول على رأي بشأن مسألة محددة.',
    categories: [
      {
        heading: 'عام',
        items: [
          {
            question: 'هل المعلومات الواردة في هذا الموقع تُعد استشارة قانونية؟',
            answer:
              'لا. المحتوى الوارد في هذا الموقع هو لغرض المعلومات العامة فقط ولا ينشئ علاقة محاماة بين المحامي والموكل. قبل اتخاذ قرار بشأن مسألة قانونية محددة، يجب الحصول على رأي قانوني خاص بحالتكم.',
          },
          {
            question: 'هل يمكنكم تقديم معلومات أولية عن ملفي قبل تحديد موعد؟',
            answer:
              'يمكن تقديم معلومات عامة حول الإجراءات والتشريعات؛ إلا أن التقييم الخاص بالملف يتطلب الاطلاع على المستندات ذات الصلة. لذلك يُنصح بتحديد موعد للحصول على تقييم مفصّل.',
          },
          {
            question: 'هل يمكنني الحصول على الخدمة بلغة أجنبية؟',
            answer: 'يقدّم المكتب خدماته باللغات التركية والإنجليزية والعربية.',
          },
          {
            question: 'هل تتم المقابلات حضوريًا أم عن بُعد؟',
            answer:
              'يمكن تحديد المواعيد إما حضوريًا في المكتب أو عبر مكالمة فيديو/هاتفية، وفقًا لرغبتكم.',
          },
        ],
      },
      {
        heading: 'قانون الشركات',
        items: [
          {
            question: 'ما هي المستندات اللازمة لتأسيس شركة في تركيا؟',
            answer:
              'يختلف الأمر حسب نوع الشركة، ولكن بشكل عام تُطلب بيانات هوية المؤسسين، ومسودة عقد التأسيس، ومبلغ رأس المال، والمستندات الخاصة بالشركاء الأجانب إن وُجدوا. يمكن إعداد قائمة تحقق خاصة بملفكم في بداية العملية.',
          },
          {
            question: 'على أي أساس يتم اختيار نوع الشركة (محدودة/مساهمة)؟',
            answer:
              'يؤثر عدد الشركاء وهيكل رأس المال وخطط الاستثمار أو نقل الحصص المستقبلية والعوامل الضريبية على هذا الاختيار. لذلك يُنصح بتقييم مزايا وعيوب كل نوع وفقًا للحالة الملموسة.',
          },
          {
            question: 'كم من الوقت تستغرق عملية نقل الحصص؟',
            answer:
              'يختلف الأمر حسب نوع الشركة، وقيود النقل الواردة في عقد التأسيس، ومدى استعداد الأطراف؛ وتُعد إجراءات الجمعية العمومية أو عقد النقل من العوامل المؤثرة في المدة.',
          },
        ],
      },
      {
        heading: 'قانون الإيجار',
        items: [
          {
            question: 'هل يمكن للمستأجر فسخ عقد الإيجار قبل انتهاء مدته؟',
            answer:
              'إذا كان العقد ينظّم حق الفسخ المبكر، يُعمل بهذا الحكم؛ وإن لم يكن منظّمًا، يُشترط اتفاق الطرفين أو وجود أحد الأسباب المشروعة المنصوص عليها في القانون.',
          },
          {
            question: 'ما هي الحدود التي تخضع لها زيادة بدل الإيجار؟',
            answer:
              'في إيجارات المساكن وأماكن العمل المسقوفة، لا يجوز أن تتجاوز نسبة الزيادة معدل التغيّر في مؤشر أسعار المستهلك (TÜFE) لاثني عشر شهرًا عن السنة الإيجارية السابقة؛ ويُعتمد هذا الحد الأعلى حتى لو تم الاتفاق على نسبة مختلفة في العقد.',
          },
          {
            question: 'في أي الحالات يمكن للمؤجر إخلاء المستأجر؟',
            answer:
              'يمكن طلب الإخلاء في حال عدم دفع بدل الإيجار، أو الاستخدام المخالف للعقد، أو حاجة المؤجر أو أقاربه للسكن، أو إعادة البناء/التطوير العمراني وغيرها من الأسباب المحددة في القانون؛ ولكل سبب إجراءات ومهل زمنية خاصة به.',
          },
          {
            question: 'ما هو تعهد الإخلاء، وكيف يكون صحيحًا؟',
            answer:
              'هو مستند يتعهد فيه المستأجر كتابيًا بإخلاء العقار في تاريخ محدد؛ ولصحته يجب أن يكون موقّعًا من المستأجر بإرادة حرة بعد إنشاء عقد الإيجار.',
          },
        ],
      },
      {
        heading: 'قانون التنفيذ',
        items: [
          {
            question: 'كيف تُباشر إجراءات التنفيذ؟',
            answer:
              'تُباشر الإجراءات بتقديم الدائن طلبًا إلى دائرة التنفيذ مرفقًا بالمستندات والمعلومات المُثبتة للدين، سواء ببدء تنفيذ استنادًا إلى حكم قضائي أو بدونه.',
          },
          {
            question: 'كيف يمكن للمدين الاعتراض على إجراءات التنفيذ؟',
            answer:
              'في التنفيذ بدون حكم قضائي، يمكن للمدين إيقاف الإجراءات بالاعتراض لدى دائرة التنفيذ خلال المدة القانونية من تاريخ تبليغه أمر الدفع؛ وبعد ذلك يمكن للدائن اللجوء إلى رفع الاعتراض أو إبطاله.',
          },
          {
            question: 'على أي أموال يمكن تطبيق الحجز؟',
            answer:
              'كقاعدة عامة، يمكن حجز الأموال المنقولة وغير المنقولة والمستحقات القابلة للحجز والعائدة للمدين؛ وتُستثنى من الحجز بعض الأموال والحقوق المنصوص عليها في القانون (مثل بعض بنود الحد الأدنى للمعيشة).',
          },
          {
            question: 'ما الفرق بين الإفلاس وإجراءات التنفيذ؟',
            answer:
              'إجراءات التنفيذ وسيلة فردية لتحصيل دين معيّن؛ أما الإفلاس فهو إجراء جماعي يهدف إلى تصفية كامل أموال المدين لصالح جميع الدائنين معًا، ولا يُطبَّق إلا على المدينين الخاضعين لأحكام الإفلاس.',
          },
        ],
      },
      {
        heading: 'قانون العمل',
        items: [
          {
            question: 'هل يمكن للعامل فسخ عقد العمل لسبب مشروع؟',
            answer:
              'في حال توفر أحد الأسباب المنصوص عليها في المادة ذات الصلة من قانون العمل (كعدم دفع الأجر، أو الأسباب الصحية، أو مخالفة قواعد الأخلاق وحسن النية)، يمكن للعامل فسخ العقد فورًا لسبب مشروع، وقد يكون له الحق في بعض التعويضات المرتبطة بذلك.',
          },
          {
            question: 'ما الفرق بين تعويض نهاية الخدمة وتعويض الإخطار؟',
            answer:
              'يُدفع تعويض نهاية الخدمة، بشروط معينة، في حالات إنهاء العقد المنصوص عليها في القانون، ويُحتسب وفقًا لمدة الخدمة؛ أما تعويض الإخطار فهو تعويض يُدفع للطرف الآخر في حال عدم مراعاة مهل الإخطار المقررة للفسخ.',
          },
          {
            question: 'ما هي مدة رفع دعوى إعادة العمل؟',
            answer:
              'على العامل الذي يرى أن عقده أُنهي بشكل غير صحيح أن يتقدم بطلب للوساطة خلال المدة المنصوص عليها قانونًا من تاريخ تبليغه بإشعار الفسخ، وفي حال عدم التوصل إلى تسوية يمكن اللجوء إلى الدعوى القضائية.',
          },
          {
            question: 'كيف يُحتسب أجر العمل الإضافي وكيف يُثبت؟',
            answer:
              'يتحقق العمل الإضافي في حال تجاوز ساعات العمل الأسبوعية العادية، ويُحتسب أجره بالنسبة المُقررة في القانون؛ ويعتمد الإثبات عادة على المستندات الكتابية أو أقوال الشهود أو سجلات مكان العمل.',
          },
        ],
      },
      {
        heading: 'التحكيم وتسوية المنازعات',
        items: [
          {
            question: 'ما الفرق بين التحكيم والدعوى القضائية؟',
            answer:
              'في التحكيم، يتم حل النزاع من قبل محكّم أو محكّمين يختارهم الطرفان، وعادة ما تكون العملية أسرع وسرية. أما الدعوى القضائية فهي إجراء علني يُنظر فيه أمام المحاكم الحكومية.',
          },
          {
            question: 'كيف يتم تنفيذ قرار تحكيم أجنبي في تركيا؟',
            answer:
              'في إطار اتفاقية نيويورك، يجب الاعتراف بقرار التحكيم المعني وجعله قابلًا للتنفيذ عن طريق دعوى تنفيذ أمام المحاكم التركية.',
          },
          {
            question: 'هل يُشترط إدراج شرط تحكيم في العقد؟',
            answer:
              'لا، ولكن إذا كان الطرفان يفضلان اللجوء إلى التحكيم في حال النزاع، يجب تنظيم ذلك في العقد بشكل صريح وصحيح.',
          },
        ],
      },
      {
        heading: 'حماية البيانات الشخصية',
        items: [
          {
            question: 'هل يتوجب على كل شركة إجراء دراسة امتثال لحماية البيانات الشخصية؟',
            answer:
              'يخضع جميع الأشخاص الطبيعيين والاعتباريين الذين يعالجون بيانات شخصية لأحكام قانون حماية البيانات الشخصية؛ وقد تختلف الالتزامات وفقًا لحجم الشركة وطبيعة نشاط معالجة البيانات.',
          },
          {
            question: 'ماذا يجب فعله في حال حدوث خرق للبيانات؟',
            answer:
              'يجب إخطار هيئة حماية البيانات الشخصية والأشخاص المعنيين المتأثرين خلال المهل القانونية؛ ويجب تخطيط عملية الإخطار ومحتواه وفقًا لطبيعة الخرق.',
          },
          {
            question: 'ما الفرق بين نص التوضيح والموافقة الصريحة؟',
            answer:
              'نص التوضيح هو التزام بإعلام الشخص المعني بنشاط معالجة البيانات؛ أما الموافقة الصريحة فهي موافقة يقدمها الشخص المعني بإرادته الحرة لأنشطة معالجة محددة. ولا يتطلب كل نشاط معالجة موافقة صريحة.',
          },
        ],
      },
    ],
    note: 'محتوى الأسئلة الشائعة هذا لغرض المعلومات العامة فقط، ولا يُعد استشارة قانونية. يمكنكم إرسال أسئلتكم عبر نموذج الاتصال الخاص بالمكتب.',
  },
};

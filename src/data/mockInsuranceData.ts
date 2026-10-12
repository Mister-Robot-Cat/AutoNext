import { InsuranceCompany, InsuranceFaqItem, KaskoAddonKey } from '../types/insurance';

export const AZERBAIJAN_INSURANCE_COMPANIES: InsuranceCompany[] = [
  {
    id: 'pasha',
    name: 'PAŞA Sığorta ASC',
    shortName: 'PAŞA Sığorta',
    taglineAz: 'Azərbaycanın lider və ən etibarlı sığorta şirkəti',
    taglineEn: 'Azerbaijan\'s leading and most trusted insurer',
    marketShare: 37.5,
    financialStrengthRating: 'A+ (Yüksək Etibarlılıq)',
    claimSettlementSpeedDays: 2,
    claimSatisfactionRate: 98,
    customerRating: 4.9,
    reviewsCount: 1420,
    contactPhone: '*7000',
    website: 'https://pasha-insurance.az',
    logoAccentColor: '#0284c7', // sky-600
    baseKaskoRatePercent: 2.65,
    officialDealerSurchargePercent: 12,
    perksAz: [
      'Rəsmi dilerlərdə orijinal hissələrlə qeyd-şərtsiz təmir',
      '24/7 operativ evakuasiya və yol yardımı (Bakı və bütün rayonlar)',
      '1 500 AZN-dək DYP arayışsız şüşə və fənər təmiri',
      'Qəza zamanı pulsuz əvəzedici avtomobil xidməti',
      'BirBank taksit kartı ilə 12 ay faizsiz hissə-hissə ödəniş'
    ],
    perksEn: [
      'Unconditional repair at authorized dealerships with OEM parts',
      '24/7 swift evacuation & roadside assistance nationwide',
      'No police report needed for glass/headlight repairs up to 1,500 AZN',
      'Free replacement vehicle during accident repairs',
      '12-month interest-free installment via BirBank'
    ],
    installmentOptions: ['BirBank 12 ay', 'TamKart 12 ay', 'Bolkart 6 ay']
  },
  {
    id: 'ateshgah',
    name: 'Atəşgah Sığorta Şirkəti',
    shortName: 'Atəşgah',
    taglineAz: '25 illik təcrübə və sürətli zərər kompensasiyası',
    taglineEn: '25 years of trusted experience and rapid claim payouts',
    marketShare: 18.2,
    financialStrengthRating: 'A (Sabit & Güclü)',
    claimSettlementSpeedDays: 3,
    claimSatisfactionRate: 94,
    customerRating: 4.7,
    reviewsCount: 890,
    contactPhone: '*0007',
    website: 'https://ateshgah.com',
    logoAccentColor: '#dc2626', // red-600
    baseKaskoRatePercent: 2.45,
    officialDealerSurchargePercent: 10,
    perksAz: [
      'Mobil tətbiq üzərindən 15 dəqiqəyə onlayn zərər qeydiyyatı',
      'Geniş servis şəbəkəsində növbəsiz qəbul',
      '1 000 AZN-dək arayışsız kosmetik zədə ödənişi',
      'Təkər deşilməsi və yanacaq çatdırılması xidməti',
      'TamKart və UCard ilə komissiyasız hissəli ödəniş'
    ],
    perksEn: [
      'Online claim filing within 15 minutes via mobile app',
      'Priority queue-free service across verified workshop network',
      'No police report needed up to 1,000 AZN for cosmetic damage',
      'Complimentary tire assistance & emergency fuel delivery',
      'Zero-commission installment via TamKart & UCard'
    ],
    installmentOptions: ['TamKart 12 ay', 'BirBank 6 ay', 'Albalı 6 ay']
  },
  {
    id: 'qala',
    name: 'Qala Sığorta ASC',
    shortName: 'Qala Sığorta',
    taglineAz: 'Ən sərfəli tariflər və çevik fərdiləşdirilmiş KASKO',
    taglineEn: 'Most competitive tariffs and flexible custom KASKO packages',
    marketShare: 15.8,
    financialStrengthRating: 'A- (Yüksək Ödəniş Qabiliyyəti)',
    claimSettlementSpeedDays: 4,
    claimSatisfactionRate: 92,
    customerRating: 4.6,
    reviewsCount: 640,
    contactPhone: '*3883',
    website: 'https://qalasigorta.az',
    logoAccentColor: '#16a34a', // green-600
    baseKaskoRatePercent: 2.25,
    officialDealerSurchargePercent: 15,
    perksAz: [
      'Bazarın ən rəqabətli illik KASKO sığorta tarifi',
      '0 AZN və ya fərdi azadolma (franşiza) seçimləri',
      'İlin istənilən vaxtı pulsuz mövsümi təkər dəyişmə dəstəyi',
      'Sürücü və bütün sərnişinlər üçün fərdi qəza təminatı',
      'MilliÖn və eManat ilə rahat aylıq ödəniş'
    ],
    perksEn: [
      'Most competitive annual KASKO insurance rates in the market',
      '0 AZN or customizable deductible (franchise) tiers',
      'Free seasonal tire change assistance year-round',
      'Personal accident rider for driver and all passengers',
      'Convenient monthly settlements via MilliOn & eManat'
    ],
    installmentOptions: ['BirBank 6 ay', 'TamKart 6 ay', 'Bank Avtomatik Ödəniş']
  },
  {
    id: 'mega',
    name: 'Meqa Sığorta ASC',
    shortName: 'Meqa Sığorta',
    taglineAz: 'Mini-KASKO və qənaətcil avtomobil müdafiəsi',
    taglineEn: 'Mini-KASKO and smart economical vehicle protection',
    marketShare: 12.4,
    financialStrengthRating: 'A- (Etibarlı Portfel)',
    claimSettlementSpeedDays: 4,
    claimSatisfactionRate: 91,
    customerRating: 4.5,
    reviewsCount: 470,
    contactPhone: '*8899',
    website: 'https://megasigorta.az',
    logoAccentColor: '#9333ea', // purple-600
    baseKaskoRatePercent: 2.15,
    officialDealerSurchargePercent: 18,
    perksAz: [
      'Gündəlik qənaət üçün Mini-KASKO (yalnız qəza və toqquşma)',
      'Şəxsi menecer və 24 saat hüquqi məsləhət',
      'Amortizasiya (köhnəlmə) çıxılmadan təzə ehtiyat hissəsi təminatı',
      'Respublika üzrə 40+ rəsmi və partnyor servis nöqtəsi'
    ],
    perksEn: [
      'Economical Mini-KASKO option covering collision and rollover',
      'Dedicated claim specialist & 24/7 legal counsel',
      'Brand-new replacement parts without depreciation deductions',
      '40+ partner repair centers across Azerbaijan'
    ],
    installmentOptions: ['BirBank 12 ay', 'TamKart 6 ay']
  },
  {
    id: 'xalq',
    name: 'Xalq Sığorta ASC',
    shortName: 'Xalq Sığorta',
    taglineAz: 'Geniş servis infrastrukturu və fərdi yanaşma',
    taglineEn: 'Extensive service infrastructure and personalized care',
    marketShare: 10.1,
    financialStrengthRating: 'BBB+ (Maliyyə Sabitliyi)',
    claimSettlementSpeedDays: 5,
    claimSatisfactionRate: 89,
    customerRating: 4.4,
    reviewsCount: 380,
    contactPhone: '*1828',
    website: 'https://xalqsigorta.az',
    logoAccentColor: '#ea580c', // orange-600
    baseKaskoRatePercent: 2.20,
    officialDealerSurchargePercent: 15,
    perksAz: [
      'Xalq Bank müştəriləri üçün 10% xüsusi endirim keşbek',
      'Təbii fəlakət, sel, dolu və yanğın risklərinin tam təminatı',
      '700 AZN-dək xırda cızıq və bamper zədələrinə dərhal təsdiq',
      'Sərfəli ailə paketi və ikinci avtomobilə endirim'
    ],
    perksEn: [
      '10% exclusive cashback for Xalq Bank cardholders',
      'Full natural hazard protection: floods, hail, earthquakes & fire',
      'Instant authorization for scratches & bumper damages up to 700 AZN',
      'Multi-vehicle family discount for second household car'
    ],
    installmentOptions: ['Xalq Bank Kartları', 'BirBank 6 ay', 'TamKart 6 ay']
  }
];

export interface BonusMalusInfo {
  classNumber: number;
  factor: number;
  percentageLabel: string;
  category: 'discount' | 'baseline' | 'surcharge';
  descriptionAz: string;
  descriptionEn: string;
}

export const BONUS_MALUS_TABLE: BonusMalusInfo[] = [
  { classNumber: 1, factor: 2.45, percentageLabel: '+145%', category: 'surcharge', descriptionAz: 'Çoxsaylı qəzalar (Maksimal cərimə əmsalı)', descriptionEn: 'Multiple at-fault accidents (Maximum surcharge)' },
  { classNumber: 2, factor: 2.30, percentageLabel: '+130%', category: 'surcharge', descriptionAz: 'Təkrar qəza tarixi', descriptionEn: 'Repeated accident history' },
  { classNumber: 3, factor: 2.15, percentageLabel: '+115%', category: 'surcharge', descriptionAz: 'Yüksək riskli sürücü', descriptionEn: 'High risk driver profile' },
  { classNumber: 4, factor: 2.00, percentageLabel: '+100%', category: 'surcharge', descriptionAz: '2 qat standart tarif', descriptionEn: 'Double baseline tariff' },
  { classNumber: 5, factor: 1.80, percentageLabel: '+80%', category: 'surcharge', descriptionAz: 'Keçən il 2 qəza törətmiş', descriptionEn: '2 accidents caused in previous year' },
  { classNumber: 6, factor: 1.60, percentageLabel: '+60%', category: 'surcharge', descriptionAz: 'Keçən il qəza törətmiş', descriptionEn: '1 accident caused in previous year' },
  { classNumber: 7, factor: 1.40, percentageLabel: '+40%', category: 'surcharge', descriptionAz: 'Artırılmış risk dərəcəsi', descriptionEn: 'Elevated risk class' },
  { classNumber: 8, factor: 1.25, percentageLabel: '+25%', category: 'surcharge', descriptionAz: 'Yüngül qəza tarixi', descriptionEn: 'Minor accident history' },
  { classNumber: 9, factor: 1.10, percentageLabel: '+10%', category: 'surcharge', descriptionAz: 'Orta risk dərəcəsi', descriptionEn: 'Moderate risk class' },
  { classNumber: 10, factor: 1.00, percentageLabel: '0% (Baza)', category: 'baseline', descriptionAz: 'Baza sinfi (İlkin sürücülük və ya təmiz başlanğıc)', descriptionEn: 'Baseline standard class (Starting tier)' },
  { classNumber: 11, factor: 0.95, percentageLabel: '-5%', category: 'discount', descriptionAz: '1 il qəzasız sürücülük', descriptionEn: '1 year claim-free driving' },
  { classNumber: 12, factor: 0.90, percentageLabel: '-10%', category: 'discount', descriptionAz: '2 il qəzasız sürücülük', descriptionEn: '2 years claim-free driving' },
  { classNumber: 13, factor: 0.85, percentageLabel: '-15%', category: 'discount', descriptionAz: '3 il qəzasız sürücülük', descriptionEn: '3 years claim-free driving' },
  { classNumber: 14, factor: 0.80, percentageLabel: '-20%', category: 'discount', descriptionAz: '4 il qəzasız sürücülük', descriptionEn: '4 years claim-free driving' },
  { classNumber: 15, factor: 0.75, percentageLabel: '-25%', category: 'discount', descriptionAz: '5 il qəzasız sürücülük', descriptionEn: '5 years claim-free driving' },
  { classNumber: 16, factor: 0.70, percentageLabel: '-30%', category: 'discount', descriptionAz: '6 il qəzasız sürücülük', descriptionEn: '6 years claim-free driving' },
  { classNumber: 17, factor: 0.65, percentageLabel: '-35%', category: 'discount', descriptionAz: '7 il qəzasız sürücülük', descriptionEn: '7 years claim-free driving' },
  { classNumber: 18, factor: 0.60, percentageLabel: '-40%', category: 'discount', descriptionAz: '8 il qəzasız sürücülük', descriptionEn: '8 years claim-free driving' },
  { classNumber: 19, factor: 0.55, percentageLabel: '-45%', category: 'discount', descriptionAz: '9 il qəzasız sürücülük', descriptionEn: '9 years claim-free driving' },
  { classNumber: 20, factor: 0.50, percentageLabel: '-50%', category: 'discount', descriptionAz: '10+ il qəzasız nümunəvi sürücülük (Maksimal 50% güzəşt)', descriptionEn: '10+ years safe driving (Max 50% discount)' },
];

export const KASKO_ADDON_DEFINITIONS: Record<KaskoAddonKey, {
  nameAz: string;
  nameEn: string;
  descriptionAz: string;
  descriptionEn: string;
  costAzn: number;
}> = {
  roadside_assistance: {
    nameAz: '24/7 Evakuator & Yol Yardımı',
    nameEn: '24/7 Towing & Roadside Assistance',
    descriptionAz: 'Texniki nasazlıq və ya qəza zamanı ölkə üzrə limitsiz evakuasiya və yerində akkumulyator/təkər yardımı',
    descriptionEn: 'Unlimited nationwide towing and roadside battery/tire assistance in case of mechanical breakdown or accident',
    costAzn: 45
  },
  replacement_vehicle: {
    nameAz: 'Əvəzedici Avtomobil Təminatı',
    nameEn: 'Replacement Vehicle Cover',
    descriptionAz: 'Təmir müddətində gündəlik icarə avtomobili (maksimum 10 gün müddətinə pulsuz təmin edilir)',
    descriptionEn: 'Courtesy rental car during workshop repairs (up to 10 complimentary days)',
    costAzn: 75
  },
  no_police_certificate_glass: {
    nameAz: 'Arayışsız Şüşə və Fənər Təmiri',
    nameEn: 'No Police Report Glass & Light Cover',
    descriptionAz: 'Yol polisindən (DYP Forma 4) arayış tələb olunmadan ön şüşə, fənər və güzgü zədələrinin dərhal bərpası',
    descriptionEn: 'Instant repair for windshield, headlights and mirrors without requiring traffic police report',
    costAzn: 60
  },
  driver_passenger_accident: {
    nameAz: 'Sürücü və Sərnişin Fərdi Qəza Sığortası',
    nameEn: 'Driver & Passenger Personal Accident Cover',
    descriptionAz: 'Qəza nəticəsində avtomobildəki şəxslərin sağlamlığına dəyən zərər üçün hər oturacağa 10 000 AZN təminat',
    descriptionEn: 'Up to 10,000 AZN medical and disability compensation per seat for driver and all passengers',
    costAzn: 50
  },
  territory_expansion: {
    nameAz: 'Gürcüstan & Türkiyə Ərazi Genişlənməsi',
    nameEn: 'Georgia & Turkey Cross-Border Coverage',
    descriptionAz: 'KASKO müqaviləsinin Gürcüstan və Türkiyə sərhədləri daxilində tam qüvvədə qalması',
    descriptionEn: 'Extension of KASKO comprehensive coverage into Georgia and Turkey territory',
    costAzn: 90
  }
};

export const INSURANCE_FAQS: InsuranceFaqItem[] = [
  {
    id: 'diff_icbari_kasko',
    questionAz: 'İcbari sığorta ilə KASKO arasındakı fərq nədir?',
    questionEn: 'What is the difference between Compulsory (İcbari) and KASKO insurance?',
    questionRu: 'В чем разница между обязательным страхованием (İcbari) и КАСКО?',
    answerAz: 'İcbari sığorta (Avtonəqliyyat vasitəsi sahiblərinin mülki məsuliyyətinin icbari sığortası) qanunla məcburidir və yalnız SİZİN qəzada günahkar olduğunuz zaman qarşı tərəfə vurduğunuz zərəri (5 000 AZN-dək əmlak, 50 000 AZN-dək sağlamlıq) ödəyir. Öz avtomobilinizin təmirini isə yalnız könüllü KASKO sığortası ödəyir.',
    answerEn: 'Compulsory insurance (MTPL) is legally mandatory and only pays for damages you cause to THIRD PARTIES (up to 5,000 AZN property, 50,000 AZN health). It never repairs your own car. KASKO is voluntary comprehensive insurance that repairs your own vehicle regardless of who was at fault, plus covers theft, fire, and natural disasters.',
    answerRu: 'Обязательное страхование ОСАГО (İcbari) покрывает только ущерб ТРЕТЬИМ лицам (до 5000 AZN по имуществу). Ремонт вашего собственного автомобиля оплачивает только добровольное КАСКО.',
    category: 'compulsory'
  },
  {
    id: 'accident_steps',
    questionAz: 'Yol-nəqliyyat hadisəsi (qəza) baş verəndə nə etməliyəm?',
    questionEn: 'What immediate steps should I take in case of a car accident in Azerbaijan?',
    questionRu: 'Что делать при ДТП в Азербайджане?',
    answerAz: '1. Avtomobili yerindən tərpətməyin və qəza işıqlarını yandırın.\n2. Dərhal Daxili İşlər Nazirliyinin "102" xidmətinə və sığorta şirkətinizin qaynar xəttinə zəng edin.\n3. Hadisə yerinin və hər iki avtomobilin qeydiyyat nişanlarının 4 tərəfdən aydın şəkillərini və videosunu çəkin.\n4. Zərər 1000 AZN-dən azdırsa və tərəflər razıdırsa, DYP çağırmadan Razılaşma Protokolu (Sadələşdirilmiş forma) tərtib edə bilərsiniz.',
    answerEn: '1. Do not move the vehicles; turn on hazard lights immediately.\n2. Call "102" Police and your insurer emergency hotline immediately.\n3. Take clear photos and video from multiple angles showing vehicle license plates and roadway context.\n4. If damages are under 1,000 AZN and both parties agree on fault, you may execute the Simplified Accident Protocol without waiting for police.',
    answerRu: '1. Не перемещайте автомобили и включите аварийные сигналы.\n2. Позвоните в полицию 102 и в страховую компанию.\n3. Сделайте фото и видео с номерами авто.\n4. При мелких повреждениях до 1000 AZN оформите европротокол.',
    category: 'accident_steps'
  },
  {
    id: 'europrotocol_rules',
    questionAz: 'Razılaşma Protokolu (Sadələşdirilmiş forma / Avroprotokol) nə vaxt tətbiq olunur?',
    questionEn: 'When can the Simplified Accident Protocol (Europrotocol) be used?',
    questionRu: 'Когда применяется упрощенное оформление (Европротокол)?',
    answerAz: 'Yalnız bu şərtlər ödəndikdə: 1) Hadisədə yalnız 2 avtomobil iştirak edir; 2) Heç bir şəxsin sağlamlığına zərər dəyməyib; 3) Zərərin təxmini məbləği 1 000 AZN-i keçmir; 4) Hər iki tərəfin qüvvədə olan icbari sığortası var; 5) Sürücülərdən biri təqsirini tam etiraf edir və razılaşır.',
    answerEn: 'Only when: 1) Exactly 2 vehicles are involved; 2) No bodily injury or death occurred; 3) Property damage does not exceed 1,000 AZN; 4) Both drivers possess valid compulsory insurance; 5) One driver unconditionally admits fault.',
    answerRu: 'При участии только 2 машин, отсутствии пострадавших, ущербе до 1000 AZN, наличии ОСАГО у обоих водителей и взаимном согласии о виновнике.',
    category: 'europrotocol'
  },
  {
    id: 'bm_system',
    questionAz: 'Bonus-Malus sistemi nədir və qiymətə necə təsir edir?',
    questionEn: 'How does the Bonus-Malus rating system work?',
    questionRu: 'Как работает система Бонус-Малус?',
    answerAz: 'Bonus-Malus İcbari Sığorta Bürosu (İSB) tərəfindən tənzimlənən 20 pilləli reytinq sistemidir. İlkin sinif BM 10-dur (100% baza). Hər qəzasız keçən il üçün 1 pillə qalxırsınız və 5% güzəşt alırsınız (BM 20-də 50% endirim). Əgər təqsirkar olduğunuz qəza baş verərsə, sinfiniz aşağı düşür və sığorta haqqınız 245%-dək arta bilər.',
    answerEn: 'The Bonus-Malus system is a 20-tier regulatory score. BM 10 is baseline (100%). Each claim-free year improves your score by one class, yielding a 5% compounding discount down to 50% off at BM 20. Conversely, at-fault accidents drop your tier, increasing premiums up to 245% at BM 1.',
    answerRu: 'Система 20 классов: базовый класс 10 (100%). Каждый безаварийный год дает 5% скидку (до 50% при 20 классе). Аварии по вашей вине повышают стоимость до 245% при 1 классе.',
    category: 'compulsory'
  },
  {
    id: 'franchise_explanation',
    questionAz: 'KASKO-da azadolma məbləği (Franşiza) nə deməkdir?',
    questionEn: 'What is a deductible / franchise in KASKO policies?',
    questionRu: 'Что такое безусловная франшиза в КАСКО?',
    answerAz: 'Franşiza hər sığorta hadisəsi zamanı sizin öz cibinizdən ödədiyiniz minimal məbləğdir. Məsələn, 250 AZN franşizası olan polislə 2 000 AZN-lik zərər olduqda, 250 AZN-i siz, qalan 1 750 AZN-i isə sığorta şirkəti ödəyir. Franşiza məbləğini artırdıqca illik sığorta haqqınız əhəmiyyətli dərəcədə ucuzlaşır.',
    answerEn: 'A deductible (franchise) is the fixed portion of each repair claim you pay out of pocket. For example, with a 250 AZN deductible on a 2,000 AZN claim, you pay 250 AZN and the insurer pays 1,750 AZN. Choosing a higher deductible substantially lowers your annual premium.',
    answerRu: 'Франшиза — это сумма, которую вы оплачиваете самостоятельно при каждом страховом случае. Чем выше франшиза, тем ниже ежегодная стоимость полиса.',
    category: 'kasko'
  }
];

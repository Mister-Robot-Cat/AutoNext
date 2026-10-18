export type BodyWrapTypeId =
  | 'oem_factory_paint'
  | 'clear_ppf_shield'
  | 'two_tone_roof_under30'
  | 'full_matte_or_color_wrap'
  | 'chameleon_iridescent_wrap'
  | 'prohibited_operative_livery';

export type AdPlacementTypeId =
  | 'no_advertising'
  | 'side_doors_compliant'
  | 'full_body_over50_unregistered'
  | 'window_or_light_obstructing'
  | 'traffic_sign_imitation_or_audio';

export type BullbarHitchStatusId =
  | 'oem_clean_no_additions'
  | 'removable_certified_farkop'
  | 'fixed_farkop_blocking_plate'
  | 'unregistered_steel_kenguryatnik'
  | 'certified_offroad_bumper_endorsed';

export interface BodyWrapProfile {
  id: BodyWrapTypeId;
  nameAz: string;
  coveragePercentDefault: number;
  requiresTexpasportUpdate: boolean;
  isProhibitedOperativeScheme: boolean;
  fineAzn: number;
  meroStateDutyAzn: number; // 30 AZN Texpasport + 20 AZN inspection = 50 AZN
  texpasportColorNoteAz: string;
  legalBasisAz: string;
  descriptionAz: string;
}

export interface AdvertisingRegulationProfile {
  id: AdPlacementTypeId;
  nameAz: string;
  requiresAdraNotification: boolean;
  requiresTexpasportAdvertisingNote: boolean;
  prohibitsOperation: boolean;
  driverFineAzn: number; // IXM 342.1.8: 50 AZN
  officialFineAzn: number; // IXM 348 / 428: 150 - 300 AZN
  legalBasisAz: string;
  descriptionAz: string;
}

export interface ExteriorHardwareProfile {
  id: BullbarHitchStatusId;
  nameAz: string;
  isCompliant: boolean;
  blocksLicensePlate: boolean;
  requiresAzsCertificate: boolean;
  prohibitsOperation: boolean;
  fineAzn: number;
  legalBasisAz: string;
  descriptionAz: string;
}

export interface BodyworkServicePackage {
  id: string;
  nameAz: string;
  category: 'mero_duty' | 'adra_permit' | 'hardware_fix' | 'wrap_removal';
  stateDutyOrPartsAzn: number;
  laborCostAzn: number;
  durationMinutes: number;
  preventsFineAzn: number;
  descriptionAz: string;
}

export interface BodyworkInspectionCenter {
  id: string;
  nameAz: string;
  city: 'Bakı' | 'Xırdalan' | 'Sumqayıt' | 'Gəncə';
  addressAz: string;
  authorityType: 'BDYP MERO' | 'ADRA Regional' | 'AZS Sertifikatlaşdırma';
  workingHours: string;
  phone: string;
  servicesAz: string[];
}

export interface BodyworkComplianceCertificate {
  certificateNumber: string; // BDYP-KUZ-2026-XXXXX
  issueDate: string;
  expiryDate: string;
  vehiclePlate: string;
  vin: string;
  vehicleModel: string;
  recordedTexpasportColorAz: string;
  wrapAndPaintStatusAz: string;
  adraPermitNumber: string;
  farkopAndRoofStatusAz: string;
  inspectingCenterAz: string;
  verificationHash: string;
  overallStatus: 'PASS' | 'CONDITIONAL' | 'FAIL';
}

export const BODY_WRAP_PROFILES: BodyWrapProfile[] = [
  {
    id: 'oem_factory_paint',
    nameAz: 'Zavod Boyası (Texpasport Rəngi ilə 100% Eyni)',
    coveragePercentDefault: 0,
    requiresTexpasportUpdate: false,
    isProhibitedOperativeScheme: false,
    fineAzn: 0,
    meroStateDutyAzn: 0,
    texpasportColorNoteAz: 'Zavod əsas rəngi (dəyişiklik yoxdur)',
    legalBasisAz: 'YHQ Maddə 27 (Tam uyğun)',
    descriptionAz:
      'Avtomobilin faktiki kuzov rəngi Texpasportda göstərilən zavod rəngi ilə tam üst-üstə düşür.',
  },
  {
    id: 'clear_ppf_shield',
    nameAz: 'Şəffaf Qoruyucu Poliuretan Plonka (Clear PPF)',
    coveragePercentDefault: 100,
    requiresTexpasportUpdate: false,
    isProhibitedOperativeScheme: false,
    fineAzn: 0,
    meroStateDutyAzn: 0,
    texpasportColorNoteAz: 'Əlavə qeyd tələb olunmur (Şəffaf PPF)',
    legalBasisAz: 'YHQ Maddə 27 (Rəng çaları dəyişmir)',
    descriptionAz:
      'Şəffaf parıltılı və ya yarım-mat poliuretan qoruyucu plonka avtomobilin əsas rəngini dəyişmədiyi üçün MERO qeydiyyatı tələb etmir.',
  },
  {
    id: 'two_tone_roof_under30',
    nameAz: 'Qara Panoram Dam / Dekorativ Zolaq (<30% Sahə)',
    coveragePercentDefault: 22,
    requiresTexpasportUpdate: false,
    isProhibitedOperativeScheme: false,
    fineAzn: 0,
    meroStateDutyAzn: 0,
    texpasportColorNoteAz: 'Əsas rəng saxlanılır (<30% kontrast dam)',
    legalBasisAz: 'YHQ Maddə 27 (30%-dən az səth istisnası)',
    descriptionAz:
      'Kuzovun ümumi görünən səthinin 30%-dən az hissəsini örtən qara dam vinili və ya zavod tipli dekorativ zolaqlar əsas rəngi təhrif etmir.',
  },
  {
    id: 'full_matte_or_color_wrap',
    nameAz: 'Tam Rəngli / Tutqun (Mat) Vinil Plonka (>30% Sahə)',
    coveragePercentDefault: 85,
    requiresTexpasportUpdate: true,
    isProhibitedOperativeScheme: false,
    fineAzn: 150,
    meroStateDutyAzn: 50,
    texpasportColorNoteAz: '«Tutqun (Mat) / İkirəngli» Texpasport qeydi mütləqdir',
    legalBasisAz: 'YHQ Maddə 27 & İXM Maddə 342.2-1 (10 gün ərzində qeydiyyat)',
    descriptionAz:
      'Kuzovun 30%-dən çox hissəsi başqa rəngə və ya tam tutqun (mat) vinilə kaplandıqda 10 gün ərzində BDYP MERO-da Texpasport yenilənməlidir (50 AZN).',
  },
  {
    id: 'chameleon_iridescent_wrap',
    nameAz: 'Xameleon / Çoxçalarlı (Kombinə Edilmiş) Vinil və ya Boya',
    coveragePercentDefault: 100,
    requiresTexpasportUpdate: true,
    isProhibitedOperativeScheme: false,
    fineAzn: 150,
    meroStateDutyAzn: 50,
    texpasportColorNoteAz: '«Kombinə edilmiş (Çoxrəngli)» Texpasport qeydi',
    legalBasisAz: 'YHQ Maddə 27 & İXM Maddə 342.2-1',
    descriptionAz:
      'İşıq bucağından asılı olaraq rəngini dəyişən xameleon örtüklər Texpasportda «Kombinə edilmiş» kimi rəsmiləşdirilməlidir.',
  },
  {
    id: 'prohibited_operative_livery',
    nameAz: 'QADAĞAN EDİLMİŞ: Operativ / Polis / Təcili Yardım Rəng-Qrafik Sxemi',
    coveragePercentDefault: 45,
    requiresTexpasportUpdate: false,
    isProhibitedOperativeScheme: true,
    fineAzn: 800,
    meroStateDutyAzn: 0,
    texpasportColorNoteAz: 'QADAĞANDIR — Dərhal sökülməlidir!',
    legalBasisAz: 'YHQ Əlavə 1 Bənd 7.14 & İXM Maddə 342.9 (500–800 AZN + Cərimə meydançası)',
    descriptionAz:
      'Operativ nəqliyyat vasitələrinin (DYP, FHN, Təcili Tibbi Yardım, Hərbi) rəng-qrafik sxemlərinin mülki avtomobillərə vurulması qəti qadağandır.',
  },
];

export const ADVERTISING_REGULATION_PROFILES: AdvertisingRegulationProfile[] = [
  {
    id: 'no_advertising',
    nameAz: 'Reklam Yoxdur (Şəxsi / Korporativ Təmiz Kuzov)',
    requiresAdraNotification: false,
    requiresTexpasportAdvertisingNote: false,
    prohibitsOperation: false,
    driverFineAzn: 0,
    officialFineAzn: 0,
    legalBasisAz: 'YHQ Əlavə 1 (Tam uyğun)',
    descriptionAz: 'Avtomobil üzərində heç bir kommersiya reklamı və ya loqotip yerləşdirilməyib.',
  },
  {
    id: 'side_doors_compliant',
    nameAz: 'Yan Qapılarda və Bortda Qanuni Loqo / Brendinq (<50% Sahə)',
    requiresAdraNotification: true,
    requiresTexpasportAdvertisingNote: false,
    prohibitsOperation: false,
    driverFineAzn: 0,
    officialFineAzn: 0,
    legalBasisAz: '«Reklam haqqında» Qanun Maddə 26',
    descriptionAz:
      'Şüşələri və işıq cihazlarını örtməyən, kuzovun 50%-dən az hissəsini tutan rəsmi şirkət brendinqi və çatdırılma loqotipləri.',
  },
  {
    id: 'full_body_over50_unregistered',
    nameAz: 'Tam Kuzov Reklam Vinili (>50% Sahə — Texpasport Qeydi Olmadan)',
    requiresAdraNotification: true,
    requiresTexpasportAdvertisingNote: true,
    prohibitsOperation: false,
    driverFineAzn: 50,
    officialFineAzn: 150,
    legalBasisAz: 'İXM Maddə 342.1.8 (50 AZN) & YHQ Maddə 27',
    descriptionAz:
      'Kuzovun 50%-dən çox hissəsini örtən reklam vinili avtomobilin əsas rəngini gizlətdiyi üçün Texpasportda «Reklamlı / Kombinə edilmiş» qeydi tələb edir.',
  },
  {
    id: 'window_or_light_obstructing',
    nameAz: 'QADAĞAN: Ön/Yan Şüşələri və ya Faraları Örtən Perforasiyalı Reklam',
    requiresAdraNotification: true,
    requiresTexpasportAdvertisingNote: false,
    prohibitsOperation: true,
    driverFineAzn: 50,
    officialFineAzn: 200,
    legalBasisAz: 'İXM Maddə 342.1.8 (50 AZN) & YHQ Əlavə 1 Bənd 7.3 (Görünüş məhdudiyyəti)',
    descriptionAz:
      'Sürücünün görünüş dairəsini məhdudlaşdıran şüşə reklamları və xarici işıq cihazlarının üzərinə vurulan stikerlər istismarı qadağan edir.',
  },
  {
    id: 'traffic_sign_imitation_or_audio',
    nameAz: 'QADAĞAN: Yol Nişanı İmitasiyası, İşıqqaytarıcı Zolaq və ya Səsucaldan Reklam',
    requiresAdraNotification: false,
    requiresTexpasportAdvertisingNote: false,
    prohibitsOperation: true,
    driverFineAzn: 50,
    officialFineAzn: 300,
    legalBasisAz: '«Reklam haqqında» Qanun Maddə 26.5 & İXM Maddə 342.1.8',
    descriptionAz:
      'Yol nişanlarına bənzəyən reklam lövhələri, sürücüləri çaşdıran reflektorlar və nəqliyyat vasitəsindən səsucaldanla səsli reklam yayımı qəti qadağandır.',
  },
];

export const EXTERIOR_HARDWARE_PROFILES: ExteriorHardwareProfile[] = [
  {
    id: 'oem_clean_no_additions',
    nameAz: 'Zavod Buferləri (Əlavə Dəmir Qoruyucu və ya Farkop Yoxdur)',
    isCompliant: true,
    blocksLicensePlate: false,
    requiresAzsCertificate: false,
    prohibitsOperation: false,
    fineAzn: 0,
    legalBasisAz: 'YHQ Əlavə 1 Bənd 7.6 & 7.11 (Tam uyğun)',
    descriptionAz: 'Zavod istehsalı plastik/kompozit buferlər və standart kuzov həndəsəsi.',
  },
  {
    id: 'removable_certified_farkop',
    nameAz: 'Sertifikatlı Çıxarıla Bilən «Farkop» (DQN-i Örtmür + Elektrik Rozetkası İşlək)',
    isCompliant: true,
    blocksLicensePlate: false,
    requiresAzsCertificate: false,
    prohibitsOperation: false,
    fineAzn: 0,
    legalBasisAz: 'YHQ Əlavə 1 Bənd 7.6 (Dartqı-ilişmə normativi)',
    descriptionAz:
      'Zavod şassi yuvalarına bağlanan, dövlət qeydiyyat nişanını (DQN) örtməyən və 7/13-pin tormoz/dönmə işıq rozetkası işlək olan yedək qarmağı.',
  },
  {
    id: 'fixed_farkop_blocking_plate',
    nameAz: 'DQN Nömrəni Örtən Sabit «Farkop» Qarmağı (Qoşqusuz İdarəetmə)',
    isCompliant: false,
    blocksLicensePlate: true,
    requiresAzsCertificate: false,
    prohibitsOperation: false,
    fineAzn: 40,
    legalBasisAz: 'İXM Maddə 342.1.3 (40 AZN) / Qərəzli olduqda İXM 342.7 (500 AZN)',
    descriptionAz:
      'Arxa buferin ortasında yerləşən DQN-in hərflərini və ya rəqəmlərini MMX kameralarından gizlədən çıxarılmamış farkop topuzu.',
  },
  {
    id: 'unregistered_steel_kenguryatnik',
    nameAz: 'Sənədsiz Ön Dəmir «Kenguryatnik» / Qanunsuz Güc Buferi',
    isCompliant: false,
    blocksLicensePlate: false,
    requiresAzsCertificate: true,
    prohibitsOperation: true,
    fineAzn: 150,
    legalBasisAz: 'YHQ Əlavə 1 Bənd 7.11 (UNECE R26) & İXM Maddə 342.2-1 (150 AZN)',
    descriptionAz:
      'Piyada vurulması zamanı ağır xəsarət yetirən, bufer xəttindən irəli çıxan sənədsiz polad boru («kenguryatnik») və ya sertifikatsız dəmir şveller.',
  },
  {
    id: 'certified_offroad_bumper_endorsed',
    nameAz: 'AZS Sertifikatlı Off-Road Bufer / Bucurqad (Texpasport Qeydi ilə)',
    isCompliant: true,
    blocksLicensePlate: false,
    requiresAzsCertificate: true,
    prohibitsOperation: false,
    fineAzn: 0,
    legalBasisAz: 'AZS 597 & YHQ Əlavə 1 («Xüsusi qeydlər» möhürü ilə)',
    descriptionAz:
      'Akkreditə olunmuş AZS laboratoriyasında sınaqdan keçmiş və Texpasportun «Xüsusi qeydlər» xanasına işlənmiş ARB/TJM tipli ekspedisiya təchizatı.',
  },
];

export const BODYWORK_SERVICE_PACKAGES: BodyworkServicePackage[] = [
  {
    id: 'pkg_mero_color_texpasport',
    nameAz: 'BDYP MERO Rəng / Vinil Dəyişikliyi və Yeni Texpasport Rüsumu',
    category: 'mero_duty',
    stateDutyOrPartsAzn: 50, // 30 AZN Texpasport + 20 AZN inspection
    laborCostAzn: 0,
    durationMinutes: 45,
    preventsFineAzn: 150,
    descriptionAz:
      'YHQ Maddə 27 üzrə yeni kuzov rənginin, «İkirəngli» və ya «Tutqun (Mat)» qeydinin elektron çipli Texpasporta rəsmiləşdirilməsi.',
  },
  {
    id: 'pkg_adra_vehicle_ad_clearance',
    nameAz: 'ADRA & BDYP Nəqliyyat Üzərində Reklam Eskizinin Uyğunluq Ekspertizası',
    category: 'adra_permit',
    stateDutyOrPartsAzn: 30,
    laborCostAzn: 25,
    durationMinutes: 60,
    preventsFineAzn: 200,
    descriptionAz:
      'Korporativ brendinq və reklam dizaynının «Reklam haqqında» Qanun Maddə 26 və yol hərəkəti təhlükəsizliyi normativlərinə uyğunluq rəyi.',
  },
  {
    id: 'pkg_removable_farkop_conversion',
    nameAz: 'Farkopun Tez-Çıxarılan (Quick-Release) Mexanizmə Keçirilməsi + 7-Pin Rozetka',
    category: 'hardware_fix',
    stateDutyOrPartsAzn: 65,
    laborCostAzn: 35,
    durationMinutes: 50,
    preventsFineAzn: 40,
    descriptionAz:
      'DQN nömrəni örtən sabit qarmağın açarla saniyələr içində çıxarılan Avropa standartlı (ISO 50) başlıqla əvəzlənməsi.',
  },
  {
    id: 'pkg_kenguryatnik_dismantle',
    nameAz: 'Qadağan Edilmiş Dəmir «Kenguryatnik»in Sökülməsi və Zavod Bufer Bərpası',
    category: 'hardware_fix',
    stateDutyOrPartsAzn: 20,
    laborCostAzn: 40,
    durationMinutes: 40,
    preventsFineAzn: 150,
    descriptionAz:
      'İXM 342.2-1 üzrə 150 AZN cərimə və cərimə meydançası riskini aradan qaldırmaq üçün qanunsuz ön dəmir qoruyucunun demontajı.',
  },
  {
    id: 'pkg_illegal_wrap_removal',
    nameAz: 'Qeydiyyatsız Vinil Plonkanın və ya Şüşə Reklamının Buxarla Təmiz Sökülməsi',
    category: 'wrap_removal',
    stateDutyOrPartsAzn: 15,
    laborCostAzn: 65,
    durationMinutes: 90,
    preventsFineAzn: 150,
    descriptionAz:
      'Zavod lak-boya qatına (LKP) zərər vermədən köhnə reklam stikerlərinin və ya sənədsiz vinilin kimyəvi buxarla təmizlənməsi.',
  },
];

export const BODYWORK_INSPECTION_CENTERS: BodyworkInspectionCenter[] = [
  {
    id: 'center_baku_meyveli_mero',
    nameAz: 'BDYP Baş İdarəsi — Meyvəli Qeydiyyat-İmtahan və Kuzov Müayinə Mərkəzi',
    city: 'Bakı',
    addressAz: 'Bakı ş., Qaradağ r-nu, Lökbatan–Xocəsən yolu («Meyvəli» terminalı yanı)',
    authorityType: 'BDYP MERO',
    workingHours: 'B.e. – Şənbə: 09:00 – 18:00',
    phone: '+994 12 590 81 10',
    servicesAz: [
      'Texpasportda rəng dəyişikliyi («İkirəngli» / «Mat» / «Kombinə edilmiş»)',
      'Kuzov və reklam örtüyünün YHQ Maddə 27 üzrə müayinəsi',
      'Konstruktiv dəyişiklik və farkop/baqaj qeydiyyatı',
    ],
  },
  {
    id: 'center_baku_adra_hq',
    nameAz: 'Azərbaycan Dövlət Reklam Agentliyi (ADRA) — Bakı Şəhər Reklam İdarəsi',
    city: 'Bakı',
    addressAz: 'Bakı ş., Səbail r-nu, Üzeyir Hacıbəyli küç. 72 (Hökumət Evi korpusu)',
    authorityType: 'ADRA Regional',
    workingHours: 'B.e. – Cümə: 09:00 – 18:00',
    phone: '1412 (ADRA Çağrı Mərkəzi)',
    servicesAz: [
      'Nəqliyyat vasitələri üzərində reklam eskizlərinin razılaşdırılması',
      '«Reklam haqqında» Qanun Maddə 26 üzrə uyğunluq rəyi',
      'Korporativ avtopark brendinqi reyestri',
    ],
  },
  {
    id: 'center_baku_zabrat_tech',
    nameAz: 'BDYP Sabunçu (Zabrat) Texniki Müayinə və Kuzov Ekspertiza Mərkəzi',
    city: 'Bakı',
    addressAz: 'Bakı ş., Sabunçu r-nu, Zabrat-Maştağa şossesi 1-ci km',
    authorityType: 'BDYP MERO',
    workingHours: 'Hər gün: 09:00 – 18:00',
    phone: '+994 12 590 81 25',
    servicesAz: [
      'YHQ Əlavə 1 üzrə bufer, farkop və dam baqajı yoxlaması',
      'Rəng-qrafik sxemlərin və işıqqaytarıcı elementlərin auditi',
      'BDYP-KUZ-2026 elektron uyğunluq aktı',
    ],
  },
  {
    id: 'center_khirdalan_azs',
    nameAz: 'AZS Milli Sertifikatlaşdırma — Xırdalan Kuzov və Qoşqu Avadanlığı Laboratoriyası',
    city: 'Xırdalan',
    addressAz: 'Xırdalan ş., Bakı-Quba şossesi 9-cu km, Texniki Sınaq Parkı',
    authorityType: 'AZS Sertifikatlaşdırma',
    workingHours: 'B.e. – Şənbə: 09:00 – 18:00',
    phone: '+994 12 342 90 18',
    servicesAz: [
      'ISO 50 dartqı-ilişmə («farkop») qurğularının dartma sınağı',
      'Ekspedisiya dam baqajları və off-road buferlərinin AZS 597 sertifikatı',
      'Spektrofotometr ilə kuzov rəng kodunun təyini',
    ],
  },
  {
    id: 'center_sumqayit_mero',
    nameAz: 'Sumqayıt Regional BDYP Qeydiyyat-İmtahan və Kuzov Nəzarət Şöbəsi',
    city: 'Sumqayıt',
    addressAz: 'Sumqayıt ş., Sülh küçəsi, Giriş magistralı 2-ci km',
    authorityType: 'BDYP MERO',
    workingHours: 'B.e. – Şənbə: 09:00 – 18:00',
    phone: '+994 18 655 41 20',
    servicesAz: [
      'Vinil plonka və rəng dəyişikliyi üzrə Texpasport yenilənməsi',
      'Sumqayıt-Abşeron korporativ yük/çatdırılma reklam auditi',
      'Farkop və xarici avadanlıq baxışı',
    ],
  },
  {
    id: 'center_ganja_mero',
    nameAz: 'Gəncə Regional BDYP Qeydiyyat-İmtahan və ADRA Qərb Mərkəzi',
    city: 'Gəncə',
    addressAz: 'Gəncə ş., Nizami Gəncəvi pr. 148, Yevlax şossesi çıxışı',
    authorityType: 'BDYP MERO',
    workingHours: 'B.e. – Şənbə: 09:00 – 18:00',
    phone: '+994 22 256 74 15',
    servicesAz: [
      'Qərb regionu üzrə Texpasport rəng və kuzov qeydiyyatı',
      'Nəqliyyat reklamlarının regional qeydiyyatı',
      'YHQ Əlavə 1 xarici avadanlıq ekspertizası',
    ],
  },
];

export const SAMPLE_BODYWORK_CERTIFICATES: BodyworkComplianceCertificate[] = [
  {
    certificateNumber: 'BDYP-KUZ-2026-90412',
    issueDate: '12.10.2026',
    expiryDate: '12.10.2028',
    vehiclePlate: '90-KZ-777',
    vin: 'WBS8M9C50J5K41820',
    vehicleModel: 'BMW M5 Competition (F90)',
    recordedTexpasportColorAz: 'Tünd Boz Tutqun (Frozen Dark Grey Mat — Qeydiyyatda)',
    wrapAndPaintStatusAz: '100% Satin Mat Poliuretan (Texpasport Xüsusi Qeydlərdə təsdiqlənib)',
    adraPermitNumber: 'Tələb olunmur (Reklam yoxdur)',
    farkopAndRoofStatusAz: 'Zavod M-buferlər, əlavə kenguryatnik və ya farkop yoxdur',
    inspectingCenterAz: 'BDYP Baş İdarəsi — Meyvəli Qeydiyyat-İmtahan və Kuzov Müayinə Mərkəzi',
    verificationHash: 'AZ-KUZ-90412-F90M5-VERIFIED',
    overallStatus: 'PASS',
  },
  {
    certificateNumber: 'BDYP-KUZ-2026-63108',
    issueDate: '04.10.2026',
    expiryDate: '04.10.2027',
    vehiclePlate: '77-AD-404',
    vin: 'VF1FL000X68104922',
    vehicleModel: 'Renault Master L3H2 (Korporativ Daşıma)',
    recordedTexpasportColorAz: 'Ağ-Mavi Kombinə edilmiş (Reklamlı)',
    wrapAndPaintStatusAz: 'Yan bortlarda 42% korporativ loqotip vinili',
    adraPermitNumber: 'ADRA-BKI-2026-18405',
    farkopAndRoofStatusAz: 'Sertifikatlı ISO-50 çıxarılan farkop (DQN tam açıqdır)',
    inspectingCenterAz: 'Azərbaycan Dövlət Reklam Agentliyi (ADRA) — Bakı Şəhər Reklam İdarəsi',
    verificationHash: 'AZ-KUZ-63108-ADRA-VERIFIED',
    overallStatus: 'PASS',
  },
  {
    certificateNumber: 'BDYP-KUZ-2026-31809',
    issueDate: '16.10.2026',
    expiryDate: '16.10.2028',
    vehiclePlate: '10-FK-202',
    vin: 'JTMHV05J804291054',
    vehicleModel: 'Toyota Land Cruiser 200',
    recordedTexpasportColorAz: 'Qara Metalik',
    wrapAndPaintStatusAz: 'Şəffaf qoruyucu PPF (100% zavod rəngi saxlanılıb)',
    adraPermitNumber: 'Tələb olunmur (Şəxsi minik)',
    farkopAndRoofStatusAz: 'Thule Motion XT dam baqajı (hündürlük 2.38m ≤ 4.0m) + çıxarılan farkop',
    inspectingCenterAz: 'AZS Milli Sertifikatlaşdırma — Xırdalan Kuzov və Qoşqu Avadanlığı Laboratoriyası',
    verificationHash: 'AZ-KUZ-31809-LC200-VERIFIED',
    overallStatus: 'PASS',
  },
];

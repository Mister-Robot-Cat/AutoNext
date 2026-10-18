export type WindshieldZoneId =
  | 'clean'
  | 'driver_sweep_a'
  | 'passenger_sweep_b'
  | 'perimeter_edge_c';

export type WindshieldDamageType =
  | 'none'
  | 'stone_chip_under_15mm'
  | 'bullseye_crack_25mm'
  | 'linear_crack_over_10cm'
  | 'delamination_haze';

export type WiperConditionId =
  | 'normal_45cpm'
  | 'slow_below_30cpm'
  | 'streaking_worn_blade'
  | 'driver_wiper_dead';

export type WasherFluidGradeId =
  | 'summer_water'
  | 'winter_minus_15'
  | 'arctic_minus_30'
  | 'empty_pump_dead';

export type HornTypeId =
  | 'oem_dual_tone'
  | 'oem_single_disc'
  | 'fifa_polyphonic'
  | 'pneumatic_train_horn'
  | 'sgu_police_siren'
  | 'broken_silent';

export interface WindshieldZoneSpec {
  id: WindshieldZoneId;
  nameAz: string;
  code: string;
  descriptionAz: string;
  isDriverCritical: boolean;
  legalClauseAz: string;
}

export interface HornSpec {
  id: HornTypeId;
  nameAz: string;
  categoryLabelAz: string;
  defaultDbA: number;
  frequencyHz: string;
  isLegal: boolean;
  requiresConfiscation: boolean;
  prohibitsOperation: boolean;
  ixmArticleAz: string;
  fineAzn: number;
  descriptionAz: string;
}

export interface WasherFluidSpec {
  id: WasherFluidGradeId;
  nameAz: string;
  freezingPointC: number;
  isopropylPercent: number;
  isPumpWorking: boolean;
  recommendedRegionAz: string;
}

export interface VisibilityRepairPackage {
  id: string;
  nameAz: string;
  category: 'windshield' | 'wipers' | 'horn' | 'mirrors_mudguards' | 'tachograph';
  partsCostAzn: number;
  laborCostAzn: number;
  durationMinutes: number;
  warrantyMonths: number;
  fixesClauseAz: string;
  descriptionAz: string;
}

export interface AccreditedVisibilityCenter {
  id: string;
  nameAz: string;
  city: 'Bakı' | 'Sumqayıt' | 'Gəncə';
  addressAz: string;
  accreditationCode: string;
  servicesAz: string[];
  waitMinutes: number;
  workingHours: string;
  phone: string;
}

export interface VisibilityHornCertificate {
  certificateNumber: string;
  plateNumber: string;
  vin: string;
  vehicleTitle: string;
  issueDate: string;
  expiryDate: string;
  centerNameAz: string;
  windshieldVerdictAz: string;
  wiperCyclesPerMin: number;
  hornMeasuredDbA: number;
  hornTypeAz: string;
  tachographStatusAz: string;
  overallStatus: 'PASS' | 'CONDITIONAL_REPAIR' | 'FAIL_PROHIBITED';
  qrSecurityHash: string;
}

export const WINDSHIELD_ZONES: WindshieldZoneSpec[] = [
  {
    id: 'clean',
    nameAz: 'Tam Şəffaf / Zədəsiz Alın Şüşəsi',
    code: 'ZONA-0 (TƏMİZ)',
    descriptionAz: 'Alın şüşəsində heç bir çat, daş izi və ya optik təhrif yoxdur.',
    isDriverCritical: false,
    legalClauseAz: 'YHQ Əlavə 1, Bölmə VII, Bənd 7.3 — Tam uyğundur',
  },
  {
    id: 'driver_sweep_a',
    nameAz: 'Sürücünün Şüşəsilən Baxış Zonası (Zona A — Kritik)',
    code: 'ZONA-A (SÜRÜCÜ)',
    descriptionAz: 'Sürücü tərəfdəki şüşəsilən fırçasının təmizlədiyi birbaşa yol görünüş sahəsi.',
    isDriverCritical: true,
    legalClauseAz: 'YHQ Əlavə 1, Bölmə VII, Bənd 7.3 — Sürücünün baxış zonasında çat olduqda texniki baxışdan keçmir',
  },
  {
    id: 'passenger_sweep_b',
    nameAz: 'Sərnişin Tərəfi Şüşəsilən Zonası (Zona B)',
    code: 'ZONA-B (SƏRNİŞİN)',
    descriptionAz: 'Sağ sərnişin tərəfdəki şüşəsilən fırçasının hərəkət trayektoriyası.',
    isDriverCritical: false,
    legalClauseAz: 'YHQ Əlavə 1, Bölmə VII — Sürücünün görünüşünü məhdudlaşdırmayan kiçik zədələrə icazə verilir',
  },
  {
    id: 'perimeter_edge_c',
    nameAz: 'Kənar / Perimetr İpək-Ekran Zonası (Zona C)',
    code: 'ZONA-C (KƏNAR)',
    descriptionAz: 'Şüşənin kənar çərçivəsi və yuxarı günəş zolağı ətrafı.',
    isDriverCritical: false,
    legalClauseAz: 'AZS / GOST R 51709 — Kənar zonada konstruktiv möhkəmliyi pozmayan izlər məqbuldur',
  },
];

export const HORN_SPECS: HornSpec[] = [
  {
    id: 'oem_dual_tone',
    nameAz: 'Zavod İki-Tonlu Harmonik Siqnal (OEM 400/500 Hz)',
    categoryLabelAz: 'Qanuni Zavod Standartı',
    defaultDbA: 104,
    frequencyHz: '400 Hz / 500 Hz sabit',
    isLegal: true,
    requiresConfiscation: false,
    prohibitsOperation: false,
    ixmArticleAz: 'YHQ Əlavə 1, Bənd 7.2 & UNECE R28 (93–112 dBA)',
    fineAzn: 0,
    descriptionAz: 'Zavod istehsalı olan sabit tezlikli iki-tonlu elektromaqnit səs siqnalı. Texniki baxış və BDYP tələblərinə tam cavab verir.',
  },
  {
    id: 'oem_single_disc',
    nameAz: 'Zavod Monoton Disk Siqnalı (OEM 420 Hz)',
    categoryLabelAz: 'Qanuni Zavod Standartı',
    defaultDbA: 98,
    frequencyHz: '420 Hz sabit',
    isLegal: true,
    requiresConfiscation: false,
    prohibitsOperation: false,
    ixmArticleAz: 'YHQ Əlavə 1, Bənd 7.2 & UNECE R28 (93–112 dBA)',
    fineAzn: 0,
    descriptionAz: 'Standart minik avtomobillərində tətbiq edilən tək diskli sabit akustik siqnal.',
  },
  {
    id: 'fifa_polyphonic',
    nameAz: 'Çoxtonlu "FİFA" / "Danq-Danq" Polifonik Siqnal',
    categoryLabelAz: 'Qadağan Olunmuş Konstruktiv Dəyişiklik',
    defaultDbA: 116,
    frequencyHz: 'Dəyişən polifonik melodiya',
    isLegal: false,
    requiresConfiscation: false,
    prohibitsOperation: true,
    ixmArticleAz: 'İXM Maddə 342.2-1 (Normativ tələbləri pozmaqla avadanlıq quraşdırılması)',
    fineAzn: 150,
    descriptionAz: 'Dəyişən tonlu pnevmatik/elektron "FİFA" və ya "Danq-Danq" siqnalları YHQ Əlavə 1-ə ziddir, 150 AZN cərimə və istismarın qadağan edilməsi ilə nəticələnir.',
  },
  {
    id: 'pneumatic_train_horn',
    nameAz: 'Yüksək Təzyiqli Kompressorlu Lokomotiv / TIR Trubası (>120 dBA)',
    categoryLabelAz: 'Normadan Artıq Akustik Təzyiq',
    defaultDbA: 124,
    frequencyHz: '180 Hz ağır pnevmatik',
    isLegal: false,
    requiresConfiscation: false,
    prohibitsOperation: true,
    ixmArticleAz: 'İXM Maddə 342.2-1 & UNECE R28 (>112 dBA akustik həddin aşılması)',
    fineAzn: 150,
    descriptionAz: '112 dBA maksimum normativ həddi aşan kompressorlu hava trubası digər hərəkət iştirakçılarında akustik şok yaradır və qadağandır.',
  },
  {
    id: 'sgu_police_siren',
    nameAz: 'Xüsusi Səs Siqnalı (SGU / Polis & Təcili Yardım Sirenası / "Kryukalkası")',
    categoryLabelAz: 'Xüsusi İcazəsiz Avadanlıq (Müsadirə)',
    defaultDbA: 120,
    frequencyHz: '500–1800 Hz modulyasiyalı SGU',
    isLegal: false,
    requiresConfiscation: true,
    prohibitsOperation: true,
    ixmArticleAz: 'İXM Maddə 342.9 (Xüsusi səs siqnallarının icazəsiz quraşdırılması)',
    fineAzn: 800,
    descriptionAz: 'Operativ nəqliyyat vasitələri üçün nəzərdə tutulmuş SGU sirenalarının mülki avtomobillərdə quraşdırılması 500–800 AZN cərimə və cihazın məhkəmə qaydasında müsadirəsinə səbəb olur!',
  },
  {
    id: 'broken_silent',
    nameAz: 'Nasaz / Səsi Çıxmayan Siqnal (Qoruyucu və ya Rele Yanıb)',
    categoryLabelAz: 'Texniki Nasazlıq',
    defaultDbA: 0,
    frequencyHz: '0 Hz (Səssiz)',
    isLegal: false,
    requiresConfiscation: false,
    prohibitsOperation: false,
    ixmArticleAz: 'YHQ Əlavə 1, Bənd 7.2 & İXM Maddə 342.1.7',
    fineAzn: 50,
    descriptionAz: 'Səs siqnalının işləməməsi qəza təhlükəsinin qarşısını almaq imkanını məhdudlaşdırır və 50 AZN cərimə yaradır.',
  },
];

export const WASHER_FLUID_SPECS: WasherFluidSpec[] = [
  {
    id: 'summer_water',
    nameAz: 'Yay Mayesi / Adi Distillə Suyu (0°C)',
    freezingPointC: 0,
    isopropylPercent: 0,
    isPumpWorking: true,
    recommendedRegionAz: 'Bakı və Abşeron (Aprel – Noyabr)',
  },
  {
    id: 'winter_minus_15',
    nameAz: 'Qış Antifriz Şüşəyuyanı (-15°C İzopropil)',
    freezingPointC: -15,
    isopropylPercent: 25,
    isPumpWorking: true,
    recommendedRegionAz: 'Bakı, Sumqayıt, Gəncə və Aran qış rejimi',
  },
  {
    id: 'arctic_minus_30',
    nameAz: 'Arktik Dağ Konsentratı (-30°C Nano-İzopropil)',
    freezingPointC: -30,
    isopropylPercent: 45,
    isPumpWorking: true,
    recommendedRegionAz: 'Şahdağ, Quba-Xınalıq, Kəlbəcər Murovdağ və Daşkəsən',
  },
  {
    id: 'empty_pump_dead',
    nameAz: 'Çən Boşdur və ya Şüşəyuyan Motoru Yanıb',
    freezingPointC: 0,
    isopropylPercent: 0,
    isPumpWorking: false,
    recommendedRegionAz: 'İstismar Qadağandır (YHQ Əlavə 1, Bənd 4.2)',
  },
];

export const VISIBILITY_REPAIR_PACKAGES: VisibilityRepairPackage[] = [
  {
    id: 'pkg-polymer-chip',
    nameAz: 'Alın Şüşəsində Daş İzi və Ulduz Çatın UV-Polimer İnyeksiyası',
    category: 'windshield',
    partsCostAzn: 25,
    laborCostAzn: 35,
    durationMinutes: 45,
    warrantyMonths: 12,
    fixesClauseAz: 'YHQ Əlavə 1, Bənd 7.3 (Çatın yayılmasının qarşısının alınması)',
    descriptionAz: 'ABŞ istehsalı optik fotopolimer qətran ilə <25 mm ulduz zədələrinin 90% şəffaflıqla bərpası.',
  },
  {
    id: 'pkg-oem-windshield',
    nameAz: 'Akustik Triplex Alın Şüşəsinin Tam Dəyişdirilməsi (Pilkington / AGC)',
    category: 'windshield',
    partsCostAzn: 290,
    laborCostAzn: 70,
    durationMinutes: 150,
    warrantyMonths: 24,
    fixesClauseAz: 'YHQ Əlavə 1, Bənd 7.3 (Sürücü baxış zonası A-da >10 sm çatın aradan qaldırılması)',
    descriptionAz: 'Yağış/işıq sensoru kalibrləməsi və poliuretan hermetik ilə orijinal sertifikatlı Triplex şüşə quraşdırılması.',
  },
  {
    id: 'pkg-bosch-wipers',
    nameAz: 'Bosch Aerotwin Şüşəsilən Fırça Dəsti + Şüşəyuyan Nasos & -25°C Maye',
    category: 'wipers',
    partsCostAzn: 65,
    laborCostAzn: 20,
    durationMinutes: 30,
    warrantyMonths: 12,
    fixesClauseAz: 'YHQ Əlavə 1, Bölmə IV, Bənd 4.1 & 4.2 (İXM Maddə 96.1.4 riskinin həlli)',
    descriptionAz: 'Sürücü və sərnişin tərəf silikon-qrafit fırçalar, forsunka tənzimlənməsi və 5L qış şüşəyuyan mayesi.',
  },
  {
    id: 'pkg-hella-horn',
    nameAz: 'Qadağan Olunmuş "FİFA" Sökülməsi & Zavod Hella İki-Tonlu (105 dBA) Siqnal Quraşdırılması',
    category: 'horn',
    partsCostAzn: 55,
    laborCostAzn: 30,
    durationMinutes: 40,
    warrantyMonths: 24,
    fixesClauseAz: 'YHQ Əlavə 1, Bənd 7.2 & İXM Maddə 342.2-1 (150 AZN cərimə riskinin həlli)',
    descriptionAz: 'Polifonik/pnevmatik trubanın demontajı, ştat naqillərinin bərpası və UNECE R28 sertifikatlı Hella siqnal dəsti.',
  },
  {
    id: 'pkg-mirrors-mudguards',
    nameAz: 'Yan Güzgü İsitmə Elementi + Arxa Palçıqqoruyucu Önlüklər (Brizqovik Dəsti)',
    category: 'mirrors_mudguards',
    partsCostAzn: 45,
    laborCostAzn: 25,
    durationMinutes: 35,
    warrantyMonths: 12,
    fixesClauseAz: 'YHQ Əlavə 1, Bənd 7.1, 7.3 & 7.5 (İXM Maddə 342.1.7 — 50 AZN)',
    descriptionAz: 'Kuzova uyğun zavod brizqovik dəsti və kor zona sferik yan güzgü şüşəsinin bərpası.',
  },
  {
    id: 'pkg-tachograph-seal',
    nameAz: 'Spidometr / Rəqəmsal Taxoqraf Kalibrləməsi və Rəsmi Plomblanması (AZS)',
    category: 'tachograph',
    partsCostAzn: 40,
    laborCostAzn: 60,
    durationMinutes: 60,
    warrantyMonths: 24,
    fixesClauseAz: 'YHQ Əlavə 1, Bənd 7.4 (Taxoqraf plombu və spidometr dəqiqliyi)',
    descriptionAz: 'Yük və sərnişin avtobusları üçün VDO/Stoneridge rəqəmsal taxoqrafın metrologiya yoxlaması və plomb vurulması.',
  },
];

export const ACCREDITED_VISIBILITY_CENTERS: AccreditedVisibilityCenter[] = [
  {
    id: 'vis-baku-zabrat',
    nameAz: 'BDYP Baş İdarəsi — Zabrat Müayinə Mərkəzi (Optik Görünüş & Akustika Laboratoriyası)',
    city: 'Bakı',
    addressAz: 'Bakı ş., Sabunçu r., Zabrat-Maştağa şossesi 1-ci km',
    accreditationCode: 'AZS-BDYP-GOR-001',
    servicesAz: ['Alın şüşəsi Zona-A ekspertizası', 'UNECE R28 Şumo-mer (dBA) testi', 'Şüşəsilən tezlik stendi'],
    waitMinutes: 14,
    workingHours: '09:00 – 18:00 (B.e – Şənbə)',
    phone: '+994 12 590 81 15',
  },
  {
    id: 'vis-baku-babek',
    nameAz: 'AutoGlass & Bosch Car Service — Babək Prospekti Mərkəzi',
    city: 'Bakı',
    addressAz: 'Bakı ş., Xətai r., Babək pr. 64',
    accreditationCode: 'AZS-GLS-2026-019',
    servicesAz: ['Pilkington/AGC Triplex şüşə dəyişimi', 'UV-Polimer çat təmiri', 'ADAS kamera kalibrləməsi'],
    waitMinutes: 20,
    workingHours: '08:30 – 20:00 (Hər gün)',
    phone: '+994 50 244 19 20',
  },
  {
    id: 'vis-baku-badamdar',
    nameAz: 'Badamdar Avtomobil Satış & Texniki Servis Kompleksi — Akustika və Elektrik Postu',
    city: 'Bakı',
    addressAz: 'Bakı ş., Səbail r., Badamdar şossesi 27',
    accreditationCode: 'AZS-AKU-2026-042',
    servicesAz: ['FİFA siqnal demontajı', 'OEM Hella siqnal quraşdırılması', 'Peç/Defroster və şüşəyuyan təmiri'],
    waitMinutes: 10,
    workingHours: '09:00 – 19:00 (Hər gün)',
    phone: '+994 55 310 44 88',
  },
  {
    id: 'vis-baku-darnagul',
    nameAz: 'AzTacho & Metrologiya Mərkəzi — Dərnəgül Sənaye Zonası',
    city: 'Bakı',
    addressAz: 'Bakı ş., Binəqədi r., Ziya Bünyadov pr. 108',
    accreditationCode: 'AYNA-TACHO-007',
    servicesAz: ['Rəqəmsal Taxoqraf plomblanması', 'Spidometr kalibrləməsi', 'AETR beynəlxalq sertifikatı'],
    waitMinutes: 18,
    workingHours: '09:00 – 18:00 (B.e – Cümə)',
    phone: '+994 12 567 32 10',
  },
  {
    id: 'vis-sumgayit',
    nameAz: 'Sumqayıt Regional BDYP & AvtoŞüşə Ekspertiza Mərkəzi',
    city: 'Sumqayıt',
    addressAz: 'Sumqayıt ş., Sülh küçəsi, 42-ci məhəllə',
    accreditationCode: 'AZS-SUM-GOR-012',
    servicesAz: ['Alın şüşəsi təmiri', 'Şüşəsilən & brizqovik komplektləşdirmə', 'Akustik dBA ölçümü'],
    waitMinutes: 12,
    workingHours: '09:00 – 18:00 (B.e – Şənbə)',
    phone: '+994 18 655 19 40',
  },
  {
    id: 'vis-ganja',
    nameAz: 'Gəncə Regional BDYP & Qərb Texniki Nəzarət Stansiyası',
    city: 'Gəncə',
    addressAz: 'Gəncə ş., Nizami Gəncəvi pr. 215 (Bakı-Qazax yolu çıxışı)',
    accreditationCode: 'AZS-GNJ-GOR-021',
    servicesAz: ['Zona-A şüşə yoxlaması', 'Taxoqraf plombu', 'Qış şüşəyuyan və defroster testi'],
    waitMinutes: 9,
    workingHours: '09:00 – 18:00 (B.e – Şənbə)',
    phone: '+994 22 256 71 04',
  },
];

export const INITIAL_VISIBILITY_CERTIFICATES: VisibilityHornCertificate[] = [
  {
    certificateNumber: 'BDYP-GOR-2026-84920',
    plateNumber: '99-XX-777',
    vin: 'JTMAB3FV80D129841',
    vehicleTitle: 'Toyota Land Cruiser 300 3.5 Twin-Turbo',
    issueDate: '2026-10-12',
    expiryDate: '2027-10-12',
    centerNameAz: 'BDYP Baş İdarəsi — Zabrat Müayinə Mərkəzi',
    windshieldVerdictAz: 'Zona-A təmizdir (0 çat, şəffaflıq 82%)',
    wiperCyclesPerMin: 46,
    hornMeasuredDbA: 105,
    hornTypeAz: 'Zavod İki-Tonlu Harmonik Siqnal (OEM 400/500 Hz)',
    tachographStatusAz: 'Spidometr plombu tamdır (M1 minik)',
    overallStatus: 'PASS',
    qrSecurityHash: 'AZS-GOR-99XX777-84920-VERIFIED',
  },
  {
    certificateNumber: 'BDYP-GOR-2026-51204',
    plateNumber: '77-AZ-010',
    vin: 'W1N2539841F829104',
    vehicleTitle: 'Mercedes-Benz GLC 300 4MATIC',
    issueDate: '2026-09-28',
    expiryDate: '2027-09-28',
    centerNameAz: 'AutoGlass & Bosch Car Service — Babək Prospekti',
    windshieldVerdictAz: 'Zona-B polimer təmirli (<12mm), Zona-A tam təmiz',
    wiperCyclesPerMin: 44,
    hornMeasuredDbA: 102,
    hornTypeAz: 'Zavod İki-Tonlu Harmonik Siqnal (OEM 400/500 Hz)',
    tachographStatusAz: 'Spidometr plombu tamdır (M1 minik)',
    overallStatus: 'PASS',
    qrSecurityHash: 'AZS-GOR-77AZ010-51204-VERIFIED',
  },
];

export type EngineEmissionType =
  | 'petrol_catalyst'
  | 'petrol_uncatalyzed'
  | 'lpg_cng'
  | 'diesel_turbo_dpf'
  | 'diesel_standard'
  | 'electric';

export type CatalystSystemStatus =
  | 'oem_intact'
  | 'euro4_universal'
  | 'clogged_degraded'
  | 'removed_bypass';

export type EuroStandardClass =
  | 'Euro-0/1/2'
  | 'Euro-3'
  | 'Euro-4'
  | 'Euro-5'
  | 'Euro-6'
  | 'Zero-Emission EV';

export interface EmissionNormRule {
  engineType: EngineEmissionType;
  labelAz: string;
  descriptionAz: string;
  maxCoIdlePercent: number;
  maxCoHighRpmPercent: number;
  maxChIdlePpm: number;
  maxChHighRpmPpm: number;
  minLambda: number;
  maxLambda: number;
  maxSmokeKValue: number; // m^-1 light absorption coefficient for diesel
  maxSmokeOpacityPercent: number;
  legalBasis: string;
  measurementMethodAz: string;
}

export interface ObdEmissionFaultCode {
  code: string;
  titleAz: string;
  system: 'catalyst' | 'dpf' | 'egr' | 'scr_adblue' | 'o2_sensor';
  symptomAz: string;
  failsTemizHavaRaid: boolean;
  estimatedFixCostAzn: number;
}

export interface CatalystServicePackage {
  id: string;
  nameAz: string;
  targetSystem: 'catalyst' | 'dpf' | 'scr_adblue' | 'diagnostics';
  euroStandard: string;
  warrantyMonths: number;
  priceAzn: number;
  durationMinutes: number;
  descriptionAz: string;
}

export interface EcoDiagnosticCenter {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  workingHours: string;
  accreditationCode: string;
  hasFiveGasAnalyzer: boolean;
  hasDieselOpacimeter: boolean;
  hasDpfCleaningStand: boolean;
  inspectionFeeAzn: number;
  rating: number;
}

export interface EcoComplianceCertificate {
  certificateNumber: string;
  plateNumber: string;
  vin: string;
  vehicleTitle: string;
  engineType: EngineEmissionType;
  euroClass: EuroStandardClass;
  catalystStatus: CatalystSystemStatus;
  measuredCoIdlePercent: number;
  measuredCoHighRpmPercent: number;
  measuredChPpm: number;
  measuredLambda: number;
  measuredSmokeK: number;
  ecoScore: number;
  isCompliant: boolean;
  issuedAt: string;
  expiresAt: string;
  inspectingCenter: string;
  qrSecurityHash: string;
}

export const EMISSION_NORM_RULES: Record<EngineEmissionType, EmissionNormRule> = {
  petrol_catalyst: {
    engineType: 'petrol_catalyst',
    labelAz: 'Benzin / Hibrid (Katalizatorlu — Euro-3/4/5/6)',
    descriptionAz: 'Üçkomponentli neytrallaşdırıcı (TWC katalizator) və oksigen (Lambda) sensoru ilə təchiz edilmiş müasir benzin və hibrid mühərriklər.',
    maxCoIdlePercent: 0.5,
    maxCoHighRpmPercent: 0.3,
    maxChIdlePpm: 100,
    maxChHighRpmPpm: 100,
    minLambda: 0.97,
    maxLambda: 1.03,
    maxSmokeKValue: 0,
    maxSmokeOpacityPercent: 0,
    legalBasis: 'YHQ Əlavə 1, Bölmə VI (Bənd 6.1) & AZS / GOST R 52033',
    measurementMethodAz: '5-komponentli Qazanalizator (800 dövr/dəq sərbəst gediş və 2500 dövr/dəq yüksək dövrə)',
  },
  petrol_uncatalyzed: {
    engineType: 'petrol_uncatalyzed',
    labelAz: 'Benzin (Zavod Katalizatorsuz — Euro-0/1/2)',
    descriptionAz: 'İstehsalçı tərəfindən katalizator nəzərdə tutulmayan köhnə nəsil karbüratorlu və ya erkən injektorlu benzin mühərrikləri.',
    maxCoIdlePercent: 1.5,
    maxCoHighRpmPercent: 2.0,
    maxChIdlePpm: 1200,
    maxChHighRpmPpm: 600,
    minLambda: 0.85,
    maxLambda: 1.15,
    maxSmokeKValue: 0,
    maxSmokeOpacityPercent: 0,
    legalBasis: 'YHQ Əlavə 1, Bölmə VI (Bənd 6.1–6.2)',
    measurementMethodAz: 'İnfraqırmızı Qazanalizator (CO % və karbohidrogen CH ppm ölçümü)',
  },
  lpg_cng: {
    engineType: 'lpg_cng',
    labelAz: 'Qazbalon Avadanlığı (LPG Propan-Butan / CNG Metan)',
    descriptionAz: 'Rəsmi AZS sertifikatlı LPG və ya CNG qaz avadanlığı ilə işləyən avtomobillər.',
    maxCoIdlePercent: 0.8,
    maxCoHighRpmPercent: 0.6,
    maxChIdlePpm: 300,
    maxChHighRpmPpm: 250,
    minLambda: 0.95,
    maxLambda: 1.05,
    maxSmokeKValue: 0,
    maxSmokeOpacityPercent: 0,
    legalBasis: 'YHQ Əlavə 1, Bölmə VI & AZS 636',
    measurementMethodAz: 'Qazanalizator (Qaz rejimində CO % və yanmamış CH ppm analizi)',
  },
  diesel_turbo_dpf: {
    engineType: 'diesel_turbo_dpf',
    labelAz: 'Dizel Turbo (DPF Qurum Filtri & AdBlue — Euro-4/5/6)',
    descriptionAz: 'DPF (Diesel Particulate Filter) qurum filtri və SCR/AdBlue sistemi ilə təchiz olunmuş müasir turbodizel mühərrikləri.',
    maxCoIdlePercent: 0,
    maxCoHighRpmPercent: 0,
    maxChIdlePpm: 0,
    maxChHighRpmPpm: 0,
    minLambda: 1.0,
    maxLambda: 2.5,
    maxSmokeKValue: 0.5,
    maxSmokeOpacityPercent: 15,
    legalBasis: 'YHQ Əlavə 1, Bölmə VI (Bənd 6.3) & UNECE R24',
    measurementMethodAz: 'Optik Tüstümər / Opasimer (Sərbəst təcillənmə rejimində işıq udma əmsalı k, m⁻¹)',
  },
  diesel_standard: {
    engineType: 'diesel_standard',
    labelAz: 'Dizel (DPF-siz Köhnə Nəsil Atmosfer / Turbo — Euro-2/3)',
    descriptionAz: 'DPF filtri olmayan standart atmosfer və ya erkən turbodizel mühərrikləri (YHQ normativi: atmosfer ≤2.5 m⁻¹, turbo ≤3.0 m⁻¹).',
    maxCoIdlePercent: 0,
    maxCoHighRpmPercent: 0,
    maxChIdlePpm: 0,
    maxChHighRpmPpm: 0,
    minLambda: 1.0,
    maxLambda: 2.5,
    maxSmokeKValue: 2.5,
    maxSmokeOpacityPercent: 40,
    legalBasis: 'YHQ Əlavə 1, Bölmə VI (Bənd 6.3 — GOST 21393)',
    measurementMethodAz: 'Optik Tüstümər (Sərbəst qazvermədə tüstülülük əmsalı k ≤ 2.5–3.0 m⁻¹)',
  },
  electric: {
    engineType: 'electric',
    labelAz: 'Tam Elektrik (BEV — Sıfır İxrac Qazı / Yaşıl Sinif)',
    descriptionAz: 'Daxili yanma mühərriki olmayan tam elektrikli nəqliyyat vasitələri (0.00% CO, 0 ppm CH, 0.00 m⁻¹ tüstü).',
    maxCoIdlePercent: 0,
    maxCoHighRpmPercent: 0,
    maxChIdlePpm: 0,
    maxChHighRpmPpm: 0,
    minLambda: 1.0,
    maxLambda: 1.0,
    maxSmokeKValue: 0,
    maxSmokeOpacityPercent: 0,
    legalBasis: 'AR Nazirlər Kabineti Ekoloji Təmiz Nəqliyyat Konsepsiyası',
    measurementMethodAz: 'İxrac borusu yoxdur — Avtomatik Yaşıl Ekoloji Sertifikat',
  },
};

export const OBD_EMISSION_FAULT_CODES: ObdEmissionFaultCode[] = [
  {
    code: 'P0420',
    titleAz: 'Katalizator Sisteminin Effektivliyi Normadan Aşağıdır (Bank 1)',
    system: 'catalyst',
    symptomAz: 'Katalizatorun keramik/metal şanları əriyib, tutulub və ya katalizator kəsilib çıxarılıb (Check Engine yanır, CO və CH normanı 3-5 dəfə aşır).',
    failsTemizHavaRaid: true,
    estimatedFixCostAzn: 420,
  },
  {
    code: 'P0430',
    titleAz: 'Katalizator Sisteminin Effektivliyi Normadan Aşağıdır (Bank 2 — V6/V8)',
    system: 'catalyst',
    symptomAz: 'İkinci silindr blokunun katalizator neytrallaşdırıcısı oksigen saxlama qabiliyyətini itirib.',
    failsTemizHavaRaid: true,
    estimatedFixCostAzn: 450,
  },
  {
    code: 'P2002',
    titleAz: 'Dizel Qurum Filtrinin (DPF) Effektivliyi Normadan Aşağıdır',
    system: 'dpf',
    symptomAz: 'DPF qurum filtri çatlayıb, deşilib və ya kəsilib; sərbəst qazvermədə qara tüstü (k > 1.8 m⁻¹) müşahidə olunur.',
    failsTemizHavaRaid: true,
    estimatedFixCostAzn: 350,
  },
  {
    code: 'P2463',
    titleAz: 'DPF Qurum Filtrində Həddindən Artıq Qurum Toplanması (Tutulma >80%)',
    system: 'dpf',
    symptomAz: 'Mühərrik qəza rejiminə (Limp Mode) düşür, eqzos əks-təzyiqi >30 kPa-a qalxır, aktiv regenerasiya tələb olunur.',
    failsTemizHavaRaid: true,
    estimatedFixCostAzn: 180,
  },
  {
    code: 'P0401',
    titleAz: 'EGR (İşlənmiş Qazların Resirkulyasiyası) Sistemində Axın Çatışmazlığı',
    system: 'egr',
    symptomAz: 'EGR klapanı və kollektor kanalları karbon çöküntüsü ilə tutulub, azot oksidləri (NOx) və tüstülülük artır.',
    failsTemizHavaRaid: true,
    estimatedFixCostAzn: 140,
  },
  {
    code: 'P20EE',
    titleAz: 'SCR / AdBlue NOx Katalizatorunun Effektivliyi Normadan Aşağıdır',
    system: 'scr_adblue',
    symptomAz: 'AdBlue forsunkası kristallaşıb və ya NOx sensoru sıradan çıxıb; mühərrikin işə düşməsinə km limiti qoyula bilər.',
    failsTemizHavaRaid: true,
    estimatedFixCostAzn: 290,
  },
  {
    code: 'P0130',
    titleAz: 'Birinci Oksigen (Lambda O2) Sensoru Dövrəsinin Nasazlığı (Bank 1 Sensor 1)',
    system: 'o2_sensor',
    symptomAz: 'Yanacaq-hava qarışığı (Lambda) düzgün tənzimlənmir, yanacaq sərfiyyatı +15-20% və CO % kəskin artır.',
    failsTemizHavaRaid: true,
    estimatedFixCostAzn: 130,
  },
];

export const CATALYST_SERVICE_PACKAGES: CatalystServicePackage[] = [
  {
    id: 'pkg-euro4-metal',
    nameAz: 'Sertifikatlı Euro-4 Metal Şanlı Katalizator Quraşdırılması',
    targetSystem: 'catalyst',
    euroStandard: 'Euro-4',
    warrantyMonths: 24,
    priceAzn: 380,
    durationMinutes: 90,
    descriptionAz: 'İstiliyə və zərbəyə davamlı paslanmayan polad şanlı (Pt/Pd/Rh örtüklü) Euro-4 katalizator kartricinin qaynaqla quraşdırılması və qazanalizator testi.',
  },
  {
    id: 'pkg-euro5-ceramic',
    nameAz: 'Yüksək Sıxlıqlı Euro-5/6 Keramik Katalizator Kartrici (400 CPSI)',
    targetSystem: 'catalyst',
    euroStandard: 'Euro-5 / Euro-6',
    warrantyMonths: 36,
    priceAzn: 560,
    durationMinutes: 120,
    descriptionAz: 'Müasir benzin və hibrid (Prius, Camry, Elantra, Cruze, BMW, Mercedes) avtomobillər üçün P0420 xətasını birdəfəlik aradan qaldıran orijinal sıxlıqlı keramik blok.',
  },
  {
    id: 'pkg-dpf-hydro',
    nameAz: 'DPF Qurum Filtrinin Stenddə Hidro-Kimyəvi Yuyulması & Regenerasiyası',
    targetSystem: 'dpf',
    euroStandard: 'Euro-4 / Euro-5 / Euro-6',
    warrantyMonths: 12,
    priceAzn: 180,
    durationMinutes: 150,
    descriptionAz: 'DPF və katalizatorun kəsilmədən yüksək təzyiqli kavitasiya stendində kül və qurumdan 98% təmizlənməsi, əks-təzyiq (kPa) protokolunun verilməsi.',
  },
  {
    id: 'pkg-egr-scr',
    nameAz: 'EGR Klapanı, Kollektor & AdBlue (SCR) Forsunka Kompleks Təmizliyi',
    targetSystem: 'scr_adblue',
    euroStandard: 'Euro-5 / Euro-6',
    warrantyMonths: 12,
    priceAzn: 160,
    durationMinutes: 120,
    descriptionAz: 'Dizel mühərriklərdə tüstülülüyü və NOx tullantılarını azaldan EGR, kollektor və AdBlue dozaj klapanının ultrasəs üsulu ilə təmizlənməsi.',
  },
  {
    id: 'pkg-endoscope-gas',
    nameAz: 'Video-Endoskopiya, Əks-Təzyiq Manometri & 5-Qaz Analizator Ekspertizası',
    targetSystem: 'diagnostics',
    euroStandard: 'Bütün Siniflər',
    warrantyMonths: 6,
    priceAzn: 45,
    durationMinutes: 30,
    descriptionAz: 'Alqı-satqı zamanı katalizatorun yerində və sağlam olmasının HD endoskop kamera ilə yoxlanılması, manometrlə əks-təzyiq və CO/CH ölçümü.',
  },
];

export const ECO_DIAGNOSTIC_CENTERS: EcoDiagnosticCenter[] = [
  {
    id: 'eco-center-1',
    name: 'BDYP & ETSN Sabunçu-Zabrat Mərkəzi Ekoloji Diaqnostika Stansiyası',
    city: 'Bakı',
    address: 'Sabunçu r., Zabrat-Maştağa şossesi, 1-ci km (BDYP Мuayinə Mərkəzi)',
    phone: '+994 12 590 81 15',
    workingHours: 'B.e. – Şənbə: 09:00 – 18:00',
    accreditationCode: 'AZS-ETSN-001',
    hasFiveGasAnalyzer: true,
    hasDieselOpacimeter: true,
    hasDpfCleaningStand: false,
    inspectionFeeAzn: 20,
    rating: 4.9,
  },
  {
    id: 'eco-center-2',
    name: 'Baku Catalyst & DPF Lab — Babək Prospekti Mərkəzi',
    city: 'Bakı',
    address: 'Xətai r., Babək prospekti 64 (Avtoşəhərcik korpus B)',
    phone: '+994 50 444 92 10',
    workingHours: 'Hər gün: 09:00 – 20:00',
    accreditationCode: 'AZS-EKO-104',
    hasFiveGasAnalyzer: true,
    hasDieselOpacimeter: true,
    hasDpfCleaningStand: true,
    inspectionFeeAzn: 35,
    rating: 4.8,
  },
  {
    id: 'eco-center-3',
    name: 'GreenAuto Euro-5/6 Ekoloji Servis & Qazanalizator Mərkəzi (Badamdar)',
    city: 'Bakı',
    address: 'Səbail r., Badamdar şossesi 21 (Avtomobil Satış Mərkəzinin yanı)',
    phone: '+994 55 310 77 40',
    workingHours: 'B.e. – Bazar: 09:30 – 19:00',
    accreditationCode: 'AZS-EKO-118',
    hasFiveGasAnalyzer: true,
    hasDieselOpacimeter: true,
    hasDpfCleaningStand: true,
    inspectionFeeAzn: 30,
    rating: 4.9,
  },
  {
    id: 'eco-center-4',
    name: 'Abşeron-Xırdalan DPF Hidro-Yuma & Katalizator Laboratoriyası',
    city: 'Xırdalan',
    address: 'Bakı-Quba şossesi 12-ci km, Ekoloji Nəzarət Postunun yanı',
    phone: '+994 70 620 14 88',
    workingHours: 'B.e. – Şənbə: 09:00 – 18:30',
    accreditationCode: 'AZS-EKO-129',
    hasFiveGasAnalyzer: true,
    hasDieselOpacimeter: true,
    hasDpfCleaningStand: true,
    inspectionFeeAzn: 25,
    rating: 4.7,
  },
  {
    id: 'eco-center-5',
    name: 'Sumqayıt Regional "Təmiz Hava" Qazanalizator & Ekoloji Stendi',
    city: 'Sumqayıt',
    address: 'Sumqayıt ş., Sülh küçəsi 48 (Giriş Ekoloji Postu)',
    phone: '+994 18 654 22 09',
    workingHours: 'B.e. – Şənbə: 09:00 – 18:00',
    accreditationCode: 'AZS-ETSN-042',
    hasFiveGasAnalyzer: true,
    hasDieselOpacimeter: true,
    hasDpfCleaningStand: false,
    inspectionFeeAzn: 20,
    rating: 4.6,
  },
  {
    id: 'eco-center-6',
    name: 'Gəncə Qərb Regional Ekoloji Nəzarət & DPF Diaqnostika Mərkəzi',
    city: 'Gəncə',
    address: 'Gəncə ş., Nizami Gəncəvi pr. 112 (Şəmkir çıxışı)',
    phone: '+994 22 256 41 90',
    workingHours: 'B.e. – Şənbə: 09:00 – 18:00',
    accreditationCode: 'AZS-ETSN-077',
    hasFiveGasAnalyzer: true,
    hasDieselOpacimeter: true,
    hasDpfCleaningStand: true,
    inspectionFeeAzn: 25,
    rating: 4.7,
  },
];

export const SAMPLE_ECO_CERTIFICATES: EcoComplianceCertificate[] = [
  {
    certificateNumber: 'BDYP-EKO-2026-84920',
    plateNumber: '99-XX-777',
    vin: 'JTDKB20U903491823',
    vehicleTitle: 'Toyota Camry 2.5 Hybrid',
    engineType: 'petrol_catalyst',
    euroClass: 'Euro-6',
    catalystStatus: 'oem_intact',
    measuredCoIdlePercent: 0.08,
    measuredCoHighRpmPercent: 0.05,
    measuredChPpm: 22,
    measuredLambda: 1.0,
    measuredSmokeK: 0,
    ecoScore: 98,
    isCompliant: true,
    issuedAt: '2026-09-12',
    expiresAt: '2027-09-12',
    inspectingCenter: 'BDYP & ETSN Sabunçu-Zabrat Mərkəzi Ekoloji Diaqnostika Stansiyası',
    qrSecurityHash: 'AZ-ETSN-BDYP-99XX777-E6-OK',
  },
  {
    certificateNumber: 'BDYP-EKO-2026-51204',
    plateNumber: '77-EK-202',
    vin: 'WBA5A7C50JB192841',
    vehicleTitle: 'BMW 530e Plug-in Hybrid',
    engineType: 'petrol_catalyst',
    euroClass: 'Euro-6',
    catalystStatus: 'oem_intact',
    measuredCoIdlePercent: 0.11,
    measuredCoHighRpmPercent: 0.09,
    measuredChPpm: 34,
    measuredLambda: 1.01,
    measuredSmokeK: 0,
    ecoScore: 96,
    isCompliant: true,
    issuedAt: '2026-10-01',
    expiresAt: '2027-10-01',
    inspectingCenter: 'GreenAuto Euro-5/6 Ekoloji Servis & Qazanalizator Mərkəzi (Badamdar)',
    qrSecurityHash: 'AZ-ETSN-BDYP-77EK202-E6-OK',
  },
];

export type BatteryChemistryId =
  | 'lfp_blade_400v'
  | 'nmc_ternary_400v'
  | 'nmc_silicon_800v'
  | 'nimh_hev_245v'
  | 'phev_erev_350v';

export type HvFaultConditionId =
  | 'clean_oem_intact'
  | 'p0aa6_insulation_leak'
  | 'p0a80_cell_imbalance'
  | 'flood_corrosion_hvil'
  | 'pyro_fuse_triggered';

export interface BatteryChemistryProfile {
  id: BatteryChemistryId;
  nameAz: string;
  chemistryCode: string;
  nominalVoltageV: number;
  typicalCapacityKwh: number;
  cycleLife80Percent: number;
  maxSafeCellDeltaMv: number;
  criticalCellDeltaMv: number;
  thermalRunawayOnsetC: number;
  typicalVehiclesAz: string;
  descriptionAz: string;
}

export interface HvFaultProfile {
  id: HvFaultConditionId;
  code: string;
  titleAz: string;
  severity: 'safe' | 'warning' | 'critical';
  legalReferenceAz: string;
  fineAzn: number;
  prohibitsOperation: boolean;
  descriptionAz: string;
}

export interface HvServicePackage {
  id: string;
  nameAz: string;
  category: 'diagnostics' | 'balancing' | 'insulation_repair' | 'cooling_avas';
  partsAndDutyAzn: number;
  laborCostAzn: number;
  durationMinutes: number;
  finesOrDamageAvoidedAzn: number;
  descriptionAz: string;
}

export interface AccreditedHvLabCenter {
  id: string;
  nameAz: string;
  authorityBadgeAz: string;
  city: string;
  addressAz: string;
  phone: string;
  workingHours: string;
  maxTestVoltageV: number;
  supports800VArchitecture: boolean;
  hasFhnThermalChamber: boolean;
  servicesAz: string[];
}

export interface HvBatteryComplianceCertificate {
  certificateNumber: string; // e.g. AZS-HV-2026-91408
  plateNumber: string;
  vin: string;
  vehicleTitle: string;
  chemistryNameAz: string;
  nominalVoltageV: number;
  measuredInsulationMohm: number;
  ohmPerVoltRatio: number;
  sohPercent: number;
  cellDeltaMv: number;
  avasCompliant: boolean;
  overallStatus: 'PASS' | 'CONDITIONAL_WARN' | 'FAIL_PROHIBITED';
  centerNameAz: string;
  issuedAt: string;
  validUntil: string;
  qrSecurityHash: string;
}

export const BATTERY_CHEMISTRY_PROFILES: BatteryChemistryProfile[] = [
  {
    id: 'lfp_blade_400v',
    nameAz: 'LFP (LiFePO4 — Litium-Dəmir-Fosfat / Blade)',
    chemistryCode: 'LFP-400V',
    nominalVoltageV: 400,
    typicalCapacityKwh: 71.8,
    cycleLife80Percent: 3500,
    maxSafeCellDeltaMv: 25,
    criticalCellDeltaMv: 60,
    thermalRunawayOnsetC: 270,
    typicalVehiclesAz: 'BYD秦/Song Plus/Seal, Tesla Model 3/Y RWD, Changan Qiyuan',
    descriptionAz:
      'Yüksək termiki sabitliyə (270°C) və 3500+ dövrə ömrünə malik LFP batareya arxitekturası.',
  },
  {
    id: 'nmc_ternary_400v',
    nameAz: 'NMC 811 (Li-NiMnCoO2 — Üçlü Litium 400V)',
    chemistryCode: 'NMC-400V',
    nominalVoltageV: 400,
    typicalCapacityKwh: 82.0,
    cycleLife80Percent: 1800,
    maxSafeCellDeltaMv: 20,
    criticalCellDeltaMv: 50,
    thermalRunawayOnsetC: 180,
    typicalVehiclesAz: 'BMW i4/iX3, Volkswagen ID.4/ID.6, Mercedes EQE',
    descriptionAz:
      'Yüksək enerji sıxlıqlı NMC elementləri; özək disbalansı (≤20 mV) və soyutma dövrəsi ciddi nəzarət tələb edir.',
  },
  {
    id: 'nmc_silicon_800v',
    nameAz: '800V SiC Yüksək Gərginlikli NMC Platforması',
    chemistryCode: 'NMC-800V',
    nominalVoltageV: 800,
    typicalCapacityKwh: 93.4,
    cycleLife80Percent: 2000,
    maxSafeCellDeltaMv: 20,
    criticalCellDeltaMv: 45,
    thermalRunawayOnsetC: 185,
    typicalVehiclesAz: 'Porsche Taycan, Zeekr 001/007, Hyundai Ioniq 5/6, Kia EV6',
    descriptionAz:
      '800V SiC inverter arxitekturası; UNECE R100 üzrə minimum 400 kΩ (≥500 Ω/V) izolyasiya müqaviməti tələb olunur.',
  },
  {
    id: 'nimh_hev_245v',
    nameAz: 'NiMH (Nikel-Metal-Hidrid Özüdolan Hibrid — HEV)',
    chemistryCode: 'NiMH-245V',
    nominalVoltageV: 245,
    typicalCapacityKwh: 1.6,
    cycleLife80Percent: 4000,
    maxSafeCellDeltaMv: 35,
    criticalCellDeltaMv: 120,
    thermalRunawayOnsetC: 240,
    typicalVehiclesAz: 'Toyota Camry Hybrid, Corolla Cross HEV, Prius, Lexus ES300h',
    descriptionAz:
      'Klassik Toyota/Lexus HEV batareya bloku; hava ventilyatoru filtri tutulması P0A80 blok aşınmasına səbəb olur.',
  },
  {
    id: 'phev_erev_350v',
    nameAz: 'PHEV / EREV (Plug-in & Ardıcıl Hibrid Batareya)',
    chemistryCode: 'PHEV-350V',
    nominalVoltageV: 350,
    typicalCapacityKwh: 42.8,
    cycleLife80Percent: 2200,
    maxSafeCellDeltaMv: 25,
    criticalCellDeltaMv: 55,
    thermalRunawayOnsetC: 195,
    typicalVehiclesAz: 'Li Auto L7/L9, BYD Destroyer 05 / Qin Plus DM-i, Changan UNI-Z',
    descriptionAz:
      'Həm daxili yanma generatoru, həm də DC sürətli şarj ilə işləyən yüksək yüklənməli PHEV/EREV batareyası.',
  },
];

export const HV_FAULT_PROFILES: HvFaultProfile[] = [
  {
    id: 'clean_oem_intact',
    code: 'OK-R100',
    titleAz: 'Zavod HV İzolyasiyası Tam Sazdır (Xəta Yoxdur)',
    severity: 'safe',
    legalReferenceAz: 'UNECE R100 & AZS Milli Texniki Reqlament',
    fineAzn: 0,
    prohibitsOperation: false,
    descriptionAz:
      'Yüksək gərginlikli narıncı şinlər, HVIL halqası, piropatron qoruyucu və batareya hermetikası tam normaldır.',
  },
  {
    id: 'p0aa6_insulation_leak',
    code: 'DTC P0AA6',
    titleAz: 'P0AA6 — Yüksək Gərginlik İzolyasiya Sızması (<500 Ω/V)',
    severity: 'critical',
    legalReferenceAz: 'UNECE R100 Bənd 5.1.3, YHQ Əlavə 1 & FHN Elektrik Təhlükəsizliyi',
    fineAzn: 150,
    prohibitsOperation: true,
    descriptionAz:
      'Batareya korpusuna nəm/antifriz sızması və ya kompressor/inverter izolyasiyasının deşilməsi səbəbilə korpusa yüksək gərginlik sızması.',
  },
  {
    id: 'p0a80_cell_imbalance',
    code: 'DTC P0A80 / P0A7F',
    titleAz: 'P0A80 — Batareya Özəklərinin Kritik Deqradasiyası (>60 mV)',
    severity: 'warning',
    legalReferenceAz: 'AZS HV Diaqnostika Reqlamenti & İstehsalçı Zəmanət Normativləri',
    fineAzn: 50,
    prohibitsOperation: false,
    descriptionAz:
      'Zəif batareya modulları səbəbilə gərginlik fərqi (Delta V) kritik həddi aşır, qəfil güc itkisi və qızma yaradır.',
  },
  {
    id: 'flood_corrosion_hvil',
    code: 'DTC U0111 / HVIL',
    titleAz: 'Suda Batmış (Flood/Copart) Korroziya və HVIL Qapalı Dövrə Pozuntusu',
    severity: 'critical',
    legalReferenceAz: 'YHQ Əlavə 1 Bənd 7.15, FHN Litium-İon Yanğın Reqlamenti & İXM 342.2-1',
    fineAzn: 150,
    prohibitsOperation: true,
    descriptionAz:
      'Suda qalmış avtomobildə HV konnektorlarında yaşıl oksidləşmə və təhlükəsizlik kilidi (HVIL) şuntlanması — yüksək termiki qaçış (yanğın) riski!',
  },
  {
    id: 'pyro_fuse_triggered',
    code: 'DTC B1421 / PYRO',
    titleAz: 'Qəza Sonrası HV Piropatron (Pyro-Fuse) Şuntlanması / Saxtakarlığı',
    severity: 'critical',
    legalReferenceAz: 'UNECE R100 & İXM Maddə 342.2-1 (150 ₼ + İstismarın Qadağan Edilməsi)',
    fineAzn: 150,
    prohibitsOperation: true,
    descriptionAz:
      'Qəzadan sonra atmış yüksək gərginlikli piropatron qoruyucusunun birbaşa mis lövhə ilə qaynaq edilərək BMS-in aldadılması.',
  },
];

export const HV_SERVICE_PACKAGES: HvServicePackage[] = [
  {
    id: 'hv-pkg-megohm-r100',
    nameAz: 'UNECE R100 Meqommetr (1000V) HV İzolyasiya & SOH% Stend Ekspertizası',
    category: 'diagnostics',
    partsAndDutyAzn: 25,
    laborCostAzn: 45,
    durationMinutes: 45,
    finesOrDamageAvoidedAzn: 150,
    descriptionAz:
      'Fluke 1587 FC meqommetr ilə inverter, kompressor və batareya şinlərinin Ω/V izolyasiya müqavimətinin və SOH%-in rəsmi ölçülməsi.',
  },
  {
    id: 'hv-pkg-cell-balancing',
    nameAz: 'HV Batareya Modullarının Stend Balanslaşdırılması (Delta mV Bərpası)',
    category: 'balancing',
    partsAndDutyAzn: 60,
    laborCostAzn: 180,
    durationMinutes: 240,
    finesOrDamageAvoidedAzn: 2400,
    descriptionAz:
      'Özəklər arası gərginlik fərqinin (Delta V) aktiv stend yükləməsi ilə ≤12 mV səviyyəsinə endirilməsi və tutumun bərpası.',
  },
  {
    id: 'hv-pkg-ip68-gasket-insulation',
    nameAz: 'P0AA6 İzolyasiya Bərpası, IP68 Hermetiklik & HVIL Konnektor Təmiri',
    category: 'insulation_repair',
    partsAndDutyAzn: 140,
    laborCostAzn: 160,
    durationMinutes: 180,
    finesOrDamageAvoidedAzn: 4500,
    descriptionAz:
      'Batareya korpusunun IP68 silikon konturunun yenilənməsi, su sızmasının aradan qaldırılması və HVIL halqasının bərpası.',
  },
  {
    id: 'hv-pkg-cooling-avas',
    nameAz: 'HV Batareya Soyutma (Chiller/Antifriz) Yuyulması & UNECE R138 AVAS Kalibrasiyası',
    category: 'cooling_avas',
    partsAndDutyAzn: 95,
    laborCostAzn: 75,
    durationMinutes: 90,
    finesOrDamageAvoidedAzn: 850,
    descriptionAz:
      'Dielektrik batareya antifrizinin dəyişdirilməsi, HEV ventilyator filtrinin təmizlənməsi və AVAS piyada dinamikinin 60 dBA tənzimlənməsi.',
  },
];

export const ACCREDITED_HV_LAB_CENTERS: AccreditedHvLabCenter[] = [
  {
    id: 'hv-lab-baku-babek',
    nameAz: 'AZS & BDYP Mərkəzi Elektromobil Yüksək Gərginlik (HV) Laboratoriyası',
    authorityBadgeAz: 'AZS / BDYP / FHN Rəsmi HV Stendi',
    city: 'Bakı',
    addressAz: 'Xətai r., Babək pr. 64 (Elektromobil Ekspertiza Mərkəzi)',
    phone: '+994 12 511 40 80',
    workingHours: 'B.e. – Şənbə: 09:00 – 19:00',
    maxTestVoltageV: 1000,
    supports800VArchitecture: true,
    hasFhnThermalChamber: true,
    servicesAz: [
      'UNECE R100 1000V İzolyasiya Testi',
      'SOH% & Delta mV Ekspertizası',
      'AZS-HV-2026 Sertifikatı',
    ],
  },
  {
    id: 'hv-lab-baku-ziya',
    nameAz: 'TokBaku & Bosch HV Battery Diagnostics Hub (Dərnəgül)',
    authorityBadgeAz: 'AZS & İstehsalçı Akkreditasiyalı',
    city: 'Bakı',
    addressAz: 'Nərimanov r., Ziya Bünyadov pr. 118',
    phone: '+994 12 436 88 20',
    workingHours: 'Hər gün: 09:00 – 20:00',
    maxTestVoltageV: 1000,
    supports800VArchitecture: true,
    hasFhnThermalChamber: true,
    servicesAz: [
      '800V SiC İnverter Testi',
      'LFP/NMC Özək Balanslaşdırılması',
      'UNECE R138 AVAS Akustik Testi',
    ],
  },
  {
    id: 'hv-lab-baku-badamdar',
    nameAz: 'Badamdar Avtomobil Ekspertiza & Hibrid/EV Stendi',
    authorityBadgeAz: 'BDYP & AZS Sertifikatlı',
    city: 'Bakı',
    addressAz: 'Səbail r., Badamdar şossesi 14 (Avtobazar korpusu)',
    phone: '+994 50 255 90 11',
    workingHours: 'Hər gün: 08:30 – 18:30',
    maxTestVoltageV: 1000,
    supports800VArchitecture: true,
    hasFhnThermalChamber: false,
    servicesAz: [
      'Alqı-Satqı Öncəsi SOH% Yoxlaması',
      'Suda Batmış (Flood) HV Korroziya Auditi',
      'Piropatron Ekspertizası',
    ],
  },
  {
    id: 'hv-lab-sumgayit-byd',
    nameAz: 'Sumqayıt Kimya Sənaye Parkı — EV & LFP Texniki Mərkəzi',
    authorityBadgeAz: 'AZS & Sənaye Parkı Laboratoriyası',
    city: 'Sumqayıt',
    addressAz: 'Sumqayıt ş., Bakı-Quba şossesi km 32',
    phone: '+994 18 654 22 19',
    workingHours: 'B.e. – Cümə: 09:00 – 18:00',
    maxTestVoltageV: 1000,
    supports800VArchitecture: true,
    hasFhnThermalChamber: true,
    servicesAz: [
      'LFP Blade Batareya Stendi',
      'FHN Termiki Qaçış Sınağı',
      'IP68 Hermetiklik Yoxlaması',
    ],
  },
  {
    id: 'hv-lab-baku-recebli',
    nameAz: 'Nərimanov Hibrid & PHEV (Toyota/Li Auto/BYD) Servis Stendi',
    authorityBadgeAz: 'AZS Akkreditasiyalı Mərkəz',
    city: 'Bakı',
    addressAz: 'Nərimanov r., Əhməd Rəcəbli küç. 42',
    phone: '+994 55 310 77 44',
    workingHours: 'B.e. – Şənbə: 09:30 – 19:00',
    maxTestVoltageV: 750,
    supports800VArchitecture: false,
    hasFhnThermalChamber: false,
    servicesAz: [
      'NiMH & PHEV Modul Balansı',
      'P0A80 / P0AA6 Xəta Təmiri',
      'Batareya Soyutma Sistemi',
    ],
  },
  {
    id: 'hv-lab-ganja',
    nameAz: 'Gəncə Regional Elektromobil & Hibrid Təhlükəsizlik Mərkəzi',
    authorityBadgeAz: 'Qərb Regional AZS / BDYP Stendi',
    city: 'Gəncə',
    addressAz: 'Gəncə ş., Nizami Gəncəvi pr. 210',
    phone: '+994 22 256 41 90',
    workingHours: 'B.e. – Şənbə: 09:00 – 18:00',
    maxTestVoltageV: 1000,
    supports800VArchitecture: true,
    hasFhnThermalChamber: false,
    servicesAz: [
      'Regional HV İzolyasiya Ekspertizası',
      'SOH% Diaqnostikası',
      'Rəsmi AZS-HV Sertifikatı',
    ],
  },
];

export const SAMPLE_HV_CERTIFICATES: HvBatteryComplianceCertificate[] = [
  {
    certificateNumber: 'AZS-HV-2026-91408',
    plateNumber: '77-EV-099',
    vin: 'LGXC76C44R0192841',
    vehicleTitle: 'BYD Song Plus Champion EV (LFP Blade)',
    chemistryNameAz: 'LFP (LiFePO4 — Litium-Dəmir-Fosfat / Blade)',
    nominalVoltageV: 400,
    measuredInsulationMohm: 185,
    ohmPerVoltRatio: 462500,
    sohPercent: 96,
    cellDeltaMv: 11,
    avasCompliant: true,
    overallStatus: 'PASS',
    centerNameAz: 'AZS & BDYP Mərkəzi Elektromobil Yüksək Gərginlik (HV) Laboratoriyası',
    issuedAt: '2026-10-15',
    validUntil: '2027-10-15',
    qrSecurityHash: 'AZS-R100-77EV099-96SOH-PASS',
  },
  {
    certificateNumber: 'AZS-HV-2026-44219',
    plateNumber: '90-HB-412',
    vin: '4T1B11HK5LU821943',
    vehicleTitle: 'Toyota Camry 2.5 Hybrid (XV70)',
    chemistryNameAz: 'NiMH (Nikel-Metal-Hidrid Özüdolan Hibrid — HEV)',
    nominalVoltageV: 245,
    measuredInsulationMohm: 120,
    ohmPerVoltRatio: 489795,
    sohPercent: 89,
    cellDeltaMv: 19,
    avasCompliant: true,
    overallStatus: 'PASS',
    centerNameAz: 'TokBaku & Bosch HV Battery Diagnostics Hub (Dərnəgül)',
    issuedAt: '2026-10-12',
    validUntil: '2027-10-12',
    qrSecurityHash: 'AZS-R100-90HB412-89SOH-PASS',
  },
];

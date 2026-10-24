export type SalvageCategoryKey =
  | 'STRUCTURAL_TOTAL_LOSS'
  | 'HEAVY_COLLISION_REPAIRABLE'
  | 'MEDIUM_BODY_COLLISION'
  | 'FLOOD_SUBMERSION'
  | 'HAIL_COSMETIC_LOSS';

export type AirbagDeploymentStatus =
  | 'ALL_INTACT'
  | 'DEPLOYED_REPLACED_OEM'
  | 'DEPLOYED_DUMMY_RESISTOR_DETECTED'
  | 'UNVERIFIED';

export type TitleBrandType =
  | 'SALVAGE_CERTIFICATE'
  | 'CLEAN_TITLE'
  | 'NON_REPAIRABLE_DESTRUCTION'
  | 'REBUILT_TITLE'
  | 'WATER_FLOOD_SALVAGE';

export interface SalvageCategoryInfo {
  key: SalvageCategoryKey;
  code: string;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  severityLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  statutoryThresholdPct: number;
  roadCirculationPermitted: boolean;
  requiresRoboticFrameBench: boolean;
  descriptionAz: string;
}

export interface ChassisDatumPoint {
  id: string;
  labelAz: string;
  labelEn: string;
  nominalMm: number;
  measuredDeviationMm: number;
  maxToleranceMm: number;
  xPct: number;
  yPct: number;
}

export interface UltrasoundWeldJoint {
  id: string;
  jointLocationAz: string;
  jointLocationEn: string;
  penetrationDepthPct: number;
  porosityDetected: boolean;
  minPenetrationRequiredPct: number;
  structuralCritical: boolean;
}

export interface SalvageAuctionPreset {
  id: string;
  makeModel: string;
  vin: string;
  lotNumber: string;
  year: number;
  auctionSource: 'Copart USA' | 'IAAI USA' | 'AutoBid Europe' | 'Baku Local Crash';
  preAccidentValueAzn: number;
  estimatedRepairCostAzn: number;
  auctionHammerPriceUsd: number;
  shippingAndCustomsAzn: number;
  titleBrand: TitleBrandType;
  categoryKey: SalvageCategoryKey;
  airbagStatus: AirbagDeploymentStatus;
  primaryDamageAz: string;
  secondaryDamageAz: string;
  odometerMiles: number;
}

export interface AccreditedSalvageCenter {
  id: string;
  name: string;
  city: 'Bakı' | 'Sumqayıt' | 'Gəncə';
  address: string;
  phone: string;
  benchEquipment: string;
  ultrasoundScanner: string;
  certifiedTechnicians: number;
  dailyCapacity: number;
  rating: number;
  priceAzn: number;
  lat: number;
  lng: number;
}

export interface MockSalvageCertificate {
  certificateNumber: string;
  vin: string;
  lotNumber?: string;
  plateNumber: string;
  vehicleMakeModel: string;
  year: number;
  categoryKey: SalvageCategoryKey;
  status: 'TOTAL_LOSS_CERTIFIED' | 'ROAD_CIRCULATION_APPROVED' | 'CIRCULATION_REVOKED';
  damageRatioPct: number;
  preAccidentValueAzn: number;
  repairCostAzn: number;
  salvageScrapValueAzn: number;
  chassisMaxDeviationMm: number;
  ultrasoundWeldPass: boolean;
  airbagStatus: AirbagDeploymentStatus;
  inspectionCenterId: string;
  issueDate: string;
  leadExpert: string;
  digitalSecurityHash: string;
}

export const SALVAGE_CATEGORIES: Record<SalvageCategoryKey, SalvageCategoryInfo> = {
  STRUCTURAL_TOTAL_LOSS: {
    key: 'STRUCTURAL_TOTAL_LOSS',
    code: 'CAT-A',
    nameAz: 'Kateqoriya A: Konstruktiv Məhv / Qəzalı Şassi («Perevyortiş»)',
    nameEn: 'Category A: Severe Structural Distortion / Rollover',
    nameRu: 'Категория А: Конструктивная гибель / Нарушение геометрии кузова',
    severityLevel: 'CRITICAL',
    statutoryThresholdPct: 75,
    roadCirculationPermitted: false,
    requiresRoboticFrameBench: true,
    descriptionAz: 'Kuzovun daşıyıcı sütunları və döşəmə panelləri geri dönüşü olmayan deformasiyaya uğramışdır. Avtomobilin bərpası qadağandır, yalnız ehtiyat hissə və utilizasiyaya yararlıdır.'
  },
  HEAVY_COLLISION_REPAIRABLE: {
    key: 'HEAVY_COLLISION_REPAIRABLE',
    code: 'CAT-B',
    nameAz: 'Kateqoriya B: Ağır Ön/Arxa Toqquşma (Lanjeron Bərpası Tələb Edilir)',
    nameEn: 'Category B: Heavy Subframe Collision (Robot Jig Required)',
    nameRu: 'Категория B: Тяжелое столкновение (Требуется стапель Celette)',
    severityLevel: 'HIGH',
    statutoryThresholdPct: 70,
    roadCirculationPermitted: true,
    requiresRoboticFrameBench: true,
    descriptionAz: 'Lanjeronlar və çanaq zədələnib. Robotlaşdırılmış 3D Celette / Car-O-Liner stendində çəkilmə və ultrasəs qaynaq tikişi ekspertizası tələb olunur.'
  },
  MEDIUM_BODY_COLLISION: {
    key: 'MEDIUM_BODY_COLLISION',
    code: 'CAT-C',
    nameAz: 'Kateqoriya C: Orta Zədə / Asqı və Qapı-Qanad Zərəri',
    nameEn: 'Category C: Moderate Collision / Suspension & Panels',
    nameRu: 'Категория C: Средние повреждения навесных элементов и подвески',
    severityLevel: 'MEDIUM',
    statutoryThresholdPct: 50,
    roadCirculationPermitted: true,
    requiresRoboticFrameBench: false,
    descriptionAz: 'Daşıyıcı şassi sağ qalmışdır. Asqı qolları, amortizatorlar, qanadlar və radiatorlar dəyişdirildikdən sonra standart texniki baxışdan keçə bilər.'
  },
  FLOOD_SUBMERSION: {
    key: 'FLOOD_SUBMERSION',
    code: 'CAT-D',
    nameAz: 'Kateqoriya D: Su/Daşqın Batması («Suda Qalmış» / Korroziya Riski)',
    nameEn: 'Category D: Water / Flood Submersion (Harness Corrosion)',
    nameRu: 'Категория D: Затопление / Утопленник (Окисление проводки и ЭБУ)',
    severityLevel: 'CRITICAL',
    statutoryThresholdPct: 70,
    roadCirculationPermitted: false,
    requiresRoboticFrameBench: false,
    descriptionAz: 'Göstərici paneli və mühərrik səviyyəsinə qədər suya batmışdır. Naqil dəstələrinin daxili oksidləşməsi və ABS/SRS beyin nasazlığı riskinə görə sığorta tərəfindən Konstruktiv Məhv elan edilir.'
  },
  HAIL_COSMETIC_LOSS: {
    key: 'HAIL_COSMETIC_LOSS',
    code: 'CAT-E',
    nameAz: 'Kateqoriya E: Dolu Zədəsi / Kosmetik Qalıq Zərər',
    nameEn: 'Category E: Hail / Cosmetic Skin Panel Write-Off',
    nameRu: 'Категория E: Повреждения градом / Косметическое списание',
    severityLevel: 'LOW',
    statutoryThresholdPct: 40,
    roadCirculationPermitted: true,
    requiresRoboticFrameBench: false,
    descriptionAz: 'Şassi və təhlükəsizlik sistemləri 100% saz vəziyyətdədir. Dam və kapot panelində kosmetik dolu batıqları mövcuddur; PDR vakuum texnologiyası ilə bərpa oluna bilər.'
  }
};

export const INITIAL_CHASSIS_POINTS: ChassisDatumPoint[] = [
  { id: 'FL_RAIL', labelAz: 'Sol Ön Lanjeron Ucluğu', labelEn: 'Front Left Subframe Rail', nominalMm: 850.0, measuredDeviationMm: 0.8, maxToleranceMm: 2.0, xPct: 28, yPct: 20 },
  { id: 'FR_RAIL', labelAz: 'Sağ Ön Lanjeron Ucluğu', labelEn: 'Front Right Subframe Rail', nominalMm: 850.0, measuredDeviationMm: 1.2, maxToleranceMm: 2.0, xPct: 72, yPct: 20 },
  { id: 'L_STRUT', labelAz: 'Sol Amortizator Çanağı', labelEn: 'Left Strut Tower Dome', nominalMm: 1040.0, measuredDeviationMm: 0.5, maxToleranceMm: 2.0, xPct: 24, yPct: 35 },
  { id: 'R_STRUT', labelAz: 'Sağ Amortizator Çanağı', labelEn: 'Right Strut Tower Dome', nominalMm: 1040.0, measuredDeviationMm: 0.9, maxToleranceMm: 2.0, xPct: 76, yPct: 35 },
  { id: 'L_A_PILLAR', labelAz: 'Sol Ön A-Sütun Bünövrəsi', labelEn: 'Left A-Pillar Base', nominalMm: 1320.0, measuredDeviationMm: 0.4, maxToleranceMm: 2.0, xPct: 20, yPct: 48 },
  { id: 'R_A_PILLAR', labelAz: 'Sağ Ön A-Sütun Bünövrəsi', labelEn: 'Right A-Pillar Base', nominalMm: 1320.0, measuredDeviationMm: 0.7, maxToleranceMm: 2.0, xPct: 80, yPct: 48 },
  { id: 'L_B_PILLAR', labelAz: 'Sol Orta B-Sütunu', labelEn: 'Left B-Pillar Center', nominalMm: 1480.0, measuredDeviationMm: 0.3, maxToleranceMm: 2.0, xPct: 18, yPct: 62 },
  { id: 'R_B_PILLAR', labelAz: 'Sağ Orta B-Sütunu', labelEn: 'Right B-Pillar Center', nominalMm: 1480.0, measuredDeviationMm: 0.6, maxToleranceMm: 2.0, xPct: 82, yPct: 62 },
  { id: 'REAR_PANEL', labelAz: 'Arxa Döşəmə / Qəza Paneli', labelEn: 'Rear Floor Pan Center', nominalMm: 1110.0, measuredDeviationMm: 1.1, maxToleranceMm: 2.0, xPct: 50, yPct: 85 }
];

export const INITIAL_WELD_JOINTS: UltrasoundWeldJoint[] = [
  { id: 'W1', jointLocationAz: 'Ön Lanjeron Zavod Nöqtəvi Qaynağı', jointLocationEn: 'Front Subframe Factory Spot Welds', penetrationDepthPct: 94, porosityDetected: false, minPenetrationRequiredPct: 85, structuralCritical: true },
  { id: 'W2', jointLocationAz: 'Sağ A-Sütun Bərpa Qovşağı', jointLocationEn: 'Right A-Pillar Structural Node', penetrationDepthPct: 91, porosityDetected: false, minPenetrationRequiredPct: 85, structuralCritical: true },
  { id: 'W3', jointLocationAz: 'Sol Eşik / Qapı Altlığı Qaynağı', jointLocationEn: 'Left Rocker Sill Seam', penetrationDepthPct: 88, porosityDetected: false, minPenetrationRequiredPct: 85, structuralCritical: false },
  { id: 'W4', jointLocationAz: 'Arxa Çanaq / Qanad Birləşməsi', jointLocationEn: 'Rear Quarter Panel Joint', penetrationDepthPct: 96, porosityDetected: false, minPenetrationRequiredPct: 85, structuralCritical: true }
];

export const SALVAGE_VEHICLE_PRESETS: SalvageAuctionPreset[] = [
  {
    id: 'COP-HYU-2021',
    makeModel: 'Hyundai Elantra SEL',
    vin: '5NPD74LF7MH198421',
    lotNumber: '68492014',
    year: 2021,
    auctionSource: 'Copart USA',
    preAccidentValueAzn: 32000,
    estimatedRepairCostAzn: 25600,
    auctionHammerPriceUsd: 4800,
    shippingAndCustomsAzn: 8500,
    titleBrand: 'SALVAGE_CERTIFICATE',
    categoryKey: 'HEAVY_COLLISION_REPAIRABLE',
    airbagStatus: 'DEPLOYED_REPLACED_OEM',
    primaryDamageAz: 'Ön hissədən toqquşma (Front End Crash)',
    secondaryDamageAz: 'Asqı mexanizminin əyilməsi (Underگفت/Suspension)',
    odometerMiles: 41200
  },
  {
    id: 'IAAI-BMW-2020',
    makeModel: 'BMW 530i xDrive M-Sport',
    vin: 'WBAJA7C55LWC48102',
    lotNumber: '35198205',
    year: 2020,
    auctionSource: 'IAAI USA',
    preAccidentValueAzn: 74000,
    estimatedRepairCostAzn: 58500,
    auctionHammerPriceUsd: 8900,
    shippingAndCustomsAzn: 14200,
    titleBrand: 'WATER_FLOOD_SALVAGE',
    categoryKey: 'FLOOD_SUBMERSION',
    airbagStatus: 'ALL_INTACT',
    primaryDamageAz: 'Su batması / Su səviyyəsi oturacaqlara qədər (Water / Flood)',
    secondaryDamageAz: 'Elektrik bloklarının sıradan çıxması (Electrical Malfunction)',
    odometerMiles: 29800
  },
  {
    id: 'BAKU-TOY-2022',
    makeModel: 'Toyota Camry 2.5 Hybrid',
    vin: '4T1B11HK5NU719304',
    lotNumber: 'BAKU-LOCAL-882',
    year: 2022,
    auctionSource: 'Baku Local Crash',
    preAccidentValueAzn: 56000,
    estimatedRepairCostAzn: 44200,
    auctionHammerPriceUsd: 0,
    shippingAndCustomsAzn: 0,
    titleBrand: 'SALVAGE_CERTIFICATE',
    categoryKey: 'HEAVY_COLLISION_REPAIRABLE',
    airbagStatus: 'DEPLOYED_DUMMY_RESISTOR_DETECTED',
    primaryDamageAz: 'Heydər Əliyev prospekti yol ayrıcında yan zərbə (Side T-Bone Collision)',
    secondaryDamageAz: 'B-Sütununun əyilməsi və pərdə yastıqlarının partlaması',
    odometerMiles: 34500
  },
  {
    id: 'COP-MER-2019',
    makeModel: 'Mercedes-Benz E 300 4MATIC',
    vin: 'WDDZF4KB2KA510938',
    lotNumber: '71049281',
    year: 2019,
    auctionSource: 'Copart USA',
    preAccidentValueAzn: 68000,
    estimatedRepairCostAzn: 56000,
    auctionHammerPriceUsd: 7200,
    shippingAndCustomsAzn: 13500,
    titleBrand: 'NON_REPAIRABLE_DESTRUCTION',
    categoryKey: 'STRUCTURAL_TOTAL_LOSS',
    airbagStatus: 'DEPLOYED_REPLACED_OEM',
    primaryDamageAz: 'Avtomagistralda aşıb yuvarlanma (All-Over Rollover Crash)',
    secondaryDamageAz: 'Dam karkasının çökməsi və şassi burulması',
    odometerMiles: 59300
  },
  {
    id: 'AUT-VOL-2023',
    makeModel: 'Volkswagen Golf 8 1.5 eTSI',
    vin: 'WVWZZZCDZPW049182',
    lotNumber: 'EU-HAM-901',
    year: 2023,
    auctionSource: 'AutoBid Europe',
    preAccidentValueAzn: 42000,
    estimatedRepairCostAzn: 12500,
    auctionHammerPriceUsd: 11500,
    shippingAndCustomsAzn: 6800,
    titleBrand: 'CLEAN_TITLE',
    categoryKey: 'HAIL_COSMETIC_LOSS',
    airbagStatus: 'ALL_INTACT',
    primaryDamageAz: 'Şiddətli dolu zərəri (Hail / Cosmetic Exterior PDR)',
    secondaryDamageAz: 'Şüşələrin cızılması',
    odometerMiles: 16200
  }
];

export const ACCREDITED_SALVAGE_CENTERS: AccreditedSalvageCenter[] = [
  {
    id: 'CTR-BAKU-CELETTE',
    name: 'Baku Prestige Collision & 3D Celette Center',
    city: 'Bakı',
    address: 'Nərimanov r-nu, Ziya Bünyadov pr. 118B',
    phone: '+994 (12) 565-44-11',
    benchEquipment: 'Celette Griffon 3D Robotic Bench + NAJA Laser Metrology',
    ultrasoundScanner: 'Olympus OmniScan SX Phased Array Flaw Detector',
    certifiedTechnicians: 8,
    dailyCapacity: 6,
    rating: 4.95,
    priceAzn: 380,
    lat: 40.4124,
    lng: 49.8719
  },
  {
    id: 'CTR-ZABRAT-FORENSIC',
    name: 'BDYP Zabrat Mərkəzi Qəza Ekspertiza və Bərpa Laboratoriyası',
    city: 'Bakı',
    address: 'Sabunçu r-nu, Zabrat-1 qəsəbəsi, DYP Qeydiyyat Şöbəsi yanı',
    phone: '+994 (12) 450-20-99',
    benchEquipment: 'Car-O-Liner BenchRack 5500 + PointX Measuring System',
    ultrasoundScanner: 'Krautkramer USM 36 Flaw Detector',
    certifiedTechnicians: 12,
    dailyCapacity: 10,
    rating: 4.88,
    priceAzn: 320,
    lat: 40.4851,
    lng: 49.9482
  },
  {
    id: 'CTR-AUTOLUX-BABEK',
    name: 'Autolux Azerbaijan Official Structural Repair Yard',
    city: 'Bakı',
    address: 'Xətai r-nu, Babək pr. 22B',
    phone: '+994 (12) 490-88-00',
    benchEquipment: 'Chief Goliath 3D Heavy Pulling Stand + LaserLock System',
    ultrasoundScanner: 'Sonatest Sitescan 500S Ultrasonic Gauge',
    certifiedTechnicians: 6,
    dailyCapacity: 5,
    rating: 4.92,
    priceAzn: 420,
    lat: 40.3855,
    lng: 49.8821
  },
  {
    id: 'CTR-SUMGAYIT-BODY',
    name: 'Sumqayıt Avtoservis və Şassi Diaqnostika Kompleksi',
    city: 'Sumqayıt',
    address: 'Sumqayıt şəhəri, Sülh küç. 45 (Baku-Guba trassı çıxışı)',
    phone: '+994 (18) 642-15-55',
    benchEquipment: 'Spanesi 106 Bench + Touch Electronic Measuring',
    ultrasoundScanner: 'Olympus Epoch 650 Ultrasonic Instrument',
    certifiedTechnicians: 5,
    dailyCapacity: 4,
    rating: 4.81,
    priceAzn: 260,
    lat: 40.5897,
    lng: 49.6685
  },
  {
    id: 'CTR-GANJA-EXPRESS',
    name: 'Gəncə Regional Qəzalı Nəqliyyat Bərpa Mərkəzi',
    city: 'Gəncə',
    address: 'Gəncə şəhəri, Şah İsmayıl Xətai pr. 102',
    phone: '+994 (22) 256-78-19',
    benchEquipment: 'Car-O-Liner Quick 42 + Car-O-Tronic Vision2',
    ultrasoundScanner: 'GE Phasor 16/16 Phased Array Flaw Detector',
    certifiedTechnicians: 4,
    dailyCapacity: 4,
    rating: 4.79,
    priceAzn: 240,
    lat: 40.6828,
    lng: 46.3606
  }
];

export const MOCK_ACTIVE_SALVAGE_CERTIFICATES: MockSalvageCertificate[] = [
  {
    certificateNumber: 'ISB-TOT-2026-00184',
    vin: '5NPD74LF7MH198421',
    lotNumber: '68492014',
    plateNumber: '77-XD-219',
    vehicleMakeModel: 'Hyundai Elantra SEL 2021',
    year: 2021,
    categoryKey: 'HEAVY_COLLISION_REPAIRABLE',
    status: 'ROAD_CIRCULATION_APPROVED',
    damageRatioPct: 80.0,
    preAccidentValueAzn: 32000,
    repairCostAzn: 25600,
    salvageScrapValueAzn: 9600,
    chassisMaxDeviationMm: 1.2,
    ultrasoundWeldPass: true,
    airbagStatus: 'DEPLOYED_REPLACED_OEM',
    inspectionCenterId: 'CTR-BAKU-CELETTE',
    issueDate: '2026-09-14',
    leadExpert: 'Mühəndis-Ekspert Rəşad Quliyev (Vəsiqə #AZS-EXP-114)',
    digitalSecurityHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  },
  {
    certificateNumber: 'ISB-TOT-2026-00207',
    vin: 'WBAJA7C55LWC48102',
    lotNumber: '35198205',
    plateNumber: '10-AA-509',
    vehicleMakeModel: 'BMW 530i xDrive 2020',
    year: 2020,
    categoryKey: 'FLOOD_SUBMERSION',
    status: 'CIRCULATION_REVOKED',
    damageRatioPct: 79.1,
    preAccidentValueAzn: 74000,
    repairCostAzn: 58500,
    salvageScrapValueAzn: 22000,
    chassisMaxDeviationMm: 0.9,
    ultrasoundWeldPass: true,
    airbagStatus: 'ALL_INTACT',
    inspectionCenterId: 'CTR-ZABRAT-FORENSIC',
    issueDate: '2026-10-02',
    leadExpert: 'Baş Avtotexnik Polkovnik-leytenant Elvin Məmmədov',
    digitalSecurityHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'
  },
  {
    certificateNumber: 'ISB-TOT-2026-00311',
    vin: 'WDDZF4KB2KA510938',
    lotNumber: '71049281',
    plateNumber: '99-ZZ-812',
    vehicleMakeModel: 'Mercedes-Benz E 300 2019',
    year: 2019,
    categoryKey: 'STRUCTURAL_TOTAL_LOSS',
    status: 'TOTAL_LOSS_CERTIFIED',
    damageRatioPct: 82.4,
    preAccidentValueAzn: 68000,
    repairCostAzn: 56000,
    salvageScrapValueAzn: 15000,
    chassisMaxDeviationMm: 5.8,
    ultrasoundWeldPass: false,
    airbagStatus: 'DEPLOYED_REPLACED_OEM',
    inspectionCenterId: 'CTR-AUTOLUX-BABEK',
    issueDate: '2026-10-18',
    leadExpert: 'Baş Ekspert Fərid Nəzərov (Dövlət Məhkəmə Ekspertizası Mərkəzi)',
    digitalSecurityHash: 'cb8379ac2098aa165029e3938a51da0bcecfc008fd6795f401178647f96c5b34'
  }
];

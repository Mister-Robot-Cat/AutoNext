export type VehicleBrakeClass = 'M1_passenger' | 'N1_light_truck' | 'N2_N3_heavy_truck' | 'M2_M3_bus' | 'L3_motorcycle';

export type RoadSurfaceCondition = 'dry_asphalt' | 'wet_asphalt' | 'snow_ice';

export type BrakeFluidType = 'DOT_3' | 'DOT_4' | 'DOT_4_LV' | 'DOT_5_1';

export type PowerSteeringType = 'eps_electric' | 'ehps_electro_hydraulic' | 'hps_hydraulic' | 'manual_rack';

export interface StatutoryBrakeSteeringNorm {
  vehicleClass: VehicleBrakeClass;
  labelAz: string;
  labelEn: string;
  testSpeedKmh: number;
  maxStoppingDistanceM: number; // YHQ Annex 1 Clause 1.2 (at 40 km/h, 30 km/h for L3)
  minDecelerationMs2: number; // m/s^2
  minSpecificBrakeForce: number; // gamma_T ratio
  maxFrontAxleImbalancePercent: number; // Left/Right % difference
  maxRearAxleImbalancePercent: number;
  minHandbrakeSlopeFullLoadPercent: number; // YHQ Annex 1 Clause 1.5 (16%)
  minHandbrakeSlopeCurbWeightPercent: number; // YHQ Annex 1 Clause 1.5 (23% M1/Bus, 31% Truck)
  maxSteeringPlayDegrees: number; // YHQ Annex 1 Clause 2.1 (10° M1, 20° Bus, 25° Truck)
}

export interface RoadSurfaceSpec {
  id: RoadSurfaceCondition;
  nameAz: string;
  frictionCoefficient: number; // mu
  absEfficiencyMultiplier: number;
  bakuContextAz: string;
}

export interface BrakeFluidSpec {
  id: BrakeFluidType;
  name: string;
  dryBoilingPointC: number;
  wetBoilingPointC: number; // at 3.7% moisture
  maxSafeMoisturePercent: number;
  recommendedIntervalMonths: number;
  descriptionAz: string;
}

export interface BrakeServicePackage {
  id: string;
  nameAz: string;
  category: 'pads_rotors' | 'fluid_hydraulic' | 'steering_rack' | 'handbrake_abs';
  avgPartsCostAzn: number;
  avgLaborCostAzn: number;
  durationMinutes: number;
  warrantyKm: number;
  resolvesClause: string;
  descriptionAz: string;
}

export interface BrakeDiagnosticCenter {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  workingHours: string;
  rollerStandBrand: string; // e.g. MAHA IW-2 Eurosystem, Bosch BSA 4340
  hasLuftometer: boolean;
  hasDotMoistureTester: boolean;
  diagnosticFeeAzn: number;
  certifiedBy: string;
  rating: number;
}

export interface BrakeSteeringCertificate {
  certificateNumber: string; // e.g. BDYP-TRM-2026-84102
  plateNumber: string;
  vin: string;
  vehicleTitle: string;
  vehicleClass: VehicleBrakeClass;
  stoppingDistance40KmhM: number;
  frontImbalancePercent: number;
  rearImbalancePercent: number;
  handbrakeSlopePercent: number;
  steeringPlayDegrees: number;
  dotMoisturePercent: number;
  safetyScore: number;
  isRoadworthy: boolean;
  inspectingCenterName: string;
  issueDate: string;
  expiryDate: string;
  qrSecurityHash: string;
}

export const STATUTORY_BRAKE_STEERING_NORMS: Record<VehicleBrakeClass, StatutoryBrakeSteeringNorm> = {
  M1_passenger: {
    vehicleClass: 'M1_passenger',
    labelAz: 'M1 — Minik avtomobilləri (≤ 8 oturacaq)',
    labelEn: 'M1 — Passenger Cars',
    testSpeedKmh: 40,
    maxStoppingDistanceM: 14.7,
    minDecelerationMs2: 5.8,
    minSpecificBrakeForce: 0.59,
    maxFrontAxleImbalancePercent: 15,
    maxRearAxleImbalancePercent: 20,
    minHandbrakeSlopeFullLoadPercent: 16,
    minHandbrakeSlopeCurbWeightPercent: 23,
    maxSteeringPlayDegrees: 10,
  },
  N1_light_truck: {
    vehicleClass: 'N1_light_truck',
    labelAz: 'N1 — Yüngül yük avtomobilləri (≤ 3.5 ton)',
    labelEn: 'N1 — Light Commercial Trucks',
    testSpeedKmh: 40,
    maxStoppingDistanceM: 18.3,
    minDecelerationMs2: 5.0,
    minSpecificBrakeForce: 0.51,
    maxFrontAxleImbalancePercent: 15,
    maxRearAxleImbalancePercent: 20,
    minHandbrakeSlopeFullLoadPercent: 16,
    minHandbrakeSlopeCurbWeightPercent: 31,
    maxSteeringPlayDegrees: 25,
  },
  N2_N3_heavy_truck: {
    vehicleClass: 'N2_N3_heavy_truck',
    labelAz: 'N2/N3 — Ağır yük avtomobilləri (> 3.5 ton)',
    labelEn: 'N2/N3 — Heavy Freight Trucks',
    testSpeedKmh: 40,
    maxStoppingDistanceM: 18.3,
    minDecelerationMs2: 5.0,
    minSpecificBrakeForce: 0.51,
    maxFrontAxleImbalancePercent: 15,
    maxRearAxleImbalancePercent: 20,
    minHandbrakeSlopeFullLoadPercent: 16,
    minHandbrakeSlopeCurbWeightPercent: 31,
    maxSteeringPlayDegrees: 25,
  },
  M2_M3_bus: {
    vehicleClass: 'M2_M3_bus',
    labelAz: 'M2/M3 — Sərnişin avtobusları və mikroavtobuslar',
    labelEn: 'M2/M3 — Passenger Buses',
    testSpeedKmh: 40,
    maxStoppingDistanceM: 18.3,
    minDecelerationMs2: 5.0,
    minSpecificBrakeForce: 0.51,
    maxFrontAxleImbalancePercent: 15,
    maxRearAxleImbalancePercent: 20,
    minHandbrakeSlopeFullLoadPercent: 16,
    minHandbrakeSlopeCurbWeightPercent: 23,
    maxSteeringPlayDegrees: 20,
  },
  L3_motorcycle: {
    vehicleClass: 'L3_motorcycle',
    labelAz: 'L3 — Motosiklet və mopidlər',
    labelEn: 'L3 — Motorcycles',
    testSpeedKmh: 30,
    maxStoppingDistanceM: 7.5,
    minDecelerationMs2: 5.5,
    minSpecificBrakeForce: 0.55,
    maxFrontAxleImbalancePercent: 15,
    maxRearAxleImbalancePercent: 20,
    minHandbrakeSlopeFullLoadPercent: 16,
    minHandbrakeSlopeCurbWeightPercent: 18,
    maxSteeringPlayDegrees: 5,
  },
};

export const ROAD_SURFACE_SPECS: Record<RoadSurfaceCondition, RoadSurfaceSpec> = {
  dry_asphalt: {
    id: 'dry_asphalt',
    nameAz: 'Quru Asfalt (Standart Etalon — μ = 0.80)',
    frictionCoefficient: 0.80,
    absEfficiencyMultiplier: 0.96,
    bakuContextAz: 'Heydər Əliyev pr., Hava Limanı şossesi və Bakı-Quba M-1 quru yay asfalt örtüyü',
  },
  wet_asphalt: {
    id: 'wet_asphalt',
    nameAz: 'Yağışlı / Nəm Asfalt (Sürüşkən — μ = 0.50)',
    frictionCoefficient: 0.50,
    absEfficiencyMultiplier: 0.90,
    bakuContextAz: 'Payız-qış Bakı yağışlarında Ziya Bünyadov və Tbilisi pr. su təbəqəli asfalt',
  },
  snow_ice: {
    id: 'snow_ice',
    nameAz: 'Qarlı / Buzlu Örtük (Kritik — μ = 0.25)',
    frictionCoefficient: 0.25,
    absEfficiencyMultiplier: 0.85,
    bakuContextAz: 'Ağsu aşırımı, Şahdağ yolu, Yasamal və Badamdar enişlərində şaxtalı buz',
  },
};

export const BRAKE_FLUID_SPECS: Record<BrakeFluidType, BrakeFluidSpec> = {
  DOT_3: {
    id: 'DOT_3',
    name: 'DOT-3 (Glikol əsaslı standart)',
    dryBoilingPointC: 205,
    wetBoilingPointC: 140,
    maxSafeMoisturePercent: 2.5,
    recommendedIntervalMonths: 18,
    descriptionAz: 'Köhnə nəsil avtomobillər üçün standart maye; yüksək dağ enişlərində tez qızır.',
  },
  DOT_4: {
    id: 'DOT_4',
    name: 'DOT-4 Standard (Borat efirli)',
    dryBoilingPointC: 230,
    wetBoilingPointC: 155,
    maxSafeMoisturePercent: 3.0,
    recommendedIntervalMonths: 24,
    descriptionAz: 'Müasir minik avtomobillərinin 80%-də zavod tərəfindən tövsiyə olunan əsas tormoz mayesi.',
  },
  DOT_4_LV: {
    id: 'DOT_4_LV',
    name: 'DOT-4 Class 6 Low Viscosity (ESP/ABS)',
    dryBoilingPointC: 265,
    wetBoilingPointC: 175,
    maxSafeMoisturePercent: 3.0,
    recommendedIntervalMonths: 24,
    descriptionAz: 'Müasir ESP, ASR və avtomatik toqquşma əleyhinə sistemli avtomobillər üçün aşağı özlülüklü maye.',
  },
  DOT_5_1: {
    id: 'DOT_5_1',
    name: 'DOT-5.1 High Performance (Qeyri-silikon)',
    dryBoilingPointC: 270,
    wetBoilingPointC: 190,
    maxSafeMoisturePercent: 3.0,
    recommendedIntervalMonths: 36,
    descriptionAz: 'Ağır SUV-lar, idman avtomobilləri və dağ aşırımlarında intensiv yük altında işləyən əyləclər üçün.',
  },
};

export const BRAKE_STEERING_SERVICE_PACKAGES: BrakeServicePackage[] = [
  {
    id: 'pkg-front-pads-rotors',
    nameAz: 'Ön Əyləc Bəndləri (Nakladka) və Əyləc Disklərinin Dəyişdirilməsi',
    category: 'pads_rotors',
    avgPartsCostAzn: 240,
    avgLaborCostAzn: 50,
    durationMinutes: 60,
    warrantyKm: 30000,
    resolvesClause: 'YHQ Əlavə 1, Bənd 1.2 (Tormoz yolu və ox üzrə qeyri-bərabərlik)',
    descriptionAz: 'OEM keramika/yarı-metal əyləc bəndləri, ventilyasiyalı disklər və супport istiqamətləndiricilərinin yağlanması.',
  },
  {
    id: 'pkg-dot4-flush',
    nameAz: 'Tormoz Mayesinin (DOT-4 LV) Aparatla Tam Yenilənməsi və Havasının Çıxarılması',
    category: 'fluid_hydraulic',
    avgPartsCostAzn: 35,
    avgLaborCostAzn: 30,
    durationMinutes: 40,
    warrantyKm: 40000,
    resolvesClause: 'YHQ Əlavə 1, Bənd 1.1 & 1.3 (Hidravlik ötürücü kipliyi və buxar tıxacı riski)',
    descriptionAz: 'Nəmliyi >3% olan köhnə mayenin təzyiqli stendlə əvəzlənməsi və ABS blokunun kalibrlənməsi.',
  },
  {
    id: 'pkg-handbrake-epb',
    nameAz: 'Duracaq Tormozu (Əl Əyləci Trosu / EPB Servomotor) Tənzimlənməsi',
    category: 'handbrake_abs',
    avgPartsCostAzn: 75,
    avgLaborCostAzn: 40,
    durationMinutes: 45,
    warrantyKm: 25000,
    resolvesClause: 'YHQ Əlavə 1, Bənd 1.5 (16% / 23% / 31% maillikdə saxlama normativi)',
    descriptionAz: 'Arxa baraban/kolodka tənzimlənməsi, tros gərilməsi və ya elektron EPB aktuatorunun bərpası.',
  },
  {
    id: 'pkg-steering-tie-rods',
    nameAz: 'Sükan Dartqıları (Tiyaqa), Ucluqlar (Nakoneçnik) və 3D Razval Stendi',
    category: 'steering_rack',
    avgPartsCostAzn: 130,
    avgLaborCostAzn: 60,
    durationMinutes: 75,
    warrantyKm: 35000,
    resolvesClause: 'YHQ Əlavə 1, Bənd 2.1 & 2.2 (Sükan çarxının cəmi lüftü ≤10° normativi)',
    descriptionAz: 'Sükan çarxındakı boşluğu aradan qaldıran yeni oynaq ucluqları, qoruyucu körüklər və lazer bucaq tənzimlənməsi.',
  },
  {
    id: 'pkg-steering-rack-overhaul',
    nameAz: 'Sükan Reykasının (EPS / Hidravlik ГУР) Əsaslı Təmiri və Kipkəclərin Bərpası',
    category: 'steering_rack',
    avgPartsCostAzn: 290,
    avgLaborCostAzn: 140,
    durationMinutes: 180,
    warrantyKm: 50000,
    resolvesClause: 'YHQ Əlavə 1, Bənd 2.3 (Sükan gücləndiricisi nasazlığı və yağ sızması)',
    descriptionAz: 'Sükan reykasının val cilalanması, yüksək təzyiq salniklərinin dəyişdirilməsi və EPS fırlanma anı sensoru kalibrasiyası.',
  },
];

export const BRAKE_DIAGNOSTIC_CENTERS: BrakeDiagnosticCenter[] = [
  {
    id: 'center-sabunchu-bdyp',
    name: 'BDYP Sabunçu Mərkəzi Texniki Müayinə və Tormoz Stendi',
    city: 'Bakı',
    address: 'Sabunçu r., Zabrat-Maştağa şossesi 1-ci km',
    phone: '+994 12 590 81 15',
    workingHours: 'B.e - Şənbə: 09:00 - 18:00',
    rollerStandBrand: 'MAHA IW-2 Eurosystem (Almaniya)',
    hasLuftometer: true,
    hasDotMoistureTester: true,
    diagnosticFeeAzn: 30,
    certifiedBy: 'DİN BDYPİ & AZS Milli Akkreditasiya',
    rating: 4.9,
  },
  {
    id: 'center-lökbatan-meyvəli',
    name: 'BDYP Qaradağ (Meyvəli) Ağır Nəqliyyat və Minik Tormoz Laboratoriyası',
    city: 'Bakı',
    address: 'Qaradağ r., Lökbatan qəs., Bakı Dairəvi Yolu',
    phone: '+994 12 590 81 22',
    workingHours: 'B.e - Şənbə: 09:00 - 18:00',
    rollerStandBrand: 'MAHA MBT 7250 Heavy & Passenger',
    hasLuftometer: true,
    hasDotMoistureTester: true,
    diagnosticFeeAzn: 30,
    certifiedBy: 'DİN BDYPİ & AYNA',
    rating: 4.8,
  },
  {
    id: 'center-babek-bosch',
    name: 'Bosch Car Service Baku — Rəsmi Tormoz & Sükan Lüftometr Mərkəzi',
    city: 'Bakı',
    address: 'Xətai r., Babək prospekti 65',
    phone: '+994 50 225 44 10',
    workingHours: 'Hər gün: 09:00 - 20:00',
    rollerStandBrand: 'Bosch BSA 4340 Roller Brake Tester',
    hasLuftometer: true,
    hasDotMoistureTester: true,
    diagnosticFeeAzn: 40,
    certifiedBy: 'AZS ISO/IEC 17025 & Robert Bosch GmbH',
    rating: 4.9,
  },
  {
    id: 'center-khirdalan-azs',
    name: 'Abşeron Avto-Sınaq — Sükan Reykası və Əyləc Dinamometr Stendi',
    city: 'Xırdalan',
    address: 'Bakı-Quba şossesi 11-ci km (Ekologiya postu yanı)',
    phone: '+994 55 310 90 80',
    workingHours: 'B.e - Şənbə: 09:00 - 19:00',
    rollerStandBrand: 'Cartec BDE 2304 Digital Stand',
    hasLuftometer: true,
    hasDotMoistureTester: true,
    diagnosticFeeAzn: 25,
    certifiedBy: 'AZS Standartlaşdırma İnstitutu',
    rating: 4.7,
  },
  {
    id: 'center-sumgayit-mero',
    name: 'Sumqayıt Regional BDYP Texniki Nəzarət və Tormoz Stendi',
    city: 'Sumqayıt',
    address: 'Sülh küçəsi, Giriş magistralı 3-cü km',
    phone: '+994 18 655 19 02',
    workingHours: 'B.e - Şənbə: 09:00 - 18:00',
    rollerStandBrand: 'MAHA IW-2 Digital',
    hasLuftometer: true,
    hasDotMoistureTester: true,
    diagnosticFeeAzn: 25,
    certifiedBy: 'DİN BDYPİ Sumqayıt Regional Şöbəsi',
    rating: 4.8,
  },
  {
    id: 'center-ganja-regional',
    name: 'Gəncə Regional Авто-Diaqnostika & Tormoz Stendi Mərkəzi',
    city: 'Gəncə',
    address: 'Nizami Gəncəvi pr. 148 (Yevlax şossesi çıxışı)',
    phone: '+994 22 256 71 40',
    workingHours: 'B.e - Şənbə: 09:00 - 18:00',
    rollerStandBrand: 'Bosch BSA 4200',
    hasLuftometer: true,
    hasDotMoistureTester: false,
    diagnosticFeeAzn: 20,
    certifiedBy: 'DİN BDYPİ Gəncə Regional Şöbəsi',
    rating: 4.7,
  },
];

export const SAMPLE_BRAKE_CERTIFICATES: BrakeSteeringCertificate[] = [
  {
    certificateNumber: 'BDYP-TRM-2026-84102',
    plateNumber: '99-AA-777',
    vin: 'JTMAB3FV40D012984',
    vehicleTitle: 'Toyota Land Cruiser 300 3.5 Twin-Turbo',
    vehicleClass: 'M1_passenger',
    stoppingDistance40KmhM: 11.4,
    frontImbalancePercent: 4.2,
    rearImbalancePercent: 6.1,
    handbrakeSlopePercent: 28,
    steeringPlayDegrees: 3.5,
    dotMoisturePercent: 0.8,
    safetyScore: 97,
    isRoadworthy: true,
    inspectingCenterName: 'BDYP Sabunçu Mərkəzi Texniki Müayinə və Tormoz Stendi',
    issueDate: '2026-09-12',
    expiryDate: '2027-09-12',
    qrSecurityHash: 'AZ-BDYP-TRM-84102-99AA777-VERIFIED',
  },
  {
    certificateNumber: 'BDYP-TRM-2026-51908',
    plateNumber: '10-VP-404',
    vin: 'WDD2130421A592811',
    vehicleTitle: 'Mercedes-Benz E 200 AMG Line',
    vehicleClass: 'M1_passenger',
    stoppingDistance40KmhM: 10.8,
    frontImbalancePercent: 3.0,
    rearImbalancePercent: 4.8,
    handbrakeSlopePercent: 30,
    steeringPlayDegrees: 2.8,
    dotMoisturePercent: 1.1,
    safetyScore: 99,
    isRoadworthy: true,
    inspectingCenterName: 'Bosch Car Service Baku — Rəsmi Tormoz & Sükan Lüftometr Mərkəzi',
    issueDate: '2026-10-01',
    expiryDate: '2027-10-01',
    qrSecurityHash: 'AZ-BDYP-TRM-51908-10VP404-VERIFIED',
  },
];

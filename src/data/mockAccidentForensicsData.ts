/**
 * AutoNext - Mock Data for Traffic Accident (YNH) Forensic Investigation,
 * Skid Mark Telemetry & Forensic Reconstruction
 */

import { ForensicReportData, RoadSurfaceCondition, InjurySeverity, DriverSobriety } from '../utils/accidentForensics';

export interface AccidentPreset {
  id: string;
  titleAz: string;
  titleEn: string;
  locationAz: string;
  vehiclePlate: string;
  vehicleModel: string;
  skidMarkLengthM: number;
  roadSurface: RoadSurfaceCondition;
  slopeGradientPercent: number;
  speedLimitKmh: number;
  hazardDistanceM: number;
  injurySeverity: InjurySeverity;
  driverSobriety: DriverSobriety;
  propertyDamageAzn: number;
  medicalBillsAzn: number;
  driverFaultPercent: number;
  descriptionAz: string;
}

export interface ForensicInstitution {
  id: string;
  nameAz: string;
  nameEn: string;
  addressAz: string;
  phone: string;
  email: string;
  workingHours: string;
  specializationAz: string;
  leadExpertAz: string;
}

export const MOCK_ACCIDENT_PRESETS: AccidentPreset[] = [
  {
    id: 'preset_heydar_aliyev_pedestrian',
    titleAz: 'Heydər Əliyev pr. nizamlanmayan piyada keçidi toqquşması',
    titleEn: 'Heydar Aliyev Ave unsignaled pedestrian crossing impact',
    locationAz: 'Bakı şəhəri, Heydər Əliyev prospekti (Bağırov körpüsü yaxınlığı)',
    vehiclePlate: '90-OX-404',
    vehicleModel: 'BMW 530i (G30)',
    skidMarkLengthM: 32.5,
    roadSurface: 'dry_asphalt',
    slopeGradientPercent: 0,
    speedLimitKmh: 60,
    hazardDistanceM: 45.0,
    injurySeverity: 'moderate_harm',
    driverSobriety: 'sober',
    propertyDamageAzn: 3200,
    medicalBillsAzn: 4500,
    driverFaultPercent: 100,
    descriptionAz: 'Piyada keçidinə yaxınlaşarkən sürət həddini (60 km/s) aşaraq 78.6 km/s ilə hərəkət etmiş və 32.5 m tormoz izi buraxmışdır.'
  },
  {
    id: 'preset_tbilisi_wet_intersection',
    titleAz: 'Tbilisi prospekti yağışlı hava yolayrıcı toqquşması',
    titleEn: 'Tbilisi Avenue wet weather intersection collision',
    locationAz: 'Bakı şəhəri, Tbilisi prospekti və Həsən Əliyev küçəsi kəsişməsi',
    vehiclePlate: '77-BB-512',
    vehicleModel: 'Toyota Camry 2.5 Hybrid',
    skidMarkLengthM: 26.0,
    roadSurface: 'wet_asphalt',
    slopeGradientPercent: -2,
    speedLimitKmh: 50,
    hazardDistanceM: 38.0,
    injurySeverity: 'none_property_only',
    driverSobriety: 'sober',
    propertyDamageAzn: 6400,
    medicalBillsAzn: 0,
    driverFaultPercent: 70,
    descriptionAz: 'Yağışlı asfaltda sarı işıqdan keçməyə cəhd edərkən 26 metr sürüşmə izi ilə dönən nəqliyyat vasitəsinə çırpılmışdır.'
  },
  {
    id: 'preset_sumgayit_corridor_highspeed',
    titleAz: 'M-1 Bakı-Quba magistralı kəskin sürət aşımı və aşma',
    titleEn: 'M-1 Baku-Quba highway excessive speed and rollover',
    locationAz: 'M-1 Bakı-Quba-Rusiya avtomobil yolu, 38-ci km (Ceyranbatan qəsəbəsi)',
    vehiclePlate: '99-ZZ-099',
    vehicleModel: 'Mercedes-Benz E300 (W213)',
    skidMarkLengthM: 58.0,
    roadSurface: 'dry_asphalt',
    slopeGradientPercent: 1,
    speedLimitKmh: 90,
    hazardDistanceM: 52.0,
    injurySeverity: 'severe_harm',
    driverSobriety: 'alcohol_intoxicated',
    propertyDamageAzn: 18500,
    medicalBillsAzn: 12000,
    driverFaultPercent: 100,
    descriptionAz: 'Magistralda 110 km/s-dən yüksək sürətlə hərəkət edərkən sərxoş vəziyyətdə maneə ilə toqquşaraq yol kənarına aşmışdır.'
  },
  {
    id: 'preset_shamakhi_winter_ice',
    titleAz: 'M-4 Şamaxı aşırımı gizli qara buz və zəncirvari qəza',
    titleEn: 'M-4 Shamakhi pass black ice and chain collision',
    locationAz: 'M-4 Bakı-Şamaxı-Yevlax magistralı, 102-ci km (Ağsu aşırımı)',
    vehiclePlate: '10-AA-818',
    vehicleModel: 'Hyundai Santa Fe 2.2 CRDi',
    skidMarkLengthM: 42.0,
    roadSurface: 'ice_black_ice',
    slopeGradientPercent: -6,
    speedLimitKmh: 50,
    hazardDistanceM: 65.0,
    injurySeverity: 'light_harm',
    driverSobriety: 'sober',
    propertyDamageAzn: 7800,
    medicalBillsAzn: 1400,
    driverFaultPercent: 50,
    descriptionAz: 'Enişli dağ yolunda qara buz qatında təkərlərin ilişməsinin itməsi nəticəsində 42 metrlik nəzarətsiz sürüşmə hadisəsi.'
  }
];

export const FORENSIC_INSTITUTIONS: ForensicInstitution[] = [
  {
    id: 'mem_baku_central',
    nameAz: 'AR Ədliyyə Nazirliyi Məhkəmə Ekspertizası Mərkəzi (Avtotexniki Ekspertiza Şöbəsi)',
    nameEn: 'Ministry of Justice Forensic Expertise Centre (Auto-Technical Dept)',
    addressAz: 'Bakı şəhəri, Xətai rayonu, Xocalı prospekti 18',
    phone: '+994 (12) 490-62-44',
    email: 'autotech@justice.gov.az',
    workingHours: 'B.e - Cümə: 09:00 - 18:00',
    specializationAz: 'Yol-nəqliyyat hadisələrinin mexanizmi, tormoz izi sürət ekspertizası, qəza qabağı texniki imkan analizi',
    leadExpertAz: 'Aparıcı Məhkəmə Eksperti Rauf Məmmədov (Staj: 24 il)'
  },
  {
    id: 'bdyp_investigation_hq',
    nameAz: 'DİN Baş Dövlət Yol Polisi İdarəsi YNH Tədqiqatı və Təhqiqat Şöbəsi',
    nameEn: 'MIA Main Traffic Police Dept Accident Investigation Division',
    addressAz: 'Bakı-Sumqayıt şossesi, 7-ci km (Baş DYP İdarəsi kompleksi)',
    phone: '+994 (12) 590-81-25',
    email: 'ynh-tehqiqat@dyp.gov.az',
    workingHours: 'Hər gün: 24/7 Növbətçi Tədqiqat Qrupu',
    specializationAz: 'Hadisə yerinin baxış protokolları, MMX kamera qeydlərinin tədqiqi, DQN və sürət telemetriyası',
    leadExpertAz: 'Polis Polkovnik-leytenantı Elşən Əliyev'
  },
  {
    id: 'mem_ganja_regional',
    nameAz: 'Ədliyyə Nazirliyi Gəncə Regional Məhkəmə Ekspertizası Şöbəsi',
    nameEn: 'Ministry of Justice Ganja Regional Forensic Department',
    addressAz: 'Gəncə şəhəri, Heydər Əliyev prospekti 88',
    phone: '+994 (22) 256-14-30',
    email: 'ganja-expert@justice.gov.az',
    workingHours: 'B.e - Cümə: 09:00 - 18:00',
    specializationAz: 'Qərb zonası üzrə M-2 magistralı və şəhərdaxili ağır YNH-lərin avtotexniki təhlili',
    leadExpertAz: 'Baş Məhkəmə Eksperti Vüqar Qasımov'
  },
  {
    id: 'baku_dyp_investigation',
    nameAz: 'Bakı Şəhər Baş Polis İdarəsi Dövlət Yol Polisi İdarəsi Təhqiqat Şöbəsi',
    nameEn: 'Baku City Main Police Dept Traffic Investigation Division',
    addressAz: 'Bakı şəhəri, Səbail rayonu, Badamdar şossesi 1',
    phone: '+994 (12) 590-73-02',
    email: 'baki-dyp-tehqiqat@mia.gov.az',
    workingHours: 'Hər gün: 24/7',
    specializationAz: 'Paytaxt küçələrində baş verən toqquşmaların ilkin sxemləri, optik analiz və zərər tespiti',
    leadExpertAz: 'Polis Mayoru Ceyhun İsmayılov'
  },
  {
    id: 'mem_sheki_regional',
    nameAz: 'Ədliyyə Nazirliyi Şəki Regional Məhkəmə Ekspertizası Şöbəsi',
    nameEn: 'Ministry of Justice Sheki Regional Forensic Department',
    addressAz: 'Şəki şəhəri, 20 Yanvar küçəsi 14',
    phone: '+994 (24) 244-32-18',
    email: 'sheki-expert@justice.gov.az',
    workingHours: 'B.e - Cümə: 09:00 - 18:00',
    specializationAz: 'Şimal-qərb dağ aşırımları və mürəkkəb relyefli yollarda avtotexniki ekspertizalar',
    leadExpertAz: 'Məhkəmə Eksperti Natiq Rüstəmov'
  }
];

export const MOCK_VERIFIABLE_FORENSIC_REPORTS: ForensicReportData[] = [
  {
    reportNumber: 'MEM-YNH-2026-04192',
    incidentDate: '14.10.2026',
    incidentLocation: 'Bakı şəhəri, Heydər Əliyev pr. 115',
    vehiclePlate: '90-OX-404',
    vehicleModel: 'BMW 530i',
    vehicleMassKg: 1650,
    skidMarkLengthM: 32.5,
    roadSurface: 'dry_asphalt',
    roadFrictionMu: 0.75,
    calculatedSpeedKmh: 78.6,
    speedLimitKmh: 60,
    isSpeeding: true,
    hazardDistanceM: 45.0,
    hadTechnicalPossibility: true,
    injurySeverity: 'moderate_harm',
    driverSobriety: 'sober',
    legalArticle: 'CM Maddə 263.1',
    isCriminal: true,
    examinerName: 'Ekspert Rauf Məmmədov (Avtotexniki ekspert, v.i.e.)',
    institutionAz: 'Azərbaycan Respublikası Ədliyyə Nazirliyi Məhkəmə Ekspertizası Mərkəzi',
    digitalQrChecksum: 'QR-MEM-YNH-7A9B1C',
    simaSignatureHash: 'SIMA-AZ-EXPERT-E4F281'
  },
  {
    reportNumber: 'MEM-YNH-2026-08814',
    incidentDate: '18.10.2026',
    incidentLocation: 'Bakı şəhəri, Tbilisi prospekti 42',
    vehiclePlate: '77-BB-512',
    vehicleModel: 'Toyota Camry 2.5 Hybrid',
    vehicleMassKg: 1550,
    skidMarkLengthM: 26.0,
    roadSurface: 'wet_asphalt',
    roadFrictionMu: 0.45,
    calculatedSpeedKmh: 54.5,
    speedLimitKmh: 50,
    isSpeeding: true,
    hazardDistanceM: 38.0,
    hadTechnicalPossibility: false,
    injurySeverity: 'none_property_only',
    driverSobriety: 'sober',
    legalArticle: 'İXM Maddə 327.1',
    isCriminal: false,
    examinerName: 'Baş Məhkəmə Eksperti Vüqar Qasımov',
    institutionAz: 'Azərbaycan Respublikası Ədliyyə Nazirliyi Məhkəmə Ekspertizası Mərkəzi',
    digitalQrChecksum: 'QR-MEM-YNH-3F21DD',
    simaSignatureHash: 'SIMA-AZ-EXPERT-9B1A04'
  }
];

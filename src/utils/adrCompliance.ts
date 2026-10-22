/**
 * Official FHN (Fövqəladə Hallar Nazirliyi), BDYP & AZS Dangerous Goods Road Transport (ADR)
 * Calculation, Classification & Regulatory Engine
 *
 * Adheres to:
 * - European Agreement concerning the International Carriage of Dangerous Goods by Road (UNECE ADR 2023/2025)
 * - Law of Azerbaijan on Road Traffic (YHQ Article 58 & Annex 1 Clause 7.9)
 * - Code of Administrative Offences of Azerbaijan (İXM Article 354 & Article 96.1.4)
 * - Cabinet of Ministers Decisions on Dangerous Goods Transportation Norms
 * - Ministry of Emergency Situations (FHN) Industrial Safety & Mining Inspectorate Guidelines
 */

import { Currency } from '../types/vehicle';

export type ADRClassId =
  | 'class_1' // Explosives
  | 'class_2' // Gases (compressed, liquefied, dissolved)
  | 'class_3' // Flammable liquids (petrol, diesel, aviation fuel)
  | 'class_4_1' // Flammable solids
  | 'class_4_2' // Substances liable to spontaneous combustion
  | 'class_4_3' // Substances which emit flammable gases with water
  | 'class_5_1' // Oxidizing substances
  | 'class_5_2' // Organic peroxides
  | 'class_6_1' // Toxic substances
  | 'class_6_2' // Infectious substances
  | 'class_7' // Radioactive material
  | 'class_8' // Corrosive substances (acids, alkalis)
  | 'class_9'; // Miscellaneous dangerous substances (Lithium-ion batteries, etc.)

export type ADRVehicleType =
  | 'FL' // Flammable liquids / gases tank vehicles
  | 'AT' // Tank vehicles other than FL
  | 'EX_II' // Explosives type II covered van
  | 'EX_III' // Explosives type III armored container
  | 'MEMU' // Mobile explosives manufacturing unit
  | 'STANDARD_PACKAGE'; // Packaged dry cargo truck (e.g. pallets of batteries or acid carboys)

export type PackingGroup = 'I' | 'II' | 'III' | 'NONE';

export interface ADRSubstance {
  unNumber: string; // e.g. "1203"
  kemlerCode: string; // e.g. "33"
  nameAz: string;
  nameEn: string;
  classId: ADRClassId;
  packingGroup: PackingGroup;
  flashPointC?: number;
  primaryHazard: string;
  emergencyGuideAz: string;
  waterReactive: boolean;
  recommendedVehicleType: ADRVehicleType;
}

export interface ADREquipmentChecklistItem {
  id: string;
  titleAz: string;
  titleEn: string;
  category: 'personal_protection' | 'vehicle_safety' | 'spill_mitigation';
  mandatory: boolean;
  descriptionAz: string;
  penaltyAz: string;
}

export interface ADRDriverCredential {
  certificateNumber: string; // e.g. "FHN-ADR-SR-2026-0941"
  driverName: string;
  driverFin: string;
  isBasicCertified: boolean;
  isTankerCertified: boolean;
  isClass1ExplosivesCertified: boolean;
  isClass7RadioactiveCertified: boolean;
  expiryDate: string;
  isValid: boolean;
}

export interface ADRComplianceAudit {
  vehiclePlate: string;
  substance: ADRSubstance;
  vehicleType: ADRVehicleType;
  tankerInspectionValid: boolean;
  batteryMasterSwitchEx: boolean;
  exhaustSparkArrestor: boolean;
  absEbsFunctional: boolean;
  equippedItems: string[];
  driverCredential: ADRDriverCredential;
  safetyScore: number; // 0 - 100
  status: 'approved' | 'conditional_warning' | 'prohibited';
  missingCriticalEquipment: string[];
  legalViolations: string[];
  ixmFinePotentialAzn: number;
  speedLimitKmh: number;
  mandatoryEscortRequired: boolean;
  tunnelCategoryAllowed: 'A' | 'B' | 'C' | 'D' | 'E';
}

export interface ADRTransitRoute {
  id: string;
  nameAz: string;
  nameEn: string;
  corridorCode: string; // e.g. "M-3"
  distanceKm: number;
  estimatedTransitHours: number;
  nightTravelPermitted: boolean;
  tunnelBypassRequired: boolean;
  safeParkingWaypointAz: string;
  stateDutyAzn: number;
}

export interface ADRSpecialPermit {
  permitNumber: string; // e.g. "FHN-ADR-2026-84912"
  issueDate: string;
  validUntil: string;
  carrierName: string;
  carrierVoen: string;
  vehiclePlate: string;
  driverFin: string;
  unNumber: string;
  substanceName: string;
  kemlerCode: string;
  routeCorridor: string;
  securityHash: string;
  qrVerificationUrl: string;
  totalFeeAzn: number;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
}

/**
 * Currency conversion constants
 */
export const EXCHANGE_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 1.7,
  EUR: 1.85,
};

/**
 * Convert AZN amount to specified currency
 */
export function convertAznToCurrency(amountAzn: number, currency: Currency): number {
  const rate = EXCHANGE_RATES[currency] || 1.0;
  return Number((amountAzn / rate).toFixed(2));
}

/**
 * Format currency with proper symbols
 */
export function formatADRCurrency(amountAzn: number, currency: Currency): string {
  const converted = convertAznToCurrency(amountAzn, currency);
  switch (currency) {
    case 'USD':
      return `$${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'EUR':
      return `€${converted.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'AZN':
    default:
      return `${converted.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₼`;
  }
}

/**
 * Kemler Hazard Code interpreter
 */
export function interpretKemlerCode(code: string): {
  isWaterReactive: boolean;
  hazardSummaryAz: string;
  hazardSummaryEn: string;
  riskLevel: 'moderate' | 'high' | 'extreme';
} {
  const isWaterReactive = code.startsWith('X');
  const cleanCode = code.replace('X', '');

  let riskLevel: 'moderate' | 'high' | 'extreme' = 'moderate';
  if (cleanCode.length >= 2 && cleanCode[0] === cleanCode[1]) {
    riskLevel = 'extreme'; // Doubled number means intensification of hazard (e.g. 33, 88)
  } else if (cleanCode.startsWith('3') || cleanCode.startsWith('2') || cleanCode.startsWith('8')) {
    riskLevel = 'high';
  }

  let hazardAz = '';
  let hazardEn = '';

  switch (code) {
    case '33':
      hazardAz = 'Yüksək dərəcədə tezalışan maye (Alışma temperaturu <23°C)';
      hazardEn = 'Highly flammable liquid (flash point <23°C)';
      break;
    case '30':
      hazardAz = 'Alışan maye (Alışma temperaturu 23°C–60°C) və ya az dərəcədə təhlükəli';
      hazardEn = 'Flammable liquid (flash point 23°C–60°C) or minor hazard';
      break;
    case '23':
      hazardAz = 'Tezalışan təzyiq altında qaz';
      hazardEn = 'Flammable compressed gas';
      break;
    case '22':
      hazardAz = 'Dərin soyudulmuş mayeləşdirilmiş qaz (Kriogenik boğucu)';
      hazardEn = 'Deeply refrigerated liquefied gas (Cryogenic asphyxiant)';
      break;
    case '268':
      hazardAz = 'Zəhərli və aşındırıcı qaz';
      hazardEn = 'Toxic and corrosive gas';
      break;
    case '80':
      hazardAz = 'Aşındırıcı (korroziyaedici) maye və ya maddə';
      hazardEn = 'Corrosive substance';
      break;
    case '88':
      hazardAz = 'Yüksək dərəcədə aşındırıcı və metalları güclü dağıdan maddə';
      hazardEn = 'Highly corrosive substance';
      break;
    case 'X88':
      hazardAz = 'Su ilə şiddətli reaksiyaya girən yüksək dərəcədə aşındırıcı maddə';
      hazardEn = 'Highly corrosive substance reacting dangerously with water';
      riskLevel = 'extreme';
      break;
    case '90':
      hazardAz = 'Ətraf mühit üçün təhlükəli və ya müxtəlif növ təhlükəli maddə';
      hazardEn = 'Environmentally hazardous or miscellaneous dangerous substance';
      break;
    default:
      hazardAz = `Standart BMT Kemler təhlükə kodu (${code})`;
      hazardEn = `Standard UN Kemler hazard code (${code})`;
  }

  if (isWaterReactive) {
    hazardAz += ' [DİQQƏT: Su ilə söndürmək qəti QADAĞANDIR!]';
    hazardEn += ' [WARNING: Reacts violently with water - DO NOT USE WATER!]';
  }

  return {
    isWaterReactive,
    hazardSummaryAz: hazardAz,
    hazardSummaryEn: hazardEn,
    riskLevel,
  };
}

/**
 * Audit ADR Compliance of Vehicle, Cargo, Equipment, and Driver
 */
export function evaluateADRCompliance(params: {
  vehiclePlate: string;
  substance: ADRSubstance;
  vehicleType: ADRVehicleType;
  tankerInspectionValid: boolean;
  batteryMasterSwitchEx: boolean;
  exhaustSparkArrestor: boolean;
  absEbsFunctional: boolean;
  equippedItemIds: string[];
  driverCredential: ADRDriverCredential;
}): ADRComplianceAudit {
  const violations: string[] = [];
  const missingItems: string[] = [];
  let score = 100;
  let finePotential = 0;

  // 1. Technical Vehicle Inspection for ADR
  if (['FL', 'AT', 'EX_II', 'EX_III', 'MEMU'].includes(params.vehicleType) && !params.tankerInspectionValid) {
    violations.push('FHN S.Ə. Dövlət Agentliyi tərəfindən verilən ADR Texniki Uyğunluq Talonunun müddəti bitib');
    score -= 30;
    finePotential += 3000; // Legal entity fine
  }

  if (params.substance.classId === 'class_3' || params.substance.classId === 'class_2') {
    if (!params.batteryMasterSwitchEx) {
      violations.push('Partlayışdan mühafizəli (Ex-proof) akkumulyator kəsicisi (Master Switch) quraşdırılmayıb (ADR 9.2.2.8)');
      score -= 15;
      finePotential += 400;
    }
    if (!params.exhaustSparkArrestor) {
      violations.push('Qazburaxma borusunda FHN sertifikatlı qığılcım söndürən (qığılcımtutan) yoxdur');
      score -= 15;
      finePotential += 300;
    }
  }

  if (!params.absEbsFunctional) {
    violations.push('ADR daşımaları üçün məcburi ABS/EBS elektron əyləc sistemi nasazdır (ADR 9.2.3.1.1)');
    score -= 20;
    finePotential += 500;
  }

  // 2. Driver Credential Checks
  if (!params.driverCredential.isValid) {
    violations.push('Sürücünün FHN/DİN ADR Xüsusi Hazırlıq Şəhadətnaməsinin etibarlılıq müddəti bitib');
    score -= 35;
    finePotential += 500;
  } else {
    // If tanker cargo, check tanker cert
    if (['FL', 'AT'].includes(params.vehicleType) && !params.driverCredential.isTankerCertified) {
      violations.push('Sürücünün Sisternlə Daşıma (Tanker) ixtisaslaşma dərəcəsi yoxdur');
      score -= 25;
      finePotential += 300;
    }
    // If explosives, check Class 1
    if (params.substance.classId === 'class_1' && !params.driverCredential.isClass1ExplosivesCertified) {
      violations.push('Sürücünün Sinif 1 (Partlayıcı maddələr) xüsusi buraxılış kateqoriyası yoxdur');
      score -= 35;
      finePotential += 500;
    }
  }

  // 3. Mandatory Equipment Checks
  const MANDATORY_EQUIPMENT_IDS = [
    'orange_plates',
    'fire_extinguisher_cab',
    'fire_extinguisher_tank',
    'wheel_chocks',
    'amber_warning_lights',
    'chemical_mask',
    'eye_wash_bottle',
    'anti_spark_shovel',
    'drain_cover_seal',
    'safety_goggles',
    'reflective_vest',
  ];

  for (const eqId of MANDATORY_EQUIPMENT_IDS) {
    if (!params.equippedItemIds.includes(eqId)) {
      missingItems.push(eqId);
      score -= 5;
      finePotential += 50;
    }
  }

  score = Math.max(0, Math.min(100, score));

  let status: 'approved' | 'conditional_warning' | 'prohibited' = 'approved';
  if (score < 60 || violations.length > 2 || !params.driverCredential.isValid) {
    status = 'prohibited';
  } else if (score < 85 || missingItems.length > 0) {
    status = 'conditional_warning';
  }

  // Speed limits under YHQ Article 50:
  // Dangerous cargo transports: 50 km/h in urban areas, 60 km/h outside settlements
  const speedLimit = 60;

  // Escort required for Class 1 (Explosives) or Extreme Hazard
  const mandatoryEscortRequired =
    params.substance.classId === 'class_1' ||
    params.substance.classId === 'class_7' ||
    params.substance.kemlerCode === 'X88';

  // Tunnel Category:
  let tunnelCat: 'A' | 'B' | 'C' | 'D' | 'E' = 'D';
  if (params.substance.classId === 'class_1' || params.substance.classId === 'class_7') {
    tunnelCat = 'E'; // Prohibited in virtually all restricted tunnels
  } else if (params.substance.classId === 'class_3' && params.vehicleType === 'FL') {
    tunnelCat = 'D'; // Flammable tankers prohibited in category D and E tunnels
  }

  return {
    vehiclePlate: params.vehiclePlate,
    substance: params.substance,
    vehicleType: params.vehicleType,
    tankerInspectionValid: params.tankerInspectionValid,
    batteryMasterSwitchEx: params.batteryMasterSwitchEx,
    exhaustSparkArrestor: params.exhaustSparkArrestor,
    absEbsFunctional: params.absEbsFunctional,
    equippedItems: params.equippedItemIds,
    driverCredential: params.driverCredential,
    safetyScore: score,
    status,
    missingCriticalEquipment: missingItems,
    legalViolations: violations,
    ixmFinePotentialAzn: finePotential,
    speedLimitKmh: speedLimit,
    mandatoryEscortRequired,
    tunnelCategoryAllowed: tunnelCat,
  };
}

/**
 * Calculate FHN ADR Route Permit Duty & State Licensing Fee
 */
export function calculateADRPermitCost(params: {
  distanceKm: number;
  classId: ADRClassId;
  vehicleType: ADRVehicleType;
  isUrgent: boolean;
  currency: Currency;
}): {
  baseDutyAzn: number;
  routeCoordinationFeeAzn: number;
  escortFeeAzn: number;
  urgentSurchargeAzn: number;
  totalAzn: number;
  formattedTotal: string;
} {
  const baseDutyAzn = 40; // Law on State Duties: 40 AZN for specialized dangerous goods transport permit

  // Route coordination per km
  let perKmRate = 0.15;
  if (params.classId === 'class_1' || params.classId === 'class_7') {
    perKmRate = 0.35;
  } else if (['FL', 'MEMU'].includes(params.vehicleType)) {
    perKmRate = 0.22;
  }

  const routeCoordinationFeeAzn = Math.round(params.distanceKm * perKmRate);

  let escortFeeAzn = 0;
  if (params.classId === 'class_1' || params.classId === 'class_7') {
    escortFeeAzn = 150; // BDYP / FHN police escort service fee
  }

  const urgentSurchargeAzn = params.isUrgent ? 50 : 0;
  const totalAzn = baseDutyAzn + routeCoordinationFeeAzn + escortFeeAzn + urgentSurchargeAzn;

  return {
    baseDutyAzn,
    routeCoordinationFeeAzn,
    escortFeeAzn,
    urgentSurchargeAzn,
    totalAzn,
    formattedTotal: formatADRCurrency(totalAzn, params.currency),
  };
}

/**
 * Generate Official FHN Electronic Dangerous Goods Transport Permit
 */
export function generateADRSpecialPermit(params: {
  carrierName: string;
  carrierVoen: string;
  vehiclePlate: string;
  driverFin: string;
  substance: ADRSubstance;
  corridorName: string;
  totalFeeAzn: number;
}): ADRSpecialPermit {
  const randomSerial = Math.floor(10000 + Math.random() * 90000);
  const permitNumber = `FHN-ADR-2026-${randomSerial}`;
  const now = new Date();
  const issueDate = now.toISOString().split('T')[0];

  // 30 days validity for single/multi corridor transit permit
  const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const validUntil = expiry.toISOString().split('T')[0];

  const rawHash = `${permitNumber}-${params.carrierVoen}-${params.vehiclePlate}-${params.substance.unNumber}`;
  let hashVal = 0;
  for (let i = 0; i < rawHash.length; i++) {
    hashVal = (hashVal << 5) - hashVal + rawHash.charCodeAt(i);
    hashVal |= 0;
  }
  const securityHash = `SHA256:FHN-${Math.abs(hashVal).toString(16).toUpperCase().padStart(8, '0')}`;

  return {
    permitNumber,
    issueDate,
    validUntil,
    carrierName: params.carrierName,
    carrierVoen: params.carrierVoen,
    vehiclePlate: params.vehiclePlate.toUpperCase(),
    driverFin: params.driverFin.toUpperCase(),
    unNumber: params.substance.unNumber,
    substanceName: params.substance.nameAz,
    kemlerCode: params.substance.kemlerCode,
    routeCorridor: params.corridorName,
    securityHash,
    qrVerificationUrl: `https://fhn.gov.az/adr-verify?permit=${permitNumber}&sec=${securityHash.slice(7)}`,
    totalFeeAzn: params.totalFeeAzn,
    status: 'ACTIVE',
  };
}

/**
 * Official Central Bank of Azerbaijan (Azərbaycan Respublikasının Mərkəzi Bankı — AMB)
 * & Compulsory Insurance Bureau (İcbari Sığorta Bürosu — İSB)
 * Bonus-Malus Class Registry, Claims History & Statutory Premium Engine
 *
 * Compliant with:
 * - Law of the Republic of Azerbaijan on Compulsory Insurances ("İcbari sığortalar haqqında" AR Qanunu, Chapter X)
 * - Central Bank of the Republic of Azerbaijan (AMB) Regulations on Compulsory Vehicle Third-Party Liability Insurance (AVSMMİS)
 * - 14-Tier Bonus-Malus Class Transition Matrix (BM 1 to BM 14, coefficients 0.45x to 1.60x)
 * - Statutory Engine Displacement, Territory, and Age/Experience Multipliers
 * - Compulsory Insurance Bureau (İSB) Unified Electronic Information System Data Standards
 */

export type BonusMalusClassId =
  | 'BM_1'
  | 'BM_2'
  | 'BM_3'
  | 'BM_4'
  | 'BM_5'
  | 'BM_6'
  | 'BM_7'
  | 'BM_8'
  | 'BM_9'
  | 'BM_10'
  | 'BM_11'
  | 'BM_12'
  | 'BM_13'
  | 'BM_14';

export type TerritoryZone =
  | 'baku'
  | 'absheron_sumgayit'
  | 'ganja'
  | 'other_regions';

export type DriverExperienceCategory =
  | 'senior_experienced' // Age >= 25 & Experience >= 1 year
  | 'young_experienced'  // Age < 25 & Experience >= 1 year
  | 'senior_novice'       // Age >= 25 & Experience < 1 year
  | 'young_novice';       // Age < 25 & Experience < 1 year

export type Currency = 'AZN' | 'USD' | 'EUR';

export interface BonusMalusClassInfo {
  id: BonusMalusClassId;
  name: string;
  coefficient: number;
  discountOrSurchargePercent: number; // negative for discount, positive for surcharge
  type: 'bonus' | 'base' | 'malus';
  descriptionAz: string;
  descriptionEn: string;
}

export interface AccidentClaimRecord {
  id: string;
  accidentDate: string;
  claimNumber: string;
  insurerName: string;
  insurerId: string;
  payoutAmountAzn: number;
  driverFaultPercent: number; // e.g. 100, 50, 0
  claimType: 'property_damage' | 'bodily_injury' | 'combined';
  accidentLocation: string;
  resolutionStatus: 'settled' | 'under_review' | 'subrogated';
}

export interface BonusMalusDriverProfile {
  fin: string; // 7-character FIN code
  licenseSeriesNumber: string; // e.g. 'AZE 123456'
  fullName: string;
  birthDate: string;
  licenseIssueDate: string;
  currentClass: BonusMalusClassId;
  consecutiveClaimFreeYears: number;
  totalClaimsCount: number;
  claims: AccidentClaimRecord[];
  assignedPlate?: string;
  policyExpiryDate: string;
  activeInsurer: string;
}

export interface BonusMalusCalculationParams {
  currentClass: BonusMalusClassId;
  engineDisplacementCc: number; // e.g. 1600, 2487, 3956
  isElectric?: boolean;
  territory: TerritoryZone;
  experienceCategory: DriverExperienceCategory;
  atFaultAccidentsInPeriod?: number; // 0, 1, 2, 3+
}

export interface BonusMalusCalculationResult {
  baseTariffAzn: number;
  engineCoefficient: number;
  territoryCoefficient: number;
  experienceCoefficient: number;
  bonusMalusCoefficient: number;
  finalPremiumAzn: number;
  finalPremiumUsd: number;
  finalPremiumEur: number;
  baselineClass7PremiumAzn: number;
  differenceVsBaseAzn: number;
  differenceVsBasePercent: number;
  nextProjectedClass: BonusMalusClassId;
  nextProjectedCoefficient: number;
  statutoryMaxPropertyLimitAzn: number; // 5,000 AZN per vehicle / 25,000 AZN aggregate
  statutoryMaxBodilyLimitAzn: number;   // 5,000 AZN per person / 50,000 AZN aggregate
  legalBasisAz: string;
  legalBasisEn: string;
}

export interface BonusMalusCertificate {
  certificateNumber: string; // AMB-BMS-2026-XXXXX
  verificationHash: string;
  issueDate: string;
  validUntil: string;
  driver: BonusMalusDriverProfile;
  classInfo: BonusMalusClassInfo;
  projectedRenewalClass: BonusMalusClassId;
  qrCodeUrl: string;
  securitySeal: string;
}

// Exchange rates (matching AutoNext ecosystem standard)
export const EXCHANGE_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 0.588,
  EUR: 0.543,
};

// Base tariff for passenger vehicles (M1) as mandated by AMB
export const STATUTORY_BASE_TARIFF_AZN = 50.0;

// Maximum statutory liability coverage under Azerbaijani law
export const STATUTORY_PROPERTY_DAMAGE_LIMIT_AZN = 5000;
export const STATUTORY_AGGREGATE_PROPERTY_LIMIT_AZN = 25000;
export const STATUTORY_BODILY_INJURY_LIMIT_AZN = 5000;
export const STATUTORY_AGGREGATE_BODILY_LIMIT_AZN = 50000;

// 14 Bonus-Malus Classes & Coefficients
export const BONUS_MALUS_CLASSES: Record<BonusMalusClassId, BonusMalusClassInfo> = {
  BM_1: {
    id: 'BM_1',
    name: 'BM 1',
    coefficient: 1.6,
    discountOrSurchargePercent: 60,
    type: 'malus',
    descriptionAz: 'Maksimal malus — Yüksək qəza riski (+60% əlavə haqq)',
    descriptionEn: 'Maximum Malus — High accident risk (+60% surcharge)',
  },
  BM_2: {
    id: 'BM_2',
    name: 'BM 2',
    coefficient: 1.5,
    discountOrSurchargePercent: 50,
    type: 'malus',
    descriptionAz: 'Yüksək malus dərəcəsi (+50% əlavə haqq)',
    descriptionEn: 'High Malus Tier (+50% surcharge)',
  },
  BM_3: {
    id: 'BM_3',
    name: 'BM 3',
    coefficient: 1.4,
    discountOrSurchargePercent: 40,
    type: 'malus',
    descriptionAz: 'Əhəmiyyətli malus dərəcəsi (+40% əlavə haqq)',
    descriptionEn: 'Significant Malus Tier (+40% surcharge)',
  },
  BM_4: {
    id: 'BM_4',
    name: 'BM 4',
    coefficient: 1.3,
    discountOrSurchargePercent: 30,
    type: 'malus',
    descriptionAz: 'Orta-yüksək malus dərəcəsi (+30% əlavə haqq)',
    descriptionEn: 'Moderate-High Malus Tier (+30% surcharge)',
  },
  BM_5: {
    id: 'BM_5',
    name: 'BM 5',
    coefficient: 1.2,
    discountOrSurchargePercent: 20,
    type: 'malus',
    descriptionAz: 'Orta malus dərəcəsi (+20% əlavə haqq)',
    descriptionEn: 'Moderate Malus Tier (+20% surcharge)',
  },
  BM_6: {
    id: 'BM_6',
    name: 'BM 6',
    coefficient: 1.1,
    discountOrSurchargePercent: 10,
    type: 'malus',
    descriptionAz: 'İlkin malus dərəcəsi (+10% əlavə haqq)',
    descriptionEn: 'Initial Malus Tier (+10% surcharge)',
  },
  BM_7: {
    id: 'BM_7',
    name: 'BM 7',
    coefficient: 1.0,
    discountOrSurchargePercent: 0,
    type: 'base',
    descriptionAz: 'Baza standart dərəcə — İlkin sığorta müqaviləsi (1.00x)',
    descriptionEn: 'Base Standard Tier — Initial insurance entry (1.00x)',
  },
  BM_8: {
    id: 'BM_8',
    name: 'BM 8',
    coefficient: 0.95,
    discountOrSurchargePercent: -5,
    type: 'bonus',
    descriptionAz: '1 il qəzasız idarəetmə güzəşti (-5% endirim)',
    descriptionEn: '1-year claim-free discount (-5% bonus)',
  },
  BM_9: {
    id: 'BM_9',
    name: 'BM 9',
    coefficient: 0.9,
    discountOrSurchargePercent: -10,
    type: 'bonus',
    descriptionAz: '2 il qəzasız idarəetmə güzəşti (-10% endirim)',
    descriptionEn: '2-year claim-free discount (-10% bonus)',
  },
  BM_10: {
    id: 'BM_10',
    name: 'BM 10',
    coefficient: 0.85,
    discountOrSurchargePercent: -15,
    type: 'bonus',
    descriptionAz: '3 il qəzasız idarəetmə güzəşti (-15% endirim)',
    descriptionEn: '3-year claim-free discount (-15% bonus)',
  },
  BM_11: {
    id: 'BM_11',
    name: 'BM 11',
    coefficient: 0.8,
    discountOrSurchargePercent: -20,
    type: 'bonus',
    descriptionAz: '4 il qəzasız idarəetmə güzəşti (-20% endirim)',
    descriptionEn: '4-year claim-free discount (-20% bonus)',
  },
  BM_12: {
    id: 'BM_12',
    name: 'BM 12',
    coefficient: 0.75,
    discountOrSurchargePercent: -25,
    type: 'bonus',
    descriptionAz: '5 il qəzasız idarəetmə güzəşti (-25% endirim)',
    descriptionEn: '5-year claim-free discount (-25% bonus)',
  },
  BM_13: {
    id: 'BM_13',
    name: 'BM 13',
    coefficient: 0.6,
    discountOrSurchargePercent: -40,
    type: 'bonus',
    descriptionAz: '6 il qəzasız nümunəvi idarəetmə (-40% endirim)',
    descriptionEn: '6-year exemplary claim-free driving (-40% bonus)',
  },
  BM_14: {
    id: 'BM_14',
    name: 'BM 14',
    coefficient: 0.45,
    discountOrSurchargePercent: -55,
    type: 'bonus',
    descriptionAz: 'Maksimal qanuni güzəşt — 7+ il qəzasız idarəetmə (-55% endirim)',
    descriptionEn: 'Maximum Statutory Bonus — 7+ years claim-free (-55% bonus)',
  },
};

/**
 * Transition logic adhering to AMB / İSB regulations:
 * Determines the next Bonus-Malus class based on the number of at-fault claims in the policy term.
 */
export function calculateNextBonusMalusClass(
  currentClass: BonusMalusClassId,
  atFaultClaimsCount: number
): BonusMalusClassId {
  const claims = Math.max(0, atFaultClaimsCount);

  if (claims === 0) {
    // Progress up 1 class towards BM 14
    switch (currentClass) {
      case 'BM_1': return 'BM_2';
      case 'BM_2': return 'BM_3';
      case 'BM_3': return 'BM_4';
      case 'BM_4': return 'BM_5';
      case 'BM_5': return 'BM_6';
      case 'BM_6': return 'BM_7';
      case 'BM_7': return 'BM_8';
      case 'BM_8': return 'BM_9';
      case 'BM_9': return 'BM_10';
      case 'BM_10': return 'BM_11';
      case 'BM_11': return 'BM_12';
      case 'BM_12': return 'BM_13';
      case 'BM_13':
      case 'BM_14': return 'BM_14';
      default: return 'BM_7';
    }
  }

  if (claims === 1) {
    // Regress down classes
    switch (currentClass) {
      case 'BM_14': return 'BM_9';
      case 'BM_13': return 'BM_8';
      case 'BM_12': return 'BM_7';
      case 'BM_11': return 'BM_6';
      case 'BM_10': return 'BM_5';
      case 'BM_9': return 'BM_4';
      case 'BM_8': return 'BM_3';
      case 'BM_7': return 'BM_2';
      case 'BM_6':
      case 'BM_5':
      case 'BM_4':
      case 'BM_3':
      case 'BM_2':
      case 'BM_1': return 'BM_1';
      default: return 'BM_1';
    }
  }

  if (claims === 2) {
    // Severe regress
    switch (currentClass) {
      case 'BM_14': return 'BM_5';
      case 'BM_13': return 'BM_4';
      case 'BM_12': return 'BM_3';
      case 'BM_11': return 'BM_2';
      default: return 'BM_1';
    }
  }

  // 3 or more claims -> directly to BM 1 (highest malus)
  return 'BM_1';
}

/**
 * Calculates engine displacement coefficient (km) under statutory rules.
 */
export function getEngineDisplacementCoefficient(
  engineCc: number,
  isElectric: boolean = false
): number {
  if (isElectric) {
    return 1.0; // Statutory eco-incentive for zero-emission vehicles
  }

  if (engineCc <= 1500) return 1.0;
  if (engineCc <= 2000) return 1.5;
  if (engineCc <= 2500) return 2.0;
  if (engineCc <= 3000) return 2.5;
  if (engineCc <= 3500) return 3.0;
  if (engineCc <= 4000) return 3.5;
  if (engineCc <= 4500) return 4.0;
  if (engineCc <= 5000) return 4.5;
  return 5.0; // Above 5000 cc
}

/**
 * Calculates territory coefficient (kt) based on vehicle registration zone.
 */
export function getTerritoryCoefficient(zone: TerritoryZone): number {
  switch (zone) {
    case 'baku': return 1.1;
    case 'absheron_sumgayit': return 1.05;
    case 'ganja': return 1.0;
    case 'other_regions': return 0.95;
    default: return 1.0;
  }
}

/**
 * Calculates driver age and driving experience coefficient (ks).
 */
export function getExperienceCoefficient(category: DriverExperienceCategory): number {
  switch (category) {
    case 'senior_experienced': return 1.0;
    case 'young_experienced': return 1.2;
    case 'senior_novice': return 1.25;
    case 'young_novice': return 1.35;
    default: return 1.0;
  }
}

/**
 * Main premium calculation engine for Compulsory Vehicle Third-Party Liability Insurance.
 */
export function calculateCompulsoryPremium(
  params: BonusMalusCalculationParams
): BonusMalusCalculationResult {
  const baseTariffAzn = STATUTORY_BASE_TARIFF_AZN;
  const engineCoefficient = getEngineDisplacementCoefficient(
    params.engineDisplacementCc,
    params.isElectric
  );
  const territoryCoefficient = getTerritoryCoefficient(params.territory);
  const experienceCoefficient = getExperienceCoefficient(params.experienceCategory);

  const bmInfo = BONUS_MALUS_CLASSES[params.currentClass] || BONUS_MALUS_CLASSES.BM_7;
  const bonusMalusCoefficient = bmInfo.coefficient;

  // Formula: Base * Engine * Territory * Experience * BonusMalus
  const finalPremiumAzn = Number(
    (
      baseTariffAzn *
      engineCoefficient *
      territoryCoefficient *
      experienceCoefficient *
      bonusMalusCoefficient
    ).toFixed(2)
  );

  // Baseline Class 7 comparison (BM 7 = 1.00x)
  const baselineClass7PremiumAzn = Number(
    (
      baseTariffAzn *
      engineCoefficient *
      territoryCoefficient *
      experienceCoefficient *
      1.0
    ).toFixed(2)
  );

  const differenceVsBaseAzn = Number((finalPremiumAzn - baselineClass7PremiumAzn).toFixed(2));
  const differenceVsBasePercent = Number(
    (((finalPremiumAzn - baselineClass7PremiumAzn) / baselineClass7PremiumAzn) * 100).toFixed(1)
  );

  const finalPremiumUsd = Number((finalPremiumAzn * EXCHANGE_RATES.USD).toFixed(2));
  const finalPremiumEur = Number((finalPremiumAzn * EXCHANGE_RATES.EUR).toFixed(2));

  const atFaultAccidents = params.atFaultAccidentsInPeriod ?? 0;
  const nextProjectedClass = calculateNextBonusMalusClass(params.currentClass, atFaultAccidents);
  const nextProjectedCoefficient = BONUS_MALUS_CLASSES[nextProjectedClass].coefficient;

  return {
    baseTariffAzn,
    engineCoefficient,
    territoryCoefficient,
    experienceCoefficient,
    bonusMalusCoefficient,
    finalPremiumAzn,
    finalPremiumUsd,
    finalPremiumEur,
    baselineClass7PremiumAzn,
    differenceVsBaseAzn,
    differenceVsBasePercent,
    nextProjectedClass,
    nextProjectedCoefficient,
    statutoryMaxPropertyLimitAzn: STATUTORY_PROPERTY_DAMAGE_LIMIT_AZN,
    statutoryMaxBodilyLimitAzn: STATUTORY_BODILY_INJURY_LIMIT_AZN,
    legalBasisAz: 'Azərbaycan Respublikasının "İcbari sığortalar haqqında" Qanununun X fəsli və AMB Qaydaları',
    legalBasisEn: 'Law of the Republic of Azerbaijan on Compulsory Insurances (Chapter X) & Central Bank Regulations',
  };
}

/**
 * Risk classification based on current class.
 */
export function getRiskRating(classId: BonusMalusClassId): {
  level: 'low' | 'moderate' | 'elevated' | 'high';
  labelAz: string;
  labelEn: string;
  colorClass: string;
} {
  const coeff = BONUS_MALUS_CLASSES[classId].coefficient;
  if (coeff <= 0.75) {
    return {
      level: 'low',
      labelAz: 'Yüksək Etibarlı / Aşağı Risk',
      labelEn: 'High Reliability / Low Risk',
      colorClass: 'text-emerald-500 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800',
    };
  }
  if (coeff <= 1.0) {
    return {
      level: 'moderate',
      labelAz: 'Standart / Mülayim Risk',
      labelEn: 'Standard / Moderate Risk',
      colorClass: 'text-blue-500 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800',
    };
  }
  if (coeff <= 1.3) {
    return {
      level: 'elevated',
      labelAz: 'Yüksəlmiş Qəza Riski',
      labelEn: 'Elevated Accident Risk',
      colorClass: 'text-amber-500 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800',
    };
  }
  return {
    level: 'high',
    labelAz: 'Kritik Risk / Çoxsaylı Zərər',
    labelEn: 'Critical Risk / Multiple Claims',
    colorClass: 'text-rose-500 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800',
  };
}

/**
 * Generates an official verifiable AMB & İSB Electronic Bonus-Malus Certificate.
 */
export function generateBonusMalusCertificate(
  driver: BonusMalusDriverProfile,
  vehiclePlate?: string,
  insurerId?: string
): BonusMalusCertificate {
  const seed = `${driver.fin}-${driver.licenseSeriesNumber}-${driver.currentClass}`;
  let hashVal = 0;
  for (let i = 0; i < seed.length; i++) {
    hashVal = (hashVal << 5) - hashVal + seed.charCodeAt(i);
    hashVal |= 0;
  }
  const cleanHash = Math.abs(hashVal).toString(16).toUpperCase().padStart(8, '0');
  const serialSuffix = Math.floor(10000 + Math.random() * 90000);
  const certificateNumber = `AMB-BMS-2026-${serialSuffix}`;

  const issueDate = new Date().toISOString().split('T')[0];
  const validUntilDate = new Date();
  validUntilDate.setFullYear(validUntilDate.getFullYear() + 1);
  const validUntil = validUntilDate.toISOString().split('T')[0];

  const classInfo = BONUS_MALUS_CLASSES[driver.currentClass] || BONUS_MALUS_CLASSES.BM_7;
  const projectedRenewalClass = calculateNextBonusMalusClass(driver.currentClass, 0);

  return {
    certificateNumber,
    verificationHash: `SHA256-${cleanHash}-${serialSuffix}`,
    issueDate,
    validUntil,
    driver: {
      ...driver,
      assignedPlate: vehiclePlate || driver.assignedPlate,
      activeInsurer: insurerId || driver.activeInsurer,
    },
    classInfo,
    projectedRenewalClass,
    qrCodeUrl: `https://isb.az/verify/bm?cert=${certificateNumber}&fin=${driver.fin}&hash=${cleanHash}`,
    securitySeal: `AMB-ISB-SIG-SECURE-${cleanHash}`,
  };
}

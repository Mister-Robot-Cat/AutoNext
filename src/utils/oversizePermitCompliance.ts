/**
 * Official AAYDA (Azərbaycan Avtomobil Yolları Dövlət Agentliyi) & BDYP
 * Heavy Axle Load & Oversize Cargo Road Transport Permitting Calculation Engine
 *
 * Adheres to:
 * - Cabinet of Ministers Decision No. 104 on Rules for the Carriage of Heavy and Oversized Loads by Road Vehicles
 * - Law of Azerbaijan on Road Traffic (YHQ Article 57 & Article 58)
 * - Code of Administrative Offences (İXM Article 353: Overweight & Oversize Violations)
 * - Law of Azerbaijan on Automobile Roads & AAYDA Road Wear Compensation Tariffs
 * - Law of Azerbaijan on State Duties (Article 33: Special Permit Issuance Fee)
 */

import { Currency } from '../types/vehicle';

export type AxleConfiguration = '2_axle' | '3_axle' | '4_axle' | '5_axle' | '6_axle_or_more';

export type CargoCategory =
  | 'standard_container' // Standard ISO container (e.g., 40ft high cube)
  | 'construction_machinery' // Excavator, bulldozer, drilling rig on lowbed
  | 'wind_energy_component' // Wind turbine blade, tower section
  | 'oilfield_heavy_equipment' // Mud tank, oil pump jack, Christmas tree
  | 'industrial_transformer' // Substation electrical transformer
  | 'precast_concrete_girder' // Bridge span beam, concrete slab
  | 'mobile_crane' // Self-propelled telescopic heavy crane
  | 'custom_cargo'; // User custom parameters

export type EscortRequirement =
  | 'none' // Compliant without escort
  | 'pilot_single_rear' // 1 civilian pilot vehicle with amber beacon (rear overhang or mild length)
  | 'pilot_double' // 2 civilian pilot vehicles (front & rear with amber beacons and signage)
  | 'bdyp_police_escort'; // BDYP Traffic Police Patrol Car escort (red/blue lights + sirens)

export type TransitTimeRestriction =
  | 'unrestricted_24h' // Standard allowable 24/7 transit
  | 'daylight_only' // 06:00 - 22:00 daylight transit only (width >3.0m or length >24m)
  | 'night_window_only' // 00:00 - 05:00 special low-traffic window (urban heavy girder passage)
  | 'prohibited'; // Prohibited until route modification or dismantling

export interface DimensionAuditInput {
  widthMeters: number; // Max permissible: 2.55m (standard) / 2.60m (isothermal)
  heightMeters: number; // Max permissible: 4.00m from road surface
  lengthMeters: number; // Max permissible: 12.0m (single) / 20.0m (articulated road train)
  rearOverhangMeters: number; // Max permissible without permit: 2.00m
  grossWeightTonnes: number; // Max permissible without permit: 40.0t (44.0t for 40ft container)
  axleCount: number; // 2, 3, 4, 5, 6, 7, 8+
  maxSingleAxleWeightTonnes: number; // Max permissible: 10.0t
  transitDistanceKm: number; // Transport route distance along public highways
  isContainerIntermodal?: boolean; // Eligible for 44.0t container exemption under NK 104
}

export interface DimensionLimitComparison {
  value: number;
  permissibleLimit: number;
  excess: number;
  excessPercentage: number;
  isExceeded: boolean;
}

export interface OversizeComplianceResult {
  isCompliant: boolean;
  needsSpecialPermit: boolean;
  escortRequirement: EscortRequirement;
  timeRestriction: TransitTimeRestriction;
  requiresRouteEngineeringClearance: boolean;
  dimensionAudit: {
    width: DimensionLimitComparison;
    height: DimensionLimitComparison;
    length: DimensionLimitComparison;
    rearOverhang: DimensionLimitComparison;
    grossWeight: DimensionLimitComparison;
    axleLoad: DimensionLimitComparison;
  };
  fees: {
    stateDutyAzn: number; // Law on State Duties Art. 33 (50 AZN base)
    roadWearCompensationAzn: number; // AAYDA road wear damage based on ton-km excess
    pilotEscortFeeAzn: number; // Commercial escort cost estimate
    policeEscortFeeAzn: number; // State duty for BDYP operational escort
    totalFeeAzn: number;
  };
  finesIfUnauthorized: {
    driverFineAzn: number; // İXM 353.1 / 353.2
    officialFineAzn: number; // İXM 353.3
    legalEntityFineAzn: number; // İXM 353.4
    articleCitation: string;
    vehicleImpoundRisk: boolean;
  };
  recommendedActionsAz: string[];
}

export interface HeavyCorridor {
  id: string;
  code: string; // e.g. "M-1", "M-2"
  nameAz: string;
  nameEn: string;
  totalLengthKm: number;
  maxBridgeClearanceMeters: number; // Overhead bridge clearance
  maxBridgeLoadTonnes: number; // Bridge structural capacity
  wimCheckpointCount: number; // Electronic Weigh-in-Motion scale checkpoints
  isMountainous: boolean;
  specialClearanceNotesAz: string;
}

export interface OversizePermitVoucher {
  permitNumber: string; // "AAYDA-OVS-2026-XXXXX"
  issueDate: string;
  validUntil: string;
  carrierVoen: string;
  carrierNameAz: string;
  vehiclePlate: string;
  trailerPlate: string;
  cargoDescriptionAz: string;
  cargoCategory: CargoCategory;
  routeCorridor: string;
  transitDistanceKm: number;
  grossWeightTonnes: number;
  dimensionsSummary: string; // e.g. "18.5m x 3.4m x 4.2m"
  escortType: EscortRequirement;
  totalFeeAzn: number;
  securityHash: string;
  status: 'active' | 'completed' | 'revoked';
}

// Statutory limits according to Cabinet of Ministers Decision No. 104
export const STATUTORY_OVERSIZE_LIMITS = {
  MAX_WIDTH_STANDARD_METERS: 2.55,
  MAX_WIDTH_REFRIGERATED_METERS: 2.60,
  MAX_HEIGHT_METERS: 4.00,
  MAX_LENGTH_SINGLE_METERS: 12.00,
  MAX_LENGTH_ARTICULATED_METERS: 20.00,
  MAX_REAR_OVERHANG_METERS: 2.00,
  MAX_GROSS_WEIGHT_STANDARD_TONNES: 40.00,
  MAX_GROSS_WEIGHT_CONTAINER_TONNES: 44.00,
  MAX_SINGLE_AXLE_TONNES: 10.00,
  MAX_TANDEM_AXLE_TONNES: 16.00,
  MAX_TRIDEM_AXLE_TONNES: 24.00,

  // Escort threshold triggers
  ESCORT_SINGLE_PILOT_WIDTH_METERS: 3.00,
  ESCORT_SINGLE_PILOT_LENGTH_METERS: 22.00,
  ESCORT_DOUBLE_PILOT_WIDTH_METERS: 3.50,
  ESCORT_DOUBLE_PILOT_LENGTH_METERS: 25.00,
  ESCORT_POLICE_WIDTH_METERS: 4.00,
  ESCORT_POLICE_LENGTH_METERS: 30.00,
  ESCORT_POLICE_WEIGHT_TONNES: 60.00,

  // Fees
  BASE_STATE_DUTY_AZN: 50.0,
  BASE_ROAD_WEAR_COEFFICIENT_AZN_PER_TON_KM: 0.08,
  PILOT_ESCORT_BASE_AZN: 180.0,
  PILOT_ESCORT_PER_KM_AZN: 1.2,
  POLICE_ESCORT_FLAT_AZN: 350.0,
};

/**
 * Currency conversion helper
 */
export function convertCurrency(
  amountAzn: number,
  targetCurrency: Currency,
  rates: { USD: number; EUR: number } = { USD: 1.7, EUR: 1.85 }
): number {
  if (targetCurrency === 'AZN') return Math.round(amountAzn * 100) / 100;
  if (targetCurrency === 'USD') return Math.round((amountAzn / rates.USD) * 100) / 100;
  if (targetCurrency === 'EUR') return Math.round((amountAzn / rates.EUR) * 100) / 100;
  return amountAzn;
}

/**
 * Calculate dimension comparisons against legal statutory limits
 */
function createDimensionComparison(actual: number, limit: number): DimensionLimitComparison {
  const excess = Math.max(0, actual - limit);
  const excessPercentage = limit > 0 ? Math.round((excess / limit) * 1000) / 10 : 0;
  return {
    value: Math.round(actual * 100) / 100,
    permissibleLimit: limit,
    excess: Math.round(excess * 100) / 100,
    excessPercentage,
    isExceeded: excess > 0,
  };
}

/**
 * Calculate AAYDA Road Wear Compensation Fee based on weight excess and distance
 */
export function calculateRoadWearCompensation(
  grossWeightTonnes: number,
  maxSingleAxleWeightTonnes: number,
  transitDistanceKm: number,
  isContainerIntermodal = false
): number {
  const permissibleWeight = isContainerIntermodal
    ? STATUTORY_OVERSIZE_LIMITS.MAX_GROSS_WEIGHT_CONTAINER_TONNES
    : STATUTORY_OVERSIZE_LIMITS.MAX_GROSS_WEIGHT_STANDARD_TONNES;

  const weightExcess = Math.max(0, grossWeightTonnes - permissibleWeight);
  const axleExcess = Math.max(0, maxSingleAxleWeightTonnes - STATUTORY_OVERSIZE_LIMITS.MAX_SINGLE_AXLE_TONNES);

  if (weightExcess === 0 && axleExcess === 0) {
    return 0;
  }

  // Formula: (Weight Excess * 0.08 AZN + Axle Excess * 0.12 AZN) * Distance (km)
  const tonKmDamage = (weightExcess * STATUTORY_OVERSIZE_LIMITS.BASE_ROAD_WEAR_COEFFICIENT_AZN_PER_TON_KM + axleExcess * 0.12) * transitDistanceKm;

  // Minimum fee threshold of 40 AZN if any excess exists
  return Math.max(40, Math.round(tonKmDamage * 100) / 100);
}

/**
 * Audit vehicle and cargo dimensions according to NK Decision No. 104 and YHQ
 */
export function auditOversizeCompliance(input: DimensionAuditInput): OversizeComplianceResult {
  const permissibleGrossWeight = input.isContainerIntermodal
    ? STATUTORY_OVERSIZE_LIMITS.MAX_GROSS_WEIGHT_CONTAINER_TONNES
    : STATUTORY_OVERSIZE_LIMITS.MAX_GROSS_WEIGHT_STANDARD_TONNES;

  const widthAudit = createDimensionComparison(input.widthMeters, STATUTORY_OVERSIZE_LIMITS.MAX_WIDTH_STANDARD_METERS);
  const heightAudit = createDimensionComparison(input.heightMeters, STATUTORY_OVERSIZE_LIMITS.MAX_HEIGHT_METERS);
  const lengthAudit = createDimensionComparison(input.lengthMeters, STATUTORY_OVERSIZE_LIMITS.MAX_LENGTH_ARTICULATED_METERS);
  const rearOverhangAudit = createDimensionComparison(input.rearOverhangMeters, STATUTORY_OVERSIZE_LIMITS.MAX_REAR_OVERHANG_METERS);
  const grossWeightAudit = createDimensionComparison(input.grossWeightTonnes, permissibleGrossWeight);
  const axleLoadAudit = createDimensionComparison(input.maxSingleAxleWeightTonnes, STATUTORY_OVERSIZE_LIMITS.MAX_SINGLE_AXLE_TONNES);

  const isCompliant =
    !widthAudit.isExceeded &&
    !heightAudit.isExceeded &&
    !lengthAudit.isExceeded &&
    !rearOverhangAudit.isExceeded &&
    !grossWeightAudit.isExceeded &&
    !axleLoadAudit.isExceeded;

  const needsSpecialPermit = !isCompliant;

  // Determine Escort Requirement
  let escortRequirement: EscortRequirement = 'none';
  if (
    input.widthMeters > STATUTORY_OVERSIZE_LIMITS.ESCORT_POLICE_WIDTH_METERS ||
    input.lengthMeters > STATUTORY_OVERSIZE_LIMITS.ESCORT_POLICE_LENGTH_METERS ||
    input.grossWeightTonnes > STATUTORY_OVERSIZE_LIMITS.ESCORT_POLICE_WEIGHT_TONNES
  ) {
    escortRequirement = 'bdyp_police_escort';
  } else if (
    input.widthMeters > STATUTORY_OVERSIZE_LIMITS.ESCORT_DOUBLE_PILOT_WIDTH_METERS ||
    input.lengthMeters > STATUTORY_OVERSIZE_LIMITS.ESCORT_DOUBLE_PILOT_LENGTH_METERS
  ) {
    escortRequirement = 'pilot_double';
  } else if (
    input.widthMeters > STATUTORY_OVERSIZE_LIMITS.ESCORT_SINGLE_PILOT_WIDTH_METERS ||
    input.lengthMeters > STATUTORY_OVERSIZE_LIMITS.ESCORT_SINGLE_PILOT_LENGTH_METERS ||
    input.rearOverhangMeters > 2.0
  ) {
    escortRequirement = 'pilot_single_rear';
  }

  // Determine Transit Time Restriction
  let timeRestriction: TransitTimeRestriction = 'unrestricted_24h';
  if (input.widthMeters > 4.5 || input.heightMeters > 4.8 || input.lengthMeters > 35.0) {
    timeRestriction = 'night_window_only';
  } else if (input.widthMeters > 3.0 || input.lengthMeters > 24.0) {
    timeRestriction = 'daylight_only';
  }

  const requiresRouteEngineeringClearance =
    input.heightMeters >= 4.5 || input.grossWeightTonnes >= 60.0 || input.widthMeters >= 4.2;

  // Fees calculation
  const stateDutyAzn = needsSpecialPermit ? STATUTORY_OVERSIZE_LIMITS.BASE_STATE_DUTY_AZN : 0;
  const roadWearCompensationAzn = calculateRoadWearCompensation(
    input.grossWeightTonnes,
    input.maxSingleAxleWeightTonnes,
    input.transitDistanceKm,
    input.isContainerIntermodal
  );

  let pilotEscortFeeAzn = 0;
  let policeEscortFeeAzn = 0;

  if (escortRequirement === 'pilot_single_rear') {
    pilotEscortFeeAzn =
      STATUTORY_OVERSIZE_LIMITS.PILOT_ESCORT_BASE_AZN +
      input.transitDistanceKm * STATUTORY_OVERSIZE_LIMITS.PILOT_ESCORT_PER_KM_AZN;
  } else if (escortRequirement === 'pilot_double') {
    pilotEscortFeeAzn =
      (STATUTORY_OVERSIZE_LIMITS.PILOT_ESCORT_BASE_AZN +
        input.transitDistanceKm * STATUTORY_OVERSIZE_LIMITS.PILOT_ESCORT_PER_KM_AZN) *
      1.8;
  } else if (escortRequirement === 'bdyp_police_escort') {
    policeEscortFeeAzn = STATUTORY_OVERSIZE_LIMITS.POLICE_ESCORT_FLAT_AZN;
  }

  const totalFeeAzn = Math.round((stateDutyAzn + roadWearCompensationAzn + pilotEscortFeeAzn + policeEscortFeeAzn) * 100) / 100;

  // Statutory Fines under İXM Article 353
  let driverFineAzn = 0;
  let officialFineAzn = 0;
  let legalEntityFineAzn = 0;
  let articleCitation = 'İXM Maddə 353-cü maddə tətbiq olunmur (Parametrlər norma daxilindədir)';
  let vehicleImpoundRisk = false;

  if (needsSpecialPermit) {
    const maxExcessPct = Math.max(
      widthAudit.excessPercentage,
      heightAudit.excessPercentage,
      lengthAudit.excessPercentage,
      grossWeightAudit.excessPercentage,
      axleLoadAudit.excessPercentage
    );

    if (maxExcessPct > 20) {
      driverFineAzn = 800;
      officialFineAzn = 2000;
      legalEntityFineAzn = 7000;
      articleCitation = 'İXM Maddə 353.2 (Parametrlərin 20%-dən çox aşılması)';
      vehicleImpoundRisk = true;
    } else {
      driverFineAzn = 600;
      officialFineAzn = 1400;
      legalEntityFineAzn = 4000;
      articleCitation = 'İXM Maddə 353.1 (İcazəsiz iriqabaritli və ya ağırçəkili nəqliyyatın idarə edilməsi)';
      vehicleImpoundRisk = true;
    }
  }

  // Recommended actions
  const recommendedActionsAz: string[] = [];
  if (isCompliant) {
    recommendedActionsAz.push('Nəqliyyat vasitəsi və yükün parametrləri NK 104 saylı qərarın standart limitlərinə tam uyğundur.');
    recommendedActionsAz.push('Xüsusi icazə tələb olunmur, respublika yollarında sərbəst hərəkət edə bilərsiniz.');
  } else {
    recommendedActionsAz.push('AAYDA və BDYP portalından "Xüsusi İcazə" (AAYDA-OVS elektron vərəqəsi) rəsmiləşdirilməlidir.');
    if (widthAudit.isExceeded) {
      recommendedActionsAz.push(`En norması ${widthAudit.excess} m aşılmışdır. Narıncı işıq qaytarıcı "İri Qabarit" lövhələri quraşdırılmalıdır.`);
    }
    if (heightAudit.isExceeded) {
      recommendedActionsAz.push(`Hündürlük norması ${heightAudit.excess} m aşılmışdır. Körpü və ötürücülərdən keçid trayektoriyası yoxlanılmalıdır.`);
    }
    if (grossWeightAudit.isExceeded || axleLoadAudit.isExceeded) {
      recommendedActionsAz.push(`Çəki və ya ox yükü aşımı səbəbindən AAYDA yol örtüyünə dəyən ziyan kompensasiyası (${roadWearCompensationAzn} AZN) ödənilməlidir.`);
    }
    if (escortRequirement === 'pilot_single_rear') {
      recommendedActionsAz.push('Yükün arxasında narıncı mayaklı və qabarit dirəkli 1 ədəd mülki müşayiət (pilot) avtomobili hərəkət etməlidir.');
    } else if (escortRequirement === 'pilot_double') {
      recommendedActionsAz.push('Yükün həm önündə, həm də arxasında narıncı mayaklı 2 ədəd mülki pilot avtomobili müşayiət etməlidir.');
    } else if (escortRequirement === 'bdyp_police_escort') {
      recommendedActionsAz.push('Dövlət Yol Polisi (BDYP) YPX patrul avtomobili tərəfindən xüsusi qırmızı/mavi mayaklı rəsmi müşayiət tələb olunur.');
    }
    if (timeRestriction === 'daylight_only') {
      recommendedActionsAz.push('Yalnız gündüz saatlarında (06:00 - 22:00) hərəkətə icazə verilir.');
    } else if (timeRestriction === 'night_window_only') {
      recommendedActionsAz.push('Şəhərlərarası magistrallarda yalnız gecə saatlarında (00:00 - 05:00) aşağı sıxlıqlı pəncərədə hərəkət edilə bilər.');
    }
  }

  return {
    isCompliant,
    needsSpecialPermit,
    escortRequirement,
    timeRestriction,
    requiresRouteEngineeringClearance,
    dimensionAudit: {
      width: widthAudit,
      height: heightAudit,
      length: lengthAudit,
      rearOverhang: rearOverhangAudit,
      grossWeight: grossWeightAudit,
      axleLoad: axleLoadAudit,
    },
    fees: {
      stateDutyAzn,
      roadWearCompensationAzn,
      pilotEscortFeeAzn,
      policeEscortFeeAzn,
      totalFeeAzn,
    },
    finesIfUnauthorized: {
      driverFineAzn,
      officialFineAzn,
      legalEntityFineAzn,
      articleCitation,
      vehicleImpoundRisk,
    },
    recommendedActionsAz,
  };
}

/**
 * Generate official electronic special permit voucher
 */
export function generateOversizePermitVoucher(
  params: {
    carrierVoen: string;
    carrierNameAz: string;
    vehiclePlate: string;
    trailerPlate: string;
    cargoCategory: CargoCategory;
    cargoDescriptionAz: string;
    routeCorridor: string;
    transitDistanceKm: number;
    auditResult: OversizeComplianceResult;
  }
): OversizePermitVoucher {
  const serialNumber = `AAYDA-OVS-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  const now = new Date();
  const issueDate = now.toISOString().split('T')[0];
  const validUntilDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14-day validity
  const validUntil = validUntilDate.toISOString().split('T')[0];

  const dim = params.auditResult.dimensionAudit;
  const dimensionsSummary = `${dim.length.value}m × ${dim.width.value}m × ${dim.height.value}m (Çəki: ${dim.grossWeight.value}t, Ox: ${dim.axleLoad.value}t)`;

  const rawHash = `${serialNumber}:${params.carrierVoen}:${params.vehiclePlate}:${params.auditResult.fees.totalFeeAzn}`;
  let hashNum = 0;
  for (let i = 0; i < rawHash.length; i++) {
    hashNum = (hashNum << 5) - hashNum + rawHash.charCodeAt(i);
    hashNum |= 0;
  }
  const securityHash = `SHA256:${Math.abs(hashNum).toString(16).toUpperCase().padStart(8, '0')}`;

  return {
    permitNumber: serialNumber,
    issueDate,
    validUntil,
    carrierVoen: params.carrierVoen,
    carrierNameAz: params.carrierNameAz,
    vehiclePlate: params.vehiclePlate,
    trailerPlate: params.trailerPlate,
    cargoCategory: params.cargoCategory,
    cargoDescriptionAz: params.cargoDescriptionAz,
    routeCorridor: params.routeCorridor,
    transitDistanceKm: params.transitDistanceKm,
    grossWeightTonnes: dim.grossWeight.value,
    dimensionsSummary,
    escortType: params.auditResult.escortRequirement,
    totalFeeAzn: params.auditResult.fees.totalFeeAzn,
    securityHash,
    status: 'active',
  };
}

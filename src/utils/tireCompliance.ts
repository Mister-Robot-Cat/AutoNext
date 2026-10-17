import { Currency, Vehicle } from '../types/vehicle';

export type TireVehicleCategory =
  | 'M1_passenger'
  | 'N1_N3_truck'
  | 'M2_M3_bus'
  | 'L_motorcycle';

export type TireSeasonType =
  | 'summer'
  | 'all_season_ms'
  | 'winter_3pmsf'
  | 'studded_winter';

export interface WheelTreadDepths {
  frontLeft: number;
  frontRight: number;
  rearLeft: number;
  rearRight: number;
}

export interface TreadTelemetryInput {
  vehicleCategory: TireVehicleCategory;
  tireSeason: TireSeasonType;
  treadDepthMm: WheelTreadDepths;
  hasMixedAxleTires: boolean;
  hasSidewallDamageOrExposedCord: boolean;
  hasMissingWheelBolts: boolean;
  dotManufactureYear: number;
  isWinterMountainRoute: boolean;
  currentYear?: number;
}

export interface TreadAuditResult {
  minMeasuredTreadMm: number;
  avgMeasuredTreadMm: number;
  frontAxleDiffMm: number;
  rearAxleDiffMm: number;
  statutoryMinMm: number;
  recommendedWinterMinMm: number;
  tireAgeYears: number;
  isAgeWarning: boolean;
  isAgeCritical: boolean;
  isTreadCompliant: boolean;
  isWinterMountainCompliant: boolean;
  isFullyCompliant: boolean;
  wetBrakingDistance80KmhMeters: number;
  hydroplaningRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  violationArticles: string[];
  fineAmountAzn: number;
  verdictTitle: string;
  statutoryExplanation: string;
  recommendations: string[];
}

export interface TireDimensionSpec {
  widthMm: number;
  aspectRatio: number;
  rimDiameterInches: number;
}

export interface TireEquivalenceResult {
  oemLabel: string;
  targetLabel: string;
  oemSidewallMm: number;
  targetSidewallMm: number;
  oemOuterDiameterMm: number;
  targetOuterDiameterMm: number;
  diameterDiffMm: number;
  diameterDiffPercent: number;
  clearanceDeltaMm: number;
  oemCircumferenceMm: number;
  targetCircumferenceMm: number;
  oemRevsPerKm: number;
  targetRevsPerKm: number;
  actualSpeedAt100Kmh: number;
  speedometerErrorKmh: number;
  isWithinTolerance3Percent: boolean;
  requiresConstructiveCert: boolean;
  constructiveFineRiskAzn: number;
  fitmentVerdict:
    | 'OPTIMAL_FIT'
    | 'ACCEPTABLE_WITHIN_3_PERCENT'
    | 'NON_COMPLIANT_CONSTRUCTIVE_CHANGE';
  technicalSummary: string;
}

export type RoadSurfaceCondition =
  | 'DRY_COLD'
  | 'WET_SLUSH'
  | 'PACKED_SNOW'
  | 'BLACK_ICE_BLIZZARD';

export interface MountainPassCorridor {
  id: string;
  code: string;
  name: string;
  highwayCode: string;
  region: string;
  maxElevationMeters: number;
  maxGradientPercent: number;
  currentSurfaceCondition: RoadSurfaceCondition;
  ambientTempCelsius: number;
  requires3pmsfWinterTires: boolean;
  requiresAwdOrSnowChains: boolean;
  bdypCheckpointLocation: string;
  description: string;
}

export type DrivetrainType = 'FWD' | 'RWD' | 'AWD_4WD';

export interface MountainReadinessInput {
  corridor: MountainPassCorridor;
  drivetrain: DrivetrainType;
  tireSeason: TireSeasonType;
  minTreadDepthMm: number;
  hasSnowChainsOnBoard: boolean;
  hasMandatoryEmergencyKit: boolean;
}

export interface MountainReadinessResult {
  corridorId: string;
  corridorName: string;
  readinessScore: number;
  isClearedForPassage: boolean;
  checkpointStatus: 'CLEARED_GREEN' | 'CHAINS_REQUIRED_AMBER' | 'RESTRICTED_RED';
  tractionRatingLabel: string;
  warnings: string[];
  bdypAdvisory: string;
}

export type RimSizeTier = 'R14_R16' | 'R17_R18' | 'R19_R20' | 'R21_R22_SUV';

export type TireBrandTier = 'economy_budget' | 'mid_range_touring' | 'premium_flagship';

export interface TireServiceCostInput {
  includeNewTireSet4x: boolean;
  rimSizeTier: RimSizeTier;
  brandTier: TireBrandTier;
  includeSeasonalMountAndBalance: boolean;
  include3dWheelAlignment: boolean;
  includeTpmsSensorCalibration: boolean;
  includeNitrogenInflation: boolean;
  include6MonthTireHotel: boolean;
}

export interface TireServiceCostResult {
  tireSetCostAzn: number;
  mountAndBalanceCostAzn: number;
  wheelAlignment3dCostAzn: number;
  tpmsCalibrationCostAzn: number;
  nitrogenCostAzn: number;
  tireHotel6MonthCostAzn: number;
  totalCostAzn: number;
  breakdownSummary: string[];
}

export interface TireServiceCenter {
  id: string;
  code: string;
  name: string;
  city: string;
  address: string;
  workingHours: string;
  has3dHunterAlignment: boolean;
  hasTireHotelStorage: boolean;
  hasTpmsProgramming: boolean;
  rating: number;
  phone: string;
}

export interface ElectronicTireCertificate {
  certificateNumber: string;
  vehiclePlate: string;
  vehicleTitle: string;
  vin: string;
  vehicleCategory: TireVehicleCategory;
  oemTireSpec: string;
  installedTireSpec: string;
  tireSeason: TireSeasonType;
  measuredTreadMm: WheelTreadDepths;
  minTreadMm: number;
  diameterDeviationPercent: number;
  mountainPassCleared: boolean;
  complianceStatus: 'COMPLIANT' | 'WARNING' | 'PROHIBITED';
  issueDate: string;
  validUntilSeason: string;
  inspectingCenter: string;
  qrVerificationHash: string;
}

export const STATUTORY_TREAD_LIMITS_MM: Record<TireVehicleCategory, number> = {
  M1_passenger: 1.6, // YHQ Əlavə 1, Bənd V (5.1) — Minik avtomobilləri
  N1_N3_truck: 1.0, // Yük avtomobilləri
  M2_M3_bus: 2.0, // Avtobuslar
  L_motorcycle: 0.8, // Motosiklet və mopedlər
};

export const STATUTORY_TIRE_FINES = {
  IXM_342_1_5_TREAD_OR_AXLE_AZN: 50, // İXM Maddə 342.1.5 — Şinlərin protektor və ya ox üzrə pozuntusu
  IXM_342_2_1_CONSTRUCTIVE_SIZE_AZN: 150, // İXM Maddə 342.2-1 — Normadan kənar konstruktiv şin/disk ölçüsü
  WINTER_MOUNTAIN_RECOMMENDED_MM: 4.0, // Qış / Dağ keçidləri üçün tövsiyə və post norması (M+S / 3PMSF)
  MAX_SAFE_TIRE_AGE_YEARS: 6,
  CRITICAL_TIRE_AGE_YEARS: 10,
  MAX_DIAMETER_TOLERANCE_PERCENT: 3.0,
} as const;

export function convertTireCurrency(amountAzn: number, currency: Currency): number {
  if (currency === 'USD') {
    return Number((amountAzn / 1.7).toFixed(2));
  }
  if (currency === 'EUR') {
    return Number((amountAzn / 1.85).toFixed(2));
  }
  return Number(amountAzn.toFixed(2));
}

export function formatTireSpecLabel(spec: TireDimensionSpec): string {
  return `${spec.widthMm}/${spec.aspectRatio} R${spec.rimDiameterInches}`;
}

export function determineVehicleTireParameters(vehicle?: Vehicle | null): {
  oemSpec: TireDimensionSpec;
  drivetrain: DrivetrainType;
  vehicleCategory: TireVehicleCategory;
  defaultTreadDepths: WheelTreadDepths;
} {
  if (!vehicle) {
    return {
      oemSpec: { widthMm: 225, aspectRatio: 55, rimDiameterInches: 18 },
      drivetrain: 'FWD',
      vehicleCategory: 'M1_passenger',
      defaultTreadDepths: {
        frontLeft: 5.8,
        frontRight: 5.7,
        rearLeft: 6.2,
        rearRight: 6.1,
      },
    };
  }

  const body = vehicle.bodyType.toLowerCase();
  const isSuv = body.includes('suv') || body.includes('offroad') || body.includes('pickup');
  const isCoupeOrSport = body.includes('coupe') || vehicle.powerHp >= 300;
  const isVan = body.includes('minivan') || body.includes('van');

  let oemSpec: TireDimensionSpec = { widthMm: 215, aspectRatio: 55, rimDiameterInches: 17 };
  if (isSuv) {
    oemSpec = { widthMm: 255, aspectRatio: 50, rimDiameterInches: 20 };
  } else if (isCoupeOrSport) {
    oemSpec = { widthMm: 245, aspectRatio: 40, rimDiameterInches: 19 };
  } else if (isVan) {
    oemSpec = { widthMm: 215, aspectRatio: 65, rimDiameterInches: 16 };
  }

  const dtRaw = (vehicle.drivetrain || '').toUpperCase();
  let drivetrain: DrivetrainType = 'FWD';
  if (dtRaw.includes('AWD') || dtRaw.includes('4WD') || isSuv) {
    drivetrain = 'AWD_4WD';
  } else if (dtRaw.includes('RWD')) {
    drivetrain = 'RWD';
  }

  return {
    oemSpec,
    drivetrain,
    vehicleCategory: 'M1_passenger',
    defaultTreadDepths: {
      frontLeft: 6.0,
      frontRight: 5.9,
      rearLeft: 6.3,
      rearRight: 6.2,
    },
  };
}

/**
 * Evaluates 4-wheel tire tread depths, axle symmetry, sidewall integrity, and DOT age
 * against YHQ Annex 1 Section V and İXM Article 342.1.5.
 */
export function evaluateTireTreadCompliance(input: TreadTelemetryInput): TreadAuditResult {
  const fl = Math.max(0, Number(input.treadDepthMm.frontLeft.toFixed(1)));
  const fr = Math.max(0, Number(input.treadDepthMm.frontRight.toFixed(1)));
  const rl = Math.max(0, Number(input.treadDepthMm.rearLeft.toFixed(1)));
  const rr = Math.max(0, Number(input.treadDepthMm.rearRight.toFixed(1)));

  const minMeasuredTreadMm = Number(Math.min(fl, fr, rl, rr).toFixed(1));
  const avgMeasuredTreadMm = Number(((fl + fr + rl + rr) / 4).toFixed(2));
  const frontAxleDiffMm = Number(Math.abs(fl - fr).toFixed(1));
  const rearAxleDiffMm = Number(Math.abs(rl - rr).toFixed(1));

  const statutoryMinMm = STATUTORY_TREAD_LIMITS_MM[input.vehicleCategory];
  const recommendedWinterMinMm = STATUTORY_TIRE_FINES.WINTER_MOUNTAIN_RECOMMENDED_MM;

  const currentYear = input.currentYear ?? 2026;
  const tireAgeYears = Math.max(0, currentYear - input.dotManufactureYear);
  const isAgeWarning = tireAgeYears >= STATUTORY_TIRE_FINES.MAX_SAFE_TIRE_AGE_YEARS;
  const isAgeCritical = tireAgeYears >= STATUTORY_TIRE_FINES.CRITICAL_TIRE_AGE_YEARS;

  const isTreadCompliant = minMeasuredTreadMm >= statutoryMinMm;

  const isWinterTireEquipped =
    input.tireSeason === 'winter_3pmsf' ||
    input.tireSeason === 'studded_winter' ||
    input.tireSeason === 'all_season_ms';

  const isWinterMountainCompliant = input.isWinterMountainRoute
    ? minMeasuredTreadMm >= recommendedWinterMinMm && isWinterTireEquipped
    : true;

  const violationArticles: string[] = [];
  const recommendations: string[] = [];

  if (!isTreadCompliant) {
    violationArticles.push(
      `YHQ Əlavə 1, Bənd V (5.1) & İXM Maddə 342.1.5 — Protektor dərinliyi minimum normadan (${statutoryMinMm} mm) aşağıdır (${minMeasuredTreadMm} mm)`
    );
    recommendations.push(
      `Protektor dərinliyi qanuni həddən (${statutoryMinMm} mm) aşağı olan şinləri dərhal yenisi ilə əvəz edin.`
    );
  }

  if (input.hasMixedAxleTires) {
    violationArticles.push(
      'YHQ Əlavə 1, Bənd V (5.5) & İXM Maddə 342.1.5 — Eyni ox üzərində müxtəlif ölçülü, konstruksiyalı və ya protektor naxışlı şinlərin quraşdırılması qadağandır'
    );
    recommendations.push(
      'Hər bir oxda (ön və arxa) eyni marka, model, ölçü və mövsüm naxışlı cüt şinlər quraşdırın.'
    );
  }

  if (input.hasSidewallDamageOrExposedCord) {
    violationArticles.push(
      'YHQ Əlavə 1, Bənd V (5.2) & İXM Maddə 342.1.5 — Şinin kord qatını açan yerli zədələr (kəsik, şiş / "qrıja", çat) aşkar edilmişdir'
    );
    recommendations.push(
      'Yanaq hissəsində şiş ("qrıja") və ya kord zədəsi olan şin yüksək sürətdə partlama təhlükəsi daşıyır — istismarı dərhal dayandırın.'
    );
  }

  if (input.hasMissingWheelBolts) {
    violationArticles.push(
      'YHQ Əlavə 1, Bənd V (5.4) — Disk bərkidici bolt və ya qaykalarından hər hansı birinin olmaması istismarı qadağan edir'
    );
    recommendations.push(
      'Təkər topunda çatışmayan bərkidici bolt və ya qaykaları tam dəstlə bərpa edin və dinamometrik açarla sıxın.'
    );
  }

  if (frontAxleDiffMm > 1.5 || rearAxleDiffMm > 1.5) {
    recommendations.push(
      `Eyni oxda şinlər arasında qeyri-bərabər yeyilmə var (Ön fərq: ${frontAxleDiffMm} mm, Arxa fərq: ${rearAxleDiffMm} mm). 3D Razval-Sxojdeniye yoxlaması tövsiyə olunur.`
    );
  }

  if (input.isWinterMountainRoute && !isWinterMountainCompliant) {
    recommendations.push(
      `Qış dağ marşrutlarında (Ağsu aşırımı, Şahdağ, Murovdağ) BDYP postlarından keçid üçün ən azı ${recommendedWinterMinMm} mm protektorlu M+S / 3PMSF qış şinləri tələb olunur.`
    );
  }

  if (isAgeCritical) {
    recommendations.push(
      `Şinin istehsal tarixi (DOT ${input.dotManufactureYear}) ${tireAgeYears} ildir — rezin tərkibi sərtləşib və mikroçatlar yarandığı üçün dəyişdirilməsi həyati vacibdir.`
    );
  } else if (isAgeWarning) {
    recommendations.push(
      `Şinin yaşı ${tireAgeYears} ildir (6 ildən yuxarı). Protektor qalsa belə rezin elastikliyini itirdiyi üçün mövsümi yenilənmə məsləhətdir.`
    );
  }

  // Wet braking distance at 80 km/h (meters)
  // Baseline at 8.0mm new tire = 28.5m. As tread drops toward 1.6mm -> ~41.5m; below 1.6mm -> ~52m+
  let wetBrakingDistance80KmhMeters = 28.5;
  if (minMeasuredTreadMm >= 4.0) {
    wetBrakingDistance80KmhMeters = Number(
      (28.5 + Math.max(0, 8.0 - minMeasuredTreadMm) * 1.15).toFixed(1)
    );
  } else if (minMeasuredTreadMm >= 1.6) {
    wetBrakingDistance80KmhMeters = Number(
      (33.1 + (4.0 - minMeasuredTreadMm) * 3.5).toFixed(1)
    );
  } else {
    wetBrakingDistance80KmhMeters = Number(
      (41.5 + (1.6 - minMeasuredTreadMm) * 7.5).toFixed(1)
    );
  }

  let hydroplaningRiskLevel: TreadAuditResult['hydroplaningRiskLevel'] = 'LOW';
  if (minMeasuredTreadMm < statutoryMinMm || input.hasSidewallDamageOrExposedCord) {
    hydroplaningRiskLevel = 'CRITICAL';
  } else if (minMeasuredTreadMm < 3.0) {
    hydroplaningRiskLevel = 'HIGH';
  } else if (minMeasuredTreadMm < 4.5 || isAgeWarning) {
    hydroplaningRiskLevel = 'MODERATE';
  }

  const isFullyCompliant = violationArticles.length === 0 && isWinterMountainCompliant;
  const fineAmountAzn =
    violationArticles.length > 0 ? STATUTORY_TIRE_FINES.IXM_342_1_5_TREAD_OR_AXLE_AZN : 0;

  if (recommendations.length === 0) {
    recommendations.push(
      'Bütün 4 təkər üzrə protektor dərinliyi, ox simmetriyası və DOT yaş göstəriciləri YHQ Əlavə 1 standartlarına tam uyğundur.'
    );
  }

  let verdictTitle = 'YHQ Əlavə 1 Standartlarına Tam Uyğundur';
  let statutoryExplanation = `Protektorun minimal qalıq hündürlüyü (${minMeasuredTreadMm} mm) qanuni normadan (${statutoryMinMm} mm) yüksəkdir və istismar təhlükəsizdir.`;

  if (violationArticles.length > 0) {
    verdictTitle = 'İstismarı Qadağandır — İXM Maddə 342.1.5 (50 AZN Cərimə)';
    statutoryExplanation =
      'Yol Hərəkəti Haqqında Qanunun 1 saylı Əlavəsinin V bölməsinin tələbləri pozulduğu üçün nəqliyyat vasitəsinin istismarı qadağandır.';
  } else if (!isWinterMountainCompliant) {
    verdictTitle = 'Şəhərdaxili Qanuni, Qış Dağ Keçidləri Üçün Uyğun Deyil';
    statutoryExplanation = `Şinlər standart YHQ (${statutoryMinMm} mm) həddini ödəsə də, qarlı dağ yollarında (4.0 mm M+S / 3PMSF) təhlükəsizlik tələbini ödəmir.`;
  }

  return {
    minMeasuredTreadMm,
    avgMeasuredTreadMm,
    frontAxleDiffMm,
    rearAxleDiffMm,
    statutoryMinMm,
    recommendedWinterMinMm,
    tireAgeYears,
    isAgeWarning,
    isAgeCritical,
    isTreadCompliant,
    isWinterMountainCompliant,
    isFullyCompliant,
    wetBrakingDistance80KmhMeters,
    hydroplaningRiskLevel,
    violationArticles,
    fineAmountAzn,
    verdictTitle,
    statutoryExplanation,
    recommendations,
  };
}

/**
 * Calculates dimensional equivalence, ground clearance delta, circumference,
 * and speedometer deviation between factory OEM tire spec and target tire spec.
 */
export function calculateTireSizeEquivalence(
  oem: TireDimensionSpec,
  target: TireDimensionSpec
): TireEquivalenceResult {
  const safeOemWidth = Math.max(125, oem.widthMm);
  const safeOemAspect = Math.max(25, oem.aspectRatio);
  const safeOemRim = Math.max(12, oem.rimDiameterInches);

  const safeTargetWidth = Math.max(125, target.widthMm);
  const safeTargetAspect = Math.max(25, target.aspectRatio);
  const safeTargetRim = Math.max(12, target.rimDiameterInches);

  const oemSidewallMm = Number(((safeOemWidth * safeOemAspect) / 100).toFixed(1));
  const targetSidewallMm = Number(((safeTargetWidth * safeTargetAspect) / 100).toFixed(1));

  const oemOuterDiameterMm = Number((safeOemRim * 25.4 + 2 * oemSidewallMm).toFixed(1));
  const targetOuterDiameterMm = Number((safeTargetRim * 25.4 + 2 * targetSidewallMm).toFixed(1));

  const diameterDiffMm = Number((targetOuterDiameterMm - oemOuterDiameterMm).toFixed(1));
  const diameterDiffPercent = Number(
    (((targetOuterDiameterMm - oemOuterDiameterMm) / oemOuterDiameterMm) * 100).toFixed(2)
  );
  const clearanceDeltaMm = Number((diameterDiffMm / 2).toFixed(1));

  const oemCircumferenceMm = Number((Math.PI * oemOuterDiameterMm).toFixed(1));
  const targetCircumferenceMm = Number((Math.PI * targetOuterDiameterMm).toFixed(1));

  const oemRevsPerKm = Number((1000000 / oemCircumferenceMm).toFixed(1));
  const targetRevsPerKm = Number((1000000 / targetCircumferenceMm).toFixed(1));

  const actualSpeedAt100Kmh = Number(
    (100 * (targetOuterDiameterMm / oemOuterDiameterMm)).toFixed(1)
  );
  const speedometerErrorKmh = Number((actualSpeedAt100Kmh - 100).toFixed(1));

  const absDiffPercent = Math.abs(diameterDiffPercent);
  const isWithinTolerance3Percent =
    absDiffPercent <= STATUTORY_TIRE_FINES.MAX_DIAMETER_TOLERANCE_PERCENT;
  const requiresConstructiveCert = !isWithinTolerance3Percent;
  const constructiveFineRiskAzn = requiresConstructiveCert
    ? STATUTORY_TIRE_FINES.IXM_342_2_1_CONSTRUCTIVE_SIZE_AZN
    : 0;

  let fitmentVerdict: TireEquivalenceResult['fitmentVerdict'] = 'OPTIMAL_FIT';
  let technicalSummary =
    'Həndəsi ölçü zavod (OEM) parametrlərinə ideal uyğundur — ABS/ESP və spidometr kalibrasiyası dəyişmir.';

  if (absDiffPercent > 3.0) {
    fitmentVerdict = 'NON_COMPLIANT_CONSTRUCTIVE_CHANGE';
    technicalSummary = `Diametr fərqi (${diameterDiffPercent}%) buraxılan ±3.0% normanı aşır! Təkər tağlarına sürtünmə, ABS/ESP xətası və İXM Maddə 342.2-1 (150 AZN) üzrə konstruktiv dəyişiklik cəriməsi riski var.`;
  } else if (absDiffPercent > 1.5) {
    fitmentVerdict = 'ACCEPTABLE_WITHIN_3_PERCENT';
    technicalSummary = `Diametr fərqi (${diameterDiffPercent}%) ±3.0% texniki dözümlülük həddi daxilindədir. Klirens ${clearanceDeltaMm >= 0 ? `+${clearanceDeltaMm}` : clearanceDeltaMm} mm dəyişir.`;
  }

  return {
    oemLabel: formatTireSpecLabel({
      widthMm: safeOemWidth,
      aspectRatio: safeOemAspect,
      rimDiameterInches: safeOemRim,
    }),
    targetLabel: formatTireSpecLabel({
      widthMm: safeTargetWidth,
      aspectRatio: safeTargetAspect,
      rimDiameterInches: safeTargetRim,
    }),
    oemSidewallMm,
    targetSidewallMm,
    oemOuterDiameterMm,
    targetOuterDiameterMm,
    diameterDiffMm,
    diameterDiffPercent,
    clearanceDeltaMm,
    oemCircumferenceMm,
    targetCircumferenceMm,
    oemRevsPerKm,
    targetRevsPerKm,
    actualSpeedAt100Kmh,
    speedometerErrorKmh,
    isWithinTolerance3Percent,
    requiresConstructiveCert,
    constructiveFineRiskAzn,
    fitmentVerdict,
    technicalSummary,
  };
}

/**
 * Evaluates winter readiness for Azerbaijan mountain highway checkpoints
 * (Ağsu Pass, Şahdağ, Tufandağ, Murovdağ, Gədəbəy, Lerik).
 */
export function evaluateMountainWinterReadiness(
  input: MountainReadinessInput
): MountainReadinessResult {
  const { corridor } = input;
  let score = 50;
  const warnings: string[] = [];

  // Tire season score contribution
  if (input.tireSeason === 'winter_3pmsf') {
    score += 25;
  } else if (input.tireSeason === 'studded_winter') {
    score += 30;
  } else if (input.tireSeason === 'all_season_ms') {
    score += 10;
    if (corridor.currentSurfaceCondition === 'BLACK_ICE_BLIZZARD') {
      warnings.push(
        '4 fəsil (M+S) şinlər kəskin buzlaşma zamanı tam 3PMSF qış şinləri qədər ilişmə təmin etmir.'
      );
    }
  } else {
    // summer tire
    score -= 40;
    warnings.push(
      'Yay şinləri +7°C-dən aşağı temperaturda plastikləşir və qarlı/buzlu dağ aşırımlarında idarəetməni tam itirir!'
    );
  }

  // Tread depth contribution
  if (input.minTreadDepthMm >= 6.0) {
    score += 15;
  } else if (input.minTreadDepthMm >= 4.0) {
    score += 8;
  } else if (input.minTreadDepthMm >= 1.6) {
    score -= 20;
    warnings.push(
      `Protektor dərinliyi (${input.minTreadDepthMm} mm) dağ keçidləri üçün tələb olunan 4.0 mm qış normasından aşağıdır.`
    );
  } else {
    score -= 40;
    warnings.push(
      `Protektor dərinliyi (${input.minTreadDepthMm} mm) YHQ 1.6 mm qanuni minimumundan aşağıdır — istismar qadağandır.`
    );
  }

  // Drivetrain contribution
  if (input.drivetrain === 'AWD_4WD') {
    score += 15;
  } else if (input.drivetrain === 'FWD') {
    score += 5;
  } else {
    // RWD
    score -= 10;
    if (
      corridor.currentSurfaceCondition === 'PACKED_SNOW' ||
      corridor.currentSurfaceCondition === 'BLACK_ICE_BLIZZARD'
    ) {
      warnings.push(
        'Arxa ötürücülü (RWD) avtomobillər sərt yoxuşlarda qar zənciri olmadan sürüşmə (drift/bukslama) riski daşıyır.'
      );
    }
  }

  // Snow chains & emergency kit
  if (input.hasSnowChainsOnBoard) {
    score += 10;
  } else if (corridor.requiresAwdOrSnowChains && input.drivetrain !== 'AWD_4WD') {
    score -= 15;
    warnings.push(
      `${corridor.name} marşrutunda tək ötürücülü (FWD/RWD) avtomobillər üçün baqajda qar zənciri (Qar zənciri) məcburidir.`
    );
  }

  if (input.hasMandatoryEmergencyKit) {
    score += 5;
  } else {
    warnings.push(
      'Qış dağ səfəri üçün dartı trosunun, qəza dayanma nişanının və -20°C şüşəsilən mayenin olması vacibdir.'
    );
  }

  const readinessScore = Math.max(0, Math.min(100, score));

  const hasValidWinterTires =
    input.tireSeason === 'winter_3pmsf' ||
    input.tireSeason === 'studded_winter' ||
    (input.tireSeason === 'all_season_ms' &&
      corridor.currentSurfaceCondition !== 'BLACK_ICE_BLIZZARD');

  const meetsTreadForMountain = input.minTreadDepthMm >= 4.0;

  let checkpointStatus: MountainReadinessResult['checkpointStatus'] = 'CLEARED_GREEN';
  let isClearedForPassage = true;

  if (
    input.tireSeason === 'summer' ||
    input.minTreadDepthMm < 1.6 ||
    (!meetsTreadForMountain && corridor.requires3pmsfWinterTires)
  ) {
    checkpointStatus = 'RESTRICTED_RED';
    isClearedForPassage = false;
  } else if (
    !hasValidWinterTires ||
    (corridor.requiresAwdOrSnowChains &&
      input.drivetrain !== 'AWD_4WD' &&
      !input.hasSnowChainsOnBoard)
  ) {
    checkpointStatus = 'CHAINS_REQUIRED_AMBER';
    isClearedForPassage = false;
  }

  let tractionRatingLabel = 'Yüksək Dağ İlişməsi (Tam Hazır)';
  if (checkpointStatus === 'RESTRICTED_RED') {
    tractionRatingLabel = 'Kritik Sürüşmə Təhlükəsi (Keçid Məhdudlaşdırılıb)';
  } else if (checkpointStatus === 'CHAINS_REQUIRED_AMBER') {
    tractionRatingLabel = 'Qar Zənciri və ya 3PMSF Qış Şini Tələb Olunur';
  }

  const bdypAdvisory =
    checkpointStatus === 'CLEARED_GREEN'
      ? `${corridor.bdypCheckpointLocation} üzrə avtomobilin şin və ötürücü göstəriciləri qış rejiminə tam uyğundur.`
      : checkpointStatus === 'CHAINS_REQUIRED_AMBER'
      ? `${corridor.bdypCheckpointLocation} postundan keçid üçün aparıcı təkərlərə qar zənciri bağlanmalı və ya 3PMSF qış şinləri təmin edilməlidir.`
      : `${corridor.bdypCheckpointLocation} postunda yay və ya yeyilmiş şinlərlə hərəkət təhlükəsizlik məqsədilə BDYP tərəfindən dayandırılır.`;

  return {
    corridorId: corridor.id,
    corridorName: corridor.name,
    readinessScore,
    isClearedForPassage,
    checkpointStatus,
    tractionRatingLabel,
    warnings,
    bdypAdvisory,
  };
}

/**
 * Calculates total cost for 4-tire purchase, seasonal mounting & balancing,
 * 3D alignment (Razval-Sxojdeniye), TPMS programming, nitrogen, and 6-month Tire Hotel storage.
 */
export function calculateTireServiceCost(input: TireServiceCostInput): TireServiceCostResult {
  const unitPriceByRimAndBrand: Record<RimSizeTier, Record<TireBrandTier, number>> = {
    R14_R16: {
      economy_budget: 95,
      mid_range_touring: 145,
      premium_flagship: 215,
    },
    R17_R18: {
      economy_budget: 135,
      mid_range_touring: 210,
      premium_flagship: 320,
    },
    R19_R20: {
      economy_budget: 185,
      mid_range_touring: 290,
      premium_flagship: 440,
    },
    R21_R22_SUV: {
      economy_budget: 245,
      mid_range_touring: 380,
      premium_flagship: 590,
    },
  };

  const mountBalancePriceByRim: Record<RimSizeTier, number> = {
    R14_R16: 30,
    R17_R18: 45,
    R19_R20: 60,
    R21_R22_SUV: 80,
  };

  const singleTirePrice = unitPriceByRimAndBrand[input.rimSizeTier][input.brandTier];
  const tireSetCostAzn = input.includeNewTireSet4x ? singleTirePrice * 4 : 0;
  const mountAndBalanceCostAzn = input.includeSeasonalMountAndBalance
    ? mountBalancePriceByRim[input.rimSizeTier]
    : 0;
  const wheelAlignment3dCostAzn = input.include3dWheelAlignment ? 40 : 0;
  const tpmsCalibrationCostAzn = input.includeTpmsSensorCalibration ? 35 : 0;
  const nitrogenCostAzn = input.includeNitrogenInflation ? 15 : 0;
  const tireHotel6MonthCostAzn = input.include6MonthTireHotel ? 90 : 0;

  const totalCostAzn =
    tireSetCostAzn +
    mountAndBalanceCostAzn +
    wheelAlignment3dCostAzn +
    tpmsCalibrationCostAzn +
    nitrogenCostAzn +
    tireHotel6MonthCostAzn;

  const breakdownSummary: string[] = [];
  if (input.includeNewTireSet4x) {
    breakdownSummary.push(`4 ədəd yeni şin dəsti (${input.rimSizeTier}): ${tireSetCostAzn} AZN`);
  }
  if (input.includeSeasonalMountAndBalance) {
    breakdownSummary.push(
      `Mövsümi şinmontaj və lazer balanslaşdırma: ${mountAndBalanceCostAzn} AZN`
    );
  }
  if (input.include3dWheelAlignment) {
    breakdownSummary.push(`3D Kompüter Razval-Sxojdeniye (Ön + Arxa ox): ${wheelAlignment3dCostAzn} AZN`);
  }
  if (input.includeTpmsSensorCalibration) {
    breakdownSummary.push(`TPMS təzyiq sensorlarının kalibrasiyası: ${tpmsCalibrationCostAzn} AZN`);
  }
  if (input.includeNitrogenInflation) {
    breakdownSummary.push(`4 təkərin azot (N2) qazı ilə doldurulması: ${nitrogenCostAzn} AZN`);
  }
  if (input.include6MonthTireHotel) {
    breakdownSummary.push(`6 aylıq "Şin Oteli" temperatur rejimli saxlanma: ${tireHotel6MonthCostAzn} AZN`);
  }

  return {
    tireSetCostAzn,
    mountAndBalanceCostAzn,
    wheelAlignment3dCostAzn,
    tpmsCalibrationCostAzn,
    nitrogenCostAzn,
    tireHotel6MonthCostAzn,
    totalCostAzn,
    breakdownSummary,
  };
}

/**
 * Generates an official BDYP & AZS Electronic Tire & Winter Roadworthiness Certificate.
 */
export function generateElectronicTireCertificate(params: {
  vehiclePlate: string;
  vehicleTitle: string;
  vin: string;
  treadAudit: TreadAuditResult;
  equivalence: TireEquivalenceResult;
  tireSeason: TireSeasonType;
  vehicleCategory: TireVehicleCategory;
  measuredTreadMm: WheelTreadDepths;
  inspectingCenter: string;
}): ElectronicTireCertificate {
  const cleanPlate = params.vehiclePlate.trim().toUpperCase() || '99-AA-001';
  const seed = cleanPlate
    .split('')
    .reduce((acc, ch, idx) => acc + ch.charCodeAt(0) * (idx + 17), 30000);
  const serialSuffix = String(seed % 90000 + 10000);

  let complianceStatus: ElectronicTireCertificate['complianceStatus'] = 'COMPLIANT';
  if (!params.treadAudit.isTreadCompliant || !params.equivalence.isWithinTolerance3Percent) {
    complianceStatus = 'PROHIBITED';
  } else if (
    params.treadAudit.violationArticles.length > 0 ||
    params.treadAudit.isAgeWarning ||
    !params.treadAudit.isWinterMountainCompliant
  ) {
    complianceStatus = 'WARNING';
  }

  return {
    certificateNumber: `BDYP-SHIN-2026-${serialSuffix}`,
    vehiclePlate: cleanPlate,
    vehicleTitle: params.vehicleTitle || 'Nəqliyyat Vasitəsi',
    vin: params.vin || 'AZ99VIN2026000001',
    vehicleCategory: params.vehicleCategory,
    oemTireSpec: params.equivalence.oemLabel,
    installedTireSpec: params.equivalence.targetLabel,
    tireSeason: params.tireSeason,
    measuredTreadMm: params.measuredTreadMm,
    minTreadMm: params.treadAudit.minMeasuredTreadMm,
    diameterDeviationPercent: params.equivalence.diameterDiffPercent,
    mountainPassCleared:
      params.treadAudit.minMeasuredTreadMm >= 4.0 &&
      (params.tireSeason === 'winter_3pmsf' ||
        params.tireSeason === 'studded_winter' ||
        params.tireSeason === 'all_season_ms'),
    complianceStatus,
    issueDate: '17.10.2026',
    validUntilSeason: '15.04.2027 (Qış-Yaz Mövsümü)',
    inspectingCenter: params.inspectingCenter,
    qrVerificationHash: `AZS-SHIN-${serialSuffix}-${cleanPlate.replace(/[^A-Z0-9]/g, '')}`,
  };
}

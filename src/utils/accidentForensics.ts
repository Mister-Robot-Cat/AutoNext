/**
 * AutoNext - Official BDYP, Ministry of Justice & ISB Traffic Accident Investigation,
 * Skid Mark Speed Telemetry & Forensic Crash Reconstruction Engine
 * 
 * Adheres to:
 * - Forensic Auto-Technical Calculation Standards: v = sqrt(254 * (mu +/- 0.01*i) * S)
 * - Azerbaijan Criminal Code (Cinayet Mecellesi) Articles 263, 263-1, 264
 * - Code of Administrative Offences (IXM) Articles 327.1, 327.3, 327.8
 * - Law of Azerbaijan on Road Traffic (Yol hereketi haqqinda Qanun) Article 53
 * - Compulsory Insurance Bureau (ISB) claims calculation rules
 */

import { Currency } from '../types/vehicle';

export type RoadSurfaceCondition = 
  | 'dry_asphalt' 
  | 'wet_asphalt' 
  | 'packed_snow' 
  | 'ice_black_ice' 
  | 'gravel_dirt';

export type VehicleBrakingSystem = 
  | 'abs_active' 
  | 'abs_faulty' 
  | 'conventional_hydraulic' 
  | 'air_brakes_truck';

export type InjurySeverity = 
  | 'none_property_only' 
  | 'light_harm' 
  | 'moderate_harm' 
  | 'severe_harm' 
  | 'fatal_one' 
  | 'fatal_multiple';

export type DriverSobriety = 
  | 'sober' 
  | 'alcohol_intoxicated' 
  | 'narcotic_intoxicated' 
  | 'test_refused';

export interface RoadSurfaceProfile {
  id: RoadSurfaceCondition;
  nameAz: string;
  nameEn: string;
  muBase: number; // Coefficient of tire-road friction
  rollingResistance: number;
  descriptionAz: string;
}

export const ROAD_SURFACE_PROFILES: Record<RoadSurfaceCondition, RoadSurfaceProfile> = {
  dry_asphalt: {
    id: 'dry_asphalt',
    nameAz: 'Quru asfalt-beton örtük',
    nameEn: 'Dry asphalt-concrete surface',
    muBase: 0.75,
    rollingResistance: 0.015,
    descriptionAz: 'Optimal tormozlama yapışması, təmiz və quru asfalt (μ = 0.70 - 0.80)'
  },
  wet_asphalt: {
    id: 'wet_asphalt',
    nameAz: 'Nəm / yağışlı asfalt örtük',
    nameEn: 'Wet / rain-soaked asphalt',
    muBase: 0.45,
    rollingResistance: 0.020,
    descriptionAz: 'Su pərdəsi səbəbindən azalan yapışma əmsalı (μ = 0.40 - 0.50)'
  },
  packed_snow: {
    id: 'packed_snow',
    nameAz: 'Bərkimiş qarlı yol örtüyü',
    nameEn: 'Packed snow surface',
    muBase: 0.22,
    rollingResistance: 0.035,
    descriptionAz: 'Qış mövsümündə sıxılmış qar təbəqəsi (μ = 0.20 - 0.25)'
  },
  ice_black_ice: {
    id: 'ice_black_ice',
    nameAz: 'Buzlu / Gizli buz bağlamış (Qara buz)',
    nameEn: 'Icy / Black ice road',
    muBase: 0.12,
    rollingResistance: 0.012,
    descriptionAz: 'Kritik aşağı tormoz effektivliyi və fırlanma riski (μ = 0.10 - 0.15)'
  },
  gravel_dirt: {
    id: 'gravel_dirt',
    nameAz: 'Çınqıl / Torpaq örtüklü kənd yolu',
    nameEn: 'Gravel / Unpaved dirt road',
    muBase: 0.55,
    rollingResistance: 0.045,
    descriptionAz: 'Dənəvər səthlərdə təkərin qum/çınqıl kürüməsi (μ = 0.50 - 0.60)'
  }
};

export interface SpeedCalculationResult {
  skidMarkLengthM: number;
  roadSurface: RoadSurfaceCondition;
  frictionMu: number;
  slopeGradientPercent: number; // e.g., -5 for 5% downhill, +3 for 3% uphill
  effectiveMu: number;
  brakingSystem: VehicleBrakingSystem;
  efficiencyFactor: number;
  calculatedSpeedKmh: number;
  speedLimitKmh: number;
  isSpeedingExceeded: boolean;
  excessSpeedKmh: number;
  driverReactionTimeSec: number;
  reactionDistanceM: number;
  brakingDistanceM: number;
  totalStoppingDistanceM: number;
  kineticEnergyKj: number;
}

export interface PedestrianAvoidanceResult {
  hazardDistanceM: number;
  speedAtHazardKmh: number;
  stoppingDistanceM: number;
  driverHadTechnicalPossibility: boolean;
  marginDistanceM: number; // positive if stopped in time, negative if impact
  impactSpeedKmh: number; // 0 if stopped
  conclusionAz: string;
  conclusionEn: string;
}

export interface LegalLiabilityResult {
  framework: 'İXM' | 'CM';
  article: string;
  titleAz: string;
  titleEn: string;
  descriptionAz: string;
  penaltySummaryAz: string;
  fineAzn: number;
  penaltyPoints: number;
  prisonTermYearsMin: number;
  prisonTermYearsMax: number;
  licenseSuspensionYears: number;
  isCriminalProsecution: boolean;
  jurisdictionAz: string;
}

export interface InsuranceDamageResult {
  propertyDamageAzn: number;
  medicalBillsAzn: number;
  driverFaultPercent: number;
  isbCompulsoryCoverAzn: number;
  isbPropertyPayoutAzn: number;
  isbMedicalPayoutAzn: number;
  driverOutOfPocketAzn: number;
  kaskoCoverAzn: number;
  convertedAmounts: {
    currency: Currency;
    propertyDamage: number;
    isbTotal: number;
    outOfPocket: number;
    kaskoPayout: number;
  };
}

export interface ForensicReportData {
  reportNumber: string;
  incidentDate: string;
  incidentLocation: string;
  vehiclePlate: string;
  vehicleModel: string;
  vehicleMassKg: number;
  skidMarkLengthM: number;
  roadSurface: RoadSurfaceCondition;
  roadFrictionMu: number;
  calculatedSpeedKmh: number;
  speedLimitKmh: number;
  isSpeeding: boolean;
  hazardDistanceM: number;
  hadTechnicalPossibility: boolean;
  injurySeverity: InjurySeverity;
  driverSobriety: DriverSobriety;
  legalArticle: string;
  isCriminal: boolean;
  examinerName: string;
  institutionAz: string;
  digitalQrChecksum: string;
  simaSignatureHash: string;
}

// Currency exchange rates for AutoNext
const CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 0.5882, // 1 AZN = 0.5882 USD (1.70 AZN/USD)
  EUR: 0.5405  // 1 AZN = 0.5405 EUR (1.85 AZN/EUR)
};

/**
 * Calculates pre-braking vehicle speed from skid mark length
 * Formula: v = sqrt(254 * (mu +/- 0.01*i) * eta * S)
 */
export function calculateSpeedFromSkid(
  skidMarkLengthM: number,
  roadSurface: RoadSurfaceCondition,
  slopeGradientPercent: number = 0,
  brakingSystem: VehicleBrakingSystem = 'abs_active',
  speedLimitKmh: number = 60,
  driverReactionTimeSec: number = 0.9,
  vehicleMassKg: number = 1500
): SpeedCalculationResult {
  const profile = ROAD_SURFACE_PROFILES[roadSurface] || ROAD_SURFACE_PROFILES.dry_asphalt;
  const mu = profile.muBase;

  // Effective friction incorporating slope (downhill reduces effective friction, uphill increases)
  // slope in percent: e.g. -5% downhill -> mu - 0.05
  const slopeContribution = slopeGradientPercent / 100;
  const effectiveMu = Math.max(0.05, mu + slopeContribution);

  // Braking efficiency factor eta based on ABS / brake system
  let efficiencyFactor = 1.0;
  switch (brakingSystem) {
    case 'abs_active':
      efficiencyFactor = 1.05; // Modern ABS maintains near-peak static friction
      break;
    case 'abs_faulty':
      efficiencyFactor = 0.85; // Wheel lock & uneven drag
      break;
    case 'conventional_hydraulic':
      efficiencyFactor = 0.95;
      break;
    case 'air_brakes_truck':
      efficiencyFactor = 0.90; // Pneumatic actuator buildup lag
      break;
  }

  // Speed in km/h = sqrt(254 * effectiveMu * efficiency * S)
  const safeSkid = Math.max(0, skidMarkLengthM);
  const calculatedSpeedKmh = Math.round(Math.sqrt(254 * effectiveMu * efficiencyFactor * safeSkid) * 10) / 10;

  const excessSpeedKmh = Math.max(0, Math.round((calculatedSpeedKmh - speedLimitKmh) * 10) / 10);
  const isSpeedingExceeded = excessSpeedKmh > 0;

  // Reaction distance = (v / 3.6) * t_reaction
  const speedMs = calculatedSpeedKmh / 3.6;
  const reactionDistanceM = Math.round(speedMs * driverReactionTimeSec * 10) / 10;
  const brakingDistanceM = safeSkid;
  const totalStoppingDistanceM = Math.round((reactionDistanceM + brakingDistanceM) * 10) / 10;

  // Kinetic energy E = 0.5 * m * v^2 in kJ
  const kineticEnergyKj = Math.round((0.5 * vehicleMassKg * Math.pow(speedMs, 2)) / 1000);

  return {
    skidMarkLengthM: safeSkid,
    roadSurface,
    frictionMu: mu,
    slopeGradientPercent,
    effectiveMu: Math.round(effectiveMu * 100) / 100,
    brakingSystem,
    efficiencyFactor,
    calculatedSpeedKmh,
    speedLimitKmh,
    isSpeedingExceeded,
    excessSpeedKmh,
    driverReactionTimeSec,
    reactionDistanceM,
    brakingDistanceM,
    totalStoppingDistanceM,
    kineticEnergyKj
  };
}

/**
 * Technical possibility analysis for avoiding a collision with a pedestrian or obstacle
 * Analyzes whether total stopping distance S_stop <= distance at which obstacle was detected D_hazard
 */
export function analyzePedestrianAvoidance(
  hazardDistanceM: number,
  vehicleSpeedKmh: number,
  roadSurface: RoadSurfaceCondition = 'dry_asphalt',
  driverReactionTimeSec: number = 0.9,
  brakingSystem: VehicleBrakingSystem = 'abs_active'
): PedestrianAvoidanceResult {
  const profile = ROAD_SURFACE_PROFILES[roadSurface] || ROAD_SURFACE_PROFILES.dry_asphalt;
  const mu = profile.muBase;
  const efficiency = brakingSystem === 'abs_active' ? 1.05 : 0.95;

  const speedMs = vehicleSpeedKmh / 3.6;
  const reactionDistance = speedMs * driverReactionTimeSec;
  // Braking distance S_brake = v^2 / (254 * mu * eta)
  const brakingDistance = Math.pow(vehicleSpeedKmh, 2) / (254 * mu * efficiency);
  const stoppingDistance = Math.round((reactionDistance + brakingDistance) * 10) / 10;

  const margin = Math.round((hazardDistanceM - stoppingDistance) * 10) / 10;
  const driverHadTechnicalPossibility = margin >= 0;

  let impactSpeedKmh = 0;
  if (!driverHadTechnicalPossibility) {
    // If hazard was past the reaction distance, calculate residual speed at impact
    const remainingSkidDistance = hazardDistanceM - reactionDistance;
    if (remainingSkidDistance <= 0) {
      // Driver hadn't even finished reacting when impact occurred
      impactSpeedKmh = vehicleSpeedKmh;
    } else {
      // Impact speed v_impact = sqrt(v_0^2 - 254 * mu * eta * S_skid_to_impact)
      const dissipatedSpeedSq = 254 * mu * efficiency * remainingSkidDistance;
      const initialSpeedSq = Math.pow(vehicleSpeedKmh, 2);
      if (initialSpeedSq > dissipatedSpeedSq) {
        impactSpeedKmh = Math.round(Math.sqrt(initialSpeedSq - dissipatedSpeedSq) * 10) / 10;
      }
    }
  }

  const conclusionAz = driverHadTechnicalPossibility
    ? `Sürücünün toqquşmanın qarşısını almaq üçün TEXNİKİ İMKANI OLMUŞDUR. Dayanma məsafəsi (${stoppingDistance} m) maneə məsafəsindən (${hazardDistanceM} m) azdır.`
    : `Sürücünün toqquşmanın qarşısını almaq üçün TEXNİKİ İMKANI OLMAMIŞDIR. Tələb olunan dayanma məsafəsi (${stoppingDistance} m) mövcud görmə məsafəsini (${hazardDistanceM} m) aşır. Toqquşma anındakı qalıq sürət: ~${impactSpeedKmh} km/saat.`;

  const conclusionEn = driverHadTechnicalPossibility
    ? `Driver HAD technical possibility to avoid collision. Stopping distance (${stoppingDistance}m) is less than hazard distance (${hazardDistanceM}m).`
    : `Driver DID NOT have technical possibility to avoid collision. Stopping distance (${stoppingDistance}m) exceeds available distance (${hazardDistanceM}m). Residual impact speed: ~${impactSpeedKmh} km/h.`;

  return {
    hazardDistanceM,
    speedAtHazardKmh: vehicleSpeedKmh,
    stoppingDistanceM: stoppingDistance,
    driverHadTechnicalPossibility,
    marginDistanceM: margin,
    impactSpeedKmh,
    conclusionAz,
    conclusionEn
  };
}

/**
 * Classifies statutory legal liability under Azerbaijan Criminal Code (CM) vs
 * Code of Administrative Offences (IXM).
 */
export function evaluateLegalLiability(
  severity: InjurySeverity,
  sobriety: DriverSobriety = 'sober',
  excessSpeedKmh: number = 0,
  isHitAndRun: boolean = false
): LegalLiabilityResult {
  const isSober = sobriety === 'sober';

  // 1. Property damage only
  if (severity === 'none_property_only') {
    if (!isSober) {
      return {
        framework: 'İXM',
        article: 'İXM Maddə 333.1 & 327.1',
        titleAz: 'Sərxoş vəziyyətdə yol-nəqliyyat hadisəsi törətmə (maddi ziyan)',
        titleEn: 'DUI resulting in property damage traffic collision',
        descriptionAz: 'Yüngül və ya bədən xəsarəti olmadan nəqliyyat vasitələrinə zərər vurulması və sərxoşluq halı',
        penaltySummaryAz: '400 AZN cərimə və ya 6 aydan 1 ilədək sürücülük hüququnun məhdudlaşdırılması',
        fineAzn: 400,
        penaltyPoints: 5,
        prisonTermYearsMin: 0,
        prisonTermYearsMax: 0,
        licenseSuspensionYears: 1,
        isCriminalProsecution: false,
        jurisdictionAz: 'BDYP Təhqiqat Şöbəsi & Rayon Məhkəməsi'
      };
    }

    return {
      framework: 'İXM',
      article: 'İXM Maddə 327.1 (və ya 327.3)',
      titleAz: 'Yol hərəkəti qaydalarını pozaraq maddi ziyan vurma',
      titleEn: 'Traffic violation resulting in material property damage',
      descriptionAz: 'Yol hərəkəti qaydalarının pozulması nəticəsində nəqliyyat vasitələrinə və ya yol qurğularına maddi zərər vurulması',
      penaltySummaryAz: excessSpeedKmh > 40 ? '100 AZN cərimə və 3 cərimə balı' : '40 AZN cərimə və 2 cərimə balı',
      fineAzn: excessSpeedKmh > 40 ? 100 : 40,
      penaltyPoints: excessSpeedKmh > 40 ? 3 : 2,
      prisonTermYearsMin: 0,
      prisonTermYearsMax: 0,
      licenseSuspensionYears: 0,
      isCriminalProsecution: false,
      jurisdictionAz: 'BDYP Təhqiqat Şöbəsi'
    };
  }

  // 2. Light bodily harm (Yüngül bədən xəsarəti) -> IXM 327.3 / 327.8
  if (severity === 'light_harm') {
    return {
      framework: 'İXM',
      article: 'İXM Maddə 327.8',
      titleAz: 'Zərərçəkmiş şəxsin sağlamlığına yüngül bədən xəsarətinin yetirilməsi',
      titleEn: 'Infliction of minor bodily injury in a traffic collision',
      descriptionAz: 'Yol-nəqliyyat hadisəsi nəticəsində zərərçəkənə qısamüddətli sağlamlıq pozuntusuna səbəb olan yüngül xəsarət yetirilməsi',
      penaltySummaryAz: isSober 
        ? '200 AZN cərimə və ya 1 ildən 2 ilədək nəqliyyat vasitəsini idarə etmə hüququnun məhdudlaşdırılması'
        : '400 AZN cərimə və 2 il müddətinə sürücülük hüququndan məhrumetmə',
      fineAzn: isSober ? 200 : 400,
      penaltyPoints: 5,
      prisonTermYearsMin: 0,
      prisonTermYearsMax: 0,
      licenseSuspensionYears: isSober ? 1 : 2,
      isCriminalProsecution: false,
      jurisdictionAz: 'Rayon Məhkəməsi (İnzibati icraat)'
    };
  }

  // 3. Criminal offences under Azerbaijan Criminal Code (Cinayet Mecellesi)
  if (!isSober) {
    // Article 263-1: DUI causing bodily harm or death
    if (severity === 'moderate_harm') {
      return {
        framework: 'CM',
        article: 'CM Maddə 263-1.1',
        titleAz: 'Sərxoş halda idarəetmə nəticəsində az ağır bədən xəsarəti yetirmə',
        titleEn: 'DUI causing moderate bodily injury',
        descriptionAz: 'Alkoqol və ya narkotik sərxoşluğu vəziyyətində ehtiyatsızlıqdan zərərçəkmişə az ağır bədən xəsarətinin yetirilməsi',
        penaltySummaryAz: '2 ilədək müddətə azadlığın məhdudlaşdırılması və ya 3 ilədək müddətə azadlıqdan məhrumetmə (3 ilədək sürücülük hüququndan məhrumetmə ilə)',
        fineAzn: 0,
        penaltyPoints: 0,
        prisonTermYearsMin: 1,
        prisonTermYearsMax: 3,
        licenseSuspensionYears: 3,
        isCriminalProsecution: true,
        jurisdictionAz: 'Rayon Məhkəməsi (Cinayət Kollegiyası) & Prokurorluq'
      };
    }
    if (severity === 'severe_harm') {
      return {
        framework: 'CM',
        article: 'CM Maddə 263-1.2',
        titleAz: 'Sərxoş halda idarəetmə nəticəsində ağır bədən xəsarəti yetirmə',
        titleEn: 'DUI causing severe bodily injury',
        descriptionAz: 'Alkoqol/narkotik təsiri altında ehtiyatsızlıqdan sağlamlığa ağır zərər vurulması',
        penaltySummaryAz: '3 ildən 5 ilədək müddətə azadlıqdan məhrumetmə (3 ildən 5 ilədək sürücülük hüququndan məhrumetmə ilə)',
        fineAzn: 0,
        penaltyPoints: 0,
        prisonTermYearsMin: 3,
        prisonTermYearsMax: 5,
        licenseSuspensionYears: 5,
        isCriminalProsecution: true,
        jurisdictionAz: 'Rayon Məhkəməsi & Ağır Cinayətlər İstintaqı'
      };
    }
    if (severity === 'fatal_one') {
      return {
        framework: 'CM',
        article: 'CM Maddə 263-1.3',
        titleAz: 'Sərxoş vəziyyətdə zərərçəkmiş şəxsin ölümünə səbəb olma',
        titleEn: 'DUI resulting in death of victim',
        descriptionAz: 'Sərxoş halda yol hərəkəti qaydalarını pozma nəticəsində zərərçəkmiş şəxsin ehtiyatsızlıqdan ölümü',
        penaltySummaryAz: '5 ildən 8 ilədək müddətə azadlıqdan məhrumetmə (5 ilədək idarəetmə hüququndan məhrum edilməklə)',
        fineAzn: 0,
        penaltyPoints: 0,
        prisonTermYearsMin: 5,
        prisonTermYearsMax: 8,
        licenseSuspensionYears: 5,
        isCriminalProsecution: true,
        jurisdictionAz: 'Ağır Cinayətlər Məhkəməsi & Şəhər Prokurorluğu'
      };
    }
    // fatal_multiple
    return {
      framework: 'CM',
      article: 'CM Maddə 263-1.4',
      titleAz: 'Sərxoş vəziyyətdə iki və ya daha çox şəxsin ölümünə səbəb olma',
      titleEn: 'DUI resulting in death of two or more persons',
      descriptionAz: 'Sərxoş halda iki və ya daha çox şəxsin ehtiyatsızlıqdan həyatını itirməsinə səbəb olma',
      penaltySummaryAz: '8 ildən 13 ilədək müddətə azadlıqdan məhrumetmə (5 ilədək nəqliyyat vasitələrini idarə etmə hüququndan məhrum edilməklə)',
      fineAzn: 0,
      penaltyPoints: 0,
      prisonTermYearsMin: 8,
      prisonTermYearsMax: 13,
      licenseSuspensionYears: 5,
      isCriminalProsecution: true,
      jurisdictionAz: 'Ağır Cinayətlər Məhkəməsi & Respublika Baş Prokurorluğu'
    };
  }

  // Sober - Standard Criminal Code Article 263
  if (severity === 'moderate_harm') {
    return {
      framework: 'CM',
      article: isHitAndRun ? 'CM Maddə 263.1 & 264' : 'CM Maddə 263.1',
      titleAz: 'Ehtiyatsızlıqdan zərərçəkmiş şəxsin sağlamlığına az ağır zərər vurulması',
      titleEn: 'Negligently causing moderate bodily injury to victim',
      descriptionAz: 'Yol hərəkəti qaydalarını pozma nəticəsində zərərçəkmişin sağlamlığına az ağır xəsarət yetirilməsi' + (isHitAndRun ? ' və hadisə yerindən qaçma' : ''),
      penaltySummaryAz: isHitAndRun
        ? '3 ilədək müddətə azadlıqdan məhrumetmə və hadisə yerindən qaçmaya görə əlavə cəza'
        : '2 ilədək müddətə azadlığın məhdudlaşdırılması və ya 2 ilədək müddətə azadlıqdan məhrumetmə',
      fineAzn: 0,
      penaltyPoints: 0,
      prisonTermYearsMin: 0,
      prisonTermYearsMax: isHitAndRun ? 3 : 2,
      licenseSuspensionYears: 2,
      isCriminalProsecution: true,
      jurisdictionAz: 'Rayon Məhkəməsi & Polis İstintaq Şöbəsi'
    };
  }

  if (severity === 'severe_harm') {
    return {
      framework: 'CM',
      article: isHitAndRun ? 'CM Maddə 263.1-1 & 264' : 'CM Maddə 263.1-1',
      titleAz: 'Ehtiyatsızlıqdan zərərçəkmiş şəxsin sağlamlığına ağır zərər vurulması',
      titleEn: 'Negligently causing severe bodily injury to victim',
      descriptionAz: 'Yol hərəkəti qaydalarını pozma nəticəsində zərərçəkmişin həyatı üçün təhlükəli olan ağır xəsarət alması',
      penaltySummaryAz: '2 ildən 5 ilədək müddətə azadlıqdan məhrumetmə (3 ilədək sürücülük hüququndan məhrum edilməklə)',
      fineAzn: 0,
      penaltyPoints: 0,
      prisonTermYearsMin: 2,
      prisonTermYearsMax: 5,
      licenseSuspensionYears: 3,
      isCriminalProsecution: true,
      jurisdictionAz: 'Rayon Məhkəməsi (Cinayət Kollegiyası)'
    };
  }

  if (severity === 'fatal_one') {
    return {
      framework: 'CM',
      article: isHitAndRun ? 'CM Maddə 263.2 & 264' : 'CM Maddə 263.2',
      titleAz: 'Ehtiyatsızlıqdan zərərçəkmiş şəxsin ölümünə səbəb olma',
      titleEn: 'Negligently causing death of a victim',
      descriptionAz: 'Yol hərəkəti və ya nəqliyyat vasitələrinin istismarı qaydalarını pozma ehtiyatsızlıqdan zərərçəkmiş şəxsin ölümünə səbəb olduqda',
      penaltySummaryAz: isHitAndRun
        ? '3 ildən 6 ilədək müddətə azadlıqdan məhrumetmə və hadisə yerindən qaçmaya görə cəza'
        : '2 ildən 6 ilədək müddətə azadlıqdan məhrumetmə (3 ilədək sürücülük hüququndan məhrumetmə ilə)',
      fineAzn: 0,
      penaltyPoints: 0,
      prisonTermYearsMin: 2,
      prisonTermYearsMax: 6,
      licenseSuspensionYears: 3,
      isCriminalProsecution: true,
      jurisdictionAz: 'Ağır Cinayətlər Məhkəməsi & Şəhər/Rayon Prokurorluğu'
    };
  }

  // fatal_multiple
  return {
    framework: 'CM',
    article: isHitAndRun ? 'CM Maddə 263.3 & 264' : 'CM Maddə 263.3',
    titleAz: 'İki və ya daha çox şəxsin ölümünə səbəb olma',
    titleEn: 'Negligently causing death of two or more persons',
    descriptionAz: 'Yol hərəkəti qaydalarını pozma nəticəsində iki və ya daha çox şəxsin həyatını itirməsi',
    penaltySummaryAz: '5 ildən 10 ilədək müddətə azadlıqdan məhrumetmə (5 ilədək nəqliyyat vasitələrini idarə etmə hüququndan məhrum edilməklə)',
    fineAzn: 0,
    penaltyPoints: 0,
    prisonTermYearsMin: 5,
    prisonTermYearsMax: 10,
    licenseSuspensionYears: 5,
    isCriminalProsecution: true,
    jurisdictionAz: 'Ağır Cinayətlər Məhkəməsi & Baş Prokurorluq'
  };
}

/**
 * Calculates compulsory (ISB) and optional KASKO insurance settlements based on fault
 */
export function calculateInsuranceDamage(
  propertyDamageAzn: number,
  medicalBillsAzn: number,
  driverFaultPercent: number, // 0 to 100
  hasKasko: boolean = true,
  currency: Currency = 'AZN'
): InsuranceDamageResult {
  const rate = CURRENCY_RATES[currency] || 1.0;

  // Azerbaijan statutory compulsory insurance limits:
  // Property limit: 5,000 AZN per vehicle
  // Health/Life limit: 5,000 AZN per person, 50,000 AZN per accident
  const MAX_ISB_PROPERTY = 5000;
  const MAX_ISB_MEDICAL = 5000;

  // The innocent party's share of liability that the driver is responsible for:
  // Driver's liability to third parties = total third party damage * driverFaultPercent%
  const thirdPartyDamage = propertyDamageAzn;
  const driverThirdPartyLiability = (thirdPartyDamage * driverFaultPercent) / 100;

  // ISB Compulsory coverage payout towards third party
  const isbPropertyPayout = Math.min(driverThirdPartyLiability, MAX_ISB_PROPERTY);
  const isbMedicalPayout = Math.min((medicalBillsAzn * driverFaultPercent) / 100, MAX_ISB_MEDICAL);
  const isbTotalPayout = isbPropertyPayout + isbMedicalPayout;

  // Excess damage beyond ISB 5,000 limit must be paid out-of-pocket by driver
  const propertyExcess = Math.max(0, driverThirdPartyLiability - MAX_ISB_PROPERTY);
  const medicalExcess = Math.max(0, ((medicalBillsAzn * driverFaultPercent) / 100) - MAX_ISB_MEDICAL);
  const driverOutOfPocket = Math.round((propertyExcess + medicalExcess) * 100) / 100;

  // KASKO payout for driver's own vehicle repairs
  // If driver has KASKO, their own vehicle damage is covered even if driver was at fault
  const ownVehicleDamage = propertyDamageAzn * 0.8; // estimated own damage
  const kaskoPayout = hasKasko ? Math.round(ownVehicleDamage * 0.95) : 0; // 5% franchise

  return {
    propertyDamageAzn,
    medicalBillsAzn,
    driverFaultPercent,
    isbCompulsoryCoverAzn: MAX_ISB_PROPERTY,
    isbPropertyPayoutAzn: Math.round(isbPropertyPayout * 100) / 100,
    isbMedicalPayoutAzn: Math.round(isbMedicalPayout * 100) / 100,
    driverOutOfPocketAzn: driverOutOfPocket,
    kaskoCoverAzn: kaskoPayout,
    convertedAmounts: {
      currency,
      propertyDamage: Math.round(propertyDamageAzn * rate),
      isbTotal: Math.round(isbTotalPayout * rate),
      outOfPocket: Math.round(driverOutOfPocket * rate),
      kaskoPayout: Math.round(kaskoPayout * rate)
    }
  };
}

/**
 * Generates an official Ministry of Justice Forensic Centre conclusion report
 */
export function generateForensicReport(params: {
  vehiclePlate: string;
  vehicleModel: string;
  incidentLocation: string;
  skidMarkLengthM: number;
  roadSurface: RoadSurfaceCondition;
  speedLimitKmh: number;
  hazardDistanceM: number;
  injurySeverity: InjurySeverity;
  driverSobriety: DriverSobriety;
  isHitAndRun?: boolean;
}): ForensicReportData {
  const speedData = calculateSpeedFromSkid(
    params.skidMarkLengthM,
    params.roadSurface,
    0,
    'abs_active',
    params.speedLimitKmh
  );

  const avoidance = analyzePedestrianAvoidance(
    params.hazardDistanceM,
    speedData.calculatedSpeedKmh,
    params.roadSurface
  );

  const legal = evaluateLegalLiability(
    params.injurySeverity,
    params.driverSobriety,
    speedData.excessSpeedKmh,
    params.isHitAndRun
  );

  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  const reportNumber = `MEM-YNH-2026-${randomDigits}`;
  const now = new Date();
  const dateStr = now.toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // Generate deterministic-looking verification checksums
  const seed = `${reportNumber}-${params.vehiclePlate}-${speedData.calculatedSpeedKmh}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const digitalQrChecksum = `QR-MEM-YNH-${Math.abs(hash).toString(16).toUpperCase()}`;
  const simaSignatureHash = `SIMA-AZ-EXPERT-${Math.abs((hash ^ 0xabcdef)).toString(16).toUpperCase()}`;

  return {
    reportNumber,
    incidentDate: dateStr,
    incidentLocation: params.incidentLocation,
    vehiclePlate: params.vehiclePlate,
    vehicleModel: params.vehicleModel,
    vehicleMassKg: 1500,
    skidMarkLengthM: params.skidMarkLengthM,
    roadSurface: params.roadSurface,
    roadFrictionMu: speedData.frictionMu,
    calculatedSpeedKmh: speedData.calculatedSpeedKmh,
    speedLimitKmh: params.speedLimitKmh,
    isSpeeding: speedData.isSpeedingExceeded,
    hazardDistanceM: params.hazardDistanceM,
    hadTechnicalPossibility: avoidance.driverHadTechnicalPossibility,
    injurySeverity: params.injurySeverity,
    driverSobriety: params.driverSobriety,
    legalArticle: legal.article,
    isCriminal: legal.isCriminalProsecution,
    examinerName: 'Ekspert Rauf Məmmədov (Avtotexniki ekspert, v.i.e.)',
    institutionAz: 'Azərbaycan Respublikası Ədliyyə Nazirliyi Məhkəmə Ekspertizası Mərkəzi',
    digitalQrChecksum,
    simaSignatureHash
  };
}

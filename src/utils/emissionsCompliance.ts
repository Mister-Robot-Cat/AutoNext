import { Vehicle } from '../types/vehicle';
import {
  EngineEmissionType,
  CatalystSystemStatus,
  EuroStandardClass,
  EMISSION_NORM_RULES,
  OBD_EMISSION_FAULT_CODES,
  ECO_DIAGNOSTIC_CENTERS,
  SAMPLE_ECO_CERTIFICATES,
  EcoComplianceCertificate,
} from '../data/mockEmissionsData';

export interface GasAnalyzerAuditInput {
  engineType: EngineEmissionType;
  coIdlePercent: number;
  coHighRpmPercent: number;
  chIdlePpm: number;
  lambdaRatio: number;
  smokeKValue: number; // m^-1 for diesel
}

export interface GasAnalyzerAuditResult {
  engineType: EngineEmissionType;
  isCompliant: boolean;
  isZeroEmissionEv: boolean;
  coIdleCompliant: boolean;
  coHighRpmCompliant: boolean;
  chIdleCompliant: boolean;
  lambdaCompliant: boolean;
  smokeCompliant: boolean;
  estimatedOpacityPercent: number;
  individualFineAzn: number; // İXM Article 342.5 (50 AZN)
  earlyPaymentFineAzn: number; // 50% 30-day AsanPay discount (25 AZN)
  fleetOfficialFineAzn: number; // İXM Article 342.6 / 348 (150 AZN)
  ecoScore: number;
  violationsAz: string[];
  recommendationsAz: string[];
  legalCitation: string;
}

export interface CatalystIntegrityInput {
  engineType: EngineEmissionType;
  catalystStatus: CatalystSystemStatus;
  backpressureKpa: number;
  activeObdCodes: string[];
  vehiclePriceAzn?: number;
}

export interface CatalystIntegrityResult {
  catalystStatus: CatalystSystemStatus;
  isSystemHealthy: boolean;
  passesInspection: boolean;
  backpressureStatus: 'normal' | 'elevated' | 'critical_clogged';
  resaleValuePenaltyAzn: number;
  estimatedRepairCostAzn: number;
  healthScore: number;
  statusSummaryAz: string;
  detailedFindingsAz: string[];
}

export interface CarbonFootprintInput {
  fuelType: 'petrol' | 'diesel' | 'hybrid' | 'plug-in-hybrid' | 'electric' | 'lpg';
  fuelConsumptionLPer100Km: number;
  annualMileageKm: number;
  productionYear: number;
}

export interface CarbonFootprintResult {
  co2GramsPerKm: number;
  annualCo2Kg: number;
  annualCo2Tons: number;
  treesRequiredToOffset: number;
  euroClass: EuroStandardClass;
  ecoBadge: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E';
  meetsCabinetDecision92ImportNorm: boolean;
  comparisonVsFleetAvgPercent: number; // vs 145 g/km average
}

export function inferEngineEmissionType(vehicle?: Vehicle | null): EngineEmissionType {
  if (!vehicle) return 'petrol_catalyst';
  if (vehicle.fuelType === 'electric') return 'electric';
  if (vehicle.fuelType === 'diesel') {
    return vehicle.year >= 2008 ? 'diesel_turbo_dpf' : 'diesel_standard';
  }
  if (vehicle.year < 2000) return 'petrol_uncatalyzed';
  return 'petrol_catalyst';
}

export function inferEuroStandardClass(year: number, fuelType?: string): EuroStandardClass {
  if (fuelType === 'electric') return 'Zero-Emission EV';
  if (year >= 2016) return 'Euro-6';
  if (year >= 2010) return 'Euro-5';
  if (year >= 2005) return 'Euro-4';
  if (year >= 2000) return 'Euro-3';
  return 'Euro-0/1/2';
}

export function auditGasAnalyzerTelemetry(input: GasAnalyzerAuditInput): GasAnalyzerAuditResult {
  const rule = EMISSION_NORM_RULES[input.engineType] || EMISSION_NORM_RULES.petrol_catalyst;

  if (input.engineType === 'electric') {
    return {
      engineType: 'electric',
      isCompliant: true,
      isZeroEmissionEv: true,
      coIdleCompliant: true,
      coHighRpmCompliant: true,
      chIdleCompliant: true,
      lambdaCompliant: true,
      smokeCompliant: true,
      estimatedOpacityPercent: 0,
      individualFineAzn: 0,
      earlyPaymentFineAzn: 0,
      fleetOfficialFineAzn: 0,
      ecoScore: 100,
      violationsAz: [],
      recommendationsAz: [
        'Tam elektrik mühərrikli nəqliyyat vasitəsi — işlənmiş qaz tullantısı 0.00% təşkil edir.',
        'BDYP & ETSN "Təmiz Hava" reydlərindən və qazanalizator yoxlamasından tam azaddır.',
      ],
      legalCitation: rule.legalBasis,
    };
  }

  const isDiesel =
    input.engineType === 'diesel_turbo_dpf' || input.engineType === 'diesel_standard';

  const violationsAz: string[] = [];
  const recommendationsAz: string[] = [];

  let coIdleCompliant = true;
  let coHighRpmCompliant = true;
  let chIdleCompliant = true;
  let lambdaCompliant = true;
  let smokeCompliant = true;

  const coIdle = Math.max(0, Number(input.coIdlePercent.toFixed(2)));
  const coHigh = Math.max(0, Number(input.coHighRpmPercent.toFixed(2)));
  const chIdle = Math.max(0, Math.round(input.chIdlePpm));
  const lambda = Number(input.lambdaRatio.toFixed(2));
  const smokeK = Math.max(0, Number(input.smokeKValue.toFixed(2)));

  if (!isDiesel) {
    coIdleCompliant = coIdle <= rule.maxCoIdlePercent;
    coHighRpmCompliant = coHigh <= rule.maxCoHighRpmPercent;
    chIdleCompliant = chIdle <= rule.maxChIdlePpm;
    lambdaCompliant = lambda >= rule.minLambda && lambda <= rule.maxLambda;

    if (!coIdleCompliant) {
      violationsAz.push(
        `Sərbəst gedişdə (800 dövr/dəq) dəm qazı CO miqdarı (${coIdle}%) YHQ Əlavə 1 normativini (≤${rule.maxCoIdlePercent}%) aşır.`
      );
      recommendationsAz.push(
        'Katalizatorun işləkliyini, hava filtrini və birinci oksigen (Lambda O2) sensorunu yoxlayın.'
      );
    }

    if (!coHighRpmCompliant) {
      violationsAz.push(
        `Yüksək dövrədə (2500 dövr/dəq) dəm qazı CO miqdarı (${coHigh}%) YHQ Əlavə 1 normativini (≤${rule.maxCoHighRpmPercent}%) aşır.`
      );
      recommendationsAz.push(
        'Yüksək dövrədə CO artımı katalizator neytrallaşdırıcısının (TWC) sıradan çıxmasını və ya kəsilməsini göstərir.'
      );
    }

    if (!chIdleCompliant) {
      violationsAz.push(
        `Yanmamış karbohidrogenlərin (CH) miqdarı (${chIdle} ppm) normativ həddi (≤${rule.maxChIdlePpm} ppm) aşır.`
      );
      recommendationsAz.push(
        'Alovlanma şamlarını (sveça), babinləri və forsunkaların püskürtmə balansını diaqnostika edin.'
      );
    }

    if (!lambdaCompliant) {
      violationsAz.push(
        `Hava artıqlıq əmsalı Lambda (λ = ${lambda}) normativ diapazondan (${rule.minLambda}–${rule.maxLambda}) kənardır.`
      );
      recommendationsAz.push(
        lambda < rule.minLambda
          ? 'Yanacaq qarışığı həddindən artıq zəngindir (Rich Mixture) — MAF sensoru və forsunka sızmasını yoxlayın.'
          : 'Yanacaq qarışığı kasıbdır (Lean Mixture) — kollektorda hava sızması və ya eqzos borusunda deşik ola bilər.'
      );
    }
  } else {
    smokeCompliant = smokeK <= rule.maxSmokeKValue;
    if (!smokeCompliant) {
      violationsAz.push(
        `Dizel mühərrikinin tüstülülük (işıq udma) əmsalı (k = ${smokeK} m⁻¹) YHQ Əlavə 1 Bölmə VI normativini (≤${rule.maxSmokeKValue} m⁻¹) aşır.`
      );
      recommendationsAz.push(
        input.engineType === 'diesel_turbo_dpf'
          ? 'DPF qurum filtrini stenddə hidro-kimyəvi üsulla yudurdun, EGR klapanını və dizel forsunkalarını yoxlayın.'
          : 'Dizel yanacaq nasosunu (TNVD), forsunkaları və turbin borularında hava sızmasını yoxlayın.'
      );
    }
  }

  const isCompliant =
    coIdleCompliant &&
    coHighRpmCompliant &&
    chIdleCompliant &&
    lambdaCompliant &&
    smokeCompliant;

  if (isCompliant) {
    recommendationsAz.push(
      'İxrac qazlarının zəhərlilik və tüstülülük göstəriciləri YHQ Əlavə 1 Bölmə VI normativlərinə tam uyğundur.'
    );
  }

  // Estimate percentage opacity from Beer-Lambert correlation (~18% per 1.0 m^-1 up to 100%)
  const estimatedOpacityPercent = isDiesel
    ? Math.min(100, Math.round(smokeK * 18))
    : 0;

  let ecoScore = 100;
  if (!coIdleCompliant) ecoScore -= 28;
  if (!coHighRpmCompliant) ecoScore -= 30;
  if (!chIdleCompliant) ecoScore -= 22;
  if (!lambdaCompliant) ecoScore -= 15;
  if (!smokeCompliant) ecoScore -= 45;
  ecoScore = Math.max(10, ecoScore);

  const individualFineAzn = isCompliant ? 0 : 50; // İXM Article 342.5
  const earlyPaymentFineAzn = isCompliant ? 0 : 25; // 50% discount within 30 days
  const fleetOfficialFineAzn = isCompliant ? 0 : 150; // İXM Article 342.6 / 348

  return {
    engineType: input.engineType,
    isCompliant,
    isZeroEmissionEv: false,
    coIdleCompliant,
    coHighRpmCompliant,
    chIdleCompliant,
    lambdaCompliant,
    smokeCompliant,
    estimatedOpacityPercent,
    individualFineAzn,
    earlyPaymentFineAzn,
    fleetOfficialFineAzn,
    ecoScore,
    violationsAz,
    recommendationsAz,
    legalCitation: 'AR İXM Maddə 342.5 (50 ₼) & YHQ Əlavə 1 Bölmə VI',
  };
}

export function evaluateCatalystAndDpfIntegrity(
  input: CatalystIntegrityInput
): CatalystIntegrityResult {
  if (input.engineType === 'electric') {
    return {
      catalystStatus: 'oem_intact',
      isSystemHealthy: true,
      passesInspection: true,
      backpressureStatus: 'normal',
      resaleValuePenaltyAzn: 0,
      estimatedRepairCostAzn: 0,
      healthScore: 100,
      statusSummaryAz: 'Tam Elektrik (EV) — İxrac qazı neytrallaşdırıcısı tələb olunmur (Sıfır Emissiya).',
      detailedFindingsAz: [
        'Avtomobil daxili yanma mühərrikinə malik olmadığı üçün katalizator və ya DPF sistemi yoxdur.',
      ],
    };
  }

  const baseVehiclePrice = input.vehiclePriceAzn || 30000;
  const detailedFindingsAz: string[] = [];

  let backpressureStatus: 'normal' | 'elevated' | 'critical_clogged' = 'normal';
  if (input.backpressureKpa > 25) {
    backpressureStatus = 'critical_clogged';
    detailedFindingsAz.push(
      `Eqzos əks-təzyiqi kritik həddədir (${input.backpressureKpa} kPa > 25 kPa) — katalizator və ya DPF şanları tutulub, mühərrik boğulur.`
    );
  } else if (input.backpressureKpa > 12) {
    backpressureStatus = 'elevated';
    detailedFindingsAz.push(
      `Eqzos əks-təzyiqi normadan yüksəkdir (${input.backpressureKpa} kPa) — profilaktik yuma və ya endoskop baxışı tövsiyə edilir.`
    );
  } else {
    detailedFindingsAz.push(
      `Eqzos kollektorunda əks-təzyiq ideal normadadır (${input.backpressureKpa} kPa ≤ 12 kPa).`
    );
  }

  const matchedFaults = OBD_EMISSION_FAULT_CODES.filter((f) =>
    input.activeObdCodes.includes(f.code)
  );
  const obdFixCost = matchedFaults.reduce((sum, f) => sum + f.estimatedFixCostAzn, 0);

  matchedFaults.forEach((f) => {
    detailedFindingsAz.push(`OBD-II Xətası [${f.code}]: ${f.titleAz}`);
  });

  let resaleValuePenaltyAzn = 0;
  let baseCatalystRepairAzn = 0;
  let healthScore = 95;
  let statusSummaryAz = '';

  if (input.catalystStatus === 'oem_intact') {
    statusSummaryAz = 'Zavod Orijinal (OEM) Katalizator / DPF üzərindədir və tam işləkdir.';
    detailedFindingsAz.push(
      'Zavod istehsalı platin-rodium-palladium (Pt/Pd/Rh) şanlı orijinal neytrallaşdırıcı öz yerindədir — avtomobilin bazar dəyəri tam qorunur.'
    );
  } else if (input.catalystStatus === 'euro4_universal') {
    healthScore = 82;
    resaleValuePenaltyAzn = Math.round(Math.min(600, baseVehiclePrice * 0.015));
    statusSummaryAz = 'Sertifikatlı Euro-4/5 Əvəzedici Katalizator quraşdırılıb (Normativə uyğundur).';
    detailedFindingsAz.push(
      'Zavod katalizatoru əvəzinə sertifikatlı Euro-4/5 metal və ya keramik blok quraşdırılıb — BDYP qazanalizator testindən uğurla keçir.'
    );
  } else if (input.catalystStatus === 'clogged_degraded') {
    healthScore = 45;
    baseCatalystRepairAzn =
      input.engineType === 'diesel_turbo_dpf' || input.engineType === 'diesel_standard'
        ? 180
        : 380;
    resaleValuePenaltyAzn = Math.round(Math.min(1100, baseVehiclePrice * 0.03));
    statusSummaryAz = 'Katalizator / DPF tutulub və ya kimyəvi resursu tükənib — təmir tələb olunur.';
    detailedFindingsAz.push(
      'Neytrallaşdırıcı blok öz funksiyasını tam yerinə yetirmir, yanacaq sərfiyyatı artır və BDYP "Təmiz Hava" reydində cərimə (50 ₼) riski yaradır.'
    );
  } else {
    // removed_bypass
    healthScore = 18;
    baseCatalystRepairAzn =
      input.engineType === 'diesel_turbo_dpf' || input.engineType === 'diesel_standard'
        ? 550
        : 480;
    resaleValuePenaltyAzn = Math.round(Math.max(850, Math.min(2200, baseVehiclePrice * 0.045)));
    statusSummaryAz =
      'Katalizator / DPF kəsilib çıxarılıb (Plameqasitel / Aldadıcı Şayba) — İstismarı Qadağandır!';
    detailedFindingsAz.push(
      'Katalizator kəsildiyi üçün avtomobil zəhərli dəm qazı (CO) və kanserogen karbohidrogen (CH) yayır, DYP Texniki Baxışdan keçmir və bazar qiyməti 850–2,200 ₼ ucuzlaşır.'
    );
  }

  if (backpressureStatus === 'critical_clogged') {
    healthScore = Math.min(healthScore, 35);
    baseCatalystRepairAzn = Math.max(baseCatalystRepairAzn, 180);
  } else if (backpressureStatus === 'elevated') {
    healthScore = Math.max(20, healthScore - 12);
  }

  if (matchedFaults.length > 0) {
    healthScore = Math.max(12, healthScore - matchedFaults.length * 15);
  }

  const estimatedRepairCostAzn = Math.max(baseCatalystRepairAzn, obdFixCost);
  const passesInspection =
    (input.catalystStatus === 'oem_intact' || input.catalystStatus === 'euro4_universal') &&
    backpressureStatus !== 'critical_clogged' &&
    !matchedFaults.some((f) => f.failsTemizHavaRaid);

  return {
    catalystStatus: input.catalystStatus,
    isSystemHealthy: passesInspection && backpressureStatus === 'normal',
    passesInspection,
    backpressureStatus,
    resaleValuePenaltyAzn,
    estimatedRepairCostAzn,
    healthScore,
    statusSummaryAz,
    detailedFindingsAz,
  };
}

export function calculateAnnualCarbonFootprint(
  input: CarbonFootprintInput
): CarbonFootprintResult {
  const euroClass = inferEuroStandardClass(input.productionYear, input.fuelType);

  if (input.fuelType === 'electric' || input.fuelConsumptionLPer100Km <= 0) {
    return {
      co2GramsPerKm: 0,
      annualCo2Kg: 0,
      annualCo2Tons: 0,
      treesRequiredToOffset: 0,
      euroClass: 'Zero-Emission EV',
      ecoBadge: 'A+',
      meetsCabinetDecision92ImportNorm: true,
      comparisonVsFleetAvgPercent: -100,
    };
  }

  // Standard CO2 kg per liter of fuel combusted:
  // Petrol: 2.31 kg/L, Diesel: 2.68 kg/L, LPG: 1.51 kg/L
  const kgCo2PerLiter =
    input.fuelType === 'diesel'
      ? 2.68
      : input.fuelType === 'lpg'
      ? 1.51
      : 2.31;

  const co2GramsPerKm = Math.round(input.fuelConsumptionLPer100Km * kgCo2PerLiter * 10);
  const annualCo2Kg = Math.round((co2GramsPerKm * Math.max(0, input.annualMileageKm)) / 1000);
  const annualCo2Tons = Number((annualCo2Kg / 1000).toFixed(2));

  // 1 mature tree absorbs ~22 kg of CO2 per year
  const treesRequiredToOffset = Math.ceil(annualCo2Kg / 22);

  let ecoBadge: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' = 'C';
  if (co2GramsPerKm <= 95) ecoBadge = 'A';
  else if (co2GramsPerKm <= 130) ecoBadge = 'B';
  else if (co2GramsPerKm <= 165) ecoBadge = 'C';
  else if (co2GramsPerKm <= 205) ecoBadge = 'D';
  else ecoBadge = 'E';

  const meetsCabinetDecision92ImportNorm =
    euroClass === 'Euro-4' ||
    euroClass === 'Euro-5' ||
    euroClass === 'Euro-6' ||
    euroClass === 'Zero-Emission EV';

  const comparisonVsFleetAvgPercent = Math.round(((co2GramsPerKm - 145) / 145) * 100);

  return {
    co2GramsPerKm,
    annualCo2Kg,
    annualCo2Tons,
    treesRequiredToOffset,
    euroClass,
    ecoBadge,
    meetsCabinetDecision92ImportNorm,
    comparisonVsFleetAvgPercent,
  };
}

export function generateEcoComplianceCertificate(params: {
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
  centerId?: string;
}): EcoComplianceCertificate {
  const gasAudit = auditGasAnalyzerTelemetry({
    engineType: params.engineType,
    coIdlePercent: params.measuredCoIdlePercent,
    coHighRpmPercent: params.measuredCoHighRpmPercent,
    chIdlePpm: params.measuredChPpm,
    lambdaRatio: params.measuredLambda,
    smokeKValue: params.measuredSmokeK,
  });

  const cleanPlate = (params.plateNumber || '99-AZ-202').trim().toUpperCase();
  const cleanVin = (params.vin || 'JTDKB20U903491823').trim().toUpperCase();
  const center =
    ECO_DIAGNOSTIC_CENTERS.find((c) => c.id === params.centerId) || ECO_DIAGNOSTIC_CENTERS[0];

  const seed = cleanPlate
    .split('')
    .reduce((acc, ch, idx) => acc + ch.charCodeAt(0) * (idx + 17), 10000);
  const serial = String(10000 + (seed % 89999));

  const isCompliant =
    gasAudit.isCompliant && params.catalystStatus !== 'removed_bypass';

  return {
    certificateNumber: `BDYP-EKO-2026-${serial}`,
    plateNumber: cleanPlate,
    vin: cleanVin,
    vehicleTitle: params.vehicleTitle || 'Avtomobil',
    engineType: params.engineType,
    euroClass: params.euroClass,
    catalystStatus: params.catalystStatus,
    measuredCoIdlePercent: params.measuredCoIdlePercent,
    measuredCoHighRpmPercent: params.measuredCoHighRpmPercent,
    measuredChPpm: params.measuredChPpm,
    measuredLambda: params.measuredLambda,
    measuredSmokeK: params.measuredSmokeK,
    ecoScore: gasAudit.ecoScore,
    isCompliant,
    issuedAt: '2026-10-17',
    expiresAt: '2027-10-17',
    inspectingCenter: center.name,
    qrSecurityHash: `AZ-ETSN-BDYP-${cleanPlate.replace(/[^A-Z0-9]/g, '')}-${isCompliant ? 'OK' : 'FAIL'}`,
  };
}

export function lookupEcoCertificate(query: string): EcoComplianceCertificate | null {
  const q = query.trim().toUpperCase();
  if (!q) return null;
  return (
    SAMPLE_ECO_CERTIFICATES.find(
      (c) =>
        c.certificateNumber.toUpperCase() === q ||
        c.plateNumber.toUpperCase() === q ||
        c.vin.toUpperCase() === q
    ) || null
  );
}

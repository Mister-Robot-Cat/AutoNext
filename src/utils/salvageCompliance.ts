import { Currency } from '../types/vehicle';
import { CURRENCY_RATES, formatPrice } from './i18n';
import {
  SalvageCategoryKey,
  AirbagDeploymentStatus,
  ChassisDatumPoint,
  UltrasoundWeldJoint,
  SALVAGE_CATEGORIES,
  MOCK_ACTIVE_SALVAGE_CERTIFICATES,
  MockSalvageCertificate
} from '../data/mockSalvageData';

export interface TotalLossEvaluationInput {
  preAccidentValueAzn: number;
  estimatedRepairCostAzn: number;
  salvageScrapValueAzn: number;
  deductibleAzn: number;
  ownerRetainsWreck: boolean;
  currency: Currency;
}

export interface TotalLossEvaluationResult {
  damageRatioPct: number;
  isTotalLoss: boolean;
  statutoryThresholdPct: number;
  thresholdDifferencePct: number;
  insurerPayoutAzn: number;
  ownerTotalNetAzn: number;
  salvageScrapValueAzn: number;
  deductibleAzn: number;
  convertedInsurerPayout: number;
  convertedOwnerNet: number;
  formattedInsurerPayout: string;
  formattedOwnerNet: string;
  formattedSalvageValue: string;
  formattedDeductible: string;
  legalConclusionAz: string;
}

export interface ChassisEvaluationResult {
  isChassisCompliant: boolean;
  maxDeviationMm: number;
  passedCount: number;
  failedCount: number;
  failingPointIds: string[];
  maxAllowedToleranceMm: number;
}

export interface WeldEvaluationResult {
  allWeldsCompliant: boolean;
  criticalWeldsCompliant: boolean;
  passedCount: number;
  failedCount: number;
  defectiveJointIds: string[];
}

export interface OverallRoadworthinessVerdict {
  isRoadPermitted: boolean;
  statusCode: 'APPROVED' | 'CONDITIONAL_PASS' | 'PROHIBITED';
  titleAz: string;
  summaryAz: string;
  actionRequiredAz: string;
}

export interface ImportLandedCostResult {
  hammerPriceAzn: number;
  shippingAndCustomsAzn: number;
  estimatedRepairCostAzn: number;
  totalInvestmentAzn: number;
  preAccidentMarketValueAzn: number;
  estimatedNetProfitAzn: number;
  roiPercentage: number;
  formattedTotalInvestment: string;
  formattedProfit: string;
}

/**
 * Evaluates whether vehicle damage exceeds the statutory 70% constructive total loss threshold
 * under Azerbaijan AMB and Compulsory Insurance Bureau (İSB) regulations.
 */
export function calculateTotalLossPayout(input: TotalLossEvaluationInput): TotalLossEvaluationResult {
  const safePreAccident = Math.max(1000, input.preAccidentValueAzn);
  const safeRepairCost = Math.max(0, input.estimatedRepairCostAzn);
  const safeScrap = Math.max(0, input.salvageScrapValueAzn);
  const safeDeductible = Math.max(0, input.deductibleAzn);

  const damageRatioPct = Number(((safeRepairCost / safePreAccident) * 100).toFixed(1));
  const statutoryThresholdPct = 70.0;
  const isTotalLoss = damageRatioPct >= statutoryThresholdPct;
  const thresholdDifferencePct = Number((damageRatioPct - statutoryThresholdPct).toFixed(1));

  let insurerPayoutAzn = 0;
  let ownerTotalNetAzn = 0;

  if (isTotalLoss) {
    if (input.ownerRetainsWreck) {
      // Owner retains the physical salvage wreck
      insurerPayoutAzn = Math.max(0, safePreAccident - safeDeductible - safeScrap);
      ownerTotalNetAzn = insurerPayoutAzn + safeScrap;
    } else {
      // Insurer transfers wreck to salvage auction
      insurerPayoutAzn = Math.max(0, safePreAccident - safeDeductible);
      ownerTotalNetAzn = insurerPayoutAzn;
    }
  } else {
    // Normal repairable insurance compensation (indemnity)
    insurerPayoutAzn = Math.max(0, safeRepairCost - safeDeductible);
    ownerTotalNetAzn = insurerPayoutAzn;
  }

  const rate = CURRENCY_RATES[input.currency] || 1;
  const convertedInsurerPayout = Math.round(insurerPayoutAzn * rate);
  const convertedOwnerNet = Math.round(ownerTotalNetAzn * rate);

  let legalConclusionAz = '';
  if (isTotalLoss) {
    legalConclusionAz = input.ownerRetainsWreck
      ? `Zərər nisbəti ${damageRatioPct}% təşkil edir (≥70% həddi aşıldı). Nəqliyyat vasitəsi AMB qaydalarına əsasən «Konstruktiv Məhv» elan olunur. Sahibkar qalıq hissələri saxladığı üçün sığortaçı bazar dəyərindən qalıq dəyər (${safeScrap} AZN) və françizanı çıxmaqla ödəniş edir.`
      : `Zərər nisbəti ${damageRatioPct}% təşkil edir (≥70% həddi aşıldı). Nəqliyyat vasitəsi «Konstruktiv Məhv» elan olunur. Qalıq hissələr sığortaçıya təhvil verilir və sahibkara françiza çıxılmaqla tam bazar dəyəri ödənilir.`;
  } else {
    legalConclusionAz = `Zərər nisbəti ${damageRatioPct}% təşkil edir (<70% həddi). Avtomobil konstruktiv bərpa oluna biləndir. Sığorta şirkəti təmir smetası üzrə françiza çıxılmaqla birbaşa təmir xərcini qarşılayır.`;
  }

  return {
    damageRatioPct,
    isTotalLoss,
    statutoryThresholdPct,
    thresholdDifferencePct,
    insurerPayoutAzn,
    ownerTotalNetAzn,
    salvageScrapValueAzn: safeScrap,
    deductibleAzn: safeDeductible,
    convertedInsurerPayout,
    convertedOwnerNet,
    formattedInsurerPayout: formatPrice(convertedInsurerPayout, input.currency),
    formattedOwnerNet: formatPrice(convertedOwnerNet, input.currency),
    formattedSalvageValue: formatPrice(Math.round(safeScrap * rate), input.currency),
    formattedDeductible: formatPrice(Math.round(safeDeductible * rate), input.currency),
    legalConclusionAz
  };
}

/**
 * Validates 3D laser unibody chassis reference points against factory datum tolerance (±2.0 mm).
 */
export function evaluateChassisDatumPoints(points: ChassisDatumPoint[]): ChassisEvaluationResult {
  const maxAllowedToleranceMm = 2.0;
  let maxDeviationMm = 0;
  let passedCount = 0;
  let failedCount = 0;
  const failingPointIds: string[] = [];

  for (const pt of points) {
    const absDev = Math.abs(pt.measuredDeviationMm);
    if (absDev > maxDeviationMm) {
      maxDeviationMm = absDev;
    }

    if (absDev <= pt.maxToleranceMm) {
      passedCount++;
    } else {
      failedCount++;
      failingPointIds.push(pt.id);
    }
  }

  return {
    isChassisCompliant: failedCount === 0,
    maxDeviationMm: Number(maxDeviationMm.toFixed(2)),
    passedCount,
    failedCount,
    failingPointIds,
    maxAllowedToleranceMm
  };
}

/**
 * Evaluates ultrasound phased-array weld seam penetration and porosity.
 */
export function evaluateUltrasoundWelds(welds: UltrasoundWeldJoint[]): WeldEvaluationResult {
  let passedCount = 0;
  let failedCount = 0;
  let criticalWeldsCompliant = true;
  const defectiveJointIds: string[] = [];

  for (const joint of welds) {
    const isPenetrationSufficient = joint.penetrationDepthPct >= joint.minPenetrationRequiredPct;
    const isCleanNoPorosity = !joint.porosityDetected;

    if (isPenetrationSufficient && isCleanNoPorosity) {
      passedCount++;
    } else {
      failedCount++;
      defectiveJointIds.push(joint.id);
      if (joint.structuralCritical) {
        criticalWeldsCompliant = false;
      }
    }
  }

  return {
    allWeldsCompliant: failedCount === 0,
    criticalWeldsCompliant,
    passedCount,
    failedCount,
    defectiveJointIds
  };
}

/**
 * Overall roadworthiness verdict for a restored/salvage vehicle.
 */
export function evaluateOverallRoadworthiness(params: {
  categoryKey: SalvageCategoryKey;
  isTotalLoss: boolean;
  isChassisCompliant: boolean;
  allWeldsCompliant: boolean;
  airbagStatus: AirbagDeploymentStatus;
}): OverallRoadworthinessVerdict {
  const category = SALVAGE_CATEGORIES[params.categoryKey];

  if (category.key === 'STRUCTURAL_TOTAL_LOSS') {
    return {
      isRoadPermitted: false,
      statusCode: 'PROHIBITED',
      titleAz: 'Yol Hərəkətinə Buraxılış Qəti Qadağandır (Kateqoriya A)',
      summaryAz: 'Avtomobilin daşıyıcı karkası aşma və ya şiddətli burulma səbəbindən dağılıb. Bərpa edilməsi yol təhlükəsizliyi haqqında qanunvericiliklə qadağandır.',
      actionRequiredAz: 'Nəqliyyat vasitəsi BDYP reyestrindən çıxarılmalı və Dövlət Utilizasiya Proqramına («Təmiz Şəhər» ASC) təhvil verilməlidir.'
    };
  }

  if (category.key === 'FLOOD_SUBMERSION') {
    return {
      isRoadPermitted: false,
      statusCode: 'PROHIBITED',
      titleAz: 'Su Batması Səbəbilə Yol İstismarı Məhdudlaşdırılıb (Kateqoriya D)',
      summaryAz: 'Avtomobil naqil dəstələrində və ABS/ESP/SRS təhlükəsizlik bloklarında daxili korroziya riski daşıyır.',
      actionRequiredAz: 'Bütün elektron nəzarət blokları (ECU/BCM) və naqillər akkreditə olunmuş mərkəzdə tam yenilənməyənədək texpasport məhdudiyyəti qüvvədə qalır.'
    };
  }

  if (params.airbagStatus === 'DEPLOYED_DUMMY_RESISTOR_DETECTED') {
    return {
      isRoadPermitted: false,
      statusCode: 'PROHIBITED',
      titleAz: 'Qanunsuz Airbag Rezistoru («Obmanka») Aşkarlanıb',
      summaryAz: 'Təhlükəsizlik yastığı əvəzinə 2.2 Ohm dummy rezistor quraşdırılmışdır. Bu hal BDYP tərəfindən cinayət və yol təhlükəsizliyi qaydalarının kobud pozuntusu sayılır.',
      actionRequiredAz: 'Orijinal OEM piropatronlar və sensorlar quraşdırılaraq RİNN/AZS laboratoriyasında sertifikatlaşdırılmalıdır.'
    };
  }

  if (!params.isChassisCompliant) {
    return {
      isRoadPermitted: false,
      statusCode: 'PROHIBITED',
      titleAz: '3D Şassi Həndəsəsi İcazə Verilən Həddi Aşıb (Δ > 2.0 mm)',
      summaryAz: 'Lanjeron və ya dayaq sütunlarında 2.0 mm-dən artıq meyil aşkarlanıb. Yüksək sürətdə kurs sabitliyi və qəza qorunması pozulur.',
      actionRequiredAz: 'Celette / Car-O-Liner robotlaşdırılmış hidravlik stenddə təkrar çəkilmə həyata keçirilməlidir.'
    };
  }

  if (!params.allWeldsCompliant) {
    return {
      isRoadPermitted: false,
      statusCode: 'CONDITIONAL_PASS',
      titleAz: 'Ultrasəs Qaynaq Tikişlərində Qüsur / Məsamələr Var',
      summaryAz: 'Daşıyıcı birləşmələrdə qaynaq dərinliyi 85%-dən azdır və ya daxili məsamə aşkar edilmişdir.',
      actionRequiredAz: 'Qüsur olan tikişlər təmizlənərək sertifikatlı avtogen/argon qaynağı ilə yenidən işlənməlidir.'
    };
  }

  return {
    isRoadPermitted: true,
    statusCode: 'APPROVED',
    titleAz: 'Bərpadan Sonra Yol Hərəkətinə Tam Yararlıdır',
    summaryAz: '3D karkas həndəsəsi zavod toleransı daxilindədir (±2.0 mm), ultrasəs qaynaq tikişləri qüsursuzdur və SRS təhlükəsizlik sistemləri OEM standartına uyğundur.',
    actionRequiredAz: 'BDYP-də «Qəzalı bərpa edilmiş» qeydi təsdiqlənərək standart dövri texniki baxış talonu verilə bilər.'
  };
}

/**
 * Calculates landed cost and potential margin for imported Copart / IAAI salvage cars.
 */
export function calculateImportLandedCost(params: {
  hammerPriceUsd: number;
  shippingAndCustomsAzn: number;
  estimatedRepairCostAzn: number;
  preAccidentValueAzn: number;
  currency: Currency;
}): ImportLandedCostResult {
  const usdToAznRate = 1.70;
  const hammerPriceAzn = Math.round(params.hammerPriceUsd * usdToAznRate);
  const totalInvestmentAzn = hammerPriceAzn + params.shippingAndCustomsAzn + params.estimatedRepairCostAzn;
  const estimatedNetProfitAzn = params.preAccidentValueAzn - totalInvestmentAzn;
  const roiPercentage = totalInvestmentAzn > 0
    ? Number(((estimatedNetProfitAzn / totalInvestmentAzn) * 100).toFixed(1))
    : 0;

  const rate = CURRENCY_RATES[params.currency] || 1;

  return {
    hammerPriceAzn,
    shippingAndCustomsAzn: params.shippingAndCustomsAzn,
    estimatedRepairCostAzn: params.estimatedRepairCostAzn,
    totalInvestmentAzn,
    preAccidentMarketValueAzn: params.preAccidentValueAzn,
    estimatedNetProfitAzn,
    roiPercentage,
    formattedTotalInvestment: formatPrice(Math.round(totalInvestmentAzn * rate), params.currency),
    formattedProfit: formatPrice(Math.round(estimatedNetProfitAzn * rate), params.currency)
  };
}

/**
 * Generates an official İSB & BDYP Constructive Total Loss / Salvage Certificate.
 */
export function generateSalvageCertificate(params: {
  vin: string;
  lotNumber?: string;
  plateNumber: string;
  makeModel: string;
  year: number;
  categoryKey: SalvageCategoryKey;
  damageRatioPct: number;
  preAccidentValueAzn: number;
  repairCostAzn: number;
  salvageScrapValueAzn: number;
  chassisMaxDeviationMm: number;
  ultrasoundWeldPass: boolean;
  airbagStatus: AirbagDeploymentStatus;
  inspectionCenterId: string;
}): MockSalvageCertificate {
  const serialNumber = Math.floor(10000 + Math.random() * 90000);
  const isApproved =
    params.damageRatioPct < 70 ||
    (params.chassisMaxDeviationMm <= 2.0 &&
      params.ultrasoundWeldPass &&
      params.airbagStatus !== 'DEPLOYED_DUMMY_RESISTOR_DETECTED' &&
      params.categoryKey !== 'STRUCTURAL_TOTAL_LOSS' &&
      params.categoryKey !== 'FLOOD_SUBMERSION');

  const status: MockSalvageCertificate['status'] = isApproved
    ? 'ROAD_CIRCULATION_APPROVED'
    : params.categoryKey === 'STRUCTURAL_TOTAL_LOSS' || params.damageRatioPct >= 70
    ? 'TOTAL_LOSS_CERTIFIED'
    : 'CIRCULATION_REVOKED';

  const issueDate = new Date().toISOString().split('T')[0];
  const digitalSecurityHash = `isb-tot-${params.vin.slice(0, 8)}-${serialNumber}-sha256-verified`;

  return {
    certificateNumber: `ISB-TOT-2026-${serialNumber}`,
    vin: params.vin.toUpperCase(),
    lotNumber: params.lotNumber || 'N/A',
    plateNumber: params.plateNumber.toUpperCase(),
    vehicleMakeModel: params.makeModel,
    year: params.year,
    categoryKey: params.categoryKey,
    status,
    damageRatioPct: params.damageRatioPct,
    preAccidentValueAzn: params.preAccidentValueAzn,
    repairCostAzn: params.repairCostAzn,
    salvageScrapValueAzn: params.salvageScrapValueAzn,
    chassisMaxDeviationMm: params.chassisMaxDeviationMm,
    ultrasoundWeldPass: params.ultrasoundWeldPass,
    airbagStatus: params.airbagStatus,
    inspectionCenterId: params.inspectionCenterId,
    issueDate,
    leadExpert: 'Baş Avtotexnik-Ekspert Cavid Əliyev (Sertifikat #ISB-EXP-402)',
    digitalSecurityHash
  };
}

/**
 * Searches the public registry of salvage and total loss certificates.
 */
export function lookupSalvageRecord(
  query: string,
  extraCertificates: MockSalvageCertificate[] = []
): MockSalvageCertificate | null {
  if (!query || query.trim().length === 0) return null;
  const clean = query.trim().toUpperCase();

  const allRecords = [...extraCertificates, ...MOCK_ACTIVE_SALVAGE_CERTIFICATES];

  return (
    allRecords.find(
      (r) =>
        r.vin.toUpperCase() === clean ||
        r.certificateNumber.toUpperCase() === clean ||
        r.plateNumber.toUpperCase().replace(/\s/g, '') === clean.replace(/\s/g, '') ||
        (r.lotNumber && r.lotNumber.toUpperCase() === clean)
    ) || null
  );
}

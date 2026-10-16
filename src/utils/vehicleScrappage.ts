import { Currency } from '../types/vehicle';
import {
  ScrappageVehicleCategory,
  ScrappageCalculationInput,
  UtilizationFeeBreakdown,
  ScrappagePayoutResult,
  ScrappageCollectionCenter,
  ScrappageConfirmationCertificate
} from '../types/scrappage';
import {
  SCRAPPAGE_COMPLETENESS_COMPONENTS,
  LOCAL_MANUFACTURED_VEHICLES,
  TEMIZ_SEHER_COLLECTION_CENTERS,
  SAMPLE_SCRAPPAGE_CERTIFICATES
} from '../data/mockScrappageData';

export const STATUTORY_VOUCHER_BASE_AZN: Record<ScrappageVehicleCategory, number> = {
  passenger_m1: 1500,
  minibus_m2: 2000,
  truck_n1: 2000,
  heavy_truck_n2_n3: 3000,
  bus_m3: 3000
};

export const STATUTORY_CASH_PAYOUT_RATIO = 0.7; // 70% of voucher amount when choosing lump-sum cash payout

export const SCRAPPAGE_EXCHANGE_RATES: Record<Currency, number> = {
  AZN: 1,
  USD: 0.5882,
  EUR: 0.5435
};

export function convertScrappageCurrency(amountAzn: number, currency: Currency): number {
  const rate = SCRAPPAGE_EXCHANGE_RATES[currency] || 1;
  return Number((amountAzn * rate).toFixed(2));
}

/**
 * Calculates statutory Azerbaijan Vehicle Utilization Fees (Utilizasiya haqqı):
 * 1) Periodic DYP Technical Inspection Utilization Fee (based on vehicle age)
 * 2) DGK Customs Import Utilization Fee (based on engine volume & <3 vs >=3 years age)
 * Reference: "Tullantılar haqqında" Qanun Maddə 14-1 & Nazirlər Kabinetinin Qərarları (2024-2026)
 */
export function calculateUtilizationFees(
  manufactureYear: number,
  engineVolumeCc: number,
  fuelType: 'petrol' | 'diesel' | 'hybrid' | 'electric' | 'lpg',
  currentYear: number = 2026
): UtilizationFeeBreakdown {
  const vehicleAgeYears = Math.max(0, currentYear - manufactureYear);
  const isEvExempt = fuelType === 'electric';

  let periodicInspectionFeeAzn = 0;
  let periodicInspectionTierLabel = {
    az: '0 - 4 il (Texniki baxışdan və utilizasiya haqqından azad)',
    en: '0 - 4 years (Exempt from periodic inspection & utilization fee)',
    ru: '0 - 4 года (Освобожден от техосмотра и сбора за утилизацию)'
  };

  if (isEvExempt) {
    periodicInspectionFeeAzn = 0;
    periodicInspectionTierLabel = {
      az: 'Tam Elektrik (EV) — Ekoloji təşviq üzrə 0 ₼',
      en: 'Pure Electric (EV) — 0 AZN Eco-Incentive Exemption',
      ru: 'Электромобиль (EV) — 0 AZN по экологической льготе'
    };
  } else if (vehicleAgeYears >= 30) {
    periodicInspectionFeeAzn = 40;
    periodicInspectionTierLabel = {
      az: '30 ildən yuxarı (İllik texniki baxış zamanı 40 ₼)',
      en: '30+ years old (40 AZN during annual technical inspection)',
      ru: 'Старше 30 лет (40 AZN при ежегодном техосмотре)'
    };
  } else if (vehicleAgeYears >= 20) {
    periodicInspectionFeeAzn = 30;
    periodicInspectionTierLabel = {
      az: '20 - 30 il (İllik texniki baxış zamanı 30 ₼)',
      en: '20 - 30 years old (30 AZN during annual technical inspection)',
      ru: '20 - 30 лет (30 AZN при ежегодном техосмотре)'
    };
  } else if (vehicleAgeYears >= 10) {
    periodicInspectionFeeAzn = 20;
    periodicInspectionTierLabel = {
      az: '10 - 20 il (İllik texniki baxış zamanı 20 ₼)',
      en: '10 - 20 years old (20 AZN during annual technical inspection)',
      ru: '10 - 20 лет (20 AZN при ежегодном техосмотре)'
    };
  } else if (vehicleAgeYears >= 4) {
    periodicInspectionFeeAzn = 10;
    periodicInspectionTierLabel = {
      az: '4 - 10 il (2 ildən bir texniki baxış zamanı 10 ₼)',
      en: '4 - 10 years old (10 AZN during biennial technical inspection)',
      ru: '4 - 10 лет (10 AZN при двухгодичном техосмотре)'
    };
  }

  let customsImportFeeAzn = 0;
  let customsImportTierLabel = {
    az: 'Tam Elektrik (EV) — Gömrük utilizasiya rüsumundan azad (0 ₼)',
    en: 'Pure Electric (EV) — Exempt from Customs Utilization Fee (0 AZN)',
    ru: 'Электромобиль (EV) — Освобожден от таможенного сбора (0 AZN)'
  };

  if (!isEvExempt) {
    const isUnder3Years = vehicleAgeYears < 3;
    if (engineVolumeCc <= 2000) {
      customsImportFeeAzn = isUnder3Years ? 400 : 700;
      customsImportTierLabel = isUnder3Years
        ? {
            az: 'Mühərrik ≤ 2000 sm³, yaşı < 3 il (400 ₼)',
            en: 'Engine ≤ 2000 cc, age < 3 yrs (400 AZN)',
            ru: 'Двигатель ≤ 2000 см³, возраст < 3 лет (400 AZN)'
          }
        : {
            az: 'Mühərrik ≤ 2000 sm³, yaşı ≥ 3 il (700 ₼)',
            en: 'Engine ≤ 2000 cc, age ≥ 3 yrs (700 AZN)',
            ru: 'Двигатель ≤ 2000 см³, возраст ≥ 3 лет (700 AZN)'
          };
    } else if (engineVolumeCc <= 3000) {
      customsImportFeeAzn = isUnder3Years ? 700 : 1200;
      customsImportTierLabel = isUnder3Years
        ? {
            az: 'Mühərrik 2001 - 3000 sm³, yaşı < 3 il (700 ₼)',
            en: 'Engine 2001 - 3000 cc, age < 3 yrs (700 AZN)',
            ru: 'Двигатель 2001 - 3000 см³, возраст < 3 лет (700 AZN)'
          }
        : {
            az: 'Mühərrik 2001 - 3000 sm³, yaşı ≥ 3 il (1,200 ₼)',
            en: 'Engine 2001 - 3000 cc, age ≥ 3 yrs (1,200 AZN)',
            ru: 'Двигатель 2001 - 3000 см³, возраст ≥ 3 лет (1 200 AZN)'
          };
    } else {
      customsImportFeeAzn = isUnder3Years ? 1000 : 2000;
      customsImportTierLabel = isUnder3Years
        ? {
            az: 'Mühərrik > 3000 sm³, yaşı < 3 il (1,000 ₼)',
            en: 'Engine > 3000 cc, age < 3 yrs (1,000 AZN)',
            ru: 'Двигатель > 3000 см³, возраст < 3 лет (1 000 AZN)'
          }
        : {
            az: 'Mühərrik > 3000 sm³, yaşı ≥ 3 il (2,000 ₼)',
            en: 'Engine > 3000 cc, age ≥ 3 yrs (2,000 AZN)',
            ru: 'Двигатель > 3000 см³, возраст ≥ 3 лет (2 000 AZN)'
          };
    }
  }

  return {
    currentYear,
    vehicleAgeYears,
    periodicInspectionFeeAzn,
    periodicInspectionTierLabel,
    customsImportFeeAzn,
    customsImportTierLabel,
    isEvExempt,
    legalCitation:
      '"Tullantılar haqqında" AR Qanunu Maddə 14-1 və Nazirlər Kabinetinin 2024-cü il 11-13 nömrəli Qərarları'
  };
}

/**
 * Calculates the State Vehicle Scrappage Payout (Güzəşt Vauçeri və ya 70% Birdəfəlik Nağd Ödəniş),
 * Completeness Score, Local Brand Discount, and Environmental Material Recovery.
 */
export function calculateScrappagePayout(
  input: ScrappageCalculationInput,
  currentYear: number = 2026
): ScrappagePayoutResult {
  const vehicleAgeYears = Math.max(0, currentYear - input.manufactureYear);
  const baseVoucherAzn = STATUTORY_VOUCHER_BASE_AZN[input.category] || 1500;

  const missingComponents = SCRAPPAGE_COMPLETENESS_COMPONENTS.filter(
    (comp) => !input.presentComponentIds.includes(comp.id)
  );
  const missingCriticalComponents = missingComponents.filter((c) => c.isCritical);
  const missingNonCriticalComponents = missingComponents.filter((c) => !c.isCritical);

  const presentWeightShare = SCRAPPAGE_COMPLETENESS_COMPONENTS.filter((comp) =>
    input.presentComponentIds.includes(comp.id)
  ).reduce((sum, comp) => sum + comp.weightSharePercent, 0);

  const completenessScorePercent = Math.min(100, Math.max(0, presentWeightShare));

  // If any critical structural component (chassis, engine, or transmission) is missing, vehicle fails completeness audit
  let isEligibleForProgram = true;
  let ineligibilityReason: { az: string; en: string; ru: string } | null = null;

  if (missingCriticalComponents.length > 0) {
    isEligibleForProgram = false;
    ineligibilityReason = {
      az: 'Əsas konstruktiv aqreqatlar (Ban/Şassi, Mühərrik və ya Sürətlər qutusu) çatışmadığı üçün Təsdiqedici Sənəd verilmir.',
      en: 'Missing critical structural assemblies (Body/Chassis, Engine, or Transmission) disqualifies the vehicle from official certification.',
      ru: 'Отсутствие базовых агрегатов (Кузов/Рама, Двигатель или КПП) не позволяет выдать Подтверждающий Документ.'
    };
  } else if (completenessScorePercent < 70) {
    isEligibleForProgram = false;
    ineligibilityReason = {
      az: 'Komplektlik göstəricisi 70%-dən aşağı olduğu üçün nəqliyyat vasitəsi utilizasiya proqramına qəbul edilmir.',
      en: 'Vehicle completeness score is below the 70% statutory threshold required for acceptance.',
      ru: 'Показатель комплектности ниже 70%, автомобиль не может быть принят в госпрограмму утилизации.'
    };
  }

  const deductionTotalAzn = missingNonCriticalComponents.reduce(
    (sum, item) => sum + item.deductionIfMissingAzn,
    0
  );

  const netVoucherPayoutAzn = isEligibleForProgram
    ? Math.max(0, baseVoucherAzn - deductionTotalAzn)
    : 0;

  const cashLumpSum70Azn = Math.round(baseVoucherAzn * STATUTORY_CASH_PAYOUT_RATIO);
  const netCashPayoutAzn = isEligibleForProgram
    ? Math.round(netVoucherPayoutAzn * STATUTORY_CASH_PAYOUT_RATIO)
    : 0;

  const selectedPayoutAzn =
    input.payoutMode === 'local_car_voucher' ? netVoucherPayoutAzn : netCashPayoutAzn;

  const selectedLocalCar = LOCAL_MANUFACTURED_VEHICLES.find(
    (car) => car.id === input.selectedLocalModelId
  );

  const factoryBonusAzn =
    isEligibleForProgram && input.payoutMode === 'local_car_voucher' && selectedLocalCar
      ? selectedLocalCar.factoryExtraBonusAzn
      : 0;

  const totalCombinedDiscountAzn =
    input.payoutMode === 'local_car_voucher'
      ? netVoucherPayoutAzn + factoryBonusAzn
      : netCashPayoutAzn;

  const localBrandFinalPriceAzn = selectedLocalCar
    ? Math.max(0, selectedLocalCar.retailPriceAzn - totalCombinedDiscountAzn)
    : null;

  // Ecological material recovery calculation based on curbWeightKg and completeness
  const effectiveWeightKg = Math.round(
    Math.max(600, input.curbWeightKg) * (completenessScorePercent / 100)
  );
  const ferrousSteelKg = Math.round(effectiveWeightKg * 0.65);
  const aluminumKg = Math.round(effectiveWeightKg * 0.09);
  const copperWiringKg = Math.round(effectiveWeightKg * 0.025);
  const polymersGlassKg = Math.round(effectiveWeightKg * 0.16);
  const hazardousFluidsLiters = Number((effectiveWeightKg * 0.009).toFixed(1));
  const co2PreventedTonsPerYear = Number(
    (vehicleAgeYears >= 15 ? 3.4 : vehicleAgeYears >= 10 ? 2.6 : 1.9).toFixed(1)
  );

  return {
    isEligibleForProgram,
    ineligibilityReason,
    vehicleAgeYears,
    baseVoucherAzn,
    cashLumpSum70Azn,
    completenessScorePercent,
    missingCriticalComponents,
    missingNonCriticalComponents,
    deductionTotalAzn,
    netVoucherPayoutAzn,
    netCashPayoutAzn,
    selectedPayoutAzn,
    factoryBonusAzn,
    totalCombinedDiscountAzn,
    localBrandFinalPriceAzn,
    recyclingRecovery: {
      ferrousSteelKg,
      aluminumKg,
      copperWiringKg,
      polymersGlassKg,
      hazardousFluidsLiters,
      co2PreventedTonsPerYear
    }
  };
}

export function filterCollectionCentersByCity(city: string): ScrappageCollectionCenter[] {
  if (!city || city === 'all') {
    return TEMIZ_SEHER_COLLECTION_CENTERS;
  }
  return TEMIZ_SEHER_COLLECTION_CENTERS.filter(
    (center) => center.city.toLowerCase() === city.toLowerCase()
  );
}

export function generateScrappageCertificate(params: {
  applicantFullName: string;
  applicantFin: string;
  vehicleTitle: string;
  vin: string;
  plateNumber: string;
  manufactureYear: number;
  category: ScrappageVehicleCategory;
  centerId: string;
  completenessScorePercent: number;
  payoutMode: 'local_car_voucher' | 'cash_lump_sum_70';
  voucherAmountAzn: number;
  cashPayoutAmountAzn: number;
}): ScrappageConfirmationCertificate {
  const center =
    TEMIZ_SEHER_COLLECTION_CENTERS.find((c) => c.id === params.centerId) ||
    TEMIZ_SEHER_COLLECTION_CENTERS[0];

  const cleanVinSuffix =
    params.vin
      .replace(/[^A-Z0-9]/gi, '')
      .slice(-5)
      .toUpperCase() || '84920';
  const numericHash = cleanVinSuffix
    .split('')
    .map((ch) => (ch.charCodeAt(0) % 9) + 1)
    .join('')
    .slice(0, 5);

  const certificateNumber = `TS-UTL-2026-${numericHash}`;
  const bdypDeregistrationCode = `BDYP-CX-2026-${numericHash.split('').reverse().join('')}`;

  return {
    certificateNumber,
    bdypDeregistrationCode,
    issueDate: '2026-10-16',
    expiryDate: '2027-10-16',
    applicantFullName: params.applicantFullName.trim() || 'Məmmədov Elşən Rasim oğlu',
    applicantFin: params.applicantFin.trim().toUpperCase() || '5AZ91K2',
    vehicleTitle: params.vehicleTitle,
    vin: params.vin.toUpperCase(),
    plateNumber: params.plateNumber.toUpperCase(),
    manufactureYear: params.manufactureYear,
    category: params.category,
    centerId: center.id,
    centerName: center.name.az,
    completenessScorePercent: params.completenessScorePercent,
    payoutMode: params.payoutMode,
    voucherAmountAzn: params.voucherAmountAzn,
    cashPayoutAmountAzn: params.cashPayoutAmountAzn,
    qrVerificationHash: `AZ-TS-UTL-${numericHash}-${params.category.toUpperCase()}`,
    status: params.payoutMode === 'local_car_voucher' ? 'ACTIVE_VOUCHER' : 'CASH_TRANSFERRED'
  };
}

export function verifyScrappageCertificateCode(
  code: string
): ScrappageConfirmationCertificate | null {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;
  return (
    SAMPLE_SCRAPPAGE_CERTIFICATES.find(
      (cert) =>
        cert.certificateNumber.toUpperCase() === normalized ||
        cert.bdypDeregistrationCode.toUpperCase() === normalized ||
        cert.vin.toUpperCase() === normalized
    ) || null
  );
}

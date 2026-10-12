import {
  TradeInInputs,
  TradeInValuationResult,
  TradeInPreset,
  TradeInAdjustmentItem,
} from '../types/tradeIn';
import { Currency } from '../types/vehicle';
import { formatPrice } from './i18n';

/**
 * Average annual driving distance in Azerbaijan (km/year)
 */
export const ANNUAL_AVERAGE_KM = 15000;

/**
 * Reference calendar year for valuation models
 */
export const REFERENCE_YEAR = 2026;

/**
 * Standard auto loan annual interest rate in Azerbaijan
 */
export const DEFAULT_LOAN_ANNUAL_INTEREST_RATE = 0.14; // 14%

/**
 * Popular pre-configured trade-in vehicles for the Azerbaijani market
 */
export const POPULAR_TRADE_IN_PRESETS: TradeInPreset[] = [
  {
    id: 'elantra-2017',
    name: 'Hyundai Elantra 1.8 (2017)',
    make: 'Hyundai',
    model: 'Elantra',
    year: 2017,
    mileageKm: 125000,
    baseMarketPriceAzn: 23500,
    condition: 'good',
    accidentStatus: 'minor_cosmetic',
    serviceHistory: 'regular_service',
  },
  {
    id: 'camry-2016',
    name: 'Toyota Camry 2.5 (2016)',
    make: 'Toyota',
    model: 'Camry',
    year: 2016,
    mileageKm: 140000,
    baseMarketPriceAzn: 31000,
    condition: 'good',
    accidentStatus: 'clean',
    serviceHistory: 'dealer_certified',
  },
  {
    id: 'cerato-2015',
    name: 'Kia Cerato 1.6 (2015)',
    make: 'Kia',
    model: 'Cerato',
    year: 2015,
    mileageKm: 165000,
    baseMarketPriceAzn: 19500,
    condition: 'fair',
    accidentStatus: 'minor_cosmetic',
    serviceHistory: 'regular_service',
  },
  {
    id: 'cruze-2018',
    name: 'Chevrolet Cruze 1.4T (2018)',
    make: 'Chevrolet',
    model: 'Cruze',
    year: 2018,
    mileageKm: 110000,
    baseMarketPriceAzn: 18500,
    condition: 'good',
    accidentStatus: 'minor_cosmetic',
    serviceHistory: 'regular_service',
  },
  {
    id: 'c200-2014',
    name: 'Mercedes-Benz C200 W204 (2014)',
    make: 'Mercedes-Benz',
    model: 'C-Class',
    year: 2014,
    mileageKm: 175000,
    baseMarketPriceAzn: 28000,
    condition: 'good',
    accidentStatus: 'clean',
    serviceHistory: 'regular_service',
  },
];

/**
 * Estimates base private retail market price if not explicitly provided
 */
export function estimateBaseMarketPrice(make: string, model: string, year: number): number {
  const normalizedMake = (make || '').toLowerCase().trim();
  const normalizedModel = (model || '').toLowerCase().trim();

  // Check preset matches first
  const matchedPreset = POPULAR_TRADE_IN_PRESETS.find(
    (p) =>
      p.make.toLowerCase() === normalizedMake &&
      p.model.toLowerCase() === normalizedModel &&
      Math.abs(p.year - year) <= 2
  );
  if (matchedPreset) {
    const ageDiff = matchedPreset.year - year;
    const adjusted = matchedPreset.baseMarketPriceAzn * Math.pow(0.92, ageDiff);
    return Math.round(adjusted / 500) * 500;
  }

  // Model-level benchmark heuristics
  const age = Math.max(0, REFERENCE_YEAR - year);
  let baseNewPrice = 45000;

  if (normalizedMake.includes('mercedes') || normalizedMake.includes('bmw') || normalizedMake.includes('audi') || normalizedMake.includes('porsche')) {
    baseNewPrice = 85000;
  } else if (normalizedMake.includes('toyota') || normalizedMake.includes('lexus')) {
    baseNewPrice = 55000;
  } else if (normalizedMake.includes('hyundai') || normalizedMake.includes('kia')) {
    baseNewPrice = 38000;
  } else if (normalizedMake.includes('chevrolet') || normalizedMake.includes('nissan') || normalizedMake.includes('ford')) {
    baseNewPrice = 34000;
  } else if (normalizedMake.includes('lada') || normalizedMake.includes('khazar')) {
    baseNewPrice = 18000;
  }

  // Depreciation curve: year 1 (-15%), year 2-5 (-8% per year), year 6+ (-6% per year)
  let currentVal = baseNewPrice;
  for (let y = 1; y <= age; y++) {
    if (y === 1) currentVal *= 0.85;
    else if (y <= 5) currentVal *= 0.92;
    else currentVal *= 0.94;
  }

  return Math.max(3000, Math.round(currentVal / 500) * 500);
}

/**
 * Calculates vehicle mileage delta relative to annual expected usage
 */
export function calculateMileageDelta(year: number, mileageKm: number): number {
  const ageYears = Math.max(1, REFERENCE_YEAR - year);
  const expectedMileage = ageYears * ANNUAL_AVERAGE_KM;
  return mileageKm - expectedMileage;
}

/**
 * Core trade-in valuation algorithm
 */
export function calculateTradeInValuation(inputs: TradeInInputs): TradeInValuationResult {
  const {
    make,
    model,
    year,
    mileageKm,
    condition,
    accidentStatus,
    serviceHistory,
    existingLoanBalanceAzn = 0,
    targetVehiclePriceAzn = 0,
  } = inputs;

  const baseMarketValueAzn =
    inputs.estimatedMarketBaseAzn && inputs.estimatedMarketBaseAzn > 0
      ? inputs.estimatedMarketBaseAzn
      : estimateBaseMarketPrice(make, model, year);

  const adjustments: TradeInAdjustmentItem[] = [];

  // 1. Mileage Adjustment
  const mileageDeltaKm = calculateMileageDelta(year, mileageKm);
  let mileageAdjAmount = 0;

  if (mileageDeltaKm > 0) {
    // Excessive mileage deduction (-0.05 AZN per excess km, capped at -22% of base)
    const rawDeduction = -Math.round(mileageDeltaKm * 0.05);
    const maxDeduction = -Math.round(baseMarketValueAzn * 0.22);
    mileageAdjAmount = Math.max(rawDeduction, maxDeduction);

    adjustments.push({
      id: 'mileage',
      label: 'Yürüş Fərqi (Normadan artıq)',
      amountAzn: mileageAdjAmount,
      percentage: Math.round((mileageAdjAmount / baseMarketValueAzn) * 100),
      impact: 'negative',
      description: `Gözləniləndən +${Math.round(mileageDeltaKm).toLocaleString()} km artıq yürüş`,
    });
  } else if (mileageDeltaKm < 0) {
    // Low mileage premium (+0.04 AZN per saved km, capped at +14% of base)
    const rawBonus = Math.round(Math.abs(mileageDeltaKm) * 0.04);
    const maxBonus = Math.round(baseMarketValueAzn * 0.14);
    mileageAdjAmount = Math.min(rawBonus, maxBonus);

    adjustments.push({
      id: 'mileage',
      label: 'Yürüş Fərqi (Aşağı yürüş bonusu)',
      amountAzn: mileageAdjAmount,
      percentage: Math.round((mileageAdjAmount / baseMarketValueAzn) * 100),
      impact: 'positive',
      description: `Gözləniləndən -${Math.abs(Math.round(mileageDeltaKm)).toLocaleString()} km az yürüş`,
    });
  } else {
    adjustments.push({
      id: 'mileage',
      label: 'Yürüş Norması',
      amountAzn: 0,
      percentage: 0,
      impact: 'neutral',
      description: 'Yürüş illik orta normaya tam uyğundur',
    });
  }

  // 2. Physical & Mechanical Condition Multiplier
  let conditionPercent = 0;
  let conditionDesc = '';
  switch (condition) {
    case 'excellent':
      conditionPercent = 0.06;
      conditionDesc = 'Zavod vəziyyətində, tam xətasız və qüsursuz';
      break;
    case 'good':
      conditionPercent = 0.0;
      conditionDesc = 'Standart təbii köhnəlmə, texniki baxımdan saz';
      break;
    case 'fair':
      conditionPercent = -0.10;
      conditionDesc = 'Kosmetik qüsurlar və xırda cari təmir ehtiyacı';
      break;
    case 'poor':
      conditionPercent = -0.22;
      conditionDesc = 'Əsaslı texniki və ya kuzov bərpası tələb olunur';
      break;
  }
  const conditionAdjAmount = Math.round(baseMarketValueAzn * conditionPercent);
  adjustments.push({
    id: 'condition',
    label: 'Kuzov & Texniki Vəziyyət',
    amountAzn: conditionAdjAmount,
    percentage: Math.round(conditionPercent * 100),
    impact: conditionPercent > 0 ? 'positive' : conditionPercent < 0 ? 'negative' : 'neutral',
    description: conditionDesc,
  });

  // 3. Paint & Accident History Adjustment
  let accidentPercent = 0;
  let accidentDesc = '';
  switch (accidentStatus) {
    case 'clean':
      accidentPercent = 0.0;
      accidentDesc = 'Heç bir qəza və ya boya izi qeydə alınmayıb';
      break;
    case 'minor_cosmetic':
      accidentPercent = -0.04;
      accidentDesc = 'Yüngül cızıq və ya kosmetik rəng detalları';
      break;
    case 'accident_repaired':
      accidentPercent = -0.13;
      accidentDesc = 'Qəza nəticəsində bərpa olunmuş və ya dəyişdirilmiş hissələr';
      break;
  }
  const accidentAdjAmount = Math.round(baseMarketValueAzn * accidentPercent);
  if (accidentPercent !== 0) {
    adjustments.push({
      id: 'accident',
      label: 'Qəza & Rəng Tarixçəsi',
      amountAzn: accidentAdjAmount,
      percentage: Math.round(accidentPercent * 100),
      impact: 'negative',
      description: accidentDesc,
    });
  }

  // 4. Service History Adjustment
  let servicePercent = 0;
  let serviceDesc = '';
  switch (serviceHistory) {
    case 'dealer_certified':
      servicePercent = 0.04;
      serviceDesc = 'Rəsmi diler qulluq kitabı və təsdiqlənmiş servis';
      break;
    case 'regular_service':
      servicePercent = 0.0;
      serviceDesc = 'Mütəmadi müstəqil servis qulluğu';
      break;
    case 'partial_unknown':
      servicePercent = -0.05;
      serviceDesc = 'Qulluq tarixçəsi qeyri-müəyyən və ya sənədsiz';
      break;
  }
  const serviceAdjAmount = Math.round(baseMarketValueAzn * servicePercent);
  if (servicePercent !== 0) {
    adjustments.push({
      id: 'service',
      label: 'Servis & Qulluq Tarixçəsi',
      amountAzn: serviceAdjAmount,
      percentage: Math.round(servicePercent * 100),
      impact: servicePercent > 0 ? 'positive' : 'negative',
      description: serviceDesc,
    });
  }

  // Private Market Fair Value Calculation
  const totalAdjustmentsAzn =
    mileageAdjAmount + conditionAdjAmount + accidentAdjAmount + serviceAdjAmount;
  const privateSaleEstimatedAzn = Math.max(
    1500,
    Math.round((baseMarketValueAzn + totalAdjustmentsAzn) / 100) * 100
  );

  // Dealership Trade-In Valuation (Wholesale discount factor ~13.5%)
  const tradeInOfferAzn = Math.max(
    1200,
    Math.round((privateSaleEstimatedAzn * 0.865) / 100) * 100
  );
  const tradeInMinAzn = Math.round(tradeInOfferAzn * 0.95);
  const tradeInMaxAzn = Math.round(tradeInOfferAzn * 1.05);

  // Instant Cash Liquidation Buyout (~82% of private retail)
  const instantCashOfferAzn = Math.max(
    1000,
    Math.round((privateSaleEstimatedAzn * 0.82) / 100) * 100
  );

  // Dealership Trade-In Promotional Loyalty Voucher / Bonus (AutoNext partner perk)
  // Higher bonus when upgrading to a pricier target car
  const dealershipBonusAzn = targetVehiclePriceAzn > 0
    ? Math.min(1500, Math.max(600, Math.round(targetVehiclePriceAzn * 0.02)))
    : 800;

  // Effective credit at dealership
  const effectiveTradeInCreditAzn = tradeInOfferAzn + dealershipBonusAzn;

  // Existing loan payoff & net trade-in equity
  const netTradeInEquityAzn = effectiveTradeInCreditAzn - existingLoanBalanceAzn;

  // Net difference to pay when upgrading to target car
  const netDifferenceToPayAzn = Math.max(0, targetVehiclePriceAzn - netTradeInEquityAzn);

  // Calculation confidence score based on parameters
  let confidenceScore = 88;
  if (serviceHistory === 'dealer_certified') confidenceScore += 5;
  if (accidentStatus === 'clean') confidenceScore += 3;
  if (condition === 'poor') confidenceScore -= 8;
  confidenceScore = Math.min(98, Math.max(70, confidenceScore));

  return {
    baseMarketValueAzn,
    tradeInOfferAzn,
    tradeInMinAzn,
    tradeInMaxAzn,
    instantCashOfferAzn,
    privateSaleEstimatedAzn,
    dealershipBonusAzn,
    effectiveTradeInCreditAzn,
    existingLoanBalanceAzn,
    netTradeInEquityAzn,
    targetVehiclePriceAzn,
    netDifferenceToPayAzn,
    adjustments,
    conditionMultiplier: 1 + conditionPercent,
    mileageDeltaKm,
    confidenceScore,
  };
}

/**
 * Calculates estimated monthly loan payment for the upgrade difference
 */
export function calculateUpgradeLoanEstimate(
  netDifferenceAzn: number,
  termMonths = 36,
  annualInterestRate = DEFAULT_LOAN_ANNUAL_INTEREST_RATE
): number {
  if (netDifferenceAzn <= 0 || termMonths <= 0) return 0;
  const monthlyRate = annualInterestRate / 12;
  const monthlyPayment =
    (netDifferenceAzn * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);
  return Math.round(monthlyPayment);
}

/**
 * Generates formatted text summary for sharing or copying
 */
export function formatTradeInSummaryText(
  vehicleName: string,
  result: TradeInValuationResult,
  currency: Currency = 'AZN'
): string {
  const diffSign = result.netTradeInEquityAzn >= 0 ? '+' : '-';
  const equityStr = `${diffSign}${formatPrice(Math.abs(result.netTradeInEquityAzn), currency)}`;

  return [
    `=== AutoNext Trade-In & Barter Qiymətləndirməsi ===`,
    `Cari Avtomobil: ${vehicleName}`,
    `Rəsmi Diler Təklifi: ${formatPrice(result.tradeInOfferAzn, currency)} (${formatPrice(result.tradeInMinAzn, currency)} - ${formatPrice(result.tradeInMaxAzn, currency)})`,
    `Diler Barter Bonusu: +${formatPrice(result.dealershipBonusAzn, currency)}`,
    `Təcili Nağd Satış: ${formatPrice(result.instantCashOfferAzn, currency)}`,
    `Şəxsi Bazar Qiyməti: ${formatPrice(result.privateSaleEstimatedAzn, currency)}`,
    `Kredit Qalığı: ${formatPrice(result.existingLoanBalanceAzn, currency)}`,
    `Xalis Barter Kapitalı (Equity): ${equityStr}`,
    result.targetVehiclePriceAzn > 0
      ? `Hədəf Avtomobil: ${formatPrice(result.targetVehiclePriceAzn, currency)}\nYeniləmə üçün ödəniləcək fərq: ${formatPrice(result.netDifferenceToPayAzn, currency)}`
      : '',
    `Dəqiqlik dərəcəsi: ${result.confidenceScore}%`,
  ]
    .filter(Boolean)
    .join('\n');
}

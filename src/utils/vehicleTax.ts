/**
 * Official State Tax Service (İqtisadiyyat Nazirliyi yanında Dövlət Vergi Xidməti — DVX)
 * Automotive Taxation, Annual Road Tax, Trade-in Margin VAT & Corporate Depreciation Engine
 *
 * Compliant with:
 * - Tax Code of the Republic of Azerbaijan (Azərbaycan Respublikasının Vergi Məcəlləsi)
 *   - Articles 209-211: Annual Road Tax (İllik Yol Vergisi) & Engine Displacement Tiers
 *   - Articles 159 & 164: Value Added Tax (18% ƏDV) on Automotive Dealership Trade-In Margin (Ticarət Əlavəsi)
 *   - Article 114: Corporate Asset Depreciation (Nəqliyyat vasitələri üzrə illik 25% amortizasiya norması)
 *   - Articles 196-202: Corporate Property Tax (Hüquqi şəxslərin əmlak vergisi — 1%)
 *   - Article 218-221: Simplified Tax (Sadələşdirilmiş vergi — 2%)
 * - Cabinet of Ministers of the Republic of Azerbaijan Fiscal Regulations
 * - DVX Automated Tax Information System (AVİS) & Electronic Tax Invoice («E-Qaimə-Faktura») Standards
 */

export type VehicleTaxCategory =
  | 'passenger_car'
  | 'electric_car'
  | 'bus'
  | 'truck'
  | 'motorcycle';

export type TaxPayerType = 'individual' | 'legal_entity' | 'dealership';

export type TaxRegimeType = 'vat_payer' | 'simplified';

export type DepreciationMethod = 'straight_line' | 'declining_balance';

export interface RoadTaxCalculationParams {
  category: VehicleTaxCategory;
  engineDisplacementCc: number; // e.g. 1998, 2487, 3956
  isElectric?: boolean;
  isHybrid?: boolean;
  seatingCapacity?: number; // for buses
  payloadCapacityTons?: number; // for trucks
}

export interface RoadTaxCalculationResult {
  category: VehicleTaxCategory;
  engineDisplacementCc: number;
  roadTaxAzn: number;
  roadTaxUsd: number;
  roadTaxEur: number;
  isExempt: boolean;
  exemptionReasonAz?: string;
  exemptionReasonEn?: string;
  statutoryFormulaAz: string;
  legalArticle: string;
}

export interface TradeInVatParams {
  purchasePrice: number; // Price dealer bought from individual (AZN)
  sellingPrice: number; // Price dealer sells to buyer (AZN)
  taxRegime: TaxRegimeType;
  roadTaxAzn?: number;
}

export interface TradeInVatResult {
  purchasePrice: number;
  sellingPrice: number;
  tradeMarginAzn: number; // Ticarət əlavəsi (selling - purchase)
  taxableBaseAzn: number; // Margin (or 0 if selling <= purchase)
  vatRatePercent: number; // 18% or 0%
  vatAmountAzn: number;
  simplifiedTaxRatePercent: number; // 2% or 0%
  simplifiedTaxAmountAzn: number;
  totalTaxLiabilityAzn: number;
  netDealerProfitAzn: number;
  effectiveTaxRatePercent: number;
  legalArticle: string;
}

export interface DepreciationYearRecord {
  year: number;
  startingBookValueAzn: number;
  depreciationExpenseAzn: number;
  accumulatedDepreciationAzn: number;
  endingBookValueAzn: number;
  annualPropertyTaxAzn: number; // 1% of residual value (Əmlak vergisi)
}

export interface CorporateDepreciationResult {
  initialAssetValueAzn: number;
  salvageValueAzn: number;
  usefulLifeYears: number;
  annualDepreciationRatePercent: number; // 25% per Tax Code Art. 114.3.4
  method: DepreciationMethod;
  schedule: DepreciationYearRecord[];
  totalDepreciationAzn: number;
  totalPropertyTaxAzn: number;
  legalArticle: string;
}

export interface TaxOffice {
  id: string;
  nameAz: string;
  nameEn: string;
  cityAz: string;
  addressAz: string;
  phone: string;
  email: string;
  operatingHours: string;
  activeServiceWindows: number;
  avgWaitTimeMin: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  isAsanService: boolean;
}

export interface ElectronicTaxInvoice {
  id: string;
  invoiceNumber: string; // DVX-AVT-2026-XXXXX
  issueDate: string;
  sellerVoen: string;
  sellerName: string;
  buyerVoenOrFin: string;
  buyerName: string;
  buyerType: 'individual' | 'legal_entity';
  vehiclePlate: string;
  vehicleVin: string;
  vehicleMakeModel: string;
  vehicleYear: number;
  engineDisplacementCc: number;
  purchasePriceAzn: number;
  sellingPriceAzn: number;
  tradeMarginAzn: number;
  annualRoadTaxAzn: number;
  vatAmountAzn: number;
  totalInvoiceAmountAzn: number;
  currency: 'AZN' | 'USD' | 'EUR';
  status: 'approved' | 'draft' | 'cancelled';
  securityHash: string;
  qrVerificationCode: string;
  digitalSignatureUid: string;
}

// Exchange rates consistent across AutoNext platform (1 USD = 1.70 AZN, 1 EUR = 1.85 AZN)
export const TAX_EXCHANGE_RATES = {
  AZN: 1,
  USD: 1 / 1.7,
  EUR: 1 / 1.85,
};

export const convertTaxCurrency = (
  amountAzn: number,
  currency: 'AZN' | 'USD' | 'EUR' = 'AZN'
): number => {
  const rate = TAX_EXCHANGE_RATES[currency] || 1;
  return Number((amountAzn * rate).toFixed(2));
};

/**
 * Calculates statutory Annual Road Tax under Articles 209-211 of the Tax Code of Azerbaijan
 */
export function calculateAnnualRoadTax(
  params: RoadTaxCalculationParams
): RoadTaxCalculationResult {
  const { category, engineDisplacementCc, isElectric, seatingCapacity = 1, payloadCapacityTons = 0 } = params;

  // 1. Pure Electric Vehicles: Fully exempt from Road Tax
  if (isElectric || category === 'electric_car') {
    return {
      category: 'electric_car',
      engineDisplacementCc: 0,
      roadTaxAzn: 0,
      roadTaxUsd: 0,
      roadTaxEur: 0,
      isExempt: true,
      exemptionReasonAz: 'Azərbaycan Respublikasının Vergi Məcəlləsinə əsasən tam elektrik mühərrikli nəqliyyat vasitələri yol vergisindən azaddır (0 AZN).',
      exemptionReasonEn: 'Pure electric vehicles are fully exempt from annual road tax under the Tax Code of Azerbaijan (0 AZN).',
      statutoryFormulaAz: '0 AZN (Ekoloji təmiz elektrik avtomobili güzəşti)',
      legalArticle: 'Vergi Məcəlləsi Maddə 209 & 211',
    };
  }

  let taxAzn = 0;
  let formulaAz = '';

  // 2. Buses
  if (category === 'bus') {
    const seats = Math.max(1, seatingCapacity);
    if (seats <= 12) {
      taxAzn = seats * 0.15;
      formulaAz = `${seats} yer × 0.15 AZN = ${taxAzn.toFixed(2)} AZN`;
    } else if (seats <= 30) {
      taxAzn = seats * 0.30;
      formulaAz = `${seats} yer × 0.30 AZN = ${taxAzn.toFixed(2)} AZN`;
    } else {
      taxAzn = seats * 0.50;
      formulaAz = `${seats} yer × 0.50 AZN = ${taxAzn.toFixed(2)} AZN`;
    }

    return {
      category: 'bus',
      engineDisplacementCc,
      roadTaxAzn: Number(taxAzn.toFixed(2)),
      roadTaxUsd: convertTaxCurrency(taxAzn, 'USD'),
      roadTaxEur: convertTaxCurrency(taxAzn, 'EUR'),
      isExempt: false,
      statutoryFormulaAz: formulaAz,
      legalArticle: 'Vergi Məcəlləsi Maddə 211.1.2 (Avtobuslar)',
    };
  }

  // 3. Trucks / Freight
  if (category === 'truck') {
    const tons = payloadCapacityTons;
    if (tons <= 1) {
      taxAzn = 20;
      formulaAz = '1 tona qədər yük avtomobilləri: Sabit 20 AZN';
    } else if (tons <= 3) {
      taxAzn = 40;
      formulaAz = '1 tondan 3 tona qədər yük avtomobilləri: Sabit 40 AZN';
    } else if (tons <= 5) {
      taxAzn = 60;
      formulaAz = '3 tondan 5 tona qədər yük avtomobilləri: Sabit 60 AZN';
    } else if (tons <= 10) {
      taxAzn = 100;
      formulaAz = '5 tondan 10 tona qədər yük avtomobilləri: Sabit 100 AZN';
    } else {
      taxAzn = 150;
      formulaAz = '10 tondan artıq yük avtomobilləri: Sabit 150 AZN';
    }

    return {
      category: 'truck',
      engineDisplacementCc,
      roadTaxAzn: taxAzn,
      roadTaxUsd: convertTaxCurrency(taxAzn, 'USD'),
      roadTaxEur: convertTaxCurrency(taxAzn, 'EUR'),
      isExempt: false,
      statutoryFormulaAz: formulaAz,
      legalArticle: 'Vergi Məcəlləsi Maddə 211.1.3 (Yük avtomobilləri)',
    };
  }

  // 4. Motorcycles
  if (category === 'motorcycle') {
    taxAzn = 20;
    formulaAz = 'Motosiklet və trisikllər: Sabit 20 AZN';
    return {
      category: 'motorcycle',
      engineDisplacementCc,
      roadTaxAzn: taxAzn,
      roadTaxUsd: convertTaxCurrency(taxAzn, 'USD'),
      roadTaxEur: convertTaxCurrency(taxAzn, 'EUR'),
      isExempt: false,
      statutoryFormulaAz: formulaAz,
      legalArticle: 'Vergi Məcəlləsi Maddə 211.1.4 (Motosikletlər)',
    };
  }

  // 5. Passenger Cars (Minik avtomobilləri — Maddə 211.1.1)
  const cc = Math.max(0, engineDisplacementCc);
  if (cc <= 2000) {
    taxAzn = cc * 0.02;
    formulaAz = `${cc} sm³ × 0.02 AZN = ${taxAzn.toFixed(2)} AZN`;
  } else if (cc <= 3000) {
    const excess = cc - 2000;
    taxAzn = 40 + excess * 0.03;
    formulaAz = `40 AZN + (${excess} sm³ × 0.03 AZN) = ${taxAzn.toFixed(2)} AZN`;
  } else if (cc <= 4000) {
    const excess = cc - 3000;
    taxAzn = 70 + excess * 0.04;
    formulaAz = `70 AZN + (${excess} sm³ × 0.04 AZN) = ${taxAzn.toFixed(2)} AZN`;
  } else if (cc <= 5000) {
    const excess = cc - 4000;
    taxAzn = 110 + excess * 0.05;
    formulaAz = `110 AZN + (${excess} sm³ × 0.05 AZN) = ${taxAzn.toFixed(2)} AZN`;
  } else {
    const excess = cc - 5000;
    taxAzn = 160 + excess * 0.06;
    formulaAz = `160 AZN + (${excess} sm³ × 0.06 AZN) = ${taxAzn.toFixed(2)} AZN`;
  }

  return {
    category: 'passenger_car',
    engineDisplacementCc: cc,
    roadTaxAzn: Number(taxAzn.toFixed(2)),
    roadTaxUsd: convertTaxCurrency(taxAzn, 'USD'),
    roadTaxEur: convertTaxCurrency(taxAzn, 'EUR'),
    isExempt: false,
    statutoryFormulaAz: formulaAz,
    legalArticle: 'Vergi Məcəlləsi Maddə 211.1.1 (Minik avtomobilləri)',
  };
}

/**
 * Calculates Dealership Trade-In Margin VAT under Articles 159 & 164 of the Tax Code
 */
export function calculateTradeInVat(params: TradeInVatParams): TradeInVatResult {
  const { purchasePrice, sellingPrice, taxRegime } = params;

  const tradeMarginAzn = Number((sellingPrice - purchasePrice).toFixed(2));
  const taxableBaseAzn = Math.max(0, tradeMarginAzn);

  let vatRatePercent = 0;
  let vatAmountAzn = 0;
  let simplifiedTaxRatePercent = 0;
  let simplifiedTaxAmountAzn = 0;

  if (taxRegime === 'vat_payer') {
    // VAT on margin: 18% of taxable margin
    vatRatePercent = 18;
    vatAmountAzn = Number((taxableBaseAzn * 0.18).toFixed(2));
  } else {
    // Simplified tax regime: 2% of total gross selling price
    simplifiedTaxRatePercent = 2;
    simplifiedTaxAmountAzn = Number((sellingPrice * 0.02).toFixed(2));
  }

  const totalTaxLiabilityAzn = Number((vatAmountAzn + simplifiedTaxAmountAzn).toFixed(2));
  const netDealerProfitAzn = Number((tradeMarginAzn - totalTaxLiabilityAzn).toFixed(2));
  const effectiveTaxRatePercent = sellingPrice > 0
    ? Number(((totalTaxLiabilityAzn / sellingPrice) * 100).toFixed(2))
    : 0;

  return {
    purchasePrice,
    sellingPrice,
    tradeMarginAzn,
    taxableBaseAzn,
    vatRatePercent,
    vatAmountAzn,
    simplifiedTaxRatePercent,
    simplifiedTaxAmountAzn,
    totalTaxLiabilityAzn,
    netDealerProfitAzn,
    effectiveTaxRatePercent,
    legalArticle: taxRegime === 'vat_payer'
      ? 'Vergi Məcəlləsi Maddə 159 & 164 (Ticarət əlavəsi üzrə 18% ƏDV)'
      : 'Vergi Məcəlləsi Maddə 218 & 220 (Ümumi dövriyyədən 2% Sadələşdirilmiş Vergi)',
  };
}

/**
 * Calculates Corporate Fleet Vehicle 25% Depreciation Schedule & 1% Property Tax
 * Under Article 114.3.4 & Articles 196-202 of the Tax Code of Azerbaijan
 */
export function calculateCorporateFleetDepreciation(
  initialAssetValueAzn: number,
  usefulLifeYears = 4, // 25% per annum -> 4 years
  method: DepreciationMethod = 'straight_line',
  salvageValueAzn = 0
): CorporateDepreciationResult {
  const annualDepreciationRatePercent = 25; // Statutory 25% for motor vehicles
  const schedule: DepreciationYearRecord[] = [];

  let currentBookValue = initialAssetValueAzn;
  let accumulatedDepreciation = 0;
  let totalPropertyTax = 0;

  for (let year = 1; year <= usefulLifeYears; year++) {
    const startingBookValue = currentBookValue;
    let depreciationExpense = 0;

    if (method === 'straight_line') {
      const depreciableBase = Math.max(0, initialAssetValueAzn - salvageValueAzn);
      depreciationExpense = depreciableBase * (annualDepreciationRatePercent / 100);
      if (currentBookValue - depreciationExpense < salvageValueAzn) {
        depreciationExpense = Math.max(0, currentBookValue - salvageValueAzn);
      }
    } else {
      // Declining balance
      depreciationExpense = currentBookValue * (annualDepreciationRatePercent / 100);
      if (currentBookValue - depreciationExpense < salvageValueAzn) {
        depreciationExpense = Math.max(0, currentBookValue - salvageValueAzn);
      }
    }

    depreciationExpense = Number(depreciationExpense.toFixed(2));
    accumulatedDepreciation = Number((accumulatedDepreciation + depreciationExpense).toFixed(2));
    const endingBookValue = Number(Math.max(salvageValueAzn, startingBookValue - depreciationExpense).toFixed(2));

    // Property Tax (Əmlak vergisi) = 1% on the average annual residual book value
    const avgResidualValue = (startingBookValue + endingBookValue) / 2;
    const annualPropertyTax = Number((avgResidualValue * 0.01).toFixed(2));
    totalPropertyTax = Number((totalPropertyTax + annualPropertyTax).toFixed(2));

    schedule.push({
      year,
      startingBookValueAzn: startingBookValue,
      depreciationExpenseAzn: depreciationExpense,
      accumulatedDepreciationAzn: accumulatedDepreciation,
      endingBookValueAzn: endingBookValue,
      annualPropertyTaxAzn: annualPropertyTax,
    });

    currentBookValue = endingBookValue;
  }

  return {
    initialAssetValueAzn,
    salvageValueAzn,
    usefulLifeYears,
    annualDepreciationRatePercent,
    method,
    schedule,
    totalDepreciationAzn: accumulatedDepreciation,
    totalPropertyTaxAzn: totalPropertyTax,
    legalArticle: 'Vergi Məcəlləsi Maddə 114.3.4 (25% Amortizasiya) & Maddə 198.1 (1% Əmlak Vergisi)',
  };
}

/**
 * Generates an official DVX Electronic Tax Invoice («E-Qaimə-Faktura»)
 */
export function generateTaxInvoice(params: {
  sellerVoen: string;
  sellerName: string;
  buyerVoenOrFin: string;
  buyerName: string;
  buyerType: 'individual' | 'legal_entity';
  vehiclePlate: string;
  vehicleVin: string;
  vehicleMakeModel: string;
  vehicleYear: number;
  engineDisplacementCc: number;
  purchasePriceAzn: number;
  sellingPriceAzn: number;
  currency?: 'AZN' | 'USD' | 'EUR';
}): ElectronicTaxInvoice {
  const {
    sellerVoen,
    sellerName,
    buyerVoenOrFin,
    buyerName,
    buyerType,
    vehiclePlate,
    vehicleVin,
    vehicleMakeModel,
    vehicleYear,
    engineDisplacementCc,
    purchasePriceAzn,
    sellingPriceAzn,
    currency = 'AZN',
  } = params;

  const roadTaxResult = calculateAnnualRoadTax({
    category: 'passenger_car',
    engineDisplacementCc,
  });

  const tradeInResult = calculateTradeInVat({
    purchasePrice: purchasePriceAzn,
    sellingPrice: sellingPriceAzn,
    taxRegime: 'vat_payer',
  });

  const randSuffix = Math.floor(10000 + Math.random() * 90000);
  const invoiceNumber = `DVX-AVT-2026-${randSuffix}`;
  const now = new Date().toISOString();

  // Generate SHA-like verification checksum
  const securityHash = `SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const digitalSignatureUid = `SIMA-ASAN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const qrVerificationCode = `https://e-taxes.gov.az/invoice/verify?doc=${invoiceNumber}&hash=${securityHash}`;

  const totalInvoiceAmountAzn = Number((sellingPriceAzn + roadTaxResult.roadTaxAzn).toFixed(2));

  return {
    id: `inv-${Date.now()}-${randSuffix}`,
    invoiceNumber,
    issueDate: now,
    sellerVoen,
    sellerName,
    buyerVoenOrFin,
    buyerName,
    buyerType,
    vehiclePlate,
    vehicleVin,
    vehicleMakeModel,
    vehicleYear,
    engineDisplacementCc,
    purchasePriceAzn,
    sellingPriceAzn,
    tradeMarginAzn: tradeInResult.tradeMarginAzn,
    annualRoadTaxAzn: roadTaxResult.roadTaxAzn,
    vatAmountAzn: tradeInResult.vatAmountAzn,
    totalInvoiceAmountAzn,
    currency,
    status: 'approved',
    securityHash,
    qrVerificationCode,
    digitalSignatureUid,
  };
}

/**
 * Filter tax offices by search query (name, city, address)
 */
export function filterTaxOffices(
  offices: TaxOffice[],
  searchQuery: string,
  onlyAsan = false
): TaxOffice[] {
  const query = searchQuery.trim().toLowerCase();
  return offices.filter((office) => {
    const matchesSearch =
      !query ||
      office.nameAz.toLowerCase().includes(query) ||
      office.nameEn.toLowerCase().includes(query) ||
      office.cityAz.toLowerCase().includes(query) ||
      office.addressAz.toLowerCase().includes(query);

    const matchesAsan = !onlyAsan || office.isAsanService;

    return matchesSearch && matchesAsan;
  });
}

/**
 * Filter tax invoices by search query (invoice number, plate, VIN, buyer/seller)
 */
export function filterTaxInvoices(
  invoices: ElectronicTaxInvoice[],
  searchQuery: string
): ElectronicTaxInvoice[] {
  const query = searchQuery.trim().toLowerCase();
  if (!query) return invoices;

  return invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(query) ||
      inv.vehicleMakeModel.toLowerCase().includes(query) ||
      inv.vehiclePlate.toLowerCase().includes(query) ||
      inv.vehicleVin.toLowerCase().includes(query) ||
      inv.sellerName.toLowerCase().includes(query) ||
      inv.buyerName.toLowerCase().includes(query) ||
      inv.buyerVoenOrFin.toLowerCase().includes(query)
  );
}

import { Currency, FuelType } from '../types/vehicle';
import {
  CustomsCalculationInput,
  CustomsCostBreakdown,
  ImportComparisonResult,
  OriginCountry,
  OriginPreset,
  QuickImportPreset,
  FuelComparisonScenario,
} from '../types/customs';

export const CURRENT_CALCULATION_YEAR = 2026;

export const DEFAULT_EXCHANGE_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 1.70,
  EUR: 1.85,
};

export const ORIGIN_PRESETS: Record<OriginCountry, OriginPreset> = {
  usa: {
    id: 'usa',
    nameAz: 'ABŞ (Amerika)',
    nameEn: 'United States',
    nameRu: 'США',
    flag: '🇺🇸',
    transitHub: 'Poti / Batumi Port (Gürcüstan)',
    defaultFreightUsd: 2400,
    averageTransitDays: 50,
    popularSource: 'Copart / IAAI / Manheim',
  },
  georgia: {
    id: 'georgia',
    nameAz: 'Gürcüstan (Rustavi)',
    nameEn: 'Georgia',
    nameRu: 'Грузия',
    flag: '🇬🇪',
    transitHub: 'Qırmızı Körpü Gömrük Postu',
    defaultFreightUsd: 450,
    averageTransitDays: 3,
    popularSource: 'Autopapa Rustavi Bazarı',
  },
  germany: {
    id: 'germany',
    nameAz: 'Almaniya (Avropa)',
    nameEn: 'Germany',
    nameRu: 'Германия',
    flag: '🇩🇪',
    transitHub: 'Quru Avtovozla Bakı Gömrüyü',
    defaultFreightUsd: 2200,
    averageTransitDays: 18,
    popularSource: 'Mobile.de / AutoScout24',
  },
  korea: {
    id: 'korea',
    nameAz: 'Cənubi Koreya',
    nameEn: 'South Korea',
    nameRu: 'Южная Корея',
    flag: '🇰🇷',
    transitHub: 'İncheon - Poti - Bakı Konteyner',
    defaultFreightUsd: 2800,
    averageTransitDays: 45,
    popularSource: 'Encar / Autini',
  },
  china: {
    id: 'china',
    nameAz: 'Çin (Xorqos / Dəmir Yolu)',
    nameEn: 'China',
    nameRu: 'Китай',
    flag: '🇨🇳',
    transitHub: 'Xorqos - Aktau / Ələt Limanı',
    defaultFreightUsd: 2300,
    averageTransitDays: 25,
    popularSource: 'Birbaşa İxrac / Distribütor',
  },
  uae: {
    id: 'uae',
    nameAz: 'BƏƏ (Dubay)',
    nameEn: 'UAE (Dubai)',
    nameRu: 'ОАЭ (Дубай)',
    flag: '🇦🇪',
    transitHub: 'Bəndər-Abbas tranziti ilə Bakı',
    defaultFreightUsd: 1600,
    averageTransitDays: 14,
    popularSource: 'Dubai Auto Zone (DAZ / Ras Al Khor)',
  },
};

export const QUICK_VEHICLE_IMPORT_PRESETS: QuickImportPreset[] = [
  {
    id: 'camry-hybrid-2021',
    title: 'Toyota Camry 2.5 Hybrid',
    origin: 'usa',
    year: 2021,
    engineCc: 2487,
    fuelType: 'hybrid',
    estimatedAuctionPriceUsd: 16500,
    bakuMarketPriceAzn: 48500,
    badge: 'Popular Choice',
  },
  {
    id: 'byd-song-ev-2023',
    title: 'BYD Song Plus EV Champion',
    origin: 'china',
    year: 2023,
    engineCc: 0,
    fuelType: 'electric',
    estimatedAuctionPriceUsd: 21500,
    bakuMarketPriceAzn: 49000,
    badge: '0% Gömrük & ƏDV',
  },
  {
    id: 'kia-k5-2020',
    title: 'Kia K5 1.6 T-GDI',
    origin: 'korea',
    year: 2020,
    engineCc: 1598,
    fuelType: 'petrol',
    estimatedAuctionPriceUsd: 13500,
    bakuMarketPriceAzn: 36500,
    badge: 'Qənaətcil Turbo',
  },
  {
    id: 'bmw-530i-2022',
    title: 'BMW 530i 2.0 TwinPower',
    origin: 'germany',
    year: 2022,
    engineCc: 1998,
    fuelType: 'petrol',
    estimatedAuctionPriceUsd: 29500,
    bakuMarketPriceAzn: 82000,
    badge: 'Premium Euro 6',
  },
  {
    id: 'hyundai-elantra-2019',
    title: 'Hyundai Elantra 2.0 MPI',
    origin: 'usa',
    year: 2019,
    engineCc: 1999,
    fuelType: 'petrol',
    estimatedAuctionPriceUsd: 8200,
    bakuMarketPriceAzn: 24500,
    badge: 'Büdcə Klassiki',
  },
  {
    id: 'zeekr-001-2024',
    title: 'Zeekr 001 AWD Long Range',
    origin: 'china',
    year: 2024,
    engineCc: 0,
    fuelType: 'electric',
    estimatedAuctionPriceUsd: 38000,
    bakuMarketPriceAzn: 89000,
    badge: 'Lüks EV',
  },
];

/**
 * Normalizes any supported currency amount to Azerbaijani Manat (AZN)
 */
export function normalizeToAzn(
  amount: number,
  currency: Currency,
  exchangeRates: Partial<Record<Currency, number>> = DEFAULT_EXCHANGE_RATES
): number {
  const rate = exchangeRates[currency] ?? DEFAULT_EXCHANGE_RATES[currency] ?? 1.0;
  return Math.round(amount * rate * 100) / 100;
}

/**
 * Calculates vehicle age in full calendar years based on manufacture year
 */
export function getVehicleAge(
  manufactureYear: number,
  currentYear: number = CURRENT_CALCULATION_YEAR
): number {
  return Math.max(0, currentYear - manufactureYear);
}

/**
 * Determines whether the vehicle qualifies for green privilege exemptions
 * (Under AR Tax Code: EVs are 0% duty/excise/VAT; Hybrids <= 3 years and <= 2500cc are 0% VAT & 0 excise)
 */
export function isEligibleForGreenPrivileges(
  fuelType: FuelType,
  engineCapacityCc: number,
  ageYears: number
): boolean {
  if (fuelType === 'electric') {
    return true;
  }
  if ((fuelType === 'hybrid' || fuelType === 'plug_in_hybrid') && ageYears <= 3 && engineCapacityCc <= 2500) {
    return true;
  }
  return false;
}

/**
 * Calculates Customs Import Duty (İdxal gömrük rüsumu)
 * - EV: 0 AZN
 * - Hybrid <= 3 yrs & <= 2500cc: 0 AZN
 * - General passenger cars: 15% ad-valorem, with specific per-cc minimums based on age and engine size
 */
export function calculateCustomsDuty(
  customsValueAzn: number,
  engineCapacityCc: number,
  fuelType: FuelType,
  ageYears: number,
  usdRate: number = DEFAULT_EXCHANGE_RATES.USD
): number {
  if (fuelType === 'electric') {
    return 0;
  }

  if ((fuelType === 'hybrid' || fuelType === 'plug_in_hybrid') && ageYears <= 3 && engineCapacityCc <= 2500) {
    return 0;
  }

  // Per-cc minimums converted from USD to AZN
  let minRateUsdPerCc = 0.40;
  if (engineCapacityCc > 1500) {
    minRateUsdPerCc = ageYears > 7 ? 1.20 : 0.70;
  }

  const perCcMinimumAzn = engineCapacityCc * minRateUsdPerCc * usdRate;
  const adValoremDutyAzn = customsValueAzn * 0.15;

  const dutyAzn = Math.max(adValoremDutyAzn, perCcMinimumAzn);
  return Math.round(dutyAzn * 100) / 100;
}

/**
 * Calculates Excise Tax (Aksiz vergisi)
 * Governed by Article 190 of the Tax Code of Azerbaijan Republic
 */
export function calculateExciseTax(
  engineCapacityCc: number,
  fuelType: FuelType,
  ageYears: number
): number {
  if (fuelType === 'electric') {
    return 0;
  }

  // Full hybrids and PHEVs with engine capacity <= 2500cc and age <= 3 years are exempt
  if ((fuelType === 'hybrid' || fuelType === 'plug_in_hybrid') && ageYears <= 3 && engineCapacityCc <= 2500) {
    return 0;
  }

  let baseExcise = 0;

  if (engineCapacityCc <= 2000) {
    baseExcise = engineCapacityCc * 0.30;
  } else if (engineCapacityCc <= 3000) {
    baseExcise = 600 + (engineCapacityCc - 2000) * 5.0;
  } else if (engineCapacityCc <= 4000) {
    baseExcise = 5600 + (engineCapacityCc - 3000) * 15.0;
  } else if (engineCapacityCc <= 5000) {
    baseExcise = 20600 + (engineCapacityCc - 4000) * 40.0;
  } else {
    baseExcise = 60600 + (engineCapacityCc - 5000) * 80.0;
  }

  // Diesel coefficient (+20%)
  if (fuelType === 'diesel') {
    baseExcise *= 1.20;
  }

  // Age multiplier (Vehicles older than 7 years have increased excise)
  let ageMultiplier = 1.0;
  if (ageYears > 10) {
    ageMultiplier = 1.50;
  } else if (ageYears > 7) {
    ageMultiplier = 1.20;
  }

  return Math.round(baseExcise * ageMultiplier * 100) / 100;
}

/**
 * Calculates Customs Clearance / Declaration Fee (Gömrük rəsmiləşdirilməsi haqqı)
 */
export function calculateCustomsClearanceFee(customsValueAzn: number): number {
  if (customsValueAzn <= 1000) return 15;
  if (customsValueAzn <= 10000) return 60;
  if (customsValueAzn <= 50000) return 120;
  if (customsValueAzn <= 100000) return 200;
  return 300;
}

/**
 * Calculates Electronic Inspection and Processing Fee (Elektron vəsiqə / xidmət haqqı)
 */
export function calculateElectronicFee(): number {
  return 30; // Standard official DGK electronic certificate fee
}

/**
 * Calculates Vehicle Recycling / Utilization Fee (Utilizasiya haqqı - 2024 Decree)
 */
export function calculateUtilizationFee(ageYears: number, fuelType: FuelType): number {
  if (fuelType === 'electric') {
    return 0;
  }
  if (ageYears <= 3) {
    return 0; // New vehicles up to 3 years are exempt from import recycling levy
  }
  if (ageYears <= 7) {
    return 400; // 4 to 7 years: 400 AZN
  }
  return 700; // Over 7 years: 700 AZN
}

/**
 * Calculates Value Added Tax (18% ƏDV)
 * Applied to: (Customs Value + Customs Duty + Excise Tax)
 * Exemption: 0% for EVs, and Hybrids <= 3 years with engine <= 2500cc
 */
export function calculateVat(
  customsValueAzn: number,
  customsDutyAzn: number,
  exciseTaxAzn: number,
  fuelType: FuelType,
  engineCapacityCc: number,
  ageYears: number
): number {
  if (fuelType === 'electric') {
    return 0;
  }
  if ((fuelType === 'hybrid' || fuelType === 'plug_in_hybrid') && ageYears <= 3 && engineCapacityCc <= 2500) {
    return 0;
  }

  const taxableBase = customsValueAzn + customsDutyAzn + exciseTaxAzn;
  return Math.round(taxableBase * 0.18 * 100) / 100;
}

/**
 * Main Tariff Computation Engine: Calculates the full breakdown of customs import duties and taxes
 */
export function calculateCustomsDuties(
  input: CustomsCalculationInput,
  exchangeRates: Partial<Record<Currency, number>> = DEFAULT_EXCHANGE_RATES
): CustomsCostBreakdown {
  const rates = { ...DEFAULT_EXCHANGE_RATES, ...exchangeRates };
  const origin = ORIGIN_PRESETS[input.originCountry] || ORIGIN_PRESETS.usa;

  const vehiclePriceAzn = normalizeToAzn(input.vehiclePrice, input.currency, rates);
  const freightCostUsd = input.freightCostOverrideUsd !== undefined && input.freightCostOverrideUsd >= 0
    ? input.freightCostOverrideUsd
    : origin.defaultFreightUsd;

  const freightCostAzn = Math.round(freightCostUsd * rates.USD * 100) / 100;
  const customsValueAzn = Math.round((vehiclePriceAzn + freightCostAzn) * 100) / 100;

  const ageYears = getVehicleAge(input.manufactureYear);
  const isElectric = input.fuelType === 'electric';
  const isEligibleHybrid = (input.fuelType === 'hybrid' || input.fuelType === 'plug_in_hybrid') &&
    ageYears <= 3 &&
    input.engineCapacityCc <= 2500;

  const customsDutyAzn = calculateCustomsDuty(
    customsValueAzn,
    input.engineCapacityCc,
    input.fuelType,
    ageYears,
    rates.USD
  );

  const exciseTaxAzn = calculateExciseTax(
    input.engineCapacityCc,
    input.fuelType,
    ageYears
  );

  const vatAzn = calculateVat(
    customsValueAzn,
    customsDutyAzn,
    exciseTaxAzn,
    input.fuelType,
    input.engineCapacityCc,
    ageYears
  );

  const customsClearanceFeeAzn = calculateCustomsClearanceFee(customsValueAzn);
  const electronicFeeAzn = calculateElectronicFee();
  const utilizationFeeAzn = calculateUtilizationFee(ageYears, input.fuelType);

  const totalCustomsDutiesAzn = Math.round(
    (customsDutyAzn + exciseTaxAzn + vatAzn + customsClearanceFeeAzn + electronicFeeAzn + utilizationFeeAzn) * 100
  ) / 100;

  const totalLandedCostAzn = Math.round((customsValueAzn + totalCustomsDutiesAzn) * 100) / 100;

  const effectiveTaxRatePercent = vehiclePriceAzn > 0
    ? Math.round((totalCustomsDutiesAzn / vehiclePriceAzn) * 1000) / 10
    : 0;

  return {
    vehiclePriceAzn,
    freightCostUsd,
    freightCostAzn,
    customsValueAzn,
    vehicleAgeYears: ageYears,
    customsDutyAzn,
    exciseTaxAzn,
    vatAzn,
    customsClearanceFeeAzn,
    electronicFeeAzn,
    utilizationFeeAzn,
    totalCustomsDutiesAzn,
    totalLandedCostAzn,
    effectiveTaxRatePercent,
    isElectricVehicle: isElectric,
    isEligibleHybrid,
    isVatExempt: isElectric || isEligibleHybrid,
    isExciseExempt: isElectric || isEligibleHybrid,
    isCustomsDutyExempt: isElectric || isEligibleHybrid,
  };
}

/**
 * Compares import landed cost vs estimated Baku market price to give net savings
 */
export function compareImportVsLocal(
  landedCostAzn: number,
  estimatedBakuMarketPriceAzn: number
): ImportComparisonResult {
  const netSavingsAzn = Math.round((estimatedBakuMarketPriceAzn - landedCostAzn) * 100) / 100;
  const savingsPercentage = estimatedBakuMarketPriceAzn > 0
    ? Math.round((netSavingsAzn / estimatedBakuMarketPriceAzn) * 1000) / 10
    : 0;

  let recommendation: 'strong_import' | 'moderate_import' | 'buy_local' = 'buy_local';
  if (netSavingsAzn >= 5000 && savingsPercentage >= 12) {
    recommendation = 'strong_import';
  } else if (netSavingsAzn > 1000 && savingsPercentage > 3) {
    recommendation = 'moderate_import';
  }

  return {
    landedCostAzn,
    estimatedBakuMarketPriceAzn,
    netSavingsAzn,
    savingsPercentage,
    recommendation,
  };
}

/**
 * Compares import tariff costs across different powertrain fuel types
 */
export function compareFuelCustomsScenarios(
  baseInput: CustomsCalculationInput,
  exchangeRates: Partial<Record<Currency, number>> = DEFAULT_EXCHANGE_RATES
): FuelComparisonScenario[] {
  const fuels: FuelType[] = ['petrol', 'diesel', 'hybrid', 'electric'];

  const results = fuels.map((f) => {
    const input: CustomsCalculationInput = {
      ...baseInput,
      fuelType: f,
      engineCapacityCc: f === 'electric' ? 0 : baseInput.engineCapacityCc,
    };
    const breakdown = calculateCustomsDuties(input, exchangeRates);
    return { fuel: f, breakdown };
  });

  const petrolDuties = results.find((r) => r.fuel === 'petrol')?.breakdown.totalCustomsDutiesAzn ?? 0;

  return results.map(({ fuel, breakdown }) => {
    let titleAz = 'Benzin';
    let titleEn = 'Petrol / Gasoline';
    let titleRu = 'Бензин';

    if (fuel === 'diesel') {
      titleAz = 'Dizel';
      titleEn = 'Diesel';
      titleRu = 'Дизель';
    } else if (fuel === 'hybrid') {
      titleAz = 'Hibrid (HEV/PHEV)';
      titleEn = 'Hybrid (HEV/PHEV)';
      titleRu = 'Гибрид (HEV/PHEV)';
    } else if (fuel === 'electric') {
      titleAz = 'Elektromobil (EV)';
      titleEn = 'Electric (EV)';
      titleRu = 'Электромобиль (EV)';
    }

    const savings = Math.max(0, Math.round((petrolDuties - breakdown.totalCustomsDutiesAzn) * 100) / 100);

    return {
      fuelType: fuel,
      titleAz,
      titleEn,
      titleRu,
      customsDutiesAzn: breakdown.totalCustomsDutiesAzn,
      totalLandedCostAzn: breakdown.totalLandedCostAzn,
      savingsVsPetrolAzn: savings,
      isGreenAdvantaged: breakdown.isElectricVehicle || breakdown.isEligibleHybrid,
    };
  });
}

/**
 * Formats an official DGK calculation report receipt
 */
export function generateCustomsReceipt(
  breakdown: CustomsCostBreakdown,
  input: CustomsCalculationInput,
  vehicleTitle?: string
): string {
  const dateStr = new Date().toISOString().split('T')[0];
  const origin = ORIGIN_PRESETS[input.originCountry] || ORIGIN_PRESETS.usa;
  const title = vehicleTitle || `İdxal Nəqliyyat Vasitəsi (${input.manufactureYear})`;
  const refCode = `DGK-${Math.abs(input.engineCapacityCc * 13 + input.manufactureYear).toString(36).toUpperCase()}-${dateStr.replace(/-/g, '')}`;

  return `=====================================================
🇦🇿 DÖVLƏT GÖMRÜK KOMİTƏSİ (DGK) TƏRİF HESABATI
Avtonəqliyyat Vasitəsinin İdxal Xərcləri Arayışı
=====================================================
Arayış Nömrəsi : ${refCode}
Tarix          : ${dateStr}
Nəqliyyat      : ${title}
Buraxılış İli  : ${input.manufactureYear} (${breakdown.vehicleAgeYears} il istismar)
Mühərrik Həcmi : ${input.engineCapacityCc > 0 ? input.engineCapacityCc + ' sm³' : '0 sm³ (Elektrik)'}
Yanacaq Növü   : ${input.fuelType.toUpperCase()}
Mənşə Ölkəsi   : ${origin.nameAz}
Tranzit Marşrut: ${origin.transitHub}
-----------------------------------------------------
DƏYƏR STRUKTURU (CIF BAKU):
- Avtomobilin Alış Qiyməti : ₼${breakdown.vehiclePriceAzn.toLocaleString()} (${input.vehiclePrice.toLocaleString()} ${input.currency})
- Nəqliyyat / Çatdırılma   : ₼${breakdown.freightCostAzn.toLocaleString()} ($${breakdown.freightCostUsd.toLocaleString()})
- Ümumi Gömrük Dəyəri (CIF): ₼${breakdown.customsValueAzn.toLocaleString()}
-----------------------------------------------------
GÖMRÜK VƏ VERGİ ÖDƏNİŞLƏRİ:
1. İdxal Gömrük Rüsumu     : ₼${breakdown.customsDutyAzn.toLocaleString()} ${breakdown.isCustomsDutyExempt ? '(0% Yaşıl Güzəşt)' : ''}
2. Aksiz Vergisi (AR VM 190): ₼${breakdown.exciseTaxAzn.toLocaleString()} ${breakdown.isExciseExempt ? '(0% Ekoloji Azad)' : ''}
3. Əlavə Dəyər Vergisi (18%): ₼${breakdown.vatAzn.toLocaleString()} ${breakdown.isVatExempt ? '(0% ƏDV Güzəşti)' : ''}
4. Gömrük Rəsmiləşdirilməsi: ₼${breakdown.customsClearanceFeeAzn.toLocaleString()}
5. Elektron Vəsiqə / Xidmət: ₼${breakdown.electronicFeeAzn.toLocaleString()}
6. Utilizasiya Haqqı (2024): ₼${breakdown.utilizationFeeAzn.toLocaleString()}
-----------------------------------------------------
YEKUN GÖMRÜK XƏRCLƏRİ      : ₼${breakdown.totalCustomsDutiesAzn.toLocaleString()}
BAKIDA TAM MAYA DƏYƏRİ    : ₼${breakdown.totalLandedCostAzn.toLocaleString()}
Effektiv Vergi Yükü        : ${breakdown.effectiveTaxRatePercent}%
${breakdown.isElectricVehicle ? '\nQEYD: Elektromobillər 100% gömrük rüsumu, aksiz və ƏDV-dən azaddır!\n' : ''}
${breakdown.isEligibleHybrid ? '\nQEYD: 3 ilədək və ≤2500 sm³ mühərrikli hibrid avtomobillər ƏDV və aksizdən azaddır!\n' : ''}
=====================================================
AutoNext Pro - Ağıllı Avtomobil Ekosistemi
=====================================================`;
}


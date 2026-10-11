import { Currency } from '../types/vehicle';
import {
  TcoCostCategory,
  TcoOptions,
  TcoReport,
  TcoYearData,
  TcoCategoryBreakdown,
} from '../types/tco';

/**
 * Default Azerbaijani fuel prices in AZN per liter/kWh
 */
export const DEFAULT_FUEL_PRICES: Record<string, number> = {
  petrol: 1.10, // AI-92 / Standard blend
  diesel: 1.00,
  hybrid: 1.10,
  plug_in_hybrid: 1.10,
  electric: 0.12, // AZN per kWh
};

/**
 * Average EV efficiency in kWh per 100km
 */
export const DEFAULT_EV_KWH_PER_100KM = 18;

/**
 * Luxury and high-maintenance brands requiring higher service factor
 */
const LUXURY_MAKES = new Set([
  'bmw',
  'mercedes-benz',
  'mercedes',
  'porsche',
  'audi',
  'land rover',
  'range rover',
  'jaguar',
  'lexus',
]);

/**
 * Highly reliable brands with lower depreciation
 */
const HIGH_RESALE_MAKES = new Set(['toyota', 'lexus', 'honda', 'hyundai', 'kia']);

/**
 * Calculates mandatory CTP (İcbari sığorta) in AZN based on engine volume or electric status.
 */
export function calculateMandatoryInsurance(engineVolumeLiters = 2.0, isElectric = false): number {
  if (isElectric) return 100;
  if (engineVolumeLiters <= 1.5) return 80;
  if (engineVolumeLiters <= 2.5) return 120;
  if (engineVolumeLiters <= 3.5) return 160;
  return 200;
}

/**
 * Calculates annual state road tax and technical inspection fees in AZN.
 */
export function calculateAnnualTaxesAndFees(engineVolumeLiters = 2.0, isElectric = false): number {
  const inspectionFee = 50; // State technical inspection fee
  if (isElectric) {
    return inspectionFee; // EV tax exemption in Azerbaijan
  }
  const engineVolumeCc = Math.round(engineVolumeLiters * 1000);
  const roadTax = Math.round(Math.max(30, (engineVolumeCc / 1000) * 35));
  return inspectionFee + roadTax;
}

/**
 * Calculates annual fuel or electricity costs.
 */
export function calculateAnnualEnergyCost(
  annualMileageKm: number,
  fuelType: string,
  fuelConsumptionLPer100Km: number,
  customFuelPrice?: number
): number {
  if (annualMileageKm <= 0) return 0;

  const isElectric = fuelType === 'electric';
  const unitPrice =
    customFuelPrice ?? DEFAULT_FUEL_PRICES[fuelType] ?? DEFAULT_FUEL_PRICES.petrol;

  if (isElectric) {
    const kwhPer100Km =
      fuelConsumptionLPer100Km > 0 ? fuelConsumptionLPer100Km : DEFAULT_EV_KWH_PER_100KM;
    const totalKwh = (annualMileageKm / 100) * kwhPer100Km;
    return Math.round(totalKwh * unitPrice);
  }

  const consumption = Math.max(0, fuelConsumptionLPer100Km);
  const totalLiters = (annualMileageKm / 100) * consumption;
  return Math.round(totalLiters * unitPrice);
}

/**
 * Comprehensive 5-Year Total Cost of Ownership Forecaster.
 */
export function calculateTcoReport(options: TcoOptions): TcoReport {
  const {
    vehiclePrice,
    annualMileageKm,
    fuelType,
    fuelConsumptionLPer100Km,
    engineVolumeLiters = 2.0,
    isElectric = fuelType === 'electric',
    fuelPricePerLiter,
    includeKasko = false,
    make = '',
    ownershipYears = 5,
  } = options;

  const validPrice = Math.max(0, vehiclePrice);
  const validMileage = Math.max(0, annualMileageKm);
  const normalizedMake = make.trim().toLowerCase();

  // Make adjustment factors
  const isLuxury = LUXURY_MAKES.has(normalizedMake);
  const isHighResale = HIGH_RESALE_MAKES.has(normalizedMake);

  // Baseline depreciation rates per year (1 to 5)
  // Higher resale models depreciate slower, luxury models faster
  const baseDeprecRates = [
    isHighResale ? 0.12 : isLuxury ? 0.18 : 0.15, // Year 1
    0.10, // Year 2
    0.09, // Year 3
    0.08, // Year 4
    0.07, // Year 5
  ];

  const yearlyBreakdown: TcoYearData[] = [];
  let currentValue = validPrice;
  let cumulativeCost = 0;

  const baseFuelCost = calculateAnnualEnergyCost(
    validMileage,
    fuelType,
    fuelConsumptionLPer100Km,
    fuelPricePerLiter
  );

  const mandatoryInsurance = calculateMandatoryInsurance(engineVolumeLiters, isElectric);
  const baseTaxes = calculateAnnualTaxesAndFees(engineVolumeLiters, isElectric);

  // Maintenance baseline: scale with mileage and EV discount
  const baseMileageMaintenance = (validMileage / 1000) * 25; // ~25 AZN per 1,000 km
  const fixedMaintenance = 250;
  let baseMaintenance = fixedMaintenance + baseMileageMaintenance;
  if (isElectric) {
    baseMaintenance *= 0.6; // 40% lower maintenance for electric powertrains
  }
  if (isLuxury) {
    baseMaintenance *= 1.3; // 30% higher parts/labor for luxury cars
  }

  for (let year = 1; year <= 5; year++) {
    const rate = baseDeprecRates[year - 1] ?? 0.07;
    const yearDepreciation = Math.round(currentValue * rate);
    currentValue = Math.max(0, currentValue - yearDepreciation);

    // Kasko is based on current vehicle valuation
    const kaskoCost = includeKasko ? Math.round(currentValue * 0.025) : 0;
    const yearInsurance = mandatoryInsurance + kaskoCost;

    // Maintenance increases as vehicle ages (7% annual escalation)
    const ageMultiplier = Math.pow(1.07, year - 1);
    const yearMaintenance = Math.round(baseMaintenance * ageMultiplier);

    const yearFuel = baseFuelCost;
    const yearTaxes = baseTaxes;

    const totalAnnualCost =
      yearDepreciation + yearFuel + yearInsurance + yearMaintenance + yearTaxes;
    cumulativeCost += totalAnnualCost;

    yearlyBreakdown.push({
      year,
      depreciation: yearDepreciation,
      fuel: yearFuel,
      insurance: yearInsurance,
      maintenance: yearMaintenance,
      taxes: yearTaxes,
      totalAnnualCost,
      cumulativeCost,
      vehicleValueAtYearEnd: currentValue,
    });
  }

  const selectedYears = Math.min(5, Math.max(1, ownershipYears));
  const activeBreakdown = yearlyBreakdown.slice(0, selectedYears);

  // Sum categories over selected ownership duration
  let sumDepreciation = 0;
  let sumFuel = 0;
  let sumInsurance = 0;
  let sumMaintenance = 0;
  let sumTaxes = 0;

  activeBreakdown.forEach((item) => {
    sumDepreciation += item.depreciation;
    sumFuel += item.fuel;
    sumInsurance += item.insurance;
    sumMaintenance += item.maintenance;
    sumTaxes += item.taxes;
  });

  const totalCost = sumDepreciation + sumFuel + sumInsurance + sumMaintenance + sumTaxes;
  const total5YearCost = yearlyBreakdown[4]?.cumulativeCost ?? totalCost;
  const totalMonths = selectedYears * 12;
  const averageMonthlyCost = totalMonths > 0 ? Math.round(totalCost / totalMonths) : 0;
  const totalKm = validMileage * selectedYears;
  const costPerKm = totalKm > 0 ? Math.round((totalCost / totalKm) * 100) / 100 : 0;

  // Find biggest driver
  const rawCategories: { category: TcoCostCategory; amount: number }[] = [
    { category: 'depreciation', amount: sumDepreciation },
    { category: 'fuel', amount: sumFuel },
    { category: 'insurance', amount: sumInsurance },
    { category: 'maintenance', amount: sumMaintenance },
    { category: 'taxes', amount: sumTaxes },
  ];

  const sortedCategories = [...rawCategories].sort((a, b) => b.amount - a.amount);
  const primaryDriver = sortedCategories[0] || { category: 'depreciation', amount: 0 };
  const biggestDriver = {
    category: primaryDriver.category,
    amount: primaryDriver.amount,
    percentage: totalCost > 0 ? Math.round((primaryDriver.amount / totalCost) * 100) : 0,
  };

  const categories: TcoCategoryBreakdown[] = [
    {
      category: 'depreciation',
      totalAmount: sumDepreciation,
      percentage: totalCost > 0 ? Math.round((sumDepreciation / totalCost) * 100) : 0,
      label: 'Dəyər İtkisi (Amortizasiya)',
      color: '#f43f5e', // Rose-500
      bgClass: 'bg-rose-500',
    },
    {
      category: 'fuel',
      totalAmount: sumFuel,
      percentage: totalCost > 0 ? Math.round((sumFuel / totalCost) * 100) : 0,
      label: isElectric ? 'Elektrik Enerjisi' : 'Yanacaq Xərcləri',
      color: '#f59e0b', // Amber-500
      bgClass: 'bg-amber-500',
    },
    {
      category: 'insurance',
      totalAmount: sumInsurance,
      percentage: totalCost > 0 ? Math.round((sumInsurance / totalCost) * 100) : 0,
      label: includeKasko ? 'İcbari & KASKO Sığorta' : 'İcbari Sığorta',
      color: '#3b82f6', // Blue-500
      bgClass: 'bg-blue-500',
    },
    {
      category: 'maintenance',
      totalAmount: sumMaintenance,
      percentage: totalCost > 0 ? Math.round((sumMaintenance / totalCost) * 100) : 0,
      label: 'Servis & Texniki Qulluq',
      color: '#10b981', // Emerald-500
      bgClass: 'bg-emerald-500',
    },
    {
      category: 'taxes',
      totalAmount: sumTaxes,
      percentage: totalCost > 0 ? Math.round((sumTaxes / totalCost) * 100) : 0,
      label: 'Yol Vergisi & Texniki Baxış',
      color: '#8b5cf6', // Violet-500
      bgClass: 'bg-violet-500',
    },
  ];

  const residualValueEnd = activeBreakdown[activeBreakdown.length - 1]?.vehicleValueAtYearEnd ?? validPrice;

  return {
    options,
    yearlyBreakdown,
    totalCost,
    total5YearCost,
    averageMonthlyCost,
    costPerKm,
    biggestDriver,
    categories,
    residualValueEnd,
    totalDepreciation: sumDepreciation,
  };
}

/**
 * Exports TCO report to CSV format for download or copying.
 */
export function exportTcoToCsv(
  report: TcoReport,
  currency: Currency = 'AZN',
  vehicleTitle = 'Avtomobil'
): string {
  const lines: string[] = [];

  lines.push(`Total Cost of Ownership (TCO) Report - ${vehicleTitle}`);
  lines.push(`Valuation Currency: ${currency}`);
  lines.push(`Initial Price: ${report.options.vehiclePrice} ${currency}`);
  lines.push(`Annual Mileage: ${report.options.annualMileageKm} km/year`);
  lines.push(`Fuel Type: ${report.options.fuelType}`);
  lines.push(`KASKO Included: ${report.options.includeKasko ? 'Yes' : 'No'}`);
  lines.push('');

  // Summary Metrics
  lines.push('--- SUMMARY ---');
  lines.push(`Total 5-Year Cost: ${report.total5YearCost} ${currency}`);
  lines.push(`Average Monthly Cost: ${report.averageMonthlyCost} ${currency}/month`);
  lines.push(`Cost Per Km: ${report.costPerKm} ${currency}/km`);
  lines.push(`Estimated 5-Year Residual Value: ${report.residualValueEnd} ${currency}`);
  lines.push(`Primary Cost Driver: ${report.biggestDriver.category} (${report.biggestDriver.percentage}%)`);
  lines.push('');

  // Yearly Matrix
  lines.push('Year,Depreciation,Fuel,Insurance,Maintenance,Taxes,Annual Total,Cumulative Total,Year-End Value');
  report.yearlyBreakdown.forEach((row) => {
    lines.push(
      [
        `Year ${row.year}`,
        row.depreciation,
        row.fuel,
        row.insurance,
        row.maintenance,
        row.taxes,
        row.totalAnnualCost,
        row.cumulativeCost,
        row.vehicleValueAtYearEnd,
      ].join(',')
    );
  });

  return lines.join('\n');
}

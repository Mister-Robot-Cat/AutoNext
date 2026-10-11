import { FuelType } from './vehicle';

export type TcoCostCategory = 'depreciation' | 'fuel' | 'insurance' | 'maintenance' | 'taxes';

export interface TcoYearData {
  year: number; // 1 to 5
  depreciation: number;
  fuel: number;
  insurance: number;
  maintenance: number;
  taxes: number;
  totalAnnualCost: number;
  cumulativeCost: number;
  vehicleValueAtYearEnd: number;
}

export interface TcoOptions {
  vehiclePrice: number;
  annualMileageKm: number;
  fuelType: FuelType;
  fuelConsumptionLPer100Km: number;
  engineVolumeLiters?: number;
  isElectric?: boolean;
  fuelPricePerLiter?: number;
  includeKasko?: boolean;
  make?: string;
  ownershipYears?: number; // 1 to 5, default 5
}

export interface TcoCategoryBreakdown {
  category: TcoCostCategory;
  totalAmount: number;
  percentage: number;
  label: string;
  color: string;
  bgClass: string;
}

export interface TcoReport {
  options: TcoOptions;
  yearlyBreakdown: TcoYearData[];
  totalCost: number; // For the selected ownershipYears
  total5YearCost: number;
  averageMonthlyCost: number;
  costPerKm: number;
  biggestDriver: {
    category: TcoCostCategory;
    amount: number;
    percentage: number;
  };
  categories: TcoCategoryBreakdown[];
  residualValueEnd: number;
  totalDepreciation: number;
}

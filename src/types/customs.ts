import { Currency, FuelType } from './vehicle';

export type OriginCountry = 'usa' | 'georgia' | 'germany' | 'korea' | 'china' | 'uae';

export interface OriginPreset {
  id: OriginCountry;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  flag: string;
  transitHub: string;
  defaultFreightUsd: number;
  averageTransitDays: number;
  popularSource: string;
}

export interface QuickImportPreset {
  id: string;
  title: string;
  origin: OriginCountry;
  year: number;
  engineCc: number;
  fuelType: FuelType;
  estimatedAuctionPriceUsd: number;
  bakuMarketPriceAzn: number;
  badge: string;
}

export interface CustomsCalculationInput {
  vehiclePrice: number;
  currency: Currency;
  originCountry: OriginCountry;
  manufactureYear: number;
  engineCapacityCc: number;
  fuelType: FuelType;
  freightCostOverrideUsd?: number;
}

export interface CustomsCostBreakdown {
  vehiclePriceAzn: number;
  freightCostUsd: number;
  freightCostAzn: number;
  customsValueAzn: number;
  vehicleAgeYears: number;
  customsDutyAzn: number;
  exciseTaxAzn: number;
  vatAzn: number;
  customsClearanceFeeAzn: number;
  electronicFeeAzn: number;
  utilizationFeeAzn: number;
  totalCustomsDutiesAzn: number;
  totalLandedCostAzn: number;
  effectiveTaxRatePercent: number;
  isElectricVehicle: boolean;
  isEligibleHybrid: boolean;
  isVatExempt: boolean;
  isExciseExempt: boolean;
  isCustomsDutyExempt: boolean;
}

export interface ImportComparisonResult {
  landedCostAzn: number;
  estimatedBakuMarketPriceAzn: number;
  netSavingsAzn: number;
  savingsPercentage: number;
  recommendation: 'strong_import' | 'moderate_import' | 'buy_local';
}

export interface FuelComparisonScenario {
  fuelType: FuelType;
  titleAz: string;
  titleEn: string;
  titleRu: string;
  customsDutiesAzn: number;
  totalLandedCostAzn: number;
  savingsVsPetrolAzn: number;
  isGreenAdvantaged: boolean;
}

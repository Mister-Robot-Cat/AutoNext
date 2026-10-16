export type ScrappageVehicleCategory =
  | 'passenger_m1'
  | 'minibus_m2'
  | 'truck_n1'
  | 'heavy_truck_n2_n3'
  | 'bus_m3';

export type CompletenessComponentId =
  | 'body_chassis'
  | 'engine_block'
  | 'transmission_gearbox'
  | 'axles_suspension'
  | 'steering_column'
  | 'wheels_tires'
  | 'battery_electronics'
  | 'catalytic_exhaust'
  | 'seats_dashboard'
  | 'doors_glazing';

export interface CompletenessComponentItem {
  id: CompletenessComponentId;
  name: {
    az: string;
    en: string;
    ru: string;
  };
  weightSharePercent: number;
  isCritical: boolean;
  deductionIfMissingAzn: number;
  materialType:
    | 'ferrous_steel'
    | 'aluminum_alloy'
    | 'copper_electronics'
    | 'precious_catalytic'
    | 'polymers_glass';
}

export interface ScrappageCalculationInput {
  category: ScrappageVehicleCategory;
  manufactureYear: number;
  engineVolumeCc: number;
  fuelType: 'petrol' | 'diesel' | 'hybrid' | 'electric' | 'lpg';
  curbWeightKg: number;
  presentComponentIds: CompletenessComponentId[];
  payoutMode: 'local_car_voucher' | 'cash_lump_sum_70';
  selectedLocalModelId?: string;
}

export interface UtilizationFeeBreakdown {
  currentYear: number;
  vehicleAgeYears: number;
  periodicInspectionFeeAzn: number;
  periodicInspectionTierLabel: {
    az: string;
    en: string;
    ru: string;
  };
  customsImportFeeAzn: number;
  customsImportTierLabel: {
    az: string;
    en: string;
    ru: string;
  };
  isEvExempt: boolean;
  legalCitation: string;
}

export interface ScrappagePayoutResult {
  isEligibleForProgram: boolean;
  ineligibilityReason: {
    az: string;
    en: string;
    ru: string;
  } | null;
  vehicleAgeYears: number;
  baseVoucherAzn: number;
  cashLumpSum70Azn: number;
  completenessScorePercent: number;
  missingCriticalComponents: CompletenessComponentItem[];
  missingNonCriticalComponents: CompletenessComponentItem[];
  deductionTotalAzn: number;
  netVoucherPayoutAzn: number;
  netCashPayoutAzn: number;
  selectedPayoutAzn: number;
  factoryBonusAzn: number;
  totalCombinedDiscountAzn: number;
  localBrandFinalPriceAzn: number | null;
  recyclingRecovery: {
    ferrousSteelKg: number;
    aluminumKg: number;
    copperWiringKg: number;
    polymersGlassKg: number;
    hazardousFluidsLiters: number;
    co2PreventedTonsPerYear: number;
  };
}

export interface LocalManufacturedVehicle {
  id: string;
  make: string;
  model: string;
  assemblyPlant: {
    az: string;
    en: string;
    ru: string;
  };
  retailPriceAzn: number;
  factoryExtraBonusAzn: number;
  engineSpec: string;
  fuelType: 'petrol' | 'hybrid' | 'electric' | 'diesel';
  warrantyYears: number;
  category: ScrappageVehicleCategory;
}

export interface ScrappageCollectionCenter {
  id: string;
  code: string;
  name: {
    az: string;
    en: string;
    ru: string;
  };
  city: string;
  address: {
    az: string;
    en: string;
    ru: string;
  };
  operator: string;
  dailyCapacityVehicles: number;
  currentQueueCount: number;
  waitMinutes: number;
  phone: string;
  workingHours: string;
  hasFreeTowService: boolean;
  certifiedScaleTons: number;
}

export interface ScrappageConfirmationCertificate {
  certificateNumber: string;
  bdypDeregistrationCode: string;
  issueDate: string;
  expiryDate: string;
  applicantFullName: string;
  applicantFin: string;
  vehicleTitle: string;
  vin: string;
  plateNumber: string;
  manufactureYear: number;
  category: ScrappageVehicleCategory;
  centerId: string;
  centerName: string;
  completenessScorePercent: number;
  payoutMode: 'local_car_voucher' | 'cash_lump_sum_70';
  voucherAmountAzn: number;
  cashPayoutAmountAzn: number;
  qrVerificationHash: string;
  status: 'ACTIVE_VOUCHER' | 'REDEEMED_AT_DEALER' | 'CASH_TRANSFERRED';
}

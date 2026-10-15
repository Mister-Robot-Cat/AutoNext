import { Currency } from './vehicle';

export type TaxiEligibilityStatus = 'eligible_new' | 'eligible_grandfathered' | 'non_compliant';

export type TaxiColor = 'white' | 'red' | 'yellow' | 'black' | 'silver' | 'other';

export type TaxiFuelType = 'petrol' | 'diesel' | 'lpg' | 'hybrid' | 'ev';

export type TaxiEquipmentKey =
  | 'air_conditioning'
  | 'abs'
  | 'airbags'
  | 'dual_dashcam'
  | 'pos_terminal'
  | 'taxi_roof_lamp'
  | 'checker_decals';

export interface TaxiEquipmentItem {
  key: TaxiEquipmentKey;
  label: {
    az: string;
    en: string;
    ru: string;
  };
  description: {
    az: string;
    en: string;
    ru: string;
  };
  isMandatory: boolean;
  isInstalled: boolean;
  retrofitCostAzn: number;
}

export type RideHailingPlatformKey = 'bolt' | 'yango' | 'uber' | '189' | 'independent';

export interface RideHailingPlatform {
  id: RideHailingPlatformKey;
  name: string;
  commissionRate: number; // e.g. 0.19 for 19%
  minDriverRating: number;
  description: {
    az: string;
    en: string;
    ru: string;
  };
  supportPhone: string;
  accentColor: string;
}

export interface TaxiComplianceAudit {
  vehicleYear: number;
  vehicleAge: number;
  status: TaxiEligibilityStatus;
  color: TaxiColor;
  isColorCompliant: boolean;
  isAgeCompliant: boolean;
  isEcoCompliant: boolean;
  complianceScore: number; // 0 - 100
  equipment: Record<TaxiEquipmentKey, boolean>;
  missingEquipmentCount: number;
  retrofitCostAzn: number;
  retrofitCostConverted: number;
  statutoryAnnualFeeAzn: number;
  statutoryAnnualFeeConverted: number;
  currency: Currency;
  verdictMessage: {
    az: string;
    en: string;
    ru: string;
  };
  checklist: {
    id: string;
    title: { az: string; en: string; ru: string };
    isMet: boolean;
    mandatory: boolean;
    note?: { az: string; en: string; ru: string };
  }[];
}

export interface AggregatorShiftConfig {
  platform: RideHailingPlatformKey;
  dailyGrossAzn: number;
  workingDaysPerMonth: number;
  dailyKm: number;
  fuelType: TaxiFuelType;
  dailyTrips: number;
}

export interface AggregatorProfitResult {
  dailyGrossAzn: number;
  dailyCommissionAzn: number;
  dailyFuelAzn: number;
  dailyAmortizationAzn: number;
  dailyPassAmortizationAzn: number;
  dailyNetAzn: number;
  monthlyGrossAzn: number;
  monthlyGrossConverted: number;
  monthlyCommissionAzn: number;
  monthlyFuelAzn: number;
  monthlyAmortizationAzn: number;
  monthlyNetAzn: number;
  monthlyNetConverted: number;
  monthlyTripCount: number;
  hourlyWageAzn: number;
  hourlyWageConverted: number;
  ecoSavingVsPetrolMonthAzn: number;
  currency: Currency;
}

export interface AynaTrainingCenter {
  id: string;
  name: {
    az: string;
    en: string;
    ru: string;
  };
  city: string;
  district: string;
  address: string;
  phone: string;
  workingHours: string;
  queueStatus: 'low' | 'moderate' | 'high';
  availableSlots: string[];
  services: {
    az: string;
    en: string;
    ru: string;
  }[];
}

export interface AynaTaxiPass {
  passNumber: string; // e.g. AYNA-TX-2026-88219
  carrierType: 'individual' | 'legal_entity';
  carrierName: string;
  carrierVoen: string;
  driverName: string;
  driverFin: string;
  driverLicense: string;
  plateNumber: string;
  vin: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleColor: string;
  fuelType: TaxiFuelType;
  issueDate: string;
  expiryDate: string;
  validityYears: number; // 1 or 3
  stateDutyAzn: number;
  securityChecksum: string;
  qrVerificationUrl: string;
  status: 'active' | 'suspended' | 'expired';
}

export interface TrainingBooking {
  bookingId: string;
  centerId: string;
  centerName: string;
  applicantName: string;
  applicantFin: string;
  applicantPhone: string;
  date: string;
  timeSlot: string;
  service: string;
  confirmationCode: string;
}

import { FuelType } from './vehicle';

export type BonusMalusClass = number; // 1 to 20

export type RegistrationRegion = 'baku_sumgayit_absheron' | 'ganja_nakhchivan' | 'regions';

export type DriverAgeExpCategory = 'young_novice' | 'standard' | 'experienced';

export type FranchiseAmount = 0 | 100 | 250 | 500 | 1000;

export type KaskoRepairType = 'official_dealer' | 'partner_workshop';

export type InsuranceCompanyId = 'pasha' | 'ateshgah' | 'qala' | 'mega' | 'xalq';

export type KaskoPackageTier = 'eco' | 'standard' | 'vip';

export type KaskoAddonKey = 
  | 'roadside_assistance'
  | 'replacement_vehicle'
  | 'no_police_certificate_glass'
  | 'driver_passenger_accident'
  | 'territory_expansion';

export interface InsuranceCompany {
  id: InsuranceCompanyId;
  name: string;
  shortName: string;
  taglineAz: string;
  taglineEn: string;
  marketShare: number; // percentage, e.g. 36
  financialStrengthRating: string; // e.g. 'A+ Beynəlxalq Reytinq'
  claimSettlementSpeedDays: number;
  claimSatisfactionRate: number; // 0-100%
  customerRating: number; // 1-5
  reviewsCount: number;
  contactPhone: string;
  website: string;
  logoAccentColor: string;
  baseKaskoRatePercent: number; // e.g. 2.4% of car value
  officialDealerSurchargePercent: number; // e.g. 15%
  perksAz: string[];
  perksEn: string[];
  installmentOptions: string[]; // e.g. ['BirBank 12 ay', 'TamKart 12 ay', 'Bolkart 6 ay']
}

export interface InsuranceInputParams {
  vehiclePriceAzn: number;
  engineVolumeLiters: number;
  fuelType: FuelType;
  year: number;
  bonusMalusClass: number; // 1 to 20, default 10
  region: RegistrationRegion;
  driverCategory: DriverAgeExpCategory;
  driverAge: number;
  drivingExperienceYears: number;
  franchise: FranchiseAmount;
  repairType: KaskoRepairType;
  addons: Record<KaskoAddonKey, boolean>;
}

export interface CompulsoryInsuranceBreakdown {
  baseTariffAzn: number;
  engineFactorDescription: string;
  bonusMalusClass: number;
  bonusMalusFactor: number; // 0.50 - 2.45
  regionFactor: number; // 0.95 - 1.10
  driverFactor: number; // 0.95 - 1.35
  propertyDamageLimitAzn: number; // Standard 5,000 AZN
  bodilyInjuryLimitAzn: number; // Standard 50,000 AZN
  finalCompulsoryPremiumAzn: number;
  standardBaselinePremiumAzn: number; // at BM 10
  bonusMalusDiscountAzn: number; // savings or penalty
  isBonusDiscount: boolean;
}

export interface KaskoQuote {
  companyId: InsuranceCompanyId;
  companyName: string;
  tier: KaskoPackageTier;
  tierNameAz: string;
  tierNameEn: string;
  annualPremiumAzn: number;
  monthlyInstallmentAzn: number; // 12-month interest free
  insuredValueAzn: number;
  franchiseAzn: number;
  repairType: KaskoRepairType;
  baseCostAzn: number;
  addonsCostAzn: number;
  discountAzn: number;
  includedFeaturesAz: string[];
  includedFeaturesEn: string[];
  coveredRisksAz: string[];
  coveredRisksEn: string[];
}

export interface CombinedInsuranceSummary {
  compulsory: CompulsoryInsuranceBreakdown;
  kaskoQuotes: KaskoQuote[];
  cheapestQuote: KaskoQuote;
  bestValueQuote: KaskoQuote;
  premiumQuote: KaskoQuote;
}

export interface PolicyApplicationFormData {
  ownerFullName: string;
  ownerFin: string;
  ownerPhone: string;
  ownerEmail?: string;
  plateNumber: string;
  selectedCompanyId: InsuranceCompanyId;
  selectedTier: KaskoPackageTier;
  includeCompulsory: boolean;
  includeKasko: boolean;
  paymentPlan: 'annual' | 'monthly_12';
}

export interface PolicyIssuedCertificate {
  policyNumber: string;
  icbariPolicyNumber?: string;
  kaskoPolicyNumber?: string;
  issueDate: string;
  validUntil: string;
  holderName: string;
  finCode: string;
  phone: string;
  vehicleTitle: string;
  vin: string;
  plateNumber: string;
  insuranceCompanyName: string;
  totalAnnualPremiumAzn: number;
  compulsoryPremiumAzn: number;
  kaskoPremiumAzn: number;
  franchiseAzn: number;
  paymentPlan: 'annual' | 'monthly_12';
  monthlyPaymentAzn?: number;
  status: 'active';
  digitalSignatureId: string;
  qrVerificationCode: string;
}

export interface InsuranceFaqItem {
  id: string;
  questionAz: string;
  questionEn: string;
  questionRu: string;
  answerAz: string;
  answerEn: string;
  answerRu: string;
  category: 'compulsory' | 'kasko' | 'accident_steps' | 'europrotocol';
}

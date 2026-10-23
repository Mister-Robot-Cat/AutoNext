import { Currency } from '../types/vehicle';
import { CURRENCY_RATES, formatPrice } from './i18n';
import {
  RentalFleetVehicle,
  RentalStation,
  RentalCompany,
  RentalInsuranceTier,
  RentalAddon,
  MockActiveRentalContract,
  RENTAL_FLEET_VEHICLES,
  RENTAL_STATIONS,
  RENTAL_COMPANIES,
  RENTAL_INSURANCE_TIERS,
  RENTAL_ADDONS,
  MOCK_ACTIVE_RENTAL_CONTRACTS
} from '../data/mockRentalData';

export interface RentalCalculationParams {
  vehicleId: string;
  durationDays: number;
  pickupStationId: string;
  dropoffStationId: string;
  mileageOption: 'standard' | 'unlimited';
  insuranceTierId: 'basic' | 'medium' | 'premium';
  selectedAddonIds: string[];
  driverAge: number;
  drivingExperienceYears: number;
  isForeigner?: boolean;
  currency?: Currency;
}

export interface RentalEligibility {
  isEligible: boolean;
  ageRequirementMet: boolean;
  experienceRequirementMet: boolean;
  minAgeRequired: number;
  minExperienceRequired: number;
  warnings: string[];
}

export interface RentalCalculationResult {
  vehicle: RentalFleetVehicle;
  pickupStation: RentalStation;
  dropoffStation: RentalStation;
  insuranceTier: RentalInsuranceTier;
  durationDays: number;
  baseDailyRate: number;
  discountPercentage: number;
  discountedDailyRate: number;
  baseRentalTotal: number;
  durationDiscountAmount: number;
  mileageSurchargeTotal: number;
  insuranceDailyFee: number;
  insuranceTotal: number;
  addonsTotal: number;
  addonsBreakdown: { id: string; nameAz: string; costAzn: number }[];
  airportPickupFee: number;
  intercityOneWayFee: number;
  subtotalAzn: number;
  vatAmountAzn: number; // 18% ƏDV
  grandTotalAzn: number;
  securityDepositAzn: number;
  deductibleAzn: number;
  includedKmTotal: number;
  eligibility: RentalEligibility;
  currencyRates: {
    azn: number;
    usd: number;
    eur: number;
  };
  formattedGrandTotal: string;
  formattedDeposit: string;
}

export interface RentalDriverInfo {
  fullName: string;
  finCode: string;
  driverLicenseNumber: string;
  documentType: 'id_card' | 'passport';
  phone: string;
  email: string;
  country: string;
}

export interface RentalContract {
  contractNumber: string;
  securityHash: string;
  issueDate: string;
  company: RentalCompany;
  vehicle: RentalFleetVehicle;
  driver: RentalDriverInfo;
  pickupStation: RentalStation;
  dropoffStation: RentalStation;
  pickupDate: string;
  returnDate: string;
  durationDays: number;
  mileageOption: 'standard' | 'unlimited';
  insuranceTier: RentalInsuranceTier;
  selectedAddons: RentalAddon[];
  financials: {
    baseRentalTotal: number;
    durationDiscountAmount: number;
    mileageSurchargeTotal: number;
    insuranceTotal: number;
    addonsTotal: number;
    airportPickupFee: number;
    intercityOneWayFee: number;
    vatAmountAzn: number;
    grandTotalAzn: number;
    securityDepositAzn: number;
  };
  status: 'reserved' | 'active' | 'returned_pending_fines' | 'completed';
  qrVerificationUrl: string;
}

/**
 * Returns duration discount percentage based on rental length
 * 1-3 days: 0%
 * 4-7 days: 10%
 * 8-14 days: 18%
 * 15-30+ days: 25%
 */
export function getDurationDiscountPercentage(days: number): number {
  if (days >= 15) return 25;
  if (days >= 8) return 18;
  if (days >= 4) return 10;
  return 0;
}

/**
 * Calculates intercity one-way dropoff fee if pickup and return stations are in different cities
 */
export function calculateIntercityDropoffFee(pickupStation: RentalStation, dropoffStation: RentalStation): number {
  if (pickupStation.city !== dropoffStation.city) {
    if (pickupStation.city === 'Bakı' && dropoffStation.city === 'Gəncə') return 80;
    if (pickupStation.city === 'Gəncə' && dropoffStation.city === 'Bakı') return 80;
    if (pickupStation.city === 'Bakı' && dropoffStation.city === 'Qəbələ') return 60;
    if (pickupStation.city === 'Qəbələ' && dropoffStation.city === 'Bakı') return 60;
    return 70;
  }
  return 0;
}

/**
 * Main calculation engine for vehicle rental tariffs and security deposits
 */
export function calculateRentalPrice(params: RentalCalculationParams): RentalCalculationResult {
  const currency = params.currency || 'AZN';
  const vehicle = RENTAL_FLEET_VEHICLES.find((v) => v.id === params.vehicleId) || RENTAL_FLEET_VEHICLES[0];
  const pickupStation = RENTAL_STATIONS.find((s) => s.id === params.pickupStationId) || RENTAL_STATIONS[0];
  const dropoffStation = RENTAL_STATIONS.find((s) => s.id === params.dropoffStationId) || pickupStation;
  const insuranceTier = RENTAL_INSURANCE_TIERS.find((i) => i.id === params.insuranceTierId) || RENTAL_INSURANCE_TIERS[0];

  const durationDays = Math.max(1, Math.round(params.durationDays || 1));
  const baseDailyRate = vehicle.dailyRateAzn;
  const discountPercentage = getDurationDiscountPercentage(durationDays);
  const discountedDailyRate = Math.round(baseDailyRate * (1 - discountPercentage / 100));
  const rawBaseRental = baseDailyRate * durationDays;
  const baseRentalTotal = discountedDailyRate * durationDays;
  const durationDiscountAmount = rawBaseRental - baseRentalTotal;

  // Unlimited mileage option surcharge: +20 AZN/day
  const mileageSurchargeTotal = params.mileageOption === 'unlimited' ? 20 * durationDays : 0;
  const includedKmTotal = params.mileageOption === 'unlimited' ? -1 : 250 * durationDays;

  // Insurance tier calculation
  const insuranceDailyFee = insuranceTier.dailyFeeAzn;
  const insuranceTotal = insuranceDailyFee * durationDays;

  // Addons calculation
  const addonsBreakdown: { id: string; nameAz: string; costAzn: number }[] = [];
  let addonsTotal = 0;

  for (const addonId of params.selectedAddonIds || []) {
    const addon = RENTAL_ADDONS.find((a) => a.id === addonId);
    if (addon) {
      const cost = addon.priceType === 'per_day' ? addon.priceAzn * durationDays : addon.priceAzn;
      addonsTotal += cost;
      addonsBreakdown.push({
        id: addon.id,
        nameAz: addon.nameAz,
        costAzn: cost
      });
    }
  }

  // Airport surcharge & Intercity drop-off fee
  const airportPickupFee = pickupStation.airportSurchargeAzn;
  const intercityOneWayFee = calculateIntercityDropoffFee(pickupStation, dropoffStation);

  // Subtotal, VAT (18%) & Grand total
  const subtotalAzn = baseRentalTotal + mileageSurchargeTotal + insuranceTotal + addonsTotal + airportPickupFee + intercityOneWayFee;
  const vatAmountAzn = Math.round(subtotalAzn * 0.18);
  const grandTotalAzn = subtotalAzn + vatAmountAzn;

  // Security deposit scaled by insurance tier multiplier
  let securityDepositAzn = Math.round(vehicle.securityDepositAzn * insuranceTier.depositMultiplier);
  if (insuranceTier.id === 'premium') {
    securityDepositAzn = Math.min(securityDepositAzn, 100); // capped at 100 AZN symbolic escrow
  }
  const deductibleAzn = insuranceTier.deductibleAzn;

  // Eligibility evaluation
  const driverAge = params.driverAge || 24;
  const drivingExp = params.drivingExperienceYears || 3;
  const ageRequirementMet = driverAge >= vehicle.minAge;
  const experienceRequirementMet = drivingExp >= vehicle.minExperienceYears;
  const warnings: string[] = [];

  if (!ageRequirementMet) {
    warnings.push(`Sürücünün yaşı (${driverAge}) bu model üçün tələb olunan minimum yaşdan (${vehicle.minAge}) azdır.`);
  }
  if (!experienceRequirementMet) {
    warnings.push(`Sürücülük stajı (${drivingExp} il) tələb olunan minimum stajdan (${vehicle.minExperienceYears} il) azdır.`);
  }
  if (params.isForeigner) {
    warnings.push('Əcnəbi vətəndaşlar üçün beynəlxalq sürücülük vəsiqəsi (IDP) və ya notarial tərcümə tələb olunur.');
  }

  const isEligible = ageRequirementMet && experienceRequirementMet;

  // Currency conversions
  const azn = grandTotalAzn;
  const usd = Math.round((grandTotalAzn / CURRENCY_RATES.USD) * 100) / 100;
  const eur = Math.round((grandTotalAzn / CURRENCY_RATES.EUR) * 100) / 100;

  return {
    vehicle,
    pickupStation,
    dropoffStation,
    insuranceTier,
    durationDays,
    baseDailyRate,
    discountPercentage,
    discountedDailyRate,
    baseRentalTotal,
    durationDiscountAmount,
    mileageSurchargeTotal,
    insuranceDailyFee,
    insuranceTotal,
    addonsTotal,
    addonsBreakdown,
    airportPickupFee,
    intercityOneWayFee,
    subtotalAzn,
    vatAmountAzn,
    grandTotalAzn,
    securityDepositAzn,
    deductibleAzn,
    includedKmTotal,
    eligibility: {
      isEligible,
      ageRequirementMet,
      experienceRequirementMet,
      minAgeRequired: vehicle.minAge,
      minExperienceRequired: vehicle.minExperienceYears,
      warnings
    },
    currencyRates: {
      azn,
      usd,
      eur
    },
    formattedGrandTotal: formatPrice(grandTotalAzn, currency),
    formattedDeposit: formatPrice(securityDepositAzn, currency)
  };
}

/**
 * Generates an official rental contract number: CAR-RNT-2026-XXXX
 */
export function generateRentalContractNumber(): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `CAR-RNT-2026-${rand}`;
}

/**
 * Generates a pseudo cryptographic SHA-256 style security hash for verification
 */
export function generateRentalSecurityHash(seed: string): string {
  let hash = 0;
  const fullStr = seed + '_CAR_RENTAL_OFFICIAL_ACRA_2026';
  for (let i = 0; i < fullStr.length; i++) {
    const char = fullStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex}${Math.abs(hash * 31).toString(16).slice(0, 16)}`;
}

/**
 * Builds a formal electronic rental contract object
 */
export function createRentalContract(
  params: RentalCalculationParams,
  driver: RentalDriverInfo,
  companyId?: string
): RentalContract {
  const result = calculateRentalPrice(params);
  const company = RENTAL_COMPANIES.find((c) => c.id === companyId) || RENTAL_COMPANIES[0];
  const contractNumber = generateRentalContractNumber();
  const securityHash = generateRentalSecurityHash(contractNumber + driver.finCode + result.vehicle.plate);

  const today = new Date();
  const issueDate = today.toISOString().split('T')[0];
  const returnDateObj = new Date(today.getTime() + result.durationDays * 24 * 60 * 60 * 1000);
  const returnDate = returnDateObj.toISOString().split('T')[0];

  const selectedAddons = RENTAL_ADDONS.filter((a) => (params.selectedAddonIds || []).includes(a.id));

  return {
    contractNumber,
    securityHash,
    issueDate,
    company,
    vehicle: result.vehicle,
    driver,
    pickupStation: result.pickupStation,
    dropoffStation: result.dropoffStation,
    pickupDate: issueDate,
    returnDate,
    durationDays: result.durationDays,
    mileageOption: params.mileageOption,
    insuranceTier: result.insuranceTier,
    selectedAddons,
    financials: {
      baseRentalTotal: result.baseRentalTotal,
      durationDiscountAmount: result.durationDiscountAmount,
      mileageSurchargeTotal: result.mileageSurchargeTotal,
      insuranceTotal: result.insuranceTotal,
      addonsTotal: result.addonsTotal,
      airportPickupFee: result.airportPickupFee,
      intercityOneWayFee: result.intercityOneWayFee,
      vatAmountAzn: result.vatAmountAzn,
      grandTotalAzn: result.grandTotalAzn,
      securityDepositAzn: result.securityDepositAzn
    },
    status: 'reserved',
    qrVerificationUrl: `https://autonext.az/verify/rental/${contractNumber}?hash=${securityHash.slice(0, 8)}`
  };
}

/**
 * Verifies contract number against mock active contracts or format pattern
 */
export function verifyRentalContractNumber(contractNumber: string): {
  valid: boolean;
  contract?: MockActiveRentalContract;
  error?: string;
} {
  const clean = contractNumber.trim().toUpperCase();
  if (!clean.startsWith('CAR-RNT-2026-')) {
    return {
      valid: false,
      error: 'Müqavilə nömrəsi CAR-RNT-2026-XXXX formatında olmalıdır.'
    };
  }

  const existing = MOCK_ACTIVE_RENTAL_CONTRACTS.find((c) => c.contractNumber === clean);
  if (existing) {
    return {
      valid: true,
      contract: existing
    };
  }

  // Synthesize a valid contract if format matches
  const match = clean.match(/^CAR-RNT-2026-(\d{4})$/);
  if (match) {
    return {
      valid: true,
      contract: {
        contractNumber: clean,
        companyName: 'Hertz Azerbaijan (Silk Way Mobility ASC)',
        vehicleName: 'Hyundai Tucson 2.0 AWD (2024)',
        vehiclePlate: '77-RN-335',
        driverFullName: 'Murad Əliyev',
        driverFin: '5A99214',
        pickupStation: 'Heydər Əliyev Beynəlxalq Hava Limanı (GYD)',
        dropoffStation: 'Heydər Əliyev Beynəlxalq Hava Limanı (GYD)',
        pickupDate: '2026-10-24',
        returnDate: '2026-10-29',
        totalDays: 5,
        grandTotalAzn: 649,
        depositAzn: 500,
        status: 'active',
        securityHash: generateRentalSecurityHash(clean)
      }
    };
  }

  return {
    valid: false,
    error: 'Müqavilə reyestrdə tapılmadı.'
  };
}

import { Currency } from './vehicle';

export type GreenCardZoneId = 
  | 'zone_1_all'           // Bütün Yaşıl Kart Sistemi Ölkələri (Avropa, Türkiyə, və s. - 47 ölkə)
  | 'zone_2_regional'      // Regional: Rusiya, Türkiyə, Gürcüstan, İran, Belarus, Moldova, Ukrayna
  | 'zone_3_georgia_turkey'; // Koridor: Yalnız Gürcüstan və Türkiyə

export type GreenCardVehicleCategory = 
  | 'passenger'   // Minik avtomobili (≤ 9 sərnişin yeri)
  | 'motorcycle'  // Motosiklet və kvadrosikl
  | 'minibus'     // Mikroavtobus (10 - 18 sərnişin yeri)
  | 'truck'       // Yük avtomobili və çəkicilər
  | 'trailer';    // Qoşqu və yaşayış qoşquları (karavan)

export type GreenCardDuration = 
  | '15_days'
  | '1_month'
  | '3_months'
  | '6_months'
  | '1_year';

export type BorderCrossingCountry = 
  | 'georgia'
  | 'russia'
  | 'turkey'
  | 'iran';

export type BorderCrossingStatus = 
  | 'open_smooth'      // Növbəsiz / Sürətli keçid (< 30 dəqiqə)
  | 'open_moderate'    // Normal / Orta növbə (30 - 60 dəqiqə)
  | 'open_congested'   // Sıxlıq / Uzun növbə (> 60 dəqiqə)
  | 'closed_temporary';// Müvəqqəti bağlı / Məhdudiyyətli

export interface BorderCrossingPoint {
  id: string;
  name: string;
  borderCountry: BorderCrossingCountry;
  azerbaijanRegion: string;
  foreignCounterpart: string;
  highwayRoute: string;
  distanceFromBakuKm: number;
  estimatedDriveHours: number;
  status: BorderCrossingStatus;
  averageWaitMinutes: number;
  passengerLanes: number;
  truckLanes: number;
  workingHours: string;
  phone: string;
  features: string[];
  description: {
    az: string;
    en: string;
    ru: string;
  };
}

export interface AuthorizedInsurer {
  id: string;
  name: string;
  shortName: string;
  rating: number;
  reviewCount: number;
  licenseNo: string;
  hotline: string;
  website: string;
  digitalIssuanceTime: string;
  isbMember: boolean;
  colorAccent: string;
}

export interface GreenCardZoneConfig {
  id: GreenCardZoneId;
  name: {
    az: string;
    en: string;
    ru: string;
  };
  description: {
    az: string;
    en: string;
    ru: string;
  };
  countryCodes: string[];
  totalCountries: number;
}

export interface GreenCardCalculationResult {
  category: GreenCardVehicleCategory;
  zone: GreenCardZoneId;
  duration: GreenCardDuration;
  durationDays: number;
  basePriceAzn: number;
  isbCompulsoryLevyAzn: number;
  totalCostAzn: number;
  convertedCost: {
    amount: number;
    currency: Currency;
  };
  validFrom: string;
  validUntil: string;
  coverageCountriesCount: number;
  zoneTitle: string;
  categoryTitle: string;
  durationTitle: string;
}

export interface CrossBorderChecklistItem {
  id: string;
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
  mandatory: boolean;
  category: 'document' | 'vehicle' | 'customs';
  referenceLaw?: string;
}

export interface GreenCardPolicyRecord {
  policyNumber: string;
  barcode: string;
  securityHash: string;
  issueDate: string;
  validFrom: string;
  validUntil: string;
  insurerId: string;
  insurerName: string;
  zoneId: GreenCardZoneId;
  category: GreenCardVehicleCategory;
  duration: GreenCardDuration;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  driverFullName: string;
  driverFin: string;
  passportNumber: string;
  totalCostAzn: number;
  isbBureauId: string;
  status: 'active' | 'expired' | 'pending';
}

export interface BorderTransitDeclaration {
  declarationNumber: string;
  submissionDate: string;
  customsCheckpointId: string;
  customsCheckpointName: string;
  destinationCountry: string;
  purposeOfVisit: 'tourism' | 'business' | 'transit' | 'freight';
  driverFullName: string;
  driverFin: string;
  passportNumber: string;
  plateNumber: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  estimatedReturnDate: string;
  commercialCargo: boolean;
  fuelInTankLiters: number;
  dgkSecurityCode: string;
}

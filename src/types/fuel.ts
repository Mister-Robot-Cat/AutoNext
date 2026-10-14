import { Currency } from './vehicle';

export type FuelGrade = 'ai92' | 'ai95' | 'ai98' | 'diesel' | 'cng' | 'lpg' | 'electric';

export type FuelStationBrand = 'SOCAR' | 'Azpetrol' | 'Lukoil' | 'Toba';

export type StationAmenity = 
  | 'market24' 
  | 'carWash' 
  | 'tireAir' 
  | 'cafe' 
  | 'mosque' 
  | 'atm' 
  | 'evFastCharge' 
  | 'wc';

export interface FuelItem {
  grade: FuelGrade;
  name: string;
  priceAzn: number;
  euroStandard: string;
  inStock: boolean;
}

export interface FuelStation {
  id: string;
  name: string;
  brand: FuelStationBrand;
  address: string;
  district: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  distanceKm?: number;
  isOpen24Hours: boolean;
  phone: string;
  fuels: FuelItem[];
  amenities: StationAmenity[];
  rating: number;
  reviewsCount: number;
  cashbackPartner: string;
  hasTruckHighSpeedPump?: boolean;
}

export interface HighwayRoute {
  id: string;
  name: string;
  from: string;
  to: string;
  distanceKm: number;
  avgSpeedKmH: number;
  estimatedMinutes: number;
  recommendedStationId: string;
  description: string;
}

export interface TripFuelOptions {
  withAC: boolean;
  passengerCount: number;
  cityTrafficRatio: number; // 0 (pure highway) to 1 (heavy stop-and-go)
  cargoWeightKg: number;
}

export interface TripFuelResult {
  litersNeeded: number;
  costAzn: number;
  costTargetCurrency: number;
  fuelGrade: FuelGrade;
  pricePerLiterAzn: number;
  cashbackAmountAzn: number;
  edvRefundAzn: number;
  co2Kg: number;
  stopsNeeded: number;
  effectiveConsumptionLPer100Km: number;
}

export interface FullTankResult {
  missingLiters: number;
  totalCostAzn: number;
  totalCostTargetCurrency: number;
  fullTankRangeKm: number;
  cashbackAzn: number;
  edvRefundAzn: number;
}

export type CashbackProvider = 'birbank' | 'tamkart' | 'leobank' | 'socar_club' | 'azpetrol_red';

export interface FuelVoucher {
  voucherCode: string;
  securityHash: string;
  stationName: string;
  stationBrand: FuelStationBrand;
  stationAddress: string;
  vehicleTitle: string;
  vehiclePlate: string;
  fuelGrade: FuelGrade;
  fuelName: string;
  volumeLiters: number;
  unitPriceAzn: number;
  totalAzn: number;
  vatAmountAzn: number;
  edvRefundAzn: number;
  cashbackAzn: number;
  cashbackProviderName: string;
  dateIso: string;
  qrTelemetry: string;
  currency: Currency;
}

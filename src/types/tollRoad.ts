import { Currency, Vehicle } from './vehicle';

export type TollVehicleCategory = 'passenger_light' | 'medium_truck_bus' | 'heavy_tir_coach';

export type TollPaymentMethod = 'transponder_rfid' | 'qr_epass' | 'cash_card';

export interface TollPlaza {
  id: string;
  name: string;
  nameEn: string;
  nameRu: string;
  kmMarker: number;
  district: string;
  lanesCount: number;
  fastPassLanes: number;
  isBarrierAutomated: boolean;
  speedLimitKmH: number;
  amenities: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  liveStatus: 'optimal' | 'moderate' | 'maintenance';
  avgWaitSeconds: number;
  nearestCity: string;
}

export interface TollRouteCalculation {
  entryPlaza: TollPlaza;
  exitPlaza: TollPlaza;
  distanceKm: number;
  category: TollVehicleCategory;
  paymentMethod: TollPaymentMethod;
  baseRatePerKmAzn: number;
  grossFareAzn: number;
  discountPercentage: number;
  discountAmountAzn: number;
  netFareAzn: number;
  netFareTargetCurrency: number;
  estimatedDurationMinutes: number;
  oldRouteDurationMinutes: number;
  timeSavedMinutes: number;
  fuelSavedLiters: number;
  co2SavedKg: number;
  currency: Currency;
}

export interface TransponderAccount {
  transponderId: string;
  serialNumber: string;
  ownerName: string;
  linkedPlateNumber: string;
  balanceAzn: number;
  status: 'active' | 'low_balance' | 'suspended';
  lastPassageDate?: string;
  autoTopUpEnabled: boolean;
  rfidChipId: string;
}

export interface TollTransitReceipt {
  receiptNumber: string;
  barcode: string;
  securityHash: string;
  entryPlazaName: string;
  exitPlazaName: string;
  distanceKm: number;
  vehiclePlate: string;
  vehicleCategory: TollVehicleCategory;
  paymentMethod: TollPaymentMethod;
  grossFareAzn: number;
  discountAzn: number;
  netFareAzn: number;
  netFareTargetCurrency: number;
  entryTimestamp: string;
  exitTimestamp: string;
  transponderId?: string;
  currency: Currency;
  operatorName: string;
}

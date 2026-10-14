import { Currency } from './vehicle';

export type ParkingZone = 'zone1_center' | 'zone2_inner' | 'zone3_intermediate' | 'zone4_outer';

export type ParkingPaymentMethod = 'sms_1181' | 'azparking_app' | 'm10' | 'birkart' | 'apple_pay';

export interface ParkingLot {
  id: string;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  district: string;
  streetAddress: string;
  zone: ParkingZone;
  zoneCode: string;
  hourlyRateAzn: number;
  totalCapacity: number;
  occupiedSpots: number;
  evChargerSpots: number;
  disabledSpots: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  operatingHours: string;
  hasCctv: boolean;
  indoor: boolean;
}

export interface TariffCalculationOptions {
  zone: ParkingZone;
  durationMinutes: number;
  currency?: Currency;
  isSunday?: boolean;
  isNightWindow?: boolean;
  isElectricVehicle?: boolean;
  hasResidentPermit?: boolean;
}

export interface ParkingTariffResult {
  hourlyRateAzn: number;
  durationMinutes: number;
  chargeableMinutes: number;
  isGracePeriodFree: boolean;
  isSundayFree: boolean;
  isNightFree: boolean;
  isEvExempt: boolean;
  isResidentExempt: boolean;
  discountAzn: number;
  totalAmountAzn: number;
  convertedTotal: number;
  currency: Currency;
  vatAmountAzn: number;
  notes: string[];
}

export interface ActiveParkingSession {
  sessionId: string;
  lotId: string;
  lotName: string;
  zoneCode: string;
  zone: ParkingZone;
  plateNumber: string;
  startTime: string;
  endTime?: string;
  durationMinutes: number;
  totalPaidAzn: number;
  status: 'active' | 'grace_period' | 'completed' | 'expired';
  smsCommand: string;
}

export interface ParkingTicketReceipt {
  ticketId: string;
  barcode: string;
  zoneName: string;
  zoneCode: string;
  street: string;
  plateNumber: string;
  checkInTime: string;
  expiryTime: string;
  durationMinutes: number;
  amountPaidAzn: number;
  currency: Currency;
  amountPaidConverted: number;
  paymentMethod: ParkingPaymentMethod;
  verificationCode: string;
  vehicleType: string;
}

export interface ResidentPermitApplication {
  applicantName: string;
  idPin: string;
  plateNumber: string;
  address: string;
  district: string;
  status: 'eligible' | 'under_review' | 'granted';
  permitNumber?: string;
  validUntil?: string;
}

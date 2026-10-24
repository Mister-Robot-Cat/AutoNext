export type BusClass = 'm3_large_coach' | 'm3_standard' | 'm2_minibus';
export type BusComfortTier = 'standard' | 'comfort_express' | 'vip_business';

export interface BusRoute {
  id: string;
  routeCode: string;
  departureTerminal: string;
  destinationTerminal: string;
  originCity: string;
  destinationCity: string;
  distanceKm: number;
  durationHours: number;
  highwayCorridor: string;
  busModel: string;
  busPlate: string;
  busClass: BusClass;
  comfortTier: BusComfortTier;
  totalSeats: number;
  availableSeats: number;
  operatorName: string;
  operatorVoen: string;
  routePassportNumber: string;
  departureTimes: string[];
  amenities: string[];
  baseFareAzn: number;
}

export interface BusSeat {
  seatNumber: number;
  row: number;
  column: 'A' | 'B' | 'C' | 'D';
  isAvailable: boolean;
  isWindow: boolean;
  isEmergencyExit: boolean;
}

export interface TicketCalculationInput {
  routeId: string;
  comfortTier: BusComfortTier;
  adultsCount: number;
  childrenCount: number;
  infantsCount: number;
  excessLuggageKg: number;
  extraBagsCount: number;
  selectedCurrency: 'AZN' | 'USD' | 'EUR';
}

export interface TicketCalculationResult {
  baseFareAzn: number;
  adultsTotalAzn: number;
  childrenTotalAzn: number;
  infantsTotalAzn: number;
  insuranceFeeAzn: number;
  terminalPlatformFeeAzn: number;
  luggageSurchargeAzn: number;
  subtotalAzn: number;
  totalAzn: number;
  totalUsd: number;
  totalEur: number;
  perPassengerAverageAzn: number;
}

export interface CarrierAuditRule {
  id: string;
  title: string;
  legalBasis: string;
  category: 'technical' | 'safety' | 'driver' | 'station';
  standardRequirement: string;
  penaltyIfNonCompliant: string;
  compliant: boolean;
}

export interface IntercityETicket {
  ticketNumber: string;
  routeCode: string;
  originCity: string;
  destinationCity: string;
  departureTerminal: string;
  arrivalTerminal: string;
  departureDate: string;
  departureTime: string;
  platformNumber: number;
  seatNumber: number;
  passengerName: string;
  passengerFin: string;
  passengerPhone: string;
  busPlate: string;
  busModel: string;
  operatorName: string;
  routePassportNumber: string;
  fareAzn: number;
  insuranceAzn: number;
  terminalFeeAzn: number;
  luggageFeeAzn: number;
  totalAzn: number;
  currency: 'AZN' | 'USD' | 'EUR';
  totalPaidConverted: number;
  securityChecksum: string;
  issuedAt: string;
  qrData: string;
  status: 'active' | 'boarded' | 'completed' | 'cancelled';
}

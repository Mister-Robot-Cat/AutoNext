import { Currency } from './vehicle';

export type ConnectorType = 'ccs2' | 'gbt_dc' | 'type2' | 'chademo' | 'tesla_nacs';

export type ChargingSpeedTier = 'standard_ac' | 'fast_dc' | 'ultra_fast_dc' | 'hyper_charge';

export type ChargingStationStatus = 'available' | 'busy' | 'partially_available' | 'offline';

export type EvOperator = 
  | 'tok_baku' 
  | 'azerishiq_green' 
  | 'socar_green' 
  | 'volt_az' 
  | 'porsche_destination';

export interface StationConnector {
  id: string;
  type: ConnectorType;
  typeName: string;
  maxPowerKw: number;
  availableCount: number;
  totalCount: number;
  pricePerKwhAzn: number;
  parkingFeePerHourAzn: number;
}

export interface ChargingStation {
  id: string;
  name: string;
  operator: EvOperator;
  operatorName: string;
  address: string;
  district: string;
  latitude: number;
  longitude: number;
  distanceKm?: number;
  status: ChargingStationStatus;
  is24Hours: boolean;
  hasAmenities: {
    cafe: boolean;
    restroom: boolean;
    wifi: boolean;
    shopping: boolean;
    parkingFee: boolean;
  };
  connectors: StationConnector[];
  averageRating: number;
  reviewsCount: number;
  verifiedLiveTelemetry: boolean;
  notesAz?: string;
}

export interface EvVehiclePreset {
  id: string;
  modelName: string;
  make: string;
  batteryCapacityKwh: number;
  usableCapacityKwh: number;
  maxDcChargingPowerKw: number;
  maxAcChargingPowerKw: number;
  preferredConnector: ConnectorType;
  efficiencyKwhPer100Km: number;
  wltpRangeKm: number;
  is800VArchitecture: boolean;
}

export interface EvChargingCalculationRequest {
  batteryCapacityKwh: number;
  currentSocPercent: number;
  targetSocPercent: number;
  chargerPowerKw: number;
  maxVehicleAcceptanceKw: number;
  tariffPerKwhAzn: number;
  currency: Currency;
  is800VArchitecture?: boolean;
}

export interface ChargingStageBreakdown {
  socRange: string;
  powerKw: number;
  durationMinutes: number;
  energyKwh: number;
}

export interface EvChargingCalculationResult {
  energyNeededKwh: number;
  estimatedMinutes: number;
  effectiveAveragePowerKw: number;
  addedRangeKm: number;
  costAzn: number;
  costConverted: number;
  petrolSavingsAzn: number;
  co2SavedKg: number;
  chargingStages: ChargingStageBreakdown[];
}

export interface EvRouteStop {
  stationId: string;
  stationName: string;
  location: string;
  arrivalSocPercent: number;
  chargeMinutes: number;
  departureSocPercent: number;
  kwhAdded: number;
}

export interface EvRouteTripPlan {
  routeId: string;
  routeName: string;
  origin: string;
  destination: string;
  distanceKm: number;
  estimatedDriveTimeHours: number;
  requiredEnergyKwh: number;
  canMakeWithoutStop: boolean;
  arrivalSocPercent: number;
  recommendedStops: EvRouteStop[];
}

export interface EvChargingSessionReceipt {
  sessionId: string;
  stationName: string;
  stationAddress: string;
  operatorName: string;
  dateTime: string;
  connectorType: ConnectorType;
  startSoc: number;
  endSoc: number;
  energyDeliveredKwh: number;
  durationMinutes: number;
  maxPowerKw: number;
  averagePowerKw: number;
  subtotalAzn: number;
  vatAzn: number;
  totalAzn: number;
  totalConverted: number;
  currency: Currency;
  authMethod: 'app_wallet' | 'rfid_card' | 'bank_card' | 'apple_pay';
  carPlate: string;
  qrVerificationCode: string;
}

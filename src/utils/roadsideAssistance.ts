import { BodyType, Currency } from '../types/vehicle';
import {
  RoadsideServiceType,
  AssistanceCostBreakdown,
  DepotHub,
  TowTruckFleetItem,
  AssistanceOrder,
} from '../types/roadside';
import {
  ROADSIDE_SERVICES,
  AZERBAIJAN_DISTRICTS,
  FLEET_DEPOTS,
  MOCK_TOW_FLEET,
} from '../data/mockRoadsideData';
import { CURRENCY_RATES, formatPrice } from './i18n';

/**
 * Checks whether a given timestamp or current local time falls into night hours (22:00 - 07:00)
 */
export function isCurrentTimeNight(date: Date = new Date()): boolean {
  const hours = date.getHours();
  return hours >= 22 || hours < 7;
}

/**
 * Body type weight & dimension multipliers for towing operations
 */
export function getBodyTypeMultiplier(serviceType: RoadsideServiceType, bodyType?: BodyType): number {
  if (serviceType !== 'tow_flatbed' && serviceType !== 'tow_heavy_winch' && serviceType !== 'snow_mud_extraction') {
    return 1.0;
  }

  switch (bodyType) {
    case 'suv':
      return 1.2;
    case 'minivan':
    case 'pickup':
      return 1.4;
    case 'sedan':
    case 'hatchback':
    case 'coupe':
    case 'wagon':
    case 'convertible':
    default:
      return 1.0;
  }
}

/**
 * Resolves the nearest depot hub for a given district
 */
export function findNearestDepot(districtId: string): DepotHub {
  const district = AZERBAIJAN_DISTRICTS.find((d) => d.id === districtId);
  if (!district) {
    return FLEET_DEPOTS[0];
  }
  const depot = FLEET_DEPOTS.find((d) => d.id === district.nearestDepoId);
  return depot || FLEET_DEPOTS[0];
}

/**
 * Matches and returns the best available fleet vehicle for a specific roadside emergency
 */
export function findAvailableTruck(
  serviceType: RoadsideServiceType,
  districtId?: string
): TowTruckFleetItem {
  const nearestDepot = districtId ? findNearestDepot(districtId) : FLEET_DEPOTS[0];

  // Preferred truck type according to emergency nature
  let preferredType: TowTruckFleetItem['truckType'] = 'flatbed_slide';
  if (serviceType === 'tow_heavy_winch' || serviceType === 'snow_mud_extraction') {
    preferredType = 'crane_manipulator';
  } else if (
    serviceType === 'battery_jumpstart' ||
    serviceType === 'tire_puncture' ||
    serviceType === 'emergency_fuel' ||
    serviceType === 'car_lockout'
  ) {
    preferredType = 'mobile_service_van';
  }

  // Find in nearest depot first with matching type
  const matchedTruck = MOCK_TOW_FLEET.find(
    (t) => t.status === 'available' && t.currentDepoId === nearestDepot.id && t.truckType === preferredType
  );
  if (matchedTruck) return matchedTruck;

  // Fallback to any available truck matching type
  const anyTypeTruck = MOCK_TOW_FLEET.find(
    (t) => t.status === 'available' && t.truckType === preferredType
  );
  if (anyTypeTruck) return anyTypeTruck;

  // Fallback to any available truck or first in fleet
  return MOCK_TOW_FLEET.find((t) => t.status === 'available') || MOCK_TOW_FLEET[0];
}

/**
 * Calculates estimated arrival minutes based on distance from nearest depot
 */
export function calculateEstimatedArrivalMinutes(distanceKm: number, isNightTime: boolean = false): number {
  const basePrepMin = 6;
  const trafficFactor = isNightTime ? 1.1 : 1.4; // Night is faster traffic
  const drivingMin = Math.round(distanceKm * trafficFactor);
  return Math.max(10, Math.min(90, basePrepMin + drivingMin));
}

export interface CalculateCostParams {
  serviceType: RoadsideServiceType;
  districtId: string;
  bodyType?: BodyType;
  isNightTime?: boolean;
  currency?: Currency;
}

/**
 * Comprehensive cost calculation engine for Azerbaijan roadside assistance (156 Evakuasiya)
 */
export function calculateRoadsideAssistanceCost({
  serviceType,
  districtId,
  bodyType = 'sedan',
  isNightTime = false,
  currency = 'AZN',
}: CalculateCostParams): AssistanceCostBreakdown {
  const service = ROADSIDE_SERVICES.find((s) => s.id === serviceType) || ROADSIDE_SERVICES[0];
  const district = AZERBAIJAN_DISTRICTS.find((d) => d.id === districtId) || AZERBAIJAN_DISTRICTS[0];

  const baseFeeAzn = service.baseCostAzn;
  const distanceKm = district.distanceFromNearestDepotKm;

  // First 8 km included in base callout fee; excess charged per km
  const freeDistanceKm = 8;
  const excessKm = Math.max(0, distanceKm - freeDistanceKm);
  const isTow = serviceType === 'tow_flatbed' || serviceType === 'tow_heavy_winch' || serviceType === 'snow_mud_extraction';
  const perKmRate = isTow ? 1.5 : 1.0;
  const distanceFeeAzn = Math.round(excessKm * perKmRate);

  // Body type multiplier
  const bodyMultiplier = getBodyTypeMultiplier(serviceType, bodyType);
  const bodyMultiplierFeeAzn = Math.round(baseFeeAzn * (bodyMultiplier - 1.0));

  // Night hours surge (22:00 - 07:00, 30% surcharge)
  const nightSurgeMultiplier = isNightTime ? 1.3 : 1.0;
  const subtotalBeforeNight = baseFeeAzn + distanceFeeAzn + bodyMultiplierFeeAzn;
  const nightSurgeFeeAzn = isNightTime ? Math.round(subtotalBeforeNight * 0.3) : 0;

  const totalCostAzn = subtotalBeforeNight + nightSurgeFeeAzn;
  const vatAmountAzn = Number((totalCostAzn * 0.18).toFixed(2));

  let convertedTotal = totalCostAzn;
  if (currency === 'USD') {
    convertedTotal = Math.round(totalCostAzn / CURRENCY_RATES.USD);
  } else if (currency === 'EUR') {
    convertedTotal = Math.round(totalCostAzn / CURRENCY_RATES.EUR);
  }

  return {
    serviceType,
    baseFeeAzn,
    distanceKm,
    distanceFeeAzn,
    bodyMultiplier,
    bodyMultiplierFeeAzn,
    nightSurgeMultiplier,
    nightSurgeFeeAzn,
    vatAmountAzn,
    totalCostAzn,
    convertedTotal,
    currency,
  };
}

/**
 * Generates an official dispatch order reference code (e.g. SOS-156-BAKU-4819)
 */
export function generateDispatchReferenceCode(): string {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `SOS-156-BAKU-${randomSuffix}`;
}

export interface CreateAssistanceOrderParams {
  vehiclePlate: string;
  vehicleTitle: string;
  serviceType: RoadsideServiceType;
  districtId: string;
  locationDetails: string;
  contactName: string;
  contactPhone: string;
  bodyType?: BodyType;
  isNightTime?: boolean;
  currency?: Currency;
  notes?: string;
}

/**
 * Creates a complete dispatch order with assigned truck, reference code, and cost calculation
 */
export function createAssistanceOrder(params: CreateAssistanceOrderParams): AssistanceOrder {
  const district = AZERBAIJAN_DISTRICTS.find((d) => d.id === params.districtId) || AZERBAIJAN_DISTRICTS[0];
  const assignedTruck = findAvailableTruck(params.serviceType, params.districtId);
  const costBreakdown = calculateRoadsideAssistanceCost({
    serviceType: params.serviceType,
    districtId: params.districtId,
    bodyType: params.bodyType,
    isNightTime: params.isNightTime,
    currency: params.currency,
  });

  const estimatedArrivalMinutes = calculateEstimatedArrivalMinutes(
    district.distanceFromNearestDepotKm,
    params.isNightTime
  );

  const now = new Date();
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const orderId = `DISP-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const referenceNumber = generateDispatchReferenceCode();
  const verificationCode = `AZ-156-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    orderId,
    referenceNumber,
    timestamp,
    vehiclePlate: params.vehiclePlate.toUpperCase().trim(),
    vehicleTitle: params.vehicleTitle,
    serviceType: params.serviceType,
    districtId: params.districtId,
    districtName: district.nameAz,
    locationDetails: params.locationDetails,
    contactName: params.contactName,
    contactPhone: params.contactPhone,
    costBreakdown,
    assignedTruck,
    status: 'assigned',
    estimatedArrivalMinutes,
    verificationCode,
    notes: params.notes,
  };
}

/**
 * Formats monetary numbers according to the active currency
 */
export function formatRoadsideAmount(amountAzn: number, currency: Currency): string {
  return formatPrice(amountAzn, currency);
}

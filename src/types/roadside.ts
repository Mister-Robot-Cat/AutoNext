import { BodyType, Currency } from './vehicle';

export type RoadsideServiceType =
  | 'tow_flatbed'
  | 'tow_heavy_winch'
  | 'battery_jumpstart'
  | 'tire_puncture'
  | 'emergency_fuel'
  | 'car_lockout'
  | 'snow_mud_extraction';

export interface ServiceCategoryInfo {
  id: RoadsideServiceType;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  descriptionAz: string;
  descriptionEn: string;
  descriptionRu: string;
  baseCostAzn: number;
  estimatedDurationMin: number;
  equipmentProvidedAz: string[];
  equipmentProvidedEn: string[];
  equipmentProvidedRu: string[];
  icon: string;
  popular?: boolean;
}

export type DistrictRegion =
  | 'baku_central'
  | 'baku_suburbs'
  | 'absheron'
  | 'industrial_south'
  | 'sumgayit_north'
  | 'regional_routes';

export interface DistrictLocation {
  id: string;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  region: DistrictRegion;
  distanceFromNearestDepotKm: number;
  averageResponseTimeMin: number;
  nearestDepoId: string;
}

export type TruckType =
  | 'flatbed_slide'
  | 'crane_manipulator'
  | 'wheel_lift'
  | 'mobile_service_van';

export interface TowTruckFleetItem {
  id: string;
  truckModel: string;
  plateNumber: string;
  truckType: TruckType;
  driverName: string;
  driverPhone: string;
  driverRating: number;
  completedDispatches: number;
  currentDepoId: string;
  status: 'available' | 'on_call' | 'maintenance';
  gpsLocation: {
    lat: number;
    lng: number;
  };
}

export interface DepotHub {
  id: string;
  nameAz: string;
  nameEn: string;
  addressAz: string;
  addressEn: string;
  phone: string;
  totalTrucks: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface AssistanceCostBreakdown {
  serviceType: RoadsideServiceType;
  baseFeeAzn: number;
  distanceKm: number;
  distanceFeeAzn: number;
  bodyMultiplier: number;
  bodyMultiplierFeeAzn: number;
  nightSurgeMultiplier: number;
  nightSurgeFeeAzn: number;
  vatAmountAzn: number; // 18% legal VAT
  totalCostAzn: number;
  convertedTotal: number;
  currency: Currency;
}

export type DispatchStatus =
  | 'pending'
  | 'assigned'
  | 'en_route'
  | 'arriving'
  | 'on_site'
  | 'completed'
  | 'cancelled';

export interface AssistanceOrder {
  orderId: string;
  referenceNumber: string;
  timestamp: string;
  vehiclePlate: string;
  vehicleTitle: string;
  serviceType: RoadsideServiceType;
  districtId: string;
  districtName: string;
  locationDetails: string;
  contactName: string;
  contactPhone: string;
  costBreakdown: AssistanceCostBreakdown;
  assignedTruck: TowTruckFleetItem;
  status: DispatchStatus;
  estimatedArrivalMinutes: number;
  verificationCode: string;
  notes?: string;
}

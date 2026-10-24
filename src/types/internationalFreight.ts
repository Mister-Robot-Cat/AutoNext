export type FreightCargoType =
  | 'general_merchandise'
  | 'perishable_food'
  | 'heavy_machinery'
  | 'pharmaceuticals'
  | 'chemical_adr'
  | 'automotive_parts'
  | 'electronics';

export type DibPermitCategory = 'bilateral' | 'transit' | 'third_country' | 'ecmt_annual';

export type FreightCorridorId =
  | 'middle_corridor_caspian'
  | 'turkey_europe_corridor'
  | 'north_south_instc'
  | 'black_sea_traceca'
  | 'central_asia_silkroad';

export type TransportRegime = 'cmr_standard' | 'tir_carnet_iru' | 'e_cmr_digital';

export interface DibCountryQuota {
  countryCode: string;
  countryNameAz: string;
  countryNameEn: string;
  flagEmoji: string;
  bilateralTotal: number;
  bilateralUsed: number;
  transitTotal: number;
  transitUsed: number;
  thirdCountryTotal: number;
  thirdCountryUsed: number;
  feeAzn: number;
  euroStandardReq: 'Euro-4' | 'Euro-5' | 'Euro-6';
}

export interface FreightCorridor {
  id: FreightCorridorId;
  nameAz: string;
  nameEn: string;
  originAz: string;
  originEn: string;
  destinationAz: string;
  destinationEn: string;
  distanceKm: number;
  avgDurationHours: number;
  borderCrossings: number;
  requiresRoRoFerry: boolean;
  ferryPortName?: string;
  ferryCostUsd?: number;
  requiredDibCountry: string;
  baseFreightRateUsd: number;
  descriptionAz: string;
  descriptionEn: string;
}

export interface CarrierCompany {
  id: string;
  nameAz: string;
  voen: string;
  aynaLicenseNo: string;
  abadaMemberNo: string;
  fleetSize: number;
  rating: number;
  headquarters: string;
  activeTirCarnets: number;
  primaryCorridors: FreightCorridorId[];
}

export interface ActiveFreightConsignment {
  cmrNumber: string;
  tirCarnetNo?: string;
  carrierVoen: string;
  carrierName: string;
  shipper: string;
  consignee: string;
  originCity: string;
  originCountry: string;
  destCity: string;
  destCountry: string;
  cargoType: FreightCargoType;
  cargoDesc: string;
  grossWeightKg: number;
  packageCount: number;
  corridorId: FreightCorridorId;
  tractorPlate: string;
  trailerPlate: string;
  customsSealNo: string;
  status: 'loading' | 'in_transit' | 'at_border_customs' | 'ro_ro_crossing' | 'delivered';
  currentLocation: string;
  eta: string;
  declaredValueUsd: number;
  sdrLiabilityUsd: number;
}

export interface FreightCalculationInput {
  cargoType: FreightCargoType;
  grossWeightKg: number;
  declaredValueUsd: number;
  corridorId: FreightCorridorId;
  transportRegime: TransportRegime;
  useTirCarnet: boolean;
  includeAdrsurcharge: boolean;
  includeTemperatureControl: boolean;
  carrierId: string;
}

export interface FreightCalculationResult {
  baseFreightAzn: number;
  baseFreightUsd: number;
  baseFreightEur: number;
  roRoFerryCostAzn: number;
  roRoFerryCostUsd: number;
  roRoFerryCostEur: number;
  tirCarnetFeeAzn: number;
  tirCarnetFeeUsd: number;
  tirCarnetFeeEur: number;
  surchargesAzn: number;
  surchargesUsd: number;
  surchargesEur: number;
  vatAzn: number;
  vatUsd: number;
  vatEur: number;
  totalFreightAzn: number;
  totalFreightUsd: number;
  totalFreightEur: number;
  sdrRatePerKg: number;
  totalSdrLiability: number;
  sdrLiabilityAzn: number;
  sdrLiabilityUsd: number;
  sdrLiabilityEur: number;
  isLiabilityCappedByDeclaredValue: boolean;
  estimatedTransitDays: number;
  requiredDibCategory: DibPermitCategory;
  carrierComplianceScore: number;
}

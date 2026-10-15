import { Currency } from './vehicle';

export type AccidentScenarioId =
  | 'rear_end'
  | 'roundabout'
  | 'lane_change'
  | 'reversing'
  | 'door_opening'
  | 'red_light_slip'
  | 'intersection_yield'
  | 'sudden_braking_dispute';

export type DamagePartId =
  | 'front_bumper'
  | 'rear_bumper'
  | 'front_headlight_left'
  | 'front_headlight_right'
  | 'rear_taillight_left'
  | 'rear_taillight_right'
  | 'front_fender_left'
  | 'front_fender_right'
  | 'rear_quarter_left'
  | 'rear_quarter_right'
  | 'front_door_left'
  | 'front_door_right'
  | 'rear_door_left'
  | 'rear_door_right'
  | 'side_mirror_left'
  | 'side_mirror_right'
  | 'radiator_grille'
  | 'trunk_lid'
  | 'hood';

export type DamageDegree = 'scratch' | 'dent' | 'replace';

export interface DamageSelection {
  partId: DamagePartId;
  degree: DamageDegree;
  customCostAzn?: number;
}

export type VehicleRole = 'partyA' | 'partyB';

export type FaultAllocation = 'partyA_100' | 'partyB_100' | 'mutual_50_50';

export interface PartyDetails {
  role: VehicleRole;
  driverFullName: string;
  driverLicense: string;
  driverPhone: string;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  insuranceCompany: string;
  policyNumber: string;
  damages: DamageSelection[];
}

export interface EuroprotocolEligibilityCriteria {
  twoVehiclesOnly: boolean;
  noInjuriesOrCasualties: boolean;
  validCompulsoryInsuranceBoth: boolean;
  noThirdPartyPropertyDamage: boolean;
  mutualAgreementOnFault: boolean;
  estimatedUnderLimit: boolean;
}

export interface EuroprotocolScenario {
  id: AccidentScenarioId;
  code: string;
  title: {
    az: string;
    en: string;
    ru: string;
  };
  description: {
    az: string;
    en: string;
    ru: string;
  };
  legalArticle: string;
  defaultFault: FaultAllocation;
  iconName: string;
}

export interface DamageCatalogItem {
  partId: DamagePartId;
  name: {
    az: string;
    en: string;
    ru: string;
  };
  zone: 'front' | 'rear' | 'side_left' | 'side_right';
  costs: {
    scratch: number;
    dent: number;
    replace: number;
  };
}

export interface InsuranceCompanyInfo {
  id: string;
  name: string;
  shortCode: string;
  hotline: string;
  email: string;
  isbRegistered: boolean;
  licenseNumber: string;
}

export interface EuroprotocolClaimRecord {
  protocolNumber: string;
  date: string;
  time: string;
  location: {
    district: string;
    street: string;
    landmark?: string;
  };
  weather: 'clear' | 'rainy' | 'foggy' | 'snowy';
  roadSurface: 'dry' | 'wet' | 'slippery';
  scenarioId: AccidentScenarioId;
  faultAllocation: FaultAllocation;
  partyA: PartyDetails;
  partyB: PartyDetails;
  partyATotalDamageAzn: number;
  partyBTotalDamageAzn: number;
  claimantParty: VehicleRole | 'both';
  eligibleForEuroprotocol: boolean;
  statutoryMaxLimitAzn: number;
  payablePayoutAzn: number;
  excessUncoveredAzn: number;
  payingInsurer: string;
  payoutTermDays: number;
  securityHash: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved';
}

export interface EuroprotocolCalculationResult {
  partyADamageAzn: number;
  partyBDamageAzn: number;
  totalDamageAzn: number;
  faultAllocation: FaultAllocation;
  claimantParty: VehicleRole | 'both';
  statutoryLimitAzn: number;
  payablePayoutAzn: number;
  excessUncoveredAzn: number;
  payingInsurer: string;
  receivingInsurer: string;
  isEligibleDamageLimit: boolean;
  payoutConverted: {
    amount: number;
    currency: Currency;
  };
  legalNote: {
    az: string;
    en: string;
    ru: string;
  };
}

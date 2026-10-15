import { Currency } from './vehicle';

export type PoaScope = 'DRIVING_ONLY' | 'FULL_DISPOSAL';

export type PoaRelationship = 'CLOSE_RELATIVE' | 'THIRD_PARTY';

export type SubDelegationRight = 'NOT_ALLOWED' | 'ALLOWED';

export type CrossBorderRight = 'DOMESTIC_ONLY' | 'CROSS_BORDER_ALLOWED';

export type PoaDurationMonths = 1 | 3 | 6 | 12 | 24 | 36;

export type PoaStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'REVOKED';

export type BdypSyncStatus = 'SYNCED' | 'PENDING' | 'REVOKED';

export interface PartyGrantor {
  fullName: string;
  fin: string;
  idCardSeriesNumber: string;
  phone: string;
  address: string;
}

export interface PartyGrantee {
  fullName: string;
  fin: string;
  idCardSeriesNumber: string;
  driverLicenseSeriesNumber: string;
  driverLicenseCategories: string[];
  phone: string;
  address: string;
}

export interface PoaVehicleInfo {
  plateNumber: string;
  texpasportNumber: string;
  vin: string;
  makeModel: string;
  year: number;
  engineVolumeCc?: number;
  color?: string;
}

export interface PoaFeeBreakdown {
  stateDutyAzn: number;
  notaryServiceFeeAzn: number;
  asanElectronicFeeAzn: number;
  totalAzn: number;
  totalConverted: number;
  currency: Currency;
}

export interface NotaryOffice {
  id: string;
  name: string;
  notaryName: string;
  district: string;
  city: string;
  address: string;
  phone: string;
  workingHours: string;
  isAsan: boolean;
}

export interface PowerOfAttorneyRecord {
  id: string;
  registrationNumber: string;
  issuedDate: string;
  durationMonths: PoaDurationMonths;
  expiryDate: string;
  status: PoaStatus;
  scope: PoaScope;
  relationship: PoaRelationship;
  subDelegation: SubDelegationRight;
  crossBorder: CrossBorderRight;
  grantor: PartyGrantor;
  grantee: PartyGrantee;
  vehicle: PoaVehicleInfo;
  notaryOffice: NotaryOffice;
  fees: PoaFeeBreakdown;
  securityHash: string;
  bdypSyncStatus: BdypSyncStatus;
  revokedAt?: string;
  revocationReason?: string;
}

export interface PoaPersonaPreset {
  id: string;
  label: string;
  description: string;
  scope: PoaScope;
  relationship: PoaRelationship;
  durationMonths: PoaDurationMonths;
  subDelegation: SubDelegationRight;
  crossBorder: CrossBorderRight;
  grantor: PartyGrantor;
  grantee: PartyGrantee;
}

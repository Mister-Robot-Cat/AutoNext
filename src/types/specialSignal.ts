export type SignalColor = 'blue_red' | 'blue' | 'amber' | 'white_strobe';

export type SirenTone = 'wail' | 'yelp' | 'hi_lo' | 'horn' | 'off';

export type OperativeCategory =
  | 'police_bdyp'
  | 'medical_fhn'
  | 'municipal_service'
  | 'cash_transit'
  | 'civilian_unauthorized';

export interface SignalProfile {
  id: string;
  nameAz: string;
  nameEn: string;
  agencyAz: string;
  category: OperativeCategory;
  signalColor: SignalColor;
  allowedSoundSignals: boolean;
  maxDecibels: number;
  priorityStatusAz: string;
  rightOfWayDescriptionAz: string;
  legalBasis: string;
  requiresDinPermit: boolean;
  samplePlate: string;
  vehicleModel: string;
}

export interface SirenHardwareSpec {
  id: string;
  modelName: string;
  manufacturer: string;
  maxOutputWatts: number;
  decibelRating: number; // e.g. 118-124 dBA at 2m
  supportedTones: SirenTone[];
  approvedByAZS: boolean;
  notesAz: string;
}

export interface SignalAuditInput {
  vehiclePlate: string;
  vehicleModel: string;
  operativeCategory: OperativeCategory;
  signalColor: SignalColor;
  hasAudioSiren: boolean;
  sirenDecibels: number;
  hasOfficialDinPermit: boolean;
  permitNumber?: string;
  isStrobeHiddenUnderGrille: boolean;
}

export interface SignalAuditResult {
  isCompliant: boolean;
  legalityLevel: 'authorized' | 'prohibited_civilian' | 'warning_improper_spec';
  statusTitleAz: string;
  statusDescriptionAz: string;
  fineAmountAzn: number; // 0 or 500 - 800 AZN
  confiscationRisk: boolean;
  immediateImpoundRisk: boolean; // IXM Art. 96.1.4
  penaltyPoints: number; // For non-yielding civilians: 3 points
  applicableArticles: string[];
  recommendedActionAz: string;
}

export interface YieldingScenario {
  id: string;
  titleAz: string;
  operativeVehicleType: string;
  civilianActionRequiredAz: string;
  legalSanctionAz: string;
  fineAzn: number;
  penaltyPoints: number;
}

export interface DinPermitRecord {
  permitNumber: string;
  securityHash: string;
  hologramUid: string;
  issueDate: string;
  expiryDate: string;
  vehiclePlate: string;
  vin: string;
  vehicleModel: string;
  agencyNameAz: string;
  category: OperativeCategory;
  authorizedColors: SignalColor[];
  maxSoundDecibels: number;
  chiefInspectorAz: string;
  registryStatus: 'active' | 'revoked' | 'expired';
}

export interface DinCertificationPackage {
  id: string;
  titleAz: string;
  durationAz: string;
  feeAzn: number;
  descriptionAz: string;
  targetCategory: OperativeCategory;
}

export interface TestingCenter {
  id: string;
  nameAz: string;
  addressAz: string;
  city: string;
  phone: string;
  hoursAz: string;
  hasAcousticChamber: boolean;
  hasPhotometricLab: boolean;
  isAvailableToday: boolean;
}

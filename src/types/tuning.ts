export type ModificationCategory =
  | 'autogas'
  | 'body_kit'
  | 'suspension_wheels'
  | 'exhaust_engine'
  | 'offroad_expedition'
  | 'lighting_optics';

export type ModificationLegalStatus =
  | 'factory_exempt'
  | 'requires_texpasport_endorsement'
  | 'prohibited_impound';

export type AutogasSystemType =
  | 'lpg_euro4'
  | 'lpg_direct_injection'
  | 'cng_methane';

export type HeadlightOpticsType =
  | 'oem_led'
  | 'certified_biled_lens'
  | 'uncertified_xenon_halogen';

export interface TuningModificationItem {
  id: string;
  category: ModificationCategory;
  name: {
    az: string;
    en: string;
    ru: string;
  };
  description: {
    az: string;
    en: string;
    ru: string;
  };
  legalStatus: ModificationLegalStatus;
  statutoryCitation: string;
  texpasportNoteAz: string;
  labCertificationFeeAzn: number;
  installationEstimateAzn: number;
  fineRiskAzn: number;
  impoundmentRisk: boolean;
}

export interface TelemetryAuditInput {
  exhaustDecibelDba: number;
  suspensionLiftMm: number;
  wheelSpacerMm: number;
  headlightType: HeadlightOpticsType;
  selectedModificationIds: string[];
}

export interface TuningFeesBreakdown {
  texpasportReplacementFeeAzn: number;
  technicalInspectionFeeAzn: number;
  labExpertiseTotalAzn: number;
  asanServiceCommissionAzn: number;
  totalOfficialFeeAzn: number;
}

export interface TuningComplianceAuditResult {
  overallStatus: 'compliant' | 'endorsement_required' | 'illegal_impound_risk';
  complianceScore: number;
  activeModifications: TuningModificationItem[];
  prohibitedItems: TuningModificationItem[];
  endorsementItems: TuningModificationItem[];
  exemptItems: TuningModificationItem[];
  texpasportEndorsementText: string;
  exhaustStatus: 'normal' | 'sport_legal' | 'illegal_loud';
  suspensionStatus: 'factory' | 'certifiable_lift' | 'illegal_cut_or_extreme';
  spacerStatus: 'compliant' | 'illegal_protrusion';
  lightingStatus: 'compliant' | 'illegal_glare';
  statutoryFineExposureAzn: number;
  impoundRisk: boolean;
  feesBreakdown: TuningFeesBreakdown;
  recommendations: {
    az: string;
    en: string;
    ru: string;
  }[];
}

export interface AutogasSimulationConfig {
  systemType: AutogasSystemType;
  monthlyMileageKm: number;
  petrolConsumptionLPer100Km: number;
  currentPetrolGrade: 'ai92' | 'ai95' | 'ai98';
  includeOfficialTexpasportFee: boolean;
}

export interface AutogasPaybackResult {
  systemType: AutogasSystemType;
  systemName: {
    az: string;
    en: string;
    ru: string;
  };
  equipmentAndInstallCostAzn: number;
  officialRegistrationFeeAzn: number;
  totalUpfrontInvestmentAzn: number;
  monthlyPetrolCostAzn: number;
  monthlyGasCostAzn: number;
  monthlySavingsAzn: number;
  annualSavingsAzn: number;
  paybackMonths: number;
  fiveYearNetProfitAzn: number;
  co2ReductionPercent: number;
  tankInspectionIntervalYears: number;
}

export interface AccreditedLabCenter {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  accreditationCode: string;
  specialties: ModificationCategory[];
  workingHours: string;
  inspectionTimeMinutes: number;
  rating: number;
}

export interface ConstructiveSafetyCertificate {
  certificateNumber: string;
  azsLabProtocolNumber: string;
  issueDate: string;
  validUntil: string;
  ownerName: string;
  ownerFin: string;
  vehicleTitle: string;
  vin: string;
  plateNumber: string;
  accreditedLabName: string;
  approvedModifications: string[];
  texpasportSpecialNotes: string;
  measuredDecibelDba: number;
  suspensionDeltaMm: number;
  totalStateFeePaidAzn: number;
  qrVerificationHash: string;
}

export interface LabBookingConfirmation {
  bookingReference: string;
  labId: string;
  labName: string;
  address: string;
  appointmentDate: string;
  appointmentSlot: string;
  vehiclePlate: string;
  estimatedFeeAzn: number;
}

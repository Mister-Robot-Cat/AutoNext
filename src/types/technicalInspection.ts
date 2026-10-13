export type InspectionValidityStatus = 'valid' | 'expiring_soon' | 'expired' | 'exempt';

export type EmissionStandard = 
  | 'Euro 2' 
  | 'Euro 3' 
  | 'Euro 4' 
  | 'Euro 5' 
  | 'Euro 6' 
  | 'Zero-Emission (EV)';

export type VehicleInspectionCategory = 'passenger' | 'commercial' | 'bus' | 'motorcycle';

export interface BrakeTestResults {
  frontAxleBrakingForceKn: number;
  rearAxleBrakingForceKn: number;
  parkingBrakeForceKn: number;
  brakeEfficiencyPercent: number; // Minimum legal threshold: 50%
  axleImbalancePercent: number; // Maximum allowable: 30%
  status: 'passed' | 'warning' | 'failed';
}

export interface EmissionTestResults {
  emissionStandard: EmissionStandard;
  coPercent: number; // Idle CO (Max legal: 0.3% for modern Euro 5/6)
  hcPpm: number; // Hydrocarbons (Max legal: 100 ppm)
  lambdaRatio: number; // Lambda air-fuel ratio (Legal: 0.97 - 1.03)
  smokeOpacityK: number; // m^-1 for diesel (Max: 1.5)
  co2GramsPerKm: number;
  status: 'passed' | 'warning' | 'failed';
}

export interface SafetyEquipmentCheck {
  firstAidKit: boolean;
  fireExtinguisher: boolean;
  warningTriangle: boolean;
  tyreTreadDepthMm: number; // Minimum legal: 1.6 mm
  headlightAlignment: 'compliant' | 'slight_deflection' | 'misaligned';
  windshieldTintTransparencyPercent: number; // Legal: min 75% front, 70% sides
  suspensionDampingPercent: number;
}

export interface InspectionFeeBreakdown {
  stateDutyAzn: number;
  serviceDiagnosticFeeAzn: number;
  bankProcessingFeeAzn: number;
  totalFeeAzn: number;
  category: VehicleInspectionCategory;
  frequencyYears: number;
  isExempt: boolean;
  frequencyDescriptionAz: string;
  frequencyDescriptionEn: string;
  frequencyDescriptionRu: string;
}

export interface DiagnosticTalon {
  talonNumber: string;
  pinCode: string;
  issuedDate: string;
  expiryDate: string;
  daysRemaining: number;
  status: InspectionValidityStatus;
  inspectorName: string;
  centerId: string;
  centerName: string;
  mileageAtInspectionKm: number;
  overallResult: 'passed' | 'conditional' | 'failed';
  fineRiskAzn: number;
  legalArticleCitation: string;
  brakeTest: BrakeTestResults;
  emissionTest: EmissionTestResults;
  safetyEquipment: SafetyEquipmentCheck;
}

export interface InspectionStation {
  id: string;
  name: string;
  region: string;
  address: string;
  phone: string;
  workingHours: string;
  hasLiveQueue: boolean;
  currentQueueWaitMinutes: number;
  availableSlots: string[];
  lanesCount: number;
}

export interface InspectionAppointment {
  bookingId: string;
  stationId: string;
  stationName: string;
  vehicleVin: string;
  plateNumber: string;
  scheduledDate: string;
  scheduledTime: string;
  applicantName: string;
  applicantPhone: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  qrReferenceCode: string;
  createdAt: string;
}

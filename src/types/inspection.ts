export type InspectionCategory =
  | 'engine_powertrain'
  | 'chassis_suspension'
  | 'brakes_tires'
  | 'obd2_diagnostics'
  | 'exterior_bodywork'
  | 'interior_electronics';

export type InspectionStatus = 'pass' | 'advisory' | 'fail';

export type IssueSeverity = 'none' | 'minor' | 'moderate' | 'critical';

export type DtcSeverity = 'critical' | 'moderate' | 'minor';

export interface InspectionItem {
  id: string;
  category: InspectionCategory;
  title: string;
  description: string;
  status: InspectionStatus;
  severity: IssueSeverity;
  measuredValue?: string;
  standardValue?: string;
  estimatedRepairAzn: number;
  repaired?: boolean;
}

export interface FreezeFrameData {
  rpm: number;
  coolantTempC: number;
  vehicleSpeedKmh: number;
  stftPercent: number;
  ltftPercent: number;
}

export interface DiagnosticTroubleCode {
  code: string;
  system: string;
  title: string;
  description: string;
  severity: DtcSeverity;
  milActive: boolean;
  freezeFrame?: FreezeFrameData;
}

export interface ReadinessMonitor {
  id: string;
  name: string;
  status: 'ready' | 'not_ready' | 'not_supported';
}

export interface LiveSensorData {
  engineRpm: number;
  batteryVoltage: number;
  coolantTempC: number;
  oilPressureBar: number;
  mafFlowRateGps: number;
  intakeAirTempC: number;
}

export type PaintStatus = 'original' | 'repainted' | 'putty_filler';

export interface PaintThicknessPanel {
  panelId: string;
  panelName: string;
  microns: number;
  status: PaintStatus;
  standardRange: string;
}

export type InspectionRecommendation = 'recommended' | 'conditional' | 'avoid';

export interface InspectionReport {
  vehicleVin: string;
  vehicleTitle: string;
  overallScore: number; // 0 - 100
  recommendation: InspectionRecommendation;
  recommendationLabel: string;
  recommendationNotes: string;
  passedCount: number;
  advisoryCount: number;
  failedCount: number;
  totalCount: number;
  categoryScores: Record<InspectionCategory, number>;
  totalEstimatedRepairAzn: number;
  criticalIssuesCount: number;
  items: InspectionItem[];
  dtcCodes: DiagnosticTroubleCode[];
  readinessMonitors: ReadinessMonitor[];
  liveSensors: LiveSensorData;
  paintPanels: PaintThicknessPanel[];
  inspectionDate: string;
  inspectorName: string;
  inspectorBadgeNumber: string;
  inspectionStation: string;
}

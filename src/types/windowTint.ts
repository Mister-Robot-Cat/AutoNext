import { Currency } from './vehicle';

export type GlassZone = 'windshield' | 'frontSide' | 'rearSide' | 'rear';

export type ApplicantType = 'individual' | 'entity';

export type PermitCoverage = 'rear_side_only' | 'all_rear';

export type ComplianceStatus = 'compliant' | 'warning_seasonal' | 'violation';

export interface ZoneCompliance {
  zone: GlassZone;
  label: {
    az: string;
    en: string;
    ru: string;
  };
  vlt: number; // Visible Light Transmission % (0-100)
  minRequiredVlt: number;
  status: ComplianceStatus;
  message: {
    az: string;
    en: string;
    ru: string;
  };
  isPermitCovered: boolean;
  isSeasonalPermitted: boolean;
}

export interface WindowTintConfig {
  windshieldVlt: number; // 75-100% statutory legal
  frontSideVlt: number; // 70-100% statutory legal
  rearSideVlt: number; // 60-100% without permit, 0-100% with permit
  rearVlt: number; // 50-100% without permit, 0-100% with permit
  hasPermit: boolean;
  permitCoverage?: PermitCoverage;
  hasFactoryCurtains?: boolean;
  hasAthermalFilm?: boolean;
}

export interface OverallComplianceReport {
  isCompliant: boolean;
  overallStatus: ComplianceStatus;
  zones: ZoneCompliance[];
  fineRiskAzn: number;
  penaltyArticle: string;
  recommendations: {
    az: string;
    en: string;
    ru: string;
  }[];
  isSeasonalActive: boolean;
}

export interface PermitCostBreakdown {
  applicantType: ApplicantType;
  coverage: PermitCoverage;
  stateDutyAzn: number;
  serviceFeeAzn: number;
  totalAzn: number;
  totalConverted: number;
  currency: Currency;
  validityMonths: number;
}

export interface PhotometerReading {
  zone: GlassZone;
  measuredVlt: number;
  ambientLux: number;
  marginOfError: number;
  timestamp: string;
  operatorId: string;
  status: ComplianceStatus;
}

export interface TintPermitCertificate {
  permitNumber: string;
  issueDate: string;
  expiryDate: string;
  plateNumber: string;
  vin: string;
  ownerName: string;
  ownerPin: string;
  applicantType: ApplicantType;
  coverage: PermitCoverage;
  feeAzn: number;
  securityHash: string;
  qrCodeUrl: string;
  status: 'active' | 'expired';
}

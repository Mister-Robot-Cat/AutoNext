export type LienStatus = 'clean' | 'pledged_active' | 'pledged_discharged';

export type LegalRestrictionType =
  | 'none'
  | 'court_enforcement'
  | 'tax_arrest'
  | 'alimony_restriction'
  | 'customs_hold';

export type PoliceSearchStatus = 'clear' | 'stolen_wanted' | 'investigation_hold';

export interface RegistryRecord {
  vin: string;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  engineNumber: string;
  chassisNumber: string;
  ownerFullName: string;
  registrationCity: string;
  policeStatus: PoliceSearchStatus;
  policeRecordDate?: string;
  lienStatus: LienStatus;
  lienCreditor?: string;
  lienAmountAzn?: number;
  lienContractNumber?: string;
  lienRegistrationDate?: string;
  legalRestriction: LegalRestrictionType;
  enforcementAgency?: string;
  unpaidFinesCount: number;
  unpaidFinesAmountAzn: number;
  lastInspectionDate: string;
}

export interface SecurityGateChecks {
  stolenCheckPassed: boolean;
  lienCheckPassed: boolean;
  courtCheckPassed: boolean;
  finesCheckPassed: boolean;
}

export type RegistryVerdict = 'clean_title' | 'caution_advisory' | 'blocked_critical';

export interface VerificationResult {
  query: string;
  queryType: 'vin' | 'plate';
  found: boolean;
  record: RegistryRecord | null;
  safetyScore: number;
  verdict: RegistryVerdict;
  verdictTitleAz: string;
  verdictTitleEn: string;
  verdictTitleRu: string;
  verdictDescriptionAz: string;
  verdictDescriptionEn: string;
  verdictDescriptionRu: string;
  checks: SecurityGateChecks;
  verifiedAt: string;
  certificateId: string;
}

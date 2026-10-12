import { Language } from './vehicle';

export type AsanVerificationStatus = 'verified' | 'pending' | 'unverified';
export type DypRegistrationMatch = 'owner_matched' | 'attorney_valid' | 'mismatch';
export type BiometricStatus = 'verified' | 'unverified';
export type LegalCheckStatus = 'clean' | 'minor_fines' | 'encumbered';
export type SellerTrustLevel = 'elite_dealer' | 'verified_owner' | 'standard_seller' | 'unverified';

export interface SellerIdentityDossier {
  sellerId: string;
  fullName: string;
  sellerType: 'private' | 'official_dealer' | 'autocenter';
  finCodeMasked: string; // e.g. "7A***9C"
  asanLoginVerified: boolean;
  asanVerificationDate?: string;
  dypTexpasportMatch: DypRegistrationMatch;
  dypOwnerName: string;
  texpasportSeriesNumber: string; // e.g. "AA 123456"
  biometricVerified: boolean;
  phoneVerified: boolean;
  legalStatus: LegalCheckStatus;
  hasActiveEnforcement: boolean; // No judicial bailiff enforcement
  hasPoliceWantedCheck: boolean; // DİN axtarış təmizdir
  trustScore: number; // 0 to 100
  trustLevel: SellerTrustLevel;
  totalDealsCompleted: number;
  disputeRatePercent: number;
  memberSinceYear: number;
  city: string;
}

export type EscrowStatus = 
  | 'DRAFT'
  | 'FUNDS_LOCKED'
  | 'INSPECTION_PENDING'
  | 'INSPECTION_PASSED'
  | 'INSPECTION_FAILED'
  | 'NOTARY_PENDING'
  | 'RELEASED'
  | 'REFUNDED'
  | 'DISPUTED';

export type EscrowBankPartner = 'kapital_bank' | 'abb' | 'pasha_bank';
export type EscrowFeePayer = 'buyer' | 'seller' | 'split';

export interface EscrowBankInfo {
  id: EscrowBankPartner;
  name: string;
  shortName: string;
  serviceTitleAz: string;
  serviceTitleEn: string;
  serviceTitleRu: string;
  trustRating: string;
  licensedBy: string;
  escrowFeePercent: number; // e.g. 0.5%
  minFeeAzn: number;
  maxFeeAzn: number;
  instantRefundSupported: boolean;
  logoBg: string;
}

export interface EscrowTimelineEvent {
  id: string;
  timestamp: string;
  stage: EscrowStatus;
  titleAz: string;
  titleEn: string;
  titleRu: string;
  descriptionAz: string;
  descriptionEn: string;
  descriptionRu: string;
  actor: 'buyer' | 'seller' | 'bank' | 'expert' | 'notary' | 'arbitrator';
}

export interface EscrowContingencyRules {
  structuralDefectRefund: boolean; // Frame/chassis damage > threshold => 100% refund
  odometerTamperingRefund: boolean; // Clocked odometer => 100% refund
  lienClearanceRequired: boolean; // Free of liens / encumbrances
  maxInspectionHours: number; // e.g. 48 hours
  notaryDeadlineDays: number; // e.g. 5 days
}

export interface EscrowFeeBreakdown {
  feeAzn: number;
  buyerPaysAzn: number;
  sellerPaysAzn: number;
  totalBuyerPaymentAzn: number;
  netSellerPayoutAzn: number;
}

export interface EscrowDepositAgreement {
  escrowId: string;
  vehicleId: string;
  vehicleTitle: string;
  vehicleVin: string;
  vehiclePriceAzn: number;
  depositAmountAzn: number;
  feePayer: EscrowFeePayer;
  feeBreakdown: EscrowFeeBreakdown;
  totalBuyerPaymentAzn: number;
  netSellerPayoutAzn: number;
  bankPartner: EscrowBankPartner;
  status: EscrowStatus;
  createdAt: string;
  inspectionDeadline: string;
  notaryDeadline: string;
  sellerDossier: SellerIdentityDossier;
  contingencyRules: EscrowContingencyRules;
  timeline: EscrowTimelineEvent[];
  securityReleaseCode: string; // 6-digit PIN e.g. "849201"
  disputeNotes?: string;
  inspectionNotes?: string;
}

export type EscrowActionType = 
  | 'LOCK_FUNDS'
  | 'PASS_INSPECTION'
  | 'FAIL_INSPECTION'
  | 'CONFIRM_NOTARY'
  | 'REQUEST_REFUND'
  | 'RAISE_DISPUTE'
  | 'RESOLVE_DISPUTE';

export interface EscrowActionPayload {
  action: EscrowActionType;
  pinCode?: string;
  reason?: string;
  notes?: string;
  arbitrationResolution?: 'RELEASE_TO_SELLER' | 'REFUND_TO_BUYER';
}

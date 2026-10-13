export type PlateOptionType = 'keep_current' | 'new_standard' | 'vip_combination';

export type VipPlateTier = 
  | 'standard' 
  | 'mirror' 
  | 'double' 
  | 'triple' 
  | 'prestige_gold' 
  | 'elite_twin';

export interface PlateDetails {
  regionCode: string;
  letters: string;
  numbers: string;
  fullPlate: string;
  tier: VipPlateTier;
  tierNameAz: string;
  tierNameEn: string;
  tierNameRu: string;
  surchargeAzn: number;
}

export interface TransferDutyBreakdown {
  certificateFeeAzn: number;
  urgentProcessingSurchargeAzn: number;
  plateFeeAzn: number;
  engineDisplacementFeeAzn: number;
  isGreenExemptionApplied: boolean;
  technicalCheckTallyAzn: number;
  notaryArchiveRecordAzn: number;
  bankCommissionAzn: number;
  totalAzn: number;
  totalUsd: number;
  totalEur: number;
}

export interface DocumentChecklistStatus {
  techPassportOriginal: boolean;
  purchaseContract: boolean;
  buyerIdCard: boolean;
  compulsoryInsurance: boolean;
  inspectionTally: boolean;
  dutyReceipt: boolean;
}

export interface RegistrationDivision {
  id: string;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  region: string;
  address: string;
  hours: string;
  phone: string;
  availableSlots: string[];
  counterCount: number;
  avgWaitMinutes: number;
}

export interface RegistrationAppointment {
  voucherId: string;
  qrCodeData: string;
  vehicleVin: string;
  vehicleTitle: string;
  buyerFullName: string;
  buyerFinCode: string;
  buyerPhone: string;
  divisionId: string;
  divisionName: string;
  appointmentDate: string;
  appointmentTime: string;
  plateOption: PlateOptionType;
  targetPlate: string;
  totalFeeAzn: number;
  totalFeeFormatted: string;
  isUrgent: boolean;
  generatedAt: string;
}

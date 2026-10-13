export type RecallSeverity = 'critical' | 'high' | 'medium' | 'low';

export type RecallStatus =
  | 'open_action_required'
  | 'remedy_scheduled'
  | 'remedy_completed'
  | 'not_affected';

export type RecallCategory =
  | 'airbag'
  | 'brakes'
  | 'powertrain'
  | 'electrical_battery'
  | 'steering_suspension'
  | 'fuel_system'
  | 'software';

export interface RecallCampaign {
  id: string;
  campaignId: string;
  bulletinCode: string; // e.g. NHTSA-23V450, KBA-012948, EU-SG-2023-88
  category: RecallCategory;
  severity: RecallSeverity;
  titleAz: string;
  titleEn: string;
  titleRu: string;
  descriptionAz: string;
  descriptionEn: string;
  descriptionRu: string;
  consequenceAz: string;
  consequenceEn: string;
  consequenceRu: string;
  remedyAz: string;
  remedyEn: string;
  remedyRu: string;
  announcementDate: string;
  estimatedLaborHours: number;
  partsRequired: string[];
  isFreeDealerService: boolean;
  status: RecallStatus;
  completedDate?: string;
  completedWorkshop?: string;
  technicianNotes?: string;
  certificateNumber?: string;
}

export interface AuthorizedServiceCenter {
  id: string;
  name: string;
  officialBrand: string;
  address: string;
  city: string;
  phone: string;
  workingHours: string;
  availableSlots: string[];
  offersLoanerCar: boolean;
  rating: number;
  reviewCount: number;
}

export interface VehicleRecallReport {
  vin: string;
  make: string;
  model: string;
  year: number;
  overallStatus: 'safe' | 'action_required' | 'critical_hazard';
  safetyScore: number; // 0 - 100 (100 = completely clean / safe)
  activeRecallsCount: number;
  completedRecallsCount: number;
  totalCampaignsCount: number;
  campaigns: RecallCampaign[];
  lastCheckedDate: string;
  verificationHash: string;
}

export interface RecallAppointmentBooking {
  appointmentId: string;
  campaignId: string;
  campaignTitle: string;
  vin: string;
  vehicleTitle: string;
  serviceCenterId: string;
  serviceCenterName: string;
  serviceCenterAddress: string;
  serviceCenterPhone: string;
  date: string;
  timeSlot: string;
  ownerName: string;
  ownerPhone: string;
  requiresLoanerCar: boolean;
  notes?: string;
  confirmedAt: string;
}

export interface RecallClearanceCertificate {
  certificateId: string;
  vin: string;
  vehicleTitle: string;
  vehicleYear: number;
  issueDate: string;
  expiryDate: string;
  issuerAuthority: string;
  accreditationStandard: string;
  safetyScore: number;
  safetyStatusAz: string;
  safetyStatusEn: string;
  safetyStatusRu: string;
  openCampaignsCount: number;
  completedCampaignsCount: number;
  verificationCode: string;
  digitalSignature: string;
}

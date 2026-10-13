export type ServiceRecordCategory =
  | 'oil_filter'
  | 'brakes'
  | 'engine_transmission'
  | 'suspension_steering'
  | 'fluids_coolant'
  | 'electrical_battery'
  | 'tires_wheels'
  | 'inspection_diagnostics';

export type ServiceUrgencyStatus = 'overdue' | 'due_soon' | 'upcoming' | 'completed';

export type ServiceImportance = 'critical' | 'recommended' | 'preventive';

export type WorkshopType = 'official_dealer' | 'certified_independent' | 'specialized_tuner';

export interface ServiceRecord {
  id: string;
  vehicleVin: string;
  date: string;
  mileageKm: number;
  category: ServiceRecordCategory;
  serviceTitleAz: string;
  serviceTitleEn: string;
  serviceTitleRu: string;
  workshopName: string;
  workshopType: WorkshopType;
  costAzn: number;
  performedOperations: string[];
  replacedParts: string[];
  technicianNotes?: string;
  verifiedStamp: boolean;
  invoiceNumber: string;
}

export interface ScheduledMaintenanceItem {
  id: string;
  category: ServiceRecordCategory;
  titleAz: string;
  titleEn: string;
  titleRu: string;
  descriptionAz: string;
  descriptionEn: string;
  descriptionRu: string;
  intervalKm: number;
  intervalMonths: number;
  lastPerformedKm: number;
  nextDueKm: number;
  remainingKm: number;
  urgency: ServiceUrgencyStatus;
  importance: ServiceImportance;
  dealerEstimatedCostAzn: number;
  independentEstimatedCostAzn: number;
  partsList: string[];
  estimatedHours: number;
}

export interface ServicePassportSummary {
  vehicleVin: string;
  overallHealthScore: number; // 0 - 100
  serviceComplianceRate: number; // 0 - 100%
  totalHistoricalSpentAzn: number;
  upcomingEstimatedSpentAzn: number;
  verifiedDealerRecordsCount: number;
  totalRecordsCount: number;
  lastServiceDate?: string;
  lastServiceMileageKm?: number;
  overdueCount: number;
  dueSoonCount: number;
  upcomingCount: number;
  oilLifePercentage: number;
  brakeLifePercentage: number;
  batteryHealthPercentage: number;
}

export interface WorkshopPartner {
  id: string;
  name: string;
  type: WorkshopType;
  location: string;
  phone: string;
  rating: number;
  reviewsCount: number;
  officialBrands: string[];
  discountPercentForAutoNext: number;
}

export interface ServiceFilterOptions {
  category?: ServiceRecordCategory | 'all';
  workshopType?: WorkshopType | 'all';
  onlyVerifiedStamps?: boolean;
  searchQuery?: string;
}

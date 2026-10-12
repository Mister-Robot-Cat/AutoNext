export type ContractRelationship = 'unrelated' | 'close_relative';

export type PaymentMethod = 'cash' | 'bank_transfer' | 'escrow';

export interface ContractParty {
  fullName: string;
  idSeries: string; // e.g. 'AZE', 'AA'
  idNumber: string; // e.g. '12345678'
  finCode: string; // 7 chars, e.g. '5JK7B2L'
  address: string;
  phone: string;
  isIndividual: boolean;
  taxId?: string; // VÖEN if corporate/dealer
}

export interface ContractVehicle {
  make: string;
  model: string;
  year: number;
  vin: string;
  plateNumber: string;
  engineNumber: string;
  engineVolumeLiters: number;
  chassisNumber: string;
  bodyType: string;
  color: string;
  techPassportSeries: string; // e.g. 'AA'
  techPassportNumber: string; // e.g. '987654'
  registrationDate: string;
}

export interface ContractFinancials {
  priceAzn: number;
  depositAzn: number;
  paymentMethod: PaymentMethod;
  bankName?: string;
  ibanOrAccount?: string;
}

export interface NotaryOffice {
  id: string;
  nameAz: string;
  nameEn: string;
  districtAz: string;
  notaryName: string;
  address: string;
}

export interface ClosingCostsBreakdown {
  notaryDutyAzn: number;
  notaryServiceFeeAzn: number;
  bdypiTechPassportDutyAzn: number;
  bdypiPlateDutyAzn: number;
  bdypiInspectionDutyAzn: number;
  insuranceTransferFeeAzn: number;
  totalStateDutyAzn: number;
  totalNotaryFeesAzn: number;
  totalBdypiFeesAzn: number;
  grandTotalAzn: number;
  relativeDiscountApplied: boolean;
  relativeSavingsAzn: number;
}

export interface ContractMetadata {
  contractNumber: string;
  date: string;
  city: string;
  notaryOfficeId: string;
  notaryName: string;
  registryNumber: string;
  retainPlate: boolean;
  relationship: ContractRelationship;
}

export interface ContractFormData {
  seller: ContractParty;
  buyer: ContractParty;
  vehicle: ContractVehicle;
  financials: ContractFinancials;
  metadata: ContractMetadata;
}

export interface ContractValidationErrors {
  seller?: Partial<Record<keyof ContractParty, string>>;
  buyer?: Partial<Record<keyof ContractParty, string>>;
  vehicle?: Partial<Record<keyof ContractVehicle, string>>;
  financials?: Partial<Record<keyof ContractFinancials, string>>;
}

export interface GeneratedLegalDocument {
  documentId: string;
  azText: string;
  enText: string;
  titleAz: string;
  titleEn: string;
  generatedDate: string;
}

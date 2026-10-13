import { Currency } from './vehicle';

export type FineStatus = 'unpaid' | 'paid' | 'overdue' | 'disputed';

export type FineCategory = 
  | 'speeding'
  | 'traffic_light'
  | 'lane_marking'
  | 'seatbelt_phone'
  | 'illegal_parking'
  | 'no_inspection'
  | 'no_insurance';

export interface CameraTelemetry {
  lane: number;
  confidence: number;
  timestampFormatted: string;
  detectedSpeed?: number;
  speedLimit?: number;
}

export interface ViolationProtocol {
  protocolNumber: string;
  date: string;
  plateNumber: string;
  texpasportSeries?: string;
  category: FineCategory;
  legalArticle: string;
  titleAz: string;
  titleEn: string;
  titleRu: string;
  descriptionAz: string;
  descriptionEn: string;
  descriptionRu: string;
  location: string;
  radarModel?: string;
  speedRecordedKmh?: number;
  speedLimitKmh?: number;
  amountAzn: number;
  penaltyPoints: number;
  issuedAt: string;
  discountDeadline: string;
  discountPercent: number;
  status: FineStatus;
  paidAt?: string;
  paymentChannel?: string;
  paymentReceiptId?: string;
  hasPhoto: boolean;
  cameraTelemetry?: CameraTelemetry;
}

export type PointsRiskLevel = 'safe' | 'warning' | 'critical' | 'suspended';

export interface DriverPointsSummary {
  totalActivePoints: number;
  maxAllowedPoints: number;
  riskLevel: PointsRiskLevel;
  remainingPointsBeforeSuspension: number;
  warningMessageAz: string;
  warningMessageEn: string;
  warningMessageRu: string;
}

export interface FineCalculationSummary {
  totalProtocols: number;
  unpaidProtocols: number;
  paidProtocols: number;
  totalOriginalAmountAzn: number;
  totalDiscountedAmountAzn: number;
  totalSavingsAzn: number;
  totalPoints: number;
  convertedTotalAmount: number;
  convertedDiscountedAmount: number;
  convertedSavings: number;
  currency: Currency;
}

export type PaymentMethodType = 'AsanPay' | 'HÖP' | 'BankCard';

export interface FinePaymentReceipt {
  receiptNumber: string;
  protocolNumbers: string[];
  plateNumber: string;
  paidAmountAzn: number;
  paidAmountConverted: number;
  currency: Currency;
  paymentDate: string;
  transactionReference: string;
  paymentMethod: PaymentMethodType;
  payerFullName: string;
  status: 'completed';
}

export interface ClearanceCertificate {
  certificateNumber: string;
  plateNumber: string;
  vin?: string;
  ownerName?: string;
  issueDate: string;
  validUntil: string;
  securityHash: string;
  issuingAuthority: string;
  isClean: boolean;
}

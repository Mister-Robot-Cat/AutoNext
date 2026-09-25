export type FuelType = 'petrol' | 'diesel' | 'hybrid' | 'plug_in_hybrid' | 'electric';
export type TransmissionType = 'automatic' | 'manual' | 'robot' | 'variator';
export type DrivetrainType = 'fwd' | 'rwd' | 'awd' | '4wd';
export type BodyType = 'sedan' | 'suv' | 'coupe' | 'hatchback' | 'wagon' | 'convertible' | 'pickup' | 'minivan';

export type PriceStatus = 'great_deal' | 'good_deal' | 'fair_price' | 'overpriced';

export interface MarketPriceValuation {
  status: PriceStatus;
  percentageDiff: number; // e.g. -8 means 8% below market
  avgMarketPriceAzn: number;
  minMarketPriceAzn: number;
  maxMarketPriceAzn: number;
  confidenceScore: number; // 0 - 100%
  priceHistoryTrend: { month: string; avgPrice: number }[];
}

export type DamageSeverity = 'none' | 'cosmetic_paint' | 'repaired' | 'replaced' | 'damaged';

export interface CarDamagePart {
  partId: 'hood' | 'roof' | 'front_bumper' | 'rear_bumper' | 'front_left_door' | 'front_right_door' | 'rear_left_door' | 'rear_right_door' | 'trunk' | 'left_fender' | 'right_fender';
  partName: string;
  severity: DamageSeverity;
  notes?: string;
}

export interface SellerInfo {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  type: 'private' | 'official_dealer' | 'autocenter';
  rating: number; // 1-5
  reviewsCount: number;
  verifiedIdentity: boolean;
  memberSinceYear: number;
  city: string;
  avatarUrl?: string;
}

export interface Vehicle {
  id: string;
  title: string;
  vin: string;
  make: string;
  model: string;
  generation?: string;
  year: number;
  priceAzn: number;
  mileageKm: number;
  engineVolumeLiters: number;
  fuelType: FuelType;
  transmission: TransmissionType;
  drivetrain: DrivetrainType;
  powerHp: number;
  fuelConsumptionLPer100Km: number;
  bodyType: BodyType;
  color: string;
  interiorColor: string;
  interiorMaterial: 'leather' | 'alcantara' | 'cloth';
  city: string;
  images: string[];
  features: string[];
  damageReport: CarDamagePart[];
  valuation: MarketPriceValuation;
  seller: SellerInfo;
  isFeatured?: boolean;
  isVerified?: boolean;
  hasCustomsCleared: boolean; // Barter / Kredit / Gömrük
  isCreditAvailable: boolean;
  isBarterAvailable: boolean;
  publishedDate: string;
  viewsCount: number;
  description: string;
}

export interface FilterState {
  searchQuery: string;
  make: string;
  model: string;
  minPrice: number;
  maxPrice: number;
  minYear: number;
  maxYear: number;
  bodyType: BodyType | 'all';
  fuelType: FuelType | 'all';
  transmission: TransmissionType | 'all';
  drivetrain: DrivetrainType | 'all';
  city: string;
  verifiedOnly: boolean;
  greatDealOnly: boolean;
  creditOnly: boolean;
  barterOnly: boolean;
  sortBy: 'recommended' | 'price_asc' | 'price_desc' | 'date_desc' | 'mileage_asc' | 'year_desc';
}

export type Currency = 'AZN' | 'USD' | 'EUR';
export type Language = 'az' | 'en' | 'ru';

export interface BankLoanProgram {
  bankName: string;
  logo: string;
  minDownPaymentPercent: number;
  maxTermMonths: number;
  annualInterestRate: number; // e.g. 14%
  commissionPercent: number;
}

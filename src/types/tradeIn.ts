export type VehicleConditionTier = 'excellent' | 'good' | 'fair' | 'poor';

export type PaintAccidentStatus = 'clean' | 'minor_cosmetic' | 'accident_repaired';

export type ServiceHistoryTier = 'dealer_certified' | 'regular_service' | 'partial_unknown';

export interface TradeInAdjustmentItem {
  id: string;
  label: string;
  amountAzn: number;
  percentage: number;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface TradeInInputs {
  make: string;
  model: string;
  year: number;
  mileageKm: number;
  condition: VehicleConditionTier;
  accidentStatus: PaintAccidentStatus;
  serviceHistory: ServiceHistoryTier;
  estimatedMarketBaseAzn?: number;
  existingLoanBalanceAzn: number;
  targetVehiclePriceAzn?: number;
}

export interface TradeInValuationResult {
  baseMarketValueAzn: number;
  tradeInOfferAzn: number;
  tradeInMinAzn: number;
  tradeInMaxAzn: number;
  instantCashOfferAzn: number;
  privateSaleEstimatedAzn: number;
  dealershipBonusAzn: number;
  effectiveTradeInCreditAzn: number;
  existingLoanBalanceAzn: number;
  netTradeInEquityAzn: number;
  targetVehiclePriceAzn: number;
  netDifferenceToPayAzn: number;
  adjustments: TradeInAdjustmentItem[];
  conditionMultiplier: number;
  mileageDeltaKm: number;
  confidenceScore: number;
}

export interface TradeInPreset {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  mileageKm: number;
  baseMarketPriceAzn: number;
  condition: VehicleConditionTier;
  accidentStatus: PaintAccidentStatus;
  serviceHistory: ServiceHistoryTier;
}

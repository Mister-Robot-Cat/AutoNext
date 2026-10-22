/**
 * Official State Property Issues Service (Əmlak Məsələləri Dövlət Xidməti),
 * Judicial Enforcement (Məhkəmə İcraçıları) & State Customs Committee (DGK)
 * Vehicle Auction Engine, Guarantee Deposit & Bid Settlement Calculations.
 *
 * Statutory Legal Foundations:
 * 1. Law of the Republic of Azerbaijan "On the Privatization of State Property" ("Dövlət əmlakının özəlləşdirilməsi haqqında" AR Qanunu).
 * 2. Law of the Republic of Azerbaijan "On Execution" ("İcra haqqında" AR Qanunu, Article 52 — Seized vehicle auctions).
 * 3. Customs Code of the Republic of Azerbaijan (Gömrük Məcəlləsi, Articles 245-250 — Forfeited goods auction).
 * 4. Tax Code of the Republic of Azerbaijan (Vergi Məcəlləsi — Auction VAT and registration fees).
 */

export type AuctionLotCategory =
  | 'state_surplus'
  | 'court_enforcement'
  | 'customs_confiscated'
  | 'bank_repossession';

export type AuctionLotStatus = 'upcoming' | 'live' | 'completed' | 'awarded';

export interface AuctionBid {
  id: string;
  bidderId: string;
  bidderName: string;
  amountAZN: number;
  timestamp: string;
  isUser: boolean;
}

export interface AuctionInspectionSite {
  id: string;
  nameAz: string;
  region: string;
  address: string;
  contactPhone: string;
  visitingHours: string;
  totalLotsCount: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface AuctionLot {
  id: string;
  lotNumber: string;
  titleAz: string;
  category: AuctionLotCategory;
  categoryLabelAz: string;
  status: AuctionLotStatus;
  year: number;
  mileageKm: number;
  engineCc: number;
  fuelType: string;
  transmission: string;
  plateNumber: string;
  vin: string;
  startingPriceAZN: number;
  currentBidAZN: number;
  minStepAZN: number;
  guaranteeDepositAZN: number;
  inspectionSiteId: string;
  inspectionSiteName: string;
  auctionDate: string;
  auctionTime: string;
  conditionScore: number; // 1 to 10
  defectSummaryAz: string;
  sourceAuthorityAz: string;
  legalBasisCitationAz: string;
  bidsHistory: AuctionBid[];
  imageUrl: string;
}

export interface AuctionFinancials {
  startingPriceAZN: number;
  currentBidAZN: number;
  guaranteeDepositAZN: number;
  minStepAZN: number;
  operatorCommissionAZN: number; // 0.5% State Property Service platform commission
  vatAmountAZN: number; // 18% VAT on commission
  remainingBalanceAZN: number; // Amount to pay within 10 banking days (winning bid - deposit)
  totalCostAZN: number; // winning bid + commission + VAT
  amountInSelectedCurrency: {
    startingPrice: number;
    currentBid: number;
    guaranteeDeposit: number;
    operatorCommission: number;
    totalCost: number;
    remainingBalance: number;
  };
}

export interface AuctionWinnerProtocol {
  protocolNumber: string; // e.g. "ƏMLAK-HRC-2026-84912"
  lotId: string;
  lotNumber: string;
  vehicleTitle: string;
  vin: string;
  plateNumber: string;
  category: AuctionLotCategory;
  winnerFullName: string;
  winnerFin: string;
  winnerPhone: string;
  winningBidAZN: number;
  guaranteeDepositPaidAZN: number;
  operatorCommissionAZN: number;
  totalPayableAZN: number;
  remainingDueAZN: number;
  paymentDeadlineDays: number;
  paymentDueDate: string;
  issuedAt: string;
  qrHash: string;
  securityChecksum: string;
  bdypClearanceNoteAz: string;
  status: 'valid' | 'revoked' | 'settled';
}

// Exchange rates relative to AZN
export const AUCTION_CURRENCY_RATES = {
  AZN: 1.0,
  USD: 1.7,
  EUR: 1.85,
} as const;

export type AuctionCurrency = 'AZN' | 'USD' | 'EUR';

/**
 * Calculates statutory 5% guarantee deposit required to participate in state auctions.
 * Under Presidential Decree No. 583 & Law on State Property Privatization.
 */
export function calculateGuaranteeDeposit(startingPriceAZN: number): number {
  if (startingPriceAZN <= 0) return 0;
  // 5% refundable guarantee deposit
  return Math.round(startingPriceAZN * 0.05);
}

/**
 * Calculates standard minimum auction bid step.
 * Typically 1% to 2% of starting price, minimum 100 AZN.
 */
export function calculateMinBidStep(startingPriceAZN: number): number {
  if (startingPriceAZN <= 0) return 100;
  const standardStep = Math.round(startingPriceAZN * 0.01);
  return Math.max(100, Math.ceil(standardStep / 50) * 50);
}

/**
 * Calculates full financial breakdown for auction participation and winning settlement.
 */
export function calculateAuctionFinancials(
  startingPriceAZN: number,
  currentBidAZN: number,
  currency: AuctionCurrency = 'AZN'
): AuctionFinancials {
  const deposit = calculateGuaranteeDeposit(startingPriceAZN);
  const minStep = calculateMinBidStep(startingPriceAZN);
  const effectiveBid = Math.max(startingPriceAZN, currentBidAZN);

  // 0.5% State Property Service platform operating commission
  const commission = Math.round(effectiveBid * 0.005);
  // 18% VAT applied on the platform commission fee
  const vat = Math.round(commission * 0.18);
  // Remaining payment due: winning bid minus already deposited guarantee
  const remaining = Math.max(0, effectiveBid - deposit);
  // Total cost incurred by winning buyer
  const total = effectiveBid + commission + vat;

  const rate = AUCTION_CURRENCY_RATES[currency] || 1.0;

  return {
    startingPriceAZN,
    currentBidAZN: effectiveBid,
    guaranteeDepositAZN: deposit,
    minStepAZN: minStep,
    operatorCommissionAZN: commission,
    vatAmountAZN: vat,
    remainingBalanceAZN: remaining,
    totalCostAZN: total,
    amountInSelectedCurrency: {
      startingPrice: Number((startingPriceAZN / rate).toFixed(2)),
      currentBid: Number((effectiveBid / rate).toFixed(2)),
      guaranteeDeposit: Number((deposit / rate).toFixed(2)),
      operatorCommission: Number((commission / rate).toFixed(2)),
      totalCost: Number((total / rate).toFixed(2)),
      remainingBalance: Number((remaining / rate).toFixed(2)),
    },
  };
}

/**
 * Validates whether proposed bid is legally valid according to auction rules.
 */
export function validateBid(
  proposedBidAZN: number,
  currentBidAZN: number,
  minStepAZN: number
): { isValid: boolean; errorAz?: string } {
  if (isNaN(proposedBidAZN) || proposedBidAZN <= 0) {
    return { isValid: false, errorAz: 'Məbləğ düzgün daxil edilməyib.' };
  }

  const minAcceptableBid = currentBidAZN + minStepAZN;
  if (proposedBidAZN < minAcceptableBid) {
    return {
      isValid: false,
      errorAz: `Təklif olunan məbləğ ən azı cari təklifdən minimum addım (${minStepAZN} AZN) qədər çox olmalıdır (Minimum: ${minAcceptableBid} AZN).`,
    };
  }

  return { isValid: true };
}

/**
 * Generates an automated competing bidder bid to simulate real live auction participants.
 */
export function generateBotCounterBid(
  currentBidAZN: number,
  minStepAZN: number,
  lotCeilingAZN: number
): { shouldBid: boolean; nextBidAZN: number; botName: string } {
  // If current bid reached maximum budget ceiling, bot does not counter
  if (currentBidAZN >= lotCeilingAZN) {
    return { shouldBid: false, nextBidAZN: currentBidAZN, botName: '' };
  }

  const bots = [
    'İştirakçı №18 (Baku)',
    'İştirakçı №34 (Sumqayıt)',
    'İştirakçı №77 (Gəncə)',
    'İştirakçı №92 (Abşeron)',
    'İştirakçı №05 (Lənkəran)',
  ];

  const randomBot = bots[Math.floor(Math.random() * bots.length)];
  const steps = [1, 1, 2]; // usually 1 step, occasionally 2
  const chosenStep = steps[Math.floor(Math.random() * steps.length)];
  const nextBid = currentBidAZN + chosenStep * minStepAZN;

  return {
    shouldBid: true,
    nextBidAZN: Math.min(nextBid, lotCeilingAZN),
    botName: randomBot,
  };
}

/**
 * Formats monetary amounts with thousand separators and currency symbol.
 */
export function formatAuctionMoney(amount: number, currency: AuctionCurrency = 'AZN'): string {
  const symbols = {
    AZN: '₼',
    USD: '$',
    EUR: '€',
  };
  const rounded = Math.round(amount);
  return `${rounded.toLocaleString('az-AZ')} ${symbols[currency] || '₼'}`;
}

/**
 * Generates an official State Property Issues Service (Əmlak Məsələləri Dövlət Xidməti)
 * Electronic Auction Winner Protocol (Rəsmi Hərrac Qalibi Qərar Protokolu).
 */
export function generateAuctionWinnerProtocol(
  lot: AuctionLot,
  winnerFullName: string,
  winnerFin: string,
  winnerPhone: string,
  finalWinningBidAZN: number
): AuctionWinnerProtocol {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const protocolNumber = `ƏMLAK-HRC-2026-${randomSuffix}`;
  const now = new Date();
  const issuedAt = now.toISOString().replace('T', ' ').substring(0, 19);

  // 10 banking days payment deadline
  const paymentDeadlineDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .substring(0, 10);

  const financials = calculateAuctionFinancials(lot.startingPriceAZN, finalWinningBidAZN, 'AZN');

  const rawHash = `${protocolNumber}:${lot.lotNumber}:${winnerFin}:${finalWinningBidAZN}:${lot.vin}`;
  let hashVal = 0;
  for (let i = 0; i < rawHash.length; i++) {
    hashVal = (hashVal << 5) - hashVal + rawHash.charCodeAt(i);
    hashVal |= 0;
  }
  const qrHash = `https://e-herrac.emlak.gov.az/verify?protocol=${protocolNumber}&chk=${Math.abs(hashVal).toString(16)}`;
  const securityChecksum = `AZS-EMLAK-${Math.abs(hashVal).toString(16).toUpperCase().padStart(8, '0')}`;

  const bdypNote =
    'Bu protokol "İcra haqqında" AR Qanununun 52-ci və "Dövlət əmlakının özəlləşdirilməsi haqqında" AR Qanununun tələblərinə uyğun olaraq DİN Baş Dövlət Yol Polisi İdarəsinin (BDYP) Qeydiyyat-İmtahan şöbələrində avtomobilin yeni sahibin adına bilavasitə texpasportla rəsmiləşdirilməsi üçün qanuni tam hüquqi əsasdır. Əvvəlki sahibin bütün borc və qeydiyyat məhdudiyyətləri avtomatik ləğv edilir.';

  return {
    protocolNumber,
    lotId: lot.id,
    lotNumber: lot.lotNumber,
    vehicleTitle: lot.titleAz,
    vin: lot.vin,
    plateNumber: lot.plateNumber,
    category: lot.category,
    winnerFullName,
    winnerFin: winnerFin.toUpperCase(),
    winnerPhone,
    winningBidAZN: finalWinningBidAZN,
    guaranteeDepositPaidAZN: financials.guaranteeDepositAZN,
    operatorCommissionAZN: financials.operatorCommissionAZN,
    totalPayableAZN: financials.totalCostAZN,
    remainingDueAZN: financials.remainingBalanceAZN,
    paymentDeadlineDays: 10,
    paymentDueDate: paymentDeadlineDate,
    issuedAt,
    qrHash,
    securityChecksum,
    bdypClearanceNoteAz: bdypNote,
    status: 'valid',
  };
}

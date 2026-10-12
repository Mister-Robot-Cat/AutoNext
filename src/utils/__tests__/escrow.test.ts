import { describe, it, expect } from 'vitest';
import {
  calculateEscrowFee,
  getRecommendedDepositAmount,
  calculateSellerTrustScore,
  getSellerTrustBadge,
  generateEscrowSecurityPin,
  createInitialEscrowAgreement,
  transitionEscrowStatus,
  generateEscrowReceipt,
} from '../escrow';
import { Vehicle } from '../../types/vehicle';

const mockVehicle: Vehicle = {
  id: 'test-car-1',
  title: 'BMW 530e iPerformance',
  vin: 'WBAJA9C55JB123456',
  make: 'BMW',
  model: '530e',
  year: 2021,
  priceAzn: 62000,
  mileageKm: 48000,
  engineVolumeLiters: 2.0,
  fuelType: 'plug_in_hybrid',
  transmission: 'automatic',
  drivetrain: 'rwd',
  powerHp: 252,
  fuelConsumptionLPer100Km: 2.2,
  bodyType: 'sedan',
  color: 'Qara Metalik',
  interiorColor: 'Qara Dəri',
  interiorMaterial: 'leather',
  city: 'Bakı',
  images: ['https://example.com/car.jpg'],
  features: ['M-Sport', 'Harman Kardon'],
  damageReport: [],
  valuation: {
    status: 'fair_price',
    percentageDiff: -2,
    avgMarketPriceAzn: 63000,
    minMarketPriceAzn: 59000,
    maxMarketPriceAzn: 68000,
    confidenceScore: 92,
    priceHistoryTrend: [],
  },
  seller: {
    id: 'seller_1',
    name: 'Baku Prestige Motors',
    phone: '+994 50 123 45 67',
    type: 'official_dealer',
    rating: 4.9,
    reviewsCount: 84,
    verifiedIdentity: true,
    memberSinceYear: 2019,
    city: 'Bakı',
  },
  hasCustomsCleared: true,
  isCreditAvailable: true,
  isBarterAvailable: false,
  publishedDate: '2026-04-01T10:00:00Z',
  viewsCount: 310,
  description: 'Ideal vəziyyətdə BMW 530e.',
};

describe('Escrow Utilities & Calculations', () => {
  describe('calculateEscrowFee', () => {
    it('calculates fee with split payer option correctly', () => {
      // 1000 AZN deposit in Kapital Bank (0.5% = 5 AZN, clamped to minFee 15 AZN)
      const res = calculateEscrowFee(1000, 'kapital_bank', 'split');
      expect(res.feeAzn).toBe(15);
      expect(res.buyerPaysAzn).toBe(8);
      expect(res.sellerPaysAzn).toBe(7);
      expect(res.totalBuyerPaymentAzn).toBe(1008);
      expect(res.netSellerPayoutAzn).toBe(993);
    });

    it('calculates fee when buyer pays all escrow fees', () => {
      // 5000 AZN deposit in ABB (0.45% = 22.5 -> 23 AZN, between min 15 and max 45)
      const res = calculateEscrowFee(5000, 'abb', 'buyer');
      expect(res.feeAzn).toBe(23);
      expect(res.buyerPaysAzn).toBe(23);
      expect(res.sellerPaysAzn).toBe(0);
      expect(res.totalBuyerPaymentAzn).toBe(5023);
      expect(res.netSellerPayoutAzn).toBe(5000);
    });

    it('calculates fee when seller absorbs all escrow fees', () => {
      const res = calculateEscrowFee(4000, 'pasha_bank', 'seller');
      // 4000 * 0.55% = 22 AZN
      expect(res.feeAzn).toBe(22);
      expect(res.buyerPaysAzn).toBe(0);
      expect(res.sellerPaysAzn).toBe(22);
      expect(res.totalBuyerPaymentAzn).toBe(4000);
      expect(res.netSellerPayoutAzn).toBe(3978);
    });

    it('respects maximum fee clamp on high deposit amounts', () => {
      // 20000 AZN * 0.5% = 100 AZN, but Kapital Bank max is 50 AZN
      const res = calculateEscrowFee(20000, 'kapital_bank', 'buyer');
      expect(res.feeAzn).toBe(50);
      expect(res.totalBuyerPaymentAzn).toBe(20050);
    });
  });

  describe('getRecommendedDepositAmount', () => {
    it('calculates 5% rounded to nearest 50 for regular price', () => {
      // 62000 * 0.05 = 3100, clamped to max 3000
      expect(getRecommendedDepositAmount(62000)).toBe(3000);

      // 32000 * 0.05 = 1600
      expect(getRecommendedDepositAmount(32000)).toBe(1600);
    });

    it('clamps to minimum 200 AZN for very cheap or zero price', () => {
      expect(getRecommendedDepositAmount(0)).toBe(200);
      expect(getRecommendedDepositAmount(1500)).toBe(200);
    });

    it('clamps to maximum 3000 AZN for luxury cars', () => {
      expect(getRecommendedDepositAmount(250000)).toBe(3000);
    });
  });

  describe('calculateSellerTrustScore', () => {
    it('returns high score for fully verified seller', () => {
      const score = calculateSellerTrustScore({
        asanLoginVerified: true,
        dypTexpasportMatch: 'owner_matched',
        biometricVerified: true,
        phoneVerified: true,
        legalStatus: 'clean',
        hasActiveEnforcement: false,
        hasPoliceWantedCheck: true,
        totalDealsCompleted: 35,
      });
      // 30 + 25 + 15 + 10 + 15 + 0 + 5 = 100
      expect(score).toBe(100);
    });

    it('penalizes for enforcement and attorney validity instead of direct ownership', () => {
      const score = calculateSellerTrustScore({
        asanLoginVerified: true, // 30
        dypTexpasportMatch: 'attorney_valid', // 15
        biometricVerified: false, // 0
        phoneVerified: true, // 10
        legalStatus: 'minor_fines', // 8
        hasActiveEnforcement: true, // -20
        hasPoliceWantedCheck: true,
        totalDealsCompleted: 5, // 1
      });
      // 30 + 15 + 10 + 8 - 20 + 1 = 44
      expect(score).toBe(44);
    });

    it('heavily penalizes failed police check and clamps at 0', () => {
      const score = calculateSellerTrustScore({
        asanLoginVerified: false,
        dypTexpasportMatch: 'mismatch',
        biometricVerified: false,
        phoneVerified: false,
        legalStatus: 'encumbered',
        hasActiveEnforcement: true,
        hasPoliceWantedCheck: false,
      });
      expect(score).toBe(0);
    });
  });

  describe('getSellerTrustBadge', () => {
    it('returns elite badge for score >= 90', () => {
      const badge = getSellerTrustBadge(95);
      expect(badge.tierNameAz).toContain('Elit');
      expect(badge.colorClass).toContain('emerald');
    });

    it('returns verified badge for score 75-89', () => {
      const badge = getSellerTrustBadge(80);
      expect(badge.tierNameAz).toContain('Etibarlı');
      expect(badge.colorClass).toContain('blue');
    });

    it('returns basic badge for score 50-74', () => {
      const badge = getSellerTrustBadge(60);
      expect(badge.tierNameAz).toContain('Baza');
      expect(badge.colorClass).toContain('amber');
    });

    it('returns high risk badge for score < 50', () => {
      const badge = getSellerTrustBadge(30);
      expect(badge.tierNameAz).toContain('Risk');
      expect(badge.colorClass).toContain('rose');
    });
  });

  describe('generateEscrowSecurityPin', () => {
    it('generates a 6-digit numeric string', () => {
      const pin = generateEscrowSecurityPin();
      expect(pin).toHaveLength(6);
      expect(/^\d{6}$/.test(pin)).toBe(true);
    });
  });

  describe('createInitialEscrowAgreement', () => {
    it('creates an agreement with valid defaults', () => {
      const agreement = createInitialEscrowAgreement(mockVehicle);
      expect(agreement.escrowId).toMatch(/^ESC-2026-AZ-\d{4}$/);
      expect(agreement.vehicleTitle).toBe(mockVehicle.title);
      expect(agreement.status).toBe('DRAFT');
      expect(agreement.depositAmountAzn).toBe(3000);
      expect(agreement.timeline.length).toBe(1);
      expect(agreement.timeline[0].stage).toBe('DRAFT');
      expect(agreement.securityReleaseCode).toHaveLength(6);
      expect(agreement.contingencyRules.structuralDefectRefund).toBe(true);
    });
  });

  describe('transitionEscrowStatus', () => {
    it('completes the entire happy lifecycle: DRAFT -> FUNDS_LOCKED -> INSPECTION_PASSED -> RELEASED', () => {
      let agreement = createInitialEscrowAgreement(mockVehicle);
      expect(agreement.status).toBe('DRAFT');

      // 1. Lock funds
      agreement = transitionEscrowStatus(agreement, { action: 'LOCK_FUNDS' });
      expect(agreement.status).toBe('INSPECTION_PENDING');
      expect(agreement.timeline[0].stage).toBe('INSPECTION_PENDING');

      // 2. Pass inspection
      agreement = transitionEscrowStatus(agreement, {
        action: 'PASS_INSPECTION',
        notes: 'Chassis and engine verified in perfect condition.',
      });
      expect(agreement.status).toBe('NOTARY_PENDING');
      expect(agreement.inspectionNotes).toContain('Chassis');

      // 3. Confirm notary transfer and release funds
      agreement = transitionEscrowStatus(agreement, {
        action: 'CONFIRM_NOTARY',
        pinCode: agreement.securityReleaseCode,
      });
      expect(agreement.status).toBe('RELEASED');
      expect(agreement.timeline[0].stage).toBe('RELEASED');
    });

    it('handles inspection failure and full refund flow', () => {
      let agreement = createInitialEscrowAgreement(mockVehicle);
      agreement = transitionEscrowStatus(agreement, { action: 'LOCK_FUNDS' });

      // Fail inspection
      agreement = transitionEscrowStatus(agreement, {
        action: 'FAIL_INSPECTION',
        reason: 'Severe frame realignment detected.',
      });
      expect(agreement.status).toBe('INSPECTION_FAILED');
      expect(agreement.inspectionNotes).toContain('Severe frame');

      // Request refund
      agreement = transitionEscrowStatus(agreement, {
        action: 'REQUEST_REFUND',
        reason: 'Refund due to hidden frame damage.',
      });
      expect(agreement.status).toBe('REFUNDED');
      expect(agreement.disputeNotes).toContain('frame damage');
    });

    it('handles dispute and arbitration resolution flow', () => {
      let agreement = createInitialEscrowAgreement(mockVehicle);
      agreement = transitionEscrowStatus(agreement, { action: 'LOCK_FUNDS' });

      // Raise dispute
      agreement = transitionEscrowStatus(agreement, {
        action: 'RAISE_DISPUTE',
        reason: 'Seller refused to attend scheduled notary appointment.',
      });
      expect(agreement.status).toBe('DISPUTED');
      expect(agreement.timeline[0].stage).toBe('DISPUTED');

      // Resolve dispute by refunding buyer
      agreement = transitionEscrowStatus(agreement, {
        action: 'RESOLVE_DISPUTE',
        arbitrationResolution: 'REFUND_TO_BUYER',
        notes: 'Seller failed to produce valid documents.',
      });
      expect(agreement.status).toBe('REFUNDED');
      expect(agreement.timeline[0].titleAz).toContain('Arbitraj');
    });

    it('throws when attempting an invalid state transition', () => {
      const agreement = createInitialEscrowAgreement(mockVehicle);
      // Attempting to pass inspection while still in DRAFT
      expect(() => {
        transitionEscrowStatus(agreement, { action: 'PASS_INSPECTION' });
      }).toThrow();
    });
  });

  describe('generateEscrowReceipt', () => {
    it('generates Azerbaijani text receipt with correct information', () => {
      const agreement = createInitialEscrowAgreement(mockVehicle);
      const receipt = generateEscrowReceipt(agreement, 'az');
      expect(receipt).toContain('AUTONEXT RƏQƏMSAL BEH & ESCROW');
      expect(receipt).toContain(agreement.escrowId);
      expect(receipt).toContain('BMW 530e iPerformance');
      expect(receipt).toContain(agreement.securityReleaseCode);
    });

    it('generates English and Russian text receipts', () => {
      const agreement = createInitialEscrowAgreement(mockVehicle);
      const receiptEn = generateEscrowReceipt(agreement, 'en');
      expect(receiptEn).toContain('AUTONEXT SECURE DIGITAL ESCROW CERTIFICATE');

      const receiptRu = generateEscrowReceipt(agreement, 'ru');
      expect(receiptRu).toContain('СЕРТИФИКАТ ЦИФРОВОГО ЭСКРОУ');
    });
  });
});

import { describe, it, expect } from 'vitest';
import {
  calculateGuaranteeDeposit,
  calculateMinBidStep,
  calculateAuctionFinancials,
  validateBid,
  generateBotCounterBid,
  formatAuctionMoney,
  generateAuctionWinnerProtocol,
} from '../vehicleAuction';
import { MOCK_AUCTION_LOTS } from '../../data/mockVehicleAuctionData';

describe('vehicleAuction utility functions', () => {
  describe('calculateGuaranteeDeposit', () => {
    it('calculates 5% refundable guarantee deposit correctly', () => {
      expect(calculateGuaranteeDeposit(38000)).toBe(1900);
      expect(calculateGuaranteeDeposit(54000)).toBe(2700);
      expect(calculateGuaranteeDeposit(10000)).toBe(500);
    });

    it('returns 0 for zero or negative values', () => {
      expect(calculateGuaranteeDeposit(0)).toBe(0);
      expect(calculateGuaranteeDeposit(-1000)).toBe(0);
    });
  });

  describe('calculateMinBidStep', () => {
    it('calculates minimum 1% step rounded to nearest 50 AZN, at least 100 AZN', () => {
      expect(calculateMinBidStep(38000)).toBe(400); // 380 rounded up to 50 is 400
      expect(calculateMinBidStep(54000)).toBe(550); // 540 rounded up to 50 is 550
      expect(calculateMinBidStep(5000)).toBe(100); // 50 is lower than minimum 100
    });

    it('returns 100 for zero or negative values', () => {
      expect(calculateMinBidStep(0)).toBe(100);
      expect(calculateMinBidStep(-500)).toBe(100);
    });
  });

  describe('calculateAuctionFinancials', () => {
    it('calculates financials in AZN correctly', () => {
      const starting = 38000;
      const bid = 40000;
      const res = calculateAuctionFinancials(starting, bid, 'AZN');

      expect(res.startingPriceAZN).toBe(38000);
      expect(res.currentBidAZN).toBe(40000);
      expect(res.guaranteeDepositAZN).toBe(1900); // 5% of 38000
      expect(res.operatorCommissionAZN).toBe(200); // 0.5% of 40000
      expect(res.vatAmountAZN).toBe(36); // 18% of 200
      expect(res.remainingBalanceAZN).toBe(38100); // 40000 - 1900
      expect(res.totalCostAZN).toBe(40236); // 40000 + 200 + 36
    });

    it('handles USD currency conversion correctly', () => {
      const starting = 34000;
      const bid = 34000;
      const res = calculateAuctionFinancials(starting, bid, 'USD');

      // USD rate is 1.70: 34000 / 1.7 = 20000
      expect(res.amountInSelectedCurrency.startingPrice).toBe(20000);
      expect(res.amountInSelectedCurrency.currentBid).toBe(20000);
    });

    it('handles EUR currency conversion correctly', () => {
      const starting = 37000;
      const bid = 37000;
      const res = calculateAuctionFinancials(starting, bid, 'EUR');

      // EUR rate is 1.85: 37000 / 1.85 = 20000
      expect(res.amountInSelectedCurrency.startingPrice).toBe(20000);
    });
  });

  describe('validateBid', () => {
    it('validates bid that is at or above currentBid + minStep', () => {
      const result = validateBid(41500, 41000, 500);
      expect(result.isValid).toBe(true);
      expect(result.errorAz).toBeUndefined();
    });

    it('rejects bid that does not satisfy minStep requirement', () => {
      const result = validateBid(41200, 41000, 500);
      expect(result.isValid).toBe(false);
      expect(result.errorAz).toContain('minimum addım');
    });

    it('rejects invalid or non-numeric bid amounts', () => {
      const result = validateBid(NaN, 41000, 500);
      expect(result.isValid).toBe(false);
      expect(result.errorAz).toContain('düzgün daxil edilməyib');
    });
  });

  describe('generateBotCounterBid', () => {
    it('generates next higher bid when under ceiling', () => {
      const result = generateBotCounterBid(40000, 500, 60000);
      expect(result.shouldBid).toBe(true);
      expect(result.nextBidAZN).toBeGreaterThan(40000);
      expect(result.botName).toContain('İştirakçı');
    });

    it('stops bidding when current bid has reached or exceeded ceiling', () => {
      const result = generateBotCounterBid(60000, 500, 60000);
      expect(result.shouldBid).toBe(false);
      expect(result.nextBidAZN).toBe(60000);
    });
  });

  describe('formatAuctionMoney', () => {
    it('formats numbers with thousand separators and proper symbols', () => {
      expect(formatAuctionMoney(41500, 'AZN')).toContain('41.500 ₼');
      expect(formatAuctionMoney(20000, 'USD')).toContain('20.000 $');
      expect(formatAuctionMoney(15000, 'EUR')).toContain('15.000 €');
    });
  });

  describe('generateAuctionWinnerProtocol', () => {
    it('generates complete official protocol with QR and security hash', () => {
      const sampleLot = MOCK_AUCTION_LOTS[0];
      const protocol = generateAuctionWinnerProtocol(
        sampleLot,
        'Rəşad Əliyev',
        '7KA89B2',
        '+994504128990',
        42000
      );

      expect(protocol.protocolNumber).toMatch(/^ƏMLAK-HRC-2026-\d{5}$/);
      expect(protocol.winnerFullName).toBe('Rəşad Əliyev');
      expect(protocol.winnerFin).toBe('7KA89B2');
      expect(protocol.winningBidAZN).toBe(42000);
      expect(protocol.securityChecksum).toContain('AZS-EMLAK-');
      expect(protocol.qrHash).toContain('https://e-herrac.emlak.gov.az/verify');
      expect(protocol.paymentDeadlineDays).toBe(10);
      expect(protocol.bdypClearanceNoteAz).toContain('BDYP');
      expect(protocol.status).toBe('valid');
    });
  });
});

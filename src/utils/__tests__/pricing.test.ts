import { describe, it, expect } from 'vitest';
import { calculateCarLoan, evaluateMarketDeal } from '../pricing';
import { formatPrice } from '../i18n';

describe('Pricing & Loan Evaluation Engine', () => {
  describe('calculateCarLoan', () => {
    it('calculates annuity monthly payment accurately for standard 36-month loan', () => {
      const result = calculateCarLoan(50000, 20, 36, 14.5, 1.0);
      
      expect(result.downPaymentAmount).toBe(10000);
      expect(result.principal).toBe(40000);
      expect(result.monthlyPayment).toBeGreaterThan(1300);
      expect(result.monthlyPayment).toBeLessThan(1450);
      expect(result.totalInterest).toBeGreaterThan(0);
      expect(result.bankCommission).toBe(400); // 1% of 40000
    });

    it('handles 100% down payment without division by zero', () => {
      const result = calculateCarLoan(50000, 100, 36, 14.5);
      
      expect(result.downPaymentAmount).toBe(50000);
      expect(result.principal).toBe(0);
      expect(result.monthlyPayment).toBe(0);
      expect(result.totalInterest).toBe(0);
    });
  });

  describe('evaluateMarketDeal', () => {
    it('classifies deals >= 5% below market as great_deal', () => {
      const result = evaluateMarketDeal(45000, 50000); // 10% below market
      expect(result.status).toBe('great_deal');
      expect(result.percentageDiff).toBe(-10);
    });

    it('classifies deals within [-1.5%, +3%] as fair_price', () => {
      const result = evaluateMarketDeal(50500, 50000); // 1% above market
      expect(result.status).toBe('fair_price');
      expect(result.percentageDiff).toBe(1);
    });

    it('classifies deals > 3% above market as overpriced', () => {
      const result = evaluateMarketDeal(55000, 50000); // 10% above market
      expect(result.status).toBe('overpriced');
      expect(result.percentageDiff).toBe(10);
    });
  });

  describe('formatPrice', () => {
    it('formats AZN with currency symbol', () => {
      expect(formatPrice(50000, 'AZN')).toBe('50,000 ₼');
    });

    it('converts to USD correctly at 1.70 rate', () => {
      expect(formatPrice(17000, 'USD')).toBe('10,000 $');
    });
  });
});

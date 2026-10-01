import { describe, it, expect } from 'vitest';
import { formatPrice, CURRENCY_RATES } from '../i18n';

describe('i18n utils', () => {
  describe('formatPrice', () => {
    it('formats AZN correctly', () => {
      expect(formatPrice(1000, 'AZN')).toBe('1,000 ₼');
    });

    it('formats USD correctly based on rate', () => {
      const aznAmount = 1700;
      expect(formatPrice(aznAmount, 'USD')).toBe('1,000 $');
    });

    it('formats EUR correctly based on rate', () => {
      const aznAmount = 1850;
      expect(formatPrice(aznAmount, 'EUR')).toBe('1,000 €');
    });

    it('rounds correctly for non-integers', () => {
      const aznAmount = 1000;
      // 1000 / 1.70 = 588.235... -> 588
      expect(formatPrice(aznAmount, 'USD')).toBe('588 $');
    });
  });
});

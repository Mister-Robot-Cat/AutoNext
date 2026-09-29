import { describe, it, expect } from 'vitest';
import { getBrandDepreciationRate, calculateDepreciationForecast } from '../depreciation';

describe('Vehicle Price Depreciation Forecast Engine', () => {
  describe('getBrandDepreciationRate', () => {
    it('assigns lowest depreciation rate to Toyota / Lexus', () => {
      expect(getBrandDepreciationRate('Toyota')).toBe(7.5);
      expect(getBrandDepreciationRate('Lexus')).toBe(7.5);
    });

    it('assigns standard premium rate to BMW & Mercedes-Benz', () => {
      expect(getBrandDepreciationRate('BMW')).toBe(12.5);
      expect(getBrandDepreciationRate('Mercedes-Benz')).toBe(12.5);
    });

    it('falls back to market average for unknown brands', () => {
      expect(getBrandDepreciationRate('UnknownBrand')).toBe(10.5);
    });
  });

  describe('calculateDepreciationForecast', () => {
    it('generates 6 data points (Year 0 through Year 5)', () => {
      const forecast = calculateDepreciationForecast(50000, 'Toyota', 2022);
      expect(forecast.points.length).toBe(6);
      expect(forecast.points[0].retainedPercent).toBe(100);
      expect(forecast.points[0].projectedPriceAzn).toBe(50000);
    });

    it('computes monotonically decreasing resale value', () => {
      const forecast = calculateDepreciationForecast(80000, 'BMW', 2023);
      for (let i = 1; i < forecast.points.length; i++) {
        expect(forecast.points[i].projectedPriceAzn).toBeLessThan(forecast.points[i - 1].projectedPriceAzn);
        expect(forecast.points[i].retainedPercent).toBeLessThan(forecast.points[i - 1].retainedPercent);
      }
    });

    it('classifies Toyota as exceptional resale score', () => {
      const forecast = calculateDepreciationForecast(50000, 'Toyota', 2022);
      expect(forecast.resaleScore).toBe('exceptional');
    });
  });
});

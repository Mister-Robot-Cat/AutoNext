import { describe, it, expect } from 'vitest';
import {
  estimateBaseMarketPrice,
  calculateMileageDelta,
  calculateTradeInValuation,
  calculateUpgradeLoanEstimate,
  formatTradeInSummaryText,
  POPULAR_TRADE_IN_PRESETS,
  ANNUAL_AVERAGE_KM,
  REFERENCE_YEAR,
} from '../tradeIn';

describe('tradeIn utility engine', () => {
  describe('estimateBaseMarketPrice', () => {
    it('estimates market price for known preset matches', () => {
      const price = estimateBaseMarketPrice('Toyota', 'Camry', 2016);
      expect(price).toBeGreaterThan(25000);
      expect(price).toBeLessThan(35000);
    });

    it('estimates luxury brand market value higher than economy brands', () => {
      const luxuryPrice = estimateBaseMarketPrice('Mercedes-Benz', 'E200', 2020);
      const economyPrice = estimateBaseMarketPrice('Chevrolet', 'Aveo', 2020);
      expect(luxuryPrice).toBeGreaterThan(economyPrice);
    });

    it('applies depreciation across older model years', () => {
      const newer = estimateBaseMarketPrice('Hyundai', 'Tucson', 2022);
      const older = estimateBaseMarketPrice('Hyundai', 'Tucson', 2014);
      expect(newer).toBeGreaterThan(older);
    });
  });

  describe('calculateMileageDelta', () => {
    it('returns positive delta when mileage is higher than expected annual average', () => {
      // 2024 car (2 years old in 2026 => expected 30,000 km)
      const delta = calculateMileageDelta(2024, 60000);
      expect(delta).toBe(30000);
    });

    it('returns negative delta when mileage is lower than expected annual average', () => {
      const delta = calculateMileageDelta(2024, 10000);
      expect(delta).toBe(-20000);
    });

    it('returns zero delta when mileage exactly matches expected', () => {
      const expected = (REFERENCE_YEAR - 2024) * ANNUAL_AVERAGE_KM;
      const delta = calculateMileageDelta(2024, expected);
      expect(delta).toBe(0);
    });
  });

  describe('calculateTradeInValuation', () => {
    it('calculates trade-in valuation accurately for standard input', () => {
      const result = calculateTradeInValuation({
        make: 'Toyota',
        model: 'Camry',
        year: 2016,
        mileageKm: 140000,
        condition: 'good',
        accidentStatus: 'clean',
        serviceHistory: 'dealer_certified',
        estimatedMarketBaseAzn: 30000,
        existingLoanBalanceAzn: 0,
        targetVehiclePriceAzn: 50000,
      });

      expect(result.baseMarketValueAzn).toBe(30000);
      expect(result.tradeInOfferAzn).toBeGreaterThan(20000);
      expect(result.tradeInOfferAzn).toBeLessThan(30000);
      expect(result.tradeInMinAzn).toBeLessThan(result.tradeInOfferAzn);
      expect(result.tradeInMaxAzn).toBeGreaterThan(result.tradeInOfferAzn);
      expect(result.instantCashOfferAzn).toBeLessThan(result.tradeInOfferAzn);
      expect(result.dealershipBonusAzn).toBeGreaterThan(0);
      expect(result.effectiveTradeInCreditAzn).toBe(
        result.tradeInOfferAzn + result.dealershipBonusAzn
      );
      expect(result.netTradeInEquityAzn).toBe(result.effectiveTradeInCreditAzn);
      expect(result.netDifferenceToPayAzn).toBe(
        50000 - result.netTradeInEquityAzn
      );
      expect(result.confidenceScore).toBeGreaterThanOrEqual(70);
    });

    it('applies negative deduction for excessive mileage and poor condition', () => {
      const standardResult = calculateTradeInValuation({
        make: 'Hyundai',
        model: 'Elantra',
        year: 2018,
        mileageKm: 120000, // standard expected in 2026 is 8 * 15k = 120k
        condition: 'good',
        accidentStatus: 'clean',
        serviceHistory: 'regular_service',
        estimatedMarketBaseAzn: 25000,
        existingLoanBalanceAzn: 0,
      });

      const badConditionResult = calculateTradeInValuation({
        make: 'Hyundai',
        model: 'Elantra',
        year: 2018,
        mileageKm: 250000, // excessive mileage
        condition: 'poor',
        accidentStatus: 'accident_repaired',
        serviceHistory: 'partial_unknown',
        estimatedMarketBaseAzn: 25000,
        existingLoanBalanceAzn: 0,
      });

      expect(badConditionResult.tradeInOfferAzn).toBeLessThan(
        standardResult.tradeInOfferAzn
      );
      expect(badConditionResult.privateSaleEstimatedAzn).toBeLessThan(
        standardResult.privateSaleEstimatedAzn
      );
    });

    it('applies bonus for low mileage, excellent condition and dealer certified service', () => {
      const pristineResult = calculateTradeInValuation({
        make: 'Kia',
        model: 'Cerato',
        year: 2020,
        mileageKm: 25000, // very low for 6 years old
        condition: 'excellent',
        accidentStatus: 'clean',
        serviceHistory: 'dealer_certified',
        estimatedMarketBaseAzn: 28000,
        existingLoanBalanceAzn: 0,
      });

      const normalResult = calculateTradeInValuation({
        make: 'Kia',
        model: 'Cerato',
        year: 2020,
        mileageKm: 90000,
        condition: 'good',
        accidentStatus: 'minor_cosmetic',
        serviceHistory: 'regular_service',
        estimatedMarketBaseAzn: 28000,
        existingLoanBalanceAzn: 0,
      });

      expect(pristineResult.tradeInOfferAzn).toBeGreaterThan(
        normalResult.tradeInOfferAzn
      );
      expect(pristineResult.confidenceScore).toBeGreaterThan(
        normalResult.confidenceScore
      );
    });

    it('deducts existing loan balance to determine net trade-in equity', () => {
      const result = calculateTradeInValuation({
        make: 'Toyota',
        model: 'Corolla',
        year: 2019,
        mileageKm: 100000,
        condition: 'good',
        accidentStatus: 'clean',
        serviceHistory: 'regular_service',
        estimatedMarketBaseAzn: 26000,
        existingLoanBalanceAzn: 10000,
        targetVehiclePriceAzn: 45000,
      });

      expect(result.netTradeInEquityAzn).toBe(
        result.effectiveTradeInCreditAzn - 10000
      );
      expect(result.netDifferenceToPayAzn).toBe(
        45000 - result.netTradeInEquityAzn
      );
    });

    it('handles negative equity (loan balance exceeds car trade-in offer)', () => {
      const result = calculateTradeInValuation({
        make: 'Chevrolet',
        model: 'Cruze',
        year: 2017,
        mileageKm: 150000,
        condition: 'fair',
        accidentStatus: 'minor_cosmetic',
        serviceHistory: 'regular_service',
        estimatedMarketBaseAzn: 18000,
        existingLoanBalanceAzn: 25000, // underwater loan
        targetVehiclePriceAzn: 40000,
      });

      expect(result.netTradeInEquityAzn).toBeLessThan(0);
      // Net difference to pay rolls in negative equity
      expect(result.netDifferenceToPayAzn).toBe(
        40000 - result.netTradeInEquityAzn
      );
      expect(result.netDifferenceToPayAzn).toBeGreaterThan(40000);
    });

    it('guarantees min safe valuation floor', () => {
      const result = calculateTradeInValuation({
        make: 'Lada',
        model: '2107',
        year: 2000,
        mileageKm: 500000,
        condition: 'poor',
        accidentStatus: 'accident_repaired',
        serviceHistory: 'partial_unknown',
        estimatedMarketBaseAzn: 1000,
        existingLoanBalanceAzn: 0,
      });

      expect(result.tradeInOfferAzn).toBeGreaterThanOrEqual(1200);
      expect(result.instantCashOfferAzn).toBeGreaterThanOrEqual(1000);
    });
  });

  describe('calculateUpgradeLoanEstimate', () => {
    it('returns zero when net difference is zero or negative', () => {
      expect(calculateUpgradeLoanEstimate(0)).toBe(0);
      expect(calculateUpgradeLoanEstimate(-5000)).toBe(0);
    });

    it('computes realistic monthly payments for Azerbaijani loan standards', () => {
      // 20,000 AZN over 36 months at 14% annual interest
      const payment = calculateUpgradeLoanEstimate(20000, 36, 0.14);
      expect(payment).toBeGreaterThan(600);
      expect(payment).toBeLessThan(750);
    });

    it('adjusts payment when loan term is extended', () => {
      const payment36 = calculateUpgradeLoanEstimate(30000, 36);
      const payment60 = calculateUpgradeLoanEstimate(30000, 60);
      expect(payment60).toBeLessThan(payment36);
    });
  });

  describe('formatTradeInSummaryText', () => {
    it('formats textual report with currency symbols and numbers', () => {
      const valuation = calculateTradeInValuation({
        make: 'Toyota',
        model: 'Camry',
        year: 2016,
        mileageKm: 140000,
        condition: 'good',
        accidentStatus: 'clean',
        serviceHistory: 'dealer_certified',
        estimatedMarketBaseAzn: 30000,
        existingLoanBalanceAzn: 5000,
        targetVehiclePriceAzn: 45000,
      });

      const summary = formatTradeInSummaryText('Toyota Camry 2016', valuation, 'AZN');
      expect(summary).toContain('AutoNext Trade-In & Barter Qiymətləndirməsi');
      expect(summary).toContain('Cari Avtomobil: Toyota Camry 2016');
      expect(summary).toContain('Rəsmi Diler Təklifi:');
      expect(summary).toContain('Diler Barter Bonusu:');
      expect(summary).toContain('Xalis Barter Kapitalı (Equity):');
      expect(summary).toContain('Yeniləmə üçün ödəniləcək fərq:');
    });
  });

  describe('POPULAR_TRADE_IN_PRESETS', () => {
    it('contains at least 5 popular presets with complete properties', () => {
      expect(POPULAR_TRADE_IN_PRESETS.length).toBeGreaterThanOrEqual(5);
      for (const preset of POPULAR_TRADE_IN_PRESETS) {
        expect(preset.id).toBeDefined();
        expect(preset.make).toBeDefined();
        expect(preset.model).toBeDefined();
        expect(preset.year).toBeGreaterThan(2010);
        expect(preset.baseMarketPriceAzn).toBeGreaterThan(10000);
      }
    });
  });
});

import { describe, it, expect } from 'vitest';
import {
  calculateMandatoryInsurance,
  calculateAnnualTaxesAndFees,
  calculateAnnualEnergyCost,
  calculateTcoReport,
  exportTcoToCsv,
} from '../tco';

describe('TCO Forecaster Engine (utils/tco)', () => {
  describe('calculateMandatoryInsurance', () => {
    it('calculates correct rate for small engines (<= 1.5L)', () => {
      expect(calculateMandatoryInsurance(1.4, false)).toBe(80);
      expect(calculateMandatoryInsurance(1.5, false)).toBe(80);
    });

    it('calculates correct rate for medium engines (1.5 - 2.5L)', () => {
      expect(calculateMandatoryInsurance(2.0, false)).toBe(120);
      expect(calculateMandatoryInsurance(2.5, false)).toBe(120);
    });

    it('calculates correct rate for larger engines (> 2.5L)', () => {
      expect(calculateMandatoryInsurance(3.0, false)).toBe(160);
      expect(calculateMandatoryInsurance(4.5, false)).toBe(200);
    });

    it('calculates flat rate for electric vehicles', () => {
      expect(calculateMandatoryInsurance(0, true)).toBe(100);
    });
  });

  describe('calculateAnnualTaxesAndFees', () => {
    it('returns only state inspection fee for electric vehicles', () => {
      expect(calculateAnnualTaxesAndFees(0, true)).toBe(50);
    });

    it('computes inspection and engine-based road tax for ICE vehicles', () => {
      const taxes = calculateAnnualTaxesAndFees(2.5, false);
      expect(taxes).toBeGreaterThan(50);
      expect(taxes).toBe(50 + Math.round(2.5 * 35));
    });
  });

  describe('calculateAnnualEnergyCost', () => {
    it('returns 0 if mileage is 0 or negative', () => {
      expect(calculateAnnualEnergyCost(0, 'petrol', 8.5)).toBe(0);
      expect(calculateAnnualEnergyCost(-5000, 'petrol', 8.5)).toBe(0);
    });

    it('calculates petrol fuel costs accurately', () => {
      // 15,000 km, 8 L/100km = 1200 liters * 1.10 = 1320 AZN
      const cost = calculateAnnualEnergyCost(15000, 'petrol', 8.0, 1.10);
      expect(cost).toBe(1320);
    });

    it('calculates electric vehicle energy costs accurately', () => {
      // 15,000 km, 18 kWh/100km = 2700 kWh * 0.12 AZN = 324 AZN
      const cost = calculateAnnualEnergyCost(15000, 'electric', 0, 0.12);
      expect(cost).toBe(324);
    });
  });

  describe('calculateTcoReport', () => {
    it('calculates full 5-year forecast for a standard hybrid vehicle (Toyota Camry)', () => {
      const report = calculateTcoReport({
        vehiclePrice: 50000,
        annualMileageKm: 15000,
        fuelType: 'hybrid',
        fuelConsumptionLPer100Km: 5.2,
        engineVolumeLiters: 2.5,
        make: 'Toyota',
        includeKasko: false,
        ownershipYears: 5,
      });

      expect(report.yearlyBreakdown).toHaveLength(5);
      expect(report.totalCost).toBeGreaterThan(0);
      expect(report.total5YearCost).toBe(report.totalCost);
      expect(report.averageMonthlyCost).toBe(Math.round(report.totalCost / 60));
      expect(report.costPerKm).toBeGreaterThan(0);

      // Residual value should decrease each year
      expect(report.yearlyBreakdown[0].vehicleValueAtYearEnd).toBeLessThan(50000);
      expect(report.residualValueEnd).toBeLessThan(report.yearlyBreakdown[0].vehicleValueAtYearEnd);

      // Cumulative cost strictly increases
      for (let i = 1; i < 5; i++) {
        expect(report.yearlyBreakdown[i].cumulativeCost).toBeGreaterThan(
          report.yearlyBreakdown[i - 1].cumulativeCost
        );
      }

      // Check category breakdown sum
      const categorySum = report.categories.reduce((acc, cat) => acc + cat.totalAmount, 0);
      expect(categorySum).toBe(report.totalCost);

      // Check biggest cost driver exists
      expect(report.biggestDriver).toBeDefined();
      expect(report.biggestDriver.amount).toBeGreaterThan(0);
      expect(report.biggestDriver.percentage).toBeGreaterThan(0);
    });

    it('applies lower maintenance and zero road tax for EV (Tesla Model 3)', () => {
      const evReport = calculateTcoReport({
        vehiclePrice: 60000,
        annualMileageKm: 15000,
        fuelType: 'electric',
        fuelConsumptionLPer100Km: 0,
        make: 'Tesla',
        includeKasko: false,
        ownershipYears: 5,
      });

      const iceReport = calculateTcoReport({
        vehiclePrice: 60000,
        annualMileageKm: 15000,
        fuelType: 'petrol',
        fuelConsumptionLPer100Km: 9.5,
        engineVolumeLiters: 2.0,
        make: 'Other',
        includeKasko: false,
        ownershipYears: 5,
      });

      // EV fuel category should be much cheaper than petrol
      const evFuel = evReport.categories.find((c) => c.category === 'fuel')!.totalAmount;
      const iceFuel = iceReport.categories.find((c) => c.category === 'fuel')!.totalAmount;
      expect(evFuel).toBeLessThan(iceFuel);

      // EV maintenance should also be lower
      const evMaint = evReport.categories.find((c) => c.category === 'maintenance')!.totalAmount;
      const iceMaint = iceReport.categories.find((c) => c.category === 'maintenance')!.totalAmount;
      expect(evMaint).toBeLessThan(iceMaint);
    });

    it('reflects higher insurance when KASKO is included', () => {
      const withoutKasko = calculateTcoReport({
        vehiclePrice: 45000,
        annualMileageKm: 15000,
        fuelType: 'petrol',
        fuelConsumptionLPer100Km: 8.0,
        includeKasko: false,
        ownershipYears: 5,
      });

      const withKasko = calculateTcoReport({
        vehiclePrice: 45000,
        annualMileageKm: 15000,
        fuelType: 'petrol',
        fuelConsumptionLPer100Km: 8.0,
        includeKasko: true,
        ownershipYears: 5,
      });

      const insWithout = withoutKasko.categories.find((c) => c.category === 'insurance')!.totalAmount;
      const insWith = withKasko.categories.find((c) => c.category === 'insurance')!.totalAmount;
      expect(insWith).toBeGreaterThan(insWithout);
      expect(withKasko.totalCost).toBeGreaterThan(withoutKasko.totalCost);
    });

    it('handles 3-year ownership duration properly', () => {
      const report3Year = calculateTcoReport({
        vehiclePrice: 40000,
        annualMileageKm: 20000,
        fuelType: 'diesel',
        fuelConsumptionLPer100Km: 6.5,
        ownershipYears: 3,
      });

      expect(report3Year.averageMonthlyCost).toBe(Math.round(report3Year.totalCost / 36));
      expect(report3Year.yearlyBreakdown).toHaveLength(5); // all 5 calculated for matrix
      expect(report3Year.totalCost).toBeLessThan(report3Year.total5YearCost);
    });

    it('handles zero or negative price gracefully', () => {
      const zeroReport = calculateTcoReport({
        vehiclePrice: 0,
        annualMileageKm: 10000,
        fuelType: 'petrol',
        fuelConsumptionLPer100Km: 7.0,
      });

      expect(zeroReport.totalDepreciation).toBe(0);
      expect(zeroReport.residualValueEnd).toBe(0);
    });
  });

  describe('exportTcoToCsv', () => {
    it('generates well-formatted CSV with report metadata and 5 years', () => {
      const report = calculateTcoReport({
        vehiclePrice: 55000,
        annualMileageKm: 18000,
        fuelType: 'petrol',
        fuelConsumptionLPer100Km: 8.5,
        make: 'BMW',
        includeKasko: true,
        ownershipYears: 5,
      });

      const csv = exportTcoToCsv(report, 'AZN', 'BMW 520i');
      expect(csv).toContain('Total Cost of Ownership (TCO) Report - BMW 520i');
      expect(csv).toContain('Initial Price: 55000 AZN');
      expect(csv).toContain('KASKO Included: Yes');
      expect(csv).toContain('Year 1');
      expect(csv).toContain('Year 5');
      expect(csv).toContain('Total 5-Year Cost');
    });
  });
});

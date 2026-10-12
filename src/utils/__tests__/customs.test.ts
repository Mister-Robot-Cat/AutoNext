import { describe, it, expect } from 'vitest';
import {
  normalizeToAzn,
  getVehicleAge,
  isEligibleForGreenPrivileges,
  calculateCustomsDuty,
  calculateExciseTax,
  calculateCustomsClearanceFee,
  calculateElectronicFee,
  calculateUtilizationFee,
  calculateVat,
  calculateCustomsDuties,
  compareImportVsLocal,
  compareFuelCustomsScenarios,
  generateCustomsReceipt,
  ORIGIN_PRESETS,
  QUICK_VEHICLE_IMPORT_PRESETS,
  DEFAULT_EXCHANGE_RATES,
} from '../customs';
import { CustomsCalculationInput } from '../../types/customs';

describe('Customs Tariff Engine (DGK) - Utilities', () => {
  describe('normalizeToAzn', () => {
    it('converts currencies correctly using default rates', () => {
      expect(normalizeToAzn(100, 'AZN')).toBe(100);
      expect(normalizeToAzn(1000, 'USD')).toBe(1700);
      expect(normalizeToAzn(1000, 'EUR')).toBe(1850);
    });

    it('respects custom exchange rate overrides', () => {
      expect(normalizeToAzn(1000, 'USD', { USD: 1.75 })).toBe(1750);
    });
  });

  describe('getVehicleAge', () => {
    it('calculates vehicle age accurately with fallback floor of zero', () => {
      expect(getVehicleAge(2024, 2026)).toBe(2);
      expect(getVehicleAge(2026, 2026)).toBe(0);
      expect(getVehicleAge(2028, 2026)).toBe(0);
    });
  });

  describe('isEligibleForGreenPrivileges', () => {
    it('returns true for pure electric vehicles', () => {
      expect(isEligibleForGreenPrivileges('electric', 0, 5)).toBe(true);
    });

    it('returns true for qualifying hybrids (<= 3 years and <= 2500 cc)', () => {
      expect(isEligibleForGreenPrivileges('hybrid', 2487, 2)).toBe(true);
      expect(isEligibleForGreenPrivileges('plug_in_hybrid', 2000, 3)).toBe(true);
    });

    it('returns false for older hybrids (> 3 years) or large engine hybrids (> 2500 cc)', () => {
      expect(isEligibleForGreenPrivileges('hybrid', 2487, 4)).toBe(false);
      expect(isEligibleForGreenPrivileges('hybrid', 3500, 1)).toBe(false);
    });

    it('returns false for conventional petrol or diesel vehicles', () => {
      expect(isEligibleForGreenPrivileges('petrol', 1600, 1)).toBe(false);
      expect(isEligibleForGreenPrivileges('diesel', 2000, 1)).toBe(false);
    });
  });

  describe('calculateCustomsDuty', () => {
    it('returns 0 for electric and qualifying eco-hybrid vehicles', () => {
      expect(calculateCustomsDuty(50000, 0, 'electric', 2)).toBe(0);
      expect(calculateCustomsDuty(50000, 2487, 'hybrid', 2)).toBe(0);
    });

    it('calculates duty using 15% ad valorem when greater than per-cc minimum', () => {
      // Customs value: 60,000 AZN -> 15% = 9,000 AZN
      // Per cc min for 1400cc: 1400 * 0.40 * 1.70 = 952 AZN
      expect(calculateCustomsDuty(60000, 1400, 'petrol', 2)).toBe(9000);
    });

    it('applies per-cc minimum when greater than 15% ad valorem', () => {
      // Customs value: 5,000 AZN -> 15% = 750 AZN
      // Per cc min for 2000cc (age <= 7): 2000 * 0.70 * 1.70 = 2380 AZN
      expect(calculateCustomsDuty(5000, 2000, 'petrol', 3)).toBe(2380);
    });

    it('applies higher per-cc minimum for vehicles older than 7 years (1.20 USD/cc)', () => {
      // Customs value: 5,000 AZN -> 15% = 750 AZN
      // Per cc min for 2000cc (age > 7): 2000 * 1.20 * 1.70 = 4080 AZN
      expect(calculateCustomsDuty(5000, 2000, 'petrol', 8)).toBe(4080);
    });
  });

  describe('calculateExciseTax', () => {
    it('returns 0 for electric vehicles and qualifying hybrids', () => {
      expect(calculateExciseTax(0, 'electric', 1)).toBe(0);
      expect(calculateExciseTax(2000, 'hybrid', 2)).toBe(0);
    });

    it('calculates petrol excise across displacement tiers', () => {
      // <= 2000 cc: 1800 * 0.30 = 540 AZN
      expect(calculateExciseTax(1800, 'petrol', 2)).toBe(540);

      // 2001 - 3000 cc: 600 + (2500 - 2000) * 5.0 = 3100 AZN
      expect(calculateExciseTax(2500, 'petrol', 2)).toBe(3100);

      // 3001 - 4000 cc: 5600 + (3500 - 3000) * 15.0 = 13100 AZN
      expect(calculateExciseTax(3500, 'petrol', 2)).toBe(13100);

      // 4001 - 5000 cc: 20600 + (4500 - 4000) * 40.0 = 40600 AZN
      expect(calculateExciseTax(4500, 'petrol', 2)).toBe(40600);

      // > 5000 cc: 60600 + (5500 - 5000) * 80.0 = 100600 AZN
      expect(calculateExciseTax(5500, 'petrol', 2)).toBe(100600);
    });

    it('applies diesel coefficient (+20%)', () => {
      const petrol = calculateExciseTax(2000, 'petrol', 2); // 600
      const diesel = calculateExciseTax(2000, 'diesel', 2); // 600 * 1.20 = 720
      expect(diesel).toBe(720);
    });

    it('applies age multipliers for vehicles older than 7 and 10 years', () => {
      const base = calculateExciseTax(2000, 'petrol', 2); // 600
      const over7 = calculateExciseTax(2000, 'petrol', 8); // 600 * 1.20 = 720
      const over10 = calculateExciseTax(2000, 'petrol', 11); // 600 * 1.50 = 900
      expect(over7).toBe(720);
      expect(over10).toBe(900);
    });
  });

  describe('calculateCustomsClearanceFee', () => {
    it('applies Resolution No. 305 graduated fee schedule', () => {
      expect(calculateCustomsClearanceFee(800)).toBe(15);
      expect(calculateCustomsClearanceFee(5000)).toBe(60);
      expect(calculateCustomsClearanceFee(25000)).toBe(120);
      expect(calculateCustomsClearanceFee(75000)).toBe(200);
      expect(calculateCustomsClearanceFee(150000)).toBe(300);
    });
  });

  describe('calculateElectronicFee', () => {
    it('returns the standard 30 AZN electronic service fee', () => {
      expect(calculateElectronicFee()).toBe(30);
    });
  });

  describe('calculateUtilizationFee', () => {
    it('returns 0 for electric cars and young vehicles (<= 3 years)', () => {
      expect(calculateUtilizationFee(5, 'electric')).toBe(0);
      expect(calculateUtilizationFee(2, 'petrol')).toBe(0);
    });

    it('returns 400 AZN for 4 to 7 years old vehicles', () => {
      expect(calculateUtilizationFee(5, 'petrol')).toBe(400);
      expect(calculateUtilizationFee(7, 'diesel')).toBe(400);
    });

    it('returns 700 AZN for vehicles older than 7 years', () => {
      expect(calculateUtilizationFee(8, 'petrol')).toBe(700);
      expect(calculateUtilizationFee(12, 'diesel')).toBe(700);
    });
  });

  describe('calculateVat', () => {
    it('returns 0 for electric cars and qualifying hybrids', () => {
      expect(calculateVat(40000, 6000, 1000, 'electric', 0, 2)).toBe(0);
      expect(calculateVat(40000, 6000, 1000, 'hybrid', 2400, 2)).toBe(0);
    });

    it('calculates 18% on (customsValue + duty + excise)', () => {
      // 30,000 + 4,500 + 1,500 = 36,000 * 0.18 = 6,480 AZN
      expect(calculateVat(30000, 4500, 1500, 'petrol', 2000, 2)).toBe(6480);
    });
  });

  describe('calculateCustomsDuties', () => {
    const input: CustomsCalculationInput = {
      vehiclePrice: 15000,
      currency: 'USD',
      originCountry: 'usa',
      manufactureYear: 2022,
      engineCapacityCc: 2000,
      fuelType: 'petrol',
    };

    it('calculates full cost breakdown for standard petrol import', () => {
      const breakdown = calculateCustomsDuties(input);

      expect(breakdown.vehiclePriceAzn).toBe(15000 * 1.70);
      expect(breakdown.freightCostUsd).toBe(ORIGIN_PRESETS.usa.defaultFreightUsd);
      expect(breakdown.freightCostAzn).toBe(ORIGIN_PRESETS.usa.defaultFreightUsd * 1.70);
      expect(breakdown.customsValueAzn).toBe(breakdown.vehiclePriceAzn + breakdown.freightCostAzn);
      expect(breakdown.vehicleAgeYears).toBe(4);
      expect(breakdown.customsDutyAzn).toBeGreaterThan(0);
      expect(breakdown.exciseTaxAzn).toBe(600);
      expect(breakdown.vatAzn).toBeGreaterThan(0);
      expect(breakdown.customsClearanceFeeAzn).toBe(120);
      expect(breakdown.electronicFeeAzn).toBe(30);
      expect(breakdown.utilizationFeeAzn).toBe(400); // 4 years old: 400
      expect(breakdown.totalCustomsDutiesAzn).toBe(
        Math.round(
          (breakdown.customsDutyAzn +
            breakdown.exciseTaxAzn +
            breakdown.vatAzn +
            breakdown.customsClearanceFeeAzn +
            breakdown.electronicFeeAzn +
            breakdown.utilizationFeeAzn) *
            100
        ) / 100
      );
      expect(breakdown.totalLandedCostAzn).toBe(breakdown.customsValueAzn + breakdown.totalCustomsDutiesAzn);
      expect(breakdown.isElectricVehicle).toBe(false);
      expect(breakdown.isVatExempt).toBe(false);
    });

    it('calculates full exemptions for electric vehicle import from China', () => {
      const evInput: CustomsCalculationInput = {
        vehiclePrice: 20000,
        currency: 'USD',
        originCountry: 'china',
        manufactureYear: 2024,
        engineCapacityCc: 0,
        fuelType: 'electric',
      };

      const breakdown = calculateCustomsDuties(evInput);

      expect(breakdown.isElectricVehicle).toBe(true);
      expect(breakdown.isCustomsDutyExempt).toBe(true);
      expect(breakdown.isExciseExempt).toBe(true);
      expect(breakdown.isVatExempt).toBe(true);
      expect(breakdown.customsDutyAzn).toBe(0);
      expect(breakdown.exciseTaxAzn).toBe(0);
      expect(breakdown.vatAzn).toBe(0);
      expect(breakdown.utilizationFeeAzn).toBe(0);
      expect(breakdown.totalCustomsDutiesAzn).toBe(breakdown.customsClearanceFeeAzn + breakdown.electronicFeeAzn);
    });

    it('respects freightCostOverrideUsd when provided', () => {
      const customFreightInput: CustomsCalculationInput = {
        ...input,
        freightCostOverrideUsd: 1200,
      };

      const breakdown = calculateCustomsDuties(customFreightInput);
      expect(breakdown.freightCostUsd).toBe(1200);
      expect(breakdown.freightCostAzn).toBe(1200 * 1.70);
    });
  });

  describe('compareImportVsLocal', () => {
    it('recommends strong_import when net savings >= 5000 and >= 12%', () => {
      const res = compareImportVsLocal(40000, 50000); // 10,000 AZN savings (20%)
      expect(res.netSavingsAzn).toBe(10000);
      expect(res.savingsPercentage).toBe(20);
      expect(res.recommendation).toBe('strong_import');
    });

    it('recommends moderate_import for intermediate savings', () => {
      const res = compareImportVsLocal(45000, 48000); // 3,000 AZN savings (~6.3%)
      expect(res.netSavingsAzn).toBe(3000);
      expect(res.recommendation).toBe('moderate_import');
    });

    it('recommends buy_local when import is more expensive or gives negligible savings', () => {
      const res = compareImportVsLocal(52000, 50000); // -2000 AZN
      expect(res.netSavingsAzn).toBe(-2000);
      expect(res.recommendation).toBe('buy_local');
    });
  });

  describe('compareFuelCustomsScenarios', () => {
    it('returns all 4 powertrain comparisons and computes savings vs petrol', () => {
      const baseInput: CustomsCalculationInput = {
        vehiclePrice: 18000,
        currency: 'USD',
        originCountry: 'usa',
        manufactureYear: 2024,
        engineCapacityCc: 2000,
        fuelType: 'petrol',
      };

      const scenarios = compareFuelCustomsScenarios(baseInput);
      expect(scenarios).toHaveLength(4);

      const petrol = scenarios.find((s) => s.fuelType === 'petrol')!;
      const ev = scenarios.find((s) => s.fuelType === 'electric')!;
      const hybrid = scenarios.find((s) => s.fuelType === 'hybrid')!;

      expect(petrol.savingsVsPetrolAzn).toBe(0);
      expect(ev.savingsVsPetrolAzn).toBeGreaterThan(0);
      expect(hybrid.savingsVsPetrolAzn).toBeGreaterThan(0);
      expect(ev.isGreenAdvantaged).toBe(true);
      expect(hybrid.isGreenAdvantaged).toBe(true);
      expect(ev.customsDutiesAzn).toBeLessThan(petrol.customsDutiesAzn);
    });
  });

  describe('generateCustomsReceipt', () => {
    it('produces formatted official DGK statement receipt', () => {
      const input: CustomsCalculationInput = {
        vehiclePrice: 18000,
        currency: 'USD',
        originCountry: 'usa',
        manufactureYear: 2023,
        engineCapacityCc: 2400,
        fuelType: 'petrol',
      };

      const breakdown = calculateCustomsDuties(input);
      const receipt = generateCustomsReceipt(breakdown, input, 'Toyota Camry XSE');

      expect(receipt).toContain('DÖVLƏT GÖMRÜK KOMİTƏSİ');
      expect(receipt).toContain('Toyota Camry XSE');
      expect(receipt).toContain('2400 sm³');
      expect(receipt).toContain('YEKUN GÖMRÜK XƏRCLƏRİ');
      expect(receipt).toContain('AutoNext Pro');
    });
  });

  describe('Data Presets', () => {
    it('contains presets for key auto import corridors', () => {
      expect(ORIGIN_PRESETS.usa).toBeDefined();
      expect(ORIGIN_PRESETS.georgia).toBeDefined();
      expect(ORIGIN_PRESETS.germany).toBeDefined();
      expect(ORIGIN_PRESETS.korea).toBeDefined();
      expect(ORIGIN_PRESETS.china).toBeDefined();
      expect(ORIGIN_PRESETS.uae).toBeDefined();
    });

    it('includes popular vehicle import presets', () => {
      expect(QUICK_VEHICLE_IMPORT_PRESETS.length).toBeGreaterThanOrEqual(5);
      const camry = QUICK_VEHICLE_IMPORT_PRESETS.find((p) => p.id === 'camry-hybrid-2021');
      expect(camry).toBeDefined();
      expect(camry?.fuelType).toBe('hybrid');
    });
  });
});

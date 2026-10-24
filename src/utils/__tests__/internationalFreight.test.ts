import { describe, it, expect } from 'vitest';
import {
  convertUsdToAzn,
  convertUsdToEur,
  convertAznToCurrency,
  calculateSdrLiability,
  calculateFreightCosts,
  getDibQuotaAvailability,
  generateECmrNumber,
  generateCustomsSealNumber,
  CMR_SDR_PER_KG,
  SDR_TO_USD,
  TIR_CARNET_COST_USD,
} from '../internationalFreight';
import {
  MOCK_FREIGHT_CORRIDORS,
  MOCK_DIB_QUOTAS,
  MOCK_CARRIER_COMPANIES,
} from '../../data/mockInternationalFreightData';
import { FreightCalculationInput, DibCountryQuota } from '../../types/internationalFreight';

describe('internationalFreight utility tests', () => {
  it('converts USD to AZN correctly', () => {
    expect(convertUsdToAzn(100)).toBe(170);
    expect(convertUsdToAzn(0)).toBe(0);
  });

  it('converts USD to EUR correctly', () => {
    // 100 * 1.70 / 1.85 = 91.89
    expect(convertUsdToEur(100)).toBeCloseTo(91.89, 1);
  });

  it('converts AZN to chosen currency', () => {
    expect(convertAznToCurrency(170, 'AZN')).toBe(170);
    expect(convertAznToCurrency(170, 'USD')).toBe(100);
    expect(convertAznToCurrency(185, 'EUR')).toBe(100);
  });

  it('calculates SDR liability strictly adhering to CMR 8.33 SDR/kg formula', () => {
    const weight = 10000; // 10,000 kg
    const res = calculateSdrLiability(weight);

    const expectedSdr = weight * CMR_SDR_PER_KG; // 83300
    const expectedUsd = expectedSdr * SDR_TO_USD; // 83300 * 1.33 = 110789

    expect(res.sdrTotal).toBe(expectedSdr);
    expect(res.liabilityUsd).toBe(expectedUsd);
    expect(res.liabilityAzn).toBe(convertUsdToAzn(expectedUsd));
    expect(res.liabilityEur).toBe(convertUsdToEur(expectedUsd));
  });

  it('handles zero or negative weights in SDR calculation gracefully', () => {
    const resZero = calculateSdrLiability(0);
    expect(resZero.sdrTotal).toBe(0);
    expect(resZero.liabilityUsd).toBe(0);

    const resNeg = calculateSdrLiability(-500);
    expect(resNeg.sdrTotal).toBe(0);
    expect(resNeg.liabilityUsd).toBe(0);
  });

  it('calculates freight costs for Caspian Middle Corridor including Ro-Ro ferry', () => {
    const input: FreightCalculationInput = {
      cargoType: 'general_merchandise',
      grossWeightKg: 10000,
      declaredValueUsd: 50000,
      corridorId: 'middle_corridor_caspian',
      transportRegime: 'cmr_standard',
      useTirCarnet: false,
      includeAdrsurcharge: false,
      includeTemperatureControl: false,
      carrierId: 'carrier_silk_way',
    };

    const result = calculateFreightCosts(input, MOCK_FREIGHT_CORRIDORS, MOCK_CARRIER_COMPANIES);

    expect(result.roRoFerryCostUsd).toBe(1200);
    expect(result.roRoFerryCostAzn).toBe(2040);
    expect(result.tirCarnetFeeUsd).toBe(0);
    expect(result.baseFreightUsd).toBeGreaterThan(0);
    expect(result.totalFreightUsd).toBeGreaterThan(result.baseFreightUsd);
    expect(result.estimatedTransitDays).toBe(3); // 72h / 24 = 3
  });

  it('includes TIR Carnet fee and adds ADR surcharge when hazardous materials selected', () => {
    const input: FreightCalculationInput = {
      cargoType: 'chemical_adr',
      grossWeightKg: 20000,
      declaredValueUsd: 120000,
      corridorId: 'turkey_europe_corridor',
      transportRegime: 'tir_carnet_iru',
      useTirCarnet: true,
      includeAdrsurcharge: true,
      includeTemperatureControl: false,
      carrierId: 'carrier_baku_global',
    };

    const result = calculateFreightCosts(input, MOCK_FREIGHT_CORRIDORS, MOCK_CARRIER_COMPANIES);

    expect(result.tirCarnetFeeUsd).toBe(TIR_CARNET_COST_USD);
    expect(result.surchargesUsd).toBeGreaterThan(0);
    expect(result.roRoFerryCostUsd).toBe(0); // Turkey corridor is overland
    expect(result.carrierComplianceScore).toBeGreaterThanOrEqual(95);
  });

  it('adds reefer surcharge for perishable goods with temperature control', () => {
    const input: FreightCalculationInput = {
      cargoType: 'perishable_food',
      grossWeightKg: 15000,
      declaredValueUsd: 30000,
      corridorId: 'black_sea_traceca',
      transportRegime: 'e_cmr_digital',
      useTirCarnet: false,
      includeAdrsurcharge: false,
      includeTemperatureControl: true,
      carrierId: 'carrier_caspian_transit',
    };

    const result = calculateFreightCosts(input, MOCK_FREIGHT_CORRIDORS, MOCK_CARRIER_COMPANIES);

    expect(result.surchargesUsd).toBeGreaterThan(0);
    expect(result.carrierComplianceScore).toBe(90); // 85 base + 5 for e_cmr
  });

  it('flags isLiabilityCappedByDeclaredValue when declared value is below SDR statutory cap', () => {
    const input: FreightCalculationInput = {
      cargoType: 'general_merchandise',
      grossWeightKg: 20000, // 20t -> ~221,000 USD SDR
      declaredValueUsd: 15000, // lower than SDR
      corridorId: 'north_south_instc',
      transportRegime: 'cmr_standard',
      useTirCarnet: false,
      includeAdrsurcharge: false,
      includeTemperatureControl: false,
      carrierId: 'carrier_absheron',
    };

    const result = calculateFreightCosts(input, MOCK_FREIGHT_CORRIDORS, MOCK_CARRIER_COMPANIES);
    expect(result.isLiabilityCappedByDeclaredValue).toBe(true);
  });

  it('evaluates DİB quota availability properly for different categories and thresholds', () => {
    const sampleQuota: DibCountryQuota = {
      countryCode: 'TEST',
      countryNameAz: 'Test Ölkə',
      countryNameEn: 'Test Country',
      flagEmoji: '🏳️',
      bilateralTotal: 1000,
      bilateralUsed: 500, // 50%
      transitTotal: 1000,
      transitUsed: 850, // 85% -> limited
      thirdCountryTotal: 1000,
      thirdCountryUsed: 1000, // 100% -> exhausted
      feeAzn: 50,
      euroStandardReq: 'Euro-5',
    };

    const resBilateral = getDibQuotaAvailability(sampleQuota, 'bilateral');
    expect(resBilateral.status).toBe('available');
    expect(resBilateral.remaining).toBe(500);
    expect(resBilateral.percentUsed).toBe(50);

    const resTransit = getDibQuotaAvailability(sampleQuota, 'transit');
    expect(resTransit.status).toBe('limited');
    expect(resTransit.remaining).toBe(150);
    expect(resTransit.percentUsed).toBe(85);

    const resThird = getDibQuotaAvailability(sampleQuota, 'third_country');
    expect(resThird.status).toBe('exhausted');
    expect(resThird.remaining).toBe(0);
    expect(resThird.percentUsed).toBe(100);

    const resEcmt = getDibQuotaAvailability(sampleQuota, 'ecmt_annual');
    expect(resEcmt.total).toBe(2000);
    expect(resEcmt.used).toBe(1350);
  });

  it('generates authentic format for e-CMR and customs seal numbers', () => {
    const eCmr = generateECmrNumber('1401889921');
    expect(eCmr).toMatch(/^AYNA-CMR-2026-9921-\d{4}$/);

    const seal = generateCustomsSealNumber();
    expect(seal).toMatch(/^AZ-CUSTOMS-\d{6}$/);
  });
});

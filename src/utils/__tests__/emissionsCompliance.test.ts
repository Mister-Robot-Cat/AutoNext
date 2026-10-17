import { describe, it, expect } from 'vitest';
import {
  inferEngineEmissionType,
  inferEuroStandardClass,
  auditGasAnalyzerTelemetry,
  evaluateCatalystAndDpfIntegrity,
  calculateAnnualCarbonFootprint,
  generateEcoComplianceCertificate,
  lookupEcoCertificate,
} from '../emissionsCompliance';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('emissionsCompliance utility engine', () => {
  describe('inferEngineEmissionType & inferEuroStandardClass', () => {
    it('correctly infers engine emission type from vehicle fuel and year', () => {
      const evCar = { ...MOCK_VEHICLES[0], fuelType: 'electric' as const, year: 2024 };
      expect(inferEngineEmissionType(evCar)).toBe('electric');

      const modernDiesel = { ...MOCK_VEHICLES[0], fuelType: 'diesel' as const, year: 2018 };
      expect(inferEngineEmissionType(modernDiesel)).toBe('diesel_turbo_dpf');

      const oldDiesel = { ...MOCK_VEHICLES[0], fuelType: 'diesel' as const, year: 2003 };
      expect(inferEngineEmissionType(oldDiesel)).toBe('diesel_standard');

      const oldPetrol = { ...MOCK_VEHICLES[0], fuelType: 'petrol' as const, year: 1998 };
      expect(inferEngineEmissionType(oldPetrol)).toBe('petrol_uncatalyzed');

      const modernPetrol = { ...MOCK_VEHICLES[0], fuelType: 'petrol' as const, year: 2022 };
      expect(inferEngineEmissionType(modernPetrol)).toBe('petrol_catalyst');
    });

    it('maps production year and fuel type to Euro standard class', () => {
      expect(inferEuroStandardClass(2024, 'electric')).toBe('Zero-Emission EV');
      expect(inferEuroStandardClass(2020, 'petrol')).toBe('Euro-6');
      expect(inferEuroStandardClass(2013, 'diesel')).toBe('Euro-5');
      expect(inferEuroStandardClass(2007, 'petrol')).toBe('Euro-4');
      expect(inferEuroStandardClass(2002, 'petrol')).toBe('Euro-3');
      expect(inferEuroStandardClass(1996, 'petrol')).toBe('Euro-0/1/2');
    });
  });

  describe('auditGasAnalyzerTelemetry (YHQ Annex 1 Section VI & İXM Article 342.5)', () => {
    it('passes zero-emission electric vehicles with 100 ecoScore and 0 AZN fine', () => {
      const res = auditGasAnalyzerTelemetry({
        engineType: 'electric',
        coIdlePercent: 0,
        coHighRpmPercent: 0,
        chIdlePpm: 0,
        lambdaRatio: 1.0,
        smokeKValue: 0,
      });

      expect(res.isCompliant).toBe(true);
      expect(res.isZeroEmissionEv).toBe(true);
      expect(res.ecoScore).toBe(100);
      expect(res.individualFineAzn).toBe(0);
    });

    it('passes catalyzed petrol vehicle when CO, CH, and Lambda are within YHQ norms', () => {
      const res = auditGasAnalyzerTelemetry({
        engineType: 'petrol_catalyst',
        coIdlePercent: 0.18,
        coHighRpmPercent: 0.12,
        chIdlePpm: 45,
        lambdaRatio: 1.0,
        smokeKValue: 0,
      });

      expect(res.isCompliant).toBe(true);
      expect(res.coIdleCompliant).toBe(true);
      expect(res.coHighRpmCompliant).toBe(true);
      expect(res.chIdleCompliant).toBe(true);
      expect(res.lambdaCompliant).toBe(true);
      expect(res.individualFineAzn).toBe(0);
      expect(res.earlyPaymentFineAzn).toBe(0);
      expect(res.violationsAz).toHaveLength(0);
    });

    it('flags İXM Article 342.5 (50 AZN / 25 AZN early payment) fine when CO & CH exceed catalyzed norms', () => {
      const res = auditGasAnalyzerTelemetry({
        engineType: 'petrol_catalyst',
        coIdlePercent: 1.65,
        coHighRpmPercent: 1.4,
        chIdlePpm: 380,
        lambdaRatio: 0.91,
        smokeKValue: 0,
      });

      expect(res.isCompliant).toBe(false);
      expect(res.coIdleCompliant).toBe(false);
      expect(res.coHighRpmCompliant).toBe(false);
      expect(res.chIdleCompliant).toBe(false);
      expect(res.lambdaCompliant).toBe(false);
      expect(res.individualFineAzn).toBe(50);
      expect(res.earlyPaymentFineAzn).toBe(25);
      expect(res.fleetOfficialFineAzn).toBe(150);
      expect(res.violationsAz.length).toBeGreaterThanOrEqual(4);
    });

    it('evaluates diesel turbo DPF smoke absorption coefficient k (m^-1) accurately', () => {
      const passDiesel = auditGasAnalyzerTelemetry({
        engineType: 'diesel_turbo_dpf',
        coIdlePercent: 0,
        coHighRpmPercent: 0,
        chIdlePpm: 0,
        lambdaRatio: 1.2,
        smokeKValue: 0.35,
      });
      expect(passDiesel.isCompliant).toBe(true);
      expect(passDiesel.smokeCompliant).toBe(true);

      const failDiesel = auditGasAnalyzerTelemetry({
        engineType: 'diesel_turbo_dpf',
        coIdlePercent: 0,
        coHighRpmPercent: 0,
        chIdlePpm: 0,
        lambdaRatio: 1.2,
        smokeKValue: 2.4,
      });
      expect(failDiesel.isCompliant).toBe(false);
      expect(failDiesel.smokeCompliant).toBe(false);
      expect(failDiesel.individualFineAzn).toBe(50);
      expect(failDiesel.estimatedOpacityPercent).toBeGreaterThan(30);
    });
  });

  describe('evaluateCatalystAndDpfIntegrity', () => {
    it('confirms intact OEM catalyst preserves 100% resale value with 0 repair cost', () => {
      const res = evaluateCatalystAndDpfIntegrity({
        engineType: 'petrol_catalyst',
        catalystStatus: 'oem_intact',
        backpressureKpa: 6,
        activeObdCodes: [],
        vehiclePriceAzn: 40000,
      });

      expect(res.passesInspection).toBe(true);
      expect(res.isSystemHealthy).toBe(true);
      expect(res.resaleValuePenaltyAzn).toBe(0);
      expect(res.estimatedRepairCostAzn).toBe(0);
      expect(res.backpressureStatus).toBe('normal');
    });

    it('calculates resale value penalty and repair cost when catalyst is cut/removed with P0420 fault', () => {
      const res = evaluateCatalystAndDpfIntegrity({
        engineType: 'petrol_catalyst',
        catalystStatus: 'removed_bypass',
        backpressureKpa: 3,
        activeObdCodes: ['P0420'],
        vehiclePriceAzn: 35000,
      });

      expect(res.passesInspection).toBe(false);
      expect(res.resaleValuePenaltyAzn).toBeGreaterThanOrEqual(850);
      expect(res.estimatedRepairCostAzn).toBeGreaterThanOrEqual(420);
      expect(res.detailedFindingsAz.some((f) => f.includes('P0420'))).toBe(true);
    });

    it('flags critical clogged backpressure when > 25 kPa', () => {
      const res = evaluateCatalystAndDpfIntegrity({
        engineType: 'diesel_turbo_dpf',
        catalystStatus: 'clogged_degraded',
        backpressureKpa: 32,
        activeObdCodes: ['P2463'],
        vehiclePriceAzn: 30000,
      });

      expect(res.backpressureStatus).toBe('critical_clogged');
      expect(res.passesInspection).toBe(false);
    });
  });

  describe('calculateAnnualCarbonFootprint', () => {
    it('calculates zero tailpipe CO2 and A+ badge for electric vehicles', () => {
      const res = calculateAnnualCarbonFootprint({
        fuelType: 'electric',
        fuelConsumptionLPer100Km: 0,
        annualMileageKm: 20000,
        productionYear: 2024,
      });

      expect(res.co2GramsPerKm).toBe(0);
      expect(res.annualCo2Tons).toBe(0);
      expect(res.ecoBadge).toBe('A+');
      expect(res.meetsCabinetDecision92ImportNorm).toBe(true);
    });

    it('calculates CO2 grams/km, annual tons, and offset trees for petrol/diesel vehicles', () => {
      const res = calculateAnnualCarbonFootprint({
        fuelType: 'petrol',
        fuelConsumptionLPer100Km: 8.0,
        annualMileageKm: 15000,
        productionYear: 2018,
      });

      expect(res.co2GramsPerKm).toBe(185);
      expect(res.annualCo2Kg).toBe(2775);
      expect(res.treesRequiredToOffset).toBeGreaterThan(100);
      expect(res.euroClass).toBe('Euro-6');
      expect(res.meetsCabinetDecision92ImportNorm).toBe(true);
    });
  });

  describe('generateEcoComplianceCertificate & lookupEcoCertificate', () => {
    it('generates deterministic BDYP-EKO-2026 certificate and looks up existing records', () => {
      const cert = generateEcoComplianceCertificate({
        plateNumber: '90-AZ-555',
        vin: 'WBA5A7C50JB192841',
        vehicleTitle: 'BMW 530i',
        engineType: 'petrol_catalyst',
        euroClass: 'Euro-6',
        catalystStatus: 'oem_intact',
        measuredCoIdlePercent: 0.15,
        measuredCoHighRpmPercent: 0.1,
        measuredChPpm: 35,
        measuredLambda: 1.0,
        measuredSmokeK: 0,
      });

      expect(cert.certificateNumber).toMatch(/^BDYP-EKO-2026-\d{5}$/);
      expect(cert.isCompliant).toBe(true);

      const foundByPlate = lookupEcoCertificate('99-XX-777');
      expect(foundByPlate).not.toBeNull();
      expect(foundByPlate?.certificateNumber).toBe('BDYP-EKO-2026-84920');

      const notFound = lookupEcoCertificate('00-ZZ-000');
      expect(notFound).toBeNull();
    });
  });
});

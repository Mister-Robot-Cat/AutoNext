import { describe, it, expect } from 'vitest';
import {
  calculateBillableStorageDays,
  calculateImpoundReleaseCost,
  auditTowingLegality,
  convertImpoundCurrency,
  determineWeightClassFromVehicle,
  validateReleaseFinCode,
  generateImpoundReleasePass,
} from '../impoundLot';
import { MOCK_IMPOUND_LOTS } from '../../data/mockImpoundData';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('impoundLot calculation & statutory engine', () => {
  describe('calculateBillableStorageDays', () => {
    it('returns 0 billable days within the 3-hour statutory grace period', () => {
      expect(calculateBillableStorageDays(0)).toEqual({
        billableDays: 0,
        isWithinFree3HourGrace: true,
      });
      expect(calculateBillableStorageDays(2)).toEqual({
        billableDays: 0,
        isWithinFree3HourGrace: true,
      });
      expect(calculateBillableStorageDays(3)).toEqual({
        billableDays: 0,
        isWithinFree3HourGrace: true,
      });
    });

    it('calculates started 24-hour cycles beyond 3 hours', () => {
      expect(calculateBillableStorageDays(4)).toEqual({
        billableDays: 1,
        isWithinFree3HourGrace: false,
      });
      expect(calculateBillableStorageDays(24)).toEqual({
        billableDays: 1,
        isWithinFree3HourGrace: false,
      });
      expect(calculateBillableStorageDays(25)).toEqual({
        billableDays: 2,
        isWithinFree3HourGrace: false,
      });
      expect(calculateBillableStorageDays(72)).toEqual({
        billableDays: 3,
        isWithinFree3HourGrace: false,
      });
    });
  });

  describe('calculateImpoundReleaseCost', () => {
    it('calculates passenger car obstruction tow within 3-hour grace window with 50% early fine discount', () => {
      const res = calculateImpoundReleaseCost({
        violationCode: 'ixm_346_2_obstruction',
        weightClass: 'passenger_under_3_5t',
        hoursImpounded: 2,
        applyEarly50Discount: true,
      });

      expect(res.baseFineAzn).toBe(40);
      expect(res.discountedFineAzn).toBe(20);
      expect(res.fineSavingsAzn).toBe(20);
      expect(res.towingFeeAzn).toBe(20);
      expect(res.billableDays).toBe(0);
      expect(res.storageFeeAzn).toBe(0);
      expect(res.asanPayCommissionAzn).toBe(0.5);
      expect(res.totalPayableAzn).toBe(40.5);
      expect(res.penaltyPoints).toBe(2);
    });

    it('calculates multi-day storage and medium/heavy truck Tariff Council fees accurately', () => {
      const mediumRes = calculateImpoundReleaseCost({
        violationCode: 'ixm_346_4_disabled_spot',
        weightClass: 'medium_3_5_to_10t',
        hoursImpounded: 48,
        applyEarly50Discount: false,
      });

      expect(mediumRes.baseFineAzn).toBe(60);
      expect(mediumRes.discountedFineAzn).toBe(60);
      expect(mediumRes.towingFeeAzn).toBe(40);
      expect(mediumRes.billableDays).toBe(2);
      expect(mediumRes.dailyStorageRateAzn).toBe(2);
      expect(mediumRes.storageFeeAzn).toBe(4);
      expect(mediumRes.totalPayableAzn).toBe(104.5);

      const heavyRes = calculateImpoundReleaseCost({
        violationCode: 'ixm_150_11_debt_arrest',
        weightClass: 'heavy_over_10t',
        hoursImpounded: 72,
        applyEarly50Discount: true, // 150.11 does not allow 50% early discount
      });

      expect(heavyRes.discountedFineAzn).toBe(80);
      expect(heavyRes.towingFeeAzn).toBe(60);
      expect(heavyRes.billableDays).toBe(3);
      expect(heavyRes.storageFeeAzn).toBe(9);
      expect(heavyRes.totalPayableAzn).toBe(149.5);
    });

    it('does not charge towing or storage for İXM 346.1 standard non-obstructing parking', () => {
      const res = calculateImpoundReleaseCost({
        violationCode: 'ixm_346_1_standard_parking',
        weightClass: 'passenger_under_3_5t',
        hoursImpounded: 24,
        applyEarly50Discount: true,
      });

      expect(res.discountedFineAzn).toBe(10);
      expect(res.towingFeeAzn).toBe(0);
      expect(res.storageFeeAzn).toBe(0);
      expect(res.totalPayableAzn).toBe(10.5);
    });

    it('waives all fees when towing is unlawful or exonerated under İXM Article 96.10', () => {
      const res = calculateImpoundReleaseCost({
        violationCode: 'ixm_346_2_obstruction',
        weightClass: 'passenger_under_3_5t',
        hoursImpounded: 36,
        applyEarly50Discount: true,
        wasTowingUnlawfulOrExonerated: true,
      });

      expect(res.totalPayableAzn).toBe(0);
      expect(res.towingFeeAzn).toBe(0);
      expect(res.storageFeeAzn).toBe(0);
      expect(res.discountedFineAzn).toBe(0);
    });
  });

  describe('auditTowingLegality', () => {
    it('flags towing as unlawful under İXM 96.2 when driver arrives before tow truck starts moving', () => {
      const audit = auditTowingLegality({
        violationCode: 'ixm_346_2_obstruction',
        driverPresentBeforeMovement: true,
        createdTrafficObstruction: true,
        parkedInDisabledSpotWithoutPermit: false,
        hasProtocolAndSealAct: true,
      });

      expect(audit.isTowingLawful).toBe(false);
      expect(audit.verdictCode).toBe('UNLAWFUL_DRIVER_PRESENT_IXM_96_2');
      expect(audit.exemptFromTowingAndStorageFees).toBe(true);
    });

    it('flags towing as unlawful under İXM 346.1 when there is no traffic obstruction and not a disabled bay', () => {
      const audit = auditTowingLegality({
        violationCode: 'ixm_346_1_standard_parking',
        driverPresentBeforeMovement: false,
        createdTrafficObstruction: false,
        parkedInDisabledSpotWithoutPermit: false,
        hasProtocolAndSealAct: true,
      });

      expect(audit.isTowingLawful).toBe(false);
      expect(audit.verdictCode).toBe('UNLAWFUL_NO_OBSTRUCTION_IXM_346_1');
      expect(audit.exemptFromTowingAndStorageFees).toBe(true);
    });

    it('flags procedural violation when protocol or door seal act is missing under İXM 96.3', () => {
      const audit = auditTowingLegality({
        violationCode: 'ixm_346_2_obstruction',
        driverPresentBeforeMovement: false,
        createdTrafficObstruction: true,
        parkedInDisabledSpotWithoutPermit: false,
        hasProtocolAndSealAct: false,
      });

      expect(audit.isTowingLawful).toBe(false);
      expect(audit.verdictCode).toBe('PROCEDURAL_VIOLATION_NO_ACT');
    });

    it('confirms lawful impound when statutory conditions and seal act are satisfied', () => {
      const audit = auditTowingLegality({
        violationCode: 'ixm_346_2_obstruction',
        driverPresentBeforeMovement: false,
        createdTrafficObstruction: true,
        parkedInDisabledSpotWithoutPermit: false,
        hasProtocolAndSealAct: true,
      });

      expect(audit.isTowingLawful).toBe(true);
      expect(audit.verdictCode).toBe('LAWFUL_IMPOUND');
    });
  });

  describe('utilities & certificate generation', () => {
    it('converts currencies accurately', () => {
      expect(convertImpoundCurrency(170, 'AZN')).toBe(170);
      expect(convertImpoundCurrency(170, 'USD')).toBe(100);
      expect(convertImpoundCurrency(185, 'EUR')).toBe(100);
    });

    it('validates 7-character alphanumeric FİN codes', () => {
      expect(validateReleaseFinCode('4AZ91K2')).toBe(true);
      expect(validateReleaseFinCode('123')).toBe(false);
      expect(validateReleaseFinCode('4AZ91K299')).toBe(false);
    });

    it('determines weight class from vehicle and generates a release pass', () => {
      expect(determineWeightClassFromVehicle(MOCK_VEHICLES[0])).toBe('passenger_under_3_5t');
      expect(determineWeightClassFromVehicle(null)).toBe('passenger_under_3_5t');

      const cost = calculateImpoundReleaseCost({
        violationCode: 'ixm_346_2_obstruction',
        weightClass: 'passenger_under_3_5t',
        hoursImpounded: 2,
        applyEarly50Discount: true,
      });

      const pass = generateImpoundReleasePass({
        plateNumber: '99-AA-001',
        vin: 'JTDBR32E800192841',
        vehicleTitle: 'Toyota Camry 2.5 Hybrid',
        ownerFullName: 'Əliyev Kamran Rəşid oğlu',
        ownerFinCode: '4AZ91K2',
        lot: MOCK_IMPOUND_LOTS[0],
        protocolSeries: 'İXP-9024185',
        costBreakdown: cost,
      });

      expect(pass.passNumber).toMatch(/^BDYP-CM-2026-\d{5}$/);
      expect(pass.gateBarrierPin).toMatch(/^\d{6}$/);
      expect(pass.totalPaidAzn).toBe(40.5);
      expect(pass.status).toBe('READY_FOR_GATE_EXIT');
    });
  });
});

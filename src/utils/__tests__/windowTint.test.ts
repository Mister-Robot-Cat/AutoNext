import { describe, it, expect } from 'vitest';
import {
  isSeasonalCurtainPeriod,
  evaluateZoneCompliance,
  evaluateOverallCompliance,
  calculatePermitCost,
  simulatePhotometerReading,
  generateTintPermitCertificate,
  STATUTORY_VLT_LIMITS,
  STATUTORY_FINE_AZN,
} from '../windowTint';
import { WindowTintConfig } from '../../types/windowTint';

describe('Window Tint Utility Engine (BDYP Standartları)', () => {
  describe('isSeasonalCurtainPeriod', () => {
    it('returns true during the legal seasonal curtain period (May 1 to Nov 15)', () => {
      expect(isSeasonalCurtainPeriod(new Date('2026-05-01T10:00:00'))).toBe(true);
      expect(isSeasonalCurtainPeriod(new Date('2026-07-15T12:00:00'))).toBe(true);
      expect(isSeasonalCurtainPeriod(new Date('2026-10-31T23:59:59'))).toBe(true);
      expect(isSeasonalCurtainPeriod(new Date('2026-11-15T18:00:00'))).toBe(true);
    });

    it('returns false outside the seasonal curtain period (Nov 16 to April 30)', () => {
      expect(isSeasonalCurtainPeriod(new Date('2026-11-16T00:01:00'))).toBe(false);
      expect(isSeasonalCurtainPeriod(new Date('2026-12-25T12:00:00'))).toBe(false);
      expect(isSeasonalCurtainPeriod(new Date('2026-01-10T10:00:00'))).toBe(false);
      expect(isSeasonalCurtainPeriod(new Date('2026-04-30T23:59:00'))).toBe(false);
    });
  });

  describe('evaluateZoneCompliance', () => {
    it('evaluates windshield compliance correctly', () => {
      const ok = evaluateZoneCompliance('windshield', 75);
      expect(ok.status).toBe('compliant');
      expect(ok.minRequiredVlt).toBe(STATUTORY_VLT_LIMITS.windshield);

      const fail = evaluateZoneCompliance('windshield', 74);
      expect(fail.status).toBe('violation');
      expect(fail.message.az).toContain('Cərimə riski: 150 AZN');
    });

    it('evaluates front side window compliance correctly', () => {
      const ok = evaluateZoneCompliance('frontSide', 70);
      expect(ok.status).toBe('compliant');
      expect(ok.minRequiredVlt).toBe(STATUTORY_VLT_LIMITS.frontSide);

      const fail = evaluateZoneCompliance('frontSide', 65);
      expect(fail.status).toBe('violation');
    });

    it('evaluates rear side windows with and without permit and curtains', () => {
      // Standard without permit (>=60% passes)
      const standardPass = evaluateZoneCompliance('rearSide', 65, { hasPermit: false });
      expect(standardPass.status).toBe('compliant');

      // Without permit (<60% fails)
      const standardFail = evaluateZoneCompliance('rearSide', 20, {
        hasPermit: false,
        hasFactoryCurtains: false,
        isSeasonalActive: false,
      });
      expect(standardFail.status).toBe('violation');

      // With permit (even 5% passes)
      const permitPass = evaluateZoneCompliance('rearSide', 5, {
        hasPermit: true,
        permitCoverage: 'rear_side_only',
      });
      expect(permitPass.status).toBe('compliant');
      expect(permitPass.isPermitCovered).toBe(true);

      // Seasonal curtains in season
      const seasonalPass = evaluateZoneCompliance('rearSide', 20, {
        hasPermit: false,
        hasFactoryCurtains: true,
        isSeasonalActive: true,
      });
      expect(seasonalPass.status).toBe('warning_seasonal');
      expect(seasonalPass.isSeasonalPermitted).toBe(true);
    });

    it('evaluates rear window with and without all_rear permit', () => {
      // Standard without permit (>=50% passes)
      const standardPass = evaluateZoneCompliance('rear', 50, { hasPermit: false });
      expect(standardPass.status).toBe('compliant');

      // <50% fails without all_rear permit
      const standardFail = evaluateZoneCompliance('rear', 15, {
        hasPermit: true,
        permitCoverage: 'rear_side_only',
      });
      expect(standardFail.status).toBe('violation');

      // <50% passes with all_rear permit
      const permitPass = evaluateZoneCompliance('rear', 10, {
        hasPermit: true,
        permitCoverage: 'all_rear',
      });
      expect(permitPass.status).toBe('compliant');
      expect(permitPass.isPermitCovered).toBe(true);
    });
  });

  describe('evaluateOverallCompliance', () => {
    it('returns compliant report for factory configuration', () => {
      const config: WindowTintConfig = {
        windshieldVlt: 80,
        frontSideVlt: 75,
        rearSideVlt: 70,
        rearVlt: 65,
        hasPermit: false,
      };

      const report = evaluateOverallCompliance(config, new Date('2026-06-15'));
      expect(report.isCompliant).toBe(true);
      expect(report.overallStatus).toBe('compliant');
      expect(report.fineRiskAzn).toBe(0);
      expect(report.zones.length).toBe(4);
    });

    it('returns violation and 150 AZN fine risk for dark front side tint', () => {
      const config: WindowTintConfig = {
        windshieldVlt: 78,
        frontSideVlt: 35, // Violation!
        rearSideVlt: 10,
        rearVlt: 10,
        hasPermit: true,
        permitCoverage: 'all_rear',
      };

      const report = evaluateOverallCompliance(config);
      expect(report.isCompliant).toBe(false);
      expect(report.overallStatus).toBe('violation');
      expect(report.fineRiskAzn).toBe(STATUTORY_FINE_AZN);
      expect(report.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('calculatePermitCost', () => {
    it('calculates individual rear side only tariff', () => {
      const cost = calculatePermitCost('individual', 'rear_side_only', 'AZN');
      expect(cost.stateDutyAzn).toBe(50);
      expect(cost.serviceFeeAzn).toBe(2);
      expect(cost.totalAzn).toBe(52);
      expect(cost.totalConverted).toBe(52);
    });

    it('calculates individual all rear tariff', () => {
      const cost = calculatePermitCost('individual', 'all_rear', 'AZN');
      expect(cost.stateDutyAzn).toBe(100);
      expect(cost.totalAzn).toBe(102);
    });

    it('calculates corporate entity tariffs', () => {
      const rearOnly = calculatePermitCost('entity', 'rear_side_only', 'AZN');
      expect(rearOnly.stateDutyAzn).toBe(100);
      expect(rearOnly.totalAzn).toBe(102);

      const allRear = calculatePermitCost('entity', 'all_rear', 'AZN');
      expect(allRear.stateDutyAzn).toBe(200);
      expect(allRear.totalAzn).toBe(202);
    });

    it('converts to foreign currencies properly', () => {
      const costUsd = calculatePermitCost('individual', 'rear_side_only', 'USD');
      expect(costUsd.currency).toBe('USD');
      expect(costUsd.totalConverted).toBe(Math.round(52 * 0.588));

      const costEur = calculatePermitCost('individual', 'rear_side_only', 'EUR');
      expect(costEur.currency).toBe('EUR');
      expect(costEur.totalConverted).toBe(Math.round(52 * 0.543));
    });
  });

  describe('simulatePhotometerReading', () => {
    it('returns calibrated photometer reading with tolerance and operator ID', () => {
      const reading = simulatePhotometerReading('frontSide', 72, 5);
      expect(reading.zone).toBe('frontSide');
      expect(typeof reading.measuredVlt).toBe('number');
      expect(reading.marginOfError).toBe(1.5);
      expect(reading.operatorId).toContain('BDYP-OP-');
      expect(reading.status).toBe('compliant');
    });

    it('detects optical violation when measured VLT falls below statutory limit', () => {
      const reading = simulatePhotometerReading('windshield', 50, 0);
      expect(reading.status).toBe('violation');
      expect(reading.measuredVlt).toBeLessThan(75);
    });
  });

  describe('generateTintPermitCertificate', () => {
    it('generates complete official electronic permit certificate with 1-year validity', () => {
      const cert = generateTintPermitCertificate({
        plateNumber: '10-XY-555',
        vin: 'WBA5A7C50JB192841',
        ownerName: 'Elmir Qasımov',
        applicantType: 'individual',
        coverage: 'all_rear',
        issueDate: '2026-05-10',
      });

      expect(cert.permitNumber).toMatch(/^BDYP-PL-2026-\d{5}$/);
      expect(cert.issueDate).toBe('2026-05-10');
      expect(cert.expiryDate).toBe('2027-05-10');
      expect(cert.plateNumber).toBe('10-XY-555');
      expect(cert.vin).toBe('WBA5A7C50JB192841');
      expect(cert.feeAzn).toBe(102);
      expect(cert.status).toBe('active');
      expect(cert.securityHash).toContain('SHA256-');
      expect(cert.qrCodeUrl).toContain(cert.permitNumber);
    });
  });
});

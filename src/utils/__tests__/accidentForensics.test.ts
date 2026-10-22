import { describe, it, expect } from 'vitest';
import {
  calculateSpeedFromSkid,
  analyzePedestrianAvoidance,
  evaluateLegalLiability,
  calculateInsuranceDamage,
  generateForensicReport,
  ROAD_SURFACE_PROFILES
} from '../accidentForensics';

describe('Accident Forensics Utility Engine', () => {
  describe('ROAD_SURFACE_PROFILES', () => {
    it('contains all required road surface profiles with authentic mu values', () => {
      expect(ROAD_SURFACE_PROFILES.dry_asphalt.muBase).toBe(0.75);
      expect(ROAD_SURFACE_PROFILES.wet_asphalt.muBase).toBe(0.45);
      expect(ROAD_SURFACE_PROFILES.packed_snow.muBase).toBe(0.22);
      expect(ROAD_SURFACE_PROFILES.ice_black_ice.muBase).toBe(0.12);
      expect(ROAD_SURFACE_PROFILES.gravel_dirt.muBase).toBe(0.55);
    });
  });

  describe('calculateSpeedFromSkid', () => {
    it('calculates vehicle speed from skid mark length on dry asphalt', () => {
      // 30m skid mark, dry asphalt (mu=0.75), ABS active (eta=1.05)
      // v = sqrt(254 * 0.75 * 1.05 * 30) = sqrt(6000.75) = ~77.46 km/h
      const result = calculateSpeedFromSkid(30, 'dry_asphalt', 0, 'abs_active', 60);
      expect(result.calculatedSpeedKmh).toBeGreaterThan(75);
      expect(result.calculatedSpeedKmh).toBeLessThan(80);
      expect(result.isSpeedingExceeded).toBe(true);
      expect(result.excessSpeedKmh).toBeCloseTo(result.calculatedSpeedKmh - 60, 1);
      expect(result.totalStoppingDistanceM).toBeGreaterThan(30);
      expect(result.kineticEnergyKj).toBeGreaterThan(0);
    });

    it('accounts for downhill slope reducing friction and uphill slope increasing friction', () => {
      const flat = calculateSpeedFromSkid(25, 'dry_asphalt', 0);
      const downhill = calculateSpeedFromSkid(25, 'dry_asphalt', -5); // 5% downhill
      const uphill = calculateSpeedFromSkid(25, 'dry_asphalt', 5); // 5% uphill

      // Effective mu downhill is lower, so for the same skid length, initial speed was lower
      expect(downhill.effectiveMu).toBeLessThan(flat.effectiveMu);
      expect(downhill.calculatedSpeedKmh).toBeLessThan(flat.calculatedSpeedKmh);

      expect(uphill.effectiveMu).toBeGreaterThan(flat.effectiveMu);
      expect(uphill.calculatedSpeedKmh).toBeGreaterThan(flat.calculatedSpeedKmh);
    });

    it('handles faulty ABS and truck air brakes efficiency factor', () => {
      const activeAbs = calculateSpeedFromSkid(20, 'dry_asphalt', 0, 'abs_active');
      const faultyAbs = calculateSpeedFromSkid(20, 'dry_asphalt', 0, 'abs_faulty');
      const airBrakes = calculateSpeedFromSkid(20, 'dry_asphalt', 0, 'air_brakes_truck');

      expect(faultyAbs.efficiencyFactor).toBe(0.85);
      expect(airBrakes.efficiencyFactor).toBe(0.90);
      expect(activeAbs.calculatedSpeedKmh).toBeGreaterThan(faultyAbs.calculatedSpeedKmh);
    });

    it('handles zero skid mark length safely', () => {
      const zero = calculateSpeedFromSkid(0, 'dry_asphalt');
      expect(zero.calculatedSpeedKmh).toBe(0);
      expect(zero.totalStoppingDistanceM).toBe(0);
      expect(zero.kineticEnergyKj).toBe(0);
    });
  });

  describe('analyzePedestrianAvoidance', () => {
    it('detects technical possibility when stopping distance is less than hazard distance', () => {
      // 50 km/h, hazard at 50 meters on dry asphalt -> ample stopping distance (~27m)
      const result = analyzePedestrianAvoidance(50, 50, 'dry_asphalt', 0.9);
      expect(result.driverHadTechnicalPossibility).toBe(true);
      expect(result.marginDistanceM).toBeGreaterThan(0);
      expect(result.impactSpeedKmh).toBe(0);
      expect(result.conclusionAz).toContain('TEXNİKİ İMKANI OLMUŞDUR');
      expect(result.conclusionEn).toContain('Driver HAD technical possibility');
    });

    it('detects no technical possibility and calculates residual impact speed when hazard is too close', () => {
      // 80 km/h, hazard suddenly appears at 15 meters -> impossible to stop
      const result = analyzePedestrianAvoidance(15, 80, 'dry_asphalt', 0.9);
      expect(result.driverHadTechnicalPossibility).toBe(false);
      expect(result.marginDistanceM).toBeLessThan(0);
      expect(result.impactSpeedKmh).toBeGreaterThan(0);
      expect(result.conclusionAz).toContain('TEXNİKİ İMKANI OLMAMIŞDIR');
      expect(result.conclusionEn).toContain('Driver DID NOT have technical possibility');
    });
  });

  describe('evaluateLegalLiability', () => {
    it('classifies property damage only without injuries as administrative offence (IXM 327.1)', () => {
      const result = evaluateLegalLiability('none_property_only', 'sober', 20, false);
      expect(result.framework).toBe('İXM');
      expect(result.article).toContain('327.1');
      expect(result.isCriminalProsecution).toBe(false);
      expect(result.prisonTermYearsMax).toBe(0);
    });

    it('classifies property damage with DUI as IXM 333.1 with license suspension', () => {
      const result = evaluateLegalLiability('none_property_only', 'alcohol_intoxicated');
      expect(result.framework).toBe('İXM');
      expect(result.article).toContain('333.1');
      expect(result.fineAzn).toBe(400);
      expect(result.licenseSuspensionYears).toBe(1);
    });

    it('classifies light bodily harm as administrative offence (IXM 327.8)', () => {
      const result = evaluateLegalLiability('light_harm', 'sober');
      expect(result.framework).toBe('İXM');
      expect(result.article).toContain('327.8');
      expect(result.fineAzn).toBe(200);
      expect(result.isCriminalProsecution).toBe(false);
    });

    it('classifies moderate bodily harm as Criminal Code Article 263.1', () => {
      const result = evaluateLegalLiability('moderate_harm', 'sober', 0, false);
      expect(result.framework).toBe('CM');
      expect(result.article).toContain('263.1');
      expect(result.isCriminalProsecution).toBe(true);
      expect(result.prisonTermYearsMax).toBe(2);
    });

    it('classifies severe bodily harm as Criminal Code Article 263.1-1', () => {
      const result = evaluateLegalLiability('severe_harm', 'sober');
      expect(result.framework).toBe('CM');
      expect(result.article).toContain('263.1-1');
      expect(result.isCriminalProsecution).toBe(true);
      expect(result.prisonTermYearsMin).toBe(2);
      expect(result.prisonTermYearsMax).toBe(5);
    });

    it('classifies fatal collision as Criminal Code Article 263.2', () => {
      const result = evaluateLegalLiability('fatal_one', 'sober');
      expect(result.framework).toBe('CM');
      expect(result.article).toContain('263.2');
      expect(result.isCriminalProsecution).toBe(true);
      expect(result.prisonTermYearsMax).toBe(6);
    });

    it('classifies multiple fatalities as Criminal Code Article 263.3 with 5-10 years prison', () => {
      const result = evaluateLegalLiability('fatal_multiple', 'sober');
      expect(result.framework).toBe('CM');
      expect(result.article).toContain('263.3');
      expect(result.isCriminalProsecution).toBe(true);
      expect(result.prisonTermYearsMin).toBe(5);
      expect(result.prisonTermYearsMax).toBe(10);
    });

    it('applies aggravated DUI criminal penalties under Article 263-1 for intoxication', () => {
      const moderateDui = evaluateLegalLiability('moderate_harm', 'alcohol_intoxicated');
      expect(moderateDui.article).toContain('263-1.1');

      const severeDui = evaluateLegalLiability('severe_harm', 'narcotic_intoxicated');
      expect(severeDui.article).toContain('263-1.2');

      const fatalOneDui = evaluateLegalLiability('fatal_one', 'alcohol_intoxicated');
      expect(fatalOneDui.article).toContain('263-1.3');
      expect(fatalOneDui.prisonTermYearsMin).toBe(5);
      expect(fatalOneDui.prisonTermYearsMax).toBe(8);

      const fatalMultipleDui = evaluateLegalLiability('fatal_multiple', 'alcohol_intoxicated');
      expect(fatalMultipleDui.article).toContain('263-1.4');
      expect(fatalMultipleDui.prisonTermYearsMin).toBe(8);
      expect(fatalMultipleDui.prisonTermYearsMax).toBe(13);
    });

    it('applies hit and run qualification under Article 264', () => {
      const hitAndRun = evaluateLegalLiability('moderate_harm', 'sober', 0, true);
      expect(hitAndRun.article).toContain('264');
      expect(hitAndRun.descriptionAz).toContain('qaçma');
    });
  });

  describe('calculateInsuranceDamage', () => {
    it('calculates ISB compulsory cover capped at 5000 AZN and out-of-pocket for excess', () => {
      // 8,000 AZN property damage, 100% driver fault
      const result = calculateInsuranceDamage(8000, 0, 100, false, 'AZN');
      expect(result.isbPropertyPayoutAzn).toBe(5000); // capped at 5000
      expect(result.driverOutOfPocketAzn).toBe(3000); // 8000 - 5000
    });

    it('calculates partial driver fault liability', () => {
      // 6,000 AZN property damage, 50% driver fault -> driver liability is 3,000 AZN
      const result = calculateInsuranceDamage(6000, 0, 50, false, 'AZN');
      expect(result.isbPropertyPayoutAzn).toBe(3000);
      expect(result.driverOutOfPocketAzn).toBe(0); // within 5000 cap
    });

    it('calculates KASKO coverage for driver own vehicle', () => {
      const withKasko = calculateInsuranceDamage(5000, 0, 100, true, 'AZN');
      const withoutKasko = calculateInsuranceDamage(5000, 0, 100, false, 'AZN');
      expect(withKasko.kaskoCoverAzn).toBeGreaterThan(0);
      expect(withoutKasko.kaskoCoverAzn).toBe(0);
    });

    it('converts amounts to USD and EUR accurately', () => {
      const usdResult = calculateInsuranceDamage(4000, 1000, 100, true, 'USD');
      expect(usdResult.convertedAmounts.currency).toBe('USD');
      expect(usdResult.convertedAmounts.propertyDamage).toBeCloseTo(4000 * 0.5882, -1);

      const eurResult = calculateInsuranceDamage(4000, 1000, 100, true, 'EUR');
      expect(eurResult.convertedAmounts.currency).toBe('EUR');
      expect(eurResult.convertedAmounts.propertyDamage).toBeCloseTo(4000 * 0.5405, -1);
    });
  });

  describe('generateForensicReport', () => {
    it('generates an official forensic conclusion report with verification hashes', () => {
      const report = generateForensicReport({
        vehiclePlate: '10-AA-818',
        vehicleModel: 'Hyundai Santa Fe',
        incidentLocation: 'Bakı-Şamaxı yolu km 102',
        skidMarkLengthM: 35,
        roadSurface: 'dry_asphalt',
        speedLimitKmh: 60,
        hazardDistanceM: 50,
        injurySeverity: 'moderate_harm',
        driverSobriety: 'sober'
      });

      expect(report.reportNumber).toMatch(/^MEM-YNH-2026-\d{5}$/);
      expect(report.digitalQrChecksum).toMatch(/^QR-MEM-YNH-/);
      expect(report.simaSignatureHash).toMatch(/^SIMA-AZ-EXPERT-/);
      expect(report.vehiclePlate).toBe('10-AA-818');
      expect(report.legalArticle).toContain('263.1');
      expect(report.isCriminal).toBe(true);
      expect(report.institutionAz).toContain('Ədliyyə Nazirliyi Məhkəmə Ekspertizası Mərkəzi');
    });
  });
});

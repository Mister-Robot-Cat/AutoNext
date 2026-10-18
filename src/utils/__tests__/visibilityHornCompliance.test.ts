import { describe, it, expect } from 'vitest';
import {
  evaluateWindshieldAndWipers,
  evaluateAcousticHornAndTachograph,
  calculateWasherFreezeSafety,
  estimateVisibilityRestorationCost,
  generateVisibilityComplianceCertificate,
  convertFromAzn,
} from '../visibilityHornCompliance';

describe('visibilityHornCompliance utility engine (YHQ Annex 1 Sections IV & VII)', () => {
  describe('evaluateWindshieldAndWipers', () => {
    it('passes a fully compliant vehicle with clean windshield, 45 cpm wipers, winter fluid, working defroster, mirrors, and mudguards', () => {
      const res = evaluateWindshieldAndWipers({
        windshieldZone: 'clean',
        damageType: 'none',
        driverWiperWorking: true,
        passengerWiperWorking: true,
        wiperCyclesPerMinute: 45,
        washerFluidGrade: 'winter_minus_15',
        ambientTempC: 4,
        defrosterWorking: true,
        leftMirrorIntact: true,
        rightMirrorIntact: true,
        interiorMirrorIntact: true,
        sunVisorIntact: true,
        rearMudguardsPresent: true,
        isRainingOrSnowing: true,
      });

      expect(res.isCompliant).toBe(true);
      expect(res.passesTechnicalInspection).toBe(true);
      expect(res.prohibitsOperationInPrecipitation).toBe(false);
      expect(res.fineAzn).toBe(0);
      expect(res.safetyScore).toBe(100);
      expect(res.violationsAz).toHaveLength(0);
    });

    it('fails technical inspection when a linear crack >10cm exists in the driver sweep Zone A (YHQ Annex 1 Clause 7.3)', () => {
      const res = evaluateWindshieldAndWipers({
        windshieldZone: 'driver_sweep_a',
        damageType: 'linear_crack_over_10cm',
        driverWiperWorking: true,
        passengerWiperWorking: true,
        wiperCyclesPerMinute: 45,
        washerFluidGrade: 'winter_minus_15',
        ambientTempC: 5,
        defrosterWorking: true,
        leftMirrorIntact: true,
        rightMirrorIntact: true,
        interiorMirrorIntact: true,
        sunVisorIntact: true,
        rearMudguardsPresent: true,
        isRainingOrSnowing: false,
      });

      expect(res.windshieldPass).toBe(false);
      expect(res.passesTechnicalInspection).toBe(false);
      expect(res.fineAzn).toBe(50);
      expect(res.discountedFineAzn).toBe(25);
      expect(res.safetyScore).toBeLessThan(70);
    });

    it('triggers immediate operation prohibition under IXM Article 96.1.4 when driver-side wiper fails during rain/snow', () => {
      const res = evaluateWindshieldAndWipers({
        windshieldZone: 'clean',
        damageType: 'none',
        driverWiperWorking: false,
        passengerWiperWorking: true,
        wiperCyclesPerMinute: 0,
        washerFluidGrade: 'winter_minus_15',
        ambientTempC: 2,
        defrosterWorking: true,
        leftMirrorIntact: true,
        rightMirrorIntact: true,
        interiorMirrorIntact: true,
        sunVisorIntact: true,
        rearMudguardsPresent: true,
        isRainingOrSnowing: true,
      });

      expect(res.wipersPass).toBe(false);
      expect(res.prohibitsOperationInPrecipitation).toBe(true);
      expect(res.fineAzn).toBe(50);
      expect(res.ixmArticlesTriggered.some((a) => a.includes('96.1.4'))).toBe(true);
    });

    it('detects slow wipers (<35 cpm), frozen summer washer water at -8C, broken defroster, and missing rear mudguards', () => {
      const res = evaluateWindshieldAndWipers({
        windshieldZone: 'clean',
        damageType: 'none',
        driverWiperWorking: true,
        passengerWiperWorking: true,
        wiperCyclesPerMinute: 24,
        washerFluidGrade: 'summer_water',
        ambientTempC: -8,
        defrosterWorking: false,
        leftMirrorIntact: false,
        rightMirrorIntact: true,
        interiorMirrorIntact: true,
        sunVisorIntact: false,
        rearMudguardsPresent: false,
        isRainingOrSnowing: false,
      });

      expect(res.wipersPass).toBe(false);
      expect(res.washerFrozen).toBe(true);
      expect(res.washerPass).toBe(false);
      expect(res.defrosterAndMirrorsPass).toBe(false);
      expect(res.mudguardsPass).toBe(false);
      expect(res.fineAzn).toBe(50);
    });
  });

  describe('evaluateAcousticHornAndTachograph', () => {
    it('approves OEM dual-tone horn within 93-112 dBA and intact speedometer', () => {
      const res = evaluateAcousticHornAndTachograph({
        hornType: 'oem_dual_tone',
        measuredDbA: 104,
        unnecessaryHonkingInCity: false,
        vehicleCategory: 'M1',
        speedometerWorking: true,
        tachographInstalledAndSealed: true,
      });

      expect(res.isCompliant).toBe(true);
      expect(res.hornLegal).toBe(true);
      expect(res.totalFineAzn).toBe(0);
      expect(res.requiresDeviceConfiscation).toBe(false);
      expect(res.prohibitsOperation).toBe(false);
    });

    it('flags prohibited polyphonic FIFA horn with 150 AZN fine and operation prohibition (IXM 342.2-1)', () => {
      const res = evaluateAcousticHornAndTachograph({
        hornType: 'fifa_polyphonic',
        measuredDbA: 116,
        unnecessaryHonkingInCity: false,
        vehicleCategory: 'M1',
        speedometerWorking: true,
        tachographInstalledAndSealed: true,
      });

      expect(res.isCompliant).toBe(false);
      expect(res.hornLegal).toBe(false);
      expect(res.prohibitsOperation).toBe(true);
      expect(res.equipmentFineAzn).toBe(150);
      expect(res.totalFineAzn).toBe(150);
    });

    it('flags unauthorized SGU police siren with 800 AZN fine and mandatory court confiscation (IXM 342.9)', () => {
      const res = evaluateAcousticHornAndTachograph({
        hornType: 'sgu_police_siren',
        measuredDbA: 120,
        unnecessaryHonkingInCity: true,
        vehicleCategory: 'M1',
        speedometerWorking: true,
        tachographInstalledAndSealed: true,
      });

      expect(res.requiresDeviceConfiscation).toBe(true);
      expect(res.prohibitsOperation).toBe(true);
      expect(res.equipmentFineAzn).toBe(800);
      expect(res.honkingFineAzn).toBe(30);
      expect(res.totalFineAzn).toBe(830);
    });

    it('flags unsealed digital tachograph on N2/N3 heavy trucks (YHQ Annex 1 Clause 7.4)', () => {
      const res = evaluateAcousticHornAndTachograph({
        hornType: 'oem_dual_tone',
        measuredDbA: 104,
        unnecessaryHonkingInCity: false,
        vehicleCategory: 'N2_N3',
        speedometerWorking: true,
        tachographInstalledAndSealed: false,
      });

      expect(res.tachographCompliant).toBe(false);
      expect(res.isCompliant).toBe(false);
      expect(res.equipmentFineAzn).toBe(50);
    });
  });

  describe('calculateWasherFreezeSafety & estimateVisibilityRestorationCost & certificate generation', () => {
    it('calculates freeze safety and isopropyl recommendations accurately', () => {
      const frozen = calculateWasherFreezeSafety('summer_water', -12);
      expect(frozen.willFreeze).toBe(true);
      expect(frozen.recommendedIsopropylPercent).toBe(30);

      const safe = calculateWasherFreezeSafety('arctic_minus_30', -18);
      expect(safe.willFreeze).toBe(false);
      expect(safe.safetyMarginC).toBe(12);
    });

    it('calculates multi-currency restoration costs and generates BDYP-GOR-2026 certificate', () => {
      const costAzn = estimateVisibilityRestorationCost(
        ['pkg-bosch-wipers', 'pkg-hella-horn'],
        'AZN'
      );
      expect(costAzn.partsTotalAzn).toBe(120);
      expect(costAzn.laborTotalAzn).toBe(50);
      expect(costAzn.totalAzn).toBe(170);
      expect(convertFromAzn(170, 'USD')).toBe(100);

      const ws = evaluateWindshieldAndWipers({
        windshieldZone: 'clean',
        damageType: 'none',
        driverWiperWorking: true,
        passengerWiperWorking: true,
        wiperCyclesPerMinute: 45,
        washerFluidGrade: 'winter_minus_15',
        ambientTempC: 5,
        defrosterWorking: true,
        leftMirrorIntact: true,
        rightMirrorIntact: true,
        interiorMirrorIntact: true,
        sunVisorIntact: true,
        rearMudguardsPresent: true,
        isRainingOrSnowing: false,
      });
      const hr = evaluateAcousticHornAndTachograph({
        hornType: 'oem_dual_tone',
        measuredDbA: 104,
        unnecessaryHonkingInCity: false,
        vehicleCategory: 'M1',
        speedometerWorking: true,
        tachographInstalledAndSealed: true,
      });

      const cert = generateVisibilityComplianceCertificate({
        plateNumber: '99-XX-777',
        vin: 'JTMAB3FV80D129841',
        vehicleTitle: 'Toyota Land Cruiser 300',
        centerNameAz: 'BDYP Zabrat',
        windshieldResult: ws,
        hornResult: hr,
        wiperCyclesPerMin: 45,
        hornMeasuredDbA: 104,
        hornTypeAz: 'OEM Dual Tone',
      });

      expect(cert.certificateNumber).toMatch(/^BDYP-GOR-2026-\d{5}$/);
      expect(cert.overallStatus).toBe('PASS');
    });
  });
});

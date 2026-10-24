import { describe, it, expect } from 'vitest';
import {
  evaluateAdasTolerances,
  calculateAdasPricing,
  getRequiredSystemsForTrigger,
  generateAdasCertificateNumber,
  generateAdasSecurityHash,
  filterAdasCenters,
  findAdasCertificateByQuery,
  simulateDynamicRoadDrive,
  getDtcCodeDetails
} from '../adasCalibration';
import { ACCREDITED_ADAS_CENTERS } from '../../data/mockAdasData';

describe('adasCalibration utility suite', () => {
  describe('evaluateAdasTolerances', () => {
    it('passes when all parameters are well within statutory UNECE tolerances', () => {
      const result = evaluateAdasTolerances({
        distanceMm: 2000,
        centerlineOffsetMm: 2,
        cameraPitchDeg: 0.10,
        cameraYawDeg: -0.05,
        radarPitchDeg: 0.15,
        radarYawDeg: 0.10
      });

      expect(result.allPassed).toBe(true);
      expect(result.isCameraCompliant).toBe(true);
      expect(result.isRadarCompliant).toBe(true);
      expect(result.isLaserCompliant).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('detects camera pitch angle violation exceeding 0.20° limit', () => {
      const result = evaluateAdasTolerances({
        distanceMm: 2000,
        centerlineOffsetMm: 1,
        cameraPitchDeg: 0.35,
        cameraYawDeg: 0.05,
        radarPitchDeg: 0.1,
        radarYawDeg: 0.1
      });

      expect(result.allPassed).toBe(false);
      expect(result.isCameraCompliant).toBe(false);
      expect(result.errors.some(e => e.includes('Ön kamera şaquli bucağı'))).toBe(true);
    });

    it('detects camera yaw angle violation exceeding 0.20° limit', () => {
      const result = evaluateAdasTolerances({
        distanceMm: 2000,
        centerlineOffsetMm: 2,
        cameraPitchDeg: 0.05,
        cameraYawDeg: -0.28,
        radarPitchDeg: 0.1,
        radarYawDeg: 0.1
      });

      expect(result.allPassed).toBe(false);
      expect(result.isCameraCompliant).toBe(false);
      expect(result.errors.some(e => e.includes('Ön kamera üfüqi bucağı'))).toBe(true);
    });

    it('detects radar pitch angle violation exceeding 0.30° limit', () => {
      const result = evaluateAdasTolerances({
        distanceMm: 2000,
        centerlineOffsetMm: 2,
        cameraPitchDeg: 0.05,
        cameraYawDeg: 0.05,
        radarPitchDeg: 0.45,
        radarYawDeg: 0.1
      });

      expect(result.allPassed).toBe(false);
      expect(result.isRadarCompliant).toBe(false);
      expect(result.errors.some(e => e.includes('Ön 77 GHz radar şaquli bucağı'))).toBe(true);
    });

    it('detects laser centerline offset violation exceeding 5 mm limit', () => {
      const result = evaluateAdasTolerances({
        distanceMm: 2000,
        centerlineOffsetMm: 8,
        cameraPitchDeg: 0.05,
        cameraYawDeg: 0.05,
        radarPitchDeg: 0.1,
        radarYawDeg: 0.1
      });

      expect(result.allPassed).toBe(false);
      expect(result.isLaserCompliant).toBe(false);
      expect(result.errors.some(e => e.includes('Lazer mərkəz oxundan kənaraçıxma'))).toBe(true);
    });
  });

  describe('calculateAdasPricing', () => {
    it('calculates standard package pricing including 18% VAT', () => {
      const pricing = calculateAdasPricing('front_camera_static', 'AZN', false, false);
      expect(pricing.basePriceAzn).toBe(80);
      expect(pricing.dtcClearanceFeeAzn).toBe(0);
      expect(pricing.expressBayFeeAzn).toBe(0);
      expect(pricing.vatAzn).toBe(14.4);
      expect(pricing.totalPriceAzn).toBe(94.4);
      expect(pricing.currency).toBe('AZN');
    });

    it('applies DTC clearance fee and express bay fee correctly', () => {
      const pricing = calculateAdasPricing('front_camera_static', 'AZN', true, true);
      expect(pricing.basePriceAzn).toBe(80);
      expect(pricing.dtcClearanceFeeAzn).toBe(20);
      expect(pricing.expressBayFeeAzn).toBe(30);
      // Subtotal = 130 -> VAT 18% = 23.4 -> Total = 153.4
      expect(pricing.totalPriceAzn).toBe(153.4);
      expect(pricing.estimatedDurationMinutes).toBeLessThan(45);
    });

    it('supports currency conversion to USD and EUR', () => {
      const usdPricing = calculateAdasPricing('front_radar_77ghz', 'USD', false, false);
      expect(usdPricing.currency).toBe('USD');
      expect(usdPricing.totalPriceConverted).toBeCloseTo(usdPricing.totalPriceAzn / 1.70, 2);

      const eurPricing = calculateAdasPricing('front_radar_77ghz', 'EUR', false, false);
      expect(eurPricing.currency).toBe('EUR');
      expect(eurPricing.totalPriceConverted).toBeCloseTo(eurPricing.totalPriceAzn / 1.85, 2);
    });
  });

  describe('getRequiredSystemsForTrigger', () => {
    it('identifies systems required after windshield replacement', () => {
      const systems = getRequiredSystemsForTrigger('windshield_replacement');
      expect(systems).toContain('AEB');
      expect(systems).toContain('LKA');
      expect(systems).toContain('TSR');
    });

    it('identifies systems required after bumper collision', () => {
      const systems = getRequiredSystemsForTrigger('bumper_collision');
      expect(systems).toContain('AEB');
      expect(systems).toContain('ACC');
    });

    it('identifies systems required after quarter collision', () => {
      const systems = getRequiredSystemsForTrigger('quarter_collision');
      expect(systems).toContain('BSM');
    });
  });

  describe('generateAdasCertificateNumber & generateAdasSecurityHash', () => {
    it('generates state standard format certificate number', () => {
      const certNo = generateAdasCertificateNumber();
      expect(certNo).toMatch(/^AZS-ADAS-2026-\d{5}$/);
    });

    it('generates consistent 32-character security hash', () => {
      const hash1 = generateAdasSecurityHash('90-OJ-055', 'WBA53AH07PCH28194', 'AZS-ADAS-2026-08412');
      const hash2 = generateAdasSecurityHash('90-OJ-055', 'WBA53AH07PCH28194', 'AZS-ADAS-2026-08412');
      expect(hash1).toHaveLength(32);
      expect(hash1).toBe(hash2);
    });
  });

  describe('filterAdasCenters', () => {
    it('returns all centers when query is blank', () => {
      const centers = filterAdasCenters('', 'all');
      expect(centers.length).toBe(ACCREDITED_ADAS_CENTERS.length);
    });

    it('filters centers by district', () => {
      const centers = filterAdasCenters('', 'Xətai');
      expect(centers.every(c => c.district.toLowerCase() === 'xətai')).toBe(true);
      expect(centers.length).toBeGreaterThan(0);
    });

    it('filters centers by equipment keyword', () => {
      const centers = filterAdasCenters('Autel', 'all');
      expect(centers.every(c => c.equipment.includes('Autel') || c.nameAz.includes('Autel'))).toBe(true);
    });
  });

  describe('findAdasCertificateByQuery', () => {
    it('locates certificate by plate number with or without hyphens', () => {
      const cert = findAdasCertificateByQuery('90-OJ-055');
      expect(cert).toBeDefined();
      expect(cert?.vehiclePlate).toBe('90-OJ-055');

      const certNoHyphen = findAdasCertificateByQuery('90OJ055');
      expect(certNoHyphen).toBeDefined();
      expect(certNoHyphen?.vehiclePlate).toBe('90-OJ-055');
    });

    it('locates certificate by VIN', () => {
      const cert = findAdasCertificateByQuery('WBA53AH07PCH28194');
      expect(cert).toBeDefined();
      expect(cert?.certificateNo).toBe('AZS-ADAS-2026-08412');
    });

    it('returns undefined for non-existent records or blank queries', () => {
      expect(findAdasCertificateByQuery('')).toBeUndefined();
      expect(findAdasCertificateByQuery('INVALID-VIN-00000')).toBeUndefined();
    });
  });

  describe('simulateDynamicRoadDrive', () => {
    it('simulates progressive road test telemetry', () => {
      const init = simulateDynamicRoadDrive(10);
      expect(init.isCompleted).toBe(false);
      expect(init.laneMarkingsDetected).toBe(false);

      const mid = simulateDynamicRoadDrive(50);
      expect(mid.isCompleted).toBe(false);
      expect(mid.laneMarkingsDetected).toBe(true);
      expect(mid.speedKmh).toBe(65);

      const done = simulateDynamicRoadDrive(100);
      expect(done.isCompleted).toBe(true);
      expect(done.speedKmh).toBe(0);
      expect(done.remainingMinutes).toBe(0);
    });
  });

  describe('getDtcCodeDetails', () => {
    it('returns DTC error code details case-insensitively', () => {
      const dtc = getDtcCodeDetails('c1a00');
      expect(dtc).toBeDefined();
      expect(dtc?.code).toBe('C1A00');
      expect(dtc?.systemKey).toBe('AEB');
    });

    it('returns undefined for unknown DTC codes', () => {
      expect(getDtcCodeDetails('P9999')).toBeUndefined();
    });
  });
});

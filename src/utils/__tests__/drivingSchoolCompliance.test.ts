import { describe, it, expect } from 'vitest';
import {
  evaluateEstakada,
  evaluateParallelParking,
  evaluateBoxReverse,
  evaluateCityDrivingExam,
  auditDualPedalVehicle,
  formatTuitionPrice,
  generateDrivingSchoolCertificate,
} from '../drivingSchoolCompliance';
import { MOCK_CITY_EXAM_ERRORS } from '../../data/mockDrivingSchoolData';

describe('drivingSchoolCompliance utility engine', () => {
  describe('evaluateEstakada', () => {
    it('passes when rollback is within 20 cm and stalls <= 1 within time limit', () => {
      const result = evaluateEstakada(12, 0, 45);
      expect(result.passed).toBe(true);
      expect(result.penaltyPoints).toBe(0);
      expect(result.feedbackAz).toContain('Mükəmməl');
    });

    it('passes with 1 penalty point if engine stalls once', () => {
      const result = evaluateEstakada(15, 1, 50);
      expect(result.passed).toBe(true);
      expect(result.penaltyPoints).toBe(1);
      expect(result.feedbackAz).toContain('-1 bal');
    });

    it('fails if rollback exceeds 20 cm', () => {
      const result = evaluateEstakada(25, 0, 50);
      expect(result.passed).toBe(false);
      expect(result.penaltyPoints).toBe(5);
      expect(result.feedbackAz).toContain('25 sm normativ həddi');
    });

    it('fails if stalls exceed 1', () => {
      const result = evaluateEstakada(10, 2, 40);
      expect(result.passed).toBe(false);
      expect(result.penaltyPoints).toBe(5);
      expect(result.feedbackAz).toContain('sönməsi yolverilməzdir');
    });

    it('fails if time exceeds 120 seconds', () => {
      const result = evaluateEstakada(10, 0, 130);
      expect(result.passed).toBe(false);
      expect(result.penaltyPoints).toBe(5);
      expect(result.feedbackAz).toContain('Vaxt limiti');
    });
  });

  describe('evaluateParallelParking', () => {
    it('passes when curb distance is 10-30 cm, no boundary touched, and shifts <= 2', () => {
      const result = evaluateParallelParking(18, false, 1, 60);
      expect(result.passed).toBe(true);
      expect(result.penaltyPoints).toBe(0);
    });

    it('fails when boundary line is touched', () => {
      const result = evaluateParallelParking(20, true, 1, 55);
      expect(result.passed).toBe(false);
      expect(result.penaltyPoints).toBe(5);
      expect(result.feedbackAz).toContain('Sensorlu kənar xəttə toxunuldu');
    });

    it('penalizes when curb distance is too large (>35 cm)', () => {
      const result = evaluateParallelParking(38, false, 1, 50);
      expect(result.passed).toBe(true); // penalty 3 < 5
      expect(result.penaltyPoints).toBe(3);
    });

    it('fails when collision risk with curb (<5 cm)', () => {
      const result = evaluateParallelParking(3, false, 1, 45);
      expect(result.passed).toBe(false);
      expect(result.penaltyPoints).toBe(5);
    });
  });

  describe('evaluateBoxReverse', () => {
    it('passes when boundary not touched, end zone reached, single shift', () => {
      const result = evaluateBoxReverse(false, true, 1, 50);
      expect(result.passed).toBe(true);
      expect(result.penaltyPoints).toBe(0);
    });

    it('fails if boundary is touched', () => {
      const result = evaluateBoxReverse(true, true, 1, 50);
      expect(result.passed).toBe(false);
      expect(result.penaltyPoints).toBe(5);
    });

    it('fails if vehicle did not reach end zone', () => {
      const result = evaluateBoxReverse(false, false, 1, 50);
      expect(result.passed).toBe(false);
      expect(result.penaltyPoints).toBe(5);
    });
  });

  describe('evaluateCityDrivingExam', () => {
    it('evaluates clean exam with 100 points as passed', () => {
      const result = evaluateCityDrivingExam([], MOCK_CITY_EXAM_ERRORS);
      expect(result.initialPoints).toBe(100);
      expect(result.deductedPoints).toBe(0);
      expect(result.finalScore).toBe(100);
      expect(result.passed).toBe(true);
      expect(result.criticalCount).toBe(0);
    });

    it('deducts minor and medium points and passes if >= 80 pts', () => {
      const result = evaluateCityDrivingExam(['err_late_indicator', 'err_lane_discipline'], MOCK_CITY_EXAM_ERRORS);
      expect(result.deductedPoints).toBe(4); // 1 + 3
      expect(result.finalScore).toBe(96);
      expect(result.passed).toBe(true);
    });

    it('fails immediately when critical error is committed', () => {
      const result = evaluateCityDrivingExam(['err_pedestrian'], MOCK_CITY_EXAM_ERRORS);
      expect(result.deductedPoints).toBe(5);
      expect(result.finalScore).toBe(95);
      expect(result.passed).toBe(false);
      expect(result.criticalCount).toBe(1);
      expect(result.summaryAz).toContain('QEYRİ-MƏQBULDUR');
    });

    it('fails when points drop below 80 without critical errors', () => {
      // simulate 7 medium errors (7 * 3 = 21 deducted, final score = 79)
      const errorCodes = [
        'err_speed_limit',
        'err_lane_discipline',
        'err_following_distance',
        'err_speed_limit',
        'err_lane_discipline',
        'err_following_distance',
        'err_speed_limit',
      ];
      const result = evaluateCityDrivingExam(errorCodes, MOCK_CITY_EXAM_ERRORS);
      expect(result.deductedPoints).toBe(21);
      expect(result.finalScore).toBe(79);
      expect(result.passed).toBe(false);
    });
  });

  describe('auditDualPedalVehicle', () => {
    it('validates compliant dual pedal training car with 0 violations', () => {
      const audit = auditDualPedalVehicle({
        dualPedalsApproved: true,
        roofSignInstalled: true,
        instructorMirrorsPresent: true,
        dashcamActive: true,
        texpasportSpecialEndorsement: true,
      });
      expect(audit.isCompliant).toBe(true);
      expect(audit.fineRiskAzn).toBe(0);
      expect(audit.violationsAz.length).toBe(0);
    });

    it('detects missing pedals and missing texpasport endorsement with fine risks', () => {
      const audit = auditDualPedalVehicle({
        dualPedalsApproved: false,
        roofSignInstalled: false,
        instructorMirrorsPresent: true,
        dashcamActive: true,
        texpasportSpecialEndorsement: false,
      });
      expect(audit.isCompliant).toBe(false);
      expect(audit.fineRiskAzn).toBe(350); // 150 + 150 + 50
      expect(audit.violationsAz.length).toBe(3);
    });
  });

  describe('formatTuitionPrice', () => {
    it('formats AZN correctly', () => {
      expect(formatTuitionPrice(350, 'AZN')).toContain('350 ₼');
    });

    it('formats USD and EUR correctly', () => {
      expect(formatTuitionPrice(350, 'USD')).toContain('$');
      expect(formatTuitionPrice(350, 'EUR')).toContain('€');
    });
  });

  describe('generateDrivingSchoolCertificate', () => {
    it('generates valid certificate structure with BDYP-AVM serial code', () => {
      const cert = generateDrivingSchoolCertificate({
        studentFullName: 'Tural Qasımov',
        studentFin: '4K8M1P9',
        schoolId: 'sch_baku_1',
        schoolName: 'Bakı 1 Saylı Mərkəzi Avtoməktəb',
        category: 'B',
        theoryHours: 80,
        practicalHours: 30,
        instructorName: 'Polad Həsənov',
        vehiclePlate: '99-YP-812',
        cityScore: 92,
      });
      expect(cert.certificateNumber).toMatch(/^BDYP-AVM-2026-\d{5}$/);
      expect(cert.studentFin).toBe('4K8M1P9');
      expect(cert.autodromePassed).toBe(true);
      expect(cert.cityScore).toBe(92);
      expect(cert.qrSecurityHash).toContain('BDYP-AZ');
    });
  });
});

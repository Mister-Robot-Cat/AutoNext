import { describe, it, expect } from 'vitest';
import {
  convertFromAzn,
  formatMedicalCurrency,
  evaluateMedicalEligibility,
  evaluateRabkinTest,
  evaluateSobrietyAndToxicology,
  generateDriverMedicalCertificate,
  lookupMedicalCertificate,
  queryDispensaryRecord
} from '../driverMedicalCompliance';

describe('driverMedicalCompliance utility engine', () => {
  describe('convertFromAzn & formatMedicalCurrency', () => {
    it('converts AZN amounts to USD and EUR correctly', () => {
      expect(convertFromAzn(100, 'AZN')).toBe(100);
      expect(convertFromAzn(100, 'USD')).toBe(58.8);
      expect(convertFromAzn(100, 'EUR')).toBe(54);
    });

    it('formats currency strings cleanly with appropriate symbols', () => {
      expect(formatMedicalCurrency(30, 'AZN')).toBe('30.00 ₼');
      expect(formatMedicalCurrency(30, 'USD')).toBe('$17.64');
      expect(formatMedicalCurrency(30, 'EUR')).toBe('€16.20');
    });
  });

  describe('evaluateMedicalEligibility (Forma AZS-083/e)', () => {
    it('passes a healthy young amateur driver with 10-year validity and 100 score', () => {
      const result = evaluateMedicalEligibility({
        targetCategory: 'B',
        age: 28,
        visualAcuityBetterEye: 1.0,
        visualAcuityWorseEye: 0.9,
        withCorrection: false,
        colorVision: 'NORMAL_TRICHROMACY',
        hearingLossDb: 15,
        hasEpilepsyOrSyncope: false,
        hasSevereCardiovascular: false,
        hasLimbLossWithoutAdaptation: false,
        narcologyDispensaryStatus: 'CLEAN',
        psychoneurologyDispensaryStatus: 'CLEAN'
      });

      expect(result.isEligible).toBe(true);
      expect(result.eligibilityScore).toBe(100);
      expect(result.validityYears).toBe(10);
      expect(result.eyeCorrectionRequired).toBe(false);
      expect(result.disqualificationReasons.length).toBe(0);
      expect(result.recommendedPackageId).toBe('pkg_standard_b');
    });

    it('sets 2-year validity for drivers aged 60-69 and 1-year for 70+', () => {
      const driver65 = evaluateMedicalEligibility({
        targetCategory: 'B',
        age: 65,
        visualAcuityBetterEye: 0.8,
        visualAcuityWorseEye: 0.6,
        withCorrection: false,
        colorVision: 'NORMAL_TRICHROMACY',
        hearingLossDb: 25,
        hasEpilepsyOrSyncope: false,
        hasSevereCardiovascular: false,
        hasLimbLossWithoutAdaptation: false,
        narcologyDispensaryStatus: 'CLEAN',
        psychoneurologyDispensaryStatus: 'CLEAN'
      });
      expect(driver65.validityYears).toBe(2);

      const driver75 = evaluateMedicalEligibility({
        targetCategory: 'B',
        age: 75,
        visualAcuityBetterEye: 0.8,
        visualAcuityWorseEye: 0.6,
        withCorrection: false,
        colorVision: 'NORMAL_TRICHROMACY',
        hearingLossDb: 25,
        hasEpilepsyOrSyncope: false,
        hasSevereCardiovascular: false,
        hasLimbLossWithoutAdaptation: false,
        narcologyDispensaryStatus: 'CLEAN',
        psychoneurologyDispensaryStatus: 'CLEAN'
      });
      expect(driver75.validityYears).toBe(1);
    });

    it('enforces 1-year annual validity and stricter acuity norms for professional categories (C1_C, D1_D, TAXI)', () => {
      const res = evaluateMedicalEligibility({
        targetCategory: 'C1_C',
        age: 35,
        visualAcuityBetterEye: 0.9,
        visualAcuityWorseEye: 0.7,
        withCorrection: false,
        colorVision: 'NORMAL_TRICHROMACY',
        hearingLossDb: 20,
        hasEpilepsyOrSyncope: false,
        hasSevereCardiovascular: false,
        hasLimbLossWithoutAdaptation: false,
        narcologyDispensaryStatus: 'CLEAN',
        psychoneurologyDispensaryStatus: 'CLEAN'
      });

      expect(res.isEligible).toBe(true);
      expect(res.validityYears).toBe(1);
      expect(res.recommendedPackageId).toBe('pkg_professional_c_d');
    });

    it('flags eyeglasses endorsement when driver needs optical correction', () => {
      const res = evaluateMedicalEligibility({
        targetCategory: 'B',
        age: 30,
        visualAcuityBetterEye: 0.7,
        visualAcuityWorseEye: 0.5,
        withCorrection: true,
        colorVision: 'NORMAL_TRICHROMACY',
        hearingLossDb: 15,
        hasEpilepsyOrSyncope: false,
        hasSevereCardiovascular: false,
        hasLimbLossWithoutAdaptation: false,
        narcologyDispensaryStatus: 'CLEAN',
        psychoneurologyDispensaryStatus: 'CLEAN'
      });

      expect(res.isEligible).toBe(true);
      expect(res.eyeCorrectionRequired).toBe(true);
      expect(res.specialEndorsements.some(e => e.includes('01.01'))).toBe(true);
    });

    it('disqualifies driver with sub-standard visual acuity (better eye < 0.6 for B)', () => {
      const res = evaluateMedicalEligibility({
        targetCategory: 'B',
        age: 40,
        visualAcuityBetterEye: 0.5,
        visualAcuityWorseEye: 0.1,
        withCorrection: false,
        colorVision: 'NORMAL_TRICHROMACY',
        hearingLossDb: 15,
        hasEpilepsyOrSyncope: false,
        hasSevereCardiovascular: false,
        hasLimbLossWithoutAdaptation: false,
        narcologyDispensaryStatus: 'CLEAN',
        psychoneurologyDispensaryStatus: 'CLEAN'
      });

      expect(res.isEligible).toBe(false);
      expect(res.disqualificationReasons.some(r => r.includes('Görmə itiliyi'))).toBe(true);
    });

    it('disqualifies professional category when protanopia or deuteranopia is present', () => {
      const res = evaluateMedicalEligibility({
        targetCategory: 'TAXI',
        age: 32,
        visualAcuityBetterEye: 0.9,
        visualAcuityWorseEye: 0.8,
        withCorrection: false,
        colorVision: 'PROTANOPIA',
        hearingLossDb: 15,
        hasEpilepsyOrSyncope: false,
        hasSevereCardiovascular: false,
        hasLimbLossWithoutAdaptation: false,
        narcologyDispensaryStatus: 'CLEAN',
        psychoneurologyDispensaryStatus: 'CLEAN'
      });

      expect(res.isEligible).toBe(false);
      expect(res.disqualificationReasons.some(r => r.includes('dixromaziya'))).toBe(true);
    });

    it('allows amateur B category with protanopia but attaches special endorsement', () => {
      const res = evaluateMedicalEligibility({
        targetCategory: 'B',
        age: 26,
        visualAcuityBetterEye: 1.0,
        visualAcuityWorseEye: 0.9,
        withCorrection: false,
        colorVision: 'PROTANOPIA',
        hearingLossDb: 15,
        hasEpilepsyOrSyncope: false,
        hasSevereCardiovascular: false,
        hasLimbLossWithoutAdaptation: false,
        narcologyDispensaryStatus: 'CLEAN',
        psychoneurologyDispensaryStatus: 'CLEAN'
      });

      expect(res.isEligible).toBe(true);
      expect(res.specialEndorsements.some(e => e.includes('İşıqfor rənglərini'))).toBe(true);
    });

    it('disqualifies driver with severe conditions like epilepsy or dispensary addiction', () => {
      const res = evaluateMedicalEligibility({
        targetCategory: 'B',
        age: 35,
        visualAcuityBetterEye: 1.0,
        visualAcuityWorseEye: 1.0,
        withCorrection: false,
        colorVision: 'NORMAL_TRICHROMACY',
        hearingLossDb: 15,
        hasEpilepsyOrSyncope: true,
        hasSevereCardiovascular: false,
        hasLimbLossWithoutAdaptation: false,
        narcologyDispensaryStatus: 'REGISTERED_ADDICTION',
        psychoneurologyDispensaryStatus: 'CLEAN'
      });

      expect(res.isEligible).toBe(false);
      expect(res.disqualificationReasons.some(r => r.includes('Epilepsiya'))).toBe(true);
      expect(res.disqualificationReasons.some(r => r.includes('Narkoloji dispanserdə asılılıq'))).toBe(true);
    });
  });

  describe('evaluateRabkinTest', () => {
    it('classifies normal trichromacy when all or majority plates are correctly identified', () => {
      const res = evaluateRabkinTest({
        rabkin_tab_1: '96',
        rabkin_tab_2: 'Dairə və Üçbucaq',
        rabkin_tab_3: '13',
        rabkin_tab_4: '74',
        rabkin_tab_5: '29',
        rabkin_tab_6: '5'
      });

      expect(res.diagnosis).toBe('NORMAL_TRICHROMACY');
      expect(res.correctCount).toBe(6);
      expect(res.allowsAmateurB).toBe(true);
      expect(res.allowsProfessionalCD).toBe(true);
    });

    it('identifies protanopia when typical red-blindness answers are given', () => {
      const res = evaluateRabkinTest({
        rabkin_tab_1: '96',
        rabkin_tab_2: 'Yalnız Üçbucaq',
        rabkin_tab_3: '6',
        rabkin_tab_4: '21',
        rabkin_tab_5: '70',
        rabkin_tab_6: '2'
      });

      expect(res.diagnosis).toBe('PROTANOPIA');
      expect(res.allowsAmateurB).toBe(true);
      expect(res.allowsProfessionalCD).toBe(false);
    });

    it('identifies deuteranopia when typical green-blindness answers are given', () => {
      const res = evaluateRabkinTest({
        rabkin_tab_1: '96',
        rabkin_tab_2: 'Yalnız Dairə',
        rabkin_tab_3: 'Görmürəm',
        rabkin_tab_4: '21',
        rabkin_tab_5: 'Görmürəm',
        rabkin_tab_6: 'Görmürəm'
      });

      expect(['DEUTERANOPIA', 'TOTAL_COLOR_BLINDNESS']).toContain(res.diagnosis);
      expect(res.allowsProfessionalCD).toBe(false);
    });

    it('identifies total color blindness when all plates are unseen', () => {
      const res = evaluateRabkinTest({
        rabkin_tab_1: 'Görmürəm',
        rabkin_tab_2: 'Görmürəm',
        rabkin_tab_3: 'Görmürəm',
        rabkin_tab_4: 'Görmürəm',
        rabkin_tab_5: 'Görmürəm',
        rabkin_tab_6: 'Görmürəm'
      });

      expect(res.diagnosis).toBe('TOTAL_COLOR_BLINDNESS');
      expect(res.allowsAmateurB).toBe(false);
      expect(res.allowsProfessionalCD).toBe(false);
    });
  });

  describe('evaluateSobrietyAndToxicology (İXM Maddə 333 / 334)', () => {
    it('declares sober when BAC is <= 0.28 promille legal threshold', () => {
      const res = evaluateSobrietyAndToxicology(0.18);
      expect(res.isSober).toBe(true);
      expect(res.classification).toBe('SOBER');
      expect(res.fineAzn).toBe(0);
      expect(res.suspensionMonths).toBe(0);
    });

    it('applies İXM 333.1 (400 AZN fine / 200 AZN discount / 6 mo suspension) for mild intoxication (0.28 - 0.50 ‰)', () => {
      const res = evaluateSobrietyAndToxicology(0.38);
      expect(res.isSober).toBe(false);
      expect(res.classification).toBe('MILD_INTOXICATION');
      expect(res.fineAzn).toBe(400);
      expect(res.discountedFineAzn).toBe(200);
      expect(res.suspensionMonths).toBe(6);
      expect(res.penaltyPoints).toBe(5);
      expect(res.legalArticle).toContain('333.1');
    });

    it('applies İXM 333.2 (700 AZN / 12-24 mo suspension) for moderate intoxication (0.50 - 1.00 ‰)', () => {
      const res = evaluateSobrietyAndToxicology(0.75);
      expect(res.classification).toBe('MODERATE_INTOXICATION');
      expect(res.fineAzn).toBe(700);
      expect(res.discountedFineAzn).toBe(350);
      expect(res.suspensionMonths).toBe(18);
    });

    it('triggers administrative detention risk and 2-year suspension for severe intoxication (>1.00 ‰)', () => {
      const res = evaluateSobrietyAndToxicology(1.45);
      expect(res.classification).toBe('SEVERE_INTOXICATION');
      expect(res.isAdministrativeDetentionRisk).toBe(true);
      expect(res.suspensionMonths).toBe(24);
      expect(res.penaltyPoints).toBe(5);
    });

    it('handles test refusal under İXM 334.1 correctly', () => {
      const res = evaluateSobrietyAndToxicology(0, true);
      expect(res.classification).toBe('TEST_REFUSAL');
      expect(res.legalArticle).toContain('334.1');
      expect(res.fineAzn).toBe(400);
      expect(res.suspensionMonths).toBe(12);
    });
  });

  describe('generateDriverMedicalCertificate & Registry Lookups', () => {
    it('generates a valid certificate with SN-TIB-2026 serial and calculated expiry', () => {
      const cert = generateDriverMedicalCertificate({
        finCode: '1AB23CD',
        fullName: 'Elmir Babayev',
        birthDate: '1995-04-12',
        bloodType: 'O(I) Rh+',
        targetCategories: ['A1_A', 'B'],
        centerId: 'baku_health_center',
        validityYears: 10,
        eyeCorrection: false,
        hearingAid: false,
        handControls: false,
        colorVision: 'NORMAL_TRICHROMACY',
        visusLeft: 1.0,
        visusRight: 1.0
      });

      expect(cert.certificateNumber).toMatch(/^SN-TIB-2026-\d{5}$/);
      expect(cert.finCode).toBe('1AB23CD');
      expect(cert.allowedCategories).toContain('B');
      expect(cert.simaDigitalSignatureUid).toContain('SIMA-AZ-');
      expect(cert.status).toBe('ACTIVE');
    });

    it('looks up existing certificate by certificate number or FIN', () => {
      const foundByCert = lookupMedicalCertificate('SN-TIB-2026-88192');
      expect(foundByCert).not.toBeNull();
      expect(foundByCert?.driverFullName).toBe('Rəşad Əliyev Məmməd oğlu');

      const foundByFin = lookupMedicalCertificate('7XYZ890');
      expect(foundByFin).not.toBeNull();
      expect(foundByFin?.certificateNumber).toBe('SN-TIB-2026-44109');

      expect(lookupMedicalCertificate('NON_EXISTENT')).toBeNull();
      expect(lookupMedicalCertificate('')).toBeNull();
    });

    it('queries dispensary records by FIN code', () => {
      const known = queryDispensaryRecord('5MNK456');
      expect(known?.narcologyStatus).toBe('REGISTERED_ADDICTION');

      const unknown = queryDispensaryRecord('UNKNOWN99');
      expect(unknown?.narcologyStatus).toBe('CLEAN');
      expect(unknown?.fullName).toContain('Qeydiyyatı Tapılmayan');
    });
  });
});

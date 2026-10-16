import { describe, it, expect } from 'vitest';
import {
  evaluateLicenseCategoryCompliance,
  calculateLicenseServiceFees,
  evaluateTheoreticalExam,
  generateElectronicLicenseExtract,
  convertLicenseCurrency,
  determineVehicleLicenseParameters,
} from '../driverLicense';
import { BDYP_EXAM_TICKET_QUESTIONS } from '../../data/mockDriverLicenseData';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('driverLicense utility engine (YHQ Articles 33–35, İXM 332 & Law on State Duties Art. 18)', () => {
  it('approves standard passenger car (<=3500 kg, <=8 seats) with B category and no trailer', () => {
    const res = evaluateLicenseCategoryCompliance({
      driverCategories: ['B'],
      driverAgeYears: 25,
      drivingExperienceYears: 4,
      licenseTransmissionScope: 'manual_unrestricted',
      isLicenseExpired: false,
      vehicleGvwKg: 2150,
      vehicleCurbWeightKg: 1600,
      passengerSeatsExcludingDriver: 4,
      vehicleTransmission: 'automatic',
      isMotorcycle: false,
      trailerGvwKg: 0,
    });

    expect(res.requiredCategory).toBe('B');
    expect(res.isCompliant).toBe(true);
    expect(res.fineAmountAzn).toBe(0);
    expect(res.trailerRuleTriggered).toBe('NO_TRAILER');
  });

  it('allows light trailer <= 750 kg with only B category even if combined weight exceeds 3,500 kg (YHQ Art. 34.1)', () => {
    const res = evaluateLicenseCategoryCompliance({
      driverCategories: ['B'],
      driverAgeYears: 30,
      drivingExperienceYears: 6,
      licenseTransmissionScope: 'manual_unrestricted',
      isLicenseExpired: false,
      vehicleGvwKg: 3100,
      vehicleCurbWeightKg: 2300,
      passengerSeatsExcludingDriver: 6,
      vehicleTransmission: 'automatic',
      isMotorcycle: false,
      trailerGvwKg: 700,
    });

    expect(res.totalTrainGvwKg).toBe(3800);
    expect(res.requiredCategory).toBe('B');
    expect(res.trailerRuleTriggered).toBe('LIGHT_TRAILER_UNDER_750KG_CATEGORY_B');
    expect(res.isCompliant).toBe(true);
  });

  it('allows trailer > 750 kg with B category if trailer <= curb weight AND combined train <= 3,500 kg', () => {
    const res = evaluateLicenseCategoryCompliance({
      driverCategories: ['B'],
      driverAgeYears: 29,
      drivingExperienceYears: 5,
      licenseTransmissionScope: 'manual_unrestricted',
      isLicenseExpired: false,
      vehicleGvwKg: 2200,
      vehicleCurbWeightKg: 1650,
      passengerSeatsExcludingDriver: 4,
      vehicleTransmission: 'automatic',
      isMotorcycle: false,
      trailerGvwKg: 1100,
    });

    expect(res.totalTrainGvwKg).toBe(3300);
    expect(res.requiredCategory).toBe('B');
    expect(res.trailerRuleTriggered).toBe('HEAVY_TRAILER_COMBINED_UNDER_3500KG_CATEGORY_B');
    expect(res.isCompliant).toBe(true);
  });

  it('requires BE category and triggers 200 AZN fine (İXM 332.2) when trailer > 750 kg and combined train > 3,500 kg', () => {
    const res = evaluateLicenseCategoryCompliance({
      driverCategories: ['B'],
      driverAgeYears: 32,
      drivingExperienceYears: 8,
      licenseTransmissionScope: 'manual_unrestricted',
      isLicenseExpired: false,
      vehicleGvwKg: 2780,
      vehicleCurbWeightKg: 2100,
      passengerSeatsExcludingDriver: 6,
      vehicleTransmission: 'automatic',
      isMotorcycle: false,
      trailerGvwKg: 1400,
    });

    expect(res.totalTrainGvwKg).toBe(4180);
    expect(res.requiredCategory).toBe('BE');
    expect(res.trailerRuleTriggered).toBe('COMBINED_TRAIN_EXCEEDS_3500KG_REQUIRES_BE');
    expect(res.isCompliant).toBe(false);
    expect(res.fineAmountAzn).toBe(200);
  });

  it('requires BE category when trailer GVW exceeds vehicle curb weight even if total train <= 3,500 kg', () => {
    const res = evaluateLicenseCategoryCompliance({
      driverCategories: ['B'],
      driverAgeYears: 32,
      drivingExperienceYears: 8,
      licenseTransmissionScope: 'manual_unrestricted',
      isLicenseExpired: false,
      vehicleGvwKg: 1800,
      vehicleCurbWeightKg: 1200,
      passengerSeatsExcludingDriver: 4,
      vehicleTransmission: 'automatic',
      isMotorcycle: false,
      trailerGvwKg: 1400,
    });

    expect(res.totalTrainGvwKg).toBe(3200);
    expect(res.requiredCategory).toBe('BE');
    expect(res.trailerRuleTriggered).toBe('TRAILER_EXCEEDS_CURB_WEIGHT_REQUIRES_BE');
    expect(res.isCompliant).toBe(false);
  });

  it('flags AT transmission restriction violation when driving a manual gearbox vehicle (YHQ Art. 35)', () => {
    const res = evaluateLicenseCategoryCompliance({
      driverCategories: ['B'],
      driverAgeYears: 24,
      drivingExperienceYears: 2,
      licenseTransmissionScope: 'automatic_only_AT',
      isLicenseExpired: false,
      vehicleGvwKg: 1950,
      vehicleCurbWeightKg: 1450,
      passengerSeatsExcludingDriver: 4,
      vehicleTransmission: 'manual',
      isMotorcycle: false,
      trailerGvwKg: 0,
    });

    expect(res.isTransmissionCompliant).toBe(false);
    expect(res.isCompliant).toBe(false);
    expect(res.fineAmountAzn).toBe(100);
  });

  it('flags expired license with 100 AZN fine under İXM Article 332.1', () => {
    const res = evaluateLicenseCategoryCompliance({
      driverCategories: ['B'],
      driverAgeYears: 35,
      drivingExperienceYears: 12,
      licenseTransmissionScope: 'manual_unrestricted',
      isLicenseExpired: true,
      vehicleGvwKg: 2100,
      vehicleCurbWeightKg: 1550,
      passengerSeatsExcludingDriver: 4,
      vehicleTransmission: 'automatic',
      isMotorcycle: false,
      trailerGvwKg: 0,
    });

    expect(res.isCompliant).toBe(false);
    expect(res.fineAmountAzn).toBe(100);
    expect(res.violationArticle).toContain('332.1');
  });

  it('calculates statutory state duties and 10-year validity for standard ASAN license renewal', () => {
    const fee = calculateLicenseServiceFees({
      serviceType: 'expiry_or_name_renewal',
      driverAgeYears: 34,
      hasHealthRestrictionNote: false,
      requireMedicalCertificate: false,
      includeIdpAddOn: false,
      isAsanExpressCenter: false,
    });

    expect(fee.stateDutyCardAzn).toBe(30);
    expect(fee.examFeeAzn).toBe(0);
    expect(fee.medicalCertificateFeeAzn).toBe(0);
    expect(fee.totalCostAzn).toBe(30);
    expect(fee.validityYears).toBe(10);
    expect(fee.requiresTheoreticalExam).toBe(false);
  });

  it('enforces mandatory Forma AZS-083 medical certificate and reduced validity for drivers aged 65 and 72 (YHQ Art. 35.6)', () => {
    const age65 = calculateLicenseServiceFees({
      serviceType: 'expiry_or_name_renewal',
      driverAgeYears: 65,
      hasHealthRestrictionNote: false,
      requireMedicalCertificate: false,
      includeIdpAddOn: false,
      isAsanExpressCenter: false,
    });
    expect(age65.isMedicalMandatoryByLaw).toBe(true);
    expect(age65.medicalCertificateFeeAzn).toBe(40);
    expect(age65.validityYears).toBe(5); // 70 - 65 = 5 years

    const age72 = calculateLicenseServiceFees({
      serviceType: 'expiry_or_name_renewal',
      driverAgeYears: 72,
      hasHealthRestrictionNote: false,
      requireMedicalCertificate: false,
      includeIdpAddOn: false,
      isAsanExpressCenter: false,
    });
    expect(age72.validityYears).toBe(2);
  });

  it('evaluates BDYP theoretical exam with 9/10 pass threshold', () => {
    const nineCorrect: Record<string, number> = {};
    BDYP_EXAM_TICKET_QUESTIONS.forEach((q, idx) => {
      nineCorrect[q.id] = idx === 0 ? (q.correctOptionIndex + 1) % 4 : q.correctOptionIndex;
    });

    const passRes = evaluateTheoreticalExam(BDYP_EXAM_TICKET_QUESTIONS, nineCorrect);
    expect(passRes.correctCount).toBe(9);
    expect(passRes.passed).toBe(true);

    const eightCorrect: Record<string, number> = { ...nineCorrect };
    eightCorrect[BDYP_EXAM_TICKET_QUESTIONS[1].id] =
      (BDYP_EXAM_TICKET_QUESTIONS[1].correctOptionIndex + 1) % 4;

    const failRes = evaluateTheoreticalExam(BDYP_EXAM_TICKET_QUESTIONS, eightCorrect);
    expect(failRes.correctCount).toBe(8);
    expect(failRes.passed).toBe(false);
  });

  it('generates verifiable electronic license extract and converts currencies', () => {
    const extract = generateElectronicLicenseExtract({
      holderFullName: 'ƏLİYEV MURAD TELMAN OĞLU',
      holderFin: '7A2B9C1',
      birthYear: 1994,
      bloodGroup: 'II (A) Rh+',
      categories: ['B', 'BE'],
      transmissionScope: 'manual_unrestricted',
      includeIdp: true,
      issuingCenterName: '1 saylı Bakı ASAN Xidmət',
    });

    expect(extract.licenseNumber).toMatch(/^AZE-SV-\d{6}$/);
    expect(extract.hasInternationalPermit).toBe(true);
    expect(extract.idpSerialNumber).toMatch(/^IDP-AZ-2026-\d{5}$/);
    expect(convertLicenseCurrency(170, 'USD')).toBe(100);
    expect(determineVehicleLicenseParameters(MOCK_VEHICLES[0]).vehicleGvwKg).toBeGreaterThan(1500);
  });
});

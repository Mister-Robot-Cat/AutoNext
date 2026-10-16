import { describe, it, expect } from 'vitest';
import {
  STATUTORY_ACOUSTIC_LIMIT_DBA,
  convertTuningCurrency,
  filterModificationsByCategory,
  auditVehicleModifications,
  calculateAutogasPayback,
  generateConstructiveCertificate,
  verifyCertificateByCode,
  createLabAppointmentBooking
} from '../tuningCompliance';
import { TUNING_MODIFICATIONS } from '../../data/mockTuningData';

describe('tuningCompliance engine', () => {
  it('converts AZN amounts to USD and EUR accurately', () => {
    expect(convertTuningCurrency(100, 'AZN')).toBe(100);
    expect(convertTuningCurrency(100, 'USD')).toBeCloseTo(58.82, 2);
    expect(convertTuningCurrency(100, 'EUR')).toBeCloseTo(54.35, 2);
  });

  it('filters modifications by category', () => {
    const all = filterModificationsByCategory('all');
    expect(all.length).toBe(TUNING_MODIFICATIONS.length);

    const autogas = filterModificationsByCategory('autogas');
    expect(autogas.length).toBeGreaterThanOrEqual(2);
    expect(autogas.every((m) => m.category === 'autogas')).toBe(true);
  });

  it('audits factory-compliant vehicle modifications with zero fees', () => {
    const audit = auditVehicleModifications({
      exhaustDecibelDba: 72,
      suspensionLiftMm: 0,
      wheelSpacerMm: 0,
      headlightType: 'oem_led',
      selectedModificationIds: ['oem_alloy_wheels_upgrade']
    });

    expect(audit.overallStatus).toBe('compliant');
    expect(audit.complianceScore).toBe(100);
    expect(audit.feesBreakdown.totalOfficialFeeAzn).toBe(0);
    expect(audit.statutoryFineExposureAzn).toBe(0);
    expect(audit.impoundRisk).toBe(false);
  });

  it('audits certifiable modifications (LPG + Body-Kit) and calculates Texpasport endorsement & state duties', () => {
    const audit = auditVehicleModifications({
      exhaustDecibelDba: 78,
      suspensionLiftMm: 0,
      wheelSpacerMm: 0,
      headlightType: 'oem_led',
      selectedModificationIds: ['lpg_propan_system', 'oem_body_kit_restyling']
    });

    expect(audit.overallStatus).toBe('endorsement_required');
    expect(audit.endorsementItems).toHaveLength(2);
    // Lab fees: 90 + 120 = 210 AZN; State duties: 30 + 20 + 2 = 52 AZN => Total 262 AZN
    expect(audit.feesBreakdown.labExpertiseTotalAzn).toBe(210);
    expect(audit.feesBreakdown.totalOfficialFeeAzn).toBe(262);
    expect(audit.texpasportEndorsementText).toContain('Qazbalon avadanlığı (LPG)');
    expect(audit.texpasportEndorsementText).toContain('Sport / Restaylinq');
  });

  it('flags prohibited modifications and acoustic violations (>84 dBA) with impound risk', () => {
    const audit = auditVehicleModifications({
      exhaustDecibelDba: 96,
      suspensionLiftMm: -35,
      wheelSpacerMm: 30,
      headlightType: 'uncertified_xenon_halogen',
      selectedModificationIds: ['cut_springs_baku_style', 'straight_pipe_popcorn_exhaust']
    });

    expect(audit.overallStatus).toBe('illegal_impound_risk');
    expect(audit.exhaustStatus).toBe('illegal_loud');
    expect(audit.suspensionStatus).toBe('illegal_cut_or_extreme');
    expect(audit.spacerStatus).toBe('illegal_protrusion');
    expect(audit.lightingStatus).toBe('illegal_glare');
    expect(audit.statutoryFineExposureAzn).toBe(800);
    expect(audit.impoundRisk).toBe(true);
    expect(STATUTORY_ACOUSTIC_LIMIT_DBA).toBe(84);
  });

  it('calculates LPG and CNG autogas ROI, monthly savings, and payback period', () => {
    const lpgResult = calculateAutogasPayback({
      systemType: 'lpg_euro4',
      monthlyMileageKm: 3000,
      petrolConsumptionLPer100Km: 10,
      currentPetrolGrade: 'ai95',
      includeOfficialTexpasportFee: true
    });

    // Monthly petrol: 300 L * 1.60 = 480 AZN
    expect(lpgResult.monthlyPetrolCostAzn).toBe(480);
    expect(lpgResult.monthlyGasCostAzn).toBeLessThan(lpgResult.monthlyPetrolCostAzn);
    expect(lpgResult.monthlySavingsAzn).toBeGreaterThan(200);
    expect(lpgResult.paybackMonths).toBeLessThan(7);
    expect(lpgResult.fiveYearNetProfitAzn).toBeGreaterThan(10000);

    const cngResult = calculateAutogasPayback({
      systemType: 'cng_methane',
      monthlyMileageKm: 3000,
      petrolConsumptionLPer100Km: 10,
      currentPetrolGrade: 'ai95',
      includeOfficialTexpasportFee: false
    });

    expect(cngResult.officialRegistrationFeeAzn).toBe(0);
    expect(cngResult.monthlySavingsAzn).toBeGreaterThan(lpgResult.monthlySavingsAzn);
  });

  it('generates and verifies official BDYP constructive safety certificates and lab bookings', () => {
    const audit = auditVehicleModifications({
      exhaustDecibelDba: 78,
      suspensionLiftMm: 40,
      wheelSpacerMm: 0,
      headlightType: 'oem_led',
      selectedModificationIds: ['oem_body_kit_restyling']
    });

    const cert = generateConstructiveCertificate({
      ownerName: 'Kənan Əliyev',
      ownerFin: '6B1C9D2',
      vehicleTitle: 'BMW 530i (2021)',
      vin: 'WBA530I2021999111',
      plateNumber: '90-KA-530',
      labId: 'lab-baku-zabrat',
      auditResult: audit,
      measuredDecibelDba: 78,
      suspensionDeltaMm: 40
    });

    expect(cert.certificateNumber).toMatch(/^BDYP-KD-2026-\d{5}$/);
    expect(cert.qrVerificationHash).toContain('VERIFIED');

    const verified = verifyCertificateByCode('BDYP-KD-2026-48102');
    expect(verified).not.toBeNull();
    expect(verified?.plateNumber).toBe('10-MM-530');

    const byPlate = verifyCertificateByCode('90-OR-250');
    expect(byPlate?.vehicleTitle).toContain('Land Cruiser');

    expect(verifyCertificateByCode('UNKNOWN-CODE')).toBeNull();

    const booking = createLabAppointmentBooking({
      labId: 'lab-baku-babek',
      vehiclePlate: '90-KA-530',
      appointmentDate: '2026-10-22',
      appointmentSlot: '14:30',
      estimatedFeeAzn: 262
    });
    expect(booking.bookingReference).toMatch(/^AZS-QEYD-2026-\d{4}$/);
    expect(booking.vehiclePlate).toBe('90-KA-530');
  });
});

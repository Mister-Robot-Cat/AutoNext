import { describe, it, expect } from 'vitest';
import {
  evaluateEusamaAndPeredokCompliance,
  evaluateWheelFastenersAnd3dGeometry,
  calculateSuspensionServiceCost,
  generateSuspensionComplianceCertificate,
  lookupSuspensionCertificateByCode,
  convertFromAzn,
} from '../suspensionChassisCompliance';

describe('suspensionChassisCompliance utility engine', () => {
  describe('evaluateEusamaAndPeredokCompliance (MAHA EUSAMA & Peredok Auditor)', () => {
    it('passes OEM compliant vehicle with healthy EUSAMA adhesion and balanced pitch', () => {
      const res = evaluateEusamaAndPeredokCompliance({
        frontLeftEusamaPercent: 74,
        frontRightEusamaPercent: 72,
        rearLeftEusamaPercent: 68,
        rearRightEusamaPercent: 66,
        suspensionModId: 'oem_standard',
        frontArchGapMm: 65,
        rearArchGapMm: 60,
        stabilizerBarIntact: true,
        airSuspensionHermetic: true,
      });

      expect(res.isCompliant).toBe(true);
      expect(res.eusamaGrade).toBe('OPTIMAL');
      expect(res.hasCriticalShockFailure).toBe(false);
      expect(res.hasAxleImbalanceFailure).toBe(false);
      expect(res.isIllegalPeredokOrCutSprings).toBe(false);
      expect(res.prohibitsOperation96).toBe(false);
      expect(res.fineAzn).toBe(0);
      expect(res.discountedFineAzn).toBe(0);
      expect(res.frontAvgEusamaPercent).toBe(73);
      expect(res.rearAvgEusamaPercent).toBe(67);
      expect(res.frontAxleImbalancePercent).toBe(2);
      expect(res.rearAxleImbalancePercent).toBe(2);
    });

    it('prohibits operation and triggers 150 AZN fine when illegal Peredok lift (>35 mm pitch delta) is detected', () => {
      const res = evaluateEusamaAndPeredokCompliance({
        frontLeftEusamaPercent: 60,
        frontRightEusamaPercent: 58,
        rearLeftEusamaPercent: 50,
        rearRightEusamaPercent: 48,
        suspensionModId: 'peredok_front_lift',
        frontArchGapMm: 130,
        rearArchGapMm: 40, // 90 mm delta > 35 mm norm
        stabilizerBarIntact: true,
        airSuspensionHermetic: true,
      });

      expect(res.isCompliant).toBe(false);
      expect(res.isIllegalPeredokOrCutSprings).toBe(true);
      expect(res.prohibitsOperation96).toBe(true);
      expect(res.fineAzn).toBe(150);
      expect(res.discountedFineAzn).toBe(75);
      expect(res.frontToRearPitchDeltaMm).toBe(90);
      expect(res.legalArticlesTriggered).toContain(
        'İXM Maddə 342.2-1 (Normativ tələbləri pozmaqla avadanlığın quraşdırılması və ya dəyişdirilməsi — 150 ₼)'
      );
      expect(res.legalArticlesTriggered).toContain(
        'İXM Maddə 96.1.4 (Konstruktiv dəyişiklik səbəbilə mühafizə olunan duracağa yerləşdirmə)'
      );
    });

    it('flags cut/heated springs ("kəsilmiş prujina") with immediate operation prohibition', () => {
      const res = evaluateEusamaAndPeredokCompliance({
        frontLeftEusamaPercent: 35,
        frontRightEusamaPercent: 30,
        rearLeftEusamaPercent: 28,
        rearRightEusamaPercent: 25,
        suspensionModId: 'cut_heated_springs',
        frontArchGapMm: 20,
        rearArchGapMm: 15,
        stabilizerBarIntact: true,
        airSuspensionHermetic: true,
      });

      expect(res.isCompliant).toBe(false);
      expect(res.isIllegalPeredokOrCutSprings).toBe(true);
      expect(res.prohibitsOperation96).toBe(true);
      expect(res.fineAzn).toBe(150);
    });

    it('detects missing or broken anti-roll stabilizer bar (YHQ Annex 1 Clause 7.12)', () => {
      const res = evaluateEusamaAndPeredokCompliance({
        frontLeftEusamaPercent: 70,
        frontRightEusamaPercent: 68,
        rearLeftEusamaPercent: 65,
        rearRightEusamaPercent: 65,
        suspensionModId: 'oem_standard',
        frontArchGapMm: 60,
        rearArchGapMm: 60,
        stabilizerBarIntact: false,
        airSuspensionHermetic: true,
      });

      expect(res.isCompliant).toBe(false);
      expect(res.prohibitsOperation96).toBe(true);
      expect(res.fineAzn).toBe(50);
      expect(res.legalArticlesTriggered).toContain(
        'YHQ Əlavə 1 Bənd 7.12 (Köndələn dayanıqlıq stabilizatorunun nasazlığı və ya çıxarılması)'
      );
    });

    it('detects critical shock failure when any wheel EUSAMA is <= 20%', () => {
      const res = evaluateEusamaAndPeredokCompliance({
        frontLeftEusamaPercent: 18, // Blown shock absorber
        frontRightEusamaPercent: 65,
        rearLeftEusamaPercent: 60,
        rearRightEusamaPercent: 58,
        suspensionModId: 'oem_standard',
        frontArchGapMm: 60,
        rearArchGapMm: 60,
        stabilizerBarIntact: true,
        airSuspensionHermetic: true,
      });

      expect(res.isCompliant).toBe(false);
      expect(res.hasCriticalShockFailure).toBe(true);
      expect(res.eusamaGrade).toBe('CRITICAL_BOUNCE_FAIL');
      expect(res.hasAxleImbalanceFailure).toBe(true); // 65 - 18 = 47% > 15%
    });

    it('detects air suspension leakage and flags repair recommendation', () => {
      const res = evaluateEusamaAndPeredokCompliance({
        frontLeftEusamaPercent: 65,
        frontRightEusamaPercent: 65,
        rearLeftEusamaPercent: 60,
        rearRightEusamaPercent: 60,
        suspensionModId: 'oem_air_suspension',
        frontArchGapMm: 65,
        rearArchGapMm: 65,
        stabilizerBarIntact: true,
        airSuspensionHermetic: false,
      });

      expect(res.isCompliant).toBe(false);
      expect(res.violationsAz.some((v) => v.includes('Pnevmoasqı'))).toBe(true);
    });
  });

  describe('evaluateWheelFastenersAnd3dGeometry (YHQ 5.4/5.5 & Hunter 3D / Celette)', () => {
    it('passes factory straight 3D geometry and intact wheel lug bolts', () => {
      const res = evaluateWheelFastenersAnd3dGeometry({
        wheelFastenerCondition: 'intact_oem_bolts_rims',
        missingLugBoltsCount: 0,
        hasCrackedOrWeldedRim: false,
        frontToeMm: 0.5,
        frontCamberDeg: -0.8,
        casterLeftRightDeltaDeg: 0.1,
        longeronDiagonalDeltaMm: 1.2,
        vehicleMarketPriceAzn: 35000,
      });

      expect(res.isCompliant).toBe(true);
      expect(res.violatesClause54Bolts).toBe(false);
      expect(res.violatesClause55RimCrack).toBe(false);
      expect(res.isToeOutOfSpec).toBe(false);
      expect(res.isCamberOutOfSpec).toBe(false);
      expect(res.isExtremeStanceCamber342).toBe(false);
      expect(res.isCasterPulling).toBe(false);
      expect(res.frameGeometryGrade).toBe('FACTORY_STRAIGHT');
      expect(res.valuationImpactAzn).toBe(0);
      expect(res.prohibitsOperationImmediately).toBe(false);
      expect(res.fineAzn).toBe(0);
    });

    it('prohibits operation when lug bolts are missing (YHQ Annex 1 Clause 5.4)', () => {
      const res = evaluateWheelFastenersAnd3dGeometry({
        wheelFastenerCondition: 'missing_lug_bolt',
        missingLugBoltsCount: 2,
        hasCrackedOrWeldedRim: false,
        frontToeMm: 0.2,
        frontCamberDeg: -0.5,
        casterLeftRightDeltaDeg: 0.1,
        longeronDiagonalDeltaMm: 0.8,
        vehicleMarketPriceAzn: 25000,
      });

      expect(res.isCompliant).toBe(false);
      expect(res.violatesClause54Bolts).toBe(true);
      expect(res.prohibitsOperationImmediately).toBe(true);
      expect(res.fineAzn).toBe(50);
      expect(res.discountedFineAzn).toBe(25);
      expect(res.legalArticlesTriggered).toContain(
        'YHQ Əlavə 1 Bənd 5.4 & İXM Maddə 342.1.5 (Təkər bolt/qayka çatışmazlığı — 50 ₼)'
      );
    });

    it('prohibits operation when rim has cracks or welding traces (YHQ Annex 1 Clause 5.5)', () => {
      const res = evaluateWheelFastenersAnd3dGeometry({
        wheelFastenerCondition: 'cracked_or_welded_rim',
        missingLugBoltsCount: 0,
        hasCrackedOrWeldedRim: true,
        frontToeMm: 0.2,
        frontCamberDeg: -0.5,
        casterLeftRightDeltaDeg: 0.1,
        longeronDiagonalDeltaMm: 0.8,
        vehicleMarketPriceAzn: 20000,
      });

      expect(res.isCompliant).toBe(false);
      expect(res.violatesClause55RimCrack).toBe(true);
      expect(res.prohibitsOperationImmediately).toBe(true);
      expect(res.fineAzn).toBe(50);
    });

    it('penalizes unregistered wheel spacers with 150 AZN fine under İXM 342.2-1', () => {
      const res = evaluateWheelFastenersAnd3dGeometry({
        wheelFastenerCondition: 'wheel_spacer_unregistered',
        missingLugBoltsCount: 0,
        hasCrackedOrWeldedRim: false,
        frontToeMm: 0.0,
        frontCamberDeg: -1.0,
        casterLeftRightDeltaDeg: 0.2,
        longeronDiagonalDeltaMm: 1.0,
        vehicleMarketPriceAzn: 30000,
      });

      expect(res.isCompliant).toBe(false);
      expect(res.prohibitsOperationImmediately).toBe(true);
      expect(res.fineAzn).toBe(150);
    });

    it('detects extreme Stance camber (< -3.5°) as constructive modification (150 AZN fine)', () => {
      const res = evaluateWheelFastenersAnd3dGeometry({
        wheelFastenerCondition: 'intact_oem_bolts_rims',
        missingLugBoltsCount: 0,
        hasCrackedOrWeldedRim: false,
        frontToeMm: 1.0,
        frontCamberDeg: -4.5,
        casterLeftRightDeltaDeg: 0.2,
        longeronDiagonalDeltaMm: 1.5,
        vehicleMarketPriceAzn: 28000,
      });

      expect(res.isExtremeStanceCamber342).toBe(true);
      expect(res.prohibitsOperationImmediately).toBe(true);
      expect(res.fineAzn).toBe(150);
    });

    it('calculates tire wear penalty and negative valuation impact for severe longeron twist (>7mm)', () => {
      const res = evaluateWheelFastenersAnd3dGeometry({
        wheelFastenerCondition: 'intact_oem_bolts_rims',
        missingLugBoltsCount: 0,
        hasCrackedOrWeldedRim: false,
        frontToeMm: 4.5, // 2.0 mm over norm
        frontCamberDeg: -2.8, // 0.8 deg over norm
        casterLeftRightDeltaDeg: 0.8, // Pulls to side
        longeronDiagonalDeltaMm: 9.5, // Severe crash distortion
        vehicleMarketPriceAzn: 50000,
      });

      expect(res.isCompliant).toBe(false);
      expect(res.isToeOutOfSpec).toBe(true);
      expect(res.isCamberOutOfSpec).toBe(true);
      expect(res.isCasterPulling).toBe(true);
      expect(res.frameGeometryGrade).toBe('SEVERE_LONGERON_TWIST');
      expect(res.estimatedTireWearPenaltyPercent).toBeGreaterThan(30);
      expect(res.valuationImpactAzn).toBe(-9000); // -18% of 50,000 AZN
    });
  });

  describe('calculateSuspensionServiceCost', () => {
    it('calculates total parts, labor, duration, and currency conversions for selected packages', () => {
      const costAzn = calculateSuspensionServiceCost(
        ['pkg-hunter-3d-alignment', 'pkg-oem-springs-peredok-reset'],
        'AZN'
      );

      expect(costAzn.partsCostAzn).toBe(230); // 10 + 220
      expect(costAzn.laborCostAzn).toBe(130); // 40 + 90
      expect(costAzn.totalAzn).toBe(360);
      expect(costAzn.totalInCurrency).toBe(360);
      expect(costAzn.totalDurationMinutes).toBe(195); // 45 + 150
      expect(costAzn.finesAndTireLossAvoidedAzn).toBe(650);

      const costUsd = calculateSuspensionServiceCost(
        ['pkg-hunter-3d-alignment', 'pkg-oem-springs-peredok-reset'],
        'USD'
      );
      expect(costUsd.totalInCurrency).toBeCloseTo(360 / 1.7, 1);
    });

    it('returns zero costs when no packages are selected', () => {
      const emptyCost = calculateSuspensionServiceCost([], 'AZN');
      expect(emptyCost.totalAzn).toBe(0);
      expect(emptyCost.finesAndTireLossAvoidedAzn).toBe(0);
    });
  });

  describe('generateSuspensionComplianceCertificate', () => {
    it('generates a compliant certificate for healthy suspension and intact chassis', () => {
      const cert = generateSuspensionComplianceCertificate({
        plateNumber: '10-TX-450',
        vin: 'WBA3A5C55FP123456',
        vehicleTitle: 'BMW 330i G20',
        ownerName: 'Əliyev Tural',
        centerName: 'Hunter 3D Alignment & MAHA Stand',
        frontEusamaAvgPercent: 75,
        rearEusamaAvgPercent: 72,
        maxAxleImbalancePercent: 6,
        suspensionModId: 'oem_standard',
        frontToRearPitchDeltaMm: 8,
        missingLugBoltsCount: 0,
        longeronDiagonalDeltaMm: 1.0,
      });

      expect(cert.certificateNumber).toMatch(/^BDYP-ASQ-2026-\d{5}$/);
      expect(cert.overallStatus).toBe('COMPLIANT');
      expect(cert.qrSecurityHash).toContain('10TX450');
      expect(cert.plateNumber).toBe('10-TX-450');
    });

    it('marks certificate as PROHIBITED_96_1_4 when vehicle has illegal Peredok or missing lug bolts', () => {
      const cert = generateSuspensionComplianceCertificate({
        plateNumber: '99-ZZ-999',
        vin: 'WAUZZZF27NA001122',
        vehicleTitle: 'Audi A6 Avant',
        ownerName: 'Hüseynov Murad',
        centerName: 'BDYP Zabrat Stendi',
        frontEusamaAvgPercent: 70,
        rearEusamaAvgPercent: 65,
        maxAxleImbalancePercent: 8,
        suspensionModId: 'peredok_front_lift',
        frontToRearPitchDeltaMm: 50,
        missingLugBoltsCount: 1,
        longeronDiagonalDeltaMm: 1.5,
      });

      expect(cert.overallStatus).toBe('PROHIBITED_96_1_4');
    });

    it('marks certificate as CONDITIONAL_WARNING for moderate EUSAMA wear or minor longeron shift', () => {
      const cert = generateSuspensionComplianceCertificate({
        plateNumber: '77-AB-123',
        vin: 'KMHDH4AE9JU987654',
        vehicleTitle: 'Hyundai Elantra',
        ownerName: 'Nəcəfov Emil',
        centerName: 'Bosch Car Service',
        frontEusamaAvgPercent: 36, // Under 40%
        rearEusamaAvgPercent: 55,
        maxAxleImbalancePercent: 12,
        suspensionModId: 'oem_standard',
        frontToRearPitchDeltaMm: 15,
        missingLugBoltsCount: 0,
        longeronDiagonalDeltaMm: 3.5, // > 3.0 mm
      });

      expect(cert.overallStatus).toBe('CONDITIONAL_WARNING');
    });
  });

  describe('lookupSuspensionCertificateByCode', () => {
    it('retrieves sample certificate by valid certificateNumber, plate, or VIN', () => {
      const certByNum = lookupSuspensionCertificateByCode('BDYP-ASQ-2026-88412');
      expect(certByNum).not.toBeNull();
      expect(certByNum?.plateNumber).toBe('10-AA-700');
      expect(certByNum?.overallStatus).toBe('COMPLIANT');

      const certByPlate = lookupSuspensionCertificateByCode('90-OO-077');
      expect(certByPlate).not.toBeNull();
      expect(certByPlate?.overallStatus).toBe('PROHIBITED_96_1_4');

      const certByVin = lookupSuspensionCertificateByCode('W1N1671591A448210');
      expect(certByVin).not.toBeNull();
      expect(certByVin?.plateNumber).toBe('99-XX-099');
    });

    it('returns null for unknown query or blank input', () => {
      expect(lookupSuspensionCertificateByCode('UNKNOWN-CODE')).toBeNull();
      expect(lookupSuspensionCertificateByCode('')).toBeNull();
    });
  });

  describe('convertFromAzn', () => {
    it('correctly converts AZN to USD and EUR', () => {
      expect(convertFromAzn(170, 'AZN')).toBe(170);
      expect(convertFromAzn(170, 'USD')).toBe(100);
      expect(convertFromAzn(185, 'EUR')).toBe(100);
    });
  });
});

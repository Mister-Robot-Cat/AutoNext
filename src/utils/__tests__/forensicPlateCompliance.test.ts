import { describe, it, expect } from 'vitest';
import {
  evaluateEngineVinForensics,
  evaluateLicensePlateCompliance,
  evaluateSrsAndFluidHermeticity,
  calculateForensicServiceSummary,
  generateForensicPlateCertificate,
  lookupForensicCertificate,
  convertFromAzn,
} from '../forensicPlateCompliance';

describe('forensicPlateCompliance utility engine', () => {
  it('passes MERO transfer when OEM engine numbers match and VIN paint thickness is normal', () => {
    const res = evaluateEngineVinForensics({
      texpasportEngineNumber: 'N20B20A-89412055',
      blockEngineNumber: 'N20B20A-89412055',
      forensicStatus: 'oem_matching',
      hasDgkCustomsDeclaration: false,
      hasJusticeForensicCertificate: false,
      vinPaintThicknessMicrons: 110,
    });
    expect(res.isCompliantForMeroTransfer).toBe(true);
    expect(res.numbersExactMatch).toBe(true);
    expect(res.fineAzn).toBe(0);
    expect(res.stateDutyAzn).toBe(0);
    expect(res.forensicIntegrityScore).toBe(100);
  });

  it('detects undeclared swapped engine (IXM 342.2-1 150 AZN fine) and clears fine when DGK customs declaration is provided', () => {
    const undeclared = evaluateEngineVinForensics({
      texpasportEngineNumber: 'N20B20A-89412055',
      blockEngineNumber: 'N20B20A-33109482',
      forensicStatus: 'swapped_undeclared',
      hasDgkCustomsDeclaration: false,
      hasJusticeForensicCertificate: false,
      vinPaintThicknessMicrons: 120,
    });
    expect(undeclared.isCompliantForMeroTransfer).toBe(false);
    expect(undeclared.prohibitsOperation).toBe(true);
    expect(undeclared.fineAzn).toBe(150);
    expect(undeclared.discountedFineAzn).toBe(75);
    expect(undeclared.stateDutyAzn).toBe(50);

    const withDgk = evaluateEngineVinForensics({
      texpasportEngineNumber: 'N20B20A-89412055',
      blockEngineNumber: 'N20B20A-33109482',
      forensicStatus: 'swapped_undeclared',
      hasDgkCustomsDeclaration: true,
      hasJusticeForensicCertificate: false,
      vinPaintThicknessMicrons: 120,
    });
    expect(withDgk.prohibitsOperation).toBe(false);
    expect(withDgk.fineAzn).toBe(0);
    expect(withDgk.stateDutyAzn).toBe(50);
  });

  it('requires Ministry of Justice forensic lab act for corroded engine numbers and flags >220 micron VIN paint seam', () => {
    const corroded = evaluateEngineVinForensics({
      texpasportEngineNumber: '2ZRFXE-6104921',
      blockEngineNumber: '2ZR***CORRODED***',
      forensicStatus: 'corroded_illegible',
      hasDgkCustomsDeclaration: false,
      hasJusticeForensicCertificate: false,
      vinPaintThicknessMicrons: 310,
    });
    expect(corroded.requiresForensicLabCorrosionAct).toBe(true);
    expect(corroded.vinSeamSuspicious).toBe(true);
    expect(corroded.stateDutyAzn).toBe(110);
  });

  it('triggers criminal investigation (CM Article 320) for welded or re-stamped VIN/Engine numbers', () => {
    const welded = evaluateEngineVinForensics({
      texpasportEngineNumber: 'WBA5A5C50FD918420',
      blockEngineNumber: 'WBA5A5C50FD000000',
      forensicStatus: 'tampered_welded',
      hasDgkCustomsDeclaration: false,
      hasJusticeForensicCertificate: false,
      vinPaintThicknessMicrons: 450,
    });
    expect(welded.triggersCriminalInvestigation).toBe(true);
    expect(welded.prohibitsOperation).toBe(true);
    expect(welded.forensicIntegrityScore).toBe(0);
  });

  it('distinguishes IXM 342.1.3 (40 AZN dirty/unlit plate) from IXM 342.7 (500-800 AZN + 4 points deliberate anti-radar/curtain obstruction)', () => {
    const clean = evaluateLicensePlateCompliance({
      plateCondition: 'clean_standard',
      rearRecessFormat: 'eu_wide_520x112',
      mountedRearPlateType: 'type1_single_line_520',
      rearPlateLampWorking: true,
      measuredNightVisibilityMeters: 25,
      measuredDayVisibilityMeters: 45,
      rfidChipReadable: true,
    });
    expect(clean.isCompliant).toBe(true);
    expect(clean.fineMaxAzn).toBe(0);

    const dirty = evaluateLicensePlateCompliance({
      plateCondition: 'dirty_faded_40azn',
      rearRecessFormat: 'eu_wide_520x112',
      mountedRearPlateType: 'type1_single_line_520',
      rearPlateLampWorking: false,
      measuredNightVisibilityMeters: 10,
      measuredDayVisibilityMeters: 18,
      rfidChipReadable: true,
    });
    expect(dirty.isCompliant).toBe(false);
    expect(dirty.isDeliberateObstructionIxm342_7).toBe(false);
    expect(dirty.fineMaxAzn).toBe(40);
    expect(dirty.penaltyPoints).toBe(0);

    const antiRadar = evaluateLicensePlateCompliance({
      plateCondition: 'magnetic_curtain_frame_800azn',
      rearRecessFormat: 'eu_wide_520x112',
      mountedRearPlateType: 'type1_single_line_520',
      rearPlateLampWorking: true,
      measuredNightVisibilityMeters: 0,
      measuredDayVisibilityMeters: 0,
      rfidChipReadable: false,
    });
    expect(antiRadar.isDeliberateObstructionIxm342_7).toBe(true);
    expect(antiRadar.fineMinAzn).toBe(500);
    expect(antiRadar.fineMaxAzn).toBe(800);
    expect(antiRadar.penaltyPoints).toBe(4);
    expect(antiRadar.requiresImpoundOrConfiscation).toBe(true);
  });

  it('detects US/JDM square tailgate recess mismatch when Type-1 long plate is bent into place', () => {
    const usMismatch = evaluateLicensePlateCompliance({
      plateCondition: 'clean_standard',
      rearRecessFormat: 'us_jdm_square_288x206',
      mountedRearPlateType: 'type1_single_line_520',
      rearPlateLampWorking: true,
      measuredNightVisibilityMeters: 22,
      measuredDayVisibilityMeters: 40,
      rfidChipReadable: true,
    });
    expect(usMismatch.squarePlateMismatch).toBe(true);
    expect(usMismatch.rfidTagPass).toBe(false);
    expect(usMismatch.duplicatePlateFeeAzn).toBe(22);
  });

  it('detects fake 2.2 Ohm carbon resistor "Obmanka" airbag fraud and YHQ Clause 6.1 fuel leak', () => {
    const genuine = evaluateSrsAndFluidHermeticity({
      driverAirbagOhm: 2.2,
      driverAirbagCapacitanceUf: 0.85,
      seatbeltPretensionerWorking: true,
      srsCrashDataStoredInEcu: false,
      fuelSystemLeakDetected: false,
      oilDripDropsPerMinute: 0,
    });
    expect(genuine.isCompliant).toBe(true);
    expect(genuine.obmankaResistorFraudDetected).toBe(false);

    const obmanka = evaluateSrsAndFluidHermeticity({
      driverAirbagOhm: 2.2,
      driverAirbagCapacitanceUf: 0.0,
      seatbeltPretensionerWorking: true,
      srsCrashDataStoredInEcu: false,
      fuelSystemLeakDetected: true,
      oilDripDropsPerMinute: 25,
    });
    expect(obmanka.isCompliant).toBe(false);
    expect(obmanka.obmankaResistorFraudDetected).toBe(true);
    expect(obmanka.prohibitsOperationImmediately).toBe(true);
    expect(obmanka.oilLeakPass).toBe(false);
  });

  it('calculates forensic service package totals and generates/looks up BDYP-EKS-2026 certificates', () => {
    const summary = calculateForensicServiceSummary(
      ['pkg_texpasport_engine_update', 'pkg_type2_square_plate'],
      'AZN'
    );
    expect(summary.totalAzn).toBe(72); // 50 + 22
    expect(convertFromAzn(170, 'USD')).toBe(100);

    const cert = generateForensicPlateCertificate({
      vehiclePlate: '99-ZZ-999',
      vin: 'WBA5A5C50FD918420',
      vehicleModel: 'BMW 528i',
      recordedEngineNumber: 'N20B20A-111',
      inspectedEngineNumber: 'N20B20A-111',
      plateFormat: 'type2_two_line_288',
      plateNightReadabilityMeters: 25,
      inspectingCenterAz: 'BDYP Meyvəli MERO',
    });
    expect(cert.certificateNumber).toMatch(/^BDYP-EKS-2026-\d{5}$/);

    const found = lookupForensicCertificate('99-ZZ-999', [cert]);
    expect(found?.vehiclePlate).toBe('99-ZZ-999');

    const sampleFound = lookupForensicCertificate('90-AA-700');
    expect(sampleFound?.certificateNumber).toBe('BDYP-EKS-2026-84920');
  });
});

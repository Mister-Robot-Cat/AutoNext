import { describe, it, expect } from 'vitest';
import {
  evaluateBodyColorWrapCompliance,
  evaluateVehicleAdvertisingCompliance,
  evaluateExteriorHardwareCompliance,
  calculateBodyworkServiceSummary,
  generateBodyworkComplianceCertificate,
  lookupBodyworkCertificate,
  convertFromAzn,
} from '../bodyworkAdvertisingCompliance';

describe('bodyworkAdvertisingCompliance utility engine', () => {
  it('exempts Clear PPF (100% coverage) and <30% black panoramic roof wrap from MERO Texpasport replacement', () => {
    const clearPpf = evaluateBodyColorWrapCompliance({
      wrapType: 'clear_ppf_shield',
      wrapCoveragePercent: 100,
      daysSinceWrapApplied: 90,
      isEndorsedInTexpasport: false,
    });
    expect(clearPpf.isCompliant).toBe(true);
    expect(clearPpf.requiresTexpasportUpdate).toBe(false);
    expect(clearPpf.fineAzn).toBe(0);
    expect(clearPpf.meroStateDutyAzn).toBe(0);

    const blackRoof = evaluateBodyColorWrapCompliance({
      wrapType: 'two_tone_roof_under30',
      wrapCoveragePercent: 22,
      daysSinceWrapApplied: 45,
      isEndorsedInTexpasport: false,
    });
    expect(blackRoof.isCompliant).toBe(true);
    expect(blackRoof.exceeds30PercentThreshold).toBe(false);
    expect(blackRoof.requiresTexpasportUpdate).toBe(false);
    expect(blackRoof.fineAzn).toBe(0);
  });

  it('enforces YHQ Article 27 10-day grace window and IXM 342.2-1 (150 AZN fine + 50 AZN MERO duty) for undeclared >30% matte/color wraps', () => {
    const within10Days = evaluateBodyColorWrapCompliance({
      wrapType: 'full_matte_or_color_wrap',
      wrapCoveragePercent: 85,
      daysSinceWrapApplied: 6,
      isEndorsedInTexpasport: false,
    });
    expect(within10Days.isCompliant).toBe(true);
    expect(within10Days.requiresTexpasportUpdate).toBe(true);
    expect(within10Days.fineAzn).toBe(0);
    expect(within10Days.meroStateDutyAzn).toBe(50);

    const expiredUnregistered = evaluateBodyColorWrapCompliance({
      wrapType: 'full_matte_or_color_wrap',
      wrapCoveragePercent: 85,
      daysSinceWrapApplied: 25,
      isEndorsedInTexpasport: false,
    });
    expect(expiredUnregistered.isCompliant).toBe(false);
    expect(expiredUnregistered.prohibitsOperation).toBe(true);
    expect(expiredUnregistered.fineAzn).toBe(150);
    expect(expiredUnregistered.discountedFineAzn).toBe(75);
    expect(expiredUnregistered.meroStateDutyAzn).toBe(50);

    const endorsed = evaluateBodyColorWrapCompliance({
      wrapType: 'full_matte_or_color_wrap',
      wrapCoveragePercent: 85,
      daysSinceWrapApplied: 25,
      isEndorsedInTexpasport: true,
    });
    expect(endorsed.isCompliant).toBe(true);
    expect(endorsed.fineAzn).toBe(0);
    expect(endorsed.meroStateDutyAzn).toBe(0);
  });

  it('prohibits operative police/ambulance color-graphic schemes under YHQ Annex 1 Clause 7.14 and IXM 342.9 (800 AZN)', () => {
    const operative = evaluateBodyColorWrapCompliance({
      wrapType: 'prohibited_operative_livery',
      wrapCoveragePercent: 45,
      daysSinceWrapApplied: 1,
      isEndorsedInTexpasport: false,
    });
    expect(operative.isCompliant).toBe(false);
    expect(operative.isProhibitedOperativeScheme).toBe(true);
    expect(operative.prohibitsOperation).toBe(true);
    expect(operative.fineAzn).toBe(800);
  });

  it('evaluates vehicle advertising under Law on Advertising Article 26 and IXM 342.1.8 (50 AZN driver / 150-300 AZN official)', () => {
    const compliantDoors = evaluateVehicleAdvertisingCompliance({
      adPlacementType: 'side_doors_compliant',
      adCoveragePercent: 35,
      hasAdraClearance: true,
      isEndorsedInTexpasport: false,
      coversWindowsOrLights: false,
      hasSoundAmplifierOrRoofSign: false,
    });
    expect(compliantDoors.isCompliant).toBe(true);
    expect(compliantDoors.driverFineAzn).toBe(0);

    const over50Unendorsed = evaluateVehicleAdvertisingCompliance({
      adPlacementType: 'full_body_over50_unregistered',
      adCoveragePercent: 75,
      hasAdraClearance: false,
      isEndorsedInTexpasport: false,
      coversWindowsOrLights: false,
      hasSoundAmplifierOrRoofSign: false,
    });
    expect(over50Unendorsed.isCompliant).toBe(false);
    expect(over50Unendorsed.exceeds50PercentSurface).toBe(true);
    expect(over50Unendorsed.requiresTexpasportAdNote).toBe(true);
    expect(over50Unendorsed.driverFineAzn).toBe(50);
    expect(over50Unendorsed.officialEntityFineAzn).toBe(150);

    const windowAndAudio = evaluateVehicleAdvertisingCompliance({
      adPlacementType: 'window_or_light_obstructing',
      adCoveragePercent: 60,
      hasAdraClearance: true,
      isEndorsedInTexpasport: true,
      coversWindowsOrLights: true,
      hasSoundAmplifierOrRoofSign: true,
    });
    expect(windowAndAudio.isCompliant).toBe(false);
    expect(windowAndAudio.prohibitsOperation).toBe(true);
    expect(windowAndAudio.driverFineAzn).toBe(50);
    expect(windowAndAudio.officialEntityFineAzn).toBe(300);
  });

  it('audits farkop plate obstruction (IXM 342.1.3 40 AZN), illegal steel kenguryatnik (IXM 342.2-1 150 AZN), and 4.0m roof height limit', () => {
    const cleanFarkop = evaluateExteriorHardwareCompliance({
      hardwareProfile: 'removable_certified_farkop',
      farkopTrailerSocketWorking: true,
      roofBoxMounted: true,
      totalVehicleHeightMeters: 2.25,
      roofCargoProtrusionMeters: 0.3,
      fuelTankCapSealed: true,
    });
    expect(cleanFarkop.isCompliant).toBe(true);
    expect(cleanFarkop.fineAzn).toBe(0);

    const blockingFarkop = evaluateExteriorHardwareCompliance({
      hardwareProfile: 'fixed_farkop_blocking_plate',
      farkopTrailerSocketWorking: true,
      roofBoxMounted: false,
      totalVehicleHeightMeters: 1.75,
      roofCargoProtrusionMeters: 0,
      fuelTankCapSealed: true,
    });
    expect(blockingFarkop.isCompliant).toBe(false);
    expect(blockingFarkop.blocksLicensePlateDqn).toBe(true);
    expect(blockingFarkop.fineAzn).toBe(40);

    const illegalKenguryatnik = evaluateExteriorHardwareCompliance({
      hardwareProfile: 'unregistered_steel_kenguryatnik',
      farkopTrailerSocketWorking: false,
      roofBoxMounted: true,
      totalVehicleHeightMeters: 4.2,
      roofCargoProtrusionMeters: 2.3,
      fuelTankCapSealed: false,
    });
    expect(illegalKenguryatnik.isCompliant).toBe(false);
    expect(illegalKenguryatnik.illegalSteelKenguryatnik).toBe(true);
    expect(illegalKenguryatnik.heightLimitExceeded).toBe(true);
    expect(illegalKenguryatnik.fuelCapMissingViolation).toBe(true);
    expect(illegalKenguryatnik.prohibitsOperationImmediately).toBe(true);
    expect(illegalKenguryatnik.fineAzn).toBe(150);
  });

  it('calculates bodywork service packages and generates/looks up BDYP-KUZ-2026 certificates', () => {
    const summary = calculateBodyworkServiceSummary(
      ['pkg_mero_color_texpasport', 'pkg_adra_vehicle_ad_clearance'],
      'AZN'
    );
    expect(summary.totalAzn).toBe(105); // 50 + 55
    expect(convertFromAzn(170, 'USD')).toBe(100);

    const cert = generateBodyworkComplianceCertificate({
      vehiclePlate: '99-KU-999',
      vin: 'WBS8M9C50J5K41820',
      vehicleModel: 'BMW M5',
      recordedTexpasportColorAz: 'Qara Mat',
      wrapAndPaintStatusAz: 'Tam qanuni',
      farkopAndRoofStatusAz: 'Normada',
      inspectingCenterAz: 'BDYP Meyvəli MERO',
    });
    expect(cert.certificateNumber).toMatch(/^BDYP-KUZ-2026-\d{5}$/);

    const customFound = lookupBodyworkCertificate('99-KU-999', [cert]);
    expect(customFound?.vehiclePlate).toBe('99-KU-999');

    const sampleFound = lookupBodyworkCertificate('90-KZ-777');
    expect(sampleFound?.certificateNumber).toBe('BDYP-KUZ-2026-90412');
  });
});

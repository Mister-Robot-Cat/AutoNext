import { describe, it, expect } from 'vitest';
import {
  STATUTORY_TREAD_LIMITS_MM,
  STATUTORY_TIRE_FINES,
  convertTireCurrency,
  formatTireSpecLabel,
  determineVehicleTireParameters,
  evaluateTireTreadCompliance,
  calculateTireSizeEquivalence,
  evaluateMountainWinterReadiness,
  calculateTireServiceCost,
  generateElectronicTireCertificate,
} from '../tireCompliance';
import {
  MOUNTAIN_PASS_CORRIDORS,
  CERTIFIED_TIRE_SERVICE_CENTERS,
  SAMPLE_TIRE_CERTIFICATES,
} from '../../data/mockTireData';
import { Vehicle } from '../../types/vehicle';

describe('tireCompliance utility engine', () => {
  it('verifies statutory YHQ Annex 1 Section V tread limits and IXM fines', () => {
    expect(STATUTORY_TREAD_LIMITS_MM.M1_passenger).toBe(1.6);
    expect(STATUTORY_TREAD_LIMITS_MM.N1_N3_truck).toBe(1.0);
    expect(STATUTORY_TREAD_LIMITS_MM.M2_M3_bus).toBe(2.0);
    expect(STATUTORY_TREAD_LIMITS_MM.L_motorcycle).toBe(0.8);
    expect(STATUTORY_TIRE_FINES.IXM_342_1_5_TREAD_OR_AXLE_AZN).toBe(50);
    expect(STATUTORY_TIRE_FINES.IXM_342_2_1_CONSTRUCTIVE_SIZE_AZN).toBe(150);
  });

  it('converts AZN tire amounts to USD and EUR accurately', () => {
    expect(convertTireCurrency(170, 'AZN')).toBe(170);
    expect(convertTireCurrency(170, 'USD')).toBe(100);
    expect(convertTireCurrency(185, 'EUR')).toBe(100);
  });

  it('formats tire specification label properly', () => {
    expect(
      formatTireSpecLabel({ widthMm: 245, aspectRatio: 45, rimDiameterInches: 19 })
    ).toBe('245/45 R19');
  });

  it('determines default tire parameters for null or specific vehicle types', () => {
    const fallback = determineVehicleTireParameters(null);
    expect(fallback.oemSpec.rimDiameterInches).toBe(18);
    expect(fallback.vehicleCategory).toBe('M1_passenger');

    const suvVehicle = {
      bodyType: 'SUV',
      powerHp: 280,
      drivetrain: 'AWD',
    } as unknown as Vehicle;
    const suvParams = determineVehicleTireParameters(suvVehicle);
    expect(suvParams.oemSpec.widthMm).toBe(255);
    expect(suvParams.oemSpec.rimDiameterInches).toBe(20);
    expect(suvParams.drivetrain).toBe('AWD_4WD');

    const coupeVehicle = {
      bodyType: 'Coupe',
      powerHp: 340,
      drivetrain: 'RWD',
    } as unknown as Vehicle;
    const coupeParams = determineVehicleTireParameters(coupeVehicle);
    expect(coupeParams.oemSpec.rimDiameterInches).toBe(19);
    expect(coupeParams.drivetrain).toBe('RWD');
  });

  describe('evaluateTireTreadCompliance (YHQ Annex 1 Section V & IXM 342.1.5)', () => {
    it('approves compliant M1 passenger tires with healthy tread and zero defects', () => {
      const result = evaluateTireTreadCompliance({
        vehicleCategory: 'M1_passenger',
        tireSeason: 'winter_3pmsf',
        treadDepthMm: {
          frontLeft: 6.2,
          frontRight: 6.1,
          rearLeft: 6.5,
          rearRight: 6.4,
        },
        hasMixedAxleTires: false,
        hasSidewallDamageOrExposedCord: false,
        hasMissingWheelBolts: false,
        dotManufactureYear: 2024,
        isWinterMountainRoute: true,
        currentYear: 2026,
      });

      expect(result.isTreadCompliant).toBe(true);
      expect(result.isWinterMountainCompliant).toBe(true);
      expect(result.isFullyCompliant).toBe(true);
      expect(result.fineAmountAzn).toBe(0);
      expect(result.violationArticles).toHaveLength(0);
      expect(result.hydroplaningRiskLevel).toBe('LOW');
    });

    it('flags violation and 50 AZN fine when passenger car tread drops below 1.6 mm', () => {
      const result = evaluateTireTreadCompliance({
        vehicleCategory: 'M1_passenger',
        tireSeason: 'summer',
        treadDepthMm: {
          frontLeft: 1.3,
          frontRight: 1.5,
          rearLeft: 2.2,
          rearRight: 2.1,
        },
        hasMixedAxleTires: false,
        hasSidewallDamageOrExposedCord: false,
        hasMissingWheelBolts: false,
        dotManufactureYear: 2023,
        isWinterMountainRoute: false,
      });

      expect(result.minMeasuredTreadMm).toBe(1.3);
      expect(result.isTreadCompliant).toBe(false);
      expect(result.isFullyCompliant).toBe(false);
      expect(result.fineAmountAzn).toBe(50);
      expect(result.hydroplaningRiskLevel).toBe('CRITICAL');
      expect(result.violationArticles.some((v) => v.includes('342.1.5'))).toBe(true);
    });

    it('enforces 2.0 mm minimum for buses (M2/M3) and 0.8 mm for motorcycles (L)', () => {
      const busResult = evaluateTireTreadCompliance({
        vehicleCategory: 'M2_M3_bus',
        tireSeason: 'all_season_ms',
        treadDepthMm: { frontLeft: 1.8, frontRight: 1.8, rearLeft: 2.2, rearRight: 2.2 },
        hasMixedAxleTires: false,
        hasSidewallDamageOrExposedCord: false,
        hasMissingWheelBolts: false,
        dotManufactureYear: 2024,
        isWinterMountainRoute: false,
      });
      expect(busResult.statutoryMinMm).toBe(2.0);
      expect(busResult.isTreadCompliant).toBe(false);
      expect(busResult.fineAmountAzn).toBe(50);

      const motoResult = evaluateTireTreadCompliance({
        vehicleCategory: 'L_motorcycle',
        tireSeason: 'summer',
        treadDepthMm: { frontLeft: 1.0, frontRight: 1.0, rearLeft: 1.2, rearRight: 1.2 },
        hasMixedAxleTires: false,
        hasSidewallDamageOrExposedCord: false,
        hasMissingWheelBolts: false,
        dotManufactureYear: 2024,
        isWinterMountainRoute: false,
      });
      expect(motoResult.statutoryMinMm).toBe(0.8);
      expect(motoResult.isTreadCompliant).toBe(true);
      expect(motoResult.fineAmountAzn).toBe(0);
    });

    it('detects mixed axle tires, sidewall bulge/cord damage, missing bolts, and old DOT age', () => {
      const result = evaluateTireTreadCompliance({
        vehicleCategory: 'M1_passenger',
        tireSeason: 'all_season_ms',
        treadDepthMm: { frontLeft: 5.0, frontRight: 3.0, rearLeft: 5.0, rearRight: 5.0 },
        hasMixedAxleTires: true,
        hasSidewallDamageOrExposedCord: true,
        hasMissingWheelBolts: true,
        dotManufactureYear: 2015,
        isWinterMountainRoute: false,
        currentYear: 2026,
      });

      expect(result.violationArticles).toHaveLength(3);
      expect(result.fineAmountAzn).toBe(50);
      expect(result.isAgeWarning).toBe(true);
      expect(result.isAgeCritical).toBe(true);
      expect(result.frontAxleDiffMm).toBe(2.0);
    });
  });

  describe('calculateTireSizeEquivalence (OEM vs Target Fitment & IXM 342.2-1)', () => {
    it('identifies identical OEM and target specs with zero deviation', () => {
      const res = calculateTireSizeEquivalence(
        { widthMm: 225, aspectRatio: 55, rimDiameterInches: 18 },
        { widthMm: 225, aspectRatio: 55, rimDiameterInches: 18 }
      );

      expect(res.diameterDiffMm).toBe(0);
      expect(res.diameterDiffPercent).toBe(0);
      expect(res.clearanceDeltaMm).toBe(0);
      expect(res.actualSpeedAt100Kmh).toBe(100);
      expect(res.isWithinTolerance3Percent).toBe(true);
      expect(res.constructiveFineRiskAzn).toBe(0);
      expect(res.fitmentVerdict).toBe('OPTIMAL_FIT');
    });

    it('flags non-compliant constructive change (>3% diameter diff) with 150 AZN fine risk', () => {
      const res = calculateTireSizeEquivalence(
        { widthMm: 215, aspectRatio: 55, rimDiameterInches: 17 },
        { widthMm: 255, aspectRatio: 60, rimDiameterInches: 19 }
      );

      expect(Math.abs(res.diameterDiffPercent)).toBeGreaterThan(3.0);
      expect(res.isWithinTolerance3Percent).toBe(false);
      expect(res.requiresConstructiveCert).toBe(true);
      expect(res.constructiveFineRiskAzn).toBe(150);
      expect(res.fitmentVerdict).toBe('NON_COMPLIANT_CONSTRUCTIVE_CHANGE');
      expect(res.actualSpeedAt100Kmh).toBeGreaterThan(105);
    });
  });

  describe('evaluateMountainWinterReadiness (Agsu, Shahdag, Murovdag checkpoints)', () => {
    it('clears AWD vehicle with 3PMSF winter tires and >4mm tread for Shahdag pass', () => {
      const shahdag = MOUNTAIN_PASS_CORRIDORS.find((c) => c.id === 'shahdag-laza-r1')!;
      const result = evaluateMountainWinterReadiness({
        corridor: shahdag,
        drivetrain: 'AWD_4WD',
        tireSeason: 'winter_3pmsf',
        minTreadDepthMm: 6.5,
        hasSnowChainsOnBoard: true,
        hasMandatoryEmergencyKit: true,
      });

      expect(result.isClearedForPassage).toBe(true);
      expect(result.checkpointStatus).toBe('CLEARED_GREEN');
      expect(result.readinessScore).toBeGreaterThanOrEqual(85);
    });

    it('restricts vehicle equipped with summer tires on snowy mountain pass', () => {
      const agsu = MOUNTAIN_PASS_CORRIDORS[0];
      const result = evaluateMountainWinterReadiness({
        corridor: agsu,
        drivetrain: 'FWD',
        tireSeason: 'summer',
        minTreadDepthMm: 5.5,
        hasSnowChainsOnBoard: false,
        hasMandatoryEmergencyKit: true,
      });

      expect(result.isClearedForPassage).toBe(false);
      expect(result.checkpointStatus).toBe('RESTRICTED_RED');
    });

    it('requires snow chains (AMBER) for RWD car without chains on Murovdag corridor', () => {
      const murovdag = MOUNTAIN_PASS_CORRIDORS.find(
        (c) => c.id === 'murovdag-kelbecer-r19'
      )!;
      const result = evaluateMountainWinterReadiness({
        corridor: murovdag,
        drivetrain: 'RWD',
        tireSeason: 'winter_3pmsf',
        minTreadDepthMm: 5.5,
        hasSnowChainsOnBoard: false,
        hasMandatoryEmergencyKit: true,
      });

      expect(result.isClearedForPassage).toBe(false);
      expect(result.checkpointStatus).toBe('CHAINS_REQUIRED_AMBER');
    });
  });

  describe('calculateTireServiceCost & generateElectronicTireCertificate', () => {
    it('calculates 4-tire purchase, mounting, 3D alignment, TPMS, nitrogen, and Tire Hotel', () => {
      const cost = calculateTireServiceCost({
        includeNewTireSet4x: true,
        rimSizeTier: 'R17_R18',
        brandTier: 'mid_range_touring',
        includeSeasonalMountAndBalance: true,
        include3dWheelAlignment: true,
        includeTpmsSensorCalibration: true,
        includeNitrogenInflation: true,
        include6MonthTireHotel: true,
      });

      // 4 * 210 = 840 + 45 + 40 + 35 + 15 + 90 = 1065
      expect(cost.tireSetCostAzn).toBe(840);
      expect(cost.mountAndBalanceCostAzn).toBe(45);
      expect(cost.wheelAlignment3dCostAzn).toBe(40);
      expect(cost.tpmsCalibrationCostAzn).toBe(35);
      expect(cost.nitrogenCostAzn).toBe(15);
      expect(cost.tireHotel6MonthCostAzn).toBe(90);
      expect(cost.totalCostAzn).toBe(1065);
    });

    it('generates verifiable BDYP-SHIN-2026 certificate and validates mock datasets', () => {
      const treadAudit = evaluateTireTreadCompliance({
        vehicleCategory: 'M1_passenger',
        tireSeason: 'winter_3pmsf',
        treadDepthMm: { frontLeft: 6.0, frontRight: 6.0, rearLeft: 6.2, rearRight: 6.2 },
        hasMixedAxleTires: false,
        hasSidewallDamageOrExposedCord: false,
        hasMissingWheelBolts: false,
        dotManufactureYear: 2025,
        isWinterMountainRoute: true,
      });
      const equivalence = calculateTireSizeEquivalence(
        { widthMm: 225, aspectRatio: 55, rimDiameterInches: 18 },
        { widthMm: 225, aspectRatio: 55, rimDiameterInches: 18 }
      );

      const cert = generateElectronicTireCertificate({
        vehiclePlate: '99-TT-999',
        vehicleTitle: 'Toyota RAV4 Hybrid',
        vin: 'JTMWRREV00D112233',
        treadAudit,
        equivalence,
        tireSeason: 'winter_3pmsf',
        vehicleCategory: 'M1_passenger',
        measuredTreadMm: { frontLeft: 6.0, frontRight: 6.0, rearLeft: 6.2, rearRight: 6.2 },
        inspectingCenter: CERTIFIED_TIRE_SERVICE_CENTERS[0].name,
      });

      expect(cert.certificateNumber).toMatch(/^BDYP-SHIN-2026-\d{5}$/);
      expect(cert.complianceStatus).toBe('COMPLIANT');
      expect(MOUNTAIN_PASS_CORRIDORS.length).toBeGreaterThanOrEqual(6);
      expect(CERTIFIED_TIRE_SERVICE_CENTERS.length).toBeGreaterThanOrEqual(6);
      expect(SAMPLE_TIRE_CERTIFICATES.length).toBeGreaterThanOrEqual(3);
    });
  });
});

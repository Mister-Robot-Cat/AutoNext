import { describe, expect, it } from 'vitest';
import {
  auditHeadlightCompliance,
  calculateLightingServiceEstimate,
  evaluateBeamRegloscope,
  formatLightingCurrency,
  generateHeadlightCertificate,
  getVehicleDefaultLightingProfile,
} from '../headlightCompliance';
import {
  OPTICAL_SERVICE_CENTERS,
  findHeadlightCertificateByCode,
} from '../../data/mockHeadlightData';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('headlightCompliance utility engine', () => {
  describe('auditHeadlightCompliance (YHQ Annex 1 Section III & IXM 342.2-1 / 342.1.4 / 342.9)', () => {
    it('approves compliant OEM LED / Matrix configuration within 3000K-6000K range', () => {
      const result = auditHeadlightCompliance({
        housingMarking: 'LED_OEM_MODULE',
        installedBulb: 'oem_led_matrix',
        hasProjectorLens: true,
        hasAutoLevelingSystem: true,
        hasHeadlampWasher: true,
        colorTemperatureKelvin: 5500,
        hasSmokedTailLightFilm: false,
        hasRedRearTurnSignalsUsSpec: false,
        hasMalfunctioningStopOrLowBeam: false,
        specialBeaconType: 'NONE',
      });

      expect(result.isFullyCompliant).toBe(true);
      expect(result.fineAmountAzn).toBe(0);
      expect(result.verdictLevel).toBe('COMPLIANT');
      expect(result.prohibitionOfOperationRisk).toBe(false);
    });

    it('flags illegal HID Xenon kit inside HCR halogen housing with 150 AZN fine under IXM 342.2-1', () => {
      const result = auditHeadlightCompliance({
        housingMarking: 'HCR_HALOGEN',
        installedBulb: 'xenon_hid_retrofit',
        hasProjectorLens: false,
        hasAutoLevelingSystem: false,
        hasHeadlampWasher: false,
        colorTemperatureKelvin: 6000,
        hasSmokedTailLightFilm: false,
        hasRedRearTurnSignalsUsSpec: false,
        hasMalfunctioningStopOrLowBeam: false,
        specialBeaconType: 'NONE',
      });

      expect(result.isHousingBulbCompatible).toBe(false);
      expect(result.isFullyCompliant).toBe(false);
      expect(result.fineAmountAzn).toBe(150);
      expect(result.prohibitionOfOperationRisk).toBe(true);
      expect(result.verdictLevel).toBe('CONSTRUCTIVE_VIOLATION');
      expect(result.violationArticles.some((v) => v.includes('342.2-1'))).toBe(true);
    });

    it('flags plug-in LED bulb inside open reflector HCR housing without projector lens', () => {
      const result = auditHeadlightCompliance({
        housingMarking: 'HCR_HALOGEN',
        installedBulb: 'led_bulb_retrofit',
        hasProjectorLens: false,
        hasAutoLevelingSystem: false,
        hasHeadlampWasher: false,
        colorTemperatureKelvin: 5500,
        hasSmokedTailLightFilm: false,
        hasRedRearTurnSignalsUsSpec: false,
        hasMalfunctioningStopOrLowBeam: false,
        specialBeaconType: 'NONE',
      });

      expect(result.isHousingBulbCompatible).toBe(false);
      expect(result.fineAmountAzn).toBe(150);
      expect(result.prohibitionOfOperationRisk).toBe(true);
    });

    it('flags >6000K blue/violet color temperature bulbs with 150 AZN fine', () => {
      const result = auditHeadlightCompliance({
        housingMarking: 'HCR_HALOGEN',
        installedBulb: 'halogen_oem',
        hasProjectorLens: true,
        hasAutoLevelingSystem: true,
        hasHeadlampWasher: true,
        colorTemperatureKelvin: 8000,
        hasSmokedTailLightFilm: false,
        hasRedRearTurnSignalsUsSpec: false,
        hasMalfunctioningStopOrLowBeam: false,
        specialBeaconType: 'NONE',
      });

      expect(result.isKelvinLegal).toBe(false);
      expect(result.fineAmountAzn).toBe(150);
      expect(result.verdictLevel).toBe('CONSTRUCTIVE_VIOLATION');
    });

    it('flags smoked tail light film under YHQ Annex 1 Clause 3.6 & IXM 342.2-1 (150 AZN)', () => {
      const result = auditHeadlightCompliance({
        housingMarking: 'LED_OEM_MODULE',
        installedBulb: 'oem_led_matrix',
        hasProjectorLens: true,
        hasAutoLevelingSystem: true,
        hasHeadlampWasher: true,
        colorTemperatureKelvin: 5500,
        hasSmokedTailLightFilm: true,
        hasRedRearTurnSignalsUsSpec: false,
        hasMalfunctioningStopOrLowBeam: false,
        specialBeaconType: 'NONE',
      });

      expect(result.isRearLightingLegal).toBe(false);
      expect(result.fineAmountAzn).toBe(150);
      expect(result.prohibitionOfOperationRisk).toBe(true);
    });

    it('flags malfunctioning stop/low-beam bulb with 50 AZN fine under IXM 342.1.4', () => {
      const result = auditHeadlightCompliance({
        housingMarking: 'HCR_HALOGEN',
        installedBulb: 'halogen_oem',
        hasProjectorLens: false,
        hasAutoLevelingSystem: false,
        hasHeadlampWasher: false,
        colorTemperatureKelvin: 4300,
        hasSmokedTailLightFilm: false,
        hasRedRearTurnSignalsUsSpec: false,
        hasMalfunctioningStopOrLowBeam: true,
        specialBeaconType: 'NONE',
      });

      expect(result.isRearLightingLegal).toBe(false);
      expect(result.fineAmountAzn).toBe(50);
      expect(result.verdictLevel).toBe('WARNING_DEFECT');
    });

    it('flags unauthorized red/blue strobe beacon or siren under IXM 342.9 with confiscation risk', () => {
      const result = auditHeadlightCompliance({
        housingMarking: 'LED_OEM_MODULE',
        installedBulb: 'oem_led_matrix',
        hasProjectorLens: true,
        hasAutoLevelingSystem: true,
        hasHeadlampWasher: true,
        colorTemperatureKelvin: 5500,
        hasSmokedTailLightFilm: false,
        hasRedRearTurnSignalsUsSpec: false,
        hasMalfunctioningStopOrLowBeam: false,
        specialBeaconType: 'RED_BLUE_UNAUTHORIZED_STROBE',
      });

      expect(result.isBeaconLegal).toBe(false);
      expect(result.deviceConfiscationRisk).toBe(true);
      expect(result.fineAmountAzn).toBe(650);
      expect(result.verdictLevel).toBe('SEVERE_BEACON_VIOLATION');
    });
  });

  describe('evaluateBeamRegloscope (BDYP Laser Regloscope & Luxmeter Stand)', () => {
    it('passes properly aimed ECE right-hand traffic headlamp with low glare', () => {
      const res = evaluateBeamRegloscope({
        mountingHeightMm: 700,
        verticalSlopePercent: -1.3,
        horizontalDeviationDeg: 0.1,
        lowBeamIntensityLuxAt25m: 28,
        glareZoneLuxAboveCutOff: 0.45,
        highBeamIntensityLuxAt25m: 70,
        beamPatternStandard: 'ECE_RIGHT_TRAFFIC',
      });

      expect(res.passesRegloscopeInspection).toBe(true);
      expect(res.oncomingGlareRisk).toBe('NONE');
      expect(res.estimatedLowBeamVisibilityMeters).toBeGreaterThan(40);
    });

    it('fails Japanese/UK RHD left-hand traffic beam due to critical oncoming blinding risk', () => {
      const res = evaluateBeamRegloscope({
        mountingHeightMm: 700,
        verticalSlopePercent: -1.3,
        horizontalDeviationDeg: 0.0,
        lowBeamIntensityLuxAt25m: 28,
        glareZoneLuxAboveCutOff: 0.5,
        highBeamIntensityLuxAt25m: 70,
        beamPatternStandard: 'JDM_UK_LEFT_TRAFFIC',
      });

      expect(res.isBeamPatternRightHandCompliant).toBe(false);
      expect(res.passesRegloscopeInspection).toBe(false);
      expect(res.oncomingGlareRisk).toBe('CRITICAL_BLINDING');
    });

    it('fails upward tilted beam (-0.2%) and high glare (>1.0 Lux)', () => {
      const res = evaluateBeamRegloscope({
        mountingHeightMm: 860,
        verticalSlopePercent: -0.2,
        horizontalDeviationDeg: 0.0,
        lowBeamIntensityLuxAt25m: 25,
        glareZoneLuxAboveCutOff: 1.8,
        highBeamIntensityLuxAt25m: 65,
        beamPatternStandard: 'ECE_RIGHT_TRAFFIC',
      });

      expect(res.isSlopeCompliant).toBe(false);
      expect(res.isGlareWithinLimit).toBe(false);
      expect(res.passesRegloscopeInspection).toBe(false);
      expect(res.oncomingGlareRisk).toBe('CRITICAL_BLINDING');
    });
  });

  describe('calculateLightingServiceEstimate & certificates', () => {
    it('calculates total service cost, duration, and visibility gain accurately', () => {
      const center = OPTICAL_SERVICE_CENTERS[0];
      const est = calculateLightingServiceEstimate({
        center,
        includeRegloscopeAiming: true,
        includeLensPolishing: true,
        includeJdmToEceConversion: false,
        includeUsAmberTurnConversion: true,
        includeCertifiedBiLedRetrofit: false,
        includeAzsConstructiveEndorsement: false,
      });

      expect(est.totalCostAzn).toBe(
        center.regloscopeCalibrationFeeAzn +
          center.lensPolishingCeramicFeeAzn +
          center.usAmberTurnConversionFeeAzn
      );
      expect(est.visibilityGainMeters).toBe(30);
      expect(est.passesBdypInspectionAfterService).toBe(true);
    });

    it('generates and finds BDYP-FARA-2026 compliance certificate', () => {
      const cert = generateHeadlightCertificate({
        plateNumber: '10-ZZ-900',
        vin: 'WBA12345678901234',
        vehicleTitle: '2022 BMW 530i',
        housingMarking: 'LED_OEM_MODULE',
        installedBulbLabel: 'Zavod Tam LED',
        colorTemperatureKelvin: 5500,
        measuredSlopePercent: -1.3,
        measuredGlareLux: 0.4,
        beamStandardLabel: 'ECE R112',
        inspectionCenterName: OPTICAL_SERVICE_CENTERS[0].name,
      });

      expect(cert.certificateNumber).toMatch(/^BDYP-FARA-2026-\d{5}$/);
      const found = findHeadlightCertificateByCode('10-ZZ-900', [cert]);
      expect(found?.certificateNumber).toBe(cert.certificateNumber);
    });

    it('formats currency and derives default lighting profile from vehicle', () => {
      expect(formatLightingCurrency(170, 'AZN')).toContain('170');
      expect(formatLightingCurrency(170, 'USD')).toBe('$100');
      const profile = getVehicleDefaultLightingProfile(MOCK_VEHICLES[0]);
      expect(profile.colorTemperatureKelvin).toBeGreaterThanOrEqual(4300);
    });
  });
});

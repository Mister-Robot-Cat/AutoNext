import { describe, expect, it } from 'vitest';
import {
  convertFromAzn,
  evaluateDriverWorkRestRegime,
  evaluateTachographHardwareCompliance,
  evaluatePassengerFreightManifest,
  calculateTachographServiceSummary,
  lookupTachographCertificate,
} from '../tachographCompliance';

describe('tachographCompliance utility suite (AYNA / BDYP / AETR)', () => {
  describe('convertFromAzn', () => {
    it('correctly converts AZN to USD and EUR', () => {
      expect(convertFromAzn(170, 'AZN')).toBe(170);
      expect(convertFromAzn(170, 'USD')).toBe(100);
      expect(convertFromAzn(185, 'EUR')).toBe(100);
    });
  });

  describe('evaluateDriverWorkRestRegime (NK Decision No. 73 & AETR)', () => {
    it('approves compliant continuous (<=4.5h), daily (<=9h), and weekly (<=56h) driving', () => {
      const result = evaluateDriverWorkRestRegime({
        continuousDrivingHours: 4.0,
        breakTakenMinutes: 45,
        dailyDrivingHours: 8.5,
        extendedDaysUsedThisWeek: 1,
        dailyRestHours: 11.0,
        weeklyDrivingHours: 44,
        biweeklyDrivingHours: 82,
        isDoubleCrewMultiManning: false,
      });

      expect(result.isCompliant).toBe(true);
      expect(result.fatigueLevel).toBe('normal_within_4h30');
      expect(result.driverFineAzn).toBe(0);
      expect(result.officialEntityFineAzn).toBe(0);
    });

    it('flags continuous driving > 4.5h without a 45-minute break', () => {
      const result = evaluateDriverWorkRestRegime({
        continuousDrivingHours: 5.2,
        breakTakenMinutes: 15,
        dailyDrivingHours: 7.5,
        extendedDaysUsedThisWeek: 0,
        dailyRestHours: 11.0,
        weeklyDrivingHours: 40,
        biweeklyDrivingHours: 75,
        isDoubleCrewMultiManning: false,
      });

      expect(result.isCompliant).toBe(false);
      expect(result.exceedsContinuous4h30Limit).toBe(true);
      expect(result.fatigueLevel).toBe('needs_45min_break');
      expect(result.driverFineAzn).toBe(80);
      expect(result.discountedDriverFineAzn).toBe(40);
      expect(result.officialEntityFineAzn).toBe(300);
    });

    it('allows extended 10.0h daily driving up to twice a week', () => {
      const validExtended = evaluateDriverWorkRestRegime({
        continuousDrivingHours: 4.2,
        breakTakenMinutes: 45,
        dailyDrivingHours: 9.8,
        extendedDaysUsedThisWeek: 2,
        dailyRestHours: 11.0,
        weeklyDrivingHours: 48,
        biweeklyDrivingHours: 85,
        isDoubleCrewMultiManning: false,
      });

      expect(validExtended.isCompliant).toBe(true);
      expect(validExtended.fatigueLevel).toBe('within_extended_10h_daily');

      const invalidExtended = evaluateDriverWorkRestRegime({
        continuousDrivingHours: 4.2,
        breakTakenMinutes: 45,
        dailyDrivingHours: 9.8,
        extendedDaysUsedThisWeek: 3, // Exceeded 2-day weekly allowance
        dailyRestHours: 11.0,
        weeklyDrivingHours: 48,
        biweeklyDrivingHours: 85,
        isDoubleCrewMultiManning: false,
      });

      expect(invalidExtended.isCompliant).toBe(false);
      expect(invalidExtended.exceedsDailyDrivingLimit).toBe(true);
      expect(invalidExtended.driverFineAzn).toBe(100);
    });

    it('flags weekly >56h or biweekly >90h or daily rest <9h', () => {
      const result = evaluateDriverWorkRestRegime({
        continuousDrivingHours: 4.0,
        breakTakenMinutes: 45,
        dailyDrivingHours: 8.5,
        extendedDaysUsedThisWeek: 1,
        dailyRestHours: 7.5, // < 9h minimum rest
        weeklyDrivingHours: 60, // > 56h weekly max
        biweeklyDrivingHours: 94, // > 90h biweekly max
        isDoubleCrewMultiManning: false,
      });

      expect(result.isCompliant).toBe(false);
      expect(result.exceedsWeekly56hOr90hLimit).toBe(true);
      expect(result.insufficientDailyRest).toBe(true);
      expect(result.fatigueLevel).toBe('weekly_or_rest_deficit');
      expect(result.driverFineAzn).toBe(100);
      expect(result.officialEntityFineAzn).toBe(500);
    });
  });

  describe('evaluateTachographHardwareCompliance (YHQ Annex 1 Clause 7.4)', () => {
    it('exempts M1 private passenger cars from mandatory tachograph requirement', () => {
      const result = evaluateTachographHardwareCompliance({
        vehicleCategory: 'M1_private',
        conditionProfile: 'missing_or_shared_driver_card',
        monthsSinceLastCalibration: 36,
        tireSizeChangedSinceCalibration: true,
        speedLimiterSetKmh: 120,
      });

      expect(result.requiresTachographByLaw).toBe(false);
      expect(result.isCompliant).toBe(true);
      expect(result.driverFineAzn).toBe(0);
    });

    it('approves sealed Gen-2 digital tachograph within 24 months calibration and valid speed limiter', () => {
      const result = evaluateTachographHardwareCompliance({
        vehicleCategory: 'N3_heavy_tir',
        conditionProfile: 'digital_g2_sealed_valid',
        monthsSinceLastCalibration: 14,
        tireSizeChangedSinceCalibration: false,
        speedLimiterSetKmh: 89,
      });

      expect(result.requiresTachographByLaw).toBe(true);
      expect(result.isCompliant).toBe(true);
      expect(result.prohibitsDispatch).toBe(false);
      expect(result.driverFineAzn).toBe(0);
    });

    it('flags expired calibration (>24 months or tire size changed) and speed limiter >90 km/h on trucks', () => {
      const result = evaluateTachographHardwareCompliance({
        vehicleCategory: 'N3_heavy_tir',
        conditionProfile: 'digital_g2_sealed_valid',
        monthsSinceLastCalibration: 26,
        tireSizeChangedSinceCalibration: true,
        speedLimiterSetKmh: 98, // > 90 km/h for N3
      });

      expect(result.isCompliant).toBe(false);
      expect(result.calibrationExpired).toBe(true);
      expect(result.speedLimiterNonCompliant).toBe(true);
      expect(result.prohibitsDispatch).toBe(true);
      expect(result.driverFineAzn).toBe(80);
      expect(result.officialFineAzn).toBe(250);
    });

    it('flags magnetic impulse sensor tampering with 150 AZN driver and 400 AZN official fine', () => {
      const result = evaluateTachographHardwareCompliance({
        vehicleCategory: 'M3_coach',
        conditionProfile: 'magnetic_impulse_sensor_bypass',
        monthsSinceLastCalibration: 10,
        tireSizeChangedSinceCalibration: false,
        speedLimiterSetKmh: 100,
      });

      expect(result.isCompliant).toBe(false);
      expect(result.magneticTamperingDetected).toBe(true);
      expect(result.prohibitsDispatch).toBe(true);
      expect(result.driverFineAzn).toBe(150);
      expect(result.officialFineAzn).toBe(400);
      expect(result.legalEntityFineAzn).toBe(2000);
    });
  });

  describe('evaluatePassengerFreightManifest (YHQ Art. 56-57 & IXM 326/348)', () => {
    it('approves compliant seated capacity with E-Ugur waybill and medical stamp', () => {
      const result = evaluatePassengerFreightManifest({
        ruleProfile: 'compliant_manifest_and_route',
        seatedPassengerCapacity: 49,
        actualPassengersOnBoard: 45,
        isIntercityOrMountainRoute: true,
        hasElectronicUgurWaybill: true,
        hasPreTripMedicalAndMechanicStamp: true,
      });

      expect(result.isCompliant).toBe(true);
      expect(result.excessPassengerCount).toBe(0);
      expect(result.driverFineAzn).toBe(0);
    });

    it('flags standing intercity passengers and missing E-Ugur waybill or medical stamp', () => {
      const result = evaluatePassengerFreightManifest({
        ruleProfile: 'compliant_manifest_and_route',
        seatedPassengerCapacity: 18,
        actualPassengersOnBoard: 24, // +6 excess standing passengers
        isIntercityOrMountainRoute: true,
        hasElectronicUgurWaybill: false,
        hasPreTripMedicalAndMechanicStamp: false,
      });

      expect(result.isCompliant).toBe(false);
      expect(result.excessPassengerCount).toBe(6);
      expect(result.standingPassengersProhibited).toBe(true);
      expect(result.waybillOrMedicalMissing).toBe(true);
      expect(result.prohibitsOperationImmediately).toBe(true);
      expect(result.driverFineAzn).toBe(100);
      expect(result.officialFineAzn).toBe(400);
      expect(result.legalEntityFineAzn).toBe(1500);
    });
  });

  describe('calculateTachographServiceSummary & lookupTachographCertificate', () => {
    it('calculates total service package costs and prevented fines', () => {
      const summary = calculateTachographServiceSummary(
        ['ayna_driver_tachograph_card', 'azs_metrological_calibration_2yr'],
        'AZN'
      );

      expect(summary.stateDutyAndPartsAzn).toBe(115);
      expect(summary.laborCostAzn).toBe(50);
      expect(summary.totalAzn).toBe(165);
      expect(summary.totalDurationMinutes).toBe(75);
      expect(summary.finesAvoidedAzn).toBe(400);
    });

    it('looks up official AYNA-TAXO certificates by certificate ID, plate, or driver card', () => {
      const byCert = lookupTachographCertificate('AYNA-TAXO-2026-84920');
      expect(byCert).not.toBeNull();
      expect(byCert?.vehiclePlate).toBe('99-bus-404');

      const byDriverCard = lookupTachographCertificate('AZ-DRV-2026-194027');
      expect(byDriverCard).not.toBeNull();
      expect(byDriverCard?.certificateNumber).toBe('AYNA-TAXO-2026-31055');

      expect(lookupTachographCertificate('UNKNOWN-999')).toBeNull();
    });
  });
});

import { describe, it, expect } from 'vitest';
import {
  STATUTORY_BUS_LANE_FINE_AZN,
  STATUTORY_BUS_LANE_POINTS,
  auditBusLaneManeuver,
  convertTrafficRegimeCurrency,
  evaluateBakuEntryAndWimLoad,
  generateAynaElectronicEntryPass,
  inferBakuEntryVehicleType,
  isBusLaneActiveAtTime,
  validateCarrierVoenOrFin,
} from '../specialTrafficRegime';
import { Vehicle } from '../../types/vehicle';

describe('specialTrafficRegime utility engine', () => {
  describe('convertTrafficRegimeCurrency', () => {
    it('correctly converts AZN to USD and EUR with 2 decimal places', () => {
      expect(convertTrafficRegimeCurrency(100, 'AZN')).toBe(100);
      expect(convertTrafficRegimeCurrency(170, 'USD')).toBe(100);
      expect(convertTrafficRegimeCurrency(185, 'EUR')).toBe(100);
    });
  });

  describe('isBusLaneActiveAtTime', () => {
    it('evaluates 24/7 continuous regime as always active', () => {
      expect(isBusLaneActiveAtTime('24_7_continuous', 3, false)).toBe(true);
      expect(isBusLaneActiveAtTime('24_7_continuous', 15, true)).toBe(true);
    });

    it('evaluates peak_hours_07_20 regime accurately', () => {
      expect(isBusLaneActiveAtTime('peak_hours_07_20', 6, false)).toBe(false);
      expect(isBusLaneActiveAtTime('peak_hours_07_20', 7, false)).toBe(true);
      expect(isBusLaneActiveAtTime('peak_hours_07_20', 19, true)).toBe(true);
      expect(isBusLaneActiveAtTime('peak_hours_07_20', 20, false)).toBe(false);
    });

    it('evaluates weekdays_only_07_20 regime as inactive on weekends', () => {
      expect(isBusLaneActiveAtTime('weekdays_only_07_20', 12, false)).toBe(true);
      expect(isBusLaneActiveAtTime('weekdays_only_07_20', 12, true)).toBe(false);
    });

    it('evaluates morning_evening_split regime (07-10 & 17-20)', () => {
      expect(isBusLaneActiveAtTime('morning_evening_split', 8, false)).toBe(true);
      expect(isBusLaneActiveAtTime('morning_evening_split', 13, false)).toBe(false);
      expect(isBusLaneActiveAtTime('morning_evening_split', 18, false)).toBe(true);
    });
  });

  describe('auditBusLaneManeuver (İXM Maddə 327.1-1 & YHQ Maddə 48)', () => {
    it('exempts entry outside sign-posted operating hours (7.5.4 / 7.5.2)', () => {
      const res = auditBusLaneManeuver({
        corridorRegime: 'peak_hours_07_20',
        hourOfDay: 22,
        isWeekend: false,
        vehicleCategory: 'private_passenger',
        lineMarkingCrossed: 'broken_dashed_1_11',
        maneuverIntent: 'straight_through_traffic_bypass',
        applyEarly50Discount: true,
      });

      expect(res.isViolation).toBe(false);
      expect(res.verdictCode).toBe('EXEMPT_OUTSIDE_OPERATING_HOURS');
      expect(res.baseFineAzn).toBe(0);
      expect(res.penaltyPoints).toBe(0);
    });

    it('exempts authorized public transport, emergency vehicles, and bicycles 24/7', () => {
      const res = auditBusLaneManeuver({
        corridorRegime: '24_7_continuous',
        hourOfDay: 14,
        isWeekend: false,
        vehicleCategory: 'regular_route_bus',
        lineMarkingCrossed: 'solid_continuous_1_1',
        maneuverIntent: 'straight_through_traffic_bypass',
        applyEarly50Discount: false,
      });

      expect(res.isViolation).toBe(false);
      expect(res.verdictCode).toBe('EXEMPT_AUTHORIZED_VEHICLE');
      expect(res.payableFineAzn).toBe(0);
    });

    it('penalizes crossing solid 1.1 line with 100 AZN (50 AZN discounted) and 2 points', () => {
      const resDiscounted = auditBusLaneManeuver({
        corridorRegime: '24_7_continuous',
        hourOfDay: 12,
        isWeekend: false,
        vehicleCategory: 'private_passenger',
        lineMarkingCrossed: 'solid_continuous_1_1',
        maneuverIntent: 'right_turn_into_courtyard_or_street',
        applyEarly50Discount: true,
      });

      expect(resDiscounted.isViolation).toBe(true);
      expect(resDiscounted.verdictCode).toBe('VIOLATION_SOLID_LINE_CROSSING_IXM_327_1_1');
      expect(resDiscounted.baseFineAzn).toBe(STATUTORY_BUS_LANE_FINE_AZN);
      expect(resDiscounted.payableFineAzn).toBe(50);
      expect(resDiscounted.discountSavingsAzn).toBe(50);
      expect(resDiscounted.penaltyPoints).toBe(STATUTORY_BUS_LANE_POINTS);
    });

    it('exempts lawful right turn or passenger drop-off across 1.11 broken dashed line (YHQ 48.2)', () => {
      const res = auditBusLaneManeuver({
        corridorRegime: '24_7_continuous',
        hourOfDay: 15,
        isWeekend: false,
        vehicleCategory: 'private_passenger',
        lineMarkingCrossed: 'broken_dashed_1_11',
        maneuverIntent: 'right_turn_into_courtyard_or_street',
        applyEarly50Discount: true,
      });

      expect(res.isViolation).toBe(false);
      expect(res.verdictCode).toBe('EXEMPT_LAWFUL_DASHED_MANEUVER_YHQ_48');
      expect(res.payableFineAzn).toBe(0);
      expect(res.penaltyPoints).toBe(0);
    });

    it('penalizes straight-through traffic bypass on bus lane with 100 AZN and 2 points', () => {
      const resFull = auditBusLaneManeuver({
        corridorRegime: '24_7_continuous',
        hourOfDay: 16,
        isWeekend: false,
        vehicleCategory: 'private_passenger',
        lineMarkingCrossed: 'broken_dashed_1_11',
        maneuverIntent: 'straight_through_traffic_bypass',
        applyEarly50Discount: false,
      });

      expect(resFull.isViolation).toBe(true);
      expect(resFull.verdictCode).toBe('VIOLATION_STRAIGHT_BYPASS_IXM_327_1_1');
      expect(resFull.payableFineAzn).toBe(100);
      expect(resFull.penaltyPoints).toBe(2);
    });
  });

  describe('evaluateBakuEntryAndWimLoad (NK YHTK & İXM Maddə 353)', () => {
    it('allows passenger vehicles (<3.5t) 24/7 without pass when within weight limits', () => {
      const res = evaluateBakuEntryAndWimLoad({
        vehicleType: 'passenger_or_suv_under_3_5t',
        grossVehicleWeightTons: 2.1,
        maxSingleAxleLoadTons: 1.3,
        season: 'summer_may_to_oct',
        entryHour: 13,
        hasAynaElectronicEntryPass: false,
        entityType: 'individual_driver',
      });

      expect(res.isEntryAllowedNow).toBe(true);
      expect(res.requiresElectronicPassForDaytime).toBe(false);
      expect(res.totalRiskFineAzn).toBe(0);
    });

    it('restricts heavy trucks (>5t) during daytime hours without AYNA E-Buraxılış', () => {
      const res = evaluateBakuEntryAndWimLoad({
        vehicleType: 'heavy_truck_over_8t',
        grossVehicleWeightTons: 18,
        maxSingleAxleLoadTons: 8.5,
        season: 'summer_may_to_oct',
        entryHour: 14,
        hasAynaElectronicEntryPass: false,
        entityType: 'individual_driver',
      });

      expect(res.isDaytimeRestrictedWindow).toBe(true);
      expect(res.requiresElectronicPassForDaytime).toBe(true);
      expect(res.isEntryAllowedNow).toBe(false);
      expect(res.entryViolationFineAzn).toBe(100);
    });

    it('permits heavy trucks during daytime when holding an active AYNA Electronic Entry Pass', () => {
      const res = evaluateBakuEntryAndWimLoad({
        vehicleType: 'heavy_truck_over_8t',
        grossVehicleWeightTons: 18,
        maxSingleAxleLoadTons: 8.5,
        season: 'summer_may_to_oct',
        entryHour: 14,
        hasAynaElectronicEntryPass: true,
        entityType: 'corporate_entity',
      });

      expect(res.isEntryAllowedNow).toBe(true);
      expect(res.entryViolationFineAzn).toBe(0);
    });

    it('calculates İXM Maddə 353 WIM overweight fine when axle exceeds 10t or GVW exceeds 44t', () => {
      const resCorporate = evaluateBakuEntryAndWimLoad({
        vehicleType: 'heavy_truck_over_8t',
        grossVehicleWeightTons: 46,
        maxSingleAxleLoadTons: 12.5,
        season: 'winter_nov_to_apr',
        entryHour: 23,
        hasAynaElectronicEntryPass: true,
        entityType: 'corporate_entity',
      });

      expect(resCorporate.isAxleOrGvwOverweight).toBe(true);
      expect(resCorporate.overweightTons).toBe(2.5);
      expect(resCorporate.wimOverweightFineAzn).toBe(4000);
      expect(resCorporate.roadWearSurchargeAzn).toBe(212.5);
      expect(resCorporate.totalRiskFineAzn).toBe(4212.5);
    });
  });

  describe('inferBakuEntryVehicleType, validateCarrierVoenOrFin & generateAynaElectronicEntryPass', () => {
    it('infers vehicle entry category from marketplace vehicle', () => {
      expect(inferBakuEntryVehicleType(null)).toBe('passenger_or_suv_under_3_5t');
      expect(
        inferBakuEntryVehicleType({ fuelType: 'electric', bodyType: 'suv', engineVolumeLiters: 0 } as Vehicle)
      ).toBe('special_municipal_or_ev');
      expect(
        inferBakuEntryVehicleType({ fuelType: 'diesel', bodyType: 'minivan', engineVolumeLiters: 3.0 } as Vehicle)
      ).toBe('light_commercial_van_3_5_to_5t');
    });

    it('validates 10-digit VÖEN and 7-char FIN codes', () => {
      expect(validateCarrierVoenOrFin('1405928411')).toBe(true);
      expect(validateCarrierVoenOrFin('4AZ91K2')).toBe(true);
      expect(validateCarrierVoenOrFin('123')).toBe(false);
    });

    it('generates deterministic AYNA-EB-2026-XXXXX electronic pass', () => {
      const pass = generateAynaElectronicEntryPass({
        plateNumber: '90-JX-450',
        vin: 'WDB9634031L884120',
        vehicleTitle: 'Mercedes Actros',
        carrierName: 'Test Logistics MMC',
        voenOrFin: '1405928411',
        cargoCategory: 'Ərzaq təchizatı',
        grossWeightTons: 14.2,
        entryCheckpointName: 'Şimal Girişi',
        authorizedCorridor: 'Ziya Bünyadov pr.',
        validTimeWindow: '10:00 - 16:00',
      });

      expect(pass.passNumber).toMatch(/^AYNA-EB-2026-\d{5}$/);
      expect(pass.plateNumber).toBe('90-JX-450');
      expect(pass.status).toBe('ACTIVE_VERIFIED');
      expect(pass.qrSecurityHash).toContain('AZ-AYNA-EB-');
    });
  });
});

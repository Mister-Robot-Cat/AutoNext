import { describe, expect, it } from 'vitest';
import {
  auditCargoAndTowingRules,
  auditChildAndPassengerCompliance,
  auditEmergencySafetyKit,
  calculateSafetySupplyBundle,
  formatSafetyCurrency,
  generatePassengerSafetyCertificate,
  getVehicleDefaultSafetyProfile,
} from '../passengerSafety';
import {
  SAFETY_SUPPLY_CENTERS,
  findSafetyCertificateByCode,
} from '../../data/mockPassengerSafetyData';
import { Vehicle } from '../../types/vehicle';

describe('passengerSafety utilities (YHQ Article 37 / Annex 1 Section VII & İXM 342.1.7 / 327.2 / 329.1)', () => {
  describe('formatSafetyCurrency', () => {
    it('formats AZN, USD, and EUR accurately', () => {
      expect(formatSafetyCurrency(100, 'AZN')).toBe('100 ₼');
      expect(formatSafetyCurrency(170, 'USD')).toBe('$100');
      expect(formatSafetyCurrency(185, 'EUR')).toBe('€100');
    });
  });

  describe('auditEmergencySafetyKit', () => {
    it('returns COMPLIANT with 0 AZN fine when M1 passenger car has valid OP-2 extinguisher, complete first aid kit, and ECE R27 triangle placed at >=15m in city', () => {
      const result = auditEmergencySafetyKit({
        vehicleClass: 'M1_PASSENGER',
        extinguisherType: 'OP2_POWDER_2KG',
        extinguisherCount: 1,
        extinguisherGauge: 'GREEN_NOMINAL',
        hasFirstAidKit: true,
        isFirstAidKitUnexpiredAndComplete: true,
        hasWarningTriangleEceR27: true,
        warningTrianglePlacedDistanceMeters: 15,
        roadZone: 'POPULATED_CITY',
        hasReflectiveSafetyVest: true,
        hasWheelChocks: false,
      });

      expect(result.isFullyCompliant).toBe(true);
      expect(result.fineAmountAzn).toBe(0);
      expect(result.verdictLevel).toBe('COMPLIANT');
      expect(result.violationArticles).toHaveLength(0);
    });

    it('rejects 400ml aerosol spray or missing extinguisher with 50 AZN fine under İXM Article 342.1.7', () => {
      const result = auditEmergencySafetyKit({
        vehicleClass: 'M1_PASSENGER',
        extinguisherType: 'AEROSOL_SPRAY_400ML',
        extinguisherCount: 1,
        extinguisherGauge: 'GREEN_NOMINAL',
        hasFirstAidKit: true,
        isFirstAidKitUnexpiredAndComplete: true,
        hasWarningTriangleEceR27: true,
        warningTrianglePlacedDistanceMeters: 20,
        roadZone: 'POPULATED_CITY',
        hasReflectiveSafetyVest: true,
        hasWheelChocks: false,
      });

      expect(result.isExtinguisherCompliant).toBe(false);
      expect(result.isFullyCompliant).toBe(false);
      expect(result.fineAmountAzn).toBe(50);
      expect(result.violationArticles.some((v) => v.includes('342.1.7'))).toBe(true);
    });

    it('requires 2 extinguishers (>=5 kg) and wheel chocks for M3 Bus or N2/N3 Heavy Truck', () => {
      const resultFail = auditEmergencySafetyKit({
        vehicleClass: 'M3_BUS',
        extinguisherType: 'OP2_POWDER_2KG',
        extinguisherCount: 1,
        extinguisherGauge: 'GREEN_NOMINAL',
        hasFirstAidKit: true,
        isFirstAidKitUnexpiredAndComplete: true,
        hasWarningTriangleEceR27: true,
        warningTrianglePlacedDistanceMeters: 35,
        roadZone: 'HIGHWAY_OUTSIDE',
        hasReflectiveSafetyVest: true,
        hasWheelChocks: false,
      });

      expect(resultFail.requiredExtinguisherCount).toBe(2);
      expect(resultFail.requiredMinExtinguisherKg).toBe(5);
      expect(resultFail.isExtinguisherCompliant).toBe(false);
      expect(resultFail.isWheelChockCompliant).toBe(false);
      expect(resultFail.fineAmountAzn).toBe(50);

      const resultPass = auditEmergencySafetyKit({
        vehicleClass: 'M3_BUS',
        extinguisherType: 'OP5_HEAVY_5KG',
        extinguisherCount: 2,
        extinguisherGauge: 'GREEN_NOMINAL',
        hasFirstAidKit: true,
        isFirstAidKitUnexpiredAndComplete: true,
        hasWarningTriangleEceR27: true,
        warningTrianglePlacedDistanceMeters: 35,
        roadZone: 'HIGHWAY_OUTSIDE',
        hasReflectiveSafetyVest: true,
        hasWheelChocks: true,
      });

      expect(resultPass.isFullyCompliant).toBe(true);
      expect(resultPass.fineAmountAzn).toBe(0);
    });

    it('enforces minimum 30m warning triangle placement outside populated areas (HIGHWAY_OUTSIDE) under YHQ Article 43', () => {
      const result = auditEmergencySafetyKit({
        vehicleClass: 'M1_PASSENGER',
        extinguisherType: 'OP2_POWDER_2KG',
        extinguisherCount: 1,
        extinguisherGauge: 'GREEN_NOMINAL',
        hasFirstAidKit: true,
        isFirstAidKitUnexpiredAndComplete: true,
        hasWarningTriangleEceR27: true,
        warningTrianglePlacedDistanceMeters: 20, // < 30m on highway
        roadZone: 'HIGHWAY_OUTSIDE',
        hasReflectiveSafetyVest: true,
        hasWheelChocks: false,
      });

      expect(result.requiredTriangleDistanceMeters).toBe(30);
      expect(result.isTriangleDistanceCompliant).toBe(false);
      expect(result.fineAmountAzn).toBe(40);
      expect(result.violationArticles.some((v) => v.includes('Maddə 43'))).toBe(true);
    });
  });

  describe('auditChildAndPassengerCompliance', () => {
    it('recommends Group 0+ for infant and flags critical airbag hazard if rear-facing in front seat with active airbag', () => {
      const result = auditChildAndPassengerCompliance({
        hasChildPassenger: true,
        childAgeYears: 0,
        childWeightKg: 8,
        childHeightCm: 68,
        seatingPosition: 'FRONT_PASSENGER',
        hasCertifiedChildSeatCrs: true,
        isRearFacingSeat: true,
        isFrontPassengerAirbagActive: true,
        vehicleHasIsofixAnchors: true,
        registeredSeatCapacity: 5,
        actualPassengersCount: 3,
        allAdultsFastenedSeatbelts: true,
      });

      expect(result.recommendedCrsGroup).toBe('GROUP_0_PLUS');
      expect(result.isAirbagCriticalHazard).toBe(true);
      expect(result.isFullyCompliant).toBe(false);
      expect(result.totalFineAzn).toBe(60);
      expect(result.penaltyPoints).toBe(3);
    });

    it('penalizes carrying a child under 12 in the front passenger seat without a certified CRS with 60 AZN + 3 points (İXM 327.2)', () => {
      const result = auditChildAndPassengerCompliance({
        hasChildPassenger: true,
        childAgeYears: 8,
        childWeightKg: 26,
        childHeightCm: 128,
        seatingPosition: 'FRONT_PASSENGER',
        hasCertifiedChildSeatCrs: false,
        isRearFacingSeat: false,
        isFrontPassengerAirbagActive: true,
        vehicleHasIsofixAnchors: true,
        registeredSeatCapacity: 5,
        actualPassengersCount: 2,
        allAdultsFastenedSeatbelts: true,
      });

      expect(result.recommendedCrsGroup).toBe('GROUP_2_3');
      expect(result.isFrontSeatChildLegal).toBe(false);
      expect(result.totalFineAzn).toBe(60);
      expect(result.penaltyPoints).toBe(3);
      expect(result.violationArticles.some((v) => v.includes('327.2'))).toBe(true);
    });

    it('penalizes passenger capacity overload (60 AZN + 3 points) and unfastened seatbelt (40 AZN under İXM 329.1)', () => {
      const result = auditChildAndPassengerCompliance({
        hasChildPassenger: false,
        childAgeYears: 14,
        childWeightKg: 50,
        childHeightCm: 160,
        seatingPosition: 'REAR_ISOFIX_OUTER',
        hasCertifiedChildSeatCrs: false,
        isRearFacingSeat: false,
        isFrontPassengerAirbagActive: true,
        vehicleHasIsofixAnchors: true,
        registeredSeatCapacity: 5,
        actualPassengersCount: 7, // Overload!
        allAdultsFastenedSeatbelts: false, // Unfastened seatbelt!
      });

      expect(result.isPassengerCountLegal).toBe(false);
      expect(result.isSeatbeltCompliant).toBe(false);
      expect(result.totalFineAzn).toBe(100); // 60 + 40
      expect(result.penaltyPoints).toBe(3);
    });
  });

  describe('auditCargoAndTowingRules', () => {
    it('flags cargo protruding >1.0m without flag and >2.0m requiring BDYP special permit under YHQ Article 57', () => {
      const noFlag = auditCargoAndTowingRules({
        rearCargoOverhangMeters: 1.4,
        lateralCargoOverhangMeters: 0.1,
        hasOversizeWarningFlag: false,
        isTowingAnotherVehicle: false,
        towCableLengthMeters: 5.0,
        hasTowCableWarningFlags: true,
        towedVehicleHasWorkingBrakesAndSteering: true,
        isIcyRoadConditions: false,
      });

      expect(noFlag.requiresOversizeFlag).toBe(true);
      expect(noFlag.isCargoOverhangLegal).toBe(false);
      expect(noFlag.fineAmountAzn).toBe(60);

      const over2m = auditCargoAndTowingRules({
        rearCargoOverhangMeters: 2.4,
        lateralCargoOverhangMeters: 0.1,
        hasOversizeWarningFlag: true,
        isTowingAnotherVehicle: false,
        towCableLengthMeters: 5.0,
        hasTowCableWarningFlags: true,
        towedVehicleHasWorkingBrakesAndSteering: true,
        isIcyRoadConditions: false,
      });

      expect(over2m.requiresBdypSpecialPermit).toBe(true);
      expect(over2m.isCargoOverhangLegal).toBe(false);
    });

    it('enforces 4.0m–6.0m tow cable length and prohibits flexible towing in icy conditions under YHQ Article 56', () => {
      const badCableAndIce = auditCargoAndTowingRules({
        rearCargoOverhangMeters: 0.2,
        lateralCargoOverhangMeters: 0.0,
        hasOversizeWarningFlag: true,
        isTowingAnotherVehicle: true,
        towCableLengthMeters: 3.0, // Too short (<4.0m)
        hasTowCableWarningFlags: false,
        towedVehicleHasWorkingBrakesAndSteering: true,
        isIcyRoadConditions: true,
      });

      expect(badCableAndIce.isTowCableLengthLegal).toBe(false);
      expect(badCableAndIce.isTowingOperationLegal).toBe(false);
      expect(badCableAndIce.fineAmountAzn).toBe(60);
    });
  });

  describe('calculateSafetySupplyBundle & certificates', () => {
    it('calculates safety supply bundle total and prevented fines accurately', () => {
      const center = SAFETY_SUPPLY_CENTERS[0];
      const estimate = calculateSafetySupplyBundle({
        center,
        includeOp2Extinguisher: true,
        includeOu2Co2Extinguisher: false,
        includeExtinguisherRecharge: false,
        includeFirstAidKit: true,
        includeWarningTriangle: true,
        includeVestAndTowRope: true,
        includeIsofixChildSeat: true,
      });

      expect(estimate.totalCostAzn).toBe(
        center.op2ExtinguisherPriceAzn +
          center.ministryFirstAidKitPriceAzn +
          center.eceWarningTrianglePriceAzn +
          center.reflectiveVestAndTowRopePriceAzn +
          center.isofixChildSeatPriceAzn
      );
      expect(estimate.finesPreventedAzn).toBe(150); // 50 + 40 + 60
      expect(estimate.passesDypInspection).toBe(true);
    });

    it('derives default safety profile for EV/Hybrid and 7-seater SUV', () => {
      const evCar = {
        fuelType: 'electric',
        bodyType: 'suv',
        model: 'Land Cruiser 250',
        year: 2025,
      } as unknown as Vehicle;

      const profile = getVehicleDefaultSafetyProfile(evCar);
      expect(profile.extinguisherType).toBe('OU2_CO2_2KG');
      expect(profile.registeredSeatCapacity).toBe(7);
      expect(profile.vehicleHasIsofixAnchors).toBe(true);
    });

    it('generates and finds BDYP-TEH safety certificates', () => {
      const cert = generatePassengerSafetyCertificate({
        plateNumber: '90-XX-900',
        vin: 'WBA12345678954321',
        vehicleTitle: '2024 BMW X5',
        vehicleClass: 'M1_PASSENGER',
        extinguisherSpec: '1x OP-2 (2 kq)',
        firstAidStatus: 'Tam Komplekt',
        crsIsofixStatus: 'İSOFIX Qrup 1',
        inspectionCenterName: SAFETY_SUPPLY_CENTERS[0].name,
        isFullyCompliant: true,
      });

      expect(cert.certificateNumber).toBe('BDYP-TEH-2026-54321');
      const found = findSafetyCertificateByCode('90-XX-900', [cert]);
      expect(found?.certificateNumber).toBe('BDYP-TEH-2026-54321');
    });
  });
});

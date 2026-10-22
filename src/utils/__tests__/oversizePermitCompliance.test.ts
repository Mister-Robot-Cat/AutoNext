import { describe, it, expect } from 'vitest';
import {
  auditOversizeCompliance,
  calculateRoadWearCompensation,
  convertCurrency,
  generateOversizePermitVoucher,
  STATUTORY_OVERSIZE_LIMITS,
  DimensionAuditInput,
} from '../oversizePermitCompliance';

describe('oversizePermitCompliance Utility Engine', () => {
  const standardCompliantInput: DimensionAuditInput = {
    widthMeters: 2.50,
    heightMeters: 3.90,
    lengthMeters: 16.50,
    rearOverhangMeters: 0.50,
    grossWeightTonnes: 38.00,
    axleCount: 5,
    maxSingleAxleWeightTonnes: 8.50,
    transitDistanceKm: 150,
    isContainerIntermodal: false,
  };

  describe('Standard Vehicle Compliance', () => {
    it('returns compliant status when all parameters are within NK 104 statutory limits', () => {
      const result = auditOversizeCompliance(standardCompliantInput);
      expect(result.isCompliant).toBe(true);
      expect(result.needsSpecialPermit).toBe(false);
      expect(result.escortRequirement).toBe('none');
      expect(result.timeRestriction).toBe('unrestricted_24h');
      expect(result.fees.stateDutyAzn).toBe(0);
      expect(result.fees.roadWearCompensationAzn).toBe(0);
      expect(result.fees.totalFeeAzn).toBe(0);
      expect(result.finesIfUnauthorized.driverFineAzn).toBe(0);
    });

    it('allows 44.0t for intermodal ISO containers without gross weight excess', () => {
      const containerInput: DimensionAuditInput = {
        ...standardCompliantInput,
        grossWeightTonnes: 43.50,
        isContainerIntermodal: true,
      };
      const result = auditOversizeCompliance(containerInput);
      expect(result.dimensionAudit.grossWeight.isExceeded).toBe(false);
      expect(result.isCompliant).toBe(true);
    });

    it('flags 43.5t as exceeded when not an intermodal container', () => {
      const normalInput: DimensionAuditInput = {
        ...standardCompliantInput,
        grossWeightTonnes: 43.50,
        isContainerIntermodal: false,
      };
      const result = auditOversizeCompliance(normalInput);
      expect(result.dimensionAudit.grossWeight.isExceeded).toBe(true);
      expect(result.dimensionAudit.grossWeight.excess).toBe(3.5);
      expect(result.needsSpecialPermit).toBe(true);
    });
  });

  describe('Dimension & Weight Excess Detection', () => {
    it('detects overwidth and applies 50 AZN base state duty', () => {
      const overwidthInput: DimensionAuditInput = {
        ...standardCompliantInput,
        widthMeters: 2.90, // Exceeds 2.55m by 0.35m
      };
      const result = auditOversizeCompliance(overwidthInput);
      expect(result.isCompliant).toBe(false);
      expect(result.needsSpecialPermit).toBe(true);
      expect(result.dimensionAudit.width.isExceeded).toBe(true);
      expect(result.dimensionAudit.width.excess).toBe(0.35);
      expect(result.fees.stateDutyAzn).toBe(STATUTORY_OVERSIZE_LIMITS.BASE_STATE_DUTY_AZN);
    });

    it('detects overheight and evaluates route clearance', () => {
      const overheightInput: DimensionAuditInput = {
        ...standardCompliantInput,
        heightMeters: 4.55,
      };
      const result = auditOversizeCompliance(overheightInput);
      expect(result.dimensionAudit.height.isExceeded).toBe(true);
      expect(result.requiresRouteEngineeringClearance).toBe(true);
    });

    it('triggers rear pilot car for rear overhang exceeding 2.0 meters', () => {
      const overhangInput: DimensionAuditInput = {
        ...standardCompliantInput,
        rearOverhangMeters: 2.60,
      };
      const result = auditOversizeCompliance(overhangInput);
      expect(result.dimensionAudit.rearOverhang.isExceeded).toBe(true);
      expect(result.escortRequirement).toBe('pilot_single_rear');
      expect(result.fees.pilotEscortFeeAzn).toBeGreaterThan(0);
    });
  });

  describe('Escort and Police Escort Tier Logic', () => {
    it('requires single pilot car for mild overwidth between 3.0m and 3.5m', () => {
      const input: DimensionAuditInput = {
        ...standardCompliantInput,
        widthMeters: 3.20,
      };
      const result = auditOversizeCompliance(input);
      expect(result.escortRequirement).toBe('pilot_single_rear');
    });

    it('requires double pilot cars (front & rear) for width between 3.5m and 4.0m', () => {
      const input: DimensionAuditInput = {
        ...standardCompliantInput,
        widthMeters: 3.75,
      };
      const result = auditOversizeCompliance(input);
      expect(result.escortRequirement).toBe('pilot_double');
      expect(result.fees.pilotEscortFeeAzn).toBeGreaterThan(STATUTORY_OVERSIZE_LIMITS.PILOT_ESCORT_BASE_AZN);
    });

    it('requires BDYP police patrol car escort for extreme width > 4.0m', () => {
      const input: DimensionAuditInput = {
        ...standardCompliantInput,
        widthMeters: 4.20,
      };
      const result = auditOversizeCompliance(input);
      expect(result.escortRequirement).toBe('bdyp_police_escort');
      expect(result.fees.policeEscortFeeAzn).toBe(STATUTORY_OVERSIZE_LIMITS.POLICE_ESCORT_FLAT_AZN);
    });

    it('requires BDYP police patrol car escort for extreme length > 30.0m (e.g. wind turbine blades)', () => {
      const input: DimensionAuditInput = {
        ...standardCompliantInput,
        lengthMeters: 55.0,
      };
      const result = auditOversizeCompliance(input);
      expect(result.escortRequirement).toBe('bdyp_police_escort');
    });

    it('requires BDYP police patrol car escort for extreme gross weight > 60.0 tonnes', () => {
      const input: DimensionAuditInput = {
        ...standardCompliantInput,
        grossWeightTonnes: 75.0,
        maxSingleAxleWeightTonnes: 12.0,
      };
      const result = auditOversizeCompliance(input);
      expect(result.escortRequirement).toBe('bdyp_police_escort');
    });
  });

  describe('Road Wear Compensation & Administrative Fines', () => {
    it('calculates road wear damage compensation based on ton-km formula', () => {
      // 50t total (10t excess over 40t) over 100 km
      const fee = calculateRoadWearCompensation(50, 10, 100);
      // (10 * 0.08 + 0 * 0.12) * 100 = 80 AZN
      expect(fee).toBe(80);
    });

    it('incorporates single axle excess into damage calculation', () => {
      // 40t total (no gross excess), but 12t on single axle (2t excess) over 200 km
      const fee = calculateRoadWearCompensation(40, 12, 200);
      // (0 + 2 * 0.12) * 200 = 48 AZN
      expect(fee).toBe(48);
    });

    it('returns 0 when neither gross weight nor single axle weight is exceeded', () => {
      const fee = calculateRoadWearCompensation(38, 9, 200);
      expect(fee).toBe(0);
    });

    it('applies lower tier İXM 353.1 fine when excess is <= 20%', () => {
      const input: DimensionAuditInput = {
        ...standardCompliantInput,
        widthMeters: 2.80, // ~9.8% excess
      };
      const result = auditOversizeCompliance(input);
      expect(result.finesIfUnauthorized.driverFineAzn).toBe(600);
      expect(result.finesIfUnauthorized.officialFineAzn).toBe(1400);
      expect(result.finesIfUnauthorized.legalEntityFineAzn).toBe(4000);
      expect(result.finesIfUnauthorized.vehicleImpoundRisk).toBe(true);
    });

    it('applies higher tier İXM 353.2 fine when excess exceeds 20%', () => {
      const input: DimensionAuditInput = {
        ...standardCompliantInput,
        widthMeters: 3.40, // >30% excess
      };
      const result = auditOversizeCompliance(input);
      expect(result.finesIfUnauthorized.driverFineAzn).toBe(800);
      expect(result.finesIfUnauthorized.officialFineAzn).toBe(2000);
      expect(result.finesIfUnauthorized.legalEntityFineAzn).toBe(7000);
    });
  });

  describe('Currency Conversion & Voucher Generation', () => {
    it('correctly converts AZN amounts to USD and EUR', () => {
      const aznAmount = 170;
      expect(convertCurrency(aznAmount, 'AZN')).toBe(170);
      expect(convertCurrency(aznAmount, 'USD')).toBe(100);
      expect(convertCurrency(185, 'EUR')).toBe(100);
    });

    it('generates a valid electronic permit voucher with serial number and SHA256 security hash', () => {
      const audit = auditOversizeCompliance({
        ...standardCompliantInput,
        widthMeters: 3.2,
      });

      const voucher = generateOversizePermitVoucher({
        carrierVoen: '1234567890',
        carrierNameAz: '"Ağır-Yük Qrup" MMC',
        vehiclePlate: '99-TT-104',
        trailerPlate: '99-ZA-505',
        cargoCategory: 'construction_machinery',
        cargoDescriptionAz: 'Komatsu Ekskavator',
        routeCorridor: 'M-1 Bakı – Quba – Samur',
        transitDistanceKm: 180,
        auditResult: audit,
      });

      expect(voucher.permitNumber).toMatch(/^AAYDA-OVS-2026-\d{5}$/);
      expect(voucher.securityHash).toMatch(/^SHA256:[0-9A-F]{8}$/);
      expect(voucher.carrierVoen).toBe('1234567890');
      expect(voucher.vehiclePlate).toBe('99-TT-104');
      expect(voucher.status).toBe('active');
      expect(voucher.totalFeeAzn).toBe(audit.fees.totalFeeAzn);
    });
  });
});

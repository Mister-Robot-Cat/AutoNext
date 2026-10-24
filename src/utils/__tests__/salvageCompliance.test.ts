import { describe, it, expect } from 'vitest';
import {
  calculateTotalLossPayout,
  evaluateChassisDatumPoints,
  evaluateUltrasoundWelds,
  evaluateOverallRoadworthiness,
  calculateImportLandedCost,
  generateSalvageCertificate,
  lookupSalvageRecord
} from '../salvageCompliance';
import {
  INITIAL_CHASSIS_POINTS,
  INITIAL_WELD_JOINTS,
  ChassisDatumPoint,
  UltrasoundWeldJoint,
  SALVAGE_VEHICLE_PRESETS
} from '../../data/mockSalvageData';

describe('salvageCompliance Utility Engine', () => {
  describe('calculateTotalLossPayout', () => {
    it('declares Total Loss when repair cost is >= 70% of pre-accident value with owner retaining wreck', () => {
      const result = calculateTotalLossPayout({
        preAccidentValueAzn: 40000,
        estimatedRepairCostAzn: 30000, // 75% -> Total Loss
        salvageScrapValueAzn: 10000,
        deductibleAzn: 500,
        ownerRetainsWreck: true,
        currency: 'AZN'
      });

      expect(result.isTotalLoss).toBe(true);
      expect(result.damageRatioPct).toBe(75.0);
      expect(result.thresholdDifferencePct).toBe(5.0);
      // Payout = 40,000 - 500 - 10,000 = 29,500
      expect(result.insurerPayoutAzn).toBe(29500);
      // Owner Net = 29,500 + 10,000 = 39,500
      expect(result.ownerTotalNetAzn).toBe(39500);
      expect(result.legalConclusionAz).toContain('Konstruktiv Məhv');
      expect(result.legalConclusionAz).toContain('qalıq dəyər');
    });

    it('declares Total Loss when repair cost is >= 70% with insurer taking the wreck', () => {
      const result = calculateTotalLossPayout({
        preAccidentValueAzn: 50000,
        estimatedRepairCostAzn: 40000, // 80%
        salvageScrapValueAzn: 12000,
        deductibleAzn: 1000,
        ownerRetainsWreck: false,
        currency: 'AZN'
      });

      expect(result.isTotalLoss).toBe(true);
      // Payout = 50,000 - 1,000 = 49,000
      expect(result.insurerPayoutAzn).toBe(49000);
      expect(result.ownerTotalNetAzn).toBe(49000);
      expect(result.legalConclusionAz).toContain('Qalıq hissələr sığortaçıya təhvil verilir');
    });

    it('classifies as repairable when damage is under statutory 70% threshold', () => {
      const result = calculateTotalLossPayout({
        preAccidentValueAzn: 30000,
        estimatedRepairCostAzn: 15000, // 50%
        salvageScrapValueAzn: 5000,
        deductibleAzn: 300,
        ownerRetainsWreck: false,
        currency: 'AZN'
      });

      expect(result.isTotalLoss).toBe(false);
      expect(result.damageRatioPct).toBe(50.0);
      // Payout = 15,000 - 300 = 14,700
      expect(result.insurerPayoutAzn).toBe(14700);
      expect(result.ownerTotalNetAzn).toBe(14700);
      expect(result.legalConclusionAz).toContain('konstruktiv bərpa oluna biləndir');
    });

    it('correctly converts values for USD and EUR currencies', () => {
      const resultUsd = calculateTotalLossPayout({
        preAccidentValueAzn: 34000,
        estimatedRepairCostAzn: 25500, // 75%
        salvageScrapValueAzn: 8500,
        deductibleAzn: 500,
        ownerRetainsWreck: false,
        currency: 'USD'
      });

      expect(resultUsd.formattedInsurerPayout).toContain('$');
      expect(resultUsd.convertedInsurerPayout).toBeGreaterThan(0);
    });
  });

  describe('evaluateChassisDatumPoints', () => {
    it('passes when all reference points are within factory tolerance (<= 2.0 mm)', () => {
      const result = evaluateChassisDatumPoints(INITIAL_CHASSIS_POINTS);

      expect(result.isChassisCompliant).toBe(true);
      expect(result.failedCount).toBe(0);
      expect(result.failingPointIds.length).toBe(0);
      expect(result.maxDeviationMm).toBeLessThanOrEqual(2.0);
    });

    it('fails when any reference point exceeds 2.0 mm tolerance', () => {
      const modifiedPoints: ChassisDatumPoint[] = INITIAL_CHASSIS_POINTS.map((pt) =>
        pt.id === 'FL_RAIL' ? { ...pt, measuredDeviationMm: 4.5 } : pt
      );

      const result = evaluateChassisDatumPoints(modifiedPoints);

      expect(result.isChassisCompliant).toBe(false);
      expect(result.failedCount).toBe(1);
      expect(result.failingPointIds).toContain('FL_RAIL');
      expect(result.maxDeviationMm).toBe(4.5);
    });
  });

  describe('evaluateUltrasoundWelds', () => {
    it('passes when all weld joints meet minimum penetration and have zero porosity', () => {
      const result = evaluateUltrasoundWelds(INITIAL_WELD_JOINTS);

      expect(result.allWeldsCompliant).toBe(true);
      expect(result.criticalWeldsCompliant).toBe(true);
      expect(result.failedCount).toBe(0);
      expect(result.defectiveJointIds.length).toBe(0);
    });

    it('flags welds failing penetration depth or containing porosity', () => {
      const defectWelds: UltrasoundWeldJoint[] = [
        ...INITIAL_WELD_JOINTS,
        {
          id: 'W_DEFECT',
          jointLocationAz: 'Qüsur Sütunu',
          jointLocationEn: 'Defect Node',
          penetrationDepthPct: 70, // Required 85%
          porosityDetected: true,
          minPenetrationRequiredPct: 85,
          structuralCritical: true
        }
      ];

      const result = evaluateUltrasoundWelds(defectWelds);

      expect(result.allWeldsCompliant).toBe(false);
      expect(result.criticalWeldsCompliant).toBe(false);
      expect(result.defectiveJointIds).toContain('W_DEFECT');
    });
  });

  describe('evaluateOverallRoadworthiness', () => {
    it('prohibits road circulation for structural total loss (Category A rollover)', () => {
      const verdict = evaluateOverallRoadworthiness({
        categoryKey: 'STRUCTURAL_TOTAL_LOSS',
        isTotalLoss: true,
        isChassisCompliant: true,
        allWeldsCompliant: true,
        airbagStatus: 'DEPLOYED_REPLACED_OEM'
      });

      expect(verdict.isRoadPermitted).toBe(false);
      expect(verdict.statusCode).toBe('PROHIBITED');
      expect(verdict.titleAz).toContain('Kateqoriya A');
      expect(verdict.actionRequiredAz).toContain('Utilizasiya Proqramına');
    });

    it('prohibits road circulation for flood submersion (Category D)', () => {
      const verdict = evaluateOverallRoadworthiness({
        categoryKey: 'FLOOD_SUBMERSION',
        isTotalLoss: true,
        isChassisCompliant: true,
        allWeldsCompliant: true,
        airbagStatus: 'ALL_INTACT'
      });

      expect(verdict.isRoadPermitted).toBe(false);
      expect(verdict.statusCode).toBe('PROHIBITED');
      expect(verdict.titleAz).toContain('Su Batması');
    });

    it('prohibits road circulation if dummy resistor (obmanka) is detected in airbag circuit', () => {
      const verdict = evaluateOverallRoadworthiness({
        categoryKey: 'HEAVY_COLLISION_REPAIRABLE',
        isTotalLoss: false,
        isChassisCompliant: true,
        allWeldsCompliant: true,
        airbagStatus: 'DEPLOYED_DUMMY_RESISTOR_DETECTED'
      });

      expect(verdict.isRoadPermitted).toBe(false);
      expect(verdict.statusCode).toBe('PROHIBITED');
      expect(verdict.titleAz).toContain('Obmanka');
    });

    it('prohibits road circulation if chassis geometry is misaligned', () => {
      const verdict = evaluateOverallRoadworthiness({
        categoryKey: 'HEAVY_COLLISION_REPAIRABLE',
        isTotalLoss: false,
        isChassisCompliant: false,
        allWeldsCompliant: true,
        airbagStatus: 'DEPLOYED_REPLACED_OEM'
      });

      expect(verdict.isRoadPermitted).toBe(false);
      expect(verdict.statusCode).toBe('PROHIBITED');
      expect(verdict.titleAz).toContain('3D Şassi Həndəsəsi');
    });

    it('issues conditional pass if weld joints contain flaws', () => {
      const verdict = evaluateOverallRoadworthiness({
        categoryKey: 'HEAVY_COLLISION_REPAIRABLE',
        isTotalLoss: false,
        isChassisCompliant: true,
        allWeldsCompliant: false,
        airbagStatus: 'DEPLOYED_REPLACED_OEM'
      });

      expect(verdict.isRoadPermitted).toBe(false);
      expect(verdict.statusCode).toBe('CONDITIONAL_PASS');
      expect(verdict.titleAz).toContain('Ultrasəs Qaynaq Tikişlərində Qüsur');
    });

    it('grants full approval when chassis, welds, and airbags meet OEM standards', () => {
      const verdict = evaluateOverallRoadworthiness({
        categoryKey: 'HEAVY_COLLISION_REPAIRABLE',
        isTotalLoss: false,
        isChassisCompliant: true,
        allWeldsCompliant: true,
        airbagStatus: 'DEPLOYED_REPLACED_OEM'
      });

      expect(verdict.isRoadPermitted).toBe(true);
      expect(verdict.statusCode).toBe('APPROVED');
      expect(verdict.titleAz).toContain('Yol Hərəkətinə Tam Yararlıdır');
    });
  });

  describe('calculateImportLandedCost', () => {
    it('calculates total investment and profit correctly', () => {
      const result = calculateImportLandedCost({
        hammerPriceUsd: 5000,
        shippingAndCustomsAzn: 8000,
        estimatedRepairCostAzn: 10000,
        preAccidentValueAzn: 35000,
        currency: 'AZN'
      });

      // Hammer price = 5000 * 1.70 = 8500 AZN
      expect(result.hammerPriceAzn).toBe(8500);
      // Total = 8500 + 8000 + 10000 = 26500 AZN
      expect(result.totalInvestmentAzn).toBe(26500);
      // Net Profit = 35000 - 26500 = 8500 AZN
      expect(result.estimatedNetProfitAzn).toBe(8500);
      expect(result.roiPercentage).toBeGreaterThan(0);
      expect(result.formattedTotalInvestment).toContain('26');
    });
  });

  describe('generateSalvageCertificate and lookupSalvageRecord', () => {
    it('generates an official ISB-TOT certificate with valid attributes', () => {
      const cert = generateSalvageCertificate({
        vin: '5NPD74LF7MH198421',
        lotNumber: '68492014',
        plateNumber: '77-XD-219',
        makeModel: 'Hyundai Elantra 2021',
        year: 2021,
        categoryKey: 'HEAVY_COLLISION_REPAIRABLE',
        damageRatioPct: 75.0,
        preAccidentValueAzn: 32000,
        repairCostAzn: 24000,
        salvageScrapValueAzn: 9000,
        chassisMaxDeviationMm: 1.1,
        ultrasoundWeldPass: true,
        airbagStatus: 'DEPLOYED_REPLACED_OEM',
        inspectionCenterId: 'CTR-BAKU-CELETTE'
      });

      expect(cert.certificateNumber).toMatch(/^ISB-TOT-2026-\d{5}$/);
      expect(cert.vin).toBe('5NPD74LF7MH198421');
      expect(cert.status).toBe('ROAD_CIRCULATION_APPROVED');
      expect(cert.digitalSecurityHash).toContain('isb-tot-5NPD74LF');
    });

    it('looks up existing certificate by VIN and Certificate number', () => {
      const foundByVin = lookupSalvageRecord('5NPD74LF7MH198421');
      expect(foundByVin).not.toBeNull();
      expect(foundByVin?.plateNumber).toBe('77-XD-219');

      const foundByCert = lookupSalvageRecord('ISB-TOT-2026-00184');
      expect(foundByCert).not.toBeNull();
      expect(foundByCert?.vehicleMakeModel).toContain('Hyundai Elantra');

      const notFound = lookupSalvageRecord('NONEXISTENT-VIN-999');
      expect(notFound).toBeNull();
    });
  });
});

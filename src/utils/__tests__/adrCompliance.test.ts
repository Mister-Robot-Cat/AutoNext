import { describe, it, expect } from 'vitest';
import {
  convertAznToCurrency,
  formatADRCurrency,
  interpretKemlerCode,
  evaluateADRCompliance,
  calculateADRPermitCost,
  generateADRSpecialPermit,
} from '../adrCompliance';
import { MOCK_ADR_SUBSTANCES, MOCK_ADR_EQUIPMENT_CHECKLIST } from '../../data/mockAdrData';

describe('adrCompliance Utility Engine', () => {
  describe('Currency & Formatting', () => {
    it('converts AZN to USD and EUR accurately', () => {
      expect(convertAznToCurrency(170, 'USD')).toBe(100);
      expect(convertAznToCurrency(185, 'EUR')).toBe(100);
      expect(convertAznToCurrency(100, 'AZN')).toBe(100);
    });

    it('formats currencies with proper symbols', () => {
      expect(formatADRCurrency(100, 'AZN')).toContain('₼');
      expect(formatADRCurrency(100, 'USD')).toContain('$');
      expect(formatADRCurrency(100, 'EUR')).toContain('€');
    });
  });

  describe('interpretKemlerCode', () => {
    it('identifies highly flammable liquids (33)', () => {
      const result = interpretKemlerCode('33');
      expect(result.hazardSummaryAz).toContain('Yüksək dərəcədə tezalışan maye');
      expect(result.riskLevel).toBe('extreme');
      expect(result.isWaterReactive).toBe(false);
    });

    it('identifies water reactive substances with X-prefix (X88)', () => {
      const result = interpretKemlerCode('X88');
      expect(result.isWaterReactive).toBe(true);
      expect(result.hazardSummaryAz).toContain('Su ilə şiddətli reaksiyaya girən');
      expect(result.riskLevel).toBe('extreme');
    });

    it('identifies flammable gas (23) and corrosive (80)', () => {
      const gasResult = interpretKemlerCode('23');
      expect(gasResult.hazardSummaryAz).toContain('Tezalışan təzyiq altında qaz');
      expect(gasResult.riskLevel).toBe('high');

      const acidResult = interpretKemlerCode('80');
      expect(acidResult.hazardSummaryAz).toContain('Aşındırıcı');
    });
  });

  describe('evaluateADRCompliance', () => {
    const petrolSubstance = MOCK_ADR_SUBSTANCES.find((s) => s.unNumber === '1203')!;
    const allEquipmentIds = MOCK_ADR_EQUIPMENT_CHECKLIST.map((e) => e.id);

    const validDriver = {
      certificateNumber: 'FHN-ADR-SR-2026-0941',
      driverName: 'Nəriman Cəfərov',
      driverFin: '5K8LM29',
      isBasicCertified: true,
      isTankerCertified: true,
      isClass1ExplosivesCertified: false,
      isClass7RadioactiveCertified: false,
      expiryDate: '2028-05-14',
      isValid: true,
    };

    it('returns approved status and high score when fully compliant', () => {
      const result = evaluateADRCompliance({
        vehiclePlate: '99-JH-120',
        substance: petrolSubstance,
        vehicleType: 'FL',
        tankerInspectionValid: true,
        batteryMasterSwitchEx: true,
        exhaustSparkArrestor: true,
        absEbsFunctional: true,
        equippedItemIds: allEquipmentIds,
        driverCredential: validDriver,
      });

      expect(result.safetyScore).toBe(100);
      expect(result.status).toBe('approved');
      expect(result.missingCriticalEquipment).toHaveLength(0);
      expect(result.legalViolations).toHaveLength(0);
      expect(result.speedLimitKmh).toBe(60);
      expect(result.mandatoryEscortRequired).toBe(false);
    });

    it('penalizes missing equipment and lowers score to conditional warning', () => {
      const missingSomeEquipment = allEquipmentIds.filter(
        (id) => id !== 'chemical_mask' && id !== 'drain_cover_seal'
      );

      const result = evaluateADRCompliance({
        vehiclePlate: '99-JH-120',
        substance: petrolSubstance,
        vehicleType: 'FL',
        tankerInspectionValid: true,
        batteryMasterSwitchEx: true,
        exhaustSparkArrestor: true,
        absEbsFunctional: true,
        equippedItemIds: missingSomeEquipment,
        driverCredential: validDriver,
      });

      expect(result.safetyScore).toBe(90);
      expect(result.status).toBe('conditional_warning');
      expect(result.missingCriticalEquipment).toContain('chemical_mask');
      expect(result.missingCriticalEquipment).toContain('drain_cover_seal');
      expect(result.ixmFinePotentialAzn).toBeGreaterThan(0);
    });

    it('prohibits transport if tanker inspection is invalid or ABS is faulty', () => {
      const result = evaluateADRCompliance({
        vehiclePlate: '99-JH-120',
        substance: petrolSubstance,
        vehicleType: 'FL',
        tankerInspectionValid: false,
        batteryMasterSwitchEx: false,
        exhaustSparkArrestor: false,
        absEbsFunctional: false,
        equippedItemIds: allEquipmentIds,
        driverCredential: validDriver,
      });

      expect(result.safetyScore).toBeLessThan(60);
      expect(result.status).toBe('prohibited');
      expect(result.legalViolations.length).toBeGreaterThanOrEqual(3);
    });

    it('mandates police escort for Class 1 explosives', () => {
      const explosiveSubstance = MOCK_ADR_SUBSTANCES.find((s) => s.classId === 'class_1')!;
      const result = evaluateADRCompliance({
        vehiclePlate: '99-JH-120',
        substance: explosiveSubstance,
        vehicleType: 'EX_III',
        tankerInspectionValid: true,
        batteryMasterSwitchEx: true,
        exhaustSparkArrestor: true,
        absEbsFunctional: true,
        equippedItemIds: allEquipmentIds,
        driverCredential: {
          ...validDriver,
          isClass1ExplosivesCertified: true,
        },
      });

      expect(result.mandatoryEscortRequired).toBe(true);
      expect(result.tunnelCategoryAllowed).toBe('E');
    });
  });

  describe('calculateADRPermitCost', () => {
    it('calculates standard permit duty and coordination fee', () => {
      const cost = calculateADRPermitCost({
        distanceKm: 200,
        classId: 'class_3',
        vehicleType: 'FL',
        isUrgent: false,
        currency: 'AZN',
      });

      expect(cost.baseDutyAzn).toBe(40);
      expect(cost.routeCoordinationFeeAzn).toBe(44); // 200 * 0.22 = 44
      expect(cost.escortFeeAzn).toBe(0);
      expect(cost.totalAzn).toBe(84);
      expect(cost.formattedTotal).toContain('84');
    });

    it('adds escort fee for explosives and urgent surcharge', () => {
      const cost = calculateADRPermitCost({
        distanceKm: 100,
        classId: 'class_1',
        vehicleType: 'EX_III',
        isUrgent: true,
        currency: 'AZN',
      });

      expect(cost.baseDutyAzn).toBe(40);
      expect(cost.escortFeeAzn).toBe(150);
      expect(cost.urgentSurchargeAzn).toBe(50);
      expect(cost.totalAzn).toBe(40 + 35 + 150 + 50); // 275
    });
  });

  describe('generateADRSpecialPermit', () => {
    it('creates a verifiable permit with serial, hash, and 30-day validity', () => {
      const substance = MOCK_ADR_SUBSTANCES[0];
      const permit = generateADRSpecialPermit({
        carrierName: 'SOCAR Logistics MMC',
        carrierVoen: '1401298831',
        vehiclePlate: '99-JH-120',
        driverFin: '5K8LM29',
        substance,
        corridorName: 'Bakı – Astara (M-3)',
        totalFeeAzn: 85,
      });

      expect(permit.permitNumber).toMatch(/^FHN-ADR-2026-\d{5}$/);
      expect(permit.vehiclePlate).toBe('99-JH-120');
      expect(permit.driverFin).toBe('5K8LM29');
      expect(permit.unNumber).toBe(substance.unNumber);
      expect(permit.securityHash).toContain('SHA256:FHN-');
      expect(permit.status).toBe('ACTIVE');
      expect(permit.totalFeeAzn).toBe(85);
    });
  });
});

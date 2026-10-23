import { describe, it, expect } from 'vitest';
import {
  BONUS_MALUS_CLASSES,
  BonusMalusClassId,
  calculateNextBonusMalusClass,
  getEngineDisplacementCoefficient,
  getTerritoryCoefficient,
  getExperienceCoefficient,
  calculateCompulsoryPremium,
  getRiskRating,
  generateBonusMalusCertificate,
  STATUTORY_BASE_TARIFF_AZN,
  STATUTORY_PROPERTY_DAMAGE_LIMIT_AZN,
  STATUTORY_BODILY_INJURY_LIMIT_AZN,
} from '../bonusMalus';
import { MOCK_DRIVER_PROFILES } from '../../data/mockBonusMalusData';

describe('bonusMalus utility calculations', () => {
  describe('BONUS_MALUS_CLASSES definition', () => {
    it('defines exactly 14 classes from BM_1 to BM_14', () => {
      const keys = Object.keys(BONUS_MALUS_CLASSES);
      expect(keys).toHaveLength(14);
      expect(BONUS_MALUS_CLASSES.BM_1.coefficient).toBe(1.6);
      expect(BONUS_MALUS_CLASSES.BM_7.coefficient).toBe(1.0);
      expect(BONUS_MALUS_CLASSES.BM_14.coefficient).toBe(0.45);
    });

    it('correctly maps discount and surcharge percentages', () => {
      expect(BONUS_MALUS_CLASSES.BM_1.discountOrSurchargePercent).toBe(60);
      expect(BONUS_MALUS_CLASSES.BM_7.discountOrSurchargePercent).toBe(0);
      expect(BONUS_MALUS_CLASSES.BM_14.discountOrSurchargePercent).toBe(-55);
      expect(BONUS_MALUS_CLASSES.BM_8.discountOrSurchargePercent).toBe(-5);
      expect(BONUS_MALUS_CLASSES.BM_13.discountOrSurchargePercent).toBe(-40);
    });
  });

  describe('calculateNextBonusMalusClass transition matrix', () => {
    it('promotes driver by 1 class on 0 at-fault claims', () => {
      expect(calculateNextBonusMalusClass('BM_7', 0)).toBe('BM_8');
      expect(calculateNextBonusMalusClass('BM_1', 0)).toBe('BM_2');
      expect(calculateNextBonusMalusClass('BM_13', 0)).toBe('BM_14');
      // Caps at BM 14
      expect(calculateNextBonusMalusClass('BM_14', 0)).toBe('BM_14');
    });

    it('demotes driver on 1 at-fault claim according to statutory table', () => {
      expect(calculateNextBonusMalusClass('BM_14', 1)).toBe('BM_9');
      expect(calculateNextBonusMalusClass('BM_12', 1)).toBe('BM_7');
      expect(calculateNextBonusMalusClass('BM_7', 1)).toBe('BM_2');
      expect(calculateNextBonusMalusClass('BM_4', 1)).toBe('BM_1');
      expect(calculateNextBonusMalusClass('BM_1', 1)).toBe('BM_1');
    });

    it('demotes driver severely on 2 at-fault claims', () => {
      expect(calculateNextBonusMalusClass('BM_14', 2)).toBe('BM_5');
      expect(calculateNextBonusMalusClass('BM_12', 2)).toBe('BM_3');
      expect(calculateNextBonusMalusClass('BM_7', 2)).toBe('BM_1');
      expect(calculateNextBonusMalusClass('BM_2', 2)).toBe('BM_1');
    });

    it('demotes driver directly to BM_1 on 3 or more claims', () => {
      expect(calculateNextBonusMalusClass('BM_14', 3)).toBe('BM_1');
      expect(calculateNextBonusMalusClass('BM_10', 5)).toBe('BM_1');
    });
  });

  describe('coefficient lookups', () => {
    it('calculates engine displacement coefficients properly', () => {
      expect(getEngineDisplacementCoefficient(1200, false)).toBe(1.0);
      expect(getEngineDisplacementCoefficient(1500, false)).toBe(1.0);
      expect(getEngineDisplacementCoefficient(1998, false)).toBe(1.5);
      expect(getEngineDisplacementCoefficient(2487, false)).toBe(2.0);
      expect(getEngineDisplacementCoefficient(2996, false)).toBe(2.5);
      expect(getEngineDisplacementCoefficient(3956, false)).toBe(3.5);
      expect(getEngineDisplacementCoefficient(4461, false)).toBe(4.0);
      expect(getEngineDisplacementCoefficient(4999, false)).toBe(4.5);
      expect(getEngineDisplacementCoefficient(5700, false)).toBe(5.0);
      // Electric vehicle gets eco-incentive 1.0
      expect(getEngineDisplacementCoefficient(0, true)).toBe(1.0);
      expect(getEngineDisplacementCoefficient(3000, true)).toBe(1.0);
    });

    it('returns territory coefficients', () => {
      expect(getTerritoryCoefficient('baku')).toBe(1.1);
      expect(getTerritoryCoefficient('absheron_sumgayit')).toBe(1.05);
      expect(getTerritoryCoefficient('ganja')).toBe(1.0);
      expect(getTerritoryCoefficient('other_regions')).toBe(0.95);
    });

    it('returns driver experience coefficients', () => {
      expect(getExperienceCoefficient('senior_experienced')).toBe(1.0);
      expect(getExperienceCoefficient('young_experienced')).toBe(1.2);
      expect(getExperienceCoefficient('senior_novice')).toBe(1.25);
      expect(getExperienceCoefficient('young_novice')).toBe(1.35);
    });
  });

  describe('calculateCompulsoryPremium', () => {
    it('calculates standard base premium for BM_7 in Baku with 2.0L engine', () => {
      // 50 * 1.5 (engine) * 1.1 (baku) * 1.0 (senior_experienced) * 1.0 (BM 7) = 82.5 AZN
      const result = calculateCompulsoryPremium({
        currentClass: 'BM_7',
        engineDisplacementCc: 1998,
        isElectric: false,
        territory: 'baku',
        experienceCategory: 'senior_experienced',
        atFaultAccidentsInPeriod: 0,
      });

      expect(result.baseTariffAzn).toBe(STATUTORY_BASE_TARIFF_AZN);
      expect(result.engineCoefficient).toBe(1.5);
      expect(result.territoryCoefficient).toBe(1.1);
      expect(result.experienceCoefficient).toBe(1.0);
      expect(result.bonusMalusCoefficient).toBe(1.0);
      expect(result.finalPremiumAzn).toBe(82.5);
      expect(result.differenceVsBaseAzn).toBe(0);
      expect(result.differenceVsBasePercent).toBe(0);
      expect(result.nextProjectedClass).toBe('BM_8');
      expect(result.statutoryMaxPropertyLimitAzn).toBe(STATUTORY_PROPERTY_DAMAGE_LIMIT_AZN);
      expect(result.statutoryMaxBodilyLimitAzn).toBe(STATUTORY_BODILY_INJURY_LIMIT_AZN);
    });

    it('applies 55% discount for BM_14 exemplary driver', () => {
      // 50 * 1.5 * 1.1 * 1.0 * 0.45 = 37.125 -> 37.13 AZN
      const result = calculateCompulsoryPremium({
        currentClass: 'BM_14',
        engineDisplacementCc: 1998,
        isElectric: false,
        territory: 'baku',
        experienceCategory: 'senior_experienced',
        atFaultAccidentsInPeriod: 0,
      });

      expect(result.bonusMalusCoefficient).toBe(0.45);
      expect(result.finalPremiumAzn).toBe(37.13);
      expect(result.baselineClass7PremiumAzn).toBe(82.5);
      expect(result.differenceVsBaseAzn).toBeLessThan(0);
      expect(result.differenceVsBasePercent).toBeCloseTo(-55, 0);
      expect(result.nextProjectedClass).toBe('BM_14');
    });

    it('applies 60% surcharge for BM_1 driver', () => {
      // 50 * 2.0 (2.5L) * 1.1 * 1.35 (young novice) * 1.6 = 237.6 AZN
      const result = calculateCompulsoryPremium({
        currentClass: 'BM_1',
        engineDisplacementCc: 2487,
        isElectric: false,
        territory: 'baku',
        experienceCategory: 'young_novice',
        atFaultAccidentsInPeriod: 0,
      });

      expect(result.bonusMalusCoefficient).toBe(1.6);
      expect(result.finalPremiumAzn).toBe(237.6);
      expect(result.differenceVsBasePercent).toBeCloseTo(60, 0);
      expect(result.nextProjectedClass).toBe('BM_2');
    });

    it('provides multi-currency equivalents', () => {
      const result = calculateCompulsoryPremium({
        currentClass: 'BM_7',
        engineDisplacementCc: 1500,
        isElectric: false,
        territory: 'ganja',
        experienceCategory: 'senior_experienced',
      });

      // 50 * 1.0 * 1.0 * 1.0 * 1.0 = 50 AZN
      expect(result.finalPremiumAzn).toBe(50.0);
      expect(result.finalPremiumUsd).toBeCloseTo(50 * 0.588, 1);
      expect(result.finalPremiumEur).toBeCloseTo(50 * 0.543, 1);
    });
  });

  describe('getRiskRating', () => {
    it('evaluates low risk for bonus classes BM 11-14', () => {
      expect(getRiskRating('BM_14').level).toBe('low');
      expect(getRiskRating('BM_12').level).toBe('low');
    });

    it('evaluates moderate risk for classes BM 7-10', () => {
      expect(getRiskRating('BM_7').level).toBe('moderate');
      expect(getRiskRating('BM_10').level).toBe('moderate');
    });

    it('evaluates elevated risk for initial malus BM 4-6', () => {
      expect(getRiskRating('BM_5').level).toBe('elevated');
      expect(getRiskRating('BM_4').level).toBe('elevated');
    });

    it('evaluates high risk for severe malus BM 1-3', () => {
      expect(getRiskRating('BM_1').level).toBe('high');
      expect(getRiskRating('BM_3').level).toBe('high');
    });
  });

  describe('generateBonusMalusCertificate', () => {
    it('creates an official certificate with cryptographic verification hash and QR link', () => {
      const driver = MOCK_DRIVER_PROFILES[0]; // Elmir Məmmədov (BM 14)
      const cert = generateBonusMalusCertificate(driver, '90-AA-104', 'PAŞA Sığorta ASC');

      expect(cert.certificateNumber).toMatch(/^AMB-BMS-2026-\d{5}$/);
      expect(cert.verificationHash).toContain('SHA256-');
      expect(cert.driver.fullName).toBe('Elmir Məmmədov Rauf oğlu');
      expect(cert.classInfo.id).toBe('BM_14');
      expect(cert.qrCodeUrl).toContain('https://isb.az/verify/bm?cert=');
      expect(cert.securitySeal).toContain('AMB-ISB-SIG-SECURE-');
      expect(cert.projectedRenewalClass).toBe('BM_14');
    });
  });
});

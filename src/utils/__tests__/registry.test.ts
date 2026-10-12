import { describe, it, expect } from 'vitest';
import {
  normalizeQuery,
  validateVin,
  validatePlateNumber,
  formatPlateNumber,
  calculateSafetyScore,
  evaluateVerdict,
  searchRegistry,
  generateRegistryCertificate,
} from '../registry';
import { RegistryRecord } from '../../types/registry';

describe('Stolen Vehicle & Lien Registry Verification - Utilities', () => {
  describe('normalizeQuery', () => {
    it('normalizes queries by trimming, uppercasing, and removing dashes/spaces', () => {
      expect(normalizeQuery(' 90-aa-123 ')).toBe('90AA123');
      expect(normalizeQuery('wba5a7c50jb192841')).toBe('WBA5A7C50JB192841');
      expect(normalizeQuery('10 EV 605')).toBe('10EV605');
    });
  });

  describe('validateVin', () => {
    it('returns true for valid 17-character VIN strings without I, O, Q', () => {
      expect(validateVin('WBA5A7C50JB192841')).toBe(true);
      expect(validateVin('4T1B11HK5LU821943')).toBe(true);
    });

    it('returns false for invalid VIN lengths or illegal characters', () => {
      expect(validateVin('SHORTVIN123')).toBe(false);
      expect(validateVin('WBA5A7C50JB19284I')).toBe(false); // contains 'I'
      expect(validateVin('WBA5A7C50JB19284O')).toBe(false); // contains 'O'
      expect(validateVin('WBA5A7C50JB19284Q')).toBe(false); // contains 'Q'
      expect(validateVin('')).toBe(false);
    });
  });

  describe('validatePlateNumber', () => {
    it('validates official Azerbaijani plate patterns', () => {
      expect(validatePlateNumber('90-AA-123')).toBe(true);
      expect(validatePlateNumber('10-EV-605')).toBe(true);
      expect(validatePlateNumber('99KB412')).toBe(true);
      expect(validatePlateNumber('77 TC 070')).toBe(true);
    });

    it('rejects invalid plate structures', () => {
      expect(validatePlateNumber('ABC-123')).toBe(false);
      expect(validatePlateNumber('1234567')).toBe(false);
      expect(validatePlateNumber('90-123-AA')).toBe(false);
      expect(validatePlateNumber('')).toBe(false);
    });
  });

  describe('formatPlateNumber', () => {
    it('formats 7-character string to standardized XX-YY-ZZZ notation', () => {
      expect(formatPlateNumber('90aa123')).toBe('90-AA-123');
      expect(formatPlateNumber('10EV605')).toBe('10-EV-605');
    });

    it('returns raw uppercase trimmed fallback for non-matching patterns', () => {
      expect(formatPlateNumber('CUSTOM-PLATE')).toBe('CUSTOM-PLATE');
    });
  });

  describe('calculateSafetyScore', () => {
    const baseRecord: RegistryRecord = {
      vin: 'TESTVIN1234567890',
      plateNumber: '90-AA-100',
      make: 'Toyota',
      model: 'Corolla',
      year: 2022,
      engineNumber: 'ENG-1',
      chassisNumber: 'CHS-1',
      ownerFullName: 'Test Owner',
      registrationCity: 'Bakı',
      policeStatus: 'clear',
      lienStatus: 'clean',
      legalRestriction: 'none',
      unpaidFinesCount: 0,
      unpaidFinesAmountAzn: 0,
      lastInspectionDate: '2026-01-01',
    };

    it('gives 100 to completely clean title vehicles', () => {
      expect(calculateSafetyScore(baseRecord)).toBe(100);
    });

    it('gives 0 immediately if police status is stolen or wanted', () => {
      const stolenRecord = { ...baseRecord, policeStatus: 'stolen_wanted' as const };
      expect(calculateSafetyScore(stolenRecord)).toBe(0);
    });

    it('deducts 60 points for active court or enforcement restrictions', () => {
      const courtRecord = { ...baseRecord, legalRestriction: 'court_enforcement' as const };
      expect(calculateSafetyScore(courtRecord)).toBe(40);
    });

    it('deducts 35 points for active bank collateral liens', () => {
      const lienRecord = { ...baseRecord, lienStatus: 'pledged_active' as const };
      expect(calculateSafetyScore(lienRecord)).toBe(65);
    });

    it('deducts points for unpaid traffic radar fines up to max penalty of 20', () => {
      const finesRecord = { ...baseRecord, unpaidFinesCount: 3 };
      expect(calculateSafetyScore(finesRecord)).toBe(85); // 100 - (3 * 5) = 85

      const heavyFinesRecord = { ...baseRecord, unpaidFinesCount: 10 };
      expect(calculateSafetyScore(heavyFinesRecord)).toBe(80); // max penalty 20
    });
  });

  describe('evaluateVerdict', () => {
    const mockRecord: RegistryRecord = {
      vin: 'TESTVIN1234567890',
      plateNumber: '90-AA-100',
      make: 'Toyota',
      model: 'Corolla',
      year: 2022,
      engineNumber: 'ENG-1',
      chassisNumber: 'CHS-1',
      ownerFullName: 'Test Owner',
      registrationCity: 'Bakı',
      policeStatus: 'clear',
      lienStatus: 'clean',
      legalRestriction: 'none',
      unpaidFinesCount: 0,
      unpaidFinesAmountAzn: 0,
      lastInspectionDate: '2026-01-01',
    };

    it('returns clean_title verdict when all criteria pass', () => {
      const res = evaluateVerdict(mockRecord, 100);
      expect(res.verdict).toBe('clean_title');
      expect(res.verdictTitleAz).toContain('TƏMİZ MÜLKİYYƏT');
    });

    it('returns blocked_critical verdict when court restriction or police flag exists', () => {
      const res = evaluateVerdict({ ...mockRecord, legalRestriction: 'court_enforcement' }, 40);
      expect(res.verdict).toBe('blocked_critical');
      expect(res.verdictTitleAz).toContain('TƏHLÜKƏLİ');
    });

    it('returns caution_advisory when vehicle is in active bank pledge', () => {
      const res = evaluateVerdict(
        {
          ...mockRecord,
          lienStatus: 'pledged_active',
          lienCreditor: 'Kapital Bank',
          lienAmountAzn: 15000,
        },
        65
      );
      expect(res.verdict).toBe('caution_advisory');
      expect(res.verdictTitleAz).toContain('BANK GİROVUNDA');
      expect(res.verdictDescriptionAz).toContain('Kapital Bank');
    });
  });

  describe('searchRegistry', () => {
    it('finds existing BMW record by VIN', () => {
      const res = searchRegistry('WBA5A7C50JB192841');
      expect(res.found).toBe(true);
      expect(res.record?.make).toBe('BMW');
      expect(res.record?.plateNumber).toBe('90-AA-530');
      expect(res.safetyScore).toBe(100);
      expect(res.checks.stolenCheckPassed).toBe(true);
      expect(res.checks.lienCheckPassed).toBe(true);
    });

    it('finds existing record by Plate Number with lowercase and spaces', () => {
      const res = searchRegistry('77 tc 070');
      expect(res.found).toBe(true);
      expect(res.record?.make).toBe('Toyota');
      expect(res.record?.model).toBe('Camry');
      expect(res.record?.lienStatus).toBe('pledged_discharged');
    });

    it('detects active bank pledge on Hyundai Tucson', () => {
      const res = searchRegistry('99-KB-412');
      expect(res.found).toBe(true);
      expect(res.record?.lienStatus).toBe('pledged_active');
      expect(res.checks.lienCheckPassed).toBe(false);
      expect(res.verdict).toBe('caution_advisory');
    });

    it('detects judicial restraint on Ford Escape', () => {
      const res = searchRegistry('1FMCU0G68KUA71924');
      expect(res.found).toBe(true);
      expect(res.record?.legalRestriction).toBe('court_enforcement');
      expect(res.checks.courtCheckPassed).toBe(false);
      expect(res.verdict).toBe('blocked_critical');
    });

    it('detects stolen wanted alert on Range Rover Sport', () => {
      const res = searchRegistry('99-ST-007');
      expect(res.found).toBe(true);
      expect(res.record?.policeStatus).toBe('stolen_wanted');
      expect(res.safetyScore).toBe(0);
      expect(res.checks.stolenCheckPassed).toBe(false);
      expect(res.verdict).toBe('blocked_critical');
    });

    it('generates synthetic verified clean record for unknown valid VIN', () => {
      const res = searchRegistry('WBA11223344556677');
      expect(res.found).toBe(true);
      expect(res.record?.vin).toBe('WBA11223344556677');
      expect(res.safetyScore).toBe(100);
      expect(res.verdict).toBe('clean_title');
    });

    it('returns found=false for invalid gibberish query', () => {
      const res = searchRegistry('xyz');
      expect(res.found).toBe(false);
      expect(res.record).toBeNull();
      expect(res.verdict).toBe('blocked_critical');
    });
  });

  describe('generateRegistryCertificate', () => {
    it('generates formatted official certificate string', () => {
      const verification = searchRegistry('WBA5A7C50JB192841');
      const cert = generateRegistryCertificate(verification);

      expect(cert).toContain('AZƏRBAYCAN RESPUBLİKASI DAXİLİ İŞLƏR NAZİRLİYİ');
      expect(cert).toContain('TƏMİNATLI ƏQDLƏRİN DÖVLƏT REYESTRİ');
      expect(cert).toContain('BMW 530i');
      expect(cert).toContain('90-AA-530');
      expect(cert).toContain('AutoNext Pro');
    });

    it('handles not found case gracefully in certificate generation', () => {
      const res = searchRegistry('invalid');
      const cert = generateRegistryCertificate(res);
      expect(cert).toContain('Nəqliyyat vasitəsi tapılmadı');
    });
  });
});

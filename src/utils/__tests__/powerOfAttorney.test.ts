import { describe, it, expect } from 'vitest';
import {
  calculatePoaFees,
  validateFin,
  calculateExpiryDate,
  calculateRemainingPoaDays,
  generatePoaRegistrationNumber,
  generatePoaSecurityHash,
  formatPoaLegalDocument,
  filterPoaRecords,
} from '../powerOfAttorney';
import { MOCK_ACTIVE_POA_RECORDS } from '../../data/mockPoaData';

describe('powerOfAttorney utils', () => {
  describe('calculatePoaFees', () => {
    it('calculates fees for driving only with close relative (reduced rate)', () => {
      const fees = calculatePoaFees('DRIVING_ONLY', 'CLOSE_RELATIVE', 'AZN');
      expect(fees.stateDutyAzn).toBe(5);
      expect(fees.notaryServiceFeeAzn).toBe(10);
      expect(fees.asanElectronicFeeAzn).toBe(3);
      expect(fees.totalAzn).toBe(18);
      expect(fees.totalConverted).toBe(18);
      expect(fees.currency).toBe('AZN');
    });

    it('calculates fees for driving only with third party (standard rate)', () => {
      const fees = calculatePoaFees('DRIVING_ONLY', 'THIRD_PARTY', 'AZN');
      expect(fees.stateDutyAzn).toBe(20);
      expect(fees.notaryServiceFeeAzn).toBe(10);
      expect(fees.asanElectronicFeeAzn).toBe(3);
      expect(fees.totalAzn).toBe(33);
    });

    it('calculates fees for full disposal with close relative', () => {
      const fees = calculatePoaFees('FULL_DISPOSAL', 'CLOSE_RELATIVE', 'AZN');
      expect(fees.stateDutyAzn).toBe(15);
      expect(fees.notaryServiceFeeAzn).toBe(20);
      expect(fees.asanElectronicFeeAzn).toBe(3);
      expect(fees.totalAzn).toBe(38);
    });

    it('calculates fees for full disposal with third party (highest tier)', () => {
      const fees = calculatePoaFees('FULL_DISPOSAL', 'THIRD_PARTY', 'AZN');
      expect(fees.stateDutyAzn).toBe(40);
      expect(fees.notaryServiceFeeAzn).toBe(20);
      expect(fees.asanElectronicFeeAzn).toBe(3);
      expect(fees.totalAzn).toBe(63);
    });

    it('converts total fee to USD and EUR accurately', () => {
      const feesUsd = calculatePoaFees('DRIVING_ONLY', 'THIRD_PARTY', 'USD');
      // 33 / 1.70 = 19.41
      expect(feesUsd.totalConverted).toBe(19.41);
      expect(feesUsd.currency).toBe('USD');

      const feesEur = calculatePoaFees('DRIVING_ONLY', 'THIRD_PARTY', 'EUR');
      // 33 / 1.85 = 17.84
      expect(feesEur.totalConverted).toBe(17.84);
      expect(feesEur.currency).toBe('EUR');
    });
  });

  describe('validateFin', () => {
    it('validates a valid 7-character FIN code', () => {
      const result = validateFin('5K9P32A');
      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe('5K9P32A');
      expect(result.error).toBeUndefined();
    });

    it('trims and capitalizes lowercase valid FIN', () => {
      const result = validateFin('  1a9f43d  ');
      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe('1A9F43D');
    });

    it('fails when FIN is empty or whitespace', () => {
      const result = validateFin('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('FİN kod boş ola bilməz');
    });

    it('fails when length is not 7 characters', () => {
      const tooShort = validateFin('123456');
      expect(tooShort.isValid).toBe(false);
      expect(tooShort.error).toBe('FİN kod tam 7 simvoldan ibarət olmalıdır');

      const tooLong = validateFin('12345678');
      expect(tooLong.isValid).toBe(false);
      expect(tooLong.error).toBe('FİN kod tam 7 simvoldan ibarət olmalıdır');
    });

    it('fails when special non-alphanumeric characters are present', () => {
      const result = validateFin('AB#45-7');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('FİN kod yalnız hərf və rəqəmlərdən ibarət ola bilər');
    });
  });

  describe('calculateExpiryDate', () => {
    it('adds given months to the issued date', () => {
      const expiry = calculateExpiryDate('2026-01-15', 12);
      expect(expiry).toBe('2027-01-15');

      const expiry3m = calculateExpiryDate('2026-03-01', 3);
      expect(expiry3m).toBe('2026-06-01');

      const expiry36m = calculateExpiryDate('2026-01-01', 36);
      expect(expiry36m).toBe('2029-01-01');
    });

    it('handles invalid date gracefully with current date fallback', () => {
      const expiry = calculateExpiryDate('invalid-date', 6);
      expect(typeof expiry).toBe('string');
      expect(expiry.split('-')).toHaveLength(3);
    });
  });

  describe('calculateRemainingPoaDays', () => {
    it('returns ACTIVE status when more than 30 days remain', () => {
      const { daysRemaining, status } = calculateRemainingPoaDays('2026-10-15', '2026-05-01');
      expect(daysRemaining).toBeGreaterThan(30);
      expect(status).toBe('ACTIVE');
    });

    it('returns EXPIRING_SOON when 30 or fewer days remain', () => {
      const { daysRemaining, status } = calculateRemainingPoaDays('2026-05-15', '2026-05-01');
      expect(daysRemaining).toBe(14);
      expect(status).toBe('EXPIRING_SOON');
    });

    it('returns EXPIRED when date is in the past', () => {
      const { daysRemaining, status } = calculateRemainingPoaDays('2026-01-01', '2026-05-01');
      expect(daysRemaining).toBe(0);
      expect(status).toBe('EXPIRED');
    });
  });

  describe('generatePoaRegistrationNumber', () => {
    it('generates a formatted code with prefix and year', () => {
      const code = generatePoaRegistrationNumber();
      expect(code).toMatch(/^ETB-NOT-2026-\d{5}$/);
    });

    it('supports deterministic seed', () => {
      const code = generatePoaRegistrationNumber(42);
      expect(code).toBe('ETB-NOT-2026-00042');
    });
  });

  describe('generatePoaSecurityHash', () => {
    it('generates 16-character hexadecimal hash', () => {
      const hash = generatePoaSecurityHash('5K9P32A', '7B4L81C', '10-AA-100', 'ETB-NOT-2026-88124');
      expect(hash).toHaveLength(16);
      expect(typeof hash).toBe('string');
    });

    it('produces reproducible output for the same input parameters', () => {
      const hash1 = generatePoaSecurityHash('5K9P32A', '7B4L81C', '10-AA-100', 'ETB-NOT-2026-88124');
      const hash2 = generatePoaSecurityHash('5K9P32A', '7B4L81C', '10-AA-100', 'ETB-NOT-2026-88124');
      expect(hash1).toBe(hash2);
    });
  });

  describe('formatPoaLegalDocument', () => {
    const sampleRecord = MOCK_ACTIVE_POA_RECORDS[0];

    it('formats document in Azerbaijani with all statutory legal citations', () => {
      const text = formatPoaLegalDocument(sampleRecord, 'az');
      expect(text).toContain('AZƏRBAYCAN RESPUBLİKASI ƏDLİYYƏ NAZİRLİYİ');
      expect(text).toContain('ELEKTRON NOTARİAT VAHİD İNFORMASİYA SİSTEMİ');
      expect(text).toContain(sampleRecord.registrationNumber);
      expect(text).toContain(sampleRecord.grantor.fullName);
      expect(text).toContain(sampleRecord.grantee.fullName);
      expect(text).toContain(sampleRecord.vehicle.plateNumber);
      expect(text).toContain('Mülki Məcəlləsinin 362-368-ci maddələri');
      expect(text).toContain('İnzibati Xətalar Məcəlləsinin 332-ci maddəsi');
      expect(text).toContain('SİMA Rəqəmsal İmza / ASAN İmza');
    });

    it('formats document in English with proper terminology', () => {
      const text = formatPoaLegalDocument(sampleRecord, 'en');
      expect(text).toContain('REPUBLIC OF AZERBAIJAN - MINISTRY OF JUSTICE');
      expect(text).toContain('ELECTRONIC POWER OF ATTORNEY');
      expect(text).toContain(sampleRecord.grantor.fullName);
      expect(text).toContain('Articles 362-368 of the Civil Code');
      expect(text).toContain('Main State Traffic Police Department (BDYP)');
    });

    it('formats document in Russian with proper terminology', () => {
      const text = formatPoaLegalDocument(sampleRecord, 'ru');
      expect(text).toContain('АЗЕРБАЙДЖАНСКАЯ РЕСПУБЛИКА - МИНИСТЕРСТВО ЮСТИЦИИ');
      expect(text).toContain('ЭЛЕКТРОННАЯ ДОВЕРЕННОСТЬ');
      expect(text).toContain(sampleRecord.grantor.fullName);
      expect(text).toContain('Статьи 362-368 Гражданского кодекса');
    });
  });

  describe('filterPoaRecords', () => {
    it('returns all records when query is empty and status is ALL', () => {
      const filtered = filterPoaRecords(MOCK_ACTIVE_POA_RECORDS, '', 'ALL');
      expect(filtered).toHaveLength(MOCK_ACTIVE_POA_RECORDS.length);
    });

    it('filters by status correctly', () => {
      const active = filterPoaRecords(MOCK_ACTIVE_POA_RECORDS, '', 'ACTIVE');
      expect(active.every((r) => r.status === 'ACTIVE')).toBe(true);

      const revoked = filterPoaRecords(MOCK_ACTIVE_POA_RECORDS, '', 'REVOKED');
      expect(revoked.every((r) => r.status === 'REVOKED')).toBe(true);
    });

    it('filters by vehicle plate number', () => {
      const filtered = filterPoaRecords(MOCK_ACTIVE_POA_RECORDS, '10-AA-100');
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered[0].vehicle.plateNumber).toBe('10-AA-100');
    });

    it('filters by registration code', () => {
      const filtered = filterPoaRecords(MOCK_ACTIVE_POA_RECORDS, '88124');
      expect(filtered.length).toBe(1);
      expect(filtered[0].registrationNumber).toBe('ETB-NOT-2026-88124');
    });

    it('filters by grantor name or FIN', () => {
      const filtered = filterPoaRecords(MOCK_ACTIVE_POA_RECORDS, '5K9P32A');
      expect(filtered.length).toBe(1);
      expect(filtered[0].grantor.fin).toBe('5K9P32A');
    });
  });
});

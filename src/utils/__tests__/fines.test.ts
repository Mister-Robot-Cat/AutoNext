import { describe, it, expect } from 'vitest';
import {
  normalizePlateNumber,
  formatPlateDisplay,
  isDiscountActive,
  calculateProtocolPayable,
  calculateFineSummary,
  evaluateDriverPoints,
  searchProtocols,
  getProtocolsForVehicle,
  simulateFinePayment,
  generateClearanceCertificate,
} from '../fines';
import { ViolationProtocol } from '../../types/fines';

describe('fines utility module', () => {
  const mockProtocol: ViolationProtocol = {
    protocolNumber: 'MMX-2026-TEST01',
    date: '2026-10-01T12:00:00',
    plateNumber: '90-MJ-318',
    texpasportSeries: 'AA 910283',
    category: 'speeding',
    legalArticle: 'İXM Maddə 328.2',
    titleAz: 'Sürət həddinin aşılması',
    titleEn: 'Speeding',
    titleRu: 'Превышение скорости',
    descriptionAz: 'Radar tərəfindən qeydə alınmışdır.',
    descriptionEn: 'Captured by radar.',
    descriptionRu: 'Зафиксировано радаром.',
    location: 'Bakı-Sumqayıt şossesi',
    amountAzn: 50,
    penaltyPoints: 2,
    issuedAt: '2026-10-01',
    discountDeadline: '2026-11-01',
    discountPercent: 50,
    status: 'unpaid',
    hasPhoto: true,
  };

  describe('normalizePlateNumber & formatPlateDisplay', () => {
    it('normalizes plate numbers correctly', () => {
      expect(normalizePlateNumber('90-mj-318')).toBe('90MJ318');
      expect(normalizePlateNumber('99  AA 777')).toBe('99AA777');
      expect(normalizePlateNumber('10_ev_605')).toBe('10EV605');
      expect(normalizePlateNumber('')).toBe('');
    });

    it('formats plate display with standard hyphens', () => {
      expect(formatPlateDisplay('90MJ318')).toBe('90-MJ-318');
      expect(formatPlateDisplay('99AA777')).toBe('99-AA-777');
      expect(formatPlateDisplay('custom-string')).toBe('custom-string');
    });
  });

  describe('isDiscountActive', () => {
    it('returns true when current date is before deadline', () => {
      const now = new Date('2026-10-15T00:00:00');
      expect(isDiscountActive('2026-10-20', now)).toBe(true);
    });

    it('returns false when current date is past deadline', () => {
      const now = new Date('2026-10-25T00:00:00');
      expect(isDiscountActive('2026-10-20', now)).toBe(false);
    });

    it('returns false when no deadline is provided', () => {
      expect(isDiscountActive('')).toBe(false);
    });
  });

  describe('calculateProtocolPayable', () => {
    it('returns 0 payable for already paid protocol', () => {
      const paidProtocol: ViolationProtocol = {
        ...mockProtocol,
        status: 'paid',
      };
      const result = calculateProtocolPayable(paidProtocol, 'AZN');
      expect(result.payableAzn).toBe(0);
      expect(result.savingsAzn).toBe(0);
      expect(result.convertedPayable).toBe(0);
    });

    it('applies 50% discount when discount period is active', () => {
      const now = new Date('2026-10-10');
      const result = calculateProtocolPayable(mockProtocol, 'AZN', now);
      expect(result.isDiscountApplied).toBe(true);
      expect(result.payableAzn).toBe(25);
      expect(result.savingsAzn).toBe(25);
    });

    it('charges full amount when discount period is expired', () => {
      const now = new Date('2026-11-15');
      const result = calculateProtocolPayable(mockProtocol, 'AZN', now);
      expect(result.isDiscountApplied).toBe(false);
      expect(result.payableAzn).toBe(50);
      expect(result.savingsAzn).toBe(0);
    });

    it('converts to foreign currency (USD and EUR)', () => {
      const now = new Date('2026-10-10');
      const usdResult = calculateProtocolPayable(mockProtocol, 'USD', now);
      // 25 / 1.70 = ~15 USD
      expect(usdResult.convertedPayable).toBe(15);

      const eurResult = calculateProtocolPayable(mockProtocol, 'EUR', now);
      // 25 / 1.85 = ~14 EUR
      expect(eurResult.convertedPayable).toBe(14);
    });
  });

  describe('calculateFineSummary', () => {
    it('correctly aggregates multiple protocols and points', () => {
      const protocols: ViolationProtocol[] = [
        mockProtocol, // 50 AZN, 2 points, 50% discount -> 25 AZN
        {
          ...mockProtocol,
          protocolNumber: 'MMX-2026-TEST02',
          amountAzn: 80,
          penaltyPoints: 3,
          discountDeadline: '2026-09-01', // expired
        },
        {
          ...mockProtocol,
          protocolNumber: 'MMX-2026-PAID01',
          amountAzn: 40,
          penaltyPoints: 1,
          status: 'paid',
        },
      ];

      const now = new Date('2026-10-15');
      const summary = calculateFineSummary(protocols, 'AZN', now);

      expect(summary.totalProtocols).toBe(3);
      expect(summary.unpaidProtocols).toBe(2);
      expect(summary.paidProtocols).toBe(1);
      expect(summary.totalOriginalAmountAzn).toBe(130); // 50 + 80
      expect(summary.totalDiscountedAmountAzn).toBe(105); // 25 + 80
      expect(summary.totalSavingsAzn).toBe(25);
      expect(summary.totalPoints).toBe(5); // 2 + 3 (unpaid points)
    });
  });

  describe('evaluateDriverPoints', () => {
    it('classifies safe points risk level (0-3 points)', () => {
      const res = evaluateDriverPoints(2);
      expect(res.riskLevel).toBe('safe');
      expect(res.remainingPointsBeforeSuspension).toBe(10);
    });

    it('classifies warning points risk level (4-7 points)', () => {
      const res = evaluateDriverPoints(5);
      expect(res.riskLevel).toBe('warning');
      expect(res.remainingPointsBeforeSuspension).toBe(7);
      expect(res.warningMessageAz).toContain('DİQQƏT');
    });

    it('classifies critical risk level (8-11 points)', () => {
      const res = evaluateDriverPoints(9);
      expect(res.riskLevel).toBe('critical');
      expect(res.remainingPointsBeforeSuspension).toBe(3);
      expect(res.warningMessageAz).toContain('YÜKSƏK RİSK');
    });

    it('classifies suspended risk level (12+ points)', () => {
      const res = evaluateDriverPoints(12);
      expect(res.riskLevel).toBe('suspended');
      expect(res.remainingPointsBeforeSuspension).toBe(0);
      expect(res.warningMessageAz).toContain('KRİTİK HƏDD');
    });
  });

  describe('searchProtocols', () => {
    const list: ViolationProtocol[] = [
      mockProtocol,
      {
        ...mockProtocol,
        protocolNumber: 'DYP-BAKU-9988',
        plateNumber: '10-PP-911',
        location: 'Heydər Əliyev prospekti',
      },
    ];

    it('matches by plate number', () => {
      const matches = searchProtocols('90-MJ-318', list);
      expect(matches.length).toBe(1);
      expect(matches[0].protocolNumber).toBe('MMX-2026-TEST01');
    });

    it('matches by query location', () => {
      const matches = searchProtocols('Heydər Əliyev', list);
      expect(matches.length).toBe(1);
      expect(matches[0].plateNumber).toBe('10-PP-911');
    });

    it('returns full list for empty query', () => {
      const matches = searchProtocols('', list);
      expect(matches.length).toBe(2);
    });
  });

  describe('getProtocolsForVehicle', () => {
    const db: ViolationProtocol[] = [
      mockProtocol,
      {
        ...mockProtocol,
        protocolNumber: 'MMX-2026-002',
        plateNumber: '99-KB-412',
      },
    ];

    it('returns matching vehicle protocols', () => {
      const res = getProtocolsForVehicle('90-mj-318', undefined, db);
      expect(res.length).toBe(1);
      expect(res[0].protocolNumber).toBe('MMX-2026-TEST01');
    });

    it('returns empty array when vehicle has no fines or not provided', () => {
      expect(getProtocolsForVehicle('', undefined, db)).toEqual([]);
      expect(getProtocolsForVehicle('77-TC-070', undefined, db)).toEqual([]);
    });
  });

  describe('simulateFinePayment', () => {
    it('generates a valid payment receipt', () => {
      const receipt = simulateFinePayment(
        ['MMX-2026-TEST01'],
        '90-MJ-318',
        'Cavid Əliyev',
        'AsanPay',
        'AZN',
        [mockProtocol]
      );

      expect(receipt.receiptNumber).toContain('ASAN-PAY');
      expect(receipt.protocolNumbers).toContain('MMX-2026-TEST01');
      expect(receipt.status).toBe('completed');
      expect(receipt.payerFullName).toBe('Cavid Əliyev');
      expect(receipt.paidAmountAzn).toBeGreaterThanOrEqual(25);
    });
  });

  describe('generateClearanceCertificate', () => {
    it('generates an official BDYP clearance certificate', () => {
      const cert = generateClearanceCertificate('90-AA-530', 'VIN12345678', 'Rəşad Məmmədov');
      expect(cert.isClean).toBe(true);
      expect(cert.plateNumber).toBe('90-AA-530');
      expect(cert.certificateNumber).toContain('ARAYIS-BDYP');
      expect(cert.securityHash).toContain('BDYP-SEC');
      expect(cert.validUntil).toBeDefined();
    });
  });
});

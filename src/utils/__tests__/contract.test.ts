import { describe, it, expect } from 'vitest';
import {
  calculateNotaryAndClosingFees,
  numberToWordsAz,
  numberToWordsEn,
  isValidFinCode,
  isValidVin,
  formatPlateNumber,
  formatFinCode,
  validateContractForm,
  buildVehicleInitialContractData,
  generateLegalContractDocument,
} from '../contract';
import { CONTRACT_PRESETS } from '../../data/mockContractPresets';

describe('contract utils', () => {
  describe('calculateNotaryAndClosingFees', () => {
    it('calculates correct fees for engine <= 1.5L between unrelated parties with plate retention', () => {
      const fees = calculateNotaryAndClosingFees({
        engineVolumeLiters: 1.4,
        relationship: 'unrelated',
        retainPlate: true,
      });

      expect(fees.notaryDutyAzn).toBe(60);
      expect(fees.notaryServiceFeeAzn).toBe(15);
      expect(fees.bdypiTechPassportDutyAzn).toBe(30);
      expect(fees.bdypiPlateDutyAzn).toBe(0);
      expect(fees.bdypiInspectionDutyAzn).toBe(30);
      expect(fees.insuranceTransferFeeAzn).toBe(10);
      expect(fees.totalNotaryFeesAzn).toBe(75);
      expect(fees.totalBdypiFeesAzn).toBe(60);
      expect(fees.grandTotalAzn).toBe(145);
      expect(fees.relativeDiscountApplied).toBe(false);
      expect(fees.relativeSavingsAzn).toBe(0);
    });

    it('calculates correct fees for engine 1.6L - 3.0L with new license plate issue', () => {
      const fees = calculateNotaryAndClosingFees({
        engineVolumeLiters: 2.0,
        relationship: 'unrelated',
        retainPlate: false,
      });

      expect(fees.notaryDutyAzn).toBe(90);
      expect(fees.bdypiPlateDutyAzn).toBe(35);
      expect(fees.totalBdypiFeesAzn).toBe(95); // 30 + 35 + 30
      expect(fees.grandTotalAzn).toBe(90 + 15 + 30 + 35 + 30 + 10); // 210
    });

    it('calculates tiered duty for 3.0L - 5.0L engine', () => {
      const fees = calculateNotaryAndClosingFees({
        engineVolumeLiters: 4.4,
        relationship: 'unrelated',
        retainPlate: true,
      });

      expect(fees.notaryDutyAzn).toBe(130);
    });

    it('calculates duty for > 5.0L engine', () => {
      const fees = calculateNotaryAndClosingFees({
        engineVolumeLiters: 5.5,
        relationship: 'unrelated',
        retainPlate: true,
      });

      expect(fees.notaryDutyAzn).toBe(160);
    });

    it('applies statutory concession of 30 AZN flat for close relatives regardless of engine capacity', () => {
      const fees = calculateNotaryAndClosingFees({
        engineVolumeLiters: 4.4,
        relationship: 'close_relative',
        retainPlate: true,
      });

      expect(fees.notaryDutyAzn).toBe(30);
      expect(fees.relativeDiscountApplied).toBe(true);
      expect(fees.relativeSavingsAzn).toBe(100); // 130 - 30
      expect(fees.grandTotalAzn).toBe(30 + 15 + 30 + 0 + 30 + 10); // 115
    });
  });

  describe('numberToWordsAz', () => {
    it('converts zero', () => {
      expect(numberToWordsAz(0)).toBe('sıfır');
    });

    it('converts small numbers', () => {
      expect(numberToWordsAz(5)).toBe('beş');
      expect(numberToWordsAz(17)).toBe('on yeddi');
      expect(numberToWordsAz(42)).toBe('qırx iki');
    });

    it('converts hundreds and thousands', () => {
      expect(numberToWordsAz(100)).toBe('yüz');
      expect(numberToWordsAz(350)).toBe('üç yüz əlli');
      expect(numberToWordsAz(1000)).toBe('min');
      expect(numberToWordsAz(2500)).toBe('iki min beş yüz');
      expect(numberToWordsAz(52000)).toBe('əlli iki min');
      expect(numberToWordsAz(68500)).toBe('altmış səkkiz min beş yüz');
    });

    it('converts millions', () => {
      expect(numberToWordsAz(1000000)).toBe('bir milyon');
      expect(numberToWordsAz(2450000)).toBe('iki milyon dörd yüz əlli min');
    });
  });

  describe('numberToWordsEn', () => {
    it('converts zero', () => {
      expect(numberToWordsEn(0)).toBe('zero');
    });

    it('converts numbers under 100', () => {
      expect(numberToWordsEn(11)).toBe('eleven');
      expect(numberToWordsEn(42)).toBe('forty-two');
    });

    it('converts hundreds and thousands', () => {
      expect(numberToWordsEn(100)).toBe('one hundred');
      expect(numberToWordsEn(1000)).toBe('one thousand');
      expect(numberToWordsEn(52000)).toBe('fifty-two thousand');
      expect(numberToWordsEn(68500)).toBe('sixty-eight thousand five hundred');
    });
  });

  describe('validation and formatting helpers', () => {
    it('validates FİN codes', () => {
      expect(isValidFinCode('6JK9L2P')).toBe(true);
      expect(isValidFinCode('7MK4T1B')).toBe(true);
      expect(isValidFinCode('123456')).toBe(false); // only 6 chars
      expect(isValidFinCode('12345678')).toBe(false); // 8 chars
      expect(isValidFinCode('AB-1234')).toBe(false); // invalid char
    });

    it('validates VIN', () => {
      expect(isValidVin('WBA5A7C50JB192841')).toBe(true);
      expect(isValidVin('4T1B11HK5MU192849')).toBe(true);
      expect(isValidVin('SHORTVIN')).toBe(false);
    });

    it('formats license plate numbers', () => {
      expect(formatPlateNumber('90AA530')).toBe('90-AA-530');
      expect(formatPlateNumber('10OK300')).toBe('10-OK-300');
      expect(formatPlateNumber('90-AA-530')).toBe('90-AA-530');
    });

    it('formats FIN code input', () => {
      expect(formatFinCode('6jk9l2p-extra')).toBe('6JK9L2P');
    });
  });

  describe('validateContractForm', () => {
    it('validates a complete preset successfully', () => {
      const preset = CONTRACT_PRESETS[0].data;
      const result = validateContractForm(preset);

      expect(result.isValid).toBe(true);
      expect(result.completenessScore).toBe(100);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('detects missing and invalid fields', () => {
      const invalidData = {
        ...CONTRACT_PRESETS[0].data,
        seller: {
          ...CONTRACT_PRESETS[0].data.seller,
          fullName: 'A', // too short
          finCode: 'INV!', // invalid length/characters
        },
        financials: {
          ...CONTRACT_PRESETS[0].data.financials,
          priceAzn: 0, // <= 0
        },
      };

      const result = validateContractForm(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.completenessScore).toBeLessThan(100);
      expect(result.errors.seller?.fullName).toBeDefined();
      expect(result.errors.seller?.finCode).toBeDefined();
      expect(result.errors.financials?.priceAzn).toBeDefined();
    });
  });

  describe('generateLegalContractDocument and buildVehicleInitialContractData', () => {
    it('generates contract data from vehicle object', () => {
      const mockCar = {
        id: 'car-test',
        make: 'Mercedes-Benz',
        model: 'E 300',
        year: 2023,
        vin: 'WDD2130831A784912',
        licensePlate: '10-OK-300',
        priceAzn: 68500,
        engineVolumeLiters: 2.0,
        bodyType: 'Sedan',
        color: 'Ağ Polar',
        seller: {
          name: 'Baku Prestige Motors',
          phone: '+994 12 404 88 99',
        },
      } as any;

      const initialData = buildVehicleInitialContractData(mockCar);
      expect(initialData.vehicle.make).toBe('Mercedes-Benz');
      expect(initialData.vehicle.vin).toBe('WDD2130831A784912');
      expect(initialData.financials.priceAzn).toBe(68500);
      expect(initialData.seller.fullName).toBe('Baku Prestige Motors');
    });

    it('generates bilingual legal document with required legal clauses', () => {
      const preset = CONTRACT_PRESETS[0].data;
      const doc = generateLegalContractDocument(preset);

      expect(doc.documentId).toBe(preset.metadata.contractNumber);
      expect(doc.titleAz).toContain('Alqı-Satqı Müqaviləsi');
      expect(doc.titleEn).toContain('Vehicle Purchase');

      // Azerbaijani checks
      expect(doc.azText).toContain(preset.seller.fullName);
      expect(doc.azText).toContain(preset.buyer.fullName);
      expect(doc.azText).toContain(preset.vehicle.vin);
      expect(doc.azText).toContain('əlli iki min');
      expect(doc.azText).toContain('NOTARİUSUN TƏSDİQ QEYDİ');

      // English checks
      expect(doc.enText).toContain(preset.seller.fullName);
      expect(doc.enText).toContain(preset.buyer.fullName);
      expect(doc.enText).toContain(preset.vehicle.vin);
      expect(doc.enText).toContain('fifty-two thousand');
      expect(doc.enText).toContain('NOTARIAL ATTESTATION');
    });
  });
});

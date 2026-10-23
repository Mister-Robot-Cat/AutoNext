import { describe, it, expect } from 'vitest';
import {
  inferEuroStandard,
  evaluateEcoStickerCategory,
  estimateCo2GramsPerKm,
  calculateEcoCompliance,
  formatEcoCurrency,
  generateEcoStickerCertificate,
} from '../ecoStickerCompliance';

describe('Eco-Sticker & LEZ Compliance - Utility Functions', () => {
  describe('inferEuroStandard', () => {
    it('infers zero_emission for electric powertrain', () => {
      expect(inferEuroStandard('Electric', 2023)).toBe('zero_emission');
      expect(inferEuroStandard('Elektrik', 2024)).toBe('zero_emission');
      expect(inferEuroStandard('BEV', 2022)).toBe('zero_emission');
    });

    it('infers euro_2 if catalytic converter / DPF is removed', () => {
      expect(inferEuroStandard('Petrol', 2020, false)).toBe('euro_2');
    });

    it('infers Euro standard based on vehicle model year when catalyst is intact', () => {
      expect(inferEuroStandard('Petrol', 2022, true)).toBe('euro_6');
      expect(inferEuroStandard('Petrol', 2013, true)).toBe('euro_5');
      expect(inferEuroStandard('Petrol', 2008, true)).toBe('euro_4');
      expect(inferEuroStandard('Petrol', 2002, true)).toBe('euro_3');
      expect(inferEuroStandard('Petrol', 1998, true)).toBe('euro_2');
    });
  });

  describe('evaluateEcoStickerCategory', () => {
    it('assigns green_1 (Tier 1) for zero emission EV', () => {
      expect(evaluateEcoStickerCategory('zero_emission', 'Electric', true)).toBe('green_1');
    });

    it('assigns grey_4 (Tier 4) if catalytic converter is missing', () => {
      expect(evaluateEcoStickerCategory('euro_6', 'Petrol', false)).toBe('grey_4');
    });

    it('assigns blue_2 (Tier 2) for Euro-6 petrol/diesel or Euro-5 hybrid', () => {
      expect(evaluateEcoStickerCategory('euro_6', 'Petrol', true)).toBe('blue_2');
      expect(evaluateEcoStickerCategory('euro_5', 'Hybrid', true)).toBe('blue_2');
      expect(evaluateEcoStickerCategory('euro_5', 'Plug-in Hybrid', true)).toBe('blue_2');
    });

    it('assigns yellow_3 (Tier 3) for Euro-5 or Euro-4 petrol/diesel', () => {
      expect(evaluateEcoStickerCategory('euro_5', 'Diesel', true)).toBe('yellow_3');
      expect(evaluateEcoStickerCategory('euro_4', 'Petrol', true)).toBe('yellow_3');
    });

    it('assigns grey_4 (Tier 4) for Euro-3 and older', () => {
      expect(evaluateEcoStickerCategory('euro_3', 'Petrol', true)).toBe('grey_4');
      expect(evaluateEcoStickerCategory('euro_2', 'Diesel', true)).toBe('grey_4');
    });
  });

  describe('estimateCo2GramsPerKm', () => {
    it('returns 0 g/km for green_1 EV', () => {
      expect(estimateCo2GramsPerKm('green_1', 'zero_emission', 0)).toBe(0);
    });

    it('estimates positive CO2 emissions for internal combustion engines', () => {
      const euro6 = estimateCo2GramsPerKm('blue_2', 'euro_6', 2000);
      const euro4 = estimateCo2GramsPerKm('yellow_3', 'euro_4', 2000);
      expect(euro6).toBe(115);
      expect(euro4).toBe(165);
      expect(euro4).toBeGreaterThan(euro6);
    });

    it('scales CO2 with engine displacement', () => {
      const smallEngine = estimateCo2GramsPerKm('blue_2', 'euro_6', 1400);
      const bigEngine = estimateCo2GramsPerKm('blue_2', 'euro_6', 3000);
      expect(bigEngine).toBeGreaterThan(smallEngine);
    });
  });

  describe('calculateEcoCompliance', () => {
    it('allows 100% free access for EV in Zone 1 (ULEZ)', () => {
      const res = calculateEcoCompliance({
        fuelType: 'Electric',
        year: 2024,
        zoneId: 'zone_1_ulez',
      });

      expect(res.stickerCategory).toBe('green_1');
      expect(res.isAllowedFree).toBe(true);
      expect(res.isProhibited).toBe(false);
      expect(res.dailyFeeAzn).toBe(0);
      expect(res.totalFeeAzn).toBe(0);
    });

    it('applies discounted fee for Blue sticker in Zone 1', () => {
      const res = calculateEcoCompliance({
        fuelType: 'Petrol',
        year: 2022,
        zoneId: 'zone_1_ulez',
        isPeakHours: false,
      });

      expect(res.stickerCategory).toBe('blue_2');
      expect(res.isAllowedWithFee).toBe(true);
      expect(res.isProhibited).toBe(false);
      expect(res.dailyFeeAzn).toBe(3); // 10 * 0.3
    });

    it('prohibits Yellow sticker in Zone 1 during peak hours', () => {
      const res = calculateEcoCompliance({
        fuelType: 'Petrol',
        year: 2008,
        zoneId: 'zone_1_ulez',
        isPeakHours: true,
      });

      expect(res.stickerCategory).toBe('yellow_3');
      expect(res.isProhibited).toBe(true);
      expect(res.statutoryFineRiskAzn).toBe(50);
    });

    it('prohibits Grey sticker in Zone 1 (ULEZ) and Zone 2 (Central Ring)', () => {
      const resZone1 = calculateEcoCompliance({
        fuelType: 'Petrol',
        year: 2000,
        zoneId: 'zone_1_ulez',
      });
      expect(resZone1.stickerCategory).toBe('grey_4');
      expect(resZone1.isProhibited).toBe(true);
      expect(resZone1.statutoryFineRiskAzn).toBe(50);

      const resZone2 = calculateEcoCompliance({
        fuelType: 'Petrol',
        year: 2000,
        zoneId: 'zone_2_central',
      });
      expect(resZone2.isProhibited).toBe(true);
    });

    it('allows Grey sticker in Zone 3 (Ring Highway) with an eco-fee', () => {
      const resZone3 = calculateEcoCompliance({
        fuelType: 'Petrol',
        year: 2000,
        zoneId: 'zone_3_baku_ring',
        isPeakHours: false,
      });
      expect(resZone3.isProhibited).toBe(false);
      expect(resZone3.isAllowedWithFee).toBe(true);
      expect(resZone3.dailyFeeAzn).toBe(4.4); // 2 * 2.2
    });

    it('grants 100% exemption for verified zone residents', () => {
      const res = calculateEcoCompliance({
        fuelType: 'Petrol',
        year: 2012,
        zoneId: 'zone_2_central',
        isResident: true,
      });
      expect(res.isAllowedFree).toBe(true);
      expect(res.discountPercent).toBe(100);
      expect(res.dailyFeeAzn).toBe(0);
      expect(res.totalFeeAzn).toBe(0);
    });

    it('grants 100% exemption for disabled drivers', () => {
      const res = calculateEcoCompliance({
        fuelType: 'Petrol',
        year: 2012,
        zoneId: 'zone_2_central',
        isDisabledDriver: true,
      });
      expect(res.isAllowedFree).toBe(true);
      expect(res.discountPercent).toBe(100);
      expect(res.dailyFeeAzn).toBe(0);
    });

    it('applies commercial vehicle 1.5x multiplier', () => {
      const passenger = calculateEcoCompliance({
        fuelType: 'Petrol',
        year: 2012,
        zoneId: 'zone_2_central',
        vehicleCategory: 'm1_passenger',
        isPeakHours: false,
      });

      const commercial = calculateEcoCompliance({
        fuelType: 'Petrol',
        year: 2012,
        zoneId: 'zone_2_central',
        vehicleCategory: 'n1_light_commercial',
        isPeakHours: false,
      });

      expect(commercial.dailyFeeAzn).toBe(passenger.dailyFeeAzn * 1.5);
    });

    it('applies monthly pass multiplier', () => {
      const daily = calculateEcoCompliance({
        fuelType: 'Petrol',
        year: 2012,
        zoneId: 'zone_2_central',
        passType: 'daily',
        isPeakHours: false,
      });

      const monthly = calculateEcoCompliance({
        fuelType: 'Petrol',
        year: 2012,
        zoneId: 'zone_2_central',
        passType: 'monthly',
        isPeakHours: false,
      });

      expect(monthly.totalFeeAzn).toBe(daily.dailyFeeAzn * 20);
    });
  });

  describe('formatEcoCurrency', () => {
    it('formats AZN correctly', () => {
      expect(formatEcoCurrency(10, 'AZN')).toContain('AZN');
    });

    it('formats USD correctly', () => {
      expect(formatEcoCurrency(10, 'USD')).toContain('$');
    });

    it('formats EUR correctly', () => {
      expect(formatEcoCurrency(10, 'EUR')).toContain('€');
    });
  });

  describe('generateEcoStickerCertificate', () => {
    it('creates an official certificate with required fields and SHA256 hash', () => {
      const cert = generateEcoStickerCertificate(
        '90-AA-104',
        'KNAGH414BBA098124',
        'Hyundai Ioniq 5',
        'green_1',
        'zero_emission'
      );

      expect(cert.certificateNumber).toMatch(/^ETSN-LEZ-2026-\d{5}$/);
      expect(cert.stickerNumber).toMatch(/^ECO-2026-\d{6}$/);
      expect(cert.vehiclePlate).toBe('90-AA-104');
      expect(cert.vin).toBe('KNAGH414BBA098124');
      expect(cert.stickerCategory).toBe('green_1');
      expect(cert.euroClass).toBe('zero_emission');
      expect(cert.sha256VerificationHash).toContain('SHA256:');
      expect(cert.qrCodeUrl).toContain('https://eco.gov.az/verify/lez');
    });
  });
});

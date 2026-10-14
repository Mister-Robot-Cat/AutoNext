import { describe, it, expect } from 'vitest';
import { 
  STATUTORY_TOLL_RATES, 
  PAYMENT_METHOD_DISCOUNTS, 
  detectVehicleCategory, 
  calculateTollFare, 
  simulateTransponderTopUp, 
  simulateGatePassage, 
  generateTollReceipt, 
  getVehicleCategoryDisplayName, 
  getPaymentMethodDisplayName 
} from '../tollRoads';
import { MOCK_TOLL_PLAZAS, MOCK_TRANSPONDER_ACCOUNT } from '../../data/mockTollRoads';
import { Vehicle } from '../../types/vehicle';

describe('Toll Roads Calculation Engine (src/utils/tollRoads.ts)', () => {
  const yashma = MOCK_TOLL_PLAZAS[0]; // km 45
  const quba = MOCK_TOLL_PLAZAS[4];   // km 160
  const samur = MOCK_TOLL_PLAZAS[6];  // km 192

  describe('Statutory Tariffs & Discounts', () => {
    it('defines correct legal rates per km for vehicle categories', () => {
      expect(STATUTORY_TOLL_RATES.passenger_light).toBe(0.07);
      expect(STATUTORY_TOLL_RATES.medium_truck_bus).toBe(0.15);
      expect(STATUTORY_TOLL_RATES.heavy_tir_coach).toBe(0.25);
    });

    it('defines statutory discounts for payment channels', () => {
      expect(PAYMENT_METHOD_DISCOUNTS.transponder_rfid).toBe(10);
      expect(PAYMENT_METHOD_DISCOUNTS.qr_epass).toBe(5);
      expect(PAYMENT_METHOD_DISCOUNTS.cash_card).toBe(0);
    });
  });

  describe('detectVehicleCategory', () => {
    it('defaults to passenger_light when vehicle is undefined', () => {
      expect(detectVehicleCategory(undefined)).toBe('passenger_light');
    });

    it('detects passenger vehicles correctly', () => {
      const mockCar: Partial<Vehicle> = { bodyType: 'sedan' };
      expect(detectVehicleCategory(mockCar as Vehicle)).toBe('passenger_light');
    });

    it('detects heavy/commercial vehicles correctly', () => {
      const mockTruck: Partial<Vehicle> = { bodyType: 'minivan' };
      expect(detectVehicleCategory(mockTruck as Vehicle)).toBe('medium_truck_bus');
    });
  });

  describe('calculateTollFare', () => {
    it('calculates full length fare from Yaşma to Samur with RFID discount', () => {
      const result = calculateTollFare(yashma, samur, 'passenger_light', 'transponder_rfid', 'AZN');
      // Distance: 192 - 45 = 147 km
      expect(result.distanceKm).toBe(147);
      // Gross: 147 * 0.07 = 10.29 AZN
      expect(result.grossFareAzn).toBe(10.29);
      // 10% discount: 10.29 * 0.10 = 1.03 AZN
      expect(result.discountAmountAzn).toBe(1.03);
      // Net: 10.29 - 1.03 = 9.26 AZN
      expect(result.netFareAzn).toBe(9.26);
      expect(result.netFareTargetCurrency).toBe(9.26);
      expect(result.timeSavedMinutes).toBeGreaterThan(0);
      expect(result.fuelSavedLiters).toBeGreaterThan(0);
      expect(result.co2SavedKg).toBeGreaterThan(0);
    });

    it('calculates intermediate fare from Yaşma to Quba with Cash/Card standard rate', () => {
      const result = calculateTollFare(yashma, quba, 'passenger_light', 'cash_card', 'AZN');
      // Distance: 160 - 45 = 115 km
      expect(result.distanceKm).toBe(115);
      // Gross: 115 * 0.07 = 8.05 AZN
      expect(result.grossFareAzn).toBe(8.05);
      // 0% discount
      expect(result.discountAmountAzn).toBe(0);
      expect(result.netFareAzn).toBe(8.05);
    });

    it('calculates reverse direction (Samur to Yaşma) identically', () => {
      const forward = calculateTollFare(yashma, samur, 'passenger_light', 'qr_epass', 'AZN');
      const backward = calculateTollFare(samur, yashma, 'passenger_light', 'qr_epass', 'AZN');
      expect(backward.distanceKm).toBe(forward.distanceKm);
      expect(backward.grossFareAzn).toBe(forward.grossFareAzn);
      expect(backward.netFareAzn).toBe(forward.netFareAzn);
    });

    it('handles zero distance when entry and exit plaza are identical', () => {
      const result = calculateTollFare(yashma, yashma, 'passenger_light', 'transponder_rfid', 'AZN');
      expect(result.distanceKm).toBe(0);
      expect(result.grossFareAzn).toBe(0);
      expect(result.netFareAzn).toBe(0);
      expect(result.estimatedDurationMinutes).toBe(0);
      expect(result.timeSavedMinutes).toBe(0);
    });

    it('converts fare to foreign currencies correctly', () => {
      const resultUsd = calculateTollFare(yashma, quba, 'passenger_light', 'transponder_rfid', 'USD');
      expect(resultUsd.currency).toBe('USD');
      expect(resultUsd.netFareTargetCurrency).toBeGreaterThan(0);
    });

    it('calculates TIR multi-axle freight rate correctly', () => {
      const result = calculateTollFare(yashma, samur, 'heavy_tir_coach', 'cash_card', 'AZN');
      // 147 km * 0.25 AZN/km = 36.75 AZN
      expect(result.grossFareAzn).toBe(36.75);
      expect(result.netFareAzn).toBe(36.75);
    });
  });

  describe('simulateTransponderTopUp', () => {
    it('increases balance and maintains active status', () => {
      const initial = { ...MOCK_TRANSPONDER_ACCOUNT, balanceAzn: 10.00, status: 'active' as const };
      const updated = simulateTransponderTopUp(initial, 20);
      expect(updated.balanceAzn).toBe(30.00);
      expect(updated.status).toBe('active');
    });

    it('recovers status from low_balance to active when new balance is at least 5 AZN', () => {
      const initial = { ...MOCK_TRANSPONDER_ACCOUNT, balanceAzn: 2.00, status: 'low_balance' as const };
      const updated = simulateTransponderTopUp(initial, 10);
      expect(updated.balanceAzn).toBe(12.00);
      expect(updated.status).toBe('active');
    });

    it('handles negative or zero top-up gracefully', () => {
      const initial = { ...MOCK_TRANSPONDER_ACCOUNT, balanceAzn: 15.00 };
      const updated = simulateTransponderTopUp(initial, -5);
      expect(updated.balanceAzn).toBe(15.00);
    });
  });

  describe('simulateGatePassage', () => {
    it('successfully permits passage and deducts fare when balance is sufficient', () => {
      const initial = { ...MOCK_TRANSPONDER_ACCOUNT, balanceAzn: 25.00, status: 'active' as const };
      const outcome = simulateGatePassage(initial, 9.26);
      expect(outcome.success).toBe(true);
      expect(outcome.updatedAccount.balanceAzn).toBe(15.74);
      expect(outcome.updatedAccount.status).toBe('active');
      expect(outcome.message).toContain('Turniket açıldı');
    });

    it('marks status as low_balance when remaining balance drops below 5 AZN', () => {
      const initial = { ...MOCK_TRANSPONDER_ACCOUNT, balanceAzn: 10.00, status: 'active' as const };
      const outcome = simulateGatePassage(initial, 7.00);
      expect(outcome.success).toBe(true);
      expect(outcome.updatedAccount.balanceAzn).toBe(3.00);
      expect(outcome.updatedAccount.status).toBe('low_balance');
    });

    it('refuses passage when balance is insufficient', () => {
      const initial = { ...MOCK_TRANSPONDER_ACCOUNT, balanceAzn: 4.00, status: 'low_balance' as const };
      const outcome = simulateGatePassage(initial, 10.00);
      expect(outcome.success).toBe(false);
      expect(outcome.updatedAccount.balanceAzn).toBe(4.00);
      expect(outcome.message).toContain('Balansda kifayət qədər vəsait yoxdur');
    });

    it('refuses passage when account is suspended', () => {
      const suspended = { ...MOCK_TRANSPONDER_ACCOUNT, status: 'suspended' as const };
      const outcome = simulateGatePassage(suspended, 5.00);
      expect(outcome.success).toBe(false);
      expect(outcome.message).toContain('bloka alınıb');
    });
  });

  describe('generateTollReceipt', () => {
    it('creates authentic receipt with security barcode and correct timestamps', () => {
      const calc = calculateTollFare(yashma, quba, 'passenger_light', 'transponder_rfid', 'AZN');
      const receipt = generateTollReceipt(calc, '99-NN-101', 'AAYDA-RFID-99142');

      expect(receipt.receiptNumber).toMatch(/^AAYDA-M1-2026-\d{5}$/);
      expect(receipt.barcode).toBe(`*${receipt.receiptNumber}*`);
      expect(receipt.securityHash).toContain('AAYDA-SHA256-');
      expect(receipt.entryPlazaName).toBe(yashma.name);
      expect(receipt.exitPlazaName).toBe(quba.name);
      expect(receipt.distanceKm).toBe(115);
      expect(receipt.vehiclePlate).toBe('99-NN-101');
      expect(receipt.transponderId).toBe('AAYDA-RFID-99142');
      expect(receipt.operatorName).toContain('AAYDA');
    });
  });

  describe('Localization Display Names', () => {
    it('returns localized vehicle category strings', () => {
      expect(getVehicleCategoryDisplayName('passenger_light', 'az')).toContain('1-ci Kateqoriya');
      expect(getVehicleCategoryDisplayName('passenger_light', 'en')).toContain('Category 1');
      expect(getVehicleCategoryDisplayName('passenger_light', 'ru')).toContain('Категория 1');
    });

    it('returns localized payment method strings', () => {
      expect(getPaymentMethodDisplayName('transponder_rfid', 'az')).toContain('RFID E-Toll FastPass');
      expect(getPaymentMethodDisplayName('qr_epass', 'en')).toContain('Mobile QR E-Pass');
      expect(getPaymentMethodDisplayName('cash_card', 'ru')).toContain('Наличные / Банковская карта');
    });
  });
});

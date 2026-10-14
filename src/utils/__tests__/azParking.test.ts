import { describe, it, expect } from 'vitest';
import {
  ZONE_HOURLY_RATES,
  calculateParkingTariff,
  generateSmsParkingCommand,
  calculateOccupancyPercentage,
  getOccupancyStatus,
  checkResidentPermitEligibility,
  generateParkingTicketReceipt,
} from '../azParking';

describe('azParking calculation & tariff engine', () => {
  it('defines correct statutory hourly rates for all 4 zones', () => {
    expect(ZONE_HOURLY_RATES.zone1_center).toBe(1.0);
    expect(ZONE_HOURLY_RATES.zone2_inner).toBe(0.7);
    expect(ZONE_HOURLY_RATES.zone3_intermediate).toBe(0.4);
    expect(ZONE_HOURLY_RATES.zone4_outer).toBe(0.2);
  });

  describe('calculateParkingTariff', () => {
    it('applies statutory 15-minute grace period free of charge', () => {
      const result10m = calculateParkingTariff({
        zone: 'zone1_center',
        durationMinutes: 10,
      });
      expect(result10m.isGracePeriodFree).toBe(true);
      expect(result10m.chargeableMinutes).toBe(0);
      expect(result10m.totalAmountAzn).toBe(0);

      const result15m = calculateParkingTariff({
        zone: 'zone1_center',
        durationMinutes: 15,
      });
      expect(result15m.isGracePeriodFree).toBe(true);
      expect(result15m.totalAmountAzn).toBe(0);
    });

    it('calculates regular tariffs for durations longer than 15 minutes', () => {
      // 1 hour in Zone 1 = 1.00 AZN
      const resZ1_1h = calculateParkingTariff({
        zone: 'zone1_center',
        durationMinutes: 60,
      });
      expect(resZ1_1h.isGracePeriodFree).toBe(false);
      expect(resZ1_1h.totalAmountAzn).toBe(1.0);
      expect(resZ1_1h.chargeableMinutes).toBe(60);

      // 2 hours in Zone 2 = 1.40 AZN
      const resZ2_2h = calculateParkingTariff({
        zone: 'zone2_inner',
        durationMinutes: 120,
      });
      expect(resZ2_2h.totalAmountAzn).toBe(1.4);

      // 3 hours in Zone 3 = 1.20 AZN
      const resZ3_3h = calculateParkingTariff({
        zone: 'zone3_intermediate',
        durationMinutes: 180,
      });
      expect(resZ3_3h.totalAmountAzn).toBe(1.2);

      // 5 hours in Zone 4 = 1.00 AZN
      const resZ4_5h = calculateParkingTariff({
        zone: 'zone4_outer',
        durationMinutes: 300,
      });
      expect(resZ4_5h.totalAmountAzn).toBe(1.0);
    });

    it('exempts parking on Sundays (100% free)', () => {
      const result = calculateParkingTariff({
        zone: 'zone1_center',
        durationMinutes: 180,
        isSunday: true,
      });
      expect(result.isSundayFree).toBe(true);
      expect(result.totalAmountAzn).toBe(0);
      expect(result.discountAzn).toBe(3.0);
    });

    it('exempts parking during night hours 22:00 - 07:00 (100% free)', () => {
      const result = calculateParkingTariff({
        zone: 'zone1_center',
        durationMinutes: 120,
        isNightWindow: true,
      });
      expect(result.isNightFree).toBe(true);
      expect(result.totalAmountAzn).toBe(0);
      expect(result.discountAzn).toBe(2.0);
    });

    it('exempts electric vehicles (EV) under green mobility incentive', () => {
      const result = calculateParkingTariff({
        zone: 'zone1_center',
        durationMinutes: 240,
        isElectricVehicle: true,
      });
      expect(result.isEvExempt).toBe(true);
      expect(result.totalAmountAzn).toBe(0);
      expect(result.discountAzn).toBe(4.0);
    });

    it('exempts residents with valid Fərdi Sakin Talonu', () => {
      const result = calculateParkingTariff({
        zone: 'zone2_inner',
        durationMinutes: 300,
        hasResidentPermit: true,
      });
      expect(result.isResidentExempt).toBe(true);
      expect(result.totalAmountAzn).toBe(0);
    });

    it('supports multi-currency conversion to USD and EUR', () => {
      const resUsd = calculateParkingTariff({
        zone: 'zone1_center',
        durationMinutes: 60,
        currency: 'USD',
      });
      expect(resUsd.currency).toBe('USD');
      expect(resUsd.totalAmountAzn).toBe(1.0);
      expect(resUsd.convertedTotal).toBeCloseTo(1 / 1.7, 2);

      const resEur = calculateParkingTariff({
        zone: 'zone1_center',
        durationMinutes: 60,
        currency: 'EUR',
      });
      expect(resEur.currency).toBe('EUR');
      expect(resEur.convertedTotal).toBeCloseTo(1 / 1.85, 2);
    });
  });

  describe('generateSmsParkingCommand', () => {
    it('generates standard AzParking shortcode 1181 SMS command', () => {
      const command = generateSmsParkingCommand('99-AA-999', '1001', 2);
      expect(command).toBe('99-AA-999 1001 2');
    });

    it('cleanses whitespace and bounds hours between 1 and 24', () => {
      const command = generateSmsParkingCommand('  77-xx-123  ', ' 2001 ', 0);
      expect(command).toBe('77-XX-123 2001 1');

      const maxCommand = generateSmsParkingCommand('90-AB-456', '3001', 48);
      expect(maxCommand).toBe('90-AB-456 3001 24');
    });
  });

  describe('calculateOccupancyPercentage & getOccupancyStatus', () => {
    it('calculates occupancy percentage correctly', () => {
      expect(calculateOccupancyPercentage(50, 100)).toBe(50);
      expect(calculateOccupancyPercentage(90, 100)).toBe(90);
      expect(calculateOccupancyPercentage(0, 100)).toBe(0);
      expect(calculateOccupancyPercentage(10, 0)).toBe(0);
    });

    it('classifies occupancy status into appropriate labels and colors', () => {
      const high = getOccupancyStatus(95);
      expect(high.label).toBe('Demək olar doludur');

      const med = getOccupancyStatus(75);
      expect(med.label).toBe('Məhdud yerlər');

      const low = getOccupancyStatus(30);
      expect(low.label).toBe('Boş yerlər çoxdur');
    });
  });

  describe('checkResidentPermitEligibility', () => {
    it('rejects short or empty address', () => {
      const res = checkResidentPermitEligibility('', '99-AA-999');
      expect(res.eligible).toBe(false);
      expect(res.radiusMeters).toBe(0);
    });

    it('rejects invalid license plate', () => {
      const res = checkResidentPermitEligibility('Nizami küçəsi 54', '1');
      expect(res.eligible).toBe(false);
    });

    it('validates legitimate resident application with 100m radius entitlement', () => {
      const res = checkResidentPermitEligibility('Nizami küçəsi 54, mənzil 12', '99-AA-999');
      expect(res.eligible).toBe(true);
      expect(res.radiusMeters).toBe(100);
    });
  });

  describe('generateParkingTicketReceipt', () => {
    it('generates an authentic e-ticket with valid identifiers and timestamps', () => {
      const fixedDate = new Date('2026-10-14T10:00:00');
      const receipt = generateParkingTicketReceipt({
        lotName: 'Fəvvarələr Meydanı',
        zoneCode: '1001',
        street: 'Nizami küç. 48',
        plateNumber: '99-AA-999',
        durationMinutes: 60,
        amountAzn: 1.0,
        currency: 'AZN',
        paymentMethod: 'azparking_app',
        checkInDate: fixedDate,
      });

      expect(receipt.ticketId).toContain('AZPARK-2026-99AA999');
      expect(receipt.zoneCode).toBe('1001');
      expect(receipt.amountPaidAzn).toBe(1.0);
      expect(receipt.paymentMethod).toBe('azparking_app');
      expect(receipt.barcode).toBeDefined();
      expect(receipt.verificationCode).toBeDefined();
    });
  });
});

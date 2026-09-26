import { describe, it, expect } from 'vitest';
import { isValidVinFormat, checkOdometerRollbackRisk, generateVinReport } from '../vinHistory';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('VIN History & Odometer Verification Engine', () => {
  describe('isValidVinFormat', () => {
    it('accepts valid 17-character VINs', () => {
      expect(isValidVinFormat('WBA5A7C50JB192841')).toBe(true);
      expect(isValidVinFormat('4T1B11HK5LU821943')).toBe(true);
    });

    it('rejects VINs with invalid length', () => {
      expect(isValidVinFormat('12345')).toBe(false);
      expect(isValidVinFormat('WBA5A7C50JB1928419999')).toBe(false);
    });

    it('rejects VINs containing prohibited characters I, O, Q', () => {
      expect(isValidVinFormat('WBAIA7C50JB192841')).toBe(false); // contains 'I'
      expect(isValidVinFormat('WBAOA7C50JB192841')).toBe(false); // contains 'O'
      expect(isValidVinFormat('WBAQA7C50JB192841')).toBe(false); // contains 'Q'
    });
  });

  describe('checkOdometerRollbackRisk', () => {
    it('confirms consistent increasing odometer readings as safe', () => {
      const readings = [
        { date: '2021-01-01', mileageKm: 10000, source: 'Check 1' },
        { date: '2022-01-01', mileageKm: 25000, source: 'Check 2' },
        { date: '2023-01-01', mileageKm: 42000, source: 'Check 3' },
      ];

      const result = checkOdometerRollbackRisk(readings);
      expect(result.isRollbackDetected).toBe(false);
    });

    it('detects mileage rollback anomalies', () => {
      const suspiciousReadings = [
        { date: '2021-01-01', mileageKm: 50000, source: 'Diler Baxış' },
        { date: '2022-01-01', mileageKm: 85000, source: 'DYP Baxış' },
        { date: '2023-01-01', mileageKm: 45000, source: 'Satış Öncesi' }, // Rollback!
      ];

      const result = checkOdometerRollbackRisk(suspiciousReadings);
      expect(result.isRollbackDetected).toBe(true);
      expect(result.discrepancyText).toContain('85000');
    });
  });

  describe('generateVinReport', () => {
    it('generates a full verified report from vehicle data', () => {
      const car = MOCK_VEHICLES[0];
      const report = generateVinReport(car);

      expect(report.vin).toBe(car.vin);
      expect(report.vehicleTitle).toBe(car.title);
      expect(report.manufactureYear).toBe(car.year);
      expect(report.odometerReadings.length).toBeGreaterThanOrEqual(3);
      expect(report.serviceHistory.length).toBeGreaterThan(0);
      expect(report.overallStatus).toBe('clean');
    });
  });
});

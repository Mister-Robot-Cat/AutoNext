import { describe, it, expect } from 'vitest';
import {
  classifyLicensePlate,
  calculateRegistrationDuties,
  calculateDocumentReadiness,
  generateRegistrationAppointment,
} from '../registration';
import { Vehicle } from '../../types/vehicle';
import { DocumentChecklistStatus } from '../../types/registration';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

const mockSampleCar: Vehicle = {
  ...MOCK_VEHICLES[0],
  engineVolumeLiters: 2.5,
  fuelType: 'petrol',
};

const mockEvCar: Vehicle = {
  ...mockSampleCar,
  id: 'car-test-ev',
  make: 'Tesla',
  model: 'Model 3',
  fuelType: 'electric',
  engineVolumeLiters: 0,
};

describe('Vehicle Registration & License Plate Engine', () => {
  describe('classifyLicensePlate', () => {
    it('classifies standard random numbers correctly with 0 AZN surcharge', () => {
      const plate = classifyLicensePlate('99', 'AZ', '428');
      expect(plate.fullPlate).toBe('99-AZ-428');
      expect(plate.tier).toBe('standard');
      expect(plate.surchargeAzn).toBe(0);
      expect(plate.tierNameAz).toContain('Standart');
    });

    it('classifies mirror numbers (e.g. 050, 707) correctly with 500 AZN surcharge', () => {
      const plate1 = classifyLicensePlate('10', 'AB', '050');
      expect(plate1.tier).toBe('mirror');
      expect(plate1.surchargeAzn).toBe(500);

      const plate2 = classifyLicensePlate('77', 'XY', '707');
      expect(plate2.tier).toBe('mirror');
      expect(plate2.surchargeAzn).toBe(500);
    });

    it('classifies double round hundreds (e.g. 500, 700) with 1000 AZN surcharge', () => {
      const plate = classifyLicensePlate('90', 'RT', '500');
      expect(plate.tier).toBe('double');
      expect(plate.surchargeAzn).toBe(1000);
      expect(plate.tierNameAz).toContain('Dairəvi Yüzlük');
    });

    it('classifies triple identical numbers (e.g. 555, 888) with 2000 AZN surcharge', () => {
      const plate = classifyLicensePlate('99', 'BB', '555');
      expect(plate.tier).toBe('triple');
      expect(plate.surchargeAzn).toBe(2000);
      expect(plate.tierNameAz).toContain('Tripl');
    });

    it('classifies prestige gold singles (001-009 or 777) with different letters as prestige_gold', () => {
      const plate = classifyLicensePlate('77', 'AB', '007');
      expect(plate.tier).toBe('prestige_gold');
      expect(plate.surchargeAzn).toBe(3500);
      expect(plate.tierNameAz).toContain('Prestic Qızıl');
    });

    it('classifies prestige gold numbers with matching twin letters as elite_twin with 5000 AZN surcharge', () => {
      const plate = classifyLicensePlate('77', 'XX', '777');
      expect(plate.tier).toBe('elite_twin');
      expect(plate.surchargeAzn).toBe(5000);
      expect(plate.tierNameAz).toContain('Elit Qoşa Hərf');
    });

    it('sanitizes input and pads short values gracefully', () => {
      const plate = classifyLicensePlate('10', 'a', '7');
      expect(plate.regionCode).toBe('10');
      expect(plate.letters).toBe('AA');
      expect(plate.numbers).toBe('007');
      expect(plate.tier).toBe('elite_twin'); // AA + 007
    });
  });

  describe('calculateRegistrationDuties', () => {
    it('calculates transfer duties when keeping existing plate', () => {
      const plateDetails = classifyLicensePlate('99', 'AZ', '428');
      const duties = calculateRegistrationDuties(mockSampleCar, 'keep_current', plateDetails, false);

      expect(duties.certificateFeeAzn).toBe(30);
      expect(duties.urgentProcessingSurchargeAzn).toBe(0);
      expect(duties.plateFeeAzn).toBe(0);
      expect(duties.engineDisplacementFeeAzn).toBe(35); // 2.5L = 35 AZN
      expect(duties.isGreenExemptionApplied).toBe(false);
      expect(duties.technicalCheckTallyAzn).toBe(10);
      expect(duties.notaryArchiveRecordAzn).toBe(11);
      expect(duties.bankCommissionAzn).toBe(2);

      const expectedTotal = 30 + 0 + 0 + 35 + 10 + 11 + 2; // 88 AZN
      expect(duties.totalAzn).toBe(expectedTotal);
      expect(duties.totalUsd).toBe(Math.round(expectedTotal / 1.70));
    });

    it('adds standard plate fee when ordering new standard plate', () => {
      const plateDetails = classifyLicensePlate('99', 'AZ', '428');
      const duties = calculateRegistrationDuties(mockSampleCar, 'new_standard', plateDetails, false);

      expect(duties.plateFeeAzn).toBe(35);
      expect(duties.totalAzn).toBe(88 + 35);
    });

    it('adds VIP plate surcharge when ordering VIP combination plate', () => {
      const plateDetails = classifyLicensePlate('77', 'XX', '777'); // 5000 AZN surcharge
      const duties = calculateRegistrationDuties(mockSampleCar, 'vip_combination', plateDetails, false);

      expect(duties.plateFeeAzn).toBe(35 + 5000);
      expect(duties.totalAzn).toBe(88 + 35 + 5000);
    });

    it('includes urgent processing surcharge when urgent mode is requested', () => {
      const plateDetails = classifyLicensePlate('99', 'AZ', '428');
      const duties = calculateRegistrationDuties(mockSampleCar, 'new_standard', plateDetails, true);

      expect(duties.urgentProcessingSurchargeAzn).toBe(20);
      expect(duties.totalAzn).toBe(88 + 35 + 20);
    });

    it('applies 100% green energy engine fee exemption for electric vehicles', () => {
      const plateDetails = classifyLicensePlate('99', 'AZ', '428');
      const duties = calculateRegistrationDuties(mockEvCar, 'new_standard', plateDetails, false);

      expect(duties.isGreenExemptionApplied).toBe(true);
      expect(duties.engineDisplacementFeeAzn).toBe(0);
      expect(duties.totalAzn).toBe(30 + 0 + 35 + 0 + 10 + 11 + 2); // 88 AZN
    });

    it('calculates engine displacement tiers correctly across different engine capacities', () => {
      const smallCar: Vehicle = { ...mockSampleCar, engineVolumeLiters: 1.4 };
      const mediumCar: Vehicle = { ...mockSampleCar, engineVolumeLiters: 3.0 };
      const largeCar: Vehicle = { ...mockSampleCar, engineVolumeLiters: 4.2 };
      const monsterCar: Vehicle = { ...mockSampleCar, engineVolumeLiters: 5.5 };
      const plateDetails = classifyLicensePlate('99', 'AZ', '428');

      expect(calculateRegistrationDuties(smallCar, 'keep_current', plateDetails).engineDisplacementFeeAzn).toBe(20);
      expect(calculateRegistrationDuties(mediumCar, 'keep_current', plateDetails).engineDisplacementFeeAzn).toBe(60);
      expect(calculateRegistrationDuties(largeCar, 'keep_current', plateDetails).engineDisplacementFeeAzn).toBe(100);
      expect(calculateRegistrationDuties(monsterCar, 'keep_current', plateDetails).engineDisplacementFeeAzn).toBe(150);
    });
  });

  describe('calculateDocumentReadiness', () => {
    it('calculates correct readiness count and percentage', () => {
      const partialStatus: DocumentChecklistStatus = {
        techPassportOriginal: true,
        purchaseContract: true,
        buyerIdCard: true,
        compulsoryInsurance: false,
        inspectionTally: false,
        dutyReceipt: false,
      };

      const readiness = calculateDocumentReadiness(partialStatus);
      expect(readiness.completedCount).toBe(3);
      expect(readiness.totalCount).toBe(6);
      expect(readiness.percentage).toBe(50);
      expect(readiness.isFullyReady).toBe(false);
    });

    it('returns 100% and isFullyReady=true when all items are checked', () => {
      const fullStatus: DocumentChecklistStatus = {
        techPassportOriginal: true,
        purchaseContract: true,
        buyerIdCard: true,
        compulsoryInsurance: true,
        inspectionTally: true,
        dutyReceipt: true,
      };

      const readiness = calculateDocumentReadiness(fullStatus);
      expect(readiness.completedCount).toBe(6);
      expect(readiness.percentage).toBe(100);
      expect(readiness.isFullyReady).toBe(true);
    });
  });

  describe('generateRegistrationAppointment', () => {
    it('creates a complete appointment object with voucher ID and QR data', () => {
      const appointment = generateRegistrationAppointment(
        mockSampleCar,
        'Nurlan Əliyev',
        '6ABCD12',
        '+994 50 999-88-77',
        'div-baku-zabrat',
        '2026-10-20',
        '11:00',
        'new_standard',
        '99-AZ-777',
        123,
        'AZN',
        false
      );

      expect(appointment.voucherId).toMatch(/^BDYP-2026-\d{5}$/);
      expect(appointment.buyerFullName).toBe('Nurlan Əliyev');
      expect(appointment.buyerFinCode).toBe('6ABCD12');
      expect(appointment.appointmentTime).toBe('11:00');
      expect(appointment.totalFeeAzn).toBe(123);
      expect(appointment.qrCodeData).toContain('https://asanpay.az/bdyp/reg?v=');
      expect(appointment.targetPlate).toBe('99-AZ-777');
    });
  });
});

import { describe, it, expect } from 'vitest';
import {
  CURRENT_REFERENCE_YEAR,
  MAX_NEW_TAXI_AGE_YEARS,
  MAX_GRANDFATHERED_TAXI_AGE_YEARS,
  STATUTORY_FEES,
  RETROFIT_COSTS,
  RIDE_HAILING_PLATFORMS,
  evaluateTaxiCompliance,
  calculateAggregatorProfit,
  generateTaxiPassNumber,
  generateSecurityChecksum,
  createAynaTaxiPass,
  createTrainingBooking,
  convertFromAzn
} from '../taxiCompliance';

describe('taxiCompliance Utility Engine', () => {
  describe('convertFromAzn', () => {
    it('returns exact amount for AZN', () => {
      expect(convertFromAzn(100, 'AZN')).toBe(100);
    });

    it('correctly converts AZN to USD and EUR', () => {
      expect(convertFromAzn(100, 'USD')).toBe(58.82);
      expect(convertFromAzn(100, 'EUR')).toBe(54.35);
    });
  });

  describe('evaluateTaxiCompliance', () => {
    it('evaluates a modern white hybrid as eligible_new with high score', () => {
      const result = evaluateTaxiCompliance({
        year: 2022,
        color: 'white',
        fuelType: 'hybrid',
        equipmentState: {
          air_conditioning: true,
          abs: true,
          airbags: true,
          dual_dashcam: true,
          pos_terminal: true,
          taxi_roof_lamp: true,
          checker_decals: true
        }
      });

      expect(result.status).toBe('eligible_new');
      expect(result.isAgeCompliant).toBe(true);
      expect(result.isColorCompliant).toBe(true);
      expect(result.isEcoCompliant).toBe(true);
      expect(result.missingEquipmentCount).toBe(0);
      expect(result.retrofitCostAzn).toBe(0);
      expect(result.complianceScore).toBeGreaterThanOrEqual(95);
    });

    it('evaluates a 10-year old car as eligible_grandfathered under 15-year rule', () => {
      const result = evaluateTaxiCompliance({
        year: CURRENT_REFERENCE_YEAR - 10,
        color: 'white',
        fuelType: 'petrol'
      });

      expect(result.status).toBe('eligible_grandfathered');
      expect(result.isAgeCompliant).toBe(false);
      expect(result.checklist.find(c => c.id === 'chk_age_8')?.isMet).toBe(false);
    });

    it('evaluates a vehicle older than 15 years as non_compliant', () => {
      const result = evaluateTaxiCompliance({
        year: CURRENT_REFERENCE_YEAR - 16,
        color: 'white',
        fuelType: 'petrol'
      });

      expect(result.status).toBe('non_compliant');
      expect(result.complianceScore).toBeLessThan(50);
      expect(result.verdictMessage.az).toContain('taksi kimi qeydiyyata alına bilməz');
    });

    it('adds wrapping budget when vehicle color is not white or red', () => {
      const result = evaluateTaxiCompliance({
        year: 2021,
        color: 'silver',
        fuelType: 'petrol',
        equipmentState: {
          air_conditioning: true,
          abs: true,
          airbags: true,
          dual_dashcam: true,
          pos_terminal: true,
          taxi_roof_lamp: true,
          checker_decals: true
        }
      });

      expect(result.isColorCompliant).toBe(false);
      expect(result.retrofitCostAzn).toBe(650); // Color wrapping cost
    });

    it('correctly calculates retrofit costs for missing equipment', () => {
      const result = evaluateTaxiCompliance({
        year: 2021,
        color: 'white',
        fuelType: 'hybrid',
        equipmentState: {
          air_conditioning: true,
          abs: true,
          airbags: true,
          dual_dashcam: false, // 180
          pos_terminal: false, // 120
          taxi_roof_lamp: false, // 45
          checker_decals: false // 35
        }
      });

      expect(result.missingEquipmentCount).toBe(4);
      expect(result.retrofitCostAzn).toBe(180 + 120 + 45 + 35);
    });
  });

  describe('calculateAggregatorProfit', () => {
    it('calculates daily and monthly net earnings for Bolt platform', () => {
      const result = calculateAggregatorProfit({
        platform: 'bolt',
        dailyGrossAzn: 150,
        workingDaysPerMonth: 25,
        dailyKm: 150,
        fuelType: 'hybrid',
        dailyTrips: 18
      });

      expect(result.dailyGrossAzn).toBe(150);
      expect(result.monthlyGrossAzn).toBe(3750);
      // Bolt commission is 19%
      expect(result.dailyCommissionAzn).toBe(28.5);
      expect(result.monthlyCommissionAzn).toBe(712.5);
      expect(result.monthlyTripCount).toBe(450);
      expect(result.monthlyNetAzn).toBeGreaterThan(0);
      expect(result.dailyNetAzn).toBeGreaterThan(0);
      expect(result.hourlyWageAzn).toBeGreaterThan(0);
    });

    it('demonstrates positive eco savings for EV compared to petrol', () => {
      const result = calculateAggregatorProfit({
        platform: 'yango',
        dailyGrossAzn: 150,
        workingDaysPerMonth: 26,
        dailyKm: 200,
        fuelType: 'ev',
        dailyTrips: 20
      });

      expect(result.ecoSavingVsPetrolMonthAzn).toBeGreaterThan(0);
    });

    it('handles 0% commission for independent taxi drivers', () => {
      const result = calculateAggregatorProfit({
        platform: 'independent',
        dailyGrossAzn: 120,
        workingDaysPerMonth: 20,
        dailyKm: 100,
        fuelType: 'petrol',
        dailyTrips: 12
      });

      expect(result.dailyCommissionAzn).toBe(0);
      expect(result.monthlyCommissionAzn).toBe(0);
    });
  });

  describe('generateTaxiPassNumber & Security', () => {
    it('generates pass number matching AYNA format', () => {
      const passNumber = generateTaxiPassNumber();
      expect(passNumber).toMatch(/^AYNA-TX-2026-\d{5}$/);
    });

    it('generates consistent security checksum', () => {
      const checksum = generateSecurityChecksum('AYNA-TX-2026-11223', '99-TX-841');
      expect(checksum).toMatch(/^0x[0-9A-F]{8}$/);
    });
  });

  describe('createAynaTaxiPass', () => {
    it('creates a 1-year valid active taxi pass', () => {
      const pass = createAynaTaxiPass({
        plateNumber: '99-TX-841',
        vin: 'JTDKN3DU5A1829304',
        vehicleMake: 'Toyota',
        vehicleModel: 'Prius',
        vehicleYear: 2021,
        vehicleColor: 'Ağ',
        fuelType: 'hybrid',
        validityYears: 1
      });

      expect(pass.status).toBe('active');
      expect(pass.validityYears).toBe(1);
      expect(pass.stateDutyAzn).toBe(STATUTORY_FEES.vehiclePass1YearAzn);
      expect(pass.qrVerificationUrl).toContain('ayna.gov.az');
    });

    it('creates a 3-year pass with 65 AZN duty', () => {
      const pass = createAynaTaxiPass({
        plateNumber: '77-EV-204',
        vin: 'LC0CE4EC1P0019283',
        vehicleMake: 'BYD',
        vehicleModel: 'Song Plus EV',
        vehicleYear: 2023,
        vehicleColor: 'Ağ',
        fuelType: 'ev',
        validityYears: 3
      });

      expect(pass.validityYears).toBe(3);
      expect(pass.stateDutyAzn).toBe(STATUTORY_FEES.vehiclePass3YearsAzn);
    });
  });

  describe('createTrainingBooking', () => {
    it('creates an appointment booking with confirmation code', () => {
      const booking = createTrainingBooking({
        centerId: 'ayna-heydar-aliyev',
        centerName: 'AYNA Baş İmtahan Mərkəzi',
        applicantName: 'Tural Məmmədov',
        applicantFin: '5KLT891',
        applicantPhone: '+994 50 123 45 67',
        date: '2026-04-10',
        timeSlot: '11:00',
        service: 'Taksi Sürücüsü Xüsusi Təlimi'
      });

      expect(booking.bookingId).toMatch(/^AYNA-BK-\d{4}$/);
      expect(booking.confirmationCode).toMatch(/^BRX-[A-Z0-9]+$/);
      expect(booking.applicantFin).toBe('5KLT891');
    });
  });
});

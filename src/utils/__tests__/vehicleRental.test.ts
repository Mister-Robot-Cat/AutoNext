import { describe, it, expect } from 'vitest';
import {
  calculateRentalPrice,
  getDurationDiscountPercentage,
  calculateIntercityDropoffFee,
  generateRentalContractNumber,
  generateRentalSecurityHash,
  createRentalContract,
  verifyRentalContractNumber
} from '../vehicleRental';
import {
  RENTAL_FLEET_VEHICLES,
  RENTAL_STATIONS,
  RENTAL_INSURANCE_TIERS,
  RENTAL_ADDONS,
  MOCK_ACTIVE_RENTAL_CONTRACTS
} from '../../data/mockRentalData';

describe('vehicleRental utility', () => {
  describe('getDurationDiscountPercentage', () => {
    it('returns 0% for 1-3 days', () => {
      expect(getDurationDiscountPercentage(1)).toBe(0);
      expect(getDurationDiscountPercentage(3)).toBe(0);
    });

    it('returns 10% for 4-7 days', () => {
      expect(getDurationDiscountPercentage(4)).toBe(10);
      expect(getDurationDiscountPercentage(7)).toBe(10);
    });

    it('returns 18% for 8-14 days', () => {
      expect(getDurationDiscountPercentage(8)).toBe(18);
      expect(getDurationDiscountPercentage(14)).toBe(18);
    });

    it('returns 25% for 15+ days', () => {
      expect(getDurationDiscountPercentage(15)).toBe(25);
      expect(getDurationDiscountPercentage(30)).toBe(25);
    });
  });

  describe('calculateIntercityDropoffFee', () => {
    const bakuStation = RENTAL_STATIONS.find((s) => s.city === 'Bakı')!;
    const bakuStation2 = RENTAL_STATIONS.find((s) => s.city === 'Bakı' && s.id !== bakuStation.id)!;
    const ganjaStation = RENTAL_STATIONS.find((s) => s.city === 'Gəncə')!;
    const gabalaStation = RENTAL_STATIONS.find((s) => s.city === 'Qəbələ')!;

    it('returns 0 for dropoff in the same city', () => {
      expect(calculateIntercityDropoffFee(bakuStation, bakuStation2)).toBe(0);
    });

    it('returns 80 AZN for Baku to Ganja or Ganja to Baku', () => {
      expect(calculateIntercityDropoffFee(bakuStation, ganjaStation)).toBe(80);
      expect(calculateIntercityDropoffFee(ganjaStation, bakuStation)).toBe(80);
    });

    it('returns 60 AZN for Baku to Qabala or Qabala to Baku', () => {
      expect(calculateIntercityDropoffFee(bakuStation, gabalaStation)).toBe(60);
      expect(calculateIntercityDropoffFee(gabalaStation, bakuStation)).toBe(60);
    });
  });

  describe('calculateRentalPrice', () => {
    it('calculates standard 3-day rental without discount or addons', () => {
      const result = calculateRentalPrice({
        vehicleId: 'rent-accent', // 65 AZN/day, 350 AZN deposit
        durationDays: 3,
        pickupStationId: 'st-baku-center', // 0 airport fee
        dropoffStationId: 'st-baku-center',
        mileageOption: 'standard', // 250 km/day
        insuranceTierId: 'basic', // 0 AZN/day, 600 deductible, 1.0 deposit mult
        selectedAddonIds: [],
        driverAge: 25,
        drivingExperienceYears: 3,
        currency: 'AZN'
      });

      expect(result.durationDays).toBe(3);
      expect(result.baseDailyRate).toBe(65);
      expect(result.discountPercentage).toBe(0);
      expect(result.discountedDailyRate).toBe(65);
      expect(result.baseRentalTotal).toBe(195); // 65 * 3
      expect(result.durationDiscountAmount).toBe(0);
      expect(result.mileageSurchargeTotal).toBe(0);
      expect(result.includedKmTotal).toBe(750); // 250 * 3
      expect(result.insuranceDailyFee).toBe(0);
      expect(result.addonsTotal).toBe(0);
      expect(result.airportPickupFee).toBe(0);
      expect(result.intercityOneWayFee).toBe(0);
      expect(result.subtotalAzn).toBe(195);
      expect(result.vatAmountAzn).toBe(Math.round(195 * 0.18)); // 35
      expect(result.grandTotalAzn).toBe(195 + 35); // 230
      expect(result.securityDepositAzn).toBe(350);
      expect(result.deductibleAzn).toBe(600);
      expect(result.eligibility.isEligible).toBe(true);
    });

    it('applies duration discount for 7 days (10%) and unlimited mileage (+20 AZN/day)', () => {
      const result = calculateRentalPrice({
        vehicleId: 'rent-camry', // 140 AZN/day, 600 AZN deposit
        durationDays: 7,
        pickupStationId: 'st-baku-center',
        dropoffStationId: 'st-baku-center',
        mileageOption: 'unlimited',
        insuranceTierId: 'basic',
        selectedAddonIds: [],
        driverAge: 26,
        drivingExperienceYears: 4,
        currency: 'AZN'
      });

      expect(result.discountPercentage).toBe(10);
      expect(result.discountedDailyRate).toBe(Math.round(140 * 0.9)); // 126
      expect(result.baseRentalTotal).toBe(126 * 7); // 882
      expect(result.mileageSurchargeTotal).toBe(20 * 7); // 140
      expect(result.includedKmTotal).toBe(-1); // unlimited
      expect(result.subtotalAzn).toBe(882 + 140); // 1022
      expect(result.vatAmountAzn).toBe(Math.round(1022 * 0.18)); // 184
      expect(result.grandTotalAzn).toBe(1022 + 184); // 1206
    });

    it('handles airport surcharge, insurance tiers, and addons', () => {
      const result = calculateRentalPrice({
        vehicleId: 'rent-tucson', // 110 AZN/day, 500 AZN deposit
        durationDays: 4, // 10% discount -> 99 AZN/day
        pickupStationId: 'st-gyd-airport', // 15 AZN airport surcharge
        dropoffStationId: 'st-gyd-airport',
        mileageOption: 'standard',
        insuranceTierId: 'medium', // 20 AZN/day, depositMultiplier: 0.5, deductible: 200
        selectedAddonIds: ['addon-child-seat', 'addon-wifi-gps'], // 10/day + 8/day = 18/day * 4 = 72
        driverAge: 28,
        drivingExperienceYears: 5,
        currency: 'AZN'
      });

      expect(result.baseRentalTotal).toBe(99 * 4); // 396
      expect(result.insuranceTotal).toBe(20 * 4); // 80
      expect(result.addonsTotal).toBe(18 * 4); // 72
      expect(result.airportPickupFee).toBe(15);
      expect(result.securityDepositAzn).toBe(250); // 500 * 0.5
      expect(result.deductibleAzn).toBe(200);
      expect(result.subtotalAzn).toBe(396 + 80 + 72 + 15); // 563
    });

    it('caps security deposit at 100 AZN for premium zero-deductible insurance', () => {
      const result = calculateRentalPrice({
        vehicleId: 'rent-sclass', // 450 AZN/day, 2000 AZN deposit
        durationDays: 2,
        pickupStationId: 'st-baku-center',
        dropoffStationId: 'st-baku-center',
        mileageOption: 'standard',
        insuranceTierId: 'premium', // 35 AZN/day, zero excess
        selectedAddonIds: [],
        driverAge: 30,
        drivingExperienceYears: 6
      });

      expect(result.deductibleAzn).toBe(0);
      expect(result.securityDepositAzn).toBe(100);
    });

    it('evaluates driver age and experience ineligibility with warnings', () => {
      const result = calculateRentalPrice({
        vehicleId: 'rent-sclass', // minAge: 25, minExp: 5
        durationDays: 2,
        pickupStationId: 'st-baku-center',
        dropoffStationId: 'st-baku-center',
        mileageOption: 'standard',
        insuranceTierId: 'basic',
        selectedAddonIds: [],
        driverAge: 22,
        drivingExperienceYears: 2,
        isForeigner: true
      });

      expect(result.eligibility.isEligible).toBe(false);
      expect(result.eligibility.ageRequirementMet).toBe(false);
      expect(result.eligibility.experienceRequirementMet).toBe(false);
      expect(result.eligibility.warnings.length).toBe(3);
    });

    it('converts prices to USD and EUR correctly', () => {
      const result = calculateRentalPrice({
        vehicleId: 'rent-accent',
        durationDays: 2,
        pickupStationId: 'st-baku-center',
        dropoffStationId: 'st-baku-center',
        mileageOption: 'standard',
        insuranceTierId: 'basic',
        selectedAddonIds: [],
        driverAge: 25,
        drivingExperienceYears: 3,
        currency: 'USD'
      });

      expect(result.currencyRates.azn).toBe(result.grandTotalAzn);
      expect(result.currencyRates.usd).toBeGreaterThan(0);
      expect(result.currencyRates.eur).toBeGreaterThan(0);
      expect(result.formattedGrandTotal).toContain('$');
    });
  });

  describe('Contract Generation & Verification', () => {
    it('creates a formal contract with unique number and security hash', () => {
      const contract = createRentalContract(
        {
          vehicleId: 'rent-accent',
          durationDays: 5,
          pickupStationId: 'st-gyd-airport',
          dropoffStationId: 'st-gyd-airport',
          mileageOption: 'standard',
          insuranceTierId: 'medium',
          selectedAddonIds: ['addon-wifi-gps'],
          driverAge: 26,
          drivingExperienceYears: 4
        },
        {
          fullName: 'Nicat Hüseynov',
          finCode: '6D99210',
          driverLicenseNumber: 'AZ-998822',
          documentType: 'id_card',
          phone: '+994 50 123 45 67',
          email: 'nicat@example.az',
          country: 'Azərbaycan'
        },
        'comp-hertz'
      );

      expect(contract.contractNumber).toMatch(/^CAR-RNT-2026-\d{4}$/);
      expect(contract.securityHash.length).toBeGreaterThan(10);
      expect(contract.company.brand).toBe('Hertz');
      expect(contract.vehicle.make).toBe('Hyundai');
      expect(contract.driver.fullName).toBe('Nicat Hüseynov');
      expect(contract.status).toBe('reserved');
      expect(contract.qrVerificationUrl).toContain(contract.contractNumber);
    });

    it('verifies existing mock active contracts', () => {
      const sample = MOCK_ACTIVE_RENTAL_CONTRACTS[0];
      const verified = verifyRentalContractNumber(sample.contractNumber);

      expect(verified.valid).toBe(true);
      expect(verified.contract?.driverFullName).toBe(sample.driverFullName);
    });

    it('synthesizes validation for valid CAR-RNT-2026-XXXX format', () => {
      const verified = verifyRentalContractNumber('CAR-RNT-2026-4499');
      expect(verified.valid).toBe(true);
      expect(verified.contract?.contractNumber).toBe('CAR-RNT-2026-4499');
    });

    it('rejects invalid contract number formats', () => {
      const verified = verifyRentalContractNumber('INVALID-NUM-123');
      expect(verified.valid).toBe(false);
      expect(verified.error).toContain('CAR-RNT-2026-XXXX');
    });
  });
});

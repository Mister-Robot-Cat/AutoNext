import { describe, it, expect } from 'vitest';
import {
  calculateCompulsoryInsurance,
  calculateKaskoQuote,
  calculateInsuranceComparison,
  generateDigitalPolicyCertificate,
  getBonusMalusBadgeData
} from '../insurance';
import { AZERBAIJAN_INSURANCE_COMPANIES } from '../../data/mockInsuranceData';
import { InsuranceInputParams, PolicyApplicationFormData } from '../../types/insurance';
import { Vehicle } from '../../types/vehicle';

describe('Insurance Calculation Engine (utils/insurance)', () => {
  const baseParams: InsuranceInputParams = {
    vehiclePriceAzn: 45000,
    engineVolumeLiters: 2.0,
    fuelType: 'petrol',
    year: 2022,
    bonusMalusClass: 10,
    region: 'baku_sumgayit_absheron',
    driverCategory: 'standard',
    driverAge: 32,
    drivingExperienceYears: 8,
    franchise: 250,
    repairType: 'partner_workshop',
    addons: {
      roadside_assistance: false,
      replacement_vehicle: false,
      no_police_certificate_glass: false,
      driver_passenger_accident: false,
      territory_expansion: false
    }
  };

  describe('calculateCompulsoryInsurance', () => {
    it('calculates base tariff based on engine volume cm3', () => {
      // 1.5L -> 50 AZN
      const res1 = calculateCompulsoryInsurance({ ...baseParams, engineVolumeLiters: 1.4 });
      expect(res1.baseTariffAzn).toBe(50);

      // 2.0L -> 75 AZN
      const res2 = calculateCompulsoryInsurance({ ...baseParams, engineVolumeLiters: 2.0 });
      expect(res2.baseTariffAzn).toBe(75);

      // 2.5L -> 100 AZN
      const res3 = calculateCompulsoryInsurance({ ...baseParams, engineVolumeLiters: 2.5 });
      expect(res3.baseTariffAzn).toBe(100);

      // 3.5L -> 150 AZN
      const res4 = calculateCompulsoryInsurance({ ...baseParams, engineVolumeLiters: 3.5 });
      expect(res4.baseTariffAzn).toBe(150);

      // 5.5L -> 250 AZN
      const res5 = calculateCompulsoryInsurance({ ...baseParams, engineVolumeLiters: 5.5 });
      expect(res5.baseTariffAzn).toBe(250);
    });

    it('sets electric vehicle base tariff to 65 AZN', () => {
      const resEv = calculateCompulsoryInsurance({ ...baseParams, fuelType: 'electric', engineVolumeLiters: 0 });
      expect(resEv.baseTariffAzn).toBe(65);
      expect(resEv.engineFactorDescription).toContain('Elektromobil');
    });

    it('applies Bonus-Malus discount and surcharge properly', () => {
      const bm10 = calculateCompulsoryInsurance({ ...baseParams, bonusMalusClass: 10 });
      expect(bm10.bonusMalusFactor).toBe(1.0);
      expect(bm10.isBonusDiscount).toBe(true);

      const bm20 = calculateCompulsoryInsurance({ ...baseParams, bonusMalusClass: 20 });
      expect(bm20.bonusMalusFactor).toBe(0.5);
      expect(bm20.finalCompulsoryPremiumAzn).toBeLessThan(bm10.finalCompulsoryPremiumAzn);
      expect(bm20.isBonusDiscount).toBe(true);

      const bm1 = calculateCompulsoryInsurance({ ...baseParams, bonusMalusClass: 1 });
      expect(bm1.bonusMalusFactor).toBe(2.45);
      expect(bm1.finalCompulsoryPremiumAzn).toBeGreaterThan(bm10.finalCompulsoryPremiumAzn);
      expect(bm1.isBonusDiscount).toBe(false);
    });

    it('applies regional and driver coefficients', () => {
      const bakuYoung = calculateCompulsoryInsurance({
        ...baseParams,
        region: 'baku_sumgayit_absheron',
        driverCategory: 'young_novice',
        driverAge: 21,
        drivingExperienceYears: 1
      });
      expect(bakuYoung.regionFactor).toBe(1.10);
      expect(bakuYoung.driverFactor).toBe(1.35);

      const regionsExp = calculateCompulsoryInsurance({
        ...baseParams,
        region: 'regions',
        driverCategory: 'experienced',
        driverAge: 45,
        drivingExperienceYears: 20
      });
      expect(regionsExp.regionFactor).toBe(0.95);
      expect(regionsExp.driverFactor).toBe(0.95);
      expect(regionsExp.finalCompulsoryPremiumAzn).toBeLessThan(bakuYoung.finalCompulsoryPremiumAzn);
    });

    it('returns official third party limits of 5000 AZN property and 50000 AZN health', () => {
      const res = calculateCompulsoryInsurance(baseParams);
      expect(res.propertyDamageLimitAzn).toBe(5000);
      expect(res.bodilyInjuryLimitAzn).toBe(50000);
    });
  });

  describe('calculateKaskoQuote', () => {
    const pashaCompany = AZERBAIJAN_INSURANCE_COMPANIES.find(c => c.id === 'pasha')!;

    it('calculates higher premium for higher car valuation', () => {
      const lowVal = calculateKaskoQuote({ ...baseParams, vehiclePriceAzn: 25000 }, pashaCompany, 'standard');
      const highVal = calculateKaskoQuote({ ...baseParams, vehiclePriceAzn: 80000 }, pashaCompany, 'standard');
      expect(highVal.annualPremiumAzn).toBeGreaterThan(lowVal.annualPremiumAzn);
      expect(highVal.insuredValueAzn).toBe(80000);
    });

    it('applies surcharge for official dealer repair vs partner workshop', () => {
      const partner = calculateKaskoQuote({ ...baseParams, repairType: 'partner_workshop' }, pashaCompany, 'standard');
      const official = calculateKaskoQuote({ ...baseParams, repairType: 'official_dealer' }, pashaCompany, 'standard');
      expect(official.annualPremiumAzn).toBeGreaterThan(partner.annualPremiumAzn);
    });

    it('discounts premium when choosing higher franchise (deductible)', () => {
      const f0 = calculateKaskoQuote({ ...baseParams, franchise: 0 }, pashaCompany, 'standard');
      const f250 = calculateKaskoQuote({ ...baseParams, franchise: 250 }, pashaCompany, 'standard');
      const f1000 = calculateKaskoQuote({ ...baseParams, franchise: 1000 }, pashaCompany, 'standard');
      expect(f0.annualPremiumAzn).toBeGreaterThan(f250.annualPremiumAzn);
      expect(f250.annualPremiumAzn).toBeGreaterThan(f1000.annualPremiumAzn);
    });

    it('scales premiums by package tier: eco < standard < vip', () => {
      const eco = calculateKaskoQuote(baseParams, pashaCompany, 'eco');
      const standard = calculateKaskoQuote(baseParams, pashaCompany, 'standard');
      const vip = calculateKaskoQuote(baseParams, pashaCompany, 'vip');

      expect(eco.annualPremiumAzn).toBeLessThan(standard.annualPremiumAzn);
      expect(standard.annualPremiumAzn).toBeLessThan(vip.annualPremiumAzn);
      expect(vip.coveredRisksAz.length).toBeGreaterThan(eco.coveredRisksAz.length);
    });

    it('adds optional add-ons to annual premium', () => {
      const withoutAddons = calculateKaskoQuote(baseParams, pashaCompany, 'standard');
      const withAddons = calculateKaskoQuote({
        ...baseParams,
        addons: {
          ...baseParams.addons,
          roadside_assistance: true,
          replacement_vehicle: true
        }
      }, pashaCompany, 'standard');

      expect(withAddons.addonsCostAzn).toBe(120); // 45 + 75
      expect(withAddons.annualPremiumAzn).toBe(withoutAddons.annualPremiumAzn + 120);
    });

    it('waives roadside assistance and glass add-on fees in VIP tier', () => {
      const vipWithAddons = calculateKaskoQuote({
        ...baseParams,
        addons: {
          ...baseParams.addons,
          roadside_assistance: true,
          no_police_certificate_glass: true
        }
      }, pashaCompany, 'vip');

      expect(vipWithAddons.addonsCostAzn).toBe(0);
    });

    it('computes 12-month interest-free installment', () => {
      const quote = calculateKaskoQuote(baseParams, pashaCompany, 'standard');
      expect(quote.monthlyInstallmentAzn).toBeCloseTo(quote.annualPremiumAzn / 12, 1);
    });
  });

  describe('calculateInsuranceComparison', () => {
    it('compares quotes across all 5 Azerbaijan insurance companies', () => {
      const summary = calculateInsuranceComparison(baseParams, AZERBAIJAN_INSURANCE_COMPANIES, 'standard');
      expect(summary.kaskoQuotes.length).toBe(AZERBAIJAN_INSURANCE_COMPANIES.length);
      expect(summary.cheapestQuote).toBeDefined();
      expect(summary.bestValueQuote).toBeDefined();
      expect(summary.premiumQuote).toBeDefined();
      expect(summary.compulsory).toBeDefined();
    });
  });

  describe('generateDigitalPolicyCertificate', () => {
    const mockVehicle: Vehicle = {
      id: 'car-1',
      title: 'Mercedes-Benz E 300',
      vin: 'WBA5A7C50JB192841',
      make: 'Mercedes-Benz',
      model: 'E 300',
      year: 2022,
      priceAzn: 68000,
      mileageKm: 42000,
      engineVolumeLiters: 2.0,
      fuelType: 'petrol',
      transmission: 'automatic',
      drivetrain: 'rwd',
      powerHp: 258,
      fuelConsumptionLPer100Km: 7.2,
      bodyType: 'sedan',
      color: 'Qara',
      interiorColor: 'Qəhvəyi',
      interiorMaterial: 'leather',
      city: 'Bakı',
      images: ['/cars/e300.jpg'],
      features: ['Naviqasiya', 'Dəri salon'],
      damageReport: [],
      valuation: {
        status: 'fair_price',
        percentageDiff: 0,
        avgMarketPriceAzn: 68000,
        minMarketPriceAzn: 65000,
        maxMarketPriceAzn: 71000,
        confidenceScore: 95,
        priceHistoryTrend: []
      },
      seller: {
        id: 's1',
        name: 'Avtolux Baku',
        phone: '+994 50 123 45 67',
        type: 'autocenter',
        rating: 4.8,
        reviewsCount: 110,
        verifiedIdentity: true,
        memberSinceYear: 2020,
        city: 'Bakı'
      },
      hasCustomsCleared: true,
      isCreditAvailable: true,
      isBarterAvailable: false,
      publishedDate: '2026-10-01',
      viewsCount: 240,
      description: 'İdeal vəziyyətdə'
    };

    const mockAppForm: PolicyApplicationFormData = {
      ownerFullName: 'Elmir Qasımov',
      ownerFin: '5KJ7B8P',
      ownerPhone: '+994 50 777 88 99',
      plateNumber: '10-AA-789',
      selectedCompanyId: 'pasha',
      selectedTier: 'standard',
      includeCompulsory: true,
      includeKasko: true,
      paymentPlan: 'monthly_12'
    };

    it('generates active certificate with policy numbers and digital signature hash', () => {
      const pasha = AZERBAIJAN_INSURANCE_COMPANIES[0];
      const quote = calculateKaskoQuote(baseParams, pasha, 'standard');
      const compulsory = calculateCompulsoryInsurance(baseParams);

      const cert = generateDigitalPolicyCertificate(mockAppForm, mockVehicle, quote, compulsory);

      expect(cert.status).toBe('active');
      expect(cert.policyNumber).toContain('AZ-POL-2026-');
      expect(cert.icbariPolicyNumber).toContain('ISB-İMS-2026-');
      expect(cert.kaskoPolicyNumber).toContain('KSK-PASHA-2026-');
      expect(cert.holderName).toBe('Elmir Qasımov');
      expect(cert.finCode).toBe('5KJ7B8P');
      expect(cert.digitalSignatureId).toContain('SIMA-AZ-CERT-');
      expect(cert.totalAnnualPremiumAzn).toBe(compulsory.finalCompulsoryPremiumAzn + quote.annualPremiumAzn);
      expect(cert.monthlyPaymentAzn).toBeGreaterThan(0);
    });
  });

  describe('getBonusMalusBadgeData', () => {
    it('returns discount badge for BM > 10', () => {
      const badge = getBonusMalusBadgeData(15);
      expect(badge.badgeClass).toContain('emerald');
      expect(badge.label).toContain('Güzəştli');
    });

    it('returns surcharge badge for BM < 10', () => {
      const badge = getBonusMalusBadgeData(5);
      expect(badge.badgeClass).toContain('rose');
      expect(badge.label).toContain('Cəriməli');
    });

    it('returns standard badge for BM = 10', () => {
      const badge = getBonusMalusBadgeData(10);
      expect(badge.badgeClass).toContain('blue');
      expect(badge.label).toContain('Standart');
    });
  });
});

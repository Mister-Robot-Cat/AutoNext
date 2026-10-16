import { describe, it, expect } from 'vitest';
import {
  calculateUtilizationFees,
  calculateScrappagePayout,
  convertScrappageCurrency,
  filterCollectionCentersByCity,
  generateScrappageCertificate,
  verifyScrappageCertificateCode
} from '../vehicleScrappage';
import { SCRAPPAGE_COMPLETENESS_COMPONENTS } from '../../data/mockScrappageData';

describe('vehicleScrappage utility engine', () => {
  describe('calculateUtilizationFees', () => {
    it('exempts pure electric vehicles from both periodic inspection and customs utilization fees', () => {
      const result = calculateUtilizationFees(2019, 0, 'electric', 2026);
      expect(result.isEvExempt).toBe(true);
      expect(result.periodicInspectionFeeAzn).toBe(0);
      expect(result.customsImportFeeAzn).toBe(0);
    });

    it('calculates DYP periodic inspection utilization fees across all statutory age brackets', () => {
      expect(calculateUtilizationFees(2024, 2000, 'petrol', 2026).periodicInspectionFeeAzn).toBe(0); // 2 yrs (<4)
      expect(calculateUtilizationFees(2020, 2000, 'petrol', 2026).periodicInspectionFeeAzn).toBe(10); // 6 yrs (4-10)
      expect(calculateUtilizationFees(2012, 2000, 'petrol', 2026).periodicInspectionFeeAzn).toBe(20); // 14 yrs (10-20)
      expect(calculateUtilizationFees(2002, 2000, 'petrol', 2026).periodicInspectionFeeAzn).toBe(30); // 24 yrs (20-30)
      expect(calculateUtilizationFees(1992, 2000, 'petrol', 2026).periodicInspectionFeeAzn).toBe(40); // 34 yrs (30+)
    });

    it('calculates DGK customs import utilization fees for under 3 years vs 3+ years across engine volumes', () => {
      // Under 3 years (<3)
      expect(calculateUtilizationFees(2025, 1600, 'petrol', 2026).customsImportFeeAzn).toBe(400);
      expect(calculateUtilizationFees(2025, 2500, 'petrol', 2026).customsImportFeeAzn).toBe(700);
      expect(calculateUtilizationFees(2025, 3500, 'petrol', 2026).customsImportFeeAzn).toBe(1000);

      // 3 years and older (>=3)
      expect(calculateUtilizationFees(2021, 1600, 'petrol', 2026).customsImportFeeAzn).toBe(700);
      expect(calculateUtilizationFees(2021, 2500, 'diesel', 2026).customsImportFeeAzn).toBe(1200);
      expect(calculateUtilizationFees(2021, 4400, 'petrol', 2026).customsImportFeeAzn).toBe(2000);
    });
  });

  describe('calculateScrappagePayout', () => {
    const allComponentIds = SCRAPPAGE_COMPLETENESS_COMPONENTS.map((c) => c.id);

    it('calculates full 1,500 AZN voucher and 1,050 AZN (70%) cash alternative for 100% complete M1 passenger car', () => {
      const result = calculateScrappagePayout(
        {
          category: 'passenger_m1',
          manufactureYear: 2001,
          engineVolumeCc: 1800,
          fuelType: 'petrol',
          curbWeightKg: 1400,
          presentComponentIds: allComponentIds,
          payoutMode: 'local_car_voucher',
          selectedLocalModelId: 'local-byd-destroyer-05'
        },
        2026
      );

      expect(result.isEligibleForProgram).toBe(true);
      expect(result.completenessScorePercent).toBe(100);
      expect(result.netVoucherPayoutAzn).toBe(1500);
      expect(result.netCashPayoutAzn).toBe(1050);
      expect(result.factoryBonusAzn).toBe(1000);
      expect(result.totalCombinedDiscountAzn).toBe(2500);
      expect(result.localBrandFinalPriceAzn).toBe(31900 - 2500);
      expect(result.recyclingRecovery.ferrousSteelKg).toBeGreaterThan(800);
    });

    it('calculates 3,000 AZN voucher and 2,100 AZN cash alternative for N2/N3 heavy truck', () => {
      const result = calculateScrappagePayout(
        {
          category: 'heavy_truck_n2_n3',
          manufactureYear: 1998,
          engineVolumeCc: 6000,
          fuelType: 'diesel',
          curbWeightKg: 3200,
          presentComponentIds: allComponentIds,
          payoutMode: 'cash_lump_sum_70'
        },
        2026
      );

      expect(result.baseVoucherAzn).toBe(3000);
      expect(result.netCashPayoutAzn).toBe(2100);
      expect(result.selectedPayoutAzn).toBe(2100);
    });

    it('applies non-critical component deductions while maintaining eligibility if >= 70% complete', () => {
      const withoutWheelsAndBattery = allComponentIds.filter(
        (id) => id !== 'wheels_tires' && id !== 'battery_electronics'
      );
      const result = calculateScrappagePayout(
        {
          category: 'passenger_m1',
          manufactureYear: 2000,
          engineVolumeCc: 1600,
          fuelType: 'petrol',
          curbWeightKg: 1300,
          presentComponentIds: withoutWheelsAndBattery,
          payoutMode: 'local_car_voucher'
        },
        2026
      );

      expect(result.isEligibleForProgram).toBe(true);
      expect(result.completenessScorePercent).toBe(90);
      expect(result.deductionTotalAzn).toBe(150); // 80 + 70
      expect(result.netVoucherPayoutAzn).toBe(1350);
      expect(result.netCashPayoutAzn).toBe(945);
    });

    it('disqualifies vehicle if a critical structural assembly (e.g. engine_block) is missing', () => {
      const withoutEngine = allComponentIds.filter((id) => id !== 'engine_block');
      const result = calculateScrappagePayout(
        {
          category: 'passenger_m1',
          manufactureYear: 1999,
          engineVolumeCc: 1600,
          fuelType: 'petrol',
          curbWeightKg: 1200,
          presentComponentIds: withoutEngine,
          payoutMode: 'local_car_voucher'
        },
        2026
      );

      expect(result.isEligibleForProgram).toBe(false);
      expect(result.ineligibilityReason).not.toBeNull();
      expect(result.netVoucherPayoutAzn).toBe(0);
      expect(result.netCashPayoutAzn).toBe(0);
    });
  });

  describe('currency conversion, centers filter, and certificate registry', () => {
    it('converts AZN to USD and EUR accurately', () => {
      expect(convertScrappageCurrency(1500, 'AZN')).toBe(1500);
      expect(convertScrappageCurrency(1500, 'USD')).toBe(882.3);
      expect(convertScrappageCurrency(1500, 'EUR')).toBe(815.25);
    });

    it('filters collection centers by city', () => {
      expect(filterCollectionCentersByCity('all').length).toBe(6);
      expect(filterCollectionCentersByCity('Bakı').length).toBe(2);
      expect(filterCollectionCentersByCity('Sumqayıt').length).toBe(1);
    });

    it('generates and verifies official Təmiz Şəhər ASC scrappage certificates', () => {
      const cert = generateScrappageCertificate({
        applicantFullName: 'Əliyev Kamran',
        applicantFin: '6XY12Z9',
        vehicleTitle: 'Mercedes-Benz E220 (1999)',
        vin: 'WDB2100061A891234',
        plateNumber: '10-AA-123',
        manufactureYear: 1999,
        category: 'passenger_m1',
        centerId: 'ts-center-balakhani',
        completenessScorePercent: 100,
        payoutMode: 'local_car_voucher',
        voucherAmountAzn: 1500,
        cashPayoutAmountAzn: 1050
      });

      expect(cert.certificateNumber).toMatch(/^TS-UTL-2026-\d{5}$/);
      expect(cert.bdypDeregistrationCode).toMatch(/^BDYP-CX-2026-\d{5}$/);
      expect(cert.status).toBe('ACTIVE_VOUCHER');

      const verified = verifyScrappageCertificateCode('TS-UTL-2026-84920');
      expect(verified).not.toBeNull();
      expect(verified?.plateNumber).toBe('10-DX-492');
      expect(verifyScrappageCertificateCode('INVALID-000')).toBeNull();
    });
  });
});

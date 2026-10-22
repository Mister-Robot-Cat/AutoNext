import { describe, it, expect } from 'vitest';
import {
  calculateRoadTax,
  calculateGuaranteeDeposit,
  calculateIxmLawSanction,
  calculateCustomsTransitAudit,
  generateTemporaryImportPermit,
  convertCurrency,
  filterPermits,
  filterCheckpoints,
  CURRENCY_RATES,
} from '../customsTransit';
import { MOCK_BORDER_CHECKPOINTS, MOCK_ACTIVE_PERMITS } from '../../data/mockCustomsTransitData';

describe('customsTransit utilities', () => {
  describe('calculateRoadTax', () => {
    it('calculates road tax for motorcycles', () => {
      expect(calculateRoadTax('motorcycle', 600, 20)).toBe(15);
      expect(calculateRoadTax('motorcycle', 600, 45)).toBe(25);
    });

    it('calculates road tax for passenger cars and SUVs', () => {
      // <= 30 days, normal cc
      expect(calculateRoadTax('passenger_car', 1998, 15)).toBe(26);
      // 31-60 days
      expect(calculateRoadTax('passenger_car', 2400, 45)).toBe(43);
      // > 60 days
      expect(calculateRoadTax('passenger_car', 2400, 90)).toBe(51);
      // High displacement (>3000cc)
      const taxHighCc = calculateRoadTax('suv_4x4', 4500, 90);
      expect(taxHighCc).toBeGreaterThan(51);
    });

    it('calculates road tax for minibus and commercial trucks', () => {
      expect(calculateRoadTax('minibus', 2800, 20)).toBe(85);
      expect(calculateRoadTax('minibus', 2800, 60)).toBe(170);
      expect(calculateRoadTax('commercial_truck', 12000, 10)).toBe(170);
      expect(calculateRoadTax('commercial_truck', 12000, 45)).toBe(255);
    });
  });

  describe('calculateGuaranteeDeposit', () => {
    it('returns 0 for non-residents (statutory exemption)', () => {
      const deposit = calculateGuaranteeDeposit('non_resident', 50000, 2500, 2021, 'petrol');
      expect(deposit).toBe(0);
    });

    it('calculates positive refundable deposit for Azerbaijani residents', () => {
      const deposit = calculateGuaranteeDeposit('resident', 40000, 1998, 2022, 'petrol');
      expect(deposit).toBeGreaterThan(0);
      // Value 40,000 * 0.15 = 6,000 duty. Excise ~700. VAT 18% of sum. Total > 10,000.
      expect(deposit).toBeGreaterThan(10000);
    });

    it('exempts EV excise tax in resident deposit calculation', () => {
      const petrolDeposit = calculateGuaranteeDeposit('resident', 50000, 2500, 2022, 'petrol');
      const evDeposit = calculateGuaranteeDeposit('resident', 50000, 0, 2022, 'electric');
      expect(evDeposit).toBeLessThan(petrolDeposit);
    });

    it('applies surcharge for older vehicles (>7 years old)', () => {
      const newCarDeposit = calculateGuaranteeDeposit('resident', 30000, 2500, 2023, 'petrol');
      const oldCarDeposit = calculateGuaranteeDeposit('resident', 30000, 2500, 2015, 'petrol');
      expect(oldCarDeposit).toBeGreaterThan(newCarDeposit);
    });
  });

  describe('calculateIxmLawSanction', () => {
    it('returns compliant status when not overdue', () => {
      const sanction = calculateIxmLawSanction(0, 30000);
      expect(sanction.fineAzn).toBe(0);
      expect(sanction.status).toBe('compliant');
      expect(sanction.article).toContain('Gömrük Məcəlləsi');
    });

    it('applies İXM 499.1 fine (100 AZN) for 1-30 days overdue', () => {
      const sanction = calculateIxmLawSanction(15, 30000);
      expect(sanction.fineAzn).toBe(100);
      expect(sanction.status).toBe('penalty_tier_1');
      expect(sanction.article).toContain('499.1');
    });

    it('applies İXM 499.2 fine (300 AZN) for 31-90 days overdue', () => {
      const sanction = calculateIxmLawSanction(45, 30000);
      expect(sanction.fineAzn).toBe(300);
      expect(sanction.status).toBe('penalty_tier_2');
      expect(sanction.article).toContain('499.2');
    });

    it('applies İXM 499.3 confiscation/high fine risk for >90 days overdue', () => {
      const sanction = calculateIxmLawSanction(100, 40000);
      expect(sanction.fineAzn).toBe(20000); // 50% of vehicle value
      expect(sanction.status).toBe('confiscation_risk');
      expect(sanction.article).toContain('499.3');
    });
  });

  describe('calculateCustomsTransitAudit', () => {
    it('evaluates compliant non-resident stay within 90 days', () => {
      const audit = calculateCustomsTransitAudit({
        importerStatus: 'non_resident',
        vehicleCategory: 'passenger_car',
        engineCc: 1998,
        manufactureYear: 2022,
        fuelType: 'petrol',
        vehicleValueAzn: 35000,
        stayDurationDays: 45,
        purpose: 'tourism_personal',
        hasElectronicGpsLock: false,
      });

      expect(audit.isOverdue).toBe(false);
      expect(audit.daysRemainingOrOverdue).toBe(45);
      expect(audit.complianceStatus).toBe('compliant');
      expect(audit.refundableGuaranteeDepositAzn).toBe(0);
      expect(audit.isDepositRequired).toBe(false);
      expect(audit.customsProcessingFeeAzn).toBe(30);
      expect(audit.totalPayableAtBorderAzn).toBe(audit.roadTaxAzn + 30);
      expect(audit.requiredDocumentsAz.length).toBeGreaterThan(3);
    });

    it('marks expiring_soon when 15 days or less remain', () => {
      const audit = calculateCustomsTransitAudit({
        importerStatus: 'non_resident',
        vehicleCategory: 'passenger_car',
        engineCc: 1998,
        manufactureYear: 2022,
        fuelType: 'petrol',
        vehicleValueAzn: 35000,
        stayDurationDays: 80,
        purpose: 'tourism_personal',
        hasElectronicGpsLock: false,
      });

      expect(audit.complianceStatus).toBe('expiring_soon');
      expect(audit.daysRemainingOrOverdue).toBe(10);
      expect(audit.statusLabelAz).toContain('10 Gün Qalır');
    });

    it('includes GPS seal fee when requested for transit corridor', () => {
      const auditWithGps = calculateCustomsTransitAudit({
        importerStatus: 'non_resident',
        vehicleCategory: 'commercial_truck',
        engineCc: 12000,
        manufactureYear: 2021,
        fuelType: 'diesel',
        vehicleValueAzn: 100000,
        stayDurationDays: 3,
        purpose: 'commercial_transit',
        hasElectronicGpsLock: true,
      });

      expect(auditWithGps.gpsEsealFeeAzn).toBe(20);
      expect(auditWithGps.totalPayableAtBorderAzn).toBe(
        auditWithGps.roadTaxAzn + auditWithGps.customsProcessingFeeAzn + 20
      );
    });

    it('enforces deposit for resident importer', () => {
      const auditResident = calculateCustomsTransitAudit({
        importerStatus: 'resident',
        vehicleCategory: 'suv_4x4',
        engineCc: 2998,
        manufactureYear: 2021,
        fuelType: 'petrol',
        vehicleValueAzn: 60000,
        stayDurationDays: 60,
        purpose: 'family_visit',
        hasElectronicGpsLock: false,
      });

      expect(auditResident.isDepositRequired).toBe(true);
      expect(auditResident.refundableGuaranteeDepositAzn).toBeGreaterThan(15000);
      expect(auditResident.depositReasonAz).toContain('258.4-cü maddəsinə əsasən');
    });
  });

  describe('generateTemporaryImportPermit', () => {
    it('creates a fully populated permit object with valid DGK permit number', () => {
      const checkpoint = MOCK_BORDER_CHECKPOINTS[0];
      const permit = generateTemporaryImportPermit(
        {
          importerStatus: 'non_resident',
          vehicleCategory: 'passenger_car',
          engineCc: 2487,
          manufactureYear: 2021,
          fuelType: 'hybrid',
          vehicleValueAzn: 38000,
          stayDurationDays: 90,
          purpose: 'tourism_personal',
          hasElectronicGpsLock: false,
        },
        'Giorgi Beridze',
        'P№ 11BA89201',
        'Gürcüstan',
        'Toyota Camry Hybrid',
        'GE',
        'GE · AA-452-BB',
        '4T1B11HK5LU829104',
        checkpoint
      );

      expect(permit.permitNumber).toMatch(/^DGK-MVI-2026-\d{5}$/);
      expect(permit.importerName).toBe('Giorgi Beridze');
      expect(permit.foreignPlateNumber).toBe('GE · AA-452-BB');
      expect(permit.entryCheckpointNameAz).toBe(checkpoint.nameAz);
      expect(permit.qrSecurityHash).toContain('SHA256:DGK-MVI-2026');
      expect(permit.customsOfficerId).toMatch(/^DGK-INSP-\d{3}$/);
    });
  });

  describe('convertCurrency', () => {
    it('converts correctly across AZN, USD, and EUR', () => {
      expect(convertCurrency(170, 'AZN')).toBe(170);
      expect(convertCurrency(170, 'USD')).toBe(100);
      expect(convertCurrency(184, 'EUR')).toBe(100);
    });
  });

  describe('filterPermits and filterCheckpoints', () => {
    it('filters permits by query', () => {
      const results = filterPermits(MOCK_ACTIVE_PERMITS, 'Camry');
      expect(results.length).toBe(1);
      expect(results[0].vehicleMakeModel).toContain('Camry');

      const plateResults = filterPermits(MOCK_ACTIVE_PERMITS, 'GE');
      expect(plateResults.length).toBeGreaterThanOrEqual(2);
    });

    it('returns all permits when query is empty', () => {
      const results = filterPermits(MOCK_ACTIVE_PERMITS, '   ');
      expect(results.length).toBe(MOCK_ACTIVE_PERMITS.length);
    });

    it('filters checkpoints by country and search query', () => {
      const geoCheckpoints = filterCheckpoints(MOCK_BORDER_CHECKPOINTS, 'georgia', '');
      expect(geoCheckpoints.length).toBe(2);

      const searched = filterCheckpoints(MOCK_BORDER_CHECKPOINTS, 'all', 'Qusar');
      expect(searched.length).toBe(1);
      expect(searched[0].id).toBe('checkpoint-samur');
    });
  });
});

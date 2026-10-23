import { describe, it, expect } from 'vitest';
import {
  calculateAnnualRoadTax,
  calculateTradeInVat,
  calculateCorporateFleetDepreciation,
  generateTaxInvoice,
  filterTaxOffices,
  filterTaxInvoices,
  convertTaxCurrency,
  TAX_EXCHANGE_RATES,
} from '../vehicleTax';
import { MOCK_TAX_OFFICES, MOCK_ACTIVE_TAX_INVOICES } from '../../data/mockVehicleTaxData';

describe('vehicleTax utility', () => {
  describe('calculateAnnualRoadTax', () => {
    it('returns 0 AZN and exempt status for pure electric vehicles', () => {
      const result = calculateAnnualRoadTax({
        category: 'electric_car',
        engineDisplacementCc: 0,
        isElectric: true,
      });

      expect(result.roadTaxAzn).toBe(0);
      expect(result.isExempt).toBe(true);
      expect(result.exemptionReasonAz).toContain('tam elektrik mühərrikli nəqliyyat vasitələri yol vergisindən azaddır');
      expect(result.statutoryFormulaAz).toContain('0 AZN');
    });

    it('calculates road tax for passenger car with engine <= 2,000 cc (0.02 AZN/cc)', () => {
      const result = calculateAnnualRoadTax({
        category: 'passenger_car',
        engineDisplacementCc: 1600,
      });

      // 1600 * 0.02 = 32.00 AZN
      expect(result.roadTaxAzn).toBe(32);
      expect(result.isExempt).toBe(false);
      expect(result.statutoryFormulaAz).toContain('1600 sm³ × 0.02 AZN');
    });

    it('calculates road tax for passenger car between 2,001 and 3,000 cc (40 + 0.03/excess)', () => {
      const result = calculateAnnualRoadTax({
        category: 'passenger_car',
        engineDisplacementCc: 2500,
      });

      // 40 + (500 * 0.03) = 40 + 15 = 55.00 AZN
      expect(result.roadTaxAzn).toBe(55);
      expect(result.statutoryFormulaAz).toContain('40 AZN + (500 sm³ × 0.03 AZN)');
    });

    it('calculates road tax for passenger car between 3,001 and 4,000 cc (70 + 0.04/excess)', () => {
      const result = calculateAnnualRoadTax({
        category: 'passenger_car',
        engineDisplacementCc: 3500,
      });

      // 70 + (500 * 0.04) = 70 + 20 = 90.00 AZN
      expect(result.roadTaxAzn).toBe(90);
      expect(result.statutoryFormulaAz).toContain('70 AZN + (500 sm³ × 0.04 AZN)');
    });

    it('calculates road tax for passenger car between 4,001 and 5,000 cc (110 + 0.05/excess)', () => {
      const result = calculateAnnualRoadTax({
        category: 'passenger_car',
        engineDisplacementCc: 4600,
      });

      // 110 + (600 * 0.05) = 110 + 30 = 140.00 AZN
      expect(result.roadTaxAzn).toBe(140);
      expect(result.statutoryFormulaAz).toContain('110 AZN + (600 sm³ × 0.05 AZN)');
    });

    it('calculates road tax for passenger car > 5,000 cc (160 + 0.06/excess)', () => {
      const result = calculateAnnualRoadTax({
        category: 'passenger_car',
        engineDisplacementCc: 5700,
      });

      // 160 + (700 * 0.06) = 160 + 42 = 202.00 AZN
      expect(result.roadTaxAzn).toBe(202);
      expect(result.statutoryFormulaAz).toContain('160 AZN + (700 sm³ × 0.06 AZN)');
    });

    it('calculates road tax for buses across tier seat limits', () => {
      // <= 12 seats: 0.15 AZN/seat
      const smallBus = calculateAnnualRoadTax({
        category: 'bus',
        engineDisplacementCc: 2500,
        seatingCapacity: 10,
      });
      expect(smallBus.roadTaxAzn).toBe(1.5);

      // 13-30 seats: 0.30 AZN/seat
      const mediumBus = calculateAnnualRoadTax({
        category: 'bus',
        engineDisplacementCc: 2800,
        seatingCapacity: 20,
      });
      expect(mediumBus.roadTaxAzn).toBe(6);

      // > 30 seats: 0.50 AZN/seat
      const largeBus = calculateAnnualRoadTax({
        category: 'bus',
        engineDisplacementCc: 6000,
        seatingCapacity: 50,
      });
      expect(largeBus.roadTaxAzn).toBe(25);
    });

    it('calculates road tax for trucks across payload tonnage tiers', () => {
      expect(calculateAnnualRoadTax({ category: 'truck', engineDisplacementCc: 2000, payloadCapacityTons: 0.8 }).roadTaxAzn).toBe(20);
      expect(calculateAnnualRoadTax({ category: 'truck', engineDisplacementCc: 3000, payloadCapacityTons: 2.5 }).roadTaxAzn).toBe(40);
      expect(calculateAnnualRoadTax({ category: 'truck', engineDisplacementCc: 4500, payloadCapacityTons: 4.0 }).roadTaxAzn).toBe(60);
      expect(calculateAnnualRoadTax({ category: 'truck', engineDisplacementCc: 6000, payloadCapacityTons: 8.0 }).roadTaxAzn).toBe(100);
      expect(calculateAnnualRoadTax({ category: 'truck', engineDisplacementCc: 9000, payloadCapacityTons: 15.0 }).roadTaxAzn).toBe(150);
    });

    it('calculates road tax for motorcycles', () => {
      const moto = calculateAnnualRoadTax({
        category: 'motorcycle',
        engineDisplacementCc: 600,
      });
      expect(moto.roadTaxAzn).toBe(20);
    });
  });

  describe('calculateTradeInVat', () => {
    it('calculates 18% VAT on trade margin for VAT payers', () => {
      const result = calculateTradeInVat({
        purchasePrice: 20000,
        sellingPrice: 25000,
        taxRegime: 'vat_payer',
      });

      expect(result.tradeMarginAzn).toBe(5000);
      expect(result.taxableBaseAzn).toBe(5000);
      expect(result.vatRatePercent).toBe(18);
      // 5000 * 0.18 = 900 AZN
      expect(result.vatAmountAzn).toBe(900);
      expect(result.totalTaxLiabilityAzn).toBe(900);
      expect(result.netDealerProfitAzn).toBe(4100);
      expect(result.effectiveTaxRatePercent).toBe(3.6); // 900 / 25000 * 100
    });

    it('handles negative or zero margin without negative tax', () => {
      const result = calculateTradeInVat({
        purchasePrice: 30000,
        sellingPrice: 28000,
        taxRegime: 'vat_payer',
      });

      expect(result.tradeMarginAzn).toBe(-2000);
      expect(result.taxableBaseAzn).toBe(0);
      expect(result.vatAmountAzn).toBe(0);
      expect(result.totalTaxLiabilityAzn).toBe(0);
      expect(result.netDealerProfitAzn).toBe(-2000);
    });

    it('calculates 2% simplified tax on gross selling price for simplified regime', () => {
      const result = calculateTradeInVat({
        purchasePrice: 20000,
        sellingPrice: 25000,
        taxRegime: 'simplified',
      });

      expect(result.simplifiedTaxRatePercent).toBe(2);
      // 25000 * 0.02 = 500 AZN
      expect(result.simplifiedTaxAmountAzn).toBe(500);
      expect(result.totalTaxLiabilityAzn).toBe(500);
      expect(result.netDealerProfitAzn).toBe(4500);
    });
  });

  describe('calculateCorporateFleetDepreciation', () => {
    it('generates a 4-year 25% straight-line depreciation schedule with 1% property tax', () => {
      const result = calculateCorporateFleetDepreciation(40000, 4, 'straight_line', 0);

      expect(result.initialAssetValueAzn).toBe(40000);
      expect(result.annualDepreciationRatePercent).toBe(25);
      expect(result.schedule.length).toBe(4);

      // Year 1: 40000 -> expense 10000, ending 30000, avg 35000, property tax 350
      expect(result.schedule[0].startingBookValueAzn).toBe(40000);
      expect(result.schedule[0].depreciationExpenseAzn).toBe(10000);
      expect(result.schedule[0].endingBookValueAzn).toBe(30000);
      expect(result.schedule[0].annualPropertyTaxAzn).toBe(350);

      // Year 4: ending 0
      expect(result.schedule[3].endingBookValueAzn).toBe(0);
      expect(result.totalDepreciationAzn).toBe(40000);
      expect(result.totalPropertyTaxAzn).toBeGreaterThan(0);
    });

    it('supports declining balance depreciation method', () => {
      const result = calculateCorporateFleetDepreciation(40000, 4, 'declining_balance', 0);

      expect(result.method).toBe('declining_balance');
      expect(result.schedule[0].depreciationExpenseAzn).toBe(10000); // 40000 * 0.25
      expect(result.schedule[1].depreciationExpenseAzn).toBe(7500); // 30000 * 0.25
      expect(result.schedule[1].endingBookValueAzn).toBe(22500);
    });
  });

  describe('generateTaxInvoice', () => {
    it('creates a serialized electronic tax invoice with valid hash and total calculation', () => {
      const invoice = generateTaxInvoice({
        sellerVoen: '1402948211',
        sellerName: 'Auto Motors LLC',
        buyerVoenOrFin: '6ABC123',
        buyerName: 'Murad Aliyev',
        buyerType: 'individual',
        vehiclePlate: '99-ZZ-999',
        vehicleVin: 'WBA12345678901234',
        vehicleMakeModel: 'BMW 330i',
        vehicleYear: 2023,
        engineDisplacementCc: 1998,
        purchasePriceAzn: 40000,
        sellingPriceAzn: 45000,
      });

      expect(invoice.invoiceNumber).toMatch(/^DVX-AVT-2026-\d{5}$/);
      expect(invoice.sellerVoen).toBe('1402948211');
      expect(invoice.status).toBe('approved');
      expect(invoice.tradeMarginAzn).toBe(5000);
      expect(invoice.vatAmountAzn).toBe(900);
      expect(invoice.annualRoadTaxAzn).toBe(39.96); // 1998 * 0.02
      expect(invoice.totalInvoiceAmountAzn).toBe(45039.96);
      expect(invoice.securityHash).toContain('SHA256-');
      expect(invoice.qrVerificationCode).toContain('e-taxes.gov.az');
    });
  });

  describe('filtering functions & currency conversion', () => {
    it('filters tax offices by query and ASAN service toggle', () => {
      const bakuOffices = filterTaxOffices(MOCK_TAX_OFFICES, 'Bakı');
      expect(bakuOffices.length).toBeGreaterThan(0);

      const asanOnly = filterTaxOffices(MOCK_TAX_OFFICES, '', true);
      expect(asanOnly.every((o) => o.isAsanService)).toBe(true);

      const sumgayit = filterTaxOffices(MOCK_TAX_OFFICES, 'Sumqayıt');
      expect(sumgayit.length).toBe(1);
    });

    it('filters tax invoices by query', () => {
      const filtered = filterTaxInvoices(MOCK_ACTIVE_TAX_INVOICES, 'Toyota');
      expect(filtered.length).toBe(2);
      expect(filtered.some((inv) => inv.vehicleMakeModel.includes('Toyota'))).toBe(true);

      const byPlate = filterTaxInvoices(MOCK_ACTIVE_TAX_INVOICES, '99-BP-404');
      expect(byPlate.length).toBe(1);
    });

    it('converts currencies correctly', () => {
      expect(convertTaxCurrency(170, 'AZN')).toBe(170);
      expect(convertTaxCurrency(170, 'USD')).toBe(100);
      expect(convertTaxCurrency(185, 'EUR')).toBe(100);
    });
  });
});

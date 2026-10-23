import { describe, it, expect } from 'vitest';
import {
  calculateVehicleLease,
  convertCurrency,
  formatCurrency,
  generateLeaseContractId,
  LeaseCalculationInput,
} from '../vehicleLeasing';
import {
  MOCK_LEASING_COMPANIES,
  MOCK_LEASE_PRESETS,
  MOCK_ACTIVE_LEASE_REGISTRY,
} from '../../data/mockLeasingData';

describe('vehicleLeasing Utility & Calculation Engine', () => {
  const baseInput: LeaseCalculationInput = {
    vehiclePrice: 60000,
    downPaymentPercent: 20,
    termMonths: 36,
    annualInterestRate: 15.0,
    balloonPaymentPercent: 0,
    leaseType: 'financial',
    customerType: 'corporate',
    currency: 'AZN',
  };

  it('calculates standard financial lease values accurately', () => {
    const result = calculateVehicleLease(baseInput);

    expect(result.vehiclePrice).toBe(60000);
    expect(result.downPaymentPercent).toBe(20);
    expect(result.downPaymentAmount).toBe(12000);
    expect(result.financedAmount).toBe(48000);
    expect(result.balloonPaymentAmount).toBe(0);
    expect(result.totalMonthlyPayment).toBeGreaterThan(1500);
    expect(result.totalMonthlyPayment).toBeLessThan(2000);
    expect(result.totalPayments).toBeGreaterThan(result.vehiclePrice);
    expect(result.schedule).toHaveLength(36);
    expect(result.schedule[0].beginningBalance).toBe(48000);
    expect(result.schedule[35].endingBalance).toBe(0);
  });

  it('handles balloon residual payments properly', () => {
    const withBalloon = calculateVehicleLease({
      ...baseInput,
      balloonPaymentPercent: 15, // 15% of 60,000 = 9,000 AZN
    });

    const withoutBalloon = calculateVehicleLease({
      ...baseInput,
      balloonPaymentPercent: 0,
    });

    expect(withBalloon.balloonPaymentAmount).toBe(9000);
    // Monthly payment with balloon must be lower than without balloon
    expect(withBalloon.totalMonthlyPayment).toBeLessThan(withoutBalloon.totalMonthlyPayment);
    expect(withBalloon.schedule[35].endingBalance).toBe(9000);
  });

  it('calculates operational lease with full service maintenance & KASKO', () => {
    const operational = calculateVehicleLease({
      ...baseInput,
      leaseType: 'operational',
      includeFullServiceMaintenance: true,
      includeComprehensiveKasko: true,
    });

    expect(operational.monthlyServiceFee).toBeGreaterThan(0);
    expect(operational.totalMonthlyPayment).toBeGreaterThan(operational.monthlyBasePayment);
    // In operational lease, balloon payment is forced to 0
    expect(operational.balloonPaymentPercent).toBe(0);
    expect(operational.balloonPaymentAmount).toBe(0);
  });

  it('awards full 18% VAT and 20% Profit Tax deductions to corporate entities (Tax Code Art. 140 & 114)', () => {
    const corporateResult = calculateVehicleLease({
      ...baseInput,
      customerType: 'corporate',
    });

    expect(corporateResult.taxSavings.vatDeductionTotal).toBeGreaterThan(0);
    expect(corporateResult.taxSavings.profitTaxSavingsTotal).toBeGreaterThan(0);
    expect(corporateResult.taxSavings.totalFiscalBenefit).toBe(
      corporateResult.taxSavings.vatDeductionTotal + corporateResult.taxSavings.profitTaxSavingsTotal
    );
    expect(corporateResult.taxSavings.netCashflowCost).toBeLessThan(corporateResult.totalPayments);
    expect(corporateResult.comparisonVsBankLoan.recommendation).toBe('lease_preferred');
  });

  it('awards zero tax deductions to individual private customers', () => {
    const individualResult = calculateVehicleLease({
      ...baseInput,
      customerType: 'individual',
    });

    expect(individualResult.taxSavings.vatDeductionTotal).toBe(0);
    expect(individualResult.taxSavings.profitTaxSavingsTotal).toBe(0);
    expect(individualResult.taxSavings.totalFiscalBenefit).toBe(0);
    expect(individualResult.taxSavings.netCashflowCost).toBe(individualResult.totalPayments);
  });

  it('calculates bank car loan comparison correctly', () => {
    const result = calculateVehicleLease(baseInput);

    expect(result.comparisonVsBankLoan.bankLoanMonthly).toBeGreaterThan(0);
    expect(result.comparisonVsBankLoan.bankLoanTotalCost).toBeGreaterThan(baseInput.vehiclePrice);
    expect(result.comparisonVsBankLoan.leasingTaxAdvantageAzn).toBe(
      result.taxSavings.totalFiscalBenefit
    );
  });

  it('converts currencies correctly', () => {
    expect(convertCurrency(170, 'AZN', 'USD')).toBeCloseTo(100, 0);
    expect(convertCurrency(185, 'AZN', 'EUR')).toBeCloseTo(100, 0);
    expect(convertCurrency(500, 'AZN', 'AZN')).toBe(500);
  });

  it('formats currency strings properly', () => {
    expect(formatCurrency(1250, 'AZN')).toContain('1,250.00 ₼');
    expect(formatCurrency(1000, 'USD')).toContain('1,000.00 $');
    expect(formatCurrency(2500, 'EUR')).toContain('2,500.00 €');
  });

  it('generates valid contract ID format AMB-LZG-2026-XXXXX', () => {
    const id = generateLeaseContractId();
    expect(id).toMatch(/^AMB-LZG-2026-\d{5}$/);
  });

  it('ensures mock data integrity for leasing companies and presets', () => {
    expect(MOCK_LEASING_COMPANIES.length).toBeGreaterThanOrEqual(6);
    MOCK_LEASING_COMPANIES.forEach((company) => {
      expect(company.voen).toMatch(/^\d{10}$/);
      expect(company.licenseNumber).toContain('AMB-LZG-');
      expect(company.minDownPaymentPercent).toBeGreaterThanOrEqual(10);
      expect(company.baseInterestRate).toBeGreaterThan(0);
    });

    expect(MOCK_LEASE_PRESETS.length).toBeGreaterThanOrEqual(6);
    expect(MOCK_ACTIVE_LEASE_REGISTRY.length).toBeGreaterThanOrEqual(5);
  });
});

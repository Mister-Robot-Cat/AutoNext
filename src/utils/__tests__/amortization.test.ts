import { describe, it, expect } from 'vitest';
import {
  calculateAmortizationSchedule,
  exportAmortizationToCsv,
} from '../amortization';

describe('Loan Amortization Engine (calculateAmortizationSchedule)', () => {
  it('calculates a standard 36-month loan amortization accurately', () => {
    const schedule = calculateAmortizationSchedule({
      carPrice: 50000,
      downPaymentPercent: 20,
      termMonths: 36,
      annualInterestRate: 14.5,
    });

    expect(schedule.carPrice).toBe(50000);
    expect(schedule.downPaymentPercent).toBe(20);
    expect(schedule.downPaymentAmount).toBe(10000);
    expect(schedule.principal).toBe(40000);
    expect(schedule.termMonths).toBe(36);
    expect(schedule.payoffMonths).toBe(36);
    expect(schedule.monthsSaved).toBe(0);
    expect(schedule.interestSaved).toBe(0);
    expect(schedule.periods).toHaveLength(36);

    // Initial period check
    const firstPeriod = schedule.periods[0];
    expect(firstPeriod.period).toBe(1);
    expect(firstPeriod.interestPayment).toBeGreaterThan(0);
    expect(firstPeriod.principalPayment).toBeGreaterThan(0);
    expect(firstPeriod.remainingBalance).toBeLessThan(40000);
    expect(firstPeriod.cumulativePrincipal).toBe(firstPeriod.principalPayment);
    expect(firstPeriod.cumulativeInterest).toBe(firstPeriod.interestPayment);

    // Final period check
    const lastPeriod = schedule.periods[35];
    expect(lastPeriod.period).toBe(36);
    expect(lastPeriod.remainingBalance).toBe(0);
    expect(lastPeriod.cumulativePrincipal).toBe(40000);

    // Sum of all principal payments must exactly equal principal
    const totalPrincipalPaid = schedule.periods.reduce((sum, p) => sum + p.principalPayment, 0);
    expect(totalPrincipalPaid).toBe(40000);

    // Total payment must equal total principal + total interest
    expect(schedule.totalPayment).toBe(schedule.principal + schedule.totalInterest);
  });

  it('generates correct yearly summaries for 36 months', () => {
    const schedule = calculateAmortizationSchedule({
      carPrice: 60000,
      downPaymentPercent: 25,
      termMonths: 36,
      annualInterestRate: 12,
    });

    expect(schedule.yearlySummaries).toHaveLength(3);

    const year1 = schedule.yearlySummaries[0];
    expect(year1.year).toBe(1);
    expect(year1.startBalance).toBe(45000);
    expect(year1.endingBalance).toBe(schedule.periods[11].remainingBalance);

    const year3 = schedule.yearlySummaries[2];
    expect(year3.year).toBe(3);
    expect(year3.endingBalance).toBe(0);

    // Sum of yearly principal and interest
    const yearlyPrincipalTotal = schedule.yearlySummaries.reduce((sum, y) => sum + y.principalPaid, 0);
    const yearlyInterestTotal = schedule.yearlySummaries.reduce((sum, y) => sum + y.interestPaid, 0);

    expect(yearlyPrincipalTotal).toBe(schedule.principal);
    expect(yearlyInterestTotal).toBe(schedule.totalInterest);
  });

  it('calculates early payoff, months saved, and interest saved when extra payment is applied', () => {
    const baseSchedule = calculateAmortizationSchedule({
      carPrice: 40000,
      downPaymentPercent: 20,
      termMonths: 48,
      annualInterestRate: 15,
      extraMonthlyPayment: 0,
    });

    const acceleratedSchedule = calculateAmortizationSchedule({
      carPrice: 40000,
      downPaymentPercent: 20,
      termMonths: 48,
      annualInterestRate: 15,
      extraMonthlyPayment: 250,
    });

    expect(acceleratedSchedule.extraMonthlyPayment).toBe(250);
    expect(acceleratedSchedule.payoffMonths).toBeLessThan(48);
    expect(acceleratedSchedule.monthsSaved).toBeGreaterThan(0);
    expect(acceleratedSchedule.interestSaved).toBeGreaterThan(0);
    expect(acceleratedSchedule.totalInterest).toBeLessThan(baseSchedule.totalInterest);

    // The loan must still be fully paid off to 0
    const finalPeriod = acceleratedSchedule.periods[acceleratedSchedule.periods.length - 1];
    expect(finalPeriod.remainingBalance).toBe(0);
    expect(finalPeriod.cumulativePrincipal).toBe(acceleratedSchedule.principal);
  });

  it('handles 0% interest loans correctly', () => {
    const schedule = calculateAmortizationSchedule({
      carPrice: 30000,
      downPaymentPercent: 10,
      termMonths: 12,
      annualInterestRate: 0,
    });

    expect(schedule.principal).toBe(27000);
    expect(schedule.totalInterest).toBe(0);
    expect(schedule.monthlyPayment).toBe(2250); // 27000 / 12
    expect(schedule.periods).toHaveLength(12);

    schedule.periods.forEach((p) => {
      expect(p.interestPayment).toBe(0);
    });

    expect(schedule.periods[11].remainingBalance).toBe(0);
  });

  it('handles 100% down payment without crashing or generating periods', () => {
    const schedule = calculateAmortizationSchedule({
      carPrice: 50000,
      downPaymentPercent: 100,
      termMonths: 36,
      annualInterestRate: 14,
    });

    expect(schedule.principal).toBe(0);
    expect(schedule.monthlyPayment).toBe(0);
    expect(schedule.totalInterest).toBe(0);
    expect(schedule.periods).toHaveLength(0);
    expect(schedule.yearlySummaries).toHaveLength(0);
  });

  it('handles zero or negative term gracefully', () => {
    const schedule = calculateAmortizationSchedule({
      carPrice: 50000,
      downPaymentPercent: 20,
      termMonths: 0,
      annualInterestRate: 14,
    });

    expect(schedule.periods).toHaveLength(0);
    expect(schedule.monthlyPayment).toBe(0);
  });

  it('exports schedule properly to formatted CSV string', () => {
    const schedule = calculateAmortizationSchedule({
      carPrice: 20000,
      downPaymentPercent: 20,
      termMonths: 12,
      annualInterestRate: 10,
    });

    const csv = exportAmortizationToCsv(schedule);
    expect(csv).toContain('Period (Month),Payment (AZN),Principal (AZN),Interest (AZN),Remaining Balance (AZN),Cumulative Interest (AZN)');
    const lines = csv.split('\n');
    expect(lines.length).toBe(13); // Header + 12 rows
    expect(lines[1].startsWith('1,')).toBe(true);
    expect(lines[12].startsWith('12,')).toBe(true);
  });
});

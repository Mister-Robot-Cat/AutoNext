import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useLoanCalculator } from '../useLoanCalculator';
import { BANK_PROGRAMS } from '../../data/mockVehicles';

describe('useLoanCalculator', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useLoanCalculator());

    expect(result.current.carPrice).toBe(50000);
    expect(result.current.downPaymentPercent).toBe(25);
    expect(result.current.termMonths).toBe(36);
    expect(result.current.selectedBankIndex).toBe(0);
    expect(result.current.selectedBank).toEqual(BANK_PROGRAMS[0]);
    
    // Check if calculation returns something valid
    expect(result.current.calculation.principal).toBeGreaterThan(0);
  });

  it('should initialize with custom initial car price', () => {
    const { result } = renderHook(() => useLoanCalculator({ initialPriceAzn: 75000 }));
    expect(result.current.carPrice).toBe(75000);
  });

  it('should update state values correctly', () => {
    const { result } = renderHook(() => useLoanCalculator());

    act(() => {
      result.current.setCarPrice(60000);
      result.current.setDownPaymentPercent(30);
      result.current.setTermMonths(48);
      result.current.setSelectedBankIndex(1); // ABB Avto Express
    });

    expect(result.current.carPrice).toBe(60000);
    expect(result.current.downPaymentPercent).toBe(30);
    expect(result.current.termMonths).toBe(48);
    expect(result.current.selectedBankIndex).toBe(1);
    expect(result.current.selectedBank).toEqual(BANK_PROGRAMS[1]);
  });

  it('should auto-correct down payment if it falls below the minimum for the selected bank', () => {
    const { result } = renderHook(() => useLoanCalculator());

    // Switch to Unibank (index 2) which has minDownPaymentPercent: 15
    act(() => {
      result.current.setSelectedBankIndex(2);
    });

    act(() => {
      result.current.setDownPaymentPercent(15);
    });
    
    expect(result.current.downPaymentPercent).toBe(15);

    // Switch to Kapital Bank (index 0) which has minDownPaymentPercent: 20
    act(() => {
      result.current.setSelectedBankIndex(0);
    });

    // The useEffect should have updated downPaymentPercent to 20
    expect(result.current.downPaymentPercent).toBe(20);
  });

  it('should calculate loan details correctly when dependencies change', () => {
    const { result } = renderHook(() => useLoanCalculator({ initialPriceAzn: 10000 }));

    act(() => {
      // 10000 car price, 20% down payment (2000), principal = 8000
      result.current.setDownPaymentPercent(20);
      result.current.setTermMonths(12);
      result.current.setSelectedBankIndex(0); // Kapital Bank: 14.5% annual
    });

    const calc = result.current.calculation;
    expect(calc.downPaymentAmount).toBe(2000);
    expect(calc.principal).toBe(8000);
    expect(calc.monthlyPayment).toBeGreaterThan(0);
    expect(calc.totalRepayment).toBe(calc.monthlyPayment * 12);
    expect(calc.totalInterest).toBe(calc.totalRepayment - calc.principal);
  });
});

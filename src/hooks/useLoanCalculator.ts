import { useState, useEffect, useMemo } from 'react';
import { BANK_PROGRAMS } from '../data/mockVehicles';
import { calculateCarLoan, LoanCalculationResult } from '../utils/pricing';

export interface UseLoanCalculatorOptions {
  initialPriceAzn?: number;
}

export function useLoanCalculator(options: UseLoanCalculatorOptions = {}) {
  const [carPrice, setCarPrice] = useState<number>(options.initialPriceAzn || 50000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(25);
  const [termMonths, setTermMonths] = useState<number>(36);
  const [selectedBankIndex, setSelectedBankIndex] = useState<number>(0);

  const selectedBank = BANK_PROGRAMS[selectedBankIndex];

  // Auto-correct down payment if it falls below the bank's strict minimum
  useEffect(() => {
    if (downPaymentPercent < selectedBank.minDownPaymentPercent) {
      setDownPaymentPercent(selectedBank.minDownPaymentPercent);
    }
  }, [selectedBank.minDownPaymentPercent, downPaymentPercent]);

  const calculation = useMemo<LoanCalculationResult>(() => {
    const effectiveDownPayment = Math.max(downPaymentPercent, selectedBank.minDownPaymentPercent);
    
    return calculateCarLoan(
      carPrice,
      effectiveDownPayment,
      termMonths,
      selectedBank.annualInterestRate,
      selectedBank.commissionPercent
    );
  }, [carPrice, downPaymentPercent, termMonths, selectedBank]);

  return {
    carPrice,
    setCarPrice,
    downPaymentPercent,
    setDownPaymentPercent,
    termMonths,
    setTermMonths,
    selectedBankIndex,
    setSelectedBankIndex,
    selectedBank,
    calculation,
  };
}

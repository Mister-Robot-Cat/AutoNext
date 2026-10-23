/**
 * Official Central Bank of Azerbaijan (AMB) & Azerbaijan Leasing Association (ALA)
 * Automobile Financial Leasing, Corporate Fleet Lease & Tax Incentive Calculation Engine
 * 
 * Statutory References:
 * - Civil Code of the Republic of Azerbaijan (AR Mülki Məcəllə, Fəsil 36, Maddə 747–759: Lizinq Müqaviləsi)
 * - Law of the Republic of Azerbaijan "On Leasing" ("Lizinq haqqında" AR Qanunu)
 * - Tax Code of the Republic of Azerbaijan (AR Vergi Məcəlləsi, Maddə 140: Lizinq əməliyyatlarının vergiyə cəlb edilməsi,
 *   Maddə 114: Lizinq obyektinin amortizasiyası, Maddə 159 & 164: ƏDV əvəzləşdirilməsi və azadolmalar)
 * - Central Bank of the Republic of Azerbaijan (AMB) Prudential Lending & Lease Norms
 */

export type LeaseType = 'financial' | 'operational';
export type CustomerType = 'corporate' | 'entrepreneur' | 'individual';
export type Currency = 'AZN' | 'USD' | 'EUR';

export interface LeasingCompany {
  id: string;
  name: string;
  shortName: string;
  voen: string;
  licenseNumber: string;
  address: string;
  phone: string;
  website: string;
  email: string;
  minDownPaymentPercent: number; // e.g. 15%
  baseInterestRate: number;      // e.g. 14%
  maxTermMonths: number;         // e.g. 60
  specializations: ('passenger' | 'commercial' | 'ev_green' | 'heavy_truck')[];
  rating: number;                // e.g. 4.9
  establishedYear: number;
  activePortfolioMlnAzn: number;
}

export interface LeaseScheduleRow {
  month: number;
  beginningBalance: number;
  principalPayment: number;
  interestPayment: number;
  vatPortion: number;
  totalMonthlyPayment: number;
  endingBalance: number;
}

export interface LeaseCalculationInput {
  vehiclePrice: number;
  downPaymentPercent: number;    // e.g. 20 (percent)
  termMonths: number;            // 12, 24, 36, 48, 60
  annualInterestRate: number;    // e.g. 16 (percent)
  balloonPaymentPercent?: number;// 0 to 30 (percent)
  leaseType: LeaseType;
  customerType: CustomerType;
  currency?: Currency;
  isElectricVehicle?: boolean;
  includeFullServiceMaintenance?: boolean; // For operational lease
  includeComprehensiveKasko?: boolean;      // For operational lease or bundled
}

export interface LeaseTaxSavings {
  vatDeductionTotal: number;       // 18% input VAT deductible for corporate/entrepreneur
  profitTaxSavingsTotal: number;   // 20% Corporate Profit Tax saved via lease expense deduction
  totalFiscalBenefit: number;      // sum of VAT + profit tax savings
  netCashflowCost: number;         // totalPayments - totalFiscalBenefit
}

export interface BankLoanComparison {
  bankLoanMonthly: number;
  bankLoanTotalCost: number;
  monthlyDifference: number;       // lease monthly - bank monthly
  leasingTaxAdvantageAzn: number;  // net fiscal benefits of leasing over bank loan
  recommendation: 'lease_preferred' | 'loan_preferred' | 'neutral';
}

export interface LeaseCalculationResult {
  vehiclePrice: number;
  downPaymentPercent: number;
  downPaymentAmount: number;
  financedAmount: number;
  balloonPaymentPercent: number;
  balloonPaymentAmount: number;
  monthlyBasePayment: number;
  monthlyServiceFee: number;
  totalMonthlyPayment: number;
  totalInterest: number;
  totalPayments: number;
  totalCostOfLeasing: number;
  taxSavings: LeaseTaxSavings;
  comparisonVsBankLoan: BankLoanComparison;
  schedule: LeaseScheduleRow[];
  contractId: string;
  approvalStatus: 'pre_approved' | 'conditional' | 'review_required';
  maxEligibleMonthlyBudget: number;
}

export interface LeaseContractRecord {
  contractId: string;
  lesseeName: string;
  lesseeVoenOrFin: string;
  customerType: CustomerType;
  lessorName: string;
  vehicleDescription: string;
  vehiclePlate: string;
  vehicleVin: string;
  vehiclePrice: number;
  termMonths: number;
  monthlyPayment: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'settled' | 'pending_approval';
  leaseType: LeaseType;
}

// Exchange rates relative to AZN (1 AZN = ...)
export const CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1.0,
  USD: 0.5882, // 1 AZN = 0.5882 USD (1.70 AZN / USD)
  EUR: 0.5405, // 1 AZN = 0.5405 EUR (1.85 AZN / EUR)
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  AZN: '₼',
  USD: '$',
  EUR: '€',
};

/**
 * Currency conversion utility
 */
export function convertCurrency(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount;
  // Convert from origin to AZN first
  const inAzn = from === 'AZN' ? amount : amount / CURRENCY_RATES[from];
  // Convert AZN to target
  return to === 'AZN' ? inAzn : inAzn * CURRENCY_RATES[to];
}

/**
 * Currency formatting utility
 */
export function formatCurrency(amount: number, currency: Currency = 'AZN'): string {
  const symbol = CURRENCY_SYMBOLS[currency] || '₼';
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
}

/**
 * Generate official AMB Lease Contract ID
 * Format: AMB-LZG-2026-XXXXX
 */
export function generateLeaseContractId(): string {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `AMB-LZG-2026-${randomNum}`;
}

/**
 * Core Automobile Financial & Operational Lease Calculator
 * Adheres strictly to the AR Civil Code & AR Tax Code
 */
export function calculateVehicleLease(input: LeaseCalculationInput): LeaseCalculationResult {
  const {
    vehiclePrice,
    downPaymentPercent,
    termMonths,
    annualInterestRate,
    balloonPaymentPercent = 0,
    leaseType,
    customerType,
    isElectricVehicle = false,
    includeFullServiceMaintenance = false,
    includeComprehensiveKasko = false,
  } = input;

  const validPrice = Math.max(1000, vehiclePrice);
  const validDownPercent = Math.min(60, Math.max(10, downPaymentPercent));
  const validTerm = Math.min(84, Math.max(6, termMonths));
  const validRate = Math.max(1, annualInterestRate);
  const validBalloonPercent = leaseType === 'financial' 
    ? Math.min(30, Math.max(0, balloonPaymentPercent)) 
    : 0;

  const downPaymentAmount = Math.round((validPrice * validDownPercent) / 100);
  const balloonPaymentAmount = Math.round((validPrice * validBalloonPercent) / 100);
  const financedAmount = validPrice - downPaymentAmount;

  // Monthly interest rate
  const monthlyRate = validRate / 100 / 12;

  // Amortization calculation with Balloon payment
  // Present value of balloon payment at t=0
  const pvBalloon = balloonPaymentAmount / Math.pow(1 + monthlyRate, validTerm);
  const amortizablePrincipal = financedAmount - pvBalloon;

  // Standard annuity formula for amortizable principal
  let baseMonthlyPayment = 0;
  if (monthlyRate === 0) {
    baseMonthlyPayment = amortizablePrincipal / validTerm;
  } else {
    baseMonthlyPayment = (amortizablePrincipal * (monthlyRate * Math.pow(1 + monthlyRate, validTerm))) / 
      (Math.pow(1 + monthlyRate, validTerm) - 1);
  }

  // Plus interest on the balloon payment portion
  const balloonMonthlyInterest = balloonPaymentAmount * monthlyRate;
  const totalBaseAnnuity = baseMonthlyPayment + balloonMonthlyInterest;

  // Additional services for Operational Lease or optional add-ons
  let monthlyServiceFee = 0;
  if (leaseType === 'operational' || includeFullServiceMaintenance) {
    // Routine oil, brake pads, filters, seasonal tire changes, AZS diagnostic inspections (~120 AZN/mo)
    monthlyServiceFee += isElectricVehicle ? 60 : 120;
  }
  if (leaseType === 'operational' || includeComprehensiveKasko) {
    // 2.8% annual KASKO insurance divided by 12 months
    monthlyServiceFee += Math.round((validPrice * 0.028) / 12);
  }

  const totalMonthlyPayment = Math.round(totalBaseAnnuity + monthlyServiceFee);

  // Generate monthly amortization schedule
  const schedule: LeaseScheduleRow[] = [];
  let currentBalance = financedAmount;
  let accumulatedInterest = 0;

  for (let m = 1; m <= validTerm; m++) {
    const interestPart = currentBalance * monthlyRate;
    accumulatedInterest += interestPart;
    let principalPart = totalBaseAnnuity - interestPart;

    if (m === validTerm) {
      principalPart = currentBalance - balloonPaymentAmount;
    }

    const endingBalance = Math.max(balloonPaymentAmount, currentBalance - principalPart);
    // 18% VAT portion included on finance margin & service components
    const vatPortion = Math.round((interestPart + monthlyServiceFee) * 0.18);

    schedule.push({
      month: m,
      beginningBalance: Math.round(currentBalance),
      principalPayment: Math.round(principalPart),
      interestPayment: Math.round(interestPart),
      vatPortion,
      totalMonthlyPayment: Math.round(totalBaseAnnuity + monthlyServiceFee),
      endingBalance: Math.round(endingBalance),
    });

    currentBalance = endingBalance;
  }

  const totalInterest = Math.round(accumulatedInterest);
  const totalPayments = Math.round(downPaymentAmount + (totalMonthlyPayment * validTerm) + balloonPaymentAmount);
  const totalCostOfLeasing = Math.max(0, totalPayments - validPrice);

  // Tax Benefits Evaluation (AR Vergi Məcəlləsi)
  // Corporate (MMC/QSC) and Individual Entrepreneurs (VÖEN) obtain statutory deductions:
  // 1. VAT input deduction: 18% of lease interest and operational service fees
  // 2. Profit Tax deduction: 20% of all leasing finance charges and operational lease payments
  let vatDeductionTotal = 0;
  let profitTaxSavingsTotal = 0;

  if (customerType === 'corporate' || customerType === 'entrepreneur') {
    // 18% VAT deduction on finance service margin & operational maintenance
    const totalVatEligibleExpenses = totalInterest + (monthlyServiceFee * validTerm);
    vatDeductionTotal = Math.round(totalVatEligibleExpenses * 0.18);

    // 20% Profit Tax deduction on total lease costs (or full operational lease value)
    if (leaseType === 'operational') {
      // 100% of operational lease payments are deductible operating expenses (OPEX)
      const totalOpexPayments = totalMonthlyPayment * validTerm;
      profitTaxSavingsTotal = Math.round(totalOpexPayments * 0.20);
    } else {
      // Financial lease: interest + accelerated 25% annual depreciation
      const totalDeductibleExpense = totalInterest + (validPrice * 0.25 * Math.min(3, validTerm / 12));
      profitTaxSavingsTotal = Math.round(totalDeductibleExpense * 0.20);
    }
  }

  const totalFiscalBenefit = vatDeductionTotal + profitTaxSavingsTotal;
  const netCashflowCost = Math.max(0, totalPayments - totalFiscalBenefit);

  // Bank Loan Comparison
  // Standard bank car loan: 18% interest rate, 20% down payment, no VAT or OPEX deductions for individuals
  const bankMonthlyRate = 0.18 / 12;
  const bankFinanced = validPrice * 0.8;
  const bankMonthly = Math.round(
    (bankFinanced * (bankMonthlyRate * Math.pow(1 + bankMonthlyRate, validTerm))) /
    (Math.pow(1 + bankMonthlyRate, validTerm) - 1)
  );
  const bankLoanTotalCost = Math.round((validPrice * 0.2) + (bankMonthly * validTerm));
  const monthlyDifference = totalMonthlyPayment - bankMonthly;
  const leasingTaxAdvantageAzn = totalFiscalBenefit;

  let recommendation: 'lease_preferred' | 'loan_preferred' | 'neutral' = 'neutral';
  if ((customerType === 'corporate' || customerType === 'entrepreneur') && totalFiscalBenefit > 1500) {
    recommendation = 'lease_preferred';
  } else if (customerType === 'individual' && leaseType === 'financial' && monthlyDifference > 100) {
    recommendation = 'loan_preferred';
  } else {
    recommendation = 'lease_preferred';
  }

  // Pre-approval assessment based on minimum required monthly income/revenue
  const maxEligibleMonthlyBudget = Math.round(totalMonthlyPayment * 2.2);
  let approvalStatus: 'pre_approved' | 'conditional' | 'review_required' = 'pre_approved';
  if (validDownPercent < 20 && validTerm > 48) {
    approvalStatus = 'conditional';
  } else if (validPrice > 120000 && validDownPercent < 25) {
    approvalStatus = 'review_required';
  }

  return {
    vehiclePrice: validPrice,
    downPaymentPercent: validDownPercent,
    downPaymentAmount,
    financedAmount,
    balloonPaymentPercent: validBalloonPercent,
    balloonPaymentAmount,
    monthlyBasePayment: Math.round(totalBaseAnnuity),
    monthlyServiceFee,
    totalMonthlyPayment,
    totalInterest,
    totalPayments,
    totalCostOfLeasing,
    taxSavings: {
      vatDeductionTotal,
      profitTaxSavingsTotal,
      totalFiscalBenefit,
      netCashflowCost,
    },
    comparisonVsBankLoan: {
      bankLoanMonthly: bankMonthly,
      bankLoanTotalCost,
      monthlyDifference,
      leasingTaxAdvantageAzn,
      recommendation,
    },
    schedule,
    contractId: generateLeaseContractId(),
    approvalStatus,
    maxEligibleMonthlyBudget,
  };
}

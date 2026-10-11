export interface AmortizationPeriod {
  period: number; // Month index: 1, 2, ...
  payment: number;
  principalPayment: number;
  interestPayment: number;
  remainingBalance: number;
  cumulativePrincipal: number;
  cumulativeInterest: number;
}

export interface AmortizationYearSummary {
  year: number; // Year index: 1, 2, ...
  startBalance: number;
  principalPaid: number;
  interestPaid: number;
  totalPaid: number;
  endingBalance: number;
  interestSharePercent: number;
}

export interface AmortizationCalculationOptions {
  carPrice: number;
  downPaymentPercent: number;
  termMonths: number;
  annualInterestRate: number;
  extraMonthlyPayment?: number;
}

export interface AmortizationSchedule {
  carPrice: number;
  downPaymentPercent: number;
  downPaymentAmount: number;
  principal: number;
  annualInterestRate: number;
  termMonths: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  extraMonthlyPayment: number;
  payoffMonths: number;
  monthsSaved: number;
  interestSaved: number;
  periods: AmortizationPeriod[];
  yearlySummaries: AmortizationYearSummary[];
}

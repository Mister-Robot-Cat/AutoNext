import { PriceStatus } from '../types/vehicle';

export interface LoanCalculationResult {
  downPaymentAmount: number;
  principal: number;
  monthlyPayment: number;
  totalRepayment: number;
  totalInterest: number;
  bankCommission: number;
  minimumRequiredIncome: number;
}

/**
 * Calculates monthly annuity car loan payment and financial breakdown
 */
export function calculateCarLoan(
  carPriceAzn: number,
  downPaymentPercent: number,
  termMonths: number,
  annualInterestRate: number,
  commissionPercent: number = 0.5
): LoanCalculationResult {
  const downPaymentAmount = Math.round(carPriceAzn * (downPaymentPercent / 100));
  const principal = Math.max(0, carPriceAzn - downPaymentAmount);

  if (principal === 0 || termMonths <= 0) {
    return {
      downPaymentAmount: carPriceAzn,
      principal: 0,
      monthlyPayment: 0,
      totalRepayment: 0,
      totalInterest: 0,
      bankCommission: 0,
      minimumRequiredIncome: 0,
    };
  }

  const monthlyRate = annualInterestRate / 100 / 12;
  const rateFactor = Math.pow(1 + monthlyRate, termMonths);
  const monthlyPayment = Math.round((principal * (monthlyRate * rateFactor)) / (rateFactor - 1));
  const totalRepayment = monthlyPayment * termMonths;
  const totalInterest = Math.max(0, totalRepayment - principal);
  const bankCommission = Math.round(principal * (commissionPercent / 100));
  const minimumRequiredIncome = Math.round(monthlyPayment * 2.2);

  return {
    downPaymentAmount,
    principal,
    monthlyPayment,
    totalRepayment,
    totalInterest,
    bankCommission,
    minimumRequiredIncome,
  };
}

/**
 * Evaluates vehicle price against market median
 */
export function evaluateMarketDeal(listedPrice: number, marketAvgPrice: number): {
  status: PriceStatus;
  percentageDiff: number;
} {
  if (marketAvgPrice <= 0) {
    return { status: 'fair_price', percentageDiff: 0 };
  }

  const diff = ((listedPrice - marketAvgPrice) / marketAvgPrice) * 100;
  const percentageDiff = Math.round(diff * 10) / 10;

  if (percentageDiff <= -5.0) {
    return { status: 'great_deal', percentageDiff };
  }
  if (percentageDiff < -1.5) {
    return { status: 'good_deal', percentageDiff };
  }
  if (percentageDiff <= 3.0) {
    return { status: 'fair_price', percentageDiff };
  }
  return { status: 'overpriced', percentageDiff };
}

import {
  AmortizationCalculationOptions,
  AmortizationPeriod,
  AmortizationSchedule,
  AmortizationYearSummary,
} from '../types/amortization';

/**
 * Calculates a complete monthly loan amortization schedule and yearly matrix breakdown.
 * Supports extra monthly payments with early payoff calculations.
 */
export function calculateAmortizationSchedule(
  options: AmortizationCalculationOptions
): AmortizationSchedule {
  const {
    carPrice,
    downPaymentPercent,
    termMonths,
    annualInterestRate,
    extraMonthlyPayment = 0,
  } = options;

  const downPaymentAmount = Math.round(carPrice * (Math.max(0, downPaymentPercent) / 100));
  const principal = Math.max(0, carPrice - downPaymentAmount);

  // Edge case: No loan or invalid term
  if (principal === 0 || termMonths <= 0) {
    return {
      carPrice,
      downPaymentPercent,
      downPaymentAmount,
      principal: 0,
      annualInterestRate,
      termMonths: Math.max(0, termMonths),
      monthlyPayment: 0,
      totalPayment: 0,
      totalInterest: 0,
      extraMonthlyPayment: 0,
      payoffMonths: 0,
      monthsSaved: 0,
      interestSaved: 0,
      periods: [],
      yearlySummaries: [],
    };
  }

  const monthlyRate = (annualInterestRate / 100) / 12;

  // Base monthly payment (annuity formula)
  let baseMonthlyPayment: number;
  if (monthlyRate === 0) {
    baseMonthlyPayment = Math.round(principal / termMonths);
  } else {
    const rateFactor = Math.pow(1 + monthlyRate, termMonths);
    baseMonthlyPayment = Math.round((principal * (monthlyRate * rateFactor)) / (rateFactor - 1));
  }

  // First calculate baseline total interest without extra payments
  let baselineTotalInterest = 0;
  {
    let bBalance = principal;
    for (let m = 1; m <= termMonths; m++) {
      const intPay = monthlyRate === 0 ? 0 : Math.round(bBalance * monthlyRate);
      let princPay = Math.min(bBalance, baseMonthlyPayment - intPay);
      if (m === termMonths || princPay >= bBalance) {
        princPay = bBalance;
      }
      baselineTotalInterest += intPay;
      bBalance = Math.max(0, bBalance - princPay);
      if (bBalance === 0) break;
    }
  }

  // Calculate actual schedule with extra payment
  const periods: AmortizationPeriod[] = [];
  let currentBalance = principal;
  let cumulativePrincipal = 0;
  let cumulativeInterest = 0;
  const extra = Math.max(0, extraMonthlyPayment);

  for (let month = 1; month <= termMonths && currentBalance > 0; month++) {
    const interestPayment = monthlyRate === 0 ? 0 : Math.round(currentBalance * monthlyRate);
    const standardPrincipal = Math.max(0, baseMonthlyPayment - interestPayment);
    let plannedPrincipal = standardPrincipal + extra;

    // Check if loan is paid off this month or final term reached
    let principalPayment: number;
    let payment: number;

    if (plannedPrincipal >= currentBalance || month === termMonths) {
      principalPayment = currentBalance;
      payment = principalPayment + interestPayment;
      currentBalance = 0;
    } else {
      principalPayment = plannedPrincipal;
      payment = baseMonthlyPayment + extra;
      currentBalance = Math.max(0, currentBalance - principalPayment);
    }

    cumulativePrincipal += principalPayment;
    cumulativeInterest += interestPayment;

    periods.push({
      period: month,
      payment,
      principalPayment,
      interestPayment,
      remainingBalance: currentBalance,
      cumulativePrincipal,
      cumulativeInterest,
    });
  }

  const payoffMonths = periods.length;
  const totalPayment = periods.reduce((sum, p) => sum + p.payment, 0);
  const totalInterest = periods.reduce((sum, p) => sum + p.interestPayment, 0);
  const monthsSaved = Math.max(0, termMonths - payoffMonths);
  const interestSaved = Math.max(0, baselineTotalInterest - totalInterest);

  // Generate yearly matrix breakdown
  const yearlySummaries: AmortizationYearSummary[] = [];
  const totalYears = Math.ceil(periods.length / 12);

  for (let year = 1; year <= totalYears; year++) {
    const startIdx = (year - 1) * 12;
    const endIdx = Math.min(periods.length, year * 12);
    const yearPeriods = periods.slice(startIdx, endIdx);

    if (yearPeriods.length === 0) continue;

    const startBalance = year === 1 ? principal : periods[startIdx - 1].remainingBalance;
    const principalPaid = yearPeriods.reduce((sum, p) => sum + p.principalPayment, 0);
    const interestPaid = yearPeriods.reduce((sum, p) => sum + p.interestPayment, 0);
    const totalPaid = yearPeriods.reduce((sum, p) => sum + p.payment, 0);
    const endingBalance = yearPeriods[yearPeriods.length - 1].remainingBalance;
    const interestSharePercent = totalPaid > 0 ? Math.round((interestPaid / totalPaid) * 1000) / 10 : 0;

    yearlySummaries.push({
      year,
      startBalance,
      principalPaid,
      interestPaid,
      totalPaid,
      endingBalance,
      interestSharePercent,
    });
  }

  return {
    carPrice,
    downPaymentPercent,
    downPaymentAmount,
    principal,
    annualInterestRate,
    termMonths,
    monthlyPayment: baseMonthlyPayment,
    totalPayment,
    totalInterest,
    extraMonthlyPayment: extra,
    payoffMonths,
    monthsSaved,
    interestSaved,
    periods,
    yearlySummaries,
  };
}

/**
 * Exports amortization schedule to CSV format.
 */
export function exportAmortizationToCsv(schedule: AmortizationSchedule): string {
  const headers = [
    'Period (Month)',
    'Payment (AZN)',
    'Principal (AZN)',
    'Interest (AZN)',
    'Remaining Balance (AZN)',
    'Cumulative Interest (AZN)',
  ];

  const rows = schedule.periods.map((p) => [
    p.period,
    p.payment,
    p.principalPayment,
    p.interestPayment,
    p.remainingBalance,
    p.cumulativeInterest,
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

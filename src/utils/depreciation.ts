export interface DepreciationPoint {
  yearOffset: number;
  calendarYear: number;
  projectedPriceAzn: number;
  retainedPercent: number; // e.g. 100%, 90%, 82%
  annualLossAzn: number;
}

export interface DepreciationForecast {
  currentPriceAzn: number;
  annualRatePercent: number;
  resaleScore: 'exceptional' | 'good' | 'average' | 'high_depreciation';
  retentionSummaryText: string;
  points: DepreciationPoint[];
}

/**
 * Calculates standard brand retention rates for Azerbaijan market
 */
export function getBrandDepreciationRate(make: string): number {
  const normalized = make.trim().toLowerCase();

  // Toyota / Lexus / Hyundai retain highest resale in Baku
  if (normalized.includes('toyota') || normalized.includes('lexus')) return 7.5;
  if (normalized.includes('hyundai') || normalized.includes('kia')) return 9.0;
  if (normalized.includes('byd')) return 11.0;
  if (normalized.includes('bmw') || normalized.includes('mercedes')) return 12.5;
  if (normalized.includes('porsche') || normalized.includes('range rover')) return 14.0;
  
  return 10.5; // default market average
}

/**
 * Calculates 5-year depreciation trajectory
 */
export function calculateDepreciationForecast(
  currentPriceAzn: number,
  make: string,
  modelYear: number
): DepreciationForecast {
  const annualRate = getBrandDepreciationRate(make);
  const currentYear = new Date().getFullYear();
  const points: DepreciationPoint[] = [];

  let runningPrice = currentPriceAzn;

  // Year 0 (today)
  points.push({
    yearOffset: 0,
    calendarYear: currentYear,
    projectedPriceAzn: currentPriceAzn,
    retainedPercent: 100,
    annualLossAzn: 0,
  });

  for (let offset = 1; offset <= 5; offset++) {
    const loss = Math.round(runningPrice * (annualRate / 100));
    runningPrice = Math.max(1000, runningPrice - loss);
    const retainedPercent = Math.round((runningPrice / currentPriceAzn) * 100);

    points.push({
      yearOffset: offset,
      calendarYear: currentYear + offset,
      projectedPriceAzn: runningPrice,
      retainedPercent,
      annualLossAzn: loss,
    });
  }

  let resaleScore: DepreciationForecast['resaleScore'] = 'good';
  let retentionSummaryText = 'Orta bazar dəyər qorunması';

  if (annualRate <= 8.0) {
    resaleScore = 'exceptional';
    retentionSummaryText = 'Yüksək likvidlik: Bakı bazarında dəyərini ən yaxşı qoruyan modellərdəndir.';
  } else if (annualRate <= 10.0) {
    resaleScore = 'good';
    retentionSummaryText = 'Yaxşı likvidlik: İkinci əl bazarında sabit tələbə malikdir.';
  } else if (annualRate <= 13.0) {
    resaleScore = 'average';
    retentionSummaryText = 'Standart premium amortizasiya dərəcəsi.';
  } else {
    resaleScore = 'high_depreciation';
    retentionSummaryText = 'Yüksək amortizasiya: İlk illərdə dəyərini daha sürətlə itirir.';
  }

  return {
    currentPriceAzn,
    annualRatePercent: annualRate,
    resaleScore,
    retentionSummaryText,
    points,
  };
}

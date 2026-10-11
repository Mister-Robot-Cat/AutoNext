import { describe, it, expect } from 'vitest';
import { generatePriceHistory, getLocalizedMonth } from '../priceHistory';
import { Vehicle } from '../../types/vehicle';

describe('Price History Analytics Engine', () => {
  const baseVehicle: Vehicle = {
    id: 'car-history-test',
    title: 'BMW 530i M Sport',
    vin: 'WBA5A7C50JB192841',
    make: 'BMW',
    model: '530i',
    year: 2021,
    priceAzn: 68500,
    mileageKm: 42000,
    engineVolumeLiters: 2.0,
    fuelType: 'petrol',
    transmission: 'automatic',
    drivetrain: 'rwd',
    powerHp: 252,
    fuelConsumptionLPer100Km: 6.8,
    bodyType: 'sedan',
    color: 'Mineral Grey Metallic',
    interiorColor: 'Cognac Brown',
    interiorMaterial: 'leather',
    city: 'Bakı',
    images: ['https://example.com/bmw.jpg'],
    features: ['M Sport Package'],
    damageReport: [],
    valuation: {
      status: 'great_deal',
      percentageDiff: -7.5,
      avgMarketPriceAzn: 74000,
      minMarketPriceAzn: 69000,
      maxMarketPriceAzn: 79000,
      confidenceScore: 94,
      priceHistoryTrend: [
        { month: 'Yan', avgPrice: 77000 },
        { month: 'Fev', avgPrice: 76000 },
        { month: 'Mar', avgPrice: 75200 },
        { month: 'Apr', avgPrice: 74000 },
      ],
    },
    seller: {
      id: 'sel-1',
      name: 'Rəşad Əliyev',
      phone: '+994 50 211 44 88',
      type: 'private',
      rating: 4.9,
      reviewsCount: 14,
      verifiedIdentity: true,
      memberSinceYear: 2021,
      city: 'Bakı',
    },
    isFeatured: true,
    isVerified: true,
    hasCustomsCleared: true,
    isCreditAvailable: true,
    isBarterAvailable: false,
    publishedDate: '2026-03-01',
    viewsCount: 1420,
    description: 'Avtomobil ideal vəziyyətdədir.',
  };

  it('generates price history report with correct vehicle metadata', () => {
    const report = generatePriceHistory(baseVehicle);

    expect(report.vehicleId).toBe('car-history-test');
    expect(report.vehicleTitle).toBe('BMW 530i M Sport');
    expect(report.vin).toBe('WBA5A7C50JB192841');
    expect(report.events.length).toBeGreaterThanOrEqual(2);
  });

  it('calculates price drops and negative change for great_deal vehicles', () => {
    const report = generatePriceHistory(baseVehicle);

    expect(report.metrics.priceDropsCount).toBe(2);
    expect(report.metrics.initialPriceAzn).toBeGreaterThan(baseVehicle.priceAzn);
    expect(report.metrics.totalChangeAzn).toBeLessThan(0);
    expect(report.metrics.totalChangePercent).toBeLessThan(0);
    expect(report.metrics.lowestPriceAzn).toBe(baseVehicle.priceAzn);
  });

  it('computes offer acceptance probabilities correctly', () => {
    const report = generatePriceHistory(baseVehicle);
    const { acceptanceProbabilityPercent } = report.metrics;

    // Offering at or above current price yields high acceptance probability
    expect(acceptanceProbabilityPercent(68500)).toBe(99);
    expect(acceptanceProbabilityPercent(70000)).toBe(99);

    // Offering slightly below target offer yields reasonable probability
    const targetOffer = report.metrics.recommendedOfferRange.targetAzn;
    expect(acceptanceProbabilityPercent(targetOffer)).toBeGreaterThanOrEqual(50);

    // Very low offer yields low probability
    expect(acceptanceProbabilityPercent(10000)).toBeLessThanOrEqual(15);
  });

  it('generates accurate metrics for overpriced vehicles with price increase event', () => {
    const overpricedCar: Vehicle = {
      ...baseVehicle,
      priceAzn: 82000,
      valuation: {
        ...baseVehicle.valuation,
        status: 'overpriced',
        percentageDiff: 10.8,
        avgMarketPriceAzn: 74000,
      },
    };

    const report = generatePriceHistory(overpricedCar);

    expect(report.metrics.totalChangeAzn).toBeGreaterThan(0);
    expect(report.events.some((e) => e.type === 'increase')).toBe(true);
    expect(report.metrics.negotiationAdvice.az).toContain('endirim müzakirəsi');
  });

  it('generates accurate metrics for fair_price vehicles with stable trend', () => {
    const fairCar: Vehicle = {
      ...baseVehicle,
      priceAzn: 74000,
      valuation: {
        ...baseVehicle.valuation,
        status: 'fair_price',
        percentageDiff: 0,
        avgMarketPriceAzn: 74000,
      },
    };

    const report = generatePriceHistory(fairCar);

    expect(report.metrics.totalChangeAzn).toBe(0);
    expect(report.metrics.totalChangePercent).toBe(0);
    expect(report.events.some((e) => e.type === 'stable')).toBe(true);
    expect(report.metrics.volatilityScore).toBeLessThanOrEqual(20);
  });

  it('formats localized month strings across languages', () => {
    expect(getLocalizedMonth('2026-04-15', 'az')).toBe('Apr 26');
    expect(getLocalizedMonth('2026-04-15', 'en')).toBe('Apr 26');
    expect(getLocalizedMonth('2026-04-15', 'ru')).toBe('Апр 26');
  });
});

import { describe, it, expect } from 'vitest';
import {
  calculateGreenCardTariff,
  calculateBorderReadiness,
  calculateTransitFuelEstimates,
  formatGreenCardAmount,
  generateGreenCardPolicyRecord,
  generateBorderTransitDeclaration,
  getCategoryTitle,
  getZoneTitle,
  getDurationTitle,
  getDurationDays,
  calculateExpiryDate,
  GREEN_CARD_STATUTORY_TARIFFS,
} from '../greenCard';

describe('greenCard calculation and tariff engine', () => {
  it('correctly calculates statutory tariffs for passenger car in Zone 3 (Georgia/Turkey)', () => {
    const res15Days = calculateGreenCardTariff('passenger', 'zone_3_georgia_turkey', '15_days', 'AZN');
    expect(res15Days.totalCostAzn).toBe(25);
    expect(res15Days.durationDays).toBe(15);
    expect(res15Days.coverageCountriesCount).toBe(2);

    const res1Month = calculateGreenCardTariff('passenger', 'zone_3_georgia_turkey', '1_month', 'AZN');
    expect(res1Month.totalCostAzn).toBe(45);
    expect(res1Month.durationDays).toBe(30);

    const res1Year = calculateGreenCardTariff('passenger', 'zone_3_georgia_turkey', '1_year', 'AZN');
    expect(res1Year.totalCostAzn).toBe(280);
    expect(res1Year.durationDays).toBe(365);
  });

  it('correctly calculates statutory tariffs for passenger car in Zone 1 (All 47 countries)', () => {
    const res15Days = calculateGreenCardTariff('passenger', 'zone_1_all', '15_days', 'AZN');
    expect(res15Days.totalCostAzn).toBe(60);
    expect(res15Days.coverageCountriesCount).toBe(47);

    const res1Month = calculateGreenCardTariff('passenger', 'zone_1_all', '1_month', 'AZN');
    expect(res1Month.totalCostAzn).toBe(110);

    const res1Year = calculateGreenCardTariff('passenger', 'zone_1_all', '1_year', 'AZN');
    expect(res1Year.totalCostAzn).toBe(700);
  });

  it('correctly calculates statutory tariffs for commercial trucks and motorcycles', () => {
    const moto = calculateGreenCardTariff('motorcycle', 'zone_3_georgia_turkey', '15_days', 'AZN');
    expect(moto.totalCostAzn).toBe(13);

    const truck = calculateGreenCardTariff('truck', 'zone_1_all', '1_year', 'AZN');
    expect(truck.totalCostAzn).toBe(1400);

    const minibus = calculateGreenCardTariff('minibus', 'zone_2_regional', '1_month', 'AZN');
    expect(minibus.totalCostAzn).toBe(90);

    const trailer = calculateGreenCardTariff('trailer', 'zone_3_georgia_turkey', '15_days', 'AZN');
    expect(trailer.totalCostAzn).toBe(8);
  });

  it('converts costs accurately into USD and EUR currencies', () => {
    const resUsd = calculateGreenCardTariff('passenger', 'zone_3_georgia_turkey', '1_month', 'USD');
    // 45 AZN / 1.70 = 26.47 USD
    expect(resUsd.convertedCost.currency).toBe('USD');
    expect(resUsd.convertedCost.amount).toBeCloseTo(26.47, 1);

    const resEur = calculateGreenCardTariff('passenger', 'zone_3_georgia_turkey', '1_month', 'EUR');
    // 45 AZN / 1.85 = 24.32 EUR
    expect(resEur.convertedCost.currency).toBe('EUR');
    expect(resEur.convertedCost.amount).toBeCloseTo(24.32, 1);
  });

  it('formats amounts with correct currency symbols', () => {
    expect(formatGreenCardAmount(45, 'AZN')).toBe('45 ₼');
    expect(formatGreenCardAmount(45, 'USD')).toBe('$26');
    expect(formatGreenCardAmount(45, 'EUR')).toBe('€24');
  });

  it('accurately calculates expiry dates', () => {
    const startDate = '2026-05-01';
    const expiry15 = calculateExpiryDate(startDate, '15_days');
    expect(expiry15).toBe('2026-05-16');

    const expiry30 = calculateExpiryDate(startDate, '1_month');
    expect(expiry30).toBe('2026-05-31');
  });

  it('returns valid duration days', () => {
    expect(getDurationDays('15_days')).toBe(15);
    expect(getDurationDays('1_month')).toBe(30);
    expect(getDurationDays('3_months')).toBe(90);
    expect(getDurationDays('6_months')).toBe(180);
    expect(getDurationDays('1_year')).toBe(365);
  });

  it('evaluates border compliance and readiness score correctly', () => {
    // Empty
    const emptyRes = calculateBorderReadiness([]);
    expect(emptyRes.readinessPercentage).toBe(0);
    expect(emptyRes.isReadyToCross).toBe(false);
    expect(emptyRes.missingMandatoryLabels.length).toBeGreaterThan(0);

    // All mandatory completed
    const allMandatoryIds = ['passport', 'texpasport', 'green_card', 'poa_crossborder', 'customs_declaration'];
    const passRes = calculateBorderReadiness(allMandatoryIds);
    expect(passRes.isReadyToCross).toBe(true);
    expect(passRes.missingMandatoryLabels.length).toBe(0);
    expect(passRes.readinessPercentage).toBe(83); // 5 of 6 items

    // Full 100% completed
    const fullRes = calculateBorderReadiness([...allMandatoryIds, 'oval_sticker_az']);
    expect(fullRes.readinessPercentage).toBe(100);
    expect(fullRes.isReadyToCross).toBe(true);
  });

  it('calculates transit fuel estimates, costs, and carbon footprint', () => {
    const distanceKm = 500; // Baku to Red bridge ~500 km
    const fuelRes = calculateTransitFuelEstimates(distanceKm, 8.0, 1.10);

    // (500 * 8) / 100 = 40 Liters
    expect(fuelRes.requiredFuelLiters).toBe(40);
    // 40 * 1.10 = 44 AZN
    expect(fuelRes.totalFuelCostAzn).toBe(44);
    // 40 * 2.31 = 92.4 kg CO2
    expect(fuelRes.estimatedCo2Kg).toBe(92.4);
  });

  it('generates authentic electronic Green Card policy records', () => {
    const policy = generateGreenCardPolicyRecord({
      insurerId: 'pasha-sigorta',
      insurerName: 'PAŞA Sığorta ASC',
      zoneId: 'zone_3_georgia_turkey',
      category: 'passenger',
      duration: '1_month',
      plateNumber: '10-AA-555',
      make: 'Mercedes-Benz',
      model: 'E-Class',
      year: 2022,
      vin: 'WBA5A7C50JB192841',
      driverFullName: 'Əliyev Tural',
      driverFin: '1A2B3C4',
      passportNumber: 'C-12345678',
      startDate: '2026-06-01',
    });

    expect(policy.policyNumber).toContain('AZ/ISB-GC-2026-');
    expect(policy.barcode).toHaveLength(18);
    expect(policy.securityHash).toBeTruthy();
    expect(policy.plateNumber).toBe('10-AA-555');
    expect(policy.totalCostAzn).toBe(45);
    expect(policy.validFrom).toBe('2026-06-01');
    expect(policy.validUntil).toBe('2026-07-01');
    expect(policy.status).toBe('active');
  });

  it('generates authentic DGK customs transit declarations', () => {
    const declaration = generateBorderTransitDeclaration({
      customsCheckpointId: 'border-red-bridge',
      customsCheckpointName: 'Qırmızı Körpü',
      destinationCountry: 'Gürcüstan',
      purposeOfVisit: 'tourism',
      driverFullName: 'Əliyev Tural',
      driverFin: '1A2B3C4',
      passportNumber: 'C-12345678',
      plateNumber: '10-AA-555',
      vin: 'WBA5A7C50JB192841',
      make: 'Mercedes-Benz',
      model: 'E-Class',
      year: 2022,
      estimatedReturnDays: 10,
      fuelInTankLiters: 60,
    });

    expect(declaration.declarationNumber).toContain('DGK-TR-2026-');
    expect(declaration.dgkSecurityCode).toContain('DGK-');
    expect(declaration.destinationCountry).toBe('Gürcüstan');
    expect(declaration.purposeOfVisit).toBe('tourism');
    expect(declaration.fuelInTankLiters).toBe(60);
  });

  it('provides correct multilingual titles for categories, zones, and durations', () => {
    expect(getCategoryTitle('passenger', 'az')).toContain('Minik');
    expect(getCategoryTitle('passenger', 'en')).toContain('Passenger');
    expect(getCategoryTitle('passenger', 'ru')).toContain('Легковой');

    expect(getZoneTitle('zone_3_georgia_turkey', 'az')).toContain('3-cü Zona');
    expect(getZoneTitle('zone_3_georgia_turkey', 'en')).toContain('Zone 3');

    expect(getDurationTitle('1_month', 'az')).toBe('1 ay');
    expect(getDurationTitle('1_month', 'en')).toBe('1 month');
    expect(getDurationTitle('1_month', 'ru')).toBe('1 месяц');
  });
});

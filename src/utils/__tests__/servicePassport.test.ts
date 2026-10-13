import { describe, it, expect } from 'vitest';
import {
  calculateMaintenanceSchedule,
  getVehicleServiceRecords,
  calculatePassportSummary,
  compareServiceWorkshopCosts,
  filterServiceRecords,
  generateDigitalPassportReceipt,
} from '../servicePassport';
import { Vehicle } from '../../types/vehicle';
import { ServiceRecord } from '../../types/servicePassport';

const samplePetrolVehicle: Vehicle = {
  id: 'test-car-1',
  title: 'BMW 530i',
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
  color: 'Grey',
  interiorColor: 'Brown',
  interiorMaterial: 'leather',
  city: 'Bakı',
  images: [],
  features: [],
  damageReport: [],
  valuation: {
    status: 'fair_price',
    percentageDiff: 0,
    avgMarketPriceAzn: 68000,
    minMarketPriceAzn: 65000,
    maxMarketPriceAzn: 72000,
    confidenceScore: 92,
    priceHistoryTrend: [],
  },
  seller: {
    id: 's1',
    name: 'Elvin M.',
    phone: '+994 50 123 45 67',
    type: 'private',
    rating: 4.8,
    reviewsCount: 12,
    verifiedIdentity: true,
    memberSinceYear: 2021,
    city: 'Bakı',
  },
  hasCustomsCleared: true,
  isCreditAvailable: true,
  isBarterAvailable: false,
  publishedDate: '2024-01-15T12:00:00Z',
  viewsCount: 350,
  description: 'Avtomobil ideal vəziyyətdədir.',
};

const sampleEvVehicle: Vehicle = {
  ...samplePetrolVehicle,
  id: 'test-car-ev',
  vin: '5YJ3E1EB8LF719283',
  make: 'Tesla',
  model: 'Model 3',
  fuelType: 'electric',
  mileageKm: 31000,
};

const sampleHybridVehicle: Vehicle = {
  ...samplePetrolVehicle,
  id: 'test-car-hyb',
  vin: '4T1B11HK5MU129384',
  make: 'Toyota',
  model: 'Camry',
  fuelType: 'hybrid',
  mileageKm: 58000,
};

const sampleDieselVehicle: Vehicle = {
  ...samplePetrolVehicle,
  id: 'test-car-die',
  vin: 'WDD2050401R382910',
  make: 'Mercedes-Benz',
  model: 'C 220d',
  fuelType: 'diesel',
  mileageKm: 65000,
};

describe('calculateMaintenanceSchedule', () => {
  it('generates petrol-specific schedule with spark plugs and engine oil', () => {
    const schedule = calculateMaintenanceSchedule(samplePetrolVehicle);
    expect(schedule.length).toBeGreaterThan(0);
    const hasOil = schedule.some((i) => i.id === 'pet-oil-service');
    const hasSpark = schedule.some((i) => i.id === 'pet-spark-plugs');
    expect(hasOil).toBe(true);
    expect(hasSpark).toBe(true);
  });

  it('generates EV-specific schedule without spark plugs or engine oil', () => {
    const schedule = calculateMaintenanceSchedule(sampleEvVehicle);
    expect(schedule.length).toBeGreaterThan(0);
    const hasSpark = schedule.some((i) => i.id.includes('spark'));
    const hasEngineOil = schedule.some((i) => i.id === 'pet-oil-service');
    const hasCoolant = schedule.some((i) => i.id === 'ev-coolant-flush');
    const hasHepa = schedule.some((i) => i.id === 'ev-hepa-filter');
    expect(hasSpark).toBe(false);
    expect(hasEngineOil).toBe(false);
    expect(hasCoolant).toBe(true);
    expect(hasHepa).toBe(true);
  });

  it('generates hybrid-specific schedule with battery fan cleaning', () => {
    const schedule = calculateMaintenanceSchedule(sampleHybridVehicle);
    const hasFan = schedule.some((i) => i.id === 'hyb-battery-fan');
    const hasTransaxle = schedule.some((i) => i.id === 'hyb-transaxle-fluid');
    expect(hasFan).toBe(true);
    expect(hasTransaxle).toBe(true);
  });

  it('generates diesel-specific schedule with fuel filter and Low SAPS oil', () => {
    const schedule = calculateMaintenanceSchedule(sampleDieselVehicle);
    const hasDieselOil = schedule.some((i) => i.id === 'die-oil-service');
    const hasFuelFilter = schedule.some((i) => i.id === 'die-fuel-filter');
    expect(hasDieselOil).toBe(true);
    expect(hasFuelFilter).toBe(true);
  });

  it('correctly calculates overdue and due_soon statuses based on mileage', () => {
    // 59,500 km: 60,000 km item has 500 km remaining (< 2000 => due_soon)
    const scheduleDueSoon = calculateMaintenanceSchedule(samplePetrolVehicle, 59500);
    const gearboxItem = scheduleDueSoon.find((i) => i.intervalKm === 60000);
    expect(gearboxItem).toBeDefined();
    expect(gearboxItem?.urgency).toBe('due_soon');
    expect(gearboxItem?.remainingKm).toBe(500);

    // 60,500 km: 60,000 km cycle has passed, remaining is 59,500 km until 120k km (next cycle)
    // But if we test custom remaining:
    const customSchedule = calculateMaintenanceSchedule(samplePetrolVehicle, 40500);
    const oilItem = customSchedule.find((i) => i.intervalKm === 10000);
    // next due is 50,000, remaining is 9,500 => upcoming
    expect(oilItem?.urgency).toBe('upcoming');
  });

  it('applies brand multiplier to luxury cars (BMW vs Toyota)', () => {
    const bmwSchedule = calculateMaintenanceSchedule(samplePetrolVehicle);
    const toyotaPetrol: Vehicle = {
      ...samplePetrolVehicle,
      make: 'Toyota',
      model: 'Corolla',
    };
    const toyotaSchedule = calculateMaintenanceSchedule(toyotaPetrol);

    const bmwOil = bmwSchedule.find((i) => i.id === 'pet-oil-service');
    const toyotaOil = toyotaSchedule.find((i) => i.id === 'pet-oil-service');
    expect(bmwOil!.dealerEstimatedCostAzn).toBeGreaterThan(toyotaOil!.dealerEstimatedCostAzn);
  });
});

describe('getVehicleServiceRecords', () => {
  it('retrieves pre-seeded records for existing BMW VIN', () => {
    const records = getVehicleServiceRecords(samplePetrolVehicle.vin);
    expect(records.length).toBe(4);
    expect(records[0].workshopName).toContain('Improtex Motors');
    expect(records.every((r) => r.verifiedStamp)).toBe(true);
  });

  it('synthesizes realistic records when VIN is not pre-seeded but vehicle is provided', () => {
    const unseededCar: Vehicle = {
      ...samplePetrolVehicle,
      vin: 'UNSEEDED123456789',
      mileageKm: 35000,
    };
    const records = getVehicleServiceRecords(unseededCar.vin, unseededCar);
    expect(records.length).toBeGreaterThan(0);
    expect(records[0].vehicleVin).toBe('UNSEEDED123456789');
  });

  it('returns empty array if VIN not seeded and no vehicle provided', () => {
    const records = getVehicleServiceRecords('NON_EXISTENT_VIN');
    expect(records).toEqual([]);
  });
});

describe('calculatePassportSummary', () => {
  it('computes summary score, life percentages and counts', () => {
    const records = getVehicleServiceRecords(samplePetrolVehicle.vin);
    const schedule = calculateMaintenanceSchedule(samplePetrolVehicle);
    const summary = calculatePassportSummary(samplePetrolVehicle, records, schedule);

    expect(summary.vehicleVin).toBe(samplePetrolVehicle.vin);
    expect(summary.overallHealthScore).toBeGreaterThanOrEqual(25);
    expect(summary.overallHealthScore).toBeLessThanOrEqual(100);
    expect(summary.serviceComplianceRate).toBeGreaterThan(0);
    expect(summary.totalHistoricalSpentAzn).toBeGreaterThan(0);
    expect(summary.verifiedDealerRecordsCount).toBe(4);
    expect(summary.oilLifePercentage).toBeGreaterThanOrEqual(0);
    expect(summary.brakeLifePercentage).toBeGreaterThanOrEqual(0);
    expect(summary.batteryHealthPercentage).toBeGreaterThan(70);
  });
});

describe('compareServiceWorkshopCosts', () => {
  it('calculates savings in AZN and percentage', () => {
    const schedule = calculateMaintenanceSchedule(samplePetrolVehicle);
    const item = schedule[0];
    const comparison = compareServiceWorkshopCosts(item, 'AZN');

    expect(comparison.dealerCost).toBeGreaterThan(comparison.independentCost);
    expect(comparison.savingsAzn).toBe(comparison.dealerCost - comparison.independentCost);
    expect(comparison.savingsPercent).toBeGreaterThan(0);
  });

  it('converts costs properly for USD and EUR', () => {
    const schedule = calculateMaintenanceSchedule(samplePetrolVehicle);
    const item = schedule[0];
    const usdComparison = compareServiceWorkshopCosts(item, 'USD');
    const eurComparison = compareServiceWorkshopCosts(item, 'EUR');

    expect(usdComparison.convertedDealerCost).toBeLessThan(usdComparison.dealerCost);
    expect(eurComparison.convertedDealerCost).toBeLessThan(eurComparison.dealerCost);
  });
});

describe('filterServiceRecords', () => {
  const mockRecords: ServiceRecord[] = [
    {
      id: 'rec-1',
      vehicleVin: 'TESTVIN',
      date: '2024-01-01',
      mileageKm: 10000,
      category: 'oil_filter',
      serviceTitleAz: 'Yağ Dəyişimi',
      serviceTitleEn: 'Oil Change',
      serviceTitleRu: 'Замена масла',
      workshopName: 'Improtex Motors',
      workshopType: 'official_dealer',
      costAzn: 300,
      performedOperations: ['Yağ dəyişildi'],
      replacedParts: ['Filtr'],
      verifiedStamp: true,
      invoiceNumber: 'INV-100',
    },
    {
      id: 'rec-2',
      vehicleVin: 'TESTVIN',
      date: '2024-06-01',
      mileageKm: 25000,
      category: 'brakes',
      serviceTitleAz: 'Tormoz Bəndləri',
      serviceTitleEn: 'Brake Pads',
      serviceTitleRu: 'Тормозные колодки',
      workshopName: 'Bosch Car Service',
      workshopType: 'certified_independent',
      costAzn: 150,
      performedOperations: ['Bəndlər dəyişdirildi'],
      replacedParts: ['Keramik bənd'],
      verifiedStamp: false,
      invoiceNumber: 'INV-200',
    },
  ];

  it('filters by category', () => {
    const filtered = filterServiceRecords(mockRecords, { category: 'oil_filter' });
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('rec-1');
  });

  it('filters by workshopType', () => {
    const filtered = filterServiceRecords(mockRecords, { workshopType: 'certified_independent' });
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('rec-2');
  });

  it('filters by onlyVerifiedStamps', () => {
    const filtered = filterServiceRecords(mockRecords, { onlyVerifiedStamps: true });
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('rec-1');
  });

  it('filters by search query matching workshop name or title', () => {
    const filtered = filterServiceRecords(mockRecords, { searchQuery: 'bosch' });
    expect(filtered.length).toBe(1);
    expect(filtered[0].workshopName).toContain('Bosch');
  });
});

describe('generateDigitalPassportReceipt', () => {
  it('formats receipt with vehicle details and checklist items', () => {
    const records = getVehicleServiceRecords(samplePetrolVehicle.vin);
    const schedule = calculateMaintenanceSchedule(samplePetrolVehicle);
    const summary = calculatePassportSummary(samplePetrolVehicle, records, schedule);
    const receipt = generateDigitalPassportReceipt(samplePetrolVehicle, summary, schedule);

    expect(receipt).toContain('BMW 530i');
    expect(receipt).toContain(samplePetrolVehicle.vin);
    expect(receipt).toContain('AUTONEXT AZERBAIJAN');
    expect(receipt).toContain(summary.overallHealthScore.toString());
  });
});

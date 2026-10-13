import { describe, it, expect } from 'vitest';
import {
  isCurrentTimeNight,
  getBodyTypeMultiplier,
  findNearestDepot,
  findAvailableTruck,
  calculateEstimatedArrivalMinutes,
  calculateRoadsideAssistanceCost,
  generateDispatchReferenceCode,
  createAssistanceOrder,
  formatRoadsideAmount,
} from '../roadsideAssistance';
import { ROADSIDE_SERVICES, AZERBAIJAN_DISTRICTS } from '../../data/mockRoadsideData';

describe('Roadside Assistance Calculation & Dispatch Engine', () => {
  it('correctly detects night hours (22:00 - 07:00)', () => {
    const dayDate = new Date('2026-10-14T14:30:00');
    const nightDateLate = new Date('2026-10-14T23:15:00');
    const nightDateEarly = new Date('2026-10-14T03:45:00');

    expect(isCurrentTimeNight(dayDate)).toBe(false);
    expect(isCurrentTimeNight(nightDateLate)).toBe(true);
    expect(isCurrentTimeNight(nightDateEarly)).toBe(true);
  });

  it('determines correct body type multipliers for towing operations', () => {
    expect(getBodyTypeMultiplier('tow_flatbed', 'sedan')).toBe(1.0);
    expect(getBodyTypeMultiplier('tow_flatbed', 'suv')).toBe(1.2);
    expect(getBodyTypeMultiplier('tow_flatbed', 'minivan')).toBe(1.4);
    expect(getBodyTypeMultiplier('tow_flatbed', 'pickup')).toBe(1.4);

    // Non-towing services should have no body multiplier penalty
    expect(getBodyTypeMultiplier('battery_jumpstart', 'suv')).toBe(1.0);
    expect(getBodyTypeMultiplier('tire_puncture', 'minivan')).toBe(1.0);
    expect(getBodyTypeMultiplier('emergency_fuel', 'suv')).toBe(1.0);
  });

  it('finds the nearest depot hub for a district', () => {
    const nasimiDepot = findNearestDepot('loc_nasimi');
    expect(nasimiDepot.id).toBe('depo_center');

    const sumgayitDepot = findNearestDepot('loc_sumgayit');
    expect(sumgayitDepot.id).toBe('depo_sumgayit');

    const invalidDepot = findNearestDepot('non_existent_loc');
    expect(invalidDepot).toBeDefined();
  });

  it('allocates the appropriate truck type based on the emergency service', () => {
    const craneTruck = findAvailableTruck('tow_heavy_winch', 'loc_nasimi');
    expect(craneTruck.truckType).toBe('crane_manipulator');

    const vanTruck = findAvailableTruck('battery_jumpstart', 'loc_nasimi');
    expect(vanTruck.truckType).toBe('mobile_service_van');

    const flatbedTruck = findAvailableTruck('tow_flatbed', 'loc_nasimi');
    expect(flatbedTruck.truckType).toBe('flatbed_slide');
  });

  it('calculates estimated arrival minutes within reasonable bounds', () => {
    const shortDistanceEta = calculateEstimatedArrivalMinutes(4, false);
    expect(shortDistanceEta).toBeGreaterThanOrEqual(10);
    expect(shortDistanceEta).toBeLessThanOrEqual(20);

    const longDistanceEta = calculateEstimatedArrivalMinutes(60, false);
    expect(longDistanceEta).toBeGreaterThan(60);

    const nightEta = calculateEstimatedArrivalMinutes(30, true);
    const dayEta = calculateEstimatedArrivalMinutes(30, false);
    expect(nightEta).toBeLessThanOrEqual(dayEta);
  });

  it('calculates standard base cost within free 8km zone without surcharges', () => {
    const result = calculateRoadsideAssistanceCost({
      serviceType: 'tow_flatbed',
      districtId: 'loc_nasimi', // 4 km distance
      bodyType: 'sedan',
      isNightTime: false,
      currency: 'AZN',
    });

    expect(result.baseFeeAzn).toBe(40);
    expect(result.distanceFeeAzn).toBe(0);
    expect(result.bodyMultiplierFeeAzn).toBe(0);
    expect(result.nightSurgeFeeAzn).toBe(0);
    expect(result.totalCostAzn).toBe(40);
    expect(result.convertedTotal).toBe(40);
    expect(result.vatAmountAzn).toBe(7.2); // 18% of 40
  });

  it('calculates excess distance fees when district is farther than 8km', () => {
    // Khazar district is 22 km distance. Excess = 22 - 8 = 14 km. 14 * 1.5 = 21 AZN.
    const result = calculateRoadsideAssistanceCost({
      serviceType: 'tow_flatbed',
      districtId: 'loc_khazar',
      bodyType: 'sedan',
      isNightTime: false,
      currency: 'AZN',
    });

    expect(result.distanceKm).toBe(22);
    expect(result.distanceFeeAzn).toBe(21);
    expect(result.totalCostAzn).toBe(40 + 21);
  });

  it('applies body type weight multiplier for SUVs and Minivans', () => {
    const suvResult = calculateRoadsideAssistanceCost({
      serviceType: 'tow_flatbed',
      districtId: 'loc_nasimi',
      bodyType: 'suv',
      isNightTime: false,
      currency: 'AZN',
    });

    // 40 base * 0.2 = 8 AZN body penalty
    expect(suvResult.bodyMultiplier).toBe(1.2);
    expect(suvResult.bodyMultiplierFeeAzn).toBe(8);
    expect(suvResult.totalCostAzn).toBe(48);
  });

  it('applies night surge multiplier (30%) during night hours', () => {
    const nightResult = calculateRoadsideAssistanceCost({
      serviceType: 'tow_flatbed',
      districtId: 'loc_nasimi',
      bodyType: 'sedan',
      isNightTime: true,
      currency: 'AZN',
    });

    expect(nightResult.nightSurgeMultiplier).toBe(1.3);
    expect(nightResult.nightSurgeFeeAzn).toBe(12); // 40 * 0.3 = 12
    expect(nightResult.totalCostAzn).toBe(52);
  });

  it('converts total amount accurately into USD and EUR currencies', () => {
    const aznResult = calculateRoadsideAssistanceCost({
      serviceType: 'tow_flatbed',
      districtId: 'loc_nasimi',
      currency: 'AZN',
    });

    const usdResult = calculateRoadsideAssistanceCost({
      serviceType: 'tow_flatbed',
      districtId: 'loc_nasimi',
      currency: 'USD',
    });

    const eurResult = calculateRoadsideAssistanceCost({
      serviceType: 'tow_flatbed',
      districtId: 'loc_nasimi',
      currency: 'EUR',
    });

    expect(aznResult.convertedTotal).toBe(40);
    expect(usdResult.convertedTotal).toBe(Math.round(40 / 1.70));
    expect(eurResult.convertedTotal).toBe(Math.round(40 / 1.85));
  });

  it('generates dispatch reference codes conforming to the official pattern', () => {
    const code = generateDispatchReferenceCode();
    expect(code).toMatch(/^SOS-156-BAKU-\d{4}$/);
  });

  it('creates a complete assistance order with assigned truck and verification', () => {
    const order = createAssistanceOrder({
      vehiclePlate: '99-ZZ-999',
      vehicleTitle: 'Mercedes E220d (2020)',
      serviceType: 'battery_jumpstart',
      districtId: 'loc_yasamal',
      locationDetails: 'Şərifzadə küçəsi 55',
      contactName: 'Anar Əliyev',
      contactPhone: '+994 (50) 111-22-33',
      bodyType: 'sedan',
      isNightTime: false,
      currency: 'AZN',
      notes: 'Akkumulyator tam boşalıb',
    });

    expect(order.orderId).toMatch(/^DISP-\d{4}-\d{4}$/);
    expect(order.vehiclePlate).toBe('99-ZZ-999');
    expect(order.status).toBe('assigned');
    expect(order.assignedTruck).toBeDefined();
    expect(order.assignedTruck.driverPhone).toBeDefined();
    expect(order.verificationCode).toMatch(/^AZ-156-\d{4}$/);
    expect(order.costBreakdown.totalCostAzn).toBeGreaterThan(0);
  });

  it('formats roadside amount strings properly', () => {
    expect(formatRoadsideAmount(50, 'AZN')).toBe('50 ₼');
  });
});

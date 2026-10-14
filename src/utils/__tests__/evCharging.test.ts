import { describe, it, expect } from 'vitest';
import { 
  calculateChargingSession, 
  filterStations, 
  calculateRouteReachability, 
  generateChargingReceipt,
  convertCurrency,
  getConnectorBadge,
  formatEvPower
} from '../evCharging';
import { MOCK_CHARGING_STATIONS, MOCK_GREEN_ROUTES } from '../../data/mockEvStations';

describe('evCharging utility calculations', () => {
  it('converts currencies correctly (AZN, USD, EUR)', () => {
    expect(convertCurrency(17.0, 'USD')).toBe(10.0);
    expect(convertCurrency(18.5, 'EUR')).toBe(10.0);
    expect(convertCurrency(25.5, 'AZN')).toBe(25.5);
  });

  it('formats power labels cleanly', () => {
    expect(formatEvPower(120.4)).toBe('120 kW');
    expect(formatEvPower(22)).toBe('22 kW');
  });

  it('provides correct badge info for connector types', () => {
    const ccs = getConnectorBadge('ccs2');
    expect(ccs.label).toBe('CCS 2');
    expect(ccs.color).toContain('blue');

    const gbt = getConnectorBadge('gbt_dc');
    expect(gbt.label).toBe('GB/T DC');
    expect(gbt.desc).toContain('Çin');

    const type2 = getConnectorBadge('type2');
    expect(type2.label).toBe('Type 2');
  });

  it('returns zero metrics when target SoC is less than or equal to current SoC', () => {
    const result = calculateChargingSession({
      batteryCapacityKwh: 70,
      currentSocPercent: 80,
      targetSocPercent: 50,
      chargerPowerKw: 120,
      maxVehicleAcceptanceKw: 150,
      tariffPerKwhAzn: 0.22,
      currency: 'AZN',
    });

    expect(result.energyNeededKwh).toBe(0);
    expect(result.estimatedMinutes).toBe(0);
    expect(result.costAzn).toBe(0);
    expect(result.addedRangeKm).toBe(0);
    expect(result.chargingStages).toHaveLength(0);
  });

  it('accurately calculates fast DC session from 15% to 80% with BMS stage breakdown', () => {
    const result = calculateChargingSession({
      batteryCapacityKwh: 71.8,
      currentSocPercent: 15,
      targetSocPercent: 80,
      chargerPowerKw: 180,
      maxVehicleAcceptanceKw: 140,
      tariffPerKwhAzn: 0.22,
      currency: 'AZN',
    });

    // 65% of 71.8 kWh is ~46.67 kWh net / 0.92 efficiency ≈ 50.7 kWh drawn
    expect(result.energyNeededKwh).toBeGreaterThan(45);
    expect(result.energyNeededKwh).toBeLessThan(55);
    // On 140 kW charger, 15-80% takes ~20 to 30 mins
    expect(result.estimatedMinutes).toBeGreaterThan(15);
    expect(result.estimatedMinutes).toBeLessThan(35);
    expect(result.costAzn).toBeGreaterThan(10);
    expect(result.addedRangeKm).toBeGreaterThan(250);
    expect(result.petrolSavingsAzn).toBeGreaterThan(result.costAzn);
    expect(result.co2SavedKg).toBeGreaterThan(25);
    expect(result.chargingStages.length).toBeGreaterThanOrEqual(2);
  });

  it('accounts for BMS taper when charging past 80% to 100%', () => {
    const resultTo80 = calculateChargingSession({
      batteryCapacityKwh: 100,
      currentSocPercent: 20,
      targetSocPercent: 80,
      chargerPowerKw: 200,
      maxVehicleAcceptanceKw: 200,
      tariffPerKwhAzn: 0.20,
      currency: 'AZN',
    });

    const resultTo100 = calculateChargingSession({
      batteryCapacityKwh: 100,
      currentSocPercent: 20,
      targetSocPercent: 100,
      chargerPowerKw: 200,
      maxVehicleAcceptanceKw: 200,
      tariffPerKwhAzn: 0.20,
      currency: 'AZN',
    });

    // Charging the final 20% (80->100%) adds significant time due to trickle charging
    const extraMinutesForFinal20Percent = resultTo100.estimatedMinutes - resultTo80.estimatedMinutes;
    expect(extraMinutesForFinal20Percent).toBeGreaterThan(15);
    expect(resultTo100.chargingStages.some(s => s.socRange.includes('90%'))).toBe(true);
  });

  it('handles 800V architecture with faster thermal retention', () => {
    const regularResult = calculateChargingSession({
      batteryCapacityKwh: 90,
      currentSocPercent: 10,
      targetSocPercent: 90,
      chargerPowerKw: 250,
      maxVehicleAcceptanceKw: 250,
      tariffPerKwhAzn: 0.25,
      currency: 'AZN',
      is800VArchitecture: false,
    });

    const v800Result = calculateChargingSession({
      batteryCapacityKwh: 90,
      currentSocPercent: 10,
      targetSocPercent: 90,
      chargerPowerKw: 250,
      maxVehicleAcceptanceKw: 250,
      tariffPerKwhAzn: 0.25,
      currency: 'AZN',
      is800VArchitecture: true,
    });

    expect(v800Result.estimatedMinutes).toBeLessThan(regularResult.estimatedMinutes);
  });

  it('calculates AC standard charging without false DC taper', () => {
    const acResult = calculateChargingSession({
      batteryCapacityKwh: 70,
      currentSocPercent: 20,
      targetSocPercent: 100,
      chargerPowerKw: 11,
      maxVehicleAcceptanceKw: 11,
      tariffPerKwhAzn: 0.12,
      currency: 'AZN',
    });

    // 56 kWh net / 0.92 = ~60.8 kWh / 11 kW ≈ 5.5 hours ≈ 330 mins
    expect(acResult.estimatedMinutes).toBeGreaterThan(280);
    expect(acResult.estimatedMinutes).toBeLessThan(370);
  });

  describe('filterStations', () => {
    it('returns all stations when filters are empty or "all"', () => {
      const all = filterStations(MOCK_CHARGING_STATIONS, {
        connector: 'all',
        operator: 'all',
      });
      expect(all.length).toBe(MOCK_CHARGING_STATIONS.length);
    });

    it('filters stations by text query in name or district', () => {
      const filtered = filterStations(MOCK_CHARGING_STATIONS, { query: 'Dəniz Mall' });
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('station-deniz-mall');
    });

    it('filters stations by specific connector type', () => {
      const gbtStations = filterStations(MOCK_CHARGING_STATIONS, { connector: 'gbt_dc' });
      expect(gbtStations.length).toBeGreaterThan(0);
      gbtStations.forEach((st) => {
        expect(st.connectors.some(c => c.type === 'gbt_dc')).toBe(true);
      });
    });

    it('filters stations by operator', () => {
      const tokBakuStations = filterStations(MOCK_CHARGING_STATIONS, { operator: 'tok_baku' });
      expect(tokBakuStations.length).toBeGreaterThan(0);
      tokBakuStations.forEach((st) => {
        expect(st.operator).toBe('tok_baku');
      });
    });

    it('filters stations by fast charging only', () => {
      const fastStations = filterStations(MOCK_CHARGING_STATIONS, { fastOnly: true });
      fastStations.forEach((st) => {
        expect(st.connectors.some(c => c.maxPowerKw >= 90)).toBe(true);
      });
    });

    it('filters stations by available connectors only', () => {
      const available = filterStations(MOCK_CHARGING_STATIONS, { availableOnly: true });
      available.forEach((st) => {
        expect(st.connectors.some(c => c.availableCount > 0)).toBe(true);
      });
    });
  });

  describe('calculateRouteReachability', () => {
    it('determines that a short route can be reached directly with plenty of battery', () => {
      const shortRoute = MOCK_GREEN_ROUTES[0]; // Baku - Sumgayit (35 km)
      const reach = calculateRouteReachability(71.8, 80, shortRoute);
      expect(reach.canReachDirectly).toBe(true);
      expect(reach.needsChargingStop).toBe(false);
      expect(reach.remainingSocPercent).toBeGreaterThan(65);
    });

    it('identifies when a long route needs a charging stop', () => {
      const longRoute = MOCK_GREEN_ROUTES[3]; // Baku - Ganja (365 km)
      const reach = calculateRouteReachability(60.0, 40, longRoute);
      expect(reach.canReachDirectly).toBe(false);
      expect(reach.needsChargingStop).toBe(true);
      expect(reach.suggestedStopStationName).toBeDefined();
    });
  });

  describe('generateChargingReceipt', () => {
    it('generates a valid receipt with authentic reference code, VAT, and totals', () => {
      const station = MOCK_CHARGING_STATIONS[0];
      const receipt = generateChargingReceipt({
        station,
        connectorType: 'gbt_dc',
        startSoc: 20,
        endSoc: 80,
        energyKwh: 45.5,
        durationMinutes: 28,
        maxPowerKw: 140,
        tariffPerKwhAzn: 0.22,
        currency: 'AZN',
        carPlate: '99-EV-777',
      });

      expect(receipt.sessionId).toMatch(/^TB-AZ-2026-\d{6}$/);
      expect(receipt.stationName).toBe(station.name);
      expect(receipt.totalAzn).toBe(10.01); // 45.5 * 0.22 = 10.01
      expect(receipt.vatAzn).toBeGreaterThan(1);
      expect(receipt.subtotalAzn + receipt.vatAzn).toBeCloseTo(receipt.totalAzn, 1);
      expect(receipt.qrVerificationCode).toContain('VERIFY-EV-AZ');
      expect(receipt.carPlate).toBe('99-EV-777');
    });
  });
});

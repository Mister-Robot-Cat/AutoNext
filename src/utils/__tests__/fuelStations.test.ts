import { describe, it, expect } from 'vitest';
import { 
  TARIF_SURASI_PRICES,
  mapVehicleFuelTypeToGrade,
  getOfficialFuelPrice,
  calculateEdvRefund,
  calculateCashback,
  calculateTripFuel,
  calculateFullTank,
  filterStations,
  generateFuelVoucher
} from '../fuelStations';
import { MOCK_FUEL_STATIONS } from '../../data/mockFuelStations';

describe('Fuel Stations & Tarif Şurası Utility Engine', () => {
  describe('Official Tarif Şurası Fuel Rates', () => {
    it('defines official state and market prices', () => {
      expect(TARIF_SURASI_PRICES.ai92).toBe(1.10);
      expect(TARIF_SURASI_PRICES.diesel).toBe(1.00);
      expect(TARIF_SURASI_PRICES.ai95).toBe(1.60);
      expect(TARIF_SURASI_PRICES.ai98).toBe(2.30);
      expect(TARIF_SURASI_PRICES.cng).toBe(0.45);
      expect(TARIF_SURASI_PRICES.lpg).toBe(0.65);
      expect(TARIF_SURASI_PRICES.electric).toBe(0.11);
    });

    it('correctly maps vehicle fuel types to fuel grades', () => {
      expect(mapVehicleFuelTypeToGrade('diesel')).toBe('diesel');
      expect(mapVehicleFuelTypeToGrade('electric')).toBe('electric');
      expect(mapVehicleFuelTypeToGrade('plug_in_hybrid')).toBe('ai95');
      expect(mapVehicleFuelTypeToGrade('hybrid')).toBe('ai92');
      expect(mapVehicleFuelTypeToGrade('petrol', 2.0)).toBe('ai92');
      expect(mapVehicleFuelTypeToGrade('petrol', 4.4)).toBe('ai95');
    });

    it('converts prices to target currencies accurately', () => {
      expect(getOfficialFuelPrice('ai92', 'AZN')).toBe(1.10);
      // 1.10 / 1.70 ≈ 0.65 USD
      expect(getOfficialFuelPrice('ai92', 'USD')).toBe(0.65);
      // 1.10 / 1.85 ≈ 0.59 EUR
      expect(getOfficialFuelPrice('ai92', 'EUR')).toBe(0.59);
    });
  });

  describe('calculateEdvRefund (18% VAT and 17.5% Cashless Refund)', () => {
    it('returns 0 for zero or negative amount', () => {
      const res = calculateEdvRefund(0);
      expect(res.vatAmountAzn).toBe(0);
      expect(res.edvRefundAzn).toBe(0);
    });

    it('calculates correct 18% embedded VAT and 17.5% refund for 118 AZN', () => {
      // 118 AZN total: base = 100 AZN, VAT = 18 AZN. 17.5% of 18 AZN = 3.15 AZN
      const res = calculateEdvRefund(118);
      expect(res.vatAmountAzn).toBe(18);
      expect(res.edvRefundAzn).toBe(3.15);
    });
  });

  describe('calculateCashback', () => {
    it('returns zero for zero or negative amount', () => {
      const res = calculateCashback(0, 'birbank');
      expect(res.cashbackAzn).toBe(0);
    });

    it('calculates 5% for Birbank with cap of 30 AZN', () => {
      const res100 = calculateCashback(100, 'birbank');
      expect(res100.cashbackAzn).toBe(5);
      expect(res100.ratePercent).toBe(5);

      const res1000 = calculateCashback(1000, 'birbank');
      expect(res1000.cashbackAzn).toBe(30); // capped at 30 AZN
    });

    it('calculates 4% for TamKart with cap of 25 AZN', () => {
      const res100 = calculateCashback(100, 'tamkart');
      expect(res100.cashbackAzn).toBe(4);

      const res1000 = calculateCashback(1000, 'tamkart');
      expect(res1000.cashbackAzn).toBe(25);
    });

    it('calculates 3% for Leobank and points for SOCAR/Azpetrol', () => {
      const resLeo = calculateCashback(100, 'leobank');
      expect(resLeo.cashbackAzn).toBe(3);

      const resSocar = calculateCashback(100, 'socar_club');
      expect(resSocar.cashbackAzn).toBe(1.5);

      const resAzpetrol = calculateCashback(100, 'azpetrol_red');
      expect(resAzpetrol.cashbackAzn).toBe(1.0);
    });
  });

  describe('calculateTripFuel', () => {
    it('calculates baseline highway consumption for 100km at 8 L/100km with no AC and 1 person', () => {
      const res = calculateTripFuel(100, 8.0, 'ai92', {
        withAC: false,
        passengerCount: 1,
        cityTrafficRatio: 0,
        cargoWeightKg: 0,
      });

      expect(res.effectiveConsumptionLPer100Km).toBe(8.0);
      expect(res.litersNeeded).toBe(8.0);
      expect(res.costAzn).toBe(8.8); // 8 * 1.10
      expect(res.co2Kg).toBe(18.5); // 8 * 2.31 ≈ 18.48 -> 18.5
      expect(res.stopsNeeded).toBe(0);
    });

    it('applies 10% AC multiplier and passenger penalties', () => {
      const res = calculateTripFuel(100, 8.0, 'ai92', {
        withAC: true, // +10% -> 8.8
        passengerCount: 3, // 2 extra passengers: +6% -> 8.8 * 1.06 ≈ 9.328
        cityTrafficRatio: 0,
        cargoWeightKg: 0,
      });

      expect(res.effectiveConsumptionLPer100Km).toBeGreaterThan(9.0);
      expect(res.litersNeeded).toBeGreaterThan(9.0);
      expect(res.costAzn).toBeGreaterThan(10.0);
    });

    it('calculates zero CO2 emissions for EV', () => {
      const res = calculateTripFuel(100, 18.0, 'electric', {
        withAC: false,
        passengerCount: 1,
        cityTrafficRatio: 0,
        cargoWeightKg: 0,
      });

      expect(res.co2Kg).toBe(0);
      expect(res.costAzn).toBe(1.98); // 18 * 0.11
    });

    it('calculates fuel stops for long distances', () => {
      // 1200 km trip with 10 L/100km requires 120 Liters -> at least 2 stops
      const res = calculateTripFuel(1200, 10.0, 'ai92', {
        withAC: false,
        passengerCount: 1,
        cityTrafficRatio: 0,
        cargoWeightKg: 0,
      });

      expect(res.litersNeeded).toBe(120);
      expect(res.stopsNeeded).toBe(2);
    });
  });

  describe('calculateFullTank', () => {
    it('calculates missing liters and cost accurately', () => {
      // Tank 60L, current 25% -> 45L needed
      const res = calculateFullTank(60, 25, 'ai92', 7.5, 'AZN', 'birbank');
      expect(res.missingLiters).toBe(45);
      expect(res.totalCostAzn).toBe(49.5); // 45 * 1.10
      expect(res.fullTankRangeKm).toBe(800); // (60 / 7.5) * 100
      expect(res.cashbackAzn).toBeGreaterThan(2);
      expect(res.edvRefundAzn).toBeGreaterThan(1);
    });
  });

  describe('filterStations', () => {
    it('filters by brand correctly', () => {
      const socarStations = filterStations(MOCK_FUEL_STATIONS, { brand: 'SOCAR' });
      expect(socarStations.length).toBeGreaterThan(0);
      expect(socarStations.every(s => s.brand === 'SOCAR')).toBe(true);

      const azpetrolStations = filterStations(MOCK_FUEL_STATIONS, { brand: 'Azpetrol' });
      expect(azpetrolStations.length).toBeGreaterThan(0);
      expect(azpetrolStations.every(s => s.brand === 'Azpetrol')).toBe(true);
    });

    it('filters by fuel grade availability', () => {
      const cngStations = filterStations(MOCK_FUEL_STATIONS, { fuelGrade: 'cng' });
      expect(cngStations.length).toBeGreaterThan(0);
      expect(cngStations.every(s => s.fuels.some(f => f.grade === 'cng' && f.inStock))).toBe(true);
    });

    it('filters by amenities like mosque or carWash', () => {
      const mosqueStations = filterStations(MOCK_FUEL_STATIONS, { amenity: 'mosque' });
      expect(mosqueStations.length).toBeGreaterThan(0);
      expect(mosqueStations.every(s => s.amenities.includes('mosque'))).toBe(true);
    });

    it('searches by text query matching address or district', () => {
      const babek = filterStations(MOCK_FUEL_STATIONS, { query: 'Babək' });
      expect(babek.length).toBeGreaterThan(0);
      expect(babek[0].address).toContain('Babək');
    });
  });

  describe('generateFuelVoucher', () => {
    it('generates an authentic electronic voucher', () => {
      const station = MOCK_FUEL_STATIONS[0];
      const voucher = generateFuelVoucher(
        station,
        'Toyota Camry 2.5 Hybrid',
        '99-AA-001',
        'ai92',
        40,
        'AZN',
        'birbank'
      );

      expect(voucher.voucherCode).toContain(station.brand.toUpperCase());
      expect(voucher.securityHash).toContain('AZ-EDV-');
      expect(voucher.vehiclePlate).toBe('99-AA-001');
      expect(voucher.volumeLiters).toBe(40);
      expect(voucher.totalAzn).toBe(44.0); // 40 * 1.10
      expect(voucher.edvRefundAzn).toBeGreaterThan(1);
      expect(voucher.cashbackAzn).toBeGreaterThan(2);
      expect(voucher.qrTelemetry).toContain('edvgerial.az');
    });
  });
});

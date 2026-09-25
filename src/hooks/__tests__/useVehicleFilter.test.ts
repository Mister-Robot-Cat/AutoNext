import { describe, it, expect } from 'vitest';
import { filterAndSortVehicles, DEFAULT_FILTER_STATE } from '../useVehicleFilter';
import { MOCK_VEHICLES } from '../../data/mockVehicles';
import { FilterState } from '../../types/vehicle';

describe('Vehicle Filter & Ranking Engine', () => {
  const baseFilters: FilterState = { ...DEFAULT_FILTER_STATE };

  it('returns all mock vehicles when default filters are active', () => {
    const results = filterAndSortVehicles(MOCK_VEHICLES, baseFilters);
    expect(results.length).toBe(MOCK_VEHICLES.length);
  });

  describe('Search Query Filtering', () => {
    it('matches vehicles by title case-insensitively', () => {
      const filters = { ...baseFilters, searchQuery: 'camry' };
      const results = filterAndSortVehicles(MOCK_VEHICLES, filters);
      expect(results.length).toBe(1);
      expect(results[0].title).toContain('Toyota Camry');
    });

    it('matches vehicles by make', () => {
      const filters = { ...baseFilters, searchQuery: 'porsche' };
      const results = filterAndSortVehicles(MOCK_VEHICLES, filters);
      expect(results.length).toBe(1);
      expect(results[0].make).toBe('Porsche');
    });

    it('matches vehicles by VIN code', () => {
      const filters = { ...baseFilters, searchQuery: 'WBA5A7C50JB192841' };
      const results = filterAndSortVehicles(MOCK_VEHICLES, filters);
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('car-1');
    });

    it('matches vehicles by city name', () => {
      const filters = { ...baseFilters, searchQuery: 'Gəncə' };
      const results = filterAndSortVehicles(MOCK_VEHICLES, filters);
      expect(results.length).toBe(1);
      expect(results[0].city).toBe('Gəncə');
    });
  });

  describe('Categorical & Dropdown Filters', () => {
    it('filters strictly by make and model', () => {
      const filters = { ...baseFilters, make: 'Toyota', model: 'Camry' };
      const results = filterAndSortVehicles(MOCK_VEHICLES, filters);
      expect(results.length).toBe(1);
      expect(results[0].model).toBe('Camry');
    });

    it('filters by body type (e.g. suv)', () => {
      const filters = { ...baseFilters, bodyType: 'suv' as const };
      const results = filterAndSortVehicles(MOCK_VEHICLES, filters);
      expect(results.length).toBeGreaterThan(0);
      results.forEach((car) => {
        expect(car.bodyType).toBe('suv');
      });
    });

    it('filters by fuel type (e.g. electric or hybrid)', () => {
      const hybridFilters = { ...baseFilters, fuelType: 'hybrid' as const };
      const hybridResults = filterAndSortVehicles(MOCK_VEHICLES, hybridFilters);
      expect(hybridResults.length).toBe(1);
      expect(hybridResults[0].fuelType).toBe('hybrid');

      const evFilters = { ...baseFilters, fuelType: 'electric' as const };
      const evResults = filterAndSortVehicles(MOCK_VEHICLES, evFilters);
      expect(evResults.length).toBe(1);
      expect(evResults[0].fuelType).toBe('electric');
    });

    it('filters by city location', () => {
      const filters = { ...baseFilters, city: 'Sumqayıt' };
      const results = filterAndSortVehicles(MOCK_VEHICLES, filters);
      expect(results.length).toBe(1);
      expect(results[0].city).toBe('Sumqayıt');
    });
  });

  describe('Numerical Range Filters', () => {
    it('filters by price threshold (minPrice and maxPrice)', () => {
      const filters = { ...baseFilters, minPrice: 40000, maxPrice: 50000 };
      const results = filterAndSortVehicles(MOCK_VEHICLES, filters);
      expect(results.length).toBeGreaterThan(0);
      results.forEach((car) => {
        expect(car.priceAzn).toBeGreaterThanOrEqual(40000);
        expect(car.priceAzn).toBeLessThanOrEqual(50000);
      });
    });

    it('filters by year threshold (minYear and maxYear)', () => {
      const filters = { ...baseFilters, minYear: 2023, maxYear: 2024 };
      const results = filterAndSortVehicles(MOCK_VEHICLES, filters);
      expect(results.length).toBeGreaterThan(0);
      results.forEach((car) => {
        expect(car.year).toBeGreaterThanOrEqual(2023);
        expect(car.year).toBeLessThanOrEqual(2024);
      });
    });
  });

  describe('Toggle Flags & Watchlist', () => {
    it('filters by great deal only (AutoValue™ AI evaluation)', () => {
      const filters = { ...baseFilters, greatDealOnly: true };
      const results = filterAndSortVehicles(MOCK_VEHICLES, filters);
      expect(results.length).toBeGreaterThan(0);
      results.forEach((car) => {
        expect(car.valuation.status).toBe('great_deal');
      });
    });

    it('filters by verified seller only', () => {
      const filters = { ...baseFilters, verifiedOnly: true };
      const results = filterAndSortVehicles(MOCK_VEHICLES, filters);
      results.forEach((car) => {
        expect(car.isVerified).toBe(true);
      });
    });

    it('filters by credit eligibility', () => {
      const filters = { ...baseFilters, creditOnly: true };
      const results = filterAndSortVehicles(MOCK_VEHICLES, filters);
      results.forEach((car) => {
        expect(car.isCreditAvailable).toBe(true);
      });
    });

    it('filters by barter availability', () => {
      const filters = { ...baseFilters, barterOnly: true };
      const results = filterAndSortVehicles(MOCK_VEHICLES, filters);
      expect(results.length).toBeGreaterThan(0);
      results.forEach((car) => {
        expect(car.isBarterAvailable).toBe(true);
      });
    });

    it('filters by favorites watchlist when active', () => {
      const favoriteIds = ['car-1', 'car-3'];
      const results = filterAndSortVehicles(MOCK_VEHICLES, baseFilters, {
        isFavoritesFilterActive: true,
        favoriteIds,
      });
      expect(results.length).toBe(2);
      expect(results.map((c) => c.id).sort()).toEqual(['car-1', 'car-3']);
    });
  });

  describe('Sorting Algorithms', () => {
    it('sorts by price ascending', () => {
      const filters = { ...baseFilters, sortBy: 'price_asc' as const };
      const results = filterAndSortVehicles(MOCK_VEHICLES, filters);
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].priceAzn).toBeLessThanOrEqual(results[i + 1].priceAzn);
      }
    });

    it('sorts by price descending', () => {
      const filters = { ...baseFilters, sortBy: 'price_desc' as const };
      const results = filterAndSortVehicles(MOCK_VEHICLES, filters);
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].priceAzn).toBeGreaterThanOrEqual(results[i + 1].priceAzn);
      }
    });

    it('sorts by mileage ascending', () => {
      const filters = { ...baseFilters, sortBy: 'mileage_asc' as const };
      const results = filterAndSortVehicles(MOCK_VEHICLES, filters);
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].mileageKm).toBeLessThanOrEqual(results[i + 1].mileageKm);
      }
    });

    it('sorts by year descending', () => {
      const filters = { ...baseFilters, sortBy: 'year_desc' as const };
      const results = filterAndSortVehicles(MOCK_VEHICLES, filters);
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].year).toBeGreaterThanOrEqual(results[i + 1].year);
      }
    });

    it('prioritizes featured listings in recommended sort', () => {
      const filters = { ...baseFilters, sortBy: 'recommended' as const };
      const results = filterAndSortVehicles(MOCK_VEHICLES, filters);
      // The first element should be featured
      expect(results[0].isFeatured).toBe(true);
    });
  });
});

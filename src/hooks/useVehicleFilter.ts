import { useState, useMemo, useCallback } from 'react';
import { Vehicle, FilterState } from '../types/vehicle';

export const DEFAULT_FILTER_STATE: FilterState = {
  searchQuery: '',
  make: '',
  model: '',
  minPrice: 0,
  maxPrice: 250000,
  minYear: 2010,
  maxYear: 2026,
  bodyType: 'all',
  fuelType: 'all',
  transmission: 'all',
  drivetrain: 'all',
  city: '',
  verifiedOnly: false,
  greatDealOnly: false,
  creditOnly: false,
  barterOnly: false,
  sortBy: 'recommended',
};

export interface UseVehicleFilterOptions {
  initialFilters?: Partial<FilterState>;
  isFavoritesFilterActive?: boolean;
  favoriteIds?: string[];
}

export interface UseVehicleFilterReturn {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  uniqueMakes: string[];
  uniqueModels: string[];
  uniqueCities: string[];
  filteredVehicles: Vehicle[];
}

/**
 * Pure evaluation function for filtering and sorting vehicles according to active criteria.
 */
export function filterAndSortVehicles(
  vehicles: Vehicle[],
  filters: FilterState,
  options?: {
    isFavoritesFilterActive?: boolean;
    favoriteIds?: string[];
  }
): Vehicle[] {
  const { isFavoritesFilterActive = false, favoriteIds = [] } = options || {};

  return vehicles
    .filter((car) => {
      // Search text query across title, make, model, city, and vin
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase().trim();
        const matches =
          car.title.toLowerCase().includes(query) ||
          car.make.toLowerCase().includes(query) ||
          car.model.toLowerCase().includes(query) ||
          car.city.toLowerCase().includes(query) ||
          car.vin.toLowerCase().includes(query);
        if (!matches) return false;
      }

      // Brand / Make
      if (filters.make && car.make !== filters.make) return false;

      // Model
      if (filters.model && car.model !== filters.model) return false;

      // Body Type
      if (filters.bodyType !== 'all' && car.bodyType !== filters.bodyType) return false;

      // Fuel Type
      if (filters.fuelType !== 'all' && car.fuelType !== filters.fuelType) return false;

      // Transmission
      if (filters.transmission !== 'all' && car.transmission !== filters.transmission) return false;

      // Drivetrain
      if (filters.drivetrain !== 'all' && car.drivetrain !== filters.drivetrain) return false;

      // City
      if (filters.city && car.city !== filters.city) return false;

      // Price range
      if (filters.minPrice > 0 && car.priceAzn < filters.minPrice) return false;
      if (filters.maxPrice > 0 && car.priceAzn > filters.maxPrice) return false;

      // Year range
      if (filters.minYear > 0 && car.year < filters.minYear) return false;
      if (filters.maxYear > 0 && car.year > filters.maxYear) return false;

      // Toggles & Flags
      if (isFavoritesFilterActive && !favoriteIds.includes(car.id)) return false;
      if (filters.verifiedOnly && !car.isVerified) return false;
      if (filters.greatDealOnly && car.valuation.status !== 'great_deal') return false;
      if (filters.creditOnly && !car.isCreditAvailable) return false;
      if (filters.barterOnly && !car.isBarterAvailable) return false;

      return true;
    })
    .sort((a, b) => {
      if (filters.sortBy === 'price_asc') return a.priceAzn - b.priceAzn;
      if (filters.sortBy === 'price_desc') return b.priceAzn - a.priceAzn;
      if (filters.sortBy === 'mileage_asc') return a.mileageKm - b.mileageKm;
      if (filters.sortBy === 'year_desc') return b.year - a.year;
      if (filters.sortBy === 'date_desc') {
        return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
      }
      // Recommended: featured listings first, then great deals
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return 0;
    });
}

/**
 * Custom hook encapsulating vehicle search/filter state, unique metadata computation,
 * and high-performance memoized multi-criteria filtering.
 */
export function useVehicleFilter(
  vehicles: Vehicle[],
  options: UseVehicleFilterOptions = {}
): UseVehicleFilterReturn {
  const { initialFilters, isFavoritesFilterActive = false, favoriteIds = [] } = options;

  const [filters, setFilters] = useState<FilterState>(() => ({
    ...DEFAULT_FILTER_STATE,
    ...initialFilters,
  }));

  const updateFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => {
      // Reset model when make changes to avoid invalid combinations
      if (key === 'make' && prev.make !== value) {
        return { ...prev, make: value as string, model: '' };
      }
      return { ...prev, [key]: value };
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTER_STATE);
  }, []);

  // Compute unique makes alphabetically
  const uniqueMakes = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.make))).sort(),
    [vehicles]
  );

  // Compute models dynamically based on selected make
  const uniqueModels = useMemo(() => {
    if (!filters.make) return [];
    return Array.from(
      new Set(vehicles.filter((v) => v.make === filters.make).map((v) => v.model))
    ).sort();
  }, [vehicles, filters.make]);

  // Compute unique cities
  const uniqueCities = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.city))).sort(),
    [vehicles]
  );

  // Multi-criteria memoized filtered vehicles
  const filteredVehicles = useMemo(() => {
    return filterAndSortVehicles(vehicles, filters, {
      isFavoritesFilterActive,
      favoriteIds,
    });
  }, [vehicles, filters, isFavoritesFilterActive, favoriteIds]);

  return {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    uniqueMakes,
    uniqueModels,
    uniqueCities,
    filteredVehicles,
  };
}

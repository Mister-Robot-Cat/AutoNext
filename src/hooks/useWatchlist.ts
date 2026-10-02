import { useState, useCallback } from 'react';
import { Vehicle } from '../types/vehicle';
import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'autonext_favorites';

export function useWatchlist() {
  const [favoriteIds, setFavoriteIds] = useLocalStorage<string[]>(STORAGE_KEY, []);
  const [isFavoritesFilterActive, setIsFavoritesFilterActive] = useState(false);

  const toggleFavorite = useCallback((car: Vehicle) => {
    setFavoriteIds((prev) =>
      prev.includes(car.id) ? prev.filter((id) => id !== car.id) : [...prev, car.id]
    );
  }, [setFavoriteIds]);

  return {
    favoriteIds,
    isFavoritesFilterActive,
    setIsFavoritesFilterActive,
    toggleFavorite,
  };
}

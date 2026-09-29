import { useState, useEffect, useCallback } from 'react';
import { Vehicle } from '../types/vehicle';

const STORAGE_KEY = 'autonext_favorites';

export function useWatchlist() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  });

  const [isFavoritesFilterActive, setIsFavoritesFilterActive] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [favoriteIds]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        try {
          const newFavorites = JSON.parse(e.newValue || '[]');
          setFavoriteIds(newFavorites);
        } catch {
          setFavoriteIds([]);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleFavorite = useCallback((car: Vehicle) => {
    setFavoriteIds((prev) =>
      prev.includes(car.id) ? prev.filter((id) => id !== car.id) : [...prev, car.id]
    );
  }, []);

  return {
    favoriteIds,
    isFavoritesFilterActive,
    setIsFavoritesFilterActive,
    toggleFavorite,
  };
}

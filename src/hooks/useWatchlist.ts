import { useState, useCallback } from 'react';
import { Vehicle } from '../types/vehicle';
import { useLocalStorage } from './useLocalStorage';
import { toastManager } from './useToast';

const STORAGE_KEY = 'autonext_favorites';

export function useWatchlist() {
  const [favoriteIds, setFavoriteIds] = useLocalStorage<string[]>(STORAGE_KEY, []);
  const [isFavoritesFilterActive, setIsFavoritesFilterActive] = useState(false);

  const toggleFavorite = useCallback((car: Vehicle) => {
    setFavoriteIds((prev) => {
      const isAdded = !prev.includes(car.id);
      if (isAdded) {
        toastManager.add(`${car.title} seçilmişlərə əlavə edildi`, 'success');
        return [...prev, car.id];
      } else {
        toastManager.add(`${car.title} seçilmişlərdən silindi`, 'info');
        return prev.filter((id) => id !== car.id);
      }
    });
  }, [setFavoriteIds]);

  return {
    favoriteIds,
    isFavoritesFilterActive,
    setIsFavoritesFilterActive,
    toggleFavorite,
  };
}

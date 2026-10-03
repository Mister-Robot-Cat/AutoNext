import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export function useRecentlyViewed(limit: number = 10) {
  const [recentlyViewedIds, setRecentlyViewedIds] = useLocalStorage<string[]>('autonext_recently_viewed', []);

  const addRecentlyViewed = useCallback((id: string) => {
    setRecentlyViewedIds((prev) => {
      // Remove the id if it already exists to move it to the front
      const filtered = prev.filter((item) => item !== id);
      // Add the new id to the beginning and slice to the limit
      return [id, ...filtered].slice(0, limit);
    });
  }, [limit, setRecentlyViewedIds]);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewedIds([]);
  }, [setRecentlyViewedIds]);

  return {
    recentlyViewedIds,
    addRecentlyViewed,
    clearRecentlyViewed,
  };
}

import { useState, useEffect, useCallback } from 'react';
import { FilterState } from '../types/vehicle';

export interface SavedSearch {
  id: string;
  name: string;
  filters: Partial<FilterState>;
  createdAt: number;
}

export function useSavedSearches() {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('autonext_saved_searches');
      if (stored) {
        setSavedSearches(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not load saved searches', e);
    }
  }, []);

  const saveSearchesToStorage = useCallback((searches: SavedSearch[]) => {
    try {
      localStorage.setItem('autonext_saved_searches', JSON.stringify(searches));
    } catch (e) {
      console.warn('Could not save searches', e);
    }
  }, []);

  const saveSearch = useCallback((name: string, filters: Partial<FilterState>) => {
    const newSearch: SavedSearch = {
      id: crypto.randomUUID(),
      name,
      filters,
      createdAt: Date.now(),
    };
    setSavedSearches(prev => {
      const next = [newSearch, ...prev].slice(0, 10); // Keep max 10
      saveSearchesToStorage(next);
      return next;
    });
  }, [saveSearchesToStorage]);

  const deleteSearch = useCallback((id: string) => {
    setSavedSearches(prev => {
      const next = prev.filter(s => s.id !== id);
      saveSearchesToStorage(next);
      return next;
    });
  }, [saveSearchesToStorage]);

  return {
    savedSearches,
    saveSearch,
    deleteSearch,
  };
}

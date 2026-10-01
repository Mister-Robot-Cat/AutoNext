import { renderHook, act } from '@testing-library/react';
import { useWatchlist } from '../useWatchlist';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Vehicle } from '../../types/vehicle';

const STORAGE_KEY = 'autonext_favorites';

describe('useWatchlist', () => {
  const mockVehicle1 = { id: 'car1' } as Vehicle;
  const mockVehicle2 = { id: 'car2' } as Vehicle;

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with empty favorites if localStorage is empty', () => {
    const { result } = renderHook(() => useWatchlist());
    expect(result.current.favoriteIds).toEqual([]);
    expect(result.current.isFavoritesFilterActive).toBe(false);
  });

  it('should initialize with favorites from localStorage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['car1', 'car2']));
    const { result } = renderHook(() => useWatchlist());
    expect(result.current.favoriteIds).toEqual(['car1', 'car2']);
  });

  it('should add a favorite when toggleFavorite is called with a new vehicle', () => {
    const { result } = renderHook(() => useWatchlist());
    
    act(() => {
      result.current.toggleFavorite(mockVehicle1);
    });
    
    expect(result.current.favoriteIds).toEqual(['car1']);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')).toEqual(['car1']);
  });

  it('should remove a favorite when toggleFavorite is called with an existing vehicle', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['car1', 'car2']));
    const { result } = renderHook(() => useWatchlist());
    
    act(() => {
      result.current.toggleFavorite(mockVehicle1);
    });
    
    expect(result.current.favoriteIds).toEqual(['car2']);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')).toEqual(['car2']);
  });

  it('should update state when a storage event is triggered', () => {
    const { result } = renderHook(() => useWatchlist());
    expect(result.current.favoriteIds).toEqual([]);

    act(() => {
      // Simulate another tab updating localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(['car3']));
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: STORAGE_KEY,
          newValue: JSON.stringify(['car3']),
        })
      );
    });

    expect(result.current.favoriteIds).toEqual(['car3']);
  });

  it('should ignore storage events for other keys', () => {
    const { result } = renderHook(() => useWatchlist());
    
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'some_other_key',
          newValue: JSON.stringify(['car3']),
        })
      );
    });

    expect(result.current.favoriteIds).toEqual([]);
  });

  it('should allow toggling the favorites filter state', () => {
    const { result } = renderHook(() => useWatchlist());
    
    act(() => {
      result.current.setIsFavoritesFilterActive(true);
    });
    
    expect(result.current.isFavoritesFilterActive).toBe(true);
  });
});

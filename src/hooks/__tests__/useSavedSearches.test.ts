import { renderHook, act } from '@testing-library/react';
import { useSavedSearches } from '../useSavedSearches';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { FilterState } from '../../types/vehicle';

const STORAGE_KEY = 'autonext_saved_searches';

describe('useSavedSearches', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('crypto', {
      randomUUID: () => 'test-uuid-1234',
    });
  });

  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('should initialize with empty searches if localStorage is empty', () => {
    const { result } = renderHook(() => useSavedSearches());
    expect(result.current.savedSearches).toEqual([]);
  });

  it('should load saved searches from localStorage on mount', () => {
    const mockSearches = [
      { id: '1', name: 'Sport Cars', filters: { bodyType: 'coupe' } as Partial<FilterState>, createdAt: 123456 }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockSearches));
    const { result } = renderHook(() => useSavedSearches());
    expect(result.current.savedSearches).toEqual(mockSearches);
  });

  it('should save a new search and update localStorage', () => {
    const { result } = renderHook(() => useSavedSearches());
    
    act(() => {
      result.current.saveSearch('SUV Search', { make: 'Toyota', bodyType: 'suv' } as Partial<FilterState>);
    });
    
    expect(result.current.savedSearches).toHaveLength(1);
    expect(result.current.savedSearches[0].name).toBe('SUV Search');
    expect(result.current.savedSearches[0].id).toBe('test-uuid-1234');
    
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('SUV Search');
  });

  it('should limit saved searches to maximum of 10 items', () => {
    const { result } = renderHook(() => useSavedSearches());
    
    act(() => {
      for (let i = 0; i < 15; i++) {
        result.current.saveSearch(`Search ${i}`, { minYear: 2000 + i } as Partial<FilterState>);
      }
    });
    
    expect(result.current.savedSearches).toHaveLength(10);
    // The most recently added ones should be kept (index 14 down to 5)
    expect(result.current.savedSearches[0].name).toBe('Search 14');
    expect(result.current.savedSearches[9].name).toBe('Search 5');
  });

  it('should delete a search by id', () => {
    const mockSearches = [
      { id: '1', name: 'To Keep', filters: {}, createdAt: 100 },
      { id: '2', name: 'To Delete', filters: {}, createdAt: 200 }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockSearches));
    
    const { result } = renderHook(() => useSavedSearches());
    
    act(() => {
      result.current.deleteSearch('2');
    });
    
    expect(result.current.savedSearches).toHaveLength(1);
    expect(result.current.savedSearches[0].id).toBe('1');
    
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe('1');
  });
});

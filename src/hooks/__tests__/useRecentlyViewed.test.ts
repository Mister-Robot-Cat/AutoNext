import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useRecentlyViewed } from '../useRecentlyViewed';

describe('useRecentlyViewed', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with an empty array', () => {
    const { result } = renderHook(() => useRecentlyViewed());
    expect(result.current.recentlyViewedIds).toEqual([]);
  });

  it('should add an item to recently viewed', () => {
    const { result } = renderHook(() => useRecentlyViewed());
    
    act(() => {
      result.current.addRecentlyViewed('car-1');
    });
    
    expect(result.current.recentlyViewedIds).toEqual(['car-1']);
  });

  it('should not add duplicates but move the existing one to the front', () => {
    const { result } = renderHook(() => useRecentlyViewed());
    
    act(() => {
      result.current.addRecentlyViewed('car-1');
    });
    act(() => {
      result.current.addRecentlyViewed('car-2');
    });
    
    expect(result.current.recentlyViewedIds).toEqual(['car-2', 'car-1']);
    
    act(() => {
      result.current.addRecentlyViewed('car-1');
    });
    
    expect(result.current.recentlyViewedIds).toEqual(['car-1', 'car-2']);
  });

  it('should respect the limit of recently viewed items', () => {
    const { result } = renderHook(() => useRecentlyViewed(3));
    
    act(() => {
      result.current.addRecentlyViewed('car-1');
    });
    act(() => {
      result.current.addRecentlyViewed('car-2');
    });
    act(() => {
      result.current.addRecentlyViewed('car-3');
    });
    act(() => {
      result.current.addRecentlyViewed('car-4');
    });
    
    expect(result.current.recentlyViewedIds).toEqual(['car-4', 'car-3', 'car-2']);
  });

  it('should clear all recently viewed items', () => {
    const { result } = renderHook(() => useRecentlyViewed());
    
    act(() => {
      result.current.addRecentlyViewed('car-1');
      result.current.clearRecentlyViewed();
    });
    
    expect(result.current.recentlyViewedIds).toEqual([]);
  });
});

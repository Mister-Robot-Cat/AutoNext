import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../useLocalStorage';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('useLocalStorage', () => {
  const TEST_KEY = 'test_key';
  const INITIAL_VALUE = { name: 'test' };

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should return the initial value if localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage(TEST_KEY, INITIAL_VALUE));
    
    expect(result.current[0]).toEqual(INITIAL_VALUE);
  });

  it('should return the value from localStorage if it exists', () => {
    const storedValue = { name: 'stored' };
    localStorage.setItem(TEST_KEY, JSON.stringify(storedValue));

    const { result } = renderHook(() => useLocalStorage(TEST_KEY, INITIAL_VALUE));
    
    expect(result.current[0]).toEqual(storedValue);
  });

  it('should set the value in state and localStorage', () => {
    const { result } = renderHook(() => useLocalStorage(TEST_KEY, INITIAL_VALUE));
    
    const newValue = { name: 'new' };
    
    act(() => {
      result.current[1](newValue);
    });

    expect(result.current[0]).toEqual(newValue);
    expect(JSON.parse(localStorage.getItem(TEST_KEY) as string)).toEqual(newValue);
  });

  it('should support function updater', () => {
    const { result } = renderHook(() => useLocalStorage<number>('count', 0));
    
    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
    expect(JSON.parse(localStorage.getItem('count') as string)).toBe(1);
  });

  it('should handle storage events from other tabs', () => {
    const { result } = renderHook(() => useLocalStorage(TEST_KEY, INITIAL_VALUE));
    
    const newValue = { name: 'external' };

    act(() => {
      localStorage.setItem(TEST_KEY, JSON.stringify(newValue));
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: TEST_KEY,
          newValue: JSON.stringify(newValue),
        })
      );
    });

    expect(result.current[0]).toEqual(newValue);
  });

  it('should revert to initial value if storage event newValue is null', () => {
    const { result } = renderHook(() => useLocalStorage(TEST_KEY, INITIAL_VALUE));
    
    act(() => {
      result.current[1]({ name: 'changed' });
    });
    
    expect(result.current[0]).toEqual({ name: 'changed' });

    act(() => {
      localStorage.removeItem(TEST_KEY);
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: TEST_KEY,
          newValue: null,
        })
      );
    });

    expect(result.current[0]).toEqual(INITIAL_VALUE);
  });
});

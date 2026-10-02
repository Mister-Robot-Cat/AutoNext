import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDebounce } from '../useDebounce';

describe('useDebounce hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should update the value after the specified delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    // Update value
    rerender({ value: 'updated', delay: 500 });

    // Value should not update immediately
    expect(result.current).toBe('initial');

    // Fast-forward time by 499ms
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current).toBe('initial');

    // Fast-forward remaining 1ms
    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe('updated');
  });

  it('should reset the timer if value changes before the delay ends', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    // Update value to 'updated 1'
    rerender({ value: 'updated 1', delay: 500 });

    // Fast-forward time by 300ms
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('initial');

    // Update value to 'updated 2' before the 500ms delay finishes
    rerender({ value: 'updated 2', delay: 500 });

    // Fast-forward time by 300ms (total 600ms since 'updated 1')
    act(() => {
      vi.advanceTimersByTime(300);
    });
    // Still initial because the timer was reset
    expect(result.current).toBe('initial');

    // Fast-forward the remaining 200ms
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    // Now it should be updated to the latest value
    expect(result.current).toBe('updated 2');
  });
});

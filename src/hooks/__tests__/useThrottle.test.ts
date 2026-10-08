import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useThrottle } from '../useThrottle';

describe('useThrottle hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useThrottle('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should throttle updates based on delay', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useThrottle(value, delay), {
      initialProps: { value: 'val1', delay: 500 },
    });

    expect(result.current).toBe('val1');

    // First update should not be applied immediately because 500ms haven't passed
    rerender({ value: 'val2', delay: 500 });
    expect(result.current).toBe('val1');

    // Another fast update
    rerender({ value: 'val3', delay: 500 });
    expect(result.current).toBe('val1');

    // Fast-forward time by 500ms
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Now the value should be updated to the latest passed value
    expect(result.current).toBe('val3');
  });

  it('should update immediately if time since last execution is greater than delay', () => {
    vi.setSystemTime(new Date(2000, 1, 1, 13, 0, 0)); // Set initial time

    const { result, rerender } = renderHook(({ value, delay }) => useThrottle(value, delay), {
      initialProps: { value: 'val1', delay: 500 },
    });

    expect(result.current).toBe('val1');

    // Advance system time
    vi.setSystemTime(new Date(2000, 1, 1, 13, 0, 1)); // Advance by 1000ms

    act(() => {
      rerender({ value: 'val2', delay: 500 });
    });

    expect(result.current).toBe('val2');
  });
});

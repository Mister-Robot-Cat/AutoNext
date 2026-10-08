import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useIdle } from '../useIdle';

describe('useIdle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should initially return false', () => {
    const { result } = renderHook(() => useIdle(3000));
    expect(result.current).toBe(false);
  });

  it('should return true after the timeout', () => {
    const { result } = renderHook(() => useIdle(3000));
    
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current).toBe(true);
  });

  it('should reset idle state on user activity', () => {
    const { result } = renderHook(() => useIdle(3000));
    
    act(() => {
      vi.advanceTimersByTime(2999);
    });
    
    expect(result.current).toBe(false);

    // Simulate user activity
    act(() => {
      window.dispatchEvent(new Event('mousemove'));
    });

    act(() => {
      vi.advanceTimersByTime(2999);
    });

    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe(true);
  });

  it('should handle unmounting correctly', () => {
    const { unmount } = renderHook(() => useIdle(3000));
    
    unmount();
    
    // Ensure no errors are thrown if timers advance after unmount
    act(() => {
      vi.advanceTimersByTime(3000);
    });
  });
});

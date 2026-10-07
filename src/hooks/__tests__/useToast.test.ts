import { renderHook, act } from '@testing-library/react';
import { useToast, toastManager } from '../useToast';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('useToast', () => {
  beforeEach(() => {
    // Clear all toasts before each test
    // @ts-ignore - accessing private for testing
    toastManager.toasts = [];
    // @ts-ignore
    toastManager.addListeners = [];
    // @ts-ignore
    toastManager.removeListeners = [];
    vi.useFakeTimers();
  });

  it('should add a toast and update the hook state', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.addToast('Test message', 'success');
    });

    expect(result.current.toasts.length).toBe(1);
    expect(result.current.toasts[0].message).toBe('Test message');
    expect(result.current.toasts[0].type).toBe('success');
  });

  it('should remove a toast by id', () => {
    const { result } = renderHook(() => useToast());

    let id: string = '';
    act(() => {
      id = result.current.addToast('Test message', 'info');
    });

    expect(result.current.toasts.length).toBe(1);

    act(() => {
      result.current.removeToast(id);
    });

    expect(result.current.toasts.length).toBe(0);
  });

  it('should auto-remove toast after duration', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.addToast('Test message', 'warning', 1000);
    });

    expect(result.current.toasts.length).toBe(1);

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(result.current.toasts.length).toBe(0);
  });
});

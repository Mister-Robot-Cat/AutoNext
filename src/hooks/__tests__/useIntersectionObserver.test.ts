import { renderHook } from '@testing-library/react';
import { useIntersectionObserver } from '../useIntersectionObserver';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useIntersectionObserver', () => {
  const observeMock = vi.fn();
  const disconnectMock = vi.fn();

  beforeEach(() => {
    class IntersectionObserverMock {
      observe = observeMock;
      unobserve = vi.fn();
      disconnect = disconnectMock;
      constructor() {}
    }
    vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    observeMock.mockClear();
    disconnectMock.mockClear();
  });

  it('should return undefined initially', () => {
    const ref = { current: document.createElement('div') };
    const { result } = renderHook(() => useIntersectionObserver(ref, {}));
    
    expect(result.current).toBeUndefined();
  });

  it('should call IntersectionObserver observe with element', () => {
    const element = document.createElement('div');
    const ref = { current: element };
    
    renderHook(() => useIntersectionObserver(ref, {}));
    
    expect(observeMock).toHaveBeenCalledWith(element);
  });

  it('should disconnect on unmount', () => {
    const element = document.createElement('div');
    const ref = { current: element };
    
    const { unmount } = renderHook(() => useIntersectionObserver(ref, {}));
    unmount();
    
    expect(disconnectMock).toHaveBeenCalled();
  });
});


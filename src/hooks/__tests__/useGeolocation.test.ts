import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
import { useGeolocation } from '../useGeolocation';

describe('useGeolocation', () => {
  const mockGeolocation = {
    getCurrentPosition: vi.fn(),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
  };

  const originalGeolocation = window.navigator.geolocation;

  beforeEach(() => {
    vi.clearAllMocks();
    (window.navigator as any).geolocation = mockGeolocation;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    (window.navigator as any).geolocation = originalGeolocation;
  });

  it('should initialize with loading state', () => {
    mockGeolocation.getCurrentPosition.mockImplementation(() => {});
    mockGeolocation.watchPosition.mockReturnValue(1);

    const { result } = renderHook(() => useGeolocation());

    expect(result.current.loading).toBe(true);
    expect(result.current.coordinates).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should update state on success', () => {
    const mockPosition = {
      coords: {
        latitude: 40.409264,
        longitude: 49.867092,
      },
    };

    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success(mockPosition);
    });
    mockGeolocation.watchPosition.mockReturnValue(1);

    const { result } = renderHook(() => useGeolocation());

    expect(result.current.loading).toBe(false);
    expect(result.current.coordinates).toEqual({
      lat: 40.409264,
      lng: 49.867092,
    });
    expect(result.current.error).toBeNull();
  });

  it('should handle errors', () => {
    const mockError = {
      message: 'User denied geolocation prompt',
    };

    mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
      error(mockError);
    });
    mockGeolocation.watchPosition.mockReturnValue(1);

    const { result } = renderHook(() => useGeolocation());

    expect(result.current.loading).toBe(false);
    expect(result.current.coordinates).toBeNull();
    expect(result.current.error).toBe('User denied geolocation prompt');
  });

  it('should handle missing geolocation support', () => {
    (window.navigator as any).geolocation = undefined;

    const { result } = renderHook(() => useGeolocation());

    expect(result.current.loading).toBe(false);
    expect(result.current.coordinates).toBeNull();
    expect(result.current.error).toBe('Geolocation is not supported by your browser');
  });
});

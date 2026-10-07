import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../useTheme';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useTheme', () => {
  let matchMediaMock: any;

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    document.documentElement.classList.remove('light', 'dark');

    // Mock matchMedia
    matchMediaMock = vi.fn().mockImplementation((query) => ({
      matches: query.includes('dark'),
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
  });

  afterEach(() => {
    document.documentElement.className = '';
  });

  it('should initialize with system theme by default', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('system');
    
    // System theme defaults to 'dark' in our mock setup
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });

  it('should apply light theme when system prefers light', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false, // prefers-color-scheme: dark -> false
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as any;

    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('system');
    
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should allow setting a specific theme', () => {
    const { result } = renderHook(() => useTheme());
    
    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.theme).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should toggle between light and dark themes', () => {
    const { result } = renderHook(() => useTheme());
    
    act(() => {
      result.current.setTheme('light'); // Set initially from system
    });

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should respond to system theme changes if theme is system', () => {
    let changeListener: any = null;
    
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false, // initially light
      addEventListener: (event: string, handler: any) => {
        if (event === 'change') changeListener = handler;
      },
      removeEventListener: vi.fn(),
    })) as any;

    const { result } = renderHook(() => useTheme());
    expect(document.documentElement.classList.contains('light')).toBe(true);

    // Simulate system switching to dark mode
    act(() => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: true, // now dark
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })) as any;
      
      if (changeListener) {
        changeListener();
      }
    });

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });
});

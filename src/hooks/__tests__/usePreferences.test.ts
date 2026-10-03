import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { usePreferences } from '../usePreferences';

describe('usePreferences', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => usePreferences());

    expect(result.current.currency).toBe('AZN');
    expect(result.current.lang).toBe('az');
  });

  it('should update currency and persist to localStorage', () => {
    const { result } = renderHook(() => usePreferences());

    act(() => {
      result.current.setCurrency('USD');
    });

    expect(result.current.currency).toBe('USD');
    expect(window.localStorage.getItem('autonext_currency')).toBe(JSON.stringify('USD'));
  });

  it('should update language and persist to localStorage', () => {
    const { result } = renderHook(() => usePreferences());

    act(() => {
      result.current.setLang('en');
    });

    expect(result.current.lang).toBe('en');
    expect(window.localStorage.getItem('autonext_lang')).toBe(JSON.stringify('en'));
  });
});

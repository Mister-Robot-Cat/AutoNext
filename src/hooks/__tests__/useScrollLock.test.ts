import { renderHook } from '@testing-library/react';
import { useScrollLock } from '../useScrollLock';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('useScrollLock', () => {
  const originalOverflow = document.body.style.overflow;

  beforeEach(() => {
    document.body.style.overflow = '';
  });

  afterEach(() => {
    document.body.style.overflow = originalOverflow;
  });

  it('should lock body scroll when isLocked is true', () => {
    renderHook(() => useScrollLock(true));
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should not lock body scroll when isLocked is false', () => {
    document.body.style.overflow = 'auto';
    renderHook(() => useScrollLock(false));
    expect(document.body.style.overflow).toBe('auto');
  });

  it('should restore original overflow when unmounted', () => {
    document.body.style.overflow = 'scroll';
    const { unmount } = renderHook(() => useScrollLock(true));
    
    expect(document.body.style.overflow).toBe('hidden');
    
    unmount();
    
    expect(document.body.style.overflow).toBe('scroll');
  });
});

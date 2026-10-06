import { renderHook } from '@testing-library/react';
import { useKeyPress } from '../useKeyPress';
import { describe, it, expect, vi } from 'vitest';

describe('useKeyPress', () => {
  it('should call the handler when the target key is pressed', () => {
    const handler = vi.fn();
    renderHook(() => useKeyPress('Escape', handler));

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    window.dispatchEvent(event);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should not call the handler when a different key is pressed', () => {
    const handler = vi.fn();
    renderHook(() => useKeyPress('Escape', handler));

    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    window.dispatchEvent(event);

    expect(handler).not.toHaveBeenCalled();
  });
});

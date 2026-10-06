import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useClickOutside } from '../useClickOutside';

describe('useClickOutside', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call the handler when clicking outside the ref element', () => {
    const handler = vi.fn();
    const { result } = renderHook(() => useClickOutside(handler));
    
    // Create a mock element to act as the ref
    const element = document.createElement('div');
    document.body.appendChild(element);
    
    // Assign the ref
    (result.current as any).current = element;

    // Fire a mousedown event on the body (outside)
    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    expect(handler).toHaveBeenCalledTimes(1);

    document.body.removeChild(element);
  });

  it('should not call the handler when clicking inside the ref element', () => {
    const handler = vi.fn();
    const { result } = renderHook(() => useClickOutside(handler));
    
    // Create a mock element to act as the ref
    const element = document.createElement('div');
    const childElement = document.createElement('span');
    element.appendChild(childElement);
    document.body.appendChild(element);
    
    // Assign the ref
    (result.current as any).current = element;

    // Fire a mousedown event on the child element (inside)
    childElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    expect(handler).not.toHaveBeenCalled();

    document.body.removeChild(element);
  });

  it('should not call the handler when active is false', () => {
    const handler = vi.fn();
    const { result } = renderHook(() => useClickOutside(handler, false));
    
    const element = document.createElement('div');
    document.body.appendChild(element);
    
    (result.current as any).current = element;

    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    expect(handler).not.toHaveBeenCalled();

    document.body.removeChild(element);
  });

  it('should update the handler if it changes', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    
    const { result, rerender } = renderHook(
      ({ cb }) => useClickOutside(cb),
      { initialProps: { cb: handler1 } }
    );
    
    const element = document.createElement('div');
    document.body.appendChild(element);
    
    (result.current as any).current = element;

    // Update with new handler
    rerender({ cb: handler2 });

    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalledTimes(1);

    document.body.removeChild(element);
  });
});

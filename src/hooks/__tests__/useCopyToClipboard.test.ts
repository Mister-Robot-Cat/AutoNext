import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCopyToClipboard } from '../useCopyToClipboard';

describe('useCopyToClipboard', () => {
  const originalClipboard = navigator.clipboard;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null as initial copied text', () => {
    const { result } = renderHook(() => useCopyToClipboard());
    expect(result.current[0]).toBeNull();
    expect(typeof result.current[1]).toBe('function');
  });

  it('should copy text to clipboard and update state', async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    const { result } = renderHook(() => useCopyToClipboard());
    
    let success = false;
    await act(async () => {
      success = await result.current[1]('test string');
    });

    expect(success).toBe(true);
    expect(mockWriteText).toHaveBeenCalledWith('test string');
    expect(result.current[0]).toBe('test string');

    Object.assign(navigator, { clipboard: originalClipboard });
  });

  it('should handle copy failure gracefully', async () => {
    const mockWriteText = vi.fn().mockRejectedValue(new Error('Copy failed'));
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useCopyToClipboard());
    
    let success = false;
    await act(async () => {
      success = await result.current[1]('test string');
    });

    expect(success).toBe(false);
    expect(mockWriteText).toHaveBeenCalledWith('test string');
    expect(result.current[0]).toBeNull();
    expect(consoleWarnSpy).toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
    Object.assign(navigator, { clipboard: originalClipboard });
  });

  it('should warn and fail if clipboard is not supported', async () => {
    const originalNavigator = window.navigator;
    Object.defineProperty(window, 'navigator', {
      value: { ...originalNavigator, clipboard: undefined },
      configurable: true,
      writable: true
    });

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useCopyToClipboard());
    
    let success = false;
    await act(async () => {
      success = await result.current[1]('test string');
    });

    expect(success).toBe(false);
    expect(result.current[0]).toBeNull();
    expect(consoleWarnSpy).toHaveBeenCalledWith('Clipboard not supported');

    consoleWarnSpy.mockRestore();
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true
    });
  });
});

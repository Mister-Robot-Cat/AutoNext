import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useShare } from '../useShare';

describe('useShare hook', () => {
  let mockShare: any;
  let mockClipboard: any;

  beforeEach(() => {
    mockShare = vi.fn();
    mockClipboard = { writeText: vi.fn() };
    
    vi.stubGlobal('navigator', {
      share: undefined,
      clipboard: mockClipboard,
    });
    
    vi.useFakeTimers();
  });

  it('should fallback to clipboard if navigator.share is not available', async () => {
    const { result } = renderHook(() => useShare());
    
    await act(async () => {
      await result.current.share('Test Title', 'Test Text', 'https://example.com');
    });

    expect(mockClipboard.writeText).toHaveBeenCalledWith('Test Title - Test Text\nhttps://example.com');
    expect(result.current.isShared).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.isShared).toBe(false);
  });

  it('should use navigator.share if available', async () => {
    vi.stubGlobal('navigator', {
      share: mockShare,
      clipboard: mockClipboard,
    });

    mockShare.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useShare());
    
    await act(async () => {
      await result.current.share('Test Title', 'Test Text', 'https://example.com');
    });

    expect(mockShare).toHaveBeenCalledWith({
      title: 'Test Title',
      text: 'Test Text',
      url: 'https://example.com',
    });
    expect(mockClipboard.writeText).not.toHaveBeenCalled();
    expect(result.current.isShared).toBe(true);
  });

  it('should handle share errors', async () => {
    vi.stubGlobal('navigator', {
      share: mockShare,
      clipboard: mockClipboard,
    });

    const error = new Error('Share failed');
    mockShare.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useShare());
    
    await act(async () => {
      await result.current.share('Test Title', 'Test Text', 'https://example.com');
    });

    expect(result.current.error).toBe(error);
    expect(result.current.isShared).toBe(false);
  });
});

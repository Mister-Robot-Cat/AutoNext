import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { usePagination } from '../usePagination';

describe('usePagination', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 50 }));
    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageSize).toBe(12);
    expect(result.current.totalPages).toBe(5); // 50 / 12 = 4.16 -> 5
  });

  it('should handle zero total items correctly', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 0 }));
    expect(result.current.totalPages).toBe(1);
    expect(result.current.currentPage).toBe(1);
  });

  it('should go to next page', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 50 }));
    act(() => {
      result.current.nextPage();
    });
    expect(result.current.currentPage).toBe(2);
  });

  it('should not go beyond total pages', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 20, initialPageSize: 15 }));
    act(() => {
      result.current.nextPage(); // goes to 2
    });
    expect(result.current.currentPage).toBe(2);
    act(() => {
      result.current.nextPage(); // should stay at 2
    });
    expect(result.current.currentPage).toBe(2);
  });

  it('should go to prev page', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 50, initialPage: 2 }));
    act(() => {
      result.current.prevPage();
    });
    expect(result.current.currentPage).toBe(1);
  });

  it('should not go below page 1', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 50 }));
    act(() => {
      result.current.prevPage();
    });
    expect(result.current.currentPage).toBe(1);
  });

  it('should go to specific page', () => {
    const { result } = renderHook(() => usePagination({ totalItems: 50 }));
    act(() => {
      result.current.goToPage(3);
    });
    expect(result.current.currentPage).toBe(3);
  });
});

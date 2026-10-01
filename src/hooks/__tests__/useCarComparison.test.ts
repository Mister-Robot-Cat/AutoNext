import { renderHook, act } from '@testing-library/react';
import { useCarComparison } from '../useCarComparison';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Vehicle } from '../../types/vehicle';

const STORAGE_KEY = 'autonext_compare_draft';

describe('useCarComparison', () => {
  const mockVehicles: Vehicle[] = [
    { id: 'car1' },
    { id: 'car2' },
    { id: 'car3' },
    { id: 'car4' },
    { id: 'car5' },
  ] as Vehicle[];

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with empty comparison if localStorage is empty', () => {
    const { result } = renderHook(() => useCarComparison(mockVehicles));
    expect(result.current.comparedVehicleIds).toEqual([]);
    expect(result.current.comparedVehicles).toEqual([]);
  });

  it('should initialize with comparison list from localStorage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['car1', 'car2']));
    const { result } = renderHook(() => useCarComparison(mockVehicles));
    expect(result.current.comparedVehicleIds).toEqual(['car1', 'car2']);
    expect(result.current.comparedVehicles).toEqual([mockVehicles[0], mockVehicles[1]]);
  });

  it('should add a vehicle to comparison on toggleCompare', () => {
    const { result } = renderHook(() => useCarComparison(mockVehicles));
    
    act(() => {
      result.current.toggleCompare(mockVehicles[0]);
    });
    
    expect(result.current.comparedVehicleIds).toEqual(['car1']);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')).toEqual(['car1']);
  });

  it('should remove a vehicle from comparison if toggleCompare is called again', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['car1', 'car2']));
    const { result } = renderHook(() => useCarComparison(mockVehicles));
    
    act(() => {
      result.current.toggleCompare(mockVehicles[0]);
    });
    
    expect(result.current.comparedVehicleIds).toEqual(['car2']);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')).toEqual(['car2']);
  });

  it('should prevent adding more than limit vehicles', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['car1', 'car2', 'car3', 'car4']));
    const { result } = renderHook(() => useCarComparison(mockVehicles));
    
    act(() => {
      result.current.toggleCompare(mockVehicles[4]);
    });
    
    expect(window.alert).toHaveBeenCalledWith(`Maksimum ${result.current.limit} avtomobili eyni anda müqayisə edə bilərsiniz.`);
    expect(result.current.comparedVehicleIds).toEqual(['car1', 'car2', 'car3', 'car4']);
  });

  it('should explicitly remove a compared vehicle', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['car1', 'car2']));
    const { result } = renderHook(() => useCarComparison(mockVehicles));
    
    act(() => {
      result.current.removeComparedVehicle('car1');
    });
    
    expect(result.current.comparedVehicleIds).toEqual(['car2']);
  });

  it('should clear all compared vehicles', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['car1', 'car2']));
    const { result } = renderHook(() => useCarComparison(mockVehicles));
    
    act(() => {
      result.current.clearComparison();
    });
    
    expect(result.current.comparedVehicleIds).toEqual([]);
    expect(result.current.comparedVehicles).toEqual([]);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')).toEqual([]);
  });

  it('should gracefully handle invalid JSON in localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'invalid-json');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const { result } = renderHook(() => useCarComparison(mockVehicles));
    expect(result.current.comparedVehicleIds).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith('Failed to parse compare draft from local storage');
    
    consoleSpy.mockRestore();
  });
});

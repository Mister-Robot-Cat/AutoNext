import { useState, useMemo, useEffect } from 'react';
import { Vehicle } from '../types/vehicle';

const MAX_COMPARE_LIMIT = 4;
const STORAGE_KEY = 'autonext_compare_draft';

export function useCarComparison(vehicles: Vehicle[]) {
  const [comparedVehicleIds, setComparedVehicleIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse compare draft from local storage');
    }
    return [];
  });

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comparedVehicleIds));
  }, [comparedVehicleIds]);

  const toggleCompare = (car: Vehicle) => {
    setComparedVehicleIds((prev) => {
      if (prev.includes(car.id)) {
        return prev.filter((id) => id !== car.id);
      }
      if (prev.length >= MAX_COMPARE_LIMIT) {
        alert(`Maksimum ${MAX_COMPARE_LIMIT} avtomobili eyni anda müqayisə edə bilərsiniz.`);
        return prev;
      }
      return [...prev, car.id];
    });
  };

  const removeComparedVehicle = (id: string) => {
    setComparedVehicleIds((prev) => prev.filter((carId) => carId !== id));
  };

  const clearComparison = () => {
    setComparedVehicleIds([]);
  };

  const comparedVehicles = useMemo(
    () => vehicles.filter((v) => comparedVehicleIds.includes(v.id)),
    [vehicles, comparedVehicleIds]
  );

  return {
    comparedVehicleIds,
    comparedVehicles,
    toggleCompare,
    removeComparedVehicle,
    clearComparison,
    limit: MAX_COMPARE_LIMIT,
  };
}

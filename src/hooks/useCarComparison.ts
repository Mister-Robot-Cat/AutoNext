import { useMemo } from 'react';
import { Vehicle } from '../types/vehicle';
import { useLocalStorage } from './useLocalStorage';

const MAX_COMPARE_LIMIT = 4;
const STORAGE_KEY = 'autonext_compare_draft';

export function useCarComparison(vehicles: Vehicle[]) {
  const [comparedVehicleIds, setComparedVehicleIds] = useLocalStorage<string[]>(STORAGE_KEY, []);

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

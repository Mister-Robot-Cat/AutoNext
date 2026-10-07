import { useMemo } from 'react';
import { Vehicle } from '../types/vehicle';
import { useLocalStorage } from './useLocalStorage';
import { toastManager } from './useToast';

const MAX_COMPARE_LIMIT = 4;
const STORAGE_KEY = 'autonext_compare_draft';

export function useCarComparison(vehicles: Vehicle[]) {
  const [comparedVehicleIds, setComparedVehicleIds] = useLocalStorage<string[]>(STORAGE_KEY, []);

  const toggleCompare = (car: Vehicle) => {
    setComparedVehicleIds((prev) => {
      if (prev.includes(car.id)) {
        toastManager.add(`${car.title} müqayisədən silindi`, 'info');
        return prev.filter((id) => id !== car.id);
      }
      if (prev.length >= MAX_COMPARE_LIMIT) {
        toastManager.add(`Maksimum ${MAX_COMPARE_LIMIT} avtomobili eyni anda müqayisə edə bilərsiniz.`, 'warning');
        return prev;
      }
      toastManager.add(`${car.title} müqayisəyə əlavə edildi`, 'success');
      return [...prev, car.id];
    });
  };

  const removeComparedVehicle = (id: string) => {
    setComparedVehicleIds((prev) => {
      // Find the name if needed? Not available easily here unless we pass the car.
      return prev.filter((carId) => carId !== id);
    });
  };

  const clearComparison = () => {
    setComparedVehicleIds([]);
    toastManager.add('Müqayisə siyahısı təmizləndi', 'info');
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

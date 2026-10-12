import { describe, it, expect } from 'vitest';
import {
  evaluatePaintStatus,
  clearDtcCodes,
  filterInspectionItems,
  generateInspectionReport,
  recalculateInspectionReport,
  INSPECTION_CATEGORIES,
} from '../inspection';
import { Vehicle } from '../../types/vehicle';
import { InspectionItem, DiagnosticTroubleCode, PaintThicknessPanel } from '../../types/inspection';

const mockVehicle: Vehicle = {
  id: 'veh-test-1',
  title: 'Toyota Camry 2.5 Hybrid',
  vin: 'JTMBA3FV8MD019284',
  make: 'Toyota',
  model: 'Camry',
  year: 2022,
  priceAzn: 54000,
  mileageKm: 38000,
  engineVolumeLiters: 2.5,
  fuelType: 'hybrid',
  transmission: 'variator',
  drivetrain: 'fwd',
  powerHp: 218,
  fuelConsumptionLPer100Km: 4.8,
  bodyType: 'sedan',
  color: 'Mirvari Ağ',
  interiorColor: 'Qara Dəri',
  interiorMaterial: 'leather',
  city: 'Bakı',
  images: ['/cars/camry1.jpg'],
  features: ['LED', 'Kamera'],
  damageReport: [],
  valuation: {
    status: 'fair_price',
    percentageDiff: 0,
    avgMarketPriceAzn: 54000,
    minMarketPriceAzn: 52000,
    maxMarketPriceAzn: 56000,
    confidenceScore: 95,
    priceHistoryTrend: [],
  },
  seller: {
    id: 's-1',
    name: 'Toyota Bakı Mərkəzi',
    phone: '+994 50 123 45 67',
    type: 'official_dealer',
    rating: 4.9,
    reviewsCount: 42,
    verifiedIdentity: true,
    memberSinceYear: 2018,
    city: 'Bakı',
  },
  hasCustomsCleared: true,
  isCreditAvailable: true,
  isBarterAvailable: false,
  publishedDate: '2026-10-01',
  viewsCount: 310,
  description: 'İdeal vəziyyətdə Toyota Camry Hybrid',
};

const mockHighMileageVehicle: Vehicle = {
  ...mockVehicle,
  id: 'veh-test-2',
  year: 2016,
  mileageKm: 210000,
  priceAzn: 26000,
  fuelType: 'petrol',
  damageReport: [
    { partId: 'front_left_door', partName: 'Sürücü qapısı', severity: 'cosmetic_paint' },
    { partId: 'hood', partName: 'Kapot', severity: 'repaired' },
  ],
};

describe('Vehicle Inspection Diagnostic Engine', () => {
  describe('evaluatePaintStatus', () => {
    it('identifies original factory paint for <= 150 µm', () => {
      expect(evaluatePaintStatus(95)).toBe('original');
      expect(evaluatePaintStatus(120)).toBe('original');
      expect(evaluatePaintStatus(150)).toBe('original');
    });

    it('identifies repainted panels for 151-320 µm', () => {
      expect(evaluatePaintStatus(151)).toBe('repainted');
      expect(evaluatePaintStatus(230)).toBe('repainted');
      expect(evaluatePaintStatus(320)).toBe('repainted');
    });

    it('identifies putty / filler panels for > 320 µm', () => {
      expect(evaluatePaintStatus(321)).toBe('putty_filler');
      expect(evaluatePaintStatus(550)).toBe('putty_filler');
      expect(evaluatePaintStatus(900)).toBe('putty_filler');
    });
  });

  describe('clearDtcCodes', () => {
    it('returns an empty array when codes are cleared', () => {
      expect(clearDtcCodes()).toEqual([]);
    });
  });

  describe('filterInspectionItems', () => {
    const sampleItems: InspectionItem[] = [
      {
        id: '1',
        category: 'engine_powertrain',
        title: 'Kompressiya yoxlanışı',
        description: 'Bütün silindrlərdə bərabər təzyiq',
        status: 'pass',
        severity: 'none',
        estimatedRepairAzn: 0,
      },
      {
        id: '2',
        category: 'chassis_suspension',
        title: 'Amortizator yağı',
        description: 'Sol amortizatorda yağ tərləməsi',
        status: 'advisory',
        severity: 'minor',
        estimatedRepairAzn: 120,
      },
      {
        id: '3',
        category: 'brakes_tires',
        title: 'Əyləc diski',
        description: 'Diskdə dərin cızıqlar və əyrilik',
        status: 'fail',
        severity: 'moderate',
        estimatedRepairAzn: 200,
      },
    ];

    it('returns all items when filter criteria is all and query is empty', () => {
      const result = filterInspectionItems(sampleItems, '', 'all', 'all');
      expect(result).toHaveLength(3);
    });

    it('filters items by query keyword', () => {
      const result = filterInspectionItems(sampleItems, 'amortizator', 'all', 'all');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('filters items by category', () => {
      const result = filterInspectionItems(sampleItems, '', 'brakes_tires', 'all');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('3');
    });

    it('filters items by status', () => {
      const result = filterInspectionItems(sampleItems, '', 'all', 'fail');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('3');
    });

    it('filters by combined query, category and status', () => {
      const result = filterInspectionItems(sampleItems, 'yağ', 'chassis_suspension', 'advisory');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });
  });

  describe('generateInspectionReport', () => {
    it('generates a clean inspection report for a low-mileage hybrid car', () => {
      const report = generateInspectionReport(mockVehicle);

      expect(report.vehicleVin).toBe(mockVehicle.vin);
      expect(report.overallScore).toBeGreaterThanOrEqual(90);
      expect(report.recommendation).toBe('recommended');
      expect(report.criticalIssuesCount).toBe(0);
      expect(report.dtcCodes).toHaveLength(0);
      expect(report.totalCount).toBeGreaterThan(15);
      expect(report.paintPanels.length).toBeGreaterThan(5);
      expect(report.paintPanels.every((p) => p.status === 'original')).toBe(true);
    });

    it('reflects damage report into paint panel measurements and items', () => {
      const report = generateInspectionReport(mockHighMileageVehicle);

      // Check that hood has putty_filler status due to 'repaired' in damageReport
      const hoodPanel = report.paintPanels.find((p) => p.panelId === 'hood');
      expect(hoodPanel).toBeDefined();
      expect(hoodPanel?.status).toBe('putty_filler');
      expect(hoodPanel?.microns).toBeGreaterThan(350);

      // Check that driver door is repainted
      const doorPanel = report.paintPanels.find((p) => p.panelId === 'front_left_door');
      expect(doorPanel).toBeDefined();
      expect(doorPanel?.status).toBe('repainted');

      // High mileage vehicle has DTC codes and wear items
      expect(report.dtcCodes.length).toBeGreaterThan(0);
      expect(report.totalEstimatedRepairAzn).toBeGreaterThan(0);
      expect(report.recommendation).not.toBe('recommended');
    });

    it('has valid metadata and category scores across all categories', () => {
      const report = generateInspectionReport(mockVehicle);
      expect(report.inspectorName).toContain('Fərid Əliyev');
      expect(report.inspectorBadgeNumber).toBeTruthy();

      INSPECTION_CATEGORIES.forEach((cat) => {
        expect(report.categoryScores[cat.id]).toBeDefined();
        expect(report.categoryScores[cat.id]).toBeGreaterThanOrEqual(15);
        expect(report.categoryScores[cat.id]).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('recalculateInspectionReport', () => {
    it('properly reduces score and updates repair costs when an item fails', () => {
      const initial = generateInspectionReport(mockVehicle);
      const modifiedItems: InspectionItem[] = initial.items.map((it) => {
        if (it.id === 'eng_compression') {
          return {
            ...it,
            status: 'fail',
            severity: 'critical',
            estimatedRepairAzn: 1500,
          };
        }
        return it;
      });

      const updated = recalculateInspectionReport(initial, modifiedItems, initial.dtcCodes, initial.paintPanels);
      expect(updated.overallScore).toBeLessThan(initial.overallScore);
      expect(updated.failedCount).toBe(initial.failedCount + 1);
      expect(updated.criticalIssuesCount).toBeGreaterThan(initial.criticalIssuesCount);
      expect(updated.totalEstimatedRepairAzn).toBeGreaterThan(initial.totalEstimatedRepairAzn);
    });

    it('calculates avoid recommendation when critical issues are severe', () => {
      const initial = generateInspectionReport(mockVehicle);
      const failedItems: InspectionItem[] = initial.items.map((it) => ({
        ...it,
        status: 'fail',
        severity: 'critical',
        estimatedRepairAzn: 800,
      }));

      const updated = recalculateInspectionReport(initial, failedItems, initial.dtcCodes, initial.paintPanels);
      expect(updated.recommendation).toBe('avoid');
      expect(updated.overallScore).toBeLessThan(60);
    });

    it('improves score when DTC codes are cleared', () => {
      const initial = generateInspectionReport(mockHighMileageVehicle);
      expect(initial.dtcCodes.length).toBeGreaterThan(0);

      const cleared = recalculateInspectionReport(initial, initial.items, [], initial.paintPanels);
      expect(cleared.dtcCodes).toHaveLength(0);
      expect(cleared.categoryScores.obd2_diagnostics).toBeGreaterThanOrEqual(
        initial.categoryScores.obd2_diagnostics
      );
    });
  });
});

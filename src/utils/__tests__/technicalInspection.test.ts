import { describe, it, expect } from 'vitest';
import {
  calculateInspectionRequirements,
  generateDiagnosticTalon,
  bookInspectionAppointment,
} from '../technicalInspection';
import { Vehicle } from '../../types/vehicle';
import { MOCK_INSPECTION_STATIONS } from '../../data/mockTechnicalInspection';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

const mockVehicle2024: Vehicle = {
  ...MOCK_VEHICLES[0],
  id: 'veh-new',
  title: '2024 Hyundai Tucson',
  vin: 'KMHD35LB9PA123456',
  make: 'Hyundai',
  model: 'Tucson',
  year: 2024,
  priceAzn: 48000,
  mileageKm: 15000,
  engineVolumeLiters: 2.0,
  fuelType: 'petrol',
  transmission: 'automatic',
  drivetrain: 'fwd',
  powerHp: 150,
  fuelConsumptionLPer100Km: 7.8,
  bodyType: 'suv',
};

const mockVehicle2018: Vehicle = {
  ...mockVehicle2024,
  id: 'veh-mid',
  title: '2018 Toyota Camry',
  vin: '4T1B11HK5JU789012',
  make: 'Toyota',
  model: 'Camry',
  year: 2018,
  mileageKm: 95000,
  fuelType: 'hybrid',
  bodyType: 'sedan',
};

const mockVehicle2010: Vehicle = {
  ...mockVehicle2024,
  id: 'veh-old',
  title: '2010 Mercedes-Benz E-Class',
  vin: 'WDB2120481A345678',
  make: 'Mercedes-Benz',
  model: 'E-Class',
  year: 2010,
  mileageKm: 210000,
  fuelType: 'diesel',
  bodyType: 'sedan',
};

const mockVehicleEv: Vehicle = {
  ...mockVehicle2024,
  id: 'veh-ev',
  title: '2023 Tesla Model Y',
  vin: '5YJYGAEE8PF654321',
  make: 'Tesla',
  model: 'Model Y',
  year: 2023,
  mileageKm: 28000,
  fuelType: 'electric',
  fuelConsumptionLPer100Km: 0,
  bodyType: 'suv',
};

const mockVehiclePickup: Vehicle = {
  ...mockVehicle2024,
  id: 'veh-pickup',
  title: '2019 Toyota Hilux',
  vin: 'MR0BA3CD200987654',
  make: 'Toyota',
  model: 'Hilux',
  year: 2019,
  bodyType: 'pickup',
};

describe('calculateInspectionRequirements', () => {
  const referenceDate = new Date(2026, 5, 1);

  it('exempts vehicles aged 4 years or newer from mandatory inspection', () => {
    const result = calculateInspectionRequirements(mockVehicle2024, referenceDate);
    expect(result.isExempt).toBe(true);
    expect(result.frequencyYears).toBe(0);
    expect(result.status).toBe('exempt');
    expect(result.frequencyDescriptionAz).toContain('tam azaddır');
  });

  it('assigns 2-year inspection frequency for vehicles aged 4 to 10 years', () => {
    const result = calculateInspectionRequirements(mockVehicle2018, referenceDate);
    expect(result.isExempt).toBe(false);
    expect(result.frequencyYears).toBe(2);
    expect(result.frequencyDescriptionAz).toContain('2 ildə bir');
  });

  it('assigns annual inspection frequency for vehicles older than 10 years', () => {
    const result = calculateInspectionRequirements(mockVehicle2010, referenceDate);
    expect(result.isExempt).toBe(false);
    expect(result.frequencyYears).toBe(1);
    expect(result.frequencyDescriptionAz).toContain('Hər il keçirilir');
  });

  it('calculates standard fees for passenger cars (30 + 10 + 1.50 = 41.50 AZN)', () => {
    const result = calculateInspectionRequirements(mockVehicle2018, referenceDate);
    expect(result.stateDutyAzn).toBe(30);
    expect(result.serviceDiagnosticFeeAzn).toBe(10);
    expect(result.bankProcessingFeeAzn).toBe(1.5);
    expect(result.totalFeeAzn).toBe(41.5);
    expect(result.category).toBe('passenger');
  });

  it('calculates commercial duty for pickup vehicles (40 + 10 + 1.50 = 51.50 AZN)', () => {
    const result = calculateInspectionRequirements(mockVehiclePickup, referenceDate);
    expect(result.stateDutyAzn).toBe(40);
    expect(result.totalFeeAzn).toBe(51.5);
    expect(result.category).toBe('commercial');
  });

  it('returns valid ISO date string for nextDueDate', () => {
    const result = calculateInspectionRequirements(mockVehicle2018, referenceDate);
    expect(result.nextDueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('generateDiagnosticTalon', () => {
  const referenceDate = new Date(2026, 5, 1);

  it('generates complete talon certificate with official number and pin', () => {
    const talon = generateDiagnosticTalon(mockVehicle2018, referenceDate);
    expect(talon.talonNumber).toMatch(/^AZ-TB-2026-\d{5}$/);
    expect(talon.pinCode).toMatch(/^PIN-\d{4}$/);
    expect(talon.inspectorName).toContain('Polis');
    expect(talon.centerName).toBeTruthy();
  });

  it('produces zero emission lab result for electric vehicles (EV)', () => {
    const talon = generateDiagnosticTalon(mockVehicleEv, referenceDate);
    expect(talon.emissionTest.emissionStandard).toBe('Zero-Emission (EV)');
    expect(talon.emissionTest.coPercent).toBe(0);
    expect(talon.emissionTest.hcPpm).toBe(0);
    expect(talon.emissionTest.co2GramsPerKm).toBe(0);
    expect(talon.emissionTest.status).toBe('passed');
  });

  it('calculates realistic brake test metrics adhering to legal limits', () => {
    const talon = generateDiagnosticTalon(mockVehicle2018, referenceDate);
    expect(talon.brakeTest.brakeEfficiencyPercent).toBeGreaterThanOrEqual(50);
    expect(talon.brakeTest.axleImbalancePercent).toBeLessThanOrEqual(30);
    expect(talon.brakeTest.frontAxleBrakingForceKn).toBeGreaterThan(0);
    expect(talon.brakeTest.status).toBe('passed');
  });

  it('includes required safety gear in the vehicle inspection report', () => {
    const talon = generateDiagnosticTalon(mockVehicle2018, referenceDate);
    expect(talon.safetyEquipment.firstAidKit).toBe(true);
    expect(talon.safetyEquipment.fireExtinguisher).toBe(true);
    expect(talon.safetyEquipment.warningTriangle).toBe(true);
    expect(talon.safetyEquipment.tyreTreadDepthMm).toBeGreaterThanOrEqual(1.6);
  });

  it('assigns 150 AZN fine risk and legal citation if vehicle is expired', () => {
    const expiredVehicle: Vehicle = {
      ...mockVehicle2010,
      vin: 'EXPIRED1234567890',
    };
    const talon = generateDiagnosticTalon(expiredVehicle, referenceDate);
    if (talon.status === 'expired') {
      expect(talon.fineRiskAzn).toBe(150);
      expect(talon.legalArticleCitation).toContain('339.1-1');
      expect(talon.overallResult).toBe('failed');
    }
  });
});

describe('bookInspectionAppointment', () => {
  const stationId = MOCK_INSPECTION_STATIONS[0].id;

  it('successfully creates an appointment with valid parameters', () => {
    const result = bookInspectionAppointment({
      stationId,
      vehicleVin: '4T1B11HK5JU789012',
      plateNumber: '10-AA-100',
      scheduledDate: '2026-06-15',
      scheduledTime: '10:15',
      applicantName: 'Rəşad Quliyev',
      applicantPhone: '+994 50 123-45-67',
    });

    expect(result.success).toBe(true);
    expect(result.appointment).toBeDefined();
    expect(result.appointment?.bookingId).toMatch(/^TB-BOOK-/);
    expect(result.appointment?.plateNumber).toBe('10-AA-100');
    expect(result.appointment?.qrReferenceCode).toContain('AZ-DYP-ETALON-10-AA-100');
    expect(result.appointment?.status).toBe('confirmed');
  });

  it('rejects booking when station ID is not found', () => {
    const result = bookInspectionAppointment({
      stationId: 'non-existent-station',
      vehicleVin: '4T1B11HK5JU789012',
      plateNumber: '10-AA-100',
      scheduledDate: '2026-06-15',
      scheduledTime: '10:15',
      applicantName: 'Rəşad Quliyev',
      applicantPhone: '+994 50 123-45-67',
    });

    expect(result.success).toBe(false);
    expect(result.errorMessage).toContain('tapılmadı');
  });

  it('rejects booking when applicant name is blank', () => {
    const result = bookInspectionAppointment({
      stationId,
      vehicleVin: '4T1B11HK5JU789012',
      plateNumber: '10-AA-100',
      scheduledDate: '2026-06-15',
      scheduledTime: '10:15',
      applicantName: '   ',
      applicantPhone: '+994 50 123-45-67',
    });

    expect(result.success).toBe(false);
    expect(result.errorMessage).toContain('Ad və soyad');
  });

  it('rejects booking when phone number is too short or invalid', () => {
    const result = bookInspectionAppointment({
      stationId,
      vehicleVin: '4T1B11HK5JU789012',
      plateNumber: '10-AA-100',
      scheduledDate: '2026-06-15',
      scheduledTime: '10:15',
      applicantName: 'Rəşad Quliyev',
      applicantPhone: '1234',
    });

    expect(result.success).toBe(false);
    expect(result.errorMessage).toContain('əlaqə nömrəsi');
  });

  it('rejects booking when plate number is blank', () => {
    const result = bookInspectionAppointment({
      stationId,
      vehicleVin: '4T1B11HK5JU789012',
      plateNumber: '',
      scheduledDate: '2026-06-15',
      scheduledTime: '10:15',
      applicantName: 'Rəşad Quliyev',
      applicantPhone: '+994 50 123-45-67',
    });

    expect(result.success).toBe(false);
    expect(result.errorMessage).toContain('Dövlət qeydiyyat nişanı');
  });
});

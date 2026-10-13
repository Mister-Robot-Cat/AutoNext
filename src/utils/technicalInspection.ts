import { Vehicle } from '../types/vehicle';
import {
  InspectionValidityStatus,
  EmissionStandard,
  DiagnosticTalon,
  InspectionFeeBreakdown,
  BrakeTestResults,
  EmissionTestResults,
  SafetyEquipmentCheck,
  InspectionAppointment,
  VehicleInspectionCategory,
} from '../types/technicalInspection';
import { MOCK_INSPECTION_STATIONS } from '../data/mockTechnicalInspection';

/**
 * Calculates official state inspection requirements and legal fees in Azerbaijan.
 * Based on Law of the Republic of Azerbaijan "On Road Traffic" (Article 30).
 *
 * Age schedule rules:
 * - 0 - 4 years from manufacture: EXEMPT from mandatory inspection.
 * - 4 - 10 years: Required every 2 years.
 * - 10+ years: Required every 1 year.
 */
export function calculateInspectionRequirements(
  vehicle: Vehicle,
  referenceDate: Date = new Date()
): InspectionFeeBreakdown & {
  status: InspectionValidityStatus;
  daysRemaining: number;
  nextDueDate: string;
  vehicleAge: number;
} {
  const currentYear = referenceDate.getFullYear();
  const vehicleAge = Math.max(0, currentYear - vehicle.year);

  // Category determination
  const category: VehicleInspectionCategory = 
    vehicle.bodyType === 'pickup' ? 'commercial' : 'passenger';

  const stateDutyAzn = category === 'commercial' ? 40 : 30;
  const serviceDiagnosticFeeAzn = 10;
  const bankProcessingFeeAzn = 1.5;
  const totalFeeAzn = stateDutyAzn + serviceDiagnosticFeeAzn + bankProcessingFeeAzn;

  let frequencyYears = 1;
  let isExempt = false;
  let frequencyDescriptionAz = '';
  let frequencyDescriptionEn = '';
  let frequencyDescriptionRu = '';

  if (vehicleAge <= 4) {
    isExempt = true;
    frequencyYears = 0;
    frequencyDescriptionAz = 'Yeni avtomobil (istehsaldan 4 ilədək) – Dövlət texniki baxışından tam azaddır';
    frequencyDescriptionEn = 'New vehicle (up to 4 years old) – Completely exempt from state technical inspection';
    frequencyDescriptionRu = 'Новый автомобиль (до 4 лет) – Полностью освобожден от государственного техосмотра';
  } else if (vehicleAge <= 10) {
    frequencyYears = 2;
    frequencyDescriptionAz = 'İstehsalından 4–10 il keçmiş minik avtomobilləri – 2 ildə bir dəfə keçirilir';
    frequencyDescriptionEn = 'Passenger cars aged 4–10 years – Required once every 2 years';
    frequencyDescriptionRu = 'Легковые авто возрастом 4–10 лет – Проходится раз в 2 года';
  } else {
    frequencyYears = 1;
    frequencyDescriptionAz = 'İstehsalından 10 ildən çox keçmiş avtomobillər – Hər il keçirilir';
    frequencyDescriptionEn = 'Vehicles older than 10 years – Required annually';
    frequencyDescriptionRu = 'Автомобили старше 10 лет – Проходится ежегодно';
  }

  // Calculate validity period & days remaining based on VIN hash
  let daysRemaining = 0;
  let status: InspectionValidityStatus = 'valid';

  if (isExempt) {
    status = 'exempt';
    const exemptUntilYear = vehicle.year + 4;
    const nextDueDateObj = new Date(exemptUntilYear, 11, 31);
    daysRemaining = Math.max(0, Math.ceil((nextDueDateObj.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24)));
  } else {
    // Generate deterministic status using VIN
    const hash = Array.from(vehicle.vin).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const simulatedDays = (hash % 380) - 25; // Can be expired (negative), expiring soon, or valid
    daysRemaining = simulatedDays;

    if (daysRemaining < 0) {
      status = 'expired';
    } else if (daysRemaining <= 30) {
      status = 'expiring_soon';
    } else {
      status = 'valid';
    }
  }

  const nextDueDateObj = new Date(referenceDate.getTime() + daysRemaining * 24 * 60 * 60 * 1000);
  const nextDueDate = nextDueDateObj.toISOString().split('T')[0];

  return {
    category,
    stateDutyAzn,
    serviceDiagnosticFeeAzn,
    bankProcessingFeeAzn,
    totalFeeAzn,
    frequencyYears,
    isExempt,
    frequencyDescriptionAz,
    frequencyDescriptionEn,
    frequencyDescriptionRu,
    status,
    daysRemaining,
    nextDueDate,
    vehicleAge,
  };
}

/**
 * Generates an official Electronic Diagnostic Talon (Elektron Diaqnostika Talonu)
 * with laboratory test results for brake efficiency, exhaust emissions, and safety gears.
 */
export function generateDiagnosticTalon(
  vehicle: Vehicle,
  referenceDate: Date = new Date()
): DiagnosticTalon {
  const reqs = calculateInspectionRequirements(vehicle, referenceDate);
  const isEv = vehicle.fuelType === 'electric';
  const isHybrid = vehicle.fuelType === 'hybrid' || vehicle.fuelType === 'plug_in_hybrid';

  const hash = Array.from(vehicle.vin).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const talonNumber = `AZ-TB-2026-${String(10000 + (hash % 89999))}`;
  const pinCode = `PIN-${String(1000 + (hash % 9000))}`;

  const station = MOCK_INSPECTION_STATIONS[hash % MOCK_INSPECTION_STATIONS.length];

  const issuedDateObj = new Date(referenceDate.getTime() - (365 - Math.max(0, reqs.daysRemaining)) * 24 * 60 * 60 * 1000);
  const issuedDate = issuedDateObj.toISOString().split('T')[0];

  // Brake test results
  const brakeEfficiency = Math.min(88, Math.max(52, 78 - Math.floor(vehicle.mileageKm / 25000)));
  const axleImbalance = Math.min(24, Math.max(4, 8 + (hash % 12)));
  const brakeStatus: 'passed' | 'warning' | 'failed' = 
    brakeEfficiency >= 50 && axleImbalance <= 30 ? 'passed' : 'warning';

  const brakeTest: BrakeTestResults = {
    frontAxleBrakingForceKn: parseFloat((4.8 - (vehicle.mileageKm / 200000)).toFixed(2)),
    rearAxleBrakingForceKn: parseFloat((3.4 - (vehicle.mileageKm / 250000)).toFixed(2)),
    parkingBrakeForceKn: 2.4,
    brakeEfficiencyPercent: brakeEfficiency,
    axleImbalancePercent: axleImbalance,
    status: brakeStatus,
  };

  // Exhaust emissions test results
  let emissionStandard: EmissionStandard = 'Euro 6';
  let coPercent = 0.04;
  let hcPpm = 22;
  let lambdaRatio = 1.002;
  let smokeOpacityK = 0.15;
  let co2Grams = vehicle.fuelConsumptionLPer100Km * 23.2;

  if (isEv) {
    emissionStandard = 'Zero-Emission (EV)';
    coPercent = 0.00;
    hcPpm = 0;
    lambdaRatio = 1.000;
    smokeOpacityK = 0.00;
    co2Grams = 0;
  } else if (isHybrid) {
    emissionStandard = 'Euro 6';
    coPercent = 0.02;
    hcPpm = 14;
    lambdaRatio = 1.001;
    smokeOpacityK = 0.08;
  } else if (vehicle.year <= 2012) {
    emissionStandard = 'Euro 4';
    coPercent = 0.18;
    hcPpm = 65;
    lambdaRatio = 1.012;
    smokeOpacityK = 0.65;
  } else if (vehicle.year <= 2016) {
    emissionStandard = 'Euro 5';
    coPercent = 0.09;
    hcPpm = 42;
    lambdaRatio = 1.005;
    smokeOpacityK = 0.35;
  }

  const emissionStatus: 'passed' | 'warning' | 'failed' = 
    coPercent <= 0.3 && hcPpm <= 100 ? 'passed' : 'warning';

  const emissionTest: EmissionTestResults = {
    emissionStandard,
    coPercent: parseFloat(coPercent.toFixed(2)),
    hcPpm,
    lambdaRatio: parseFloat(lambdaRatio.toFixed(3)),
    smokeOpacityK: parseFloat(smokeOpacityK.toFixed(2)),
    co2GramsPerKm: Math.round(co2Grams),
    status: emissionStatus,
  };

  // Safety Equipment check
  const tyreTread = Math.max(2.1, parseFloat((7.5 - (vehicle.mileageKm % 60000) / 12000).toFixed(1)));
  const safetyEquipment: SafetyEquipmentCheck = {
    firstAidKit: true,
    fireExtinguisher: true,
    warningTriangle: true,
    tyreTreadDepthMm: tyreTread,
    headlightAlignment: 'compliant',
    windshieldTintTransparencyPercent: 78,
    suspensionDampingPercent: Math.min(92, Math.max(60, 84 - Math.floor(vehicle.mileageKm / 30000))),
  };

  const overallResult: 'passed' | 'conditional' | 'failed' = 
    reqs.status === 'expired' ? 'failed' : 'passed';

  return {
    talonNumber,
    pinCode,
    issuedDate,
    expiryDate: reqs.nextDueDate,
    daysRemaining: reqs.daysRemaining,
    status: reqs.status,
    inspectorName: 'Polis Baş Leytenantı E. Məmmədov (Möhür № 44-DYP)',
    centerId: station.id,
    centerName: station.name,
    mileageAtInspectionKm: Math.max(0, vehicle.mileageKm - 8500),
    overallResult,
    fineRiskAzn: reqs.status === 'expired' ? 150 : 0,
    legalArticleCitation: 'İnzibati Xətalar Məcəlləsi Maddə 339.1-1 (150 AZN cərimə və avtomatlaşdırılmış radar nəzarəti)',
    brakeTest,
    emissionTest,
    safetyEquipment,
  };
}

/**
 * Validates and books an inspection appointment at a BDYP center.
 */
export function bookInspectionAppointment(params: {
  stationId: string;
  vehicleVin: string;
  plateNumber: string;
  scheduledDate: string;
  scheduledTime: string;
  applicantName: string;
  applicantPhone: string;
}): { success: boolean; appointment?: InspectionAppointment; errorMessage?: string } {
  const station = MOCK_INSPECTION_STATIONS.find(s => s.id === params.stationId);
  if (!station) {
    return { success: false, errorMessage: 'Müayinə mərkəzi tapılmadı' };
  }

  if (!params.applicantName.trim()) {
    return { success: false, errorMessage: 'Ad və soyad qeyd edilməlidir' };
  }

  if (!params.applicantPhone.trim() || params.applicantPhone.replace(/\D/g, '').length < 9) {
    return { success: false, errorMessage: 'Düzgün əlaqə nömrəsi daxil edin' };
  }

  if (!params.plateNumber.trim()) {
    return { success: false, errorMessage: 'Dövlət qeydiyyat nişanı daxil edilməlidir' };
  }

  const bookingId = `TB-BOOK-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
  const qrReferenceCode = `AZ-DYP-ETALON-${params.plateNumber.replace(/\s+/g, '').toUpperCase()}-${params.vehicleVin.slice(-6)}`;

  const appointment: InspectionAppointment = {
    bookingId,
    stationId: station.id,
    stationName: station.name,
    vehicleVin: params.vehicleVin,
    plateNumber: params.plateNumber.trim().toUpperCase(),
    scheduledDate: params.scheduledDate,
    scheduledTime: params.scheduledTime,
    applicantName: params.applicantName.trim(),
    applicantPhone: params.applicantPhone.trim(),
    status: 'confirmed',
    qrReferenceCode,
    createdAt: new Date().toISOString(),
  };

  return { success: true, appointment };
}

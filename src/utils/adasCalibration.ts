import { Currency } from '../types/vehicle';
import { CURRENCY_RATES, formatPrice } from './i18n';
import {
  AdasSystemKey,
  CalibrationTriggerKey,
  CalibrationMethod,
  AdasCenter,
  AdasPackage,
  AdasDtcCode,
  MockAdasCertificateRecord,
  ADAS_SYSTEMS,
  CALIBRATION_TRIGGERS,
  ACCREDITED_ADAS_CENTERS,
  ADAS_PACKAGES,
  ADAS_DTC_CODES,
  MOCK_ACTIVE_ADAS_CERTIFICATES
} from '../data/mockAdasData';

export interface LaserStandTelemetry {
  distanceMm: number;
  centerlineOffsetMm: number;
  cameraPitchDeg: number;
  cameraYawDeg: number;
  radarPitchDeg: number;
  radarYawDeg: number;
}

export interface AdasToleranceEvaluation {
  isCameraCompliant: boolean;
  isRadarCompliant: boolean;
  isLaserCompliant: boolean;
  allPassed: boolean;
  cameraPitchError: number;
  cameraYawError: number;
  radarPitchError: number;
  radarYawError: number;
  centerlineError: number;
  errors: string[];
}

export interface AdasPriceBreakdown {
  packageId: string;
  packageNameAz: string;
  basePriceAzn: number;
  dtcClearanceFeeAzn: number;
  expressBayFeeAzn: number;
  vatAzn: number;
  totalPriceAzn: number;
  totalPriceConverted: number;
  formattedTotal: string;
  currency: Currency;
  estimatedDurationMinutes: number;
  method: CalibrationMethod;
}

export interface DynamicRoadTestTelemetry {
  progressPct: number;
  isCompleted: boolean;
  speedKmh: number;
  laneMarkingsDetected: boolean;
  obstaclesTracked: number;
  remainingMinutes: number;
  statusTextAz: string;
}

/**
 * Evaluates laser stand measurements against statutory UNECE R152 / R157 tolerances
 */
export function evaluateAdasTolerances(telemetry: LaserStandTelemetry): AdasToleranceEvaluation {
  const CAMERA_PITCH_LIMIT = 0.20;
  const CAMERA_YAW_LIMIT = 0.20;
  const RADAR_PITCH_LIMIT = 0.30;
  const RADAR_YAW_LIMIT = 0.30;
  const CENTERLINE_OFFSET_LIMIT = 5; // mm

  const cameraPitchError = Math.abs(telemetry.cameraPitchDeg);
  const cameraYawError = Math.abs(telemetry.cameraYawDeg);
  const radarPitchError = Math.abs(telemetry.radarPitchDeg);
  const radarYawError = Math.abs(telemetry.radarYawDeg);
  const centerlineError = Math.abs(telemetry.centerlineOffsetMm);

  const isCameraCompliant = cameraPitchError <= CAMERA_PITCH_LIMIT && cameraYawError <= CAMERA_YAW_LIMIT;
  const isRadarCompliant = radarPitchError <= RADAR_PITCH_LIMIT && radarYawError <= RADAR_YAW_LIMIT;
  const isLaserCompliant = centerlineError <= CENTERLINE_OFFSET_LIMIT;

  const errors: string[] = [];

  if (cameraPitchError > CAMERA_PITCH_LIMIT) {
    errors.push(`Ön kamera şaquli bucağı (Pitch) həddi aşıb: ${telemetry.cameraPitchDeg.toFixed(2)}° (Norma: ±${CAMERA_PITCH_LIMIT}°)`);
  }
  if (cameraYawError > CAMERA_YAW_LIMIT) {
    errors.push(`Ön kamera üfüqi bucağı (Yaw) həddi aşıb: ${telemetry.cameraYawDeg.toFixed(2)}° (Norma: ±${CAMERA_YAW_LIMIT}°)`);
  }
  if (radarPitchError > RADAR_PITCH_LIMIT) {
    errors.push(`Ön 77 GHz radar şaquli bucağı həddi aşıb: ${telemetry.radarPitchDeg.toFixed(2)}° (Norma: ±${RADAR_PITCH_LIMIT}°)`);
  }
  if (radarYawError > RADAR_YAW_LIMIT) {
    errors.push(`Ön 77 GHz radar üfüqi bucağı həddi aşıb: ${telemetry.radarYawDeg.toFixed(2)}° (Norma: ±${RADAR_YAW_LIMIT}°)`);
  }
  if (centerlineError > CENTERLINE_OFFSET_LIMIT) {
    errors.push(`Lazer mərkəz oxundan kənaraçıxma: ${telemetry.centerlineOffsetMm} mm (Norma: ±${CENTERLINE_OFFSET_LIMIT} mm)`);
  }

  const allPassed = isCameraCompliant && isRadarCompliant && isLaserCompliant;

  return {
    isCameraCompliant,
    isRadarCompliant,
    isLaserCompliant,
    allPassed,
    cameraPitchError,
    cameraYawError,
    radarPitchError,
    radarYawError,
    centerlineError,
    errors
  };
}

/**
 * Calculates itemized pricing for ADAS calibration services in AZN, USD, or EUR
 */
export function calculateAdasPricing(
  packageId: string,
  currency: Currency = 'AZN',
  hasDtcClearance: boolean = false,
  hasExpressBay: boolean = false
): AdasPriceBreakdown {
  const pkg = ADAS_PACKAGES.find(p => p.id === packageId) || ADAS_PACKAGES[0];
  const basePriceAzn = pkg.basePriceAzn;
  const dtcClearanceFeeAzn = hasDtcClearance ? 20 : 0;
  const expressBayFeeAzn = hasExpressBay ? 30 : 0;

  const subtotalAzn = basePriceAzn + dtcClearanceFeeAzn + expressBayFeeAzn;
  const vatAzn = Math.round(subtotalAzn * 0.18 * 100) / 100;
  const totalPriceAzn = subtotalAzn + vatAzn;

  let totalPriceConverted = totalPriceAzn;
  if (currency === 'USD') {
    totalPriceConverted = totalPriceAzn / CURRENCY_RATES.USD;
  } else if (currency === 'EUR') {
    totalPriceConverted = totalPriceAzn / CURRENCY_RATES.EUR;
  }

  return {
    packageId: pkg.id,
    packageNameAz: pkg.nameAz,
    basePriceAzn,
    dtcClearanceFeeAzn,
    expressBayFeeAzn,
    vatAzn,
    totalPriceAzn,
    totalPriceConverted,
    formattedTotal: formatPrice(totalPriceAzn, currency),
    currency,
    estimatedDurationMinutes: hasExpressBay ? Math.round(pkg.estimatedDurationMinutes * 0.7) : pkg.estimatedDurationMinutes,
    method: pkg.method
  };
}

/**
 * Returns required systems to be calibrated for a given event trigger
 */
export function getRequiredSystemsForTrigger(triggerKey: CalibrationTriggerKey): AdasSystemKey[] {
  const trigger = CALIBRATION_TRIGGERS[triggerKey];
  return trigger ? trigger.requiredSystems : ['AEB', 'LKA'];
}

/**
 * Generates an official state-format certificate identifier
 */
export function generateAdasCertificateNumber(): string {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `AZS-ADAS-2026-${randomSuffix}`;
}

/**
 * Generates a SHA-like pseudo-random 32-character hex security checksum
 */
export function generateAdasSecurityHash(plate: string, vin: string, certNo: string): string {
  let hash = 0;
  const seed = `${plate}:${vin}:${certNo}:AZS-ADAS-GOV-AZ`;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex}e4f19b2a7c8d9e0f1a2b3c4d${hex}`.slice(0, 32);
}

/**
 * Filters accredited centers by keyword and optional district
 */
export function filterAdasCenters(query: string = '', district?: string): AdasCenter[] {
  const cleanQuery = query.trim().toLowerCase();
  return ACCREDITED_ADAS_CENTERS.filter(center => {
    const matchesQuery =
      !cleanQuery ||
      center.nameAz.toLowerCase().includes(cleanQuery) ||
      center.addressAz.toLowerCase().includes(cleanQuery) ||
      center.equipment.toLowerCase().includes(cleanQuery) ||
      center.district.toLowerCase().includes(cleanQuery);

    const matchesDistrict = !district || district === 'all' || center.district.toLowerCase() === district.toLowerCase();

    return matchesQuery && matchesDistrict;
  });
}

/**
 * Searches active verified certificates in unified registry
 */
export function findAdasCertificateByQuery(query: string): MockAdasCertificateRecord | undefined {
  const clean = query.trim().toUpperCase().replace(/\s+/g, '');
  if (!clean) return undefined;

  return MOCK_ACTIVE_ADAS_CERTIFICATES.find(cert => {
    const certClean = cert.certificateNo.replace(/-/g, '').toUpperCase();
    const plateClean = cert.vehiclePlate.replace(/-/g, '').toUpperCase();
    const vinClean = cert.vin.toUpperCase();
    const cleanSearch = clean.replace(/-/g, '');

    return (
      certClean.includes(cleanSearch) ||
      plateClean.includes(cleanSearch) ||
      vinClean.includes(cleanSearch)
    );
  });
}

/**
 * Simulates dynamic on-road calibration drive
 */
export function simulateDynamicRoadDrive(progressPct: number): DynamicRoadTestTelemetry {
  const boundedPct = Math.min(100, Math.max(0, progressPct));
  const isCompleted = boundedPct >= 100;

  let speedKmh = 0;
  let statusTextAz = 'Gözləmədə...';

  if (boundedPct > 0 && boundedPct < 30) {
    speedKmh = 45;
    statusTextAz = 'Magistral zolaq xətlərinin axtarışı və optik aşkarlanması...';
  } else if (boundedPct >= 30 && boundedPct < 70) {
    speedKmh = 65;
    statusTextAz = 'Zolaq mərkəzinin öyrənilməsi və 77 GHz radar reflektor analizi...';
  } else if (boundedPct >= 70 && boundedPct < 100) {
    speedKmh = 55;
    statusTextAz = 'Yol nişanları (TSR) və kor nöqtə (BSM) sensorlarının son testi...';
  } else if (isCompleted) {
    speedKmh = 0;
    statusTextAz = 'Dinamik yol testi müvəffəqiyyətlə tamamlandı!';
  }

  const laneMarkingsDetected = boundedPct >= 20;
  const obstaclesTracked = Math.min(8, Math.floor(boundedPct / 12));
  const remainingMinutes = isCompleted ? 0 : Math.max(1, Math.ceil((100 - boundedPct) * 0.15));

  return {
    progressPct: boundedPct,
    isCompleted,
    speedKmh,
    laneMarkingsDetected,
    obstaclesTracked,
    remainingMinutes,
    statusTextAz
  };
}

/**
 * Looks up DTC description & recommended resolution
 */
export function getDtcCodeDetails(code: string): AdasDtcCode | undefined {
  const clean = code.trim().toUpperCase();
  return ADAS_DTC_CODES.find(c => c.code === clean);
}

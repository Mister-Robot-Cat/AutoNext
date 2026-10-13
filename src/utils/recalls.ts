import { Vehicle } from '../types/vehicle';
import {
  RecallCampaign,
  RecallSeverity,
  RecallStatus,
  RecallCategory,
  VehicleRecallReport,
  RecallAppointmentBooking,
  RecallClearanceCertificate,
} from '../types/recall';
import {
  MOCK_RECALL_CAMPAIGNS_BY_VIN,
  getFallbackRecallCampaigns,
} from '../data/mockRecallDatabase';

/**
 * Calculates a vehicle safety score between 0 and 100 based on open and completed recall campaigns.
 */
export const calculateRecallSafetyScore = (campaigns: RecallCampaign[]): number => {
  const activeCampaigns = campaigns.filter(
    (c) => c.status === 'open_action_required' || c.status === 'remedy_scheduled'
  );

  if (activeCampaigns.length === 0) {
    return 100;
  }

  let penalty = 0;
  for (const campaign of activeCampaigns) {
    const isScheduled = campaign.status === 'remedy_scheduled';
    const scheduledDiscount = isScheduled ? 0.5 : 1.0;

    switch (campaign.severity) {
      case 'critical':
        penalty += 35 * scheduledDiscount;
        break;
      case 'high':
        penalty += 20 * scheduledDiscount;
        break;
      case 'medium':
        penalty += 10 * scheduledDiscount;
        break;
      case 'low':
        penalty += 5 * scheduledDiscount;
        break;
    }
  }

  const score = Math.max(25, Math.min(100, Math.round(100 - penalty)));
  return score;
};

/**
 * Retrieves the complete recall report for a vehicle by VIN.
 */
export const getVehicleRecallReport = (vehicle: Vehicle): VehicleRecallReport => {
  const campaigns =
    MOCK_RECALL_CAMPAIGNS_BY_VIN[vehicle.vin] ||
    getFallbackRecallCampaigns(vehicle.vin, vehicle.make, vehicle.model, vehicle.year);

  const activeRecalls = campaigns.filter(
    (c) => c.status === 'open_action_required' || c.status === 'remedy_scheduled'
  );
  const completedRecalls = campaigns.filter((c) => c.status === 'remedy_completed');
  const safetyScore = calculateRecallSafetyScore(campaigns);

  const hasCriticalOpen = activeRecalls.some((c) => c.severity === 'critical');
  let overallStatus: 'safe' | 'action_required' | 'critical_hazard' = 'safe';

  if (hasCriticalOpen) {
    overallStatus = 'critical_hazard';
  } else if (activeRecalls.length > 0) {
    overallStatus = 'action_required';
  } else {
    overallStatus = 'safe';
  }

  // Generate deterministic verification hash
  const verificationHash = `RC-VER-${vehicle.vin.slice(0, 4)}-${vehicle.vin.slice(-4)}-${campaigns.length}X9`.toUpperCase();

  return {
    vin: vehicle.vin,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    overallStatus,
    safetyScore,
    activeRecallsCount: activeRecalls.length,
    completedRecallsCount: completedRecalls.length,
    totalCampaignsCount: campaigns.length,
    campaigns,
    lastCheckedDate: '2026-10-13',
    verificationHash,
  };
};

/**
 * Returns UI badge styling and multilingual labels for recall severities.
 */
export const getRecallSeverityBadge = (
  severity: RecallSeverity
): {
  labelAz: string;
  labelEn: string;
  labelRu: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
} => {
  switch (severity) {
    case 'critical':
      return {
        labelAz: 'Kritik Təhlükəsizlik Riski',
        labelEn: 'Critical Safety Hazard',
        labelRu: 'Критический риск безопасности',
        bgClass: 'bg-rose-50 dark:bg-rose-950/40',
        textClass: 'text-rose-700 dark:text-rose-400',
        borderClass: 'border-rose-300 dark:border-rose-800',
      };
    case 'high':
      return {
        labelAz: 'Yüksək Prioritet',
        labelEn: 'High Priority',
        labelRu: 'Высокий приоритет',
        bgClass: 'bg-amber-50 dark:bg-amber-950/40',
        textClass: 'text-amber-700 dark:text-amber-400',
        borderClass: 'border-amber-300 dark:border-amber-800',
      };
    case 'medium':
      return {
        labelAz: 'Orta Təsir Dərəcəsi',
        labelEn: 'Moderate Severity',
        labelRu: 'Средняя степень',
        bgClass: 'bg-blue-50 dark:bg-blue-950/40',
        textClass: 'text-blue-700 dark:text-blue-400',
        borderClass: 'border-blue-300 dark:border-blue-800',
      };
    case 'low':
      return {
        labelAz: 'Məlumat / Aşağı Prioritet',
        labelEn: 'Low Advisory',
        labelRu: 'Низкий / Информационный',
        bgClass: 'bg-slate-50 dark:bg-slate-800/40',
        textClass: 'text-slate-700 dark:text-slate-400',
        borderClass: 'border-slate-300 dark:border-slate-700',
      };
  }
};

/**
 * Returns UI badge styling and multilingual labels for recall statuses.
 */
export const getRecallStatusBadge = (
  status: RecallStatus
): {
  labelAz: string;
  labelEn: string;
  labelRu: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
} => {
  switch (status) {
    case 'open_action_required':
      return {
        labelAz: 'Təmir Tələb Olunur',
        labelEn: 'Action Required',
        labelRu: 'Требуется устранение',
        bgClass: 'bg-amber-100 dark:bg-amber-900/50',
        textClass: 'text-amber-800 dark:text-amber-300',
        borderClass: 'border-amber-400 dark:border-amber-700',
      };
    case 'remedy_scheduled':
      return {
        labelAz: 'Dilerdə Rezerv Edilib',
        labelEn: 'Appointment Scheduled',
        labelRu: 'Запись оформлена',
        bgClass: 'bg-indigo-100 dark:bg-indigo-900/50',
        textClass: 'text-indigo-800 dark:text-indigo-300',
        borderClass: 'border-indigo-400 dark:border-indigo-700',
      };
    case 'remedy_completed':
      return {
        labelAz: 'Dilerdə İcra Edilib',
        labelEn: 'Remedy Completed',
        labelRu: 'Устранено дилером',
        bgClass: 'bg-emerald-100 dark:bg-emerald-900/50',
        textClass: 'text-emerald-800 dark:text-emerald-300',
        borderClass: 'border-emerald-400 dark:border-emerald-700',
      };
    case 'not_affected':
      return {
        labelAz: 'Təsirə Məruz Qalmayıb',
        labelEn: 'Not Affected',
        labelRu: 'Не подвержен',
        bgClass: 'bg-slate-100 dark:bg-slate-800',
        textClass: 'text-slate-700 dark:text-slate-300',
        borderClass: 'border-slate-300 dark:border-slate-700',
      };
  }
};

/**
 * Filter recall campaigns by search text, category, status, and severity.
 */
export const filterRecalls = (
  campaigns: RecallCampaign[],
  query: string,
  category: RecallCategory | 'all',
  status: RecallStatus | 'all',
  severity: RecallSeverity | 'all'
): RecallCampaign[] => {
  return campaigns.filter((item) => {
    // Search query matches title, bulletin, or description
    if (query.trim()) {
      const q = query.toLowerCase();
      const matchesTitle =
        item.titleAz.toLowerCase().includes(q) ||
        item.titleEn.toLowerCase().includes(q) ||
        item.titleRu.toLowerCase().includes(q);
      const matchesBulletin =
        item.bulletinCode.toLowerCase().includes(q) ||
        item.campaignId.toLowerCase().includes(q);
      const matchesDescription =
        item.descriptionAz.toLowerCase().includes(q) ||
        item.descriptionEn.toLowerCase().includes(q) ||
        item.descriptionRu.toLowerCase().includes(q);

      if (!matchesTitle && !matchesBulletin && !matchesDescription) {
        return false;
      }
    }

    if (category !== 'all' && item.category !== category) {
      return false;
    }

    if (status !== 'all' && item.status !== status) {
      return false;
    }

    if (severity !== 'all' && item.severity !== severity) {
      return false;
    }

    return true;
  });
};

/**
 * Book a free recall repair appointment at an authorized dealership in Azerbaijan.
 */
export const bookDealerAppointment = (
  request: Omit<RecallAppointmentBooking, 'appointmentId' | 'confirmedAt'>
): RecallAppointmentBooking => {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const appointmentId = `APT-RECALL-${Date.now().toString().slice(-6)}-${randomSuffix}`;

  return {
    ...request,
    appointmentId,
    confirmedAt: new Date().toISOString(),
  };
};

/**
 * Generate an official recall clearance certificate for DMV registration or buyer transfer.
 */
export const generateRecallClearanceCertificate = (
  vehicle: Vehicle,
  report: VehicleRecallReport
): RecallClearanceCertificate => {
  const activeCount = report.activeRecallsCount;
  const isAllClear = activeCount === 0;

  const safetyStatusAz = isAllClear
    ? 'TƏHLÜKƏSİZLİK TƏLƏBLƏRİNƏ TAM CAVAB VERİR (AÇIQ GERİ ÇAĞIRIŞ YOXDUR)'
    : `${activeCount} ƏDƏD İCRA EDİLMƏMİŞ GERİ ÇAĞIRIŞ AŞKARLANDI (DİLER BAXIŞI ZƏRURİDİR)`;

  const safetyStatusEn = isAllClear
    ? 'COMPLIES WITH SAFETY STANDARDS (ZERO OPEN RECALLS)'
    : `${activeCount} OPEN RECALLS DETECTED (DEALER SERVICE REQUIRED)`;

  const safetyStatusRu = isAllClear
    ? 'СООТВЕТСТВУЕТ СТАНДАРТАМ БЕЗОПАСНОСТИ (НЕТ ОТКРЫТЫХ ОТЗЫВОВ)'
    : `ОБНАРУЖЕНО ${activeCount} НЕУСТРАНЕННЫХ ОТЗЫВОВ (ТРЕБУЕТСЯ ДИЛЕРСКИЙ РЕМОНТ)`;

  const verificationCode = `AZ-DYP-RC-${vehicle.vin.slice(0, 5)}-${Math.floor(100000 + Math.random() * 900000)}`;
  const digitalSignature = `ECDSA-SHA256:${typeof btoa !== 'undefined' ? btoa(`${vehicle.vin}-${report.safetyScore}-AUTONEXT`) : 'U0FGRVRZLVZFUklGSUVE'}`;

  const issueDate = '2026-10-13';
  const expiryDate = '2027-10-13';

  return {
    certificateId: `CERT-REC-${vehicle.vin.slice(-6)}-2026`,
    vin: vehicle.vin,
    vehicleTitle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
    vehicleYear: vehicle.year,
    issueDate,
    expiryDate,
    issuerAuthority: 'Azərbaycan Respublikası Baş Dövlət Yol Polisi & Rəsmi Diler Reyestri',
    accreditationStandard: 'ISO/IEC 17020 Automotive Safety Recall Protocol',
    safetyScore: report.safetyScore,
    safetyStatusAz,
    safetyStatusEn,
    safetyStatusRu,
    openCampaignsCount: activeCount,
    completedCampaignsCount: report.completedRecallsCount,
    verificationCode,
    digitalSignature,
  };
};

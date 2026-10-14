import { 
  ParkingZone, 
  TariffCalculationOptions, 
  ParkingTariffResult, 
  ParkingTicketReceipt, 
  ParkingPaymentMethod 
} from '../types/azParking';
import { Currency, Language } from '../types/vehicle';
import { CURRENCY_RATES } from './i18n';

export const ZONE_HOURLY_RATES: Record<ParkingZone, number> = {
  zone1_center: 1.0,
  zone2_inner: 0.7,
  zone3_intermediate: 0.4,
  zone4_outer: 0.2,
};

export const ZONE_LABELS: Record<ParkingZone, Record<Language, string>> = {
  zone1_center: {
    az: 'Mərkəz Zona (Zona 1)',
    en: 'Center Zone (Zone 1)',
    ru: 'Центральная зона (Зона 1)',
  },
  zone2_inner: {
    az: '1-ci Zona (Daxili Şəhər)',
    en: 'Inner Zone (Zone 2)',
    ru: 'Внутренняя зона (Зона 2)',
  },
  zone3_intermediate: {
    az: '2-ci Zona (Aralıq Ərazi)',
    en: 'Intermediate Zone (Zone 3)',
    ru: 'Промежуточная зона (Зона 3)',
  },
  zone4_outer: {
    az: '3-cü Zona (Kənar / Şəhərətrafı)',
    en: 'Outer Zone (Zone 4)',
    ru: 'Внешняя зона (Зона 4)',
  },
};

export const ZONE_COLORS: Record<ParkingZone, { bg: string; text: string; border: string; badge: string }> = {
  zone1_center: {
    bg: 'bg-rose-950/40',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  },
  zone2_inner: {
    bg: 'bg-amber-950/40',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
  zone3_intermediate: {
    bg: 'bg-sky-950/40',
    text: 'text-sky-400',
    border: 'border-sky-500/30',
    badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  },
  zone4_outer: {
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  },
};

/**
 * Calculates official parking tariffs according to AYNA (Azerbaijan Land Transport Agency) rules.
 */
export function calculateParkingTariff(options: TariffCalculationOptions): ParkingTariffResult {
  const {
    zone,
    durationMinutes,
    currency = 'AZN',
    isSunday = false,
    isNightWindow = false,
    isElectricVehicle = false,
    hasResidentPermit = false,
  } = options;

  const hourlyRateAzn = ZONE_HOURLY_RATES[zone] ?? 1.0;
  const isGracePeriodFree = durationMinutes <= 15;
  const chargeableMinutes = isGracePeriodFree ? 0 : durationMinutes;

  // Raw base fee proportional to duration in minutes
  const rawBaseAmountAzn = (chargeableMinutes / 60) * hourlyRateAzn;
  const notes: string[] = [];

  let discountAzn = 0;
  let totalAmountAzn = rawBaseAmountAzn;

  if (isGracePeriodFree) {
    notes.push('İlk 15 dəqiqə qanunvericiliyə uyğun olaraq ödənişsizdir.');
    totalAmountAzn = 0;
  } else if (isSunday) {
    discountAzn = rawBaseAmountAzn;
    totalAmountAzn = 0;
    notes.push('Bazar günləri şəhər üzrə dövlət parklanma yerləri tamamilə pulsuzdur.');
  } else if (isNightWindow) {
    discountAzn = rawBaseAmountAzn;
    totalAmountAzn = 0;
    notes.push('Saat 22:00 - 07:00 aralığında parklanma ödənişsizdir.');
  } else if (isElectricVehicle) {
    discountAzn = rawBaseAmountAzn;
    totalAmountAzn = 0;
    notes.push('Elektromobillər (EV) üçün yaşıl mobillik təşviqi: 100% güzəşt tətbiq edildi.');
  } else if (hasResidentPermit) {
    discountAzn = rawBaseAmountAzn;
    totalAmountAzn = 0;
    notes.push('Fərdi Yaşayış Talonu (Resident Permit): Qeydiyyat ərazisində ödənişsiz parklanma.');
  } else {
    // Normal rate rounded to 2 decimals
    totalAmountAzn = Math.round(rawBaseAmountAzn * 100) / 100;
  }

  // Multi-currency calculation
  let rateMultiplier = 1.0;
  if (currency === 'USD') {
    rateMultiplier = 1 / CURRENCY_RATES.USD;
  } else if (currency === 'EUR') {
    rateMultiplier = 1 / CURRENCY_RATES.EUR;
  }
  const convertedTotal = Math.round(totalAmountAzn * rateMultiplier * 100) / 100;

  // 18% VAT component (statutory breakdown)
  const vatAmountAzn = Math.round((totalAmountAzn * (18 / 118)) * 100) / 100;

  return {
    hourlyRateAzn,
    durationMinutes,
    chargeableMinutes,
    isGracePeriodFree,
    isSundayFree: isSunday,
    isNightFree: isNightWindow,
    isEvExempt: isElectricVehicle,
    isResidentExempt: hasResidentPermit,
    discountAzn: Math.round(discountAzn * 100) / 100,
    totalAmountAzn,
    convertedTotal,
    currency,
    vatAmountAzn,
    notes,
  };
}

/**
 * Generates the official AzParking SMS command formatted for shortcode 1181.
 * Standard format: "<PLATE> <ZONE_CODE> <HOURS>"
 * Example: "99-AA-999 1001 2"
 */
export function generateSmsParkingCommand(plateNumber: string, zoneCode: string, durationHours: number): string {
  const cleanPlate = plateNumber.trim().toUpperCase().replace(/\s+/g, '');
  const cleanZone = zoneCode.trim();
  const safeHours = Math.max(1, Math.min(24, Math.round(durationHours)));
  return `${cleanPlate} ${cleanZone} ${safeHours}`;
}

/**
 * Calculates current occupancy percentage.
 */
export function calculateOccupancyPercentage(occupied: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((occupied / total) * 100)));
}

/**
 * Returns color and status badge for parking capacity.
 */
export function getOccupancyStatus(occupancyPercentage: number): { label: string; color: string; badgeClass: string } {
  if (occupancyPercentage >= 90) {
    return {
      label: 'Demək olar doludur',
      color: 'text-rose-400',
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    };
  }
  if (occupancyPercentage >= 65) {
    return {
      label: 'Məhdud yerlər',
      color: 'text-amber-400',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    };
  }
  return {
    label: 'Boş yerlər çoxdur',
    color: 'text-emerald-400',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  };
}

/**
 * Checks resident parking permit (Fərdi Parklanma Talonu) eligibility based on registration.
 */
export function checkResidentPermitEligibility(
  address: string,
  plateNumber: string
): { eligible: boolean; radiusMeters: number; reasonAz: string; reasonEn: string } {
  const normalizedAddr = address.trim().toLowerCase();
  const normalizedPlate = plateNumber.trim().toUpperCase();

  if (!normalizedAddr || normalizedAddr.length < 5) {
    return {
      eligible: false,
      radiusMeters: 0,
      reasonAz: 'Ünvan məlumatı natamamdır. Zəhmət olmasa dəqiq küçə və bina nömrəsini qeyd edin.',
      reasonEn: 'Incomplete address information. Please provide street and building number.',
    };
  }

  if (!normalizedPlate || normalizedPlate.length < 5) {
    return {
      eligible: false,
      radiusMeters: 0,
      reasonAz: 'Dövlət qeydiyyat nişanı (nömrə) düzgün daxil edilməyib.',
      reasonEn: 'Vehicle license plate is invalid or missing.',
    };
  }

  return {
    eligible: true,
    radiusMeters: 100,
    reasonAz: 'Ünvan qeydiyyatı təsdiqləndi. Yaşayış yerinizdən 100 metr radiusda pulsuz parklanma hüququnuz var.',
    reasonEn: 'Residential registration confirmed. You are entitled to free parking within a 100m radius of your residence.',
  };
}

/**
 * Generates an official AzParking digital e-ticket receipt.
 */
export function generateParkingTicketReceipt(params: {
  lotName: string;
  zoneCode: string;
  street: string;
  plateNumber: string;
  durationMinutes: number;
  amountAzn: number;
  currency: Currency;
  paymentMethod: ParkingPaymentMethod;
  vehicleType?: string;
  checkInDate?: Date;
}): ParkingTicketReceipt {
  const {
    lotName,
    zoneCode,
    street,
    plateNumber,
    durationMinutes,
    amountAzn,
    currency,
    paymentMethod,
    vehicleType = 'Minik avtomobili',
    checkInDate = new Date(),
  } = params;

  const expiryDate = new Date(checkInDate.getTime() + durationMinutes * 60 * 1000);
  const cleanPlate = plateNumber.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
  const ticketId = `AZPARK-2026-${cleanPlate}-${randomSuffix}`;
  const verificationCode = `V-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const barcode = `||| | |||| | ||||| ${ticketId} |||| | |||`;

  let rateMultiplier = 1.0;
  if (currency === 'USD') rateMultiplier = 1 / CURRENCY_RATES.USD;
  else if (currency === 'EUR') rateMultiplier = 1 / CURRENCY_RATES.EUR;
  const amountPaidConverted = Math.round(amountAzn * rateMultiplier * 100) / 100;

  return {
    ticketId,
    barcode,
    zoneName: lotName,
    zoneCode,
    street,
    plateNumber: plateNumber.trim().toUpperCase(),
    checkInTime: checkInDate.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    expiryTime: expiryDate.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    durationMinutes,
    amountPaidAzn: amountAzn,
    currency,
    amountPaidConverted,
    paymentMethod,
    verificationCode,
    vehicleType,
  };
}

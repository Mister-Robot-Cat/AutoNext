import { Currency, Language, Vehicle } from '../types/vehicle';
import { 
  TollVehicleCategory, 
  TollPaymentMethod, 
  TollPlaza, 
  TollRouteCalculation, 
  TransponderAccount, 
  TollTransitReceipt 
} from '../types/tollRoad';
import { CURRENCY_RATES } from './i18n';

/**
 * Official Azerbaijan State Statutory Toll Tariffs per kilometer in AZN
 * Approved by the Cabinet of Ministers & Tarif Şurası for M-1 Expressway
 */
export const STATUTORY_TOLL_RATES: Record<TollVehicleCategory, number> = {
  passenger_light: 0.07,   // Minik avtomobilləri və kütləsi 3.5 tona qədər olan yük maşınları
  medium_truck_bus: 0.15,  // 3.5 tondan artıq yük avtomobilləri və 30 yerə qədər olan avtobuslar
  heavy_tir_coach: 0.25,   // Çoxoxlu qoşqulu TIR-lar və 30 yerdən artıq sərnişin avtobusları
};

/**
 * Discount percentages depending on payment medium
 */
export const PAYMENT_METHOD_DISCOUNTS: Record<TollPaymentMethod, number> = {
  transponder_rfid: 10,  // 10% RFID FastPass cashback / rebate
  qr_epass: 5,           // 5% Mobile QR / E-Pass rebate
  cash_card: 0,          // 0% Standard manual lane tariff
};

/**
 * Categorize vehicle into statutory toll category
 */
export function detectVehicleCategory(vehicle?: Vehicle | null): TollVehicleCategory {
  if (!vehicle) return 'passenger_light';

  const body = vehicle.bodyType?.toLowerCase() || '';
  if (body.includes('bus') || body.includes('heavy') || body.includes('truck') || body.includes('minivan')) {
    return 'medium_truck_bus';
  }
  return 'passenger_light';
}

/**
 * Calculate comprehensive toll fare, time savings, and environmental benefits
 */
export function calculateTollFare(
  entryPlaza: TollPlaza,
  exitPlaza: TollPlaza,
  category: TollVehicleCategory = 'passenger_light',
  paymentMethod: TollPaymentMethod = 'transponder_rfid',
  currency: Currency = 'AZN'
): TollRouteCalculation {
  const distanceKm = Math.abs(exitPlaza.kmMarker - entryPlaza.kmMarker);
  const baseRatePerKmAzn = STATUTORY_TOLL_RATES[category] ?? 0.07;
  const grossFareAzn = Number((distanceKm * baseRatePerKmAzn).toFixed(2));

  const discountPercentage = PAYMENT_METHOD_DISCOUNTS[paymentMethod] ?? 0;
  const discountAmountAzn = Number(((grossFareAzn * discountPercentage) / 100).toFixed(2));
  const netFareAzn = Number(Math.max(0, grossFareAzn - discountAmountAzn).toFixed(2));

  const rate = CURRENCY_RATES[currency] || 1;
  const netFareTargetCurrency = currency === 'AZN' 
    ? netFareAzn 
    : Number((netFareAzn / rate).toFixed(2));

  // Time calculations:
  // Tollway: avg speed 130 km/h (120 km/h effective)
  const estimatedDurationMinutes = distanceKm > 0 
    ? Math.max(1, Math.round((distanceKm / 120) * 60)) 
    : 0;

  // Free alternative (R-1 through towns, traffic lights, speed bumps): avg 60 km/h
  const oldRouteDurationMinutes = distanceKm > 0 
    ? Math.max(1, Math.round((distanceKm / 60) * 60)) 
    : 0;

  const timeSavedMinutes = Math.max(0, oldRouteDurationMinutes - estimatedDurationMinutes);

  // Highway driving smoothness: steady 110-120 km/h vs frequent stop-and-go saves ~1.4L / 100km
  const fuelSavedLiters = Number(((distanceKm / 100) * 1.4).toFixed(1));
  const co2SavedKg = Number((fuelSavedLiters * 2.31).toFixed(1));

  return {
    entryPlaza,
    exitPlaza,
    distanceKm,
    category,
    paymentMethod,
    baseRatePerKmAzn,
    grossFareAzn,
    discountPercentage,
    discountAmountAzn,
    netFareAzn,
    netFareTargetCurrency,
    estimatedDurationMinutes,
    oldRouteDurationMinutes,
    timeSavedMinutes,
    fuelSavedLiters,
    co2SavedKg,
    currency,
  };
}

/**
 * Top up RFID Transponder balance
 */
export function simulateTransponderTopUp(
  account: TransponderAccount,
  amountAzn: number
): TransponderAccount {
  const validAmount = Math.max(0, amountAzn);
  const newBalance = Number((account.balanceAzn + validAmount).toFixed(2));
  return {
    ...account,
    balanceAzn: newBalance,
    status: newBalance >= 5 ? 'active' : 'low_balance',
  };
}

/**
 * Simulate toll gate passage with automated boom barrier
 */
export function simulateGatePassage(
  account: TransponderAccount,
  fareAzn: number
): {
  success: boolean;
  updatedAccount: TransponderAccount;
  message: string;
} {
  if (account.status === 'suspended') {
    return {
      success: false,
      updatedAccount: account,
      message: 'Transponder bloka alınıb! AAYDA 114 ilə əlaqə saxlayın.',
    };
  }

  if (account.balanceAzn < fareAzn) {
    return {
      success: false,
      updatedAccount: account,
      message: `Balansda kifayət qədər vəsait yoxdur! Tələb olunan: ${fareAzn.toFixed(2)} AZN, Cari balans: ${account.balanceAzn.toFixed(2)} AZN`,
    };
  }

  const newBalance = Number((account.balanceAzn - fareAzn).toFixed(2));
  const updatedAccount: TransponderAccount = {
    ...account,
    balanceAzn: newBalance,
    status: newBalance < 5 ? 'low_balance' : 'active',
    lastPassageDate: new Date().toISOString(),
  };

  return {
    success: true,
    updatedAccount,
    message: `Keçid uğurla təsdiqləndi! Turniket açıldı (Yaşıl işıq). Qalıq balans: ${newBalance.toFixed(2)} AZN`,
  };
}

/**
 * Generate official electronic toll transit receipt
 */
export function generateTollReceipt(
  calc: TollRouteCalculation,
  vehiclePlate: string,
  transponderId?: string
): TollTransitReceipt {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const receiptNumber = `AAYDA-M1-2026-${randomSuffix}`;
  const now = new Date();
  const entryDate = new Date(now.getTime() - calc.estimatedDurationMinutes * 60 * 1000);

  return {
    receiptNumber,
    barcode: `*${receiptNumber}*`,
    securityHash: `AAYDA-SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    entryPlazaName: calc.entryPlaza.name,
    exitPlazaName: calc.exitPlaza.name,
    distanceKm: calc.distanceKm,
    vehiclePlate: vehiclePlate || '99-XX-000',
    vehicleCategory: calc.category,
    paymentMethod: calc.paymentMethod,
    grossFareAzn: calc.grossFareAzn,
    discountAzn: calc.discountAmountAzn,
    netFareAzn: calc.netFareAzn,
    netFareTargetCurrency: calc.netFareTargetCurrency,
    entryTimestamp: entryDate.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' }),
    exitTimestamp: now.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' }),
    transponderId,
    currency: calc.currency,
    operatorName: 'AAYDA "Avtomobil Yollarının Mühafizəsi Xidməti" MMC',
  };
}

/**
 * Localized vehicle category display names
 */
export function getVehicleCategoryDisplayName(category: TollVehicleCategory, lang: Language): string {
  const names: Record<TollVehicleCategory, Record<Language, string>> = {
    passenger_light: {
      az: '1-ci Kateqoriya: Minik və yüngül kommersiya (< 3.5t)',
      en: 'Category 1: Passenger cars & light commercial (< 3.5t)',
      ru: 'Категория 1: Легковые и легкие коммерческие (< 3.5т)',
    },
    medium_truck_bus: {
      az: '2-ci Kateqoriya: Orta tonnajlı yük və avtobuslar (≤ 30 yer)',
      en: 'Category 2: Medium trucks & buses (≤ 30 seats)',
      ru: 'Категория 2: Средние грузовики и автобусы (≤ 30 мест)',
    },
    heavy_tir_coach: {
      az: '3-cü Kateqoriya: Çoxoxlu TIR-lar və böyük avtobuslar (> 30 yer)',
      en: 'Category 3: Multi-axle TIR trucks & coaches (> 30 seats)',
      ru: 'Категория 3: Многоосные фуры TIR и большие автобусы (> 30 мест)',
    },
  };
  return names[category]?.[lang] ?? names[category].az;
}

/**
 * Localized payment method display names
 */
export function getPaymentMethodDisplayName(method: TollPaymentMethod, lang: Language): string {
  const names: Record<TollPaymentMethod, Record<Language, string>> = {
    transponder_rfid: {
      az: 'RFID E-Toll FastPass (10% Endirim)',
      en: 'RFID E-Toll FastPass (10% Discount)',
      ru: 'RFID E-Toll FastPass (10% Скидка)',
    },
    qr_epass: {
      az: 'Mobil QR E-Pass (5% Endirim)',
      en: 'Mobile QR E-Pass (5% Discount)',
      ru: 'Мобильный QR E-Pass (5% Скидка)',
    },
    cash_card: {
      az: 'Məntəqədə Nağd / Bank Kartı (Standart)',
      en: 'Cash / Bank Card at Toll Booth (Standard)',
      ru: 'Наличные / Банковская карта в кассе (Стандарт)',
    },
  };
  return names[method]?.[lang] ?? names[method].az;
}

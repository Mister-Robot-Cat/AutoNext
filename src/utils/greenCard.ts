import { Currency, Language } from '../types/vehicle';
import {
  GreenCardZoneId,
  GreenCardVehicleCategory,
  GreenCardDuration,
  GreenCardCalculationResult,
  BorderTransitDeclaration,
  GreenCardPolicyRecord,
} from '../types/greenCard';
import { GREEN_CARD_ZONES_CONFIG, CROSS_BORDER_CHECKLIST } from '../data/mockGreenCardData';

export const CURRENCY_RATES = {
  AZN: 1.0,
  USD: 1.70, // 1 USD = 1.70 AZN
  EUR: 1.85, // 1 EUR = 1.85 AZN
};

export const GREEN_CARD_STATUTORY_TARIFFS: Record<
  GreenCardVehicleCategory,
  Record<GreenCardZoneId, Record<GreenCardDuration, number>>
> = {
  passenger: {
    zone_1_all: {
      '15_days': 60,
      '1_month': 110,
      '3_months': 260,
      '6_months': 430,
      '1_year': 700,
    },
    zone_2_regional: {
      '15_days': 35,
      '1_month': 60,
      '3_months': 140,
      '6_months': 230,
      '1_year': 380,
    },
    zone_3_georgia_turkey: {
      '15_days': 25,
      '1_month': 45,
      '3_months': 100,
      '6_months': 170,
      '1_year': 280,
    },
  },
  motorcycle: {
    zone_1_all: {
      '15_days': 30,
      '1_month': 55,
      '3_months': 130,
      '6_months': 215,
      '1_year': 350,
    },
    zone_2_regional: {
      '15_days': 18,
      '1_month': 30,
      '3_months': 70,
      '6_months': 115,
      '1_year': 190,
    },
    zone_3_georgia_turkey: {
      '15_days': 13,
      '1_month': 23,
      '3_months': 50,
      '6_months': 85,
      '1_year': 140,
    },
  },
  minibus: {
    zone_1_all: {
      '15_days': 90,
      '1_month': 165,
      '3_months': 390,
      '6_months': 645,
      '1_year': 1050,
    },
    zone_2_regional: {
      '15_days': 55,
      '1_month': 90,
      '3_months': 210,
      '6_months': 345,
      '1_year': 570,
    },
    zone_3_georgia_turkey: {
      '15_days': 40,
      '1_month': 70,
      '3_months': 160,
      '6_months': 265,
      '1_year': 430,
    },
  },
  truck: {
    zone_1_all: {
      '15_days': 120,
      '1_month': 220,
      '3_months': 520,
      '6_months': 860,
      '1_year': 1400,
    },
    zone_2_regional: {
      '15_days': 70,
      '1_month': 120,
      '3_months': 280,
      '6_months': 460,
      '1_year': 760,
    },
    zone_3_georgia_turkey: {
      '15_days': 50,
      '1_month': 90,
      '3_months': 200,
      '6_months': 340,
      '1_year': 560,
    },
  },
  trailer: {
    zone_1_all: {
      '15_days': 20,
      '1_month': 35,
      '3_months': 80,
      '6_months': 130,
      '1_year': 210,
    },
    zone_2_regional: {
      '15_days': 12,
      '1_month': 20,
      '3_months': 45,
      '6_months': 75,
      '1_year': 120,
    },
    zone_3_georgia_turkey: {
      '15_days': 8,
      '1_month': 15,
      '3_months': 32,
      '6_months': 55,
      '1_year': 90,
    },
  },
};

export const DURATION_DAYS_MAP: Record<GreenCardDuration, number> = {
  '15_days': 15,
  '1_month': 30,
  '3_months': 90,
  '6_months': 180,
  '1_year': 365,
};

export function getDurationDays(duration: GreenCardDuration): number {
  return DURATION_DAYS_MAP[duration] || 30;
}

export function formatGreenCardAmount(amountAzn: number, currency: Currency): string {
  if (currency === 'AZN') {
    return `${Math.round(amountAzn)} ₼`;
  } else if (currency === 'USD') {
    const usd = amountAzn / CURRENCY_RATES.USD;
    return `$${Math.round(usd)}`;
  } else {
    const eur = amountAzn / CURRENCY_RATES.EUR;
    return `€${Math.round(eur)}`;
  }
}

export function calculateExpiryDate(startDateStr: string, duration: GreenCardDuration): string {
  const start = new Date(startDateStr);
  if (isNaN(start.getTime())) {
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + getDurationDays(duration));
    return fallback.toISOString().split('T')[0];
  }
  const expiry = new Date(start);
  expiry.setDate(expiry.getDate() + getDurationDays(duration));
  return expiry.toISOString().split('T')[0];
}

export function getCategoryTitle(category: GreenCardVehicleCategory, lang: Language): string {
  const titles: Record<GreenCardVehicleCategory, { az: string; en: string; ru: string }> = {
    passenger: {
      az: 'Minik avtomobili (≤ 9 yer)',
      en: 'Passenger Car (≤ 9 seats)',
      ru: 'Легковой автомобиль (≤ 9 мест)',
    },
    motorcycle: {
      az: 'Motosiklet / Kvadrosikl',
      en: 'Motorcycle / Quad bike',
      ru: 'Мотоцикл / Квадроцикл',
    },
    minibus: {
      az: 'Mikroavtobus (10 - 18 yer)',
      en: 'Minibus (10 - 18 seats)',
      ru: 'Микроавтобус (10 - 18 мест)',
    },
    truck: {
      az: 'Yük avtomobili / Çəkici',
      en: 'Cargo Truck / Tractor unit',
      ru: 'Грузовой автомобиль / Тягач',
    },
    trailer: {
      az: 'Qoşqu / Yaşayış karavanı',
      en: 'Trailer / Camper caravan',
      ru: 'Прицеп / Жилой караван',
    },
  };
  return titles[category]?.[lang] || titles[category]?.az || 'Minik avtomobili';
}

export function getZoneTitle(zone: GreenCardZoneId, lang: Language): string {
  const config = GREEN_CARD_ZONES_CONFIG[zone];
  return config?.name[lang] || config?.name.az || 'Yaşıl Kart Zonası';
}

export function getDurationTitle(duration: GreenCardDuration, lang: Language): string {
  const titles: Record<GreenCardDuration, { az: string; en: string; ru: string }> = {
    '15_days': { az: '15 gün', en: '15 days', ru: '15 дней' },
    '1_month': { az: '1 ay', en: '1 month', ru: '1 месяц' },
    '3_months': { az: '3 ay', en: '3 months', ru: '3 месяца' },
    '6_months': { az: '6 ay', en: '6 months', ru: '6 месяцев' },
    '1_year': { az: '1 il (12 ay)', en: '1 year (12 months)', ru: '1 год (12 месяцев)' },
  };
  return titles[duration]?.[lang] || titles[duration]?.az || '1 ay';
}

export function calculateGreenCardTariff(
  category: GreenCardVehicleCategory,
  zone: GreenCardZoneId,
  duration: GreenCardDuration,
  currency: Currency = 'AZN',
  startDate: string = new Date().toISOString().split('T')[0]
): GreenCardCalculationResult {
  const categoryRates = GREEN_CARD_STATUTORY_TARIFFS[category] || GREEN_CARD_STATUTORY_TARIFFS.passenger;
  const zoneRates = categoryRates[zone] || categoryRates.zone_3_georgia_turkey;
  const basePriceAzn = zoneRates[duration] || 45;
  const isbCompulsoryLevyAzn = 0; // Statutory bureau duty is already bundled into official fixed tariffs
  const totalCostAzn = basePriceAzn + isbCompulsoryLevyAzn;

  const durationDays = getDurationDays(duration);
  const validUntil = calculateExpiryDate(startDate, duration);
  const zoneConfig = GREEN_CARD_ZONES_CONFIG[zone];
  const coverageCountriesCount = zoneConfig ? zoneConfig.totalCountries : 47;

  let convertedAmount = totalCostAzn;
  if (currency === 'USD') {
    convertedAmount = totalCostAzn / CURRENCY_RATES.USD;
  } else if (currency === 'EUR') {
    convertedAmount = totalCostAzn / CURRENCY_RATES.EUR;
  }

  return {
    category,
    zone,
    duration,
    durationDays,
    basePriceAzn,
    isbCompulsoryLevyAzn,
    totalCostAzn,
    convertedCost: {
      amount: Math.round(convertedAmount * 100) / 100,
      currency,
    },
    validFrom: startDate,
    validUntil,
    coverageCountriesCount,
    zoneTitle: zoneConfig ? zoneConfig.name.az : 'Yaşıl Kart Zonası',
    categoryTitle: getCategoryTitle(category, 'az'),
    durationTitle: getDurationTitle(duration, 'az'),
  };
}

export function calculateBorderReadiness(completedItemIds: string[]): {
  completedCount: number;
  totalRequired: number;
  readinessPercentage: number;
  isReadyToCross: boolean;
  missingMandatoryLabels: string[];
} {
  const mandatoryItems = CROSS_BORDER_CHECKLIST.filter((item) => item.mandatory);
  const totalRequired = mandatoryItems.length;

  const missingMandatory = mandatoryItems.filter(
    (item) => !completedItemIds.includes(item.id)
  );

  const completedCount = completedItemIds.length;
  const totalItems = CROSS_BORDER_CHECKLIST.length;
  const readinessPercentage = Math.round((completedCount / totalItems) * 100);

  const isReadyToCross = missingMandatory.length === 0;

  return {
    completedCount,
    totalRequired,
    readinessPercentage,
    isReadyToCross,
    missingMandatoryLabels: missingMandatory.map((m) => m.label.az),
  };
}

export function calculateTransitFuelEstimates(
  distanceKm: number,
  fuelConsumptionLPer100Km: number = 7.5,
  fuelPriceAznPerLiter: number = 1.10 // Default Aİ-92: 1.10 AZN
): {
  requiredFuelLiters: number;
  totalFuelCostAzn: number;
  estimatedCo2Kg: number;
} {
  const safeConsumption = Math.max(fuelConsumptionLPer100Km, 1.0);
  const requiredFuelLiters = Math.round((distanceKm * safeConsumption) / 100 * 10) / 10;
  const totalFuelCostAzn = Math.round(requiredFuelLiters * fuelPriceAznPerLiter * 100) / 100;
  // Average ~2.31 kg CO2 per liter of gasoline
  const estimatedCo2Kg = Math.round(requiredFuelLiters * 2.31 * 10) / 10;

  return {
    requiredFuelLiters,
    totalFuelCostAzn,
    estimatedCo2Kg,
  };
}

export function generateGreenCardPolicyRecord(params: {
  insurerId: string;
  insurerName: string;
  zoneId: GreenCardZoneId;
  category: GreenCardVehicleCategory;
  duration: GreenCardDuration;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  driverFullName: string;
  driverFin: string;
  passportNumber: string;
  startDate?: string;
}): GreenCardPolicyRecord {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const policyNumber = `AZ/ISB-GC-2026-${randomSuffix}`;
  const barcode = `47600${randomSuffix}20261015`;
  const securityHash = Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
  const issueDate = new Date().toISOString().split('T')[0];
  const validFrom = params.startDate || issueDate;
  const validUntil = calculateExpiryDate(validFrom, params.duration);

  const tariff = calculateGreenCardTariff(
    params.category,
    params.zoneId,
    params.duration,
    'AZN',
    validFrom
  );

  return {
    policyNumber,
    barcode,
    securityHash,
    issueDate,
    validFrom,
    validUntil,
    insurerId: params.insurerId,
    insurerName: params.insurerName,
    zoneId: params.zoneId,
    category: params.category,
    duration: params.duration,
    plateNumber: params.plateNumber.toUpperCase(),
    make: params.make,
    model: params.model,
    year: params.year,
    vin: params.vin.toUpperCase(),
    driverFullName: params.driverFullName,
    driverFin: params.driverFin.toUpperCase(),
    passportNumber: params.passportNumber.toUpperCase(),
    totalCostAzn: tariff.totalCostAzn,
    isbBureauId: `ISB-AZ-2026-${randomSuffix.toString().slice(0, 3)}`,
    status: 'active',
  };
}

export function generateBorderTransitDeclaration(params: {
  customsCheckpointId: string;
  customsCheckpointName: string;
  destinationCountry: string;
  purposeOfVisit: 'tourism' | 'business' | 'transit' | 'freight';
  driverFullName: string;
  driverFin: string;
  passportNumber: string;
  plateNumber: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  estimatedReturnDays?: number;
  commercialCargo?: boolean;
  fuelInTankLiters?: number;
}): BorderTransitDeclaration {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const declarationNumber = `DGK-TR-2026-${randomSuffix}`;
  const submissionDate = new Date().toISOString().split('T')[0];

  const returnDate = new Date();
  returnDate.setDate(returnDate.getDate() + (params.estimatedReturnDays || 14));
  const estimatedReturnDate = returnDate.toISOString().split('T')[0];

  const dgkSecurityCode = `DGK-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${randomSuffix}`;

  return {
    declarationNumber,
    submissionDate,
    customsCheckpointId: params.customsCheckpointId,
    customsCheckpointName: params.customsCheckpointName,
    destinationCountry: params.destinationCountry,
    purposeOfVisit: params.purposeOfVisit,
    driverFullName: params.driverFullName,
    driverFin: params.driverFin.toUpperCase(),
    passportNumber: params.passportNumber.toUpperCase(),
    plateNumber: params.plateNumber.toUpperCase(),
    vin: params.vin.toUpperCase(),
    make: params.make,
    model: params.model,
    year: params.year,
    estimatedReturnDate,
    commercialCargo: !!params.commercialCargo,
    fuelInTankLiters: params.fuelInTankLiters || 45,
    dgkSecurityCode,
  };
}

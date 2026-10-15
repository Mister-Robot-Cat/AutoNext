import { Currency } from '../types/vehicle';
import {
  TaxiEligibilityStatus,
  TaxiColor,
  TaxiFuelType,
  TaxiEquipmentKey,
  TaxiEquipmentItem,
  TaxiComplianceAudit,
  RideHailingPlatformKey,
  RideHailingPlatform,
  AggregatorShiftConfig,
  AggregatorProfitResult,
  AynaTaxiPass,
  TrainingBooking
} from '../types/taxi';

export const CURRENT_REFERENCE_YEAR = 2026;
export const MAX_NEW_TAXI_AGE_YEARS = 8;
export const MAX_GRANDFATHERED_TAXI_AGE_YEARS = 15;

export const EXCHANGE_RATES: Record<Currency, number> = {
  AZN: 1,
  USD: 0.5882,
  EUR: 0.5435
};

export function convertFromAzn(amountAzn: number, currency: Currency): number {
  const rate = EXCHANGE_RATES[currency] || 1;
  return Number((amountAzn * rate).toFixed(2));
}

export const STATUTORY_FEES = {
  carrierLicense7YearsAzn: 125,
  vehiclePass1YearAzn: 25,
  vehiclePass3YearsAzn: 65,
  technicalInspectionStampAzn: 10,
  driverTrainingCourseAzn: 40
};

export const RETROFIT_COSTS: Record<TaxiEquipmentKey, number> = {
  air_conditioning: 350,
  abs: 500,
  airbags: 400,
  dual_dashcam: 180,
  pos_terminal: 120,
  taxi_roof_lamp: 45,
  checker_decals: 35
};

export const COLOR_WRAPPING_COST_AZN = 650;

export const FUEL_RATES_PER_KM: Record<TaxiFuelType, { costPerKmAzn: number; lPer100km: number; fuelNameAz: string }> = {
  petrol: { costPerKmAzn: 0.1045, lPer100km: 9.5, fuelNameAz: 'Aİ-92 Benzin (1.10 ₼/L)' },
  diesel: { costPerKmAzn: 0.065, lPer100km: 6.5, fuelNameAz: 'Dizel (1.00 ₼/L)' },
  lpg: { costPerKmAzn: 0.0715, lPer100km: 11.0, fuelNameAz: 'Qaz / LPG (0.65 ₼/L)' },
  hybrid: { costPerKmAzn: 0.0528, lPer100km: 4.8, fuelNameAz: 'Hibrid Benzin/Elektrik' },
  ev: { costPerKmAzn: 0.0255, lPer100km: 17.0, fuelNameAz: '100% Elektromobil (TokBaku)' }
};

export const RIDE_HAILING_PLATFORMS: Record<RideHailingPlatformKey, RideHailingPlatform> = {
  bolt: {
    id: 'bolt',
    name: 'Bolt Azerbaijan',
    commissionRate: 0.19,
    minDriverRating: 4.7,
    supportPhone: '*1919',
    accentColor: '#34d399',
    description: {
      az: 'Bakıda ən böyük sifariş axını, bonus mexanizmləri və həftəlik ödənişlər.',
      en: 'Largest order volume in Baku, surge pricing bonuses, and weekly payouts.',
      ru: 'Крупнейший поток заказов в Баку, бонусная сетка и еженедельные выплаты.'
    }
  },
  yango: {
    id: 'yango',
    name: 'Yango (Yandex Go)',
    commissionRate: 0.15,
    minDriverRating: 4.65,
    supportPhone: '*1020',
    accentColor: '#f87171',
    description: {
      az: 'Aşağı 15% komissiya, zəmanətli gəlir və naviqator inteqrasiyası.',
      en: 'Low 15% commission, guaranteed minimum shift bonuses, and native navigation.',
      ru: 'Низкая комиссия 15%, гарантированный доход и встроенная навигация.'
    }
  },
  uber: {
    id: 'uber',
    name: 'Uber Azerbaijan',
    commissionRate: 0.17,
    minDriverRating: 4.75,
    supportPhone: '*8237',
    accentColor: '#60a5fa',
    description: {
      az: 'Korporativ və hava limanı sifarişləri, xarici qonaqlar və Comfort/Black kateqoriyaları.',
      en: 'Corporate and airport transfers, international travelers, Comfort/Black tiers.',
      ru: 'Корпоративные и трансферные заказы, иностранные гости, категории Comfort/Black.'
    }
  },
  '189': {
    id: '189',
    name: '189 Taxi Service',
    commissionRate: 0.12,
    minDriverRating: 4.6,
    supportPhone: '189',
    accentColor: '#fbbf24',
    description: {
      az: 'Klassik dispetçer şəbəkəsi, daimi müştəri bazası və cəmi 12% komissiya.',
      en: 'Classic dispatch telephone network, loyal customer base, and only 12% commission.',
      ru: 'Классическая диспетчерская служба, база постоянных клиентов и всего 12% комиссии.'
    }
  },
  independent: {
    id: 'independent',
    name: 'Sərbəst / Fərdi Taksi',
    commissionRate: 0.0,
    minDriverRating: 0,
    supportPhone: 'AYNA 141',
    accentColor: '#a78bfa',
    description: {
      az: 'Aqreqatorsuz birbaşa fəaliyyət, 0% platforma komissiyası, nağd və fərdi POS ödənişlər.',
      en: 'Direct standalone operation, 0% aggregator fee, cash and private POS payments.',
      ru: 'Самостоятельная работа без агрегаторов, 0% комиссии, оплата наличными и через POS.'
    }
  }
};

export const DEFAULT_EQUIPMENT_CATALOG: TaxiEquipmentItem[] = [
  {
    key: 'air_conditioning',
    label: {
      az: 'İşlək Kondisioner Sistemi',
      en: 'Functional Air Conditioning',
      ru: 'Исправная система кондиционирования'
    },
    description: {
      az: 'Mövsümə uyğun salon temperaturunun təmin edilməsi (Nazirlər Kabineti Qərar №94).',
      en: 'Climate control system maintaining comfortable cabin temperature.',
      ru: 'Система климат-контроля для поддержания нормативной температуры в салоне.'
    },
    isMandatory: true,
    isInstalled: true,
    retrofitCostAzn: RETROFIT_COSTS.air_conditioning
  },
  {
    key: 'abs',
    label: {
      az: 'ABS Əyləc Sistemi',
      en: 'Anti-lock Braking System (ABS)',
      ru: 'Антиблокировочная тормозная система (ABS)'
    },
    description: {
      az: 'Fövqəladə əyləc zamanı təkərlərin bloklanmasının qarşısını alan aktiv sistem.',
      en: 'Active safety system preventing wheel lockup during emergency braking.',
      ru: 'Активная система безопасности для предотвращения блокировки колес.'
    },
    isMandatory: true,
    isInstalled: true,
    retrofitCostAzn: RETROFIT_COSTS.abs
  },
  {
    key: 'airbags',
    label: {
      az: 'Sürücü və Ön Sərnişin Airbag',
      en: 'Driver & Front Passenger Airbags',
      ru: 'Подушки безопасности водителя и пассажира'
    },
    description: {
      az: 'Sərnişindaşımada minimum 2 ədəd ön təhlükəsizlik yastığının mövcudluğu.',
      en: 'Minimum 2 front airbags mandatory for passenger transport operations.',
      ru: 'Минимум 2 фронтальные подушки безопасности обязательны для таксомоторов.'
    },
    isMandatory: true,
    isInstalled: true,
    retrofitCostAzn: RETROFIT_COSTS.airbags
  },
  {
    key: 'dual_dashcam',
    label: {
      az: 'Daxili və Xarici Videoqeydiyyatçı',
      en: 'Dual-Lens Dashcam (Cabin + Road)',
      ru: 'Двухканальный видеорегистратор (Салон + Дорога)'
    },
    description: {
      az: 'Salon və yol hərəkətini qeydə alan, minimum 14 gün yaddaş tutumlu kamera.',
      en: 'Surveillance recording interior and exterior with min 14-day local storage.',
      ru: 'Камера фиксации салона и дороги с объемом памяти минимум на 14 дней.'
    },
    isMandatory: true,
    isInstalled: false,
    retrofitCostAzn: RETROFIT_COSTS.dual_dashcam
  },
  {
    key: 'pos_terminal',
    label: {
      az: 'Nağdsız Ödəniş / POS Terminal',
      en: 'Cashless Payment / POS Terminal',
      ru: 'Безналичная оплата / POS-терминал'
    },
    description: {
      az: 'Bank kartı, NFC və ya inteqrasiya edilmiş QR ilə nağdsız ödəniş qəbulu.',
      en: 'Acceptance of contactless card, NFC, or integrated QR cashless payments.',
      ru: 'Прием оплаты банковскими картами, NFC или интегрированным QR-кодом.'
    },
    isMandatory: true,
    isInstalled: false,
    retrofitCostAzn: RETROFIT_COSTS.pos_terminal
  },
  {
    key: 'taxi_roof_lamp',
    label: {
      az: 'Sarı Rəngli Dam Fənəri (TAXI)',
      en: 'Yellow Illuminated Roof Sign (TAXI)',
      ru: 'Желтый световой опознавательный знак (TAXI)'
    },
    description: {
      az: 'Avtomobilin damında yerləşdirilən xüsusi sarı rəngli fənər.',
      en: 'Yellow lighted rooftop TAXI beacon visible from 100 meters.',
      ru: 'Специальный желтый световой плафон TAXI на крыше автомобиля.'
    },
    isMandatory: true,
    isInstalled: false,
    retrofitCostAzn: RETROFIT_COSTS.taxi_roof_lamp
  },
  {
    key: 'checker_decals',
    label: {
      az: 'Yan Şahmat Kompozisiyası',
      en: 'Chequered Side Decals',
      ru: 'Боковые шашечные композиции'
    },
    description: {
      az: 'Sağ və sol qapıların yan xətti boyunca eni 15-20 sm şahmat damaları.',
      en: 'Official chequered magnetic or adhesive safety stripes along doors.',
      ru: 'Шашечные полосы шириной 15-20 см вдоль боковых поверхностей дверей.'
    },
    isMandatory: true,
    isInstalled: false,
    retrofitCostAzn: RETROFIT_COSTS.checker_decals
  }
];

export function evaluateTaxiCompliance(params: {
  year: number;
  color: TaxiColor;
  fuelType: TaxiFuelType;
  equipmentState?: Partial<Record<TaxiEquipmentKey, boolean>>;
  currency?: Currency;
}): TaxiComplianceAudit {
  const { year, color, fuelType, equipmentState = {}, currency = 'AZN' } = params;
  const vehicleAge = Math.max(0, CURRENT_REFERENCE_YEAR - year);

  // Age compliance: <= 8 years for new registration; <= 15 years for grandfathered
  const isNewAgeCompliant = vehicleAge <= MAX_NEW_TAXI_AGE_YEARS;
  const isGrandfatheredAgeCompliant = vehicleAge <= MAX_GRANDFATHERED_TAXI_AGE_YEARS;

  // Color compliance: white or red are standard AYNA permitted colors
  const isColorCompliant = color === 'white' || color === 'red';

  // Eco compliance: EV, Hybrid, or Petrol/Diesel year >= 2014 (Euro-5)
  const isEcoCompliant = fuelType === 'ev' || fuelType === 'hybrid' || year >= 2014;

  // Equipment breakdown
  const equipment: Record<TaxiEquipmentKey, boolean> = {
    air_conditioning: equipmentState.air_conditioning ?? true,
    abs: equipmentState.abs ?? true,
    airbags: equipmentState.airbags ?? true,
    dual_dashcam: equipmentState.dual_dashcam ?? false,
    pos_terminal: equipmentState.pos_terminal ?? false,
    taxi_roof_lamp: equipmentState.taxi_roof_lamp ?? false,
    checker_decals: equipmentState.checker_decals ?? false
  };

  let missingEquipmentCount = 0;
  let retrofitCostAzn = 0;

  for (const item of DEFAULT_EQUIPMENT_CATALOG) {
    if (item.isMandatory && !equipment[item.key]) {
      missingEquipmentCount++;
      retrofitCostAzn += item.retrofitCostAzn;
    }
  }

  // If color is non-compliant, add wrap/paint budget
  if (!isColorCompliant) {
    retrofitCostAzn += COLOR_WRAPPING_COST_AZN;
  }

  // Overall status evaluation
  let status: TaxiEligibilityStatus = 'non_compliant';
  if (!isGrandfatheredAgeCompliant) {
    status = 'non_compliant';
  } else if (isNewAgeCompliant && isColorCompliant) {
    status = 'eligible_new';
  } else if (isGrandfatheredAgeCompliant) {
    status = 'eligible_grandfathered';
  }

  // Score calculation (0 - 100)
  let score = 0;
  // Age points (max 35)
  if (isNewAgeCompliant) {
    score += 35;
  } else if (isGrandfatheredAgeCompliant) {
    score += 15;
  }

  // Color points (max 15)
  if (isColorCompliant) {
    score += 15;
  } else if (isGrandfatheredAgeCompliant) {
    score += 5;
  }

  // Eco points (max 15)
  if (fuelType === 'ev') {
    score += 15;
  } else if (fuelType === 'hybrid') {
    score += 13;
  } else if (isEcoCompliant) {
    score += 10;
  }

  // Equipment points (max 35 across 7 items = 5 each)
  let equipmentPoints = 0;
  for (const key of Object.keys(equipment) as TaxiEquipmentKey[]) {
    if (equipment[key]) {
      equipmentPoints += 5;
    }
  }
  score += equipmentPoints;

  const statutoryAnnualFeeAzn = STATUTORY_FEES.vehiclePass1YearAzn + STATUTORY_FEES.technicalInspectionStampAzn;

  const checklist = [
    {
      id: 'chk_age_8',
      title: {
        az: `İstehsal ili 8 ildən çox olmamalıdır (${CURRENT_REFERENCE_YEAR - MAX_NEW_TAXI_AGE_YEARS}+)`,
        en: `Manufacture year must not exceed 8 years (${CURRENT_REFERENCE_YEAR - MAX_NEW_TAXI_AGE_YEARS}+)`,
        ru: `Год выпуска не старше 8 лет (${CURRENT_REFERENCE_YEAR - MAX_NEW_TAXI_AGE_YEARS}+)`
      },
      isMet: isNewAgeCompliant,
      mandatory: true,
      note: {
        az: isNewAgeCompliant
          ? `${vehicleAge} yaş - Yeni AYNA buraxılışı üçün tam uyğundur.`
          : isGrandfatheredAgeCompliant
            ? `${vehicleAge} yaş - Yalnız mövcud buraxılış vərəqələrinin uzadılması mümkündür (maks. 15 il).`
            : `${vehicleAge} yaş - 15 illik qanuni həddi keçib, taksi fəaliyyətinə buraxılmır.`,
        en: isNewAgeCompliant
          ? `${vehicleAge} yrs old - Fully eligible for new AYNA taxi pass.`
          : isGrandfatheredAgeCompliant
            ? `${vehicleAge} yrs old - Grandfathered extension only (up to 15 yrs).`
            : `${vehicleAge} yrs old - Exceeds statutory 15-year age limit.`,
        ru: isNewAgeCompliant
          ? `${vehicleAge} лет - Полностью подходит для нового пропуска AYNA.`
          : isGrandfatheredAgeCompliant
            ? `${vehicleAge} лет - Только продление действующих разрешений (до 15 лет).`
            : `${vehicleAge} лет - Превышен 15-летний лимит возраста.`
      }
    },
    {
      id: 'chk_color',
      title: {
        az: 'Rəsmi Taksi Rəngi: Ağ və ya Qırmızı',
        en: 'Official Taxi Colors: White or Red',
        ru: 'Официальные цвета такси: Белый или Красный'
      },
      isMet: isColorCompliant,
      mandatory: true,
      note: {
        az: isColorCompliant
          ? `${color.toUpperCase()} rəngi AYNA dövlət standartına tam cavab verir.`
          : 'Avtomobilin rəngi ağ və ya qırmızı olmalıdır (Vinil plyonka ilə dəyişdirilə bilər).',
        en: isColorCompliant
          ? `${color.toUpperCase()} color complies with AYNA state standards.`
          : 'Vehicle must be white or red (can be wrapped with vinyl film).',
        ru: isColorCompliant
          ? `Цвет ${color.toUpperCase()} полностью соответствует госстандарту AYNA.`
          : 'Цвет должен быть белым или красным (допускается оклейка винилом).'
      }
    },
    {
      id: 'chk_eco',
      title: {
        az: 'Ekoloji Sinif: Avro-5 və ya Elektrik / Hibrid',
        en: 'Ecological Class: Euro-5 or EV / Hybrid',
        ru: 'Экологический класс: Евро-5 или Электро / Гибрид'
      },
      isMet: isEcoCompliant,
      mandatory: true,
      note: {
        az: isEcoCompliant ? 'Ekoloji tələblər ödənilib.' : 'Avro-5 standartından aşağı mühərriklər qadağandır.',
        en: isEcoCompliant ? 'Ecological criteria met.' : 'Engines below Euro-5 class are prohibited.',
        ru: isEcoCompliant ? 'Экологические критерии выполнены.' : 'Двигатели ниже класса Евро-5 запрещены.'
      }
    },
    {
      id: 'chk_aircon',
      title: {
        az: 'İşlək Kondisioner Sistemi',
        en: 'Operational Air Conditioning System',
        ru: 'Исправная система кондиционирования'
      },
      isMet: equipment.air_conditioning,
      mandatory: true
    },
    {
      id: 'chk_abs_airbags',
      title: {
        az: 'ABS və Minimum 2 Təhlükəsizlik Yastığı',
        en: 'ABS & Minimum 2 Safety Airbags',
        ru: 'ABS и минимум 2 фронтальные подушки безопасности'
      },
      isMet: equipment.abs && equipment.airbags,
      mandatory: true
    },
    {
      id: 'chk_dashcam',
      title: {
        az: 'Daxili və Xarici Videoqeydiyyatçı Kamera (14 gün yaddaş)',
        en: 'Dual Interior/Exterior Dashcam (14-day memory)',
        ru: 'Двухканальный видеорегистратор (14 дней записи)'
      },
      isMet: equipment.dual_dashcam,
      mandatory: true
    },
    {
      id: 'chk_taximeter',
      title: {
        az: 'Sarı Dam Fənəri (TAXI) və Qapı Şahmat Zolaqları',
        en: 'Yellow TAXI Roof Sign & Side Chequered Decals',
        ru: 'Желтый плафон TAXI и боковые шашечные полосы'
      },
      isMet: equipment.taxi_roof_lamp && equipment.checker_decals,
      mandatory: true
    },
    {
      id: 'chk_pos',
      title: {
        az: 'Nağdsız Ödəniş Terminalı / Elektron QR',
        en: 'Cashless Payment POS Terminal / Electronic QR',
        ru: 'Терминал безналичной оплаты / Электронный QR'
      },
      isMet: equipment.pos_terminal,
      mandatory: true
    }
  ];

  let verdictMessage = {
    az: 'Avtomobil yeni AYNA qaydalarına tam uyğundur və buraxılış vərəqəsi ala bilər.',
    en: 'Vehicle is fully compliant with AYNA regulations and eligible for taxi carrier pass.',
    ru: 'Автомобиль полностью соответствует правилам AYNA и готов к получению пропуска.'
  };

  if (status === 'non_compliant') {
    verdictMessage = {
      az: 'Avtomobil yaş və ya texniki tələblərə görə taksi kimi qeydiyyata alına bilməz.',
      en: 'Vehicle does not meet age or regulatory requirements for taxi registration.',
      ru: 'Автомобиль не соответствует возрастным или нормативным требованиям для такси.'
    };
  } else if (status === 'eligible_grandfathered') {
    verdictMessage = {
      az: 'Mövcud icazələrin keçid dövrü çərçivəsində fəaliyyət göstərə bilər (15 il həddi).',
      en: 'Eligible under grandfathered transitional provisions (up to 15-year cap).',
      ru: 'Разрешено в рамках переходного периода для действующего автопарка (до 15 лет).'
    };
  } else if (missingEquipmentCount > 0 || !isColorCompliant) {
    verdictMessage = {
      az: `Avtomobilin ili uyğundur, lakin ${missingEquipmentCount + (!isColorCompliant ? 1 : 0)} çatışmazlıq aradan qaldırılmalıdır.`,
      en: `Vehicle age is compliant, but ${missingEquipmentCount + (!isColorCompliant ? 1 : 0)} requirements need retrofitting.`,
      ru: `Возраст подходит, однако необходимо устранить ${missingEquipmentCount + (!isColorCompliant ? 1 : 0)} несоответствий.`
    };
  }

  return {
    vehicleYear: year,
    vehicleAge,
    status,
    color,
    isColorCompliant,
    isAgeCompliant: isNewAgeCompliant,
    isEcoCompliant,
    complianceScore: Math.min(100, Math.max(0, score)),
    equipment,
    missingEquipmentCount,
    retrofitCostAzn,
    retrofitCostConverted: convertFromAzn(retrofitCostAzn, currency),
    statutoryAnnualFeeAzn,
    statutoryAnnualFeeConverted: convertFromAzn(statutoryAnnualFeeAzn, currency),
    currency,
    verdictMessage,
    checklist
  };
}

export function calculateAggregatorProfit(
  config: AggregatorShiftConfig,
  currency: Currency = 'AZN'
): AggregatorProfitResult {
  const platform = RIDE_HAILING_PLATFORMS[config.platform] || RIDE_HAILING_PLATFORMS.bolt;
  const fuelRate = FUEL_RATES_PER_KM[config.fuelType] || FUEL_RATES_PER_KM.petrol;

  const dailyGrossAzn = Math.max(0, config.dailyGrossAzn);
  const workingDays = Math.max(1, Math.min(31, config.workingDaysPerMonth));
  const dailyKm = Math.max(0, config.dailyKm);

  // Daily deductions
  const dailyCommissionAzn = Number((dailyGrossAzn * platform.commissionRate).toFixed(2));
  const dailyFuelAzn = Number((dailyKm * fuelRate.costPerKmAzn).toFixed(2));
  // Vehicle amortization / maintenance wear reserve: 0.038 AZN/km
  const dailyAmortizationAzn = Number((dailyKm * 0.038).toFixed(2));
  // Daily share of AYNA annual pass + inspection: 35 AZN / 365 days
  const dailyPassAmortizationAzn = Number((35 / 365).toFixed(2));

  const dailyDeductions = dailyCommissionAzn + dailyFuelAzn + dailyAmortizationAzn + dailyPassAmortizationAzn;
  const dailyNetAzn = Number(Math.max(0, dailyGrossAzn - dailyDeductions).toFixed(2));

  // Monthly values
  const monthlyGrossAzn = Number((dailyGrossAzn * workingDays).toFixed(2));
  const monthlyCommissionAzn = Number((dailyCommissionAzn * workingDays).toFixed(2));
  const monthlyFuelAzn = Number((dailyFuelAzn * workingDays).toFixed(2));
  const monthlyAmortizationAzn = Number((dailyAmortizationAzn * workingDays).toFixed(2));
  const monthlyNetAzn = Number((dailyNetAzn * workingDays).toFixed(2));
  const monthlyTripCount = config.dailyTrips * workingDays;

  // Assuming 9-hour active shift
  const hourlyWageAzn = Number((dailyNetAzn / 9).toFixed(2));

  // Eco savings vs Standard Petrol (9.5L @ 1.10 = 0.1045 AZN/km)
  const petrolCostPerKm = FUEL_RATES_PER_KM.petrol.costPerKmAzn;
  const savingPerKm = Math.max(0, petrolCostPerKm - fuelRate.costPerKmAzn);
  const ecoSavingVsPetrolMonthAzn = Number((savingPerKm * dailyKm * workingDays).toFixed(2));

  return {
    dailyGrossAzn,
    dailyCommissionAzn,
    dailyFuelAzn,
    dailyAmortizationAzn,
    dailyPassAmortizationAzn,
    dailyNetAzn,
    monthlyGrossAzn,
    monthlyGrossConverted: convertFromAzn(monthlyGrossAzn, currency),
    monthlyCommissionAzn,
    monthlyFuelAzn,
    monthlyAmortizationAzn,
    monthlyNetAzn,
    monthlyNetConverted: convertFromAzn(monthlyNetAzn, currency),
    monthlyTripCount,
    hourlyWageAzn,
    hourlyWageConverted: convertFromAzn(hourlyWageAzn, currency),
    ecoSavingVsPetrolMonthAzn,
    currency
  };
}

export function generateTaxiPassNumber(): string {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `AYNA-TX-2026-${randomSuffix}`;
}

export function generateSecurityChecksum(passNumber: string, plateNumber: string): string {
  let hash = 0;
  const raw = `${passNumber}_${plateNumber}_AYNA_AZ`;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  return `0x${Math.abs(hash).toString(16).toUpperCase().padStart(8, '0')}`;
}

export function createAynaTaxiPass(params: {
  plateNumber: string;
  vin: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleColor: string;
  fuelType: TaxiFuelType;
  carrierName?: string;
  carrierVoen?: string;
  driverName?: string;
  driverFin?: string;
  driverLicense?: string;
  validityYears?: number;
}): AynaTaxiPass {
  const validityYears = params.validityYears === 3 ? 3 : 1;
  const passNumber = generateTaxiPassNumber();
  const securityChecksum = generateSecurityChecksum(passNumber, params.plateNumber);

  const issueDateObj = new Date();
  const expiryDateObj = new Date();
  expiryDateObj.setFullYear(issueDateObj.getFullYear() + validityYears);

  const issueDate = issueDateObj.toISOString().split('T')[0];
  const expiryDate = expiryDateObj.toISOString().split('T')[0];

  const stateDutyAzn = validityYears === 3 ? STATUTORY_FEES.vehiclePass3YearsAzn : STATUTORY_FEES.vehiclePass1YearAzn;

  const qrVerificationUrl = `https://ayna.gov.az/e-xidmetler/taksi-yoxla?pass=${passNumber}&plate=${encodeURIComponent(
    params.plateNumber
  )}&chk=${securityChecksum}`;

  return {
    passNumber,
    carrierType: params.carrierVoen ? 'legal_entity' : 'individual',
    carrierName: params.carrierName || 'Fərdi Sahibkar (Taksi Daşıyıcısı)',
    carrierVoen: params.carrierVoen || '1402891921',
    driverName: params.driverName || 'Rəşad Əliyev',
    driverFin: params.driverFin || '7ABC89X',
    driverLicense: params.driverLicense || 'AZ99014522',
    plateNumber: params.plateNumber.toUpperCase(),
    vin: params.vin.toUpperCase(),
    vehicleMake: params.vehicleMake,
    vehicleModel: params.vehicleModel,
    vehicleYear: params.vehicleYear,
    vehicleColor: params.vehicleColor,
    fuelType: params.fuelType,
    issueDate,
    expiryDate,
    validityYears,
    stateDutyAzn,
    securityChecksum,
    qrVerificationUrl,
    status: 'active'
  };
}

export function createTrainingBooking(params: {
  centerId: string;
  centerName: string;
  applicantName: string;
  applicantFin: string;
  applicantPhone: string;
  date: string;
  timeSlot: string;
  service: string;
}): TrainingBooking {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const bookingId = `AYNA-BK-${randomSuffix}`;
  const confirmationCode = `BRX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  return {
    bookingId,
    centerId: params.centerId,
    centerName: params.centerName,
    applicantName: params.applicantName,
    applicantFin: params.applicantFin.toUpperCase(),
    applicantPhone: params.applicantPhone,
    date: params.date,
    timeSlot: params.timeSlot,
    service: params.service,
    confirmationCode
  };
}

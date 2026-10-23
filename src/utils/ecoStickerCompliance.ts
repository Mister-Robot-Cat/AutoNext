import { Currency } from '../types/vehicle';

export type EcoStickerCategory = 'green_1' | 'blue_2' | 'yellow_3' | 'grey_4';

export type LowEmissionZoneId = 'zone_1_ulez' | 'zone_2_central' | 'zone_3_baku_ring' | 'zone_4_outer';

export type EuroStandard = 'euro_2' | 'euro_3' | 'euro_4' | 'euro_5' | 'euro_6' | 'zero_emission';

export type PowertrainType = 'ev' | 'phev' | 'hybrid' | 'petrol' | 'diesel' | 'cng_lpg';

export type VehicleCategory = 'm1_passenger' | 'n1_light_commercial' | 'm2_minibus' | 'n2_n3_heavy_truck';

export interface EcoStickerInfo {
  category: EcoStickerCategory;
  tierNumber: number;
  badgeLabel: string;
  badgeLabelAz: string;
  badgeLabelEn: string;
  badgeLabelRu: string;
  descriptionAz: string;
  descriptionEn: string;
  descriptionRu: string;
  hexBg: string;
  hexBorder: string;
  hexText: string;
  allowedZones: LowEmissionZoneId[];
  feeMultiplier: number;
}

export interface AirQualityStation {
  id: string;
  nameAz: string;
  nameEn: string;
  district: string;
  aqi: number;
  pm25: number; // µg/m³
  pm10: number; // µg/m³
  no2: number; // ppb
  co: number; // ppm
  tempC: number;
  status: 'good' | 'moderate' | 'sensitive' | 'unhealthy';
}

export interface ZoneInfo {
  id: LowEmissionZoneId;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  boundariesAz: string;
  boundariesEn: string;
  permittedCategories: EcoStickerCategory[];
  peakHours: string;
  baseDailyRateAzn: number;
  speedLimitKmH: number;
  activeCamerasCount: number;
  descriptionAz: string;
}

export interface EcoDiagnosticCenter {
  id: string;
  nameAz: string;
  nameEn: string;
  district: string;
  address: string;
  coordinates: string;
  workingHours: string;
  phone: string;
  dailyCapacity: number;
  currentQueue: number;
  avgWaitMinutes: number;
}

export interface EcoComplianceParams {
  fuelType?: string;
  year?: number;
  euroStandard?: EuroStandard;
  engineCc?: number;
  hasCatalystOrDpf?: boolean;
  vehicleCategory?: VehicleCategory;
  zoneId: LowEmissionZoneId;
  isPeakHours?: boolean;
  isResident?: boolean;
  isDisabledDriver?: boolean;
  passType?: 'daily' | 'monthly' | 'annual';
}

export interface EcoComplianceResult {
  stickerCategory: EcoStickerCategory;
  stickerInfo: EcoStickerInfo;
  euroClass: EuroStandard;
  isAllowedFree: boolean;
  isAllowedWithFee: boolean;
  isProhibited: boolean;
  dailyFeeAzn: number;
  totalFeeAzn: number;
  totalFeeUsd: number;
  totalFeeEur: number;
  discountPercent: number;
  statutoryFineRiskAzn: number; // İXM Article 342.5 (50 AZN)
  co2EmissionsGramPerKm: number;
  auditNotesAz: string[];
  auditNotesEn: string[];
}

export interface EcoStickerCertificate {
  certificateNumber: string;
  stickerNumber: string;
  rfidTagUid: string;
  vehiclePlate: string;
  vin: string;
  makeModel: string;
  stickerCategory: EcoStickerCategory;
  euroClass: EuroStandard;
  issueDate: string;
  validUntil: string;
  issuingCenter: string;
  inspectorId: string;
  permittedZones: LowEmissionZoneId[];
  qrCodeUrl: string;
  sha256VerificationHash: string;
}

export const ECO_STICKERS: Record<EcoStickerCategory, EcoStickerInfo> = {
  green_1: {
    category: 'green_1',
    tierNumber: 1,
    badgeLabel: 'Yaşıl (1-ci Sinif) — Sıfır Emissiya',
    badgeLabelAz: 'Yaşıl (1-ci Sinif) — Sıfır Emissiya',
    badgeLabelEn: 'Green (Tier 1) — Zero Emission',
    badgeLabelRu: 'Зеленый (Класс 1) — Нулевой Выброс',
    descriptionAz: '100% Elektromobillər (BEV) və Hidrogen (FCEV). Bütün Bakı zonalarına məhdudiyyətsiz və pulsuz giriş.',
    descriptionEn: '100% Battery Electric (BEV) and Hydrogen (FCEV). Unlimited free access across all Baku LEZ zones.',
    descriptionRu: '100% Электромобили (BEV) и Водородные (FCEV). Бесплатный неограниченный въезд во все зоны Баку.',
    hexBg: '#059669',
    hexBorder: '#10b981',
    hexText: '#ffffff',
    allowedZones: ['zone_1_ulez', 'zone_2_central', 'zone_3_baku_ring', 'zone_4_outer'],
    feeMultiplier: 0,
  },
  blue_2: {
    category: 'blue_2',
    tierNumber: 2,
    badgeLabel: 'Mavi (2-ci Sinif) — Ultra Aşağı Emissiya',
    badgeLabelAz: 'Mavi (2-ci Sinif) — Ultra Aşağı Emissiya',
    badgeLabelEn: 'Blue (Tier 2) — Ultra-Low Emission',
    badgeLabelRu: 'Синий (Класс 2) — Ультранизкий Выброс',
    descriptionAz: 'Euro-6 benzin/dizel, Plug-in Hybrid (PHEV) və müasir hibridlər. Zona 2-4 pulsuz, Zona 1 simvolik rüsumla.',
    descriptionEn: 'Euro-6 petrol/diesel, Plug-in Hybrids (PHEV) and modern hybrids. Free in Zones 2-4, low fee in Zone 1.',
    descriptionRu: 'Евро-6 бензин/дизель, Plug-in гибриды (PHEV) и гибриды. Зоны 2-4 бесплатно, Зона 1 с минимальным сбором.',
    hexBg: '#2563eb',
    hexBorder: '#3b82f6',
    hexText: '#ffffff',
    allowedZones: ['zone_1_ulez', 'zone_2_central', 'zone_3_baku_ring', 'zone_4_outer'],
    feeMultiplier: 0.3,
  },
  yellow_3: {
    category: 'yellow_3',
    tierNumber: 3,
    badgeLabel: 'Sarı (3-cü Sinif) — Orta Emissiya',
    badgeLabelAz: 'Sarı (3-cü Sinif) — Orta Emissiya',
    badgeLabelEn: 'Yellow (Tier 3) — Moderate Emission',
    badgeLabelRu: 'Желтый (Класс 3) — Умеренный Выброс',
    descriptionAz: 'Euro-4 və Euro-5 benzin/dizel (katalizator və DPF salamat). Zona 1 pik saatda qadağan, Zona 2 rüsumla.',
    descriptionEn: 'Euro-4 and Euro-5 petrol/diesel with working catalyst & DPF. Peak ban in Zone 1, fee in Zone 2.',
    descriptionRu: 'Евро-4 и Евро-5 бензин/дизель с рабочим катализатором и DPF. Запрет в часы пик в Зоне 1, сбор в Зоне 2.',
    hexBg: '#d97706',
    hexBorder: '#f59e0b',
    hexText: '#ffffff',
    allowedZones: ['zone_2_central', 'zone_3_baku_ring', 'zone_4_outer'],
    feeMultiplier: 1.0,
  },
  grey_4: {
    category: 'grey_4',
    tierNumber: 4,
    badgeLabel: 'Boz (4-cü Sinif) — Yüksək Emissiya',
    badgeLabelAz: 'Boz (4-cü Sinif) — Yüksək Emissiya',
    badgeLabelEn: 'Grey (Tier 4) — High Emission',
    badgeLabelRu: 'Серый (Класс 4) — Высокий Выброс',
    descriptionAz: 'Euro-3 və daha köhnə, katalizatoru kəsilmiş və ya tüstüləyən avtomobillər. Zona 1 və 2-yə qəti giriş qadağası.',
    descriptionEn: 'Euro-3 and older, decat, or heavy smoking engines. Strictly prohibited from entering Zones 1 and 2.',
    descriptionRu: 'Евро-3 и старше, без катализатора или дымящие моторы. Полный запрет на въезд в Зоны 1 и 2.',
    hexBg: '#475569',
    hexBorder: '#64748b',
    hexText: '#ffffff',
    allowedZones: ['zone_3_baku_ring', 'zone_4_outer'],
    feeMultiplier: 2.2,
  },
};

export const LEZ_ZONES: Record<LowEmissionZoneId, ZoneInfo> = {
  zone_1_ulez: {
    id: 'zone_1_ulez',
    nameAz: 'Zona 1 — Ultra Aşağı Emissiya Qoruğu (İçərişəhər & Bulvar)',
    nameEn: 'Zone 1 — Ultra Low Emission Sanctuary (Old City & Boulevard)',
    nameRu: 'Зона 1 — Ультранизкая Зона (Ичеришехер и Бульвар)',
    boundariesAz: 'İçərişəhər Dövlət Qoruğu, Fəvvarələr Meydanı, Dənizkənarı Milli Park, Nizami küçəsi piyada ərazisi',
    boundariesEn: 'Old City Reserve, Fountains Square, Seaside National Park, Nizami pedestrian corridor',
    permittedCategories: ['green_1', 'blue_2'],
    peakHours: '08:00 – 21:00',
    baseDailyRateAzn: 10,
    speedLimitKmH: 30,
    activeCamerasCount: 24,
    descriptionAz: 'COP29 ekoloji mirası üzrə tarixi və piyada mərkəzində sıfır tüstü rejimi. Yalnız Yaşıl və Mavi stikerlər buraxılır.',
  },
  zone_2_central: {
    id: 'zone_2_central',
    nameAz: 'Zona 2 — Bakı Şəhər Mərkəzi Halqası',
    nameEn: 'Zone 2 — Baku Downtown Central Ring',
    nameRu: 'Зона 2 — Центральное Кольцо Баку',
    boundariesAz: 'Neftçilər prospekti, Səməd Vurğun, Füzuli küç., 28 May m/st, Rəşid Behbudov, Bakıxanov küçəsi',
    boundariesEn: 'Neftchilar Ave, Samad Vurgun, Fizuli St, 28 May metro, Rashid Behbudov, Bakikhanov St',
    permittedCategories: ['green_1', 'blue_2', 'yellow_3'],
    peakHours: '07:30 – 20:00',
    baseDailyRateAzn: 5,
    speedLimitKmH: 50,
    activeCamerasCount: 48,
    descriptionAz: 'Sıx tıxac və havanın çirklənməsinə qarşı mərkəzi tənzimləmə halqası. Boz stikerli avtomobillərə qadağandır.',
  },
  zone_3_baku_ring: {
    id: 'zone_3_baku_ring',
    nameAz: 'Zona 3 — Böyük Bakı Magistral Halqası',
    nameEn: 'Zone 3 — Greater Baku Highway Ring',
    nameRu: 'Зона 3 — Магистральное Кольцо Большого Баку',
    boundariesAz: 'Ziya Bünyadov prospekti, Heydər Əliyev pr., Babək prospekti, 8 Noyabr pr., Mikayıl Müşfiq küçəsi',
    boundariesEn: 'Ziya Bunyadov Ave, Heydar Aliyev Ave, Babek Ave, 8 November Ave, Mikayil Mushfig St',
    permittedCategories: ['green_1', 'blue_2', 'yellow_3', 'grey_4'],
    peakHours: '07:00 – 22:00',
    baseDailyRateAzn: 2,
    speedLimitKmH: 70,
    activeCamerasCount: 64,
    descriptionAz: 'Böyük Bakı daxili tranzit magistralları. Bütün stiker növləri buraxılır, lakin Boz stiker ekoloji rüsum ödəyir.',
  },
  zone_4_outer: {
    id: 'zone_4_outer',
    nameAz: 'Zona 4 — Şəhərətrafı Giriş Qapıları & Sürət Yolları',
    nameEn: 'Zone 4 — Suburban Entry Corridors & Expressways',
    nameRu: 'Зона 4 — Пригородные Въездные Ворота и Шоссе',
    boundariesAz: 'M-1 Sumqayıt-Bakı şosesi (km 16), M-2 Lökbatan postu, Aeroport şosesi (Mərdəkan döngəsi), Şıxov sahili',
    boundariesEn: 'M-1 Sumgayit-Baku highway (km 16), M-2 Lokbatan post, Airport highway, Shikhov coastal road',
    permittedCategories: ['green_1', 'blue_2', 'yellow_3', 'grey_4'],
    peakHours: 'Məhdudiyyətsiz (24/7)',
    baseDailyRateAzn: 0,
    speedLimitKmH: 90,
    activeCamerasCount: 32,
    descriptionAz: 'Paytaxta giriş-çıxış nəzarət zonası. Bütün avtomobillər üçün giriş pulsuzdur, ANPR nömrə və stiker oxunuşu aparılır.',
  },
};

export const AZN_TO_USD = 0.5882;
export const AZN_TO_EUR = 0.5435;

/**
 * Automatically determine Euro standard based on vehicle specifications
 */
export function inferEuroStandard(
  fuelType?: string,
  year?: number,
  hasCatalystOrDpf: boolean = true
): EuroStandard {
  const normFuel = (fuelType || '').toLowerCase();
  const carYear = year || 2020;

  if (normFuel.includes('electric') || normFuel.includes('elektrik') || normFuel.includes('bev')) {
    return 'zero_emission';
  }

  if (!hasCatalystOrDpf) {
    return 'euro_2';
  }

  if (carYear >= 2016) {
    return 'euro_6';
  }
  if (carYear >= 2011) {
    return 'euro_5';
  }
  if (carYear >= 2005) {
    return 'euro_4';
  }
  if (carYear >= 2000) {
    return 'euro_3';
  }
  return 'euro_2';
}

/**
 * Determine official Eco-Sticker Category based on Euro standard and fuel type
 */
export function evaluateEcoStickerCategory(
  euro: EuroStandard,
  fuelType?: string,
  hasCatalystOrDpf: boolean = true
): EcoStickerCategory {
  const normFuel = (fuelType || '').toLowerCase();

  if (euro === 'zero_emission' || normFuel.includes('electric') || normFuel.includes('elektrik') || normFuel.includes('bev')) {
    return 'green_1';
  }

  if (!hasCatalystOrDpf) {
    return 'grey_4';
  }

  if (euro === 'euro_6') {
    return 'blue_2';
  }

  if (normFuel.includes('hybrid') || normFuel.includes('hibrid') || normFuel.includes('phev')) {
    return euro === 'euro_5' ? 'blue_2' : 'yellow_3';
  }

  if (euro === 'euro_5') {
    return 'yellow_3';
  }

  if (euro === 'euro_4') {
    return 'yellow_3';
  }

  return 'grey_4';
}

/**
 * Estimate vehicle CO2 emissions in grams per kilometer
 */
export function estimateCo2GramsPerKm(
  category: EcoStickerCategory,
  euro: EuroStandard,
  engineCc: number = 2000
): number {
  if (category === 'green_1') return 0;

  let baseCo2 = 120;
  if (euro === 'euro_6') baseCo2 = 115;
  else if (euro === 'euro_5') baseCo2 = 138;
  else if (euro === 'euro_4') baseCo2 = 165;
  else if (euro === 'euro_3') baseCo2 = 195;
  else baseCo2 = 230;

  const displacementFactor = Math.max(0.7, engineCc / 2000);
  return Math.round(baseCo2 * displacementFactor);
}

/**
 * Calculate statutory LEZ compliance, congestion fees, exemptions, and sanctions
 */
export function calculateEcoCompliance(params: EcoComplianceParams): EcoComplianceResult {
  const hasCat = params.hasCatalystOrDpf !== false;
  const inferredEuro = params.euroStandard || inferEuroStandard(params.fuelType, params.year, hasCat);
  const stickerCategory = evaluateEcoStickerCategory(inferredEuro, params.fuelType, hasCat);
  const stickerInfo = ECO_STICKERS[stickerCategory];
  const zone = LEZ_ZONES[params.zoneId];

  const auditNotesAz: string[] = [];
  const auditNotesEn: string[] = [];

  // Zone permission checks
  const isDirectlyPermitted = zone.permittedCategories.includes(stickerCategory);
  let isProhibited = false;
  let isAllowedFree = false;
  let isAllowedWithFee = false;

  // Commercial vehicle multiplier (commercial pays 50% more congestion fee)
  const isCommercial = params.vehicleCategory === 'n1_light_commercial' ||
    params.vehicleCategory === 'm2_minibus' ||
    params.vehicleCategory === 'n2_n3_heavy_truck';
  const categoryMultiplier = isCommercial ? 1.5 : 1.0;

  // Peak hours multiplier
  const peakMultiplier = params.isPeakHours ? 1.25 : 1.0;

  // Base daily fee from zone
  let calculatedDailyAzn = zone.baseDailyRateAzn * stickerInfo.feeMultiplier * categoryMultiplier * peakMultiplier;

  // Specific zone enforcement rules
  if (params.zoneId === 'zone_1_ulez') {
    if (stickerCategory === 'grey_4') {
      isProhibited = true;
      calculatedDailyAzn = 0;
      auditNotesAz.push('Zona 1 (İçərişəhər/Bulvar): Boz stikerli (Euro-3 və köhnə) avtomobillərin daxil olması qəti qadağandır.');
      auditNotesEn.push('Zone 1 (Old City/Bulvar): Grey sticker vehicles are strictly prohibited from entering.');
    } else if (stickerCategory === 'yellow_3') {
      if (params.isPeakHours) {
        isProhibited = true;
        calculatedDailyAzn = 0;
        auditNotesAz.push('Zona 1: Sarı stikerli avtomobillər pik saatlarda (08:00–21:00) qoruğa daxil ola bilməz.');
        auditNotesEn.push('Zone 1: Yellow sticker vehicles cannot enter during peak hours (08:00–21:00).');
      } else {
        isAllowedWithFee = true;
        auditNotesAz.push('Zona 1: Pik saatlardan kənar sarı stikerli avtomobillər üçün gündəlik ekoloji rüsum tətbiq edilir.');
        auditNotesEn.push('Zone 1: Off-peak yellow sticker access allowed subject to congestion charge.');
      }
    } else if (stickerCategory === 'blue_2') {
      isAllowedWithFee = true;
      auditNotesAz.push('Zona 1: Mavi stiker üçün 70% güzəştli simvolik ekoloji ödəniş.');
      auditNotesEn.push('Zone 1: Blue sticker vehicles enjoy 70% subsidized entrance tariff.');
    } else {
      isAllowedFree = true;
      calculatedDailyAzn = 0;
      auditNotesAz.push('Zona 1: Yaşıl stikerli sıfır emissiyalı avtomobillər üçün giriş tamamilə pulsuzdur.');
      auditNotesEn.push('Zone 1: 100% Free green access for zero-emission electric vehicles.');
    }
  } else if (params.zoneId === 'zone_2_central') {
    if (stickerCategory === 'grey_4') {
      isProhibited = true;
      calculatedDailyAzn = 0;
      auditNotesAz.push('Zona 2 (Mərkəzi Halqa): Boz stikerli avtomobillərin mərkəzə daxil olması qadağandır.');
      auditNotesEn.push('Zone 2 (Central Ring): Grey sticker vehicles prohibited to mitigate downtown smog.');
    } else if (stickerCategory === 'green_1' || stickerCategory === 'blue_2') {
      isAllowedFree = true;
      calculatedDailyAzn = 0;
      auditNotesAz.push('Zona 2: Yaşıl və Mavi stikerli avtomobillər üçün mərkəzə giriş pulsuzdur.');
      auditNotesEn.push('Zone 2: Free downtown entry for Green and Blue stickers.');
    } else {
      isAllowedWithFee = true;
      auditNotesAz.push('Zona 2: Sarı stikerli avtomobillər standart gündəlik ekoloji rüsum ödəyir.');
      auditNotesEn.push('Zone 2: Yellow sticker vehicles subject to standard daily congestion fee.');
    }
  } else if (params.zoneId === 'zone_3_baku_ring') {
    if (stickerCategory === 'grey_4') {
      isAllowedWithFee = true;
      auditNotesAz.push('Zona 3 (Magistral Halqa): Boz stikerli avtomobillər ekoloji kompensasiya rüsumu ilə buraxılır.');
      auditNotesEn.push('Zone 3 (Ring Highway): Grey sticker vehicles permitted with daily eco-compensation fee.');
    } else {
      isAllowedFree = true;
      calculatedDailyAzn = 0;
      auditNotesAz.push('Zona 3: Yaşıl, Mavi və Sarı stikerlər üçün magistral halqası tamamilə pulsuzdur.');
      auditNotesEn.push('Zone 3: Free ring highway passage for Green, Blue, and Yellow stickers.');
    }
  } else {
    // Zone 4 Outer
    isAllowedFree = true;
    calculatedDailyAzn = 0;
    auditNotesAz.push('Zona 4 (Giriş Qapıları): Paytaxt ətrafında bütün nəqliyyat vasitələri üçün gediş pulsuzdur.');
    auditNotesEn.push('Zone 4 (Outer Entry): Completely free transit for all vehicles.');
  }

  // Statutory Exemptions (100% exemption for Inner City registered residents and Disabled Drivers)
  let discountPercent = 0;
  if (params.isResident) {
    discountPercent = 100;
    calculatedDailyAzn = 0;
    isAllowedFree = true;
    isProhibited = false;
    auditNotesAz.push('Qeydiyyatlı Yerli Sakin Güzəşti: Ərazidə daimi yaşayan sakinlər üçün 100% azadolma təmin edilir.');
    auditNotesEn.push('Registered Resident Exemption: 100% fee waiver for verified resident living within zone.');
  } else if (params.isDisabledDriver) {
    discountPercent = 100;
    calculatedDailyAzn = 0;
    isAllowedFree = true;
    isProhibited = false;
    auditNotesAz.push('Sosial İmtiaz: Əlilliyi olan şəxslərin idarə etdiyi nəqliyyat vasitələri üçün 100% azadolma.');
    auditNotesEn.push('Social Privilege: 100% fee waiver for drivers with certified disabilities.');
  }

  // Pass Duration Multiplier
  const passType = params.passType || 'daily';
  let durationMultiplier = 1;
  if (passType === 'monthly') {
    durationMultiplier = 20; // 20 working days discount equivalent
  } else if (passType === 'annual') {
    durationMultiplier = 180; // significant annual fleet discount
  }

  const finalTotalAzn = Math.round((calculatedDailyAzn * durationMultiplier) * 100) / 100;
  const finalTotalUsd = Math.round((finalTotalAzn * AZN_TO_USD) * 100) / 100;
  const finalTotalEur = Math.round((finalTotalAzn * AZN_TO_EUR) * 100) / 100;

  // Statutory fine if vehicle enters illegally without pass or in violation
  const statutoryFineRiskAzn = isProhibited ? 50 : 0; // İXM Article 342.5

  const co2EmissionsGramPerKm = estimateCo2GramsPerKm(
    stickerCategory,
    inferredEuro,
    params.engineCc || 2000
  );

  return {
    stickerCategory,
    stickerInfo,
    euroClass: inferredEuro,
    isAllowedFree,
    isAllowedWithFee: !isAllowedFree && !isProhibited && finalTotalAzn > 0,
    isProhibited,
    dailyFeeAzn: Math.round(calculatedDailyAzn * 100) / 100,
    totalFeeAzn: finalTotalAzn,
    totalFeeUsd: finalTotalUsd,
    totalFeeEur: finalTotalEur,
    discountPercent,
    statutoryFineRiskAzn,
    co2EmissionsGramPerKm,
    auditNotesAz,
    auditNotesEn,
  };
}

/**
 * Format currency amount
 */
export function formatEcoCurrency(amountAzn: number, currency: Currency): string {
  if (currency === 'USD') {
    const usd = Math.round(amountAzn * AZN_TO_USD * 100) / 100;
    return `$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (currency === 'EUR') {
    const eur = Math.round(amountAzn * AZN_TO_EUR * 100) / 100;
    return `€${eur.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${amountAzn.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AZN`;
}

/**
 * Generate official ETSN & BDYP Electronic Eco-Sticker Certificate
 */
export function generateEcoStickerCertificate(
  plate: string,
  vin: string,
  makeModel: string,
  category: EcoStickerCategory,
  euro: EuroStandard,
  issuingCenterName: string = 'ETSN & BDYP Ekoloji Mərkəzi (Zabrat)'
): EcoStickerCertificate {
  const cleanPlate = plate.replace(/\s+/g, '-').toUpperCase();
  const cleanVin = vin.toUpperCase();
  const certSuffix = Math.floor(10000 + Math.random() * 90000);
  const certNumber = `ETSN-LEZ-2026-${certSuffix}`;
  const stickerNumber = `ECO-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  const rfidTagUid = `AZ-RFID-LEZ-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

  const now = new Date();
  const issueDate = now.toISOString().split('T')[0];
  const expireDate = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate()).toISOString().split('T')[0];

  const permittedZones = ECO_STICKERS[category].allowedZones;

  const rawHash = `${certNumber}|${cleanPlate}|${cleanVin}|${category}|${euro}|${issueDate}|ETSN-BDYP-AZE`;
  let hashVal = 0;
  for (let i = 0; i < rawHash.length; i++) {
    hashVal = (hashVal << 5) - hashVal + rawHash.charCodeAt(i);
    hashVal |= 0;
  }
  const hexHash = Math.abs(hashVal).toString(16).padStart(8, '0');
  const sha256VerificationHash = `SHA256:7f4a${hexHash}9b1c3e5d882046fa`;

  return {
    certificateNumber: certNumber,
    stickerNumber,
    rfidTagUid,
    vehiclePlate: cleanPlate,
    vin: cleanVin,
    makeModel,
    stickerCategory: category,
    euroClass: euro,
    issueDate,
    validUntil: expireDate,
    issuingCenter: issuingCenterName,
    inspectorId: `ETSN-MÜF-${Math.floor(100 + Math.random() * 900)}`,
    permittedZones,
    qrCodeUrl: `https://eco.gov.az/verify/lez?cert=${certNumber}&plate=${cleanPlate}`,
    sha256VerificationHash,
  };
}

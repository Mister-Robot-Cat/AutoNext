import { Currency, Vehicle } from '../types/vehicle';

export type BusLaneOperatingRegime =
  | '24_7_continuous'
  | 'peak_hours_07_20'
  | 'morning_evening_split'
  | 'weekdays_only_07_20';

export type BusLaneVehicleCategory =
  | 'private_passenger'
  | 'regular_route_bus'
  | 'emergency_operational'
  | 'bicycle_or_moped'
  | 'licensed_ayna_taxi';

export type BusLaneLineMarking =
  | 'broken_dashed_1_11'
  | 'solid_continuous_1_1';

export type BusLaneManeuverIntent =
  | 'right_turn_into_courtyard_or_street'
  | 'merge_out_from_side_street'
  | 'passenger_drop_off_at_dashed_pocket'
  | 'straight_through_traffic_bypass';

export interface BusLaneCorridor {
  id: string;
  code: string;
  corridorName: string;
  district: string;
  segmentDescription: string;
  lengthKm: number;
  regime: BusLaneOperatingRegime;
  regimeLabel: string;
  activeHoursText: string;
  cameraCount: number;
  hasMobileBusCamera: boolean;
  hasDashedTurnPockets: boolean;
  speedLimitKmh: number;
}

export interface BusLaneAuditInput {
  corridorRegime: BusLaneOperatingRegime;
  hourOfDay: number;
  isWeekend: boolean;
  vehicleCategory: BusLaneVehicleCategory;
  lineMarkingCrossed: BusLaneLineMarking;
  maneuverIntent: BusLaneManeuverIntent;
  applyEarly50Discount: boolean;
}

export interface BusLaneAuditResult {
  isViolation: boolean;
  isBusLaneActiveNow: boolean;
  verdictCode:
    | 'EXEMPT_AUTHORIZED_VEHICLE'
    | 'EXEMPT_OUTSIDE_OPERATING_HOURS'
    | 'EXEMPT_LAWFUL_DASHED_MANEUVER_YHQ_48'
    | 'VIOLATION_SOLID_LINE_CROSSING_IXM_327_1_1'
    | 'VIOLATION_STRAIGHT_BYPASS_IXM_327_1_1';
  verdictTitle: string;
  statutoryBasis: string;
  baseFineAzn: number;
  payableFineAzn: number;
  discountSavingsAzn: number;
  penaltyPoints: number;
  explanation: string;
  appealRecommendation: string;
}

export type BakuEntrySeason = 'summer_may_to_oct' | 'winter_nov_to_apr';

export type BakuEntryVehicleType =
  | 'passenger_or_suv_under_3_5t'
  | 'light_commercial_van_3_5_to_5t'
  | 'medium_cargo_truck_5_to_8t'
  | 'heavy_truck_over_8t'
  | 'special_municipal_or_ev';

export type EntityLegalType =
  | 'individual_driver'
  | 'official_person'
  | 'corporate_entity';

export interface BakuEntryAuditInput {
  vehicleType: BakuEntryVehicleType;
  grossVehicleWeightTons: number;
  maxSingleAxleLoadTons: number;
  season: BakuEntrySeason;
  entryHour: number;
  hasAynaElectronicEntryPass: boolean;
  entityType: EntityLegalType;
}

export interface BakuEntryAuditResult {
  isDaytimeRestrictedWindow: boolean;
  restrictionWindowLabel: string;
  isEntryAllowedNow: boolean;
  requiresElectronicPassForDaytime: boolean;
  isAxleOrGvwOverweight: boolean;
  overweightTons: number;
  entryViolationFineAzn: number;
  wimOverweightFineAzn: number;
  roadWearSurchargeAzn: number;
  totalRiskFineAzn: number;
  allowedFreeNightWindow: string;
  statusSummary: string;
  statutoryReference: string;
}

export interface BakuEntryCheckpoint {
  id: string;
  code: string;
  name: string;
  highwayCorridor: string;
  locationDescription: string;
  hasWimElectronicScale: boolean;
  hasAnprPortal: boolean;
  truckHoldingCapacity: number;
  activeWaitMinutes: number;
}

export interface AynaElectronicEntryPass {
  passNumber: string;
  plateNumber: string;
  vin: string;
  vehicleTitle: string;
  carrierName: string;
  voenOrFin: string;
  cargoCategory: string;
  grossWeightTons: number;
  entryCheckpointName: string;
  authorizedCorridor: string;
  validTimeWindow: string;
  issuedAt: string;
  expiresAt: string;
  qrSecurityHash: string;
  status: 'ACTIVE_VERIFIED' | 'NIGHT_WINDOW_ONLY' | 'EXPIRED';
}

/**
 * Under İXM Maddə 327.1-1 (as amended in 2024/2026), entering or driving on a dedicated
 * public transport lane ("Avtobus zolağı" — sign 5.9 / 5.10.1 and marking 1.23) carries
 * a statutory fine of 100 AZN and 2 demerit points.
 */
export const STATUTORY_BUS_LANE_FINE_AZN = 100;
export const STATUTORY_BUS_LANE_POINTS = 2;

/**
 * Cabinet of Ministers Decision on Maximum Dimensions and Weight Parameters on Public Roads:
 * Standard single axle maximum load is 10.0 tons; total Gross Vehicle Weight ceiling is 44.0 tons.
 */
export const STATUTORY_MAX_SINGLE_AXLE_TONS = 10.0;
export const STATUTORY_MAX_GVW_TONS = 44.0;

/**
 * Cabinet of Ministers Road Traffic Safety Commission (YHTK) Baku Daytime Entry Limit:
 * Cargo and commercial vehicles with maximum authorized mass > 5.0 tons are restricted from
 * entering Baku during daytime hours without an official AYNA Electronic Entry Pass.
 */
export const BAKU_DAYTIME_TRUCK_LIMIT_TONS = 5.0;

/**
 * İXM Maddə 353 — Violation of weight and axle load parameters on AAYDA/AYNA Electronic Scales (WIM)
 */
export const IXM_353_WIM_OVERWEIGHT_FINES_AZN: Record<EntityLegalType, number> = {
  individual_driver: 600,
  official_person: 1400,
  corporate_entity: 4000,
};

const CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1,
  USD: 1 / 1.7,
  EUR: 1 / 1.85,
};

/**
 * Converts AZN amount to target currency with 2-decimal precision
 */
export function convertTrafficRegimeCurrency(amountAzn: number, currency: Currency): number {
  const rate = CURRENCY_RATES[currency] ?? 1;
  return Number((amountAzn * rate).toFixed(2));
}

/**
 * Determines whether a dedicated bus lane restriction is active at a given hour and day.
 */
export function isBusLaneActiveAtTime(
  regime: BusLaneOperatingRegime,
  hourOfDay: number,
  isWeekend: boolean
): boolean {
  const safeHour = Math.max(0, Math.min(23, Math.floor(hourOfDay)));

  switch (regime) {
    case '24_7_continuous':
      return true;
    case 'peak_hours_07_20':
      return safeHour >= 7 && safeHour < 20;
    case 'morning_evening_split':
      return (safeHour >= 7 && safeHour < 10) || (safeHour >= 17 && safeHour < 20);
    case 'weekdays_only_07_20':
      if (isWeekend) return false;
      return safeHour >= 7 && safeHour < 20;
  }
}

/**
 * Audits a vehicle maneuver on a Baku dedicated bus lane under YHQ Article 48 and İXM Article 327.1-1.
 */
export function auditBusLaneManeuver(input: BusLaneAuditInput): BusLaneAuditResult {
  const isActiveNow = isBusLaneActiveAtTime(
    input.corridorRegime,
    input.hourOfDay,
    input.isWeekend
  );

  // 1. Check if the bus lane is currently outside its sign-posted operating hours (7.5.4 / 7.5.2)
  if (!isActiveNow) {
    return {
      isViolation: false,
      isBusLaneActiveNow: false,
      verdictCode: 'EXEMPT_OUTSIDE_OPERATING_HOURS',
      verdictTitle: 'QANUNİ HƏRƏKƏT — Zolağın Fəaliyyət Saatından Kənar (7.5.4 / 7.5.2)',
      statutoryBasis: 'YHQ Maddə 48 və 7.5.4 / 7.5.2 əlavə məlumat lövhələri',
      baseFineAzn: 0,
      payableFineAzn: 0,
      discountSavingsAzn: 0,
      penaltyPoints: 0,
      explanation:
        'Seçilmiş vaxtda (və ya istirahət günündə) 5.9/5.10.1 "Avtobus zolağı" nişanının altındakı 7.5.4 saat lövhəsinin təsir müddəti qüvvədə deyil. Bu saatlarda digər nəqliyyat vasitələrinin zolağa daxil olması cərimə yaratmır.',
      appealRecommendation:
        'Əgər bu saatda MMX radar protokolu tərtib edilərsə, DİN 902 xəttinə və ya e-xidmet.mia.gov.az üzərindən 7.5.4 lövhəsinin vaxt rejimini əsas gətirərək şikayət verin.',
    };
  }

  // 2. Check unconditionally exempt vehicle categories (Regular bus, Emergency 102/103/112, Bicycle/Moped)
  if (
    input.vehicleCategory === 'regular_route_bus' ||
    input.vehicleCategory === 'emergency_operational' ||
    input.vehicleCategory === 'bicycle_or_moped'
  ) {
    return {
      isViolation: false,
      isBusLaneActiveNow: true,
      verdictCode: 'EXEMPT_AUTHORIZED_VEHICLE',
      verdictTitle: 'İCAZƏLİ NƏQLİYYAT VASİTƏSİ — Xüsusi Zolaq Hüququ (YHQ Maddə 48)',
      statutoryBasis: '"Yol hərəkəti haqqında" AR Qanunu, Maddə 48.1 və Maddə 74',
      baseFineAzn: 0,
      payableFineAzn: 0,
      discountSavingsAzn: 0,
      penaltyPoints: 0,
      explanation:
        'Müntəzəm marşrut avtobusları, operativ nəqliyyat vasitələri (102, 103, 112) və velosiped/mopedlər 5.9 nişanlı avtobus zolağı ilə 24/7 maneəsiz hərəkət etmək hüququna malikdir.',
      appealRecommendation:
        'Nəqliyyat vasitəsi AYNA marşrut reyestrində və ya operativ bazada qeydiyyatdadırsa, nömrə nişanı ANPR kameraları tərəfindən avtomatik ağ siyahıya ("Whitelist") salınır.',
    };
  }

  // 3. Check crossing of solid continuous line (1.1) — always a violation even when turning right
  if (input.lineMarkingCrossed === 'solid_continuous_1_1') {
    const payable = input.applyEarly50Discount
      ? Number((STATUTORY_BUS_LANE_FINE_AZN * 0.5).toFixed(2))
      : STATUTORY_BUS_LANE_FINE_AZN;
    return {
      isViolation: true,
      isBusLaneActiveNow: true,
      verdictCode: 'VIOLATION_SOLID_LINE_CROSSING_IXM_327_1_1',
      verdictTitle: 'QAYDA POZUNTUSU — 1.1 Bütöv Xətti Kəsərək Avtobus Zolağına Giriş (İXM 327.1-1)',
      statutoryBasis: 'İXM Maddə 327.1-1 və YHQ Maddə 48.2 (1.1 üfüqi nişanlanma xətti)',
      baseFineAzn: STATUTORY_BUS_LANE_FINE_AZN,
      payableFineAzn: payable,
      discountSavingsAzn: Number((STATUTORY_BUS_LANE_FINE_AZN - payable).toFixed(2)),
      penaltyPoints: STATUTORY_BUS_LANE_POINTS,
      explanation:
        'Sağa dönmək və ya sərnişin düşürmək məqsədilə olsa belə, avtobus zolağını ayıran 1.1 bütöv üfüqi nişanlanma xəttini kəsmək qəti qadağandır və İXM Maddə 327.1-1 üzrə 100 AZN + 2 cərimə balı ilə nəticələnir.',
      appealRecommendation:
        'Cərimə qanunidir. Qərar qüvvəyə mindiyi gündən 30 gün ərzində AsanPay üzərindən ödədikdə 50% güzəşt (50 AZN) tətbiq edilir.',
    };
  }

  // 4. Dashed line (1.11) crossed, check maneuver intent under YHQ Article 48.2
  if (
    input.maneuverIntent === 'right_turn_into_courtyard_or_street' ||
    input.maneuverIntent === 'merge_out_from_side_street' ||
    input.maneuverIntent === 'passenger_drop_off_at_dashed_pocket'
  ) {
    return {
      isViolation: false,
      isBusLaneActiveNow: true,
      verdictCode: 'EXEMPT_LAWFUL_DASHED_MANEUVER_YHQ_48',
      verdictTitle: 'QANUNİ MANEVR — 1.11 Qırıq-Qırıq Xətt Üzrə Dönmə və ya Minik-Düşmə (YHQ Maddə 48.2)',
      statutoryBasis: '"Yol hərəkəti haqqında" AR Qanunu, Maddə 48.2 və Maddə 42',
      baseFineAzn: 0,
      payableFineAzn: 0,
      discountSavingsAzn: 0,
      penaltyPoints: 0,
      explanation:
        'YHQ Maddə 48.2-yə əsasən, avtobus zolağı qırıq-qırıq (1.11) nişanlanma xətti ilə ayrıldıqda, sürücü sağa dönməzdən əvvəl, yan küçədən əsas yola çıxarkən və ya avtobuslara maneə yaratmadan sərnişin mindirib-düşürmək üçün həmin zolağa daxil ola bilər.',
      appealRecommendation:
        'Kamera yalnız 1.11 qırıq-qırıq xətt hissəsində dönmə manevrini qeydə alıbsa, İXM Maddə 327.1-1 tətbiq edilə bilməz. Video-qeydi əlavə edərək BDYP-yə elektron şikayət göndərin.',
    };
  }

  // 5. Straight-through traffic bypass on bus lane (even if entered via dashed pocket)
  const payable = input.applyEarly50Discount
    ? Number((STATUTORY_BUS_LANE_FINE_AZN * 0.5).toFixed(2))
    : STATUTORY_BUS_LANE_FINE_AZN;

  return {
    isViolation: true,
    isBusLaneActiveNow: true,
    verdictCode: 'VIOLATION_STRAIGHT_BYPASS_IXM_327_1_1',
    verdictTitle: 'QAYDA POZUNTUSU — Avtobus Zolağı İlə Düzünə Hərəkət (İXM Maddə 327.1-1)',
    statutoryBasis: 'Azərbaycan Respublikası İnzibati Xətalar Məcəlləsi, Maddə 327.1-1',
    baseFineAzn: STATUTORY_BUS_LANE_FINE_AZN,
    payableFineAzn: payable,
    discountSavingsAzn: Number((STATUTORY_BUS_LANE_FINE_AZN - payable).toFixed(2)),
    penaltyPoints: STATUTORY_BUS_LANE_POINTS,
    explanation:
      'Qırıq-qırıq xətdən zolağa daxil olub sağa dönmədən yolayrıcını düzünə keçmək və ya tıxacı yan keçmək üçün avtobus zolağı boyunca hərəkəti davam etdirmək İXM Maddə 327.1-1 üzrə 100 AZN cərimə və 2 bal yaradır.',
    appealRecommendation:
      '30 təqvim günü ərzində elektron ödəniş etdikdə 50% güzəştlə 50 AZN ödənilir.',
  };
}

/**
 * Infers Baku Entry Vehicle Type from a marketplace Vehicle object
 */
export function inferBakuEntryVehicleType(vehicle?: Vehicle | null): BakuEntryVehicleType {
  if (!vehicle) return 'passenger_or_suv_under_3_5t';
  if (vehicle.fuelType === 'electric') {
    return 'special_municipal_or_ev';
  }
  if (vehicle.bodyType === 'minivan' && vehicle.engineVolumeLiters >= 2.8) {
    return 'light_commercial_van_3_5_to_5t';
  }
  return 'passenger_or_suv_under_3_5t';
}

/**
 * Evaluates Baku daytime commercial/truck entry restrictions (Cabinet of Ministers YHTK decision)
 * and AAYDA/AYNA Electronic Weight-in-Motion (WIM / İXM Maddə 353) axle & gross weight compliance.
 */
export function evaluateBakuEntryAndWimLoad(input: BakuEntryAuditInput): BakuEntryAuditResult {
  const safeHour = Math.max(0, Math.min(23, Math.floor(input.entryHour)));
  const safeGvw = Math.max(0.5, input.grossVehicleWeightTons);
  const safeAxle = Math.max(0.5, input.maxSingleAxleLoadTons);

  const daytimeEndHour = input.season === 'summer_may_to_oct' ? 22 : 21;
  const isDaytimeRestrictedWindow = safeHour >= 7 && safeHour < daytimeEndHour;
  const restrictionWindowLabel =
    input.season === 'summer_may_to_oct'
      ? 'Yay rejimi (1 May – 1 Noyabr): 07:00 – 22:00'
      : 'Qış rejimi (1 Noyabr – 1 May): 07:00 – 21:00';
  const allowedFreeNightWindow =
    input.season === 'summer_may_to_oct' ? '22:00 – 07:00' : '21:00 – 07:00';

  const requiresElectronicPassForDaytime =
    input.vehicleType === 'medium_cargo_truck_5_to_8t' ||
    input.vehicleType === 'heavy_truck_over_8t' ||
    (input.vehicleType !== 'special_municipal_or_ev' && safeGvw > BAKU_DAYTIME_TRUCK_LIMIT_TONS);

  const isEntryAllowedNow =
    !requiresElectronicPassForDaytime ||
    !isDaytimeRestrictedWindow ||
    input.hasAynaElectronicEntryPass;

  // Check WIM Electronic Scale overweight status (single axle > 10t OR GVW > 44t)
  const axleExcess = Math.max(0, Number((safeAxle - STATUTORY_MAX_SINGLE_AXLE_TONS).toFixed(2)));
  const gvwExcess = Math.max(0, Number((safeGvw - STATUTORY_MAX_GVW_TONS).toFixed(2)));
  const overweightTons = Number(Math.max(axleExcess, gvwExcess).toFixed(2));
  const isAxleOrGvwOverweight = overweightTons > 0;

  const entryViolationFineAzn = !isEntryAllowedNow ? 100 : 0;
  const wimOverweightFineAzn = isAxleOrGvwOverweight
    ? IXM_353_WIM_OVERWEIGHT_FINES_AZN[input.entityType]
    : 0;
  const roadWearSurchargeAzn = isAxleOrGvwOverweight
    ? Number((overweightTons * 85).toFixed(2))
    : 0;

  const totalRiskFineAzn = Number(
    (entryViolationFineAzn + wimOverweightFineAzn + roadWearSurchargeAzn).toFixed(2)
  );

  let statusSummary = '';
  if (isAxleOrGvwOverweight) {
    statusSummary = `DİQQƏT: Ox yükü (${safeAxle}t) və ya ümumi çəki (${safeGvw}t) normadan ${overweightTons} ton artıqdır! İXM Maddə 353 üzrə Elektron Tərəzidə ${wimOverweightFineAzn} AZN cərimə tətbiq edilir.`;
  } else if (!isEntryAllowedNow) {
    statusSummary = `QADAĞANDIR: Maksimal kütləsi 5 tondan artıq olan yük avtomobillərinin ${restrictionWindowLabel} saatlarında AYNA Elektron Buraxılışı olmadan Bakı şəhərinə girişi qadağandır.`;
  } else if (requiresElectronicPassForDaytime && input.hasAynaElectronicEntryPass) {
    statusSummary =
      'İCAZƏLİDİR: Aktiv AYNA Rəqəmsal Giriş Buraxılış Vərəqəsi əsasında müəyyən edilmiş marşrut dəhlizi üzrə Bakı şəhərinə giriş təsdiqlənib.';
  } else {
    statusSummary =
      'SƏRBƏST GİRİŞ: Nəqliyyat vasitəsi Bakı şəhərinə giriş-çıxış məhdudiyyətinə düşmür və çəki-qabarit parametrləri tam norma daxilindədir.';
  }

  return {
    isDaytimeRestrictedWindow,
    restrictionWindowLabel,
    isEntryAllowedNow: isEntryAllowedNow && !isAxleOrGvwOverweight,
    requiresElectronicPassForDaytime,
    isAxleOrGvwOverweight,
    overweightTons,
    entryViolationFineAzn,
    wimOverweightFineAzn,
    roadWearSurchargeAzn,
    totalRiskFineAzn,
    allowedFreeNightWindow,
    statusSummary,
    statutoryReference:
      'AR Nazirlər Kabineti YHTK Qərarı (Bakı şəhərinə giriş rejimi) & İXM Maddə 353 (İriqabaritli və ağırçəkili NV)',
  };
}

/**
 * Validates Azerbaijani 10-digit Tax ID (VÖEN) or 7-character Personal FIN Code
 */
export function validateCarrierVoenOrFin(value: string): boolean {
  const cleaned = value.trim().toUpperCase();
  return /^[0-9]{10}$/.test(cleaned) || /^[A-Z0-9]{7}$/.test(cleaned);
}

/**
 * Generates an official AYNA Electronic Baku Entry & Transit Pass ("E-Buraxılış")
 */
export function generateAynaElectronicEntryPass(params: {
  plateNumber: string;
  vin: string;
  vehicleTitle: string;
  carrierName: string;
  voenOrFin: string;
  cargoCategory: string;
  grossWeightTons: number;
  entryCheckpointName: string;
  authorizedCorridor: string;
  validTimeWindow: string;
  issuedDate?: Date;
}): AynaElectronicEntryPass {
  const now = params.issuedDate ?? new Date('2026-10-16T08:00:00Z');
  const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const cleanPlate = params.plateNumber.trim().toUpperCase() || '99-AA-001';
  const cleanId = params.voenOrFin.trim().toUpperCase() || '1405928411';

  const seed = (cleanPlate + cleanId + params.cargoCategory)
    .split('')
    .reduce((acc, ch, idx) => acc + ch.charCodeAt(0) * (idx + 9), 20000);

  const serial = String(10000 + (seed % 89999));

  return {
    passNumber: `AYNA-EB-2026-${serial}`,
    plateNumber: cleanPlate,
    vin: params.vin.trim().toUpperCase() || 'JTDBR32E800192841',
    vehicleTitle: params.vehicleTitle.trim() || 'Nəqliyyat Vasitəsi',
    carrierName: params.carrierName.trim() || '"Abşeron Logistika & Təchizat" MMC',
    voenOrFin: cleanId,
    cargoCategory: params.cargoCategory.trim() || 'Şəhərdaxili ticarət və ərzaq təchizatı',
    grossWeightTons: Number(Math.max(1, params.grossWeightTons).toFixed(1)),
    entryCheckpointName:
      params.entryCheckpointName.trim() ||
      'Şimal Girişi — Bakı-Sumqayıt km 14 (Ekologiya DYP Postu)',
    authorizedCorridor:
      params.authorizedCorridor.trim() ||
      'Moskva pr. → Ziya Bünyadov pr. → Babək pr. Anbar Terminalı',
    validTimeWindow: params.validTimeWindow.trim() || 'Xüsusi Gündüz Pəncərəsi (10:00 – 16:00) & Gecə (22:00 – 07:00)',
    issuedAt: now.toISOString().slice(0, 10),
    expiresAt: expires.toISOString().slice(0, 10),
    qrSecurityHash: `AZ-AYNA-EB-${serial}-${cleanId.slice(0, 4)}`,
    status: 'ACTIVE_VERIFIED',
  };
}

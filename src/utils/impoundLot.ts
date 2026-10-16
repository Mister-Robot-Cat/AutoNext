import { Currency, Vehicle } from '../types/vehicle';

export type ImpoundVehicleWeightClass =
  | 'passenger_under_3_5t'
  | 'medium_3_5_to_10t'
  | 'heavy_over_10t';

export type ImpoundViolationCode =
  | 'ixm_346_2_obstruction'
  | 'ixm_346_4_disabled_spot'
  | 'ixm_346_1_standard_parking'
  | 'ixm_150_11_debt_arrest'
  | 'ixm_333_intoxication'
  | 'ixm_332_no_license_or_poa'
  | 'accident_investigation';

export type ImpoundLotStatus =
  | 'active_impounded'
  | 'released'
  | 'clear_not_impounded';

export interface ImpoundLotInfo {
  id: string;
  code: string;
  name: string;
  authority: 'BDYP (DİN Baş DYPİ)' | 'AYNA (RİNN)';
  city: string;
  district: string;
  address: string;
  phone: string;
  workingHours: string;
  capacityBays: number;
  occupiedBays: number;
  hasAsanPayTerminal: boolean;
  hasOnSiteInspector: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface ImpoundViolationRule {
  code: ImpoundViolationCode;
  articleCitation: string;
  title: string;
  description: string;
  baseFineAzn: number;
  penaltyPoints: number;
  isTowingLegallyPermitted: boolean;
  legalConditionSummary: string;
  canApplyEarlyDiscount: boolean;
}

export interface ImpoundRecord {
  recordId: string;
  plateNumber: string;
  vin: string;
  vehicleTitle: string;
  weightClass: ImpoundVehicleWeightClass;
  status: ImpoundLotStatus;
  violationCode: ImpoundViolationCode;
  protocolSeries: string;
  towTruckPlate: string;
  towedFromAddress: string;
  impoundedAtIso: string;
  hoursImpounded: number;
  lotId: string;
  inspectorName: string;
  inspectorBadge: string;
  sealNumber: string;
  exteriorConditionNotes: string;
}

export interface ImpoundCostInput {
  violationCode: ImpoundViolationCode;
  weightClass: ImpoundVehicleWeightClass;
  hoursImpounded: number;
  applyEarly50Discount: boolean;
  wasTowingUnlawfulOrExonerated?: boolean;
}

export interface ImpoundCostBreakdown {
  violationCode: ImpoundViolationCode;
  articleCitation: string;
  weightClass: ImpoundVehicleWeightClass;
  hoursImpounded: number;
  billableDays: number;
  isWithinFree3HourGrace: boolean;
  baseFineAzn: number;
  discountedFineAzn: number;
  fineSavingsAzn: number;
  towingFeeAzn: number;
  dailyStorageRateAzn: number;
  storageFeeAzn: number;
  asanPayCommissionAzn: number;
  totalPayableAzn: number;
  penaltyPoints: number;
  legalNote: string;
}

export interface TowingLegalityAuditInput {
  violationCode: ImpoundViolationCode;
  driverPresentBeforeMovement: boolean;
  createdTrafficObstruction: boolean;
  parkedInDisabledSpotWithoutPermit: boolean;
  hasProtocolAndSealAct: boolean;
}

export interface TowingLegalityAuditResult {
  isTowingLawful: boolean;
  verdictCode:
    | 'LAWFUL_IMPOUND'
    | 'UNLAWFUL_DRIVER_PRESENT_IXM_96_2'
    | 'UNLAWFUL_NO_OBSTRUCTION_IXM_346_1'
    | 'PROCEDURAL_VIOLATION_NO_ACT';
  verdictTitle: string;
  statutoryBasis: string;
  explanation: string;
  recommendedAction: string;
  exemptFromTowingAndStorageFees: boolean;
  hotlineNumber: string;
}

export interface ImpoundReleasePass {
  passNumber: string;
  asanPayReceiptCode: string;
  gateBarrierPin: string;
  plateNumber: string;
  vin: string;
  vehicleTitle: string;
  ownerFullName: string;
  ownerFinCode: string;
  lotId: string;
  lotName: string;
  lotAddress: string;
  protocolSeries: string;
  violationArticle: string;
  totalPaidAzn: number;
  finePaidAzn: number;
  towingPaidAzn: number;
  storagePaidAzn: number;
  issuedAt: string;
  validExitUntil: string;
  qrSecurityHash: string;
  status: 'READY_FOR_GATE_EXIT' | 'EXITED';
}

/**
 * Official Tariff Council of the Republic of Azerbaijan (Tarif Şurası)
 * Evacuation / Towing fees to temporary impound lot (AZN)
 */
export const TARIFF_COUNCIL_TOWING_FEES_AZN: Record<ImpoundVehicleWeightClass, number> = {
  passenger_under_3_5t: 20,
  medium_3_5_to_10t: 40,
  heavy_over_10t: 60,
};

/**
 * Official Tariff Council of the Republic of Azerbaijan (Tarif Şurası)
 * Daily 24-hour storage rates at BDYP temporary impound lots (AZN / day)
 */
export const TARIFF_COUNCIL_DAILY_STORAGE_RATES_AZN: Record<ImpoundVehicleWeightClass, number> = {
  passenger_under_3_5t: 1.0,
  medium_3_5_to_10t: 2.0,
  heavy_over_10t: 3.0,
};

/**
 * Under İXM Article 96 & Tariff Council decision, the first 3 hours are free of storage charge.
 */
export const FREE_STORAGE_GRACE_HOURS = 3;

export const IMPOUND_VIOLATION_MAP: Record<
  ImpoundViolationCode,
  {
    articleCitation: string;
    title: string;
    baseFineAzn: number;
    penaltyPoints: number;
    canApplyEarlyDiscount: boolean;
    requiresTowingFee: boolean;
  }
> = {
  ixm_346_2_obstruction: {
    articleCitation: 'İXM Maddə 346.2 & Maddə 96.1',
    title: 'Digər nəqliyyat vasitələrinin və ya piyadaların hərəkətinə maneə yaradan parklanma (2-ci cərgə)',
    baseFineAzn: 40,
    penaltyPoints: 2,
    canApplyEarlyDiscount: true,
    requiresTowingFee: true,
  },
  ixm_346_4_disabled_spot: {
    articleCitation: 'İXM Maddə 346.4 & Maddə 96.1',
    title: 'Əlilliyi olan şəxslərin nəqliyyat vasitələri üçün nəzərdə tutulmuş parklanma yerində qanunsuz saxlama',
    baseFineAzn: 60,
    penaltyPoints: 0,
    canApplyEarlyDiscount: true,
    requiresTowingFee: true,
  },
  ixm_346_1_standard_parking: {
    articleCitation: 'İXM Maddə 346.1 (Maneəsiz dayanma/durma)',
    title: 'Adi dayanma və ya durma qaydalarının pozulması (hərəkətə maneə yaratmadan)',
    baseFineAzn: 20,
    penaltyPoints: 0,
    canApplyEarlyDiscount: true,
    requiresTowingFee: false,
  },
  ixm_150_11_debt_arrest: {
    articleCitation: 'İXM Maddə 150.11 & Maddə 96.1',
    title: '2 aydan artıq ödənilməmiş MMX/radar cərimə borcuna görə saxlanılma ("Həbs" qərarı)',
    baseFineAzn: 80,
    penaltyPoints: 0,
    canApplyEarlyDiscount: false,
    requiresTowingFee: true,
  },
  ixm_333_intoxication: {
    articleCitation: 'İXM Maddə 333.1 & Maddə 96.1',
    title: 'Alkoqol və ya digər sərxoşedici vasitələrin təsiri altında idarəetmədən kənarlaşdırma',
    baseFineAzn: 400,
    penaltyPoints: 5,
    canApplyEarlyDiscount: true,
    requiresTowingFee: true,
  },
  ixm_332_no_license_or_poa: {
    articleCitation: 'İXM Maddə 332.2 & Maddə 96.1',
    title: 'İdarəetmə hüququ (sürücülük vəsiqəsi və ya etibarnamə) olmadan idarəetmə',
    baseFineAzn: 100,
    penaltyPoints: 0,
    canApplyEarlyDiscount: true,
    requiresTowingFee: true,
  },
  accident_investigation: {
    articleCitation: 'İXM Maddə 96.1 (Yol-nəqliyyat hadisəsi ekspertizası)',
    title: 'Yol-nəqliyyat hadisəsi (YNH) üzrə avtotexniki ekspertiza müddətində mühafizə',
    baseFineAzn: 0,
    penaltyPoints: 0,
    canApplyEarlyDiscount: false,
    requiresTowingFee: true,
  },
};

const CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1,
  USD: 1 / 1.7,
  EUR: 1 / 1.85,
};

/**
 * Converts AZN amount to target currency with 2-decimal precision
 */
export function convertImpoundCurrency(amountAzn: number, currency: Currency): number {
  const rate = CURRENCY_RATES[currency] ?? 1;
  return Number((amountAzn * rate).toFixed(2));
}

/**
 * Infers the Tariff Council weight category from a Vehicle object
 */
export function determineWeightClassFromVehicle(vehicle?: Vehicle | null): ImpoundVehicleWeightClass {
  if (!vehicle) return 'passenger_under_3_5t';
  if (vehicle.bodyType === 'minivan' && vehicle.engineVolumeLiters >= 3.0) {
    return 'medium_3_5_to_10t';
  }
  return 'passenger_under_3_5t';
}

/**
 * Calculates billable storage days based on hours impounded.
 * First 3 hours are free (grace period). Beyond 3 hours, each started 24-hour period counts as 1 day.
 */
export function calculateBillableStorageDays(hoursImpounded: number): {
  billableDays: number;
  isWithinFree3HourGrace: boolean;
} {
  const safeHours = Math.max(0, hoursImpounded);
  if (safeHours <= FREE_STORAGE_GRACE_HOURS) {
    return {
      billableDays: 0,
      isWithinFree3HourGrace: true,
    };
  }
  return {
    billableDays: Math.ceil(safeHours / 24),
    isWithinFree3HourGrace: false,
  };
}

/**
 * Calculates complete statutory impound release costs including administrative fine,
 * 50% early payment discount (on fine only), Tariff Council towing fee, and daily storage fee.
 */
export function calculateImpoundReleaseCost(input: ImpoundCostInput): ImpoundCostBreakdown {
  const rule = IMPOUND_VIOLATION_MAP[input.violationCode];
  const safeHours = Math.max(0, input.hoursImpounded);

  if (input.wasTowingUnlawfulOrExonerated) {
    return {
      violationCode: input.violationCode,
      articleCitation: 'İXM Maddə 96.10 (Qanunsuz evakuasiya / Bəraət halı)',
      weightClass: input.weightClass,
      hoursImpounded: safeHours,
      billableDays: 0,
      isWithinFree3HourGrace: true,
      baseFineAzn: 0,
      discountedFineAzn: 0,
      fineSavingsAzn: rule.baseFineAzn,
      towingFeeAzn: 0,
      dailyStorageRateAzn: TARIFF_COUNCIL_DAILY_STORAGE_RATES_AZN[input.weightClass],
      storageFeeAzn: 0,
      asanPayCommissionAzn: 0,
      totalPayableAzn: 0,
      penaltyPoints: 0,
      legalNote:
        'İXM Maddə 96.10-a əsasən, inzibati xəta haqqında iş üzrə icraata xitam verildikdə və ya evakuasiya qanunsuz olduqda daşınma və duracaqda saxlanma haqqı sürücüdən tutulmur.',
    };
  }

  const baseFineAzn = rule.baseFineAzn;
  const canDiscount = rule.canApplyEarlyDiscount && input.applyEarly50Discount && baseFineAzn > 0;
  const discountedFineAzn = canDiscount ? Number((baseFineAzn * 0.5).toFixed(2)) : baseFineAzn;
  const fineSavingsAzn = Number((baseFineAzn - discountedFineAzn).toFixed(2));

  const towingFeeAzn = rule.requiresTowingFee
    ? TARIFF_COUNCIL_TOWING_FEES_AZN[input.weightClass]
    : 0;

  const { billableDays, isWithinFree3HourGrace } = calculateBillableStorageDays(safeHours);
  const dailyStorageRateAzn = TARIFF_COUNCIL_DAILY_STORAGE_RATES_AZN[input.weightClass];
  const storageFeeAzn = rule.requiresTowingFee
    ? Number((billableDays * dailyStorageRateAzn).toFixed(2))
    : 0;

  const subtotal = discountedFineAzn + towingFeeAzn + storageFeeAzn;
  const asanPayCommissionAzn = subtotal > 0 ? 0.5 : 0;
  const totalPayableAzn = Number((subtotal + asanPayCommissionAzn).toFixed(2));

  const legalNote = !rule.requiresTowingFee
    ? 'İXM Maddə 346.1 üzrə digər hərəkət iştirakçılarına maneə yaradılmadığı halda avtomobilin evakuasiya edilməsi qadağandır — yalnız 20 AZN (güzəştlə 10 AZN) cərimə tətbiq edilir.'
    : isWithinFree3HourGrace
    ? 'İlk 3 saat güzəşt müddəti daxilində olduğu üçün günlük saxlanma haqqı (0 AZN) hesablanmır. 50% güzəşt yalnız inzibati cəriməyə tətbiq olunur.'
    : `Tarif Şurasının qərarına əsasən ${towingFeeAzn} AZN təxliyə haqqı və ${billableDays} sutka üzrə ${storageFeeAzn.toFixed(2)} AZN saxlanma haqqı hesablanmışdır.`;

  return {
    violationCode: input.violationCode,
    articleCitation: rule.articleCitation,
    weightClass: input.weightClass,
    hoursImpounded: safeHours,
    billableDays,
    isWithinFree3HourGrace,
    baseFineAzn,
    discountedFineAzn,
    fineSavingsAzn,
    towingFeeAzn,
    dailyStorageRateAzn,
    storageFeeAzn,
    asanPayCommissionAzn,
    totalPayableAzn,
    penaltyPoints: rule.penaltyPoints,
    legalNote,
  };
}

/**
 * Evaluates whether a municipal or police vehicle towing action is lawful under
 * Article 96 and Article 346 of the Code of Administrative Offences of Azerbaijan (İXM).
 */
export function auditTowingLegality(input: TowingLegalityAuditInput): TowingLegalityAuditResult {
  const isParkingRelated =
    input.violationCode === 'ixm_346_1_standard_parking' ||
    input.violationCode === 'ixm_346_2_obstruction' ||
    input.violationCode === 'ixm_346_4_disabled_spot';

  // Rule 1: İXM Article 96.2 — If the driver arrives before the tow truck starts moving,
  // and can immediately eliminate the parking violation, the car MUST be returned on the spot.
  if (isParkingRelated && input.driverPresentBeforeMovement) {
    return {
      isTowingLawful: false,
      verdictCode: 'UNLAWFUL_DRIVER_PRESENT_IXM_96_2',
      verdictTitle: 'QANUNSUZ EVAKUASİYA — Sürücü yerindədir (İXM Maddə 96.2)',
      statutoryBasis: 'Azərbaycan Respublikası İnzibati Xətalar Məcəlləsi, Maddə 96.2',
      explanation:
        'İXM Maddə 96.2-yə əsasən, nəqliyyat vasitəsini aparan evakuator hərəkətə başlamazdan əvvəl sürücü yaxınlaşdıqda və dayanma/durma qaydasının pozulması səbəbini dərhal aradan qaldırdıqda, avtomobil dərhal sahibinə qaytarılmalıdır.',
      recommendedAction:
        'Evakuatorun hərəkətə başlamadığını foto/video ilə qeydə alın, DİN 902 və ya 102 Qaynar Xəttinə dərhal müraciət edin. Yalnız inzibati cərimə protokolu yazıla bilər, 20 AZN evakuasiya haqqı tələb edilə bilməz.',
      exemptFromTowingAndStorageFees: true,
      hotlineNumber: '902 (DİN Baş DYPİ) / 102 (Polis)',
    };
  }

  // Rule 2: İXM Article 346.1 & 96.1 — Standard illegal parking that does NOT obstruct traffic
  // and is NOT in a disabled parking bay cannot be towed (only photo/electronic fine is allowed).
  if (
    isParkingRelated &&
    !input.createdTrafficObstruction &&
    !input.parkedInDisabledSpotWithoutPermit
  ) {
    return {
      isTowingLawful: false,
      verdictCode: 'UNLAWFUL_NO_OBSTRUCTION_IXM_346_1',
      verdictTitle: 'QANUNSUZ EVAKUASİYA — Hərəkətə maneə yoxdur (İXM Maddə 346.1)',
      statutoryBasis: 'İXM Maddə 96.1 və Maddə 346.1',
      explanation:
        'Avtomobil digər nəqliyyat vasitələrinin və ya piyadaların hərəkətinə real maneə yaratmırsa (2-ci cərgədə deyilsə, giriş-çıxışı bağlamırsa) və əlillər üçün yer deyilsə, onun cərimə meydançasına aparılması qanunsuzdur. Bu halda yalnız 20 AZN elektron protokol tərtib edilməlidir.',
      recommendedAction:
        'BDYP Şikayət Komissiyasına və ya AYNA 141 xəttinə müraciət edərək 20 AZN təxliyə haqqının ləğvini tələb edin.',
      exemptFromTowingAndStorageFees: true,
      hotlineNumber: '902 (DİN Baş DYPİ) / 141 (AYNA)',
    };
  }

  // Rule 3: Procedural violation — Towing without formal protocol and tamper seal act
  if (!input.hasProtocolAndSealAct) {
    return {
      isTowingLawful: false,
      verdictCode: 'PROCEDURAL_VIOLATION_NO_ACT',
      verdictTitle: 'PROSESSUAL POZUNTU — Təhvil-təslim aktı və ya plomb yoxdur (İXM Maddə 96.3)',
      statutoryBasis: 'İXM Maddə 96.3 və Maddə 96.4',
      explanation:
        'Nəqliyyat vasitəsi duracağa göndərilərkən mütləq iki nüsxədə akt tərtib edilməli, qapı və yük yeri plomblanmalı və xarici zədələr aktda qeyd olunmalıdır.',
      recommendedAction:
        'Avtomobili duracaqdan təhvil alarkən xarici görünüşü yoxlayın və akt tərtib edilməməsi barədə DİN 902 xəttinə rəsmi şikayət bildirin.',
      exemptFromTowingAndStorageFees: false,
      hotlineNumber: '902 (DİN Baş DYPİ)',
    };
  }

  return {
    isTowingLawful: true,
    verdictCode: 'LAWFUL_IMPOUND',
    verdictTitle: 'QANUNİ TƏXLİYƏ — İXM Maddə 96.1 tələblərinə uyğundur',
    statutoryBasis: IMPOUND_VIOLATION_MAP[input.violationCode].articleCitation,
    explanation:
      'Qeyd olunan hallar (hərəkətə maneə yaratma, əlillər üçün yerin tutulması, sərxoşluq və ya həbs qərarı) İXM Maddə 96.1-də birbaşa təxliyə əsası kimi təsbit edilmişdir.',
    recommendedAction:
      'AsanPay və ya HÖP üzərindən cərimə və təxliyə rüsumunu ödəyərək elektron buraxılış qəbzini ("E-Buraxılış") əldə edin.',
    exemptFromTowingAndStorageFees: false,
    hotlineNumber: '902 (DİN Baş DYPİ)',
  };
}

/**
 * Validates Azerbaijani 7-character alphanumeric Personal Identification Code (FİN)
 */
export function validateReleaseFinCode(fin: string): boolean {
  const cleaned = fin.trim().toUpperCase();
  return /^[A-Z0-9]{7}$/.test(cleaned);
}

/**
 * Generates an official BDYP / AsanPay Electronic Impound Release Authorization Pass
 */
export function generateImpoundReleasePass(params: {
  plateNumber: string;
  vin: string;
  vehicleTitle: string;
  ownerFullName: string;
  ownerFinCode: string;
  lot: ImpoundLotInfo;
  protocolSeries: string;
  costBreakdown: ImpoundCostBreakdown;
  issuedDate?: Date;
}): ImpoundReleasePass {
  const now = params.issuedDate ?? new Date('2026-10-16T12:00:00Z');
  const exitDeadline = new Date(now.getTime() + FREE_STORAGE_GRACE_HOURS * 60 * 60 * 1000);

  const cleanPlate = params.plateNumber.trim().toUpperCase() || '99-AA-001';
  const cleanFin = params.ownerFinCode.trim().toUpperCase() || '4AZ91K2';
  const seed = (cleanPlate + cleanFin + params.protocolSeries)
    .split('')
    .reduce((acc, ch, idx) => acc + ch.charCodeAt(0) * (idx + 5), 10000);

  const numericSerial = String(10000 + (seed % 89999));
  const pinCode = String(100000 + ((seed * 7) % 899999));

  return {
    passNumber: `BDYP-CM-2026-${numericSerial}`,
    asanPayReceiptCode: `AP-CM-2026-${numericSerial}`,
    gateBarrierPin: pinCode,
    plateNumber: cleanPlate,
    vin: params.vin.trim().toUpperCase() || 'JTDBR32E800192841',
    vehicleTitle: params.vehicleTitle.trim() || 'Nəqliyyat Vasitəsi',
    ownerFullName: params.ownerFullName.trim() || 'Əliyev Kamran Rəşid oğlu',
    ownerFinCode: cleanFin,
    lotId: params.lot.id,
    lotName: params.lot.name,
    lotAddress: params.lot.address,
    protocolSeries: params.protocolSeries.trim().toUpperCase() || 'İXP-9024185',
    violationArticle: params.costBreakdown.articleCitation,
    totalPaidAzn: params.costBreakdown.totalPayableAzn,
    finePaidAzn: params.costBreakdown.discountedFineAzn,
    towingPaidAzn: params.costBreakdown.towingFeeAzn,
    storagePaidAzn: params.costBreakdown.storageFeeAzn,
    issuedAt: now.toISOString().slice(0, 16).replace('T', ' '),
    validExitUntil: exitDeadline.toISOString().slice(0, 16).replace('T', ' '),
    qrSecurityHash: `AZ-BDYP-CM-${numericSerial}-${cleanFin.slice(0, 4)}`,
    status: 'READY_FOR_GATE_EXIT',
  };
}

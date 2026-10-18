import { Currency } from '../types/vehicle';
import {
  DriverFatigueLevelId,
  TachographConditionId,
  PassengerFreightRuleId,
  TACHOGRAPH_CONDITION_PROFILES,
  PASSENGER_FREIGHT_VIOLATION_PROFILES,
  TACHOGRAPH_SERVICE_PACKAGES,
  SAMPLE_TACHOGRAPH_CERTIFICATES,
  TachographComplianceCertificate,
} from '../data/mockTachographData';

export interface DriverWorkRestInput {
  continuousDrivingHours: number; // Statutory max: 4.5 hours without 45-min break (15m + 30m split allowed)
  breakTakenMinutes: number; // Statutory min after 4.5h: 45 minutes
  dailyDrivingHours: number; // Statutory standard max: 9.0h (up to 10.0h max twice a week)
  extendedDaysUsedThisWeek: number; // Max 2 days per week allowed between 9.0h and 10.0h
  dailyRestHours: number; // Standard min: 11.0h (reduced min: 9.0h)
  weeklyDrivingHours: number; // Max 56 hours single week
  biweeklyDrivingHours: number; // Max 90 hours across two consecutive weeks
  isDoubleCrewMultiManning: boolean; // 2 drivers on board allows 9h rest within 30h window
}

export interface DriverWorkRestResult {
  isCompliant: boolean;
  fatigueLevel: DriverFatigueLevelId;
  exceedsContinuous4h30Limit: boolean;
  exceedsDailyDrivingLimit: boolean;
  exceedsWeekly56hOr90hLimit: boolean;
  insufficientDailyRest: boolean;
  remainingContinuousMinutes: number;
  remainingDailyDrivingHours: number;
  driverFineAzn: number; // IXM Art. 326-1 / 327: 50 - 100 AZN
  officialEntityFineAzn: number; // IXM Art. 348: 300 - 1500 AZN
  discountedDriverFineAzn: number;
  legalArticlesTriggered: string[];
  violationsAz: string[];
  recommendationsAz: string[];
  verdictBadgeAz: string;
}

export interface TachographHardwareAuditInput {
  vehicleCategory: 'M1_private' | 'M2_minibus' | 'M3_coach' | 'N2_medium_truck' | 'N3_heavy_tir';
  conditionProfile: TachographConditionId;
  monthsSinceLastCalibration: number; // Statutory max: 24 months
  tireSizeChangedSinceCalibration: boolean; // Changing tire circumference invalidates W/L calibration
  speedLimiterSetKmh: number; // Statutory speed limiter: M2/M3 <= 100 km/h, N2/N3 <= 90 km/h
}

export interface TachographHardwareAuditResult {
  requiresTachographByLaw: boolean;
  isCompliant: boolean;
  calibrationExpired: boolean;
  speedLimiterNonCompliant: boolean;
  magneticTamperingDetected: boolean;
  prohibitsDispatch: boolean;
  driverFineAzn: number;
  officialFineAzn: number;
  legalEntityFineAzn: number;
  legalArticlesTriggered: string[];
  violationsAz: string[];
  recommendationsAz: string[];
  verdictTitleAz: string;
}

export interface PassengerFreightManifestInput {
  ruleProfile: PassengerFreightRuleId;
  seatedPassengerCapacity: number; // Texpasport seated capacity (e.g. 18 or 49)
  actualPassengersOnBoard: number;
  isIntercityOrMountainRoute: boolean;
  hasElectronicUgurWaybill: boolean;
  hasPreTripMedicalAndMechanicStamp: boolean;
}

export interface PassengerFreightManifestResult {
  isCompliant: boolean;
  excessPassengerCount: number;
  standingPassengersProhibited: boolean;
  waybillOrMedicalMissing: boolean;
  prohibitsOperationImmediately: boolean;
  driverFineAzn: number;
  officialFineAzn: number;
  legalEntityFineAzn: number;
  legalArticlesTriggered: string[];
  violationsAz: string[];
  recommendationsAz: string[];
  verdictAz: string;
}

export interface TachographServiceSummary {
  selectedPackageIds: string[];
  stateDutyAndPartsAzn: number;
  laborCostAzn: number;
  totalAzn: number;
  totalInCurrency: number;
  currency: Currency;
  totalDurationMinutes: number;
  finesAvoidedAzn: number;
}

const CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1,
  USD: 1 / 1.7,
  EUR: 1 / 1.85,
};

export function convertFromAzn(amountAzn: number, currency: Currency): number {
  const rate = CURRENCY_RATES[currency] ?? 1;
  return Math.round(amountAzn * rate * 100) / 100;
}

/**
 * Evaluates Driver Work & Rest Regime compliance under Cabinet of Ministers
 * Decision No. 73, International AETR Convention, and IXM Article 326-1.
 */
export function evaluateDriverWorkRestRegime(
  input: DriverWorkRestInput
): DriverWorkRestResult {
  const violationsAz: string[] = [];
  const recommendationsAz: string[] = [];
  const legalArticlesTriggered: string[] = [
    'AR NK Qərar № 73 (Sürücülərin iş və istirahət rejimi)',
    'AETR Beynəlxalq Konvensiyası Maddə 6–8',
  ];

  // 1. Continuous 4.5-hour rule unless 45-min break taken
  const exceedsContinuous4h30Limit =
    input.continuousDrivingHours > 4.5 && input.breakTakenMinutes < 45;

  // 2. Daily driving limit: 9.0h standard, or up to 10.0h if extendedDaysUsedThisWeek <= 2
  const allowedDailyMax = input.extendedDaysUsedThisWeek <= 2 ? 10.0 : 9.0;
  const exceedsDailyDrivingLimit =
    input.dailyDrivingHours > allowedDailyMax ||
    (input.dailyDrivingHours > 9.0 && input.extendedDaysUsedThisWeek > 2);

  // 3. Weekly 56h and biweekly 90h limits
  const exceedsWeekly56hOr90hLimit =
    input.weeklyDrivingHours > 56 || input.biweeklyDrivingHours > 90;

  // 4. Daily rest minimum: 9.0h reduced minimum (standard 11.0h)
  const minRequiredRest = 9.0;
  const insufficientDailyRest = input.dailyRestHours < minRequiredRest;

  let driverFineAzn = 0;
  let officialEntityFineAzn = 0;

  if (exceedsContinuous4h30Limit) {
    driverFineAzn = Math.max(driverFineAzn, 80);
    officialEntityFineAzn = Math.max(officialEntityFineAzn, 300);
    legalArticlesTriggered.push('İXM Maddə 326-1 (Fasiləsiz 4.5 saat sürüş həddinin aşılması)');
    violationsAz.push(
      `Fasiləsiz idarəetmə müddəti ${input.continuousDrivingHours.toFixed(
        1
      )} saata çatıb (norma: maks. 4.5 saat), lakin tələb olunan 45 dəqiqəlik (və ya 15+30 dəq) fasilə verilməyib (${
        input.breakTakenMinutes
      } dəq).`
    );
    recommendationsAz.push(
      'Rəqəmsal taxoqrafı «İstirahət (çarpayı)» rejiminə keçirərək ən azı 45 dəqiqə tam fasilə verin.'
    );
  }

  if (exceedsDailyDrivingLimit) {
    driverFineAzn = Math.max(driverFineAzn, 100);
    officialEntityFineAzn = Math.max(officialEntityFineAzn, 400);
    legalArticlesTriggered.push('İXM Maddə 326-1 (Gündəlik 9/10 saatlıq idarəetmə normasının aşılması)');
    violationsAz.push(
      `Gündəlik ümumi idarəetmə müddəti ${input.dailyDrivingHours.toFixed(
        1
      )} saat təşkil edir (icazə verilən hədd: 9.0 saat, həftədə maks. 2 dəfə 10.0 saat).`
    );
    recommendationsAz.push(
      'Sutkalıq idarəetmə limitini aşmamaq üçün növbəti 9–11 saatlıq sutkalıq istirahət dayanacağına daxil olun.'
    );
  }

  if (exceedsWeekly56hOr90hLimit) {
    driverFineAzn = Math.max(driverFineAzn, 100);
    officialEntityFineAzn = Math.max(officialEntityFineAzn, 500);
    legalArticlesTriggered.push('AETR Maddə 6.2 &6.3 (Həftəlik 56 saat / 2 həftəlik 90 saat norması)');
    violationsAz.push(
      `Həftəlik (${input.weeklyDrivingHours} s / maks. 56 s) və ya iki ardıcıl həftəlik (${input.biweeklyDrivingHours} s / maks. 90 s) sürüş limiti aşılıb.`
    );
    recommendationsAz.push(
      '45 saatlıq müntəzəm həftəlik istirahət dövrünü tamamlayın və ya marşrutu ehtiyat sürücüyə təhvil verin.'
    );
  }

  if (insufficientDailyRest) {
    driverFineAzn = Math.max(driverFineAzn, 100);
    officialEntityFineAzn = Math.max(officialEntityFineAzn, 400);
    legalArticlesTriggered.push('NK Qərar № 73 (Sutkalıq minimum 9–11 saat istirahət tələbi)');
    violationsAz.push(
      `Sutkalıq fasiləsiz istirahət müddəti cəmi ${input.dailyRestHours.toFixed(
        1
      )} saatdır (minimum qısaldılmış norma: 9.0 saat, standart norma: 11.0 saat).`
    );
    recommendationsAz.push(
      'Sürücü yorğunluğu səbəbilə ağır yol-nəqliyyat hadisəsi riskinin qarşısını almaq üçün sutkalıq istirahəti ən azı 9–11 saata çatdırın.'
    );
  }

  const isCompliant =
    !exceedsContinuous4h30Limit &&
    !exceedsDailyDrivingLimit &&
    !exceedsWeekly56hOr90hLimit &&
    !insufficientDailyRest;

  let fatigueLevel: DriverFatigueLevelId = 'normal_within_4h30';
  if (exceedsWeekly56hOr90hLimit || insufficientDailyRest) {
    fatigueLevel = 'weekly_or_rest_deficit';
  } else if (exceedsDailyDrivingLimit) {
    fatigueLevel = 'exceeds_daily_9h_limit';
  } else if (exceedsContinuous4h30Limit) {
    fatigueLevel = 'needs_45min_break';
  } else if (input.dailyDrivingHours > 9.0) {
    fatigueLevel = 'within_extended_10h_daily';
  }

  if (isCompliant) {
    recommendationsAz.push(
      input.isDoubleCrewMultiManning
        ? 'Qoşa heyət (2 sürücü / Multi-manning) rejimi aktivdir — 30 saatlıq pəncərədə hər sürücü üçün 9 saat istirahət norması tam ödənilir.'
        : 'Sürücünün fasiləsiz (≤4.5 s), gündəlik (≤9/10 s) və həftəlik (≤56 s) iş-istirahət rejimi NK Qərar № 73 və AETR normalarına tam uyğundur.'
    );
  }

  const remainingContinuousMinutes =
    input.breakTakenMinutes >= 45
      ? 270
      : Math.max(0, Math.round((4.5 - input.continuousDrivingHours) * 60));

  const remainingDailyDrivingHours = Math.max(
    0,
    Math.round((allowedDailyMax - input.dailyDrivingHours) * 10) / 10
  );

  let verdictBadgeAz = 'AETR & NK №73 — İş-İstirahət Rejimi Qanunidir';
  if (!isCompliant) {
    verdictBadgeAz = `Sürücü Yorğunluğu / Rejim Pozuntusu (İXM 326-1: ${driverFineAzn} ₼)`;
  } else if (fatigueLevel === 'within_extended_10h_daily') {
    verdictBadgeAz = 'Həftəlik Uzadılmış 10 Saatlıq Norma Aktivdir (Qanuni)';
  }

  return {
    isCompliant,
    fatigueLevel,
    exceedsContinuous4h30Limit,
    exceedsDailyDrivingLimit,
    exceedsWeekly56hOr90hLimit,
    insufficientDailyRest,
    remainingContinuousMinutes,
    remainingDailyDrivingHours,
    driverFineAzn,
    officialEntityFineAzn,
    discountedDriverFineAzn: Math.round(driverFineAzn * 0.5),
    legalArticlesTriggered,
    violationsAz,
    recommendationsAz,
    verdictBadgeAz,
  };
}

/**
 * Evaluates Digital Tachograph seal, 24-month calibration, driver chip card,
 * and speed limiter compliance under YHQ Annex 1 Clause 7.4 and IXM 326-1.
 */
export function evaluateTachographHardwareCompliance(
  input: TachographHardwareAuditInput
): TachographHardwareAuditResult {
  const profile =
    TACHOGRAPH_CONDITION_PROFILES.find((p) => p.id === input.conditionProfile) ||
    TACHOGRAPH_CONDITION_PROFILES[0];

  const violationsAz: string[] = [];
  const recommendationsAz: string[] = [];
  const legalArticlesTriggered: string[] = [profile.legalBasisAz];

  const requiresTachographByLaw = input.vehicleCategory !== 'M1_private';

  if (!requiresTachographByLaw) {
    recommendationsAz.push(
      'M1 kateqoriyalı şəxsi minik avtomobillərində (≤8 oturacaq yeri) rəqəmsal taxoqraf quraşdırılması məcburi deyil.'
    );
    return {
      requiresTachographByLaw: false,
      isCompliant: true,
      calibrationExpired: false,
      speedLimiterNonCompliant: false,
      magneticTamperingDetected: false,
      prohibitsDispatch: false,
      driverFineAzn: 0,
      officialFineAzn: 0,
      legalEntityFineAzn: 0,
      legalArticlesTriggered: ['YHQ Əlavə 1 Bənd 7.4 (M1 şəxsi minik istisnası)'],
      violationsAz: [],
      recommendationsAz,
      verdictTitleAz: 'M1 Şəxsi Minik — Taxoqraf Tələb Olunmur (Azaddır)',
    };
  }

  const calibrationExpired =
    input.conditionProfile === 'expired_2yr_calibration' ||
    input.monthsSinceLastCalibration > 24 ||
    input.tireSizeChangedSinceCalibration;

  const maxSpeedLimiterAllowed =
    input.vehicleCategory === 'M2_minibus' || input.vehicleCategory === 'M3_coach'
      ? 100
      : 90; // N2 / N3 trucks max 90 km/h speed limiter

  const speedLimiterNonCompliant = input.speedLimiterSetKmh > maxSpeedLimiterAllowed;
  const magneticTamperingDetected =
    input.conditionProfile === 'magnetic_impulse_sensor_bypass';

  let driverFineAzn = profile.driverFineAzn;
  let officialFineAzn = profile.officialFineAzn;
  let legalEntityFineAzn = profile.legalEntityFineAzn;
  let prohibitsDispatch = profile.prohibitsDispatch;

  if (!profile.isCompliant) {
    violationsAz.push(profile.descriptionAz);
  }

  if (calibrationExpired && profile.isCompliant) {
    driverFineAzn = Math.max(driverFineAzn, 80);
    officialFineAzn = Math.max(officialFineAzn, 250);
    legalEntityFineAzn = Math.max(legalEntityFineAzn, 1000);
    prohibitsDispatch = true;
    legalArticlesTriggered.push('YHQ Əlavə 1 Bənd 7.4 (24 aylıq metroloji kalibrasiya tələbi)');
    violationsAz.push(
      input.tireSizeChangedSinceCalibration
        ? 'Avtomobilin şin ölçüsü dəyişdirildiyi üçün taxoqrafın L (təkər çevrəsi) və W (impuls) əmsalları pozulub — təkrar kalibrasiya mütləqdir.'
        : `Sonuncu metroloji kalibrasiyadan ${input.monthsSinceLastCalibration} ay keçib (qanuni müddət: maks. 24 ay).`
    );
  }

  if (speedLimiterNonCompliant) {
    driverFineAzn = Math.max(driverFineAzn, 80);
    officialFineAzn = Math.max(officialFineAzn, 250);
    legalEntityFineAzn = Math.max(legalEntityFineAzn, 1000);
    prohibitsDispatch = true;
    legalArticlesTriggered.push('UNECE R89 & YHQ Əlavə 1 (Sürət məhdudlaşdırıcı cihaz norması)');
    violationsAz.push(
      `Sürət məhdudlaşdırıcı (Speed Limiter) ${input.speedLimiterSetKmh} km/saat-a tənzimlənib (${
        input.vehicleCategory.startsWith('M') ? 'M2/M3 avtobuslar üçün maks. 100 km/s' : 'N2/N3 yük maşınları üçün maks. 90 km/s'
      } olmalıdır).`
    );
  }

  const isCompliant =
    profile.isCompliant && !calibrationExpired && !speedLimiterNonCompliant;

  if (!isCompliant) {
    recommendationsAz.push(
      'Reysə çıxmazdan əvvəl akkreditə olunmuş AZS/AYNA taxoqraf mərkəzində KITAS plombunu bərpa edin, 24 aylıq kalibrasiya etiketini yeniləyin və fərdi sürücü çip-kartını yuvasına daxil edin.'
    );
  } else {
    recommendationsAz.push(
      'Rəqəmsal taxoqraf plombu, 24 aylıq metroloji kalibrasiya və sürət məhdudlaşdırıcı YHQ Əlavə 1 Bənd 7.4 və AETR standartlarına tam cavab verir.'
    );
  }

  let verdictTitleAz = 'Taxoqraf Plombu & Kalibrasiya Tam Sazdır';
  if (magneticTamperingDetected) {
    verdictTitleAz = 'KRİTİK: Maqnit / Sensor Saxtakarlığı (İXM 326-1 / 342.2-1)';
  } else if (!isCompliant) {
    verdictTitleAz = `Taxoqraf / Kalibrasiya Pozuntusu (Cərimə: ${driverFineAzn}–${officialFineAzn} ₼)`;
  }

  return {
    requiresTachographByLaw: true,
    isCompliant,
    calibrationExpired,
    speedLimiterNonCompliant,
    magneticTamperingDetected,
    prohibitsDispatch,
    driverFineAzn,
    officialFineAzn,
    legalEntityFineAzn,
    legalArticlesTriggered,
    violationsAz,
    recommendationsAz,
    verdictTitleAz,
  };
}

/**
 * Evaluates Passenger & Freight Manifest compliance (seated capacity, AYNA E-Ugur
 * electronic waybill, and pre-trip medical/mechanic stamps) under YHQ Art. 56-57 & IXM 326/348.
 */
export function evaluatePassengerFreightManifest(
  input: PassengerFreightManifestInput
): PassengerFreightManifestResult {
  const profile =
    PASSENGER_FREIGHT_VIOLATION_PROFILES.find((p) => p.id === input.ruleProfile) ||
    PASSENGER_FREIGHT_VIOLATION_PROFILES[0];

  const violationsAz: string[] = [];
  const recommendationsAz: string[] = [];
  const legalArticlesTriggered: string[] = [profile.legalBasisAz];

  const excessPassengerCount = Math.max(
    0,
    input.actualPassengersOnBoard - input.seatedPassengerCapacity
  );

  const standingPassengersProhibited =
    (excessPassengerCount > 0 && input.isIntercityOrMountainRoute) ||
    input.ruleProfile === 'standing_intercity_passengers';

  const waybillOrMedicalMissing =
    !input.hasElectronicUgurWaybill ||
    !input.hasPreTripMedicalAndMechanicStamp ||
    input.ruleProfile === 'missing_electronic_ugl_waybill' ||
    input.ruleProfile === 'missing_pre_trip_medical_stamp';

  let driverFineAzn = profile.driverFineAzn;
  let officialFineAzn = profile.officialFineAzn;
  let legalEntityFineAzn = profile.legalEntityFineAzn;
  let prohibitsOperationImmediately = profile.prohibitsOperation;

  if (!profile.isCompliant) {
    violationsAz.push(profile.descriptionAz);
  }

  if (excessPassengerCount > 0) {
    driverFineAzn = Math.max(driverFineAzn, 100);
    officialFineAzn = Math.max(officialFineAzn, 300);
    legalEntityFineAzn = Math.max(legalEntityFineAzn, 1000);
    prohibitsOperationImmediately = true;
    legalArticlesTriggered.push('YHQ Maddə 56 & İXM Maddə 326 / 327.2');
    violationsAz.push(
      `Texpasport üzrə oturacaq tutumu ${input.seatedPassengerCapacity} nəfər olduğu halda salonda ${input.actualPassengersOnBoard} sərnişin (+${excessPassengerCount} normadan artıq / ayaqüstə) aşkarlanıb.`
    );
  }

  if (!input.hasElectronicUgurWaybill && input.ruleProfile === 'compliant_manifest_and_route') {
    driverFineAzn = Math.max(driverFineAzn, 100);
    officialFineAzn = Math.max(officialFineAzn, 300);
    legalEntityFineAzn = Math.max(legalEntityFineAzn, 1200);
    prohibitsOperationImmediately = true;
    legalArticlesTriggered.push('İXM Maddə 326.1 (AYNA Elektron Yol Vərəqəsi olmadan daşıma)');
    violationsAz.push(
      'AYNA «E-Uğur» informasiya sistemində aktiv elektron yol vərəqəsi (və ya yük qaiməsi) qeydiyyata alınmayıb.'
    );
  }

  if (
    !input.hasPreTripMedicalAndMechanicStamp &&
    input.ruleProfile === 'compliant_manifest_and_route'
  ) {
    driverFineAzn = Math.max(driverFineAzn, 100);
    officialFineAzn = Math.max(officialFineAzn, 400);
    legalEntityFineAzn = Math.max(legalEntityFineAzn, 1500);
    prohibitsOperationImmediately = true;
    legalArticlesTriggered.push('İXM Maddə 348 (Reysöncəsi tibbi və texniki müayinə olmadan xəttə buraxma)');
    violationsAz.push(
      'Sürücünün reysöncəsi tibbi müayinəsi (alkotester/arterial təzyiq) və nəqliyyat vasitəsinin mexanik baxış möhürü yoxdur.'
    );
  }

  const isCompliant =
    profile.isCompliant &&
    excessPassengerCount === 0 &&
    input.hasElectronicUgurWaybill &&
    input.hasPreTripMedicalAndMechanicStamp;

  if (!isCompliant) {
    recommendationsAz.push(
      'Reysə çıxmazdan əvvəl AYNA «E-Uğur» portalında elektron yol vərəqəsini aktivləşdirin, reysöncəsi tibbi/mexanik yoxlamadan keçin və sərnişin sayını oturacaq normasına uyğunlaşdırın.'
    );
  } else {
    recommendationsAz.push(
      'AYNA Elektron Yol Vərəqəsi («E-Uğur»), reysöncəsi tibbi/texniki müayinə və oturacaq tutumu tam qanunidir.'
    );
  }

  let verdictAz = 'Yol Vərəqəsi, Reysöncəsi Tibbi Müayinə & Sərnişin Norması Qanunidir';
  if (!isCompliant) {
    verdictAz = `Daşıma & Reysöncəsi Nəzarət Pozuntusu (Sürücü: ${driverFineAzn} ₼ / Vəzifəli: ${officialFineAzn} ₼)`;
  }

  return {
    isCompliant,
    excessPassengerCount,
    standingPassengersProhibited,
    waybillOrMedicalMissing,
    prohibitsOperationImmediately,
    driverFineAzn,
    officialFineAzn,
    legalEntityFineAzn,
    legalArticlesTriggered,
    violationsAz,
    recommendationsAz,
    verdictAz,
  };
}

/**
 * Calculates total cost and prevented fines for selected AYNA/AZS tachograph & dispatch packages.
 */
export function calculateTachographServiceSummary(
  selectedPackageIds: string[],
  currency: Currency = 'AZN'
): TachographServiceSummary {
  const selected = TACHOGRAPH_SERVICE_PACKAGES.filter((pkg) =>
    selectedPackageIds.includes(pkg.id)
  );

  const stateDutyAndPartsAzn = selected.reduce(
    (sum, item) => sum + item.stateDutyOrPartsAzn,
    0
  );
  const laborCostAzn = selected.reduce((sum, item) => sum + item.laborCostAzn, 0);
  const totalAzn = stateDutyAndPartsAzn + laborCostAzn;
  const totalDurationMinutes = selected.reduce(
    (sum, item) => sum + item.durationMinutes,
    0
  );
  const finesAvoidedAzn = selected.reduce(
    (sum, item) => sum + item.preventsFineAzn,
    0
  );

  return {
    selectedPackageIds,
    stateDutyAndPartsAzn,
    laborCostAzn,
    totalAzn,
    totalInCurrency: convertFromAzn(totalAzn, currency),
    currency,
    totalDurationMinutes,
    finesAvoidedAzn,
  };
}

export function lookupTachographCertificate(
  query: string
): TachographComplianceCertificate | null {
  const normalized = query.trim().toUpperCase();
  if (!normalized) return null;

  return (
    SAMPLE_TACHOGRAPH_CERTIFICATES.find(
      (cert) =>
        cert.certificateNumber.toUpperCase() === normalized ||
        cert.vehiclePlate.toUpperCase().replace(/[^A-Z0-9]/g, '') ===
          normalized.replace(/[^A-Z0-9]/g, '') ||
        cert.vin.toUpperCase() === normalized ||
        cert.driverCardNumber.toUpperCase() === normalized
    ) || null
  );
}

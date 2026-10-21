import { Currency } from '../types/vehicle';
import {
  SuspensionModId,
  WheelFastenerConditionId,
  SUSPENSION_MODIFICATION_PROFILES,
  WHEEL_FASTENER_PROFILES,
  CHASSIS_SERVICE_PACKAGES,
  SAMPLE_SUSPENSION_CERTIFICATES,
  SuspensionComplianceCertificate,
} from '../data/mockSuspensionChassisData';

export interface EusamaAndPeredokInput {
  frontLeftEusamaPercent: number; // 0 - 100% road adhesion on MAHA FWT-1 stand
  frontRightEusamaPercent: number; // 0 - 100%
  rearLeftEusamaPercent: number; // 0 - 100%
  rearRightEusamaPercent: number; // 0 - 100%
  suspensionModId: SuspensionModId;
  frontArchGapMm: number; // Tire-to-fender arch gap in mm (e.g. OEM 65mm vs Peredok 135mm)
  rearArchGapMm: number; // Tire-to-fender arch gap in mm (e.g. OEM 65mm vs dropped 25mm)
  stabilizerBarIntact: boolean; // YHQ Annex 1 Clause 7.12: anti-roll bar & links intact
  airSuspensionHermetic: boolean; // True if coil springs or healthy air suspension; false if compressor/bag leak
}

export interface EusamaAndPeredokResult {
  isCompliant: boolean;
  frontAvgEusamaPercent: number;
  rearAvgEusamaPercent: number;
  frontAxleImbalancePercent: number;
  rearAxleImbalancePercent: number;
  maxAxleImbalancePercent: number;
  eusamaGrade: 'OPTIMAL' | 'MODERATE_WEAR' | 'CRITICAL_BOUNCE_FAIL';
  hasCriticalShockFailure: boolean; // Any wheel <= 20%
  hasAxleImbalanceFailure: boolean; // Front or rear imbalance > 15%
  frontToRearPitchDeltaMm: number;
  isIllegalPeredokOrCutSprings: boolean;
  prohibitsOperation96: boolean;
  fineAzn: number;
  discountedFineAzn: number;
  legalArticlesTriggered: string[];
  violationsAz: string[];
  recommendationsAz: string[];
  verdictBadgeAz: string;
}

export interface WheelFastenerAnd3dGeometryInput {
  wheelFastenerCondition: WheelFastenerConditionId;
  missingLugBoltsCount: number; // 0 - 8 missing bolts/nuts across 4 wheels (YHQ Annex 1 Clause 5.4)
  hasCrackedOrWeldedRim: boolean; // YHQ Annex 1 Clause 5.5
  frontToeMm: number; // Total front toe ("Sxojdeniya") in mm (norm: -1.5 to +2.5 mm)
  frontCamberDeg: number; // Front camber ("Razval") in deg (norm: -2.0° to +0.5°; < -3.5° is illegal Stance)
  casterLeftRightDeltaDeg: number; // Caster difference between L and R in deg (norm <= 0.5°)
  longeronDiagonalDeltaMm: number; // Celette 3D frame diagonal deviation in mm (norm <= 3.0 mm)
  vehicleMarketPriceAzn: number; // Used to estimate structural frame distortion valuation impact
}

export interface WheelFastenerAnd3dGeometryResult {
  isCompliant: boolean;
  violatesClause54Bolts: boolean;
  violatesClause55RimCrack: boolean;
  isToeOutOfSpec: boolean;
  isCamberOutOfSpec: boolean;
  isExtremeStanceCamber342: boolean;
  isCasterPulling: boolean;
  frameGeometryGrade: 'FACTORY_STRAIGHT' | 'MINOR_POST_CRASH_SHIFT' | 'SEVERE_LONGERON_TWIST';
  estimatedTireWearPenaltyPercent: number; // Extra tire wear % due to bad toe/camber
  valuationImpactAzn: number; // 0 if straight, negative if longeron twisted
  prohibitsOperationImmediately: boolean;
  fineAzn: number;
  discountedFineAzn: number;
  legalArticlesTriggered: string[];
  violationsAz: string[];
  recommendationsAz: string[];
  verdictTitleAz: string;
}

export interface SuspensionServiceCostSummary {
  selectedPackageIds: string[];
  partsCostAzn: number;
  laborCostAzn: number;
  totalAzn: number;
  totalInCurrency: number;
  currency: Currency;
  totalDurationMinutes: number;
  finesAndTireLossAvoidedAzn: number;
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
 * Evaluates MAHA FWT-1 EUSAMA shock absorber road adhesion, axle damping balance,
 * YHQ Annex 1 Clause 7.12 stabilizer bar integrity, and İXM Art. 342.2-1 / 96.1.4
 * "Peredok" / cut coil spring constructive modifications.
 */
export function evaluateEusamaAndPeredokCompliance(
  input: EusamaAndPeredokInput
): EusamaAndPeredokResult {
  const violationsAz: string[] = [];
  const recommendationsAz: string[] = [];
  const legalArticlesTriggered: string[] = [
    'YHQ Əlavə 1, Bölmə VII (Bənd 7.3 və 7.12 — Asqı və Stabilizator Tələbləri)',
  ];

  const fl = Math.max(0, Math.min(100, input.frontLeftEusamaPercent));
  const fr = Math.max(0, Math.min(100, input.frontRightEusamaPercent));
  const rl = Math.max(0, Math.min(100, input.rearLeftEusamaPercent));
  const rr = Math.max(0, Math.min(100, input.rearRightEusamaPercent));

  const frontAvgEusamaPercent = Math.round((fl + fr) / 2);
  const rearAvgEusamaPercent = Math.round((rl + rr) / 2);
  const frontAxleImbalancePercent = Math.abs(fl - fr);
  const rearAxleImbalancePercent = Math.abs(rl - rr);
  const maxAxleImbalancePercent = Math.max(
    frontAxleImbalancePercent,
    rearAxleImbalancePercent
  );

  const minWheelEusama = Math.min(fl, fr, rl, rr);
  const hasCriticalShockFailure = minWheelEusama <= 20;
  const hasAxleImbalanceFailure = maxAxleImbalancePercent > 15;

  let eusamaGrade: EusamaAndPeredokResult['eusamaGrade'] = 'OPTIMAL';
  if (hasCriticalShockFailure || hasAxleImbalanceFailure) {
    eusamaGrade = 'CRITICAL_BOUNCE_FAIL';
  } else if (minWheelEusama < 40) {
    eusamaGrade = 'MODERATE_WEAR';
  }

  const modProfile =
    SUSPENSION_MODIFICATION_PROFILES.find(
      (p) => p.id === input.suspensionModId
    ) ?? SUSPENSION_MODIFICATION_PROFILES[0];

  const frontToRearPitchDeltaMm = Math.abs(
    Math.round(input.frontArchGapMm - input.rearArchGapMm)
  );

  const isIllegalPeredokOrCutSprings =
    modProfile.legalStatus === 'ILLEgal_CONSTRUCTIVE_342_2_1' ||
    frontToRearPitchDeltaMm > 35;

  let fineAzn = modProfile.fineAzn;
  let prohibitsOperation96 = modProfile.prohibitsOperation96;

  if (isIllegalPeredokOrCutSprings) {
    fineAzn = Math.max(fineAzn, 150);
    prohibitsOperation96 = true;
    legalArticlesTriggered.push(
      'İXM Maddə 342.2-1 (Normativ tələbləri pozmaqla avadanlığın quraşdırılması və ya dəyişdirilməsi — 150 ₼)'
    );
    legalArticlesTriggered.push(
      'İXM Maddə 96.1.4 (Konstruktiv dəyişiklik səbəbilə mühafizə olunan duracağa yerləşdirmə)'
    );

    if (frontToRearPitchDeltaMm > 35) {
      violationsAz.push(
        `Ön və arxa ox klirens fərqi («Peredok» disbalansı: ${frontToRearPitchDeltaMm} mm) normativ həddi (≤35 mm) aşır — ağırlıq mərkəzi və yaxın işıq faralarının bucağı pozulub (İXM Maddə 342.2-1: 150 ₼).`
      );
    }
    if (modProfile.legalStatus === 'ILLEgal_CONSTRUCTIVE_342_2_1') {
      violationsAz.push(
        `${modProfile.nameAz} aşkar edildi — ${modProfile.ixmArticle}.`
      );
    }
    recommendationsAz.push(
      'Qanunsuz araqatları («prostafka») və ya kəsilmiş yayları dərhal zavod (OEM) helezon yay dəsti ilə əvəz edin.'
    );
  }

  if (!input.stabilizerBarIntact) {
    fineAzn = Math.max(fineAzn, 50);
    prohibitsOperation96 = true;
    legalArticlesTriggered.push(
      'YHQ Əlavə 1 Bənd 7.12 (Köndələn dayanıqlıq stabilizatorunun nasazlığı və ya çıxarılması)'
    );
    violationsAz.push(
      'Köndələn dayanıqlıq stabilizatoru («stabilizator qolu / sırğası») sıradan çıxıb və ya sökülüb — YHQ Əlavə 1 Bənd 7.12-yə əsasən istismar qadağandır.'
    );
    recommendationsAz.push(
      'Stabilizator dayaqlarını («sırğaları») və rezin oynaqlarını yeniləyərək döngələrdə aşma riskini aradan qaldırın.'
    );
  }

  if (hasCriticalShockFailure) {
    fineAzn = Math.max(fineAzn, 50);
    violationsAz.push(
      `MAHA EUSAMA vibrostendində minimum yol tutumu ${minWheelEusama}% təşkil edir (kritik hədd ≤20%) — amortizator yağ buraxıb və təkər asfaltla təması itirir.`
    );
    recommendationsAz.push(
      'Sıradan çıxmış ox üzrə amortizatorları cüt şəkildə (sol və sağ birlikdə) dəyişdirin.'
    );
  } else if (eusamaGrade === 'MODERATE_WEAR') {
    recommendationsAz.push(
      `Amortizatorların EUSAMA göstəricisi (${minWheelEusama}%) orta aşınma zonasındadır (21–39%) — növbəti 10,000 km ərzində dəyişdirilməsi tövsiyə olunur.`
    );
  }

  if (hasAxleImbalanceFailure) {
    fineAzn = Math.max(fineAzn, 50);
    violationsAz.push(
      `Bir ox üzrə sol və sağ amortizatorlar arasında dempfer disbalansı ${maxAxleImbalancePercent}% təşkil edir (maksimum icazə verilən normativ ≤15%) — kəskin tormozlamada sürüşmə təhlükəsi.`
    );
    recommendationsAz.push(
      'Ox üzrə sol/sağ disbalansı (>15%) aradan qaldırmaq üçün amortizatorları cüt olaraq eyni brendlə yeniləyin.'
    );
  }

  if (!input.airSuspensionHermetic) {
    fineAzn = Math.max(fineAzn, 50);
    violationsAz.push(
      'Pnevmoasqı («pnevma») balonunda və ya klapan blokunda hava sızması aşkar edildi — hərəkət zamanı kuzovun çökməsi təhlükəsi.'
    );
    recommendationsAz.push(
      'Pnevmo-balonların hermetikliyini və kompressor təzyiqini (14–16 bar) bərpa edin.'
    );
  }

  const isCompliant =
    !isIllegalPeredokOrCutSprings &&
    input.stabilizerBarIntact &&
    !hasCriticalShockFailure &&
    !hasAxleImbalanceFailure &&
    input.airSuspensionHermetic;

  if (isCompliant && recommendationsAz.length === 0) {
    recommendationsAz.push(
      'MAHA EUSAMA amortizator balansı, stabilizator bütövlüyü və ön-arxa klirens YHQ Əlavə 1 standartlarına tam uyğundur.'
    );
  }

  const discountedFineAzn = Math.round(fineAzn * 0.5 * 100) / 100;

  let verdictBadgeAz = 'EUSAMA & KLİRENS TAM UYĞUNDUR (YHQ ƏLAVƏ 1)';
  if (prohibitsOperation96) {
    verdictBadgeAz = 'İSTİSMAR QADAĞANDIR (İXM 342.2-1 / 96.1.4 CƏRİMƏ MEYDANÇASI)';
  } else if (!isCompliant) {
    verdictBadgeAz = 'ASQI NASAZLIĞI — TƏMİR TƏLƏB OLUNUR';
  }

  return {
    isCompliant,
    frontAvgEusamaPercent,
    rearAvgEusamaPercent,
    frontAxleImbalancePercent,
    rearAxleImbalancePercent,
    maxAxleImbalancePercent,
    eusamaGrade,
    hasCriticalShockFailure,
    hasAxleImbalanceFailure,
    frontToRearPitchDeltaMm,
    isIllegalPeredokOrCutSprings,
    prohibitsOperation96,
    fineAzn,
    discountedFineAzn,
    legalArticlesTriggered,
    violationsAz,
    recommendationsAz,
    verdictBadgeAz,
  };
}

/**
 * Evaluates YHQ Annex 1 Clauses 5.4 & 5.5 (missing wheel bolts/nuts, cracked or welded rims)
 * and Hunter 3D Laser Chassis Alignment ("Razval-Sxojdeniya") + Celette Frame Longeron Diagonals.
 */
export function evaluateWheelFastenersAnd3dGeometry(
  input: WheelFastenerAnd3dGeometryInput
): WheelFastenerAnd3dGeometryResult {
  const violationsAz: string[] = [];
  const recommendationsAz: string[] = [];
  const legalArticlesTriggered: string[] = [
    'YHQ Əlavə 1, Bölmə V (Bənd 5.4 və 5.5 — Təkər Bərkidiciləri və Disklər)',
  ];

  const fastenerProfile =
    WHEEL_FASTENER_PROFILES.find(
      (p) => p.id === input.wheelFastenerCondition
    ) ?? WHEEL_FASTENER_PROFILES[0];

  const safeMissingBolts = Math.max(0, Math.round(input.missingLugBoltsCount));
  const violatesClause54Bolts =
    safeMissingBolts > 0 || input.wheelFastenerCondition === 'missing_lug_bolt';
  const violatesClause55RimCrack =
    input.hasCrackedOrWeldedRim ||
    input.wheelFastenerCondition === 'cracked_or_welded_rim';

  const isToeOutOfSpec = input.frontToeMm < -1.5 || input.frontToeMm > 2.5;
  const isCamberOutOfSpec =
    input.frontCamberDeg < -2.0 || input.frontCamberDeg > 0.5;
  const isExtremeStanceCamber342 = input.frontCamberDeg < -3.5;
  const isCasterPulling = Math.abs(input.casterLeftRightDeltaDeg) > 0.5;

  const diagDelta = Math.max(0, input.longeronDiagonalDeltaMm);
  let frameGeometryGrade: WheelFastenerAnd3dGeometryResult['frameGeometryGrade'] =
    'FACTORY_STRAIGHT';
  if (diagDelta > 7.0) {
    frameGeometryGrade = 'SEVERE_LONGERON_TWIST';
  } else if (diagDelta > 3.0) {
    frameGeometryGrade = 'MINOR_POST_CRASH_SHIFT';
  }

  let fineAzn = fastenerProfile.fineAzn;
  let prohibitsOperationImmediately = fastenerProfile.prohibitsOperation;

  if (violatesClause54Bolts) {
    fineAzn = Math.max(fineAzn, 50);
    prohibitsOperationImmediately = true;
    legalArticlesTriggered.push(
      'YHQ Əlavə 1 Bənd 5.4 & İXM Maddə 342.1.5 (Təkər bolt/qayka çatışmazlığı — 50 ₼)'
    );
    violationsAz.push(
      `YHQ Əlavə 1 Bənd 5.4 pozuntusu: ${Math.max(1, safeMissingBolts)} ədəd təkər bərkidici boltu/qaykası çatışmır — təkərin hərəkətdə qopma riski səbəbilə istismar qəti qadağandır (İXM Maddə 342.1.5: 50 ₼).`
    );
    recommendationsAz.push(
      'Çatışmayan təkər boltlarını/qaykalarını 10.9 möhkəmlik sinifli OEM bərkidicilərlə tamamlayın və dinamometrik açarla (110–140 Nm) sıxın.'
    );
  }

  if (violatesClause55RimCrack) {
    fineAzn = Math.max(fineAzn, 50);
    prohibitsOperationImmediately = true;
    legalArticlesTriggered.push(
      'YHQ Əlavə 1 Bənd 5.5 & İXM Maddə 342.1.5 (Diskdə çat və ya qaynaq izi — 50 ₼)'
    );
    violationsAz.push(
      'YHQ Əlavə 1 Bənd 5.5 pozuntusu: Təkər diskində çat və ya arqon qaynaq («svarka») təmiri aşkar edildi — zərbə zamanı diskin parçalanma təhlükəsi (İXM Maddə 342.1.5: 50 ₼).'
    );
    recommendationsAz.push(
      'Qaynaq edilmiş və ya çatlamış diski istismardan çıxarın və zavod sertifikatlı bütöv disklə əvəzləyin.'
    );
  }

  if (input.wheelFastenerCondition === 'wheel_spacer_unregistered') {
    fineAzn = Math.max(fineAzn, 150);
    prohibitsOperationImmediately = true;
    legalArticlesTriggered.push(
      'İXM Maddə 342.2-1 (Sertifikatsız təkər araqatı / spayser — 150 ₼)'
    );
    violationsAz.push(
      'Sertifikatsız qalın təkər araqatı («spayser / prostafka» >20 mm) aşkar edildi — stupitsa yastığını dağıdır və İXM Maddə 342.2-1 (150 ₼) inzibati tənbeh yaradır.'
    );
  } else if (input.wheelFastenerCondition === 'worn_hub_bearing_cv') {
    fineAzn = Math.max(fineAzn, 50);
    violationsAz.push(
      'Stupitsa podşipnikində normadan artıq lüft və ya ŞRUS (qranat) xırtıltısı aşkar edildi.'
    );
    recommendationsAz.push(
      'Stupitsa podşipnikini və cırılmış ŞRUS qoruyucu pılnikini vaxtında dəyişdirin.'
    );
  }

  if (isExtremeStanceCamber342) {
    fineAzn = Math.max(fineAzn, 150);
    prohibitsOperationImmediately = true;
    legalArticlesTriggered.push(
      'İXM Maddə 342.2-1 (Ekstremal mənfi Stance/Razval dəyişikliyi — 150 ₼)'
    );
    violationsAz.push(
      `Ön Camber («Razval»: ${input.frontCamberDeg.toFixed(1)}°) ekstremal mənfi «Stance» həddindədir (< -3.5°) — təkərin yol tutumu kəskin azalır (İXM Maddə 342.2-1: 150 ₼).`
    );
  } else if (isCamberOutOfSpec) {
    violationsAz.push(
      `Ön Camber («Razval»: ${input.frontCamberDeg.toFixed(1)}°) zavod normativindən (-2.0° .. +0.5°) kənardır — şinin daxili/xarici çiyni sürətlə yeyilir.`
    );
  }

  if (isToeOutOfSpec) {
    violationsAz.push(
      `Ön Toe («Sxojdeniya»: ${input.frontToeMm.toFixed(1)} mm) zavod normativindən (-1.5 .. +2.5 mm) kənardır — sükan reaksiyası gecikir və yanacaq sərfi artır.`
    );
  }

  if (isCasterPulling) {
    violationsAz.push(
      `Sol və sağ Caster bucağı fərqi (${Math.abs(input.casterLeftRightDeltaDeg).toFixed(2)}°) normadan (>0.5°) yüksəkdir — düz yolda sükanı buraxdıqda avtomobil kənara dartır.`
    );
  }

  if (isToeOutOfSpec || isCamberOutOfSpec || isCasterPulling) {
    recommendationsAz.push(
      'Hunter 3D Lazer «Razval-Sxojdeniya» stendində ön və arxa ox bucaqlarını zavod normativinə tənzimləyin.'
    );
  }

  // Estimate extra tire wear % caused by misalignment
  const toeExcess = Math.max(
    0,
    input.frontToeMm < -1.5
      ? Math.abs(input.frontToeMm + 1.5)
      : input.frontToeMm > 2.5
      ? input.frontToeMm - 2.5
      : 0
  );
  const camberExcess = Math.max(
    0,
    input.frontCamberDeg < -2.0
      ? Math.abs(input.frontCamberDeg + 2.0)
      : input.frontCamberDeg > 0.5
      ? input.frontCamberDeg - 0.5
      : 0
  );
  const estimatedTireWearPenaltyPercent = Math.min(
    85,
    Math.round(toeExcess * 12 + camberExcess * 15)
  );

  // Valuation impact of structural frame / longeron twist
  const basePrice = Math.max(10000, input.vehicleMarketPriceAzn);
  let valuationImpactAzn = 0;
  if (frameGeometryGrade === 'SEVERE_LONGERON_TWIST') {
    valuationImpactAzn = -Math.round(basePrice * 0.18);
    violationsAz.push(
      `Celette 3D Lazer ölçməsində lonjeron diaqonal fərqi ${diagDelta.toFixed(1)} mm (>7.0 mm) təşkil edir — ağır qəza nəticəsində şassi həndəsəsi pozulub (bazar dəyərinə təsiri: ${valuationImpactAzn} ₼).`
    );
    recommendationsAz.push(
      'Celette 3D stapel stendində lonjeron diaqonallarının hidravlik dartılmasını və «podramnik» mərkəzləməsini həyata keçirin.'
    );
  } else if (frameGeometryGrade === 'MINOR_POST_CRASH_SHIFT') {
    valuationImpactAzn = -Math.round(basePrice * 0.06);
    violationsAz.push(
      `Kuzov/alt-çərçivə («podramnik») diaqonalında ${diagDelta.toFixed(1)} mm (3.1–7.0 mm) orta sürüşmə aşkar edildi.`
    );
    recommendationsAz.push(
      'Alt-çərçivə («podramnik») boltlarını boşaldaraq 3D stenddə simmetrik mərkəzləmə aparın.'
    );
  }

  const isCompliant =
    fastenerProfile.isRoadworthy &&
    !violatesClause54Bolts &&
    !violatesClause55RimCrack &&
    !isToeOutOfSpec &&
    !isCamberOutOfSpec &&
    !isCasterPulling &&
    frameGeometryGrade === 'FACTORY_STRAIGHT';

  if (isCompliant && recommendationsAz.length === 0) {
    recommendationsAz.push(
      'Təkər bərkidiciləri (YHQ Bənd 5.4/5.5), 3D Razval-Sxojdeniya bucaqları və lonjeron diaqonalları zavod etalonuna tam uyğundur.'
    );
  }

  const discountedFineAzn = Math.round(fineAzn * 0.5 * 100) / 100;

  let verdictTitleAz = '3D HƏNDƏSƏ & TƏKƏR BƏRKİDİCİLƏRİ SAZDIR';
  if (prohibitsOperationImmediately) {
    verdictTitleAz = 'İSTİSMAR QADAĞANDIR (YHQ BƏND 5.4 / 5.5 VƏ YA İXM 342.2-1)';
  } else if (!isCompliant) {
    verdictTitleAz = '3D RAZVAL VƏ YA LONJERON TƏNZİMLƏNMƏSİ TƏLƏB OLUNUR';
  }

  return {
    isCompliant,
    violatesClause54Bolts,
    violatesClause55RimCrack,
    isToeOutOfSpec,
    isCamberOutOfSpec,
    isExtremeStanceCamber342,
    isCasterPulling,
    frameGeometryGrade,
    estimatedTireWearPenaltyPercent,
    valuationImpactAzn,
    prohibitsOperationImmediately,
    fineAzn,
    discountedFineAzn,
    legalArticlesTriggered,
    violationsAz,
    recommendationsAz,
    verdictTitleAz,
  };
}

/**
 * Calculates total parts, labor, duration, and multi-currency cost for selected
 * 3D alignment, EUSAMA shock absorber, Peredok OEM spring reset, and Celette frame packages.
 */
export function calculateSuspensionServiceCost(
  selectedPackageIds: string[],
  currency: Currency = 'AZN'
): SuspensionServiceCostSummary {
  const uniqueIds = Array.from(new Set(selectedPackageIds));
  const selected = CHASSIS_SERVICE_PACKAGES.filter((pkg) =>
    uniqueIds.includes(pkg.id)
  );

  const partsCostAzn = selected.reduce((sum, p) => sum + p.partsCostAzn, 0);
  const laborCostAzn = selected.reduce((sum, p) => sum + p.laborCostAzn, 0);
  const totalAzn = partsCostAzn + laborCostAzn;
  const totalDurationMinutes = selected.reduce(
    (sum, p) => sum + p.durationMinutes,
    0
  );

  // Avoided BDYP fines (150 AZN Peredok + 50 AZN Clause 5.4/5.5) + premature tire set wear (450 AZN)
  const finesAndTireLossAvoidedAzn = selected.length > 0 ? 650 : 0;

  return {
    selectedPackageIds: uniqueIds,
    partsCostAzn,
    laborCostAzn,
    totalAzn,
    totalInCurrency: convertFromAzn(totalAzn, currency),
    currency,
    totalDurationMinutes,
    finesAndTireLossAvoidedAzn,
  };
}

export interface GenerateSuspensionCertificateInput {
  plateNumber: string;
  vin: string;
  vehicleTitle: string;
  ownerName: string;
  centerName: string;
  frontEusamaAvgPercent: number;
  rearEusamaAvgPercent: number;
  maxAxleImbalancePercent: number;
  suspensionModId: SuspensionModId;
  frontToRearPitchDeltaMm: number;
  missingLugBoltsCount: number;
  longeronDiagonalDeltaMm: number;
}

/**
 * Generates an official BDYP & AZS Electronic Suspension, EUSAMA & 3D Chassis Geometry Certificate.
 */
export function generateSuspensionComplianceCertificate(
  input: GenerateSuspensionCertificateInput
): SuspensionComplianceCertificate {
  const cleanPlate = (input.plateNumber || '99-AA-001').trim().toUpperCase();
  const cleanVin = (input.vin || 'JTJHY7AX6P4012988').trim().toUpperCase();

  let seed = 0;
  const combined = `${cleanPlate}-${cleanVin}-${input.frontEusamaAvgPercent}`;
  for (let i = 0; i < combined.length; i++) {
    seed = (seed * 31 + combined.charCodeAt(i)) % 90000;
  }
  const serialNum = 10000 + Math.abs(seed);

  const isIllegalMod =
    input.suspensionModId === 'peredok_front_lift' ||
    input.suspensionModId === 'cut_heated_springs' ||
    input.suspensionModId === 'extreme_stance_camber' ||
    input.frontToRearPitchDeltaMm > 35;

  let overallStatus: SuspensionComplianceCertificate['overallStatus'] =
    'COMPLIANT';
  if (
    isIllegalMod ||
    input.missingLugBoltsCount > 0 ||
    input.frontEusamaAvgPercent <= 20 ||
    input.rearEusamaAvgPercent <= 20
  ) {
    overallStatus = 'PROHIBITED_96_1_4';
  } else if (
    input.frontEusamaAvgPercent < 40 ||
    input.rearEusamaAvgPercent < 40 ||
    input.maxAxleImbalancePercent > 15 ||
    input.longeronDiagonalDeltaMm > 3.0
  ) {
    overallStatus = 'CONDITIONAL_WARNING';
  }

  return {
    certificateNumber: `BDYP-ASQ-2026-${serialNum}`,
    issueDate: '2026-10-19',
    expiryDate: '2027-10-19',
    plateNumber: cleanPlate,
    vin: cleanVin,
    vehicleTitle: input.vehicleTitle || 'Nəqliyyat Vasitəsi',
    ownerName: input.ownerName.trim() || 'Məmmədov Kamran Əli oğlu',
    centerName:
      input.centerName ||
      'BDYP Zabrat Baş Texniki Müayinə və MAHA EUSAMA Asqı Stendi',
    frontEusamaAvgPercent: input.frontEusamaAvgPercent,
    rearEusamaAvgPercent: input.rearEusamaAvgPercent,
    maxAxleImbalancePercent: input.maxAxleImbalancePercent,
    suspensionModId: input.suspensionModId,
    frontToRearPitchDeltaMm: input.frontToRearPitchDeltaMm,
    missingLugBoltsCount: input.missingLugBoltsCount,
    longeronDiagonalDeltaMm: input.longeronDiagonalDeltaMm,
    overallStatus,
    qrSecurityHash: `AZS-BDYP-ASQ-${serialNum}-${cleanPlate.replace(/[^A-Z0-9]/g, '')}`,
  };
}

/**
 * Looks up a certificate by certificateNumber, plateNumber, or VIN in the unified registry.
 */
export function lookupSuspensionCertificateByCode(
  query: string
): SuspensionComplianceCertificate | null {
  const q = query.trim().toUpperCase();
  if (!q) return null;
  return (
    SAMPLE_SUSPENSION_CERTIFICATES.find(
      (c) =>
        c.certificateNumber.toUpperCase() === q ||
        c.plateNumber.toUpperCase() === q ||
        c.vin.toUpperCase() === q
    ) ?? null
  );
}

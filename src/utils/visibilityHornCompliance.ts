import { Currency } from '../types/vehicle';
import {
  WindshieldZoneId,
  WindshieldDamageType,
  WasherFluidGradeId,
  HornTypeId,
  WINDSHIELD_ZONES,
  HORN_SPECS,
  WASHER_FLUID_SPECS,
  VISIBILITY_REPAIR_PACKAGES,
  VisibilityHornCertificate,
} from '../data/mockVisibilityHornData';

export interface WindshieldWiperAuditInput {
  windshieldZone: WindshieldZoneId;
  damageType: WindshieldDamageType;
  driverWiperWorking: boolean;
  passengerWiperWorking: boolean;
  wiperCyclesPerMinute: number; // Statutory minimum: 35 cpm continuous mode
  washerFluidGrade: WasherFluidGradeId;
  ambientTempC: number;
  defrosterWorking: boolean;
  leftMirrorIntact: boolean;
  rightMirrorIntact: boolean;
  interiorMirrorIntact: boolean;
  sunVisorIntact: boolean;
  rearMudguardsPresent: boolean;
  isRainingOrSnowing: boolean;
}

export interface WindshieldWiperAuditResult {
  isCompliant: boolean;
  passesTechnicalInspection: boolean;
  prohibitsOperationInPrecipitation: boolean; // İXM Article 96.1.4
  windshieldPass: boolean;
  wipersPass: boolean;
  washerPass: boolean;
  washerFrozen: boolean;
  defrosterAndMirrorsPass: boolean;
  mudguardsPass: boolean;
  fineAzn: number;
  discountedFineAzn: number; // 30-day AsanPay 50% discount (Wait: traffic fines in AZ have 10% for 5 days? No, in codebase convention 50% or statutory discount — let's provide both 10% and 50% or check codebase convention!)
  ixmArticlesTriggered: string[];
  violationsAz: string[];
  recommendationsAz: string[];
  safetyScore: number; // 0 to 100
}

export interface HornTachographAuditInput {
  hornType: HornTypeId;
  measuredDbA: number; // UNECE R28 statutory range at 7m: 93 - 112 dBA
  unnecessaryHonkingInCity: boolean; // İXM Article 329.3 (30 AZN)
  vehicleCategory: 'M1' | 'N1' | 'N2_N3' | 'M2_M3';
  speedometerWorking: boolean;
  tachographInstalledAndSealed: boolean; // Mandatory for N2/N3 and M2/M3
}

export interface HornTachographAuditResult {
  isCompliant: boolean;
  hornLegal: boolean;
  dbWithinStatutoryRange: boolean;
   statutoryMinDbA: number;
  statutoryMaxDbA: number;
  requiresDeviceConfiscation: boolean; // İXM 342.9
  prohibitsOperation: boolean; // İXM 342.2-1
  tachographCompliant: boolean;
  equipmentFineAzn: number;
  honkingFineAzn: number;
  totalFineAzn: number;
  discountedTotalFineAzn: number;
  ixmArticlesTriggered: string[];
  violationsAz: string[];
  verdictTitleAz: string;
}

export interface WasherFreezeAnalysis {
  fluidGrade: WasherFluidGradeId;
  fluidNameAz: string;
  freezingPointC: number;
  ambientTempC: number;
  safetyMarginC: number;
  willFreeze: boolean;
  isPumpOperational: boolean;
  recommendedIsopropylPercent: number;
  statusVerdictAz: string;
}

export interface VisibilityRepairCostSummary {
  selectedPackageIds: string[];
  partsTotalAzn: number;
  laborTotalAzn: number;
  totalAzn: number;
  totalFormattedCurrency: number;
  currency: Currency;
  estimatedDurationMinutes: number;
  potentialFinesSavedAzn: number;
  netSavingsOrCostDiffAzn: number;
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
 * Evaluates windshield cracks (Zone A/B/C), wiper sweep speed (cpm),
 * washer fluid freeze status, defroster, mirrors, and rear mudguards
 * per YHQ Annex 1 Sections IV & VII and İXM Articles 96.1.4 & 342.1.7.
 */
export function evaluateWindshieldAndWipers(
  input: WindshieldWiperAuditInput
): WindshieldWiperAuditResult {
  const violationsAz: string[] = [];
  const recommendationsAz: string[] = [];
  const ixmArticlesTriggered: string[] = [];
  let safetyScore = 100;

  const zoneSpec =
    WINDSHIELD_ZONES.find((z) => z.id === input.windshieldZone) || WINDSHIELD_ZONES[0];

  // 1. Windshield assessment (YHQ Annex 1, Section VII, Clause 7.3 & GOST/AZS)
  let windshieldPass = true;
  if (input.windshieldZone === 'driver_sweep_a' && input.damageType !== 'none') {
    if (
      input.damageType === 'linear_crack_over_10cm' ||
      input.damageType === 'bullseye_crack_25mm' ||
      input.damageType === 'delamination_haze'
    ) {
      windshieldPass = false;
      safetyScore -= 35;
      violationsAz.push(
        `Alın şüşəsində sürücünün şüşəsilən baxış zonasında (${zoneSpec.code}) görünüşü məhdudlaşdıran çat/zədə var — DYP Texniki Baxışdan keçmir (YHQ Əlavə 1, Bənd 7.3).`
      );
      recommendationsAz.push(
        'Sürücünün baxış zonasındakı (Zona A) xətti çat yalnız alın şüşəsinin tam dəyişdirilməsi (Triplex Pilkington/AGC) ilə aradan qaldırıla bilər.'
      );
    } else if (input.damageType === 'stone_chip_under_15mm') {
      safetyScore -= 10;
      recommendationsAz.push(
        'Sürücü zonasındakı kiçik daş izi (<15 mm) böyüməməsi üçün təcili UV-polimer injeksiya ilə doldurulmalıdır.'
      );
    }
  } else if (
    input.windshieldZone === 'passenger_sweep_b' &&
    input.damageType === 'linear_crack_over_10cm'
  ) {
    safetyScore -= 12;
    recommendationsAz.push(
      'Sərnişin zonasındakı (Zona B) çat sürücü tərəfə keçməməsi üçün dayandırıcı polimerlə möhkəmləndirilməlidir.'
    );
  }

  // 2. Wiper assessment (YHQ Annex 1, Section IV, Clause 4.1)
  let wipersPass = true;
  let prohibitsOperationInPrecipitation = false;

  if (!input.driverWiperWorking) {
    wipersPass = false;
    safetyScore -= 40;
    violationsAz.push(
      'Sürücü tərəfdəki şüşəsilən fırça işləmir (YHQ Əlavə 1, Bölmə IV, Bənd 4.1).'
    );
    ixmArticlesTriggered.push('İXM Maddə 342.1.7 (50 AZN)');
    if (input.isRainingOrSnowing) {
      prohibitsOperationInPrecipitation = true;
      ixmArticlesTriggered.push('İXM Maddə 96.1.4 (Yağışlı/qarlı havada istismarın qadağan edilməsi)');
      violationsAz.push(
        'KRİTİK: Yağmurlu/qarlı havada sürücü tərəfdə şüşəsilən işləmədiyi üçün İXM Maddə 96.1.4 əsasında hərəkət dərhal qadağan edilir!'
      );
    }
    recommendationsAz.push('Şüşəsilən трапеsiya mexanizmi və ya mühərriki təcili bərpa edilməlidir.');
  } else if (!input.passengerWiperWorking || input.wiperCyclesPerMinute < 35) {
    wipersPass = false;
    safetyScore -= 20;
    violationsAz.push(
      `Şüşəsilənlər müəyyən olunmuş rejimdə işləmir (faktiki: ${input.wiperCyclesPerMinute} gediş/dəq, normativ minimum: 35 gediş/dəq — YHQ Əlavə 1, Bənd 4.1).`
    );
    ixmArticlesTriggered.push('İXM Maddə 342.1.7 (50 AZN)');
    recommendationsAz.push('Bosch Aerotwin fırçaları yeniləyin və şüşəsilən relesini yoxlayın.');
  }

  // 3. Washer fluid & pump assessment (YHQ Annex 1, Section IV, Clause 4.2)
  const fluidSpec =
    WASHER_FLUID_SPECS.find((f) => f.id === input.washerFluidGrade) || WASHER_FLUID_SPECS[0];
  const washerFrozen =
    fluidSpec.isPumpWorking && input.ambientTempC < fluidSpec.freezingPointC;
  const washerPass = fluidSpec.isPumpWorking && !washerFrozen;

  if (!fluidSpec.isPumpWorking) {
    safetyScore -= 20;
    violationsAz.push(
      'Konstruksiyada nəzərdə tutulmuş şüşəyuyanlar işləmir və ya çən boşdur (YHQ Əlavə 1, Bölmə IV, Bənd 4.2).'
    );
    if (!ixmArticlesTriggered.includes('İXM Maddə 342.1.7 (50 AZN)')) {
      ixmArticlesTriggered.push('İXM Maddə 342.1.7 (50 AZN)');
    }
    recommendationsAz.push('Şüşəyuyan nasosu və forsunkaları təmizləyin, qış mayesi əlavə edin.');
  } else if (washerFrozen) {
    safetyScore -= 25;
    violationsAz.push(
      `Şüşəyuyan maye mövcud temperaturda (${input.ambientTempC}°C < donma həddi ${fluidSpec.freezingPointC}°C) donub və şüşəyə su vurmur (YHQ Əlavə 1, Bənd 4.2).`
    );
    if (!ixmArticlesTriggered.includes('İXM Maddə 342.1.7 (50 AZN)')) {
      ixmArticlesTriggered.push('İXM Maddə 342.1.7 (50 AZN)');
    }
    recommendationsAz.push(
      'Donmuş yay suyunu boşaldıb -15°C və ya -30°C izopropil spirtli qış antifriz mayesi tökün.'
    );
  }

  // 4. Defroster, Mirrors & Sun Visor (YHQ Annex 1, Section VII, Clauses 7.1 & 7.3)
  let defrosterAndMirrorsPass = true;
  if (!input.defrosterWorking) {
    defrosterAndMirrorsPass = false;
    safetyScore -= 15;
    violationsAz.push(
      'Alın şüşəsinin buğlanmaya və donmaya qarşı isti hava üfürücüsü (Defroster / Peç) işləmir (YHQ Əlavə 1, Bənd 7.3).'
    );
  }
  if (!input.leftMirrorIntact || !input.rightMirrorIntact || !input.interiorMirrorIntact) {
    defrosterAndMirrorsPass = false;
    safetyScore -= 20;
    violationsAz.push(
      'Konstruksiyada nəzərdə tutulmuş arxa görüntü güzgüləri tam deyil və ya sınıqdır (YHQ Əlavə 1, Bənd 7.1 & 7.3).'
    );
  }
  if (!input.sunVisorIntact) {
    defrosterAndMirrorsPass = false;
    safetyScore -= 8;
    violationsAz.push(
      'Sürücü qarşısında günəşdən qoruyucu günlük (kozirok) yoxdur və ya nasazdır (YHQ Əlavə 1, Bənd 7.3).'
    );
  }
  if (!defrosterAndMirrorsPass && !ixmArticlesTriggered.includes('İXM Maddə 342.1.7 (50 AZN)')) {
    ixmArticlesTriggered.push('İXM Maddə 342.1.7 (50 AZN)');
  }

  // 5. Rear Mudguards / Splash Guards (YHQ Annex 1, Section VII, Clause 7.5)
  const mudguardsPass = input.rearMudguardsPresent;
  if (!mudguardsPass) {
    safetyScore -= 10;
    violationsAz.push(
      'Konstruksiyada nəzərdə tutulmuş arxa palçıqqoruyucu önlüklər (brizqoviklər) yoxdur (YHQ Əlavə 1, Bənd 7.5 — arxadan gələn avtomobilə daş/palçıq sıçrama təhlükəsi).'
    );
    if (!ixmArticlesTriggered.includes('İXM Maddə 342.1.7 (50 AZN)')) {
      ixmArticlesTriggered.push('İXM Maddə 342.1.7 (50 AZN)');
    }
    recommendationsAz.push('Arxa təkər arkalarına zavod standartlı palçıqqoruyucu brizqovik dəsti quraşdırın.');
  }

  const isCompliant =
    windshieldPass && wipersPass && washerPass && defrosterAndMirrorsPass && mudguardsPass;
  const passesTechnicalInspection = isCompliant;

  const hasEquipmentFault =
    !wipersPass || !washerPass || !defrosterAndMirrorsPass || !mudguardsPass || !windshieldPass;
  const fineAzn = hasEquipmentFault ? 50 : 0;
  const discountedFineAzn = Math.round(fineAzn * 0.5);

  if (!windshieldPass && !ixmArticlesTriggered.includes('İXM Maddə 342.1.7 (50 AZN)')) {
    ixmArticlesTriggered.push('İXM Maddə 342.1.7 (50 AZN)');
  }

  return {
    isCompliant,
    passesTechnicalInspection,
    prohibitsOperationInPrecipitation,
    windshieldPass,
    wipersPass,
    washerPass,
    washerFrozen,
    defrosterAndMirrorsPass,
    mudguardsPass,
    fineAzn,
    discountedFineAzn,
    ixmArticlesTriggered,
    violationsAz,
    recommendationsAz,
    safetyScore: Math.max(0, safetyScore),
  };
}

/**
 * Evaluates vehicle acoustic horn type ("FIFA" polyphonic, SGU siren, pneumatic, or OEM),
 * sound pressure level (UNECE R28: 93–112 dBA at 7m), unnecessary honking (İXM 329.3),
 * and speedometer/digital tachograph seal status (YHQ Annex 1 Clauses 7.2 & 7.4).
 */
export function evaluateAcousticHornAndTachograph(
  input: HornTachographAuditInput
): HornTachographAuditResult {
  const hornSpec = HORN_SPECS.find((h) => h.id === input.hornType) || HORN_SPECS[0];
  const statutoryMinDbA = 93;
  const statutoryMaxDbA = 112;

  const dbWithinStatutoryRange =
    input.measuredDbA >= statutoryMinDbA && input.measuredDbA <= statutoryMaxDbA;

  const violationsAz: string[] = [];
  const ixmArticlesTriggered: string[] = [];

  let equipmentFineAzn = 0;
  let requiresDeviceConfiscation = hornSpec.requiresConfiscation;
  let prohibitsOperation = hornSpec.prohibitsOperation;

  // 1. Horn type & dBA check
  let hornLegal = hornSpec.isLegal && dbWithinStatutoryRange;

  if (!hornSpec.isLegal) {
    equipmentFineAzn = Math.max(equipmentFineAzn, hornSpec.fineAzn);
    ixmArticlesTriggered.push(hornSpec.ixmArticleAz);
    violationsAz.push(`${hornSpec.nameAz}: ${hornSpec.descriptionAz}`);
  } else if (!dbWithinStatutoryRange) {
    hornLegal = false;
    if (input.measuredDbA > statutoryMaxDbA) {
      equipmentFineAzn = Math.max(equipmentFineAzn, 150);
      prohibitsOperation = true;
      ixmArticlesTriggered.push('İXM Maddə 342.2-1 (Normativ >112 dBA akustik həddin aşılması — 150 AZN)');
      violationsAz.push(
        `Səs siqnalının akustik təzyiqi (${input.measuredDbA} dBA) UNECE R28 normativ maksimum həddini (${statutoryMaxDbA} dBA) aşır!`
      );
    } else {
      equipmentFineAzn = Math.max(equipmentFineAzn, 50);
      ixmArticlesTriggered.push('İXM Maddə 342.1.7 (Zəif və ya nasaz səs siqnalı <93 dBA — 50 AZN)');
      violationsAz.push(
        `Səs siqnalının gücü (${input.measuredDbA} dBA) minimum təhlükəsizlik həddindən (${statutoryMinDbA} dBA) aşağıdır.`
      );
    }
  }

  // 2. Speedometer & Digital Tachograph seal check (YHQ Annex 1, Section VII, Clause 7.4)
  const requiresTachograph =
    input.vehicleCategory === 'N2_N3' || input.vehicleCategory === 'M2_M3';
  const tachographCompliant =
    input.speedometerWorking && (!requiresTachograph || input.tachographInstalledAndSealed);

  if (!input.speedometerWorking) {
    equipmentFineAzn = Math.max(equipmentFineAzn, 50);
    if (!ixmArticlesTriggered.some((a) => a.includes('342.1.7'))) {
      ixmArticlesTriggered.push('İXM Maddə 342.1.7 (Spidometr nasazlığı — 50 AZN)');
    }
    violationsAz.push(
      'Spidometr işləmir və ya sürət göstəricisi təhrif olunub (YHQ Əlavə 1, Bənd 7.4).'
    );
  }

  if (requiresTachograph && !input.tachographInstalledAndSealed) {
    equipmentFineAzn = Math.max(equipmentFineAzn, 50);
    if (!ixmArticlesTriggered.some((a) => a.includes('342.1.7'))) {
      ixmArticlesTriggered.push('İXM Maddə 342.1.7 (Taxoqrafın olmaması və ya plombunun qırılması — 50 AZN)');
    }
    violationsAz.push(
      `Yük/Sərnişin kateqoriyalı (${input.vehicleCategory}) nəqliyyat vasitəsində Rəqəmsal Taxoqraf yoxdur və ya metrologiya plombu qırılıb (YHQ Əlavə 1, Bənd 7.4).`
    );
  }

  // 3. Unnecessary residential honking (YHQ Article 73 & İXM Article 329.3)
  let honkingFineAzn = 0;
  if (input.unnecessaryHonkingInCity) {
    honkingFineAzn = 30;
    ixmArticlesTriggered.push('İXM Maddə 329.3 & YHQ Maddə 73 (Zərurət olmadan səs siqnalı verilməsi — 30 AZN)');
    violationsAz.push(
      'Yaşayış məntəqələrində yol-nəqliyyat hadisəsinin qarşısını almaq məqsədi olmadan səs siqnalından istifadə qadağandır (İXM Maddə 329.3 — 30 AZN).'
    );
  }

  const totalFineAzn = equipmentFineAzn + honkingFineAzn;
  const discountedTotalFineAzn = Math.round(totalFineAzn * 0.5);
  const isCompliant = hornLegal && tachographCompliant && !input.unnecessaryHonkingInCity;

  let verdictTitleAz = 'Tam Qanuni — Akustik Siqnal və Spidometr/Taxoqraf Standartlara Uyğundur';
  if (requiresDeviceConfiscation) {
    verdictTitleAz = 'KRİTİK QADAĞA: İXM 342.9 — Xüsusi SGU Siqnalın Müsadirəsi və 800 AZN Cərimə!';
  } else if (prohibitsOperation) {
    verdictTitleAz = 'İSTİSMAR QADAĞANDIR: İXM 342.2-1 — Polifonik "FİFA" / Normadan Artıq Siqnal (150 AZN)';
  } else if (!isCompliant) {
    verdictTitleAz = 'Texniki Uyğunsuzluq — İXM 342.1.7 / 329.3 üzrə İnzibati Məsuliyyət';
  }

  return {
    isCompliant,
    hornLegal,
    dbWithinStatutoryRange,
    statutoryMinDbA,
    statutoryMaxDbA,
    requiresDeviceConfiscation,
    prohibitsOperation,
    tachographCompliant,
    equipmentFineAzn,
    honkingFineAzn,
    totalFineAzn,
    discountedTotalFineAzn,
    ixmArticlesTriggered,
    violationsAz,
    verdictTitleAz,
  };
}

/**
 * Calculates winter washer fluid freeze margin and recommends isopropyl alcohol concentration.
 */
export function calculateWasherFreezeSafety(
  fluidGrade: WasherFluidGradeId,
  ambientTempC: number
): WasherFreezeAnalysis {
  const spec =
    WASHER_FLUID_SPECS.find((f) => f.id === fluidGrade) || WASHER_FLUID_SPECS[0];

  const safetyMarginC = ambientTempC - spec.freezingPointC;
  const willFreeze = !spec.isPumpWorking || ambientTempC < spec.freezingPointC;

  let recommendedIsopropylPercent = 0;
  if (ambientTempC <= -20) {
    recommendedIsopropylPercent = 45;
  } else if (ambientTempC <= -10) {
    recommendedIsopropylPercent = 30;
  } else if (ambientTempC <= 0) {
    recommendedIsopropylPercent = 20;
  }

  let statusVerdictAz = 'Maye donmaya qarşı tam davamlıdır';
  if (!spec.isPumpWorking) {
    statusVerdictAz = 'Şüşəyuyan çəni boşdur və ya nasos nasazdır — İXM 342.1.7 (50 AZN)';
  } else if (willFreeze) {
    statusVerdictAz = `TƏHLÜKƏ: Maye ${ambientTempC}°C-də borularda və forsunkalarda donacaq!`;
  } else if (safetyMarginC <= 3) {
    statusVerdictAz = 'Diqqət: Temperatur donma həddinə yaxındır, konsentrat əlavə edin';
  }

  return {
    fluidGrade,
    fluidNameAz: spec.nameAz,
    freezingPointC: spec.freezingPointC,
    ambientTempC,
    safetyMarginC,
    willFreeze,
    isPumpOperational: spec.isPumpWorking,
    recommendedIsopropylPercent,
    statusVerdictAz,
  };
}

/**
 * Estimates total parts & labor cost for selected visibility, wiper, horn, and tachograph packages.
 */
export function estimateVisibilityRestorationCost(
  selectedPackageIds: string[],
  currency: Currency = 'AZN'
): VisibilityRepairCostSummary {
  const selected = VISIBILITY_REPAIR_PACKAGES.filter((p) =>
    selectedPackageIds.includes(p.id)
  );

  const partsTotalAzn = selected.reduce((sum, p) => sum + p.partsCostAzn, 0);
  const laborTotalAzn = selected.reduce((sum, p) => sum + p.laborCostAzn, 0);
  const totalAzn = partsTotalAzn + laborTotalAzn;
  const estimatedDurationMinutes = selected.reduce(
    (sum, p) => sum + p.durationMinutes,
    0
  );

  // Calculate statutory fines avoided by fixing these issues
  let potentialFinesSavedAzn = 0;
  if (selected.some((p) => p.category === 'horn')) {
    potentialFinesSavedAzn += 150; // İXM 342.2-1 + impound tow avoidance
  }
  if (
    selected.some(
      (p) =>
        p.category === 'windshield' ||
        p.category === 'wipers' ||
        p.category === 'mirrors_mudguards' ||
        p.category === 'tachograph'
    )
  ) {
    potentialFinesSavedAzn += 90; // 50 AZN İXM 342.1.7 + 40 AZN towing/re-inspection fee
  }

  return {
    selectedPackageIds,
    partsTotalAzn,
    laborTotalAzn,
    totalAzn,
    totalFormattedCurrency: convertFromAzn(totalAzn, currency),
    currency,
    estimatedDurationMinutes,
    potentialFinesSavedAzn,
    netSavingsOrCostDiffAzn: potentialFinesSavedAzn - totalAzn,
  };
}

/**
 * Generates an official BDYP-GOR-2026 compliance certificate for windshield visibility,
 * wipers, acoustic horn, and tachograph inspection.
 */
export function generateVisibilityComplianceCertificate(params: {
  plateNumber: string;
  vin: string;
  vehicleTitle: string;
  centerNameAz: string;
  windshieldResult: WindshieldWiperAuditResult;
  hornResult: HornTachographAuditResult;
  wiperCyclesPerMin: number;
  hornMeasuredDbA: number;
  hornTypeAz: string;
}): VisibilityHornCertificate {
  const cleanPlate = (params.plateNumber || '99-AA-001').trim().toUpperCase();
  const cleanVin = (params.vin || 'JTMAB3FV80D129841').trim().toUpperCase();
  const suffix = String(
    Math.abs(
      cleanPlate
        .split('')
        .reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 7)
    ) % 90000 + 10000
  );

  let overallStatus: VisibilityHornCertificate['overallStatus'] = 'PASS';
  if (
    params.windshieldResult.prohibitsOperationInPrecipitation ||
    params.hornResult.prohibitsOperation ||
    params.hornResult.requiresDeviceConfiscation ||
    !params.windshieldResult.windshieldPass
  ) {
    overallStatus = 'FAIL_PROHIBITED';
  } else if (
    !params.windshieldResult.isCompliant ||
    !params.hornResult.isCompliant
  ) {
    overallStatus = 'CONDITIONAL_REPAIR';
  }

  return {
    certificateNumber: `BDYP-GOR-2026-${suffix}`,
    plateNumber: cleanPlate,
    vin: cleanVin,
    vehicleTitle: params.vehicleTitle || 'Nəqliyyat Vasitəsi',
    issueDate: '2026-10-18',
    expiryDate: '2027-10-18',
    centerNameAz: params.centerNameAz,
    windshieldVerdictAz: params.windshieldResult.windshieldPass
      ? 'Zona-A tam şəffafdır (YHQ Əlavə 1, Bənd 7.3 uyğundur)'
      : 'Zona-A çat aşkarlandı — Şüşə dəyişdirilməlidir',
    wiperCyclesPerMin: params.wiperCyclesPerMin,
    hornMeasuredDbA: params.hornMeasuredDbA,
    hornTypeAz: params.hornTypeAz,
    tachographStatusAz: params.hornResult.tachographCompliant
      ? 'Spidometr və Taxoqraf plombu tamdır (Bənd 7.4)'
      : 'Taxoqraf/Spidometr kalibrləmə tələb edir',
    overallStatus,
    qrSecurityHash: `AZS-GOR-${cleanPlate.replace(/[^A-Z0-9]/g, '')}-${suffix}-${overallStatus}`,
  };
}

import { Currency } from '../types/vehicle';
import {
  BatteryChemistryId,
  HvFaultConditionId,
  BATTERY_CHEMISTRY_PROFILES,
  HV_FAULT_PROFILES,
  HV_SERVICE_PACKAGES,
  SAMPLE_HV_CERTIFICATES,
  HvBatteryComplianceCertificate,
} from '../data/mockHvBatteryData';

export interface HvInsulationSafetyInput {
  systemVoltageV: number; // e.g. 245V (HEV), 400V (EV), 800V (SiC EV)
  measuredInsulationMohm: number; // Megohmmeter reading in MΩ (e.g. 0.08 MΩ leak vs 180 MΩ healthy)
  faultCondition: HvFaultConditionId;
  hvilLoopIntact: boolean; // High-Voltage Interlock Loop continuous
  pyroFuseIntact: boolean; // Crash pyrotechnic HV disconnect fuse OEM intact
  maxPackTemperatureC: number; // Normal <= 45°C, Throttling 46-55°C, Thermal Runaway > 55°C
}

export interface HvInsulationSafetyResult {
  isCompliant: boolean;
  ohmPerVoltRatio: number;
  minRequiredOhmPerVolt: number; // UNECE R100 AC/DC minimum: 500 Ω/V
  minRequiredMohm: number;
  insulationBelowR100Limit: boolean;
  insulationWarningZone: boolean;
  thermalRunawayRisk: boolean;
  thermalThrottlingActive: boolean;
  prohibitsOperationImmediately: boolean;
  fineAzn: number;
  discountedFineAzn: number;
  legalArticlesTriggered: string[];
  violationsAz: string[];
  recommendationsAz: string[];
  verdictBadgeAz: string;
}

export interface BatterySohTelemetryInput {
  chemistryId: BatteryChemistryId;
  sohPercent: number; // 40% - 100%
  cellDeltaMv: number; // Voltage difference between highest and lowest cell in mV (e.g. 8 mV - 180 mV)
  internalResistanceMohm: number; // Cell internal resistance in mΩ (normal 1.2 - 3.5 mΩ)
  dcFastChargeRatioPercent: number; // % of charging sessions done on >100kW DC fast chargers
  wltpRatedRangeKm: number; // Rated EV/PHEV range in km (e.g. 520 km, or 75 km for PHEV)
}

export interface BatterySohTelemetryResult {
  isHealthy: boolean;
  healthGrade: 'A_OPTIMAL' | 'B_MODERATE' | 'C_BALANCING_NEEDED' | 'D_CRITICAL_REPLACE';
  usableCapacityKwh: number;
  estimatedBakuSummerRangeKm: number;
  estimatedBakuWinterRangeKm: number;
  cellImbalanceWarning: boolean;
  cellImbalanceCritical: boolean;
  highInternalResistance: boolean;
  remainingCyclesEstimate: number;
  valuationAdjustmentAzn: number; // Positive for >=92% SOH, negative for degraded pack
  violationsAz: string[];
  recommendationsAz: string[];
  verdictTitleAz: string;
}

export interface AvasAndGreenPrivilegeInput {
  powertrainType: 'ev' | 'phev_hev' | 'ice';
  vehicleAgeYears: number; // 0 - 15 years
  engineVolumeCc: number; // 0 for EV, e.g. 1498 or 2487 for HEV/PHEV
  customsValueAzn: number; // Vehicle value in AZN for tax/loan calculation
  avasSpeakerActive: boolean; // UNECE R138 0-20 km/h pedestrian sound active
  avasMeasuredDba: number; // Statutory UNECE R138 range: 56 - 75 dBA at 20 km/h
  regenBrakeBlendingNormal: boolean; // ABS/ESP regenerative blending without fault
}

export interface AvasAndGreenPrivilegeResult {
  isAvasCompliant: boolean;
  avasFineAzn: number;
  qualifiesForZeroVat164: boolean; // Tax Code Art. 164.1.41 (EV <=3 yr or HEV <=3 yr & <=2500cc)
  qualifiesForZeroCustomsDuty: boolean; // EV <=3 yr 0% customs duty
  estimatedTaxSavingsAzn: number;
  ambMinDownPaymentPercent: number; // CBAR prudential rule: EV 10%, Hybrid 20%, ICE 40%
  ambMinDownPaymentAzn: number;
  downPaymentSavedVsIceAzn: number;
  legalArticlesTriggered: string[];
  violationsAz: string[];
  benefitsAz: string[];
  verdictAz: string;
}

export interface HvServiceCostSummary {
  selectedPackageIds: string[];
  partsAndDutyAzn: number;
  laborCostAzn: number;
  totalAzn: number;
  totalInCurrency: number;
  currency: Currency;
  totalDurationMinutes: number;
  finesOrDamageAvoidedAzn: number;
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
 * Evaluates High-Voltage Insulation Resistance (UNECE R100 >= 500 Ω/V),
 * HVIL interlock loop, pyrotechnic crash disconnect fuse, and FHN thermal safety.
 */
export function evaluateHvInsulationAndSafety(
  input: HvInsulationSafetyInput
): HvInsulationSafetyResult {
  const violationsAz: string[] = [];
  const recommendationsAz: string[] = [];
  const legalArticlesTriggered: string[] = [
    'UNECE R100 (Elektromobil və Hibrid Yüksək Gərginlik Təhlükəsizliyi Reqlamenti)',
    'AZS Milli HV Texniki Standartı & YHQ Əlavə 1',
  ];

  const safeVoltage = Math.max(48, input.systemVoltageV);
  const minRequiredOhmPerVolt = 500; // UNECE R100 combined AC/DC bus requirement
  const minRequiredMohm =
    Math.round(((safeVoltage * minRequiredOhmPerVolt) / 1_000_000) * 1000) / 1000;

  const totalOhms = Math.max(0, input.measuredInsulationMohm) * 1_000_000;
  const ohmPerVoltRatio = Math.round(totalOhms / safeVoltage);

  const insulationBelowR100Limit = ohmPerVoltRatio < minRequiredOhmPerVolt;
  const insulationWarningZone =
    !insulationBelowR100Limit && ohmPerVoltRatio < 2500;

  const thermalRunawayRisk = input.maxPackTemperatureC > 55;
  const thermalThrottlingActive =
    input.maxPackTemperatureC > 45 && input.maxPackTemperatureC <= 55;

  const faultProfile =
    HV_FAULT_PROFILES.find((p) => p.id === input.faultCondition) ??
    HV_FAULT_PROFILES[0];

  let fineAzn = faultProfile.fineAzn;
  let prohibitsOperationImmediately = faultProfile.prohibitsOperation;

  if (insulationBelowR100Limit) {
    fineAzn = Math.max(fineAzn, 150);
    prohibitsOperationImmediately = true;
    legalArticlesTriggered.push(
      'UNECE R100 Bənd 5.1.3 (<500 Ω/V Yüksək Gərginlik İzolyasiya Deşilməsi)'
    );
    violationsAz.push(
      `Yüksək gərginlikli şinin izolyasiya müqaviməti cəmi ${input.measuredInsulationMohm.toFixed(
        2
      )} MΩ (${ohmPerVoltRatio} Ω/V) təşkil edir — UNECE R100 üzrə minimum icazə verilən hədd ${minRequiredOhmPerVolt} Ω/V (${minRequiredMohm} MΩ) olmalıdır!`
    );
    recommendationsAz.push(
      'Avtomobili dərhal yüksək gərginlikli servis rejimində söndürün, inverter/kompressor və batareya konnektorlarında nəm sızmasını (P0AA6) yoxlayın.'
    );
  } else if (insulationWarningZone) {
    violationsAz.push(
      `İzolyasiya müqaviməti (${input.measuredInsulationMohm.toFixed(
        2
      )} MΩ / ${ohmPerVoltRatio} Ω/V) minimum normadan yuxarı olsa da, rütubətli hava üçün sərhəd zonasındadır.`
    );
    recommendationsAz.push(
      'Qış mövsümü öncəsi HV narıncı şin birləşmələrinin IP68 silikon kipləşdiricilərini profilaktik müayinədən keçirin.'
    );
  }

  if (faultProfile.id !== 'clean_oem_intact') {
    legalArticlesTriggered.push(faultProfile.legalReferenceAz);
    violationsAz.push(`${faultProfile.titleAz}: ${faultProfile.descriptionAz}`);
  }

  if (!input.hvilLoopIntact) {
    fineAzn = Math.max(fineAzn, 150);
    prohibitsOperationImmediately = true;
    legalArticlesTriggered.push(
      'İXM Maddə 342.2-1 (HVIL təhlükəsizlik halqasının kustar şuntlanması)'
    );
    violationsAz.push(
      'Yüksək Gərginlikli Təhlükəsizlik Halqası (HVIL / Interlock Loop) açıqdır və ya kustar üsulla şuntlanıb — konnektor açıldıqda 400V/800V cərəyan kəsilmir!'
    );
    recommendationsAz.push(
      'HVIL halqasının ardıcıl siqnal xəttini və narıncı servis açarını (MSD) zavod sxemi üzrə bərpa edin.'
    );
  }

  if (!input.pyroFuseIntact) {
    fineAzn = Math.max(fineAzn, 150);
    prohibitsOperationImmediately = true;
    legalArticlesTriggered.push(
      'UNECE R100 & İXM Maddə 342.2-1 (Qəza HV piropatron qoruyucusunun saxtalaşdırılması)'
    );
    violationsAz.push(
      'Qəza zamanı batareyanı 5 millisanəyədə ayıran HV Piropatron (Pyro-Fuse) nasazdır və ya lehimlə birbaşa bağlanıb!'
    );
    recommendationsAz.push(
      'Şuntlanmış piropatronu dərhal orijinal OEM yüksək gərginlikli piro-qoruyucu modul ilə əvəz edin.'
    );
  }

  if (thermalRunawayRisk) {
    fineAzn = Math.max(fineAzn, 150);
    prohibitsOperationImmediately = true;
    legalArticlesTriggered.push(
      'FHN Litium-İon Yanğın Təhlükəsizliyi Reqlamenti (Termiki Qaçış >55°C)'
    );
    violationsAz.push(
      `Batareya paketinin temperaturu kritik ${input.maxPackTemperatureC}°C həddinə çatıb (>55°C Termiki Qaçış / Öz-özünə alışma təhlükəsi)!`
    );
    recommendationsAz.push(
      'Avtomobili qapalı парkinqdən uzaqlaşdırın, şarjı dərhal dayandırın və FHN / AZS termiki stendinə müraciət edin.'
    );
  } else if (thermalThrottlingActive) {
    violationsAz.push(
      `Batareya temperaturu ${input.maxPackTemperatureC}°C-dir (46–55°C BMS güc məhdudlaşdırma / Chiller yüklənmə zonası).`
    );
    recommendationsAz.push(
      'Batareya soyutma konturunun (Chiller klapanı və dielektrik antifriz) dövriyyəsini yoxlayın.'
    );
  }

  const isCompliant =
    !insulationBelowR100Limit &&
    faultProfile.id === 'clean_oem_intact' &&
    input.hvilLoopIntact &&
    input.pyroFuseIntact &&
    !thermalRunawayRisk;

  if (isCompliant && !insulationWarningZone && !thermalThrottlingActive) {
    recommendationsAz.push(
      `Yüksək gərginlikli izolyasiya müqaviməti (${input.measuredInsulationMohm} MΩ / ${ohmPerVoltRatio.toLocaleString()} Ω/V) UNECE R100 normativindən (≥500 Ω/V) dəfələrlə yüksəkdir. HVIL və Pyro-fuse tam sazdır.`
    );
  }

  let verdictBadgeAz = 'UNECE R100 & FHN — Yüksək Gərginlik İzolyasiyası Tam Sazdır';
  if (prohibitsOperationImmediately) {
    verdictBadgeAz = `İstismar Qadağandır! HV Sızma / Təhlükə (İXM 342.2-1: ${fineAzn} ₼)`;
  } else if (!isCompliant || insulationWarningZone || thermalThrottlingActive) {
    verdictBadgeAz = 'HV Batareya Xəbərdarlığı — Profilaktik Stend Təftişi Lazımdır';
  }

  return {
    isCompliant,
    ohmPerVoltRatio,
    minRequiredOhmPerVolt,
    minRequiredMohm,
    insulationBelowR100Limit,
    insulationWarningZone,
    thermalRunawayRisk,
    thermalThrottlingActive,
    prohibitsOperationImmediately,
    fineAzn,
    discountedFineAzn: Math.round(fineAzn * 0.5 * 100) / 100,
    legalArticlesTriggered: Array.from(new Set(legalArticlesTriggered)),
    violationsAz,
    recommendationsAz,
    verdictBadgeAz,
  };
}

/**
 * Evaluates Traction Battery SOH% (State of Health), Cell Voltage Delta (mV),
 * Internal Resistance (mΩ), and calculates realistic Baku summer/winter range.
 */
export function evaluateBatterySohAndCellDelta(
  input: BatterySohTelemetryInput
): BatterySohTelemetryResult {
  const profile =
    BATTERY_CHEMISTRY_PROFILES.find((c) => c.id === input.chemistryId) ??
    BATTERY_CHEMISTRY_PROFILES[0];

  const violationsAz: string[] = [];
  const recommendationsAz: string[] = [];

  const clampedSoh = Math.min(100, Math.max(30, input.sohPercent));
  const usableCapacityKwh =
    Math.round(((profile.typicalCapacityKwh * clampedSoh) / 100) * 10) / 10;

  // Cell delta checks against chemistry thresholds
  const cellImbalanceCritical = input.cellDeltaMv > profile.criticalCellDeltaMv;
  const cellImbalanceWarning =
    !cellImbalanceCritical && input.cellDeltaMv > profile.maxSafeCellDeltaMv;

  const highInternalResistance = input.internalResistanceMohm > 4.5;

  // Range calculation adjusted for SOH%, cell imbalance penalty, and Baku climate
  const imbalanceFactor = cellImbalanceCritical
    ? 0.84
    : cellImbalanceWarning
    ? 0.94
    : 1.0;

  const estimatedBakuSummerRangeKm = Math.round(
    input.wltpRatedRangeKm * (clampedSoh / 100) * 0.91 * imbalanceFactor
  );
  const estimatedBakuWinterRangeKm = Math.round(
    input.wltpRatedRangeKm * (clampedSoh / 100) * 0.74 * imbalanceFactor
  );

  // Remaining cycles estimate
  const dcPenaltyFactor = input.dcFastChargeRatioPercent > 70 ? 0.82 : 1.0;
  const remainingHealthFraction = Math.max(0, (clampedSoh - 65) / 35);
  const remainingCyclesEstimate = Math.round(
    profile.cycleLife80Percent * remainingHealthFraction * dcPenaltyFactor
  );

  let healthGrade: BatterySohTelemetryResult['healthGrade'] = 'A_OPTIMAL';
  if (clampedSoh < 70 || cellImbalanceCritical) {
    healthGrade = 'D_CRITICAL_REPLACE';
  } else if (cellImbalanceWarning || highInternalResistance) {
    healthGrade = 'C_BALANCING_NEEDED';
  } else if (clampedSoh < 85) {
    healthGrade = 'B_MODERATE';
  }

  if (clampedSoh < 70) {
    violationsAz.push(
      `Batareya SOH göstəricisi kritik həddədir (${clampedSoh}% < 70% zavod minimum həddi) — tutum itkisi və yüksək daxili müqavimət mövcuddur.`
    );
    recommendationsAz.push(
      'Zəifləmiş batareya modullarının dəyişdirilməsi və ya rəsmi servisdə zəmanət üzrə paket əvəzlənməsi tələb olunur.'
    );
  } else if (clampedSoh < 85) {
    violationsAz.push(
      `Batareya SOH göstəricisi orta deqradasiya zonasındadır (${clampedSoh}%). Faktiki yürüş ehtiyatı завод göstəricisindən ~${
        100 - clampedSoh
      }% azalıb.`
    );
  }

  if (cellImbalanceCritical) {
    violationsAz.push(
      `Özəklər arası gərginlik disbalansı kritikdir: ΔV = ${input.cellDeltaMv} mV (${profile.chemistryCode} üçün kritik hədd: >${profile.criticalCellDeltaMv} mV). Yük altında qəfil BMS sönməsi (P0A80) baş verə bilər!`
    );
    recommendationsAz.push(
      'Dərhal AZS akkreditasiyalı HV laboratoriyasında modulların stend balanslaşdırılmasını (Cell Balancing) həyata keçirin.'
    );
  } else if (cellImbalanceWarning) {
    violationsAz.push(
      `Özəklər arası gərginlik fərqi artıb: ΔV = ${input.cellDeltaMv} mV (optimal: ≤${profile.maxSafeCellDeltaMv} mV).`
    );
    recommendationsAz.push(
      'Avtomobili ayda ən azı 1 dəfə AC yavaş şarj (7–11 kW) ilə 100%-ə qədər doldurub BMS passiv balanslaşdırmasını tamamlayın.'
    );
  }

  if (highInternalResistance) {
    violationsAz.push(
      `Özək daxili müqaviməti yüksəkdir (${input.internalResistanceMohm.toFixed(
        1
      )} mΩ > 4.5 mΩ) — yoxuşda və sürətlənmədə batareya qızması artır.`
    );
  }

  if (input.dcFastChargeRatioPercent > 70) {
    recommendationsAz.push(
      `Şarj tarixçəsinin ${input.dcFastChargeRatioPercent}%-i yüksək güclü DC stansiyalarda aparılıb. Litium örtülməsinin (Lithium plating) qarşısını almaq üçün AC şarj payını artırın.`
    );
  }

  const isHealthy =
    clampedSoh >= 80 && !cellImbalanceCritical && !highInternalResistance;

  if (isHealthy && !cellImbalanceWarning) {
    recommendationsAz.push(
      `${profile.nameAz} batareya paketi əla vəziyyətdədir (SOH ${clampedSoh}%, ΔV = ${input.cellDeltaMv} mV ≤ ${profile.maxSafeCellDeltaMv} mV).`
    );
  }

  // Valuation impact in AZN
  let valuationAdjustmentAzn = 0;
  if (clampedSoh >= 92 && !cellImbalanceWarning && !cellImbalanceCritical) {
    valuationAdjustmentAzn = 1200;
  } else if (healthGrade === 'D_CRITICAL_REPLACE') {
    valuationAdjustmentAzn = -4500;
  } else if (healthGrade === 'C_BALANCING_NEEDED') {
    valuationAdjustmentAzn = -1400;
  } else if (healthGrade === 'B_MODERATE') {
    valuationAdjustmentAzn = -800;
  }

  const verdictMap: Record<BatterySohTelemetryResult['healthGrade'], string> = {
    A_OPTIMAL: `Sinif A — İdeal Batareya Sağlamlığı (SOH ${clampedSoh}%, ΔV ${input.cellDeltaMv} mV)`,
    B_MODERATE: `Sinif B — Normal İstismar Aşınması (SOH ${clampedSoh}%)`,
    C_BALANCING_NEEDED: `Sinif C — Stend Balanslaşdırılması Tələb Olunur (ΔV ${input.cellDeltaMv} mV)`,
    D_CRITICAL_REPLACE: `Sinif D — Kritik Modul Deqradasiyası (SOH ${clampedSoh}% / ΔV ${input.cellDeltaMv} mV)`,
  };

  return {
    isHealthy,
    healthGrade,
    usableCapacityKwh,
    estimatedBakuSummerRangeKm,
    estimatedBakuWinterRangeKm,
    cellImbalanceWarning,
    cellImbalanceCritical,
    highInternalResistance,
    remainingCyclesEstimate,
    valuationAdjustmentAzn,
    violationsAz,
    recommendationsAz,
    verdictTitleAz: verdictMap[healthGrade],
  };
}

/**
 * Evaluates UNECE R138 Acoustic Vehicle Alerting System (AVAS 0-20 km/h)
 * and calculates Tax Code Art. 164.1.41 + CBAR (AMB) Green Loan privileges.
 */
export function evaluateAvasAndGreenPrivileges(
  input: AvasAndGreenPrivilegeInput
): AvasAndGreenPrivilegeResult {
  const violationsAz: string[] = [];
  const benefitsAz: string[] = [];
  const legalArticlesTriggered: string[] = [
    'AR Vergi Məcəlləsi Maddə 164.1.41 (Elektromobil və Hibrid ƏDV Güzəşti)',
    'AR Mərkəzi Bankı (AMB) Avtokredit Prudensial Tənzimləmə Qaydaları',
  ];

  const requiresAvas = input.powertrainType !== 'ice';
  const avasSoundInRange =
    input.avasMeasuredDba >= 56 && input.avasMeasuredDba <= 75;
  const isAvasCompliant =
    !requiresAvas ||
    (input.avasSpeakerActive &&
      avasSoundInRange &&
      input.regenBrakeBlendingNormal);

  let avasFineAzn = 0;
  if (requiresAvas && (!input.avasSpeakerActive || !avasSoundInRange)) {
    avasFineAzn = 150;
    legalArticlesTriggered.push(
      'UNECE R138 & İXM Maddə 342.2-1 (AVAS Piyada Xəbərdarlıq Səsinin Söndürülməsi — 150 ₼)'
    );
    violationsAz.push(
      !input.avasSpeakerActive
        ? 'UNECE R138 üzrə məcburi olan AVAS (0–20 km/saat sürətdə piyada xəbərdarlıq dinamiki) söndürülüb və ya naqili ayrılıb — səssiz hərəkət piyadalar üçün təhlükə yaradır!'
        : `AVAS akustik səviyyəsi (${input.avasMeasuredDba} dBA) UNECE R138 normativindən (56–75 dBA) kənardır.`
    );
  }

  if (requiresAvas && !input.regenBrakeBlendingNormal) {
    avasFineAzn = Math.max(avasFineAzn, 150);
    legalArticlesTriggered.push(
      'YHQ Əlavə 1 Bölmə I (Rekuperativ və hidravlik tormoz sinxronizasiyası nasazlığı)'
    );
    violationsAz.push(
      'Rekuperativ (regenerativ) enerji qaytarma tormozu ilə hidravlik ABS/ESP sistemi arasında keçid xətası aşkarlanıb.'
    );
  }

  // Tax Code Art. 164.1.41 & Customs Tariff calculation
  const safeValue = Math.max(5000, input.customsValueAzn);
  const qualifiesForZeroVat164 =
    (input.powertrainType === 'ev' && input.vehicleAgeYears <= 3) ||
    (input.powertrainType === 'phev_hev' &&
      input.vehicleAgeYears <= 3 &&
      input.engineVolumeCc <= 2500);

  const qualifiesForZeroCustomsDuty =
    input.powertrainType === 'ev' && input.vehicleAgeYears <= 3;

  let estimatedTaxSavingsAzn = 0;
  if (qualifiesForZeroCustomsDuty && qualifiesForZeroVat164) {
    // Saves ~15% customs duty + 18% VAT on landed cost (~35.7% combined)
    estimatedTaxSavingsAzn = Math.round(safeValue * 0.33);
    benefitsAz.push(
      `AR Vergi Məcəlləsi Maddə 164.1.41 və NK Gömrük Tariflərinə əsasən ≤3 yaşlı tam elektromobil (EV) 18% ƏDV-dən və 15% idxal gömrük rüsumundan TAM AZADDIR (~${estimatedTaxSavingsAzn.toLocaleString()} ₼ qənaət).`
    );
  } else if (qualifiesForZeroVat164) {
    // HEV/PHEV <=3 yr and <=2500cc saves 18% VAT
    estimatedTaxSavingsAzn = Math.round(safeValue * 0.18);
    benefitsAz.push(
      `AR Vergi Məcəlləsi Maddə 164.1.41-ə əsasən buraxılış tarixindən 3 il keçməyən və mühərriki ≤2500 sm³ olan hibrid avtomobil idxalda 18% ƏDV-dən AZADDIR (~${estimatedTaxSavingsAzn.toLocaleString()} ₼ qənaət).`
    );
  } else {
    benefitsAz.push(
      'Avtomobilin yaşı >3 il olduğu və ya mühərrik həcmi >2500 sm³ olduğu üçün idxalda standart gömrük və ƏDV tarifləri tətbiq edilir.'
    );
  }

  // CBAR (AMB) Prudential Minimum Down Payment Rules
  let ambMinDownPaymentPercent = 40;
  if (input.powertrainType === 'ev') {
    ambMinDownPaymentPercent = 10;
  } else if (input.powertrainType === 'phev_hev') {
    ambMinDownPaymentPercent = 20;
  }

  const ambMinDownPaymentAzn = Math.round(
    (safeValue * ambMinDownPaymentPercent) / 100
  );
  const iceDownPaymentAzn = Math.round(safeValue * 0.4);
  const downPaymentSavedVsIceAzn = Math.max(
    0,
    iceDownPaymentAzn - ambMinDownPaymentAzn
  );

  if (input.powertrainType === 'ev') {
    benefitsAz.push(
      `Mərkəzi Bank (AMB) «Yaşıl Avtokredit» güzəşti: Elektromobillər üçün minimum ilkin ödəniş 40% əvəzinə cəmi 10%-dən (${ambMinDownPaymentAzn.toLocaleString()} ₼) başlayır.`
    );
  } else if (input.powertrainType === 'phev_hev') {
    benefitsAz.push(
      `Mərkəzi Bank (AMB) prudensial güzəşti: Hibrid avtomobillər üçün minimum ilkin ödəniş 40% əvəzinə 20%-dən (${ambMinDownPaymentAzn.toLocaleString()} ₼) başlayır.`
    );
  }

  let verdictAz =
    'UNECE R138 AVAS Normaldır & Yaşıl Maliyyə Güzəştləri Aktivdir';
  if (!isAvasCompliant) {
    verdictAz = `AVAS / Rekuperasiya Pozuntusu Aşkarlandı (İXM 342.2-1: ${avasFineAzn} ₼)`;
  }

  return {
    isAvasCompliant,
    avasFineAzn,
    qualifiesForZeroVat164,
    qualifiesForZeroCustomsDuty,
    estimatedTaxSavingsAzn,
    ambMinDownPaymentPercent,
    ambMinDownPaymentAzn,
    downPaymentSavedVsIceAzn,
    legalArticlesTriggered,
    violationsAz,
    benefitsAz,
    verdictAz,
  };
}

/**
 * Calculates total cost and avoided penalties for selected HV battery diagnostic & repair packages.
 */
export function calculateHvServiceCost(
  selectedPackageIds: string[],
  currency: Currency = 'AZN'
): HvServiceCostSummary {
  const selected = HV_SERVICE_PACKAGES.filter((pkg) =>
    selectedPackageIds.includes(pkg.id)
  );

  const partsAndDutyAzn = selected.reduce(
    (sum, p) => sum + p.partsAndDutyAzn,
    0
  );
  const laborCostAzn = selected.reduce((sum, p) => sum + p.laborCostAzn, 0);
  const totalAzn = partsAndDutyAzn + laborCostAzn;
  const totalDurationMinutes = selected.reduce(
    (sum, p) => sum + p.durationMinutes,
    0
  );
  const finesOrDamageAvoidedAzn = selected.reduce(
    (sum, p) => sum + p.finesOrDamageAvoidedAzn,
    0
  );

  return {
    selectedPackageIds,
    partsAndDutyAzn,
    laborCostAzn,
    totalAzn,
    totalInCurrency: convertFromAzn(totalAzn, currency),
    currency,
    totalDurationMinutes,
    finesOrDamageAvoidedAzn,
  };
}

/**
 * Generates an official AZS / BDYP High-Voltage Safety & Battery SOH% Certificate.
 */
export function generateHvComplianceCertificate(params: {
  plateNumber: string;
  vin: string;
  vehicleTitle: string;
  chemistryId: BatteryChemistryId;
  measuredInsulationMohm: number;
  sohPercent: number;
  cellDeltaMv: number;
  avasCompliant: boolean;
  centerNameAz: string;
}): HvBatteryComplianceCertificate {
  const profile =
    BATTERY_CHEMISTRY_PROFILES.find((c) => c.id === params.chemistryId) ??
    BATTERY_CHEMISTRY_PROFILES[0];

  const cleanPlate =
    params.plateNumber.trim().toUpperCase() || '77-EV-099';
  const cleanVin =
    params.vin.trim().toUpperCase() || 'LGXC76C44R0192841';

  const ohmPerVoltRatio = Math.round(
    (Math.max(0, params.measuredInsulationMohm) * 1_000_000) /
      profile.nominalVoltageV
  );

  let overallStatus: HvBatteryComplianceCertificate['overallStatus'] = 'PASS';
  if (ohmPerVoltRatio < 500 || params.sohPercent < 70 || params.cellDeltaMv > profile.criticalCellDeltaMv) {
    overallStatus = 'FAIL_PROHIBITED';
  } else if (
    params.sohPercent < 82 ||
    params.cellDeltaMv > profile.maxSafeCellDeltaMv ||
    !params.avasCompliant
  ) {
    overallStatus = 'CONDITIONAL_WARN';
  }

  const suffix = String(
    Math.abs(
      cleanVin.split('').reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 7)
    ) % 90000 + 10000
  );

  return {
    certificateNumber: `AZS-HV-2026-${suffix}`,
    plateNumber: cleanPlate,
    vin: cleanVin,
    vehicleTitle: params.vehicleTitle || 'Elektromobil / Hibrid Nəqliyyat Vasitəsi',
    chemistryNameAz: profile.nameAz,
    nominalVoltageV: profile.nominalVoltageV,
    measuredInsulationMohm: params.measuredInsulationMohm,
    ohmPerVoltRatio,
    sohPercent: params.sohPercent,
    cellDeltaMv: params.cellDeltaMv,
    avasCompliant: params.avasCompliant,
    overallStatus,
    centerNameAz: params.centerNameAz,
    issuedAt: '2026-10-19',
    validUntil: '2027-10-19',
    qrSecurityHash: `AZS-R100-${cleanPlate.replace(/[^A-Z0-9]/g, '')}-${params.sohPercent}SOH-${overallStatus}`,
  };
}

/**
 * Looks up a certificate in the unified AZS/BDYP HV Registry by certificate code, plate, or VIN.
 */
export function lookupHvCertificate(
  query: string
): HvBatteryComplianceCertificate | null {
  const normalized = query.trim().toUpperCase();
  if (!normalized) return null;

  return (
    SAMPLE_HV_CERTIFICATES.find(
      (cert) =>
        cert.certificateNumber.toUpperCase() === normalized ||
        cert.plateNumber.toUpperCase() === normalized ||
        cert.vin.toUpperCase() === normalized
    ) ?? null
  );
}

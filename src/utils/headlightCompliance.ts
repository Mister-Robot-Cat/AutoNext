import { Currency, Vehicle } from '../types/vehicle';

export type HeadlampHousingMarking =
  | 'HCR_HALOGEN' // Halogen low & high beam reflector/projector
  | 'DC_DCR_XENON' // Factory Gas-Discharge (Xenon) housing
  | 'LED_OEM_MODULE' // Factory sealed LED / Matrix module
  | 'DOT_SAE_US' // North American SAE/DOT housing
  | 'JDM_RHD_HOUSING'; // Japanese domestic market RHD housing

export type InstalledBulbType =
  | 'halogen_oem' // Standard H4 / H7 / H11 halogen
  | 'xenon_hid_retrofit' // Aftermarket HID Xenon kit in housing
  | 'led_bulb_retrofit' // Aftermarket plug-in LED bulb in reflector
  | 'biled_projector_certified' // Certified Bi-LED projector lens module
  | 'oem_xenon_d2s_d4s' // Factory D2S / D4S Xenon
  | 'oem_led_matrix'; // Factory LED / Matrix

export type BeamPatternStandard =
  | 'ECE_RIGHT_TRAFFIC' // Standard Azerbaijan / Europe right-hand traffic (15° right kick-up)
  | 'DOT_US_SYMMETRIC' // US symmetrical flat cut-off
  | 'JDM_UK_LEFT_TRAFFIC'; // RHD left-hand traffic (blinds oncoming drivers in AZ!)

export type SpecialBeaconType =
  | 'NONE'
  | 'AMBER_WORK_PERMITTED' // Orange/Yellow beacon with permit (tow truck, oversize load, municipal)
  | 'AMBER_NO_PERMIT' // Orange/Yellow beacon without permit
  | 'RED_BLUE_UNAUTHORIZED_STROBE'; // Prohibited red/blue police strobe or multi-tone siren (İXM 342.9)

export interface HeadlightAuditInput {
  housingMarking: HeadlampHousingMarking;
  installedBulb: InstalledBulbType;
  hasProjectorLens: boolean;
  hasAutoLevelingSystem: boolean;
  hasHeadlampWasher: boolean;
  colorTemperatureKelvin: number;
  hasSmokedTailLightFilm: boolean;
  hasRedRearTurnSignalsUsSpec: boolean;
  hasMalfunctioningStopOrLowBeam: boolean;
  specialBeaconType: SpecialBeaconType;
}

export interface HeadlightAuditResult {
  isHousingBulbCompatible: boolean;
  isKelvinLegal: boolean;
  isRearLightingLegal: boolean;
  isBeaconLegal: boolean;
  isFullyCompliant: boolean;
  requiresConstructiveAzsCert: boolean;
  prohibitionOfOperationRisk: boolean; // İstismarın qadağan edilməsi riski
  deviceConfiscationRisk: boolean; // Cihazın müsadirəsi riski (İXM 342.9)
  fineAmountAzn: number;
  violationArticles: string[];
  verdictLevel: 'COMPLIANT' | 'WARNING_DEFECT' | 'CONSTRUCTIVE_VIOLATION' | 'SEVERE_BEACON_VIOLATION';
  verdictTitle: string;
  statutoryExplanation: string;
  recommendations: string[];
}

export interface RegloscopeTelemetryInput {
  mountingHeightMm: number; // Typical: 650mm sedan, 850mm SUV
  verticalSlopePercent: number; // Statutory: -1.0% to -1.5% (-1.0% to -2.0% for SUVs >800mm)
  horizontalDeviationDeg: number; // Statutory: -0.5° to +0.5°
  lowBeamIntensityLuxAt25m: number; // Statutory min: >= 16 Lux (approx 10,000 cd)
  glareZoneLuxAboveCutOff: number; // Statutory max: <= 1.0 Lux in oncoming driver eye zone
  highBeamIntensityLuxAt25m: number; // Statutory min: >= 48 Lux (approx 30,000 cd)
  beamPatternStandard: BeamPatternStandard;
}

export interface RegloscopeAuditResult {
  recommendedMinSlopePercent: number;
  recommendedMaxSlopePercent: number;
  isSlopeCompliant: boolean;
  isHorizontalAligned: boolean;
  isLowBeamBrightEnough: boolean;
  isGlareWithinLimit: boolean;
  isHighBeamCompliant: boolean;
  isBeamPatternRightHandCompliant: boolean;
  passesRegloscopeInspection: boolean;
  estimatedLowBeamVisibilityMeters: number;
  oncomingGlareRisk: 'NONE' | 'MODERATE' | 'HIGH_DAZZLE' | 'CRITICAL_BLINDING';
  diagnosticNotes: string[];
}

export interface OpticalServiceCenter {
  id: string;
  name: string;
  city: string;
  address: string;
  certificationCode: string;
  hasLaserRegloscope: boolean;
  hasAzsConstructiveLab: boolean;
  regloscopeCalibrationFeeAzn: number;
  lensPolishingCeramicFeeAzn: number;
  jdmToEceConversionFeeAzn: number;
  usAmberTurnConversionFeeAzn: number;
  certifiedBiLedRetrofitFeeAzn: number;
  rating: number;
  phone: string;
}

export interface LightingServiceEstimateInput {
  center: OpticalServiceCenter;
  includeRegloscopeAiming: boolean;
  includeLensPolishing: boolean;
  includeJdmToEceConversion: boolean;
  includeUsAmberTurnConversion: boolean;
  includeCertifiedBiLedRetrofit: boolean;
  includeAzsConstructiveEndorsement: boolean;
}

export interface LightingServiceEstimateResult {
  regloscopeFeeAzn: number;
  polishingFeeAzn: number;
  jdmConversionFeeAzn: number;
  usTurnConversionFeeAzn: number;
  biLedRetrofitFeeAzn: number;
  azsEndorsementFeeAzn: number;
  totalCostAzn: number;
  estimatedDurationHours: number;
  visibilityGainMeters: number;
  passesBdypInspectionAfterService: boolean;
}

export interface HeadlightComplianceCertificate {
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  plateNumber: string;
  vin: string;
  vehicleTitle: string;
  housingMarking: HeadlampHousingMarking;
  installedBulbLabel: string;
  colorTemperatureKelvin: number;
  measuredSlopePercent: number;
  measuredGlareLux: number;
  beamStandardLabel: string;
  inspectionCenterName: string;
  complianceStatus: 'KEÇİB (QANUNİ / STANDARTA UYĞUN)' | 'ŞƏRTİ QEYDİYYAT (AZS SERTİFİKATLI)';
  qrVerificationHash: string;
}

const CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1,
  USD: 1 / 1.7,
  EUR: 1 / 1.85,
};

export function formatLightingCurrency(amountAzn: number, currency: Currency): string {
  const converted = Math.round(amountAzn * CURRENCY_RATES[currency]);
  if (currency === 'USD') return `$${converted.toLocaleString('en-US')}`;
  if (currency === 'EUR') return `€${converted.toLocaleString('en-US')}`;
  return `${converted.toLocaleString('en-US')} ₼`;
}

/**
 * Audits vehicle external lighting configuration against YHQ Annex 1 Section III
 * and İXM Articles 342.1.4, 342.2-1, and 342.9.
 */
export function auditHeadlightCompliance(input: HeadlightAuditInput): HeadlightAuditResult {
  const violationArticles: string[] = [];
  const recommendations: string[] = [];
  let fineAmountAzn = 0;
  let prohibitionOfOperationRisk = false;
  let deviceConfiscationRisk = false;
  let requiresConstructiveAzsCert = false;

  // 1. Check housing marking vs installed light source (YHQ Annex 1 Section III Clause 3.1 / 3.4 & İXM 342.2-1)
  let isHousingBulbCompatible = true;

  if (input.housingMarking === 'HCR_HALOGEN') {
    if (input.installedBulb === 'xenon_hid_retrofit') {
      isHousingBulbCompatible = false;
      prohibitionOfOperationRisk = true;
      violationArticles.push(
        'YHQ Əlavə 1 Bölmə III bənd 3.1 & İXM Maddə 342.2-1 (HCR halogen faraya linzasız/avtokorrektorsuz Ksenon quraşdırılması — 150 ₼)'
      );
      recommendations.push(
        'HCR markalı halogen reflektorlu faralardan qeyri-qanuni Ksenon (HID) bloklarını çıxarın və ya AZS sertifikatlı Bi-LED linza + avtomatik korrektor ilə rəsmiləşdirin.'
      );
      fineAmountAzn = Math.max(fineAmountAzn, 150);
    } else if (input.installedBulb === 'led_bulb_retrofit' && !input.hasProjectorLens) {
      isHousingBulbCompatible = false;
      prohibitionOfOperationRisk = true;
      violationArticles.push(
        'YHQ Əlavə 1 Bölmə III bənd 3.4 & İXM Maddə 342.2-1 (Linzasız reflektor faraya fokuslanmayan LED lampa quraşdırılması — 150 ₼)'
      );
      recommendations.push(
        'Açıq reflektorlu HCR farada LED lampalar işıq-kölgə sərhədini (STG) pozaraq qarşı tərəfin gözünü qamaşdırır. Zavod H7/H4 halogen lampaya qayıdın.'
      );
      fineAmountAzn = Math.max(fineAmountAzn, 150);
    } else if (input.installedBulb === 'biled_projector_certified') {
      requiresConstructiveAzsCert = true;
      if (!input.hasProjectorLens || !input.hasAutoLevelingSystem) {
        isHousingBulbCompatible = false;
        prohibitionOfOperationRisk = true;
        violationArticles.push(
          'YHQ Əlavə 1 Bölmə III & İXM Maddə 342.2-1 (Avtomatik səviyyə korrektoru olmadan Bi-LED konstruktiv dəyişikliyi — 150 ₼)'
        );
        recommendations.push(
          'Bi-LED proyektor linza quraşdırıldıqda avtomatik səviyyə korrektoru və AZS/BDYP konstruktiv uyğunluq sertifikatı tələb olunur.'
        );
        fineAmountAzn = Math.max(fineAmountAzn, 150);
      } else {
        recommendations.push(
          'Bi-LED linza və avtokorrektor mövcuddur — Texpasportda "Xüsusi qeydlər" üçün AZS laboratoriya rəyi saxlanılmalıdır.'
        );
      }
    }
  }

  // Xenon >2000 lm requires auto-leveling and headlamp washer under UNECE R48 / AZS
  if (
    (input.installedBulb === 'oem_xenon_d2s_d4s' || input.installedBulb === 'xenon_hid_retrofit') &&
    (!input.hasAutoLevelingSystem || !input.hasHeadlampWasher)
  ) {
    isHousingBulbCompatible = false;
    prohibitionOfOperationRisk = true;
    if (!violationArticles.some((v) => v.includes('342.2-1'))) {
      violationArticles.push(
        'YHQ Əlavə 1 Bölmə III & UNECE R48 / İXM Maddə 342.2-1 (Ksenon DC/DCR farada avtokorrektor və ya yüksək təzyiqli fara yuyucusunun olmaması — 150 ₼)'
      );
    }
    recommendations.push(
      'Ksenon (qazboşalma) işıq mənbələri üçün işlək avtomatik korrektor və fara yuyucusu məcburidir.'
    );
    fineAmountAzn = Math.max(fineAmountAzn, 150);
  }

  // 2. Check Color Temperature (Kelvin) legality (3000K selective yellow fog to 6000K daylight white)
  const isKelvinLegal =
    input.colorTemperatureKelvin >= 3000 && input.colorTemperatureKelvin <= 6000;

  if (!isKelvinLegal) {
    prohibitionOfOperationRisk = true;
    violationArticles.push(
      `YHQ Əlavə 1 Bölmə III bənd 3.6 & İXM Maddə 342.2-1 (Ön işıq cihazlarında ${input.colorTemperatureKelvin}K göy/bənövşəyi çalarlı lampalar qadağandır — 150 ₼)`
    );
    recommendations.push(
      `İşıq temperaturunu qanuni 4300K (zavod ağ-sarımtıl) və ya 5000K-6000K (saf ağ) diapazonuna endirin.`
    );
    fineAmountAzn = Math.max(fineAmountAzn, 150);
  }

  // 3. Check rear lighting & smoked film & US red turn signals
  let isRearLightingLegal = true;

  if (input.hasSmokedTailLightFilm) {
    isRearLightingLegal = false;
    prohibitionOfOperationRisk = true;
    violationArticles.push(
      'YHQ Əlavə 1 Bölmə III bənd 3.6 & İXM Maddə 342.2-1 (Arxa stop və dönmə işıqlarının qara plyonka/lak ilə tündləşdirilməsi — 150 ₼)'
    );
    recommendations.push(
      'Arxa stop fənərlərinin üzərindəki tündləşdirici plyonkanı və ya lak örtüyünü dərhal təmizləyin.'
    );
    fineAmountAzn = Math.max(fineAmountAzn, 150);
  }

  if (input.hasRedRearTurnSignalsUsSpec) {
    isRearLightingLegal = false;
    violationArticles.push(
      'AZS / YHQ Əlavə 1 Bölmə III (ABŞ idxalı avtomobildə qırmızı arxa dönmə işıqları — Avropa/AZS standartı üzrə sarı/narıncı olmalıdır)'
    );
    recommendations.push(
      'ABŞ (DOT) standartlı qırmızı arxa dönmə siqnallarını narıncı (Amber LED) rejimə keçirin.'
    );
    if (fineAmountAzn === 0) {
      fineAmountAzn = 50;
    }
  }

  if (input.hasMalfunctioningStopOrLowBeam) {
    isRearLightingLegal = false;
    violationArticles.push(
      'YHQ Əlavə 1 Bölmə III bənd 3.3 & İXM Maddə 342.1.4 (Xarici işıq cihazlarının yanmaması və ya çirklənməsi — 50 ₼)'
    );
    recommendations.push(
      'Yanmayan yaxın işıq və ya arxa tormoz (stop) lampalarını istismara çıxmazdan əvvəl yeniləyin.'
    );
    fineAmountAzn = Math.max(fineAmountAzn, 50);
  }

  // 4. Check Special Flashing Beacons & Sirens (İXM Maddə 342.9 & YHQ Maddə 74)
  let isBeaconLegal = true;
  if (input.specialBeaconType === 'RED_BLUE_UNAUTHORIZED_STROBE') {
    isBeaconLegal = false;
    prohibitionOfOperationRisk = true;
    deviceConfiscationRisk = true;
    violationArticles.push(
      'İXM Maddə 342.9 & YHQ Maddə 74 (Qanunsuz qırmızı/göy sayrışan işıq "miqalka" və ya çoxtonlu səs siqnalı quraşdırılması — 500–800 ₼ cərimə + cihazın müsadirəsi)'
    );
    recommendations.push(
      'Qadağan olunmuş sayrışan stroboskop işıqları və xüsusi səs siqnallarını dərhal sökün (cihaz müsadirə edilir).'
    );
    fineAmountAzn = Math.max(fineAmountAzn, 650); // Midpoint of 500-800 AZN statutory penalty
  } else if (input.specialBeaconType === 'AMBER_NO_PERMIT') {
    isBeaconLegal = false;
    violationArticles.push(
      'YHQ Maddə 74.3 & İXM Maddə 342.2-1 (BDYP/AYNA icazəsi olmadan narıncı/sarı sayrışan işıq quraşdırılması — 150 ₼)'
    );
    recommendations.push(
      'Yol-təmir, evakuator və ya iriqabaritli yük daşıma üçün narıncı sayrışan işığı BDYP-də rəsmi qeydiyyatdan keçirin.'
    );
    fineAmountAzn = Math.max(fineAmountAzn, 150);
  }

  const isFullyCompliant =
    isHousingBulbCompatible && isKelvinLegal && isRearLightingLegal && isBeaconLegal;

  let verdictLevel: HeadlightAuditResult['verdictLevel'] = 'COMPLIANT';
  let verdictTitle = 'Tam Qanuni İşıqlandırma (YHQ Əlavə 1 Bölmə III Uyğundur)';
  let statutoryExplanation =
    'Nəqliyyat vasitəsinin xarici işıq cihazlarının tipi, rəng temperaturu (Kelvin), optik markalanması və iş rejimi YHQ Əlavə 1 Bölmə III və AZS standartlarına tam cavab verir.';

  if (input.specialBeaconType === 'RED_BLUE_UNAUTHORIZED_STROBE') {
    verdictLevel = 'SEVERE_BEACON_VIOLATION';
    verdictTitle = 'Ağır Qanun Pozuntusu: İXM Maddə 342.9 (Sayrışan İşıq / Müsadirə)';
    statutoryExplanation =
      'Operativ nəqliyyat vasitələri istisna olmaqla, mülki avtomobillərdə qırmızı/göy sayrışan işıqların və ya çoxtonlu səs siqnallarının quraşdırılması İXM Maddə 342.9 ilə 500–800 AZN cərimə və cihazın müsadirəsi ilə nəticələnir.';
  } else if (!isHousingBulbCompatible || !isKelvinLegal || input.hasSmokedTailLightFilm || input.specialBeaconType === 'AMBER_NO_PERMIT') {
    verdictLevel = 'CONSTRUCTIVE_VIOLATION';
    verdictTitle = 'Qadağan Olunmuş İşıq Modifikasiyası: İXM Maddə 342.2-1 (150 ₼)';
    statutoryExplanation =
      'Xarici işıq cihazlarının konstruksiyaya uyğun olmayan lampalarla (linzasız Ksenon/LED, >6000K göy çalar və ya qara stop plyonkası) dəyişdirilməsi İXM Maddə 342.2-1 üzrə 150 AZN cərimə və nöqsan aradan qaldırılanadək istismarın qadağan edilməsi yaradır.';
  } else if (!isRearLightingLegal) {
    verdictLevel = 'WARNING_DEFECT';
    verdictTitle = 'Texniki İşıq Nasazlığı: İXM Maddə 342.1.4 (50 ₼)';
    statutoryExplanation =
      'Xarici işıq cihazlarının yanmaması və ya ABŞ standartlı arxa qırmızı dönmə siqnalları texniki baxışdan keçməyə mane olur və İXM Maddə 342.1.4 üzrə 50 AZN cərimə riski yaradır.';
  }

  if (recommendations.length === 0) {
    recommendations.push(
      'Fara optikasını ildə 1 dəfə lazer reqloskop stendində yoxladın və şüşələri şəffaf saxlayın.'
    );
  }

  return {
    isHousingBulbCompatible,
    isKelvinLegal,
    isRearLightingLegal,
    isBeaconLegal,
    isFullyCompliant,
    requiresConstructiveAzsCert,
    prohibitionOfOperationRisk,
    deviceConfiscationRisk,
    fineAmountAzn,
    violationArticles,
    verdictLevel,
    verdictTitle,
    statutoryExplanation,
    recommendations,
  };
}

/**
 * Simulates BDYP Technical Inspection Optical Regloscope / Luxmeter Stand
 * according to AZS / GOST R 51709 / UNECE R112 standards.
 */
export function evaluateBeamRegloscope(input: RegloscopeTelemetryInput): RegloscopeAuditResult {
  const diagnosticNotes: string[] = [];

  // Mounting height determines statutory dip slope range:
  // <= 800mm (Sedans/Hatchbacks): -1.0% to -1.5%
  // > 800mm (SUVs/Crossovers/Trucks): -1.3% to -2.0%
  const isHighMountedSuv = input.mountingHeightMm > 800;
  const recommendedMinSlopePercent = isHighMountedSuv ? -2.0 : -1.5;
  const recommendedMaxSlopePercent = isHighMountedSuv ? -1.2 : -1.0;

  const isSlopeCompliant =
    input.verticalSlopePercent >= recommendedMinSlopePercent &&
    input.verticalSlopePercent <= recommendedMaxSlopePercent;

  const isHorizontalAligned =
    input.horizontalDeviationDeg >= -0.5 && input.horizontalDeviationDeg <= 0.5;

  const isLowBeamBrightEnough = input.lowBeamIntensityLuxAt25m >= 16;
  const isGlareWithinLimit = input.glareZoneLuxAboveCutOff <= 1.0;
  const isHighBeamCompliant = input.highBeamIntensityLuxAt25m >= 48;
  const isBeamPatternRightHandCompliant = input.beamPatternStandard === 'ECE_RIGHT_TRAFFIC';

  if (!isSlopeCompliant) {
    if (input.verticalSlopePercent > recommendedMaxSlopePercent) {
      diagnosticNotes.push(
        `Şüa mailliyi həddindən artıq yuxarıdır (${input.verticalSlopePercent}% > ${recommendedMaxSlopePercent}%) — qarşıdan gələn sürücülərin gözünü qamaşdırır!`
      );
    } else {
      diagnosticNotes.push(
        `Şüa mailliyi həddindən artıq aşağıdır (${input.verticalSlopePercent}% < ${recommendedMinSlopePercent}%) — gecə görmə məsafəsi təhlükəli dərəcədə qısalır.`
      );
    }
  }

  if (!isHorizontalAligned) {
    diagnosticNotes.push(
      `Üfüqi ox sapması (${input.horizontalDeviationDeg > 0 ? '+' : ''}${input.horizontalDeviationDeg}°) normadan (±0.5°) kənardır.`
    );
  }

  if (!isLowBeamBrightEnough) {
    diagnosticNotes.push(
      `Yaxın işıq şiddəti (${input.lowBeamIntensityLuxAt25m} Lux) minimum normadan (16 Lux) aşağıdır — reflektor yanması və ya şüşə bulanıqlığı ehtimalı.`
    );
  }

  if (!isGlareWithinLimit) {
    diagnosticNotes.push(
      `Qamaşdırma zonasında işıqlanma (${input.glareZoneLuxAboveCutOff} Lux) maksimum həddi (1.0 Lux) aşır!`
    );
  }

  if (input.beamPatternStandard === 'JDM_UK_LEFT_TRAFFIC') {
    diagnosticNotes.push(
      'Yaponiya/Böyük Britaniya (RHD) sol tərəfli 15° işıq bucağı aşkarlandı — sağtərəfli hərəkətdə qarşı zolağı birbaşa kor edir!'
    );
  } else if (input.beamPatternStandard === 'DOT_US_SYMMETRIC') {
    diagnosticNotes.push(
      'ABŞ (DOT/SAE) simmetrik işıq paylanması — sağ yol kənarı və nişanların işıqlandırılması Avropa ECE standartından zəifdir.'
    );
  }

  // Estimate visibility distance in meters based on height, slope, and intensity
  const slopeAbs = Math.max(0.4, Math.abs(input.verticalSlopePercent));
  const geometricReachMeters = (input.mountingHeightMm / 1000) / (slopeAbs / 100);
  const intensityFactor = Math.min(1.35, Math.max(0.55, input.lowBeamIntensityLuxAt25m / 28));
  const estimatedLowBeamVisibilityMeters = Math.round(
    Math.min(135, Math.max(25, geometricReachMeters * intensityFactor))
  );

  let oncomingGlareRisk: RegloscopeAuditResult['oncomingGlareRisk'] = 'NONE';
  if (
    input.beamPatternStandard === 'JDM_UK_LEFT_TRAFFIC' ||
    input.glareZoneLuxAboveCutOff > 2.2 ||
    input.verticalSlopePercent > -0.5
  ) {
    oncomingGlareRisk = 'CRITICAL_BLINDING';
  } else if (
    input.glareZoneLuxAboveCutOff > 1.0 ||
    input.verticalSlopePercent > recommendedMaxSlopePercent ||
    Math.abs(input.horizontalDeviationDeg) > 0.8
  ) {
    oncomingGlareRisk = 'HIGH_DAZZLE';
  } else if (input.glareZoneLuxAboveCutOff > 0.75) {
    oncomingGlareRisk = 'MODERATE';
  }

  const passesRegloscopeInspection =
    isSlopeCompliant &&
    isHorizontalAligned &&
    isLowBeamBrightEnough &&
    isGlareWithinLimit &&
    isHighBeamCompliant &&
    isBeamPatternRightHandCompliant;

  if (passesRegloscopeInspection) {
    diagnosticNotes.push(
      'Fara optikası BDYP Texniki Baxış (Reqloskop və Lyuksmetr) normativlərini uğurla keçdi.'
    );
  }

  return {
    recommendedMinSlopePercent,
    recommendedMaxSlopePercent,
    isSlopeCompliant,
    isHorizontalAligned,
    isLowBeamBrightEnough,
    isGlareWithinLimit,
    isHighBeamCompliant,
    isBeamPatternRightHandCompliant,
    passesRegloscopeInspection,
    estimatedLowBeamVisibilityMeters,
    oncomingGlareRisk,
    diagnosticNotes,
  };
}

/**
 * Calculates optical service, conversion, and AZS constructive certification costs.
 */
export function calculateLightingServiceEstimate(
  input: LightingServiceEstimateInput
): LightingServiceEstimateResult {
  const regloscopeFeeAzn = input.includeRegloscopeAiming
    ? input.center.regloscopeCalibrationFeeAzn
    : 0;
  const polishingFeeAzn = input.includeLensPolishing
    ? input.center.lensPolishingCeramicFeeAzn
    : 0;
  const jdmConversionFeeAzn = input.includeJdmToEceConversion
    ? input.center.jdmToEceConversionFeeAzn
    : 0;
  const usTurnConversionFeeAzn = input.includeUsAmberTurnConversion
    ? input.center.usAmberTurnConversionFeeAzn
    : 0;
  const biLedRetrofitFeeAzn = input.includeCertifiedBiLedRetrofit
    ? input.center.certifiedBiLedRetrofitFeeAzn
    : 0;
  const azsEndorsementFeeAzn =
    input.includeAzsConstructiveEndorsement && input.center.hasAzsConstructiveLab ? 90 : 0;

  const totalCostAzn =
    regloscopeFeeAzn +
    polishingFeeAzn +
    jdmConversionFeeAzn +
    usTurnConversionFeeAzn +
    biLedRetrofitFeeAzn +
    azsEndorsementFeeAzn;

  let estimatedDurationHours = 0;
  if (input.includeRegloscopeAiming) estimatedDurationHours += 0.5;
  if (input.includeLensPolishing) estimatedDurationHours += 1.5;
  if (input.includeJdmToEceConversion) estimatedDurationHours += 2.5;
  if (input.includeUsAmberTurnConversion) estimatedDurationHours += 2.0;
  if (input.includeCertifiedBiLedRetrofit) estimatedDurationHours += 4.0;
  if (input.includeAzsConstructiveEndorsement && input.center.hasAzsConstructiveLab) {
    estimatedDurationHours += 1.0;
  }

  let visibilityGainMeters = 0;
  if (input.includeRegloscopeAiming) visibilityGainMeters += 12;
  if (input.includeLensPolishing) visibilityGainMeters += 18;
  if (input.includeJdmToEceConversion) visibilityGainMeters += 15;
  if (input.includeCertifiedBiLedRetrofit) visibilityGainMeters += 42;

  const passesBdypInspectionAfterService =
    !input.includeCertifiedBiLedRetrofit ||
    (input.includeAzsConstructiveEndorsement && input.center.hasAzsConstructiveLab);

  return {
    regloscopeFeeAzn,
    polishingFeeAzn,
    jdmConversionFeeAzn,
    usTurnConversionFeeAzn,
    biLedRetrofitFeeAzn,
    azsEndorsementFeeAzn,
    totalCostAzn,
    estimatedDurationHours: Number(estimatedDurationHours.toFixed(1)),
    visibilityGainMeters,
    passesBdypInspectionAfterService,
  };
}

/**
 * Generates an official BDYP & AZS Optical Headlight Compliance Certificate.
 */
export function generateHeadlightCertificate(params: {
  plateNumber: string;
  vin: string;
  vehicleTitle: string;
  housingMarking: HeadlampHousingMarking;
  installedBulbLabel: string;
  colorTemperatureKelvin: number;
  measuredSlopePercent: number;
  measuredGlareLux: number;
  beamStandardLabel: string;
  inspectionCenterName: string;
  hasAzsConstructiveEndorsement?: boolean;
}): HeadlightComplianceCertificate {
  const cleanPlate = (params.plateNumber || '99-XX-001').trim().toUpperCase();
  const cleanVin = (params.vin || 'WBA00000000000000').trim().toUpperCase();

  let hashAcc = 0;
  const seed = `${cleanPlate}-${cleanVin}-${params.colorTemperatureKelvin}`;
  for (let i = 0; i < seed.length; i++) {
    hashAcc = (hashAcc * 31 + seed.charCodeAt(i)) % 90000;
  }
  const serialNum = String(10000 + Math.abs(hashAcc)).slice(0, 5);

  return {
    certificateNumber: `BDYP-FARA-2026-${serialNum}`,
    issueDate: '2026-10-17',
    expiryDate: '2027-10-17',
    plateNumber: cleanPlate,
    vin: cleanVin,
    vehicleTitle: params.vehicleTitle || 'Nəqliyyat Vasitəsi',
    housingMarking: params.housingMarking,
    installedBulbLabel: params.installedBulbLabel,
    colorTemperatureKelvin: params.colorTemperatureKelvin,
    measuredSlopePercent: params.measuredSlopePercent,
    measuredGlareLux: params.measuredGlareLux,
    beamStandardLabel: params.beamStandardLabel,
    inspectionCenterName: params.inspectionCenterName,
    complianceStatus: params.hasAzsConstructiveEndorsement
      ? 'ŞƏRTİ QEYDİYYAT (AZS SERTİFİKATLI)'
      : 'KEÇİB (QANUNİ / STANDARTA UYĞUN)',
    qrVerificationHash: `AZS-OPTIC-${serialNum}-${cleanPlate.replace(/[^A-Z0-9]/g, '')}`,
  };
}

/**
 * Derives realistic default headlight audit parameters from a Vehicle object.
 */
export function getVehicleDefaultLightingProfile(vehicle?: Vehicle | null): {
  housingMarking: HeadlampHousingMarking;
  installedBulb: InstalledBulbType;
  mountingHeightMm: number;
  colorTemperatureKelvin: number;
} {
  if (!vehicle) {
    return {
      housingMarking: 'LED_OEM_MODULE',
      installedBulb: 'oem_led_matrix',
      mountingHeightMm: 720,
      colorTemperatureKelvin: 5500,
    };
  }

  const isSuvOrTruck =
    vehicle.bodyType === 'suv' ||
    vehicle.bodyType === 'pickup' ||
    vehicle.bodyType === 'minivan';
  const mountingHeightMm = isSuvOrTruck ? 860 : 680;

  if (vehicle.year >= 2020 || vehicle.fuelType === 'electric') {
    return {
      housingMarking: 'LED_OEM_MODULE',
      installedBulb: 'oem_led_matrix',
      mountingHeightMm,
      colorTemperatureKelvin: 5500,
    };
  }

  if (vehicle.year >= 2014) {
    return {
      housingMarking: 'DC_DCR_XENON',
      installedBulb: 'oem_xenon_d2s_d4s',
      mountingHeightMm,
      colorTemperatureKelvin: 4300,
    };
  }

  return {
    housingMarking: 'HCR_HALOGEN',
    installedBulb: 'halogen_oem',
    mountingHeightMm,
    colorTemperatureKelvin: 4300,
  };
}

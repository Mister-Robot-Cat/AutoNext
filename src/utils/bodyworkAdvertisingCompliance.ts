import { Currency } from '../types/vehicle';
import {
  BodyWrapTypeId,
  AdPlacementTypeId,
  BullbarHitchStatusId,
  BODY_WRAP_PROFILES,
  ADVERTISING_REGULATION_PROFILES,
  EXTERIOR_HARDWARE_PROFILES,
  BODYWORK_SERVICE_PACKAGES,
  SAMPLE_BODYWORK_CERTIFICATES,
  BodyworkComplianceCertificate,
} from '../data/mockBodyworkAdvertisingData';

export interface BodyColorWrapInput {
  wrapType: BodyWrapTypeId;
  wrapCoveragePercent: number; // >30% contrasting color/matte wrap requires Texpasport endorsement
  daysSinceWrapApplied: number; // Statutory registration window under YHQ Article 27: 10 days
  isEndorsedInTexpasport: boolean;
}

export interface BodyColorWrapResult {
  isCompliant: boolean;
  exceeds30PercentThreshold: boolean;
  exceeds10DayGraceWindow: boolean;
  requiresTexpasportUpdate: boolean;
  isProhibitedOperativeScheme: boolean;
  prohibitsOperation: boolean;
  fineAzn: number;
  discountedFineAzn: number;
  meroStateDutyAzn: number; // 30 AZN Texpasport + 20 AZN inspection = 50 AZN
  recommendedTexpasportNoteAz: string;
  legalArticlesTriggered: string[];
  violationsAz: string[];
  recommendationsAz: string[];
  verdictBadgeAz: string;
}

export interface VehicleAdvertisingInput {
  adPlacementType: AdPlacementTypeId;
  adCoveragePercent: number; // >50% surface requires Texpasport "Reklamlı" endorsement
  hasAdraClearance: boolean;
  isEndorsedInTexpasport: boolean;
  coversWindowsOrLights: boolean;
  hasSoundAmplifierOrRoofSign: boolean;
}

export interface VehicleAdvertisingResult {
  isCompliant: boolean;
  exceeds50PercentSurface: boolean;
  requiresAdraPermit: boolean;
  requiresTexpasportAdNote: boolean;
  prohibitsOperation: boolean;
  driverFineAzn: number; // IXM 342.1.8: 50 AZN
  officialEntityFineAzn: number; // IXM 348 / 428: 150 - 300 AZN
  legalArticlesTriggered: string[];
  violationsAz: string[];
  recommendationsAz: string[];
  verdictTitleAz: string;
}

export interface ExteriorHardwareAuditInput {
  hardwareProfile: BullbarHitchStatusId;
  farkopTrailerSocketWorking: boolean;
  roofBoxMounted: boolean;
  totalVehicleHeightMeters: number; // Statutory max loaded height: 4.0 m (YHQ Art. 57)
  roofCargoProtrusionMeters: number; // >1.0 m requires warning flag/reflector, >2.0 m requires special permit
  fuelTankCapSealed: boolean; // YHQ Annex 1 Clause 6.1
}

export interface ExteriorHardwareAuditResult {
  isCompliant: boolean;
  blocksLicensePlateDqn: boolean;
  illegalSteelKenguryatnik: boolean;
  heightLimitExceeded: boolean;
  protrusionRequiresWarningSign: boolean;
  fuelCapMissingViolation: boolean;
  prohibitsOperationImmediately: boolean;
  fineAzn: number;
  legalArticlesTriggered: string[];
  violationsAz: string[];
  recommendationsAz: string[];
  verdictAz: string;
}

export interface BodyworkServiceSummary {
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
 * Evaluates exterior paint, matte/color vinyl wrap, and two-tone roof compliance
 * under YHQ Article 27, Annex 1 Clause 7.14, and IXM Articles 342.1.1 / 342.2-1 / 342.9.
 */
export function evaluateBodyColorWrapCompliance(
  input: BodyColorWrapInput
): BodyColorWrapResult {
  const profile =
    BODY_WRAP_PROFILES.find((p) => p.id === input.wrapType) || BODY_WRAP_PROFILES[0];

  const violationsAz: string[] = [];
  const recommendationsAz: string[] = [];
  const legalArticlesTriggered: string[] = [profile.legalBasisAz];

  const isClearPpfOrFactory =
    input.wrapType === 'oem_factory_paint' || input.wrapType === 'clear_ppf_shield';

  const exceeds30PercentThreshold =
    !isClearPpfOrFactory && input.wrapCoveragePercent > 30;

  const exceeds10DayGraceWindow = input.daysSinceWrapApplied > 10;

  if (profile.isProhibitedOperativeScheme) {
    violationsAz.push(
      'YHQ Əlavə 1 Bənd 7.14: Operativ nəqliyyat vasitələrinin (DYP, Təcili Yardım, FHN) rəng-qrafik sxemlərinin mülki avtomobillərə çəkilməsi qəti qadağandır!'
    );
    recommendationsAz.push(
      'İXM Maddə 342.9 üzrə 500–800 AZN cərimə və avtomobilin cərimə meydançasına aparılmasının qarşısını almaq üçün operativ zolaqları dərhal sökün.'
    );
    return {
      isCompliant: false,
      exceeds30PercentThreshold: true,
      exceeds10DayGraceWindow,
      requiresTexpasportUpdate: false,
      isProhibitedOperativeScheme: true,
      prohibitsOperation: true,
      fineAzn: 800,
      discountedFineAzn: 800, // Court/administrative confiscation article
      meroStateDutyAzn: 0,
      recommendedTexpasportNoteAz: profile.texpasportColorNoteAz,
      legalArticlesTriggered: ['YHQ Əlavə 1 Bənd 7.14', 'İXM Maddə 342.9 (500–800 AZN)'],
      violationsAz,
      recommendationsAz,
      verdictBadgeAz: 'QADAĞAN EDİLMİŞ OPERATİV SXEM (İXM 342.9 — 800 ₼)',
    };
  }

  const requiresTexpasportUpdate =
    profile.requiresTexpasportUpdate || exceeds30PercentThreshold;

  let fineAzn = 0;
  let meroStateDutyAzn = 0;
  let prohibitsOperation = false;

  if (requiresTexpasportUpdate && !input.isEndorsedInTexpasport) {
    meroStateDutyAzn = 50; // 30 AZN Texpasport + 20 AZN MERO visual inspection
    if (exceeds10DayGraceWindow) {
      fineAzn = 150;
      prohibitsOperation = true;
      legalArticlesTriggered.push('İXM Maddə 342.2-1 (150 AZN) / YHQ Maddə 27');
      violationsAz.push(
        `Kuzov səthinin ${input.wrapCoveragePercent}%-i rəngli/mat vinil və ya ikirəngli örtüklə dəyişdirilib və qanuni 10 günlük müddət (${input.daysSinceWrapApplied} gün) ötüb, lakin Texpasportda rəsmiləşdirilməyib.`
      );
      recommendationsAz.push(
        'BDYP MERO-ya müraciət edərək 50 AZN dövlət rüsumu (30 AZN Texpasport + 20 AZN müayinə) ilə yeni rəng çalarını və ya «İkirəngli / Tutqun (Mat)» qeydini Texpasporta işlədin.'
      );
    } else {
      violationsAz.push(
        `Rəng/vinil dəyişikliyi (>30% səth) üzrə 10 günlük qanuni qeydiyyat müddətinin bitməsinə ${Math.max(
          0,
          10 - input.daysSinceWrapApplied
        )} gün qalıb.`
      );
      recommendationsAz.push(
        '10 günlük müddət bitmədən BDYP MERO-da cəriməsiz (yalnız 50 AZN rüsumla) Texpasportu yeniləyin.'
      );
    }
  } else if (requiresTexpasportUpdate && input.isEndorsedInTexpasport) {
    recommendationsAz.push(
      'Kuzov rəng dəyişikliyi və ya mat/xameleon vinil örtüyü Texpasportda rəsmi qeydiyyatdadır — yol patrul yoxlamasında və MERO alqı-satqısında tam qanunidir.'
    );
  } else {
    recommendationsAz.push(
      'Şəffaf qoruyucu PPF və ya 30%-dən az sahəni tutan panoram qara dam vinili üçün Texpasport dəyişikliyi tələb olunmur (0 AZN rüsum).'
    );
  }

  const isCompliant =
    !requiresTexpasportUpdate ||
    input.isEndorsedInTexpasport ||
    !exceeds10DayGraceWindow;

  let verdictBadgeAz = 'YHQ Maddə 27 — Rəng & Kuzov Tam Qanunidir';
  if (!isCompliant) {
    verdictBadgeAz = 'Qeydiyyatsız Rəng/Vinil (>30% Sahə — İXM 342.2-1: 150 ₼)';
  } else if (requiresTexpasportUpdate && !input.isEndorsedInTexpasport) {
    verdictBadgeAz = '10 Günlük Qeydiyyat Pəncərəsi Aktivdir (50 ₼ MERO Rüsumu)';
  }

  return {
    isCompliant,
    exceeds30PercentThreshold,
    exceeds10DayGraceWindow,
    requiresTexpasportUpdate,
    isProhibitedOperativeScheme: false,
    prohibitsOperation,
    fineAzn,
    discountedFineAzn: Math.round(fineAzn * 0.5),
    meroStateDutyAzn,
    recommendedTexpasportNoteAz: profile.texpasportColorNoteAz,
    legalArticlesTriggered,
    violationsAz,
    recommendationsAz,
    verdictBadgeAz,
  };
}

/**
 * Evaluates commercial branding & vehicle advertising compliance under
 * Article 26 of the Law on Advertising, YHQ Annex 1, and IXM Article 342.1.8.
 */
export function evaluateVehicleAdvertisingCompliance(
  input: VehicleAdvertisingInput
): VehicleAdvertisingResult {
  const profile =
    ADVERTISING_REGULATION_PROFILES.find((p) => p.id === input.adPlacementType) ||
    ADVERTISING_REGULATION_PROFILES[0];

  const violationsAz: string[] = [];
  const recommendationsAz: string[] = [];
  const legalArticlesTriggered: string[] = [profile.legalBasisAz];

  const isNoAd = input.adPlacementType === 'no_advertising' && input.adCoveragePercent === 0;
  const exceeds50PercentSurface = !isNoAd && input.adCoveragePercent > 50;
  const requiresAdraPermit = !isNoAd || profile.requiresAdraNotification;
  const requiresTexpasportAdNote =
    profile.requiresTexpasportAdvertisingNote || exceeds50PercentSurface;

  let driverFineAzn = profile.driverFineAzn;
  let officialEntityFineAzn = profile.officialFineAzn;
  let prohibitsOperation = profile.prohibitsOperation;

  if (input.coversWindowsOrLights || input.adPlacementType === 'window_or_light_obstructing') {
    driverFineAzn = Math.max(driverFineAzn, 50);
    officialEntityFineAzn = Math.max(officialEntityFineAzn, 200);
    prohibitsOperation = true;
    legalArticlesTriggered.push('İXM Maddə 342.1.8 (50 AZN) & YHQ Əlavə 1 Bənd 7.3');
    violationsAz.push(
      'Reklam plonkası sürücünün görünüş bucağını (alın/ön yan şüşələri) və ya xarici işıq cihazlarını örtür — istismar qadağandır!'
    );
  }

  if (
    input.hasSoundAmplifierOrRoofSign ||
    input.adPlacementType === 'traffic_sign_imitation_or_audio'
  ) {
    driverFineAzn = Math.max(driverFineAzn, 50);
    officialEntityFineAzn = Math.max(officialEntityFineAzn, 300);
    prohibitsOperation = true;
    legalArticlesTriggered.push('«Reklam haqqında» Qanun Maddə 26.5');
    violationsAz.push(
      'Nəqliyyat vasitəsindən səsucaldan qurğu ilə səsli reklam yayımı və ya yol nişanlarını təqlid edən lövhə quraşdırılması qanunla qadağandır.'
    );
  }

  if (requiresTexpasportAdNote && !input.isEndorsedInTexpasport) {
    driverFineAzn = Math.max(driverFineAzn, 50);
    officialEntityFineAzn = Math.max(officialEntityFineAzn, 150);
    violationsAz.push(
      `Reklam örtüyü kuzov səthinin 50%-dən çoxunu (${input.adCoveragePercent}%) tutur, lakin Texpasportda «Reklamlı / Kombinə edilmiş» qeydi yoxdur.`
    );
    recommendationsAz.push(
      'Reklam sahəsini 50%-dən aşağı endirin və ya BDYP MERO-da Texpasporta «Reklamlı» qeydi əlavə etdirin.'
    );
  }

  if (requiresAdraPermit && !input.hasAdraClearance && !isNoAd) {
    driverFineAzn = Math.max(driverFineAzn, 50);
    officialEntityFineAzn = Math.max(officialEntityFineAzn, 150);
    violationsAz.push(
      'Avtomobil üzərindəki kommersiya reklam eskizi ADRA (Dövlət Reklam Agentliyi) və BDYP texniki təhlükəsizlik reyestrində razılaşdırılmayıb.'
    );
    recommendationsAz.push(
      'ADRA elektron portalı vasitəsilə nəqliyyat üzərində reklam eskizini təsdiqlədin.'
    );
  }

  const isCompliant = violationsAz.length === 0 && driverFineAzn === 0;

  if (isCompliant) {
    recommendationsAz.push(
      'Avtomobil üzərindəki brendinq «Reklam haqqında» Qanun Maddə 26 və BDYP görünüş təhlükəsizliyi normativlərinə tam uyğundur.'
    );
  }

  return {
    isCompliant,
    exceeds50PercentSurface,
    requiresAdraPermit,
    requiresTexpasportAdNote,
    prohibitsOperation,
    driverFineAzn,
    officialEntityFineAzn,
    legalArticlesTriggered,
    violationsAz,
    recommendationsAz,
    verdictTitleAz: isCompliant
      ? 'ADRA & BDYP Reklam Normativinə Tam Uyğundur'
      : `Reklam Pozuntusu Aşkarlandı (İXM 342.1.8 — Sürücü: ${driverFineAzn} ₼ / Vəzifəli: ${officialEntityFineAzn} ₼)`,
  };
}

/**
 * Evaluates exterior bullbars ("Kenguryatnik"), tow hitches ("Farkop"),
 * roof cargo boxes, and fuel tank cap compliance under YHQ Annex 1 Clauses 6.1, 7.6, 7.11 and YHQ Art. 57.
 */
export function evaluateExteriorHardwareCompliance(
  input: ExteriorHardwareAuditInput
): ExteriorHardwareAuditResult {
  const profile =
    EXTERIOR_HARDWARE_PROFILES.find((p) => p.id === input.hardwareProfile) ||
    EXTERIOR_HARDWARE_PROFILES[0];

  const violationsAz: string[] = [];
  const recommendationsAz: string[] = [];
  const legalArticlesTriggered: string[] = [profile.legalBasisAz];

  let fineAzn = profile.fineAzn;
  let prohibitsOperationImmediately = profile.prohibitsOperation;

  const blocksLicensePlateDqn = profile.blocksLicensePlate;
  const illegalSteelKenguryatnik =
    input.hardwareProfile === 'unregistered_steel_kenguryatnik';

  if (blocksLicensePlateDqn) {
    violationsAz.push(
      'Sabit «Farkop» topuzu qoşqu qoşulmadıqda arxa Dövlət Qeydiyyat Nişanının (DQN) simvollarını örtür (İXM 342.1.3 — 40 AZN).'
    );
    recommendationsAz.push(
      'Qoşqu yedəkləmədikdə farkopun topuz başlığını çıxarın və ya tez-çıxarılan (Quick-Release) ISO-50 mexanizminə keçin.'
    );
  }

  if (illegalSteelKenguryatnik) {
    violationsAz.push(
      'YHQ Əlavə 1 Bənd 7.11: Bufer xəttindən irəli çıxan sənədsiz polad «Kenguryatnik» piyada təhlükəsizliyi normativini pozur (İXM 342.2-1 — 150 AZN + Cərimə meydançası).'
    );
    recommendationsAz.push(
      'Sertifikatsız dəmir qoruyucunu sökün və ya AZS 597 laboratoriyasında sınaqdan keçirib Texpasportda rəsmiləşdirin.'
    );
  }

  if (
    input.hardwareProfile === 'removable_certified_farkop' &&
    !input.farkopTrailerSocketWorking
  ) {
    fineAzn = Math.max(fineAzn, 50);
    prohibitsOperationImmediately = true;
    legalArticlesTriggered.push('YHQ Əlavə 1 Bənd 7.6 (İşıq rozetkası nasazlığı)');
    violationsAz.push(
      'Farkopun 7/13-pin qoşqu elektrik rozetkası nasazdır — qoşqunun tormoz və dönmə işıqları işləmədiyi üçün yedəkləmə qadağandır.'
    );
  }

  const heightLimitExceeded =
    input.roofBoxMounted && input.totalVehicleHeightMeters > 4.0;
  const protrusionRequiresWarningSign =
    input.roofBoxMounted && input.roofCargoProtrusionMeters > 1.0;

  if (heightLimitExceeded) {
    fineAzn = Math.max(fineAzn, 100);
    prohibitsOperationImmediately = true;
    legalArticlesTriggered.push('YHQ Maddə 57 (Maksimal qabarit hündürlüyü: 4.0 m)');
    violationsAz.push(
      `Dam baqajı ilə birlikdə avtomobilin ümumi hündürlüyü (${input.totalVehicleHeightMeters.toFixed(
        2
      )} m) qanuni 4.0 metr həddini aşır.`
    );
  }

  if (protrusionRequiresWarningSign) {
    legalArticlesTriggered.push('YHQ Maddə 57.4 (>1.0 m çıxıntı üçün «İriqabaritli yük» nişanı)');
    if (input.roofCargoProtrusionMeters > 2.0) {
      fineAzn = Math.max(fineAzn, 100);
      violationsAz.push(
        `Damdakı yük ön/arxa qabaritdən ${input.roofCargoProtrusionMeters.toFixed(
          1
        )} m kənara çıxır (>2.0 m xüsusi BDYP icazəsi tələb edir).`
      );
    } else {
      recommendationsAz.push(
        'Yük qabaritdən 1.0 metrdən çox (≤2.0 m) kənara çıxdığı üçün qırmızı-ağ diaqonal zolaqlı «İriqabaritli yük» nişanı və gecə reflektoru taxılmalıdır.'
      );
    }
  }

  const fuelCapMissingViolation = !input.fuelTankCapSealed;
  if (fuelCapMissingViolation) {
    fineAzn = Math.max(fineAzn, 50);
    prohibitsOperationImmediately = true;
    legalArticlesTriggered.push('YHQ Əlavə 1 Bənd 6.1 (Yanacaq çəni qapağı və hermetikllik)');
    violationsAz.push(
      'Yanacaq çəninin boğazlıq qapağı yoxdur və ya bağlanmır — buxarlanma və yanğın təhlükəsi səbəbindən texniki baxışdan imtina edilir.'
    );
  }

  const isCompliant = violationsAz.length === 0 && fineAzn === 0;

  return {
    isCompliant,
    blocksLicensePlateDqn,
    illegalSteelKenguryatnik,
    heightLimitExceeded,
    protrusionRequiresWarningSign,
    fuelCapMissingViolation,
    prohibitsOperationImmediately,
    fineAzn,
    legalArticlesTriggered,
    violationsAz,
    recommendationsAz,
    verdictAz: isCompliant
      ? 'Xarici Avadanlıq (Farkop, Bufer & Dam Baqajı) Normativə Tam Uyğundur'
      : `Avadanlıq Uyğunsuzluğu Aşkarlandı (Cərimə Riski: ${fineAzn} ₼)`,
  };
}

/**
 * Calculates total cost and fines avoided for selected bodywork, MERO color registration,
 * ADRA clearance, and farkop conversion service packages.
 */
export function calculateBodyworkServiceSummary(
  selectedPackageIds: string[],
  currency: Currency
): BodyworkServiceSummary {
  const chosen = BODYWORK_SERVICE_PACKAGES.filter((p) =>
    selectedPackageIds.includes(p.id)
  );

  const stateDutyAndPartsAzn = chosen.reduce(
    (sum, item) => sum + item.stateDutyOrPartsAzn,
    0
  );
  const laborCostAzn = chosen.reduce((sum, item) => sum + item.laborCostAzn, 0);
  const totalAzn = stateDutyAndPartsAzn + laborCostAzn;
  const totalDurationMinutes = chosen.reduce(
    (sum, item) => sum + item.durationMinutes,
    0
  );
  const finesAvoidedAzn = chosen.reduce(
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

export interface GenerateBodyworkCertificateParams {
  vehiclePlate: string;
  vin: string;
  vehicleModel: string;
  recordedTexpasportColorAz: string;
  wrapAndPaintStatusAz: string;
  adraPermitNumber?: string;
  farkopAndRoofStatusAz: string;
  inspectingCenterAz: string;
}

/**
 * Generates an official BDYP-KUZ-2026 electronic bodywork, color, and advertising compliance certificate.
 */
export function generateBodyworkComplianceCertificate(
  params: GenerateBodyworkCertificateParams
): BodyworkComplianceCertificate {
  const cleanPlate = params.vehiclePlate.trim().toUpperCase() || '90-KZ-777';
  const cleanVin = params.vin.trim().toUpperCase() || 'WBS8M9C50J5K41820';

  const seed = (cleanPlate + cleanVin)
    .split('')
    .reduce((acc, ch, i) => acc + ch.charCodeAt(0) * (i + 13), 20260);
  const fiveDigits = String(10000 + (seed % 89999)).slice(0, 5);

  return {
    certificateNumber: `BDYP-KUZ-2026-${fiveDigits}`,
    issueDate: '18.10.2026',
    expiryDate: '18.10.2028',
    vehiclePlate: cleanPlate,
    vin: cleanVin,
    vehicleModel: params.vehicleModel.trim() || 'BMW M5 Competition',
    recordedTexpasportColorAz:
      params.recordedTexpasportColorAz.trim() || 'Ağ-Qara İkirəngli (Qeydiyyatda)',
    wrapAndPaintStatusAz:
      params.wrapAndPaintStatusAz.trim() ||
      'YHQ Maddə 27 üzrə Texpasport rəngi ilə tam uyğundur',
    adraPermitNumber:
      params.adraPermitNumber?.trim() || 'Tələb olunmur (Şəxsi Nəqliyyat)',
    farkopAndRoofStatusAz:
      params.farkopAndRoofStatusAz.trim() ||
      'YHQ Əlavə 1 Bənd 7.6 & 7.11 normativlərinə tam uyğundur',
    inspectingCenterAz: params.inspectingCenterAz,
    verificationHash: `AZ-KUZ-${fiveDigits}-${cleanPlate.replace(/[^A-Z0-9]/g, '')}`,
    overallStatus: 'PASS',
  };
}

/**
 * Looks up a BDYP-KUZ-2026 certificate by certificate number, license plate, or VIN.
 */
export function lookupBodyworkCertificate(
  query: string,
  customCertificates: BodyworkComplianceCertificate[] = []
): BodyworkComplianceCertificate | null {
  const q = query.trim().toUpperCase();
  if (!q) return null;

  const pool = [...customCertificates, ...SAMPLE_BODYWORK_CERTIFICATES];
  return (
    pool.find(
      (c) =>
        c.certificateNumber.toUpperCase() === q ||
        c.vehiclePlate.toUpperCase() === q ||
        c.vin.toUpperCase() === q
    ) || null
  );
}

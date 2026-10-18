import { Currency } from '../types/vehicle';
import {
  EngineForensicStatusId,
  LicensePlateConditionId,
  RearRecessFormat,
  MountedPlateType,
  ENGINE_FORENSIC_PROFILES,
  LICENSE_PLATE_CONDITIONS,
  FORENSIC_SERVICE_PACKAGES,
  SAMPLE_FORENSIC_CERTIFICATES,
  ForensicPlateCertificate,
} from '../data/mockForensicPlateData';

export interface EngineVinForensicInput {
  texpasportEngineNumber: string;
  blockEngineNumber: string;
  forensicStatus: EngineForensicStatusId;
  hasDgkCustomsDeclaration: boolean;
  hasJusticeForensicCertificate: boolean;
  vinPaintThicknessMicrons: number; // Normal factory VIN strut tower / firewall paint: 70 - 150 µm; >250 µm indicates putty/weld risk
}

export interface EngineVinForensicResult {
  isCompliantForMeroTransfer: boolean;
  numbersExactMatch: boolean;
  requiresDgkDeclaration: boolean;
  requiresForensicLabCorrosionAct: boolean;
  requiresTexpasportEndorsement: boolean;
  prohibitsOperation: boolean;
  triggersCriminalInvestigation: boolean; // CM Article 320
  vinSeamSuspicious: boolean;
  fineAzn: number;
  discountedFineAzn: number;
  stateDutyAzn: number;
  totalEstimatedCostAzn: number;
  ixmAndLegalArticles: string[];
  violationsAz: string[];
  recommendationsAz: string[];
  verdictBadgeAz: string;
  forensicIntegrityScore: number; // 0 to 100
}

export interface LicensePlateAuditInput {
  plateCondition: LicensePlateConditionId;
  rearRecessFormat: RearRecessFormat;
  mountedRearPlateType: MountedPlateType;
  rearPlateLampWorking: boolean;
  measuredNightVisibilityMeters: number; // Statutory minimum: 20m at night
  measuredDayVisibilityMeters: number; // Statutory minimum: 40m in daylight
  rfidChipReadable: boolean;
}

export interface LicensePlateAuditResult {
  isCompliant: boolean;
  passes20mNightRule: boolean;
  passes40mDayRule: boolean;
  squarePlateMismatch: boolean;
  rfidTagPass: boolean;
  isDeliberateObstructionIxm342_7: boolean;
  requiresImpoundOrConfiscation: boolean;
  fineMinAzn: number;
  fineMaxAzn: number;
  penaltyPoints: number;
  duplicatePlateFeeAzn: number;
  ixmArticlesTriggered: string[];
  violationsAz: string[];
  recommendationsAz: string[];
  verdictTitleAz: string;
}

export interface SrsAndFluidHermeticityInput {
  driverAirbagOhm: number; // Normal pyrotechnic squib: 1.8 - 2.8 Ω
  driverAirbagCapacitanceUf: number; // Genuine squib capacitor: 0.4 - 1.2 µF; Fake carbon resistor "Obmanka": 0.00 µF!
  seatbeltPretensionerWorking: boolean;
  srsCrashDataStoredInEcu: boolean;
  fuelSystemLeakDetected: boolean; // YHQ Annex 1 Clause 6.1: immediate operation prohibition
  oilDripDropsPerMinute: number; // > 20 drops/min fails technical inspection
}

export interface SrsAndFluidHermeticityResult {
  isCompliant: boolean;
  obmankaResistorFraudDetected: boolean;
  srsSystemIntact: boolean;
  fuelHermeticityPass: boolean;
  oilLeakPass: boolean;
  prohibitsOperationImmediately: boolean;
  fineAzn: number;
  estimatedRepairCostAzn: number;
  violationsAz: string[];
  verdictAz: string;
}

export interface ForensicServiceSummary {
  selectedPackageIds: string[];
  stateDutyAndPartsAzn: number;
  serviceLaborAzn: number;
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
 * Audits engine serial number vs Texpasport record, DGK customs declaration,
 * corrosion forensic status, and VIN firewall paint seam thickness.
 */
export function evaluateEngineVinForensics(
  input: EngineVinForensicInput
): EngineVinForensicResult {
  const profile =
    ENGINE_FORENSIC_PROFILES.find((p) => p.id === input.forensicStatus) ||
    ENGINE_FORENSIC_PROFILES[0];

  const cleanTexpasport = input.texpasportEngineNumber.trim().toUpperCase();
  const cleanBlock = input.blockEngineNumber.trim().toUpperCase();
  const numbersExactMatch =
    cleanTexpasport.length > 0 &&
    cleanBlock.length > 0 &&
    cleanTexpasport === cleanBlock &&
    input.forensicStatus === 'oem_matching';

  const violationsAz: string[] = [];
  const recommendationsAz: string[] = [];
  const ixmAndLegalArticles: string[] = [profile.legalBasisAz];
  let forensicIntegrityScore = 100;

  let fineAzn = profile.fineAzn;
  let stateDutyAzn = profile.stateDutyAzn;
  let requiresDgkDeclaration = false;
  let requiresForensicLabCorrosionAct = profile.requiresForensicLab;
  let requiresTexpasportEndorsement = profile.requiresTexpasportUpdate;
  let prohibitsOperation = profile.prohibitsOperation;
  let triggersCriminalInvestigation = input.forensicStatus === 'tampered_welded';

  // Check if numbers mismatch even when user selected oem_matching
  if (
    input.forensicStatus === 'oem_matching' &&
    cleanTexpasport !== cleanBlock
  ) {
    requiresTexpasportEndorsement = true;
    stateDutyAzn = 50;
    forensicIntegrityScore -= 30;
    violationsAz.push(
      `Texpasportdakı mühərrik nömrəsi (${cleanTexpasport || 'Qeyd edilməyib'}) ilə blok üzərindəki faktiki nömrə (${cleanBlock || 'N/Z'}) uyğun gəlmir (YHQ Maddə 27).`
    );
    recommendationsAz.push(
      'Alqı-satqı zamanı BDYP MERO-da imtina almamaq üçün DGK gömrük bəyannaməsi əsasında Texpasportda yeni mühərrik nömrəsi rəsmiləşdirilməlidir (30 AZN Texpasport + 20 AZN müayinə).'
    );
  }

  if (input.forensicStatus === 'swapped_declared') {
    forensicIntegrityScore -= 20;
    violationsAz.push(
      'Avtomobilə dəyişdirilmiş ("kontrakt") mühərrik quraşdırılıb, lakin yeni nömrə hələ Texpasporta işlənməyib.'
    );
    recommendationsAz.push(
      'DGK Yük Gömrük Bəyannaməsini BDYP MERO-ya təqdim edərək 50 AZN rüsumla Texpasportu yeniləyin.'
    );
  } else if (input.forensicStatus === 'swapped_undeclared') {
    requiresDgkDeclaration = !input.hasDgkCustomsDeclaration;
    if (input.hasDgkCustomsDeclaration) {
      // If user now provides DGK declaration, downgrade from undeclared to declared
      prohibitsOperation = false;
      fineAzn = 0;
      forensicIntegrityScore -= 25;
      violationsAz.push(
        'Mühərrik dəyişdirilib; gömrük bəyannaməsi təqdim olunduğu üçün yalnız Texpasport yenilənməsi (50 AZN) tələb olunur.'
      );
    } else {
      forensicIntegrityScore -= 55;
      ixmAndLegalArticles.push('İXM Maddə 342.2-1 (150 AZN)');
      violationsAz.push(
        'Mühərrik sənədsiz dəyişdirilib (DGK gömrük bəyannaməsi və ya rəsmi alqı-satqı sənədi yoxdur) — MERO qeydiyyatdan imtina edir və İXM 342.2-1 üzrə 150 AZN cərimə tətbiq olunur.'
      );
      recommendationsAz.push(
        'Mühərriki satan idxalçıdan rəsmi DGK gömrük bəyannaməsinin surətini tələb edin və ya rəsmi ekspertiza ilə mənşə arayışı alın.'
      );
    }
  } else if (input.forensicStatus === 'corroded_illegible') {
    if (input.hasJusticeForensicCertificate) {
      requiresForensicLabCorrosionAct = false;
      stateDutyAzn = 50; // Only Texpasport update needed
      forensicIntegrityScore -= 15;
      recommendationsAz.push(
        'Ədliyyə Nazirliyi Məhkəmə Ekspertizası rəyi mövcuddur — BDYP MERO-da Texpasportun "Xüsusi qeydlər" xanasına «Mühərrik N/Z koroziya» möhürü vurdurun.'
      );
    } else {
      forensicIntegrityScore -= 40;
      violationsAz.push(
        'Mühərrik blokunun nömrə meydançası paslanma (koroziya) səbəbindən oxunmur — ekspertiza rəyi olmadan MERO qeydiyyat aparmır.'
      );
      recommendationsAz.push(
        'Ədliyyə Nazirliyi Məhkəmə Ekspertizası Mərkəzində kimyəvi-trasoloji müayinədən keçərək nömrənin təbii koroziyaya uğradığı barədə rəsmi akt alın (60 AZN).'
      );
    }
  } else if (input.forensicStatus === 'tampered_welded') {
    forensicIntegrityScore = 5;
    ixmAndLegalArticles.push('AR CM Maddə 320', 'İXM Maddə 96.1');
    violationsAz.push(
      'KRİTİK TƏHLÜKƏ: VIN və ya mühərrik nömrəsi panelində qaynaq tikişi / mexaniki yenidən döyülmə izləri aşkarlandı! Nəqliyyat vasitəsi dərhal saxlanılır.'
    );
    recommendationsAz.push(
      'Bu avtomobili qətiyyən almayın və ya beh (avans) verməyin — kriminal saxtalaşdırma cinayət məsuliyyəti yaradır.'
    );
  }

  // Check VIN panel paint thickness (normal OEM strut tower / firewall is 60 - 160 µm)
  const vinSeamSuspicious = input.vinPaintThicknessMicrons > 220;
  if (vinSeamSuspicious) {
    forensicIntegrityScore = Math.max(0, forensicIntegrityScore - 25);
    requiresForensicLabCorrosionAct = true;
    violationsAz.push(
      `VIN nömrə lövhəsi ətrafında boya qalınlığı normadan yüksəkdir (${input.vinPaintThicknessMicrons} µm > 220 µm) — şpatlyovka və ya kuza kəsilib-qaynaq edilmə ("konstruktor") şübhəsi!`
    );
    recommendationsAz.push(
      'Meyvəli MERO kriminalistik bokslarında ultrasəs və maqnit-optik defektoskopiya ilə VIN tikişlərini yoxladın.'
    );
  }

  forensicIntegrityScore = Math.max(0, Math.min(100, forensicIntegrityScore));

  const isCompliantForMeroTransfer =
    numbersExactMatch &&
    !vinSeamSuspicious &&
    !prohibitsOperation &&
    !triggersCriminalInvestigation;

  const discountedFineAzn = Math.round(fineAzn * 0.5 * 100) / 100;

  return {
    isCompliantForMeroTransfer,
    numbersExactMatch,
    requiresDgkDeclaration,
    requiresForensicLabCorrosionAct,
    requiresTexpasportEndorsement,
    prohibitsOperation,
    triggersCriminalInvestigation,
    vinSeamSuspicious,
    fineAzn,
    discountedFineAzn,
    stateDutyAzn,
    totalEstimatedCostAzn: fineAzn + stateDutyAzn,
    ixmAndLegalArticles,
    violationsAz,
    recommendationsAz,
    verdictBadgeAz: isCompliantForMeroTransfer
      ? 'MERO Qeydiyyatına Tam Uyğundur'
      : triggersCriminalInvestigation
      ? 'Kriminal Bloklama (CM 320)'
      : 'Rəsmiləşdirmə / Ekspertiza Tələb Olunur',
    forensicIntegrityScore,
  };
}

/**
 * Audits license plate (DQN) optical readability at 20m/40m, rear illumination,
 * US/JDM square tailgate fitment (Type-2 288x206mm), RFID microchip, and
 * İXM 342.1.3 (40 AZN) vs İXM 342.7 (500-800 AZN + 4 points) penalties.
 */
export function evaluateLicensePlateCompliance(
  input: LicensePlateAuditInput
): LicensePlateAuditResult {
  const conditionSpec =
    LICENSE_PLATE_CONDITIONS.find((c) => c.id === input.plateCondition) ||
    LICENSE_PLATE_CONDITIONS[0];

  const violationsAz: string[] = [];
  const recommendationsAz: string[] = [];
  const ixmArticlesTriggered: string[] = [];

  const passes20mNightRule =
    input.rearPlateLampWorking &&
    input.measuredNightVisibilityMeters >= 20 &&
    !conditionSpec.isDeliberateObstruction &&
    input.plateCondition !== 'dirty_faded_40azn';

  const passes40mDayRule =
    input.measuredDayVisibilityMeters >= 40 &&
    !conditionSpec.isDeliberateObstruction &&
    input.plateCondition !== 'dirty_faded_40azn';

  const squarePlateMismatch =
    input.rearRecessFormat === 'us_jdm_square_288x206' &&
    input.mountedRearPlateType === 'type1_single_line_520';

  const rfidTagPass =
    input.rfidChipReadable &&
    conditionSpec.rfidSignalValid &&
    !squarePlateMismatch;

  let fineMinAzn = conditionSpec.fineMinAzn;
  let fineMaxAzn = conditionSpec.fineMaxAzn;
  let penaltyPoints = conditionSpec.penaltyPoints;
  let duplicatePlateFeeAzn = 0;

  if (conditionSpec.isDeliberateObstruction) {
    ixmArticlesTriggered.push('İXM Maddə 342.7 (500–800 AZN & 4 bal)');
    violationsAz.push(conditionSpec.descriptionAz);
    recommendationsAz.push(
      'Anti-radar IR plyonkanı, maqnit çərçivəni dərhal sökün və hər iki DQN-i AZS 598 standart yerinə bərkidin.'
    );
  } else if (input.plateCondition === 'dirty_faded_40azn') {
    ixmArticlesTriggered.push('İXM Maddə 342.1.3 (40 AZN)');
    violationsAz.push(conditionSpec.descriptionAz);
    recommendationsAz.push(
      'Nömrə nişanının boyası silinibsə, özbaşına qara markerlə rəngləməyin (saxtalaşdırma sayıla bilər) — BDYP MERO-da 22 AZN dövlət rüsumu ilə yeni dublikat alın.'
    );
    duplicatePlateFeeAzn = 22;
  }

  if (!passes20mNightRule && !conditionSpec.isDeliberateObstruction) {
    if (!ixmArticlesTriggered.includes('İXM Maddə 342.1.3 (40 AZN)')) {
      ixmArticlesTriggered.push('İXM Maddə 342.1.3 (40 AZN)');
    }
    fineMinAzn = Math.max(fineMinAzn, 40);
    fineMaxAzn = Math.max(fineMaxAzn, 40);
    violationsAz.push(
      `Qaranlıqda arxa DQN görünüş məsafəsi normadan aşağıdır (${input.measuredNightVisibilityMeters} m < 20 m) və ya arxa nömrə işığı yanmır (YHQ Əlavə 1, Bənd 7.2).`
    );
    recommendationsAz.push(
      'Arxa nömrə işıqlandırma plafonunu ağ rəngli OEM LED lampa ilə əvəz edin (qırmızı və ya göy işıq qadağandır).'
    );
  }

  if (squarePlateMismatch) {
    if (!ixmArticlesTriggered.includes('İXM Maddə 342.1.3 (40 AZN)')) {
      ixmArticlesTriggered.push('İXM Maddə 342.1.3 (40 AZN)');
    }
    fineMinAzn = Math.max(fineMinAzn, 40);
    fineMaxAzn = Math.max(fineMaxAzn, 40);
    duplicatePlateFeeAzn = 22;
    violationsAz.push(
      'ABŞ/Yaponiya standartlı kvadrat baqaj yuvasına uzun (520×112 mm) nömrənin əyilərək bərkidilməsi AZS 598 standartını pozur və daxili RFID çip antenasını qırır.'
    );
    recommendationsAz.push(
      'BDYP MERO-ya müraciət edərək 22 AZN dövlət rüsumu ilə rəsmi Tip-2 (288×206 mm ikisətirli kvadrat) arxa nömrə sifariş edin.'
    );
  }

  if (!rfidTagPass && !squarePlateMismatch) {
    violationsAz.push(
      'Dövlət qeydiyyat nişanının daxili UHF RFID mikroçipi BDYP İ-Patrul skaneri tərəfindən oxunmur (zədələnmiş və ya köhnə nəsil çipsiz lövhə).'
    );
    duplicatePlateFeeAzn = 22;
    recommendationsAz.push(
      'Yeni nəsil elektron RFID mikroçipli DQN dublikatının alınması tövsiyə olunur (22 AZN).'
    );
  }

  const isCompliant =
    passes20mNightRule &&
    passes40mDayRule &&
    !squarePlateMismatch &&
    rfidTagPass &&
    !conditionSpec.isDeliberateObstruction &&
    input.plateCondition === 'clean_standard';

  return {
    isCompliant,
    passes20mNightRule,
    passes40mDayRule,
    squarePlateMismatch,
    rfidTagPass,
    isDeliberateObstructionIxm342_7: conditionSpec.isDeliberateObstruction,
    requiresImpoundOrConfiscation: conditionSpec.requiresConfiscationOrImpound,
    fineMinAzn,
    fineMaxAzn,
    penaltyPoints,
    duplicatePlateFeeAzn,
    ixmArticlesTriggered,
    violationsAz,
    recommendationsAz,
    verdictTitleAz: isCompliant
      ? 'AZS 598 & BDYP İ-Patrul Standartına Tam Uyğundur'
      : conditionSpec.isDeliberateObstruction
      ? 'AĞIR QANUN POZUNTUSU: İXM 342.7 (500–800 AZN + 4 Bal)'
      : 'İXM 342.1.3 Xəbərdarlığı (40 AZN) / Dublikat Tələbi',
  };
}

/**
 * Evaluates SRS Airbag pyrotechnic squib impedance vs fake 2.2 Ohm "Obmanka" carbon resistor,
 * seatbelt pretensioners, fuel system hermeticity (YHQ Annex 1 Clause 6.1), and oil drip rate.
 */
export function evaluateSrsAndFluidHermeticity(
  input: SrsAndFluidHermeticityInput
): SrsAndFluidHermeticityResult {
  const violationsAz: string[] = [];
  let estimatedRepairCostAzn = 0;
  let fineAzn = 0;

  // Genuine pyrotechnic squib has 1.8 - 2.8 Ohm AND > 0.3 uF bridge-wire capacitance.
  // A soldered 2.2 Ohm resistor ("Obmanka") shows ~2.2 Ohm resistance but ~0.0 uF capacitance!
  const ohmInNormalRange =
    input.driverAirbagOhm >= 1.8 && input.driverAirbagOhm <= 2.8;
  const obmankaResistorFraudDetected =
    ohmInNormalRange && input.driverAirbagCapacitanceUf < 0.25;

  const srsSystemIntact =
    ohmInNormalRange &&
    !obmankaResistorFraudDetected &&
    input.seatbeltPretensionerWorking &&
    !input.srsCrashDataStoredInEcu;

  if (obmankaResistorFraudDetected) {
    estimatedRepairCostAzn += 190;
    fineAzn = Math.max(fineAzn, 50);
    violationsAz.push(
      `DİQQƏT — "OBMANKA" SAXTAKARLIĞI: Sükan Airbag dövrəsində ${input.driverAirbagOhm.toFixed(
        1
      )} Ω müqavimət görünməsinə baxmayaraq piropatron tutumu ${input.driverAirbagCapacitanceUf.toFixed(
        2
      )} µF-dir (<0.25 µF) — açılmış şarın yerinə saxta 2.2 Ω rezistor lehimlənib!`
    );
  } else if (!ohmInNormalRange || input.srsCrashDataStoredInEcu || !input.seatbeltPretensionerWorking) {
    estimatedRepairCostAzn += 190;
    fineAzn = Math.max(fineAzn, 50);
    violationsAz.push(
      'SRS Airbag və ya pirotexniki təhlükəsizlik kəməri dartıcısında (Pretensioner) nasazlıq / Crash-Data qeydi var (YHQ Əlavə 1, Bənd 7.8).'
    );
  }

  const fuelHermeticityPass = !input.fuelSystemLeakDetected;
  if (!fuelHermeticityPass) {
    estimatedRepairCostAzn += 120;
    fineAzn = Math.max(fineAzn, 150);
    violationsAz.push(
      'YANĞIN TƏHLÜKƏSİ: Yanacaq sistemi qeyri-hermetikdir və yanacaq sızması aşkarlanıb (YHQ Əlavə 1, Bənd 6.1 — İstismarı qəti qadağandır!).'
    );
  }

  const oilLeakPass = input.oilDripDropsPerMinute <= 20;
  if (!oilLeakPass) {
    estimatedRepairCostAzn += 120;
    fineAzn = Math.max(fineAzn, 50);
    violationsAz.push(
      `Mühərrik/transmissiya yağ sızması normadan yüksəkdir (${input.oilDripDropsPerMinute} damcı/dəq > 20 damcı/dəq) — DYP Texniki Baxışdan keçmir.`
    );
  }

  const isCompliant = srsSystemIntact && fuelHermeticityPass && oilLeakPass;

  return {
    isCompliant,
    obmankaResistorFraudDetected,
    srsSystemIntact,
    fuelHermeticityPass,
    oilLeakPass,
    prohibitsOperationImmediately: !fuelHermeticityPass,
    fineAzn,
    estimatedRepairCostAzn,
    violationsAz,
    verdictAz: isCompliant
      ? 'SRS Pirotexnika Orijinaldır & Yanacaq/Yağ Sistemi Hermetikdir'
      : !fuelHermeticityPass
      ? 'TƏCİLİ İSTİSMAR QADAĞASI: Yanacaq Sızması (YHQ Əlavə 1 Bənd 6.1)'
      : obmankaResistorFraudDetected
      ? 'SAXTA AIRBAG ("Obmanka" 2.2 Ω Rezistor) Aşkarlandı!'
      : 'SRS / Hermetiklik Bərpası Tələb Olunur',
  };
}

/**
 * Calculates total official state duties & restoration package costs.
 */
export function calculateForensicServiceSummary(
  selectedPackageIds: string[],
  currency: Currency = 'AZN'
): ForensicServiceSummary {
  let stateDutyAndPartsAzn = 0;
  let serviceLaborAzn = 0;
  let totalDurationMinutes = 0;

  for (const pkgId of selectedPackageIds) {
    const pkg = FORENSIC_SERVICE_PACKAGES.find((p) => p.id === pkgId);
    if (pkg) {
      stateDutyAndPartsAzn += pkg.officialFeeOrPartsAzn;
      serviceLaborAzn += pkg.serviceOrLaborAzn;
      totalDurationMinutes += pkg.durationMinutes;
    }
  }

  const totalAzn = stateDutyAndPartsAzn + serviceLaborAzn;
  const finesAvoidedAzn = selectedPackageIds.length > 0 ? 500 : 0;

  return {
    selectedPackageIds,
    stateDutyAndPartsAzn,
    serviceLaborAzn,
    totalAzn,
    totalInCurrency: convertFromAzn(totalAzn, currency),
    currency,
    totalDurationMinutes,
    finesAvoidedAzn,
  };
}

/**
 * Generates an official BDYP Criminalistic Forensic & DQN Compliance Certificate (`BDYP-EKS-2026-XXXXX`).
 */
export function generateForensicPlateCertificate(params: {
  vehiclePlate: string;
  vin: string;
  vehicleModel: string;
  recordedEngineNumber: string;
  inspectedEngineNumber: string;
  plateFormat: MountedPlateType;
  plateNightReadabilityMeters: number;
  inspectingCenterAz: string;
}): ForensicPlateCertificate {
  const cleanPlate = (params.vehiclePlate || '90-AA-700').trim().toUpperCase();
  const suffix = Math.floor(10000 + Math.random() * 89999);
  const issueDate = '2026-10-18';
  const expiryDate = '2027-10-18';

  return {
    certificateNumber: `BDYP-EKS-2026-${suffix}`,
    issueDate,
    expiryDate,
    vehiclePlate: cleanPlate,
    vin: (params.vin || 'WBA5A5C50FD918420').trim().toUpperCase(),
    vehicleModel: params.vehicleModel || 'BMW 528i (F10)',
    recordedEngineNumber: params.recordedEngineNumber || 'N20B20A-89412055',
    inspectedEngineNumber: params.inspectedEngineNumber || 'N20B20A-89412055',
    engineForensicVerdict:
      params.recordedEngineNumber === params.inspectedEngineNumber
        ? 'CLEAN_MATCH'
        : 'UPDATED_CONTRACT_ENGINE',
    plateFormat: params.plateFormat,
    plateNightReadabilityMeters: Math.max(20, params.plateNightReadabilityMeters),
    rfidTagUid: `AZ-UHF-${cleanPlate.replace(/[^A-Z0-9]/g, '')}-E280`,
    srsSquibVerified: true,
    fluidHermeticityPassed: true,
    inspectingCenterAz: params.inspectingCenterAz,
    expertRankAndName: 'Polis mayoru R. Kərimov',
    qrSecurityHash: `BDYP-EKS-HASH-${cleanPlate.replace(/[^A-Z0-9]/g, '')}-2026-VERIFIED`,
  };
}

/**
 * Searches the unified BDYP Forensic & DQN Registry by certificate number or license plate.
 */
export function lookupForensicCertificate(
  query: string,
  customCertificates: ForensicPlateCertificate[] = []
): ForensicPlateCertificate | null {
  const normalized = query.trim().toUpperCase();
  if (!normalized) return null;

  const all = [...customCertificates, ...SAMPLE_FORENSIC_CERTIFICATES];
  return (
    all.find(
      (c) =>
        c.certificateNumber.toUpperCase() === normalized ||
        c.vehiclePlate.toUpperCase() === normalized ||
        c.vin.toUpperCase() === normalized
    ) || null
  );
}

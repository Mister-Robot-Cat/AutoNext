import { Currency } from '../types/vehicle';
import {
  DriverCategory,
  ColorVisionDiagnosis,
  DispensaryStatus,
  DispensaryRecord,
  MedicalCenter,
  MedicalServicePackage,
  DriverMedicalCertificate,
  RABKIN_TEST_PLATES,
  MOCK_DISPENSARY_DATABASE,
  MOCK_MEDICAL_CENTERS,
  MOCK_MEDICAL_PACKAGES,
  MOCK_EXISTING_CERTIFICATES
} from '../data/mockDriverMedicalData';

export interface MedicalAuditParams {
  targetCategory: DriverCategory;
  age: number;
  visualAcuityBetterEye: number; // e.g. 1.0
  visualAcuityWorseEye: number;  // e.g. 0.6
  withCorrection: boolean;       // eynəklə və ya kontakt linza ilə
  colorVision: ColorVisionDiagnosis;
  hearingLossDb: number;         // e.g. 15-20 dB
  hasEpilepsyOrSyncope: boolean;
  hasSevereCardiovascular: boolean;
  hasLimbLossWithoutAdaptation: boolean;
  narcologyDispensaryStatus: DispensaryStatus;
  psychoneurologyDispensaryStatus: DispensaryStatus;
}

export interface MedicalAuditResult {
  isEligible: boolean;
  eligibilityScore: number; // 0 to 100
  validityYears: number;
  eyeCorrectionRequired: boolean;
  hearingAidRequired: boolean;
  handControlsRequired: boolean;
  disqualificationReasons: string[];
  specialEndorsements: string[];
  recommendedPackageId: string;
  categoryAdviceAz: string;
}

export interface RabkinEvaluationResult {
  correctCount: number;
  totalPlates: number;
  diagnosis: ColorVisionDiagnosis;
  diagnosisAz: string;
  allowsAmateurB: boolean;
  allowsProfessionalCD: boolean;
  clinicalNoteAz: string;
}

export interface SobrietyAuditResult {
  bloodAlcoholPromille: number;
  breathAlcoholMgL: number;
  isSober: boolean;
  classification: 'SOBER' | 'MILD_INTOXICATION' | 'MODERATE_INTOXICATION' | 'SEVERE_INTOXICATION' | 'TEST_REFUSAL';
  statusAz: string;
  legalArticle: string;
  fineAzn: number;
  discountedFineAzn: number;
  suspensionMonths: number;
  suspensionRangeTextAz: string;
  penaltyPoints: number;
  isAdministrativeDetentionRisk: boolean;
  clinicalSymptomsAz: string;
}

/**
 * Currency conversion helper
 */
export function convertFromAzn(amountAzn: number, currency: Currency): number {
  switch (currency) {
    case 'USD':
      return Math.round(amountAzn * 0.588 * 100) / 100;
    case 'EUR':
      return Math.round(amountAzn * 0.54 * 100) / 100;
    case 'AZN':
    default:
      return Math.round(amountAzn * 100) / 100;
  }
}

/**
 * Format currency string
 */
export function formatMedicalCurrency(amountAzn: number, currency: Currency): string {
  const converted = convertFromAzn(amountAzn, currency);
  switch (currency) {
    case 'USD':
      return `$${converted.toFixed(2)}`;
    case 'EUR':
      return `€${converted.toFixed(2)}`;
    case 'AZN':
    default:
      return `${converted.toFixed(2)} ₼`;
  }
}

/**
 * Comprehensive Medical Eligibility Evaluation Engine (Forma AZS-083/e)
 */
export function evaluateMedicalEligibility(params: MedicalAuditParams): MedicalAuditResult {
  const disqualificationReasons: string[] = [];
  const specialEndorsements: string[] = [];
  let score = 100;

  const isProfessional = ['C1_C', 'CE', 'D1_D', 'TAXI'].includes(params.targetCategory);

  // 1. Vision Acuity
  let eyeCorrectionRequired = false;
  const betterEye = Math.max(params.visualAcuityBetterEye, params.visualAcuityWorseEye);
  const worseEye = Math.min(params.visualAcuityBetterEye, params.visualAcuityWorseEye);

  if (isProfessional) {
    if (betterEye < 0.8 || worseEye < 0.4) {
      disqualificationReasons.push(
        `Peşəkar kateqoriyalar üçün görmə itiliyi normadan aşağıdır (Tələb: yaxşı görən göz ≥ 0.8, zəif göz ≥ 0.4; Faktiki: ${betterEye} / ${worseEye}).`
      );
      score -= 35;
    }
  } else {
    if (betterEye < 0.6 || worseEye < 0.2) {
      disqualificationReasons.push(
        `Görmə itiliyi minimal normadan aşağıdır (Tələb: yaxşı görən göz ≥ 0.6, zəif göz ≥ 0.2; Faktiki: ${betterEye} / ${worseEye}).`
      );
      score -= 35;
    }
  }

  if (params.withCorrection) {
    eyeCorrectionRequired = true;
    specialEndorsements.push('01.01 — Eynək və ya kontakt linzalarla idarəetmə məcburidir');
  }

  // 2. Color Vision
  if (params.colorVision === 'TOTAL_COLOR_BLINDNESS') {
    disqualificationReasons.push('Tam rəng korluğu (axromaziya) zamanı bütün kateqoriyalar üzrə sürücülük qadağandır.');
    score -= 40;
  } else if (params.colorVision === 'PROTANOPIA' || params.colorVision === 'DEUTERANOPIA') {
    if (isProfessional) {
      disqualificationReasons.push(
        'Qırmızı-yaşıl dixromaziya (Protanopiya/Deyteranopiya) peşəkar yük, avtobus və taksi (C, D, Taksi) sürməyə icazə vermir.'
      );
      score -= 30;
    } else {
      specialEndorsements.push('İşıqfor rənglərini fərqləndirmə tələbi ilə B kateqoriyasına şərti icazə');
      score -= 10;
    }
  }

  // 3. Hearing
  let hearingAidRequired = false;
  if (params.hearingLossDb > 50) {
    if (isProfessional) {
      disqualificationReasons.push(`Ağır eşitmə zəifliyi (${params.hearingLossDb} dB) peşəkar sərnişin və yük daşımaları üçün qadağandır.`);
      score -= 25;
    } else {
      hearingAidRequired = true;
      specialEndorsements.push('02.01 — Eşitmə aparatı ilə idarəetmə');
      score -= 10;
    }
  } else if (params.hearingLossDb > 30 && isProfessional) {
    hearingAidRequired = true;
    specialEndorsements.push('Eşitmə korreksiyası ilə peşəkar idarəetmə');
    score -= 10;
  }

  // 4. Paroxysmal / Severe Medical Conditions
  if (params.hasEpilepsyOrSyncope) {
    disqualificationReasons.push('Epilepsiya, huşitirmə tutmaları və ya paroksizmal vəziyyətlər zamanı nəqliyyat vasitəsi idarə etmək qəti qadağandır.');
    score -= 50;
  }

  if (params.hasSevereCardiovascular) {
    disqualificationReasons.push('Dekompassiya olunmuş ağır ürək-damar xəstəlikləri (Aritmiya, NYHA III-IV çatışmazlıq) səbəbindən yararsızdır.');
    score -= 35;
  }

  // 5. Physical Mobility
  let handControlsRequired = false;
  if (params.hasLimbLossWithoutAdaptation) {
    if (isProfessional) {
      disqualificationReasons.push('Ətraf orqanların hərəki məhdudiyyəti peşəkar C/D/Taksi kateqoriyalarına yol vermir.');
      score -= 30;
    } else {
      handControlsRequired = true;
      specialEndorsements.push('20.06 — Əl ilə idarəetmə adaptasiyalı avtomobil (xüsusi konstruksiya)');
      score -= 15;
    }
  }

  // 6. Dispensary Records
  if (params.narcologyDispensaryStatus === 'REGISTERED_ADDICTION') {
    disqualificationReasons.push('Narkoloji dispanserdə asılılıq qeydiyyatı mövcuddur (İXM Maddə 334 əsasında qadağandır).');
    score -= 50;
  } else if (params.narcologyDispensaryStatus === 'UNDER_OBSERVATION') {
    disqualificationReasons.push('Narkoloji profilaktik müşahidə altındadır; təkrar toksikoloji rəy tələb olunur.');
    score -= 25;
  }

  if (params.psychoneurologyDispensaryStatus === 'RESTRICTED_DISORDER') {
    disqualificationReasons.push('Psixonevroloji dispanserdə ağır psixi pozuntu ilə qeydiyyatdadır (Yararsızdır).');
    score -= 50;
  }

  // Validity calculation based on age and category
  let validityYears = 10;
  if (isProfessional) {
    validityYears = 1;
  } else if (params.age >= 70) {
    validityYears = 1;
  } else if (params.age >= 60) {
    validityYears = 2;
  } else if (params.age < 60) {
    validityYears = 10;
  }

  const isEligible = disqualificationReasons.length === 0;
  const finalScore = Math.max(0, Math.min(100, isEligible ? score : Math.min(score, 45)));

  let recommendedPackageId = 'pkg_standard_b';
  if (isProfessional) {
    recommendedPackageId = 'pkg_professional_c_d';
  } else if (params.age >= 60) {
    recommendedPackageId = 'pkg_express_asan';
  }

  const categoryAdviceAz = isEligible
    ? `Pasiyent ${params.targetCategory} kateqoriyası üzrə Forma AZS-083/e rəqəmsal şəhadətnaməsini almağa tam yararlıdır (${validityYears} il etibarlılıq).`
    : `Pasiyentdə ${disqualificationReasons.length} ədəd kritik tibbi məhdudiyyət aşkarlandığı üçün ${params.targetCategory} kateqoriyası üzrə arayış verilə bilməz.`;

  return {
    isEligible,
    eligibilityScore: finalScore,
    validityYears,
    eyeCorrectionRequired,
    hearingAidRequired,
    handControlsRequired,
    disqualificationReasons,
    specialEndorsements,
    recommendedPackageId,
    categoryAdviceAz
  };
}

/**
 * Rabkin Color Blindness Test Evaluator
 */
export function evaluateRabkinTest(answers: Record<string, string>): RabkinEvaluationResult {
  let correctCount = 0;
  let protanopeCount = 0;
  let deuteranopeCount = 0;
  let totalBlindCount = 0;

  const totalPlates = RABKIN_TEST_PLATES.length;

  RABKIN_TEST_PLATES.forEach((plate) => {
    const userVal = (answers[plate.id] || '').trim();
    if (userVal === plate.normalAnswer) {
      correctCount++;
    } else if (userVal === plate.totalBlindAnswer && plate.deuteranopeAnswer !== plate.totalBlindAnswer) {
      totalBlindCount++;
    } else if (userVal === plate.protanopeAnswer) {
      protanopeCount++;
    } else if (userVal === plate.deuteranopeAnswer) {
      deuteranopeCount++;
    }

    if (userVal === 'Görmürəm') {
      totalBlindCount++;
    }
  });

  let diagnosis: ColorVisionDiagnosis = 'NORMAL_TRICHROMACY';
  let diagnosisAz = 'Normal Trixromaziya (Rəng duyğusu tam normal)';
  let allowsAmateurB = true;
  let allowsProfessionalCD = true;
  let clinicalNoteAz = 'Qırmızı, yaşıl və göy spektrlərini tam həcmdə ayırd edir. Bütün kateqoriyalar üçün məhdudiyyətsizdir.';

  if (totalBlindCount >= 4) {
    diagnosis = 'TOTAL_COLOR_BLINDNESS';
    diagnosisAz = 'Tam Rəng Korluğu (Axromaziya)';
    allowsAmateurB = false;
    allowsProfessionalCD = false;
    clinicalNoteAz = 'Rənglərin ayırd edilməsi tamamilə yoxdur. Heç bir nəqliyyat vasitəsini idarə etməyə icazə verilmir.';
  } else if (protanopeCount >= 2 && protanopeCount >= deuteranopeCount) {
    diagnosis = 'PROTANOPIA';
    diagnosisAz = 'Protanopiya (Qırmızı rəng korluğu / anomaliyası)';
    allowsAmateurB = true;
    allowsProfessionalCD = false;
    clinicalNoteAz = 'Qırmızı spektr reseptorlarının çatışmazlığı. B kateqoriyasına icazə verilir, lakin peşəkar C/D/Taksi qadağandır.';
  } else if (deuteranopeCount >= 2) {
    diagnosis = 'DEUTERANOPIA';
    diagnosisAz = 'Deyteranopiya (Yaşıl rəng korluğu / anomaliyası)';
    allowsAmateurB = true;
    allowsProfessionalCD = false;
    clinicalNoteAz = 'Yaşıl spektr reseptorlarının zəifliyi. YHQ qaydalarına əsasən kommersiya daşımalarına buraxılmır.';
  } else if (correctCount < totalPlates) {
    diagnosis = 'NORMAL_TRICHROMACY';
    diagnosisAz = 'Normal Trixromaziya (Yüngül yorğunluq əlamətləri)';
    allowsAmateurB = true;
    allowsProfessionalCD = true;
    clinicalNoteAz = `${correctCount}/${totalPlates} lövhə düzgün oxundu. Klinik əhəmiyyətli patologiya təsdiqlənmədi.`;
  }

  return {
    correctCount,
    totalPlates,
    diagnosis,
    diagnosisAz,
    allowsAmateurB,
    allowsProfessionalCD,
    clinicalNoteAz
  };
}

/**
 * Driver Sobriety and Toxicology Telemetry Engine (İXM Maddə 333 / 334)
 */
export function evaluateSobrietyAndToxicology(
  bloodAlcoholPromille: number,
  refusedTest = false
): SobrietyAuditResult {
  // Convert BAC ‰ to exhaled breath air mg/L (Ratio approx ~0.46)
  const breathAlcoholMgL = Math.round(bloodAlcoholPromille * 0.46 * 100) / 100;

  if (refusedTest) {
    return {
      bloodAlcoholPromille: 0,
      breathAlcoholMgL: 0,
      isSober: false,
      classification: 'TEST_REFUSAL',
      statusAz: 'Müayinədən İmtina (İXM Maddə 334.1)',
      legalArticle: 'İXM Maddə 334.1 (Sərxoşluq vəziyyətinin müayinəsindən imtina edilməsi)',
      fineAzn: 400,
      discountedFineAzn: 200,
      suspensionMonths: 12,
      suspensionRangeTextAz: '6 aydan 1 ilədək sürücülük hüququndan məhrumetmə',
      penaltyPoints: 5,
      isAdministrativeDetentionRisk: false,
      clinicalSymptomsAz: 'Sürücü qanuni polisin və həkim-toksikoloqun tibbi müayinə tələbinə qəsdən tabe olmamışdır.'
    };
  }

  // Statutory tolerance under Azerbaijan law: 0.28 promille
  if (bloodAlcoholPromille <= 0.28) {
    return {
      bloodAlcoholPromille,
      breathAlcoholMgL,
      isSober: true,
      classification: 'SOBER',
      statusAz: 'Ayıq (Qanuni İcazə Verilən Hədd — ≤0.28 ‰)',
      legalArticle: 'İXM Maddə 333 (Xəta yoxdur)',
      fineAzn: 0,
      discountedFineAzn: 0,
      suspensionMonths: 0,
      suspensionRangeTextAz: 'Məhrumetmə tətbiq edilmir',
      penaltyPoints: 0,
      isAdministrativeDetentionRisk: false,
      clinicalSymptomsAz: 'Alkoqolun klinik təsiri aşkar edilməmişdir. Psixomotor reaksiyalar və koordinasiya tam normadadır.'
    };
  }

  if (bloodAlcoholPromille <= 0.50) {
    return {
      bloodAlcoholPromille,
      breathAlcoholMgL,
      isSober: false,
      classification: 'MILD_INTOXICATION',
      statusAz: 'Yüngül Dərəcəli Alkoqol Sərxoşluğu (0.28 - 0.50 ‰)',
      legalArticle: 'İXM Maddə 333.1 (Nəqliyyat vasitəsini alkoqol sərxoşluğu vəziyyətində idarə etmə)',
      fineAzn: 400,
      discountedFineAzn: 200,
      suspensionMonths: 6,
      suspensionRangeTextAz: '6 aydan 1 ilədək sürücülük hüququndan məhrumetmə və ya 400 ₼ cərimə',
      penaltyPoints: 5,
      isAdministrativeDetentionRisk: false,
      clinicalSymptomsAz: 'Yüngül eyforiya, diqqətin konsentrasiyasında azalma, periferik görmə sahəsinin daralması.'
    };
  }

  if (bloodAlcoholPromille <= 1.00) {
    return {
      bloodAlcoholPromille,
      breathAlcoholMgL,
      isSober: false,
      classification: 'MODERATE_INTOXICATION',
      statusAz: 'Orta Dərəcəli Sərxoşluq (0.50 - 1.00 ‰)',
      legalArticle: 'İXM Maddə 333.2 (Təkrar və ya orta dərəcəli sərxoş vəziyyətdə idarə etmə)',
      fineAzn: 700,
      discountedFineAzn: 350,
      suspensionMonths: 18,
      suspensionRangeTextAz: '1 ildən 2 ilədək müddətə sürücülük hüququndan məhrumetmə',
      penaltyPoints: 5,
      isAdministrativeDetentionRisk: false,
      clinicalSymptomsAz: 'Nitqin ləngiməsi, vestibulyar aparatın pozulması, Romberq pozasında dayanıqsızlıq, nistaqm.'
    };
  }

  return {
    bloodAlcoholPromille,
    breathAlcoholMgL,
    isSober: false,
    classification: 'SEVERE_INTOXICATION',
    statusAz: 'Ağır Dərəcəli Toksiki Sərxoşluq (>1.00 ‰)',
    legalArticle: 'İXM Maddə 333.4 / 334.2 (Ağır dərəcəli sərxoşluq və ya təkrar kobud xəta)',
    fineAzn: 700,
    discountedFineAzn: 350,
    suspensionMonths: 24,
    suspensionRangeTextAz: '2 il müddətinə sürücülükdən məhrumetmə və 15 gündən 30 günədək inzibati həbs',
    penaltyPoints: 5,
    isAdministrativeDetentionRisk: true,
    clinicalSymptomsAz: 'Dərrakənin kəskin zəifləməsi, sərbəst hərəkət etmək qabiliyyətinin itməsi, orqanizmin kəskin intoksikasiyası.'
  };
}

/**
 * Generate Official Səhiyyə Nazirliyi & BDYP Electronic Medical Certificate (Forma AZS-083/e)
 */
export function generateDriverMedicalCertificate(
  params: {
    finCode: string;
    fullName: string;
    birthDate: string;
    bloodType: DriverMedicalCertificate['bloodType'];
    targetCategories: DriverCategory[];
    centerId: string;
    validityYears: number;
    eyeCorrection: boolean;
    hearingAid: boolean;
    handControls: boolean;
    colorVision: ColorVisionDiagnosis;
    visusLeft: number;
    visusRight: number;
  }
): DriverMedicalCertificate {
  const center = MOCK_MEDICAL_CENTERS.find(c => c.id === params.centerId) || MOCK_MEDICAL_CENTERS[0];
  const randNum = Math.floor(10000 + Math.random() * 90000);
  const certNumber = `SN-TIB-2026-${randNum}`;

  const today = new Date();
  const issueDate = today.toISOString().split('T')[0];

  const expiry = new Date();
  expiry.setFullYear(today.getFullYear() + params.validityYears);
  const expiryDate = expiry.toISOString().split('T')[0];

  const simaUid = `SIMA-AZ-${randNum}-MOH-${today.getFullYear()}`;
  const qrHash = `moh-${randNum.toString(16)}-bdyp-${Date.now().toString(16).slice(-6)}`;

  return {
    certificateNumber: certNumber,
    finCode: params.finCode.toUpperCase(),
    driverFullName: params.fullName,
    birthDate: params.birthDate,
    bloodType: params.bloodType,
    allowedCategories: params.targetCategories,
    issueDate,
    expiryDate,
    issuingCenter: center.nameAz,
    chiefPhysician: center.city === 'Bakı' ? 'Prof. Dr. Rasim Quliyev' : 'Dr. Məmməd İsmayılov',
    eyeCorrectionRequired: params.eyeCorrection,
    hearingAidRequired: params.hearingAid,
    handControlsRequired: params.handControls,
    colorVisionStatus: params.colorVision,
    visualAcuityLeft: params.visusLeft,
    visualAcuityRight: params.visusRight,
    simaDigitalSignatureUid: simaUid,
    qrHash,
    status: 'ACTIVE'
  };
}

/**
 * Lookup Certificate by Number or FIN Code
 */
export function lookupMedicalCertificate(query: string): DriverMedicalCertificate | null {
  const clean = query.trim().toUpperCase();
  if (!clean) return null;

  return MOCK_EXISTING_CERTIFICATES.find(
    c => c.certificateNumber.toUpperCase() === clean || c.finCode.toUpperCase() === clean
  ) || null;
}

/**
 * Query Central Dispensary Records by FIN Code
 */
export function queryDispensaryRecord(finCode: string): DispensaryRecord | null {
  const clean = finCode.trim().toUpperCase();
  if (!clean) return null;

  return MOCK_DISPENSARY_DATABASE.find(r => r.finCode.toUpperCase() === clean) || {
    finCode: clean,
    fullName: 'Sistemdə Qeydiyyatı Tapılmayan Vətəndaş',
    narcologyStatus: 'CLEAN',
    psychoneurologyStatus: 'CLEAN',
    lastClearanceDate: new Date().toISOString().split('T')[0],
    dispensaryDoctor: 'Mərkəzi Səhiyyə İnformasiya Portalı (Avtomatik Sorğu)',
    narcologyDocSerial: `NRK-GEN-${clean}`,
    psychoDocSerial: `PSX-GEN-${clean}`,
    notesAz: 'Dövlət reyestrində aktiv dispanser qeydiyyatı yoxdur. İlkin yoxlamaya əsasən təmizdir.'
  };
}

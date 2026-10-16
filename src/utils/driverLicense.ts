import { Currency, Vehicle } from '../types/vehicle';

export type LicenseCategoryCode =
  | 'A1'
  | 'A'
  | 'B'
  | 'BE'
  | 'C1'
  | 'C'
  | 'CE'
  | 'D1'
  | 'D';

export type TransmissionLicenseType = 'manual_unrestricted' | 'automatic_only_AT';

export type VehicleTransmissionType = 'automatic' | 'manual' | 'cvt' | 'dct' | 'robot' | 'variator';

export interface LicenseCategorySpec {
  code: LicenseCategoryCode;
  title: string;
  minAgeYears: number;
  requiredExperienceYears: number;
  prerequisiteCategory?: LicenseCategoryCode;
  maxVehicleGvwKg: number;
  maxPassengerSeats: number;
  maxStandardTrailerKg: number;
  statutoryArticle: string;
  description: string;
}

export interface CategoryAuditInput {
  driverCategories: LicenseCategoryCode[];
  driverAgeYears: number;
  drivingExperienceYears: number;
  licenseTransmissionScope: TransmissionLicenseType;
  isLicenseExpired: boolean;
  vehicleGvwKg: number;
  vehicleCurbWeightKg: number;
  passengerSeatsExcludingDriver: number;
  vehicleTransmission: VehicleTransmissionType;
  isMotorcycle: boolean;
  trailerGvwKg: number;
}

export interface CategoryAuditResult {
  requiredCategory: LicenseCategoryCode;
  isCompliant: boolean;
  hasRequiredCategory: boolean;
  meetsMinimumAge: boolean;
  isTransmissionCompliant: boolean;
  isTrailerTowingActive: boolean;
  totalTrainGvwKg: number;
  trailerRuleTriggered:
    | 'NO_TRAILER'
    | 'LIGHT_TRAILER_UNDER_750KG_CATEGORY_B'
    | 'HEAVY_TRAILER_COMBINED_UNDER_3500KG_CATEGORY_B'
    | 'TRAILER_EXCEEDS_CURB_WEIGHT_REQUIRES_BE'
    | 'COMBINED_TRAIN_EXCEEDS_3500KG_REQUIRES_BE'
    | 'HEAVY_TRUCK_TRAILER_REQUIRES_CE';
  violationArticle: string | null;
  fineAmountAzn: number;
  verdictTitle: string;
  statutoryExplanation: string;
  recommendations: string[];
}

export type LicenseServiceType =
  | 'first_time_issuance'
  | 'expiry_or_name_renewal'
  | 'lost_or_damaged_replacement'
  | 'add_new_category_upgrade'
  | 'foreign_license_exchange_vienna'
  | 'international_driving_permit_idp';

export interface LicenseFeeCalculationInput {
  serviceType: LicenseServiceType;
  driverAgeYears: number;
  hasHealthRestrictionNote: boolean;
  requireMedicalCertificate: boolean;
  includeIdpAddOn: boolean;
  isAsanExpressCenter: boolean;
}

export interface LicenseFeeCalculationResult {
  serviceType: LicenseServiceType;
  serviceLabel: string;
  stateDutyCardAzn: number;
  examFeeAzn: number;
  medicalCertificateFeeAzn: number;
  notaryTranslationFeeAzn: number;
  idpAddonFeeAzn: number;
  asanServiceFeeAzn: number;
  totalCostAzn: number;
  validityYears: number;
  expiryYear: number;
  isMedicalMandatoryByLaw: boolean;
  requiresTheoreticalExam: boolean;
  requiresPracticalExam: boolean;
  statutoryBasis: string;
  requiredDocuments: string[];
}

export interface ExamQuestionItem {
  id: string;
  ticketNumber: number;
  categoryTag: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  yhqArticleReference: string;
  explanation: string;
}

export interface ExamSimulationResult {
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  scorePercentage: number;
  passed: boolean;
  maxAllowedMistakes: number;
  statusLabel: string;
  officialVerdict: string;
}

export interface BdypExamCenter {
  id: string;
  code: string;
  name: string;
  city: string;
  type: 'BDYP_MERO' | 'ASAN_XIDMET';
  address: string;
  workingHours: string;
  waitMinutes: number;
  hasPracticalAutodrom: boolean;
  supportsIdpIssuance: boolean;
  supportsMedicalCheckOnSite: boolean;
  phone: string;
}

export interface ElectronicLicenseRecord {
  licenseNumber: string;
  holderFullName: string;
  holderFin: string;
  birthYear: number;
  bloodGroup: string;
  categories: LicenseCategoryCode[];
  transmissionScope: TransmissionLicenseType;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
  hasInternationalPermit: boolean;
  idpSerialNumber?: string;
  activePenaltyPoints: number;
  status: 'ACTIVE' | 'EXPIRED' | 'RESTRICTED';
  qrVerificationHash: string;
}

export const STATUTORY_LICENSE_FEES = {
  LICENSE_CARD_STATE_DUTY_AZN: 30, // "Dövlət rüsumu haqqında" Qanun Maddə 18.65.1.1
  EXAM_ADMISSION_DUTY_AZN: 20, // İlk dəfə və ya yeni kateqoriya imtahan rüsumu
  INTERNATIONAL_PERMIT_DUTY_AZN: 30, // Beynəlxalq sürücülük vəsiqəsi (3 illik)
  MEDICAL_FORM_083_FEE_AZN: 40, // İcbari Tibbi Sığorta / Poliklinika Forma AZS-083
  NOTARY_TRANSLATION_AZN: 25, // Xarici vəsiqənin notarial tərcümə və təsdiqi
  ASAN_PROCESSING_FEE_AZN: 4, // Bank / xidmət komissiyası
  EXAM_PASS_THRESHOLD_CORRECT: 9,
  EXAM_TOTAL_QUESTIONS: 10,
} as const;

export const IXM_ARTICLE_332_FINES = {
  EXPIRED_OR_NO_DOCUMENT_AZN: 100, // İXM Maddə 332.1
  MISSING_CATEGORY_OR_NO_RIGHT_AZN: 200, // İXM Maddə 332.2
  SUSPENDED_LICENSE_DRIVING_AZN: 300, // İXM Maddə 332.3
} as const;

export function convertLicenseCurrency(amountAzn: number, currency: Currency): number {
  if (currency === 'USD') {
    return Number((amountAzn / 1.7).toFixed(2));
  }
  if (currency === 'EUR') {
    return Number((amountAzn / 1.85).toFixed(2));
  }
  return Number(amountAzn.toFixed(2));
}

export function determineVehicleLicenseParameters(vehicle?: Vehicle | null): {
  vehicleGvwKg: number;
  vehicleCurbWeightKg: number;
  passengerSeatsExcludingDriver: number;
  vehicleTransmission: VehicleTransmissionType;
} {
  if (!vehicle) {
    return {
      vehicleGvwKg: 2150,
      vehicleCurbWeightKg: 1620,
      passengerSeatsExcludingDriver: 4,
      vehicleTransmission: 'automatic',
    };
  }

  const body = vehicle.bodyType.toLowerCase();
  const isSuvOrPickup = body.includes('suv') || body.includes('pickup') || body.includes('offroad');
  const isVanOrMinivan = body.includes('minivan') || body.includes('van');

  let vehicleCurbWeightKg = 1520;
  let vehicleGvwKg = 2050;
  let passengerSeatsExcludingDriver = 4;

  if (isVanOrMinivan) {
    vehicleCurbWeightKg = 2180;
    vehicleGvwKg = 3050;
    passengerSeatsExcludingDriver = 7;
  } else if (isSuvOrPickup) {
    vehicleCurbWeightKg = 2120;
    vehicleGvwKg = 2780;
    passengerSeatsExcludingDriver = 6;
  }

  return {
    vehicleGvwKg,
    vehicleCurbWeightKg,
    passengerSeatsExcludingDriver,
    vehicleTransmission: vehicle.transmission || 'automatic',
  };
}

/**
 * Audits whether a driver's license categories, age, transmission endorsement,
 * and trailer towing weights comply with YHQ Articles 33-35 and İXM Article 332.
 */
export function evaluateLicenseCategoryCompliance(input: CategoryAuditInput): CategoryAuditResult {
  const safeVehicleGvw = Math.max(400, input.vehicleGvwKg);
  const safeCurbWeight = Math.max(300, Math.min(safeVehicleGvw, input.vehicleCurbWeightKg));
  const safeTrailerGvw = Math.max(0, input.trailerGvwKg);
  const safeSeats = Math.max(1, input.passengerSeatsExcludingDriver);
  const totalTrainGvwKg = safeVehicleGvw + safeTrailerGvw;
  const isTrailerTowingActive = safeTrailerGvw > 0;

  let requiredCategory: LicenseCategoryCode = 'B';
  let minRequiredAge = 18;
  let trailerRuleTriggered: CategoryAuditResult['trailerRuleTriggered'] = 'NO_TRAILER';

  if (input.isMotorcycle) {
    requiredCategory = 'A';
    minRequiredAge = 18;
  } else if (safeSeats > 16) {
    requiredCategory = 'D';
    minRequiredAge = 23;
  } else if (safeSeats > 8) {
    requiredCategory = 'D1';
    minRequiredAge = 21;
  } else if (safeVehicleGvw > 3500) {
    if (safeTrailerGvw > 750) {
      requiredCategory = 'CE';
      minRequiredAge = 21;
      trailerRuleTriggered = 'HEAVY_TRUCK_TRAILER_REQUIRES_CE';
    } else if (safeVehicleGvw <= 7500) {
      requiredCategory = 'C1';
      minRequiredAge = 18;
    } else {
      requiredCategory = 'C';
      minRequiredAge = 18;
    }
  } else {
    // Vehicle <= 3,500 kg and <= 8 seats (Standard Passenger / SUV / Pickup)
    if (safeTrailerGvw === 0) {
      requiredCategory = 'B';
      trailerRuleTriggered = 'NO_TRAILER';
    } else if (safeTrailerGvw <= 750) {
      // YHQ Maddə 34: B category allows trailer <= 750 kg regardless of combined weight (up to 4,250 kg)
      requiredCategory = 'B';
      trailerRuleTriggered = 'LIGHT_TRAILER_UNDER_750KG_CATEGORY_B';
    } else {
      // Trailer > 750 kg: Allowed with B ONLY IF trailer GVW <= tractor curb weight AND combined GVW <= 3,500 kg
      if (safeTrailerGvw > safeCurbWeight) {
        requiredCategory = 'BE';
        minRequiredAge = 19;
        trailerRuleTriggered = 'TRAILER_EXCEEDS_CURB_WEIGHT_REQUIRES_BE';
      } else if (totalTrainGvwKg > 3500) {
        requiredCategory = 'BE';
        minRequiredAge = 19;
        trailerRuleTriggered = 'COMBINED_TRAIN_EXCEEDS_3500KG_REQUIRES_BE';
      } else {
        requiredCategory = 'B';
        trailerRuleTriggered = 'HEAVY_TRAILER_COMBINED_UNDER_3500KG_CATEGORY_B';
      }
    }
  }

  // Check if driver's held categories satisfy the requiredCategory (including higher category coverage where applicable)
  const hasCategory = (cat: LicenseCategoryCode): boolean => input.driverCategories.includes(cat);

  let hasRequiredCategory = false;
  switch (requiredCategory as LicenseCategoryCode) {
    case 'A1':
      hasRequiredCategory = hasCategory('A1') || hasCategory('A');
      break;
    case 'A':
      hasRequiredCategory = hasCategory('A');
      break;
    case 'B':
      hasRequiredCategory = hasCategory('B') || hasCategory('BE');
      break;
    case 'BE':
      hasRequiredCategory = hasCategory('BE');
      break;
    case 'C1':
      hasRequiredCategory = hasCategory('C1') || hasCategory('C') || hasCategory('CE');
      break;
    case 'C':
      hasRequiredCategory = hasCategory('C') || hasCategory('CE');
      break;
      case 'CE':
      hasRequiredCategory = hasCategory('CE');
      break;
    case 'D1':
      hasRequiredCategory = hasCategory('D1') || hasCategory('D');
      break;
    case 'D':
      hasRequiredCategory = hasCategory('D');
      break;
  }

  const meetsMinimumAge = input.driverAgeYears >= minRequiredAge;

  // Transmission compliance check: AT restriction prohibits driving manual gearbox
  const isManualVehicle = input.vehicleTransmission === 'manual';
  const isTransmissionCompliant =
    !isManualVehicle || input.licenseTransmissionScope === 'manual_unrestricted';

  const isCompliant =
    hasRequiredCategory &&
    meetsMinimumAge &&
    isTransmissionCompliant &&
    !input.isLicenseExpired;

  let violationArticle: string | null = null;
  let fineAmountAzn = 0;
  let verdictTitle = 'Tam Qanuni Uyğunluq — İdarəetmə Hüququ Təsdiqləndi';
  let statutoryExplanation =
    `YHQ Maddə 33–35 tələblərinə əsasən sürücünün mövcud kateqoriyası (${input.driverCategories.join(', ') || 'Yoxdur'}) bu nəqliyyat vasitəsini` +
    (isTrailerTowingActive ? ` və ${safeTrailerGvw} kq qoşqunu (qatar kütləsi: ${totalTrainGvwKg} kq)` : '') +
    ` tam qanuni şəkildə idarə etməyə icazə verir.`;

  const recommendations: string[] = [];

  if (!hasRequiredCategory || !meetsMinimumAge) {
    violationArticle = 'İXM Maddə 332.2 (Müvafiq kateqoriya və ya idarəetmə hüququ olmadan idarəetmə)';
    fineAmountAzn = IXM_ARTICLE_332_FINES.MISSING_CATEGORY_OR_NO_RIGHT_AZN;
    verdictTitle = `Qadağandır — «${requiredCategory}» Kateqoriyası Tələb Olunur (200 AZN Cərimə)`;

    if (trailerRuleTriggered === 'COMBINED_TRAIN_EXCEEDS_3500KG_REQUIRES_BE') {
      statutoryExplanation =
        `YHQ Maddə 34-ə əsasən qoşqunun kütləsi (${safeTrailerGvw} kq) 750 kq-dan çox olduqda və avtoqatarın icazə verilən maksimum kütləsi (${totalTrainGvwKg} kq) 3,500 kq həddini aşdıqda təkcə «B» kateqoriyası kifayət etmir — mütləq «BE» kateqoriyası tələb olunur.`;
      recommendations.push(
        'BDYP MERO-da praktik manevr imtahanı verərək «BE» alt-kateqoriyasını əldə edin və ya qoşqu kütləsini 750 kq-dək azaldın.'
      );
    } else if (trailerRuleTriggered === 'TRAILER_EXCEEDS_CURB_WEIGHT_REQUIRES_BE') {
      statutoryExplanation =
        `YHQ Maddə 34-ə əsasən qoşqunun icazə verilən maksimum kütləsi (${safeTrailerGvw} kq) dartıcı avtomobilin yüksüz kütləsindən (${safeCurbWeight} kq) çox olduğu üçün «BE» kateqoriyası məcburidir.`;
      recommendations.push(
        'Dartıcı avtomobilin yüksüz kütləsindən ağır qoşqu qoşmaq üçün «BE» kateqoriyası tələb olunur.'
      );
    } else if (!meetsMinimumAge) {
      statutoryExplanation =
        `YHQ Maddə 33-ə əsasən «${requiredCategory}» kateqoriyalı nəqliyyat vasitələrini idarə etmək üçün minimum yaş həddi ${minRequiredAge} yaşdır (cari yaş: ${input.driverAgeYears}).`;
      recommendations.push(`«${requiredCategory}» kateqoriyası üzrə yaş tələbi: minimum ${minRequiredAge} yaş.`);
    } else {
      statutoryExplanation =
        `Bu nəqliyyat vasitəsinin texniki göstəriciləri (${safeVehicleGvw} kq, ${safeSeats} sərnişin yeri) üçün «${requiredCategory}» kateqoriyalı sürücülük vəsiqəsi tələb olunur. Müvafiq kateqoriya olmadan idarəetmə İXM Maddə 332.2 ilə 200 AZN cərimə yaradır.`;
      recommendations.push(`BDYP İmtahan Mərkəzinə müraciət edərək «${requiredCategory}» kateqoriyası üzrə imtahan verin.`);
    }
  } else if (!isTransmissionCompliant) {
    violationArticle = 'İXM Maddə 332.2 / YHQ Maddə 35 (Transmissiya «AT» məhdudiyyətinin pozulması)';
    fineAmountAzn = IXM_ARTICLE_332_FINES.EXPIRED_OR_NO_DOCUMENT_AZN;
    verdictTitle = 'Transmissiya Uyğunsuzluğu — «AT» Vəsiqə ilə Mexaniki Sürətlər Qutusu Qadağandır';
    statutoryExplanation =
      'YHQ Maddə 35-ə əsasən imtahanı avtomatik transmissiyalı («AT» qeydli) avtomobildə vermiş şəxslər yalnız avtomatik ötürücülü avtomobilləri idarə edə bilərlər. Mexaniki («MT») avtomobili idarə etmək inzibati məsuliyyət yaradır.';
    recommendations.push(
      'Mexaniki ötürücülü avtomobil idarə etmək üçün BDYP autodromunda mexaniki avtomobillə təkrar praktik imtahan verərək «AT» məhdudiyyətini ləğv etdirin.'
    );
  } else if (input.isLicenseExpired) {
    violationArticle = 'İXM Maddə 332.1 (Etibarlılıq müddəti bitmiş sürücülük vəsiqəsi ilə idarəetmə)';
    fineAmountAzn = IXM_ARTICLE_332_FINES.EXPIRED_OR_NO_DOCUMENT_AZN;
    verdictTitle = 'Sürücülük Vəsiqəsinin Etibarlılıq Müddəti Bitib (100 AZN Cərimə)';
    statutoryExplanation =
      'YHQ Maddə 35 və İXM Maddə 332.1-ə əsasən etibarlılıq müddəti bitmiş sürücülük vəsiqəsi ilə nəqliyyat vasitəsini idarə etmək 100 AZN məbləğində inzibati cərimə ilə nəticələnir.';
    recommendations.push(
      'İstənilən ASAN Xidmət mərkəzinə və ya BDYP Qeydiyyat-İmtahan şöbəsinə müraciət edərək imtahansız (30 AZN dövlət rüsumu ilə) vəsiqənizi 15 dəqiqə ərzində yeniləyin.'
    );
  } else {
    recommendations.push(
      'Sürücülük vəsiqənizin kateqoriyası və texniki göstəriciləri BDYP Mərkəzi İnformasiya Sistemində tam qanunidir.'
    );
    if (isTrailerTowingActive) {
      recommendations.push(
        `Qoşqu qatarının ümumi kütləsi (${totalTrainGvwKg} kq) YHQ Maddə 34 çərçivəsindədir. Qoşqu üzərində dövlət qeydiyyat nişanı və işıq cihazlarını yoxlayın.`
      );
    }
  }

  return {
    requiredCategory,
    isCompliant,
    hasRequiredCategory,
    meetsMinimumAge,
    isTransmissionCompliant,
    isTrailerTowingActive,
    totalTrainGvwKg,
    trailerRuleTriggered,
    violationArticle,
    fineAmountAzn,
    verdictTitle,
    statutoryExplanation,
    recommendations,
  };
}

/**
 * Calculates statutory state duties (Law on State Duties Article 18), medical certificate requirements,
 * and validity period (YHQ Article 35.6) for driver's license issuance, renewal, or exchange.
 */
export function calculateLicenseServiceFees(
  input: LicenseFeeCalculationInput
): LicenseFeeCalculationResult {
  const currentYear = 2026;
  const age = Math.max(16, Math.min(95, input.driverAgeYears));

  // YHQ Maddə 35.6 validity calculation
  let validityYears = 10;
  if (input.serviceType === 'international_driving_permit_idp') {
    validityYears = 3; // 1968 Vienna Convention IDP max 3 years
  } else if (input.hasHealthRestrictionNote) {
    validityYears = 2;
  } else if (age >= 70) {
    validityYears = 2;
  } else if (age >= 60) {
    const yearsUntil70 = Math.max(2, 70 - age);
    validityYears = Math.min(10, yearsUntil70);
  } else {
    validityYears = 10;
  }

  // Is medical certificate (Forma AZS-083) mandatory by law?
  const isMedicalMandatoryByLaw =
    input.serviceType === 'first_time_issuance' ||
    input.serviceType === 'add_new_category_upgrade' ||
    age >= 60 ||
    input.hasHealthRestrictionNote;

  let stateDutyCardAzn = STATUTORY_LICENSE_FEES.LICENSE_CARD_STATE_DUTY_AZN;
  let examFeeAzn = 0;
  let notaryTranslationFeeAzn = 0;
  let requiresTheoreticalExam = false;
  let requiresPracticalExam = false;
  let serviceLabel = '';
  let statutoryBasis = '"Dövlət rüsumu haqqında" AR Qanunu Maddə 18.65 & YHQ Maddə 35';
  const requiredDocuments: string[] = [
    'Azərbaycan Respublikası vətəndaşının şəxsiyyət vəsiqəsi (FİN)',
  ];

  switch (input.serviceType) {
    case 'first_time_issuance':
      serviceLabel = 'İlk Dəfə Sürücülük Vəsiqəsinin Alınması (Nəzəri + Praktik İmtahan)';
      examFeeAzn = STATUTORY_LICENSE_FEES.EXAM_ADMISSION_DUTY_AZN;
      requiresTheoreticalExam = true;
      requiresPracticalExam = true;
      requiredDocuments.push(
        'Təhsil müəssisəsinin (avtoməktəb) şəhadətnaməsi və ya müstəqil hazırlıq qeydi (A/B üçün)',
        'Tibbi arayış (Forma AZS-083 — İcbari Tibbi Sığorta elektron reyestrindən)',
        'Dövlət rüsumunun ödənilməsi barədə qəbz (20 AZN imtahan + 30 AZN vəsiqə)'
      );
      break;

    case 'expiry_or_name_renewal':
      serviceLabel = 'Etibarlılıq Müddəti Bitmiş və ya Soyad Dəyişikliyi ilə Vəsiqənin Yenilənməsi (ASAN / BDYP)';
      examFeeAzn = 0;
      requiresTheoreticalExam = false;
      requiresPracticalExam = false;
      requiredDocuments.push(
        'Köhnə sürücülük vəsiqəsi',
        'Dövlət rüsumunun ödənilməsi barədə qəbz (30 AZN)'
      );
      if (isMedicalMandatoryByLaw) {
        requiredDocuments.push('60+ yaş və ya tibbi qeyd səbəbindən Forma AZS-083 Tibbi E-Arayışı');
      }
      break;

    case 'lost_or_damaged_replacement':
      serviceLabel = 'İtirilmiş və ya Yararsız Hala Düşmüş Sürücülük Vəsiqəsinin Dublikatı';
      examFeeAzn = 0;
      requiresTheoreticalExam = false;
      requiresPracticalExam = false;
      requiredDocuments.push(
        'Vəsiqənin itirilməsi barədə elektron ərizə (ASAN Xidmət / BDYP)',
        'Dövlət rüsumunun ödənilməsi barədə qəbz (30 AZN)'
      );
      break;

    case 'add_new_category_upgrade':
      serviceLabel = 'Yeni Kateqoriya (BE / C / CE / D) Əlavə Edilməsi və Vəsiqənin Dəyişdirilməsi';
      examFeeAzn = STATUTORY_LICENSE_FEES.EXAM_ADMISSION_DUTY_AZN;
      requiresTheoreticalExam = true;
      requiresPracticalExam = true;
      requiredDocuments.push(
        'Mövcud sürücülük vəsiqəsi və sürücülük stajı arayışı',
        'Yeni kateqoriya üzrə hazırlıq kursunun şəhadətnaməsi',
        'Tibbi arayış (Forma AZS-083)'
      );
      break;

    case 'foreign_license_exchange_vienna':
      serviceLabel = 'Xarici Sürücülük Vəsiqəsinin (1968 Vyana Konvensiyası) Milli Vəsiqəyə Dəyişdirilməsi';
      examFeeAzn = 0;
      notaryTranslationFeeAzn = STATUTORY_LICENSE_FEES.NOTARY_TRANSLATION_AZN;
      requiresTheoreticalExam = false;
      requiresPracticalExam = false;
      statutoryBasis = 'YHQ Maddə 35.8 & 1968 Vyana Konvensiyası (İmtahansız Konvertasiya)';
      requiredDocuments.push(
        'Xarici dövlətin etibarlı sürücülük vəsiqəsi və onun notarial təsdiqli tərcüməsi',
        'Tibbi müayinə arayışı (Forma AZS-083)',
        'Dövlət rüsumu (30 AZN)'
      );
      break;

    case 'international_driving_permit_idp':
      serviceLabel = 'Beynəlxalq Sürücülük Vəsiqəsinin (IDP — Xaricdə Avtomobil İcarəsi və Tranzit) Verilməsi';
      stateDutyCardAzn = STATUTORY_LICENSE_FEES.INTERNATIONAL_PERMIT_DUTY_AZN;
      examFeeAzn = 0;
      requiresTheoreticalExam = false;
      requiresPracticalExam = false;
      statutoryBasis = 'YHQ Maddə 34-1 & 1968 Vyana Yol Hərəkəti Konvensiyası (3 illik IDP kitabçası)';
      requiredDocuments.push(
        'Qüvvədə olan Azərbaycan Respublikası milli sürücülük vəsiqəsi',
        'Ümumvətəndaş pasportu (Xarici pasport)',
        'Dövlət rüsumu (30 AZN — imtahan tələb olunmur)'
      );
      break;
  }

  const effectiveMedicalFee =
    input.requireMedicalCertificate || isMedicalMandatoryByLaw
      ? STATUTORY_LICENSE_FEES.MEDICAL_FORM_083_FEE_AZN
      : 0;

  const idpAddonFeeAzn =
    input.includeIdpAddOn && input.serviceType !== 'international_driving_permit_idp'
      ? STATUTORY_LICENSE_FEES.INTERNATIONAL_PERMIT_DUTY_AZN
      : 0;

  const asanServiceFeeAzn = input.isAsanExpressCenter
    ? STATUTORY_LICENSE_FEES.ASAN_PROCESSING_FEE_AZN
    : 0;

  const totalCostAzn =
    stateDutyCardAzn +
    examFeeAzn +
    effectiveMedicalFee +
    notaryTranslationFeeAzn +
    idpAddonFeeAzn +
    asanServiceFeeAzn;

  return {
    serviceType: input.serviceType,
    serviceLabel,
    stateDutyCardAzn,
    examFeeAzn,
    medicalCertificateFeeAzn: effectiveMedicalFee,
    notaryTranslationFeeAzn,
    idpAddonFeeAzn,
    asanServiceFeeAzn,
    totalCostAzn,
    validityYears,
    expiryYear: currentYear + validityYears,
    isMedicalMandatoryByLaw,
    requiresTheoreticalExam,
    requiresPracticalExam,
    statutoryBasis,
    requiredDocuments,
  };
}

/**
 * Evaluates a candidate's answers on the 10-question BDYP theoretical YHQ ticket.
 * Statutory pass rule: At least 9 out of 10 correct answers (max 1 mistake allowed).
 */
export function evaluateTheoreticalExam(
  questions: ExamQuestionItem[],
  selectedAnswers: Record<string, number>
): ExamSimulationResult {
  const totalQuestions = questions.length;
  let answeredCount = 0;
  let correctCount = 0;
  let incorrectCount = 0;

  for (const q of questions) {
    const chosen = selectedAnswers[q.id];
    if (chosen !== undefined && chosen >= 0) {
      answeredCount += 1;
      if (chosen === q.correctOptionIndex) {
        correctCount += 1;
      } else {
        incorrectCount += 1;
      }
    }
  }

  const unansweredCount = Math.max(0, totalQuestions - answeredCount);
  const scorePercentage =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const maxAllowedMistakes = 1;
  const passed =
    totalQuestions > 0 &&
    correctCount >= Math.max(1, totalQuestions - maxAllowedMistakes);

  const statusLabel = passed
    ? 'İmtahan Uğurla Keçildi ( Praktik Mərhələyə Buraxılış )'
    : 'İmtahan Keçilmədi ( Minimum 9/10 Doğru Tələb Olunur )';

  const officialVerdict = passed
    ? `Təbriklər! Siz ${totalQuestions} sualdan ${correctCount} doğru cavab (${scorePercentage}%) toplayaraq BDYP nəzəri imtahan normativini yerinə yetirdiniz.`
    : `Siz ${totalQuestions} sualdan ${correctCount} doğru cavab (${scorePercentage}%) topladınız. BDYP qaydalarına əsasən maksimum 1 səhvə icazə verilir (minimum 9 doğru cavab lazımdır).`;

  return {
    totalQuestions,
    answeredCount,
    correctCount,
    incorrectCount,
    unansweredCount,
    scorePercentage,
    passed,
    maxAllowedMistakes,
    statusLabel,
    officialVerdict,
  };
}

/**
 * Generates an official verifiable BDYP Electronic Driver's License Extract & IDP Voucher.
 */
export function generateElectronicLicenseExtract(params: {
  holderFullName: string;
  holderFin: string;
  birthYear: number;
  bloodGroup: string;
  categories: LicenseCategoryCode[];
  transmissionScope: TransmissionLicenseType;
  includeIdp: boolean;
  issuingCenterName: string;
}): ElectronicLicenseRecord {
  const cleanName = params.holderFullName.trim() || 'ƏLİYEV KAMRAN İLQAR OĞLU';
  const cleanFin =
    params.holderFin
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 7) || '5X9K2M1';

  const checksum = cleanFin
    .split('')
    .reduce((acc, ch, idx) => acc + ch.charCodeAt(0) * (idx + 7), 1049);
  const serialDigits = String((checksum % 899999) + 100000);
  const licenseNumber = `AZE-SV-${serialDigits}`;

  const age = Math.max(18, 2026 - params.birthYear);
  const validityYears = age >= 70 ? 2 : age >= 60 ? Math.max(2, 70 - age) : 10;
  const issueDate = '16.10.2026';
  const expiryDate = `16.10.${2026 + validityYears}`;

  const idpSerialNumber = params.includeIdp
    ? `IDP-AZ-2026-${String((checksum % 89999) + 10000)}`
    : undefined;

  const qrVerificationHash = `BDYP-E-SV-${cleanFin}-${serialDigits}-2026`;

  return {
    licenseNumber,
    holderFullName: cleanName,
    holderFin: cleanFin,
    birthYear: params.birthYear,
    bloodGroup: params.bloodGroup || 'II (A) Rh+',
    categories: params.categories.length > 0 ? params.categories : ['B'],
    transmissionScope: params.transmissionScope,
    issueDate,
    expiryDate,
    issuingAuthority: params.issuingCenterName || 'BDYP Baş İdarəsi / ASAN Xidmət №1',
    hasInternationalPermit: params.includeIdp,
    idpSerialNumber,
    activePenaltyPoints: 0,
    status: 'ACTIVE',
    qrVerificationHash,
  };
}

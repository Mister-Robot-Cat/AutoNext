/**
 * Official BDYP, DİN & Elm və Təhsil Nazirliyi Driving School ("Avtoməktəb") Accreditation,
 * Practical Autodrome Exam Simulator & City Driving Assessment Engine.
 * 
 * Legal & Regulatory Foundation:
 * - Law of the Republic of Azerbaijan on Road Traffic (Yol Hərəkəti Haqqında Qanun, Articles 33–35)
 * - YHQ Annex 2: "Tədris Nəqliyyat Vasitələri" (Dual brake/clutch pedals, roof "U" sign, instructor mirrors)
 * - BDYP Practical Examination Standards:
 *     1. Estakada (Hill Start / Yoxuşda durma-qalxma): Rollback ≤ 20 cm
 *     2. Parallel Parking (Paralel parketmə): Sensor boundary clearance & curb offset (10–30 cm)
 *     3. 90° Reverse into Garage (Boks / Qaraja giriş): Zero line contact, single reverse maneuver
 *     4. Slalom / Serpentine (Ziqzaq / Məhdud döngələr): Navigating 3 consecutive alternate turns
 *     5. T-Turn / 3-Point Turnaround (Məhdud məkanda geriyə dönmə): 6m envelope with 1 gear change
 * - BDYP Electronic City Driving Route Protocol (100 Initial Points Scale, Passing Threshold ≥80 / Max 20 penalty points):
 *     - Minor errors (Kiçik xəta): 1 penalty point (late indicator, flat stall, jerky deceleration)
 *     - Medium errors (Orta xəta): 3 penalty points (lane deviation, speed ±10 km/h, tailgating)
 *     - Critical errors (Kobud xəta): 5 penalty points / Immediate FAIL (zebra cross pedestrian fail, red light, solid line 1.1)
 * - Law on State Duties (Article 18): BDYP Practical Exam Fee (20 AZN) & Driving School Certification
 */

export type AutodromeExerciseId = 'estakada' | 'parallel_parking' | 'box_reverse' | 'slalom' | 'three_point_turn';

export interface AutodromeExercise {
  id: AutodromeExerciseId;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  descriptionAz: string;
  descriptionEn: string;
  descriptionRu: string;
  standardTolerance: string;
  maxTimeSec: number;
  maxPenaltyPoints: number;
}

export interface AutodromeTestResult {
  passed: boolean;
  rollbackCm?: number;
  boundaryViolations: number;
  stallCount: number;
  elapsedSec: number;
  penaltyPoints: number;
  feedbackAz: string;
  feedbackEn: string;
  feedbackRu: string;
}

export type CityErrorSeverity = 'minor' | 'medium' | 'critical';

export interface CityExamErrorItem {
  id: string;
  code: string;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  penaltyPoints: number;
  severity: CityErrorSeverity;
  legalBasis: string;
}

export interface CityExamEvaluation {
  initialPoints: number;
  deductedPoints: number;
  finalScore: number;
  passed: boolean;
  criticalCount: number;
  summaryAz: string;
  summaryEn: string;
  summaryRu: string;
}

export interface DualPedalVehicleAudit {
  dualPedalsApproved: boolean;
  roofSignInstalled: boolean;
  instructorMirrorsPresent: boolean;
  dashcamActive: boolean;
  texpasportSpecialEndorsement: boolean;
  isCompliant: boolean;
  fineRiskAzn: number;
  violationsAz: string[];
  violationsEn: string[];
  violationsRu: string[];
}

export interface DrivingSchoolRecord {
  id: string;
  name: string;
  licenseNo: string;
  city: 'Baku' | 'Sumgayit' | 'Ganja';
  district: string;
  address: string;
  phone: string;
  rating: number;
  passRatePercent: number;
  activeCadets: number;
  fleetSize: number;
  priceCategoryB: number;
}

export interface DrivingSchoolCertificate {
  certificateNumber: string;
  studentFullName: string;
  studentFin: string;
  schoolId: string;
  schoolName: string;
  category: 'B' | 'BC' | 'C' | 'D' | 'BE';
  theoryHours: number;
  practicalHours: number;
  examDate: string;
  autodromePassed: boolean;
  cityScore: number;
  instructorName: string;
  vehiclePlate: string;
  qrSecurityHash: string;
  verificationUrl: string;
  status: 'active' | 'revoked';
}

/**
 * Currency conversion constants based on standard rates
 */
const EXCHANGE_RATES: Record<'AZN' | 'USD' | 'EUR', number> = {
  AZN: 1.0,
  USD: 1 / 1.7,
  EUR: 1 / 1.85,
};

/**
 * Evaluate Estakada (Hill Start) exercise according to BDYP tolerances
 * Standard: Rollback must be <= 20 cm, max 1 engine stall allowed, time <= 120s
 */
export function evaluateEstakada(
  rollbackCm: number,
  stalls: number,
  elapsedSec: number
): AutodromeTestResult {
  let penalty = 0;
  let passed = true;
  const feedback: { az: string; en: string; ru: string } = {
    az: 'Müvəffəqiyyətlə tamamlandı.',
    en: 'Successfully completed.',
    ru: 'Успешно выполнено.',
  };

  if (rollbackCm > 20) {
    passed = false;
    penalty += 5;
    feedback.az = `Geriyə sürüşmə ${rollbackCm} sm normativ həddi (≤20 sm) keçdi. İmtahan dayandırılır.`;
    feedback.en = `Rollback of ${rollbackCm} cm exceeded standard limit (≤20 cm). Exam disqualified.`;
    feedback.ru = `Откат назад ${rollbackCm} см превысил норматив (≤20 см). Экзамен прекращен.`;
  } else if (stalls > 1) {
    passed = false;
    penalty += 5;
    feedback.az = `Mühərrikin ${stalls} dəfə sönməsi yolverilməzdir (maksimum 1 dəfə).`;
    feedback.en = `Engine stalled ${stalls} times (maximum 1 stall allowed).`;
    feedback.ru = `Двигатель заглох ${stalls} раз (допускается не более 1 раза).`;
  } else if (elapsedSec > 120) {
    passed = false;
    penalty += 5;
    feedback.az = `Vaxt limiti (120 saniyə) aşıldı: ${elapsedSec} saniyə.`;
    feedback.en = `Time limit (120s) exceeded: ${elapsedSec} seconds.`;
    feedback.ru = `Превышен лимит времени (120с): ${elapsedSec} секунд.`;
  } else {
    if (stalls === 1) {
      penalty += 1;
      feedback.az = `Məqbul. Qeyd: 1 dəfə mühərrik söndü (-1 bal). Sürüşmə: ${rollbackCm} sm.`;
      feedback.en = `Passed with note: 1 engine stall (-1 pt). Rollback: ${rollbackCm} cm.`;
      feedback.ru = `Сдано с замечанием: 1 остановка двигателя (-1 балл). Откат: ${rollbackCm} см.`;
    } else {
      feedback.az = `Mükəmməl icra! Geriyə sürüşmə: cəmi ${rollbackCm} sm.`;
      feedback.en = `Flawless execution! Rollback: only ${rollbackCm} cm.`;
      feedback.ru = `Отличное выполнение! Откат: всего ${rollbackCm} см.`;
    }
  }

  return {
    passed,
    rollbackCm,
    boundaryViolations: 0,
    stallCount: stalls,
    elapsedSec,
    penaltyPoints: penalty,
    feedbackAz: feedback.az,
    feedbackEn: feedback.en,
    feedbackRu: feedback.ru,
  };
}

/**
 * Evaluate Parallel Parking exercise
 * Standard: Curb distance must be 10–30 cm, no boundary line contact, max 2 gear shifts
 */
export function evaluateParallelParking(
  curbDistanceCm: number,
  touchesLine: boolean,
  maneuverShifts: number,
  elapsedSec: number
): AutodromeTestResult {
  let penalty = 0;
  let passed = true;
  let az = 'Müvəffəqiyyətlə park edildi.';
  let en = 'Successfully parallel parked.';
  let ru = 'Успешно припарковано.';

  if (touchesLine) {
    passed = false;
    penalty += 5;
    az = 'Sensorlu kənar xəttə toxunuldu. İmtahan dayandırılır.';
    en = 'Boundary sensor line touched. Disqualified.';
    ru = 'Наезд на контрольную линию разметки. Экзамен не сдан.';
  } else if (curbDistanceCm > 35) {
    penalty += 3;
    az = `Səkidən məsafə çoxdur (${curbDistanceCm} sm > 30 sm).`;
    en = `Distance from curb is too large (${curbDistanceCm} cm > 30 cm).`;
    ru = `Слишком большое расстояние от бордюра (${curbDistanceCm} см > 30 см).`;
  } else if (curbDistanceCm < 5) {
    passed = false;
    penalty += 5;
    az = 'Səkiyə çırpılma təhlükəsi yarandı.';
    en = 'Collision risk with curb.';
    ru = 'Опасность наезда на бордюр.';
  } else if (maneuverShifts > 2) {
    penalty += 2;
    az = `Əlavə manevr icra edildi (${maneuverShifts} pillə dəyişikliyi).`;
    en = `Extra maneuvers executed (${maneuverShifts} gear shifts).`;
    ru = `Выполнены дополнительные маневры (${maneuverShifts} переключения).`;
  }

  if (elapsedSec > 150) {
    passed = false;
    penalty += 5;
    az = `Manevr üçün ayrılan 150 saniyə aşıldı (${elapsedSec} san).`;
    en = `Time limit exceeded (${elapsedSec}s > 150s).`;
    ru = `Превышен лимит времени (${elapsedSec}с > 150с).`;
  }

  return {
    passed: passed && penalty < 5,
    boundaryViolations: touchesLine ? 1 : 0,
    stallCount: 0,
    elapsedSec,
    penaltyPoints: penalty,
    feedbackAz: az,
    feedbackEn: en,
    feedbackRu: ru,
  };
}

/**
 * Evaluate 90° Reverse into Garage (Boks)
 */
export function evaluateBoxReverse(
  touchesBoundary: boolean,
  reachedEndZone: boolean,
  gearShifts: number,
  elapsedSec: number
): AutodromeTestResult {
  let penalty = 0;
  let passed = true;
  let az = 'Boks manevri tam tələblərə uyğundur.';
  let en = 'Garage reverse maneuver is compliant.';
  let ru = 'Маневр заезда в бокс выполнен верно.';

  if (touchesBoundary) {
    passed = false;
    penalty += 5;
    az = 'Qarajın yan xətlərinə və ya ştrixlərinə toxunuldu.';
    en = 'Boundary lines or virtual sensors contacted.';
    ru = 'Касание габаритных линий бокса.';
  } else if (!reachedEndZone) {
    passed = false;
    penalty += 5;
    az = 'Avtomobil tam olaraq boks sahəsinə daxil edilmədi.';
    en = 'Vehicle did not fully enter the garage stopping area.';
    ru = 'Автомобиль не полностью заехал в контрольную зону бокса.';
  } else if (gearShifts > 1) {
    penalty += 3;
    az = 'Boksa daxil olarkən birdən çox geri/irəli hərəkət edildi.';
    en = 'Multiple directional shifts during single garage entrance.';
    ru = 'Более одного переключения передач при заезде в бокс.';
  }

  if (elapsedSec > 120) {
    passed = false;
    penalty += 5;
    az = '120 saniyəlik vaxt limiti aşıldı.';
    en = '120s time limit exceeded.';
    ru = 'Превышен лимит времени в 120 секунд.';
  }

  return {
    passed: passed && penalty < 5,
    boundaryViolations: touchesBoundary ? 1 : 0,
    stallCount: 0,
    elapsedSec,
    penaltyPoints: penalty,
    feedbackAz: az,
    feedbackEn: en,
    feedbackRu: ru,
  };
}

/**
 * Evaluate City Driving Route with 100 Initial Points
 * Passing condition: final score >= 80 (penalty <= 20) AND 0 critical errors
 */
export function evaluateCityDrivingExam(
  committedErrorCodes: string[],
  errorCatalog: CityExamErrorItem[]
): CityExamEvaluation {
  let deducted = 0;
  let criticalCount = 0;

  for (const code of committedErrorCodes) {
    const errorItem = errorCatalog.find((e) => e.code === code || e.id === code);
    if (errorItem) {
      deducted += errorItem.penaltyPoints;
      if (errorItem.severity === 'critical') {
        criticalCount++;
      }
    }
  }

  const finalScore = Math.max(0, 100 - deducted);
  const passed = criticalCount === 0 && finalScore >= 80;

  let summaryAz = '';
  let summaryEn = '';
  let summaryRu = '';

  if (passed) {
    summaryAz = `İmtahan MƏQBULDUR! Yekun nəticə: ${finalScore}/100 bal. Cərimə balları: ${deducted}.`;
    summaryEn = `Exam PASSED! Final score: ${finalScore}/100 pts. Penalty points: ${deducted}.`;
    summaryRu = `Экзамен СДАН! Итоговый результат: ${finalScore}/100 баллов. Штрафные баллы: ${deducted}.`;
  } else if (criticalCount > 0) {
    summaryAz = `İmtahan QEYRİ-MƏQBULDUR! ${criticalCount} ədəd kobud xəta (5 bal) qeydə alındı. İmtahan dərhal dayandırıldı.`;
    summaryEn = `Exam FAILED! ${criticalCount} critical violation(s) recorded. Disqualified immediately.`;
    summaryRu = `Экзамен НЕ СДАН! Зафиксировано ${criticalCount} грубых нарушений. Экзамен прекращен.`;
  } else {
    summaryAz = `İmtahan QEYRİ-MƏQBULDUR! Toplanan cərimə balı ${deducted} bal (normativ hədd maksimum 20 bal). Yekun: ${finalScore}/100 bal.`;
    summaryEn = `Exam FAILED! Accumulated ${deducted} penalty pts (maximum allowed: 20). Final: ${finalScore}/100 pts.`;
    summaryRu = `Экзамен НЕ СДАН! Набрано ${deducted} штрафных баллов (допустимо максимум 20). Итог: ${finalScore}/100 баллов.`;
  }

  return {
    initialPoints: 100,
    deductedPoints: deducted,
    finalScore,
    passed,
    criticalCount,
    summaryAz,
    summaryEn,
    summaryRu,
  };
}

/**
 * Audit Dual-Pedal Driver Education Vehicle according to YHQ Annex 2 & İXM Article 342
 */
export function auditDualPedalVehicle(checks: {
  dualPedalsApproved: boolean;
  roofSignInstalled: boolean;
  instructorMirrorsPresent: boolean;
  dashcamActive: boolean;
  texpasportSpecialEndorsement: boolean;
}): DualPedalVehicleAudit {
  const violationsAz: string[] = [];
  const violationsEn: string[] = [];
  const violationsRu: string[] = [];
  let fineRisk = 0;

  if (!checks.dualPedalsApproved) {
    violationsAz.push('İkili əlavə əyləc və mufta pedalları quraşdırılmayıb və ya sertifikatlaşdırılmayıb');
    violationsEn.push('Dual brake and clutch pedals missing or uncertified');
    violationsRu.push('Дополнительные дублирующие педали тормоза/сцепления отсутствуют или не сертифицированы');
    fineRisk += 150;
  }

  if (!checks.texpasportSpecialEndorsement) {
    violationsAz.push('Qeydiyyat Şəhadətnaməsində (Texpasport) "Tədris nəqliyyat vasitəsi" xüsusi qeydi yoxdur');
    violationsEn.push('No "Driving School Vehicle" special endorsement in vehicle technical passport');
    violationsRu.push('Отсутствует отметка "Учебное транспортное средство" в техпаспорте');
    fineRisk += 150;
  }

  if (!checks.roofSignInstalled) {
    violationsAz.push('Damda işıqlandırılan üçbucaqlı "U" tədris fənəri yoxdur (YHQ Əlavə 2)');
    violationsEn.push('Missing illuminated rooftop triangular "U" learner sign (YHQ Annex 2)');
    violationsRu.push('Отсутствует световой треугольный опознавательный знак "У" на крыше');
    fineRisk += 50;
  }

  if (!checks.instructorMirrorsPresent) {
    violationsAz.push('Təlimatçı üçün əlavə daxili və xarici arxanıgöstərən güzgülər çatışmır');
    violationsEn.push('Instructor auxiliary interior and exterior rear-view mirrors missing');
    violationsRu.push('Отсутствуют дополнительные зеркала заднего вида для инструктора');
    fineRisk += 50;
  }

  if (!checks.dashcamActive) {
    violationsAz.push('İmtahan komissiyası üçün audio-video qeydiyyat cihazı (2 kameralı) aktiv deyil');
    violationsEn.push('Two-way audio-video examiner surveillance camera inactive');
    violationsRu.push('Не активен двухсторонний аудио-видеорегистратор для экзаменационной комиссии');
    fineRisk += 80;
  }

  const isCompliant = violationsAz.length === 0;

  return {
    dualPedalsApproved: checks.dualPedalsApproved,
    roofSignInstalled: checks.roofSignInstalled,
    instructorMirrorsPresent: checks.instructorMirrorsPresent,
    dashcamActive: checks.dashcamActive,
    texpasportSpecialEndorsement: checks.texpasportSpecialEndorsement,
    isCompliant,
    fineRiskAzn: fineRisk,
    violationsAz,
    violationsEn,
    violationsRu,
  };
}

/**
 * Currency conversion formatter
 */
export function formatTuitionPrice(
  amountAzn: number,
  currency: 'AZN' | 'USD' | 'EUR' = 'AZN'
): string {
  const converted = amountAzn * EXCHANGE_RATES[currency];
  const symbol = currency === 'AZN' ? '₼' : currency === 'USD' ? '$' : '€';
  return `${Math.round(converted).toLocaleString()} ${symbol}`;
}

/**
 * Generate Official BDYP Driving School Graduation Certificate
 */
export function generateDrivingSchoolCertificate(params: {
  studentFullName: string;
  studentFin: string;
  schoolId: string;
  schoolName: string;
  category: 'B' | 'BC' | 'C' | 'D' | 'BE';
  theoryHours?: number;
  practicalHours?: number;
  instructorName: string;
  vehiclePlate: string;
  cityScore: number;
}): DrivingSchoolCertificate {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const certNumber = `BDYP-AVM-2026-${randomSuffix}`;
  const now = new Date().toISOString().split('T')[0];
  const hashPayload = `${certNumber}:${params.studentFin}:${params.schoolId}:${now}`;
  
  // Deterministic mock checksum
  let checksum = 0;
  for (let i = 0; i < hashPayload.length; i++) {
    checksum = (checksum + hashPayload.charCodeAt(i) * (i + 1)) % 1000000;
  }
  const qrSecurityHash = `SHA256-${checksum.toString(16).toUpperCase()}-BDYP-AZ`;

  return {
    certificateNumber: certNumber,
    studentFullName: params.studentFullName,
    studentFin: params.studentFin.toUpperCase(),
    schoolId: params.schoolId,
    schoolName: params.schoolName,
    category: params.category,
    theoryHours: params.theoryHours || 80,
    practicalHours: params.practicalHours || 30,
    examDate: now,
    autodromePassed: true,
    cityScore: params.cityScore,
    instructorName: params.instructorName,
    vehiclePlate: params.vehiclePlate,
    qrSecurityHash,
    verificationUrl: `https://dyp.gov.az/az/driving-schools/verify/${certNumber}`,
    status: 'active',
  };
}

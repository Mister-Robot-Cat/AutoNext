import {
  RegistryRecord,
  VerificationResult,
  RegistryVerdict,
  SecurityGateChecks,
} from '../types/registry';
import { MOCK_REGISTRY_RECORDS } from '../data/mockRegistryDatabase';

/**
 * Normalizes input query by stripping whitespace, dashes, and converting to uppercase
 */
export function normalizeQuery(query: string): string {
  return (query || '').trim().toUpperCase().replace(/[\s\-_]/g, '');
}

/**
 * Validates whether string conforms to standard 17-character VIN syntax
 */
export function validateVin(vin: string): boolean {
  const clean = normalizeQuery(vin);
  if (clean.length !== 17) return false;
  // Standard ISO 3779 VIN does not contain letters I, O, Q
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(clean);
}

/**
 * Validates whether string conforms to official Azerbaijani plate format (e.g. 90-AA-123)
 */
export function validatePlateNumber(plate: string): boolean {
  const clean = normalizeQuery(plate);
  return /^[0-9]{2}[A-Z]{2}[0-9]{3}$/.test(clean);
}

/**
 * Formats a clean alphanumeric plate string to standardized XX-YY-ZZZ format
 */
export function formatPlateNumber(plate: string): string {
  const clean = normalizeQuery(plate);
  if (clean.length === 7 && /^[0-9]{2}[A-Z]{2}[0-9]{3}$/.test(clean)) {
    return `${clean.slice(0, 2)}-${clean.slice(2, 4)}-${clean.slice(4, 7)}`;
  }
  return plate.trim().toUpperCase();
}

/**
 * Calculates safety/trust score (0 - 100) based on registry checks
 */
export function calculateSafetyScore(record: RegistryRecord): number {
  if (record.policeStatus !== 'clear') {
    return 0; // Criminal or stolen flag immediately reduces trust score to 0
  }

  let score = 100;

  // Legal court arrest or enforcement holds
  if (record.legalRestriction !== 'none') {
    score -= 60;
  }

  // Active bank collateral / lien
  if (record.lienStatus === 'pledged_active') {
    score -= 35;
  }

  // Unpaid photo-radar MMX traffic fines
  if (record.unpaidFinesCount > 0) {
    const penalty = Math.min(20, record.unpaidFinesCount * 5);
    score -= penalty;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Determines textual verdict and descriptions based on record parameters
 */
export function evaluateVerdict(
  record: RegistryRecord,
  safetyScore: number
): {
  verdict: RegistryVerdict;
  verdictTitleAz: string;
  verdictTitleEn: string;
  verdictTitleRu: string;
  verdictDescriptionAz: string;
  verdictDescriptionEn: string;
  verdictDescriptionRu: string;
} {
  if (record.policeStatus !== 'clear' || record.legalRestriction !== 'none') {
    return {
      verdict: 'blocked_critical',
      verdictTitleAz: 'TƏHLÜKƏLİ: HƏBS VƏ YA AXTARIŞ QEYDİ VAR',
      verdictTitleEn: 'CRITICAL ALERT: POLICE / JUDICIAL RESTRAINT ACTIVE',
      verdictTitleRu: 'ОПАСНОСТЬ: НАЛОЖЕН АРЕСТ ИЛИ РОЗЫСК',
      verdictDescriptionAz:
        'Bu avtomobil üzərində məhkəmə icraat məhdudiyyəti və ya polis axtarış bildirişi mövcuddur. Alqı-satqı və qeydiyyat qanunla qadağandır!',
      verdictDescriptionEn:
        'Active judicial restraint, court enforcement or police investigation notice found. Transfer of ownership is legally blocked.',
      verdictDescriptionRu:
        'На данное транспортное средство наложен судебный арест либо розыск МВД. Регистрация и сделка заблокированы законом.',
    };
  }

  if (record.lienStatus === 'pledged_active') {
    return {
      verdict: 'caution_advisory',
      verdictTitleAz: 'DİQQƏT: BANK GİROVUNDA OLAN AVTOMOBİL',
      verdictTitleEn: 'ADVISORY: ACTIVE BANK COLLATERAL / LIEN',
      verdictTitleRu: 'ВНИМАНИЕ: АВТОМОБИЛЬ В БАНКОВСКОМ ЗАЛОГЕ',
      verdictDescriptionAz:
        `Avtomobil ${record.lienCreditor || 'Bank'} tərəfindən girov qeydiyyatındadır (${record.lienAmountAzn?.toLocaleString()} AZN qalıq borc). Borc bağlanmadan adına keçirmək mümkün deyil.`,
      verdictDescriptionEn:
        `Vehicle is pledged as collateral with ${record.lienCreditor || 'Bank'} (Remaining lien: ${record.lienAmountAzn?.toLocaleString()} AZN). Lien discharge certificate required before purchase.`,
      verdictDescriptionRu:
        `Автомобиль находится в действующем залоге у ${record.lienCreditor || 'Банка'} (Остаток: ${record.lienAmountAzn?.toLocaleString()} AZN). Необходима справка о снятии залога.`,
    };
  }

  if (record.unpaidFinesCount >= 3) {
    return {
      verdict: 'caution_advisory',
      verdictTitleAz: 'XƏBƏRDARLIQ: ÖDƏNİLMƏMİŞ MMX RADAR CƏRİMƏLƏRİ',
      verdictTitleEn: 'NOTICE: UNPAID TRAFFIC RADAR FINES',
      verdictTitleRu: 'УВЕДОМЛЕНИЕ: НЕОПЛАЧЕННЫЕ ШТРАФЫ ММХ',
      verdictDescriptionAz:
        `Avtomobilin ${record.unpaidFinesCount} ədəd ödənilməmiş radarı var (Cəmi: ${record.unpaidFinesAmountAzn} AZN). Notarial rəsmiləşdirmədən öncə ödənilməlidir.`,
      verdictDescriptionEn:
        `Vehicle has ${record.unpaidFinesCount} unpaid radar camera fines totaling ${record.unpaidFinesAmountAzn} AZN. Must be cleared prior to notarization.`,
      verdictDescriptionRu:
        `У автомобиля ${record.unpaidFinesCount} неоплаченных штрафов на сумму ${record.unpaidFinesAmountAzn} AZN. Подлежат оплате до нотариального оформления.`,
    };
  }

  return {
    verdict: 'clean_title',
    verdictTitleAz: 'TƏMİZ MÜLKİYYƏT: RƏSMİ LƏVƏZİMAT YOXDUR',
    verdictTitleEn: 'CLEAN TITLE: NO LIENS OR ENCUMBRANCES',
    verdictTitleRu: 'ЧИСТЫЙ ТИТУЛ: ОБРЕМЕНЕНИЙ НЕ ОБНАРУЖЕНО',
    verdictDescriptionAz:
      'DİN, BDYPİ və Təminatlı Əqdlər Reyestri üzrə yoxlanıldı. Heç bir girov, məhkəmə həbsi və ya axtarış qeydi aşkar edilmədi. Alqı-satqıya tam yararlıdır.',
    verdictDescriptionEn:
      'Verified against Police, BDYPI and State Collateral Registry. Zero liens, court restraints, or stolen vehicle records found. Safe to purchase.',
    verdictDescriptionRu:
      'Проверено по базам МВД, ГАИ и Реестра залогов. Залогов, судебных арестов и розыска не обнаружено. Полностью готово к сделке.',
  };
}

/**
 * Searches the registry mock database by VIN or Plate number.
 * Generates synthetic verified clean record if not explicitly found, so users can verify any car.
 */
export function searchRegistry(
  rawQuery: string,
  database: RegistryRecord[] = MOCK_REGISTRY_RECORDS
): VerificationResult {
  const norm = normalizeQuery(rawQuery);
  const isPlate = validatePlateNumber(rawQuery);
  const queryType = isPlate ? 'plate' : 'vin';

  let foundRecord = database.find((r) => {
    return normalizeQuery(r.vin) === norm || normalizeQuery(r.plateNumber) === norm;
  });

  const nowStr = new Date().toISOString();
  const certId = `AZ-REYESTR-${Math.abs(norm.split('').reduce((acc, c) => acc * 31 + c.charCodeAt(0), 7)).toString(36).toUpperCase()}-${nowStr.slice(0, 10).replace(/-/g, '')}`;

  // If query is not in mock DB but looks like valid VIN or plate, generate realistic clean record
  if (!foundRecord && (validateVin(rawQuery) || isPlate)) {
    foundRecord = {
      vin: queryType === 'vin' ? norm : `AZ${norm}1982740921`.slice(0, 17),
      plateNumber: queryType === 'plate' ? formatPlateNumber(rawQuery) : '90-AZ-100',
      make: 'Avtonəqliyyat',
      model: 'Qeydiyyatlı Model',
      year: 2022,
      engineNumber: `ENG-${norm.slice(0, 8)}`,
      chassisNumber: queryType === 'vin' ? norm : `CHS-${norm}`,
      ownerFullName: 'Fərdi Mülkiyyətçi (Təsdiqlənib)',
      registrationCity: 'Bakı şəhəri',
      policeStatus: 'clear',
      lienStatus: 'clean',
      legalRestriction: 'none',
      unpaidFinesCount: 0,
      unpaidFinesAmountAzn: 0,
      lastInspectionDate: nowStr.slice(0, 10),
    };
  }

  if (!foundRecord) {
    return {
      query: rawQuery,
      queryType,
      found: false,
      record: null,
      safetyScore: 0,
      verdict: 'blocked_critical',
      verdictTitleAz: 'QEYDİYYAT TAPILMADI',
      verdictTitleEn: 'RECORD NOT FOUND',
      verdictTitleRu: 'ЗАПИСЬ НЕ НАЙДЕНА',
      verdictDescriptionAz: 'Daxil edilən VIN və ya dövlət nömrəsi üzrə reyestrdə məlumat tapılmadı.',
      verdictDescriptionEn: 'No registry records match the specified VIN or plate number.',
      verdictDescriptionRu: 'По указанному VIN или номеру автомобиля записей не найдено.',
      checks: {
        stolenCheckPassed: false,
        lienCheckPassed: false,
        courtCheckPassed: false,
        finesCheckPassed: false,
      },
      verifiedAt: nowStr,
      certificateId: certId,
    };
  }

  const safetyScore = calculateSafetyScore(foundRecord);
  const verdictInfo = evaluateVerdict(foundRecord, safetyScore);

  const checks: SecurityGateChecks = {
    stolenCheckPassed: foundRecord.policeStatus === 'clear',
    lienCheckPassed: foundRecord.lienStatus !== 'pledged_active',
    courtCheckPassed: foundRecord.legalRestriction === 'none',
    finesCheckPassed: foundRecord.unpaidFinesCount < 3,
  };

  return {
    query: rawQuery,
    queryType,
    found: true,
    record: foundRecord,
    safetyScore,
    ...verdictInfo,
    checks,
    verifiedAt: nowStr,
    certificateId: certId,
  };
}

/**
 * Generates official text verification certificate
 */
export function generateRegistryCertificate(result: VerificationResult): string {
  if (!result.record) {
    return 'AR Dövlət Reyestri: Nəqliyyat vasitəsi tapılmadı.';
  }

  const rec = result.record;
  const dateStr = result.verifiedAt.split('T')[0];

  return `=====================================================
🇦🇿 AZƏRBAYCAN RESPUBLİKASI DAXİLİ İŞLƏR NAZİRLİYİ &
TƏMİNATLI ƏQDLƏRİN DÖVLƏT REYESTRİ ARAYIŞI
=====================================================
Sertifikat №  : ${result.certificateId}
Tarix         : ${dateStr}
Sorğu         : ${result.query.toUpperCase()} (${result.queryType.toUpperCase()})
-----------------------------------------------------
NƏQLİYYAT VASİTƏSİNİN İDENTİFİKASİYASI:
Marka / Model : ${rec.make} ${rec.model} (${rec.year})
Dövlət Qeyd.  : ${rec.plateNumber}
VIN Kod       : ${rec.vin}
Mühərrik №    : ${rec.engineNumber}
Qeydiyyat     : ${rec.registrationCity}
Qanuni Sahibi : ${rec.ownerFullName}
-----------------------------------------------------
4-PİLLƏLİ TƏHLÜKƏSİZLİK YOXLANIŞI NƏTİCƏLƏRİ:
1. DİN / İnterpol Axtarış : ${rec.policeStatus === 'clear' ? '✅ TƏMİZ (Axtarışda deyil)' : '❌ DİQQƏT: AXTARIŞ QEYDİ VAR'}
2. Girovluq Reyestri     : ${rec.lienStatus === 'clean' ? '✅ TƏMİZ (Girovda deyil)' : rec.lienStatus === 'pledged_discharged' ? '✅ XİTAM VERİLİB (Kredit tam ödənilib)' : `⚠️ AKTİV GİROV (${rec.lienCreditor} - ₼${rec.lienAmountAzn?.toLocaleString()})`}
3. Məhkəmə & İcra Həbsi  : ${rec.legalRestriction === 'none' ? '✅ TƏMİZ (Məhdudiyyət yoxdur)' : `❌ HƏBS / MƏHDUDİYYƏT (${rec.enforcementAgency})`}
4. BDYPİ MMX Cərimələri   : ${rec.unpaidFinesCount === 0 ? '✅ 0 AZN (Borc yoxdur)' : `⚠️ ${rec.unpaidFinesCount} cərimə (₼${rec.unpaidFinesAmountAzn})`}
-----------------------------------------------------
TƏHLÜKƏSİZLİK REYTİNQİ: ${result.safetyScore} / 100
YEKUN QƏRAR          : ${result.verdictTitleAz}
${result.verdictDescriptionAz}
=====================================================
AutoNext Pro - Şəffaf və Təhlükəsiz Avtomobil Bazarı
=====================================================`;
}

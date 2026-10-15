import { Currency, Language } from '../types/vehicle';
import { CURRENCY_RATES } from './i18n';
import {
  CrossBorderRight,
  PartyGrantee,
  PartyGrantor,
  PoaDurationMonths,
  PoaFeeBreakdown,
  PoaRelationship,
  PoaScope,
  PoaStatus,
  PoaVehicleInfo,
  PowerOfAttorneyRecord,
  SubDelegationRight,
} from '../types/powerOfAttorney';

/**
 * Calculates statutory state duties, notarial drafting fees and electronic system service charges
 * adhering to Article 26 of the Law of the Republic of Azerbaijan on State Duties.
 */
export function calculatePoaFees(
  scope: PoaScope,
  relationship: PoaRelationship,
  currency: Currency = 'AZN'
): PoaFeeBreakdown {
  let stateDutyAzn = 20; // Default third party driving
  let notaryServiceFeeAzn = 10;
  const asanElectronicFeeAzn = 3;

  if (scope === 'DRIVING_ONLY') {
    if (relationship === 'CLOSE_RELATIVE') {
      stateDutyAzn = 5;
    } else {
      stateDutyAzn = 20;
    }
    notaryServiceFeeAzn = 10;
  } else if (scope === 'FULL_DISPOSAL') {
    if (relationship === 'CLOSE_RELATIVE') {
      stateDutyAzn = 15;
    } else {
      stateDutyAzn = 40;
    }
    notaryServiceFeeAzn = 20;
  }

  const totalAzn = stateDutyAzn + notaryServiceFeeAzn + asanElectronicFeeAzn;

  let totalConverted = totalAzn;
  if (currency === 'USD') {
    totalConverted = Math.round((totalAzn / CURRENCY_RATES.USD) * 100) / 100;
  } else if (currency === 'EUR') {
    totalConverted = Math.round((totalAzn / CURRENCY_RATES.EUR) * 100) / 100;
  }

  return {
    stateDutyAzn,
    notaryServiceFeeAzn,
    asanElectronicFeeAzn,
    totalAzn,
    totalConverted,
    currency,
  };
}

/**
 * Validates Azerbaijani Citizen PIN / FİN code (7 alphanumeric characters)
 */
export function validateFin(fin: string): { isValid: boolean; normalized: string; error?: string } {
  const normalized = (fin || '').trim().toUpperCase();
  if (!normalized) {
    return { isValid: false, normalized: '', error: 'FİN kod boş ola bilməz' };
  }
  if (normalized.length !== 7) {
    return { isValid: false, normalized, error: 'FİN kod tam 7 simvoldan ibarət olmalıdır' };
  }
  // Standard alphanumeric check
  const finRegex = /^[A-Z0-9]{7}$/;
  if (!finRegex.test(normalized)) {
    return { isValid: false, normalized, error: 'FİN kod yalnız hərf və rəqəmlərdən ibarət ola bilər' };
  }
  return { isValid: true, normalized };
}

/**
 * Calculates the expiration date based on issuance date and duration in months
 */
export function calculateExpiryDate(issuedDateStr: string, durationMonths: PoaDurationMonths): string {
  const date = new Date(issuedDateStr);
  if (isNaN(date.getTime())) {
    const fallback = new Date();
    fallback.setMonth(fallback.getMonth() + durationMonths);
    return fallback.toISOString().split('T')[0];
  }
  date.setMonth(date.getMonth() + durationMonths);
  return date.toISOString().split('T')[0];
}

/**
 * Calculates remaining validity in days and evaluates status (ACTIVE, EXPIRING_SOON, EXPIRED)
 */
export function calculateRemainingPoaDays(
  expiryDateStr: string,
  currentDateStr?: string
): { daysRemaining: number; status: PoaStatus } {
  const current = currentDateStr ? new Date(currentDateStr) : new Date();
  const expiry = new Date(expiryDateStr);

  const diffMs = expiry.getTime() - current.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysRemaining <= 0) {
    return { daysRemaining: 0, status: 'EXPIRED' };
  }
  if (daysRemaining <= 30) {
    return { daysRemaining, status: 'EXPIRING_SOON' };
  }
  return { daysRemaining, status: 'ACTIVE' };
}

/**
 * Generates an authentic electronic power of attorney registration code
 */
export function generatePoaRegistrationNumber(seed?: number): string {
  const randomPart = seed !== undefined ? String(seed).padStart(5, '0') : Math.floor(10000 + Math.random() * 90000);
  return `ETB-NOT-2026-${randomPart}`;
}

/**
 * Generates simulated digital security verification hash for QR code
 */
export function generatePoaSecurityHash(
  grantorFin: string,
  granteeFin: string,
  plateNumber: string,
  regNumber: string
): string {
  const raw = `${grantorFin}:${granteeFin}:${plateNumber}:${regNumber}:ASAN-SIMA`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const salt = Math.abs((hash ^ 0x5a5a5a5a) >>> 0).toString(16).padStart(8, '0');
  return `${hex}${salt}`.slice(0, 16);
}

/**
 * Formats full statutory notarial legal text according to the Civil Code of Azerbaijan (Articles 362-368)
 */
export function formatPoaLegalDocument(
  record: Partial<PowerOfAttorneyRecord>,
  lang: Language = 'az'
): string {
  const regNum = record.registrationNumber || 'ETB-NOT-2026-XXXXX';
  const issued = record.issuedDate || new Date().toISOString().split('T')[0];
  const expiry = record.expiryDate || '2027-01-01';
  const duration = record.durationMonths || 12;
  const notaryOffice = record.notaryOffice?.name || '1 saylı Bakı ASAN Xidmət Mərkəzi Notariat Şöbəsi';
  const notaryName = record.notaryOffice?.notaryName || 'Dövlət Notariusu';

  const grantor = record.grantor || {
    fullName: 'Məmmədov Rəşad İlham oğlu',
    fin: '5K9P32A',
    idCardSeriesNumber: 'AZE 19482910',
    phone: '+994 50 211 44 55',
    address: 'Bakı şəhəri',
  };

  const grantee = record.grantee || {
    fullName: 'Məmmədov Nicat Rəşad oğlu',
    fin: '7B4L81C',
    idCardSeriesNumber: 'AZE 22391048',
    driverLicenseSeriesNumber: 'BS 884912',
    driverLicenseCategories: ['B'],
    phone: '+994 55 789 22 11',
    address: 'Bakı şəhəri',
  };

  const vehicle = record.vehicle || {
    plateNumber: '10-AA-100',
    texpasportNumber: 'AA 928341',
    vin: 'WAUZZZF28MA049182',
    makeModel: 'Audi A6 S-Line',
    year: 2022,
    engineVolumeCc: 1984,
    color: 'Qara Metalik',
  };

  const scopeLabel =
    record.scope === 'FULL_DISPOSAL'
      ? lang === 'en'
        ? 'Full Administration, Disposal, Sale & Rental Authority (General Power of Attorney)'
        : lang === 'ru'
        ? 'Генеральная доверенность: право распоряжения, продажи, сдачи в аренду и залога'
        : 'Baş Etibarnamə: sərəncam vermək, satmaq, girov qoymaq və icarəyə vermək hüququ ilə'
      : lang === 'en'
      ? 'Authority to Operate and Drive the Vehicle Only'
      : lang === 'ru'
      ? 'Право управления транспортным средством'
      : 'Nəqliyyat vasitəsini idarə etmək hüququ ilə';

  const subDelLabel =
    record.subDelegation === 'ALLOWED'
      ? lang === 'en'
        ? 'With right of sub-delegation to third parties'
        : lang === 'ru'
        ? 'С правом передоверия третьим лицам'
        : 'Başqa şəxsə etibar etmək (sub-etibarnamə) hüququ ilə'
      : lang === 'en'
      ? 'Without right of sub-delegation'
      : lang === 'ru'
      ? 'Без права передоверия'
      : 'Başqa şəxsə etibar etmək hüququ olmadan';

  const borderLabel =
    record.crossBorder === 'CROSS_BORDER_ALLOWED'
      ? lang === 'en'
        ? 'Authorized to take the vehicle across the state border of the Republic of Azerbaijan'
        : lang === 'ru'
        ? 'С правом выезда за пределы Азербайджанской Республики'
        : 'Azərbaycan Respublikasının dövlət sərhədindən kənara çıxarmaq hüququ verilir'
      : lang === 'en'
      ? 'Valid strictly within the territory of the Republic of Azerbaijan'
      : lang === 'ru'
      ? 'Действительно исключительно на территории Азербайджанской Республики'
      : 'Yalnız Azərbaycan Respublikası ərazisində etibarlıdır';

  if (lang === 'en') {
    return `REPUBLIC OF AZERBAIJAN - MINISTRY OF JUSTICE
ELECTRONIC NOTARY UNIFIED INFORMATION SYSTEM

ELECTRONIC POWER OF ATTORNEY No: ${regNum}
Date of Registration: ${issued} | Valid Until: ${expiry} (${duration} months)

NOTARY REGISTRY OFFICE:
${notaryOffice}
Notary Public: ${notaryName}

I, the undersigned PRINCIPAL (GRANTOR):
Full Name: ${grantor.fullName}
Citizen PIN (FİN): ${grantor.fin} | Identity Document: ${grantor.idCardSeriesNumber}
Address: ${grantor.address} | Tel: ${grantor.phone}

Being the lawful owner of the motor vehicle:
Make & Model: ${vehicle.makeModel} | Year: ${vehicle.year}
State License Plate: ${vehicle.plateNumber}
Vehicle Passport (Texpasport): ${vehicle.texpasportNumber} | VIN: ${vehicle.vin}

HEREBY APPOINT AND AUTHORIZE AS ATTORNEY-IN-FACT (GRANTEE):
Full Name: ${grantee.fullName}
Citizen PIN (FİN): ${grantee.fin} | Identity Document: ${grantee.idCardSeriesNumber}
Driver's License: ${grantee.driverLicenseSeriesNumber} (Categories: ${grantee.driverLicenseCategories.join(', ')})
Address: ${grantee.address} | Tel: ${grantee.phone}

SCOPE OF AUTHORITY:
${scopeLabel}
Sub-delegation: ${subDelLabel}
Territorial jurisdiction: ${borderLabel}

Statutory legal basis: Articles 362-368 of the Civil Code of the Republic of Azerbaijan.
Pursuant to Article 332 of the Code of Administrative Offences, this electronic document is synchronized in real-time with the Main State Traffic Police Department (BDYP) electronic database. Physical paper carrying is NOT required.

Verified by SİMA Digital Signature / ASAN İmza Electronic Certificate.`;
  }

  if (lang === 'ru') {
    return `АЗЕРБАЙДЖАНСКАЯ РЕСПУБЛИКА - МИНИСТЕРСТВО ЮСТИЦИИ
ЕДИНАЯ ЭЛЕКТРОННАЯ ИНФОРМАЦИОННАЯ СИСТЕМА НОТАРИАТА

ЭЛЕКТРОННАЯ ДОВЕРЕННОСТЬ №: ${regNum}
Дата регистрации: ${issued} | Действительна до: ${expiry} (${duration} мес.)

НОТАРИАЛЬНАЯ КОНТОРА:
${notaryOffice}
Нотариус: ${notaryName}

Я, нижеподписавшийся ДОВЕРИТЕЛЬ:
Ф.И.О.: ${grantor.fullName}
ПИН-код (FİN): ${grantor.fin} | Удостоверение личности: ${grantor.idCardSeriesNumber}
Адрес: ${grantor.address} | Тел: ${grantor.phone}

Являясь законным владельцем автотранспортного средства:
Марка и модель: ${vehicle.makeModel} | Год: ${vehicle.year}
Государственный номер: ${vehicle.plateNumber}
Техпаспорт: ${vehicle.texpasportNumber} | VIN-код: ${vehicle.vin}

НАСТОЯЩИМ УПОЛНОМАЧИВАЮ ПОВЕРЕННОГО:
Ф.И.О.: ${grantee.fullName}
ПИН-код (FİN): ${grantee.fin} | Удостоверение личности: ${grantee.idCardSeriesNumber}
Водительское удостоверение: ${grantee.driverLicenseSeriesNumber} (Категории: ${grantee.driverLicenseCategories.join(', ')})
Адрес: ${grantee.address} | Тел: ${grantee.phone}

ОБЪЕМ ПОЛНОМОЧИЙ:
${scopeLabel}
Право передоверия: ${subDelLabel}
Территориальные полномочия: ${borderLabel}

Законное основание: Статьи 362-368 Гражданского кодекса Азербайджанской Республики.
Согласно статье 332 Кодекса об административных проступках, данная электронная доверенность мгновенно синхронизирована с базой Главного управления государственной дорожной полиции (BDYP). Ношение бумажного оригинала НЕ требуется.

Подтверждено цифровой подписью SİMA / ASAN İmza.`;
  }

  // Azerbaijani (Official State Language)
  return `AZƏRBAYCAN RESPUBLİKASI ƏDLİYYƏ NAZİRLİYİ
ELEKTRON NOTARİAT VAHİD İNFORMASİYA SİSTEMİ

ELEKTRON ETİBARNAMƏ №: ${regNum}
Tərtib tarixi: ${issued} | Etibarlılıq müddəti: ${expiry} (${duration} ay)

NOTARİAT KONTORU:
${notaryOffice}
Dövlət notariusu: ${notaryName}

Mən, etibarnamə verən MÜLKİYYƏTÇİ:
Adı, soyadı, ata adı: ${grantor.fullName}
FİN: ${grantor.fin} | Şəxsiyyət vəsiqəsi: ${grantor.idCardSeriesNumber}
Ünvan: ${grantor.address} | Telefon: ${grantor.phone}

Mənə məxsus nəqliyyat vasitəsi:
Marka və model: ${vehicle.makeModel} | Buraxılış ili: ${vehicle.year}
Dövlət qeydiyyat nişanı: ${vehicle.plateNumber}
Qeydiyyat şəhadətnaməsi (Texpasport): ${vehicle.texpasportNumber} | VIN: ${vehicle.vin}

BU ETİBARNAMƏ İLƏ SƏLAHİYYƏT VERİRƏM MÜVƏKKİLƏ:
Adı, soyadı, ata adı: ${grantee.fullName}
FİN: ${grantee.fin} | Şəxsiyyət vəsiqəsi: ${grantee.idCardSeriesNumber}
Sürücülük vəsiqəsi: ${grantee.driverLicenseSeriesNumber} (Kateqoriyalar: ${grantee.driverLicenseCategories.join(', ')})
Ünvan: ${grantee.address} | Telefon: ${grantee.phone}

SƏLAHİYYƏTİN HƏCMİ VƏ HÜQUQLAR:
${scopeLabel}
Sub-etibarnamə hüququ: ${subDelLabel}
Ərazi səlahiyyəti: ${borderLabel}

Hüquqi əsas: Azərbaycan Respublikası Mülki Məcəlləsinin 362-368-ci maddələri və «Notariat haqqında» Qanun.
İnzibati Xətalar Məcəlləsinin 332-ci maddəsinə uyğun olaraq, bu etibarnamə DİN Baş Dövlət Yol Polisi İdarəsinin (BDYP) mərkəzi elektron bazasına dərhal inteqrasiya olunmuşdur. Fiziki kağız nüsxənin daşınması TƏLƏB OLUNMUR.

SİMA Rəqəmsal İmza / ASAN İmza sertifikatı ilə rəsmi təsdiq edilmişdir.`;
}

/**
 * Filters registered power of attorney records based on query and status filter
 */
export function filterPoaRecords(
  records: PowerOfAttorneyRecord[],
  searchTerm: string,
  statusFilter?: PoaStatus | 'ALL'
): PowerOfAttorneyRecord[] {
  const query = (searchTerm || '').trim().toLowerCase();

  return records.filter((rec) => {
    if (statusFilter && statusFilter !== 'ALL' && rec.status !== statusFilter) {
      return false;
    }

    if (!query) return true;

    const matchesReg = rec.registrationNumber.toLowerCase().includes(query);
    const matchesPlate = rec.vehicle.plateNumber.toLowerCase().includes(query);
    const matchesGrantor = rec.grantor.fullName.toLowerCase().includes(query) || rec.grantor.fin.toLowerCase().includes(query);
    const matchesGrantee = rec.grantee.fullName.toLowerCase().includes(query) || rec.grantee.fin.toLowerCase().includes(query);
    const matchesModel = rec.vehicle.makeModel.toLowerCase().includes(query);

    return matchesReg || matchesPlate || matchesGrantor || matchesGrantee || matchesModel;
  });
}

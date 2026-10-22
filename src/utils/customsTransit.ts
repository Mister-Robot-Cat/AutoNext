/**
 * Official State Customs Committee (DGK / Dövlət Gömrük Komitəsi) & BDYP
 * Foreign-Registered Vehicle Temporary Import, Customs Deposit & 90-Day Transit Regime Engine.
 *
 * Statutory Legal Foundations:
 * 1. Customs Code of the Republic of Azerbaijan (Gömrük Məcəlləsi, Articles 258, 259, 260 — Temporary import regime).
 * 2. Tax Code of the Republic of Azerbaijan (Vergi Məcəlləsi, Articles 209-211 — Road Tax / Yol Vergisi for foreign vehicles).
 * 3. Law of the Republic of Azerbaijan "On State Duties" ("Dövlət rüsumu haqqında" AR Qanunu, Article 33 — Customs clearance fees).
 * 4. Code of Administrative Offences (İnzibati Xətalar Məcəlləsi, Article 499 — Overstaying customs regimes and illegal disposal).
 */

export type ImporterStatus = 'non_resident' | 'resident';

export type TransitPurpose =
  | 'tourism_personal'
  | 'business_visit'
  | 'commercial_transit'
  | 'family_visit'
  | 'temporary_employment';

export type ForeignVehicleCategory =
  | 'passenger_car'
  | 'suv_4x4'
  | 'motorcycle'
  | 'minibus'
  | 'commercial_truck';

export type ForeignFuelType = 'petrol' | 'diesel' | 'hybrid' | 'electric';

export type BorderCountry = 'georgia' | 'russia' | 'iran' | 'turkey' | 'caspian_transit';

export type RegimeComplianceStatus =
  | 'compliant'
  | 'expiring_soon'
  | 'penalty_tier_1'
  | 'penalty_tier_2'
  | 'confiscation_risk';

export interface BorderCustomsPost {
  id: string;
  nameAz: string;
  country: BorderCountry;
  countryNameAz: string;
  countryFlag: string;
  regionAz: string;
  corridorNameAz: string;
  distanceFromBakuKm: number;
  averageWaitMinutes: number;
  dailyCapacityVehicles: number;
  currentQueueCount: number;
  operatingHours: string;
  contactPhone: string;
  hasETransitLane: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface TemporaryImportCalculationParams {
  importerStatus: ImporterStatus;
  vehicleCategory: ForeignVehicleCategory;
  engineCc: number;
  manufactureYear: number;
  fuelType: ForeignFuelType;
  vehicleValueAzn: number;
  stayDurationDays: number; // 1 to 90 days (or 3 days for fast transit)
  purpose: TransitPurpose;
  hasElectronicGpsLock: boolean;
}

export interface TemporaryImportAuditResult {
  importerStatus: ImporterStatus;
  stayDurationDays: number;
  maxPermittedDays: number;
  isOverdue: boolean;
  daysRemainingOrOverdue: number;
  complianceStatus: RegimeComplianceStatus;
  statusLabelAz: string;
  // Financial breakdown
  roadTaxAzn: number;
  customsProcessingFeeAzn: number;
  gpsEsealFeeAzn: number;
  refundableGuaranteeDepositAzn: number;
  totalPayableAtBorderAzn: number;
  // Penalty breakdown under İXM 499
  penaltyFineAzn: number;
  penaltyArticleAz: string;
  penaltyDescriptionAz: string;
  // Legal notice & conditions
  isDepositRequired: boolean;
  depositReasonAz: string;
  requiredDocumentsAz: string[];
}

export interface TemporaryImportPermit {
  id: string;
  permitNumber: string; // e.g. DGK-MVI-2026-XXXXX
  importerName: string;
  importerNationality: string;
  importerPassportOrFin: string;
  importerStatus: ImporterStatus;
  vehicleMakeModel: string;
  vehicleCategory: ForeignVehicleCategory;
  originCountryCode: string; // e.g. "GE", "RU", "TR", "IR", "KZ", "DE"
  foreignPlateNumber: string;
  vin: string;
  engineCc: number;
  fuelType: ForeignFuelType;
  entryDate: string;
  permittedDeadlineDate: string;
  entryCheckpointId: string;
  entryCheckpointNameAz: string;
  stayDurationDays: number;
  daysRemaining: number;
  isOverdue: boolean;
  complianceStatus: RegimeComplianceStatus;
  roadTaxPaidAzn: number;
  refundableDepositHeldAzn: number;
  qrSecurityHash: string;
  customsOfficerId: string;
}

/**
 * Currency exchange rates anchored to AZN
 */
export const CURRENCY_RATES = {
  AZN: 1.0,
  USD: 1.7,
  EUR: 1.84,
};

/**
 * Statutory Road Tax (Yol Vergisi) calculation under Tax Code Articles 209-211
 */
export function calculateRoadTax(
  category: ForeignVehicleCategory,
  engineCc: number,
  stayDays: number
): number {
  if (category === 'motorcycle') {
    return stayDays <= 30 ? 15 : 25;
  }

  if (category === 'passenger_car' || category === 'suv_4x4') {
    let baseRate = 25.5; // ~$15 USD base for up to 30 days
    if (stayDays > 30 && stayDays <= 60) {
      baseRate = 42.5; // ~$25 USD
    } else if (stayDays > 60) {
      baseRate = 51.0; // ~$30 USD for up to 90 days
    }

    // Engine displacement modifier for high-displacement cars (>3000cc)
    if (engineCc > 3000) {
      baseRate += Math.round(((engineCc - 3000) / 500) * 8.5);
    }
    return Math.round(baseRate);
  }

  if (category === 'minibus') {
    return stayDays <= 30 ? 85 : 170; // 50 to 100 USD
  }

  // Commercial truck
  return stayDays <= 30 ? 170 : 255; // 100 to 150 USD
}

/**
 * Statutory Refundable Guarantee Deposit (Gömrük Təminatı) calculation under Customs Code Art. 258.4.
 * Non-residents are statutory EXEMPT (0 AZN deposit).
 * Residents importing a foreign-registered car must deposit estimated import duties & VAT into treasury.
 */
export function calculateGuaranteeDeposit(
  importerStatus: ImporterStatus,
  vehicleValueAzn: number,
  engineCc: number,
  manufactureYear: number,
  fuelType: ForeignFuelType
): number {
  if (importerStatus === 'non_resident') {
    return 0; // Statutory exemption for foreign citizens & tourists
  }

  // Resident deposit computation: Import duty (15%) + Excise tax + VAT (18%)
  const vehicleAge = Math.max(0, 2026 - manufactureYear);
  const importDuty = vehicleValueAzn * 0.15;

  let exciseTax = 0;
  if (fuelType === 'electric') {
    exciseTax = 0; // EV tax exemption
  } else if (engineCc <= 2000) {
    exciseTax = engineCc * 0.35;
  } else if (engineCc <= 3000) {
    exciseTax = 700 + (engineCc - 2000) * 5.0;
  } else {
    exciseTax = 5700 + (engineCc - 3000) * 17.0;
  }

  // Older vehicle age penalty surcharge (>7 years)
  if (vehicleAge > 7 && fuelType !== 'electric') {
    exciseTax *= 1.25;
  }

  const vatBase = vehicleValueAzn + importDuty + exciseTax;
  const vat = vatBase * 0.18;

  const totalCustomsObligation = importDuty + exciseTax + vat;
  return Math.round(totalCustomsObligation);
}

/**
 * Administrative Penalties under Article 499 of the Code of Administrative Offences (İXM).
 */
export function calculateIxmLawSanction(
  daysOverdue: number,
  vehicleValueAzn: number
): {
  fineAzn: number;
  article: string;
  descriptionAz: string;
  status: RegimeComplianceStatus;
  statusLabelAz: string;
} {
  if (daysOverdue <= 0) {
    return {
      fineAzn: 0,
      article: 'Gömrük Məcəlləsi Maddə 258',
      descriptionAz: 'Müvəqqəti idxal rejimi qanunidir. Vaxtaşımı yoxdur.',
      status: 'compliant',
      statusLabelAz: 'Qanuni Rejimdədir',
    };
  }

  if (daysOverdue <= 30) {
    return {
      fineAzn: 100,
      article: 'İXM Maddə 499.1',
      descriptionAz:
        'Müvəqqəti idxal edilmiş nəqliyyat vasitəsinin ölkədən aparılması müddətinin 30 günədək pozulması: 100 AZN cərimə tətbiq olunur.',
      status: 'penalty_tier_1',
      statusLabelAz: 'İnzibati Cərimə (30 günədək)',
    };
  }

  if (daysOverdue <= 90) {
    return {
      fineAzn: 300,
      article: 'İXM Maddə 499.2',
      descriptionAz:
        'Müvəqqəti idxal rejiminin 30 gündən 90 günədək gecikdirilməsi: 300 AZN cərimə tətbiq olunur.',
      status: 'penalty_tier_2',
      statusLabelAz: 'İnzibati Cərimə (30-90 gün)',
    };
  }

  // Exceeding 90 days or unlawful disposal
  const minPenalty = Math.round(vehicleValueAzn * 0.5);
  return {
    fineAzn: minPenalty,
    article: 'İXM Maddə 499.3',
    descriptionAz:
      'Rejimin 90 gündən artıq pozulması və ya nəqliyyat vasitəsinin qanunsuz özgəninkiləşdirilməsi: Gömrük dəyərinin 50%-dən 100%-dək cəriməsi və ya nəqliyyat vasitəsinin müsadirəsi!',
    status: 'confiscation_risk',
    statusLabelAz: 'Müsadirə və ya 50-100% Cərimə Riski',
  };
}

/**
 * Full temporary import calculation audit
 */
export function calculateCustomsTransitAudit(
  params: TemporaryImportCalculationParams
): TemporaryImportAuditResult {
  const maxPermittedDays = 90;
  const isOverdue = params.stayDurationDays > maxPermittedDays;
  const daysOverdue = isOverdue ? params.stayDurationDays - maxPermittedDays : 0;
  const daysRemaining = isOverdue ? 0 : maxPermittedDays - params.stayDurationDays;

  // Road tax calculation
  const roadTaxAzn = calculateRoadTax(
    params.vehicleCategory,
    params.engineCc,
    Math.min(params.stayDurationDays, 90)
  );

  // Statutory customs processing duty (30 AZN)
  const customsProcessingFeeAzn = 30;

  // Optional GPS electronic tracking lock fee for commercial / transit corridors (20 AZN)
  const gpsEsealFeeAzn = params.hasElectronicGpsLock ? 20 : 0;

  // Refundable guarantee deposit
  const refundableGuaranteeDepositAzn = calculateGuaranteeDeposit(
    params.importerStatus,
    params.vehicleValueAzn,
    params.engineCc,
    params.manufactureYear,
    params.fuelType
  );

  const totalPayableAtBorderAzn =
    roadTaxAzn + customsProcessingFeeAzn + gpsEsealFeeAzn + refundableGuaranteeDepositAzn;

  // Sanctions check
  const sanction = calculateIxmLawSanction(daysOverdue, params.vehicleValueAzn);

  let finalComplianceStatus: RegimeComplianceStatus = sanction.status;
  let statusLabelAz = sanction.statusLabelAz;

  if (sanction.status === 'compliant' && daysRemaining <= 15) {
    finalComplianceStatus = 'expiring_soon';
    statusLabelAz = `Müddətin Bitməsinə ${daysRemaining} Gün Qalır`;
  }

  const isDepositRequired = params.importerStatus === 'resident';
  const depositReasonAz = isDepositRequired
    ? 'Azərbaycan Respublikası rezidentləri xarici qeydiyyatlı avtomobili ölkəyə gətirdikdə Gömrük Məcəlləsinin 258.4-cü maddəsinə əsasən depozit hesaba tam gömrük təminatı köçürməlidir (avtomobil vaxtında geri çıxarıldıqda 100% geri qaytarılır).'
    : 'Xarici vətəndaşlar (qeyri-rezidentlər) şəxsi istifadə üçün 90 günədək gömrük təminatı (depozit) ödəməkdən tam azaddırlar (Gömrük Məcəlləsi Maddə 258.1).';

  const requiredDocumentsAz = [
    'Xarici dövlətin qeydiyyat şəhadətnaməsi (Orijinal Texpasport)',
    'Sürücünün beynəlxalq və ya xarici pasportu (Giriş vizası / möhürü ilə)',
    'Beynəlxalq Yaşıl Kart (Green Card) və ya İSB Sərhəd İcbari Sığortası',
    'Etibarnamə (Əgər sürücü avtomobilin mülkiyyətçisi deyilsə)',
    ...(isDepositRequired
      ? ['Dövlət Gömrük Komitəsinin depozit hesabına gömrük təminatının ödənilməsi qəbzi']
      : ['DGK Elektron Müvəqqəti İdxal Bəyannaməsi']),
  ];

  return {
    importerStatus: params.importerStatus,
    stayDurationDays: params.stayDurationDays,
    maxPermittedDays,
    isOverdue,
    daysRemainingOrOverdue: isOverdue ? daysOverdue : daysRemaining,
    complianceStatus: finalComplianceStatus,
    statusLabelAz,
    roadTaxAzn,
    customsProcessingFeeAzn,
    gpsEsealFeeAzn,
    refundableGuaranteeDepositAzn,
    totalPayableAtBorderAzn,
    penaltyFineAzn: sanction.fineAzn,
    penaltyArticleAz: sanction.article,
    penaltyDescriptionAz: sanction.descriptionAz,
    isDepositRequired,
    depositReasonAz,
    requiredDocumentsAz,
  };
}

/**
 * Generate official electronic temporary import permit code
 */
export function generateTemporaryImportPermit(
  params: TemporaryImportCalculationParams,
  importerName: string,
  importerPassportOrFin: string,
  importerNationality: string,
  vehicleMakeModel: string,
  originCountryCode: string,
  foreignPlateNumber: string,
  vin: string,
  checkpoint: BorderCustomsPost
): TemporaryImportPermit {
  const audit = calculateCustomsTransitAudit(params);
  const now = new Date();
  const entryDate = now.toISOString().split('T')[0];

  const deadline = new Date(now);
  deadline.setDate(deadline.getDate() + Math.min(params.stayDurationDays, 90));
  const permittedDeadlineDate = deadline.toISOString().split('T')[0];

  const randomSeq = Math.floor(10000 + Math.random() * 90000);
  const permitNumber = `DGK-MVI-2026-${randomSeq}`;
  const qrSecurityHash = `SHA256:${permitNumber}:${vin}:${foreignPlateNumber}:${entryDate}:${audit.totalPayableAtBorderAzn}AZN`;

  return {
    id: `permit-${randomSeq}`,
    permitNumber,
    importerName,
    importerNationality,
    importerPassportOrFin,
    importerStatus: params.importerStatus,
    vehicleMakeModel,
    vehicleCategory: params.vehicleCategory,
    originCountryCode,
    foreignPlateNumber,
    vin,
    engineCc: params.engineCc,
    fuelType: params.fuelType,
    entryDate,
    permittedDeadlineDate,
    entryCheckpointId: checkpoint.id,
    entryCheckpointNameAz: checkpoint.nameAz,
    stayDurationDays: params.stayDurationDays,
    daysRemaining: audit.daysRemainingOrOverdue,
    isOverdue: audit.isOverdue,
    complianceStatus: audit.complianceStatus,
    roadTaxPaidAzn: audit.roadTaxAzn + audit.customsProcessingFeeAzn,
    refundableDepositHeldAzn: audit.refundableGuaranteeDepositAzn,
    qrSecurityHash,
    customsOfficerId: `DGK-INSP-${Math.floor(100 + Math.random() * 900)}`,
  };
}

/**
 * Convert AZN amount to target currency (USD, EUR)
 */
export function convertCurrency(
  amountAzn: number,
  targetCurrency: 'AZN' | 'USD' | 'EUR'
): number {
  if (targetCurrency === 'AZN') return amountAzn;
  const rate = CURRENCY_RATES[targetCurrency];
  return Math.round((amountAzn / rate) * 100) / 100;
}

/**
 * Filter temporary import permits by query
 */
export function filterPermits(
  permits: TemporaryImportPermit[],
  query: string
): TemporaryImportPermit[] {
  if (!query.trim()) return permits;
  const lower = query.toLowerCase().trim();
  return permits.filter(
    (p) =>
      p.permitNumber.toLowerCase().includes(lower) ||
      p.foreignPlateNumber.toLowerCase().includes(lower) ||
      p.vin.toLowerCase().includes(lower) ||
      p.importerName.toLowerCase().includes(lower) ||
      p.vehicleMakeModel.toLowerCase().includes(lower) ||
      p.originCountryCode.toLowerCase().includes(lower)
  );
}

/**
 * Filter customs checkpoints by country or keyword
 */
export function filterCheckpoints(
  checkpoints: BorderCustomsPost[],
  countryFilter: string,
  searchQuery: string = ''
): BorderCustomsPost[] {
  return checkpoints.filter((cp) => {
    const matchesCountry = countryFilter === 'all' || cp.country === countryFilter;
    const matchesQuery =
      !searchQuery.trim() ||
      cp.nameAz.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cp.countryNameAz.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cp.regionAz.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cp.corridorNameAz.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCountry && matchesQuery;
  });
}

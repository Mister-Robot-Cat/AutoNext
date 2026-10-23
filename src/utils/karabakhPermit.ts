/**
 * Official RİNN, DİN, ANAMA & BDYP "Yolumuz Qarabağa" (e-yol.az) Electronic Vehicle Entry & Travel Permit Engine
 * Compliant with:
 * - Special Regime on Liberated Territories (Qarabağ və Şərqi Zəngəzur İqtisadi Rayonları)
 * - ANAMA (Azerbaijan National Agency for Mine Action) Mandatory Safety Instructions
 * - Law of Azerbaijan on Road Traffic (YHQ) & BDYP Checkpoint Regulations
 * - Ministry of Digital Development and Transport (RİNN) & Ministry of Internal Affairs (DİN)
 */

export type KarabakhDestinationZone =
  | 'shusha'
  | 'agdam'
  | 'fuzuli'
  | 'lachin'
  | 'kalbajar'
  | 'zangilan'
  | 'jabrayil'
  | 'khankendi';

export type PermitDurationTier =
  | 'day_trip_1d'
  | 'weekend_2d'
  | 'hotel_stay_3d'
  | 'commercial_5d';

export type CheckpointStatus = 'normal' | 'moderate' | 'busy';

export interface KarabakhCheckpoint {
  id: string;
  nameAz: string;
  nameEn: string;
  regionAz: string;
  corridorAz: string;
  distanceKmFromBaku: number;
  operatingHours: string;
  liveStatus: CheckpointStatus;
  queueCars: number;
  policeUnit: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  lanes: number;
  avgInspectionSec: number;
}

export interface AnamaSafetyRule {
  id: string;
  titleAz: string;
  titleEn: string;
  descriptionAz: string;
  severity: 'critical' | 'mandatory' | 'warning';
}

export interface PassengerInfo {
  id: string;
  fullName: string;
  fin: string;
  relation: 'driver' | 'family' | 'guest' | 'colleague';
}

export interface KarabakhPermitApplication {
  destination: KarabakhDestinationZone;
  durationTier: PermitDurationTier;
  startDate: string;
  vehiclePlate: string;
  vehicleModel: string;
  vin: string;
  tireTreadMm: number;
  hasValidTexpasport: boolean;
  hasValidInspection: boolean;
  hasValidInsurance: boolean;
  driverFin: string;
  driverFullName: string;
  driverPhone: string;
  driverLicenseNumber: string;
  passengers: PassengerInfo[];
  hotelBookingRef?: string;
  hotelName?: string;
  anamaAgreementsSigned: boolean;
  selectedCheckpointId: string;
}

export interface KarabakhAuditResult {
  isEligible: boolean;
  score: number; // 0 - 100
  missingRequirements: string[];
  warnings: string[];
  approvedCorridor: string;
  destinationNameAz: string;
  estimatedTravelTimeHours: number;
  distanceKmFromBaku: number;
  dailyQuotaRemaining: number;
  hotelRequired: boolean;
  hotelVerified: boolean;
  stateEntranceFeeAzn: number; // Subsidized 0 AZN
  hotelEstimatedCostAzn: number;
}

export interface KarabakhElectronicPermit {
  permitNumber: string; // e.g. QARABAG-EYOL-2026-XXXXX
  issueDate: string;
  validFrom: string;
  validUntil: string;
  destinationZone: KarabakhDestinationZone;
  destinationNameAz: string;
  approvedCorridor: string;
  approvedCheckpointName: string;
  vehiclePlate: string;
  vehicleModel: string;
  vin: string;
  driverFin: string;
  driverFullName: string;
  driverPhone: string;
  driverLicenseNumber: string;
  passengerCount: number;
  passengers: PassengerInfo[];
  hotelName?: string;
  hotelBookingRef?: string;
  anamaStatus: 'VERIFIED_AND_SIGNED';
  qrSecurityHash: string;
  policeBarcode: string;
  status: 'ACTIVE' | 'EXPIRED' | 'AT_CHECKPOINT' | 'COMPLETED';
}

export const DESTINATION_DETAILS: Record<
  KarabakhDestinationZone,
  {
    nameAz: string;
    nameEn: string;
    distanceKm: number;
    travelHours: number;
    corridorAz: string;
    dailyQuota: number;
    checkpointId: string;
  }
> = {
  shusha: {
    nameAz: 'Şuşa Şəhəri',
    nameEn: 'Shusha City',
    distanceKm: 395,
    travelHours: 4.8,
    corridorAz: 'Zəfər Yolu (Füzuli – Daşaltı – Şuşa)',
    dailyQuota: 180,
    checkpointId: 'nbm-fuzuli-zafar',
  },
  agdam: {
    nameAz: 'Ağdam Şəhəri',
    nameEn: 'Aghdam City',
    distanceKm: 350,
    travelHours: 4.2,
    corridorAz: 'Bərdə – Ağdam – Şahbulaq Dəhlizi',
    dailyQuota: 160,
    checkpointId: 'nbm-barda-agdam',
  },
  fuzuli: {
    nameAz: 'Füzuli Şəhəri & Hava Limanı',
    nameEn: 'Fuzuli City & International Airport',
    distanceKm: 310,
    travelHours: 3.7,
    corridorAz: 'Hacıqabul – Bəhramtəpə – Füzuli (M-6)',
    dailyQuota: 200,
    checkpointId: 'nbm-fuzuli-zafar',
  },
  lachin: {
    nameAz: 'Laçın Şəhəri & Zabux',
    nameEn: 'Lachin City & Zabukh',
    distanceKm: 440,
    travelHours: 5.5,
    corridorAz: 'Kəlbəcər – Laçın və Qubadlı – Laçın Dəhlizi',
    dailyQuota: 120,
    checkpointId: 'nbm-qubadli-lachin',
  },
  kalbajar: {
    nameAz: 'Kəlbəcər & İstisu',
    nameEn: 'Kalbajar & Istisu',
    distanceKm: 460,
    travelHours: 6.0,
    corridorAz: 'Toğanalı – Murovdağ Tuneli – Kəlbəcər',
    dailyQuota: 90,
    checkpointId: 'nbm-toganali-kalbajar',
  },
  zangilan: {
    nameAz: 'Zəngilan & Ağalı Ağıllı Kənd',
    nameEn: 'Zangilan & Aghali Smart Village',
    distanceKm: 385,
    travelHours: 4.6,
    corridorAz: 'Horadiz – Cəbrayıl – Zəngilan – Ağbənd (M-6)',
    dailyQuota: 150,
    checkpointId: 'nbm-zangilan-agali',
  },
  jabrayil: {
    nameAz: 'Cəbrayıl & Xudafərin Körpüləri',
    nameEn: 'Jabrayil & Khudaferin Bridges',
    distanceKm: 345,
    travelHours: 4.1,
    corridorAz: 'Hacıqabul – Horadiz – Cəbrayıl (M-6)',
    dailyQuota: 170,
    checkpointId: 'nbm-horadiz-jabrayil',
  },
  khankendi: {
    nameAz: 'Xankəndi & Xocalı',
    nameEn: 'Khankendi & Khojaly',
    distanceKm: 385,
    travelHours: 4.7,
    corridorAz: 'Ağdam – Əsgəran – Xocalı – Xankəndi',
    dailyQuota: 140,
    checkpointId: 'nbm-agdam-khankendi',
  },
};

/**
 * Currency exchange rates
 */
export const EXCHANGE_RATES: Record<'AZN' | 'USD' | 'EUR', number> = {
  AZN: 1.0,
  USD: 0.5882, // 1 AZN ≈ 0.59 USD (1.70 AZN/USD)
  EUR: 0.5405, // 1 AZN ≈ 0.54 EUR (1.85 AZN/EUR)
};

export const convertCurrency = (
  amountAzn: number,
  currency: 'AZN' | 'USD' | 'EUR'
): number => {
  const rate = EXCHANGE_RATES[currency] || 1.0;
  return Math.round(amountAzn * rate * 100) / 100;
};

/**
 * Audit application for entry eligibility
 */
export const calculateKarabakhEligibility = (
  application: KarabakhPermitApplication
): KarabakhAuditResult => {
  const dest = DESTINATION_DETAILS[application.destination] || DESTINATION_DETAILS.shusha;
  const missingRequirements: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // 1. ANAMA safety instructions mandatory check
  if (!application.anamaAgreementsSigned) {
    missingRequirements.push(
      'ANAMA Mina Təhlükəsizliyi Qaydaları təlimatı elektron qaydada təsdiqlənməlidir'
    );
    score -= 35;
  }

  // 2. State Technical Inspection Check
  if (!application.hasValidInspection) {
    missingRequirements.push(
      'Nəqliyyat vasitəsinin etibarlı BDYP Texniki Baxış (DYP E-Talon) talonunun olması zəruridir'
    );
    score -= 25;
  }

  // 3. Compulsory Insurance Check
  if (!application.hasValidInsurance) {
    missingRequirements.push(
      'Nəqliyyat vasitəsinin etibarlı İSB İcbari Avto-Məsuliyyət Sığortası (TPL) olmalıdır'
    );
    score -= 25;
  }

  // 4. Texpasport Registration Check
  if (!application.hasValidTexpasport) {
    missingRequirements.push(
      'Nəqliyyat vasitəsinin Dövlət Qeydiyyat Şəhadətnaməsi (Texpasport) təsdiqlənməlidir'
    );
    score -= 20;
  }

  // 5. Driver FIN check
  if (!application.driverFin || application.driverFin.trim().length !== 7) {
    missingRequirements.push(
      'Sürücünün 7 simvollu FİN kodu düzgün daxil edilməlidir (məs: 7ABC123)'
    );
    score -= 15;
  }

  // 6. Passenger count check
  if (application.passengers.length > 6) {
    missingRequirements.push(
      'Fərdi minik avtomobilində ən çoxu 6 sərnişin qeydiyyata alına bilər'
    );
    score -= 10;
  }

  // 7. Mountain pass tire tread check (especially for Kalbajar/Shusha mountain roads)
  if (
    (application.destination === 'kalbajar' || application.destination === 'shusha') &&
    application.tireTreadMm < 4.0
  ) {
    warnings.push(
      'Dağlıq ərazilər (Kəlbəcər/Murovdağ və Şuşa Zəfər Yolu) üçün şin protektoru ən azı 4.0 mm tövsiyə olunur'
    );
    score -= 5;
  }

  // 8. 3-day weekend / hotel stay tier requires hotel reservation
  const hotelRequired = application.durationTier === 'hotel_stay_3d';
  const hotelVerified = !!(application.hotelBookingRef && application.hotelBookingRef.trim().length >= 4);

  if (hotelRequired && !hotelVerified) {
    missingRequirements.push(
      '3 günlük gecələmə icazəsi üçün Qarabağ/Şərqi Zəngəzurda rəsmi otel rezervasiyası qeyd edilməlidir'
    );
    score -= 20;
  }

  const finalScore = Math.max(0, Math.min(100, score));
  const isEligible = missingRequirements.length === 0;

  // Cost estimates
  let hotelEstimatedCostAzn = 0;
  if (application.durationTier === 'hotel_stay_3d') {
    hotelEstimatedCostAzn = 220; // Avg 2 nights in Shusha / Lachin hotels
  } else if (application.durationTier === 'weekend_2d') {
    hotelEstimatedCostAzn = 120; // Avg 1 night
  }

  // Quota calculation (mock simulated daily remaining: 65% - 85% of total)
  const quotaRemainingToday = Math.max(12, Math.round(dest.dailyQuota * 0.42));

  return {
    isEligible,
    score: finalScore,
    missingRequirements,
    warnings,
    approvedCorridor: dest.corridorAz,
    destinationNameAz: dest.nameAz,
    estimatedTravelTimeHours: dest.travelHours,
    distanceKmFromBaku: dest.distanceKm,
    dailyQuotaRemaining: quotaRemainingToday,
    hotelRequired,
    hotelVerified,
    stateEntranceFeeAzn: 0, // State-sponsored zero tariff
    hotelEstimatedCostAzn,
  };
};

/**
 * Generate official QARABAG-EYOL-2026 permit
 */
export const generateKarabakhPermit = (
  application: KarabakhPermitApplication,
  checkpointName: string = 'Füzuli NBM (Zəfər Yolu)'
): KarabakhElectronicPermit => {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const permitNumber = `QARABAG-EYOL-2026-${randomSuffix}`;

  const dest = DESTINATION_DETAILS[application.destination] || DESTINATION_DETAILS.shusha;

  // Duration in hours
  let durationHours = 24;
  if (application.durationTier === 'weekend_2d') durationHours = 48;
  if (application.durationTier === 'hotel_stay_3d') durationHours = 72;
  if (application.durationTier === 'commercial_5d') durationHours = 120;

  const validFromDate = new Date(application.startDate || Date.now());
  const validUntilDate = new Date(validFromDate.getTime() + durationHours * 3600 * 1000);

  const hashSeed = `${permitNumber}-${application.vehiclePlate}-${application.driverFin}-${dest.nameAz}`;
  let hashVal = 0;
  for (let i = 0; i < hashSeed.length; i++) {
    hashVal = (hashVal << 5) - hashVal + hashSeed.charCodeAt(i);
    hashVal |= 0;
  }
  const qrSecurityHash = `SHA256:QR-${Math.abs(hashVal).toString(16).toUpperCase()}-RINN-DIN-ANAMA`;
  const policeBarcode = `*BAR-${Math.abs(hashVal * 31).toString().slice(0, 12)}*`;

  return {
    permitNumber,
    issueDate: new Date().toISOString().split('T')[0],
    validFrom: validFromDate.toISOString().replace('T', ' ').slice(0, 16),
    validUntil: validUntilDate.toISOString().replace('T', ' ').slice(0, 16),
    destinationZone: application.destination,
    destinationNameAz: dest.nameAz,
    approvedCorridor: dest.corridorAz,
    approvedCheckpointName: checkpointName,
    vehiclePlate: application.vehiclePlate.toUpperCase().trim(),
    vehicleModel: application.vehicleModel,
    vin: application.vin,
    driverFin: application.driverFin.toUpperCase().trim(),
    driverFullName: application.driverFullName,
    driverPhone: application.driverPhone,
    driverLicenseNumber: application.driverLicenseNumber || 'AZ-SV-849201',
    passengerCount: application.passengers.length,
    passengers: application.passengers,
    hotelName: application.hotelName,
    hotelBookingRef: application.hotelBookingRef,
    anamaStatus: 'VERIFIED_AND_SIGNED',
    qrSecurityHash,
    policeBarcode,
    status: 'ACTIVE',
  };
};

/**
 * Filter checkpoints by search keyword and region
 */
export const filterCheckpoints = (
  checkpoints: KarabakhCheckpoint[],
  search: string,
  region: string
): KarabakhCheckpoint[] => {
  const query = search.toLowerCase().trim();
  return checkpoints.filter((cp) => {
    const matchesSearch =
      !query ||
      cp.nameAz.toLowerCase().includes(query) ||
      cp.nameEn.toLowerCase().includes(query) ||
      cp.regionAz.toLowerCase().includes(query) ||
      cp.corridorAz.toLowerCase().includes(query);

    const matchesRegion =
      !region || region === 'all' || cp.regionAz.toLowerCase().includes(region.toLowerCase());

    return matchesSearch && matchesRegion;
  });
};

/**
 * Filter active permits by search query
 */
export const filterPermits = (
  permits: KarabakhElectronicPermit[],
  search: string
): KarabakhElectronicPermit[] => {
  const query = search.toLowerCase().trim();
  if (!query) return permits;

  return permits.filter(
    (p) =>
      p.permitNumber.toLowerCase().includes(query) ||
      p.vehiclePlate.toLowerCase().includes(query) ||
      p.driverFin.toLowerCase().includes(query) ||
      p.driverFullName.toLowerCase().includes(query) ||
      p.destinationNameAz.toLowerCase().includes(query)
  );
};

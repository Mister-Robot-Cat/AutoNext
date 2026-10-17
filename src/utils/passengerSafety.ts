import { Currency, Vehicle } from '../types/vehicle';

export type VehicleRegulatoryClass =
  | 'M1_PASSENGER' // Minik avtomobili (≤8 oturacaq yeri)
  | 'M2_MINIBUS' // Mikroavtobus (9–16 oturacaq yeri, ≤5t)
  | 'M3_BUS' // Avtobus (>16 oturacaq yeri, >5t)
  | 'N1_LIGHT_TRUCK' // Yüngül yük avtomobili (≤3.5t)
  | 'N2_N3_HEAVY_TRUCK'; // Ağır yük avtomobili (>3.5t)

export type ExtinguisherType =
  | 'NONE' // Yanğınsöndürən yoxdur
  | 'AEROSOL_SPRAY_400ML' // 400–500 ml aerozol balon (AZS standartına uyğun deyil, <1 kq)
  | 'OP1_POWDER_1KG' // OP-1 (1 kq quru tozlu — M1 üçün minimum norma)
  | 'OP2_POWDER_2KG' // OP-2 (2 kq quru tozlu — M1/N1 üçün tövsiyə olunan FHN standartı)
  | 'OU2_CO2_2KG' // OU-2 (2 kq karbon-dioksid — Elektromobil və Hibridlər üçün ideal)
  | 'OP5_HEAVY_5KG'; // OP-5 (5 kq quru tozlu — Avtobus və ağır yük maşınları üçün)

export type ExtinguisherGaugeState =
  | 'GREEN_NOMINAL' // Yaşıl zona (1.2 – 1.6 MPa işçi təzyiq, plombu üstündə)
  | 'RED_LOW_PRESSURE' // Qırmızı zona (<1.0 MPa təzyiq düşüb)
  | 'EXPIRED_SEAL_BROKEN'; // İstismar müddəti bitib və ya plombu qırılıb

export type ChildSeatGroup =
  | 'GROUP_0_PLUS' // Qrup 0/0+ (0–13 kq, 0–15 ay, arxaya baxan / rear-facing beşik)
  | 'GROUP_1' // Qrup 1 (9–18 kq, 9 ay – 4 yaş, İSOFIX baza və 5-nöqtəli kəmər)
  | 'GROUP_2_3' // Qrup 2/3 (15–36 kq, 4–12 yaş, hündürlüyü tənzimlənən avtokreslo / buster)
  | 'STANDARD_SEATBELT_150CM'; // ≥12 yaş və ya ≥150 sm boy — standart təhlükəsizlik kəməri

export type ChildSeatingPosition =
  | 'FRONT_PASSENGER' // Ön sağ sərnişin oturacağı (YHQ Maddə 37.1.3 xüsusi nəzarət)
  | 'REAR_ISOFIX_OUTER' // Arxa yan İSOFIX oturacaq (ən təhlükəsiz zona)
  | 'REAR_CENTER'; // Arxa mərkəzi oturacaq

export type EmergencyRoadZone =
  | 'POPULATED_CITY' // Yaşayış məntəqələrində (YHQ Maddə 43: minimum 15 metr)
  | 'HIGHWAY_OUTSIDE'; // Yaşayış məntəqələrindən kənarda / Magistralda (YHQ Maddə 43: minimum 30 metr)

export interface SafetyKitAuditInput {
  vehicleClass: VehicleRegulatoryClass;
  extinguisherType: ExtinguisherType;
  extinguisherCount: number;
  extinguisherGauge: ExtinguisherGaugeState;
  hasFirstAidKit: boolean;
  isFirstAidKitUnexpiredAndComplete: boolean;
  hasWarningTriangleEceR27: boolean;
  warningTrianglePlacedDistanceMeters: number;
  roadZone: EmergencyRoadZone;
  hasReflectiveSafetyVest: boolean;
  hasWheelChocks: boolean;
}

export interface SafetyKitAuditResult {
  requiredExtinguisherCount: number;
  requiredMinExtinguisherKg: number;
  requiredTriangleDistanceMeters: number;
  isExtinguisherCompliant: boolean;
  isFirstAidCompliant: boolean;
  isWarningTriangleCompliant: boolean;
  isTriangleDistanceCompliant: boolean;
  isWheelChockCompliant: boolean;
  isFullyCompliant: boolean;
  fineAmountAzn: number;
  violationArticles: string[];
  verdictLevel: 'COMPLIANT' | 'MINOR_WARNING' | 'ADMINISTRATIVE_FINE';
  verdictTitle: string;
  statutoryExplanation: string;
  recommendations: string[];
}

export interface ChildAndPassengerAuditInput {
  hasChildPassenger: boolean;
  childAgeYears: number;
  childWeightKg: number;
  childHeightCm: number;
  seatingPosition: ChildSeatingPosition;
  hasCertifiedChildSeatCrs: boolean;
  isRearFacingSeat: boolean;
  isFrontPassengerAirbagActive: boolean;
  vehicleHasIsofixAnchors: boolean;
  registeredSeatCapacity: number;
  actualPassengersCount: number;
  allAdultsFastenedSeatbelts: boolean;
}

export interface ChildAndPassengerAuditResult {
  recommendedCrsGroup: ChildSeatGroup;
  recommendedCrsLabel: string;
  isChildUnder12: boolean;
  isFrontSeatChildLegal: boolean;
  isRearChildRestraintLegal: boolean;
  isAirbagCriticalHazard: boolean;
  isPassengerCountLegal: boolean;
  isSeatbeltCompliant: boolean;
  isFullyCompliant: boolean;
  totalFineAzn: number;
  penaltyPoints: number;
  violationArticles: string[];
  safetyWarnings: string[];
}

export interface CargoAndTowingAuditInput {
  rearCargoOverhangMeters: number;
  lateralCargoOverhangMeters: number;
  hasOversizeWarningFlag: boolean;
  isTowingAnotherVehicle: boolean;
  towCableLengthMeters: number;
  hasTowCableWarningFlags: boolean;
  towedVehicleHasWorkingBrakesAndSteering: boolean;
  isIcyRoadConditions: boolean;
}

export interface CargoAndTowingAuditResult {
  isCargoOverhangLegal: boolean;
  requiresOversizeFlag: boolean;
  requiresBdypSpecialPermit: boolean;
  isTowCableLengthLegal: boolean;
  isTowingOperationLegal: boolean;
  isFullyCompliant: boolean;
  fineAmountAzn: number;
  penaltyPoints: number;
  violationArticles: string[];
  recommendations: string[];
}

export interface SafetySupplyCenter {
  id: string;
  name: string;
  city: string;
  address: string;
  fhnLicenseCode: string;
  hasExtinguisherRechargeStation: boolean;
  hasIsofixTestBench: boolean;
  op2ExtinguisherPriceAzn: number;
  ou2Co2ExtinguisherPriceAzn: number;
  extinguisherRechargeFeeAzn: number;
  ministryFirstAidKitPriceAzn: number;
  eceWarningTrianglePriceAzn: number;
  reflectiveVestAndTowRopePriceAzn: number;
  isofixChildSeatPriceAzn: number;
  rating: number;
  phone: string;
}

export interface SafetyBundleEstimateInput {
  center: SafetySupplyCenter;
  includeOp2Extinguisher: boolean;
  includeOu2Co2Extinguisher: boolean;
  includeExtinguisherRecharge: boolean;
  includeFirstAidKit: boolean;
  includeWarningTriangle: boolean;
  includeVestAndTowRope: boolean;
  includeIsofixChildSeat: boolean;
}

export interface SafetyBundleEstimateResult {
  extinguisherCostAzn: number;
  rechargeCostAzn: number;
  firstAidCostAzn: number;
  triangleCostAzn: number;
  vestAndRopeCostAzn: number;
  childSeatCostAzn: number;
  totalCostAzn: number;
  finesPreventedAzn: number;
  passesDypInspection: boolean;
}

export interface PassengerSafetyCertificate {
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  plateNumber: string;
  vin: string;
  vehicleTitle: string;
  vehicleClass: VehicleRegulatoryClass;
  extinguisherSpec: string;
  firstAidStatus: string;
  crsIsofixStatus: string;
  inspectionCenterName: string;
  complianceVerdict: 'TAM UYĞUN (DYP & FHN STANDARTI)' | 'ŞƏRTİ TƏCHİZAT (TƏKMİLLƏŞDİRİLMİŞ)';
  qrVerificationHash: string;
}

const CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1,
  USD: 1 / 1.7,
  EUR: 1 / 1.85,
};

export function formatSafetyCurrency(amountAzn: number, currency: Currency): string {
  const converted = Math.round(amountAzn * CURRENCY_RATES[currency]);
  if (currency === 'USD') return `$${converted.toLocaleString('en-US')}`;
  if (currency === 'EUR') return `€${converted.toLocaleString('en-US')}`;
  return `${converted.toLocaleString('en-US')} ₼`;
}

/**
 * Audits mandatory on-board vehicle emergency kit under YHQ Annex 1 Section VII (Clause 7.7),
 * YHQ Article 43 (Emergency stopping sign distances), and İXM Article 342.1.7 (50 AZN fine).
 */
export function auditEmergencySafetyKit(input: SafetyKitAuditInput): SafetyKitAuditResult {
  const isHeavyOrBus =
    input.vehicleClass === 'M2_MINIBUS' ||
    input.vehicleClass === 'M3_BUS' ||
    input.vehicleClass === 'N2_N3_HEAVY_TRUCK';

  const requiredExtinguisherCount = isHeavyOrBus ? 2 : 1;
  const requiredMinExtinguisherKg =
    input.vehicleClass === 'M3_BUS' || input.vehicleClass === 'N2_N3_HEAVY_TRUCK' ? 5 : 1;

  const requiredTriangleDistanceMeters = input.roadZone === 'POPULATED_CITY' ? 15 : 30;

  const extinguisherKgMap: Record<ExtinguisherType, number> = {
    NONE: 0,
    AEROSOL_SPRAY_400ML: 0.4,
    OP1_POWDER_1KG: 1,
    OP2_POWDER_2KG: 2,
    OU2_CO2_2KG: 2,
    OP5_HEAVY_5KG: 5,
  };

  const unitKg = extinguisherKgMap[input.extinguisherType];
  const isExtinguisherCompliant =
    unitKg >= requiredMinExtinguisherKg &&
    input.extinguisherCount >= requiredExtinguisherCount &&
    input.extinguisherGauge === 'GREEN_NOMINAL';

  const isFirstAidCompliant = input.hasFirstAidKit && input.isFirstAidKitUnexpiredAndComplete;
  const isWarningTriangleCompliant = input.hasWarningTriangleEceR27;
  const isTriangleDistanceCompliant =
    input.warningTrianglePlacedDistanceMeters >= requiredTriangleDistanceMeters;
  const isWheelChockCompliant = isHeavyOrBus ? input.hasWheelChocks : true;

  const violationArticles: string[] = [];
  const recommendations: string[] = [];
  let fineAmountAzn = 0;

  if (!isExtinguisherCompliant) {
    fineAmountAzn = Math.max(fineAmountAzn, 50);
    violationArticles.push(
      'YHQ Əlavə 1 Bölmə VII bənd 7.7 & İXM Maddə 342.1.7 (Nəqliyyat vasitəsində standartlara uyğun və işlək yanğınsöndürənin olmaması — 50 ₼)'
    );
    if (input.extinguisherType === 'NONE' || input.extinguisherType === 'AEROSOL_SPRAY_400ML') {
      recommendations.push(
        `Avtomobili FHN sertifikatlı minimum ${requiredMinExtinguisherKg} kq həcmli (${
          isHeavyOrBus ? 'OP-5 / 2 ədəd' : 'OP-2 quru tozlu və ya OU-2 karbon-dioksid'
        }) yanğınsöndürən balonla təchiz edin. Kiçik aerozol spreylər DYP texniki baxışında qəbul edilmir.`
      );
    } else if (input.extinguisherGauge !== 'GREEN_NOMINAL') {
      recommendations.push(
        'Yanğınsöndürən balonun manometr təzyiqi normadan aşağıdır və ya müddəti bitib — FHN lisenziyalı məntəqədə yenidən doldurulmalı və plomblanmalıdır.'
      );
    } else if (input.extinguisherCount < requiredExtinguisherCount) {
      recommendations.push(
        `Avtobus və ağır yük nəqliyyat vasitələrində (${input.vehicleClass}) minimum 2 ədəd yanğınsöndürən (biri sürücü kabinəsində, digəri салонда/kuzovda) olmalıdır.`
      );
    }
  }

  if (!isFirstAidCompliant) {
    fineAmountAzn = Math.max(fineAmountAzn, 50);
    if (!violationArticles.some((v) => v.includes('342.1.7'))) {
      violationArticles.push(
        'YHQ Əlavə 1 Bölmə VII bənd 7.7 & İXM Maddə 342.1.7 (AR Səhiyyə Nazirliyi tələblərinə uyğun tibbi yardım çantasının olmaması — 50 ₼)'
      );
    }
    recommendations.push(
      'Tibbi yardım çantasını (steril bintlər, qankəsici jqut, antiseptik məhlul, tibbi əlcək, küt uclu qayçı) yeniləyin və istifadə müddəti bitmiş dərmanları çıxarın.'
    );
  }

  if (!isWarningTriangleCompliant) {
    fineAmountAzn = Math.max(fineAmountAzn, 50);
    if (!violationArticles.some((v) => v.includes('342.1.7'))) {
      violationArticles.push(
        'YHQ Əlavə 1 Bölmə VII bənd 7.7 & İXM Maddə 342.1.7 (Qəza dayanma nişanının / yanıb-sönən qırmızı fənərin olmaması — 50 ₼)'
      );
    }
    recommendations.push(
      'Baqajda ECE R27 standartlı işıqqaytarıcı qəza dayanma üçbucağı (və ya yanıb-sönən qırmızı fənər) mütləq saxlanılmalıdır.'
    );
  }

  if (!isWheelChockCompliant) {
    fineAmountAzn = Math.max(fineAmountAzn, 50);
    violationArticles.push(
      'YHQ Əlavə 1 Bölmə VII bənd 7.7 & İXM Maddə 342.1.7 (Avtobus və ağır yük maşınlarında diyirlənməyə qarşı ən azı 2 ədəd təkər dayağının olmaması — 50 ₼)'
    );
    recommendations.push(
      'Nəqliyyat vasitəsinin öz-özünə hərəkətinin qarşısını almaq üçün 2 ədəd standart təkər dayağı (başmaq / tıxac) əlavə edin.'
    );
  }

  if (!isTriangleDistanceCompliant) {
    fineAmountAzn = Math.max(fineAmountAzn, 40);
    violationArticles.push(
      `YHQ Maddə 43 & İXM Maddə 327.1 (Məcburi dayanma zamanı qəza dayanma nişanının ${
        input.roadZone === 'POPULATED_CITY'
          ? 'yaşayış məntəqəsində minimum 15 metr'
          : 'yaşayış məntəqəsindən kənarda minimum 30 metr'
      } məsafədə quraşdırılmaması — 40 ₼)`
    );
    recommendations.push(
      `Qəza və ya nasazlıq zamanı qəza dayanma nişanını avtomobildən ən azı ${requiredTriangleDistanceMeters} metr arxada, intensiv hərəkət zolağında quraşdırın.`
    );
  }

  if (!input.hasReflectiveSafetyVest) {
    recommendations.push(
      'Sutkanın qaranlıq vaxtı və ya məhdud görünmə şəraitində yolda təmir/dayanma zamanı EN ISO 20471 işıqqaytarıcı sarı/narıncı jilet geyinmək tövsiyə olunur.'
    );
  }

  const isFullyCompliant =
    isExtinguisherCompliant &&
    isFirstAidCompliant &&
    isWarningTriangleCompliant &&
    isTriangleDistanceCompliant &&
    isWheelChockCompliant;

  let verdictLevel: SafetyKitAuditResult['verdictLevel'] = 'COMPLIANT';
  let verdictTitle = 'Tam Qanuni Təchizat — YHQ Əlavə 1 və DYP Texniki Baxışına Uyğundur';

  if (!isFullyCompliant) {
    verdictLevel = 'ADMINISTRATIVE_FINE';
    verdictTitle = `İnzibati Xəta Riski (${fineAmountAzn} ₼) — Təhlükəsizlik Təchizatı Natamamdır`;
  } else if (!input.hasReflectiveSafetyVest) {
    verdictLevel = 'MINOR_WARNING';
    verdictTitle = 'Qanuni Minimum Ödənilir — İşıqqaytarıcı Jilet Əlavə Edilməsi Tövsiyə Olunur';
  }

  const statutoryExplanation = isFullyCompliant
    ? `Nəqliyyat vasitəsi "Yol hərəkəti haqqında" Qanunun 1 saylı Əlavəsinin VII bölməsinin tələblərinə (işlək yanğınsöndürən, tam komplektli tibbi çanta, ECE R27 qəza üçbucağı və ${requiredTriangleDistanceMeters} m məsafə norması) tam cavab verir.`
    : `YHQ Əlavə 1 Bölmə VII və İXM Maddə 342.1.7-yə əsasən tibbi yardım çantası, yanğınsöndürən və qəza dayanma nişanı ilə təchiz edilməyən nəqliyyat vasitəsinin idarə edilməsinə görə 50 AZN cərimə tətbiq edilir və DYP texniki baxışından keçid dayandırılır.`;

  return {
    requiredExtinguisherCount,
    requiredMinExtinguisherKg,
    requiredTriangleDistanceMeters,
    isExtinguisherCompliant,
    isFirstAidCompliant,
    isWarningTriangleCompliant,
    isTriangleDistanceCompliant,
    isWheelChockCompliant,
    isFullyCompliant,
    fineAmountAzn,
    violationArticles,
    verdictLevel,
    verdictTitle,
    statutoryExplanation,
    recommendations,
  };
}

/**
 * Audits child restraint system (CRS / ISOFIX), front passenger seat age limit (<12 years),
 * passenger capacity overload, and seatbelt compliance under YHQ Article 37 and İXM Articles 327.2 & 329.1.
 */
export function auditChildAndPassengerCompliance(
  input: ChildAndPassengerAuditInput
): ChildAndPassengerAuditResult {
  // Determine ECE R44/04 & R129 (i-Size) CRS Group
  let recommendedCrsGroup: ChildSeatGroup = 'STANDARD_SEATBELT_150CM';
  let recommendedCrsLabel = 'Standart 3-nöqtəli təhlükəsizlik kəməri (≥12 yaş və ya ≥150 sm)';

  if (input.hasChildPassenger) {
    if (input.childAgeYears < 1 || input.childWeightKg < 10 || input.childHeightCm < 75) {
      recommendedCrsGroup = 'GROUP_0_PLUS';
      recommendedCrsLabel =
        'Qrup 0/0+ (0–13 kq / <75 sm) — Hərəkət istiqamətinin əksinə (Rear-Facing) uşaq beşiyi';
    } else if (input.childAgeYears < 4 || input.childWeightKg <= 18 || input.childHeightCm < 105) {
      recommendedCrsGroup = 'GROUP_1';
      recommendedCrsLabel =
        'Qrup 1 (9–18 kq / 75–105 sm) — İSOFIX + Top-Tether bazalı 5-nöqtəli uşaq avtokreslosu';
    } else if (input.childAgeYears < 12 && input.childHeightCm < 150) {
      recommendedCrsGroup = 'GROUP_2_3';
      recommendedCrsLabel =
        'Qrup 2/3 (15–36 kq / 100–150 sm) — Hündürlüyü tənzimlənən arxalıqlı avtokreslo və ya buster';
    }
  }

  const isChildUnder12 = input.hasChildPassenger && input.childAgeYears < 12;

  // YHQ Article 37.1.3: Prohibited to carry children under 12 in the front seat without a special child restraint device
  const isFrontSeatChildLegal =
    !isChildUnder12 ||
    input.seatingPosition !== 'FRONT_PASSENGER' ||
    input.hasCertifiedChildSeatCrs;

  // Rear seat child <12 with height <135-150cm also requires child restraint or booster under YHQ 37.4
  const isRearChildRestraintLegal =
    !isChildUnder12 ||
    input.seatingPosition === 'FRONT_PASSENGER' ||
    input.hasCertifiedChildSeatCrs ||
    input.childHeightCm >= 150;

  // Critical airbag hazard: Rear-facing CRS in front passenger seat with active frontal airbag!
  const isAirbagCriticalHazard =
    input.hasChildPassenger &&
    input.seatingPosition === 'FRONT_PASSENGER' &&
    input.isRearFacingSeat &&
    input.isFrontPassengerAirbagActive;

  // Passenger capacity vs Texpasport seats
  const isPassengerCountLegal = input.actualPassengersCount <= input.registeredSeatCapacity;
  const isSeatbeltCompliant = input.allAdultsFastenedSeatbelts;

  const violationArticles: string[] = [];
  const safetyWarnings: string[] = [];
  let totalFineAzn = 0;
  let penaltyPoints = 0;

  if (!isFrontSeatChildLegal) {
    totalFineAzn += 60;
    penaltyPoints = Math.max(penaltyPoints, 3);
    violationArticles.push(
      'YHQ Maddə 37.1.3 & İXM Maddə 327.2 (12 yaşına çatmamış uşaqların ön oturacaqda xüsusi uşaq saxlayıcı qurğu / avtokreslo olmadan daşınması — 60 ₼ + 3 cərimə balı)'
    );
    safetyWarnings.push(
      '12 yaşdan kiçik uşağı ön sərnişin oturacağında avtokreslosuz əyləşdirmək qəti qadağandır! Uşağı arxa İSOFIX oturacağa keçirin və ya boy/çəkiyə uyğun sertifikatlı avtokreslo quraşdırın.'
    );
  }

  if (!isRearChildRestraintLegal) {
    if (!violationArticles.some((v) => v.includes('327.2'))) {
      totalFineAzn += 60;
      penaltyPoints = Math.max(penaltyPoints, 3);
    }
    violationArticles.push(
      'YHQ Maddə 37.4 & İXM Maddə 327.2 (Uşaqların çəkisinə və boyuna uyğun xüsusi saxlayıcı sistemlərdən istifadə edilməməsi — 60 ₼ + 3 cərimə balı)'
    );
    safetyWarnings.push(
      'Standart böyük təhlükəsizlik kəməri 150 sm-dən qısa uşaqların boyun nahiyəsindən keçərək qəza zamanı ağır xəsarət yaradır. Qrup 1/2/3 avtokreslo və ya buster istifadə edin.'
    );
  }

  if (isAirbagCriticalHazard) {
    if (!violationArticles.some((v) => v.includes('327.2'))) {
      totalFineAzn += 60;
      penaltyPoints = Math.max(penaltyPoints, 3);
    }
    violationArticles.push(
      'YHQ Maddə 37 & UNECE R129 (Aktiv ön təhlükəsizlik yastığı / Airbag qarşısında arxaya baxan uşaq beşiyinin quraşdırılması — Həyat üçün kritik təhlükə!)'
    );
    safetyWarnings.push(
      'KRİTİK TƏHLÜKƏ: Ön sərnişin Airbag-i aktiv olarkən arxaya baxan (Rear-Facing) uşaq beşiyi quraşdırmaq qəza anında ölümcül zərbə vurur! Ön Airbag açarını "OFF" vəziyyətinə keçirin və ya beşiyi arxa oturacağa bağlayın.'
    );
  }

  if (!isPassengerCountLegal) {
    if (!violationArticles.some((v) => v.includes('327.2'))) {
      totalFineAzn += 60;
      penaltyPoints = Math.max(penaltyPoints, 3);
    }
    violationArticles.push(
      `YHQ Maddə 56 & İXM Maddə 327.2 (Texpasportda nəzərdə tutulmuş ${input.registeredSeatCapacity} oturacaq sayından artıq — ${input.actualPassengersCount} nəfər daşınması — 60 ₼ + 3 cərimə balı)`
    );
    safetyWarnings.push(
      `Avtomobilin konstruksiyasında nəzərdə tutulmuş oturacaq sayından (${input.registeredSeatCapacity} yer) artıq sərnişin daşımaq həm qanun pozuntusudur, həm də əyləc məsafəsini uzadır.`
    );
  }

  if (!isSeatbeltCompliant) {
    totalFineAzn += 40;
    violationArticles.push(
      'YHQ Maddə 37.1.3 & İXM Maddə 329.1 (Təhlükəsizlik kəmərini bağlamadan nəqliyyat vasitəsini idarə etmə və ya sərnişin daşıma — MMX AI kameraları ilə 40 ₼)'
    );
    safetyWarnings.push(
      'Bakı və magistrallardakı yeni nəsil MMX süni intellekt kameraları sükan arxasında və ön oturacaqda təhlükəsizlik kəmərinin bağlanmamasını avtomatik qeydə alır (40 AZN).'
    );
  }

  const isFullyCompliant =
    isFrontSeatChildLegal &&
    isRearChildRestraintLegal &&
    !isAirbagCriticalHazard &&
    isPassengerCountLegal &&
    isSeatbeltCompliant;

  return {
    recommendedCrsGroup,
    recommendedCrsLabel,
    isChildUnder12,
    isFrontSeatChildLegal,
    isRearChildRestraintLegal,
    isAirbagCriticalHazard,
    isPassengerCountLegal,
    isSeatbeltCompliant,
    isFullyCompliant,
    totalFineAzn,
    penaltyPoints,
    violationArticles,
    safetyWarnings,
  };
}

/**
 * Audits cargo overhang rules (YHQ Article 57) and flexible/rigid vehicle towing rules (YHQ Article 56).
 */
export function auditCargoAndTowingRules(
  input: CargoAndTowingAuditInput
): CargoAndTowingAuditResult {
  const violationArticles: string[] = [];
  const recommendations: string[] = [];
  let fineAmountAzn = 0;
  let penaltyPoints = 0;

  // YHQ Article 57: Cargo protruding >1.0m front/rear or >0.4m laterally from outer light edge must be marked with "İriqabaritli yük" (400x400mm diagonal red/white stripes)
  // Protruding >2.0m rear requires BDYP special permit!
  const requiresOversizeFlag =
    input.rearCargoOverhangMeters > 1.0 || input.lateralCargoOverhangMeters > 0.4;
  const requiresBdypSpecialPermit = input.rearCargoOverhangMeters > 2.0;

  const isCargoOverhangLegal =
    !requiresBdypSpecialPermit && (!requiresOversizeFlag || input.hasOversizeWarningFlag);

  if (requiresBdypSpecialPermit) {
    fineAmountAzn = Math.max(fineAmountAzn, 60);
    penaltyPoints = Math.max(penaltyPoints, 3);
    violationArticles.push(
      `YHQ Maddə 57 & İXM Maddə 327.2 (Yükün arxadan 2.0 metrdən artıq — ${input.rearCargoOverhangMeters.toFixed(
        1
      )} m kənara çıxması BDYP xüsusi icazəsi olmadan qadağandır — 60 ₼ + 3 bal)`
    );
    recommendations.push(
      'Arxadan 2.0 metrdən çox çıxan yüklər üçün yük maşını sifariş edin və ya BDYP-dən iriqabaritli yük marşrut icazəsi alın.'
    );
  } else if (requiresOversizeFlag && !input.hasOversizeWarningFlag) {
    fineAmountAzn = Math.max(fineAmountAzn, 60);
    penaltyPoints = Math.max(penaltyPoints, 3);
    violationArticles.push(
      'YHQ Maddə 57.4 & İXM Maddə 327.2 (Qabaritdən arxaya 1.0–2.0 m və ya yandan >0.4 m çıxan yükün 400x400 mm "İriqabaritli yük" nişanı ilə işarələnməməsi — 60 ₼ + 3 bal)'
    );
    recommendations.push(
      'Yükün çıxan hissəsinə 400x400 mm ölçüdə qırmızı-ağ diaqonal zolaqlı "İriqabaritli yük" lövhəsi (gecə vaxtı qırmızı fənər/işıqqaytarıcı) bərkidin.'
    );
  }

  // YHQ Article 56: Towing rules (Yedəyə alma qaydaları)
  // Flexible tow cable length must be between 4.0m and 6.0m with warning flags
  let isTowCableLengthLegal = true;
  let isTowingOperationLegal = true;

  if (input.isTowingAnotherVehicle) {
    isTowCableLengthLegal =
      input.towCableLengthMeters >= 4.0 && input.towCableLengthMeters <= 6.0;

    if (!isTowCableLengthLegal) {
      isTowingOperationLegal = false;
      fineAmountAzn = Math.max(fineAmountAzn, 40);
      violationArticles.push(
        `YHQ Maddə 56.3 & İXM Maddə 327.1 (Elastik yedək троsunun uzunluğu 4–6 metr əvəzinə ${input.towCableLengthMeters.toFixed(
          1
        )} m olması — 40 ₼)`
      );
      recommendations.push(
        'YHQ Maddə 56-ya əsasən elastik yedək trosunun uzunluğu dəqiq 4.0 – 6.0 metr arasında olmalıdır.'
      );
    }

    if (!input.hasTowCableWarningFlags) {
      isTowingOperationLegal = false;
      fineAmountAzn = Math.max(fineAmountAzn, 40);
      violationArticles.push(
        'YHQ Maddə 56.3 & Əlavə 1 (Elastik yedək trosunun üzərində 200x200 mm qırmızı-ağ xəbərdarlıq bayraqcıqlarının olmaması — 40 ₼)'
      );
      recommendations.push(
        'Digər sürücülərin yedək trosunu görməsi üçün tros üzərinə 200x200 mm ölçülü qırmızı-ağ diaqonal zolaqlı bayraqcıqlar taxın.'
      );
    }

    if (!input.towedVehicleHasWorkingBrakesAndSteering) {
      isTowingOperationLegal = false;
      fineAmountAzn = Math.max(fineAmountAzn, 60);
      violationArticles.push(
        'YHQ Maddə 56.6 (Sükan və ya əyləc sistemi nasaz olan avtomobilin elastik trosla yedəyə alınması qəti qadağandır — yalnız evakuator və ya sərt yedək!)'
      );
      recommendations.push(
        'Sükan və ya əyləci işləməyən avtomobili elastik trosla yedəyə almaq qəzaya səbəb olur — 156 Evakuator xidmətindən istifadə edin.'
      );
    }

    if (input.isIcyRoadConditions) {
      isTowingOperationLegal = false;
      fineAmountAzn = Math.max(fineAmountAzn, 60);
      violationArticles.push(
        'YHQ Maddə 56.6.1 (Buzlu yol / gizli buzlaşma şəraitində elastik yedək trosundan istifadə qəti qadağandır!)'
      );
      recommendations.push(
        'Buzlu yolda elastik trosla yedəyə alınan maşın əyləc zamanı öndəki avtomobilə çırpılır — yalnız sərt yedək (dəmir ştanqa) və ya evakuator icazəlidir.'
      );
    }
  }

  const isFullyCompliant = isCargoOverhangLegal && isTowingOperationLegal;

  return {
    isCargoOverhangLegal,
    requiresOversizeFlag,
    requiresBdypSpecialPermit,
    isTowCableLengthLegal,
    isTowingOperationLegal,
    isFullyCompliant,
    fineAmountAzn,
    penaltyPoints,
    violationArticles,
    recommendations,
  };
}

/**
 * Calculates total cost for purchasing or recharging FHN/DYP compliant safety equipment and CRS seats.
 */
export function calculateSafetySupplyBundle(
  input: SafetyBundleEstimateInput
): SafetyBundleEstimateResult {
  const extinguisherCostAzn =
    (input.includeOp2Extinguisher ? input.center.op2ExtinguisherPriceAzn : 0) +
    (input.includeOu2Co2Extinguisher ? input.center.ou2Co2ExtinguisherPriceAzn : 0);

  const rechargeCostAzn = input.includeExtinguisherRecharge
    ? input.center.extinguisherRechargeFeeAzn
    : 0;
  const firstAidCostAzn = input.includeFirstAidKit
    ? input.center.ministryFirstAidKitPriceAzn
    : 0;
  const triangleCostAzn = input.includeWarningTriangle
    ? input.center.eceWarningTrianglePriceAzn
    : 0;
  const vestAndRopeCostAzn = input.includeVestAndTowRope
    ? input.center.reflectiveVestAndTowRopePriceAzn
    : 0;
  const childSeatCostAzn = input.includeIsofixChildSeat
    ? input.center.isofixChildSeatPriceAzn
    : 0;

  const totalCostAzn =
    extinguisherCostAzn +
    rechargeCostAzn +
    firstAidCostAzn +
    triangleCostAzn +
    vestAndRopeCostAzn +
    childSeatCostAzn;

  let finesPreventedAzn = 0;
  if (
    input.includeOp2Extinguisher ||
    input.includeOu2Co2Extinguisher ||
    input.includeExtinguisherRecharge ||
    input.includeFirstAidKit ||
    input.includeWarningTriangle
  ) {
    finesPreventedAzn += 50; // İXM 342.1.7
  }
  if (input.includeVestAndTowRope) {
    finesPreventedAzn += 40; // İXM 327.1
  }
  if (input.includeIsofixChildSeat) {
    finesPreventedAzn += 60; // İXM 327.2
  }

  const passesDypInspection =
    (input.includeOp2Extinguisher ||
      input.includeOu2Co2Extinguisher ||
      input.includeExtinguisherRecharge) &&
    input.includeFirstAidKit &&
    input.includeWarningTriangle;

  return {
    extinguisherCostAzn,
    rechargeCostAzn,
    firstAidCostAzn,
    triangleCostAzn,
    vestAndRopeCostAzn,
    childSeatCostAzn,
    totalCostAzn,
    finesPreventedAzn,
    passesDypInspection,
  };
}

/**
 * Derives default safety profile from a vehicle listing.
 */
export function getVehicleDefaultSafetyProfile(vehicle?: Vehicle | null): {
  vehicleClass: VehicleRegulatoryClass;
  extinguisherType: ExtinguisherType;
  registeredSeatCapacity: number;
  vehicleHasIsofixAnchors: boolean;
} {
  if (!vehicle) {
    return {
      vehicleClass: 'M1_PASSENGER',
      extinguisherType: 'OP2_POWDER_2KG',
      registeredSeatCapacity: 5,
      vehicleHasIsofixAnchors: true,
    };
  }

  const isEvOrHybrid = vehicle.fuelType === 'electric' || vehicle.fuelType === 'hybrid';
  const isLargeSuv =
    vehicle.bodyType === 'suv' &&
    (vehicle.model.toLowerCase().includes('land cruiser') ||
      vehicle.model.toLowerCase().includes('gls') ||
      vehicle.model.toLowerCase().includes('x7') ||
      vehicle.model.toLowerCase().includes('highlander'));

  return {
    vehicleClass: 'M1_PASSENGER',
    extinguisherType: isEvOrHybrid ? 'OU2_CO2_2KG' : 'OP2_POWDER_2KG',
    registeredSeatCapacity: isLargeSuv ? 7 : 5,
    vehicleHasIsofixAnchors: vehicle.year >= 2012,
  };
}

/**
 * Generates an official BDYP & FHN Electronic Safety Equipment & Passenger Compliance Certificate.
 */
export function generatePassengerSafetyCertificate(params: {
  plateNumber: string;
  vin: string;
  vehicleTitle: string;
  vehicleClass: VehicleRegulatoryClass;
  extinguisherSpec: string;
  firstAidStatus: string;
  crsIsofixStatus: string;
  inspectionCenterName: string;
  isFullyCompliant: boolean;
}): PassengerSafetyCertificate {
  const cleanPlate = params.plateNumber.trim().toUpperCase() || '99-AZ-700';
  const cleanVin = params.vin.trim().toUpperCase() || 'WBA5A5C50FD918273';
  const suffix = cleanVin.slice(-5).replace(/[^A-Z0-9]/g, '8') || '74920';

  return {
    certificateNumber: `BDYP-TEH-2026-${suffix}`,
    issueDate: '2026-10-17',
    expiryDate: '2027-10-17',
    plateNumber: cleanPlate,
    vin: cleanVin,
    vehicleTitle: params.vehicleTitle || ' Nəqliyyat Vasitəsi',
    vehicleClass: params.vehicleClass,
    extinguisherSpec: params.extinguisherSpec,
    firstAidStatus: params.firstAidStatus,
    crsIsofixStatus: params.crsIsofixStatus,
    inspectionCenterName: params.inspectionCenterName,
    complianceVerdict: params.isFullyCompliant
      ? 'TAM UYĞUN (DYP & FHN STANDARTI)'
      : 'ŞƏRTİ TƏCHİZAT (TƏKMİLLƏŞDİRİLMİŞ)',
    qrVerificationHash: `AZS-FHN-DYP-${cleanPlate.replace(/[^A-Z0-9]/g, '')}-${suffix}`,
  };
}

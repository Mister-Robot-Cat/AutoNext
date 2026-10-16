import { Currency } from '../types/vehicle';
import {
  ModificationCategory,
  TuningModificationItem,
  TelemetryAuditInput,
  TuningComplianceAuditResult,
  AutogasSimulationConfig,
  AutogasPaybackResult,
  ConstructiveSafetyCertificate,
  LabBookingConfirmation
} from '../types/tuning';
import {
  TUNING_MODIFICATIONS,
  ACCREDITED_TUNING_LABS,
  SAMPLE_TUNING_CERTIFICATES
} from '../data/mockTuningData';

export const STATUTORY_ACOUSTIC_LIMIT_DBA = 84;
export const STATUTORY_SPORT_MUFFLER_THRESHOLD_DBA = 77;
export const STATUTORY_MAX_CERTIFIABLE_LIFT_MM = 50;
export const STATUTORY_MAX_WHEEL_SPACER_MM = 20;

export const BDYP_TUNING_STATE_DUTIES = {
  texpasportReplacementFeeAzn: 30,
  technicalInspectionFeeAzn: 20,
  asanServiceCommissionAzn: 2
};

export const PETROL_TARIFFS_AZN: Record<'ai92' | 'ai95' | 'ai98', number> = {
  ai92: 1.10,
  ai95: 1.60,
  ai98: 2.30
};

export const AUTOGAS_SYSTEM_SPECS: Record<
  AutogasSimulationConfig['systemType'],
  {
    name: { az: string; en: string; ru: string };
    fuelPricePerUnitAzn: number;
    consumptionMultiplier: number;
    equipmentCostAzn: number;
    labFeeAzn: number;
    co2ReductionPercent: number;
    tankInspectionIntervalYears: number;
  }
> = {
  lpg_euro4: {
    name: {
      az: 'LPG Propan-Butan (Avro-4 İtaliya BRC/Lovato)',
      en: 'LPG Propane-Butane (Euro-4 Italian BRC/Lovato)',
      ru: 'ГБО LPG Пропан-Бутан (Евро-4 BRC/Lovato)'
    },
    fuelPricePerUnitAzn: 0.65,
    consumptionMultiplier: 1.15,
    equipmentCostAzn: 1150,
    labFeeAzn: 90,
    co2ReductionPercent: 22,
    tankInspectionIntervalYears: 2
  },
  lpg_direct_injection: {
    name: {
      az: 'LPG Birbaşa Püskürtmə (GDI / TSI / FSI Avro-5)',
      en: 'LPG Direct Injection (GDI / TSI / FSI Euro-5)',
      ru: 'ГБО LPG Прямой Впрыск (GDI / TSI / FSI Евро-5)'
    },
    fuelPricePerUnitAzn: 0.65,
    consumptionMultiplier: 1.12,
    equipmentCostAzn: 1650,
    labFeeAzn: 90,
    co2ReductionPercent: 24,
    tankInspectionIntervalYears: 2
  },
  cng_methane: {
    name: {
      az: 'CNG Sıxılmış Təbii Qaz - Metan (SOCAR 0.45 ₼/m³)',
      en: 'CNG Compressed Natural Gas - Methane (0.45 AZN/m³)',
      ru: 'ГБО CNG Сжатый Природный Газ - Метан (0.45 AZN/м³)'
    },
    fuelPricePerUnitAzn: 0.45,
    consumptionMultiplier: 0.95,
    equipmentCostAzn: 1450,
    labFeeAzn: 110,
    co2ReductionPercent: 32,
    tankInspectionIntervalYears: 3
  }
};

export const TUNING_EXCHANGE_RATES: Record<Currency, number> = {
  AZN: 1,
  USD: 0.5882,
  EUR: 0.5435
};

export function convertTuningCurrency(amountAzn: number, currency: Currency): number {
  const rate = TUNING_EXCHANGE_RATES[currency] || 1;
  return Number((amountAzn * rate).toFixed(2));
}

export function filterModificationsByCategory(
  category: ModificationCategory | 'all'
): TuningModificationItem[] {
  if (category === 'all') {
    return TUNING_MODIFICATIONS;
  }
  return TUNING_MODIFICATIONS.filter((item) => item.category === category);
}

export function auditVehicleModifications(
  input: TelemetryAuditInput
): TuningComplianceAuditResult {
  const activeModifications = TUNING_MODIFICATIONS.filter((item) =>
    input.selectedModificationIds.includes(item.id)
  );

  const prohibitedItems = activeModifications.filter(
    (item) => item.legalStatus === 'prohibited_impound'
  );
  const endorsementItems = activeModifications.filter(
    (item) => item.legalStatus === 'requires_texpasport_endorsement'
  );
  const exemptItems = activeModifications.filter(
    (item) => item.legalStatus === 'factory_exempt'
  );

  // Evaluate telemetry parameters
  const exhaustStatus: TuningComplianceAuditResult['exhaustStatus'] =
    input.exhaustDecibelDba > STATUTORY_ACOUSTIC_LIMIT_DBA
      ? 'illegal_loud'
      : input.exhaustDecibelDba >= STATUTORY_SPORT_MUFFLER_THRESHOLD_DBA
      ? 'sport_legal'
      : 'normal';

  const suspensionStatus: TuningComplianceAuditResult['suspensionStatus'] =
    input.suspensionLiftMm < 0 || input.suspensionLiftMm > STATUTORY_MAX_CERTIFIABLE_LIFT_MM
      ? 'illegal_cut_or_extreme'
      : input.suspensionLiftMm > 0
      ? 'certifiable_lift'
      : 'factory';

  const spacerStatus: TuningComplianceAuditResult['spacerStatus'] =
    input.wheelSpacerMm > STATUTORY_MAX_WHEEL_SPACER_MM
      ? 'illegal_protrusion'
      : 'compliant';

  const lightingStatus: TuningComplianceAuditResult['lightingStatus'] =
    input.headlightType === 'uncertified_xenon_halogen'
      ? 'illegal_glare'
      : 'compliant';

  const hasTelemetryViolation =
    exhaustStatus === 'illegal_loud' ||
    suspensionStatus === 'illegal_cut_or_extreme' ||
    spacerStatus === 'illegal_protrusion' ||
    lightingStatus === 'illegal_glare';

  const hasProhibitedMods = prohibitedItems.length > 0 || hasTelemetryViolation;

  const needsEndorsement =
    endorsementItems.length > 0 ||
    suspensionStatus === 'certifiable_lift' ||
    input.headlightType === 'certified_biled_lens';

  let overallStatus: TuningComplianceAuditResult['overallStatus'] = 'compliant';
  if (hasProhibitedMods) {
    overallStatus = 'illegal_impound_risk';
  } else if (needsEndorsement) {
    overallStatus = 'endorsement_required';
  }

  // Calculate statutory fine exposure
  let statutoryFineExposureAzn = prohibitedItems.reduce(
    (sum, item) => Math.max(sum, item.fineRiskAzn),
    0
  );

  if (exhaustStatus === 'illegal_loud') {
    statutoryFineExposureAzn = Math.max(statutoryFineExposureAzn, 800);
  }
  if (suspensionStatus === 'illegal_cut_or_extreme') {
    statutoryFineExposureAzn = Math.max(statutoryFineExposureAzn, 500);
  }
  if (spacerStatus === 'illegal_protrusion' || lightingStatus === 'illegal_glare') {
    statutoryFineExposureAzn = Math.max(statutoryFineExposureAzn, 150);
  }
  if (!hasProhibitedMods && needsEndorsement) {
    // Unregistered certifiable items risk 150 AZN under Art 342.2-1 if driven without Texpasport note
    statutoryFineExposureAzn = 150;
  }

  const impoundRisk =
    hasProhibitedMods ||
    prohibitedItems.some((i) => i.impoundmentRisk) ||
    endorsementItems.some((i) => i.impoundmentRisk);

  // Calculate official certification fees
  const labExpertiseTotalAzn =
    endorsementItems.reduce((sum, item) => sum + item.labCertificationFeeAzn, 0) +
    (suspensionStatus === 'certifiable_lift' &&
    !endorsementItems.some((i) => i.id === 'certified_lift_kit_50mm')
      ? 110
      : 0) +
    (input.headlightType === 'certified_biled_lens' ? 70 : 0);

  const texpasportReplacementFeeAzn = needsEndorsement
    ? BDYP_TUNING_STATE_DUTIES.texpasportReplacementFeeAzn
    : 0;
  const technicalInspectionFeeAzn = needsEndorsement
    ? BDYP_TUNING_STATE_DUTIES.technicalInspectionFeeAzn
    : 0;
  const asanServiceCommissionAzn = needsEndorsement
    ? BDYP_TUNING_STATE_DUTIES.asanServiceCommissionAzn
    : 0;

  const totalOfficialFeeAzn =
    labExpertiseTotalAzn +
    texpasportReplacementFeeAzn +
    technicalInspectionFeeAzn +
    asanServiceCommissionAzn;

  // Generate Texpasport Special Notes ("Xüsusi qeydlər")
  const notesList = endorsementItems.map((i) => i.texpasportNoteAz);
  if (
    suspensionStatus === 'certifiable_lift' &&
    !endorsementItems.some((i) => i.id === 'certified_lift_kit_50mm')
  ) {
    notesList.push(`Asqı hündürlüyü +${input.suspensionLiftMm}mm sertifikatlaşdırılıb`);
  }
  if (input.headlightType === 'certified_biled_lens') {
    notesList.push('Linzalı Bi-LED optika və avtokorrektor quraşdırılıb');
  }

  const texpasportEndorsementText =
    notesList.length > 0
      ? `Xüsusi qeydlər: ${notesList.join('; ')}`
      : 'Xüsusi qeydlər: Zavod konstruksiyası (Əlavə qeyd tələb olunmur)';

  // Compute compliance score (0 - 100)
  let complianceScore = 100;
  if (hasProhibitedMods) {
    complianceScore -= prohibitedItems.length * 30;
    if (exhaustStatus === 'illegal_loud') complianceScore -= 35;
    if (suspensionStatus === 'illegal_cut_or_extreme') complianceScore -= 35;
    if (spacerStatus === 'illegal_protrusion') complianceScore -= 20;
    if (lightingStatus === 'illegal_glare') complianceScore -= 20;
  } else if (needsEndorsement) {
    complianceScore = Math.max(70, 92 - endorsementItems.length * 4);
  }
  complianceScore = Math.max(5, Math.min(100, complianceScore));

  // Build actionable recommendations
  const recommendations: TuningComplianceAuditResult['recommendations'] = [];

  if (exhaustStatus === 'illegal_loud') {
    recommendations.push({
      az: `Səsboğucu səviyyəsi (${input.exhaustDecibelDba} dBA) AZS dövlət normativini (84 dBA) aşır! İXM Maddə 342.3 üzrə 500–800 ₼ cərimə və cərimə meydançası riskini aradan qaldırmaq üçün katalizatoru və standart rezonatoru bərpa edin.`,
      en: `Exhaust noise (${input.exhaustDecibelDba} dBA) exceeds the 84 dBA AZS statutory ceiling! Restore catalytic converter and resonator to avoid 500–800 AZN fine under Art. 342.3.`,
      ru: `Уровень шума выхлопа (${input.exhaustDecibelDba} дБА) превышает норму AZS (84 дБА)! Восстановите катализатор и глушитель во избежание штрафа 500–800 AZN.`
    });
  }

  if (suspensionStatus === 'illegal_cut_or_extreme') {
    recommendations.push({
      az:
        input.suspensionLiftMm < 0
          ? `Asqı yaylarının kəsilməsi (${input.suspensionLiftMm}mm) qadağandır. Zavod yaylarını və ya sertifikatlı asqı dəstini bərpa edin.`
          : `+${input.suspensionLiftMm}mm hündürlük icazə verilən maksimal +50mm sertifikat həddini aşır.`,
      en:
        input.suspensionLiftMm < 0
          ? `Cut or lowered springs (${input.suspensionLiftMm}mm) are prohibited. Restore OEM springs.`
          : `+${input.suspensionLiftMm}mm lift exceeds the maximum certifiable +50mm threshold.`,
      ru:
        input.suspensionLiftMm < 0
          ? `Занижение/подрезка пружин (${input.suspensionLiftMm}мм) запрещена. Установите заводские пружины.`
          : `Лифт +${input.suspensionLiftMm}мм превышает максимально допустимый порог +50мм.`
    });
  }

  if (spacerStatus === 'illegal_protrusion') {
    recommendations.push({
      az: `${input.wheelSpacerMm}mm təkər şaybası (spacer) təkəri kuzov tağından kənara çıxarır (maksimum 20mm).`,
      en: `${input.wheelSpacerMm}mm wheel spacer protrudes beyond the fender arch (max 20mm allowed).`,
      ru: `Проставка колеса ${input.wheelSpacerMm}мм выступает за пределы колесной арки (максимум 20мм).`
    });
  }

  if (lightingStatus === 'illegal_glare') {
    recommendations.push({
      az: 'Sadə reflektor farada lupasız Ksenon/LED qadağandır. Ya zavod lampasına qayıdın, ya da avtokorrektorlu Bi-LED linza rəsmiləşdirin.',
      en: 'Uncertified Xenon/LED in halogen reflector housing is prohibited. Switch to OEM bulbs or certified Bi-LED projector lenses.',
      ru: 'Ксенон/LED без линз в галогеновых фарах запрещен. Верните заводские лампы или сертифицируйте Bi-LED линзы.'
    });
  }

  if (needsEndorsement && !hasProhibitedMods) {
    recommendations.push({
      az: `Seçilmiş dəyişikliklər qanunidir, lakin AZS akkreditə olunmuş laboratoriyadan təhlükəsizlik aktı alıb BDYP-də Texpasportu yeniləməlisiniz (Cəmi rəsmi xərc: ${totalOfficialFeeAzn} ₼).`,
      en: `Selected modifications are legal once inspected by an AZS laboratory and endorsed on your BDYP Texpasport (Total official fee: ${totalOfficialFeeAzn} AZN).`,
      ru: `Выбранные изменения законны после получения акта лаборатории AZS и внесения отметки в техпаспорт БДП (Общая госпошлина: ${totalOfficialFeeAzn} AZN).`
    });
  }

  if (!hasProhibitedMods && !needsEndorsement) {
    recommendations.push({
      az: 'Avtomobilin bütün konstruktiv parametrləri zavod və BDYP normativlərinə tam uyğundur. Əlavə qeydiyyat tələb olunmur.',
      en: 'All vehicle constructive parameters comply with OEM and BDYP standards. No additional registration required.',
      ru: 'Все конструктивные параметры автомобиля полностью соответствуют заводским нормам и требованиям БДП.'
    });
  }

  return {
    overallStatus,
    complianceScore,
    activeModifications,
    prohibitedItems,
    endorsementItems,
    exemptItems,
    texpasportEndorsementText,
    exhaustStatus,
    suspensionStatus,
    spacerStatus,
    lightingStatus,
    statutoryFineExposureAzn,
    impoundRisk,
    feesBreakdown: {
      texpasportReplacementFeeAzn,
      technicalInspectionFeeAzn,
      labExpertiseTotalAzn,
      asanServiceCommissionAzn,
      totalOfficialFeeAzn
    },
    recommendations
  };
}

export function calculateAutogasPayback(
  config: AutogasSimulationConfig
): AutogasPaybackResult {
  const spec = AUTOGAS_SYSTEM_SPECS[config.systemType];
  const petrolPricePerLiterAzn = PETROL_TARIFFS_AZN[config.currentPetrolGrade] || 1.10;

  const monthlyMileage = Math.max(100, config.monthlyMileageKm);
  const baseConsumption = Math.max(3, config.petrolConsumptionLPer100Km);

  const monthlyPetrolLiters = (monthlyMileage / 100) * baseConsumption;
  const monthlyPetrolCostAzn = Number(
    (monthlyPetrolLiters * petrolPricePerLiterAzn).toFixed(2)
  );

  const monthlyGasUnits =
    (monthlyMileage / 100) * (baseConsumption * spec.consumptionMultiplier);
  // Direct injection uses ~8% petrol alongside gas for injector cooling
  const directInjectionPetrolAssistAzn =
    config.systemType === 'lpg_direct_injection'
      ? monthlyPetrolCostAzn * 0.08
      : 0;

  const monthlyGasCostAzn = Number(
    (
      monthlyGasUnits * spec.fuelPricePerUnitAzn +
      directInjectionPetrolAssistAzn
    ).toFixed(2)
  );

  const monthlySavingsAzn = Number(
    Math.max(0, monthlyPetrolCostAzn - monthlyGasCostAzn).toFixed(2)
  );
  const annualSavingsAzn = Number((monthlySavingsAzn * 12).toFixed(2));

  const officialRegistrationFeeAzn = config.includeOfficialTexpasportFee
    ? spec.labFeeAzn +
      BDYP_TUNING_STATE_DUTIES.texpasportReplacementFeeAzn +
      BDYP_TUNING_STATE_DUTIES.technicalInspectionFeeAzn +
      BDYP_TUNING_STATE_DUTIES.asanServiceCommissionAzn
    : 0;

  const totalUpfrontInvestmentAzn =
    spec.equipmentCostAzn + officialRegistrationFeeAzn;

  const paybackMonths =
    monthlySavingsAzn > 0
      ? Number((totalUpfrontInvestmentAzn / monthlySavingsAzn).toFixed(1))
      : 99.9;

  const fiveYearNetProfitAzn = Number(
    (monthlySavingsAzn * 60 - totalUpfrontInvestmentAzn).toFixed(2)
  );

  return {
    systemType: config.systemType,
    systemName: spec.name,
    equipmentAndInstallCostAzn: spec.equipmentCostAzn,
    officialRegistrationFeeAzn,
    totalUpfrontInvestmentAzn,
    monthlyPetrolCostAzn,
    monthlyGasCostAzn,
    monthlySavingsAzn,
    annualSavingsAzn,
    paybackMonths,
    fiveYearNetProfitAzn,
    co2ReductionPercent: spec.co2ReductionPercent,
    tankInspectionIntervalYears: spec.tankInspectionIntervalYears
  };
}

export function generateConstructiveCertificate(params: {
  ownerName: string;
  ownerFin: string;
  vehicleTitle: string;
  vin: string;
  plateNumber: string;
  labId: string;
  auditResult: TuningComplianceAuditResult;
  measuredDecibelDba: number;
  suspensionDeltaMm: number;
}): ConstructiveSafetyCertificate {
  const lab =
    ACCREDITED_TUNING_LABS.find((l) => l.id === params.labId) ||
    ACCREDITED_TUNING_LABS[0];

  const cleanFin = (params.ownerFin || '5A9K2L1').toUpperCase().trim();
  const cleanPlate = (params.plateNumber || '10-AA-001').toUpperCase().trim();
  const deterministicSuffix =
    10000 +
    ((cleanFin.charCodeAt(0) * 313 + cleanPlate.charCodeAt(0) * 197) % 89999);

  const hasAutogas = params.auditResult.endorsementItems.some(
    (i) => i.category === 'autogas'
  );

  const approvedModifications =
    params.auditResult.endorsementItems.length > 0
      ? params.auditResult.endorsementItems.map((i) => i.name.az)
      : ['Zavod Konstruksiyasına Uyğunluq Ekspertizası'];

  return {
    certificateNumber: `BDYP-KD-2026-${deterministicSuffix}`,
    azsLabProtocolNumber: `AZS-LAB-2026-${Math.floor(deterministicSuffix / 10)}`,
    issueDate: '2026-10-16',
    validUntil: hasAutogas
      ? '2028-10-16 (2 İllik Balon Sınağı)'
      : 'Müddətsiz (Texpasport Xüsusi Qeyd)',
    ownerName: params.ownerName.trim() || 'Fərid Məmmədov Əli oğlu',
    ownerFin: cleanFin,
    vehicleTitle: params.vehicleTitle,
    vin: params.vin,
    plateNumber: cleanPlate,
    accreditedLabName: lab.name,
    approvedModifications,
    texpasportSpecialNotes: params.auditResult.texpasportEndorsementText,
    measuredDecibelDba: params.measuredDecibelDba,
    suspensionDeltaMm: params.suspensionDeltaMm,
    totalStateFeePaidAzn:
      params.auditResult.feesBreakdown.totalOfficialFeeAzn || 52,
    qrVerificationHash: `AZS-BDYP-${deterministicSuffix}-${cleanFin}-VERIFIED`
  };
}

export function verifyCertificateByCode(
  queryCode: string
): ConstructiveSafetyCertificate | null {
  const normalized = queryCode.trim().toUpperCase();
  if (!normalized) return null;

  return (
    SAMPLE_TUNING_CERTIFICATES.find(
      (cert) =>
        cert.certificateNumber.toUpperCase() === normalized ||
        cert.plateNumber.toUpperCase() === normalized ||
        cert.azsLabProtocolNumber.toUpperCase() === normalized
    ) || null
  );
}

export function createLabAppointmentBooking(params: {
  labId: string;
  vehiclePlate: string;
  appointmentDate: string;
  appointmentSlot: string;
  estimatedFeeAzn: number;
}): LabBookingConfirmation {
  const lab =
    ACCREDITED_TUNING_LABS.find((l) => l.id === params.labId) ||
    ACCREDITED_TUNING_LABS[0];

  const cleanPlate = (params.vehiclePlate || '99-XX-999').toUpperCase().trim();
  const codeNum =
    1000 + ((cleanPlate.charCodeAt(0) * 73 + lab.id.length * 41) % 8999);

  return {
    bookingReference: `AZS-QEYD-2026-${codeNum}`,
    labId: lab.id,
    labName: lab.name,
    address: lab.address,
    appointmentDate: params.appointmentDate || '2026-10-19',
    appointmentSlot: params.appointmentSlot || '11:00',
    vehiclePlate: cleanPlate,
    estimatedFeeAzn: params.estimatedFeeAzn || 142
  };
}

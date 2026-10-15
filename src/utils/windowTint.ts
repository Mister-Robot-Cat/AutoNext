import { Currency } from '../types/vehicle';
import {
  ApplicantType,
  ComplianceStatus,
  GlassZone,
  OverallComplianceReport,
  PermitCostBreakdown,
  PermitCoverage,
  PhotometerReading,
  TintPermitCertificate,
  WindowTintConfig,
  ZoneCompliance,
} from '../types/windowTint';

export const STATUTORY_VLT_LIMITS = {
  windshield: 75,
  frontSide: 70,
  rearSideDefault: 60,
  rearDefault: 50,
  rearSideWithPermit: 0,
  rearWithPermit: 0,
} as const;

export const PERMIT_TARIFFS_AZN = {
  individual: {
    rear_side_only: 50,
    all_rear: 100,
  },
  entity: {
    rear_side_only: 100,
    all_rear: 200,
  },
} as const;

export const ASAN_SERVICE_FEE_AZN = 2;
export const STATUTORY_FINE_AZN = 150;
export const STATUTORY_PENALTY_ARTICLE = 'İXM Maddə 342.2-2 (150 AZN)';

export const CURRENCY_RATES: Record<Currency, number> = {
  AZN: 1,
  USD: 0.588,
  EUR: 0.543,
};

/**
 * Checks if the given date falls into the statutory seasonal curtain period
 * in Azerbaijan (May 1 to November 15 inclusive).
 */
export function isSeasonalCurtainPeriod(date: Date = new Date()): boolean {
  const month = date.getMonth(); // 0-indexed: 4 = May, 10 = Nov
  const day = date.getDate();

  // May 1 - Oct 31
  if (month >= 4 && month <= 9) {
    return true;
  }
  // Nov 1 - Nov 15
  if (month === 10 && day <= 15) {
    return true;
  }
  return false;
}

/**
 * Evaluates the compliance of a single window zone against Azerbaijani traffic standards.
 */
export function evaluateZoneCompliance(
  zone: GlassZone,
  vlt: number,
  options: {
    hasPermit?: boolean;
    permitCoverage?: PermitCoverage;
    hasFactoryCurtains?: boolean;
    isSeasonalActive?: boolean;
  } = {}
): ZoneCompliance {
  const isSeasonal = options.isSeasonalActive ?? isSeasonalCurtainPeriod();
  const hasPermit = Boolean(options.hasPermit);
  const permitCoverage = options.permitCoverage ?? 'rear_side_only';
  const hasCurtains = Boolean(options.hasFactoryCurtains);

  const zoneLabels: Record<GlassZone, { az: string; en: string; ru: string }> = {
    windshield: {
      az: 'Alın Şüşəsi (Windshield)',
      en: 'Windshield',
      ru: 'Лобовое стекло',
    },
    frontSide: {
      az: 'Ön Yan Şüşələr',
      en: 'Front Side Windows',
      ru: 'Передние боковые стекла',
    },
    rearSide: {
      az: 'Arxa Yan Şüşələr',
      en: 'Rear Side Windows',
      ru: 'Задние боковые стекла',
    },
    rear: {
      az: 'Arxa Alın Şüşəsi',
      en: 'Rear Window',
      ru: 'Заднее стекло',
    },
  };

  switch (zone) {
    case 'windshield': {
      const minRequired = STATUTORY_VLT_LIMITS.windshield;
      const isOk = vlt >= minRequired;
      return {
        zone,
        label: zoneLabels.windshield,
        vlt,
        minRequiredVlt: minRequired,
        status: isOk ? 'compliant' : 'violation',
        isPermitCovered: false,
        isSeasonalPermitted: false,
        message: isOk
          ? {
              az: `Qanunidir (İşıqburaxma ≥ ${minRequired}%). Tündləşdirici örtük qadağandır.`,
              en: `Compliant (VLT ≥ ${minRequired}%). Tint film prohibited.`,
              ru: `Соответствует норме (VLT ≥ ${minRequired}%). Тонировка запрещена.`,
            }
          : {
              az: `Qanunsuzdur! Alın şüşəsi işıqburaxması ${vlt}%-dir (tələb: ≥${minRequired}%). Cərimə riski: 150 AZN.`,
              en: `Violation! Windshield VLT is ${vlt}% (required: ≥${minRequired}%). Fine risk: 150 AZN.`,
              ru: `Нарушение! Светопропускание ${vlt}% (норма: ≥${minRequired}%). Штраф: 150 AZN.`,
            },
      };
    }

    case 'frontSide': {
      const minRequired = STATUTORY_VLT_LIMITS.frontSide;
      const isOk = vlt >= minRequired;
      return {
        zone,
        label: zoneLabels.frontSide,
        vlt,
        minRequiredVlt: minRequired,
        status: isOk ? 'compliant' : 'violation',
        isPermitCovered: false,
        isSeasonalPermitted: false,
        message: isOk
          ? {
              az: `Qanunidir (İşıqburaxma ≥ ${minRequired}%). Qara plyonka icazəsi verilmir.`,
              en: `Compliant (VLT ≥ ${minRequired}%). No dark tint permitted.`,
              ru: `Соответствует норме (VLT ≥ ${minRequired}%). Темная пленка запрещена.`,
            }
          : {
              az: `Qanunsuzdur! Ön yan şüşələr ${vlt}%-dir (tələb: ≥${minRequired}%). İcazə verilmir, cərimə: 150 AZN.`,
              en: `Violation! Front side VLT is ${vlt}% (required: ≥${minRequired}%). Not permit-eligible, 150 AZN fine.`,
              ru: `Нарушение! Передние боковые ${vlt}% (норма: ≥${minRequired}%). Штраф: 150 AZN.`,
            },
      };
    }

    case 'rearSide': {
      const isCoveredByPermit = hasPermit && (permitCoverage === 'rear_side_only' || permitCoverage === 'all_rear');
      const minRequired = isCoveredByPermit ? STATUTORY_VLT_LIMITS.rearSideWithPermit : STATUTORY_VLT_LIMITS.rearSideDefault;

      if (isCoveredByPermit) {
        return {
          zone,
          label: zoneLabels.rearSide,
          vlt,
          minRequiredVlt: 0,
          status: 'compliant',
          isPermitCovered: true,
          isSeasonalPermitted: false,
          message: {
            az: `Dövlət İcazəsi ilə tam qanunidir (İstənilən tündləşdirmə dərəcəsi icazəlidir).`,
            en: `Fully compliant with official state permit (Any darkness permitted).`,
            ru: `Полностью законно по официальному разрешению (Любая степень тонировки).`,
          },
        };
      }

      if (vlt >= STATUTORY_VLT_LIMITS.rearSideDefault) {
        return {
          zone,
          label: zoneLabels.rearSide,
          vlt,
          minRequiredVlt: STATUTORY_VLT_LIMITS.rearSideDefault,
          status: 'compliant',
          isPermitCovered: false,
          isSeasonalPermitted: false,
          message: {
            az: `Standart qanunidir (Zavod işıqburaxma ≥ 60%).`,
            en: `Standard compliant (Factory VLT ≥ 60%).`,
            ru: `Стандартное соответствие (Заводское VLT ≥ 60%).`,
          },
        };
      }

      // Check seasonal curtain allowance
      if (hasCurtains && isSeasonal) {
        return {
          zone,
          label: zoneLabels.rearSide,
          vlt,
          minRequiredVlt: 0,
          status: 'warning_seasonal',
          isPermitCovered: false,
          isSeasonalPermitted: true,
          message: {
            az: `Mövsümi Qanunidir (1 May - 15 Noyabr sənaye üsulu pərdə/jalüz icazəsi).`,
            en: `Seasonally compliant (May 1 - Nov 15 factory curtains allowed).`,
            ru: `Сезонно разрешено (Шторки/жалюзи разрешены с 1 мая по 15 ноября).`,
          },
        };
      }

      return {
        zone,
        label: zoneLabels.rearSide,
        vlt,
        minRequiredVlt: minRequired,
        status: 'violation',
        isPermitCovered: false,
        isSeasonalPermitted: false,
        message: {
          az: `Qanunsuzdur! İşıqburaxma ${vlt}%-dir (İcazəsiz norma ≥ 60%). İllik BDYP icazəsi tələb olunur (50 AZN).`,
          en: `Violation! VLT is ${vlt}% (Standard ≥ 60%). BDYP permit required (50 AZN).`,
          ru: `Нарушение! VLT ${vlt}% (Без разрешения ≥ 60%). Требуется разрешение BDYP (50 AZN).`,
        },
      };
    }

    case 'rear': {
      const isCoveredByPermit = hasPermit && permitCoverage === 'all_rear';
      const minRequired = isCoveredByPermit ? STATUTORY_VLT_LIMITS.rearWithPermit : STATUTORY_VLT_LIMITS.rearDefault;

      if (isCoveredByPermit) {
        return {
          zone,
          label: zoneLabels.rear,
          vlt,
          minRequiredVlt: 0,
          status: 'compliant',
          isPermitCovered: true,
          isSeasonalPermitted: false,
          message: {
            az: `Dövlət İcazəsi ilə tam qanunidir (Arxa şüşə üçün xüsusi icazə aktivdir).`,
            en: `Fully compliant with official state permit (Rear glass covered).`,
            ru: `Полностью законно по разрешению (Заднее стекло включено).`,
          },
        };
      }

      if (vlt >= STATUTORY_VLT_LIMITS.rearDefault) {
        return {
          zone,
          label: zoneLabels.rear,
          vlt,
          minRequiredVlt: STATUTORY_VLT_LIMITS.rearDefault,
          status: 'compliant',
          isPermitCovered: false,
          isSeasonalPermitted: false,
          message: {
            az: `Standart qanunidir (Yan güzgülər olduqda işıqburaxma ≥ 50%).`,
            en: `Standard compliant (VLT ≥ 50% with exterior mirrors).`,
            ru: `Стандартное соответствие (VLT ≥ 50% при наличии боковых зеркал).`,
          },
        };
      }

      return {
        zone,
        label: zoneLabels.rear,
        vlt,
        minRequiredVlt: minRequired,
        status: 'violation',
        isPermitCovered: false,
        isSeasonalPermitted: false,
        message: {
          az: `Qanunsuzdur! Arxa şüşə ${vlt}%-dir (Norma ≥ 50%). Tam arxa paket icazəsi tələb olunur (100 AZN).`,
          en: `Violation! Rear VLT is ${vlt}% (Standard ≥ 50%). Full rear permit required (100 AZN).`,
          ru: `Нарушение! Заднее VLT ${vlt}% (Норма ≥ 50%). Требуется полное разрешение (100 AZN).`,
        },
      };
    }
  }
}

/**
 * Evaluates the entire vehicle glass configuration against state standards.
 */
export function evaluateOverallCompliance(
  config: WindowTintConfig,
  checkDate: Date = new Date()
): OverallComplianceReport {
  const isSeasonalActive = isSeasonalCurtainPeriod(checkDate);

  const zones: ZoneCompliance[] = [
    evaluateZoneCompliance('windshield', config.windshieldVlt, {
      hasPermit: config.hasPermit,
      permitCoverage: config.permitCoverage,
      isSeasonalActive,
    }),
    evaluateZoneCompliance('frontSide', config.frontSideVlt, {
      hasPermit: config.hasPermit,
      permitCoverage: config.permitCoverage,
      isSeasonalActive,
    }),
    evaluateZoneCompliance('rearSide', config.rearSideVlt, {
      hasPermit: config.hasPermit,
      permitCoverage: config.permitCoverage,
      hasFactoryCurtains: config.hasFactoryCurtains,
      isSeasonalActive,
    }),
    evaluateZoneCompliance('rear', config.rearVlt, {
      hasPermit: config.hasPermit,
      permitCoverage: config.permitCoverage,
      isSeasonalActive,
    }),
  ];

  const hasViolation = zones.some((z) => z.status === 'violation');
  const hasWarning = zones.some((z) => z.status === 'warning_seasonal');

  const overallStatus: ComplianceStatus = hasViolation
    ? 'violation'
    : hasWarning
    ? 'warning_seasonal'
    : 'compliant';

  const recommendations: { az: string; en: string; ru: string }[] = [];

  if (zones[0].status === 'violation') {
    recommendations.push({
      az: 'Alın şüşəsindəki qara plyonkanı çıxarın; yalnız yuxarı hissəyə 14 sm enində zolaq vurula bilər.',
      en: 'Remove tint film from the windshield; only an upper strip up to 14 cm is legally permitted.',
      ru: 'Снимите тонировку с лобового стекла; разрешена только верхняя полоса шириной до 14 см.',
    });
  }

  if (zones[1].status === 'violation') {
    recommendations.push({
      az: 'Ön yan şüşələrdə tünd plyonka qadağandır. Şəffaf atermal UV örtüklə əvəz edin (işıqburaxma ≥ 70%).',
      en: 'Dark tint on front sides is illegal. Replace with transparent athermal UV film (VLT ≥ 70%).',
      ru: 'Тонировка передних боковых стекол запрещена. Замените на атермальную пленку (VLT ≥ 70%).',
    });
  }

  if (zones[2].status === 'violation') {
    recommendations.push({
      az: 'Arxa yan şüşələr üçün BDYP rəsmi illik icazəsi əldə edin (50 AZN) və ya sənaye pərdələri istifadə edin.',
      en: 'Obtain an official 1-year BDYP tint permit for rear side windows (50 AZN) or use factory curtains.',
      ru: 'Оформите официальное годовое разрешение BDYP для задних боковых стекол (50 AZN).',
    });
  }

  if (zones[3].status === 'violation') {
    recommendations.push({
      az: 'Arxa alın şüşəsini tündləşdirmək üçün "Bütün arxa şüşələr" icazə paketini rəsmiləşdirin (100 AZN).',
      en: 'To tint the rear window, register the "All rear windows" official permit package (100 AZN).',
      ru: 'Для тонировки заднего стекла оформите пакет "Все задние стекла" (100 AZN).',
    });
  }

  if (overallStatus === 'compliant') {
    recommendations.push({
      az: 'Avtomobilinizin şüşə parametrləri Azərbaycan Respublikasının dövlət standartlarına tam uyğundur.',
      en: 'Your vehicle glass configuration is fully compliant with statutory Azerbaijan standards.',
      ru: 'Параметры стекол вашего автомобиля полностью соответствуют стандартам Азербайджана.',
    });
  }

  return {
    isCompliant: !hasViolation,
    overallStatus,
    zones,
    fineRiskAzn: hasViolation ? STATUTORY_FINE_AZN : 0,
    penaltyArticle: STATUTORY_PENALTY_ARTICLE,
    recommendations,
    isSeasonalActive,
  };
}

/**
 * Calculates statutory permit duty, service fees, and multi-currency converted amounts.
 */
export function calculatePermitCost(
  applicantType: ApplicantType = 'individual',
  coverage: PermitCoverage = 'rear_side_only',
  currency: Currency = 'AZN'
): PermitCostBreakdown {
  const stateDutyAzn = PERMIT_TARIFFS_AZN[applicantType][coverage];
  const serviceFeeAzn = ASAN_SERVICE_FEE_AZN;
  const totalAzn = stateDutyAzn + serviceFeeAzn;

  const rate = CURRENCY_RATES[currency] || 1;
  const totalConverted = Math.round(totalAzn * rate);

  return {
    applicantType,
    coverage,
    stateDutyAzn,
    serviceFeeAzn,
    totalAzn,
    totalConverted,
    currency,
    validityMonths: 12,
  };
}

/**
 * Simulates a BDYP photometer optical measurement with realistic calibration margin.
 */
export function simulatePhotometerReading(
  zone: GlassZone,
  nominalVlt: number,
  varianceSeed: number = 0
): PhotometerReading {
  // Deterministic micro-variance between -1.2% and +1.2%
  const offset = ((varianceSeed % 7) - 3) * 0.4;
  const measuredVlt = Math.min(100, Math.max(0, Math.round((nominalVlt + offset) * 10) / 10));

  let status: ComplianceStatus = 'compliant';
  if (zone === 'windshield' && measuredVlt < STATUTORY_VLT_LIMITS.windshield) {
    status = 'violation';
  } else if (zone === 'frontSide' && measuredVlt < STATUTORY_VLT_LIMITS.frontSide) {
    status = 'violation';
  } else if (zone === 'rearSide' && measuredVlt < STATUTORY_VLT_LIMITS.rearSideDefault) {
    status = 'violation';
  } else if (zone === 'rear' && measuredVlt < STATUTORY_VLT_LIMITS.rearDefault) {
    status = 'violation';
  }

  return {
    zone,
    measuredVlt,
    ambientLux: 1240 + (varianceSeed % 150),
    marginOfError: 1.5,
    timestamp: new Date().toISOString(),
    operatorId: `BDYP-OP-${1040 + (varianceSeed % 50)}`,
    status,
  };
}

/**
 * Generates an official BDYP electronic window tinting permit certificate.
 */
export function generateTintPermitCertificate(params: {
  plateNumber: string;
  vin: string;
  ownerName: string;
  ownerPin?: string;
  applicantType?: ApplicantType;
  coverage?: PermitCoverage;
  issueDate?: string;
}): TintPermitCertificate {
  const applicantType = params.applicantType ?? 'individual';
  const coverage = params.coverage ?? 'rear_side_only';
  const feeBreakdown = calculatePermitCost(applicantType, coverage, 'AZN');

  const issue = params.issueDate ? new Date(params.issueDate) : new Date();
  const expiry = new Date(issue);
  expiry.setFullYear(expiry.getFullYear() + 1);

  const cleanPlate = params.plateNumber.replace(/\s+/g, '-').toUpperCase();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const permitNumber = `BDYP-PL-2026-${randomSuffix}`;

  const securityHash = `SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const qrCodeUrl = `https://asanpay.az/verify/tint/${permitNumber}`;

  return {
    permitNumber,
    issueDate: issue.toISOString().split('T')[0],
    expiryDate: expiry.toISOString().split('T')[0],
    plateNumber: cleanPlate,
    vin: params.vin,
    ownerName: params.ownerName,
    ownerPin: params.ownerPin || '7A9B3C1',
    applicantType,
    coverage,
    feeAzn: feeBreakdown.totalAzn,
    securityHash,
    qrCodeUrl,
    status: 'active',
  };
}

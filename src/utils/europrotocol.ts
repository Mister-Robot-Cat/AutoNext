import { Currency } from '../types/vehicle';
import { CURRENCY_RATES } from './i18n';
import {
  AccidentScenarioId,
  DamageDegree,
  DamagePartId,
  DamageSelection,
  EuroprotocolCalculationResult,
  EuroprotocolEligibilityCriteria,
  EuroprotocolScenario,
  FaultAllocation,
  PartyDetails,
  VehicleRole,
} from '../types/europrotocol';
import {
  AZERBAIJAN_INSURERS,
  DAMAGE_CATALOG,
  EUROPROTOCOL_SCENARIOS,
  STATUTORY_EUROPROTOCOL_LIMIT_AZN,
} from '../data/mockEuroprotocolData';

/**
 * Calculates estimated repair cost for a single damaged vehicle component
 */
export function calculatePartDamageCost(
  partId: DamagePartId,
  degree: DamageDegree,
  customCostAzn?: number
): number {
  if (customCostAzn !== undefined && customCostAzn >= 0) {
    return customCostAzn;
  }
  const item = DAMAGE_CATALOG.find((p) => p.partId === partId);
  if (!item) return 50;
  return item.costs[degree] || 50;
}

/**
 * Calculates total repair damage in AZN across all selected damaged parts for a vehicle
 */
export function calculateVehicleTotalDamage(damages: DamageSelection[]): number {
  return damages.reduce((sum, d) => sum + calculatePartDamageCost(d.partId, d.degree, d.customCostAzn), 0);
}

/**
 * Validates eligibility for simplified Europrotocol settlement under Article 53-1
 */
export function validateEuroprotocolEligibility(
  criteria: EuroprotocolEligibilityCriteria,
  victimDamageAzn: number
): {
  isEligible: boolean;
  reasons: {
    az: string;
    en: string;
    ru: string;
  }[];
} {
  const reasons: { az: string; en: string; ru: string }[] = [];

  if (!criteria.twoVehiclesOnly) {
    reasons.push({
      az: 'Avroprotokol yalnız 2 nəqliyyat vasitəsinin iştirakı ilə baş verən qəzalarda tətbiq olunur. 3 və daha çox avtomobil olduqda BDYP (902) çağırılmalıdır.',
      en: 'Europrotocol applies strictly to two-vehicle collisions. 3 or more vehicles require official Traffic Police (DYP) attendance.',
      ru: 'Европротокол применяется исключительно при участии 2 транспортных средств. 3 и более авто требуют вызова ГАИ (BDYP).',
    });
  }

  if (!criteria.noInjuriesOrCasualties) {
    reasons.push({
      az: 'Şəxslərin həyat və ya sağlamlığına zərər dəydikdə Avroprotokol qadağandır! Dərhal Təcili Yardım (103) və BDYP (902) çağırılmalıdır.',
      en: 'In case of injuries or harm to health, Europrotocol is prohibited! Emergency Medical Services (103) and DYP (902) must be called immediately.',
      ru: 'При причинении вреда здоровью или жизни европротокол запрещен! Немедленно вызывайте Скорую помощь (103) и ГАИ (902).',
    });
  }

  if (!criteria.validCompulsoryInsuranceBoth) {
    reasons.push({
      az: 'Hər iki sürücünün qüvvədə olan İcbari Avtomobil Sığorta Şəhadətnaməsi olmalıdır. Əks halda təzminat ödənilmir.',
      en: 'Both drivers must possess active compulsory vehicle liability insurance policies.',
      ru: 'Оба водителя должны иметь действующий полис обязательного страхования ОСАГО (İcbari).',
    });
  }

  if (!criteria.noThirdPartyPropertyDamage) {
    reasons.push({
      az: 'Yol kənarındakı maneələrə, hasarlara, işıq dirəklərinə və ya üçüncü şəxslərin əmlakına ziyan dəydikdə BDYP iştirakı zəruridir.',
      en: 'Damage to third-party property, street lighting or road infrastructure requires standard police recording.',
      ru: 'Повреждение дорожной инфраструктуры, ограждений или имущества третьих лиц требует обязательного участия ГАИ.',
    });
  }

  if (!criteria.mutualAgreementOnFault) {
    reasons.push({
      az: 'Tərəflər qəzanın baş vermə şəraitində və təqsirdə tam razılığa gəlmədikdə hadisə yerinə BDYP çağırılmalıdır.',
      en: 'If drivers dispute the circumstances or liability, police presence is required.',
      ru: 'При наличии разногласий по виновности или обстоятельствам ДТП вызов ГАИ обязателен.',
    });
  }

  if (victimDamageAzn > STATUTORY_EUROPROTOCOL_LIMIT_AZN) {
    reasons.push({
      az: `Zərərçəkənin təmir xərci (${victimDamageAzn} AZN) qanunla müəyyən edilmiş 1,000 AZN həddini aşır. Fərq təqsirkar tərəfindən ödənməli və ya BDYP çağırılmalıdır.`,
      en: `Victim repair cost (${victimDamageAzn} AZN) exceeds the statutory 1,000 AZN ceiling. The excess is not covered under simplified protocol.`,
      ru: `Ущерб пострадавшего (${victimDamageAzn} AZN) превышает установленный лимит в 1 000 AZN. Превышение не покрывается стандартным европротоколом.`,
    });
  }

  const isEligible =
    criteria.twoVehiclesOnly &&
    criteria.noInjuriesOrCasualties &&
    criteria.validCompulsoryInsuranceBoth &&
    criteria.noThirdPartyPropertyDamage &&
    criteria.mutualAgreementOnFault &&
    victimDamageAzn <= STATUTORY_EUROPROTOCOL_LIMIT_AZN;

  return { isEligible, reasons };
}

/**
 * Calculates insurance compensation and liability share under Europrotocol rules
 */
export function calculateEuroprotocolPayout(params: {
  partyA: PartyDetails;
  partyB: PartyDetails;
  faultAllocation: FaultAllocation;
  currency: Currency;
}): EuroprotocolCalculationResult {
  const { partyA, partyB, faultAllocation, currency } = params;

  const partyADamageAzn = calculateVehicleTotalDamage(partyA.damages);
  const partyBDamageAzn = calculateVehicleTotalDamage(partyB.damages);
  const totalDamageAzn = partyADamageAzn + partyBDamageAzn;

  let claimantParty: VehicleRole | 'both' = 'partyB';
  let payablePayoutAzn = 0;
  let excessUncoveredAzn = 0;
  let payingInsurer = partyA.insuranceCompany;
  let receivingInsurer = partyB.insuranceCompany;

  if (faultAllocation === 'partyA_100') {
    claimantParty = 'partyB';
    payingInsurer = partyA.insuranceCompany;
    receivingInsurer = partyB.insuranceCompany;
    payablePayoutAzn = Math.min(partyBDamageAzn, STATUTORY_EUROPROTOCOL_LIMIT_AZN);
    excessUncoveredAzn = Math.max(0, partyBDamageAzn - STATUTORY_EUROPROTOCOL_LIMIT_AZN);
  } else if (faultAllocation === 'partyB_100') {
    claimantParty = 'partyA';
    payingInsurer = partyB.insuranceCompany;
    receivingInsurer = partyA.insuranceCompany;
    payablePayoutAzn = Math.min(partyADamageAzn, STATUTORY_EUROPROTOCOL_LIMIT_AZN);
    excessUncoveredAzn = Math.max(0, partyADamageAzn - STATUTORY_EUROPROTOCOL_LIMIT_AZN);
  } else {
    // Mutual 50/50
    claimantParty = 'both';
    payingInsurer = 'Qarşılıqlı sığortaçılar (50% / 50%)';
    receivingInsurer = 'Hər iki tərəf';
    const halfPartyA = Math.round(partyADamageAzn * 0.5);
    const halfPartyB = Math.round(partyBDamageAzn * 0.5);
    payablePayoutAzn = Math.min(halfPartyA + halfPartyB, STATUTORY_EUROPROTOCOL_LIMIT_AZN);
    excessUncoveredAzn = Math.max(0, totalDamageAzn * 0.5 - STATUTORY_EUROPROTOCOL_LIMIT_AZN);
  }

  const isEligibleDamageLimit = (claimantParty === 'partyB' ? partyBDamageAzn : partyADamageAzn) <= STATUTORY_EUROPROTOCOL_LIMIT_AZN;

  // Currency conversion
  const rate = CURRENCY_RATES[currency] || 1.0;
  const convertedAmount = currency === 'AZN' ? payablePayoutAzn : Math.round((payablePayoutAzn / rate) * 10) / 10;

  const legalNote = {
    az: `«İcbari sığortalar haqqında» Qanunun 53-1-ci maddəsinə əsasən, sığorta şirkəti (${payingInsurer}) zərərçəkənə 7 iş günü ərzində ${payablePayoutAzn} AZN məbləğində təzminat ödəməyi öhdəsinə götürür. Françiza (tutulma) tətbiq edilmir.`,
    en: `Under Article 53-1 of the Law on Compulsory Insurance, the insurer (${payingInsurer}) must disburse ${payablePayoutAzn} AZN compensation within 7 business days with zero deductible.`,
    ru: `Согласно ст. 53-1 Закона «Об обязательном страховании», страховая компания (${payingInsurer}) обязуется выплатить компенсацию в размере ${payablePayoutAzn} AZN в течение 7 рабочих дней без франшизы.`,
  };

  return {
    partyADamageAzn,
    partyBDamageAzn,
    totalDamageAzn,
    faultAllocation,
    claimantParty,
    statutoryLimitAzn: STATUTORY_EUROPROTOCOL_LIMIT_AZN,
    payablePayoutAzn,
    excessUncoveredAzn,
    payingInsurer,
    receivingInsurer,
    isEligibleDamageLimit,
    payoutConverted: {
      amount: convertedAmount,
      currency,
    },
    legalNote,
  };
}

/**
 * Generates an authentic unique Europrotocol Protocol Number
 */
export function generateProtocolNumber(): string {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `ISB-AVRO-2026-${randomSuffix}`;
}

/**
 * Generates digital checksum and verification code
 */
export function generateSecurityHash(
  protocolNumber: string,
  plateA: string,
  plateB: string
): string {
  const seed = `${protocolNumber}-${plateA}-${plateB}-ISB-AZ`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex.slice(0, 4)}-${hex.slice(4, 8)}-${protocolNumber.slice(-4)}`;
}

/**
 * Normalizes and formats an Azerbaijani license plate number (e.g. 99-YP-420)
 */
export function formatAzerbaijanPlate(input: string): string {
  if (!input) return '';
  const cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
  return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4, 7)}`;
}

/**
 * Finds Europrotocol scenario by identifier
 */
export function findScenarioById(id: AccidentScenarioId): EuroprotocolScenario | undefined {
  return EUROPROTOCOL_SCENARIOS.find((s) => s.id === id);
}

/**
 * Resolves customer hotline for an insurance company
 */
export function getInsuranceHotline(companyName: string): string {
  const insurer = AZERBAIJAN_INSURERS.find(
    (ins) => ins.name.toLowerCase() === companyName.toLowerCase() || ins.shortCode.toLowerCase() === companyName.toLowerCase()
  );
  return insurer ? insurer.hotline : '1540';
}

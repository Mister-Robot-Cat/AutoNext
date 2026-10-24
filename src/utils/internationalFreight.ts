import {
  FreightCargoType,
  FreightCorridorId,
  TransportRegime,
  DibPermitCategory,
  FreightCalculationInput,
  FreightCalculationResult,
  DibCountryQuota,
  FreightCorridor,
  CarrierCompany,
} from '../types/internationalFreight';

export const SDR_TO_USD = 1.33;
export const USD_TO_AZN = 1.70;
export const EUR_TO_AZN = 1.85;
export const CMR_SDR_PER_KG = 8.33;
export const TIR_CARNET_COST_USD = 110;

export function convertUsdToAzn(amountUsd: number): number {
  return Number((amountUsd * USD_TO_AZN).toFixed(2));
}

export function convertUsdToEur(amountUsd: number): number {
  const azn = amountUsd * USD_TO_AZN;
  return Number((azn / EUR_TO_AZN).toFixed(2));
}

export function convertAznToCurrency(amountAzn: number, currency: 'AZN' | 'USD' | 'EUR'): number {
  if (currency === 'AZN') return Number(amountAzn.toFixed(2));
  if (currency === 'USD') return Number((amountAzn / USD_TO_AZN).toFixed(2));
  if (currency === 'EUR') return Number((amountAzn / EUR_TO_AZN).toFixed(2));
  return Number(amountAzn.toFixed(2));
}

export function calculateSdrLiability(grossWeightKg: number): {
  sdrTotal: number;
  liabilityUsd: number;
  liabilityAzn: number;
  liabilityEur: number;
} {
  const safeWeight = Math.max(0, grossWeightKg);
  const sdrTotal = Number((safeWeight * CMR_SDR_PER_KG).toFixed(2));
  const liabilityUsd = Number((sdrTotal * SDR_TO_USD).toFixed(2));
  const liabilityAzn = convertUsdToAzn(liabilityUsd);
  const liabilityEur = convertUsdToEur(liabilityUsd);

  return {
    sdrTotal,
    liabilityUsd,
    liabilityAzn,
    liabilityEur,
  };
}

export function calculateFreightCosts(
  input: FreightCalculationInput,
  corridors: FreightCorridor[],
  _carriers: CarrierCompany[]
): FreightCalculationResult {
  const corridor = corridors.find((c) => c.id === input.corridorId) || corridors[0];
  const weightTons = Math.max(0.1, input.grossWeightKg / 1000);

  // Weight factor: baseline is 10 tons.
  // Weight between 10t and 22t scales moderately, over 22t has heavy freight factor.
  const weightMultiplier = Math.max(0.6, Math.min(2.2, 0.4 + (weightTons / 10) * 0.6));
  const rawFreightUsd = corridor.baseFreightRateUsd * weightMultiplier;

  // Ro-Ro ferry addition if corridor crosses the Caspian
  const roRoUsd = corridor.requiresRoRoFerry ? (corridor.ferryCostUsd || 1200) : 0;

  // TIR Carnet guarantee fee
  const tirUsd = input.useTirCarnet || input.transportRegime === 'tir_carnet_iru' ? TIR_CARNET_COST_USD : 0;

  // Surcharges for cargo specific handling
  let surchargeRate = 0;
  if (input.includeAdrsurcharge || input.cargoType === 'chemical_adr') {
    surchargeRate += 0.25; // 25% ADR dangerous cargo handling
  }
  if (input.includeTemperatureControl || input.cargoType === 'perishable_food' || input.cargoType === 'pharmaceuticals') {
    surchargeRate += 0.18; // 18% Reefer temperature telemetry
  }
  if (input.cargoType === 'heavy_machinery') {
    surchargeRate += 0.15; // 15% Heavy machinery tie-down securing
  }

  const surchargesUsd = Number((rawFreightUsd * surchargeRate).toFixed(2));
  const subtotalUsd = rawFreightUsd + roRoUsd + tirUsd + surchargesUsd;

  // Zero VAT on international transport pursuant to AR Tax Code Article 165.1.4 (0% Export Transit VAT)
  const vatUsd = 0;
  const totalFreightUsd = Number((subtotalUsd + vatUsd).toFixed(2));

  const baseFreightAzn = convertUsdToAzn(rawFreightUsd);
  const baseFreightEur = convertUsdToEur(rawFreightUsd);

  const roRoFerryCostAzn = convertUsdToAzn(roRoUsd);
  const roRoFerryCostEur = convertUsdToEur(roRoUsd);

  const tirCarnetFeeAzn = convertUsdToAzn(tirUsd);
  const tirCarnetFeeEur = convertUsdToEur(tirUsd);

  const surchargesAzn = convertUsdToAzn(surchargesUsd);
  const surchargesEur = convertUsdToEur(surchargesUsd);

  const totalFreightAzn = convertUsdToAzn(totalFreightUsd);
  const totalFreightEur = convertUsdToEur(totalFreightUsd);

  // SDR Carrier Liability
  const { sdrTotal, liabilityUsd, liabilityAzn, liabilityEur } = calculateSdrLiability(input.grossWeightKg);
  const isLiabilityCappedByDeclaredValue = input.declaredValueUsd > 0 && input.declaredValueUsd < liabilityUsd;

  const estimatedTransitDays = Math.ceil(corridor.avgDurationHours / 24);

  const requiredDibCategory: DibPermitCategory = corridor.borderCrossings > 1 ? 'transit' : 'bilateral';

  // Carrier compliance score (composite 0 - 100)
  let complianceScore = 85;
  if (input.useTirCarnet) complianceScore += 10;
  if (input.transportRegime === 'e_cmr_digital') complianceScore += 5;

  return {
    baseFreightAzn,
    baseFreightUsd: Number(rawFreightUsd.toFixed(2)),
    baseFreightEur,
    roRoFerryCostAzn,
    roRoFerryCostUsd: roRoUsd,
    roRoFerryCostEur,
    tirCarnetFeeAzn,
    tirCarnetFeeUsd: tirUsd,
    tirCarnetFeeEur,
    surchargesAzn,
    surchargesUsd,
    surchargesEur,
    vatAzn: 0,
    vatUsd: 0,
    vatEur: 0,
    totalFreightAzn,
    totalFreightUsd,
    totalFreightEur,
    sdrRatePerKg: CMR_SDR_PER_KG,
    totalSdrLiability: sdrTotal,
    sdrLiabilityAzn: liabilityAzn,
    sdrLiabilityUsd: liabilityUsd,
    sdrLiabilityEur: liabilityEur,
    isLiabilityCappedByDeclaredValue,
    estimatedTransitDays,
    requiredDibCategory,
    carrierComplianceScore: Math.min(100, complianceScore),
  };
}

export function getDibQuotaAvailability(quota: DibCountryQuota, category: DibPermitCategory): {
  total: number;
  used: number;
  remaining: number;
  percentUsed: number;
  status: 'available' | 'limited' | 'exhausted';
} {
  let total = 0;
  let used = 0;

  switch (category) {
    case 'bilateral':
      total = quota.bilateralTotal;
      used = quota.bilateralUsed;
      break;
    case 'transit':
      total = quota.transitTotal;
      used = quota.transitUsed;
      break;
    case 'third_country':
      total = quota.thirdCountryTotal;
      used = quota.thirdCountryUsed;
      break;
    case 'ecmt_annual':
      total = quota.bilateralTotal + quota.transitTotal;
      used = quota.bilateralUsed + quota.transitUsed;
      break;
  }

  const remaining = Math.max(0, total - used);
  const percentUsed = total > 0 ? Number(((used / total) * 100).toFixed(1)) : 100;

  let status: 'available' | 'limited' | 'exhausted' = 'available';
  if (remaining === 0) {
    status = 'exhausted';
  } else if (percentUsed >= 80) {
    status = 'limited';
  }

  return {
    total,
    used,
    remaining,
    percentUsed,
    status,
  };
}

export function generateECmrNumber(carrierVoen: string): string {
  const seed = (carrierVoen || '990012345').replace(/\D/g, '').slice(-4);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `AYNA-CMR-2026-${seed}-${randomSuffix}`;
}

export function generateCustomsSealNumber(): string {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `AZ-CUSTOMS-${digits}`;
}

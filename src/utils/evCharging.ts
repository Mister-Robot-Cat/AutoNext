import { Currency } from '../types/vehicle';
import { 
  ChargingStation, 
  ConnectorType, 
  EvOperator, 
  EvChargingCalculationRequest, 
  EvChargingCalculationResult, 
  ChargingStageBreakdown,
  EvRouteTripPlan,
  EvChargingSessionReceipt
} from '../types/evCharging';

// Exchange rates consistent across AutoNext platform
const USD_RATE = 1.70;
const EUR_RATE = 1.85;

export function convertCurrency(aznAmount: number, targetCurrency: Currency): number {
  if (targetCurrency === 'USD') {
    return Math.round((aznAmount / USD_RATE) * 100) / 100;
  }
  if (targetCurrency === 'EUR') {
    return Math.round((aznAmount / EUR_RATE) * 100) / 100;
  }
  return Math.round(aznAmount * 100) / 100;
}

export function formatEvPower(kw: number): string {
  return `${Math.round(kw)} kW`;
}

export function getConnectorBadge(type: ConnectorType): { label: string; color: string; desc: string } {
  switch (type) {
    case 'ccs2':
      return { 
        label: 'CCS 2', 
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', 
        desc: 'Avropa standartı DC Sürətli (Tesla, Porsche, Hyundai, VAG)' 
      };
    case 'gbt_dc':
      return { 
        label: 'GB/T DC', 
        color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', 
        desc: 'Çin milli standartı DC Sürətli (BYD, Zeekr, Li Auto, Changan)' 
      };
    case 'type2':
      return { 
        label: 'Type 2', 
        color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', 
        desc: 'Mennekes AC Standart (7 - 22 kW divar və ictimai şarj)' 
      };
    case 'chademo':
      return { 
        label: 'CHAdeMO', 
        color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', 
        desc: 'Yapon standartı DC Sürətli (Nissan Leaf)' 
      };
    case 'tesla_nacs':
      return { 
        label: 'NACS / Tesla', 
        color: 'bg-rose-500/20 text-rose-400 border-rose-500/30', 
        desc: 'Şimali Amerika Tesla standartı' 
      };
    default:
      return { 
        label: type, 
        color: 'bg-slate-700 text-slate-300 border-slate-600', 
        desc: 'Standart konnektor' 
      };
  }
}

/**
 * Calculates EV charging session metrics considering BMS thermal tapering and battery chemistry.
 */
export function calculateChargingSession(
  req: EvChargingCalculationRequest
): EvChargingCalculationResult {
  const {
    batteryCapacityKwh,
    currentSocPercent,
    targetSocPercent,
    chargerPowerKw,
    maxVehicleAcceptanceKw,
    tariffPerKwhAzn,
    currency,
    is800VArchitecture = false,
  } = req;

  // Edge case: target SoC lower than or equal to current SoC
  if (targetSocPercent <= currentSocPercent || batteryCapacityKwh <= 0) {
    return {
      energyNeededKwh: 0,
      estimatedMinutes: 0,
      effectiveAveragePowerKw: 0,
      addedRangeKm: 0,
      costAzn: 0,
      costConverted: 0,
      petrolSavingsAzn: 0,
      co2SavedKg: 0,
      chargingStages: [],
    };
  }

  const effectiveMaxPower = Math.min(
    Math.max(1, chargerPowerKw), 
    Math.max(1, maxVehicleAcceptanceKw)
  );

  const chargingStages: ChargingStageBreakdown[] = [];
  let totalMinutes = 0;
  let totalEnergyDelivered = 0;

  // Stages define BMS thermal and chemical throttling intervals
  const stageDefs = [
    { 
      from: 0, 
      to: 60, 
      powerMultiplier: 1.0, 
      label: 'Sürətli Faz (0-60%)' 
    },
    { 
      from: 60, 
      to: 80, 
      powerMultiplier: is800VArchitecture ? 0.90 : 0.82, 
      label: 'Termal Tənzimləmə (60-80%)' 
    },
    { 
      from: 80, 
      to: 90, 
      powerMultiplier: is800VArchitecture ? 0.60 : 0.48, 
      label: 'BMS Qorunma (80-90%)' 
    },
    { 
      from: 90, 
      to: 100, 
      powerMultiplier: 0.22, 
      label: 'Balanslaşdırma (90-100%)' 
    },
  ];

  const chargingEfficiency = 0.92; // 92% inverter and thermal efficiency

  for (const stage of stageDefs) {
    const stageStart = Math.max(currentSocPercent, stage.from);
    const stageEnd = Math.min(targetSocPercent, stage.to);

    if (stageEnd > stageStart) {
      const deltaSoc = stageEnd - stageStart;
      const stageEnergy = (deltaSoc / 100) * batteryCapacityKwh;
      const energyDrawnFromGrid = stageEnergy / chargingEfficiency;
      
      let stagePower = effectiveMaxPower * stage.powerMultiplier;
      // AC chargers (<=22kW) do not suffer high DC BMS taper
      if (effectiveMaxPower <= 22) {
        stagePower = effectiveMaxPower;
      } else if (stage.from >= 90) {
        stagePower = Math.min(stagePower, 18); // maximum trickle cap
      }

      stagePower = Math.max(stagePower, 2.3); // Minimum home wallbox power
      const stageHours = energyDrawnFromGrid / stagePower;
      const stageMins = stageHours * 60;

      totalEnergyDelivered += energyDrawnFromGrid;
      totalMinutes += stageMins;

      chargingStages.push({
        socRange: `${stageStart}% - ${stageEnd}%`,
        powerKw: Math.round(stagePower * 10) / 10,
        durationMinutes: Math.round(stageMins),
        energyKwh: Math.round(energyDrawnFromGrid * 10) / 10,
      });
    }
  }

  const roundedMinutes = Math.max(1, Math.round(totalMinutes));
  const roundedEnergy = Math.round(totalEnergyDelivered * 10) / 10;
  const avgPower = roundedMinutes > 0 ? (roundedEnergy / (roundedMinutes / 60)) : 0;

  // Added range assuming typical modern EV consumption of 16 kWh / 100km
  const addedRangeKm = Math.round(((targetSocPercent - currentSocPercent) / 100) * batteryCapacityKwh * (100 / 16));

  const costAzn = Math.round(roundedEnergy * tariffPerKwhAzn * 100) / 100;
  const costConverted = convertCurrency(costAzn, currency);

  // Petrol comparison: Petrol vehicle with 8.0 L/100km at 2.00 AZN/L (AI-95 Premium) = 0.16 AZN/km
  const petrolEquivalentCostAzn = Math.round(addedRangeKm * 0.16 * 100) / 100;
  const petrolSavingsAzn = Math.max(0, Math.round((petrolEquivalentCostAzn - costAzn) * 100) / 100);

  // CO2 savings: Petrol car emits ~160g/km, net electric saves ~115g/km
  const co2SavedKg = Math.round((addedRangeKm * 0.115) * 10) / 10;

  return {
    energyNeededKwh: roundedEnergy,
    estimatedMinutes: roundedMinutes,
    effectiveAveragePowerKw: Math.round(avgPower * 10) / 10,
    addedRangeKm,
    costAzn,
    costConverted,
    petrolSavingsAzn,
    co2SavedKg,
    chargingStages,
  };
}

/**
 * Filter stations by search term, connector, operator, power, and availability
 */
export function filterStations(
  stations: ChargingStation[],
  filters: {
    query?: string;
    connector?: ConnectorType | 'all';
    operator?: EvOperator | 'all';
    fastOnly?: boolean;
    availableOnly?: boolean;
  }
): ChargingStation[] {
  return stations.filter((station) => {
    // Search query match
    if (filters.query && filters.query.trim()) {
      const q = filters.query.toLowerCase().trim();
      const matchName = station.name.toLowerCase().includes(q);
      const matchAddress = station.address.toLowerCase().includes(q);
      const matchDistrict = station.district.toLowerCase().includes(q);
      const matchOperator = station.operatorName.toLowerCase().includes(q);
      if (!matchName && !matchAddress && !matchDistrict && !matchOperator) {
        return false;
      }
    }

    // Connector type match
    if (filters.connector && filters.connector !== 'all') {
      const hasConnector = station.connectors.some(
        (c) => c.type === filters.connector
      );
      if (!hasConnector) return false;
    }

    // Operator match
    if (filters.operator && filters.operator !== 'all') {
      if (station.operator !== filters.operator) return false;
    }

    // Fast charging only (>= 90 kW)
    if (filters.fastOnly) {
      const hasFast = station.connectors.some((c) => c.maxPowerKw >= 90);
      if (!hasFast) return false;
    }

    // Available only
    if (filters.availableOnly) {
      const hasFreeConnector = station.connectors.some((c) => c.availableCount > 0);
      if (!hasFreeConnector || station.status === 'offline') return false;
    }

    return true;
  });
}

/**
 * Evaluates whether an EV can complete a given route without charging or needs charging stops
 */
export function calculateRouteReachability(
  batteryCapacityKwh: number,
  currentSocPercent: number,
  route: EvRouteTripPlan,
  consumptionKwhPer100Km: number = 16.5
): {
  canReachDirectly: boolean;
  remainingSocPercent: number;
  consumedKwh: number;
  needsChargingStop: boolean;
  suggestedStopStationName?: string;
} {
  const consumedKwh = (route.distanceKm / 100) * consumptionKwhPer100Km;
  const currentAvailableKwh = (currentSocPercent / 100) * batteryCapacityKwh;
  const remainingKwh = currentAvailableKwh - consumedKwh;
  const remainingSocPercent = Math.round((remainingKwh / batteryCapacityKwh) * 100);

  const canReachDirectly = remainingSocPercent >= 15; // Safe reserve buffer of 15%
  const needsChargingStop = !canReachDirectly;

  return {
    canReachDirectly,
    remainingSocPercent: Math.max(0, remainingSocPercent),
    consumedKwh: Math.round(consumedKwh * 10) / 10,
    needsChargingStop,
    suggestedStopStationName: route.recommendedStops[0]?.stationName,
  };
}

/**
 * Generates an official digital charging voucher / receipt
 */
export function generateChargingReceipt(params: {
  station: ChargingStation;
  connectorType: ConnectorType;
  startSoc: number;
  endSoc: number;
  energyKwh: number;
  durationMinutes: number;
  maxPowerKw: number;
  tariffPerKwhAzn: number;
  currency: Currency;
  carPlate?: string;
  authMethod?: 'app_wallet' | 'rfid_card' | 'bank_card' | 'apple_pay';
}): EvChargingSessionReceipt {
  const {
    station,
    connectorType,
    startSoc,
    endSoc,
    energyKwh,
    durationMinutes,
    maxPowerKw,
    tariffPerKwhAzn,
    currency,
    carPlate = '10-EV-808',
    authMethod = 'app_wallet',
  } = params;

  const totalAzn = Math.round(energyKwh * tariffPerKwhAzn * 100) / 100;
  const vatAzn = Math.round((totalAzn * (18 / 118)) * 100) / 100; // 18% standard VAT in Azerbaijan
  const subtotalAzn = Math.round((totalAzn - vatAzn) * 100) / 100;
  const totalConverted = convertCurrency(totalAzn, currency);

  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const now = new Date();
  const dateFormatted = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 8)}`;

  return {
    sessionId: `TB-AZ-2026-${randomNum}`,
    stationName: station.name,
    stationAddress: station.address,
    operatorName: station.operatorName,
    dateTime: dateFormatted,
    connectorType,
    startSoc,
    endSoc,
    energyDeliveredKwh: Math.round(energyKwh * 10) / 10,
    durationMinutes,
    maxPowerKw,
    averagePowerKw: durationMinutes > 0 ? Math.round((energyKwh / (durationMinutes / 60)) * 10) / 10 : maxPowerKw,
    subtotalAzn,
    vatAzn,
    totalAzn,
    totalConverted,
    currency,
    authMethod,
    carPlate,
    qrVerificationCode: `VERIFY-EV-AZ-${randomNum}-OK`,
  };
}

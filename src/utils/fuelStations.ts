import { Currency } from '../types/vehicle';
import { 
  FuelGrade, 
  FuelStationBrand, 
  StationAmenity, 
  FuelStation, 
  TripFuelOptions, 
  TripFuelResult, 
  FullTankResult, 
  CashbackProvider, 
  FuelVoucher 
} from '../types/fuel';
import { CURRENCY_RATES } from './i18n';

/**
 * Official Azerbaijan State Tariff Council (Tarif Şurası) regulated and market reference fuel prices in AZN
 */
export const TARIF_SURASI_PRICES: Record<FuelGrade, number> = {
  ai92: 1.10,     // State regulated Aİ-92
  diesel: 1.00,   // State regulated Diesel
  ai95: 1.60,     // Premium Euro-5 imported
  ai98: 2.30,     // Super Euro-6 imported
  cng: 0.45,      // Compressed natural gas per m³
  lpg: 0.65,      // Liquefied petroleum gas per liter
  electric: 0.11, // Standard EV rate per kWh
};

export const FUEL_DISPLAY_NAMES: Record<FuelGrade, string> = {
  ai92: 'Aİ-92 Mütəşəkkil Benzin',
  ai95: 'Aİ-95 Premium Euro-5',
  ai98: 'Aİ-98 Super Euro-6',
  diesel: 'Dizel Yanacağı Euro-5',
  cng: 'CNG Sıxılmış Təbii Qaz',
  lpg: 'LPG Mayeləşdirilmiş Qaz',
  electric: 'Elektrik Enerjisi (TokBaku)',
};

export const AMENITY_LABELS: Record<StationAmenity, { az: string; icon: string }> = {
  market24: { az: '24/7 Supermarket', icon: 'Store' },
  carWash: { az: 'Avtoyuma / Car Wash', icon: 'Sparkles' },
  tireAir: { az: 'Təkər Havası & Su', icon: 'Gauge' },
  cafe: { az: 'Kofe & Fast Food', icon: 'Coffee' },
  mosque: { az: 'İbadət Otağı / Məscid', icon: 'Building' },
  atm: { az: 'Bankomat (ATM)', icon: 'CreditCard' },
  evFastCharge: { az: 'EV Sürətli Doldurma', icon: 'Zap' },
  wc: { az: 'Sanitar Qovşağı', icon: 'CheckCircle' },
};

/**
 * Map vehicle fuel type to appropriate default fuel grade
 */
export function mapVehicleFuelTypeToGrade(fuelType: string, engineVolumeLiters: number = 2.0): FuelGrade {
  switch (fuelType) {
    case 'diesel':
      return 'diesel';
    case 'electric':
      return 'electric';
    case 'plug_in_hybrid':
      return 'ai95';
    case 'hybrid':
      return 'ai92';
    case 'petrol':
    default:
      // High performance engines usually require Premium AI-95
      return engineVolumeLiters >= 3.0 ? 'ai95' : 'ai92';
  }
}

/**
 * Get official fuel price converted to target currency
 */
export function getOfficialFuelPrice(grade: FuelGrade, currency: Currency = 'AZN'): number {
  const priceAzn = TARIF_SURASI_PRICES[grade] ?? 1.10;
  if (currency === 'AZN') return priceAzn;
  const rate = CURRENCY_RATES[currency] || 1;
  return Number((priceAzn / rate).toFixed(2));
}

/**
 * Calculate Azerbaijan Tax Ministry VAT and Cashless "ƏDV Geri Al" Refund
 * - Standard VAT: 18% embedded in retail price
 * - Cashless consumer refund: 17.5% of total VAT amount
 */
export function calculateEdvRefund(amountAzn: number): { vatAmountAzn: number; edvRefundAzn: number } {
  if (amountAzn <= 0) {
    return { vatAmountAzn: 0, edvRefundAzn: 0 };
  }
  // Total = Base * 1.18 -> Base = Total / 1.18 -> VAT = Total - Base
  const baseAmount = amountAzn / 1.18;
  const vatAmountAzn = Number((amountAzn - baseAmount).toFixed(2));
  const edvRefundAzn = Number((vatAmountAzn * 0.175).toFixed(2));

  return { vatAmountAzn, edvRefundAzn };
}

/**
 * Calculate cashback according to popular Azerbaijan banking partner rules
 */
export function calculateCashback(
  amountAzn: number, 
  provider: CashbackProvider = 'birbank'
): { cashbackAzn: number; ratePercent: number; providerName: string } {
  if (amountAzn <= 0) {
    return { cashbackAzn: 0, ratePercent: 0, providerName: 'Nağd' };
  }

  switch (provider) {
    case 'birbank': {
      // Birbank Kapital: 5% up to 30 AZN cap per transaction
      const raw = amountAzn * 0.05;
      return {
        cashbackAzn: Number(Math.min(30, raw).toFixed(2)),
        ratePercent: 5,
        providerName: 'Kapital Bank Birbank (5%)'
      };
    }
    case 'tamkart': {
      // TamKart ABB: 4% up to 25 AZN
      const raw = amountAzn * 0.04;
      return {
        cashbackAzn: Number(Math.min(25, raw).toFixed(2)),
        ratePercent: 4,
        providerName: 'ABB TamKart (4%)'
      };
    }
    case 'leobank': {
      // Leobank: 3% unlimited
      return {
        cashbackAzn: Number((amountAzn * 0.03).toFixed(2)),
        ratePercent: 3,
        providerName: 'Leobank (3%)'
      };
    }
    case 'socar_club': {
      // SOCAR Club Card: 1.5% points + bonus
      return {
        cashbackAzn: Number((amountAzn * 0.015).toFixed(2)),
        ratePercent: 1.5,
        providerName: 'SOCAR Club Kart (1.5%)'
      };
    }
    case 'azpetrol_red': {
      // Azpetrol Red Card: 1.0% loyalty points
      return {
        cashbackAzn: Number((amountAzn * 0.01).toFixed(2)),
        ratePercent: 1.0,
        providerName: 'Azpetrol Qırmızı Kart (1.0%)'
      };
    }
    default:
      return { cashbackAzn: 0, ratePercent: 0, providerName: 'Standart' };
  }
}

/**
 * Calculate realistic trip fuel consumption and cost across Azerbaijan routes
 */
export function calculateTripFuel(
  routeKm: number,
  baseConsumptionLPer100Km: number,
  fuelGrade: FuelGrade,
  options: TripFuelOptions,
  currency: Currency = 'AZN',
  cashbackProvider: CashbackProvider = 'birbank'
): TripFuelResult {
  const safeBaseConsumption = baseConsumptionLPer100Km > 0 ? baseConsumptionLPer100Km : 8.0;

  // Environmental and dynamic driving adjustments
  const acMultiplier = options.withAC ? 1.10 : 1.0;
  const passengerMultiplier = 1.0 + Math.max(0, options.passengerCount - 1) * 0.03;
  const trafficMultiplier = 1.0 + Math.min(1, Math.max(0, options.cityTrafficRatio)) * 0.25;
  const cargoMultiplier = 1.0 + Math.min(0.15, (Math.max(0, options.cargoWeightKg) / 100) * 0.015);

  const effectiveConsumptionLPer100Km = Number(
    (safeBaseConsumption * acMultiplier * passengerMultiplier * trafficMultiplier * cargoMultiplier).toFixed(2)
  );

  const litersNeeded = Number(((routeKm * effectiveConsumptionLPer100Km) / 100).toFixed(2));
  const pricePerLiterAzn = TARIF_SURASI_PRICES[fuelGrade] ?? 1.10;
  const costAzn = Number((litersNeeded * pricePerLiterAzn).toFixed(2));

  // Currency rate
  const rate = CURRENCY_RATES[currency] || 1;
  const costTargetCurrency = Number((costAzn / rate).toFixed(2));

  // CO2 Emissions (kg): Petrol ~2.31, Diesel ~2.68, CNG ~0.20, EV = 0
  let co2Factor = 2.31;
  if (fuelGrade === 'diesel') co2Factor = 2.68;
  else if (fuelGrade === 'cng') co2Factor = 0.20;
  else if (fuelGrade === 'electric') co2Factor = 0;
  const co2Kg = Number((litersNeeded * co2Factor).toFixed(1));

  // Stops calculation (assuming avg fuel tank of 55L, needing a stop when remaining is low)
  const stopsNeeded = Math.max(0, Math.floor(litersNeeded / 50));

  const { edvRefundAzn } = calculateEdvRefund(costAzn);
  const { cashbackAzn } = calculateCashback(costAzn, cashbackProvider);

  return {
    litersNeeded,
    costAzn,
    costTargetCurrency,
    fuelGrade,
    pricePerLiterAzn,
    cashbackAmountAzn: cashbackAzn,
    edvRefundAzn,
    co2Kg,
    stopsNeeded,
    effectiveConsumptionLPer100Km,
  };
}

/**
 * Calculate full tank replenishment metrics
 */
export function calculateFullTank(
  tankCapacityL: number,
  currentLevelPercent: number,
  fuelGrade: FuelGrade,
  consumptionLPer100Km: number,
  currency: Currency = 'AZN',
  provider: CashbackProvider = 'birbank'
): FullTankResult {
  const safeCapacity = Math.max(20, tankCapacityL);
  const clampedPercent = Math.min(95, Math.max(0, currentLevelPercent));
  const missingLiters = Number((safeCapacity * (1 - clampedPercent / 100)).toFixed(2));

  const pricePerLiterAzn = TARIF_SURASI_PRICES[fuelGrade] ?? 1.10;
  const totalCostAzn = Number((missingLiters * pricePerLiterAzn).toFixed(2));

  const rate = CURRENCY_RATES[currency] || 1;
  const totalCostTargetCurrency = Number((totalCostAzn / rate).toFixed(2));

  const safeConsumption = consumptionLPer100Km > 0 ? consumptionLPer100Km : 8.0;
  const fullTankRangeKm = Math.round((safeCapacity / safeConsumption) * 100);

  const { edvRefundAzn } = calculateEdvRefund(totalCostAzn);
  const { cashbackAzn } = calculateCashback(totalCostAzn, provider);

  return {
    missingLiters,
    totalCostAzn,
    totalCostTargetCurrency,
    fullTankRangeKm,
    cashbackAzn,
    edvRefundAzn,
  };
}

/**
 * Filter fuel stations based on search queries, brands, fuel availability, and amenities
 */
export function filterStations(
  stations: FuelStation[],
  options: {
    query?: string;
    brand?: FuelStationBrand | 'All';
    fuelGrade?: FuelGrade | 'All';
    amenity?: StationAmenity | 'All';
    only24Hours?: boolean;
  }
): FuelStation[] {
  return stations.filter((station) => {
    if (options.brand && options.brand !== 'All' && station.brand !== options.brand) {
      return false;
    }

    if (options.only24Hours && !station.isOpen24Hours) {
      return false;
    }

    if (options.fuelGrade && options.fuelGrade !== 'All') {
      const hasFuel = station.fuels.some((f) => f.grade === options.fuelGrade && f.inStock);
      if (!hasFuel) return false;
    }

    if (options.amenity && options.amenity !== 'All') {
      if (!station.amenities.includes(options.amenity)) {
        return false;
      }
    }

    if (options.query && options.query.trim() !== '') {
      const q = options.query.toLowerCase().trim();
      const matchName = station.name.toLowerCase().includes(q);
      const matchAddr = station.address.toLowerCase().includes(q);
      const matchDistrict = station.district.toLowerCase().includes(q);
      const matchBrand = station.brand.toLowerCase().includes(q);
      if (!matchName && !matchAddr && !matchDistrict && !matchBrand) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Generate an authentic fiscal e-voucher receipt for fuel purchase
 */
export function generateFuelVoucher(
  station: FuelStation,
  vehicleTitle: string,
  vehiclePlate: string,
  fuelGrade: FuelGrade,
  volumeLiters: number,
  currency: Currency = 'AZN',
  cashbackProvider: CashbackProvider = 'birbank'
): FuelVoucher {
  const safeLiters = Math.max(1, volumeLiters);
  const unitPriceAzn = TARIF_SURASI_PRICES[fuelGrade] ?? 1.10;
  const totalAzn = Number((safeLiters * unitPriceAzn).toFixed(2));
  const { vatAmountAzn, edvRefundAzn } = calculateEdvRefund(totalAzn);
  const { cashbackAzn, providerName } = calculateCashback(totalAzn, cashbackProvider);

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const date = new Date();
  const dateIso = date.toISOString();
  const brandPrefix = station.brand.toUpperCase();
  const voucherCode = `${brandPrefix}-AZ-2026-${randomNum}`;
  const securityHash = `AZ-EDV-${Math.floor(100000 + Math.random() * 900000)}`;

  const fuelName = FUEL_DISPLAY_NAMES[fuelGrade] || 'Aİ-92 Benzin';

  return {
    voucherCode,
    securityHash,
    stationName: station.name,
    stationBrand: station.brand,
    stationAddress: station.address,
    vehicleTitle: vehicleTitle || 'AutoNext Avtomobil',
    vehiclePlate: vehiclePlate || '99-XX-999',
    fuelGrade,
    fuelName,
    volumeLiters: safeLiters,
    unitPriceAzn,
    totalAzn,
    vatAmountAzn,
    edvRefundAzn,
    cashbackAzn,
    cashbackProviderName: providerName,
    dateIso,
    qrTelemetry: `https://edvgerial.az/check?receipt=${voucherCode}&sec=${securityHash}&sum=${totalAzn}`,
    currency,
  };
}

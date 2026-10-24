import {
  BusRoute,
  BusSeat,
  BusComfortTier,
  TicketCalculationInput,
  TicketCalculationResult,
  IntercityETicket,
} from '../types/intercityBus';

export const USD_TO_AZN = 1.70;
export const EUR_TO_AZN = 1.85;

export const PASSENGER_INSURANCE_AZN = 0.30;
export const TERMINAL_PLATFORM_FEE_AZN = 0.50;
export const EXCESS_LUGGAGE_PER_KG_AZN = 0.05;
export const EXTRA_LUGGAGE_BAG_AZN = 2.00;

export function convertAznToCurrency(amountAzn: number, currency: 'AZN' | 'USD' | 'EUR'): number {
  if (currency === 'AZN') return Number(amountAzn.toFixed(2));
  if (currency === 'USD') return Number((amountAzn / USD_TO_AZN).toFixed(2));
  if (currency === 'EUR') return Number((amountAzn / EUR_TO_AZN).toFixed(2));
  return Number(amountAzn.toFixed(2));
}

export function calculateTicketPrice(
  input: TicketCalculationInput,
  routes: BusRoute[]
): TicketCalculationResult {
  const route = routes.find((r) => r.id === input.routeId) || routes[0];
  
  // Base fare per passenger based on route base fare and comfort tier
  let tierMultiplier = 1.0;
  if (input.comfortTier === 'comfort_express') {
    tierMultiplier = 1.15;
  } else if (input.comfortTier === 'vip_business') {
    tierMultiplier = 1.35;
  }

  const singleBaseFare = Number((route.baseFareAzn * tierMultiplier).toFixed(2));
  const adultsTotalAzn = Number((singleBaseFare * Math.max(0, input.adultsCount)).toFixed(2));
  
  // 50% discount for children (Article 22 Law on Automobile Transport)
  const singleChildFare = Number((singleBaseFare * 0.5).toFixed(2));
  const childrenTotalAzn = Number((singleChildFare * Math.max(0, input.childrenCount)).toFixed(2));
  
  // Infants < 5 are free without separate seat
  const infantsTotalAzn = 0;

  const totalPayingPassengers = Math.max(0, input.adultsCount) + Math.max(0, input.childrenCount);
  
  // Mandatory Passenger Insurance (0.30 AZN per seated ticket)
  const insuranceFeeAzn = Number((PASSENGER_INSURANCE_AZN * totalPayingPassengers).toFixed(2));
  
  // Terminal Platform Fee (0.50 AZN per paying passenger)
  const terminalPlatformFeeAzn = Number((TERMINAL_PLATFORM_FEE_AZN * totalPayingPassengers).toFixed(2));

  // Excess luggage calculation
  const safeExcessKg = Math.max(0, input.excessLuggageKg);
  const safeExtraBags = Math.max(0, input.extraBagsCount);
  const luggageSurchargeAzn = Number(
    (safeExcessKg * EXCESS_LUGGAGE_PER_KG_AZN + safeExtraBags * EXTRA_LUGGAGE_BAG_AZN).toFixed(2)
  );

  const subtotalAzn = Number((adultsTotalAzn + childrenTotalAzn).toFixed(2));
  const totalAzn = Number(
    (subtotalAzn + insuranceFeeAzn + terminalPlatformFeeAzn + luggageSurchargeAzn).toFixed(2)
  );

  const totalUsd = convertAznToCurrency(totalAzn, 'USD');
  const totalEur = convertAznToCurrency(totalAzn, 'EUR');

  const perPassengerAverageAzn = totalPayingPassengers > 0
    ? Number((totalAzn / totalPayingPassengers).toFixed(2))
    : totalAzn;

  return {
    baseFareAzn: singleBaseFare,
    adultsTotalAzn,
    childrenTotalAzn,
    infantsTotalAzn,
    insuranceFeeAzn,
    terminalPlatformFeeAzn,
    luggageSurchargeAzn,
    subtotalAzn,
    totalAzn,
    totalUsd,
    totalEur,
    perPassengerAverageAzn,
  };
}

export function generateBusSeats(totalSeats: number, occupiedSeed = 13): BusSeat[] {
  const seats: BusSeat[] = [];
  const rows = Math.ceil(totalSeats / 4);
  let seatNum = 1;

  for (let r = 1; r <= rows; r++) {
    const cols: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
    for (const col of cols) {
      if (seatNum > totalSeats) break;
      
      // Deterministic occupancy pattern for realistic simulation
      const isOccupied = (seatNum * occupiedSeed) % 7 === 0 || seatNum === 3 || seatNum === 8 || seatNum === 17;
      const isWindow = col === 'A' || col === 'D';
      const isEmergencyExit = r === Math.floor(rows / 2) || (r === rows && (col === 'C' || col === 'D'));

      seats.push({
        seatNumber: seatNum,
        row: r,
        column: col,
        isAvailable: !isOccupied,
        isWindow,
        isEmergencyExit,
      });

      seatNum++;
    }
  }

  return seats;
}

export function generateETicket(
  route: BusRoute,
  passenger: {
    fullName: string;
    finCode: string;
    phone: string;
    seatNumber: number;
    departureDate: string;
    departureTime: string;
    comfortTier: BusComfortTier;
    extraBags: number;
    excessKg: number;
  },
  currency: 'AZN' | 'USD' | 'EUR' = 'AZN'
): IntercityETicket {
  const calculation = calculateTicketPrice(
    {
      routeId: route.id,
      comfortTier: passenger.comfortTier,
      adultsCount: 1,
      childrenCount: 0,
      infantsCount: 0,
      excessLuggageKg: passenger.excessKg,
      extraBagsCount: passenger.extraBags,
      selectedCurrency: currency,
    },
    [route]
  );

  const randomSeq = Math.floor(10000 + Math.random() * 90000);
  const ticketNumber = `AYNA-SRN-2026-${randomSeq}`;
  
  // Deterministic hex checksum
  const hashSource = `${ticketNumber}|${passenger.finCode}|${route.routeCode}|${passenger.seatNumber}`;
  let hashVal = 0;
  for (let i = 0; i < hashSource.length; i++) {
    hashVal = (hashVal << 5) - hashVal + hashSource.charCodeAt(i);
    hashVal |= 0;
  }
  const securityChecksum = Math.abs(hashVal).toString(16).toUpperCase().padStart(16, '0');

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 5);

  const qrData = `AYNA-BBIQ|${ticketNumber}|${route.routeCode}|${passenger.finCode}|${passenger.seatNumber}|${calculation.totalAzn}AZN|AUTH`;

  // Determine platform number: derive from route code or first char
  const platformNumber = ((route.routeCode.charCodeAt(route.routeCode.length - 1) % 6) + 1);

  return {
    ticketNumber,
    routeCode: route.routeCode,
    originCity: route.originCity,
    destinationCity: route.destinationCity,
    departureTerminal: route.departureTerminal,
    arrivalTerminal: route.destinationTerminal,
    departureDate: passenger.departureDate,
    departureTime: passenger.departureTime,
    platformNumber,
    seatNumber: passenger.seatNumber,
    passengerName: passenger.fullName,
    passengerFin: passenger.finCode.toUpperCase(),
    passengerPhone: passenger.phone,
    busPlate: route.busPlate,
    busModel: route.busModel,
    operatorName: route.operatorName,
    routePassportNumber: route.routePassportNumber,
    fareAzn: calculation.baseFareAzn,
    insuranceAzn: calculation.insuranceFeeAzn,
    terminalFeeAzn: calculation.terminalPlatformFeeAzn,
    luggageFeeAzn: calculation.luggageSurchargeAzn,
    totalAzn: calculation.totalAzn,
    currency,
    totalPaidConverted: convertAznToCurrency(calculation.totalAzn, currency),
    securityChecksum,
    issuedAt: `${dateStr} ${timeStr}`,
    qrData,
    status: 'active',
  };
}

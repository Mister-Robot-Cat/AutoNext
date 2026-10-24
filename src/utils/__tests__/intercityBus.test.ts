import { describe, it, expect } from 'vitest';
import {
  convertAznToCurrency,
  calculateTicketPrice,
  generateBusSeats,
  generateETicket,
  PASSENGER_INSURANCE_AZN,
  TERMINAL_PLATFORM_FEE_AZN,
  USD_TO_AZN,
  EUR_TO_AZN,
} from '../intercityBus';
import { MOCK_BUS_ROUTES } from '../../data/mockIntercityBusData';

describe('intercityBus utility tests', () => {
  it('converts AZN to USD and EUR correctly', () => {
    expect(convertAznToCurrency(17, 'AZN')).toBe(17);
    expect(convertAznToCurrency(17, 'USD')).toBe(Number((17 / USD_TO_AZN).toFixed(2)));
    expect(convertAznToCurrency(18.5, 'EUR')).toBe(Number((18.5 / EUR_TO_AZN).toFixed(2)));
  });

  it('calculates standard ticket price for 1 adult correctly', () => {
    const route = MOCK_BUS_ROUTES[0]; // Baku - Ganja, baseFare 13.5
    const result = calculateTicketPrice(
      {
        routeId: route.id,
        comfortTier: 'standard',
        adultsCount: 1,
        childrenCount: 0,
        infantsCount: 0,
        excessLuggageKg: 0,
        extraBagsCount: 0,
        selectedCurrency: 'AZN',
      },
      MOCK_BUS_ROUTES
    );

    expect(result.baseFareAzn).toBe(13.5);
    expect(result.adultsTotalAzn).toBe(13.5);
    expect(result.childrenTotalAzn).toBe(0);
    expect(result.insuranceFeeAzn).toBe(PASSENGER_INSURANCE_AZN);
    expect(result.terminalPlatformFeeAzn).toBe(TERMINAL_PLATFORM_FEE_AZN);
    expect(result.luggageSurchargeAzn).toBe(0);
    // 13.5 + 0.30 + 0.50 = 14.30
    expect(result.totalAzn).toBe(14.3);
  });

  it('calculates 50% discount for children and free infants', () => {
    const route = MOCK_BUS_ROUTES[0]; // 13.5 base
    const result = calculateTicketPrice(
      {
        routeId: route.id,
        comfortTier: 'standard',
        adultsCount: 2,
        childrenCount: 1,
        infantsCount: 1,
        excessLuggageKg: 0,
        extraBagsCount: 0,
        selectedCurrency: 'AZN',
      },
      MOCK_BUS_ROUTES
    );

    // 2 adults: 2 * 13.5 = 27.0
    expect(result.adultsTotalAzn).toBe(27.0);
    // 1 child (50%): 13.5 * 0.5 = 6.75
    expect(result.childrenTotalAzn).toBe(6.75);
    // 0 for infants
    expect(result.infantsTotalAzn).toBe(0);
    // Total paying passengers = 3 (2 adults + 1 child)
    expect(result.insuranceFeeAzn).toBe(Number((PASSENGER_INSURANCE_AZN * 3).toFixed(2)));
    expect(result.terminalPlatformFeeAzn).toBe(Number((TERMINAL_PLATFORM_FEE_AZN * 3).toFixed(2)));
    // Subtotal: 27 + 6.75 = 33.75
    // Fees: 0.90 + 1.50 = 2.40
    // Total: 36.15
    expect(result.totalAzn).toBe(36.15);
  });

  it('applies comfort tier multipliers correctly', () => {
    const route = MOCK_BUS_ROUTES[0]; // base 13.5

    const expressResult = calculateTicketPrice(
      {
        routeId: route.id,
        comfortTier: 'comfort_express', // 1.15x
        adultsCount: 1,
        childrenCount: 0,
        infantsCount: 0,
        excessLuggageKg: 0,
        extraBagsCount: 0,
        selectedCurrency: 'AZN',
      },
      MOCK_BUS_ROUTES
    );
    // 13.5 * 1.15 = 15.525 (JS float: 15.52)
    expect(expressResult.baseFareAzn).toBe(15.52);

    const vipResult = calculateTicketPrice(
      {
        routeId: route.id,
        comfortTier: 'vip_business', // 1.35x
        adultsCount: 1,
        childrenCount: 0,
        infantsCount: 0,
        excessLuggageKg: 0,
        extraBagsCount: 0,
        selectedCurrency: 'AZN',
      },
      MOCK_BUS_ROUTES
    );
    // 13.5 * 1.35 = 18.225 -> 18.23
    expect(vipResult.baseFareAzn).toBe(18.23);
  });

  it('calculates luggage surcharges accurately', () => {
    const route = MOCK_BUS_ROUTES[0];
    const result = calculateTicketPrice(
      {
        routeId: route.id,
        comfortTier: 'standard',
        adultsCount: 1,
        childrenCount: 0,
        infantsCount: 0,
        excessLuggageKg: 10, // 10 * 0.05 = 0.50 AZN
        extraBagsCount: 2,   // 2 * 2.00 = 4.00 AZN
        selectedCurrency: 'AZN',
      },
      MOCK_BUS_ROUTES
    );

    expect(result.luggageSurchargeAzn).toBe(4.5);
    // 13.5 + 0.30 + 0.50 + 4.50 = 18.80
    expect(result.totalAzn).toBe(18.8);
  });

  it('generates bus seats layout with correct dimensions and properties', () => {
    const seats = generateBusSeats(48, 13);
    expect(seats).toHaveLength(48);

    const seat1 = seats[0];
    expect(seat1.seatNumber).toBe(1);
    expect(seat1.column).toBe('A');
    expect(seat1.isWindow).toBe(true);

    const seat2 = seats[1];
    expect(seat2.seatNumber).toBe(2);
    expect(seat2.column).toBe('B');
    expect(seat2.isWindow).toBe(false);

    const seat48 = seats[47];
    expect(seat48.seatNumber).toBe(48);
    expect(seat48.column).toBe('D');
    expect(seat48.isWindow).toBe(true);
  });

  it('generates an authentic electronic ticket with required fields', () => {
    const route = MOCK_BUS_ROUTES[0];
    const ticket = generateETicket(
      route,
      {
        fullName: 'Kamran Əliyev',
        finCode: '7A1B2C3',
        phone: '+994 50 111 22 33',
        seatNumber: 15,
        departureDate: '2026-10-25',
        departureTime: '11:30',
        comfortTier: 'comfort_express',
        extraBags: 1,
        excessKg: 5,
      },
      'AZN'
    );

    expect(ticket.ticketNumber).toMatch(/^AYNA-SRN-2026-\d{5}$/);
    expect(ticket.routeCode).toBe('M-01');
    expect(ticket.passengerName).toBe('Kamran Əliyev');
    expect(ticket.passengerFin).toBe('7A1B2C3');
    expect(ticket.seatNumber).toBe(15);
    expect(ticket.securityChecksum).toBeDefined();
    expect(ticket.qrData).toContain('AYNA-BBIQ');
    expect(ticket.status).toBe('active');
    expect(ticket.platformNumber).toBeGreaterThanOrEqual(1);
    expect(ticket.platformNumber).toBeLessThanOrEqual(6);
  });
});

import { describe, it, expect } from 'vitest';
import {
  calculateKarabakhEligibility,
  generateKarabakhPermit,
  convertCurrency,
  filterCheckpoints,
  filterPermits,
  KarabakhPermitApplication,
  DESTINATION_DETAILS,
} from '../karabakhPermit';
import {
  MOCK_KARABAKH_CHECKPOINTS,
  MOCK_ACTIVE_KARABAKH_PERMITS,
} from '../../data/mockKarabakhData';

describe('karabakhPermit utility module', () => {
  const validApp: KarabakhPermitApplication = {
    destination: 'shusha',
    durationTier: 'weekend_2d',
    startDate: '2026-10-25',
    vehiclePlate: '99-XX-700',
    vehicleModel: 'Toyota Land Cruiser',
    vin: 'JTEBU5JR8M5084921',
    tireTreadMm: 6.0,
    hasValidTexpasport: true,
    hasValidInspection: true,
    hasValidInsurance: true,
    driverFin: '5A1B2C3',
    driverFullName: 'Murad Ələkbərov',
    driverPhone: '+994 50 123 45 67',
    driverLicenseNumber: 'AZ-SV-991201',
    passengers: [
      { id: 'p1', fullName: 'Sevinc Ələkbərova', fin: '6B2C3D4', relation: 'family' },
    ],
    hotelName: 'Şuşa Hotel',
    hotelBookingRef: 'HTL-SH-2026-12',
    anamaAgreementsSigned: true,
    selectedCheckpointId: 'nbm-fuzuli-zafar',
  };

  it('correctly audits valid application with 100 score and eligibility', () => {
    const res = calculateKarabakhEligibility(validApp);
    expect(res.isEligible).toBe(true);
    expect(res.score).toBe(100);
    expect(res.missingRequirements).toHaveLength(0);
    expect(res.approvedCorridor).toContain('Zəfər Yolu');
    expect(res.stateEntranceFeeAzn).toBe(0);
  });

  it('rejects eligibility if ANAMA safety agreement is not signed', () => {
    const res = calculateKarabakhEligibility({
      ...validApp,
      anamaAgreementsSigned: false,
    });
    expect(res.isEligible).toBe(false);
    expect(res.score).toBeLessThan(70);
    expect(res.missingRequirements[0]).toContain('ANAMA Mina Təhlükəsizliyi');
  });

  it('rejects eligibility if vehicle lacks valid inspection or insurance', () => {
    const res = calculateKarabakhEligibility({
      ...validApp,
      hasValidInspection: false,
      hasValidInsurance: false,
    });
    expect(res.isEligible).toBe(false);
    expect(res.missingRequirements.length).toBeGreaterThanOrEqual(2);
  });

  it('requires hotel booking for hotel_stay_3d tier', () => {
    const resMissingHotel = calculateKarabakhEligibility({
      ...validApp,
      durationTier: 'hotel_stay_3d',
      hotelBookingRef: '',
    });
    expect(resMissingHotel.isEligible).toBe(false);
    expect(resMissingHotel.missingRequirements.some((r) => r.includes('otel'))).toBe(true);

    const resWithHotel = calculateKarabakhEligibility({
      ...validApp,
      durationTier: 'hotel_stay_3d',
      hotelBookingRef: 'HTL-VALID-2026',
    });
    expect(resWithHotel.isEligible).toBe(true);
  });

  it('generates electronic permit with valid QR hash and barcode format', () => {
    const permit = generateKarabakhPermit(validApp, 'Füzuli NBM');
    expect(permit.permitNumber).toMatch(/^QARABAG-EYOL-2026-\d{5}$/);
    expect(permit.vehiclePlate).toBe('99-XX-700');
    expect(permit.anamaStatus).toBe('VERIFIED_AND_SIGNED');
    expect(permit.qrSecurityHash).toContain('SHA256:QR-');
    expect(permit.policeBarcode).toMatch(/^\*BAR-\d+\*$/);
    expect(permit.status).toBe('ACTIVE');
  });

  it('converts currencies accurately', () => {
    expect(convertCurrency(100, 'AZN')).toBe(100);
    expect(convertCurrency(100, 'USD')).toBe(58.82);
    expect(convertCurrency(100, 'EUR')).toBe(54.05);
  });

  it('filters checkpoints by search term and region', () => {
    const fuzuli = filterCheckpoints(MOCK_KARABAKH_CHECKPOINTS, 'Füzuli', 'all');
    expect(fuzuli.length).toBeGreaterThan(0);
    expect(fuzuli[0].regionAz).toContain('Füzuli');

    const filteredRegion = filterCheckpoints(MOCK_KARABAKH_CHECKPOINTS, '', 'Ağdam');
    expect(filteredRegion.length).toBeGreaterThan(0);
    expect(filteredRegion[0].regionAz).toContain('Ağdam');
  });

  it('filters active permits by permit number, plate, or driver name', () => {
    const results = filterPermits(MOCK_ACTIVE_KARABAKH_PERMITS, '99-AA-026');
    expect(results.length).toBe(1);
    expect(results[0].driverFullName).toContain('Rəşad Əliyev');

    const empty = filterPermits(MOCK_ACTIVE_KARABAKH_PERMITS, 'NON_EXISTENT_QUERY');
    expect(empty).toHaveLength(0);
  });

  it('has comprehensive destination details with positive quotas', () => {
    expect(DESTINATION_DETAILS.shusha.distanceKm).toBe(395);
    expect(DESTINATION_DETAILS.kalbajar.travelHours).toBe(6.0);
    expect(DESTINATION_DETAILS.lachin.dailyQuota).toBeGreaterThan(50);
  });
});

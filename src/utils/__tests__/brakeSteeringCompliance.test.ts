import { describe, it, expect } from 'vitest';
import {
  inferVehicleBrakeClass,
  calculateAxleImbalancePercent,
  auditRollerBrakeStand,
  auditSteeringMechanism,
  simulateStoppingPhysics,
  auditPadRotorAndFluidHealth,
  generateBrakeSteeringCertificate,
  lookupBrakeCertificateByCode,
} from '../brakeSteeringCompliance';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('brakeSteeringCompliance utility engine (YHQ Annex 1 Sections I & II, İXM 342.2 & 96.1.4)', () => {
  it('correctly infers vehicle brake class from vehicle body type', () => {
    expect(inferVehicleBrakeClass(null)).toBe('M1_passenger');
    expect(inferVehicleBrakeClass(MOCK_VEHICLES[0])).toBe('M1_passenger');
    expect(
      inferVehicleBrakeClass({
        ...MOCK_VEHICLES[0],
        bodyType: 'pickup' as any,
      })
    ).toBe('N1_light_truck');
  });

  it('calculates left/right axle brake force imbalance percentage accurately', () => {
    expect(calculateAxleImbalancePercent(3.5, 3.5)).toBe(0);
    expect(calculateAxleImbalancePercent(4.0, 3.0)).toBe(25);
    expect(calculateAxleImbalancePercent(0, 0)).toBe(100);
  });

  it('approves a healthy M1 passenger car on the roller brake stand (≤14.7m, ≤15% front imbalance, ≥23% curb handbrake)', () => {
    const res = auditRollerBrakeStand({
      vehicleClass: 'M1_passenger',
      frontLeftForceKn: 3.5,
      frontRightForceKn: 3.4,
      rearLeftForceKn: 2.2,
      rearRightForceKn: 2.1,
      vehicleMassKg: 1600,
      handbrakeSlopePercent: 25,
      isLoadedState: false,
      hasHydraulicOrAirLeak: false,
    });

    expect(res.isCompliant).toBe(true);
    expect(res.prohibitionTriggered).toBe(false);
    expect(res.stoppingDistanceCompliant).toBe(true);
    expect(res.estimatedStoppingDistance40KmhM).toBeLessThanOrEqual(14.7);
    expect(res.frontImbalanceCompliant).toBe(true);
    expect(res.rearImbalanceCompliant).toBe(true);
    expect(res.handbrakeCompliant).toBe(true);
    expect(res.individualFineAzn).toBe(0);
    expect(res.earlyPaymentFineAzn).toBe(0);
    expect(res.brakeSafetyScore).toBe(100);
  });

  it('flags caliper imbalance (>15%), weak handbrake (<23% curb or <16% full load), and hydraulic leak with İXM 342.2 (150 AZN) & 96.1.4 prohibition', () => {
    const res = auditRollerBrakeStand({
      vehicleClass: 'M1_passenger',
      frontLeftForceKn: 3.8,
      frontRightForceKn: 2.1, // >15% front imbalance
      rearLeftForceKn: 1.0,
      rearRightForceKn: 0.9,
      vehicleMassKg: 2100,
      handbrakeSlopePercent: 18, // <23% curb weight norm
      isLoadedState: false,
      hasHydraulicOrAirLeak: true,
    });

    expect(res.isCompliant).toBe(false);
    expect(res.prohibitionTriggered).toBe(true);
    expect(res.frontImbalanceCompliant).toBe(false);
    expect(res.handbrakeCompliant).toBe(false);
    expect(res.hydraulicIntegrityCompliant).toBe(false);
    expect(res.individualFineAzn).toBe(150);
    expect(res.earlyPaymentFineAzn).toBe(75);
    expect(res.officialPersonFineAzn).toBe(200);
    expect(res.legalEntityFineAzn).toBe(600);
    expect(res.violationsAz.length).toBeGreaterThanOrEqual(3);
  });

  it('enforces YHQ Annex 1 Clause 1.5 31% curb weight handbrake slope for N1/N2/N3 trucks vs 16% full load', () => {
    const curbTruckFail = auditRollerBrakeStand({
      vehicleClass: 'N1_light_truck',
      frontLeftForceKn: 5.0,
      frontRightForceKn: 4.9,
      rearLeftForceKn: 3.5,
      rearRightForceKn: 3.4,
      vehicleMassKg: 2500,
      handbrakeSlopePercent: 26, // <31% curb weight norm for trucks
      isLoadedState: false,
      hasHydraulicOrAirLeak: false,
    });
    expect(curbTruckFail.handbrakeCompliant).toBe(false);
    expect(curbTruckFail.requiredHandbrakeSlopePercent).toBe(31);

    const loadedTruckPass = auditRollerBrakeStand({
      vehicleClass: 'N1_light_truck',
      frontLeftForceKn: 5.0,
      frontRightForceKn: 4.9,
      rearLeftForceKn: 3.5,
      rearRightForceKn: 3.4,
      vehicleMassKg: 2500,
      handbrakeSlopePercent: 18, // >=16% full load norm
      isLoadedState: true,
      hasHydraulicOrAirLeak: false,
    });
    expect(loadedTruckPass.handbrakeCompliant).toBe(true);
    expect(loadedTruckPass.requiredHandbrakeSlopePercent).toBe(16);
  });

  it('audits steering play angle under YHQ Annex 1 Section II (≤10° M1, ≤20° Bus, ≤25° Truck)', () => {
    const passM1 = auditSteeringMechanism({
      vehicleClass: 'M1_passenger',
      steeringPlayDegrees: 8.5,
      steeringType: 'eps_electric',
      hasTieRodOrJointPlay: false,
      hasPowerSteeringFaultOrLeak: false,
      hasUnpinnedNutOrCrackedColumn: false,
    });
    expect(passM1.isCompliant).toBe(true);
    expect(passM1.individualFineAzn).toBe(0);

    const failM1 = auditSteeringMechanism({
      vehicleClass: 'M1_passenger',
      steeringPlayDegrees: 14.0, // >10°
      steeringType: 'hps_hydraulic',
      hasTieRodOrJointPlay: true,
      hasPowerSteeringFaultOrLeak: true,
      hasUnpinnedNutOrCrackedColumn: false,
    });
    expect(failM1.isCompliant).toBe(false);
    expect(failM1.playAngleCompliant).toBe(false);
    expect(failM1.individualFineAzn).toBe(150);
    expect(failM1.prohibitionTriggered).toBe(true);

    // 18° is valid for M2/M3 Bus (≤20°) and N1 Truck (≤25°)
    const passBus = auditSteeringMechanism({
      vehicleClass: 'M2_M3_bus',
      steeringPlayDegrees: 18.0,
      steeringType: 'hps_hydraulic',
      hasTieRodOrJointPlay: false,
      hasPowerSteeringFaultOrLeak: false,
      hasUnpinnedNutOrCrackedColumn: false,
    });
    expect(passBus.isCompliant).toBe(true);
  });

  it('simulates stopping physics across dry, wet, and icy roads and computes 40m obstacle impact speed', () => {
    const dry60 = simulateStoppingPhysics({
      speedKmh: 60,
      roadCondition: 'dry_asphalt',
      reactionTimeSec: 1.0,
      absActive: true,
      frontPadThicknessMm: 8.0,
      dotFluidMoisturePercent: 1.0,
      vehicleMassKg: 1600,
    });

    const ice60 = simulateStoppingPhysics({
      speedKmh: 60,
      roadCondition: 'snow_ice',
      reactionTimeSec: 1.0,
      absActive: false,
      frontPadThicknessMm: 1.5,
      dotFluidMoisturePercent: 4.0,
      vehicleMassKg: 1600,
    });

    expect(ice60.totalStoppingDistanceM).toBeGreaterThan(dry60.totalStoppingDistanceM * 2);
    expect(dry60.obstacleAt40mImpactSpeedKmh).toBe(0);
    expect(ice60.obstacleAt40mImpactSpeedKmh).toBeGreaterThan(35);
    expect(ice60.riskLevel).toBe('critical');
  });

  it('audits brake pads, rotor MIN TH margin, and DOT-4 moisture boiling point for mountain descents', () => {
    const healthy = auditPadRotorAndFluidHealth({
      frontPadMm: 8.0,
      rearPadMm: 7.0,
      frontRotorDeltaMm: 1.8,
      fluidType: 'DOT_4',
      fluidMoisturePercent: 0.9,
    });
    expect(healthy.mountainDescentSafe).toBe(true);
    expect(healthy.fluidStatus).toBe('optimal');
    expect(healthy.estimatedServiceCostAzn).toBe(0);

    const dangerous = auditPadRotorAndFluidHealth({
      frontPadMm: 1.8,
      rearPadMm: 1.5,
      frontRotorDeltaMm: -0.5,
      fluidType: 'DOT_4',
      fluidMoisturePercent: 4.2,
    });
    expect(dangerous.mountainDescentSafe).toBe(false);
    expect(dangerous.fluidStatus).toBe('vapor_lock_danger');
    expect(dangerous.estimatedBoilingPointC).toBeLessThan(160);
    expect(dangerous.estimatedServiceCostAzn).toBeGreaterThan(400);
  });

  it('generates and looks up official BDYP-TRM-2026 certificates', () => {
    const brakeAudit = auditRollerBrakeStand({
      vehicleClass: 'M1_passenger',
      frontLeftForceKn: 3.4,
      frontRightForceKn: 3.3,
      rearLeftForceKn: 2.1,
      rearRightForceKn: 2.0,
      vehicleMassKg: 1650,
      handbrakeSlopePercent: 25,
      isLoadedState: false,
      hasHydraulicOrAirLeak: false,
    });
    const steeringAudit = auditSteeringMechanism({
      vehicleClass: 'M1_passenger',
      steeringPlayDegrees: 4.0,
      steeringType: 'eps_electric',
      hasTieRodOrJointPlay: false,
      hasPowerSteeringFaultOrLeak: false,
      hasUnpinnedNutOrCrackedColumn: false,
    });

    const cert = generateBrakeSteeringCertificate({
      plateNumber: '77-ZZ-777',
      vin: 'WBA5A7C50JB192841',
      vehicleTitle: 'BMW 530i M Sport',
      brakeAudit,
      steeringAudit,
      dotMoisturePercent: 1.0,
    });

    expect(cert.certificateNumber).toMatch(/^BDYP-TRM-2026-\d{5}$/);
    expect(cert.isRoadworthy).toBe(true);

    const foundByCode = lookupBrakeCertificateByCode('BDYP-TRM-2026-84102');
    expect(foundByCode).not.toBeNull();
    expect(foundByCode?.plateNumber).toBe('99-AA-777');

    const notFound = lookupBrakeCertificateByCode('INVALID-000');
    expect(notFound).toBeNull();
  });
});

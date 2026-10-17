import { Vehicle } from '../types/vehicle';
import {
  VehicleBrakeClass,
  RoadSurfaceCondition,
  BrakeFluidType,
  PowerSteeringType,
  STATUTORY_BRAKE_STEERING_NORMS,
  ROAD_SURFACE_SPECS,
  BRAKE_FLUID_SPECS,
  BRAKE_DIAGNOSTIC_CENTERS,
  SAMPLE_BRAKE_CERTIFICATES,
  BrakeSteeringCertificate,
} from '../data/mockBrakeSteeringData';

export interface RollerBrakeStandInput {
  vehicleClass: VehicleBrakeClass;
  frontLeftForceKn: number;
  frontRightForceKn: number;
  rearLeftForceKn: number;
  rearRightForceKn: number;
  vehicleMassKg: number;
  handbrakeSlopePercent: number;
  isLoadedState: boolean; // false = curb weight (23% M1 / 31% Truck), true = full load (16%)
  hasHydraulicOrAirLeak: boolean;
}

export interface RollerBrakeStandResult {
  vehicleClass: VehicleBrakeClass;
  totalBrakeForceKn: number;
  specificBrakeForceRatio: number; // gamma_T
  estimatedDecelerationMs2: number;
  estimatedStoppingDistance40KmhM: number;
  frontImbalancePercent: number;
  rearImbalancePercent: number;
  stoppingDistanceCompliant: boolean;
  decelerationCompliant: boolean;
  frontImbalanceCompliant: boolean;
  rearImbalanceCompliant: boolean;
  handbrakeCompliant: boolean;
  requiredHandbrakeSlopePercent: number;
  hydraulicIntegrityCompliant: boolean;
  isCompliant: boolean;
  prohibitionTriggered: boolean; // İXM Article 96.1.4 & YHQ Article 85
  individualFineAzn: number; // İXM Article 342.2 (150 AZN)
  earlyPaymentFineAzn: number; // 50% 30-day AsanPay discount (75 AZN)
  officialPersonFineAzn: number; // İXM Article 348 (200 AZN)
  legalEntityFineAzn: number; // İXM Article 348 (600 AZN)
  brakeSafetyScore: number;
  violationsAz: string[];
  recommendationsAz: string[];
  legalCitation: string;
}

export interface SteeringPlayAuditInput {
  vehicleClass: VehicleBrakeClass;
  steeringPlayDegrees: number;
  steeringType: PowerSteeringType;
  hasTieRodOrJointPlay: boolean;
  hasPowerSteeringFaultOrLeak: boolean;
  hasUnpinnedNutOrCrackedColumn: boolean;
}

export interface SteeringPlayAuditResult {
  vehicleClass: VehicleBrakeClass;
  steeringPlayDegrees: number;
  maxAllowedPlayDegrees: number;
  playAngleCompliant: boolean;
  mechanicalJointsCompliant: boolean;
  powerBoosterCompliant: boolean;
  isCompliant: boolean;
  prohibitionTriggered: boolean; // İXM Article 96.1.4
  individualFineAzn: number; // İXM Article 342.2 (150 AZN)
  earlyPaymentFineAzn: number; // 75 AZN
  steeringHealthScore: number;
  violationsAz: string[];
  recommendationsAz: string[];
  legalCitation: string;
}

export interface StoppingPhysicsInput {
  speedKmh: number;
  roadCondition: RoadSurfaceCondition;
  reactionTimeSec: number;
  absActive: boolean;
  frontPadThicknessMm: number; // nominal 10-12mm, min 3mm
  dotFluidMoisturePercent: number; // nominal <1.5%, critical >3.0%
  vehicleMassKg?: number;
}

export interface StoppingPhysicsResult {
  speedKmh: number;
  speedMs: number;
  reactionDistanceM: number;
  brakingDistanceM: number;
  totalStoppingDistanceM: number;
  idealDryTotalDistanceM: number;
  distancePenaltyM: number;
  effectiveDecelerationMs2: number;
  stoppingDurationSec: number;
  kineticEnergyKj: number;
  obstacleAt40mImpactSpeedKmh: number; // 0 if stops <= 40m
  riskLevel: 'safe' | 'moderate' | 'high' | 'critical';
}

export interface PadRotorFluidAuditInput {
  frontPadMm: number;
  rearPadMm: number;
  frontRotorDeltaMm: number; // mm above MIN TH stamp (e.g. +1.8mm safe, <0mm below limit)
  fluidType: BrakeFluidType;
  fluidMoisturePercent: number;
}

export interface PadRotorFluidAuditResult {
  frontPadStatus: 'good' | 'warning' | 'critical';
  rearPadStatus: 'good' | 'warning' | 'critical';
  rotorStatus: 'safe' | 'near_limit' | 'below_min_th';
  fluidStatus: 'optimal' | 'replace_soon' | 'vapor_lock_danger';
  estimatedBoilingPointC: number;
  mountainDescentSafe: boolean; // Ağsu / Şamaxı pass check
  estimatedServiceCostAzn: number;
  overallComponentScore: number;
  findingsAz: string[];
}

export function inferVehicleBrakeClass(vehicle?: Vehicle | null): VehicleBrakeClass {
  if (!vehicle) return 'M1_passenger';
  const body = (vehicle.bodyType || '').toLowerCase();
  if (body.includes('moto')) return 'L3_motorcycle';
  if (body.includes('bus') || body.includes('minivan')) return 'M1_passenger';
  if (body.includes('pickup') || body.includes('truck') || body.includes('van')) return 'N1_light_truck';
  return 'M1_passenger';
}

export function calculateAxleImbalancePercent(leftForceKn: number, rightForceKn: number): number {
  const maxForce = Math.max(leftForceKn, rightForceKn);
  if (maxForce <= 0) return 100;
  const diff = Math.abs(leftForceKn - rightForceKn);
  return Number(((diff / maxForce) * 100).toFixed(1));
}

export function auditRollerBrakeStand(input: RollerBrakeStandInput): RollerBrakeStandResult {
  const norm = STATUTORY_BRAKE_STEERING_NORMS[input.vehicleClass] || STATUTORY_BRAKE_STEERING_NORMS.M1_passenger;
  const massKg = Math.max(400, input.vehicleMassKg);
  const weightKn = (massKg * 9.81) / 1000;

  const totalBrakeForceKn = Number(
    Math.max(0, input.frontLeftForceKn + input.frontRightForceKn + input.rearLeftForceKn + input.rearRightForceKn).toFixed(2)
  );

  const specificBrakeForceRatio = Number((totalBrakeForceKn / weightKn).toFixed(2));
  const estimatedDecelerationMs2 = Number((specificBrakeForceRatio * 9.81).toFixed(2));

  // Initial speed v0 = 40 km/h (11.11 m/s) or 30 km/h (8.33 m/s) for L3
  const v0Ms = norm.testSpeedKmh / 3.6;
  const lagTimeSec = 0.20; // hydraulic brake system actuation lag (t_lag)
  const rawStoppingDist =
    estimatedDecelerationMs2 > 0.5
      ? v0Ms * lagTimeSec + (v0Ms * v0Ms) / (2 * estimatedDecelerationMs2)
      : 99.9;
  const estimatedStoppingDistance40KmhM = Number(rawStoppingDist.toFixed(1));

  const frontImbalancePercent = calculateAxleImbalancePercent(input.frontLeftForceKn, input.frontRightForceKn);
  const rearImbalancePercent = calculateAxleImbalancePercent(input.rearLeftForceKn, input.rearRightForceKn);

  const stoppingDistanceCompliant = estimatedStoppingDistance40KmhM <= norm.maxStoppingDistanceM;
  const decelerationCompliant =
    estimatedDecelerationMs2 >= norm.minDecelerationMs2 &&
    specificBrakeForceRatio >= norm.minSpecificBrakeForce;
  const frontImbalanceCompliant = frontImbalancePercent <= norm.maxFrontAxleImbalancePercent;
  const rearImbalanceCompliant = rearImbalancePercent <= norm.maxRearAxleImbalancePercent;

  const requiredHandbrakeSlopePercent = input.isLoadedState
    ? norm.minHandbrakeSlopeFullLoadPercent
    : norm.minHandbrakeSlopeCurbWeightPercent;
  const handbrakeCompliant = input.handbrakeSlopePercent >= requiredHandbrakeSlopePercent;
  const hydraulicIntegrityCompliant = !input.hasHydraulicOrAirLeak;

  const violationsAz: string[] = [];
  const recommendationsAz: string[] = [];

  if (!stoppingDistanceCompliant || !decelerationCompliant) {
    violationsAz.push(
      `YHQ Əlavə 1, Bənd 1.2: ${norm.testSpeedKmh} km/saat sürətdə tormoz yolu ${estimatedStoppingDistance40KmhM} m (norma ≤ ${norm.maxStoppingDistanceM} m), yavaşıma təcili ${estimatedDecelerationMs2} m/s² (norma ≥ ${norm.minDecelerationMs2} m/s²).`
    );
    recommendationsAz.push(
      'Əyləc bəndlərini (nakladka), baş tormoz silindrini və vakuum gücləndiricisinin təzyiqini yoxlayın.'
    );
  }

  if (!frontImbalanceCompliant) {
    violationsAz.push(
      `YHQ Əlavə 1, Bənd 1.2: Ön ox üzrə sağ/sol təkərlərin tormoz qüvvəsi fərqi ${frontImbalancePercent}% təşkil edir (maksimum hədd ≤ ${norm.maxFrontAxleImbalancePercent}%). Tormozlama zamanı avtomobili yana atma təhlükəsi var.`
    );
    recommendationsAz.push(
      'Ön əyləc supportlarının (kaliperlərin) porşenlərini, istiqamətləndirici barmaqlarını və əyləc disklərini təftiş edin.'
    );
  }

  if (!rearImbalanceCompliant) {
    violationsAz.push(
      `YHQ Əlavə 1, Bənd 1.2: Arxa ox üzrə sağ/sol təkərlərin tormoz qüvvəsi fərqi ${rearImbalancePercent}% təşkil edir (maksimum hədd ≤ ${norm.maxRearAxleImbalancePercent}%).`
    );
    recommendationsAz.push(
      'Arxa işçi silindrləri, əyləc bəndlərini və təzyiq tənzimləyicisini balanslaşdırın.'
    );
  }

  if (!handbrakeCompliant) {
    violationsAz.push(
      `YHQ Əlavə 1, Bənd 1.5: Duracaq tormozu (əl əyləci) avtomobili yalnız ${input.handbrakeSlopePercent}% maillikdə saxlayır (${input.isLoadedState ? 'tam yüklü' : 'yüksüz'} rejim üçün qanuni norma ≥ ${requiredHandbrakeSlopePercent}%).`
    );
    recommendationsAz.push(
      'Əl əyləci trosunu gərin, arxa baraban kolodkalarını və ya elektron EPB servomotorunu kalibrləyin.'
    );
  }

  if (!hydraulicIntegrityCompliant) {
    violationsAz.push(
      'YHQ Əlavə 1, Bənd 1.3: Hidravlik tormoz ötürücüsünün kipliyi pozulub (tormoz şlanqında və ya borusunda maye sızması / hava var).'
    );
    recommendationsAz.push(
      'DƏRHAL HƏRƏKƏTİ DAYANDIRIN! Zədələnmiş tormoz şlanqını dəyişdirin və sistemin havasını çıxarın.'
    );
  }

  const isCompliant =
    stoppingDistanceCompliant &&
    decelerationCompliant &&
    frontImbalanceCompliant &&
    rearImbalanceCompliant &&
    handbrakeCompliant &&
    hydraulicIntegrityCompliant;

  let score = 100;
  if (!stoppingDistanceCompliant || !decelerationCompliant) score -= 35;
  if (!frontImbalanceCompliant) score -= 25;
  if (!rearImbalanceCompliant) score -= 15;
  if (!handbrakeCompliant) score -= 15;
  if (!hydraulicIntegrityCompliant) score -= 45;
  const brakeSafetyScore = Math.max(5, Math.min(100, score));

  if (isCompliant) {
    recommendationsAz.push(
      'Tormoz sistemi YHQ Əlavə 1 Bölmə I üzrə bütün dövlət normativlərinə tam cavab verir.'
    );
  }

  return {
    vehicleClass: input.vehicleClass,
    totalBrakeForceKn,
    specificBrakeForceRatio,
    estimatedDecelerationMs2,
    estimatedStoppingDistance40KmhM,
    frontImbalancePercent,
    rearImbalancePercent,
    stoppingDistanceCompliant,
    decelerationCompliant,
    frontImbalanceCompliant,
    rearImbalanceCompliant,
    handbrakeCompliant,
    requiredHandbrakeSlopePercent,
    hydraulicIntegrityCompliant,
    isCompliant,
    prohibitionTriggered: !isCompliant,
    individualFineAzn: isCompliant ? 0 : 150,
    earlyPaymentFineAzn: isCompliant ? 0 : 75,
    officialPersonFineAzn: isCompliant ? 0 : 200,
    legalEntityFineAzn: isCompliant ? 0 : 600,
    brakeSafetyScore,
    violationsAz,
    recommendationsAz,
    legalCitation:
      'AR "Yol hərəkəti haqqında" Qanuna Əlavə 1, Bölmə I (Bənd 1.1–1.5), İXM Maddə 342.2 (150 AZN) və Maddə 96.1.4 (İstismarın qadağan edilməsi)',
  };
}

export function auditSteeringMechanism(input: SteeringPlayAuditInput): SteeringPlayAuditResult {
  const norm = STATUTORY_BRAKE_STEERING_NORMS[input.vehicleClass] || STATUTORY_BRAKE_STEERING_NORMS.M1_passenger;
  const playAngleCompliant = input.steeringPlayDegrees <= norm.maxSteeringPlayDegrees;
  const mechanicalJointsCompliant = !input.hasTieRodOrJointPlay && !input.hasUnpinnedNutOrCrackedColumn;
  const powerBoosterCompliant = !input.hasPowerSteeringFaultOrLeak;

  const violationsAz: string[] = [];
  const recommendationsAz: string[] = [];

  if (!playAngleCompliant) {
    violationsAz.push(
      `YHQ Əlavə 1, Bənd 2.1: Sükan çarxının cəmi lüftü (boş gediş bucağı) ${input.steeringPlayDegrees}° təşkil edir (${norm.labelAz} üçün yol verilən maksimum norma ≤ ${norm.maxSteeringPlayDegrees}°).`
    );
    recommendationsAz.push(
      'Sükan reykasının sıxıcı mexanizmini, sükan dartqılarını (tiyaqa) və ucluqlarını (nakoneçnik) lüftometr stendində yoxladın.'
    );
  }

  if (input.hasTieRodOrJointPlay) {
    violationsAz.push(
      'YHQ Əlavə 1, Bənd 2.2: Sükan idarə mexanizminin detalları və qovşaqlarında (tiyaqa/nakoneçnik oynaqlarında) konstruksiyada nəzərdə tutulmayan boşluq və tərpənmə aşkarlandı.'
    );
    recommendationsAz.push(
      'Yeyilmiş sükan ucluqlarını dəyişdirin və 3D Lazer Razval stendində təkər bucaqlarını tənzimləyin.'
    );
  }

  if (input.hasUnpinnedNutOrCrackedColumn) {
    violationsAz.push(
      'YHQ Əlavə 1, Bənd 2.2: Sükan mexanizminin yiv birləşmələri bərkidilməyib (ştiftlənməyib) və ya sükan valı/kardan birləşməsində zədə var.'
    );
    recommendationsAz.push(
      'TƏCİLİ TƏHLÜKƏ! Sükan qovşağının qaykalarını zavod fırlanma anı ilə sıxın və qoruyucu şplintlə bərkidin.'
    );
  }

  if (!powerBoosterCompliant) {
    violationsAz.push(
      'YHQ Əlavə 1, Bənd 2.3: Konstruksiyada nəzərdə tutulmuş sükan gücləndiricisi (EPS / Hidravlik ГУР) nasazdır və ya yüksək təzyiq konturunda yağ sızması var.'
    );
    recommendationsAz.push(
      input.steeringType === 'eps_electric'
        ? 'Elektrik sükan gücləndiricisinin (EPS) fırlanma anı sensorunu və elektron idarəetmə blokunu OBD-II ilə kalibrləyin.'
        : 'Hidravlik sükan nasosunu (ГУР), kəmərin gərilməsini və sükan reykasının salniklərini bərpa edin.'
    );
  }

  const isCompliant = playAngleCompliant && mechanicalJointsCompliant && powerBoosterCompliant;

  let score = 100;
  if (!playAngleCompliant) {
    const excess = input.steeringPlayDegrees - norm.maxSteeringPlayDegrees;
    score -= Math.min(45, 20 + excess * 2);
  }
  if (input.hasTieRodOrJointPlay) score -= 25;
  if (input.hasUnpinnedNutOrCrackedColumn) score -= 40;
  if (!powerBoosterCompliant) score -= 25;
  const steeringHealthScore = Math.max(5, Math.min(100, Math.round(score)));

  if (isCompliant) {
    recommendationsAz.push(
      'Sükan idarə mexanizmi YHQ Əlavə 1 Bölmə II üzrə bütün təhlükəsizlik tələblərinə tam uyğundur.'
    );
  }

  return {
    vehicleClass: input.vehicleClass,
    steeringPlayDegrees: input.steeringPlayDegrees,
    maxAllowedPlayDegrees: norm.maxSteeringPlayDegrees,
    playAngleCompliant,
    mechanicalJointsCompliant,
    powerBoosterCompliant,
    isCompliant,
    prohibitionTriggered: !isCompliant,
    individualFineAzn: isCompliant ? 0 : 150,
    earlyPaymentFineAzn: isCompliant ? 0 : 75,
    steeringHealthScore,
    violationsAz,
    recommendationsAz,
    legalCitation:
      'AR "Yol hərəkəti haqqında" Qanuna Əlavə 1, Bölmə II (Bənd 2.1–2.3), İXM Maddə 342.2 (150 AZN) və Maddə 96.1.4',
  };
}

export function simulateStoppingPhysics(input: StoppingPhysicsInput): StoppingPhysicsResult {
  const surface = ROAD_SURFACE_SPECS[input.roadCondition] || ROAD_SURFACE_SPECS.dry_asphalt;
  const speedKmh = Math.max(10, Math.min(220, input.speedKmh));
  const speedMs = Number((speedKmh / 3.6).toFixed(2));
  const reactionTime = Math.max(0.4, Math.min(3.5, input.reactionTimeSec));

  const reactionDistanceM = Number((speedMs * reactionTime).toFixed(1));

  // Pad wear & fluid moisture degradation penalties
  let padEfficiency = 1.0;
  if (input.frontPadThicknessMm < 2.0) {
    padEfficiency = 0.72; // metal backing plate / severe fade
  } else if (input.frontPadThicknessMm < 3.0) {
    padEfficiency = 0.86;
  }

  let fluidEfficiency = 1.0;
  if (input.dotFluidMoisturePercent > 3.5) {
    fluidEfficiency = 0.78; // compressible vapor bubbles under heavy braking
  } else if (input.dotFluidMoisturePercent > 2.5) {
    fluidEfficiency = 0.90;
  }

  const absFactor = input.absActive ? surface.absEfficiencyMultiplier : 0.78;
  const effectiveMu = surface.frictionCoefficient * absFactor * padEfficiency * fluidEfficiency;
  const effectiveDecelerationMs2 = Number(Math.max(1.2, effectiveMu * 9.81).toFixed(2));

  const brakingDistanceM = Number(((speedMs * speedMs) / (2 * effectiveDecelerationMs2)).toFixed(1));
  const totalStoppingDistanceM = Number((reactionDistanceM + brakingDistanceM).toFixed(1));

  // Ideal reference: dry asphalt, 1.0s reaction, healthy pads & fluid, ABS active
  const idealDecel = ROAD_SURFACE_SPECS.dry_asphalt.frictionCoefficient * ROAD_SURFACE_SPECS.dry_asphalt.absEfficiencyMultiplier * 9.81;
  const idealDryTotalDistanceM = Number((speedMs * 1.0 + (speedMs * speedMs) / (2 * idealDecel)).toFixed(1));
  const distancePenaltyM = Number(Math.max(0, totalStoppingDistanceM - idealDryTotalDistanceM).toFixed(1));

  const stoppingDurationSec = Number((reactionTime + speedMs / effectiveDecelerationMs2).toFixed(2));
  const massKg = Math.max(500, input.vehicleMassKg || 1650);
  const kineticEnergyKj = Number(((0.5 * massKg * speedMs * speedMs) / 1000).toFixed(1));

  // Obstacle at 40m impact speed calculation
  let obstacleAt40mImpactSpeedKmh = 0;
  if (totalStoppingDistanceM > 40) {
    if (reactionDistanceM >= 40) {
      obstacleAt40mImpactSpeedKmh = speedKmh; // hasn't even touched brake pedal yet!
    } else {
      const remainingBrakingDist = 40 - reactionDistanceM;
      const vImpactSquared = Math.max(0, speedMs * speedMs - 2 * effectiveDecelerationMs2 * remainingBrakingDist);
      obstacleAt40mImpactSpeedKmh = Number((Math.sqrt(vImpactSquared) * 3.6).toFixed(1));
    }
  }

  let riskLevel: 'safe' | 'moderate' | 'high' | 'critical' = 'safe';
  if (totalStoppingDistanceM > 85 || obstacleAt40mImpactSpeedKmh >= 50) {
    riskLevel = 'critical';
  } else if (totalStoppingDistanceM > 55 || obstacleAt40mImpactSpeedKmh >= 25) {
    riskLevel = 'high';
  } else if (totalStoppingDistanceM > 35 || obstacleAt40mImpactSpeedKmh > 0) {
    riskLevel = 'moderate';
  }

  return {
    speedKmh,
    speedMs,
    reactionDistanceM,
    brakingDistanceM,
    totalStoppingDistanceM,
    idealDryTotalDistanceM,
    distancePenaltyM,
    effectiveDecelerationMs2,
    stoppingDurationSec,
    kineticEnergyKj,
    obstacleAt40mImpactSpeedKmh,
    riskLevel,
  };
}

export function auditPadRotorAndFluidHealth(input: PadRotorFluidAuditInput): PadRotorFluidAuditResult {
  const fluidSpec = BRAKE_FLUID_SPECS[input.fluidType] || BRAKE_FLUID_SPECS.DOT_4;

  const frontPadStatus: 'good' | 'warning' | 'critical' =
    input.frontPadMm >= 4.0 ? 'good' : input.frontPadMm >= 2.5 ? 'warning' : 'critical';
  const rearPadStatus: 'good' | 'warning' | 'critical' =
    input.rearPadMm >= 3.5 ? 'good' : input.rearPadMm >= 2.0 ? 'warning' : 'critical';
  const rotorStatus: 'safe' | 'near_limit' | 'below_min_th' =
    input.frontRotorDeltaMm >= 1.0 ? 'safe' : input.frontRotorDeltaMm >= 0 ? 'near_limit' : 'below_min_th';

  const fluidStatus: 'optimal' | 'replace_soon' | 'vapor_lock_danger' =
    input.fluidMoisturePercent <= 1.5
      ? 'optimal'
      : input.fluidMoisturePercent <= fluidSpec.maxSafeMoisturePercent
      ? 'replace_soon'
      : 'vapor_lock_danger';

  // Interpolate boiling point based on moisture % (0% -> dryBoilingPoint, 3.7% -> wetBoilingPoint)
  const moistureRatio = Math.min(1.4, Math.max(0, input.fluidMoisturePercent / 3.7));
  const dropC = (fluidSpec.dryBoilingPointC - fluidSpec.wetBoilingPointC) * moistureRatio;
  const estimatedBoilingPointC = Math.round(fluidSpec.dryBoilingPointC - dropC);

  const mountainDescentSafe =
    estimatedBoilingPointC >= 180 && frontPadStatus !== 'critical' && rotorStatus !== 'below_min_th';

  let estimatedServiceCostAzn = 0;
  const findingsAz: string[] = [];

  if (frontPadStatus === 'critical') {
    estimatedServiceCostAzn += 130;
    findingsAz.push(
      `Ön əyləc bəndləri (nakladka) kritik həddədir (${input.frontPadMm} mm < 2.5 mm) — əyləc diskini cırma və tormoz itkisi təhlükəsi!`
    );
  } else if (frontPadStatus === 'warning') {
    estimatedServiceCostAzn += 110;
    findingsAz.push(
      `Ön əyləc bəndləri (${input.frontPadMm} mm) yaxın 3,000–5,000 km ərzində dəyişdirilməlidir.`
    );
  }

  if (rearPadStatus === 'critical') {
    estimatedServiceCostAzn += 100;
    findingsAz.push(`Arxa əyləc bəndləri (${input.rearPadMm} mm) kritik aşınma həddini keçib.`);
  } else if (rearPadStatus === 'warning') {
    estimatedServiceCostAzn += 85;
    findingsAz.push(`Arxa əyləc bəndləri (${input.rearPadMm} mm) növbəti servisdə yenilənməlidir.`);
  }

  if (rotorStatus === 'below_min_th') {
    estimatedServiceCostAzn += 220;
    findingsAz.push(
      `Əyləc diskləri zavod "MIN TH" qalınlıq həddindən aşağı düşüb (${input.frontRotorDeltaMm} mm) — qızma zamanı disk əyilməsi və çatlama riski!`
    );
  } else if (rotorStatus === 'near_limit') {
    findingsAz.push('Əyləc diskləri minimum "MIN TH" qalınlıq həddinə yaxınlaşıb.');
  }

  if (fluidStatus === 'vapor_lock_danger') {
    estimatedServiceCostAzn += 65;
    findingsAz.push(
      `Tormoz mayesində su/nəmlik miqdarı ${input.fluidMoisturePercent}% (> ${fluidSpec.maxSafeMoisturePercent}%) təşkil edir! Qaynama nöqtəsi ${estimatedBoilingPointC}°C-yə düşüb — Ağsu və ya Şamaxı enişində "buxar tıxacı" (pedalın dibə çökməsi) təhlükəsi!`
    );
  } else if (fluidStatus === 'replace_soon') {
    estimatedServiceCostAzn += 65;
    findingsAz.push(
      `Tormoz mayesinin nəmliyi ${input.fluidMoisturePercent}% səviyyəsindədir (qaynama nöqtəsi ~${estimatedBoilingPointC}°C) — aparatla yenilənməsi tövsiyə olunur.`
    );
  }

  if (findingsAz.length === 0) {
    findingsAz.push(
      `Əyləc bəndləri, disklər və ${fluidSpec.name} mayesi (qaynama həddi ${estimatedBoilingPointC}°C) ideal texniki vəziyyətdədir.`
    );
  }

  let score = 100;
  if (frontPadStatus === 'critical') score -= 35;
  else if (frontPadStatus === 'warning') score -= 15;
  if (rearPadStatus === 'critical') score -= 20;
  else if (rearPadStatus === 'warning') score -= 10;
  if (rotorStatus === 'below_min_th') score -= 25;
  else if (rotorStatus === 'near_limit') score -= 10;
  if (fluidStatus === 'vapor_lock_danger') score -= 30;
  else if (fluidStatus === 'replace_soon') score -= 12;

  return {
    frontPadStatus,
    rearPadStatus,
    rotorStatus,
    fluidStatus,
    estimatedBoilingPointC,
    mountainDescentSafe,
    estimatedServiceCostAzn,
    overallComponentScore: Math.max(5, Math.min(100, score)),
    findingsAz,
  };
}

export function generateBrakeSteeringCertificate(params: {
  plateNumber: string;
  vin: string;
  vehicleTitle: string;
  brakeAudit: RollerBrakeStandResult;
  steeringAudit: SteeringPlayAuditResult;
  dotMoisturePercent: number;
  centerId?: string;
}): BrakeSteeringCertificate {
  const cleanPlate = (params.plateNumber || '99-XX-000').trim().toUpperCase();
  const cleanVin = (params.vin || 'WBA00000000000000').trim().toUpperCase();
  const center =
    BRAKE_DIAGNOSTIC_CENTERS.find((c) => c.id === params.centerId) || BRAKE_DIAGNOSTIC_CENTERS[0];

  const seed = cleanPlate
    .split('')
    .reduce((acc, ch, i) => acc + ch.charCodeAt(0) * (i + 17), 31000);
  const serial = String(10000 + (seed % 89999));

  const isRoadworthy = params.brakeAudit.isCompliant && params.steeringAudit.isCompliant;
  const safetyScore = Math.round(
    params.brakeAudit.brakeSafetyScore * 0.6 + params.steeringAudit.steeringHealthScore * 0.4
  );

  return {
    certificateNumber: `BDYP-TRM-2026-${serial}`,
    plateNumber: cleanPlate,
    vin: cleanVin,
    vehicleTitle: params.vehicleTitle || 'Minik Avtomobili',
    vehicleClass: params.brakeAudit.vehicleClass,
    stoppingDistance40KmhM: params.brakeAudit.estimatedStoppingDistance40KmhM,
    frontImbalancePercent: params.brakeAudit.frontImbalancePercent,
    rearImbalancePercent: params.brakeAudit.rearImbalancePercent,
    handbrakeSlopePercent: params.brakeAudit.requiredHandbrakeSlopePercent,
    steeringPlayDegrees: params.steeringAudit.steeringPlayDegrees,
    dotMoisturePercent: params.dotMoisturePercent,
    safetyScore,
    isRoadworthy,
    inspectingCenterName: center.name,
    issueDate: '2026-10-18',
    expiryDate: '2027-10-18',
    qrSecurityHash: `AZ-BDYP-TRM-${serial}-${cleanPlate.replace(/[^A-Z0-9]/g, '')}-${isRoadworthy ? 'PASS' : 'HOLD'}`,
  };
}

export function lookupBrakeCertificateByCode(query: string): BrakeSteeringCertificate | null {
  const normalized = query.trim().toUpperCase();
  if (!normalized) return null;
  return (
    SAMPLE_BRAKE_CERTIFICATES.find(
      (cert) =>
        cert.certificateNumber.toUpperCase() === normalized ||
        cert.plateNumber.toUpperCase() === normalized ||
        cert.vin.toUpperCase() === normalized
    ) || null
  );
}

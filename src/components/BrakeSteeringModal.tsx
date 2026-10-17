import React, { useState, useMemo } from 'react';
import { Vehicle, Currency } from '../types/vehicle';
import { formatPrice } from '../utils/i18n';
import {
  VehicleBrakeClass,
  RoadSurfaceCondition,
  BrakeFluidType,
  PowerSteeringType,
  STATUTORY_BRAKE_STEERING_NORMS,
  ROAD_SURFACE_SPECS,
  BRAKE_FLUID_SPECS,
  BRAKE_STEERING_SERVICE_PACKAGES,
  BRAKE_DIAGNOSTIC_CENTERS,
} from '../data/mockBrakeSteeringData';
import {
  inferVehicleBrakeClass,
  auditRollerBrakeStand,
  auditSteeringMechanism,
  simulateStoppingPhysics,
  auditPadRotorAndFluidHealth,
  generateBrakeSteeringCertificate,
  lookupBrakeCertificateByCode,
} from '../utils/brakeSteeringCompliance';
import {
  X,
  Gauge,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Activity,
  Sliders,
  Wrench,
  Building2,
  FileCheck,
  Search,
  Copy,
  Check,
  Flame,
  Navigation,
  Phone,
  Clock,
  Disc,
  Info,
} from 'lucide-react';

interface BrakeSteeringModalProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  currency: Currency;
  onClose: () => void;
}

type TabType = 'roller_stand' | 'steering_luft' | 'physics_fluid' | 'centers' | 'certificate';

export const BrakeSteeringModal: React.FC<BrakeSteeringModalProps> = ({
  isOpen,
  vehicle,
  currency,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('roller_stand');

  // Tab 1: Roller Brake Stand state
  const [vehicleClass, setVehicleClass] = useState<VehicleBrakeClass>(() =>
    inferVehicleBrakeClass(vehicle)
  );
  const [vehicleMassKg, setVehicleMassKg] = useState<number>(1650);
  const [frontLeftForceKn, setFrontLeftForceKn] = useState<number>(3.4);
  const [frontRightForceKn, setFrontRightForceKn] = useState<number>(3.3);
  const [rearLeftForceKn, setRearLeftForceKn] = useState<number>(2.1);
  const [rearRightForceKn, setRearRightForceKn] = useState<number>(2.0);
  const [handbrakeSlopePercent, setHandbrakeSlopePercent] = useState<number>(26);
  const [isLoadedState, setIsLoadedState] = useState<boolean>(false);
  const [hasHydraulicOrAirLeak, setHasHydraulicOrAirLeak] = useState<boolean>(false);

  // Tab 2: Steering Mechanism & Luftometer state
  const [steeringPlayDegrees, setSteeringPlayDegrees] = useState<number>(4.5);
  const [steeringType, setSteeringType] = useState<PowerSteeringType>('eps_electric');
  const [hasTieRodOrJointPlay, setHasTieRodOrJointPlay] = useState<boolean>(false);
  const [hasPowerSteeringFaultOrLeak, setHasPowerSteeringFaultOrLeak] = useState<boolean>(false);
  const [hasUnpinnedNutOrCrackedColumn, setHasUnpinnedNutOrCrackedColumn] = useState<boolean>(false);

  // Tab 3: Stopping Physics & Pad/Fluid Auditor state
  const [speedKmh, setSpeedKmh] = useState<number>(80);
  const [roadCondition, setRoadCondition] = useState<RoadSurfaceCondition>('dry_asphalt');
  const [reactionTimeSec, setReactionTimeSec] = useState<number>(1.0);
  const [absActive, setAbsActive] = useState<boolean>(true);
  const [frontPadMm, setFrontPadMm] = useState<number>(7.5);
  const [rearPadMm, setRearPadMm] = useState<number>(6.5);
  const [frontRotorDeltaMm, setFrontRotorDeltaMm] = useState<number>(1.6);
  const [fluidType, setFluidType] = useState<BrakeFluidType>('DOT_4');
  const [fluidMoisturePercent, setFluidMoisturePercent] = useState<number>(1.1);

  // Tab 4 & 5: Centers & Certificate state
  const [selectedCenterId, setSelectedCenterId] = useState<string>(BRAKE_DIAGNOSTIC_CENTERS[0].id);
  const [cityFilter, setCityFilter] = useState<string>('Hamısı');
  const [plateInput, setPlateInput] = useState<string>(vehicle?.plateNumber || '99-AA-777');
  const [vinInput, setVinInput] = useState<string>(vehicle?.vin || 'JTMAB3FV40D012984');
  const [lookupQuery, setLookupQuery] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const brakeAudit = useMemo(
    () =>
      auditRollerBrakeStand({
        vehicleClass,
        frontLeftForceKn,
        frontRightForceKn,
        rearLeftForceKn,
        rearRightForceKn,
        vehicleMassKg,
        handbrakeSlopePercent,
        isLoadedState,
        hasHydraulicOrAirLeak,
      }),
    [
      vehicleClass,
      frontLeftForceKn,
      frontRightForceKn,
      rearLeftForceKn,
      rearRightForceKn,
      vehicleMassKg,
      handbrakeSlopePercent,
      isLoadedState,
      hasHydraulicOrAirLeak,
    ]
  );

  const steeringAudit = useMemo(
    () =>
      auditSteeringMechanism({
        vehicleClass,
        steeringPlayDegrees,
        steeringType,
        hasTieRodOrJointPlay,
        hasPowerSteeringFaultOrLeak,
        hasUnpinnedNutOrCrackedColumn,
      }),
    [
      vehicleClass,
      steeringPlayDegrees,
      steeringType,
      hasTieRodOrJointPlay,
      hasPowerSteeringFaultOrLeak,
      hasUnpinnedNutOrCrackedColumn,
    ]
  );

  const physicsResult = useMemo(
    () =>
      simulateStoppingPhysics({
        speedKmh,
        roadCondition,
        reactionTimeSec,
        absActive,
        frontPadThicknessMm: frontPadMm,
        dotFluidMoisturePercent: fluidMoisturePercent,
        vehicleMassKg,
      }),
    [speedKmh, roadCondition, reactionTimeSec, absActive, frontPadMm, fluidMoisturePercent, vehicleMassKg]
  );

  const padFluidAudit = useMemo(
    () =>
      auditPadRotorAndFluidHealth({
        frontPadMm,
        rearPadMm,
        frontRotorDeltaMm,
        fluidType,
        fluidMoisturePercent,
      }),
    [frontPadMm, rearPadMm, frontRotorDeltaMm, fluidType, fluidMoisturePercent]
  );

  const certificate = useMemo(
    () =>
      generateBrakeSteeringCertificate({
        plateNumber: plateInput,
        vin: vinInput,
        vehicleTitle: vehicle?.title || 'Toyota Land Cruiser 300',
        brakeAudit,
        steeringAudit,
        dotMoisturePercent: fluidMoisturePercent,
        centerId: selectedCenterId,
      }),
    [plateInput, vinInput, vehicle, brakeAudit, steeringAudit, fluidMoisturePercent, selectedCenterId]
  );

  const lookupResult = useMemo(() => lookupBrakeCertificateByCode(lookupQuery), [lookupQuery]);

  const filteredCenters = useMemo(() => {
    if (cityFilter === 'Hamısı') return BRAKE_DIAGNOSTIC_CENTERS;
    return BRAKE_DIAGNOSTIC_CENTERS.filter((c) => c.city === cityFilter);
  }, [cityFilter]);

  if (!isOpen) return null;

  const overallCompliant = brakeAudit.isCompliant && steeringAudit.isCompliant;
  const activeNorm = STATUTORY_BRAKE_STEERING_NORMS[vehicleClass];

  const handleApplyPreset = (preset: 'ideal' | 'caliper_imbalance' | 'steering_play' | 'mountain_fade') => {
    if (preset === 'ideal') {
      setFrontLeftForceKn(3.4);
      setFrontRightForceKn(3.3);
      setRearLeftForceKn(2.1);
      setRearRightForceKn(2.0);
      setHandbrakeSlopePercent(26);
      setHasHydraulicOrAirLeak(false);
      setSteeringPlayDegrees(4.0);
      setHasTieRodOrJointPlay(false);
      setHasPowerSteeringFaultOrLeak(false);
      setHasUnpinnedNutOrCrackedColumn(false);
      setFrontPadMm(8.0);
      setFluidMoisturePercent(1.0);
    } else if (preset === 'caliper_imbalance') {
      setFrontLeftForceKn(3.6);
      setFrontRightForceKn(2.2); // >15% imbalance
      setRearLeftForceKn(1.4);
      setRearRightForceKn(1.3);
      setHandbrakeSlopePercent(18); // <23% curb weight
      setHasHydraulicOrAirLeak(false);
    } else if (preset === 'steering_play') {
      setSteeringPlayDegrees(14.5); // >10° limit for M1
      setHasTieRodOrJointPlay(true);
      setHasPowerSteeringFaultOrLeak(true);
    } else if (preset === 'mountain_fade') {
      setSpeedKmh(100);
      setRoadCondition('wet_asphalt');
      setFrontPadMm(1.8);
      setFluidMoisturePercent(4.1);
      setFrontRotorDeltaMm(-0.4);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      data-testid="brake-steering-modal"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[93vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 text-white shadow-lg shadow-red-500/25">
              <Disc className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  BDYP Tormoz Sistemi & Sükan İdarə Mexanizmi Stendi
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30">
                  YHQ Əlavə 1 • Bölmə I & II
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  İXM Maddə 342.2 (150 ₼) & 96.1.4
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                MAHA Roller Tormoz Stendi (≤14.7m, ≤15% fərq), Əl əyləci mailliyi (16%/23%/31%), Sükan Lüftometri (≤10°) və DOT-4 Qaynama Auditoru
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            data-testid="close-brake-steering-modal"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Scenarios & Overall Status Bar */}
        <div className="px-4 sm:px-6 py-3 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Sınaq Ssenariləri:
            </span>
            <button
              type="button"
              onClick={() => handleApplyPreset('ideal')}
              data-testid="preset-ideal-btn"
              className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer"
            >
              ✓ Zavod Etalonu (Saz)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('caliper_imbalance')}
              data-testid="preset-imbalance-btn"
              className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all cursor-pointer"
            >
              ⚠ Support Tutulması (&gt;15% Fərq)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('steering_play')}
              data-testid="preset-steering-play-btn"
              className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer"
            >
              🚨 Sükan Lüftü (&gt;10° + Tiyaqa)
            </button>
            <button
              type="button"
              onClick={() => {
                handleApplyPreset('mountain_fade');
                setActiveTab('physics_fluid');
              }}
              data-testid="preset-mountain-fade-btn"
              className="px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all cursor-pointer"
            >
              🔥 Ağsu Enişi: Qaynama (&gt;3% Su)
            </button>
          </div>

          <div
            data-testid="overall-roadworthiness-badge"
            className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${
              overallCompliant
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}
          >
            {overallCompliant ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>İSTİSMARA YARARLIDIR (YHQ Əlavə 1 Uyğun)</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>İSTİSMARI QADAĞANDIR (İXM 342.2 — 150 ₼ + Evakuasiya)</span>
              </>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 pt-3 border-b border-slate-800 bg-slate-950/40 overflow-x-auto">
          {[
            { id: 'roller_stand' as TabType, label: '1. Tormoz Stendi (Bölmə I)', icon: Disc },
            { id: 'steering_luft' as TabType, label: '2. Sükan Lüftometri (Bölmə II)', icon: Sliders },
            { id: 'physics_fluid' as TabType, label: '3. Fiziki Dayanma & DOT-4 / Disk', icon: Flame },
            { id: 'centers' as TabType, label: '4. BDYP Stendlər & Servis', icon: Building2 },
            { id: 'certificate' as TabType, label: '5. Rəsmi E-Sertifikat (BDYP-TRM)', icon: FileCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                data-testid={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-red-500 text-white bg-slate-900/90'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <Icon className="w-4 h-4 text-red-400" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: ROLLER BRAKE STAND (YHQ ANNEX 1 SECTION I) */}
          {activeTab === 'roller_stand' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Controls (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-red-400" />
                      <span>MAHA IW-2 Barabanlı Tormoz Stendi Parametrləri</span>
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Etalon Sürət: {activeNorm.testSpeedKmh} km/saat
                    </span>
                  </div>

                  {/* Vehicle Class & Weight */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Nəqliyyat Vasitəsi Kateqoriyası (YHQ)
                      </label>
                      <select
                        value={vehicleClass}
                        data-testid="select-brake-vehicle-class"
                        onChange={(e) => setVehicleClass(e.target.value as VehicleBrakeClass)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      >
                        {Object.values(STATUTORY_BRAKE_STEERING_NORMS).map((norm) => (
                          <option key={norm.vehicleClass} value={norm.vehicleClass}>
                            {norm.labelAz}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Avtomobilin Faktiki Kütləsi: <strong className="text-white">{vehicleMassKg} kq</strong>
                      </label>
                      <input
                        type="range"
                        min={600}
                        max={8000}
                        step={50}
                        value={vehicleMassKg}
                        data-testid="slider-vehicle-mass"
                        onChange={(e) => setVehicleMassKg(Number(e.target.value))}
                        className="w-full accent-red-500"
                      />
                    </div>
                  </div>

                  {/* Front Axle Left/Right Brake Force */}
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200">
                        Ön Ox Tormoz Qüvvəsi (Sol / Sağ) — Norma Fərq ≤ {activeNorm.maxFrontAxleImbalancePercent}%
                      </span>
                      <span
                        data-testid="front-imbalance-value"
                        className={`font-bold px-2 py-0.5 rounded ${
                          brakeAudit.frontImbalanceCompliant
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        Disbalans: {brakeAudit.frontImbalancePercent}%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          Ön Sol Təkər: <strong className="text-white">{frontLeftForceKn.toFixed(1)} kN</strong>
                        </label>
                        <input
                          type="range"
                          min={0.5}
                          max={8.0}
                          step={0.1}
                          value={frontLeftForceKn}
                          data-testid="slider-front-left-kn"
                          onChange={(e) => setFrontLeftForceKn(Number(e.target.value))}
                          className="w-full accent-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          Ön Sağ Təkər: <strong className="text-white">{frontRightForceKn.toFixed(1)} kN</strong>
                        </label>
                        <input
                          type="range"
                          min={0.5}
                          max={8.0}
                          step={0.1}
                          value={frontRightForceKn}
                          data-testid="slider-front-right-kn"
                          onChange={(e) => setFrontRightForceKn(Number(e.target.value))}
                          className="w-full accent-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Rear Axle Left/Right Brake Force */}
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200">
                        Arxa Ox Tormoz Qüvvəsi (Sol / Sağ) — Norma Fərq ≤ {activeNorm.maxRearAxleImbalancePercent}%
                      </span>
                      <span
                        data-testid="rear-imbalance-value"
                        className={`font-bold px-2 py-0.5 rounded ${
                          brakeAudit.rearImbalanceCompliant
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        Disbalans: {brakeAudit.rearImbalancePercent}%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          Arxa Sol Təkər: <strong className="text-white">{rearLeftForceKn.toFixed(1)} kN</strong>
                        </label>
                        <input
                          type="range"
                          min={0.3}
                          max={6.0}
                          step={0.1}
                          value={rearLeftForceKn}
                          data-testid="slider-rear-left-kn"
                          onChange={(e) => setRearLeftForceKn(Number(e.target.value))}
                          className="w-full accent-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          Arxa Sağ Təkər: <strong className="text-white">{rearRightForceKn.toFixed(1)} kN</strong>
                        </label>
                        <input
                          type="range"
                          min={0.3}
                          max={6.0}
                          step={0.1}
                          value={rearRightForceKn}
                          data-testid="slider-rear-right-kn"
                          onChange={(e) => setRearRightForceKn(Number(e.target.value))}
                          className="w-full accent-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Handbrake Slope Hold & Hydraulic Leak */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-semibold">
                          Əl Əyləci Mailliyi (Bənd 1.5):
                        </span>
                        <strong className="text-amber-400">{handbrakeSlopePercent}%</strong>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={40}
                        step={1}
                        value={handbrakeSlopePercent}
                        data-testid="slider-handbrake-slope"
                        onChange={(e) => setHandbrakeSlopePercent(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                      <label className="flex items-center gap-2 text-[11px] text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isLoadedState}
                          onChange={(e) => setIsLoadedState(e.target.checked)}
                          className="rounded border-slate-700"
                        />
                        <span>Tam yüklü rejim (Norma ≥16%, yüksüz ≥{activeNorm.minHandbrakeSlopeCurbWeightPercent}%)</span>
                      </label>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                      <span className="text-xs font-semibold text-slate-300">
                        Hidravlik / Pnevmatik Kiplik (YHQ Bənd 1.3):
                      </span>
                      <label className="flex items-center gap-2 text-xs text-slate-300 mt-2 cursor-pointer">
                        <input
                          type="checkbox"
                          data-testid="checkbox-hydraulic-leak"
                          checked={hasHydraulicOrAirLeak}
                          onChange={(e) => setHasHydraulicOrAirLeak(e.target.checked)}
                          className="rounded border-slate-700 accent-rose-500"
                        />
                        <span>Tormoz şlanqında maye sızması və ya pnevmatik təzyiq düşməsi var</span>
                      </label>
                      <span className="text-[11px] text-slate-500 mt-1">
                        Kiplik pozulduqda istismar dərhal qadağandır.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Telemetry & Statutory Verdict (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                      YHQ Əlavə 1 Bölmə I Diaqnostika Nəticəsi
                    </span>
                    <span
                      data-testid="brake-safety-score"
                      className="px-2.5 py-1 rounded-full text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    >
                      Təhlükəsizlik: {brakeAudit.brakeSafetyScore}/100
                    </span>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">
                        40 km/s Tormoz Yolu (Norma ≤ {activeNorm.maxStoppingDistanceM} m)
                      </span>
                      <span
                        data-testid="stopping-distance-40kmh"
                        className={`text-xl font-black ${
                          brakeAudit.stoppingDistanceCompliant ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {brakeAudit.estimatedStoppingDistance40KmhM} m
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">
                        Yavaşıma Təcili j (Norma ≥ {activeNorm.minDecelerationMs2} m/s²)
                      </span>
                      <span
                        data-testid="deceleration-ms2"
                        className={`text-xl font-black ${
                          brakeAudit.decelerationCompliant ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {brakeAudit.estimatedDecelerationMs2} m/s²
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">
                        Cəmi Tormoz Qüvvəsi (γT ≥ {activeNorm.minSpecificBrakeForce})
                      </span>
                      <span className="text-lg font-black text-white">
                        {brakeAudit.totalBrakeForceKn} kN ({brakeAudit.specificBrakeForceRatio})
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">
                        İXM Maddə 342.2 Cəriməsi
                      </span>
                      <span
                        data-testid="brake-fine-amount"
                        className={`text-lg font-black ${
                          brakeAudit.individualFineAzn === 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {brakeAudit.individualFineAzn === 0
                          ? '0 ₼ (Qanuni)'
                          : `${formatPrice(brakeAudit.individualFineAzn, currency)} (Güzəşt: ${formatPrice(
                              brakeAudit.earlyPaymentFineAzn,
                              currency
                            )})`}
                      </span>
                    </div>
                  </div>

                  {/* Prohibition Alert Banner */}
                  {brakeAudit.prohibitionTriggered && (
                    <div
                      data-testid="brake-prohibition-banner"
                      className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 space-y-1.5"
                    >
                      <div className="flex items-center gap-2 font-bold text-rose-300">
                        <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                        <span>İXM Maddə 96.1.4 & YHQ Maddə 85: İstismarın Qadağan Edilməsi!</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        Tormoz sistemi nasaz olan nəqliyyat vasitəsinin öz gedişi ilə hərəkəti qəti qadağandır. Avtomobil evakuator vasitəsilə BDYP mühafizə olunan duracağına təxliyə edilir. Vəzifəli şəxslər üçün cərimə: <strong>{brakeAudit.officialPersonFineAzn} AZN</strong>, hüquqi şəxslər: <strong>{brakeAudit.legalEntityFineAzn} AZN</strong> (İXM Maddə 348).
                      </p>
                    </div>
                  )}

                  {/* Violations & Recommendations */}
                  {brakeAudit.violationsAz.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-rose-400 block">
                        Aşkar Edilən Qanun Pozuntuları:
                      </span>
                      {brakeAudit.violationsAz.map((v, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/40 text-xs text-rose-200"
                        >
                          • {v}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-emerald-400 block">
                      Mühəndis Tövsiyəsi:
                    </span>
                    {brakeAudit.recommendationsAz.map((rec, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300"
                      >
                        ✓ {rec}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STEERING MECHANISM & LUFTOMETER (YHQ ANNEX 1 SECTION II) */}
          {activeTab === 'steering_luft' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-amber-400" />
                      <span>BDYP Lazer Lüftometr Stendi (YHQ Əlavə 1, Bölmə II)</span>
                    </h3>
                    <span className="text-xs text-amber-300 font-semibold">
                      Norma ≤ {activeNorm.maxSteeringPlayDegrees}°
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Sükan Çarxının Cəmi Lüftü (Boş Gediş Bucağı):{' '}
                      <strong
                        data-testid="steering-play-degrees-display"
                        className={
                          steeringAudit.playAngleCompliant ? 'text-emerald-400' : 'text-rose-400'
                        }
                      >
                        {steeringPlayDegrees}°
                      </strong>{' '}
                      (Yol verilən hədd: ≤ {activeNorm.maxSteeringPlayDegrees}°)
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={35}
                      step={0.5}
                      value={steeringPlayDegrees}
                      data-testid="slider-steering-play"
                      onChange={(e) => setSteeringPlayDegrees(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>0° (Sıfır boşluq)</span>
                      <span>10° (M1 Minik həddi)</span>
                      <span>20° (M2/M3 Avtobus həddi)</span>
                      <span>25° (N1-N3 Yük həddi)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Sükan Gücləndiricisinin Konstruksiya Tipi
                    </label>
                    <select
                      value={steeringType}
                      onChange={(e) => setSteeringType(e.target.value as PowerSteeringType)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    >
                      <option value="eps_electric">EPS — Elektrik Sükan Gücləndiricisi (Servodrive)</option>
                      <option value="ehps_electro_hydraulic">EHPS — Elektro-Hidravlik Sükan Sistemi</option>
                      <option value="hps_hydraulic">HPS (ГУР) — Klassik Hidravlik Nasoslu Reyka</option>
                      <option value="manual_rack">Mexaniki Reyka (Gücləndiricisiz)</option>
                    </select>
                  </div>

                  {/* Mechanical Defect Checkboxes (Clauses 2.2 & 2.3) */}
                  <div className="space-y-2.5 pt-2">
                    <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        data-testid="checkbox-tierod-play"
                        checked={hasTieRodOrJointPlay}
                        onChange={(e) => setHasTieRodOrJointPlay(e.target.checked)}
                        className="mt-0.5 rounded border-slate-700 accent-rose-500"
                      />
                      <div className="text-xs">
                        <strong className="text-white block">
                          YHQ Bənd 2.2: Sükan dartqılarında (tiyaqa) və ya ucluqlarda (nakoneçnik) boşluq
                        </strong>
                        <span className="text-slate-400">
                          Detalların və qovşaqların konstruksiyada nəzərdə tutulmayan tərpənməsi
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        data-testid="checkbox-power-steering-fault"
                        checked={hasPowerSteeringFaultOrLeak}
                        onChange={(e) => setHasPowerSteeringFaultOrLeak(e.target.checked)}
                        className="mt-0.5 rounded border-slate-700 accent-rose-500"
                      />
                      <div className="text-xs">
                        <strong className="text-white block">
                          YHQ Bənd 2.3: Sükan gücləndiricisi (EPS / ГУР) nasazlığı və ya yağ sızması
                        </strong>
                        <span className="text-slate-400">
                          EPS xətası, ГУР nasosunun uğultusu və ya yüksək təzyiq salnikindən sızma
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        data-testid="checkbox-unpinned-column"
                        checked={hasUnpinnedNutOrCrackedColumn}
                        onChange={(e) => setHasUnpinnedNutOrCrackedColumn(e.target.checked)}
                        className="mt-0.5 rounded border-slate-700 accent-rose-500"
                      />
                      <div className="text-xs">
                        <strong className="text-white block">
                          YHQ Bənd 2.2: Yiv birləşmələrinin ştiftlənməməsi və ya kardan valı çatlaması
                        </strong>
                        <span className="text-slate-400">
                          Sükan qovşağı qaykalarının açılma və idarəetmənin tam itirilməsi riski
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                      Sükan Mexanizmi Ekspertizası
                    </span>
                    <span
                      data-testid="steering-health-score"
                      className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    >
                      Sükan Balı: {steeringAudit.steeringHealthScore}/100
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Faktiki / Norma Lüft</span>
                      <span
                        className={`text-xl font-black ${
                          steeringAudit.playAngleCompliant ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {steeringAudit.steeringPlayDegrees}° / ≤{steeringAudit.maxAllowedPlayDegrees}°
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">İXM Maddə 342.2</span>
                      <span
                        data-testid="steering-fine-amount"
                        className={`text-lg font-black ${
                          steeringAudit.individualFineAzn === 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {steeringAudit.individualFineAzn === 0
                          ? '0 ₼ (Saz)'
                          : `${formatPrice(steeringAudit.individualFineAzn, currency)}`}
                      </span>
                    </div>
                  </div>

                  {steeringAudit.violationsAz.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-rose-400 block">
                        Sükan Mexanizmi Pozuntuları:
                      </span>
                      {steeringAudit.violationsAz.map((v, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/40 text-xs text-rose-200"
                        >
                          • {v}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-emerald-400 block">
                      Tövsiyə Olunan Əməliyyat:
                    </span>
                    {steeringAudit.recommendationsAz.map((rec, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300"
                      >
                        ✓ {rec}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STOPPING PHYSICS & PAD / ROTOR / DOT-4 FLUID AUDITOR */}
          {activeTab === 'physics_fluid' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Stopping Distance Physics Simulator (6 cols) */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>Real-Vaxt Dayanma Məsafəsi Fizika Simulyatoru</span>
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Hərəkət Sürəti: <strong className="text-cyan-400">{speedKmh} km/saat</strong> ({physicsResult.speedMs} m/san)
                    </label>
                    <input
                      type="range"
                      min={20}
                      max={160}
                      step={5}
                      value={speedKmh}
                      data-testid="slider-physics-speed"
                      onChange={(e) => setSpeedKmh(Number(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Yol Örtüyü və Hava Şəraiti
                      </label>
                      <select
                        value={roadCondition}
                        data-testid="select-road-condition"
                        onChange={(e) => setRoadCondition(e.target.value as RoadSurfaceCondition)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      >
                        {Object.values(ROAD_SURFACE_SPECS).map((spec) => (
                          <option key={spec.id} value={spec.id}>
                            {spec.nameAz}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Sürücü Reaksiya Müddəti: <strong className="text-white">{reactionTimeSec.toFixed(1)} san</strong>
                      </label>
                      <input
                        type="range"
                        min={0.5}
                        max={2.5}
                        step={0.1}
                        value={reactionTimeSec}
                        onChange={(e) => setReactionTimeSec(Number(e.target.value))}
                        className="w-full accent-purple-500"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={absActive}
                      onChange={(e) => setAbsActive(e.target.checked)}
                      className="rounded border-slate-700 accent-cyan-500"
                    />
                    <span>ABS (Antibloklama Sistemi) aktivdir</span>
                  </label>

                  {/* Visual Stopping Breakdown */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Reaksiya Yolu</span>
                        <span className="text-base font-black text-amber-400">
                          {physicsResult.reactionDistanceM} m
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Tormoz Yolu</span>
                        <span className="text-base font-black text-blue-400">
                          {physicsResult.brakingDistanceM} m
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Tam Dayanma</span>
                        <span
                          data-testid="total-stopping-distance"
                          className="text-base font-black text-white"
                        >
                          {physicsResult.totalStoppingDistanceM} m
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                      <span>Kinetik Enerji: <strong className="text-white">{physicsResult.kineticEnergyKj} kC</strong></span>
                      <span>
                        40m məsafədəki maneəyə zərbə sürəti:{' '}
                        <strong
                          data-testid="obstacle-impact-speed"
                          className={
                            physicsResult.obstacleAt40mImpactSpeedKmh === 0
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }
                        >
                          {physicsResult.obstacleAt40mImpactSpeedKmh === 0
                            ? '0 km/s (Toqquşma yoxdur)'
                            : `${physicsResult.obstacleAt40mImpactSpeedKmh} km/saat!`}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Brake Pad, Rotor & DOT-4 Boiling Auditor (6 cols) */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span>Nakladka, Disk (MIN TH) & DOT-4 Nəmlik Auditoru</span>
                    </h3>
                    <span
                      data-testid="boiling-point-badge"
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        padFluidAudit.mountainDescentSafe
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      Qaynama: {padFluidAudit.estimatedBoilingPointC}°C
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Ön Nakladka Qalınlığı: <strong className="text-white">{frontPadMm.toFixed(1)} mm</strong> (Min 3.0 mm)
                      </label>
                      <input
                        type="range"
                        min={1.0}
                        max={12.0}
                        step={0.5}
                        value={frontPadMm}
                        data-testid="slider-front-pad-mm"
                        onChange={(e) => setFrontPadMm(Number(e.target.value))}
                        className="w-full accent-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Tormoz Mayesi Nəmliyi: <strong className="text-white">{fluidMoisturePercent.toFixed(1)}%</strong> (Kritik &gt;3.0%)
                      </label>
                      <input
                        type="range"
                        min={0.0}
                        max={5.0}
                        step={0.1}
                        value={fluidMoisturePercent}
                        data-testid="slider-fluid-moisture"
                        onChange={(e) => setFluidMoisturePercent(Number(e.target.value))}
                        className="w-full accent-rose-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Tormoz Mayesi Standartı</label>
                      <select
                        value={fluidType}
                        onChange={(e) => setFluidType(e.target.value as BrakeFluidType)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      >
                        {Object.values(BRAKE_FLUID_SPECS).map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Disk Qalınlığı Ehtiyatı (MIN TH-dən): <strong className="text-white">{frontRotorDeltaMm.toFixed(1)} mm</strong>
                      </label>
                      <input
                        type="range"
                        min={-1.0}
                        max={3.0}
                        step={0.2}
                        value={frontRotorDeltaMm}
                        onChange={(e) => setFrontRotorDeltaMm(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {padFluidAudit.findingsAz.map((f, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border text-xs ${
                          padFluidAudit.mountainDescentSafe
                            ? 'bg-slate-900 border-slate-800 text-slate-200'
                            : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                        }`}
                      >
                        • {f}
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Təxmini Servis & Ehtiyat Hissəsi Xərci:</span>
                    <strong className="text-amber-400 text-sm" data-testid="estimated-service-cost">
                      {formatPrice(padFluidAudit.estimatedServiceCostAzn, currency)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACCREDITED CENTERS & SERVICE PACKAGES */}
          {activeTab === 'centers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-red-400" />
                  <span>Akkreditə Olunmuş BDYP & AZS Tormoz / Lüftometr Stendləri</span>
                </h3>
                <div className="flex items-center gap-1.5">
                  {['Hamısı', 'Bakı', 'Xırdalan', 'Sumqayıt', 'Gəncə'].map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setCityFilter(city)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        cityFilter === city
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCenters.map((center) => (
                  <div
                    key={center.id}
                    onClick={() => setSelectedCenterId(center.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      selectedCenterId === center.id
                        ? 'bg-red-950/20 border-red-500 shadow-lg shadow-red-500/10'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-red-300">
                          {center.city}
                        </span>
                        <span className="text-xs font-bold text-amber-400">★ {center.rating}</span>
                      </div>
                      <h4 className="font-bold text-white text-sm">{center.name}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Navigation className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <span>{center.address}</span>
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Wrench className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                        <span>Stend: {center.rollerStandBrand}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {center.workingHours} • <Phone className="w-3 h-3" /> {center.phone}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400">{center.certifiedBy}</span>
                      <span className="font-black text-emerald-400">
                        {formatPrice(center.diagnosticFeeAzn, currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Service Packages */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400">
                  Standart Tormoz & Sükan Bərpa Paketləri (Bakı Servis Tarifləri)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {BRAKE_STEERING_SERVICE_PACKAGES.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <h5 className="text-xs font-bold text-white">{pkg.nameAz}</h5>
                        <p className="text-[11px] text-slate-400">{pkg.descriptionAz}</p>
                        <span className="inline-block text-[10px] text-red-300 font-medium">
                          Həll edir: {pkg.resolvesClause}
                        </span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-sm font-black text-emerald-400 block">
                          {formatPrice(pkg.avgPartsCostAzn + pkg.avgLaborCostAzn, currency)}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Zəmanət: {pkg.warrantyKm.toLocaleString()} km
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: OFFICIAL CERTIFICATE & REGISTRY LOOKUP */}
          {activeTab === 'certificate' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Certificate Preview (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-red-500/40 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 block">
                        Azərbaycan Respublikası DİN BDYPİ & AZS Stend Protokolu
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-white">
                        TORMOZ VƏ SÜKAN SİSTEMİ UYĞUNLUQ SERTİFİKATI
                      </h3>
                    </div>
                    <div className="text-right">
                      <span
                        data-testid="certificate-number"
                        className="font-mono text-xs sm:text-sm font-black text-amber-400 block"
                      >
                        {certificate.certificateNumber}
                      </span>
                      <span className="text-[10px] text-slate-400">Tarix: {certificate.issueDate}</span>
                    </div>
                  </div>

                  {/* Inputs for Plate & VIN */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Dövlət Qeydiyyat Nişanı
                      </label>
                      <input
                        type="text"
                        value={plateInput}
                        data-testid="cert-plate-input"
                        onChange={(e) => setPlateInput(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-white uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        VIN (Ban Nömrəsi)
                      </label>
                      <input
                        type="text"
                        value={vinInput}
                        onChange={(e) => setVinInput(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-white uppercase"
                      />
                    </div>
                  </div>

                  {/* Telemetry Summary Table */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">40 km/s Tormoz Yolu</span>
                      <strong className="text-white">{certificate.stoppingDistance40KmhM} m</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Ön / Arxa Disbalans</span>
                      <strong className="text-white">
                        {certificate.frontImbalancePercent}% / {certificate.rearImbalancePercent}%
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Sükan Çarxı Lüftü</span>
                      <strong className="text-white">{certificate.steeringPlayDegrees}°</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Əl Əyləci Norması</span>
                      <strong className="text-white">≥ {certificate.handbrakeSlopePercent}%</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">DOT Maye Nəmliyi</span>
                      <strong className="text-white">{certificate.dotMoisturePercent}%</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Yekun Rəy</span>
                      <strong className={certificate.isRoadworthy ? 'text-emerald-400' : 'text-rose-400'}>
                        {certificate.isRoadworthy ? 'YARARLIDIR' : 'QADAĞANDIR'}
                      </strong>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
                    <div className="text-[11px] text-slate-400">
                      <span className="block font-semibold text-slate-300">
                        Sınaq Mərkəzi: {certificate.inspectingCenterName}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">
                        QR Hash: {certificate.qrSecurityHash}
                      </span>
                    </div>

                    <button
                      type="button"
                      data-testid="copy-certificate-btn"
                      onClick={() => {
                        navigator.clipboard?.writeText(certificate.certificateNumber);
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedCode ? 'Kopyalandı!' : 'Protokol Kodunu Kopyala'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Unified Registry Lookup (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Search className="w-4 h-4 text-amber-400" />
                    <span>Vahid Elektron Stend Reyestrində Yoxlama</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Sertifikat nömrəsi (məs: <code className="text-amber-300">BDYP-TRM-2026-84102</code>) və ya dövlət nömrə nişanı (<code className="text-amber-300">99-AA-777</code>) daxil edin:
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={lookupQuery}
                      data-testid="registry-lookup-input"
                      onChange={(e) => setLookupQuery(e.target.value)}
                      placeholder="BDYP-TRM-2026-84102 və ya 99-AA-777"
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono uppercase"
                    />
                  </div>

                  {lookupQuery.trim() !== '' && (
                    <div
                      data-testid="registry-lookup-result"
                      className={`p-3.5 rounded-xl border text-xs ${
                        lookupResult
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                          : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                      }`}
                    >
                      {lookupResult ? (
                        <div className="space-y-1">
                          <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Təsdiqlənmiş Protokol Tapıldı: {lookupResult.certificateNumber}</span>
                          </div>
                          <p>Avtomobil: {lookupResult.vehicleTitle} ({lookupResult.plateNumber})</p>
                          <p>
                            40 km/s Tormoz yolu: {lookupResult.stoppingDistance40KmhM} m • Sükan lüftü: {lookupResult.steeringPlayDegrees}°
                          </p>
                          <p className="text-[11px] text-emerald-400">
                            Etibarlıdır: {lookupResult.expiryDate} tarixinədək
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Info className="w-4 h-4 text-rose-400 flex-shrink-0" />
                          <span>Daxil edilən sorğu üzrə aktiv tormoz stend protokolu tapılmadı.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

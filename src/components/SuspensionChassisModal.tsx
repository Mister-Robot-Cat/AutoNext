import React, { useState, useMemo } from 'react';
import { Vehicle, Currency } from '../types/vehicle';
import {
  SuspensionModId,
  WheelFastenerConditionId,
  SUSPENSION_MODIFICATION_PROFILES,
  WHEEL_FASTENER_PROFILES,
  CHASSIS_SERVICE_PACKAGES,
  ACCREDITED_SUSPENSION_CENTERS,
  SAMPLE_SUSPENSION_CERTIFICATES,
} from '../data/mockSuspensionChassisData';
import {
  evaluateEusamaAndPeredokCompliance,
  evaluateWheelFastenersAnd3dGeometry,
  calculateSuspensionServiceCost,
  generateSuspensionComplianceCertificate,
  lookupSuspensionCertificateByCode,
  convertFromAzn,
} from '../utils/suspensionChassisCompliance';
import {
  X,
  Activity,
  Compass,
  Wrench,
  Building2,
  FileCheck,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Search,
  Disc,
  Gauge,
} from 'lucide-react';

interface SuspensionChassisModalProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  currency: Currency;
  onClose: () => void;
}

type TabId = 'eusama' | 'geometry' | 'packages' | 'centers' | 'certificate';

export const SuspensionChassisModal: React.FC<SuspensionChassisModalProps> = ({
  isOpen,
  vehicle,
  currency,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('eusama');

  // Tab 1: MAHA EUSAMA & Peredok Clearance state
  const [flEusama, setFlEusama] = useState<number>(72);
  const [frEusama, setFrEusama] = useState<number>(70);
  const [rlEusama, setRlEusama] = useState<number>(68);
  const [rrEusama, setRrEusama] = useState<number>(67);
  const [suspensionModId, setSuspensionModId] =
    useState<SuspensionModId>('oem_standard');
  const [frontArchGapMm, setFrontArchGapMm] = useState<number>(65);
  const [rearArchGapMm, setRearArchGapMm] = useState<number>(65);
  const [stabilizerBarIntact, setStabilizerBarIntact] = useState<boolean>(true);
  const [airSuspensionHermetic, setAirSuspensionHermetic] =
    useState<boolean>(true);

  // Tab 2: YHQ 5.4/5.5 Wheel Fasteners & 3D Alignment / Longeron state
  const [wheelFastenerCondition, setWheelFastenerCondition] =
    useState<WheelFastenerConditionId>('intact_oem_bolts_rims');
  const [missingLugBoltsCount, setMissingLugBoltsCount] = useState<number>(0);
  const [hasCrackedOrWeldedRim, setHasCrackedOrWeldedRim] =
    useState<boolean>(false);
  const [frontToeMm, setFrontToeMm] = useState<number>(0.8);
  const [frontCamberDeg, setFrontCamberDeg] = useState<number>(-0.7);
  const [casterLeftRightDeltaDeg, setCasterLeftRightDeltaDeg] =
    useState<number>(0.15);
  const [longeronDiagonalDeltaMm, setLongeronDiagonalDeltaMm] =
    useState<number>(1.2);

  // Tab 3: Service Packages
  const [selectedPackages, setSelectedPackages] = useState<string[]>([
    'pkg-hunter-3d-alignment',
    'pkg-maha-eusama-shock',
  ]);

  // Tab 4: Accredited Centers
  const [cityFilter, setCityFilter] = useState<string>('ALL');
  const [selectedCenterId, setSelectedCenterId] =
    useState<string>('susp-center-1');

  // Tab 5: Certificate & Registry Lookup
  const [plateInput, setPlateInput] = useState<string>(
    vehicle?.plateNumber || '10-AA-700'
  );
  const [vinInput, setVinInput] = useState<string>(
    vehicle?.vin || 'JTJHY7AX6P4012988'
  );
  const [ownerName, setOwnerName] = useState<string>(
    'Kərimov Rəşad İlham oğlu'
  );
  const [registrySearchQuery, setRegistrySearchQuery] = useState<string>('');
  const [copiedCert, setCopiedCert] = useState<boolean>(false);

  const currencySymbol =
    currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₼';

  const eusamaResult = useMemo(
    () =>
      evaluateEusamaAndPeredokCompliance({
        frontLeftEusamaPercent: flEusama,
        frontRightEusamaPercent: frEusama,
        rearLeftEusamaPercent: rlEusama,
        rearRightEusamaPercent: rrEusama,
        suspensionModId,
        frontArchGapMm,
        rearArchGapMm,
        stabilizerBarIntact,
        airSuspensionHermetic,
      }),
    [
      flEusama,
      frEusama,
      rlEusama,
      rrEusama,
      suspensionModId,
      frontArchGapMm,
      rearArchGapMm,
      stabilizerBarIntact,
      airSuspensionHermetic,
    ]
  );

  const geometryResult = useMemo(
    () =>
      evaluateWheelFastenersAnd3dGeometry({
        wheelFastenerCondition,
        missingLugBoltsCount,
        hasCrackedOrWeldedRim,
        frontToeMm,
        frontCamberDeg,
        casterLeftRightDeltaDeg,
        longeronDiagonalDeltaMm,
        vehicleMarketPriceAzn: vehicle?.priceAzn || 45000,
      }),
    [
      wheelFastenerCondition,
      missingLugBoltsCount,
      hasCrackedOrWeldedRim,
      frontToeMm,
      frontCamberDeg,
      casterLeftRightDeltaDeg,
      longeronDiagonalDeltaMm,
      vehicle?.priceAzn,
    ]
  );

  const serviceCostSummary = useMemo(
    () => calculateSuspensionServiceCost(selectedPackages, currency),
    [selectedPackages, currency]
  );

  const filteredCenters = useMemo(() => {
    if (cityFilter === 'ALL') return ACCREDITED_SUSPENSION_CENTERS;
    return ACCREDITED_SUSPENSION_CENTERS.filter((c) => c.city === cityFilter);
  }, [cityFilter]);

  const selectedCenter = useMemo(
    () =>
      ACCREDITED_SUSPENSION_CENTERS.find((c) => c.id === selectedCenterId) ??
      ACCREDITED_SUSPENSION_CENTERS[0],
    [selectedCenterId]
  );

  const generatedCertificate = useMemo(
    () =>
      generateSuspensionComplianceCertificate({
        plateNumber: plateInput,
        vin: vinInput,
        vehicleTitle: vehicle?.title || 'Toyota Land Cruiser 300 3.5 Twin-Turbo',
        ownerName,
        centerName: selectedCenter.name,
        frontEusamaAvgPercent: eusamaResult.frontAvgEusamaPercent,
        rearEusamaAvgPercent: eusamaResult.rearAvgEusamaPercent,
        maxAxleImbalancePercent: eusamaResult.maxAxleImbalancePercent,
        suspensionModId,
        frontToRearPitchDeltaMm: eusamaResult.frontToRearPitchDeltaMm,
        missingLugBoltsCount,
        longeronDiagonalDeltaMm,
      }),
    [
      plateInput,
      vinInput,
      vehicle?.title,
      ownerName,
      selectedCenter.name,
      eusamaResult.frontAvgEusamaPercent,
      eusamaResult.rearAvgEusamaPercent,
      eusamaResult.maxAxleImbalancePercent,
      suspensionModId,
      eusamaResult.frontToRearPitchDeltaMm,
      missingLugBoltsCount,
      longeronDiagonalDeltaMm,
    ]
  );

  const lookedUpCertificate = useMemo(
    () => lookupSuspensionCertificateByCode(registrySearchQuery),
    [registrySearchQuery]
  );

  if (!isOpen) return null;

  const togglePackage = (pkgId: string) => {
    setSelectedPackages((prev) =>
      prev.includes(pkgId)
        ? prev.filter((id) => id !== pkgId)
        : [...prev, pkgId]
    );
  };

  const handleCopyCertificate = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(generatedCertificate.certificateNumber);
    }
    setCopiedCert(true);
    setTimeout(() => setCopiedCert(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
      data-testid="suspension-chassis-modal"
    >
      <div
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[93vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white shadow-lg shadow-amber-500/25">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  BDYP & AZS Asqı (EUSAMA), «Peredok» Klirens, Təkər Boltu (YHQ 5.4) & 3D Şassi Portalı
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  YHQ Əlavə 1 Bənd 5.4 / 5.5 / 7.12 & İXM 342.2-1
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                MAHA FWT-1 Amortizator Vibrostendi, Ön-Arxa «Peredok» Disbalansı, Hunter 3D Razval-Sxojdeniya və Lonjeron Diaqonal Ekspertizası
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            data-testid="close-suspension-modal-btn"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-950/50 px-4 pt-2 gap-1.5 no-scrollbar">
          {[
            {
              id: 'eusama' as TabId,
              label: '1. MAHA EUSAMA & «Peredok»',
              icon: Activity,
              testId: 'tab-eusama',
            },
            {
              id: 'geometry' as TabId,
              label: '2. Bolt/Disk (YHQ 5.4) & 3D Razval',
              icon: Compass,
              testId: 'tab-geometry',
            },
            {
              id: 'packages' as TabId,
              label: '3. Təmir & 3D Razval Xərci',
              icon: Wrench,
              testId: 'tab-packages',
            },
            {
              id: 'centers' as TabId,
              label: '4. BDYP & Hunter 3D Mərkəzləri',
              icon: Building2,
              testId: 'tab-centers',
            },
            {
              id: 'certificate' as TabId,
              label: '5. BDYP-ASQ-2026 Sertifikatı',
              icon: FileCheck,
              testId: 'tab-certificate',
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                data-testid={tab.testId}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-amber-400 border-amber-500 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: MAHA EUSAMA & PEREDOK AUDITOR */}
          {activeTab === 'eusama' && (
            <div className="space-y-5" data-testid="eusama-tab-content">
              {/* Quick Presets */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Sürətli Stend Ssenariləri (Presets):
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    data-testid="preset-oem-healthy"
                    onClick={() => {
                      setFlEusama(74);
                      setFrEusama(72);
                      setRlEusama(70);
                      setRrEusama(69);
                      setSuspensionModId('oem_standard');
                      setFrontArchGapMm(65);
                      setRearArchGapMm(65);
                      setStabilizerBarIntact(true);
                      setAirSuspensionHermetic(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer"
                  >
                    ✓ Zavod Saz Asqı (74% EUSAMA)
                  </button>
                  <button
                    type="button"
                    data-testid="preset-illegal-peredok"
                    onClick={() => {
                      setFlEusama(42);
                      setFrEusama(40);
                      setRlEusama(32);
                      setRrEusama(30);
                      setSuspensionModId('peredok_front_lift');
                      setFrontArchGapMm(130);
                      setRearArchGapMm(45);
                      setStabilizerBarIntact(true);
                      setAirSuspensionHermetic(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer"
                  >
                    ⚠ Qanunsuz «Peredok» (+85 mm Disbalans — İXM 342.2-1)
                  </button>
                  <button
                    type="button"
                    data-testid="preset-blown-shock"
                    onClick={() => {
                      setFlEusama(16);
                      setFrEusama(58);
                      setRlEusama(45);
                      setRrEusama(44);
                      setSuspensionModId('oem_standard');
                      setFrontArchGapMm(65);
                      setRearArchGapMm(65);
                      setStabilizerBarIntact(false);
                      setAirSuspensionHermetic(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all cursor-pointer"
                  >
                    ⚡ Yağ Buraxmış Amortizator (16% EUSAMA & 42% Disbalans)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Left Column: MAHA EUSAMA 4-Wheel Sliders & Controls */}
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-amber-400" />
                    <span>MAHA FWT-1 EUSAMA Vibrostend və Klirens Parametrləri</span>
                  </h3>

                  {/* 4-Wheel EUSAMA Sliders */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400 font-semibold">Ön Sol (FL):</span>
                        <span className="font-bold text-amber-400" data-testid="fl-eusama-val">
                          {flEusama}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={95}
                        value={flEusama}
                        data-testid="fl-eusama-slider"
                        onChange={(e) => setFlEusama(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400 font-semibold">Ön Sağ (FR):</span>
                        <span className="font-bold text-amber-400" data-testid="fr-eusama-val">
                          {frEusama}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={95}
                        value={frEusama}
                        data-testid="fr-eusama-slider"
                        onChange={(e) => setFrEusama(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400 font-semibold">Arxa Sol (RL):</span>
                        <span className="font-bold text-cyan-400" data-testid="rl-eusama-val">
                          {rlEusama}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={95}
                        value={rlEusama}
                        data-testid="rl-eusama-slider"
                        onChange={(e) => setRlEusama(Number(e.target.value))}
                        className="w-full accent-cyan-500"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400 font-semibold">Arxa Sağ (RR):</span>
                        <span className="font-bold text-cyan-400" data-testid="rr-eusama-val">
                          {rrEusama}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={95}
                        value={rrEusama}
                        data-testid="rr-eusama-slider"
                        onChange={(e) => setRrEusama(Number(e.target.value))}
                        className="w-full accent-cyan-500"
                      />
                    </div>
                  </div>

                  {/* Suspension Modification Profile Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Asqı Konstruksiyası və Klirens Konfiqurasiyası (YHQ Əlavə 1):
                    </label>
                    <select
                      value={suspensionModId}
                      data-testid="suspension-mod-select"
                      onChange={(e) =>
                        setSuspensionModId(e.target.value as SuspensionModId)
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                    >
                      {SUSPENSION_MODIFICATION_PROFILES.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nameAz}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Front vs Rear Arch Clearance Sliders ("Peredok" Pitch Delta) */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Ön Qanad Ara Məsafəsi:</span>
                        <span className="font-bold text-white" data-testid="front-arch-val">
                          {frontArchGapMm} mm
                        </span>
                      </div>
                      <input
                        type="range"
                        min={15}
                        max={160}
                        value={frontArchGapMm}
                        data-testid="front-arch-slider"
                        onChange={(e) => setFrontArchGapMm(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Arxa Qanad Ara Məsafəsi:</span>
                        <span className="font-bold text-white" data-testid="rear-arch-val">
                          {rearArchGapMm} mm
                        </span>
                      </div>
                      <input
                        type="range"
                        min={15}
                        max={160}
                        value={rearArchGapMm}
                        data-testid="rear-arch-slider"
                        onChange={(e) => setRearArchGapMm(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>
                  </div>

                  {/* Stabilizer Bar & Air Suspension Checkboxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stabilizerBarIntact}
                        data-testid="stabilizer-checkbox"
                        onChange={(e) => setStabilizerBarIntact(e.target.checked)}
                        className="rounded accent-emerald-500 w-4 h-4"
                      />
                      <span>Stabilizator Qolu Bütövdür (YHQ Bənd 7.12)</span>
                    </label>

                    <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={airSuspensionHermetic}
                        data-testid="air-hermetic-checkbox"
                        onChange={(e) => setAirSuspensionHermetic(e.target.checked)}
                        className="rounded accent-emerald-500 w-4 h-4"
                      />
                      <span>Pnevmo-Balon Hermetikdir (Sızma Yoxdur)</span>
                    </label>
                  </div>
                </div>

                {/* Right Column: Live EUSAMA & Peredok Audit Verdict */}
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    {/* Status Banner */}
                    <div
                      data-testid="eusama-verdict-banner"
                      className={`p-4 rounded-2xl border flex items-start gap-3 ${
                        eusamaResult.prohibitsOperation96
                          ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                          : eusamaResult.isCompliant
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                          : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                      }`}
                    >
                      {eusamaResult.isCompliant ? (
                        <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="text-xs sm:text-sm font-black uppercase tracking-wide">
                          {eusamaResult.verdictBadgeAz}
                        </div>
                        <p className="text-xs opacity-90 mt-1">
                          EUSAMA Standartı: ≥40% Optimal Yol Tutumu • ≤20% Kritik Nasazlıq • Ox üzrə Sol/Sağ Fərq ≤15% • Ön-Arxa Klirens Fərqi ≤35 mm
                        </p>
                      </div>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Ön Ox EUSAMA
                        </span>
                        <span
                          className="text-lg font-black text-white"
                          data-testid="front-avg-eusama"
                        >
                          {eusamaResult.frontAvgEusamaPercent}%
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Arxa Ox EUSAMA
                        </span>
                        <span
                          className="text-lg font-black text-white"
                          data-testid="rear-avg-eusama"
                        >
                          {eusamaResult.rearAvgEusamaPercent}%
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Sol/Sağ Disbalans
                        </span>
                        <span
                          data-testid="max-axle-imbalance"
                          className={`text-lg font-black ${
                            eusamaResult.hasAxleImbalanceFailure
                              ? 'text-rose-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {eusamaResult.maxAxleImbalancePercent}%
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Ön-Arxa Fərq
                        </span>
                        <span
                          data-testid="pitch-delta-mm"
                          className={`text-lg font-black ${
                            eusamaResult.frontToRearPitchDeltaMm > 35
                              ? 'text-rose-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {eusamaResult.frontToRearPitchDeltaMm} mm
                        </span>
                      </div>
                    </div>

                    {/* Fine & AsanPay Discount Card */}
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400 block">
                          İXM Maddə 342.2-1 / 342.1.5 Cərimə Riski:
                        </span>
                        <span
                          className="text-base font-black text-white"
                          data-testid="eusama-fine-azn"
                        >
                          {eusamaResult.fineAzn} ₼{' '}
                          <span className="text-xs font-normal text-slate-400">
                            (30 gün AsanPay -50%: {eusamaResult.discountedFineAzn} ₼)
                          </span>
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          eusamaResult.prohibitsOperation96
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {eusamaResult.prohibitsOperation96
                          ? 'İXM 96.1.4 Cərimə Meydançası'
                          : 'Hərəkətə İcazə Verilir'}
                      </span>
                    </div>

                    {/* Violations & Recommendations */}
                    {eusamaResult.violationsAz.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-rose-400 uppercase">
                          Aşkar Edilmiş Qanun Pozuntuları və Risklər:
                        </span>
                        {eusamaResult.violationsAz.map((v, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-200 flex items-start gap-2"
                          >
                            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            <span>{v}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-emerald-400 uppercase">
                        Mühəndis Tövsiyəsi:
                      </span>
                      {eusamaResult.recommendationsAz.map((rec, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: YHQ 5.4/5.5 WHEEL FASTENERS & 3D ALIGNMENT / LONGERON */}
          {activeTab === 'geometry' && (
            <div className="space-y-5" data-testid="geometry-tab-content">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Left Column: Controls */}
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                    <Disc className="w-4 h-4 text-amber-400" />
                    <span>YHQ Bənd 5.4/5.5 Bolt/Disk və Hunter 3D Həndəsə Stendi</span>
                  </h3>

                  {/* Wheel Fastener & Rim Condition */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Təkər Bərkidiciləri (Bolt/Qayka) və Disk Vəziyyəti (YHQ Bənd 5.4 & 5.5):
                    </label>
                    <select
                      value={wheelFastenerCondition}
                      data-testid="wheel-fastener-select"
                      onChange={(e) =>
                        setWheelFastenerCondition(
                          e.target.value as WheelFastenerConditionId
                        )
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                    >
                      {WHEEL_FASTENER_PROFILES.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nameAz}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Missing Lug Bolts & Cracked/Welded Rim */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Çatışmayan Təkər Boltu (YHQ 5.4):</span>
                        <span
                          className="font-bold text-rose-400"
                          data-testid="missing-bolts-val"
                        >
                          {missingLugBoltsCount} ədəd
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={6}
                        value={missingLugBoltsCount}
                        data-testid="missing-bolts-slider"
                        onChange={(e) =>
                          setMissingLugBoltsCount(Number(e.target.value))
                        }
                        className="w-full accent-rose-500"
                      />
                    </div>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasCrackedOrWeldedRim}
                        data-testid="welded-rim-checkbox"
                        onChange={(e) =>
                          setHasCrackedOrWeldedRim(e.target.checked)
                        }
                        className="rounded accent-rose-500 w-4 h-4"
                      />
                      <span>Diskdə Çat və ya Qaynaq («Svarka» — YHQ Bənd 5.5)</span>
                    </label>
                  </div>

                  {/* Hunter 3D Toe, Camber, Caster, Longeron Sliders */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Ön Toe («Sxojdeniya»):</span>
                        <span className="font-bold text-cyan-400" data-testid="front-toe-val">
                          {frontToeMm.toFixed(1)} mm
                        </span>
                      </div>
                      <input
                        type="range"
                        min={-6}
                        max={6}
                        step={0.5}
                        value={frontToeMm}
                        data-testid="front-toe-slider"
                        onChange={(e) => setFrontToeMm(Number(e.target.value))}
                        className="w-full accent-cyan-500"
                      />
                      <span className="text-[10px] text-slate-500">
                        Zavod normativi: -1.5 mm .. +2.5 mm
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Ön Camber («Razval»):</span>
                        <span
                          className="font-bold text-amber-400"
                          data-testid="front-camber-val"
                        >
                          {frontCamberDeg.toFixed(1)}°
                        </span>
                      </div>
                      <input
                        type="range"
                        min={-6.0}
                        max={2.5}
                        step={0.5}
                        value={frontCamberDeg}
                        data-testid="front-camber-slider"
                        onChange={(e) => setFrontCamberDeg(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                      <span className="text-[10px] text-slate-500">
                        Normativ: -2.0° .. +0.5° (&lt; -3.5° Stance Qadağası)
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Caster Sol/Sağ Fərqi:</span>
                        <span className="font-bold text-white" data-testid="caster-delta-val">
                          {casterLeftRightDeltaDeg.toFixed(2)}°
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={2.0}
                        step={0.05}
                        value={casterLeftRightDeltaDeg}
                        data-testid="caster-delta-slider"
                        onChange={(e) =>
                          setCasterLeftRightDeltaDeg(Number(e.target.value))
                        }
                        className="w-full accent-indigo-500"
                      />
                      <span className="text-[10px] text-slate-500">
                        Normativ: ≤ 0.50° (əks halda sükanı kənara dartır)
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Lonjeron Diaqonal Fərqi:</span>
                        <span
                          className="font-bold text-rose-400"
                          data-testid="longeron-delta-val"
                        >
                          {longeronDiagonalDeltaMm.toFixed(1)} mm
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={15}
                        step={0.5}
                        value={longeronDiagonalDeltaMm}
                        data-testid="longeron-delta-slider"
                        onChange={(e) =>
                          setLongeronDiagonalDeltaMm(Number(e.target.value))
                        }
                        className="w-full accent-rose-500"
                      />
                      <span className="text-[10px] text-slate-500">
                        Celette 3D Etalonu: ≤ 3.0 mm (&gt;7.0 mm Əyri Şassi)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Live 3D Geometry & YHQ 5.4/5.5 Verdict */}
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <div
                    data-testid="geometry-verdict-banner"
                    className={`p-4 rounded-2xl border flex items-start gap-3 ${
                      geometryResult.prohibitsOperationImmediately
                        ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                        : geometryResult.isCompliant
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                        : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                    }`}
                  >
                    {geometryResult.isCompliant ? (
                      <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="text-xs sm:text-sm font-black uppercase tracking-wide">
                        {geometryResult.verdictTitleAz}
                      </div>
                      <p className="text-xs opacity-90 mt-1">
                        YHQ Əlavə 1 Bənd 5.4 (Bolt çatışmazlığı) & Bənd 5.5 (Çatlamış/Qaynaqlı Disk) üzrə birbaşa istismar qadağası tətbiq edilir.
                      </p>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Kuzov Statusu
                      </span>
                      <span
                        className="text-xs sm:text-sm font-black text-white"
                        data-testid="frame-geometry-grade"
                      >
                        {geometryResult.frameGeometryGrade === 'FACTORY_STRAIGHT'
                          ? 'Zavod Simmetrik'
                          : geometryResult.frameGeometryGrade ===
                            'MINOR_POST_CRASH_SHIFT'
                          ? 'Orta Sürüşmə'
                          : 'Ağır Lonjeron Əyriliyi'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Şin Yeyilmə Artımı
                      </span>
                      <span
                        className="text-sm sm:text-base font-black text-amber-400"
                        data-testid="tire-wear-penalty"
                      >
                        +{geometryResult.estimatedTireWearPenaltyPercent}%
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Bazar Dəyəri Təsiri
                      </span>
                      <span
                        className={`text-sm sm:text-base font-black ${
                          geometryResult.valuationImpactAzn < 0
                            ? 'text-rose-400'
                            : 'text-emerald-400'
                        }`}
                        data-testid="geometry-valuation-impact"
                      >
                        {geometryResult.valuationImpactAzn === 0
                          ? '0 ₼ (İtki yoxdur)'
                          : `${geometryResult.valuationImpactAzn} ₼`}
                      </span>
                    </div>
                  </div>

                  {/* Fine Box */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block">
                        İXM Maddə 342.1.5 / 342.2-1 Cərimə:
                      </span>
                      <span
                        className="text-base font-black text-white"
                        data-testid="geometry-fine-azn"
                      >
                        {geometryResult.fineAzn} ₼{' '}
                        <span className="text-xs font-normal text-slate-400">
                          (AsanPay -50%: {geometryResult.discountedFineAzn} ₼)
                        </span>
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-amber-400">
                      {geometryResult.violatesClause54Bolts ||
                      geometryResult.violatesClause55RimCrack
                        ? 'YHQ Bənd 5.4/5.5 Qadağası'
                        : 'YHQ Bənd 5.4/5.5 Tamam'}
                    </span>
                  </div>

                  {geometryResult.violationsAz.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-rose-400 uppercase">
                        Şassi və Təkər Bərkidici Pozuntuları:
                      </span>
                      {geometryResult.violationsAz.map((v, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-200 flex items-start gap-2"
                        >
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <span>{v}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-emerald-400 uppercase">
                      Tövsiyə Olunan Bərpa:
                    </span>
                    {geometryResult.recommendationsAz.map((r, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SERVICE & RESTORATION PACKAGES */}
          {activeTab === 'packages' && (
            <div className="space-y-5" data-testid="packages-tab-content">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-3">
                  {CHASSIS_SERVICE_PACKAGES.map((pkg) => {
                    const isSelected = selectedPackages.includes(pkg.id);
                    const pkgTotalAzn = pkg.partsCostAzn + pkg.laborCostAzn;
                    return (
                      <div
                        key={pkg.id}
                        data-testid={`package-card-${pkg.id}`}
                        onClick={() => togglePackage(pkg.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500/50 shadow-md'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm">
                              {pkg.nameAz}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-amber-300">
                              {pkg.warrantyMonths} ay zəmanət
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            {pkg.descriptionAz}
                          </p>
                          <div className="text-[11px] text-slate-400 pt-1">
                            Ehtiyat hissəsi: <strong>{pkg.partsCostAzn} ₼</strong> • İşçilik:{' '}
                            <strong>{pkg.laborCostAzn} ₼</strong> • Müddət:{' '}
                            <strong>{pkg.durationMinutes} dəq</strong>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-base font-black text-amber-400">
                            {currencySymbol}
                            {convertFromAzn(pkgTotalAzn, currency)}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            ({pkgTotalAzn} ₼)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary Box */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 h-fit">
                  <h4 className="font-bold text-white text-base">
                    Asqı & 3D Şassi BərpaSmeta Xülasəsi
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Ehtiyat Hissələri:</span>
                      <span className="font-bold text-white">
                        {serviceCostSummary.partsCostAzn} ₼
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>3D Stend & Usta İşçiliyi:</span>
                      <span className="font-bold text-white">
                        {serviceCostSummary.laborCostAzn} ₼
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Ümumi Servis Müddəti:</span>
                      <span className="font-bold text-white">
                        {serviceCostSummary.totalDurationMinutes} dəqiqə
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                      <span className="font-bold text-slate-200">Yekun Məbləğ:</span>
                      <div className="text-right">
                        <span
                          className="text-xl font-black text-amber-400 block"
                          data-testid="service-total-currency"
                        >
                          {currencySymbol}
                          {serviceCostSummary.totalInCurrency}
                        </span>
                        <span
                          className="text-[11px] text-slate-400"
                          data-testid="service-total-azn"
                        >
                          {serviceCostSummary.totalAzn} AZN
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300">
                    Qarşısı alınan BDYP cərimələri (İXM 342.2-1 / 342.1.5) və vaxtından əvvəl şin yeyilməsi zərəri:{' '}
                    <strong>{serviceCostSummary.finesAndTireLossAvoidedAzn} ₼</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACCREDITED BDYP, AZS & HUNTER 3D CENTERS */}
          {activeTab === 'centers' && (
            <div className="space-y-4" data-testid="centers-tab-content">
              <div className="flex items-center gap-2 flex-wrap">
                {['ALL', 'Bakı', 'Sumqayıt', 'Gəncə'].map((city) => (
                  <button
                    key={city}
                    type="button"
                    data-testid={`city-filter-${city}`}
                    onClick={() => setCityFilter(city)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      cityFilter === city
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    {city === 'ALL' ? 'Bütün Şəhərlər (6)' : city}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCenters.map((center) => {
                  const isSelected = center.id === selectedCenterId;
                  return (
                    <div
                      key={center.id}
                      data-testid={`center-card-${center.id}`}
                      onClick={() => setSelectedCenterId(center.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                            {center.city}
                          </span>
                          <h4 className="font-bold text-white text-sm mt-1">
                            {center.name}
                          </h4>
                        </div>
                        <span className="text-xs font-bold text-amber-400">
                          ★ {center.rating}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{center.address}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {center.equipment.map((eq, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-300"
                          >
                            {eq}
                          </span>
                        ))}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                        <span>{center.phone}</span>
                        <span className="text-emerald-400 font-semibold">
                          Gözləmə: ~{center.waitTimeMinutes} dəq
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: OFFICIAL BDYP-ASQ-2026 CERTIFICATE & UNIFIED REGISTRY */}
          {activeTab === 'certificate' && (
            <div className="space-y-6" data-testid="certificate-tab-content">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Generator Form & Registry Search */}
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <h3 className="font-bold text-white text-sm">
                      Sertifikat Rejeistrasiya Məlumatları
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Dövlət Qeydiyyat Nişanı (DQN):
                        </label>
                        <input
                          type="text"
                          value={plateInput}
                          data-testid="cert-plate-input"
                          onChange={(e) => setPlateInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono uppercase"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Şassi / Kuzov VIN Nömrəsi:
                        </label>
                        <input
                          type="text"
                          value={vinInput}
                          data-testid="cert-vin-input"
                          onChange={(e) => setVinInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono uppercase"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Avtomobil Sahibinin S.A.A.:
                      </label>
                      <input
                        type="text"
                        value={ownerName}
                        data-testid="cert-owner-input"
                        onChange={(e) => setOwnerName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </div>
                  </div>

                  {/* Unified Registry Lookup */}
                  <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Search className="w-4 h-4 text-amber-400" />
                      <span>Vahid BDYP-ASQ Reyestrində Yoxlama</span>
                    </h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={registrySearchQuery}
                        data-testid="registry-search-input"
                        onChange={(e) => setRegistrySearchQuery(e.target.value)}
                        placeholder="Məs: BDYP-ASQ-2026-88412 və ya 10-AA-700"
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {SAMPLE_SUSPENSION_CERTIFICATES.map((sample) => (
                        <button
                          key={sample.certificateNumber}
                          type="button"
                          data-testid={`sample-cert-btn-${sample.certificateNumber}`}
                          onClick={() =>
                            setRegistrySearchQuery(sample.certificateNumber)
                          }
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] text-amber-300 font-mono cursor-pointer"
                        >
                          {sample.certificateNumber} ({sample.plateNumber})
                        </button>
                      ))}
                    </div>

                    {lookedUpCertificate && (
                      <div
                        data-testid="registry-lookup-result"
                        className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/40 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-amber-400">
                            {lookedUpCertificate.certificateNumber}
                          </span>
                          <span className="font-bold text-white">
                            {lookedUpCertificate.overallStatus}
                          </span>
                        </div>
                        <div className="text-slate-300">
                          {lookedUpCertificate.vehicleTitle} • DQN:{' '}
                          <strong>{lookedUpCertificate.plateNumber}</strong>
                        </div>
                        <div className="text-slate-400">
                          EUSAMA Ön/Arxa: {lookedUpCertificate.frontEusamaAvgPercent}% /{' '}
                          {lookedUpCertificate.rearEusamaAvgPercent}% • Klirens Fərqi:{' '}
                          {lookedUpCertificate.frontToRearPitchDeltaMm} mm
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Official Electronic Certificate Card */}
                <div
                  className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/20 border-2 border-amber-500/40 space-y-4"
                  data-testid="generated-suspension-certificate"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block">
                        AZƏRBAYCAN RESPUBLİKASI DİN BDYPİ & AZS
                      </span>
                      <h3 className="text-sm sm:text-base font-black text-white">
                        ASQI (EUSAMA), KLİRENS VƏ 3D ŞASSİ HƏNDƏSƏ SERTİFİKATI
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyCertificate}
                      data-testid="copy-cert-btn"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold cursor-pointer"
                    >
                      {copiedCert ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Kopyalandı</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span data-testid="cert-number-text">
                            {generatedCertificate.certificateNumber}
                          </span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">
                        Dövlət Qeydiyyat Nişanı:
                      </span>
                      <span className="font-mono font-bold text-white">
                        {generatedCertificate.plateNumber}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">
                        Şassi VIN Nömrəsi:
                      </span>
                      <span className="font-mono font-bold text-white">
                        {generatedCertificate.vin}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">
                        EUSAMA Ön / Arxa Ox:
                      </span>
                      <span className="font-bold text-emerald-400">
                        {generatedCertificate.frontEusamaAvgPercent}% /{' '}
                        {generatedCertificate.rearEusamaAvgPercent}% (Disbalans:{' '}
                        {generatedCertificate.maxAxleImbalancePercent}%)
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">
                        Klirens Fərqi & Lonjeron:
                      </span>
                      <span className="font-bold text-amber-300">
                        {generatedCertificate.frontToRearPitchDeltaMm} mm • Diaqonal:{' '}
                        {generatedCertificate.longeronDiagonalDeltaMm} mm
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[10px]">
                        Müayinə Mərkəzi:
                      </span>
                      <span className="font-semibold text-slate-200">
                        {generatedCertificate.centerName}
                      </span>
                    </div>
                    <span
                      data-testid="cert-overall-status"
                      className={`px-2.5 py-1 rounded-lg font-black text-xs ${
                        generatedCertificate.overallStatus === 'COMPLIANT'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : generatedCertificate.overallStatus ===
                            'PROHIBITED_96_1_4'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {generatedCertificate.overallStatus}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between pt-1">
                    <span>QR Hash: {generatedCertificate.qrSecurityHash}</span>
                    <span>Etibarlıdır: {generatedCertificate.expiryDate}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

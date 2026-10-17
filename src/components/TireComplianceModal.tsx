import React, { useState, useMemo } from 'react';
import { Currency, Language, Vehicle } from '../types/vehicle';
import {
  TireVehicleCategory,
  TireSeasonType,
  DrivetrainType,
  RimSizeTier,
  TireBrandTier,
  determineVehicleTireParameters,
  evaluateTireTreadCompliance,
  calculateTireSizeEquivalence,
  evaluateMountainWinterReadiness,
  calculateTireServiceCost,
  generateElectronicTireCertificate,
  convertTireCurrency,
} from '../utils/tireCompliance';
import {
  MOUNTAIN_PASS_CORRIDORS,
  CERTIFIED_TIRE_SERVICE_CENTERS,
  SAMPLE_TIRE_CERTIFICATES,
} from '../data/mockTireData';
import {
  X,
  Disc,
  ShieldCheck,
  AlertTriangle,
  MountainSnow,
  Gauge,
  Wrench,
  FileCheck,
  Search,
  Copy,
  Check,
  Building2,
  Phone,
  Clock,
  CheckCircle2,
  Snowflake,
  Scale,
} from 'lucide-react';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';

interface TireComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: Vehicle | null;
  currency: Currency;
  lang: Language;
}

type ActiveTab =
  | 'tread_auditor'
  | 'size_calculator'
  | 'mountain_radar'
  | 'service_calculator'
  | 'e_certificate';

export const TireComplianceModal: React.FC<TireComplianceModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  currency,
}) => {
  const initialDefaults = useMemo(
    () => determineVehicleTireParameters(vehicle),
    [vehicle]
  );

  const [activeTab, setActiveTab] = useState<ActiveTab>('tread_auditor');

  // Tab 1: Tread Depth & YHQ Annex 1 Auditor state
  const [vehicleCategory, setVehicleCategory] = useState<TireVehicleCategory>(
    initialDefaults.vehicleCategory
  );
  const [tireSeason, setTireSeason] = useState<TireSeasonType>('winter_3pmsf');
  const [frontLeftMm, setFrontLeftMm] = useState<number>(
    initialDefaults.defaultTreadDepths.frontLeft
  );
  const [frontRightMm, setFrontRightMm] = useState<number>(
    initialDefaults.defaultTreadDepths.frontRight
  );
  const [rearLeftMm, setRearLeftMm] = useState<number>(
    initialDefaults.defaultTreadDepths.rearLeft
  );
  const [rearRightMm, setRearRightMm] = useState<number>(
    initialDefaults.defaultTreadDepths.rearRight
  );
  const [hasMixedAxleTires, setHasMixedAxleTires] = useState<boolean>(false);
  const [hasSidewallDamage, setHasSidewallDamage] = useState<boolean>(false);
  const [hasMissingBolts, setHasMissingBolts] = useState<boolean>(false);
  const [dotYear, setDotYear] = useState<number>(2024);
  const [isWinterMountainRoute, setIsWinterMountainRoute] = useState<boolean>(false);

  // Tab 2: Tire & Rim Equivalence state
  const [oemWidthMm, setOemWidthMm] = useState<number>(initialDefaults.oemSpec.widthMm);
  const [oemAspectRatio, setOemAspectRatio] = useState<number>(
    initialDefaults.oemSpec.aspectRatio
  );
  const [oemRimInches, setOemRimInches] = useState<number>(
    initialDefaults.oemSpec.rimDiameterInches
  );

  const [targetWidthMm, setTargetWidthMm] = useState<number>(initialDefaults.oemSpec.widthMm);
  const [targetAspectRatio, setTargetAspectRatio] = useState<number>(
    initialDefaults.oemSpec.aspectRatio
  );
  const [targetRimInches, setTargetRimInches] = useState<number>(
    initialDefaults.oemSpec.rimDiameterInches
  );

  // Tab 3: Mountain Pass Winter Readiness state
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>(
    MOUNTAIN_PASS_CORRIDORS[0].id
  );
  const [drivetrain, setDrivetrain] = useState<DrivetrainType>(initialDefaults.drivetrain);
  const [hasSnowChains, setHasSnowChains] = useState<boolean>(false);
  const [hasEmergencyKit, setHasEmergencyKit] = useState<boolean>(true);

  // Tab 4: Tire Service, 3D Alignment & Tire Hotel state
  const [includeNewTireSet4x, setIncludeNewTireSet4x] = useState<boolean>(true);
  const [rimSizeTier, setRimSizeTier] = useState<RimSizeTier>('R17_R18');
  const [brandTier, setBrandTier] = useState<TireBrandTier>('mid_range_touring');
  const [includeMountBalance, setIncludeMountBalance] = useState<boolean>(true);
  const [include3dAlignment, setInclude3dAlignment] = useState<boolean>(true);
  const [includeTpmsReset, setIncludeTpmsReset] = useState<boolean>(false);
  const [includeNitrogen, setIncludeNitrogen] = useState<boolean>(false);
  const [includeTireHotel, setIncludeTireHotel] = useState<boolean>(false);
  const [cityFilter, setCityFilter] = useState<string>('ALL');

  // Tab 5: Electronic Certificate & Registry Search
  const [plateInput, setPlateInput] = useState<string>('99-AA-777');
  const [selectedCenterName, setSelectedCenterName] = useState<string>(
    CERTIFIED_TIRE_SERVICE_CENTERS[0].name
  );
  const [registrySearchQuery, setRegistrySearchQuery] = useState<string>('');
  const [copiedCert, copyCert] = useCopyToClipboard();

  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₼';
  const formatConverted = (amountAzn: number) => {
    const val = convertTireCurrency(amountAzn, currency);
    return `${val.toLocaleString()} ${currencySymbol}`;
  };

  const treadAudit = useMemo(
    () =>
      evaluateTireTreadCompliance({
        vehicleCategory,
        tireSeason,
        treadDepthMm: {
          frontLeft: frontLeftMm,
          frontRight: frontRightMm,
          rearLeft: rearLeftMm,
          rearRight: rearRightMm,
        },
        hasMixedAxleTires,
        hasSidewallDamageOrExposedCord: hasSidewallDamage,
        hasMissingWheelBolts: hasMissingBolts,
        dotManufactureYear: dotYear,
        isWinterMountainRoute,
      }),
    [
      vehicleCategory,
      tireSeason,
      frontLeftMm,
      frontRightMm,
      rearLeftMm,
      rearRightMm,
      hasMixedAxleTires,
      hasSidewallDamage,
      hasMissingBolts,
      dotYear,
      isWinterMountainRoute,
    ]
  );

  const equivalenceResult = useMemo(
    () =>
      calculateTireSizeEquivalence(
        {
          widthMm: oemWidthMm,
          aspectRatio: oemAspectRatio,
          rimDiameterInches: oemRimInches,
        },
        {
          widthMm: targetWidthMm,
          aspectRatio: targetAspectRatio,
          rimDiameterInches: targetRimInches,
        }
      ),
    [
      oemWidthMm,
      oemAspectRatio,
      oemRimInches,
      targetWidthMm,
      targetAspectRatio,
      targetRimInches,
    ]
  );

  const activeCorridor = useMemo(
    () =>
      MOUNTAIN_PASS_CORRIDORS.find((c) => c.id === selectedCorridorId) ||
      MOUNTAIN_PASS_CORRIDORS[0],
    [selectedCorridorId]
  );

  const mountainReadiness = useMemo(
    () =>
      evaluateMountainWinterReadiness({
        corridor: activeCorridor,
        drivetrain,
        tireSeason,
        minTreadDepthMm: treadAudit.minMeasuredTreadMm,
        hasSnowChainsOnBoard: hasSnowChains,
        hasMandatoryEmergencyKit: hasEmergencyKit,
      }),
    [
      activeCorridor,
      drivetrain,
      tireSeason,
      treadAudit.minMeasuredTreadMm,
      hasSnowChains,
      hasEmergencyKit,
    ]
  );

  const serviceCostResult = useMemo(
    () =>
      calculateTireServiceCost({
        includeNewTireSet4x,
        rimSizeTier,
        brandTier,
        includeSeasonalMountAndBalance: includeMountBalance,
        include3dWheelAlignment: include3dAlignment,
        includeTpmsSensorCalibration: includeTpmsReset,
        includeNitrogenInflation: includeNitrogen,
        include6MonthTireHotel: includeTireHotel,
      }),
    [
      includeNewTireSet4x,
      rimSizeTier,
      brandTier,
      includeMountBalance,
      include3dAlignment,
      includeTpmsReset,
      includeNitrogen,
      includeTireHotel,
    ]
  );

  const filteredCenters = useMemo(() => {
    if (cityFilter === 'ALL') return CERTIFIED_TIRE_SERVICE_CENTERS;
    return CERTIFIED_TIRE_SERVICE_CENTERS.filter((c) => c.city === cityFilter);
  }, [cityFilter]);

  const generatedCertificate = useMemo(
    () =>
      generateElectronicTireCertificate({
        vehiclePlate: plateInput,
        vehicleTitle: vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.year})` : 'Toyota Camry 2.5 Hybrid',
        vin: vehicle?.vin || 'JTNB11HK903099881',
        treadAudit,
        equivalence: equivalenceResult,
        tireSeason,
        vehicleCategory,
        measuredTreadMm: {
          frontLeft: frontLeftMm,
          frontRight: frontRightMm,
          rearLeft: rearLeftMm,
          rearRight: rearRightMm,
        },
        inspectingCenter: selectedCenterName,
      }),
    [
      plateInput,
      vehicle,
      treadAudit,
      equivalenceResult,
      tireSeason,
      vehicleCategory,
      frontLeftMm,
      frontRightMm,
      rearLeftMm,
      rearRightMm,
      selectedCenterName,
    ]
  );

  const searchedSampleCert = useMemo(() => {
    const q = registrySearchQuery.trim().toUpperCase();
    if (!q) return null;
    return (
      SAMPLE_TIRE_CERTIFICATES.find(
        (c) =>
          c.certificateNumber.toUpperCase().includes(q) ||
          c.vehiclePlate.toUpperCase().includes(q) ||
          c.vin.toUpperCase().includes(q)
      ) || null
    );
  }, [registrySearchQuery]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      data-testid="tire-compliance-modal"
    >
      <div
        className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Disc className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  BDYP & YHQ Əlavə 1 — Rəsmi Şin Standartları, Protektor & Qış Dağ Keçidi Portalı
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 rounded-full">
                  İXM Maddə 342.1.5 & 342.2-1
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {vehicle
                  ? `${vehicle.make} ${vehicle.model} (${vehicle.year}) • VIN: ${vehicle.vin}`
                  : '4-Təkər Protektor Telemetriyası, Şin/Disk Ölçü Ekvivalentliyi və Ağsu/Şahdağ Qış Hazırlığı'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            data-testid="close-tire-modal-btn"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-3 bg-slate-950/50 border-b border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('tread_auditor')}
            data-testid="tab-tread-auditor"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'tread_auditor'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/25'
                : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Protektor Auditoru (YHQ Əlavə 1)
          </button>

          <button
            onClick={() => setActiveTab('size_calculator')}
            data-testid="tab-size-calculator"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'size_calculator'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/25'
                : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Gauge className="w-4 h-4" />
            Şin/Disk Ölçüsü & Spidometr
          </button>

          <button
            onClick={() => setActiveTab('mountain_radar')}
            data-testid="tab-mountain-radar"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'mountain_radar'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/25'
                : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <MountainSnow className="w-4 h-4" />
            Qış Dağ Keçidləri Radarı
          </button>

          <button
            onClick={() => setActiveTab('service_calculator')}
            data-testid="tab-service-calculator"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'service_calculator'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/25'
                : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Wrench className="w-4 h-4" />
            Şin Dəsti, 3D Razval & Şin Oteli
          </button>

          <button
            onClick={() => setActiveTab('e_certificate')}
            data-testid="tab-e-certificate"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'e_certificate'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/25'
                : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            BDYP E-Şin Uyğunluq Aktı
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: TREAD DEPTH & YHQ ANNEX 1 AUDITOR */}
          {activeTab === 'tread_auditor' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" data-testid="tread-auditor-panel">
              {/* Left Controls */}
              <div className="lg:col-span-7 space-y-5 bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Disc className="w-5 h-5 text-cyan-400" />
                    4-Təkər Protektor Dərinliyi & Texniki Parametrlər
                  </h3>
                  <span className="text-xs text-slate-400">YHQ Əlavə 1, Bənd V</span>
                </div>

                {/* Vehicle Category & Season */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nəqliyyat Vasitəsi Kateqoriyası (Qanuni Normativ)
                    </label>
                    <select
                      value={vehicleCategory}
                      onChange={(e) =>
                        setVehicleCategory(e.target.value as TireVehicleCategory)
                      }
                      data-testid="select-tire-vehicle-category"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                    >
                      <option value="M1_passenger">
                        Minik avtomobili (M1 / B) — Min. 1.6 mm
                      </option>
                      <option value="N1_N3_truck">
                        Yük avtomobili (N1–N3 / C) — Min. 1.0 mm
                      </option>
                      <option value="M2_M3_bus">
                        Avtobus (M2–M3 / D) — Min. 2.0 mm
                      </option>
                      <option value="L_motorcycle">
                        Motosiklet və Moped (L / A) — Min. 0.8 mm
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Şin Mövsüm Tərkibi (Kompaund)
                    </label>
                    <select
                      value={tireSeason}
                      onChange={(e) => setTireSeason(e.target.value as TireSeasonType)}
                      data-testid="select-tire-season"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                    >
                      <option value="winter_3pmsf">
                        Qış Şini (3PMSF Qar Dənəciyi / M+S)
                      </option>
                      <option value="all_season_ms">4 Fəsil Universal (All-Season M+S)</option>
                      <option value="summer">Yay Şini (Summer Performance)</option>
                      <option value="studded_winter">Şipli Qış Şini (Studded Ice)</option>
                    </select>
                  </div>
                </div>

                {/* 4 Wheel Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/70 p-4 rounded-xl border border-slate-800">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-semibold">Sol Ön Təkər (FL):</span>
                      <span className="font-mono font-bold text-cyan-400">
                        {frontLeftMm.toFixed(1)} mm
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="9.0"
                      step="0.1"
                      value={frontLeftMm}
                      onChange={(e) => setFrontLeftMm(Number(e.target.value))}
                      data-testid="slider-tread-fl"
                      className="w-full accent-cyan-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-semibold">Sağ Ön Təkər (FR):</span>
                      <span className="font-mono font-bold text-cyan-400">
                        {frontRightMm.toFixed(1)} mm
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="9.0"
                      step="0.1"
                      value={frontRightMm}
                      onChange={(e) => setFrontRightMm(Number(e.target.value))}
                      data-testid="slider-tread-fr"
                      className="w-full accent-cyan-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-semibold">Sol Arxa Təkər (RL):</span>
                      <span className="font-mono font-bold text-cyan-400">
                        {rearLeftMm.toFixed(1)} mm
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="9.0"
                      step="0.1"
                      value={rearLeftMm}
                      onChange={(e) => setRearLeftMm(Number(e.target.value))}
                      data-testid="slider-tread-rl"
                      className="w-full accent-cyan-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-semibold">Sağ Arxa Təkər (RR):</span>
                      <span className="font-mono font-bold text-cyan-400">
                        {rearRightMm.toFixed(1)} mm
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="9.0"
                      step="0.1"
                      value={rearRightMm}
                      onChange={(e) => setRearRightMm(Number(e.target.value))}
                      data-testid="slider-tread-rr"
                      className="w-full accent-cyan-500"
                    />
                  </div>
                </div>

                {/* DOT Year & Checkboxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Şinin İstehsal İli (DOT Kodu)
                    </label>
                    <input
                      type="number"
                      min="2012"
                      max="2026"
                      value={dotYear}
                      onChange={(e) => setDotYear(Number(e.target.value))}
                      data-testid="input-dot-year"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                    />
                  </div>

                  <div className="flex flex-col justify-center gap-2 pt-2">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isWinterMountainRoute}
                        onChange={(e) => setIsWinterMountainRoute(e.target.checked)}
                        data-testid="checkbox-winter-mountain"
                        className="rounded border-slate-700 text-cyan-500"
                      />
                      <span>Qış dağ marşrutu (Ağsu / Şahdağ ≥4.0 mm tələbi)</span>
                    </label>
                  </div>
                </div>

                {/* Defect Checkboxes */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    YHQ Əlavə 1 Bənd 5.2–5.5 İstismarı Qadağan Edən Qüsurlar
                  </p>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasMixedAxleTires}
                      onChange={(e) => setHasMixedAxleTires(e.target.checked)}
                      data-testid="checkbox-mixed-axle"
                      className="rounded border-slate-700 text-rose-500"
                    />
                    <span>
                      Eyni oxda müxtəlif naxışlı/ölçülü və ya yay+qış şini qarışıqdır (Bənd 5.5)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasSidewallDamage}
                      onChange={(e) => setHasSidewallDamage(e.target.checked)}
                      data-testid="checkbox-sidewall-damage"
                      className="rounded border-slate-700 text-rose-500"
                    />
                    <span>
                      Yanaqda şiş ("qrıja"), kəsik və ya kord qatının açılması var (Bənd 5.2)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasMissingBolts}
                      onChange={(e) => setHasMissingBolts(e.target.checked)}
                      data-testid="checkbox-missing-bolts"
                      className="rounded border-slate-700 text-rose-500"
                    />
                    <span>
                      Disk bərkidici bolt və ya qaykalarından çatışmayan var (Bənd 5.4)
                    </span>
                  </label>
                </div>
              </div>

              {/* Right Audit Verdict */}
              <div className="lg:col-span-5 space-y-4">
                <div
                  data-testid="tread-verdict-card"
                  className={`p-5 rounded-2xl border ${
                    treadAudit.isFullyCompliant
                      ? 'bg-emerald-950/30 border-emerald-500/40'
                      : treadAudit.fineAmountAzn > 0
                      ? 'bg-rose-950/30 border-rose-500/40'
                      : 'bg-amber-950/30 border-amber-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      BDYP Texniki Audit Nəticəsi
                    </span>
                    <span
                      data-testid="tread-fine-badge"
                      className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                        treadAudit.fineAmountAzn > 0
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {treadAudit.fineAmountAzn > 0
                        ? `Cərimə: ${formatConverted(treadAudit.fineAmountAzn)}`
                        : 'Cərimə Yoxdur (0 ₼)'}
                    </span>
                  </div>

                  <h4
                    className="text-lg font-black text-white mb-1"
                    data-testid="tread-verdict-title"
                  >
                    {treadAudit.verdictTitle}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {treadAudit.statutoryExplanation}
                  </p>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800/80">
                    <div className="bg-slate-900/80 p-3 rounded-xl">
                      <span className="text-[11px] text-slate-400 block">
                        Minimum / Orta Protektor
                      </span>
                      <span
                        className="text-base font-black text-white"
                        data-testid="min-measured-tread"
                      >
                        {treadAudit.minMeasuredTreadMm} mm{' '}
                        <span className="text-xs font-normal text-slate-400">
                          (Orta: {treadAudit.avgMeasuredTreadMm} mm)
                        </span>
                      </span>
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-xl">
                      <span className="text-[11px] text-slate-400 block">
                        Yaş Asfaltda Əyləc (80 km/s)
                      </span>
                      <span
                        className="text-base font-black text-cyan-400"
                        data-testid="wet-braking-distance"
                      >
                        {treadAudit.wetBrakingDistance80KmhMeters} metr
                      </span>
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-xl">
                      <span className="text-[11px] text-slate-400 block">
                        Akvaplaninq (Su Sürüşməsi) Riski
                      </span>
                      <span className="text-sm font-bold text-amber-300">
                        {treadAudit.hydroplaningRiskLevel}
                      </span>
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-xl">
                      <span className="text-[11px] text-slate-400 block">
                        Şin Yaşı (DOT {dotYear})
                      </span>
                      <span className="text-sm font-bold text-white">
                        {treadAudit.tireAgeYears} il{' '}
                        {treadAudit.isAgeWarning ? '(Köhnəlmə!)' : '(Normal)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Violations List */}
                {treadAudit.violationArticles.length > 0 && (
                  <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                      <AlertTriangle className="w-4 h-4" />
                      Aşkar Edilən Qanunvericilik Pozuntuları:
                    </div>
                    <ul className="space-y-1.5 text-xs text-rose-200 list-disc pl-4">
                      {treadAudit.violationArticles.map((v, i) => (
                        <li key={i}>{v}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <span className="text-xs font-bold text-cyan-400 block">
                    Mühəndis & BDYP Tövsiyələri:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300 list-disc pl-4">
                    {treadAudit.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TIRE & RIM EQUIVALENCE & SPEEDOMETER CALCULATOR */}
          {activeTab === 'size_calculator' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" data-testid="size-calculator-panel">
              <div className="lg:col-span-6 space-y-5 bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Scale className="w-5 h-5 text-cyan-400" />
                  Zavod (OEM) və Yeni Şin/Disk Ölçüsü Müqayisəsi
                </h3>

                {/* OEM Spec */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase">
                      1. Zavod (OEM) Şin Ölçüsü
                    </span>
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      {equivalenceResult.oemLabel}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Eni (mm)</label>
                      <input
                        type="number"
                        step="5"
                        value={oemWidthMm}
                        onChange={(e) => setOemWidthMm(Number(e.target.value))}
                        data-testid="input-oem-width"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Profil (%)
                      </label>
                      <input
                        type="number"
                        step="5"
                        value={oemAspectRatio}
                        onChange={(e) => setOemAspectRatio(Number(e.target.value))}
                        data-testid="input-oem-aspect"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Disk (düym R)
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={oemRimInches}
                        onChange={(e) => setOemRimInches(Number(e.target.value))}
                        data-testid="input-oem-rim"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Target Spec */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-cyan-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 uppercase">
                      2. Quraşdırılan (Yeni) Şin Ölçüsü
                    </span>
                    <span
                      className="font-mono text-xs font-bold text-white"
                      data-testid="target-tire-label"
                    >
                      {equivalenceResult.targetLabel}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Eni (mm)</label>
                      <input
                        type="number"
                        step="5"
                        value={targetWidthMm}
                        onChange={(e) => setTargetWidthMm(Number(e.target.value))}
                        data-testid="input-target-width"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Profil (%)
                      </label>
                      <input
                        type="number"
                        step="5"
                        value={targetAspectRatio}
                        onChange={(e) => setTargetAspectRatio(Number(e.target.value))}
                        data-testid="input-target-aspect"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Disk (düym R)
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={targetRimInches}
                        onChange={(e) => setTargetRimInches(Number(e.target.value))}
                        data-testid="input-target-rim"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Equivalence Telemetry */}
              <div className="lg:col-span-6 space-y-4">
                <div
                  className={`p-5 rounded-2xl border ${
                    equivalenceResult.isWithinTolerance3Percent
                      ? 'bg-emerald-950/30 border-emerald-500/40'
                      : 'bg-rose-950/30 border-rose-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase text-slate-300">
                      AZS & BDYP Konstruktiv Uyğunluq (±3.0% Həddi)
                    </span>
                    <span
                      data-testid="diameter-diff-percent"
                      className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                        equivalenceResult.isWithinTolerance3Percent
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      Fərq: {equivalenceResult.diameterDiffPercent > 0 ? '+' : ''}
                      {equivalenceResult.diameterDiffPercent}%
                    </span>
                  </div>

                  <p
                    className="text-xs text-slate-200 leading-relaxed mb-4"
                    data-testid="equivalence-summary"
                  >
                    {equivalenceResult.technicalSummary}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-900/90 p-3 rounded-xl">
                      <span className="text-[11px] text-slate-400 block">
                        Ümumi Diametr (OEM → Yeni)
                      </span>
                      <span className="text-sm font-black text-white">
                        {equivalenceResult.oemOuterDiameterMm} →{' '}
                        {equivalenceResult.targetOuterDiameterMm} mm
                      </span>
                    </div>

                    <div className="bg-slate-900/90 p-3 rounded-xl">
                      <span className="text-[11px] text-slate-400 block">
                        Klirens (Yerdən Hündürlük)
                      </span>
                      <span
                        className="text-sm font-black text-cyan-400"
                        data-testid="clearance-delta-value"
                      >
                        {equivalenceResult.clearanceDeltaMm >= 0 ? '+' : ''}
                        {equivalenceResult.clearanceDeltaMm} mm
                      </span>
                    </div>

                    <div className="bg-slate-900/90 p-3 rounded-xl">
                      <span className="text-[11px] text-slate-400 block">
                        Spidometr 100 km/s olduqda
                      </span>
                      <span
                        className="text-sm font-black text-amber-300"
                        data-testid="actual-speed-100"
                      >
                        {equivalenceResult.actualSpeedAt100Kmh} km/s
                      </span>
                    </div>

                    <div className="bg-slate-900/90 p-3 rounded-xl">
                      <span className="text-[11px] text-slate-400 block">
                        Yanaq Hündürlüyü (mm)
                      </span>
                      <span className="text-sm font-bold text-white">
                        {equivalenceResult.oemSidewallMm} →{' '}
                        {equivalenceResult.targetSidewallMm} mm
                      </span>
                    </div>

                    <div className="bg-slate-900/90 p-3 rounded-xl">
                      <span className="text-[11px] text-slate-400 block">
                        1 km-də Təkər Dövrü
                      </span>
                      <span className="text-sm font-bold text-white">
                        {equivalenceResult.targetRevsPerKm} dövr
                      </span>
                    </div>

                    <div className="bg-slate-900/90 p-3 rounded-xl">
                      <span className="text-[11px] text-slate-400 block">
                        İXM Maddə 342.2-1 Riski
                      </span>
                      <span className="text-sm font-black text-rose-300">
                        {equivalenceResult.constructiveFineRiskAzn > 0
                          ? formatConverted(equivalenceResult.constructiveFineRiskAzn)
                          : '0 ₼ (Qanuni)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AZERBAIJAN MOUNTAIN PASS WINTER RADAR */}
          {activeTab === 'mountain_radar' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" data-testid="mountain-radar-panel">
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <MountainSnow className="w-5 h-5 text-cyan-400" />
                    Azərbaycan Qış Dağ Aşırımları və BDYP Nəzarət Postları
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Dağ Marşrutu / Aşırım Seçin
                      </label>
                      <select
                        value={selectedCorridorId}
                        onChange={(e) => setSelectedCorridorId(e.target.value)}
                        data-testid="select-mountain-corridor"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      >
                        {MOUNTAIN_PASS_CORRIDORS.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.maxElevationMeters}m)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Avtomobilin Ötürücü Sistemi (Drivetrain)
                      </label>
                      <select
                        value={drivetrain}
                        onChange={(e) => setDrivetrain(e.target.value as DrivetrainType)}
                        data-testid="select-drivetrain"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      >
                        <option value="AWD_4WD">Tam Ötürücü (AWD / 4WD / 4x4)</option>
                        <option value="FWD">Ön Ötürücü (FWD)</option>
                        <option value="RWD">Arxa Ötürücü (RWD)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-2">
                    <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasSnowChains}
                        onChange={(e) => setHasSnowChains(e.target.checked)}
                        data-testid="checkbox-snow-chains"
                        className="rounded border-slate-700 text-cyan-500"
                      />
                      <span>Baqajda Qar Zənciri (Snow Chains) var</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasEmergencyKit}
                        onChange={(e) => setHasEmergencyKit(e.target.checked)}
                        data-testid="checkbox-emergency-kit"
                        className="rounded border-slate-700 text-cyan-500"
                      />
                      <span>Dartı trosu, qəza üçbucağı və -20°C antifriz şüşəsilən var</span>
                    </label>
                  </div>
                </div>

                {/* Corridor Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {MOUNTAIN_PASS_CORRIDORS.map((corridor) => (
                    <div
                      key={corridor.id}
                      onClick={() => setSelectedCorridorId(corridor.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        selectedCorridorId === corridor.id
                          ? 'bg-cyan-950/30 border-cyan-500/50'
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-cyan-400">
                          {corridor.highwayCode} • {corridor.region}
                        </span>
                        <span className="text-[11px] font-mono bg-slate-900 px-2 py-0.5 rounded text-slate-300">
                          {corridor.maxElevationMeters}m | {corridor.ambientTempCelsius}°C
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white mb-1">{corridor.name}</p>
                      <p className="text-[11px] text-slate-400">{corridor.bdypCheckpointLocation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Mountain Readiness Result */}
              <div className="lg:col-span-5 space-y-4">
                <div
                  data-testid="mountain-readiness-card"
                  className={`p-5 rounded-2xl border ${
                    mountainReadiness.checkpointStatus === 'CLEARED_GREEN'
                      ? 'bg-emerald-950/30 border-emerald-500/40'
                      : mountainReadiness.checkpointStatus === 'CHAINS_REQUIRED_AMBER'
                      ? 'bg-amber-950/30 border-amber-500/40'
                      : 'bg-rose-950/30 border-rose-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase text-slate-300">
                      BDYP Dağ Postu Keçid Statusu
                    </span>
                    <span
                      data-testid="mountain-readiness-score"
                      className="px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-900 text-cyan-400"
                    >
                      Hazırlıq: {mountainReadiness.readinessScore}/100
                    </span>
                  </div>

                  <h4
                    className="text-base font-black text-white mb-1"
                    data-testid="mountain-traction-label"
                  >
                    {mountainReadiness.tractionRatingLabel}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {mountainReadiness.bdypAdvisory}
                  </p>

                  {mountainReadiness.warnings.length > 0 && (
                    <ul className="space-y-1.5 text-xs text-amber-200 list-disc pl-4 border-t border-slate-800/80 pt-3">
                      {mountainReadiness.warnings.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TIRE SERVICE, 3D ALIGNMENT & TIRE HOTEL CALCULATOR */}
          {activeTab === 'service_calculator' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" data-testid="service-calculator-panel">
              <div className="lg:col-span-6 space-y-4 bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-cyan-400" />
                  Şin Dəsti, 3D Razval-Sxojdeniye və Mövsümi "Şin Oteli" Kalkulyatoru
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Disk Ölçüsü Kateqoriyası
                    </label>
                    <select
                      value={rimSizeTier}
                      onChange={(e) => setRimSizeTier(e.target.value as RimSizeTier)}
                      data-testid="select-rim-tier"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="R14_R16">R14 – R16 (Kompakt / Sedan)</option>
                      <option value="R17_R18">R17 – R18 (Biznes Sedan / Krossover)</option>
                      <option value="R19_R20">R19 – R20 (Böyük SUV / Sport)</option>
                      <option value="R21_R22_SUV">R21 – R22 (Flaqman Lüks SUV)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Şin BrendSeqmenti
                    </label>
                    <select
                      value={brandTier}
                      onChange={(e) => setBrandTier(e.target.value as TireBrandTier)}
                      data-testid="select-brand-tier"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="economy_budget">
                        Ekonom (Lassa, Petlas, Kumho, Triangle)
                      </option>
                      <option value="mid_range_touring">
                        Orta-Premium (Hankook, Toyo, Yokohama, Nexen)
                      </option>
                      <option value="premium_flagship">
                        Flaqman (Michelin, Continental, Pirelli, Bridgestone)
                      </option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeNewTireSet4x}
                      onChange={(e) => setIncludeNewTireSet4x(e.target.checked)}
                      data-testid="checkbox-new-tires-4x"
                      className="rounded border-slate-700 text-cyan-500"
                    />
                    <span>4 ədəd yeni şin dəstinin alınması</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeMountBalance}
                      onChange={(e) => setIncludeMountBalance(e.target.checked)}
                      className="rounded border-slate-700 text-cyan-500"
                    />
                    <span>Mövsümi şinmontaj və lazer balanslaşdırma</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={include3dAlignment}
                      onChange={(e) => setInclude3dAlignment(e.target.checked)}
                      className="rounded border-slate-700 text-cyan-500"
                    />
                    <span>3D Hunter Kompüter Razval-Sxojdeniye (40 AZN)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeTpmsReset}
                      onChange={(e) => setIncludeTpmsReset(e.target.checked)}
                      data-testid="checkbox-tpms-reset"
                      className="rounded border-slate-700 text-cyan-500"
                    />
                    <span>TPMS təzyiq sensorlarının proqramlaşdırılması (35 AZN)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeNitrogen}
                      onChange={(e) => setIncludeNitrogen(e.target.checked)}
                      className="rounded border-slate-700 text-cyan-500"
                    />
                    <span>4 təkərin azot (N2) qazı ilə doldurulması (15 AZN)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeTireHotel}
                      onChange={(e) => setIncludeTireHotel(e.target.checked)}
                      data-testid="checkbox-tire-hotel"
                      className="rounded border-slate-700 text-cyan-500"
                    />
                    <span>6 aylıq rəsmi "Şin Oteli" mövsümi saxlanma (90 AZN)</span>
                  </label>
                </div>

                {/* Cost Summary Box */}
                <div className="bg-slate-900 p-4 rounded-xl border border-cyan-500/30 mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300">
                      Cəmi Xidmət və Şin Büdcəsi:
                    </span>
                    <span
                      className="text-xl font-black text-cyan-400"
                      data-testid="total-tire-service-cost"
                    >
                      {formatConverted(serviceCostResult.totalCostAzn)}
                    </span>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-400">
                    {serviceCostResult.breakdownSummary.map((item, i) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Certified Tire Centers */}
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-cyan-400" />
                    Akkreditə Olunmuş Şin və 3D Razval Mərkəzləri
                  </h4>
                  <select
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    data-testid="select-tire-center-city"
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                  >
                    <option value="ALL">Bütün Şəhərlər ({CERTIFIED_TIRE_SERVICE_CENTERS.length})</option>
                    <option value="Bakı">Bakı</option>
                    <option value="Sumqayıt">Sumqayıt</option>
                    <option value="Gəncə">Gəncə</option>
                  </select>
                </div>

                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {filteredCenters.map((center) => (
                    <div
                      key={center.id}
                      className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{center.name}</span>
                        <span className="text-[11px] font-bold text-amber-400">
                          ★ {center.rating}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{center.address}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-cyan-400" /> {center.workingHours}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-400" /> {center.phone}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ELECTRONIC TIRE CERTIFICATE & REGISTRY */}
          {activeTab === 'e_certificate' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" data-testid="e-certificate-panel">
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-slate-950 border-2 border-cyan-500/40 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 block">
                        AZS & BDYP ELEKTRON ŞİN VƏ PROTEKTOR UYĞUNLUQ AKTI
                      </span>
                      <h3
                        className="text-lg font-black text-white font-mono"
                        data-testid="generated-tire-cert-number"
                      >
                        {generatedCertificate.certificateNumber}
                      </h3>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black ${
                        generatedCertificate.complianceStatus === 'COMPLIANT'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : generatedCertificate.complianceStatus === 'WARNING'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {generatedCertificate.complianceStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Dövlət Qeydiyyat Nişanı
                      </label>
                      <input
                        type="text"
                        value={plateInput}
                        onChange={(e) => setPlateInput(e.target.value)}
                        data-testid="input-cert-plate"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-sm font-mono font-bold text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Yoxlayan Servis Mərkəzi
                      </label>
                      <select
                        value={selectedCenterName}
                        onChange={(e) => setSelectedCenterName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                      >
                        {CERTIFIED_TIRE_SERVICE_CENTERS.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/90 p-3 rounded-xl text-xs">
                    <div>
                      <span className="text-slate-400 block">Sol Ön (FL):</span>
                      <span className="font-mono font-bold text-white">
                        {generatedCertificate.measuredTreadMm.frontLeft} mm
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Sağ Ön (FR):</span>
                      <span className="font-mono font-bold text-white">
                        {generatedCertificate.measuredTreadMm.frontRight} mm
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Sol Arxa (RL):</span>
                      <span className="font-mono font-bold text-white">
                        {generatedCertificate.measuredTreadMm.rearLeft} mm
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Sağ Arxa (RR):</span>
                      <span className="font-mono font-bold text-white">
                        {generatedCertificate.measuredTreadMm.rearRight} mm
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-mono text-slate-400">
                      QR Hash: {generatedCertificate.qrVerificationHash}
                    </span>
                    <button
                      onClick={() => copyCert(generatedCertificate.certificateNumber)}
                      data-testid="copy-tire-cert-btn"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer"
                    >
                      {copiedCert ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Kopyalandı
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Akt Nömrəsini Kopyala
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Registry Lookup */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Search className="w-4 h-4 text-cyan-400" />
                    Vahid BDYP Şin Uyğunluq Reyestri Axtarışı
                  </h4>
                  <input
                    type="text"
                    placeholder="Akt nömrəsi və ya Nişan (məs: 99-AA-777, 88412)"
                    value={registrySearchQuery}
                    onChange={(e) => setRegistrySearchQuery(e.target.value)}
                    data-testid="input-tire-registry-search"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />

                  {searchedSampleCert ? (
                    <div
                      className="p-3.5 rounded-xl bg-slate-900 border border-cyan-500/40 space-y-1.5 text-xs"
                      data-testid="registry-search-result"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-cyan-400">
                          {searchedSampleCert.certificateNumber}
                        </span>
                        <span className="font-bold text-white">
                          {searchedSampleCert.vehiclePlate}
                        </span>
                      </div>
                      <p className="text-slate-200 font-semibold">
                        {searchedSampleCert.vehicleTitle}
                      </p>
                      <p className="text-slate-400">
                        Şin: {searchedSampleCert.installedTireSpec} • Min. Protektor:{' '}
                        {searchedSampleCert.minTreadMm} mm • Status:{' '}
                        {searchedSampleCert.complianceStatus}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] text-slate-400 block">
                        Nümunə Reyestr Qeydləri:
                      </span>
                      {SAMPLE_TIRE_CERTIFICATES.map((sample) => (
                        <button
                          key={sample.certificateNumber}
                          onClick={() => setRegistrySearchQuery(sample.vehiclePlate)}
                          className="w-full text-left p-2.5 rounded-xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 flex items-center justify-between text-xs cursor-pointer"
                        >
                          <span className="font-mono text-cyan-400">
                            {sample.certificateNumber}
                          </span>
                          <span className="text-slate-300 font-semibold">
                            {sample.vehiclePlate} ({sample.minTreadMm} mm)
                          </span>
                        </button>
                      ))}
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

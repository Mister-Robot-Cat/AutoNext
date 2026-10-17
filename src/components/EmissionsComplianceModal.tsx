import React, { useState, useMemo, useEffect } from 'react';
import { Vehicle, Currency } from '../types/vehicle';
import { formatPrice } from '../utils/i18n';
import {
  EngineEmissionType,
  CatalystSystemStatus,
  EMISSION_NORM_RULES,
  OBD_EMISSION_FAULT_CODES,
  CATALYST_SERVICE_PACKAGES,
  ECO_DIAGNOSTIC_CENTERS,
} from '../data/mockEmissionsData';
import {
  inferEngineEmissionType,
  inferEuroStandardClass,
  auditGasAnalyzerTelemetry,
  evaluateCatalystAndDpfIntegrity,
  calculateAnnualCarbonFootprint,
  generateEcoComplianceCertificate,
  lookupEcoCertificate,
} from '../utils/emissionsCompliance';
import { useScrollLock } from '../hooks/useScrollLock';
import { useKeyPress } from '../hooks/useKeyPress';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import {
  X,
  Wind,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Gauge,
  Flame,
  Leaf,
  MapPin,
  FileCheck,
  Search,
  Copy,
  Check,
  Wrench,
  Sparkles,
  CheckCircle2,
  XCircle,
  Phone,
  Clock,
  Award,
} from 'lucide-react';

interface EmissionsComplianceModalProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  currency: Currency;
  onClose: () => void;
}

type ActiveTab =
  | 'gas_analyzer'
  | 'catalyst_dpf'
  | 'carbon_euro'
  | 'centers'
  | 'certificate';

export const EmissionsComplianceModal: React.FC<EmissionsComplianceModalProps> = ({
  isOpen,
  vehicle,
  currency,
  onClose,
}) => {
  useScrollLock(isOpen);
  useKeyPress('Escape', () => {
    if (isOpen) onClose();
  });

  const [copiedText, copy] = useCopyToClipboard();

  const [activeTab, setActiveTab] = useState<ActiveTab>('gas_analyzer');

  // Tab 1: Gas Analyzer & "Təmiz Hava" Stand State
  const [engineType, setEngineType] = useState<EngineEmissionType>(() =>
    inferEngineEmissionType(vehicle)
  );
  const [coIdlePercent, setCoIdlePercent] = useState<number>(0.18);
  const [coHighRpmPercent, setCoHighRpmPercent] = useState<number>(0.12);
  const [chIdlePpm, setChIdlePpm] = useState<number>(45);
  const [lambdaRatio, setLambdaRatio] = useState<number>(1.0);
  const [smokeKValue, setSmokeKValue] = useState<number>(0.32);

  // Tab 2: Catalyst & DPF Integrity State
  const [catalystStatus, setCatalystStatus] = useState<CatalystSystemStatus>('oem_intact');
  const [backpressureKpa, setBackpressureKpa] = useState<number>(7);
  const [selectedObdCodes, setSelectedObdCodes] = useState<string[]>([]);

  // Tab 3: Carbon Footprint & Euro Class State
  const [fuelType, setFuelType] = useState<'petrol' | 'diesel' | 'hybrid' | 'electric' | 'lpg'>(
    () => {
      if (vehicle?.fuelType === 'electric') return 'electric';
      if (vehicle?.fuelType === 'diesel') return 'diesel';
      if (vehicle?.fuelType === 'hybrid' || vehicle?.fuelType === 'plug_in_hybrid') return 'hybrid';
      return 'petrol';
    }
  );
  const [fuelConsumptionL, setFuelConsumptionL] = useState<number>(
    vehicle?.fuelConsumptionLPer100Km ?? 7.5
  );
  const [annualMileageKm, setAnnualMileageKm] = useState<number>(18000);
  const [productionYear, setProductionYear] = useState<number>(vehicle?.year ?? 2021);

  // Tab 4: Accredited Centers Filter
  const [selectedCity, setSelectedCity] = useState<string>('Hamısı');
  const [selectedCenterId, setSelectedCenterId] = useState<string>(ECO_DIAGNOSTIC_CENTERS[0].id);

  // Tab 5: Certificate & Registry Lookup
  const [plateInput, setPlateInput] = useState<string>(vehicle?.plateNumber || '99-XX-777');
  const [vinInput, setVinInput] = useState<string>(vehicle?.vin || 'JTDKB20U903491823');
  const [registrySearchQuery, setRegistrySearchQuery] = useState<string>('');
  const [hasSearchedRegistry, setHasSearchedRegistry] = useState<boolean>(false);

  useEffect(() => {
    if (vehicle) {
      setEngineType(inferEngineEmissionType(vehicle));
      if (vehicle.fuelType === 'electric') setFuelType('electric');
      else if (vehicle.fuelType === 'diesel') setFuelType('diesel');
      else if (vehicle.fuelType === 'hybrid' || vehicle.fuelType === 'plug_in_hybrid')
        setFuelType('hybrid');
      else setFuelType('petrol');
      setFuelConsumptionL(vehicle.fuelConsumptionLPer100Km || 7.5);
      setProductionYear(vehicle.year);
      if (vehicle.plateNumber) setPlateInput(vehicle.plateNumber);
      if (vehicle.vin) setVinInput(vehicle.vin);
    }
  }, [vehicle]);

  const currentNormRule = EMISSION_NORM_RULES[engineType];
  const isDieselEngine =
    engineType === 'diesel_turbo_dpf' || engineType === 'diesel_standard';

  const gasAudit = useMemo(
    () =>
      auditGasAnalyzerTelemetry({
        engineType,
        coIdlePercent,
        coHighRpmPercent,
        chIdlePpm,
        lambdaRatio,
        smokeKValue,
      }),
    [engineType, coIdlePercent, coHighRpmPercent, chIdlePpm, lambdaRatio, smokeKValue]
  );

  const catalystAudit = useMemo(
    () =>
      evaluateCatalystAndDpfIntegrity({
        engineType,
        catalystStatus,
        backpressureKpa,
        activeObdCodes: selectedObdCodes,
        vehiclePriceAzn: vehicle?.priceAzn || 35000,
      }),
    [engineType, catalystStatus, backpressureKpa, selectedObdCodes, vehicle?.priceAzn]
  );

  const carbonFootprint = useMemo(
    () =>
      calculateAnnualCarbonFootprint({
        fuelType,
        fuelConsumptionLPer100Km: fuelConsumptionL,
        annualMileageKm,
        productionYear,
      }),
    [fuelType, fuelConsumptionL, annualMileageKm, productionYear]
  );

  const filteredCenters = useMemo(() => {
    if (selectedCity === 'Hamısı') return ECO_DIAGNOSTIC_CENTERS;
    return ECO_DIAGNOSTIC_CENTERS.filter((c) => c.city === selectedCity);
  }, [selectedCity]);

  const generatedCertificate = useMemo(
    () =>
      generateEcoComplianceCertificate({
        plateNumber: plateInput,
        vin: vinInput,
        vehicleTitle: vehicle?.title || 'Toyota Camry 2.5 Hybrid',
        engineType,
        euroClass: inferEuroStandardClass(productionYear, fuelType),
        catalystStatus,
        measuredCoIdlePercent: coIdlePercent,
        measuredCoHighRpmPercent: coHighRpmPercent,
        measuredChPpm: chIdlePpm,
        measuredLambda: lambdaRatio,
        measuredSmokeK: smokeKValue,
        centerId: selectedCenterId,
      }),
    [
      plateInput,
      vinInput,
      vehicle?.title,
      engineType,
      productionYear,
      fuelType,
      catalystStatus,
      coIdlePercent,
      coHighRpmPercent,
      chIdlePpm,
      lambdaRatio,
      smokeKValue,
      selectedCenterId,
    ]
  );

  const registryLookupResult = useMemo(() => {
    if (!hasSearchedRegistry || !registrySearchQuery.trim()) return null;
    const fromRegistry = lookupEcoCertificate(registrySearchQuery);
    if (fromRegistry) return fromRegistry;
    if (
      registrySearchQuery.trim().toUpperCase() ===
        generatedCertificate.certificateNumber.toUpperCase() ||
      registrySearchQuery.trim().toUpperCase() ===
        generatedCertificate.plateNumber.toUpperCase()
    ) {
      return generatedCertificate;
    }
    return null;
  }, [hasSearchedRegistry, registrySearchQuery, generatedCertificate]);

  const toggleObdCode = (code: string) => {
    setSelectedObdCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const applyPresetScenario = (
    preset: 'clean_oem' | 'cut_catalyst' | 'clogged_dpf' | 'zero_ev'
  ) => {
    if (preset === 'clean_oem') {
      setEngineType('petrol_catalyst');
      setCoIdlePercent(0.12);
      setCoHighRpmPercent(0.08);
      setChIdlePpm(28);
      setLambdaRatio(1.0);
      setCatalystStatus('oem_intact');
      setBackpressureKpa(6);
      setSelectedObdCodes([]);
    } else if (preset === 'cut_catalyst') {
      setEngineType('petrol_catalyst');
      setCoIdlePercent(1.65);
      setCoHighRpmPercent(1.42);
      setChIdlePpm(380);
      setLambdaRatio(0.92);
      setCatalystStatus('removed_bypass');
      setBackpressureKpa(3);
      setSelectedObdCodes(['P0420']);
    } else if (preset === 'clogged_dpf') {
      setEngineType('diesel_turbo_dpf');
      setSmokeKValue(2.4);
      setCatalystStatus('clogged_degraded');
      setBackpressureKpa(32);
      setSelectedObdCodes(['P2002', 'P2463']);
    } else if (preset === 'zero_ev') {
      setEngineType('electric');
      setCoIdlePercent(0);
      setCoHighRpmPercent(0);
      setChIdlePpm(0);
      setLambdaRatio(1.0);
      setSmokeKValue(0);
      setCatalystStatus('oem_intact');
      setBackpressureKpa(0);
      setSelectedObdCodes([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
      data-testid="emissions-compliance-modal"
    >
      <div
        className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 text-white shadow-lg shadow-emerald-500/25">
              <Wind className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  BDYP & ETSN «Təmiz Hava» Ekoloji Nəzarət, Qazanalizator & Katalizator/DPF Portalı
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  YHQ Əlavə 1 Bölmə VI • İXM Maddə 342.5
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {vehicle
                  ? `${vehicle.title} (${vehicle.year}) — CO/CH qazanalizator normativləri, katalizator/DPF bütövlüyü və rəsmi BDYP-EKO-2026 sertifikatı`
                  : 'Avtomobillərin ixrac qazlarında zəhərli maddələrin (CO, CH, Tüstü) yoxlanılması, katalizator/DPF diaqnostikası və ekoloji uyğunluq'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            data-testid="close-emissions-modal-btn"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-950/50 px-4 pt-2 gap-2">
          {[
            {
              id: 'gas_analyzer' as ActiveTab,
              label: '1. Qazanalizator & "Təmiz Hava" Stendi',
              icon: Gauge,
              testId: 'tab-gas-analyzer',
            },
            {
              id: 'catalyst_dpf' as ActiveTab,
              label: '2. Katalizator, DPF & OBD-II Auditoru',
              icon: Flame,
              testId: 'tab-catalyst-dpf',
            },
            {
              id: 'carbon_euro' as ActiveTab,
              label: '3. CO₂ Ekoloji İzi & Avro-4/5/6 Sinif',
              icon: Leaf,
              testId: 'tab-carbon-euro',
            },
            {
              id: 'centers' as ActiveTab,
              label: '4. ETSN & BDYP Ekoloji Laboratoriyalar',
              icon: MapPin,
              testId: 'tab-eco-centers',
            },
            {
              id: 'certificate' as ActiveTab,
              label: '5. BDYP-EKO-2026 Sertifikat & Reyestr',
              icon: FileCheck,
              testId: 'tab-eco-certificate',
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                data-testid={tab.testId}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: GAS ANALYZER & TEMIZ HAVA STAND */}
          {activeTab === 'gas_analyzer' && (
            <div className="space-y-6">
              {/* Quick Scenario Presets */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Sürətli Sınaq Ssenariləri («Təmiz Hava» Reydi):</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyPresetScenario('clean_oem')}
                    data-testid="preset-clean-oem-btn"
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Zavod Katalizatorlu (Euro-5/6 Норма)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetScenario('cut_catalyst')}
                    data-testid="preset-cut-catalyst-btn"
                    className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Katalizator Kəsilib (CO 1.65% — İXM 342.5 Cərimə)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetScenario('clogged_dpf')}
                    data-testid="preset-clogged-dpf-btn"
                    className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Tutulmuş DPF Dizel (Qara Tüstü k=2.4 m⁻¹)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetScenario('zero_ev')}
                    data-testid="preset-zero-ev-btn"
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Tam Elektrik (0.00% Emissiya)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Engine Type & Telemetry Sliders */}
                <div className="lg:col-span-7 space-y-5 p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Mühərrik & Neytrallaşdırıcı Kateqoriyası (YHQ Əlavə 1 Bölmə VI)
                    </label>
                    <select
                      value={engineType}
                      onChange={(e) => setEngineType(e.target.value as EngineEmissionType)}
                      data-testid="engine-emission-type-select"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-semibold focus:outline-none focus:border-emerald-500"
                    >
                      {(Object.keys(EMISSION_NORM_RULES) as EngineEmissionType[]).map((key) => (
                        <option key={key} value={key}>
                          {EMISSION_NORM_RULES[key].labelAz}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {currentNormRule.descriptionAz}
                    </p>
                  </div>

                  {engineType === 'electric' ? (
                    <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-center space-y-2">
                      <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
                      <h4 className="text-base font-black text-white">
                        Sıfır İxrac Qazı (BEV — Yaşıl Ekoloji Sinif)
                      </h4>
                      <p className="text-xs text-slate-300">
                        Tam elektrik avtomobillərində daxili yanma prosesi və ixrac borusu olmadığı üçün CO, CH və tüstü əmsalı 0.00-dır.
                      </p>
                    </div>
                  ) : !isDieselEngine ? (
                    <div className="space-y-4">
                      {/* CO Idle Slider */}
                      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                        <div className="flex justify-between text-xs font-bold mb-1.5">
                          <span className="text-slate-300">
                            Dəm Qazı CO — 800 dövr/dəq (Sərbəst gediş):
                          </span>
                          <span
                            className={
                              gasAudit.coIdleCompliant ? 'text-emerald-400' : 'text-rose-400'
                            }
                          >
                            {coIdlePercent.toFixed(2)}% (Norma: ≤{currentNormRule.maxCoIdlePercent}%)
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="3.5"
                          step="0.02"
                          value={coIdlePercent}
                          onChange={(e) => setCoIdlePercent( parseFloat(e.target.value) )}
                          data-testid="co-idle-slider"
                          className="w-full accent-emerald-500 cursor-pointer"
                        />
                      </div>

                      {/* CO High RPM Slider */}
                      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                        <div className="flex justify-between text-xs font-bold mb-1.5">
                          <span className="text-slate-300">
                            Dəm Qazı CO — 2500 dövr/dəq (Yüksək dövrə):
                          </span>
                          <span
                            className={
                              gasAudit.coHighRpmCompliant ? 'text-emerald-400' : 'text-rose-400'
                            }
                          >
                            {coHighRpmPercent.toFixed(2)}% (Norma: ≤
                            {currentNormRule.maxCoHighRpmPercent}%)
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="3.5"
                          step="0.02"
                          value={coHighRpmPercent}
                          onChange={(e) => setCoHighRpmPercent(parseFloat(e.target.value))}
                          data-testid="co-high-slider"
                          className="w-full accent-emerald-500 cursor-pointer"
                        />
                      </div>

                      {/* CH Hydrocarbons Slider */}
                      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                        <div className="flex justify-between text-xs font-bold mb-1.5">
                          <span className="text-slate-300">
                            Karbohidrogenlər CH (Yanmamış yanacaq hissəcikləri):
                          </span>
                          <span
                            className={
                              gasAudit.chIdleCompliant ? 'text-emerald-400' : 'text-rose-400'
                            }
                          >
                            {chIdlePpm} ppm (Norma: ≤{currentNormRule.maxChIdlePpm} ppm)
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1500"
                          step="5"
                          value={chIdlePpm}
                          onChange={(e) => setChIdlePpm(parseInt(e.target.value, 10))}
                          data-testid="ch-ppm-slider"
                          className="w-full accent-emerald-500 cursor-pointer"
                        />
                      </div>

                      {/* Lambda Excess Air Ratio Slider */}
                      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                        <div className="flex justify-between text-xs font-bold mb-1.5">
                          <span className="text-slate-300">
                            Hava Artıqlıq Əmsalı Lambda (λ — Stexiometrik nisbət):
                          </span>
                          <span
                            className={
                              gasAudit.lambdaCompliant ? 'text-emerald-400' : 'text-amber-400'
                            }
                          >
                            λ = {lambdaRatio.toFixed(2)} (Norma: {currentNormRule.minLambda}–
                            {currentNormRule.maxLambda})
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.80"
                          max="1.20"
                          step="0.01"
                          value={lambdaRatio}
                          onChange={(e) => setLambdaRatio(parseFloat(e.target.value))}
                          data-testid="lambda-slider"
                          className="w-full accent-emerald-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Diesel Smoke Opacity K Value Slider */}
                      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                        <div className="flex justify-between text-xs font-bold mb-1.5">
                          <span className="text-slate-300">
                            Tüstülülük (İşıq Udma Əmsalı k, m⁻¹ — Sərbəst Təcillənmə):
                          </span>
                          <span
                            className={
                              gasAudit.smokeCompliant ? 'text-emerald-400' : 'text-rose-400'
                            }
                          >
                            {smokeKValue.toFixed(2)} m⁻¹ (Norma: ≤{currentNormRule.maxSmokeKValue}{' '}
                            m⁻¹)
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.05"
                          max="4.0"
                          step="0.05"
                          value={smokeKValue}
                          onChange={(e) => setSmokeKValue(parseFloat(e.target.value))}
                          data-testid="smoke-k-slider"
                          className="w-full accent-emerald-500 cursor-pointer"
                        />
                        <div className="flex justify-between text-[11px] text-slate-400 mt-2">
                          <span>Təxmini Optik Qeyri-şəffaflıq: {gasAudit.estimatedOpacityPercent}%</span>
                          <span>Normativ: ≤{currentNormRule.maxSmokeOpacityPercent}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Hüquqi baza: {currentNormRule.legalBasis}</span>
                    <span className="text-emerald-400 font-semibold">
                      {currentNormRule.measurementMethodAz}
                    </span>
                  </div>
                </div>

                {/* Right Column: Live BDYP & ETSN Verdict Card */}
                <div className="lg:col-span-5 space-y-4">
                  <div
                    data-testid="gas-analyzer-verdict-card"
                    className={`p-5 rounded-2xl border space-y-4 ${
                      gasAudit.isCompliant
                        ? 'bg-emerald-950/25 border-emerald-500/40'
                        : 'bg-rose-950/30 border-rose-500/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        {gasAudit.isCompliant ? (
                          <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-7 h-7 text-rose-400 shrink-0" />
                        )}
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            BDYP & ETSN «Təmiz Hava» Yekun Rəyi
                          </span>
                          <h3 className="text-lg font-black text-white">
                            {gasAudit.isCompliant
                              ? 'EKOLOJİ NORMATİVƏ TAM UYĞUNDUR'
                              : 'NORMATİV POZUNTUSU — İXM 342.5 CƏRİMƏ'}
                          </h3>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-white">
                          {gasAudit.ecoScore}
                        </span>
                        <span className="text-xs text-slate-400 block">/ 100 bal</span>
                      </div>
                    </div>

                    {/* Penalty Breakdown Box */}
                    <div className="grid grid-cols-3 gap-2.5 pt-2">
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">
                          Fiziki Şəxs (İXM 342.5)
                        </span>
                        <span
                          data-testid="individual-fine-amount"
                          className={`text-base font-black ${
                            gasAudit.individualFineAzn > 0 ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {gasAudit.individualFineAzn === 0
                            ? '0 ₼'
                            : formatPrice(gasAudit.individualFineAzn, currency)}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">
                          30 Gün 50% Güzəştlə
                        </span>
                        <span className="text-base font-black text-amber-400">
                          {gasAudit.earlyPaymentFineAzn === 0
                            ? '0 ₼'
                            : formatPrice(gasAudit.earlyPaymentFineAzn, currency)}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">
                          Vəzifəli Şəxs (İXM 348)
                        </span>
                        <span className="text-base font-black text-slate-200">
                          {gasAudit.fleetOfficialFineAzn === 0
                            ? '0 ₼'
                            : formatPrice(gasAudit.fleetOfficialFineAzn, currency)}
                        </span>
                      </div>
                    </div>

                    {/* Violations list */}
                    {gasAudit.violationsAz.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-rose-500/20">
                        <span className="text-xs font-bold text-rose-300 block">
                          Aşkar Edilən Normativ Pozuntuları:
                        </span>
                        {gasAudit.violationsAz.map((v, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 text-xs text-rose-200 leading-relaxed"
                          >
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            <span>{v}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Recommendations */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800">
                      <span className="text-xs font-bold text-emerald-300 block">
                        Mühəndis-Diaqnost Tövsiyəsi:
                      </span>
                      {gasAudit.recommendationsAz.map((rec, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed"
                        >
                          <Activity className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CATALYST, DPF & OBD-II INTEGRITY AUDITOR */}
          {activeTab === 'catalyst_dpf' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Catalyst State, Backpressure & OBD Codes */}
                <div className="lg:col-span-7 space-y-5 p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Katalizator Neytrallaşdırıcısı / DPF Qurum Filtri Vəziyyəti
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        {
                          id: 'oem_intact' as CatalystSystemStatus,
                          title: 'Zavod Orijinal (OEM) Üzərindədir',
                          sub: 'Pt/Pd/Rh şanları bütövdür, kəsilməyib',
                        },
                        {
                          id: 'euro4_universal' as CatalystSystemStatus,
                          title: 'Sertifikatlı Euro-4/5 Əvəzedici',
                          sub: 'Metal və ya keramik yeni kartric qoyulub',
                        },
                        {
                          id: 'clogged_degraded' as CatalystSystemStatus,
                          title: 'Tutulmuş / Resursu Bitmiş (>75%)',
                          sub: 'Yuma və ya regenerasiya tələb olunur',
                        },
                        {
                          id: 'removed_bypass' as CatalystSystemStatus,
                          title: 'Kəsilib Çıxarılıb (Plameqasitel)',
                          sub: 'Aldadıcı şayba / Stage-2 — Qadağandır!',
                        },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setCatalystStatus(opt.id)}
                          data-testid={`catalyst-status-${opt.id}`}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            catalystStatus === opt.id
                              ? 'bg-emerald-500/15 border-emerald-500 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="text-xs font-bold">{opt.title}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{opt.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Backpressure Slider */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-slate-300">
                        Eqzos Kollektorunda Əks-Təzyiq (Manometr Ölçümü — kPa):
                      </span>
                      <span
                        className={
                          catalystAudit.backpressureStatus === 'normal'
                            ? 'text-emerald-400'
                            : catalystAudit.backpressureStatus === 'elevated'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }
                      >
                        {backpressureKpa} kPa (Norma: ≤12 kPa)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="45"
                      step="1"
                      value={backpressureKpa}
                      onChange={(e) => setBackpressureKpa(parseInt(e.target.value, 10))}
                      data-testid="backpressure-slider"
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  {/* OBD-II Fault Codes Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      OBD-II Skaynerdə Aşkarlanan Ekoloji Xəta Kodları (DTC)
                    </label>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {OBD_EMISSION_FAULT_CODES.map((fault) => {
                        const isSelected = selectedObdCodes.includes(fault.code);
                        return (
                          <button
                            key={fault.code}
                            type="button"
                            onClick={() => toggleObdCode(fault.code)}
                            data-testid={`obd-code-${fault.code}`}
                            className={`w-full p-3 rounded-xl border text-left transition-all flex items-start justify-between gap-3 cursor-pointer ${
                              isSelected
                                ? 'bg-rose-500/15 border-rose-500/50 text-white'
                                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-xs font-black text-amber-400">
                                  {fault.code}
                                </span>
                                <span className="text-xs font-bold">{fault.titleAz}</span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-1">{fault.symptomAz}</p>
                            </div>
                            <span className="text-xs font-bold text-emerald-400 whitespace-nowrap">
                              ~{formatPrice(fault.estimatedFixCostAzn, currency)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column: Catalyst Audit Result & Baku Service Packages */}
                <div className="lg:col-span-5 space-y-4">
                  <div
                    data-testid="catalyst-integrity-verdict"
                    className={`p-5 rounded-2xl border space-y-4 ${
                      catalystAudit.passesInspection
                        ? 'bg-emerald-950/25 border-emerald-500/40'
                        : 'bg-rose-950/30 border-rose-500/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Katalizator & DPF Ekspertiza Rəyi
                        </span>
                        <h3 className="text-base font-black text-white mt-0.5">
                          {catalystAudit.statusSummaryAz}
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-white">
                          {catalystAudit.healthScore}%
                        </span>
                        <span className="text-[10px] text-slate-400 block">Resurs</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">
                          Bazar Qiymətinə Təsiri (İtki)
                        </span>
                        <span
                          data-testid="resale-penalty-amount"
                          className={`text-base font-black ${
                            catalystAudit.resaleValuePenaltyAzn > 0
                              ? 'text-rose-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {catalystAudit.resaleValuePenaltyAzn > 0
                            ? `-${formatPrice(catalystAudit.resaleValuePenaltyAzn, currency)}`
                            : '0 ₼ (Tam Qorunur)'}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">
                          Bərpa / Təmir Xərci
                        </span>
                        <span
                          data-testid="catalyst-repair-cost"
                          className="text-base font-black text-amber-400"
                        >
                          {catalystAudit.estimatedRepairCostAzn > 0
                            ? formatPrice(catalystAudit.estimatedRepairCostAzn, currency)
                            : '0 ₼'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-800">
                      {catalystAudit.detailedFindingsAz.map((item, idx) => (
                        <div key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                          <Wrench className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Certified Catalyst & DPF Service Packages */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Bakı üzrə Sertifikatlı Katalizator & DPF Bərpa Paketləri
                    </h4>
                    <div className="space-y-2">
                      {CATALYST_SERVICE_PACKAGES.map((pkg) => (
                        <div
                          key={pkg.id}
                          className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="text-xs font-bold text-white">{pkg.nameAz}</div>
                            <div className="text-[11px] text-slate-400">
                              {pkg.euroStandard} • Zəmanət: {pkg.warrantyMonths} ay •{' '}
                              {pkg.durationMinutes} dəq
                            </div>
                          </div>
                          <span className="text-xs font-black text-emerald-400 whitespace-nowrap">
                            {formatPrice(pkg.priceAzn, currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CARBON FOOTPRINT & EURO-4/5/6 CLASS CALCULATOR */}
          {activeTab === 'carbon_euro' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 space-y-4 p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-400" />
                  <span>İllik CO₂ Karbon İzi & Nazirlər Kabineti Qərar №92 (Avro-4+) Kalkulyatoru</span>
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Yanacaq Növü
                    </label>
                    <select
                      value={fuelType}
                      onChange={(e) => setFuelType(e.target.value as any)}
                      data-testid="carbon-fuel-type-select"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold"
                    >
                      <option value="petrol">Benzin (Aİ-92 / Aİ-95)</option>
                      <option value="hybrid">Hibrid (HEV / PHEV)</option>
                      <option value="diesel">Dizel</option>
                      <option value="lpg">Qaz (LPG / CNG)</option>
                      <option value="electric">Tam Elektrik (EV)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      İstehsal İli
                    </label>
                    <input
                      type="number"
                      min="1990"
                      max="2026"
                      value={productionYear}
                      onChange={(e) => setProductionYear(parseInt(e.target.value, 10) || 2020)}
                      data-testid="carbon-year-input"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold"
                    />
                  </div>
                </div>

                {fuelType !== 'electric' && (
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-300">Orta Yanacaq Sərfiyyatı (L / 100 km):</span>
                      <span className="text-emerald-400">{fuelConsumptionL} L / 100 km</span>
                    </div>
                    <input
                      type="range"
                      min="3.0"
                      max="22.0"
                      step="0.5"
                      value={fuelConsumptionL}
                      onChange={(e) => setFuelConsumptionL(parseFloat(e.target.value))}
                      data-testid="carbon-consumption-slider"
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>
                )}

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-300">İllik Yürüş Məsafəsi (km / il):</span>
                    <span className="text-cyan-400">{annualMileageKm.toLocaleString()} km</span>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="60000"
                    step="1000"
                    value={annualMileageKm}
                    onChange={(e) => setAnnualMileageKm(parseInt(e.target.value, 10))}
                    data-testid="carbon-mileage-slider"
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="lg:col-span-6 space-y-4">
                <div
                  data-testid="carbon-footprint-summary"
                  className="p-5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Avropa Ekoloji Standartı & Emissiya Sinifi
                      </span>
                      <h4 className="text-xl font-black text-white mt-0.5">
                        {carbonFootprint.euroClass}
                      </h4>
                    </div>
                    <div className="px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black text-xl">
                      Sinif: {carbonFootprint.ecoBadge}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">CO₂ Emissiyası</span>
                      <span
                        data-testid="co2-grams-per-km"
                        className="text-base font-black text-white"
                      >
                        {carbonFootprint.co2GramsPerKm} q/km
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">İllik CO₂ Həcmi</span>
                      <span className="text-base font-black text-amber-400">
                        {carbonFootprint.annualCo2Tons} ton/il
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Ağac Ekvivalenti</span>
                      <span className="text-base font-black text-emerald-400">
                        {carbonFootprint.treesRequiredToOffset} ağac/il
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    {carbonFootprint.meetsCabinetDecision92ImportNorm ? (
                      <span className="text-emerald-300 font-semibold">
                        ✓ AR Nazirlər Kabinetinin 92 nömrəli Qərarına əsasən Avro-4 və daha yüksək ekoloji sinif tələbinə tam cavab verir.
                      </span>
                    ) : (
                      <span className="text-amber-300 font-semibold">
                        ⚠ Avtomobilin istehsal ili Avro-4 ekoloji standartından aşağı olduğu üçün idxal zamanı xüsusi gömrük-ekoloji məhdudiyyətləri tətbiq edilir.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ETSN & BDYP ACCREDITED DIAGNOSTIC CENTERS */}
          {activeTab === 'centers' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-white">
                    ETSN, BDYP & AZS Akkreditə Olunmuş Qazanalizator və Katalizator/DPF Mərkəzləri
                  </h3>
                  <p className="text-xs text-slate-400">
                    Rəsmi 5-komponentli qazanalizator, dizel tüstüməri və DPF hidro-kavitasiya yuma stendləri
                  </p>
                </div>

                <div className="flex gap-2">
                  {['Hamısı', 'Bakı', 'Xırdalan', 'Sumqayıt', 'Gəncə'].map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setSelectedCity(city)}
                      data-testid={`filter-eco-city-${city}`}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedCity === city
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCenters.map((center) => (
                  <div
                    key={center.id}
                    data-testid={`eco-center-card-${center.id}`}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-white">{center.name}</h4>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-300 shrink-0">
                          {center.accreditationCode}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{center.address}</span>
                      </p>
                      <div className="flex flex-wrap gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-cyan-400" /> {center.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" /> {center.workingHours}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1.5">
                        {center.hasFiveGasAnalyzer && (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                            5-Qaz Analizator
                          </span>
                        )}
                        {center.hasDieselOpacimeter && (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                            Dizel Tüstümər
                          </span>
                        )}
                        {center.hasDpfCleaningStand && (
                          <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-[10px] text-emerald-300 border border-emerald-500/20">
                            DPF Hidro-Stend
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-black text-emerald-400">
                        Diaqnostika: {formatPrice(center.inspectionFeeAzn, currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: OFFICIAL BDYP-EKO-2026 ELECTRONIC CERTIFICATE & UNIFIED REGISTRY */}
          {activeTab === 'certificate' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Official Certificate Preview */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/30 border border-emerald-500/40 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <Award className="w-6 h-6 text-emerald-400" />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                          AR DİN BDYPİ & ETSN «Təmiz Hava» Elektron Protokolu
                        </span>
                        <h3 className="text-base font-black text-white">
                          EKOLOJİ UYĞUNLUQ VƏ QAZANALİZATOR SERTİFİKATI
                        </h3>
                      </div>
                    </div>
                    <span
                      data-testid="eco-certificate-number"
                      className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 font-mono text-xs font-black text-emerald-300"
                    >
                      {generatedCertificate.certificateNumber}
                    </span>
                  </div>

                  {/* Plate & VIN Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                        Dövlət Qeydiyyat Nişanı
                      </label>
                      <input
                        type="text"
                        value={plateInput}
                        onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
                        data-testid="eco-cert-plate-input"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                        VIN Şassi Nömrəsi
                      </label>
                      <input
                        type="text"
                        value={vinInput}
                        onChange={(e) => setVinInput(e.target.value.toUpperCase())}
                        data-testid="eco-cert-vin-input"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                        Müayinə Mərkəzi
                      </label>
                      <select
                        value={selectedCenterId}
                        onChange={(e) => setSelectedCenterId(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                      >
                        {ECO_DIAGNOSTIC_CENTERS.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Telemetry Matrix */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">CO (800 / 2500 rpm)</span>
                      <span className="font-bold text-white">
                        {generatedCertificate.measuredCoIdlePercent}% /{' '}
                        {generatedCertificate.measuredCoHighRpmPercent}%
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Karbohidrogen (CH)</span>
                      <span className="font-bold text-white">
                        {generatedCertificate.measuredChPpm} ppm
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Ekoloji Sinif</span>
                      <span className="font-bold text-emerald-400">
                        {generatedCertificate.euroClass}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Status</span>
                      <span
                        className={`font-black ${
                          generatedCertificate.isCompliant ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {generatedCertificate.isCompliant ? 'KEÇDİ (OK)' : 'UYĞUNSUZ'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                    <span>QR Hash: {generatedCertificate.qrSecurityHash}</span>
                    <button
                      type="button"
                      onClick={() => copy(generatedCertificate.certificateNumber)}
                      data-testid="copy-eco-cert-btn"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      {copiedText === generatedCertificate.certificateNumber ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Kopyalandı</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Sertifikat Kodunu Kopyala</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Unified Registry Lookup */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <Search className="w-4 h-4 text-emerald-400" />
                    <span>Vahid Elektron Ekoloji Reyestr Axtarışı</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Sertifikat nömrəsi (`BDYP-EKO-2026-84920`) və ya dövlət nömrə nişanı (`99-XX-777`, `77-EK-202`) ilə yoxlayın:
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={registrySearchQuery}
                      onChange={(e) => setRegistrySearchQuery(e.target.value)}
                      placeholder="Məs: 99-XX-777 və ya BDYP-EKO-2026-84920"
                      data-testid="eco-registry-search-input"
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setHasSearchedRegistry(true)}
                      data-testid="eco-registry-search-btn"
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                    >
                      Yoxla
                    </button>
                  </div>

                  {hasSearchedRegistry && (
                    <div data-testid="eco-registry-search-result">
                      {registryLookupResult ? (
                        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-black text-emerald-300">
                              {registryLookupResult.certificateNumber}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                              AKTİV SERTİFİKAT
                            </span>
                          </div>
                          <div className="text-white font-bold">
                            {registryLookupResult.vehicleTitle} ({registryLookupResult.plateNumber})
                          </div>
                          <div className="text-slate-300">
                            Sinif: {registryLookupResult.euroClass} • CO:{' '}
                            {registryLookupResult.measuredCoIdlePercent}% • CH:{' '}
                            {registryLookupResult.measuredChPpm} ppm
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Etibarlıdır: {registryLookupResult.expiresAt} tarixinədək
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 text-xs text-rose-300">
                          Daxil edilən sorğuya uyğun aktiv ekoloji sertifikat tapılmadı.
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

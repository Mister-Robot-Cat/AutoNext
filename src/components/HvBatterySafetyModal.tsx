import React, { useState, useMemo } from 'react';
import { Vehicle, Currency } from '../types/vehicle';
import { formatPrice } from '../utils/i18n';
import {
  BatteryChemistryId,
  HvFaultConditionId,
  BATTERY_CHEMISTRY_PROFILES,
  HV_FAULT_PROFILES,
  HV_SERVICE_PACKAGES,
  ACCREDITED_HV_LAB_CENTERS,
  SAMPLE_HV_CERTIFICATES,
} from '../data/mockHvBatteryData';
import {
  evaluateHvInsulationAndSafety,
  evaluateBatterySohAndCellDelta,
  evaluateAvasAndGreenPrivileges,
  calculateHvServiceCost,
  generateHvComplianceCertificate,
  lookupHvCertificate,
} from '../utils/hvBatteryCompliance';
import {
  X,
  BatteryCharging,
  Zap,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Activity,
  Thermometer,
  Volume2,
  Building2,
  FileCheck,
  Search,
  Copy,
  Check,
  CheckCircle2,
  Coins,
  Wrench,
} from 'lucide-react';

interface HvBatterySafetyModalProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  currency: Currency;
  onClose: () => void;
}

type ActiveTab =
  | 'insulation'
  | 'soh_delta'
  | 'avas_green'
  | 'centers'
  | 'certificate';

export const HvBatterySafetyModal: React.FC<HvBatterySafetyModalProps> = ({
  isOpen,
  vehicle,
  currency,
  onClose,
}) => {
  // Determine default chemistry from vehicle if available
  const defaultChemistry: BatteryChemistryId =
    vehicle?.fuelType === 'electric'
      ? 'lfp_blade_400v'
      : vehicle?.fuelType === 'hybrid'
      ? 'nimh_hev_245v'
      : 'lfp_blade_400v';

  const [activeTab, setActiveTab] = useState<ActiveTab>('insulation');

  // Tab 1: HV Insulation (UNECE R100) & FHN Thermal Safety state
  const [systemVoltageV, setSystemVoltageV] = useState<number>(
    vehicle?.fuelType === 'hybrid' ? 245 : 400
  );
  const [measuredInsulationMohm, setMeasuredInsulationMohm] =
    useState<number>(185);
  const [faultCondition, setFaultCondition] =
    useState<HvFaultConditionId>('clean_oem_intact');
  const [hvilLoopIntact, setHvilLoopIntact] = useState<boolean>(true);
  const [pyroFuseIntact, setPyroFuseIntact] = useState<boolean>(true);
  const [maxPackTemperatureC, setMaxPackTemperatureC] = useState<number>(31);

  // Tab 2: Battery SOH% & Cell Delta mV state
  const [chemistryId, setChemistryId] =
    useState<BatteryChemistryId>(defaultChemistry);
  const [sohPercent, setSohPercent] = useState<number>(94);
  const [cellDeltaMv, setCellDeltaMv] = useState<number>(12);
  const [internalResistanceMohm, setInternalResistanceMohm] =
    useState<number>(2.1);
  const [dcFastChargeRatioPercent, setDcFastChargeRatioPercent] =
    useState<number>(35);
  const [wltpRatedRangeKm, setWltpRatedRangeKm] = useState<number>(510);

  // Tab 3: UNECE R138 AVAS & Tax Code 164.1.41 / AMB Green Credit state
  const [powertrainType, setPowertrainType] = useState<
    'ev' | 'phev_hev' | 'ice'
  >(
    vehicle?.fuelType === 'electric'
      ? 'ev'
      : vehicle?.fuelType === 'hybrid'
      ? 'phev_hev'
      : 'ev'
  );
  const [vehicleAgeYears, setVehicleAgeYears] = useState<number>(
    vehicle ? Math.max(0, 2026 - vehicle.year) : 2
  );
  const [engineVolumeCc, setEngineVolumeCc] = useState<number>(
    vehicle?.engineVolumeLiters
      ? Math.round(vehicle.engineVolumeLiters * 1000)
      : 0
  );
  const [customsValueAzn, setCustomsValueAzn] = useState<number>(
    vehicle?.priceAzn || 48000
  );
  const [avasSpeakerActive, setAvasSpeakerActive] = useState<boolean>(true);
  const [avasMeasuredDba, setAvasMeasuredDba] = useState<number>(62);
  const [regenBrakeBlendingNormal, setRegenBrakeBlendingNormal] =
    useState<boolean>(true);

  // Tab 4: Accredited HV Centers & Service Packages state
  const [selectedPackages, setSelectedPackages] = useState<string[]>([
    'hv-pkg-megohm-r100',
  ]);
  const [selectedCity, setSelectedCity] = useState<string>('Hamısı');

  // Tab 5: Official Certificate & Registry Lookup state
  const [certPlate, setCertPlate] = useState<string>(
    vehicle?.plateNumber || '77-EV-099'
  );
  const [certVin, setCertVin] = useState<string>(
    vehicle?.vin || 'LGXC76C44R0192841'
  );
  const [selectedCenterId, setSelectedCenterId] = useState<string>(
    ACCREDITED_HV_LAB_CENTERS[0].id
  );
  const [registrySearchQuery, setRegistrySearchQuery] = useState<string>('');
  const [searchedCertificate, setSearchedCertificate] = useState<
    ReturnType<typeof lookupHvCertificate> | undefined
  >(undefined);
  const [copiedCert, setCopiedCert] = useState<boolean>(false);

  const insulationResult = useMemo(
    () =>
      evaluateHvInsulationAndSafety({
        systemVoltageV,
        measuredInsulationMohm,
        faultCondition,
        hvilLoopIntact,
        pyroFuseIntact,
        maxPackTemperatureC,
      }),
    [
      systemVoltageV,
      measuredInsulationMohm,
      faultCondition,
      hvilLoopIntact,
      pyroFuseIntact,
      maxPackTemperatureC,
    ]
  );

  const sohResult = useMemo(
    () =>
      evaluateBatterySohAndCellDelta({
        chemistryId,
        sohPercent,
        cellDeltaMv,
        internalResistanceMohm,
        dcFastChargeRatioPercent,
        wltpRatedRangeKm,
      }),
    [
      chemistryId,
      sohPercent,
      cellDeltaMv,
      internalResistanceMohm,
      dcFastChargeRatioPercent,
      wltpRatedRangeKm,
    ]
  );

  const avasGreenResult = useMemo(
    () =>
      evaluateAvasAndGreenPrivileges({
        powertrainType,
        vehicleAgeYears,
        engineVolumeCc,
        customsValueAzn,
        avasSpeakerActive,
        avasMeasuredDba,
        regenBrakeBlendingNormal,
      }),
    [
      powertrainType,
      vehicleAgeYears,
      engineVolumeCc,
      customsValueAzn,
      avasSpeakerActive,
      avasMeasuredDba,
      regenBrakeBlendingNormal,
    ]
  );

  const serviceSummary = useMemo(
    () => calculateHvServiceCost(selectedPackages, currency),
    [selectedPackages, currency]
  );

  const filteredCenters = useMemo(() => {
    if (selectedCity === 'Hamısı') return ACCREDITED_HV_LAB_CENTERS;
    return ACCREDITED_HV_LAB_CENTERS.filter((c) => c.city === selectedCity);
  }, [selectedCity]);

  const activeCenter = useMemo(
    () =>
      ACCREDITED_HV_LAB_CENTERS.find((c) => c.id === selectedCenterId) ??
      ACCREDITED_HV_LAB_CENTERS[0],
    [selectedCenterId]
  );

  const generatedCertificate = useMemo(
    () =>
      generateHvComplianceCertificate({
        plateNumber: certPlate,
        vin: certVin,
        vehicleTitle: vehicle?.title || 'BYD Song Plus / Toyota Hybrid',
        chemistryId,
        measuredInsulationMohm,
        sohPercent,
        cellDeltaMv,
        avasCompliant: avasGreenResult.isAvasCompliant,
        centerNameAz: activeCenter.nameAz,
      }),
    [
      certPlate,
      certVin,
      vehicle,
      chemistryId,
      measuredInsulationMohm,
      sohPercent,
      cellDeltaMv,
      avasGreenResult.isAvasCompliant,
      activeCenter,
    ]
  );

  if (!isOpen) return null;

  const togglePackage = (id: string) => {
    setSelectedPackages((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCopyCertificate = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(generatedCertificate.certificateNumber);
    }
    setCopiedCert(true);
    setTimeout(() => setCopiedCert(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      data-testid="hv-battery-safety-modal"
    >
      <div
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white shadow-lg shadow-teal-500/25">
              <BatteryCharging className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  AZS, BDYP & FHN Elektromobil / Hibrid Yüksək Gərginlik (HV) və SOH% Stendi
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase">
                  UNECE R100 / R138 & VM 164.1.41
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                ≥500 Ω/V İzolyasiya Müqaviməti, Batareya SOH% & Özək Disbalansı (ΔmV), AVAS Piyada Səsi və AMB Yaşıl Avtokredit Portalı
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            data-testid="close-hv-battery-modal-btn"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-3 bg-slate-950/50 border-b border-slate-800 overflow-x-auto">
          {[
            {
              id: 'insulation' as ActiveTab,
              label: '1. HV İzolyasiya (R100) & FHN',
              icon: Zap,
              testId: 'tab-hv-insulation',
            },
            {
              id: 'soh_delta' as ActiveTab,
              label: '2. Batareya SOH% & Özək (mV)',
              icon: Activity,
              testId: 'tab-hv-soh-delta',
            },
            {
              id: 'avas_green' as ActiveTab,
              label: '3. AVAS (R138) & Yaşıl Kredit',
              icon: Volume2,
              testId: 'tab-hv-avas-green',
            },
            {
              id: 'centers' as ActiveTab,
              label: '4. AZS / FHN HV Mərkəzləri',
              icon: Building2,
              testId: 'tab-hv-centers',
            },
            {
              id: 'certificate' as ActiveTab,
              label: '5. Rəsmi Sertifikat (AZS-HV)',
              icon: FileCheck,
              testId: 'tab-hv-certificate',
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
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/25'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: HV INSULATION RESISTANCE (UNECE R100) & FHN SAFETY */}
          {activeTab === 'insulation' && (
            <div className="space-y-6" data-testid="panel-hv-insulation">
              {/* Verdict Banner */}
              <div
                data-testid="hv-insulation-verdict-banner"
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  insulationResult.prohibitsOperationImmediately
                    ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                    : !insulationResult.isCompliant ||
                      insulationResult.insulationWarningZone
                    ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                    : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {insulationResult.prohibitsOperationImmediately ? (
                    <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                  ) : (
                    <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="text-sm sm:text-base font-black text-white">
                      {insulationResult.verdictBadgeAz}
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      Nisbi müqavimət:{' '}
                      <strong
                        className="text-white"
                        data-testid="ohm-per-volt-value"
                      >
                        {insulationResult.ohmPerVoltRatio.toLocaleString()} Ω/V
                      </strong>{' '}
                      (UNECE R100 minimum tələb: ≥{insulationResult.minRequiredOhmPerVolt} Ω/V /{' '}
                      {insulationResult.minRequiredMohm} MΩ)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      İXM Maddə 342.2-1 Cəriməsi
                    </span>
                    <span
                      className="text-lg font-black text-white"
                      data-testid="insulation-fine-amount"
                    >
                      {insulationResult.fineAzn} ₼
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Left Column: Megohmmeter & Voltage Inputs */}
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-teal-400" />
                    <span>1000V Meqommetr HV Şin İzolyasiya Stendi (UNECE R100)</span>
                  </h3>

                  {/* System Voltage Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Nominal Yüksək Gərginlik Arxitekturası (V)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { v: 245, label: '245V HEV' },
                        { v: 350, label: '350V PHEV' },
                        { v: 400, label: '400V EV' },
                        { v: 800, label: '800V SiC' },
                      ].map((opt) => (
                        <button
                          key={opt.v}
                          type="button"
                          onClick={() => setSystemVoltageV(opt.v)}
                          data-testid={`voltage-btn-${opt.v}`}
                          className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            systemVoltageV === opt.v
                              ? 'bg-teal-600/20 border-teal-500 text-teal-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Measured Insulation Resistance MΩ */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-300 font-semibold">
                        Ölçülən İzolyasiya Müqaviməti (MΩ):
                      </span>
                      <span
                        className="font-mono font-bold text-teal-400"
                        data-testid="measured-insulation-display"
                      >
                        {measuredInsulationMohm.toFixed(2)} MΩ
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.05}
                      max={300}
                      step={0.05}
                      value={measuredInsulationMohm}
                      data-testid="insulation-mohm-slider"
                      onChange={(e) =>
                        setMeasuredInsulationMohm(parseFloat(e.target.value))
                      }
                      className="w-full accent-teal-500 cursor-pointer"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      <button
                        type="button"
                        data-testid="preset-insulation-healthy"
                        onClick={() => {
                          setMeasuredInsulationMohm(185);
                          setFaultCondition('clean_oem_intact');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold cursor-pointer"
                      >
                        185 MΩ (Zavod İdeal)
                      </button>
                      <button
                        type="button"
                        data-testid="preset-insulation-leak"
                        onClick={() => {
                          setMeasuredInsulationMohm(0.08);
                          setFaultCondition('p0aa6_insulation_leak');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] font-semibold cursor-pointer"
                      >
                        0.08 MΩ (P0AA6 Sızma &lt;500 Ω/V)
                      </button>
                    </div>
                  </div>

                  {/* Max Pack Temperature Slider */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-300 font-semibold flex items-center gap-1">
                        <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                        Maksimum Özək Temperaturu (FHN Termiki Nəzarət):
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          maxPackTemperatureC > 55
                            ? 'text-rose-400'
                            : maxPackTemperatureC > 45
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                        data-testid="pack-temp-display"
                      >
                        {maxPackTemperatureC}°C
                      </span>
                    </div>
                    <input
                      type="range"
                      min={15}
                      max={75}
                      step={1}
                      value={maxPackTemperatureC}
                      data-testid="pack-temp-slider"
                      onChange={(e) =>
                        setMaxPackTemperatureC(parseInt(e.target.value, 10))
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Right Column: Fault Condition & Hardware Interlocks */}
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>OBD-II HV İzolyasiya Kodu, HVIL & Piropatron Ekspertizası</span>
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Aşkarlanan HV Diaqnostika Profili
                    </label>
                    <select
                      value={faultCondition}
                      data-testid="hv-fault-select"
                      onChange={(e) =>
                        setFaultCondition(e.target.value as HvFaultConditionId)
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white"
                    >
                      {HV_FAULT_PROFILES.map((fp) => (
                        <option key={fp.id} value={fp.id}>
                          [{fp.code}] {fp.titleAz}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* HVIL & Pyro-Fuse Toggles */}
                  <div className="space-y-2.5 pt-1">
                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800 cursor-pointer">
                      <div>
                        <span className="text-xs font-bold text-white block">
                          HVIL (High-Voltage Interlock Loop) Təhlükəsizlik Halqası
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Konnektor açıldıqda 400V/800V kontaktorları dərhal ayırır
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={hvilLoopIntact}
                        data-testid="hvil-intact-checkbox"
                        onChange={(e) => setHvilLoopIntact(e.target.checked)}
                        className="w-4 h-4 accent-teal-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800 cursor-pointer">
                      <div>
                        <span className="text-xs font-bold text-white block">
                          Qəza HV Piropatron Qoruyucusu (Pyro-Fuse OEM)
                        </span>
                        <span className="text-[11px] text-slate-400">
                          SRS zərbə zamanı yüksək gərginliyi 5 ms ərzində kəsir
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={pyroFuseIntact}
                        data-testid="pyro-fuse-checkbox"
                        onChange={(e) => setPyroFuseIntact(e.target.checked)}
                        className="w-4 h-4 accent-teal-500"
                      />
                    </label>
                  </div>

                  {/* Violations & Recommendations List */}
                  {insulationResult.violationsAz.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-1.5">
                      {insulationResult.violationsAz.map((v, i) => (
                        <div
                          key={i}
                          className="text-xs text-rose-200 flex items-start gap-2"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                          <span>{v}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {insulationResult.recommendationsAz.map((rec, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BATTERY SOH% & CELL VOLTAGE DELTA (mV) TELEMETRY */}
          {activeTab === 'soh_delta' && (
            <div className="space-y-6" data-testid="panel-hv-soh-delta">
              {/* Verdict Header */}
              <div
                data-testid="soh-verdict-banner"
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  sohResult.healthGrade === 'A_OPTIMAL'
                    ? 'bg-emerald-950/30 border-emerald-500/40'
                    : sohResult.healthGrade === 'D_CRITICAL_REPLACE'
                    ? 'bg-rose-950/30 border-rose-500/40'
                    : 'bg-amber-950/30 border-amber-500/40'
                }`}
              >
                <div>
                  <h3 className="text-base font-black text-white">
                    {sohResult.verdictTitleAz}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Faktiki Tutum:{' '}
                    <strong className="text-white" data-testid="usable-kwh-value">
                      {sohResult.usableCapacityKwh} kWh
                    </strong>{' '}
                    • Bakı Yay Yürüşü:{' '}
                    <strong
                      className="text-teal-300"
                      data-testid="summer-range-value"
                    >
                      {sohResult.estimatedBakuSummerRangeKm} km
                    </strong>{' '}
                    • Bakı Qış Yürüşü:{' '}
                    <strong
                      className="text-sky-300"
                      data-testid="winter-range-value"
                    >
                      {sohResult.estimatedBakuWinterRangeKm} km
                    </strong>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Bazar Qiymətinə Təsiri
                  </span>
                  <span
                    data-testid="soh-valuation-impact"
                    className={`text-base font-black ${
                      sohResult.valuationAdjustmentAzn >= 0
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {sohResult.valuationAdjustmentAzn >= 0 ? '+' : ''}
                    {sohResult.valuationAdjustmentAzn} ₼
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Left Column: Chemistry & Sliders */}
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Batareya Kimyəvi Arxitekturası
                    </label>
                    <select
                      value={chemistryId}
                      data-testid="battery-chemistry-select"
                      onChange={(e) =>
                        setChemistryId(e.target.value as BatteryChemistryId)
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white"
                    >
                      {BATTERY_CHEMISTRY_PROFILES.map((chem) => (
                        <option key={chem.id} value={chem.id}>
                          {chem.nameAz} ({chem.nominalVoltageV}V)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* SOH% Slider */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-300 font-semibold">
                        Batareya Sağlamlıq Faizi (SOH%):
                      </span>
                      <span
                        className="font-mono font-bold text-teal-400"
                        data-testid="soh-percent-display"
                      >
                        {sohPercent}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={55}
                      max={100}
                      step={1}
                      value={sohPercent}
                      data-testid="soh-percent-slider"
                      onChange={(e) =>
                        setSohPercent(parseInt(e.target.value, 10))
                      }
                      className="w-full accent-teal-500 cursor-pointer"
                    />
                  </div>

                  {/* Cell Voltage Delta mV Slider */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-300 font-semibold">
                        Özəklər Arası Gərginlik Disbalansı (ΔV mV):
                      </span>
                      <span
                        className="font-mono font-bold text-amber-400"
                        data-testid="cell-delta-display"
                      >
                        {cellDeltaMv} mV
                      </span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={150}
                      step={1}
                      value={cellDeltaMv}
                      data-testid="cell-delta-slider"
                      onChange={(e) =>
                        setCellDeltaMv(parseInt(e.target.value, 10))
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Internal Resistance Slider */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-300 font-semibold">
                        Daxili Müqavimət (R_int mΩ) & DC Sürətli Şarj Payı:
                      </span>
                      <span className="font-mono font-bold text-slate-200">
                        {internalResistanceMohm.toFixed(1)} mΩ • DC {dcFastChargeRatioPercent}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="range"
                        min={1.0}
                        max={8.0}
                        step={0.2}
                        value={internalResistanceMohm}
                        data-testid="internal-resistance-slider"
                        onChange={(e) =>
                          setInternalResistanceMohm(parseFloat(e.target.value))
                        }
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={dcFastChargeRatioPercent}
                        data-testid="dc-ratio-slider"
                        onChange={(e) =>
                          setDcFastChargeRatioPercent(
                            parseInt(e.target.value, 10)
                          )
                        }
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column: Telemetry KPI Cards & Diagnostics */}
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Qalan Tam Şarj Dövrü
                      </span>
                      <span
                        className="text-lg font-black text-white"
                        data-testid="remaining-cycles-value"
                      >
                        ~{sohResult.remainingCyclesEstimate} dövr
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        WLTP Pasport Yürüşü
                      </span>
                      <input
                        type="number"
                        value={wltpRatedRangeKm}
                        data-testid="wltp-range-input"
                        onChange={(e) =>
                          setWltpRatedRangeKm(
                            Math.max(50, parseInt(e.target.value, 10) || 0)
                          )
                        }
                        className="w-full mt-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs font-bold text-white"
                      />
                    </div>
                  </div>

                  {sohResult.violationsAz.map((v, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-2"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{v}</span>
                    </div>
                  ))}

                  {sohResult.recommendationsAz.map((rec, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: UNECE R138 AVAS & TAX CODE 164.1.41 / AMB GREEN LOAN */}
          {activeTab === 'avas_green' && (
            <div className="space-y-6" data-testid="panel-hv-avas-green">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Left Column: AVAS & Powertrain Inputs */}
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-teal-400" />
                    <span>UNECE R138 AVAS (0–20 km/s Piyada Səsi) & Güc Qurğusu</span>
                  </h3>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'ev' as const, label: 'Tam Elektrik (EV)' },
                      { id: 'phev_hev' as const, label: 'Hibrid (HEV/PHEV)' },
                      { id: 'ice' as const, label: 'Benzin/Dizel (ICE)' },
                    ].map((pt) => (
                      <button
                        key={pt.id}
                        type="button"
                        data-testid={`powertrain-btn-${pt.id}`}
                        onClick={() => setPowertrainType(pt.id)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          powertrainType === pt.id
                            ? 'bg-teal-600/20 border-teal-500 text-teal-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {pt.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Avtomobil Yaşı (İl)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={15}
                        value={vehicleAgeYears}
                        data-testid="green-age-input"
                        onChange={(e) =>
                          setVehicleAgeYears(
                            Math.max(0, parseInt(e.target.value, 10) || 0)
                          )
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Mühərrik (sm³)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={6000}
                        value={engineVolumeCc}
                        data-testid="green-cc-input"
                        onChange={(e) =>
                          setEngineVolumeCc(
                            Math.max(0, parseInt(e.target.value, 10) || 0)
                          )
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Dəyəri (AZN)
                      </label>
                      <input
                        type="number"
                        min={5000}
                        step={1000}
                        value={customsValueAzn}
                        data-testid="green-value-input"
                        onChange={(e) =>
                          setCustomsValueAzn(
                            Math.max(5000, parseInt(e.target.value, 10) || 5000)
                          )
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white"
                      />
                    </div>
                  </div>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-white block">
                        UNECE R138 AVAS Xarici Piyada Dinamiki Aktivdir (56–75 dBA)
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Söndürüldükdə İXM Maddə 342.2-1 üzrə 150 ₼ cərimə tətbiq edilir
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={avasSpeakerActive}
                      data-testid="avas-active-checkbox"
                      onChange={(e) => setAvasSpeakerActive(e.target.checked)}
                      className="w-4 h-4 accent-teal-500"
                    />
                  </label>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-300 font-semibold">
                        20 km/saat Sürətdə AVAS Akustik Səviyyəsi (dBA):
                      </span>
                      <span className="font-mono font-bold text-teal-400">
                        {avasMeasuredDba} dBA
                      </span>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={85}
                      step={1}
                      value={avasMeasuredDba}
                      data-testid="avas-dba-slider"
                      onChange={(e) =>
                        setAvasMeasuredDba(parseInt(e.target.value, 10))
                      }
                      className="w-full accent-teal-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Right Column: Tax Code 164.1.41 & AMB Green Loan Output */}
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Coins className="w-4 h-4 text-emerald-400" />
                    <span>Vergi Məcəlləsi Maddə 164.1.41 & AMB Yaşıl Avtokredit</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-emerald-950/25 border border-emerald-500/30">
                      <span className="text-[10px] uppercase font-bold text-emerald-300 block">
                        Gömrük & ƏDV Güzəşt Qənaəti
                      </span>
                      <span
                        className="text-lg font-black text-white"
                        data-testid="green-tax-savings-value"
                      >
                        {formatPrice(
                          avasGreenResult.estimatedTaxSavingsAzn,
                          currency
                        )}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-teal-950/25 border border-teal-500/30">
                      <span className="text-[10px] uppercase font-bold text-teal-300 block">
                        AMB Min. İlkin Ödəniş ({avasGreenResult.ambMinDownPaymentPercent}%)
                      </span>
                      <span
                        className="text-lg font-black text-white"
                        data-testid="amb-down-payment-value"
                      >
                        {formatPrice(
                          avasGreenResult.ambMinDownPaymentAzn,
                          currency
                        )}
                      </span>
                    </div>
                  </div>

                  {avasGreenResult.violationsAz.map((v, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-2"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{v}</span>
                    </div>
                  ))}

                  {avasGreenResult.benefitsAz.map((b, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACCREDITED AZS / BDYP / FHN HV LABORATORIES & PACKAGES */}
          {activeTab === 'centers' && (
            <div className="space-y-6" data-testid="panel-hv-centers">
              {/* Service Packages */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-teal-400" />
                    <span>HV Stend Diaqnostikası & Özək Balanslaşdırma Paketləri</span>
                  </h3>
                  <div className="text-xs text-slate-300">
                    Cəmi Xərc:{' '}
                    <strong
                      className="text-teal-400 text-sm"
                      data-testid="hv-service-total-cost"
                    >
                      {formatPrice(serviceSummary.totalAzn, currency)}
                    </strong>{' '}
                    • Qorunan Zərər/Cərimə:{' '}
                    <strong className="text-emerald-400">
                      {formatPrice(
                        serviceSummary.finesOrDamageAvoidedAzn,
                        currency
                      )}
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {HV_SERVICE_PACKAGES.map((pkg) => {
                    const isSelected = selectedPackages.includes(pkg.id);
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => togglePackage(pkg.id)}
                        data-testid={`hv-pkg-${pkg.id}`}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-teal-950/30 border-teal-500/60'
                            : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-white">
                            {pkg.nameAz}
                          </span>
                          <span className="text-xs font-black text-teal-400 shrink-0">
                            {formatPrice(
                              pkg.partsAndDutyAzn + pkg.laborCostAzn,
                              currency
                            )}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {pkg.descriptionAz}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Accredited Centers Radar */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-sm font-bold text-white">
                    Akkreditasiyalı AZS, BDYP & FHN Yüksək Gərginlik Laboratoriyaları
                  </h3>
                  <div className="flex gap-1.5">
                    {['Hamısı', 'Bakı', 'Sumqayıt', 'Gəncə'].map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => setSelectedCity(city)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                          selectedCity === city
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredCenters.map((center) => (
                    <div
                      key={center.id}
                      className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-white">
                            {center.nameAz}
                          </h4>
                          <span className="text-[10px] font-semibold text-teal-400">
                            {center.authorityBadgeAz} • Maks. {center.maxTestVoltageV}V
                          </span>
                        </div>
                        {center.supports800VArchitecture && (
                          <span className="px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-300 text-[10px] font-bold">
                            800V SiC
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{center.addressAz}</p>
                      <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                        <span>{center.phone}</span>
                        <span>{center.workingHours}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: OFFICIAL CERTIFICATE (AZS-HV-2026) & UNIFIED REGISTRY */}
          {activeTab === 'certificate' && (
            <div className="space-y-6" data-testid="panel-hv-certificate">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Certificate Generator Form & Card */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-teal-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-teal-400 block">
                        Rəsmi Elektron HV Təhlükəsizlik & SOH% Şəhadətnaməsi
                      </span>
                      <h3
                        className="text-lg font-black text-white font-mono"
                        data-testid="generated-hv-cert-number"
                      >
                        {generatedCertificate.certificateNumber}
                      </h3>
                    </div>
                    <button
                      type="button"
                      data-testid="copy-hv-cert-btn"
                      onClick={handleCopyCertificate}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 text-xs font-bold cursor-pointer"
                    >
                      {copiedCert ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Kopyalandı</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Kodu Kopyala</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Dövlət Qeydiyyat Nişanı (DQN)
                      </label>
                      <input
                        type="text"
                        value={certPlate}
                        data-testid="cert-plate-input"
                        onChange={(e) => setCertPlate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-white uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        VIN / Şassi Nömrəsi
                      </label>
                      <input
                        type="text"
                        value={certVin}
                        data-testid="cert-vin-input"
                        onChange={(e) => setCertVin(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-white uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Sertifikatı Verən Akkreditasiyalı HV Mərkəzi
                    </label>
                    <select
                      value={selectedCenterId}
                      onChange={(e) => setSelectedCenterId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    >
                      {ACCREDITED_HV_LAB_CENTERS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nameAz}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Kimyəvi Tip:</span>
                      <span className="text-white font-semibold">
                        {generatedCertificate.chemistryNameAz}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        UNECE R100 İzolyasiya:
                      </span>
                      <span className="text-teal-300 font-mono font-bold">
                        {generatedCertificate.measuredInsulationMohm} MΩ (
                        {generatedCertificate.ohmPerVoltRatio.toLocaleString()}{' '}
                        Ω/V)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        Batareya SOH% & Özək Disbalansı:
                      </span>
                      <span className="text-emerald-300 font-mono font-bold">
                        SOH {generatedCertificate.sohPercent}% • ΔV{' '}
                        {generatedCertificate.cellDeltaMv} mV
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Yekun Status:</span>
                      <span
                        data-testid="generated-cert-status"
                        className="font-black text-white"
                      >
                        {generatedCertificate.overallStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Unified Registry Verification Lookup */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Search className="w-4 h-4 text-teal-400" />
                    <span>Vahid AZS-HV Elektron Reyestr Yoxlaması</span>
                  </h3>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={registrySearchQuery}
                      data-testid="hv-registry-search-input"
                      onChange={(e) => setRegistrySearchQuery(e.target.value)}
                      placeholder="Sertifikat № (AZS-HV-2026-91408) və ya DQN (77-EV-099)..."
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                    />
                    <button
                      type="button"
                      data-testid="hv-registry-search-btn"
                      onClick={() =>
                        setSearchedCertificate(
                          lookupHvCertificate(registrySearchQuery)
                        )
                      }
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold cursor-pointer"
                    >
                      Yoxla
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_HV_CERTIFICATES.map((sample) => (
                      <button
                        key={sample.certificateNumber}
                        type="button"
                        data-testid={`sample-hv-cert-${sample.plateNumber}`}
                        onClick={() => {
                          setRegistrySearchQuery(sample.certificateNumber);
                          setSearchedCertificate(sample);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-teal-300 cursor-pointer"
                      >
                        {sample.certificateNumber} ({sample.plateNumber})
                      </button>
                    ))}
                  </div>

                  {searchedCertificate ? (
                    <div
                      data-testid="hv-registry-lookup-result"
                      className="p-4 rounded-xl bg-emerald-950/25 border border-emerald-500/40 space-y-1.5 text-xs"
                    >
                      <div className="font-black text-emerald-300">
                        ✓ Təsdiqləndi: {searchedCertificate.certificateNumber}
                      </div>
                      <div className="text-white font-semibold">
                        {searchedCertificate.vehicleTitle} ({searchedCertificate.plateNumber})
                      </div>
                      <div className="text-slate-300">
                        SOH: {searchedCertificate.sohPercent}% • ΔV:{' '}
                        {searchedCertificate.cellDeltaMv} mV • İzolyasiya:{' '}
                        {searchedCertificate.measuredInsulationMohm} MΩ
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Mərkəz: {searchedCertificate.centerNameAz}
                      </div>
                    </div>
                  ) : (
                    searchedCertificate === null && (
                      <div
                        data-testid="hv-registry-not-found"
                        className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-300"
                      >
                        Sorğu üzrə aktiv AZS-HV elektron sertifikat tapılmadı.
                      </div>
                    )
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

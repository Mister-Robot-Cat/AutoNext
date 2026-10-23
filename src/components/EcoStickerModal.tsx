import React, { useState } from 'react';
import { Currency, Language } from '../types/vehicle';
import {
  EcoStickerCategory,
  LowEmissionZoneId,
  EuroStandard,
  VehicleCategory,
  ECO_STICKERS,
  LEZ_ZONES,
  calculateEcoCompliance,
  generateEcoStickerCertificate,
  formatEcoCurrency,
  EcoStickerCertificate,
} from '../utils/ecoStickerCompliance';
import {
  MOCK_AQI_STATIONS,
  MOCK_ECO_CENTERS,
  MOCK_VEHICLE_ECO_PRESETS,
} from '../data/mockEcoStickerData';
import {
  X,
  Leaf,
  ShieldCheck,
  AlertTriangle,
  Wind,
  MapPin,
  Clock,
  Printer,
  Copy,
  CheckCircle2,
  Calendar,
  Building,
  Car,
  QrCode,
  Gauge,
  Info,
} from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock';
import { useKeyPress } from '../hooks/useKeyPress';

export type EcoStickerTab = 'calculator' | 'zones_radar' | 'stations' | 'certificate';

interface EcoStickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVehicle?: {
    makeModel?: string;
    plate?: string;
    vin?: string;
    year?: number;
    fuelType?: string;
    engineCc?: number;
    hasCatalystOrDpf?: boolean;
  } | null;
  currency: Currency;
  lang: Language;
}

export const EcoStickerModal: React.FC<EcoStickerModalProps> = ({
  isOpen,
  onClose,
  initialVehicle,
  currency,
  lang,
}) => {
  useScrollLock(isOpen);
  useKeyPress('Escape', onClose);

  // Active Tab
  const [activeTab, setActiveTab] = useState<EcoStickerTab>('calculator');

  // Calculator State
  const [plate, setPlate] = useState(initialVehicle?.plate || '90-AA-104');
  const [vin, setVin] = useState(initialVehicle?.vin || 'KNAGH414BBA098124');
  const [makeModel, setMakeModel] = useState(initialVehicle?.makeModel || 'Hyundai Ioniq 5 Long Range EV');
  const [year, setYear] = useState(initialVehicle?.year || 2023);
  const [fuelType, setFuelType] = useState(initialVehicle?.fuelType || 'Electric');
  const [engineCc, setEngineCc] = useState(initialVehicle?.engineCc || 0);
  const [hasCatalyst, setHasCatalyst] = useState(initialVehicle?.hasCatalystOrDpf ?? true);
  const [vehicleCategory, setVehicleCategory] = useState<VehicleCategory>('m1_passenger');
  const [selectedZone, setSelectedZone] = useState<LowEmissionZoneId>('zone_1_ulez');
  const [isPeakHours, setIsPeakHours] = useState(true);
  const [isResident, setIsResident] = useState(false);
  const [isDisabledDriver, setIsDisabledDriver] = useState(false);
  const [passType, setPassType] = useState<'daily' | 'monthly' | 'annual'>('daily');

  // Appointment Simulator State
  const [bookedCenterId, setBookedCenterId] = useState<string | null>(null);
  const [appointmentRef, setAppointmentRef] = useState<string | null>(null);

  // Copy Feedback State
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  // Perform Real-time Compliance Calculation
  const complianceResult = calculateEcoCompliance({
    fuelType,
    year,
    engineCc,
    hasCatalystOrDpf: hasCatalyst,
    vehicleCategory,
    zoneId: selectedZone,
    isPeakHours,
    isResident,
    isDisabledDriver,
    passType,
  });

  // Current Certificate
  const certificate: EcoStickerCertificate = generateEcoStickerCertificate(
    plate,
    vin,
    makeModel,
    complianceResult.stickerCategory,
    complianceResult.euroClass
  );

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleApplyPreset = (preset: (typeof MOCK_VEHICLE_ECO_PRESETS)[0]) => {
    setPlate(preset.plate);
    setVin(preset.vin);
    setMakeModel(preset.makeModel);
    setYear(preset.year);
    setFuelType(preset.fuelType);
    setEngineCc(preset.engineCc);
    setHasCatalyst(preset.hasCatalystOrDpf);
  };

  const handleBookAppointment = (center: (typeof MOCK_ECO_CENTERS)[0]) => {
    const refCode = `EKO-APP-${Math.floor(10000 + Math.random() * 90000)}`;
    setBookedCenterId(center.id);
    setAppointmentRef(refCode);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">
                  Yaşıl Bakı — Aşağı Emissiyalı Ekoloji Zonalar (LEZ) & Eko-Stiker Portalı
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ETSN & BDYP Rəsmi
                </span>
              </div>
              <p className="text-xs text-slate-400">
                COP29 ekoloji mirası üzrə Bakı şəhəri ekoloji giriş zonaları, Euro-emissiya kateqoriyası və dövlət rüsumları
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 sm:px-6 overflow-x-auto gap-2 py-2">
          <button
            onClick={() => setActiveTab('calculator')}
            data-testid="tab-calculator"
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'calculator'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Gauge className="w-4 h-4" />
            Ekoloji Uyğunluq & Rüsum Kalkulyatoru
          </button>

          <button
            onClick={() => setActiveTab('zones_radar')}
            data-testid="tab-zones-radar"
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'zones_radar'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Wind className="w-4 h-4" />
            Bakı Zonaları & Canlı AQI Radarı
          </button>

          <button
            onClick={() => setActiveTab('stations')}
            data-testid="tab-stations"
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'stations'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Building className="w-4 h-4" />
            Eko-Diaqnostika Məntəqələri
          </button>

          <button
            onClick={() => setActiveTab('certificate')}
            data-testid="tab-certificate"
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'certificate'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Rəsmi ETSN-LEZ-2026 E-Stiker
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: CALCULATOR & COMPLIANCE */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              {/* Quick Vehicle Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Nümunə Avtomobil Seçimi (Sürətli Sınaq)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {MOCK_VEHICLE_ECO_PRESETS.map((preset) => (
                    <button
                      key={preset.plate}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        plate === preset.plate
                          ? 'bg-emerald-600/20 border-emerald-500 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="font-mono text-[11px] font-bold text-emerald-400">{preset.plate}</div>
                      <div className="text-[11px] font-semibold truncate">{preset.makeModel.split(' ')[0]} {preset.makeModel.split(' ')[1]}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{preset.fuelType}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Inputs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Dövlət Qeydiyyat Nişanı</label>
                  <input
                    type="text"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono uppercase focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Marka & Model</label>
                  <input
                    type="text"
                    value={makeModel}
                    onChange={(e) => setMakeModel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Buraxılış İli</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    min={1990}
                    max={2026}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Mühərrik / Yanacaq Növü</label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Electric">100% Elektrik (BEV)</option>
                    <option value="Plug-in Hybrid">Plug-in Hybrid (PHEV)</option>
                    <option value="Hybrid">Hibrid (HEV)</option>
                    <option value="Petrol">Benzin (Aİ-92 / 95 / 98)</option>
                    <option value="Diesel">Dizel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Mühərrik Həcmi (sm³)</label>
                  <input
                    type="number"
                    value={engineCc}
                    onChange={(e) => setEngineCc(Number(e.target.value))}
                    placeholder="Məs. 1998"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Nəqliyyat Kateqoriyası</label>
                  <select
                    value={vehicleCategory}
                    onChange={(e) => setVehicleCategory(e.target.value as VehicleCategory)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="m1_passenger">M1 — Minik Avtomobili</option>
                    <option value="n1_light_commercial">N1 — Yüngül Kommersiya (≤3.5t)</option>
                    <option value="m2_minibus">M2 — Mikroavtobus / Minibus</option>
                    <option value="n2_n3_heavy_truck">N2/N3 — Ağır Yük Avtomobili</option>
                  </select>
                </div>
              </div>

              {/* Toggles & Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:bg-slate-800/40">
                  <input
                    type="checkbox"
                    checked={hasCatalyst}
                    onChange={(e) => setHasCatalyst(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-white">Katalizator / DPF</div>
                    <div className="text-[10px] text-slate-400">Zavod filtri mövcuddur</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:bg-slate-800/40">
                  <input
                    type="checkbox"
                    checked={isPeakHours}
                    onChange={(e) => setIsPeakHours(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-white">Pik Saatlar</div>
                    <div className="text-[10px] text-slate-400">08:00 – 21:00 arası</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:bg-slate-800/40">
                  <input
                    type="checkbox"
                    checked={isResident}
                    onChange={(e) => setIsResident(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-white">Yerli Sakin</div>
                    <div className="text-[10px] text-emerald-400 font-bold">100% Güzəşt (Pulsuz)</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:bg-slate-800/40">
                  <input
                    type="checkbox"
                    checked={isDisabledDriver}
                    onChange={(e) => setIsDisabledDriver(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-white">Əlilliyi Olan Sürücü</div>
                    <div className="text-[10px] text-emerald-400 font-bold">100% Güzəşt (Pulsuz)</div>
                  </div>
                </label>
              </div>

              {/* Target Zone Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Daxil Olunan Aşağı Emissiya Zonası (LEZ)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {(Object.keys(LEZ_ZONES) as LowEmissionZoneId[]).map((zoneKey) => {
                    const z = LEZ_ZONES[zoneKey];
                    const isSelected = selectedZone === zoneKey;
                    return (
                      <button
                        key={zoneKey}
                        type="button"
                        onClick={() => setSelectedZone(zoneKey)}
                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-emerald-600/20 border-emerald-500 shadow-md shadow-emerald-500/20 text-white'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white">{z.nameAz.split('—')[0]}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {z.speedLimitKmH} km/s
                          </span>
                        </div>
                        <div className="text-[11px] font-semibold text-slate-300 mb-1">{z.nameAz.split('—')[1]}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-2">{z.boundariesAz}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Compliance Verdict & Tariff Card */}
              <div
                className={`p-6 rounded-3xl border ${
                  complianceResult.isProhibited
                    ? 'bg-rose-950/30 border-rose-600/40 text-rose-200'
                    : complianceResult.isAllowedFree
                    ? 'bg-emerald-950/30 border-emerald-600/40 text-emerald-200'
                    : 'bg-amber-950/30 border-amber-600/40 text-amber-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    {/* Visual Sticker Badge */}
                    <div
                      className="w-16 h-16 rounded-full flex flex-col items-center justify-center font-black shadow-lg border-4"
                      style={{
                        backgroundColor: complianceResult.stickerInfo.hexBg,
                        borderColor: complianceResult.stickerInfo.hexBorder,
                        color: complianceResult.stickerInfo.hexText,
                      }}
                    >
                      <span className="text-[10px] tracking-tighter uppercase font-bold">ETSN</span>
                      <span className="text-xl leading-none">{complianceResult.stickerInfo.tierNumber}</span>
                      <span className="text-[9px] tracking-widest font-mono">2026</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-white">
                          {complianceResult.stickerInfo.badgeLabelAz}
                        </span>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-white/10 font-mono">
                          Euro {complianceResult.euroClass.replace('euro_', '').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 max-w-xl">
                        {complianceResult.stickerInfo.descriptionAz}
                      </p>
                    </div>
                  </div>

                  {/* Status Banner */}
                  <div className="text-right">
                    {complianceResult.isProhibited ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs">
                        <AlertTriangle className="w-4 h-4" />
                        GİRİŞ QADAĞANDIR
                      </div>
                    ) : complianceResult.isAllowedFree ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        SƏRBƏST GİRİŞ (0 AZN)
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs">
                        <Clock className="w-4 h-4" />
                        RÜSUMLU GİRİŞ İCAZƏSİ
                      </div>
                    )}
                  </div>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-0.5">Gündəlik Eko-Rüsum</span>
                    <span className="text-lg font-black text-white">
                      {complianceResult.dailyFeeAzn > 0
                        ? formatEcoCurrency(complianceResult.dailyFeeAzn, currency)
                        : '0.00 AZN (Pulsuz)'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-0.5">Ümumi Ödəniş ({passType})</span>
                    <span className="text-lg font-black text-emerald-400">
                      {formatEcoCurrency(complianceResult.totalFeeAzn, currency)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-0.5">Təxmini CO₂ Emissiyası</span>
                    <span className="text-lg font-black text-slate-200">
                      {complianceResult.co2EmissionsGramPerKm} q/km
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-0.5">Qanunsuz Giriş Cəriməsi</span>
                    <span className="text-lg font-black text-rose-400">
                      {complianceResult.statutoryFineRiskAzn > 0 ? '50 AZN (İXM 342.5)' : '0 AZN (Uyğundur)'}
                    </span>
                  </div>
                </div>

                {/* Audit Notes */}
                {complianceResult.auditNotesAz.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-1">
                    {complianceResult.auditNotesAz.map((note, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ZONES & REAL-TIME AQI RADAR */}
          {activeTab === 'zones_radar' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Wind className="w-4 h-4 text-emerald-400" />
                  Bakı Ekoloji Hava Keyfiyyəti (AQI) və Telemetriya Stansiyaları
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {MOCK_AQI_STATIONS.map((sta) => (
                    <div
                      key={sta.id}
                      className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{sta.nameAz}</span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            sta.status === 'good'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : sta.status === 'moderate'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          AQI {sta.aqi} • {sta.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-center bg-slate-900/60 p-2 rounded-xl">
                        <div>
                          <span className="text-[10px] text-slate-500 block">PM2.5</span>
                          <span className="text-xs font-bold text-slate-200">{sta.pm25}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">PM10</span>
                          <span className="text-xs font-bold text-slate-200">{sta.pm10}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">NO₂</span>
                          <span className="text-xs font-bold text-slate-200">{sta.no2}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">CO</span>
                          <span className="text-xs font-bold text-slate-200">{sta.co}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{sta.district}</span>
                        <span>Hərarət: {sta.tempC}°C</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Zones Detail List */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  Rəsmi Aşağı Emissiya Zonaları Rejimi
                </h3>
                {(Object.keys(LEZ_ZONES) as LowEmissionZoneId[]).map((zoneKey) => {
                  const z = LEZ_ZONES[zoneKey];
                  return (
                    <div
                      key={zoneKey}
                      className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{z.nameAz}</span>
                        <span className="text-xs font-mono text-emerald-400 font-bold">
                          {z.baseDailyRateAzn > 0 ? `${z.baseDailyRateAzn} AZN / gün` : 'Giriş Pulsuz'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{z.descriptionAz}</p>
                      <div className="flex flex-wrap gap-2 pt-2 text-[11px] text-slate-400">
                        <span className="px-2 py-0.5 rounded bg-slate-800">
                          Sürət Həddi: {z.speedLimitKmH} km/s
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800">
                          Pik Saatlar: {z.peakHours}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800">
                          Nəzarət Kameraları: {z.activeCamerasCount} ədəd ANPR
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: DIAGNOSTIC CENTERS & APPOINTMENTS */}
          {activeTab === 'stations' && (
            <div className="space-y-6">
              {appointmentRef && (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">Növbə Rezervasiyası Təsdiqləndi!</div>
                      <div className="text-xs text-slate-300 font-mono">Talon: {appointmentRef}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(appointmentRef, 'Talon')}
                    className="px-3 py-1 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  >
                    Kodu Kopyala
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_ECO_CENTERS.map((center) => (
                  <div
                    key={center.id}
                    className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">{center.nameAz}</h4>
                        <p className="text-xs text-slate-400">{center.address}</p>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-slate-300">
                        {center.district}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center bg-slate-900/60 p-2.5 rounded-xl text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Gündəlik Güc</span>
                        <span className="font-bold text-slate-200">{center.dailyCapacity} avto</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Canlı Növbə</span>
                        <span className="font-bold text-amber-400">{center.currentQueue} avto</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Gözləmə</span>
                        <span className="font-bold text-emerald-400">~{center.avgWaitMinutes} dəq</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>İş Rejimi: {center.workingHours}</span>
                      <span>Əlaqə: {center.phone}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBookAppointment(center)}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Eko-Diaqnostikaya Yazıl
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: OFFICIAL CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-6">
              {/* Windshield Sticker Decal Simulation */}
              <div className="flex justify-center p-6 bg-slate-950/80 rounded-3xl border border-slate-800">
                <div
                  className="w-64 h-64 rounded-full p-4 flex flex-col items-center justify-between text-center shadow-2xl relative overflow-hidden border-8"
                  style={{
                    backgroundColor: complianceResult.stickerInfo.hexBg,
                    borderColor: complianceResult.stickerInfo.hexBorder,
                    color: complianceResult.stickerInfo.hexText,
                  }}
                >
                  <div className="w-full flex items-center justify-between text-[11px] font-bold px-2">
                    <span>AZƏRBAYCAN</span>
                    <span>ETSN & BDYP</span>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider">EKOLOJİ STİKER</div>
                    <div className="text-5xl font-black my-1">{complianceResult.stickerInfo.tierNumber}</div>
                    <div className="font-mono text-xs font-bold">{certificate.stickerNumber}</div>
                  </div>

                  <div className="w-full bg-black/30 py-1 rounded text-[10px] font-mono font-bold tracking-wider">
                    DQN: {plate}
                  </div>

                  <div className="text-[9px] text-white/80 font-mono">
                    RFID: {certificate.rfidTagUid}
                  </div>
                </div>
              </div>

              {/* Certificate Details Card */}
              <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-bold text-white">
                      Rəsmi Ekoloji Uyğunluq Sertifikatı
                    </span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    {certificate.certificateNumber}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Nəqliyyat Vasitəsi:</span>
                    <span className="font-bold text-white">{makeModel}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Dövlət Nömrə Nişanı:</span>
                    <span className="font-bold text-white font-mono">{plate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">VIN Kod:</span>
                    <span className="font-bold text-white font-mono">{vin}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Stiker Sinfi:</span>
                    <span className="font-bold text-emerald-400">{complianceResult.stickerInfo.badgeLabelAz}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Verilmə Tarixi:</span>
                    <span className="font-bold text-white">{certificate.issueDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Etibarlılıq Müddəti:</span>
                    <span className="font-bold text-white">{certificate.validUntil}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Verən Orqan:</span>
                    <span className="font-bold text-white">{certificate.issuingCenter}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Müfəttiş Şifrəsi:</span>
                    <span className="font-bold text-white font-mono">{certificate.inspectorId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Təhlükəsizlik Hash-i:</span>
                    <span className="font-mono text-[10px] text-slate-300 truncate block">
                      {certificate.sha256VerificationHash}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-3">
                  <button
                    onClick={() => handleCopy(certificate.certificateNumber, 'Sertifikat')}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    {copiedText === 'Sertifikat' ? 'Kopyalandı!' : 'Sertifikat Nömrəsini Kopyala'}
                  </button>

                  <button
                    onClick={() => window.print?.()}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Sertifikatı Çap Et
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

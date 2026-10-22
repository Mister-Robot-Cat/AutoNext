import React, { useState, useId } from 'react';
import {
  Truck,
  ShieldCheck,
  AlertTriangle,
  Scale,
  Compass,
  FileCheck2,
  Copy,
  Printer,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ExternalLink,
  Search,
} from 'lucide-react';
import { Currency } from '../types/vehicle';
import {
  auditOversizeCompliance,
  calculateRoadWearCompensation,
  convertCurrency,
  generateOversizePermitVoucher,
  CargoCategory,
  EscortRequirement,
  OversizePermitVoucher,
  STATUTORY_OVERSIZE_LIMITS,
} from '../utils/oversizePermitCompliance';
import {
  MOCK_CARGO_PRESETS,
  MOCK_HEAVY_CORRIDORS,
  MOCK_ACTIVE_PERMITS,
  CargoPreset,
} from '../data/mockOversizeData';

interface OversizePermitModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: Currency;
  initialPlate?: string;
}

export const OversizePermitModal: React.FC<OversizePermitModalProps> = ({
  isOpen,
  onClose,
  currency = 'AZN',
  initialPlate = '99-JH-840',
}) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'corridors' | 'escort' | 'voucher' | 'registry'>('audit');

  // Input state
  const [selectedPresetId, setSelectedPresetId] = useState<string>(MOCK_CARGO_PRESETS[1].id); // CAT Excavator default
  const [widthM, setWidthM] = useState<number>(MOCK_CARGO_PRESETS[1].defaultWidthM);
  const [heightM, setHeightM] = useState<number>(MOCK_CARGO_PRESETS[1].defaultHeightM);
  const [lengthM, setLengthM] = useState<number>(MOCK_CARGO_PRESETS[1].defaultLengthM);
  const [rearOverhangM, setRearOverhangM] = useState<number>(MOCK_CARGO_PRESETS[1].defaultRearOverhangM);
  const [grossWeightT, setGrossWeightT] = useState<number>(MOCK_CARGO_PRESETS[1].defaultGrossWeightT);
  const [axleCount, setAxleCount] = useState<number>(MOCK_CARGO_PRESETS[1].defaultAxleCount);
  const [maxSingleAxleT, setMaxSingleAxleT] = useState<number>(MOCK_CARGO_PRESETS[1].defaultSingleAxleLoadT);
  const [isIntermodalContainer, setIsIntermodalContainer] = useState<boolean>(false);
  const [transitDistanceKm, setTransitDistanceKm] = useState<number>(180);

  // Vehicle and Carrier details
  const [vehiclePlate, setVehiclePlate] = useState<string>(initialPlate);
  const [trailerPlate, setTrailerPlate] = useState<string>('99-ZA-319');
  const [carrierVoen, setCarrierVoen] = useState<string>('1402948571');
  const [carrierNameAz, setCarrierNameAz] = useState<string>('"SilkWay Heavy Logistics" QSC');
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>(MOCK_HEAVY_CORRIDORS[0].id);

  // Voucher and Registry State
  const [activeVoucher, setActiveVoucher] = useState<OversizePermitVoucher>(MOCK_ACTIVE_PERMITS[0]);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Accessibility IDs
  const titleId = useId();
  const descId = useId();

  if (!isOpen) return null;

  // Selected corridor details
  const selectedCorridor = MOCK_HEAVY_CORRIDORS.find((c) => c.id === selectedCorridorId) || MOCK_HEAVY_CORRIDORS[0];

  // Perform live audit
  const auditResult = auditOversizeCompliance({
    widthMeters: widthM,
    heightMeters: heightM,
    lengthMeters: lengthM,
    rearOverhangMeters: rearOverhangM,
    grossWeightTonnes: grossWeightT,
    axleCount,
    maxSingleAxleWeightTonnes: maxSingleAxleT,
    transitDistanceKm,
    isContainerIntermodal: isIntermodalContainer,
  });

  // Handle Preset Switching
  const handleApplyPreset = (preset: CargoPreset) => {
    setSelectedPresetId(preset.id);
    setWidthM(preset.defaultWidthM);
    setHeightM(preset.defaultHeightM);
    setLengthM(preset.defaultLengthM);
    setRearOverhangM(preset.defaultRearOverhangM);
    setGrossWeightT(preset.defaultGrossWeightT);
    setAxleCount(preset.defaultAxleCount);
    setMaxSingleAxleT(preset.defaultSingleAxleLoadT);
    setIsIntermodalContainer(preset.isContainerIntermodal);
  };

  // Generate new voucher
  const handleIssuePermit = () => {
    const preset = MOCK_CARGO_PRESETS.find((p) => p.id === selectedPresetId);
    const newVoucher = generateOversizePermitVoucher({
      carrierVoen,
      carrierNameAz,
      vehiclePlate,
      trailerPlate,
      cargoCategory: preset ? preset.category : 'custom_cargo',
      cargoDescriptionAz: preset ? preset.titleAz : 'Fərdi İriqabaritli / Ağırçəkili Yük',
      routeCorridor: selectedCorridor.nameAz,
      transitDistanceKm,
      auditResult,
    });
    setActiveVoucher(newVoucher);
    setActiveTab('voucher');
  };

  const handleCopyCode = () => {
    if (activeVoucher) {
      navigator.clipboard?.writeText(activeVoucher.permitNumber);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter Registry
  const filteredRegistry = MOCK_ACTIVE_PERMITS.filter(
    (p) =>
      p.permitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.carrierNameAz.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-5xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-amber-600 via-amber-700 to-slate-800 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
              <Truck className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id={titleId} className="text-lg sm:text-xl font-bold tracking-tight">
                  AAYDA & BDYP İriqabaritli və Ağırçəkili Yük İcazəsi
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-amber-400 text-amber-950 rounded-full shadow-sm">
                  NK Qərar № 104
                </span>
              </div>
              <p id={descId} className="text-xs text-amber-100/90 font-medium">
                Azərbaycan Avtomobil Yolları Dövlət Agentliyi & Baş Dövlət Yol Polisi Rəsmi Elektron Marşrut Portalı
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Bağla"
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80 px-4 pt-2 gap-1 overflow-x-auto text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2.5 font-medium rounded-t-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'audit'
                ? 'bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400 border-t-2 border-amber-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Scale className="w-4 h-4" />
            Qabarit & Ox Yükü
          </button>
          <button
            onClick={() => setActiveTab('corridors')}
            className={`px-3.5 py-2.5 font-medium rounded-t-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'corridors'
                ? 'bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400 border-t-2 border-amber-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            Magistral & Körpülər
          </button>
          <button
            onClick={() => setActiveTab('escort')}
            className={`px-3.5 py-2.5 font-medium rounded-t-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'escort'
                ? 'bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400 border-t-2 border-amber-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Müşayiət (Pilot/DYP)
          </button>
          <button
            onClick={() => setActiveTab('voucher')}
            className={`px-3.5 py-2.5 font-medium rounded-t-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'voucher'
                ? 'bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400 border-t-2 border-amber-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            Xüsusi İcazə Sənədi
          </button>
          <button
            onClick={() => setActiveTab('registry')}
            className={`px-3.5 py-2.5 font-medium rounded-t-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'registry'
                ? 'bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400 border-t-2 border-amber-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Search className="w-4 h-4" />
            Vahid Reyestr
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-gray-800 dark:text-gray-200 text-sm">
          
          {/* TAB 1: AUDIT & PARAMETERS */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              
              {/* Presets Horizontal Bar */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Tipik Yük Şablonları (NK № 104 Standartları)
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {MOCK_CARGO_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      className={`px-3 py-2 rounded-xl border text-left text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                        selectedPresetId === preset.id
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-sm'
                          : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>{preset.titleAz}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid: Inputs (Left) and Live Audit Matrix (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Sliders & Controls */}
                <div className="lg:col-span-6 space-y-4 bg-gray-50 dark:bg-gray-800/60 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Scale className="w-4 h-4 text-amber-600" />
                      Nəqliyyat və Yük Parametrləri
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 font-mono">
                      YHQ Maddə 57
                    </span>
                  </div>

                  {/* Width */}
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span>Ümumi En (Standart limit: ≤ 2.55 m):</span>
                      <span className={`font-bold font-mono ${widthM > 2.55 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {widthM.toFixed(2)} m
                      </span>
                    </div>
                    <input
                      type="range"
                      min="2.00"
                      max="5.00"
                      step="0.05"
                      value={widthM}
                      onChange={(e) => setWidthM(parseFloat(e.target.value))}
                      className="w-full accent-amber-600"
                    />
                  </div>

                  {/* Height */}
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span>Hündürlük (Yol səthindən limit: ≤ 4.00 m):</span>
                      <span className={`font-bold font-mono ${heightM > 4.00 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {heightM.toFixed(2)} m
                      </span>
                    </div>
                    <input
                      type="range"
                      min="3.00"
                      max="5.20"
                      step="0.05"
                      value={heightM}
                      onChange={(e) => setHeightM(parseFloat(e.target.value))}
                      className="w-full accent-amber-600"
                    />
                  </div>

                  {/* Length */}
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span>Ümumi Uzunluq (Avtoqatar limiti: ≤ 20.00 m):</span>
                      <span className={`font-bold font-mono ${lengthM > 20.00 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {lengthM.toFixed(2)} m
                      </span>
                    </div>
                    <input
                      type="range"
                      min="12.00"
                      max="60.00"
                      step="0.5"
                      value={lengthM}
                      onChange={(e) => setLengthM(parseFloat(e.target.value))}
                      className="w-full accent-amber-600"
                    />
                  </div>

                  {/* Rear Overhang */}
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span>Arxa Qabarit Çıxıntısı (Limit: ≤ 2.00 m):</span>
                      <span className={`font-bold font-mono ${rearOverhangM > 2.00 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {rearOverhangM.toFixed(2)} m
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.00"
                      max="7.00"
                      step="0.1"
                      value={rearOverhangM}
                      onChange={(e) => setRearOverhangM(parseFloat(e.target.value))}
                      className="w-full accent-amber-600"
                    />
                  </div>

                  {/* Gross Weight */}
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span>Tam Kütlə (Limit: ≤ {isIntermodalContainer ? '44.0' : '40.0'} t):</span>
                      <span
                        className={`font-bold font-mono ${
                          grossWeightT > (isIntermodalContainer ? 44.0 : 40.0)
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {grossWeightT.toFixed(1)} ton
                      </span>
                    </div>
                    <input
                      type="range"
                      min="15.0"
                      max="120.0"
                      step="0.5"
                      value={grossWeightT}
                      onChange={(e) => setGrossWeightT(parseFloat(e.target.value))}
                      className="w-full accent-amber-600"
                    />
                  </div>

                  {/* Single Axle Load */}
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span>Tək Ox Yükü (Limit: ≤ 10.00 t):</span>
                      <span className={`font-bold font-mono ${maxSingleAxleT > 10.0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {maxSingleAxleT.toFixed(1)} ton
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5.0"
                      max="16.0"
                      step="0.2"
                      value={maxSingleAxleT}
                      onChange={(e) => setMaxSingleAxleT(parseFloat(e.target.value))}
                      className="w-full accent-amber-600"
                    />
                  </div>

                  {/* Intermodal container checkbox & distance */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-200 dark:border-gray-700 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isIntermodalContainer}
                        onChange={(e) => setIsIntermodalContainer(e.target.checked)}
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span>İntermodal ISO Konteyner (44t Güzəşti)</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <span>Məsafə:</span>
                      <input
                        type="number"
                        min="10"
                        max="800"
                        value={transitDistanceKm}
                        onChange={(e) => setTransitDistanceKm(Math.max(10, parseInt(e.target.value) || 10))}
                        className="w-16 px-2 py-1 rounded bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 font-mono text-center"
                      />
                      <span>km</span>
                    </div>
                  </div>
                </div>

                {/* Live Audit Evaluation Card */}
                <div className="lg:col-span-6 space-y-4">
                  {/* Status Banner */}
                  <div
                    className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                      auditResult.isCompliant
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                        : auditResult.escortRequirement === 'bdyp_police_escort'
                        ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                        : 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                    }`}
                  >
                    {auditResult.isCompliant ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : auditResult.escortRequirement === 'bdyp_police_escort' ? (
                      <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    ) : (
                      <Scale className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="font-bold text-sm sm:text-base">
                        {auditResult.isCompliant
                          ? 'Standart Qabarit və Çəki — İcazə Tələb Olunmur'
                          : auditResult.escortRequirement === 'bdyp_police_escort'
                          ? 'Super-Qabarit / Super-Ağır Yük — BDYP Müşayiəti Tələb Olunur'
                          : 'İriqabaritli / Ağırçəkili Yük — AAYDA Xüsusi İcazəsi Tələb Olunur'}
                      </h4>
                      <p className="text-xs opacity-90 mt-1">
                        {auditResult.isCompliant
                          ? 'Bütün parametrlər NK 104 saylı Qərarın normaları daxilindədir. Ümumi istifadədə olan avtomobil yollarında sərbəst hərəkətə icazə verilir.'
                          : `Parametrlərdə aşım qeydə alınmışdır. Reys başlamazdan əvvəl AAYDA-OVS elektron icazəsi rəsmiləşdirilməlidir.`}
                      </p>
                    </div>
                  </div>

                  {/* Breakdown Table */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden text-xs">
                    <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/80 font-semibold border-b border-gray-200 dark:border-gray-700 flex justify-between">
                      <span>Parametr</span>
                      <span>Faktiki / Norma</span>
                      <span>Aşım Faizi</span>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700/60 font-mono">
                      <div className="px-4 py-2 flex justify-between items-center">
                        <span className="font-sans font-medium text-gray-700 dark:text-gray-300">En (m):</span>
                        <span>{auditResult.dimensionAudit.width.value} / {auditResult.dimensionAudit.width.permissibleLimit} m</span>
                        <span className={auditResult.dimensionAudit.width.isExceeded ? 'text-amber-600 font-bold' : 'text-emerald-600'}>
                          {auditResult.dimensionAudit.width.isExceeded ? `+${auditResult.dimensionAudit.width.excessPercentage}%` : 'Norma'}
                        </span>
                      </div>
                      <div className="px-4 py-2 flex justify-between items-center">
                        <span className="font-sans font-medium text-gray-700 dark:text-gray-300">Hündürlük (m):</span>
                        <span>{auditResult.dimensionAudit.height.value} / {auditResult.dimensionAudit.height.permissibleLimit} m</span>
                        <span className={auditResult.dimensionAudit.height.isExceeded ? 'text-amber-600 font-bold' : 'text-emerald-600'}>
                          {auditResult.dimensionAudit.height.isExceeded ? `+${auditResult.dimensionAudit.height.excessPercentage}%` : 'Norma'}
                        </span>
                      </div>
                      <div className="px-4 py-2 flex justify-between items-center">
                        <span className="font-sans font-medium text-gray-700 dark:text-gray-300">Uzunluq (m):</span>
                        <span>{auditResult.dimensionAudit.length.value} / {auditResult.dimensionAudit.length.permissibleLimit} m</span>
                        <span className={auditResult.dimensionAudit.length.isExceeded ? 'text-amber-600 font-bold' : 'text-emerald-600'}>
                          {auditResult.dimensionAudit.length.isExceeded ? `+${auditResult.dimensionAudit.length.excessPercentage}%` : 'Norma'}
                        </span>
                      </div>
                      <div className="px-4 py-2 flex justify-between items-center">
                        <span className="font-sans font-medium text-gray-700 dark:text-gray-300">Ümumi Kütlə (t):</span>
                        <span>{auditResult.dimensionAudit.grossWeight.value} / {auditResult.dimensionAudit.grossWeight.permissibleLimit} t</span>
                        <span className={auditResult.dimensionAudit.grossWeight.isExceeded ? 'text-amber-600 font-bold' : 'text-emerald-600'}>
                          {auditResult.dimensionAudit.grossWeight.isExceeded ? `+${auditResult.dimensionAudit.grossWeight.excessPercentage}%` : 'Norma'}
                        </span>
                      </div>
                      <div className="px-4 py-2 flex justify-between items-center">
                        <span className="font-sans font-medium text-gray-700 dark:text-gray-300">Tək Ox Yükü (t):</span>
                        <span>{auditResult.dimensionAudit.axleLoad.value} / {auditResult.dimensionAudit.axleLoad.permissibleLimit} t</span>
                        <span className={auditResult.dimensionAudit.axleLoad.isExceeded ? 'text-amber-600 font-bold' : 'text-emerald-600'}>
                          {auditResult.dimensionAudit.axleLoad.isExceeded ? `+${auditResult.dimensionAudit.axleLoad.excessPercentage}%` : 'Norma'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Legal Fees Summary */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span>Dövlət Rüsumu (AR Qanunu Maddə 33):</span>
                      <span className="font-bold font-mono">
                        {convertCurrency(auditResult.fees.stateDutyAzn, currency)} {currency}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span>Yol Örtüyünə Dəyən Ziyan Kompensasiyası (AAYDA):</span>
                      <span className="font-bold font-mono">
                        {convertCurrency(auditResult.fees.roadWearCompensationAzn, currency)} {currency}
                      </span>
                    </div>
                    {auditResult.fees.pilotEscortFeeAzn > 0 && (
                      <div className="flex justify-between items-center text-xs text-amber-700 dark:text-amber-400">
                        <span>Mülki Müşayiət (Pilot) Xərci:</span>
                        <span className="font-bold font-mono">
                          {convertCurrency(auditResult.fees.pilotEscortFeeAzn, currency)} {currency}
                        </span>
                      </div>
                    )}
                    {auditResult.fees.policeEscortFeeAzn > 0 && (
                      <div className="flex justify-between items-center text-xs text-rose-700 dark:text-rose-400">
                        <span>BDYP Polis Müşayiəti Haqqı:</span>
                        <span className="font-bold font-mono">
                          {convertCurrency(auditResult.fees.policeEscortFeeAzn, currency)} {currency}
                        </span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-sm font-bold">
                      <span>Yekun İcazə və Rəsmiləşdirmə:</span>
                      <span className="text-amber-600 dark:text-amber-400 font-mono text-base">
                        {convertCurrency(auditResult.fees.totalFeeAzn, currency)} {currency}
                      </span>
                    </div>
                  </div>

                  {/* Unauthorized Fine Warning */}
                  {auditResult.needsSpecialPermit && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 text-xs flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="font-bold text-rose-800 dark:text-rose-300 block">
                          İcazəsiz Daşıma Cəriməsi (İXM 353):
                        </span>
                        <span className="text-rose-700 dark:text-rose-400">
                          Sürücü: {auditResult.finesIfUnauthorized.driverFineAzn} ₼ | Şirkət: {auditResult.finesIfUnauthorized.legalEntityFineAzn} ₼
                        </span>
                      </div>
                      <span className="px-2 py-1 bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100 rounded font-semibold text-[10px]">
                        DURACAQ RİSKİ
                      </span>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={handleIssuePermit}
                    className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <FileCheck2 className="w-4 h-4" />
                    Elektron Xüsusi İcazə Vərəqəsi Yarat (AAYDA-OVS)
                  </button>

                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CORRIDORS & BRIDGES */}
          {activeTab === 'corridors' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-amber-600" />
                    Azərbaycan Magistral Tranzit Dəhlizləri və Körpü Qabaritləri
                  </h3>
                  <p className="text-xs text-gray-500">
                    AAYDA körpü mühəndisliyi və avtomatlaşdırılmış elektron tərəzi (WIM) stansiyaları
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_HEAVY_CORRIDORS.map((corridor) => {
                  const isSelected = selectedCorridorId === corridor.id;
                  const isHeightWarning = heightM > corridor.maxBridgeClearanceMeters;
                  const isWeightWarning = grossWeightT > corridor.maxBridgeLoadTonnes;
                  const hasWarning = isHeightWarning || isWeightWarning;

                  return (
                    <div
                      key={corridor.id}
                      onClick={() => setSelectedCorridorId(corridor.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 ring-2 ring-amber-400/20 shadow-md'
                          : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-amber-400 font-mono font-bold text-xs">
                          {corridor.code}
                        </span>
                        <span className="text-xs font-semibold text-gray-500">{corridor.totalLengthKm} km</span>
                      </div>

                      <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2">
                        {corridor.nameAz}
                      </h4>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-3 bg-gray-50 dark:bg-gray-900/60 p-2.5 rounded-lg">
                        <div>
                          <span className="text-gray-500 block text-[11px]">Körpü Hündürlüyü:</span>
                          <span className={`font-bold ${isHeightWarning ? 'text-rose-600' : 'text-gray-900 dark:text-gray-200'}`}>
                            maks. {corridor.maxBridgeClearanceMeters} m
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[11px]">Körpü Yükü:</span>
                          <span className={`font-bold ${isWeightWarning ? 'text-rose-600' : 'text-gray-900 dark:text-gray-200'}`}>
                            maks. {corridor.maxBridgeLoadTonnes} ton
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[11px]">WIM Tərəziləri:</span>
                          <span>{corridor.wimCheckpointCount} məntəqə</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[11px]">Relyef Tipi:</span>
                          <span>{corridor.isMountainous ? 'Dağlıq (Məhdudiyyətli)' : 'Düzənlik Magistral'}</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {corridor.specialClearanceNotesAz}
                      </p>

                      {hasWarning && (
                        <div className="mt-3 p-2 bg-rose-50 dark:bg-rose-950/40 rounded-lg text-rose-700 dark:text-rose-300 text-xs flex items-center gap-1.5 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Seçilmiş yük parametrləri bu dəhlizin körpü hədlərini aşır!</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ESCORT & PILOT RULES */}
          {activeTab === 'escort' && (
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 rounded-xl border border-amber-200 dark:border-amber-900">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-7 h-7 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                      Tələb Olunan Müşayiət Rejimi: {
                        auditResult.escortRequirement === 'none'
                          ? 'Müşayiət Tələb Olunmur'
                          : auditResult.escortRequirement === 'pilot_single_rear'
                          ? '1 Mülki Pilot Avtomobili (Arxa Müşayiət)'
                          : auditResult.escortRequirement === 'pilot_double'
                          ? '2 Mülki Pilot Avtomobili (Ön və Arxa Müşayiət)'
                          : 'BDYP YPX Patrul Avtomobili (Rəsmi Polis Müşayiəti)'
                      }
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      Nazirlər Kabinetinin 104 nömrəli Qərarı və BDYP Təhlükəsizlik Reqlamenti
                    </p>
                  </div>
                </div>
              </div>

              {/* Tiers Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase text-gray-500">I Səviyyə: Standart</span>
                    <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 rounded font-semibold">Müşayiətsiz</span>
                  </div>
                  <h5 className="font-semibold text-sm">En ≤ 3.0m & Uzunluq ≤ 22m</h5>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Sürücü xüsusi narıncı qabarit işıqları və dönmə siqnalları ilə sərbəst hərəkət edir. Əlavə pilot avtomobilinə ehtiyac yoxdur.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase text-amber-600">II Səviyyə: Mülki Pilot</span>
                    <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 rounded font-semibold">1 və ya 2 Pilot</span>
                  </div>
                  <h5 className="font-semibold text-sm">En 3.0m – 4.0m və ya Uzunluq 22m – 30m</h5>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Damında sarı yanıb-sönən işıq mayakı, "GENİŞ QABARİT" tablosu və qabarit dirəyi olan akkreditə olunmuş mülki pilot avtomobilləri.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase text-rose-600">III Səviyyə: BDYP YPX</span>
                    <span className="text-xs px-2 py-0.5 bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 rounded font-semibold">Polis Eskortu</span>
                  </div>
                  <h5 className="font-semibold text-sm">En &gt; 4.0m, Uzunluq &gt; 30m və ya Çəki &gt; 60t</h5>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Qırmızı və mavi mayaklı rəsmi BDYP patrul avtomobili eskortu. Əks zolağın bağlanması və körpülərdən növbəli təhlükəsiz keçid təmin olunur.
                  </p>
                </div>
              </div>

              {/* Time Restrictions */}
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
                <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Hərəkət Zaman Rejimi & Pəncərəsi
                </h4>
                <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                  <p>• <strong>Gündüz Rejimi (06:00 – 22:00):</strong> Eni 3.0 metrdən çox olan iriqabaritli yüklərin hərəkəti yalnız yaxşı görünmə şəraitində və gündüz icazə verilir.</p>
                  <p>• <strong>Gecə Xüsusi Pəncərəsi (00:00 – 05:00):</strong> Eni 4.5 metrdən və ya kütləsi 80 tondan çox olan super-yüklərin Bakı və Sumqayıt magistrallarından keçidi yalnız gecə aşağı nəqliyyat sıxlığında mümkündür.</p>
                  <p>• <strong>Hava Şəraiti Məhdudiyyəti:</strong> Görünmə məsafəsi 100 metrdən az olan dumanlı və ya buzlaşmalı hava şəraitində iriqabaritli yüklərin hərəkəti qəti qadağandır.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VOUCHER / OFFICIAL PERMIT */}
          {activeTab === 'voucher' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-amber-600" />
                    Elektron Xüsusi Marşrut İcazəsi (AAYDA-OVS Elektron Sənədi)
                  </h3>
                  <p className="text-xs text-gray-500">
                    Azərbaycan Avtomobil Yolları Dövlət Agentliyi və DİN BDYP Rəsmi Reyestri
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-all flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {isCopied ? 'Kopyalandı!' : 'Kodu Kopyala'}
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Çap Et
                  </button>
                </div>
              </div>

              {/* Printable Voucher Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-b from-white to-amber-50/20 dark:from-gray-900 dark:to-gray-800 border-2 border-amber-600/30 shadow-xl space-y-5">
                
                {/* Voucher Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                      AZ
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 block">
                        RƏSMİ ELEKTRON İCAZƏ VƏRƏQƏSİ
                      </span>
                      <h4 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white">
                        {activeVoucher.permitNumber}
                      </h4>
                      <span className="text-xs text-gray-500">
                        NK № 104 Qərarına Əsasən Verilmişdir
                      </span>
                    </div>
                  </div>
                  <div className="text-right sm:text-right">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 rounded-full font-bold text-xs uppercase tracking-wider">
                      ● QÜVVƏDƏDİR
                    </span>
                    <p className="text-xs text-gray-500 mt-1 font-mono">
                      Etibarlıdır: {activeVoucher.validUntil}
                    </p>
                  </div>
                </div>

                {/* Voucher Data Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    <span className="text-gray-500 block text-[11px]">Daşıyıcı Şirkət:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{activeVoucher.carrierNameAz}</span>
                    <span className="text-[11px] text-gray-400 font-mono block">VÖEN: {activeVoucher.carrierVoen}</span>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    <span className="text-gray-500 block text-[11px]">Qoşqu və Dartıcı DQN:</span>
                    <span className="font-bold font-mono text-gray-900 dark:text-white">
                      {activeVoucher.vehiclePlate} / {activeVoucher.trailerPlate}
                    </span>
                    <span className="text-[11px] text-gray-400 block">Texpasport Uyğunluğu Təsdiqlənib</span>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    <span className="text-gray-500 block text-[11px]">Təsdiq Olunmuş Marşrut:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{activeVoucher.routeCorridor}</span>
                    <span className="text-[11px] text-gray-400 font-mono block">Məsafə: {activeVoucher.transitDistanceKm} km</span>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    <span className="text-gray-500 block text-[11px]">Daşınan Yük və Kateqoriya:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{activeVoucher.cargoDescriptionAz}</span>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    <span className="text-gray-500 block text-[11px]">Təsdiqlənmiş Qabaritlər:</span>
                    <span className="font-bold font-mono text-gray-900 dark:text-white">{activeVoucher.dimensionsSummary}</span>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    <span className="text-gray-500 block text-[11px]">Müşayiət Tələbi & Ödəniş:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {activeVoucher.escortType === 'bdyp_police_escort'
                        ? 'BDYP Polis Eskortu'
                        : activeVoucher.escortType === 'pilot_double'
                        ? '2 Pilot Avtomobili'
                        : 'Mülki Müşayiət'}
                    </span>
                    <span className="text-[11px] font-mono text-gray-500 block">
                      Rüsum: {convertCurrency(activeVoucher.totalFeeAzn, currency)} {currency}
                    </span>
                  </div>
                </div>

                {/* Voucher Footer Security */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500">
                  <div className="font-mono">
                    <span className="font-bold text-gray-700 dark:text-gray-300">Təhlükəsizlik İmzası: </span>
                    <span>{activeVoucher.securityHash}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>AAYDA Vahid Elektron Tranzit Bazasında Qeydiyyata Alındı</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: REGISTRY LOOKUP */}
          {activeTab === 'registry' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                    <Search className="w-5 h-5 text-amber-600" />
                    AAYDA İriqabaritli Nəqliyyat İcazələri Reyestri
                  </h3>
                  <p className="text-xs text-gray-500">
                    Dövlət nömrə nişanı və ya icazə nömrəsi üzrə rəsmi elektron yoxlama
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Qeydiyyat nişanı və ya nömrə..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Table of Permits */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden text-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 text-gray-500 font-semibold">
                      <tr>
                        <th className="px-4 py-3">İcazə Nömrəsi</th>
                        <th className="px-4 py-3">Daşıyıcı</th>
                        <th className="px-4 py-3">Qoşqu / DQN</th>
                        <th className="px-4 py-3">Marşrut</th>
                        <th className="px-4 py-3">Müşayiət</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 font-mono">
                      {filteredRegistry.map((permit) => (
                        <tr
                          key={permit.permitNumber}
                          onClick={() => {
                            setActiveVoucher(permit);
                            setActiveTab('voucher');
                          }}
                          className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20 cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-3 font-bold text-amber-600 dark:text-amber-400">
                            {permit.permitNumber}
                          </td>
                          <td className="px-4 py-3 font-sans font-medium text-gray-900 dark:text-white">
                            {permit.carrierNameAz}
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                            {permit.vehiclePlate} / {permit.trailerPlate}
                          </td>
                          <td className="px-4 py-3 font-sans text-gray-600 dark:text-gray-400">
                            {permit.routeCorridor}
                          </td>
                          <td className="px-4 py-3 font-sans text-xs">
                            <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-semibold">
                              {permit.escortType === 'bdyp_police_escort' ? 'BDYP Eskortu' : 'Pilot Avtomobil'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 text-[10px] font-bold">
                              AKTİV
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>AAYDA Elektron İcazə və Avtomatlaşdırılmış WIM Nəzarət Sistemi v4.2</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 font-semibold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl transition-all"
          >
            Bağla
          </button>
        </div>

      </div>
    </div>
  );
};

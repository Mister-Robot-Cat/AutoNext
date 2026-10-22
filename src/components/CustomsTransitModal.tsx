import React, { useState, useId } from 'react';
import {
  Globe2,
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Calculator,
  Printer,
  Copy,
  Check,
  Search,
  ArrowRight,
  User,
  Phone,
  X,
  Calendar,
  Lock,
  Compass,
  AlertCircle,
  Truck,
  Car,
  Fuel,
  Sparkles,
} from 'lucide-react';
import {
  ImporterStatus,
  TransitPurpose,
  ForeignVehicleCategory,
  ForeignFuelType,
  BorderCustomsPost,
  TemporaryImportPermit,
  TemporaryImportCalculationParams,
  calculateCustomsTransitAudit,
  calculateIxmLawSanction,
  generateTemporaryImportPermit,
  convertCurrency,
  filterPermits,
  filterCheckpoints,
} from '../utils/customsTransit';
import {
  MOCK_BORDER_CHECKPOINTS,
  MOCK_ACTIVE_PERMITS,
  SAMPLE_CALCULATION_PRESETS,
} from '../data/mockCustomsTransitData';

interface CustomsTransitModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVehicle?: {
    makeModel?: string;
    engineCc?: number;
    year?: number;
    vin?: string;
    valueAzn?: number;
  };
}

export const CustomsTransitModal: React.FC<CustomsTransitModalProps> = ({
  isOpen,
  onClose,
  initialVehicle,
}) => {
  const [activeTab, setActiveTab] = useState<
    'calculator' | 'regime_90d' | 'checkpoints' | 'registry' | 'permit_view'
  >('calculator');

  // Calculation parameters
  const [params, setParams] = useState<TemporaryImportCalculationParams>({
    importerStatus: 'non_resident',
    vehicleCategory: 'passenger_car',
    engineCc: initialVehicle?.engineCc || 2487,
    manufactureYear: initialVehicle?.year || 2021,
    fuelType: 'hybrid',
    vehicleValueAzn: initialVehicle?.valueAzn || 38000,
    stayDurationDays: 90,
    purpose: 'tourism_personal',
    hasElectronicGpsLock: false,
  });

  const [selectedCurrency, setSelectedCurrency] = useState<'AZN' | 'USD' | 'EUR'>('AZN');
  const [regimeSliderDays, setRegimeSliderDays] = useState<number>(90);

  // Checkpoints tab states
  const [checkpointCountryFilter, setCheckpointCountryFilter] = useState<string>('all');
  const [checkpointSearch, setCheckpointSearch] = useState<string>('');
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<BorderCustomsPost>(
    MOCK_BORDER_CHECKPOINTS[0]
  );

  // Registry tab states
  const [permitSearchQuery, setPermitSearchQuery] = useState<string>('');
  const [allPermits, setAllPermits] = useState<TemporaryImportPermit[]>(MOCK_ACTIVE_PERMITS);

  // Permit Generator / View state
  const [activePermit, setActivePermit] = useState<TemporaryImportPermit>(MOCK_ACTIVE_PERMITS[0]);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Form fields for permit creation
  const [formImporterName, setFormImporterName] = useState<string>('Giorgi Beridze');
  const [formPassport, setFormPassport] = useState<string>('P№ 11BA89201');
  const [formNationality, setFormNationality] = useState<string>('Gürcüstan');
  const [formMakeModel, setFormMakeModel] = useState<string>(
    initialVehicle?.makeModel || 'Toyota Camry Hybrid'
  );
  const [formOriginCountry, setFormOriginCountry] = useState<string>('GE');
  const [formForeignPlate, setFormForeignPlate] = useState<string>('GE · AA-452-BB');
  const [formVin, setFormVin] = useState<string>(
    initialVehicle?.vin || '4T1B11HK5LU829104'
  );

  // Generate unique IDs for accessibility
  const idPrefix = useId();

  if (!isOpen) return null;

  const currentAudit = calculateCustomsTransitAudit(params);
  const simulatedRegimeSanction = calculateIxmLawSanction(
    Math.max(0, regimeSliderDays - 90),
    params.vehicleValueAzn
  );

  const filteredCheckpoints = filterCheckpoints(
    MOCK_BORDER_CHECKPOINTS,
    checkpointCountryFilter,
    checkpointSearch
  );

  const filteredPermitsList = filterPermits(allPermits, permitSearchQuery);

  const handleApplyPreset = (presetParams: TemporaryImportCalculationParams) => {
    setParams(presetParams);
    setRegimeSliderDays(presetParams.stayDurationDays);
  };

  const handleGenerateAndOpenPermit = () => {
    const newPermit = generateTemporaryImportPermit(
      params,
      formImporterName,
      formPassport,
      formNationality,
      formMakeModel,
      formOriginCountry,
      formForeignPlate,
      formVin,
      selectedCheckpoint
    );
    setAllPermits((prev) => [newPermit, ...prev]);
    setActivePermit(newPermit);
    setActiveTab('permit_view');
  };

  const handleCopyPermitDetails = () => {
    const textToCopy = `Dövlət Gömrük Komitəsi (DGK) Müvəqqəti İdxal İcazəsi\nİcazə Nömrəsi: ${activePermit.permitNumber}\nNəqliyyat: ${activePermit.vehicleMakeModel} (${activePermit.foreignPlateNumber})\nVIN: ${activePermit.vin}\nSürücü: ${activePermit.importerName} (${activePermit.importerNationality})\nGiriş Postu: ${activePermit.entryCheckpointNameAz}\nGiriş Tarixi: ${activePermit.entryDate}\nSon Çıxış Tarixi: ${activePermit.permittedDeadlineDate}\nStatus: ${activePermit.complianceStatus}\nGömrük Təminatı: ${activePermit.refundableDepositHeldAzn} AZN\nTəhlükəsizlik Kodu: ${activePermit.qrSecurityHash}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatMoney = (valAzn: number) => {
    const converted = convertCurrency(valAzn, selectedCurrency);
    if (selectedCurrency === 'AZN') {
      return `${converted.toLocaleString('az-AZ')} ₼`;
    }
    if (selectedCurrency === 'USD') {
      return `$${converted.toLocaleString('en-US')}`;
    }
    return `€${converted.toLocaleString('de-DE')}`;
  };

  return (
    <div
      data-testid="customs-transit-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${idPrefix}-modal-title`}
    >
      <div className="relative w-full max-w-5xl bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-b border-emerald-500/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-inner">
              <Globe2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  DGK & BDYP RƏSMİ PORTAL
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  Gömrük Məcəlləsi Maddə 258/259
                </span>
              </div>
              <h2
                id={`${idPrefix}-modal-title`}
                className="text-lg sm:text-xl font-bold text-white flex items-center gap-2"
              >
                Xarici Qeydiyyatlı Nəqliyyat Vasitələrinin Müvəqqəti İdxal & Tranzit Portalı
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Currency Switcher */}
            <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700 text-xs">
              {(['AZN', 'USD', 'EUR'] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setSelectedCurrency(curr)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    selectedCurrency === curr
                      ? 'bg-emerald-500 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              data-testid="close-modal-btn"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              aria-label="Bağla"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 bg-slate-900/90 border-b border-slate-800 flex overflow-x-auto gap-2 py-2.5 text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('calculator')}
            data-testid="tab-calculator-btn"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span>İdxal & Depozit Hesablayıcı</span>
          </button>

          <button
            onClick={() => setActiveTab('regime_90d')}
            data-testid="tab-regime-btn"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'regime_90d'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>90 Günlük Rejim & Cərimələr</span>
          </button>

          <button
            onClick={() => setActiveTab('checkpoints')}
            data-testid="tab-checkpoints-btn"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'checkpoints'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <MapPin className="w-4 h-4 text-teal-400" />
            <span>Sərhəd Gömrük Postları Radarı</span>
          </button>

          <button
            onClick={() => setActiveTab('registry')}
            data-testid="tab-registry-btn"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'registry'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Search className="w-4 h-4 text-blue-400" />
            <span>Aktiv Reyestr ({allPermits.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('permit_view')}
            data-testid="tab-permit-btn"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'permit_view'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4 text-purple-400" />
            <span>DGK Elektron İcazə Vərəqəsi</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* TAB 1: CALCULATOR & DEPOSIT */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              {/* Presets Row */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Sürətli Praktiki Nümunələr (Presets)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {SAMPLE_CALCULATION_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleApplyPreset(p.params)}
                      data-testid={`preset-btn-${idx}`}
                      className="p-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-left transition-all group"
                    >
                      <div className="text-xs font-bold text-white group-hover:text-emerald-300 flex items-center justify-between">
                        <span>{p.labelAz}</span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {p.descriptionAz}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculator Form & Live Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Controls */}
                <div className="lg:col-span-7 space-y-4 bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 sm:p-5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Car className="w-4 h-4 text-emerald-400" />
                    İdxalçı & Nəqliyyat Vasitəsinin Parametrləri
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Importer Status */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        İdxalçının Hüquqi Statusu
                      </label>
                      <select
                        value={params.importerStatus}
                        onChange={(e) =>
                          setParams({ ...params, importerStatus: e.target.value as ImporterStatus })
                        }
                        data-testid="importer-status-select"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="non_resident">Xarici Vətəndaş / Qeyri-Rezident (Depozitsiz)</option>
                        <option value="resident">Azərbaycan Vətəndaşı / Rezident (Gömrük Təminatı)</option>
                      </select>
                    </div>

                    {/* Vehicle Category */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Nəqliyyat Vasitəsinin Kateqoriyası
                      </label>
                      <select
                        value={params.vehicleCategory}
                        onChange={(e) =>
                          setParams({
                            ...params,
                            vehicleCategory: e.target.value as ForeignVehicleCategory,
                          })
                        }
                        data-testid="vehicle-category-select"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="passenger_car">Minik Avtomobili (Sedan/Hatchback)</option>
                        <option value="suv_4x4">Krossover / SUV / 4x4</option>
                        <option value="motorcycle">Motosikl / Kvadrosikl</option>
                        <option value="minibus">Mikroavtobus (8+1 yer)</option>
                        <option value="commercial_truck">Yük Avtomobili / TIR</option>
                      </select>
                    </div>

                    {/* Engine CC */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Mühərrik Həcmi (sm³)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="16000"
                        step="100"
                        value={params.engineCc}
                        onChange={(e) =>
                          setParams({ ...params, engineCc: Number(e.target.value) || 0 })
                        }
                        data-testid="engine-cc-input"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Fuel Type */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Yanacaq Növü
                      </label>
                      <select
                        value={params.fuelType}
                        onChange={(e) =>
                          setParams({ ...params, fuelType: e.target.value as ForeignFuelType })
                        }
                        data-testid="fuel-type-select"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="petrol">Benzin (Aİ-92 / Aİ-95)</option>
                        <option value="diesel">Dizel</option>
                        <option value="hybrid">Hibrid (HEV / PHEV)</option>
                        <option value="electric">Elektromobil (EV - Aksizsiz)</option>
                      </select>
                    </div>

                    {/* Manufacture Year */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        İstehsal İli
                      </label>
                      <input
                        type="number"
                        min="1995"
                        max="2026"
                        value={params.manufactureYear}
                        onChange={(e) =>
                          setParams({ ...params, manufactureYear: Number(e.target.value) || 2021 })
                        }
                        data-testid="manufacture-year-input"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Vehicle Customs Value */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Gömrük Dəyəri (AZN)
                      </label>
                      <input
                        type="number"
                        min="1000"
                        max="500000"
                        step="1000"
                        value={params.vehicleValueAzn}
                        onChange={(e) =>
                          setParams({ ...params, vehicleValueAzn: Number(e.target.value) || 10000 })
                        }
                        data-testid="vehicle-value-input"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Stay Duration Slider */}
                  <div className="pt-2 border-t border-slate-700/60">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-medium text-slate-300">
                        Ölkədə Planlaşdırılan Qalma Müddəti (Gün)
                      </label>
                      <span className="text-sm font-bold text-emerald-400">
                        {params.stayDurationDays} gün {params.stayDurationDays <= 3 ? '(Tranzit)' : ''}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="90"
                      value={params.stayDurationDays}
                      onChange={(e) =>
                        setParams({ ...params, stayDurationDays: Number(e.target.value) })
                      }
                      data-testid="stay-duration-slider"
                      className="w-full accent-emerald-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>1 gün (Sürətli Giriş)</span>
                      <span>3 gün (Tranzit Dəhliz)</span>
                      <span>30 gün</span>
                      <span>60 gün</span>
                      <span>90 gün (Maksimum Hədd)</span>
                    </div>
                  </div>

                  {/* GPS Tracking E-Seal Checkbox */}
                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={params.hasElectronicGpsLock}
                        onChange={(e) =>
                          setParams({ ...params, hasElectronicGpsLock: e.target.checked })
                        }
                        className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span>
                        DGK Elektron GPS Plomb Kilidi (Tranzit yük dəhlizləri üçün +20 AZN)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Live Audit Results Card */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                      <div>
                        <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                          Gömrük Sərhəd Hesabatı
                        </div>
                        <div className="text-sm font-bold text-white">
                          Ödəniləcək Rüsumlar & Təminat
                        </div>
                      </div>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                          currentAudit.complianceStatus === 'compliant'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {currentAudit.statusLabelAz}
                      </span>
                    </div>

                    {/* Itemized Financials */}
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <Fuel className="w-3.5 h-3.5 text-slate-400" />
                          Yol Vergisi (Vergi Məcəlləsi 209-211):
                        </span>
                        <span className="font-semibold text-white">
                          {formatMoney(currentAudit.roadTaxAzn)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          Gömrük Rəsmiləşdirməsi Dövlət Rüsumu:
                        </span>
                        <span className="font-semibold text-white">
                          {formatMoney(currentAudit.customsProcessingFeeAzn)}
                        </span>
                      </div>

                      {currentAudit.gpsEsealFeeAzn > 0 && (
                        <div className="flex justify-between items-center text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-teal-400" />
                            Elektron GPS Plomb Rəsmləşməsi:
                          </span>
                          <span className="font-semibold text-white">
                            {formatMoney(currentAudit.gpsEsealFeeAzn)}
                          </span>
                        </div>
                      )}

                      {/* Refundable Guarantee Deposit */}
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 mt-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-emerald-400" />
                              Gömrük Təminatı / Depozit:
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {currentAudit.isDepositRequired
                                ? '100% Geri Qaytarılan Təminat'
                                : 'Qeyri-rezident azadolması (0 AZN)'}
                            </div>
                          </div>
                          <div
                            className={`text-sm font-bold ${
                              currentAudit.isDepositRequired ? 'text-amber-400' : 'text-emerald-400'
                            }`}
                          >
                            {formatMoney(currentAudit.refundableGuaranteeDepositAzn)}
                          </div>
                        </div>
                      </div>

                      {/* Total Border Payable */}
                      <div className="pt-3 border-t border-slate-700 flex justify-between items-center">
                        <div>
                          <div className="text-xs text-slate-400">Sərhəddə Cəmi Ödəniş:</div>
                          <div className="text-[10px] text-slate-500">
                            (Rüsumlar + Təminat depoziti)
                          </div>
                        </div>
                        <div className="text-lg font-extrabold text-emerald-300">
                          {formatMoney(currentAudit.totalPayableAtBorderAzn)}
                        </div>
                      </div>
                    </div>

                    {/* Notice Box */}
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-200 leading-relaxed">
                      {currentAudit.depositReasonAz}
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => {
                        setFormMakeModel(
                          params.vehicleCategory === 'suv_4x4'
                            ? 'BMW X5 xDrive40i'
                            : 'Toyota Camry 2.5 Hybrid'
                        );
                        setActiveTab('permit_view');
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      Elektron Bəyannamə Hazırla
                    </button>
                  </div>
                </div>
              </div>

              {/* Required Documents Checklist */}
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 sm:p-5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Sərhəd Buraxılışında Tələb Olunan Rəsmi Sənədlər
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  {currentAudit.requiredDocumentsAz.map((doc, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800"
                    >
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 90-DAY REGIME & SANCTIONS RADAR */}
          {activeTab === 'regime_90d' && (
            <div className="space-y-6">
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Clock className="w-5 h-5 text-amber-400" />
                      Gömrük Məcəlləsi 258 & İXM 499 Cərimə Simulyatoru
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Faktiki ölkədə qalma müddətini dəyişərək hüquqi riskləri və cərimə məbləğlərini yoxlayın.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Simulyasiya Müddəti: </span>
                    <span className="text-base font-extrabold text-amber-400">
                      {regimeSliderDays} gün
                    </span>
                  </div>
                </div>

                {/* Slider */}
                <div className="space-y-2">
                  <input
                    type="range"
                    min="1"
                    max="180"
                    value={regimeSliderDays}
                    onChange={(e) => setRegimeSliderDays(Number(e.target.value))}
                    data-testid="regime-slider"
                    className="w-full accent-amber-500 h-2.5 bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span className="text-emerald-400 font-medium">1 gün</span>
                    <span className="text-emerald-400 font-medium">90 gün (Qanuni Limit)</span>
                    <span className="text-amber-400 font-medium">120 gün (+30 gün)</span>
                    <span className="text-orange-400 font-medium">180 gün (+90 gün)</span>
                  </div>
                </div>

                {/* Stage Indicator Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Stage 1: 0-75 days */}
                  <div
                    className={`p-3.5 rounded-xl border transition-all ${
                      regimeSliderDays <= 75
                        ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-lg'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1.5 mb-1 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      1 - 75 Gün
                    </div>
                    <div className="text-[11px] font-semibold">Qanuni Müvəqqəti İdxal</div>
                    <div className="text-[10px] mt-1 text-slate-400">
                      Heç bir cərimə və ya sanksiya tətbiq edilmir.
                    </div>
                  </div>

                  {/* Stage 2: 76-90 days */}
                  <div
                    className={`p-3.5 rounded-xl border transition-all ${
                      regimeSliderDays > 75 && regimeSliderDays <= 90
                        ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1.5 mb-1 text-amber-400">
                      <Clock className="w-4 h-4" />
                      76 - 90 Gün
                    </div>
                    <div className="text-[11px] font-semibold">Müddət Xəbərdarlığı</div>
                    <div className="text-[10px] mt-1 text-slate-400">
                      İcazənin bitməsinə az qalır. Ölkədən çıxış planlaşdırılmalıdır.
                    </div>
                  </div>

                  {/* Stage 3: 91-120 days */}
                  <div
                    className={`p-3.5 rounded-xl border transition-all ${
                      regimeSliderDays > 90 && regimeSliderDays <= 120
                        ? 'bg-orange-500/20 border-orange-500 text-white shadow-lg'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1.5 mb-1 text-orange-400">
                      <AlertTriangle className="w-4 h-4" />
                      İXM Maddə 499.1
                    </div>
                    <div className="text-[11px] font-semibold">100 AZN Cərimə</div>
                    <div className="text-[10px] mt-1 text-slate-400">
                      Müddətin 30 günədək gecikdirilməsi üzrə inzibati cərimə.
                    </div>
                  </div>

                  {/* Stage 4: >120 days */}
                  <div
                    className={`p-3.5 rounded-xl border transition-all ${
                      regimeSliderDays > 120
                        ? 'bg-red-500/20 border-red-500 text-white shadow-lg'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1.5 mb-1 text-red-400">
                      <AlertCircle className="w-4 h-4" />
                      İXM Maddə 499.2 / 499.3
                    </div>
                    <div className="text-[11px] font-semibold">300 AZN və ya Müsadirə</div>
                    <div className="text-[10px] mt-1 text-slate-400">
                      {regimeSliderDays <= 180 ? '300 AZN cərimə' : '50-100% dəyər və ya Müsadirə!'}
                    </div>
                  </div>
                </div>

                {/* Simulated Sanction Details Panel */}
                <div
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    simulatedRegimeSanction.status === 'compliant'
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : simulatedRegimeSanction.status === 'penalty_tier_1'
                      ? 'bg-orange-500/10 border-orange-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900/80 text-white">
                        {simulatedRegimeSanction.article}
                      </span>
                      <span className="text-sm font-bold text-white">
                        {simulatedRegimeSanction.statusLabelAz}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 max-w-xl">
                      {simulatedRegimeSanction.descriptionAz}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[11px] text-slate-400">İnzibati Cərimə Məbləği:</div>
                    <div
                      className={`text-xl font-extrabold ${
                        simulatedRegimeSanction.fineAzn === 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {formatMoney(simulatedRegimeSanction.fineAzn)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Legal Reference & Automated BDYP Radar Notice */}
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 sm:p-5 text-xs text-slate-300 space-y-2">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  BDYP & DGK İnteqrasiya Edilmiş ANPR Kamera Nəzarəti
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  Azərbaycan Respublikası ərazisinə müvəqqəti idxal edilmiş xarici dövlət qeydiyyat
                  nişanlı bütün nəqliyyat vasitələri BDYP-nin “Təhlükəsiz Şəhər” və Dövlət Gömrük
                  Komitəsinin vahid elektron bazasına inteqrasiya olunur. 90 günlük rejim başa çatdıqda
                  yol kameraları avtomatik rejimdə avtomobili aşkarlayaraq cərimə protokolu tərtib edir
                  və ya ən yaxın YPX postuna saxlanılma siqnalı göndərir.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: BORDER CHECKPOINTS RADAR */}
          {activeTab === 'checkpoints' && (
            <div className="space-y-4">
              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
                  {[
                    { id: 'all', label: 'Bütün Sərhədlər' },
                    { id: 'georgia', label: '🇬🇪 Gürcüstan' },
                    { id: 'russia', label: '🇷🇺 Rusiya' },
                    { id: 'iran', label: '🇮🇷 İran' },
                    { id: 'caspian_transit', label: '🚢 Xəzər Ro-Ro' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setCheckpointCountryFilter(f.id)}
                      className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                        checkpointCountryFilter === f.id
                          ? 'bg-teal-500 text-white shadow'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={checkpointSearch}
                    onChange={(e) => setCheckpointSearch(e.target.value)}
                    placeholder="Gömrük postu axtar..."
                    data-testid="checkpoint-search-input"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Checkpoints Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCheckpoints.map((cp) => (
                  <div
                    key={cp.id}
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      selectedCheckpoint.id === cp.id
                        ? 'bg-teal-950/40 border-teal-500 shadow-lg'
                        : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <span>{cp.countryFlag}</span>
                          <span>{cp.countryNameAz}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-0.5">{cp.nameAz}</h4>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        {cp.operatingHours}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{cp.regionAz}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span className="truncate">{cp.corridorNameAz}</span>
                      </div>
                    </div>

                    {/* Telemetry Stats */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400">Bakıdan</div>
                        <div className="font-bold text-white">{cp.distanceFromBakuKm} km</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Gözləmə</div>
                        <div className="font-bold text-teal-400">~{cp.averageWaitMinutes} dəq</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Canlı Növbə</div>
                        <div className="font-bold text-amber-400">{cp.currentQueueCount} maşın</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>{cp.contactPhone}</span>
                      </div>
                      <button
                        onClick={() => setSelectedCheckpoint(cp)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          selectedCheckpoint.id === cp.id
                            ? 'bg-teal-500 text-white'
                            : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                        }`}
                      >
                        {selectedCheckpoint.id === cp.id ? 'Seçildi' : 'Seç'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ACTIVE REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={permitSearchQuery}
                    onChange={(e) => setPermitSearchQuery(e.target.value)}
                    placeholder="Qeydiyyat nişanı, VIN, Sürücü və ya İcazə № ilə axtar..."
                    data-testid="permit-search-input"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="text-xs text-slate-400">
                  Tapıldı: <span className="font-bold text-white">{filteredPermitsList.length}</span>{' '}
                  icazə
                </div>
              </div>

              {/* Permits Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPermitsList.map((permit) => (
                  <div
                    key={permit.id}
                    className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-blue-500/40 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      {/* Foreign Plate Visualizer */}
                      <div className="inline-flex items-center bg-slate-900 border-2 border-slate-700 rounded-lg px-2.5 py-1 shadow-inner font-mono font-bold tracking-wider text-xs">
                        <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px] mr-2">
                          {permit.originCountryCode}
                        </span>
                        <span className="text-white">{permit.foreignPlateNumber}</span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          permit.complianceStatus === 'compliant'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : permit.complianceStatus === 'expiring_soon'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-red-500/20 text-red-300 border-red-500/30'
                        }`}
                      >
                        {permit.isOverdue
                          ? `Vaxtı Keçib (${permit.daysRemaining} gün)`
                          : `${permit.daysRemaining} gün qalır`}
                      </span>
                    </div>

                    <div>
                      <div className="text-sm font-bold text-white">{permit.vehicleMakeModel}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>VIN: {permit.vin}</span>
                        <span>•</span>
                        <span>{permit.engineCc} sm³</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">İdxalçı:</span>
                        <span className="font-medium text-white">
                          {permit.importerName} ({permit.importerNationality})
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">Sərhəd Gömrük Postu:</span>
                        <span className="text-teal-400">{permit.entryCheckpointNameAz}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">Giriş / Son Çıxış:</span>
                        <span>
                          {permit.entryDate} → {permit.permittedDeadlineDate}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800">
                        <span className="text-slate-400">Gömrük Təminatı (Depozit):</span>
                        <span
                          className={`font-bold ${
                            permit.refundableDepositHeldAzn > 0
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {permit.refundableDepositHeldAzn > 0
                            ? formatMoney(permit.refundableDepositHeldAzn)
                            : 'Azad olunub (0 ₼)'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-mono text-slate-500">
                        {permit.permitNumber}
                      </span>
                      <button
                        onClick={() => {
                          setActivePermit(permit);
                          setActiveTab('permit_view');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Sənədə Bax</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: OFFICIAL DGK ELECTRONIC PERMIT VIEW */}
          {activeTab === 'permit_view' && (
            <div className="space-y-6">
              {/* Top Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/40 p-3 rounded-2xl border border-slate-700/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Seçilmiş İcazə:</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {activePermit.permitNumber}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyPermitDetails}
                    data-testid="copy-permit-btn"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium transition-all"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Kopyalandı!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-300" />
                        <span>Kopyala</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handlePrint}
                    data-testid="print-permit-btn"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-all shadow"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Çap Et</span>
                  </button>
                </div>
              </div>

              {/* Official Electronic Certificate Card */}
              <div
                id="dgk-permit-certificate"
                className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-emerald-700 space-y-6 max-w-3xl mx-auto"
              >
                {/* Header with National Coat of Arms & DGK */}
                <div className="border-b-2 border-emerald-800/30 pb-4 text-center space-y-1">
                  <div className="text-xs font-extrabold tracking-widest text-emerald-900 uppercase">
                    AZƏRBAYCAN RESPUBLİKASI DÖVLƏT GÖMRÜK KOMİTƏSİ
                  </div>
                  <div className="text-base sm:text-lg font-black text-slate-950 uppercase">
                    XARİCİ QEYDİYYATLI NƏQLİYYAT VASİTƏSİNİN MÜVƏQQƏTİ İDXAL İCAZƏSİ
                  </div>
                  <div className="text-xs text-slate-600">
                    Gömrük Məcəlləsinin 258-ci və 259-cu maddələrinə uyğun olaraq tərtib edilmişdir
                  </div>
                  <div className="pt-1">
                    <span className="inline-block px-3 py-1 rounded bg-emerald-100 text-emerald-900 font-mono font-bold text-xs tracking-wider border border-emerald-300">
                      {activePermit.permitNumber}
                    </span>
                  </div>
                </div>

                {/* Main Information Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Importer Details */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="font-bold text-emerald-900 uppercase text-[10px] tracking-wider">
                      İDXALÇI / SÜRÜCÜ MƏLUMATLARI
                    </div>
                    <div>
                      <span className="text-slate-500">Ad, Soyad: </span>
                      <span className="font-bold text-slate-900">{activePermit.importerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Vətəndaşlıq: </span>
                      <span className="font-semibold text-slate-900">
                        {activePermit.importerNationality}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Sənəd / FİN: </span>
                      <span className="font-mono text-slate-900">
                        {activePermit.importerPassportOrFin}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Hüquqi Status: </span>
                      <span className="font-semibold text-slate-900">
                        {activePermit.importerStatus === 'non_resident'
                          ? 'Qeyri-Rezident (Xarici Vətəndaş)'
                          : 'Azərbaycan Rezidenti'}
                      </span>
                    </div>
                  </div>

                  {/* Vehicle Details */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="font-bold text-emerald-900 uppercase text-[10px] tracking-wider">
                      NƏQLİYYAT VASİTƏSİ
                    </div>
                    <div>
                      <span className="text-slate-500">Marka / Model: </span>
                      <span className="font-bold text-slate-900">
                        {activePermit.vehicleMakeModel}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">VIN Kod: </span>
                      <span className="font-mono font-bold text-slate-900">{activePermit.vin}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Mühərrik / Yanacaq: </span>
                      <span className="text-slate-900">
                        {activePermit.engineCc} sm³ ({activePermit.fuelType})
                      </span>
                    </div>
                    {/* Foreign Plate View */}
                    <div className="pt-1 flex items-center gap-2">
                      <span className="text-slate-500">Qeydiyyat Nişanı: </span>
                      <span className="inline-flex items-center bg-slate-900 text-white font-mono px-2 py-0.5 rounded border border-slate-800 font-bold text-xs">
                        <span className="bg-blue-600 text-white px-1 text-[9px] rounded mr-1.5">
                          {activePermit.originCountryCode}
                        </span>
                        {activePermit.foreignPlateNumber}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Regime & Dates Box */}
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-[10px] text-slate-500 font-medium">Gömrük Sərhəd Postu</div>
                    <div className="font-bold text-emerald-950 mt-0.5">
                      {activePermit.entryCheckpointNameAz}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-medium">Giriş Tarixi</div>
                    <div className="font-bold text-slate-900 mt-0.5">{activePermit.entryDate}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-medium">Son İcazə Verilən Çıxış</div>
                    <div className="font-bold text-red-700 mt-0.5">
                      {activePermit.permittedDeadlineDate}
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                    <span className="text-slate-600">Ödənilmiş Yol Vergisi & Rüsum:</span>
                    <span className="font-bold text-slate-950">
                      {activePermit.roadTaxPaidAzn} AZN
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                    <span className="text-slate-600">Gömrük Təminatı (Depozit):</span>
                    <span
                      className={`font-bold ${
                        activePermit.refundableDepositHeldAzn > 0
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {activePermit.refundableDepositHeldAzn > 0
                        ? `${activePermit.refundableDepositHeldAzn} AZN`
                        : '0 AZN (Azad Olunub)'}
                    </span>
                  </div>
                </div>

                {/* QR Code & Security Stamp Footer */}
                <div className="pt-4 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-slate-900 text-white rounded-lg flex items-center justify-center font-mono text-[9px] text-center p-1 font-bold leading-tight border border-slate-700">
                      [DGK-QR VERIFIED]
                    </div>
                    <div className="text-[10px] text-slate-500 space-y-0.5">
                      <div>Rəqəmsal Doğrulama Kodu:</div>
                      <div className="font-mono text-slate-800 truncate max-w-xs">
                        {activePermit.qrSecurityHash}
                      </div>
                      <div>Rəsmiləşdirən İnspektor: {activePermit.customsOfficerId}</div>
                    </div>
                  </div>

                  <div className="text-center sm:text-right">
                    <div className="text-[10px] font-bold text-emerald-900">
                      DÖVLƏT GÖMRÜK KOMİTƏSİ
                    </div>
                    <div className="text-[9px] text-slate-500">
                      Vahid Avtomatlaşdırılmış İdarəetmə Sistemi (VAİS)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Status Bar */}
        <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>DGK VAİS & BDYP Mərkəzi Serveri: Onlayn və Fəal</span>
          </div>
          <div className="text-slate-500">
            AR Gömrük Məcəlləsi (Maddə 258) • İXM Maddə 499 • 2026 Dövlət Standartı
          </div>
        </div>
      </div>
    </div>
  );
};

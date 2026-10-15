import React, { useState, useMemo } from 'react';
import {
  Car,
  ShieldCheck,
  ShieldAlert,
  Calculator,
  FileCheck,
  Building2,
  Clock,
  Printer,
  Copy,
  Check,
  X,
  AlertTriangle,
  Sparkles,
  Phone,
  Fuel,
  Info,
  Calendar,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Zap,
  MapPin,
  ExternalLink,
  CheckCircle2,
  Sliders,
  Award
} from 'lucide-react';
import { Vehicle, Currency, Language } from '../types/vehicle';
import {
  TaxiEligibilityStatus,
  TaxiColor,
  TaxiFuelType,
  TaxiEquipmentKey,
  RideHailingPlatformKey,
  AynaTaxiPass,
  TrainingBooking
} from '../types/taxi';
import {
  CURRENT_REFERENCE_YEAR,
  MAX_NEW_TAXI_AGE_YEARS,
  STATUTORY_FEES,
  RETROFIT_COSTS,
  RIDE_HAILING_PLATFORMS,
  DEFAULT_EQUIPMENT_CATALOG,
  evaluateTaxiCompliance,
  calculateAggregatorProfit,
  createAynaTaxiPass,
  createTrainingBooking,
  convertFromAzn
} from '../utils/taxiCompliance';
import {
  MOCK_AYNA_CENTERS,
  MOCK_TAXI_PASSES,
  MOCK_PRESET_VEHICLES
} from '../data/mockTaxiData';
import { toastManager } from '../hooks/useToast';

export interface TaxiComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  currency: Currency;
  lang: Language;
}

type TabType = 'compliance' | 'profit' | 'pass' | 'centers';

export const TaxiComplianceModal: React.FC<TaxiComplianceModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  currency,
  lang
}) => {
  if (!isOpen) return null;

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>('compliance');

  // Selected Preset or Vehicle
  const initialYear = vehicle ? vehicle.year : 2021;
  const initialFuel: TaxiFuelType = vehicle?.fuelType === 'hybrid'
    ? 'hybrid'
    : vehicle?.fuelType === 'electric'
    ? 'ev'
    : vehicle?.fuelType === 'diesel'
    ? 'diesel'
    : 'petrol';

  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [selectedColor, setSelectedColor] = useState<TaxiColor>('white');
  const [selectedFuelType, setSelectedFuelType] = useState<TaxiFuelType>(initialFuel);

  // Equipment Checklist State
  const [equipmentState, setEquipmentState] = useState<Record<TaxiEquipmentKey, boolean>>({
    air_conditioning: true,
    abs: true,
    airbags: true,
    dual_dashcam: false,
    pos_terminal: false,
    taxi_roof_lamp: false,
    checker_decals: false
  });

  // Aggregator Profit Simulator State
  const [selectedPlatform, setSelectedPlatform] = useState<RideHailingPlatformKey>('bolt');
  const [dailyGrossAzn, setDailyGrossAzn] = useState<number>(140);
  const [workingDays, setWorkingDays] = useState<number>(26);
  const [dailyKm, setDailyKm] = useState<number>(180);
  const [dailyTrips, setDailyTrips] = useState<number>(18);

  // Pass Generator State
  const [carrierName, setCarrierName] = useState('Fərdi Sahibkar (Taksi Daşıyıcısı)');
  const [carrierVoen, setCarrierVoen] = useState('1402891921');
  const [driverName, setDriverName] = useState('Rəşad Əliyev');
  const [driverFin, setDriverFin] = useState('7ABC89X');
  const [plateNumber, setPlateNumber] = useState(vehicle?.plateNumber || '99-TX-841');
  const [validityYears, setValidityYears] = useState<1 | 3>(1);

  // Active or generated passes
  const [activePasses, setActivePasses] = useState<AynaTaxiPass[]>(MOCK_TAXI_PASSES);
  const [currentPass, setCurrentPass] = useState<AynaTaxiPass>(MOCK_TAXI_PASSES[0]);

  // Center Booking State
  const [selectedCenterId, setSelectedCenterId] = useState<string>(MOCK_AYNA_CENTERS[0].id);
  const [applicantName, setApplicantName] = useState('');
  const [applicantFin, setApplicantFin] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [selectedDate, setSelectedDate] = useState('2026-03-25');
  const [selectedSlot, setSelectedSlot] = useState(MOCK_AYNA_CENTERS[0].availableSlots[0]);
  const [activeBooking, setActiveBooking] = useState<TrainingBooking | null>(null);
  const [centerSearch, setCenterSearch] = useState('');

  // Compliance Calculation Memo
  const complianceAudit = useMemo(() => {
    return evaluateTaxiCompliance({
      year: selectedYear,
      color: selectedColor,
      fuelType: selectedFuelType,
      equipmentState,
      currency
    });
  }, [selectedYear, selectedColor, selectedFuelType, equipmentState, currency]);

  // Aggregator Profit Calculation Memo
  const profitReport = useMemo(() => {
    return calculateAggregatorProfit(
      {
        platform: selectedPlatform,
        dailyGrossAzn,
        workingDaysPerMonth: workingDays,
        dailyKm,
        fuelType: selectedFuelType,
        dailyTrips
      },
      currency
    );
  }, [selectedPlatform, dailyGrossAzn, workingDays, dailyKm, selectedFuelType, dailyTrips, currency]);

  // Handle Equipment Toggle
  const toggleEquipment = (key: TaxiEquipmentKey) => {
    setEquipmentState(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Auto-complete All Equipment Requirements
  const handleAutoCompleteRetrofit = () => {
    setEquipmentState({
      air_conditioning: true,
      abs: true,
      airbags: true,
      dual_dashcam: true,
      pos_terminal: true,
      taxi_roof_lamp: true,
      checker_decals: true
    });
    setSelectedColor('white');
    toastManager.add('Tələblər Tamamlandı: Bütün normativ avadanlıqlar və standart ağ rəng aktivləşdirildi.', 'success');
  };

  // Select Preset Vehicle
  const handleSelectPreset = (presetId: string) => {
    const preset = MOCK_PRESET_VEHICLES.find(p => p.id === presetId);
    if (!preset) return;
    setSelectedYear(preset.year);
    setSelectedColor(preset.color);
    setSelectedFuelType(preset.fuelType);
    setPlateNumber(preset.plate);
    toastManager.add(`Avtomobil Seçildi: ${preset.name} parametrləri yükləndi.`, 'info');
  };

  // Generate Taxi Pass
  const handleGeneratePass = (e: React.FormEvent) => {
    e.preventDefault();
    const newPass = createAynaTaxiPass({
      plateNumber,
      vin: vehicle?.vin || 'JTDKN3DU5A1829304',
      vehicleMake: vehicle?.make || 'Toyota',
      vehicleModel: vehicle?.model || 'Prius',
      vehicleYear: selectedYear,
      vehicleColor: selectedColor === 'white' ? 'Ağ (White)' : selectedColor === 'red' ? 'Qırmızı (Red)' : 'Standart',
      fuelType: selectedFuelType,
      carrierName,
      carrierVoen,
      driverName,
      driverFin,
      validityYears
    });

    setActivePasses(prev => [newPass, ...prev]);
    setCurrentPass(newPass);
    toastManager.add(`E-Buraxılış Vərəqəsi Tərtib Edildi: ${newPass.passNumber} nömrəli icazə uğurla yaradıldı.`, 'success');
  };

  // Book Training Slot
  const handleBookSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !applicantFin || !applicantPhone) {
      toastManager.add('Zəhmət olmasa ad, FİN və əlaqə nömrəsini qeyd edin.', 'warning');
      return;
    }

    const center = MOCK_AYNA_CENTERS.find(c => c.id === selectedCenterId) || MOCK_AYNA_CENTERS[0];
    const booking = createTrainingBooking({
      centerId: center.id,
      centerName: center.name[lang] || center.name.az,
      applicantName,
      applicantFin,
      applicantPhone,
      date: selectedDate,
      timeSlot: selectedSlot,
      service: center.services[0].az
    });

    setActiveBooking(booking);
    toastManager.add(`Növbə Rezerv Olundu: Kod ${booking.confirmationCode} - ${booking.date} tarixində gözlənilirsiniz.`, 'success');
  };

  // Copy Pass Code
  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    toastManager.add(`Qeydiyyat nömrəsi buferə kopyalandı: ${code}`, 'info');
  };

  // Filter Centers
  const filteredCenters = useMemo(() => {
    if (!centerSearch.trim()) return MOCK_AYNA_CENTERS;
    const query = centerSearch.toLowerCase();
    return MOCK_AYNA_CENTERS.filter(
      c =>
        c.name.az.toLowerCase().includes(query) ||
        c.city.toLowerCase().includes(query) ||
        c.district.toLowerCase().includes(query) ||
        c.address.toLowerCase().includes(query)
    );
  }, [centerSearch]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="taxi-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
    >
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="taxi-modal-title" className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  AYNA Taksi Portalı & Buraxılış Vərəqəsi
                </h2>
                <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                  Nazirlər Kabineti №94
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Azərbaycan Yerüstü Nəqliyyat Agentliyi • Taksi Standartları, E-İcazə & Aqreqator Gəlir Sistemi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-mono">
              {currency}
            </span>
            <button
              onClick={onClose}
              data-testid="taxi-modal-close-btn"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Bağla"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-slate-900/90 px-6 gap-2 sm:gap-4 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('compliance')}
            data-testid="tab-compliance-btn"
            className={`py-3.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'compliance'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Uyğunluq Yoxlaması</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                complianceAudit.complianceScore >= 80
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {complianceAudit.complianceScore}%
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profit')}
            data-testid="tab-profit-btn"
            className={`py-3.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'profit'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Aqreqator Gəlir Kalkulyatoru</span>
          </button>

          <button
            onClick={() => setActiveTab('pass')}
            data-testid="tab-pass-btn"
            className={`py-3.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'pass'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>E-Buraxılış Vərəqəsi</span>
          </button>

          <button
            onClick={() => setActiveTab('centers')}
            data-testid="tab-centers-btn"
            className={`py-3.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'centers'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>AYNA Təlim Mərkəzləri</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-slate-800 text-slate-400">
              {MOCK_AYNA_CENTERS.length}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: COMPLIANCE AUDITOR */}
          {activeTab === 'compliance' && (
            <div className="space-y-6">
              {/* Presets and Vehicle Info */}
              <div className="bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Car className="w-4 h-4 text-amber-400" />
                    <span>Müayinə Edilən Avtomobil</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    İl: <span className="text-white font-semibold">{selectedYear}</span> ({complianceAudit.vehicleAge} yaş) • 
                    Rəng: <span className="text-white font-semibold uppercase">{selectedColor}</span> • 
                    Yanacaq: <span className="text-white font-semibold uppercase">{selectedFuelType}</span>
                  </p>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-400">Nümunə avtomobillər:</span>
                  {MOCK_PRESET_VEHICLES.slice(0, 3).map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPreset(p.id)}
                      className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                    >
                      {p.name.split(' ')[0]} {p.name.split(' ')[1]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Banner */}
              <div
                className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  complianceAudit.status === 'eligible_new'
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                    : complianceAudit.status === 'eligible_grandfathered'
                    ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                    : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {complianceAudit.status === 'eligible_new' ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    ) : complianceAudit.status === 'eligible_grandfathered' ? (
                      <Clock className="w-6 h-6 text-amber-400" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-rose-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-white">
                        {complianceAudit.status === 'eligible_new'
                          ? 'YENİ AYNA STANDARTINA TAM UYĞUNDUR'
                          : complianceAudit.status === 'eligible_grandfathered'
                          ? 'KEÇİD DÖVRÜ ÜZRƏ UYĞUNDUR (15 İL HƏDDİ)'
                          : 'QEYRİ-UYĞUN (BURAXILIŞ VERİLMİR)'}
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border font-bold">
                        {complianceAudit.complianceScore}/100 xal
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                      {complianceAudit.verdictMessage[lang] || complianceAudit.verdictMessage.az}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleAutoCompleteRetrofit}
                  data-testid="auto-complete-retrofit-btn"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Tələbləri Avtomatik Tamamla</span>
                </button>
              </div>

              {/* Parameter Adjusters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Year Selector */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <label className="text-xs font-semibold text-slate-300 block mb-2">
                    Buraxılış İli (Maks. 8 il tələbi)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={2005}
                      max={CURRENT_REFERENCE_YEAR}
                      value={selectedYear}
                      onChange={e => setSelectedYear(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                    <span className="font-mono text-sm font-bold text-amber-400 w-12 text-right">
                      {selectedYear}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {CURRENT_REFERENCE_YEAR - selectedYear} yaş (Minimum tələb: {CURRENT_REFERENCE_YEAR - MAX_NEW_TAXI_AGE_YEARS})
                  </span>
                </div>

                {/* Color Selector */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <label className="text-xs font-semibold text-slate-300 block mb-2">
                    Kuzov Rəngi (Rəsmi: Ağ və ya Qırmızı)
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['white', 'red', 'yellow', 'black', 'silver', 'other'] as TaxiColor[]).map(c => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`px-2 py-1 text-xs rounded-lg font-medium border capitalize transition-all ${
                          selectedColor === c
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {c === 'white' ? 'Ağ' : c === 'red' ? 'Qırmızı' : c === 'yellow' ? 'Sarı' : c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fuel Selector */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <label className="text-xs font-semibold text-slate-300 block mb-2">
                    Mühərrik və Yanacaq Tipi
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['hybrid', 'ev', 'petrol', 'diesel', 'lpg'] as TaxiFuelType[]).map(f => (
                      <button
                        key={f}
                        onClick={() => setSelectedFuelType(f)}
                        className={`px-2 py-1 text-xs rounded-lg font-medium border uppercase transition-all ${
                          selectedFuelType === f
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {f === 'ev' ? '⚡ Elektrik' : f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mandatory Equipment Checklist */}
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Məcburi Texniki Avadanlıqlar (AYNA Qanuni Standart)</span>
                  </h4>
                  <div className="text-xs text-slate-400">
                    Çatışmayan avadanlıq xərci:{' '}
                    <span className="text-amber-400 font-bold">
                      {complianceAudit.retrofitCostConverted} {currency}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {DEFAULT_EQUIPMENT_CATALOG.map(item => {
                    const isInstalled = equipmentState[item.key];
                    return (
                      <div
                        key={item.key}
                        onClick={() => toggleEquipment(item.key)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                          isInstalled
                            ? 'bg-slate-900/90 border-emerald-500/30'
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-5 h-5 rounded flex items-center justify-center mt-0.5 transition-colors ${
                              isInstalled ? 'bg-emerald-500 text-slate-950' : 'border border-slate-600 bg-slate-800'
                            }`}
                          >
                            {isInstalled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">
                              {item.label[lang] || item.label.az}
                            </span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              {item.description[lang] || item.description.az}
                            </span>
                          </div>
                        </div>

                        {!isInstalled && (
                          <span className="text-[11px] font-mono text-amber-400 font-semibold whitespace-nowrap">
                            +{item.retrofitCostAzn} AZN
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Checklist Requirements */}
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-sky-400" />
                  <span>Dövlət İcazə Şərtləri & Protokol Yoxlaması</span>
                </h4>
                <div className="space-y-2">
                  {complianceAudit.checklist.map(c => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5">
                          {c.isMet ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-rose-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-200">
                            {c.title[lang] || c.title.az}
                          </p>
                          {c.note && (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {c.note[lang] || c.note.az}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          c.isMet
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {c.isMet ? 'Təmin edilib' : 'Çatışmır'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AGGREGATOR PROFIT CALCULATOR */}
          {activeTab === 'profit' && (
            <div className="space-y-6">
              {/* Platform Selector */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  Taksi Aqreqator Şəbəkəsini Seçin
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {(Object.keys(RIDE_HAILING_PLATFORMS) as RideHailingPlatformKey[]).map(key => {
                    const plat = RIDE_HAILING_PLATFORMS[key];
                    const isSelected = selectedPlatform === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedPlatform(key)}
                        data-testid={`platform-btn-${key}`}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-slate-850 border-amber-500 shadow-md shadow-amber-500/10'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: plat.accentColor }}
                          />
                          <span className="text-[11px] font-mono text-slate-400">
                            {plat.commissionRate > 0 ? `${(plat.commissionRate * 100).toFixed(0)}%` : '0%'}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-white block truncate">{plat.name}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Dəstək: {plat.supportPhone}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slider Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Daily Gross */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Günlük Ümumi Gediş Haqqı (Dövriyyə)
                    </label>
                    <span className="font-mono text-amber-400 font-bold text-sm">
                      {dailyGrossAzn} AZN
                    </span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={300}
                    step={5}
                    value={dailyGrossAzn}
                    onChange={e => setDailyGrossAzn(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>50 ₼</span>
                    <span>150 ₼</span>
                    <span>300 ₼</span>
                  </div>
                </div>

                {/* Working Days */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Aylıq İş Günləri Sayı
                    </label>
                    <span className="font-mono text-amber-400 font-bold text-sm">
                      {workingDays} gün
                    </span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={30}
                    step={1}
                    value={workingDays}
                    onChange={e => setWorkingDays(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>15 gün</span>
                    <span>22 gün</span>
                    <span>30 gün</span>
                  </div>
                </div>

                {/* Daily Mileage */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Günlük Yürüş (Məsafə)
                    </label>
                    <span className="font-mono text-amber-400 font-bold text-sm">
                      {dailyKm} km
                    </span>
                  </div>
                  <input
                    type="range"
                    min={60}
                    max={350}
                    step={10}
                    value={dailyKm}
                    onChange={e => setDailyKm(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>60 km</span>
                    <span>200 km</span>
                    <span>350 km</span>
                  </div>
                </div>

                {/* Daily Trips */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Günlük Sifariş Sayı
                    </label>
                    <span className="font-mono text-amber-400 font-bold text-sm">
                      {dailyTrips} sifariş
                    </span>
                  </div>
                  <input
                    type="range"
                    min={6}
                    max={40}
                    step={1}
                    value={dailyTrips}
                    onChange={e => setDailyTrips(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>6 sifariş</span>
                    <span>20 sifariş</span>
                    <span>40 sifariş</span>
                  </div>
                </div>
              </div>

              {/* Financial Outcome Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Net Monthly Profit */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30">
                  <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider block">
                    Xalis Aylıq Qazanc (Net)
                  </span>
                  <div className="text-2xl font-black text-white mt-1">
                    {profitReport.monthlyNetConverted} {currency}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    {profitReport.monthlyNetAzn} AZN / ay (xalis cəmi)
                  </span>
                </div>

                {/* Commission Deduction */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider block">
                    Aqreqator Komissiyası
                  </span>
                  <div className="text-2xl font-black text-slate-200 mt-1">
                    -{profitReport.monthlyCommissionAzn} AZN
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Günlük ~{profitReport.dailyCommissionAzn} AZN çıxılır
                  </span>
                </div>

                {/* Fuel & Energy Cost */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider block">
                    Yanacaq / Enerji Xərci
                  </span>
                  <div className="text-2xl font-black text-slate-200 mt-1">
                    -{profitReport.monthlyFuelAzn} AZN
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Günlük ~{profitReport.dailyFuelAzn} AZN ({selectedFuelType.toUpperCase()})
                  </span>
                </div>

                {/* Amortization & Pass */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs font-semibold text-sky-300 uppercase tracking-wider block">
                    Amortizasiya & Rüsumlar
                  </span>
                  <div className="text-2xl font-black text-slate-200 mt-1">
                    -{profitReport.monthlyAmortizationAzn} AZN
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Yağ, təkər və AYNA icazə haqqı
                  </span>
                </div>
              </div>

              {/* Secondary Metrics */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Saatlıq Qazanc Ekvivalenti: ~{profitReport.hourlyWageConverted} {currency} / saat
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Ayda cəmi {profitReport.monthlyTripCount} tamamlanmış sərnişin səfəri
                    </span>
                  </div>
                </div>

                {profitReport.ecoSavingVsPetrolMonthAzn > 0 && (
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span>
                      Benzinə nisbətən qənaət: +{profitReport.ecoSavingVsPetrolMonthAzn} AZN / ay
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: E-BURAXILIŞ VƏRƏQƏSİ */}
          {activeTab === 'pass' && (
            <div className="space-y-6">
              {/* Pass Certificate Preview */}
              <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/40 shadow-2xl overflow-hidden">
                {/* Background Watermark */}
                <div className="absolute right-6 -bottom-10 opacity-5 pointer-events-none select-none text-9xl font-black text-white">
                  AYNA
                </div>

                {/* Certificate Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                        AZƏRBAYCAN YERÜSTÜ NƏQLİYYAT AGENTLİYİ
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                        TAKSİ MİNİK AVTOMOBİLİ ÜÇÜN BURAXILIŞ VƏRƏQƏSİ
                      </h3>
                      <p className="text-[10px] text-slate-400">
                        "Avtomobil nəqliyyatı haqqında" Azərbaycan Respublikasının Qanunu • Maddə 18
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">
                      Qeydiyyat Seriyası
                    </span>
                    <span className="font-mono text-base font-bold text-amber-400">
                      {currentPass.passNumber}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mt-1">
                      <Check className="w-3 h-3" /> QÜVVƏDƏDİR
                    </span>
                  </div>
                </div>

                {/* Plate and Vehicle Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                  {/* Plate display */}
                  <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <div className="flex items-center bg-white text-slate-950 font-black rounded-lg border-2 border-slate-900 px-3 py-1.5 shadow-md">
                      <div className="flex flex-col items-center border-r-2 border-slate-900 pr-2 mr-2">
                        <span className="text-[9px] text-blue-800 font-bold leading-none">AZ</span>
                      </div>
                      <span className="font-mono text-xl sm:text-2xl tracking-widest uppercase">
                        {currentPass.plateNumber}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-2">
                      Dövlət Qeydiyyat Nişanı • VÖEN: {currentPass.carrierVoen}
                    </span>
                  </div>

                  {/* Vehicle Specs */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <span className="text-slate-400 text-[10px] block">Marka / Model:</span>
                      <span className="font-bold text-white block mt-0.5">
                        {currentPass.vehicleMake} {currentPass.vehicleModel}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <span className="text-slate-400 text-[10px] block">İstehsal İli / Rəng:</span>
                      <span className="font-bold text-white block mt-0.5">
                        {currentPass.vehicleYear} • {currentPass.vehicleColor}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <span className="text-slate-400 text-[10px] block">Sürücü / FİN:</span>
                      <span className="font-bold text-white block mt-0.5">
                        {currentPass.driverName} ({currentPass.driverFin})
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <span className="text-slate-400 text-[10px] block">Etibarlılıq Müddəti:</span>
                      <span className="font-bold text-emerald-400 block mt-0.5">
                        {currentPass.expiryDate} ({currentPass.validityYears} il)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Telemetry and Checksum */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-800 pt-4 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-amber-400">Checksum: {currentPass.securityChecksum}</span>
                    <span>•</span>
                    <span>Dövlət Rüsumu: {currentPass.stateDutyAzn} AZN</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyCode(currentPass.passNumber)}
                      data-testid="copy-pass-code-btn"
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Kodu Kopyala</span>
                    </button>
                    <button
                      onClick={() => {
                        window.print?.();
                        toastManager.add('E-Buraxılış Vərəqəsi sənədi çapa göndərildi.', 'info');
                      }}
                      data-testid="print-pass-btn"
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Vərəqəni Çap Et</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Pass Generator Form */}
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Yeni E-Buraxılış Vərəqəsi Tərtibat Formu</span>
                </h4>

                <form onSubmit={handleGeneratePass} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Dövlət Nömrə Nişanı</label>
                    <input
                      type="text"
                      value={plateNumber}
                      onChange={e => setPlateNumber(e.target.value)}
                      placeholder="99-TX-841"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs uppercase font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Sürücünün Adı, Soyadı</label>
                    <input
                      type="text"
                      value={driverName}
                      onChange={e => setDriverName(e.target.value)}
                      placeholder="Ad Soyad"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Sürücünün FİN Kodu</label>
                    <input
                      type="text"
                      value={driverFin}
                      onChange={e => setDriverFin(e.target.value)}
                      placeholder="7ABC89X"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs uppercase font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Daşıyıcının VÖEN-i</label>
                    <input
                      type="text"
                      value={carrierVoen}
                      onChange={e => setCarrierVoen(e.target.value)}
                      placeholder="1402891921"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">İcazə Müddəti</label>
                    <select
                      value={validityYears}
                      onChange={e => setValidityYears(Number(e.target.value) as 1 | 3)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                    >
                      <option value={1}>1 İl Müddətinə (25 AZN)</option>
                      <option value={3}>3 İl Müddətinə (65 AZN)</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      data-testid="submit-pass-btn"
                      className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      Vərəqəni Təsdiqlə & Tərtib Et
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: TRAINING & INSPECTION CENTERS */}
          {activeTab === 'centers' && (
            <div className="space-y-6">
              {/* Search input */}
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={centerSearch}
                    onChange={e => setCenterSearch(e.target.value)}
                    placeholder="Mərkəz adı, rayon və ya şəhərə görə axtarın..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Centers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCenters.map(center => (
                  <div
                    key={center.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      selectedCenterId === center.id
                        ? 'bg-slate-900/90 border-amber-500 shadow-md shadow-amber-500/10'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                          {center.city} • {center.district}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-0.5">
                          {center.name[lang] || center.name.az}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>{center.address}</span>
                        </p>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          center.queueStatus === 'low'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        Növbə: {center.queueStatus === 'low' ? 'Sərbəst' : 'Orta'}
                      </span>
                    </div>

                    <div className="my-3 border-t border-slate-800/80 pt-2.5 space-y-1">
                      <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>İş vaxtı: {center.workingHours}</span>
                      </div>
                      <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>Əlaqə: {center.phone}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1 flex-wrap">
                        {center.availableSlots.slice(0, 3).map(slot => (
                          <span
                            key={slot}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                          >
                            {slot}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => setSelectedCenterId(center.id)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                          selectedCenterId === center.id
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        {selectedCenterId === center.id ? 'Seçildi' : 'Seç'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Slot Booking Section */}
              <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>AYNA Təlim və Müayinə Növbəsi Rezervasiyası</span>
                </h4>

                <form onSubmit={handleBookSlot} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Sürücünün Tam Adı</label>
                    <input
                      type="text"
                      value={applicantName}
                      onChange={e => setApplicantName(e.target.value)}
                      placeholder="Ad Soyad"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">FİN Kod</label>
                    <input
                      type="text"
                      value={applicantFin}
                      onChange={e => setApplicantFin(e.target.value)}
                      placeholder="7ABC89X"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs uppercase font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Əlaqə Nömrəsi</label>
                    <input
                      type="text"
                      value={applicantPhone}
                      onChange={e => setApplicantPhone(e.target.value)}
                      placeholder="+994 50 123 45 67"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Tarix və Saat</label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        className="w-full px-2 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                      />
                      <select
                        value={selectedSlot}
                        onChange={e => setSelectedSlot(e.target.value)}
                        className="px-2 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono"
                      >
                        {MOCK_AYNA_CENTERS[0].availableSlots.map(s => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-4 flex justify-end">
                    <button
                      type="submit"
                      data-testid="confirm-booking-btn"
                      className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
                    >
                      Növbəni Təsdiqlə (Ödənişsiz Rezerv)
                    </button>
                  </div>
                </form>

                {/* Booking confirmation voucher */}
                {activeBooking && (
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold text-emerald-400 block">
                          Növbə Təsdiqləndi: {activeBooking.confirmationCode}
                        </span>
                        <p className="text-[11px] text-slate-300 mt-0.5">
                          {activeBooking.applicantName} • {activeBooking.centerName} ({activeBooking.date} / {activeBooking.timeSlot})
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopyCode(activeBooking.confirmationCode)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold"
                    >
                      Kodu Kopyala
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>AYNA Mərkəzi Reyestr Sistemi Canlı İnteqrasiya</span>
          </div>

          <div className="flex items-center gap-3">
            <span>Dövlət Rüsumu: {STATUTORY_FEES.vehiclePass1YearAzn} AZN / il</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
            >
              Bağla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

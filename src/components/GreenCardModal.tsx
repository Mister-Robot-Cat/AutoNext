import React, { useState, useMemo } from 'react';
import {
  Globe,
  ShieldCheck,
  MapPin,
  Car,
  FileText,
  Clock,
  Printer,
  Copy,
  Check,
  CheckCircle2,
  X,
  AlertTriangle,
  Compass,
  ArrowRight,
  Shield,
  QrCode,
  Sparkles,
  Phone,
  Fuel,
  Info,
  Calendar,
  Building2,
  CheckSquare,
  Square,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Vehicle, Currency, Language } from '../types/vehicle';
import {
  GreenCardZoneId,
  GreenCardVehicleCategory,
  GreenCardDuration,
  BorderCrossingCountry,
  BorderCrossingPoint,
  AuthorizedInsurer,
  GreenCardPolicyRecord,
  BorderTransitDeclaration,
} from '../types/greenCard';
import {
  BORDER_CROSSING_POINTS,
  AUTHORIZED_ISB_INSURERS,
  GREEN_CARD_ZONES_CONFIG,
  CROSS_BORDER_CHECKLIST,
  SAMPLE_GREEN_CARD_POLICIES,
} from '../data/mockGreenCardData';
import {
  calculateGreenCardTariff,
  calculateBorderReadiness,
  calculateTransitFuelEstimates,
  formatGreenCardAmount,
  generateGreenCardPolicyRecord,
  generateBorderTransitDeclaration,
  getCategoryTitle,
  getZoneTitle,
  getDurationTitle,
} from '../utils/greenCard';
import { toastManager } from '../hooks/useToast';

export interface GreenCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  currency: Currency;
  lang: Language;
}

type TabType = 'calculator' | 'radar' | 'checklist' | 'policy' | 'declaration';

export const GreenCardModal: React.FC<GreenCardModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  currency,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('calculator');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Calculator Form State
  const [category, setCategory] = useState<GreenCardVehicleCategory>('passenger');
  const [zone, setZone] = useState<GreenCardZoneId>('zone_3_georgia_turkey');
  const [duration, setDuration] = useState<GreenCardDuration>('1_month');
  const [selectedInsurer, setSelectedInsurer] = useState<AuthorizedInsurer>(AUTHORIZED_ISB_INSURERS[0]);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Driver & Vehicle Details
  const [driverName, setDriverName] = useState('Məmmədov Rauf Kamran oğlu');
  const [driverFin, setDriverFin] = useState('5K8M9P1');
  const [passportNumber, setPassportNumber] = useState('C-09823145');
  const [plateNumber, setPlateNumber] = useState(vehicle?.plateNumber || '90-AA-100');
  const [vinNumber, setVinNumber] = useState(vehicle?.vin || '4T1B11HK5PU920194');
  const [vehicleMake, setVehicleMake] = useState(vehicle?.make || 'Toyota');
  const [vehicleModel, setVehicleModel] = useState(vehicle?.model || 'Camry Hybrid');
  const [vehicleYear, setVehicleYear] = useState(vehicle?.year || 2023);

  // Border Radar Filters & Selected Point
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<BorderCrossingCountry | 'all'>('all');
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<BorderCrossingPoint>(BORDER_CROSSING_POINTS[0]);

  // Checklist State (IDs of checked items)
  const [completedChecklistIds, setCompletedChecklistIds] = useState<string[]>([
    'passport',
    'texpasport',
    'green_card',
    'poa_crossborder',
  ]);

  // Active Policies List in Modal State
  const [policies, setPolicies] = useState<GreenCardPolicyRecord[]>(SAMPLE_GREEN_CARD_POLICIES);
  const [currentPolicy, setCurrentPolicy] = useState<GreenCardPolicyRecord>(SAMPLE_GREEN_CARD_POLICIES[0]);

  // Customs Transit Declaration State
  const [purposeOfVisit, setPurposeOfVisit] = useState<'tourism' | 'business' | 'transit' | 'freight'>('tourism');
  const [estimatedDays, setEstimatedDays] = useState(14);
  const [fuelInTank, setFuelInTank] = useState(50);
  const [currentDeclaration, setCurrentDeclaration] = useState<BorderTransitDeclaration>(() =>
    generateBorderTransitDeclaration({
      customsCheckpointId: BORDER_CROSSING_POINTS[0].id,
      customsCheckpointName: BORDER_CROSSING_POINTS[0].name,
      destinationCountry: 'Gürcüstan (Georgia)',
      purposeOfVisit: 'tourism',
      driverFullName: 'Məmmədov Rauf Kamran oğlu',
      driverFin: '5K8M9P1',
      passportNumber: 'C-09823145',
      plateNumber: vehicle?.plateNumber || '90-AA-100',
      vin: vehicle?.vin || '4T1B11HK5PU920194',
      make: vehicle?.make || 'Toyota',
      model: vehicle?.model || 'Camry Hybrid',
      year: vehicle?.year || 2023,
      estimatedReturnDays: 14,
      commercialCargo: false,
      fuelInTankLiters: 50,
    })
  );

  // Current Calculation
  const tariffResult = useMemo(() => {
    return calculateGreenCardTariff(category, zone, duration, currency, startDate);
  }, [category, zone, duration, currency, startDate]);

  // Checklist Readiness
  const readinessResult = useMemo(() => {
    return calculateBorderReadiness(completedChecklistIds);
  }, [completedChecklistIds]);

  // Fuel Estimates to Selected Checkpoint
  const fuelEstimates = useMemo(() => {
    const consumption = vehicle?.fuelConsumptionLPer100Km || 7.5;
    return calculateTransitFuelEstimates(selectedCheckpoint.distanceFromBakuKm, consumption);
  }, [selectedCheckpoint, vehicle]);

  // Filtered Checkpoints
  const filteredCheckpoints = useMemo(() => {
    if (selectedCountryFilter === 'all') return BORDER_CROSSING_POINTS;
    return BORDER_CROSSING_POINTS.filter((p) => p.borderCountry === selectedCountryFilter);
  }, [selectedCountryFilter]);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    toastManager.add(`Kopyalandı: ${label}`, 'info');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleBuyPolicy = () => {
    const newPolicy = generateGreenCardPolicyRecord({
      insurerId: selectedInsurer.id,
      insurerName: selectedInsurer.name,
      zoneId: zone,
      category,
      duration,
      plateNumber,
      make: vehicleMake,
      model: vehicleModel,
      year: vehicleYear,
      vin: vinNumber,
      driverFullName: driverName,
      driverFin,
      passportNumber,
      startDate,
    });

    setPolicies([newPolicy, ...policies]);
    setCurrentPolicy(newPolicy);
    setActiveTab('policy');
    toastManager.add(
      `Beynəlxalq Yaşıl Kart polisi uğurla rəsmiləşdirildi! Nömrə: ${newPolicy.policyNumber}`,
      'success'
    );
  };

  const handleToggleChecklist = (id: string) => {
    setCompletedChecklistIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmitDeclaration = () => {
    const newDec = generateBorderTransitDeclaration({
      customsCheckpointId: selectedCheckpoint.id,
      customsCheckpointName: selectedCheckpoint.name,
      destinationCountry:
        selectedCheckpoint.borderCountry === 'georgia'
          ? 'Gürcüstan (Georgia)'
          : selectedCheckpoint.borderCountry === 'turkey'
          ? 'Türkiyə Cümhuriyyəti (Turkey)'
          : selectedCheckpoint.borderCountry === 'russia'
          ? 'Rusiya Federasiyası (Russia)'
          : 'İran İslam Respublikası (Iran)',
      purposeOfVisit,
      driverFullName: driverName,
      driverFin,
      passportNumber,
      plateNumber,
      vin: vinNumber,
      make: vehicleMake,
      model: vehicleModel,
      year: vehicleYear,
      estimatedReturnDays: estimatedDays,
      fuelInTankLiters: fuelInTank,
    });

    setCurrentDeclaration(newDec);
    setActiveTab('declaration');
    toastManager.add(
      `DGK Sərhəd Gömrük Bəyannaməsi qeydə alındı! Bəyannamə №: ${newDec.declarationNumber}`,
      'success'
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
      data-testid="green-card-modal"
    >
      <div
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/70 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 shadow-lg shadow-emerald-500/25 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Globe className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  İSB Beynəlxalq Yaşıl Kart & Sərhəd Keçid Portalı
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full">
                  CoB Brussels & İSB Rəsmi
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Council of Bureaux beynəlxalq avtomobil mülki məsuliyyət sığortası və DSX/DGK sərhəd radarı
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            data-testid="green-card-modal-close-btn"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Bağla"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-800/80 bg-slate-950/40 px-4 sm:px-6 gap-2 py-2 text-xs font-semibold scrollbar-none">
          <button
            onClick={() => setActiveTab('calculator')}
            data-testid="tab-calculator"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Tarif Kalkulyatoru & Sığortaçı Seçimi</span>
          </button>

          <button
            onClick={() => setActiveTab('radar')}
            data-testid="tab-radar"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'radar'
                ? 'bg-teal-600/20 text-teal-400 border border-teal-500/40 shadow-sm shadow-teal-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4 text-teal-400" />
            <span>Sərhəd Keçid Məntəqələri Radarı</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            data-testid="tab-checklist"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'checklist'
                ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-cyan-400" />
            <span>Sərhəd Yoxlama Vərəqəsi</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                readinessResult.isReadyToCross
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {readinessResult.readinessPercentage}%
            </span>
          </button>

          <button
            onClick={() => setActiveTab('policy')}
            data-testid="tab-policy"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'policy'
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Elektron Yaşıl Kart Polisi</span>
          </button>

          <button
            onClick={() => setActiveTab('declaration')}
            data-testid="tab-declaration"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'declaration'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>DGK Sərhəd Bəyannaməsi</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: CALCULATOR & INSURER */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              {/* Top Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/30 border border-emerald-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Rəsmi İSB Qanuni Yaşıl Kart Qiymətləri
                    </h4>
                    <p className="text-xs text-slate-300">
                      Bütün tariflər "İcbari Sığortalar haqqında" Azərbaycan Respublikası Qanunu ilə dövlət səviyyəsində tənzimlənir.
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Yekun Sığorta Haqqı
                  </span>
                  <span className="text-2xl font-black text-emerald-400">
                    {formatGreenCardAmount(tariffResult.totalCostAzn, currency)}
                  </span>
                </div>
              </div>

              {/* 1. Vehicle Category Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  1. Nəqliyyat Vasitəsinin Növü
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                  {(
                    [
                      { id: 'passenger', title: 'Minik (≤9 yer)', icon: Car },
                      { id: 'motorcycle', title: 'Motosiklet', icon: Compass },
                      { id: 'minibus', title: 'Mikroavtobus', icon: Building2 },
                      { id: 'truck', title: 'Yük / TIR', icon: MapPin },
                      { id: 'trailer', title: 'Qoşqu / Karavan', icon: Globe },
                    ] as const
                  ).map((cat) => {
                    const IconComponent = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                          isSelected
                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/15'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <IconComponent className={`w-5 h-5 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                        <span className="text-xs font-semibold">{cat.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Zone Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  2. Əhatə Zonası (Coğrafi Dairə)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(['zone_3_georgia_turkey', 'zone_2_regional', 'zone_1_all'] as GreenCardZoneId[]).map(
                    (zId) => {
                      const zCfg = GREEN_CARD_ZONES_CONFIG[zId];
                      const isSelected = zone === zId;
                      return (
                        <div
                          key={zId}
                          onClick={() => setZone(zId)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-emerald-600/15 border-emerald-500 shadow-md shadow-emerald-500/10'
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-bold text-white">{zCfg.name.az}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-emerald-400">
                                {zCfg.totalCountries} ölkə
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed mb-3">
                              {zCfg.description.az}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                            <span className="text-[11px] font-medium text-slate-400">
                              {zId === 'zone_3_georgia_turkey'
                                ? 'GE, TR'
                                : zId === 'zone_2_regional'
                                ? 'RUS, TR, GE, IR, BY, MD, UA'
                                : 'Avropa + 47 CoB ölkəsi'}
                            </span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* 3. Duration Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  3. Müqavilə Müddəti
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                  {(['15_days', '1_month', '3_months', '6_months', '1_year'] as GreenCardDuration[]).map(
                    (dur) => {
                      const isSelected = duration === dur;
                      const tariff = calculateGreenCardTariff(category, zone, dur, currency);
                      return (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setDuration(dur)}
                          className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between ${
                            isSelected
                              ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-md shadow-emerald-500/15'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                          }`}
                        >
                          <span className="text-xs font-bold">{getDurationTitle(dur, 'az')}</span>
                          <span className="text-sm font-black text-emerald-400 mt-1">
                            {formatGreenCardAmount(tariff.totalCostAzn, currency)}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* 4. Insurer Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  4. Səlahiyyətli İSB Sığorta Şirkəti Seçimi
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {AUTHORIZED_ISB_INSURERS.map((ins) => {
                    const isSelected = selectedInsurer.id === ins.id;
                    return (
                      <div
                        key={ins.id}
                        onClick={() => setSelectedInsurer(ins)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-slate-800/90 border-emerald-500 shadow-md shadow-emerald-500/10'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{ins.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span>⭐ {ins.rating} ({ins.reviewCount})</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-medium">⚡ {ins.digitalIssuanceTime}</span>
                          </div>
                          <p className="text-[10px] text-slate-500">{ins.hotline}</p>
                        </div>
                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border border-slate-800" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 5. Driver & Vehicle Information Inputs */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  5. Sürücü və Nəqliyyat Vasitəsinin Məlumatları
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Sürücünün S.A.A.
                    </label>
                    <input
                      type="text"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Şəxsiyyət FİN Kodu
                    </label>
                    <input
                      type="text"
                      value={driverFin}
                      onChange={(e) => setDriverFin(e.target.value)}
                      maxLength={7}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono uppercase focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Xarici Pasport Nömrəsi
                    </label>
                    <input
                      type="text"
                      value={passportNumber}
                      onChange={(e) => setPassportNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono uppercase focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Dövlət Qeydiyyat Nişanı
                    </label>
                    <input
                      type="text"
                      value={plateNumber}
                      onChange={(e) => setPlateNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono uppercase focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      VIN / Şassi Nömrəsi
                    </label>
                    <input
                      type="text"
                      value={vinNumber}
                      onChange={(e) => setVinNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono uppercase focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Sığortanın Başlama Tarixi
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-400">
                  <span className="font-semibold text-white">Etibarlılıq: </span>
                  {tariffResult.validFrom} – {tariffResult.validUntil} ({tariffResult.durationDays} gün)
                </div>

                <button
                  type="button"
                  onClick={handleBuyPolicy}
                  data-testid="buy-policy-btn"
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Elektron Yaşıl Kart Polisini Rəsmiləşdir ({formatGreenCardAmount(tariffResult.totalCostAzn, currency)})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: BORDER CROSSING RADAR */}
          {activeTab === 'radar' && (
            <div className="space-y-6">
              {/* Filter by Border Country */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {(
                    [
                      { id: 'all', label: 'Bütün Keçid Məntəqələri (7)' },
                      { id: 'georgia', label: '🇬🇪 Gürcüstan' },
                      { id: 'russia', label: '🇷🇺 Rusiya' },
                      { id: 'turkey', label: '🇹🇷 Türkiyə' },
                      { id: 'iran', label: '🇮🇷 İran' },
                    ] as const
                  ).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCountryFilter(c.id)}
                      className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                        selectedCountryFilter === c.id
                          ? 'bg-teal-600 text-white shadow-sm'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                <div className="text-xs text-slate-400">
                  DSX & DGK real vaxt rejimli növbə monitorinqi
                </div>
              </div>

              {/* Checkpoints Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCheckpoints.map((cp) => {
                  const isSelected = selectedCheckpoint.id === cp.id;
                  const statusBadge =
                    cp.status === 'open_smooth'
                      ? { text: 'Açıq • Sürətli Keçid', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' }
                      : cp.status === 'open_moderate'
                      ? { text: 'Mötədil Növbə', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' }
                      : { text: 'Yüksək Sıxlıq', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' };

                  return (
                    <div
                      key={cp.id}
                      onClick={() => setSelectedCheckpoint(cp)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? 'bg-slate-900 border-teal-500 shadow-lg shadow-teal-500/10'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-teal-400" />
                            <span>{cp.name}</span>
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${statusBadge.color}`}
                          >
                            {statusBadge.text}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {cp.description.az}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="block text-[10px] text-slate-400">Bakıdan Məsafə</span>
                          <span className="text-xs font-bold text-teal-300">{cp.distanceFromBakuKm} km</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="block text-[10px] text-slate-400">Yol Müddəti</span>
                          <span className="text-xs font-bold text-white">~{cp.estimatedDriveHours} saat</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="block text-[10px] text-slate-400">Gözləmə</span>
                          <span className="text-xs font-bold text-amber-400">~{cp.averageWaitMinutes} dəq</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Zolaqlar: {cp.passengerLanes} minik / {cp.truckLanes} TIR</span>
                        <span className="text-teal-400 font-semibold">{cp.highwayRoute.split('–')[0]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Checkpoint Detail & Transit Telemetry */}
              <div className="p-5 rounded-3xl bg-slate-950/80 border border-teal-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                      Seçilmiş Keçid Məntəqəsi Telemetriyası
                    </span>
                    <h3 className="text-base font-black text-white">{selectedCheckpoint.name}</h3>
                    <p className="text-xs text-slate-400">
                      Qarşı tərəf: {selectedCheckpoint.foreignCounterpart} • {selectedCheckpoint.workingHours}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Əlaqə: {selectedCheckpoint.phone}</span>
                  </div>
                </div>

                {/* Features Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {selectedCheckpoint.features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-300"
                    >
                      ✓ {feat}
                    </span>
                  ))}
                </div>

                {/* Road Trip Fuel & Transit Estimator */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                      <Fuel className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">Təxmini Yanacaq</span>
                      <span className="text-sm font-bold text-white">{fuelEstimates.requiredFuelLiters} Litr</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">Yanacaq Xərci (Aİ-92)</span>
                      <span className="text-sm font-bold text-emerald-400">{fuelEstimates.totalFuelCostAzn} ₼</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">Ekoloji Təsir</span>
                      <span className="text-sm font-bold text-cyan-300">~{fuelEstimates.estimatedCo2Kg} kq CO₂</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CROSS-BORDER CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-6">
              {/* Readiness Progress Header */}
              <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="6"
                        className="text-slate-800"
                        fill="transparent"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="6"
                        strokeDasharray={175.9}
                        strokeDashoffset={175.9 - (175.9 * readinessResult.readinessPercentage) / 100}
                        className={readinessResult.isReadyToCross ? 'text-emerald-500' : 'text-amber-500'}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <span className="absolute text-sm font-black text-white">
                      {readinessResult.readinessPercentage}%
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Sərhəd Keçid Hazırlıq İndeksi</span>
                      {readinessResult.isReadyToCross ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Keçidə Hazırdır
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Çatışmayan Sənəd Var
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {readinessResult.completedCount} / {CROSS_BORDER_CHECKLIST.length} tələb tamamlandı.
                      Qanunvericilik üzrə məcburi sənədləri yoxlayın.
                    </p>
                  </div>
                </div>

                {!readinessResult.isReadyToCross && (
                  <div className="text-xs text-amber-300 bg-amber-950/30 border border-amber-800/40 p-2.5 rounded-xl max-w-xs">
                    <span className="font-bold">Məcburi çatışmayan: </span>
                    {readinessResult.missingMandatoryLabels.join(', ')}
                  </div>
                )}
              </div>

              {/* Checklist Items */}
              <div className="space-y-3">
                {CROSS_BORDER_CHECKLIST.map((item) => {
                  const isChecked = completedChecklistIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklist(item.id)}
                      data-testid={`checklist-item-${item.id}`}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isChecked
                          ? 'bg-slate-900/90 border-emerald-500/40 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <button
                        type="button"
                        className="mt-0.5 text-emerald-400 hover:scale-110 transition-transform cursor-pointer"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-600" />
                        )}
                      </button>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-sm font-bold ${isChecked ? 'text-white' : 'text-slate-300'}`}>
                            {item.label.az}
                          </h4>
                          {item.mandatory ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              Mütləq Tələb
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-400">
                              Tövsiyə Olunur
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {item.description.az}
                        </p>
                        {item.referenceLaw && (
                          <p className="text-[10px] text-teal-400 font-mono">
                            § {item.referenceLaw}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legal Cross-Border Advisory Notice */}
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-800/30 flex items-start gap-3">
                <Info className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-slate-300 space-y-1">
                  <strong className="text-cyan-300 block font-semibold">
                    Qonşu Ölkələr üçün Yol Haqqı və Qaydalar:
                  </strong>
                  <p className="leading-relaxed">
                    • <strong>Gürcüstan:</strong> Sərhədi keçdikdən dərhal sonra avtonəqliyyatın icbari sığortası yoxlanılır (Yaşıl Kart Gürcüstanı əhatə etməlidir). Fara işıqları sutka boyu yandırılmalıdır.
                    <br />
                    • <strong>Türkiyə:</strong> Magistral yollar üçün HGS (Hızlı Geçiş Sistemi) stikeri sərhəd postundakı PTT şöbəsindən alınmalıdır.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OFFICIAL DIGITAL GREEN CARD CERTIFICATE */}
          {activeTab === 'policy' && (
            <div className="space-y-6">
              {/* Green Card Certificate Frame (Authentic International Green Styling) */}
              <div className="relative p-6 sm:p-8 rounded-3xl bg-emerald-950/20 border-2 border-emerald-500/50 shadow-2xl space-y-6 overflow-hidden">
                {/* Background Watermark */}
                <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none select-none">
                  <Globe className="w-80 h-80 text-emerald-400" />
                </div>

                {/* Header of Green Card */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-800/40 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center font-black text-emerald-300 text-lg">
                      AZ
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block">
                        COUNCIL OF BUREAUX • BEYNƏLXALQ SIĞORTA ŞƏHADƏTNAMƏSİ
                      </span>
                      <h3 className="text-xl font-black text-white">
                        GREEN CARD / CARTE VERTE / YAŞIL KART
                      </h3>
                      <p className="text-xs text-slate-300">
                        İcbari Sığorta Bürosu (İSB) Dövlət Reyestri № {currentPolicy.isbBureauId}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Polis Nömrəsi</span>
                    <span className="text-lg font-mono font-black text-emerald-300 tracking-wider">
                      {currentPolicy.policyNumber}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-900/40">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Sığortaçı Şirkət</span>
                    <span className="font-bold text-white text-sm">{currentPolicy.insurerName}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-900/40">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Qüvvədə Olma Müddəti</span>
                    <span className="font-bold text-emerald-300 text-sm">
                      {currentPolicy.validFrom} – {currentPolicy.validUntil}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-900/40">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Dövlət Qeydiyyat Nişanı</span>
                    <span className="font-mono font-black text-white text-base">{currentPolicy.plateNumber}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-900/40">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Avtomobil</span>
                    <span className="font-bold text-white text-sm">
                      {currentPolicy.make} {currentPolicy.model} ({currentPolicy.year})
                    </span>
                  </div>
                </div>

                {/* Driver & VIN Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-900/40">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Sürücü / Sığortalı</span>
                    <span className="font-semibold text-white">{currentPolicy.driverFullName}</span>
                    <span className="block text-[11px] font-mono text-emerald-400 mt-0.5">FİN: {currentPolicy.driverFin}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-900/40">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Pasport Nömrəsi</span>
                    <span className="font-mono font-bold text-white">{currentPolicy.passportNumber}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-900/40">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Şassi / VIN Kodu</span>
                    <span className="font-mono font-bold text-white">{currentPolicy.vin}</span>
                  </div>
                </div>

                {/* International Country Code Matrix (Green Card Standard Box) */}
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-emerald-900/50 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">
                      8. Ərazi Etibarlılığı (Council of Bureaux Beynəlxalq Ölkə Matrisi):
                    </span>
                    <span className="text-[11px] text-emerald-400">
                      {currentPolicy.zoneId === 'zone_1_all'
                        ? 'Bütün 47 ölkə etibarlıdır'
                        : currentPolicy.zoneId === 'zone_2_regional'
                        ? 'Regional 7 ölkə etibarlıdır'
                        : 'Yalnız Gürcüstan və Türkiyə etibarlıdır'}
                    </span>
                  </div>

                  <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-16 gap-1 text-[10px] text-center font-mono">
                    {[
                      'A', 'AL', 'AND', 'B', 'BG', 'BIH', 'BY', 'CH', 'CY', 'CZ', 'D', 'DK', 'E', 'EST',
                      'F', 'FIN', 'FL', 'FO', 'GB', 'GE', 'GR', 'H', 'HR', 'I', 'IR', 'IRL', 'IS', 'L',
                      'LT', 'LV', 'M', 'MA', 'MD', 'MK', 'MNE', 'N', 'NL', 'P', 'PL', 'RO', 'RUS', 'S',
                      'SK', 'SLO', 'SRB', 'TN', 'TR', 'UA',
                    ].map((code) => {
                      const isCovered =
                        currentPolicy.zoneId === 'zone_1_all' ||
                        (currentPolicy.zoneId === 'zone_2_regional' &&
                          ['RUS', 'TR', 'GE', 'IR', 'BY', 'MD', 'UA'].includes(code)) ||
                        (currentPolicy.zoneId === 'zone_3_georgia_turkey' && ['GE', 'TR'].includes(code));

                      return (
                        <div
                          key={code}
                          className={`p-1 rounded border ${
                            isCovered
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-600 line-through'
                          }`}
                        >
                          {code}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Barcode, Security Stamp & Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-emerald-800/40">
                  <div className="flex items-center gap-3">
                    <QrCode className="w-9 h-9 text-emerald-400" />
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block">
                        Şifrəli Təhlükəsizlik Haşı: {currentPolicy.securityHash}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Barkod: {currentPolicy.barcode}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(currentPolicy.policyNumber, 'Yaşıl Kart Nömrəsi')}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {copiedCode === 'Yaşıl Kart Nömrəsi' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Kopyala</span>
                    </button>

                    <button
                      onClick={() => window.print()}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Çap Et (PDF)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DGK BORDER TRANSIT CUSTOMS DECLARATION */}
          {activeTab === 'declaration' && (
            <div className="space-y-6">
              {/* Declaration Form Config */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  DGK "Smart Customs" Müvəqqəti İxrac və Tranzit Bəyannaməsi Parametrləri
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Səfərin Məqsədi
                    </label>
                    <select
                      value={purposeOfVisit}
                      onChange={(e) => setPurposeOfVisit(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="tourism">Turizm və Şəxsi Səyahət</option>
                      <option value="business">Xidməti Ezamiyyət / Biznes</option>
                      <option value="transit">Tranzit Keçid (Naxçıvana / digər ölkəyə)</option>
                      <option value="freight">Kommersiya Yükdaşıması</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Planlaşdırılan Müddət (Gün)
                    </label>
                    <input
                      type="number"
                      value={estimatedDays}
                      onChange={(e) => setEstimatedDays(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                      min={1}
                      max={90}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Bakdakı Yanacaq Həcmi (Litr)
                    </label>
                    <input
                      type="number"
                      value={fuelInTank}
                      onChange={(e) => setFuelInTank(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                      min={5}
                      max={150}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSubmitDeclaration}
                    data-testid="submit-declaration-btn"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Yenilə və Bəyan Et</span>
                  </button>
                </div>
              </div>

              {/* DGK Electronic Voucher Output */}
              <div className="p-6 rounded-3xl bg-slate-950 border border-indigo-500/40 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 block">
                        AZƏRBAYCAN RESPUBLİKASI DÖVLƏT GÖMRÜK KOMİTƏSİ
                      </span>
                      <h4 className="text-base font-bold text-white">
                        Nəqliyyat Vasitəsinin Müvəqqəti Aparılması üzrə Elektron Tranzit Bəyannaməsi
                      </h4>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase text-slate-400 block">Bəyannamə №</span>
                    <span className="font-mono font-bold text-indigo-300 text-sm">
                      {currentDeclaration.declarationNumber}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block">Gömrük Məntəqəsi</span>
                    <span className="font-bold text-white">{currentDeclaration.customsCheckpointName}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block">Təyinat Ölkəsi</span>
                    <span className="font-bold text-indigo-300">{currentDeclaration.destinationCountry}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block">Dövlət Qeydiyyatı</span>
                    <span className="font-mono font-bold text-white">{currentDeclaration.plateNumber}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block">Qayıdış Tarixi</span>
                    <span className="font-bold text-emerald-400">{currentDeclaration.estimatedReturnDate}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
                  <div className="text-slate-400 font-mono text-[11px]">
                    DGK Təhlükəsizlik Kodu: {currentDeclaration.dgkSecurityCode}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(currentDeclaration.declarationNumber, 'DGK Bəyannamə №')}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {copiedCode === 'DGK Bəyannamə №' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Kopyala</span>
                    </button>

                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Çap Et</span>
                    </button>
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

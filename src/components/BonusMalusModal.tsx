import React, { useState, useId, useMemo } from 'react';
import {
  ShieldCheck,
  Calculator,
  Database,
  TableProperties,
  Building2,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Printer,
  Search,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Percent,
  Coins,
  Car,
  Zap,
  Phone,
  Calendar,
  User,
  ExternalLink,
  Info,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import {
  BonusMalusClassId,
  TerritoryZone,
  DriverExperienceCategory,
  Currency,
  BONUS_MALUS_CLASSES,
  calculateCompulsoryPremium,
  getRiskRating,
  generateBonusMalusCertificate,
  STATUTORY_BASE_TARIFF_AZN,
} from '../utils/bonusMalus';
import {
  ACCREDITED_INSURERS,
  MOCK_DRIVER_PROFILES,
  VEHICLE_PRESETS,
  BONUS_MALUS_CLASS_LIST,
  InsurerCompanyInfo,
} from '../data/mockBonusMalusData';

export type BonusMalusTab =
  | 'calculator'
  | 'registry'
  | 'matrix'
  | 'insurers'
  | 'certificate';

interface BonusMalusModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVehicle?: {
    makeModel?: string;
    plate?: string;
    engineCc?: number;
    isElectric?: boolean;
  };
}

export const BonusMalusModal: React.FC<BonusMalusModalProps> = ({
  isOpen,
  onClose,
  initialVehicle,
}) => {
  const finInputId = useId();
  const searchInputId = useId();

  const [activeTab, setActiveTab] = useState<BonusMalusTab>('calculator');
  const [currency, setCurrency] = useState<Currency>('AZN');

  // Calculator state
  const [selectedClass, setSelectedClass] = useState<BonusMalusClassId>('BM_7');
  const [engineDisplacementCc, setEngineDisplacementCc] = useState<number>(
    initialVehicle?.engineCc ?? 1998
  );
  const [isElectric, setIsElectric] = useState<boolean>(
    initialVehicle?.isElectric ?? false
  );
  const [territory, setTerritory] = useState<TerritoryZone>('baku');
  const [experienceCategory, setExperienceCategory] =
    useState<DriverExperienceCategory>('senior_experienced');
  const [atFaultAccidents, setAtFaultAccidents] = useState<number>(0);

  // Registry search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDriver, setSelectedDriver] = useState(MOCK_DRIVER_PROFILES[0]);

  // Matrix simulator state
  const [matrixSimStartingClass, setMatrixSimStartingClass] =
    useState<BonusMalusClassId>('BM_7');
  const [matrixSimAccidents, setMatrixSimAccidents] = useState<number>(0);

  // Insurer filter
  const [insurerFilterQuery, setInsurerFilterQuery] = useState<string>('');

  // UI feedback states
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [callInitiated, setCallInitiated] = useState<string | null>(null);

  // Calculate current premium
  const calculationResult = useMemo(() => {
    return calculateCompulsoryPremium({
      currentClass: selectedClass,
      engineDisplacementCc,
      isElectric,
      territory,
      experienceCategory,
      atFaultAccidentsInPeriod: atFaultAccidents,
    });
  }, [
    selectedClass,
    engineDisplacementCc,
    isElectric,
    territory,
    experienceCategory,
    atFaultAccidents,
  ]);

  // Matrix simulation result
  const matrixSimResult = useMemo(() => {
    return calculateCompulsoryPremium({
      currentClass: matrixSimStartingClass,
      engineDisplacementCc: 2000,
      territory: 'baku',
      experienceCategory: 'senior_experienced',
      atFaultAccidentsInPeriod: matrixSimAccidents,
    });
  }, [matrixSimStartingClass, matrixSimAccidents]);

  // Certificate generation
  const activeCertificate = useMemo(() => {
    return generateBonusMalusCertificate(
      selectedDriver,
      initialVehicle?.plate || selectedDriver.assignedPlate,
      selectedDriver.activeInsurer
    );
  }, [selectedDriver, initialVehicle]);

  // Filtered drivers for registry search
  const filteredDrivers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return MOCK_DRIVER_PROFILES;
    return MOCK_DRIVER_PROFILES.filter(
      (d) =>
        d.fin.toLowerCase().includes(q) ||
        d.fullName.toLowerCase().includes(q) ||
        d.licenseSeriesNumber.toLowerCase().includes(q) ||
        (d.assignedPlate && d.assignedPlate.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  // Filtered insurers
  const filteredInsurers = useMemo(() => {
    const q = insurerFilterQuery.trim().toLowerCase();
    if (!q) return ACCREDITED_INSURERS;
    return ACCREDITED_INSURERS.filter(
      (i) =>
        i.nameAz.toLowerCase().includes(q) ||
        i.shortName.toLowerCase().includes(q) ||
        i.hotline.toLowerCase().includes(q)
    );
  }, [insurerFilterQuery]);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleSimulateCall = (phone: string) => {
    setCallInitiated(phone);
    setTimeout(() => setCallInitiated(null), 3000);
  };

  const getCurrencySymbol = (curr: Currency): string => {
    switch (curr) {
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      default:
        return '₼';
    }
  };

  const getDisplayPremium = (result: typeof calculationResult): number => {
    switch (currency) {
      case 'USD':
        return result.finalPremiumUsd;
      case 'EUR':
        return result.finalPremiumEur;
      default:
        return result.finalPremiumAzn;
    }
  };

  const risk = getRiskRating(selectedClass);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bonus-malus-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-5xl my-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="bonus-malus-modal-title"
                  className="text-lg font-bold text-slate-900 dark:text-white"
                >
                  AMB & İSB Bonus-Malus Reyestri
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Mərkəzi Bank Standartı
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                İcbari avtomobil sığortası (AVSMMİS) 14 sinifli rəsmi əmsal şkalası və zərərlilik reyestri
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Currency toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-xs font-semibold">
              {(['AZN', 'USD', 'EUR'] as Currency[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    currency === c
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Bağla"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 overflow-x-auto shrink-0 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'calculator'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Kalkulyator & Tarif</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('registry')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'registry'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>İSB Vahid Reyestr (FİN)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'matrix'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TableProperties className="w-4 h-4" />
            <span>14 Sinifli Matris</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('insurers')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'insurers'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Akkreditə Sığortaçılar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('certificate')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'certificate'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Rəsmi Arayış</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* TAB 1: CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              {/* Quick Preset Selector */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
                  Avtomobil Modelləri Üzrə Sürətli Seçim:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {VEHICLE_PRESETS.map((vp) => (
                    <button
                      key={vp.id}
                      type="button"
                      onClick={() => {
                        setEngineDisplacementCc(vp.engineDisplacementCc);
                        setIsElectric(vp.isElectric);
                        setTerritory(vp.territory);
                      }}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50 dark:bg-slate-800/40 text-left transition-all group"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white truncate">
                        {vp.isElectric ? (
                          <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        ) : (
                          <Car className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        )}
                        <span className="truncate">{vp.make}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {vp.model}
                      </p>
                      <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-100/60 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-medium">
                        {vp.isElectric ? 'Elektrik EV' : `${vp.engineDisplacementCc} sm³`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Inputs Column */}
                <div className="md:col-span-2 space-y-4">
                  <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Calculator className="w-4 h-4 text-blue-500" />
                      Qanuni Sığorta Parametrləri
                    </h3>

                    {/* Class Selector */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Mövcud Bonus-Malus Sinfi:
                        </label>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                          {selectedClass} ({BONUS_MALUS_CLASSES[selectedClass].coefficient}x)
                        </span>
                      </div>
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value as BonusMalusClassId)}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {BONUS_MALUS_CLASS_LIST.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name} — {cls.coefficient}x (
                            {cls.discountOrSurchargePercent > 0
                              ? `+${cls.discountOrSurchargePercent}% əlavə`
                              : cls.discountOrSurchargePercent < 0
                              ? `${cls.discountOrSurchargePercent}% endirim`
                              : 'Baza standart'}
                            ) — {cls.descriptionAz}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Engine Displacement & Electric Toggle */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Mühərrik Həcmi:
                          </label>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {isElectric ? 'Elektromobil (1.0x)' : `${engineDisplacementCc} sm³`}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={800}
                          max={5500}
                          step={50}
                          disabled={isElectric}
                          value={engineDisplacementCc}
                          onChange={(e) => setEngineDisplacementCc(Number(e.target.value))}
                          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-40"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                          <span>800 sm³</span>
                          <span>2500 sm³</span>
                          <span>5500+ sm³</span>
                        </div>
                      </div>

                      <div className="flex flex-col justify-end">
                        <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isElectric}
                            onChange={(e) => setIsElectric(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <div className="text-xs">
                            <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                              <Zap className="w-3.5 h-3.5 text-amber-500" />
                              Tam Elektrik (EV)
                            </span>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              Mühərrik əmsalı minimum 1.00x hesablanır
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Territory & Driver Experience */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                          Qeydiyyat Ərazisi (Zona):
                        </label>
                        <select
                          value={territory}
                          onChange={(e) => setTerritory(e.target.value as TerritoryZone)}
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="baku">Bakı şəhəri (1.10x)</option>
                          <option value="absheron_sumgayit">Abşeron / Sumqayıt (1.05x)</option>
                          <option value="ganja">Gəncə şəhəri (1.00x)</option>
                          <option value="other_regions">Digər rayonlar (0.95x)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                          Sürücü Yaşı və Təcrübəsi:
                        </label>
                        <select
                          value={experienceCategory}
                          onChange={(e) =>
                            setExperienceCategory(e.target.value as DriverExperienceCategory)
                          }
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="senior_experienced">Yaş ≥ 25, Təcrübə ≥ 1 il (1.00x)</option>
                          <option value="young_experienced">Yaş &lt; 25, Təcrübə ≥ 1 il (1.20x)</option>
                          <option value="senior_novice">Yaş ≥ 25, Təcrübə &lt; 1 il (1.25x)</option>
                          <option value="young_novice">Yaş &lt; 25, Təcrübə &lt; 1 il (1.35x)</option>
                        </select>
                      </div>
                    </div>

                    {/* Claims in current term */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Cari Müqavilə Dövründə Törədilmiş Qəza Sayı:
                        </label>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {atFaultAccidents} qəza (Növbəti il: {calculationResult.nextProjectedClass})
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {[0, 1, 2, 3].map((acc) => (
                          <button
                            key={acc}
                            type="button"
                            onClick={() => setAtFaultAccidents(acc)}
                            className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                              atFaultAccidents === acc
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            {acc === 3 ? '3+ Qəza' : `${acc} Qəza`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calculation Summary Card */}
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-indigo-900/50 shadow-xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs uppercase tracking-wider text-indigo-300 font-bold">
                        İllik İcbari Sığorta Haqqı
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                        {selectedClass}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-4xl font-extrabold tracking-tight">
                        {getDisplayPremium(calculationResult)}
                      </span>
                      <span className="text-xl font-bold text-indigo-300">
                        {getCurrencySymbol(currency)}
                      </span>
                    </div>

                    {/* Difference vs Base BM 7 */}
                    <div className="flex items-center gap-2 mb-4 text-xs">
                      {calculationResult.differenceVsBasePercent < 0 ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                          <TrendingDown className="w-3.5 h-3.5" />
                          {Math.abs(calculationResult.differenceVsBasePercent)}% Qəzasızlıq Endirimi
                        </span>
                      ) : calculationResult.differenceVsBasePercent > 0 ? (
                        <span className="flex items-center gap-1 text-rose-400 font-semibold">
                          <TrendingUp className="w-3.5 h-3.5" />
                          +{calculationResult.differenceVsBasePercent}% Malus Əlavəsi
                        </span>
                      ) : (
                        <span className="text-slate-300 font-semibold">
                          Baza Standart Qiymət (0%)
                        </span>
                      )}
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-2 pt-3 border-t border-indigo-800/60 text-xs">
                      <div className="flex justify-between text-indigo-200">
                        <span>Baza Dövlət Tarifi:</span>
                        <span className="font-semibold">{STATUTORY_BASE_TARIFF_AZN} AZN</span>
                      </div>
                      <div className="flex justify-between text-indigo-200">
                        <span>Mühərrik Əmsalı (kₘ):</span>
                        <span className="font-semibold">{calculationResult.engineCoefficient}x</span>
                      </div>
                      <div className="flex justify-between text-indigo-200">
                        <span>Ərazi Əmsalı (kₜ):</span>
                        <span className="font-semibold">{calculationResult.territoryCoefficient}x</span>
                      </div>
                      <div className="flex justify-between text-indigo-200">
                        <span>Təcrübə Əmsalı (kₛ):</span>
                        <span className="font-semibold">{calculationResult.experienceCoefficient}x</span>
                      </div>
                      <div className="flex justify-between text-indigo-200">
                        <span>Bonus-Malus Əmsalı (k_bm):</span>
                        <span className="font-semibold">{calculationResult.bonusMalusCoefficient}x</span>
                      </div>
                    </div>

                    {/* Next renewal forecast */}
                    <div className="mt-4 p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Növbəti il sinfi:</span>
                      </div>
                      <span className="font-bold text-amber-300">
                        {calculationResult.nextProjectedClass} ({calculationResult.nextProjectedCoefficient}x)
                      </span>
                    </div>
                  </div>

                  {/* Coverage Limits */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-2">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      Qanuni Təminat Limitləri (Maksimum)
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Əmlaka dəyən zərər (1 avto):</span>
                      <span className="font-semibold text-slate-900 dark:text-white">5,000 AZN</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Əmlaka ümumi limit (1 qəza):</span>
                      <span className="font-semibold text-slate-900 dark:text-white">25,000 AZN</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Sağlamlığa zərər (1 nəfər):</span>
                      <span className="font-semibold text-slate-900 dark:text-white">5,000 AZN</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ISB UNIFIED REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-6">
              {/* Search Box & Driver Presets */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <label
                  htmlFor={finInputId}
                  className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Search className="w-4 h-4 text-blue-500" />
                  İSB Vahid Məlumat Bazası üzrə Sürücü Axtarışı
                </label>
                <div className="relative">
                  <input
                    id={finInputId}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Sürücünün FİN kodunu, lisenziya nömrəsini və ya dövlət nömrə nişanını daxil edin..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>

                {/* Preset Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pt-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    Test Dossyelər:
                  </span>
                  {MOCK_DRIVER_PROFILES.map((driver) => (
                    <button
                      key={driver.fin}
                      type="button"
                      onClick={() => {
                        setSelectedDriver(driver);
                        setSelectedClass(driver.currentClass);
                      }}
                      className={`px-2.5 py-1 text-xs rounded-lg border whitespace-nowrap transition-all ${
                        selectedDriver.fin === driver.fin
                          ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-sm'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {driver.fullName.split(' ')[0]} ({driver.currentClass})
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Driver Profile Dossier */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg border border-blue-200 dark:border-blue-800">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {selectedDriver.fullName}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>FİN: <strong className="text-slate-700 dark:text-slate-200">{selectedDriver.fin}</strong></span>
                        <span>•</span>
                        <span>Vəsiqə: <strong className="text-slate-700 dark:text-slate-200">{selectedDriver.licenseSeriesNumber}</strong></span>
                        <span>•</span>
                        <span>Avto: <strong className="text-slate-700 dark:text-slate-200">{selectedDriver.assignedPlate}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      Sinf: {selectedDriver.currentClass} ({BONUS_MALUS_CLASSES[selectedDriver.currentClass].coefficient}x)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedClass(selectedDriver.currentClass);
                        setActiveTab('calculator');
                      }}
                      className="px-3 py-1 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Kalkulyatora Yüklə
                    </button>
                  </div>
                </div>

                {/* Driver Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 block mb-1">
                      Qəzasız İllər:
                    </span>
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      {selectedDriver.consecutiveClaimFreeYears} il
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 block mb-1">
                      Ümumi Hadisə Sayı:
                    </span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {selectedDriver.totalClaimsCount} hadisə
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 block mb-1">
                      Aktiv Sığortaçı:
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                      {selectedDriver.activeInsurer}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 block mb-1">
                      Polis Bitmə Tarixi:
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {selectedDriver.policyExpiryDate}
                    </span>
                  </div>
                </div>

                {/* Claims History */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    İSB Qeydiyyatlı Qəza və Zərərlilik Tarixçəsi
                  </h4>

                  {selectedDriver.claims.length === 0 ? (
                    <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center gap-3 text-xs text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <div>
                        <span className="font-bold">Zərər Qeydiyyatı Yoxdur:</span> Bu sürücü üçün son illər ərzində heç bir təqsirli yol-nəqliyyat hadisəsi qeydə alınmayıb. Nümunəvi qəzasız idarəetmə statusu qorunur.
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedDriver.claims.map((claim) => (
                        <div
                          key={claim.id}
                          className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {claim.claimNumber} • {claim.id}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                {claim.driverFaultPercent}% Təqsir dərəcəsi
                              </span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400">
                              Tarix: {claim.accidentDate} • Yer: {claim.accidentLocation} • Sığortaçı: {claim.insurerName}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs text-slate-500 dark:text-slate-400 block">
                              Ödənilmiş Təzminat:
                            </span>
                            <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                              {claim.payoutAmountAzn} AZN
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 14-CLASS MATRIX & TRANSITION SIMULATOR */}
          {activeTab === 'matrix' && (
            <div className="space-y-6">
              {/* Simulator Bar */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    Başlanğıc Sinfi:
                  </span>
                  <select
                    value={matrixSimStartingClass}
                    onChange={(e) =>
                      setMatrixSimStartingClass(e.target.value as BonusMalusClassId)
                    }
                    className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold"
                  >
                    {BONUS_MALUS_CLASS_LIST.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.coefficient}x)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    Qəza Sayı:
                  </span>
                  {[0, 1, 2, 3].map((acc) => (
                    <button
                      key={acc}
                      type="button"
                      onClick={() => setMatrixSimAccidents(acc)}
                      className={`px-2.5 py-1 text-xs rounded-lg border font-semibold transition-all ${
                        matrixSimAccidents === acc
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {acc === 3 ? '3+' : acc}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white bg-blue-50 dark:bg-blue-950/50 px-3 py-2 rounded-xl border border-blue-200 dark:border-blue-800 w-full sm:w-auto justify-center">
                  <span>Nəticə Sinif:</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-blue-600 dark:text-blue-400 font-extrabold text-sm">
                    {matrixSimResult.nextProjectedClass} ({matrixSimResult.nextProjectedCoefficient}x)
                  </span>
                </div>
              </div>

              {/* 14 Class Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {BONUS_MALUS_CLASS_LIST.map((cls) => {
                  const isCurrent = matrixSimStartingClass === cls.id;
                  const isDestination = matrixSimResult.nextProjectedClass === cls.id;

                  return (
                    <div
                      key={cls.id}
                      onClick={() => setMatrixSimStartingClass(cls.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all relative ${
                        isDestination
                          ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/50 shadow-md'
                          : isCurrent
                          ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {isDestination && (
                        <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-600 text-white shadow-sm">
                          Hədəf
                        </span>
                      )}

                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {cls.name}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            cls.type === 'bonus'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                              : cls.type === 'malus'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {cls.coefficient}x
                        </span>
                      </div>

                      <div className="text-xs mb-2">
                        {cls.discountOrSurchargePercent < 0 ? (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {cls.discountOrSurchargePercent}% Qanuni Endirim
                          </span>
                        ) : cls.discountOrSurchargePercent > 0 ? (
                          <span className="font-semibold text-rose-600 dark:text-rose-400">
                            +{cls.discountOrSurchargePercent}% Malus Əlavəsi
                          </span>
                        ) : (
                          <span className="font-semibold text-slate-600 dark:text-slate-400">
                            Baza Standart Qiymət
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {cls.descriptionAz}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: ACCREDITED INSURERS RADAR */}
          {activeTab === 'insurers' && (
            <div className="space-y-6">
              {/* Search Insurers */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="relative w-full sm:w-80">
                  <input
                    type="text"
                    value={insurerFilterQuery}
                    onChange={(e) => setInsurerFilterQuery(e.target.value)}
                    placeholder="Sığorta şirkəti və ya qaynar xətt axtar..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Bütün sığortaçılar İcbari Sığorta Bürosunun (İSB) rəsmi üzvüdür
                </div>
              </div>

              {/* Insurers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredInsurers.map((ins) => (
                  <div
                    key={ins.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4 hover:border-blue-400 dark:hover:border-blue-600 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                          {ins.logoBadge}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            {ins.nameAz}
                          </h3>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Lisenziya: {ins.licenseNumber}
                          </span>
                        </div>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {ins.marketSharePercent}% Pay
                      </span>
                    </div>

                    {/* Progress Bar for Claims Payout Solvency */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                        <span>Zərər Ödənişi Əmsalı (Solvency):</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {ins.claimsPayoutRatioPercent}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${ins.claimsPayoutRatioPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Baş Ofis:</span>
                        <span className="truncate block font-medium text-slate-700 dark:text-slate-300">
                          {ins.headquartersAz}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Qəza Xidməti:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {ins.workingHours}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleSimulateCall(ins.hotline)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          callInitiated === ins.hotline
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                        }`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>
                          {callInitiated === ins.hotline
                            ? 'Zəng qovşağına qoşuldu...'
                            : `Qaynar Xətt: ${ins.hotline}`}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopy(ins.directPhone, ins.id)}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Nömrəni kopyala"
                      >
                        {copiedCode === ins.id ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: OFFICIAL CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-6">
              {/* Certificate Canvas */}
              <div
                id="amb-bms-certificate"
                className="p-6 sm:p-8 rounded-2xl border-2 border-blue-600/30 bg-gradient-to-b from-white via-blue-50/20 to-white dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-900 shadow-xl space-y-6 relative overflow-hidden"
              >
                {/* Background watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
                  <ShieldCheck className="w-96 h-96 text-blue-600" />
                </div>

                {/* Certificate Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b-2 border-slate-200 dark:border-slate-800 text-center sm:text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                        Azərbaycan Respublikasının Mərkəzi Bankı
                      </h3>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
                        İcbari Sığorta Bürosu (İSB) Elektron Məlumat Sistemi
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Bonus-Malus Sinfinə Dair Rəsmi Elektron Arayış
                      </p>
                    </div>
                  </div>

                  <div className="text-center sm:text-right">
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">
                      Arayış Qeydiyyat Nömrəsi:
                    </span>
                    <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                      {activeCertificate.certificateNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Tarix: {activeCertificate.issueDate}
                    </span>
                  </div>
                </div>

                {/* Certificate Body Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                      Sürücünün Şəxsi Məlumatları
                    </span>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Tam Adı:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {activeCertificate.driver.fullName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Fərdi Kod (FİN):</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {activeCertificate.driver.fin}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Sürücülük Vəsiqəsi:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {activeCertificate.driver.licenseSeriesNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Təhkim Olunmuş DQN:</span>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {activeCertificate.driver.assignedPlate}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                      Təsdiqlənmiş Bonus-Malus Göstəriciləri
                    </span>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400">Cari Sinif:</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                        {activeCertificate.classInfo.name} ({activeCertificate.classInfo.coefficient}x)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Qanuni Güzəşt / Əlavə:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {activeCertificate.classInfo.discountOrSurchargePercent}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Qəzasız Staj:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {activeCertificate.driver.consecutiveClaimFreeYears} ardıcıl il
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Etibarlılıq Müddəti:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {activeCertificate.validUntil} tarixinədək
                      </span>
                    </div>
                  </div>
                </div>

                {/* Security Footer */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono block">
                      Rəqəmsal İmzalanma İdentifikatoru (SİMA / AMB):
                    </span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 break-all font-semibold">
                      {activeCertificate.verificationHash}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(activeCertificate.certificateNumber, 'cert-num')}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      {copiedCode === 'cert-num' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Kopyalandı</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Nömrəni Kopyala</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
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

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between shrink-0 text-xs">
          <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-500" />
            <span>Məlumatlar İcbari Sığorta Bürosu (İSB) bazası ilə sinxronlaşdırılmışdır.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 font-semibold transition-colors"
          >
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { Vehicle, Currency, Language } from '../types/vehicle';
import { formatPrice } from '../utils/i18n';
import { calculateTcoReport, exportTcoToCsv, DEFAULT_FUEL_PRICES } from '../utils/tco';
import {
  X,
  Coins,
  TrendingDown,
  Fuel,
  ShieldCheck,
  Wrench,
  Receipt,
  Download,
  Copy,
  Check,
  Sparkles,
  Info,
  Car,
  Zap,
  Gauge,
  SlidersHorizontal,
} from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock';
import { useKeyPress } from '../hooks/useKeyPress';
import { toastManager } from '../hooks/useToast';

export interface TcoForecasterModalProps {
  isOpen?: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  currency: Currency;
  lang: Language;
}

const I18N = {
  az: {
    modalTitle: '5-İllik Sahiblik Xərci Proqnozu (TCO)',
    modalSubtitle: 'Avtomobilin real maya dəyəri: Dəyər itkisi, yanacaq, sığorta, servis və vergilər',
    tabSummary: 'Xərc Strukturu & Analitika',
    tabMatrix: 'İllik Dinamik Matris',
    totalTcoCost: 'Toplam Sahiblik Xərci',
    avgMonthlyCost: 'Aylıq Real Xərc',
    costPerKm: 'Km Başına Xərc',
    residualValue: 'Qalıq Bazar Dəyəri',
    annualMileage: 'İllik Yürüş (km/il)',
    ownershipTerm: 'Sahiblik Müddəti',
    includeKasko: 'Tam KASKO Sığorta',
    kaskoDesc: 'KASKO sığorta daxil edildikdə illik avtomobil dəyərinin ~2.5%-i hesablanır',
    costComposition: 'Xərc Komponentlərinin Bölgüsü',
    biggestCostDriver: 'Ən böyük xərc amili',
    colYear: 'İl',
    colDepreciation: 'Dəyər İtkisi',
    colFuel: 'Yanacaq / Enerji',
    colInsurance: 'Sığorta',
    colMaintenance: 'Servis',
    colTaxes: 'Vergilər',
    colAnnualTotal: 'İllik Cəmi',
    colCumulative: 'Kümülatif Cəmi',
    colResidual: 'İl Sonu Dəyəri',
    exportCsv: 'CSV İxrac et',
    copyCsv: 'Cədvəli Kopyala',
    copied: 'Kopyalandı!',
    aiInsightTitle: 'AutoNext Maliyyə Məsləhətçisi',
    evSavingsTip: 'Elektrik mühərriki ənənəvi benzinə nisbətən yanacaq və servis xərclərində 60%-ə qədər qənaət təmin edir.',
    hybridTip: 'Hibrid mühərrik şəhər içi tıxaclarda yanacaq xərcini əhəmiyyətli dərəcədə azaldır və yüksək likvidlik saxlayır.',
    iceTip: 'Avtomobilin mütəmadi rəsmi servisdə qulluq olunması 5 ildən sonra qalıq dəyərini 15%-dək yüksək saxlayacaq.',
    noVehicle: 'Seçilmiş avtomobil yoxdur.',
  },
  en: {
    modalTitle: '5-Year Total Cost of Ownership (TCO)',
    modalSubtitle: 'True cost of vehicle ownership: Depreciation, energy, insurance, service & taxes',
    tabSummary: 'Cost Structure & Analytics',
    tabMatrix: 'Annual Dynamic Matrix',
    totalTcoCost: 'Total Cost of Ownership',
    avgMonthlyCost: 'Average Monthly Cost',
    costPerKm: 'Cost per Kilometer',
    residualValue: 'Projected Residual Value',
    annualMileage: 'Annual Driving (km/year)',
    ownershipTerm: 'Ownership Duration',
    includeKasko: 'Comprehensive KASKO Insurance',
    kaskoDesc: 'Calculates ~2.5% of annual vehicle market value when KASKO is enabled',
    costComposition: 'Expense Breakdown by Category',
    biggestCostDriver: 'Primary Cost Driver',
    colYear: 'Year',
    colDepreciation: 'Depreciation',
    colFuel: 'Fuel / Energy',
    colInsurance: 'Insurance',
    colMaintenance: 'Maintenance',
    colTaxes: 'Taxes & Fees',
    colAnnualTotal: 'Annual Total',
    colCumulative: 'Cumulative Cost',
    colResidual: 'Year-End Value',
    exportCsv: 'Export CSV',
    copyCsv: 'Copy Table',
    copied: 'Copied!',
    aiInsightTitle: 'AutoNext Financial Insight',
    evSavingsTip: 'Electric powertrain cuts fuel and scheduled maintenance expenditures by up to 60%.',
    hybridTip: 'Hybrid efficiency significantly reduces urban commuting expenses while preserving resale value.',
    iceTip: 'Documented routine maintenance preserves up to 15% higher residual value at 5-year trade-in.',
    noVehicle: 'No vehicle selected.',
  },
  ru: {
    modalTitle: 'Прогноз стоимости владения (TCO на 5 лет)',
    modalSubtitle: 'Реальная стоимость владения: амортизация, топливо, страховка, ТО и налоги',
    tabSummary: 'Структура расходов и аналитика',
    tabMatrix: 'Годовая динамическая матрица',
    totalTcoCost: 'Общая стоимость владения',
    avgMonthlyCost: 'Средний расход в месяц',
    costPerKm: 'Стоимость за километр',
    residualValue: 'Остаточная рыночная стоимость',
    annualMileage: 'Годовой пробег (км/год)',
    ownershipTerm: 'Срок владения',
    includeKasko: 'Полное КАСКО',
    kaskoDesc: 'При включении КАСКО рассчитывается ~2.5% от рыночной стоимости автомобиля в год',
    costComposition: 'Распределение расходов по категориям',
    biggestCostDriver: 'Основная статья расходов',
    colYear: 'Год',
    colDepreciation: 'Амортизация',
    colFuel: 'Топливо / Энергия',
    colInsurance: 'Страховка',
    colMaintenance: 'Обслуживание',
    colTaxes: 'Налоги и сборы',
    colAnnualTotal: 'Итого за год',
    colCumulative: 'Накопительный итог',
    colResidual: 'Остаток стоимости',
    exportCsv: 'Экспорт в CSV',
    copyCsv: 'Копировать таблицу',
    copied: 'Скопировано!',
    aiInsightTitle: 'Финансовый анализ AutoNext',
    evSavingsTip: 'Электромобиль экономит до 60% расходов на заправку и плановое техническое обслуживание.',
    hybridTip: 'Гибридный привод ощутимо снижает расходы в городских пробках и сохраняет высокую ликвидность.',
    iceTip: 'Регулярное сертифицированное ТО сохраняет остаточную стоимость автомобиля при перепродаже на 15% выше.',
    noVehicle: 'Автомобиль не выбран.',
  },
};

export const TcoForecasterModal: React.FC<TcoForecasterModalProps> = ({
  isOpen = true,
  onClose,
  vehicle,
  currency,
  lang,
}) => {
  const isModalOpen = isOpen && !!vehicle;
  useScrollLock(isModalOpen);
  useKeyPress('Escape', onClose);

  const [annualMileageKm, setAnnualMileageKm] = useState<number>(15000);
  const [includeKasko, setIncludeKasko] = useState<boolean>(false);
  const [ownershipYears, setOwnershipYears] = useState<number>(5);
  const [activeTab, setActiveTab] = useState<'summary' | 'matrix'>('summary');
  const [isCopied, setIsCopied] = useState(false);

  const t = I18N[lang] || I18N.az;

  const tcoReport = useMemo(() => {
    if (!vehicle) return null;
    return calculateTcoReport({
      vehiclePrice: vehicle.priceAzn,
      annualMileageKm,
      fuelType: vehicle.fuelType,
      fuelConsumptionLPer100Km: vehicle.fuelConsumptionLPer100Km,
      engineVolumeLiters: vehicle.engineVolumeLiters,
      isElectric: vehicle.fuelType === 'electric',
      includeKasko,
      make: vehicle.make,
      ownershipYears,
    });
  }, [vehicle, annualMileageKm, includeKasko, ownershipYears]);

  if (!isModalOpen || !vehicle || !tcoReport) return null;

  const handleCopyCsv = async () => {
    try {
      const csv = exportTcoToCsv(tcoReport, currency, vehicle.title);
      await navigator.clipboard.writeText(csv);
      setIsCopied(true);
      toastManager.add(t.copied, 'success');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toastManager.add('Clipboard error', 'error');
    }
  };

  const handleDownloadCsv = () => {
    try {
      const csv = exportTcoToCsv(tcoReport, currency, vehicle.title);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `TCO_${vehicle.make}_${vehicle.model}_${ownershipYears}yr.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toastManager.add('CSV exported', 'success');
    } catch {
      toastManager.add('Export failed', 'error');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      data-testid="tco-forecaster-modal"
    >
      <div
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={t.modalTitle}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/60 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white shadow-lg shadow-rose-600/25">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">{t.modalTitle}</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{t.modalSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCsv}
              title={t.copyCsv}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              data-testid="tco-copy-csv-btn"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleDownloadCsv}
              title={t.exportCsv}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              data-testid="tco-download-csv-btn"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              data-testid="tco-close-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total TCO Cost */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/40 to-slate-950/60 border border-rose-800/40 relative overflow-hidden">
              <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider block">
                {t.totalTcoCost} ({ownershipYears} {lang === 'az' ? 'il' : lang === 'ru' ? 'л.' : 'yr'})
              </span>
              <div
                className="text-xl sm:text-2xl font-black text-white mt-1"
                data-testid="tco-total-cost"
              >
                {formatPrice(tcoReport.totalCost, currency)}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {formatPrice(vehicle.priceAzn, currency)} ilkin alış
              </span>
            </div>

            {/* Average Monthly Cost */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 to-slate-950/60 border border-amber-800/40 relative overflow-hidden">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                {t.avgMonthlyCost}
              </span>
              <div
                className="text-xl sm:text-2xl font-black text-white mt-1"
                data-testid="tco-monthly-cost"
              >
                {formatPrice(tcoReport.averageMonthlyCost, currency)}
                <span className="text-xs text-slate-400 font-normal"> /ay</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {ownershipYears * 12} ay üzrə orta xərc
              </span>
            </div>

            {/* Cost Per Km */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/40 to-slate-950/60 border border-blue-800/40 relative overflow-hidden">
              <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider block">
                {t.costPerKm}
              </span>
              <div
                className="text-xl sm:text-2xl font-black text-white mt-1"
                data-testid="tco-per-km-cost"
              >
                {tcoReport.costPerKm}{' '}
                <span className="text-xs text-slate-400 font-normal">
                  {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₼'}/km
                </span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {annualMileageKm.toLocaleString()} km/il yürüşlə
              </span>
            </div>

            {/* Projected Residual Value */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-950/60 border border-emerald-800/40 relative overflow-hidden">
              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
                {t.residualValue}
              </span>
              <div
                className="text-xl sm:text-2xl font-black text-white mt-1"
                data-testid="tco-residual-value"
              >
                {formatPrice(tcoReport.residualValueEnd, currency)}
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">
                ≈ {Math.round((tcoReport.residualValueEnd / vehicle.priceAzn) * 100)}% ilkin dəyər
              </span>
            </div>
          </div>

          {/* Interactive Simulation Controls */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <SlidersHorizontal className="w-4 h-4 text-rose-400" />
                <span>Simulyasiya Parametrləri</span>
              </div>

              {/* Ownership Term Selector */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                {[1, 3, 5].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setOwnershipYears(yr)}
                    data-testid={`tco-term-btn-${yr}`}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      ownershipYears === yr
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {yr} {lang === 'az' ? 'İl' : lang === 'ru' ? 'Год' : 'Yr'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Annual Mileage Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">{t.annualMileage}</span>
                  <span className="text-white font-mono bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700">
                    {annualMileageKm.toLocaleString()} km
                  </span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="40000"
                  step="1000"
                  value={annualMileageKm}
                  onChange={(e) => setAnnualMileageKm(Number(e.target.value))}
                  data-testid="tco-mileage-slider"
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>5,000 km</span>
                  <span>15,000 km (Orta)</span>
                  <span>40,000 km</span>
                </div>
              </div>

              {/* KASKO Toggle Switch */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="space-y-0.5 pr-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    <span>{t.includeKasko}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{t.kaskoDesc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIncludeKasko(!includeKasko)}
                  data-testid="tco-kasko-toggle"
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                    includeKasko ? 'bg-blue-600 justify-end' : 'bg-slate-800 justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-md"></span>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs (Summary vs Matrix) */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('summary')}
              data-testid="tco-tab-summary"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'summary'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {t.tabSummary}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              data-testid="tco-tab-matrix"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'matrix'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {t.tabMatrix}
            </button>
          </div>

          {/* Tab 1: Cost Structure & Analytics */}
          {activeTab === 'summary' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Stacked Proportional Cost Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>{t.costComposition}</span>
                  <span className="text-[11px] text-slate-400">
                    {t.biggestCostDriver}:{' '}
                    <strong className="text-rose-400">
                      {tcoReport.biggestDriver.percentage}% (
                      {formatPrice(tcoReport.biggestDriver.amount, currency)})
                    </strong>
                  </span>
                </div>

                <div
                  className="w-full h-4 rounded-xl overflow-hidden flex bg-slate-950 border border-slate-800 p-0.5 gap-0.5"
                  data-testid="tco-stacked-bar"
                >
                  {tcoReport.categories.map((cat) => {
                    if (cat.percentage <= 0) return null;
                    return (
                      <div
                        key={cat.category}
                        style={{ width: `${cat.percentage}%` }}
                        className={`h-full ${cat.bgClass} rounded-sm transition-all duration-500`}
                        title={`${cat.label}: ${cat.percentage}% (${formatPrice(cat.totalAmount, currency)})`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Detailed Category Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {tcoReport.categories.map((cat) => {
                  let IconComponent = Coins;
                  if (cat.category === 'depreciation') IconComponent = TrendingDown;
                  if (cat.category === 'fuel') IconComponent = vehicle.fuelType === 'electric' ? Zap : Fuel;
                  if (cat.category === 'insurance') IconComponent = ShieldCheck;
                  if (cat.category === 'maintenance') IconComponent = Wrench;
                  if (cat.category === 'taxes') IconComponent = Receipt;

                  return (
                    <div
                      key={cat.category}
                      className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="p-1.5 rounded-lg text-white"
                            style={{ backgroundColor: cat.color }}
                          >
                            <IconComponent className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-white line-clamp-1">
                            {cat.label}
                          </span>
                        </div>
                        <span className="text-xs font-black text-slate-300">
                          {cat.percentage}%
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between pt-1 border-t border-slate-900">
                        <span className="text-sm sm:text-base font-black text-white">
                          {formatPrice(cat.totalAmount, currency)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ≈ {formatPrice(Math.round(cat.totalAmount / (ownershipYears * 12)), currency)}/ay
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* AI Advice & Smart Tip Box */}
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-800/30 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-slate-300 space-y-1">
                  <strong className="text-rose-300 block font-bold">{t.aiInsightTitle}</strong>
                  <p className="leading-relaxed">
                    {vehicle.fuelType === 'electric'
                      ? t.evSavingsTip
                      : vehicle.fuelType === 'hybrid'
                      ? t.hybridTip
                      : t.iceTip}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Dynamic Yearly Matrix */}
          {activeTab === 'matrix' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
                <table className="w-full text-left text-xs border-collapse" data-testid="tco-matrix-table">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="p-3">{t.colYear}</th>
                      <th className="p-3">{t.colDepreciation}</th>
                      <th className="p-3">{t.colFuel}</th>
                      <th className="p-3">{t.colInsurance}</th>
                      <th className="p-3">{t.colMaintenance}</th>
                      <th className="p-3">{t.colTaxes}</th>
                      <th className="p-3 text-rose-400 font-black">{t.colAnnualTotal}</th>
                      <th className="p-3 font-black text-white">{t.colCumulative}</th>
                      <th className="p-3 text-emerald-400">{t.colResidual}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {tcoReport.yearlyBreakdown.map((row) => {
                      const isHighlighted = row.year <= ownershipYears;
                      return (
                        <tr
                          key={row.year}
                          className={`hover:bg-slate-900/60 transition-colors ${
                            isHighlighted ? 'bg-transparent' : 'opacity-40'
                          }`}
                        >
                          <td className="p-3 font-bold text-white">
                            {lang === 'az' ? `${row.year}-ci il` : `Year ${row.year}`}
                          </td>
                          <td className="p-3 text-rose-300">
                            {formatPrice(row.depreciation, currency)}
                          </td>
                          <td className="p-3 text-amber-300">{formatPrice(row.fuel, currency)}</td>
                          <td className="p-3 text-blue-300">{formatPrice(row.insurance, currency)}</td>
                          <td className="p-3 text-emerald-300">
                            {formatPrice(row.maintenance, currency)}
                          </td>
                          <td className="p-3 text-violet-300">{formatPrice(row.taxes, currency)}</td>
                          <td className="p-3 font-bold text-rose-400">
                            {formatPrice(row.totalAnnualCost, currency)}
                          </td>
                          <td className="p-3 font-black text-white">
                            {formatPrice(row.cumulativeCost, currency)}
                          </td>
                          <td className="p-3 font-semibold text-emerald-400">
                            {formatPrice(row.vehicleValueAtYearEnd, currency)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

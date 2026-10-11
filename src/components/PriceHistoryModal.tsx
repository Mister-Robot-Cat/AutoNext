import React, { useState, useMemo } from 'react';
import { Vehicle, Currency, Language } from '../types/vehicle';
import { formatPrice } from '../utils/i18n';
import { 
  generatePriceHistory, 
  PriceHistoryEvent, 
  getLocalizedMonth 
} from '../utils/priceHistory';
import { 
  X, 
  TrendingDown, 
  TrendingUp, 
  Minus, 
  Calendar, 
  History, 
  ShieldCheck, 
  Printer, 
  Info, 
  Sparkles, 
  Check, 
  Copy, 
  ArrowRight, 
  Target, 
  SlidersHorizontal,
  ChevronRight,
  Send,
  HelpCircle
} from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock';
import { useKeyPress } from '../hooks/useKeyPress';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { toastManager } from '../hooks/useToast';

export interface PriceHistoryModalProps {
  vehicle: Vehicle | null;
  currency: Currency;
  lang: Language;
  onClose: () => void;
  onMakeOffer?: (vehicle: Vehicle, offerAzn: number) => void;
}

type TimeframeOption = '1m' | '3m' | '6m' | 'all';

const I18N_STRINGS = {
  az: {
    modalTitle: 'Qiymət Tarixçəsi & Bazar Dinamikası',
    badgeVerified: 'Təsdiqlənmiş Məlumat',
    print: 'Çap et',
    currentPrice: 'Cari Qiymət',
    initialPrice: 'İlkin Qiymət',
    netChange: 'Ümumi Dəyişiklik',
    marketDiff: 'Bazarla Müqayisə',
    stability: 'Qiymət Sabitliyi',
    chartTitle: 'Qiymət Dinamikası Qrafiki',
    chartSubtitle: 'Avtomobilin elan qiyməti ilə Bakı üzrə orta bazar qiymətinin müqayisəsi',
    legendCar: 'Avtomobil Qiyməti',
    legendMarket: 'Bazar Orta Qiyməti',
    auditTableTitle: 'Qiymət Dəyişiklikləri Jurnalı',
    colDate: 'Tarix',
    colPrice: 'Qiymət',
    colDiff: 'Fərq',
    colNote: 'Səbəb / Qeyd',
    initialListing: 'İlkin elan',
    priceCut: 'Endirim',
    priceIncrease: 'Artım',
    steady: 'Sabit',
    negotiationTitle: 'AutoNext Təklif & Danışıq Simulyatoru',
    negotiationSubtitle: 'Satıcıya optimal təklif verərək qəbul olunma ehtimalını hesablayın',
    targetOffer: 'Məqsədli Təklif',
    minOffer: 'Minimum Təklif',
    askingPrice: 'Satıcı Qiyməti',
    acceptanceChance: 'Satıcının Qəbul Ehtimalı',
    sendOfferBtn: 'Təklifi Satıcıya Göndər',
    offerSentToast: 'Təklifiniz qeydə alındı və satıcıya göndərildi!',
    selectedPointDetails: 'Seçilmiş Nöqtə Detalları',
    timeframes: {
      '1m': '1 Ay',
      '3m': '3 Ay',
      '6m': '6 Ay',
      all: 'Hamısı',
    },
    daysAgo: 'gün əvvəl',
  },
  en: {
    modalTitle: 'Price History & Market Dynamics',
    badgeVerified: 'Verified Data',
    print: 'Print',
    currentPrice: 'Current Price',
    initialPrice: 'Initial Price',
    netChange: 'Net Change',
    marketDiff: 'Market Difference',
    stability: 'Price Stability',
    chartTitle: 'Price Trend Dynamics',
    chartSubtitle: 'Comparison of listing price vs Baku average market benchmark over time',
    legendCar: 'Vehicle Price',
    legendMarket: 'Market Average',
    auditTableTitle: 'Price Change Audit Log',
    colDate: 'Date',
    colPrice: 'Price',
    colDiff: 'Delta',
    colNote: 'Reason / Note',
    initialListing: 'Initial Listing',
    priceCut: 'Price Drop',
    priceIncrease: 'Increase',
    steady: 'Stable',
    negotiationTitle: 'AutoNext Offer & Negotiation Simulator',
    negotiationSubtitle: 'Simulate your target offer and calculate seller acceptance probability',
    targetOffer: 'Target Offer',
    minOffer: 'Min Floor',
    askingPrice: 'Asking Price',
    acceptanceChance: 'Seller Acceptance Probability',
    sendOfferBtn: 'Submit Offer to Seller',
    offerSentToast: 'Your offer has been submitted to the seller!',
    selectedPointDetails: 'Selected Point Details',
    timeframes: {
      '1m': '1M',
      '3m': '3M',
      '6m': '6M',
      all: 'All',
    },
    daysAgo: 'days ago',
  },
  ru: {
    modalTitle: 'История цен и динамика рынка',
    badgeVerified: 'Проверенные данные',
    print: 'Печать',
    currentPrice: 'Текущая цена',
    initialPrice: 'Начальная цена',
    netChange: 'Общее изменение',
    marketDiff: 'Сравнение с рынком',
    stability: 'Стабильность цены',
    chartTitle: 'График динамики цен',
    chartSubtitle: 'Сравнение цены объявления со среднерыночной ценой по Баку',
    legendCar: 'Цена автомобиля',
    legendMarket: 'Среднерыночная',
    auditTableTitle: 'Журнал изменений цен',
    colDate: 'Дата',
    colPrice: 'Цена',
    colDiff: 'Разница',
    colNote: 'Причина / Примечание',
    initialListing: 'Начальное размещение',
    priceCut: 'Снижение цены',
    priceIncrease: 'Повышение',
    steady: 'Без изменений',
    negotiationTitle: 'Симулятор предложений и торга AutoNext',
    negotiationSubtitle: 'Смоделируйте предложение и рассчитайте вероятность согласия продавца',
    targetOffer: 'Рекомендуемое предложение',
    minOffer: 'Минимум',
    askingPrice: 'Цена продавца',
    acceptanceChance: 'Вероятность согласия продавца',
    sendOfferBtn: 'Отправить предложение продавцу',
    offerSentToast: 'Ваше предложение отправлено продавцу!',
    selectedPointDetails: 'Детали выбранной точки',
    timeframes: {
      '1m': '1 мес.',
      '3m': '3 мес.',
      '6m': '6 мес.',
      all: 'Все',
    },
    daysAgo: 'дней назад',
  },
};

export const PriceHistoryModal: React.FC<PriceHistoryModalProps> = ({
  vehicle,
  currency,
  lang,
  onClose,
  onMakeOffer,
}) => {
  useScrollLock(!!vehicle);
  useKeyPress('Escape', onClose);
  const [copiedVin, copyVin] = useCopyToClipboard();

  const [timeframe, setTimeframe] = useState<TimeframeOption>('all');
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const [simulatedOfferAzn, setSimulatedOfferAzn] = useState<number>(0);

  const t = I18N_STRINGS[lang] || I18N_STRINGS.az;

  const report = useMemo(() => {
    if (!vehicle) return null;
    return generatePriceHistory(vehicle);
  }, [vehicle]);

  // Set initial simulated offer when report is ready
  React.useEffect(() => {
    if (report) {
      setSimulatedOfferAzn(report.metrics.recommendedOfferRange.targetAzn);
      setSelectedPointIndex(report.events.length - 1);
    }
  }, [report]);

  // Filter events by selected timeframe
  const filteredEvents = useMemo(() => {
    if (!report) return [];
    if (timeframe === 'all') return report.events;
    const daysLimit = timeframe === '1m' ? 30 : timeframe === '3m' ? 90 : 180;
    const now = new Date(report.events[report.events.length - 1]?.date || '2026-03-01').getTime();
    return report.events.filter((e) => {
      const eDate = new Date(e.date).getTime();
      const diffDays = (now - eDate) / (1000 * 60 * 60 * 24);
      return diffDays <= daysLimit;
    });
  }, [report, timeframe]);

  if (!vehicle || !report) return null;

  const activeIndex = selectedPointIndex !== null && selectedPointIndex < filteredEvents.length
    ? selectedPointIndex
    : filteredEvents.length - 1;
  const activeEvent = filteredEvents[activeIndex] || filteredEvents[filteredEvents.length - 1];

  // SVG Chart Geometry
  const width = 680;
  const height = 220;
  const paddingX = 50;
  const paddingY = 35;

  const allPrices = [
    ...filteredEvents.map((e) => e.priceAzn),
    ...filteredEvents.map((e) => e.marketAvgAzn),
  ];
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceMargin = Math.max(1000, (maxPrice - minPrice) * 0.15);
  const chartMin = Math.max(0, minPrice - priceMargin);
  const chartMax = maxPrice + priceMargin;
  const priceRange = chartMax - chartMin || 1;

  const svgCoordinates = filteredEvents.map((ev, idx) => {
    const x =
      filteredEvents.length === 1
        ? width / 2
        : paddingX + (idx / (filteredEvents.length - 1)) * (width - paddingX * 2);
    const yCar =
      height - paddingY - ((ev.priceAzn - chartMin) / priceRange) * (height - paddingY * 2);
    const yMarket =
      height - paddingY - ((ev.marketAvgAzn - chartMin) / priceRange) * (height - paddingY * 2);
    return { x, yCar, yMarket, event: ev, idx };
  });

  const carPathD = svgCoordinates.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.yCar}` : `${acc} L ${curr.x} ${curr.yCar}`;
  }, '');

  const carAreaD =
    svgCoordinates.length > 0
      ? `${carPathD} L ${svgCoordinates[svgCoordinates.length - 1].x} ${height - paddingY} L ${svgCoordinates[0].x} ${height - paddingY} Z`
      : '';

  const marketPathD = svgCoordinates.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.yMarket}` : `${acc} L ${curr.x} ${curr.yMarket}`;
  }, '');

  const acceptanceProb = report.metrics.acceptanceProbabilityPercent(simulatedOfferAzn);

  const handleSendOffer = () => {
    if (onMakeOffer) {
      onMakeOffer(vehicle, simulatedOfferAzn);
    }
    toastManager.add(t.offerSentToast, 'success');
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      data-testid="price-history-modal"
    >
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/70 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">{t.modalTitle}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                  {t.badgeVerified}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-white font-bold">{vehicle.title} ({vehicle.year})</span>
                <span>• VIN:</span>
                <div className="flex items-center gap-1 group/vin">
                  <span className="text-slate-300 font-semibold">{vehicle.vin}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyVin(vehicle.vin);
                    }}
                    title="Copy VIN"
                    className="p-1 rounded opacity-0 group-hover/vin:opacity-100 focus:opacity-100 hover:bg-slate-800 transition-all text-slate-400 hover:text-white"
                  >
                    {copiedVin === vehicle.vin ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t.print}</span>
            </button>
            <button
              onClick={onClose}
              data-testid="price-history-close-btn"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Key Metric Highlights Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Current Price */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] uppercase text-slate-500 font-bold block mb-1">
                {t.currentPrice}
              </span>
              <div className="text-lg sm:text-xl font-black text-white">
                {formatPrice(report.metrics.currentPriceAzn, currency)}
              </div>
              {currency !== 'AZN' && (
                <span className="text-[11px] text-slate-400 font-medium">
                  ({formatPrice(report.metrics.currentPriceAzn, 'AZN')})
                </span>
              )}
            </div>

            {/* Total Price Change */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] uppercase text-slate-500 font-bold block mb-1">
                {t.netChange}
              </span>
              <div className="flex items-center gap-1.5">
                {report.metrics.totalChangeAzn < 0 ? (
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                ) : report.metrics.totalChangeAzn > 0 ? (
                  <TrendingUp className="w-4 h-4 text-rose-400" />
                ) : (
                  <Minus className="w-4 h-4 text-slate-400" />
                )}
                <span className={`text-lg sm:text-xl font-black ${
                  report.metrics.totalChangeAzn < 0 
                    ? 'text-emerald-400' 
                    : report.metrics.totalChangeAzn > 0 
                    ? 'text-rose-400' 
                    : 'text-slate-300'
                }`}>
                  {formatPrice(Math.abs(report.metrics.totalChangeAzn), currency)}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {report.metrics.totalChangePercent > 0 ? `+${report.metrics.totalChangePercent}%` : `${report.metrics.totalChangePercent}%`}
              </span>
            </div>

            {/* Market Comparison */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] uppercase text-slate-500 font-bold block mb-1">
                {t.marketDiff}
              </span>
              <div className="flex items-center gap-1.5 text-lg sm:text-xl font-black text-cyan-400">
                <span>{report.metrics.diffFromMarketPercent > 0 ? `+${report.metrics.diffFromMarketPercent}%` : `${report.metrics.diffFromMarketPercent}%`}</span>
              </div>
              <span className="text-[11px] text-slate-400">
                Orta: {formatPrice(report.metrics.avgMarketPriceAzn, currency)}
              </span>
            </div>

            {/* Stability Index */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] uppercase text-slate-500 font-bold block mb-1">
                {t.stability}
              </span>
              <div className="flex items-center gap-1.5 text-base sm:text-lg font-bold text-amber-400">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{report.metrics.stabilityLabel[lang]}</span>
              </div>
              <span className="text-[11px] text-slate-400">
                İndeks: {100 - report.metrics.volatilityScore}/100
              </span>
            </div>
          </div>

          {/* Interactive Trend Chart Card */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-white text-sm sm:text-base">{t.chartTitle}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{t.chartSubtitle}</p>
              </div>

              {/* Timeframe Switcher */}
              <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl" data-testid="timeframe-selector">
                {(['1m', '3m', '6m', 'all'] as TimeframeOption[]).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => {
                      setTimeframe(tf);
                      setSelectedPointIndex(null);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      timeframe === tf
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {t.timeframes[tf]}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive SVG Chart */}
            <div className="relative w-full overflow-hidden bg-slate-900/60 rounded-xl p-3 border border-slate-800/80">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-52 overflow-visible">
                <defs>
                  <linearGradient id="priceHistoryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                {[0.2, 0.4, 0.6, 0.8].map((pct) => {
                  const y = paddingY + pct * (height - paddingY * 2);
                  const priceVal = Math.round(chartMax - pct * priceRange);
                  return (
                    <g key={pct}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={width - paddingX}
                        y2={y}
                        stroke="#334155"
                        strokeDasharray="4 4"
                        strokeWidth="0.8"
                      />
                      <text
                        x={paddingX - 6}
                        y={y + 3}
                        fill="#64748b"
                        fontSize="9"
                        textAnchor="end"
                        fontFamily="monospace"
                      >
                        {formatPrice(priceVal, currency)}
                      </text>
                    </g>
                  );
                })}

                {/* Vehicle Price Gradient Area */}
                {carAreaD && <path d={carAreaD} fill="url(#priceHistoryGrad)" />}

                {/* Market Benchmark Line (dashed cyan) */}
                {marketPathD && (
                  <path
                    d={marketPathD}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2"
                    strokeDasharray="5 5"
                    strokeLinecap="round"
                  />
                )}

                {/* Vehicle Price Line (solid emerald) */}
                {carPathD && (
                  <path
                    d={carPathD}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  />
                )}

                {/* Interactive Points on Vehicle Price */}
                {svgCoordinates.map((pt) => {
                  const isSelected = pt.idx === activeIndex;
                  return (
                    <g
                      key={`pt-${pt.idx}`}
                      className="cursor-pointer group"
                      onClick={() => setSelectedPointIndex(pt.idx)}
                      data-testid={`chart-point-${pt.idx}`}
                    >
                      {/* Pulse circle for selected */}
                      {isSelected && (
                        <circle
                          cx={pt.x}
                          cy={pt.yCar}
                          r="12"
                          fill="#10b981"
                          fillOpacity="0.25"
                          className="animate-ping"
                        />
                      )}

                      {/* Main node dot */}
                      <circle
                        cx={pt.x}
                        cy={pt.yCar}
                        r={isSelected ? '6.5' : '4.5'}
                        fill={isSelected ? '#10b981' : '#0f172a'}
                        stroke="#10b981"
                        strokeWidth={isSelected ? '3' : '2'}
                        className="transition-all duration-200"
                      />

                      {/* X-axis date label */}
                      <text
                        x={pt.x}
                        y={height - 10}
                        fill={isSelected ? '#f8fafc' : '#94a3b8'}
                        fontSize="10"
                        fontWeight={isSelected ? 'bold' : 'normal'}
                        textAnchor="middle"
                      >
                        {getLocalizedMonth(pt.event.date, lang)}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Chart Legend */}
              <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800 px-1">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1 bg-emerald-500 rounded-full"></span>
                    <span className="font-semibold text-slate-300">{t.legendCar}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 border-t-2 border-dashed border-cyan-400"></span>
                    <span className="font-semibold text-slate-400">{t.legendMarket}</span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-500">
                  Nöqtələrə klik edərək ətraflı baxın
                </span>
              </div>
            </div>

            {/* Active Point Inspector Card */}
            {activeEvent && (
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs" data-testid="selected-point-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold font-mono">
                    {activeEvent.date}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {formatPrice(activeEvent.priceAzn, currency)}
                      </span>
                      {activeEvent.diffAzn !== 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          activeEvent.diffAzn < 0 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {activeEvent.diffAzn < 0 ? '' : '+'}{formatPrice(activeEvent.diffAzn, currency)} ({activeEvent.diffPercentage}%)
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 mt-0.5">{activeEvent.note[lang]}</p>
                  </div>
                </div>

                <div className="text-right text-slate-400 flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
                  <span className="text-[11px]">Bazar müqayisəsi:</span>
                  <strong className="text-cyan-400 font-mono">
                    {formatPrice(activeEvent.marketAvgAzn, currency)}
                  </strong>
                </div>
              </div>
            )}
          </div>

          {/* Audit Log Table */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>{t.auditTableTitle}</span>
              </h3>
              <span className="text-xs text-slate-400">
                {report.events.length} hadisə qeydə alınıb
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3 font-semibold">{t.colDate}</th>
                    <th className="py-2.5 px-3 font-semibold">{t.colPrice}</th>
                    <th className="py-2.5 px-3 font-semibold">{t.colDiff}</th>
                    <th className="py-2.5 px-3 font-semibold">{t.colNote}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {report.events.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-3 font-mono text-slate-300 whitespace-nowrap">
                        {ev.date}
                      </td>
                      <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                        {formatPrice(ev.priceAzn, currency)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {ev.type === 'initial' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">
                            {t.initialListing}
                          </span>
                        ) : ev.type === 'drop' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {formatPrice(ev.diffAzn, currency)} ({ev.diffPercentage}%)
                          </span>
                        ) : ev.type === 'increase' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            +{formatPrice(ev.diffAzn, currency)} (+{ev.diffPercentage}%)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">
                            {t.steady}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {ev.note[lang]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Offer & Negotiation Simulator */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">{t.negotiationTitle}</h3>
              </div>
              <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 font-semibold">
                AI Bazar Taktikası
              </span>
            </div>
            <p className="text-xs text-slate-400">{t.negotiationSubtitle}</p>

            {/* Negotiation advice note */}
            <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-indigo-300 block mb-0.5">Ekspert Tövsiyəsi:</strong>
                <span>{report.metrics.negotiationAdvice[lang]}</span>
              </div>
            </div>

            {/* Offer Simulator Controls */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Təklif etdiyiniz məbləğ:</span>
                  <div className="text-2xl font-black text-white mt-0.5">
                    {formatPrice(simulatedOfferAzn, currency)}
                  </div>
                </div>

                {/* Quick Percentage Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { label: '-2%', factor: 0.98 },
                    { label: '-4%', factor: 0.96 },
                    { label: '-6%', factor: 0.94 },
                    { label: '-8%', factor: 0.92 },
                  ].map((preset) => {
                    const priceVal = Math.round(report.metrics.currentPriceAzn * preset.factor);
                    const isSelected = Math.abs(simulatedOfferAzn - priceVal) < 100;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setSimulatedOfferAzn(priceVal)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slider */}
              <input
                type="range"
                data-testid="offer-slider"
                min={report.metrics.recommendedOfferRange.minAzn * 0.9}
                max={report.metrics.currentPriceAzn}
                step={200}
                value={simulatedOfferAzn}
                onChange={(e) => setSimulatedOfferAzn(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />

              {/* Acceptance Probability Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{t.acceptanceChance}:</span>
                  <span className={`font-black ${
                    acceptanceProb >= 75
                      ? 'text-emerald-400'
                      : acceptanceProb >= 40
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}>
                    {acceptanceProb}% {acceptanceProb >= 75 ? '(Yüksək şans)' : acceptanceProb >= 40 ? '(Orta şans)' : '(Aşağı şans)'}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      acceptanceProb >= 75
                        ? 'bg-emerald-500'
                        : acceptanceProb >= 40
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${acceptanceProb}%` }}
                  />
                </div>
              </div>

              {/* Submit Offer Button */}
              <button
                type="button"
                onClick={handleSendOffer}
                data-testid="send-offer-btn"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/25"
              >
                <Send className="w-4 h-4" />
                <span>{t.sendOfferBtn} ({formatPrice(simulatedOfferAzn, currency)})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

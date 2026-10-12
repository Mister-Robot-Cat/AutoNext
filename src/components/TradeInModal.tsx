import React, { useState, useMemo } from 'react';
import { Vehicle, Currency, Language } from '../types/vehicle';
import { formatPrice } from '../utils/i18n';
import {
  VehicleConditionTier,
  PaintAccidentStatus,
  ServiceHistoryTier,
  TradeInInputs,
} from '../types/tradeIn';
import {
  calculateTradeInValuation,
  calculateUpgradeLoanEstimate,
  formatTradeInSummaryText,
  POPULAR_TRADE_IN_PRESETS,
} from '../utils/tradeIn';
import {
  X,
  ArrowLeftRight,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Coins,
  Calculator,
  Car,
  Copy,
  Check,
  Sparkles,
  Zap,
  Info,
  BadgeCheck,
  TrendingUp,
  Clock,
  SendHorizontal,
} from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock';
import { useKeyPress } from '../hooks/useKeyPress';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { toastManager } from '../hooks/useToast';

export interface TradeInModalProps {
  isOpen?: boolean;
  onClose: () => void;
  targetVehicle?: Vehicle | null;
  currency: Currency;
  lang: Language;
}

const TRANSLATIONS = {
  az: {
    modalTitle: 'AutoNext Trade-In & Barter Qiymətləndirməsi',
    modalSubtitle: 'Köhnə avtomobilinizi dərhal qiymətləndirin, diler bonusu qazanın və yeniləmə fərqini hesablayın',
    popularPresets: 'Populyar Modellər (Hazır Şablonlar)',
    customVehicle: 'Fərdi Avtomobil',
    carMake: 'Marka',
    carModel: 'Model',
    carYear: 'Buraxılış İli',
    carMileage: 'Yürüş (km)',
    marketBaseValue: 'Bazar Dəyəri (AZN - Təxmini)',
    existingLoan: 'Mövcud Kredit / Lizinq Borcu (AZN)',
    conditionSection: 'Kuzov və Texniki Vəziyyət',
    accidentSection: 'Qəza və Boya Tarixçəsi',
    serviceSection: 'Servis Qulluq Tarixçəsi',
    conditionExcellent: 'İdeal (Zavod)',
    conditionGood: 'Yaxşı',
    conditionFair: 'Kafi / Orta',
    conditionPoor: 'Təmir tələb edən',
    accidentClean: 'Təmiz (Vuruqsuz)',
    accidentMinor: 'Kosmetik Rənglənib',
    accidentRepaired: 'Qəza Bərpası',
    serviceDealer: 'Rəsmi Diler',
    serviceRegular: 'Mütəmadi Qulluq',
    servicePartial: 'Məlumat Yoxdur',
    valuationOverview: 'Qiymətləndirmə Təklifləri',
    dealerTradeIn: 'Rəsmi Diler Barter Təklifi',
    recommended: 'Tövsiyə olunan',
    dealerBonus: 'Diler Barter Bonusu',
    instantCash: 'Təcili Nağd Satış (Fast Cash)',
    privateSale: 'Şəxsi Bazar Qiyməti (Private Retail)',
    adjustmentsTitle: 'Qiymətə Təsir Edən Amillər',
    upgradeSection: 'Yeniləmə və Maliyyə Hesabatı',
    targetCarTitle: 'Seçilmiş Hədəf Avtomobil',
    targetCarPrice: 'Hədəf Qiymət',
    effectiveCredit: 'Xalis Barter Krediti',
    loanPayoff: 'Kredit Qalığı',
    netEquity: 'Barter Kapitalı (Equity)',
    netDifference: 'Ödəniləcək Yekun Fərq',
    monthlyFinance: 'Kreditlə Aylıq Fərq',
    termMonths: 'aylıq müddət',
    sendOfferBtn: 'Barter Müraciəti Göndər',
    copySummaryBtn: 'Təklifi Kopyala',
    copiedText: 'Kopyalandı!',
    offerSentToast: 'Trade-In barter müraciətiniz uğurla qəbul edildi! Diler 15 dəqiqə ərzində sizinlə əlaqə saxlayacaq.',
    confidenceTag: 'Alqoritm Dəqiqliyi',
  },
  en: {
    modalTitle: 'AutoNext Trade-In & Barter Valuation',
    modalSubtitle: 'Instantly appraise your vehicle, secure dealership loyalty bonuses, and calculate upgrade costs',
    popularPresets: 'Popular Vehicles (Quick Presets)',
    customVehicle: 'Custom Vehicle',
    carMake: 'Make',
    carModel: 'Model',
    carYear: 'Year',
    carMileage: 'Mileage (km)',
    marketBaseValue: 'Estimated Market Value (AZN)',
    existingLoan: 'Existing Loan / Lien Balance (AZN)',
    conditionSection: 'Mechanical & Body Condition',
    accidentSection: 'Accident & Paint History',
    serviceSection: 'Service Records',
    conditionExcellent: 'Excellent (Mint)',
    conditionGood: 'Good',
    conditionFair: 'Fair',
    conditionPoor: 'Needs Repair',
    accidentClean: 'Clean (No Accidents)',
    accidentMinor: 'Minor Cosmetic Paint',
    accidentRepaired: 'Accident Repaired',
    serviceDealer: 'Dealer Certified',
    serviceRegular: 'Regular Independent',
    servicePartial: 'Unknown / None',
    valuationOverview: 'Valuation Offers',
    dealerTradeIn: 'Official Dealership Trade-In',
    recommended: 'Recommended',
    dealerBonus: 'Dealer Trade-In Bonus',
    instantCash: 'Instant Cash Buyout',
    privateSale: 'Private Party Market Value',
    adjustmentsTitle: 'Valuation Adjustments',
    upgradeSection: 'Upgrade Financial Breakdown',
    targetCarTitle: 'Target Vehicle',
    targetCarPrice: 'Target Car Price',
    effectiveCredit: 'Trade-In Credit',
    loanPayoff: 'Loan Payoff',
    netEquity: 'Net Trade-In Equity',
    netDifference: 'Net Difference to Pay',
    monthlyFinance: 'Estimated Monthly Payment',
    termMonths: 'months term',
    sendOfferBtn: 'Submit Trade-In Request',
    copySummaryBtn: 'Copy Valuation Summary',
    copiedText: 'Copied!',
    offerSentToast: 'Trade-in request successfully sent! A partner dealership will contact you within 15 minutes.',
    confidenceTag: 'Algorithm Confidence',
  },
  ru: {
    modalTitle: 'Оценка Trade-In и Бартера AutoNext',
    modalSubtitle: 'Мгновенная оценка вашего автомобиля, получение дилерского бонуса и расчет стоимости обмена',
    popularPresets: 'Популярные автомобили (Шаблоны)',
    customVehicle: 'Другой автомобиль',
    carMake: 'Марка',
    carModel: 'Модель',
    carYear: 'Год',
    carMileage: 'Пробег (км)',
    marketBaseValue: 'Ориентировочная цена (AZN)',
    existingLoan: 'Остаток по кредиту (AZN)',
    conditionSection: 'Состояние кузова и агрегатов',
    accidentSection: 'История ДТП и покраски',
    serviceSection: 'Сервисная история',
    conditionExcellent: 'Идеальное (Заводское)',
    conditionGood: 'Хорошее',
    conditionFair: 'Среднее',
    conditionPoor: 'Требует ремонта',
    accidentClean: 'Без ДТП (Завод)',
    accidentMinor: 'Косметический окрас',
    accidentRepaired: 'После ремонта ДТП',
    serviceDealer: 'Дилерское ТО',
    serviceRegular: 'Регулярное ТО',
    servicePartial: 'Нет данных',
    valuationOverview: 'Варианты оценки',
    dealerTradeIn: 'Trade-In у официального дилера',
    recommended: 'Рекомендуется',
    dealerBonus: 'Дилерский бонус за Trade-In',
    instantCash: 'Срочный выкуп (Наличные)',
    privateSale: 'Частная продажа на рынке',
    adjustmentsTitle: 'Факторы влияния на цену',
    upgradeSection: 'Финансовый расчет обновления',
    targetCarTitle: 'Выбранный автомобиль для покупки',
    targetCarPrice: 'Цена нового авто',
    effectiveCredit: 'Зачет стоимости авто',
    loanPayoff: 'Погашение кредита',
    netEquity: 'Чистый капитал (Equity)',
    netDifference: 'Итого к доплате',
    monthlyFinance: 'Ежемесячный платеж в кредит',
    termMonths: 'мес. срок',
    sendOfferBtn: 'Отправить заявку на Trade-In',
    copySummaryBtn: 'Скопировать расчет',
    copiedText: 'Скопировано!',
    offerSentToast: 'Заявка на Trade-In успешно отправлена! Менеджер свяжется с вами в течение 15 минут.',
    confidenceTag: 'Точность алгоритма',
  },
};

export const TradeInModal: React.FC<TradeInModalProps> = ({
  isOpen = false,
  onClose,
  targetVehicle = null,
  currency,
  lang,
}) => {
  useScrollLock(isOpen);
  useKeyPress('Escape', onClose);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.az;
  const [copiedText, copyToClipboard] = useCopyToClipboard();

  // Selected preset or custom
  const [selectedPresetId, setSelectedPresetId] = useState<string>('camry-2016');

  // Form input state
  const [make, setMake] = useState<string>('Toyota');
  const [model, setModel] = useState<string>('Camry');
  const [year, setYear] = useState<number>(2016);
  const [mileageKm, setMileageKm] = useState<number>(140000);
  const [condition, setCondition] = useState<VehicleConditionTier>('good');
  const [accidentStatus, setAccidentStatus] = useState<PaintAccidentStatus>('clean');
  const [serviceHistory, setServiceHistory] = useState<ServiceHistoryTier>('dealer_certified');
  const [estimatedMarketBase, setEstimatedMarketBase] = useState<number>(31000);
  const [existingLoanBalance, setExistingLoanBalance] = useState<number>(0);
  const [loanTermMonths, setLoanTermMonths] = useState<number>(36);

  // Apply preset selection
  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    if (presetId === 'custom') return;

    const matched = POPULAR_TRADE_IN_PRESETS.find((p) => p.id === presetId);
    if (matched) {
      setMake(matched.make);
      setModel(matched.model);
      setYear(matched.year);
      setMileageKm(matched.mileageKm);
      setCondition(matched.condition);
      setAccidentStatus(matched.accidentStatus);
      setServiceHistory(matched.serviceHistory);
      setEstimatedMarketBase(matched.baseMarketPriceAzn);
    }
  };

  // Perform calculation
  const targetPriceAzn = targetVehicle?.priceAzn || 0;

  const valuationInputs: TradeInInputs = useMemo(
    () => ({
      make,
      model,
      year,
      mileageKm,
      condition,
      accidentStatus,
      serviceHistory,
      estimatedMarketBaseAzn: estimatedMarketBase > 0 ? estimatedMarketBase : undefined,
      existingLoanBalanceAzn: existingLoanBalance,
      targetVehiclePriceAzn: targetPriceAzn,
    }),
    [
      make,
      model,
      year,
      mileageKm,
      condition,
      accidentStatus,
      serviceHistory,
      estimatedMarketBase,
      existingLoanBalance,
      targetPriceAzn,
    ]
  );

  const result = useMemo(
    () => calculateTradeInValuation(valuationInputs),
    [valuationInputs]
  );

  const monthlyLoanEstimate = useMemo(
    () => calculateUpgradeLoanEstimate(result.netDifferenceToPayAzn, loanTermMonths),
    [result.netDifferenceToPayAzn, loanTermMonths]
  );

  const handleCopySummary = () => {
    const carName = `${make} ${model} (${year})`;
    const summary = formatTradeInSummaryText(carName, result, currency);
    copyToClipboard(summary);
    toastManager.add(
      lang === 'az'
        ? 'Trade-In hesabatı kopyalandı!'
        : lang === 'en'
        ? 'Trade-in summary copied!'
        : 'Отчет Trade-In скопирован!',
      'success'
    );
  };

  const handleSubmitRequest = () => {
    toastManager.add(t.offerSentToast, 'success');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      data-testid="trade-in-modal"
    >
      <div
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/25">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  {t.modalTitle}
                </h2>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {t.confidenceTag}: {result.confidenceScore}%
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-1">
                {t.modalSubtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm">
          {/* Preset Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {t.popularPresets}
            </label>
            <div className="flex flex-wrap gap-2">
              {POPULAR_TRADE_IN_PRESETS.map((p) => {
                const isActive = selectedPresetId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/25'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setSelectedPresetId('custom')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  selectedPresetId === 'custom'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/25'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                + {t.customVehicle}
              </button>
            </div>
          </div>

          {/* Form Specifications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                {t.carMake}
              </label>
              <input
                type="text"
                value={make}
                onChange={(e) => {
                  setMake(e.target.value);
                  setSelectedPresetId('custom');
                }}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                {t.carModel}
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => {
                  setModel(e.target.value);
                  setSelectedPresetId('custom');
                }}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                {t.carYear}
              </label>
              <input
                type="number"
                min={2000}
                max={2026}
                value={year}
                onChange={(e) => {
                  setYear(Number(e.target.value) || 2020);
                  setSelectedPresetId('custom');
                }}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                {t.carMileage}
              </label>
              <input
                type="number"
                step={5000}
                value={mileageKm}
                onChange={(e) => {
                  setMileageKm(Number(e.target.value) || 0);
                  setSelectedPresetId('custom');
                }}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Condition, Paint, and Service Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Condition */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                {t.conditionSection}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'excellent', label: t.conditionExcellent },
                  { id: 'good', label: t.conditionGood },
                  { id: 'fair', label: t.conditionFair },
                  { id: 'poor', label: t.conditionPoor },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setCondition(item.id as VehicleConditionTier);
                      setSelectedPresetId('custom');
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                      condition === item.id
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 ring-1 ring-emerald-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Accident & Paint */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                {t.accidentSection}
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { id: 'clean', label: t.accidentClean },
                  { id: 'minor_cosmetic', label: t.accidentMinor },
                  { id: 'accident_repaired', label: t.accidentRepaired },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setAccidentStatus(item.id as PaintAccidentStatus);
                      setSelectedPresetId('custom');
                    }}
                    className={`py-1.5 px-3 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition-all ${
                      accidentStatus === item.id
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500 ring-1 ring-blue-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{item.label}</span>
                    {accidentStatus === item.id && (
                      <Check className="w-3.5 h-3.5 text-blue-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Service Records */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                {t.serviceSection}
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { id: 'dealer_certified', label: t.serviceDealer },
                  { id: 'regular_service', label: t.serviceRegular },
                  { id: 'partial_unknown', label: t.servicePartial },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setServiceHistory(item.id as ServiceHistoryTier);
                      setSelectedPresetId('custom');
                    }}
                    className={`py-1.5 px-3 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition-all ${
                      serviceHistory === item.id
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500 ring-1 ring-purple-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{item.label}</span>
                    {serviceHistory === item.id && (
                      <Check className="w-3.5 h-3.5 text-purple-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Existing Loan / Lien Balance Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.marketBaseValue}
              </label>
              <input
                type="number"
                step={500}
                value={estimatedMarketBase}
                onChange={(e) => {
                  setEstimatedMarketBase(Number(e.target.value) || 0);
                  setSelectedPresetId('custom');
                }}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.existingLoan}
              </label>
              <input
                type="number"
                step={500}
                value={existingLoanBalance}
                onChange={(e) => setExistingLoanBalance(Math.max(0, Number(e.target.value) || 0))}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Three Valuation Cards */}
          <div>
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">
              {t.valuationOverview}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Card 1: Dealer Trade-In (Recommended) */}
              <div className="relative p-5 rounded-2xl bg-gradient-to-b from-emerald-950/40 to-slate-950/60 border-2 border-emerald-500/50 shadow-lg shadow-emerald-950/30 flex flex-col justify-between">
                <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950">
                  {t.recommended}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white text-sm">
                      {t.dealerTradeIn}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-emerald-400">
                    {formatPrice(result.tradeInOfferAzn, currency)}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Diapazon: {formatPrice(result.tradeInMinAzn, currency)} -{' '}
                    {formatPrice(result.tradeInMaxAzn, currency)}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{t.dealerBonus}:</span>
                    <span className="font-bold text-emerald-400">
                      +{formatPrice(result.dealershipBonusAzn, currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span>{t.effectiveCredit}:</span>
                    <span>{formatPrice(result.effectiveTradeInCreditAzn, currency)}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Instant Cash Buyout */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-white text-sm">
                      {t.instantCash}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-amber-400">
                    {formatPrice(result.instantCashOfferAzn, currency)}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Təcili likvidlik və 24 saat ərzində diler şəbəkəsindən nağd ödəniş.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
                  Gözləmədən, heç bir elan və müştəri danışığı olmadan dərhal satış.
                </div>
              </div>

              {/* Card 3: Private Sale Value */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <span className="font-bold text-white text-sm">
                      {t.privateSale}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-blue-400">
                    {formatPrice(result.privateSaleEstimatedAzn, currency)}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Şəxsi elan yerləşdirdikdə bazarda əldə edə biləcəyiniz maksimum məbləğ.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
                  Satış müddəti: ~2-4 həftə. Vaxt və alıcı görüşləri tələb edir.
                </div>
              </div>
            </div>
          </div>

          {/* Adjustments Item Breakdown */}
          {result.adjustments.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-2.5">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                {t.adjustmentsTitle}
              </h4>
              <div className="space-y-1.5">
                {result.adjustments.map((adj) => {
                  const isPositive = adj.impact === 'positive';
                  const isNegative = adj.impact === 'negative';
                  return (
                    <div
                      key={adj.id}
                      className="flex items-center justify-between text-xs py-1 border-b border-slate-800/50 last:border-0"
                    >
                      <div>
                        <span className="font-semibold text-slate-200">{adj.label}</span>
                        <p className="text-[11px] text-slate-400">{adj.description}</p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-mono font-bold ${
                            isPositive
                              ? 'text-emerald-400'
                              : isNegative
                              ? 'text-red-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {formatPrice(adj.amountAzn, currency)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Target Vehicle Upgrade Financial Breakdown */}
          {targetVehicle && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/30 to-purple-950/30 border border-blue-800/30 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden shrink-0">
                    <img
                      src={targetVehicle.images[0]}
                      alt={targetVehicle.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-blue-400 tracking-wider">
                      {t.targetCarTitle}
                    </span>
                    <h4 className="font-bold text-white text-sm">
                      {targetVehicle.title} ({targetVehicle.year})
                    </h4>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400">{t.targetCarPrice}:</span>
                  <div className="text-lg font-black text-white">
                    {formatPrice(targetVehicle.priceAzn, currency)}
                  </div>
                </div>
              </div>

              {/* Financial Equation */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800/80">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">{t.targetCarPrice}</span>
                  <strong className="text-sm text-white">
                    {formatPrice(targetVehicle.priceAzn, currency)}
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">
                    - {t.effectiveCredit}
                  </span>
                  <strong className="text-sm text-emerald-400">
                    {formatPrice(result.effectiveTradeInCreditAzn, currency)}
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">+ {t.loanPayoff}</span>
                  <strong className="text-sm text-amber-400">
                    {formatPrice(result.existingLoanBalanceAzn, currency)}
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40">
                  <span className="text-[10px] text-emerald-300 block font-bold">
                    = {t.netDifference}
                  </span>
                  <strong className="text-base text-emerald-300 font-black">
                    {formatPrice(result.netDifferenceToPayAzn, currency)}
                  </strong>
                </div>
              </div>

              {/* Monthly Loan Financing Breakdown for Difference */}
              {result.netDifferenceToPayAzn > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-300">
                      {t.monthlyFinance} (14% illik faizlə):
                    </span>
                    <strong className="text-emerald-400 text-sm font-bold">
                      ~{formatPrice(monthlyLoanEstimate, currency)} / ay
                    </strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {[24, 36, 48, 60].map((months) => (
                      <button
                        key={months}
                        type="button"
                        onClick={() => setLoanTermMonths(months)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          loanTermMonths === months
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {months}m
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Footer Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleCopySummary}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              {copiedText ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{t.copiedText}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{t.copySummaryBtn}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSubmitRequest}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/25"
            >
              <SendHorizontal className="w-4 h-4" />
              <span>{t.sendOfferBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

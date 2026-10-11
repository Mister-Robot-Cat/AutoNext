import React, { useState, useMemo } from 'react';
import { Currency, Language } from '../types/vehicle';
import { formatPrice } from '../utils/i18n';
import { calculateAmortizationSchedule, exportAmortizationToCsv } from '../utils/amortization';
import { 
  X, 
  Table, 
  Calendar, 
  TrendingDown, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  ArrowRight, 
  SlidersHorizontal,
  FileSpreadsheet,
  Building2,
  DollarSign
} from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock';
import { useKeyPress } from '../hooks/useKeyPress';
import { toastManager } from '../hooks/useToast';

export interface LoanAmortizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  lang: Language;
  carPrice: number;
  downPaymentPercent: number;
  termMonths: number;
  annualInterestRate: number;
  bankName?: string;
  vehicleTitle?: string;
}

const I18N = {
  az: {
    modalTitle: 'Kredit Amortizasiya Cədvəli & Qrafik',
    modalSubtitle: 'Aylıq əsas borc və faiz ödənişlərinin dinamik matris bölgüsü',
    tabYearly: 'İllik Xülasə Matrisi',
    tabMonthly: 'Aylıq Detallı Cədvəl',
    colYear: 'İl',
    colMonth: 'Ay',
    colPayment: 'Aylıq Ödəniş',
    colPaymentYearly: 'İllik Ödəniş',
    colPrincipal: 'Əsas Borc',
    colInterest: 'Faiz',
    colRemaining: 'Qalıq Borc',
    colCumulativeInterest: 'Cəmi Faiz',
    colInterestShare: 'Faiz Payı',
    extraPaymentLabel: 'Əlavə Aylıq Ödəniş (Erkən Ödəniş Simulyatoru)',
    monthsSaved: 'ay tez bağlanacaq',
    interestSaved: 'faiz qənaəti',
    exportCsv: 'CSV İxrac et',
    copyCsv: 'Kopyala',
    copied: 'Kopyalandı!',
    totalLoan: 'Kredit Məbləği',
    totalInterest: 'Ümumi Faiz',
    totalRepayment: 'Cəmi Ödəniş',
    monthlyPayment: 'Aylıq Ödəniş',
    filterAllYears: 'Bütün illər',
    yearPrefix: 'İl',
    interestRatio: 'Faiz/Əsas Nisbəti',
    distributionTitle: 'Ödəniş Paylanması',
    noData: 'Məlumat yoxdur',
  },
  en: {
    modalTitle: 'Loan Amortization Schedule & Matrix',
    modalSubtitle: 'Dynamic breakdown matrix of monthly principal and interest payments',
    tabYearly: 'Annual Matrix Summary',
    tabMonthly: 'Monthly Detailed Schedule',
    colYear: 'Year',
    colMonth: 'Month',
    colPayment: 'Monthly Payment',
    colPaymentYearly: 'Annual Payment',
    colPrincipal: 'Principal',
    colInterest: 'Interest',
    colRemaining: 'Remaining Balance',
    colCumulativeInterest: 'Cumulative Interest',
    colInterestShare: 'Interest Share',
    extraPaymentLabel: 'Extra Monthly Payment (Early Payoff Simulator)',
    monthsSaved: 'months earlier payoff',
    interestSaved: 'interest saved',
    exportCsv: 'Export CSV',
    copyCsv: 'Copy',
    copied: 'Copied!',
    totalLoan: 'Principal Loan',
    totalInterest: 'Total Interest',
    totalRepayment: 'Total Repayment',
    monthlyPayment: 'Monthly Payment',
    filterAllYears: 'All Years',
    yearPrefix: 'Year',
    interestRatio: 'Interest/Principal Ratio',
    distributionTitle: 'Payment Breakdown',
    noData: 'No data available',
  },
  ru: {
    modalTitle: 'График амортизации автокредита',
    modalSubtitle: 'Динамическая матрица платежей по основному долгу и процентам',
    tabYearly: 'Годовая сводная матрица',
    tabMonthly: 'Ежемесячный график',
    colYear: 'Год',
    colMonth: 'Месяц',
    colPayment: 'Ежемесячный платеж',
    colPaymentYearly: 'Годовой платеж',
    colPrincipal: 'Основной долг',
    colInterest: 'Проценты',
    colRemaining: 'Остаток долга',
    colCumulativeInterest: 'Накопленные проценты',
    colInterestShare: 'Доля процентов',
    extraPaymentLabel: 'Дополнительный платеж (Симулятор)',
    monthsSaved: 'мес. экономии срока',
    interestSaved: 'экономия на процентах',
    exportCsv: 'Экспорт в CSV',
    copyCsv: 'Копировать',
    copied: 'Скопировано!',
    totalLoan: 'Сумма кредита',
    totalInterest: 'Всего процентов',
    totalRepayment: 'Всего к выплате',
    monthlyPayment: 'Ежемесячный платеж',
    filterAllYears: 'Все годы',
    yearPrefix: 'Год',
    interestRatio: 'Соотношение процентов к долгу',
    distributionTitle: 'Распределение платежей',
    noData: 'Нет данных',
  },
};

export const LoanAmortizationModal: React.FC<LoanAmortizationModalProps> = ({
  isOpen,
  onClose,
  currency,
  lang,
  carPrice,
  downPaymentPercent,
  termMonths,
  annualInterestRate,
  bankName,
  vehicleTitle,
}) => {
  useScrollLock(isOpen);
  useKeyPress('Escape', onClose);

  const [extraPayment, setExtraPayment] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'yearly' | 'monthly'>('yearly');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const t = I18N[lang] || I18N.az;

  const schedule = useMemo(() => {
    return calculateAmortizationSchedule({
      carPrice,
      downPaymentPercent,
      termMonths,
      annualInterestRate,
      extraMonthlyPayment: extraPayment,
    });
  }, [carPrice, downPaymentPercent, termMonths, annualInterestRate, extraPayment]);

  if (!isOpen) return null;

  const principalRatio = schedule.totalPayment > 0 
    ? Math.round((schedule.principal / schedule.totalPayment) * 100) 
    : 100;
  const interestRatio = 100 - principalRatio;

  const handleCopyCsv = () => {
    const csv = exportAmortizationToCsv(schedule);
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(csv);
    }
    setIsCopied(true);
    toastManager.add(t.copied, 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const csv = exportAmortizationToCsv(schedule);
    try {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `autonext_amortization_${termMonths}m.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      handleCopyCsv();
    }
  };

  const filteredPeriods = schedule.periods.filter((p) => {
    if (selectedYear === 'all') return true;
    const yearOfPeriod = Math.floor((p.period - 1) / 12) + 1;
    return yearOfPeriod === selectedYear;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={t.modalTitle}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/70 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>{t.modalTitle}</span>
                {bankName && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-blue-400 font-semibold border border-slate-700">
                    {bankName}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                {vehicleTitle ? `${vehicleTitle} • ` : ''}
                {formatPrice(carPrice, currency)} • {annualInterestRate}% {lang === 'az' ? 'illik' : lang === 'en' ? 'APR' : 'годовых'} • {termMonths} {lang === 'az' ? 'ay' : lang === 'en' ? 'mo' : 'мес'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCsv}
              aria-label="Copy CSV"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title={t.copyCsv}
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{isCopied ? t.copied : t.copyCsv}</span>
            </button>
            <button
              onClick={handleDownloadCsv}
              aria-label="Download CSV"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title={t.exportCsv}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{t.exportCsv}</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close amortization modal"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Key KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">{t.totalLoan}</span>
              <div className="text-base sm:text-lg font-black text-white mt-1">
                {formatPrice(schedule.principal, currency)}
              </div>
              <span className="text-[10px] text-slate-500">
                {100 - downPaymentPercent}% {lang === 'az' ? 'kredit payı' : 'share'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">{t.totalInterest}</span>
              <div className="text-base sm:text-lg font-black text-amber-400 mt-1">
                {formatPrice(schedule.totalInterest, currency)}
              </div>
              <span className="text-[10px] text-amber-500/80">
                +{annualInterestRate}% {lang === 'az' ? 'illik dərəcə' : 'APR'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">{t.monthlyPayment}</span>
              <div className="text-base sm:text-lg font-black text-emerald-400 mt-1">
                {formatPrice(schedule.monthlyPayment + extraPayment, currency)}
              </div>
              <span className="text-[10px] text-slate-500">
                {extraPayment > 0 ? `+${formatPrice(extraPayment, currency)} əlavə` : `${schedule.payoffMonths} ay`}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">{t.totalRepayment}</span>
              <div className="text-base sm:text-lg font-black text-cyan-400 mt-1">
                {formatPrice(schedule.totalPayment, currency)}
              </div>
              <span className="text-[10px] text-slate-500">
                {lang === 'az' ? 'Əsas + faiz' : 'Principal + int.'}
              </span>
            </div>
          </div>

          {/* Visual Distribution Bar */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400">{t.distributionTitle}</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-blue-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                  {t.colPrincipal}: {principalRatio}%
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                  {t.colInterest}: {interestRatio}%
                </span>
              </div>
            </div>

            <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-300"
                style={{ width: `${principalRatio}%` }}
                title={`Principal: ${principalRatio}%`}
              />
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                style={{ width: `${interestRatio}%` }}
                title={`Interest: ${interestRatio}%`}
              />
            </div>
          </div>

          {/* Early Payoff Simulator Slider */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950/30 to-slate-950 border border-emerald-900/40 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wide">
                  {t.extraPaymentLabel}
                </span>
              </div>
              <span className="text-sm font-black text-emerald-400">
                +{formatPrice(extraPayment, currency)} / {lang === 'az' ? 'ay' : 'mo'}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="1000"
              step="50"
              value={extraPayment}
              onChange={(e) => setExtraPayment(Number(e.target.value))}
              aria-label="Extra monthly payment"
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />

            {extraPayment > 0 && (
              <div className="p-3 rounded-xl bg-emerald-900/30 border border-emerald-700/40 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-300 animate-in fade-in duration-200">
                <span className="font-semibold">
                  ⚡ {schedule.monthsSaved} {t.monthsSaved} ({schedule.payoffMonths} ay ərzində bağlanacaq)
                </span>
                <span className="font-bold text-emerald-200">
                  🎉 {formatPrice(schedule.interestSaved, currency)} {t.interestSaved}
                </span>
              </div>
            )}
          </div>

          {/* View Mode & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            {/* View Mode Switcher */}
            <div className="flex p-1 rounded-xl bg-slate-950/80 border border-slate-800 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setViewMode('yearly')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'yearly'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.tabYearly}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('monthly')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'monthly'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.tabMonthly}
              </button>
            </div>

            {/* Optional Year Filter for Monthly Mode */}
            {viewMode === 'monthly' && schedule.yearlySummaries.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setSelectedYear('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    selectedYear === 'all'
                      ? 'bg-slate-800 border-slate-600 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.filterAllYears}
                </button>
                {schedule.yearlySummaries.map((y) => (
                  <button
                    key={y.year}
                    type="button"
                    onClick={() => setSelectedYear(y.year)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      selectedYear === y.year
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t.yearPrefix} {y.year}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
            {viewMode === 'yearly' ? (
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-950/90 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">{t.colYear}</th>
                    <th className="py-3 px-4">{t.colPaymentYearly}</th>
                    <th className="py-3 px-4">{t.colPrincipal}</th>
                    <th className="py-3 px-4">{t.colInterest}</th>
                    <th className="py-3 px-4">{t.colRemaining}</th>
                    <th className="py-3 px-4 text-right">{t.colInterestShare}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {schedule.yearlySummaries.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        {t.yearPrefix} {row.year}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        {formatPrice(row.totalPaid, currency)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-emerald-400">
                        {formatPrice(row.principalPaid, currency)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-amber-400">
                        {formatPrice(row.interestPaid, currency)}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {formatPrice(row.endingBalance, currency)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 text-xs font-bold border border-slate-700">
                          {row.interestSharePercent}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {schedule.yearlySummaries.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500">
                        {t.noData}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-950/90 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="py-3 px-4">{t.colMonth}</th>
                    <th className="py-3 px-4">{t.colPayment}</th>
                    <th className="py-3 px-4">{t.colPrincipal}</th>
                    <th className="py-3 px-4">{t.colInterest}</th>
                    <th className="py-3 px-4">{t.colRemaining}</th>
                    <th className="py-3 px-4 text-right">{t.colCumulativeInterest}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 max-h-80">
                  {filteredPeriods.map((p) => (
                    <tr key={p.period} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-4 font-bold text-slate-300 font-mono">
                        #{p.period}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-white">
                        {formatPrice(p.payment, currency)}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-emerald-400">
                        {formatPrice(p.principalPayment, currency)}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-amber-400">
                        {formatPrice(p.interestPayment, currency)}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-300">
                        {formatPrice(p.remainingBalance, currency)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                        {formatPrice(p.cumulativeInterest, currency)}
                      </td>
                    </tr>
                  ))}
                  {filteredPeriods.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500">
                        {t.noData}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

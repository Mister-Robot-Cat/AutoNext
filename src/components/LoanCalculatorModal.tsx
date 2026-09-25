import React, { useState } from 'react';
import { Vehicle, Currency, Language } from '../types/vehicle';
import { formatPrice, TRANSLATIONS } from '../utils/i18n';
import { BANK_PROGRAMS } from '../data/mockVehicles';
import { calculateCarLoan } from '../utils/pricing';
import { X, Calculator, Building2, Check, ArrowRight } from 'lucide-react';

interface LoanCalculatorModalProps {
  initialVehicle?: Vehicle | null;
  currency: Currency;
  lang: Language;
  onClose: () => void;
}

export const LoanCalculatorModal: React.FC<LoanCalculatorModalProps> = ({
  initialVehicle,
  currency,
  lang,
  onClose,
}) => {
  const t = TRANSLATIONS[lang];

  const [carPrice, setCarPrice] = useState<number>(initialVehicle ? initialVehicle.priceAzn : 50000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(25);
  const [termMonths, setTermMonths] = useState<number>(36);
  const [selectedBankIndex, setSelectedBankIndex] = useState<number>(0);

  const selectedBank = BANK_PROGRAMS[selectedBankIndex];

  // Calculations using pure verified utility
  const {
    downPaymentAmount,
    principal,
    monthlyPayment,
    totalInterest,
    bankCommission,
  } = calculateCarLoan(
    carPrice,
    downPaymentPercent,
    termMonths,
    selectedBank.annualInterestRate,
    selectedBank.commissionPercent
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/60 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Ağıllı Avtokredit & Lizing Kalkulyatoru</h2>
              <p className="text-xs text-slate-400">
                Azərbaycanın aparıcı banklarının real faiz dərəcələri ilə aylıq ödənişi hesablayın
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Bank Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Bank və Kredit Proqramı
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {BANK_PROGRAMS.map((bank, idx) => (
                <button
                  key={bank.bankName}
                  type="button"
                  onClick={() => setSelectedBankIndex(idx)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    selectedBankIndex === idx
                      ? 'bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/15 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">{bank.logo}</span>
                    <span className="text-xs font-bold text-emerald-400">{bank.annualInterestRate}% illik</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-100">{bank.bankName}</h4>
                  <p className="text-[11px] text-slate-400 mt-1">İlkin: min {bank.minDownPaymentPercent}%</p>
                </button>
              ))}
            </div>
          </div>

          {/* Sliders Area */}
          <div className="space-y-5 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
            {/* Price input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase">Avtomobilin Qiyməti</span>
                <span className="text-lg font-black text-white">{formatPrice(carPrice, currency)}</span>
              </div>
              <input
                type="range"
                min="10000"
                max="250000"
                step="1000"
                value={carPrice}
                onChange={(e) => setCarPrice(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Down Payment Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase">
                  İlkin Ödəniş ({downPaymentPercent}%)
                </span>
                <span className="text-lg font-black text-emerald-400">
                  {formatPrice(downPaymentAmount, currency)}
                </span>
              </div>
              <input
                type="range"
                min={selectedBank.minDownPaymentPercent}
                max="80"
                step="5"
                value={downPaymentPercent}
                onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Loan Term */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase">
                  Müddət ({termMonths} ay / {Math.round((termMonths / 12) * 10) / 10} il)
                </span>
                <span className="text-sm font-bold text-white">{termMonths} ay</span>
              </div>
              <div className="flex gap-2">
                {[12, 24, 36, 48, 60].map((months) => (
                  <button
                    key={months}
                    type="button"
                    onClick={() => setTermMonths(months)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      termMonths === months
                        ? 'bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-500/25'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {months} ay
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/60 to-slate-950 border border-blue-800/50 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold uppercase text-slate-400">Təxmini Aylıq Ödəniş</span>
                <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  {formatPrice(monthlyPayment, currency)} <span className="text-sm text-slate-400 font-normal">/ ay</span>
                </div>
              </div>

              <div className="text-left sm:text-right text-xs space-y-1">
                <div className="text-slate-400">Kredit məbləği: <strong className="text-white">{formatPrice(principal, currency)}</strong></div>
                <div className="text-slate-400">Faiz borcu: <strong className="text-amber-400">+{formatPrice(totalInterest, currency)}</strong></div>
                <div className="text-slate-400">Bank komissiyası: <strong className="text-slate-300">+{formatPrice(bankCommission, currency)}</strong></div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span>* Hesablama təxminidir və bank tərəfindən təsdiq tələb edir.</span>
              <span className="text-emerald-400 font-semibold">Tələb olunan min. gəlir: ≈ {formatPrice(monthlyPayment * 2, currency)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

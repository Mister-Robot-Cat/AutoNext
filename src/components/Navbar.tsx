import React from 'react';
import { Currency, Language, Vehicle } from '../types/vehicle';
import { TRANSLATIONS } from '../utils/i18n';
import { 
  Car, 
  Sparkles, 
  Calculator, 
  Layers, 
  PlusCircle, 
  Globe, 
  Coins 
} from 'lucide-react';

interface NavbarProps {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  lang: Language;
  setLang: (l: Language) => void;
  comparedVehicles: Vehicle[];
  onOpenCompare: () => void;
  onOpenCalculator: () => void;
  onOpenAiAdvisor: () => void;
  onOpenCreateListing: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currency,
  setCurrency,
  lang,
  setLang,
  comparedVehicles,
  onOpenCompare,
  onOpenCalculator,
  onOpenAiAdvisor,
  onOpenCreateListing,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/25 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Car className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-white">
                Auto<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Next</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-0.5 hidden sm:block">Smart Auto Marketplace AZ</p>
          </div>
        </div>

        {/* Feature Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Advisor Button */}
          <button
            onClick={onOpenAiAdvisor}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500/15 to-indigo-500/15 hover:from-purple-500/25 hover:to-indigo-500/25 text-purple-300 border border-purple-500/30 text-xs sm:text-sm font-medium transition-all shadow-sm group"
          >
            <Sparkles className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden md:inline">AI Advisor</span>
          </button>

          {/* Loan Calculator Button */}
          <button
            onClick={onOpenCalculator}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs sm:text-sm font-medium transition-all"
          >
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">{t.creditCalculator}</span>
          </button>

          {/* Comparison Trigger */}
          <button
            onClick={onOpenCompare}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
              comparedVehicles.length > 0
                ? 'bg-blue-600/15 border-blue-500/50 text-blue-400'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 text-blue-400" />
            <span className="hidden md:inline">{t.compare}</span>
            {comparedVehicles.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-500 text-white">
                {comparedVehicles.length}
              </span>
            )}
          </button>

          {/* Currency Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            {(['AZN', 'USD', 'EUR'] as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-2 py-1 rounded-lg font-medium transition-all ${
                  currency === c
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {c === 'AZN' ? '₼' : c === 'USD' ? '$' : '€'}
              </button>
            ))}
          </div>

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            {(['az', 'ru', 'en'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-1 rounded-lg font-medium uppercase transition-all ${
                  lang === l
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Post Car Ad Button */}
          <button
            onClick={onOpenCreateListing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-500/20 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">{t.postAd}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

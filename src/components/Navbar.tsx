import React from 'react';
import { Currency, Language, Vehicle } from '../types/vehicle';
import { TRANSLATIONS } from '../utils/i18n';
import { 
  Car, 
  Sparkles, 
  Calculator, 
  Layers, 
  PlusCircle, 
  Heart,
  Sun,
  Moon,
  Zap,
  CircleParking,
  Fuel,
  FileCheck,
  Globe,
  Wrench,
  Recycle,
  ShieldAlert,
  Bus,
  Award
} from 'lucide-react';

interface NavbarProps {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  lang: Language;
  setLang: (l: Language) => void;
  theme: 'light' | 'dark' | 'system';
  onToggleTheme: () => void;
  comparedVehicles: Vehicle[];
  favoritesCount: number;
  isFavoritesFilterActive: boolean;
  onToggleFavoritesFilter: () => void;
  onOpenCompare: () => void;
  onOpenCalculator: () => void;
  onOpenAiAdvisor: () => void;
  onOpenCreateListing: () => void;
  onOpenEvCharging?: () => void;
  onOpenParking?: () => void;
  onOpenFuelStations?: () => void;
  onOpenEuroprotocol?: () => void;
  onOpenGreenCard?: () => void;
  onOpenTaxiCompliance?: () => void;
  onOpenTuningCompliance?: () => void;
  onOpenScrappage?: () => void;
  onOpenImpoundLot?: () => void;
  onOpenSpecialTraffic?: () => void;
  onOpenDriverLicense?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currency,
  setCurrency,
  lang,
  setLang,
  theme,
  onToggleTheme,
  comparedVehicles,
  favoritesCount,
  isFavoritesFilterActive,
  onToggleFavoritesFilter,
  onOpenCompare,
  onOpenCalculator,
  onOpenAiAdvisor,
  onOpenCreateListing,
  onOpenEvCharging,
  onOpenParking,
  onOpenFuelStations,
  onOpenEuroprotocol,
  onOpenGreenCard,
  onOpenTaxiCompliance,
  onOpenTuningCompliance,
  onOpenScrappage,
  onOpenImpoundLot,
  onOpenSpecialTraffic,
  onOpenDriverLicense,
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
          {/* Fuel Station Radar Button */}
          {onOpenFuelStations && (
            <button
              onClick={onOpenFuelStations}
              data-testid="navbar-fuel-stations-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="SOCAR & Azpetrol Yanacaq Radarı və Tarif Şurası"
            >
              <Fuel className="w-4 h-4 text-amber-400" />
              <span className="hidden xl:inline">Yanacaq Radarı</span>
            </button>
          )}

          {/* AzParking Radar Button */}
          {onOpenParking && (
            <button
              onClick={onOpenParking}
              data-testid="navbar-parking-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="AYNA AzParking Dövlət Radarı"
            >
              <CircleParking className="w-4 h-4 text-sky-400" />
              <span className="hidden xl:inline">AzParking</span>
            </button>
          )}

          {/* EV Charging Network Button */}
          {onOpenEvCharging && (
            <button
              onClick={onOpenEvCharging}
              data-testid="navbar-ev-charging-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="Azərişıq & TokBaku EV Şəbəkəsi"
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="hidden xl:inline">EV Şəbəkə</span>
            </button>
          )}

          {/* Europrotocol Portal Button */}
          {onOpenEuroprotocol && (
            <button
              onClick={onOpenEuroprotocol}
              data-testid="navbar-europrotocol-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="İSB & BDYP Rəsmi Avroprotokol Sistemi"
            >
              <FileCheck className="w-4 h-4 text-teal-400" />
              <span className="hidden xl:inline">Avroprotokol</span>
            </button>
          )}

          {/* Green Card & Cross-Border Button */}
          {onOpenGreenCard && (
            <button
              onClick={onOpenGreenCard}
              data-testid="navbar-green-card-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="İSB Beynəlxalq Yaşıl Kart & Sərhəd Keçid Radarı"
            >
              <Globe className="w-4 h-4 text-emerald-400" />
              <span className="hidden xl:inline">Yaşıl Kart</span>
            </button>
          )}

          {/* AYNA Taxi Compliance Button */}
          {onOpenTaxiCompliance && (
            <button
              onClick={onOpenTaxiCompliance}
              data-testid="navbar-taxi-compliance-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="AYNA Taksi Buraxılış Portalı & Standartlar"
            >
              <Car className="w-4 h-4 text-amber-400" />
              <span className="hidden xl:inline">AYNA Taksi</span>
            </button>
          )}

          {/* BDYP Constructive Tuning & Autogas Button */}
          {onOpenTuningCompliance && (
            <button
              onClick={onOpenTuningCompliance}
              data-testid="navbar-tuning-compliance-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="BDYP & AZS Tüninq, Qazbalon (LPG/CNG) və Konstruktiv Dəyişiklik Portalı"
            >
              <Wrench className="w-4 h-4 text-orange-400" />
              <span className="hidden xl:inline">Tüninq & Qaz</span>
            </button>
          )}

          {/* Təmiz Şəhər ASC Vehicle Scrappage & Voucher Button */}
          {onOpenScrappage && (
            <button
              onClick={onOpenScrappage}
              data-testid="navbar-scrappage-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="Təmiz Şəhər ASC — Köhnə Avtomobillərin Utilizasiyası və Güzəşt Vauçeri Portalı"
            >
              <Recycle className="w-4 h-4 text-emerald-400" />
              <span className="hidden xl:inline">Utilizasiya</span>
            </button>
          )}

          {/* BDYP & AYNA Impound Lot & Towing Release Button */}
          {onOpenImpoundLot && (
            <button
              onClick={onOpenImpoundLot}
              data-testid="navbar-impound-lot-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="BDYP & AYNA Cərimə Meydançası Axtarışı, Evakuasiya Yoxlaması və E-Buraxılış Portalı"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span className="hidden xl:inline">Cərimə Meydançası</span>
            </button>
          )}

          {/* AYNA Bus Lane & Baku Special Traffic Regime Button */}
          {onOpenSpecialTraffic && (
            <button
              onClick={onOpenSpecialTraffic}
              data-testid="navbar-special-traffic-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="AYNA Avtobus Zolağı (İXM 327.1-1) & Bakı Giriş E-Buraxılış Portalı"
            >
              <Bus className="w-4 h-4 text-sky-400" />
              <span className="hidden xl:inline">BUS Zolaq & E-Giriş</span>
            </button>
          )}

          {/* BDYP Driver's License Category (B/BE) & Exam Portal Button */}
          {onOpenDriverLicense && (
            <button
              onClick={onOpenDriverLicense}
              data-testid="navbar-driver-license-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="BDYP & ASAN Sürücülük Vəsiqəsi, Kateqoriya (B/BE) və İmtahan Portalı"
            >
              <Award className="w-4 h-4 text-indigo-400" />
              <span className="hidden xl:inline">Sürücülük Vəsiqəsi</span>
            </button>
          )}

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

          {/* Favorites (Watchlist) Trigger */}
          <button
            onClick={onToggleFavoritesFilter}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
              isFavoritesFilterActive
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-sm shadow-rose-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-rose-400'
            }`}
            title="Bəyənilən avtomobillər"
          >
            <Heart className={`w-4 h-4 ${favoritesCount > 0 ? 'text-rose-400 fill-rose-500/30' : 'text-slate-400'}`} />
            <span className="hidden lg:inline">Seçilmişlər</span>
            {favoritesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                {favoritesCount}
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

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-500/30 transition-all"
            title={lang === 'az' ? 'MTvzunu dTyiY' : lang === 'en' ? 'Toggle theme' : 'D!D<DD1D,,O ,DD<C'}
          >
            {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

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

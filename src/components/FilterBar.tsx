import React from 'react';
import { FilterState, BodyType, FuelType, Language } from '../types/vehicle';
import { TRANSLATIONS } from '../utils/i18n';
import { 
  Search, 
  RotateCcw, 
  ShieldCheck, 
  Percent, 
  Zap, 
  SlidersHorizontal 
} from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  makes: string[];
  models: string[];
  cities: string[];
  totalResults: number;
  lang: Language;
}

const BODY_TYPES: { id: BodyType | 'all'; labelAz: string; labelEn: string; icon: string }[] = [
  { id: 'all', labelAz: 'Bütün tiplər', labelEn: 'All Bodies', icon: '🚙' },
  { id: 'sedan', labelAz: 'Sedan', labelEn: 'Sedan', icon: '🚗' },
  { id: 'suv', labelAz: 'Krossover / SUV', labelEn: 'SUV', icon: '🚙' },
  { id: 'coupe', labelAz: 'Kupe', labelEn: 'Coupe', icon: '🏎️' },
  { id: 'hatchback', labelAz: 'Hetçbek', labelEn: 'Hatchback', icon: '🚗' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  makes,
  models,
  cities,
  totalResults,
  lang,
}) => {
  const t = TRANSLATIONS[lang];

  const handleReset = () => {
    setFilters({
      searchQuery: '',
      make: '',
      model: '',
      minPrice: 0,
      maxPrice: 250000,
      minYear: 2010,
      maxYear: 2026,
      bodyType: 'all',
      fuelType: 'all',
      transmission: 'all',
      drivetrain: 'all',
      city: '',
      verifiedOnly: false,
      greatDealOnly: false,
      creditOnly: false,
      barterOnly: false,
      sortBy: 'recommended',
    });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl mb-8">
      {/* Search Input Bar */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
          placeholder={t.searchPlaceholder}
          className="w-full pl-12 pr-4 py-3.5 bg-slate-950/70 border border-slate-700/80 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm sm:text-base"
        />
      </div>

      {/* Body Type Quick Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
        {BODY_TYPES.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, bodyType: type.id }))}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
              filters.bodyType === type.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 border border-blue-400'
                : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>{type.icon}</span>
            <span>{lang === 'en' ? type.labelEn : type.labelAz}</span>
          </button>
        ))}
      </div>

      {/* Main Filter Dropdowns Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {/* Make Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Marka
          </label>
          <select
            value={filters.make}
            onChange={(e) => setFilters((prev) => ({ ...prev, make: e.target.value, model: '' }))}
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">{t.allMakes}</option>
            {makes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Model Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Model
          </label>
          <select
            value={filters.model}
            onChange={(e) => setFilters((prev) => ({ ...prev, model: e.target.value }))}
            disabled={!filters.make}
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
          >
            <option value="">{t.allModels}</option>
            {models.map((mod) => (
              <option key={mod} value={mod}>
                {mod}
              </option>
            ))}
          </select>
        </div>

        {/* Fuel Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            {t.fuel}
          </label>
          <select
            value={filters.fuelType}
            onChange={(e) => setFilters((prev) => ({ ...prev, fuelType: e.target.value as FuelType | 'all' }))}
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Hamısı</option>
            <option value="petrol">Benzin</option>
            <option value="hybrid">Hibrid</option>
            <option value="electric">Elektrik</option>
            <option value="diesel">Dizel</option>
          </select>
        </div>

        {/* City */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            {t.city}
          </label>
          <select
            value={filters.city}
            onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">{t.allCities}</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Toggles: Great Deal, Verified, Credit */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {/* Great Deal Filter (AI Powered) */}
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, greatDealOnly: !prev.greatDealOnly }))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filters.greatDealOnly
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-sm shadow-emerald-500/20'
                : 'bg-slate-950/50 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Percent className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.greatDealOnly} (AI)</span>
          </button>

          {/* Verified Only */}
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, verifiedOnly: !prev.verifiedOnly }))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filters.verifiedOnly
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-sm shadow-blue-500/20'
                : 'bg-slate-950/50 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>{t.verifiedOnly}</span>
          </button>

          {/* Credit Available */}
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, creditOnly: !prev.creditOnly }))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filters.creditOnly
                ? 'bg-purple-500/20 text-purple-400 border-purple-500/50'
                : 'bg-slate-950/50 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span>{t.creditAvailable}</span>
          </button>
        </div>

        {/* Results Counter & Reset */}
        <div className="flex items-center gap-4 text-xs">
          <span className="text-slate-400">
            <strong className="text-blue-400 font-bold">{totalResults}</strong> {t.foundCars}
          </span>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.resetFilters}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { FilterState, BodyType, FuelType, Language } from '../types/vehicle';
import { TRANSLATIONS } from '../utils/i18n';
import { useDebounce } from '../hooks/useDebounce';
import { 
  Search, 
  RotateCcw, 
  ShieldCheck, 
  Percent, 
  Zap, 
  SlidersHorizontal,
  X,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { useSavedSearches } from '../hooks/useSavedSearches';

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
  const [localSearch, setLocalSearch] = useState(filters.searchQuery);
  const debouncedSearch = useDebounce(localSearch, 300);
  const { savedSearches, saveSearch, deleteSearch } = useSavedSearches();
  const [isSavingSearch, setIsSavingSearch] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');

  useEffect(() => {
    setLocalSearch(filters.searchQuery);
  }, [filters.searchQuery]);

  useEffect(() => {
    setFilters((prev) => {
      if (prev.searchQuery !== debouncedSearch) {
        return { ...prev, searchQuery: debouncedSearch };
      }
      return prev;
    });
  }, [debouncedSearch, setFilters]);

  const activeFilters: { label: string; onRemove: () => void }[] = [];

  if (filters.make) {
    activeFilters.push({ label: filters.make, onRemove: () => setFilters((prev) => ({ ...prev, make: '', model: '' })) });
  }
  if (filters.model) {
    activeFilters.push({ label: filters.model, onRemove: () => setFilters((prev) => ({ ...prev, model: '' })) });
  }
  if (filters.city) {
    activeFilters.push({ label: filters.city, onRemove: () => setFilters((prev) => ({ ...prev, city: '' })) });
  }
  if (filters.bodyType !== 'all') {
    const bt = BODY_TYPES.find((b) => b.id === filters.bodyType);
    if (bt) activeFilters.push({ label: lang === 'en' ? bt.labelEn : bt.labelAz, onRemove: () => setFilters((prev) => ({ ...prev, bodyType: 'all' })) });
  }
  if (filters.fuelType !== 'all') {
    const fuelMap: Record<string, string> = { petrol: 'Benzin', hybrid: 'Hibrid', electric: 'Elektrik', diesel: 'Dizel' };
    activeFilters.push({ label: fuelMap[filters.fuelType] || filters.fuelType, onRemove: () => setFilters((prev) => ({ ...prev, fuelType: 'all' })) });
  }

  const handleReset = () => {
    setLocalSearch('');
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
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
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

      {/* Active Filters Pills */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs font-semibold text-slate-500 uppercase mr-1">{lang === 'en' ? 'Active Filters:' : 'Aktiv filtrlər:'}</span>
          {activeFilters.map((af, idx) => (
            <span key={idx} className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 text-slate-300 text-xs rounded-lg border border-slate-700/50">
              {af.label}
              <button onClick={af.onRemove} className="text-slate-500 hover:text-slate-200 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
          <button onClick={handleReset} className="text-xs text-blue-400 hover:text-blue-300 ml-2 transition-colors font-medium">
            {t.resetFilters}
          </button>
        </div>
      )}

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
          <button
            type="button"
            onClick={() => setIsSavingSearch(true)}
            className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors font-medium border border-blue-500/30 px-2 py-1 rounded-lg bg-blue-500/10"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{lang === 'az' ? 'Axtarışı yadda saxla' : lang === 'en' ? 'Save search' : 'Сохранить поиск'}</span>
          </button>

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

      {/* Save Search Input Area */}
      {isSavingSearch && (
        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <input
            type="text"
            value={saveSearchName}
            onChange={(e) => setSaveSearchName(e.target.value)}
            placeholder={lang === 'az' ? 'Axtarışın adı (məs: Ucuz Sedanlar)' : 'Search name'}
            className="flex-1 px-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
            autoFocus
          />
          <button
            onClick={() => {
              if (saveSearchName.trim()) {
                saveSearch(saveSearchName.trim(), filters);
                setSaveSearchName('');
                setIsSavingSearch(false);
              }
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20"
          >
            {lang === 'az' ? 'Saxla' : 'Save'}
          </button>
          <button
            onClick={() => {
              setIsSavingSearch(false);
              setSaveSearchName('');
            }}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Saved Searches Pills */}
      {savedSearches.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-800/50 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <BookmarkCheck className="w-3.5 h-3.5" />
            {lang === 'az' ? 'Yadda saxlanılan axtarışlar:' : 'Saved searches:'}
          </span>
          {savedSearches.map((s) => (
            <div key={s.id} className="flex items-center gap-1 bg-slate-800/60 border border-slate-700/50 rounded-lg px-2 py-1 group">
              <button
                onClick={() => setFilters({ ...filters, ...s.filters })}
                className="text-xs text-blue-300 hover:text-blue-200 transition-colors truncate max-w-[150px]"
              >
                {s.name}
              </button>
              <button
                onClick={() => deleteSearch(s.id)}
                className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

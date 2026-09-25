import React, { useState, useMemo, useEffect } from 'react';
import { Vehicle, FilterState, Currency, Language } from './types/vehicle';
import { MOCK_VEHICLES } from './data/mockVehicles';
import { TRANSLATIONS, formatPrice } from './utils/i18n';
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { CarCard } from './components/CarCard';
import { CarDetailModal } from './components/CarDetailModal';
import { CarComparator } from './components/CarComparator';
import { LoanCalculatorModal } from './components/LoanCalculatorModal';
import { 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  TrendingDown, 
  Calculator, 
  ArrowRight, 
  X, 
  Plus, 
  Check, 
  Zap, 
  Send, 
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  Car
} from 'lucide-react';

export function App() {
  const [currency, setCurrency] = useState<Currency>('AZN');
  const [lang, setLang] = useState<Language>('az');
  const t = TRANSLATIONS[lang];

  // Vehicles state
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [comparedVehicleIds, setComparedVehicleIds] = useState<string[]>([]);

  // Favorites (Watchlist) persisted state
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('autonext_favorites') || '[]');
    } catch {
      return [];
    }
  });
  const [isFavoritesFilterActive, setIsFavoritesFilterActive] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('autonext_favorites', JSON.stringify(favoriteIds));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [favoriteIds]);

  const toggleFavorite = (car: Vehicle) => {
    setFavoriteIds((prev) =>
      prev.includes(car.id) ? prev.filter((id) => id !== car.id) : [...prev, car.id]
    );
  };

  // Modal visibility states
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [loanCarTarget, setLoanCarTarget] = useState<Vehicle | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false);

  // AI Advisor query
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiActivePreset, setAiActivePreset] = useState('Baku tıxaclarında az yandıran hibrid və ya elektrik maşın');

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
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

  // Extract unique makes, models, cities
  const uniqueMakes = useMemo(() => Array.from(new Set(vehicles.map((v) => v.make))).sort(), [vehicles]);
  const uniqueModels = useMemo(() => {
    if (!filters.make) return [];
    return Array.from(new Set(vehicles.filter((v) => v.make === filters.make).map((v) => v.model))).sort();
  }, [vehicles, filters.make]);
  const uniqueCities = useMemo(() => Array.from(new Set(vehicles.map((v) => v.city))).sort(), [vehicles]);

  // Filter logic
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((car) => {
      // Search text query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matches = 
          car.title.toLowerCase().includes(query) ||
          car.make.toLowerCase().includes(query) ||
          car.model.toLowerCase().includes(query) ||
          car.city.toLowerCase().includes(query) ||
          car.vin.toLowerCase().includes(query);
        if (!matches) return false;
      }

      // Make
      if (filters.make && car.make !== filters.make) return false;

      // Model
      if (filters.model && car.model !== filters.model) return false;

      // Body Type
      if (filters.bodyType !== 'all' && car.bodyType !== filters.bodyType) return false;

      // Fuel Type
      if (filters.fuelType !== 'all' && car.fuelType !== filters.fuelType) return false;

      // City
      if (filters.city && car.city !== filters.city) return false;

      // Toggles
      if (isFavoritesFilterActive && !favoriteIds.includes(car.id)) return false;
      if (filters.verifiedOnly && !car.isVerified) return false;
      if (filters.greatDealOnly && car.valuation.status !== 'great_deal') return false;
      if (filters.creditOnly && !car.isCreditAvailable) return false;

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price_asc') return a.priceAzn - b.priceAzn;
      if (filters.sortBy === 'price_desc') return b.priceAzn - a.priceAzn;
      if (filters.sortBy === 'mileage_asc') return a.mileageKm - b.mileageKm;
      if (filters.sortBy === 'year_desc') return b.year - a.year;
      // Recommended: featured first, then great deals
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return 0;
    });
  }, [vehicles, filters, isFavoritesFilterActive, favoriteIds]);

  // Comparison Handlers
  const toggleCompare = (car: Vehicle) => {
    setComparedVehicleIds((prev) => {
      if (prev.includes(car.id)) {
        return prev.filter((id) => id !== car.id);
      }
      if (prev.length >= 4) {
        alert('Maksimum 4 avtomobili eyni anda müqayisə edə bilərsiniz.');
        return prev;
      }
      return [...prev, car.id];
    });
  };

  const comparedVehicles = useMemo(
    () => vehicles.filter((v) => comparedVehicleIds.includes(v.id)),
    [vehicles, comparedVehicleIds]
  );

  const removeComparedVehicle = (id: string) => {
    setComparedVehicleIds((prev) => prev.filter((carId) => carId !== id));
  };

  // AI Filtered recommendations
  const aiRecommendations = useMemo(() => {
    const q = (aiActivePreset + ' ' + aiPrompt).toLowerCase();
    if (q.includes('hibrid') || q.includes('elektrik') || q.includes('qənaət') || q.includes('az yandıran')) {
      return vehicles.filter((v) => v.fuelType === 'hybrid' || v.fuelType === 'electric');
    }
    if (q.includes('suv') || q.includes('krossover') || q.includes('ailə')) {
      return vehicles.filter((v) => v.bodyType === 'suv');
    }
    if (q.includes('lüks') || q.includes('güc') || q.includes('amg') || q.includes('porsche')) {
      return vehicles.filter((v) => v.powerHp > 250 || v.priceAzn > 70000);
    }
    return vehicles.slice(0, 3);
  }, [vehicles, aiActivePreset, aiPrompt]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Header / Navbar */}
      <Navbar
        currency={currency}
        setCurrency={setCurrency}
        lang={lang}
        setLang={setLang}
        comparedVehicles={comparedVehicles}
        favoritesCount={favoriteIds.length}
        isFavoritesFilterActive={isFavoritesFilterActive}
        onToggleFavoritesFilter={() => setIsFavoritesFilterActive((prev) => !prev)}
        onOpenCompare={() => setIsCompareOpen(true)}
        onOpenCalculator={() => {
          setLoanCarTarget(null);
          setIsLoanModalOpen(true);
        }}
        onOpenAiAdvisor={() => setIsAiModalOpen(true)}
        onOpenCreateListing={() => setIsCreateListingOpen(true)}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-16 border-b border-slate-800/80">
        {/* Glowing background circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-blue-600/20 via-indigo-500/20 to-purple-600/20 blur-3xl pointer-events-none rounded-full" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-inner backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-200">
              Ağıllı Süni İntellekt ilə Təchiz Olunmuş Avtomobil Ekosistemi
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Avtomobil alqı-satqısında <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-300">
              Yeni Nəsil Zəka & Şəffaflıq
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto font-normal">
            Süni intellekt ilə real bazar qiymətinin hesablanması, rəqəmsal zədə xəritəsi və avtomobillərin canlı müqayisəsi.
          </p>

          {/* Key Differentiators Counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto pt-4 text-left">
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
                <TrendingDown className="w-4 h-4" />
                <span>AI Qiymətləndirmə</span>
              </div>
              <p className="text-slate-300 text-xs">Hər maşının bazar dəyərindən fərqi saniyəsində görünür</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold mb-1">
                <Layers className="w-4 h-4" />
                <span>Canlı Müqayisə</span>
              </div>
              <p className="text-slate-300 text-xs">4 maşını yan-yana qoyun, üstün cəhətləri avtomatik görün</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Zədə & Boya Xəritəsi</span>
              </div>
              <p className="text-slate-300 text-xs">Hansı detal dəyişilib və ya rənglənib gizlədilmir</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
                <Calculator className="w-4 h-4" />
                <span>Daxili Bank Kreditləri</span>
              </div>
              <p className="text-slate-300 text-xs">Kapital, ABB və Unibank faizləri ilə dərhal aylıq ödəniş</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          makes={uniqueMakes}
          models={uniqueModels}
          cities={uniqueCities}
          totalResults={filteredVehicles.length}
          lang={lang}
        />

        {/* Vehicle Grid */}
        {filteredVehicles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVehicles.map((car) => (
              <CarCard
                key={car.id}
                vehicle={car}
                currency={currency}
                lang={lang}
                isCompared={comparedVehicleIds.includes(car.id)}
                isFavorite={favoriteIds.includes(car.id)}
                onToggleFavorite={toggleFavorite}
                onToggleCompare={toggleCompare}
                onSelect={setSelectedVehicle}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4 bg-slate-900/40 rounded-3xl border border-slate-800">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Car className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Axtarışa uyğun elan tapılmadı</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Zəhmət olmasa axtarış parametrlərini genişləndirin və ya filtrləri sıfırlayın.
            </p>
            <button
              onClick={() =>
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
                })
              }
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
            >
              Bütün filtrləri sıfırla
            </button>
          </div>
        )}
      </main>

      {/* Floating Bottom Comparison Drawer (when cars are picked) */}
      {comparedVehicles.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-2xl bg-slate-900/95 border border-blue-500/50 rounded-2xl p-3 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-bold text-blue-400 whitespace-nowrap pl-2">
              Müqayisə ({comparedVehicles.length}/4):
            </span>
            <div className="flex gap-2">
              {comparedVehicles.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800 text-xs text-white border border-slate-700 flex-shrink-0"
                >
                  <span className="truncate max-w-[100px]">{c.title}</span>
                  <button
                    onClick={() => removeComparedVehicle(c.id)}
                    className="text-slate-400 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setComparedVehicleIds([])}
              className="text-xs text-slate-400 hover:text-white px-2"
            >
              Təmizlə
            </button>
            <button
              onClick={() => setIsCompareOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Müqayisə et</span>
            </button>
          </div>
        </div>
      )}

      {/* Car Detail Modal */}
      <CarDetailModal
        vehicle={selectedVehicle}
        currency={currency}
        lang={lang}
        onClose={() => setSelectedVehicle(null)}
        onOpenLoanForCar={(car) => {
          setSelectedVehicle(null);
          setLoanCarTarget(car);
          setIsLoanModalOpen(true);
        }}
      />

      {/* Car Comparator Modal */}
      {isCompareOpen && (
        <CarComparator
          vehicles={comparedVehicles}
          currency={currency}
          lang={lang}
          onRemoveVehicle={removeComparedVehicle}
          onClose={() => setIsCompareOpen(false)}
          onSelectVehicle={(v) => {
            setIsCompareOpen(false);
            setSelectedVehicle(v);
          }}
        />
      )}

      {/* Loan Calculator Modal */}
      {isLoanModalOpen && (
        <LoanCalculatorModal
          initialVehicle={loanCarTarget}
          currency={currency}
          lang={lang}
          onClose={() => {
            setIsLoanModalOpen(false);
            setLoanCarTarget(null);
          }}
        />
      )}

      {/* AI Advisor Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* AI Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/60 sticky top-0 z-20 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-lg shadow-purple-500/25">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <span>AutoNext AI Məsləhətçi</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      GPT-4o Vision Powered
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">Büdcənizə və istəyinizə uyğun ən doğru avtomobili saniyələr içində seçin</p>
                </div>
              </div>

              <button
                onClick={() => setIsAiModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
              {/* Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Hazır Axtarış Ssenariləri
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { title: 'Şəhər üçün ən qənaətcil (Hibrid / EV)', q: 'Baku tıxaclarında az yandıran hibrid və ya elektrik maşın', tag: 'Qənaət' },
                    { title: 'Ailə üçün geniş və təhlükəsiz Krossover (SUV)', q: 'Böyük ailə üçün təhlükəsiz və geniş baqajlı SUV', tag: 'Ailə' },
                    { title: 'Lüks və yüksək status (AMG / GTS / LC250)', q: 'Gözəl səs, güclü mühərrik və maksimal statuslu maşın', tag: 'Status' },
                    { title: '50 000 AZN-ə qədər etibarlı biznes sedan', q: '50000 AZN büdcə ilə konfortlu və dözümlü sedan', tag: 'Biznes' },
                  ].map((preset) => (
                    <button
                      key={preset.title}
                      type="button"
                      onClick={() => {
                        setAiActivePreset(preset.q);
                        setAiPrompt('');
                      }}
                      className={`p-3 rounded-2xl border text-left text-xs transition-all flex items-center justify-between gap-3 ${
                        aiActivePreset === preset.q
                          ? 'bg-purple-600/15 border-purple-500 text-white shadow-md shadow-purple-500/15'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/40 hover:text-white'
                      }`}
                    >
                      <span className="font-semibold">{preset.title}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-purple-400 flex-shrink-0">
                        {preset.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Prompt Box */}
              <div className="relative">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Məsələn: 25.000 AZN-ə qədər az yandıran, ehtiyat hissəsi ucuz maşın..."
                  className="w-full pl-4 pr-12 py-3.5 bg-slate-950/80 border border-slate-700 rounded-2xl text-white text-sm focus:outline-none focus:border-purple-500 transition-all placeholder-slate-500"
                />
                <button
                  onClick={() => {
                    if (aiPrompt.trim()) setAiActivePreset(aiPrompt);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md shadow-purple-600/30"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* AI Diagnosis */}
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-800/30 flex items-start gap-3">
                <Zap className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs sm:text-sm text-slate-300 space-y-1">
                  <strong className="text-purple-300 block font-semibold">
                    AutoNext Ağıllı Uyğunluq Nəticəsi:
                  </strong>
                  <p className="leading-relaxed">
                    «{aiActivePreset}» meyarlarına əsasən Bakı bazarındakı avtomobillər təhlil edildi. Aşağıdakı modellər ən yüksək etibarlılıq və yanacaq səmərəliliyi göstəricilərinə malikdir:
                  </p>
                </div>
              </div>

              {/* Recommended Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {aiRecommendations.map((car) => (
                  <div
                    key={car.id}
                    onClick={() => {
                      setIsAiModalOpen(false);
                      setSelectedVehicle(car);
                    }}
                    className="group bg-slate-950/80 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02]"
                  >
                    <div>
                      <img
                        src={car.images[0]}
                        alt={car.title}
                        className="w-full h-32 object-cover rounded-xl mb-2.5"
                      />
                      <h4 className="font-bold text-white text-sm group-hover:text-purple-400 transition-colors line-clamp-1">
                        {car.title}
                      </h4>
                      <p className="text-xs text-slate-400 mb-2">
                        {car.year} • {car.fuelConsumptionLPer100Km === 0 ? '0 L (EV)' : `${car.fuelConsumptionLPer100Km} L/100km`}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="font-black text-white text-sm">
                        {formatPrice(car.priceAzn, currency)}
                      </span>
                      <span className="text-xs font-semibold text-purple-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Seç <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Listing Modal */}
      {isCreateListingOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-black text-white">Yeni Elan Yerləşdir</h3>
                <p className="text-xs text-slate-400">AutoNext alqoritmləri avtomobiliniz üçün real bazar qiymətini avtomatik hesablayır</p>
              </div>
              <button
                onClick={() => setIsCreateListingOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">VIN Kod</label>
                <input
                  type="text"
                  placeholder="Məsələn: WBA5A7C50JB192841"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Marka & Model</label>
                  <input
                    type="text"
                    placeholder="Toyota Camry"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Buraxılış İli</label>
                  <input
                    type="number"
                    defaultValue={2022}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Yürüş (km)</label>
                  <input
                    type="number"
                    defaultValue={45000}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Təklif Qiyməti (AZN)</label>
                  <input
                    type="number"
                    defaultValue={52000}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white font-bold text-emerald-400"
                  />
                </div>
              </div>

              {/* Instant Fair-Price Indicator */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300 flex items-center justify-between">
                <div>
                  <span className="font-bold">AI Bazar Təhlili: </span>
                  Bu avtomobil üçün Bakı üzrə orta bazar qiyməti: <strong>51 500 AZN</strong>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                  Bazar Qiyməti
                </span>
              </div>

              <button
                onClick={() => {
                  alert('Elanınız uğurla yerləşdirildi və moderasiyaya göndərildi!');
                  setIsCreateListingOpen(false);
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold transition-all shadow-lg shadow-blue-600/20"
              >
                Elanı Dərc Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-10 mt-16 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-200 text-sm">AutoNext Azerbaijan</span>
              <p className="text-[11px] text-slate-500">Next-generation smart automotive marketplace</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <span>© 2026 AutoNext. All rights reserved.</span>
            <span>Developed for Mister-Robot-Cat</span>
            <a href="https://github.com/Mister-Robot-Cat/AutoNext" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
              GitHub Repo
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

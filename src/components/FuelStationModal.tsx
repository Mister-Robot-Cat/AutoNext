import React, { useState, useMemo } from 'react';
import { Currency, Language, Vehicle } from '../types/vehicle';
import { formatPrice } from '../utils/i18n';
import { 
  FuelGrade, 
  FuelStationBrand, 
  StationAmenity, 
  FuelStation, 
  HighwayRoute, 
  CashbackProvider, 
  FuelVoucher 
} from '../types/fuel';
import { MOCK_FUEL_STATIONS, MOCK_HIGHWAY_ROUTES } from '../data/mockFuelStations';
import { 
  TARIF_SURASI_PRICES, 
  FUEL_DISPLAY_NAMES, 
  AMENITY_LABELS, 
  mapVehicleFuelTypeToGrade, 
  getOfficialFuelPrice, 
  calculateTripFuel, 
  calculateFullTank, 
  filterStations, 
  generateFuelVoucher 
} from '../utils/fuelStations';
import { useScrollLock } from '../hooks/useScrollLock';
import { useKeyPress } from '../hooks/useKeyPress';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { 
  X, 
  Fuel, 
  Search, 
  MapPin, 
  Navigation, 
  Clock, 
  Sparkles, 
  Zap, 
  CheckCircle, 
  Copy, 
  Check, 
  Printer, 
  CreditCard, 
  Car, 
  Route as RouteIcon, 
  Scale, 
  Info, 
  Building2, 
  Gauge, 
  Sliders, 
  Percent,
  CheckCircle2,
  FileText,
  Phone
} from 'lucide-react';

export interface FuelStationModalProps {
  isOpen: boolean;
  vehicle?: Vehicle | null;
  currency: Currency;
  lang: Language;
  onClose: () => void;
}

type TabType = 'radar' | 'calculator' | 'tank' | 'voucher' | 'tariffs';

export function FuelStationModal({
  isOpen,
  vehicle,
  currency,
  lang,
  onClose,
}: FuelStationModalProps) {
  useScrollLock(isOpen);
  useKeyPress('Escape', onClose);
  const [copiedText, copyToClipboard] = useCopyToClipboard();

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>('radar');

  // Search & Filter state for Radar
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<FuelStationBrand | 'All'>('All');
  const [selectedFuelGrade, setSelectedFuelGrade] = useState<FuelGrade | 'All'>('All');
  const [selectedAmenity, setSelectedAmenity] = useState<StationAmenity | 'All'>('All');
  const [only24Hours, setOnly24Hours] = useState(false);

  // Selected station for details or vouchers
  const [selectedStation, setSelectedStation] = useState<FuelStation>(MOCK_FUEL_STATIONS[0]);

  // Trip Calculator State
  const initialGrade = useMemo(() => {
    return vehicle 
      ? mapVehicleFuelTypeToGrade(vehicle.fuelType, vehicle.engineVolumeLiters)
      : 'ai92';
  }, [vehicle]);

  const [tripFuelGrade, setTripFuelGrade] = useState<FuelGrade>(initialGrade);
  const [selectedRoute, setSelectedRoute] = useState<HighwayRoute>(MOCK_HIGHWAY_ROUTES[0]);
  const [customDistanceKm, setCustomDistanceKm] = useState<number>(MOCK_HIGHWAY_ROUTES[0].distanceKm);
  const [useCustomDistance, setUseCustomDistance] = useState(false);
  const [consumptionLPer100Km, setConsumptionLPer100Km] = useState<number>(
    vehicle?.fuelConsumptionLPer100Km && vehicle.fuelConsumptionLPer100Km > 0 
      ? vehicle.fuelConsumptionLPer100Km 
      : 8.2
  );
  const [withAC, setWithAC] = useState(true);
  const [passengerCount, setPassengerCount] = useState(2);
  const [cityTrafficRatio, setCityTrafficRatio] = useState(0.25);
  const [cargoWeightKg, setCargoWeightKg] = useState(40);
  const [cashbackProvider, setCashbackProvider] = useState<CashbackProvider>('birbank');

  // Full Tank Calculator State
  const [tankCapacityL, setTankCapacityL] = useState<number>(
    vehicle?.bodyType === 'suv' ? 70 : 55
  );
  const [currentTankLevelPercent, setCurrentTankLevelPercent] = useState<number>(25);
  const [tankFuelGrade, setTankFuelGrade] = useState<FuelGrade>(initialGrade);

  // Generated Voucher state
  const [voucher, setVoucher] = useState<FuelVoucher | null>(null);

  // Filtered stations list
  const filteredStations = useMemo(() => {
    return filterStations(MOCK_FUEL_STATIONS, {
      query: searchQuery,
      brand: selectedBrand,
      fuelGrade: selectedFuelGrade,
      amenity: selectedAmenity,
      only24Hours,
    });
  }, [searchQuery, selectedBrand, selectedFuelGrade, selectedAmenity, only24Hours]);

  // Trip calculation results
  const tripDistance = useCustomDistance ? customDistanceKm : selectedRoute.distanceKm;
  const tripCalculation = useMemo(() => {
    return calculateTripFuel(
      tripDistance,
      consumptionLPer100Km,
      tripFuelGrade,
      {
        withAC,
        passengerCount,
        cityTrafficRatio,
        cargoWeightKg,
      },
      currency,
      cashbackProvider
    );
  }, [
    tripDistance, 
    consumptionLPer100Km, 
    tripFuelGrade, 
    withAC, 
    passengerCount, 
    cityTrafficRatio, 
    cargoWeightKg, 
    currency, 
    cashbackProvider
  ]);

  // Full tank calculation results
  const fullTankCalculation = useMemo(() => {
    return calculateFullTank(
      tankCapacityL,
      currentTankLevelPercent,
      tankFuelGrade,
      consumptionLPer100Km,
      currency,
      cashbackProvider
    );
  }, [
    tankCapacityL, 
    currentTankLevelPercent, 
    tankFuelGrade, 
    consumptionLPer100Km, 
    currency, 
    cashbackProvider
  ]);

  // Handle generating an e-voucher from full tank or trip
  const handleGenerateVoucher = (liters: number, grade: FuelGrade, station: FuelStation) => {
    const newVoucher = generateFuelVoucher(
      station,
      vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.year})` : 'AutoNext Avtomobil',
      vehicle?.plateNumber || '99-XX-999',
      grade,
      liters,
      currency,
      cashbackProvider
    );
    setVoucher(newVoucher);
    setActiveTab('voucher');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
      data-testid="fuel-station-modal"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Fuel className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  SOCAR & Azpetrol Yanacaq Radarı
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full">
                  Tarif Şurası 2026
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {vehicle 
                  ? `${vehicle.make} ${vehicle.model} (${vehicle.year}) • Yanacaq: ${vehicle.fuelType.toUpperCase()}`
                  : 'Rəsmi dövlət tarifləri, magistral yanacaq stansiyaları və səyahət xərci simulyatoru'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            data-testid="modal-close-btn"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Bağla"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-2 bg-slate-950/40 border-b border-slate-800/80 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('radar')}
            data-testid="tab-radar-btn"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'radar'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Stansiya Radarı ({filteredStations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            data-testid="tab-calculator-btn"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <RouteIcon className="w-4 h-4" />
            <span>Səyahət Xərci Hesabla</span>
          </button>

          <button
            onClick={() => setActiveTab('tank')}
            data-testid="tab-tank-btn"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'tank'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>Tam Çən & Cashback</span>
          </button>

          <button
            onClick={() => setActiveTab('voucher')}
            data-testid="tab-voucher-btn"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'voucher'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Elektron Çek / Qəbz {voucher && '✓'}</span>
          </button>

          <button
            onClick={() => setActiveTab('tariffs')}
            data-testid="tab-tariffs-btn"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'tariffs'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Tarif Şurası Qiymətləri</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: RADAR & STATIONS */}
          {activeTab === 'radar' && (
            <div className="space-y-5">
              {/* Filter Strip */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search Bar */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Stansiya adı, küçə, rayon və ya magistral axtarın (məs: Heydər Əliyev, M1, Babək)..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition-colors placeholder:text-slate-500"
                      data-testid="station-search-input"
                    />
                  </div>

                  {/* Brand Filter */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {(['All', 'SOCAR', 'Azpetrol', 'Lukoil', 'Toba'] as const).map((brand) => (
                      <button
                        key={brand}
                        onClick={() => setSelectedBrand(brand)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          selectedBrand === brand
                            ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700/80'
                        }`}
                        data-testid={`filter-brand-${brand.toLowerCase()}`}
                      >
                        {brand === 'All' ? 'Bütün Brendlər' : brand}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub-Filters: Fuel Grade & Amenities */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-slate-400 font-semibold mr-1">Yanacaq:</span>
                    {(['All', 'ai92', 'ai95', 'ai98', 'diesel', 'cng'] as const).map((grade) => (
                      <button
                        key={grade}
                        onClick={() => setSelectedFuelGrade(grade)}
                        className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                          selectedFuelGrade === grade
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {grade === 'All' ? 'Hamısı' : grade.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={only24Hours}
                        onChange={(e) => setOnly24Hours(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0"
                      />
                      <span>Yalnız 24/7 açıq</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Stations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredStations.map((station) => {
                  const isSocar = station.brand === 'SOCAR';
                  const isAzpetrol = station.brand === 'Azpetrol';
                  const isLukoil = station.brand === 'Lukoil';

                  return (
                    <div
                      key={station.id}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 group"
                      data-testid={`station-card-${station.id}`}
                    >
                      <div>
                        {/* Header Badge */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span 
                              className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                                isSocar 
                                  ? 'bg-blue-600/20 text-cyan-400 border border-cyan-500/30'
                                  : isAzpetrol
                                  ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                                  : isLukoil
                                  ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {station.brand}
                            </span>
                            <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                              ★ {station.rating} <span className="text-slate-500 font-normal text-[10px]">({station.reviewsCount})</span>
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-mono font-bold text-slate-300">
                              ~{station.distanceKm} km
                            </span>
                          </div>
                        </div>

                        {/* Station Name & Address */}
                        <h3 className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">
                          {station.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                          <span className="line-clamp-1">{station.address}</span>
                        </p>
                      </div>

                      {/* Fuel Prices Strip */}
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 pt-2 border-t border-slate-800/80">
                        {station.fuels.slice(0, 4).map((f) => (
                          <div 
                            key={f.grade}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800/80 text-center"
                          >
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                              {f.grade}
                            </span>
                            <span className="text-xs font-bold text-white">
                              {getOfficialFuelPrice(f.grade, currency)} {currency === 'AZN' ? '₼' : currency}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Amenities & Cashback */}
                      <div className="flex items-center justify-between gap-2 pt-2 text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {station.amenities.slice(0, 3).map((am) => (
                            <span 
                              key={am}
                              className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 text-[10px]"
                            >
                              {AMENITY_LABELS[am]?.az.split('/')[0]}
                            </span>
                          ))}
                        </div>

                        <span className="text-emerald-400 font-semibold text-[10px] flex-shrink-0">
                          {station.cashbackPartner.split('&')[0]}
                        </span>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <button
                          onClick={() => {
                            setSelectedStation(station);
                            setTankFuelGrade(station.fuels[0]?.grade || 'ai92');
                            setActiveTab('tank');
                          }}
                          className="py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Gauge className="w-3.5 h-3.5" />
                          <span>Çən Doldur</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedStation(station);
                            setActiveTab('calculator');
                          }}
                          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Navigation className="w-3.5 h-3.5 text-blue-400" />
                          <span>Marşrutda Seç</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredStations.length === 0 && (
                <div className="p-8 text-center text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800">
                  <Fuel className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="font-semibold text-white">Uyğun yanacaqdoldurma məntəqəsi tapılmadı</p>
                  <p className="text-xs text-slate-500 mt-1">Axtarış sözünü dəyişin və ya filtrləri sıfırlayın.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ROUTE TRIP CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              {/* Route Picker */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <RouteIcon className="w-4 h-4 text-amber-400" />
                    <span>Magistral Marşrut Seçimi</span>
                  </h3>
                  <button
                    onClick={() => setUseCustomDistance(!useCustomDistance)}
                    className="text-xs text-amber-400 hover:underline cursor-pointer font-medium"
                  >
                    {useCustomDistance ? 'Hazır Marşrutlara Qayıt' : 'Öz Məsafəmi Daxil Et'}
                  </button>
                </div>

                {!useCustomDistance ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {MOCK_HIGHWAY_ROUTES.map((route) => {
                      const isSelected = selectedRoute.id === route.id;
                      return (
                        <button
                          key={route.id}
                          onClick={() => {
                            setSelectedRoute(route);
                            setCustomDistanceKm(route.distanceKm);
                          }}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-500 text-white shadow-md shadow-amber-500/10'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                          }`}
                          data-testid={`route-btn-${route.id}`}
                        >
                          <div className="font-bold text-xs line-clamp-1">{route.name}</div>
                          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                            <span>{route.distanceKm} km</span>
                            <span>~{Math.round(route.estimatedMinutes / 60)}s {route.estimatedMinutes % 60}d</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-400">Xüsusi Məsafə:</span>
                      <span className="text-amber-400 font-bold">{customDistanceKm} km</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={700}
                      step={5}
                      value={customDistanceKm}
                      onChange={(e) => setCustomDistanceKm(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Driving Environment Modifiers */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  <span>Avtomobil və Sürüş Şəraitinin Tənzimlənməsi</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  {/* Fuel Grade */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold block">Yanacaq Növü</label>
                    <select
                      value={tripFuelGrade}
                      onChange={(e) => setTripFuelGrade(e.target.value as FuelGrade)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="ai92">Aİ-92 Mütəşəkkil (1.10 ₼)</option>
                      <option value="ai95">Aİ-95 Premium (1.60 ₼)</option>
                      <option value="ai98">Aİ-98 Super (2.30 ₼)</option>
                      <option value="diesel">Dizel Euro-5 (1.00 ₼)</option>
                      <option value="cng">CNG Təbii Qaz (0.45 ₼)</option>
                      <option value="electric">EV Elektrik (0.11 ₼)</option>
                    </select>
                  </div>

                  {/* Consumption */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-400 font-semibold">
                      <span>Baza Sərfiyyat</span>
                      <span className="text-white font-bold">{consumptionLPer100Km} L/100km</span>
                    </div>
                    <input
                      type="range"
                      min={3.5}
                      max={20.0}
                      step={0.1}
                      value={consumptionLPer100Km}
                      onChange={(e) => setConsumptionLPer100Km(Number(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>

                  {/* Passengers */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-400 font-semibold">
                      <span>Sərnişin Sayı</span>
                      <span className="text-white font-bold">{passengerCount} nəfər</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((cnt) => (
                        <button
                          key={cnt}
                          onClick={() => setPassengerCount(cnt)}
                          className={`flex-1 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                            passengerCount === cnt
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-900 text-slate-400 border border-slate-800'
                          }`}
                        >
                          {cnt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AC and City Traffic */}
                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                      <span className="text-slate-300 font-medium">Kondisioner (A/C)</span>
                      <input
                        type="checkbox"
                        checked={withAC}
                        onChange={(e) => setWithAC(e.target.checked)}
                        className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0"
                      />
                    </label>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Tıxac Rejimi:</span>
                      <span className="text-amber-400 font-bold">{Math.round(cityTrafficRatio * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={cityTrafficRatio}
                      onChange={(e) => setCityTrafficRatio(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Trip Results KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">
                    Tələb Olunan Yanacaq
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-white">
                    {tripCalculation.litersNeeded}{' '}
                    <span className="text-xs font-normal text-slate-400">
                      {tripFuelGrade === 'cng' ? 'm³' : tripFuelGrade === 'electric' ? 'kWh' : 'Litr'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Faktiki: {tripCalculation.effectiveConsumptionLPer100Km} L/100km
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                    Ümumi Yanacaq Xərci
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400">
                    {formatPrice(tripCalculation.costAzn, currency)}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    1 km üçün: {(tripCalculation.costAzn / tripDistance).toFixed(3)} ₼
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30">
                  <span className="text-[10px] uppercase font-bold text-blue-400 block mb-1">
                    ƏDV Geri Al (17.5%)
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-blue-300">
                    +{tripCalculation.edvRefundAzn} ₼
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Cashback: +{tripCalculation.cashbackAmountAzn} ₼
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Ekoloji Təsir (CO2)
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-slate-200">
                    {tripCalculation.co2Kg}{' '}
                    <span className="text-xs font-normal text-slate-400">kg CO2</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {tripCalculation.stopsNeeded > 0 ? `${tripCalculation.stopsNeeded} dayanacaq lazım` : 'Fasiləsiz səfər'}
                  </span>
                </div>
              </div>

              {/* Recommended Station Along the Route */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-cyan-400">
                      Marşrut üzrə Tövsiyə Olunan Doldurma Məntəqəsi
                    </span>
                    <h4 className="font-bold text-white text-sm">
                      {MOCK_FUEL_STATIONS.find(s => s.id === selectedRoute.recommendedStationId)?.name || 'SOCAR Magistral'}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {MOCK_FUEL_STATIONS.find(s => s.id === selectedRoute.recommendedStationId)?.address}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const st = MOCK_FUEL_STATIONS.find(s => s.id === selectedRoute.recommendedStationId) || MOCK_FUEL_STATIONS[0];
                    handleGenerateVoucher(tripCalculation.litersNeeded, tripFuelGrade, st);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <FileText className="w-4 h-4" />
                  <span>Bu Səfər Üçün Elektron Çek Al</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: FULL TANK & CASHBACK CALCULATOR */}
          {activeTab === 'tank' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inputs Box */}
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-amber-400" />
                    <span>Çən Göstəriciləri & Yanacaq Seçimi</span>
                  </h3>

                  {/* Fuel Grade Picker */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-semibold block">Doldurulacaq Yanacaq</label>
                    <select
                      value={tankFuelGrade}
                      onChange={(e) => setTankFuelGrade(e.target.value as FuelGrade)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium text-xs sm:text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
                      data-testid="tank-fuel-grade-select"
                    >
                      <option value="ai92">Aİ-92 Mütəşəkkil (1.10 ₼ / L)</option>
                      <option value="ai95">Aİ-95 Premium Euro-5 (1.60 ₼ / L)</option>
                      <option value="ai98">Aİ-98 Super Euro-6 (2.30 ₼ / L)</option>
                      <option value="diesel">Dizel Euro-5 (1.00 ₼ / L)</option>
                      <option value="cng">CNG Təbii Qaz (0.45 ₼ / m³)</option>
                      <option value="lpg">LPG Maye Qaz (0.65 ₼ / L)</option>
                    </select>
                  </div>

                  {/* Tank Capacity Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-400">Ümumi Çən Tutumu</span>
                      <span className="text-white font-bold">{tankCapacityL} Litr</span>
                    </div>
                    <input
                      type="range"
                      min={30}
                      max={120}
                      step={5}
                      value={tankCapacityL}
                      onChange={(e) => setTankCapacityL(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                      data-testid="tank-capacity-slider"
                    />
                  </div>

                  {/* Current Tank Level Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-400">Çəndə Qalan Yanacaq Səviyyəsi</span>
                      <span className="text-amber-400 font-bold">{currentTankLevelPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={90}
                      step={5}
                      value={currentTankLevelPercent}
                      onChange={(e) => setCurrentTankLevelPercent(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                      data-testid="tank-level-slider"
                    />
                  </div>

                  {/* Visual Gauge Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700/80 flex">
                      <div 
                        className="h-full bg-slate-500 rounded-l-full transition-all"
                        style={{ width: `${currentTankLevelPercent}%` }}
                        title="Mövcud Yanacaq"
                      />
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-r-full transition-all flex-1"
                        title="Doldurulacaq Hissə"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>Boş (0L)</span>
                      <span>Qalan: {Math.round(tankCapacityL * (currentTankLevelPercent / 100))}L</span>
                      <span>Dolu ({tankCapacityL}L)</span>
                    </div>
                  </div>

                  {/* Banking Cashback Partner Picker */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <label className="text-xs text-slate-400 font-semibold block">Ödəniş Kartı / Cashback Tərəfdaşı</label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { id: 'birbank', name: 'Birbank', rate: '5% Keşbek' },
                        { id: 'tamkart', name: 'TamKart ABB', rate: '4% Keşbek' },
                        { id: 'leobank', name: 'Leobank', rate: '3% Keşbek' },
                        { id: 'socar_club', name: 'SOCAR Club', rate: '1.5% Bonus' },
                      ].map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setCashbackProvider(p.id as CashbackProvider)}
                          className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                            cashbackProvider === p.id
                              ? 'bg-emerald-500/15 border-emerald-500 text-white font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          <div className="text-xs font-bold text-white">{p.name}</div>
                          <div className="text-[10px] text-emerald-400">{p.rate}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Calculation Outputs Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex flex-col justify-between space-y-4 shadow-xl">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                      Hesablama Nəticəsi
                    </span>
                    <h3 className="text-xl font-black text-white mt-0.5">
                      Tam Çən Doldurma Planı
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {selectedStation.name} qiymət və aksiyaları əsasında
                    </p>
                  </div>

                  <div className="space-y-3 py-2 border-y border-slate-800/80 text-xs sm:text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Doldurulacaq Həcm:</span>
                      <strong className="text-white text-base">
                        {fullTankCalculation.missingLiters} Litr
                      </strong>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">1 Litrin Qiyməti:</span>
                      <strong className="text-white">
                        {getOfficialFuelPrice(tankFuelGrade, currency)} {currency === 'AZN' ? '₼' : currency}
                      </strong>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Ümumi Doldurma Məbləği:</span>
                      <strong className="text-amber-400 text-lg font-black">
                        {formatPrice(fullTankCalculation.totalCostAzn, currency)}
                      </strong>
                    </div>

                    <div className="flex justify-between items-center text-emerald-400 font-semibold">
                      <span>Bank Keşbek Qazancı:</span>
                      <span>+{fullTankCalculation.cashbackAzn} ₼</span>
                    </div>

                    <div className="flex justify-between items-center text-cyan-400 font-semibold">
                      <span>ƏDV Geri Al (17.5% nağdsız):</span>
                      <span>+{fullTankCalculation.edvRefundAzn} ₼</span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-slate-300 font-bold">
                      <span>Xalis Faktiki Xərciniz:</span>
                      <span className="text-emerald-300 text-base">
                        {(fullTankCalculation.totalCostAzn - fullTankCalculation.cashbackAzn - fullTankCalculation.edvRefundAzn).toFixed(2)} ₼
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-950/30 border border-blue-800/40 text-blue-300 text-xs flex items-center justify-between">
                      <span>Tam çənlə təxmini yürüş:</span>
                      <strong className="text-white font-mono font-bold">
                        ≈ {fullTankCalculation.fullTankRangeKm} km
                      </strong>
                    </div>
                  </div>

                  <button
                    onClick={() => handleGenerateVoucher(fullTankCalculation.missingLiters, tankFuelGrade, selectedStation)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
                    data-testid="generate-tank-voucher-btn"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Elektron Yanacaq Çeki / Qəbz Yarat</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ELECTRONIC VOUCHER / FISCAL RECEIPT */}
          {activeTab === 'voucher' && (
            <div className="space-y-4 max-w-xl mx-auto">
              {voucher ? (
                <div 
                  className="p-6 rounded-3xl bg-slate-950 border border-slate-700 shadow-2xl space-y-5 text-slate-200 font-sans"
                  data-testid="fuel-voucher-receipt"
                >
                  {/* Fiscal Header */}
                  <div className="text-center pb-4 border-b border-dashed border-slate-700 space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold uppercase mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Azərbaycan Respublikası Fiskal Yanacaq Çeki</span>
                    </div>
                    <h3 className="text-lg font-black text-white">{voucher.stationName}</h3>
                    <p className="text-xs text-slate-400">{voucher.stationAddress}</p>
                    <p className="text-[11px] text-slate-500 font-mono">VÖEN: 1400284911 • NÖMRƏ: {voucher.voucherCode}</p>
                  </div>

                  {/* Body Details */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Tarix və Saat:</span>
                      <span className="font-mono text-white">{new Date(voucher.dateIso).toLocaleString('az-AZ')}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Avtomobil & Qeydiyyat Nişanı:</span>
                      <span className="font-bold text-white">{voucher.vehicleTitle} ({voucher.vehiclePlate})</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Məhsul / Yanacaq Növü:</span>
                      <span className="font-bold text-amber-400">{voucher.fuelName}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Həcm (L):</span>
                      <span className="font-mono font-bold text-white">{voucher.volumeLiters} Litr</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">1 Litrin Qiyməti:</span>
                      <span className="font-mono text-white">{voucher.unitPriceAzn.toFixed(2)} ₼</span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-slate-800/80 text-sm">
                      <span className="font-bold text-slate-300">YEKUN MƏBLƏĞ:</span>
                      <span className="font-mono font-black text-amber-400 text-base">{voucher.totalAzn.toFixed(2)} ₼</span>
                    </div>

                    <div className="flex justify-between py-1 text-slate-400 text-[11px]">
                      <span>ƏDV 18%:</span>
                      <span className="font-mono">{voucher.vatAmountAzn.toFixed(2)} ₼</span>
                    </div>

                    <div className="flex justify-between py-1 text-cyan-400 text-[11px] font-semibold">
                      <span>ƏDV Geri Al (17.5% nağdsız):</span>
                      <span className="font-mono">+{voucher.edvRefundAzn.toFixed(2)} ₼</span>
                    </div>

                    <div className="flex justify-between py-1 text-emerald-400 text-[11px] font-semibold">
                      <span>{voucher.cashbackProviderName}:</span>
                      <span className="font-mono">+{voucher.cashbackAzn.toFixed(2)} ₼</span>
                    </div>
                  </div>

                  {/* Fiscal Barcode & Security Block */}
                  <div className="pt-3 border-t border-dashed border-slate-700 text-center space-y-2">
                    <div className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">
                      ||| | ||||| |||| || |||||| | |||| ||| |||||||
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      Fiskal İD: <strong className="text-white">{voucher.securityHash}</strong>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Bu çek Dövlət Vergi Xidmətinin elektron informasiya sistemində qeydiyyata alınmışdır.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => copyToClipboard(voucher.voucherCode)}
                      className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      data-testid="copy-voucher-btn"
                    >
                      {copiedText === voucher.voucherCode ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Kopyalandı!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Kodu Kopyala</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => window.print()}
                      className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      data-testid="print-voucher-btn"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Çap Et / Saxla</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800 space-y-3">
                  <FileText className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="font-semibold text-white">Aktiv elektron çek yoxdur</p>
                  <p className="text-xs text-slate-500">
                    «Tam Çən» və ya «Səyahət Xərci» bölməsindən istədiyiniz yanacaq parametrini seçərək çek yarada bilərsiniz.
                  </p>
                  <button
                    onClick={() => setActiveTab('tank')}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                  >
                    Çən Hesablayıcısına Keç
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: OFFICIAL TARIFF COUNCIL PRICE MATRIX */}
          {activeTab === 'tariffs' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <strong className="text-white block font-bold">
                    Azərbaycan Respublikası Tarif (qiymət) Şurasının Rəsmi Qərarı
                  </strong>
                  <p className="text-slate-300 leading-relaxed">
                    Ölkə daxilində istehsal olunan Aİ-92 markalı avtomobil benzini və dizel yanacağının pərakəndə satış qiyməti dövlət tərəfindən tənzimlənir. Aİ-95 («Premium») və Aİ-98 («Super») markalı benzinlər isə xaricdən idxal olunduğu üçün qiymətləri beynəlxalq birja kotirovkalarına uyğun formalaşır.
                  </p>
                </div>
              </div>

              {/* Tariffs Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Yanacaq Növü</th>
                      <th className="py-3 px-4">Standart</th>
                      <th className="py-3 px-4">Tənzimləmə</th>
                      <th className="py-3 px-4">Rəsmi Qiymət (AZN)</th>
                      <th className="py-3 px-4">Seçilmiş Valyuta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {[
                      { grade: 'ai92', standard: 'Avro-4', status: 'Dövlət tərəfindən tənzimlənən', unit: 'Litr' },
                      { grade: 'diesel', standard: 'Avro-5', status: 'Dövlət tərəfindən tənzimlənən', unit: 'Litr' },
                      { grade: 'ai95', standard: 'Avro-5 Premium', status: 'Bazar / İdxal', unit: 'Litr' },
                      { grade: 'ai98', standard: 'Avro-6 Super', status: 'Bazar / İdxal', unit: 'Litr' },
                      { grade: 'cng', standard: 'Təbii Qaz', status: 'Ekoloji Tənzimlənən', unit: 'm³' },
                      { grade: 'lpg', standard: 'Mayeləşdirilmiş Qaz', status: 'Bazar Qiyməti', unit: 'Litr' },
                      { grade: 'electric', standard: 'TokBaku Şəbəkəsi', status: 'Baza Doldurma', unit: 'kWh' },
                    ].map((item) => {
                      const priceAzn = TARIF_SURASI_PRICES[item.grade as FuelGrade];
                      const converted = getOfficialFuelPrice(item.grade as FuelGrade, currency);

                      return (
                        <tr key={item.grade} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-white">
                            {FUEL_DISPLAY_NAMES[item.grade as FuelGrade]}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-400">
                            {item.standard}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300">
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                            {priceAzn.toFixed(2)} ₼ / {item.unit}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-white">
                            {converted.toFixed(2)} {currency} / {item.unit}
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
}

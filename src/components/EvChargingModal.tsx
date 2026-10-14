import React, { useState, useMemo, useEffect } from 'react';
import { Currency, Language, Vehicle } from '../types/vehicle';
import { formatPrice } from '../utils/i18n';
import { 
  ChargingStation, 
  ConnectorType, 
  EvOperator, 
  EvVehiclePreset,
  EvChargingCalculationResult,
  EvChargingSessionReceipt
} from '../types/evCharging';
import { 
  MOCK_CHARGING_STATIONS, 
  EV_VEHICLE_PRESETS, 
  MOCK_GREEN_ROUTES 
} from '../data/mockEvStations';
import { 
  calculateChargingSession, 
  filterStations, 
  calculateRouteReachability, 
  generateChargingReceipt, 
  getConnectorBadge,
  formatEvPower 
} from '../utils/evCharging';
import { useScrollLock } from '../hooks/useScrollLock';
import { useKeyPress } from '../hooks/useKeyPress';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { 
  X, 
  Zap, 
  BatteryCharging, 
  Navigation, 
  FileText, 
  Play, 
  Square, 
  RotateCcw, 
  Search, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  Gauge, 
  DollarSign, 
  Leaf, 
  ShieldCheck, 
  Printer, 
  Copy, 
  Check, 
  Info,
  Sliders,
  ChevronRight,
  Wifi,
  Coffee,
  ShoppingBag
} from 'lucide-react';

interface EvChargingModalProps {
  isOpen: boolean;
  vehicle?: Vehicle | null;
  currency: Currency;
  lang: Language;
  onClose: () => void;
}

type TabType = 'stations' | 'calculator' | 'simulator' | 'routes' | 'receipt';

export const EvChargingModal: React.FC<EvChargingModalProps> = ({
  isOpen,
  vehicle,
  currency,
  lang,
  onClose,
}) => {
  useScrollLock(isOpen);
  useKeyPress('Escape', onClose);

  const [activeTab, setActiveTab] = useState<TabType>('stations');
  const [copiedReceipt, copyReceipt] = useCopyToClipboard();

  // Selected station
  const [selectedStation, setSelectedStation] = useState<ChargingStation>(MOCK_CHARGING_STATIONS[0]);

  // Station Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [connectorFilter, setConnectorFilter] = useState<ConnectorType | 'all'>('all');
  const [operatorFilter, setOperatorFilter] = useState<EvOperator | 'all'>('all');
  const [fastOnly, setFastOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);

  // Calculator State
  const initialPreset = useMemo(() => {
    if (vehicle && vehicle.fuelType === 'electric') {
      const match = EV_VEHICLE_PRESETS.find(p => p.make.toLowerCase() === vehicle.make.toLowerCase());
      if (match) return match;
    }
    return EV_VEHICLE_PRESETS[0]; // BYD Song Plus Champion EV by default
  }, [vehicle]);

  const [selectedPreset, setSelectedPreset] = useState<EvVehiclePreset>(initialPreset);
  const [batteryCapacity, setBatteryCapacity] = useState<number>(initialPreset.batteryCapacityKwh);
  const [currentSoc, setCurrentSoc] = useState<number>(18);
  const [targetSoc, setTargetSoc] = useState<number>(80);
  const [chargerPowerKw, setChargerPowerKw] = useState<number>(120);
  const [tariffPerKwh, setTariffPerKwh] = useState<number>(0.22);

  // When preset changes, sync battery capacity
  const handleSelectPreset = (preset: EvVehiclePreset) => {
    setSelectedPreset(preset);
    setBatteryCapacity(preset.batteryCapacityKwh);
  };

  // Calculation Results
  const calculationResult: EvChargingCalculationResult = useMemo(() => {
    return calculateChargingSession({
      batteryCapacityKwh: batteryCapacity,
      currentSocPercent: currentSoc,
      targetSocPercent: targetSoc,
      chargerPowerKw,
      maxVehicleAcceptanceKw: selectedPreset.maxDcChargingPowerKw,
      tariffPerKwhAzn: tariffPerKwh,
      currency,
      is800VArchitecture: selectedPreset.is800VArchitecture,
    });
  }, [batteryCapacity, currentSoc, targetSoc, chargerPowerKw, selectedPreset, tariffPerKwh, currency]);

  // Simulator State
  const [isCharging, setIsCharging] = useState(false);
  const [simSoc, setSimSoc] = useState(currentSoc);
  const [simEnergyKwh, setSimEnergyKwh] = useState(0);
  const [simSeconds, setSimSeconds] = useState(0);
  const [activeReceipt, setActiveReceipt] = useState<EvChargingSessionReceipt | null>(null);

  // Simulation timer
  useEffect(() => {
    let interval: any = null;
    if (isCharging) {
      interval = setInterval(() => {
        setSimSeconds(prev => prev + 1);
        setSimSoc(prev => {
          if (prev >= targetSoc) {
            setIsCharging(false);
            return targetSoc;
          }
          return Math.min(targetSoc, prev + 1);
        });
        setSimEnergyKwh(prev => {
          const stepEnergy = (batteryCapacity * 0.01) / 0.92;
          return Math.round((prev + stepEnergy) * 10) / 10;
        });
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isCharging, targetSoc, batteryCapacity]);

  const handleStartCharging = () => {
    setSimSoc(currentSoc);
    setSimEnergyKwh(0);
    setSimSeconds(0);
    setIsCharging(true);
  };

  const handleStopCharging = () => {
    setIsCharging(false);
    const receipt = generateChargingReceipt({
      station: selectedStation,
      connectorType: selectedPreset.preferredConnector,
      startSoc: currentSoc,
      endSoc: simSoc,
      energyKwh: simEnergyKwh > 0 ? simEnergyKwh : calculationResult.energyNeededKwh,
      durationMinutes: Math.max(1, Math.round(simSeconds / 2)),
      maxPowerKw: chargerPowerKw,
      tariffPerKwhAzn: tariffPerKwh,
      currency,
      carPlate: vehicle?.plateNumber || '10-EV-808',
    });
    setActiveReceipt(receipt);
    setActiveTab('receipt');
  };

  // Filtered stations
  const filteredStations = useMemo(() => {
    return filterStations(MOCK_CHARGING_STATIONS, {
      query: searchQuery,
      connector: connectorFilter,
      operator: operatorFilter,
      fastOnly,
      availableOnly,
    });
  }, [searchQuery, connectorFilter, operatorFilter, fastOnly, availableOnly]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      data-testid="ev-charging-modal"
    >
      <div className="relative w-full max-w-5xl bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-950 border-b border-emerald-500/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Azərişıq & TokBaku Elektromobil Doldurma Şəbəkəsi
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Yaşıl Enerji & EV Hub
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Canlı telemetriya, 120-240 kW Ultra Sürətli Doldurma, BMS istilik qrafiki və şəhərlərarası yaşıl marşrutlar
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            data-testid="ev-modal-close-btn"
            className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label="Bağla"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-6 pt-3 bg-slate-900/90 border-b border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('stations')}
            data-testid="tab-stations-btn"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'stations'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Şəbəkə Radar & Xəritə</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
              {filteredStations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            data-testid="tab-calculator-btn"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'calculator'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BatteryCharging className="w-4 h-4" />
            <span>Ağıllı Şarj Kalkulyatoru</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            data-testid="tab-simulator-btn"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'simulator'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>Canlı Sessiya Simulyatoru</span>
            {isCharging && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('routes')}
            data-testid="tab-routes-btn"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'routes'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>Yaşıl Marşrutlar</span>
          </button>

          <button
            onClick={() => setActiveTab('receipt')}
            data-testid="tab-receipt-btn"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'receipt'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Elektron Qəbz & Vəuçer</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">

          {/* TAB 1: STATIONS RADAR */}
          {activeTab === 'stations' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Search & Filter Toolbar */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="md:col-span-5 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Stansiya adı, ünvan və ya rayon axtar..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                    data-testid="station-search-input"
                  />
                </div>

                <div className="md:col-span-3">
                  <select
                    value={connectorFilter}
                    onChange={(e) => setConnectorFilter(e.target.value as any)}
                    aria-label="Konnektor Tipi"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
                    data-testid="connector-filter-select"
                  >
                    <option value="all">Bütün Konnektorlar</option>
                    <option value="gbt_dc">GB/T DC (BYD / Çin EV)</option>
                    <option value="ccs2">CCS Combo 2 (Avropa/ABŞ)</option>
                    <option value="type2">Type 2 AC (Mennekes)</option>
                  </select>
                </div>

                <div className="md:col-span-4 flex items-center gap-2">
                  <label className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900 px-3 py-2 rounded-xl border border-slate-700 cursor-pointer hover:border-slate-600 flex-1">
                    <input
                      type="checkbox"
                      checked={fastOnly}
                      onChange={(e) => setFastOnly(e.target.checked)}
                      className="rounded text-emerald-500 focus:ring-0"
                      data-testid="fast-only-checkbox"
                    />
                    <span>≥ 90 kW Sürətli</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900 px-3 py-2 rounded-xl border border-slate-700 cursor-pointer hover:border-slate-600 flex-1">
                    <input
                      type="checkbox"
                      checked={availableOnly}
                      onChange={(e) => setAvailableOnly(e.target.checked)}
                      className="rounded text-emerald-500 focus:ring-0"
                      data-testid="available-only-checkbox"
                    />
                    <span>Boş Yer Olanlar</span>
                  </label>
                </div>
              </div>

              {/* Station Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredStations.map((station) => {
                  const isSelected = selectedStation.id === station.id;
                  const totalAvailable = station.connectors.reduce((acc, c) => acc + c.availableCount, 0);
                  const totalConnectors = station.connectors.reduce((acc, c) => acc + c.totalCount, 0);

                  return (
                    <div
                      key={station.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                        isSelected
                          ? 'bg-emerald-950/30 border-emerald-500 shadow-lg shadow-emerald-500/10'
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                {station.operatorName}
                              </span>
                              {station.is24Hours && (
                                <span className="text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                                  24/7
                                </span>
                              )}
                            </div>
                            <h4 className="text-base font-bold text-white mt-1">{station.name}</h4>
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                              <span>{station.address}</span>
                              {station.distanceKm && (
                                <span className="text-emerald-400 font-medium">({station.distanceKm} km)</span>
                              )}
                            </p>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                              totalAvailable > 0
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${totalAvailable > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                              {totalAvailable > 0 ? `${totalAvailable}/${totalConnectors} Boşdur` : 'Məşğul'}
                            </span>
                          </div>
                        </div>

                        {/* Connector List */}
                        <div className="space-y-2 pt-2 border-t border-slate-800/80">
                          {station.connectors.map((c) => {
                            const badge = getConnectorBadge(c.type);
                            return (
                              <div
                                key={c.id}
                                className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-900 border border-slate-800"
                              >
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] border ${badge.color}`}>
                                    {badge.label}
                                  </span>
                                  <span className="text-slate-300 font-medium">{c.typeName}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-emerald-400">{formatEvPower(c.maxPowerKw)}</span>
                                  <span className="text-slate-400">{c.pricePerKwhAzn.toFixed(2)} ₼/kWh</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Amenities */}
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                          {station.hasAmenities.cafe && (
                            <span className="flex items-center gap-1"><Coffee className="w-3.5 h-3.5 text-amber-400" /> Kafe</span>
                          )}
                          {station.hasAmenities.wifi && (
                            <span className="flex items-center gap-1"><Wifi className="w-3.5 h-3.5 text-blue-400" /> Pulsuz WiFi</span>
                          )}
                          {station.hasAmenities.shopping && (
                            <span className="flex items-center gap-1"><ShoppingBag className="w-3.5 h-3.5 text-purple-400" /> AVM / Market</span>
                          )}
                        </div>
                      </div>

                      {/* Select Station CTA */}
                      <button
                        onClick={() => {
                          setSelectedStation(station);
                          setChargerPowerKw(station.connectors[0].maxPowerKw);
                          setTariffPerKwh(station.connectors[0].pricePerKwhAzn);
                          setActiveTab('calculator');
                        }}
                        data-testid={`select-station-${station.id}`}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold'
                            : 'bg-slate-800 hover:bg-slate-700 text-white'
                        }`}
                      >
                        <Zap className="w-4 h-4" />
                        <span>{isSelected ? 'Seçilmiş Stansiya • Kalkulyatora Keç' : 'Bu Stansiyanı Seç & Hesabla'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SMART CALCULATOR & BMS */}
          {activeTab === 'calculator' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Presets and Vehicle Settings */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <span>Elektromobil Modeli və Batareya Həcmi</span>
                  </h4>
                  <span className="text-xs text-slate-400">
                    Seçilmiş: <strong className="text-emerald-400">{selectedPreset.modelName}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {EV_VEHICLE_PRESETS.map((preset) => {
                    const isSelected = selectedPreset.id === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset)}
                        data-testid={`preset-btn-${preset.id}`}
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <p className="text-[11px] font-bold truncate text-white">{preset.make}</p>
                        <p className="text-[10px] text-slate-400 truncate">{preset.modelName}</p>
                        <p className="text-[10px] font-mono font-semibold text-emerald-400 mt-1">{preset.batteryCapacityKwh} kWh</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sliders & Charging Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                {/* Sliders */}
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-2">
                      <span className="text-slate-300">Cari Batareya Səviyyəsi (SoC):</span>
                      <span className="text-emerald-400 font-mono font-bold text-sm">{currentSoc}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={90}
                      value={currentSoc}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setCurrentSoc(val);
                        if (val >= targetSoc) setTargetSoc(Math.min(100, val + 10));
                      }}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      data-testid="current-soc-slider"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-2">
                      <span className="text-slate-300">Hədəf Doldurma Həddi:</span>
                      <span className="text-blue-400 font-mono font-bold text-sm">{targetSoc}%</span>
                    </div>
                    <input
                      type="range"
                      min={currentSoc + 5}
                      max={100}
                      value={targetSoc}
                      onChange={(e) => setTargetSoc(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      data-testid="target-soc-slider"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>{currentSoc + 5}%</span>
                      <span className="text-emerald-400">80% (BMS üçün tövsiyə olunan)</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <label className="text-xs font-semibold text-slate-300 block mb-2">
                      Doldurma Gücü (kW)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[22, 60, 120, 180].map((kw) => (
                        <button
                          key={kw}
                          onClick={() => setChargerPowerKw(kw)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            chargerPowerKw === kw
                              ? 'bg-blue-600 text-white border-blue-400'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {kw} kW
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Battery Visual & Live Calculation Meter */}
                <div className="flex flex-col justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Batareya Simulyasiyası:</span>
                      <span className="text-slate-300 font-mono">
                        {currentSoc}% ➔ <strong className="text-emerald-400">{targetSoc}%</strong>
                      </span>
                    </div>

                    {/* Progress Bar Gauge */}
                    <div className="h-6 w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-700 p-0.5 flex">
                      <div 
                        style={{ width: `${currentSoc}%` }} 
                        className="h-full bg-slate-600 rounded-l-lg transition-all"
                        title={`Cari: ${currentSoc}%`}
                      ></div>
                      <div 
                        style={{ width: `${Math.max(0, targetSoc - currentSoc)}%` }} 
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 animate-pulse transition-all"
                        title={`Doldurulacaq: ${targetSoc - currentSoc}%`}
                      ></div>
                    </div>

                    {/* Staged BMS Breakdown */}
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[11px] font-semibold text-slate-400">BMS Doldurma Fazaları:</span>
                      {calculationResult.chargingStages.map((stage, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[11px] text-slate-300 px-2 py-1 rounded bg-slate-950/80">
                          <span>{stage.socRange}</span>
                          <span className="text-cyan-400 font-mono">{stage.powerKw} kW</span>
                          <span className="text-slate-400 font-mono">~{stage.durationMinutes} dəq</span>
                          <span className="text-emerald-400 font-mono">+{stage.energyKwh} kWh</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Stansiya Tarifi:</span>
                      <span className="text-xs font-bold text-white">{tariffPerKwh.toFixed(2)} AZN / kWh</span>
                    </div>
                    <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                      Orta effektiv güc: {calculationResult.effectiveAveragePowerKw} kW
                    </span>
                  </div>
                </div>
              </div>

              {/* Calculation Results Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>Doldurma Müddəti</span>
                  </div>
                  <p className="text-xl font-black text-white mt-1" data-testid="result-minutes">
                    {calculationResult.estimatedMinutes} <span className="text-xs text-slate-400">dəq</span>
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tələb Olunan Enerji</span>
                  </div>
                  <p className="text-xl font-black text-white mt-1" data-testid="result-kwh">
                    {calculationResult.energyNeededKwh} <span className="text-xs text-slate-400">kWh</span>
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sessiya Qiyməti</span>
                  </div>
                  <p className="text-xl font-black text-emerald-400 mt-1" data-testid="result-cost">
                    {formatPrice(calculationResult.costAzn, currency)}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Əlavə Məsafə</span>
                  </div>
                  <p className="text-xl font-black text-cyan-400 mt-1" data-testid="result-range">
                    +{calculationResult.addedRangeKm} <span className="text-xs text-slate-400">km</span>
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <Leaf className="w-3.5 h-3.5" />
                    <span>Benzinə Qənaət</span>
                  </div>
                  <p className="text-xl font-black text-emerald-300 mt-1" data-testid="result-savings">
                    +{formatPrice(calculationResult.petrolSavingsAzn, currency)}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                    <span>CO2 Qənaəti</span>
                  </div>
                  <p className="text-xl font-black text-white mt-1">
                    -{calculationResult.co2SavedKg} <span className="text-xs text-slate-400">kq</span>
                  </p>
                </div>
              </div>

              {/* Start Live Simulator CTA */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    handleStartCharging();
                    setActiveTab('simulator');
                  }}
                  data-testid="start-live-session-btn"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Canlı Şarj Sessiyasını Başlat</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE CHARGING SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-6 rounded-3xl bg-slate-950 border border-emerald-500/30 relative overflow-hidden flex flex-col items-center justify-center text-center py-10 space-y-6">
                
                {/* Visual Animated Power Ring */}
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <div className={`absolute inset-0 rounded-full border-4 border-slate-800 ${isCharging ? 'animate-spin border-t-emerald-400 border-r-cyan-400' : ''}`}></div>
                  <div className="flex flex-col items-center justify-center">
                    <Zap className={`w-10 h-10 ${isCharging ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
                    <span className="text-3xl font-black text-white mt-1 font-mono" data-testid="sim-soc-display">
                      {simSoc}%
                    </span>
                    <span className="text-[11px] text-slate-400 uppercase tracking-widest">
                      {isCharging ? 'Doldurulur' : 'Gözləmədə'}
                    </span>
                  </div>
                </div>

                {/* Real-time Telemetry Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Cari Güc</span>
                    <p className="text-lg font-bold text-cyan-400 font-mono mt-0.5">
                      {isCharging ? `${chargerPowerKw} kW` : '0 kW'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Təhvil Verilən</span>
                    <p className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                      {simEnergyKwh.toFixed(1)} kWh
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Müddət</span>
                    <p className="text-lg font-bold text-white font-mono mt-0.5">
                      {Math.floor(simSeconds / 60)}:{(simSeconds % 60).toString().padStart(2, '0')}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Cari Məbləğ</span>
                    <p className="text-lg font-bold text-amber-400 font-mono mt-0.5">
                      {formatPrice(Math.round(simEnergyKwh * tariffPerKwh * 100) / 100, currency)}
                    </p>
                  </div>
                </div>

                {/* Simulation Control Buttons */}
                <div className="flex items-center gap-3">
                  {!isCharging ? (
                    <button
                      onClick={handleStartCharging}
                      data-testid="sim-start-btn"
                      className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/25"
                    >
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>{simSoc >= targetSoc ? 'Yenidən Başlat' : 'Şarjı Başlat'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStopCharging}
                      data-testid="sim-stop-btn"
                      className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-600/30"
                    >
                      <Square className="w-4 h-4 fill-white" />
                      <span>Dayandır və Qəbz Al</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsCharging(false);
                      setSimSoc(currentSoc);
                      setSimEnergyKwh(0);
                      setSimSeconds(0);
                    }}
                    className="px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-sm border border-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Sıfırla</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GREEN CORRIDORS ROUTE PLANNER */}
          {activeTab === 'routes' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center gap-3">
                <Leaf className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <p className="text-xs text-slate-300">
                  Azərbaycanın şimal, cənub və qərb magistralları boyunca qurulmuş <strong>SOCAR Green</strong> və <strong>Azərişıq</strong> sürətli doldurma şəbəkəsi ilə Bakıdan istənilən bölgəyə təhlükəsiz səfər edin.
                </p>
              </div>

              <div className="space-y-4">
                {MOCK_GREEN_ROUTES.map((route) => {
                  const reach = calculateRouteReachability(batteryCapacity, currentSoc, route);
                  return (
                    <div
                      key={route.routeId}
                      className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-bold text-white">{route.routeName}</h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            reach.canReachDirectly
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}>
                            {reach.canReachDirectly
                              ? `Birbaşa çatır (${reach.remainingSocPercent}% qalır)`
                              : '1 şarj dayanacağı tövsiyə olunur'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400">
                          {route.origin} ➔ {route.destination} • <strong>{route.distanceKm} km</strong> (~{route.estimatedDriveTimeHours} saat)
                        </p>

                        {reach.needsChargingStop && route.recommendedStops.length > 0 && (
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
                            <span className="font-semibold text-amber-400 flex items-center gap-1">
                              <Zap className="w-3.5 h-3.5" /> Tövsiyə olunan şarj dayanacağı:
                            </span>
                            <p className="text-white font-medium">{route.recommendedStops[0].stationName}</p>
                            <p className="text-slate-400 text-[11px]">
                              {route.recommendedStops[0].location} • ~{route.recommendedStops[0].chargeMinutes} dəq şarj (+{route.recommendedStops[0].kwhAdded} kWh)
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex md:flex-col items-center md:items-end justify-between gap-2 flex-shrink-0">
                        <span className="text-xs text-slate-400">Tələb olunan:</span>
                        <span className="text-lg font-black text-emerald-400 font-mono">
                          ~{reach.consumedKwh} kWh
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: ELECTRONIC RECEIPT */}
          {activeTab === 'receipt' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {(() => {
                const receipt = activeReceipt || generateChargingReceipt({
                  station: selectedStation,
                  connectorType: selectedPreset.preferredConnector,
                  startSoc: currentSoc,
                  endSoc: targetSoc,
                  energyKwh: calculationResult.energyNeededKwh,
                  durationMinutes: calculationResult.estimatedMinutes,
                  maxPowerKw: chargerPowerKw,
                  tariffPerKwhAzn: tariffPerKwh,
                  currency,
                  carPlate: vehicle?.plateNumber || '10-EV-808',
                });

                return (
                  <div className="max-w-xl mx-auto p-6 rounded-3xl bg-slate-950 border border-emerald-500/40 shadow-2xl space-y-5">
                    {/* Header */}
                    <div className="text-center pb-4 border-b border-slate-800">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto mb-2">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h4 className="text-lg font-bold text-white">TokBaku Elektron Şarj Qəbzi</h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{receipt.sessionId}</p>
                    </div>

                    {/* Details Table */}
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-850">
                        <span className="text-slate-400">Stansiya:</span>
                        <span className="text-white font-medium text-right">{receipt.stationName}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-850">
                        <span className="text-slate-400">Ünvan:</span>
                        <span className="text-slate-300 text-right">{receipt.stationAddress}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-850">
                        <span className="text-slate-400">Tarix & Vaxt:</span>
                        <span className="text-white font-mono">{receipt.dateTime}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-850">
                        <span className="text-slate-400">Dövlət Qeydiyyat Nişanı:</span>
                        <span className="text-emerald-400 font-mono font-bold">{receipt.carPlate}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-850">
                        <span className="text-slate-400">Doldurma Aralığı:</span>
                        <span className="text-white font-mono">{receipt.startSoc}% ➔ {receipt.endSoc}%</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-850">
                        <span className="text-slate-400">Təhvil Verilən Enerji:</span>
                        <span className="text-emerald-400 font-mono font-bold">{receipt.energyDeliveredKwh} kWh</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-850">
                        <span className="text-slate-400">Faktiki Müddət:</span>
                        <span className="text-white font-mono">{receipt.durationMinutes} dəqiqə</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-850">
                        <span className="text-slate-400">Maksimum Güc:</span>
                        <span className="text-cyan-400 font-mono font-semibold">{receipt.maxPowerKw} kW</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-850">
                        <span className="text-slate-400">ƏDV (18% daxil):</span>
                        <span className="text-slate-300 font-mono">{receipt.vatAzn.toFixed(2)} ₼</span>
                      </div>
                      <div className="flex justify-between py-2 border-t border-slate-700 text-sm">
                        <span className="font-bold text-white">Yekun Məbləğ:</span>
                        <span className="font-black text-emerald-400 font-mono text-base">
                          {formatPrice(receipt.totalAzn, currency)}
                        </span>
                      </div>
                    </div>

                    {/* QR Code Security Badge */}
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <div>
                          <p className="text-[11px] font-bold text-white">Təsdiqlənmiş Elektron Qəbz</p>
                          <p className="text-[10px] text-slate-400 font-mono">{receipt.qrVerificationCode}</p>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Ödənilib
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => window.print()}
                        data-testid="print-receipt-btn"
                        className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Çap et</span>
                      </button>

                      <button
                        onClick={() => copyReceipt(`TokBaku Qəbz: ${receipt.sessionId} | Məbləğ: ${receipt.totalAzn} AZN | Enerji: ${receipt.energyDeliveredKwh} kWh | Stansiya: ${receipt.stationName}`)}
                        data-testid="copy-receipt-btn"
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        {copiedReceipt ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedReceipt ? 'Kopyalandı' : 'Məlumatları Kopyala'}</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

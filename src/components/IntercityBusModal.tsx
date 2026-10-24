import React, { useState, useMemo } from 'react';
import {
  X,
  Bus,
  Search,
  Clock,
  MapPin,
  Calendar,
  User,
  Phone,
  CreditCard,
  Printer,
  Copy,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Armchair,
  Luggage,
  Sparkles,
  Layers,
  ChevronRight,
  Info,
  Check,
} from 'lucide-react';
import { Vehicle, Currency } from '../types/vehicle';
import {
  BusRoute,
  BusComfortTier,
  IntercityETicket,
} from '../types/intercityBus';
import {
  MOCK_BUS_ROUTES,
  MOCK_CARRIER_AUDIT_RULES,
  MOCK_EXISTING_TICKETS,
} from '../data/mockIntercityBusData';
import {
  calculateTicketPrice,
  generateBusSeats,
  generateETicket,
  convertAznToCurrency,
  PASSENGER_INSURANCE_AZN,
  TERMINAL_PLATFORM_FEE_AZN,
} from '../utils/intercityBus';

export interface IntercityBusModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: Vehicle | null;
  currency?: Currency;
}

type ModalTab = 'routes' | 'calculator' | 'seats' | 'standards' | 'ticket' | 'registry';

export const IntercityBusModal: React.FC<IntercityBusModalProps> = ({
  isOpen,
  onClose,
  currency: initialCurrency = 'AZN',
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('routes');
  const [selectedCurrency, setSelectedCurrency] = useState<'AZN' | 'USD' | 'EUR'>('AZN');
  
  // Routes tab state
  const [routeSearch, setRouteSearch] = useState('');
  const [selectedBusClass, setSelectedBusClass] = useState<string>('all');
  const [selectedRouteId, setSelectedRouteId] = useState<string>(MOCK_BUS_ROUTES[0].id);

  // Calculator state
  const [comfortTier, setComfortTier] = useState<BusComfortTier>('comfort_express');
  const [adultsCount, setAdultsCount] = useState<number>(1);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [infantsCount, setInfantsCount] = useState<number>(0);
  const [excessLuggageKg, setExcessLuggageKg] = useState<number>(0);
  const [extraBagsCount, setExtraBagsCount] = useState<number>(0);

  // Seat & Passenger booking state
  const [selectedSeat, setSelectedSeat] = useState<number>(14);
  const [passengerName, setPassengerName] = useState<string>('Vüsal Məmmədov');
  const [passengerFin, setPassengerFin] = useState<string>('7N2K9X4');
  const [passengerPhone, setPassengerPhone] = useState<string>('+994 50 412 33 88');
  const [departureDate, setDepartureDate] = useState<string>('2026-10-25');
  const [departureTime, setDepartureTime] = useState<string>('09:00');
  
  // Issued tickets state
  const [ticketsList, setTicketsList] = useState<IntercityETicket[]>(MOCK_EXISTING_TICKETS);
  const [currentTicket, setCurrentTicket] = useState<IntercityETicket>(MOCK_EXISTING_TICKETS[0]);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [registrySearch, setRegistrySearch] = useState<string>('');

  const selectedRoute = useMemo(() => {
    return MOCK_BUS_ROUTES.find((r) => r.id === selectedRouteId) || MOCK_BUS_ROUTES[0];
  }, [selectedRouteId]);

  const busSeats = useMemo(() => {
    return generateBusSeats(selectedRoute.totalSeats, 13);
  }, [selectedRoute]);

  const filteredRoutes = useMemo(() => {
    return MOCK_BUS_ROUTES.filter((r) => {
      const matchSearch =
        r.originCity.toLowerCase().includes(routeSearch.toLowerCase()) ||
        r.destinationCity.toLowerCase().includes(routeSearch.toLowerCase()) ||
        r.routeCode.toLowerCase().includes(routeSearch.toLowerCase()) ||
        r.operatorName.toLowerCase().includes(routeSearch.toLowerCase());
      
      const matchClass =
        selectedBusClass === 'all' || r.busClass === selectedBusClass;

      return matchSearch && matchClass;
    });
  }, [routeSearch, selectedBusClass]);

  const calculationResult = useMemo(() => {
    return calculateTicketPrice(
      {
        routeId: selectedRoute.id,
        comfortTier,
        adultsCount,
        childrenCount,
        infantsCount,
        excessLuggageKg,
        extraBagsCount,
        selectedCurrency,
      },
      MOCK_BUS_ROUTES
    );
  }, [
    selectedRoute,
    comfortTier,
    adultsCount,
    childrenCount,
    infantsCount,
    excessLuggageKg,
    extraBagsCount,
    selectedCurrency,
  ]);

  const filteredRegistryTickets = useMemo(() => {
    if (!registrySearch.trim()) return ticketsList;
    const term = registrySearch.toLowerCase().trim();
    return ticketsList.filter(
      (t) =>
        t.ticketNumber.toLowerCase().includes(term) ||
        t.passengerFin.toLowerCase().includes(term) ||
        t.passengerName.toLowerCase().includes(term) ||
        t.destinationCity.toLowerCase().includes(term)
    );
  }, [ticketsList, registrySearch]);

  const handleSelectRoute = (route: BusRoute) => {
    setSelectedRouteId(route.id);
    if (route.departureTimes.length > 0) {
      setDepartureTime(route.departureTimes[0]);
    }
    setActiveTab('calculator');
  };

  const handleIssueTicket = () => {
    const newTicket = generateETicket(
      selectedRoute,
      {
        fullName: passengerName || 'Naməlum Sərnişin',
        finCode: passengerFin || 'XXXXXXX',
        phone: passengerPhone || '+994 50 000 00 00',
        seatNumber: selectedSeat,
        departureDate,
        departureTime,
        comfortTier,
        extraBags: extraBagsCount,
        excessKg: excessLuggageKg,
      },
      selectedCurrency
    );

    setCurrentTicket(newTicket);
    setTicketsList((prev) => [newTicket, ...prev]);
    setActiveTab('ticket');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="intercity-bus-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-5xl my-auto bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800/80 bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="intercity-bus-title"
                  className="text-lg sm:text-xl font-bold text-white tracking-tight"
                >
                  AYNA & BBIQ Şəhərlərarası Sərnişin Daşımaları Portalı
                </h2>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  AR Qanunu Maddə 18–24
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Bakı Beynəlxalq Avtovağzalı (BBIQ), Marşrut Pasportları, Vahid E-Bilet & Peron Radarı
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Currency selector */}
            <div className="flex bg-slate-800/80 border border-slate-700/60 rounded-xl p-0.5 text-xs">
              {(['AZN', 'USD', 'EUR'] as const).map((curr) => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => setSelectedCurrency(curr)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    selectedCurrency === curr
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              data-testid="intercity-bus-close-btn"
              className="w-9 h-9 rounded-xl bg-slate-800/70 hover:bg-slate-700/80 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-slate-700/50 cursor-pointer"
              aria-label="Bağla"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 pt-3 border-b border-slate-800/60 bg-slate-900/50 overflow-x-auto no-scrollbar">
          {[
            { id: 'routes', label: 'Marşrutlar & Cədvəl', icon: Bus },
            { id: 'calculator', label: 'Tarif & Baqaj', icon: CreditCard },
            { id: 'seats', label: 'Oturacaq & Rezervasiya', icon: Armchair },
            { id: 'standards', label: 'AYNA Standartları', icon: ShieldCheck },
            { id: 'ticket', label: 'Elektron Bilet', icon: FileText },
            { id: 'registry', label: 'Bilet Reyestri', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                data-testid={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as ModalTab)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5 rounded-t-xl'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: ROUTES & SCHEDULE */}
          {activeTab === 'routes' && (
            <div className="space-y-5" data-testid="routes-tab-content">
              {/* Filter and Search Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={routeSearch}
                    onChange={(e) => setRouteSearch(e.target.value)}
                    placeholder="Şəhər, marşrut kodu və ya daşıyıcı axtarın (məs: Gəncə, M-01)..."
                    data-testid="route-search-input"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  {[
                    { id: 'all', label: 'Bütün Avtobuslar' },
                    { id: 'm3_large_coach', label: 'M3 Böyük Coach' },
                    { id: 'm2_minibus', label: 'M2 Mikroavtobus' },
                  ].map((cls) => (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => setSelectedBusClass(cls.id)}
                      className={`flex-1 py-2 px-2 text-center text-xs rounded-xl font-medium transition-all ${
                        selectedBusClass === cls.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/60'
                      }`}
                    >
                      {cls.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Route Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRoutes.map((route) => {
                  const isSelected = selectedRouteId === route.id;
                  const convertedFare = convertAznToCurrency(route.baseFareAzn, selectedCurrency);
                  return (
                    <div
                      key={route.id}
                      data-testid={`route-card-${route.id}`}
                      className={`p-4 rounded-2xl border transition-all ${
                        isSelected
                          ? 'bg-indigo-950/20 border-indigo-500/50 shadow-lg shadow-indigo-950/20 ring-1 ring-indigo-500/30'
                          : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2.5 py-1 text-xs font-black tracking-wider rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                            {route.routeCode}
                          </span>
                          <div>
                            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                              <span>{route.originCity}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                              <span className="text-indigo-300">{route.destinationCity}</span>
                            </h3>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              <span>{route.destinationTerminal}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-black text-indigo-400">
                            {convertedFare} {selectedCurrency}
                          </div>
                          <p className="text-[10px] text-slate-500">Tarif Şurası baza tarifi</p>
                        </div>
                      </div>

                      {/* Route Details Strip */}
                      <div className="grid grid-cols-3 gap-2 mt-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Məsafə</span>
                          <span className="font-semibold text-slate-200">{route.distanceKm} km</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Müddət</span>
                          <span className="font-semibold text-slate-200">{route.durationHours} saat</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Boş Yer</span>
                          <span className="font-semibold text-emerald-400">{route.availableSeats} / {route.totalSeats}</span>
                        </div>
                      </div>

                      {/* Bus & Operator Details */}
                      <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400">
                        <span className="truncate pr-2 font-medium text-slate-300">
                          {route.busModel} ({route.busPlate})
                        </span>
                        <span className="text-[11px] text-slate-500 shrink-0">
                          {route.operatorName}
                        </span>
                      </div>

                      {/* Departure Times Badges */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {route.departureTimes.map((time) => (
                          <span
                            key={time}
                            className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60 text-[11px] font-mono"
                          >
                            {time}
                          </span>
                        ))}
                      </div>

                      {/* Amenities */}
                      <div className="mt-3 flex flex-wrap gap-1">
                        {route.amenities.map((item) => (
                          <span
                            key={item}
                            className="px-2 py-0.5 text-[10px] rounded-full bg-slate-800/50 text-indigo-300/80 border border-indigo-500/20"
                          >
                            ✓ {item}
                          </span>
                        ))}
                      </div>

                      {/* Action CTA */}
                      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-mono">
                          {route.routePassportNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSelectRoute(route)}
                          data-testid={`select-route-btn-${route.id}`}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>Bilet Hesabla & Al</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: FARE & LUGGAGE CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-6" data-testid="calculator-tab-content">
              {/* Route Summary Banner */}
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                    <Bus className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-indigo-400 text-sm">{selectedRoute.routeCode}</span>
                      <h3 className="font-bold text-white text-base">
                        {selectedRoute.originCity} → {selectedRoute.destinationCity}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400">
                      {selectedRoute.highwayCorridor} • {selectedRoute.distanceKm} km • {selectedRoute.durationHours} saat
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor="route-selector" className="text-xs text-slate-400 whitespace-nowrap">
                    Marşrutu dəyiş:
                  </label>
                  <select
                    id="route-selector"
                    value={selectedRouteId}
                    onChange={(e) => setSelectedRouteId(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500"
                  >
                    {MOCK_BUS_ROUTES.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.routeCode} - {r.originCity} → {r.destinationCity} ({r.baseFareAzn} AZN)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Calculator Settings Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-5">
                  {/* Comfort Tier Options */}
                  <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Avtobus Komfort Kateqoriyası
                    </h4>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { id: 'standard', label: 'Standart', mult: '1.0x', desc: 'Baza M3/M2 reysi' },
                        { id: 'comfort_express', label: 'Komfort Ekspres', mult: '1.15x', desc: 'Wi-Fi, USB, Kondisioner' },
                        { id: 'vip_business', label: 'VIP Biznes', mult: '1.35x', desc: 'Geniş oturacaq, Multimedia' },
                      ].map((tier) => (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => setComfortTier(tier.id as BusComfortTier)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            comfortTier === tier.id
                              ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                              : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold text-xs">
                            <span>{tier.label}</span>
                            <span className="text-[10px] text-indigo-400 font-mono">{tier.mult}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">{tier.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Passengers Counter */}
                  <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Sərnişin Tərkibi
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Adults */}
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold text-white block">Böyük (10+ yaş)</span>
                          <span className="text-[10px] text-slate-400">100% tam tarif</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setAdultsCount((c) => Math.max(1, c - 1))}
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-sm"
                          >
                            -
                          </button>
                          <span className="w-5 text-center font-bold text-sm text-indigo-400">
                            {adultsCount}
                          </span>
                          <button
                            type="button"
                            onClick={() => setAdultsCount((c) => Math.min(10, c + 1))}
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold text-white block">Uşaq (5–10 yaş)</span>
                          <span className="text-[10px] text-emerald-400 font-medium">50% qanuni güzəşt</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setChildrenCount((c) => Math.max(0, c - 1))}
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-sm"
                          >
                            -
                          </button>
                          <span className="w-5 text-center font-bold text-sm text-indigo-400">
                            {childrenCount}
                          </span>
                          <button
                            type="button"
                            onClick={() => setChildrenCount((c) => Math.min(5, c + 1))}
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Infants */}
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold text-white block">Körpə (&lt;5 yaş)</span>
                          <span className="text-[10px] text-slate-400">Ödənişsiz (yer tutmadan)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setInfantsCount((c) => Math.max(0, c - 1))}
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-sm"
                          >
                            -
                          </button>
                          <span className="w-5 text-center font-bold text-sm text-indigo-400">
                            {infantsCount}
                          </span>
                          <button
                            type="button"
                            onClick={() => setInfantsCount((c) => Math.min(3, c + 1))}
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Luggage Regulations */}
                  <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Luggage className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Baqaj və Əl Yükü Tənzimləməsi
                        </h4>
                      </div>
                      <span className="text-[11px] text-emerald-400 font-medium">
                        1 ədəd 20 kq-dək baqaj ödənişsizdir
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Excess Kg Slider */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300">Normadan artıq çəki:</span>
                          <span className="font-bold text-indigo-400">{excessLuggageKg} kq (0.05 ₼/kq)</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="40"
                          step="1"
                          value={excessLuggageKg}
                          onChange={(e) => setExcessLuggageKg(Number(e.target.value))}
                          className="w-full accent-indigo-500 bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Extra Suitcases */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300">Əlavə çamadan (2.00 ₼/ədəd):</span>
                          <span className="font-bold text-indigo-400">{extraBagsCount} ədəd</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {[0, 1, 2, 3, 4].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setExtraBagsCount(num)}
                              className={`flex-1 py-1 text-xs font-medium rounded-lg border transition-all ${
                                extraBagsCount === num
                                  ? 'bg-indigo-600 text-white border-indigo-500'
                                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calculation Summary Sidebar */}
                <div className="p-5 rounded-2xl bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                      <CreditCard className="w-4 h-4 text-indigo-400" />
                      <span>Rəsmi Tarif Hesabatı</span>
                    </h4>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Baza gediş haqqı (Böyük):</span>
                        <span className="font-mono text-slate-200">
                          {adultsCount} × {calculationResult.baseFareAzn} = {calculationResult.adultsTotalAzn} AZN
                        </span>
                      </div>

                      {childrenCount > 0 && (
                        <div className="flex justify-between text-emerald-400">
                          <span>Uşaq tarifi (-50% güzəşt):</span>
                          <span className="font-mono">
                            {childrenCount} × {(calculationResult.baseFareAzn * 0.5).toFixed(2)} = {calculationResult.childrenTotalAzn} AZN
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between text-slate-400">
                        <span>İcbari Sərnişin Qəza Sığortası:</span>
                        <span className="font-mono text-slate-200">
                          {calculationResult.insuranceFeeAzn} AZN ({PASSENGER_INSURANCE_AZN} ₼/yer)
                        </span>
                      </div>

                      <div className="flex justify-between text-slate-400">
                        <span>BBIQ Peron & Stansiya Rüsumu:</span>
                        <span className="font-mono text-slate-200">
                          {calculationResult.terminalPlatformFeeAzn} AZN ({TERMINAL_PLATFORM_FEE_AZN} ₼/yer)
                        </span>
                      </div>

                      {calculationResult.luggageSurchargeAzn > 0 && (
                        <div className="flex justify-between text-amber-400">
                          <span>Baqaj əlavə haqqı:</span>
                          <span className="font-mono">{calculationResult.luggageSurchargeAzn} AZN</span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm text-white">
                        <span>Cəmi Ödəniş:</span>
                        <span className="text-indigo-400 font-mono text-base">
                          {selectedCurrency === 'AZN'
                            ? `${calculationResult.totalAzn} AZN`
                            : selectedCurrency === 'USD'
                            ? `$${calculationResult.totalUsd}`
                            : `€${calculationResult.totalEur}`}
                        </span>
                      </div>

                      <p className="text-[10px] text-slate-500 pt-1">
                        * Qanunvericiliyə uyğun olaraq Tarif Şurası qərarı və İcbari Sığortalar Bürosu qəza fondu daxildir.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('seats')}
                    data-testid="proceed-to-seats-btn"
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
                  >
                    <span>Oturacaq Seç və Rezerv Et</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SEAT SELECTOR & BOOKING */}
          {activeTab === 'seats' && (
            <div className="space-y-6" data-testid="seats-tab-content">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Visual Bus Cabin Layout (Left side, 7 cols) */}
                <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Armchair className="w-4 h-4 text-indigo-400" />
                        <span>Avtobus Salonu & Oturacaq Xəritəsi</span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        {selectedRoute.busModel} • {selectedRoute.totalSeats} yerlik salon
                      </p>
                    </div>

                    {/* Seat status legend */}
                    <div className="flex items-center gap-3 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-slate-700 border border-slate-600" />
                        <span className="text-slate-400">Boş</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-indigo-600 border border-indigo-400" />
                        <span className="text-white font-medium">Seçilib</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-slate-800 border border-slate-800 opacity-50" />
                        <span className="text-slate-500">Məşğul</span>
                      </div>
                    </div>
                  </div>

                  {/* Bus Outline Container */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 relative max-w-sm mx-auto shadow-inner">
                    {/* Front Cab with Driver & Door */}
                    <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3 mb-3 text-xs text-slate-400">
                      <div className="flex items-center gap-2 p-1.5 px-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
                        <span className="text-slate-300 font-semibold text-[11px]">Sürücü Kabinası</span>
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-400 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/30">
                        Ön Qapı 🚪
                      </div>
                    </div>

                    {/* Seats Matrix: 4 per row (A B [Aisle] C D) */}
                    <div className="space-y-2">
                      {Array.from({ length: Math.ceil(selectedRoute.totalSeats / 4) }).map((_, rowIdx) => {
                        const rowNum = rowIdx + 1;
                        const rowSeats = busSeats.filter((s) => s.row === rowNum);
                        const seatA = rowSeats.find((s) => s.column === 'A');
                        const seatB = rowSeats.find((s) => s.column === 'B');
                        const seatC = rowSeats.find((s) => s.column === 'C');
                        const seatD = rowSeats.find((s) => s.column === 'D');

                        return (
                          <div key={rowNum} className="flex items-center justify-between gap-1">
                            {/* Left Pair (A & B) */}
                            <div className="flex items-center gap-1.5">
                              {[seatA, seatB].map((seat) => {
                                if (!seat) return <div key={Math.random()} className="w-8 h-8" />;
                                const isSelected = selectedSeat === seat.seatNumber;
                                return (
                                  <button
                                    key={seat.seatNumber}
                                    type="button"
                                    disabled={!seat.isAvailable}
                                    onClick={() => setSelectedSeat(seat.seatNumber)}
                                    data-testid={`seat-btn-${seat.seatNumber}`}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                                      isSelected
                                        ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400'
                                        : seat.isAvailable
                                        ? 'bg-slate-800 text-slate-300 border border-slate-700/80 hover:bg-slate-700 hover:text-white'
                                        : 'bg-slate-900/60 text-slate-600 border border-slate-800/80 cursor-not-allowed opacity-40'
                                    }`}
                                    title={`Oturacaq №${seat.seatNumber} (${seat.isWindow ? 'Pəncərə' : 'Dəhliz'})`}
                                  >
                                    {seat.seatNumber}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Middle Aisle */}
                            <div className="text-[10px] text-slate-600 font-mono">
                              {rowNum}
                            </div>

                            {/* Right Pair (C & D) */}
                            <div className="flex items-center gap-1.5">
                              {[seatC, seatD].map((seat) => {
                                if (!seat) return <div key={Math.random()} className="w-8 h-8" />;
                                const isSelected = selectedSeat === seat.seatNumber;
                                return (
                                  <button
                                    key={seat.seatNumber}
                                    type="button"
                                    disabled={!seat.isAvailable}
                                    onClick={() => setSelectedSeat(seat.seatNumber)}
                                    data-testid={`seat-btn-${seat.seatNumber}`}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                                      isSelected
                                        ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400'
                                        : seat.isAvailable
                                        ? 'bg-slate-800 text-slate-300 border border-slate-700/80 hover:bg-slate-700 hover:text-white'
                                        : 'bg-slate-900/60 text-slate-600 border border-slate-800/80 cursor-not-allowed opacity-40'
                                    }`}
                                    title={`Oturacaq №${seat.seatNumber} (${seat.isWindow ? 'Pəncərə' : 'Dəhliz'})`}
                                  >
                                    {seat.seatNumber}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Rear Emergency Exit */}
                    <div className="mt-3 pt-2 border-t border-slate-800 text-center text-[10px] text-slate-500">
                      Arxa Salon & Ehtiyat Çıxış
                    </div>
                  </div>
                </div>

                {/* Passenger Dossier & Issue Form (Right side, 5 cols) */}
                <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                      <User className="w-4 h-4 text-indigo-400" />
                      <span>Sərnişin Qeydiyyatı & Reys Seçimi</span>
                    </h4>

                    {/* Selected Seat Badge */}
                    <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Armchair className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs text-slate-300">Seçilmiş Oturacaq:</span>
                      </div>
                      <span className="text-base font-black text-indigo-400 font-mono">
                        № {selectedSeat}
                      </span>
                    </div>

                    {/* Passenger Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-300 block">Sərnişinin Adı və Soyadı:</label>
                      <input
                        type="text"
                        value={passengerName}
                        onChange={(e) => setPassengerName(e.target.value)}
                        placeholder="Məs: Vüsal Məmmədov"
                        data-testid="passenger-name-input"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* FIN Code */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-300 block">Şəxsiyyət Vəsiqəsi FİN Kodu:</label>
                      <input
                        type="text"
                        maxLength={7}
                        value={passengerFin}
                        onChange={(e) => setPassengerFin(e.target.value.toUpperCase())}
                        placeholder="Məs: 7N2K9X4"
                        data-testid="passenger-fin-input"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-300 block">Mobil Əlaqə Nömrəsi:</label>
                      <input
                        type="text"
                        value={passengerPhone}
                        onChange={(e) => setPassengerPhone(e.target.value)}
                        placeholder="+994 50 123 45 67"
                        data-testid="passenger-phone-input"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Departure Date & Time Selection */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-300 block">Səfər Tarixi:</label>
                        <input
                          type="date"
                          value={departureDate}
                          onChange={(e) => setDepartureDate(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-300 block">Reys Vaxtı:</label>
                        <select
                          value={departureTime}
                          onChange={(e) => setDepartureTime(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                        >
                          {selectedRoute.departureTimes.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Submission CTA */}
                  <div className="pt-4 border-t border-slate-800 space-y-2">
                    <button
                      type="button"
                      onClick={handleIssueTicket}
                      data-testid="issue-ticket-btn"
                      className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Bileti Təsdiq Et və Formanı Yarat</span>
                    </button>
                    <p className="text-[10px] text-slate-500 text-center">
                      * Bilet avtomatik olaraq AYNA Vahid E-Bilet bazasında qeydiyyata alınır.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AYNA STANDARDS & AUDIT */}
          {activeTab === 'standards' && (
            <div className="space-y-5" data-testid="standards-tab-content">
              <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  <span>AYNA & BDYP Rəsmi Şəhərlərarası Daşıyıcı Standartları</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  "Avtomobil nəqliyyatı haqqında" AR Qanunu, Nazirlər Kabinetinin 94 və 73 saylı qərarlarına əsasən daşıyıcı operatorlar üçün məcburi texniki və təhlükəsizlik tələbləri.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_CARRIER_AUDIT_RULES.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <h4 className="text-xs sm:text-sm font-bold text-white">{rule.title}</h4>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Uyğundur
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">{rule.standardRequirement}</p>

                    <div className="pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] gap-1">
                      <span className="text-indigo-400 font-medium">{rule.legalBasis}</span>
                      <span className="text-slate-500 text-[10px]">{rule.penaltyIfNonCompliant}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ELECTRONIC TICKET & BOARDING PASS */}
          {activeTab === 'ticket' && (
            <div className="space-y-6" data-testid="ticket-tab-content">
              {/* Action Buttons Bar */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-slate-400">
                  AYNA və BBIQ təsdiqli rəsmi elektron minik bileti
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyCode(currentTicket.ticketNumber)}
                    data-testid="copy-ticket-btn"
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Kopyalandı!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Kodu Kopyala</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    data-testid="print-ticket-btn"
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Çap Et</span>
                  </button>
                </div>
              </div>

              {/* Authentic Ticket Paper View */}
              <div className="max-w-2xl mx-auto bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
                {/* Header Strip with Flag & Coat of Arms representation */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                        AZƏRBAYCAN YERÜSTÜ NƏQLİYYAT AGENTLİYİ
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                      ELEKTRON MİNİK BİLETİ VƏ PERON BURAXILIŞ VƏRƏQƏSİ
                    </h3>
                    <p className="text-xs text-slate-400">
                      Bakı Beynəlxalq Avtovağzal Kompleksi (BBIQ) • biletim.az vahid sistem
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-indigo-400 block">
                      {currentTicket.ticketNumber}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 inline-block mt-1">
                      ● TƏSDİQLƏNİB
                    </span>
                  </div>
                </div>

                {/* Key Travel Telemetry Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Peron №</span>
                    <span className="text-xl font-black text-indigo-400">{currentTicket.platformNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Oturacaq №</span>
                    <span className="text-xl font-black text-indigo-400">{currentTicket.seatNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Çıxış Tarixi</span>
                    <span className="text-sm font-bold text-slate-200">{currentTicket.departureDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Çıxış Vaxtı</span>
                    <span className="text-sm font-bold text-slate-200">{currentTicket.departureTime}</span>
                  </div>
                </div>

                {/* Route & Stations Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Gediş Məntəqəsi</span>
                    <span className="font-bold text-white text-sm">{currentTicket.originCity}</span>
                    <p className="text-[11px] text-slate-400">{currentTicket.departureTerminal}</p>
                  </div>

                  <div className="space-y-1 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Təyinat Məntəqəsi</span>
                    <span className="font-bold text-indigo-300 text-sm">{currentTicket.destinationCity}</span>
                    <p className="text-[11px] text-slate-400">{currentTicket.arrivalTerminal}</p>
                  </div>
                </div>

                {/* Passenger & Coach Specs */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs border-t border-b border-slate-800 py-4">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Sərnişin</span>
                    <span className="font-semibold text-slate-200">{currentTicket.passengerName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">FİN Kodu</span>
                    <span className="font-mono font-bold text-indigo-400">{currentTicket.passengerFin}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Avtobus DQN</span>
                    <span className="font-mono font-semibold text-slate-200">{currentTicket.busPlate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Daşıyıcı Şirkət</span>
                    <span className="text-slate-300">{currentTicket.operatorName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Marşrut Pasportu</span>
                    <span className="font-mono text-slate-400">{currentTicket.routePassportNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Qeydiyyat Kodu</span>
                    <span className="font-mono text-indigo-400 text-[11px]">{currentTicket.securityChecksum.slice(0, 8)}</span>
                  </div>
                </div>

                {/* Financial Summary & QR Visualizer */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <div className="space-y-1 text-xs">
                    <div className="text-slate-400">
                      Baza tarif: {currentTicket.fareAzn} ₼ + Sığorta: {currentTicket.insuranceAzn} ₼ + Peron: {currentTicket.terminalFeeAzn} ₼
                    </div>
                    {currentTicket.luggageFeeAzn > 0 && (
                      <div className="text-amber-400">Əlavə Baqaj: {currentTicket.luggageFeeAzn} ₼</div>
                    )}
                    <div className="text-base font-black text-white">
                      Ödənilmiş Məbləğ:{' '}
                      <span className="text-indigo-400 font-mono">
                        {currentTicket.totalAzn} AZN
                      </span>
                    </div>
                  </div>

                  {/* QR & Barcode Representation */}
                  <div className="p-3 bg-white rounded-2xl text-slate-950 flex flex-col items-center gap-1 shadow-md">
                    <div className="w-24 h-24 bg-slate-950 rounded-xl flex items-center justify-center p-2">
                      <div className="w-full h-full border-2 border-dashed border-indigo-400/80 rounded flex items-center justify-center text-indigo-400 text-[9px] font-mono text-center">
                        QR AUTH<br />AYNA-BBIQ
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold tracking-widest">
                      {currentTicket.ticketNumber.slice(5)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: UNIFIED TICKET REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-4" data-testid="registry-tab-content">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    placeholder="Bilet nömrəsi, FİN və ya sərnişin axtarın..."
                    data-testid="registry-search-input"
                    className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <span className="text-xs text-slate-400">
                  Cəmi {filteredRegistryTickets.length} bilet tapıldı
                </span>
              </div>

              <div className="space-y-2.5">
                {filteredRegistryTickets.map((t) => (
                  <div
                    key={t.ticketNumber}
                    className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-indigo-400">
                          {t.ticketNumber}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {t.originCity} → {t.destinationCity}
                        </span>
                        <span
                          className={`px-2 py-0.2 rounded-full text-[10px] font-bold uppercase ${
                            t.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-700/50 text-slate-400 border border-slate-600/30'
                          }`}
                        >
                          {t.status === 'active' ? 'Aktiv Reys' : 'Qeydiyyatdan Keçib'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Sərnişin: <strong className="text-slate-200">{t.passengerName}</strong> (FİN: {t.passengerFin}) • Peron №{t.platformNumber} • Oturacaq №{t.seatNumber}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-indigo-400">
                          {t.totalAzn} AZN
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {t.departureDate} {t.departureTime}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setCurrentTicket(t);
                          setActiveTab('ticket');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-medium cursor-pointer"
                      >
                        Bax
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo, useEffect } from 'react';
import { Currency, Language, Vehicle } from '../types/vehicle';
import { formatPrice } from '../utils/i18n';
import { 
  ParkingLot, 
  ParkingZone, 
  ParkingPaymentMethod, 
  ActiveParkingSession, 
  ParkingTicketReceipt 
} from '../types/azParking';
import { MOCK_PARKING_LOTS, PARKING_RULES_FAQ } from '../data/mockParkingData';
import { 
  calculateParkingTariff, 
  generateSmsParkingCommand, 
  calculateOccupancyPercentage, 
  getOccupancyStatus, 
  checkResidentPermitEligibility, 
  generateParkingTicketReceipt, 
  ZONE_COLORS, 
  ZONE_LABELS,
  ZONE_HOURLY_RATES
} from '../utils/azParking';
import { useScrollLock } from '../hooks/useScrollLock';
import { useKeyPress } from '../hooks/useKeyPress';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { 
  X, 
  CircleParking, 
  Search, 
  MapPin, 
  Clock, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Printer, 
  Copy, 
  Check, 
  Play, 
  Square, 
  Plus, 
  Sliders, 
  Info, 
  HelpCircle, 
  Home, 
  MessageSquare, 
  DollarSign, 
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export interface AzParkingModalProps {
  isOpen: boolean;
  vehicle?: Vehicle | null;
  currency: Currency;
  lang: Language;
  onClose: () => void;
}

type TabType = 'radar' | 'calculator' | 'session' | 'receipt' | 'resident' | 'rules';

export function AzParkingModal({
  isOpen,
  vehicle,
  currency,
  lang,
  onClose,
}: AzParkingModalProps) {
  useScrollLock(isOpen);
  useKeyPress('Escape', onClose);
  const [copiedText, copyToClipboard] = useCopyToClipboard();
  const isCopied = !!copiedText;

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>('radar');

  // Search & Filter state for Radar
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<'all' | ParkingZone>('all');
  const [onlyEvChargers, setOnlyEvChargers] = useState(false);

  // Selected Parking Lot
  const [selectedLot, setSelectedLot] = useState<ParkingLot>(MOCK_PARKING_LOTS[0]);

  // Calculator State
  const defaultPlate = vehicle ? '99-AN-026' : '99-AA-101';
  const [plateNumber, setPlateNumber] = useState(defaultPlate);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [isSunday, setIsSunday] = useState(false);
  const [isNightWindow, setIsNightWindow] = useState(false);
  const [isEvExempt, setIsEvExempt] = useState(vehicle?.fuelType === 'electric');
  const [hasResidentPermit, setHasResidentPermit] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<ParkingPaymentMethod>('azparking_app');

  // Live Session State
  const [activeSession, setActiveSession] = useState<ActiveParkingSession | null>(null);
  const [sessionSecondsRemaining, setSessionSecondsRemaining] = useState(0);

  // Receipt State
  const [ticketReceipt, setTicketReceipt] = useState<ParkingTicketReceipt | null>(null);

  // Resident Permit Form State
  const [resAddress, setResAddress] = useState('Nizami küçəsi 54, mənzil 12');
  const [resPlate, setResPlate] = useState(defaultPlate);
  const [resCheckResult, setResCheckResult] = useState<{ eligible: boolean; radiusMeters: number; reasonAz: string; reasonEn: string } | null>(null);
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({
    doc1: true,
    doc2: true,
    doc3: false,
  });

  // Expanded FAQ items
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  // Sync EV exemption if vehicle changes
  useEffect(() => {
    if (vehicle?.fuelType === 'electric') {
      setIsEvExempt(true);
    }
  }, [vehicle]);

  // Session countdown timer effect
  useEffect(() => {
    if (!activeSession || sessionSecondsRemaining <= 0) return;

    const interval = setInterval(() => {
      setSessionSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setActiveSession((s) => s ? { ...s, status: 'expired' } : null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession, sessionSecondsRemaining]);

  // Filtered Parking Lots
  const filteredLots = useMemo(() => {
    return MOCK_PARKING_LOTS.filter((lot) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = 
        !q ||
        lot.nameAz.toLowerCase().includes(q) ||
        lot.nameEn.toLowerCase().includes(q) ||
        lot.streetAddress.toLowerCase().includes(q) ||
        lot.district.toLowerCase().includes(q) ||
        lot.zoneCode.includes(q);

      const matchesZone = selectedZoneFilter === 'all' || lot.zone === selectedZoneFilter;
      const matchesEv = !onlyEvChargers || lot.evChargerSpots > 0;

      return matchesQuery && matchesZone && matchesEv;
    });
  }, [searchQuery, selectedZoneFilter, onlyEvChargers]);

  // Calculation Result
  const tariffResult = useMemo(() => {
    return calculateParkingTariff({
      zone: selectedLot.zone,
      durationMinutes,
      currency,
      isSunday,
      isNightWindow,
      isElectricVehicle: isEvExempt,
      hasResidentPermit,
    });
  }, [selectedLot, durationMinutes, currency, isSunday, isNightWindow, isEvExempt, hasResidentPermit]);

  // SMS command string
  const smsCommand = useMemo(() => {
    const hours = Math.max(1, Math.ceil(durationMinutes / 60));
    return generateSmsParkingCommand(plateNumber, selectedLot.zoneCode, hours);
  }, [plateNumber, selectedLot, durationMinutes]);

  // Start Session handler
  const handleStartSession = () => {
    const totalSecs = durationMinutes * 60;
    const session: ActiveParkingSession = {
      sessionId: `SES-${Date.now().toString().slice(-6)}`,
      lotId: selectedLot.id,
      lotName: selectedLot.nameAz,
      zoneCode: selectedLot.zoneCode,
      zone: selectedLot.zone,
      plateNumber: plateNumber.trim().toUpperCase(),
      startTime: new Date().toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' }),
      durationMinutes,
      totalPaidAzn: tariffResult.totalAmountAzn,
      status: durationMinutes <= 15 ? 'grace_period' : 'active',
      smsCommand,
    };

    setActiveSession(session);
    setSessionSecondsRemaining(totalSecs);
    setActiveTab('session');
  };

  // Stop session & generate ticket
  const handleStopSession = () => {
    if (!activeSession) return;

    const receipt = generateParkingTicketReceipt({
      lotName: activeSession.lotName,
      zoneCode: activeSession.zoneCode,
      street: selectedLot.streetAddress,
      plateNumber: activeSession.plateNumber,
      durationMinutes: activeSession.durationMinutes,
      amountAzn: activeSession.totalPaidAzn,
      currency,
      paymentMethod,
      vehicleType: vehicle ? `${vehicle.make} ${vehicle.model}` : 'Minik avtomobili',
    });

    setTicketReceipt(receipt);
    setActiveSession(null);
    setSessionSecondsRemaining(0);
    setActiveTab('receipt');
  };

  // Extend active session
  const handleExtendSession = (additionalMinutes: number) => {
    if (!activeSession) return;
    const newTotalMinutes = activeSession.durationMinutes + additionalMinutes;
    setActiveSession({
      ...activeSession,
      durationMinutes: newTotalMinutes,
      status: 'active',
    });
    setSessionSecondsRemaining((prev) => prev + additionalMinutes * 60);
  };

  // Check resident eligibility handler
  const handleCheckResident = (e: React.FormEvent) => {
    e.preventDefault();
    const res = checkResidentPermitEligibility(resAddress, resPlate);
    setResCheckResult(res);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
      data-testid="az-parking-modal"
    >
      <div 
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/70 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 text-white shadow-lg shadow-sky-600/30">
              <CircleParking className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  AYNA AzParking Dövlət Parklanma Radarı
                </h2>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  RİNN / AYNA Rəsmi Sistem
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Bakı şəhəri üzrə dövlət parklanma zonaları, canlı doluluq xəritəsi və rəsmi tarif kalkulyatoru
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
            data-testid="az-parking-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-2 bg-slate-950/40 border-b border-slate-800 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'radar' as TabType, label: 'Parklanma Radarı', icon: MapPin },
            { id: 'calculator' as TabType, label: 'Tarif & SMS Parkinq', icon: Sliders },
            { id: 'session' as TabType, label: 'Canlı Seans', icon: Play, badge: activeSession ? 'Aktiv' : undefined },
            { id: 'receipt' as TabType, label: 'E-Qəbz & Talon', icon: FileText },
            { id: 'resident' as TabType, label: 'Fərdi Sakin Talonu', icon: Home },
            { id: 'rules' as TabType, label: 'Qaydalar & FAQ', icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                data-testid={`tab-${tab.id}`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500 text-white font-black animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: RADAR */}
          {activeTab === 'radar' && (
            <div className="space-y-6" data-testid="tab-content-radar">
              {/* Search & Filters */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Məntəqə adı, küçə, rayon və ya zona kodu ilə axtarın (məs: Nizami, 1001, Gənclik)..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700 rounded-2xl text-white text-sm focus:outline-none focus:border-sky-500 transition-all placeholder-slate-500"
                    data-testid="radar-search-input"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => setSelectedZoneFilter('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        selectedZoneFilter === 'all'
                          ? 'bg-slate-700 text-white'
                          : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      Bütün Zonalar ({MOCK_PARKING_LOTS.length})
                    </button>
                    {(['zone1_center', 'zone2_inner', 'zone3_intermediate', 'zone4_outer'] as ParkingZone[]).map((zone) => (
                      <button
                        key={zone}
                        onClick={() => setSelectedZoneFilter(zone)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                          selectedZoneFilter === zone
                            ? `${ZONE_COLORS[zone].badge} shadow-sm`
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        {ZONE_LABELS[zone][lang]} ({ZONE_HOURLY_RATES[zone].toFixed(2)} AZN)
                      </button>
                    ))}
                  </div>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={onlyEvChargers}
                      onChange={(e) => setOnlyEvChargers(e.target.checked)}
                      className="rounded border-slate-700 text-sky-500 focus:ring-0"
                    />
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Yalnız EV şarj olanlar</span>
                  </label>
                </div>
              </div>

              {/* Parking Lots Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredLots.map((lot) => {
                  const occupancy = calculateOccupancyPercentage(lot.occupiedSpots, lot.totalCapacity);
                  const status = getOccupancyStatus(occupancy);
                  const availableSpots = Math.max(0, lot.totalCapacity - lot.occupiedSpots);
                  const isSelected = selectedLot.id === lot.id;

                  return (
                    <div
                      key={lot.id}
                      onClick={() => setSelectedLot(lot)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-sky-950/30 border-sky-500 shadow-lg shadow-sky-600/10'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                      data-testid={`lot-card-${lot.id}`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-sky-300 font-bold">
                              ZONA KODU: {lot.zoneCode}
                            </span>
                            <h4 className="text-sm font-bold text-white mt-1.5 leading-snug">
                              {lot.nameAz}
                            </h4>
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                              <span>{lot.streetAddress}</span>
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-xl text-xs font-black border ${ZONE_COLORS[lot.zone].badge} shrink-0`}>
                            {lot.hourlyRateAzn.toFixed(2)} AZN/saat
                          </span>
                        </div>

                        {/* Occupancy Indicator */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">Doluluq: {occupancy}%</span>
                            <span className={`font-semibold ${status.color}`}>
                              {availableSpots} boş yer
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 rounded-full ${
                                occupancy >= 90 ? 'bg-rose-500' : occupancy >= 65 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${occupancy}%` }}
                            />
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                          {lot.evChargerSpots > 0 && (
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 flex items-center gap-1 font-semibold">
                              <Zap className="w-3 h-3" />
                              {lot.evChargerSpots} EV şarj
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-lg bg-slate-800/80 text-slate-300 font-semibold">
                            {lot.district}
                          </span>
                          {lot.hasCctv && (
                            <span className="px-2 py-0.5 rounded-lg bg-blue-950/40 border border-blue-800/40 text-blue-300 flex items-center gap-1 font-semibold">
                              <ShieldCheck className="w-3 h-3" /> CCTV
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          {lot.operatingHours}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLot(lot);
                            setActiveTab('calculator');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/20 cursor-pointer"
                        >
                          Park Et
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredLots.length === 0 && (
                <div className="text-center py-12 space-y-3 bg-slate-950/40 rounded-2xl border border-slate-800">
                  <CircleParking className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-slate-400 text-sm">
                    Axtarışa uyğun parklanma məntəqəsi tapılmadı.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedZoneFilter('all');
                      setOnlyEvChargers(false);
                    }}
                    className="text-xs text-sky-400 hover:underline"
                  >
                    Filtrləri sıfırla
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CALCULATOR & SMS */}
          {activeTab === 'calculator' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" data-testid="tab-content-calculator">
              {/* Form Side */}
              <div className="lg:col-span-7 space-y-5">
                {/* Selected Lot Display */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold">Seçilmiş Parklanma Yeri</span>
                    <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 font-mono text-xs font-bold">
                      KOD: {selectedLot.zoneCode}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{selectedLot.nameAz}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{selectedLot.streetAddress} ({selectedLot.district})</span>
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-xs">
                    <span className="text-slate-400">Tarif:</span>
                    <span className="font-bold text-sky-400">{selectedLot.hourlyRateAzn.toFixed(2)} AZN / saat</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-emerald-400 font-semibold">İlk 15 dəqiqə pulsuz</span>
                  </div>
                </div>

                {/* Car Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Dövlət Qeydiyyat Nişanı (Nömrə)
                    </label>
                    <input
                      type="text"
                      value={plateNumber}
                      onChange={(e) => setPlateNumber(e.target.value)}
                      placeholder="99-AA-999"
                      className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white font-mono uppercase font-bold text-sm focus:outline-none focus:border-sky-500"
                      data-testid="plate-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Ödəniş Metodu
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as ParkingPaymentMethod)}
                      className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                    >
                      <option value="azparking_app">AzParking Mobil Tətbiqi</option>
                      <option value="sms_1181">SMS (1181 Qısa Nömrəsi)</option>
                      <option value="m10">m10 Rəqəmsal Pulqabı</option>
                      <option value="birkart">BirBank / Bank Kartı</option>
                      <option value="apple_pay">Apple Pay / Google Pay</option>
                    </select>
                  </div>
                </div>

                {/* Duration Picker */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Parklanma Müddəti: <span className="text-sky-400 font-bold">{durationMinutes} dəqiqə</span> ({Math.floor(durationMinutes / 60)}s {durationMinutes % 60}d)
                  </label>
                  
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[
                      { mins: 15, label: '15 dəq (Pulsuz)' },
                      { mins: 30, label: '30 dəq' },
                      { mins: 60, label: '1 saat' },
                      { mins: 120, label: '2 saat' },
                      { mins: 240, label: '4 saat' },
                      { mins: 480, label: '8 saat' },
                    ].map((btn) => (
                      <button
                        key={btn.mins}
                        type="button"
                        onClick={() => setDurationMinutes(btn.mins)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          durationMinutes === btn.mins
                            ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                            : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                        data-testid={`duration-btn-${btn.mins}`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  <input
                    type="range"
                    min="15"
                    max="720"
                    step="15"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                </div>

                {/* Exemption Checkboxes */}
                <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Xüsusi Güzəştlər & Qanuni İstisnalar
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isSunday}
                        onChange={(e) => setIsSunday(e.target.checked)}
                        className="rounded border-slate-700 text-sky-500"
                        data-testid="sunday-checkbox"
                      />
                      <span>Bazar günü (100% Pulsuz)</span>
                    </label>

                    <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isNightWindow}
                        onChange={(e) => setIsNightWindow(e.target.checked)}
                        className="rounded border-slate-700 text-sky-500"
                        data-testid="night-checkbox"
                      />
                      <span>Gecə saatları (22:00 - 07:00)</span>
                    </label>

                    <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isEvExempt}
                        onChange={(e) => setIsEvExempt(e.target.checked)}
                        className="rounded border-slate-700 text-sky-500"
                        data-testid="ev-checkbox"
                      />
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Zap className="w-3.5 h-3.5" />
                        Elektromobil (EV Yaşıl Təşviq)
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={hasResidentPermit}
                        onChange={(e) => setHasResidentPermit(e.target.checked)}
                        className="rounded border-slate-700 text-sky-500"
                        data-testid="resident-checkbox"
                      />
                      <span className="flex items-center gap-1 text-sky-400">
                        <Home className="w-3.5 h-3.5" />
                        Fərdi Sakin Talonu
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Summary & SMS Command Side */}
              <div className="lg:col-span-5 space-y-5">
                {/* Cost Breakdown Card */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-sky-950/40 border border-sky-500/30 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                      Hesablanmış Məbləğ
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                      Rəsmi AYNA Tarifi
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-black text-white">
                        {tariffResult.totalAmountAzn.toFixed(2)} AZN
                      </span>
                      {currency !== 'AZN' && (
                        <span className="text-sm font-bold text-slate-400">
                          ≈ {formatPrice(tariffResult.totalAmountAzn, currency)}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Saatlıq baza tarif:</span>
                        <span className="font-semibold text-slate-300">{tariffResult.hourlyRateAzn.toFixed(2)} AZN</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ödənişli müddət:</span>
                        <span className="font-semibold text-slate-300">{tariffResult.chargeableMinutes} dəqiqə</span>
                      </div>
                      {tariffResult.discountAzn > 0 && (
                        <div className="flex justify-between text-emerald-400 font-semibold">
                          <span>Tətbiq edilən güzəşt:</span>
                          <span>-{tariffResult.discountAzn.toFixed(2)} AZN</span>
                        </div>
                      )}
                      <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/80">
                        <span>ƏDV (18% daxil):</span>
                        <span>{tariffResult.vatAmountAzn.toFixed(2)} AZN</span>
                      </div>
                    </div>
                  </div>

                  {/* Notes / alerts */}
                  {tariffResult.notes.length > 0 && (
                    <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-800/30 space-y-1">
                      {tariffResult.notes.map((note, idx) => (
                        <p key={idx} className="text-xs text-sky-300 flex items-start gap-1.5">
                          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{note}</span>
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Start Session Action */}
                  <button
                    onClick={handleStartSession}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    data-testid="start-session-btn"
                  >
                    <Play className="w-4 h-4" />
                    <span>Parklanma Seansını Başlat</span>
                  </button>
                </div>

                {/* SMS 1181 Helper Box */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                      1181 SMS ilə Parklanma
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">Qısa nömrə: 1181</span>
                  </div>

                  <p className="text-xs text-slate-400">
                    İnternet olmadığı halda bu əmri <strong>1181</strong> nömrəsinə göndərərək dərhal parklanmanı aktivləşdirə bilərsiniz:
                  </p>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between font-mono text-sm text-sky-300 font-bold">
                    <span>{smsCommand}</span>
                    <button
                      onClick={() => copyToClipboard(smsCommand)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      data-testid="copy-sms-btn"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Kopyalandı' : 'Kopyala'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE SESSION SIMULATOR */}
          {activeTab === 'session' && (
            <div className="space-y-6" data-testid="tab-content-session">
              {activeSession ? (
                <div className="max-w-2xl mx-auto space-y-6">
                  {/* Active Timer Box */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/90 border border-sky-500/40 shadow-2xl text-center space-y-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Aktiv Parklanma Seansı ({activeSession.sessionId})
                    </div>

                    <div className="space-y-1">
                      <div className="text-5xl sm:text-6xl font-black font-mono text-white tracking-wider">
                        {Math.floor(sessionSecondsRemaining / 3600).toString().padStart(2, '0')}:
                        {Math.floor((sessionSecondsRemaining % 3600) / 60).toString().padStart(2, '0')}:
                        {(sessionSecondsRemaining % 60).toString().padStart(2, '0')}
                      </div>
                      <p className="text-xs text-slate-400">Qalan parklanma vaxtı</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-1000"
                        style={{
                          width: `${Math.min(100, (sessionSecondsRemaining / (activeSession.durationMinutes * 60)) * 100)}%`
                        }}
                      />
                    </div>

                    {/* Session Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left pt-2">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase block font-semibold">Nömrə</span>
                        <span className="text-xs font-bold text-white font-mono">{activeSession.plateNumber}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase block font-semibold">Zona</span>
                        <span className="text-xs font-bold text-sky-400">Kod: {activeSession.zoneCode}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase block font-semibold">Başlama</span>
                        <span className="text-xs font-bold text-white">{activeSession.startTime}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase block font-semibold">Məbləğ</span>
                        <span className="text-xs font-bold text-emerald-400">{activeSession.totalPaidAzn.toFixed(2)} AZN</span>
                      </div>
                    </div>

                    {/* Extension Buttons */}
                    <div className="space-y-2 pt-2">
                      <span className="text-xs text-slate-400 font-semibold block">Vaxtı Artır:</span>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleExtendSession(15)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                          data-testid="extend-15-btn"
                        >
                          <Plus className="w-3.5 h-3.5" /> 15 dəq
                        </button>
                        <button
                          onClick={() => handleExtendSession(30)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> 30 dəq
                        </button>
                        <button
                          onClick={() => handleExtendSession(60)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> 1 saat
                        </button>
                      </div>
                    </div>

                    {/* Stop & Checkout */}
                    <button
                      onClick={handleStopSession}
                      className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      data-testid="stop-session-btn"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      <span>Parklanmanı Dayandır və E-Qəbz Al</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 space-y-4 bg-slate-950/40 rounded-3xl border border-slate-800 max-w-lg mx-auto">
                  <CircleParking className="w-12 h-12 text-slate-600 mx-auto" />
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white">Hazırda aktiv parklanma seansı yoxdur</h3>
                    <p className="text-xs text-slate-400">
                      Tarif kalkulyatoru bölməsindən parklanma yerini və müddətini seçərək canlı seansı başlada bilərsiniz.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('calculator')}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Kalkulyatora Keç
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: RECEIPT & TICKET */}
          {activeTab === 'receipt' && (
            <div className="space-y-6" data-testid="tab-content-receipt">
              {ticketReceipt ? (
                <div className="max-w-xl mx-auto space-y-4">
                  {/* Digital Receipt Layout */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden space-y-6 print:bg-white print:text-black">
                    {/* Header */}
                    <div className="text-center border-b border-slate-800 pb-4 space-y-1">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 mb-1">
                        <CircleParking className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-black text-white uppercase tracking-wider">
                        AzParking Dövlət Sistemi
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Azərbaycan Yerüstü Nəqliyyat Agentliyi (AYNA)
                      </p>
                      <p className="text-[10px] text-sky-400 font-mono">
                        QƏBZ №: {ticketReceipt.ticketId}
                      </p>
                    </div>

                    {/* Receipt Details Table */}
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-900">
                        <span className="text-slate-400">Dövlət Qeydiyyat Nişanı:</span>
                        <span className="font-bold text-white font-mono">{ticketReceipt.plateNumber}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-900">
                        <span className="text-slate-400">Parklanma Məntəqəsi:</span>
                        <span className="font-bold text-white text-right max-w-[240px]">{ticketReceipt.zoneName}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-900">
                        <span className="text-slate-400">Zona Kodu:</span>
                        <span className="font-bold text-sky-400 font-mono">{ticketReceipt.zoneCode}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-900">
                        <span className="text-slate-400">Daxilolma Vaxtı:</span>
                        <span className="font-semibold text-white">{ticketReceipt.checkInTime}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-900">
                        <span className="text-slate-400">Bitmə Vaxtı:</span>
                        <span className="font-semibold text-white">{ticketReceipt.expiryTime}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-900">
                        <span className="text-slate-400">Müddət:</span>
                        <span className="font-semibold text-white">{ticketReceipt.durationMinutes} dəqiqə</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-900">
                        <span className="text-slate-400">Ödəniş Metodu:</span>
                        <span className="font-semibold text-white uppercase">{ticketReceipt.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between py-1 pt-2 text-sm font-bold">
                        <span className="text-white">Ödənilmiş Məbləğ:</span>
                        <span className="text-emerald-400 font-black">{ticketReceipt.amountPaidAzn.toFixed(2)} AZN</span>
                      </div>
                    </div>

                    {/* Barcode & Security */}
                    <div className="text-center pt-3 border-t border-slate-800 space-y-1 font-mono">
                      <div className="text-xs text-slate-500 tracking-widest select-none">
                        {ticketReceipt.barcode}
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Təsdiq Kodu: {ticketReceipt.verificationCode} • Bu qəbz rəsmi maliyyə sənədidir.
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                      data-testid="print-receipt-btn"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Çap Et</span>
                    </button>
                    <button
                      onClick={() => copyToClipboard(`AzParking Qəbz: ${ticketReceipt.ticketId} | Nömrə: ${ticketReceipt.plateNumber} | Məbləğ: ${ticketReceipt.amountPaidAzn} AZN`)}
                      className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                      data-testid="copy-receipt-btn"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{isCopied ? 'Kopyalandı' : 'Məlumatı Kopyala'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 space-y-4 bg-slate-950/40 rounded-3xl border border-slate-800 max-w-lg mx-auto">
                  <FileText className="w-12 h-12 text-slate-600 mx-auto" />
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white">Hələ ki yaradılmış qəbz yoxdur</h3>
                    <p className="text-xs text-slate-400">
                      Parklanma seansını tamamladıqdan sonra elektron qəbz və talon burada formalaşacaq.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      // Demo receipt generation
                      const demoReceipt = generateParkingTicketReceipt({
                        lotName: selectedLot.nameAz,
                        zoneCode: selectedLot.zoneCode,
                        street: selectedLot.streetAddress,
                        plateNumber,
                        durationMinutes,
                        amountAzn: tariffResult.totalAmountAzn,
                        currency,
                        paymentMethod,
                      });
                      setTicketReceipt(demoReceipt);
                    }}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all cursor-pointer"
                    data-testid="generate-demo-receipt-btn"
                  >
                    Nümunəvi Qəbz Yarat
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: RESIDENT PERMIT (Fərdi Sakin Talonu) */}
          {activeTab === 'resident' && (
            <div className="max-w-3xl mx-auto space-y-6" data-testid="tab-content-resident">
              <div className="p-4 rounded-2xl bg-sky-950/20 border border-sky-800/30 flex items-start gap-3">
                <Home className="w-5 h-5 text-sky-400 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-300 space-y-1">
                  <strong className="text-sky-300 block font-semibold">
                    Fərdi Parklanma Talonu Nədir?
                  </strong>
                  <p className="leading-relaxed">
                    Dövlət parklanma yerlərinin yerləşdiyi binalarda daimi qeydiyyatda olan sakinlər yaşadıqları ünvandan 100 metr radiusda avtomobillərini <strong>tamamilə ödənişsiz</strong> park etmək hüququna malikdirlər.
                  </p>
                </div>
              </div>

              {/* Eligibility Check Form */}
              <form onSubmit={handleCheckResident} className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Sakinlik Hüququnun Yoxlanılması
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Yaşayış Qeydiyyatı Ünvanı
                    </label>
                    <input
                      type="text"
                      value={resAddress}
                      onChange={(e) => setResAddress(e.target.value)}
                      placeholder="Məsələn: Nizami küç. 54, mənzil 12"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                      data-testid="resident-address-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Avtomobil Dövlət Qeydiyyat Nişanı
                    </label>
                    <input
                      type="text"
                      value={resPlate}
                      onChange={(e) => setResPlate(e.target.value)}
                      placeholder="99-AA-999"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono uppercase text-xs font-bold focus:outline-none focus:border-sky-500"
                      data-testid="resident-plate-input"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all shadow-md shadow-sky-600/20 cursor-pointer"
                  data-testid="check-resident-btn"
                >
                  Uyğunluğu Yoxla
                </button>

                {resCheckResult && (
                  <div className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                    resCheckResult.eligible
                      ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                      : 'bg-rose-950/30 border-rose-800/40 text-rose-300'
                  }`} data-testid="resident-check-result">
                    <div className="flex items-center gap-2 font-bold">
                      {resCheckResult.eligible ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Təbrik edirik! Sakin Talonu Üçün Hüququnuz Təsdiqləndi</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                          <span>Məlumat Çatışmır</span>
                        </>
                      )}
                    </div>
                    <p>{resCheckResult.reasonAz}</p>
                  </div>
                )}
              </form>

              {/* Required Documents Checklist */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Tələb Olunan Rəsmi Sənədlər (ASAN Login Üzərindən)
                </h4>

                <div className="space-y-2 text-xs">
                  {[
                    { id: 'doc1', title: 'Mənzilin çıxarışı (Kupça) və ya dövlət orderi' },
                    { id: 'doc2', title: 'Nəqliyyat vasitəsinin qeydiyyat şəhadətnaməsi (Texpasport)' },
                    { id: 'doc3', title: 'Ərizəçinin şəxsiyyət vəsiqəsi (Daimi qeydiyyat tələbi ilə)' },
                  ].map((doc) => (
                    <label 
                      key={doc.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 cursor-pointer hover:bg-slate-800/40 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={!!checkedDocs[doc.id]}
                        onChange={(e) => setCheckedDocs({ ...checkedDocs, [doc.id]: e.target.checked })}
                        className="rounded border-slate-700 text-sky-500"
                      />
                      <span className="text-slate-300">{doc.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: RULES & FAQ */}
          {activeTab === 'rules' && (
            <div className="max-w-3xl mx-auto space-y-6" data-testid="tab-content-rules">
              {/* Penalty Notice */}
              <div className="p-4 rounded-2xl bg-rose-950/25 border border-rose-800/40 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-300 space-y-1">
                  <strong className="text-rose-300 block font-bold">
                    İXM Maddə 346.1: Qanunsuz / Ödənişsiz Parklanma Cəriməsi
                  </strong>
                  <p className="leading-relaxed">
                    Dövlət parklanma yerlərində 15 dəqiqəlik güzəşt müddəti bitdikdən sonra ödəniş edilməzsə, patrul və foto-radar sistemləri tərəfindən <strong>20 AZN</strong> məbləğində elektron cərimə protokolu tərtib edilir.
                  </p>
                </div>
              </div>

              {/* Accordion FAQ */}
              <div className="space-y-2.5">
                {PARKING_RULES_FAQ.map((faq, idx) => {
                  const isExpanded = expandedFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden transition-colors"
                    >
                      <button
                        onClick={() => setExpandedFaqIndex(isExpanded ? null : idx)}
                        className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-white hover:text-sky-300 transition-colors cursor-pointer"
                      >
                        <span>{faq.qAz}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-sky-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 text-xs text-slate-300 border-t border-slate-800/60 leading-relaxed space-y-2">
                          <p>{faq.aAz}</p>
                          <p className="text-slate-500 italic">{faq.aEn}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

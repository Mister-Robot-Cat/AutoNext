import React, { useState, useMemo } from 'react';
import { Currency, Language, Vehicle } from '../types/vehicle';
import { 
  TollVehicleCategory, 
  TollPaymentMethod, 
  TollPlaza, 
  TransponderAccount, 
  TollTransitReceipt 
} from '../types/tollRoad';
import { 
  MOCK_TOLL_PLAZAS, 
  MOCK_TRANSPONDER_ACCOUNT, 
  TOLL_HIGHWAY_INFO 
} from '../data/mockTollRoads';
import { 
  calculateTollFare, 
  simulateTransponderTopUp, 
  simulateGatePassage, 
  generateTollReceipt, 
  detectVehicleCategory, 
  getVehicleCategoryDisplayName, 
  getPaymentMethodDisplayName,
  STATUTORY_TOLL_RATES,
  PAYMENT_METHOD_DISCOUNTS
} from '../utils/tollRoads';
import { formatPrice } from '../utils/i18n';
import { useScrollLock } from '../hooks/useScrollLock';
import { useKeyPress } from '../hooks/useKeyPress';
import { toastManager } from '../hooks/useToast';
import { 
  Route, 
  Navigation, 
  ShieldCheck, 
  Clock, 
  Zap, 
  Car, 
  Truck, 
  CreditCard, 
  QrCode, 
  Radio, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  ArrowRightLeft, 
  ArrowRight, 
  Copy, 
  Check, 
  Printer, 
  X, 
  Flame, 
  Leaf, 
  Gauge,
  PhoneCall,
  Sparkles
} from 'lucide-react';

interface TollRoadModalProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  currency: Currency;
  lang: Language;
  onClose: () => void;
}

export const TollRoadModal: React.FC<TollRoadModalProps> = ({
  isOpen,
  vehicle,
  currency,
  lang,
  onClose,
}) => {
  useScrollLock(isOpen);
  useKeyPress('Escape', onClose);

  const [activeTab, setActiveTab] = useState<'radar' | 'calculator' | 'transponder' | 'voucher'>('radar');

  // Search & Filter state for radar
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

  // Calculator states
  const [entryPlazaId, setEntryPlazaId] = useState<string>('plaza-yashma');
  const [exitPlazaId, setExitPlazaId] = useState<string>('plaza-quba');
  const [vehicleCategory, setVehicleCategory] = useState<TollVehicleCategory>(() => detectVehicleCategory(vehicle));
  const [paymentMethod, setPaymentMethod] = useState<TollPaymentMethod>('transponder_rfid');

  // Transponder state
  const [transponder, setTransponder] = useState<TransponderAccount>(() => ({
    ...MOCK_TRANSPONDER_ACCOUNT,
    linkedPlateNumber: vehicle?.plateNumber || MOCK_TRANSPONDER_ACCOUNT.linkedPlateNumber,
  }));
  const [passageStatus, setPassageStatus] = useState<{
    simulated: boolean;
    success: boolean;
    message: string;
    gateOpen: boolean;
  }>({
    simulated: false,
    success: false,
    message: '',
    gateOpen: false,
  });

  // Voucher state
  const [currentReceipt, setCurrentReceipt] = useState<TollTransitReceipt | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Lookup plazas
  const entryPlaza = useMemo(() => {
    return MOCK_TOLL_PLAZAS.find(p => p.id === entryPlazaId) || MOCK_TOLL_PLAZAS[0];
  }, [entryPlazaId]);

  const exitPlaza = useMemo(() => {
    return MOCK_TOLL_PLAZAS.find(p => p.id === exitPlazaId) || MOCK_TOLL_PLAZAS[4];
  }, [exitPlazaId]);

  // Route calculation
  const routeCalculation = useMemo(() => {
    return calculateTollFare(entryPlaza, exitPlaza, vehicleCategory, paymentMethod, currency);
  }, [entryPlaza, exitPlaza, vehicleCategory, paymentMethod, currency]);

  // Filtered plazas
  const filteredPlazas = useMemo(() => {
    return MOCK_TOLL_PLAZAS.filter(plaza => {
      const matchesSearch = plaza.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plaza.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plaza.nearestCity.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDistrict = selectedDistrict === 'all' || plaza.district.toLowerCase().includes(selectedDistrict.toLowerCase());
      return matchesSearch && matchesDistrict;
    });
  }, [searchQuery, selectedDistrict]);

  // Swap plazas
  const handleSwapPlazas = () => {
    setEntryPlazaId(exitPlazaId);
    setExitPlazaId(entryPlazaId);
  };

  // Top up transponder
  const handleTopUp = (amountAzn: number) => {
    const updated = simulateTransponderTopUp(transponder, amountAzn);
    setTransponder(updated);
    toastManager.add(`Transponder balansınız +${amountAzn} AZN artırıldı! Yeni balans: ${updated.balanceAzn.toFixed(2)} AZN`, 'success');
  };

  // Gate passage simulation
  const handleSimulatePassage = () => {
    const result = simulateGatePassage(transponder, routeCalculation.netFareAzn);
    if (result.success) {
      setTransponder(result.updatedAccount);
      setPassageStatus({
        simulated: true,
        success: true,
        message: result.message,
        gateOpen: true,
      });
      toastManager.add('Turniket açıldı! Yaşıl işıq. Sürət 50 km/s ilə maneəsiz keçid.', 'success');

      // Auto generate receipt
      const receipt = generateTollReceipt(
        routeCalculation, 
        transponder.linkedPlateNumber, 
        transponder.transponderId
      );
      setCurrentReceipt(receipt);

      setTimeout(() => {
        setPassageStatus(prev => ({ ...prev, gateOpen: false }));
      }, 4000);
    } else {
      setPassageStatus({
        simulated: true,
        success: false,
        message: result.message,
        gateOpen: false,
      });
      toastManager.add(result.message, 'error');
    }
  };

  // Generate receipt on demand
  const handleGenerateReceipt = () => {
    const receipt = generateTollReceipt(
      routeCalculation,
      vehicle?.plateNumber || transponder.linkedPlateNumber,
      paymentMethod === 'transponder_rfid' ? transponder.transponderId : undefined
    );
    setCurrentReceipt(receipt);
    setActiveTab('voucher');
    toastManager.add('Elektron keçid qəbzi formalaşdırıldı!', 'success');
  };

  // Copy receipt code
  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(true);
    toastManager.add('Qəbz nömrəsi buferə kopyalandı!', 'info');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      data-testid="toll-road-modal"
    >
      <div 
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/70 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 text-white shadow-lg shadow-cyan-500/25">
              <Route className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  AAYDA M-1 Ödənişli Avtomobil Yolu & E-Toll
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Gauge className="w-3 h-3" />
                  130 km/s
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Zap className="w-3 h-3" />
                  FastPass -10%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Bakı-Quba-Rusiya Federasiyası Dövlət Sərhədi Sürətli Magistralı (AAYDA Rəsmi Ödəniş Şəbəkəsi)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a 
              href="tel:114" 
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold border border-slate-700 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />
              <span>AAYDA 114</span>
            </a>
            <button
              onClick={onClose}
              data-testid="toll-road-close-btn"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/40 px-4 sm:px-6 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('radar')}
            data-testid="tab-radar"
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-semibold text-xs sm:text-sm whitespace-nowrap transition-colors ${
              activeTab === 'radar'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>Ödəniş Məntəqələri Radarı (7 Qovşaq)</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            data-testid="tab-calculator"
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-semibold text-xs sm:text-sm whitespace-nowrap transition-colors ${
              activeTab === 'calculator'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>Yol Haqqı & Qənaət Kalkulyatoru</span>
          </button>

          <button
            onClick={() => setActiveTab('transponder')}
            data-testid="tab-transponder"
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-semibold text-xs sm:text-sm whitespace-nowrap transition-colors ${
              activeTab === 'transponder'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>E-Toll RFID Transponder (FastPass)</span>
          </button>

          <button
            onClick={() => setActiveTab('voucher')}
            data-testid="tab-voucher"
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-semibold text-xs sm:text-sm whitespace-nowrap transition-colors ${
              activeTab === 'voucher'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Elektron Keçid Talonu {currentReceipt && '•'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: RADAR */}
          {activeTab === 'radar' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Highway summary banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-cyan-950/20 to-slate-950 border border-cyan-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-black text-xs">M-1</span>
                    <span className="font-bold text-white text-sm sm:text-base">Yaşma (km 45) — Samur Dövlət Sərhədi (km 192)</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Ümumi ödənişli magistral məsafəsi: <strong>{TOLL_HIGHWAY_INFO.totalTollLengthKm} km</strong>. İcazə verilən maksimum sürət: <strong>{TOLL_HIGHWAY_INFO.speedLimitKmH} km/s</strong>.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                    <span className="text-slate-400">Minik: </span>
                    <span className="font-bold text-cyan-400">{STATUTORY_TOLL_RATES.passenger_light} AZN/km</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                    <span className="text-slate-400">Yük: </span>
                    <span className="font-bold text-amber-400">{STATUTORY_TOLL_RATES.medium_truck_bus} AZN/km</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                    <span className="text-slate-400">TIR: </span>
                    <span className="font-bold text-rose-400">{STATUTORY_TOLL_RATES.heavy_tir_coach} AZN/km</span>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ödəniş məntəqəsi, qovşaq və ya rayon üzrə axtarış..."
                    data-testid="radar-search-input"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {['all', 'Abşeron', 'Xızı', 'Siyəzən', 'Şabran', 'Quba', 'Qusar'].map((dist) => (
                    <button
                      key={dist}
                      onClick={() => setSelectedDistrict(dist)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-colors ${
                        selectedDistrict === dist
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : 'bg-slate-950/50 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {dist === 'all' ? 'Bütün Rayonlar' : dist}
                    </button>
                  ))}
                </div>
              </div>

              {/* Plazas list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPlazas.map((plaza) => (
                  <div
                    key={plaza.id}
                    className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between gap-3 group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-xs font-black">
                              KM {plaza.kmMarker}
                            </span>
                            <h3 className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors">
                              {plaza.name}
                            </h3>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{plaza.district} • Yaxın şəhər: {plaza.nearestCity}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          plaza.liveStatus === 'optimal' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {plaza.liveStatus === 'optimal' ? 'Sərbəst Keçid' : 'Mülayim Növbə'} ({plaza.avgWaitSeconds}s)
                        </span>
                      </div>

                      {/* Lane info */}
                      <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                        <div>
                          <span className="text-slate-500">Ümumi Zolaqlar: </span>
                          <span className="font-bold text-white">{plaza.lanesCount} zolaq</span>
                        </div>
                        <div>
                          <span className="text-slate-500">RFID FastPass: </span>
                          <span className="font-bold text-cyan-400">{plaza.fastPassLanes} avtomatik</span>
                        </div>
                      </div>

                      {/* Amenities */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {plaza.amenities.map((amenity, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800 text-[10px]"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Maksimal Sürət: 130 km/s</span>
                      <button
                        onClick={() => {
                          setEntryPlazaId(plaza.id);
                          setActiveTab('calculator');
                          toastManager.add(`${plaza.name} başlanğıc məntəqə olaraq seçildi!`, 'info');
                        }}
                        className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <span>Hesabla</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form controls (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Entry and Exit Dropdowns */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-cyan-400" />
                      Giriş və Çıxış Məntəqəsini Seçin
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Giriş Qapısı</label>
                        <select
                          value={entryPlazaId}
                          onChange={(e) => setEntryPlazaId(e.target.value)}
                          data-testid="entry-plaza-select"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
                        >
                          {MOCK_TOLL_PLAZAS.map((p) => (
                            <option key={`entry-${p.id}`} value={p.id}>
                              {p.name} (KM {p.kmMarker})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-1 flex justify-center">
                        <button
                          type="button"
                          onClick={handleSwapPlazas}
                          title="İstiqaməti dəyiş"
                          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-colors"
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Çıxış Qapısı</label>
                        <select
                          value={exitPlazaId}
                          onChange={(e) => setExitPlazaId(e.target.value)}
                          data-testid="exit-plaza-select"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
                        >
                          {MOCK_TOLL_PLAZAS.map((p) => (
                            <option key={`exit-${p.id}`} value={p.id}>
                              {p.name} (KM {p.kmMarker})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle category selector */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <label className="block text-xs font-semibold text-slate-400">Nəqliyyat Vasitəsinin Kateqoriyası</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setVehicleCategory('passenger_light')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          vehicleCategory === 'passenger_light'
                            ? 'bg-cyan-500/10 border-cyan-500/50 text-white shadow-md shadow-cyan-500/10'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Car className="w-4 h-4 text-cyan-400" />
                          <span className="font-bold text-xs">1-ci Kateqoriya</span>
                        </div>
                        <p className="text-[11px] text-slate-400">Minik və &lt;3.5t</p>
                        <span className="text-xs font-bold text-cyan-400 mt-1 block">{STATUTORY_TOLL_RATES.passenger_light} AZN/km</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVehicleCategory('medium_truck_bus')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          vehicleCategory === 'medium_truck_bus'
                            ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-md shadow-amber-500/10'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Truck className="w-4 h-4 text-amber-400" />
                          <span className="font-bold text-xs">2-ci Kateqoriya</span>
                        </div>
                        <p className="text-[11px] text-slate-400">Yük & Avtobus (≤30 yer)</p>
                        <span className="text-xs font-bold text-amber-400 mt-1 block">{STATUTORY_TOLL_RATES.medium_truck_bus} AZN/km</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVehicleCategory('heavy_tir_coach')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          vehicleCategory === 'heavy_tir_coach'
                            ? 'bg-rose-500/10 border-rose-500/50 text-white shadow-md shadow-rose-500/10'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Truck className="w-4 h-4 text-rose-400" />
                          <span className="font-bold text-xs">3-cü Kateqoriya</span>
                        </div>
                        <p className="text-[11px] text-slate-400">Çoxoxlu TIR & Böyük Avtobus</p>
                        <span className="text-xs font-bold text-rose-400 mt-1 block">{STATUTORY_TOLL_RATES.heavy_tir_coach} AZN/km</span>
                      </button>
                    </div>
                  </div>

                  {/* Payment medium selector */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <label className="block text-xs font-semibold text-slate-400">Ödəniş Metodu & Endirimlər</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('transponder_rfid')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          paymentMethod === 'transponder_rfid'
                            ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Radio className="w-4 h-4 text-emerald-400" />
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">10% Endirim</span>
                        </div>
                        <span className="font-bold text-xs block text-white">RFID FastPass</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">Avtomatlaşdırılmış 50 km/s</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('qr_epass')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          paymentMethod === 'qr_epass'
                            ? 'bg-cyan-500/10 border-cyan-500/50 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <QrCode className="w-4 h-4 text-cyan-400" />
                          <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">5% Endirim</span>
                        </div>
                        <span className="font-bold text-xs block text-white">Mobil QR E-Pass</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">AsanPay / Mobil Tətbiq</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash_card')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          paymentMethod === 'cash_card'
                            ? 'bg-slate-800 border-slate-600 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <CreditCard className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-500 text-[10px]">Standart</span>
                        </div>
                        <span className="font-bold text-xs block text-white">Nağd / Bank Kartı</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">Ödəniş köşkündə operator</p>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Calculation results card (5 cols) */}
                <div className="lg:col-span-5 flex flex-col justify-between p-5 rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/30 shadow-xl space-y-6">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Marşrut Hesabatı</span>
                      <span className="text-xs text-slate-400">Maks. 130 km/s</span>
                    </div>

                    {/* Big Fare Display */}
                    <div className="mt-4 text-center py-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20">
                      <span className="text-xs font-semibold text-slate-400">Yol Haqqı (Netto Tarif)</span>
                      <div className="text-3xl sm:text-4xl font-black text-cyan-400 mt-1">
                        {formatPrice(routeCalculation.netFareTargetCurrency, currency)}
                      </div>
                      {routeCalculation.discountPercentage > 0 && (
                        <div className="text-xs text-emerald-400 font-medium mt-1">
                          {routeCalculation.discountPercentage}% Endirim tətbiq edildi (-{routeCalculation.discountAmountAzn.toFixed(2)} AZN)
                        </div>
                      )}
                    </div>

                    {/* Breakdown metrics */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                        <span className="text-slate-500 text-[11px] block">Məsafə</span>
                        <span className="text-sm font-bold text-white">{routeCalculation.distanceKm} km</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                        <span className="text-slate-500 text-[11px] block">Magistral Vaxtı</span>
                        <span className="text-sm font-bold text-cyan-300">~{routeCalculation.estimatedDurationMinutes} dəqiqə</span>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                        <span className="text-emerald-400 text-[11px] block flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Qənaət Olunan Vaxt
                        </span>
                        <span className="text-sm font-bold text-emerald-300">+{routeCalculation.timeSavedMinutes} dəqiqə</span>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                        <span className="text-emerald-400 text-[11px] block flex items-center gap-1">
                          <Leaf className="w-3 h-3" />
                          Yanacaq Qənaəti
                        </span>
                        <span className="text-sm font-bold text-emerald-300">~{routeCalculation.fuelSavedLiters} L</span>
                      </div>
                    </div>

                    <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Köhnə R-1 yolu ilə müddət:</span>
                        <span className="text-slate-300 font-semibold">{routeCalculation.oldRouteDurationMinutes} dəqiqə</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CO₂ emissiya azalması:</span>
                        <span className="text-emerald-400 font-semibold">-{routeCalculation.co2SavedKg} kq CO₂</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={handleGenerateReceipt}
                      data-testid="generate-toll-receipt-btn"
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-cyan-600/25 flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Elektron Keçid Talonu Formallaşdır</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('transponder')}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Radio className="w-4 h-4 text-emerald-400" />
                      <span>E-Toll FastPass Turniket Keçidini Sınaqdan Keçir</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRANSPONDER */}
          {activeTab === 'transponder' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Virtual RFID Card */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-cyan-950/40 to-slate-900 border border-cyan-500/40 shadow-2xl relative overflow-hidden space-y-6">
                  {/* Hologram decoration */}
                  <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                        <Radio className="w-4 h-4" />
                      </div>
                      <span className="font-black text-white text-sm tracking-wider">AAYDA E-TOLL FASTPASS</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      transponder.status === 'active' 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}>
                      {transponder.status === 'active' ? 'Aktiv' : 'Aşağı Balans'}
                    </span>
                  </div>

                  {/* Microchip icon and details */}
                  <div className="space-y-3">
                    <div className="w-10 h-8 rounded-md bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 text-[10px] font-mono">
                      RFID
                    </div>
                    <div className="font-mono text-cyan-300 text-lg tracking-widest">
                      {transponder.transponderId}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                      <div>
                        <span className="block text-[10px] text-slate-500">Avtomobil Dövlət Nömrəsi</span>
                        <span className="font-bold text-white font-mono text-sm">{transponder.linkedPlateNumber}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500">Sahibi</span>
                        <span className="font-bold text-white">{transponder.ownerName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Balance Display */}
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Cari Balans</span>
                      <div className="text-2xl font-black text-emerald-400">
                        {transponder.balanceAzn.toFixed(2)} AZN
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">{transponder.serialNumber}</span>
                  </div>
                </div>

                {/* Top Up & Simulator Controls */}
                <div className="space-y-4">
                  {/* Top-up options */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      Balansı Dərhal Artır (AsanPay / Bank Kartı)
                    </h3>
                    <p className="text-xs text-slate-400">
                      M1 magistralında 50 km/s maneəsiz keçid üçün tövsiyə olunan minimum balans 15 AZN-dir.
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {[10, 20, 50, 100].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => handleTopUp(amt)}
                          data-testid={`top-up-${amt}-btn`}
                          className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 font-bold text-xs transition-all text-center"
                        >
                          +{amt} AZN
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Gate passage simulator */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white text-sm flex items-center gap-2">
                        <Zap className="w-4 h-4 text-cyan-400" />
                        50 km/s FastPass Turniket Keçid Simulyasiyası
                      </h3>
                      {passageStatus.simulated && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          passageStatus.gateOpen 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {passageStatus.gateOpen ? 'Turniket Açıqdır (Yaşıl)' : 'Turniket Bağlıdır (Qırmızı)'}
                        </span>
                      )}
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Seçilmiş marşrut:</span>
                        <span className="font-semibold text-white">{entryPlaza.name} → {exitPlaza.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Çıxılacaq məbləğ (10% RFID endirimi ilə):</span>
                        <span className="font-bold text-cyan-400">{routeCalculation.netFareAzn.toFixed(2)} AZN</span>
                      </div>
                    </div>

                    {passageStatus.message && (
                      <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                        passageStatus.success 
                          ? 'bg-emerald-950/30 text-emerald-300 border border-emerald-800/40' 
                          : 'bg-rose-950/30 text-rose-300 border border-rose-800/40'
                      }`}>
                        {passageStatus.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                        <span>{passageStatus.message}</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleSimulatePassage}
                      data-testid="simulate-gate-passage-btn"
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Turniketdən Keçidi Simulyasiya Et</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VOUCHER / RECEIPT */}
          {activeTab === 'voucher' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {currentReceipt ? (
                <div className="max-w-md mx-auto p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl space-y-5 text-slate-200">
                  {/* Receipt header */}
                  <div className="text-center border-b border-slate-800 pb-4">
                    <span className="text-xs uppercase font-bold text-cyan-400 tracking-wider">
                      Azərbaycan Avtomobil Yolları Dövlət Agentliyi
                    </span>
                    <h3 className="text-base font-black text-white mt-1">
                      M-1 ÖDƏNİŞLİ AVTOMAGİSTRAL TALONU
                    </h3>
                    <p className="text-[11px] text-slate-400">{currentReceipt.operatorName}</p>
                    <div className="mt-2 text-xs font-mono font-bold text-slate-300">
                      {currentReceipt.receiptNumber}
                    </div>
                  </div>

                  {/* Route & Vehicle details */}
                  <div className="space-y-2 text-xs border-b border-slate-800 pb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Giriş Məntəqəsi:</span>
                      <span className="font-semibold text-white">{currentReceipt.entryPlazaName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Çıxış Məntəqəsi:</span>
                      <span className="font-semibold text-white">{currentReceipt.exitPlazaName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Məsafə:</span>
                      <span className="font-bold text-white">{currentReceipt.distanceKm} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Dövlət Qeydiyyat Nişanı:</span>
                      <span className="font-mono font-bold text-cyan-300">{currentReceipt.vehiclePlate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Kateqoriya:</span>
                      <span className="text-white">{currentReceipt.vehicleCategory === 'passenger_light' ? '1-ci (Minik)' : 'Yük/TIR'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ödəniş Üsulu:</span>
                      <span className="text-emerald-400 font-semibold">
                        {currentReceipt.paymentMethod === 'transponder_rfid' ? 'RFID FastPass' : 'QR / Kart'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Giriş / Çıxış Vaxtı:</span>
                      <span className="text-slate-300">{currentReceipt.entryTimestamp} — {currentReceipt.exitTimestamp}</span>
                    </div>
                  </div>

                  {/* Payment totals */}
                  <div className="space-y-1.5 text-xs border-b border-slate-800 pb-4">
                    <div className="flex justify-between text-slate-400">
                      <span>Baza Tarifi:</span>
                      <span>{currentReceipt.grossFareAzn.toFixed(2)} AZN</span>
                    </div>
                    {currentReceipt.discountAzn > 0 && (
                      <div className="flex justify-between text-emerald-400 font-medium">
                        <span>RFID FastPass Endirimi:</span>
                        <span>-{currentReceipt.discountAzn.toFixed(2)} AZN</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-black text-white pt-1">
                      <span>ÖDƏNİLMİŞ MƏBLƏĞ:</span>
                      <span className="text-cyan-400">
                        {formatPrice(currentReceipt.netFareTargetCurrency, currentReceipt.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Barcode & Security */}
                  <div className="text-center space-y-2 pt-1">
                    <div className="font-mono text-xs tracking-widest text-slate-400 select-all">
                      {currentReceipt.barcode}
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono truncate">
                      {currentReceipt.securityHash}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Talon fiskal qüvvəyə malikdir. Sürət həddi 130 km/s. Qaynar xətt: 114
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleCopyCode(currentReceipt.receiptNumber)}
                      data-testid="copy-toll-receipt-btn"
                      className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-white font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Kopyalandı' : 'Kodu Kopyala'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs text-white font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Çap Et</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-white">Aktiv Keçid Talonu Yoxdur</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Kalkulyatordan marşrut seçərək və ya RFID FastPass turniketindən keçid edərək elektron fiskal qəbz yarada bilərsiniz.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('calculator')}
                    className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-500 transition-colors"
                  >
                    Kalkulyatora Keç
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

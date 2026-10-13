import React, { useState, useMemo, useEffect } from 'react';
import { Vehicle, Currency, Language } from '../types/vehicle';
import {
  RoadsideServiceType,
  AssistanceOrder,
  DispatchStatus,
} from '../types/roadside';
import {
  ROADSIDE_SERVICES,
  AZERBAIJAN_DISTRICTS,
  FLEET_DEPOTS,
  MOCK_TOW_FLEET,
  SAMPLE_ACTIVE_DISPATCHES,
} from '../data/mockRoadsideData';
import {
  calculateRoadsideAssistanceCost,
  findNearestDepot,
  findAvailableTruck,
  calculateEstimatedArrivalMinutes,
  createAssistanceOrder,
  isCurrentTimeNight,
  formatRoadsideAmount,
} from '../utils/roadsideAssistance';
import { useScrollLock } from '../hooks/useScrollLock';
import { useKeyPress } from '../hooks/useKeyPress';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import {
  Truck,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Disc,
  Fuel,
  Key,
  Compass,
  Phone,
  MessageCircle,
  CheckCircle2,
  Clock,
  MapPin,
  AlertTriangle,
  Copy,
  Check,
  Printer,
  X,
  FileText,
  Navigation,
  Activity,
  ArrowRight,
  Radio,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface RoadsideAssistanceModalProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  currency: Currency;
  lang: Language;
  onClose: () => void;
}

export const RoadsideAssistanceModal: React.FC<RoadsideAssistanceModalProps> = ({
  isOpen,
  vehicle,
  currency,
  lang,
  onClose,
}) => {
  useScrollLock(isOpen);
  useKeyPress('Escape', onClose);

  const [activeTab, setActiveTab] = useState<'request' | 'tracking' | 'tariffs' | 'voucher'>('request');
  const [selectedService, setSelectedService] = useState<RoadsideServiceType>('tow_flatbed');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('loc_nasimi');
  const [locationDetails, setLocationDetails] = useState<string>('Tbilisi prospekti, 20 Yanvar dairəsi yaxınlığı');
  const [contactName, setContactName] = useState<string>('Rauf Məmmədov');
  const [contactPhone, setContactPhone] = useState<string>('+994 (50) 888-77-66');
  const [customPlate, setCustomPlate] = useState<string>(vehicle?.plateNumber || '90-AB-123');
  const [isNightSurgeActive, setIsNightSurgeActive] = useState<boolean>(isCurrentTimeNight());
  const [orderNotes, setOrderNotes] = useState<string>('');

  // Active dispatch order state
  const [activeOrder, setActiveOrder] = useState<AssistanceOrder | null>(SAMPLE_ACTIVE_DISPATCHES[0]);
  const [simulationStep, setSimulationStep] = useState<number>(1); // 0: assigned, 1: en_route, 2: arriving, 3: on_site, 4: completed
  const [copiedText, copyToClipboard] = useCopyToClipboard();
  const [showOrderSuccessToast, setShowOrderSuccessToast] = useState<boolean>(false);

  // Sync plate if vehicle changes
  useEffect(() => {
    if (vehicle?.plateNumber) {
      setCustomPlate(vehicle.plateNumber);
    }
  }, [vehicle]);

  // Real-time calculated cost breakdown
  const costBreakdown = useMemo(() => {
    return calculateRoadsideAssistanceCost({
      serviceType: selectedService,
      districtId: selectedDistrictId,
      bodyType: vehicle?.bodyType || 'sedan',
      isNightTime: isNightSurgeActive,
      currency,
    });
  }, [selectedService, selectedDistrictId, vehicle?.bodyType, isNightSurgeActive, currency]);

  const selectedServiceInfo = useMemo(() => {
    return ROADSIDE_SERVICES.find((s) => s.id === selectedService) || ROADSIDE_SERVICES[0];
  }, [selectedService]);

  const selectedDistrictInfo = useMemo(() => {
    return AZERBAIJAN_DISTRICTS.find((d) => d.id === selectedDistrictId) || AZERBAIJAN_DISTRICTS[0];
  }, [selectedDistrictId]);

  const nearestDepot = useMemo(() => {
    return findNearestDepot(selectedDistrictId);
  }, [selectedDistrictId]);

  const estimatedEta = useMemo(() => {
    return calculateEstimatedArrivalMinutes(selectedDistrictInfo.distanceFromNearestDepotKm, isNightSurgeActive);
  }, [selectedDistrictInfo, isNightSurgeActive]);

  if (!isOpen) return null;

  const handlePlaceOrder = () => {
    const newOrder = createAssistanceOrder({
      vehiclePlate: customPlate,
      vehicleTitle: vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.year})` : 'Standart Nəqliyyat Vasitəsi',
      serviceType: selectedService,
      districtId: selectedDistrictId,
      locationDetails,
      contactName,
      contactPhone,
      bodyType: vehicle?.bodyType || 'sedan',
      isNightTime: isNightSurgeActive,
      currency,
      notes: orderNotes,
    });

    setActiveOrder(newOrder);
    setSimulationStep(0);
    setActiveTab('tracking');
    setShowOrderSuccessToast(true);
    setTimeout(() => setShowOrderSuccessToast(false), 4000);
  };

  const handleAdvanceSimulation = () => {
    if (!activeOrder) return;
    const nextStep = Math.min(4, simulationStep + 1);
    setSimulationStep(nextStep);
    const statuses: DispatchStatus[] = ['assigned', 'en_route', 'arriving', 'on_site', 'completed'];
    setActiveOrder({
      ...activeOrder,
      status: statuses[nextStep],
    });
  };

  const handleCancelOrder = () => {
    if (!activeOrder) return;
    setActiveOrder({
      ...activeOrder,
      status: 'cancelled',
    });
  };

  const getServiceIcon = (id: RoadsideServiceType) => {
    switch (id) {
      case 'tow_flatbed':
        return <Truck className="w-5 h-5 text-blue-400" />;
      case 'tow_heavy_winch':
        return <ShieldAlert className="w-5 h-5 text-amber-400" />;
      case 'battery_jumpstart':
        return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'tire_puncture':
        return <Disc className="w-5 h-5 text-emerald-400" />;
      case 'emergency_fuel':
        return <Fuel className="w-5 h-5 text-rose-400" />;
      case 'car_lockout':
        return <Key className="w-5 h-5 text-cyan-400" />;
      case 'snow_mud_extraction':
        return <Compass className="w-5 h-5 text-purple-400" />;
      default:
        return <Truck className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
      data-testid="roadside-assistance-modal"
    >
      <div
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 p-0.5 shadow-lg shadow-orange-500/25 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Truck className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  156 Evakuasiya & Təcili Yol Köməyi
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
                  24/7 SOS Operativ
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Bakı, Abşeron və respublika yolları üzrə operativ mobil dispetçer və texniki yardım
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="tel:156"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all shadow-sm"
              title="Birbaşa 156 Qaynar Xətti"
            >
              <Phone className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>Qaynar Xətt: *156</span>
            </a>

            <button
              onClick={onClose}
              data-testid="roadside-modal-close-btn"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Bağla"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Vehicle Context & Hotline Strip */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-slate-500">Seçilmiş Avtomobil:</span>
            <span className="font-semibold text-white">
              {vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.year})` : 'Standart Nəqliyyat'}
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-300 font-mono font-bold border border-blue-500/30">
              {customPlate}
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              {MOCK_TOW_FLEET.filter((t) => t.status === 'available').length} Evakuator Sərbəstdir
            </span>
            <span className="hidden md:inline text-slate-600">•</span>
            <span className="hidden md:inline text-slate-400">
              Mərkəzi Dispetçer: <span className="text-slate-200">+994 (12) 156-00-00</span>
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 sm:px-6">
          <button
            onClick={() => setActiveTab('request')}
            data-testid="tab-request-btn"
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'request'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Təcili Kömək Sifarişi</span>
          </button>

          <button
            onClick={() => setActiveTab('tracking')}
            data-testid="tab-tracking-btn"
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-all relative ${
              activeTab === 'tracking'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>Canlı İzləmə & Telemetriya</span>
            {activeOrder && activeOrder.status !== 'completed' && activeOrder.status !== 'cancelled' && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tariffs')}
            data-testid="tab-tariffs-btn"
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'tariffs'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Rəsmi 156 Tarifləri</span>
          </button>

          <button
            onClick={() => setActiveTab('voucher')}
            data-testid="tab-voucher-btn"
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'voucher'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Elektron Qəbz & Vəçer</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Success Toast */}
          {showOrderSuccessToast && (
            <div
              className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2"
              data-testid="order-success-banner"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  Sifarişiniz operativ qəbul edildi! Yaxınlıqdakı evakuator ünvanınıza təyin olundu.
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-200">
                ETA: ~{activeOrder?.estimatedArrivalMinutes} dəq
              </span>
            </div>
          )}

          {/* TAB 1: EMERGENCY REQUEST */}
          {activeTab === 'request' && (
            <div className="space-y-6" data-testid="roadside-request-tab">
              {/* Service Selection Catalog */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  1. Tələb Olunan Xidmət Növünü Seçin
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ROADSIDE_SERVICES.map((srv) => {
                    const isSelected = selectedService === srv.id;
                    return (
                      <div
                        key={srv.id}
                        onClick={() => setSelectedService(srv.id)}
                        data-testid={`service-card-${srv.id}`}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                              {getServiceIcon(srv.id)}
                            </div>
                            <span className="text-sm font-black text-amber-400">
                              {formatRoadsideAmount(srv.baseCostAzn, currency)}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white mb-1">{srv.nameAz}</h4>
                          <p className="text-xs text-slate-400 leading-relaxed mb-3">
                            {srv.descriptionAz}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            ~{srv.estimatedDurationMin} dəq icra
                          </span>
                          {srv.popular && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold text-[10px]">
                              Populyar
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Location & Contact Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Location Settings */}
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    2. Hadisə Yeri və Ünvan Təyini
                  </h4>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Ərazi / Rayon Seçimi:
                    </label>
                    <select
                      value={selectedDistrictId}
                      onChange={(e) => setSelectedDistrictId(e.target.value)}
                      data-testid="district-select"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      {AZERBAIJAN_DISTRICTS.map((dist) => (
                        <option key={dist.id} value={dist.id}>
                          {dist.nameAz} ({dist.distanceFromNearestDepotKm} km depo məsafəsi)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Dəqiq Ünvan və ya Nişangah (Landmark):
                    </label>
                    <input
                      type="text"
                      value={locationDetails}
                      onChange={(e) => setLocationDetails(e.target.value)}
                      data-testid="location-details-input"
                      placeholder="Məsələn: Heydər Əliyev pr. 102, Shafa stadionu yaxınlığı"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Navigation className="w-4 h-4 text-blue-400" />
                      <span>Ən Yaxın Baza:</span>
                      <span className="font-semibold text-white">{nearestDepot.nameAz}</span>
                    </div>
                    <span className="text-amber-400 font-bold">
                      {selectedDistrictInfo.distanceFromNearestDepotKm} km
                    </span>
                  </div>
                </div>

                {/* Vehicle & Contact Settings */}
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-amber-400" />
                    3. Əlaqə və Nəqliyyat Vasitəsi
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Dövlət Qeydiyyat Nişanı:
                      </label>
                      <input
                        type="text"
                        value={customPlate}
                        onChange={(e) => setCustomPlate(e.target.value)}
                        data-testid="vehicle-plate-input"
                        placeholder="90-XX-000"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono font-bold text-white uppercase focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Əlaqədar Şəxs:
                      </label>
                      <input
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        data-testid="contact-name-input"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Əlaqə Telefonu (Mobil):
                    </label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      data-testid="contact-phone-input"
                      placeholder="+994 (50) 000-00-00"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Night Tariff Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div>
                      <span className="text-xs font-semibold text-white block">
                        Gecə Saatı Tarifi (22:00 - 07:00)
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Gecə növbəsində +30% təcili çağırış əmsalı tətbiq olunur
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isNightSurgeActive}
                        onChange={(e) => setIsNightSurgeActive(e.target.checked)}
                        data-testid="night-surge-toggle"
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Notes Input */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Dispetçer və Texnik üçün Əlavə Qeydlər (İstəyə görə):
                </label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Məsələn: Təkərlər bloklanıb, yeraltı parkinqdə yerləşir, bucurqad tələb olunur"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Cost Calculation Summary Strip */}
              <div
                className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-5"
                data-testid="cost-summary-box"
              >
                <div className="space-y-1.5 w-full md:w-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold text-amber-400">
                      Yekun Hesablanmış Məbləğ:
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-white">
                      {formatRoadsideAmount(costBreakdown.totalCostAzn, currency)}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      (ƏDV 18%: {costBreakdown.vatAmountAzn} ₼ daxildir)
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                    <span>Baza: {costBreakdown.baseFeeAzn} ₼</span>
                    {costBreakdown.distanceFeeAzn > 0 && (
                      <span>• Məsafə ({costBreakdown.distanceKm} km): +{costBreakdown.distanceFeeAzn} ₼</span>
                    )}
                    {costBreakdown.bodyMultiplierFeeAzn > 0 && (
                      <span>• Çəki/Sinif: +{costBreakdown.bodyMultiplierFeeAzn} ₼</span>
                    )}
                    {costBreakdown.nightSurgeFeeAzn > 0 && (
                      <span className="text-amber-400">• Gecə əlavəsi: +{costBreakdown.nightSurgeFeeAzn} ₼</span>
                    )}
                    <span className="text-emerald-400">• Təxmini çatma: ~{estimatedEta} dəq</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  data-testid="submit-assistance-order-btn"
                  className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  <span>156 Təcili Evakuator Sifarişi Göndər</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE TRACKING & RADAR */}
          {activeTab === 'tracking' && (
            <div className="space-y-6" data-testid="roadside-tracking-tab">
              {activeOrder ? (
                <>
                  {/* Status Pipeline Tracker */}
                  <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                          Sifariş Kodu: {activeOrder.referenceNumber}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                          <span>{activeOrder.serviceType === 'tow_flatbed' ? 'Platforma Evakuator Çağırışı' : 'Təcili Texniki Yardım'}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                            activeOrder.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : activeOrder.status === 'cancelled'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {activeOrder.status === 'assigned' && 'Dispetçer Təyin Etdi'}
                            {activeOrder.status === 'en_route' && 'Evakuator Yola Çıxdı'}
                            {activeOrder.status === 'arriving' && 'Ünvana Çatmaq Üzrədir'}
                            {activeOrder.status === 'on_site' && 'Yerində Xidmət Göstərilir'}
                            {activeOrder.status === 'completed' && 'Tamamlandı'}
                            {activeOrder.status === 'cancelled' && 'Ləğv Edildi'}
                          </span>
                        </h3>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-500 block">Təxmini Çatma</span>
                        <span className="text-xl sm:text-2xl font-black text-amber-400 flex items-center gap-1 justify-end">
                          <Clock className="w-4 h-4" />
                          {activeOrder.status === 'completed' ? '0 dəq' : `~${activeOrder.estimatedArrivalMinutes} dəq`}
                        </span>
                      </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
                      {[
                        { title: 'Təyin Olundu', step: 0, statusKey: 'assigned' },
                        { title: 'Yola Çıxdı', step: 1, statusKey: 'en_route' },
                        { title: 'Yaxınlaşır', step: 2, statusKey: 'arriving' },
                        { title: 'Yerindədir', step: 3, statusKey: 'on_site' },
                        { title: 'Tamamlandı', step: 4, statusKey: 'completed' },
                      ].map((s) => {
                        const isDone = simulationStep >= s.step;
                        const isCurrent = simulationStep === s.step;
                        return (
                          <div
                            key={s.step}
                            className={`p-2.5 rounded-xl border text-center transition-all ${
                              isCurrent
                                ? 'bg-amber-500/15 border-amber-500/60 text-amber-300 font-bold'
                                : isDone
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-medium'
                                : 'bg-slate-900 border-slate-800 text-slate-500'
                            }`}
                          >
                            <span className="text-xs block">{s.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Assigned Truck & Driver Card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <Truck className="w-4 h-4 text-blue-400" />
                        Təyin Edilmiş Evakuator və Sürücü
                      </h4>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-base font-bold text-white">
                            {activeOrder.assignedTruck.driverName}
                          </h4>
                          <p className="text-xs text-slate-400">
                            {activeOrder.assignedTruck.truckModel}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-amber-400 font-bold">
                              ★ {activeOrder.assignedTruck.driverRating}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              ({activeOrder.assignedTruck.completedDispatches} tamamlanmış reys)
                            </span>
                          </div>
                        </div>

                        <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-blue-500/40 text-center">
                          <span className="text-[10px] text-slate-400 block uppercase">Nömrə</span>
                          <span className="text-sm font-mono font-black text-blue-400">
                            {activeOrder.assignedTruck.plateNumber}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <a
                          href={`tel:${activeOrder.assignedTruck.driverPhone}`}
                          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Zəng Et</span>
                        </a>
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(
                            `Salam, ${activeOrder.referenceNumber} nömrəli evakuator çağırışı barədə yazıram.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>

                    {/* Dispatch Telemetry & Location Details */}
                    <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-emerald-400" />
                        Marşrut Telemetriyası & Ünvan
                      </h4>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-400 block">Təyinat Nöqtəsi:</span>
                            <span className="text-white font-medium">
                              {activeOrder.districtName} - {activeOrder.locationDetails}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Truck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-400 block">Çıxış Bazası:</span>
                            <span className="text-white font-medium">
                              {nearestDepot.nameAz} ({nearestDepot.addressAz})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-400 block">Təhlükəsizlik Kodu:</span>
                            <span className="font-mono font-bold text-amber-300">
                              {activeOrder.verificationCode}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Simulation Controls */}
                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                        <button
                          onClick={handleAdvanceSimulation}
                          data-testid="advance-simulation-btn"
                          disabled={activeOrder.status === 'completed' || activeOrder.status === 'cancelled'}
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-semibold transition-all flex items-center gap-1.5"
                        >
                          <Activity className="w-3.5 h-3.5 text-amber-400" />
                          <span>Simulyasiyada İrəli Çək</span>
                        </button>

                        <button
                          onClick={handleCancelOrder}
                          data-testid="cancel-order-btn"
                          disabled={activeOrder.status === 'completed' || activeOrder.status === 'cancelled'}
                          className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                        >
                          Çağırışı ləğv et
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center bg-slate-950/60 border border-slate-800 rounded-2xl">
                  <Truck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-white mb-1">Aktiv Çağırış Yoxdur</h4>
                  <p className="text-xs text-slate-400 mb-4">
                    Təcili kömək sifarişi bölməsindən yeni evakuator sifarişi edə bilərsiniz.
                  </p>
                  <button
                    onClick={() => setActiveTab('request')}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                  >
                    Yeni Sifariş Yarat
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: OFFICIAL TARIFFS & STANDARDS */}
          {activeTab === 'tariffs' && (
            <div className="space-y-6" data-testid="roadside-tariffs-tab">
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <h3 className="text-base font-bold text-white mb-2">
                  156 Evakuasiya Rəsmi Tarif Cədvəli və Xidmət Qaydaları
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Bütün tariflər şəffafdır, dövlət standartlarına uyğundur və nağdsız / qəbzlə həyata keçirilir.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                        <th className="py-2.5 px-3">Xidmət Növü</th>
                        <th className="py-2.5 px-3">Baza Qiymət</th>
                        <th className="py-2.5 px-3">Məsafə Tarifi (8+ km)</th>
                        <th className="py-2.5 px-3">Daxil Olan Avadanlıq</th>
                        <th className="py-2.5 px-3">Gecə Əmsalı</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {ROADSIDE_SERVICES.map((srv) => (
                        <tr key={`tariff-${srv.id}`} className="hover:bg-slate-900/40">
                          <td className="py-3 px-3 font-medium text-white flex items-center gap-2">
                            {getServiceIcon(srv.id)}
                            <span>{srv.nameAz}</span>
                          </td>
                          <td className="py-3 px-3 font-bold text-amber-400 font-mono">
                            {formatRoadsideAmount(srv.baseCostAzn, currency)}
                          </td>
                          <td className="py-3 px-3 text-slate-400">
                            {srv.id.startsWith('tow') ? '1.50 ₼ / km' : '1.00 ₼ / km'}
                          </td>
                          <td className="py-3 px-3 text-slate-400">
                            {srv.equipmentProvidedAz.slice(0, 2).join(', ')}
                          </td>
                          <td className="py-3 px-3 text-amber-400 font-semibold">+30%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Legal Standards Box */}
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-blue-300">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Dövlət Yol Hərəkəti Təhlükəsizliyi Qaydaları</span>
                </div>
                <p className="leading-relaxed">
                  Evakuasiya prosesi Azərbaycan Respublikasının Yol Hərəkəti Haqqında Qanununun 37-ci maddəsinə və BDYP təlimatlarına uyğun olaraq həyata keçirilir. Hər bir avtomobil daşınma zamanı 100,000 AZN-dək məsuliyyət sığortası ilə təmin olunur.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: ELECTRONIC VOUCHER & INVOICE */}
          {activeTab === 'voucher' && (
            <div className="space-y-6" data-testid="roadside-voucher-tab">
              {activeOrder ? (
                <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-950 border border-amber-500/40 shadow-2xl space-y-6 text-white relative overflow-hidden">
                  {/* Decorative background watermark */}
                  <div className="absolute top-2 right-2 text-[120px] font-black text-slate-900/60 pointer-events-none select-none font-mono">
                    156
                  </div>

                  {/* Header of Receipt */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4 relative z-10">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400 block">
                        Rəsmi Elektron Qəbz və Vəçer
                      </span>
                      <h3 className="text-xl font-black text-white">AutoNext 156 SOS Xidməti</h3>
                      <p className="text-xs text-slate-400">
                        Qəbz Nömrəsi: <span className="font-mono text-slate-200">{activeOrder.referenceNumber}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                        Ödənilib / Təsdiqlənib
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-1">
                        {activeOrder.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* Itemized Info Table */}
                  <div className="space-y-3 text-xs relative z-10">
                    <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                      <span className="text-slate-400">Nəqliyyat Vasitəsi:</span>
                      <span className="font-semibold text-white">{activeOrder.vehicleTitle}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                      <span className="text-slate-400">Dövlət Qeydiyyat Nişanı:</span>
                      <span className="font-mono font-bold text-blue-400">{activeOrder.vehiclePlate}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                      <span className="text-slate-400">Göstərilən Xidmət:</span>
                      <span className="font-medium text-white">{selectedServiceInfo.nameAz}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                      <span className="text-slate-400">Ərazi / Təyinat:</span>
                      <span className="font-medium text-white">{activeOrder.districtName}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                      <span className="text-slate-400">İcraçı Sürücü / Evakuator:</span>
                      <span className="font-medium text-white">
                        {activeOrder.assignedTruck.driverName} ({activeOrder.assignedTruck.plateNumber})
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                      <span className="text-slate-400">Təhlükəsizlik Kodu:</span>
                      <span className="font-mono text-amber-300 font-bold">{activeOrder.verificationCode}</span>
                    </div>
                  </div>

                  {/* Pricing Total */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 relative z-10">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Baza Xidmət Haqqı:</span>
                      <span>{activeOrder.costBreakdown.baseFeeAzn} ₼</span>
                    </div>
                    {activeOrder.costBreakdown.distanceFeeAzn > 0 && (
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Məsafə Əlavəsi ({activeOrder.costBreakdown.distanceKm} km):</span>
                        <span>+{activeOrder.costBreakdown.distanceFeeAzn} ₼</span>
                      </div>
                    )}
                    {activeOrder.costBreakdown.nightSurgeFeeAzn > 0 && (
                      <div className="flex justify-between text-xs text-amber-400">
                        <span>Gecə Çağırışı Surcharge (+30%):</span>
                        <span>+{activeOrder.costBreakdown.nightSurgeFeeAzn} ₼</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>ƏDV 18% (Daxildir):</span>
                      <span>{activeOrder.costBreakdown.vatAmountAzn} ₼</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-bold text-white">
                      <span>Cəmi Ödəniş:</span>
                      <span className="text-lg text-amber-400">
                        {formatRoadsideAmount(activeOrder.costBreakdown.totalCostAzn, currency)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between gap-3 pt-2 relative z-10">
                    <button
                      onClick={() => {
                        copyToClipboard(
                          `AutoNext 156 Evakuasiya Qəbzi\nKod: ${activeOrder.referenceNumber}\nNömrə: ${activeOrder.vehiclePlate}\nXidmət: ${selectedServiceInfo.nameAz}\nMəbləğ: ${activeOrder.costBreakdown.totalCostAzn} AZN\nTarix: ${activeOrder.timestamp}`
                        );
                      }}
                      data-testid="copy-voucher-btn"
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all flex items-center gap-2"
                    >
                      {copiedText ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Kopyalandı!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Qəbzi Kopyala</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => window.print()}
                      data-testid="print-voucher-btn"
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Çap Et / Saxla</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400">
                  <p>Aktiv qəbz tapılmadı. Zəhmət olmasa əvvəlcə sifariş yaradın.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

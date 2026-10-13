import React, { useState, useMemo } from 'react';
import { Vehicle, Currency, Language } from '../types/vehicle';
import {
  ServiceRecordCategory,
  ServiceUrgencyStatus,
  WorkshopType,
  ScheduledMaintenanceItem,
} from '../types/servicePassport';
import { MOCK_WORKSHOP_PARTNERS } from '../data/mockServiceRecords';
import {
  calculateMaintenanceSchedule,
  getVehicleServiceRecords,
  calculatePassportSummary,
  compareServiceWorkshopCosts,
  filterServiceRecords,
  generateDigitalPassportReceipt,
} from '../utils/servicePassport';
import { formatPrice } from '../utils/i18n';
import { useScrollLock } from '../hooks/useScrollLock';
import { useKeyPress } from '../hooks/useKeyPress';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import {
  X,
  Wrench,
  BookOpenCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Calendar,
  Building2,
  ShieldCheck,
  Filter,
  Copy,
  Check,
  Printer,
  FileText,
  Gauge,
  Zap,
  RotateCcw,
  Sliders,
  Search,
  Sparkles,
  Phone,
  Star,
  MapPin,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface ServicePassportModalProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  currency: Currency;
  lang: Language;
  onClose: () => void;
}

type TabType = 'schedule' | 'history' | 'comparison' | 'certificate';

export const ServicePassportModal: React.FC<ServicePassportModalProps> = ({
  isOpen,
  vehicle,
  currency,
  lang,
  onClose,
}) => {
  useScrollLock(isOpen && !!vehicle);
  useKeyPress('Escape', onClose);

  const [activeTab, setActiveTab] = useState<TabType>('schedule');
  const [simulatedMileage, setSimulatedMileage] = useState<number>(() => vehicle?.mileageKm || 0);
  const [scheduleCategoryFilter, setScheduleCategoryFilter] = useState<string>('all');
  const [scheduleUrgencyFilter, setScheduleUrgencyFilter] = useState<string>('all');
  const [historySearchQuery, setHistorySearchQuery] = useState<string>('');
  const [historyWorkshopFilter, setHistoryWorkshopFilter] = useState<WorkshopType | 'all'>('all');
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState<ServiceRecordCategory | 'all'>('all');
  const [onlyVerifiedStamps, setOnlyVerifiedStamps] = useState<boolean>(false);
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);

  const [copiedText, copyText] = useCopyToClipboard();

  // Reset simulated mileage when vehicle changes
  React.useEffect(() => {
    if (vehicle) {
      setSimulatedMileage(vehicle.mileageKm);
    }
  }, [vehicle]);

  const schedule = useMemo(() => {
    if (!vehicle) return [];
    return calculateMaintenanceSchedule(vehicle, simulatedMileage);
  }, [vehicle, simulatedMileage]);

  const allRecords = useMemo(() => {
    if (!vehicle) return [];
    return getVehicleServiceRecords(vehicle.vin, vehicle);
  }, [vehicle]);

  const summary = useMemo(() => {
    if (!vehicle) return null;
    return calculatePassportSummary(vehicle, allRecords, schedule);
  }, [vehicle, allRecords, schedule]);

  const filteredSchedule = useMemo(() => {
    return schedule.filter((item) => {
      if (scheduleCategoryFilter !== 'all' && item.category !== scheduleCategoryFilter) {
        return false;
      }
      if (scheduleUrgencyFilter !== 'all' && item.urgency !== scheduleUrgencyFilter) {
        return false;
      }
      return true;
    });
  }, [schedule, scheduleCategoryFilter, scheduleUrgencyFilter]);

  const filteredRecords = useMemo(() => {
    return filterServiceRecords(allRecords, {
      category: historyCategoryFilter,
      workshopType: historyWorkshopFilter,
      onlyVerifiedStamps,
      searchQuery: historySearchQuery,
    });
  }, [allRecords, historyCategoryFilter, historyWorkshopFilter, onlyVerifiedStamps, historySearchQuery]);

  if (!isOpen || !vehicle || !summary) return null;

  const handleCopyCertificate = () => {
    const cert = generateDigitalPassportReceipt(vehicle, summary, schedule);
    copyText(cert);
  };

  const handleResetMileage = () => {
    setSimulatedMileage(vehicle.mileageKm);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-passport-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/70 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400">
              <BookOpenCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="service-passport-title" className="text-lg sm:text-xl font-black text-white">
                  Rəqəmsal Servis Pasportu & Qulluq Planı
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Rəsmi İnteqrasiya
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {vehicle.make} {vehicle.model} ({vehicle.year}) • VIN:{' '}
                <span className="font-mono text-slate-300">{vehicle.vin}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
              <Gauge className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-400">Sağlamlıq:</span>
              <span className="font-bold text-emerald-400">{summary.overallHealthScore}/100</span>
            </div>
            <button
              onClick={onClose}
              data-testid="close-service-passport-modal-btn"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top KPI Summary Strip */}
        <div className="p-4 sm:p-6 bg-slate-950/40 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Sağlamlıq</span>
            <div className="flex items-center gap-1.5 mt-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  summary.overallHealthScore >= 80
                    ? 'bg-emerald-400 animate-pulse'
                    : summary.overallHealthScore >= 60
                    ? 'bg-amber-400'
                    : 'bg-rose-400'
                }`}
              />
              <span className="text-lg font-black text-white">{summary.overallHealthScore}%</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Servis İntizamı</span>
            <div className="text-lg font-black text-emerald-400 mt-1">
              {summary.serviceComplianceRate}%
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Tarixi Xərclər</span>
            <div className="text-lg font-black text-white mt-1">
              {formatPrice(summary.totalHistoricalSpentAzn, currency)}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Təcili Büdcə</span>
            <div className="text-lg font-black text-amber-400 mt-1">
              {formatPrice(summary.upcomingEstimatedSpentAzn, currency)}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Rəsmi Möhürlər</span>
            <div className="text-lg font-black text-blue-400 mt-1">
              {summary.verifiedDealerRecordsCount} / {summary.totalRecordsCount}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Status</span>
            <div className="mt-1">
              {summary.overdueCount > 0 ? (
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {summary.overdueCount} gecikmiş
                </span>
              ) : summary.dueSoonCount > 0 ? (
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> {summary.dueSoonCount} tezliklə
                </span>
              ) : (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saz vəziyyətdə
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 sm:px-6 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('schedule')}
            data-testid="tab-schedule-btn"
            className={`py-3.5 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'schedule'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Planlı Qulluq Planı</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
              {schedule.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            data-testid="tab-history-btn"
            className={`py-3.5 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'history'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpenCheck className="w-4 h-4" />
            <span>Servis Tarixçəsi</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
              {allRecords.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('comparison')}
            data-testid="tab-comparison-btn"
            className={`py-3.5 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'comparison'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Servis & Qiymət Müqayisəsi</span>
          </button>

          <button
            onClick={() => setActiveTab('certificate')}
            data-testid="tab-certificate-btn"
            className={`py-3.5 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'certificate'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Rəsmi Çıxarış & Pasport</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="space-y-6" data-testid="schedule-tab-content">
              {/* Mileage Simulation Bar */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">Yürüş Simulyatoru & Dinamik Qulluq Hesablayıcı</h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Cari yürüş:</span>
                    <strong className="text-white">{vehicle.mileageKm.toLocaleString()} km</strong>
                    {simulatedMileage !== vehicle.mileageKm && (
                      <button
                        onClick={handleResetMileage}
                        data-testid="reset-mileage-btn"
                        className="flex items-center gap-1 text-[11px] text-amber-400 hover:underline ml-2"
                      >
                        <RotateCcw className="w-3 h-3" /> Sıfırla
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <input
                    type="range"
                    min={Math.max(0, vehicle.mileageKm - 10000)}
                    max={vehicle.mileageKm + 50000}
                    step={1000}
                    value={simulatedMileage}
                    onChange={(e) => setSimulatedMileage(Number(e.target.value))}
                    data-testid="mileage-range-input"
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex items-center gap-1 shrink-0 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl font-mono text-sm font-bold text-amber-400">
                    <span>{simulatedMileage.toLocaleString()} km</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto text-[11px] pt-1">
                  <span className="text-slate-500">Tez simulyasiya:</span>
                  {[5000, 10000, 20000, 30000].map((addKm) => (
                    <button
                      key={addKm}
                      onClick={() => setSimulatedMileage(vehicle.mileageKm + addKm)}
                      className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition-colors"
                    >
                      +{addKm.toLocaleString()} km
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
                    <Filter className="w-3.5 h-3.5" /> Kateqoriya:
                  </span>
                  {[
                    { id: 'all', label: 'Bütün' },
                    { id: 'oil_filter', label: 'Yağ & Filtr' },
                    { id: 'brakes', label: 'Tormoz' },
                    { id: 'engine_transmission', label: 'Aqreqat' },
                    { id: 'fluids_coolant', label: 'Mayelər' },
                    { id: 'electrical_battery', label: 'Batareya/EV' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setScheduleCategoryFilter(cat.id)}
                      data-testid={`category-filter-${cat.id}`}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                        scheduleCategoryFilter === cat.id
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 border border-transparent'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">Status:</span>
                  {[
                    { id: 'all', label: 'Bütün' },
                    { id: 'overdue', label: 'Gecikmiş' },
                    { id: 'due_soon', label: 'Tezliklə' },
                    { id: 'upcoming', label: 'Plan üzrə' },
                  ].map((urg) => (
                    <button
                      key={urg.id}
                      onClick={() => setScheduleUrgencyFilter(urg.id)}
                      data-testid={`urgency-filter-${urg.id}`}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-colors ${
                        scheduleUrgencyFilter === urg.id
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 border border-transparent'
                      }`}
                    >
                      {urg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Maintenance Cards List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSchedule.map((item) => {
                  const costComp = compareServiceWorkshopCosts(item, currency);
                  const isOverdue = item.urgency === 'overdue';
                  const isDueSoon = item.urgency === 'due_soon';

                  return (
                    <div
                      key={item.id}
                      data-testid={`maintenance-card-${item.id}`}
                      className={`p-5 rounded-2xl border transition-all ${
                        isOverdue
                          ? 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-950/20'
                          : isDueSoon
                          ? 'bg-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-950/20'
                          : 'bg-slate-900/80 border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{item.titleAz}</h4>
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {item.descriptionAz}
                          </span>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 flex items-center gap-1 ${
                            isOverdue
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : isDueSoon
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {isOverdue ? (
                            <>
                              <AlertCircle className="w-3 h-3" /> Gecikmiş
                            </>
                          ) : isDueSoon ? (
                            <>
                              <AlertTriangle className="w-3 h-3" /> Tezliklə
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Plan üzrə
                            </>
                          )}
                        </span>
                      </div>

                      {/* Mileage progress bar */}
                      <div className="space-y-1.5 my-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">
                            İnterval: <strong>hər {item.intervalKm.toLocaleString()} km</strong>
                          </span>
                          <span
                            className={`font-bold ${
                              isOverdue
                                ? 'text-rose-400'
                                : isDueSoon
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {isOverdue
                              ? `${Math.abs(item.remainingKm).toLocaleString()} km gecikir!`
                              : `${item.remainingKm.toLocaleString()} km qalıb`}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isOverdue
                                ? 'bg-rose-500 w-full'
                                : isDueSoon
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{
                              width: isOverdue
                                ? '100%'
                                : `${Math.min(
                                    100,
                                    Math.max(
                                      10,
                                      ((item.intervalKm - item.remainingKm) / item.intervalKm) * 100
                                    )
                                  )}%`,
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>Sonuncu: {item.lastPerformedKm.toLocaleString()} km</span>
                          <span>Növbəti: {item.nextDueKm.toLocaleString()} km</span>
                        </div>
                      </div>

                      {/* Replaced Parts badges */}
                      <div className="flex flex-wrap gap-1.5 my-3">
                        {item.partsList.map((part, pIdx) => (
                          <span
                            key={pIdx}
                            className="px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] text-slate-300 border border-slate-700/50"
                          >
                            {part}
                          </span>
                        ))}
                      </div>

                      {/* Price Comparison snippet */}
                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Rəsmi Diler</span>
                          <span className="font-semibold text-slate-300">
                            {formatPrice(costComp.dealerCost, currency)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-emerald-400 font-bold block">
                            Sertifikatlı Servis (-{costComp.savingsPercent}%)
                          </span>
                          <span className="font-bold text-white">
                            {formatPrice(costComp.independentCost, currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SERVICE HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-6" data-testid="history-tab-content">
              {/* Search & Workshop Filter Bar */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={historySearchQuery}
                    onChange={(e) => setHistorySearchQuery(e.target.value)}
                    placeholder="Əməliyyat, diler və ya invoys axtar..."
                    data-testid="history-search-input"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <select
                    value={historyWorkshopFilter}
                    onChange={(e) => setHistoryWorkshopFilter(e.target.value as any)}
                    data-testid="history-workshop-select"
                    className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">Bütün Servislər</option>
                    <option value="official_dealer">Yalnız Rəsmi Dilerlər</option>
                    <option value="certified_independent">Sertifikatlı Mərkəzlər</option>
                    <option value="specialized_tuner">İxtisaslaşmış Lab</option>
                  </select>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={onlyVerifiedStamps}
                      onChange={(e) => setOnlyVerifiedStamps(e.target.checked)}
                      data-testid="only-verified-stamps-checkbox"
                      className="rounded accent-amber-500 cursor-pointer"
                    />
                    <span>Yalnız Möhürlü</span>
                  </label>
                </div>
              </div>

              {/* Records Timeline */}
              {filteredRecords.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800 text-slate-400">
                  <FileText className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="text-sm font-semibold">Heç bir servis qeydi tapılmadı</p>
                  <p className="text-xs text-slate-500 mt-1">Axtarış filtrlərini dəyişməyə cəhd edin</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRecords.map((record) => {
                    const isExpanded = expandedRecordId === record.id;

                    return (
                      <div
                        key={record.id}
                        data-testid={`service-record-${record.id}`}
                        className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white">{record.serviceTitleAz}</h4>
                              {record.verifiedStamp && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3" /> Rəsmi Möhür
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-500" /> {record.date}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1 font-mono text-slate-300">
                                <Gauge className="w-3.5 h-3.5 text-emerald-400" />{' '}
                                {record.mileageKm.toLocaleString()} km
                              </span>
                              <span>•</span>
                              <span className="text-amber-400">{record.workshopName}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-white">
                              {formatPrice(record.costAzn, currency)}
                            </span>
                            <button
                              onClick={() => setExpandedRecordId(isExpanded ? null : record.id)}
                              data-testid={`expand-record-btn-${record.id}`}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Operations checklist */}
                        <div className="pt-2">
                          <span className="text-[11px] font-bold text-slate-400 block mb-1">
                            İcra olunmuş əməliyyatlar:
                          </span>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {record.performedOperations.map((op, idx) => (
                              <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{op}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="pt-3 border-t border-slate-800 space-y-2.5 animate-in fade-in duration-150">
                            <div>
                              <span className="text-[11px] font-bold text-slate-400 block mb-1">
                                Dəyişdirilmiş ehtiyat hissələri:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {record.replacedParts.map((part, pIdx) => (
                                  <span
                                    key={pIdx}
                                    className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] text-slate-300 border border-slate-700 font-mono"
                                  >
                                    {part}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {record.technicianNotes && (
                              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300">
                                <span className="font-bold text-amber-400">Usta qeydi: </span>
                                <span>{record.technicianNotes}</span>
                              </div>
                            )}

                            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                              <span>İnvoys / Qaimə: #{record.invoiceNumber}</span>
                              <span className="text-blue-400 font-semibold">Təsdiqlənmiş elektron protokol</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COST & WORKSHOP COMPARISON */}
          {activeTab === 'comparison' && (
            <div className="space-y-6" data-testid="comparison-tab-content">
              {/* Component Wear & Tear Gauges */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">Aqreqat və Resurs Qalığı İndikatorları</h3>
                  </div>
                  <span className="text-xs text-slate-400">Sensor və servis alqoritmi təhlili</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Mühərrik Yağ Resursu</span>
                      <strong className="text-white">{summary.oilLifePercentage}%</strong>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${summary.oilLifePercentage}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 block">
                      Tövsiyə olunan növbəti dəyişmə 8-10 min km aralığında
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Tormoz Bəndləri Qalığı</span>
                      <strong className="text-white">{summary.brakeLifePercentage}%</strong>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${summary.brakeLifePercentage}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 block">
                      Aşınma sensorları təhlükəsiz həddi göstərir
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Batareya / Akkumulyator Səhhəti (SoH)</span>
                      <strong className="text-white">{summary.batteryHealthPercentage}%</strong>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${summary.batteryHealthPercentage}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 block">
                      Zaryadka tutumu və start cərəyanı ideal vəziyyətdə
                    </span>
                  </div>
                </div>
              </div>

              {/* Verified Workshop Partners in Baku */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span>AutoNext Tərəfdaş Servis Şəbəkəsi (Bakı)</span>
                  </h3>
                  <span className="text-xs text-amber-400 font-semibold">Eksklüziv Endirimlərlə</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {MOCK_WORKSHOP_PARTNERS.map((partner) => (
                    <div
                      key={partner.id}
                      className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-white">{partner.name}</h4>
                          <span className="text-[10px] uppercase font-bold text-blue-400 block mt-0.5">
                            {partner.type === 'official_dealer'
                              ? 'Rəsmi Diler Servisi'
                              : partner.type === 'certified_independent'
                              ? 'Sertifikatlı İxtisaslaşmış Mərkəz'
                              : 'EV & Hibrid Laboratoriyası'}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {partner.rating} ({partner.reviewsCount})
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{partner.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="font-mono text-slate-300">{partner.phone}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex flex-wrap gap-1">
                          {partner.officialBrands.map((b, bIdx) => (
                            <span key={bIdx} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                              {b}
                            </span>
                          ))}
                        </div>
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-xs border border-emerald-500/20">
                          -{partner.discountPercentForAutoNext}% AutoNext
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OFFICIAL CERTIFICATE EXTRACT */}
          {activeTab === 'certificate' && (
            <div className="space-y-6" data-testid="certificate-tab-content">
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 border-2 border-amber-500/30 relative overflow-hidden space-y-6 shadow-2xl">
                {/* Watermark Seal */}
                <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
                  <ShieldCheck className="w-72 h-72 text-amber-400" />
                </div>

                {/* Certificate Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
                        AutoNext Verified Digital Passport
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                      RƏQƏMSAL SERVİS PASPORT ÇIXARIŞI
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Protokol №: AN-SRV-{vehicle.vin.slice(-6)}-2026 • Bakı, Azərbaycan
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Ümumi İndeks</span>
                    <span className="text-3xl font-black text-emerald-400">
                      {summary.overallHealthScore}/100
                    </span>
                    <span className="text-[11px] text-slate-400 block">Maksimum Etibarlılıq</span>
                  </div>
                </div>

                {/* Vehicle Data Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Avtomobil</span>
                    <strong className="text-white text-sm">
                      {vehicle.make} {vehicle.model}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">VIN Kod</span>
                    <strong className="font-mono text-amber-400 text-sm">{vehicle.vin}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Buraxılış İli</span>
                    <strong className="text-white text-sm">{vehicle.year}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Qeydə Alınmış Yürüş</span>
                    <strong className="text-white text-sm">{vehicle.mileageKm.toLocaleString()} km</strong>
                  </div>
                </div>

                {/* Summary Metrics */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                  <h4 className="font-bold text-white">Qulluq Vəziyyəti İcmalı:</h4>
                  <ul className="space-y-1 text-slate-300">
                    <li>• Rəsmi servis qeydlərinin sayı: <strong>{summary.totalRecordsCount}</strong> (Rəsmi möhür: {summary.verifiedDealerRecordsCount})</li>
                    <li>• İcra olunmuş tarixi baxış xərcləri: <strong>{summary.totalHistoricalSpentAzn.toLocaleString()} AZN</strong></li>
                    <li>• Servis intizamı uyğunluğu: <strong>{summary.serviceComplianceRate}%</strong></li>
                    <li>• Təcili tələb olunan işlər: <strong>{summary.overdueCount} gecikmiş, {summary.dueSoonCount} yaxınlaşan</strong></li>
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyCertificate}
                      data-testid="copy-certificate-btn"
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
                    >
                      {copiedText ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedText ? 'Kopyalandı!' : 'Çıxarışı Kopyala'}</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      data-testid="print-certificate-btn"
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-2 transition-colors border border-slate-700"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Çap Et (PDF)</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-500">
                    Rəsmi təsdiq: AutoNext Verification Cloud
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

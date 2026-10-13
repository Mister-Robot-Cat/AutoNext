import React, { useState, useMemo } from 'react';
import { Vehicle, Currency, Language } from '../types/vehicle';
import {
  RecallCampaign,
  RecallCategory,
  RecallSeverity,
  RecallStatus,
  AuthorizedServiceCenter,
  RecallAppointmentBooking,
} from '../types/recall';
import { MOCK_AUTHORIZED_SERVICE_CENTERS } from '../data/mockRecallDatabase';
import {
  getVehicleRecallReport,
  getRecallSeverityBadge,
  getRecallStatusBadge,
  filterRecalls,
  bookDealerAppointment,
  generateRecallClearanceCertificate,
} from '../utils/recalls';
import { useScrollLock } from '../hooks/useScrollLock';
import { useKeyPress } from '../hooks/useKeyPress';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Wrench,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Car,
  Copy,
  Check,
  Printer,
  FileText,
  Search,
  Filter,
  Sparkles,
  Building2,
  ChevronRight,
  Award,
  ExternalLink,
} from 'lucide-react';

export interface RecallRegistryModalProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  currency: Currency;
  lang: Language;
  onClose: () => void;
}

type TabType = 'campaigns' | 'booking' | 'history' | 'certificate';

export const RecallRegistryModal: React.FC<RecallRegistryModalProps> = ({
  isOpen,
  vehicle,
  currency: _currency,
  lang,
  onClose,
}) => {
  useScrollLock(isOpen && !!vehicle);
  useKeyPress('Escape', onClose);

  const [activeTab, setActiveTab] = useState<TabType>('campaigns');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<RecallCategory | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<RecallSeverity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<RecallStatus | 'all'>('all');

  // Booking Form State
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [selectedCenterId, setSelectedCenterId] = useState<string>(
    MOCK_AUTHORIZED_SERVICE_CENTERS[0]?.id || ''
  );
  const [bookingDate, setBookingDate] = useState<string>('2026-10-22');
  const [bookingTimeSlot, setBookingTimeSlot] = useState<string>('11:00');
  const [ownerName, setOwnerName] = useState<string>('Rəşad Əliyev');
  const [ownerPhone, setOwnerPhone] = useState<string>('+994 (50) 234-56-78');
  const [loanerCarRequested, setLoanerCarRequested] = useState<boolean>(true);
  const [bookingNotes, setBookingNotes] = useState<string>('');
  const [activeBooking, setActiveBooking] = useState<RecallAppointmentBooking | null>(null);

  const [copiedText, copyText] = useCopyToClipboard();

  // Reset booking state when vehicle changes
  React.useEffect(() => {
    if (vehicle) {
      setActiveBooking(null);
    }
  }, [vehicle]);

  const report = useMemo(() => {
    if (!vehicle) return null;
    return getVehicleRecallReport(vehicle);
  }, [vehicle]);

  // Set default selected campaign when report changes
  React.useEffect(() => {
    if (report && report.campaigns.length > 0) {
      const firstActive = report.campaigns.find(
        (c) => c.status === 'open_action_required' || c.status === 'remedy_scheduled'
      );
      setSelectedCampaignId(firstActive ? firstActive.id : report.campaigns[0].id);
    }
  }, [report]);

  const filteredCampaigns = useMemo(() => {
    if (!report) return [];
    return filterRecalls(
      report.campaigns,
      searchQuery,
      categoryFilter,
      statusFilter,
      severityFilter
    );
  }, [report, searchQuery, categoryFilter, statusFilter, severityFilter]);

  const completedCampaigns = useMemo(() => {
    if (!report) return [];
    return report.campaigns.filter((c) => c.status === 'remedy_completed');
  }, [report]);

  const certificate = useMemo(() => {
    if (!vehicle || !report) return null;
    return generateRecallClearanceCertificate(vehicle, report);
  }, [vehicle, report]);

  if (!isOpen || !vehicle || !report) {
    return null;
  }

  const selectedCenter: AuthorizedServiceCenter | undefined =
    MOCK_AUTHORIZED_SERVICE_CENTERS.find((sc) => sc.id === selectedCenterId) ||
    MOCK_AUTHORIZED_SERVICE_CENTERS[0];

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const campaign = report.campaigns.find((c) => c.id === selectedCampaignId);
    if (!campaign || !selectedCenter) return;

    const booking = bookDealerAppointment({
      campaignId: campaign.campaignId,
      campaignTitle: campaign.titleAz,
      vin: vehicle.vin,
      vehicleTitle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      serviceCenterId: selectedCenter.id,
      serviceCenterName: selectedCenter.name,
      serviceCenterAddress: selectedCenter.address,
      serviceCenterPhone: selectedCenter.phone,
      date: bookingDate,
      timeSlot: bookingTimeSlot,
      ownerName,
      ownerPhone,
      requiresLoanerCar: loanerCarRequested,
      notes: bookingNotes,
    });

    setActiveBooking(booking);
  };

  const handleStartBookingForCampaign = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setActiveTab('booking');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recall-modal-title"
      data-testid="recall-registry-modal"
    >
      <div className="relative w-full max-w-5xl my-6 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white border-b border-rose-900/40">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400"
            aria-label="Bağla"
            data-testid="recall-modal-close-btn"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-10">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                  Rəsmi İstehsalçı Geri Çağırış Reyestri
                </span>
                <span className="font-mono text-xs text-slate-300 bg-white/10 px-2 py-0.5 rounded">
                  VIN: {vehicle.vin}
                </span>
              </div>
              <h2
                id="recall-modal-title"
                className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2"
              >
                {vehicle.year} {vehicle.make} {vehicle.model}
                <span className="text-sm font-normal text-slate-300 hidden sm:inline">
                  • Texniki Təhlükəsizlik Auditi
                </span>
              </h2>
            </div>

            {/* Safety Score Meter */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15">
              <div className="relative flex items-center justify-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg ${
                    report.safetyScore >= 90
                      ? 'bg-emerald-500/20 text-emerald-300 border-2 border-emerald-400'
                      : report.safetyScore >= 70
                        ? 'bg-amber-500/20 text-amber-300 border-2 border-amber-400'
                        : 'bg-rose-500/20 text-rose-300 border-2 border-rose-400'
                  }`}
                >
                  {report.safetyScore}
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-300 font-medium">
                  Təhlükəsizlik İndeksi
                </div>
                <div className="text-xs font-semibold text-white">
                  {report.safetyScore >= 90
                    ? 'Yüksək Təhlükəsizlik'
                    : report.safetyScore >= 70
                      ? 'Diqqət Tələb Edir'
                      : 'Kritik Risk Aşkarlandı'}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-white/10 text-xs">
            <div className="bg-white/5 rounded-lg p-2.5">
              <span className="text-slate-400 block mb-0.5">Açıq Kampaniyalar</span>
              <span
                className={`font-bold text-sm ${
                  report.activeRecallsCount > 0 ? 'text-rose-300' : 'text-emerald-300'
                }`}
              >
                {report.activeRecallsCount} ədəd
              </span>
            </div>
            <div className="bg-white/5 rounded-lg p-2.5">
              <span className="text-slate-400 block mb-0.5">İcra Olunmuş Təmirlər</span>
              <span className="font-bold text-sm text-emerald-300">
                {report.completedRecallsCount} ədəd
              </span>
            </div>
            <div className="bg-white/5 rounded-lg p-2.5">
              <span className="text-slate-400 block mb-0.5">Xidmət Xərci</span>
              <span className="font-bold text-sm text-emerald-300">
                0 ₼ (Pulsuz Diler Təminatı)
              </span>
            </div>
            <div className="bg-white/5 rounded-lg p-2.5">
              <span className="text-slate-400 block mb-0.5">Yoxlanış Mənbəyi</span>
              <span className="font-bold text-sm text-slate-200 truncate block">
                NHTSA / KBA / Rəsmi Diler
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-4 pt-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-sm font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'campaigns'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            data-testid="tab-campaigns"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Aktiv Kampaniyalar</span>
            {report.activeRecallsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[11px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold">
                {report.activeRecallsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('booking')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-sm font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'booking'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            data-testid="tab-booking"
          >
            <Calendar className="w-4 h-4" />
            <span>Dilerdə Pulsuz Təmir Yazıl</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-sm font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            data-testid="tab-history"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Tamamlanmış Tarixçə ({completedCampaigns.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('certificate')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-sm font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'certificate'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            data-testid="tab-certificate"
          >
            <Award className="w-4 h-4" />
            <span>Təhlükəsizlik Arayışı (Sertifikat)</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/50 dark:bg-slate-900/30">
          {/* TAB 1: CAMPAIGNS LIST */}
          {activeTab === 'campaigns' && (
            <div className="space-y-4">
              {/* Filter & Search Bar */}
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Bülleten kodu, sistem və ya açar sözlə axtarış..."
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    data-testid="recall-search-input"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filtrlər:</span>
                  </div>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as any)}
                    className="py-2 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    data-testid="category-filter-select"
                  >
                    <option value="all">Bütün Kateqoriyalar</option>
                    <option value="brakes">Əyləc Sistemi</option>
                    <option value="powertrain">Mühərrik & Transmissiya</option>
                    <option value="electrical_battery">Elektrik & Batareya</option>
                    <option value="airbag">Təhlükəsizlik Yastığı (SRS)</option>
                    <option value="steering_suspension">Sükan & Asqı</option>
                    <option value="fuel_system">Yanacaq Sistemi</option>
                    <option value="software">Proqram Təminatı</option>
                  </select>

                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value as any)}
                    className="py-2 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    data-testid="severity-filter-select"
                  >
                    <option value="all">Bütün Risklər</option>
                    <option value="critical">Kritik Risk</option>
                    <option value="high">Yüksək Prioritet</option>
                    <option value="medium">Orta Təsir</option>
                    <option value="low">Aşağı</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="py-2 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    data-testid="status-filter-select"
                  >
                    <option value="all">Bütün Statuslar</option>
                    <option value="open_action_required">Açıq / Təmir Tələb Olunan</option>
                    <option value="remedy_scheduled">Rezerv Edilmiş</option>
                    <option value="remedy_completed">İcra Edilmiş</option>
                  </select>
                </div>
              </div>

              {/* Recall Campaigns Grid / List */}
              {filteredCampaigns.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center border border-slate-200 dark:border-slate-700">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Seçilmiş filtrlərə uyğun geri çağırış kampaniyası tapılmadı
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Avtomobil bu meyarlar üzrə istehsalçı tərəfindən təmiz qeydə alınmışdır.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCampaigns.map((campaign) => {
                    const severityBadge = getRecallSeverityBadge(campaign.severity);
                    const statusBadge = getRecallStatusBadge(campaign.status);

                    return (
                      <div
                        key={campaign.id}
                        className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm transition hover:shadow-md"
                        data-testid={`campaign-item-${campaign.id}`}
                      >
                        {/* Header Badges */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${severityBadge.bgClass} ${severityBadge.textClass} ${severityBadge.borderClass}`}
                            >
                              {lang === 'en'
                                ? severityBadge.labelEn
                                : lang === 'ru'
                                  ? severityBadge.labelRu
                                  : severityBadge.labelAz}
                            </span>
                            <span
                              className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${statusBadge.bgClass} ${statusBadge.textClass} ${statusBadge.borderClass}`}
                            >
                              {lang === 'en'
                                ? statusBadge.labelEn
                                : lang === 'ru'
                                  ? statusBadge.labelRu
                                  : statusBadge.labelAz}
                            </span>
                            <span className="font-mono text-xs text-slate-500 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded">
                              {campaign.bulletinCode}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {campaign.announcementDate}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                          {lang === 'en'
                            ? campaign.titleEn
                            : lang === 'ru'
                              ? campaign.titleRu
                              : campaign.titleAz}
                        </h4>

                        {/* Description */}
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                          {lang === 'en'
                            ? campaign.descriptionEn
                            : lang === 'ru'
                              ? campaign.descriptionRu
                              : campaign.descriptionAz}
                        </p>

                        {/* Consequence / Risk Alert Box */}
                        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-lg p-3 mb-3 flex items-start gap-2.5">
                          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-xs font-bold text-rose-800 dark:text-rose-300 block mb-0.5">
                              Təhlükəsizlik Fəsadı & Riski:
                            </span>
                            <p className="text-xs text-rose-700 dark:text-rose-400">
                              {lang === 'en'
                                ? campaign.consequenceEn
                                : lang === 'ru'
                                  ? campaign.consequenceRu
                                  : campaign.consequenceAz}
                            </p>
                          </div>
                        </div>

                        {/* Remedy & Parts Information */}
                        <div className="bg-slate-50 dark:bg-slate-900/70 rounded-lg p-3.5 border border-slate-200 dark:border-slate-700/60 mb-4">
                          <div className="flex items-start gap-2 mb-2">
                            <Wrench className="w-4 h-4 text-slate-500 mt-0.5" />
                            <div>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                Rəsmi Diler Təmir Metodu:
                              </span>
                              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                                {lang === 'en'
                                  ? campaign.remedyEn
                                  : lang === 'ru'
                                    ? campaign.remedyRu
                                    : campaign.remedyAz}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                            <div>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                Təxmini İş Vaxtı:{' '}
                              </span>
                              <span>{campaign.estimatedLaborHours} saat</span>
                            </div>
                            <div>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                Tələb olunan hissələr:{' '}
                              </span>
                              <span>{campaign.partsRequired.join(', ')}</span>
                            </div>
                            <div className="ml-auto text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>100% Pulsuz Zavod Zəmanəti</span>
                            </div>
                          </div>
                        </div>

                        {/* Action CTA Button */}
                        {campaign.status === 'open_action_required' && (
                          <div className="flex items-center justify-end">
                            <button
                              onClick={() => handleStartBookingForCampaign(campaign.id)}
                              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
                              data-testid={`book-remedy-btn-${campaign.id}`}
                            >
                              <Calendar className="w-4 h-4" />
                              <span>Rəsmi Dilerdə Pulsuz Təmir Yazıl</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DEALER APPOINTMENT BOOKING */}
          {activeTab === 'booking' && (
            <div className="max-w-3xl mx-auto space-y-6">
              {activeBooking ? (
                /* Success Confirmation Card */
                <div
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 border border-emerald-300 dark:border-emerald-800 shadow-xl text-center space-y-5 animate-in fade-in"
                  data-testid="booking-confirmation-card"
                >
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <span className="text-xs uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400">
                      Uğurla Rezerv Edildi
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                      Rəsmi Diler Servis Təyinatı Təsdiqləndi
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                      İstehsalçının təhlükəsizlik kampaniyası çərçivəsində təmir və hissələr 100% pulsuzdur.
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 text-left space-y-3 text-xs sm:text-sm">
                    <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2.5">
                      <span className="text-slate-500">Təyinat Kodu:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                        {activeBooking.appointmentId}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2.5">
                      <span className="text-slate-500">Avtomobil / VIN:</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {activeBooking.vehicleTitle} ({activeBooking.vin})
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2.5">
                      <span className="text-slate-500">Rəsmi Diler Mərkəzi:</span>
                      <span className="font-semibold text-rose-600 dark:text-rose-400">
                        {activeBooking.serviceCenterName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2.5">
                      <span className="text-slate-500">Tarix və Saat:</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {activeBooking.date} • {activeBooking.timeSlot}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2.5">
                      <span className="text-slate-500">Əlaqədar Şəxs:</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {activeBooking.ownerName} ({activeBooking.ownerPhone})
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Əvəzedici Avtomobil (Loaner Car):</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {activeBooking.requiresLoanerCar ? 'Təmin olunacaq' : 'Tələb edilmədi'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 justify-center pt-2">
                    <button
                      onClick={() => setActiveBooking(null)}
                      className="px-5 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition"
                    >
                      Yeni Rezervasiya
                    </button>
                    <button
                      onClick={() => setActiveTab('certificate')}
                      className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition shadow"
                    >
                      <Award className="w-4 h-4" />
                      <span>Rəsmi Sertifikata Bax</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Interactive Booking Form */
                <form
                  onSubmit={handleBookAppointment}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6"
                  data-testid="recall-booking-form"
                >
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      Rəsmi Dilerdə Pulsuz Təmir Rezervasiyası
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      İstehsalçı qanunvericiliyinə əsasən bütün geri çağırış təmirləri və orijinal ehtiyat hissələri ödənişsiz həyata keçirilir.
                    </p>
                  </div>

                  {/* 1. Select Campaign */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Geri Çağırış Kampaniyası
                    </label>
                    <select
                      value={selectedCampaignId}
                      onChange={(e) => setSelectedCampaignId(e.target.value)}
                      className="w-full py-2.5 px-3 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      data-testid="booking-campaign-select"
                    >
                      {report.campaigns.map((c) => (
                        <option key={c.id} value={c.id}>
                          [{c.bulletinCode}] {c.titleAz} ({c.status === 'open_action_required' ? 'Açıq' : 'Rezerv/İcra'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. Select Authorized Service Center in Baku */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Akkreditə Olunmuş Diler Servis Mərkəzi (Bakı)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {MOCK_AUTHORIZED_SERVICE_CENTERS.map((sc) => {
                        const isSelected = sc.id === selectedCenterId;
                        return (
                          <div
                            key={sc.id}
                            onClick={() => setSelectedCenterId(sc.id)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'border-rose-600 bg-rose-50/50 dark:bg-rose-950/20 shadow-sm ring-1 ring-rose-500'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                            data-testid={`service-center-card-${sc.id}`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                                {sc.name}
                              </span>
                              {isSelected && (
                                <CheckCircle2 className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
                              <MapPin className="w-3.5 h-3.5 shrink-0" />
                              <span>{sc.address}</span>
                            </p>
                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                              <span>{sc.phone}</span>
                              <span className="text-amber-500 font-semibold">★ {sc.rating}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Date & Time Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Təqvim Tarixi
                      </label>
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full py-2.5 px-3 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                        data-testid="booking-date-input"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Mövcud Qəbul Saatı
                      </label>
                      <select
                        value={bookingTimeSlot}
                        onChange={(e) => setBookingTimeSlot(e.target.value)}
                        className="w-full py-2.5 px-3 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                        data-testid="booking-time-select"
                      >
                        {selectedCenter?.availableSlots.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 4. Owner Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Avtomobil Sahibinin Adı & Soyadı
                      </label>
                      <input
                        type="text"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        required
                        className="w-full py-2.5 px-3 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                        data-testid="booking-owner-name-input"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Əlaqə Nömrəsi
                      </label>
                      <input
                        type="text"
                        value={ownerPhone}
                        onChange={(e) => setOwnerPhone(e.target.value)}
                        required
                        className="w-full py-2.5 px-3 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                        data-testid="booking-owner-phone-input"
                      />
                    </div>
                  </div>

                  {/* 5. Loaner Car Checkbox */}
                  <div className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    <input
                      type="checkbox"
                      id="loanerCarCheckbox"
                      checked={loanerCarRequested}
                      onChange={(e) => setLoanerCarRequested(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                      data-testid="booking-loaner-checkbox"
                    />
                    <label htmlFor="loanerCarCheckbox" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <span className="font-bold block text-slate-900 dark:text-slate-100">
                        Təmir müddətində əvəzedici avtomobil tələb olunur (Courtesy Loaner Car)
                      </span>
                      İş saatları ərzində sərbəst hərəkət üçün diler tərəfindən ödənişsiz avtomobil təqdimatı.
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      data-testid="submit-booking-btn"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Rezervasiyanı Təsdiqlə (0 ₼ Pulsuz)</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: COMPLETED HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {completedCampaigns.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center border border-slate-200 dark:border-slate-700">
                  <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Əvvəl icra edilmiş kampaniya qeydiyyatda yoxdur
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Bu avtomobil üçün keçmişdə hər hansı tamamlanmış geri çağırış qeydə alınmayıb.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedCampaigns.map((c) => (
                    <div
                      key={c.id}
                      className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm"
                      data-testid={`history-item-${c.id}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            İcra Edilib
                          </span>
                          <span className="font-mono text-xs text-slate-500 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded">
                            {c.bulletinCode}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">{c.completedDate}</span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                        {c.titleAz}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                        {c.descriptionAz}
                      </p>

                      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 text-xs border border-slate-200 dark:border-slate-800 space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-slate-500">İcraçı Rəsmi Servis:</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {c.completedWorkshop}
                          </span>
                        </div>
                        {c.technicianNotes && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Usta Rəyi:</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {c.technicianNotes}
                            </span>
                          </div>
                        )}
                        {c.certificateNumber && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Arayış / Akt №:</span>
                            <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">
                              {c.certificateNumber}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: OFFICIAL CERTIFICATE */}
          {activeTab === 'certificate' && certificate && (
            <div className="max-w-2xl mx-auto space-y-4">
              {/* Certificate Paper Frame */}
              <div
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border-4 border-double border-amber-400/80 dark:border-amber-500/50 shadow-2xl relative overflow-hidden"
                data-testid="recall-certificate-frame"
              >
                {/* Background Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                  <ShieldCheck className="w-96 h-96 text-slate-900 dark:text-white" />
                </div>

                {/* Header */}
                <div className="text-center border-b border-amber-300/40 dark:border-amber-600/40 pb-5 mb-5 relative">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 mb-2">
                    <Award className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Azərbaycan Respublikası
                  </h3>
                  <div className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">
                    Dövlət Yol Polisi və İstehsalçı Reyestri Akkreditasiyası
                  </div>
                  <div className="text-[11px] font-mono text-amber-600 dark:text-amber-400 mt-1 font-bold">
                    {certificate.certificateId}
                  </div>
                </div>

                {/* Vehicle Identification */}
                <div className="space-y-3 text-xs sm:text-sm mb-6 relative">
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500 dark:text-slate-400">Avtomobil Modeli:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {certificate.vehicleTitle}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500 dark:text-slate-400">Şassi Nömrəsi (VIN):</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {certificate.vin}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500 dark:text-slate-400">Təhlükəsizlik İndeksi:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {certificate.safetyScore} / 100
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500 dark:text-slate-400">Açıq Kampaniyalar:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {certificate.openCampaignsCount} ədəd
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500 dark:text-slate-400">Verilmə Tarixi:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {certificate.issueDate}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500 dark:text-slate-400">Etibarlılıq Müddəti:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {certificate.expiryDate}
                    </span>
                  </div>
                </div>

                {/* Official Verdict Banner */}
                <div
                  className={`p-3.5 rounded-xl border text-center text-xs font-bold uppercase tracking-wider mb-6 ${
                    certificate.openCampaignsCount === 0
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300'
                  }`}
                >
                  {certificate.safetyStatusAz}
                </div>

                {/* Footer Signatures & QR */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="text-[11px] text-slate-400">Yoxlama Kodu:</div>
                    <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {certificate.verificationCode}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 truncate max-w-[240px]">
                      {certificate.digitalSignature}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyText(certificate.verificationCode)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                      data-testid="copy-cert-code-btn"
                    >
                      {copiedText === certificate.verificationCode ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Kopyalandı</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Kodu Kopyala</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => window.print()}
                      className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                      data-testid="print-certificate-btn"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Çap Et</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span>Rəsmi Diler Zəmanəti • Pulsuz Xidmət</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold transition"
            data-testid="recall-modal-footer-close"
          >
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
};

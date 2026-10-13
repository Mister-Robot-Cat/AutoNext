import React, { useState, useMemo } from 'react';
import { Vehicle, Currency, Language } from '../types/vehicle';
import { formatPrice } from '../utils/i18n';
import {
  calculateInspectionRequirements,
  generateDiagnosticTalon,
  bookInspectionAppointment,
} from '../utils/technicalInspection';
import { MOCK_INSPECTION_STATIONS } from '../data/mockTechnicalInspection';
import { InspectionAppointment } from '../types/technicalInspection';
import { useScrollLock } from '../hooks/useScrollLock';
import { useKeyPress } from '../hooks/useKeyPress';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { toastManager } from '../hooks/useToast';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Copy,
  Printer,
  Gauge,
  Activity,
  Flame,
  Zap,
  Info,
  Car,
  QrCode,
  Sparkles,
} from 'lucide-react';

interface TechnicalInspectionModalProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  currency: Currency;
  lang: Language;
  onClose: () => void;
}

type TabType = 'talon' | 'diagnostics' | 'fees' | 'booking';

export const TechnicalInspectionModal: React.FC<TechnicalInspectionModalProps> = ({
  isOpen,
  vehicle,
  currency,
  lang,
  onClose,
}) => {
  useScrollLock(isOpen);
  useKeyPress('Escape', onClose);
  const [, copyToClipboard] = useCopyToClipboard();

  const [activeTab, setActiveTab] = useState<TabType>('talon');
  const [selectedStationId, setSelectedStationId] = useState<string>(MOCK_INSPECTION_STATIONS[0].id);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState<string>(MOCK_INSPECTION_STATIONS[0].availableSlots[0]);
  const [plateNumber, setPlateNumber] = useState<string>('99-AB-123');
  const [applicantName, setApplicantName] = useState<string>('Əli Məmmədov');
  const [applicantPhone, setApplicantPhone] = useState<string>('+994 50 234-56-78');
  const [confirmedBooking, setConfirmedBooking] = useState<InspectionAppointment | null>(null);

  // Diagnostic calculations
  const requirements = useMemo(() => {
    if (!vehicle) return null;
    return calculateInspectionRequirements(vehicle);
  }, [vehicle]);

  const talon = useMemo(() => {
    if (!vehicle) return null;
    return generateDiagnosticTalon(vehicle);
  }, [vehicle]);

  const selectedStation = useMemo(() => {
    return MOCK_INSPECTION_STATIONS.find((s) => s.id === selectedStationId) || MOCK_INSPECTION_STATIONS[0];
  }, [selectedStationId]);

  if (!isOpen || !vehicle || !requirements || !talon) return null;

  const handleCopyTalon = () => {
    const text = `DYP Elektron Diaqnostika Talonu №: ${talon.talonNumber} | PIN: ${talon.pinCode} | Bitmə tarixi: ${talon.expiryDate}`;
    copyToClipboard(text);
    toastManager.add(
      lang === 'az'
        ? 'Talon məlumatları kopyalandı!'
        : lang === 'en'
        ? 'Diagnostic talon info copied!'
        : 'Данные талона скопированы!',
      'success'
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    const result = bookInspectionAppointment({
      stationId: selectedStationId,
      vehicleVin: vehicle.vin,
      plateNumber,
      scheduledDate: selectedDate,
      scheduledTime: selectedSlot,
      applicantName,
      applicantPhone,
    });

    if (result.success && result.appointment) {
      setConfirmedBooking(result.appointment);
      toastManager.add(
        lang === 'az'
          ? 'Texniki baxış növbəsi uğurla təsdiqləndi!'
          : lang === 'en'
          ? 'Inspection appointment successfully booked!'
          : 'Запись на техосмотр успешно подтверждена!',
        'success'
      );
    } else {
      toastManager.add(result.errorMessage || 'Xəta baş verdi', 'error');
    }
  };

  const statusColor = {
    valid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    expiring_soon: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    expired: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    exempt: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  }[requirements.status];

  const statusText = {
    valid: {
      az: 'Etibarlıdır',
      en: 'Valid',
      ru: 'Действителен',
    },
    expiring_soon: {
      az: 'Müddəti Bitir (Yaxınlaşır)',
      en: 'Expiring Soon',
      ru: 'Срок истекает',
    },
    expired: {
      az: 'Müddəti Bitmişdir (Cərimə Riski)',
      en: 'Expired (Fine Risk)',
      ru: 'Просрочен (Риск штрафа)',
    },
    exempt: {
      az: 'Yeni Avtomobil (Azad Edilib)',
      en: 'New Vehicle (Exempt)',
      ru: 'Новый автомобиль (Освобожден)',
    },
  }[requirements.status][lang];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="technical-inspection-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/70 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 text-white shadow-lg shadow-sky-500/25">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Dövlət Yol Polisi (BDYP)
                </span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>
                  {statusText}
                </span>
              </div>
              <h2 id="technical-inspection-title" className="text-lg sm:text-xl font-black text-white mt-0.5">
                {lang === 'az'
                  ? 'Dövlət Texniki Baxışı & Elektron Talon'
                  : lang === 'en'
                  ? 'State Roadworthiness & Diagnostic Talon'
                  : 'Государственный техосмотр и электронный талон'}
              </h2>
              <p className="text-xs text-slate-400">
                {vehicle.make} {vehicle.model} ({vehicle.year}) • VIN: <span className="font-mono text-slate-300">{vehicle.vin}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alert Banner */}
        <div className="px-4 sm:px-6 pt-4">
          {requirements.status === 'expired' && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
              <div className="text-xs sm:text-sm">
                <strong className="font-bold text-rose-200">
                  {lang === 'az' ? 'DİQQƏT: Texniki baxış müddəti bitib!' : lang === 'en' ? 'WARNING: Inspection expired!' : 'ВНИМАНИЕ: Срок техосмотра истек!'}
                </strong>
                <p className="text-rose-300/90 mt-0.5">
                  {lang === 'az'
                    ? 'İnzibati Xətalar Məcəlləsinin 339.1-1 maddəsinə əsasən 150 AZN cərimə tətbiq olunur. Nəqliyyat vasitəsi kameralar tərəfindən avtomatik qeydə alınır.'
                    : lang === 'en'
                    ? 'According to Article 339.1-1, a 150 AZN penalty is enforced with automated photo-radar detection.'
                    : 'Согласно статье 339.1-1 налагается штраф 150 AZN. Нарушение фиксируется радарами автоматически.'}
                </p>
              </div>
            </div>
          )}

          {requirements.status === 'expiring_soon' && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
              <div className="text-xs sm:text-sm">
                <strong className="font-bold text-amber-200">
                  {lang === 'az'
                    ? `Texniki baxışın bitməsinə ${requirements.daysRemaining} gün qalıb!`
                    : lang === 'en'
                    ? `Inspection expires in ${requirements.daysRemaining} days!`
                    : `До окончания техосмотра осталось ${requirements.daysRemaining} дн.!`}
                </strong>
                <p className="text-amber-300/90 mt-0.5">
                  {lang === 'az'
                    ? 'Cərimə riskindən yayınmaq üçün öncədən növbə götürərək yaxınlıqdakı mərkəzə müraciət edin.'
                    : lang === 'en'
                    ? 'Book an appointment in advance to prevent automated fines.'
                    : 'Запишитесь заранее, чтобы избежать штрафов.'}
                </p>
              </div>
            </div>
          )}

          {requirements.status === 'exempt' && (
            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-300 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
              <div className="text-xs sm:text-sm">
                <strong className="font-bold text-blue-200">
                  {lang === 'az' ? 'Yeni Avtomobil Güzəşti (Qanun Maddə 30)' : lang === 'en' ? 'New Car Exemption (Article 30)' : 'Льгота для новых авто (Статья 30)'}
                </strong>
                <p className="text-blue-300/90 mt-0.5">
                  {lang === 'az'
                    ? 'İstehsal ilindən 4 il keçməmiş minik avtomobilləri qanunvericiliyə əsasən dövlət texniki baxışından tam azaddır.'
                    : lang === 'en'
                    ? 'Vehicles under 4 years from manufacturing date are fully exempt from inspection.'
                    : 'Автомобили младше 4 лет с года выпуска полностью освобождены от прохождения техосмотра.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-4 sm:px-6 mt-3 gap-1 overflow-x-auto">
          {[
            { id: 'talon', label: lang === 'az' ? 'Elektron Talon' : lang === 'en' ? 'E-Talon Certificate' : 'Электронный талон', icon: FileCheck2 },
            { id: 'diagnostics', label: lang === 'az' ? 'Laboratoriya Testləri' : lang === 'en' ? 'Diagnostic Tests' : 'Тесты лаборатории', icon: Activity },
            { id: 'fees', label: lang === 'az' ? 'Qrafik & Rüsumlar' : lang === 'en' ? 'Schedule & Fees' : 'График и пошлины', icon: Gauge },
            { id: 'booking', label: lang === 'az' ? 'Onlayn Növbə' : lang === 'en' ? 'Book Appointment' : 'Онлайн-запись', icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-sky-500 text-sky-400 bg-sky-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* TAB 1: ELECTRONIC DIAGNOSTIC TALON */}
          {activeTab === 'talon' && (
            <div className="space-y-6">
              {/* Talon Certificate Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-950 to-slate-900 border-2 border-sky-500/40 shadow-xl space-y-6 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* Talon State Header */}
                <div className="text-center space-y-1 border-b border-slate-800 pb-4">
                  <div className="flex items-center justify-center gap-2 text-sky-400 mb-1">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-xs font-bold tracking-widest uppercase">
                      Azərbaycan Respublikası Daxili İşlər Nazirliyi
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                    Baş Dövlət Yol Polisi İdarəsi
                  </h3>
                  <p className="text-xs text-sky-400 font-semibold tracking-wide">
                    ELEKTRON TEXNİKİ MÜAYİNƏ VƏ DİAQNOSTİKA TALONU
                  </p>
                </div>

                {/* Certificate Number & PIN */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-500">Talon Nömrəsi</span>
                    <span className="font-mono font-bold text-white text-sm sm:text-base">{talon.talonNumber}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-500">Verifikasiya PIN</span>
                    <span className="font-mono font-bold text-sky-400 text-sm sm:text-base">{talon.pinCode}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-500">Etibarlılıq Müddəti</span>
                    <span className="font-semibold text-white text-sm sm:text-base">
                      {talon.expiryDate} ({requirements.daysRemaining} gün)
                    </span>
                  </div>
                </div>

                {/* Details Table */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                      <span className="text-slate-400">Nəqliyyat vasitəsi:</span>
                      <span className="font-bold text-white">{vehicle.make} {vehicle.model}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                      <span className="text-slate-400">Buraxılış ili:</span>
                      <span className="font-semibold text-white">{vehicle.year}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                      <span className="text-slate-400">VIN Kodu:</span>
                      <span className="font-mono text-slate-200">{vehicle.vin}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                      <span className="text-slate-400">Mühərrik / Yanacaq:</span>
                      <span className="font-semibold text-white uppercase">{vehicle.fuelType} ({vehicle.engineVolumeLiters}L)</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                      <span className="text-slate-400">Müayinə mərkəzi:</span>
                      <span className="font-semibold text-sky-300 text-right">{talon.centerName}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                      <span className="text-slate-400">Müfəttiş:</span>
                      <span className="font-semibold text-white">{talon.inspectorName}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                      <span className="text-slate-400">Müayinə anında yürüş:</span>
                      <span className="font-semibold text-white">{talon.mileageAtInspectionKm.toLocaleString()} km</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                      <span className="text-slate-400">Yekun qərar:</span>
                      <span className="font-bold text-emerald-400 uppercase">Müayinədən Keçmişdir (PASSED)</span>
                    </div>
                  </div>
                </div>

                {/* Barcode & Security Stamp */}
                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white text-slate-900">
                      <QrCode className="w-10 h-10" />
                    </div>
                    <div className="text-[11px] text-slate-400">
                      <span className="font-bold text-slate-200 block">Elektron Reyestr QR İmza</span>
                      <span>ASAN / DYP vahid məlumat bazasında qeydiyyatdan keçib</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyTalon}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Kopyala</span>
                    </button>
                    <button
                      onClick={handlePrint}
                      className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-sky-600/30"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Çap Et (PDF)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DIAGNOSTIC TESTS & STANDARDS */}
          {activeTab === 'diagnostics' && (
            <div className="space-y-6">
              {/* Section 1: Brake System */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
                    <Activity className="w-5 h-5 text-sky-400" />
                    <h4>1. Əyləc Sistemi & Tormoz Stendi Sınağı</h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Standartlara Uyğundur
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80">
                    <span className="text-[11px] text-slate-400 block mb-1">Əyləc Səmərəliliyi (Min: 50%)</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-black text-white">{talon.brakeTest.brakeEfficiencyPercent}%</span>
                      <span className="text-xs text-emerald-400 font-semibold">Qanuni norma: ≥ 50%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${talon.brakeTest.brakeEfficiencyPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80">
                    <span className="text-[11px] text-slate-400 block mb-1">Oxlararası Qeyri-bərabərlik (Maks: 30%)</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-black text-white">{talon.brakeTest.axleImbalancePercent}%</span>
                      <span className="text-xs text-emerald-400 font-semibold">Qanuni norma: ≤ 30%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-sky-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, (talon.brakeTest.axleImbalancePercent / 30) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80">
                    <span className="text-[11px] text-slate-400 block mb-1">Qabaq / Arxa Əyləc Qüvvəsi</span>
                    <span className="text-lg font-bold text-white block mt-1">
                      {talon.brakeTest.frontAxleBrakingForceKn} kN / {talon.brakeTest.rearAxleBrakingForceKn} kN
                    </span>
                    <span className="text-[10px] text-slate-500">Əl əyləci: {talon.brakeTest.parkingBrakeForceKn} kN</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Exhaust Emissions */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
                    <Flame className="w-5 h-5 text-amber-400" />
                    <h4>2. Qaz Analizatoru & Ekoloji Emissiya Testi</h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                    {talon.emissionTest.emissionStandard}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Dəm Qazı (CO %)</span>
                    <span className="text-lg font-black text-white block mt-0.5">{talon.emissionTest.coPercent}%</span>
                    <span className="text-[10px] text-emerald-400">Norma: ≤ 0.30%</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Karbohidrogen (HC)</span>
                    <span className="text-lg font-black text-white block mt-0.5">{talon.emissionTest.hcPpm} ppm</span>
                    <span className="text-[10px] text-emerald-400">Norma: ≤ 100 ppm</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Lambda (λ) Əmsalı</span>
                    <span className="text-lg font-black text-white block mt-0.5">{talon.emissionTest.lambdaRatio}</span>
                    <span className="text-[10px] text-slate-400">Norma: 0.97 - 1.03</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">CO₂ Buraxılışı</span>
                    <span className="text-lg font-black text-white block mt-0.5">{talon.emissionTest.co2GramsPerKm} g/km</span>
                    <span className="text-[10px] text-slate-400">Orta hesabla</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Safety Equipment */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h4>3. Təhlükəsizlik Ləvazimatı & Şüşə Şəffaflığı</h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block font-semibold">Təkər Protektoru:</span>
                      <span className="text-white font-bold text-sm">{talon.safetyEquipment.tyreTreadDepthMm} mm</span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block font-semibold">İşıq Optikası:</span>
                      <span className="text-white font-bold text-sm">Nizamlıdır</span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block font-semibold">Şüşə İşıqburaxma:</span>
                      <span className="text-white font-bold text-sm">{talon.safetyEquipment.windshieldTintTransparencyPercent}%</span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block font-semibold">Apteçka & Balon:</span>
                      <span className="text-emerald-400 font-bold text-sm">Mövcuddur</span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SCHEDULE & LEGAL FEES */}
          {activeTab === 'fees' && (
            <div className="space-y-6">
              {/* Age Rules Explanation */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
                  <Clock className="w-5 h-5 text-sky-400" />
                  <h4>Qanunvericilik üzrə Texniki Baxış Dövrləri (Maddə 30)</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className={`p-4 rounded-xl border ${requirements.vehicleAge <= 4 ? 'bg-sky-500/10 border-sky-500/40 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                    <span className="font-bold text-sky-400 block mb-1">0 – 4 İl (Yeni Avtomobillər)</span>
                    <p className="leading-relaxed">Dövlət texniki baxışından tam azaddır. Talona ehtiyac yoxdur.</p>
                  </div>

                  <div className={`p-4 rounded-xl border ${requirements.vehicleAge > 4 && requirements.vehicleAge <= 10 ? 'bg-sky-500/10 border-sky-500/40 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                    <span className="font-bold text-sky-400 block mb-1">4 – 10 İl (Orta Yaş)</span>
                    <p className="leading-relaxed">Hər 2 ildə bir dəfə dövlət müayinəsindən keçməlidir.</p>
                  </div>

                  <div className={`p-4 rounded-xl border ${requirements.vehicleAge > 10 ? 'bg-sky-500/10 border-sky-500/40 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                    <span className="font-bold text-sky-400 block mb-1">10 İldən Çox</span>
                    <p className="leading-relaxed">Hər il (ildə 1 dəfə) məcburi texniki baxışdan keçməlidir.</p>
                  </div>
                </div>
              </div>

              {/* State Fee Breakdown Card */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <h4 className="text-white font-bold text-sm sm:text-base flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-emerald-400" />
                  <span>Dövlət Rüsumu və Ödəniş Detalları</span>
                </h4>

                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Dövlət Rüsumu (Minik avtomobili):</span>
                    <span className="font-bold text-white">{formatPrice(requirements.stateDutyAzn, currency)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Texniki Diaqnostika və Müayinə Xidməti:</span>
                    <span className="font-bold text-white">{formatPrice(requirements.serviceDiagnosticFeeAzn, currency)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Bank / ASAN Ödəniş Komissiyası:</span>
                    <span className="font-bold text-white">{formatPrice(requirements.bankProcessingFeeAzn, currency)}</span>
                  </div>
                  <div className="flex justify-between py-3 border-t border-slate-700 text-sm sm:text-base">
                    <span className="font-black text-white">Yekun Ödəniləcək Məbləğ:</span>
                    <span className="font-black text-emerald-400 text-lg">
                      {formatPrice(requirements.totalFeeAzn, currency)}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
                  <Info className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
                  <span>
                    Ödəniş ASAN Pay, Hökumət Ödəniş Portalı (GPP) və ya müayinə mərkəzindəki terminallarda nağdsız həyata keçirilir.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ONLINE BOOKING & APPOINTMENT */}
          {activeTab === 'booking' && (
            <div className="space-y-6">
              {confirmedBooking ? (
                /* Confirmed Booking Ticket */
                <div className="p-6 rounded-3xl bg-emerald-950/20 border-2 border-emerald-500/40 shadow-xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-emerald-500 text-slate-950">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-emerald-200">
                        Növbəniz Uğurla Qeydə Alındı!
                      </h4>
                      <p className="text-xs text-emerald-400">
                        Qeydiyyat Kodu: <strong className="font-mono">{confirmedBooking.bookingId}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-500 block">Təyin edilmiş Mərkəz:</span>
                      <strong className="text-white block mt-0.5">{confirmedBooking.stationName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Tarix & Saat:</span>
                      <strong className="text-white block mt-0.5">
                        {confirmedBooking.scheduledDate} • saat {confirmedBooking.scheduledTime}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Dövlət Qeydiyyat Nişanı:</span>
                      <strong className="text-sky-400 font-mono block mt-0.5">{confirmedBooking.plateNumber}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Sürücü:</span>
                      <strong className="text-white block mt-0.5">
                        {confirmedBooking.applicantName} ({confirmedBooking.applicantPhone})
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-400 font-mono">
                      Barkod: {confirmedBooking.qrReferenceCode}
                    </span>
                    <button
                      onClick={() => setConfirmedBooking(null)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
                    >
                      Yeni Növbə Seç
                    </button>
                  </div>
                </div>
              ) : (
                /* Booking Form */
                <form onSubmit={handleBook} className="space-y-4">
                  {/* Station Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                      Müayinə Mərkəzini Seçin
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {MOCK_INSPECTION_STATIONS.map((station) => (
                        <button
                          key={station.id}
                          type="button"
                          onClick={() => {
                            setSelectedStationId(station.id);
                            setSelectedSlot(station.availableSlots[0]);
                          }}
                          className={`p-3.5 rounded-2xl border text-left text-xs transition-all flex flex-col justify-between gap-2 ${
                            selectedStationId === station.id
                              ? 'bg-sky-500/15 border-sky-500 text-white shadow-md shadow-sky-500/15'
                              : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/40 hover:text-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-sm text-white">{station.name}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-sky-400 shrink-0">
                              {station.lanesCount} xətt
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                            <span className="truncate">{station.address}</span>
                          </p>
                          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
                            <span className="text-slate-400">{station.workingHours}</span>
                            <span className="text-emerald-400 font-semibold">
                              Canlı növbə: ~{station.currentQueueWaitMinutes} dəq
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date & Time Slot Picker */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                        Müayinə Tarixi
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white text-xs font-semibold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                        Mövcud Saat Aralığı
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedStation.availableSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              selectedSlot === slot
                                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Form fields: Plate & Contact */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                        Dövlət Qeydiyyat Nişanı
                      </label>
                      <input
                        type="text"
                        value={plateNumber}
                        onChange={(e) => setPlateNumber(e.target.value)}
                        placeholder="99-XX-999"
                        className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white font-mono uppercase text-xs font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                        Sürücünün Adı, Soyadı
                      </label>
                      <input
                        type="text"
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                        Əlaqə Telefonu
                      </label>
                      <input
                        type="text"
                        value={applicantPhone}
                        onChange={(e) => setApplicantPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white text-xs"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold transition-all shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 text-sm mt-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Növbəni Təsdiqlə & Talon Rezervasiyası Et</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

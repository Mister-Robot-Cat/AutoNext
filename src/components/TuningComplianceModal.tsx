import React, { useState, useMemo } from 'react';
import { Vehicle, Currency, Language } from '../types/vehicle';
import {
  ModificationCategory,
  AutogasSystemType,
  HeadlightOpticsType,
  LabBookingConfirmation
} from '../types/tuning';
import {
  TUNING_MODIFICATIONS,
  ACCREDITED_TUNING_LABS,
  SAMPLE_TUNING_CERTIFICATES
} from '../data/mockTuningData';
import {
  STATUTORY_ACOUSTIC_LIMIT_DBA,
  auditVehicleModifications,
  calculateAutogasPayback,
  generateConstructiveCertificate,
  verifyCertificateByCode,
  createLabAppointmentBooking,
  convertTuningCurrency,
  filterModificationsByCategory
} from '../utils/tuningCompliance';
import {
  X,
  Wrench,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Volume2,
  Flame,
  Building2,
  FileCheck,
  CheckCircle2,
  Copy,
  Check,
  Search,
  Calendar,
  MapPin,
  Phone,
  Sparkles,
  Scale,
  Gauge,
  QrCode,
  Printer
} from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock';
import { useKeyPress } from '../hooks/useKeyPress';

interface TuningComplianceModalProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  currency: Currency;
  lang: Language;
  onClose: () => void;
}

type ActiveTab = 'auditor' | 'telemetry' | 'autogas' | 'labs' | 'certificate';

const CATEGORY_LABELS: Record<
  ModificationCategory | 'all',
  { az: string; en: string; ru: string }
> = {
  all: { az: 'Bütün Avadanlıqlar', en: 'All Modifications', ru: 'Все Изменения' },
  autogas: { az: 'Qazbalon (LPG/CNG)', en: 'Autogas (LPG/CNG)', ru: 'ГБО (LPG/CNG)' },
  body_kit: { az: 'Body-Kit & Restaylinq', en: 'Body-Kit & Facelift', ru: 'Обвес и Рестайлинг' },
  offroad_expedition: { az: 'Off-Road & Lebedka', en: 'Off-Road & Winch', ru: 'Off-Road и Лебедка' },
  suspension_wheels: { az: 'Asqı, Klirens & Disklər', en: 'Suspension & Wheels', ru: 'Подвеска и Диски' },
  exhaust_engine: { az: 'Səsboğucu & Desibel', en: 'Exhaust & Acoustic', ru: 'Выхлоп и Децибелы' },
  lighting_optics: { az: 'İşıqlandırma & Optika', en: 'Lighting & Optics', ru: 'Оптика и Фары' }
};

export const TuningComplianceModal: React.FC<TuningComplianceModalProps> = ({
  isOpen,
  vehicle,
  currency,
  lang,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('auditor');
  const [selectedCategory, setSelectedCategory] = useState<ModificationCategory | 'all'>('all');

  // Auditor & Telemetry state
  const [selectedModificationIds, setSelectedModificationIds] = useState<string[]>([
    'oem_body_kit_restyling',
    'lpg_propan_system'
  ]);
  const [exhaustDecibelDba, setExhaustDecibelDba] = useState<number>(78);
  const [suspensionLiftMm, setSuspensionLiftMm] = useState<number>(0);
  const [wheelSpacerMm, setWheelSpacerMm] = useState<number>(0);
  const [headlightType, setHeadlightType] = useState<HeadlightOpticsType>('oem_led');

  // Autogas ROI state
  const [autogasSystem, setAutogasSystem] = useState<AutogasSystemType>('lpg_euro4');
  const [monthlyMileageKm, setMonthlyMileageKm] = useState<number>(2500);
  const [petrolConsumption, setPetrolConsumption] = useState<number>(
    vehicle && vehicle.fuelConsumptionLPer100Km > 0 ? vehicle.fuelConsumptionLPer100Km : 10.5
  );
  const [petrolGrade, setPetrolGrade] = useState<'ai92' | 'ai95' | 'ai98'>('ai95');
  const [includeOfficialFee, setIncludeOfficialFee] = useState<boolean>(true);

  // Labs & Booking state
  const [selectedLabCity, setSelectedLabCity] = useState<string>('all');
  const [selectedLabId, setSelectedLabId] = useState<string>(ACCREDITED_TUNING_LABS[0].id);
  const [appointmentDate, setAppointmentDate] = useState<string>('2026-10-20');
  const [appointmentSlot, setAppointmentSlot] = useState<string>('11:00');
  const [bookingConfirmation, setBookingConfirmation] = useState<LabBookingConfirmation | null>(null);

  // Certificate & Registry state
  const [ownerName, setOwnerName] = useState<string>('Fərid Məmmədov Əli oğlu');
  const [ownerFin, setOwnerFin] = useState<string>('5A9K2L1');
  const [plateNumber, setPlateNumber] = useState<string>(
    vehicle?.plateNumber || '10-MM-530'
  );
  const [searchCertQuery, setSearchCertQuery] = useState<string>('');
  const [copiedCert, setCopiedCert] = useState<boolean>(false);

  useScrollLock(isOpen);
  useKeyPress('Escape', () => {
    if (isOpen) onClose();
  });

  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₼';
  const formatAmount = (amountAzn: number) => {
    const converted = convertTuningCurrency(amountAzn, currency);
    return currency === 'AZN'
      ? `${converted.toLocaleString()} ₼`
      : `${currencySymbol}${converted.toLocaleString()}`;
  };

  const filteredMods = useMemo(
    () => filterModificationsByCategory(selectedCategory),
    [selectedCategory]
  );

  const auditResult = useMemo(
    () =>
      auditVehicleModifications({
        exhaustDecibelDba,
        suspensionLiftMm,
        wheelSpacerMm,
        headlightType,
        selectedModificationIds
      }),
    [
      exhaustDecibelDba,
      suspensionLiftMm,
      wheelSpacerMm,
      headlightType,
      selectedModificationIds
    ]
  );

  const autogasResult = useMemo(
    () =>
      calculateAutogasPayback({
        systemType: autogasSystem,
        monthlyMileageKm,
        petrolConsumptionLPer100Km: petrolConsumption,
        currentPetrolGrade: petrolGrade,
        includeOfficialTexpasportFee: includeOfficialFee
      }),
    [
      autogasSystem,
      monthlyMileageKm,
      petrolConsumption,
      petrolGrade,
      includeOfficialFee
    ]
  );

  const filteredLabs = useMemo(() => {
    if (selectedLabCity === 'all') return ACCREDITED_TUNING_LABS;
    return ACCREDITED_TUNING_LABS.filter((l) => l.city === selectedLabCity);
  }, [selectedLabCity]);

  const generatedCertificate = useMemo(
    () =>
      generateConstructiveCertificate({
        ownerName,
        ownerFin,
        vehicleTitle: vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.year})` : 'BMW 530i (2022)',
        vin: vehicle?.vin || 'WBAJA5C50JG892104',
        plateNumber,
        labId: selectedLabId,
        auditResult,
        measuredDecibelDba: exhaustDecibelDba,
        suspensionDeltaMm: suspensionLiftMm
      }),
    [
      ownerName,
      ownerFin,
      vehicle,
      plateNumber,
      selectedLabId,
      auditResult,
      exhaustDecibelDba,
      suspensionLiftMm
    ]
  );

  const verifiedRegistryCert = useMemo(
    () => verifyCertificateByCode(searchCertQuery),
    [searchCertQuery]
  );

  if (!isOpen) return null;

  const toggleModSelection = (id: string) => {
    setSelectedModificationIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBookLab = (labId: string) => {
    setSelectedLabId(labId);
    const confirmation = createLabAppointmentBooking({
      labId,
      vehiclePlate: plateNumber,
      appointmentDate,
      appointmentSlot,
      estimatedFeeAzn: auditResult.feesBreakdown.totalOfficialFeeAzn || 142
    });
    setBookingConfirmation(confirmation);
  };

  const handleCopyCertificate = () => {
    const summaryText = `BDYP & AZS RƏSMİ KONSTRUKTİV DƏYİŞİKLİK ŞƏHADƏTNAMƏSİ
Şəhadətnamə №: ${generatedCertificate.certificateNumber}
AZS Laboratoriya Aktı: ${generatedCertificate.azsLabProtocolNumber}
Avtomobil: ${generatedCertificate.vehicleTitle} (${generatedCertificate.plateNumber})
VIN: ${generatedCertificate.vin}
Mülkiyyətçi: ${generatedCertificate.ownerName} (FİN: ${generatedCertificate.ownerFin})
${generatedCertificate.texpasportSpecialNotes}
Akustik Ölçü: ${generatedCertificate.measuredDecibelDba} dBA (Norma: ≤84 dBA)
QR Kod: ${generatedCertificate.qrVerificationHash}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(summaryText).catch(() => {});
    }
    setCopiedCert(true);
    setTimeout(() => setCopiedCert(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
      data-testid="tuning-compliance-modal"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 p-0.5 shadow-lg shadow-orange-500/20 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Wrench className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  BDYP & AZS Konstruktiv Dəyişiklik, Qazbalon (LPG/CNG) və Tüninq Portalı
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  İXM Maddə 342.2-1 / AZS 636
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {vehicle
                  ? `${vehicle.title} (${vehicle.year}) • VIN: ${vehicle.vin} • Texpasport "Xüsusi Qeydlər" & Akustik Ekspertiza`
                  : 'Avtoqaz (LPG/CNG), M/AMG Body-Kit, Off-Road avadanlıqların rəsmiləşdirilməsi və Desibel normativi yoxlanışı'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            data-testid="close-tuning-modal-btn"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors self-end sm:self-auto cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-3 bg-slate-950/50 border-b border-slate-800 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('auditor')}
            data-testid="tab-tuning-auditor"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'auditor'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>1. Tüninq & Konstruktiv Ekspertiza</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('telemetry')}
            data-testid="tab-tuning-telemetry"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'telemetry'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>2. Desibel (dBA) & Klirens Stendi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('autogas')}
            data-testid="tab-tuning-autogas"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'autogas'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>3. Qazbalon (LPG/CNG) Qənaət Kalkulyatoru</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('labs')}
            data-testid="tab-tuning-labs"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'labs'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>4. AZS Laboratoriyalar & Növbə</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('certificate')}
            data-testid="tab-tuning-certificate"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'certificate'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>5. BDYP E-Şəhadətnamə & Reyestr</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Live Status Summary Strip */}
          <div
            data-testid="tuning-overall-status-banner"
            className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              auditResult.overallStatus === 'illegal_impound_risk'
                ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                : auditResult.overallStatus === 'endorsement_required'
                ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {auditResult.overallStatus === 'illegal_impound_risk' ? (
                <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
              ) : auditResult.overallStatus === 'endorsement_required' ? (
                <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-sm sm:text-base text-white">
                    {auditResult.overallStatus === 'illegal_impound_risk'
                      ? 'QADAĞAN OLUNMUŞ KONSTRUKTİV MÜDAXİLƏ — CƏRİMƏ MEYDANÇASI RİSKİ!'
                      : auditResult.overallStatus === 'endorsement_required'
                      ? 'QANUNİ TÜNİNQ — TEXPASPORTDA "XÜSUSİ QEYDLƏR" TƏLƏB OLUNUR'
                      : 'TAM QANUNİ ZAVOD NORMASI — ƏLAVƏ İCAZƏ TƏLƏB OLUNMUR'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-900/80 border border-slate-700 text-white">
                    Uyğunluq Balı: {auditResult.complianceScore}/100
                  </span>
                </div>
                <p className="text-xs opacity-90 mt-1 font-mono" data-testid="texpasport-endorsement-preview">
                  {auditResult.texpasportEndorsementText}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-right">
                <span className="text-[10px] uppercase text-slate-400 block">
                  Rəsmi Rəsmiləşdirmə Xərci
                </span>
                <span className="text-sm font-black text-amber-400" data-testid="total-official-fee-value">
                  {formatAmount(auditResult.feesBreakdown.totalOfficialFeeAzn)}
                </span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-right">
                <span className="text-[10px] uppercase text-slate-400 block">
                  Qeydiyyatsız Cərimə Riski
                </span>
                <span className="text-sm font-black text-rose-400" data-testid="statutory-fine-risk-value">
                  {formatAmount(auditResult.statutoryFineExposureAzn)}
                </span>
              </div>
            </div>
          </div>

          {/* TAB 1: AUDITOR */}
          {activeTab === 'auditor' && (
            <div className="space-y-6" data-testid="tuning-auditor-section">
              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-2">
                {(Object.keys(CATEGORY_LABELS) as (ModificationCategory | 'all')[]).map(
                  (cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      data-testid={`filter-cat-${cat}`}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {CATEGORY_LABELS[cat][lang]}
                    </button>
                  )
                )}
              </div>

              {/* Modifications Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredMods.map((item) => {
                  const isSelected = selectedModificationIds.includes(item.id);
                  const isProhibited = item.legalStatus === 'prohibited_impound';
                  const isExempt = item.legalStatus === 'factory_exempt';

                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleModSelection(item.id)}
                      data-testid={`mod-card-${item.id}`}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                        isSelected
                          ? isProhibited
                            ? 'bg-rose-950/30 border-rose-500 ring-1 ring-rose-500/30'
                            : 'bg-amber-950/20 border-amber-500 ring-1 ring-amber-500/30'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="w-4 h-4 rounded accent-amber-500"
                            />
                            <h4 className="font-bold text-white text-xs sm:text-sm">
                              {item.name[lang]}
                            </h4>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                              isProhibited
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : isExempt
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {isProhibited
                              ? 'QADAĞANDIR (Cərimə Meydançası)'
                              : isExempt
                              ? 'İcazə Tələb Olunmur'
                              : 'Texpasport Qeydi Tələb Edilir'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed">
                          {item.description[lang]}
                        </p>
                      </div>

                      <div className="pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <span className="text-slate-400 font-mono">
                          {item.statutoryCitation}
                        </span>
                        <div className="flex items-center gap-3">
                          {item.labCertificationFeeAzn > 0 && (
                            <span className="text-amber-400 font-bold">
                              AZS Lab: {formatAmount(item.labCertificationFeeAzn)}
                            </span>
                          )}
                          {item.fineRiskAzn > 0 && (
                            <span className="text-rose-400 font-semibold">
                              Cərimə: {formatAmount(item.fineRiskAzn)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Statutory State Duty & Lab Breakdown Card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-7 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Ekspert Tövsiyələri və Hüquqi Diaqnostika</span>
                  </h3>
                  <div className="space-y-2">
                    {auditResult.recommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>{rec[lang]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                  <h3 className="text-sm font-bold text-white">
                    BDYP & AZS Rəsmi Dövlət Rüsumları Smetası
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>AZS Akkreditə Laboratoriya Ekspertizası:</span>
                      <span className="font-bold text-white">
                        {formatAmount(auditResult.feesBreakdown.labExpertiseTotalAzn)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>BDYP Texpasportun Dəyişdirilməsi Rüsumu:</span>
                      <span className="font-bold text-white">
                        {formatAmount(auditResult.feesBreakdown.texpasportReplacementFeeAzn)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Növbədənkənar Texniki Baxış Diaqnostikası:</span>
                      <span className="font-bold text-white">
                        {formatAmount(auditResult.feesBreakdown.technicalInspectionFeeAzn)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>ASAN Ödəniş / Bank Xidmət Haqqı:</span>
                      <span className="font-bold text-white">
                        {formatAmount(auditResult.feesBreakdown.asanServiceCommissionAzn)}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm">
                      <span className="font-bold text-amber-400">Cəmi Rəsmi Ödəniş:</span>
                      <span className="font-black text-white text-base">
                        {formatAmount(auditResult.feesBreakdown.totalOfficialFeeAzn)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TELEMETRY (DECIBEL & SUSPENSION) */}
          {activeTab === 'telemetry' && (
            <div className="space-y-6" data-testid="tuning-telemetry-section">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Exhaust Acoustic Decibel Simulator */}
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-5 h-5 text-amber-400" />
                      <h3 className="font-bold text-white text-sm sm:text-base">
                        Səsboğucu Akustik Desibel Ölçən (AZS 597)
                      </h3>
                    </div>
                    <span
                      data-testid="exhaust-dba-badge"
                      className={`px-2.5 py-1 rounded-full text-xs font-black ${
                        exhaustDecibelDba > STATUTORY_ACOUSTIC_LIMIT_DBA
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      {exhaustDecibelDba} dBA
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    Azərbaycan Dövlət Standartına (AZS) görə minik avtomobilləri üçün maksimum səs həddi{' '}
                    <strong className="text-white">84 dBA</strong>-dır. Bu həddi aşan avadanlıqlar İXM Maddə 342.3 üzrə{' '}
                    <strong className="text-rose-400">500 – 800 AZN</strong> cərimə olunur.
                  </p>

                  <div className="space-y-2">
                    <input
                      type="range"
                      min={65}
                      max={115}
                      step={1}
                      value={exhaustDecibelDba}
                      onChange={(e) => setExhaustDecibelDba(Number(e.target.value))}
                      data-testid="exhaust-dba-slider"
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                      <span>65 dBA (Zavod Sakit)</span>
                      <span className="text-amber-400">84 dBA (Qanuni Hədd)</span>
                      <span className="text-rose-400">115 dBA (Qadağan / Popcorn)</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setExhaustDecibelDba(72)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 cursor-pointer"
                    >
                      Zavod Qazan (72 dBA)
                    </button>
                    <button
                      type="button"
                      onClick={() => setExhaustDecibelDba(81)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-xs text-amber-300 cursor-pointer"
                    >
                      Sertifikatlı AMG/Akrapovič (81 dBA)
                    </button>
                    <button
                      type="button"
                      onClick={() => setExhaustDecibelDba(98)}
                      data-testid="preset-illegal-exhaust-btn"
                      className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-xs text-rose-300 cursor-pointer"
                    >
                      Katalizatorsuz Xor-Xor (98 dBA)
                    </button>
                  </div>
                </div>

                {/* Suspension & Wheel Protrusion Simulator */}
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gauge className="w-5 h-5 text-cyan-400" />
                      <h3 className="font-bold text-white text-sm sm:text-base">
                        Asqı Klirensi (Lift/Kəsim) & Təkər Çıxıntısı
                      </h3>
                    </div>
                    <span
                      data-testid="suspension-lift-badge"
                      className={`px-2.5 py-1 rounded-full text-xs font-black ${
                        auditResult.suspensionStatus === 'illegal_cut_or_extreme'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : auditResult.suspensionStatus === 'certifiable_lift'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      {suspensionLiftMm > 0 ? `+${suspensionLiftMm} mm` : `${suspensionLiftMm} mm`}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-slate-300 font-semibold block">
                      Asqı Hündürlüyü Dəyişikliyi (-40mm Kəsim / +80mm Lift):
                    </label>
                    <input
                      type="range"
                      min={-40}
                      max={80}
                      step={5}
                      value={suspensionLiftMm}
                      onChange={(e) => setSuspensionLiftMm(Number(e.target.value))}
                      data-testid="suspension-lift-slider"
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                      <span className="text-rose-400">-40mm (Yay Kəsimi - Qadağan)</span>
                      <span className="text-emerald-400">0mm (Zavod)</span>
                      <span className="text-amber-400">+50mm (Sertifikatlı Lift)</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-semibold">
                        Təkər Şaybası / Spacer Çıxıntısı:
                      </span>
                      <span className="font-bold text-white">{wheelSpacerMm} mm</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={40}
                      step={5}
                      value={wheelSpacerMm}
                      onChange={(e) => setWheelSpacerMm(Number(e.target.value))}
                      data-testid="wheel-spacer-slider"
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs text-slate-300 font-semibold block">
                      Ön Fara və İşıqlandırma Optikası:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { id: 'oem_led', label: 'Zavod LED / Halogen' },
                          { id: 'certified_biled_lens', label: 'Linzalı Bi-LED (Sertifikatlı)' },
                          { id: 'uncertified_xenon_halogen', label: 'Lupasız Ksenon (Qadağan)' }
                        ] as { id: HeadlightOpticsType; label: string }[]
                      ).map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setHeadlightType(opt.id)}
                          data-testid={`headlight-opt-${opt.id}`}
                          className={`p-2 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                            headlightType === opt.id
                              ? opt.id === 'uncertified_xenon_halogen'
                                ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                                : 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AUTOGAS (LPG / CNG) ROI CALCULATOR */}
          {activeTab === 'autogas' && (
            <div className="space-y-6" data-testid="tuning-autogas-section">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Configuration Column */}
                <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-400" />
                    <span>Qazbalon Avadanlığı (LPG / CNG) Konfiqurasiyası</span>
                  </h3>

                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-semibold block">
                      Avtoqaz Sistemi Növü:
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {(
                        [
                          {
                            id: 'lpg_euro4',
                            title: 'LPG Propan-Butan (Avro-4 İtaliya BRC/Lovato) — 0.65 ₼/L'
                          },
                          {
                            id: 'lpg_direct_injection',
                            title: 'LPG Birbaşa Püskürtmə (GDI / TSI / SkyActiv) — 0.65 ₼/L'
                          },
                          {
                            id: 'cng_methane',
                            title: 'CNG Sıxılmış Təbii Qaz (Metan SOCAR) — 0.45 ₼/m³'
                          }
                        ] as { id: AutogasSystemType; title: string }[]
                      ).map((sys) => (
                        <button
                          key={sys.id}
                          type="button"
                          onClick={() => setAutogasSystem(sys.id)}
                          data-testid={`autogas-system-${sys.id}`}
                          className={`p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                            autogasSystem === sys.id
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {sys.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Aylıq Yürüş Məsafəsi:</span>
                      <span className="font-bold text-white" data-testid="autogas-monthly-mileage-label">
                        {monthlyMileageKm.toLocaleString()} km / ay
                      </span>
                    </div>
                    <input
                      type="range"
                      min={500}
                      max={8000}
                      step={250}
                      value={monthlyMileageKm}
                      onChange={(e) => setMonthlyMileageKm(Number(e.target.value))}
                      data-testid="autogas-mileage-slider"
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Cari Benzin Sərfiyyatı (100 km-ə):</span>
                      <span className="font-bold text-white">{petrolConsumption} L / 100km</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={22}
                      step={0.5}
                      value={petrolConsumption}
                      onChange={(e) => setPetrolConsumption(Number(e.target.value))}
                      data-testid="autogas-consumption-slider"
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-semibold block">
                      Müqayisə Edilən Benzin Markası (Tarif Şurası):
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { id: 'ai92', label: 'Aİ-92 (1.10 ₼)' },
                          { id: 'ai95', label: 'Aİ-95 (1.60 ₼)' },
                          { id: 'ai98', label: 'Aİ-98 (2.30 ₼)' }
                        ] as { id: 'ai92' | 'ai95' | 'ai98'; label: string }[]
                      ).map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setPetrolGrade(g.id)}
                          data-testid={`petrol-grade-${g.id}`}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            petrolGrade === g.id
                              ? 'bg-blue-600 text-white border-blue-500'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={includeOfficialFee}
                      onChange={(e) => setIncludeOfficialFee(e.target.checked)}
                      className="w-4 h-4 rounded accent-amber-500"
                    />
                    <span>
                      BDYP Texpasport "Qaz" qeydi və AZS Form 2B sınaq rüsumunu ({formatAmount(autogasResult.officialRegistrationFeeAzn)}) daxil et
                    </span>
                  </label>
                </div>

                {/* Results Column */}
                <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[11px] uppercase text-slate-400 font-bold block">
                          Xalis Aylıq Yanacaq Qənaəti
                        </span>
                        <span
                          className="text-2xl sm:text-3xl font-black text-emerald-400"
                          data-testid="autogas-monthly-savings"
                        >
                          {formatAmount(autogasResult.monthlySavingsAzn)} / ay
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] uppercase text-slate-400 font-bold block">
                          Özünü Ödəmə Müddəti (ROI)
                        </span>
                        <span
                          className="text-xl sm:text-2xl font-black text-amber-400"
                          data-testid="autogas-payback-months"
                        >
                          {autogasResult.paybackMonths} ay
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[11px] text-slate-400 block">
                          Cari Aylıq Benzin Xərci:
                        </span>
                        <span className="text-base font-bold text-rose-400">
                          {formatAmount(autogasResult.monthlyPetrolCostAzn)}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[11px] text-slate-400 block">
                          Aylıq Qaz (LPG/CNG) Xərci:
                        </span>
                        <span className="text-base font-bold text-emerald-400">
                          {formatAmount(autogasResult.monthlyGasCostAzn)}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[11px] text-slate-400 block">
                          Quraşdırma + BDYP Sənədləşmə:
                        </span>
                        <span className="text-base font-bold text-white">
                          {formatAmount(autogasResult.totalUpfrontInvestmentAzn)}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[11px] text-slate-400 block">
                          İllik Qənaət (12 Ay):
                        </span>
                        <span
                          className="text-base font-bold text-emerald-400"
                          data-testid="autogas-annual-savings"
                        >
                          {formatAmount(autogasResult.annualSavingsAzn)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-300 block">
                        5 İllik Xalis Mənfəət (Quraşdırma Xərci Çıxılmaqla):
                      </span>
                      <span className="text-[11px] text-slate-400">
                        CO₂ emissiyası azalması: -{autogasResult.co2ReductionPercent}% • Balon sınağı: hər {autogasResult.tankInspectionIntervalYears} ildən bir
                      </span>
                    </div>
                    <span
                      className="text-xl font-black text-emerald-400"
                      data-testid="autogas-five-year-profit"
                    >
                      {formatAmount(autogasResult.fiveYearNetProfitAzn)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACCREDITED LABS & APPOINTMENT BOOKING */}
          {activeTab === 'labs' && (
            <div className="space-y-6" data-testid="tuning-labs-section">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {['all', 'Bakı', 'Xırdalan', 'Sumqayıt', 'Gəncə'].map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setSelectedLabCity(city)}
                      data-testid={`lab-city-filter-${city}`}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedLabCity === city
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {city === 'all' ? 'Bütün Şəhərlər' : city}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                  <select
                    value={appointmentSlot}
                    onChange={(e) => setAppointmentSlot(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  >
                    <option value="09:30">09:30</option>
                    <option value="11:00">11:00</option>
                    <option value="14:30">14:30</option>
                    <option value="16:00">16:00</option>
                  </select>
                </div>
              </div>

              {bookingConfirmation && (
                <div
                  data-testid="lab-booking-confirmation-banner"
                  className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span className="font-black text-white text-sm">
                        Elektron Ekspertiza Növbəsi Təsdiqləndi: {bookingConfirmation.bookingReference}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      {bookingConfirmation.labName} • {bookingConfirmation.appointmentDate} saat{' '}
                      {bookingConfirmation.appointmentSlot} • Nömrə: {bookingConfirmation.vehiclePlate}
                    </p>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    Təxmini Rüsum: {formatAmount(bookingConfirmation.estimatedFeeAzn)}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredLabs.map((lab) => (
                  <div
                    key={lab.id}
                    data-testid={`lab-card-${lab.id}`}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-white text-sm">{lab.name}</h4>
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold shrink-0">
                          {lab.accreditationCode}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{lab.address}</span>
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>
                          {lab.phone} • {lab.workingHours} (~{lab.inspectionTimeMinutes} dəq)
                        </span>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400">★ {lab.rating} Reytinq</span>
                      <button
                        type="button"
                        onClick={() => handleBookLab(lab.id)}
                        data-testid={`book-lab-btn-${lab.id}`}
                        className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all cursor-pointer"
                      >
                        Ekspertiza Növbəsi Götür
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: OFFICIAL CERTIFICATE & REGISTRY LOOKUP */}
          {activeTab === 'certificate' && (
            <div className="space-y-6" data-testid="tuning-certificate-section">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form & Registry Lookup Column */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                    <h3 className="font-bold text-white text-sm">
                      Mülkiyyətçi və Texpasport Məlumatları
                    </h3>
                    <div className="space-y-2.5 text-xs">
                      <div>
                        <label className="text-slate-400 block mb-1">
                          Mülkiyyətçinin Soyadı, Adı, Ata adı:
                        </label>
                        <input
                          type="text"
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
                          data-testid="cert-owner-name-input"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-slate-400 block mb-1">Şəxsiyyət FİN Kodu:</label>
                          <input
                            type="text"
                            value={ownerFin}
                            maxLength={7}
                            onChange={(e) => setOwnerFin(e.target.value.toUpperCase())}
                            data-testid="cert-owner-fin-input"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono uppercase"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1">Dövlət Qeydiyyat Nişanı:</label>
                          <input
                            type="text"
                            value={plateNumber}
                            onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                            data-testid="cert-plate-input"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono uppercase"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Registry Verification Search */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <Search className="w-4 h-4 text-amber-400" />
                      <span>BDYP Konstruktiv Şəhadətnamə Reyestri Yoxlaması</span>
                    </h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Məs: BDYP-KD-2026-48102 və ya 10-MM-530"
                        value={searchCertQuery}
                        onChange={(e) => setSearchCertQuery(e.target.value)}
                        data-testid="registry-search-input"
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {SAMPLE_TUNING_CERTIFICATES.map((sample) => (
                        <button
                          key={sample.certificateNumber}
                          type="button"
                          onClick={() => setSearchCertQuery(sample.certificateNumber)}
                          data-testid={`sample-cert-btn-${sample.plateNumber}`}
                          className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] text-amber-300 font-mono cursor-pointer"
                        >
                          {sample.plateNumber} ({sample.certificateNumber})
                        </button>
                      ))}
                    </div>

                    {verifiedRegistryCert && (
                      <div
                        data-testid="verified-registry-result"
                        className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-bold text-emerald-400">
                          <span>✓ RƏSMİ REYESTRDƏ TƏSDİQLƏNDİ</span>
                          <span className="font-mono">{verifiedRegistryCert.plateNumber}</span>
                        </div>
                        <p className="text-white font-semibold">
                          {verifiedRegistryCert.vehicleTitle} — {verifiedRegistryCert.ownerName}
                        </p>
                        <p className="text-slate-300 font-mono text-[11px]">
                          {verifiedRegistryCert.texpasportSpecialNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Official Certificate Card */}
                <div className="lg:col-span-7">
                  <div
                    data-testid="official-tuning-certificate-card"
                    className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/40 shadow-xl space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block">
                          Azərbaycan Respublikası DİN Baş DYP İdarəsi & AZS
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                          NƏQLİYYAT VASİTƏSİNİN KONSTRUKTİV TƏHLÜKƏSİZLİK ŞƏHADƏTNAMƏSİ
                        </h3>
                        <p className="text-xs text-slate-400 font-mono mt-0.5" data-testid="generated-cert-number">
                          Şəhadətnamə №: {generatedCertificate.certificateNumber} • Akt:{' '}
                          {generatedCertificate.azsLabProtocolNumber}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                        <QrCode className="w-8 h-8" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Mülkiyyətçi (FİN):</span>
                        <span className="font-bold text-white">
                          {generatedCertificate.ownerName} ({generatedCertificate.ownerFin})
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Avtomobil & Nişan:</span>
                        <span className="font-bold text-amber-400">
                          {generatedCertificate.vehicleTitle} • {generatedCertificate.plateNumber}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Akustik & Klirens Ölçüsü:</span>
                        <span className="font-bold text-emerald-400">
                          {generatedCertificate.measuredDecibelDba} dBA (≤84 dBA)
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-amber-300 block">
                        Texpasport (Qeydiyyat Şəhadətnaməsi) Rəsmi Qeydi:
                      </span>
                      <p className="text-xs sm:text-sm font-mono font-bold text-white">
                        {generatedCertificate.texpasportSpecialNotes}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
                      <div className="text-slate-400">
                        <span>Etibarlılıq: </span>
                        <strong className="text-white">{generatedCertificate.validUntil}</strong>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCopyCertificate}
                          data-testid="copy-tuning-cert-btn"
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all cursor-pointer"
                        >
                          {copiedCert ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Kopyalandı</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Şəhadətnaməni Kopyala</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => window.print && window.print()}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Çap Et</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

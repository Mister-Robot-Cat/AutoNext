import React, { useState, useMemo } from 'react';
import { Vehicle, Currency, Language } from '../types/vehicle';
import {
  PlateOptionType,
  DocumentChecklistStatus,
  RegistrationAppointment,
} from '../types/registration';
import { AZERBAIJAN_REGIONS, MOCK_REGISTRATION_DIVISIONS } from '../data/mockRegistrationData';
import {
  classifyLicensePlate,
  calculateRegistrationDuties,
  calculateDocumentReadiness,
  generateRegistrationAppointment,
} from '../utils/registration';
import { formatPrice } from '../utils/i18n';
import { useScrollLock } from '../hooks/useScrollLock';
import { useKeyPress } from '../hooks/useKeyPress';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { toastManager } from '../hooks/useToast';
import {
  X,
  FileCheck2,
  Calendar,
  Clock,
  Printer,
  Copy,
  Check,
  CreditCard,
  Building2,
  CheckCircle2,
  FileText,
  Zap,
  Car,
  QrCode,
  ShieldCheck,
  Award
} from 'lucide-react';

export interface VehicleRegistrationModalProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  currency: Currency;
  lang: Language;
  onClose: () => void;
}

export const VehicleRegistrationModal: React.FC<VehicleRegistrationModalProps> = ({
  isOpen,
  vehicle,
  currency,
  lang,
  onClose,
}) => {
  useScrollLock(isOpen && !!vehicle);
  useKeyPress('Escape', onClose);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'calculator' | 'plate' | 'checklist' | 'booking'>('calculator');

  // License plate configuration
  const [plateOption, setPlateOption] = useState<PlateOptionType>('new_standard');
  const [regionCode, setRegionCode] = useState('99');
  const [plateLetters, setPlateLetters] = useState('AZ');
  const [plateNumbers, setPlateNumbers] = useState('777');
  const [isUrgent, setIsUrgent] = useState(false);

  // Document checklist state
  const [checklist, setChecklist] = useState<DocumentChecklistStatus>({
    techPassportOriginal: true,
    purchaseContract: true,
    buyerIdCard: true,
    compulsoryInsurance: true,
    inspectionTally: false,
    dutyReceipt: false,
  });

  // Booking details state
  const [selectedDivisionId, setSelectedDivisionId] = useState(MOCK_REGISTRATION_DIVISIONS[0].id);
  const [appointmentDate, setAppointmentDate] = useState('2026-10-22');
  const [appointmentTime, setAppointmentTime] = useState('11:00');
  const [buyerName, setBuyerName] = useState('Nurlan Əliyev');
  const [buyerFin, setBuyerFin] = useState('7K9LM24');
  const [buyerPhone, setBuyerPhone] = useState('+994 50 234-56-78');
  const [confirmedAppointment, setConfirmedAppointment] = useState<RegistrationAppointment | null>(null);

  const [copiedVoucher, copyVoucher] = useCopyToClipboard();

  // License plate classification
  const plateDetails = useMemo(() => {
    return classifyLicensePlate(regionCode, plateLetters, plateNumbers);
  }, [regionCode, plateLetters, plateNumbers]);

  // Financial duties breakdown
  const duties = useMemo(() => {
    if (!vehicle) return null;
    return calculateRegistrationDuties(vehicle, plateOption, plateDetails, isUrgent);
  }, [vehicle, plateOption, plateDetails, isUrgent]);

  // Document checklist readiness
  const readiness = useMemo(() => {
    return calculateDocumentReadiness(checklist);
  }, [checklist]);

  if (!isOpen || !vehicle || !duties) return null;

  const selectedDivision =
    MOCK_REGISTRATION_DIVISIONS.find((d) => d.id === selectedDivisionId) || MOCK_REGISTRATION_DIVISIONS[0];

  const handleToggleChecklist = (key: keyof DocumentChecklistStatus) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const app = generateRegistrationAppointment(
      vehicle,
      buyerName,
      buyerFin,
      buyerPhone,
      selectedDivisionId,
      appointmentDate,
      appointmentTime,
      plateOption,
      plateOption === 'keep_current' ? 'Mövcud nömrə (Saxlanılır)' : plateDetails.fullPlate,
      duties.totalAzn,
      currency,
      isUrgent
    );
    setConfirmedAppointment(app);
    toastManager.add(
      lang === 'az'
        ? 'Dövlət qeydiyyatı üçün elektron növbə talonu uğurla yaradıldı!'
        : lang === 'ru'
        ? 'Электронный талон регистрации успешно оформлен!'
        : 'Official vehicle registration appointment voucher generated!',
      'success'
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      data-testid="vehicle-registration-modal"
    >
      <div
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/70 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-600/30">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {lang === 'az'
                    ? 'BDYP Qeydiyyat & Texpasport'
                    : lang === 'ru'
                    ? 'Госрегистрация авто & Техпаспорт'
                    : 'State Vehicle Re-registration & Plate Registry'}
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase tracking-wider">
                  AR BDYP & ASAN
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {vehicle.make} {vehicle.model} ({vehicle.year}) • VIN: <span className="font-mono text-slate-300">{vehicle.vin}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            data-testid="close-registration-modal-btn"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 sm:px-6 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('calculator')}
            data-testid="tab-calculator"
            className={`py-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'calculator'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>
              {lang === 'az'
                ? 'Rüsum & Xərc Kalkulyatoru'
                : lang === 'ru'
                ? 'Калькулятор госпошлины'
                : 'State Duties & Fees'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('plate')}
            data-testid="tab-plate"
            className={`py-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'plate'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>
              {lang === 'az'
                ? 'Dövlət Nömrə Nişanı (VIP)'
                : lang === 'ru'
                ? 'Номерной знак (VIP)'
                : 'License Plate Visualizer'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            data-testid="tab-checklist"
            className={`py-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'checklist'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>
              {lang === 'az'
                ? 'Tələb Olunan Sənədlər'
                : lang === 'ru'
                ? 'Необходимые документы'
                : 'Required Documents'}
            </span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-500/20 text-sky-400">
              {readiness.completedCount}/{readiness.totalCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('booking')}
            data-testid="tab-booking"
            className={`py-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'booking'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>
              {lang === 'az'
                ? 'Elektron Növbə & Qİİ'
                : lang === 'ru'
                ? 'Электронная очередь'
                : 'E-Queue & Voucher'}
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-6" data-testid="tab-calculator-content">
              {/* Top Options Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Plate Choice Selector */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                    {lang === 'az'
                      ? 'Dövlət Qeydiyyat Nişanı (Nömrə) Seçimi'
                      : lang === 'ru'
                      ? 'Выбор номерного знака'
                      : 'License Plate Choice'}
                  </label>
                  <div className="space-y-2">
                    {[
                      {
                        id: 'keep_current' as PlateOptionType,
                        labelAz: 'Mövcud nömrəni saxlamaq (0 ₼)',
                        labelEn: 'Keep current existing plate (0 AZN)',
                        labelRu: 'Оставить текущий номер (0 AZN)',
                        desc: 'Əvvəlki sahibinin nömrəsi adınıza keçirilir',
                      },
                      {
                        id: 'new_standard' as PlateOptionType,
                        labelAz: 'Yeni standart dövlət nömrəsi almaq (35 ₼)',
                        labelEn: 'Issue new standard plate (35 AZN)',
                        labelRu: 'Получить новый стандартный номер (35 AZN)',
                        desc: 'Qİİ tərəfindən növbəti təsadüfi seriya təqdim olunur',
                      },
                      {
                        id: 'vip_combination' as PlateOptionType,
                        labelAz: 'Fərdi / Prestijli VIP kombinasiya (Tarif üzrə)',
                        labelEn: 'Custom / VIP combination plate (Auction tariff)',
                        labelRu: 'Индивидуальный / VIP номер (По тарифу)',
                        desc: `Seçilmiş: ${plateDetails.fullPlate} (+${plateDetails.surchargeAzn} ₼)`,
                      },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          plateOption === opt.id
                            ? 'bg-sky-500/10 border-sky-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="plate_option"
                          checked={plateOption === opt.id}
                          onChange={() => setPlateOption(opt.id)}
                          className="mt-1 text-sky-500 focus:ring-sky-500"
                        />
                        <div>
                          <div className="font-semibold text-xs sm:text-sm text-slate-200">
                            {lang === 'az' ? opt.labelAz : lang === 'ru' ? opt.labelRu : opt.labelEn}
                          </div>
                          <div className="text-[11px] text-slate-400">{opt.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Urgent processing and vehicle stats */}
                <div className="space-y-4">
                  {/* Urgent Switch Card */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span>ASAN Təcili Rəsmiləşdirmə</span>
                      </div>
                      <p className="text-xs text-slate-400">1 saat ərzində sürətli texpasport çapı (+20 ₼)</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsUrgent((prev) => !prev)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        isUrgent ? 'bg-sky-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isUrgent ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Eco / Green Incentive Card */}
                  {duties.isGreenExemptionApplied ? (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-1">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <Zap className="w-4 h-4 text-emerald-400" />
                        <span>Yaşıl İqtisadiyyat & EV Dövlət Güzəşti</span>
                      </div>
                      <p className="text-xs text-emerald-200/80 leading-relaxed">
                        Azərbaycan Respublikası Vergi Məcəlləsinə əsasən, elektrik və plagin-hibrid avtomobillərin qeydiyyatında mühərrik həcminə görə rüsum 100% azaddır (0 ₼).
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-300 space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                        <span>Mühərrik Həcmi:</span>
                        <span className="text-white font-bold">{vehicle.engineVolumeLiters || 2.0} L ({Math.round((vehicle.engineVolumeLiters || 2.0) * 1000)} sm³)</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                        <span>Qanunvericilik üzrə rüsum dərəcəsi:</span>
                        <span className="text-sky-400 font-bold">{duties.engineDisplacementFeeAzn} AZN</span>
                      </div>
                    </div>
                  )}

                  {/* Summary card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-tr from-sky-950/40 to-indigo-950/40 border border-sky-800/40 space-y-2">
                    <div className="text-xs uppercase font-bold text-sky-400 tracking-wider">
                      Yekun Qeydiyyat Xərci
                    </div>
                    <div className="text-3xl font-black text-white flex items-baseline gap-2">
                      <span>{formatPrice(duties.totalAzn, currency)}</span>
                      <span className="text-xs font-normal text-slate-400">
                        (~${duties.totalUsd} USD / ~€{duties.totalEur} EUR)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Bütün dövlət rüsumları, texpasport blankı, nömrə və bank komissiyaları daxildir.
                    </p>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown Table */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Qanunvericilik üzrə Maddəbəmaddə Xərc Cədvəli
                </h3>
                <div className="divide-y divide-slate-800 text-xs sm:text-sm">
                  <div className="py-2.5 flex items-center justify-between text-slate-300">
                    <span>1. Nəqliyyat vasitəsinin qeydiyyat şəhadətnaməsi (Texpasport blankı)</span>
                    <span className="font-bold text-white">{duties.certificateFeeAzn} AZN</span>
                  </div>

                  {duties.urgentProcessingSurchargeAzn > 0 && (
                    <div className="py-2.5 flex items-center justify-between text-amber-300">
                      <span>2. Təcili icra haqqı (1 saatlıq ekspres rejim)</span>
                      <span className="font-bold">+{duties.urgentProcessingSurchargeAzn} AZN</span>
                    </div>
                  )}

                  <div className="py-2.5 flex items-center justify-between text-slate-300">
                    <div>
                      <span>3. Dövlət qeydiyyat nişanı (Nömrə)</span>
                      {plateOption === 'vip_combination' && (
                        <div className="text-[11px] text-sky-400">
                          {plateDetails.tierNameAz} ({plateDetails.fullPlate})
                        </div>
                      )}
                    </div>
                    <span className="font-bold text-white">{duties.plateFeeAzn} AZN</span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between text-slate-300">
                    <div>
                      <span>4. Mühərrik həcminə və ekoloji növə görə dövlət rüsumu</span>
                      {duties.isGreenExemptionApplied && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                          Yaşıl Enerji Güzəşti
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-white">{duties.engineDisplacementFeeAzn} AZN</span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between text-slate-300">
                    <span>5. BDYP texniki baxış / qaz-analiz aktı</span>
                    <span className="font-bold text-white">{duties.technicalCheckTallyAzn} AZN</span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between text-slate-300">
                    <span>6. Notariat reyestrinə arxivləşdirmə haqqı</span>
                    <span className="font-bold text-white">{duties.notaryArchiveRecordAzn} AZN</span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between text-slate-300">
                    <span>7. Bank / AsanPay operator xidmət haqqı</span>
                    <span className="font-bold text-white">{duties.bankCommissionAzn} AZN</span>
                  </div>

                  <div className="py-3 flex items-center justify-between text-base font-black text-sky-400">
                    <span>Yekun Dövlət Ödənişi:</span>
                    <span>{duties.totalAzn} AZN</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LICENSE PLATE VISUALIZER */}
          {activeTab === 'plate' && (
            <div className="space-y-6" data-testid="tab-plate-content">
              {/* Plate Visual Component */}
              <div className="flex flex-col items-center justify-center py-6 px-4 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-inner">
                <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-4">
                  Azərbaycan Respublikası Dövlət Qeydiyyat Nişanı Standartı
                </div>

                {/* The License Plate Box */}
                <div
                  className="w-full max-w-md h-24 sm:h-28 bg-white rounded-2xl border-4 border-slate-900 shadow-2xl flex items-center px-3 sm:px-4 justify-between select-none relative overflow-hidden"
                  data-testid="license-plate-display"
                >
                  {/* Left blue strip with AZ flag */}
                  <div className="h-full flex flex-col items-center justify-between py-2 pr-3 border-r-2 border-slate-200/80">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-4 rounded-xs overflow-hidden border border-slate-300 shadow-xs flex flex-col">
                        <div className="h-1.5 bg-sky-500 w-full" />
                        <div className="h-1 bg-rose-600 w-full relative">
                          <div className="absolute inset-0 flex items-center justify-center text-[7px] text-white">★</div>
                        </div>
                        <div className="h-1.5 bg-emerald-600 w-full" />
                      </div>
                      <span className="text-[11px] font-black tracking-widest text-blue-900 mt-1">AZ</span>
                    </div>

                    {/* Microchip icon */}
                    <div className="w-3.5 h-3.5 rounded-sm bg-amber-400 border border-amber-600 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-amber-600 rounded-xs" />
                    </div>
                  </div>

                  {/* Main Plate Characters */}
                  <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3 text-slate-950 font-mono font-black text-3xl sm:text-4xl tracking-wider">
                    <span>{plateDetails.regionCode}</span>
                    <span className="text-slate-400 font-light">-</span>
                    <span>{plateDetails.letters}</span>
                    <span className="text-slate-400 font-light">-</span>
                    <span>{plateDetails.numbers}</span>
                  </div>

                  {/* Hologram strip on right */}
                  <div className="h-full w-2 bg-gradient-to-b from-slate-200 via-sky-100 to-slate-200 opacity-70" />
                </div>

                {/* Tier and surcharge badge */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    {plateDetails.tierNameAz}
                  </span>
                  {plateDetails.surchargeAzn > 0 ? (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Rüsum əlavəsi: +{plateDetails.surchargeAzn} AZN
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Standart Dövlət Rüsumu (35 AZN)
                    </span>
                  )}
                </div>
              </div>

              {/* Customizer Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Region Selector */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Region Kodu
                  </label>
                  <select
                    value={regionCode}
                    onChange={(e) => setRegionCode(e.target.value)}
                    data-testid="region-code-select"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                  >
                    {AZERBAIJAN_REGIONS.map((reg) => (
                      <option key={reg.code} value={reg.code}>
                        {reg.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Series Letters */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Hərf Seriyası (2 hərf)
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={plateLetters}
                    onChange={(e) => setPlateLetters(e.target.value.toUpperCase())}
                    data-testid="plate-letters-input"
                    placeholder="AZ"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-mono uppercase focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* 3-Digit Number */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Rəqəm Hissəsi (3 rəqəm)
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={plateNumbers}
                    onChange={(e) => setPlateNumbers(e.target.value)}
                    data-testid="plate-numbers-input"
                    placeholder="777"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Popular Combination Presets */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Məşhur Nömrə Şablonları & VIP Nümunələr
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { reg: '77', let: 'XX', num: '777', label: '77-XX-777 (Elit Qızıl)' },
                    { reg: '10', let: 'OO', num: '010', label: '10-OO-010 (Güzgü)' },
                    { reg: '99', let: 'AA', num: '001', label: '99-AA-001 (001 Seriya)' },
                    { reg: '50', let: 'BB', num: '500', label: '50-BB-500 (Yüzlük)' },
                    { reg: '90', let: 'TT', num: '999', label: '90-TT-999 (Tripl)' },
                    { reg: '99', let: 'AZ', num: '428', label: '99-AZ-428 (Sadə)' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setRegionCode(preset.reg);
                        setPlateLetters(preset.let);
                        setPlateNumbers(preset.num);
                        setPlateOption('vip_combination');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500 text-xs text-slate-300 hover:text-white transition-all cursor-pointer font-mono"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENT CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-6" data-testid="tab-checklist-content">
              {/* Readiness Meter */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-semibold text-white">Sənədlərin Hazırlıq Səviyyəsi</span>
                  <span className="font-bold text-sky-400">
                    {readiness.completedCount} / {readiness.totalCount} ({readiness.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      readiness.isFullyReady ? 'bg-emerald-500' : 'bg-sky-500'
                    }`}
                    style={{ width: `${readiness.percentage}%` }}
                  />
                </div>
                {readiness.isFullyReady ? (
                  <p className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Bütün zəruri sənədlər hazırdır! BDYP və ya ASAN şöbəsinə yaxınlaşa bilərsiniz.
                  </p>
                ) : (
                  <p className="text-xs text-amber-400 flex items-center gap-1.5">
                    Çatışmayan sənədləri tamamlayaraq qeydiyyat prosesini yubadılmadan bitirin.
                  </p>
                )}
              </div>

              {/* Checklist Items */}
              <div className="space-y-2.5">
                {[
                  {
                    key: 'techPassportOriginal' as keyof DocumentChecklistStatus,
                    title: 'Nəqliyyat Vasitəsinin Qeydiyyat Şəhadətnaməsi (Texpasportun əsli)',
                    desc: 'Avtomobilin əvvəlki sahibinin adına olan orijinal texpasport təhvil verilməlidir.',
                  },
                  {
                    key: 'purchaseContract' as keyof DocumentChecklistStatus,
                    title: 'Notariat Qaydada Təsdiqlənmiş Alqı-Satqı Müqaviləsi',
                    desc: 'Və ya diler tərəfindən verilmiş rəsmi hesab-faktura və mülkiyyət təsdiqnaməsi.',
                  },
                  {
                    key: 'buyerIdCard' as keyof DocumentChecklistStatus,
                    title: 'Alıcının Şəxsiyyət Vəsiqəsi (FİN Kod)',
                    desc: 'Azərbaycan vətəndaşının şəxsiyyət vəsiqəsi və ya əcnəbinin müvəqqəti yaşama icazəsi.',
                  },
                  {
                    key: 'compulsoryInsurance' as keyof DocumentChecklistStatus,
                    title: 'Qüvvədə Olan İcbari Avtomobil Məsuliyyəti Sığortası (İcbari Sığorta)',
                    desc: 'Elektron İsbari Sığorta Bürosu (İSB) bazasında aktiv statusda olmalıdır.',
                  },
                  {
                    key: 'inspectionTally' as keyof DocumentChecklistStatus,
                    title: 'BDYP Texniki Müayinə və Qaz-Analiz Aktı',
                    desc: 'DYP laboratoriyasında avtomobilin ban, şassi və mühərrik nömrələrinin tutuşdurulması arayışı.',
                  },
                  {
                    key: 'dutyReceipt' as keyof DocumentChecklistStatus,
                    title: 'Dövlət Rüsumunun Ödəniş Qəbzi',
                    desc: 'AsanPay, Hökumət Ödəniş Portalı (HÖP) və ya bank terminalı vasitəsilə ödənilmiş rüsum sənədi.',
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    onClick={() => handleToggleChecklist(item.key)}
                    className={`p-4 rounded-2xl border flex items-start gap-3.5 cursor-pointer transition-all ${
                      checklist[item.key]
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors flex-shrink-0 ${
                        checklist[item.key]
                          ? 'bg-sky-500 border-sky-500 text-white'
                          : 'border-slate-600 bg-slate-800'
                      }`}
                    >
                      {checklist[item.key] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold">{item.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: QUEUE BOOKING & E-TALON */}
          {activeTab === 'booking' && (
            <div className="space-y-6" data-testid="tab-booking-content">
              {confirmedAppointment ? (
                /* Confirmed Voucher Display */
                <div className="p-6 rounded-3xl bg-slate-950 border border-sky-500/40 shadow-2xl space-y-6">
                  {/* Voucher Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400">
                          Azərbaycan Respublikası DİN BDYP İdarəsi
                        </span>
                        <h3 className="text-xl font-black text-white">Elektron Növbə Talonu (E-Voucher)</h3>
                      </div>
                    </div>

                    <div className="text-left sm:text-right font-mono">
                      <div className="text-xs text-slate-400">Talon №:</div>
                      <div className="text-lg font-black text-sky-400">{confirmedAppointment.voucherId}</div>
                    </div>
                  </div>

                  {/* Voucher Body Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3 text-xs sm:text-sm">
                      <div>
                        <span className="text-slate-400 block text-xs">Müraciətçi:</span>
                        <strong className="text-white text-base">{confirmedAppointment.buyerFullName}</strong>
                        <div className="text-slate-400 text-xs">FİN: {confirmedAppointment.buyerFinCode} • {confirmedAppointment.buyerPhone}</div>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-xs">Qeydiyyat Bölməsi:</span>
                        <strong className="text-white">{confirmedAppointment.divisionName}</strong>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[11px] text-slate-400 block">Tarix:</span>
                          <strong className="text-white font-mono">{confirmedAppointment.appointmentDate}</strong>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[11px] text-slate-400 block">Saat:</span>
                          <strong className="text-sky-400 font-mono text-base">{confirmedAppointment.appointmentTime}</strong>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-xs">Rəsmiləşdirilən Avtomobil:</span>
                        <strong className="text-white">{confirmedAppointment.vehicleTitle}</strong>
                        <div className="font-mono text-xs text-slate-400">VIN: {confirmedAppointment.vehicleVin}</div>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-xs">Seçilmiş Nömrə:</span>
                        <span className="inline-block px-3 py-1 rounded-lg bg-white text-slate-900 font-mono font-black text-sm">
                          {confirmedAppointment.targetPlate}
                        </span>
                      </div>
                    </div>

                    {/* QR Code and Payment summary */}
                    <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-4">
                      <div className="p-4 bg-white rounded-2xl shadow-lg">
                        <QrCode className="w-28 h-28 text-slate-950" />
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block">Ödəniləcək Məbləğ:</span>
                        <span className="text-2xl font-black text-white">{confirmedAppointment.totalFeeFormatted}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 max-w-xs">
                        Talonu ASAN və ya BDYP terminalına yaxınlaşdıqda QR kodu oxudun.
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={handlePrint}
                      className="flex-1 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-sky-600/30"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Talonu Çap Et</span>
                    </button>

                    <button
                      onClick={() => {
                        copyVoucher(
                          `AutoNext BDYP Növbə Talonu: ${confirmedAppointment.voucherId}\nTarix: ${confirmedAppointment.appointmentDate} ${confirmedAppointment.appointmentTime}\nÜnvan: ${confirmedAppointment.divisionName}\nNömrə: ${confirmedAppointment.targetPlate}\nMəbləğ: ${confirmedAppointment.totalFeeFormatted}`
                        );
                        toastManager.add('Talon məlumatları kopyalandı!', 'success');
                      }}
                      className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {copiedVoucher ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>Məlumatı Kopyala</span>
                    </button>

                    <button
                      onClick={() => setConfirmedAppointment(null)}
                      className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-semibold text-xs transition-all cursor-pointer"
                    >
                      Yeni Növbə Götür
                    </button>
                  </div>
                </div>
              ) : (
                /* Appointment Booking Form */
                <form onSubmit={handleCreateAppointment} className="space-y-6" data-testid="booking-form">
                  {/* Division Selection */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Qeydiyyat Mərkəzi Seçin (ASAN / BDYP)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {MOCK_REGISTRATION_DIVISIONS.map((div) => (
                        <div
                          key={div.id}
                          onClick={() => setSelectedDivisionId(div.id)}
                          className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                            selectedDivisionId === div.id
                              ? 'bg-sky-500/10 border-sky-500 text-white'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <h4 className="font-bold text-xs sm:text-sm text-white">{div.nameAz}</h4>
                          <p className="text-[11px] text-slate-400 mt-1">{div.address}</p>
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                            <span>Pəncərə: {div.counterCount}</span>
                            <span>•</span>
                            <span className="text-emerald-400">Gözləmə: ~{div.avgWaitMinutes} dəq</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Buyer Data inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Alıcının Adı və Soyadı
                      </label>
                      <input
                        type="text"
                        required
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        data-testid="buyer-name-input"
                        placeholder="Nurlan Əliyev"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Şəxsiyyət Vəsiqəsi FİN Kodu
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={7}
                        value={buyerFin}
                        onChange={(e) => setBuyerFin(e.target.value.toUpperCase())}
                        data-testid="buyer-fin-input"
                        placeholder="7K9LM24"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-mono uppercase focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Əlaqə Telefonu
                      </label>
                      <input
                        type="tel"
                        required
                        value={buyerPhone}
                        onChange={(e) => setBuyerPhone(e.target.value)}
                        data-testid="buyer-phone-input"
                        placeholder="+994 50 123-45-67"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  {/* Date and Slot selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Qəbul Tarixi
                      </label>
                      <input
                        type="date"
                        required
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        data-testid="appointment-date-input"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Uyğun Saat Aralığı
                      </label>
                      <select
                        value={appointmentTime}
                        onChange={(e) => setAppointmentTime(e.target.value)}
                        data-testid="appointment-time-select"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                      >
                        {selectedDivision.availableSlots.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot} (Mövcuddur)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    data-testid="submit-booking-btn"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Elektron Növbə Talonu Yarat & Təsdiqlə ({duties.totalAzn} AZN)</span>
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

import React, { useState, useMemo } from 'react';
import { Currency, Language, Vehicle } from '../types/vehicle';
import {
  LicenseCategoryCode,
  LicenseServiceType,
  TransmissionLicenseType,
  VehicleTransmissionType,
  calculateLicenseServiceFees,
  convertLicenseCurrency,
  determineVehicleLicenseParameters,
  evaluateLicenseCategoryCompliance,
  evaluateTheoreticalExam,
  generateElectronicLicenseExtract,
  ElectronicLicenseRecord,
} from '../utils/driverLicense';
import {
  BDYP_EXAM_AND_RENEWAL_CENTERS,
  BDYP_EXAM_TICKET_QUESTIONS,
  LICENSE_CATEGORIES_CATALOG,
  SAMPLE_ELECTRONIC_LICENSE_RECORDS,
} from '../data/mockDriverLicenseData';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Award,
  BookOpen,
  Building2,
  FileBadge,
  Search,
  Copy,
  Check,
  Printer,
  Truck,
  Globe,
  Clock,
  Scale,
  UserCheck,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';

interface DriverLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: Vehicle | null;
  currency: Currency;
  lang: Language;
}

type ModalTab = 'audit' | 'fees' | 'exam' | 'centers' | 'extract';

const ALL_CATEGORIES: LicenseCategoryCode[] = [
  'A1',
  'A',
  'B',
  'BE',
  'C1',
  'C',
  'CE',
  'D1',
  'D',
];

export const DriverLicenseModal: React.FC<DriverLicenseModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  currency,
}) => {
  const initialVehicleParams = useMemo(
    () => determineVehicleLicenseParameters(vehicle),
    [vehicle]
  );

  const [activeTab, setActiveTab] = useState<ModalTab>('audit');

  // Tab 1: Category & Trailer Towing (B vs BE) Audit State
  const [driverCategories, setDriverCategories] = useState<LicenseCategoryCode[]>(['B']);
  const [driverAgeYears, setDriverAgeYears] = useState<number>(28);
  const [drivingExperienceYears, setDrivingExperienceYears] = useState<number>(5);
  const [licenseTransmissionScope, setLicenseTransmissionScope] =
    useState<TransmissionLicenseType>('manual_unrestricted');
  const [isLicenseExpired, setIsLicenseExpired] = useState<boolean>(false);

  const [vehicleGvwKg, setVehicleGvwKg] = useState<number>(initialVehicleParams.vehicleGvwKg);
  const [vehicleCurbWeightKg, setVehicleCurbWeightKg] = useState<number>(
    initialVehicleParams.vehicleCurbWeightKg
  );
  const [passengerSeatsExcludingDriver, setPassengerSeatsExcludingDriver] = useState<number>(
    initialVehicleParams.passengerSeatsExcludingDriver
  );
  const [vehicleTransmission, setVehicleTransmission] = useState<VehicleTransmissionType>(
    initialVehicleParams.vehicleTransmission
  );
  const [isMotorcycle, setIsMotorcycle] = useState<boolean>(false);
  const [trailerGvwKg, setTrailerGvwKg] = useState<number>(0);

  // Tab 2: ASAN & BDYP State Duties Calculator State
  const [serviceType, setServiceType] = useState<LicenseServiceType>('expiry_or_name_renewal');
  const [hasHealthRestrictionNote, setHasHealthRestrictionNote] = useState<boolean>(false);
  const [requireMedicalCertificate, setRequireMedicalCertificate] = useState<boolean>(false);
  const [includeIdpAddOn, setIncludeIdpAddOn] = useState<boolean>(false);
  const [isAsanExpressCenter, setIsAsanExpressCenter] = useState<boolean>(true);

  // Tab 3: BDYP Theoretical Exam Simulator State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);

  // Tab 4: BDYP MERO & ASAN Centers Radar State
  const [centerCityFilter, setCenterCityFilter] = useState<string>('ALL');
  const [onlyAutodromFilter, setOnlyAutodromFilter] = useState<boolean>(false);
  const [selectedCenterId, setSelectedCenterId] = useState<string>(
    BDYP_EXAM_AND_RENEWAL_CENTERS[0].id
  );

  // Tab 5: Electronic Extract & Registry State
  const [holderFullName, setHolderFullName] = useState<string>('MƏMMƏDOV RƏŞAD ELÇİN OĞLU');
  const [holderFin, setHolderFin] = useState<string>('4K8M2P9');
  const [birthYear, setBirthYear] = useState<number>(1995);
  const [bloodGroup, setBloodGroup] = useState<string>('II (A) Rh+');
  const [generatedExtract, setGeneratedExtract] = useState<ElectronicLicenseRecord | null>(null);
  const [registrySearchQuery, setRegistrySearchQuery] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₼';
  const formatMoney = (amountAzn: number) => {
    const converted = convertLicenseCurrency(amountAzn, currency);
    return `${converted.toLocaleString('en-US', {
      minimumFractionDigits: currency === 'AZN' ? 0 : 2,
      maximumFractionDigits: 2,
    })} ${currencySymbol}`;
  };

  const categoryAuditResult = useMemo(
    () =>
      evaluateLicenseCategoryCompliance({
        driverCategories,
        driverAgeYears,
        drivingExperienceYears,
        licenseTransmissionScope,
        isLicenseExpired,
        vehicleGvwKg,
        vehicleCurbWeightKg,
        passengerSeatsExcludingDriver,
        vehicleTransmission,
        isMotorcycle,
        trailerGvwKg,
      }),
    [
      driverCategories,
      driverAgeYears,
      drivingExperienceYears,
      licenseTransmissionScope,
      isLicenseExpired,
      vehicleGvwKg,
      vehicleCurbWeightKg,
      passengerSeatsExcludingDriver,
      vehicleTransmission,
      isMotorcycle,
      trailerGvwKg,
    ]
  );

  const feeCalculationResult = useMemo(
    () =>
      calculateLicenseServiceFees({
        serviceType,
        driverAgeYears,
        hasHealthRestrictionNote,
        requireMedicalCertificate,
        includeIdpAddOn,
        isAsanExpressCenter,
      }),
    [
      serviceType,
      driverAgeYears,
      hasHealthRestrictionNote,
      requireMedicalCertificate,
      includeIdpAddOn,
      isAsanExpressCenter,
    ]
  );

  const examSimulationResult = useMemo(
    () => evaluateTheoreticalExam(BDYP_EXAM_TICKET_QUESTIONS, selectedAnswers),
    [selectedAnswers]
  );

  const filteredCenters = useMemo(() => {
    return BDYP_EXAM_AND_RENEWAL_CENTERS.filter((c) => {
      if (centerCityFilter !== 'ALL' && c.city !== centerCityFilter) return false;
      if (onlyAutodromFilter && !c.hasPracticalAutodrom) return false;
      return true;
    });
  }, [centerCityFilter, onlyAutodromFilter]);

  const activeExtract = useMemo(() => {
    if (generatedExtract) return generatedExtract;
    const selectedCenter =
      BDYP_EXAM_AND_RENEWAL_CENTERS.find((c) => c.id === selectedCenterId) ||
      BDYP_EXAM_AND_RENEWAL_CENTERS[0];
    return generateElectronicLicenseExtract({
      holderFullName,
      holderFin,
      birthYear,
      bloodGroup,
      categories: driverCategories,
      transmissionScope: licenseTransmissionScope,
      includeIdp: includeIdpAddOn || serviceType === 'international_driving_permit_idp',
      issuingCenterName: selectedCenter.name,
    });
  }, [
    generatedExtract,
    selectedCenterId,
    holderFullName,
    holderFin,
    birthYear,
    bloodGroup,
    driverCategories,
    licenseTransmissionScope,
    includeIdpAddOn,
    serviceType,
  ]);

  const allRegistryRecords = useMemo(() => {
    const list = [...SAMPLE_ELECTRONIC_LICENSE_RECORDS];
    if (
      generatedExtract &&
      !list.some((r) => r.licenseNumber === generatedExtract.licenseNumber)
    ) {
      list.unshift(generatedExtract);
    }
    if (!registrySearchQuery.trim()) return list;
    const q = registrySearchQuery.trim().toUpperCase();
    return list.filter(
      (r) =>
        r.licenseNumber.toUpperCase().includes(q) ||
        r.holderFin.toUpperCase().includes(q) ||
        r.holderFullName.toUpperCase().includes(q)
    );
  }, [generatedExtract, registrySearchQuery]);

  if (!isOpen) return null;

  const toggleDriverCategory = (code: LicenseCategoryCode) => {
    setDriverCategories((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSelectExamAnswer = (questionId: string, optionIdx: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const handleAutoFillCorrectExam = () => {
    const allCorrect: Record<string, number> = {};
    for (const q of BDYP_EXAM_TICKET_QUESTIONS) {
      allCorrect[q.id] = q.correctOptionIndex;
    }
    setSelectedAnswers(allCorrect);
    setIsExamSubmitted(true);
  };

  const handleResetExam = () => {
    setSelectedAnswers({});
    setIsExamSubmitted(false);
  };

  const handleGenerateExtract = () => {
    const selectedCenter =
      BDYP_EXAM_AND_RENEWAL_CENTERS.find((c) => c.id === selectedCenterId) ||
      BDYP_EXAM_AND_RENEWAL_CENTERS[0];
    const record = generateElectronicLicenseExtract({
      holderFullName,
      holderFin,
      birthYear,
      bloodGroup,
      categories: driverCategories,
      transmissionScope: licenseTransmissionScope,
      includeIdp: includeIdpAddOn || serviceType === 'international_driving_permit_idp',
      issuingCenterName: selectedCenter.name,
    });
    setGeneratedExtract(record);
    setActiveTab('extract');
  };

  const handleCopyLicenseCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(activeExtract.licenseNumber).catch(() => {});
    }
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        data-testid="driver-license-modal"
        className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[93vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  BDYP & ASAN Sürücülük Vəsiqəsi, Kateqoriya (B/BE) və İmtahan Portalı
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  YHQ Maddə 33–35 • İXM 332
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {vehicle
                  ? `${vehicle.title} (${vehicle.year}) üçün sürücülük kateqoriyası, qoşqu (B vs BE) çəki həddi və dövlət rüsumu auditoru`
                  : 'Rəsmi kateqoriya uyğunluğu, qoşqu/karvan kütlə kalkulyatoru, Beynəlxalq Vəsiqə (IDP) və nəzəri imtahan simulyatoru'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            data-testid="close-driver-license-modal"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 sm:px-6 pt-3 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            data-testid="tab-license-audit"
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'audit'
                ? 'border-indigo-400 text-indigo-300 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Kateqoriya & Qoşqu (B/BE) Auditoru</span>
          </button>

          <button
            type="button"
            data-testid="tab-license-fees"
            onClick={() => setActiveTab('fees')}
            className={`px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'fees'
                ? 'border-indigo-400 text-indigo-300 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>ASAN Vəsiqə & Rüsum Kalkulyatoru</span>
          </button>

          <button
            type="button"
            data-testid="tab-license-exam"
            onClick={() => setActiveTab('exam')}
            className={`px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'exam'
                ? 'border-indigo-400 text-indigo-300 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>BDYP Nəzəri İmtahan (10 Sual)</span>
          </button>

          <button
            type="button"
            data-testid="tab-license-centers"
            onClick={() => setActiveTab('centers')}
            className={`px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'centers'
                ? 'border-indigo-400 text-indigo-300 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>MERO & ASAN Mərkəzləri ({BDYP_EXAM_AND_RENEWAL_CENTERS.length})</span>
          </button>

          <button
            type="button"
            data-testid="tab-license-extract"
            onClick={() => setActiveTab('extract')}
            className={`px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'extract'
                ? 'border-indigo-400 text-indigo-300 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileBadge className="w-4 h-4" />
            <span>E-Vəsiqə Çıxarışı & Reyestr</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: CATEGORY & TRAILER TOWING (B vs BE) AUDITOR */}
          {activeTab === 'audit' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Configuration Column */}
              <div className="lg:col-span-7 space-y-5">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-indigo-400" />
                      1. Sürücünün Mövcud Vəsiqə Kateqoriyaları və Göstəriciləri
                    </h3>
                    <span className="text-[11px] text-slate-400">YHQ Maddə 33–35</span>
                  </div>

                  {/* Category Multi-Toggle Buttons */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">
                      Vəsiqənizdə açıq olan kateqoriyaları seçin:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ALL_CATEGORIES.map((code) => {
                        const isSelected = driverCategories.includes(code);
                        return (
                          <button
                            key={code}
                            type="button"
                            data-testid={`toggle-driver-cat-${code}`}
                            onClick={() => toggleDriverCategory(code)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/25'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            {code}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Driver Age & Transmission Scope */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Sürücünün Yaşı: <strong className="text-white">{driverAgeYears} yaş</strong>
                      </label>
                      <input
                        type="range"
                        min={16}
                        max={80}
                        value={driverAgeYears}
                        data-testid="driver-age-slider"
                        onChange={(e) => setDriverAgeYears(Number(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Sürücülük Stajı: <strong className="text-white">{drivingExperienceYears} il</strong>
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={40}
                        value={drivingExperienceYears}
                        onChange={(e) => setDrivingExperienceYears(Number(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Vəsiqədə Transmissiya Qeydi
                      </label>
                      <select
                        value={licenseTransmissionScope}
                        data-testid="license-transmission-select"
                        onChange={(e) =>
                          setLicenseTransmissionScope(e.target.value as TransmissionLicenseType)
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      >
                        <option value="manual_unrestricted">
                          MT / Məhdudiyyətsiz (Mexaniki + Avtomat)
                        </option>
                        <option value="automatic_only_AT">
                          AT Qeydi (Yalnız Avtomatik Ötürücü)
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isLicenseExpired}
                        data-testid="license-expired-checkbox"
                        onChange={(e) => setIsLicenseExpired(e.target.checked)}
                        className="rounded border-slate-700 accent-rose-500"
                      />
                      <span>Vəsiqənin 10 illik etibarlılıq müddəti bitib (İXM 332.1 yoxlaması)</span>
                    </label>
                  </div>
                </div>

                {/* Vehicle & Trailer Towing Weight Configurator */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Truck className="w-4 h-4 text-cyan-400" />
                      2. Nəqliyyat Vasitəsi və Qoşqu / Treyler Çəki Parametrləri (YHQ Maddə 34)
                    </h3>
                    <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isMotorcycle}
                        onChange={(e) => setIsMotorcycle(e.target.checked)}
                        className="rounded border-slate-700 accent-cyan-500"
                      />
                      <span>Motosiklet (A)</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Avtomobilin İcazə Verilən Maksimum Kütləsi (GVW)
                      </label>
                      <input
                        type="number"
                        value={vehicleGvwKg}
                        data-testid="vehicle-gvw-input"
                        onChange={(e) => setVehicleGvwKg(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Avtomobilin Yüksüz Kütləsi (Curb Weight, kq)
                      </label>
                      <input
                        type="number"
                        value={vehicleCurbWeightKg}
                        data-testid="vehicle-curb-input"
                        onChange={(e) => setVehicleCurbWeightKg(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Sərnişin Oturacaqları (Sürücüdən əlavə)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={55}
                        value={passengerSeatsExcludingDriver}
                        data-testid="passenger-seats-input"
                        onChange={(e) => setPassengerSeatsExcludingDriver(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Avtomobilin Sürətlər Qutusu (Transmissiya)
                      </label>
                      <select
                        value={vehicleTransmission}
                        data-testid="vehicle-transmission-select"
                        onChange={(e) =>
                          setVehicleTransmission(e.target.value as VehicleTransmissionType)
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      >
                        <option value="automatic">Avtomatik (AT / DCT / CVT)</option>
                        <option value="manual">Mexaniki (MT — debriyaj pedalı ilə)</option>
                      </select>
                    </div>
                  </div>

                  {/* Trailer / Caravan Weight Presets & Slider */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-300">
                        Qoşqu / Karvan / Avtodaşıyıcı Kütləsi:{' '}
                        <strong className="text-cyan-400">{trailerGvwKg} kq</strong>
                      </label>
                      <span className="text-xs text-slate-400">
                        Avtoqatar Cəmi:{' '}
                        <strong className="text-white">
                          {categoryAuditResult.totalTrainGvwKg} kq
                        </strong>
                      </span>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={3500}
                      step={50}
                      value={trailerGvwKg}
                      data-testid="trailer-gvw-slider"
                      onChange={(e) => setTrailerGvwKg(Number(e.target.value))}
                      className="w-full accent-cyan-500"
                    />

                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'Qoşqusuz (0 kq)', kg: 0 },
                        { label: 'Yüngül Bağ Qoşqusu (550 kq — B)', kg: 550 },
                        { label: 'Orta Qoşqu (900 kq)', kg: 900 },
                        { label: 'Turist Karvanı (1,600 kq — BE)', kg: 1600 },
                        { label: 'Avtodaşıyıcı Лафет (2,200 kq — BE)', kg: 2200 },
                      ].map((preset) => (
                        <button
                          key={preset.kg}
                          type="button"
                          data-testid={`trailer-preset-${preset.kg}`}
                          onClick={() => setTrailerGvwKg(preset.kg)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                            trailerGvwKg === preset.kg
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Audit Verdict Column */}
              <div className="lg:col-span-5 space-y-4">
                <div
                  data-testid="category-audit-verdict-card"
                  className={`p-5 rounded-2xl border space-y-4 ${
                    categoryAuditResult.isCompliant
                      ? 'bg-emerald-950/25 border-emerald-500/40'
                      : 'bg-rose-950/30 border-rose-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {categoryAuditResult.isCompliant ? (
                        <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-7 h-7 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                          BDYP Hüquqi Ekspertiza Nəticəsi
                        </span>
                        <h4
                          data-testid="audit-verdict-title"
                          className={`text-base font-black ${
                            categoryAuditResult.isCompliant ? 'text-emerald-300' : 'text-rose-300'
                          }`}
                        >
                          {categoryAuditResult.verdictTitle}
                        </h4>
                      </div>
                    </div>

                    <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center shrink-0">
                      <span className="text-[10px] text-slate-400 block">Tələb Olunan</span>
                      <span
                        data-testid="required-category-badge"
                        className="text-lg font-black text-indigo-400"
                      >
                        {categoryAuditResult.requiredCategory}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {categoryAuditResult.statutoryExplanation}
                  </p>

                  {/* Key Telemetry Metrics */}
                  <div className="grid grid-cols-2 gap-2.5 pt-2">
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                      <span className="text-[11px] text-slate-400 block">Avtoqatarın Kütləsi</span>
                      <span className="text-sm font-black text-white">
                        {categoryAuditResult.totalTrainGvwKg.toLocaleString()} kq
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        B həddi: ≤3,500 kq (və ya qoşqu ≤750 kq)
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                      <span className="text-[11px] text-slate-400 block">İXM Maddə 332 Cərimə Riski</span>
                      <span
                        data-testid="audit-fine-amount"
                        className={`text-sm font-black ${
                          categoryAuditResult.fineAmountAzn > 0
                            ? 'text-rose-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {categoryAuditResult.fineAmountAzn === 0
                          ? '0 AZN (Risk Yoxdur)'
                          : formatMoney(categoryAuditResult.fineAmountAzn)}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {categoryAuditResult.violationArticle || 'Qanunvericiliyə tam uyğundur'}
                      </span>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/70">
                    <span className="text-xs font-bold text-slate-300 block">
                      Tövsiyə və Hüquqi Addımlar:
                    </span>
                    {categoryAuditResult.recommendations.map((rec, i) => (
                      <div key={i} className="text-xs text-slate-300 flex items-start gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Statutory Reference Table of Categories */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    YHQ Maddə 33–34 Kateqoriya Normativləri (Qısa Yaddaş)
                  </h4>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {LICENSE_CATEGORIES_CATALOG.map((cat) => (
                      <div
                        key={cat.code}
                        className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-start justify-between gap-2 text-xs"
                      >
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-black">
                              {cat.code}
                            </span>
                            <span>{cat.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">{cat.description}</p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                          Min {cat.minAgeYears} yaş
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ASAN & BDYP STATE DUTIES CALCULATOR */}
          {activeTab === 'fees' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-indigo-400" />
                    Xidmət Növü və Dövlət Rüsumu Seçimi («Dövlət rüsumu haqqında» Qanun Maddə 18)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      {
                        id: 'expiry_or_name_renewal',
                        title: 'Müddəti Bitmiş Vəsiqənin Yenilənməsi',
                        sub: 'ASAN Xidmət / BDYP (30 AZN, İmtahansız)',
                      },
                      {
                        id: 'first_time_issuance',
                        title: 'İlk Dəfə Sürücülük Vəsiqəsinin Alınması',
                        sub: 'Nəzəri + Praktik İmtahan (20 + 30 AZN)',
                      },
                      {
                        id: 'international_driving_permit_idp',
                        title: 'Beynəlxalq Sürücülük Vəsiqəsi (IDP)',
                        sub: '1968 Vyana Konvensiyası (30 AZN, 3 illik)',
                      },
                      {
                        id: 'foreign_license_exchange_vienna',
                        title: 'Xarici Vəsiqənin Milli Vəsiqəyə Dəyişdirilməsi',
                        sub: 'İmtahansız konvertasiya (YHQ Maddə 35.8)',
                      },
                      {
                        id: 'add_new_category_upgrade',
                        title: 'Yeni Kateqoriya (BE / C / CE / D) Əlavəsi',
                        sub: 'İmtahan + Yeni Çipli Vəsiqə (20 + 30 AZN)',
                      },
                      {
                        id: 'lost_or_damaged_replacement',
                        title: 'İtirilmiş / Yararsız Vəsiqənin Bərpası',
                        sub: 'ASAN Xidmət / BDYP Dublikat (30 AZN)',
                      },
                    ].map((srv) => (
                      <button
                        key={srv.id}
                        type="button"
                        data-testid={`service-type-${srv.id}`}
                        onClick={() => setServiceType(srv.id as LicenseServiceType)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          serviceType === srv.id
                            ? 'bg-indigo-600/20 border-indigo-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-bold">{srv.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{srv.sub}</div>
                      </button>
                    ))}
                  </div>

                  {/* Age & Additional Checkboxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Müraciətçinin Yaşı: <strong className="text-white">{driverAgeYears} yaş</strong>
                      </label>
                      <input
                        type="range"
                        min={16}
                        max={85}
                        value={driverAgeYears}
                        data-testid="fee-age-slider"
                        onChange={(e) => setDriverAgeYears(Number(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                      <span className="text-[11px] text-slate-500">
                        60+ yaşda tibbi arayış (Forma AZS-083) məcburidir
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-300">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeIdpAddOn}
                          data-testid="include-idp-checkbox"
                          onChange={(e) => setIncludeIdpAddOn(e.target.checked)}
                          className="rounded border-slate-700 accent-indigo-500"
                        />
                        <span>Əlavə olaraq Beynəlxalq Vəsiqə (IDP +30 AZN) sifariş et</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={requireMedicalCertificate}
                          data-testid="require-medical-checkbox"
                          onChange={(e) => setRequireMedicalCertificate(e.target.checked)}
                          className="rounded border-slate-700 accent-indigo-500"
                        />
                        <span>Poliklinika Tibbi E-Arayışı (Forma AZS-083 +40 AZN)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasHealthRestrictionNote}
                          onChange={(e) => setHasHealthRestrictionNote(e.target.checked)}
                          className="rounded border-slate-700 accent-indigo-500"
                        />
                        <span>Səhhətlə bağlı xüsusi tibbi göstəriş var (2 illik müddət)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Fee Summary Card */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/40 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[11px] text-indigo-400 font-bold uppercase">
                        Rəsmi Rüsum və Müddət Hesablaması
                      </span>
                      <h4 className="text-sm font-black text-white mt-0.5">
                        {feeCalculationResult.serviceLabel}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block">Yekun Ödəniş</span>
                      <span
                        data-testid="total-license-fee"
                        className="text-xl font-black text-emerald-400"
                      >
                        {formatMoney(feeCalculationResult.totalCostAzn)}
                      </span>
                    </div>
                  </div>

                  {/* Itemized Breakdown */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Vəsiqə blankı dövlət rüsumu (Maddə 18):</span>
                      <span className="font-bold text-white">
                        {formatMoney(feeCalculationResult.stateDutyCardAzn)}
                      </span>
                    </div>
                    {feeCalculationResult.examFeeAzn > 0 && (
                      <div className="flex justify-between text-slate-300">
                        <span>BDYP imtahan qəbulu rüsumu:</span>
                        <span className="font-bold text-white">
                          {formatMoney(feeCalculationResult.examFeeAzn)}
                        </span>
                      </div>
                    )}
                    {feeCalculationResult.medicalCertificateFeeAzn > 0 && (
                      <div className="flex justify-between text-slate-300">
                        <span>Tibbi E-Arayış (Forma AZS-083):</span>
                        <span className="font-bold text-amber-400">
                          {formatMoney(feeCalculationResult.medicalCertificateFeeAzn)}
                        </span>
                      </div>
                    )}
                    {feeCalculationResult.notaryTranslationFeeAzn > 0 && (
                      <div className="flex justify-between text-slate-300">
                        <span>Notarial tərcümə və təsdiq rüsumu:</span>
                        <span className="font-bold text-white">
                          {formatMoney(feeCalculationResult.notaryTranslationFeeAzn)}
                        </span>
                      </div>
                    )}
                    {feeCalculationResult.idpAddonFeeAzn > 0 && (
                      <div className="flex justify-between text-slate-300">
                        <span>Beynəlxalq Sürücülük Vəsiqəsi (IDP):</span>
                        <span className="font-bold text-cyan-400">
                          {formatMoney(feeCalculationResult.idpAddonFeeAzn)}
                        </span>
                      </div>
                    )}
                    {feeCalculationResult.asanServiceFeeAzn > 0 && (
                      <div className="flex justify-between text-slate-400">
                        <span>ASAN Ödəniş / Bank xidmət haqqı:</span>
                        <span>{formatMoney(feeCalculationResult.asanServiceFeeAzn)}</span>
                      </div>
                    )}
                  </div>

                  {/* Validity & Exam Badges */}
                  <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-800">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">
                        Yeni Vəsiqənin Müddəti (YHQ 35.6)
                      </span>
                      <span
                        data-testid="license-validity-years"
                        className="text-sm font-black text-indigo-300"
                      >
                        {feeCalculationResult.validityYears} il ({feeCalculationResult.expiryYear}-ci ilədək)
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">İmtahan Tələbi</span>
                      <span className="text-sm font-black text-white">
                        {feeCalculationResult.requiresTheoreticalExam
                          ? 'Nəzəri + Praktik'
                          : 'İmtahansız (15 dəq)'}
                      </span>
                    </div>
                  </div>

                  {/* Required Documents List */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <span className="text-xs font-bold text-slate-300 block">
                      Tələb Olunan Sənədlər Siyahısı:
                    </span>
                    {feeCalculationResult.requiredDocuments.map((doc, idx) => (
                      <div key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{doc}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    data-testid="generate-extract-from-fees-btn"
                    onClick={handleGenerateExtract}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Rəqəmsal Sürücülük Vəsiqəsi Çıxarışı & IDP Yarat
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BDYP THEORETICAL EXAM SIMULATOR */}
          {activeTab === 'exam' && (
            <div className="space-y-5">
              {/* Exam Header Banner */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-indigo-400" />
                    BDYP Rəsmi Nəzəri İmtahan Simulyatoru (10 Sual • Keçid Normativi: Minimum 9/10 Doğru)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Azərbaycan Respublikası «Yol hərəkəti haqqında» Qanununun maddələrinə əsaslanan rəsmi imtahan bileti
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    data-testid="exam-autofill-correct-btn"
                    onClick={handleAutoFillCorrectExam}
                    className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
                  >
                    Bütün Doğru Cavabları Doldur (Demo)
                  </button>
                  <button
                    type="button"
                    data-testid="exam-reset-btn"
                    onClick={handleResetExam}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Sıfırla
                  </button>
                </div>
              </div>

              {/* Live Exam Score Banner */}
              <div
                data-testid="exam-score-summary"
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  examSimulationResult.passed
                    ? 'bg-emerald-950/30 border-emerald-500/40'
                    : isExamSubmitted
                    ? 'bg-rose-950/30 border-rose-500/40'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Canlı İmtahan Nəticəsi ({examSimulationResult.answeredCount}/
                    {examSimulationResult.totalQuestions} cavablandırılıb)
                  </div>
                  <div
                    data-testid="exam-status-label"
                    className={`text-sm sm:text-base font-black mt-0.5 ${
                      examSimulationResult.passed
                        ? 'text-emerald-300'
                        : isExamSubmitted
                        ? 'text-rose-300'
                        : 'text-white'
                    }`}
                  >
                    {examSimulationResult.statusLabel}
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    {examSimulationResult.officialVerdict}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">Doğru / Cəmi</span>
                    <span
                      data-testid="exam-correct-count"
                      className="text-lg font-black text-emerald-400"
                    >
                      {examSimulationResult.correctCount} / {examSimulationResult.totalQuestions}
                    </span>
                  </div>
                  <button
                    type="button"
                    data-testid="submit-exam-btn"
                    onClick={() => setIsExamSubmitted(true)}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Bileti Təsdiqlə
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {BDYP_EXAM_TICKET_QUESTIONS.map((q) => {
                  const chosen = selectedAnswers[q.id];
                  const isAnswered = chosen !== undefined;
                  const isCorrect = chosen === q.correctOptionIndex;

                  return (
                    <div
                      key={q.id}
                      data-testid={`exam-question-${q.ticketNumber}`}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[11px] font-bold">
                            Sual #{q.ticketNumber} • {q.categoryTag}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {q.yhqArticleReference}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                          {q.questionText}
                        </p>

                        <div className="space-y-1.5 pt-1">
                          {q.options.map((opt, idx) => {
                            const isThisChosen = chosen === idx;
                            let btnStyle =
                              'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';
                            if (isThisChosen) {
                              if (isExamSubmitted) {
                                btnStyle = isCorrect
                                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200'
                                  : 'bg-rose-500/20 border-rose-500 text-rose-200';
                              } else {
                                btnStyle =
                                  'bg-indigo-600/25 border-indigo-400 text-white font-semibold';
                              }
                            } else if (isExamSubmitted && idx === q.correctOptionIndex) {
                              btnStyle =
                                'bg-emerald-500/10 border-emerald-500/40 text-emerald-300';
                            }

                            return (
                              <button
                                key={idx}
                                type="button"
                                data-testid={`q-${q.ticketNumber}-opt-${idx}`}
                                onClick={() => handleSelectExamAnswer(q.id, idx)}
                                className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${btnStyle}`}
                              >
                                <span className="font-bold mr-1.5">{idx + 1})</span>
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {(isAnswered || isExamSubmitted) && (
                        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300">
                          <strong className="text-indigo-400">{q.yhqArticleReference} İzahı: </strong>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: BDYP MERO & ASAN CENTERS RADAR */}
          {activeTab === 'centers' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {['ALL', 'Bakı', 'Sumqayıt', 'Gəncə', 'Lənkəran'].map((city) => (
                    <button
                      key={city}
                      type="button"
                      data-testid={`filter-center-city-${city}`}
                      onClick={() => setCenterCityFilter(city)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        centerCityFilter === city
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {city === 'ALL' ? 'Bütün Şəhərlər' : city}
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyAutodromFilter}
                    data-testid="filter-only-autodrom"
                    onChange={(e) => setOnlyAutodromFilter(e.target.checked)}
                    className="rounded border-slate-700 accent-indigo-500"
                  />
                  <span>Yalnız Praktik Avtodromu Olan BDYP MERO-lar</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCenters.map((center) => {
                  const isSelected = center.id === selectedCenterId;
                  return (
                    <div
                      key={center.id}
                      data-testid={`license-center-card-${center.id}`}
                      onClick={() => setSelectedCenterId(center.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                        isSelected
                          ? 'bg-indigo-950/30 border-indigo-500'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                            {center.code} • {center.city}
                          </span>
                          <h4 className="text-sm font-black text-white mt-1">{center.name}</h4>
                          <p className="text-xs text-slate-400">{center.address}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-400 text-xs font-bold flex items-center gap-1 shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                          ~{center.waitMinutes} dəq
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 text-[11px]">
                        {center.hasPracticalAutodrom && (
                          <span className="px-2 py-0.5 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                            GPS Avtodrom & İmtahan
                          </span>
                        )}
                        {center.supportsIdpIssuance && (
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            Beynəlxalq Vəsiqə (IDP)
                          </span>
                        )}
                        {center.supportsMedicalCheckOnSite && (
                          <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            Tibbi Müayinə (Forma 083)
                          </span>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        <span>{center.workingHours}</span>
                        <span className="font-mono text-slate-300">{center.phone}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: ELECTRONIC DRIVER'S LICENSE EXTRACT & REGISTRY */}
          {activeTab === 'extract' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Generator Form & Official Card */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-white">
                    Sürücü Məlumatları & Rəqəmsal Çıxarış Sifarişi
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-slate-400 mb-1">
                        Soyad, Ad, Ata adı
                      </label>
                      <input
                        type="text"
                        value={holderFullName}
                        data-testid="extract-fullname-input"
                        onChange={(e) => setHolderFullName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">FİN Kod (7 simvol)</label>
                      <input
                        type="text"
                        maxLength={7}
                        value={holderFin}
                        data-testid="extract-fin-input"
                        onChange={(e) => setHolderFin(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono uppercase"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Doğum İli</label>
                      <input
                        type="number"
                        value={birthYear}
                        onChange={(e) => setBirthYear(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Qan Qrupu</label>
                      <select
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      >
                        <option value="I (0) Rh+">I (0) Rh+</option>
                        <option value="II (A) Rh+">II (A) Rh+</option>
                        <option value="III (B) Rh+">III (B) Rh+</option>
                        <option value="IV (AB) Rh+">IV (AB) Rh+</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        data-testid="refresh-extract-btn"
                        onClick={handleGenerateExtract}
                        className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        Çıxarışı Yenilə
                      </button>
                    </div>
                  </div>
                </div>

                {/* Official BDYP Electronic Driver's License Extract Card */}
                <div
                  data-testid="electronic-license-card"
                  className="p-5 rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950/50 to-slate-950 border-2 border-indigo-500/40 shadow-xl space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-indigo-500/30 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 block">
                        AZƏRBAYCAN RESPUBLİKASI DİN • BAŞ DYP İDARƏSİ
                      </span>
                      <h4 className="text-base font-black text-white">
                        RƏQƏMSAL SÜRÜCÜLÜK VƏSİQƏSİ ÇIXARIŞI (myGov / ASAN)
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        data-testid="copy-license-number-btn"
                        onClick={handleCopyLicenseCode}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-indigo-300 flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{activeExtract.licenseNumber}</span>
                        {copiedCode ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 cursor-pointer"
                        title="Çap et"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Sürücü (S.A.A.)</span>
                      <span
                        data-testid="extract-holder-name"
                        className="font-black text-white block"
                      >
                        {activeExtract.holderFullName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">FİN / Doğum İli</span>
                      <span className="font-mono font-bold text-slate-200">
                        {activeExtract.holderFin} • {activeExtract.birthYear}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Qan Qrupu</span>
                      <span className="font-bold text-rose-300">{activeExtract.bloodGroup}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Açıq Kateqoriyalar</span>
                      <span
                        data-testid="extract-categories-list"
                        className="font-black text-indigo-300"
                      >
                        {activeExtract.categories.join(', ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Etibarlılıq Müddəti</span>
                      <span className="font-bold text-emerald-400">
                        {activeExtract.issueDate} — {activeExtract.expiryDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Transmissiya Şərti</span>
                      <span className="font-bold text-white">
                        {activeExtract.transmissionScope === 'automatic_only_AT'
                          ? 'AT (Yalnız Avtomat)'
                          : 'MT / Bütün Transmissiyalar'}
                      </span>
                    </div>
                  </div>

                  {activeExtract.hasInternationalPermit && (
                    <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-emerald-300">
                        <Globe className="w-4 h-4 shrink-0" />
                        <span>
                          1968 Vyana Konvensiyası Beynəlxalq Sürücülük Vəsiqəsi (IDP) Aktivdir
                        </span>
                      </div>
                      <span className="font-mono font-bold text-white">
                        {activeExtract.idpSerialNumber}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-indigo-500/20 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Verən orqan: {activeExtract.issuingAuthority}</span>
                    <span className="font-mono text-indigo-300">
                      {activeExtract.qrVerificationHash}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Unified BDYP License Registry Search */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Search className="w-4 h-4 text-indigo-400" />
                    BDYP Vahid Elektron Vəsiqə Reyestri Axtarışı
                  </h4>
                  <input
                    type="text"
                    value={registrySearchQuery}
                    data-testid="license-registry-search-input"
                    onChange={(e) => setRegistrySearchQuery(e.target.value)}
                    placeholder="Vəsiqə nömrəsi (AZE-SV-...), FİN və ya Soyad..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />

                  <div className="space-y-2.5 max-h-80 overflow-y-auto">
                    {allRegistryRecords.map((rec) => (
                      <div
                        key={rec.licenseNumber}
                        className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-indigo-300">
                            {rec.licenseNumber}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
                            {rec.status} • {rec.categories.join(', ')}
                          </span>
                        </div>
                        <div className="font-bold text-white">{rec.holderFullName}</div>
                        <div className="text-[11px] text-slate-400 flex items-center justify-between">
                          <span>FİN: {rec.holderFin}</span>
                          <span>Etibarlıdır: {rec.expiryDate}</span>
                        </div>
                      </div>
                    ))}
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

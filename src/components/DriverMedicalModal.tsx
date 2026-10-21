import React, { useState, useMemo } from 'react';
import { Vehicle, Currency } from '../types/vehicle';
import {
  DriverCategory,
  ColorVisionDiagnosis,
  DispensaryStatus,
  RABKIN_TEST_PLATES,
  MOCK_MEDICAL_CENTERS,
  MOCK_MEDICAL_PACKAGES,
  MOCK_EXISTING_CERTIFICATES,
  DriverMedicalCertificate,
  DispensaryRecord,
} from '../data/mockDriverMedicalData';
import {
  evaluateMedicalEligibility,
  evaluateRabkinTest,
  evaluateSobrietyAndToxicology,
  generateDriverMedicalCertificate,
  lookupMedicalCertificate,
  queryDispensaryRecord,
  formatMedicalCurrency,
} from '../utils/driverMedicalCompliance';
import {
  X,
  Stethoscope,
  Eye,
  Wine,
  Building2,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Search,
  Copy,
  Check,
  Calendar,
  Activity,
  HeartPulse,
  UserCheck,
  QrCode,
  Info,
} from 'lucide-react';

interface DriverMedicalModalProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  currency: Currency;
  onClose: () => void;
}

type TabId = 'audit' | 'rabkin' | 'sobriety' | 'clinics' | 'certificate';

export const DriverMedicalModal: React.FC<DriverMedicalModalProps> = ({
  isOpen,
  vehicle,
  currency,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('audit');

  // Tab 1: Forma AZS-083/e Parameters
  const [targetCategory, setTargetCategory] = useState<DriverCategory>('B');
  const [age, setAge] = useState<number>(32);
  const [visusBetter, setVisusBetter] = useState<number>(1.0);
  const [visusWorse, setVisusWorse] = useState<number>(0.8);
  const [withCorrection, setWithCorrection] = useState<boolean>(false);
  const [colorVisionAudit, setColorVisionAudit] =
    useState<ColorVisionDiagnosis>('NORMAL_TRICHROMACY');
  const [hearingLossDb, setHearingLossDb] = useState<number>(15);
  const [hasEpilepsy, setHasEpilepsy] = useState<boolean>(false);
  const [hasCardiovascular, setHasCardiovascular] = useState<boolean>(false);
  const [hasLimbDisability, setHasLimbDisability] = useState<boolean>(false);
  const [narcologyStatus, setNarcologyStatus] =
    useState<DispensaryStatus>('CLEAN');
  const [psychoStatus, setPsychoStatus] = useState<DispensaryStatus>('CLEAN');

  // Tab 2: Rabkin Interactive Plate state
  const [rabkinAnswers, setRabkinAnswers] = useState<Record<string, string>>({
    rabkin_tab_1: '96',
    rabkin_tab_2: 'Dairə və Üçbucaq',
    rabkin_tab_3: '13',
    rabkin_tab_4: '74',
    rabkin_tab_5: '29',
    rabkin_tab_6: '5',
  });

  // Tab 3: Sobriety & Dispensary Query
  const [bacPromille, setBacPromille] = useState<number>(0.0);
  const [refusedAlcoholTest, setRefusedAlcoholTest] = useState<boolean>(false);
  const [dispensaryFinQuery, setDispensaryFinQuery] =
    useState<string>('6ABC123');
  const [queriedDispensary, setQueriedDispensary] =
    useState<DispensaryRecord | null>(null);

  // Tab 4: Clinic Booking State
  const [cityFilter, setCityFilter] = useState<'ALL' | 'Bakı' | 'Sumqayıt' | 'Gəncə'>('ALL');
  const [selectedCenterId, setSelectedCenterId] = useState<string>('baku_health_center');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('pkg_standard_b');
  const [bookingFullName, setBookingFullName] = useState<string>('Əli Məmmədov');
  const [bookingFin, setBookingFin] = useState<string>('7XYZ999');
  const [bookingDate, setBookingDate] = useState<string>('2026-10-25');
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);

  // Tab 5: Certificate state
  const [certSearchQuery, setCertSearchQuery] = useState<string>('');
  const [activeCert, setActiveCert] = useState<DriverMedicalCertificate>(
    MOCK_EXISTING_CERTIFICATES[0]
  );
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Computed results
  const medicalAuditResult = useMemo(() => {
    return evaluateMedicalEligibility({
      targetCategory,
      age,
      visualAcuityBetterEye: visusBetter,
      visualAcuityWorseEye: visusWorse,
      withCorrection,
      colorVision: colorVisionAudit,
      hearingLossDb,
      hasEpilepsyOrSyncope: hasEpilepsy,
      hasSevereCardiovascular: hasCardiovascular,
      hasLimbLossWithoutAdaptation: hasLimbDisability,
      narcologyDispensaryStatus: narcologyStatus,
      psychoneurologyDispensaryStatus: psychoStatus,
    });
  }, [
    targetCategory,
    age,
    visusBetter,
    visusWorse,
    withCorrection,
    colorVisionAudit,
    hearingLossDb,
    hasEpilepsy,
    hasCardiovascular,
    hasLimbDisability,
    narcologyStatus,
    psychoStatus,
  ]);

  const rabkinResult = useMemo(() => {
    return evaluateRabkinTest(rabkinAnswers);
  }, [rabkinAnswers]);

  const sobrietyResult = useMemo(() => {
    return evaluateSobrietyAndToxicology(bacPromille, refusedAlcoholTest);
  }, [bacPromille, refusedAlcoholTest]);

  const filteredCenters = useMemo(() => {
    if (cityFilter === 'ALL') return MOCK_MEDICAL_CENTERS;
    return MOCK_MEDICAL_CENTERS.filter((c) => c.city === cityFilter);
  }, [cityFilter]);

  if (!isOpen) return null;

  // Handlers
  const handleApplyPreset = (
    preset: 'healthy_b' | 'glasses' | 'commercial' | 'unfit'
  ) => {
    if (preset === 'healthy_b') {
      setTargetCategory('B');
      setAge(30);
      setVisusBetter(1.0);
      setVisusWorse(0.9);
      setWithCorrection(false);
      setColorVisionAudit('NORMAL_TRICHROMACY');
      setHearingLossDb(15);
      setHasEpilepsy(false);
      setHasCardiovascular(false);
      setHasLimbDisability(false);
      setNarcologyStatus('CLEAN');
      setPsychoStatus('CLEAN');
    } else if (preset === 'glasses') {
      setTargetCategory('B');
      setAge(38);
      setVisusBetter(0.7);
      setVisusWorse(0.5);
      setWithCorrection(true);
      setColorVisionAudit('NORMAL_TRICHROMACY');
      setHearingLossDb(20);
      setHasEpilepsy(false);
      setHasCardiovascular(false);
      setHasLimbDisability(false);
      setNarcologyStatus('CLEAN');
      setPsychoStatus('CLEAN');
    } else if (preset === 'commercial') {
      setTargetCategory('C1_C');
      setAge(42);
      setVisusBetter(1.0);
      setVisusWorse(0.8);
      setWithCorrection(false);
      setColorVisionAudit('NORMAL_TRICHROMACY');
      setHearingLossDb(15);
      setHasEpilepsy(false);
      setHasCardiovascular(false);
      setHasLimbDisability(false);
      setNarcologyStatus('CLEAN');
      setPsychoStatus('CLEAN');
    } else if (preset === 'unfit') {
      setTargetCategory('B');
      setAge(45);
      setVisusBetter(0.4);
      setVisusWorse(0.2);
      setWithCorrection(false);
      setColorVisionAudit('TOTAL_COLOR_BLINDNESS');
      setHearingLossDb(55);
      setHasEpilepsy(true);
      setHasCardiovascular(true);
      setHasLimbDisability(true);
      setNarcologyStatus('REGISTERED_ADDICTION');
      setPsychoStatus('RESTRICTED_DISORDER');
    }
  };

  const handleRabkinOptionSelect = (plateId: string, answer: string) => {
    setRabkinAnswers((prev) => ({
      ...prev,
      [plateId]: answer,
    }));
  };

  const handleQueryDispensary = () => {
    const res = queryDispensaryRecord(dispensaryFinQuery);
    setQueriedDispensary(res);
  };

  const handleBookAppointment = () => {
    setBookingConfirmed(true);
  };

  const handleCertSearch = () => {
    const found = lookupMedicalCertificate(certSearchQuery);
    if (found) {
      setActiveCert(found);
    }
  };

  const handleGenerateCertificateFromAudit = () => {
    const newCert = generateDriverMedicalCertificate({
      finCode: bookingFin,
      fullName: bookingFullName,
      birthDate: '1994-06-18',
      bloodType: 'B(III) Rh+',
      targetCategories: [targetCategory],
      centerId: selectedCenterId,
      validityYears: medicalAuditResult.validityYears,
      eyeCorrection: medicalAuditResult.eyeCorrectionRequired,
      hearingAid: medicalAuditResult.hearingAidRequired,
      handControls: medicalAuditResult.handControlsRequired,
      colorVision: colorVisionAudit,
      visusLeft: visusWorse,
      visusRight: visusBetter,
    });
    setActiveCert(newCert);
    setActiveTab('certificate');
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      data-testid="driver-medical-modal"
    >
      <div className="relative w-full max-w-5xl my-8 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
              <Stethoscope className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight">
                  Dövlət Sürücülük Tibbi Müayinəsi & E-Arayış Portalı
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-500/30 text-emerald-100 border border-emerald-400/30">
                  Forma AZS-083/e
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-cyan-500/30 text-cyan-100 border border-cyan-400/30">
                  SİMA İnteqrasiyalı
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Səhiyyə Nazirliyi, BDYP & ASAN Xidmət Rəsmi Sürücülük Sağlamlıq Standartları
                {vehicle ? ` • ${vehicle.year} ${vehicle.make} ${vehicle.model}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            data-testid="close-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('audit')}
            data-testid="tab-btn-audit"
            className={`flex items-center space-x-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Forma AZS-083/e Auditoru</span>
          </button>

          <button
            onClick={() => setActiveTab('rabkin')}
            data-testid="tab-btn-rabkin"
            className={`flex items-center space-x-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'rabkin'
                ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Rabkin Rəng Korluğu & Görmə</span>
          </button>

          <button
            onClick={() => setActiveTab('sobriety')}
            data-testid="tab-btn-sobriety"
            className={`flex items-center space-x-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'sobriety'
                ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Wine className="w-4 h-4" />
            <span>Narkoloji & Alkotest Toksikologiya</span>
          </button>

          <button
            onClick={() => setActiveTab('clinics')}
            data-testid="tab-btn-clinics"
            className={`flex items-center space-x-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'clinics'
                ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Akkreditə Tibb Mərkəzləri</span>
          </button>

          <button
            onClick={() => setActiveTab('certificate')}
            data-testid="tab-btn-certificate"
            className={`flex items-center space-x-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'certificate'
                ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Rəsmi E-Şəhadətnamə (SN-TIB-2026)</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: Forma AZS-083/e Medical Eligibility Auditor */}
          {activeTab === 'audit' && (
            <div className="space-y-6" data-testid="audit-tab-content">
              {/* Presets */}
              <div className="flex flex-wrap gap-2 items-center justify-between p-3.5 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Sürətli Müayinə Ssenariləri:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleApplyPreset('healthy_b')}
                    data-testid="preset-healthy-b"
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 hover:bg-emerald-200 transition-colors"
                  >
                    Sağlam B Sürücü (10 İl)
                  </button>
                  <button
                    onClick={() => handleApplyPreset('glasses')}
                    data-testid="preset-glasses-driver"
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 hover:bg-blue-200 transition-colors"
                  >
                    Eynək Tələbli Sürücü (01.01)
                  </button>
                  <button
                    onClick={() => handleApplyPreset('commercial')}
                    data-testid="preset-commercial-driver"
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 hover:bg-amber-200 transition-colors"
                  >
                    Peşəkar C/D Sürücü (İllik)
                  </button>
                  <button
                    onClick={() => handleApplyPreset('unfit')}
                    data-testid="preset-unfit-driver"
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200 hover:bg-rose-200 transition-colors"
                  >
                    Yararsız / Məhdudiyyətli
                  </button>
                </div>
              </div>

              {/* Verdict Banner */}
              <div
                data-testid="eligibility-verdict-banner"
                className={`p-5 rounded-2xl border flex items-start space-x-4 ${
                  medicalAuditResult.isEligible
                    ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                    : 'bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800 text-rose-900 dark:text-rose-100'
                }`}
              >
                <div
                  className={`p-3 rounded-xl ${
                    medicalAuditResult.isEligible
                      ? 'bg-emerald-500 text-white'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {medicalAuditResult.isEligible ? (
                    <ShieldCheck className="w-7 h-7" />
                  ) : (
                    <ShieldAlert className="w-7 h-7" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">
                      {medicalAuditResult.isEligible
                        ? 'TİBBİ CƏHƏTDƏN SÜRÜCÜLÜYƏ YARARLIDIR'
                        : 'TİBBİ CƏHƏTDƏN YARARSIZDIR — MƏHDUDİYYƏT VAR'}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2.5 py-1 rounded-md font-bold bg-white/80 dark:bg-slate-900/80 shadow-sm">
                        Bal: <span data-testid="eligibility-score-val">{medicalAuditResult.eligibilityScore}</span> / 100
                      </span>
                      <span className="text-xs px-2.5 py-1 rounded-md font-bold bg-white/80 dark:bg-slate-900/80 shadow-sm">
                        Müddət: <span data-testid="validity-years-val">{medicalAuditResult.validityYears}</span> İl
                      </span>
                    </div>
                  </div>
                  <p className="text-sm mt-1 opacity-90">{medicalAuditResult.categoryAdviceAz}</p>

                  {/* Disqualification List */}
                  {medicalAuditResult.disqualificationReasons.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                        Qadağanedici Tibbi Səbəblər:
                      </p>
                      {medicalAuditResult.disqualificationReasons.map((reason, idx) => (
                        <div
                          key={idx}
                          className="flex items-center space-x-2 text-xs font-medium text-rose-800 dark:text-rose-200"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Endorsements */}
                  {medicalAuditResult.specialEndorsements.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                        Sürücülük Vəsiqəsinə Xüsusi Qeydlər:
                      </p>
                      {medicalAuditResult.specialEndorsements.map((end, idx) => (
                        <div
                          key={idx}
                          className="flex items-center space-x-2 text-xs font-medium text-emerald-900 dark:text-emerald-200"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{end}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Interactive Audit Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category & Age */}
                <div className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Hədəf Sürücülük Kateqoriyası & Yaş</span>
                  </h4>

                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-300 block mb-1.5">
                      Kateqoriya Seçimi:
                    </label>
                    <select
                      value={targetCategory}
                      onChange={(e) => setTargetCategory(e.target.value as DriverCategory)}
                      data-testid="target-category-select"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="A1_A">A1 / A — Motosiklet və Trisikllər</option>
                      <option value="B">B — Minik Avtomobilləri (Şəxsi & Standart)</option>
                      <option value="BE">BE — Minik Avtomobili + Ağır Qoşqu (&gt;750 kq)</option>
                      <option value="C1_C">C1 / C — Yük Avtomobilləri (&gt;3.5t Peşəkar)</option>
                      <option value="CE">CE — Ağır Qoşqulu Qatarlar (TIR Magistral)</option>
                      <option value="D1_D">D1 / D — Avtobuslar və Sərnişin Daşımaları</option>
                      <option value="TAXI">AYNA E-Taksi Sərnişin Daşımaları (İllik)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Sürücünün Yaşı:</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{age} yaş</span>
                    </div>
                    <input
                      type="range"
                      min={18}
                      max={85}
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>18 yaş (Minimal)</span>
                      <span>60 yaş (2 il limit)</span>
                      <span>70+ yaş (1 il limit)</span>
                    </div>
                  </div>

                  {/* Optical Acuity */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Görmə İtiliyi (Snellen / Sivtsev):
                      </span>
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={withCorrection}
                          onChange={(e) => setWithCorrection(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          Eynək / Linza ilə
                        </span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                          <span>Yaxşı Görən Göz:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {visusBetter.toFixed(1)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0.1}
                          max={1.5}
                          step={0.1}
                          value={visusBetter}
                          onChange={(e) => setVisusBetter(Number(e.target.value))}
                          className="w-full accent-emerald-600"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                          <span>Zəif Görən Göz:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {visusWorse.toFixed(1)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0.1}
                          max={1.5}
                          step={0.1}
                          value={visusWorse}
                          onChange={(e) => setVisusWorse(Number(e.target.value))}
                          className="w-full accent-emerald-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medical Conditions & Dispensary Status */}
                <div className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                    <HeartPulse className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Kliniki Vəziyyət & Dispanser Qeydiyyatı</span>
                  </h4>

                  <div className="space-y-2.5">
                    <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs cursor-pointer">
                      <span className="text-slate-700 dark:text-slate-300">
                        Epilepsiya, huşitirmə və paroksizmal hallar:
                      </span>
                      <input
                        type="checkbox"
                        checked={hasEpilepsy}
                        onChange={(e) => setHasEpilepsy(e.target.checked)}
                        className="rounded text-rose-600 focus:ring-rose-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs cursor-pointer">
                      <span className="text-slate-700 dark:text-slate-300">
                        Ağır ürək-damar çatışmazlığı (NYHA III-IV):
                      </span>
                      <input
                        type="checkbox"
                        checked={hasCardiovascular}
                        onChange={(e) => setHasCardiovascular(e.target.checked)}
                        className="rounded text-rose-600 focus:ring-rose-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs cursor-pointer">
                      <span className="text-slate-700 dark:text-slate-300">
                        Ətraf orqan hərəki çatışmazlığı (Əl ilə idarəetmə tələbi):
                      </span>
                      <input
                        type="checkbox"
                        checked={hasLimbDisability}
                        onChange={(e) => setHasLimbDisability(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                    </label>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                        <span>Eşitmə Zəifliyi (Audiometriya):</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {hearingLossDb} dB
                        </span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={70}
                        value={hearingLossDb}
                        onChange={(e) => setHearingLossDb(Number(e.target.value))}
                        className="w-full accent-emerald-600"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>10-25 dB (Normal)</span>
                        <span>30-50 dB (Zəifləmə)</span>
                        <span>&gt;50 dB (Ağır / Aparat)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                          Narkoloji Dispanser:
                        </label>
                        <select
                          value={narcologyStatus}
                          onChange={(e) => setNarcologyStatus(e.target.value as DispensaryStatus)}
                          className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                        >
                          <option value="CLEAN">Qeydiyyatda deyil (Təmiz)</option>
                          <option value="UNDER_OBSERVATION">Profilaktik Müşahidə</option>
                          <option value="REGISTERED_ADDICTION">Aktiv Asılılıq Qeydiyyatı</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                          Psixonevroloji Dispanser:
                        </label>
                        <select
                          value={psychoStatus}
                          onChange={(e) => setPsychoStatus(e.target.value as DispensaryStatus)}
                          className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                        >
                          <option value="CLEAN">Qeydiyyatda deyil (Sağlam)</option>
                          <option value="RESTRICTED_DISORDER">Ağır Psixi Pozuntu</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleGenerateCertificateFromAudit}
                  disabled={!medicalAuditResult.isEligible}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all ${
                    medicalAuditResult.isEligible
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-emerald-500/25'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Elektron Tibbi Arayışı Rəsmiləşdir (Forma AZS-083/e)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Rabkin Polychromatic Color Blindness Test */}
          {activeTab === 'rabkin' && (
            <div className="space-y-6" data-testid="rabkin-tab-content">
              {/* Diagnosis Header Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80 border border-blue-200 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Kliniki Diaqnoz:
                    </span>
                    <span
                      data-testid="rabkin-diagnosis-badge"
                      className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white"
                    >
                      {rabkinResult.diagnosisAz}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {rabkinResult.clinicalNoteAz}
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-center px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500">Düzgün Cavablar</div>
                    <div className="text-lg font-bold text-emerald-600">
                      {rabkinResult.correctCount} / {rabkinResult.totalPlates}
                    </div>
                  </div>

                  <div className="text-center px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500">B Kateqoriyası</div>
                    <div
                      className={`text-sm font-bold ${
                        rabkinResult.allowsAmateurB ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {rabkinResult.allowsAmateurB ? 'YARARLI' : 'YARARSIZ'}
                    </div>
                  </div>

                  <div className="text-center px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500">C/D/Taksi</div>
                    <div
                      className={`text-sm font-bold ${
                        rabkinResult.allowsProfessionalCD ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {rabkinResult.allowsProfessionalCD ? 'YARARLI' : 'QADAĞANDIR'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 6 Rabkin Plates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {RABKIN_TEST_PLATES.map((plate) => {
                  const currentAnswer = rabkinAnswers[plate.id] || '';
                  const isCorrect = currentAnswer === plate.normalAnswer;

                  return (
                    <div
                      key={plate.id}
                      className="p-4 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Lövhə №{plate.plateNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isCorrect
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                          }`}
                        >
                          {isCorrect ? 'Normal Cavab' : 'Anomaliya'}
                        </span>
                      </div>

                      {/* Plate Graphic Simulator */}
                      <div className="h-32 rounded-xl bg-gradient-to-br from-teal-800 via-emerald-700 to-amber-700 p-3 flex flex-col items-center justify-center text-center shadow-inner relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:8px_8px] opacity-30"></div>
                        <span className="text-xs text-white/90 font-medium z-10 px-2 py-1 bg-black/40 rounded-lg backdrop-blur-sm">
                          {plate.imageAlt}
                        </span>
                        <span className="text-2xl font-black text-amber-200 tracking-widest mt-1 z-10 drop-shadow">
                          {plate.normalAnswer}
                        </span>
                      </div>

                      {/* Options */}
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                          Lövhədə nə görürsünüz?
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {plate.options.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => handleRabkinOptionSelect(plate.id, opt)}
                              data-testid={`rabkin-plate-select-btn-${plate.plateNumber}-${opt}`}
                              className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all text-center ${
                                currentAnswer === opt
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                  : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                        {plate.explanation}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Sobriety & Dispensary Query */}
          {activeTab === 'sobriety' && (
            <div className="space-y-6" data-testid="sobriety-tab-content">
              {/* Sobriety Status Banner */}
              <div
                className={`p-5 rounded-2xl border flex items-start space-x-4 ${
                  sobrietyResult.isSober
                    ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                    : 'bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800 text-rose-900 dark:text-rose-100'
                }`}
              >
                <div
                  className={`p-3 rounded-xl ${
                    sobrietyResult.isSober
                      ? 'bg-emerald-500 text-white'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {sobrietyResult.isSober ? (
                    <CheckCircle2 className="w-7 h-7" />
                  ) : (
                    <Wine className="w-7 h-7" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold" data-testid="bac-status-badge">
                      {sobrietyResult.statusAz}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2.5 py-1 rounded-md font-bold bg-white/80 dark:bg-slate-900/80 shadow-sm">
                        Qan: {sobrietyResult.bloodAlcoholPromille.toFixed(2)} ‰
                      </span>
                      <span className="text-xs px-2.5 py-1 rounded-md font-bold bg-white/80 dark:bg-slate-900/80 shadow-sm">
                        Nəfəs: {sobrietyResult.breathAlcoholMgL.toFixed(2)} mq/l
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-semibold mt-1 opacity-90">
                    Hüquqi Əsas: {sobrietyResult.legalArticle}
                  </p>
                  <p className="text-xs mt-1 opacity-80">{sobrietyResult.clinicalSymptomsAz}</p>

                  {!sobrietyResult.isSober && (
                    <div className="mt-3 p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 block">Dövlət Cəriməsi:</span>
                        <span className="font-bold text-rose-600 dark:text-rose-400">
                          {sobrietyResult.fineAzn} ₼ ({sobrietyResult.discountedFineAzn} ₼ güzəştlə)
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Sürücülükdən Məhrumetmə:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {sobrietyResult.suspensionRangeTextAz}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Cərimə Balı / İnzibati Həbs:</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          {sobrietyResult.penaltyPoints} Bal
                          {sobrietyResult.isAdministrativeDetentionRisk ? ' + 15-30 gün həbs' : ''}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* BAC Slider Simulator */}
              <div className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Qanda Alkoqol Promille Simulyatoru (BAC ‰)</span>
                  </h4>
                  <label className="flex items-center space-x-1.5 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={refusedAlcoholTest}
                      onChange={(e) => setRefusedAlcoholTest(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      Müayinədən İmtina (İXM 334.1)
                    </span>
                  </label>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Alkotest Konsentrasiyası:</span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      {bacPromille.toFixed(2)} ‰ (promille)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.0}
                    max={2.5}
                    step={0.02}
                    value={bacPromille}
                    disabled={refusedAlcoholTest}
                    onChange={(e) => setBacPromille(Number(e.target.value))}
                    data-testid="bac-slider"
                    className="w-full accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span className="text-emerald-600">≤0.28 ‰ (Qanuni norma)</span>
                    <span className="text-amber-500">0.28 - 0.50 ‰ (333.1)</span>
                    <span className="text-orange-500">0.50 - 1.00 ‰ (333.2)</span>
                    <span className="text-rose-600">&gt;1.00 ‰ (Həbs tələbi)</span>
                  </div>
                </div>
              </div>

              {/* Central Dispensary Database Query */}
              <div className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                  <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Mərkəzi Narkoloji & Psixonevroloji Dispanser Reyestri Sorğusu</span>
                </h4>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={dispensaryFinQuery}
                    onChange={(e) => setDispensaryFinQuery(e.target.value)}
                    placeholder="Vətəndaşın FİN kodunu daxil edin (məs. 6ABC123, 5MNK456)..."
                    data-testid="dispensary-fin-input"
                    className="flex-1 p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono uppercase font-semibold text-slate-900 dark:text-slate-100"
                  />
                  <button
                    onClick={handleQueryDispensary}
                    data-testid="dispensary-check-btn"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center space-x-1.5"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Dispanseri Yoxla</span>
                  </button>
                </div>

                {queriedDispensary && (
                  <div
                    data-testid="dispensary-result-box"
                    className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {queriedDispensary.fullName}
                        </span>
                        <span className="ml-2 font-mono text-slate-500">
                          ({queriedDispensary.finCode})
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Son Arayış: {queriedDispensary.lastClearanceDate}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="text-slate-500 block">Narkoloji Status:</span>
                        <span
                          className={`font-bold ${
                            queriedDispensary.narcologyStatus === 'CLEAN'
                              ? 'text-emerald-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {queriedDispensary.narcologyStatus === 'CLEAN'
                            ? 'Qeydiyyatda deyil (Təmiz)'
                            : 'Respublika Narkoloji Mərkəzində Aktiv Qeydiyyat'}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          Seriya: {queriedDispensary.narcologyDocSerial}
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-500 block">Psixonevroloji Status:</span>
                        <span
                          className={`font-bold ${
                            queriedDispensary.psychoneurologyStatus === 'CLEAN'
                              ? 'text-emerald-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {queriedDispensary.psychoneurologyStatus === 'CLEAN'
                            ? 'Qeydiyyatda deyil (Sağlam)'
                            : 'Məhdudiyyətli Dispanser Müşahidəsi'}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          Seriya: {queriedDispensary.psychoDocSerial}
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 italic pt-1">
                      {queriedDispensary.notesAz}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Accredited Medical Centers & Packages */}
          {activeTab === 'clinics' && (
            <div className="space-y-6" data-testid="clinics-tab-content">
              {/* City Filter */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    Səhiyyə Nazirliyi Tərəfindən Akkreditə Olunmuş Müəssisələr
                  </h3>
                </div>

                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value as any)}
                  data-testid="clinic-filter-select"
                  className="p-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                >
                  <option value="ALL">Bütün Şəhərlər</option>
                  <option value="Bakı">Bakı Şəhəri</option>
                  <option value="Sumqayıt">Sumqayıt Şəhəri</option>
                  <option value="Gəncə">Gəncə Şəhəri</option>
                </select>
              </div>

              {/* Clinic Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCenters.map((clinic) => {
                  const isSelected = selectedCenterId === clinic.id;
                  return (
                    <div
                      key={clinic.id}
                      onClick={() => setSelectedCenterId(clinic.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-md ring-1 ring-emerald-500'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {clinic.nameAz}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {clinic.addressAz}
                          </p>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
                          {formatMedicalCurrency(clinic.baseFeeAzn, currency)}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-2">
                        <span>Tel: {clinic.phone}</span>
                        <span>{clinic.workingHours}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Medical Packages Selector */}
              <div className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                  <Stethoscope className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Tibbi Komissiya Xidmət Paketi</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {MOCK_MEDICAL_PACKAGES.map((pkg) => {
                    const isSelected = selectedPackageId === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPackageId(pkg.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-1 ring-emerald-500'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {pkg.titleAz}
                          </span>
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                            {formatMedicalCurrency(pkg.feeAzn, currency)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {pkg.descriptionAz}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Booking Simulator */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Elektron Növbə & Müayinə Qeydiyyatı</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Ad, Soyad:
                    </label>
                    <input
                      type="text"
                      value={bookingFullName}
                      onChange={(e) => setBookingFullName(e.target.value)}
                      className="w-full p-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      FİN Kod:
                    </label>
                    <input
                      type="text"
                      value={bookingFin}
                      onChange={(e) => setBookingFin(e.target.value)}
                      className="w-full p-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono uppercase text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Tarix:
                    </label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full p-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-500">
                    Ödəniş müayinə günü ASAN Xidmət və ya klinikada nağdsız həyata keçirilir.
                  </span>
                  <button
                    onClick={handleBookAppointment}
                    data-testid="book-appointment-btn"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                  >
                    Növbəni Təsdiqlə
                  </button>
                </div>

                {bookingConfirmed && (
                  <div
                    data-testid="booking-confirmation-banner"
                    className="p-3 bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>
                        Növbəniz uğurla qeydə alındı! Talon Kodu:{' '}
                        <strong>AZS-MED-{bookingFin}-2026</strong> ({bookingDate})
                      </span>
                    </div>
                    <span className="text-[10px] bg-white/70 dark:bg-slate-900/70 px-2 py-0.5 rounded font-mono font-bold">
                      SMS GÖNDƏRİLDİ
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: Official Electronic Medical Certificate (Forma AZS-083/e) */}
          {activeTab === 'certificate' && (
            <div className="space-y-6" data-testid="certificate-tab-content">
              {/* Lookup bar */}
              <div className="flex gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <input
                  type="text"
                  value={certSearchQuery}
                  onChange={(e) => setCertSearchQuery(e.target.value)}
                  placeholder="Elektron Arayış Nömrəsi (məs. SN-TIB-2026-88192) və ya FİN..."
                  data-testid="cert-lookup-input"
                  className="flex-1 p-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono uppercase"
                />
                <button
                  onClick={handleCertSearch}
                  data-testid="cert-lookup-btn"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-all"
                >
                  Axtar & Doğrula
                </button>
              </div>

              {/* Official Certificate Form */}
              <div className="relative p-8 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 rounded-2xl border-2 border-emerald-500/40 shadow-xl overflow-hidden">
                {/* Watermark / Background Coat */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                  <Stethoscope className="w-96 h-96 text-emerald-800" />
                </div>

                {/* Certificate Header */}
                <div className="text-center border-b-2 border-emerald-600/30 pb-4 space-y-1">
                  <div className="text-[11px] font-bold tracking-widest uppercase text-emerald-700 dark:text-emerald-400">
                    Azərbaycan Respublikası Səhiyyə Nazirliyi
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
                    SÜRÜCÜLÜK VƏSİQƏSİ ÜÇÜN ELEKTRON TİBBİ ARAYIŞ
                  </h3>
                  <div className="text-xs font-semibold text-slate-500 font-mono">
                    Forma AZS-083/e • Qeydiyyat № {activeCert.certificateNumber}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 text-xs">
                  <div className="space-y-2">
                    <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                      <span className="text-slate-500">Sürücünün Tam Adı:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {activeCert.driverFullName}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                      <span className="text-slate-500">FİN Kodu / Doğum Tarixi:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                        {activeCert.finCode} • {activeCert.birthDate}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                      <span className="text-slate-500">Qan Qrupu & Rh Faktoru:</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">
                        {activeCert.bloodType}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                      <span className="text-slate-500">Müayinə Mərkəzi:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {activeCert.issuingCenter}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                      <span className="text-slate-500">Verilmə Tarixi:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                        {activeCert.issueDate}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                      <span className="text-slate-500">Etibarlılıq Müddəti:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {activeCert.expiryDate} (Etibarlıdır)
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                      <span className="text-slate-500">Görmə İtiliyi (Sağ / Sol):</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {activeCert.visualAcuityRight} / {activeCert.visualAcuityLeft}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                      <span className="text-slate-500">Baş Həkim / Komissiya Sədri:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {activeCert.chiefPhysician}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Allowed Categories Badges */}
                <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 mb-6">
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block mb-1.5">
                    İcazə Verilən Sürücülük Kateqoriyaları:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeCert.allowedCategories.map((cat) => (
                      <span
                        key={cat}
                        className="px-3 py-1 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-lg shadow-sm border border-emerald-300 dark:border-emerald-700"
                      >
                        {cat}
                      </span>
                    ))}
                    {activeCert.eyeCorrectionRequired && (
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 font-semibold text-xs rounded-lg border border-blue-300 dark:border-blue-700">
                        Xüsusi Qeyd: 01.01 Eynək / Kontakt Linza
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Digital Stamp & QR Telemetry */}
                <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4 text-[10px] text-slate-500">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        SİMA Rəqəmsal İmza Təsdiqli:
                      </span>
                      <span className="font-mono text-emerald-600">{activeCert.simaDigitalSignatureUid}</span>
                    </div>
                    <div>QR Telemetriya Kodu: #{activeCert.qrHash}</div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopyCode(activeCert.certificateNumber)}
                      data-testid="cert-copy-btn"
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg font-semibold flex items-center space-x-1 transition-all"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Kopyalandı</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Kodu Kopyala</span>
                        </>
                      )}
                    </button>
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

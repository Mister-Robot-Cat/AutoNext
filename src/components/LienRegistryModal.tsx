import React, { useState, useMemo } from 'react';
import { Vehicle, Language } from '../types/vehicle';
import { VerificationResult } from '../types/registry';
import {
  searchRegistry,
  generateRegistryCertificate,
  formatPlateNumber,
} from '../utils/registry';
import { MOCK_REGISTRY_RECORDS } from '../data/mockRegistryDatabase';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Printer,
  Copy,
  Check,
  Scale,
  Landmark,
  Car,
  AlertOctagon,
  Calendar,
  MapPin,
  UserCheck,
  ExternalLink,
} from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock';
import { useKeyPress } from '../hooks/useKeyPress';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { toastManager } from '../hooks/useToast';

export interface LienRegistryModalProps {
  isOpen?: boolean;
  vehicle?: Vehicle | null;
  initialVehicle?: Vehicle | null;
  lang: Language;
  onClose: () => void;
  onOpenTrafficFines?: (plateNumber: string) => void;
}

const TRANSLATIONS = {
  az: {
    title: 'DİN & Girov Reyestri Yoxlanışı',
    subtitle: 'Təminatlı Əqdlərin Dövlət Reyestri və DİN Baş Dövlət Yol Polisi İdarəsi bazası',
    searchPlaceholder: 'VIN kodu və ya Dövlət Nömrəsini daxil edin (məs: 90-AA-530)',
    searchBtn: 'Reyestrdə Yoxla',
    quickPresets: 'Nümunəvi yoxlanışlar:',
    safetyScore: 'Təhlükəsizlik Reytinqi',
    verifiedAt: 'Yoxlanış Tarixi',
    certNumber: 'Arayış №',
    gateStolen: 'DİN / İnterpol Axtarış Statusu',
    gateLien: 'Təminatlı Əqdlər (Bank Girov Reyestri)',
    gateCourt: 'Məhkəmə & Ədliyyə İcraat Həbsi',
    gateFines: 'BDYPİ MMX Radar Cərimələri',
    passed: 'Qaydasında',
    warning: 'Diqqət',
    failed: 'Məhdudiyyət',
    vehicleIdTitle: 'Dövlət Qeydiyyat İdentifikasiyası',
    makeModel: 'Marka / Model',
    plate: 'Dövlət Qeydiyyat Nişanı',
    vin: 'VIN Şassi Kodu',
    engineNum: 'Mühərrik №',
    registeredCity: 'Qeydiyyat Yeri',
    legalOwner: 'Qanuni Sahibi',
    lastInspection: 'Son Texniki Baxış',
    lienDetails: 'Girov Qeydiyyatı Təfərrüatları',
    creditor: 'Kreditor Təşkilat',
    contractNum: 'Müqavilə №',
    debtAmount: 'Girov Qalıq Məbləği',
    courtDetails: 'İcraat & Məhkəmə Məhdudiyyəti',
    enforcementAgency: 'İcra Qurumu / Qərar',
    finesDetails: 'Ödənilməmiş Radar Cərimələri (MMX)',
    finesCount: 'Cərimə Sayı',
    finesTotal: 'Cəmi Məbləğ',
    certificateTab: 'Rəsmi Arayış',
    copyCert: 'Arayışı Kopyala',
    copied: 'Kopyalandı!',
    print: 'Çap Et',
    badgeOfficial: 'DÖVLƏT REYESTRİ',
  },
  en: {
    title: 'Stolen Vehicle & Lien Registry Verification',
    subtitle: 'Verified with State Collateral Registry and Ministry of Internal Affairs Database',
    searchPlaceholder: 'Enter VIN or Plate Number (e.g. 90-AA-530)',
    searchBtn: 'Verify in Registry',
    quickPresets: 'Sample verification records:',
    safetyScore: 'Trust & Safety Rating',
    verifiedAt: 'Verification Date',
    certNumber: 'Certificate №',
    gateStolen: 'Police & Interpol Stolen Search Status',
    gateLien: 'Collateral Registry (Bank Liens & Pledges)',
    gateCourt: 'Judicial Restraints & Court Enforcement',
    gateFines: 'Traffic Police Radar Fines (MMX)',
    passed: 'Clear',
    warning: 'Notice',
    failed: 'Restricted',
    vehicleIdTitle: 'Official State Registration Identity',
    makeModel: 'Make / Model',
    plate: 'License Plate Number',
    vin: 'VIN Chassis Code',
    engineNum: 'Engine Number',
    registeredCity: 'Registration Authority',
    legalOwner: 'Registered Owner',
    lastInspection: 'Last Safety Inspection',
    lienDetails: 'Bank Lien & Pledge Details',
    creditor: 'Creditor Institution',
    contractNum: 'Contract №',
    debtAmount: 'Remaining Lien Debt',
    courtDetails: 'Court Litigation & Enforcement Hold',
    enforcementAgency: 'Enforcement Department / Ruling',
    finesDetails: 'Outstanding Radar Camera Fines (MMX)',
    finesCount: 'Unpaid Fines Count',
    finesTotal: 'Total Balance Due',
    certificateTab: 'Official Certificate',
    copyCert: 'Copy Certificate',
    copied: 'Copied!',
    print: 'Print',
    badgeOfficial: 'STATE REGISTRY',
  },
  ru: {
    title: 'Проверка на угон и банковский залог (Реестр МВД)',
    subtitle: 'База Государственного реестра залогов и Главного управления дорожной полиции МВД АР',
    searchPlaceholder: 'Введите VIN или госномер (напр. 90-AA-530)',
    searchBtn: 'Проверить в реестре',
    quickPresets: 'Примеры для проверки:',
    safetyScore: 'Индекс безопасности',
    verifiedAt: 'Дата проверки',
    certNumber: 'Справка №',
    gateStolen: 'База розыска МВД и Интерпола',
    gateLien: 'Реестр залогового имущества (Банки)',
    gateCourt: 'Судебные аресты и исполнительные листы',
    gateFines: 'Штрафы с камер и радаров (ММХ)',
    passed: 'Чисто',
    warning: 'Внимание',
    failed: 'Арест',
    vehicleIdTitle: 'Регистрационные данные автомобиля',
    makeModel: 'Марка / Модель',
    plate: 'Государственный номер',
    vin: 'VIN код кузова',
    engineNum: 'Номер двигателя',
    registeredCity: 'Место регистрации',
    legalOwner: 'Зарегистрированный владелец',
    lastInspection: 'Техосмотр',
    lienDetails: 'Данные банковского залога',
    creditor: 'Кредитная организация',
    contractNum: 'Договор №',
    debtAmount: 'Сумма остатка залога',
    courtDetails: 'Судебные и исполнительные ограничения',
    enforcementAgency: 'Орган исполнения / Решение',
    finesDetails: 'Неоплаченные радары (ММХ)',
    finesCount: 'Количество штрафов',
    finesTotal: 'Общая задолженность',
    certificateTab: 'Официальная справка',
    copyCert: 'Копировать справку',
    copied: 'Скопировано!',
    print: 'Печать',
    badgeOfficial: 'ГОС. РЕЕСТР',
  },
};

export const LienRegistryModal: React.FC<LienRegistryModalProps> = ({
  isOpen = true,
  vehicle = null,
  initialVehicle = null,
  lang,
  onClose,
  onOpenTrafficFines,
}) => {
  const targetCar = vehicle || initialVehicle || null;
  const t = TRANSLATIONS[lang] || TRANSLATIONS.az;

  const [searchQuery, setSearchQuery] = useState<string>(() => {
    return targetCar?.vin || 'WBA5A7C50JB192841';
  });

  const [activeQuery, setActiveQuery] = useState<string>(() => {
    return targetCar?.vin || 'WBA5A7C50JB192841';
  });

  const [showCertificate, setShowCertificate] = useState(false);
  const [copiedCert, copyCertText] = useCopyToClipboard();

  useScrollLock(isOpen);
  useKeyPress('Escape', onClose);

  const verificationResult: VerificationResult = useMemo(() => {
    return searchRegistry(activeQuery);
  }, [activeQuery]);

  const certificateText = useMemo(() => {
    return generateRegistryCertificate(verificationResult);
  }, [verificationResult]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveQuery(searchQuery.trim());
    }
  };

  const handleApplyPreset = (queryStr: string) => {
    setSearchQuery(queryStr);
    setActiveQuery(queryStr);
    toastManager.add(`Sorğu göndərildi: ${queryStr}`, 'info');
  };

  if (!isOpen) return null;

  const rec = verificationResult.record;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-rose-600 via-amber-500 to-emerald-400 p-0.5 shadow-lg shadow-rose-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
                <Scale className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">{t.title}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {t.badgeOfficial}
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-1">{t.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCertificate(!showCertificate)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                showCertificate
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t.certificateTab}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              aria-label="Bağla"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar & Sample Pills */}
        <div className="p-4 sm:p-6 bg-slate-950/40 border-b border-slate-800 space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs sm:text-sm uppercase tracking-wider focus:border-amber-500 focus:outline-none placeholder:normal-case placeholder:font-sans placeholder:text-slate-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-amber-600/20 whitespace-nowrap"
            >
              {t.searchBtn}
            </button>
          </form>

          {/* Quick Presets */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase whitespace-nowrap">
              {t.quickPresets}
            </span>
            {[
              { label: 'BMW 530i (Təmiz)', query: '90-AA-530', badge: 'Təmiz' },
              { label: 'Camry (Bağlanmış Kredit)', query: '77-TC-070', badge: 'Xitam' },
              { label: 'Tucson (Kapital Bank Girov)', query: '99-KB-412', badge: 'Girov' },
              { label: 'Ford (Məhkəmə Həbsi)', query: '1FMCU0G68KUA71924', badge: 'Həbs' },
              { label: 'Range Rover (DİN Axtarış)', query: '99-ST-007', badge: 'Axtarış' },
            ].map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p.query)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white whitespace-nowrap transition-colors flex items-center gap-1.5"
              >
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {showCertificate ? (
            /* OFFICIAL CERTIFICATE VIEW */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">
                  {t.certificateTab} №: {verificationResult.certificateId}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      copyCertText(certificateText);
                      toastManager.add('Arayış mətni buferə kopyalandı!', 'success');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold flex items-center gap-1.5 transition-all"
                  >
                    {copiedCert ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCert ? t.copied : t.copyCert}</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs text-white font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{t.print}</span>
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs sm:text-sm text-slate-300 whitespace-pre-wrap overflow-x-auto leading-relaxed shadow-inner">
                {certificateText}
              </div>
            </div>
          ) : (
            /* INTERACTIVE VERIFICATION OVERVIEW */
            <div className="space-y-6">
              {/* Verdict Banner */}
              <div
                className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  verificationResult.verdict === 'clean_title'
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : verificationResult.verdict === 'caution_advisory'
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-rose-950/20 border-rose-500/30'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-3 rounded-2xl mt-0.5 ${
                      verificationResult.verdict === 'clean_title'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : verificationResult.verdict === 'caution_advisory'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {verificationResult.verdict === 'clean_title' ? (
                      <ShieldCheck className="w-7 h-7" />
                    ) : verificationResult.verdict === 'caution_advisory' ? (
                      <ShieldAlert className="w-7 h-7" />
                    ) : (
                      <ShieldX className="w-7 h-7" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <span
                      className={`text-xs font-black uppercase tracking-wider block ${
                        verificationResult.verdict === 'clean_title'
                          ? 'text-emerald-400'
                          : verificationResult.verdict === 'caution_advisory'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {verificationResult.verdictTitleAz}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                      {verificationResult.verdictDescriptionAz}
                    </p>
                  </div>
                </div>

                {/* Safety Score Meter */}
                <div className="flex-shrink-0 text-left sm:text-right w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">
                    {t.safetyScore}
                  </span>
                  <div
                    className={`text-3xl font-black ${
                      verificationResult.safetyScore >= 90
                        ? 'text-emerald-400'
                        : verificationResult.safetyScore >= 60
                        ? 'text-amber-400'
                        : 'text-rose-500'
                    }`}
                  >
                    {verificationResult.safetyScore} / 100
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {verificationResult.certificateId}
                  </span>
                </div>
              </div>

              {/* 4 Security Gates Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Gate 1: Stolen / Police Check */}
                <div
                  className={`p-4 rounded-2xl border space-y-2 ${
                    verificationResult.checks.stolenCheckPassed
                      ? 'bg-slate-950/60 border-slate-800'
                      : 'bg-rose-950/20 border-rose-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Car className="w-4 h-4 text-slate-400" />
                    {verificationResult.checks.stolenCheckPassed ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {t.passed}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> {t.failed}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-white">{t.gateStolen}</div>
                  <p className="text-[11px] text-slate-400">
                    {rec?.policeStatus === 'clear'
                      ? 'DİN və İnterpol axtarış bazasında qeyd yoxdur'
                      : `Axtarışdadır: ${rec?.policeRecordDate || 'Aktiv'}`}
                  </p>
                </div>

                {/* Gate 2: Bank Lien Check */}
                <div
                  className={`p-4 rounded-2xl border space-y-2 ${
                    verificationResult.checks.lienCheckPassed
                      ? 'bg-slate-950/60 border-slate-800'
                      : 'bg-amber-950/20 border-amber-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Landmark className="w-4 h-4 text-slate-400" />
                    {verificationResult.checks.lienCheckPassed ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {t.passed}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {t.warning}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-white">{t.gateLien}</div>
                  <p className="text-[11px] text-slate-400">
                    {rec?.lienStatus === 'clean'
                      ? 'Bank girovunda deyil, sərbəst mülkiyyət'
                      : rec?.lienStatus === 'pledged_discharged'
                      ? 'Kredit tam bağlanıb, xitam verilib'
                      : `${rec?.lienCreditor}: ₼${rec?.lienAmountAzn?.toLocaleString()}`}
                  </p>
                </div>

                {/* Gate 3: Court Arrest Check */}
                <div
                  className={`p-4 rounded-2xl border space-y-2 ${
                    verificationResult.checks.courtCheckPassed
                      ? 'bg-slate-950/60 border-slate-800'
                      : 'bg-rose-950/20 border-rose-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Scale className="w-4 h-4 text-slate-400" />
                    {verificationResult.checks.courtCheckPassed ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {t.passed}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> {t.failed}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-white">{t.gateCourt}</div>
                  <p className="text-[11px] text-slate-400">
                    {rec?.legalRestriction === 'none'
                      ? 'Məhkəmə və icraat həbsi qoyulmayıb'
                      : rec?.enforcementAgency || 'Məhkəmə qərarı ilə həbsdə'}
                  </p>
                </div>

                {/* Gate 4: Fines Check */}
                <div
                  className={`p-4 rounded-2xl border space-y-2 ${
                    verificationResult.checks.finesCheckPassed
                      ? 'bg-slate-950/60 border-slate-800'
                      : 'bg-amber-950/20 border-amber-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <AlertOctagon className="w-4 h-4 text-slate-400" />
                    {verificationResult.checks.finesCheckPassed ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {t.passed}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {t.warning}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-white">{t.gateFines}</div>
                  <p className="text-[11px] text-slate-400">
                    {rec?.unpaidFinesCount === 0
                      ? '0 AZN aktiv MMX cərimə borcu yoxdur'
                      : `${rec?.unpaidFinesCount} cərimə: ₼${rec?.unpaidFinesAmountAzn}`}
                  </p>
                  {onOpenTrafficFines && rec && rec.unpaidFinesCount > 0 && (
                    <button
                      type="button"
                      onClick={() => onOpenTrafficFines(rec.plateNumber)}
                      data-testid="gate-fines-inspect-btn"
                      className="mt-1 text-[10px] text-rose-400 hover:text-rose-300 font-semibold underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>MMX Cərimələrini Aç & Ödə</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Identification Details Card */}
              {rec && (
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-amber-400" />
                    <span>{t.vehicleIdTitle}</span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                        {t.makeModel}
                      </span>
                      <span className="font-bold text-white truncate block">
                        {rec.make} {rec.model} ({rec.year})
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                        {t.plate}
                      </span>
                      <span className="font-mono font-bold text-amber-400 block">
                        {rec.plateNumber}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                        {t.vin}
                      </span>
                      <span className="font-mono font-bold text-slate-300 truncate block">
                        {rec.vin}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                        {t.registeredCity}
                      </span>
                      <span className="font-medium text-slate-300 block">
                        {rec.registrationCity}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                        {t.legalOwner}
                      </span>
                      <span className="font-medium text-slate-300">{rec.ownerFullName}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                        {t.engineNum}
                      </span>
                      <span className="font-mono text-slate-300">{rec.engineNumber}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                        {t.lastInspection}
                      </span>
                      <span className="text-slate-300">{rec.lastInspectionDate}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

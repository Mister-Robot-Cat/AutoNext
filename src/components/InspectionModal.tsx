import React, { useState, useMemo, useEffect } from 'react';
import { Vehicle, Currency, Language } from '../types/vehicle';
import { formatPrice } from '../utils/i18n';
import {
  InspectionCategory,
  InspectionItem,
  InspectionStatus,
  InspectionReport,
} from '../types/inspection';
import {
  INSPECTION_CATEGORIES,
  generateInspectionReport,
  recalculateInspectionReport,
  filterInspectionItems,
  clearDtcCodes,
} from '../utils/inspection';
import {
  X,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Cpu,
  Gauge as GaugeIcon,
  Search,
  Printer,
  Copy,
  Check,
  Zap,
  Activity,
  Layers,
  Thermometer,
  RotateCcw,
  BadgeAlert,
  ClipboardCheck,
  FileCheck2,
} from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock';
import { useKeyPress } from '../hooks/useKeyPress';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { toastManager } from '../hooks/useToast';

export interface InspectionModalProps {
  isOpen?: boolean;
  vehicle: Vehicle | null;
  currency: Currency;
  lang: Language;
  onClose: () => void;
}

type TabType = 'overview' | 'obd2' | 'paint' | 'checklist' | 'certificate';

const TRANSLATIONS = {
  az: {
    title: '150-Nöqtəli Diaqnostika & OBD-II Simulyatoru',
    subtitle: 'Müstəqil mütəxəssis tərəfindən fiziki və kompüter diaqnostikası nəticələri',
    healthScore: 'Ümumi Texniki Vəziyyət',
    verdict: 'Mütəxəssis Qərarı',
    repairBudget: 'Təxmini Təmir Büdcəsi',
    findings: 'Aşkar Edilən Nəticələr',
    tabOverview: 'Xülasə & Kateqoriyalar',
    tabObd: 'OBD-II Skaneri',
    tabPaint: 'Boya & Mikrometr',
    tabChecklist: '150-Nöqtəli Vərəqə',
    tabCertificate: 'Rəsmi Akt',
    searchPlaceholder: 'Yoxlama bəndlərini axtarın...',
    allCategories: 'Bütün Sistemlər',
    allStatuses: 'Hamısı',
    statusPass: 'Qaydasında',
    statusAdvisory: 'Müşahidə',
    statusFail: 'Qüsur',
    dtcActive: 'Aktiv DTC Xətası',
    dtcClearBtn: 'DTC Kodları Təmizlə (ECU Reset)',
    dtcClearedSuccess: 'OBD-II xəta kodları ECU yaddaşından uğurla təmizləndi!',
    liveTelemetry: 'Canlı Sensor Telemetriyası',
    monitorsTitle: 'Emissiya Hazırlıq Monitorları (I/M Readiness)',
    paintLegendOriginal: 'Zavod boyası (80-150 µm)',
    paintLegendRepainted: 'İkinci qat boya (151-320 µm)',
    paintLegendPutty: 'Şpatlyovka / Dərin bərpa (>320 µm)',
    printReport: 'Çap Et',
    copySummary: 'Hesabatı Kopyala',
    copied: 'Kopyalandı!',
    resetSimulator: 'Simulyasiyanı Sıfırla',
    inspectorLabel: 'Diaqnostika Mühəndisi',
    stationLabel: 'Diaqnostika Mərkəzi',
    officialStamp: 'RƏSMİ TƏSDİQLƏNİB',
  },
  en: {
    title: '150-Point Inspection & OBD-II Simulator',
    subtitle: 'Comprehensive pre-purchase mechanical and computerized diagnostic assessment',
    healthScore: 'Overall Vehicle Health',
    verdict: 'Expert Verdict',
    repairBudget: 'Est. Repair Budget',
    findings: 'Diagnostic Findings',
    tabOverview: 'Summary & Categories',
    tabObd: 'OBD-II Scanner',
    tabPaint: 'Paint & Body Gauge',
    tabChecklist: '150-Point Checklist',
    tabCertificate: 'Official Certificate',
    searchPlaceholder: 'Search inspection checklist...',
    allCategories: 'All Systems',
    allStatuses: 'All',
    statusPass: 'Passed',
    statusAdvisory: 'Advisory',
    statusFail: 'Failed',
    dtcActive: 'Active DTC Faults',
    dtcClearBtn: 'Clear DTC Codes (ECU Reset)',
    dtcClearedSuccess: 'OBD-II trouble codes were successfully cleared from ECU memory!',
    liveTelemetry: 'Live Sensor Telemetry',
    monitorsTitle: 'I/M Emission Readiness Monitors',
    paintLegendOriginal: 'Factory paint (80-150 µm)',
    paintLegendRepainted: 'Repainted (151-320 µm)',
    paintLegendPutty: 'Body Filler / Putty (>320 µm)',
    printReport: 'Print',
    copySummary: 'Copy Report',
    copied: 'Copied!',
    resetSimulator: 'Reset Simulator',
    inspectorLabel: 'Diagnostic Engineer',
    stationLabel: 'Testing Facility',
    officialStamp: 'OFFICIALLY CERTIFIED',
  },
  ru: {
    title: '150-Точечная Диагностика и OBD-II Симулятор',
    subtitle: 'Результаты независимой компьютерной и физической проверки автомобиля',
    healthScore: 'Общее техсостояние',
    verdict: 'Вердикт эксперта',
    repairBudget: 'Расчет стоимости ремонта',
    findings: 'Результаты проверки',
    tabOverview: 'Сводка и Системы',
    tabObd: 'OBD-II Сканер',
    tabPaint: 'Толщиномер ЛКП',
    tabChecklist: 'Чек-лист 150 пунктов',
    tabCertificate: 'Акт диагностики',
    searchPlaceholder: 'Поиск по чек-листу...',
    allCategories: 'Все системы',
    allStatuses: 'Все',
    statusPass: 'В норме',
    statusAdvisory: 'Внимание',
    statusFail: 'Дефект',
    dtcActive: 'Активные ошибки DTC',
    dtcClearBtn: 'Сбросить ошибки DTC (Сброс ЭБУ)',
    dtcClearedSuccess: 'Коды ошибок OBD-II успешно удалены из памяти ЭБУ!',
    liveTelemetry: 'Телеметрия датчиков',
    monitorsTitle: 'Мониторы готовности (I/M Readiness)',
    paintLegendOriginal: 'Заводской окрас (80-150 мкм)',
    paintLegendRepainted: 'Вторичный окрас (151-320 мкм)',
    paintLegendPutty: 'Шпатлевка (>320 мкм)',
    printReport: 'Печать',
    copySummary: 'Копировать отчет',
    copied: 'Скопировано!',
    resetSimulator: 'Сброс симулятора',
    inspectorLabel: 'Инженер-диагност',
    stationLabel: 'Диагностический центр',
    officialStamp: 'ОФИЦИАЛЬНО ЗАВЕРЕНО',
  },
};

export const InspectionModal: React.FC<InspectionModalProps> = ({
  isOpen = true,
  vehicle,
  currency,
  lang,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [report, setReport] = useState<InspectionReport | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<InspectionCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<InspectionStatus | 'all'>('all');
  const [copiedText, copyToClipboard] = useCopyToClipboard();

  useScrollLock(isOpen && !!vehicle);
  useKeyPress('Escape', onClose);

  // Initialize or re-generate report when vehicle changes
  useEffect(() => {
    if (vehicle) {
      const initialReport = generateInspectionReport(vehicle);
      setReport(initialReport);
    }
  }, [vehicle]);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.az;

  // Filtered Checklist items
  const filteredItems = useMemo(() => {
    if (!report) return [];
    return filterInspectionItems(report.items, searchQuery, selectedCategory, selectedStatus);
  }, [report, searchQuery, selectedCategory, selectedStatus]);

  if (!isOpen || !vehicle || !report) return null;

  // Toggle status of a single checklist item
  const handleToggleItemStatus = (itemId: string, newStatus: InspectionStatus) => {
    if (!report) return;
    const updatedItems = report.items.map((it) => {
      if (it.id === itemId) {
        return {
          ...it,
          status: newStatus,
          estimatedRepairAzn: newStatus === 'pass' ? 0 : it.estimatedRepairAzn > 0 ? it.estimatedRepairAzn : 100,
        };
      }
      return it;
    });

    const updatedReport = recalculateInspectionReport(
      report,
      updatedItems,
      report.dtcCodes,
      report.paintPanels
    );
    setReport(updatedReport);
  };

  // Clear DTC Codes simulation
  const handleClearDtc = () => {
    if (!report) return;
    const cleared = clearDtcCodes();
    const updatedReport = recalculateInspectionReport(
      report,
      report.items,
      cleared,
      report.paintPanels
    );
    setReport(updatedReport);
    toastManager.add(t.dtcClearedSuccess, 'success');
  };

  // Reset Simulator
  const handleResetSimulator = () => {
    if (!vehicle) return;
    const fresh = generateInspectionReport(vehicle);
    setReport(fresh);
    toastManager.add('Diaqnostika simulyatoru ilkin vəziyyətinə qaytarıldı.', 'info');
  };

  // Copy Summary text
  const handleCopySummary = () => {
    const summaryText = `[AutoNext Diaqnostika Hesabatı]
Avtomobil: ${report.vehicleTitle}
VIN: ${report.vehicleVin}
Ümumi Vəziyyət: ${report.overallScore}/100
Qərar: ${report.recommendationLabel}
Keçən: ${report.passedCount} | Müşahidə: ${report.advisoryCount} | Qüsur: ${report.failedCount}
Təxmini Təmir Büdcəsi: ${report.totalEstimatedRepairAzn} AZN
Aktiv DTC Kodları: ${report.dtcCodes.length} ədəd
Yoxlama Mərkəzi: ${report.inspectionStation}`;

    copyToClipboard(summaryText);
    toastManager.add('Diaqnostika xülasəsi kopyalandı!', 'success');
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 65) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  const getRecommendationBadge = () => {
    if (report.recommendation === 'recommended') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <CheckCircle className="w-3.5 h-3.5" />
          {report.recommendationLabel}
        </span>
      );
    }
    if (report.recommendation === 'conditional') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
          <AlertTriangle className="w-3.5 h-3.5" />
          {report.recommendationLabel}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
        <XCircle className="w-3.5 h-3.5" />
        {report.recommendationLabel}
      </span>
    );
  };

  return (
    <div
      data-testid="inspection-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-white">{t.title}</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-cyan-400 border border-slate-700">
                  VIN: {report.vehicleVin}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">{t.subtitle} • {report.vehicleTitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              title={t.copySummary}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedText ? t.copied : t.copySummary}</span>
            </button>
            <button
              onClick={() => window.print()}
              title={t.printReport}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.printReport}</span>
            </button>
            <button
              onClick={onClose}
              data-testid="inspection-modal-close-btn"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top KPI Cards Overview */}
        <div className="p-4 sm:p-5 bg-slate-950/40 border-b border-slate-800/80 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Overall Health Score */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center font-black text-lg ${getScoreColor(report.overallScore)}`}>
              {report.overallScore}
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">{t.healthScore}</span>
              <span className="text-sm font-bold text-white">/ 100 Bal</span>
            </div>
          </div>

          {/* Verdict */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{t.verdict}</span>
            <div>{getRecommendationBadge()}</div>
          </div>

          {/* Repair Budget */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{t.repairBudget}</span>
            <div className="text-base font-black text-amber-400 mt-0.5">
              {formatPrice(report.totalEstimatedRepairAzn, currency)}
            </div>
          </div>

          {/* Findings */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{t.findings}</span>
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-emerald-400" title="Passed">{report.passedCount} ✓</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400" title="Advisory">{report.advisoryCount} !</span>
              <span className="text-slate-600">•</span>
              <span className="text-rose-400" title="Failed">{report.failedCount} ✗</span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400" title="DTC Codes">{report.dtcCodes.length} DTC</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 sm:px-6 overflow-x-auto gap-2">
          {[
            { id: 'overview', label: t.tabOverview, icon: Activity },
            { id: 'obd2', label: t.tabObd, icon: Cpu },
            { id: 'paint', label: t.tabPaint, icon: GaugeIcon },
            { id: 'checklist', label: t.tabChecklist, icon: Layers },
            { id: 'certificate', label: t.tabCertificate, icon: FileCheck2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                data-testid={`inspection-tab-${tab.id}`}
                className={`py-3 px-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body / Tab Contents */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Recommendation Notes Alert */}
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                  report.recommendation === 'recommended'
                    ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                    : report.recommendation === 'conditional'
                    ? 'bg-amber-950/20 border-amber-800/40 text-amber-300'
                    : 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                }`}
              >
                <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm space-y-1">
                  <div className="font-bold text-white text-sm">
                    {report.recommendationLabel} — Rəsmi Rəy
                  </div>
                  <p className="leading-relaxed opacity-90">{report.recommendationNotes}</p>
                </div>
              </div>

              {/* Category Scores Grid */}
              <div>
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Sistemlər üzrə Diaqnostik Qiymətləndirmə
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {INSPECTION_CATEGORIES.map((cat) => {
                    const score = report.categoryScores[cat.id];
                    return (
                      <div
                        key={cat.id}
                        className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm">
                            {lang === 'en' ? cat.nameEn : lang === 'ru' ? cat.nameRu : cat.nameAz}
                          </span>
                          <span className={`text-xs font-black px-2 py-0.5 rounded-lg border ${getScoreColor(score)}`}>
                            {score}%
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1">{cat.descriptionAz}</p>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              score >= 85 ? 'bg-emerald-500' : score >= 65 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Critical & Advisory Issues List */}
              {report.advisoryCount + report.failedCount > 0 && (
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <BadgeAlert className="w-4 h-4 text-amber-400" />
                    Diqqət Tələb Edən Qüsurlar və Tövsiyələr ({report.advisoryCount + report.failedCount})
                  </h4>
                  <div className="space-y-2">
                    {report.items
                      .filter((it) => it.status !== 'pass')
                      .map((issue) => (
                        <div
                          key={issue.id}
                          className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  issue.status === 'fail'
                                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                }`}
                              >
                                {issue.status === 'fail' ? t.statusFail : t.statusAdvisory}
                              </span>
                              <strong className="text-white">{issue.title}</strong>
                            </div>
                            <p className="text-slate-400">{issue.description}</p>
                          </div>
                          {issue.estimatedRepairAzn > 0 && (
                            <span className="font-mono font-bold text-amber-400 whitespace-nowrap">
                              +{formatPrice(issue.estimatedRepairAzn, currency)}
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: OBD-II LIVE SCANNER */}
          {activeTab === 'obd2' && (
            <div className="space-y-6">
              {/* Header and Clear DTC action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-cyan-950/20 border border-cyan-800/30">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    ECU Mühərrik və Transmissiya Blokunun Diaqnostikası
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Protokol: ISO 15765-4 (CAN 500k/11bit) • Status: Əlaqə quruldu
                  </p>
                </div>
                {report.dtcCodes.length > 0 && (
                  <button
                    onClick={handleClearDtc}
                    data-testid="clear-dtc-btn"
                    className="py-2 px-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t.dtcClearBtn}</span>
                  </button>
                )}
              </div>

              {/* DTC Trouble Codes */}
              <div>
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Xəta Kodları ({report.dtcCodes.length} DTC)
                </h5>
                {report.dtcCodes.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
                    <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                    <h5 className="font-bold text-white text-sm">ECU Yaddaşında Xəta Yoxdur</h5>
                    <p className="text-xs text-slate-400">
                      Bütün elektron idarəetmə blokları (ECU, TCU, ABS, SRS) qüsursuz işləyir.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {report.dtcCodes.map((dtc) => (
                      <div
                        key={dtc.code}
                        className="p-4 rounded-2xl bg-slate-950/60 border border-rose-900/40 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-black px-2.5 py-0.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                {dtc.code}
                              </span>
                              <span className="text-xs font-bold text-slate-300">{dtc.system}</span>
                            </div>
                            <h6 className="font-bold text-white text-sm">{dtc.title}</h6>
                            <p className="text-xs text-slate-400">{dtc.description}</p>
                          </div>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            {dtc.severity}
                          </span>
                        </div>

                        {dtc.freezeFrame && (
                          <div className="pt-2 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            <div className="p-2 rounded-lg bg-slate-900">
                              <span className="text-slate-500 block text-[10px]">RPM</span>
                              <span className="font-mono font-bold text-white">{dtc.freezeFrame.rpm} dövr</span>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-900">
                              <span className="text-slate-500 block text-[10px]">Soyutma Temp</span>
                              <span className="font-mono font-bold text-white">{dtc.freezeFrame.coolantTempC}°C</span>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-900">
                              <span className="text-slate-500 block text-[10px]">Sürət</span>
                              <span className="font-mono font-bold text-white">{dtc.freezeFrame.vehicleSpeedKmh} km/s</span>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-900">
                              <span className="text-slate-500 block text-[10px]">LTFT Yanacaq</span>
                              <span className="font-mono font-bold text-white">+{dtc.freezeFrame.ltftPercent}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Live Telemetry Sensors */}
              <div>
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  {t.liveTelemetry}
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Generator / Akkumulyator
                    </span>
                    <div className="text-lg font-black text-white font-mono">
                      {report.liveSensors.batteryVoltage} V
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                      Soyutma Mayesi (Coolant)
                    </span>
                    <div className="text-lg font-black text-white font-mono">
                      {report.liveSensors.coolantTempC}°C
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <GaugeIcon className="w-3.5 h-3.5 text-cyan-400" />
                      Mühərrik Dövriyyəsi (RPM)
                    </span>
                    <div className="text-lg font-black text-white font-mono">
                      {report.liveSensors.engineRpm} dövr/dəq
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400">Yağ Təzyiqi (İşçi)</span>
                    <div className="text-lg font-black text-white font-mono">
                      {report.liveSensors.oilPressureBar} bar
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400">MAF Hava Sərfiyyatı</span>
                    <div className="text-lg font-black text-white font-mono">
                      {report.liveSensors.mafFlowRateGps} q/san
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400">Giriş Hava Hərarəti</span>
                    <div className="text-lg font-black text-white font-mono">
                      {report.liveSensors.intakeAirTempC}°C
                    </div>
                  </div>
                </div>
              </div>

              {/* Readiness Monitors */}
              <div>
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  {t.monitorsTitle}
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {report.readinessMonitors.map((mon) => (
                    <div
                      key={mon.id}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <span className="text-slate-300 font-medium">{mon.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                          mon.status === 'ready'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {mon.status === 'ready' ? 'Hazırdır' : 'Hazır deyil'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PAINT THICKNESS GAUGE */}
          {activeTab === 'paint' && (
            <div className="space-y-6">
              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
                <span className="text-slate-400 font-semibold">Mikrometr Göstəricisi:</span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  {t.paintLegendOriginal}
                </span>
                <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  {t.paintLegendRepainted}
                </span>
                <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  {t.paintLegendPutty}
                </span>
              </div>

              {/* Panels Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {report.paintPanels.map((panel) => {
                  const isOrig = panel.status === 'original';
                  const isRep = panel.status === 'repainted';
                  const isPutty = panel.status === 'putty_filler';

                  const badgeClass = isOrig
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : isRep
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30';

                  const statusLabel = isOrig ? 'Zavod boyası' : isRep ? 'İkinci qat' : 'Şpatlyovka';

                  return (
                    <div
                      key={panel.panelId}
                      className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <strong className="text-sm font-bold text-white">{panel.panelName}</strong>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeClass}`}>
                          {statusLabel}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between">
                        <div className="text-2xl font-black text-white font-mono">
                          {panel.microns}{' '}
                          <span className="text-xs font-normal text-slate-400 font-sans">µm</span>
                        </div>
                        <span className="text-[11px] text-slate-500">Standart: {panel.standardRange}</span>
                      </div>

                      {/* Visual gauge meter */}
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isOrig ? 'bg-emerald-500' : isRep ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, (panel.microns / 600) * 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: 150-POINT CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              {/* Filter controls */}
              <div className="flex flex-col md:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    data-testid="inspection-search-input"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                {/* Category select */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  data-testid="inspection-category-select"
                  className="px-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">{t.allCategories}</option>
                  {INSPECTION_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {lang === 'en' ? cat.nameEn : lang === 'ru' ? cat.nameRu : cat.nameAz}
                    </option>
                  ))}
                </select>

                {/* Status select */}
                <div className="flex rounded-xl bg-slate-950/80 border border-slate-700 p-1">
                  {(['all', 'pass', 'advisory', 'fail'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setSelectedStatus(st)}
                      data-testid={`status-filter-${st}`}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedStatus === st
                          ? 'bg-cyan-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {st === 'all'
                        ? t.allStatuses
                        : st === 'pass'
                        ? t.statusPass
                        : st === 'advisory'
                        ? t.statusAdvisory
                        : t.statusFail}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2.5">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-white text-sm font-bold">{item.title}</strong>
                        {item.measuredValue && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                            Ölçü: {item.measuredValue}
                          </span>
                        )}
                        {item.standardValue && (
                          <span className="text-[11px] text-slate-500">Norma: {item.standardValue}</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{item.description}</p>
                    </div>

                    {/* Interactive Status toggle */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        onClick={() => handleToggleItemStatus(item.id, 'pass')}
                        data-testid={`toggle-pass-${item.id}`}
                        title="Mark Pass"
                        className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all ${
                          item.status === 'pass'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-sm shadow-emerald-500/20'
                            : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-white'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{t.statusPass}</span>
                      </button>

                      <button
                        onClick={() => handleToggleItemStatus(item.id, 'advisory')}
                        data-testid={`toggle-advisory-${item.id}`}
                        title="Mark Advisory"
                        className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all ${
                          item.status === 'advisory'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-sm shadow-amber-500/20'
                            : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-white'
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{t.statusAdvisory}</span>
                      </button>

                      <button
                        onClick={() => handleToggleItemStatus(item.id, 'fail')}
                        data-testid={`toggle-fail-${item.id}`}
                        title="Mark Fail"
                        className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all ${
                          item.status === 'fail'
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-sm shadow-rose-500/20'
                            : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-white'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{t.statusFail}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: OFFICIAL CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 text-slate-200 space-y-6 max-w-3xl mx-auto shadow-2xl relative overflow-hidden">
              {/* Certificate watermark stamp */}
              <div className="absolute right-6 top-6 select-none pointer-events-none opacity-10 font-black text-6xl text-cyan-400 rotate-12 border-4 border-cyan-400 p-4 rounded-3xl">
                {t.officialStamp}
              </div>

              {/* Cert Header */}
              <div className="border-b border-slate-800 pb-5 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-cyan-400" />
                    <h4 className="text-xl font-black text-white uppercase tracking-wider">
                      AutoNext MasterLab Diaqnostika Aktı
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Akt № ANX-{report.vehicleVin.slice(-6)}-2026 • Tarix: {report.inspectionDate}
                  </p>
                </div>
                <div className="text-right text-xs">
                  <span className="text-slate-400 block">{t.inspectorLabel}:</span>
                  <strong className="text-white">{report.inspectorName}</strong>
                  <span className="text-[11px] text-cyan-400 font-mono block">
                    Lisenziya: {report.inspectorBadgeNumber}
                  </span>
                </div>
              </div>

              {/* Cert Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block">Avtomobil</span>
                  <strong className="text-white">{report.vehicleTitle}</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block">VIN Kod</span>
                  <strong className="text-white font-mono">{report.vehicleVin}</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block">Yekun Bal</span>
                  <strong className="text-cyan-400 font-black text-sm">{report.overallScore} / 100</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block">Qərar</span>
                  <strong className="text-emerald-400">{report.recommendationLabel}</strong>
                </div>
              </div>

              {/* Station information */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block">{t.stationLabel}:</span>
                  <strong className="text-white">{report.inspectionStation}</strong>
                </div>
                <button
                  onClick={handleResetSimulator}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t.resetSimulator}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

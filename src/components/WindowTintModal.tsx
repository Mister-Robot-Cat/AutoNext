import React, { useState, useMemo } from 'react';
import {
  Sun,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  Printer,
  Copy,
  Check,
  FileText,
  Sliders,
  Scan,
  Info,
  Car,
  QrCode,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Vehicle, Currency } from '../types/vehicle';
import {
  ApplicantType,
  GlassZone,
  PermitCoverage,
  PhotometerReading,
  TintPermitCertificate,
  WindowTintConfig,
} from '../types/windowTint';
import {
  evaluateOverallCompliance,
  calculatePermitCost,
  simulatePhotometerReading,
  generateTintPermitCertificate,
  STATUTORY_VLT_LIMITS,
  STATUTORY_PENALTY_ARTICLE,
} from '../utils/windowTint';
import { MOCK_TINT_PRESETS } from '../data/mockTintData';

export interface WindowTintModalProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  currency: Currency;
  lang: 'az' | 'en' | 'ru';
  onClose: () => void;
}

type TabType = 'visualizer' | 'calculator' | 'certificate' | 'regulations';

export const WindowTintModal: React.FC<WindowTintModalProps> = ({
  isOpen,
  vehicle,
  currency,
  lang,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('visualizer');
  const [copiedPermit, setCopiedPermit] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [photometerReading, setPhotometerReading] = useState<PhotometerReading | null>(null);

  // Configuration State
  const [config, setConfig] = useState<WindowTintConfig>({
    windshieldVlt: 80,
    frontSideVlt: 75,
    rearSideVlt: 65,
    rearVlt: 60,
    hasPermit: false,
    permitCoverage: 'rear_side_only',
    hasFactoryCurtains: false,
    hasAthermalFilm: true,
  });

  // Permit Form State
  const [applicantType, setApplicantType] = useState<ApplicantType>('individual');
  const [permitCoverage, setPermitCoverage] = useState<PermitCoverage>('rear_side_only');
  const [ownerName, setOwnerName] = useState(vehicle?.seller.name || 'Tural Məmmədov');
  const [ownerPin, setOwnerPin] = useState('7A9B3C1');

  // Generated Certificate
  const [certificate, setCertificate] = useState<TintPermitCertificate | null>(null);

  // Compute Compliance Report
  const compliance = useMemo(() => {
    return evaluateOverallCompliance(config);
  }, [config]);

  // Compute Permit Cost
  const permitCost = useMemo(() => {
    return calculatePermitCost(applicantType, permitCoverage, currency);
  }, [applicantType, permitCoverage, currency]);

  if (!isOpen) return null;

  const plateNumber = vehicle?.plateNumber || '99-XX-777';
  const vinNumber = vehicle?.vin || 'WBA5A7C50JB192841';

  // Apply a preset
  const handleApplyPreset = (presetId: string) => {
    const preset = MOCK_TINT_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setConfig({ ...preset.config });
      setPhotometerReading(null);
    }
  };

  // Run optical photometer scan
  const handleRunPhotometer = (zone: GlassZone) => {
    setIsScanning(true);
    let targetVlt = config.frontSideVlt;
    if (zone === 'windshield') targetVlt = config.windshieldVlt;
    if (zone === 'rearSide') targetVlt = config.rearSideVlt;
    if (zone === 'rear') targetVlt = config.rearVlt;

    setTimeout(() => {
      const reading = simulatePhotometerReading(zone, targetVlt, Date.now());
      setPhotometerReading(reading);
      setIsScanning(false);
    }, 600);
  };

  // Generate certificate and switch to certificate tab
  const handleIssuePermit = () => {
    const cert = generateTintPermitCertificate({
      plateNumber,
      vin: vinNumber,
      ownerName,
      ownerPin,
      applicantType,
      coverage: permitCoverage,
    });
    setCertificate(cert);
    setConfig((prev) => ({
      ...prev,
      hasPermit: true,
      permitCoverage,
      rearSideVlt: 5,
      rearVlt: permitCoverage === 'all_rear' ? 5 : prev.rearVlt,
    }));
    setActiveTab('certificate');
  };

  const handleCopyPermitNumber = () => {
    if (!certificate) return;
    navigator.clipboard.writeText(certificate.permitNumber);
    setCopiedPermit(true);
    setTimeout(() => setCopiedPermit(false), 2000);
  };

  const currencySymbol = currency === 'AZN' ? '₼' : currency === 'USD' ? '$' : '€';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      data-testid="window-tint-modal"
    >
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sun className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  {lang === 'az'
                    ? 'BDYP Şüşələrin Qanuni Tündləşdirilməsi & Plyonka Portalı'
                    : lang === 'en'
                    ? 'Official Window Tint & Light Transmittance Permit Portal'
                    : 'Портал законной тонировки стекол BDYP'}
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                  DİN BDYP
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {vehicle
                  ? `${vehicle.year} ${vehicle.make} ${vehicle.model} • ${plateNumber}`
                  : 'İşıqburaxma qabiliyyəti standartları və illik dövlət icazəsi'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            data-testid="window-tint-close-btn"
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/20 px-6 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('visualizer')}
            data-testid="tab-visualizer-btn"
            className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'visualizer'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>
              {lang === 'az' ? 'Şüşə Simulyatoru & Fotometr' : lang === 'en' ? 'Visualizer & Photometer' : 'Симулятор и фотометр'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            data-testid="tab-calculator-btn"
            className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'calculator'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {lang === 'az' ? 'Dövlət İcazəsi Kalkulyatoru' : lang === 'en' ? 'Permit Tariff Engine' : 'Калькулятор разрешения'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('certificate')}
            data-testid="tab-certificate-btn"
            className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'certificate'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>
              {lang === 'az' ? 'BDYP E-İcazə Şəhadətnaməsi' : lang === 'en' ? 'E-Permit Certificate' : 'Электронное свидетельство'}
            </span>
            {certificate && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('regulations')}
            data-testid="tab-regulations-btn"
            className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'regulations'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>
              {lang === 'az' ? 'Qanunvericilik & Qaydalar' : lang === 'en' ? 'Statutory Rules' : 'Законодательство'}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* TAB 1: VISUALIZER & PHOTOMETER */}
          {activeTab === 'visualizer' && (
            <div className="space-y-6">
              {/* Presets Bar */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-2">
                  {lang === 'az'
                    ? 'Hazır Standart Paketlər:'
                    : lang === 'en'
                    ? 'Preset Configurations:'
                    : 'Готовые конфигурации:'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                  {MOCK_TINT_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset.id)}
                      data-testid={`preset-btn-${preset.id}`}
                      className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/50 text-left transition-all hover:bg-slate-800/40 cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs font-bold text-white line-clamp-1">
                            {preset.title[lang]}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2">
                          {preset.description[lang]}
                        </p>
                      </div>
                      <span
                        className={`mt-2 inline-block px-2 py-0.5 text-[10px] font-bold rounded-md self-start ${
                          preset.isLegalByDefault
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {preset.badge[lang]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Vehicle Glass Profile Simulator */}
              <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-amber-400" />
                    <span className="text-sm font-bold text-white">
                      {lang === 'az'
                        ? 'İnteraktiv Şüşə Tündlük Simulyatoru'
                        : lang === 'en'
                        ? 'Interactive Glass Tint Visualizer'
                        : 'Интерактивный симулятор тонировки'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">VÖT (VLT):</span>
                    <span className="text-amber-400 font-mono font-bold">
                      {lang === 'az' ? 'Görünən İşıq Keçiriciliyi %' : 'Visible Light Transmission'}
                    </span>
                  </div>
                </div>

                {/* Graphical Glass Preview Boxes */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                  {/* Windshield */}
                  <div
                    className="p-4 rounded-2xl border transition-all text-center flex flex-col justify-between"
                    style={{
                      backgroundColor: `rgba(15, 23, 42, ${1 - config.windshieldVlt / 100})`,
                      borderColor:
                        config.windshieldVlt >= STATUTORY_VLT_LIMITS.windshield
                          ? 'rgba(16, 185, 129, 0.4)'
                          : 'rgba(239, 68, 68, 0.5)',
                    }}
                  >
                    <div>
                      <span className="text-xs font-semibold text-slate-300 block">
                        Alın Şüşəsi
                      </span>
                      <span className="text-2xl font-black font-mono text-white mt-1 block">
                        {config.windshieldVlt}%
                      </span>
                      <span className="text-[10px] text-slate-400">Tələb: ≥75%</span>
                    </div>
                    <button
                      onClick={() => handleRunPhotometer('windshield')}
                      className="mt-3 text-[10px] py-1 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Scan className="w-3 h-3 text-amber-400" />
                      <span>Fotometr</span>
                    </button>
                  </div>

                  {/* Front Side */}
                  <div
                    className="p-4 rounded-2xl border transition-all text-center flex flex-col justify-between"
                    style={{
                      backgroundColor: `rgba(15, 23, 42, ${1 - config.frontSideVlt / 100})`,
                      borderColor:
                        config.frontSideVlt >= STATUTORY_VLT_LIMITS.frontSide
                          ? 'rgba(16, 185, 129, 0.4)'
                          : 'rgba(239, 68, 68, 0.5)',
                    }}
                  >
                    <div>
                      <span className="text-xs font-semibold text-slate-300 block">
                        Ön Yan Şüşələr
                      </span>
                      <span className="text-2xl font-black font-mono text-white mt-1 block">
                        {config.frontSideVlt}%
                      </span>
                      <span className="text-[10px] text-slate-400">Tələb: ≥70%</span>
                    </div>
                    <button
                      onClick={() => handleRunPhotometer('frontSide')}
                      className="mt-3 text-[10px] py-1 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Scan className="w-3 h-3 text-amber-400" />
                      <span>Fotometr</span>
                    </button>
                  </div>

                  {/* Rear Side */}
                  <div
                    className="p-4 rounded-2xl border transition-all text-center flex flex-col justify-between"
                    style={{
                      backgroundColor: `rgba(15, 23, 42, ${1 - config.rearSideVlt / 100})`,
                      borderColor:
                        config.hasPermit || config.rearSideVlt >= STATUTORY_VLT_LIMITS.rearSideDefault
                          ? 'rgba(16, 185, 129, 0.4)'
                          : config.hasFactoryCurtains
                          ? 'rgba(245, 158, 11, 0.4)'
                          : 'rgba(239, 68, 68, 0.5)',
                    }}
                  >
                    <div>
                      <span className="text-xs font-semibold text-slate-300 block">
                        Arxa Yan Şüşələr
                      </span>
                      <span className="text-2xl font-black font-mono text-white mt-1 block">
                        {config.rearSideVlt}%
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {config.hasPermit ? 'İcazəli (0-100%)' : 'Norma: ≥60%'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRunPhotometer('rearSide')}
                      className="mt-3 text-[10px] py-1 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Scan className="w-3 h-3 text-amber-400" />
                      <span>Fotometr</span>
                    </button>
                  </div>

                  {/* Rear Window */}
                  <div
                    className="p-4 rounded-2xl border transition-all text-center flex flex-col justify-between"
                    style={{
                      backgroundColor: `rgba(15, 23, 42, ${1 - config.rearVlt / 100})`,
                      borderColor:
                        (config.hasPermit && config.permitCoverage === 'all_rear') ||
                        config.rearVlt >= STATUTORY_VLT_LIMITS.rearDefault
                          ? 'rgba(16, 185, 129, 0.4)'
                          : 'rgba(239, 68, 68, 0.5)',
                    }}
                  >
                    <div>
                      <span className="text-xs font-semibold text-slate-300 block">
                        Arxa Şüşə
                      </span>
                      <span className="text-2xl font-black font-mono text-white mt-1 block">
                        {config.rearVlt}%
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {config.hasPermit && config.permitCoverage === 'all_rear'
                          ? 'İcazəli (0-100%)'
                          : 'Norma: ≥50%'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRunPhotometer('rear')}
                      className="mt-3 text-[10px] py-1 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Scan className="w-3 h-3 text-amber-400" />
                      <span>Fotometr</span>
                    </button>
                  </div>
                </div>

                {/* Photometer Live Reading Result */}
                {isScanning && (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 animate-pulse mt-3">
                    <Scan className="w-4 h-4 animate-spin" />
                    <span>Lüxmetr optik sensoru kalibrasiya olunur və şüşə skan edilir...</span>
                  </div>
                )}

                {photometerReading && !isScanning && (
                  <div
                    data-testid="photometer-result-card"
                    className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-3 ${
                      photometerReading.status === 'compliant'
                        ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                        : 'bg-red-950/30 border-red-800/40 text-red-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {photometerReading.status === 'compliant' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                      )}
                      <div>
                        <div className="font-bold text-sm">
                          BDYP Optik Fotometr Ölçmə Protokolu: {photometerReading.measuredVlt}% VLT
                        </div>
                        <div className="text-[11px] opacity-80">
                          Cihaz: Tonic-Lux 3000 • Xəta payı: ±{photometerReading.marginOfError}% • Operator:{' '}
                          {photometerReading.operatorId}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-xl font-bold uppercase text-[10px] ${
                        photometerReading.status === 'compliant'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {photometerReading.status === 'compliant' ? 'Uyğundur (Pass)' : 'Uyğun Deyil (Fail)'}
                    </span>
                  </div>
                )}
              </div>

              {/* Sliders Control Panel */}
              <div className="space-y-4 bg-slate-950/40 p-5 rounded-3xl border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Şüşələrin İşıqburaxma Dərəcəsini Tənzimləyin:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Windshield Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-300">Alın Şüşəsi</span>
                      <span className="text-amber-400 font-mono">{config.windshieldVlt}%</span>
                    </div>
                    <input
                      type="range"
                      min={60}
                      max={100}
                      value={config.windshieldVlt}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, windshieldVlt: Number(e.target.value) }))
                      }
                      data-testid="slider-windshield"
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-500">Standart norma: ən azı 75%</span>
                  </div>

                  {/* Front Side Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-300">Ön Yan Şüşələr</span>
                      <span className="text-amber-400 font-mono">{config.frontSideVlt}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={config.frontSideVlt}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, frontSideVlt: Number(e.target.value) }))
                      }
                      data-testid="slider-front-side"
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-500">Standart norma: ən azı 70%</span>
                  </div>

                  {/* Rear Side Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-300">Arxa Yan Şüşələr</span>
                      <span className="text-amber-400 font-mono">{config.rearSideVlt}%</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={100}
                      value={config.rearSideVlt}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, rearSideVlt: Number(e.target.value) }))
                      }
                      data-testid="slider-rear-side"
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-500">
                      Standart: ən azı 60% (İcazə ilə istənilən qara)
                    </span>
                  </div>

                  {/* Rear Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-300">Arxa Alın Şüşəsi</span>
                      <span className="text-amber-400 font-mono">{config.rearVlt}%</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={100}
                      value={config.rearVlt}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, rearVlt: Number(e.target.value) }))
                      }
                      data-testid="slider-rear"
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-500">
                      Standart: ən azı 50% (İcazə paketi ilə istənilən qara)
                    </span>
                  </div>
                </div>

                {/* Additional Toggles */}
                <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-800 text-xs">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.hasPermit}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, hasPermit: e.target.checked }))
                      }
                      data-testid="checkbox-has-permit"
                      className="rounded accent-amber-500"
                    />
                    <span>Rəsmi BDYP İllik İcazəsi aktivdir</span>
                  </label>

                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.hasFactoryCurtains}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, hasFactoryCurtains: e.target.checked }))
                      }
                      data-testid="checkbox-has-curtains"
                      className="rounded accent-amber-500"
                    />
                    <span>Sənaye pərdələri/jalüz quraşdırılıb (1 May - 15 Noyabr)</span>
                  </label>
                </div>
              </div>

              {/* Overall Compliance Diagnostic Verdict Banner */}
              <div
                data-testid="compliance-verdict-banner"
                className={`p-5 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  compliance.isCompliant
                    ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                    : 'bg-red-950/20 border-red-800/40 text-red-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  {compliance.isCompliant ? (
                    <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm sm:text-base">
                      {compliance.isCompliant
                        ? 'Dövlət Yol Hərəkəti Standartlarına Tam Uyğundur'
                        : 'DİQQƏT: Qanunvericiliyin Pozulması & Cərimə Riski!'}
                    </h4>
                    <p className="text-xs opacity-90 mt-0.5">
                      {compliance.isCompliant
                        ? 'Avtomobiliniz DYP yoxlamasından problemsiz keçir və inzibati tənbeh riski daşımır.'
                        : `Bu şüşə konfiqurasiyası ilə idarəetmə zamanı ${STATUTORY_PENALTY_ARTICLE} üzrə cərimə tətbiq olunacaq.`}
                    </p>
                  </div>
                </div>

                {!compliance.isCompliant && (
                  <button
                    onClick={() => setActiveTab('calculator')}
                    data-testid="cta-get-permit-btn"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs shrink-0 hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    Qanuni İcazə Al (50 ₼-dən)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PERMIT CALCULATOR & APPLICATION */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-3">
                <Info className="w-5 h-5 shrink-0" />
                <span>
                  Azərbaycan Respublikası Nazirlər Kabinetinin qərarına əsasən, arxa yan və arxa şüşələrin
                  tündləşdirilməsi üçün dövlət rüsumunu onlayn ödəyib 1 illik rəsmi BDYP elektron icazəsi əldə edə bilərsiniz.
                </span>
              </div>

              {/* Form Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Applicant Type Selection */}
                <div className="p-5 rounded-3xl bg-slate-950/50 border border-slate-800 space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    1. Müraciət Edən Şəxs:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setApplicantType('individual')}
                      data-testid="applicant-individual-btn"
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        applicantType === 'individual'
                          ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs">Fiziki Şəxs</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Vətəndaş mülkiyyəti</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setApplicantType('entity')}
                      data-testid="applicant-entity-btn"
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        applicantType === 'entity'
                          ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs">Hüquqi Şəxs</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Şirkət / Park parkı</div>
                    </button>
                  </div>

                  {/* Input Owner */}
                  <div className="space-y-2 pt-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Sahibinin Adı / Soyadı:
                      </label>
                      <input
                        type="text"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Fərdi İdentifikasiya Nömrəsi (FİN):
                      </label>
                      <input
                        type="text"
                        value={ownerPin}
                        onChange={(e) => setOwnerPin(e.target.value.toUpperCase())}
                        maxLength={7}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono uppercase"
                      />
                    </div>
                  </div>
                </div>

                {/* Coverage Selection */}
                <div className="p-5 rounded-3xl bg-slate-950/50 border border-slate-800 space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    2. İcazə Əhatə Dairəsi:
                  </label>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setPermitCoverage('rear_side_only')}
                      data-testid="coverage-rear-side-btn"
                      className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        permitCoverage === 'rear_side_only'
                          ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div>
                        <div className="text-xs">Yalnız Arxa Yan Şüşələr</div>
                        <div className="text-[10px] text-slate-400">
                          Sağ və sol arxa qapı şüşələri (istənilən tündlük)
                        </div>
                      </div>
                      <span className="text-amber-400 font-mono font-bold text-sm">
                        {applicantType === 'individual' ? '50 ₼' : '100 ₼'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPermitCoverage('all_rear')}
                      data-testid="coverage-all-rear-btn"
                      className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        permitCoverage === 'all_rear'
                          ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div>
                        <div className="text-xs">Bütün Arxa Şüşələr (Tam Paket)</div>
                        <div className="text-[10px] text-slate-400">
                          Arxa yan şüşələr + Arxa alın şüşəsi
                        </div>
                      </div>
                      <span className="text-amber-400 font-mono font-bold text-sm">
                        {applicantType === 'individual' ? '100 ₼' : '200 ₼'}
                      </span>
                    </button>
                  </div>

                  {/* Seasonal Tip */}
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Qeyd:</strong> 1 May - 15 Noyabr tarixlərində sənaye üsulu ilə hazırlanmış jalüz və
                      pərdələr arxa yan şüşələrə ödənişsiz icazəlidir.
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Calculation Summary & CTA */}
              <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-5">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-xs text-slate-400">Yekun Dövlət Rüsumu & Xidmət Haqqı:</span>
                  <div className="flex items-baseline gap-2">
                    <span
                      data-testid="permit-total-price"
                      className="text-3xl font-black font-mono text-amber-400"
                    >
                      {permitCost.totalConverted} {currencySymbol}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({permitCost.stateDutyAzn} ₼ rüsum + {permitCost.serviceFeeAzn} ₼ ASAN xidmət)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Etibarlılıq müddəti: <strong>1 təqvim ili (12 ay)</strong> • Dərhal BDYP bazasında qeydiyyat
                  </div>
                </div>

                <button
                  onClick={handleIssuePermit}
                  data-testid="issue-permit-submit-btn"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Dövlət İcazəsini Rəsmiləşdir</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: OFFICIAL ELECTRONIC PERMIT CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-5">
              {!certificate ? (
                <div className="text-center py-12 space-y-3">
                  <FileText className="w-12 h-12 text-slate-600 mx-auto" />
                  <h4 className="text-sm font-bold text-white">Aktiv E-İcazə Tapılmadı</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Avtomobiliniz üçün rəsmi BDYP şüşə tündləşdirmə icazəsini kalkulyator bölməsindən
                    rəsmiləşdirərək buradan elektron şəhadətnaməni əldə edə bilərsiniz.
                  </p>
                  <button
                    onClick={() => setActiveTab('calculator')}
                    className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30 transition-all cursor-pointer"
                  >
                    Kalkulyatora Keç
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Official Certificate Box */}
                  <div
                    data-testid="tint-permit-certificate-view"
                    className="p-6 rounded-3xl bg-slate-950 border-2 border-amber-500/30 shadow-2xl relative overflow-hidden"
                  >
                    {/* Official Banner Header */}
                    <div className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b border-slate-800 gap-3 text-center sm:text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold">
                          DİN
                        </div>
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-200">
                            Azərbaycan Respublikası Daxili İşlər Nazirliyi
                          </h4>
                          <p className="text-[11px] text-amber-400 font-semibold">
                            Baş Dövlət Yol Polisi İdarəsi (BDYP) • E-İcazə Şəhadətnaməsi
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                          Qüvvədədir (Aktiv)
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1 font-mono">
                          № {certificate.permitNumber}
                        </div>
                      </div>
                    </div>

                    {/* Certificate Content Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 text-xs border-b border-slate-800/80">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Dövlət Qeydiyyat Nişanı:</span>
                        <strong className="text-white font-mono text-sm">{certificate.plateNumber}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">VIN Kod:</span>
                        <strong className="text-white font-mono text-[11px]">{certificate.vin}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Mülkiyyətçi:</span>
                        <strong className="text-white text-xs">{certificate.ownerName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">FİN:</span>
                        <strong className="text-white font-mono text-xs">{certificate.ownerPin}</strong>
                      </div>
                    </div>

                    {/* Specifications Allowed */}
                    <div className="py-4 border-b border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px]">İcazə Verilən Şüşələr:</span>
                        <strong className="text-amber-300">
                          {certificate.coverage === 'all_rear'
                            ? 'Bütün Arxa Şüşələr (Arxa yan və arxa alın şüşəsi)'
                            : 'Yalnız Arxa Yan Şüşələr (Sağ və sol)'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">İcazə Verilən İşıqburaxma Dərəcəsi:</span>
                        <strong className="text-emerald-400">
                          0% - 100% (İstənilən dərəcədə tündləşdirmə)
                        </strong>
                      </div>
                    </div>

                    {/* Dates & QR */}
                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                      <div className="space-y-1 text-center sm:text-left">
                        <div className="text-[11px] text-slate-400">
                          Verilmə Tarixi: <strong>{certificate.issueDate}</strong>
                        </div>
                        <div className="text-[11px] text-emerald-400 font-semibold">
                          Bitmə Tarixi: <strong>{certificate.expiryDate} (1 il etibarlıdır)</strong>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Təhlükəsizlik Həşi: {certificate.securityHash}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-white text-slate-950">
                          <QrCode className="w-12 h-12" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Certificate Action Buttons */}
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={handleCopyPermitNumber}
                      data-testid="copy-permit-btn"
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedPermit ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Kopyalandı!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>İcazə Nömrəsini Kopyala</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => window.print()}
                      data-testid="print-permit-btn"
                      className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Çap Et (PDF)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: STATUTORY REGULATIONS */}
          {activeTab === 'regulations' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Qanunvericilik Standartları (İXM Maddə 342.2-2)</span>
                </h4>
                <p className="leading-relaxed text-slate-400">
                  Azərbaycan Respublikasının İnzibati Xətalar Məcəlləsinin 342.2-2-ci maddəsinə əsasən,
                  nəqliyyat vasitələrinin şüşələrinə qanunla müəyyən edilmiş qaydaların pozulması ilə örtüklərin
                  çəkilməsinə və ya pərdələrin vurulmasına görə <strong>150 manat məbləğində cərimə</strong> tətbiq olunur.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-2">
                  <h5 className="font-bold text-emerald-400">Qanunla İcazə Verilən Standartlar:</h5>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                    <li>Alın şüşəsi: ən azı 75% işıqburaxma qabiliyyəti (yalnız yuxarı 14 sm zolaq olar)</li>
                    <li>Ön yan şüşələr: ən azı 70% işıqburaxma (atermal UV plyonka olar)</li>
                    <li>Arxa yan şüşələr: standart ≥60%, və ya BDYP rəsmi illik icazəsi ilə istənilən dərəcədə tündləşdirmə</li>
                    <li>1 May - 15 Noyabr tarixlərində arxa yan şüşələrdə sənaye istehsalı jalüzlər icazəlidir</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-2">
                  <h5 className="font-bold text-red-400">Qəti Qadağan Edilən Hallar:</h5>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                    <li>Ön yan şüşələrə və alın şüşəsinə qara və ya güzgülü plyonka çəkilməsi</li>
                    <li>Güzgülü (reflektorlu) plyonkaların istifadəsi (bütün şüşələrdə qadağandır)</li>
                    <li>Qeyri-sənaye üsulu ilə hazırlanmış kustar parça və pərdələr</li>
                    <li>Mövsüm bitdikdən sonra (16 Noyabrdan etibarən) icazəsiz pərdələrlə idarəetmə</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

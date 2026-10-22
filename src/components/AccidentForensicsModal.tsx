import React, { useState, useId } from 'react';
import {
  ShieldAlert,
  Gauge,
  Scale,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Printer,
  Search,
  Building2,
  Clock,
  Car,
  ChevronRight,
  Flame,
  UserCheck,
  Eye,
  Crosshair,
  BadgeAlert,
  ArrowRight
} from 'lucide-react';
import { Currency } from '../types/vehicle';
import {
  RoadSurfaceCondition,
  VehicleBrakingSystem,
  InjurySeverity,
  DriverSobriety,
  ROAD_SURFACE_PROFILES,
  calculateSpeedFromSkid,
  analyzePedestrianAvoidance,
  evaluateLegalLiability,
  calculateInsuranceDamage,
  generateForensicReport,
  ForensicReportData
} from '../utils/accidentForensics';
import {
  MOCK_ACCIDENT_PRESETS,
  FORENSIC_INSTITUTIONS,
  MOCK_VERIFIABLE_FORENSIC_REPORTS
} from '../data/mockAccidentForensicsData';

interface AccidentForensicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: Currency;
  initialPlate?: string;
  initialVehicleModel?: string;
}

export const AccidentForensicsModal: React.FC<AccidentForensicsModalProps> = ({
  isOpen,
  onClose,
  currency = 'AZN',
  initialPlate = '90-OX-404',
  initialVehicleModel = 'BMW 530i (G30)'
}) => {
  const [activeTab, setActiveTab] = useState<'skid_speed' | 'avoidance' | 'liability' | 'insurance' | 'report'>('skid_speed');

  // Input states
  const [vehiclePlate, setVehiclePlate] = useState<string>(initialPlate);
  const [vehicleModel, setVehicleModel] = useState<string>(initialVehicleModel);
  const [incidentLocation, setIncidentLocation] = useState<string>('Bakı şəhəri, Heydər Əliyev prospekti');
  
  const [skidMarkLengthM, setSkidMarkLengthM] = useState<number>(32.5);
  const [roadSurface, setRoadSurface] = useState<RoadSurfaceCondition>('dry_asphalt');
  const [slopeGradientPercent, setSlopeGradientPercent] = useState<number>(0);
  const [brakingSystem, setBrakingSystem] = useState<VehicleBrakingSystem>('abs_active');
  const [speedLimitKmh, setSpeedLimitKmh] = useState<number>(60);
  const [driverReactionTimeSec, setDriverReactionTimeSec] = useState<number>(0.9);
  
  const [hazardDistanceM, setHazardDistanceM] = useState<number>(45.0);
  const [injurySeverity, setInjurySeverity] = useState<InjurySeverity>('moderate_harm');
  const [driverSobriety, setDriverSobriety] = useState<DriverSobriety>('sober');
  const [isHitAndRun, setIsHitAndRun] = useState<boolean>(false);

  const [propertyDamageAzn, setPropertyDamageAzn] = useState<number>(3500);
  const [medicalBillsAzn, setMedicalBillsAzn] = useState<number>(4000);
  const [driverFaultPercent, setDriverFaultPercent] = useState<number>(100);
  const [hasKasko, setHasKasko] = useState<boolean>(true);

  // Registry search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);
  const [activeReport, setActiveReport] = useState<ForensicReportData>(() =>
    generateForensicReport({
      vehiclePlate: initialPlate,
      vehicleModel: initialVehicleModel,
      incidentLocation: 'Bakı şəhəri, Heydər Əliyev prospekti',
      skidMarkLengthM: 32.5,
      roadSurface: 'dry_asphalt',
      speedLimitKmh: 60,
      hazardDistanceM: 45.0,
      injurySeverity: 'moderate_harm',
      driverSobriety: 'sober',
      isHitAndRun: false
    })
  );

  const skidSliderId = useId();
  const slopeSliderId = useId();
  const hazardSliderId = useId();
  const damageSliderId = useId();
  const medicalSliderId = useId();
  const faultSliderId = useId();

  if (!isOpen) return null;

  // Real-time calculations
  const speedData = calculateSpeedFromSkid(
    skidMarkLengthM,
    roadSurface,
    slopeGradientPercent,
    brakingSystem,
    speedLimitKmh,
    driverReactionTimeSec,
    1550
  );

  const avoidanceData = analyzePedestrianAvoidance(
    hazardDistanceM,
    speedData.calculatedSpeedKmh,
    roadSurface,
    driverReactionTimeSec,
    brakingSystem
  );

  const legalLiability = evaluateLegalLiability(
    injurySeverity,
    driverSobriety,
    speedData.excessSpeedKmh,
    isHitAndRun
  );

  const insuranceData = calculateInsuranceDamage(
    propertyDamageAzn,
    medicalBillsAzn,
    driverFaultPercent,
    hasKasko,
    currency
  );

  const handleApplyPreset = (presetId: string) => {
    const preset = MOCK_ACCIDENT_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    setVehiclePlate(preset.vehiclePlate);
    setVehicleModel(preset.vehicleModel);
    setIncidentLocation(preset.locationAz);
    setSkidMarkLengthM(preset.skidMarkLengthM);
    setRoadSurface(preset.roadSurface);
    setSlopeGradientPercent(preset.slopeGradientPercent);
    setSpeedLimitKmh(preset.speedLimitKmh);
    setHazardDistanceM(preset.hazardDistanceM);
    setInjurySeverity(preset.injurySeverity);
    setDriverSobriety(preset.driverSobriety);
    setPropertyDamageAzn(preset.propertyDamageAzn);
    setMedicalBillsAzn(preset.medicalBillsAzn);
    setDriverFaultPercent(preset.driverFaultPercent);

    // Update active report
    const newReport = generateForensicReport({
      vehiclePlate: preset.vehiclePlate,
      vehicleModel: preset.vehicleModel,
      incidentLocation: preset.locationAz,
      skidMarkLengthM: preset.skidMarkLengthM,
      roadSurface: preset.roadSurface,
      speedLimitKmh: preset.speedLimitKmh,
      hazardDistanceM: preset.hazardDistanceM,
      injurySeverity: preset.injurySeverity,
      driverSobriety: preset.driverSobriety,
      isHitAndRun: false
    });
    setActiveReport(newReport);
  };

  const handleGenerateReport = () => {
    const report = generateForensicReport({
      vehiclePlate,
      vehicleModel,
      incidentLocation,
      skidMarkLengthM,
      roadSurface,
      speedLimitKmh,
      hazardDistanceM,
      injurySeverity,
      driverSobriety,
      isHitAndRun
    });
    setActiveReport(report);
    setActiveTab('report');
  };

  const handleCopyReport = () => {
    const text = `AR ƏDLİYYƏ NAZİRLİYİ MƏHKƏMƏ EKSPERTİZASI MƏRKƏZİ
EKSPERTİZA RƏYİ: ${activeReport.reportNumber}
Tarix: ${activeReport.incidentDate}
Hadisə yeri: ${activeReport.incidentLocation}
Nəqliyyat vasitəsi: ${activeReport.vehicleModel} (${activeReport.vehiclePlate})
Tormoz izi uzunluğu: ${activeReport.skidMarkLengthM} m
Yol örtüyü: ${ROAD_SURFACE_PROFILES[activeReport.roadSurface].nameAz} (μ = ${activeReport.roadFrictionMu})
Tormozlanma qabağı tədqiq olunan sürət: ${activeReport.calculatedSpeedKmh} km/saat (Yol həddi: ${activeReport.speedLimitKmh} km/s)
Piyadanın / maneənin aşkar edildiyi məsafə: ${activeReport.hazardDistanceM} m
Sürücünün qəzanın qarşısını almaq üçün texniki imkanı: ${activeReport.hadTechnicalPossibility ? 'OLMUŞDUR' : 'OLMAMIŞDIR'}
Hüquqi tövsif: ${activeReport.legalArticle} (${activeReport.isCriminal ? 'Cinayət Məsuliyyəti' : 'İnzibati Məsuliyyət'})
Aparıcı Ekspert: ${activeReport.examinerName}
Elektron QR İmzası: ${activeReport.digitalQrChecksum}`;

    navigator.clipboard?.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  const filteredReports = MOCK_VERIFIABLE_FORENSIC_REPORTS.filter(r =>
    r.reportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.incidentLocation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Accident Forensics Modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-5xl my-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[92vh]">
        {/* Header */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-red-950/40 via-slate-900 to-amber-950/30 border-b border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center shadow-lg shadow-red-500/20 text-white shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                    BDYP & Ədliyyə Nazirliyi YNH Məhkəmə Avtotexniki Ekspertizası
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/20 text-red-300 border border-red-500/30 uppercase">
                    v = √(254·μ·S) Telemetriya
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tormoz izi ilə sürət təyini, toqquşmanın qarşısını alma texniki imkanı, CM 263 / İXM 327 hüquqi məsuliyyət
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono">
                <Car className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-amber-400">{vehiclePlate}</span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Quick Presets Bar */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mr-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> Real Qəza Preseti:
            </span>
            {MOCK_ACCIDENT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset.id)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-all flex items-center gap-1.5"
              >
                <span>{preset.titleAz.split(' ')[0]}</span>
                <span className="text-[10px] text-slate-400 font-mono">({preset.skidMarkLengthM}m)</span>
              </button>
            ))}
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'skid_speed', label: 'Tormoz İzi & Sürət v=√(254·μ·S)', icon: Gauge },
              { id: 'avoidance', label: 'Maneə & Texniki İmkan', icon: Crosshair },
              { id: 'liability', label: 'İXM 327 vs CM 263 Məsuliyyət', icon: Scale },
              { id: 'insurance', label: 'İSB & KASKO Sığorta', icon: Building2 },
              { id: 'report', label: 'Məhkəmə Rəyi (MEM-YNH)', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md shadow-red-500/20'
                      : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: SKID MARK & SPEED CALCULATION */}
          {activeTab === 'skid_speed' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Controls Column */}
                <div className="lg:col-span-7 space-y-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-red-400" />
                    Hadisə Yeri və Tormoz İzi Parametrləri
                  </h3>

                  {/* Skid Mark Length Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <label htmlFor={skidSliderId} className="font-medium text-slate-300">
                        Qeydə alınmış tormoz izi uzunluğu (S_t):
                      </label>
                      <span className="font-mono text-base font-bold text-amber-400">
                        {skidMarkLengthM.toFixed(1)} metr
                      </span>
                    </div>
                    <input
                      id={skidSliderId}
                      type="range"
                      min="1"
                      max="80"
                      step="0.5"
                      value={skidMarkLengthM}
                      onChange={(e) => setSkidMarkLengthM(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>1.0 m (şəhərdaxili)</span>
                      <span>30.0 m (orta qəza)</span>
                      <span>80.0 m (magistral)</span>
                    </div>
                  </div>

                  {/* Road Surface Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300">Yol örtüyünün vəziyyəti (Yapışma əmsalı μ):</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.values(ROAD_SURFACE_PROFILES).map((prof) => (
                        <button
                          key={prof.id}
                          onClick={() => setRoadSurface(prof.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            roadSurface === prof.id
                              ? 'bg-red-500/10 border-red-500/50 text-white shadow-sm'
                              : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex justify-between items-center text-xs font-semibold">
                            <span>{prof.nameAz.split(' ')[0]}</span>
                            <span className="font-mono text-amber-400 text-[11px]">μ = {prof.muBase}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{prof.descriptionAz}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Slope and Brake System Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <label htmlFor={slopeSliderId} className="font-medium text-slate-300">Yol mailliyi (%):</label>
                        <span className="font-mono text-slate-400">
                          {slopeGradientPercent > 0 ? `+${slopeGradientPercent}% (Yoxuş)` : slopeGradientPercent < 0 ? `${slopeGradientPercent}% (Eniş)` : '0% (Düz yol)'}
                        </span>
                      </div>
                      <input
                        id={slopeSliderId}
                        type="range"
                        min="-10"
                        max="10"
                        step="1"
                        value={slopeGradientPercent}
                        onChange={(e) => setSlopeGradientPercent(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-300">Əyləc Sistemi:</label>
                      <select
                        value={brakingSystem}
                        onChange={(e) => setBrakingSystem(e.target.value as VehicleBrakingSystem)}
                        className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                      >
                        <option value="abs_active">Müasir ABS aktiv (η = 1.05)</option>
                        <option value="abs_faulty">Nasaz ABS / Təkər bloklanması (η = 0.85)</option>
                        <option value="conventional_hydraulic">Klassik hidravlik əyləc (η = 0.95)</option>
                        <option value="air_brakes_truck">Yük avtomobili pnevmatik əyləc (η = 0.90)</option>
                      </select>
                    </div>
                  </div>

                  {/* Speed Limit & Reaction Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Həmin yolda sürət həddi:</label>
                      <div className="flex gap-1.5">
                        {[50, 60, 90, 110].map((limit) => (
                          <button
                            key={limit}
                            onClick={() => setSpeedLimitKmh(limit)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                              speedLimitKmh === limit
                                ? 'bg-red-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {limit}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Sürücü reaksiya vaxtı (t_r):</label>
                      <select
                        value={driverReactionTimeSec}
                        onChange={(e) => setDriverReactionTimeSec(parseFloat(e.target.value))}
                        className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                      >
                        <option value="0.6">0.6 san - Yüksək diqqətli / Gündüz</option>
                        <option value="0.9">0.9 san - Orta statistik sürücü (Standart)</option>
                        <option value="1.2">1.2 san - Gecə vaxtı / Məhdud görmə</option>
                        <option value="1.5">1.5 san - Diqqəti yayınmış / Yavaş reaksiya</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Calculation Output Cards */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Primary Calculated Speed Card */}
                  <div className={`p-6 rounded-2xl border text-center relative overflow-hidden transition-all ${
                    speedData.isSpeedingExceeded
                      ? 'bg-gradient-to-b from-red-950/60 to-slate-900 border-red-500/50 shadow-xl shadow-red-950/30'
                      : 'bg-gradient-to-b from-emerald-950/40 to-slate-900 border-emerald-500/40'
                  }`}>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Tormozlama Başlanğıcında Sürət (v_0)
                    </div>
                    <div className="text-5xl sm:text-6xl font-extrabold font-mono tracking-tight text-white my-3">
                      {speedData.calculatedSpeedKmh}
                      <span className="text-lg font-sans font-normal text-slate-400 ml-1.5">km/saat</span>
                    </div>

                    {speedData.isSpeedingExceeded ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                        Sürət həddi +{speedData.excessSpeedKmh} km/s aşılıb! (Limit: {speedLimitKmh} km/s)
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Sürət həddi daxilindədir (Limit: {speedLimitKmh} km/s)
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-2 text-left text-xs font-mono">
                      <div>
                        <span className="text-slate-500 block text-[10px]">EFFEKTİV μ:</span>
                        <span className="text-slate-200 font-semibold">{speedData.effectiveMu}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">KİNETİK ENERJİ:</span>
                        <span className="text-amber-400 font-semibold">{speedData.kineticEnergyKj} kJ</span>
                      </div>
                    </div>
                  </div>

                  {/* Stopping Distance Breakdown */}
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span>Dayanma Məsafəsinin Tərkibi (S_dayanma):</span>
                      <span className="font-mono text-amber-400 font-bold">{speedData.totalStoppingDistanceM} m</span>
                    </h4>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>1. Reaksiya məsafəsi (S_reaksiya):</span>
                        <span className="font-mono text-slate-200">{speedData.reactionDistanceM} m</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                        <div
                          className="bg-blue-500 h-full"
                          style={{
                            width: `${Math.min(100, (speedData.reactionDistanceM / speedData.totalStoppingDistanceM) * 100)}%`
                          }}
                        />
                        <div
                          className="bg-red-500 h-full"
                          style={{
                            width: `${Math.min(100, (speedData.brakingDistanceM / speedData.totalStoppingDistanceM) * 100)}%`
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>2. Tormoz izi (S_tormoz):</span>
                        <span className="font-mono text-red-400 font-bold">{speedData.brakingDistanceM} m</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
                      💡 Məhkəmə avtotexniki ekspertizasında tam dayanma yolu: <span className="font-mono text-slate-200">S = v·t_r/3.6 + v²/(254·μ)</span> düsturu əsasında hesablanır.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PEDESTRIAN / OBSTACLE AVOIDANCE */}
          {activeTab === 'avoidance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6 space-y-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-amber-400" />
                    Piyada / Maneə Aşkar Edilmə Zonası
                  </h3>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <label htmlFor={hazardSliderId} className="font-medium text-slate-300">
                        Maneənin aşkar edildiyi məsafə (D_maneə):
                      </label>
                      <span className="font-mono text-base font-bold text-amber-400">
                        {hazardDistanceM.toFixed(1)} metr
                      </span>
                    </div>
                    <input
                      id={hazardSliderId}
                      type="range"
                      min="5"
                      max="100"
                      step="1"
                      value={hazardDistanceM}
                      onChange={(e) => setHazardDistanceM(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>5 m (qəfil çıxma)</span>
                      <span>50 m (orta məsafə)</span>
                      <span>100 m (uzaq görmə)</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Avtomobilin ilkin sürəti:</span>
                      <span className="font-mono font-bold text-slate-200">{speedData.calculatedSpeedKmh} km/saat</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Yol örtüyü və sürtünmə:</span>
                      <span className="font-mono text-amber-400">{ROAD_SURFACE_PROFILES[roadSurface].nameAz.split(' ')[0]} (μ = {ROAD_SURFACE_PROFILES[roadSurface].muBase})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tələb olunan dayanma yolu:</span>
                      <span className="font-mono font-bold text-red-400">{avoidanceData.stoppingDistanceM} metr</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-6 space-y-4">
                  {/* Avoidance Verdict Card */}
                  <div className={`p-6 rounded-2xl border transition-all ${
                    avoidanceData.driverHadTechnicalPossibility
                      ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                      : 'bg-red-950/40 border-red-500/50 text-red-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      {avoidanceData.driverHadTechnicalPossibility ? (
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                          <CheckCircle2 className="w-7 h-7" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                          <XCircle className="w-7 h-7" />
                        </div>
                      )}

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Məhkəmə-Texniki Ekspertiza Nəticəsi
                        </span>
                        <h4 className="text-base sm:text-lg font-bold text-white mt-0.5">
                          {avoidanceData.driverHadTechnicalPossibility
                            ? 'Qəzanın qarşısını almaq üçün texniki imkan OLMUŞDUR'
                            : 'Qəzanın qarşısını almaq texniki baxımdan MÜMKÜN OLMAMIŞDIR'}
                        </h4>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 mt-4 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      {avoidanceData.conclusionAz}
                    </p>

                    {!avoidanceData.driverHadTechnicalPossibility && (
                      <div className="mt-4 pt-3 border-t border-red-500/30 flex items-center justify-between text-xs font-mono">
                        <span className="text-red-300">Toqquşma anındakı qalıq sürət:</span>
                        <span className="text-lg font-bold text-white bg-red-600/30 px-2.5 py-0.5 rounded-lg border border-red-500/40">
                          ~{avoidanceData.impactSpeedKmh} km/saat
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LEGAL LIABILITY (IXM VS CM) */}
          {activeTab === 'liability' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6 space-y-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-red-400" />
                    Hadisənin Ağırlaşdırıcı Şərtləri
                  </h3>

                  {/* Injury Severity */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300">Xəsarətin ağırlıq dərəcəsi:</label>
                    <div className="space-y-1.5">
                      {[
                        { id: 'none_property_only', label: 'Xəsarət yoxdur (Yalnız maddi zərər)', badge: 'İXM 327.1' },
                        { id: 'light_harm', label: 'Yüngül bədən xəsarəti (Qısamüddətli)', badge: 'İXM 327.8' },
                        { id: 'moderate_harm', label: 'Az ağır bədən xəsarəti', badge: 'CM 263.1' },
                        { id: 'severe_harm', label: 'Ağır bədən xəsarəti (Həyat üçün təhlükəli)', badge: 'CM 263.1-1' },
                        { id: 'fatal_one', label: 'Zərərçəkmişin ölümü (1 nəfər)', badge: 'CM 263.2' },
                        { id: 'fatal_multiple', label: 'İki və ya daha çox şəxsin ölümü', badge: 'CM 263.3' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setInjurySeverity(item.id as InjurySeverity)}
                          className={`w-full p-2.5 rounded-xl border text-left flex justify-between items-center transition-all ${
                            injurySeverity === item.id
                              ? 'bg-red-500/15 border-red-500/50 text-white shadow-sm'
                              : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          <span className="text-xs font-medium">{item.label}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900 text-amber-400 border border-slate-700">
                            {item.badge}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sobriety */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300">Sürücünün ayıqlıq vəziyyəti:</label>
                    <select
                      value={driverSobriety}
                      onChange={(e) => setDriverSobriety(e.target.value as DriverSobriety)}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                    >
                      <option value="sober">Ayıq vəziyyətdə (Alkoqol təsiri yoxdur)</option>
                      <option value="alcohol_intoxicated">Alkoqol sərxoşluğu vəziyyətində (CM 263-1)</option>
                      <option value="narcotic_intoxicated">Narkotik vasitələrin təsiri altında (CM 263-1)</option>
                      <option value="test_refused">Tibbi müayinədən qanunsuz imtina</option>
                    </select>
                  </div>

                  {/* Hit and Run */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-800 text-xs">
                    <div>
                      <span className="font-semibold text-slate-200 block">Hadisə yerindən qaçma (CM 264):</span>
                      <span className="text-slate-400 text-[11px]">Yaralıya yardım göstərmədən qaçma</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isHitAndRun}
                      onChange={(e) => setIsHitAndRun(e.target.checked)}
                      className="w-4 h-4 rounded text-red-600 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Legal Classification Card */}
                <div className="lg:col-span-6 space-y-4">
                  <div className={`p-6 rounded-2xl border text-left space-y-4 transition-all ${
                    legalLiability.isCriminalProsecution
                      ? 'bg-red-950/40 border-red-500/60 shadow-xl shadow-red-950/20'
                      : 'bg-amber-950/30 border-amber-500/50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        legalLiability.isCriminalProsecution
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {legalLiability.framework === 'CM' ? 'Cinayət Məsuliyyəti' : 'İnzibati Məsuliyyət'}
                      </span>
                      <span className="text-xs font-mono font-bold text-white bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                        {legalLiability.article}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-white">{legalLiability.titleAz}</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{legalLiability.descriptionAz}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                      <span className="text-[11px] font-semibold text-amber-400 block uppercase tracking-wide">
                        Qanunla Müəyyən Edilmiş Cəza Sanksiyası:
                      </span>
                      <p className="text-xs text-slate-200 font-medium leading-relaxed">
                        {legalLiability.penaltySummaryAz}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Sürücülük Hüququ:</span>
                        <span className="font-semibold text-red-400">
                          {legalLiability.licenseSuspensionYears > 0
                            ? `${legalLiability.licenseSuspensionYears} ilədək məhrumetmə`
                            : 'Məhrumetmə yoxdur'}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Aidiyyəti Qurum:</span>
                        <span className="font-semibold text-slate-200">{legalLiability.jurisdictionAz}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: INSURANCE CLAIMS (ISB & KASKO) */}
          {activeTab === 'insurance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6 space-y-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    Zərər Qiymətləndirilməsi və Təqsir Nisbəti
                  </h3>

                  {/* Fault Percentage */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <label htmlFor={faultSliderId} className="font-medium text-slate-300">Sürücünün təqsir faizi (%):</label>
                      <span className="font-mono font-bold text-red-400">{driverFaultPercent}%</span>
                    </div>
                    <input
                      id={faultSliderId}
                      type="range"
                      min="0"
                      max="100"
                      step="10"
                      value={driverFaultPercent}
                      onChange={(e) => setDriverFaultPercent(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>0% (Təqsirsiz zərərçəkən)</span>
                      <span>50% (Qarşılıqlı təqsir)</span>
                      <span>100% (Tam təqsirkar)</span>
                    </div>
                  </div>

                  {/* Property Damage */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <label htmlFor={damageSliderId} className="font-medium text-slate-300">Zərərçəkmiş nəqliyyat vasitəsinə dəyən zərər:</label>
                      <span className="font-mono font-bold text-amber-400">{propertyDamageAzn} AZN</span>
                    </div>
                    <input
                      id={damageSliderId}
                      type="range"
                      min="500"
                      max="20000"
                      step="250"
                      value={propertyDamageAzn}
                      onChange={(e) => setPropertyDamageAzn(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>

                  {/* Medical Bills */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <label htmlFor={medicalSliderId} className="font-medium text-slate-300">Sağlamlığa dəyən zərər / Müalicə xərcləri:</label>
                      <span className="font-mono font-bold text-blue-400">{medicalBillsAzn} AZN</span>
                    </div>
                    <input
                      id={medicalSliderId}
                      type="range"
                      min="0"
                      max="15000"
                      step="250"
                      value={medicalBillsAzn}
                      onChange={(e) => setMedicalBillsAzn(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  {/* Kasko Checkbox */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-800 text-xs">
                    <div>
                      <span className="font-semibold text-slate-200 block">Könüllü KASKO sığorta müqaviləsi var:</span>
                      <span className="text-slate-400 text-[11px]">Təqsirkar sürücünün öz avtomobilini təmir edir</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={hasKasko}
                      onChange={(e) => setHasKasko(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Insurance Payout Breakdown */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                    <h4 className="text-sm font-semibold text-slate-200 flex items-center justify-between">
                      <span>İSB & KASKO Təzminat Bölüşdürülməsi</span>
                      <span className="text-xs font-mono text-slate-400">Valyuta: {currency}</span>
                    </h4>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                        <div>
                          <span className="font-semibold text-slate-200 block">İcbari Sığorta (İSB) Əmlak Ödənişi:</span>
                          <span className="text-[10px] text-slate-400">Qanuni limit: 5,000 AZN</span>
                        </div>
                        <span className="font-mono text-emerald-400 font-bold text-sm">
                          {insuranceData.isbPropertyPayoutAzn} AZN
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                        <div>
                          <span className="font-semibold text-slate-200 block">İcbari Sığorta (İSB) Sağlamlıq Ödənişi:</span>
                          <span className="text-[10px] text-slate-400">Hər şəxs üçün limit: 5,000 AZN</span>
                        </div>
                        <span className="font-mono text-emerald-400 font-bold text-sm">
                          {insuranceData.isbMedicalPayoutAzn} AZN
                        </span>
                      </div>

                      <div className={`flex justify-between items-center p-3 rounded-xl border ${
                        insuranceData.driverOutOfPocketAzn > 0
                          ? 'bg-red-950/30 border-red-500/40 text-red-200'
                          : 'bg-slate-800/30 border-slate-800 text-slate-400'
                      }`}>
                        <div>
                          <span className="font-semibold block">Sürücünün Cibindən Ödəniləcək Məbləğ:</span>
                          <span className="text-[10px] opacity-80">5,000 AZN limiti aşan qalıq zərər</span>
                        </div>
                        <span className="font-mono font-bold text-sm">
                          {insuranceData.driverOutOfPocketAzn} AZN
                        </span>
                      </div>

                      {hasKasko && (
                        <div className="flex justify-between items-center p-3 rounded-xl bg-blue-950/30 border border-blue-500/40 text-blue-200">
                          <div>
                            <span className="font-semibold block">KASKO Öz Avtomobilinin Təmiri:</span>
                            <span className="text-[10px] opacity-80">5% franşiza çıxılmaqla</span>
                          </div>
                          <span className="font-mono font-bold text-sm text-blue-400">
                            +{insuranceData.kaskoCoverAzn} AZN
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FORENSIC REPORT GENERATOR & REGISTRY */}
          {activeTab === 'report' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Official Certificate Box */}
                <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
                  {/* Watermark / Header */}
                  <div className="text-center border-b border-slate-800 pb-5 space-y-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-amber-500">
                      Azərbaycan Respublikası Ədliyyə Nazirliyi
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      MƏHKƏMƏ EKSPERTİZASI MƏRKƏZİ
                    </h3>
                    <p className="text-xs text-slate-400 font-serif">
                      Yol-Nəqliyyat Hadisələrinin Məhkəmə Avtotexniki Ekspertizası Rəyi
                    </p>
                    <div className="inline-block mt-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-amber-400">
                      № {activeReport.reportNumber}
                    </div>
                  </div>

                  {/* Incident & Vehicle Details Table */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-[10px] block">HADİSƏ TARİXİ VƏ YERİ:</span>
                      <p className="font-semibold text-slate-200">{activeReport.incidentDate}</p>
                      <p className="text-slate-400 text-[11px]">{activeReport.incidentLocation}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-[10px] block">NƏQLİYYAT VASİTƏSİ:</span>
                      <p className="font-semibold text-slate-200">{activeReport.vehicleModel}</p>
                      <p className="font-mono text-amber-400 font-bold">{activeReport.vehiclePlate}</p>
                    </div>
                  </div>

                  {/* Forensic Calculations Breakdown */}
                  <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3 text-xs">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide block">
                      Avtotexniki Tədqiqatın Nəticələri:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <span className="text-slate-500 text-[10px] block">Tormoz İzi Uzunluğu:</span>
                        <span className="font-mono text-slate-200 font-semibold">{activeReport.skidMarkLengthM} m</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Yapışma Əmsalı (μ):</span>
                        <span className="font-mono text-slate-200 font-semibold">{activeReport.roadFrictionMu}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Tədqiq Edilən Sürət:</span>
                        <span className="font-mono text-red-400 font-bold text-sm">{activeReport.calculatedSpeedKmh} km/s</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-slate-400 block text-[11px]">Ekspert Suallarına Cavab (Texniki İmkan):</span>
                      <p className="text-slate-200 font-medium text-xs mt-1">
                        Sürücünün qəzanın qarşısını almaq üçün texniki imkanı:{' '}
                        <span className={activeReport.hadTechnicalPossibility ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                          {activeReport.hadTechnicalPossibility ? 'OLMUŞDUR' : 'OLMAMIŞDIR'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Legal Conclusion */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">HÜQUQİ TÖVSİF:</span>
                      <span className="font-mono font-bold text-white text-sm">{activeReport.legalArticle}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      activeReport.isCriminal ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {activeReport.isCriminal ? 'Cinayət Məsuliyyəti' : 'İnzibati Xəta'}
                    </span>
                  </div>

                  {/* Signatures & QR Checksum */}
                  <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                    <div className="space-y-1 text-center sm:text-left">
                      <p className="font-semibold text-slate-300">{activeReport.examinerName}</p>
                      <p className="text-slate-500 text-[10px]">SİMA Rəqəmsal İmza: {activeReport.simaSignatureHash}</p>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[11px] bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-400">
                      <span>QR Kod:</span>
                      <span className="text-amber-400 font-bold">{activeReport.digitalQrChecksum}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    <button
                      onClick={handleCopyReport}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
                    >
                      <Copy className="w-4 h-4 text-slate-400" />
                      <span>{copyFeedback ? 'Kopyalandı!' : 'Rəyi Kopyala'}</span>
                    </button>
                    <button
                      onClick={() => window.print?.()}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md shadow-red-600/20 transition-all"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Çap et / PDF Saxla</span>
                    </button>
                  </div>
                </div>

                {/* Right Column: Institutions & Registry Search */}
                <div className="lg:col-span-4 space-y-4">
                  {/* Registry Search Card */}
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                      <Search className="w-4 h-4 text-amber-400" />
                      Rəsmi Rəylər Reyestri Axtarışı
                    </h4>

                    <input
                      type="text"
                      placeholder="MEM-YNH nömrəsi və ya nömrə nişanı..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-red-500 placeholder-slate-500"
                    />

                    <div className="space-y-2 mt-2 max-h-56 overflow-y-auto">
                      {filteredReports.map((rec) => (
                        <button
                          key={rec.reportNumber}
                          onClick={() => setActiveReport(rec)}
                          className="w-full p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800 text-left transition-all"
                        >
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-mono font-bold text-amber-400">{rec.reportNumber}</span>
                            <span className="font-mono text-slate-400">{rec.vehiclePlate}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{rec.incidentLocation}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Accredited Forensic Centres */}
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-400" />
                      Akkreditə Olunmuş Ekspertiza Mərkəzləri
                    </h4>

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {FORENSIC_INSTITUTIONS.slice(0, 3).map((inst) => (
                        <div key={inst.id} className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs space-y-1">
                          <p className="font-semibold text-slate-200 leading-snug">{inst.nameAz}</p>
                          <p className="text-[11px] text-slate-400">{inst.addressAz}</p>
                          <p className="text-[10px] text-amber-400 font-mono">{inst.phone}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Məhkəmə Avtotexniki İnformasiya Portalı (MEM & BDYP) Canlı</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerateReport}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-semibold shadow-md shadow-red-500/20 transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Yekun Rəy Tərtib Et</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-all"
            >
              Bağla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

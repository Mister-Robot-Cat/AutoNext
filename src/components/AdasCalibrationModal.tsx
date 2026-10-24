import React, { useState, useMemo } from 'react';
import {
  X,
  Shield,
  ShieldAlert,
  Gauge,
  Eye,
  Camera,
  CheckCircle,
  AlertTriangle,
  Printer,
  Copy,
  Search,
  Wrench,
  Car,
  Sliders,
  Calendar,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  RefreshCw,
  Crosshair,
  Award,
  FileText,
  Check
} from 'lucide-react';
import { Vehicle, Currency } from '../types/vehicle';
import { useKeyPress } from '../hooks/useKeyPress';
import {
  AdasSystemKey,
  CalibrationTriggerKey,
  AdasCenter,
  MockAdasCertificateRecord,
  ADAS_SYSTEMS,
  CALIBRATION_TRIGGERS,
  ACCREDITED_ADAS_CENTERS,
  ADAS_PACKAGES,
  ADAS_DTC_CODES,
  MOCK_ACTIVE_ADAS_CERTIFICATES
} from '../data/mockAdasData';
import {
  evaluateAdasTolerances,
  calculateAdasPricing,
  getRequiredSystemsForTrigger,
  generateAdasCertificateNumber,
  generateAdasSecurityHash,
  filterAdasCenters,
  findAdasCertificateByQuery,
  simulateDynamicRoadDrive,
  getDtcCodeDetails
} from '../utils/adasCalibration';

export interface AdasCalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: Vehicle | null;
  currency?: Currency;
}

type TabType = 'audit' | 'simulator' | 'systems' | 'centers' | 'certificate';

export const AdasCalibrationModal: React.FC<AdasCalibrationModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  currency = 'AZN'
}) => {
  useKeyPress('Escape', onClose);

  const [activeTab, setActiveTab] = useState<TabType>('audit');
  const [selectedTrigger, setSelectedTrigger] = useState<CalibrationTriggerKey>('windshield_replacement');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('full_adas_suite');
  const [activeCurrency, setActiveCurrency] = useState<Currency>(currency);
  const [includeDtcClearance, setIncludeDtcClearance] = useState<boolean>(true);
  const [includeExpressBay, setIncludeExpressBay] = useState<boolean>(false);

  // Search & Filter state
  const [centerSearchQuery, setCenterSearchQuery] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedCenterId, setSelectedCenterId] = useState<string>(ACCREDITED_ADAS_CENTERS[0].id);
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);

  // Vehicle identifiers
  const [plateNumber, setPlateNumber] = useState<string>(vehicle?.plateNumber || '90-OJ-055');
  const [vinNumber, setVinNumber] = useState<string>(vehicle?.vin || 'WBA53AH07PCH28194');
  const [vehicleModelName, setVehicleModelName] = useState<string>(
    vehicle ? `${vehicle.make} ${vehicle.model}` : 'BMW 530i xDrive (G30)'
  );

  // Laser Target Simulator sliders
  const [distanceMm, setDistanceMm] = useState<number>(2000);
  const [centerlineOffsetMm, setCenterlineOffsetMm] = useState<number>(2);
  const [cameraPitchDeg, setCameraPitchDeg] = useState<number>(0.08);
  const [cameraYawDeg, setCameraYawDeg] = useState<number>(-0.04);
  const [radarPitchDeg, setRadarPitchDeg] = useState<number>(0.12);
  const [radarYawDeg, setRadarYawDeg] = useState<number>(0.05);

  // Dynamic road test simulator state
  const [roadTestProgress, setRoadTestProgress] = useState<number>(0);

  // Certificate registry search & generated certificate
  const [certSearchQuery, setCertSearchQuery] = useState<string>('');
  const [activeCert, setActiveCert] = useState<MockAdasCertificateRecord>(MOCK_ACTIVE_ADAS_CERTIFICATES[0]);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Evaluate laser tolerances in real time
  const toleranceEval = useMemo(() => {
    return evaluateAdasTolerances({
      distanceMm,
      centerlineOffsetMm,
      cameraPitchDeg,
      cameraYawDeg,
      radarPitchDeg,
      radarYawDeg
    });
  }, [distanceMm, centerlineOffsetMm, cameraPitchDeg, cameraYawDeg, radarPitchDeg, radarYawDeg]);

  // Road test telemetry
  const roadTelemetry = useMemo(() => {
    return simulateDynamicRoadDrive(roadTestProgress);
  }, [roadTestProgress]);

  // Pricing calculations
  const priceBreakdown = useMemo(() => {
    return calculateAdasPricing(
      selectedPackageId,
      activeCurrency,
      includeDtcClearance,
      includeExpressBay
    );
  }, [selectedPackageId, activeCurrency, includeDtcClearance, includeExpressBay]);

  // Filtered centers
  const filteredCenters = useMemo(() => {
    return filterAdasCenters(centerSearchQuery, selectedDistrict);
  }, [centerSearchQuery, selectedDistrict]);

  // Districts list
  const availableDistricts = useMemo(() => {
    const list = Array.from(new Set(ACCREDITED_ADAS_CENTERS.map(c => c.district)));
    return ['all', ...list];
  }, []);

  if (!isOpen) return null;

  const triggerInfo = CALIBRATION_TRIGGERS[selectedTrigger];
  const requiredSystems = getRequiredSystemsForTrigger(selectedTrigger);

  const handleAutoAlign = () => {
    setCenterlineOffsetMm(0);
    setCameraPitchDeg(0.02);
    setCameraYawDeg(0.01);
    setRadarPitchDeg(0.03);
    setRadarYawDeg(-0.02);
    setDistanceMm(2000);
  };

  const handleAdvanceRoadTest = () => {
    setRoadTestProgress(prev => (prev >= 100 ? 0 : Math.min(100, prev + 35)));
  };

  const handleGenerateCertificate = () => {
    const newCertNo = generateAdasCertificateNumber();
    const hash = generateAdasSecurityHash(plateNumber, vinNumber, newCertNo);
    const chosenCenter = ACCREDITED_ADAS_CENTERS.find(c => c.id === selectedCenterId) || ACCREDITED_ADAS_CENTERS[0];

    const today = new Date().toISOString().split('T')[0];
    const expiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const created: MockAdasCertificateRecord = {
      id: `cert-${Date.now()}`,
      certificateNo: newCertNo,
      vehiclePlate: plateNumber,
      vin: vinNumber,
      vehicleModel: vehicleModelName,
      calibrationDate: today,
      expiryDate: expiry,
      centerId: chosenCenter.id,
      systemsCalibrated: requiredSystems,
      status: toleranceEval.allPassed ? 'PASSED' : 'FAILED',
      qrVerificationHash: hash,
      technicianName: 'Aparıcı Metrologiya Mühəndisi Vüsal Əliyev (AZS-M-095)',
      targetBoardModel: 'Autel MaxiSys ADAS Laser Frame',
      laserAlignmentPassed: toleranceEval.isLaserCompliant,
      dynamicRoadDrivePassed: roadTelemetry.isCompleted,
      telemetry: {
        cameraPitchDeg,
        cameraYawDeg,
        radarPitchDeg,
        radarYawDeg,
        centerlineOffsetMm
      }
    };

    setActiveCert(created);
    setActiveTab('certificate');
  };

  const handleRegistrySearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = findAdasCertificateByQuery(certSearchQuery);
    if (found) {
      setActiveCert(found);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedNotification(label);
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm overflow-y-auto"
      data-testid="adas-calibration-modal"
    >
      <div className="bg-white dark:bg-gray-900 w-full max-w-5xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-500/20 border border-blue-400/40 rounded-xl text-blue-300">
              <Crosshair className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  UNECE R152 / R157 & AZS
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  RİNN • AYNA • BDYP
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold mt-0.5 text-white">
                Rəsmi ADAS Sensor & Kamera Kalibrasiyası Portalı
              </h2>
              <p className="text-xs text-blue-200/80">
                Lazer Hədəf Panelləri, 77 GHz Doopler Radarı və 3D Yol Sürüş Testi Reyestri
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              data-testid="close-modal-btn"
              className="p-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Bağla"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 overflow-x-auto text-sm font-medium">
          <button
            onClick={() => setActiveTab('audit')}
            data-testid="tab-audit"
            className={`px-4 py-3 flex items-center space-x-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'audit'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Diaqnostika və Səbəb</span>
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            data-testid="tab-simulator"
            className={`px-4 py-3 flex items-center space-x-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'simulator'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Lazer & Hədəf Stendi</span>
          </button>
          <button
            onClick={() => setActiveTab('systems')}
            data-testid="tab-systems"
            className={`px-4 py-3 flex items-center space-x-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'systems'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>Sistemlər Matrisi</span>
          </button>
          <button
            onClick={() => setActiveTab('centers')}
            data-testid="tab-centers"
            className={`px-4 py-3 flex items-center space-x-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'centers'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Akkreditə Mərkəzlər</span>
          </button>
          <button
            onClick={() => setActiveTab('certificate')}
            data-testid="tab-certificate"
            className={`px-4 py-3 flex items-center space-x-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'certificate'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Rəsmi Sertifikat & Reyestr</span>
          </button>
        </div>

        {/* Notification Toast */}
        {copiedNotification && (
          <div className="bg-emerald-600 text-white text-xs py-1.5 px-4 text-center font-medium transition-all">
            ✓ {copiedNotification} müvəffəqiyyətlə kopyalandı!
          </div>
        )}

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: AUDIT & TRIGGER SELECTOR */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              {/* Vehicle Preset & FIN Bar */}
              <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3 w-full md:w-auto">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/60 rounded-lg text-blue-600 dark:text-blue-400">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Nəqliyyat Vasitəsi</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                      <span>{vehicleModelName}</span>
                      <span className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded font-mono">
                        {plateNumber}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <button
                    onClick={() => {
                      setPlateNumber('90-OJ-055');
                      setVinNumber('WBA53AH07PCH28194');
                      setVehicleModelName('BMW 530i xDrive (G30)');
                    }}
                    className="px-2.5 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    BMW 530i
                  </button>
                  <button
                    onClick={() => {
                      setPlateNumber('77-EV-100');
                      setVinNumber('5YJ3E1EB8NF192834');
                      setVehicleModelName('Tesla Model 3 Long Range');
                    }}
                    className="px-2.5 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    Tesla Model 3
                  </button>
                  <button
                    onClick={() => {
                      setPlateNumber('99-XX-911');
                      setVinNumber('JTDKBRFU9N0128491');
                      setVehicleModelName('Toyota Camry 2.5 Hybrid');
                    }}
                    className="px-2.5 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    Camry Hybrid
                  </button>
                </div>
              </div>

              {/* Trigger Causes Grid */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center space-x-2">
                  <Wrench className="w-4 h-4 text-blue-600" />
                  <span>Kalibrasiyanı Zəruri Edən Səbəb və Hadisə</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(Object.keys(CALIBRATION_TRIGGERS) as CalibrationTriggerKey[]).map(key => {
                    const trig = CALIBRATION_TRIGGERS[key];
                    const isSelected = selectedTrigger === key;
                    return (
                      <div
                        key={key}
                        onClick={() => setSelectedTrigger(key)}
                        data-testid={`trigger-${key}`}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 ring-2 ring-blue-500/30'
                            : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-800/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                              trig.severity === 'critical'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                : trig.severity === 'high'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                            }`}
                          >
                            {trig.severity === 'critical' ? 'Təcili / Kritik' : trig.severity === 'high' ? 'Yüksək Vacib' : 'Müntəzəm'}
                          </span>
                          {isSelected && <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                          {trig.labelAz}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-2">
                          {trig.descriptionAz}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-auto">
                          {trig.requiredSystems.map(sys => (
                            <span
                              key={sys}
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                            >
                              {sys}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Trigger Statutory Notice */}
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                      Qanunvericilik və Təhlükəsizlik Xəbərdarlığı
                    </h4>
                    <p className="text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed">
                      {triggerInfo.legalNoteAz}
                    </p>
                    <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        Bu hadisə üzrə mütləq kalibrlənməli sistemlər:
                      </span>
                      {requiredSystems.map(sysKey => (
                        <span
                          key={sysKey}
                          className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold"
                        >
                          {ADAS_SYSTEMS[sysKey].nameAz}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Active DTC Error Scanner Simulation */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span>Elektron İdarəetmə Bloku (OBD-II DTC) Skanner Nəticəsi</span>
                </h3>
                <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-800/40">
                  {ADAS_DTC_CODES.slice(0, 3).map(dtc => (
                    <div key={dtc.code} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 font-mono text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300 rounded">
                          {dtc.code}
                        </span>
                        <div>
                          <div className="text-xs font-semibold text-gray-900 dark:text-white">
                            {dtc.descriptionAz}
                          </div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400">
                            Tövsiyə: {dtc.recommendedActionAz}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-1 rounded shrink-0 self-start sm:self-center">
                        Kalibrasiya gözləyir
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Step Call to Action */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveTab('simulator')}
                  data-testid="goto-simulator-btn"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm flex items-center space-x-2 shadow-lg shadow-blue-600/20 transition"
                >
                  <span>Lazer və Hədəf Stendini Aç</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: LASER & TARGET BOARD SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Visualizer SVG Stand */}
                <div className="lg:col-span-7 bg-slate-950 text-white rounded-2xl p-5 border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute top-3 left-4 flex items-center space-x-2 text-xs font-mono text-slate-400">
                    <Crosshair className="w-4 h-4 text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
                    <span>Autel MaxiSys / Bosch DAS 3000 Stand</span>
                  </div>

                  <div className="absolute top-3 right-4">
                    <span
                      data-testid="simulator-status-badge"
                      className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        toleranceEval.allPassed
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-red-500/20 text-red-400 border border-red-500/40'
                      }`}
                    >
                      {toleranceEval.allPassed ? '✓ Lazer Uyğundur' : '✕ Sapma Aşkar Edildi'}
                    </span>
                  </div>

                  {/* Target Graphic Canvas / SVG */}
                  <div className="my-8 w-full max-w-md aspect-[16/10] bg-slate-900 rounded-xl border border-slate-800 relative flex items-center justify-center overflow-hidden">
                    {/* Grid lines */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-30" />

                    {/* Concentric Calibration Target Pattern */}
                    <div
                      className={`w-32 h-32 rounded-full border-2 flex items-center justify-center relative transition-transform duration-300 ${
                        toleranceEval.allPassed ? 'border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                      }`}
                      style={{
                        transform: `translate(${centerlineOffsetMm * 3}px, ${(cameraPitchDeg * 40)}px) rotate(${cameraYawDeg * 20}deg)`
                      }}
                    >
                      <div className="w-20 h-20 rounded-full border border-dashed border-slate-400/60 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-blue-400/80 flex items-center justify-center">
                          <div className={`w-3 h-3 rounded-full ${toleranceEval.allPassed ? 'bg-emerald-400' : 'bg-red-500'}`} />
                        </div>
                      </div>

                      {/* Chessboard Checker Pattern Blocks */}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border border-black" />
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-black border border-white" />
                      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-black" />
                      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-black border border-white" />
                    </div>

                    {/* Laser Crosshair Beam Overlay */}
                    <div className="absolute inset-x-0 h-[1px] bg-red-500/60 shadow-[0_0_8px_red]" />
                    <div className="absolute inset-y-0 w-[1px] bg-red-500/60 shadow-[0_0_8px_red]" />

                    {/* Telemetry Real-time Tags */}
                    <div className="absolute bottom-2 left-3 text-[10px] font-mono text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                      Məsafə: {distanceMm} mm
                    </div>
                    <div className="absolute bottom-2 right-3 text-[10px] font-mono text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                      Ofset: {centerlineOffsetMm > 0 ? `+${centerlineOffsetMm}` : centerlineOffsetMm} mm
                    </div>
                  </div>

                  {/* Auto-Align Action */}
                  <div className="w-full flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                    <div>Standart Hədəf: Autel CSC0601 / Bosch Multi-Pattern</div>
                    <button
                      onClick={handleAutoAlign}
                      data-testid="auto-align-btn"
                      className="px-3 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 rounded-lg flex items-center space-x-1 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Avto-Nizamla (0°)</span>
                    </button>
                  </div>
                </div>

                {/* Laser Controls & Micro-adjustments */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center justify-between">
                      <span>Lazer Stendi Telemetriya Tənzimi</span>
                      <span className="text-[11px] font-normal text-gray-500">UNECE R152 / R157</span>
                    </h4>

                    {/* Slider 1: Distance */}
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Stend Məsafəsi (Bamperdən)</span>
                        <span className="font-mono font-bold text-gray-900 dark:text-white">{distanceMm} mm</span>
                      </div>
                      <input
                        type="range"
                        min="1500"
                        max="2500"
                        step="50"
                        value={distanceMm}
                        onChange={e => setDistanceMm(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                        <span>1500 mm</span>
                        <span>Norma: 2000 mm</span>
                        <span>2500 mm</span>
                      </div>
                    </div>

                    {/* Slider 2: Centerline Offset */}
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Mərkəz Oxu Ofseti (Lazer)</span>
                        <span
                          className={`font-mono font-bold ${
                            toleranceEval.isLaserCompliant ? 'text-emerald-600' : 'text-red-500'
                          }`}
                        >
                          {centerlineOffsetMm > 0 ? `+${centerlineOffsetMm}` : centerlineOffsetMm} mm
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-20"
                        max="20"
                        step="1"
                        value={centerlineOffsetMm}
                        onChange={e => setCenterlineOffsetMm(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                        <span>-20 mm</span>
                        <span>Dözümlülük: ±5 mm</span>
                        <span>+20 mm</span>
                      </div>
                    </div>

                    {/* Slider 3: Camera Pitch */}
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Ön Kamera Şaquli (Pitch)</span>
                        <span
                          className={`font-mono font-bold ${
                            Math.abs(cameraPitchDeg) <= 0.2 ? 'text-emerald-600' : 'text-red-500'
                          }`}
                        >
                          {cameraPitchDeg.toFixed(2)}°
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-0.50"
                        max="0.50"
                        step="0.01"
                        value={cameraPitchDeg}
                        onChange={e => setCameraPitchDeg(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                        <span>-0.50°</span>
                        <span>Hədd: ±0.20°</span>
                        <span>+0.50°</span>
                      </div>
                    </div>

                    {/* Slider 4: Radar Pitch */}
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-gray-600 dark:text-gray-400">77 GHz Radar Şaquli (Pitch)</span>
                        <span
                          className={`font-mono font-bold ${
                            Math.abs(radarPitchDeg) <= 0.3 ? 'text-emerald-600' : 'text-red-500'
                          }`}
                        >
                          {radarPitchDeg.toFixed(2)}°
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-0.50"
                        max="0.50"
                        step="0.01"
                        value={radarPitchDeg}
                        onChange={e => setRadarPitchDeg(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                        <span>-0.50°</span>
                        <span>Hədd: ±0.30°</span>
                        <span>+0.50°</span>
                      </div>
                    </div>
                  </div>

                  {/* Errors feedback if any */}
                  {toleranceEval.errors.length > 0 && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl space-y-1">
                      <div className="text-xs font-bold text-red-700 dark:text-red-300 flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Standart Xətalar:</span>
                      </div>
                      {toleranceEval.errors.map((err, i) => (
                        <div key={i} className="text-[11px] text-red-600 dark:text-red-400">
                          • {err}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Road Calibration Section */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                      <Gauge className="w-4 h-4 text-blue-600" />
                      <span>Dinamik Yol Sürüş Adaptasiyası (On-Road Calibration Drive)</span>
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Baku-Sumqayıt və ya Aeroport magistralında 40–70 km/s sürətlə zolaq və obyekt tanıma testi.
                    </p>
                  </div>
                  <button
                    onClick={handleAdvanceRoadTest}
                    data-testid="advance-road-test-btn"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shrink-0 transition"
                  >
                    {roadTelemetry.isCompleted ? 'Testi Yenidən Başlat' : `Yol Testini İrəlilət (+35%)`}
                  </button>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${roadTelemetry.progressPct}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-gray-500 text-[10px]">İcra Vəziyyəti</div>
                    <div className="font-bold text-gray-900 dark:text-white">{roadTelemetry.progressPct}%</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-gray-500 text-[10px]">Test Sürəti</div>
                    <div className="font-bold text-gray-900 dark:text-white">{roadTelemetry.speedKmh} km/s</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-gray-500 text-[10px]">Optik Zolaq Aşkarlanması</div>
                    <div className={`font-bold ${roadTelemetry.laneMarkingsDetected ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {roadTelemetry.laneMarkingsDetected ? '✓ Bəli (100% Aydın)' : '✕ Axtarılır...'}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-gray-500 text-[10px]">İzlənilən Obyektlər</div>
                    <div className="font-bold text-gray-900 dark:text-white">{roadTelemetry.obstaclesTracked} Nəqliyyat</div>
                  </div>
                </div>
              </div>

              {/* Next step to Certificate */}
              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setActiveTab('audit')}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  ← Geri: Səbəb Seçimi
                </button>
                <button
                  onClick={handleGenerateCertificate}
                  data-testid="generate-cert-btn"
                  disabled={!toleranceEval.allPassed}
                  className={`px-5 py-2.5 rounded-xl font-medium text-sm flex items-center space-x-2 transition ${
                    toleranceEval.allPassed
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <span>Rəsmi Sertifikat Hazırla (AZS-ADAS-2026)</span>
                  <Award className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ADAS SYSTEMS MATRIX */}
          {activeTab === 'systems' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
                  Dövlət Standartına (AZS / UNECE) Əsasən Tənzimlənən ADAS Modulları
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Hər bir modul üçün tələb olunan sensor növü, standart kalibrasiya üsulu və icazə verilən dözümlülük limitləri.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(Object.keys(ADAS_SYSTEMS) as AdasSystemKey[]).map(key => {
                    const sys = ADAS_SYSTEMS[key];
                    return (
                      <div
                        key={key}
                        className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                            {sys.key}
                          </span>
                          <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                            {sys.uneceStandard}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                          {sys.nameAz}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          {sys.descriptionAz}
                        </p>
                        <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-[11px] text-gray-500">
                          <div>Metod: <span className="font-medium text-gray-800 dark:text-gray-200 uppercase">{sys.defaultMethod}</span></div>
                          <div>Dözümlülük: <span className="font-mono font-medium text-gray-800 dark:text-gray-200">±{sys.tolerancePitchDeg}°</span></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACCREDITED CENTERS RADAR & PRICING */}
          {activeTab === 'centers' && (
            <div className="space-y-6">
              {/* Package selector & Pricing card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    Kalibrasiya Xidmət Paketi Seçin
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ADAS_PACKAGES.map(pkg => {
                      const isSelected = selectedPackageId === pkg.id;
                      return (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedPackageId(pkg.id)}
                          data-testid={`pkg-${pkg.id}`}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 ring-2 ring-blue-500/30'
                              : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-800/40'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-gray-900 dark:text-white">
                              {pkg.nameAz}
                            </span>
                            <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                              {pkg.basePriceAzn} ₼
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed mb-2">
                            {pkg.descriptionAz}
                          </p>
                          <div className="flex justify-between items-center text-[10px] text-gray-400">
                            <span>Müddət: ~{pkg.estimatedDurationMinutes} dəq</span>
                            <span className="uppercase font-mono">{pkg.method}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add-ons checkboxes */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 space-y-3">
                    <div className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                      Əlavə Xidmətlər və Üstünlüklər
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <label className="flex items-center space-x-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeDtcClearance}
                          onChange={e => setIncludeDtcClearance(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>OBD-II DTC Xətaların Silinməsi və Reset (+20 ₼)</span>
                      </label>
                      <label className="flex items-center space-x-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeExpressBay}
                          onChange={e => setIncludeExpressBay(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>Növbəsiz VIP Qəbul & Sürətli Təhvil (+30 ₼)</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Price Summary Card */}
                <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                        Hesablanmış Tarif
                      </span>
                      {/* Currency switcher */}
                      <div className="flex items-center space-x-1 bg-white/10 p-0.5 rounded-lg text-xs">
                        {(['AZN', 'USD', 'EUR'] as Currency[]).map(cur => (
                          <button
                            key={cur}
                            onClick={() => setActiveCurrency(cur)}
                            className={`px-2 py-0.5 rounded font-mono ${
                              activeCurrency === cur ? 'bg-blue-600 text-white font-bold' : 'text-slate-300'
                            }`}
                          >
                            {cur}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-300 pb-3 border-b border-white/10">
                      <div className="flex justify-between">
                        <span>Paket Bazas:</span>
                        <span className="font-mono">{priceBreakdown.basePriceAzn} ₼</span>
                      </div>
                      {includeDtcClearance && (
                        <div className="flex justify-between">
                          <span>DTC Sıfırlama:</span>
                          <span className="font-mono">+20 ₼</span>
                        </div>
                      )}
                      {includeExpressBay && (
                        <div className="flex justify-between">
                          <span>VIP Express Bay:</span>
                          <span className="font-mono">+30 ₼</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-400">
                        <span>18% ƏDV:</span>
                        <span className="font-mono">+{priceBreakdown.vatAzn} ₼</span>
                      </div>
                    </div>

                    <div className="pt-3">
                      <div className="text-xs text-slate-400">Yekun Məbləğ:</div>
                      <div className="text-2xl font-extrabold text-white mt-0.5" data-testid="total-price-display">
                        {priceBreakdown.formattedTotal}
                      </div>
                      <div className="text-[11px] text-blue-300 mt-1">
                        Təxmini icra müddəti: ~{priceBreakdown.estimatedDurationMinutes} dəqiqə
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 bg-white/5 p-3 rounded-xl border border-white/10">
                    Sertifikat dövlət portalında (AZS) dərhal aktivləşdirilir və BDYP bazasına inteqrasiya olunur.
                  </div>
                </div>
              </div>

              {/* Accredited Centers List */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>Akkreditə Olunmuş Rəsmi ADAS Mərkəzləri</span>
                  </h3>
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Mərkəz və ya avadanlıq axtar..."
                        value={centerSearchQuery}
                        onChange={e => setCenterSearchQuery(e.target.value)}
                        data-testid="center-search-input"
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <select
                      value={selectedDistrict}
                      onChange={e => setSelectedDistrict(e.target.value)}
                      className="text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-2.5 py-1.5"
                    >
                      {availableDistricts.map(d => (
                        <option key={d} value={d}>
                          {d === 'all' ? 'Bütün Rayonlar' : d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCenters.map(center => {
                    const isSelected = selectedCenterId === center.id;
                    return (
                      <div
                        key={center.id}
                        data-testid={`center-card-${center.id}`}
                        onClick={() => setSelectedCenterId(center.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-900/20 ring-2 ring-blue-500/20'
                            : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/40 hover:border-gray-300 dark:hover:border-gray-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                              {center.district}
                            </span>
                            <div className="flex items-center space-x-1 text-xs font-bold text-amber-500">
                              <span>★ {center.rating}</span>
                              <span className="text-[10px] text-gray-400 font-normal">({center.reviewsCount})</span>
                            </div>
                          </div>

                          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                            {center.nameAz}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-start space-x-1.5 mb-2">
                            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-gray-400" />
                            <span>{center.addressAz}</span>
                          </p>
                          <div className="text-[11px] text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/60 p-2 rounded-lg font-mono mb-3">
                            {center.equipment}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-1 text-gray-500">
                            <Clock className="w-3.5 h-3.5 text-blue-500" />
                            <span>Canlı Növbə: {center.liveQueueMinutes} dəq</span>
                          </div>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedCenterId(center.id);
                              setBookingConfirmed(true);
                              setTimeout(() => setBookingConfirmed(false), 3000);
                            }}
                            data-testid={`book-center-btn-${center.id}`}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition"
                          >
                            {bookingConfirmed && selectedCenterId === center.id ? '✓ Növbə Alındı' : 'Növbəyə Yazıl'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: OFFICIAL CERTIFICATE & REGISTRY */}
          {activeTab === 'certificate' && (
            <div className="space-y-6">
              {/* Search Registry Bar */}
              <form onSubmit={handleRegistrySearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Dövlət nömrəsi, VIN və ya Sertifikat No ilə reyestrdə axtarın..."
                    value={certSearchQuery}
                    onChange={e => setCertSearchQuery(e.target.value)}
                    data-testid="cert-search-input"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  data-testid="search-registry-btn"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition"
                >
                  Reyestrdə Yoxla
                </button>
              </form>

              {/* Certificate Canvas / Card */}
              <div
                className="bg-white dark:bg-gray-950 border-2 border-blue-900/40 dark:border-blue-700/60 rounded-2xl p-6 shadow-xl relative overflow-hidden"
                data-testid="adas-certificate-view"
              >
                {/* Watermark Emblem */}
                <div className="absolute right-6 top-6 opacity-5 pointer-events-none">
                  <Award className="w-64 h-64 text-blue-950 dark:text-blue-200" />
                </div>

                {/* State Header */}
                <div className="text-center pb-4 border-b-2 border-blue-900/20 dark:border-blue-800/40 space-y-1">
                  <div className="text-xs font-bold uppercase tracking-widest text-blue-900 dark:text-blue-300">
                    AZƏRBAYCAN STANDARTLAŞDIRMA İNSTİTUTU (AZS)
                  </div>
                  <div className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white uppercase tracking-tight">
                    ADAS SENSOR VƏ KAMERA KALİBRASİYA ŞƏHADƏTNAMƏSİ
                  </div>
                  <div className="text-xs font-mono text-gray-500 dark:text-gray-400">
                    Sertifikat No: <span className="font-bold text-blue-600 dark:text-blue-400">{activeCert.certificateNo}</span>
                  </div>
                </div>

                {/* Credentials Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 my-5 text-xs">
                  <div className="bg-gray-50 dark:bg-gray-900 p-2.5 rounded-lg border border-gray-200 dark:border-gray-800">
                    <span className="text-gray-500 text-[10px] uppercase font-bold">Dövlət Qeydiyyat Nişanı</span>
                    <div className="text-sm font-mono font-bold text-gray-900 dark:text-white mt-0.5">
                      {activeCert.vehiclePlate}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-2.5 rounded-lg border border-gray-200 dark:border-gray-800">
                    <span className="text-gray-500 text-[10px] uppercase font-bold">Kuzov VIN Kodu</span>
                    <div className="text-xs font-mono font-bold text-gray-900 dark:text-white mt-0.5 truncate">
                      {activeCert.vin}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-2.5 rounded-lg border border-gray-200 dark:border-gray-800">
                    <span className="text-gray-500 text-[10px] uppercase font-bold">Kalibrasiya Tarixi</span>
                    <div className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">
                      {activeCert.calibrationDate}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-2.5 rounded-lg border border-gray-200 dark:border-gray-800">
                    <span className="text-gray-500 text-[10px] uppercase font-bold">Etibarlılıq Müddəti</span>
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {activeCert.expiryDate} (1 İl)
                    </div>
                  </div>
                </div>

                {/* Telemetry Measurements Table */}
                <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden text-xs my-4">
                  <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 font-bold text-gray-800 dark:text-gray-200 flex justify-between">
                    <span>Metrologiya və Sensor Lazer Test Protokolu</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">STATUS: UĞURLU / PASSED</span>
                  </div>
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-[11px] text-gray-500">
                      <tr>
                        <th className="p-2.5">Parametr</th>
                        <th className="p-2.5">Faktiki Göstərici</th>
                        <th className="p-2.5">AZS / UNECE Həddi</th>
                        <th className="p-2.5 text-right">Rəy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800 font-mono">
                      <tr>
                        <td className="p-2.5 font-sans">Lazer Mərkəz Oxu Ofseti</td>
                        <td className="p-2.5">{activeCert.telemetry.centerlineOffsetMm} mm</td>
                        <td className="p-2.5">±5.0 mm</td>
                        <td className="p-2.5 text-right text-emerald-600 font-bold">UYĞUNDUR</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-sans">Ön Optik Kamera (Pitch / Yaw)</td>
                        <td className="p-2.5">{activeCert.telemetry.cameraPitchDeg}° / {activeCert.telemetry.cameraYawDeg}°</td>
                        <td className="p-2.5">±0.20°</td>
                        <td className="p-2.5 text-right text-emerald-600 font-bold">UYĞUNDUR</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-sans">Ön 77 GHz Radar (Pitch / Yaw)</td>
                        <td className="p-2.5">{activeCert.telemetry.radarPitchDeg}° / {activeCert.telemetry.radarYawDeg}°</td>
                        <td className="p-2.5">±0.30°</td>
                        <td className="p-2.5 text-right text-emerald-600 font-bold">UYĞUNDUR</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-sans">Dinamik Yol Öyrənmə Adaptasiyası</td>
                        <td className="p-2.5">15 km / 65 km/s</td>
                        <td className="p-2.5">ISO 15622</td>
                        <td className="p-2.5 text-right text-emerald-600 font-bold">MƏNBƏ TƏSDİQLƏNDİ</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Calibrated Systems badges */}
                <div className="my-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-gray-700 dark:text-gray-300">Təsdiq olunmuş sistemlər:</span>
                  {activeCert.systemsCalibrated.map(sysKey => (
                    <span
                      key={sysKey}
                      className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-mono text-[11px]"
                    >
                      {sysKey} ({ADAS_SYSTEMS[sysKey]?.nameAz.split(' ')[0]})
                    </span>
                  ))}
                </div>

                {/* Footer Signature & QR code strip */}
                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="text-gray-500">Məsul Ekspert-Mühəndis:</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{activeCert.technicianName}</div>
                    <div className="text-[10px] font-mono text-gray-400">
                      Təhlükəsizlik Heşi: {activeCert.qrVerificationHash}
                    </div>
                  </div>

                  {/* QR Box Visualizer */}
                  <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-900 p-2 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="w-12 h-12 bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-1 flex flex-col justify-between">
                      <div className="flex justify-between">
                        <div className="w-2.5 h-2.5 bg-black dark:bg-white" />
                        <div className="w-2.5 h-2.5 bg-black dark:bg-white" />
                      </div>
                      <div className="flex justify-between">
                        <div className="w-2.5 h-2.5 bg-black dark:bg-white" />
                        <div className="w-1.5 h-1.5 bg-blue-600" />
                      </div>
                    </div>
                    <div className="text-[10px] leading-tight text-gray-500">
                      <div className="font-bold text-gray-800 dark:text-gray-200">BDYP & SİMA QR</div>
                      <div>Dövlət portalında təsdiqlənib</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Certificate Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCopy(activeCert.certificateNo, 'Sertifikat Nömrəsi')}
                    data-testid="copy-cert-btn"
                    className="px-3.5 py-2 border border-gray-300 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-1.5 transition"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Nömrəni Kopyala</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    data-testid="print-cert-btn"
                    className="px-3.5 py-2 border border-gray-300 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-1.5 transition"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Çap Et</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    handleAutoAlign();
                    setActiveTab('simulator');
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium transition"
                >
                  Yeni Kalibrasiya Testi Başlat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

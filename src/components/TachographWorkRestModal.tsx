import React, { useState, useMemo } from 'react';
import { Vehicle, Currency } from '../types/vehicle';
import {
  TachographConditionId,
  PassengerFreightRuleId,
  TACHOGRAPH_CONDITION_PROFILES,
  PASSENGER_FREIGHT_VIOLATION_PROFILES,
  TACHOGRAPH_SERVICE_PACKAGES,
  TACHOGRAPH_CALIBRATION_CENTERS,
  SAMPLE_TACHOGRAPH_CERTIFICATES,
  TachographComplianceCertificate,
} from '../data/mockTachographData';
import {
  evaluateDriverWorkRestRegime,
  evaluateTachographHardwareCompliance,
  evaluatePassengerFreightManifest,
  calculateTachographServiceSummary,
  lookupTachographCertificate,
  convertFromAzn,
} from '../utils/tachographCompliance';
import {
  X,
  Clock,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  QrCode,
  Search,
  MapPin,
  Wrench,
  FileCheck,
  Truck,
  Activity,
  Copy,
  Check,
} from 'lucide-react';

interface TachographWorkRestModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: Vehicle | null;
  currency: Currency;
}

type ActiveTab =
  | 'work_rest_aetr'
  | 'tachograph_plomb'
  | 'waybill_manifest'
  | 'centers'
  | 'certificate';

export const TachographWorkRestModal: React.FC<TachographWorkRestModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  currency,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('work_rest_aetr');

  // Tab 1: Driver Work & Rest Regime (NK Decision No. 73 & AETR)
  const [continuousDrivingHours, setContinuousDrivingHours] = useState<number>(3.8);
  const [breakTakenMinutes, setBreakTakenMinutes] = useState<number>(45);
  const [dailyDrivingHours, setDailyDrivingHours] = useState<number>(8.2);
  const [extendedDaysUsedThisWeek, setExtendedDaysUsedThisWeek] = useState<number>(1);
  const [dailyRestHours, setDailyRestHours] = useState<number>(11.0);
  const [weeklyDrivingHours, setWeeklyDrivingHours] = useState<number>(44);
  const [biweeklyDrivingHours, setBiweeklyDrivingHours] = useState<number>(80);
  const [isDoubleCrewMultiManning, setIsDoubleCrewMultiManning] = useState<boolean>(false);

  // Tab 2: Digital Tachograph Seal, Calibration & Speed Limiter
  const [vehicleCategory, setVehicleCategory] = useState<
    'M1_private' | 'M2_minibus' | 'M3_coach' | 'N2_medium_truck' | 'N3_heavy_tir'
  >('M3_coach');
  const [conditionProfile, setConditionProfile] =
    useState<TachographConditionId>('digital_g2_sealed_valid');
  const [monthsSinceLastCalibration, setMonthsSinceLastCalibration] = useState<number>(8);
  const [tireSizeChangedSinceCalibration, setTireSizeChangedSinceCalibration] =
    useState<boolean>(false);
  const [speedLimiterSetKmh, setSpeedLimiterSetKmh] = useState<number>(100);

  // Tab 3: Passenger & Freight Manifest, AYNA E-Ugur Waybill & Service Packages
  const [ruleProfile, setRuleProfile] =
    useState<PassengerFreightRuleId>('compliant_manifest_and_route');
  const [seatedPassengerCapacity, setSeatedPassengerCapacity] = useState<number>(49);
  const [actualPassengersOnBoard, setActualPassengersOnBoard] = useState<number>(46);
  const [isIntercityOrMountainRoute, setIsIntercityOrMountainRoute] = useState<boolean>(true);
  const [hasElectronicUgurWaybill, setHasElectronicUgurWaybill] = useState<boolean>(true);
  const [hasPreTripMedicalAndMechanicStamp, setHasPreTripMedicalAndMechanicStamp] =
    useState<boolean>(true);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([
    'ayna_driver_tachograph_card',
    'azs_metrological_calibration_2yr',
  ]);

  // Tab 4: Accredited Centers Filter
  const [selectedCity, setSelectedCity] = useState<string>('Hamısı');
  const [selectedCenterName, setSelectedCenterName] = useState<string>(
    TACHOGRAPH_CALIBRATION_CENTERS[0].nameAz
  );

  // Tab 5: Certificate Generation & Lookup
  const [vehiclePlateInput, setVehiclePlateInput] = useState<string>('99-BUS-404');
  const [vinInput, setVinInput] = useState<string>(vehicle?.vin || 'WDB9340321L849201');
  const [driverCardInput, setDriverCardInput] = useState<string>('AZ-DRV-2026-510842');
  const [activeCertificate, setActiveCertificate] = useState<TachographComplianceCertificate>(
    SAMPLE_TACHOGRAPH_CERTIFICATES[0]
  );
  const [lookupQuery, setLookupQuery] = useState<string>('');
  const [lookupError, setLookupError] = useState<string>('');
  const [copiedCert, setCopiedCert] = useState<boolean>(false);

  const workRestResult = useMemo(
    () =>
      evaluateDriverWorkRestRegime({
        continuousDrivingHours,
        breakTakenMinutes,
        dailyDrivingHours,
        extendedDaysUsedThisWeek,
        dailyRestHours,
        weeklyDrivingHours,
        biweeklyDrivingHours,
        isDoubleCrewMultiManning,
      }),
    [
      continuousDrivingHours,
      breakTakenMinutes,
      dailyDrivingHours,
      extendedDaysUsedThisWeek,
      dailyRestHours,
      weeklyDrivingHours,
      biweeklyDrivingHours,
      isDoubleCrewMultiManning,
    ]
  );

  const hardwareResult = useMemo(
    () =>
      evaluateTachographHardwareCompliance({
        vehicleCategory,
        conditionProfile,
        monthsSinceLastCalibration,
        tireSizeChangedSinceCalibration,
        speedLimiterSetKmh,
      }),
    [
      vehicleCategory,
      conditionProfile,
      monthsSinceLastCalibration,
      tireSizeChangedSinceCalibration,
      speedLimiterSetKmh,
    ]
  );

  const manifestResult = useMemo(
    () =>
      evaluatePassengerFreightManifest({
        ruleProfile,
        seatedPassengerCapacity,
        actualPassengersOnBoard,
        isIntercityOrMountainRoute,
        hasElectronicUgurWaybill,
        hasPreTripMedicalAndMechanicStamp,
      }),
    [
      ruleProfile,
      seatedPassengerCapacity,
      actualPassengersOnBoard,
      isIntercityOrMountainRoute,
      hasElectronicUgurWaybill,
      hasPreTripMedicalAndMechanicStamp,
    ]
  );

  const serviceSummary = useMemo(
    () => calculateTachographServiceSummary(selectedPackages, currency),
    [selectedPackages, currency]
  );

  const filteredCenters = useMemo(() => {
    if (selectedCity === 'Hamısı') return TACHOGRAPH_CALIBRATION_CENTERS;
    return TACHOGRAPH_CALIBRATION_CENTERS.filter((c) => c.city === selectedCity);
  }, [selectedCity]);

  if (!isOpen) return null;

  const currencySymbol = currency === 'AZN' ? '₼' : currency === 'USD' ? '$' : '€';

  const togglePackage = (pkgId: string) => {
    setSelectedPackages((prev) =>
      prev.includes(pkgId) ? prev.filter((id) => id !== pkgId) : [...prev, pkgId]
    );
  };

  const handleGenerateCertificate = () => {
    const isAllCompliant =
      workRestResult.isCompliant && hardwareResult.isCompliant && manifestResult.isCompliant;

    const generated: TachographComplianceCertificate = {
      certificateNumber: `AYNA-TAXO-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      issueDate: '2026-10-18',
      expiryDate: '2028-10-18',
      vehiclePlate: vehiclePlateInput.trim() || '99-BUS-404',
      vin: vinInput.trim() || 'WDB9340321L849201',
      vehicleModel: vehicle
        ? `${vehicle.make} ${vehicle.model} (${vehicle.year})`
        : 'Mercedes-Benz Travego 15 SHD (M3 / 49+1 yer)',
      driverCardNumber: driverCardInput.trim() || 'AZ-DRV-2026-510842',
      tachographModelAndPlomb: hardwareResult.verdictTitleAz,
      calibrationStatusAz: hardwareResult.calibrationExpired
        ? 'Kalibrasiya müddəti bitib — AZS stend yoxlaması tələb olunur'
        : `Metroloji yoxlama aktivdir (${24 - monthsSinceLastCalibration} ay qalıb)`,
      workRestAuditVerdictAz: workRestResult.verdictBadgeAz,
      electronicWaybillNumber: hasElectronicUgurWaybill
        ? 'AYNA-UGL-2026-90412 (Aktiv)'
        : 'Qeydiyyatda Yoxdur',
      inspectingCenterAz: selectedCenterName,
      verificationHash: `0x${Math.random().toString(16).substring(2, 10)}...a91e`,
      overallStatus: isAllCompliant ? 'PASS' : 'FAIL',
    };
    setActiveCertificate(generated);
    setLookupError('');
  };

  const handleLookup = () => {
    const found = lookupTachographCertificate(lookupQuery);
    if (found) {
      setActiveCertificate(found);
      setLookupError('');
    } else {
      setLookupError(
        'Daxil edilən Sertifikat №, DQN, VIN və ya Sürücü Kartı üzrə AYNA/AZS reyestrində qeyd tapılmadı.'
      );
    }
  };

  const handleCopyCert = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(activeCertificate.certificateNumber);
    }
    setCopiedCert(true);
    setTimeout(() => setCopiedCert(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      data-testid="tachograph-work-rest-modal"
    >
      <div
        className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[93vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  AYNA & BDYP Rəqəmsal Taxoqraf, Sürücü İş-İstirahət Rejimi (AETR) və «E-Uğur» Yol Vərəqəsi Portalı
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  NK Qərar № 73 • YHQ Əlavə 1 Bənd 7.4 • İXM 326-1 & 348
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                4.5 Saat Fasiləsiz / 9 Saat Gündəlik Sürüş Norması • 24 Aylıq AZS Taxoqraf Plomb/Kalibrasiyası • Reysöncəsi Tibbi Müayinə
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            data-testid="close-tachograph-modal"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-950/50 px-4 pt-2 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('work_rest_aetr')}
            data-testid="tab-work-rest-aetr"
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'work_rest_aetr'
                ? 'border-indigo-400 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            1. İş-İstirahət Rejimi (AETR / NK №73)
          </button>

          <button
            onClick={() => setActiveTab('tachograph_plomb')}
            data-testid="tab-tachograph-plomb"
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'tachograph_plomb'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            2. Taxoqraf Plombu & 24 Ay Kalibrasiya
          </button>

          <button
            onClick={() => setActiveTab('waybill_manifest')}
            data-testid="tab-waybill-manifest"
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'waybill_manifest'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Truck className="w-4 h-4" />
            3. E-Uğur Yol Vərəqəsi & Sərnişin Norması
          </button>

          <button
            onClick={() => setActiveTab('centers')}
            data-testid="tab-tachograph-centers"
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'centers'
                ? 'border-amber-400 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            4. AYNA & AZS Kalibrasiya Mərkəzləri
          </button>

          <button
            onClick={() => setActiveTab('certificate')}
            data-testid="tab-tachograph-certificate"
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'certificate'
                ? 'border-purple-400 text-purple-400 bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            5. Rəsmi AYNA-TAXO-2026 Sertifikatı
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: DRIVER WORK & REST REGIME (NK DECISION NO. 73 & AETR) */}
          {activeTab === 'work_rest_aetr' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" data-testid="panel-work-rest-aetr">
              {/* Left Controls */}
              <div className="lg:col-span-7 space-y-5 bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-400" />
                  Sürücü İş və İstirahət Rejimi Simulyatoru (NK Qərar № 73 & AETR)
                </h3>

                {/* Continuous Driving Slider */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">
                      Fasiləsiz İdarəetmə Müddəti (Qanuni norma: ≤ 4.5 saat):
                    </span>
                    <span
                      className={`font-black ${
                        continuousDrivingHours > 4.5 ? 'text-rose-400' : 'text-indigo-400'
                      }`}
                      data-testid="continuous-hours-value"
                    >
                      {continuousDrivingHours.toFixed(1)} saat
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={8.0}
                    step={0.5}
                    value={continuousDrivingHours}
                    onChange={(e) => setContinuousDrivingHours(Number(e.target.value))}
                    data-testid="continuous-driving-slider"
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>0.5 saat</span>
                    <span className="text-amber-400 font-bold">4.5 saat (45 dəq fasilə həddi)</span>
                    <span>8.0 saat</span>
                  </div>
                </div>

                {/* Break Taken & Daily Driving Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">Verilmiş Fasilə (≥ 45 dəq):</span>
                      <span className="text-cyan-400 font-black">{breakTakenMinutes} dəq</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={60}
                      step={15}
                      value={breakTakenMinutes}
                      onChange={(e) => setBreakTakenMinutes(Number(e.target.value))}
                      data-testid="break-minutes-slider"
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                    <p className="text-[11px] text-slate-400">
                      15 dəq + 30 dəq hissəli fasilə qanunidir
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">Gündəlik Sürüş (≤ 9/10 s):</span>
                      <span
                        className={`font-black ${
                          dailyDrivingHours > 10 ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {dailyDrivingHours.toFixed(1)} saat
                      </span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={13}
                      step={0.5}
                      value={dailyDrivingHours}
                      onChange={(e) => setDailyDrivingHours(Number(e.target.value))}
                      data-testid="daily-driving-slider"
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <p className="text-[11px] text-slate-400">
                      Standart 9.0 s (həftədə 2 dəfə 10.0 s)
                    </p>
                  </div>
                </div>

                {/* Extended Days, Daily Rest, Weekly & Biweekly Hours */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <label className="text-[11px] text-slate-400 block mb-1">
                      10s Gün Sayı (≤2):
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={7}
                      value={extendedDaysUsedThisWeek}
                      onChange={(e) => setExtendedDaysUsedThisWeek(Number(e.target.value))}
                      data-testid="extended-days-input"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white font-bold"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Sutkalıq İstirahət (≥9s):
                    </label>
                    <input
                      type="number"
                      min={4}
                      max={16}
                      step={0.5}
                      value={dailyRestHours}
                      onChange={(e) => setDailyRestHours(Number(e.target.value))}
                      data-testid="daily-rest-input"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white font-bold"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <label className="text-[11px] text-slate-400 block mb-1">
                      1 Həftəlik (≤56s):
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={80}
                      value={weeklyDrivingHours}
                      onChange={(e) => setWeeklyDrivingHours(Number(e.target.value))}
                      data-testid="weekly-driving-input"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white font-bold"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <label className="text-[11px] text-slate-400 block mb-1">
                      2 Həftəlik (≤90s):
                    </label>
                    <input
                      type="number"
                      min={20}
                      max={120}
                      value={biweeklyDrivingHours}
                      onChange={(e) => setBiweeklyDrivingHours(Number(e.target.value))}
                      data-testid="biweekly-driving-input"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white font-bold"
                    />
                  </div>
                </div>

                {/* Multi-manning toggle */}
                <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Qoşa Ekipaj — Kabinədə 2 Sürücü («Multi-Manning» Rejimi)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Hər iki sürücünün çip-kartı taxoqrafın 1-ci və 2-ci yuvasında aktivdir (30 saat ərzində 9 saat istirahət)
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isDoubleCrewMultiManning}
                    onChange={(e) => setIsDoubleCrewMultiManning(e.target.checked)}
                    data-testid="double-crew-checkbox"
                    className="w-5 h-5 accent-indigo-500 rounded cursor-pointer"
                  />
                </label>
              </div>

              {/* Right Audit Verdict */}
              <div className="lg:col-span-5 space-y-4">
                <div
                  className={`p-5 rounded-2xl border ${
                    workRestResult.isCompliant
                      ? 'bg-emerald-950/30 border-emerald-500/40'
                      : 'bg-rose-950/35 border-rose-500/40'
                  }`}
                  data-testid="work-rest-verdict-card"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      AETR & NK №73 Ekspertiza Rəyi
                    </span>
                    {workRestResult.isCompliant ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> QANUNİ REJİM
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> REJİM POZUNTUSU
                      </span>
                    )}
                  </div>

                  <h4
                    className="text-base font-black text-white mb-4"
                    data-testid="work-rest-verdict-badge"
                  >
                    {workRestResult.verdictBadgeAz}
                  </h4>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">
                        Sürücü Cəriməsi (İXM 326-1):
                      </span>
                      <span
                        className="text-lg font-black text-rose-400"
                        data-testid="work-rest-driver-fine"
                      >
                        {convertFromAzn(workRestResult.driverFineAzn, currency)} {currencySymbol}
                      </span>
                      {workRestResult.driverFineAzn > 0 && (
                        <span className="text-[10px] text-emerald-400 block">
                          50% AsanPay güzəşti: {convertFromAzn(workRestResult.discountedDriverFineAzn, currency)} {currencySymbol}
                        </span>
                      )}
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">
                        Vəzifəli Şəxs (İXM 348):
                      </span>
                      <span
                        className="text-lg font-black text-amber-400"
                        data-testid="work-rest-official-fine"
                      >
                        {convertFromAzn(workRestResult.officialEntityFineAzn, currency)} {currencySymbol}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Qalan fasiləsiz limit: {workRestResult.remainingContinuousMinutes} dəq
                      </span>
                    </div>
                  </div>

                  {workRestResult.violationsAz.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {workRestResult.violationsAz.map((v, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-2"
                        >
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <span>{v}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    {workRestResult.recommendationsAz.map((rec, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DIGITAL TACHOGRAPH SEAL, 24-MONTH CALIBRATION & SPEED LIMITER */}
          {activeTab === 'tachograph_plomb' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" data-testid="panel-tachograph-plomb">
              <div className="lg:col-span-7 space-y-4 bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  Rəqəmsal Taxoqraf Plombu, 24 Aylıq Kalibrasiya & Sürət Məhdudlaşdırıcı Stendi
                </h3>

                {/* Vehicle Category Selector */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2">
                    Nəqliyyat Vasitəsinin Kateqoriyası (YHQ Əlavə 1 Bənd 7.4):
                  </label>
                  <select
                    value={vehicleCategory}
                    onChange={(e) => setVehicleCategory(e.target.value as any)}
                    data-testid="tachograph-category-select"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold"
                  >
                    <option value="M3_coach">M3 — Şəhərlərarası / Turist Avtobusu (&gt;5 ton, &gt;8 yer)</option>
                    <option value="M2_minibus">M2 — Mikroavtobus (&le;5 ton, &gt;8 oturacaq yeri)</option>
                    <option value="N3_heavy_tir">N3 — Ağır Tonnajlı Yük Dartıcısı / TIR (&gt;12 ton)</option>
                    <option value="N2_medium_truck">N2 — Orta Tonnajlı Yük Avtomobili (3.5 – 12 ton)</option>
                    <option value="M1_private">M1 — Şəxsi Minik Avtomobili (&le;8 yer — Taxoqrafdan Azad)</option>
                  </select>
                </div>

                {/* Condition Profiles */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">
                    Taxoqraf Cihazı, Plomb və Sürücü Kartı Vəziyyəti:
                  </label>
                  {TACHOGRAPH_CONDITION_PROFILES.map((prof) => (
                    <button
                      key={prof.id}
                      type="button"
                      onClick={() => setConditionProfile(prof.id)}
                      data-testid={`tacho-condition-${prof.id}`}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        conditionProfile === prof.id
                          ? 'bg-cyan-500/15 border-cyan-500/50 text-white'
                          : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-bold">{prof.nameAz}</span>
                        <span className="text-xs font-bold text-amber-400">
                          {prof.driverFineAzn > 0 ? `${prof.driverFineAzn} ₼` : '0 ₼'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{prof.descriptionAz}</p>
                    </button>
                  ))}
                </div>

                {/* Calibration Months & Speed Limiter */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">Son Kalibrasiyadan Keçən Ay:</span>
                      <span className="text-cyan-400 font-bold">{monthsSinceLastCalibration} ay</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={36}
                      value={monthsSinceLastCalibration}
                      onChange={(e) => setMonthsSinceLastCalibration(Number(e.target.value))}
                      data-testid="calibration-months-slider"
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-400 block">
                      Qanuni metroloji yoxlama müddəti: maks. 24 ay
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">Sürət Məhdudlaşdırıcı (km/s):</span>
                      <span className="text-amber-400 font-bold">{speedLimiterSetKmh} km/s</span>
                    </div>
                    <input
                      type="range"
                      min={75}
                      max={130}
                      value={speedLimiterSetKmh}
                      onChange={(e) => setSpeedLimiterSetKmh(Number(e.target.value))}
                      data-testid="speed-limiter-slider"
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-400 block">
                      Norma: Avtobus (M2/M3) ≤100 km/s, Yük (N2/N3) ≤90 km/s
                    </span>
                  </div>
                </div>

                <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                  <span className="text-xs font-bold text-slate-200">
                    Kalibrasiyadan sonra şin ölçüsü (təkər çevrəsi L) dəyişdirilib
                  </span>
                  <input
                    type="checkbox"
                    checked={tireSizeChangedSinceCalibration}
                    onChange={(e) => setTireSizeChangedSinceCalibration(e.target.checked)}
                    data-testid="tire-changed-checkbox"
                    className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
                  />
                </label>
              </div>

              {/* Right Hardware Verdict */}
              <div className="lg:col-span-5 space-y-4">
                <div
                  className={`p-5 rounded-2xl border ${
                    hardwareResult.isCompliant
                      ? 'bg-emerald-950/30 border-emerald-500/40'
                      : 'bg-rose-950/35 border-rose-500/40'
                  }`}
                  data-testid="hardware-verdict-card"
                >
                  <h4
                    className="text-base font-black text-white mb-3"
                    data-testid="hardware-verdict-title"
                  >
                    {hardwareResult.verdictTitleAz}
                  </h4>

                  <div className="grid grid-cols-3 gap-2.5 mb-4">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Sürücü:</span>
                      <span className="text-base font-black text-rose-400">
                        {convertFromAzn(hardwareResult.driverFineAzn, currency)} {currencySymbol}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Vəzifəli Şəxs:</span>
                      <span className="text-base font-black text-amber-400">
                        {convertFromAzn(hardwareResult.officialFineAzn, currency)} {currencySymbol}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Hüquqi Şəxs:</span>
                      <span className="text-base font-black text-purple-400">
                        {convertFromAzn(hardwareResult.legalEntityFineAzn, currency)} {currencySymbol}
                      </span>
                    </div>
                  </div>

                  {hardwareResult.violationsAz.map((v, i) => (
                    <div
                      key={i}
                      className="p-2.5 mb-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-2"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{v}</span>
                    </div>
                  ))}

                  {hardwareResult.recommendationsAz.map((rec, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WAYBILL, PASSENGER MANIFEST & SERVICE PACKAGES */}
          {activeTab === 'waybill_manifest' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" data-testid="panel-waybill-manifest">
              <div className="lg:col-span-7 space-y-4 bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-400" />
                  AYNA «E-Uğur» Elektron Yol Vərəqəsi, Reysöncəsi Tibbi Müayinə & Sərnişin Tutumu
                </h3>

                <div className="space-y-2">
                  {PASSENGER_FREIGHT_VIOLATION_PROFILES.map((prof) => (
                    <button
                      key={prof.id}
                      type="button"
                      onClick={() => setRuleProfile(prof.id)}
                      data-testid={`manifest-rule-${prof.id}`}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        ruleProfile === prof.id
                          ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                          : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-bold">{prof.nameAz}</span>
                        <span className="text-xs font-bold text-amber-400">
                          {prof.driverFineAzn > 0 ? `${prof.driverFineAzn} ₼` : '0 ₼'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{prof.descriptionAz}</p>
                    </button>
                  ))}
                </div>

                {/* Seated Capacity vs Actual Passengers */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <label className="text-xs text-slate-400 block mb-1">
                      Texpasport Oturacaq Sayı:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={seatedPassengerCapacity}
                      onChange={(e) => setSeatedPassengerCapacity(Number(e.target.value))}
                      data-testid="seated-capacity-input"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white font-bold"
                    />
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <label className="text-xs text-slate-400 block mb-1">
                      Faktiki Sərnişin Sayı:
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={80}
                      value={actualPassengersOnBoard}
                      onChange={(e) => setActualPassengersOnBoard(Number(e.target.value))}
                      data-testid="actual-passengers-input"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                    <span className="text-xs font-bold text-slate-200">
                      AYNA «E-Uğur» Elektron Yol Vərəqəsi Aktivdir
                    </span>
                    <input
                      type="checkbox"
                      checked={hasElectronicUgurWaybill}
                      onChange={(e) => setHasElectronicUgurWaybill(e.target.checked)}
                      data-testid="ugur-waybill-checkbox"
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                    <span className="text-xs font-bold text-slate-200">
                      Reysöncəsi Tibbi & Mexanik Möhürü Var
                    </span>
                    <input
                      type="checkbox"
                      checked={hasPreTripMedicalAndMechanicStamp}
                      onChange={(e) => setHasPreTripMedicalAndMechanicStamp(e.target.checked)}
                      data-testid="pre-trip-medical-checkbox"
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                  </label>
                </div>

                {/* Service Packages */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                    Rəsmi AYNA Sürücü Kartı & AZS Kalibrasiya Xidmət Paketləri
                  </h4>
                  {TACHOGRAPH_SERVICE_PACKAGES.map((pkg) => {
                    const isSelected = selectedPackages.includes(pkg.id);
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => togglePackage(pkg.id)}
                        data-testid={`tacho-service-pkg-${pkg.id}`}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500/40'
                            : 'bg-slate-900/60 border-slate-800'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-bold text-white block">{pkg.nameAz}</span>
                          <span className="text-[11px] text-slate-400">{pkg.descriptionAz}</span>
                        </div>
                        <span className="text-xs font-black text-emerald-400 shrink-0 ml-3">
                          {convertFromAzn(pkg.stateDutyOrPartsAzn + pkg.laborCostAzn, currency)}{' '}
                          {currencySymbol}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Manifest Verdict & Service Summary */}
              <div className="lg:col-span-5 space-y-4">
                <div
                  className={`p-5 rounded-2xl border ${
                    manifestResult.isCompliant
                      ? 'bg-emerald-950/30 border-emerald-500/40'
                      : 'bg-rose-950/35 border-rose-500/40'
                  }`}
                  data-testid="manifest-verdict-card"
                >
                  <h4
                    className="text-base font-black text-white mb-3"
                    data-testid="manifest-verdict-title"
                  >
                    {manifestResult.verdictAz}
                  </h4>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Normadan Artıq Sərnişin:</span>
                      <span
                        className="text-lg font-black text-rose-400"
                        data-testid="excess-passengers-value"
                      >
                        +{manifestResult.excessPassengerCount} nəfər
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Vəzifəli Cəriməsi (İXM 348):</span>
                      <span className="text-lg font-black text-amber-400">
                        {convertFromAzn(manifestResult.officialFineAzn, currency)} {currencySymbol}
                      </span>
                    </div>
                  </div>

                  {manifestResult.violationsAz.map((v, i) => (
                    <div
                      key={i}
                      className="p-2.5 mb-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200"
                    >
                      {v}
                    </div>
                  ))}
                </div>

                {/* Service Package Total */}
                <div
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                  data-testid="tachograph-service-summary"
                >
                  <h4 className="text-sm font-bold text-white">
                    Seçilmiş Kalibrasiya & Sürücü Kartı Xərci
                  </h4>
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Rüsum / Ehtiyat hissə:</span>
                    <span>
                      {convertFromAzn(serviceSummary.stateDutyAndPartsAzn, currency)} {currencySymbol}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Kalibrasiya & Xidmət haqqı:</span>
                    <span>
                      {convertFromAzn(serviceSummary.laborCostAzn, currency)} {currencySymbol}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-black text-emerald-400 pt-2 border-t border-slate-800">
                    <span>Yekun Cəmi:</span>
                    <span data-testid="tachograph-service-total">
                      {serviceSummary.totalInCurrency} {currencySymbol}
                    </span>
                  </div>
                  <div className="text-[11px] text-indigo-300">
                    Qarşısı alınan cərimə riski: {convertFromAzn(serviceSummary.finesAvoidedAzn, currency)}{' '}
                    {currencySymbol}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACCREDITED AYNA & AZS CALIBRATION CENTERS */}
          {activeTab === 'centers' && (
            <div className="space-y-4" data-testid="panel-tachograph-centers">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="text-base font-bold text-white">
                  Akkreditə Olunmuş AYNA Rəqəmsal Kart & AZS Taxoqraf Kalibrasiya Mərkəzləri
                </h3>
                <div className="flex gap-2">
                  {['Hamısı', 'Bakı', 'Xırdalan', 'Sumqayıt', 'Gəncə'].map((city) => (
                    <button
                      key={city}
                      onClick={() => setSelectedCity(city)}
                      data-testid={`tacho-city-filter-${city}`}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedCity === city
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCenters.map((center) => (
                  <div
                    key={center.id}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5"
                    data-testid={`tacho-center-card-${center.id}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {center.authorityType} • Möhür: {center.workshopStampCode}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1.5">{center.nameAz}</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCenterName(center.nameAz);
                          setActiveTab('certificate');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-bold shrink-0 cursor-pointer"
                      >
                        Mərkəzi Seç
                      </button>
                    </div>
                    <p className="text-xs text-slate-400">{center.addressAz}</p>
                    <div className="text-[11px] text-slate-300 space-y-1">
                      {center.servicesAz.map((srv, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{srv}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: OFFICIAL AYNA-TAXO-2026 ELECTRONIC CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" data-testid="panel-tachograph-certificate">
              <div className="lg:col-span-5 space-y-4 bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-purple-400" />
                  Yeni Rəqəmsal Taxoqraf & AETR Uyğunluq Sertifikatı Yarat
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Dövlət Qeydiyyat Nişanı (DQN):</label>
                    <input
                      type="text"
                      value={vehiclePlateInput}
                      onChange={(e) => setVehiclePlateInput(e.target.value)}
                      data-testid="cert-plate-input"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Sürücü Rəqəmsal Taxoqraf Kartı №:</label>
                    <input
                      type="text"
                      value={driverCardInput}
                      onChange={(e) => setDriverCardInput(e.target.value)}
                      data-testid="cert-driver-card-input"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Şassi / VIN Nömrəsi:</label>
                    <input
                      type="text"
                      value={vinInput}
                      onChange={(e) => setVinInput(e.target.value)}
                      data-testid="cert-vin-input"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateCertificate}
                    data-testid="generate-tachograph-cert-btn"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-bold shadow-lg cursor-pointer"
                  >
                    AYNA-TAXO-2026 Sertifikatı Форmalaşdır
                  </button>
                </div>

                {/* Unified Registry Lookup */}
                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">
                    Vahid Reyestr Axtarışı (Sertifikat №, DQN və ya Sürücü Kartı):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Məs: AYNA-TAXO-2026-84920 və ya AZ-DRV-2026-194027"
                      value={lookupQuery}
                      onChange={(e) => setLookupQuery(e.target.value)}
                      data-testid="tachograph-lookup-input"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={handleLookup}
                      data-testid="tachograph-lookup-btn"
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5" /> Yoxla
                    </button>
                  </div>
                  {lookupError && (
                    <p className="text-xs text-rose-400" data-testid="tachograph-lookup-error">
                      {lookupError}
                    </p>
                  )}
                </div>
              </div>

              {/* Certificate Display Card */}
              <div className="lg:col-span-7">
                <div
                  className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 border border-indigo-500/40 space-y-4"
                  data-testid="tachograph-certificate-card"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 block">
                        AZƏRBAYCAN YERÜSTÜ NƏQLİYYAT AGENTLİYİ (AYNA) & AZS METROLOGİYA
                      </span>
                      <h4 className="text-lg font-black text-white mt-0.5">
                        RƏQƏMSAL TAXOQRAF KALİBRASİYA VƏ AETR UYĞUNLUQ SERTİFİKATI
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyCert}
                      data-testid="copy-tachograph-cert-btn"
                      className="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedCert ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span data-testid="active-tachograph-cert-number">
                        {activeCertificate.certificateNumber}
                      </span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 block">Dövlət Nömrə Nişanı:</span>
                      <span className="font-black text-white text-sm">
                        {activeCertificate.vehiclePlate}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 block">Sürücü Taxoqraf Kartı:</span>
                      <span className="font-bold text-cyan-300">
                        {activeCertificate.driverCardNumber}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 block">«E-Uğur» Yol Vərəqəsi:</span>
                      <span className="font-bold text-emerald-300">
                        {activeCertificate.electronicWaybillNumber}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nəqliyyat Vasitəsi:</span>
                      <span className="text-white font-semibold">{activeCertificate.vehicleModel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Taxoqraf & Plomb Statusu:</span>
                      <span className="text-indigo-300 font-semibold">
                        {activeCertificate.tachographModelAndPlomb}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Metroloji Kalibrasiya:</span>
                      <span className="text-slate-200">{activeCertificate.calibrationStatusAz}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">İş-İstirahət (AETR) Auditi:</span>
                      <span className="text-emerald-300 font-semibold">
                        {activeCertificate.workRestAuditVerdictAz}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Yoxlayan Mərkəz:</span>
                      <span className="text-slate-300">{activeCertificate.inspectingCenterAz}</span>
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

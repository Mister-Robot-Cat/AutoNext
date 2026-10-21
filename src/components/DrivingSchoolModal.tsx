import React, { useState } from 'react';
import {
  GraduationCap,
  Award,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Printer,
  Search,
  Car,
  Clock,
  Compass,
  FileText,
  ShieldCheck,
  Building,
  UserCheck,
  ChevronRight,
  Video,
  X,
} from 'lucide-react';
import { Vehicle } from '../types/vehicle';
import {
  AutodromeExerciseId,
  evaluateEstakada,
  evaluateParallelParking,
  evaluateBoxReverse,
  evaluateCityDrivingExam,
  auditDualPedalVehicle,
  formatTuitionPrice,
  generateDrivingSchoolCertificate,
  DrivingSchoolCertificate,
} from '../utils/drivingSchoolCompliance';
import {
  MOCK_AUTODROME_EXERCISES,
  MOCK_CITY_EXAM_ERRORS,
  MOCK_DRIVING_SCHOOLS,
  MOCK_TUITION_PACKAGES,
  MOCK_VERIFIED_CERTIFICATES,
} from '../data/mockDrivingSchoolData';

interface DrivingSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: Vehicle | null;
  currency?: 'AZN' | 'USD' | 'EUR';
}

export const DrivingSchoolModal: React.FC<DrivingSchoolModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  currency = 'AZN',
}) => {
  const [activeTab, setActiveTab] = useState<
    'autodrome' | 'city_exam' | 'dual_pedal' | 'schools' | 'certificate'
  >('autodrome');

  // Tab 1: Autodrome State
  const [selectedExercise, setSelectedExercise] = useState<AutodromeExerciseId>('estakada');
  const [rollbackCm, setRollbackCm] = useState<number>(12);
  const [estakadaStalls, setEstakadaStalls] = useState<number>(0);
  const [estakadaTime, setEstakadaTime] = useState<number>(45);

  const [curbDistanceCm, setCurbDistanceCm] = useState<number>(18);
  const [parkingTouchesLine, setParkingTouchesLine] = useState<boolean>(false);
  const [parkingShifts, setParkingShifts] = useState<number>(1);
  const [parkingTime, setParkingTime] = useState<number>(65);

  const [boxTouchesBoundary, setBoxTouchesBoundary] = useState<boolean>(false);
  const [boxReachedEnd, setBoxReachedEnd] = useState<boolean>(true);
  const [boxShifts, setBoxShifts] = useState<number>(1);
  const [boxTime, setBoxTime] = useState<number>(55);

  // Tab 2: City Exam State
  const [committedErrors, setCommittedErrors] = useState<string[]>([]);

  // Tab 3: Dual Pedal Audit State
  const [pedalChecks, setPedalChecks] = useState({
    dualPedalsApproved: true,
    roofSignInstalled: true,
    instructorMirrorsPresent: true,
    dashcamActive: true,
    texpasportSpecialEndorsement: true,
  });

  // Tab 4: Schools & Tuition State
  const [selectedCity, setSelectedCity] = useState<'All' | 'Baku' | 'Sumgayit' | 'Ganja'>('All');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('sch_baku_1');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('pkg_b_standard');
  const [cadetBooking, setCadetBooking] = useState({
    fullName: 'Rəşad Quliyev',
    fin: '7H4P9K2',
    phone: '+994 (50) 812-44-33',
    booked: false,
  });

  // Tab 5: Certificate State
  const [activeCert, setActiveCert] = useState<DrivingSchoolCertificate>(
    MOCK_VERIFIED_CERTIFICATES[0]
  );
  const [registrySearch, setRegistrySearch] = useState<string>('');
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  // Autodrome exercise evaluation
  const estakadaResult = evaluateEstakada(rollbackCm, estakadaStalls, estakadaTime);
  const parkingResult = evaluateParallelParking(
    curbDistanceCm,
    parkingTouchesLine,
    parkingShifts,
    parkingTime
  );
  const boxResult = evaluateBoxReverse(boxTouchesBoundary, boxReachedEnd, boxShifts, boxTime);

  // City Exam evaluation
  const cityResult = evaluateCityDrivingExam(committedErrors, MOCK_CITY_EXAM_ERRORS);

  // Dual Pedal Audit
  const vehicleAudit = auditDualPedalVehicle(pedalChecks);

  // Filtered Schools
  const filteredSchools = MOCK_DRIVING_SCHOOLS.filter(
    (s) => selectedCity === 'All' || s.city === selectedCity
  );

  const activePackage =
    MOCK_TUITION_PACKAGES.find((p) => p.id === selectedPackageId) || MOCK_TUITION_PACKAGES[0];

  const handleToggleError = (id: string) => {
    setCommittedErrors((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSearchRegistry = () => {
    if (!registrySearch.trim()) return;
    const found = MOCK_VERIFIED_CERTIFICATES.find(
      (c) =>
        c.certificateNumber.toLowerCase() === registrySearch.trim().toLowerCase() ||
        c.studentFin.toLowerCase() === registrySearch.trim().toLowerCase()
    );
    if (found) {
      setActiveCert(found);
      setSearchFeedback('Sertifikat uğurla tapıldı və bazada təsdiqləndi.');
    } else {
      setSearchFeedback('Qeyd edilən nömrə və ya FİN üzrə şəhadətnamə tapılmadı.');
    }
  };

  const handleGenerateCertificate = () => {
    const activeSchool =
      MOCK_DRIVING_SCHOOLS.find((s) => s.id === selectedSchoolId) || MOCK_DRIVING_SCHOOLS[0];
    const newCert = generateDrivingSchoolCertificate({
      studentFullName: cadetBooking.fullName || 'Kamran Vəliyev',
      studentFin: cadetBooking.fin || '9T3M1X8',
      schoolId: activeSchool.id,
      schoolName: activeSchool.name,
      category: activePackage.category,
      theoryHours: activePackage.theoryHours,
      practicalHours: activePackage.practicalHours,
      instructorName: 'Əli Məmmədov (Lisenziya № INS-5120)',
      vehiclePlate: vehicle?.plateNumber || '99-YP-104',
      cityScore: cityResult.finalScore,
    });
    setActiveCert(newCert);
    setActiveTab('certificate');
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(activeCert.certificateNumber);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-6 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  BDYP & Elm Nazirliyi Sürücülük Məktəbləri Portalı
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Forma BDYP-AVM-2026
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Praktiki Avtodrom Simulyatoru (Estakada, Boks, Parklanma) & 100-Bal Şəhər İmtahanı Telemetriyası
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {vehicle && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300">
                <Car className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-semibold">{vehicle.year} {vehicle.make} {vehicle.model}</span>
                <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[11px]">
                  {vehicle.plateNumber || '99-XX-000'}
                </span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer border border-slate-700/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-2 bg-slate-950 border-b border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('autodrome')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'autodrome'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Compass className="w-4 h-4" />
            Praktiki Avtodrom
          </button>
          <button
            onClick={() => setActiveTab('city_exam')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'city_exam'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            BDYP Şəhər İmtahanı ({cityResult.finalScore} Bal)
          </button>
          <button
            onClick={() => setActiveTab('dual_pedal')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'dual_pedal'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Video className="w-4 h-4" />
            Tədris Avtomobili & "U"
          </button>
          <button
            onClick={() => setActiveTab('schools')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'schools'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Building className="w-4 h-4" />
            Avtoməktəblər & Tariflər
          </button>
          <button
            onClick={() => setActiveTab('certificate')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'certificate'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            Rəsmi Şəhadətnamə
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: AUTODROME SIMULATOR */}
          {activeTab === 'autodrome' && (
            <div className="space-y-6">
              {/* Exercise Selection Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {MOCK_AUTODROME_EXERCISES.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => setSelectedExercise(ex.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selectedExercise === ex.id
                        ? 'bg-blue-600/10 border-blue-500/50 text-white ring-1 ring-blue-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold block mb-1 text-blue-400">
                      Mərhələ #{ex.id === 'estakada' ? 1 : ex.id === 'parallel_parking' ? 2 : ex.id === 'box_reverse' ? 3 : ex.id === 'slalom' ? 4 : 5}
                    </span>
                    <span className="text-xs font-semibold line-clamp-2 text-slate-200">
                      {ex.nameAz}
                    </span>
                  </button>
                ))}
              </div>

              {/* Active Exercise Detail Card */}
              {selectedExercise === 'estakada' && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Compass className="w-5 h-5 text-blue-400" />
                        Estakada: 16% Yoxuşda Durma və Qalxma
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Normativ tələb: Geriyə sürüşmə məsafəsi ≤ 20 sm, vaxt limiti 120 saniyə.
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                        estakadaResult.passed
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}
                    >
                      {estakadaResult.passed ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> MƏQBULDUR
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" /> QEYRİ-MƏQBUL
                        </>
                      )}
                    </div>
                  </div>

                  {/* Sliders & Telemetry */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Geriyə sürüşmə məsafəsi:</span>
                        <span
                          className={`font-mono font-bold ${
                            rollbackCm > 20 ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {rollbackCm} sm {rollbackCm <= 20 ? '(≤20 sm ✓)' : '(Limiti aşdı ✗)'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        value={rollbackCm}
                        onChange={(e) => setRollbackCm(Number(e.target.value))}
                        className="w-full accent-blue-500"
                      />
                      <p className="text-[11px] text-slate-500">
                        BDYP sensorlu xətti: 20 sm-dən artıq geriyə hərəkət qeydə alınarsa imtahan dayandırılır.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Mühərrikin sönmə sayı:</span>
                        <span
                          className={`font-mono font-bold ${
                            estakadaStalls > 1 ? 'text-rose-400' : 'text-slate-200'
                          }`}
                        >
                          {estakadaStalls} dəfə (Maks. 1)
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {[0, 1, 2].map((s) => (
                          <button
                            key={s}
                            onClick={() => setEstakadaStalls(s)}
                            className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                              estakadaStalls === s
                                ? 'bg-blue-600 border-blue-500 text-white'
                                : 'bg-slate-900 border-slate-700 text-slate-400'
                            }`}
                          >
                            {s} {s === 0 ? 'Sönmədi' : `${s} dəfə`}
                          </button>
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-500">2-ci dəfə sönmə halında imtahan nəticəsi sıfırlanır.</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">İcra müddəti:</span>
                        <span className="font-mono font-bold text-slate-200">{estakadaTime} san / 120 san</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="140"
                        value={estakadaTime}
                        onChange={(e) => setEstakadaTime(Number(e.target.value))}
                        className="w-full accent-blue-500"
                      />
                      <p className="text-[11px] text-slate-500">Standart icra vaxtı: 30–60 saniyə arasıdır.</p>
                    </div>
                  </div>

                  {/* Feedback Banner */}
                  <div
                    className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
                      estakadaResult.passed
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {estakadaResult.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                    <span>{estakadaResult.feedbackAz}</span>
                  </div>
                </div>
              )}

              {selectedExercise === 'parallel_parking' && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Compass className="w-5 h-5 text-blue-400" />
                        Paralel Parklanma (Geriyə hərəkətlə)
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Normativ tələb: Səkidən məsafə 10–30 sm, xətlərə və sensor dirəklərinə toxunmamaq.
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                        parkingResult.passed
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}
                    >
                      {parkingResult.passed ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> MƏQBULDUR
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" /> QEYRİ-MƏQBUL
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Səkidən məsafə:</span>
                        <span
                          className={`font-mono font-bold ${
                            curbDistanceCm < 10 || curbDistanceCm > 30 ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {curbDistanceCm} sm (10–30 sm)
                        </span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="50"
                        value={curbDistanceCm}
                        onChange={(e) => setCurbDistanceCm(Number(e.target.value))}
                        className="w-full accent-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs text-slate-400 block">Sensor / Kənar Xətt Toxunuşu:</span>
                      <button
                        onClick={() => setParkingTouchesLine(!parkingTouchesLine)}
                        className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer flex items-center justify-center gap-2 ${
                          parkingTouchesLine
                            ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                            : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        }`}
                      >
                        {parkingTouchesLine ? (
                          <>
                            <XCircle className="w-4 h-4" /> Xəttə toxunuldu (Kəsilmə)
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" /> Təmiz trayektoriya
                          </>
                        )}
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Manevr üçün pillə dəyişikliyi:</span>
                        <span className="font-mono font-bold text-slate-200">{parkingShifts} dəfə (Maks. 2)</span>
                      </div>
                      <div className="flex gap-2">
                        {[1, 2, 3].map((m) => (
                          <button
                            key={m}
                            onClick={() => setParkingShifts(m)}
                            className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                              parkingShifts === m
                                ? 'bg-blue-600 border-blue-500 text-white'
                                : 'bg-slate-900 border-slate-700 text-slate-400'
                            }`}
                          >
                            {m} {m === 1 ? 'Tək ötürmə' : `${m} manevr`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
                      parkingResult.passed
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {parkingResult.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                    <span>{parkingResult.feedbackAz}</span>
                  </div>
                </div>
              )}

              {selectedExercise === 'box_reverse' && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Compass className="w-5 h-5 text-blue-400" />
                        90° Geriyə Boks / Qaraja Daxil Olma
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Normativ tələb: Avtomobil tam olaraq boks sahəsinə daxil olmalıdır, qapı xətlərinə toxunmaq qadağandır.
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                        boxResult.passed
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}
                    >
                      {boxResult.passed ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> MƏQBULDUR
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" /> QEYRİ-MƏQBUL
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <span className="text-xs text-slate-400 block">Qarajın yan xətlərinə toxunma:</span>
                      <button
                        onClick={() => setBoxTouchesBoundary(!boxTouchesBoundary)}
                        className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer flex items-center justify-center gap-2 ${
                          boxTouchesBoundary
                            ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                            : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        }`}
                      >
                        {boxTouchesBoundary ? 'Sensor xəttinə toxunuldu (Xəta)' : 'Xətlərə toxunulmadı (Təmiz)'}
                      </button>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs text-slate-400 block">Qaraj daxilində tam duruş (Stop xətti):</span>
                      <button
                        onClick={() => setBoxReachedEnd(!boxReachedEnd)}
                        className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer flex items-center justify-center gap-2 ${
                          boxReachedEnd
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                            : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                        }`}
                      >
                        {boxReachedEnd ? 'Avtomobil tam boksa yerləşdi' : 'Avtomobil qismən çöldə qaldı (Kəsilmə)'}
                      </button>
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
                      boxResult.passed
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {boxResult.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                    <span>{boxResult.feedbackAz}</span>
                  </div>
                </div>
              )}

              {selectedExercise === 'slalom' && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-blue-400" />
                    Ziqzaq / İlanvari Məhdud Döngələr
                  </h3>
                  <p className="text-xs text-slate-400">
                    Konusların arası ilə axıcı və fasiləsiz manevr icra olunur. Konusların heç birinə toxunmamaq və əks istiqamətə çıxmamaq şərtdir.
                  </p>
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Avtomatlaşdırılmış elektron sensor sistemi: Konus toxunuşu: 0 ədəd. MƏQBULDUR.
                  </div>
                </div>
              )}

              {selectedExercise === 'three_point_turn' && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-blue-400" />
                    Məhdud Məkanda Geriyə Dönmə (T-Turn)
                  </h3>
                  <p className="text-xs text-slate-400">
                    6 metr enində zolaqda tək geri ötürmə manevrindən istifadə edərək avtomobili 180 dərəcə əks istiqamətə çevirmək tələb olunur.
                  </p>
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Avtomatlaşdırılmış elektron sensor sistemi: Tək ötürmə ilə dönmə icra edildi. MƏQBULDUR.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CITY EXAM & TELEMETRY */}
          {activeTab === 'city_exam' && (
            <div className="space-y-6">
              {/* Score Header */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-18 h-18 rounded-2xl flex flex-col items-center justify-center font-bold font-mono border ${
                      cityResult.passed
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}
                  >
                    <span className="text-2xl">{cityResult.finalScore}</span>
                    <span className="text-[10px] uppercase font-sans">/ 100 Bal</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      BDYP Şəhər İmtahanı Qiymətləndirməsi
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Keçid balı: minimum 80 bal və 0 kobud (5 ballıq) xəta.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-slate-400">Silinən cərimə balı:</span>
                      <span className="text-xs font-mono font-bold text-rose-400">
                        -{cityResult.deductedPoints} bal
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`px-4 py-2 rounded-xl border text-sm font-bold inline-flex items-center gap-2 ${
                      cityResult.passed
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    {cityResult.passed ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> İMTAHAN MƏQBULDUR
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" /> İMTAHAN QEYRİ-MƏQBULDUR
                      </>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">{cityResult.summaryAz}</p>
                </div>
              </div>

              {/* Error Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    BDYP Şəhər İmtahanı Xətalar Siyahısı (Simulyasiya)
                  </h4>
                  <button
                    onClick={() => setCommittedErrors([])}
                    className="text-xs text-blue-400 hover:text-blue-300 underline cursor-pointer"
                  >
                    Bütün xətaları sıfırla
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {MOCK_CITY_EXAM_ERRORS.map((err) => {
                    const isChecked = committedErrors.includes(err.id);
                    return (
                      <div
                        key={err.id}
                        onClick={() => handleToggleError(err.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                          isChecked
                            ? err.severity === 'critical'
                              ? 'bg-rose-950/30 border-rose-500/50 text-rose-200'
                              : 'bg-amber-950/30 border-amber-500/50 text-amber-200'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-1 accent-blue-500 cursor-pointer"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-xs font-bold text-slate-400">
                              [{err.code}]
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                err.severity === 'critical'
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : err.severity === 'medium'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              }`}
                            >
                              -{err.penaltyPoints} Bal ({err.severity === 'critical' ? 'Kobud' : err.severity === 'medium' ? 'Orta' : 'Kiçik'})
                            </span>
                          </div>
                          <p className="text-xs font-medium text-slate-200 mt-1">{err.nameAz}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{err.legalBasis}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DUAL-PEDAL & "U" VEHICLE AUDIT */}
          {activeTab === 'dual_pedal' && (
            <div className="space-y-6">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Video className="w-5 h-5 text-blue-400" />
                      "Tədris Avtomobili" & İkili Pedal Uyğunluq Standartı
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Yol Hərəkəti Haqqında Qanun Əlavə 2 & İXM Maddə 342.2-1 tələbləri.
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                      vehicleAudit.isCompliant
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {vehicleAudit.isCompliant ? (
                      <>
                        <ShieldCheck className="w-4 h-4" /> STANDARTA UYĞUNDUR
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4" /> CƏRİMƏ RİSKİ: {vehicleAudit.fineRiskAzn} ₼
                      </>
                    )}
                  </div>
                </div>

                {/* Audit Checklist Items */}
                <div className="space-y-3">
                  {[
                    {
                      key: 'dualPedalsApproved' as const,
                      label: 'İkili əlavə əyləc və mufta pedalları quraşdırılması və sertifikatı',
                      desc: 'Təlimatçı tərəfindən idarə olunan təkrar pedal qurğusu (AZS sertifikatlı)',
                    },
                    {
                      key: 'texpasportSpecialEndorsement' as const,
                      label: 'Texpasportda "Xüsusi qeydlər" bölməsində tədris avtomobili qeydiyyatı',
                      desc: 'BDYP tərəfindən verilmiş rəsmi qeydiyyat şəhadətnaməsi möhürü',
                    },
                    {
                      key: 'roofSignInstalled' as const,
                      label: 'Damda işıqlandırılan üçbucaqlı "U" tədris fənəri (YHQ Əlavə 2)',
                      desc: 'Qaranlıq vaxtı daxildən ağ işıqla işıqlandırılan tədris nişanı',
                    },
                    {
                      key: 'instructorMirrorsPresent' as const,
                      label: 'Təlimatçı üçün əlavə daxili və xarici arxanıgöstərən güzgülər',
                      desc: 'Sağ yan və salon arxa görüntü əlavə sferik güzgüləri',
                    },
                    {
                      key: 'dashcamActive' as const,
                      label: 'İmtahan audio-video qeydiyyat sistemi (pedal və yol baxış kamerası)',
                      desc: 'BDYP imtahan komissiyasının videoarxiv sisteminə canlı inteqrasiya',
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      onClick={() =>
                        setPedalChecks((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                      }
                      className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-start gap-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={pedalChecks[item.key]}
                        onChange={() => {}}
                        className="mt-1 accent-blue-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <span className="text-xs font-bold text-slate-200 block">{item.label}</span>
                        <span className="text-[11px] text-slate-400">{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {!vehicleAudit.isCompliant && (
                  <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs space-y-1.5">
                    <div className="font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      Qeydə alınmış normativ çatışmazlıqlar:
                    </div>
                    {vehicleAudit.violationsAz.map((v, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        {v}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ACCREDITED SCHOOLS & TUITION */}
          {activeTab === 'schools' && (
            <div className="space-y-6">
              {/* City Filter & Packages */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">Şəhər:</span>
                  {(['All', 'Baku', 'Sumgayit', 'Ganja'] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCity(c)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                        selectedCity === c
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {c === 'All' ? 'Hamısı' : c === 'Baku' ? 'Bakı' : c === 'Sumgayit' ? 'Sumqayıt' : 'Gəncə'}
                    </button>
                  ))}
                </div>

                <div className="text-xs text-slate-400">
                  Valyuta: <span className="font-bold text-white">{currency}</span>
                </div>
              </div>

              {/* Tuition Packages Carousel / Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {MOCK_TUITION_PACKAGES.map((pkg) => (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackageId(pkg.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      selectedPackageId === pkg.id
                        ? 'bg-blue-600/10 border-blue-500 text-white ring-1 ring-blue-500/40'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold text-[11px]">
                          Kat. {pkg.category}
                        </span>
                        <span className="text-base font-extrabold font-mono text-emerald-400">
                          {formatTuitionPrice(pkg.tuitionAzn, currency)}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white">{pkg.nameAz}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{pkg.descriptionAz}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Nəzəriyyə:</span>
                        <span className="font-semibold text-slate-200">{pkg.theoryHours} saat</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Praktika:</span>
                        <span className="font-semibold text-slate-200">{pkg.practicalHours} saat</span>
                      </div>
                      <div className="flex justify-between">
                        <span>BDYP Dövlət rüsumu:</span>
                        <span className="font-semibold text-slate-200">{formatTuitionPrice(pkg.stateDutyAzn, currency)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Schools List */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-400" />
                  Akkreditasiya Olunmuş Rəsmi Sürücülük Məktəbləri
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredSchools.map((sch) => (
                    <div
                      key={sch.id}
                      onClick={() => setSelectedSchoolId(sch.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        selectedSchoolId === sch.id
                          ? 'bg-blue-950/20 border-blue-500/50 ring-1 ring-blue-500/30'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h5 className="text-xs font-bold text-white">{sch.name}</h5>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px]">
                            {sch.passRatePercent}% Keçid
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{sch.address}</p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">{sch.phone} | {sch.licenseNo}</p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">
                          Donanma: <strong className="text-slate-200">{sch.fleetSize} tədris avtomobili</strong>
                        </span>
                        <span className="text-blue-400 font-semibold flex items-center gap-1">
                          Seçildi <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Booking & Certificate Generation Callout */}
              <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    Kursu Bitirmə və BDYP-AVM Şəhadətnaməsi Almaq
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Nəzəri və praktiki imtahan balları əsasında dərhal elektron QR şəhadətnamə tərtib edilir.
                  </p>
                </div>
                <button
                  onClick={handleGenerateCertificate}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-blue-600/30 cursor-pointer whitespace-nowrap"
                >
                  Şəhadətnaməni Generasiya Et
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: OFFICIAL GRADUATION CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-6">
              {/* Registry Verification Search Bar */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Şəhadətnamə № (məs: BDYP-AVM-2026-08142) və ya FİN kod..."
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <button
                  onClick={handleSearchRegistry}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer border border-slate-700"
                >
                  Reyestrdə Yoxla
                </button>
              </div>

              {searchFeedback && (
                <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/30 text-blue-300 text-xs">
                  {searchFeedback}
                </div>
              )}

              {/* Official Certificate Layout */}
              <div className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                {/* Certificate Watermark / Header */}
                <div className="text-center space-y-1 pb-4 border-b border-amber-500/20">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    Azərbaycan Respublikası Daxili İşlər Nazirliyi BDYP & Elm və Təhsil Nazirliyi
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight uppercase mt-2">
                    Sürücülük Məktəbi Bitirmə Şəhadətnaməsi
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Rəsmi Qeydiyyat Seriyası: <strong className="text-amber-400">{activeCert.certificateNumber}</strong>
                  </p>
                </div>

                {/* Cadet & School Dossier */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Müdavim (Tələbə):</span>
                      <strong className="text-white">{activeCert.studentFullName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">FİN Kodu:</span>
                      <span className="font-mono text-cyan-400 font-bold">{activeCert.studentFin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nəqliyyat Kateqoriyası:</span>
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">
                        Kateqoriya {activeCert.category}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">İmtahan Tarixi:</span>
                      <span className="font-mono text-slate-300">{activeCert.examDate}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tədris Müəssisəsi:</span>
                      <strong className="text-white text-right">{activeCert.schoolName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Məsul Təlimatçı:</span>
                      <span className="text-slate-300">{activeCert.instructorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tədris Avtomobili DQN:</span>
                      <span className="font-mono text-amber-400 font-bold">{activeCert.vehiclePlate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Şəhər İmtahan Balı:</span>
                      <span className="font-mono text-emerald-400 font-bold">{activeCert.cityScore} / 100 Bal (Məqbul)</span>
                    </div>
                  </div>
                </div>

                {/* Hours breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Nəzəri Saatlar</span>
                    <span className="text-base font-extrabold text-white font-mono">{activeCert.theoryHours} saat</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Praktiki Sürmə</span>
                    <span className="text-base font-extrabold text-white font-mono">{activeCert.practicalHours} saat</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Avtodrom Sınağı</span>
                    <span className="text-base font-extrabold text-emerald-400 font-mono">Keçdi ✓</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Reyestr Statusu</span>
                    <span className="text-base font-extrabold text-emerald-400 font-mono">Aktiv / Təsdiqli</span>
                  </div>
                </div>

                {/* Security QR & Actions */}
                <div className="pt-4 border-t border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-white p-1 rounded-xl flex items-center justify-center shrink-0 shadow-md">
                      <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center p-1">
                        <span className="text-[8px] font-mono text-cyan-300 text-center leading-tight">
                          BDYP QR
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] font-mono text-slate-400 block">
                        Təhlükəsizlik Hash: <strong className="text-slate-200">{activeCert.qrSecurityHash}</strong>
                      </span>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" /> BDYP və Elm Nazirliyi Vahid Elektron Bazasına inteqrasiya edilib
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleCopyCode}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-700 flex items-center justify-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedCode ? 'Kopyalandı!' : 'Kodu Kopyala'}
                    </button>
                    <button
                      onClick={handlePrint}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Çap Et
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

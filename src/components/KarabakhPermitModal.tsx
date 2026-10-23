import React, { useState, useId } from 'react';
import {
  Compass,
  ShieldCheck,
  ShieldAlert,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Calendar,
  Printer,
  Copy,
  Check,
  Search,
  ArrowRight,
  User,
  Phone,
  X,
  Plus,
  Trash2,
  Building,
  Info,
  Car,
  CheckSquare,
  Square,
  AlertCircle,
  HelpCircle,
  Share2,
} from 'lucide-react';
import {
  KarabakhDestinationZone,
  PermitDurationTier,
  KarabakhPermitApplication,
  PassengerInfo,
  KarabakhCheckpoint,
  KarabakhElectronicPermit,
  calculateKarabakhEligibility,
  generateKarabakhPermit,
  convertCurrency,
  filterCheckpoints,
  filterPermits,
  DESTINATION_DETAILS,
} from '../utils/karabakhPermit';
import {
  MOCK_KARABAKH_CHECKPOINTS,
  ANAMA_SAFETY_PROTOCOLS,
  MOCK_ACTIVE_KARABAKH_PERMITS,
  SAMPLE_APPLICATION_PRESETS,
} from '../data/mockKarabakhData';

interface KarabakhPermitModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVehicle?: {
    makeModel?: string;
    vin?: string;
    plate?: string;
  };
}

export const KarabakhPermitModal: React.FC<KarabakhPermitModalProps> = ({
  isOpen,
  onClose,
  initialVehicle,
}) => {
  const [activeTab, setActiveTab] = useState<
    'apply' | 'checkpoints' | 'anama' | 'registry' | 'permit_view'
  >('apply');

  // Application State
  const [application, setApplication] = useState<KarabakhPermitApplication>({
    destination: 'shusha',
    durationTier: 'weekend_2d',
    startDate: new Date().toISOString().split('T')[0],
    vehiclePlate: initialVehicle?.plate || '99-XX-700',
    vehicleModel: initialVehicle?.makeModel || 'Toyota Land Cruiser Prado',
    vin: initialVehicle?.vin || 'JTEBU5JR8M5084921',
    tireTreadMm: 5.5,
    hasValidTexpasport: true,
    hasValidInspection: true,
    hasValidInsurance: true,
    driverFin: '5A1B2C3',
    driverFullName: 'Murad Ələkbərov Namiq oğlu',
    driverPhone: '+994 (50) 333-22-11',
    driverLicenseNumber: 'AZ-SV-991201',
    passengers: [
      { id: 'pass-1', fullName: 'Sevinc Ələkbərova', fin: '6B2C3D4', relation: 'family' },
      { id: 'pass-2', fullName: 'Nihad Ələkbərov', fin: '7C3D4E5', relation: 'family' },
    ],
    hotelName: 'Şuşa Hotel',
    hotelBookingRef: 'HTL-SH-2026-12',
    anamaAgreementsSigned: true,
    selectedCheckpointId: 'nbm-fuzuli-zafar',
  });

  const [selectedCurrency, setSelectedCurrency] = useState<'AZN' | 'USD' | 'EUR'>('AZN');

  // New passenger temporary state
  const [newPassName, setNewPassName] = useState('');
  const [newPassFin, setNewPassFin] = useState('');
  const [newPassRelation, setNewPassRelation] = useState<'family' | 'guest' | 'colleague'>('family');

  // Checkpoints Tab
  const [checkpointSearch, setCheckpointSearch] = useState('');
  const [checkpointRegionFilter, setCheckpointRegionFilter] = useState('all');
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<KarabakhCheckpoint>(
    MOCK_KARABAKH_CHECKPOINTS[0]
  );

  // Registry Tab
  const [registrySearch, setRegistrySearch] = useState('');
  const [allPermits, setAllPermits] = useState<KarabakhElectronicPermit[]>(
    MOCK_ACTIVE_KARABAKH_PERMITS
  );

  // Permit View State
  const [activePermit, setActivePermit] = useState<KarabakhElectronicPermit>(
    MOCK_ACTIVE_KARABAKH_PERMITS[0]
  );
  const [isCopied, setIsCopied] = useState(false);
  const [isVerificationSimulated, setIsVerificationSimulated] = useState(false);

  const newPassNameId = useId();
  const newPassFinId = useId();

  if (!isOpen) return null;

  const auditResult = calculateKarabakhEligibility(application);
  const filteredCheckpointsList = filterCheckpoints(
    MOCK_KARABAKH_CHECKPOINTS,
    checkpointSearch,
    checkpointRegionFilter
  );
  const filteredPermitsList = filterPermits(allPermits, registrySearch);

  // Add passenger
  const handleAddPassenger = () => {
    if (!newPassName.trim() || newPassFin.trim().length !== 7) return;
    const newPassenger: PassengerInfo = {
      id: `pass-${Date.now()}`,
      fullName: newPassName.trim(),
      fin: newPassFin.toUpperCase().trim(),
      relation: newPassRelation,
    };
    setApplication((prev) => ({
      ...prev,
      passengers: [...prev.passengers, newPassenger],
    }));
    setNewPassName('');
    setNewPassFin('');
  };

  // Remove passenger
  const handleRemovePassenger = (id: string) => {
    setApplication((prev) => ({
      ...prev,
      passengers: prev.passengers.filter((p) => p.id !== id),
    }));
  };

  // Submit and generate official permit
  const handleGeneratePermit = () => {
    const cp =
      MOCK_KARABAKH_CHECKPOINTS.find((c) => c.id === application.selectedCheckpointId) ||
      MOCK_KARABAKH_CHECKPOINTS[0];
    const newPermit = generateKarabakhPermit(application, cp.nameAz);
    setAllPermits((prev) => [newPermit, ...prev]);
    setActivePermit(newPermit);
    setActiveTab('permit_view');
  };

  // Copy permit code
  const handleCopyPermit = () => {
    navigator.clipboard?.writeText(activePermit.permitNumber);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-400/30 text-emerald-400 shadow-inner">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Yolumuz Qarabağa</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
                    e-yol.az
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                <span>Qarabağ və Şərqi Zəngəzur İqtisadi Rayonlarına Fərdi Avtomobillə Səfər İcazəsi Portalı</span>
                <span className="hidden sm:inline-block text-slate-400">•</span>
                <span className="hidden sm:inline-block text-emerald-400 font-medium">RİNN • DİN • ANAMA • BDYP</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency selector */}
            <div className="flex bg-slate-800/80 rounded-lg p-0.5 border border-slate-700 text-xs">
              {(['AZN', 'USD', 'EUR'] as const).map((curr) => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => setSelectedCurrency(curr)}
                  className={`px-2 py-1 rounded font-medium transition-all ${
                    selectedCurrency === curr
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              aria-label="Bağla"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center gap-2 overflow-x-auto py-2">
          <button
            type="button"
            onClick={() => setActiveTab('apply')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'apply'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>E-İcazə Müraciəti</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('checkpoints')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'checkpoints'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>NBM Radarı & Postlar</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {MOCK_KARABAKH_CHECKPOINTS.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('anama')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'anama'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>ANAMA Mina Təhlükəsizliyi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('registry')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'registry'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>İcazələr Reyestri</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {allPermits.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('permit_view')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'permit_view'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Rəsmi Giriş İcazəsi (Vauçer)</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 text-slate-800 dark:text-slate-200 space-y-6">
          {/* TAB 1: APPLY */}
          {activeTab === 'apply' && (
            <div className="space-y-6">
              {/* Presets Row */}
              <div className="bg-slate-100 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                  <Compass className="w-4 h-4 text-emerald-500" />
                  <span>Sürətli Səyahət Şablonları:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_APPLICATION_PRESETS.map((preset) => (
                    <button
                      key={preset.nameAz}
                      type="button"
                      onClick={() => setApplication(preset.application)}
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-medium transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <span>{preset.nameAz.split(' ')[0]}</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        ({preset.badge})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Destination Grid */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>1. Səfər Ediləcək Rayon / Şəhər Seçimi:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold lowercase">
                    {DESTINATION_DETAILS[application.destination].dailyQuota} gündəlik avtomobil kvotası
                  </span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(
                    Object.keys(DESTINATION_DETAILS) as KarabakhDestinationZone[]
                  ).map((zoneKey) => {
                    const zone = DESTINATION_DETAILS[zoneKey];
                    const isSelected = application.destination === zoneKey;
                    return (
                      <button
                        key={zoneKey}
                        type="button"
                        onClick={() =>
                          setApplication((prev) => ({
                            ...prev,
                            destination: zoneKey,
                            selectedCheckpointId: zone.checkpointId,
                          }))
                        }
                        className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500 dark:border-emerald-400 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/20'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500" />
                        )}
                        <div>
                          <div className="font-bold text-sm tracking-tight">{zone.nameAz}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {zone.distanceKm} km • ~{zone.travelHours} saat
                          </div>
                        </div>
                        <div className="mt-2 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 truncate">
                          {zone.corridorAz.split(' ')[0]}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duration & Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    2. İcazə Müddəti (Rejim):
                  </label>
                  <select
                    value={application.durationTier}
                    onChange={(e) =>
                      setApplication((prev) => ({
                        ...prev,
                        durationTier: e.target.value as PermitDurationTier,
                      }))
                    }
                    className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="day_trip_1d">1 Günlük Səfər (06:00 – 21:00 Gündüz)</option>
                    <option value="weekend_2d">2 Günlük Həftəsonu Səfəri (48 Saat)</option>
                    <option value="hotel_stay_3d">3 Günlük Gecələmə (Otel Qeydiyyatlı)</option>
                    <option value="commercial_5d">5 Günlük Xidməti / Təsərrüfat Rejimi</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Səfər Başlama Tarixi:
                  </label>
                  <input
                    type="date"
                    value={application.startDate}
                    onChange={(e) =>
                      setApplication((prev) => ({ ...prev, startDate: e.target.value }))
                    }
                    className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Tövsiyə Olunan NBM Giriş Postu:
                  </label>
                  <select
                    value={application.selectedCheckpointId}
                    onChange={(e) =>
                      setApplication((prev) => ({
                        ...prev,
                        selectedCheckpointId: e.target.value,
                      }))
                    }
                    className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {MOCK_KARABAKH_CHECKPOINTS.map((cp) => (
                      <option key={cp.id} value={cp.id}>
                        {cp.nameAz} ({cp.distanceKmFromBaku} km)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Hotel booking if 3-day stay */}
              {application.durationTier === 'hotel_stay_3d' && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300">
                    <Building className="w-4 h-4" />
                    <span>3 Günlük Səfər Üçün Rəsmi Otel Rezervasiyası Zəruridir:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Otel adı (məs: Şuşa Hotel, Khari Bulbul Hotel, Lachin River Inn)"
                      value={application.hotelName || ''}
                      onChange={(e) =>
                        setApplication((prev) => ({ ...prev, hotelName: e.target.value }))
                      }
                      className="text-xs p-2.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                    <input
                      type="text"
                      placeholder="Rezervasiya nömrəsi (məs: HTL-SH-2026-99)"
                      value={application.hotelBookingRef || ''}
                      onChange={(e) =>
                        setApplication((prev) => ({
                          ...prev,
                          hotelBookingRef: e.target.value,
                        }))
                      }
                      className="text-xs p-2.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
              )}

              {/* Vehicle & Technical Eligibility Check */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Car className="w-4 h-4 text-emerald-500" />
                    <span>3. Nəqliyyat Vasitəsinin Texniki Qanuniliyi:</span>
                  </div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {application.vehiclePlate} • {application.vehicleModel}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setApplication((prev) => ({
                        ...prev,
                        hasValidTexpasport: !prev.hasValidTexpasport,
                      }))
                    }
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-colors ${
                      application.hasValidTexpasport
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                        : 'bg-red-500/10 border-red-500/40 text-red-700 dark:text-red-400'
                    }`}
                  >
                    {application.hasValidTexpasport ? (
                      <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-red-500 shrink-0" />
                    )}
                    <div className="text-xs">
                      <div className="font-semibold">BDYP Texpasport</div>
                      <div className="text-[10px] opacity-80">Qeydiyyat Şəhadətnaməsi</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setApplication((prev) => ({
                        ...prev,
                        hasValidInspection: !prev.hasValidInspection,
                      }))
                    }
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-colors ${
                      application.hasValidInspection
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                        : 'bg-red-500/10 border-red-500/40 text-red-700 dark:text-red-400'
                    }`}
                  >
                    {application.hasValidInspection ? (
                      <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-red-500 shrink-0" />
                    )}
                    <div className="text-xs">
                      <div className="font-semibold">DYP Texniki Baxış</div>
                      <div className="text-[10px] opacity-80">E-Talon Etibarlıdır</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setApplication((prev) => ({
                        ...prev,
                        hasValidInsurance: !prev.hasValidInsurance,
                      }))
                    }
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-colors ${
                      application.hasValidInsurance
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                        : 'bg-red-500/10 border-red-500/40 text-red-700 dark:text-red-400'
                    }`}
                  >
                    {application.hasValidInsurance ? (
                      <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-red-500 shrink-0" />
                    )}
                    <div className="text-xs">
                      <div className="font-semibold">İSB İcbari Sığorta</div>
                      <div className="text-[10px] opacity-80">Avto-Məsuliyyət Polisi</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Driver & Passengers Section */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-500" />
                    <span>4. Sürücü və Sərnişinlərin Qeydiyyatı:</span>
                  </div>
                  <span className="text-slate-600 dark:text-slate-400 font-semibold lowercase">
                    {application.passengers.length + 1} nəfər heyət
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Sürücünün Tam Adı:
                    </label>
                    <input
                      type="text"
                      value={application.driverFullName}
                      onChange={(e) =>
                        setApplication((prev) => ({
                          ...prev,
                          driverFullName: e.target.value,
                        }))
                      }
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Sürücü FİN Kodu:
                    </label>
                    <input
                      type="text"
                      maxLength={7}
                      value={application.driverFin}
                      onChange={(e) =>
                        setApplication((prev) => ({
                          ...prev,
                          driverFin: e.target.value.toUpperCase(),
                        }))
                      }
                      className="w-full text-xs font-mono p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Əlaqə Nömrəsi:
                    </label>
                    <input
                      type="text"
                      value={application.driverPhone}
                      onChange={(e) =>
                        setApplication((prev) => ({
                          ...prev,
                          driverPhone: e.target.value,
                        }))
                      }
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>

                {/* Passengers List */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Birlikdə Səfər Edən Sərnişinlər:
                  </div>

                  {application.passengers.length === 0 ? (
                    <div className="text-xs text-slate-500 italic">Əlavə sərnişin qeyd olunmayıb (tək səyahət).</div>
                  ) : (
                    <div className="space-y-1.5">
                      {application.passengers.map((pass) => (
                        <div
                          key={pass.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {pass.fullName}
                            </span>
                            <span className="font-mono text-slate-500 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-[10px]">
                              FİN: {pass.fin}
                            </span>
                            <span className="text-slate-400 text-[10px] capitalize">
                              ({pass.relation === 'family' ? 'Ailə üzvü' : pass.relation})
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemovePassenger(pass.id)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors"
                            aria-label="Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Passenger Form */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                    <input
                      id={newPassNameId}
                      type="text"
                      placeholder="Sərnişinin adı və soyadı"
                      value={newPassName}
                      onChange={(e) => setNewPassName(e.target.value)}
                      className="w-full sm:flex-1 text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    <input
                      id={newPassFinId}
                      type="text"
                      maxLength={7}
                      placeholder="7-rəqəmli FİN"
                      value={newPassFin}
                      onChange={(e) => setNewPassFin(e.target.value.toUpperCase())}
                      className="w-full sm:w-28 text-xs font-mono p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    <select
                      value={newPassRelation}
                      onChange={(e) =>
                        setNewPassRelation(e.target.value as 'family' | 'guest' | 'colleague')
                      }
                      className="w-full sm:w-28 text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      <option value="family">Ailə üzvü</option>
                      <option value="guest">Qonaq</option>
                      <option value="colleague">Həmkar</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddPassenger}
                      disabled={!newPassName.trim() || newPassFin.trim().length !== 7}
                      className="w-full sm:w-auto px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Əlavə et</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ANAMA Safety Agreement Checkbox */}
              <div
                onClick={() =>
                  setApplication((prev) => ({
                    ...prev,
                    anamaAgreementsSigned: !prev.anamaAgreementsSigned,
                  }))
                }
                className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 cursor-pointer select-none transition-colors hover:bg-amber-500/15"
              >
                <button
                  type="button"
                  aria-label="ANAMA Mina Təhlükəsizliyi Razılığı"
                  className="mt-0.5 shrink-0"
                  tabIndex={-1}
                >
                  {application.anamaAgreementsSigned ? (
                    <CheckSquare className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                <div className="text-xs text-slate-700 dark:text-slate-300">
                  <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    <span>ANAMA Mina Təhlükəsizliyi Qaydalarını Oxudum və Qəbul Edirəm:</span>
                  </div>
                  <p className="mt-1 leading-relaxed text-slate-600 dark:text-slate-400">
                    Səfər boyu yalnız asfalt təsdiqlənmiş marşrutlarda hərəkət edəcəyimə, asfaltdan kənara
                    və yol çiyinlərinə çıxmayacağıma, heç bir şübhəli əşyaya toxunmayacağıma və bütün
                    sərnişinlərin təhlükəsizliyinə tam hüquqi məsuliyyət daşıdığıma imza atıram.
                  </p>
                </div>
              </div>

              {/* Eligibility Bar & Warnings */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-2">
                    <span>Müraciətin Uyğunluq İndeksi:</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-white text-[11px] ${
                        auditResult.isEligible ? 'bg-emerald-600' : 'bg-red-500'
                      }`}
                    >
                      {auditResult.score}/100 Bal
                    </span>
                  </span>
                  <span className="text-slate-500">
                    Dövlət Rüsumu: <strong className="text-emerald-600 font-bold">0 {selectedCurrency} (Ödənişsiz)</strong>
                  </span>
                </div>

                {auditResult.missingRequirements.length > 0 && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-700 dark:text-red-300 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" />
                      <span>Çatışmayan Zəruri Tələblər:</span>
                    </div>
                    <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                      {auditResult.missingRequirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {auditResult.warnings.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Məlumat və Tövsiyələr:</span>
                    </div>
                    <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                      {auditResult.warnings.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Submit Action */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Təsdiq edildikdən sonra DİN və BDYP NBM sistemlərinə avtomatik göndəriləcək.
                  </div>

                  <button
                    type="button"
                    onClick={handleGeneratePermit}
                    disabled={!auditResult.isEligible}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Rəsmi E-İcazəni Təsdiqlə & Al</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHECKPOINTS */}
          {activeTab === 'checkpoints' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Post və ya dəhliz adı ilə axtarış..."
                    value={checkpointSearch}
                    onChange={(e) => setCheckpointSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                  {['all', 'Füzuli & Şuşa', 'Ağdam', 'Laçın & Qubadlı', 'Kəlbəcər & Göygöl'].map(
                    (reg) => (
                      <button
                        key={reg}
                        type="button"
                        onClick={() => setCheckpointRegionFilter(reg)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium whitespace-nowrap transition-colors ${
                          checkpointRegionFilter === reg
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {reg === 'all' ? 'Bütün Rayonlar' : reg}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Checkpoints Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCheckpointsList.map((cp) => (
                  <div
                    key={cp.id}
                    onClick={() => setSelectedCheckpoint(cp)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                      selectedCheckpoint.id === cp.id
                        ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{cp.nameAz}</span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {cp.regionAz} • {cp.distanceKmFromBaku} km Bakıdan
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          cp.liveStatus === 'normal'
                            ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                            : cp.liveStatus === 'moderate'
                            ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                            : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                        }`}
                      >
                        {cp.liveStatus === 'normal'
                          ? 'Sərbəst Keçid'
                          : cp.liveStatus === 'moderate'
                          ? 'Mülayim Sıxlıq'
                          : 'Sıx Növbə'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                      <div className="text-slate-600 dark:text-slate-400 flex items-center justify-between">
                        <span>Marşrut Dəhlizi:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200 text-right">
                          {cp.corridorAz}
                        </span>
                      </div>
                      <div className="text-slate-600 dark:text-slate-400 flex items-center justify-between">
                        <span>Nəzarətçi Bölmə:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {cp.policeUnit}
                        </span>
                      </div>
                      <div className="text-slate-600 dark:text-slate-400 flex items-center justify-between">
                        <span>Yoxlanış Rejimi:</span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          {cp.lanes} Zolaq • ~{cp.avgInspectionSec} san/avto
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ANAMA SAFETY */}
          {activeTab === 'anama' && (
            <div className="space-y-6">
              {/* Emergency Hotline Header Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-red-900 via-rose-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-red-500/30">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-400/30">
                    <ShieldAlert className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm tracking-wide">
                      ANAMA Qaynar Xətti: 805 • DİN Polis: 102 • FHN: 112
                    </h3>
                    <p className="text-xs text-red-200 mt-0.5">
                      Qarabağ və Şərqi Zəngəzurda şübhəli əşya aşkar edildikdə dərhal əlaqə saxlayın!
                    </p>
                  </div>
                </div>
                <div className="text-xs font-mono bg-red-950/60 px-3 py-1.5 rounded-lg border border-red-500/40 text-red-300">
                  SOS Təcili Xidmət 24/7
                </div>
              </div>

              {/* Protocol Cards */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Məcburi ANAMA Mina Təhlükəsizliyi Qaydaları:
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ANAMA_SAFETY_PROTOCOLS.map((protocol, idx) => (
                    <div
                      key={protocol.id}
                      className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">
                          {protocol.titleAz}
                        </div>
                      </div>

                      <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 pl-7">
                        {protocol.descriptionAz}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual Warning Legend */}
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Təhlükə Nişanlarının Mənaları:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300">
                    <div className="font-bold">Qırmızı Lövhə ("MİNA!"):</div>
                    <div className="text-[11px] mt-0.5">Ərazi minadan təmizlənməyib, qəti daxil olmayın.</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                    <div className="font-bold">Ağ-Yaşıl Payalar:</div>
                    <div className="text-[11px] mt-0.5">Təmizlənmiş təhlükəsiz koridor sərhədləri.</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300">
                    <div className="font-bold">Qırmızı Lentlər:</div>
                    <div className="text-[11px] mt-0.5">Müvəqqəti təcrid edilmiş şübhəli nöqtələr.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="İcazə nömrəsi, DQN, FİN və ya sürücü adı ilə axtarış..."
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">İcazə Kodu</th>
                      <th className="p-3">DQN & Avtomobil</th>
                      <th className="p-3">Sürücü & FİN</th>
                      <th className="p-3">İstiqamət</th>
                      <th className="p-3">Müddət</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Baxış</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700/60">
                    {filteredPermitsList.map((p) => (
                      <tr
                        key={p.permitNumber}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {p.permitNumber}
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {p.vehiclePlate}
                          </div>
                          <div className="text-[10px] text-slate-500">{p.vehicleModel}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {p.driverFullName}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">FİN: {p.driverFin}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold">{p.destinationNameAz}</div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                            {p.approvedCorridor}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-[11px]">{p.validUntil}</div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status === 'ACTIVE'
                                ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                                : p.status === 'AT_CHECKPOINT'
                                ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                                : p.status === 'COMPLETED'
                                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setActivePermit(p);
                              setActiveTab('permit_view');
                            }}
                            className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-700 hover:bg-emerald-600 hover:text-white transition-colors text-[11px] font-semibold"
                          >
                            Vərəqə
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: PERMIT VIEW */}
          {activeTab === 'permit_view' && (
            <div className="space-y-4">
              {/* Document Container */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/50 shadow-xl space-y-6 relative overflow-hidden">
                {/* Watermark */}
                <div className="absolute right-4 bottom-4 text-[70px] font-black text-slate-100 dark:text-slate-800/30 select-none pointer-events-none">
                  E-YOL.AZ
                </div>

                {/* Document Top Header */}
                <div className="border-b-2 border-emerald-600 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                      AZ
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        Azərbaycan Respublikası
                      </div>
                      <div className="text-sm font-black text-slate-900 dark:text-white">
                        RƏSMİ ELEKTRON SƏYAHƏT VƏ GİRİŞ İCAZƏSİ
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        RİNN • DİN • ANAMA • Dövlət Sərhəd Xidməti • BDYP
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      {activePermit.permitNumber}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Verilmə tarixi: {activePermit.issueDate}
                    </div>
                  </div>
                </div>

                {/* Key Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Təyinat Şəhəri / Ziyarət:</span>
                    <div className="font-bold text-emerald-700 dark:text-emerald-400 text-sm mt-0.5">
                      {activePermit.destinationNameAz}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">{activePermit.approvedCorridor}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Nəqliyyat Vasitəsi (DQN):</span>
                    <div className="font-mono font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                      {activePermit.vehiclePlate}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">{activePermit.vehicleModel}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Etibarlılıq Pəncərəsi:</span>
                    <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {activePermit.validFrom} – {activePermit.validUntil}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold mt-1">STATUS: {activePermit.status}</div>
                  </div>
                </div>

                {/* Driver & Passengers Table */}
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Sürücü və Təsdiqlənmiş Sərnişin Heyəti:
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-700">
                      <div>
                        <strong className="text-slate-900 dark:text-white">{activePermit.driverFullName}</strong>
                        <span className="text-slate-400 text-[10px] ml-2">(Sürücü)</span>
                      </div>
                      <div className="font-mono text-slate-600 dark:text-slate-400">
                        FİN: {activePermit.driverFin} • Tel: {activePermit.driverPhone}
                      </div>
                    </div>

                    {activePermit.passengers.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
                        <div>
                          <span>{p.fullName}</span>
                          <span className="text-slate-400 text-[10px] ml-1.5 capitalize">({p.relation})</span>
                        </div>
                        <div className="font-mono text-slate-500">FİN: {p.fin}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ANAMA Clearance Stamp & Barcode */}
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div className="text-xs">
                      <div className="font-black text-emerald-800 dark:text-emerald-300">
                        ANAMA MİNA TƏHLÜKƏSİZLİYİ PROTOKOLU TƏSDİQLƏNİB
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono mt-0.5">
                        Təhlükəsizlik şifrəsi: {activePermit.qrSecurityHash}
                      </div>
                    </div>
                  </div>

                  <div className="text-center font-mono text-xs tracking-widest bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 shadow-inner">
                    <div className="text-[10px] text-slate-400 mb-0.5">BDYP / NBM BARKOD</div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{activePermit.policeBarcode}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyPermit}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    <span>{isCopied ? 'Kopyalandı!' : 'İcazə Kodunu Kopyala'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Çap Et (Vauçer)</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsVerificationSimulated(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-500/20"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>NBM Skan Yoxlanışı (Simulyasiya)</span>
                </button>
              </div>

              {isVerificationSimulated && (
                <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>
                      NBM ANPR kamerası və DİN planşeti tərəfindən icazə təsdiqləndi: <strong>KEÇİDƏ İCAZƏ VERİLDİ</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsVerificationSimulated(false)}
                    className="text-[11px] underline ml-2 font-semibold"
                  >
                    Bağla
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

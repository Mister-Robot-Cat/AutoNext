import React, { useState, useMemo } from 'react';
import { Vehicle, Currency } from '../types/vehicle';
import { formatPrice } from '../utils/i18n';
import {
  WINDSHIELD_ZONES,
  HORN_SPECS,
  WASHER_FLUID_SPECS,
  VISIBILITY_REPAIR_PACKAGES,
  ACCREDITED_VISIBILITY_CENTERS,
  INITIAL_VISIBILITY_CERTIFICATES,
  WindshieldZoneId,
  WindshieldDamageType,
  WasherFluidGradeId,
  HornTypeId,
  VisibilityHornCertificate,
} from '../data/mockVisibilityHornData';
import {
  evaluateWindshieldAndWipers,
  evaluateAcousticHornAndTachograph,
  calculateWasherFreezeSafety,
  estimateVisibilityRestorationCost,
  generateVisibilityComplianceCertificate,
} from '../utils/visibilityHornCompliance';
import {
  X,
  Eye,
  Volume2,
  Wrench,
  Building2,
  FileCheck,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Snowflake,
  CloudRain,
  Gauge,
  Search,
  Copy,
  Check,
  Calendar,
} from 'lucide-react';

interface VisibilityHornComplianceModalProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  currency: Currency;
  onClose: () => void;
}

type TabId = 'windshield' | 'horn' | 'packages' | 'centers' | 'certificate';

const DAMAGE_TYPE_LABELS: { id: WindshieldDamageType; labelAz: string; descAz: string }[] = [
  { id: 'none', labelAz: 'Zədə Yoxdur (Tam Şəffaf)', descAz: 'Çat və ya daş izi qeydə alınmayıb' },
  {
    id: 'stone_chip_under_15mm',
    labelAz: 'Kiçik Daş İzi (< 15 mm nöqtəvi)',
    descAz: 'UV-polimer injeksiya ilə bərpa oluna bilən səthi iz',
  },
  {
    id: 'bullseye_crack_25mm',
    labelAz: 'Ulduzvari / Hörümçək Çat (> 20–25 mm)',
    descAz: 'Optik şüalanmanı sındıran dərin çat',
  },
  {
    id: 'linear_crack_over_10cm',
    labelAz: 'Xətti Boydan-Boya Çat (> 10 sm)',
    descAz: 'Sürücü zonasında olduqda texniki baxışdan keçmir (Bənd 7.3)',
  },
  {
    id: 'delamination_haze',
    labelAz: 'Triplex Qatının Bulanması / Ağarma (Delaminasiya)',
    descAz: 'Gecə qarşıdan gələn işığı dağıdan təhlükəli optik qüsur',
  },
];

export const VisibilityHornComplianceModal: React.FC<VisibilityHornComplianceModalProps> = ({
  isOpen,
  vehicle,
  currency,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('windshield');

  // Tab 1: Windshield, Wipers & Visibility State
  const [windshieldZone, setWindshieldZone] = useState<WindshieldZoneId>('clean');
  const [damageType, setDamageType] = useState<WindshieldDamageType>('none');
  const [driverWiperWorking, setDriverWiperWorking] = useState<boolean>(true);
  const [passengerWiperWorking, setPassengerWiperWorking] = useState<boolean>(true);
  const [wiperCyclesPerMinute, setWiperCyclesPerMinute] = useState<number>(45);
  const [washerFluidGrade, setWasherFluidGrade] = useState<WasherFluidGradeId>('winter_minus_15');
  const [ambientTempC, setAmbientTempC] = useState<number>(4);
  const [defrosterWorking, setDefrosterWorking] = useState<boolean>(true);
  const [leftMirrorIntact, setLeftMirrorIntact] = useState<boolean>(true);
  const [rightMirrorIntact, setRightMirrorIntact] = useState<boolean>(true);
  const [interiorMirrorIntact, setInteriorMirrorIntact] = useState<boolean>(true);
  const [sunVisorIntact, setSunVisorIntact] = useState<boolean>(true);
  const [rearMudguardsPresent, setRearMudguardsPresent] = useState<boolean>(true);
  const [isRainingOrSnowing, setIsRainingOrSnowing] = useState<boolean>(true);

  // Tab 2: Horn & Tachograph State
  const [hornType, setHornType] = useState<HornTypeId>('oem_dual_tone');
  const [measuredDbA, setMeasuredDbA] = useState<number>(104);
  const [unnecessaryHonkingInCity, setUnnecessaryHonkingInCity] = useState<boolean>(false);
  const [vehicleCategory, setVehicleCategory] = useState<'M1' | 'N1' | 'N2_N3' | 'M2_M3'>('M1');
  const [speedometerWorking, setSpeedometerWorking] = useState<boolean>(true);
  const [tachographInstalledAndSealed, setTachographInstalledAndSealed] = useState<boolean>(true);

  // Tab 3: Repair Packages State
  const [selectedPackages, setSelectedPackages] = useState<string[]>([
    'pkg-bosch-wipers',
    'pkg-hella-horn',
  ]);

  // Tab 4: Accredited Centers State
  const [cityFilter, setCityFilter] = useState<'Hamısı' | 'Bakı' | 'Sumqayıt' | 'Gəncə'>('Hamısı');
  const [selectedCenterId, setSelectedCenterId] = useState<string>(
    ACCREDITED_VISIBILITY_CENTERS[0].id
  );
  const [bookingCode, setBookingCode] = useState<string | null>(null);

  // Tab 5: Certificate & Registry State
  const [plateInput, setPlateInput] = useState<string>(vehicle?.plateNumber || '99-XX-777');
  const [vinInput, setVinInput] = useState<string>(vehicle?.vin || 'JTMAB3FV80D129841');
  const [registryCertificates, setRegistryCertificates] = useState<VisibilityHornCertificate[]>(
    INITIAL_VISIBILITY_CERTIFICATES
  );
  const [generatedCert, setGeneratedCert] = useState<VisibilityHornCertificate | null>(null);
  const [registryQuery, setRegistryQuery] = useState<string>('');
  const [copiedCert, setCopiedCert] = useState<boolean>(false);

  const windshieldAudit = useMemo(
    () =>
      evaluateWindshieldAndWipers({
        windshieldZone,
        damageType,
        driverWiperWorking,
        passengerWiperWorking,
        wiperCyclesPerMinute,
        washerFluidGrade,
        ambientTempC,
        defrosterWorking,
        leftMirrorIntact,
        rightMirrorIntact,
        interiorMirrorIntact,
        sunVisorIntact,
        rearMudguardsPresent,
        isRainingOrSnowing,
      }),
    [
      windshieldZone,
      damageType,
      driverWiperWorking,
      passengerWiperWorking,
      wiperCyclesPerMinute,
      washerFluidGrade,
      ambientTempC,
      defrosterWorking,
      leftMirrorIntact,
      rightMirrorIntact,
      interiorMirrorIntact,
      sunVisorIntact,
      rearMudguardsPresent,
      isRainingOrSnowing,
    ]
  );

  const freezeAnalysis = useMemo(
    () => calculateWasherFreezeSafety(washerFluidGrade, ambientTempC),
    [washerFluidGrade, ambientTempC]
  );

  const hornAudit = useMemo(
    () =>
      evaluateAcousticHornAndTachograph({
        hornType,
        measuredDbA,
        unnecessaryHonkingInCity,
        vehicleCategory,
        speedometerWorking,
        tachographInstalledAndSealed,
      }),
    [
      hornType,
      measuredDbA,
      unnecessaryHonkingInCity,
      vehicleCategory,
      speedometerWorking,
      tachographInstalledAndSealed,
    ]
  );

  const repairCostSummary = useMemo(
    () => estimateVisibilityRestorationCost(selectedPackages, currency),
    [selectedPackages, currency]
  );

  const filteredCenters = useMemo(() => {
    if (cityFilter === 'Hamısı') return ACCREDITED_VISIBILITY_CENTERS;
    return ACCREDITED_VISIBILITY_CENTERS.filter((c) => c.city === cityFilter);
  }, [cityFilter]);

  const searchedCertificate = useMemo(() => {
    const q = registryQuery.trim().toUpperCase();
    if (!q) return null;
    return (
      registryCertificates.find(
        (c) =>
          c.certificateNumber.toUpperCase().includes(q) ||
          c.plateNumber.toUpperCase().includes(q) ||
          c.vin.toUpperCase().includes(q)
      ) || null
    );
  }, [registryQuery, registryCertificates]);

  if (!isOpen) return null;

  const handleSelectHornType = (typeId: HornTypeId) => {
    setHornType(typeId);
    const spec = HORN_SPECS.find((h) => h.id === typeId);
    if (spec) {
      setMeasuredDbA(spec.defaultDbA);
    }
  };

  const togglePackage = (pkgId: string) => {
    setSelectedPackages((prev) =>
      prev.includes(pkgId) ? prev.filter((id) => id !== pkgId) : [...prev, pkgId]
    );
  };

  const handleBookCenter = (centerId: string) => {
    setSelectedCenterId(centerId);
    const code = `GOR-QEYD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setBookingCode(code);
  };

  const handleGenerateCertificate = () => {
    const center =
      ACCREDITED_VISIBILITY_CENTERS.find((c) => c.id === selectedCenterId) ||
      ACCREDITED_VISIBILITY_CENTERS[0];
    const hornSpec = HORN_SPECS.find((h) => h.id === hornType) || HORN_SPECS[0];

    const cert = generateVisibilityComplianceCertificate({
      plateNumber: plateInput,
      vin: vinInput,
      vehicleTitle: vehicle?.title || 'Toyota Camry 2.5 Hybrid',
      centerNameAz: center.nameAz,
      windshieldResult: windshieldAudit,
      hornResult: hornAudit,
      wiperCyclesPerMin: wiperCyclesPerMinute,
      hornMeasuredDbA: measuredDbA,
      hornTypeAz: hornSpec.nameAz,
    });

    setGeneratedCert(cert);
    setRegistryCertificates((prev) => [
      cert,
      ...prev.filter((item) => item.certificateNumber !== cert.certificateNumber),
    ]);
  };

  const activeCert = generatedCert || registryCertificates[0];

  const handleCopyCertificate = () => {
    if (!activeCert) return;
    const text = `${activeCert.certificateNumber} | ${activeCert.plateNumber} | ${activeCert.overallStatus} | ${activeCert.hornMeasuredDbA} dBA`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    setCopiedCert(true);
    setTimeout(() => setCopiedCert(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      data-testid="visibility-horn-modal"
    >
      <div
        className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-500 text-white shadow-lg shadow-sky-500/25">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  BDYP Görünüş, Alın Şüşəsi, Şüşəsilən & Akustik Siqnal ("FİFA") Portalı
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  YHQ Əlavə 1 Bölmə IV & VII • İXM 342.2-1 / 96.1.4
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Alın şüşəsi Zona-A çat auditoru, şüşəsilən tezlik stendi, qış şüşəyuyan donma testi, UNECE R28 səs siqnalı (93–112 dBA) və Taxoqraf plomb nəzarəti
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            data-testid="close-visibility-horn-modal"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-3 bg-slate-950/50 border-b border-slate-800 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('windshield')}
            data-testid="tab-windshield"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'windshield'
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>1. Alın Şüşəsi, Şüşəsilən & Görünüş (Bölmə IV/VII)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('horn')}
            data-testid="tab-horn"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'horn'
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>2. Səs Siqnalı ("FİFA" / SGU) & Taxoqraf</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('packages')}
            data-testid="tab-packages"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'packages'
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>3. Polimer Şüşə & Servis Kalkulyatoru</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('centers')}
            data-testid="tab-centers"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'centers'
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>4. Akkreditə Olunmuş Mərkəzlər (6)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('certificate')}
            data-testid="tab-certificate"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'certificate'
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>5. Rəsmi BDYP-GOR-2026 Sertifikatı</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: WINDSHIELD, WIPERS & VISIBILITY */}
          {activeTab === 'windshield' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Configurator */}
              <div className="lg:col-span-7 space-y-5">
                {/* Windshield Zone Selector */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Eye className="w-4 h-4 text-sky-400" />
                      <span>Alın Şüşəsi Baxış Zonası & Çat Ekspertizası (YHQ Əlavə 1, Bənd 7.3)</span>
                    </h3>
                    <span className="text-[11px] font-bold text-sky-400">AZS / GOST R 51709</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {WINDSHIELD_ZONES.map((zone) => (
                      <button
                        key={zone.id}
                        type="button"
                        data-testid={`zone-btn-${zone.id}`}
                        onClick={() => {
                          setWindshieldZone(zone.id);
                          if (zone.id === 'clean') {
                            setDamageType('none');
                          } else if (damageType === 'none') {
                            setDamageType('linear_crack_over_10cm');
                          }
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          windshieldZone === zone.id
                            ? 'bg-sky-500/15 border-sky-500 text-white'
                            : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold">{zone.code}</span>
                          {zone.isDriverCritical && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400">
                              KRİTİK ZONA
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2">{zone.nameAz}</p>
                      </button>
                    ))}
                  </div>

                  {/* Damage Type */}
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-400 mb-2">
                      Alın Şüşəsindəki Zədənin Növü və Ölçüsü:
                    </label>
                    <select
                      value={damageType}
                      data-testid="windshield-damage-select"
                      onChange={(e) => setDamageType(e.target.value as WindshieldDamageType)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white"
                    >
                      {DAMAGE_TYPE_LABELS.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.labelAz} — {d.descAz}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Wiper Frequency & Precipitation Stand */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <CloudRain className="w-4 h-4 text-cyan-400" />
                      <span>Şüşəsilən Fırça Tezliyi & Yağış Rejimi (YHQ Əlavə 1, Bölmə IV)</span>
                    </h3>
                    <span className="text-xs font-bold text-cyan-400">
                      {wiperCyclesPerMinute} gediş/dəq (Norma: ≥35)
                    </span>
                  </div>

                  <div>
                    <input
                      type="range"
                      min={10}
                      max={65}
                      value={wiperCyclesPerMinute}
                      data-testid="wiper-speed-slider"
                      onChange={(e) => setWiperCyclesPerMinute(Number(e.target.value))}
                      className="w-full accent-sky-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>10 gediş/dəq (Nasaz rele)</span>
                      <span className="text-emerald-400 font-semibold">35 gediş/dəq (Minimum hədd)</span>
                      <span>65 gediş/dəq (Maksimal rejim)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      data-testid="toggle-driver-wiper"
                      onClick={() => setDriverWiperWorking((v) => !v)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between cursor-pointer ${
                        driverWiperWorking
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                          : 'bg-rose-500/15 border-rose-500/50 text-rose-300'
                      }`}
                    >
                      <span>Sürücü Şüşəsiləni</span>
                      <span>{driverWiperWorking ? 'İşlək' : 'Nasaz!'}</span>
                    </button>

                    <button
                      type="button"
                      data-testid="toggle-passenger-wiper"
                      onClick={() => setPassengerWiperWorking((v) => !v)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between cursor-pointer ${
                        passengerWiperWorking
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                          : 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                      }`}
                    >
                      <span>Sərnişin Şüşəsiləni</span>
                      <span>{passengerWiperWorking ? 'İşlək' : 'Nasaz'}</span>
                    </button>

                    <button
                      type="button"
                      data-testid="toggle-precipitation"
                      onClick={() => setIsRainingOrSnowing((v) => !v)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between cursor-pointer ${
                        isRainingOrSnowing
                          ? 'bg-sky-500/15 border-sky-500/40 text-sky-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span>Hava Şəraiti</span>
                      <span>{isRainingOrSnowing ? 'Yağış / Qar' : 'Quru hava'}</span>
                    </button>
                  </div>
                </div>

                {/* Winter Washer Fluid & Defroster / Mirrors / Mudguards */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Snowflake className="w-4 h-4 text-blue-400" />
                      <span>Şüşəyuyan Donma Testi, Güzgülər & Brizqovik (Bənd 4.2, 7.1, 7.5)</span>
                    </h3>
                    <span className="text-xs font-bold text-blue-400">
                      Mühit: {ambientTempC > 0 ? `+${ambientTempC}°C` : `${ambientTempC}°C`}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                        Şüşəyuyan Maye Növü:
                      </label>
                      <select
                        value={washerFluidGrade}
                        data-testid="washer-fluid-select"
                        onChange={(e) => setWasherFluidGrade(e.target.value as WasherFluidGradeId)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      >
                        {WASHER_FLUID_SPECS.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.nameAz} (Donma: {f.freezingPointC}°C)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                        Xarici Temperatur ({ambientTempC}°C):
                      </label>
                      <div className="flex items-center gap-1.5">
                        {[
                          { label: 'Bakı +8°C', temp: 8 },
                          { label: 'Şamaxı -6°C', temp: -6 },
                          { label: 'Şahdağ -18°C', temp: -18 },
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => setAmbientTempC(preset.temp)}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold border cursor-pointer ${
                              ambientTempC === preset.temp
                                ? 'bg-blue-600 text-white border-blue-500'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      data-testid="toggle-defroster"
                      onClick={() => setDefrosterWorking((v) => !v)}
                      className={`p-2 rounded-xl border text-[11px] font-semibold cursor-pointer ${
                        defrosterWorking
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                      }`}
                    >
                      Peç / Defroster: {defrosterWorking ? 'İşlək' : 'Nasaz'}
                    </button>

                    <button
                      type="button"
                      data-testid="toggle-mirrors"
                      onClick={() => {
                        const next = !leftMirrorIntact;
                        setLeftMirrorIntact(next);
                        setRightMirrorIntact(next);
                        setInteriorMirrorIntact(next);
                      }}
                      className={`p-2 rounded-xl border text-[11px] font-semibold cursor-pointer ${
                        leftMirrorIntact
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                      }`}
                    >
                      Yan Güzgülər: {leftMirrorIntact ? 'Tam' : 'Sınıq'}
                    </button>

                    <button
                      type="button"
                      data-testid="toggle-sun-visor"
                      onClick={() => setSunVisorIntact((v) => !v)}
                      className={`p-2 rounded-xl border text-[11px] font-semibold cursor-pointer ${
                        sunVisorIntact
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      }`}
                    >
                      Günlük (Kozirok): {sunVisorIntact ? 'Var' : 'Yoxdur'}
                    </button>

                    <button
                      type="button"
                      data-testid="toggle-mudguards"
                      onClick={() => setRearMudguardsPresent((v) => !v)}
                      className={`p-2 rounded-xl border text-[11px] font-semibold cursor-pointer ${
                        rearMudguardsPresent
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      }`}
                    >
                      Brizqovik (Bənd 7.5): {rearMudguardsPresent ? 'Var' : 'Yoxdur'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Audit Verdict */}
              <div className="lg:col-span-5 space-y-4">
                <div
                  data-testid="windshield-verdict-card"
                  className={`p-5 rounded-2xl border space-y-4 ${
                    windshieldAudit.prohibitsOperationInPrecipitation
                      ? 'bg-rose-950/30 border-rose-500/50'
                      : windshieldAudit.isCompliant
                      ? 'bg-emerald-950/25 border-emerald-500/40'
                      : 'bg-amber-950/25 border-amber-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {windshieldAudit.isCompliant ? (
                        <ShieldCheck className="w-7 h-7 text-emerald-400 shrink-0" />
                      ) : (
                        <ShieldAlert className="w-7 h-7 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                          BDYP Görünüş & Texniki Baxış Rəyi
                        </span>
                        <h4 className="text-base font-black text-white">
                          {windshieldAudit.prohibitsOperationInPrecipitation
                            ? 'İSTİSMAR QADAĞANDIR (İXM Maddə 96.1.4)'
                            : windshieldAudit.isCompliant
                            ? 'Tam Qanuni — DYP E-Talon Uyğundur'
                            : 'Texniki Nasazlıq (İXM Maddə 342.1.7)'}
                        </h4>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-slate-400 block">İndeks</span>
                      <span className="text-xl font-black text-sky-400">
                        {windshieldAudit.safetyScore}/100
                      </span>
                    </div>
                  </div>

                  {/* Fine Summary */}
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 block">
                        İnzibati Cərimə (İXM 342.1.7)
                      </span>
                      <span
                        className="text-lg font-black text-white"
                        data-testid="windshield-fine-amount"
                      >
                        {windshieldAudit.fineAzn} AZN
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 block">
                        AsanPay 30 Günlük Güzəşt
                      </span>
                      <span className="text-lg font-black text-emerald-400">
                        {windshieldAudit.discountedFineAzn} AZN
                      </span>
                    </div>
                  </div>

                  {/* Washer Freeze Status */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-200">
                      <span>Şüşəyuyan Donma Analizi:</span>
                      <span
                        className={
                          freezeAnalysis.willFreeze ? 'text-rose-400' : 'text-emerald-400'
                        }
                      >
                        {freezeAnalysis.willFreeze ? 'DONMA TƏHLÜKƏSİ' : 'NORMAL'}
                      </span>
                    </div>
                    <p className="text-slate-400">{freezeAnalysis.statusVerdictAz}</p>
                    <p className="text-[11px] text-sky-400">
                      Tövsiyə edilən izopropil spirti: ≥{freezeAnalysis.recommendedIsopropylPercent}%
                    </p>
                  </div>

                  {/* Violations List */}
                  {windshieldAudit.violationsAz.length > 0 ? (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-rose-300 block">
                        Aşkarlanan Qanun Pozuntuları ({windshieldAudit.violationsAz.length}):
                      </span>
                      {windshieldAudit.violationsAz.map((v, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-2"
                        >
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <span>{v}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        Alın şüşəsi, şüşəsilənlər, şüşəyuyan, defroster, güzgülər və arxa brizqoviklər YHQ Əlavə 1 tələblərinə tam cavab verir.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACOUSTIC HORN ("FIFA" / POLYPHONIC / SGU) & TACHOGRAPH */}
          {activeTab === 'horn' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-5">
                {/* Horn Type Selector */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-amber-400" />
                      <span>Səs Siqnalı Növü ("FİFA" / Polifonik / SGU Yoxlayıcısı)</span>
                    </h3>
                    <span className="text-[11px] font-bold text-amber-400">
                      İXM 342.2-1 / 342.9 / 329.3
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {HORN_SPECS.map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        data-testid={`horn-type-${h.id}`}
                        onClick={() => handleSelectHornType(h.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          hornType === h.id
                            ? h.isLegal
                              ? 'bg-emerald-500/15 border-emerald-500 text-white'
                              : 'bg-rose-500/15 border-rose-500 text-white'
                            : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold line-clamp-1">{h.nameAz}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                              h.isLegal
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {h.isLegal ? 'QANUNİ' : `${h.fineAzn} ₼`}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {h.frequencyHz} • Zavod dBA: {h.defaultDbA} dBA
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* UNECE R28 7-Meter Sound Pressure Slider */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-sky-400" />
                      <span>7 Metr Məsafədə Akustik Şumomer Stendi (UNECE R28)</span>
                    </h3>
                    <span
                      className={`text-sm font-black ${
                        hornAudit.dbWithinStatutoryRange ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {measuredDbA} dBA (Norma: 93–112 dBA)
                    </span>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={135}
                    value={measuredDbA}
                    data-testid="horn-dba-slider"
                    onChange={(e) => setMeasuredDbA(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />

                  {/* Speedometer, Tachograph & Residential Honking */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                        Nəqliyyat Vasitəsi Kateqoriyası:
                      </label>
                      <select
                        value={vehicleCategory}
                        data-testid="horn-vehicle-category"
                        onChange={(e) =>
                          setVehicleCategory(
                            e.target.value as 'M1' | 'N1' | 'N2_N3' | 'M2_M3'
                          )
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      >
                        <option value="M1">M1 — Minik avtomobili (Spidometr nəzarəti)</option>
                        <option value="N1">N1 — Yüngül yük ≤3.5t (Spidometr nəzarəti)</option>
                        <option value="N2_N3">N2/N3 — Ağır yük &gt;3.5t (Taxoqraf plombu məcburidir!)</option>
                        <option value="M2_M3">M2/M3 — Sərnişin avtobusu (Taxoqraf plombu məcburidir!)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <button
                        type="button"
                        data-testid="toggle-unnecessary-honking"
                        onClick={() => setUnnecessaryHonkingInCity((v) => !v)}
                        className={`p-2 rounded-xl border text-xs font-semibold cursor-pointer ${
                          unnecessaryHonkingInCity
                            ? 'bg-rose-500/15 border-rose-500/50 text-rose-300'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        Şəhərdə Zərurətsiz Siqnal (İXM 329.3):{' '}
                        {unnecessaryHonkingInCity ? 'Bəli (+30 AZN)' : 'Xeyr'}
                      </button>

                      <button
                        type="button"
                        data-testid="toggle-tachograph-seal"
                        onClick={() => setTachographInstalledAndSealed((v) => !v)}
                        className={`p-2 rounded-xl border text-xs font-semibold cursor-pointer ${
                          tachographInstalledAndSealed
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                            : 'bg-rose-500/15 border-rose-500/50 text-rose-300'
                        }`}
                      >
                        Taxoqraf Plombu (Bənd 7.4):{' '}
                        {tachographInstalledAndSealed ? 'Plomblu' : 'Plomb Qırılıb!'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Horn Audit Result */}
              <div className="lg:col-span-5 space-y-4">
                <div
                  data-testid="horn-verdict-card"
                  className={`p-5 rounded-2xl border space-y-4 ${
                    hornAudit.requiresDeviceConfiscation || hornAudit.prohibitsOperation
                      ? 'bg-rose-950/35 border-rose-500/50'
                      : hornAudit.isCompliant
                      ? 'bg-emerald-950/25 border-emerald-500/40'
                      : 'bg-amber-950/30 border-amber-500/40'
                  }`}
                >
                  <h4 className="text-base font-black text-white">{hornAudit.verdictTitleAz}</h4>

                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 block">
                        Cəmi İnzibati Cərimə
                      </span>
                      <span
                        className="text-xl font-black text-white"
                        data-testid="horn-total-fine"
                      >
                        {hornAudit.totalFineAzn} AZN
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 block">
                        Müsadirə & Qadağa
                      </span>
                      <span className="text-xs font-bold text-rose-400 block mt-1">
                        {hornAudit.requiresDeviceConfiscation
                          ? 'Cihaz Müsadirə Edilir (İXM 342.9)'
                          : hornAudit.prohibitsOperation
                          ? 'İstismar Qadağandır (İXM 342.2-1)'
                          : 'Məhdudiyyət Yoxdur'}
                      </span>
                    </div>
                  </div>

                  {hornAudit.violationsAz.length > 0 && (
                    <div className="space-y-2">
                      {hornAudit.violationsAz.map((v, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-2"
                        >
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <span>{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RESTORATION PACKAGES & COST CALCULATOR */}
          {activeTab === 'packages' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {VISIBILITY_REPAIR_PACKAGES.map((pkg) => {
                  const isSelected = selectedPackages.includes(pkg.id);
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      data-testid={`repair-pkg-${pkg.id}`}
                      onClick={() => togglePackage(pkg.id)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-sky-500/15 border-sky-500 text-white'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-bold text-white">{pkg.nameAz}</span>
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-sky-500/20 text-sky-300 shrink-0">
                            {formatPrice(pkg.partsCostAzn + pkg.laborCostAzn, currency)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mb-2">{pkg.descriptionAz}</p>
                      </div>
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                        <span>{pkg.fixesClauseAz}</span>
                        <span className="text-emerald-400 font-bold">
                          {pkg.warrantyMonths} ay zəmanət
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="lg:col-span-4">
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-black text-white">
                    Servis & Bərpa Xərcləri Xülasəsi
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Ehtiyat hissələri:</span>
                      <span className="text-white font-bold">
                        {formatPrice(repairCostSummary.partsTotalAzn, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Usta & Kalibrləmə:</span>
                      <span className="text-white font-bold">
                        {formatPrice(repairCostSummary.laborTotalAzn, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Təxmini müddət:</span>
                      <span className="text-sky-400 font-bold">
                        {repairCostSummary.estimatedDurationMinutes} dəqiqə
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-black text-white">
                      <span>Yekun Məbləğ:</span>
                      <span
                        className="text-emerald-400"
                        data-testid="packages-total-cost"
                      >
                        {formatPrice(repairCostSummary.totalAzn, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACCREDITED CENTERS */}
          {activeTab === 'centers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  {(['Hamısı', 'Bakı', 'Sumqayıt', 'Gəncə'] as const).map((city) => (
                    <button
                      key={city}
                      type="button"
                      data-testid={`center-city-${city}`}
                      onClick={() => setCityFilter(city)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                        cityFilter === city
                          ? 'bg-sky-600 text-white border-sky-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>

                {bookingCode && (
                  <div
                    data-testid="visibility-booking-confirmation"
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs font-bold text-emerald-300 flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span>Elektron Növbə Təsdiqləndi: {bookingCode}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredCenters.map((center) => (
                  <div
                    key={center.id}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-white">{center.nameAz}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300">
                          {center.accreditationCode}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{center.addressAz}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {center.servicesAz.map((s, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-300"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        Növbə: ~{center.waitMinutes} dəq • {center.phone}
                      </span>
                      <button
                        type="button"
                        data-testid={`book-center-${center.id}`}
                        onClick={() => handleBookCenter(center.id)}
                        className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold cursor-pointer"
                      >
                        Növbə Götür
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: OFFICIAL BDYP-GOR-2026 CERTIFICATE & REGISTRY */}
          {activeTab === 'certificate' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-white">
                    Rəsmi BDYP-GOR-2026 Uyğunluq Sertifikatı Yarat
                  </h3>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Dövlət Qeydiyyat Nişanı:
                    </label>
                    <input
                      type="text"
                      value={plateInput}
                      data-testid="cert-plate-input"
                      onChange={(e) => setPlateInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">VIN / Ban Nömrəsi:</label>
                    <input
                      type="text"
                      value={vinInput}
                      data-testid="cert-vin-input"
                      onChange={(e) => setVinInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono uppercase"
                    />
                  </div>
                  <button
                    type="button"
                    data-testid="generate-visibility-cert-btn"
                    onClick={handleGenerateCertificate}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold cursor-pointer"
                  >
                    BDYP-GOR-2026 Sertifikatı Tərtib Et
                  </button>
                </div>

                {/* Unified Registry Lookup */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-sky-400" />
                    <span>Vahid BDYP-GOR Reyestr Axtarışı</span>
                  </h4>
                  <input
                    type="text"
                    value={registryQuery}
                    data-testid="visibility-registry-search"
                    onChange={(e) => setRegistryQuery(e.target.value)}
                    placeholder="Məs: BDYP-GOR-2026-84920 və ya 99-XX-777"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                  {searchedCertificate && (
                    <div
                      data-testid="registry-search-result"
                      className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs space-y-1"
                    >
                      <div className="font-bold text-emerald-300">
                        Tapıldı: {searchedCertificate.certificateNumber} (
                        {searchedCertificate.plateNumber})
                      </div>
                      <div className="text-slate-300">{searchedCertificate.vehicleTitle}</div>
                      <div className="text-slate-400">
                        {searchedCertificate.windshieldVerdictAz} •{' '}
                        {searchedCertificate.hornMeasuredDbA} dBA
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Certificate Preview */}
              <div className="lg:col-span-7">
                {activeCert && (
                  <div
                    data-testid="visibility-certificate-card"
                    className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-sky-500/40 space-y-4"
                  >
                    <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400 block">
                          AZƏRBAYCAN RESPUBLİKASI DİN BDYPİ & AZS METROLOGİYA
                        </span>
                        <h3 className="text-lg font-black text-white mt-0.5">
                          GÖRÜNÜŞ, ŞÜŞƏSİLƏN VƏ AKUSTİK SİQNAL UYĞUNLUQ SERTİFİKATI
                        </h3>
                        <span className="text-xs font-mono text-slate-400">
                          Sənəd №: {activeCert.certificateNumber}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyCertificate}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedCert ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedCert ? 'Kopyalandı' : 'Kopyala'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-slate-400 block">Dövlət Qeydiyyat Nişanı & VIN:</span>
                        <strong className="text-white font-mono">
                          {activeCert.plateNumber} • {activeCert.vin}
                        </strong>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-slate-400 block">Yekun Ekspertiza Statusu:</span>
                        <strong
                          className={
                            activeCert.overallStatus === 'PASS'
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }
                        >
                          {activeCert.overallStatus}
                        </strong>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-slate-400 block">Alın Şüşəsi & Şüşəsilən:</span>
                        <strong className="text-slate-200">
                          {activeCert.windshieldVerdictAz} ({activeCert.wiperCyclesPerMin} gediş/dəq)
                        </strong>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-slate-400 block">Akustik Siqnal (UNECE R28):</span>
                        <strong className="text-slate-200">
                          {activeCert.hornMeasuredDbA} dBA — {activeCert.hornTypeAz}
                        </strong>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>QR Hash: {activeCert.qrSecurityHash}</span>
                      <span>Etibarlıdır: {activeCert.expiryDate}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

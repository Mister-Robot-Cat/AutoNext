import React, { useState, useMemo } from 'react';
import { Vehicle, Currency } from '../types/vehicle';
import {
  EngineForensicStatusId,
  LicensePlateConditionId,
  RearRecessFormat,
  MountedPlateType,
  ENGINE_FORENSIC_PROFILES,
  LICENSE_PLATE_CONDITIONS,
  FORENSIC_SERVICE_PACKAGES,
  FORENSIC_INSPECTION_CENTERS,
  ForensicPlateCertificate,
} from '../data/mockForensicPlateData';
import {
  evaluateEngineVinForensics,
  evaluateLicensePlateCompliance,
  evaluateSrsAndFluidHermeticity,
  calculateForensicServiceSummary,
  generateForensicPlateCertificate,
  lookupForensicCertificate,
  convertFromAzn,
} from '../utils/forensicPlateCompliance';
import {
  X,
  Fingerprint,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  QrCode,
  Search,
  MapPin,
  Wrench,
  FileCheck,
  Flame,
  ScanLine,
  Radio,
  Cpu,
} from 'lucide-react';

interface ForensicPlateComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: Vehicle | null;
  currency: Currency;
}

type ActiveTab = 'engine_vin' | 'plate_rfid' | 'srs_fluid' | 'centers' | 'certificate';

export const ForensicPlateComplianceModal: React.FC<ForensicPlateComplianceModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  currency,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('engine_vin');

  // Tab 1: Engine & VIN Forensics State
  const [texpasportEngineNumber, setTexpasportEngineNumber] = useState<string>('N20B20A-89412055');
  const [blockEngineNumber, setBlockEngineNumber] = useState<string>('N20B20A-89412055');
  const [forensicStatus, setForensicStatus] = useState<EngineForensicStatusId>('oem_matching');
  const [hasDgkCustomsDeclaration, setHasDgkCustomsDeclaration] = useState<boolean>(false);
  const [hasJusticeForensicCertificate, setHasJusticeForensicCertificate] = useState<boolean>(false);
  const [vinPaintThicknessMicrons, setVinPaintThicknessMicrons] = useState<number>(115);

  // Tab 2: License Plate (DQN) & RFID State
  const [plateCondition, setPlateCondition] = useState<LicensePlateConditionId>('clean_standard');
  const [rearRecessFormat, setRearRecessFormat] = useState<RearRecessFormat>('eu_wide_520x112');
  const [mountedRearPlateType, setMountedRearPlateType] =
    useState<MountedPlateType>('type1_single_line_520');
  const [rearPlateLampWorking, setRearPlateLampWorking] = useState<boolean>(true);
  const [measuredNightVisibilityMeters, setMeasuredNightVisibilityMeters] = useState<number>(25);
  const [measuredDayVisibilityMeters, setMeasuredDayVisibilityMeters] = useState<number>(45);
  const [rfidChipReadable, setRfidChipReadable] = useState<boolean>(true);

  // Tab 3: SRS Airbag & Fluid Hermeticity + Service Packages State
  const [driverAirbagOhm, setDriverAirbagOhm] = useState<number>(2.2);
  const [driverAirbagCapacitanceUf, setDriverAirbagCapacitanceUf] = useState<number>(0.85);
  const [seatbeltPretensionerWorking, setSeatbeltPretensionerWorking] = useState<boolean>(true);
  const [srsCrashDataStoredInEcu, setSrsCrashDataStoredInEcu] = useState<boolean>(false);
  const [fuelSystemLeakDetected, setFuelSystemLeakDetected] = useState<boolean>(false);
  const [oilDripDropsPerMinute, setOilDripDropsPerMinute] = useState<number>(0);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([
    'pkg_texpasport_engine_update',
    'pkg_type2_square_plate',
  ]);

  // Tab 4: Centers Filter State
  const [selectedCity, setSelectedCity] = useState<string>('Hamısı');
  const [selectedCenterName, setSelectedCenterName] = useState<string>(
    FORENSIC_INSPECTION_CENTERS[0].nameAz
  );

  // Tab 5: Certificate Generation & Lookup State
  const [vehiclePlateInput, setVehiclePlateInput] = useState<string>('90-AA-700');
  const [vinInput, setVinInput] = useState<string>(vehicle?.vin || 'WBA5A5C50FD918420');
  const [customCertificates, setCustomCertificates] = useState<ForensicPlateCertificate[]>([]);
  const [activeCertificate, setActiveCertificate] = useState<ForensicPlateCertificate>(() =>
    generateForensicPlateCertificate({
      vehiclePlate: '90-AA-700',
      vin: vehicle?.vin || 'WBA5A5C50FD918420',
      vehicleModel: vehicle ? `${vehicle.make} ${vehicle.model}` : 'BMW 528i (F10)',
      recordedEngineNumber: 'N20B20A-89412055',
      inspectedEngineNumber: 'N20B20A-89412055',
      plateFormat: 'type2_two_line_288',
      plateNightReadabilityMeters: 25,
      inspectingCenterAz: FORENSIC_INSPECTION_CENTERS[0].nameAz,
    })
  );
  const [lookupQuery, setLookupQuery] = useState<string>('');
  const [lookupResult, setLookupResult] = useState<ForensicPlateCertificate | null | undefined>(
    undefined
  );

  const engineVinResult = useMemo(
    () =>
      evaluateEngineVinForensics({
        texpasportEngineNumber,
        blockEngineNumber,
        forensicStatus,
        hasDgkCustomsDeclaration,
        hasJusticeForensicCertificate,
        vinPaintThicknessMicrons,
      }),
    [
      texpasportEngineNumber,
      blockEngineNumber,
      forensicStatus,
      hasDgkCustomsDeclaration,
      hasJusticeForensicCertificate,
      vinPaintThicknessMicrons,
    ]
  );

  const plateAuditResult = useMemo(
    () =>
      evaluateLicensePlateCompliance({
        plateCondition,
        rearRecessFormat,
        mountedRearPlateType,
        rearPlateLampWorking,
        measuredNightVisibilityMeters,
        measuredDayVisibilityMeters,
        rfidChipReadable,
      }),
    [
      plateCondition,
      rearRecessFormat,
      mountedRearPlateType,
      rearPlateLampWorking,
      measuredNightVisibilityMeters,
      measuredDayVisibilityMeters,
      rfidChipReadable,
    ]
  );

  const srsFluidResult = useMemo(
    () =>
      evaluateSrsAndFluidHermeticity({
        driverAirbagOhm,
        driverAirbagCapacitanceUf,
        seatbeltPretensionerWorking,
        srsCrashDataStoredInEcu,
        fuelSystemLeakDetected,
        oilDripDropsPerMinute,
      }),
    [
      driverAirbagOhm,
      driverAirbagCapacitanceUf,
      seatbeltPretensionerWorking,
      srsCrashDataStoredInEcu,
      fuelSystemLeakDetected,
      oilDripDropsPerMinute,
    ]
  );

  const serviceSummary = useMemo(
    () => calculateForensicServiceSummary(selectedPackages, currency),
    [selectedPackages, currency]
  );

  const filteredCenters = useMemo(() => {
    if (selectedCity === 'Hamısı') return FORENSIC_INSPECTION_CENTERS;
    return FORENSIC_INSPECTION_CENTERS.filter((c) => c.city === selectedCity);
  }, [selectedCity]);

  if (!isOpen) return null;

  const currencySymbol = currency === 'AZN' ? '₼' : currency === 'USD' ? '$' : '€';

  const handleTogglePackage = (pkgId: string) => {
    setSelectedPackages((prev) =>
      prev.includes(pkgId) ? prev.filter((id) => id !== pkgId) : [...prev, pkgId]
    );
  };

  const handleGenerateCertificate = () => {
    const newCert = generateForensicPlateCertificate({
      vehiclePlate: vehiclePlateInput,
      vin: vinInput,
      vehicleModel: vehicle ? `${vehicle.make} ${vehicle.model}` : 'BMW 528i (F10)',
      recordedEngineNumber: texpasportEngineNumber,
      inspectedEngineNumber: blockEngineNumber,
      plateFormat: mountedRearPlateType,
      plateNightReadabilityMeters: measuredNightVisibilityMeters,
      inspectingCenterAz: selectedCenterName,
    });
    setCustomCertificates((prev) => [newCert, ...prev]);
    setActiveCertificate(newCert);
  };

  const handleLookup = () => {
    const found = lookupForensicCertificate(lookupQuery, customCertificates);
    setLookupResult(found);
    if (found) {
      setActiveCertificate(found);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      data-testid="forensic-plate-modal"
    >
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/40 flex items-center justify-center shrink-0">
              <Fingerprint className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  BDYP Mühərrik/VIN Kriminalistik Ekspertiza, DQN (İXM 342.7) & SRS Airbag Stendi
                </h2>
                <span className="px-2 py-0.5 text-[11px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                  YHQ Maddə 27 / İXM 342.1.3 & 342.7
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Mühərrik nömrəsi Texpasport uyğunluğu, 20m DQN oxunuşu, Anti-Radar/Maqnit çərçivə qadağası və SRS "Obmanka" (2.2 Ω) detektoru
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            data-testid="close-forensic-plate-modal"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto bg-slate-950/60 border-b border-slate-800 px-4 pt-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('engine_vin')}
            data-testid="tab-engine-vin"
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl border-b-2 transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'engine_vin'
                ? 'border-indigo-400 text-indigo-300 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            <span>1. Mühərrik Nömrəsi & VIN Ekspertizası</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('plate_rfid')}
            data-testid="tab-plate-rfid"
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl border-b-2 transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'plate_rfid'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ScanLine className="w-4 h-4" />
            <span>2. DQN Oxunuşu (20m), Kvadrat Nömrə & İXM 342.7</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('srs_fluid')}
            data-testid="tab-srs-fluid"
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl border-b-2 transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'srs_fluid'
                ? 'border-rose-400 text-rose-300 bg-rose-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>3. SRS Airbag "Obmanka" & Sızma / Xərc Stendi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('centers')}
            data-testid="tab-forensic-centers"
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl border-b-2 transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'centers'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>4. Meyvəli MERO & Ekspertiza Mərkəzləri</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('certificate')}
            data-testid="tab-forensic-certificate"
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl border-b-2 transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'certificate'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>5. Rəsmi BDYP-EKS-2026 Sertifikatı</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: ENGINE & VIN FORENSICS */}
          {activeTab === 'engine_vin' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                    <Fingerprint className="w-4 h-4" />
                    Mühərrik Nömrəsi (Texpasport vs Blok) & Kriminalistik Status
                  </h3>

                  {/* Quick Scenario Presets */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      data-testid="preset-oem-engine"
                      onClick={() => {
                        setForensicStatus('oem_matching');
                        setTexpasportEngineNumber('N20B20A-89412055');
                        setBlockEngineNumber('N20B20A-89412055');
                        setVinPaintThicknessMicrons(115);
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 cursor-pointer"
                    >
                      Zavod Mühərrik (Uyğun)
                    </button>
                    <button
                      type="button"
                      data-testid="preset-undeclared-swap"
                      onClick={() => {
                        setForensicStatus('swapped_undeclared');
                        setTexpasportEngineNumber('N20B20A-89412055');
                        setBlockEngineNumber('N20B20A-33109482');
                        setHasDgkCustomsDeclaration(false);
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 cursor-pointer"
                    >
                      Sənədsiz "Kontrakt" Mator (İXM 342.2-1)
                    </button>
                    <button
                      type="button"
                      data-testid="preset-corroded-engine"
                      onClick={() => {
                        setForensicStatus('corroded_illegible');
                        setBlockEngineNumber('N20***PASLANMIŞ***');
                        setHasJusticeForensicCertificate(false);
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-sky-500/10 text-sky-300 border border-sky-500/30 hover:bg-sky-500/20 cursor-pointer"
                    >
                      Paslanmış Nömrə (Koroziya)
                    </button>
                    <button
                      type="button"
                      data-testid="preset-tampered-vin"
                      onClick={() => {
                        setForensicStatus('tampered_welded');
                        setVinPaintThicknessMicrons(420);
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 cursor-pointer"
                    >
                      Qaynaq / Saxta VIN (CM 320)
                    </button>
                  </div>

                  {/* Engine Number Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Texpasportda Qeyd Olunan Mühərrik №
                      </label>
                      <input
                        type="text"
                        value={texpasportEngineNumber}
                        onChange={(e) => setTexpasportEngineNumber(e.target.value)}
                        data-testid="input-texpasport-engine"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Blok Üzərindəki Faktiki Mühərrik №
                      </label>
                      <input
                        type="text"
                        value={blockEngineNumber}
                        onChange={(e) => setBlockEngineNumber(e.target.value)}
                        data-testid="input-block-engine"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm font-mono"
                      />
                    </div>
                  </div>

                  {/* Forensic Profile Dropdown */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      BDYP Meyvəli Kriminalistik Baxış Statusu
                    </label>
                    <select
                      value={forensicStatus}
                      onChange={(e) => setForensicStatus(e.target.value as EngineForensicStatusId)}
                      data-testid="select-forensic-status"
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm"
                    >
                      {ENGINE_FORENSIC_PROFILES.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nameAz}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* VIN Firewall Paint Thickness Slider */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">
                        VIN Panel (Stəkan / Kuzov Lövhəsi) Boya Qalınlığı:
                      </span>
                      <span
                        className={`font-bold ${
                          vinPaintThicknessMicrons > 220 ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {vinPaintThicknessMicrons} µm (Norma: 70–160 µm)
                      </span>
                    </div>
                    <input
                      type="range"
                      min={60}
                      max={600}
                      step={10}
                      value={vinPaintThicknessMicrons}
                      onChange={(e) => setVinPaintThicknessMicrons(Number(e.target.value))}
                      data-testid="slider-vin-microns"
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  {/* Supporting Document Checkboxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasDgkCustomsDeclaration}
                        onChange={(e) => setHasDgkCustomsDeclaration(e.target.checked)}
                        data-testid="checkbox-dgk-declaration"
                        className="rounded accent-indigo-500"
                      />
                      <span>DGK Yük Gömrük Bəyannaməsi var (İdxal মator)</span>
                    </label>
                    <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasJusticeForensicCertificate}
                        onChange={(e) => setHasJusticeForensicCertificate(e.target.checked)}
                        data-testid="checkbox-justice-forensic"
                        className="rounded accent-indigo-500"
                      />
                      <span>Ədliyyə Məhkəmə Ekspertizası Rəyi var (Koroziya)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column: Audit Result */}
              <div className="lg:col-span-5 space-y-4">
                <div
                  className={`p-5 rounded-xl border ${
                    engineVinResult.isCompliantForMeroTransfer
                      ? 'bg-emerald-950/30 border-emerald-500/40'
                      : engineVinResult.triggersCriminalInvestigation
                      ? 'bg-rose-950/50 border-rose-500/60'
                      : 'bg-amber-950/30 border-amber-500/40'
                  } space-y-4`}
                  data-testid="engine-vin-verdict-card"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      MERO Qeydiyyat & Ekspertiza Yekunu
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        engineVinResult.isCompliantForMeroTransfer
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      Kriminalistik Bal: {engineVinResult.forensicIntegrityScore}/100
                    </span>
                  </div>

                  <div className="text-base font-bold text-white flex items-center gap-2">
                    {engineVinResult.isCompliantForMeroTransfer ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                    <span>{engineVinResult.verdictBadgeAz}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                      <div className="text-[11px] text-slate-400">İXM Cərimə Riski</div>
                      <div
                        className="text-lg font-extrabold text-rose-400"
                        data-testid="engine-fine-amount"
                      >
                        {convertFromAzn(engineVinResult.fineAzn, currency)} {currencySymbol}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        50% Güzəştlə: {convertFromAzn(engineVinResult.discountedFineAzn, currency)}{' '}
                        {currencySymbol}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                      <div className="text-[11px] text-slate-400">Dövlət Rüsumu / Ekspertiza</div>
                      <div
                        className="text-lg font-extrabold text-indigo-300"
                        data-testid="engine-duty-amount"
                      >
                        {convertFromAzn(engineVinResult.stateDutyAzn, currency)} {currencySymbol}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Texpasport (30 ₼) + Baxış (20 ₼)
                      </div>
                    </div>
                  </div>

                  {engineVinResult.violationsAz.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-xs font-bold text-rose-300">
                        Aşkarlanan Uyğunsuzluqlar:
                      </div>
                      {engineVinResult.violationsAz.map((v, i) => (
                        <div
                          key={i}
                          className="text-xs text-rose-200/90 bg-rose-950/40 border border-rose-500/30 rounded-lg p-2.5"
                        >
                          • {v}
                        </div>
                      ))}
                    </div>
                  )}

                  {engineVinResult.recommendationsAz.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-xs font-bold text-indigo-300">Hüquqi Tövsiyə:</div>
                      {engineVinResult.recommendationsAz.map((rec, i) => (
                        <div
                          key={i}
                          className="text-xs text-slate-300 bg-slate-900/80 border border-slate-800 rounded-lg p-2.5"
                        >
                          ✓ {rec}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LICENSE PLATE (DQN) READABILITY & IXM 342.7 AUDITOR */}
          {activeTab === 'plate_rfid' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                    <ScanLine className="w-4 h-4" />
                    Dövlət Qeydiyyat Nişanı (AZS 598), Kvadrat Baqaj & İXM 342.1.3 vs 342.7 Auditoru
                  </h3>

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      data-testid="preset-plate-clean"
                      onClick={() => {
                        setPlateCondition('clean_standard');
                        setRearRecessFormat('eu_wide_520x112');
                        setMountedRearPlateType('type1_single_line_520');
                        setMeasuredNightVisibilityMeters(25);
                        setRearPlateLampWorking(true);
                        setRfidChipReadable(true);
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 cursor-pointer"
                    >
                      Standart Təmiz DQN (0 ₼)
                    </button>
                    <button
                      type="button"
                      data-testid="preset-plate-dirty"
                      onClick={() => {
                        setPlateCondition('dirty_faded_40azn');
                        setMeasuredNightVisibilityMeters(10);
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30 cursor-pointer"
                    >
                      Çirkli / Oxunmayan (İXM 342.1.3 — 40 ₼)
                    </button>
                    <button
                      type="button"
                      data-testid="preset-plate-us-bent"
                      onClick={() => {
                        setPlateCondition('bent_tailgate_us');
                        setRearRecessFormat('us_jdm_square_288x206');
                        setMountedRearPlateType('type1_single_line_520');
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-sky-500/10 text-sky-300 border border-sky-500/30 cursor-pointer"
                    >
                      ABŞ Baqajda Əyilmiş Uzun Nömrə (Tip-2 Tələbi)
                    </button>
                    <button
                      type="button"
                      data-testid="preset-plate-antiradar"
                      onClick={() => {
                        setPlateCondition('magnetic_curtain_frame_800azn');
                        setMeasuredNightVisibilityMeters(0);
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/30 cursor-pointer"
                    >
                      Gizli Pərdə / Anti-Radar Plyonka (İXM 342.7 — 500–800 ₼)
                    </button>
                  </div>

                  {/* Plate Condition Selector */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Dövlət Qeydiyyat Nişanının (DQN) Faktiki Vəziyyəti
                    </label>
                    <select
                      value={plateCondition}
                      onChange={(e) => setPlateCondition(e.target.value as LicensePlateConditionId)}
                      data-testid="select-plate-condition"
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm"
                    >
                      {LICENSE_PLATE_CONDITIONS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nameAz}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Rear Recess vs Mounted Plate Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Arxa Baqaj Nömrə Yuvasının Zavod Ölçüsü
                      </label>
                      <select
                        value={rearRecessFormat}
                        onChange={(e) => setRearRecessFormat(e.target.value as RearRecessFormat)}
                        data-testid="select-rear-recess"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm"
                      >
                        <option value="eu_wide_520x112">Avropa Uzun Yuva (520×112 mm)</option>
                        <option value="us_jdm_square_288x206">
                          ABŞ / Yaponiya Kvadrat Yuva (288×206 mm)
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Quraşdırılmış Faktiki Arxa DQN Tipi
                      </label>
                      <select
                        value={mountedRearPlateType}
                        onChange={(e) =>
                          setMountedRearPlateType(e.target.value as MountedPlateType)
                        }
                        data-testid="select-mounted-plate-type"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm"
                      >
                        <option value="type1_single_line_520">
                          Tip-1 Birsətirli Uzun (520×112 mm)
                        </option>
                        <option value="type2_two_line_288">
                          Tip-2 İkisətirli Kvadrat (288×206 mm)
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Night Visibility Slider */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">
                        Gecə Vaxtı Arxa DQN Oxunma Məsafəsi (Norma: ≥20 m):
                      </span>
                      <span
                        className={`font-bold ${
                          measuredNightVisibilityMeters >= 20 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {measuredNightVisibilityMeters} metr
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={35}
                      step={1}
                      value={measuredNightVisibilityMeters}
                      onChange={(e) => setMeasuredNightVisibilityMeters(Number(e.target.value))}
                      data-testid="slider-night-visibility"
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rearPlateLampWorking}
                        onChange={(e) => setRearPlateLampWorking(e.target.checked)}
                        className="rounded accent-amber-500"
                      />
                      <span>Arxa DQN Ağ İşıqlandırma Plafonu İşləkdir</span>
                    </label>
                    <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rfidChipReadable}
                        onChange={(e) => setRfidChipReadable(e.target.checked)}
                        className="rounded accent-amber-500"
                      />
                      <span>Daxili UHF RFID Mikroçip Oxunur (İ-Patrul)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column: Plate Audit Verdict */}
              <div className="lg:col-span-5 space-y-4">
                <div
                  className={`p-5 rounded-xl border ${
                    plateAuditResult.isCompliant
                      ? 'bg-emerald-950/30 border-emerald-500/40'
                      : plateAuditResult.isDeliberateObstructionIxm342_7
                      ? 'bg-rose-950/50 border-rose-500/60'
                      : 'bg-amber-950/30 border-amber-500/40'
                  } space-y-4`}
                  data-testid="plate-audit-verdict-card"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-400">
                      BDYP İ-Patrul & MMX Kamera Auditi
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-amber-300">
                      {plateAuditResult.penaltyPoints} Cərimə Balı
                    </span>
                  </div>

                  <div className="text-base font-bold text-white">
                    {plateAuditResult.verdictTitleAz}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                      <div className="text-[11px] text-slate-400">İXM Cərimə Diapazonu</div>
                      <div
                        className="text-lg font-extrabold text-rose-400"
                        data-testid="plate-fine-range"
                      >
                        {plateAuditResult.fineMinAzn === plateAuditResult.fineMaxAzn
                          ? `${convertFromAzn(plateAuditResult.fineMinAzn, currency)} ${currencySymbol}`
                          : `${convertFromAzn(plateAuditResult.fineMinAzn, currency)}–${convertFromAzn(
                              plateAuditResult.fineMaxAzn,
                              currency
                            )} ${currencySymbol}`}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {plateAuditResult.isDeliberateObstructionIxm342_7
                          ? 'İXM Maddə 342.7 (Qəsdən gizlətmə)'
                          : 'İXM Maddə 342.1.3 (20m görünüş)'}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                      <div className="text-[11px] text-slate-400">Dublikat / Kvadrat DQN Rüsumu</div>
                      <div className="text-lg font-extrabold text-amber-300">
                        {convertFromAzn(plateAuditResult.duplicatePlateFeeAzn, currency)}{' '}
                        {currencySymbol}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Rəsmi MERO Dublikat (22 ₼)
                      </div>
                    </div>
                  </div>

                  {plateAuditResult.violationsAz.map((v, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-rose-200 bg-rose-950/40 border border-rose-500/30 rounded-lg p-2.5"
                    >
                      • {v}
                    </div>
                  ))}

                  {plateAuditResult.recommendationsAz.map((r, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-slate-300 bg-slate-900/80 border border-slate-800 rounded-lg p-2.5"
                    >
                      ✓ {r}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SRS AIRBAG "OBMANKA" & FLUID HERMETICITY + SERVICE CALCULATOR */}
          {activeTab === 'srs_fluid' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                    <Cpu className="w-4 h-4" />
                    SRS Airbag "Obmanka" (2.2 Ω Rezistor) & Yanacaq/Yağ Hermetikliyi Stendi
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      data-testid="preset-srs-genuine"
                      onClick={() => {
                        setDriverAirbagOhm(2.2);
                        setDriverAirbagCapacitanceUf(0.85);
                        setFuelSystemLeakDetected(false);
                        setOilDripDropsPerMinute(0);
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 cursor-pointer"
                    >
                      Orijinal SRS Piropatron (2.2 Ω / 0.85 µF)
                    </button>
                    <button
                      type="button"
                      data-testid="preset-srs-obmanka"
                      onClick={() => {
                        setDriverAirbagOhm(2.2);
                        setDriverAirbagCapacitanceUf(0.0);
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/30 cursor-pointer"
                    >
                      Saxta "Obmanka" Rezistor (2.2 Ω / 0.00 µF)
                    </button>
                    <button
                      type="button"
                      data-testid="preset-fuel-leak"
                      onClick={() => {
                        setFuelSystemLeakDetected(true);
                        setOilDripDropsPerMinute(28);
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30 cursor-pointer"
                    >
                      Yanacaq Sızması & Yağ Damcısı (YHQ Bənd 6.1)
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">SRS Airbag Müqaviməti (Ω):</span>
                        <span className="font-bold text-white">{driverAirbagOhm.toFixed(1)} Ω</span>
                      </div>
                      <input
                        type="range"
                        min={0.5}
                        max={6.0}
                        step={0.1}
                        value={driverAirbagOhm}
                        onChange={(e) => setDriverAirbagOhm(Number(e.target.value))}
                        className="w-full accent-rose-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Piropatron Tutumu (µF):</span>
                        <span
                          className={`font-bold ${
                            driverAirbagCapacitanceUf < 0.25 ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {driverAirbagCapacitanceUf.toFixed(2)} µF
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0.0}
                        max={1.5}
                        step={0.05}
                        value={driverAirbagCapacitanceUf}
                        onChange={(e) => setDriverAirbagCapacitanceUf(Number(e.target.value))}
                        className="w-full accent-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">
                        Karter / Transmissiya Yağ Damcı İntensivliyi (Norma: ≤20 damcı/dəq):
                      </span>
                      <span
                        className={`font-bold ${
                          oilDripDropsPerMinute > 20 ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {oilDripDropsPerMinute} damcı/dəq
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={50}
                      step={2}
                      value={oilDripDropsPerMinute}
                      onChange={(e) => setOilDripDropsPerMinute(Number(e.target.value))}
                      className="w-full accent-rose-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={fuelSystemLeakDetected}
                        onChange={(e) => setFuelSystemLeakDetected(e.target.checked)}
                        className="rounded accent-rose-500"
                      />
                      <span>Yanacaq Xətti / Forsunka Sızması Var (YHQ Bənd 6.1)</span>
                    </label>
                    <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={seatbeltPretensionerWorking}
                        onChange={(e) => setSeatbeltPretensionerWorking(e.target.checked)}
                        className="rounded accent-rose-500"
                      />
                      <span>Kəmər Pirotexniki Dartıcıları (Pretensioner) İşləkdir</span>
                    </label>
                  </div>
                </div>

                {/* Statutory Fees & Restoration Packages */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-indigo-400" />
                    Rəsmi Rüsumlar, Ekspertiza və Servis Bərpa Paketləri
                  </h4>
                  <div className="space-y-2">
                    {FORENSIC_SERVICE_PACKAGES.map((pkg) => {
                      const isSelected = selectedPackages.includes(pkg.id);
                      const pkgTotal = pkg.officialFeeOrPartsAzn + pkg.serviceOrLaborAzn;
                      return (
                        <label
                          key={pkg.id}
                          className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-indigo-500/15 border-indigo-500/50 text-white'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleTogglePackage(pkg.id)}
                              className="rounded accent-indigo-500"
                            />
                            <div>
                              <div className="font-semibold">{pkg.nameAz}</div>
                              <div className="text-[11px] text-slate-400">{pkg.legalNoteAz}</div>
                            </div>
                          </div>
                          <span className="font-bold text-indigo-300 shrink-0 ml-2">
                            {convertFromAzn(pkgTotal, currency)} {currencySymbol}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: SRS Verdict & Total Cost */}
              <div className="lg:col-span-5 space-y-4">
                <div
                  className={`p-5 rounded-xl border ${
                    srsFluidResult.isCompliant
                      ? 'bg-emerald-950/30 border-emerald-500/40'
                      : 'bg-rose-950/40 border-rose-500/50'
                  } space-y-4`}
                  data-testid="srs-fluid-verdict-card"
                >
                  <div className="text-xs font-bold uppercase text-slate-400">
                    SRS Pirotexnika & Hermetiklik Diaqnozu
                  </div>
                  <div className="text-base font-bold text-white">{srsFluidResult.verdictAz}</div>

                  {srsFluidResult.violationsAz.map((v, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-rose-200 bg-rose-950/50 border border-rose-500/30 rounded-lg p-2.5"
                    >
                      • {v}
                    </div>
                  ))}
                </div>

                <div className="p-5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold uppercase text-slate-400">
                    Seçilmiş Rəsmiləşdirmə & Bərpa Xərci Yekunu
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-slate-300">Yekun Məbləğ:</span>
                    <span
                      className="text-2xl font-black text-indigo-400"
                      data-testid="forensic-service-total"
                    >
                      {serviceSummary.totalInCurrency} {currencySymbol}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex justify-between">
                    <span>Rüsum / Ehtiyat Hissə: {serviceSummary.stateDutyAndPartsAzn} ₼</span>
                    <span>Xidmət / İşçilik: {serviceSummary.serviceLaborAzn} ₼</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACCREDITED MERO & FORENSIC CENTERS */}
          {activeTab === 'centers' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-cyan-300">
                  BDYP Kriminalistik Ekspertiza Boksları, Ədliyyə Ekspertiza Mərkəzi & DQN Press Məntəqələri
                </h3>
                <div className="flex gap-2">
                  {['Hamısı', 'Bakı', 'Xırdalan', 'Sumqayıt', 'Gəncə'].map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setSelectedCity(city)}
                      data-testid={`filter-city-${city}`}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                        selectedCity === city
                          ? 'bg-cyan-500 text-slate-950'
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
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                          {center.city}
                        </span>
                        <span className="text-xs text-amber-400 font-bold">★ {center.rating}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{center.nameAz}</h4>
                      <p className="text-xs text-slate-400">{center.addressAz}</p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {center.hasAcidEtchingForensicLab && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                            Kimyəvi-Kriminalistik Lab
                          </span>
                        )}
                        {center.hasType2SquarePlatePress && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            Tip-2 Kvadrat DQN Presi (288×206)
                          </span>
                        )}
                        {center.hasRfidChipTester && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            UHF RFID Oxuyucu
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCenterName(center.nameAz);
                        setActiveTab('certificate');
                      }}
                      className="w-full py-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-semibold cursor-pointer"
                    >
                      Bu Mərkəzdən Ekspertiza Aktı Тərtib Et
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: OFFICIAL BDYP-EKS-2026 CERTIFICATE & UNIFIED REGISTRY LOOKUP */}
          {activeTab === 'certificate' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-emerald-300">
                    Yeni Kriminalistik Müayinə və DQN Sertifikatı Tərtib Et
                  </h3>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Dövlət Qeydiyyat Nişanı</label>
                    <input
                      type="text"
                      value={vehiclePlateInput}
                      onChange={(e) => setVehiclePlateInput(e.target.value)}
                      data-testid="cert-plate-input"
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Şassi / Ban (VIN) Kodu</label>
                    <input
                      type="text"
                      value={vinInput}
                      onChange={(e) => setVinInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateCertificate}
                    data-testid="generate-forensic-cert-btn"
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Rəsmi BDYP-EKS-2026 Aktı Yarat
                  </button>
                </div>

                {/* Registry Lookup */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-emerald-400" />
                    Vahid Elektron Reyestr Yoxlanışı (Məs: 90-AA-700 və ya 77-EK-505)
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Sertifikat № və ya DQN daxil edin..."
                      value={lookupQuery}
                      onChange={(e) => setLookupQuery(e.target.value)}
                      data-testid="forensic-lookup-input"
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleLookup}
                      data-testid="forensic-lookup-btn"
                      className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold cursor-pointer"
                    >
                      Axtar
                    </button>
                  </div>
                  {lookupResult === null && (
                    <p className="text-xs text-rose-400">Reyestrdə belə akt tapılmadı.</p>
                  )}
                </div>
              </div>

              {/* Certificate Display Card */}
              <div className="lg:col-span-7">
                <div
                  className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950 border-2 border-emerald-500/40 space-y-4"
                  data-testid="forensic-certificate-card"
                >
                  <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                        AZƏRBAYCAN RESPUBLİKASI DİN BDYPİ — KRİMİNALİSTİK MÜAYİNƏ AKTI
                      </div>
                      <h3 className="text-lg font-black text-white mt-0.5">
                        {activeCertificate.certificateNumber}
                      </h3>
                      <p className="text-xs text-slate-400">{activeCertificate.inspectingCenterAz}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      <QrCode className="w-8 h-8" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 block">Dövlət Qeydiyyat Nişanı:</span>
                      <span className="font-bold text-white font-mono">
                        {activeCertificate.vehiclePlate}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 block">VIN / Kuzov №:</span>
                      <span className="font-bold text-white font-mono">{activeCertificate.vin}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 block">Təsdiqlənmiş Mühərrik №:</span>
                      <span className="font-bold text-emerald-300 font-mono">
                        {activeCertificate.inspectedEngineNumber}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 block">UHF RFID Çip UID:</span>
                      <span className="font-bold text-indigo-300 font-mono">
                        {activeCertificate.rfidTagUid}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 block">Gecə 20m Oxunuş & SRS:</span>
                      <span className="font-bold text-emerald-400">
                        {activeCertificate.plateNightReadabilityMeters}m / Orijinal SRS
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 block">Ekspert İmza:</span>
                      <span className="font-bold text-white">
                        {activeCertificate.expertRankAndName}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
                    <span>QR Hash: {activeCertificate.qrSecurityHash}</span>
                    <span className="text-emerald-400 font-semibold">
                      Etibarlıdır: {activeCertificate.expiryDate}
                    </span>
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

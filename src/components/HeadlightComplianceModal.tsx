import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Award,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  FileCheck,
  Gauge,
  Lightbulb,
  MapPin,
  Phone,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Sun,
  Wrench,
  X,
} from 'lucide-react';
import { Currency, Vehicle } from '../types/vehicle';
import {
  BeamPatternStandard,
  HeadlampHousingMarking,
  HeadlightComplianceCertificate,
  InstalledBulbType,
  SpecialBeaconType,
  auditHeadlightCompliance,
  calculateLightingServiceEstimate,
  evaluateBeamRegloscope,
  formatLightingCurrency,
  generateHeadlightCertificate,
  getVehicleDefaultLightingProfile,
} from '../utils/headlightCompliance';
import {
  HEADLAMP_HOUSING_MARKINGS,
  INSTALLED_BULB_OPTIONS,
  OPTICAL_SERVICE_CENTERS,
  VERIFIED_HEADLIGHT_CERTIFICATES,
  findHeadlightCertificateByCode,
} from '../data/mockHeadlightData';

interface HeadlightComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: Vehicle | null;
  currency: Currency;
}

type ActiveTab = 'auditor' | 'regloscope' | 'centers' | 'certificate';

export const HeadlightComplianceModal: React.FC<HeadlightComplianceModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  currency,
}) => {
  const defaultProfile = useMemo(() => getVehicleDefaultLightingProfile(vehicle), [vehicle]);

  const [activeTab, setActiveTab] = useState<ActiveTab>('auditor');

  // Tab 1: Xenon / LED / External Lighting Auditor State
  const [housingMarking, setHousingMarking] = useState<HeadlampHousingMarking>(
    defaultProfile.housingMarking
  );
  const [installedBulb, setInstalledBulb] = useState<InstalledBulbType>(
    defaultProfile.installedBulb
  );
  const [hasProjectorLens, setHasProjectorLens] = useState<boolean>(true);
  const [hasAutoLevelingSystem, setHasAutoLevelingSystem] = useState<boolean>(true);
  const [hasHeadlampWasher, setHasHeadlampWasher] = useState<boolean>(true);
  const [colorTemperatureKelvin, setColorTemperatureKelvin] = useState<number>(
    defaultProfile.colorTemperatureKelvin
  );
  const [hasSmokedTailLightFilm, setHasSmokedTailLightFilm] = useState<boolean>(false);
  const [hasRedRearTurnSignalsUsSpec, setHasRedRearTurnSignalsUsSpec] = useState<boolean>(false);
  const [hasMalfunctioningStopOrLowBeam, setHasMalfunctioningStopOrLowBeam] =
    useState<boolean>(false);
  const [specialBeaconType, setSpecialBeaconType] = useState<SpecialBeaconType>('NONE');

  // Tab 2: Optical Regloscope / Luxmeter Stand State
  const [mountingHeightMm, setMountingHeightMm] = useState<number>(
    defaultProfile.mountingHeightMm
  );
  const [verticalSlopePercent, setVerticalSlopePercent] = useState<number>(-1.3);
  const [horizontalDeviationDeg, setHorizontalDeviationDeg] = useState<number>(0.0);
  const [lowBeamIntensityLuxAt25m, setLowBeamIntensityLuxAt25m] = useState<number>(28);
  const [glareZoneLuxAboveCutOff, setGlareZoneLuxAboveCutOff] = useState<number>(0.45);
  const [highBeamIntensityLuxAt25m, setHighBeamIntensityLuxAt25m] = useState<number>(72);
  const [beamPatternStandard, setBeamPatternStandard] =
    useState<BeamPatternStandard>('ECE_RIGHT_TRAFFIC');

  // Tab 3: Accredited Optical Centers & Conversion Calculator State
  const [selectedCenterId, setSelectedCenterId] = useState<string>(OPTICAL_SERVICE_CENTERS[0].id);
  const [includeRegloscopeAiming, setIncludeRegloscopeAiming] = useState<boolean>(true);
  const [includeLensPolishing, setIncludeLensPolishing] = useState<boolean>(false);
  const [includeJdmToEceConversion, setIncludeJdmToEceConversion] = useState<boolean>(false);
  const [includeUsAmberTurnConversion, setIncludeUsAmberTurnConversion] = useState<boolean>(false);
  const [includeCertifiedBiLedRetrofit, setIncludeCertifiedBiLedRetrofit] =
    useState<boolean>(false);
  const [includeAzsConstructiveEndorsement, setIncludeAzsConstructiveEndorsement] =
    useState<boolean>(false);

  // Tab 4: Official BDYP & AZS Optical Certificate State
  const [plateNumber, setPlateNumber] = useState<string>('99-AZ-700');
  const [vinInput, setVinInput] = useState<string>(vehicle?.vin || 'WBA5A5C50FD918273');
  const [customCertificates, setCustomCertificates] = useState<HeadlightComplianceCertificate[]>(
    []
  );
  const [activeCertificate, setActiveCertificate] = useState<HeadlightComplianceCertificate | null>(
    null
  );
  const [registrySearchQuery, setRegistrySearchQuery] = useState<string>('');
  const [searchedCertificate, setSearchedCertificate] =
    useState<HeadlightComplianceCertificate | null>(null);
  const [searchAttempted, setSearchAttempted] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const auditResult = useMemo(
    () =>
      auditHeadlightCompliance({
        housingMarking,
        installedBulb,
        hasProjectorLens,
        hasAutoLevelingSystem,
        hasHeadlampWasher,
        colorTemperatureKelvin,
        hasSmokedTailLightFilm,
        hasRedRearTurnSignalsUsSpec,
        hasMalfunctioningStopOrLowBeam,
        specialBeaconType,
      }),
    [
      housingMarking,
      installedBulb,
      hasProjectorLens,
      hasAutoLevelingSystem,
      hasHeadlampWasher,
      colorTemperatureKelvin,
      hasSmokedTailLightFilm,
      hasRedRearTurnSignalsUsSpec,
      hasMalfunctioningStopOrLowBeam,
      specialBeaconType,
    ]
  );

  const regloscopeResult = useMemo(
    () =>
      evaluateBeamRegloscope({
        mountingHeightMm,
        verticalSlopePercent,
        horizontalDeviationDeg,
        lowBeamIntensityLuxAt25m,
        glareZoneLuxAboveCutOff,
        highBeamIntensityLuxAt25m,
        beamPatternStandard,
      }),
    [
      mountingHeightMm,
      verticalSlopePercent,
      horizontalDeviationDeg,
      lowBeamIntensityLuxAt25m,
      glareZoneLuxAboveCutOff,
      highBeamIntensityLuxAt25m,
      beamPatternStandard,
    ]
  );

  const selectedCenter = useMemo(
    () =>
      OPTICAL_SERVICE_CENTERS.find((c) => c.id === selectedCenterId) || OPTICAL_SERVICE_CENTERS[0],
    [selectedCenterId]
  );

  const serviceEstimate = useMemo(
    () =>
      calculateLightingServiceEstimate({
        center: selectedCenter,
        includeRegloscopeAiming,
        includeLensPolishing,
        includeJdmToEceConversion,
        includeUsAmberTurnConversion,
        includeCertifiedBiLedRetrofit,
        includeAzsConstructiveEndorsement,
      }),
    [
      selectedCenter,
      includeRegloscopeAiming,
      includeLensPolishing,
      includeJdmToEceConversion,
      includeUsAmberTurnConversion,
      includeCertifiedBiLedRetrofit,
      includeAzsConstructiveEndorsement,
    ]
  );

  if (!isOpen) return null;

  const selectedBulbLabel =
    INSTALLED_BULB_OPTIONS.find((b) => b.id === installedBulb)?.label || installedBulb;

  const beamStandardLabel =
    beamPatternStandard === 'ECE_RIGHT_TRAFFIC'
      ? 'ECE R112 Sağ-Tərəfli (Avropa / AZS Standartı)'
      : beamPatternStandard === 'DOT_US_SYMMETRIC'
        ? 'DOT / SAE Simmetrik (ABŞ Standartı)'
        : 'JDM / RHD Sol-Tərəfli (Yaponiya / UK Standartı)';

  const handleGenerateCertificate = () => {
    const generated = generateHeadlightCertificate({
      plateNumber,
      vin: vinInput,
      vehicleTitle: vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : '2023 BMW 530i M-Sport',
      housingMarking,
      installedBulbLabel: selectedBulbLabel,
      colorTemperatureKelvin,
      measuredSlopePercent: verticalSlopePercent,
      measuredGlareLux: glareZoneLuxAboveCutOff,
      beamStandardLabel,
      inspectionCenterName: selectedCenter.name,
      hasAzsConstructiveEndorsement:
        installedBulb === 'biled_projector_certified' || includeAzsConstructiveEndorsement,
    });
    setCustomCertificates((prev) => [generated, ...prev]);
    setActiveCertificate(generated);
  };

  const handleSearchRegistry = () => {
    setSearchAttempted(true);
    const found = findHeadlightCertificateByCode(registrySearchQuery, customCertificates);
    setSearchedCertificate(found);
  };

  const handleCopyCode = (code: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getKelvinBadgeColor = (kelvin: number) => {
    if (kelvin <= 3500) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
    if (kelvin <= 4800) return 'bg-amber-400/20 text-amber-200 border-amber-400/40';
    if (kelvin <= 6000) return 'bg-sky-400/20 text-sky-200 border-sky-400/40';
    if (kelvin <= 8000) return 'bg-blue-500/30 text-blue-300 border-blue-500/50';
    return 'bg-purple-500/30 text-purple-300 border-purple-500/50';
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 via-yellow-500/20 to-sky-500/20 border border-amber-500/30 flex items-center justify-center shadow-lg">
              <Lightbulb className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  BDYP & AZS Xarici İşıq Cihazları, Ksenon/LED Qanunilik & Fara Reqloskop Stendi
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-full">
                  YHQ Əlavə 1 Bölmə III • İXM 342.2-1
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Fara korpusu markalanması (HCR/DCR/LED), Kelvin spektr yoxlaması, Lazer Reqloskop tənzimlənməsi, ABŞ/Yaponiya fara konversiyası və Sayrışan İşıq (İXM 342.9) portalı
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            data-testid="close-headlight-modal-btn"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-slate-950/50 border-b border-slate-800 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('auditor')}
            data-testid="tab-headlight-auditor"
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'auditor'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>1. Ksenon/LED & İXM 342.2-1 Auditoru</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('regloscope')}
            data-testid="tab-headlight-regloscope"
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'regloscope'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>2. Fara Reqloskop & Lyuksmetr Stendi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('centers')}
            data-testid="tab-headlight-centers"
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'centers'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>3. Optik Servis & US/JDM Konversiya</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('certificate')}
            data-testid="tab-headlight-certificate"
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'certificate'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>4. BDYP / AZS Optik Şəhadətnamə</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* TAB 1: XENON / LED / EXTERNAL LIGHTING AUDITOR */}
          {activeTab === 'auditor' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Configuration Column */}
              <div className="lg:col-span-7 space-y-5">
                {/* Housing Marking Selector */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Eye className="w-4 h-4 text-amber-400" />
                      1. Fara Korpusunun Zavod Markalanması (Şüşə / Korpus Kodu)
                    </h3>
                    <span className="text-[11px] text-slate-400">UNECE R112 / R48</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {HEADLAMP_HOUSING_MARKINGS.map((option) => (
                      <button
                        key={option.code}
                        type="button"
                        data-testid={`housing-option-${option.code}`}
                        onClick={() => setHousingMarking(option.code)}
                        className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                          housingMarking === option.code
                            ? 'bg-amber-500/15 border-amber-500/50 text-white'
                            : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs sm:text-sm text-white">
                            {option.title}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-[11px] text-amber-300 border border-slate-700">
                            {option.stampCode}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{option.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Installed Bulb Type Selector */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <label className="block text-sm font-bold text-white">
                    2. Faktiki Quraşdırılmış İşıq Mənbəyi (Lampa / Modul Tipi)
                  </label>
                  <select
                    data-testid="installed-bulb-select"
                    value={installedBulb}
                    onChange={(e) => setInstalledBulb(e.target.value as InstalledBulbType)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    {INSTALLED_BULB_OPTIONS.map((bulb) => (
                      <option key={bulb.id} value={bulb.id}>
                        {bulb.label}
                      </option>
                    ))}
                  </select>

                  {/* Color Temperature (Kelvin) Slider */}
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">
                        İşıq Rəng Temperaturu (Kelvin Spektri):
                      </span>
                      <span
                        data-testid="kelvin-value-badge"
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getKelvinBadgeColor(
                          colorTemperatureKelvin
                        )}`}
                      >
                        {colorTemperatureKelvin}K{' '}
                        {colorTemperatureKelvin <= 3500
                          ? '(Sarı Duman)'
                          : colorTemperatureKelvin <= 4500
                            ? '(Zavod Ağ-Sarımtıl)'
                            : colorTemperatureKelvin <= 6000
                              ? '(Saf Günəş Ağı — Qanuni)'
                              : '(Göy/Bənövşəyi — QADAĞANDIR!)'}
                      </span>
                    </div>

                    <input
                      type="range"
                      min={3000}
                      max={10000}
                      step={500}
                      value={colorTemperatureKelvin}
                      data-testid="kelvin-slider"
                      onChange={(e) => setColorTemperatureKelvin(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>3000K (Sarı)</span>
                      <span>4300K (OEM)</span>
                      <span>5500K (LED Ağ)</span>
                      <span>6000K (Maks Hədd)</span>
                      <span className="text-rose-400">8000K–10000K (Cərimə)</span>
                    </div>
                  </div>
                </div>

                {/* Optical Equipment & Rear / Beacon Checkboxes */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <h3 className="text-sm font-bold text-white">
                    3. Optik Avadanlıq, Arxa Stop Şüşələri və Xüsusi Siqnallar
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasProjectorLens}
                        data-testid="chk-projector-lens"
                        onChange={(e) => setHasProjectorLens(e.target.checked)}
                        className="rounded accent-amber-500"
                      />
                      <span>Fokuslayıcı Proyektor Linza (STG Pərdəli)</span>
                    </label>

                    <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasAutoLevelingSystem}
                        data-testid="chk-auto-leveling"
                        onChange={(e) => setHasAutoLevelingSystem(e.target.checked)}
                        className="rounded accent-amber-500"
                      />
                      <span>Avtomatik Səviyyə Korrektoru İşləkdir</span>
                    </label>

                    <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasHeadlampWasher}
                        data-testid="chk-headlamp-washer"
                        onChange={(e) => setHasHeadlampWasher(e.target.checked)}
                        className="rounded accent-amber-500"
                      />
                      <span>Yüksək Təzyiqli Fara Yuyucusu Var</span>
                    </label>

                    <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-rose-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasSmokedTailLightFilm}
                        data-testid="chk-smoked-taillight"
                        onChange={(e) => setHasSmokedTailLightFilm(e.target.checked)}
                        className="rounded accent-rose-500"
                      />
                      <span>Arxa Stopda Tündləşdirici Plyonka / Lak Var</span>
                    </label>

                    <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasRedRearTurnSignalsUsSpec}
                        data-testid="chk-red-turn-signals"
                        onChange={(e) => setHasRedRearTurnSignalsUsSpec(e.target.checked)}
                        className="rounded accent-amber-500"
                      />
                      <span>ABŞ İdxalı Qırmızı Arxa Dönmə İşığı</span>
                    </label>

                    <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasMalfunctioningStopOrLowBeam}
                        data-testid="chk-bulb-malfunction"
                        onChange={(e) => setHasMalfunctioningStopOrLowBeam(e.target.checked)}
                        className="rounded accent-amber-500"
                      />
                      <span>Yanmayan Yaxın İşıq / Stop Lampası Var</span>
                    </label>
                  </div>

                  {/* Special Flashing Beacon Selector (İXM Maddə 342.9) */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Xüsusi Sayrışan İşıq (Miqalka) və Səs Siqnalı Statusu (YHQ Maddə 74 / İXM 342.9):
                    </label>
                    <select
                      data-testid="special-beacon-select"
                      value={specialBeaconType}
                      onChange={(e) => setSpecialBeaconType(e.target.value as SpecialBeaconType)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="NONE">Yoxdur (Standart Mülki Komplektasiya)</option>
                      <option value="AMBER_WORK_PERMITTED">
                        Rəsmi İcazəli Narıncı/Sarı Sayrışan İşıq (Evakuator / İriqabaritli / Kommunal)
                      </option>
                      <option value="AMBER_NO_PERMIT">
                        İcazəsiz Narıncı/Sarı Sayrışan İşıq (Qeydiyyatsız — İXM 342.2-1)
                      </option>
                      <option value="RED_BLUE_UNAUTHORIZED_STROBE">
                        Qadağan Olunmuş Qırmızı/Göy Stroboskop "Miqalka" və ya Çoxtonlu Siqnal (İXM 342.9)
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Audit Verdict Column */}
              <div className="lg:col-span-5 space-y-4">
                <div
                  data-testid="headlight-audit-verdict-card"
                  className={`p-5 rounded-2xl border ${
                    auditResult.verdictLevel === 'COMPLIANT'
                      ? 'bg-emerald-500/10 border-emerald-500/40'
                      : auditResult.verdictLevel === 'WARNING_DEFECT'
                        ? 'bg-amber-500/10 border-amber-500/40'
                        : 'bg-rose-500/10 border-rose-500/40'
                  } space-y-4`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {auditResult.isFullyCompliant ? (
                        <ShieldCheck className="w-7 h-7 text-emerald-400 shrink-0" />
                      ) : (
                        <ShieldAlert className="w-7 h-7 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          BDYP Hüquqi Ekspertiza Nəticəsi
                        </span>
                        <h3 className="text-base font-black text-white leading-snug">
                          {auditResult.verdictTitle}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {auditResult.statutoryExplanation}
                  </p>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">İnzibati Cərimə Riski</span>
                      <span
                        data-testid="headlight-fine-amount"
                        className={`text-lg font-black ${
                          auditResult.fineAmountAzn > 0 ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {auditResult.fineAmountAzn === 0
                          ? '0 ₼ (Cəriməsiz)'
                          : formatLightingCurrency(auditResult.fineAmountAzn, currency)}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">İstismar & Müsadirə</span>
                      <span className="text-xs font-bold text-white block mt-1">
                        {auditResult.deviceConfiscationRisk
                          ? 'Cihaz Müsadirə Edilir!'
                          : auditResult.prohibitionOfOperationRisk
                            ? 'İstismar Qadağan Olunur'
                            : 'Məhdudiyyət Yoxdur'}
                      </span>
                    </div>
                  </div>

                  {/* Violation Articles */}
                  {auditResult.violationArticles.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        Aşkarlanan Qanun Pozuntuları:
                      </span>
                      <ul className="space-y-1.5 text-xs text-rose-200">
                        {auditResult.violationArticles.map((article, idx) => (
                          <li
                            key={idx}
                            className="p-2 rounded-lg bg-rose-950/50 border border-rose-500/30"
                          >
                            • {article}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-xs font-bold text-amber-300">
                      Mühəndis & Hüquqi Tövsiyələr:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {auditResult.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OPTICAL REGLOSCOPE & LUXMETER STAND */}
          {activeTab === 'regloscope' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-amber-400" />
                      Lazer Reqloskop və Lyuksmetr Parametrləri (25m Ekran Ekvivalenti)
                    </h3>
                    <span className="text-xs text-amber-300 font-mono">
                      Tövsiyə Maillik: {regloscopeResult.recommendedMinSlopePercent}% ...{' '}
                      {regloscopeResult.recommendedMaxSlopePercent}%
                    </span>
                  </div>

                  {/* Beam Pattern Standard */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Fara İşıq-Kölgə Sərhədi (STG) Optik Həndəsəsi:
                    </label>
                    <select
                      data-testid="beam-pattern-select"
                      value={beamPatternStandard}
                      onChange={(e) =>
                        setBeamPatternStandard(e.target.value as BeamPatternStandard)
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white"
                    >
                      <option value="ECE_RIGHT_TRAFFIC">
                        ECE R112 Sağ-Tərəfli (Avropa / Azərbaycan — Sağ 15° Yüksəliş)
                      </option>
                      <option value="DOT_US_SYMMETRIC">
                        DOT / SAE Simmetrik (ABŞ İdxalı — Düz Üfüqi Kəsim)
                      </option>
                      <option value="JDM_UK_LEFT_TRAFFIC">
                        JDM / UK Sol-Tərəfli (Yaponiya RHD — Qarşı Zolağı Kor Edir!)
                      </option>
                    </select>
                  </div>

                  {/* Sliders Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">Fara Mərkəz Hündürlüyü:</span>
                        <span className="font-mono font-bold text-white">{mountingHeightMm} mm</span>
                      </div>
                      <input
                        type="range"
                        min={550}
                        max={1100}
                        step={10}
                        value={mountingHeightMm}
                        data-testid="slider-mounting-height"
                        onChange={(e) => setMountingHeightMm(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">Şaquli Maillik Bucağı (%):</span>
                        <span
                          data-testid="slope-percent-value"
                          className={`font-mono font-bold ${
                            regloscopeResult.isSlopeCompliant ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {verticalSlopePercent}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={-2.5}
                        max={0.2}
                        step={0.1}
                        value={verticalSlopePercent}
                        data-testid="slider-vertical-slope"
                        onChange={(e) => setVerticalSlopePercent(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">Yaxın İşıq Şiddəti (≥16 Lux):</span>
                        <span className="font-mono font-bold text-white">
                          {lowBeamIntensityLuxAt25m} Lux
                        </span>
                      </div>
                      <input
                        type="range"
                        min={8}
                        max={55}
                        step={1}
                        value={lowBeamIntensityLuxAt25m}
                        data-testid="slider-low-beam-lux"
                        onChange={(e) => setLowBeamIntensityLuxAt25m(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">Qamaşdırma Zonası (≤1.0 Lux):</span>
                        <span
                          className={`font-mono font-bold ${
                            regloscopeResult.isGlareWithinLimit
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {glareZoneLuxAboveCutOff} Lux
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0.1}
                        max={3.0}
                        step={0.05}
                        value={glareZoneLuxAboveCutOff}
                        data-testid="slider-glare-lux"
                        onChange={(e) => setGlareZoneLuxAboveCutOff(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Regloscope Telemetry Summary */}
              <div className="lg:col-span-5 space-y-4">
                <div
                  data-testid="regloscope-status-card"
                  className={`p-5 rounded-2xl border ${
                    regloscopeResult.passesRegloscopeInspection
                      ? 'bg-emerald-500/10 border-emerald-500/40'
                      : 'bg-rose-500/10 border-rose-500/40'
                  } space-y-4`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      BDYP Texniki Baxış Stend Nəticəsi
                    </span>
                    <span
                      data-testid="regloscope-pass-badge"
                      className={`px-2.5 py-1 rounded-full text-xs font-black ${
                        regloscopeResult.passesRegloscopeInspection
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {regloscopeResult.passesRegloscopeInspection
                        ? 'STENDDƏN KEÇDİ (OK)'
                        : 'KALİBRASİYA TƏLƏB OLUNUR'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">
                        Effektiv Görmə Məsafəsi
                      </span>
                      <span
                        data-testid="visibility-distance-meters"
                        className="text-xl font-black text-amber-400"
                      >
                        {regloscopeResult.estimatedLowBeamVisibilityMeters} metr
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">
                        Qarşı Zolaq Qamaşdırma
                      </span>
                      <span
                        data-testid="oncoming-glare-risk"
                        className={`text-sm font-black block mt-1 ${
                          regloscopeResult.oncomingGlareRisk === 'NONE'
                            ? 'text-emerald-400'
                            : regloscopeResult.oncomingGlareRisk === 'MODERATE'
                              ? 'text-amber-400'
                              : 'text-rose-400'
                        }`}
                      >
                        {regloscopeResult.oncomingGlareRisk === 'NONE'
                          ? 'Təhlükəsiz (Normada)'
                          : regloscopeResult.oncomingGlareRisk === 'MODERATE'
                            ? 'Orta Hədd'
                            : 'Qamaşdırır (Təhlükəli!)'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-white">Diaqnostik Qeydlər:</span>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {regloscopeResult.diagnosticNotes.map((note, idx) => (
                        <li
                          key={idx}
                          className="p-2 rounded-lg bg-slate-950/70 border border-slate-800"
                        >
                          • {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OPTICAL SERVICE & US/JDM CONVERSION CALCULATOR */}
          {activeTab === 'centers' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {OPTICAL_SERVICE_CENTERS.map((center) => (
                    <button
                      key={center.id}
                      type="button"
                      data-testid={`optical-center-${center.id}`}
                      onClick={() => setSelectedCenterId(center.id)}
                      className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        selectedCenter.id === center.id
                          ? 'bg-amber-500/15 border-amber-500/50 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-white">{center.name}</span>
                        <span className="px-2 py-0.5 text-[10px] rounded bg-slate-800 text-amber-300 font-mono">
                          {center.city}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        {center.address}
                      </p>
                      <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-400" />
                          {center.phone}
                        </span>
                        <span className="text-amber-400 font-bold">★ {center.rating}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Service Operations Selector */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                  <h3 className="text-sm font-bold text-white">
                    Optik Tənzimləmə, Konversiya və Sertifikatlaşdırma Xidmətləri
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 cursor-pointer">
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={includeRegloscopeAiming}
                          data-testid="srv-regloscope"
                          onChange={(e) => setIncludeRegloscopeAiming(e.target.checked)}
                          className="rounded accent-amber-500"
                        />
                        <span>3D Lazer Reqloskop Kalibrasiyası</span>
                      </span>
                      <span className="font-bold text-amber-400">
                        {formatLightingCurrency(selectedCenter.regloscopeCalibrationFeeAzn, currency)}
                      </span>
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 cursor-pointer">
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={includeLensPolishing}
                          data-testid="srv-polishing"
                          onChange={(e) => setIncludeLensPolishing(e.target.checked)}
                          className="rounded accent-amber-500"
                        />
                        <span>Şüşə Cilalanması & UV Keramika</span>
                      </span>
                      <span className="font-bold text-amber-400">
                        {formatLightingCurrency(selectedCenter.lensPolishingCeramicFeeAzn, currency)}
                      </span>
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 cursor-pointer">
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={includeJdmToEceConversion}
                          data-testid="srv-jdm-conversion"
                          onChange={(e) => setIncludeJdmToEceConversion(e.target.checked)}
                          className="rounded accent-amber-500"
                        />
                        <span>Yaponiya (RHD) → Avropa ECE Konversiya</span>
                      </span>
                      <span className="font-bold text-amber-400">
                        {formatLightingCurrency(selectedCenter.jdmToEceConversionFeeAzn, currency)}
                      </span>
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 cursor-pointer">
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={includeUsAmberTurnConversion}
                          data-testid="srv-us-turn-conversion"
                          onChange={(e) => setIncludeUsAmberTurnConversion(e.target.checked)}
                          className="rounded accent-amber-500"
                        />
                        <span>ABŞ Qırmızı → Narıncı Dönmə LED</span>
                      </span>
                      <span className="font-bold text-amber-400">
                        {formatLightingCurrency(selectedCenter.usAmberTurnConversionFeeAzn, currency)}
                      </span>
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 cursor-pointer">
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={includeCertifiedBiLedRetrofit}
                          data-testid="srv-biled-retrofit"
                          onChange={(e) => setIncludeCertifiedBiLedRetrofit(e.target.checked)}
                          className="rounded accent-amber-500"
                        />
                        <span>Sertifikatlı Bi-LED Linza Quraşdırılması</span>
                      </span>
                      <span className="font-bold text-amber-400">
                        {formatLightingCurrency(selectedCenter.certifiedBiLedRetrofitFeeAzn, currency)}
                      </span>
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 cursor-pointer">
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={includeAzsConstructiveEndorsement}
                          data-testid="srv-azs-endorsement"
                          onChange={(e) => setIncludeAzsConstructiveEndorsement(e.target.checked)}
                          className="rounded accent-amber-500"
                        />
                        <span>AZS Konstruktiv Laboratoriya Rəyi</span>
                      </span>
                      <span className="font-bold text-amber-400">
                        {formatLightingCurrency(90, currency)}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Service Summary */}
              <div className="lg:col-span-5">
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <h3 className="text-base font-black text-white">
                    Optik Servis & Konversiya Smetası
                  </h3>
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-amber-200 block">Yekun Xidmət Haqqı</span>
                      <span
                        data-testid="lighting-service-total-cost"
                        className="text-2xl font-black text-white"
                      >
                        {formatLightingCurrency(serviceEstimate.totalCostAzn, currency)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Görmə Məsafəsi Artımı</span>
                      <span className="text-lg font-black text-emerald-400">
                        +{serviceEstimate.visibilityGainMeters} m
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1.5">
                    <div className="flex justify-between">
                      <span>Təxmini İcra Müddəti:</span>
                      <span className="font-bold text-white">
                        {serviceEstimate.estimatedDurationHours} saat
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>BDYP Texniki Baxış Uyğunluğu:</span>
                      <span className="font-bold text-emerald-400">
                        {serviceEstimate.passesBdypInspectionAfterService
                          ? '100% Zəmanətli Keçid'
                          : 'AZS Sertifikatı Tələb Olunur'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OFFICIAL BDYP & AZS OPTICAL COMPLIANCE CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 space-y-4">
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <h3 className="text-sm font-bold text-white">
                    Rəsmi BDYP / AZS Fara Optik Uyğunluq Şəhadətnaməsi Yarat
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Dövlət Qeydiyyat Nişanı
                      </label>
                      <input
                        type="text"
                        value={plateNumber}
                        data-testid="cert-plate-input"
                        onChange={(e) => setPlateNumber(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">VIN / Ban Nömrəsi</label>
                      <input
                        type="text"
                        value={vinInput}
                        data-testid="cert-vin-input"
                        onChange={(e) => setVinInput(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateCertificate}
                    data-testid="generate-headlight-cert-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm transition-all cursor-pointer"
                  >
                    Rəsmi BDYP-FARA-2026 Şəhadətnaməsi Formalaşdır
                  </button>
                </div>

                {/* Unified Registry Lookup */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Search className="w-4 h-4 text-amber-400" />
                    Vahid Elektron Reyestr Yoxlaması (Şəhadətnamə və ya Nömrə)
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Məs: BDYP-FARA-2026-10482 və ya 90-AA-777"
                      value={registrySearchQuery}
                      data-testid="headlight-registry-search-input"
                      onChange={(e) => setRegistrySearchQuery(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleSearchRegistry}
                      data-testid="headlight-registry-search-btn"
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
                    >
                      Yoxla
                    </button>
                  </div>

                  {searchAttempted && (
                    <div data-testid="headlight-registry-search-result">
                      {searchedCertificate ? (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1">
                          <div className="font-black text-emerald-300">
                            ✓ Təsdiqləndi: {searchedCertificate.certificateNumber}
                          </div>
                          <div className="text-white">
                            {searchedCertificate.plateNumber} — {searchedCertificate.vehicleTitle}
                          </div>
                          <div className="text-slate-400">
                            {searchedCertificate.installedBulbLabel} ({searchedCertificate.colorTemperatureKelvin}K) •{' '}
                            {searchedCertificate.complianceStatus}
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                          Sorğu üzrə aktiv optik uyğunluq şəhadətnaməsi tapılmadı.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Certificate Preview */}
              <div className="lg:col-span-6">
                {(() => {
                  const certToDisplay = activeCertificate || VERIFIED_HEADLIGHT_CERTIFICATES[0];
                  return (
                    <div
                      data-testid="headlight-certificate-card"
                      className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/40 space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block">
                            DİN BDYPİ & AZS RƏSMİ OPTİK SERTİFİKAT
                          </span>
                          <h4
                            data-testid="active-headlight-cert-number"
                            className="text-base font-black text-white font-mono"
                          >
                            {certToDisplay.certificateNumber}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(certToDisplay.certificateNumber)}
                          data-testid="copy-headlight-cert-btn"
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-amber-300 font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          {copiedCode ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Kopyalandı</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Kodu Kopyala</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 block">Dövlət Nömrə Nişanı:</span>
                          <span className="font-mono font-bold text-white">
                            {certToDisplay.plateNumber}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Nəqliyyat Vasitəsi:</span>
                          <span className="font-bold text-white">{certToDisplay.vehicleTitle}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">İşıq Mənbəyi & Kelvin:</span>
                          <span className="font-bold text-amber-300">
                            {certToDisplay.installedBulbLabel} ({certToDisplay.colorTemperatureKelvin}K)
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Reqloskop Maillik & Qamaşdırma:</span>
                          <span className="font-mono font-bold text-emerald-400">
                            {certToDisplay.measuredSlopePercent}% / {certToDisplay.measuredGlareLux} Lux
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-emerald-400 font-bold">
                          {certToDisplay.complianceStatus}
                        </span>
                        <span className="font-mono text-slate-400">
                          QR: {certToDisplay.qrVerificationHash}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

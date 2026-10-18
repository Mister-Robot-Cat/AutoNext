import React, { useState, useMemo } from 'react';
import { Vehicle, Currency } from '../types/vehicle';
import {
  BodyWrapTypeId,
  AdPlacementTypeId,
  BullbarHitchStatusId,
  BODY_WRAP_PROFILES,
  ADVERTISING_REGULATION_PROFILES,
  EXTERIOR_HARDWARE_PROFILES,
  BODYWORK_SERVICE_PACKAGES,
  BODYWORK_INSPECTION_CENTERS,
  BodyworkComplianceCertificate,
} from '../data/mockBodyworkAdvertisingData';
import {
  evaluateBodyColorWrapCompliance,
  evaluateVehicleAdvertisingCompliance,
  evaluateExteriorHardwareCompliance,
  calculateBodyworkServiceSummary,
  generateBodyworkComplianceCertificate,
  lookupBodyworkCertificate,
  convertFromAzn,
} from '../utils/bodyworkAdvertisingCompliance';
import {
  X,
  Palette,
  Megaphone,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  QrCode,
  Search,
  MapPin,
  Wrench,
  FileCheck,
  Car,
  Layers,
} from 'lucide-react';

interface BodyworkAdvertisingModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: Vehicle | null;
  currency: Currency;
}

type ActiveTab =
  | 'color_wrap'
  | 'advertising_adra'
  | 'farkop_hardware'
  | 'centers'
  | 'certificate';

export const BodyworkAdvertisingModal: React.FC<BodyworkAdvertisingModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  currency,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('color_wrap');

  // Tab 1: Exterior Color & Vinyl Wrap State
  const [wrapType, setWrapType] = useState<BodyWrapTypeId>('oem_factory_paint');
  const [wrapCoveragePercent, setWrapCoveragePercent] = useState<number>(0);
  const [daysSinceWrapApplied, setDaysSinceWrapApplied] = useState<number>(2);
  const [isWrapEndorsedInTexpasport, setIsWrapEndorsedInTexpasport] = useState<boolean>(false);

  // Tab 2: Vehicle Advertising & ADRA State
  const [adPlacementType, setAdPlacementType] = useState<AdPlacementTypeId>('no_advertising');
  const [adCoveragePercent, setAdCoveragePercent] = useState<number>(0);
  const [hasAdraClearance, setHasAdraClearance] = useState<boolean>(true);
  const [isAdEndorsedInTexpasport, setIsAdEndorsedInTexpasport] = useState<boolean>(false);
  const [coversWindowsOrLights, setCoversWindowsOrLights] = useState<boolean>(false);
  const [hasSoundAmplifierOrRoofSign, setHasSoundAmplifierOrRoofSign] = useState<boolean>(false);

  // Tab 3: Farkop, Bullbar ("Kenguryatnik"), Roof Rack & Service Packages State
  const [hardwareProfile, setHardwareProfile] =
    useState<BullbarHitchStatusId>('oem_clean_no_additions');
  const [farkopTrailerSocketWorking, setFarkopTrailerSocketWorking] = useState<boolean>(true);
  const [roofBoxMounted, setRoofBoxMounted] = useState<boolean>(false);
  const [totalVehicleHeightMeters, setTotalVehicleHeightMeters] = useState<number>(2.15);
  const [roofCargoProtrusionMeters, setRoofCargoProtrusionMeters] = useState<number>(0.2);
  const [fuelTankCapSealed, setFuelTankCapSealed] = useState<boolean>(true);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([
    'pkg_mero_color_texpasport',
    'pkg_adra_vehicle_ad_clearance',
  ]);

  // Tab 4: Accredited Centers Filter
  const [selectedCity, setSelectedCity] = useState<string>('Hamısı');
  const [selectedCenterName, setSelectedCenterName] = useState<string>(
    BODYWORK_INSPECTION_CENTERS[0].nameAz
  );

  // Tab 5: Certificate Generation & Lookup
  const [vehiclePlateInput, setVehiclePlateInput] = useState<string>('90-KZ-777');
  const [vinInput, setVinInput] = useState<string>(vehicle?.vin || 'WBS8M9C50J5K41820');
  const [texpasportColorInput, setTexpasportColorInput] = useState<string>(
    'Tünd Boz Tutqun (Frozen Dark Grey Mat — Qeydiyyatda)'
  );
  const [customCertificates, setCustomCertificates] = useState<BodyworkComplianceCertificate[]>([]);
  const [activeCertificate, setActiveCertificate] = useState<BodyworkComplianceCertificate>(() =>
    generateBodyworkComplianceCertificate({
      vehiclePlate: '90-KZ-777',
      vin: vehicle?.vin || 'WBS8M9C50J5K41820',
      vehicleModel: vehicle ? `${vehicle.make} ${vehicle.model}` : 'BMW M5 Competition (F90)',
      recordedTexpasportColorAz: 'Tünd Boz Tutqun (Frozen Dark Grey Mat — Qeydiyyatda)',
      wrapAndPaintStatusAz: '100% Satin Mat Poliuretan (Texpasport Xüsusi Qeydlərdə təsdiqlənib)',
      adraPermitNumber: 'Tələb olunmur (Reklam yoxdur)',
      farkopAndRoofStatusAz: 'Zavod M-buferlər, əlavə kenguryatnik və ya farkop yoxdur',
      inspectingCenterAz: BODYWORK_INSPECTION_CENTERS[0].nameAz,
    })
  );
  const [lookupQuery, setLookupQuery] = useState<string>('');
  const [lookupResult, setLookupResult] = useState<
    BodyworkComplianceCertificate | null | undefined
  >(undefined);

  const colorWrapResult = useMemo(
    () =>
      evaluateBodyColorWrapCompliance({
        wrapType,
        wrapCoveragePercent,
        daysSinceWrapApplied,
        isEndorsedInTexpasport: isWrapEndorsedInTexpasport,
      }),
    [wrapType, wrapCoveragePercent, daysSinceWrapApplied, isWrapEndorsedInTexpasport]
  );

  const advertisingResult = useMemo(
    () =>
      evaluateVehicleAdvertisingCompliance({
        adPlacementType,
        adCoveragePercent,
        hasAdraClearance,
        isEndorsedInTexpasport: isAdEndorsedInTexpasport,
        coversWindowsOrLights,
        hasSoundAmplifierOrRoofSign,
      }),
    [
      adPlacementType,
      adCoveragePercent,
      hasAdraClearance,
      isAdEndorsedInTexpasport,
      coversWindowsOrLights,
      hasSoundAmplifierOrRoofSign,
    ]
  );

  const hardwareResult = useMemo(
    () =>
      evaluateExteriorHardwareCompliance({
        hardwareProfile,
        farkopTrailerSocketWorking,
        roofBoxMounted,
        totalVehicleHeightMeters,
        roofCargoProtrusionMeters,
        fuelTankCapSealed,
      }),
    [
      hardwareProfile,
      farkopTrailerSocketWorking,
      roofBoxMounted,
      totalVehicleHeightMeters,
      roofCargoProtrusionMeters,
      fuelTankCapSealed,
    ]
  );

  const serviceSummary = useMemo(
    () => calculateBodyworkServiceSummary(selectedPackages, currency),
    [selectedPackages, currency]
  );

  const filteredCenters = useMemo(() => {
    if (selectedCity === 'Hamısı') return BODYWORK_INSPECTION_CENTERS;
    return BODYWORK_INSPECTION_CENTERS.filter((c) => c.city === selectedCity);
  }, [selectedCity]);

  if (!isOpen) return null;

  const currencySymbol = currency === 'AZN' ? '₼' : currency === 'USD' ? '$' : '€';

  const togglePackage = (pkgId: string) => {
    setSelectedPackages((prev) =>
      prev.includes(pkgId) ? prev.filter((id) => id !== pkgId) : [...prev, pkgId]
    );
  };

  const handleGenerateCertificate = () => {
    const newCert = generateBodyworkComplianceCertificate({
      vehiclePlate: vehiclePlateInput,
      vin: vinInput,
      vehicleModel: vehicle ? `${vehicle.make} ${vehicle.model}` : 'BMW M5 Competition (F90)',
      recordedTexpasportColorAz: texpasportColorInput,
      wrapAndPaintStatusAz: colorWrapResult.verdictBadgeAz,
      adraPermitNumber: advertisingResult.requiresAdraPermit
        ? 'ADRA-BKI-2026-88410'
        : 'Tələb olunmur (Şəxsi Nəqliyyat)',
      farkopAndRoofStatusAz: hardwareResult.verdictAz,
      inspectingCenterAz: selectedCenterName,
    });
    setCustomCertificates((prev) => [newCert, ...prev]);
    setActiveCertificate(newCert);
  };

  const handleLookup = () => {
    const found = lookupBodyworkCertificate(lookupQuery, customCertificates);
    setLookupResult(found);
    if (found) {
      setActiveCertificate(found);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      data-testid="bodywork-advertising-modal"
    >
      <div
        className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[93vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-purple-500 text-white shadow-lg shadow-fuchsia-500/25">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  BDYP & ADRA Kuzov Rəngi, Vinil Plonka, Reklam və Farkop/Bufer Portalı
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
                  YHQ Maddə 27 • İXM 342.1.8 & 342.2-1
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                30% Rəng/Mat Vinil Texpasport Qeydiyyatı • ADRA Nəqliyyat Reklamı • Kenguryatnik, Farkop & Dam Baqajı Ekspertizası
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            data-testid="close-bodywork-modal"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-950/50 px-4 pt-2 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('color_wrap')}
            data-testid="tab-color-wrap"
            className={`px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap border-b-2 transition-all cursor-pointer ${
              activeTab === 'color_wrap'
                ? 'border-fuchsia-500 text-fuchsia-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>1. Rəng & Vinil (YHQ 27)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('advertising_adra')}
            data-testid="tab-advertising-adra"
            className={`px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap border-b-2 transition-all cursor-pointer ${
              activeTab === 'advertising_adra'
                ? 'border-fuchsia-500 text-fuchsia-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>2. Reklam & ADRA (İXM 342.1.8)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('farkop_hardware')}
            data-testid="tab-farkop-hardware"
            className={`px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap border-b-2 transition-all cursor-pointer ${
              activeTab === 'farkop_hardware'
                ? 'border-fuchsia-500 text-fuchsia-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>3. Farkop, Kenguryatnik & Baqaj</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('centers')}
            data-testid="tab-bodywork-centers"
            className={`px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap border-b-2 transition-all cursor-pointer ${
              activeTab === 'centers'
                ? 'border-fuchsia-500 text-fuchsia-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>4. BDYP MERO & ADRA Mərkəzləri</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('certificate')}
            data-testid="tab-bodywork-certificate"
            className={`px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap border-b-2 transition-all cursor-pointer ${
              activeTab === 'certificate'
                ? 'border-fuchsia-500 text-fuchsia-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>5. BDYP-KUZ-2026 Sertifikatı</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* TAB 1: COLOR & VINYL WRAP AUDITOR */}
          {activeTab === 'color_wrap' && (
            <div className="space-y-6">
              {/* Quick Scenario Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <button
                  type="button"
                  data-testid="preset-wrap-clear-ppf"
                  onClick={() => {
                    setWrapType('clear_ppf_shield');
                    setWrapCoveragePercent(100);
                    setDaysSinceWrapApplied(60);
                    setIsWrapEndorsedInTexpasport(false);
                  }}
                  className="p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-800 border border-emerald-500/30 text-left text-xs transition-all cursor-pointer"
                >
                  <div className="font-bold text-emerald-400 mb-0.5">Şəffaf Qoruyucu PPF (0 ₼)</div>
                  <div className="text-slate-400 text-[11px]">
                    Zavod rəngini dəyişmir, MERO qeydiyyatı tələb olunmur
                  </div>
                </button>

                <button
                  type="button"
                  data-testid="preset-wrap-black-roof"
                  onClick={() => {
                    setWrapType('two_tone_roof_under30');
                    setWrapCoveragePercent(22);
                    setDaysSinceWrapApplied(30);
                    setIsWrapEndorsedInTexpasport(false);
                  }}
                  className="p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-800 border border-sky-500/30 text-left text-xs transition-all cursor-pointer"
                >
                  <div className="font-bold text-sky-400 mb-0.5">Qara Panoram Dam (22% &lt; 30%)</div>
                  <div className="text-slate-400 text-[11px]">
                    30% səth həddini aşmadığı üçün Texpasport yenilənmir
                  </div>
                </button>

                <button
                  type="button"
                  data-testid="preset-wrap-undeclared-matte"
                  onClick={() => {
                    setWrapType('full_matte_or_color_wrap');
                    setWrapCoveragePercent(85);
                    setDaysSinceWrapApplied(25);
                    setIsWrapEndorsedInTexpasport(false);
                  }}
                  className="p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-800 border border-amber-500/30 text-left text-xs transition-all cursor-pointer"
                >
                  <div className="font-bold text-amber-400 mb-0.5">
                    Sənədsiz Tam Mat Vinil (150 ₼)
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    &gt;30% sahə + 10 gün ötüb → İXM 342.2-1 (150 AZN)
                  </div>
                </button>

                <button
                  type="button"
                  data-testid="preset-wrap-operative-illegal"
                  onClick={() => {
                    setWrapType('prohibited_operative_livery');
                    setWrapCoveragePercent(50);
                    setDaysSinceWrapApplied(5);
                    setIsWrapEndorsedInTexpasport(false);
                  }}
                  className="p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-800 border border-rose-500/30 text-left text-xs transition-all cursor-pointer"
                >
                  <div className="font-bold text-rose-400 mb-0.5">
                    Operativ / Polis Zolağı (800 ₼)
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    YHQ Əlavə 1 Bənd 7.14 & İXM 342.9 qadağası
                  </div>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Configurator */}
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-fuchsia-400" />
                    <span>Kuzov Boya / Vinil Plonka Konfiquratoru</span>
                  </h3>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">
                      Örtük və ya Rəng Dəyişikliyi Növü
                    </label>
                    <select
                      value={wrapType}
                      onChange={(e) => {
                        const nextId = e.target.value as BodyWrapTypeId;
                        setWrapType(nextId);
                        const found = BODY_WRAP_PROFILES.find((p) => p.id === nextId);
                        if (found) setWrapCoveragePercent(found.coveragePercentDefault);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm"
                    >
                      {BODY_WRAP_PROFILES.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nameAz}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Örtülən Kuzov Sahəsi (%)</span>
                        <span className="font-bold text-fuchsia-400">{wrapCoveragePercent}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={wrapCoveragePercent}
                        onChange={(e) => setWrapCoveragePercent(Number(e.target.value))}
                        className="w-full accent-fuchsia-500"
                      />
                      <span className="text-[10px] text-slate-500">
                        Normativ hədd: &gt;30% olduqda Texpasport yenilənməlidir
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Quraşdırmadan Keçən Müddət</span>
                        <span className="font-bold text-white">{daysSinceWrapApplied} gün</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={60}
                        value={daysSinceWrapApplied}
                        onChange={(e) => setDaysSinceWrapApplied(Number(e.target.value))}
                        className="w-full accent-fuchsia-500"
                      />
                      <span className="text-[10px] text-slate-500">
                        YHQ Maddə 27: 10 təqvim günü ərzində MERO qeydiyyatı
                      </span>
                    </div>
                  </div>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isWrapEndorsedInTexpasport}
                      onChange={(e) => setIsWrapEndorsedInTexpasport(e.target.checked)}
                      data-testid="checkbox-wrap-texpasport"
                      className="rounded accent-fuchsia-500"
                    />
                    <span className="text-xs text-slate-200 font-medium">
                      Yeni rəng çaları / «Tutqun (Mat)» / «İkirəngli» artıq Texpasporta yazılıb
                    </span>
                  </label>
                </div>

                {/* Right Verdict Card */}
                <div
                  data-testid="color-wrap-verdict-card"
                  className={`p-5 rounded-2xl border space-y-4 ${
                    colorWrapResult.isCompliant
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : 'bg-rose-950/25 border-rose-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {colorWrapResult.isCompliant ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                      ) : (
                        <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <h4 className="font-black text-white text-sm sm:text-base">
                          {colorWrapResult.verdictBadgeAz}
                        </h4>
                        <p className="text-xs text-slate-400">
                          Texpasport qeydi: {colorWrapResult.recommendedTexpasportNoteAz}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-center">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase block">
                        İXM Cərimə Riski
                      </span>
                      <span
                        data-testid="wrap-fine-amount"
                        className="text-base font-black text-rose-400"
                      >
                        {colorWrapResult.fineAzn} ₼
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase block">
                        MERO Dövlət Rüsumu
                      </span>
                      <span
                        data-testid="wrap-duty-amount"
                        className="text-base font-black text-fuchsia-400"
                      >
                        {colorWrapResult.meroStateDutyAzn} ₼
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-slate-400 uppercase block">
                        30% Səth Həddi
                      </span>
                      <span className="text-xs font-bold text-white">
                        {colorWrapResult.exceeds30PercentThreshold
                          ? 'Aşılıb (>30%)'
                          : 'Normada (≤30%)'}
                      </span>
                    </div>
                  </div>

                  {colorWrapResult.violationsAz.length > 0 && (
                    <div className="space-y-1.5 text-xs text-rose-300 bg-rose-950/40 p-3 rounded-xl border border-rose-800/40">
                      {colorWrapResult.violationsAz.map((v, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                          <span>{v}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-1 text-xs text-slate-300">
                    {colorWrapResult.recommendationsAz.map((rec, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-fuchsia-400 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VEHICLE ADVERTISING & ADRA AUDITOR */}
          {activeTab === 'advertising_adra' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  data-testid="preset-ad-compliant-doors"
                  onClick={() => {
                    setAdPlacementType('side_doors_compliant');
                    setAdCoveragePercent(35);
                    setHasAdraClearance(true);
                    setIsAdEndorsedInTexpasport(false);
                    setCoversWindowsOrLights(false);
                    setHasSoundAmplifierOrRoofSign(false);
                  }}
                  className="p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-800 border border-emerald-500/30 text-left text-xs cursor-pointer"
                >
                  <div className="font-bold text-emerald-400 mb-0.5">
                    Qanuni Yan Qapı Brendinqi (0 ₼)
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    &lt;50% sahə + ADRA razılaşması + şüşələr açıqdır
                  </div>
                </button>

                <button
                  type="button"
                  data-testid="preset-ad-over50-unregistered"
                  onClick={() => {
                    setAdPlacementType('full_body_over50_unregistered');
                    setAdCoveragePercent(75);
                    setHasAdraClearance(false);
                    setIsAdEndorsedInTexpasport(false);
                    setCoversWindowsOrLights(false);
                    setHasSoundAmplifierOrRoofSign(false);
                  }}
                  className="p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-800 border border-amber-500/30 text-left text-xs cursor-pointer"
                >
                  <div className="font-bold text-amber-400 mb-0.5">
                    Tam Kuzov Reklam (&gt;50% Sənədsiz — 50 ₼)
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    İXM 342.1.8 (Sürücü 50 ₼ / Vəzifəli şəxs 150 ₼)
                  </div>
                </button>

                <button
                  type="button"
                  data-testid="preset-ad-window-obstructing"
                  onClick={() => {
                    setAdPlacementType('window_or_light_obstructing');
                    setAdCoveragePercent(60);
                    setHasAdraClearance(false);
                    setIsAdEndorsedInTexpasport(false);
                    setCoversWindowsOrLights(true);
                    setHasSoundAmplifierOrRoofSign(true);
                  }}
                  className="p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-800 border border-rose-500/30 text-left text-xs cursor-pointer"
                >
                  <div className="font-bold text-rose-400 mb-0.5">
                    Şüşə Örtən & Səsucaldan Reklam (Qadağan)
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Görünüş məhdudiyyəti + Qanun Maddə 26.5 pozuntusu
                  </div>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-fuchsia-400" />
                    <span>ADRA & BDYP Nəqliyyat Reklamı Parametrləri</span>
                  </h3>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">
                      Reklam Yerləşdirmə Sxemi
                    </label>
                    <select
                      value={adPlacementType}
                      onChange={(e) => setAdPlacementType(e.target.value as AdPlacementTypeId)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm"
                    >
                      {ADVERTISING_REGULATION_PROFILES.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nameAz}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Reklamın Kuzov Səthində Payı (%)</span>
                      <span className="font-bold text-fuchsia-400">{adCoveragePercent}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={adCoveragePercent}
                      onChange={(e) => setAdCoveragePercent(Number(e.target.value))}
                      className="w-full accent-fuchsia-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasAdraClearance}
                        onChange={(e) => setHasAdraClearance(e.target.checked)}
                        className="rounded accent-fuchsia-500"
                      />
                      <span>ADRA (Dövlət Reklam Agentliyi) eskiz razılaşması mövcuddur</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAdEndorsedInTexpasport}
                        onChange={(e) => setIsAdEndorsedInTexpasport(e.target.checked)}
                        className="rounded accent-fuchsia-500"
                      />
                      <span>Texpasportda «Reklamlı / Kombinə edilmiş» qeydi var (&gt;50% üçün)</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-rose-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={coversWindowsOrLights}
                        onChange={(e) => setCoversWindowsOrLights(e.target.checked)}
                        className="rounded accent-rose-500"
                      />
                      <span>Alın / ön yan şüşələri və ya faraları örtür</span>
                    </label>
                  </div>
                </div>

                <div
                  data-testid="advertising-verdict-card"
                  className={`p-5 rounded-2xl border space-y-4 ${
                    advertisingResult.isCompliant
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : 'bg-rose-950/25 border-rose-500/40'
                  }`}
                >
                  <h4 className="font-black text-white text-sm sm:text-base">
                    {advertisingResult.verdictTitleAz}
                  </h4>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase block">
                        Sürücü Cəriməsi (İXM 342.1.8)
                      </span>
                      <span
                        data-testid="ad-driver-fine"
                        className="text-base font-black text-rose-400"
                      >
                        {advertisingResult.driverFineAzn} ₼
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase block">
                        Vəzifəli Şəxs (İXM 348)
                      </span>
                      <span
                        data-testid="ad-official-fine"
                        className="text-base font-black text-amber-400"
                      >
                        {advertisingResult.officialEntityFineAzn} ₼
                      </span>
                    </div>
                  </div>

                  {advertisingResult.violationsAz.length > 0 && (
                    <div className="space-y-1.5 text-xs text-rose-300 bg-rose-950/40 p-3 rounded-xl border border-rose-800/40">
                      {advertisingResult.violationsAz.map((v, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                          <span>{v}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-1 text-xs text-slate-300">
                    {advertisingResult.recommendationsAz.map((rec, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-fuchsia-400 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FARKOP, KENGURYATNIK & ROOF CARGO STAND + SERVICE CALCULATOR */}
          {activeTab === 'farkop_hardware' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  data-testid="preset-hardware-removable-farkop"
                  onClick={() => {
                    setHardwareProfile('removable_certified_farkop');
                    setFarkopTrailerSocketWorking(true);
                    setRoofBoxMounted(true);
                    setTotalVehicleHeightMeters(2.25);
                    setRoofCargoProtrusionMeters(0.3);
                    setFuelTankCapSealed(true);
                  }}
                  className="p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-800 border border-emerald-500/30 text-left text-xs cursor-pointer"
                >
                  <div className="font-bold text-emerald-400 mb-0.5">
                    Sertifikatlı Farkop + Thule Dam Baqajı (0 ₼)
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    DQN açıqdır, 7-pin rozetka işləkdir, hündürlük ≤4.0m
                  </div>
                </button>

                <button
                  type="button"
                  data-testid="preset-hardware-blocking-farkop"
                  onClick={() => {
                    setHardwareProfile('fixed_farkop_blocking_plate');
                    setFarkopTrailerSocketWorking(true);
                    setRoofBoxMounted(false);
                    setFuelTankCapSealed(true);
                  }}
                  className="p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-800 border border-amber-500/30 text-left text-xs cursor-pointer"
                >
                  <div className="font-bold text-amber-400 mb-0.5">
                    DQN Nömrəni Örtən Sabit Farkop (40 ₼)
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    İXM Maddə 342.1.3 — Qoşqusuz topuz nömrəni gizlədir
                  </div>
                </button>

                <button
                  type="button"
                  data-testid="preset-hardware-kenguryatnik"
                  onClick={() => {
                    setHardwareProfile('unregistered_steel_kenguryatnik');
                    setFarkopTrailerSocketWorking(false);
                    setRoofBoxMounted(true);
                    setTotalVehicleHeightMeters(4.25);
                    setFuelTankCapSealed(false);
                  }}
                  className="p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-800 border border-rose-500/30 text-left text-xs cursor-pointer"
                >
                  <div className="font-bold text-rose-400 mb-0.5">
                    Sənədsiz Dəmir «Kenguryatnik» (150 ₼)
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    YHQ Əlavə 1 Bənd 7.11 & İXM 342.2-1 qadağası
                  </div>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <h3 className="font-bold text-white text-sm">
                    Farkop, Qoruyucu Bufer & Dam Baqajı Stendi
                  </h3>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">
                      Bufer və Qoşqu Qarmağı («Farkop») Konfiqurasiyası
                    </label>
                    <select
                      value={hardwareProfile}
                      onChange={(e) => setHardwareProfile(e.target.value as BullbarHitchStatusId)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm"
                    >
                      {EXTERIOR_HARDWARE_PROFILES.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nameAz}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={farkopTrailerSocketWorking}
                        onChange={(e) => setFarkopTrailerSocketWorking(e.target.checked)}
                        className="rounded accent-fuchsia-500"
                      />
                      <span>7/13-pin qoşqu tormoz və dönmə işıq rozetkası işləkdir</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={fuelTankCapSealed}
                        onChange={(e) => setFuelTankCapSealed(e.target.checked)}
                        className="rounded accent-fuchsia-500"
                      />
                      <span>Yanacaq çəninin qapağı mövcuddur və hermetik bağlanır (Bənd 6.1)</span>
                    </label>
                  </div>

                  <div
                    data-testid="hardware-verdict-card"
                    className={`p-4 rounded-xl border ${
                      hardwareResult.isCompliant
                        ? 'bg-emerald-950/25 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    <div className="font-black text-sm mb-1">{hardwareResult.verdictAz}</div>
                    {hardwareResult.violationsAz.map((v, i) => (
                      <div key={i} className="text-xs mt-1">
                        • {v}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Service Package Cost Calculator */}
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-sm">
                      MERO Qeydiyyat, ADRA & Kuzov Xidmət Kalkulyatoru
                    </h3>
                    <span
                      data-testid="bodywork-service-total"
                      className="px-3 py-1 rounded-xl bg-fuchsia-500/20 text-fuchsia-300 font-black text-sm border border-fuchsia-500/30"
                    >
                      {serviceSummary.totalInCurrency} {currencySymbol}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {BODYWORK_SERVICE_PACKAGES.map((pkg) => {
                      const isSelected = selectedPackages.includes(pkg.id);
                      const pkgTotal = convertFromAzn(
                        pkg.stateDutyOrPartsAzn + pkg.laborCostAzn,
                        currency
                      );
                      return (
                        <label
                          key={pkg.id}
                          className={`flex items-start justify-between gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-fuchsia-950/25 border-fuchsia-500/50 text-white'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => togglePackage(pkg.id)}
                              className="mt-0.5 rounded accent-fuchsia-500"
                            />
                            <div>
                              <div className="font-bold">{pkg.nameAz}</div>
                              <div className="text-[11px] text-slate-400">{pkg.descriptionAz}</div>
                            </div>
                          </div>
                          <span className="font-black text-fuchsia-400 whitespace-nowrap">
                            {pkgTotal} {currencySymbol}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACCREDITED BDYP MERO & ADRA CENTERS */}
          {activeTab === 'centers' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {(['Hamısı', 'Bakı', 'Xırdalan', 'Sumqayıt', 'Gəncə'] as const).map((city) => (
                  <button
                    key={city}
                    type="button"
                    data-testid={`filter-bodywork-city-${city}`}
                    onClick={() => setSelectedCity(city)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedCity === city
                        ? 'bg-fuchsia-600 text-white border-fuchsia-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCenters.map((center) => (
                  <div
                    key={center.id}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
                          {center.authorityType} • {center.city}
                        </span>
                        <h4 className="font-bold text-white text-sm mt-1.5">{center.nameAz}</h4>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">{center.addressAz}</p>
                    <div className="text-[11px] text-slate-300 space-y-1">
                      {center.servicesAz.map((srv, idx) => (
                        <div key={idx}>• {srv}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: OFFICIAL BDYP-KUZ-2026 CERTIFICATE & LOOKUP */}
          {activeTab === 'certificate' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-fuchsia-400" />
                    <span>Yeni BDYP-KUZ-2026 Rəng, Vinil & Reklam Şəhadətnaməsi</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Dövlət Nömrə Nişanı</label>
                      <input
                        type="text"
                        data-testid="bodywork-cert-plate-input"
                        value={vehiclePlateInput}
                        onChange={(e) => setVehiclePlateInput(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Kuzov / Şassi VIN</label>
                      <input
                        type="text"
                        value={vinInput}
                        onChange={(e) => setVinInput(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Texpasport Rəng və Xüsusi Qeyd Sətri
                    </label>
                    <input
                      type="text"
                      value={texpasportColorInput}
                      onChange={(e) => setTexpasportColorInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>

                  <button
                    type="button"
                    data-testid="generate-bodywork-cert-btn"
                    onClick={handleGenerateCertificate}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer"
                  >
                    Rəsmi BDYP-KUZ-2026 Sertifikatı Tərtib Et
                  </button>
                </div>

                {/* Unified Registry Lookup */}
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Search className="w-4 h-4 text-fuchsia-400" />
                    <span>Vahid BDYP & ADRA Kuzov Reyestri Axtarışı</span>
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      data-testid="bodywork-lookup-input"
                      value={lookupQuery}
                      onChange={(e) => setLookupQuery(e.target.value)}
                      placeholder="Məs: 90-KZ-777, 77-AD-404 və ya BDYP-KUZ-2026-63108"
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                    />
                    <button
                      type="button"
                      data-testid="bodywork-lookup-btn"
                      onClick={handleLookup}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-fuchsia-300 font-bold text-xs cursor-pointer"
                    >
                      Yoxla
                    </button>
                  </div>
                  {lookupResult === null && (
                    <p className="text-xs text-rose-400">
                      Sorğuya uyğun qeydiyyat şəhadətnaməsi tapılmadı.
                    </p>
                  )}
                </div>
              </div>

              {/* Certificate Preview Card */}
              <div
                data-testid="bodywork-certificate-card"
                className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-fuchsia-950/30 border border-fuchsia-500/40 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-400 block">
                      AZƏRBAYCAN RESPUBLİKASI DİN BDYPİ & ADRA
                    </span>
                    <h4 className="text-base font-black text-white">
                      {activeCertificate.certificateNumber}
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {activeCertificate.overallStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Dövlət Qeydiyyat Nişanı</span>
                    <strong className="text-white font-mono text-sm">
                      {activeCertificate.vehiclePlate}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">VIN / Kuzov №</span>
                    <strong className="text-white font-mono">{activeCertificate.vin}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block">Texpasport Rəng Qeydi</span>
                    <strong className="text-fuchsia-300">
                      {activeCertificate.recordedTexpasportColorAz}
                    </strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block">ADRA Reklam İcazə Nömrəsi</span>
                    <strong className="text-white">{activeCertificate.adraPermitNumber}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block">Farkop, Bufer & Dam Baqajı Rəyi</span>
                    <strong className="text-emerald-300">
                      {activeCertificate.farkopAndRoofStatusAz}
                    </strong>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>QR Hash: {activeCertificate.verificationHash}</span>
                  <span>Etibarlıdır: {activeCertificate.expiryDate}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { Currency, Language, Vehicle } from '../types/vehicle';
import {
  AynaElectronicEntryPass,
  BakuEntrySeason,
  BakuEntryVehicleType,
  BusLaneLineMarking,
  BusLaneManeuverIntent,
  BusLaneOperatingRegime,
  BusLaneVehicleCategory,
  EntityLegalType,
  auditBusLaneManeuver,
  convertTrafficRegimeCurrency,
  evaluateBakuEntryAndWimLoad,
  generateAynaElectronicEntryPass,
  inferBakuEntryVehicleType,
  isBusLaneActiveAtTime,
  validateCarrierVoenOrFin,
} from '../utils/specialTrafficRegime';
import {
  BAKU_BUS_LANE_CORRIDORS,
  BAKU_ENTRY_CHECKPOINTS,
  MOCK_AYNA_ENTRY_PASSES,
} from '../data/mockSpecialTrafficData';
import {
  X,
  Bus,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Scale,
  MapPin,
  FileCheck,
  Copy,
  Check,
  Search,
  AlertTriangle,
  Camera,
  Truck,
  CheckCircle2,
  Navigation,
  QrCode,
} from 'lucide-react';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';

interface SpecialTrafficRegimeModalProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  currency: Currency;
  lang: Language;
  onClose: () => void;
}

type ModalTab = 'bus_lane_auditor' | 'corridors_radar' | 'entry_and_wim' | 'e_entry_pass';

export const SpecialTrafficRegimeModal: React.FC<SpecialTrafficRegimeModalProps> = ({
  isOpen,
  vehicle,
  currency,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('bus_lane_auditor');

  // Tab 1: Bus Lane Maneuver & Fine Auditor (İXM Maddə 327.1-1)
  const [corridorRegime, setCorridorRegime] = useState<BusLaneOperatingRegime>('24_7_continuous');
  const [hourOfDay, setHourOfDay] = useState<number>(14);
  const [isWeekend, setIsWeekend] = useState<boolean>(false);
  const [vehicleCategory, setVehicleCategory] = useState<BusLaneVehicleCategory>('private_passenger');
  const [lineMarkingCrossed, setLineMarkingCrossed] =
    useState<BusLaneLineMarking>('broken_dashed_1_11');
  const [maneuverIntent, setManeuverIntent] = useState<BusLaneManeuverIntent>(
    'right_turn_into_courtyard_or_street'
  );
  const [applyEarly50Discount, setApplyEarly50Discount] = useState<boolean>(true);

  // Tab 2: Baku Corridors Radar
  const [corridorSearch, setCorridorSearch] = useState<string>('');
  const [corridorRegimeFilter, setCorridorRegimeFilter] = useState<string>('ALL');

  // Tab 3: Baku Daytime Entry & WIM Electronic Scale Calculator
  const [entryVehicleType, setEntryVehicleType] = useState<BakuEntryVehicleType>(() =>
    inferBakuEntryVehicleType(vehicle)
  );
  const [grossWeightTons, setGrossWeightTons] = useState<number>(2.2);
  const [singleAxleTons, setSingleAxleTons] = useState<number>(1.4);
  const [season, setSeason] = useState<BakuEntrySeason>('summer_may_to_oct');
  const [entryHour, setEntryHour] = useState<number>(11);
  const [hasAynaPass, setHasAynaPass] = useState<boolean>(false);
  const [entityType, setEntityType] = useState<EntityLegalType>('individual_driver');

  // Tab 4: AYNA Electronic Entry Pass Generator & Registry Lookup
  const [plateNumber, setPlateNumber] = useState<string>(vehicle?.plateNumber || '99-AA-001');
  const [vinCode, setVinCode] = useState<string>(vehicle?.vin || 'JTDBR32E800192841');
  const [carrierName, setCarrierName] = useState<string>('"Abşeron Logistika & Təchizat" MMC');
  const [voenOrFin, setVoenOrFin] = useState<string>('1405928411');
  const [cargoCategory, setCargoCategory] = useState<string>(
    'Şəhərdaxili ticarət və ərzaq təchizatı'
  );
  const [selectedCheckpointId, setSelectedCheckpointId] = useState<string>(
    BAKU_ENTRY_CHECKPOINTS[0].id
  );
  const [authorizedCorridor, setAuthorizedCorridor] = useState<string>(
    'Moskva pr. → Ziya Bünyadov pr. → Babək pr. Anbar Terminalı'
  );
  const [generatedPass, setGeneratedPass] = useState<AynaElectronicEntryPass | null>(null);
  const [registrySearchQuery, setRegistrySearchQuery] = useState<string>('AYNA-EB-2026-84120');

  const [copiedText, copyToClipboard] = useCopyToClipboard();

  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₼';
  const formatAmount = (azn: number) => {
    const val = convertTrafficRegimeCurrency(azn, currency);
    return `${val.toLocaleString('en-US', { minimumFractionDigits: currency === 'AZN' ? 0 : 2, maximumFractionDigits: 2 })} ${currencySymbol}`;
  };

  const busLaneAudit = useMemo(() => {
    return auditBusLaneManeuver({
      corridorRegime,
      hourOfDay,
      isWeekend,
      vehicleCategory,
      lineMarkingCrossed,
      maneuverIntent,
      applyEarly50Discount,
    });
  }, [
    corridorRegime,
    hourOfDay,
    isWeekend,
    vehicleCategory,
    lineMarkingCrossed,
    maneuverIntent,
    applyEarly50Discount,
  ]);

  const filteredCorridors = useMemo(() => {
    return BAKU_BUS_LANE_CORRIDORS.filter((c) => {
      const matchesSearch =
        c.corridorName.toLowerCase().includes(corridorSearch.toLowerCase()) ||
        c.district.toLowerCase().includes(corridorSearch.toLowerCase()) ||
        c.segmentDescription.toLowerCase().includes(corridorSearch.toLowerCase());
      const matchesRegime =
        corridorRegimeFilter === 'ALL' || c.regime === corridorRegimeFilter;
      return matchesSearch && matchesRegime;
    });
  }, [corridorSearch, corridorRegimeFilter]);

  const entryAndWimAudit = useMemo(() => {
    return evaluateBakuEntryAndWimLoad({
      vehicleType: entryVehicleType,
      grossVehicleWeightTons: grossWeightTons,
      maxSingleAxleLoadTons: singleAxleTons,
      season,
      entryHour,
      hasAynaElectronicEntryPass: hasAynaPass,
      entityType,
    });
  }, [
    entryVehicleType,
    grossWeightTons,
    singleAxleTons,
    season,
    entryHour,
    hasAynaPass,
    entityType,
  ]);

  const isVoenOrFinValid = useMemo(() => validateCarrierVoenOrFin(voenOrFin), [voenOrFin]);

  const registryLookupResult = useMemo(() => {
    const q = registrySearchQuery.trim().toUpperCase();
    if (!q) return null;
    const allPasses = generatedPass
      ? [generatedPass, ...MOCK_AYNA_ENTRY_PASSES]
      : MOCK_AYNA_ENTRY_PASSES;
    return (
      allPasses.find(
        (p) =>
          p.passNumber.toUpperCase() === q ||
          p.plateNumber.toUpperCase() === q ||
          p.voenOrFin.toUpperCase() === q
      ) || null
    );
  }, [registrySearchQuery, generatedPass]);

  if (!isOpen) return null;

  const handleGeneratePass = () => {
    const checkpoint =
      BAKU_ENTRY_CHECKPOINTS.find((cp) => cp.id === selectedCheckpointId) ||
      BAKU_ENTRY_CHECKPOINTS[0];
    const pass = generateAynaElectronicEntryPass({
      plateNumber,
      vin: vinCode,
      vehicleTitle: vehicle?.title || 'Toyota Camry 2.5 Hybrid',
      carrierName,
      voenOrFin,
      cargoCategory,
      grossWeightTons,
      entryCheckpointName: checkpoint.name,
      authorizedCorridor,
      validTimeWindow:
        'Xüsusi Gündüz Pəncərəsi (10:00 – 16:00) & Gecə Rejimi (22:00 – 07:00)',
    });
    setGeneratedPass(pass);
    setRegistrySearchQuery(pass.passNumber);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      data-testid="special-traffic-regime-modal"
    >
      <div
        className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-sky-500/25">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  AYNA & BDYP Xüsusi Hərəkət Rejimi, Avtobus Zolaqları və Bakı Giriş Portalı
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  İXM Maddə 327.1-1 & Maddə 353
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Avtobus zolağı (100 AZN & 2 bal) manevr auditoru, Bakı küçələri saat rejimi, Elektron Tərəzi (WIM) və AYNA E-Buraxılış sistemi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            data-testid="close-special-traffic-modal-btn"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-slate-950/50 border-b border-slate-800 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('bus_lane_auditor')}
            data-testid="tab-bus-lane-auditor"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'bus_lane_auditor'
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Bus className="w-4 h-4" />
            <span>1. Avtobus Zolağı Auditoru (100 ₼ / 2 Bal)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('corridors_radar')}
            data-testid="tab-corridors-radar"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'corridors_radar'
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>2. Bakı Zolaqlar Radarı ({BAKU_BUS_LANE_CORRIDORS.length} Prospekt)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('entry_and_wim')}
            data-testid="tab-entry-and-wim"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'entry_and_wim'
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>3. Bakı Giriş Rejimi & Elektron Tərəzi (WIM)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('e_entry_pass')}
            data-testid="tab-e-entry-pass"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'e_entry_pass'
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>4. AYNA E-Buraxılış Vərəqəsi & Reyestr</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: BUS LANE AUDITOR */}
          {activeTab === 'bus_lane_auditor' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Configurator */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-sky-400" />
                    <span>Avtobus Zolağı Manevr və Saat Parametrləri (YHQ Maddə 48 & İXM 327.1-1)</span>
                  </h3>

                  {/* Corridor Regime Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      1. Küçə/Prospekt üzrə 5.9 Nişanının Fəaliyyət Rejimi
                    </label>
                    <select
                      value={corridorRegime}
                      onChange={(e) =>
                        setCorridorRegime(e.target.value as BusLaneOperatingRegime)
                      }
                      data-testid="select-corridor-regime"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm"
                    >
                      <option value="24_7_continuous">
                        24/7 Fasiləsiz Rejim (Heydər Əliyev pr., Babək pr., Neftçilər pr.)
                      </option>
                      <option value="peak_hours_07_20">
                        7.5.4 Saat Lövhəsi: Hər gün 07:00 – 20:00 (Tbilisi pr., Yusif Səfərov küç.)
                      </option>
                      <option value="weekdays_only_07_20">
                        7.5.2 + 7.5.4 İş Günləri: 07:00 – 20:00 (Ziya Bünyadov pr.)
                      </option>
                      <option value="morning_evening_split">
                        Pik Saatlar: 07:00–10:00 və 17:00–20:00 (Mikayıl Müşfiq küç.)
                      </option>
                    </select>
                  </div>

                  {/* Hour Slider & Weekend Toggle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400 font-semibold">Hərəkət Saatı:</span>
                        <span
                          className="font-bold text-sky-400"
                          data-testid="bus-lane-hour-display"
                        >
                          {String(hourOfDay).padStart(2, '0')}:00
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={23}
                        value={hourOfDay}
                        onChange={(e) => setHourOfDay(Number(e.target.value))}
                        data-testid="slider-bus-lane-hour"
                        className="w-full accent-sky-500"
                      />
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isWeekend}
                          onChange={(e) => setIsWeekend(e.target.checked)}
                          data-testid="checkbox-is-weekend"
                          className="rounded border-slate-700 bg-slate-900 text-sky-500"
                        />
                        <span>Şənbə / Bazar (İstirahət günü)</span>
                      </label>
                    </div>
                  </div>

                  {/* Vehicle Category */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      2. Nəqliyyat Vasitəsinin Kateqoriyası
                    </label>
                    <select
                      value={vehicleCategory}
                      onChange={(e) =>
                        setVehicleCategory(e.target.value as BusLaneVehicleCategory)
                      }
                      data-testid="select-bus-lane-vehicle-category"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm"
                    >
                      <option value="private_passenger">
                        Minik və ya SUV Avtomobili (Fərdi sürücü)
                      </option>
                      <option value="licensed_ayna_taxi">
                        AYNA Buraxılış Vərəqəli Rəsmi Taksi
                      </option>
                      <option value="regular_route_bus">
                        Müntəzəm Marşrut Avtobusu (BakuBus / AYNA)
                      </option>
                      <option value="emergency_operational">
                        Operativ Nəqliyyat Vasitəsi (102 Polis, 103 Təcili Yardım, 112 FHN)
                      </option>
                      <option value="bicycle_or_moped">
                        Velosiped və ya Moped (YHQ Maddə 48.1)
                      </option>
                    </select>
                  </div>

                  {/* Horizontal Line Marking Crossed */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      3. Kəsilən Üfüqi Nişanlanma Xətti (1.1 Bütöv vs 1.11 Qırıq-qırıq)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setLineMarkingCrossed('broken_dashed_1_11')}
                        data-testid="btn-line-dashed"
                        className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          lineMarkingCrossed === 'broken_dashed_1_11'
                            ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="font-bold">1.11 Qırıq-Qırıq Xətt (Dönmə Cibi)</div>
                        <div className="text-[11px] opacity-80 mt-0.5">
                          Yolayrıcı və həyət girişlərinə 30-50m qalmış kəsilən xətt
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLineMarkingCrossed('solid_continuous_1_1')}
                        data-testid="btn-line-solid"
                        className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          lineMarkingCrossed === 'solid_continuous_1_1'
                            ? 'bg-rose-500/15 border-rose-500 text-rose-300 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="font-bold">1.1 Bütöv Ayırıcı Xətt</div>
                        <div className="text-[11px] opacity-80 mt-0.5">
                          Avtobus zolağını əsas axından ayıran kəsilməz bütöv xətt
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Maneuver Intent */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      4. Sürücünün Manevr Məqsədi (YHQ Maddə 48.2)
                    </label>
                    <select
                      value={maneuverIntent}
                      onChange={(e) =>
                        setManeuverIntent(e.target.value as BusLaneManeuverIntent)
                      }
                      data-testid="select-maneuver-intent"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm"
                    >
                      <option value="right_turn_into_courtyard_or_street">
                        Sağa dönmə manevri (Yan küçəyə, həyətə və ya YDM-ə giriş)
                      </option>
                      <option value="merge_out_from_side_street">
                        Yan küçədən sağa dönərək əsas axına qoşulma
                      </option>
                      <option value="passenger_drop_off_at_dashed_pocket">
                        1.11 qırıq xətt cibində avtobusa mane olmadan sərnişin mindirmə/düşürmə
                      </option>
                      <option value="straight_through_traffic_bypass">
                        Tıxacı yan keçmək və ya yolayrıcını avtobus zolağı ilə düzünə keçmək
                      </option>
                    </select>
                  </div>

                  {/* Early 50% Discount Checkbox */}
                  <div className="pt-1">
                    <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={applyEarly50Discount}
                        onChange={(e) => setApplyEarly50Discount(e.target.checked)}
                        data-testid="checkbox-bus-lane-discount"
                        className="rounded border-slate-700 bg-slate-900 text-sky-500"
                      />
                      <span>
                        30 təqvim günü ərzində AsanPay / HÖP ödənişi (50% güzəşt: 100 ₼ → 50 ₼)
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Audit Verdict */}
              <div className="lg:col-span-5 space-y-4">
                <div
                  data-testid="bus-lane-audit-verdict-card"
                  className={`p-5 rounded-2xl border space-y-4 ${
                    busLaneAudit.isViolation
                      ? 'bg-rose-950/30 border-rose-500/40'
                      : 'bg-emerald-950/30 border-emerald-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {busLaneAudit.isViolation ? (
                        <ShieldAlert className="w-6 h-6 text-rose-400 flex-shrink-0" />
                      ) : (
                        <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                      )}
                      <div>
                        <span
                          data-testid="bus-lane-verdict-code"
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            busLaneAudit.isViolation
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {busLaneAudit.verdictCode}
                        </span>
                        <h4
                          className="text-sm sm:text-base font-black text-white mt-1"
                          data-testid="bus-lane-verdict-title"
                        >
                          {busLaneAudit.verdictTitle}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Statutory Fine & Points Box */}
                  <div className="grid grid-cols-3 gap-2.5 pt-2">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">
                        Əsas Cərimə
                      </div>
                      <div
                        className="text-base font-black text-white mt-0.5"
                        data-testid="bus-lane-base-fine"
                      >
                        {formatAmount(busLaneAudit.baseFineAzn)}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">
                        Ödəniləcək
                      </div>
                      <div
                        className={`text-base font-black mt-0.5 ${
                          busLaneAudit.payableFineAzn > 0
                            ? 'text-rose-400'
                            : 'text-emerald-400'
                        }`}
                        data-testid="bus-lane-payable-fine"
                      >
                        {formatAmount(busLaneAudit.payableFineAzn)}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">
                        Cərimə Balı
                      </div>
                      <div
                        className="text-base font-black text-amber-400 mt-0.5"
                        data-testid="bus-lane-penalty-points"
                      >
                        {busLaneAudit.penaltyPoints} Bal
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
                    <div className="text-sky-400 font-bold">
                      Hüquqi Əsas: {busLaneAudit.statutoryBasis}
                    </div>
                    <p className="text-slate-300 leading-relaxed">{busLaneAudit.explanation}</p>
                    <div className="pt-2 border-t border-slate-800 text-slate-400">
                      <strong className="text-white">Tövsiyə / Apellyasiya: </strong>
                      {busLaneAudit.appealRecommendation}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BAKU CORRIDORS RADAR */}
          {activeTab === 'corridors_radar' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={corridorSearch}
                    onChange={(e) => setCorridorSearch(e.target.value)}
                    placeholder="Küçə, prospekt və ya rayon axtar (məs: Babək, Tbilisi, Nərimanov)..."
                    data-testid="input-corridor-search"
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={corridorRegimeFilter}
                    onChange={(e) => setCorridorRegimeFilter(e.target.value)}
                    data-testid="select-corridor-filter"
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="ALL">Bütün Rejimlər ({BAKU_BUS_LANE_CORRIDORS.length})</option>
                    <option value="24_7_continuous">24/7 Fasiləsiz Zolaqlar</option>
                    <option value="peak_hours_07_20">07:00 – 20:00 Saat Zolaqları</option>
                    <option value="weekdays_only_07_20">İş Günləri (B.e – Cümə)</option>
                    <option value="morning_evening_split">Səhər/Axşam Pik Saatlar</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCorridors.map((corridor) => {
                  const activeAtSelectedHour = isBusLaneActiveAtTime(
                    corridor.regime,
                    hourOfDay,
                    isWeekend
                  );
                  return (
                    <div
                      key={corridor.id}
                      data-testid={`corridor-card-${corridor.code}`}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-sky-500/40 transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/15 text-sky-400 border border-sky-500/30">
                              {corridor.code}
                            </span>
                            <span className="text-xs text-slate-400">{corridor.district}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white mt-1">
                            {corridor.corridorName}
                          </h4>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                            activeAtSelectedHour
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {activeAtSelectedHour
                            ? `AKTİV (${String(hourOfDay).padStart(2, '0')}:00) — 100 ₼`
                            : `SƏRBƏST SAAT (${String(hourOfDay).padStart(2, '0')}:00)`}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400">{corridor.segmentDescription}</p>

                      <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-slate-500 block">Uzunluq</span>
                          <strong className="text-white">{corridor.lengthKm} km</strong>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-slate-500 block">MMX Kameralar</span>
                          <strong className="text-sky-400">{corridor.cameraCount} ədəd</strong>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-slate-500 block">Sürət həddi</span>
                          <strong className="text-white">{corridor.speedLimitKmh} km/s</strong>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-300 flex items-center justify-between pt-1">
                        <span className="flex items-center gap-1 text-amber-300">
                          <Clock className="w-3.5 h-3.5" />
                          {corridor.activeHoursText}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: BAKU ENTRY & WIM ELECTRONIC SCALE CALCULATOR */}
          {activeTab === 'entry_and_wim' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-4">
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Truck className="w-4 h-4 text-sky-400" />
                    <span>
                      Bakı Şəhərinə Giriş-Çıxış Rejimi & "Elektron Tərəzi" (WIM) Kalkulyatoru
                    </span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Nəqliyyat Vasitəsinin Növü
                      </label>
                      <select
                        value={entryVehicleType}
                        onChange={(e) =>
                          setEntryVehicleType(e.target.value as BakuEntryVehicleType)
                        }
                        data-testid="select-entry-vehicle-type"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      >
                        <option value="passenger_or_suv_under_3_5t">
                          Minik / Krossover (&lt; 3.5 ton — 24/7 Sərbəst)
                        </option>
                        <option value="light_commercial_van_3_5_to_5t">
                          Yüngül Kommersiya Furqonu (3.5 – 5.0 ton)
                        </option>
                        <option value="medium_cargo_truck_5_to_8t">
                          Orta Yük Avtomobili (5.0 – 8.0 ton)
                        </option>
                        <option value="heavy_truck_over_8t">
                          Ağırtonnajlı Yük / TIR (&gt; 8.0 ton)
                        </option>
                        <option value="special_municipal_or_ev">
                          Kommunal Xidmət və ya Tam Elektrik (EV) Təchizat
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Mövsümi Giriş Rejimi (NK Qərarı)
                      </label>
                      <select
                        value={season}
                        onChange={(e) => setSeason(e.target.value as BakuEntrySeason)}
                        data-testid="select-entry-season"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      >
                        <option value="summer_may_to_oct">
                          Yay Rejimi (1 May – 1 Noyabr: 07:00 – 22:00 qadağa)
                        </option>
                        <option value="winter_nov_to_apr">
                          Qış Rejimi (1 Noyabr – 1 May: 07:00 – 21:00 qadağa)
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Weight & Axle Sliders */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Ümumi Faktiki Çəki (GVW):</span>
                        <span className="font-bold text-white" data-testid="gvw-tons-display">
                          {grossWeightTons} ton (Norma: ≤44t)
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={55}
                        step={0.5}
                        value={grossWeightTons}
                        onChange={(e) => setGrossWeightTons(Number(e.target.value))}
                        data-testid="slider-gvw-tons"
                        className="w-full accent-sky-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Tək Oxa Düşən Maksimal Yük:</span>
                        <span className="font-bold text-white" data-testid="axle-tons-display">
                          {singleAxleTons} ton (Norma: ≤10t)
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={16}
                        step={0.5}
                        value={singleAxleTons}
                        onChange={(e) => setSingleAxleTons(Number(e.target.value))}
                        data-testid="slider-axle-tons"
                        className="w-full accent-sky-500"
                      />
                    </div>
                  </div>

                  {/* Entry Hour & Entity Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Bakı Postuna Giriş Saatı:</span>
                        <span className="font-bold text-sky-400">
                          {String(entryHour).padStart(2, '0')}:00
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={23}
                        value={entryHour}
                        onChange={(e) => setEntryHour(Number(e.target.value))}
                        data-testid="slider-entry-hour"
                        className="w-full accent-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Məsuliyyət Subyekti (İXM Maddə 353)
                      </label>
                      <select
                        value={entityType}
                        onChange={(e) => setEntityType(e.target.value as EntityLegalType)}
                        data-testid="select-entity-type"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      >
                        <option value="individual_driver">Fiziki şəxs (Sürücü — 600 ₼)</option>
                        <option value="official_person">Vəzifəli şəxs (Dispetçer — 1,400 ₼)</option>
                        <option value="corporate_entity">Hüquqi şəxs (Daşıyıcı Şirkət — 4,000 ₼)</option>
                      </select>
                    </div>
                  </div>

                  <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none pt-1">
                    <input
                      type="checkbox"
                      checked={hasAynaPass}
                      onChange={(e) => setHasAynaPass(e.target.checked)}
                      data-testid="checkbox-has-ayna-pass"
                      className="rounded border-slate-700 bg-slate-900 text-sky-500"
                    />
                    <span>
                      Aktiv AYNA Rəqəmsal Giriş Buraxılış Vərəqəsi (`e-xidmet.ayna.gov.az`) mövcuddur
                    </span>
                  </label>
                </div>

                {/* Baku Entry Checkpoints List */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Bakı Giriş Qapıları & AAYDA/AYNA Elektron Tərəzi (WIM) Məntəqələri
                  </h4>
                  <div className="space-y-2">
                    {BAKU_ENTRY_CHECKPOINTS.map((cp) => (
                      <div
                        key={cp.id}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-sky-400" />
                            <span>{cp.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {cp.highwayCorridor}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {cp.hasWimElectronicScale && (
                            <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold block">
                              WIM Tərəzi Aktiv
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">
                            Gözləmə: ~{cp.activeWaitMinutes} dəq
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Entry & WIM Result */}
              <div className="lg:col-span-5 space-y-4">
                <div
                  data-testid="entry-wim-result-card"
                  className={`p-5 rounded-2xl border space-y-4 ${
                    entryAndWimAudit.isEntryAllowedNow
                      ? 'bg-emerald-950/30 border-emerald-500/40'
                      : 'bg-rose-950/30 border-rose-500/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {entryAndWimAudit.isEntryAllowedNow ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-rose-400 flex-shrink-0" />
                    )}
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        {entryAndWimAudit.restrictionWindowLabel}
                      </span>
                      <h4
                        className="text-base font-black text-white"
                        data-testid="entry-status-heading"
                      >
                        {entryAndWimAudit.isEntryAllowedNow
                          ? 'BAKI ŞƏHƏRİNƏ GİRİŞ İCAZƏLİDİR'
                          : 'GİRİŞ QADAĞANDIR / NORMA AŞILMIŞDIR'}
                      </h4>
                    </div>
                  </div>

                  <p
                    className="text-xs text-slate-200 leading-relaxed"
                    data-testid="entry-status-summary"
                  >
                    {entryAndWimAudit.statusSummary}
                  </p>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">
                        Giriş Rejimi Cəriməsi
                      </span>
                      <strong
                        className="text-sm font-black text-white"
                        data-testid="entry-violation-fine"
                      >
                        {formatAmount(entryAndWimAudit.entryViolationFineAzn)}
                      </strong>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">
                        İXM 353 Tərəzi Cəriməsi
                      </span>
                      <strong
                        className="text-sm font-black text-rose-400"
                        data-testid="wim-overweight-fine"
                      >
                        {formatAmount(entryAndWimAudit.wimOverweightFineAzn)}
                      </strong>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">
                        Yol Örtüyü Ziyan Rüsumu
                      </span>
                      <strong className="text-sm font-black text-amber-400">
                        {formatAmount(entryAndWimAudit.roadWearSurchargeAzn)}
                      </strong>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">
                        Cəmi Risk Məbləği
                      </span>
                      <strong
                        className="text-sm font-black text-white"
                        data-testid="total-entry-risk-fine"
                      >
                        {formatAmount(entryAndWimAudit.totalRiskFineAzn)}
                      </strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <div>
                      <strong className="text-sky-400">Sərbəst Gecə Pəncərəsi: </strong>
                      {entryAndWimAudit.allowedFreeNightWindow}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {entryAndWimAudit.statutoryReference}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AYNA ELECTRONIC ENTRY PASS GENERATOR & REGISTRY */}
          {activeTab === 'e_entry_pass' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Generator Form */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3.5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-sky-400" />
                    <span>
                      AYNA Rəqəmsal Giriş Buraxılış Vərəqəsi Generatoru (e-xidmet.ayna.gov.az)
                    </span>
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Dövlət Qeydiyyat Nişanı
                      </label>
                      <input
                        type="text"
                        value={plateNumber}
                        onChange={(e) => setPlateNumber(e.target.value)}
                        data-testid="input-pass-plate"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Daşıyıcı VÖEN (10 rəqəm) və ya FİN (7 simvol)
                      </label>
                      <input
                        type="text"
                        value={voenOrFin}
                        onChange={(e) => setVoenOrFin(e.target.value)}
                        data-testid="input-pass-voen"
                        className={`w-full px-3 py-2 rounded-xl bg-slate-900 border text-xs text-white font-mono uppercase ${
                          isVoenOrFinValid ? 'border-slate-700' : 'border-rose-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Daşıyıcı Müəssisə və ya Fiziki Şəxsin Adı
                    </label>
                    <input
                      type="text"
                      value={carrierName}
                      onChange={(e) => setCarrierName(e.target.value)}
                      data-testid="input-pass-carrier"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Təyinat və Yük Kateqoriyası
                    </label>
                    <input
                      type="text"
                      value={cargoCategory}
                      onChange={(e) => setCargoCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Bakı Giriş Buraxılış Məntəqəsi
                    </label>
                    <select
                      value={selectedCheckpointId}
                      onChange={(e) => setSelectedCheckpointId(e.target.value)}
                      data-testid="select-pass-checkpoint"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    >
                      {BAKU_ENTRY_CHECKPOINTS.map((cp) => (
                        <option key={cp.id} value={cp.id}>
                          {cp.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Təsdiq Edilmiş Hərəkət Marşrutu (Dəhliz)
                    </label>
                    <input
                      type="text"
                      value={authorizedCorridor}
                      onChange={(e) => setAuthorizedCorridor(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleGeneratePass}
                    data-testid="btn-generate-ayna-pass"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-sky-600/25 transition-all cursor-pointer"
                  >
                    Rəsmi AYNA Elektron Giriş Buraxılışı Формаlaşdır
                  </button>
                </div>
              </div>

              {/* Registry Lookup & Official Certificate Preview */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <label className="block text-xs font-bold text-slate-300">
                    Vahid AYNA & BDYP Elektron Buraxılış Reyestri Axtarışı
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={registrySearchQuery}
                      onChange={(e) => setRegistrySearchQuery(e.target.value)}
                      placeholder="Buraxılış № (AYNA-EB-2026-84120) və ya Dövlət Nişanı..."
                      data-testid="input-registry-pass-lookup"
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono uppercase"
                    />
                  </div>
                </div>

                {registryLookupResult ? (
                  <div
                    data-testid="ayna-pass-certificate-card"
                    className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950/30 border border-sky-500/40 space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">
                          AZƏRBAYCAN YERÜSTÜ NƏQLİYYAT AGENTLİYİ (AYNA)
                        </span>
                        <h4 className="text-sm sm:text-base font-black text-white mt-0.5">
                          BAKI ŞƏHƏRİNƏ ELEKTRON GİRİŞ BURAXILIŞ VƏRƏQƏSİ
                        </h4>
                        <div
                          className="text-xs font-mono font-bold text-emerald-400 mt-1"
                          data-testid="pass-serial-number"
                        >
                          {registryLookupResult.passNumber}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(registryLookupResult.passNumber)}
                          data-testid="btn-copy-pass-number"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1.5 cursor-pointer"
                        >
                          {copiedText === registryLookupResult.passNumber ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>Kopyala</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 block">Dövlət Qeydiyyat Nişanı</span>
                        <strong className="text-white font-mono">
                          {registryLookupResult.plateNumber}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Daşıyıcı VÖEN / FİN</span>
                        <strong className="text-white font-mono">
                          {registryLookupResult.voenOrFin}
                        </strong>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500 block">Daşıyıcı Müəssisə</span>
                        <strong className="text-white">{registryLookupResult.carrierName}</strong>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500 block">Giriş Buraxılış Postu</span>
                        <strong className="text-sky-300">
                          {registryLookupResult.entryCheckpointName}
                        </strong>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500 block">Təsdiqlənmiş Dəhliz</span>
                        <strong className="text-slate-200">
                          {registryLookupResult.authorizedCorridor}
                        </strong>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500 block">İcazə Verilən Saat Pəncərəsi</span>
                        <strong className="text-emerald-300">
                          {registryLookupResult.validTimeWindow}
                        </strong>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1.5 font-mono text-sky-400">
                        <QrCode className="w-4 h-4" />
                        {registryLookupResult.qrSecurityHash}
                      </span>
                      <span>
                        Etibarlıdır: {registryLookupResult.issuedAt} —{' '}
                        {registryLookupResult.expiresAt}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
                    Sorğuya uyğun aktiv elektron buraxılış vərəqəsi tapılmadı.
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

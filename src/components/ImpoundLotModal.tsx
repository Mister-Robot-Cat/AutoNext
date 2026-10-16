import React, { useState, useMemo } from 'react';
import { Currency, Language, Vehicle } from '../types/vehicle';
import {
  ImpoundVehicleWeightClass,
  ImpoundViolationCode,
  ImpoundReleasePass,
  calculateImpoundReleaseCost,
  auditTowingLegality,
  convertImpoundCurrency,
  determineWeightClassFromVehicle,
  validateReleaseFinCode,
  generateImpoundReleasePass,
  TARIFF_COUNCIL_TOWING_FEES_AZN,
  TARIFF_COUNCIL_DAILY_STORAGE_RATES_AZN,
  FREE_STORAGE_GRACE_HOURS,
} from '../utils/impoundLot';
import {
  IMPOUND_VIOLATION_RULES,
  MOCK_IMPOUND_LOTS,
  MOCK_IMPOUND_RECORDS,
  MOCK_RELEASE_PASSES,
} from '../data/mockImpoundData';
import {
  X,
  Truck,
  Search,
  Calculator,
  Scale,
  MapPin,
  FileCheck,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Phone,
  Copy,
  Check,
  Printer,
  QrCode,
  Building2,
  Lock,
  KeyRound,
  Info,
} from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock';
import { useKeyPress } from '../hooks/useKeyPress';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';

interface ImpoundLotModalProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  currency: Currency;
  lang: Language;
  onClose: () => void;
}

type ImpoundTab = 'search' | 'calculator' | 'legality' | 'lots' | 'release';

export const ImpoundLotModal: React.FC<ImpoundLotModalProps> = ({
  isOpen,
  vehicle,
  currency,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<ImpoundTab>('search');

  // Tab 1: Plate / VIN Search state
  const [searchQuery, setSearchQuery] = useState<string>(
    vehicle?.plateNumber || '99-AA-001'
  );

  // Tab 2: Tariff Council Cost Calculator state
  const [violationCode, setViolationCode] = useState<ImpoundViolationCode>('ixm_346_2_obstruction');
  const [weightClass, setWeightClass] = useState<ImpoundVehicleWeightClass>(
    determineWeightClassFromVehicle(vehicle)
  );
  const [hoursImpounded, setHoursImpounded] = useState<number>(2);
  const [applyEarly50Discount, setApplyEarly50Discount] = useState<boolean>(true);
  const [wasExonerated, setWasExonerated] = useState<boolean>(false);

  // Tab 3: İXM Article 96 Legality Auditor state
  const [driverPresentBeforeMovement, setDriverPresentBeforeMovement] = useState<boolean>(false);
  const [createdTrafficObstruction, setCreatedTrafficObstruction] = useState<boolean>(true);
  const [parkedInDisabledSpot, setParkedInDisabledSpot] = useState<boolean>(false);
  const [hasProtocolAndSealAct, setHasProtocolAndSealAct] = useState<boolean>(true);

  // Tab 4: BDYP Impound Lots Radar state
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('ALL');
  const [selectedLotId, setSelectedLotId] = useState<string>(MOCK_IMPOUND_LOTS[0].id);

  // Tab 5: Electronic Release Pass (E-Buraxılış) state
  const [ownerFullName, setOwnerFullName] = useState<string>('Əliyev Kamran Rəşid oğlu');
  const [ownerFinCode, setOwnerFinCode] = useState<string>('4AZ91K2');
  const [releasePlate, setReleasePlate] = useState<string>(vehicle?.plateNumber || '99-AA-001');
  const [releaseProtocol, setReleaseProtocol] = useState<string>('İXP-9024185');
  const [generatedPass, setGeneratedPass] = useState<ImpoundReleasePass | null>(null);
  const [registryVerifyQuery, setRegistryVerifyQuery] = useState<string>('BDYP-CM-2026-84920');

  const [copiedCode, copyToClipboard] = useCopyToClipboard();

  useScrollLock(isOpen);
  useKeyPress('Escape', onClose);

  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₼';
  const formatAmount = (amountAzn: number) => {
    const converted = convertImpoundCurrency(amountAzn, currency);
    return `${converted.toLocaleString('en-US', {
      minimumFractionDigits: converted % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    })} ${currencySymbol}`;
  };

  // Matched impound record from search query
  const matchedRecord = useMemo(() => {
    const q = searchQuery.trim().toUpperCase();
    if (!q) return null;
    return (
      MOCK_IMPOUND_RECORDS.find(
        (rec) =>
          rec.plateNumber.toUpperCase() === q ||
          rec.vin.toUpperCase() === q ||
          rec.protocolSeries.toUpperCase() === q ||
          rec.recordId.toUpperCase() === q
      ) || null
    );
  }, [searchQuery]);

  const matchedRecordLot = useMemo(() => {
    if (!matchedRecord) return MOCK_IMPOUND_LOTS[0];
    return MOCK_IMPOUND_LOTS.find((l) => l.id === matchedRecord.lotId) || MOCK_IMPOUND_LOTS[0];
  }, [matchedRecord]);

  // Cost calculation breakdown
  const costBreakdown = useMemo(() => {
    return calculateImpoundReleaseCost({
      violationCode,
      weightClass,
      hoursImpounded,
      applyEarly50Discount,
      wasTowingUnlawfulOrExonerated: wasExonerated,
    });
  }, [violationCode, weightClass, hoursImpounded, applyEarly50Discount, wasExonerated]);

  // Towing legality audit result
  const legalityAudit = useMemo(() => {
    return auditTowingLegality({
      violationCode,
      driverPresentBeforeMovement,
      createdTrafficObstruction,
      parkedInDisabledSpotWithoutPermit: parkedInDisabledSpot,
      hasProtocolAndSealAct,
    });
  }, [
    violationCode,
    driverPresentBeforeMovement,
    createdTrafficObstruction,
    parkedInDisabledSpot,
    hasProtocolAndSealAct,
  ]);

  // Filtered impound lots
  const filteredLots = useMemo(() => {
    if (selectedCityFilter === 'ALL') return MOCK_IMPOUND_LOTS;
    return MOCK_IMPOUND_LOTS.filter((l) => l.city === selectedCityFilter);
  }, [selectedCityFilter]);

  const selectedLot = useMemo(() => {
    return MOCK_IMPOUND_LOTS.find((l) => l.id === selectedLotId) || MOCK_IMPOUND_LOTS[0];
  }, [selectedLotId]);

  const isFinValid = useMemo(() => validateReleaseFinCode(ownerFinCode), [ownerFinCode]);

  const activePass = useMemo(() => {
    if (generatedPass) return generatedPass;
    return generateImpoundReleasePass({
      plateNumber: releasePlate,
      vin: vehicle?.vin || matchedRecord?.vin || 'JTDBR32E800192841',
      vehicleTitle: vehicle?.title || matchedRecord?.vehicleTitle || 'Toyota Camry 2.5 Hybrid',
      ownerFullName,
      ownerFinCode,
      lot: selectedLot,
      protocolSeries: releaseProtocol,
      costBreakdown,
    });
  }, [
    generatedPass,
    releasePlate,
    vehicle,
    matchedRecord,
    ownerFullName,
    ownerFinCode,
    selectedLot,
    releaseProtocol,
    costBreakdown,
  ]);

  const verifiedRegistryPass = useMemo(() => {
    const q = registryVerifyQuery.trim().toUpperCase();
    if (!q) return null;
    if (generatedPass && generatedPass.passNumber.toUpperCase() === q) {
      return generatedPass;
    }
    return MOCK_RELEASE_PASSES.find((p) => p.passNumber.toUpperCase() === q) || null;
  }, [registryVerifyQuery, generatedPass]);

  if (!isOpen) return null;

  const handleLoadRecordToCalculator = () => {
    if (!matchedRecord) return;
    setViolationCode(matchedRecord.violationCode);
    setWeightClass(matchedRecord.weightClass);
    setHoursImpounded(matchedRecord.hoursImpounded);
    setSelectedLotId(matchedRecord.lotId);
    setReleasePlate(matchedRecord.plateNumber);
    setReleaseProtocol(matchedRecord.protocolSeries);
    setActiveTab('calculator');
  };

  const handleIssueReleasePass = () => {
    if (!isFinValid) return;
    const newPass = generateImpoundReleasePass({
      plateNumber: releasePlate,
      vin: vehicle?.vin || matchedRecord?.vin || 'JTDBR32E800192841',
      vehicleTitle: vehicle?.title || matchedRecord?.vehicleTitle || 'Toyota Camry 2.5 Hybrid',
      ownerFullName,
      ownerFinCode,
      lot: selectedLot,
      protocolSeries: releaseProtocol,
      costBreakdown,
    });
    setGeneratedPass(newPass);
    setRegistryVerifyQuery(newPass.passNumber);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      data-testid="impound-lot-modal"
    >
      <div
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Official Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-rose-950/30 to-slate-950 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/25 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  BDYP & AYNA Rəsmi Cərimə Meydançası və Evakuasiya Portalı
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  İXM Maddə 96 & Tarif Şurası
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Müvəqqəti Mühafizə Olunan Duracaq Axtarışı, Qanuni Təxliyə Yoxlaması, Saxlanma Haqqı Kalkulyatoru və E-Buraxılış Qəbzi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            data-testid="close-impound-modal-btn"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-3 bg-slate-950/80 border-b border-slate-800 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            data-testid="tab-impound-search"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'search'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Plaka/VIN Axtarışı & Status</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('calculator')}
            data-testid="tab-impound-calculator"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Tarif Şurası Xərc Kalkulyatoru</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('legality')}
            data-testid="tab-impound-legality"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'legality'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Qanuni Evakuasiya Auditoru (Maddə 96)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('lots')}
            data-testid="tab-impound-lots"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'lots'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>BDYP Duracaqlar Radarı ({MOCK_IMPOUND_LOTS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('release')}
            data-testid="tab-impound-release"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'release'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>E-Buraxılış Qəbzi (AsanPay)</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* TAB 1: PLATE / VIN SEARCH & IMPOUND TELEMETRY */}
          {activeTab === 'search' && (
            <div className="space-y-6" data-testid="impound-search-panel">
              {/* Search Bar & Sample Presets */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <Search className="w-4 h-4 text-rose-400" />
                      <span>Təxliyə Olunmuş Avtomobilin Operativ Axtarışı</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Dövlət qeydiyyat nişanı, VIN kod və ya İXP protokol seriyası ilə avtomobilin hansı cərimə meydançasında olduğunu yoxlayın
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20">
                    Canlı BDYP Mərkəzi Dispetçer Bazası
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Məsələn: 99-AA-001, 77-XX-777 və ya VIN kod..."
                    data-testid="impound-search-input"
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm uppercase focus:outline-none focus:border-rose-500"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {MOCK_IMPOUND_RECORDS.map((rec) => (
                      <button
                        key={rec.recordId}
                        type="button"
                        onClick={() => setSearchQuery(rec.plateNumber)}
                        data-testid={`preset-plate-${rec.plateNumber}`}
                        className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                          searchQuery.trim().toUpperCase() === rec.plateNumber
                            ? 'bg-rose-600/20 border-rose-500 text-rose-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {rec.plateNumber}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSearchQuery('10-ZZ-999')}
                      data-testid="preset-plate-clean"
                      className="px-3 py-2 rounded-xl text-xs font-mono font-bold border bg-slate-900 border-slate-800 text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"
                    >
                      10-ZZ-999 (Təmiz)
                    </button>
                  </div>
                </div>
              </div>

              {/* Search Result Display */}
              {matchedRecord ? (
                <div
                  className="p-5 rounded-2xl bg-slate-950/80 border border-rose-500/40 space-y-5"
                  data-testid="impound-record-found"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`px-3 py-1.5 rounded-xl font-mono font-black text-sm border ${
                          matchedRecord.status === 'active_impounded'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {matchedRecord.plateNumber}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base">{matchedRecord.vehicleTitle}</h4>
                        <p className="text-xs text-slate-400 font-mono">
                          VIN: {matchedRecord.vin} • Protokol: {matchedRecord.protocolSeries}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {matchedRecord.status === 'active_impounded' ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          DURACAQDA SAXLANILIR ({matchedRecord.hoursImpounded} saat)
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          SAHİBİNƏ TƏHVİL VERİLİB
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Telemetry Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                      <span className="text-[11px] uppercase font-bold text-slate-400 block">
                        Yerləşdiyi Cərimə Meydançası
                      </span>
                      <div className="font-bold text-white text-sm">{matchedRecordLot.name}</div>
                      <p className="text-xs text-slate-400">{matchedRecordLot.address}</p>
                      <div className="text-xs text-amber-400 font-semibold pt-1">
                        Əlaqə: {matchedRecordLot.phone} ({matchedRecordLot.workingHours})
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                      <span className="text-[11px] uppercase font-bold text-slate-400 block">
                        Təxliyə & Evakuator Telemetriyası
                      </span>
                      <div className="font-bold text-white text-sm">
                        Evakuator: <span className="text-rose-400 font-mono">{matchedRecord.towTruckPlate}</span>
                      </div>
                      <p className="text-xs text-slate-300">Ünvan: {matchedRecord.towedFromAddress}</p>
                      <p className="text-xs text-slate-400">
                        Tarix: {matchedRecord.impoundedAtIso} • Müfəttiş: {matchedRecord.inspectorName} ({matchedRecord.inspectorBadge})
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                      <span className="text-[11px] uppercase font-bold text-slate-400 block">
                        Qapı/Kapot Plomb Aktı (İXM 96.3)
                      </span>
                      <div className="font-bold text-emerald-400 text-sm font-mono flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        <span>{matchedRecord.sealNumber}</span>
                      </div>
                      <p className="text-xs text-slate-300">{matchedRecord.exteriorConditionNotes}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        İlk {FREE_STORAGE_GRACE_HOURS} saat ərzində müraciət etdikdə günlük saxlanma haqqı (0 ₼) tutulmur.
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={handleLoadRecordToCalculator}
                        data-testid="load-record-to-calculator-btn"
                        className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-rose-600/20"
                      >
                        Xərci Hesabla & Buraxılış Al
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('legality')}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
                      >
                        Evakuasiyanın Qanuniliyini Yoxla
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between gap-4"
                  data-testid="impound-record-clean"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">
                        «{searchQuery.toUpperCase()}» üzrə Aktiv Təxliyə və ya Saxlanma Qeydə Alınmayıb
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Bu nəqliyyat vasitəsi hazırda BDYP və ya AYNA müvəqqəti mühafizə olunan duracaqlarında (cərimə meydançalarında) deyil.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TARIFF COUNCIL COST & STORAGE CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" data-testid="impound-calculator-panel">
              {/* Left Form (7 cols) */}
              <div className="lg:col-span-7 space-y-4 p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-rose-400" />
                  <span>Tarif Şurası Təxliyə, Saxlanma və İXM Cərimə Parametrləri</span>
                </h3>

                {/* Violation Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                    Təxliyə Səbəbi (İnzibati Xətalar Məcəlləsi)
                  </label>
                  <select
                    value={violationCode}
                    onChange={(e) => setViolationCode(e.target.value as ImpoundViolationCode)}
                    data-testid="select-impound-violation"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-rose-500"
                  >
                    {IMPOUND_VIOLATION_RULES.map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.articleCitation} — {r.title} ({r.baseFineAzn} AZN)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Weight Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                    Nəqliyyat Vasitəsinin Çəki Kateqoriyası (Tarif Şurası)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {(
                      [
                        {
                          id: 'passenger_under_3_5t',
                          title: 'Minik (< 3.5 ton)',
                          sub: `Təxliyə: ${TARIFF_COUNCIL_TOWING_FEES_AZN.passenger_under_3_5t} ₼ • Sutka: ${TARIFF_COUNCIL_DAILY_STORAGE_RATES_AZN.passenger_under_3_5t} ₼`,
                        },
                        {
                          id: 'medium_3_5_to_10t',
                          title: 'Orta yük (3.5 – 10 ton)',
                          sub: `Təxliyə: ${TARIFF_COUNCIL_TOWING_FEES_AZN.medium_3_5_to_10t} ₼ • Sutka: ${TARIFF_COUNCIL_DAILY_STORAGE_RATES_AZN.medium_3_5_to_10t} ₼`,
                        },
                        {
                          id: 'heavy_over_10t',
                          title: 'Ağır yük (> 10 ton)',
                          sub: `Təxliyə: ${TARIFF_COUNCIL_TOWING_FEES_AZN.heavy_over_10t} ₼ • Sutka: ${TARIFF_COUNCIL_DAILY_STORAGE_RATES_AZN.heavy_over_10t} ₼`,
                        },
                      ] as { id: ImpoundVehicleWeightClass; title: string; sub: string }[]
                    ).map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setWeightClass(cat.id)}
                        data-testid={`weight-class-${cat.id}`}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          weightClass === cat.id
                            ? 'bg-rose-600/20 border-rose-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="text-xs font-bold">{cat.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{cat.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hours Impounded Slider & Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase">
                      Duracaqda Qalma Müddəti (Saat)
                    </label>
                    <span className="text-xs font-bold text-rose-400">
                      {hoursImpounded} saat ({costBreakdown.billableDays} ödənişli sutka)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={240}
                      value={hoursImpounded}
                      onChange={(e) => setHoursImpounded(Number(e.target.value))}
                      className="flex-1 accent-rose-500"
                    />
                    <input
                      type="number"
                      min={0}
                      max={720}
                      value={hoursImpounded}
                      onChange={(e) => setHoursImpounded(Math.max(0, Number(e.target.value)))}
                      data-testid="hours-impounded-input"
                      className="w-24 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-bold text-center"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {[2, 12, 36, 72, 168].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setHoursImpounded(h)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 cursor-pointer"
                      >
                        {h <= 3 ? `${h} saat (Güzəştli)` : `${h} saat (${Math.ceil(h / 24)} gün)`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Statutory Toggles */}
                <div className="space-y-2.5 pt-2">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-white block">
                        AsanPay 30 Günlük 50% Erkən Ödəniş Güzəşti
                      </span>
                      <span className="text-[11px] text-slate-400">
                        50% güzəşt yalnız İXM inzibati cəriməsinə tətbiq edilir (təxliyə haqqına şamil olunmur)
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={applyEarly50Discount}
                      onChange={(e) => setApplyEarly50Discount(e.target.checked)}
                      data-testid="toggle-early-50-discount"
                      className="w-4 h-4 accent-rose-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-emerald-400 block">
                        İXM Maddə 96.10 — Qanunsuz Evakuasiya / Bəraət Halı
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Evakuasiya qanunsuz tanındıqda daşınma və saxlanma haqqı sürücüdən tutulmur (0 AZN)
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={wasExonerated}
                      onChange={(e) => setWasExonerated(e.target.checked)}
                      data-testid="toggle-exonerated"
                      className="w-4 h-4 accent-emerald-500"
                    />
                  </label>
                </div>
              </div>

              {/* Right Breakdown Card (5 cols) */}
              <div className="lg:col-span-5 p-5 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider block">
                        Rəsmi Ödəniş Hesablaması
                      </span>
                      <h4 className="text-base font-black text-white">{costBreakdown.articleCitation}</h4>
                    </div>
                    {costBreakdown.penaltyPoints > 0 && (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                        +{costBreakdown.penaltyPoints} Cərimə Balı
                      </span>
                    )}
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>İnzibati Cərimə (Əsas):</span>
                      <span className="font-semibold text-white">{formatAmount(costBreakdown.baseFineAzn)}</span>
                    </div>

                    {costBreakdown.fineSavingsAzn > 0 && (
                      <div className="flex items-center justify-between text-emerald-400">
                        <span>50% Erkən Ödəniş Güzəşti:</span>
                        <span className="font-bold">-{formatAmount(costBreakdown.fineSavingsAzn)}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-slate-300">
                      <span>Güzəştli İnzibati Cərimə:</span>
                      <span className="font-bold text-white" data-testid="calc-discounted-fine">
                        {formatAmount(costBreakdown.discountedFineAzn)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span>Tarif Şurası Evakuator (Təxliyə) Haqqı:</span>
                      <span className="font-bold text-amber-400" data-testid="calc-towing-fee">
                        {formatAmount(costBreakdown.towingFeeAzn)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span>
                        Duracaqda Saxlanma ({costBreakdown.billableDays} sutka × {costBreakdown.dailyStorageRateAzn} ₼):
                      </span>
                      <span className="font-bold text-cyan-400" data-testid="calc-storage-fee">
                        {formatAmount(costBreakdown.storageFeeAzn)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400">
                      <span>AsanPay / HÖP Xidmət Komissiyası:</span>
                      <span>{formatAmount(costBreakdown.asanPayCommissionAzn)}</span>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-sm font-bold text-white">Yekun Buraxılış Ödənişi:</span>
                      <span
                        className="text-2xl font-black text-emerald-400"
                        data-testid="calc-total-payable"
                      >
                        {formatAmount(costBreakdown.totalPayableAzn)}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                    {costBreakdown.legalNote}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('release')}
                  data-testid="proceed-to-release-pass-btn"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-lg shadow-rose-600/20"
                >
                  AsanPay ilə Ödə & E-Buraxılış Qəbzi Yaradın
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: TOWING LEGALITY AUDITOR (İXM ARTICLE 96 & 346) */}
          {activeTab === 'legality' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" data-testid="impound-legality-panel">
              <div className="lg:col-span-6 space-y-4 p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Scale className="w-4 h-4 text-amber-400" />
                    <span>İXM Maddə 96 — Qanuni Evakuasiya Yoxlayıcısı</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Hadisə zamanı mövcud olan faktiki halları seçərək avtomobilin cərimə meydançasına aparılmasının qanuni olub-olmadığını yoxlayın
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-white block">
                        1. Evakuator hərəkətə başlamazdan əvvəl avtomobilə yaxınlaşdınızmı?
                      </span>
                      <span className="text-[11px] text-slate-400">
                        İXM Maddə 96.2: Evakuator tərpənməzdən əvvəl sürücü gəldikdə avtomobil dərhal qaytarılmalıdır.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={driverPresentBeforeMovement}
                      onChange={(e) => setDriverPresentBeforeMovement(e.target.checked)}
                      data-testid="audit-driver-present"
                      className="w-4 h-4 mt-1 accent-rose-500"
                    />
                  </label>

                  <label className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-white block">
                        2. Avtomobil digər nəqliyyat vasitələrinə və ya piyadalara maneə yaradırdımı?
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Məsələn: 2-ci cərgədə saxlama, həyət girişini bağlama və ya avtobus zolağını kəsmə (İXM 346.2).
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={createdTrafficObstruction}
                      onChange={(e) => setCreatedTrafficObstruction(e.target.checked)}
                      data-testid="audit-traffic-obstruction"
                      className="w-4 h-4 mt-1 accent-rose-500"
                    />
                  </label>

                  <label className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-white block">
                        3. Əlilliyi olan şəxslər üçün parklanma yerində saxlanılmışdımı?
                      </span>
                      <span className="text-[11px] text-slate-400">
                        İXM Maddə 346.4: Tanınma nişanı olmadan əlillər üçün ayrılmış yerin zəbt edilməsi.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={parkedInDisabledSpot}
                      onChange={(e) => setParkedInDisabledSpot(e.target.checked)}
                      data-testid="audit-disabled-spot"
                      className="w-4 h-4 mt-1 accent-rose-500"
                    />
                  </label>

                  <label className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-white block">
                        4. Təxliyə aktı tərtib edilib və qapılar plomblanıbmı?
                      </span>
                      <span className="text-[11px] text-slate-400">
                        İXM Maddə 96.3: İki nüsxədə təhvil-təslim aktı və qapı plombları məcburidir.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={hasProtocolAndSealAct}
                      onChange={(e) => setHasProtocolAndSealAct(e.target.checked)}
                      data-testid="audit-protocol-seal"
                      className="w-4 h-4 mt-1 accent-rose-500"
                    />
                  </label>
                </div>
              </div>

              {/* Right Legal Verdict Panel */}
              <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-2xl border ${
                      legalityAudit.isTowingLawful
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    }`}
                    data-testid="legality-verdict-box"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1">
                      {legalityAudit.isTowingLawful ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      )}
                      <span>Hüquqi Ekspertiza Rəyi</span>
                    </div>
                    <h4 className="text-base font-black text-white" data-testid="legality-verdict-title">
                      {legalityAudit.verdictTitle}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Qanunvericilik əsası: <strong>{legalityAudit.statutoryBasis}</strong>
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="font-bold text-white block mb-1">Hüquqi İzah:</span>
                      <p className="text-slate-300 leading-relaxed">{legalityAudit.explanation}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="font-bold text-amber-400 block mb-1">Tövsiyə Olunan Addım:</span>
                      <p className="text-slate-300 leading-relaxed">{legalityAudit.recommendedAction}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block">Rəsmi Qaynar Xətt:</span>
                    <strong className="text-white">{legalityAudit.hotlineNumber}</strong>
                  </div>
                  {legalityAudit.exemptFromTowingAndStorageFees && (
                    <button
                      type="button"
                      onClick={() => {
                        setWasExonerated(true);
                        setActiveTab('calculator');
                      }}
                      data-testid="apply-exoneration-btn"
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition-all"
                    >
                      0 ₼ Bəraət Rejiminə Keç
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BDYP & AYNA IMPOUND LOTS RADAR */}
          {activeTab === 'lots' && (
            <div className="space-y-4" data-testid="impound-lots-panel">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-rose-400" />
                    <span>Rəsmi Müvəqqəti Mühafizə Olunan Duracaqlar (Cərimə Meydançaları)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Bütün duracaqlarda 24/7 növbətçi buraxılış məntəqəsi və AsanPay ödəniş terminalı fəaliyyət göstərir
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {['ALL', 'Bakı', 'Xırdalan', 'Sumqayıt', 'Gəncə'].map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setSelectedCityFilter(city)}
                      data-testid={`filter-lot-city-${city}`}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedCityFilter === city
                          ? 'bg-rose-600 text-white border-rose-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {city === 'ALL' ? 'Bütün Şəhərlər' : city}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredLots.map((lot) => {
                  const occupancyPct = Math.round((lot.occupiedBays / lot.capacityBays) * 100);
                  const isSelected = lot.id === selectedLotId;

                  return (
                    <div
                      key={lot.id}
                      data-testid={`impound-lot-card-${lot.id}`}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'bg-slate-900 border-rose-500 ring-1 ring-rose-500/30'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-rose-400">
                              {lot.code} • {lot.authority}
                            </span>
                            <h4 className="font-bold text-white text-sm mt-1">{lot.name}</h4>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                            24/7 Açıq
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{lot.address}</span>
                        </p>

                        <div className="flex items-center gap-4 text-xs text-slate-300">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-emerald-400" />
                            {lot.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            Doluluq: {lot.occupiedBays}/{lot.capacityBays} ({occupancyPct}%)
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          AsanPay Terminalı & Növbətçi Müfəttiş var
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLotId(lot.id);
                            setActiveTab('release');
                          }}
                          data-testid={`select-lot-btn-${lot.id}`}
                          className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
                        >
                          Buraxılış Üçün Seç
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: ELECTRONIC RELEASE AUTHORIZATION PASS (E-BURAXILIŞ) */}
          {activeTab === 'release' && (
            <div className="space-y-6" data-testid="impound-release-panel">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Applicant Form (5 cols) */}
                <div className="lg:col-span-5 space-y-4 p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-rose-400" />
                    <span>E-Buraxılış Qəbzi Rəsmiləşdirilməsi</span>
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                      Avtomobil Sahibinin / Sürücünün S.A.A.
                    </label>
                    <input
                      type="text"
                      value={ownerFullName}
                      onChange={(e) => setOwnerFullName(e.target.value)}
                      data-testid="release-owner-name-input"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                        Şəxsiyyət FİN Kodu (7 simvol)
                      </label>
                      <input
                        type="text"
                        maxLength={7}
                        value={ownerFinCode}
                        onChange={(e) => setOwnerFinCode(e.target.value.toUpperCase())}
                        data-testid="release-fin-input"
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border font-mono uppercase text-xs sm:text-sm text-white ${
                          isFinValid ? 'border-slate-700' : 'border-red-500'
                        }`}
                      />
                      {!isFinValid && (
                        <span className="text-[10px] text-red-400 mt-0.5 block">
                          FİN kod 7 hərf/rəqəmdən ibarət olmalıdır
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                        Dövlət Qeydiyyat Nişanı
                      </label>
                      <input
                        type="text"
                        value={releasePlate}
                        onChange={(e) => setReleasePlate(e.target.value.toUpperCase())}
                        data-testid="release-plate-input"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 font-mono uppercase text-xs sm:text-sm text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                      Cərimə Meydançası (Duracaq)
                    </label>
                    <select
                      value={selectedLotId}
                      onChange={(e) => setSelectedLotId(e.target.value)}
                      data-testid="release-lot-select"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm"
                    >
                      {MOCK_IMPOUND_LOTS.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.code} — {l.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    disabled={!isFinValid}
                    onClick={handleIssueReleasePass}
                    data-testid="generate-release-pass-btn"
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
                  >
                    Rəsmi Elektron Buraxılış Qəbzi Yaradın
                  </button>
                </div>

                {/* Right Official Certificate Preview (7 cols) */}
                <div
                  className="lg:col-span-7 p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950/20 border border-rose-500/40 space-y-4"
                  data-testid="official-release-pass-card"
                >
                  <div className="flex items-start justify-between border-b border-slate-800 pb-3 gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400 block">
                        Azərbaycan Respublikası DİN Baş DYPİ & AsanPay
                      </span>
                      <h4 className="text-base sm:text-lg font-black text-white">
                        MÜVƏQQƏTİ DURACAQDAN ELEKTRON BURAXILIŞ İCAZƏSİ
                      </h4>
                      <span
                        className="text-xs font-mono font-bold text-emerald-400"
                        data-testid="release-pass-number"
                      >
                        Sənəd №: {activePass.passNumber}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-center">
                      <QrCode className="w-8 h-8 text-rose-400 mx-auto" />
                      <span className="text-[9px] font-mono text-slate-400 block mt-1">
                        {activePass.qrSecurityHash}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Qeydiyyat Nişanı</span>
                      <strong className="font-mono text-white text-sm">{activePass.plateNumber}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Şlaqbaum Çıxış PİN Kodu</span>
                      <strong
                        className="font-mono text-emerald-400 text-sm"
                        data-testid="release-gate-pin"
                      >
                        {activePass.gateBarrierPin}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Ödənilmiş Yekun Məbləğ</span>
                      <strong className="text-white text-sm">{formatAmount(activePass.totalPaidAzn)}</strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Təhvil alan şəxs (FİN):</span>
                      <span className="text-white font-semibold">
                        {activePass.ownerFullName} ({activePass.ownerFinCode})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Duracaq məntəqəsi:</span>
                      <span className="text-slate-200">{activePass.lotName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Buraxılış son müddəti (3 saat güzəşt):</span>
                      <span className="text-amber-400 font-mono">{activePass.validExitUntil}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(activePass.passNumber)}
                      data-testid="copy-release-pass-btn"
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
                    >
                      {copiedCode === activePass.passNumber ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Kopyalandı</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Sənəd Kodunu Kopyala</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Çap Et (PDF)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Unified Registry Verification Lookup */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white">
                    BDYP Vahid Elektron Buraxılış Reyestri Yoxlaması
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={registryVerifyQuery}
                      onChange={(e) => setRegistryVerifyQuery(e.target.value)}
                      data-testid="verify-release-pass-input"
                      placeholder="BDYP-CM-2026-XXXXX"
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white uppercase"
                    />
                  </div>
                </div>

                {verifiedRegistryPass ? (
                  <div
                    className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between"
                    data-testid="verified-pass-result"
                  >
                    <span>
                      Təsdiqləndi: <strong>{verifiedRegistryPass.passNumber}</strong> ({verifiedRegistryPass.plateNumber}) — Şlaqbaum PIN:{' '}
                      <strong>{verifiedRegistryPass.gateBarrierPin}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 font-bold text-[10px]">
                      {verifiedRegistryPass.status}
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400" data-testid="unverified-pass-result">
                    Reyestrdə bu nömrəli aktiv buraxılış sənədi tapılmadı.
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

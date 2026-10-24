import React, { useState, useMemo } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Search,
  Printer,
  Copy,
  Calendar,
  Layers,
  Wrench,
  DollarSign,
  FileText,
  Activity,
  Maximize2
} from 'lucide-react';
import { Vehicle, Currency } from '../types/vehicle';
import { formatPrice } from '../utils/i18n';
import {
  SalvageCategoryKey,
  AirbagDeploymentStatus,
  ChassisDatumPoint,
  UltrasoundWeldJoint,
  SalvageAuctionPreset,
  AccreditedSalvageCenter,
  MockSalvageCertificate,
  SALVAGE_CATEGORIES,
  INITIAL_CHASSIS_POINTS,
  INITIAL_WELD_JOINTS,
  SALVAGE_VEHICLE_PRESETS,
  ACCREDITED_SALVAGE_CENTERS
} from '../data/mockSalvageData';
import {
  calculateTotalLossPayout,
  evaluateChassisDatumPoints,
  evaluateUltrasoundWelds,
  evaluateOverallRoadworthiness,
  calculateImportLandedCost,
  generateSalvageCertificate,
  lookupSalvageRecord
} from '../utils/salvageCompliance';

export interface SalvageComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: Vehicle | null;
  currency?: Currency;
}

type TabType = 'calculator' | 'auction' | 'chassis3d' | 'centers' | 'certificate';

export const SalvageComplianceModal: React.FC<SalvageComplianceModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  currency = 'AZN'
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('calculator');

  // Calculator inputs
  const [preAccidentValueAzn, setPreAccidentValueAzn] = useState<number>(
    vehicle ? vehicle.priceAzn : 40000
  );
  const [estimatedRepairCostAzn, setEstimatedRepairCostAzn] = useState<number>(
    vehicle ? Math.round(vehicle.priceAzn * 0.75) : 30000
  );
  const [salvageScrapValueAzn, setSalvageScrapValueAzn] = useState<number>(
    vehicle ? Math.round(vehicle.priceAzn * 0.25) : 10000
  );
  const [deductibleAzn, setDeductibleAzn] = useState<number>(500);
  const [ownerRetainsWreck, setOwnerRetainsWreck] = useState<boolean>(true);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<SalvageCategoryKey>(
    'HEAVY_COLLISION_REPAIRABLE'
  );
  const [airbagStatus, setAirbagStatus] = useState<AirbagDeploymentStatus>(
    'DEPLOYED_REPLACED_OEM'
  );

  // Auction Lot tab state
  const [selectedAuctionPreset, setSelectedAuctionPreset] = useState<SalvageAuctionPreset>(
    SALVAGE_VEHICLE_PRESETS[0]
  );
  const [auctionVinQuery, setAuctionVinQuery] = useState<string>('');

  // 3D Chassis & Weld telemetry stand state
  const [chassisPoints, setChassisPoints] = useState<ChassisDatumPoint[]>(INITIAL_CHASSIS_POINTS);
  const [weldJoints, setWeldJoints] = useState<UltrasoundWeldJoint[]>(INITIAL_WELD_JOINTS);

  // Accredited Centers filter & booking
  const [selectedCity, setSelectedCity] = useState<string>('Hamısı');
  const [bookingSuccessCenter, setBookingSuccessCenter] = useState<string | null>(null);
  const [bookingDate, setBookingDate] = useState<string>('2026-10-28');

  // Certificate & Public Registry
  const [registryQuery, setRegistryQuery] = useState<string>('');
  const [searchedCertificate, setSearchedCertificate] = useState<MockSalvageCertificate | null>(
    null
  );
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Calculations
  const totalLossResult = useMemo(() => {
    return calculateTotalLossPayout({
      preAccidentValueAzn,
      estimatedRepairCostAzn,
      salvageScrapValueAzn,
      deductibleAzn,
      ownerRetainsWreck,
      currency
    });
  }, [
    preAccidentValueAzn,
    estimatedRepairCostAzn,
    salvageScrapValueAzn,
    deductibleAzn,
    ownerRetainsWreck,
    currency
  ]);

  const chassisResult = useMemo(() => {
    return evaluateChassisDatumPoints(chassisPoints);
  }, [chassisPoints]);

  const weldResult = useMemo(() => {
    return evaluateUltrasoundWelds(weldJoints);
  }, [weldJoints]);

  const roadworthinessVerdict = useMemo(() => {
    return evaluateOverallRoadworthiness({
      categoryKey: selectedCategoryKey,
      isTotalLoss: totalLossResult.isTotalLoss,
      isChassisCompliant: chassisResult.isChassisCompliant,
      allWeldsCompliant: weldResult.allWeldsCompliant,
      airbagStatus
    });
  }, [
    selectedCategoryKey,
    totalLossResult.isTotalLoss,
    chassisResult.isChassisCompliant,
    weldResult.allWeldsCompliant,
    airbagStatus
  ]);

  const importCostResult = useMemo(() => {
    return calculateImportLandedCost({
      hammerPriceUsd: selectedAuctionPreset.auctionHammerPriceUsd,
      shippingAndCustomsAzn: selectedAuctionPreset.shippingAndCustomsAzn,
      estimatedRepairCostAzn: selectedAuctionPreset.estimatedRepairCostAzn,
      preAccidentValueAzn: selectedAuctionPreset.preAccidentValueAzn,
      currency
    });
  }, [selectedAuctionPreset, currency]);

  // Current active certificate
  const activeCertificate = useMemo(() => {
    return generateSalvageCertificate({
      vin: vehicle?.vin || selectedAuctionPreset.vin,
      lotNumber: selectedAuctionPreset.lotNumber,
      plateNumber: vehicle?.plateNumber || '99-SL-707',
      makeModel: vehicle ? `${vehicle.make} ${vehicle.model}` : selectedAuctionPreset.makeModel,
      year: vehicle?.year || selectedAuctionPreset.year,
      categoryKey: selectedCategoryKey,
      damageRatioPct: totalLossResult.damageRatioPct,
      preAccidentValueAzn,
      repairCostAzn: estimatedRepairCostAzn,
      salvageScrapValueAzn,
      chassisMaxDeviationMm: chassisResult.maxDeviationMm,
      ultrasoundWeldPass: weldResult.allWeldsCompliant,
      airbagStatus,
      inspectionCenterId: ACCREDITED_SALVAGE_CENTERS[0].id
    });
  }, [
    vehicle,
    selectedAuctionPreset,
    selectedCategoryKey,
    totalLossResult.damageRatioPct,
    preAccidentValueAzn,
    estimatedRepairCostAzn,
    salvageScrapValueAzn,
    chassisResult.maxDeviationMm,
    weldResult.allWeldsCompliant,
    airbagStatus
  ]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: SalvageAuctionPreset) => {
    setSelectedAuctionPreset(preset);
    setPreAccidentValueAzn(preset.preAccidentValueAzn);
    setEstimatedRepairCostAzn(preset.estimatedRepairCostAzn);
    setSalvageScrapValueAzn(Math.round(preset.preAccidentValueAzn * 0.28));
    setSelectedCategoryKey(preset.categoryKey);
    setAirbagStatus(preset.airbagStatus);
  };

  const handleChassisPointChange = (id: string, deviationMm: number) => {
    setChassisPoints((prev) =>
      prev.map((pt) => (pt.id === id ? { ...pt, measuredDeviationMm: deviationMm } : pt))
    );
  };

  const handleToggleWeldPorosity = (id: string) => {
    setWeldJoints((prev) =>
      prev.map((w) => (w.id === id ? { ...w, porosityDetected: !w.porosityDetected } : w))
    );
  };

  const handleSearchRegistry = () => {
    const found = lookupSalvageRecord(registryQuery, [activeCertificate]);
    setSearchedCertificate(found);
  };

  const handleCopyCertificate = () => {
    navigator.clipboard?.writeText(activeCertificate.certificateNumber);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const filteredCenters = ACCREDITED_SALVAGE_CENTERS.filter((c) =>
    selectedCity === 'Hamısı' ? true : c.city === selectedCity
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      data-testid="salvage-modal"
    >
      <div className="relative w-full max-w-5xl my-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                  AMB & İSB Rəsmi Reyestr
                </span>
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300">
                  BDYP Konstruktiv Nəzarət
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Konstruktiv Məhv («Total Loss») & Salvage Bərpa Portalı
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            data-testid="salvage-close-btn"
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            aria-label="Bağla"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/40 px-3">
          <button
            onClick={() => setActiveTab('calculator')}
            data-testid="tab-calculator-btn"
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'calculator'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Kalkulyator & Sığorta Zərəri</span>
          </button>
          <button
            onClick={() => setActiveTab('auction')}
            data-testid="tab-auction-btn"
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'auction'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Copart / IAAI İdxal Radarı</span>
          </button>
          <button
            onClick={() => setActiveTab('chassis3d')}
            data-testid="tab-chassis3d-btn"
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'chassis3d'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Maximize2 className="w-4 h-4" />
            <span>3D Şassi & Qaynaq Stendi</span>
          </button>
          <button
            onClick={() => setActiveTab('centers')}
            data-testid="tab-centers-btn"
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'centers'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Akkreditə Mərkəzlər</span>
          </button>
          <button
            onClick={() => setActiveTab('certificate')}
            data-testid="tab-certificate-btn"
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'certificate'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Rəsmi Sertifikat & Reyestr</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: CALCULATOR & TOTAL LOSS EVALUATION */}
          {activeTab === 'calculator' && (
            <div className="space-y-6" data-testid="salvage-calculator-tab">
              {/* Preset vehicle selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Sürətli Real Qəza və İdxal Nümunələri (Presets)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {SALVAGE_VEHICLE_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleApplyPreset(p)}
                      data-testid={`preset-btn-${p.id}`}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selectedAuctionPreset.id === p.id
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="text-xs font-bold truncate">{p.makeModel}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {p.auctionSource}
                      </div>
                      <div className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 mt-1">
                        Zərər: {p.categoryKey.split('_')[0]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Total Loss Gauge Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Qanunvericilik Həddi: 70.0%
                    </span>
                    <h3 className="text-xl font-black mt-2">
                      Zərər Nisbəti:{' '}
                      <span
                        className={
                          totalLossResult.isTotalLoss ? 'text-rose-400' : 'text-emerald-400'
                        }
                      >
                        {totalLossResult.damageRatioPct}%
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      {totalLossResult.isTotalLoss
                        ? `Konstruktiv Məhv həddi ${totalLossResult.thresholdDifferencePct}% aşıldı («Total Loss» təsdiqlənir)`
                        : `Konstruktiv Məhv həddindən ${Math.abs(
                            totalLossResult.thresholdDifferencePct
                          )}% aşağıdır (Təmir edilə biləndir)`}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400">Sığortaçının Ödənişi:</span>
                    <div className="text-2xl font-black text-amber-400" data-testid="insurer-payout-text">
                      {totalLossResult.formattedInsurerPayout}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Sahibkarın cəmi aktiv dəyəri: {totalLossResult.formattedOwnerNet}
                    </span>
                  </div>
                </div>

                {/* Progress bar with 70% threshold tick */}
                <div className="relative w-full h-4 bg-slate-700/80 rounded-full overflow-hidden border border-slate-600/50">
                  <div
                    className={`h-full transition-all duration-500 ${
                      totalLossResult.isTotalLoss
                        ? 'bg-gradient-to-r from-amber-500 to-rose-600'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    }`}
                    style={{ width: `${Math.min(100, totalLossResult.damageRatioPct)}%` }}
                  />
                  {/* Marker at 70% */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-10"
                    style={{ left: '70%' }}
                    title="70% Qanuni Hədd"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>0% (Zərərsiz)</span>
                  <span className="text-amber-300 font-bold">▲ 70% Qanuni Konstruktiv Məhv Həddi</span>
                  <span>100% (Tam Məhv)</span>
                </div>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700 dark:text-slate-300">
                        Qəzadan Əvvəlki Bazar Dəyəri (ACV):
                      </span>
                      <span className="text-amber-600 dark:text-amber-400 font-bold">
                        {formatPrice(preAccidentValueAzn, currency)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={5000}
                      max={150000}
                      step={1000}
                      value={preAccidentValueAzn}
                      onChange={(e) => setPreAccidentValueAzn(Number(e.target.value))}
                      data-testid="input-pre-accident-value"
                      className="w-full accent-amber-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700 dark:text-slate-300">
                        Ehtimal Olunan Təmir Smetası:
                      </span>
                      <span className="text-rose-600 dark:text-rose-400 font-bold">
                        {formatPrice(estimatedRepairCostAzn, currency)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1000}
                      max={120000}
                      step={500}
                      value={estimatedRepairCostAzn}
                      onChange={(e) => setEstimatedRepairCostAzn(Number(e.target.value))}
                      data-testid="input-repair-cost"
                      className="w-full accent-rose-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700 dark:text-slate-300">
                        Qalıq Hissələrin Hərrac/Metal Dəyəri (Salvage):
                      </span>
                      <span className="text-slate-900 dark:text-white font-bold">
                        {formatPrice(salvageScrapValueAzn, currency)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={500}
                      max={50000}
                      step={500}
                      value={salvageScrapValueAzn}
                      onChange={(e) => setSalvageScrapValueAzn(Number(e.target.value))}
                      data-testid="input-salvage-scrap"
                      className="w-full accent-slate-600"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700 dark:text-slate-300">
                        Sığorta Şərtsiz Azadolma Məbləği (Françiza):
                      </span>
                      <span className="text-slate-900 dark:text-white font-bold">
                        {formatPrice(deductibleAzn, currency)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={3000}
                      step={50}
                      value={deductibleAzn}
                      onChange={(e) => setDeductibleAzn(Number(e.target.value))}
                      data-testid="input-deductible"
                      className="w-full accent-slate-600"
                    />
                  </div>

                  {/* Toggle owner retains wreck */}
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Qalıq Avtomobili Sahibkar Saxlayır (Wreck Retention)
                      </span>
                      <input
                        type="checkbox"
                        checked={ownerRetainsWreck}
                        onChange={(e) => setOwnerRetainsWreck(e.target.checked)}
                        data-testid="toggle-wreck-retention"
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                      />
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {ownerRetainsWreck
                        ? 'Sığorta şirkəti qalıq hissənin qiymətini ödənişdən çıxır və avtomobil sahibkarda qalır.'
                        : 'Avtomobil tam şəkildə sığortaçıya verilir və sahibkara tam bazar dəyəri (françizasız) ödənilir.'}
                    </p>
                  </div>

                  {/* Category dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Qəza Kateqoriyası
                    </label>
                    <select
                      value={selectedCategoryKey}
                      onChange={(e) => setSelectedCategoryKey(e.target.value as SalvageCategoryKey)}
                      data-testid="select-salvage-category"
                      className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    >
                      {Object.values(SALVAGE_CATEGORIES).map((cat) => (
                        <option key={cat.key} value={cat.key}>
                          {cat.nameAz}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Legal Conclusion Alert */}
              <div
                className={`p-4 rounded-xl border flex gap-3 ${
                  totalLossResult.isTotalLoss
                    ? 'border-rose-300 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200'
                    : 'border-emerald-300 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200'
                }`}
                data-testid="legal-conclusion-banner"
              >
                {totalLossResult.isTotalLoss ? (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                )}
                <div className="text-xs space-y-1">
                  <div className="font-bold">
                    {totalLossResult.isTotalLoss
                      ? 'Dövlət İcbari Sığorta Standartı: Konstruktiv Məhv Qərarı'
                      : 'Konstruktiv Bərpa Olunan Nəqliyyat Statusu'}
                  </div>
                  <p className="leading-relaxed">{totalLossResult.legalConclusionAz}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COPART / IAAI SALVAGE IMPORT RADAR */}
          {activeTab === 'auction' && (
            <div className="space-y-6" data-testid="salvage-auction-tab">
              {/* VIN / Lot search bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Copart / IAAI Lot nömrəsi və ya VIN daxil edin..."
                    value={auctionVinQuery}
                    onChange={(e) => setAuctionVinQuery(e.target.value)}
                    data-testid="input-auction-query"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <button
                  onClick={() => {
                    if (auctionVinQuery) {
                      const match = SALVAGE_VEHICLE_PRESETS.find(
                        (p) =>
                          p.lotNumber.includes(auctionVinQuery) ||
                          p.vin.toLowerCase().includes(auctionVinQuery.toLowerCase())
                      );
                      if (match) handleApplyPreset(match);
                    }
                  }}
                  data-testid="btn-search-lot"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl"
                >
                  Yoxla
                </button>
              </div>

              {/* Auction Detail Card */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-3">
                  <div>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      {selectedAuctionPreset.auctionSource} · Lot #{selectedAuctionPreset.lotNumber}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {selectedAuctionPreset.makeModel} ({selectedAuctionPreset.year})
                    </h3>
                    <p className="text-xs font-mono text-slate-500">
                      VIN: {selectedAuctionPreset.vin}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                      {selectedAuctionPreset.titleBrand.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Primary & Secondary Damage */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 font-semibold block mb-0.5">Əsas Zədə (Primary Damage):</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">
                      {selectedAuctionPreset.primaryDamageAz}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 font-semibold block mb-0.5">İkinci Zədə (Secondary Damage):</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {selectedAuctionPreset.secondaryDamageAz}
                    </span>
                  </div>
                </div>

                {/* Airbag Deployment Warning Stand */}
                <div className="p-3.5 rounded-xl border border-amber-300 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-amber-900 dark:text-amber-300">
                      SRS Təhlükəsizlik Yastığı (Airbag) Statusu:
                    </span>
                    <select
                      value={airbagStatus}
                      onChange={(e) => setAirbagStatus(e.target.value as AirbagDeploymentStatus)}
                      data-testid="select-airbag-status"
                      className="p-1 rounded text-xs border border-amber-400 bg-white dark:bg-slate-900"
                    >
                      <option value="ALL_INTACT">Bütün yastıqlar saz (Açılmayıb)</option>
                      <option value="DEPLOYED_REPLACED_OEM">Partlayıb və Orijinal OEM ilə əvəzlənib</option>
                      <option value="DEPLOYED_DUMMY_RESISTOR_DETECTED">
                        TƏHLÜKƏ: 2.2Ω Rezistor «Obmanka» Aşkarlanıb!
                      </option>
                      <option value="UNVERIFIED">Yoxlanılmayıb</option>
                    </select>
                  </div>
                  {airbagStatus === 'DEPLOYED_DUMMY_RESISTOR_DETECTED' && (
                    <p className="text-rose-600 dark:text-rose-400 font-semibold mt-1">
                      ⚠️ XƏBƏRDARLIQ: Bakı bazarında bir çox satıcılar partlamış hava yastıqlarının yerinə 2.2 Ohm rezistor («obmanka») quraşdıraraq qəza xəbərdarlıq işığını söndürürlər. Bu nəqliyyat vasitəsinin BDYP qeydiyyatı qadağandır!
                    </p>
                  )}
                </div>

                {/* Financial ROI Breakdown */}
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Bakı Qapıya Çatdırılma, Gömrük & Təmir Rentabelliyi (ROI)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <span className="text-[10px] text-slate-400 block">ABŞ Hərrac Qiyməti</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        ${selectedAuctionPreset.auctionHammerPriceUsd} ({importCostResult.hammerPriceAzn} AZN)
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <span className="text-[10px] text-slate-400 block">Daşınma & Gömrük</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {importCostResult.shippingAndCustomsAzn} AZN
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <span className="text-[10px] text-slate-400 block">Bakı Təmir Xərci</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {importCostResult.estimatedRepairCostAzn} AZN
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800">
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-bold">
                        Qənaət / Təmiz Qazanc
                      </span>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        {importCostResult.formattedProfit} ({importCostResult.roiPercentage}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 3D CHASSIS GEOMETRY & ULTRASOUND WELD STAND */}
          {activeTab === 'chassis3d' && (
            <div className="space-y-6" data-testid="salvage-chassis-tab">
              {/* Verdict header */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  roadworthinessVerdict.isRoadPermitted
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                    : 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200'
                }`}
                data-testid="roadworthiness-verdict-banner"
              >
                <div className="flex items-center gap-3">
                  {roadworthinessVerdict.isRoadPermitted ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
                  )}
                  <div>
                    <h4 className="text-sm font-bold">{roadworthinessVerdict.titleAz}</h4>
                    <p className="text-xs mt-0.5 opacity-90">{roadworthinessVerdict.summaryAz}</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider bg-white/60 dark:bg-black/40">
                  {roadworthinessVerdict.statusCode}
                </span>
              </div>

              {/* 3D Chassis SVG & Datum sliders */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* SVG Vehicle Frame Map */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-white flex flex-col items-center justify-center relative min-h-[320px]">
                  <span className="text-[10px] font-mono text-slate-400 absolute top-3 left-3">
                    CELETTE NAJA 3D LASER FRAME BLUEPRINT
                  </span>
                  <div className="w-full max-w-[280px] h-[280px] relative">
                    <svg viewBox="0 0 100 100" className="w-full h-full stroke-slate-700 fill-none stroke-[1.5]">
                      {/* Unibody chassis outline */}
                      <path d="M 25 15 L 75 15 L 82 45 L 84 75 L 75 92 L 25 92 L 16 75 L 18 45 Z" strokeDasharray="2,2" />
                      <line x1="28" y1="20" x2="28" y2="40" stroke="#38bdf8" />
                      <line x1="72" y1="20" x2="72" y2="40" stroke="#38bdf8" />
                      <line x1="20" y1="48" x2="80" y2="48" stroke="#64748b" />
                      <line x1="18" y1="62" x2="82" y2="62" stroke="#64748b" />
                      <line x1="25" y1="85" x2="75" y2="85" stroke="#64748b" />
                    </svg>

                    {/* Sensor Datum Point Markers */}
                    {chassisPoints.map((pt) => {
                      const isFaulty = Math.abs(pt.measuredDeviationMm) > pt.maxToleranceMm;
                      return (
                        <div
                          key={pt.id}
                          style={{ left: `${pt.xPct}%`, top: `${pt.yPct}%` }}
                          className={`absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold shadow-md cursor-pointer transition-transform hover:scale-125 ${
                            isFaulty ? 'bg-rose-500 text-white animate-pulse' : 'bg-emerald-500 text-white'
                          }`}
                          title={`${pt.labelAz}: Δ ${pt.measuredDeviationMm} mm`}
                        >
                          !
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-4 text-[11px] text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Saz (≤ 2.0 mm)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Qüsur (&gt; 2.0 mm)
                    </span>
                  </div>
                </div>

                {/* Reference point adjustment sliders */}
                <div className="space-y-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 max-h-[340px] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Nəzarət Nöqtəsi Meyili (Tolerans: ±2.0 mm)
                    </span>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      Maks. Meyil: {chassisResult.maxDeviationMm} mm
                    </span>
                  </div>

                  {chassisPoints.map((pt) => {
                    const isFailing = Math.abs(pt.measuredDeviationMm) > pt.maxToleranceMm;
                    return (
                      <div key={pt.id} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-700 dark:text-slate-300">{pt.labelAz}</span>
                          <span
                            className={`font-bold ${
                              isFailing ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            Δ {pt.measuredDeviationMm} mm
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={8}
                          step={0.1}
                          value={pt.measuredDeviationMm}
                          onChange={(e) => handleChassisPointChange(pt.id, Number(e.target.value))}
                          data-testid={`slider-chassis-${pt.id}`}
                          className={`w-full ${isFailing ? 'accent-rose-600' : 'accent-emerald-600'}`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ultrasound Phased Array Weld Joint Testing Stand */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Ultrasəs Qaynaq Tikişi Qüsursuzluq Yoxlaması (Ultrasound Phased-Array)
                    </h4>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      weldResult.allWeldsCompliant
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                    }`}
                  >
                    {weldResult.allWeldsCompliant ? 'Bütün Tikişlər Qüsursuz' : 'Tikiş Qüsuru Var'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {weldJoints.map((w) => (
                    <div
                      key={w.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                          {w.jointLocationAz}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Qaynaq Nüfuzu: {w.penetrationDepthPct}% (Tələb: ≥{w.minPenetrationRequiredPct}%)
                        </span>
                      </div>
                      <button
                        onClick={() => handleToggleWeldPorosity(w.id)}
                        data-testid={`toggle-weld-porosity-${w.id}`}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-colors ${
                          w.porosityDetected
                            ? 'bg-rose-100 border-rose-300 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
                            : 'bg-emerald-100 border-emerald-300 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                        }`}
                      >
                        {w.porosityDetected ? 'Məsaməli (Qüsur)' : 'Məsaməsiz (Saz)'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACCREDITED REPAIR & METROLOGY CENTERS */}
          {activeTab === 'centers' && (
            <div className="space-y-6" data-testid="salvage-centers-tab">
              {/* City filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Şəhər:</span>
                {['Hamısı', 'Bakı', 'Sumqayıt', 'Gəncə'].map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    data-testid={`btn-filter-city-${city}`}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      selectedCity === city
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>

              {/* Booking success notification */}
              {bookingSuccessCenter && (
                <div
                  className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between"
                  data-testid="booking-success-banner"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>
                      Növbə uğurla təsdiqləndi: <strong>{bookingSuccessCenter}</strong> · Tarix:{' '}
                      {bookingDate}
                    </span>
                  </div>
                  <button
                    onClick={() => setBookingSuccessCenter(null)}
                    className="text-xs font-bold underline"
                  >
                    Bağla
                  </button>
                </div>
              )}

              {/* Centers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCenters.map((ctr) => (
                  <div
                    key={ctr.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                          {ctr.city} · Reytinq: ★ {ctr.rating}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                          {ctr.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">{ctr.address}</p>
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {formatPrice(ctr.priceAzn, currency)}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div>
                        <strong>Stend Cihazı:</strong> {ctr.benchEquipment}
                      </div>
                      <div>
                        <strong>Ultrasəs Defektoskop:</strong> {ctr.ultrasoundScanner}
                      </div>
                      <div className="text-slate-400">Əlaqə: {ctr.phone}</div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="p-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                      />
                      <button
                        onClick={() => setBookingSuccessCenter(ctr.name)}
                        data-testid={`btn-book-center-${ctr.id}`}
                        className="flex-1 py-1.5 px-3 bg-slate-900 dark:bg-amber-600 hover:bg-slate-800 dark:hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Növbə Rezervasiya Et</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: OFFICIAL CERTIFICATE & PUBLIC REGISTRY SEARCH */}
          {activeTab === 'certificate' && (
            <div className="space-y-6" data-testid="salvage-certificate-tab">
              {/* Public Registry Lookup */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  İSB & BDYP Vahid Dövlət Qəza və Salvage Reyestr Axtarışı
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Sertifikat nömrəsi, VIN və ya DQN daxil edin..."
                    value={registryQuery}
                    onChange={(e) => setRegistryQuery(e.target.value)}
                    data-testid="input-registry-search"
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  <button
                    onClick={handleSearchRegistry}
                    data-testid="btn-registry-lookup"
                    className="px-4 py-2 bg-slate-900 dark:bg-amber-600 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl"
                  >
                    Reyestrdə Axtar
                  </button>
                </div>

                {searchedCertificate && (
                  <div
                    className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1"
                    data-testid="registry-search-result"
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Qeydiyyat Tapıldı: {searchedCertificate.certificateNumber} ({searchedCertificate.status})
                    </div>
                    <div>
                      Avtomobil: {searchedCertificate.vehicleMakeModel} · DQN: {searchedCertificate.plateNumber} · VIN: {searchedCertificate.vin}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Verilmə tarixi: {searchedCertificate.issueDate} · Ekspert: {searchedCertificate.leadExpert}
                    </div>
                  </div>
                )}
              </div>

              {/* Official Certificate Canvas */}
              <div className="p-6 rounded-2xl border-2 border-amber-600/30 bg-white dark:bg-slate-900 shadow-xl space-y-5 relative">
                {/* Certificate Header */}
                <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    AZƏRBAYCAN RESPUBLİKASI MƏRKƏZİ BANKI (AMB)
                  </div>
                  <div className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider mt-0.5">
                    İCBARİ SIĞORTA BÜROSU (İSB) VƏ BDYP EKSPERTİZA MƏRKƏZİ
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                    KONSTRUKTİV MƏHV («TOTAL LOSS») VƏ ŞASSİ BƏRPA ŞƏHADƏTNAMƏSİ
                  </h3>
                  <div className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 mt-1">
                    Reyestr Nömrəsi: {activeCertificate.certificateNumber}
                  </div>
                </div>

                {/* Dossier Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <span className="text-[10px] text-slate-400 block">Nəqliyyat Vasitəsi</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {activeCertificate.vehicleMakeModel}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <span className="text-[10px] text-slate-400 block">Dövlət Qeydiyyat Nişanı</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {activeCertificate.plateNumber}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <span className="text-[10px] text-slate-400 block">VIN Kod</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white truncate block">
                      {activeCertificate.vin}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <span className="text-[10px] text-slate-400 block">Hüquqi Status</span>
                    <span
                      className={`font-bold ${
                        activeCertificate.status === 'ROAD_CIRCULATION_APPROVED'
                          ? 'text-emerald-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {activeCertificate.status}
                    </span>
                  </div>
                </div>

                {/* Technical Results Matrix */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Zərər Dağılma Nisbəti:</span>
                    <span className="font-bold">{activeCertificate.damageRatioPct}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">3D Lazer Şassi Meyili (Maks.):</span>
                    <span className="font-bold">{activeCertificate.chassisMaxDeviationMm} mm (Norma: ≤2.0 mm)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ultrasəs Qaynaq Defektoskopiyası:</span>
                    <span className="font-bold">
                      {activeCertificate.ultrasoundWeldPass ? 'Qüsursuz (Pass)' : 'Məsamə Aşkarlanıb (Fail)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">SRS Təhlükəsizlik Yastığı Vəziyyəti:</span>
                    <span className="font-bold">{activeCertificate.airbagStatus}</span>
                  </div>
                </div>

                {/* Signatures & Security */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                  <div className="text-slate-500 text-center sm:text-left">
                    <div>{activeCertificate.leadExpert}</div>
                    <div className="font-mono text-[10px] text-slate-400">
                      Təhlükəsizlik Haşı: {activeCertificate.digitalSecurityHash}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyCertificate}
                      data-testid="btn-copy-certificate"
                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 font-semibold text-xs transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copySuccess ? 'Kopyalandı!' : 'Nömrəni Kopyala'}</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      data-testid="btn-print-certificate"
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 font-semibold text-xs transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Çap Et</span>
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

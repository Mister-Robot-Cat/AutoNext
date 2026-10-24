import React, { useState, useMemo } from 'react';
import {
  X,
  Truck,
  Ship,
  Globe2,
  FileText,
  ShieldCheck,
  Search,
  Printer,
  Copy,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Compass,
  Scale,
  Award,
  Layers,
  Check,
} from 'lucide-react';
import { Vehicle, Currency } from '../types/vehicle';
import {
  FreightCargoType,
  FreightCorridorId,
  TransportRegime,
  DibPermitCategory,
  FreightCalculationInput,
} from '../types/internationalFreight';
import {
  MOCK_FREIGHT_CORRIDORS,
  MOCK_DIB_QUOTAS,
  MOCK_CARRIER_COMPANIES,
  MOCK_ACTIVE_CONSIGNMENTS,
  CARGO_TYPE_LABELS,
} from '../data/mockInternationalFreightData';
import {
  calculateFreightCosts,
  getDibQuotaAvailability,
  generateECmrNumber,
  generateCustomsSealNumber,
  convertAznToCurrency,
  CMR_SDR_PER_KG,
} from '../utils/internationalFreight';

export interface InternationalFreightModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: Vehicle | null;
  currency?: Currency;
}

type TabType = 'calculator' | 'corridors' | 'dib_quotas' | 'ecmr_voucher' | 'registry';

export const InternationalFreightModal: React.FC<InternationalFreightModalProps> = ({
  isOpen,
  onClose,
  currency = 'AZN',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('calculator');
  const [selectedCorridorId, setSelectedCorridorId] = useState<FreightCorridorId>('middle_corridor_caspian');
  const [selectedCargoType, setSelectedCargoType] = useState<FreightCargoType>('general_merchandise');
  const [grossWeightKg, setGrossWeightKg] = useState<number>(18500);
  const [declaredValueUsd, setDeclaredValueUsd] = useState<number>(45000);
  const [transportRegime, setTransportRegime] = useState<TransportRegime>('e_cmr_digital');
  const [useTirCarnet, setUseTirCarnet] = useState<boolean>(true);
  const [includeAdrsurcharge, setIncludeAdrsurcharge] = useState<boolean>(false);
  const [includeTemperatureControl, setIncludeTemperatureControl] = useState<boolean>(false);
  const [selectedCarrierId, setSelectedCarrierId] = useState<string>('carrier_silk_way');

  // DİB Quotas filter
  const [dibSearchQuery, setDibSearchQuery] = useState<string>('');
  const [dibCategoryFilter, setDibCategoryFilter] = useState<DibPermitCategory>('bilateral');

  // Registry filter
  const [registrySearch, setRegistrySearch] = useState<string>('');

  // Generated document state
  const [generatedCmrNumber, setGeneratedCmrNumber] = useState<string>(() => generateECmrNumber('1401889921'));
  const [customsSealNo, setCustomsSealNo] = useState<string>(() => generateCustomsSealNumber());
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

  // Active calculation input & result
  const calculationInput: FreightCalculationInput = useMemo(
    () => ({
      cargoType: selectedCargoType,
      grossWeightKg,
      declaredValueUsd,
      corridorId: selectedCorridorId,
      transportRegime,
      useTirCarnet,
      includeAdrsurcharge,
      includeTemperatureControl,
      carrierId: selectedCarrierId,
    }),
    [
      selectedCargoType,
      grossWeightKg,
      declaredValueUsd,
      selectedCorridorId,
      transportRegime,
      useTirCarnet,
      includeAdrsurcharge,
      includeTemperatureControl,
      selectedCarrierId,
    ]
  );

  const calcResult = useMemo(
    () => calculateFreightCosts(calculationInput, MOCK_FREIGHT_CORRIDORS, MOCK_CARRIER_COMPANIES),
    [calculationInput]
  );

  const selectedCorridor = useMemo(
    () => MOCK_FREIGHT_CORRIDORS.find((c) => c.id === selectedCorridorId) || MOCK_FREIGHT_CORRIDORS[0],
    [selectedCorridorId]
  );

  const selectedCarrier = useMemo(
    () => MOCK_CARRIER_COMPANIES.find((c) => c.id === selectedCarrierId) || MOCK_CARRIER_COMPANIES[0],
    [selectedCarrierId]
  );

  const filteredDibQuotas = useMemo(() => {
    return MOCK_DIB_QUOTAS.filter(
      (q) =>
        q.countryNameAz.toLowerCase().includes(dibSearchQuery.toLowerCase()) ||
        q.countryCode.toLowerCase().includes(dibSearchQuery.toLowerCase())
    );
  }, [dibSearchQuery]);

  const filteredConsignments = useMemo(() => {
    return MOCK_ACTIVE_CONSIGNMENTS.filter(
      (c) =>
        c.cmrNumber.toLowerCase().includes(registrySearch.toLowerCase()) ||
        c.carrierName.toLowerCase().includes(registrySearch.toLowerCase()) ||
        c.shipper.toLowerCase().includes(registrySearch.toLowerCase()) ||
        c.consignee.toLowerCase().includes(registrySearch.toLowerCase()) ||
        c.destCountry.toLowerCase().includes(registrySearch.toLowerCase()) ||
        c.cargoDesc.toLowerCase().includes(registrySearch.toLowerCase())
    );
  }, [registrySearch]);

  const formatMoney = (aznAmount: number) => {
    const converted = convertAznToCurrency(aznAmount, currency);
    const symbol = currency === 'AZN' ? '₼' : currency === 'USD' ? '$' : '€';
    return `${converted.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ${symbol}`;
  };

  const handleGenerateNewECmr = () => {
    const newCmr = generateECmrNumber(selectedCarrier.voen);
    const newSeal = generateCustomsSealNumber();
    setGeneratedCmrNumber(newCmr);
    setCustomsSealNo(newSeal);
    setActiveTab('ecmr_voucher');
  };

  const handleCopyECmr = () => {
    navigator.clipboard?.writeText(
      `E-CMR: ${generatedCmrNumber}\nDaşıyıcı: ${selectedCarrier.nameAz} (VÖEN: ${selectedCarrier.voen})\nGömrük Plombu: ${customsSealNo}\nMarşrut: ${selectedCorridor.nameAz}\nYük: ${CARGO_TYPE_LABELS[selectedCargoType].az} (${grossWeightKg.toLocaleString()} kq)\nSDR Məsuliyyət Həddi: ${calcResult.totalSdrLiability.toLocaleString()} SDR`
    );
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      data-testid="international-freight-modal"
    >
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/20">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase">
                  RİNN &bull; AYNA &bull; ABADA Rəsmi
                </span>
                <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/20">
                  UNECE e-CMR & IRU TIR
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Beynəlxalq Avtomobil Yük Daşımaları & E-CMR Portalı
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            data-testid="modal-close-button"
            aria-label="Bağla"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-900/60 px-6 py-2.5 gap-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('calculator')}
            data-testid="tab-calculator"
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
              activeTab === 'calculator'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Scale className="h-4 w-4" />
            <span>Xərc & SDR Hesablayıcı</span>
          </button>
          <button
            onClick={() => setActiveTab('corridors')}
            data-testid="tab-corridors"
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
              activeTab === 'corridors'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Compass className="h-4 w-4" />
            <span>Orta Dəhliz & Ro-Ro Bərə</span>
          </button>
          <button
            onClick={() => setActiveTab('dib_quotas')}
            data-testid="tab-dib_quotas"
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
              activeTab === 'dib_quotas'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>AYNA DİB Kvotaları</span>
          </button>
          <button
            onClick={() => setActiveTab('ecmr_voucher')}
            data-testid="tab-ecmr_voucher"
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
              activeTab === 'ecmr_voucher'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Rəsmi E-CMR Qaiməsi</span>
          </button>
          <button
            onClick={() => setActiveTab('registry')}
            data-testid="tab-registry"
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
              activeTab === 'registry'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Globe2 className="h-4 w-4" />
            <span>Canlı Tranzit Reyestri</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Form: Inputs */}
                <div className="lg:col-span-7 space-y-5 bg-slate-950/40 p-5 rounded-xl border border-slate-800">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Layers className="h-4 w-4 text-indigo-400" />
                    Yük və Marşrut Parametrləri
                  </h3>

                  {/* Corridor Selection */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Beynəlxalq Tranzit Dəhlizi
                    </label>
                    <select
                      value={selectedCorridorId}
                      onChange={(e) => setSelectedCorridorId(e.target.value as FreightCorridorId)}
                      className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      data-testid="corridor-select"
                    >
                      {MOCK_FREIGHT_CORRIDORS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nameAz} ({c.distanceKm} km {c.requiresRoRoFerry ? '+ Ro-Ro' : ''})
                        </option>
                      ))}
                    </select>
                    <p className="mt-1.5 text-xs text-slate-400">{selectedCorridor.descriptionAz}</p>
                  </div>

                  {/* Cargo Category */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Yükün Xarakteri və Kateqoriyası
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(Object.keys(CARGO_TYPE_LABELS) as FreightCargoType[]).map((key) => {
                        const item = CARGO_TYPE_LABELS[key];
                        const isSelected = selectedCargoType === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setSelectedCargoType(key)}
                            className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all text-xs ${
                              isSelected
                                ? 'bg-indigo-600/20 border-indigo-500 text-white font-medium shadow-sm'
                                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <span className="text-base mb-1">{item.icon}</span>
                            <span className="line-clamp-2 leading-tight">{item.az}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Weight & Value Sliders / Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-400">Brutto Çəki (kq)</span>
                        <span className="font-bold text-indigo-400">{grossWeightKg.toLocaleString()} kq</span>
                      </div>
                      <input
                        type="range"
                        min={1000}
                        max={24000}
                        step={500}
                        value={grossWeightKg}
                        onChange={(e) => setGrossWeightKg(Number(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer"
                        data-testid="gross-weight-slider"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>1,000 kq (Kiçik tonaj)</span>
                        <span>24,000 kq (Maksimum TIR)</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-400">Bəyan Olunmuş Dəyər (USD)</span>
                        <span className="font-bold text-emerald-400">${declaredValueUsd.toLocaleString()}</span>
                      </div>
                      <input
                        type="range"
                        min={5000}
                        max={200000}
                        step={5000}
                        value={declaredValueUsd}
                        onChange={(e) => setDeclaredValueUsd(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                        data-testid="declared-value-slider"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>$5,000</span>
                        <span>$200,000</span>
                      </div>
                    </div>
                  </div>

                  {/* Transport Regime & Toggles */}
                  <div className="pt-2 border-t border-slate-800 space-y-3">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Gömrük və Tranzit Rejimi
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'e_cmr_digital', label: 'E-CMR Rəqəmsal', desc: 'UN UNECE 2008 Protocol' },
                        { id: 'tir_carnet_iru', label: 'IRU TIR Carnet', desc: '€100,000 Zəmanət' },
                        { id: 'cmr_standard', label: 'Standart CMR', desc: 'Kağız Qaimə Formatı' },
                      ].map((reg) => (
                        <button
                          key={reg.id}
                          type="button"
                          onClick={() => setTransportRegime(reg.id as TransportRegime)}
                          className={`p-2.5 rounded-lg border text-left transition-all ${
                            transportRegime === reg.id
                              ? 'bg-blue-600/20 border-blue-500 text-white'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="text-xs font-bold text-slate-200">{reg.label}</div>
                          <div className="text-[10px] text-slate-400">{reg.desc}</div>
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-4 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                        <input
                          type="checkbox"
                          checked={useTirCarnet}
                          onChange={(e) => setUseTirCarnet(e.target.checked)}
                          className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
                          data-testid="tir-carnet-checkbox"
                        />
                        <span>IRU TIR Carnet Kitabçası (€100k sığorta zəmanəti)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                        <input
                          type="checkbox"
                          checked={includeAdrsurcharge}
                          onChange={(e) => setIncludeAdrsurcharge(e.target.checked)}
                          className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
                          data-testid="adr-surcharge-checkbox"
                        />
                        <span>ADR Təhlükəli Yük Təchizatı (+25%)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                        <input
                          type="checkbox"
                          checked={includeTemperatureControl}
                          onChange={(e) => setIncludeTemperatureControl(e.target.checked)}
                          className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
                          data-testid="reefer-checkbox"
                        />
                        <span>ATP Termoqrafik Soyuducu (+18%)</span>
                      </label>
                    </div>
                  </div>

                  {/* Certified Carrier Selection */}
                  <div className="pt-2 border-t border-slate-800">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      AYNA Akkreditə Olunmuş Beynəlxalq Daşıyıcı
                    </label>
                    <select
                      value={selectedCarrierId}
                      onChange={(e) => setSelectedCarrierId(e.target.value)}
                      className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      {MOCK_CARRIER_COMPANIES.map((car) => (
                        <option key={car.id} value={car.id}>
                          {car.nameAz} &bull; VÖEN: {car.voen} &bull; Reytinq: {car.rating} ⭐ ({car.fleetSize} avto)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Right Panel: Cost & SDR Breakdown */}
                <div className="lg:col-span-5 space-y-5">
                  <div className="bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 p-5 rounded-xl border border-indigo-500/30 shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
                      <div>
                        <span className="text-[10px] font-bold tracking-wider text-indigo-400 uppercase">
                          Hesablanmış Beynəlxalq Tarif
                        </span>
                        <h4 className="text-lg font-bold text-white">Yekun Fraxt Məbləği</h4>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-indigo-400" data-testid="total-freight-amount">
                          {formatMoney(calcResult.totalFreightAzn)}
                        </div>
                        <div className="text-xs text-slate-400 font-medium">
                          ${calcResult.totalFreightUsd.toLocaleString()} USD / €{calcResult.totalFreightEur.toLocaleString()} EUR
                        </div>
                      </div>
                    </div>

                    {/* Cost Line Items */}
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>Əsas Avtomobil Fraxtı ({selectedCorridor.distanceKm} km):</span>
                        <span className="font-semibold text-white">{formatMoney(calcResult.baseFreightAzn)}</span>
                      </div>

                      {calcResult.roRoFerryCostAzn > 0 && (
                        <div className="flex justify-between text-amber-300">
                          <span className="flex items-center gap-1">
                            <Ship className="h-3.5 w-3.5" />
                            Xəzər Dənizi Ro-Ro Bərə Keçidi:
                          </span>
                          <span className="font-semibold">{formatMoney(calcResult.roRoFerryCostAzn)}</span>
                        </div>
                      )}

                      {calcResult.tirCarnetFeeAzn > 0 && (
                        <div className="flex justify-between text-blue-300">
                          <span>IRU TIR Carnet Zəmanət Rüsumu:</span>
                          <span className="font-semibold">{formatMoney(calcResult.tirCarnetFeeAzn)}</span>
                        </div>
                      )}

                      {calcResult.surchargesAzn > 0 && (
                        <div className="flex justify-between text-slate-400">
                          <span>Xüsusi Təhlükəsizlik / Rejim Əlavəsi:</span>
                          <span className="font-semibold text-slate-300">{formatMoney(calcResult.surchargesAzn)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-emerald-400 pt-1 border-t border-slate-800">
                        <span>Vergi Məcəlləsi Maddə 165.1.4 (ƏDV):</span>
                        <span className="font-semibold">0% (Azad Olunub)</span>
                      </div>
                    </div>

                    {/* Transit Estimation KPI */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-indigo-500/20 text-center">
                      <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Təxmini Tranzit</div>
                        <div className="text-base font-bold text-white mt-0.5">
                          {calcResult.estimatedTransitDays} gün ({selectedCorridor.avgDurationHours} saat)
                        </div>
                      </div>
                      <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Sərhəd Keçidləri</div>
                        <div className="text-base font-bold text-indigo-400 mt-0.5">
                          {selectedCorridor.borderCrossings} Dövlət SBM
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Statutory SDR Liability Panel */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        CMR Konvensiyası Maddə 23 &bull; SDR Məsuliyyəti
                      </span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                        {CMR_SDR_PER_KG} SDR / kq
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 leading-relaxed">
                      Beynəlxalq CMR standartına görə daşıyıcının brutto çəki üzrə hüquqi məsuliyyət tavanı:
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-white">
                          {calcResult.totalSdrLiability.toLocaleString()} SDR
                        </div>
                        <div className="text-[11px] text-slate-400">
                          ≈ ${calcResult.sdrLiabilityUsd.toLocaleString()} USD ({formatMoney(calcResult.sdrLiabilityAzn)})
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-[10px] px-2 py-1 rounded-full font-semibold ${
                            calcResult.isLiabilityCappedByDeclaredValue
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {calcResult.isLiabilityCappedByDeclaredValue
                            ? 'Bəyan Dəyəri İlə Məhduddur'
                            : 'Tam SDR Təminatı'}
                        </span>
                      </div>
                    </div>

                    {/* Generate e-CMR Button */}
                    <button
                      type="button"
                      onClick={handleGenerateNewECmr}
                      className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-3 text-sm font-bold text-white hover:from-indigo-500 hover:to-blue-500 shadow-lg shadow-indigo-600/30 transition-all"
                      data-testid="generate-ecmr-button"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Rəsmi E-CMR Qaiməsi Yarat & Daxil Et</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CORRIDORS RADAR */}
          {activeTab === 'corridors' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Compass className="h-5 w-5 text-indigo-400" />
                    Azərbaycanın Strateji Beynəlxalq Nəqliyyat Dəhlizləri
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Orta Dəhliz (Middle Corridor), TRACECA, Şimal-Cənub və Avropa magistral arteriyaları
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_FREIGHT_CORRIDORS.map((corridor) => {
                  const isSelected = selectedCorridorId === corridor.id;
                  return (
                    <div
                      key={corridor.id}
                      onClick={() => setSelectedCorridorId(corridor.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500 shadow-lg'
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-2 rounded-lg ${
                              corridor.requiresRoRoFerry ? 'bg-cyan-500/10 text-cyan-400' : 'bg-indigo-500/10 text-indigo-400'
                            }`}
                          >
                            {corridor.requiresRoRoFerry ? <Ship className="h-5 w-5" /> : <Truck className="h-5 w-5" />}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">{corridor.nameAz}</h4>
                            <span className="text-[11px] text-slate-400">{corridor.nameEn}</span>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/40">
                            Aktiv Seçim
                          </span>
                        )}
                      </div>

                      <div className="mt-3 text-xs text-slate-300 leading-relaxed">{corridor.descriptionAz}</div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-slate-900/80 p-2 rounded-lg">
                          <div className="text-[10px] text-slate-500 uppercase">Məsafə</div>
                          <div className="font-bold text-slate-200 mt-0.5">{corridor.distanceKm} km</div>
                        </div>
                        <div className="bg-slate-900/80 p-2 rounded-lg">
                          <div className="text-[10px] text-slate-500 uppercase">Müddət</div>
                          <div className="font-bold text-slate-200 mt-0.5">{corridor.avgDurationHours} saat</div>
                        </div>
                        <div className="bg-slate-900/80 p-2 rounded-lg">
                          <div className="text-[10px] text-slate-500 uppercase">Baza Fraxt</div>
                          <div className="font-bold text-emerald-400 mt-0.5">${corridor.baseFreightRateUsd}</div>
                        </div>
                      </div>

                      {corridor.requiresRoRoFerry && (
                        <div className="mt-3 flex items-center justify-between p-2 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-300">
                          <span className="flex items-center gap-1.5">
                            <Ship className="h-3.5 w-3.5" />
                            {corridor.ferryPortName}
                          </span>
                          <span className="font-bold">+${corridor.ferryCostUsd} USD</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: DİB QUOTAS */}
          {activeTab === 'dib_quotas' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Award className="h-5 w-5 text-indigo-400" />
                    AYNA Dövlət İcazə Blankları (DİB) və Beynəlxalq Kvotalar
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    İkitərəfli, Tranzit və 3-cü ölkə icazə blanklarının rəsmi bölüşdürülməsi və qalıq balansı
                  </p>
                </div>

                {/* Search & Category Filter */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-56">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Ölkə axtarışı..."
                      value={dibSearchQuery}
                      onChange={(e) => setDibSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <select
                    value={dibCategoryFilter}
                    onChange={(e) => setDibCategoryFilter(e.target.value as DibPermitCategory)}
                    className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="bilateral">İkitərəfli (Bilateral)</option>
                    <option value="transit">Tranzit (Transit)</option>
                    <option value="third_country">3-cü Ölkə</option>
                  </select>
                </div>
              </div>

              {/* DİB Quota Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDibQuotas.map((quota) => {
                  const availability = getDibQuotaAvailability(quota, dibCategoryFilter);
                  return (
                    <div
                      key={quota.countryCode}
                      className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{quota.flagEmoji}</span>
                          <div>
                            <h4 className="text-sm font-bold text-white">{quota.countryNameAz}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ISO: {quota.countryCode} &bull; {quota.euroStandardReq}+
                            </span>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            availability.status === 'available'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : availability.status === 'limited'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {availability.status === 'available'
                            ? 'Mövcuddur'
                            : availability.status === 'limited'
                            ? 'Məhdud'
                            : 'Tükənib'}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-400">İstifadə dərəcəsi:</span>
                          <span className="font-semibold text-white">{availability.percentUsed}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              availability.percentUsed >= 90
                                ? 'bg-rose-500'
                                : availability.percentUsed >= 75
                                ? 'bg-amber-500'
                                : 'bg-indigo-500'
                            }`}
                            style={{ width: `${Math.min(100, availability.percentUsed)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                          <span>İstifadə edilib: {availability.used.toLocaleString()}</span>
                          <span>Qalıq: {availability.remaining.toLocaleString()} ədəd</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                        <span className="text-slate-400">Dövlət Rüsumu:</span>
                        <span className="font-semibold text-emerald-400">{quota.feeAzn} AZN</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: OFFICIAL E-CMR DOCUMENT */}
          {activeTab === 'ecmr_voucher' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-400" />
                    BMT UNECE Beynəlxalq E-CMR Elektron Yük Qaiməsi
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    2008-ci il e-CMR Əlavə Protokoluna uyğun rəqəmsal imzalı beynəlxalq sənəd
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyECmr}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                    data-testid="copy-ecmr-button"
                  >
                    {copiedSuccess ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedSuccess ? 'Kopyalandı' : 'Kopyala'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
                    data-testid="print-ecmr-button"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Çap Et</span>
                  </button>
                </div>
              </div>

              {/* Printable E-CMR Visual Layout (Matching standard 24-box CMR design) */}
              <div className="bg-slate-950 p-6 rounded-2xl border-2 border-indigo-500/40 text-slate-200 space-y-5 shadow-2xl">
                {/* Header Strip */}
                <div className="flex items-center justify-between border-b-2 border-indigo-500/30 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg">
                      CMR
                    </div>
                    <div>
                      <div className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
                        INTERNATIONAL CONSIGNMENT NOTE &bull; BEYNƏLXALQ NƏQLİYYAT QAİMƏSİ
                      </div>
                      <h4 className="text-base font-black text-white">{generatedCmrNumber}</h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-amber-400">PLOMB: {customsSealNo}</div>
                    <div className="text-[10px] text-slate-400">
                      Tarix: {new Date().toISOString().slice(0, 10)}
                    </div>
                  </div>
                </div>

                {/* 24-Box CMR Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Box 1: Sender / Shipper */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      1. Göndərən (Shipper / Sender)
                    </span>
                    <div className="font-bold text-white">SOCAR Polymer MMC / Sumqayıt Kimya Sənaye Parkı</div>
                    <div className="text-slate-400">Sumqayıt, Azərbaycan &bull; VÖEN: 1400192011</div>
                  </div>

                  {/* Box 2: Consignee */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      2. Qəbul Edən (Consignee)
                    </span>
                    <div className="font-bold text-white">Polimer Plastik Sanayi ve Ticaret A.Ş.</div>
                    <div className="text-slate-400">{selectedCorridor.destinationAz}</div>
                  </div>

                  {/* Box 3: Place of Delivery */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      3. Yükün Təhvil Verilmə Yeri
                    </span>
                    <div className="font-bold text-slate-200">{selectedCorridor.destinationAz}</div>
                    <div className="text-slate-400">Təyinat Ölkəsi SBM terminalı</div>
                  </div>

                  {/* Box 4: Place of Loading */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      4. Yükün Qəbul Edildiyi Yer və Tarix
                    </span>
                    <div className="font-bold text-slate-200">{selectedCorridor.originAz}</div>
                    <div className="text-slate-400">{new Date().toLocaleDateString('az-AZ')}</div>
                  </div>

                  {/* Box 16: Carrier */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1 md:col-span-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      16. Daşıyıcı (Carrier / Transporteur)
                    </span>
                    <div className="font-bold text-indigo-300">
                      {selectedCarrier.nameAz} &bull; AYNA Lisenziya: {selectedCarrier.aynaLicenseNo}
                    </div>
                    <div className="text-slate-400">
                      ABADA Üzvlük №: {selectedCarrier.abadaMemberNo} &bull; VÖEN: {selectedCarrier.voen}
                    </div>
                  </div>

                  {/* Cargo Breakdown */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1 md:col-span-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      6-12. Yükün Təsviri, Qablaşdırma və Çəkisi
                    </span>
                    <div className="grid grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Yük Növü:</span>
                        <span className="font-bold text-white">{CARGO_TYPE_LABELS[selectedCargoType].az}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Brutto Çəki:</span>
                        <span className="font-bold text-white">{grossWeightKg.toLocaleString()} kq</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">SDR Məsuliyyət Həddi:</span>
                        <span className="font-bold text-indigo-400">
                          {calcResult.totalSdrLiability.toLocaleString()} SDR
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Gömrük Rejimi:</span>
                        <span className="font-bold text-amber-400">
                          {useTirCarnet ? 'IRU TIR Carnet' : 'Standart E-CMR'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Validation Strip */}
                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-800 text-[11px] text-slate-400 gap-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    <span>AYNA Rəqəmsal İmza və QR Yoxlama Kodu Aktivdir</span>
                  </div>
                  <div className="font-mono text-slate-500">
                    SHA-256: 4f9b8c2e...{generatedCmrNumber.slice(-8)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ACTIVE CONSIGNMENTS REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Globe2 className="h-5 w-5 text-indigo-400" />
                    Canlı Beynəlxalq Yük Daşımaları Reyestri
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Azərbaycan ərazisindən keçən və xaricə daşınan aktiv E-CMR və TIR daşımaları
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="CMR nömrəsi, daşıyıcı..."
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    data-testid="registry-search-input"
                  />
                </div>
              </div>

              {/* Table of Consignments */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800 font-semibold tracking-wider">
                    <tr>
                      <th className="py-3 px-4">E-CMR Nömrəsi</th>
                      <th className="py-3 px-4">Daşıyıcı</th>
                      <th className="py-3 px-4">Marşrut</th>
                      <th className="py-3 px-4">Yük / Çəki</th>
                      <th className="py-3 px-4">Nömrə / Plomb</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                    {filteredConsignments.map((item) => (
                      <tr key={item.cmrNumber} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                          {item.cmrNumber}
                          {item.tirCarnetNo && (
                            <span className="block text-[10px] text-slate-500">{item.tirCarnetNo}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{item.carrierName}</div>
                          <div className="text-[10px] text-slate-400">
                            {item.shipper} &bull; VÖEN: {item.carrierVoen}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-slate-200">
                            {item.originCity} &rarr; {item.destCity} ({item.destCountry})
                          </div>
                          <div className="text-[10px] text-slate-500">{item.currentLocation}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-slate-200">{item.cargoDesc}</div>
                          <div className="text-[10px] text-slate-400">{item.grossWeightKg.toLocaleString()} kq</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px]">
                          <div className="text-slate-300">{item.tractorPlate}</div>
                          <div className="text-[10px] text-amber-400">{item.customsSealNo}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === 'in_transit'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : item.status === 'ro_ro_crossing'
                                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                : item.status === 'at_border_customs'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {item.status === 'in_transit' && 'Yolda'}
                            {item.status === 'ro_ro_crossing' && 'Ro-Ro Bərəsində'}
                            {item.status === 'at_border_customs' && 'Gömrükdə'}
                            {item.status === 'delivered' && 'Çatdırıldı'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/80 px-6 py-3.5 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>RİNN AYNA Lisenziya və BMT e-CMR Standartı № 2026</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-4 py-2 font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
};

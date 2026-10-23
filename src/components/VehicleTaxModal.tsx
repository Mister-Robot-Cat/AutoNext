import React, { useState, useId } from 'react';
import {
  ReceiptText,
  Calculator,
  Building2,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Printer,
  Copy,
  Check,
  Search,
  ArrowRight,
  TrendingDown,
  Percent,
  Coins,
  ShieldCheck,
  HelpCircle,
  Car,
  Truck,
  Bus,
  Zap,
  Phone,
  FileText,
  X,
  Share2,
} from 'lucide-react';
import {
  VehicleTaxCategory,
  TaxRegimeType,
  DepreciationMethod,
  RoadTaxCalculationResult,
  TradeInVatResult,
  CorporateDepreciationResult,
  ElectronicTaxInvoice,
  calculateAnnualRoadTax,
  calculateTradeInVat,
  calculateCorporateFleetDepreciation,
  generateTaxInvoice,
  filterTaxOffices,
  filterTaxInvoices,
  convertTaxCurrency,
} from '../utils/vehicleTax';
import {
  MOCK_TAX_OFFICES,
  SAMPLE_TAX_PRESETS,
  MOCK_ACTIVE_TAX_INVOICES,
  TAX_REGULATIONS_INFO,
} from '../data/mockVehicleTaxData';

const getAzeriOrdinalYear = (year: number): string => {
  if (year === 3 || year === 4) return `${year}-cü il`;
  if (year === 6) return `${year}-cı il`;
  if (year === 9 || year === 10) return `${year}-cu il`;
  return `${year}-ci il`;
};

interface VehicleTaxModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVehicle?: {
    makeModel?: string;
    vin?: string;
    plate?: string;
    engineCc?: number;
    isElectric?: boolean;
    price?: number;
  };
}

export const VehicleTaxModal: React.FC<VehicleTaxModalProps> = ({
  isOpen,
  onClose,
  initialVehicle,
}) => {
  const [activeTab, setActiveTab] = useState<
    'road_tax' | 'trade_in_vat' | 'fleet_depreciation' | 'tax_offices' | 'e_invoice'
  >('road_tax');

  // Road Tax Tab State
  const [category, setCategory] = useState<VehicleTaxCategory>(
    initialVehicle?.isElectric ? 'electric_car' : 'passenger_car'
  );
  const [engineCc, setEngineCc] = useState<number>(initialVehicle?.engineCc || 1998);
  const [isElectric, setIsElectric] = useState<boolean>(initialVehicle?.isElectric || false);
  const [seatingCapacity, setSeatingCapacity] = useState<number>(18);
  const [payloadTons, setPayloadTons] = useState<number>(3.5);

  // Trade-In VAT Tab State
  const [purchasePrice, setPurchasePrice] = useState<number>(
    initialVehicle?.price ? Math.max(1000, initialVehicle.price - 4000) : 24000
  );
  const [sellingPrice, setSellingPrice] = useState<number>(
    initialVehicle?.price || 28000
  );
  const [taxRegime, setTaxRegime] = useState<TaxRegimeType>('vat_payer');

  // Corporate Fleet Depreciation Tab State
  const [assetValue, setAssetValue] = useState<number>(initialVehicle?.price || 45000);
  const [usefulLifeYears, setUsefulLifeYears] = useState<number>(4);
  const [depreciationMethod, setDepreciationMethod] =
    useState<DepreciationMethod>('straight_line');

  // Tax Offices Radar Tab State
  const [officeSearch, setOfficeSearch] = useState<string>('');
  const [onlyAsan, setOnlyAsan] = useState<boolean>(false);

  // Electronic Invoices Tab State
  const [invoices, setInvoices] = useState<ElectronicTaxInvoice[]>(MOCK_ACTIVE_TAX_INVOICES);
  const [selectedInvoice, setSelectedInvoice] = useState<ElectronicTaxInvoice | null>(
    MOCK_ACTIVE_TAX_INVOICES[0] || null
  );
  const [invoiceSearch, setInvoiceSearch] = useState<string>('');
  const [copiedInvoiceId, setCopiedInvoiceId] = useState<string | null>(null);

  // New Invoice Form State
  const [sellerVoen, setSellerVoen] = useState<string>('1402948211');
  const [sellerName, setSellerName] = useState<string>('«Baku Auto Prime» MMC');
  const [buyerVoenOrFin, setBuyerVoenOrFin] = useState<string>('7ABC991');
  const [buyerName, setBuyerName] = useState<string>('Elvin Məmmədov Tofiq oğlu');
  const [buyerType, setBuyerType] = useState<'individual' | 'legal_entity'>('individual');
  const [invoicePlate, setInvoicePlate] = useState<string>(initialVehicle?.plate || '99-XY-777');
  const [invoiceVin, setInvoiceVin] = useState<string>(
    initialVehicle?.vin || 'WBA53AH090P982143'
  );
  const [invoiceModel, setInvoiceModel] = useState<string>(
    initialVehicle?.makeModel || 'Toyota Camry 2.5L'
  );

  const roadTaxResult: RoadTaxCalculationResult = calculateAnnualRoadTax({
    category,
    engineDisplacementCc: isElectric ? 0 : engineCc,
    isElectric,
    seatingCapacity,
    payloadCapacityTons: payloadTons,
  });

  const tradeInResult: TradeInVatResult = calculateTradeInVat({
    purchasePrice,
    sellingPrice,
    taxRegime,
  });

  const depreciationResult: CorporateDepreciationResult =
    calculateCorporateFleetDepreciation(
      assetValue,
      usefulLifeYears,
      depreciationMethod
    );

  const filteredOffices = filterTaxOffices(MOCK_TAX_OFFICES, officeSearch, onlyAsan);
  const filteredInvoices = filterTaxInvoices(invoices, invoiceSearch);

  const handleApplyPreset = (preset: (typeof SAMPLE_TAX_PRESETS)[0]) => {
    setCategory(preset.category);
    setEngineCc(preset.engineDisplacementCc);
    setIsElectric(!!preset.isElectric);
    if (preset.seatingCapacity) setSeatingCapacity(preset.seatingCapacity);
    if (preset.payloadCapacityTons) setPayloadTons(preset.payloadCapacityTons);
    setPurchasePrice(preset.typicalPurchasePriceAzn);
    setSellingPrice(preset.typicalResalePriceAzn);
    setAssetValue(preset.typicalResalePriceAzn);
    setInvoiceModel(preset.nameAz);
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const newInv = generateTaxInvoice({
      sellerVoen,
      sellerName,
      buyerVoenOrFin,
      buyerName,
      buyerType,
      vehiclePlate: invoicePlate,
      vehicleVin: invoiceVin,
      vehicleMakeModel: invoiceModel,
      vehicleYear: 2024,
      engineDisplacementCc: isElectric ? 0 : engineCc,
      purchasePriceAzn: purchasePrice,
      sellingPriceAzn: sellingPrice,
    });
    setInvoices([newInv, ...invoices]);
    setSelectedInvoice(newInv);
  };

  const handleCopyCode = (inv: ElectronicTaxInvoice) => {
    navigator.clipboard?.writeText(inv.invoiceNumber);
    setCopiedInvoiceId(inv.id);
    setTimeout(() => setCopiedInvoiceId(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const categoryRadioId = useId();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      data-testid="vehicle-tax-modal"
    >
      <div className="relative w-full max-w-5xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-cyan-800 text-white p-5 sm:p-6 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
                <ReceiptText className="w-7 h-7 text-emerald-200" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-300/30 text-emerald-100">
                    Dövlət Vergi Xidməti (DVX)
                  </span>
                  <span className="text-xs font-mono text-emerald-200">
                    AVİS / E-Taxes
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-1 text-white">
                  Avtomobil Vergi Portalı və E-Qaimə Sistemi
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100/90 mt-0.5">
                  İllik Yol Vergisi (Maddə 209–211), Ticarət Əlavəsi üzrə 18% ƏDV, 25% Amortizasiya və Elektron Qaimə-Faktura
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              data-testid="tax-modal-close-btn"
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              aria-label="Bağla"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1.5 sm:gap-2 mt-5 overflow-x-auto pb-1 scrollbar-none border-b border-white/15">
            <button
              onClick={() => setActiveTab('road_tax')}
              data-testid="tab-road-tax"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'road_tax'
                  ? 'bg-white text-emerald-950 font-semibold shadow-sm'
                  : 'text-emerald-100/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Yol Vergisi</span>
            </button>
            <button
              onClick={() => setActiveTab('trade_in_vat')}
              data-testid="tab-trade-in-vat"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'trade_in_vat'
                  ? 'bg-white text-emerald-950 font-semibold shadow-sm'
                  : 'text-emerald-100/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Percent className="w-4 h-4" />
              <span>Ticarət Əlavəsi & ƏDV</span>
            </button>
            <button
              onClick={() => setActiveTab('fleet_depreciation')}
              data-testid="tab-fleet-depreciation"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'fleet_depreciation'
                  ? 'bg-white text-emerald-950 font-semibold shadow-sm'
                  : 'text-emerald-100/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              <span>Avtopark Amortizasiyası</span>
            </button>
            <button
              onClick={() => setActiveTab('tax_offices')}
              data-testid="tab-tax-offices"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'tax_offices'
                  ? 'bg-white text-emerald-950 font-semibold shadow-sm'
                  : 'text-emerald-100/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>DVX & ASAN Radarı</span>
            </button>
            <button
              onClick={() => setActiveTab('e_invoice')}
              data-testid="tab-e-invoice"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'e_invoice'
                  ? 'bg-white text-emerald-950 font-semibold shadow-sm'
                  : 'text-emerald-100/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>E-Qaimə-Faktura</span>
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-gray-800 dark:text-gray-100 space-y-6">
          {/* TAB 1: ANNUAL ROAD TAX */}
          {activeTab === 'road_tax' && (
            <div className="space-y-6" data-testid="road-tax-section">
              {/* Presets Bar */}
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                  Nümunəvi Avtomobil Modelləri (Sürətli Seçim)
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {SAMPLE_TAX_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleApplyPreset(p)}
                      data-testid={`preset-btn-${p.id}`}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-xs font-medium text-gray-700 dark:text-gray-200 transition-colors whitespace-nowrap flex items-center gap-1.5"
                    >
                      {p.isElectric ? (
                        <Zap className="w-3.5 h-3.5 text-emerald-500" />
                      ) : p.category === 'bus' ? (
                        <Bus className="w-3.5 h-3.5 text-blue-500" />
                      ) : p.category === 'truck' ? (
                        <Truck className="w-3.5 h-3.5 text-amber-500" />
                      ) : (
                        <Car className="w-3.5 h-3.5 text-gray-500" />
                      )}
                      <span>{p.nameAz}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  { id: 'passenger_car', label: 'Minik Avtomobili', icon: Car },
                  { id: 'electric_car', label: 'Elektromobil (EV)', icon: Zap },
                  { id: 'bus', label: 'Avtobus / Sprinter', icon: Bus },
                  { id: 'truck', label: 'Yük Avtomobili', icon: Truck },
                  { id: 'motorcycle', label: 'Motosiklet', icon: Coins },
                ].map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setCategory(cat.id as VehicleTaxCategory);
                        setIsElectric(cat.id === 'electric_car');
                      }}
                      data-testid={`category-btn-${cat.id}`}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold shadow-sm'
                          : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'}`} />
                      <span className="text-xs">{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Parameter Controls */}
              <div className="bg-gray-50 dark:bg-gray-800/40 p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 space-y-4">
                {category === 'passenger_car' && !isElectric && (
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Mühərrikin İşçi Həcmi (sm³)
                      </label>
                      <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {engineCc} sm³ ({(engineCc / 1000).toFixed(1)} L)
                      </span>
                    </div>
                    <input
                      type="range"
                      min={600}
                      max={6500}
                      step={50}
                      value={engineCc}
                      onChange={(e) => setEngineCc(Number(e.target.value))}
                      data-testid="input-engine-cc"
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-gray-400 mt-1 font-mono">
                      <span>≤2,000 (0.02 ₼)</span>
                      <span>2,001–3,000 (40+0.03 ₼)</span>
                      <span>3,001–4,000 (70+0.04 ₼)</span>
                      <span>4,001–5,000 (110+0.05 ₼)</span>
                      <span>&gt;5,000 (160+0.06 ₼)</span>
                    </div>
                  </div>
                )}

                {category === 'bus' && (
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Sərnişin Oturacaq Yerlərinin Sayı
                      </label>
                      <span className="text-base font-bold font-mono text-blue-600 dark:text-blue-400">
                        {seatingCapacity} yer
                      </span>
                    </div>
                    <input
                      type="range"
                      min={8}
                      max={60}
                      step={1}
                      value={seatingCapacity}
                      onChange={(e) => setSeatingCapacity(Number(e.target.value))}
                      data-testid="input-seating-capacity"
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-gray-400 mt-1 font-mono">
                      <span>≤12 yer (0.15 ₼/yer)</span>
                      <span>13–30 yer (0.30 ₼/yer)</span>
                      <span>&gt;30 yer (0.50 ₼/yer)</span>
                    </div>
                  </div>
                )}

                {category === 'truck' && (
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Yükqaldırma Qabiliyyəti (Ton)
                      </label>
                      <span className="text-base font-bold font-mono text-amber-600 dark:text-amber-400">
                        {payloadTons} ton
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={25}
                      step={0.5}
                      value={payloadTons}
                      onChange={(e) => setPayloadTons(Number(e.target.value))}
                      data-testid="input-payload-tons"
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-gray-400 mt-1 font-mono">
                      <span>≤1t (20 ₼)</span>
                      <span>1–3t (40 ₼)</span>
                      <span>3–5t (60 ₼)</span>
                      <span>5–10t (100 ₼)</span>
                      <span>&gt;10t (150 ₼)</span>
                    </div>
                  </div>
                )}

                {isElectric && (
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200">
                    <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <div className="text-xs">
                      <p className="font-semibold text-emerald-900 dark:text-emerald-100">
                        Elektromobil Yaşıl İqtisadiyyat Güzəşti
                      </p>
                      <p className="text-emerald-700 dark:text-emerald-300 mt-0.5">
                        Vergi Məcəlləsinə əsasən, sıfır zərərli tullantılı tam elektrik mühərrikli avtomobillər illik yol vergisindən tam azaddır (0 AZN).
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Result Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300 block">
                    İllik Dövlət Yol Vergisi
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-900 dark:text-emerald-100 mt-1">
                    {roadTaxResult.roadTaxAzn.toFixed(2)} AZN
                  </div>
                  <span className="text-xs text-emerald-600/80 dark:text-emerald-400 block mt-1">
                    {roadTaxResult.roadTaxUsd} USD / {roadTaxResult.roadTaxEur} EUR
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 sm:col-span-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block">
                    Qanuni Hesablama Düsturu & Maddə
                  </span>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 font-mono mt-1">
                    {roadTaxResult.statutoryFormulaAz}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 block mt-1">
                    {roadTaxResult.legalArticle} (Texniki baxış zamanı BDYP tərəfindən tutulur)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TRADE-IN MARGIN VAT */}
          {activeTab === 'trade_in_vat' && (
            <div className="space-y-6" data-testid="trade-in-vat-section">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 space-y-3">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                    Avtodiler Alış Qiyməti (AZN)
                  </label>
                  <p className="text-xs text-gray-500">
                    Fiziki şəxsdən (vətəndaşdan) alınan məbləğ
                  </p>
                  <div className="relative">
                    <input
                      type="number"
                      min={500}
                      step={500}
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(Math.max(0, Number(e.target.value)))}
                      data-testid="input-purchase-price"
                      className="w-full pl-3 pr-12 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-semibold font-mono"
                    />
                    <span className="absolute right-3 top-2 text-xs font-mono text-gray-400">
                      AZN
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 space-y-3">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                    Hədəf Satış Qiyməti (AZN)
                  </label>
                  <p className="text-xs text-gray-500">
                    Müştəriyə təklif olunan son satış qiyməti
                  </p>
                  <div className="relative">
                    <input
                      type="number"
                      min={500}
                      step={500}
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(Math.max(0, Number(e.target.value)))}
                      data-testid="input-selling-price"
                      className="w-full pl-3 pr-12 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-semibold font-mono"
                    />
                    <span className="absolute right-3 top-2 text-xs font-mono text-gray-400">
                      AZN
                    </span>
                  </div>
                </div>
              </div>

              {/* Tax Regime Selector */}
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                  Dilerin Vergi Rejimi
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setTaxRegime('vat_payer')}
                    data-testid="regime-vat-payer"
                    className={`p-3 rounded-xl border text-left transition-all ${
                      taxRegime === 'vat_payer'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-semibold'
                        : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-medium">ƏDV Ödəyicisi (18% Ticarət Əlavəsi)</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-normal">
                      Maddə 159: ƏDV yalnız (Satış - Alış) fərqinə tətbiq edilir.
                    </p>
                  </button>

                  <button
                    onClick={() => setTaxRegime('simplified')}
                    data-testid="regime-simplified"
                    className={`p-3 rounded-xl border text-left transition-all ${
                      taxRegime === 'simplified'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-semibold'
                        : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">Sadələşdirilmiş Vergi (2% Dövriyyə)</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-normal">
                      Maddə 218: Ümumi satış məbləğindən birbaşa 2% vergi tutulur.
                    </p>
                  </button>
                </div>
              </div>

              {/* Trade In VAT Result Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40">
                  <span className="text-xs text-gray-500 block">Ticarət Əlavəsi (Margin)</span>
                  <div className="text-lg font-bold font-mono text-gray-900 dark:text-gray-100 mt-1">
                    {tradeInResult.tradeMarginAzn.toFixed(2)} AZN
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40">
                  <span className="text-xs text-gray-500 block">Vergi Məbləği</span>
                  <div className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
                    {tradeInResult.totalTaxLiabilityAzn.toFixed(2)} AZN
                  </div>
                  <span className="text-[11px] text-gray-400">
                    {taxRegime === 'vat_payer' ? '18% ƏDV' : '2% Sadələşdirilmiş'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
                  <span className="text-xs text-emerald-700 dark:text-emerald-300 block">Xalis Diler Mənfəəti</span>
                  <div className="text-lg font-bold font-mono text-emerald-800 dark:text-emerald-200 mt-1">
                    {tradeInResult.netDealerProfitAzn.toFixed(2)} AZN
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40">
                  <span className="text-xs text-gray-500 block">Effektiv Vergi Yükü</span>
                  <div className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
                    {tradeInResult.effectiveTaxRatePercent}%
                  </div>
                </div>
              </div>

              {/* Informational Legal Note */}
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-100 flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">İkinci Əl Avtomobil Ticarətində ƏDV Üstünlüyü</p>
                  <p className="mt-0.5 text-blue-700 dark:text-blue-300">
                    Əvvəllər bütün satış məbləğinə tətbiq olunan 18% ƏDV əvəzinə, hazırda yalnız dilerin ticarət marjasına (əlavəsinə) ƏDV hesablanır. Bu mexanizm rəsmi avtosalonlarda trade-in qiymətlərini 15%-dək sərfəli edir.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CORPORATE FLEET DEPRECIATION */}
          {activeTab === 'fleet_depreciation' && (
            <div className="space-y-6" data-testid="fleet-depreciation-section">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    Avtomobilin İlkin Balans Dəyəri (AZN)
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    value={assetValue}
                    onChange={(e) => setAssetValue(Math.max(0, Number(e.target.value)))}
                    data-testid="input-asset-value"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-semibold font-mono"
                  />
                </div>

                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    Amortizasiya Metodu
                  </label>
                  <select
                    value={depreciationMethod}
                    onChange={(e) => setDepreciationMethod(e.target.value as DepreciationMethod)}
                    data-testid="select-depreciation-method"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium"
                  >
                    <option value="straight_line">Xətti Metod (İllik Sabit 25%)</option>
                    <option value="declining_balance">Azalan Qalıq Metodu (25%)</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    İstismar Müddəti
                  </label>
                  <select
                    value={usefulLifeYears}
                    onChange={(e) => setUsefulLifeYears(Number(e.target.value))}
                    data-testid="select-useful-life"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium"
                  >
                    <option value={4}>4 il (Qanuni 25% norma üzrə)</option>
                    <option value={5}>5 il (İllik 20%)</option>
                    <option value={6}>6 il (İllik 16.6%)</option>
                  </select>
                </div>
              </div>

              {/* Depreciation Schedule Table */}
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold">
                    <tr>
                      <th className="p-3">İl</th>
                      <th className="p-3">İlin Əvvəlinə Qalıq</th>
                      <th className="p-3">İllik 25% Amortizasiya</th>
                      <th className="p-3">Yığılmış Amortizasiya</th>
                      <th className="p-3">İlin Sonuna Qalıq</th>
                      <th className="p-3">1% Əmlak Vergisi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800 font-mono">
                    {depreciationResult.schedule.map((row) => (
                      <tr key={row.year} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">
                          {getAzeriOrdinalYear(row.year)}
                        </td>
                        <td className="p-3">{row.startingBookValueAzn.toFixed(2)} ₼</td>
                        <td className="p-3 text-red-600 dark:text-red-400">
                          -{row.depreciationExpenseAzn.toFixed(2)} ₼
                        </td>
                        <td className="p-3">{row.accumulatedDepreciationAzn.toFixed(2)} ₼</td>
                        <td className="p-3 font-semibold">{row.endingBookValueAzn.toFixed(2)} ₼</td>
                        <td className="p-3 text-blue-600 dark:text-blue-400">
                          {row.annualPropertyTaxAzn.toFixed(2)} ₼
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-800/80 font-semibold font-mono text-gray-900 dark:text-gray-100">
                    <tr>
                      <td className="p-3">Yekun:</td>
                      <td className="p-3">—</td>
                      <td className="p-3 text-red-600 dark:text-red-400">
                        -{depreciationResult.totalDepreciationAzn.toFixed(2)} ₼
                      </td>
                      <td className="p-3">—</td>
                      <td className="p-3">
                        {depreciationResult.schedule[depreciationResult.schedule.length - 1]?.endingBookValueAzn.toFixed(2)} ₼
                      </td>
                      <td className="p-3 text-blue-600 dark:text-blue-400">
                        {depreciationResult.totalPropertyTaxAzn.toFixed(2)} ₼
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: TAX OFFICES RADAR */}
          {activeTab === 'tax_offices' && (
            <div className="space-y-5" data-testid="tax-offices-section">
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Şəhər, idarə və ya ASAN axtar..."
                    value={officeSearch}
                    onChange={(e) => setOfficeSearch(e.target.value)}
                    data-testid="input-office-search"
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs sm:text-sm"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={onlyAsan}
                    onChange={(e) => setOnlyAsan(e.target.checked)}
                    data-testid="checkbox-only-asan"
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Yalnız ASAN Xidmət mərkəzləri</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredOffices.map((office) => (
                  <div
                    key={office.id}
                    data-testid={`office-card-${office.id}`}
                    className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 hover:border-emerald-500 transition-colors space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            office.isAsanService
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                          }`}
                        >
                          {office.cityAz} • {office.isAsanService ? 'ASAN Vergi' : 'DVX İdarəsi'}
                        </span>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-1">
                          {office.nameAz}
                        </h4>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 font-mono font-medium">
                        ~{office.avgWaitTimeMin} dəq gözləmə
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span>{office.addressAz}</span>
                    </p>

                    <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-200/60 dark:border-gray-800">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{office.operatingHours.split('(')[0]}</span>
                      </span>
                      <span className="flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-400">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{office.phone}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ELECTRONIC INVOICE (E-QAİMƏ) */}
          {activeTab === 'e_invoice' && (
            <div className="space-y-6" data-testid="e-invoice-section">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Invoice Generation Form */}
                <form
                  onSubmit={handleCreateInvoice}
                  data-testid="invoice-generator-form"
                  className="p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-sm font-bold">Yeni Elektron Qaimə-Faktura Tərtib Et</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Satıcı VÖEN</label>
                      <input
                        type="text"
                        value={sellerVoen}
                        onChange={(e) => setSellerVoen(e.target.value)}
                        data-testid="input-seller-voen"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Satıcı Şirkət</label>
                      <input
                        type="text"
                        value={sellerName}
                        onChange={(e) => setSellerName(e.target.value)}
                        data-testid="input-seller-name"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Alıcı VÖEN / FİN</label>
                      <input
                        type="text"
                        value={buyerVoenOrFin}
                        onChange={(e) => setBuyerVoenOrFin(e.target.value)}
                        data-testid="input-buyer-voen"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Alıcı Adı / Şirkəti</label>
                      <input
                        type="text"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        data-testid="input-buyer-name"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Dövlət Nömrəsi</label>
                      <input
                        type="text"
                        value={invoicePlate}
                        onChange={(e) => setInvoicePlate(e.target.value)}
                        data-testid="input-invoice-plate"
                        className="w-full px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-mono font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">VIN Kod</label>
                      <input
                        type="text"
                        value={invoiceVin}
                        onChange={(e) => setInvoiceVin(e.target.value)}
                        data-testid="input-invoice-vin"
                        className="w-full px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Model</label>
                      <input
                        type="text"
                        value={invoiceModel}
                        onChange={(e) => setInvoiceModel(e.target.value)}
                        data-testid="input-invoice-model"
                        className="w-full px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    data-testid="submit-invoice-btn"
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>AVİS E-Qaiməni Təsdiq Et və Yarat</span>
                  </button>
                </form>

                {/* Display Current Selected Invoice */}
                {selectedInvoice ? (
                  <div
                    data-testid="invoice-certificate-view"
                    className="p-5 rounded-2xl border-2 border-emerald-600/30 bg-emerald-50/20 dark:bg-emerald-950/20 space-y-4 font-mono text-xs"
                  >
                    <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-800 pb-3 font-sans">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                            AZƏRBAYCAN RESPUBLİKASI
                          </span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 px-1.5 py-0.5 rounded font-bold">
                            TƏSDİQLƏNİB
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 mt-0.5">
                          ELEKTRON VERGİ QAİMƏ-FAKTURASI
                        </h4>
                        <span className="text-xs text-gray-500 font-mono">
                          № {selectedInvoice.invoiceNumber}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 block">Tarix:</span>
                        <span className="text-xs font-bold">
                          {selectedInvoice.issueDate.split('T')[0]}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Satıcı:</span>
                        <span className="font-semibold">{selectedInvoice.sellerName} (VÖEN: {selectedInvoice.sellerVoen})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Alıcı:</span>
                        <span className="font-semibold">{selectedInvoice.buyerName} ({selectedInvoice.buyerVoenOrFin})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Nəqliyyat:</span>
                        <span className="font-semibold">{selectedInvoice.vehicleMakeModel} ({selectedInvoice.vehiclePlate})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">VIN Kod:</span>
                        <span className="font-semibold">{selectedInvoice.vehicleVin}</span>
                      </div>
                    </div>

                    <div className="border-t border-b border-gray-200 dark:border-gray-800 py-2 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Alış Dəyəri:</span>
                        <span>{selectedInvoice.purchasePriceAzn.toFixed(2)} AZN</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Ticarət Əlavəsi:</span>
                        <span>{selectedInvoice.tradeMarginAzn.toFixed(2)} AZN</span>
                      </div>
                      <div className="flex justify-between font-bold text-amber-600 dark:text-amber-400">
                        <span>Ticarət Əlavəsi üzrə 18% ƏDV:</span>
                        <span>{selectedInvoice.vatAmountAzn.toFixed(2)} AZN</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">İllik Yol Vergisi:</span>
                        <span>{selectedInvoice.annualRoadTaxAzn.toFixed(2)} AZN</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-emerald-700 dark:text-emerald-300 pt-1 border-t border-gray-200 dark:border-gray-800">
                        <span>YEKUN HESAB-FAKTURA:</span>
                        <span>{selectedInvoice.totalInvoiceAmountAzn.toFixed(2)} AZN</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-gray-400">
                      <span>İmza: {selectedInvoice.digitalSignatureUid}</span>
                      <span>Hash: {selectedInvoice.securityHash}</span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleCopyCode(selectedInvoice)}
                        data-testid="copy-invoice-code-btn"
                        className="flex-1 py-1.5 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold flex items-center justify-center gap-1.5"
                      >
                        {copiedInvoiceId === selectedInvoice.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Kopyalandı!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Qaimə Nömrəsini Kopyala</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={handlePrint}
                        data-testid="print-invoice-btn"
                        className="py-1.5 px-3 rounded-lg bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 hover:opacity-90 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Çap Et</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-center text-gray-400">
                    <FileText className="w-10 h-10 mb-2 opacity-40" />
                    <p className="text-xs">Baxmaq üçün siyahıdan faktura seçin</p>
                  </div>
                )}
              </div>

              {/* Invoices List / Registry */}
              <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Aktiv Elektron Qaimələr Reyestri ({invoices.length})
                  </h4>
                  <div className="relative w-56">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
                    <input
                      type="text"
                      placeholder="Qaimə, nömrə, VIN..."
                      value={invoiceSearch}
                      onChange={(e) => setInvoiceSearch(e.target.value)}
                      data-testid="input-invoice-search"
                      className="w-full pl-8 pr-2.5 py-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {filteredInvoices.map((inv) => (
                    <button
                      key={inv.id}
                      onClick={() => setSelectedInvoice(inv)}
                      data-testid={`invoice-card-${inv.id}`}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedInvoice?.id === inv.id
                          ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-sm'
                          : 'border-gray-200 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-300">
                          {inv.invoiceNumber}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {inv.issueDate.split('T')[0]}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-1 truncate">
                        {inv.vehicleMakeModel}
                      </p>
                      <div className="flex justify-between items-center text-xs mt-1.5 pt-1.5 border-t border-gray-200/50 dark:border-gray-700/50">
                        <span className="font-mono text-gray-500">{inv.vehiclePlate}</span>
                        <span className="font-mono font-bold text-gray-900 dark:text-gray-100">
                          {inv.totalInvoiceAmountAzn.toFixed(2)} ₼
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>DVX AVİS Sistemi ilə Real-Vaxt Əlaqəsi Aktivdir</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Vergi Məcəlləsi Maddə 209–211</span>
            <span>Çağrı Mərkəzi: 195</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useId, useMemo } from 'react';
import {
  Briefcase,
  Calculator,
  Calendar,
  Building2,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Printer,
  Search,
  ArrowRight,
  TrendingUp,
  Percent,
  Coins,
  Car,
  Zap,
  Phone,
  ExternalLink,
  Info,
  Clock,
  Sparkles,
  X,
  CreditCard,
  FileText,
  DollarSign,
  ShieldCheck,
  Layers,
  ArrowDownRight,
  ChevronRight,
  Download,
} from 'lucide-react';
import {
  LeaseType,
  CustomerType,
  Currency,
  LeaseScheduleRow,
  LeaseCalculationInput,
  LeaseCalculationResult,
  calculateVehicleLease,
  convertCurrency,
  formatCurrency,
  CURRENCY_SYMBOLS,
} from '../utils/vehicleLeasing';
import {
  MOCK_LEASING_COMPANIES,
  MOCK_LEASE_PRESETS,
  MOCK_ACTIVE_LEASE_REGISTRY,
  VehicleLeasePreset,
} from '../data/mockLeasingData';
import { Vehicle } from '../types/vehicle';

export interface LeasingModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: Vehicle | null;
  currency?: Currency;
}

type TabType = 'calculator' | 'schedule' | 'companies' | 'registry' | 'certificate';

export const LeasingModal: React.FC<LeasingModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  currency: initialCurrency = 'AZN',
}) => {
  const modalTitleId = useId();

  // Tab State
  const [activeTab, setActiveTab] = useState<TabType>('calculator');
  const [currency, setCurrency] = useState<Currency>(initialCurrency);

  // Form State
  const initialPrice = vehicle?.priceAzn || 65000;
  const [vehiclePrice, setVehiclePrice] = useState<number>(initialPrice);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [termMonths, setTermMonths] = useState<number>(36);
  const [annualRate, setAnnualRate] = useState<number>(15.0);
  const [balloonPercent, setBalloonPercent] = useState<number>(10);
  const [leaseType, setLeaseType] = useState<LeaseType>('financial');
  const [customerType, setCustomerType] = useState<CustomerType>('corporate');
  const [isElectric, setIsElectric] = useState<boolean>(vehicle?.fuelType?.toLowerCase().includes('electric') || false);
  const [includeMaintenance, setIncludeMaintenance] = useState<boolean>(false);
  const [includeKasko, setIncludeKasko] = useState<boolean>(true);

  // Lessors Filter State
  const [companySearch, setCompanySearch] = useState<string>('');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('all');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('pasa-leasing');

  // Registry Search State
  const [registrySearch, setRegistrySearch] = useState<string>('');
  const [selectedRegistryItem, setSelectedRegistryItem] = useState<string | null>(null);

  // Feedback State
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState<boolean>(false);

  // Sync when initial vehicle changes
  React.useEffect(() => {
    if (vehicle) {
      setVehiclePrice(vehicle.priceAzn);
      if (vehicle.fuelType?.toLowerCase().includes('electric')) {
        setIsElectric(true);
      }
    }
  }, [vehicle]);

  // Selected preset logic
  const handleApplyPreset = (preset: VehicleLeasePreset) => {
    setVehiclePrice(preset.priceAzn);
    setDownPaymentPercent(preset.suggestedDownPaymentPercent);
    setTermMonths(preset.suggestedTermMonths);
    setAnnualRate(preset.interestRate);
    setIsElectric(preset.isElectric);
  };

  // Perform core lease calculations
  const calculationResult: LeaseCalculationResult = useMemo(() => {
    const input: LeaseCalculationInput = {
      vehiclePrice,
      downPaymentPercent,
      termMonths,
      annualInterestRate: annualRate,
      balloonPaymentPercent: balloonPercent,
      leaseType,
      customerType,
      currency,
      isElectricVehicle: isElectric,
      includeFullServiceMaintenance: includeMaintenance,
      includeComprehensiveKasko: includeKasko,
    };
    return calculateVehicleLease(input);
  }, [
    vehiclePrice,
    downPaymentPercent,
    termMonths,
    annualRate,
    balloonPercent,
    leaseType,
    customerType,
    currency,
    isElectric,
    includeMaintenance,
    includeKasko,
  ]);

  // Filtered Leasing Companies
  const filteredCompanies = useMemo(() => {
    return MOCK_LEASING_COMPANIES.filter((company) => {
      const matchesSearch =
        company.name.toLowerCase().includes(companySearch.toLowerCase()) ||
        company.voen.includes(companySearch) ||
        company.licenseNumber.toLowerCase().includes(companySearch.toLowerCase());
      const matchesSpec =
        selectedSpecialization === 'all' ||
        company.specializations.includes(selectedSpecialization as any);
      return matchesSearch && matchesSpec;
    });
  }, [companySearch, selectedSpecialization]);

  // Filtered Active Registry
  const filteredRegistry = useMemo(() => {
    return MOCK_ACTIVE_LEASE_REGISTRY.filter((rec) => {
      return (
        rec.contractId.toLowerCase().includes(registrySearch.toLowerCase()) ||
        rec.lesseeName.toLowerCase().includes(registrySearch.toLowerCase()) ||
        rec.vehiclePlate.toLowerCase().includes(registrySearch.toLowerCase()) ||
        rec.lesseeVoenOrFin.toLowerCase().includes(registrySearch.toLowerCase())
      );
    });
  }, [registrySearch]);

  const selectedCompany = useMemo(() => {
    return MOCK_LEASING_COMPANIES.find((c) => c.id === selectedCompanyId) || MOCK_LEASING_COMPANIES[0];
  }, [selectedCompanyId]);

  const handleCopyCertificate = () => {
    const textToCopy = `AZƏRBAYCAN RESPUBLİKASI MƏRKƏZİ BANKI (AMB) & AZƏRBAYCAN LİZİNG ASSOSİASİYASI
Elektron Avtomobil Lizinqi Şəhadətnaməsi: ${calculationResult.contractId}
Lizinq Şirkəti: ${selectedCompany.name} (VÖEN: ${selectedCompany.voen})
Nəqliyyat Vasitəsi: ${vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Model Spesifikasiyası'}
Qiymət: ${formatCurrency(calculationResult.vehiclePrice, currency)}
İlkin Ödəniş (${calculationResult.downPaymentPercent}%): ${formatCurrency(calculationResult.downPaymentAmount, currency)}
Maliyyələşdirilən Məbləğ: ${formatCurrency(calculationResult.financedAmount, currency)}
Müddət: ${termMonths} ay | İllik Faiz: ${annualRate}%
Aylıq Lizinq Ödənişi: ${formatCurrency(calculationResult.totalMonthlyPayment, currency)}
${calculationResult.balloonPaymentAmount > 0 ? `Balon Qalıq Ödənişi: ${formatCurrency(calculationResult.balloonPaymentAmount, currency)}\n` : ''}Fiskal Üstünlük: ${formatCurrency(calculationResult.taxSavings.totalFiscalBenefit, currency)} (ƏDV & Mənfəət Vergisi Qənaəti)
Status: TƏSDİQLƏNMİŞDİR`;

    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={modalTitleId}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-5xl my-4 sm:my-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-900/10 via-slate-50 to-teal-900/10 dark:from-emerald-950/40 dark:via-slate-900 dark:to-teal-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/25">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id={modalTitleId} className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  AMB & ALA Rəsmi Avtomobil Lizinqi Portalı
                </h2>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                  AR Qanunu № 453-IQ
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mərkəzi Bank, Mülki Məcəllə (Maddə 747) & Vergi Məcəlləsi (Maddə 140) Maliyyə İcarəsi Sistemi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Currency Selector */}
            <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
              {(['AZN', 'USD', 'EUR'] as Currency[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                    currency === c
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              aria-label="Bağla"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 overflow-x-auto scrollbar-none px-4 gap-1">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'calculator'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400 font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Kalkulyator & Vergi Qənaəti
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'schedule'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400 font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Ödəniş Qrafiki ({termMonths} ay)
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'companies'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400 font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Lizinq Şirkətləri ({MOCK_LEASING_COMPANIES.length})
          </button>
          <button
            onClick={() => setActiveTab('registry')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'registry'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400 font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Müqavilə Reyestri
          </button>
          <button
            onClick={() => setActiveTab('certificate')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'certificate'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400 font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            Elektron Şəhadətnamə
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: CALCULATOR & TAX BENEFITS */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              {/* Presets Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Sürətli Model Şablonları (Populyar Lizinq Avtomobilləri)
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {MOCK_LEASE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      className="p-2 text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all group"
                    >
                      <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {preset.make} {preset.model}
                      </div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        {formatCurrency(preset.priceAzn, currency)}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {preset.suggestedDownPaymentPercent}% ilkin • {preset.suggestedTermMonths}ay
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Calculator Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Form Controls */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Customer Type & Lease Type Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Müştəri Kateqoriyası (Vergi Rejimi)
                      </label>
                      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => setCustomerType('corporate')}
                          className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            customerType === 'corporate'
                              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          Hüquqi Şəxs (MMC)
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomerType('entrepreneur')}
                          className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            customerType === 'entrepreneur'
                              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          Fərdi Sahibkar (VÖEN)
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomerType('individual')}
                          className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            customerType === 'individual'
                              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          Fiziki Şəxs
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Lizinq Modeli
                      </label>
                      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => setLeaseType('financial')}
                          className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            leaseType === 'financial'
                              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          Maliyyə Lizinqi (Satınalma)
                        </button>
                        <button
                          type="button"
                          onClick={() => setLeaseType('operational')}
                          className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            leaseType === 'operational'
                              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          Əməliyyat Lizinqi (Tam Xidmət)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Price Input */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        Avtomobilin Satış Qiyməti
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        {formatCurrency(vehiclePrice, currency)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={10000}
                      max={250000}
                      step={1000}
                      value={vehiclePrice}
                      onChange={(e) => setVehiclePrice(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>10 000 ₼</span>
                      <span>100 000 ₼</span>
                      <span>250 000 ₼</span>
                    </div>
                  </div>

                  {/* Down Payment % Slider */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        İlkin Ödəniş Həcmi ({downPaymentPercent}%)
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(calculationResult.downPaymentAmount, currency)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={15}
                      max={50}
                      step={5}
                      value={downPaymentPercent}
                      onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>15% (Minimum)</span>
                      <span>30% (Standart)</span>
                      <span>50% (Maksimum)</span>
                    </div>
                  </div>

                  {/* Term Months Selector */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Lizinq Müddəti</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{termMonths} ay</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {[12, 24, 36, 48, 60].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setTermMonths(m)}
                          className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                            termMonths === m
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {m} ay
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Annual Interest Rate & Balloon Payment */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-700 dark:text-slate-300">İllik Faiz</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{annualRate}%</span>
                      </div>
                      <input
                        type="range"
                        min={12}
                        max={22}
                        step={0.5}
                        value={annualRate}
                        onChange={(e) => setAnnualRate(Number(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          Balon Qalıq Ödənişi ({balloonPercent}%)
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(calculationResult.balloonPaymentAmount, currency)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={30}
                        step={5}
                        disabled={leaseType === 'operational'}
                        value={balloonPercent}
                        onChange={(e) => setBalloonPercent(Number(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Add-on Privileges & Services Checkboxes */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Xüsusi Rejimlər və Xidmət Paketləri
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isElectric}
                          onChange={(e) => setIsElectric(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>Elektromobil (0% Gömrük & Yaşıl Faiz)</span>
                      </label>
                      <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeMaintenance}
                          onChange={(e) => setIncludeMaintenance(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>Tam Texniki Servis və Şin Dəyişimi</span>
                      </label>
                      <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeKasko}
                          onChange={(e) => setIncludeKasko(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>Tam KASKO Sığorta Paketi (İllik 2.8%)</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right Column: Financial Results & Tax Savings Cards */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Primary Payment Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/20 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-emerald-100 uppercase tracking-wider">
                        Aylıq Lizinq Ödənişi
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white backdrop-blur-sm">
                        {termMonths} Ay
                      </span>
                    </div>

                    <div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                      {formatCurrency(calculationResult.totalMonthlyPayment, currency)}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/15 text-xs">
                      <div>
                        <div className="text-emerald-100/80">İlkin Ödəniş</div>
                        <div className="font-semibold">{formatCurrency(calculationResult.downPaymentAmount, currency)}</div>
                      </div>
                      <div>
                        <div className="text-emerald-100/80">Maliyyələşdirilən</div>
                        <div className="font-semibold">{formatCurrency(calculationResult.financedAmount, currency)}</div>
                      </div>
                      {calculationResult.balloonPaymentAmount > 0 && (
                        <div>
                          <div className="text-emerald-100/80">Balon Qalıq Ödəniş</div>
                          <div className="font-semibold">{formatCurrency(calculationResult.balloonPaymentAmount, currency)}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-emerald-100/80">Cəmi Faiz Xərci</div>
                        <div className="font-semibold">{formatCurrency(calculationResult.totalInterest, currency)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Tax Optimization Benefits (AR Vergi Məcəlləsi) */}
                  <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/20 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-xs sm:text-sm">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      Qanuni Vergi Qənaəti (Vergi Məcəlləsi Maddə 140 & 114)
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-emerald-100 dark:border-emerald-900/40">
                        <div className="text-slate-500 dark:text-slate-400">18% ƏDV Əvəzləşdirməsi</div>
                        <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {formatCurrency(calculationResult.taxSavings.vatDeductionTotal, currency)}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-emerald-100 dark:border-emerald-900/40">
                        <div className="text-slate-500 dark:text-slate-400">20% Mənfəət Vergisi Qənaəti</div>
                        <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {formatCurrency(calculationResult.taxSavings.profitTaxSavingsTotal, currency)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-emerald-200 dark:border-emerald-900/40 text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Cəmi Fiskal Qənaət:</span>
                      <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">
                        {formatCurrency(calculationResult.taxSavings.totalFiscalBenefit, currency)}
                      </span>
                    </div>
                  </div>

                  {/* Bank Loan Comparison Card */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                        Bank Avtokrediti ilə Müqayisə
                      </span>
                      <span className="px-2 py-0.5 text-[10px] rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                        18% Standart Kredit
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-slate-400">Kredit Aylıq Ödəniş</div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {formatCurrency(calculationResult.comparisonVsBankLoan.bankLoanMonthly, currency)}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400">Cəmi Xərc (Kredit)</div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {formatCurrency(calculationResult.comparisonVsBankLoan.bankLoanTotalCost, currency)}
                        </div>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-[11px] text-blue-900 dark:text-blue-300">
                      {customerType !== 'individual'
                        ? `Lizinq hüquqi şəxslər üçün ${formatCurrency(
                            calculationResult.taxSavings.totalFiscalBenefit,
                            currency
                          )} vergi üstünlüyü təmin edir.`
                        : 'Fiziki şəxslər üçün lizinq tələb olunan sənədlərin azlığı və sürətli təsdiq ilə fərqlənir.'}
                    </div>
                  </div>

                  {/* Quick Action Button */}
                  <button
                    onClick={() => setActiveTab('certificate')}
                    className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Elektron Lizinq Təsdiqi Al</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AMORTIZATION SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Aylıq Lizinq Ödəniş Qrafiki ({termMonths} Ay)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Maliyyələşdirilən: {formatCurrency(calculationResult.financedAmount, currency)} • İllik Faiz: {annualRate}%
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    Aylıq: {formatCurrency(calculationResult.totalMonthlyPayment, currency)}
                  </span>
                </div>
              </div>

              {/* Schedule Table */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700 z-10">
                      <tr>
                        <th className="py-2.5 px-3">Ay</th>
                        <th className="py-2.5 px-3">Başlanğıc Qalıq</th>
                        <th className="py-2.5 px-3">Əsas Borc</th>
                        <th className="py-2.5 px-3">Faiz Ödənişi</th>
                        <th className="py-2.5 px-3">18% ƏDV</th>
                        <th className="py-2.5 px-3">Cəmi Aylıq</th>
                        <th className="py-2.5 px-3">Son Qalıq</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                      {calculationResult.schedule.map((row) => (
                        <tr key={row.month} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">{row.month}</td>
                          <td className="py-2 px-3">{formatCurrency(row.beginningBalance, currency)}</td>
                          <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400 font-medium">
                            {formatCurrency(row.principalPayment, currency)}
                          </td>
                          <td className="py-2 px-3 text-amber-600 dark:text-amber-400 font-medium">
                            {formatCurrency(row.interestPayment, currency)}
                          </td>
                          <td className="py-2 px-3 text-slate-500">{formatCurrency(row.vatPortion, currency)}</td>
                          <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                            {formatCurrency(row.totalMonthlyPayment, currency)}
                          </td>
                          <td className="py-2 px-3 font-medium">{formatCurrency(row.endingBalance, currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ACCREDITED LESSORS RADAR */}
          {activeTab === 'companies' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    placeholder="Lizinq şirkətinin adı, VÖEN və ya lisenziya nömrəsi..."
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                  {[
                    { id: 'all', label: 'Bütün Kateqoriyalar' },
                    { id: 'passenger', label: 'Minik Avtomobilləri' },
                    { id: 'commercial', label: 'Kommersiya & Park' },
                    { id: 'ev_green', label: 'Yaşıl EV Lizinqi' },
                    { id: 'heavy_truck', label: 'Ağır Texnika' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setSelectedSpecialization(filter.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                        selectedSpecialization === filter.id
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Companies Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCompanies.map((company) => (
                  <div
                    key={company.id}
                    className={`p-4 rounded-xl border transition-all space-y-3 ${
                      selectedCompanyId === company.id
                        ? 'border-emerald-500 dark:border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-md ring-1 ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{company.name}</h4>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Lisenziya: {company.licenseNumber} • VÖEN: {company.voen}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                        {company.rating} ★
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-slate-800 text-xs">
                      <div>
                        <div className="text-slate-400 text-[10px]">İlkin Ödəniş</div>
                        <div className="font-semibold text-slate-900 dark:text-white">{company.minDownPaymentPercent}%-dən</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px]">İllik Faiz</div>
                        <div className="font-semibold text-emerald-600 dark:text-emerald-400">{company.baseInterestRate}%-dən</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px]">Maks. Müddət</div>
                        <div className="font-semibold text-slate-900 dark:text-white">{company.maxTermMonths} ay</div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <Building2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{company.address}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span>{company.phone}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedCompanyId(company.id);
                        setAnnualRate(company.baseInterestRate);
                        setDownPaymentPercent(company.minDownPaymentPercent);
                        setApplicationSubmitted(true);
                        setTimeout(() => setApplicationSubmitted(false), 3000);
                      }}
                      className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-emerald-600 hover:text-white dark:bg-slate-800 dark:hover:bg-emerald-600 text-slate-700 dark:text-slate-200 transition-all flex items-center justify-center gap-1.5"
                    >
                      {selectedCompanyId === company.id ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Seçilmiş Partnyor</span>
                        </>
                      ) : (
                        <span>Bu Şirkəti Seç</span>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {applicationSubmitted && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Şirkət uğurla seçildi və kalkulyator faiz dərəcələri tənzimləndi!</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ACTIVE LEASE REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    placeholder="Müqavilə nömrəsi, Müştəri adı və ya Dövlət Qeydiyyat Nişanı..."
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredRegistry.map((item) => (
                  <div
                    key={item.contractId}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-emerald-500/50 transition-all space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {item.contractId}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            item.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {item.status === 'active' ? 'Aktiv Müqavilə' : 'Bağlanmış / Bitmiş'}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-slate-900 dark:text-white">
                        Aylıq: {formatCurrency(item.monthlyPayment, currency)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <div>
                        <span className="text-slate-400">İcarəçi: </span>
                        <span className="font-medium text-slate-900 dark:text-white">{item.lesseeName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Lizinq Şirkəti: </span>
                        <span className="font-medium">{item.lessorName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Avtomobil: </span>
                        <span className="font-medium">{item.vehicleDescription} ({item.vehiclePlate})</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span>Müddət: {item.startDate} — {item.endDate}</span>
                      <span className="capitalize">Növ: {item.leaseType === 'financial' ? 'Maliyyə Lizinqi' : 'Əməliyyat Lizinqi'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: OFFICIAL ELECTRONIC LEASE CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-4">
              <div className="p-6 sm:p-8 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900 shadow-xl space-y-6">
                {/* Official Certificate Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b-2 border-slate-200 dark:border-slate-700 gap-4 text-center sm:text-left">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-lg">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
                        Azərbaycan Respublikası Mərkəzi Bankı & ALA
                      </div>
                      <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                        RƏSMİ ELEKTRON LİZİNQ ŞƏHADƏTNAMƏSİ
                      </h3>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        Sənəd İdentifikatoru: {calculationResult.contractId}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      TƏSDİQLƏNMİŞDİR • QANUNİ STATUS
                    </span>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Tarix: {new Date().toISOString().split('T')[0]}
                    </div>
                  </div>
                </div>

                {/* Details Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="font-bold text-slate-900 dark:text-white pb-1.5 border-b border-slate-100 dark:border-slate-700">
                      Tərəflər və Lisenziya Rekvizitləri
                    </div>
                    <div>
                      <span className="text-slate-400">İcarəyə Verən: </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCompany.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Lisenziya / VÖEN: </span>
                      <span>{selectedCompany.licenseNumber} / {selectedCompany.voen}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Müştəri Növü: </span>
                      <span className="capitalize font-semibold text-emerald-600 dark:text-emerald-400">
                        {customerType === 'corporate' ? 'Hüquqi Şəxs (MMC)' : customerType === 'entrepreneur' ? 'Fərdi Sahibkar (VÖEN)' : 'Fiziki Şəxs'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="font-bold text-slate-900 dark:text-white pb-1.5 border-b border-slate-100 dark:border-slate-700">
                      Maliyyə Şərtləri və Vergi Qənaəti
                    </div>
                    <div>
                      <span className="text-slate-400">Avtomobil Qiyməti: </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {formatCurrency(calculationResult.vehiclePrice, currency)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Aylıq Ödəniş: </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(calculationResult.totalMonthlyPayment, currency)} ({termMonths} ay)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Fiskal Vergi Qənaəti: </span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-300">
                        {formatCurrency(calculationResult.taxSavings.totalFiscalBenefit, currency)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Sənəd AR Mülki Məcəlləsinin 747-ci maddəsi və Vergi Məcəlləsinin 140-cı maddəsi əsasında formalaşdırılmışdır.
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyCertificate}
                      className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      <span>{isCopied ? 'Kopyalandı' : 'Kopyala'}</span>
                    </button>
                    <button
                      onClick={handlePrint}
                      className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Çap et</span>
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

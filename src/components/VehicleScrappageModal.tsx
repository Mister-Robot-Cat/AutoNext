import React, { useState, useMemo } from 'react';
import { Vehicle, Currency, Language } from '../types/vehicle';
import {
  ScrappageVehicleCategory,
  CompletenessComponentId
} from '../types/scrappage';
import {
  SCRAPPAGE_COMPLETENESS_COMPONENTS,
  LOCAL_MANUFACTURED_VEHICLES,
  TEMIZ_SEHER_COLLECTION_CENTERS,
  SAMPLE_SCRAPPAGE_CERTIFICATES
} from '../data/mockScrappageData';
import {
  calculateUtilizationFees,
  calculateScrappagePayout,
  convertScrappageCurrency,
  filterCollectionCentersByCity,
  generateScrappageCertificate,
  verifyScrappageCertificateCode
} from '../utils/vehicleScrappage';
import {
  X,
  Recycle,
  CheckCircle2,
  AlertTriangle,
  Banknote,
  Factory,
  Scale,
  MapPin,
  FileCheck,
  Search,
  Copy,
  Check,
  Truck,
  Sparkles,
  ShieldCheck,
  Calculator,
  Calendar,
  Leaf
} from 'lucide-react';

interface VehicleScrappageModalProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  currency: Currency;
  lang: Language;
  onClose: () => void;
}

type ScrappageTab = 'voucher' | 'fees' | 'completeness' | 'centers' | 'certificate';

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  AZN: '₼',
  USD: '$',
  EUR: '€'
};

export const VehicleScrappageModal: React.FC<VehicleScrappageModalProps> = ({
  isOpen,
  vehicle,
  currency,
  lang,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<ScrappageTab>('voucher');

  // Vehicle & calculation state
  const [category, setCategory] = useState<ScrappageVehicleCategory>('passenger_m1');
  const [manufactureYear, setManufactureYear] = useState<number>(vehicle?.year || 2004);
  const [engineVolumeCc, setEngineVolumeCc] = useState<number>(
    vehicle?.engineVolumeLiters ? Math.round(vehicle.engineVolumeLiters * 1000) : 1800
  );
  const [fuelType, setFuelType] = useState<'petrol' | 'diesel' | 'hybrid' | 'electric' | 'lpg'>(
    (vehicle?.fuelType as 'petrol' | 'diesel' | 'hybrid' | 'electric') || 'petrol'
  );
  const [curbWeightKg, setCurbWeightKg] = useState<number>(1420);
  const [payoutMode, setPayoutMode] = useState<'local_car_voucher' | 'cash_lump_sum_70'>(
    'local_car_voucher'
  );
  const [selectedLocalModelId, setSelectedLocalModelId] = useState<string>(
    LOCAL_MANUFACTURED_VEHICLES[0].id
  );
  const [presentComponentIds, setPresentComponentIds] = useState<CompletenessComponentId[]>(
    SCRAPPAGE_COMPLETENESS_COMPONENTS.map((c) => c.id)
  );

  // Centers & Booking state
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedCenterId, setSelectedCenterId] = useState<string>(
    TEMIZ_SEHER_COLLECTION_CENTERS[0].id
  );
  const [bookedCenterId, setBookedCenterId] = useState<string | null>(null);
  const [requestFreeTow, setRequestFreeTow] = useState<boolean>(true);

  // Certificate & Registry Lookup state
  const [applicantFullName, setApplicantFullName] = useState<string>(
    'Həsənov İlqar Vaqif oğlu'
  );
  const [applicantFin, setApplicantFin] = useState<string>('4KL92M1');
  const [plateNumber, setPlateNumber] = useState<string>('10-DX-492');
  const [searchCode, setSearchCode] = useState<string>('');
  const [copiedCert, setCopiedCert] = useState<boolean>(false);

  const symbol = CURRENCY_SYMBOLS[currency] || '₼';
  const formatAmount = (amountAzn: number) => {
    const val = convertScrappageCurrency(amountAzn, currency);
    return `${val.toLocaleString('en-US')} ${symbol}`;
  };

  const feeBreakdown = useMemo(
    () => calculateUtilizationFees(manufactureYear, engineVolumeCc, fuelType, 2026),
    [manufactureYear, engineVolumeCc, fuelType]
  );

  const payoutResult = useMemo(
    () =>
      calculateScrappagePayout(
        {
          category,
          manufactureYear,
          engineVolumeCc,
          fuelType,
          curbWeightKg,
          presentComponentIds,
          payoutMode,
          selectedLocalModelId
        },
        2026
      ),
    [
      category,
      manufactureYear,
      engineVolumeCc,
      fuelType,
      curbWeightKg,
      presentComponentIds,
      payoutMode,
      selectedLocalModelId
    ]
  );

  const filteredCenters = useMemo(
    () => filterCollectionCentersByCity(selectedCity),
    [selectedCity]
  );

  const generatedCertificate = useMemo(
    () =>
      generateScrappageCertificate({
        applicantFullName,
        applicantFin,
        vehicleTitle: vehicle ? `${vehicle.make} ${vehicle.model}` : 'VAZ 21074 / Köhnə Nəqliyyat Vasitəsi',
        vin: vehicle?.vin || 'XTA210740W1094821',
        plateNumber,
        manufactureYear,
        category,
        centerId: selectedCenterId,
        completenessScorePercent: payoutResult.completenessScorePercent,
        payoutMode,
        voucherAmountAzn: payoutResult.netVoucherPayoutAzn,
        cashPayoutAmountAzn: payoutResult.netCashPayoutAzn
      }),
    [
      applicantFullName,
      applicantFin,
      vehicle,
      plateNumber,
      manufactureYear,
      category,
      selectedCenterId,
      payoutResult.completenessScorePercent,
      payoutMode,
      payoutResult.netVoucherPayoutAzn,
      payoutResult.netCashPayoutAzn
    ]
  );

  const verifiedRegistryRecord = useMemo(
    () => verifyScrappageCertificateCode(searchCode),
    [searchCode]
  );

  if (!isOpen) return null;

  const toggleComponent = (id: CompletenessComponentId) => {
    setPresentComponentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCopyCertificate = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(generatedCertificate.certificateNumber);
    }
    setCopiedCert(true);
    setTimeout(() => setCopiedCert(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Təmiz Şəhər ASC Avtomobil Utilizasiyası və Güzəşt Vauçeri Portalı"
      data-testid="vehicle-scrappage-modal"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Official Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-emerald-950/30 to-slate-950 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/25 shrink-0">
              <Recycle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  "Təmiz Şəhər" ASC — Dövlət Avtomobil Utilizasiyası və Güzəşt Vauçeri Portalı
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  NK Qərarı № 11-13 • Rəsmi Operator
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Köhnə nəqliyyat vasitələrinin təhvili, yerli avtomobil alışı üçün 3,000 ₼-dək güzəşt vauçeri, 70% nağd ödəniş və DYP/DGK utilizasiya rüsumu kalkulyatoru
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            data-testid="close-scrappage-modal"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0"
            aria-label="Bağla"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-3 bg-slate-950/70 border-b border-slate-800 overflow-x-auto">
          {[
            {
              id: 'voucher' as ScrappageTab,
              label: 'Güzəşt Vauçeri & Yerli Avto',
              icon: Banknote,
              testId: 'tab-scrappage-voucher'
            },
            {
              id: 'fees' as ScrappageTab,
              label: 'Utilizasiya Rüsumu (DYP & DGK)',
              icon: Calculator,
              testId: 'tab-scrappage-fees'
            },
            {
              id: 'completeness' as ScrappageTab,
              label: 'Komplektlik & Ekoloji Balans',
              icon: Scale,
              testId: 'tab-scrappage-completeness'
            },
            {
              id: 'centers' as ScrappageTab,
              label: 'Qəbul Məntəqələri (6 Mərkəz)',
              icon: MapPin,
              testId: 'tab-scrappage-centers'
            },
            {
              id: 'certificate' as ScrappageTab,
              label: 'Təsdiqedici Sənəd & Reyestr',
              icon: FileCheck,
              testId: 'tab-scrappage-certificate'
            }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                data-testid={tab.testId}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: VOUCHER & LOCAL CAR CALCULATOR */}
          {activeTab === 'voucher' && (
            <div className="space-y-6" data-testid="scrappage-voucher-panel">
              {/* Top Summary Banner */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">
                    Dövlət Vauçer Məbləği (100%)
                  </span>
                  <div
                    className="text-2xl font-black text-emerald-400"
                    data-testid="voucher-payout-amount"
                  >
                    {formatAmount(payoutResult.netVoucherPayoutAzn)}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Yerli istehsal yeni avtomobil alışı üçün
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">
                    Birdəfəlik Nağd Ödəniş (70%)
                  </span>
                  <div
                    className="text-2xl font-black text-amber-400"
                    data-testid="cash-payout-amount"
                  >
                    {formatAmount(payoutResult.netCashPayoutAzn)}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Birbaşa bank kartına (IBAN) köçürmə
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">
                    Zavod Əlavə Təşviq Bonusu
                  </span>
                  <div
                    className="text-2xl font-black text-cyan-400"
                    data-testid="factory-bonus-amount"
                  >
                    +{formatAmount(payoutResult.factoryBonusAzn)}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Rəsmi istehsalçı diler endirimi
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40">
                  <span className="text-xs text-emerald-300 block mb-1 font-semibold">
                    Cəmi Üstünlük / Qənaət
                  </span>
                  <div
                    className="text-2xl font-black text-white"
                    data-testid="total-combined-discount"
                  >
                    {formatAmount(payoutResult.totalCombinedDiscountAzn)}
                  </div>
                  <span className="text-[11px] text-emerald-400">
                    Komplektlik: {payoutResult.completenessScorePercent}%
                  </span>
                </div>
              </div>

              {/* Configuration Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 space-y-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Recycle className="w-4 h-4 text-emerald-400" />
                    Təhvil Verilən Nəqliyyat Vasitəsinin Kateqoriyası
                  </h3>

                  <div className="space-y-2">
                    {[
                      {
                        id: 'passenger_m1' as ScrappageVehicleCategory,
                        title: 'M1 — Minik avtomobili (Sedan / SUV / Universal)',
                        voucherAzn: 1500,
                        cashAzn: 1050
                      },
                      {
                        id: 'minibus_m2' as ScrappageVehicleCategory,
                        title: 'M2 — Mikroavtobus (8-16 sərnişin yeri)',
                        voucherAzn: 2000,
                        cashAzn: 1400
                      },
                      {
                        id: 'truck_n1' as ScrappageVehicleCategory,
                        title: 'N1 — Yüngül yük avtomobili (≤ 3.5 ton)',
                        voucherAzn: 2000,
                        cashAzn: 1400
                      },
                      {
                        id: 'heavy_truck_n2_n3' as ScrappageVehicleCategory,
                        title: 'N2 / N3 — Ağır yük avtomobili və Qoşqu (> 3.5 ton)',
                        voucherAzn: 3000,
                        cashAzn: 2100
                      },
                      {
                        id: 'bus_m3' as ScrappageVehicleCategory,
                        title: 'M3 — İri tutumlu sərnişin avtobusu (> 5 ton)',
                        voucherAzn: 3000,
                        cashAzn: 2100
                      }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        data-testid={`category-btn-${cat.id}`}
                        className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                          category === cat.id
                            ? 'bg-emerald-600/15 border-emerald-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-xs font-semibold">{cat.title}</span>
                        <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-slate-950 text-emerald-400 shrink-0">
                          {formatAmount(cat.voucherAzn)}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Payout Mode Switch */}
                  <div className="pt-2 border-t border-slate-800">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                      Ödəniş və Təşviq Forması Seçimi
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setPayoutMode('local_car_voucher')}
                        data-testid="payout-mode-voucher"
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          payoutMode === 'local_car_voucher'
                            ? 'bg-emerald-600/20 border-emerald-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="text-xs font-bold">100% Güzəşt Vauçeri</div>
                        <div className="text-[11px] text-emerald-400 mt-0.5">
                          Yerli istehsal yeni avtomobil üçün
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPayoutMode('cash_lump_sum_70')}
                        data-testid="payout-mode-cash"
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          payoutMode === 'cash_lump_sum_70'
                            ? 'bg-amber-500/20 border-amber-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="text-xs font-bold">70% Nağd Ödəniş</div>
                        <div className="text-[11px] text-amber-400 mt-0.5">
                          Birbaşa bank hesabına (IBAN)
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right column: Local Manufactured Vehicle Catalog */}
                <div className="lg:col-span-7 space-y-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Factory className="w-4 h-4 text-cyan-400" />
                        Yerli İstehsal Avtomobil Kataloqu (Sumqayıt • Hacıqabul • Neftçala)
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Təsdiqedici sənəd ilə rəsmi dilerlərdən güzəştli qiymətlə əldə edilə bilən yeni modellər
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {LOCAL_MANUFACTURED_VEHICLES.map((car) => {
                      const isSelected = selectedLocalModelId === car.id;
                      const discountedPrice = Math.max(
                        0,
                        car.retailPriceAzn -
                          (payoutResult.netVoucherPayoutAzn + car.factoryExtraBonusAzn)
                      );
                      return (
                        <div
                          key={car.id}
                          onClick={() => setSelectedLocalModelId(car.id)}
                          data-testid={`local-car-card-${car.id}`}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-emerald-950/30 border-emerald-500 shadow-lg shadow-emerald-950/50'
                              : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-sm font-black text-white">
                                {car.make} {car.model}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                                {car.warrantyYears} il zəmanət
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mb-2">
                              {car.assemblyPlant.az} • {car.engineSpec}
                            </p>
                          </div>

                          <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-slate-500 line-through block">
                                Zavod qiyməti: {formatAmount(car.retailPriceAzn)}
                              </span>
                              <span className="text-sm font-black text-emerald-400">
                                Vauçerlə: {formatAmount(discountedPrice)}
                              </span>
                            </div>
                            <span className="text-[11px] font-bold text-cyan-400 bg-cyan-950/60 px-2 py-1 rounded-lg border border-cyan-800/50">
                              +{formatAmount(car.factoryExtraBonusAzn)} Zavod Bonusu
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {payoutResult.localBrandFinalPriceAzn !== null && (
                    <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs">
                      <span className="text-slate-300">
                        Seçilmiş yerli avtomobil üzrə yekun ödəniləcək məbləğ:
                      </span>
                      <strong
                        className="text-base font-black text-emerald-400"
                        data-testid="selected-local-car-final-price"
                      >
                        {formatAmount(payoutResult.localBrandFinalPriceAzn)}
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STATUTORY UTILIZATION FEE CALCULATOR (DYP & DGK) */}
          {activeTab === 'fees' && (
            <div className="space-y-6" data-testid="scrappage-fees-panel">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Input Parameters */}
                <div className="lg:col-span-5 bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-emerald-400" />
                    Nəqliyyat Vasitəsinin Texniki Göstəriciləri
                  </h3>

                  <div>
                    <label className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                      <span>İstehsal İli: {manufactureYear}</span>
                      <span className="text-emerald-400 font-bold">
                        Yaşı: {feeBreakdown.vehicleAgeYears} il
                      </span>
                    </label>
                    <input
                      type="range"
                      min={1980}
                      max={2026}
                      value={manufactureYear}
                      onChange={(e) => setManufactureYear(Number(e.target.value))}
                      data-testid="fee-year-slider"
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>1980 (46 il)</span>
                      <span>2005 (21 il)</span>
                      <span>2018 (8 il)</span>
                      <span>2026 (Yeni)</span>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                      <span>Mühərrik Həcmi (sm³):</span>
                      <span className="text-cyan-400 font-bold">{engineVolumeCc} sm³</span>
                    </label>
                    <input
                      type="range"
                      min={1000}
                      max={5000}
                      step={100}
                      value={engineVolumeCc}
                      onChange={(e) => setEngineVolumeCc(Number(e.target.value))}
                      data-testid="fee-engine-slider"
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Yanacaq Növü
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { id: 'petrol', label: 'Benzin' },
                          { id: 'diesel', label: 'Dizel' },
                          { id: 'hybrid', label: 'Hibrid' },
                          { id: 'electric', label: 'Elektrik (EV)' },
                          { id: 'lpg', label: 'Qaz (LPG/CNG)' }
                        ] as const
                      ).map((ft) => (
                        <button
                          key={ft.id}
                          type="button"
                          onClick={() => setFuelType(ft.id)}
                          data-testid={`fee-fuel-${ft.id}`}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            fuelType === ft.id
                              ? 'bg-emerald-600 text-white border-emerald-500'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          {ft.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Fee Results & Tariff Tables */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
                        DYP Texniki Baxış Utilizasiya Haqqı
                      </span>
                      <div
                        className="text-3xl font-black text-white my-2"
                        data-testid="dyp-inspection-utilization-fee"
                      >
                        {formatAmount(feeBreakdown.periodicInspectionFeeAzn)}
                      </div>
                      <p className="text-xs text-slate-400">
                        {feeBreakdown.periodicInspectionTierLabel.az}
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800">
                      <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                        DGK Gömrük İdxal Utilizasiya Rüsumu
                      </span>
                      <div
                        className="text-3xl font-black text-white my-2"
                        data-testid="dgk-customs-utilization-fee"
                      >
                        {formatAmount(feeBreakdown.customsImportFeeAzn)}
                      </div>
                      <p className="text-xs text-slate-400">
                        {feeBreakdown.customsImportTierLabel.az}
                      </p>
                    </div>
                  </div>

                  {/* Official Statutory Tariff Matrix */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Nazirlər Kabinetinin Təsdiq Etdiyi Rəsmi Utilizasiya Rüsumu Şkalası
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                      {[
                        { age: '0 - 4 il', fee: 0 },
                        { age: '4 - 10 il', fee: 10 },
                        { age: '10 - 20 il', fee: 20 },
                        { age: '20 - 30 il', fee: 30 },
                        { age: '30+ il', fee: 40 }
                      ].map((row) => (
                        <div
                          key={row.age}
                          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800"
                        >
                          <div className="text-[11px] text-slate-400">{row.age}</div>
                          <div className="text-sm font-black text-emerald-400 mt-0.5">
                            {formatAmount(row.fee)}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Hüquqi əsas: {feeBreakdown.legalCitation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMPLETENESS AUDIT & ECOLOGICAL RECOVERY */}
          {activeTab === 'completeness' && (
            <div className="space-y-6" data-testid="scrappage-completeness-panel">
              {!payoutResult.isEligibleForProgram && payoutResult.ineligibilityReason && (
                <div
                  className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-start gap-3"
                  data-testid="completeness-ineligible-alert"
                >
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-rose-200">
                    <strong className="block font-bold text-rose-300 mb-0.5">
                      Komplektlik Tələbi Pozulub!
                    </strong>
                    {payoutResult.ineligibilityReason.az}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 10-Point Component Checklist */}
                <div className="lg:col-span-7 bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      10 Bəndlik Komplektlik Ekspertizası Siyahısı
                    </h3>
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      data-testid="completeness-score-badge"
                    >
                      Komplektlik: {payoutResult.completenessScorePercent}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {SCRAPPAGE_COMPLETENESS_COMPONENTS.map((comp) => {
                      const isChecked = presentComponentIds.includes(comp.id);
                      return (
                        <button
                          key={comp.id}
                          type="button"
                          onClick={() => toggleComponent(comp.id)}
                          data-testid={`completeness-item-${comp.id}`}
                          className={`p-3 rounded-xl border text-left transition-all flex items-start justify-between gap-2 cursor-pointer ${
                            isChecked
                              ? 'bg-slate-900/90 border-emerald-500/40 text-white'
                              : 'bg-rose-950/20 border-rose-500/40 text-slate-400'
                          }`}
                        >
                          <div className="text-xs">
                            <div className="font-bold flex items-center gap-1.5">
                              <span>{comp.name.az}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">
                              Çəki payı: {comp.weightSharePercent}% •{' '}
                              {comp.isCritical
                                ? 'Məcburi aqreqat'
                                : `Çatışmadıqda -${comp.deductionIfMissingAzn} ₼`}
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                              isChecked
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {isChecked ? 'Mövcuddur' : 'Yoxdur'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Ecological Recovery Metrics */}
                <div className="lg:col-span-5 bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-emerald-400" />
                    Ekoloji Təkrar Emal və Xammal Balansı
                  </h3>

                  <div>
                    <label className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Avtomobilin Yüksüz Kütləsi:</span>
                      <strong className="text-emerald-400">{curbWeightKg} kq</strong>
                    </label>
                    <input
                      type="range"
                      min={800}
                      max={3500}
                      step={50}
                      value={curbWeightKg}
                      onChange={(e) => setCurbWeightKg(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Qara Metal (Polad)</span>
                      <strong
                        className="text-lg font-black text-white"
                        data-testid="recovery-steel-kg"
                      >
                        {payoutResult.recyclingRecovery.ferrousSteelKg} kq
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Alüminium Ərintisi</span>
                      <strong
                        className="text-lg font-black text-cyan-400"
                        data-testid="recovery-aluminum-kg"
                      >
                        {payoutResult.recyclingRecovery.aluminumKg} kq
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Mis Naqil & Электроника</span>
                      <strong className="text-lg font-black text-amber-400">
                        {payoutResult.recyclingRecovery.copperWiringKg} kq
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Zərərsizləşdirilən Maye</span>
                      <strong className="text-lg font-black text-purple-400">
                        {payoutResult.recyclingRecovery.hazardousFluidsLiters} L
                      </strong>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 flex items-center justify-between">
                    <span>İllik qarşısı alınan CO₂ və zəhərli qaz tullantısı:</span>
                    <strong className="text-sm font-black text-emerald-400">
                      {payoutResult.recyclingRecovery.co2PreventedTonsPerYear} ton / il
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: "TƏMİZ ŞƏHƏR" COLLECTION CENTERS RADAR */}
          {activeTab === 'centers' && (
            <div className="space-y-5" data-testid="scrappage-centers-panel">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {['all', 'Bakı', 'Sumqayıt', 'Gəncə', 'Mingəçevir', 'Lənkəran'].map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setSelectedCity(city)}
                      data-testid={`filter-center-city-${city}`}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedCity === city
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {city === 'all' ? 'Bütün Regional Mərkəzlər (6)' : city}
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requestFreeTow}
                    onChange={(e) => setRequestFreeTow(e.target.checked)}
                    className="rounded accent-emerald-500"
                  />
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span>Nasaz avtomobil üçün pulsuz evakuator sifarişi</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCenters.map((center) => {
                  const isBooked = bookedCenterId === center.id;
                  return (
                    <div
                      key={center.id}
                      data-testid={`collection-center-card-${center.id}`}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        isBooked
                          ? 'bg-emerald-950/30 border-emerald-500'
                          : 'bg-slate-950/80 border-slate-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                            {center.code} • {center.city}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                            Gözləmə: ~{center.waitMinutes} dəq ({center.currentQueueCount} növbə)
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-sm">{center.name.az}</h4>
                        <p className="text-xs text-slate-400 mt-1">{center.address.az}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[11px] text-slate-400">
                          <span>Tərəzi: {center.certifiedScaleTons} ton</span>
                          <span>•</span>
                          <span>{center.workingHours}</span>
                          {center.hasFreeTowService && (
                            <span className="text-emerald-400 font-semibold">
                              • Pulsuz Evakuator Xidməti
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-xs text-slate-400">{center.phone}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCenterId(center.id);
                            setBookedCenterId(center.id);
                          }}
                          data-testid={`book-center-btn-${center.id}`}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isBooked
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40'
                          }`}
                        >
                          {isBooked ? 'Növbə Təsdiqləndi ✓' : 'Təhvil Növbəsi Götür'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {bookedCenterId && (
                <div
                  className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs text-emerald-200"
                  data-testid="center-booking-confirmation"
                >
                  <div>
                    <strong className="font-bold text-white block">
                      Elektron Təhvil Növbəsi Qeydiyyata Alındı!
                    </strong>
                    <span>
                      BDYP qeydiyyatdan çıxarılma arayışı ilə seçilmiş "Təmiz Şəhər" ASC məntəqəsinə yaxınlaşa bilərsiniz.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('certificate')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold shrink-0 cursor-pointer"
                  >
                    Təsdiqedici Sənədə Keç →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: OFFICIAL CONFIRMATION CERTIFICATE & REGISTRY LOOKUP */}
          {activeTab === 'certificate' && (
            <div className="space-y-6" data-testid="scrappage-certificate-panel">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Applicant Inputs & Registry Verification */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Mülkiyyətçi və BDYP Çıxarış Məlumatları
                    </h3>
                    <div>
                      <label className="block text-[11px] text-slate-400 uppercase mb-1">
                        Mülkiyyətçinin S.A.A.
                      </label>
                      <input
                        type="text"
                        value={applicantFullName}
                        onChange={(e) => setApplicantFullName(e.target.value)}
                        data-testid="scrappage-applicant-name-input"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] text-slate-400 uppercase mb-1">
                          Şəxsiyyət Vəsiqəsi FİN
                        </label>
                        <input
                          type="text"
                          value={applicantFin}
                          maxLength={7}
                          onChange={(e) => setApplicantFin(e.target.value.toUpperCase())}
                          data-testid="scrappage-fin-input"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono uppercase"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 uppercase mb-1">
                          Təhvil Verilən DQN
                        </label>
                        <input
                          type="text"
                          value={plateNumber}
                          onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono uppercase"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Live Registry Verification Search */}
                  <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Search className="w-4 h-4 text-cyan-400" />
                      Vahid Utilizasiya Reyestrində Yoxlama
                    </h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={searchCode}
                        onChange={(e) => setSearchCode(e.target.value)}
                        placeholder="Məs: TS-UTL-2026-84920"
                        data-testid="scrappage-registry-search-input"
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono uppercase"
                      />
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {SAMPLE_SCRAPPAGE_CERTIFICATES.map((sample) => (
                        <button
                          key={sample.certificateNumber}
                          type="button"
                          onClick={() => setSearchCode(sample.certificateNumber)}
                          data-testid={`sample-cert-btn-${sample.certificateNumber}`}
                          className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] font-mono text-emerald-400 cursor-pointer"
                        >
                          {sample.certificateNumber}
                        </button>
                      ))}
                    </div>

                    {searchCode.trim() && (
                      <div
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                        data-testid="scrappage-registry-search-result"
                      >
                        {verifiedRegistryRecord ? (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-emerald-400 font-bold">
                              <span>✓ Reyestrdə Təsdiqləndi</span>
                              <span>{verifiedRegistryRecord.status}</span>
                            </div>
                            <div className="text-white font-semibold">
                              {verifiedRegistryRecord.vehicleTitle} ({verifiedRegistryRecord.plateNumber})
                            </div>
                            <div className="text-slate-400 text-[11px]">
                              Mülkiyyətçi: {verifiedRegistryRecord.applicantFullName} • Vauçer:{' '}
                              {formatAmount(verifiedRegistryRecord.voucherAmountAzn)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-rose-400">
                            Bu nömrəli təsdiqedici sənəd bazada tapılmadı.
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Official Electronic Confirmation Document */}
                <div className="lg:col-span-7">
                  <div
                    className="p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-emerald-950/20 to-slate-950 border-2 border-emerald-500/40 space-y-5 relative overflow-hidden"
                    data-testid="official-scrappage-certificate"
                  >
                    <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block">
                          Azərbaycan Respublikası İqtisadiyyat Nazirliyi • "Təmiz Şəhər" ASC
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                          NƏQLİYYAT VASİTƏSİNİN UTİLİZASİYASI HAQQINDA TƏSDİQEDİCİ SƏNƏD
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyCertificate}
                        data-testid="copy-scrappage-cert-btn"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-emerald-400 cursor-pointer shrink-0"
                      >
                        {copiedCert ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Kopyalandı</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{generatedCertificate.certificateNumber}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Sənəd Seriyası</span>
                        <strong className="font-mono text-emerald-400">
                          {generatedCertificate.certificateNumber}
                        </strong>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">BDYP Çıxarış Kodu</span>
                        <strong className="font-mono text-white">
                          {generatedCertificate.bdypDeregistrationCode}
                        </strong>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Mülkiyyətçi (FİN)</span>
                        <strong className="text-white">
                          {generatedCertificate.applicantFullName} ({generatedCertificate.applicantFin})
                        </strong>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Nəqliyyat Vasitəsi</span>
                        <strong className="text-white">
                          {generatedCertificate.vehicleTitle} ({generatedCertificate.manufactureYear})
                        </strong>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Güzəşt Vauçeri (100%)</span>
                        <strong className="text-emerald-400 font-black">
                          {formatAmount(generatedCertificate.voucherAmountAzn)}
                        </strong>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Nağd Alternativ (70%)</span>
                        <strong className="text-amber-400 font-black">
                          {formatAmount(generatedCertificate.cashPayoutAmountAzn)}
                        </strong>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400 block">Qəbul edən rəsmi məntəqə:</span>
                        <strong className="text-white">{generatedCertificate.centerName}</strong>
                      </div>
                      <div className="text-right font-mono text-[11px] text-emerald-400">
                        <div>QR: {generatedCertificate.qrVerificationHash}</div>
                        <div className="text-slate-400">Etibarlıdır: {generatedCertificate.expiryDate}</div>
                      </div>
                    </div>
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

import React, { useState, useMemo } from 'react';
import { Vehicle, Currency, Language, FuelType } from '../types/vehicle';
import { formatPrice } from '../utils/i18n';
import {
  OriginCountry,
  CustomsCalculationInput,
  QuickImportPreset,
} from '../types/customs';
import {
  ORIGIN_PRESETS,
  QUICK_VEHICLE_IMPORT_PRESETS,
  CURRENT_CALCULATION_YEAR,
  calculateCustomsDuties,
  compareImportVsLocal,
  compareFuelCustomsScenarios,
  generateCustomsReceipt,
} from '../utils/customs';
import {
  X,
  Calculator,
  Ship,
  Sparkles,
  FileText,
  Printer,
  Copy,
  Check,
  TrendingDown,
  ShieldCheck,
  Zap,
  Info,
  DollarSign,
  AlertCircle,
  Clock,
  ArrowRight,
  Globe,
  RotateCcw,
} from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock';
import { useKeyPress } from '../hooks/useKeyPress';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { toastManager } from '../hooks/useToast';

export interface CustomsCalculatorModalProps {
  isOpen?: boolean;
  vehicle?: Vehicle | null;
  initialVehicle?: Vehicle | null;
  currency: Currency;
  lang: Language;
  onClose: () => void;
}

type TabType = 'calculator' | 'scenarios' | 'logistics' | 'receipt';

const TRANSLATIONS = {
  az: {
    title: 'DGK Gömrük Rüsumu & Aksiz Kalkulyatoru',
    subtitle: 'Dövlət Gömrük Komitəsinin rəsmi tarif cədvəli və AR Vergi Məcəlləsi (190-cı maddə) əsasında',
    tabCalc: 'Kalkulyator',
    tabScenarios: 'Mühərrik Müqayisəsi',
    tabLogistics: 'Logistika & Marşrutlar',
    tabReceipt: 'Rəsmi Arayış',
    quickPresets: 'Populyar İdxal Preseti:',
    originCountry: 'Mənşə Ölkəsi & Koridor',
    vehiclePrice: 'Alış Qiyməti (İnvoys)',
    currency: 'Valyuta',
    year: 'Buraxılış İli',
    engineCc: 'Mühərrik Həcmi (sm³)',
    fuelType: 'Mühərrik Növü',
    freightCost: 'Çatdırılma / Nəqliyyat ($)',
    bakuMarketPrice: 'Bakı Bazar Qiyməti (Müqayisə)',
    totalDuties: 'Yekun Gömrük Xərcləri',
    totalLanded: 'Bakıda Tam Maya Dəyəri',
    effectiveRate: 'Effektiv Vergi Dərəcəsi',
    netSavings: 'İdxal Qənaəti',
    customsDuty: 'İdxal Gömrük Rüsumu (15%)',
    exciseTax: 'Aksiz Vergisi (VM M.190)',
    vat: 'ƏDV (18%)',
    clearanceFee: 'Gömrük Yığımı (Qərar 305)',
    electronicFee: 'Elektron Vəsiqə Xidməti',
    utilizationFee: 'Utilizasiya Haqqı (2024)',
    greenExemption: '0% Yaşıl Güzəşt',
    hybridExemption: '0% Ekoloji Güzəşt',
    strongImport: 'Yüksək Sərfəlilik (+12%)',
    moderateImport: 'Mülayim Sərfəlilik',
    buyLocal: 'Bakıdan almaq daha sərfəlidir',
    petrol: 'Benzin',
    diesel: 'Dizel',
    hybrid: 'Hibrid',
    electric: 'Elektrik',
    copyReceipt: 'Arayışı Kopyala',
    copied: 'Kopyalandı!',
    print: 'Çap Et',
    reset: 'Sıfırla',
    savingsVsPetrol: 'Benzinə nisbətən qənaət:',
    transitTime: 'Orta Çatdırılma Müddəti',
    popularHub: 'Tranzit Qovşağı / Liman',
    auctions: 'Əsas Mənbələr / Hərraclar',
    docChecklist: 'Gömrük Rəsmiləşdirilməsi Üçün Sənədlər',
    doc1: 'Orijinal Alqı-Satqı İnvoysu (Bill of Sale / Invoice)',
    doc2: 'Beynəlxalq Yük Daşıma Qaiməsi (Bill of Lading / CMR)',
    doc3: 'Nəqliyyat Vasitəsinin Texniki Pasportu (Title / Vəsiqə)',
    doc4: 'İxrac Bəyannaməsi (Export Declaration)',
    doc5: 'Ekoloji Uyğunluq Sertifikatı (Euro-5 standartı)',
  },
  en: {
    title: 'Customs Duty & Excise Tax Calculator (DGK)',
    subtitle: 'Based on official State Customs Committee tariff schedule & Tax Code (Article 190)',
    tabCalc: 'Calculator',
    tabScenarios: 'Fuel Scenarios',
    tabLogistics: 'Logistics & Routes',
    tabReceipt: 'Official Statement',
    quickPresets: 'Popular Import Presets:',
    originCountry: 'Origin Country & Route',
    vehiclePrice: 'Purchase Price (Invoice)',
    currency: 'Currency',
    year: 'Manufacture Year',
    engineCc: 'Engine Displacement (cc)',
    fuelType: 'Powertrain Type',
    freightCost: 'Freight / Shipping ($)',
    bakuMarketPrice: 'Baku Market Price (Benchmark)',
    totalDuties: 'Total Customs Duties',
    totalLanded: 'Total Landed Cost in Baku',
    effectiveRate: 'Effective Tax Rate',
    netSavings: 'Import Savings',
    customsDuty: 'Import Customs Duty (15%)',
    exciseTax: 'Excise Tax (Tax Code 190)',
    vat: 'VAT (18%)',
    clearanceFee: 'Clearance Fee (Res. 305)',
    electronicFee: 'Electronic Certificate Fee',
    utilizationFee: 'Utilization / Recycling Fee',
    greenExemption: '0% Green Concession',
    hybridExemption: '0% Eco Exemption',
    strongImport: 'High Value Import (+12%)',
    moderateImport: 'Moderate Advantage',
    buyLocal: 'Local purchase is more feasible',
    petrol: 'Petrol',
    diesel: 'Diesel',
    hybrid: 'Hybrid',
    electric: 'Electric',
    copyReceipt: 'Copy Statement',
    copied: 'Copied!',
    print: 'Print',
    reset: 'Reset',
    savingsVsPetrol: 'Savings vs Petrol:',
    transitTime: 'Average Transit Time',
    popularHub: 'Transit Hub / Seaport',
    auctions: 'Primary Sourcing / Auctions',
    docChecklist: 'Required Customs Clearance Documentation',
    doc1: 'Original Commercial Invoice / Bill of Sale',
    doc2: 'Bill of Lading / Ocean Freight CMR',
    doc3: 'Original Certificate of Title / Registration',
    doc4: 'Export Clearance Declaration',
    doc5: 'Euro-5 Emissions & Compliance Certificate',
  },
  ru: {
    title: 'Таможенный калькулятор пошлин и акцизов (ГТК)',
    subtitle: 'На основе официальной сетки Государственного таможенного комитета и Налогового кодекса АР',
    tabCalc: 'Калькулятор',
    tabScenarios: 'Сравнение двигателей',
    tabLogistics: 'Логистика и маршруты',
    tabReceipt: 'Официальная справка',
    quickPresets: 'Популярные пресеты авто:',
    originCountry: 'Страна ввоза и коридор',
    vehiclePrice: 'Цена покупки (Инвойс)',
    currency: 'Валюта',
    year: 'Год выпуска',
    engineCc: 'Объём двигателя (см³)',
    fuelType: 'Тип двигателя',
    freightCost: 'Доставка / Фрахт ($)',
    bakuMarketPrice: 'Рыночная цена в Баку',
    totalDuties: 'Итого таможенные сборы',
    totalLanded: 'Себестоимость под ключ в Баку',
    effectiveRate: 'Эффективная ставка сборов',
    netSavings: 'Выгода от ввоза',
    customsDuty: 'Ввозная пошлина (15%)',
    exciseTax: 'Акцизный налог (НК 190)',
    vat: 'НДС (18%)',
    clearanceFee: 'Таможенный сбор (Пост. 305)',
    electronicFee: 'Электронный сертификат',
    utilizationFee: 'Утилизационный сбор (2024)',
    greenExemption: '0% Льгота EV',
    hybridExemption: '0% Льгота Гибрид',
    strongImport: 'Высокая выгода (+12%)',
    moderateImport: 'Умеренная выгода',
    buyLocal: 'Выгоднее купить в Баку',
    petrol: 'Бензин',
    diesel: 'Дизель',
    hybrid: 'Гибрид',
    electric: 'Электро',
    copyReceipt: 'Копировать справку',
    copied: 'Скопировано!',
    print: 'Печать',
    reset: 'Сбросить',
    savingsVsPetrol: 'Экономия по сравнению с бензином:',
    transitTime: 'Средний срок доставки',
    popularHub: 'Транзитный хаб / Порт',
    auctions: 'Основные аукционы / Источники',
    docChecklist: 'Документы для таможенного оформления',
    doc1: 'Оригинал инвойса / Bill of Sale',
    doc2: 'Транспортная накладная (Bill of Lading / CMR)',
    doc3: 'Техпаспорт (Certificate of Title)',
    doc4: 'Экспортная декларация',
    doc5: 'Сертификат соответствия Euro-5',
  },
};

export const CustomsCalculatorModal: React.FC<CustomsCalculatorModalProps> = ({
  isOpen = true,
  vehicle = null,
  initialVehicle = null,
  currency,
  lang,
  onClose,
}) => {
  const targetCar = vehicle || initialVehicle || null;
  const t = TRANSLATIONS[lang] || TRANSLATIONS.az;
  const [activeTab, setActiveTab] = useState<TabType>('calculator');

  // Input states
  const [originCountry, setOriginCountry] = useState<OriginCountry>('usa');
  const [vehiclePrice, setVehiclePrice] = useState<number>(() => {
    if (targetCar) {
      return Math.round(targetCar.priceAzn / 1.70);
    }
    return 16500;
  });
  const [inputCurrency, setInputCurrency] = useState<Currency>('USD');
  const [manufactureYear, setManufactureYear] = useState<number>(() => targetCar?.year || 2022);
  const [engineCapacityCc, setEngineCapacityCc] = useState<number>(() => {
    if (targetCar) {
      return targetCar.fuelType === 'electric' ? 0 : Math.round(targetCar.engineVolumeLiters * 1000);
    }
    return 2000;
  });
  const [fuelType, setFuelType] = useState<FuelType>(() => targetCar?.fuelType || 'petrol');
  const [freightOverride, setFreightOverride] = useState<number | undefined>(undefined);
  const [bakuMarketBenchmark, setBakuMarketBenchmark] = useState<number>(() => targetCar?.priceAzn || 42000);

  const [copiedReceipt, copyReceiptText] = useCopyToClipboard();

  useScrollLock(isOpen);
  useKeyPress('Escape', onClose);

  // Apply quick preset
  const handleApplyPreset = (preset: QuickImportPreset) => {
    setOriginCountry(preset.origin);
    setVehiclePrice(preset.estimatedAuctionPriceUsd);
    setInputCurrency('USD');
    setManufactureYear(preset.year);
    setEngineCapacityCc(preset.engineCc);
    setFuelType(preset.fuelType);
    setFreightOverride(undefined);
    setBakuMarketBenchmark(preset.bakuMarketPriceAzn);
    toastManager.add(`«${preset.title}» preseti tətbiq edildi`, 'info');
  };

  // Reset to initial or default state
  const handleReset = () => {
    if (targetCar) {
      setVehiclePrice(Math.round(targetCar.priceAzn / 1.70));
      setInputCurrency('USD');
      setManufactureYear(targetCar.year);
      setEngineCapacityCc(targetCar.fuelType === 'electric' ? 0 : Math.round(targetCar.engineVolumeLiters * 1000));
      setFuelType(targetCar.fuelType);
      setBakuMarketBenchmark(targetCar.priceAzn);
    } else {
      setVehiclePrice(16500);
      setInputCurrency('USD');
      setOriginCountry('usa');
      setManufactureYear(2022);
      setEngineCapacityCc(2000);
      setFuelType('petrol');
      setBakuMarketBenchmark(42000);
    }
    setFreightOverride(undefined);
  };

  // Calculations
  const calculationInput: CustomsCalculationInput = useMemo(() => {
    return {
      vehiclePrice: Math.max(0, vehiclePrice),
      currency: inputCurrency,
      originCountry,
      manufactureYear,
      engineCapacityCc: fuelType === 'electric' ? 0 : Math.max(0, engineCapacityCc),
      fuelType,
      freightCostOverrideUsd: freightOverride,
    };
  }, [
    vehiclePrice,
    inputCurrency,
    originCountry,
    manufactureYear,
    engineCapacityCc,
    fuelType,
    freightOverride,
  ]);

  const breakdown = useMemo(() => {
    return calculateCustomsDuties(calculationInput);
  }, [calculationInput]);

  const comparison = useMemo(() => {
    return compareImportVsLocal(breakdown.totalLandedCostAzn, bakuMarketBenchmark);
  }, [breakdown.totalLandedCostAzn, bakuMarketBenchmark]);

  const fuelScenarios = useMemo(() => {
    return compareFuelCustomsScenarios(calculationInput);
  }, [calculationInput]);

  const receiptText = useMemo(() => {
    return generateCustomsReceipt(breakdown, calculationInput, targetCar?.title);
  }, [breakdown, calculationInput, targetCar?.title]);

  const activeOriginInfo = ORIGIN_PRESETS[originCountry] || ORIGIN_PRESETS.usa;

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-400">
                <Ship className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">{t.title}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  DGK 2026
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-1">{t.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title={t.reset}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              aria-label="Bağla"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-4 sm:px-6 border-b border-slate-800 bg-slate-950/40 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`py-3 px-3.5 border-b-2 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'calculator'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>{t.tabCalc}</span>
          </button>

          <button
            onClick={() => setActiveTab('scenarios')}
            className={`py-3 px-3.5 border-b-2 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'scenarios'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>{t.tabScenarios}</span>
          </button>

          <button
            onClick={() => setActiveTab('logistics')}
            className={`py-3 px-3.5 border-b-2 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'logistics'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>{t.tabLogistics}</span>
          </button>

          <button
            onClick={() => setActiveTab('receipt')}
            className={`py-3 px-3.5 border-b-2 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'receipt'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{t.tabReceipt}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              {/* Quick Vehicle Presets */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                  {t.quickPresets}
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {QUICK_VEHICLE_IMPORT_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-cyan-300 font-medium whitespace-nowrap transition-all flex items-center gap-1.5"
                    >
                      <span>{ORIGIN_PRESETS[preset.origin]?.flag}</span>
                      <span>{preset.title}</span>
                      <span className="text-[10px] text-slate-500">(${preset.estimatedAuctionPriceUsd.toLocaleString()})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Configuration & Top KPIs */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Controls (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Origin Corridor Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                      {t.originCountry}
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {(Object.keys(ORIGIN_PRESETS) as OriginCountry[]).map((cKey) => {
                        const opt = ORIGIN_PRESETS[cKey];
                        const isSelected = originCountry === cKey;
                        return (
                          <button
                            key={cKey}
                            onClick={() => setOriginCountry(cKey)}
                            className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                              isSelected
                                ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10'
                                : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <span className="text-xl">{opt.flag}</span>
                            <span className="text-[11px] font-bold truncate max-w-full">
                              {lang === 'en' ? opt.nameEn : lang === 'ru' ? opt.nameRu : opt.nameAz.split(' ')[0]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Price & Currency */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                        {t.vehiclePrice}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={vehiclePrice || ''}
                        onChange={(e) => setVehiclePrice(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white font-bold text-sm focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                        {t.currency}
                      </label>
                      <select
                        value={inputCurrency}
                        onChange={(e) => setInputCurrency(e.target.value as Currency)}
                        className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white font-semibold text-sm focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="AZN">AZN (₼)</option>
                      </select>
                    </div>
                  </div>

                  {/* Year & Engine Displacement */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                        {t.year} ({breakdown.vehicleAgeYears} il istismar)
                      </label>
                      <input
                        type="number"
                        min="1990"
                        max={CURRENT_CALCULATION_YEAR}
                        value={manufactureYear}
                        onChange={(e) => setManufactureYear(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white font-bold text-sm focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                        {t.engineCc}
                      </label>
                      <input
                        type="number"
                        min="0"
                        disabled={fuelType === 'electric'}
                        value={fuelType === 'electric' ? 0 : engineCapacityCc}
                        onChange={(e) => setEngineCapacityCc(Number(e.target.value))}
                        className={`w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white font-bold text-sm focus:border-cyan-500 focus:outline-none ${
                          fuelType === 'electric' ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Fuel Type Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                      {t.fuelType}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'petrol' as FuelType, label: t.petrol, icon: '⛽' },
                        { id: 'diesel' as FuelType, label: t.diesel, icon: '🛢️' },
                        { id: 'hybrid' as FuelType, label: t.hybrid, icon: '⚡' },
                        { id: 'electric' as FuelType, label: t.electric, icon: '🔋' },
                      ].map((item) => {
                        const isSelected = fuelType === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setFuelType(item.id);
                              if (item.id === 'electric') setEngineCapacityCc(0);
                              else if (engineCapacityCc === 0) setEngineCapacityCc(2000);
                            }}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                              isSelected
                                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-sm'
                                : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Freight & Baku Comparison Price */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase">
                          {t.freightCost}
                        </label>
                        <span className="text-[10px] text-slate-500">
                          Standart: ${activeOriginInfo.defaultFreightUsd}
                        </span>
                      </div>
                      <input
                        type="number"
                        placeholder={`$${activeOriginInfo.defaultFreightUsd}`}
                        value={freightOverride !== undefined ? freightOverride : ''}
                        onChange={(e) =>
                          setFreightOverride(e.target.value === '' ? undefined : Number(e.target.value))
                        }
                        className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white font-medium text-sm focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                        {t.bakuMarketPrice} (₼)
                      </label>
                      <input
                        type="number"
                        value={bakuMarketBenchmark || ''}
                        onChange={(e) => setBakuMarketBenchmark(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white font-medium text-sm focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* KPI Result Highlights (5 cols) */}
                <div className="lg:col-span-5 space-y-3 flex flex-col justify-between">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 space-y-4">
                    {/* Exemption Badges */}
                    {breakdown.isElectricVehicle && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5">
                        <Zap className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        <div className="text-xs text-emerald-300">
                          <strong className="block font-bold">100% Yaşıl Enerji Güzəşti:</strong>
                          Rüsum, aksiz vergisi və ƏDV 0 AZN hesablanır!
                        </div>
                      </div>
                    )}

                    {breakdown.isEligibleHybrid && (
                      <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-2.5">
                        <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                        <div className="text-xs text-cyan-300">
                          <strong className="block font-bold">Ekoloji Hibrid İmtiyazı:</strong>
                          3 ilədək və ≤2500 sm³ hibridlər rüsum və ƏDV-dən azaddır!
                        </div>
                      </div>
                    )}

                    {/* Primary Figures */}
                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        {t.totalDuties}
                      </span>
                      <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                        {formatPrice(breakdown.totalCustomsDutiesAzn, 'AZN')}
                      </div>
                      <span className="text-xs text-slate-400 mt-0.5 block">
                        ~${Math.round(breakdown.totalCustomsDutiesAzn / 1.70).toLocaleString()} USD
                      </span>
                    </div>

                    <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase block">
                          {t.totalLanded}
                        </span>
                        <div className="text-lg font-black text-white mt-0.5">
                          {formatPrice(breakdown.totalLandedCostAzn, 'AZN')}
                        </div>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase block">
                          {t.effectiveRate}
                        </span>
                        <div className="text-lg font-black text-amber-400 mt-0.5">
                          {breakdown.effectiveTaxRatePercent}%
                        </div>
                      </div>
                    </div>

                    {/* Import Net Savings vs Baku Market */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">
                          {t.netSavings}
                        </span>
                        <span className={`text-base font-black ${comparison.netSavingsAzn > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {comparison.netSavingsAzn > 0 ? `+₼${comparison.netSavingsAzn.toLocaleString()}` : `₼${comparison.netSavingsAzn.toLocaleString()}`}
                        </span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        comparison.recommendation === 'strong_import'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : comparison.recommendation === 'moderate_import'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {comparison.recommendation === 'strong_import'
                          ? t.strongImport
                          : comparison.recommendation === 'moderate_import'
                          ? t.moderateImport
                          : t.buyLocal}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Itemized Tariff Breakdown List */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Dövlət Gömrük Komitəsi Rəsmi Tarif Maddələri</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Customs Duty */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">{t.customsDuty}</span>
                      {breakdown.isCustomsDutyExempt && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold">
                          {t.greenExemption}
                        </span>
                      )}
                    </div>
                    <div className="text-base font-black text-white">
                      {formatPrice(breakdown.customsDutyAzn, 'AZN')}
                    </div>
                    <p className="text-[10px] text-slate-500">15% CIF və ya mühərrik kubuna görə minimum tarif</p>
                  </div>

                  {/* Excise Tax */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">{t.exciseTax}</span>
                      {breakdown.isExciseExempt && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold">
                          0 AZN
                        </span>
                      )}
                    </div>
                    <div className="text-base font-black text-white">
                      {formatPrice(breakdown.exciseTaxAzn, 'AZN')}
                    </div>
                    <p className="text-[10px] text-slate-500">Mühərrik həcmi və istismar ilinə görə dərəcəli cədvəl</p>
                  </div>

                  {/* VAT */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">{t.vat}</span>
                      {breakdown.isVatExempt && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold">
                          0 AZN
                        </span>
                      )}
                    </div>
                    <div className="text-base font-black text-white">
                      {formatPrice(breakdown.vatAzn, 'AZN')}
                    </div>
                    <p className="text-[10px] text-slate-500">(Gömrük Dəyəri + Rüsum + Aksiz) × 18%</p>
                  </div>

                  {/* Clearance Fee */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">{t.clearanceFee}</span>
                      <span className="text-[10px] text-slate-500">Qərar №305</span>
                    </div>
                    <div className="text-base font-black text-white">
                      {formatPrice(breakdown.customsClearanceFeeAzn, 'AZN')}
                    </div>
                    <p className="text-[10px] text-slate-500">Dəyər şkalasına görə rəsmiləşdirmə haqqı</p>
                  </div>

                  {/* Electronic Fee */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">{t.electronicFee}</span>
                      <span className="text-[10px] text-slate-500">Standart</span>
                    </div>
                    <div className="text-base font-black text-white">
                      {formatPrice(breakdown.electronicFeeAzn, 'AZN')}
                    </div>
                    <p className="text-[10px] text-slate-500">Elektron gömrük bəyannaməsi və vəsiqə rüsumu</p>
                  </div>

                  {/* Utilization Fee */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">{t.utilizationFee}</span>
                      <span className="text-[10px] text-slate-500">Utilizasiya</span>
                    </div>
                    <div className="text-base font-black text-white">
                      {formatPrice(breakdown.utilizationFeeAzn, 'AZN')}
                    </div>
                    <p className="text-[10px] text-slate-500">Nəqliyyat vasitələrinin utilizasiyası fondu</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FUEL SCENARIO MATRIX */}
          {activeTab === 'scenarios' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/20 to-emerald-900/20 border border-blue-500/20 flex items-start gap-3">
                <Zap className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-slate-300 space-y-1">
                  <strong className="text-emerald-300 block font-bold">
                    Eyni büdcəli avtomobil üçün mühərrik tiplərinə görə gömrük müqayisəsi:
                  </strong>
                  <p>
                    Azərbaycan Respublikasının qanunvericiliyinə əsasən, elektromobillər və 3 ilədək yaşı olan hibridlər gömrükdə böyük vergi güzəştlərinə malikdir.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {fuelScenarios.map((sc) => (
                  <div
                    key={sc.fuelType}
                    className={`p-4 rounded-2xl border flex flex-col justify-between space-y-4 ${
                      sc.isGreenAdvantaged
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white uppercase">{sc.titleAz}</span>
                        {sc.isGreenAdvantaged && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Güzəştli
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] text-slate-400">Gömrük Xərcləri:</span>
                        <div className="text-xl font-black text-white">
                          {formatPrice(sc.customsDutiesAzn, 'AZN')}
                        </div>
                      </div>

                      <div className="space-y-1 mt-3">
                        <span className="text-[11px] text-slate-400">Bakıda Tam Maya Dəyəri:</span>
                        <div className="text-sm font-bold text-slate-300">
                          {formatPrice(sc.totalLandedCostAzn, 'AZN')}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800">
                      {sc.savingsVsPetrolAzn > 0 ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                          <TrendingDown className="w-3.5 h-3.5" />
                          <span>+₼{sc.savingsVsPetrolAzn.toLocaleString()} qənaət</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 font-medium">Baza göstərici</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LOGISTICS & ROUTES */}
          {activeTab === 'logistics' && (
            <div className="space-y-6">
              {/* Active Route Details */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{activeOriginInfo.flag}</span>
                  <div>
                    <h3 className="text-base font-bold text-white">{activeOriginInfo.nameAz}</h3>
                    <p className="text-xs text-slate-400">{activeOriginInfo.transitHub}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      {t.transitTime}
                    </span>
                    <div className="text-sm font-bold text-cyan-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>~{activeOriginInfo.averageTransitDays} gün</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Standart Daşıma Qiyməti
                    </span>
                    <div className="text-sm font-bold text-white flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span>${activeOriginInfo.defaultFreightUsd.toLocaleString()} USD</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Populyar Hərrac / Mənbə
                    </span>
                    <div className="text-xs font-semibold text-slate-300 truncate">
                      {activeOriginInfo.popularSource}
                    </div>
                  </div>
                </div>
              </div>

              {/* Documentation Checklist */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>{t.docChecklist}</span>
                </h4>
                <div className="space-y-2">
                  {[t.doc1, t.doc2, t.doc3, t.doc4, t.doc5].map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OFFICIAL RECEIPT */}
          {activeTab === 'receipt' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">
                  Rəsmi DGK hesablama protokolu və arayışı
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      copyReceiptText(receiptText);
                      toastManager.add('Gömrük arayışı buferə kopyalandı!', 'success');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold flex items-center gap-1.5 transition-all"
                  >
                    {copiedReceipt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedReceipt ? t.copied : t.copyReceipt}</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs text-white font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{t.print}</span>
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs sm:text-sm text-slate-300 whitespace-pre-wrap overflow-x-auto leading-relaxed shadow-inner">
                {receiptText}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

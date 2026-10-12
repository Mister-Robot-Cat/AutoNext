import React, { useState, useMemo } from 'react';
import { Vehicle, Currency, Language } from '../types/vehicle';
import {
  InsuranceInputParams,
  InsuranceCompanyId,
  KaskoPackageTier,
  FranchiseAmount,
  RegistrationRegion,
  KaskoRepairType,
  PolicyApplicationFormData,
  PolicyIssuedCertificate,
  KaskoAddonKey
} from '../types/insurance';
import {
  AZERBAIJAN_INSURANCE_COMPANIES,
  BONUS_MALUS_TABLE,
  KASKO_ADDON_DEFINITIONS,
  INSURANCE_FAQS
} from '../data/mockInsuranceData';
import {
  calculateInsuranceComparison,
  generateDigitalPolicyCertificate,
  getBonusMalusBadgeData
} from '../utils/insurance';
import { formatPrice } from '../utils/i18n';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  Car,
  FileCheck2,
  Calendar,
  Phone,
  CheckCircle,
  HelpCircle,
  Sparkles,
  ExternalLink,
  Printer,
  Copy,
  Check,
  Flame,
  Clock,
  ArrowRight,
  Sliders,
  DollarSign
} from 'lucide-react';

export interface InsuranceCalculatorModalProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  currency: Currency;
  lang: Language;
  onClose: () => void;
}

type TabType = 'calculator' | 'compulsory' | 'kasko' | 'guide' | 'policy';

export const InsuranceCalculatorModal: React.FC<InsuranceCalculatorModalProps> = ({
  isOpen,
  vehicle,
  currency,
  lang,
  onClose
}) => {
  if (!isOpen || !vehicle) return null;

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>('calculator');

  // Input state
  const [vehiclePrice, setVehiclePrice] = useState<number>(vehicle.priceAzn || 45000);
  const [bonusMalusClass, setBonusMalusClass] = useState<number>(10);
  const [region, setRegion] = useState<RegistrationRegion>('baku_sumgayit_absheron');
  const [driverAge, setDriverAge] = useState<number>(30);
  const [drivingExperienceYears, setDrivingExperienceYears] = useState<number>(6);
  const [franchise, setFranchise] = useState<FranchiseAmount>(250);
  const [repairType, setRepairType] = useState<KaskoRepairType>('official_dealer');
  const [selectedTier, setSelectedTier] = useState<KaskoPackageTier>('standard');
  const [selectedCompanyId, setSelectedCompanyId] = useState<InsuranceCompanyId>('pasha');

  // Addons state
  const [addons, setAddons] = useState<Record<KaskoAddonKey, boolean>>({
    roadside_assistance: true,
    replacement_vehicle: false,
    no_police_certificate_glass: true,
    driver_passenger_accident: false,
    territory_expansion: false
  });

  // Policy Form state
  const [ownerFullName, setOwnerFullName] = useState<string>('Nurlan Əliyev');
  const [ownerFin, setOwnerFin] = useState<string>('5KT89LM');
  const [ownerPhone, setOwnerPhone] = useState<string>('+994 50 234 56 78');
  const [plateNumber, setPlateNumber] = useState<string>('99-AA-555');
  const [includeCompulsory, setIncludeCompulsory] = useState<boolean>(true);
  const [includeKasko, setIncludeKasko] = useState<boolean>(true);
  const [paymentPlan, setPaymentPlan] = useState<'annual' | 'monthly_12'>('monthly_12');

  // Issued certificate state
  const [issuedCertificate, setIssuedCertificate] = useState<PolicyIssuedCertificate | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Derived params
  const inputParams: InsuranceInputParams = useMemo(() => {
    let driverCategory: 'young_novice' | 'standard' | 'experienced' = 'standard';
    if (driverAge < 25 || drivingExperienceYears < 2) {
      driverCategory = 'young_novice';
    } else if (driverAge >= 30 && drivingExperienceYears >= 5) {
      driverCategory = 'experienced';
    }

    return {
      vehiclePriceAzn: vehiclePrice,
      engineVolumeLiters: vehicle.engineVolumeLiters,
      fuelType: vehicle.fuelType,
      year: vehicle.year,
      bonusMalusClass,
      region,
      driverCategory,
      driverAge,
      drivingExperienceYears,
      franchise,
      repairType,
      addons
    };
  }, [
    vehiclePrice,
    vehicle.engineVolumeLiters,
    vehicle.fuelType,
    vehicle.year,
    bonusMalusClass,
    region,
    driverAge,
    drivingExperienceYears,
    franchise,
    repairType,
    addons
  ]);

  // Calculations
  const comparison = useMemo(() => {
    return calculateInsuranceComparison(inputParams, AZERBAIJAN_INSURANCE_COMPANIES, selectedTier);
  }, [inputParams, selectedTier]);

  const activeQuote = useMemo(() => {
    return comparison.kaskoQuotes.find(q => q.companyId === selectedCompanyId) || comparison.kaskoQuotes[0];
  }, [comparison, selectedCompanyId]);

  const bmBadge = useMemo(() => {
    return getBonusMalusBadgeData(bonusMalusClass);
  }, [bonusMalusClass]);

  const totalAnnualCostAzn = (includeCompulsory ? comparison.compulsory.finalCompulsoryPremiumAzn : 0) +
    (includeKasko ? activeQuote.annualPremiumAzn : 0);

  const totalMonthlyCostAzn = Math.round((totalAnnualCostAzn / 12) * 100) / 100;

  const toggleAddon = (key: KaskoAddonKey) => {
    setAddons(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApplyPolicy = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const formData: PolicyApplicationFormData = {
      ownerFullName: ownerFullName.trim() || 'Avtomobil Sahibi',
      ownerFin: ownerFin.trim() || 'AZE1234',
      ownerPhone: ownerPhone.trim() || '+994 50 000 00 00',
      plateNumber: plateNumber.trim() || '10-XX-001',
      selectedCompanyId,
      selectedTier,
      includeCompulsory,
      includeKasko,
      paymentPlan
    };

    const cert = generateDigitalPolicyCertificate(formData, vehicle, activeQuote, comparison.compulsory);
    setIssuedCertificate(cert);
    setActiveTab('policy');
  };

  const handleCopyCertificate = () => {
    if (!issuedCertificate) return;
    const text = `AutoNext E-Sığorta Sertifikatı:
Polis: ${issuedCertificate.policyNumber}
${issuedCertificate.icbariPolicyNumber ? `İcbari Polis: ${issuedCertificate.icbariPolicyNumber}\n` : ''}${issuedCertificate.kaskoPolicyNumber ? `KASKO Polis: ${issuedCertificate.kaskoPolicyNumber}\n` : ''}Sığortalı: ${issuedCertificate.holderName} (FİN: ${issuedCertificate.finCode})
Avtomobil: ${issuedCertificate.vehicleTitle}
VIN: ${issuedCertificate.vin}
Dövlət Qeydiyyat Nişanı: ${issuedCertificate.plateNumber}
Sığorta Şirkəti: ${issuedCertificate.insuranceCompanyName}
Məbləğ: ${issuedCertificate.totalAnnualPremiumAzn} AZN/il
Qüvvədə olma müddəti: ${issuedCertificate.issueDate} - ${issuedCertificate.validUntil}
Elektron İmza ID: ${issuedCertificate.digitalSignatureId}`;

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
      data-testid="insurance-calculator-modal"
    >
      <div
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-600/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  İcbari & KASKO Sığorta Kalkulyatoru
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  AMB & İSB 2026 Tənzimlənməsi
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {vehicle.year} {vehicle.make} {vehicle.model} • VIN: <span className="font-mono text-slate-300">{vehicle.vin}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            data-testid="insurance-close-btn"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-2 bg-slate-950/50 border-b border-slate-800/80 overflow-x-auto">
          {[
            { id: 'calculator', label: 'Kalkulyator & Parametrlər', icon: Sliders },
            { id: 'compulsory', label: 'İcbari Sığorta (AMB)', icon: ShieldAlert },
            { id: 'kasko', label: 'KASKO Təklifləri (5 Şirkət)', icon: Flame },
            { id: 'guide', label: 'Qəza Zamanı Addımlar & FAQ', icon: HelpCircle },
            { id: 'policy', label: 'E-Polis & Sertifikat', icon: FileCheck2 }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabType)}
                data-testid={`insurance-tab-${tab.id}`}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: CALCULATOR & PARAMETERS */}
          {activeTab === 'calculator' && (
            <div className="space-y-6" data-testid="tab-calculator-content">
              {/* Top Highlights KPI strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>İcbari Sığorta (İllik)</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${bmBadge.badgeClass}`}>
                      {bmBadge.label}
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white">
                    {formatPrice(comparison.compulsory.finalCompulsoryPremiumAzn, currency)}
                    <span className="text-xs text-slate-400 font-normal"> / il</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Baza: {comparison.compulsory.baseTariffAzn} AZN • Məsuliyyət limiti: 55 000 AZN
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-sky-500/30">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Seçilmiş KASKO ({activeQuote.companyName})</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
                      {activeQuote.tierNameAz}
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-sky-400">
                    {formatPrice(activeQuote.annualPremiumAzn, currency)}
                    <span className="text-xs text-slate-400 font-normal"> / il</span>
                  </div>
                  <p className="text-[11px] text-sky-400/80 mt-1">
                    və ya 12 ay faizsiz <strong>{formatPrice(activeQuote.monthlyInstallmentAzn, currency)} / ay</strong>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-950/70 border border-indigo-500/30">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Tam Paket Cəmi</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Hər Şey Daxil
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white">
                    {formatPrice(totalAnnualCostAzn, currency)}
                    <span className="text-xs text-slate-400 font-normal"> / il</span>
                  </div>
                  <p className="text-[11px] text-indigo-300 mt-1">
                    Aylıq cəmi: <strong>{formatPrice(totalMonthlyCostAzn, currency)} / ay</strong>
                  </p>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Vehicle & Price Parameters */}
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Car className="w-4 h-4 text-sky-400" />
                    <span>Avtomobil və Dəyər Göstəriciləri</span>
                  </h3>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <label className="text-slate-400">Sığorta Dəyəri (Bazar Qiyməti)</label>
                      <span className="font-bold text-white">{formatPrice(vehiclePrice, currency)}</span>
                    </div>
                    <input
                      type="range"
                      min={5000}
                      max={200000}
                      step={1000}
                      value={vehiclePrice}
                      onChange={(e) => setVehiclePrice(Number(e.target.value))}
                      className="w-full accent-sky-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>5 000 AZN</span>
                      <span>100 000 AZN</span>
                      <span>200 000 AZN</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block mb-1">Mühərrik Həcmi</span>
                      <strong className="text-white">
                        {vehicle.engineVolumeLiters > 0 ? `${vehicle.engineVolumeLiters} Litr` : 'EV (Elektrik)'}
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block mb-1">Buraxılış İli</span>
                      <strong className="text-white">{vehicle.year} ({2026 - vehicle.year} il istismar)</strong>
                    </div>
                  </div>

                  {/* Deductible / Franchise */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">
                      KASKO Azadolma Məbləği (Franşiza)
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {([0, 100, 250, 500, 1000] as FranchiseAmount[]).map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setFranchise(val)}
                          className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                            franchise === val
                              ? 'bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-600/20'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {val === 0 ? '0 AZN' : `${val} ₼`}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1.5">
                      Yüksək franşiza seçdikdə illik sığorta haqqı daha ucuz olur.
                    </p>
                  </div>

                  {/* Repair Workshop Preference */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Təmir Məkanı Seçimi</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRepairType('official_dealer')}
                        className={`p-3 rounded-xl border text-left text-xs transition-all ${
                          repairType === 'official_dealer'
                            ? 'bg-sky-600/20 border-sky-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <strong className="block text-white mb-0.5">Rəsmi Diler Servisi</strong>
                        <span className="text-[10px] text-slate-400">Orijinal ehtiyat hissələri ilə təmir</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRepairType('partner_workshop')}
                        className={`p-3 rounded-xl border text-left text-xs transition-all ${
                          repairType === 'partner_workshop'
                            ? 'bg-sky-600/20 border-sky-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <strong className="block text-white mb-0.5">Partnyor Servis</strong>
                        <span className="text-[10px] text-slate-400">Geniş akkreditə olunmuş şəbəkə (-15% qənaət)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Driver & Bonus-Malus Parameters */}
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Sürücü Məlumatları & Bonus-Malus</span>
                  </h3>

                  {/* Bonus-Malus Slider */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <label className="text-slate-400">Bonus-Malus Dərəcəsi (İSB)</label>
                      <span className={`font-bold px-2 py-0.5 rounded text-[11px] border ${bmBadge.badgeClass}`}>
                        {bmBadge.label} • {bmBadge.discountPercentage}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={20}
                      step={1}
                      value={bonusMalusClass}
                      onChange={(e) => setBonusMalusClass(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span className="text-rose-400">BM 1 (+145%)</span>
                      <span className="text-blue-400">BM 10 (Standart)</span>
                      <span className="text-emerald-400">BM 20 (-50%)</span>
                    </div>
                  </div>

                  {/* Registration Region */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Qeydiyyat Zonası</label>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {[
                        { id: 'baku_sumgayit_absheron', label: 'Bakı / Abşeron', factor: '1.10x' },
                        { id: 'ganja_nakhchivan', label: 'Gəncə / Naxçıvan', factor: '1.00x' },
                        { id: 'regions', label: 'Digər Regionlar', factor: '0.95x' }
                      ].map((reg) => (
                        <button
                          key={reg.id}
                          type="button"
                          onClick={() => setRegion(reg.id as RegistrationRegion)}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            region === reg.id
                              ? 'bg-sky-600/20 border-sky-500 text-white font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div>{reg.label}</div>
                          <span className="text-[10px] text-slate-500">{reg.factor}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Driver Age & Experience */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <label className="text-slate-400">Sürücü Yaşı</label>
                        <strong className="text-white">{driverAge} yaş</strong>
                      </div>
                      <input
                        type="range"
                        min={18}
                        max={75}
                        value={driverAge}
                        onChange={(e) => setDriverAge(Number(e.target.value))}
                        className="w-full accent-sky-500"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <label className="text-slate-400">Sürücülük Stajı</label>
                        <strong className="text-white">{drivingExperienceYears} il</strong>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={50}
                        value={drivingExperienceYears}
                        onChange={(e) => setDrivingExperienceYears(Number(e.target.value))}
                        className="w-full accent-sky-500"
                      />
                    </div>
                  </div>

                  {/* KASKO Add-ons */}
                  <div className="pt-2">
                    <label className="block text-xs text-slate-400 mb-2">Könüllü KASKO Əlavələri</label>
                    <div className="space-y-2">
                      {(Object.keys(KASKO_ADDON_DEFINITIONS) as KaskoAddonKey[]).map((key) => {
                        const addon = KASKO_ADDON_DEFINITIONS[key];
                        const isChecked = !!addons[key];
                        return (
                          <label
                            key={key}
                            className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-sky-950/30 border-sky-500/50 text-white'
                                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleAddon(key)}
                              className="mt-0.5 rounded border-slate-700 text-sky-600 focus:ring-sky-500 accent-sky-500"
                            />
                            <div className="flex-1 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-200">{addon.nameAz}</span>
                                <span className="text-sky-400 font-bold">+{addon.costAzn} AZN</span>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5">{addon.descriptionAz}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Callout & Quick Action */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-900/30 to-indigo-900/30 border border-sky-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    <span>Onlayn Rəsmiləşdirməyə Hazırsınız?</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Seçilmiş şərtlərlə rəsmi elektron sığorta müqaviləsini cəmi 2 dəqiqəyə əldə edin.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('kasko')}
                    className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
                  >
                    Şirkətləri Müqayisə Et
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('policy')}
                    className="py-2.5 px-5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-lg shadow-sky-600/30 flex items-center gap-2"
                  >
                    <span>Polisi Rəsmiləşdir</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPULSORY INSURANCE FORMULA */}
          {activeTab === 'compulsory' && (
            <div className="space-y-6" data-testid="tab-compulsory-content">
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold text-white text-base">İcbari Sığorta Qanuni Tarif Formulu</h3>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    Qanunla Məcburi
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Azərbaycan Respublikasının Qanunvericiliyinə və Mərkəzi Bankın (AMB) təsdiqlədiyi vahid aktuar qaydalara əsasən,
                  icbari avtomobil sığortası haqqı bu formul üzrə hesablanır:
                </p>

                {/* Mathematical Formula Banner */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center font-mono text-sm sm:text-base text-sky-400">
                  İllik Haqq = Baza Tarifi × BM Əmsalı × Region Əmsalı × Sürücü Əmsalı
                </div>

                {/* Formula Breakdown Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 block mb-1">1. Baza Tarifi</span>
                    <div className="text-lg font-bold text-white">
                      {comparison.compulsory.baseTariffAzn} AZN
                    </div>
                    <span className="text-[10px] text-slate-500">{comparison.compulsory.engineFactorDescription}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 block mb-1">2. Bonus-Malus Əmsalı</span>
                    <div className="text-lg font-bold text-emerald-400">
                      {comparison.compulsory.bonusMalusFactor}x
                    </div>
                    <span className="text-[10px] text-slate-500">Sinif: BM {comparison.compulsory.bonusMalusClass}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 block mb-1">3. Region Əmsalı</span>
                    <div className="text-lg font-bold text-sky-400">
                      {comparison.compulsory.regionFactor}x
                    </div>
                    <span className="text-[10px] text-slate-500">Qeydiyyat zonası</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 block mb-1">4. Sürücü Əmsalı</span>
                    <div className="text-lg font-bold text-purple-400">
                      {comparison.compulsory.driverFactor}x
                    </div>
                    <span className="text-[10px] text-slate-500">Yaş və təcrübə</span>
                  </div>
                </div>

                {/* Final Compulsory Total */}
                <div className="p-4 rounded-xl bg-sky-950/20 border border-sky-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-sky-400 block font-semibold">Yekun İllik İcbari Sığorta Haqqı:</span>
                    <span className="text-2xl font-black text-white">
                      {comparison.compulsory.finalCompulsoryPremiumAzn} AZN
                    </span>
                  </div>
                  {comparison.compulsory.isBonusDiscount && comparison.compulsory.bonusMalusDiscountAzn > 0 && (
                    <div className="text-right">
                      <span className="text-xs text-emerald-400 block font-bold">
                        Güzəşt qənaətiniz: {comparison.compulsory.bonusMalusDiscountAzn} AZN
                      </span>
                      <span className="text-[10px] text-slate-400">BM 10 standartına nisbətən</span>
                    </div>
                  )}
                </div>

                {/* Legal Limits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Əmlaka Dəyən Zərər Limiti</span>
                    </h4>
                    <p className="text-xl font-black text-white">5 000 AZN</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Qəza törədildikdə zərərçəkən tərəfin avtomobil və əmlakının təmiri üçün dövlət təminatı.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Sağlamlığa Dəyən Zərər Limiti</span>
                    </h4>
                    <p className="text-xl font-black text-white">50 000 AZN</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Zərərçəkmiş şəxslərin müalicə və kompensasiya xərcləri üzrə maksimum qanuni təminat.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bonus-Malus Regulatory Table Preview */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-sm">Bonus-Malus 20-Pilləli Rəsmi Reytinq Cədvəli</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs max-h-64 overflow-y-auto pr-1">
                  {BONUS_MALUS_TABLE.map((item) => (
                    <div
                      key={item.classNumber}
                      onClick={() => setBonusMalusClass(item.classNumber)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        bonusMalusClass === item.classNumber
                          ? 'border-emerald-500 bg-emerald-950/30 text-white shadow-md'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold mb-0.5">
                        <span className="text-white">BM {item.classNumber}</span>
                        <span className={item.category === 'discount' ? 'text-emerald-400' : item.category === 'surcharge' ? 'text-rose-400' : 'text-blue-400'}>
                          {item.percentageLabel}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{item.descriptionAz}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KASKO COMPANY COMPARISON */}
          {activeTab === 'kasko' && (
            <div className="space-y-6" data-testid="tab-kasko-content">
              {/* Tier selector */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-base font-bold text-white">5 Aparıcı Sığorta Şirkətinin KASKO Təklifləri</h3>
                  <p className="text-xs text-slate-400">Şirkətlərin tarifləri, reytinqləri və daxil olan üstünlüklər</p>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                  {[
                    { id: 'eco', label: 'Eko / Mini-KASKO' },
                    { id: 'standard', label: 'Standart KASKO' },
                    { id: 'vip', label: 'VIP / Tam KASKO' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTier(t.id as KaskoPackageTier)}
                      className={`py-1.5 px-3 rounded-lg font-bold transition-all ${
                        selectedTier === t.id
                          ? 'bg-sky-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Company Cards Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {comparison.kaskoQuotes.map((quote) => {
                  const company = AZERBAIJAN_INSURANCE_COMPANIES.find(c => c.id === quote.companyId)!;
                  const isSelected = selectedCompanyId === quote.companyId;

                  return (
                    <div
                      key={quote.companyId}
                      className={`relative rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                        isSelected
                          ? 'bg-slate-900 border-sky-500 shadow-xl shadow-sky-500/10 ring-2 ring-sky-500/20'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Top company badge */}
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-white text-base">{company.name}</h4>
                            <span className="text-[10px] text-slate-400 block">{company.taglineAz}</span>
                          </div>
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full border text-white"
                            style={{ backgroundColor: `${company.logoAccentColor}33`, borderColor: company.logoAccentColor }}
                          >
                            Bazar Payı: {company.marketShare}%
                          </span>
                        </div>

                        {/* Ratings & Speed strip */}
                        <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center text-[10px] mb-4">
                          <div>
                            <span className="text-slate-500 block">Ödəniş Sürəti</span>
                            <strong className="text-emerald-400">{company.claimSettlementSpeedDays} gün</strong>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Razılıq Faizi</span>
                            <strong className="text-sky-400">{company.claimSatisfactionRate}%</strong>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Reytinq</span>
                            <strong className="text-amber-400">★ {company.customerRating}</strong>
                          </div>
                        </div>

                        {/* Price Display */}
                        <div className="mb-4">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-white">
                              {formatPrice(quote.annualPremiumAzn, currency)}
                            </span>
                            <span className="text-xs text-slate-400">/ il</span>
                          </div>
                          <p className="text-xs text-sky-400 font-semibold mt-0.5">
                            və ya 12 ay faizsiz <strong>{formatPrice(quote.monthlyInstallmentAzn, currency)} / ay</strong>
                          </p>
                        </div>

                        {/* Included Features List */}
                        <div className="space-y-1.5 mb-5 text-xs text-slate-300">
                          {company.perksAz.slice(0, 3).map((perk, i) => (
                            <div key={i} className="flex items-start gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                              <span className="text-[11px] text-slate-300 leading-tight">{perk}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Select & Apply Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCompanyId(quote.companyId);
                          setActiveTab('policy');
                        }}
                        className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                        }`}
                      >
                        <span>{isSelected ? 'Seçildi • Polisi Rəsmiləşdir' : 'Bu Şirkəti Seç'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: ACCIDENT STEPS & FAQS */}
          {activeTab === 'guide' && (
            <div className="space-y-6" data-testid="tab-guide-content">
              {/* Emergency Checklist */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-sky-400" />
                  <h3 className="font-bold text-white text-base">Yol-Nəqliyyat Hadisəsi Zamanı Təcili Addımlar</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    {
                      step: '1',
                      title: 'Avtomobili tərpətməyin',
                      desc: 'Qəza işıqlarını yandırın və qəza dayanma nişanını quraşdırın. Hadisə yerini dəyişmək sığorta imtinasına səbəb ola bilər.'
                    },
                    {
                      step: '2',
                      title: '102 & Sığortaya zəng edin',
                      desc: 'Dərhal DİN "102" xidmətinə və sığorta şirkətinizin 24/7 qaynar xəttinə zəng edərək hadisəni qeydiyyata aldırın.'
                    },
                    {
                      step: '3',
                      title: 'Foto & Video çəkin',
                      desc: 'Hər iki avtomobilin nömrələrini, zərbə yerlərini və ətraf yol mənzərəsini müxtəlif bucaqlardan aydın çəkin.'
                    },
                    {
                      step: '4',
                      title: 'Sənədləşməni tamamlayın',
                      desc: 'DYP Forma 4 arayışını və ya 1000 AZN-dək sadələşdirilmiş Razılaşma Protokolunu (Avroprotokol) tərtib edin.'
                    }
                  ].map((item) => (
                    <div key={item.step} className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="w-7 h-7 rounded-lg bg-sky-600 text-white font-black flex items-center justify-center text-xs mb-2">
                        {item.step}
                      </div>
                      <h4 className="font-bold text-white text-xs mb-1">{item.title}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQs Accordion */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <h3 className="font-bold text-white text-base">Ən Çox Verilən Suallar (FAQ)</h3>
                <div className="space-y-3">
                  {INSURANCE_FAQS.map((faq) => (
                    <div key={faq.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                      <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-sky-400 flex-shrink-0" />
                        <span>{lang === 'en' ? faq.questionEn : lang === 'ru' ? faq.questionRu : faq.questionAz}</span>
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed pl-6 whitespace-pre-line">
                        {lang === 'en' ? faq.answerEn : lang === 'ru' ? faq.answerRu : faq.answerAz}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: E-POLICY APPLICATION & CERTIFICATE */}
          {activeTab === 'policy' && (
            <div className="space-y-6" data-testid="tab-policy-content">
              {!issuedCertificate ? (
                /* Application Form */
                <form onSubmit={handleApplyPolicy} className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-white">Rəsmi Elektron Sığorta Müraciəti</h3>
                    <p className="text-xs text-slate-400">
                      Məlumatlarınızı daxil edin və SİMA Rəqəmsal İmza ilə dərhal təsdiqləyin
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Ad, Soyad və Ata Adı</label>
                      <input
                        type="text"
                        value={ownerFullName}
                        onChange={(e) => setOwnerFullName(e.target.value)}
                        placeholder="Məs: Nurlan Əliyev"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">FİN Kod (Şəxsiyyət vəsiqəsi)</label>
                      <input
                        type="text"
                        value={ownerFin}
                        onChange={(e) => setOwnerFin(e.target.value.toUpperCase())}
                        maxLength={7}
                        placeholder="Məs: 5KT89LM"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Əlaqə Telefonu</label>
                      <input
                        type="tel"
                        value={ownerPhone}
                        onChange={(e) => setOwnerPhone(e.target.value)}
                        placeholder="+994 50 123 45 67"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">Dövlət Qeydiyyat Nişanı</label>
                      <input
                        type="text"
                        value={plateNumber}
                        onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                        placeholder="Məs: 10-AA-555"
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  {/* Coverage Selection Checkboxes */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <span className="text-xs font-bold text-white block">Sığorta Təminatı Paketi:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={includeCompulsory}
                          onChange={(e) => setIncludeCompulsory(e.target.checked)}
                          className="rounded border-slate-700 text-sky-600 focus:ring-sky-500"
                        />
                        <span>İcbari Sığorta (+{comparison.compulsory.finalCompulsoryPremiumAzn} AZN)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={includeKasko}
                          onChange={(e) => setIncludeKasko(e.target.checked)}
                          className="rounded border-slate-700 text-sky-600 focus:ring-sky-500"
                        />
                        <span>{activeQuote.companyName} KASKO (+{activeQuote.annualPremiumAzn} AZN)</span>
                      </label>
                    </div>
                  </div>

                  {/* Payment Plan */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400 block">Ödəniş Planı:</span>
                      <strong className="text-white">
                        {paymentPlan === 'monthly_12' ? '12 Ay Faizsiz Taksit (BirBank / TamKart)' : 'Birdəfəlik İllik Ödəniş'}
                      </strong>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentPlan('annual')}
                        className={`py-1.5 px-3 rounded-lg font-bold transition-all ${
                          paymentPlan === 'annual'
                            ? 'bg-sky-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        İllik
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentPlan('monthly_12')}
                        className={`py-1.5 px-3 rounded-lg font-bold transition-all ${
                          paymentPlan === 'monthly_12'
                            ? 'bg-sky-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        12 Ay Taksit
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    data-testid="submit-insurance-application-btn"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    <span>SİMA Rəqəmsal İmza ilə Təsdiqlə və Polisi Əldə Et</span>
                  </button>
                </form>
              ) : (
                /* Issued Digital Certificate View */
                <div className="space-y-4" data-testid="issued-certificate-view">
                  <div className="p-6 rounded-3xl bg-slate-950 border-2 border-sky-500/40 space-y-6 relative overflow-hidden shadow-2xl">
                    {/* Official Certificate Watermark */}
                    <div className="absolute right-4 top-4 opacity-10 pointer-events-none">
                      <ShieldCheck className="w-48 h-48 text-sky-400" />
                    </div>

                    {/* Certificate Top Header */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-sky-400">
                          Azərbaycan Respublikası • Elektron Sığorta Reyestri
                        </span>
                        <h3 className="text-xl font-black text-white mt-0.5">
                          RƏSMİ ELEKTRON SIĞORTA ŞƏHADƏTNAMƏSİ
                        </h3>
                        <p className="text-xs text-slate-400">
                          {issuedCertificate.insuranceCompanyName} tərəfindən təsdiq edilmişdir
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          STATUS: QÜVVƏDƏDİR
                        </span>
                        <p className="text-[11px] font-mono text-slate-400 mt-1">
                          Polis: {issuedCertificate.policyNumber}
                        </p>
                      </div>
                    </div>

                    {/* Certificate Info Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block mb-0.5">Sığortalı (Sahib):</span>
                        <strong className="text-white text-sm">{issuedCertificate.holderName}</strong>
                        <p className="font-mono text-slate-400 text-[11px]">FİN: {issuedCertificate.finCode}</p>
                      </div>

                      <div>
                        <span className="text-slate-400 block mb-0.5">Nəqliyyat Vasitəsi:</span>
                        <strong className="text-white text-sm">{issuedCertificate.vehicleTitle}</strong>
                        <p className="font-mono text-slate-400 text-[11px]">Nömrə: {issuedCertificate.plateNumber}</p>
                      </div>

                      <div>
                        <span className="text-slate-400 block mb-0.5">VIN Şassi Kodu:</span>
                        <strong className="text-white font-mono text-xs">{issuedCertificate.vin}</strong>
                      </div>

                      <div>
                        <span className="text-slate-400 block mb-0.5">Verilmə Tarixi:</span>
                        <strong className="text-white">{issuedCertificate.issueDate}</strong>
                      </div>

                      <div>
                        <span className="text-slate-400 block mb-0.5">Bitmə Tarixi:</span>
                        <strong className="text-emerald-400">{issuedCertificate.validUntil}</strong>
                      </div>

                      <div>
                        <span className="text-slate-400 block mb-0.5">Cəmi Sığorta Haqqı:</span>
                        <strong className="text-white text-base">
                          {issuedCertificate.totalAnnualPremiumAzn} AZN
                        </strong>
                        {issuedCertificate.monthlyPaymentAzn && (
                          <span className="text-[10px] text-sky-400 block">
                            (12 ay × {issuedCertificate.monthlyPaymentAzn} AZN)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Policy breakdown chips */}
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                      {issuedCertificate.icbariPolicyNumber && (
                        <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                          <span className="text-slate-300">İcbari Avto Məsuliyyət Sığortası (İSB):</span>
                          <span className="font-mono text-sky-400 font-bold">{issuedCertificate.icbariPolicyNumber}</span>
                        </div>
                      )}
                      {issuedCertificate.kaskoPolicyNumber && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Könüllü KASKO Sığortası:</span>
                          <span className="font-mono text-emerald-400 font-bold">{issuedCertificate.kaskoPolicyNumber}</span>
                        </div>
                      )}
                    </div>

                    {/* Digital Seal */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-800 text-xs text-slate-400">
                      <div>
                        <span className="block font-semibold text-slate-300">SİMA Rəqəmsal İmza Şifrəsi:</span>
                        <span className="font-mono text-[11px] text-sky-400">{issuedCertificate.digitalSignatureId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span>Mərkəzi Bank & İSB İnformasiya Sistemində Təsdiqlənmişdir</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for Certificate */}
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setIssuedCertificate(null)}
                      className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all"
                    >
                      Yeni Müraciət Tərtib Et
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyCertificate}
                        data-testid="copy-insurance-cert-btn"
                        className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        <span>{isCopied ? 'Kopyalandı!' : 'Məlumatı Kopyala'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handlePrint}
                        data-testid="print-insurance-cert-btn"
                        className="py-2.5 px-5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Çap Et / PDF Saxla</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

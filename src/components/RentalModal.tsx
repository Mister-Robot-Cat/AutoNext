import React, { useState, useMemo } from 'react';
import {
  Car,
  KeyRound,
  ShieldCheck,
  Calendar,
  MapPin,
  Clock,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Copy,
  Printer,
  Search,
  Fuel,
  UserCheck,
  Baby,
  Wifi,
  Globe,
  Building2,
  Sparkles,
  X,
  Phone,
  ArrowRight,
  Gauge,
  Sliders,
  FileText,
  BadgeCheck
} from 'lucide-react';
import { Vehicle, Currency } from '../types/vehicle';
import {
  RentalFleetVehicle,
  RentalStation,
  RentalCompany,
  RentalInsuranceTier,
  RENTAL_FLEET_VEHICLES,
  RENTAL_STATIONS,
  RENTAL_COMPANIES,
  RENTAL_INSURANCE_TIERS,
  RENTAL_ADDONS,
  MOCK_ACTIVE_RENTAL_CONTRACTS
} from '../data/mockRentalData';
import {
  RentalCalculationParams,
  RentalCalculationResult,
  RentalContract,
  RentalDriverInfo,
  calculateRentalPrice,
  createRentalContract,
  verifyRentalContractNumber
} from '../utils/vehicleRental';

export interface RentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: Currency;
  initialVehicle?: Vehicle | null;
}

type TabType = 'calculator' | 'eligibility' | 'stations' | 'contract';

export const RentalModal: React.FC<RentalModalProps> = ({
  isOpen,
  onClose,
  currency = 'AZN',
  initialVehicle
}) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<TabType>('calculator');

  // Calculator State
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(() => {
    if (initialVehicle) {
      const match = RENTAL_FLEET_VEHICLES.find(
        (v) => v.make.toLowerCase() === initialVehicle.make.toLowerCase() ||
               v.model.toLowerCase().includes(initialVehicle.model.toLowerCase())
      );
      if (match) return match.id;
    }
    return RENTAL_FLEET_VEHICLES[0].id;
  });

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [durationDays, setDurationDays] = useState<number>(3);
  const [pickupStationId, setPickupStationId] = useState<string>(RENTAL_STATIONS[0].id);
  const [dropoffStationId, setDropoffStationId] = useState<string>(RENTAL_STATIONS[0].id);
  const [mileageOption, setMileageOption] = useState<'standard' | 'unlimited'>('standard');
  const [insuranceTierId, setInsuranceTierId] = useState<'basic' | 'medium' | 'premium'>('medium');
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>(['addon-wifi-gps']);

  // Driver Eligibility State
  const [driverAge, setDriverAge] = useState<number>(26);
  const [drivingExperienceYears, setDrivingExperienceYears] = useState<number>(4);
  const [isForeigner, setIsForeigner] = useState<boolean>(false);

  // Driver details for contract creation
  const [driverFullName, setDriverFullName] = useState<string>('Kamran Məmmədov');
  const [driverFin, setDriverFin] = useState<string>('5K88910');
  const [driverLicenseNumber, setDriverLicenseNumber] = useState<string>('AZ-883391');
  const [driverPhone, setDriverPhone] = useState<string>('+994 50 234 56 78');
  const [driverEmail, setDriverEmail] = useState<string>('kamran.m@example.az');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(RENTAL_COMPANIES[0].id);

  // Generated Contract state
  const [generatedContract, setGeneratedContract] = useState<RentalContract | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Search & Filter State
  const [stationSearch, setStationSearch] = useState<string>('');
  const [searchContractNumber, setSearchContractNumber] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<{
    searched: boolean;
    valid?: boolean;
    error?: string;
    contract?: any;
  }>({ searched: false });

  // Calculation Result
  const calculationParams: RentalCalculationParams = useMemo(() => ({
    vehicleId: selectedVehicleId,
    durationDays,
    pickupStationId,
    dropoffStationId,
    mileageOption,
    insuranceTierId,
    selectedAddonIds,
    driverAge,
    drivingExperienceYears,
    isForeigner,
    currency
  }), [
    selectedVehicleId,
    durationDays,
    pickupStationId,
    dropoffStationId,
    mileageOption,
    insuranceTierId,
    selectedAddonIds,
    driverAge,
    drivingExperienceYears,
    isForeigner,
    currency
  ]);

  const result: RentalCalculationResult = useMemo(() => {
    return calculateRentalPrice(calculationParams);
  }, [calculationParams]);

  // Filtered vehicles for the fleet catalog
  const filteredVehicles = useMemo(() => {
    if (categoryFilter === 'all') return RENTAL_FLEET_VEHICLES;
    return RENTAL_FLEET_VEHICLES.filter((v) => v.category === categoryFilter);
  }, [categoryFilter]);

  // Filtered stations
  const filteredStations = useMemo(() => {
    if (!stationSearch.trim()) return RENTAL_STATIONS;
    const q = stationSearch.toLowerCase();
    return RENTAL_STATIONS.filter(
      (s) => s.nameAz.toLowerCase().includes(q) || s.city.toLowerCase().includes(q) || s.address.toLowerCase().includes(q)
    );
  }, [stationSearch]);

  const toggleAddon = (id: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleGenerateContract = () => {
    const driverInfo: RentalDriverInfo = {
      fullName: driverFullName,
      finCode: driverFin,
      driverLicenseNumber,
      documentType: isForeigner ? 'passport' : 'id_card',
      phone: driverPhone,
      email: driverEmail,
      country: isForeigner ? 'Xarici Ölkə' : 'Azərbaycan'
    };

    const contract = createRentalContract(calculationParams, driverInfo, selectedCompanyId);
    setGeneratedContract(contract);
    setActiveTab('contract');
  };

  const handleVerifySearch = () => {
    if (!searchContractNumber.trim()) return;
    const res = verifyRentalContractNumber(searchContractNumber);
    setVerificationResult({
      searched: true,
      valid: res.valid,
      error: res.error,
      contract: res.contract
    });
  };

  const handleCopyContract = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl my-6 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm ring-1 ring-white/20">
              <KeyRound className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight">Rəsmi Avtomobil İcarəsi və Rent-a-Car Portalı</h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-amber-400 text-slate-900 rounded-full">
                  ACRA / BDYP
                </span>
              </div>
              <p className="text-xs text-blue-100">
                AR Mülki Məcəllə Maddə 700–710 | Təhlükəsizlik Depoziti Escrow | Hava Limanı & Şəhər Təhvili
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            aria-label="Bağla"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-6 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'calculator'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>İcarə Kalkulyatoru & Park</span>
          </button>

          <button
            onClick={() => setActiveTab('eligibility')}
            className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'eligibility'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Sürücü Şərtləri & Qaydalar</span>
          </button>

          <button
            onClick={() => setActiveTab('stations')}
            className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'stations'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Təhvil Məntəqələri & Radar</span>
          </button>

          <button
            onClick={() => setActiveTab('contract')}
            className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'contract'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Rəsmi E-Müqavilə (CAR-RNT)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: CALCULATOR & FLEET */}
          {activeTab === 'calculator' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Fleet Selection & Options */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Category filters */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Avtomobil Kateqoriyası
                    </label>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      {filteredVehicles.length} model mövcuddur
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'all', label: 'Hamısı' },
                      { id: 'economy', label: 'Ekonom' },
                      { id: 'compact', label: 'Komfort' },
                      { id: 'crossover', label: 'Krossover' },
                      { id: 'business', label: 'Biznes' },
                      { id: 'suv_premium', label: 'Premium SUV' },
                      { id: 'luxury', label: 'Lüks VIP' },
                      { id: 'electric', label: 'Elektrik' },
                      { id: 'minivan', label: 'Minivan' }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setCategoryFilter(cat.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          categoryFilter === cat.id
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vehicle Selection Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                  {filteredVehicles.map((veh) => {
                    const isSelected = veh.id === selectedVehicleId;
                    return (
                      <div
                        key={veh.id}
                        onClick={() => setSelectedVehicleId(veh.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-sm">{veh.make} {veh.model}</h4>
                            <p className="text-xs text-slate-500">{veh.year} • {veh.engine} • {veh.transmission}</p>
                          </div>
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                            {veh.dailyRateAzn} ₼/gün
                          </span>
                        </div>
                        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800/80 pt-2">
                          <span>Depozit: <strong className="text-slate-700 dark:text-slate-300">{veh.securityDepositAzn} ₼</strong></span>
                          <span>Min yaş: <strong className="text-slate-700 dark:text-slate-300">{veh.minAge}+</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Duration Slider */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span>İcarə Müddəti (Gün):</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {durationDays} gün
                      </span>
                      {result.discountPercentage > 0 && (
                        <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full">
                          -{result.discountPercentage}% endirim
                        </span>
                      )}
                    </div>
                  </div>

                  <input
                    type="range"
                    min={1}
                    max={30}
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />

                  <div className="flex justify-between text-xs text-slate-500">
                    <span>1 gün (0%)</span>
                    <span>4-7 gün (-10%)</span>
                    <span>8-14 gün (-18%)</span>
                    <span>15-30 gün (-25%)</span>
                  </div>
                </div>

                {/* Station Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Təhvil Alma Məntəqəsi
                    </label>
                    <select
                      value={pickupStationId}
                      onChange={(e) => setPickupStationId(e.target.value)}
                      className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {RENTAL_STATIONS.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.nameAz} {st.airportSurchargeAzn > 0 ? `(+${st.airportSurchargeAzn} ₼)` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Qaytarılma Məntəqəsi
                    </label>
                    <select
                      value={dropoffStationId}
                      onChange={(e) => setDropoffStationId(e.target.value)}
                      className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {RENTAL_STATIONS.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.nameAz}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Mileage Option */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Yürüş Rejimi (Kilometraj)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setMileageOption('standard')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        mileageOption === 'standard'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="font-semibold text-xs">Standart Rejim</div>
                      <div className="text-xs text-slate-500 mt-0.5">250 km/gün daxildir</div>
                      <div className="text-xs font-bold text-emerald-600 mt-1">Ödənişsiz</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMileageOption('unlimited')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        mileageOption === 'unlimited'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="font-semibold text-xs">Limitsiz Yürüş</div>
                      <div className="text-xs text-slate-500 mt-0.5">Məsafə məhdudiyyətsiz</div>
                      <div className="text-xs font-bold text-blue-600 mt-1">+20 ₼ / gün</div>
                    </button>
                  </div>
                </div>

                {/* Insurance Tier Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Sığorta & Qoruma Paketi (CDW / Françiza)
                  </label>
                  <div className="space-y-2">
                    {RENTAL_INSURANCE_TIERS.map((tier) => {
                      const isSelected = tier.id === insuranceTierId;
                      return (
                        <div
                          key={tier.id}
                          onClick={() => setInsuranceTierId(tier.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 ring-1 ring-blue-500'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-xs">{tier.nameAz}</span>
                              {tier.id === 'premium' && (
                                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded">
                                  Tövsiyə olunur
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">{tier.descriptionAz}</p>
                            <div className="text-[11px] text-slate-400">
                              Məsuliyyət payı: <strong>{tier.deductibleAzn} ₼</strong>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                              {tier.dailyFeeAzn === 0 ? 'Daxildir' : `+${tier.dailyFeeAzn} ₼/gün`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Additional Add-ons */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Əlavə Avadanlıq və Xidmətlər
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {RENTAL_ADDONS.map((addon) => {
                      const isChecked = selectedAddonIds.includes(addon.id);
                      return (
                        <label
                          key={addon.id}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                            isChecked
                              ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-950/20'
                              : 'border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleAddon(addon.id)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <div>
                              <div className="text-xs font-semibold">{addon.nameAz}</div>
                              <div className="text-[10px] text-slate-500">
                                {addon.priceType === 'per_day' ? `${addon.priceAzn} ₼/gün` : `${addon.priceAzn} ₼ birdəfəlik`}
                              </div>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Right Column: Pricing Summary & Booking Card */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl border border-slate-700">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                    <div>
                      <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Seçilmiş Model</span>
                      <h3 className="text-lg font-bold">{result.vehicle.make} {result.vehicle.model}</h3>
                      <p className="text-xs text-slate-400">{result.vehicle.year} • {result.vehicle.plate} • {result.vehicle.fuelType}</p>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-bold bg-blue-500/20 text-blue-300 rounded-full border border-blue-400/30">
                      {result.durationDays} gün
                    </span>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="py-4 space-y-2 text-xs border-b border-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Baza icarə ({result.baseDailyRate} ₼ × {result.durationDays} gün):</span>
                      <span>{result.baseDailyRate * result.durationDays} ₼</span>
                    </div>

                    {result.durationDiscountAmount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Müddət endirimi (-{result.discountPercentage}%):</span>
                        <span>-{result.durationDiscountAmount} ₼</span>
                      </div>
                    )}

                    {result.mileageSurchargeTotal > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Limitsiz yürüş paketi:</span>
                        <span>+{result.mileageSurchargeTotal} ₼</span>
                      </div>
                    )}

                    {result.insuranceTotal > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">{result.insuranceTier.nameAz}:</span>
                        <span>+{result.insuranceTotal} ₼</span>
                      </div>
                    )}

                    {result.addonsTotal > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Əlavə xidmətlər ({result.addonsBreakdown.length}):</span>
                        <span>+{result.addonsTotal} ₼</span>
                      </div>
                    )}

                    {result.airportPickupFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Hava Limanı stend rüsumu:</span>
                        <span>+{result.airportPickupFee} ₼</span>
                      </div>
                    )}

                    {result.intercityOneWayFee > 0 && (
                      <div className="flex justify-between text-amber-400">
                        <span>Şəhərlərarası birtərəfli çatdırılma:</span>
                        <span>+{result.intercityOneWayFee} ₼</span>
                      </div>
                    )}

                    <div className="flex justify-between pt-2 border-t border-slate-700/60 font-medium">
                      <span className="text-slate-300">İcarə subtotalı:</span>
                      <span>{result.subtotalAzn} ₼</span>
                    </div>

                    <div className="flex justify-between text-slate-400">
                      <span>Dövlət ƏDV (18%):</span>
                      <span>{result.vatAmountAzn} ₼</span>
                    </div>
                  </div>

                  {/* Grand Total & Deposit */}
                  <div className="pt-4 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs uppercase tracking-wider text-slate-400">Yekun İcarə Məbləği:</span>
                      <div className="text-right">
                        <div className="text-2xl font-black text-amber-400">{result.formattedGrandTotal}</div>
                        <div className="text-[11px] text-slate-400">
                          {currency !== 'AZN' && `(${result.grandTotalAzn} AZN) • `}
                          ${result.currencyRates.usd} / €{result.currencyRates.eur}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400 block">Təhlükəsizlik Depoziti (Bloklanma):</span>
                        <span className="text-[10px] text-slate-500">14 gün sonra karta geri qayıdır</span>
                      </div>
                      <span className="text-base font-bold text-sky-300">{result.formattedDeposit}</span>
                    </div>

                    {/* Eligibility Warning or Check */}
                    {!result.eligibility.isEligible ? (
                      <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold block">Sürücü tələblərə cavab vermir:</span>
                          <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-[11px]">
                            {result.eligibility.warnings.map((w, idx) => (
                              <li key={idx}>{w}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>Sürücü yaş və staj kriteriyalarına tam uyğundur!</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setActiveTab('contract')}
                      className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-semibold text-sm rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2"
                    >
                      <span>Rəsmi E-Müqavilə Tərtib Et</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Quick Info Box */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs space-y-2">
                  <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Dövlət İcarə Standartları Zəmanəti</span>
                  </div>
                  <p className="text-slate-500 leading-relaxed text-[11px]">
                    İcarə müqaviləsi AR Mülki Məcəlləsinin 700-cü maddəsinə uyğun elektron qaydada təsdiqlənir. Bütün avtomobillər tam texniki baxışdan keçib və icbari sığortalanıb.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ELIGIBILITY & LEGAL REGULATIONS */}
          {activeTab === 'eligibility' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50">
                <h3 className="text-base font-bold text-blue-900 dark:text-blue-300 flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  <span>Sürücülük Uyğunluq Auditoru & Şəxsi Parametrlər</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Avtomobil icarəsi üçün tələb olunan minimum yaş, sürücülük stajı və vətəndaşlıq statusunu yoxlayın.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5">
                  {/* Driver Age */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Sürücünün Yaşı:</span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">{driverAge} yaş</span>
                    </div>
                    <input
                      type="range"
                      min={18}
                      max={75}
                      value={driverAge}
                      onChange={(e) => setDriverAge(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <div className="text-[11px] text-slate-500">
                      Standart minimum: 21 yaş (Lüks və böyük SUV: 24–25 yaş)
                    </div>
                  </div>

                  {/* Driving Experience */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Sürücülük Təcrübəsi (Staj):</span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">{drivingExperienceYears} il</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={40}
                      value={drivingExperienceYears}
                      onChange={(e) => setDrivingExperienceYears(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <div className="text-[11px] text-slate-500">
                      Tələb olunan minimum staj: 1–2 il (vəsiqə verilmə tarixindən)
                    </div>
                  </div>

                  {/* Foreigner Switch */}
                  <div className="flex flex-col justify-center space-y-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Vətəndaşlıq Statusu
                    </label>
                    <label className="flex items-center space-x-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isForeigner}
                        onChange={(e) => setIsForeigner(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-xs">Əcnəbi Vətəndaş / Xarici Turist</span>
                    </label>
                    <div className="text-[11px] text-slate-500">
                      {isForeigner ? 'Xarici pasport və beynəlxalq vəsiqə (IDP) tələb olunur.' : 'AR şəxsiyyət vəsiqəsi və sürücülük vəsiqəsi kifayətdir.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Legal Clauses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                  <div className="flex items-center space-x-2 text-blue-600">
                    <CreditCard className="w-4 h-4" />
                    <h4 className="font-semibold text-xs">Françiza və Depozitin Qaytarılma Mexanizmi</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    İcarə zamanı bloklanan təhlükəsizlik depoziti avtomobil salamat qaytarıldıqdan sonra 14–21 iş günü ərzində tam sərbəst buraxılır. Bu müddət BDYP MMX foto-radar sistemində gecikmiş protokolların olub-olmamasını dəqiqləşdirmək üçün qanunla nəzərdə tutulur.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                  <div className="flex items-center space-x-2 text-amber-600">
                    <Fuel className="w-4 h-4" />
                    <h4 className="font-semibold text-xs">Full-to-Full Yanacaq Siyasəti</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Bütün avtomobillər 100% dolu yanacaq çəni ilə təhvil verilir və eyni qaydada dolu çənlə geri qaytarılmalıdır. Əskik yanacaq olduqda Tarif Şurasının rəsmi tarifinə əlavə olaraq yanacaqdoldurma xidmət haqqı (+2.00 ₼/litr) hesablanır.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                  <div className="flex items-center space-x-2 text-indigo-600">
                    <Globe className="w-4 h-4" />
                    <h4 className="font-semibold text-xs">Ölkədən Çıxış və Sərhəd Keçidi (Gürcüstan)</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    İcarə avtomobili ilə Gürcüstana və ya digər qonşu ölkələrə səfər etmək üçün şirkət tərəfindən ASAN Notariatda rəsmi xarici çıxış etibarnaməsi və Yaşıl Kart (Green Card) tərtib edilməlidir (birdəfəlik 150 ₼).
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-600">
                    <BadgeCheck className="w-4 h-4" />
                    <h4 className="font-semibold text-xs">AR Mülki Məcəlləsi Maddə 700–710</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Nəqliyyat vasitəsinin icarəsi müqaviləsi üzrə icarədar saz vəziyyətdə nəqliyyat vasitəsini icarəçiyə təqdim etməyə, icarəçi isə icarə haqqını vaxtında ödəməyə və yol hərəkəti qaydalarına riayət etməyə borcludur.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STATIONS & RADAR */}
          {activeTab === 'stations' && (
            <div className="space-y-6">
              {/* Station Search */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Məntəqə və ya şəhər axtarın (məs. Hava Limanı, Port Baku, Gəncə)..."
                    value={stationSearch}
                    onChange={(e) => setStationSearch(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Station Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredStations.map((st) => (
                  <div
                    key={st.id}
                    className={`p-4 rounded-xl border transition-all ${
                      st.id === pickupStationId
                        ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-950/20 ring-1 ring-blue-500'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-sm">{st.nameAz}</h4>
                          {st.is24Hours && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded">
                              24/7 Fasiləsiz
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{st.address}</p>
                      </div>
                      <span className="px-2 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 rounded-lg">
                        {st.city}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center space-x-2 text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{st.hours}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPickupStationId(st.id);
                          setActiveTab('calculator');
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        Təhvil Üçün Seç
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rental Companies Radar */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-sm font-bold flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Akkreditə Olunmuş Rəsmi İcarə Şirkətləri</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {RENTAL_COMPANIES.map((comp) => (
                    <div
                      key={comp.id}
                      onClick={() => setSelectedCompanyId(comp.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedCompanyId === comp.id
                          ? 'border-blue-600 bg-blue-50/20 dark:bg-blue-950/20 ring-1 ring-blue-500'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{comp.brand}</span>
                        <span className="text-xs text-amber-500 font-semibold">★ {comp.rating}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Park: {comp.fleetSize}+ avtomobil • Depozit: {comp.depositRefundDays} gün
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Qaynar xətt: {comp.emergencySupportPhone}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ELECTRONIC CONTRACT & VOUCHER */}
          {activeTab === 'contract' && (
            <div className="space-y-6">
              
              {/* Form & Actions */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>İcarəçi Məlumatları və Rəsmiləşdirmə</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-500 mb-1 font-medium">Sürücünün Tam Adı</label>
                    <input
                      type="text"
                      value={driverFullName}
                      onChange={(e) => setDriverFullName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1 font-medium">FİN Kod / Pasport №</label>
                    <input
                      type="text"
                      value={driverFin}
                      onChange={(e) => setDriverFin(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1 font-medium">Sürücülük Vəsiqəsi №</label>
                    <input
                      type="text"
                      value={driverLicenseNumber}
                      onChange={(e) => setDriverLicenseNumber(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1 font-medium">Əlaqə Telefonu</label>
                    <input
                      type="text"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1 font-medium">Elektron Poçt</label>
                    <input
                      type="email"
                      value={driverEmail}
                      onChange={(e) => setDriverEmail(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleGenerateContract}
                      className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Müqaviləni Yarat</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Official Rental Agreement Display */}
              {generatedContract && (
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-500 shadow-xl space-y-6">
                  {/* Voucher Header */}
                  <div className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-4 text-center sm:text-left">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xl">
                        ACRA
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white uppercase tracking-wider">
                          RƏSMİ ELEKTRON AVTOMOBİL İCARƏ MÜQAVİLƏSİ
                        </h3>
                        <p className="text-xs text-slate-500">
                          Azərbaycan Avtomobil İcarəçiləri Assosiasiyası (ACRA) & BDYP Vahid Reyestri
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-blue-600 dark:text-blue-400 font-mono">
                        № {generatedContract.contractNumber}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Tarix: {generatedContract.issueDate}
                      </div>
                    </div>
                  </div>

                  {/* Contract Body Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    {/* Vehicle & Station Info */}
                    <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-1.5 flex items-center justify-between">
                        <span>Nəqliyyat Vasitəsi & Şərtlər</span>
                        <span className="font-mono text-blue-600 dark:text-blue-400">{generatedContract.vehicle.plate}</span>
                      </h4>
                      <div className="space-y-1 text-slate-600 dark:text-slate-400">
                        <div>Model: <strong className="text-slate-800 dark:text-slate-200">{generatedContract.vehicle.make} {generatedContract.vehicle.model} ({generatedContract.vehicle.year})</strong></div>
                        <div>İcarəçi Şirkət: <strong className="text-slate-800 dark:text-slate-200">{generatedContract.company.name}</strong></div>
                        <div>Təhvil Alma: <strong className="text-slate-800 dark:text-slate-200">{generatedContract.pickupStation.nameAz}</strong></div>
                        <div>Təhvil Qaytarma: <strong className="text-slate-800 dark:text-slate-200">{generatedContract.dropoffStation.nameAz}</strong></div>
                        <div>Müddət: <strong className="text-slate-800 dark:text-slate-200">{generatedContract.durationDays} gün ({generatedContract.pickupDate} — {generatedContract.returnDate})</strong></div>
                        <div>Sığorta Paketi: <strong className="text-slate-800 dark:text-slate-200">{generatedContract.insuranceTier.nameAz}</strong></div>
                      </div>
                    </div>

                    {/* Driver & Financial Summary */}
                    <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-1.5 flex items-center justify-between">
                        <span>Sürücü & Maliyyə Təsviri</span>
                        <span className="text-emerald-600 font-semibold">Təsdiqləndi</span>
                      </h4>
                      <div className="space-y-1 text-slate-600 dark:text-slate-400">
                        <div>Sürücü: <strong className="text-slate-800 dark:text-slate-200">{generatedContract.driver.fullName}</strong></div>
                        <div>FİN / Pasport: <strong className="text-slate-800 dark:text-slate-200 font-mono">{generatedContract.driver.finCode}</strong></div>
                        <div>Sürücülük Vəsiqəsi: <strong className="text-slate-800 dark:text-slate-200 font-mono">{generatedContract.driver.driverLicenseNumber}</strong></div>
                        <div>Yekun İcarə Haqqı: <strong className="text-amber-500 font-bold">{generatedContract.financials.grandTotalAzn} AZN</strong> (ƏDV daxil)</div>
                        <div>Təhlükəsizlik Depoziti: <strong className="text-sky-500 font-bold">{generatedContract.financials.securityDepositAzn} AZN</strong></div>
                        <div>Təhlükəsizlik Haşı: <span className="font-mono text-[10px] text-slate-400">{generatedContract.securityHash.slice(0, 18)}...</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Copy & Print */}
                  <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleCopyContract(generatedContract.contractNumber)}
                      className="px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedCode ? 'Kopyalandı!' : 'Nömrəni Kopyala'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePrint}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 transition-colors shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Çap Et / PDF Yüklə</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Verification in Unified Registry */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                  <Search className="w-3.5 h-3.5 text-blue-600" />
                  <span>Vahid Dövlət Reyestrində Müqavilə Yoxlanışı</span>
                </h4>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Müqavilə nömrəsini daxil edin (məs. CAR-RNT-2026-8812)..."
                    value={searchContractNumber}
                    onChange={(e) => setSearchContractNumber(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleVerifySearch}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium transition-colors"
                  >
                    Yoxla
                  </button>
                </div>

                {verificationResult.searched && (
                  <div className={`p-3 rounded-xl text-xs ${
                    verificationResult.valid
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                  }`}>
                    {verificationResult.valid ? (
                      <div>
                        <div className="font-bold flex items-center space-x-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Müqavilə Reyestrdə Təsdiqləndi!</span>
                        </div>
                        <p className="mt-1 text-[11px]">
                          № {verificationResult.contract?.contractNumber} • Sürücü: {verificationResult.contract?.driverFullName} • Avtomobil: {verificationResult.contract?.vehicleName} ({verificationResult.contract?.vehiclePlate})
                        </p>
                      </div>
                    ) : (
                      <div className="font-medium flex items-center space-x-1.5">
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        <span>{verificationResult.error}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>ACRA Canlı İcarə Sistemi Aktivdir</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
          >
            Bağla
          </button>
        </div>

      </div>
    </div>
  );
};

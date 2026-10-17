import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Award,
  Baby,
  Check,
  CheckCircle2,
  Copy,
  FileCheck,
  Flame,
  HeartPulse,
  MapPin,
  PackageCheck,
  Phone,
  Search,
  ShieldAlert,
  ShieldCheck,
  Truck,
  Users,
  X,
} from 'lucide-react';
import { Currency, Vehicle } from '../types/vehicle';
import {
  ChildSeatingPosition,
  EmergencyRoadZone,
  ExtinguisherGaugeState,
  ExtinguisherType,
  PassengerSafetyCertificate,
  VehicleRegulatoryClass,
  auditCargoAndTowingRules,
  auditChildAndPassengerCompliance,
  auditEmergencySafetyKit,
  calculateSafetySupplyBundle,
  formatSafetyCurrency,
  generatePassengerSafetyCertificate,
  getVehicleDefaultSafetyProfile,
} from '../utils/passengerSafety';
import {
  EXTINGUISHER_OPTIONS,
  MINISTRY_FIRST_AID_ITEMS,
  SAFETY_SUPPLY_CENTERS,
  VEHICLE_REGULATORY_CLASSES,
  VERIFIED_SAFETY_CERTIFICATES,
  findSafetyCertificateByCode,
} from '../data/mockPassengerSafetyData';

interface PassengerSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: Vehicle | null;
  currency: Currency;
}

type ActiveTab = 'kit' | 'child' | 'cargo_centers' | 'certificate';

export const PassengerSafetyModal: React.FC<PassengerSafetyModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  currency,
}) => {
  const defaultProfile = useMemo(() => getVehicleDefaultSafetyProfile(vehicle), [vehicle]);

  const [activeTab, setActiveTab] = useState<ActiveTab>('kit');

  // Tab 1: Emergency Safety Kit (YHQ Annex 1 Section VII & Article 43)
  const [vehicleClass, setVehicleClass] = useState<VehicleRegulatoryClass>(
    defaultProfile.vehicleClass
  );
  const [extinguisherType, setExtinguisherType] = useState<ExtinguisherType>(
    defaultProfile.extinguisherType
  );
  const [extinguisherCount, setExtinguisherCount] = useState<number>(1);
  const [extinguisherGauge, setExtinguisherGauge] =
    useState<ExtinguisherGaugeState>('GREEN_NOMINAL');
  const [hasFirstAidKit, setHasFirstAidKit] = useState<boolean>(true);
  const [isFirstAidKitUnexpiredAndComplete, setIsFirstAidKitUnexpiredAndComplete] =
    useState<boolean>(true);
  const [hasWarningTriangleEceR27, setHasWarningTriangleEceR27] = useState<boolean>(true);
  const [roadZone, setRoadZone] = useState<EmergencyRoadZone>('POPULATED_CITY');
  const [warningTrianglePlacedDistanceMeters, setWarningTrianglePlacedDistanceMeters] =
    useState<number>(20);
  const [hasReflectiveSafetyVest, setHasReflectiveSafetyVest] = useState<boolean>(true);
  const [hasWheelChocks, setHasWheelChocks] = useState<boolean>(true);

  // Tab 2: Child Restraint System (CRS / ISOFIX) & Passenger Capacity (YHQ Art. 37 & İXM 327.2 / 329.1)
  const [hasChildPassenger, setHasChildPassenger] = useState<boolean>(true);
  const [childAgeYears, setChildAgeYears] = useState<number>(5);
  const [childWeightKg, setChildWeightKg] = useState<number>(19);
  const [childHeightCm, setChildHeightCm] = useState<number>(110);
  const [seatingPosition, setSeatingPosition] =
    useState<ChildSeatingPosition>('REAR_ISOFIX_OUTER');
  const [hasCertifiedChildSeatCrs, setHasCertifiedChildSeatCrs] = useState<boolean>(true);
  const [isRearFacingSeat, setIsRearFacingSeat] = useState<boolean>(false);
  const [isFrontPassengerAirbagActive, setIsFrontPassengerAirbagActive] = useState<boolean>(true);
  const [registeredSeatCapacity, setRegisteredSeatCapacity] = useState<number>(
    defaultProfile.registeredSeatCapacity
  );
  const [actualPassengersCount, setActualPassengersCount] = useState<number>(4);
  const [allAdultsFastenedSeatbelts, setAllAdultsFastenedSeatbelts] = useState<boolean>(true);

  // Tab 3: Cargo Overhang (YHQ Art. 57), Towing (YHQ Art. 56) & FHN Supply Centers
  const [rearCargoOverhangMeters, setRearCargoOverhangMeters] = useState<number>(0.5);
  const [lateralCargoOverhangMeters, setLateralCargoOverhangMeters] = useState<number>(0.1);
  const [hasOversizeWarningFlag, setHasOversizeWarningFlag] = useState<boolean>(true);
  const [isTowingAnotherVehicle, setIsTowingAnotherVehicle] = useState<boolean>(false);
  const [towCableLengthMeters, setTowCableLengthMeters] = useState<number>(5.0);
  const [hasTowCableWarningFlags, setHasTowCableWarningFlags] = useState<boolean>(true);
  const [towedVehicleHasWorkingBrakesAndSteering, setTowedVehicleHasWorkingBrakesAndSteering] =
    useState<boolean>(true);
  const [isIcyRoadConditions, setIsIcyRoadConditions] = useState<boolean>(false);

  const [selectedCenterId, setSelectedCenterId] = useState<string>(SAFETY_SUPPLY_CENTERS[0].id);
  const [includeOp2Extinguisher, setIncludeOp2Extinguisher] = useState<boolean>(true);
  const [includeOu2Co2Extinguisher, setIncludeOu2Co2Extinguisher] = useState<boolean>(false);
  const [includeExtinguisherRecharge, setIncludeExtinguisherRecharge] = useState<boolean>(false);
  const [includeFirstAidKit, setIncludeFirstAidKit] = useState<boolean>(true);
  const [includeWarningTriangle, setIncludeWarningTriangle] = useState<boolean>(true);
  const [includeVestAndTowRope, setIncludeVestAndTowRope] = useState<boolean>(false);
  const [includeIsofixChildSeat, setIncludeIsofixChildSeat] = useState<boolean>(false);

  // Tab 4: Official BDYP & FHN Certificate State
  const [plateNumber, setPlateNumber] = useState<string>('99-AZ-700');
  const [vinInput, setVinInput] = useState<string>(vehicle?.vin || 'JTMAB3FV80D110482');
  const [customCertificates, setCustomCertificates] = useState<PassengerSafetyCertificate[]>([]);
  const [activeCertificate, setActiveCertificate] = useState<PassengerSafetyCertificate | null>(
    null
  );
  const [registrySearchQuery, setRegistrySearchQuery] = useState<string>('');
  const [searchedCertificate, setSearchedCertificate] =
    useState<PassengerSafetyCertificate | null>(null);
  const [searchAttempted, setSearchAttempted] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const kitAudit = useMemo(
    () =>
      auditEmergencySafetyKit({
        vehicleClass,
        extinguisherType,
        extinguisherCount,
        extinguisherGauge,
        hasFirstAidKit,
        isFirstAidKitUnexpiredAndComplete,
        hasWarningTriangleEceR27,
        warningTrianglePlacedDistanceMeters,
        roadZone,
        hasReflectiveSafetyVest,
        hasWheelChocks,
      }),
    [
      vehicleClass,
      extinguisherType,
      extinguisherCount,
      extinguisherGauge,
      hasFirstAidKit,
      isFirstAidKitUnexpiredAndComplete,
      hasWarningTriangleEceR27,
      warningTrianglePlacedDistanceMeters,
      roadZone,
      hasReflectiveSafetyVest,
      hasWheelChocks,
    ]
  );

  const childAudit = useMemo(
    () =>
      auditChildAndPassengerCompliance({
        hasChildPassenger,
        childAgeYears,
        childWeightKg,
        childHeightCm,
        seatingPosition,
        hasCertifiedChildSeatCrs,
        isRearFacingSeat,
        isFrontPassengerAirbagActive,
        vehicleHasIsofixAnchors: defaultProfile.vehicleHasIsofixAnchors,
        registeredSeatCapacity,
        actualPassengersCount,
        allAdultsFastenedSeatbelts,
      }),
    [
      hasChildPassenger,
      childAgeYears,
      childWeightKg,
      childHeightCm,
      seatingPosition,
      hasCertifiedChildSeatCrs,
      isRearFacingSeat,
      isFrontPassengerAirbagActive,
      defaultProfile.vehicleHasIsofixAnchors,
      registeredSeatCapacity,
      actualPassengersCount,
      allAdultsFastenedSeatbelts,
    ]
  );

  const cargoTowingAudit = useMemo(
    () =>
      auditCargoAndTowingRules({
        rearCargoOverhangMeters,
        lateralCargoOverhangMeters,
        hasOversizeWarningFlag,
        isTowingAnotherVehicle,
        towCableLengthMeters,
        hasTowCableWarningFlags,
        towedVehicleHasWorkingBrakesAndSteering,
        isIcyRoadConditions,
      }),
    [
      rearCargoOverhangMeters,
      lateralCargoOverhangMeters,
      hasOversizeWarningFlag,
      isTowingAnotherVehicle,
      towCableLengthMeters,
      hasTowCableWarningFlags,
      towedVehicleHasWorkingBrakesAndSteering,
      isIcyRoadConditions,
    ]
  );

  const selectedCenter = useMemo(
    () =>
      SAFETY_SUPPLY_CENTERS.find((c) => c.id === selectedCenterId) || SAFETY_SUPPLY_CENTERS[0],
    [selectedCenterId]
  );

  const bundleEstimate = useMemo(
    () =>
      calculateSafetySupplyBundle({
        center: selectedCenter,
        includeOp2Extinguisher,
        includeOu2Co2Extinguisher,
        includeExtinguisherRecharge,
        includeFirstAidKit,
        includeWarningTriangle,
        includeVestAndTowRope,
        includeIsofixChildSeat,
      }),
    [
      selectedCenter,
      includeOp2Extinguisher,
      includeOu2Co2Extinguisher,
      includeExtinguisherRecharge,
      includeFirstAidKit,
      includeWarningTriangle,
      includeVestAndTowRope,
      includeIsofixChildSeat,
    ]
  );

  if (!isOpen) return null;

  const selectedExtinguisherInfo =
    EXTINGUISHER_OPTIONS.find((e) => e.id === extinguisherType) || EXTINGUISHER_OPTIONS[0];

  const handleGenerateCertificate = () => {
    const cert = generatePassengerSafetyCertificate({
      plateNumber,
      vin: vinInput,
      vehicleTitle: vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Toyota Camry',
      vehicleClass,
      extinguisherSpec: `${extinguisherCount}x ${selectedExtinguisherInfo.label}`,
      firstAidStatus: isFirstAidKitUnexpiredAndComplete
        ? 'Tam Komplekt (AR Səhiyyə Nazirliyi Standartı)'
        : 'Natamam / Yenilənməli',
      crsIsofixStatus: hasChildPassenger
        ? `${childAudit.recommendedCrsLabel} (${
            hasCertifiedChildSeatCrs ? 'Quraşdırılıb' : 'Yoxdur'
          })`
        : `Standart Kəmər (${registeredSeatCapacity} Oturacaq Yeri)`,
      inspectionCenterName: selectedCenter.name,
      isFullyCompliant: kitAudit.isFullyCompliant && childAudit.isFullyCompliant,
    });
    setCustomCertificates((prev) => [cert, ...prev]);
    setActiveCertificate(cert);
  };

  const handleRegistrySearch = () => {
    setSearchAttempted(true);
    const found = findSafetyCertificateByCode(registrySearchQuery, customCertificates);
    setSearchedCertificate(found);
  };

  const handleCopyCertNumber = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const displayedCertificate = activeCertificate || VERIFIED_SAFETY_CERTIFICATES[0];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      data-testid="passenger-safety-modal"
    >
      <div
        className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[93vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-rose-600 via-orange-500 to-amber-400 text-white shadow-lg shadow-rose-500/20">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  BDYP & FHN Qəza Təchizatı, Uşaq Avtokreslosu (İSOFIX) və Sərnişin Təhlükəsizliyi Portalı
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full">
                  YHQ Maddə 37 / Əlavə 1 • İXM 342.1.7 & 327.2
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Odluq (OP-2/OU-2) və Tibbi Çanta Auditoru, &lt;12 Yaş Uşaq Daşıma (60 ₼ + 3 Bal), Yük Qabariti / Yedək Trosu və E-Təhlükəsizlik Aktı
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            data-testid="close-passenger-safety-modal"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-950/50 px-4 sm:px-6 gap-2 py-2.5">
          <button
            type="button"
            onClick={() => setActiveTab('kit')}
            data-testid="tab-safety-kit"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'kit'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>1. Odluq, Tibbi Çanta & Qəza Nişanı (İXM 342.1.7)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('child')}
            data-testid="tab-child-crs"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'child'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Baby className="w-4 h-4" />
            <span>2. Uşaq Avtokreslosu (İSOFIX) & Sərnişin (Maddə 37)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cargo_centers')}
            data-testid="tab-cargo-centers"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'cargo_centers'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>3. Yük Qabariti / Yedək (Maddə 56–57) & FHN Mərkəzləri</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('certificate')}
            data-testid="tab-safety-certificate"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'certificate'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>4. E-Təhlükəsizlik Aktı (BDYP-TEH)</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* TAB 1: MANDATORY SAFETY KIT AUDITOR */}
          {activeTab === 'kit' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Controls */}
              <div className="lg:col-span-7 space-y-5">
                {/* Vehicle Category Selector */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-rose-400">
                      1. Nəqliyyat Vasitəsinin Kateqoriyası (YHQ Əlavə 1 Bölmə VII)
                    </label>
                    <span className="text-[11px] font-mono text-slate-400">
                      Norma: {kitAudit.requiredExtinguisherCount} ədəd ≥{kitAudit.requiredMinExtinguisherKg} kq
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {VEHICLE_REGULATORY_CLASSES.map((vc) => (
                      <button
                        key={vc.id}
                        type="button"
                        onClick={() => setVehicleClass(vc.id)}
                        data-testid={`vehicle-class-${vc.id}`}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          vehicleClass === vc.id
                            ? 'bg-rose-500/15 border-rose-500 text-white'
                            : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-slate-800 text-rose-300">
                            {vc.code}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-white">{vc.title}</div>
                        <div className="text-[11px] text-slate-400 mt-1">{vc.minExtinguisherRule}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fire Extinguisher Configuration */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-400">
                    2. Yanğınsöndürən Balon (Odluq) və Manometr Təzyiqi
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {EXTINGUISHER_OPTIONS.map((ext) => (
                      <button
                        key={ext.id}
                        type="button"
                        onClick={() => setExtinguisherType(ext.id)}
                        data-testid={`extinguisher-${ext.id}`}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          extinguisherType === ext.id
                            ? 'bg-amber-500/15 border-amber-500 text-white'
                            : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-bold text-white">{ext.label}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Həcm: <strong>{ext.massKg} kq</strong> • {ext.agentType}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Extinguisher Count & Gauge State */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                    <div>
                      <span className="block text-xs text-slate-400 mb-1.5">
                        Avtomobildəki Yanğınsöndürən Sayı:
                      </span>
                      <div className="flex gap-2">
                        {[1, 2].map((cnt) => (
                          <button
                            key={cnt}
                            type="button"
                            onClick={() => setExtinguisherCount(cnt)}
                            data-testid={`extinguisher-count-${cnt}`}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                              extinguisherCount === cnt
                                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            {cnt} ədəd
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="block text-xs text-slate-400 mb-1.5">
                        Manometr Təzyiqi və Plomb Vəziyyəti:
                      </span>
                      <select
                        value={extinguisherGauge}
                        onChange={(e) =>
                          setExtinguisherGauge(e.target.value as ExtinguisherGaugeState)
                        }
                        data-testid="extinguisher-gauge-select"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-semibold"
                      >
                        <option value="GREEN_NOMINAL">
                          Yaşıl Zona (1.4 MPa — Plomblu & Etibarlı)
                        </option>
                        <option value="RED_LOW_PRESSURE">
                          Qırmızı Zona (&lt;1.0 MPa — Təzyiq Düşüb)
                        </option>
                        <option value="EXPIRED_SEAL_BROKEN">
                          Müddəti Bitib və ya Plombu Qırılıb
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* First Aid Kit & Warning Triangle Distance */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400">
                    3. Tibbi Yardım Çantası və Qəza Dayanma Nişanı (YHQ Maddə 43)
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasFirstAidKit && isFirstAidKitUnexpiredAndComplete}
                        onChange={(e) => {
                          setHasFirstAidKit(e.target.checked);
                          setIsFirstAidKitUnexpiredAndComplete(e.target.checked);
                        }}
                        data-testid="toggle-first-aid-complete"
                        className="w-4 h-4 accent-emerald-500 rounded"
                      />
                      <span className="text-xs font-semibold text-slate-200">
                        AR Səhiyyə Nazirliyi Standartlı Tibbi Çanta (Jqut + Steril Bint)
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasWarningTriangleEceR27}
                        onChange={(e) => setHasWarningTriangleEceR27(e.target.checked)}
                        data-testid="toggle-warning-triangle"
                        className="w-4 h-4 accent-emerald-500 rounded"
                      />
                      <span className="text-xs font-semibold text-slate-200">
                        ECE R27 Qəza Dayanma Üçbucağı
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasReflectiveSafetyVest}
                        onChange={(e) => setHasReflectiveSafetyVest(e.target.checked)}
                        data-testid="toggle-reflective-vest"
                        className="w-4 h-4 accent-emerald-500 rounded"
                      />
                      <span className="text-xs font-semibold text-slate-200">
                        EN ISO 20471 İşıqqaytarıcı Jilet (Gecə Təmiri)
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasWheelChocks}
                        onChange={(e) => setHasWheelChocks(e.target.checked)}
                        data-testid="toggle-wheel-chocks"
                        className="w-4 h-4 accent-emerald-500 rounded"
                      />
                      <span className="text-xs font-semibold text-slate-200">
                        Diyirlənməyə Qarşı Təkər Dayağı (M2/M3/N2/N3)
                      </span>
                    </label>
                  </div>

                  {/* Emergency Stopping Distance Simulator (YHQ Article 43) */}
                  <div className="pt-3 border-t border-slate-800 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs font-bold text-slate-300">
                        Məcburi Dayanma Zamanı Üçbucağın Qoyulma Məsafəsi (YHQ Maddə 43):
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setRoadZone('POPULATED_CITY')}
                          data-testid="zone-city-btn"
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                            roadZone === 'POPULATED_CITY'
                              ? 'bg-sky-500 text-white'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          Şəhər Daxili (≥15 m)
                        </button>
                        <button
                          type="button"
                          onClick={() => setRoadZone('HIGHWAY_OUTSIDE')}
                          data-testid="zone-highway-btn"
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                            roadZone === 'HIGHWAY_OUTSIDE'
                              ? 'bg-sky-500 text-white'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          Magistral / Şəhərdən Kənar (≥30 m)
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">
                        Faktiki Quraşdırılma Məsafəsi:{' '}
                        <strong className="text-white">{warningTrianglePlacedDistanceMeters} metr</strong>
                      </span>
                      <span
                        className={`font-bold ${
                          kitAudit.isTriangleDistanceCompliant
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}
                      >
                        Minimum tələb: {kitAudit.requiredTriangleDistanceMeters} metr
                      </span>
                    </div>

                    <input
                      type="range"
                      min={5}
                      max={50}
                      step={5}
                      value={warningTrianglePlacedDistanceMeters}
                      onChange={(e) =>
                        setWarningTrianglePlacedDistanceMeters(Number(e.target.value))
                      }
                      data-testid="triangle-distance-slider"
                      className="w-full accent-sky-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Verdict & Medical Box Checklist */}
              <div className="lg:col-span-5 space-y-4">
                <div
                  data-testid="kit-audit-verdict-card"
                  className={`p-5 rounded-2xl border space-y-4 ${
                    kitAudit.isFullyCompliant
                      ? 'bg-emerald-950/25 border-emerald-500/40'
                      : 'bg-rose-950/30 border-rose-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {kitAudit.isFullyCompliant ? (
                        <ShieldCheck className="w-7 h-7 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <ShieldAlert className="w-7 h-7 text-rose-400 flex-shrink-0" />
                      )}
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900/80 text-slate-300">
                          DYP Texniki Baxış & İXM 342.1.7 Nəticəsi
                        </span>
                        <h3 className="text-base font-black text-white mt-1">
                          {kitAudit.verdictTitle}
                        </h3>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] uppercase text-slate-400 font-bold">Cərimə Riski</div>
                      <div
                        data-testid="kit-fine-amount"
                        className={`text-2xl font-black ${
                          kitAudit.fineAmountAzn === 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {kitAudit.fineAmountAzn === 0
                          ? '0 ₼'
                          : formatSafetyCurrency(kitAudit.fineAmountAzn, currency)}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {kitAudit.statutoryExplanation}
                  </p>

                  {kitAudit.violationArticles.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      <div className="text-xs font-bold text-rose-300">
                        Aşkar Edilən Qanunvericilik Pozuntuları:
                      </div>
                      {kitAudit.violationArticles.map((art, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-2"
                        >
                          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                          <span>{art}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {kitAudit.recommendations.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                      <div className="text-xs font-bold text-amber-300">Mühəndis Tövsiyələri:</div>
                      {kitAudit.recommendations.map((rec, i) => (
                        <div key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Official Ministry of Health Automotive Medical Box Inventory */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      AR Səhiyyə Nazirliyi — Məcburi Tibbi Çanta Tərkibi
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold">
                      6 Məcburi Bənd
                    </span>
                  </div>
                  <div className="space-y-2">
                    {MINISTRY_FIRST_AID_ITEMS.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">{item.name}</div>
                          <div className="text-[11px] text-slate-400">{item.purpose}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono font-bold whitespace-nowrap text-[11px]">
                          {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHILD RESTRAINT SYSTEM (CRS / ISOFIX) & PASSENGER AUDITOR */}
          {activeTab === 'child' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-5">
                {/* Child Passenger Parameters */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-rose-400">
                      1. Uşaq Sərnişin Parametrləri (ECE R44/04 & UN R129 i-Size)
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasChildPassenger}
                        onChange={(e) => setHasChildPassenger(e.target.checked)}
                        data-testid="toggle-has-child"
                        className="w-4 h-4 accent-rose-500 rounded"
                      />
                      <span>Salonda uşaq sərnişin var</span>
                    </label>
                  </div>

                  {hasChildPassenger && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">Uşağın Yaşı:</span>
                            <strong className="text-white">{childAgeYears} yaş</strong>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={15}
                            step={1}
                            value={childAgeYears}
                            onChange={(e) => setChildAgeYears(Number(e.target.value))}
                            data-testid="child-age-slider"
                            className="w-full accent-rose-500 cursor-pointer"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">Çəkisi (kq):</span>
                            <strong className="text-white">{childWeightKg} kq</strong>
                          </div>
                          <input
                            type="range"
                            min={3}
                            max={50}
                            step={1}
                            value={childWeightKg}
                            onChange={(e) => setChildWeightKg(Number(e.target.value))}
                            data-testid="child-weight-slider"
                            className="w-full accent-rose-500 cursor-pointer"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">Boyu (sm):</span>
                            <strong className="text-white">{childHeightCm} sm</strong>
                          </div>
                          <input
                            type="range"
                            min={50}
                            max={165}
                            step={5}
                            value={childHeightCm}
                            onChange={(e) => setChildHeightCm(Number(e.target.value))}
                            data-testid="child-height-slider"
                            className="w-full accent-rose-500 cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Seating Position */}
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <span className="block text-xs font-bold text-slate-300">
                          Uşağın Əyləşdiyi Oturacaq Mövcudluğu (YHQ Maddə 37.1.3):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <button
                            type="button"
                            onClick={() => setSeatingPosition('REAR_ISOFIX_OUTER')}
                            data-testid="seat-pos-rear-isofix"
                            className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                              seatingPosition === 'REAR_ISOFIX_OUTER'
                                ? 'bg-emerald-500/20 border-emerald-500 text-white'
                                : 'bg-slate-900 border-slate-800 text-slate-300'
                            }`}
                          >
                            <div className="font-bold">Arxa Yan İSOFIX</div>
                            <div className="text-[10px] text-emerald-400 mt-0.5">
                              Ən təhlükəsiz mövqe
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSeatingPosition('REAR_CENTER')}
                            data-testid="seat-pos-rear-center"
                            className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                              seatingPosition === 'REAR_CENTER'
                                ? 'bg-sky-500/20 border-sky-500 text-white'
                                : 'bg-slate-900 border-slate-800 text-slate-300'
                            }`}
                          >
                            <div className="font-bold">Arxa Mərkəzi Yeri</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Yan zərbədən uzaq zona
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSeatingPosition('FRONT_PASSENGER')}
                            data-testid="seat-pos-front"
                            className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                              seatingPosition === 'FRONT_PASSENGER'
                                ? 'bg-amber-500/20 border-amber-500 text-white'
                                : 'bg-slate-900 border-slate-800 text-slate-300'
                            }`}
                          >
                            <div className="font-bold">Ön Sağ Sərnişin Yeri</div>
                            <div className="text-[10px] text-amber-400 mt-0.5">
                              &lt;12 yaş yalnız avtokreslo ilə!
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* CRS & Airbag Toggles */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800">
                        <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={hasCertifiedChildSeatCrs}
                            onChange={(e) => setHasCertifiedChildSeatCrs(e.target.checked)}
                            data-testid="toggle-has-crs"
                            className="w-4 h-4 accent-emerald-500 rounded"
                          />
                          <span className="text-xs font-semibold text-slate-200">
                            Xüsusi Avtokreslo (CRS / İSOFIX) Quraşdırılıb
                          </span>
                        </label>

                        <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isRearFacingSeat}
                            onChange={(e) => setIsRearFacingSeat(e.target.checked)}
                            data-testid="toggle-rear-facing"
                            className="w-4 h-4 accent-amber-500 rounded"
                          />
                          <span className="text-xs font-semibold text-slate-200">
                            Arxaya Baxan (Rear-Facing) Körpə Beşiyi
                          </span>
                        </label>

                        <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isFrontPassengerAirbagActive}
                            onChange={(e) => setIsFrontPassengerAirbagActive(e.target.checked)}
                            data-testid="toggle-front-airbag"
                            className="w-4 h-4 accent-rose-500 rounded"
                          />
                          <span className="text-xs font-semibold text-slate-200">
                            Ön Sərnişin Airbag Aktivdir (ON)
                          </span>
                        </label>
                      </div>
                    </>
                  )}
                </div>

                {/* Passenger Capacity & Seatbelt Radar */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-sky-400">
                    2. Sərnişin Tutumu (Texpasport Norması) və Təhlükəsizlik Kəməri (İXM 329.1)
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Texpasport üzrə Oturacaq Sayı:</span>
                        <strong className="text-white">{registeredSeatCapacity} yer</strong>
                      </div>
                      <input
                        type="range"
                        min={2}
                        max={16}
                        step={1}
                        value={registeredSeatCapacity}
                        onChange={(e) => setRegisteredSeatCapacity(Number(e.target.value))}
                        data-testid="registered-seats-slider"
                        className="w-full accent-sky-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Faktiki Sərnişin Sayı:</span>
                        <strong
                          className={
                            actualPassengersCount > registeredSeatCapacity
                              ? 'text-rose-400'
                              : 'text-emerald-400'
                          }
                        >
                          {actualPassengersCount} nəfər
                        </strong>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={20}
                        step={1}
                        value={actualPassengersCount}
                        onChange={(e) => setActualPassengersCount(Number(e.target.value))}
                        data-testid="actual-passengers-slider"
                        className="w-full accent-sky-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allAdultsFastenedSeatbelts}
                      onChange={(e) => setAllAdultsFastenedSeatbelts(e.target.checked)}
                      data-testid="toggle-all-seatbelts"
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                    <span className="text-xs font-semibold text-slate-200">
                      Sürücü və bütün sərnişinlər təhlükəsizlik kəmərini bağlayıb (MMX AI Kamera Nəzarəti — 40 ₼)
                    </span>
                  </label>
                </div>
              </div>

              {/* Right Column: Child & Passenger Verdict */}
              <div className="lg:col-span-5 space-y-4">
                <div
                  data-testid="child-audit-verdict-card"
                  className={`p-5 rounded-2xl border space-y-4 ${
                    childAudit.isFullyCompliant
                      ? 'bg-emerald-950/25 border-emerald-500/40'
                      : 'bg-rose-950/30 border-rose-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900/80 text-slate-300">
                        YHQ Maddə 37 & İXM 327.2 / 329.1 Auditoru
                      </span>
                      <h3 className="text-base font-black text-white mt-1">
                        {childAudit.isFullyCompliant
                          ? 'Sərnişin və Uşaq Daşıma Qaydalarına Tam Uyğundur'
                          : 'Sərnişin Daşıma / Avtokreslo Qayda Pozuntusu!'}
                      </h3>
                    </div>

                    <div className="text-right">
                      <div
                        data-testid="child-fine-total"
                        className={`text-2xl font-black ${
                          childAudit.totalFineAzn === 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {childAudit.totalFineAzn === 0
                          ? '0 ₼'
                          : formatSafetyCurrency(childAudit.totalFineAzn, currency)}
                      </div>
                      <div
                        data-testid="child-penalty-points"
                        className="text-xs font-bold text-amber-400"
                      >
                        {childAudit.penaltyPoints} Cərimə Balı
                      </div>
                    </div>
                  </div>

                  {/* Recommended CRS Group Box */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-rose-400">
                      Tövsiyə Edilən ECE R44/04 & i-Size Kateqoriyası:
                    </div>
                    <div
                      data-testid="recommended-crs-label"
                      className="text-xs font-bold text-white"
                    >
                      {childAudit.recommendedCrsLabel}
                    </div>
                  </div>

                  {childAudit.isAirbagCriticalHazard && (
                    <div
                      data-testid="airbag-hazard-banner"
                      className="p-3.5 rounded-xl bg-red-950/80 border-2 border-red-500 text-xs text-red-200 font-bold flex items-start gap-2.5"
                    >
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>
                        HƏYATİ TƏHLÜKƏ: Ön oturacaqda Airbag aktiv olarkən arxaya baxan uşaq beşiyi quraşdırmaq qəza zamanı ölümcül zərbə vurur! Dərhal Airbag-i söndürün!
                      </span>
                    </div>
                  )}

                  {childAudit.violationArticles.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      {childAudit.violationArticles.map((v, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/30 text-xs text-rose-200"
                        >
                          {v}
                        </div>
                      ))}
                    </div>
                  )}

                  {childAudit.safetyWarnings.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-800">
                      {childAudit.safetyWarnings.map((w, idx) => (
                        <div key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CARGO OVERHANG / TOWING (YHQ 56-57) & FHN CENTERS */}
          {activeTab === 'cargo_centers' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Cargo Overhang & Towing Auditor + Center Selector */}
              <div className="lg:col-span-7 space-y-5">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-400">
                    1. Yük Daşıma Qabariti (YHQ Maddə 57) və Yedəyə Alma (YHQ Maddə 56) Auditoru
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Yükün Arxadan Çıxıntısı:</span>
                        <strong className="text-white">
                          {rearCargoOverhangMeters.toFixed(1)} metr
                        </strong>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={2.6}
                        step={0.2}
                        value={rearCargoOverhangMeters}
                        onChange={(e) => setRearCargoOverhangMeters(Number(e.target.value))}
                        data-testid="rear-overhang-slider"
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        ≤1.0m sərbəst • 1.0–2.0m lövhə ilə • &gt;2.0m BDYP icazəsi
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Elastik Yedək Trosu Uzunluğu:</span>
                        <strong className="text-white">{towCableLengthMeters.toFixed(1)} metr</strong>
                      </div>
                      <input
                        type="range"
                        min={2.0}
                        max={8.0}
                        step={0.5}
                        value={towCableLengthMeters}
                        onChange={(e) => setTowCableLengthMeters(Number(e.target.value))}
                        data-testid="tow-cable-slider"
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        YHQ Maddə 56.3 qanuni norma: 4.0 – 6.0 metr
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasOversizeWarningFlag}
                        onChange={(e) => setHasOversizeWarningFlag(e.target.checked)}
                        data-testid="toggle-oversize-flag"
                        className="w-4 h-4 accent-amber-500 rounded"
                      />
                      <span className="text-xs text-slate-200">
                        400x400 mm "İriqabaritli Yük" Lövhəsi Bərkidilib
                      </span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isTowingAnotherVehicle}
                        onChange={(e) => setIsTowingAnotherVehicle(e.target.checked)}
                        data-testid="toggle-is-towing"
                        className="w-4 h-4 accent-amber-500 rounded"
                      />
                      <span className="text-xs text-slate-200">
                        Elastik Trosla Başqa Avtomobil Yedəyə Alınır
                      </span>
                    </label>

                    {isTowingAnotherVehicle && (
                      <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer sm:col-span-2">
                        <input
                          type="checkbox"
                          checked={isIcyRoadConditions}
                          onChange={(e) => setIsIcyRoadConditions(e.target.checked)}
                          data-testid="toggle-icy-towing"
                          className="w-4 h-4 accent-rose-500 rounded"
                        />
                        <span className="text-xs text-rose-300 font-semibold">
                          Buzlu Yol / Gizli Buzlaşma Şəraiti (YHQ Maddə 56.6.1 üzrə elastik tros qadağandır!)
                        </span>
                      </label>
                    )}
                  </div>

                  {/* Cargo / Towing Verdict Strip */}
                  <div
                    data-testid="cargo-towing-status"
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                      cargoTowingAudit.isFullyCompliant
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                    }`}
                  >
                    <span className="font-semibold">
                      {cargoTowingAudit.isFullyCompliant
                        ? 'Yük qabariti və yedək trosu YHQ Maddə 56–57 normalarına tam uyğundur.'
                        : cargoTowingAudit.violationArticles[0]}
                    </span>
                    <span className="font-black ml-2 whitespace-nowrap">
                      {cargoTowingAudit.fineAmountAzn > 0
                        ? `${formatSafetyCurrency(cargoTowingAudit.fineAmountAzn, currency)}`
                        : '0 ₼'}
                    </span>
                  </div>
                </div>

                {/* Accredited FHN & BDYP Safety Supply Centers */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-rose-400">
                    2. FHN Lisenziyalı Yanğın Mühafizə, AvtoAptek & İSOFIX Mərkəzləri
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {SAFETY_SUPPLY_CENTERS.map((center) => (
                      <button
                        key={center.id}
                        type="button"
                        onClick={() => setSelectedCenterId(center.id)}
                        data-testid={`safety-center-${center.id}`}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedCenterId === center.id
                            ? 'bg-rose-500/15 border-rose-500 text-white'
                            : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-rose-300">
                            {center.fhnLicenseCode}
                          </span>
                          <span className="text-xs font-bold text-amber-400">★ {center.rating}</span>
                        </div>
                        <div className="text-xs font-bold text-white mt-1">{center.name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{center.address}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Safety Supply Bundle Calculator */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-rose-400">
                      Təhlükəsizlik Komplekti & İSOFIX Kalkulyatoru
                    </span>
                    <h3 className="text-base font-black text-white mt-0.5">
                      {selectedCenter.name}
                    </h3>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                      <Phone className="w-3.5 h-3.5 text-rose-400" />
                      <span>{selectedCenter.phone}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer text-xs">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={includeOp2Extinguisher}
                          onChange={(e) => setIncludeOp2Extinguisher(e.target.checked)}
                          data-testid="bundle-op2-checkbox"
                          className="w-4 h-4 accent-rose-500 rounded"
                        />
                        <span className="text-slate-200 font-semibold">
                          OP-2 (2 kq Quru Tozlu FHN Plomblu Odluq)
                        </span>
                      </div>
                      <span className="font-bold text-white">
                        {formatSafetyCurrency(selectedCenter.op2ExtinguisherPriceAzn, currency)}
                      </span>
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer text-xs">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={includeOu2Co2Extinguisher}
                          onChange={(e) => setIncludeOu2Co2Extinguisher(e.target.checked)}
                          data-testid="bundle-ou2-checkbox"
                          className="w-4 h-4 accent-rose-500 rounded"
                        />
                        <span className="text-slate-200 font-semibold">
                          OU-2 (2 kq CO₂ Elektromobil / Hibrid Odluğu)
                        </span>
                      </div>
                      <span className="font-bold text-white">
                        {formatSafetyCurrency(selectedCenter.ou2Co2ExtinguisherPriceAzn, currency)}
                      </span>
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer text-xs">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={includeExtinguisherRecharge}
                          onChange={(e) => setIncludeExtinguisherRecharge(e.target.checked)}
                          data-testid="bundle-recharge-checkbox"
                          className="w-4 h-4 accent-rose-500 rounded"
                        />
                        <span className="text-slate-200 font-semibold">
                          Mövcud Balonun Yenidən Doldurulması & Manometr Plombu
                        </span>
                      </div>
                      <span className="font-bold text-white">
                        {formatSafetyCurrency(selectedCenter.extinguisherRechargeFeeAzn, currency)}
                      </span>
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer text-xs">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={includeFirstAidKit}
                          onChange={(e) => setIncludeFirstAidKit(e.target.checked)}
                          data-testid="bundle-first-aid-checkbox"
                          className="w-4 h-4 accent-rose-500 rounded"
                        />
                        <span className="text-slate-200 font-semibold">
                          AR Səhiyyə Nazirliyi Standartlı Tam Tibbi Çanta
                        </span>
                      </div>
                      <span className="font-bold text-white">
                        {formatSafetyCurrency(selectedCenter.ministryFirstAidKitPriceAzn, currency)}
                      </span>
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer text-xs">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={includeWarningTriangle}
                          onChange={(e) => setIncludeWarningTriangle(e.target.checked)}
                          data-testid="bundle-triangle-checkbox"
                          className="w-4 h-4 accent-rose-500 rounded"
                        />
                        <span className="text-slate-200 font-semibold">
                          ECE R27 Qəza Dayanma Üçbucağı (Futlyarda)
                        </span>
                      </div>
                      <span className="font-bold text-white">
                        {formatSafetyCurrency(selectedCenter.eceWarningTrianglePriceAzn, currency)}
                      </span>
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer text-xs">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={includeVestAndTowRope}
                          onChange={(e) => setIncludeVestAndTowRope(e.target.checked)}
                          data-testid="bundle-vest-rope-checkbox"
                          className="w-4 h-4 accent-rose-500 rounded"
                        />
                        <span className="text-slate-200 font-semibold">
                          İşıqqaytarıcı Jilet + 5 Metrlik Bayraqlı Yedək Trosu (5t)
                        </span>
                      </div>
                      <span className="font-bold text-white">
                        {formatSafetyCurrency(
                          selectedCenter.reflectiveVestAndTowRopePriceAzn,
                          currency
                        )}
                      </span>
                    </label>

                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer text-xs">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={includeIsofixChildSeat}
                          onChange={(e) => setIncludeIsofixChildSeat(e.target.checked)}
                          data-testid="bundle-isofix-checkbox"
                          className="w-4 h-4 accent-rose-500 rounded"
                        />
                        <span className="text-slate-200 font-semibold">
                          ECE R129 i-Size İSOFIX Uşaq Avtokreslosu (Qrup 1/2/3)
                        </span>
                      </div>
                      <span className="font-bold text-white">
                        {formatSafetyCurrency(selectedCenter.isofixChildSeatPriceAzn, currency)}
                      </span>
                    </label>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400">Yekun Komplekt Qiyməti:</div>
                      <div className="text-[11px] text-emerald-400 font-semibold">
                        Qarşısı alınan cərimə riski: {bundleEstimate.finesPreventedAzn} ₼
                      </div>
                    </div>
                    <div
                      data-testid="bundle-total-cost"
                      className="text-2xl font-black text-white"
                    >
                      {formatSafetyCurrency(bundleEstimate.totalCostAzn, currency)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OFFICIAL BDYP & FHN ELECTRONIC SAFETY CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Generator & Registry Search */}
              <div className="lg:col-span-5 space-y-5">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-rose-400">
                    1. Rəsmi E-Təhlükəsizlik Aktı Tərtibatı (BDYP-TEH)
                  </label>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Dövlət Qeydiyyat Nişanı:
                    </label>
                    <input
                      type="text"
                      value={plateNumber}
                      onChange={(e) => setPlateNumber(e.target.value)}
                      data-testid="cert-plate-input"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Ban Nömrəsi (VIN):</label>
                    <input
                      type="text"
                      value={vinInput}
                      onChange={(e) => setVinInput(e.target.value)}
                      data-testid="cert-vin-input"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm uppercase"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateCertificate}
                    data-testid="generate-safety-cert-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-600/20 cursor-pointer"
                  >
                    Rəsmi BDYP-TEH Təhlükəsizlik Aktı Yarat
                  </button>
                </div>

                {/* Live Registry Verification Search */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-400">
                    2. Vahid Reyestr Axtarışı (Sertifikat Kodu / Nömrə / VIN)
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={registrySearchQuery}
                      onChange={(e) => setRegistrySearchQuery(e.target.value)}
                      placeholder="Məs: BDYP-TEH-2026-10482 və ya 77-EV-090"
                      data-testid="registry-search-input"
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleRegistrySearch}
                      data-testid="registry-search-btn"
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Yoxla</span>
                    </button>
                  </div>

                  {searchAttempted && (
                    <div data-testid="registry-search-result" className="pt-2">
                      {searchedCertificate ? (
                        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs space-y-1">
                          <div className="font-bold text-emerald-400 flex items-center justify-between">
                            <span>✓ Təsdiqlənmiş Akt Tapıldı</span>
                            <span className="font-mono">{searchedCertificate.certificateNumber}</span>
                          </div>
                          <div className="text-white font-semibold">
                            {searchedCertificate.vehicleTitle} ({searchedCertificate.plateNumber})
                          </div>
                          <div className="text-slate-300">
                            Odluq: {searchedCertificate.extinguisherSpec}
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300">
                          Sorğuya uyğun qeydiyyat tapılmadı. Nümunə: BDYP-TEH-2026-10482
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Official Certificate Preview */}
              <div className="lg:col-span-7">
                <div
                  data-testid="safety-certificate-card"
                  className="p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-rose-500/40 shadow-2xl space-y-5"
                >
                  <div className="flex items-start justify-between border-b border-slate-800 pb-4 gap-4">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-rose-400">
                        AZƏRBAYCAN RESPUBLİKASI DİN BDYPİ & FHN DYMX
                      </div>
                      <h3 className="text-lg font-black text-white mt-0.5">
                        NƏQLİYYAT VASİTƏSİNİN QƏZA-TƏHLÜKƏSİZLİK TƏCHİZATI VƏ İSOFIX UYĞUNLUQ AKTI
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        data-testid="active-cert-number"
                        className="font-mono text-xs font-black px-3 py-1.5 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/30"
                      >
                        {displayedCertificate.certificateNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCertNumber(displayedCertificate.certificateNumber)}
                        data-testid="copy-cert-btn"
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                        title="Akt nömrəsini kopyala"
                      >
                        {copiedCode ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-slate-400 block">Dövlət Nişanı:</span>
                      <strong className="text-white font-mono text-sm">
                        {displayedCertificate.plateNumber}
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-slate-400 block">VIN / Ban Kodu:</span>
                      <strong className="text-white font-mono text-xs">
                        {displayedCertificate.vin}
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 col-span-2 sm:col-span-1">
                      <span className="text-slate-400 block">Avtomobil:</span>
                      <strong className="text-white">{displayedCertificate.vehicleTitle}</strong>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex justify-between gap-2">
                      <span className="text-slate-400">Yanğınsöndürən (Odluq):</span>
                      <strong className="text-white text-right">
                        {displayedCertificate.extinguisherSpec}
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex justify-between gap-2">
                      <span className="text-slate-400">Tibbi Yardım Çantası:</span>
                      <strong className="text-emerald-400 text-right">
                        {displayedCertificate.firstAidStatus}
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex justify-between gap-2">
                      <span className="text-slate-400">Uşaq Avtokreslosu / Kəmər:</span>
                      <strong className="text-sky-300 text-right">
                        {displayedCertificate.crsIsofixStatus}
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex justify-between gap-2">
                      <span className="text-slate-400">Yoxlayan Mərkəz:</span>
                      <strong className="text-slate-200 text-right">
                        {displayedCertificate.inspectionCenterName}
                      </strong>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block">QR Rəqəmsal İmza:</span>
                      <span className="font-mono text-xs text-slate-300">
                        {displayedCertificate.qrVerificationHash}
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black">
                      {displayedCertificate.complianceVerdict}
                    </span>
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

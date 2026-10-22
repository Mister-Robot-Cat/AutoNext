import React, { useState } from 'react';
import {
  Flame,
  ShieldAlert,
  Truck,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Printer,
  Search,
  ExternalLink,
  Info,
  Clock,
  Compass,
  Zap,
} from 'lucide-react';
import { Currency } from '../types/vehicle';
import {
  ADRSubstance,
  ADRVehicleType,
  evaluateADRCompliance,
  calculateADRPermitCost,
  generateADRSpecialPermit,
  interpretKemlerCode,
  formatADRCurrency,
  ADRSpecialPermit,
} from '../utils/adrCompliance';
import {
  MOCK_ADR_SUBSTANCES,
  MOCK_ADR_EQUIPMENT_CHECKLIST,
  MOCK_ADR_CORRIDORS,
  MOCK_ADR_INSPECTION_CENTERS,
  MOCK_ADR_SAMPLE_PERMITS,
} from '../data/mockAdrData';

interface AdrComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: Currency;
  initialPlate?: string;
  initialVehicleModel?: string;
}

export const AdrComplianceModal: React.FC<AdrComplianceModalProps> = ({
  isOpen,
  onClose,
  currency = 'AZN',
  initialPlate = '99-JH-120',
  initialVehicleModel = 'Mercedes-Benz Actros 1845 ADR (FL)',
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'kemler' | 'equipment' | 'corridor' | 'certificate'>('kemler');

  // Substance & Plate State
  const [selectedSubstance, setSelectedSubstance] = useState<ADRSubstance>(MOCK_ADR_SUBSTANCES[0]);
  const [vehiclePlate, setVehiclePlate] = useState(initialPlate);
  const [vehicleType, setVehicleType] = useState<ADRVehicleType>('FL');

  // Technical Specs
  const [tankerInspectionValid, setTankerInspectionValid] = useState(true);
  const [batteryMasterSwitchEx, setBatteryMasterSwitchEx] = useState(true);
  const [exhaustSparkArrestor, setExhaustSparkArrestor] = useState(true);
  const [absEbsFunctional, setAbsEbsFunctional] = useState(true);

  // Equipment Checklist (Default all checked)
  const [equippedItemIds, setEquippedItemIds] = useState<string[]>(
    MOCK_ADR_EQUIPMENT_CHECKLIST.map((item) => item.id)
  );

  // Driver Credentials State
  const [driverName, setDriverName] = useState('Nəriman Cəfərov');
  const [driverFin, setDriverFin] = useState('5K8LM29');
  const [isDriverValid, setIsDriverValid] = useState(true);
  const [isTankerCertified, setIsTankerCertified] = useState(true);
  const [isClass1Certified, setIsClass1Certified] = useState(false);

  // Permit Form State
  const [carrierName, setCarrierName] = useState('SOCAR Logistics Trans MMC');
  const [carrierVoen, setCarrierVoen] = useState('1401298831');
  const [selectedCorridorId, setSelectedCorridorId] = useState(MOCK_ADR_CORRIDORS[0].id);
  const [isUrgent, setIsUrgent] = useState(false);

  // Active Generated Permit
  const [activePermit, setActivePermit] = useState<ADRSpecialPermit>(MOCK_ADR_SAMPLE_PERMITS[0]);
  const [isCopied, setIsCopied] = useState(false);

  // Search Registry
  const [searchQuery, setSearchQuery] = useState('');
  const [registryResults, setRegistryResults] = useState<ADRSpecialPermit[]>(MOCK_ADR_SAMPLE_PERMITS);

  if (!isOpen) return null;

  const currentCorridor = MOCK_ADR_CORRIDORS.find((c) => c.id === selectedCorridorId) || MOCK_ADR_CORRIDORS[0];

  // Evaluate Compliance
  const auditResult = evaluateADRCompliance({
    vehiclePlate,
    substance: selectedSubstance,
    vehicleType,
    tankerInspectionValid,
    batteryMasterSwitchEx,
    exhaustSparkArrestor,
    absEbsFunctional,
    equippedItemIds,
    driverCredential: {
      certificateNumber: 'FHN-ADR-SR-2026-0941',
      driverName,
      driverFin,
      isBasicCertified: isDriverValid,
      isTankerCertified,
      isClass1ExplosivesCertified: isClass1Certified,
      isClass7RadioactiveCertified: false,
      expiryDate: '2028-05-14',
      isValid: isDriverValid,
    },
  });

  // Calculate Fees
  const permitCost = calculateADRPermitCost({
    distanceKm: currentCorridor.distanceKm,
    classId: selectedSubstance.classId,
    vehicleType,
    isUrgent,
    currency,
  });

  const kemlerInterpretation = interpretKemlerCode(selectedSubstance.kemlerCode);

  const toggleEquipmentItem = (id: string) => {
    setEquippedItemIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleGeneratePermit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPermit = generateADRSpecialPermit({
      carrierName,
      carrierVoen,
      vehiclePlate,
      driverFin,
      substance: selectedSubstance,
      corridorName: currentCorridor.nameAz,
      totalFeeAzn: permitCost.totalAzn,
    });
    setActivePermit(newPermit);
    setRegistryResults((prev) => [newPermit, ...prev]);
    setActiveTab('certificate');
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard?.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRegistrySearch = (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setRegistryResults(MOCK_ADR_SAMPLE_PERMITS);
      return;
    }
    const filtered = [activePermit, ...MOCK_ADR_SAMPLE_PERMITS].filter(
      (p) =>
        p.permitNumber.toLowerCase().includes(q.toLowerCase()) ||
        p.vehiclePlate.toLowerCase().includes(q.toLowerCase()) ||
        p.carrierName.toLowerCase().includes(q.toLowerCase()) ||
        p.unNumber.includes(q)
    );
    setRegistryResults(filtered);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/40 rounded-xl text-amber-400">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  FHN & BDYP ADR Təhlükəli Yüklərin Daşınması Portalı
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                  UNECE ADR 2026
                </span>
              </div>
              <p className="text-xs text-slate-400">
                YHQ Maddə 58 & Əlavə 1 Bənd 7.9 • İXM Maddə 354 • FHN S.Ə. Dövlət Agentliyi Rəsmi Reyestri
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Bağla"
          >
            ✕
          </button>
        </div>

        {/* Quick KPI Status Header */}
        <div className="px-6 py-3 bg-slate-800/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-4">
            <div>
              <span className="text-slate-400">Nəqliyyat: </span>
              <span className="font-semibold text-slate-200">{initialVehicleModel}</span>
            </div>
            <div className="bg-slate-700/60 px-2.5 py-1 rounded border border-slate-600 font-mono text-amber-300 font-bold">
              {vehiclePlate}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div>
              <span className="text-slate-400">Təhlükəsizlik İndeksi: </span>
              <span
                className={`font-bold ${
                  auditResult.safetyScore >= 85
                    ? 'text-emerald-400'
                    : auditResult.safetyScore >= 60
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {auditResult.safetyScore} / 100
              </span>
            </div>
            <div>
              <span className="text-slate-400">Status: </span>
              <span
                className={`px-2 py-0.5 rounded font-semibold text-xs ${
                  auditResult.status === 'approved'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : auditResult.status === 'conditional_warning'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {auditResult.status === 'approved'
                  ? 'BURAXILIŞ TƏSDİQ'
                  : auditResult.status === 'conditional_warning'
                  ? 'ŞƏRTİ XƏBƏRDARLIQ'
                  : 'İSTİSMAR QADAĞANDIR'}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Sürət Həddi: </span>
              <span className="font-bold text-amber-400">{auditResult.speedLimitKmh} km/s</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/80 px-6 gap-2">
          <button
            onClick={() => setActiveTab('kemler')}
            className={`py-3 px-4 text-sm font-medium border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'kemler'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-4 h-4" />
            1. BMT Maddəsi & Narıncı Kemler Lövhəsi
          </button>
          <button
            onClick={() => setActiveTab('equipment')}
            className={`py-3 px-4 text-sm font-medium border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'equipment'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            2. Sistern & Təchizat (FL/AT/EX)
          </button>
          <button
            onClick={() => setActiveTab('corridor')}
            className={`py-3 px-4 text-sm font-medium border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'corridor'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            3. Tranzit Marşrut & FHN E-İcazə
          </button>
          <button
            onClick={() => setActiveTab('certificate')}
            className={`py-3 px-4 text-sm font-medium border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'certificate'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            4. Rəsmi "Xüsusi İcazə" & Reyestr
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: KEMLER PLATE & SUBSTANCES */}
          {activeTab === 'kemler' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Substance Selector & Attributes */}
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-5 space-y-4">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-400" />
                    Daşınan Təhlükəli Yükün (BMT / UN) Seçimi
                  </h3>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Maddə və Nomenklatura</label>
                    <select
                      value={selectedSubstance.unNumber}
                      onChange={(e) => {
                        const found = MOCK_ADR_SUBSTANCES.find((s) => s.unNumber === e.target.value);
                        if (found) setSelectedSubstance(found);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                    >
                      {MOCK_ADR_SUBSTANCES.map((sub) => (
                        <option key={sub.unNumber} value={sub.unNumber}>
                          UN {sub.unNumber} • {sub.nameAz} (Kemler: {sub.kemlerCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block">Təhlükə Sinfi:</span>
                      <span className="font-bold text-amber-300 uppercase">{selectedSubstance.classId}</span>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block">Qablaşdırma Qrupu (PG):</span>
                      <span className="font-bold text-amber-300">Qrup {selectedSubstance.packingGroup}</span>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block">Alışma Həddi:</span>
                      <span className="font-bold text-slate-200">
                        {selectedSubstance.flashPointC !== undefined ? `${selectedSubstance.flashPointC}°C` : 'N/A'}
                      </span>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block">Tələb Olunan Nəqliyyat:</span>
                      <span className="font-bold text-emerald-400">{selectedSubstance.recommendedVehicleType}</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-700/80 text-xs space-y-1">
                    <div className="font-semibold text-rose-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      Əsas Təhlükə Təsviri:
                    </div>
                    <p className="text-slate-300">{selectedSubstance.primaryHazard}</p>
                  </div>
                </div>

                {/* Kemler Orange Plate Visualizer */}
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-5 flex flex-col items-center justify-center space-y-4">
                  <div className="text-xs text-slate-400 font-medium">
                    ADR 5.3.2 Rəsmi Reflektiv Narıncı Kemler Lövhəsi (400 × 300 mm)
                  </div>

                  {/* Realistic Retro-reflective Orange Plate */}
                  <div className="w-64 h-48 bg-gradient-to-b from-amber-500 to-orange-600 rounded-md border-8 border-slate-950 p-2 shadow-2xl flex flex-col justify-between font-mono font-black text-slate-950 select-none tracking-widest relative">
                    <div className="text-center text-4xl pt-3 pb-1 border-b-4 border-slate-950 leading-none">
                      {selectedSubstance.kemlerCode}
                    </div>
                    <div className="text-center text-4xl pb-3 pt-1 leading-none">
                      {selectedSubstance.unNumber}
                    </div>
                    {/* Small screw rivets */}
                    <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-slate-800/80" />
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-slate-800/80" />
                    <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-slate-800/80" />
                    <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-slate-800/80" />
                  </div>

                  <div className="text-center space-y-1 max-w-sm">
                    <div className="text-xs font-semibold text-amber-300">
                      Kemler Xarakteristikası: {kemlerInterpretation.hazardSummaryAz}
                    </div>
                    {kemlerInterpretation.isWaterReactive && (
                      <div className="px-2 py-1 bg-rose-500/20 border border-rose-500/40 rounded text-[11px] text-rose-300 font-bold">
                        DİQQƏT: Maddə su ilə partlayışlı reaksiya verir (X-Prefiksi)!
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Emergency Response Guide Box */}
              <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-amber-300">
                    Fövqəladə Hallar və Qəza Protokolu (FHN & BDYP Təlimatı):
                  </h4>
                  <p className="text-slate-300 leading-relaxed">{selectedSubstance.emergencyGuideAz}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VEHICLE & EQUIPMENT INSPECTION */}
          {activeTab === 'equipment' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Vehicle Tech Checklist */}
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-400" />
                    Nəqliyyat Kateqoriyası & Texniki Standartlar
                  </h3>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">ADR Nəqliyyat Tipi</label>
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value as ADRVehicleType)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                    >
                      <option value="FL">FL — Alışan maye və qaz sisternləri</option>
                      <option value="AT">AT — Digər kimyəvi sisternlər</option>
                      <option value="EX_II">EX/II — Partlayıcı maddə örtülü furqon</option>
                      <option value="EX_III">EX/III — Gücləndirilmiş partlayıcı konteyneri</option>
                      <option value="MEMU">MEMU — Səyyar partlayıcı istehsal kompleksi</option>
                      <option value="STANDARD_PACKAGE">STANDART — Qablaşdırılmış təhlükəli yük (Palet/Boçka)</option>
                    </select>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <label className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800 cursor-pointer">
                      <span>FHN ADR Texniki Uyğunluq Talonu</span>
                      <input
                        type="checkbox"
                        checked={tankerInspectionValid}
                        onChange={(e) => setTankerInspectionValid(e.target.checked)}
                        className="rounded border-slate-700 text-amber-500 focus:ring-0"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800 cursor-pointer">
                      <span>Ex-Proof Akkumulyator Kəsicisi (Master Switch)</span>
                      <input
                        type="checkbox"
                        checked={batteryMasterSwitchEx}
                        onChange={(e) => setBatteryMasterSwitchEx(e.target.checked)}
                        className="rounded border-slate-700 text-amber-500 focus:ring-0"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800 cursor-pointer">
                      <span>Qazburaxmada Qığılcımtutan (Spark Arrestor)</span>
                      <input
                        type="checkbox"
                        checked={exhaustSparkArrestor}
                        onChange={(e) => setExhaustSparkArrestor(e.target.checked)}
                        className="rounded border-slate-700 text-amber-500 focus:ring-0"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800 cursor-pointer">
                      <span>ABS / EBS Elektron Əyləc Sistemi</span>
                      <input
                        type="checkbox"
                        checked={absEbsFunctional}
                        onChange={(e) => setAbsEbsFunctional(e.target.checked)}
                        className="rounded border-slate-700 text-amber-500 focus:ring-0"
                      />
                    </label>
                  </div>

                  {/* Driver Credential toggles */}
                  <div className="pt-3 border-t border-slate-700/60 space-y-2 text-xs">
                    <h4 className="font-semibold text-slate-200">Sürücü ADR Şəhadətnaməsi</h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        placeholder="Sürücü adı"
                        className="w-1/2 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs"
                      />
                      <input
                        type="text"
                        value={driverFin}
                        onChange={(e) => setDriverFin(e.target.value)}
                        placeholder="FİN kod"
                        className="w-1/2 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono uppercase"
                      />
                    </div>
                    <label className="flex items-center justify-between p-1.5 rounded bg-slate-900/60 border border-slate-800 cursor-pointer">
                      <span>FHN ADR Şəhadətnaməsi Etibarlıdır</span>
                      <input
                        type="checkbox"
                        checked={isDriverValid}
                        onChange={(e) => setIsDriverValid(e.target.checked)}
                        className="rounded text-amber-500 focus:ring-0"
                      />
                    </label>
                    <label className="flex items-center justify-between p-1.5 rounded bg-slate-900/60 border border-slate-800 cursor-pointer">
                      <span>Sistern İxtisası (Tanker) Var</span>
                      <input
                        type="checkbox"
                        checked={isTankerCertified}
                        onChange={(e) => setIsTankerCertified(e.target.checked)}
                        className="rounded text-amber-500 focus:ring-0"
                      />
                    </label>
                  </div>
                </div>

                {/* Mandatory Safety Equipment Checklist */}
                <div className="md:col-span-2 bg-slate-800/40 border border-slate-700/60 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      Məcburi ADR Təhlükəsizlik Avadanlığı Çantası (UNECE 8.1.5)
                    </h3>
                    <button
                      onClick={() =>
                        setEquippedItemIds(MOCK_ADR_EQUIPMENT_CHECKLIST.map((item) => item.id))
                      }
                      className="text-xs text-amber-400 hover:underline"
                    >
                      Hamısını təmin et (100%)
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
                    {MOCK_ADR_EQUIPMENT_CHECKLIST.map((item) => {
                      const isEquipped = equippedItemIds.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleEquipmentItem(item.id)}
                          className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                            isEquipped
                              ? 'bg-slate-900/70 border-emerald-500/40 text-slate-200'
                              : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                          }`}
                        >
                          <div className="mt-0.5">
                            {isEquipped ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold">{item.titleAz}</div>
                            <div className="text-[11px] text-slate-400">{item.descriptionAz}</div>
                            {!isEquipped && (
                              <div className="text-[10px] text-rose-400 font-bold mt-1">
                                {item.penaltyAz}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Violations and fines summary */}
                  {auditResult.legalViolations.length > 0 && (
                    <div className="p-3 bg-rose-950/30 border border-rose-500/40 rounded-lg text-xs space-y-1">
                      <div className="font-bold text-rose-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        Aşkar Edilmiş Qanun Pozuntuları (İXM Maddə 354):
                      </div>
                      <ul className="list-disc list-inside text-rose-200 space-y-0.5 pl-1">
                        {auditResult.legalViolations.map((v, i) => (
                          <li key={i}>{v}</li>
                        ))}
                      </ul>
                      <div className="text-amber-300 font-semibold pt-1">
                        Tətbiq oluna biləcək cərimə riski: {auditResult.ixmFinePotentialAzn} AZN
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRANSIT ROUTE & PERMIT APPLICATION */}
          {activeTab === 'corridor' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Corridor Selector */}
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-400" />
                    Azərbaycan Magistral Tranzit Dəhlizləri
                  </h3>

                  <div className="space-y-2.5">
                    {MOCK_ADR_CORRIDORS.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCorridorId(c.id)}
                        className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                          selectedCorridorId === c.id
                            ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>{c.nameAz}</span>
                          <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-amber-400">
                            {c.corridorCode}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                          <span>Məsafə: {c.distanceKm} km</span>
                          <span>Təxmini vaxt: {c.estimatedTransitHours} saat</span>
                          <span>Rüsum: {c.stateDutyAzn} AZN</span>
                        </div>
                        {c.tunnelBypassRequired && (
                          <div className="mt-1 text-[10px] text-amber-400 font-semibold">
                            ⚠️ Dairəvi tunel bypass məcburidir (Tunel Kateqoriyası D/E)
                          </div>
                        )}
                        <div className="text-[11px] text-slate-400 mt-1">
                          🅿️ Qorunan təhlükəsiz duracaq: {c.safeParkingWaypointAz}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Permit Application Form */}
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-amber-400" />
                    FHN Rəsmi "Xüsusi İcazə" Müraciəti
                  </h3>

                  <form onSubmit={handleGeneratePermit} className="space-y-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Daşıyıcı Şirkət (Hüquqi Şəxs)</label>
                      <input
                        type="text"
                        value={carrierName}
                        onChange={(e) => setCarrierName(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-400 block mb-1">Şirkət VÖEN</label>
                        <input
                          type="text"
                          value={carrierVoen}
                          onChange={(e) => setCarrierVoen(e.target.value)}
                          required
                          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Dövlət Qeydiyyat Nişanı</label>
                        <input
                          type="text"
                          value={vehiclePlate}
                          onChange={(e) => setVehiclePlate(e.target.value)}
                          required
                          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-amber-300 font-mono uppercase"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1.5">
                      <div className="flex justify-between text-slate-400">
                        <span>Dövlət Rüsumu (Qanunvericilik):</span>
                        <span className="font-mono text-slate-200">{permitCost.baseDutyAzn} AZN</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Marşrut Koordinasiya Haqqı:</span>
                        <span className="font-mono text-slate-200">
                          {permitCost.routeCoordinationFeeAzn} AZN
                        </span>
                      </div>
                      {permitCost.escortFeeAzn > 0 && (
                        <div className="flex justify-between text-amber-400">
                          <span>Müşayiət Xidməti (Sinif 1 / X88):</span>
                          <span className="font-mono">{permitCost.escortFeeAzn} AZN</span>
                        </div>
                      )}
                      <label className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-800 cursor-pointer">
                        <span>Təcili Rəsmiləşdirmə (24 saat ərzində +50 AZN)</span>
                        <input
                          type="checkbox"
                          checked={isUrgent}
                          onChange={(e) => setIsUrgent(e.target.checked)}
                          className="rounded text-amber-500 focus:ring-0"
                        />
                      </label>
                      <div className="flex justify-between font-bold text-sm text-amber-400 pt-2 border-t border-slate-700">
                        <span>Cəmi Ödəniş:</span>
                        <span>{permitCost.formattedTotal}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={auditResult.status === 'prohibited'}
                      className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-all ${
                        auditResult.status === 'prohibited'
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                      }`}
                    >
                      <Zap className="w-4 h-4" />
                      FHN E-İcazə Sertifikatını Təsdiqlə və Çap Et
                    </button>
                    {auditResult.status === 'prohibited' && (
                      <p className="text-[11px] text-rose-400 text-center">
                        ⚠️ Texniki nasazlıqlar və ya sürücü şəhadətnaməsi çatışmazlığı səbəbindən icazə verilməsi qadağandır.
                      </p>
                    )}
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OFFICIAL CERTIFICATE & REGISTRY */}
          {activeTab === 'certificate' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Official Electronic Certificate Voucher */}
                <div className="flex-1 bg-gradient-to-b from-slate-950 to-slate-900 border-2 border-amber-500/50 rounded-2xl p-6 text-slate-100 shadow-2xl relative overflow-hidden">
                  {/* Decorative Background Stamp */}
                  <div className="absolute right-4 top-4 opacity-5 pointer-events-none select-none text-9xl font-black text-amber-500">
                    ADR
                  </div>

                  {/* Header of Certificate */}
                  <div className="text-center pb-4 border-b border-amber-500/30 space-y-1">
                    <div className="text-xs font-bold tracking-widest text-amber-400 uppercase">
                      Azərbaycan Respublikası Fövqəladə Hallar Nazirliyi
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Sənayedə İşlərin Təhlükəsiz Görülməsi və Dağ-Mədən Nəzarəti Dövlət Agentliyi
                    </div>
                    <h3 className="text-base font-black text-white pt-1">
                      TƏHLÜKƏLİ YÜKLƏRİN DAŞINMASINA XÜSUSİ İCAZƏ VƏRƏQƏSİ
                    </h3>
                    <div className="text-xs font-mono font-bold text-amber-400">
                      № {activePermit.permitNumber}
                    </div>
                  </div>

                  {/* Certificate Body Grid */}
                  <div className="py-4 grid grid-cols-2 gap-3 text-xs border-b border-slate-800">
                    <div>
                      <span className="text-slate-500 block">Daşıyıcı Qurum:</span>
                      <span className="font-semibold text-slate-200">{activePermit.carrierName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">VÖEN:</span>
                      <span className="font-mono text-slate-200">{activePermit.carrierVoen}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Nəqliyyat DQN:</span>
                      <span className="font-mono font-bold text-amber-300">{activePermit.vehiclePlate}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Sürücü FİN:</span>
                      <span className="font-mono text-slate-200">{activePermit.driverFin}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">BMT (UN) Kodu & Maddə:</span>
                      <span className="font-bold text-slate-200">
                        UN {activePermit.unNumber} • {activePermit.substanceName}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Kemler Təhlükə Qrupu:</span>
                      <span className="font-mono font-bold text-amber-400">{activePermit.kemlerCode}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 block">Təsdiq Edilmiş Marşrut Dəhlizi:</span>
                      <span className="font-semibold text-slate-200">{activePermit.routeCorridor}</span>
                    </div>
                  </div>

                  {/* Timestamps & Security Hash */}
                  <div className="py-3 flex items-center justify-between text-[11px] border-b border-slate-800 text-slate-400">
                    <div>
                      Verilmə: <span className="text-slate-200">{activePermit.issueDate}</span>
                    </div>
                    <div>
                      Etibarlıdır: <span className="text-emerald-400 font-bold">{activePermit.validUntil}</span>
                    </div>
                    <div>
                      Dövlət Rüsumu: <span className="text-amber-400 font-bold">{formatADRCurrency(activePermit.totalFeeAzn, currency)}</span>
                    </div>
                  </div>

                  {/* QR & Barcode Section */}
                  <div className="pt-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-500 font-mono">
                        {activePermit.securityHash}
                      </div>
                      <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> FHN & BDYP Vahid Reyestrində Təsdiqlənmişdir
                      </div>
                    </div>
                    <div className="p-2 bg-white rounded-lg">
                      {/* Simulating 2D DataMatrix QR */}
                      <div className="w-12 h-12 bg-slate-900 flex items-center justify-center text-amber-400 font-mono text-[9px] font-bold text-center leading-none p-1">
                        FHN<br/>QR-OK
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex gap-3">
                    <button
                      onClick={() => handleCopyCode(activePermit.permitNumber)}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {isCopied ? 'Kopyalandı!' : 'İcazə Nömrəsini Kopyala'}
                    </button>
                    <button
                      onClick={handlePrint}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Çap Et
                    </button>
                  </div>
                </div>

                {/* Registry Verification Search */}
                <div className="w-full md:w-80 bg-slate-800/40 border border-slate-700/60 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Search className="w-4 h-4 text-amber-400" />
                    FHN Rəsmi ADR İcazə Reyestri
                  </h3>

                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleRegistrySearch(e.target.value)}
                      placeholder="İcazə №, DQN və ya UN kodu..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 pl-8 focus:outline-none focus:border-amber-500"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {registryResults.map((permit) => (
                      <div
                        key={permit.permitNumber}
                        onClick={() => setActivePermit(permit)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                          activePermit.permitNumber === permit.permitNumber
                            ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-center font-bold">
                          <span>{permit.permitNumber}</span>
                          <span className="font-mono text-[11px] text-amber-400">
                            {permit.vehiclePlate}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 truncate">
                          {permit.carrierName}
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                          <span>UN {permit.unNumber}</span>
                          <span className="text-emerald-400">{permit.validUntil}-dək</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Regional Inspection Hubs list */}
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <div className="font-semibold text-slate-300">FHN & BDYP Regional Məntəqələri:</div>
                    <ul className="space-y-0.5 text-[10px] text-slate-400">
                      {MOCK_ADR_INSPECTION_CENTERS.slice(0, 3).map((center) => (
                        <li key={center.id} className="truncate">
                          📍 {center.nameAz}
                        </li>
                      ))}
                    </ul>
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

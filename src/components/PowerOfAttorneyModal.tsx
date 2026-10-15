import React, { useState, useMemo } from 'react';
import {
  FileSignature,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  X,
  Printer,
  Copy,
  Check,
  FileText,
  Sliders,
  Car,
  QrCode,
  Calendar,
  Sparkles,
  Clock,
  Building2,
  Users,
  Scale,
  Search,
  AlertCircle,
  Globe,
  Compass,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Vehicle, Currency, Language } from '../types/vehicle';
import {
  CrossBorderRight,
  NotaryOffice,
  PartyGrantee,
  PartyGrantor,
  PoaDurationMonths,
  PoaRelationship,
  PoaScope,
  PoaStatus,
  PowerOfAttorneyRecord,
  SubDelegationRight,
} from '../types/powerOfAttorney';
import {
  calculateExpiryDate,
  calculatePoaFees,
  calculateRemainingPoaDays,
  filterPoaRecords,
  formatPoaLegalDocument,
  generatePoaRegistrationNumber,
  generatePoaSecurityHash,
  validateFin,
} from '../utils/powerOfAttorney';
import {
  MOCK_ACTIVE_POA_RECORDS,
  NOTARY_OFFICES,
  POA_PERSONA_PRESETS,
  STATUTORY_MAX_POA_MONTHS,
} from '../data/mockPoaData';
import { formatPrice } from '../utils/i18n';

export interface PowerOfAttorneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  currency: Currency;
  lang: Language;
}

type TabType = 'calculator' | 'parties' | 'telemetry' | 'document' | 'active_registry';

export const PowerOfAttorneyModal: React.FC<PowerOfAttorneyModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  currency,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('calculator');
  const [copiedDoc, setCopiedDoc] = useState(false);
  const [revocationReason, setRevocationReason] = useState('');
  const [selectedRecordToRevoke, setSelectedRecordToRevoke] = useState<string | null>(null);

  // Search & filter for registry tab
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PoaStatus | 'ALL'>('ALL');

  // Form State
  const [scope, setScope] = useState<PoaScope>('DRIVING_ONLY');
  const [relationship, setRelationship] = useState<PoaRelationship>('CLOSE_RELATIVE');
  const [durationMonths, setDurationMonths] = useState<PoaDurationMonths>(12);
  const [subDelegation, setSubDelegation] = useState<SubDelegationRight>('NOT_ALLOWED');
  const [crossBorder, setCrossBorder] = useState<CrossBorderRight>('DOMESTIC_ONLY');
  const [selectedNotaryOffice, setSelectedNotaryOffice] = useState<NotaryOffice>(NOTARY_OFFICES[0]);

  // Grantor State
  const [grantor, setGrantor] = useState<PartyGrantor>({
    fullName: vehicle?.seller.name || 'Məmmədov Rəşad İlham oğlu',
    fin: '5K9P32A',
    idCardSeriesNumber: 'AZE 19482910',
    phone: vehicle?.seller.phone || '+994 (50) 211-44-55',
    address: 'Bakı şəhəri, Nəsimi rayonu, Nizami küç. 42',
  });

  // Grantee State
  const [grantee, setGrantee] = useState<PartyGrantee>({
    fullName: 'Məmmədov Nicat Rəşad oğlu',
    fin: '7B4L81C',
    idCardSeriesNumber: 'AZE 22391048',
    driverLicenseSeriesNumber: 'BS 884912',
    driverLicenseCategories: ['B'],
    phone: '+994 (55) 789-22-11',
    address: 'Bakı şəhəri, Nəsimi rayonu, Nizami küç. 42',
  });

  // Active records in state (allowing revocations)
  const [records, setRecords] = useState<PowerOfAttorneyRecord[]>(MOCK_ACTIVE_POA_RECORDS);

  // Derived calculations
  const fees = useMemo(() => {
    return calculatePoaFees(scope, relationship, currency);
  }, [scope, relationship, currency]);

  const issuedDateStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const expiryDateStr = useMemo(() => {
    return calculateExpiryDate(issuedDateStr, durationMonths);
  }, [issuedDateStr, durationMonths]);

  const grantorFinValidation = useMemo(() => validateFin(grantor.fin), [grantor.fin]);
  const granteeFinValidation = useMemo(() => validateFin(grantee.fin), [grantee.fin]);

  const vehicleInfo = useMemo(() => {
    return {
      plateNumber: vehicle?.plateNumber || '10-AA-100',
      texpasportNumber: 'AA 928341',
      vin: vehicle?.vin || 'WAUZZZF28MA049182',
      makeModel: vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.year})` : 'Audi A6 S-Line (2022)',
      year: vehicle?.year || 2022,
      engineVolumeCc: vehicle?.engineVolumeLiters ? Math.round(vehicle.engineVolumeLiters * 1000) : 1984,
      color: 'Qara Metalik',
    };
  }, [vehicle]);

  const currentRegistrationNumber = useMemo(() => generatePoaRegistrationNumber(88124), []);
  const currentSecurityHash = useMemo(() => {
    return generatePoaSecurityHash(grantor.fin, grantee.fin, vehicleInfo.plateNumber, currentRegistrationNumber);
  }, [grantor.fin, grantee.fin, vehicleInfo.plateNumber, currentRegistrationNumber]);

  // Current active draft as record
  const currentDraftRecord: PowerOfAttorneyRecord = useMemo(() => {
    return {
      id: 'current-draft-record',
      registrationNumber: currentRegistrationNumber,
      issuedDate: issuedDateStr,
      durationMonths,
      expiryDate: expiryDateStr,
      status: 'ACTIVE',
      scope,
      relationship,
      subDelegation,
      crossBorder,
      grantor,
      grantee,
      vehicle: vehicleInfo,
      notaryOffice: selectedNotaryOffice,
      fees,
      securityHash: currentSecurityHash,
      bdypSyncStatus: 'SYNCED',
    };
  }, [
    currentRegistrationNumber,
    issuedDateStr,
    durationMonths,
    expiryDateStr,
    scope,
    relationship,
    subDelegation,
    crossBorder,
    grantor,
    grantee,
    vehicleInfo,
    selectedNotaryOffice,
    fees,
    currentSecurityHash,
  ]);

  const formattedDocumentText = useMemo(() => {
    return formatPoaLegalDocument(currentDraftRecord, lang);
  }, [currentDraftRecord, lang]);

  const filteredRecords = useMemo(() => {
    return filterPoaRecords(records, searchQuery, statusFilter);
  }, [records, searchQuery, statusFilter]);

  if (!isOpen) return null;

  const handleApplyPreset = (presetId: string) => {
    const preset = POA_PERSONA_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setScope(preset.scope);
    setRelationship(preset.relationship);
    setDurationMonths(preset.durationMonths);
    setSubDelegation(preset.subDelegation);
    setCrossBorder(preset.crossBorder);
    setGrantor(preset.grantor);
    setGrantee(preset.grantee);
  };

  const handleCopyDocument = () => {
    navigator.clipboard.writeText(formattedDocumentText);
    setCopiedDoc(true);
    setTimeout(() => setCopiedDoc(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRevokeRecord = (id: string) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            status: 'REVOKED',
            bdypSyncStatus: 'REVOKED',
            revokedAt: new Date().toISOString(),
            revocationReason: revocationReason || 'Mülkiyyətçinin tələbi ilə xitam verilmişdir',
          };
        }
        return r;
      })
    );
    setSelectedRecordToRevoke(null);
    setRevocationReason('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      data-testid="poa-modal"
    >
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Elektron Notariat & Etibarnamə Sistemi
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Building2 className="w-3 h-3" />
                  Ədliyyə Nazirliyi & ASAN
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Nəqliyyat vasitəsinin idarəetmə və baş etibarnamələrinin dövlət reyestri və BDYP canlı inteqrasiyası
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            data-testid="poa-modal-close-btn"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-4 gap-1 overflow-x-auto flex-shrink-0">
          <button
            onClick={() => setActiveTab('calculator')}
            data-testid="tab-calculator"
            className={`px-3.5 py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'calculator'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Növ & Rüsum</span>
          </button>

          <button
            onClick={() => setActiveTab('parties')}
            data-testid="tab-parties"
            className={`px-3.5 py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'parties'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Tərəflərin Məlumatları</span>
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            data-testid="tab-telemetry"
            className={`px-3.5 py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'telemetry'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>BDYP Telemetriyası</span>
          </button>

          <button
            onClick={() => setActiveTab('document')}
            data-testid="tab-document"
            className={`px-3.5 py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'document'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Elektron Sənəd (QR)</span>
          </button>

          <button
            onClick={() => setActiveTab('active_registry')}
            data-testid="tab-active-registry"
            className={`px-3.5 py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'active_registry'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Aktiv Reyestr ({records.filter((r) => r.status === 'ACTIVE' || r.status === 'EXPIRING_SOON').length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* TAB 1: CALCULATOR & SCOPE */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              {/* Target Vehicle Banner */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Etibarnamə Verilən Nəqliyyat Vasitəsi</div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{vehicleInfo.makeModel}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-xs font-mono text-cyan-300 border border-cyan-500/30">
                        {vehicleInfo.plateNumber}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-400">
                  VIN: <span className="font-mono text-slate-300">{vehicleInfo.vin}</span>
                </div>
              </div>

              {/* Scope Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  1. Səlahiyyətin Növü (Etibarnamə Forması)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setScope('DRIVING_ONLY')}
                    data-testid="scope-driving-only"
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      scope === 'DRIVING_ONLY'
                        ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-white">Yalnız İdarəetmə Hüququ</span>
                      {scope === 'DRIVING_ONLY' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Nəqliyyat vasitəsini sürmək və yol hərəkətində idarə etmək səlahiyyəti. Alqı-satqı və ya girov hüququ vermir.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScope('FULL_DISPOSAL')}
                    data-testid="scope-full-disposal"
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      scope === 'FULL_DISPOSAL'
                        ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-white">Baş Etibarnamə (Tam Sərəncam)</span>
                      {scope === 'FULL_DISPOSAL' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Nəqliyyat vasitəsini satmaq, bağışlamaq, girov qoymaq, icarəyə vermək və qeydiyyatdan çıxarmaq hüququ ilə.
                    </p>
                  </button>
                </div>
              </div>

              {/* Relationship Tier Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  2. Qohumluq Əlaqəsi (Dövlət Rüsumu Güzəşti)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRelationship('CLOSE_RELATIVE')}
                    data-testid="rel-close-relative"
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      relationship === 'CLOSE_RELATIVE'
                        ? 'bg-emerald-950/30 border-emerald-500 text-white'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-sm text-emerald-400">Yaxın Qohum (Güzəştli Rüsum)</div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {scope === 'DRIVING_ONLY' ? '5 AZN rüsum' : '15 AZN rüsum'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Ər-arvad, valideynlər, övladlar, qardaşlar, bacılar, baba və nənələr.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRelationship('THIRD_PARTY')}
                    data-testid="rel-third-party"
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      relationship === 'THIRD_PARTY'
                        ? 'bg-indigo-950/30 border-indigo-500 text-white'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-sm text-indigo-400">Kənar Şəxs / Digər Şəxslər</div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {scope === 'DRIVING_ONLY' ? '20 AZN rüsum' : '40 AZN rüsum'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Qohumluq əlaqəsi olmayan şəxslər, dostlar, şirkət sürücüləri və alıcılar.
                    </p>
                  </button>
                </div>
              </div>

              {/* Duration Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    3. Etibarlılıq Müddəti (Mülki Məcəllə maddə 363)
                  </label>
                  <span className="text-xs text-indigo-400 font-medium">
                    Bitmə tarixi: <strong className="text-white">{expiryDateStr}</strong>
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {([1, 3, 6, 12, 24, 36] as PoaDurationMonths[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDurationMonths(m)}
                      data-testid={`duration-${m}m`}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                        durationMonths === m
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                          : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {m === 12 ? '1 İl' : m === 24 ? '2 İl' : m === 36 ? '3 İl (Maks)' : `${m} Ay`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Rights / Endorsements */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  4. Əlavə Hüquqlar və Sərhəd Rejimi
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={subDelegation === 'ALLOWED'}
                      onChange={(e) => setSubDelegation(e.target.checked ? 'ALLOWED' : 'NOT_ALLOWED')}
                      data-testid="subdelegation-toggle"
                      className="mt-1 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-800"
                    />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Sub-etibarnamə (Başqasına etibar etmək)</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Müvəkkilə səlahiyyəti başqa bir şəxsə ötürmək imkanı verir.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={crossBorder === 'CROSS_BORDER_ALLOWED'}
                      onChange={(e) => setCrossBorder(e.target.checked ? 'CROSS_BORDER_ALLOWED' : 'DOMESTIC_ONLY')}
                      data-testid="crossborder-toggle"
                      className="mt-1 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-800"
                    />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Ölkədən Kənara Çıxarmaq Hüququ (DSX)</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Nəqliyyat vasitəsi ilə Azərbaycan sərhədindən kənara çıxışa icazə.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Notary Office Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  5. Təsdiq Edici Dövlət Notariat Kontoru / ASAN Notariat
                </label>
                <select
                  value={selectedNotaryOffice.id}
                  onChange={(e) => {
                    const found = NOTARY_OFFICES.find((n) => n.id === e.target.value);
                    if (found) setSelectedNotaryOffice(found);
                  }}
                  data-testid="notary-office-select"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                >
                  {NOTARY_OFFICES.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name} — {n.notaryName} ({n.district})
                    </option>
                  ))}
                </select>
              </div>

              {/* Statutory Fee Breakdown Summary Card */}
              <div
                className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/30 space-y-4"
                data-testid="poa-fee-card"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-bold text-white text-sm sm:text-base">
                      Dövlət Rüsumu & Notariat Xidmət Haqqı
                    </h3>
                  </div>
                  <span className="text-[11px] text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                    «Dövlət rüsumu haqqında» Qanun, m. 26
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-slate-400">Dövlət Rüsumu</div>
                    <div className="text-lg font-bold text-white mt-0.5">
                      {formatPrice(fees.stateDutyAzn, currency)}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {relationship === 'CLOSE_RELATIVE' ? 'Yaxın qohum güzəşti' : 'Standart tarif'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-slate-400">Notariat Tərtibat Xidməti</div>
                    <div className="text-lg font-bold text-white mt-0.5">
                      {formatPrice(fees.notaryServiceFeeAzn, currency)}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Hüquqi yardım və yoxlanış
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-slate-400">Elektron Sistem & ASAN</div>
                    <div className="text-lg font-bold text-white mt-0.5">
                      {formatPrice(fees.asanElectronicFeeAzn, currency)}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Vahid reyestr və BDYP ötürülməsi
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-xs text-slate-400">Yekun Ödəniş Məbləği:</span>
                    <div className="text-xs text-emerald-400 font-medium">
                      Bank və ya HÖP / AsanPay vasitəsilə
                    </div>
                  </div>
                  <div className="text-2xl font-black text-indigo-400" data-testid="poa-total-fee">
                    {formatPrice(fees.totalAzn, currency)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PARTIES & VERIFICATION */}
          {activeTab === 'parties' && (
            <div className="space-y-6">
              {/* Presets Quick Load Bar */}
              <div>
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Nümunə Persona ilə Tez Doldurma</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                  {POA_PERSONA_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPreset(preset.id)}
                      data-testid={`preset-btn-${preset.id}`}
                      className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors cursor-pointer group"
                    >
                      <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {preset.label}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {preset.grantee.fullName}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Grantor Section */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <h3 className="font-bold text-white text-sm">
                      Etibarnamə Verən Şəxs (Nəqliyyat Vasitəsinin Mülkiyyətçisi)
                    </h3>
                  </div>
                  {grantorFinValidation.isValid ? (
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1 font-semibold">
                      <Check className="w-3 h-3" /> FİN Təsdiqləndi
                    </span>
                  ) : (
                    <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30 flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-3 h-3" /> {grantorFinValidation.error}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Adı, Soyadı, Ata adı *
                    </label>
                    <input
                      type="text"
                      value={grantor.fullName}
                      onChange={(e) => setGrantor({ ...grantor, fullName: e.target.value })}
                      data-testid="grantor-fullname-input"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      FİN Kod (7 simvol) *
                    </label>
                    <input
                      type="text"
                      maxLength={7}
                      value={grantor.fin}
                      onChange={(e) => setGrantor({ ...grantor, fin: e.target.value.toUpperCase() })}
                      data-testid="grantor-fin-input"
                      className={`w-full px-3 py-2 rounded-xl bg-slate-900 border text-white font-mono text-xs focus:outline-none ${
                        grantorFinValidation.isValid
                          ? 'border-emerald-500/60 focus:border-emerald-500'
                          : 'border-rose-500/60 focus:border-rose-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Şəxsiyyət Vəsiqəsi Seriya/Nömrə
                    </label>
                    <input
                      type="text"
                      value={grantor.idCardSeriesNumber}
                      onChange={(e) => setGrantor({ ...grantor, idCardSeriesNumber: e.target.value })}
                      data-testid="grantor-id-input"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Telefon Nömrəsi
                    </label>
                    <input
                      type="text"
                      value={grantor.phone}
                      onChange={(e) => setGrantor({ ...grantor, phone: e.target.value })}
                      data-testid="grantor-phone-input"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Qeydiyyatda Olduğu Ünvan
                    </label>
                    <input
                      type="text"
                      value={grantor.address}
                      onChange={(e) => setGrantor({ ...grantor, address: e.target.value })}
                      data-testid="grantor-address-input"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Grantee Section */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <h3 className="font-bold text-white text-sm">
                      Müvəkkil (Səlahiyyət Verilən Şəxs / Sürücü)
                    </h3>
                  </div>
                  {granteeFinValidation.isValid ? (
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1 font-semibold">
                      <Check className="w-3 h-3" /> FİN Təsdiqləndi
                    </span>
                  ) : (
                    <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30 flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-3 h-3" /> {granteeFinValidation.error}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Adı, Soyadı, Ata adı *
                    </label>
                    <input
                      type="text"
                      value={grantee.fullName}
                      onChange={(e) => setGrantee({ ...grantee, fullName: e.target.value })}
                      data-testid="grantee-fullname-input"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      FİN Kod (7 simvol) *
                    </label>
                    <input
                      type="text"
                      maxLength={7}
                      value={grantee.fin}
                      onChange={(e) => setGrantee({ ...grantee, fin: e.target.value.toUpperCase() })}
                      data-testid="grantee-fin-input"
                      className={`w-full px-3 py-2 rounded-xl bg-slate-900 border text-white font-mono text-xs focus:outline-none ${
                        granteeFinValidation.isValid
                          ? 'border-emerald-500/60 focus:border-emerald-500'
                          : 'border-rose-500/60 focus:border-rose-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Sürücülük Vəsiqəsi Nömrəsi
                    </label>
                    <input
                      type="text"
                      value={grantee.driverLicenseSeriesNumber}
                      onChange={(e) => setGrantee({ ...grantee, driverLicenseSeriesNumber: e.target.value })}
                      data-testid="grantee-license-input"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Əlaqə Telefonu
                    </label>
                    <input
                      type="text"
                      value={grantee.phone}
                      onChange={(e) => setGrantee({ ...grantee, phone: e.target.value })}
                      data-testid="grantee-phone-input"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Yaşayış Ünvanı
                    </label>
                    <input
                      type="text"
                      value={grantee.address}
                      onChange={(e) => setGrantee({ ...grantee, address: e.target.value })}
                      data-testid="grantee-address-input"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TELEMETRY & BDYP INTEGRATION */}
          {activeTab === 'telemetry' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-pulse">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">
                      DİN BDYP Mərkəzi Serveri ilə Canlı İnteqrasiya
                    </div>
                    <div className="text-xs text-emerald-300">
                      Protokol statusu: Qeydiyyat nömrəsi dərhal aktivləşdirilmişdir
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ONLINE • SYNCED
                </span>
              </div>

              {/* Status Checks Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                    <Car className="w-4 h-4" />
                    <span>YPX Patrul & MMX Radarlar</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Yol Patrul Xidməti əməkdaşları planşet vasitəsilə avtomobilin dövlət qeydiyyat nişanını ({vehicleInfo.plateNumber}) oxutduqda elektron etibarnamə dərhal təsdiqlənir.
                  </p>
                  <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 pt-1">
                    <Check className="w-3.5 h-3.5" /> Fiziki kağız daşımağa ehtiyac yoxdur (İXM m. 332)
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                    <Compass className="w-4 h-4" />
                    <span>Dövlət Sərhəd Xidməti (DSX)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {crossBorder === 'CROSS_BORDER_ALLOWED'
                      ? 'Nəqliyyat vasitəsinin Azərbaycan Respublikasının dövlət sərhədindən buraxılış məntəqələrində çıxarılmasına rəsmi icazə təsdiqlənib.'
                      : 'Avtomobilin yalnız ölkə daxilində idarə olunmasına icazə verilib. Sərhəddən çıxış bloklanıb.'}
                  </p>
                  <div
                    className={`text-[11px] font-semibold flex items-center gap-1 pt-1 ${
                      crossBorder === 'CROSS_BORDER_ALLOWED' ? 'text-cyan-400' : 'text-slate-400'
                    }`}
                  >
                    {crossBorder === 'CROSS_BORDER_ALLOWED' ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Sərhəd keçid icazəsi aktivdir
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Yalnız daxili istifadə
                      </>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <Scale className="w-4 h-4" />
                    <span>Məhkəmə və İcra Reyestri</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Avtomobil və ya mülkiyyətçi üzərində heç bir həbs, axtarış və ya icra qadağası qeydə alınmayıb. Etibarnamə qanuni qüvvədədir.
                  </p>
                  <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 pt-1">
                    <Check className="w-3.5 h-3.5" /> Məhdudiyyət yoxdur (Təmiz reyestr)
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                    <QrCode className="w-4 h-4" />
                    <span>SİMA & ASAN İmza Təsdiqi</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Rəqəmsal imzalanmış sertifikatın unikal yoxlama heşi: <span className="font-mono text-purple-300">{currentSecurityHash}</span>
                  </p>
                  <div className="text-[11px] text-purple-400 font-semibold flex items-center gap-1 pt-1">
                    <Check className="w-3.5 h-3.5" /> Kriptoqrafik təhlükəsizlik möhürü aktivdir
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OFFICIAL DOCUMENT & QR */}
          {activeTab === 'document' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                <div className="text-xs text-slate-300">
                  Rəsmi Qeydiyyat Nömrəsi:{' '}
                  <strong className="text-indigo-400 font-mono text-sm">{currentRegistrationNumber}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyDocument}
                    data-testid="copy-document-btn"
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedDoc ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedDoc ? 'Kopyalandı' : 'Sənədi Kopyala'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    data-testid="print-document-btn"
                    className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Çap et</span>
                  </button>
                </div>
              </div>

              {/* Official Stylized Legal Document */}
              <div
                className="p-6 rounded-2xl bg-white text-slate-900 shadow-xl border border-slate-200 font-serif relative overflow-hidden"
                data-testid="official-poa-document"
              >
                {/* Watermark seal */}
                <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none select-none">
                  <Building2 className="w-72 h-72 text-slate-900" />
                </div>

                {/* Header */}
                <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-700">
                    Azərbaycan Respublikası Ədliyyə Nazirliyi
                  </div>
                  <div className="text-base sm:text-lg font-black uppercase tracking-wide text-slate-900 mt-1">
                    Elektron Notariat Vahid İnformasiya Sistemi
                  </div>
                  <div className="text-xs font-bold text-indigo-900 mt-1">
                    RƏSMİ ELEKTRON ETİBARNAMƏ № {currentRegistrationNumber}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Tərtib tarixi: {issuedDateStr} | Qüvvədə olma müddəti: {expiryDateStr} ({durationMonths} ay)
                  </div>
                </div>

                {/* Document Body */}
                <div className="space-y-4 text-xs leading-relaxed text-slate-800">
                  <div className="p-2.5 rounded bg-slate-100 border border-slate-300">
                    <strong className="text-slate-900">Təsdiq edən notariat orqanı: </strong>
                    <span>
                      {selectedNotaryOffice.name} (Notarius: {selectedNotaryOffice.notaryName})
                    </span>
                  </div>

                  <p>
                    <strong>Mən, etibarnamə verən şəxs: </strong>
                    <span className="underline decoration-slate-400 font-semibold">{grantor.fullName}</span>, FİN: <code className="bg-slate-100 px-1 font-mono">{grantor.fin}</code>, Ş.V: {grantor.idCardSeriesNumber}, Ünvan: {grantor.address}.
                  </p>

                  <p>
                    Mənə məxsus <strong className="underline">{vehicleInfo.makeModel}</strong> markalı,{' '}
                    <strong>{vehicleInfo.year}</strong>-ci il buraxılışlı, dövlət qeydiyyat nişanı{' '}
                    <strong className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-900 border border-slate-300">
                      {vehicleInfo.plateNumber}
                    </strong>
                    , texpasport: {vehicleInfo.texpasportNumber}, VIN: <code className="font-mono text-[11px]">{vehicleInfo.vin}</code> olan nəqliyyat vasitəsi üçün;
                  </p>

                  <div className="p-3 rounded-lg border-2 border-indigo-900/40 bg-indigo-50/50 space-y-1">
                    <div className="font-bold text-slate-900 text-sm">
                      SƏLAHİYYƏT VERİRƏM MÜVƏKKİLƏ:
                    </div>
                    <div className="text-slate-900 font-bold text-sm">
                      {grantee.fullName} (FİN: {grantee.fin})
                    </div>
                    <div className="text-[11px] text-slate-700">
                      Sürücülük vəsiqəsi: {grantee.driverLicenseSeriesNumber} | Tel: {grantee.phone} | Ünvan: {grantee.address}
                    </div>
                  </div>

                  <div>
                    <strong className="text-slate-900">Səlahiyyətin dairəsi: </strong>
                    <span>
                      {scope === 'FULL_DISPOSAL'
                        ? 'Baş etibarnamə: nəqliyyat vasitəsinə sərəncam vermək, satmaq, bağışlamaq, girov qoymaq, icarəyə vermək, texniki baxışdan keçirmək və BDYP orqanlarında tam təmsil etmək hüququ ilə.'
                        : 'Yalnız nəqliyyat vasitəsini Azərbaycan Respublikası daxilində idarə etmək və yol hərəkətində sürmək hüququ ilə.'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                    <div>
                      <strong>Sub-etibarnamə hüququ: </strong>
                      <span>{subDelegation === 'ALLOWED' ? 'Verilir (başqasına etibar edilə bilər)' : 'Verilmir'}</span>
                    </div>
                    <div>
                      <strong>Sərhəd keçid hüququ: </strong>
                      <span>{crossBorder === 'CROSS_BORDER_ALLOWED' ? 'Azərbaycan hüdudlarından kənara çıxışa icazə verilir' : 'Yalnız AR ərazisində'}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-300">
                    Azərbaycan Respublikasının Mülki Məcəlləsinin 362-368-ci maddələri və «Notariat haqqında» Qanunu izah edilmişdir. İnzibati Xətalar Məcəlləsinin 332-ci maddəsinə əsasən Baş Dövlət Yol Polisi İdarəsinin (BDYP) mərkəzi elektron bazasına inteqrasiya olunmuşdur. Fiziki kağız nüsxənin daşınması tələb olunmur.
                  </p>
                </div>

                {/* Footer Stamp & QR */}
                <div className="mt-6 pt-4 border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 p-1 rounded-lg border-2 border-slate-900 flex items-center justify-center bg-slate-50">
                      <QrCode className="w-12 h-12 text-slate-900" />
                    </div>
                    <div className="text-[11px]">
                      <div className="font-bold text-slate-900">RƏQƏMSAL TƏSDİQ</div>
                      <div className="text-slate-600 font-mono text-[10px]">Hash: {currentSecurityHash}</div>
                      <div className="text-emerald-700 font-bold text-[10px]">SİMA / ASAN İmza ilə təsdiqlənmişdir</div>
                    </div>
                  </div>

                  <div className="text-center sm:text-right text-[11px]">
                    <div className="font-bold text-slate-900">Dövlət Notariusu: {selectedNotaryOffice.notaryName}</div>
                    <div className="text-slate-600">Dövlət reyestr qeydiyyatı təsdiq edildi</div>
                    <div className="text-indigo-800 font-mono text-[10px]">{currentRegistrationNumber}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ACTIVE REGISTRY & REVOCATION */}
          {activeTab === 'active_registry' && (
            <div className="space-y-4">
              {/* Search & Filter Toolbar */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Qeydiyyat nömrəsi, nömrə nişanı, ad və ya FİN axtarın..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="registry-search-input"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  data-testid="registry-status-filter"
                  className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">Bütün Statuslar</option>
                  <option value="ACTIVE">Qüvvədədir (Aktiv)</option>
                  <option value="EXPIRING_SOON">Müddəti Bitir (30 gün)</option>
                  <option value="EXPIRED">Vaxtı Keçib</option>
                  <option value="REVOKED">Xitam Verilib (Ləğv)</option>
                </select>
              </div>

              {/* Records List */}
              <div className="space-y-3" data-testid="poa-records-list">
                {filteredRecords.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    Heç bir etibarnamə qeydi tapılmadı.
                  </div>
                ) : (
                  filteredRecords.map((rec) => {
                    const daysInfo = calculateRemainingPoaDays(rec.expiryDate);
                    return (
                      <div
                        key={rec.id}
                        data-testid={`poa-record-item-${rec.id}`}
                        className={`p-4 rounded-xl border transition-all ${
                          rec.status === 'REVOKED'
                            ? 'bg-rose-950/20 border-rose-900/40 text-slate-400'
                            : rec.status === 'EXPIRED'
                            ? 'bg-slate-800/30 border-slate-700/40 text-slate-400'
                            : rec.status === 'EXPIRING_SOON'
                            ? 'bg-amber-950/20 border-amber-500/40 text-slate-200'
                            : 'bg-slate-800/60 border-slate-700/70 text-slate-200'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/40 pb-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-indigo-400">
                              {rec.registrationNumber}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="font-bold text-xs text-white">
                              {rec.vehicle.makeModel}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-900 text-xs font-mono text-cyan-300 border border-slate-700">
                              {rec.vehicle.plateNumber}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {rec.status === 'ACTIVE' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {daysInfo.daysRemaining} gün qalıb
                              </span>
                            )}
                            {rec.status === 'EXPIRING_SOON' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Müddət bitir ({daysInfo.daysRemaining} gün)
                              </span>
                            )}
                            {rec.status === 'EXPIRED' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-400">
                                Vaxtı Keçib
                              </span>
                            )}
                            {rec.status === 'REVOKED' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3" />
                                Xitam Verilib
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-slate-400">Mülkiyyətçi: </span>
                            <span className="text-white font-medium">{rec.grantor.fullName}</span>{' '}
                            <span className="text-slate-400 font-mono text-[10px]">({rec.grantor.fin})</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Müvəkkil: </span>
                            <span className="text-white font-medium">{rec.grantee.fullName}</span>{' '}
                            <span className="text-slate-400 font-mono text-[10px]">({rec.grantee.fin})</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Etibarlılıq: </span>
                            <span className="text-slate-300">
                              {rec.issuedDate} — {rec.expiryDate} ({rec.durationMonths} ay)
                            </span>
                          </div>
                        </div>

                        {rec.revokedAt && (
                          <div className="mt-2 text-[11px] text-rose-400 bg-rose-950/30 p-2 rounded border border-rose-900/30 flex items-center justify-between">
                            <span>Ləğv səbəbi: {rec.revocationReason || 'Mülkiyyətçinin tələbi ilə'}</span>
                            <span className="font-mono text-[10px] text-rose-300">
                              BDYP Qara Siyahı İnteqrasiyası: AKTİV
                            </span>
                          </div>
                        )}

                        {rec.status !== 'REVOKED' && rec.status !== 'EXPIRED' && (
                          <div className="mt-3 pt-2 border-t border-slate-700/40 flex items-center justify-end">
                            {selectedRecordToRevoke === rec.id ? (
                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                <input
                                  type="text"
                                  placeholder="Xitam səbəbi (məs. Avtomobil satıldı)..."
                                  value={revocationReason}
                                  onChange={(e) => setRevocationReason(e.target.value)}
                                  data-testid="revocation-reason-input"
                                  className="px-2.5 py-1 text-xs rounded bg-slate-900 border border-slate-700 text-white flex-1 sm:w-64"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRevokeRecord(rec.id)}
                                  data-testid={`confirm-revoke-btn-${rec.id}`}
                                  className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer"
                                >
                                  Təsdiq et
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSelectedRecordToRevoke(null)}
                                  className="px-2 py-1 text-xs text-slate-400 hover:text-white"
                                >
                                  Ləğv
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setSelectedRecordToRevoke(rec.id)}
                                data-testid={`open-revoke-btn-${rec.id}`}
                                className="px-3 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <ShieldAlert className="w-3.5 h-3.5" />
                                <span>Etibarnaməyə Dərhal Xitam Ver</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span>AR Ədliyyə Nazirliyi Elektron Notariat Portalı • BDYP DİN İnteqrasiyası</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {activeTab !== 'document' ? (
              <button
                type="button"
                onClick={() => setActiveTab('document')}
                data-testid="footer-view-document-btn"
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <FileSignature className="w-4 h-4" />
                <span>Elektron Sənədi Göstər (QR)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCopyDocument}
                data-testid="footer-copy-btn"
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copiedDoc ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedDoc ? 'Kopyalandı' : 'Sənədi Kopyala'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              data-testid="footer-close-btn"
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Bağla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

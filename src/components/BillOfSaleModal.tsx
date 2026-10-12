import React, { useState, useMemo } from 'react';
import { Vehicle, Language, Currency } from '../types/vehicle';
import {
  ContractFormData,
  ContractRelationship,
  PaymentMethod,
} from '../types/contract';
import {
  calculateNotaryAndClosingFees,
  validateContractForm,
  buildVehicleInitialContractData,
  generateLegalContractDocument,
  formatPlateNumber,
  formatFinCode,
} from '../utils/contract';
import { NOTARY_OFFICES, CONTRACT_PRESETS } from '../data/mockContractPresets';
import { formatPrice } from '../utils/i18n';
import {
  X,
  FileText,
  Printer,
  Copy,
  Check,
  Scale,
  ShieldCheck,
  Car,
  User,
  CreditCard,
  Building,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Users,
  Calendar,
  Percent,
  BadgePercent,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock';
import { useKeyPress } from '../hooks/useKeyPress';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { toastManager } from '../hooks/useToast';

export interface BillOfSaleModalProps {
  isOpen?: boolean;
  vehicle?: Vehicle | null;
  initialVehicle?: Vehicle | null;
  currency?: Currency;
  lang: Language;
  onClose: () => void;
}

type TabType = 'form' | 'costs' | 'document';

export const BillOfSaleModal: React.FC<BillOfSaleModalProps> = ({
  isOpen = true,
  vehicle,
  initialVehicle,
  currency = 'AZN',
  lang,
  onClose,
}) => {
  const activeVehicle = vehicle || initialVehicle || null;

  // Initialize form state
  const [formData, setFormData] = useState<ContractFormData>(() =>
    buildVehicleInitialContractData(activeVehicle)
  );

  const [activeTab, setActiveTab] = useState<TabType>('form');
  const [previewLang, setPreviewLang] = useState<'az' | 'en'>('az');

  useScrollLock(isOpen);
  useKeyPress('Escape', onClose);
  const [copiedDoc, copyDocText] = useCopyToClipboard();
  const [isCopied, setIsCopied] = useState(false);

  // Closing costs calculation
  const closingCosts = useMemo(() => {
    return calculateNotaryAndClosingFees({
      engineVolumeLiters: formData.vehicle.engineVolumeLiters,
      relationship: formData.metadata.relationship,
      retainPlate: formData.metadata.retainPlate,
    });
  }, [
    formData.vehicle.engineVolumeLiters,
    formData.metadata.relationship,
    formData.metadata.retainPlate,
  ]);

  // Form validation & completeness
  const validation = useMemo(() => {
    return validateContractForm(formData);
  }, [formData]);

  // Generated document text
  const legalDoc = useMemo(() => {
    return generateLegalContractDocument(formData);
  }, [formData]);

  if (!isOpen) return null;

  // Update handlers
  const handleUpdateSeller = (key: keyof typeof formData.seller, value: any) => {
    setFormData((prev) => ({
      ...prev,
      seller: { ...prev.seller, [key]: value },
    }));
  };

  const handleUpdateBuyer = (key: keyof typeof formData.buyer, value: any) => {
    setFormData((prev) => ({
      ...prev,
      buyer: { ...prev.buyer, [key]: value },
    }));
  };

  const handleUpdateVehicle = (key: keyof typeof formData.vehicle, value: any) => {
    setFormData((prev) => ({
      ...prev,
      vehicle: { ...prev.vehicle, [key]: value },
    }));
  };

  const handleUpdateFinancials = (key: keyof typeof formData.financials, value: any) => {
    setFormData((prev) => ({
      ...prev,
      financials: { ...prev.financials, [key]: value },
    }));
  };

  const handleUpdateMetadata = (key: keyof typeof formData.metadata, value: any) => {
    setFormData((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, [key]: value },
    }));
  };

  const applyPreset = (presetId: string) => {
    const found = CONTRACT_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setFormData(found.data);
      toastManager.add(
        lang === 'az'
          ? `«${found.titleAz}» şablonu tətbiq edildi`
          : `Preset '${found.titleEn}' applied`,
        'info'
      );
    }
  };

  const handleCopyDocument = async () => {
    const textToCopy = previewLang === 'az' ? legalDoc.azText : legalDoc.enText;
    const ok = await copyDocText(textToCopy);
    if (ok) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toastManager.add(
        lang === 'az'
          ? 'Rəsmi müqavilə mətni mübadilə buferinə kopyalandı!'
          : 'Official contract text copied to clipboard!',
        'success'
      );
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="bill-of-sale-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/60 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  {lang === 'az'
                    ? 'Notariat Alqı-Satqı Müqaviləsi Generatoru'
                    : 'Bilingual Vehicle Bill of Sale & Contract Generator'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  AR Ədliyyə / Notariat
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {lang === 'az'
                  ? 'Azərbaycan Respublikası Mülki Məcəlləsinə tam uyğun rəsmi avtomobil alqı-satqı müqaviləsi və dövlət rüsumları'
                  : 'Official bilingual motor vehicle purchase agreement adhering to Azerbaijan civil legislation & notary tariffs'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            data-testid="close-contract-modal-btn"
            aria-label="Close modal"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/40 px-6 py-2.5 flex-shrink-0 overflow-x-auto gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="tab-form"
              onClick={() => setActiveTab('form')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'form'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{lang === 'az' ? 'Müqavilə Parametrləri' : 'Agreement Setup'}</span>
            </button>

            <button
              type="button"
              data-testid="tab-costs"
              onClick={() => setActiveTab('costs')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'costs'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>{lang === 'az' ? 'Rəsmi Rüsumlar & Xərclər' : 'Notary & Police Duties'}</span>
              <span className="px-1.5 py-0.2 rounded-md bg-slate-800 text-[10px] text-blue-300 font-mono">
                {closingCosts.grandTotalAzn} AZN
              </span>
            </button>

            <button
              type="button"
              data-testid="tab-document"
              onClick={() => setActiveTab('document')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'document'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{lang === 'az' ? 'Müqavilə Sənədi' : 'Legal Document'}</span>
            </button>
          </div>

          {/* Completeness Badge */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 hidden sm:inline">Doldurulma səviyyəsi:</span>
            <div className="w-20 bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  validation.isValid ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${validation.completenessScore}%` }}
              />
            </div>
            <span
              className={`font-mono font-bold text-xs ${
                validation.isValid ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {validation.completenessScore}%
            </span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: FORM PARAMETERS */}
          {activeTab === 'form' && (
            <div className="space-y-6">
              {/* Preset Selector */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {lang === 'az' ? 'Hazır Müqavilə Şablonları:' : 'Pre-configured Contract Scenarios:'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {lang === 'az' ? 'Klikləyərək formanı avtomatik doldurun' : 'Click to autofill form'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {CONTRACT_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      data-testid={`preset-btn-${p.id}`}
                      onClick={() => applyPreset(p.id)}
                      className="p-2.5 text-left rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all cursor-pointer group"
                    >
                      <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                        {lang === 'az' ? p.titleAz : p.titleEn}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {lang === 'az' ? p.descriptionAz : p.descriptionEn}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notary Office & Meta Selection */}
              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-400" />
                  <span>{lang === 'az' ? 'Notariat Kontoru və Reyestr Məlumatları' : 'Notary Office & Registry Metadata'}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      {lang === 'az' ? 'Notariat Kontoru' : 'Notary Office'}
                    </label>
                    <select
                      value={formData.metadata.notaryOfficeId}
                      onChange={(e) => {
                        const office = NOTARY_OFFICES.find((n) => n.id === e.target.value);
                        if (office) {
                          setFormData((prev) => ({
                            ...prev,
                            metadata: {
                              ...prev.metadata,
                              notaryOfficeId: office.id,
                              notaryName: office.notaryName,
                            },
                          }));
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    >
                      {NOTARY_OFFICES.map((n) => (
                        <option key={n.id} value={n.id}>
                          {lang === 'az' ? n.nameAz : n.nameEn} ({n.notaryName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      {lang === 'az' ? 'Reyestr №' : 'Registry Record No'}
                    </label>
                    <input
                      type="text"
                      value={formData.metadata.registryNumber}
                      onChange={(e) => handleUpdateMetadata('registryNumber', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      {lang === 'az' ? 'Müqavilə Tarixi' : 'Execution Date'}
                    </label>
                    <input
                      type="date"
                      value={formData.metadata.date}
                      onChange={(e) => handleUpdateMetadata('date', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Parties Grid (Seller and Buyer) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. SELLER FORM */}
                <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-400" />
                      <span>{lang === 'az' ? '1. SATICI MƏLUMATLARI' : '1. SELLER PARTICULARS'}</span>
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {formData.seller.isIndividual ? 'Fərdi Şəxs' : 'MMC / Diler'}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">
                        {lang === 'az' ? 'Ad, Soyad, Ata adı (A.S.A.)' : 'Full Legal Name'}
                      </label>
                      <input
                        type="text"
                        data-testid="seller-name-input"
                        value={formData.seller.fullName}
                        onChange={(e) => handleUpdateSeller('fullName', e.target.value)}
                        placeholder="Məsələn: Quliyev Rəşad İlham oğlu"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Ş/V Seriya</label>
                        <select
                          value={formData.seller.idSeries}
                          onChange={(e) => handleUpdateSeller('idSeries', e.target.value)}
                          className="w-full px-2 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                        >
                          <option value="AZE">AZE</option>
                          <option value="AA">AA</option>
                          <option value="MYI">MYI</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Vəsiqə №</label>
                        <input
                          type="text"
                          value={formData.seller.idNumber}
                          onChange={(e) => handleUpdateSeller('idNumber', e.target.value)}
                          placeholder="18492041"
                          className="w-full px-2 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">FİN Kod (7 rəqəm)</label>
                        <input
                          type="text"
                          maxLength={7}
                          value={formData.seller.finCode}
                          onChange={(e) =>
                            handleUpdateSeller('finCode', formatFinCode(e.target.value))
                          }
                          placeholder="6JK9L2P"
                          className="w-full px-2 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono uppercase"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">
                        {lang === 'az' ? 'Qeydiyyatda olduğu ünvan' : 'Registered Address'}
                      </label>
                      <input
                        type="text"
                        value={formData.seller.address}
                        onChange={(e) => handleUpdateSeller('address', e.target.value)}
                        placeholder="Bakı ş., Nəsimi r-nu, M.Əliyev küç. 44"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">
                        {lang === 'az' ? 'Əlaqə Telefonu' : 'Phone'}
                      </label>
                      <input
                        type="text"
                        value={formData.seller.phone}
                        onChange={(e) => handleUpdateSeller('phone', e.target.value)}
                        placeholder="+994 50 234 56 78"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. BUYER FORM */}
                <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-400" />
                      <span>{lang === 'az' ? '2. ALICI MƏLUMATLARI' : '2. BUYER PARTICULARS'}</span>
                    </h3>
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                      Fərdi Şəxs
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">
                        {lang === 'az' ? 'Ad, Soyad, Ata adı (A.S.A.)' : 'Full Legal Name'}
                      </label>
                      <input
                        type="text"
                        data-testid="buyer-name-input"
                        value={formData.buyer.fullName}
                        onChange={(e) => handleUpdateBuyer('fullName', e.target.value)}
                        placeholder="Məsələn: Əliyev Teymur Eldar oğlu"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Ş/V Seriya</label>
                        <select
                          value={formData.buyer.idSeries}
                          onChange={(e) => handleUpdateBuyer('idSeries', e.target.value)}
                          className="w-full px-2 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                        >
                          <option value="AZE">AZE</option>
                          <option value="AA">AA</option>
                          <option value="MYI">MYI</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Vəsiqə №</label>
                        <input
                          type="text"
                          value={formData.buyer.idNumber}
                          onChange={(e) => handleUpdateBuyer('idNumber', e.target.value)}
                          placeholder="29381045"
                          className="w-full px-2 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">FİN Kod (7 rəqəm)</label>
                        <input
                          type="text"
                          maxLength={7}
                          value={formData.buyer.finCode}
                          onChange={(e) =>
                            handleUpdateBuyer('finCode', formatFinCode(e.target.value))
                          }
                          placeholder="7MK4T1B"
                          className="w-full px-2 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono uppercase"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">
                        {lang === 'az' ? 'Qeydiyyatda olduğu ünvan' : 'Registered Address'}
                      </label>
                      <input
                        type="text"
                        value={formData.buyer.address}
                        onChange={(e) => handleUpdateBuyer('address', e.target.value)}
                        placeholder="Bakı ş., Xətai r-nu, Sarayevo küç. 19"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">
                        {lang === 'az' ? 'Əlaqə Telefonu' : 'Phone'}
                      </label>
                      <input
                        type="text"
                        value={formData.buyer.phone}
                        onChange={(e) => handleUpdateBuyer('phone', e.target.value)}
                        placeholder="+994 55 987 65 43"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Specifications Form */}
              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Car className="w-4 h-4 text-cyan-400" />
                  <span>{lang === 'az' ? '3. NƏQLİYYAT VASİTƏSİNİN PARAMETRLƏRİ' : '3. VEHICLE SPECIFICATIONS'}</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Marka</label>
                    <input
                      type="text"
                      value={formData.vehicle.make}
                      onChange={(e) => handleUpdateVehicle('make', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Model</label>
                    <input
                      type="text"
                      value={formData.vehicle.model}
                      onChange={(e) => handleUpdateVehicle('model', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Buraxılış İli</label>
                    <input
                      type="number"
                      value={formData.vehicle.year}
                      onChange={(e) => handleUpdateVehicle('year', Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Dövlət Nömrəsi</label>
                    <input
                      type="text"
                      value={formData.vehicle.plateNumber}
                      onChange={(e) =>
                        handleUpdateVehicle('plateNumber', formatPlateNumber(e.target.value))
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono uppercase"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-slate-400 font-semibold mb-1">VIN Şassi Kodu (17 simvol)</label>
                    <input
                      type="text"
                      maxLength={17}
                      value={formData.vehicle.vin}
                      onChange={(e) => handleUpdateVehicle('vin', e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Mühərrik Həcmi (L)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.vehicle.engineVolumeLiters}
                      onChange={(e) =>
                        handleUpdateVehicle('engineVolumeLiters', Number(e.target.value))
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Tex. Pasport №</label>
                    <input
                      type="text"
                      value={formData.vehicle.techPassportNumber}
                      onChange={(e) => handleUpdateVehicle('techPassportNumber', e.target.value)}
                      placeholder="948201"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Financial Terms Form */}
              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'az' ? '4. MALİYYƏ VƏ ÖDƏNİŞ ŞƏRTLƏRİ' : '4. FINANCIAL TERMS & PAYMENT METHOD'}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      {lang === 'az' ? 'Razılaşdırılmış Satış Qiyməti (AZN)' : 'Agreed Purchase Price (AZN)'}
                    </label>
                    <input
                      type="number"
                      data-testid="contract-price-input"
                      value={formData.financials.priceAzn}
                      onChange={(e) =>
                        handleUpdateFinancials('priceAzn', Math.max(0, Number(e.target.value)))
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      {lang === 'az' ? 'Ödənilmiş Beh / Avans (AZN)' : 'Deposit / Advance (AZN)'}
                    </label>
                    <input
                      type="number"
                      value={formData.financials.depositAzn}
                      onChange={(e) =>
                        handleUpdateFinancials('depositAzn', Math.max(0, Number(e.target.value)))
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      {lang === 'az' ? 'Ödəniş Üsulu' : 'Payment Method'}
                    </label>
                    <select
                      value={formData.financials.paymentMethod}
                      onChange={(e) =>
                        handleUpdateFinancials('paymentMethod', e.target.value as PaymentMethod)
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    >
                      <option value="bank_transfer">Bank Köçürməsi (Wire Transfer)</option>
                      <option value="escrow">Notariat Rəqəmsal Eskrou Depozit</option>
                      <option value="cash">Nağd Hesablaşma (Notarius qarşısında)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action bar */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('costs')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-lg shadow-blue-600/20 cursor-pointer"
                >
                  <span>{lang === 'az' ? 'Rüsumları Hesabla' : 'Calculate Closing Fees'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CLOSING FEES & NOTARY TARIFFS */}
          {activeTab === 'costs' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">
                    {lang === 'az' ? 'Dövlət Rüsumu (Notariat)' : 'Notary State Duty'}
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono">
                    {closingCosts.notaryDutyAzn} AZN
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {formData.metadata.relationship === 'close_relative'
                      ? 'Güzəştli dərəcə (30 AZN)'
                      : `${formData.vehicle.engineVolumeLiters}L mühərrik`}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">
                    {lang === 'az' ? 'Notariat Xidmət Haqqı' : 'Technical Notary Fee'}
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-blue-400 font-mono">
                    {closingCosts.notaryServiceFeeAzn} AZN
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">Sənədləşmə & rekvizit</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">
                    {lang === 'az' ? 'BDYPİ Qeydiyyat Rüsumları' : 'Police Registration'}
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                    {closingCosts.totalBdypiFeesAzn} AZN
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">Texposport + Nömrə</span>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/50 to-indigo-950/50 border border-blue-500/30">
                  <span className="text-[10px] uppercase text-blue-300 font-bold block mb-1">
                    {lang === 'az' ? 'Yekun Rəsmi Xərc' : 'Total Closing Cost'}
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                    {closingCosts.grandTotalAzn} AZN
                  </div>
                  <span className="text-[11px] text-emerald-300/80 mt-1 block">Bütün rüsumlar daxil</span>
                </div>
              </div>

              {/* Concession & Retention Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Relationship selector */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-400" />
                      {lang === 'az' ? 'Tərəflər Arasında Qohumluq Əlaqəsi' : 'Kinship Relationship'}
                    </span>
                    {closingCosts.relativeDiscountApplied && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {closingCosts.relativeSavingsAzn} AZN Qənaət
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      data-testid="relationship-unrelated-btn"
                      onClick={() => handleUpdateMetadata('relationship', 'unrelated')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        formData.metadata.relationship === 'unrelated'
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold">Digər Şəxslər</div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Standart dövlət rüsumu: 60 - 160 AZN
                      </p>
                    </button>

                    <button
                      type="button"
                      data-testid="relationship-relative-btn"
                      onClick={() => handleUpdateMetadata('relationship', 'close_relative')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        formData.metadata.relationship === 'close_relative'
                          ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-emerald-300">Yaxın Qohumlar</div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Güzəştli dövlət rüsumu: 30 AZN flat
                      </p>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    * «Dövlət rüsumu haqqında» AR Qanununa əsasən: valideynlər, uşaqlar, ər-arvad, bacı və qardaşlar arasında rüsum sabit 30 AZN təşkil edir.
                  </p>
                </div>

                {/* 2. License Plate Retention */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-cyan-400" />
                    {lang === 'az' ? 'Dövlət Qeydiyyat Nişanı (Nömrə) Seçimi' : 'License Plate Retention'}
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      data-testid="plate-retain-btn"
                      onClick={() => handleUpdateMetadata('retainPlate', true)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        formData.metadata.retainPlate
                          ? 'bg-cyan-600/20 border-cyan-500 text-white shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-cyan-300">Nömrə Saxlanılır</div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Rüsum: 0 AZN</p>
                    </button>

                    <button
                      type="button"
                      data-testid="plate-new-btn"
                      onClick={() => handleUpdateMetadata('retainPlate', false)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        !formData.metadata.retainPlate
                          ? 'bg-amber-600/20 border-amber-500 text-white shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-amber-300">Yeni Nömrə Verilir</div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Rüsum: +35 AZN</p>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    * Əgər alıcı satıcının mövcud dövlət qeydiyyat nişanını qəbul edirsə, yeni nömrə rüsumu ödənilmir.
                  </p>
                </div>
              </div>

              {/* Detailed Itemized Costs Table */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {lang === 'az' ? 'Qanunvericilik üzrə Rəsmi Xərclər Cədvəli' : 'Statutory Fee Schedule Breakdown'}
                </h4>

                <div className="divide-y divide-slate-800/80 text-xs">
                  <div className="py-2.5 flex items-center justify-between text-slate-300">
                    <div>
                      <span className="font-semibold block">Notariat Dövlət Rüsumu</span>
                      <span className="text-[11px] text-slate-500">
                        AR «Dövlət rüsumu haqqında» Qanun, maddə 18 (mühərrik həcminə və qohumluğa görə)
                      </span>
                    </div>
                    <span className="font-mono font-bold text-white">{closingCosts.notaryDutyAzn} AZN</span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between text-slate-300">
                    <div>
                      <span className="font-semibold block">Notariat Texniki Xidmət Haqqı</span>
                      <span className="text-[11px] text-slate-500">
                        «Notariat haqqında» AR Qanununa əsasən hüquqi sənədləşmə xidməti
                      </span>
                    </div>
                    <span className="font-mono font-bold text-white">{closingCosts.notaryServiceFeeAzn} AZN</span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between text-slate-300">
                    <div>
                      <span className="font-semibold block">BDYPİ Yeni Qeydiyyat Şəhadətnaməsi (Texposport)</span>
                      <span className="text-[11px] text-slate-500">
                        DİN Baş Dövlət Yol Polisi İdarəsi tərəfindən yeni şəhadətnamənin verilməsi
                      </span>
                    </div>
                    <span className="font-mono font-bold text-white">{closingCosts.bdypiTechPassportDutyAzn} AZN</span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between text-slate-300">
                    <div>
                      <span className="font-semibold block">BDYPİ Dövlət Qeydiyyat Nişanı Rüsumu</span>
                      <span className="text-[11px] text-slate-500">
                        {formData.metadata.retainPlate
                          ? 'Mövcud nömrə nişanı saxlanıldığı üçün tətbiq edilmir'
                          : 'Yeni nömrə nişanının verilmə rüsumu'}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-white">{closingCosts.bdypiPlateDutyAzn} AZN</span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between text-slate-300">
                    <div>
                      <span className="font-semibold block">Texniki Baxış & Aqreqat Nömrələrinin Yoxlanışı</span>
                      <span className="text-[11px] text-slate-500">BDYPİ Qeydiyyat şöbəsində vizual və kriminalistik yoxlama</span>
                    </div>
                    <span className="font-mono font-bold text-white">{closingCosts.bdypiInspectionDutyAzn} AZN</span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between text-slate-300">
                    <div>
                      <span className="font-semibold block">İcbari Sığorta Müqaviləsinin Rəsmiləşdirilməsi</span>
                      <span className="text-[11px] text-slate-500">Yeni sahibin adına sığorta şəhadətnaməsinin ötürülməsi</span>
                    </div>
                    <span className="font-mono font-bold text-white">{closingCosts.insuranceTransferFeeAzn} AZN</span>
                  </div>

                  <div className="py-3 flex items-center justify-between text-emerald-400 font-bold text-sm bg-slate-900/60 px-3 rounded-xl mt-2">
                    <span>{lang === 'az' ? 'YEKUN CƏMİ XƏRCLƏR:' : 'GRAND TOTAL CLOSING COSTS:'}</span>
                    <span className="text-base font-black font-mono">{closingCosts.grandTotalAzn} AZN</span>
                  </div>
                </div>
              </div>

              {/* Next Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('document')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-lg shadow-blue-600/20 cursor-pointer"
                >
                  <span>{lang === 'az' ? 'Müqavilə Mətninə Keç' : 'View Legal Contract'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: LEGAL DOCUMENT PREVIEW */}
          {activeTab === 'document' && (
            <div className="space-y-4">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                {/* Language Switch */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
                  <button
                    type="button"
                    data-testid="contract-lang-az-btn"
                    onClick={() => setPreviewLang('az')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      previewLang === 'az'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Azərbaycan dili (Rəsmi)
                  </button>
                  <button
                    type="button"
                    data-testid="contract-lang-en-btn"
                    onClick={() => setPreviewLang('en')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      previewLang === 'en'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    English (International)
                  </button>
                </div>

                {/* Print & Copy buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    data-testid="copy-contract-btn"
                    onClick={handleCopyDocument}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{isCopied ? (lang === 'az' ? 'Kopyalandı!' : 'Copied!') : (lang === 'az' ? 'Mətni Kopyala' : 'Copy Text')}</span>
                  </button>

                  <button
                    type="button"
                    data-testid="print-contract-btn"
                    onClick={handlePrint}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/30 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{lang === 'az' ? 'Çap Et / PDF Yadda Saxla' : 'Print / Save as PDF'}</span>
                  </button>
                </div>
              </div>

              {/* Printable Document Sheet */}
              <div
                data-testid="contract-legal-sheet"
                className="p-6 sm:p-10 rounded-2xl bg-white text-slate-900 shadow-2xl border border-slate-300 font-serif leading-relaxed text-xs sm:text-sm selection:bg-blue-100 selection:text-blue-900"
              >
                {/* Official Notary Header */}
                <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full border-2 border-slate-900 flex items-center justify-center font-sans font-bold text-xs tracking-tighter">
                    AR ƏN
                  </div>
                  <h3 className="font-sans font-bold text-sm tracking-wider uppercase">
                    {previewLang === 'az'
                      ? 'AZƏRBAYCAN RESPUBLİKASI ƏDLİYYƏ NAZİRLİYİ'
                      : 'MINISTRY OF JUSTICE OF THE REPUBLIC OF AZERBAIJAN'}
                  </h3>
                  <p className="font-sans text-xs text-slate-700 font-medium">
                    {previewLang === 'az'
                      ? NOTARY_OFFICES.find((n) => n.id === formData.metadata.notaryOfficeId)?.nameAz
                      : NOTARY_OFFICES.find((n) => n.id === formData.metadata.notaryOfficeId)?.nameEn}
                  </p>
                  <div className="flex items-center justify-center gap-4 text-[11px] font-sans text-slate-600 mt-2">
                    <span>
                      {previewLang === 'az' ? 'Reyestr №:' : 'Registry No:'}{' '}
                      <strong className="font-mono">{formData.metadata.registryNumber}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      {previewLang === 'az' ? 'Müqavilə №:' : 'Contract Ref:'}{' '}
                      <strong className="font-mono">{formData.metadata.contractNumber}</strong>
                    </span>
                  </div>
                </div>

                {/* Preformatted text with preserved indentation */}
                <pre className="whitespace-pre-wrap font-serif text-slate-900 text-xs sm:text-sm leading-relaxed overflow-x-auto">
                  {previewLang === 'az' ? legalDoc.azText : legalDoc.enText}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800/80 bg-slate-950/60 flex-shrink-0 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Info className="w-4 h-4 text-blue-400" />
            <span>
              {lang === 'az'
                ? 'Müqavilə AR Mülki Məcəlləsinin 656-680-ci maddələri əsasında generasiya edilmişdir.'
                : 'Generated in compliance with Articles 656-680 of the Civil Code of Azerbaijan.'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
            >
              {lang === 'az' ? 'Bağla' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { Vehicle, Currency, Language } from '../types/vehicle';
import {
  ViolationProtocol,
  PaymentMethodType,
  FinePaymentReceipt,
  ClearanceCertificate,
} from '../types/fines';
import {
  formatPlateDisplay,
  calculateProtocolPayable,
  calculateFineSummary,
  evaluateDriverPoints,
  searchProtocols,
  simulateFinePayment,
  generateClearanceCertificate,
} from '../utils/fines';
import { formatPrice } from '../utils/i18n';
import { MOCK_PROTOCOLS_DATABASE } from '../data/mockFinesData';
import { useScrollLock } from '../hooks/useScrollLock';
import { useKeyPress } from '../hooks/useKeyPress';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { toastManager } from '../hooks/useToast';
import {
  X,
  Search,
  ShieldAlert,
  ShieldCheck,
  CreditCard,
  Camera,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Copy,
  Printer,
  Car,
  QrCode,
  Gauge,
  Sparkles,
  Award,
  Zap,
  Info,
  Check,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export interface TrafficFinesModalProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  currency: Currency;
  lang: Language;
  onClose: () => void;
}

type TabType = 'unpaid' | 'history' | 'demerit' | 'certificate';

export const TrafficFinesModal: React.FC<TrafficFinesModalProps> = ({
  isOpen,
  vehicle,
  currency,
  lang,
  onClose,
}) => {
  useScrollLock(isOpen);
  useKeyPress('Escape', onClose);
  const [, copyToClipboard] = useCopyToClipboard();

  // Active vehicle plate
  const initialPlate = vehicle?.plateNumber || '90-MJ-318';
  const [searchQuery, setSearchQuery] = useState(initialPlate);
  const [activeTab, setActiveTab] = useState<TabType>('unpaid');

  // Local state for protocols (allows simulating payments in real-time)
  const [protocols, setProtocols] = useState<ViolationProtocol[]>(MOCK_PROTOCOLS_DATABASE);

  // Payment simulator state
  const [paymentTargetProtocols, setPaymentTargetProtocols] = useState<ViolationProtocol[] | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('AsanPay');
  const [payerName, setPayerName] = useState('Cavid Əliyev');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<FinePaymentReceipt | null>(null);

  // Filtered protocols for current plate/query
  const filteredProtocols = useMemo(() => {
    return searchProtocols(searchQuery, protocols);
  }, [searchQuery, protocols]);

  const unpaidProtocols = useMemo(() => {
    return filteredProtocols.filter((p) => p.status !== 'paid');
  }, [filteredProtocols]);

  const paidProtocols = useMemo(() => {
    return filteredProtocols.filter((p) => p.status === 'paid');
  }, [filteredProtocols]);

  // Overall financial summary for displayed protocols
  const fineSummary = useMemo(() => {
    return calculateFineSummary(filteredProtocols, currency);
  }, [filteredProtocols, currency]);

  // Demerit points evaluation
  const pointsSummary = useMemo(() => {
    return evaluateDriverPoints(fineSummary.totalPoints);
  }, [fineSummary.totalPoints]);

  // Generated Clean Certificate
  const clearanceCertificate = useMemo<ClearanceCertificate | null>(() => {
    if (unpaidProtocols.length === 0) {
      return generateClearanceCertificate(
        searchQuery,
        vehicle?.vin || 'VIN-AZ-9918294',
        vehicle?.seller.name || 'Mülkiyyətçi'
      );
    }
    return null;
  }, [unpaidProtocols.length, searchQuery, vehicle]);

  if (!isOpen) return null;

  // Handle single fine payment start
  const handleOpenPaymentSingle = (protocol: ViolationProtocol) => {
    setPaymentTargetProtocols([protocol]);
  };

  // Handle pay-all fines payment start
  const handleOpenPaymentAll = () => {
    if (unpaidProtocols.length === 0) return;
    setPaymentTargetProtocols(unpaidProtocols);
  };

  // Execute payment
  const handleConfirmPayment = () => {
    if (!paymentTargetProtocols || paymentTargetProtocols.length === 0) return;

    setIsProcessingPayment(true);
    setTimeout(() => {
      const protocolNumbers = paymentTargetProtocols.map((p) => p.protocolNumber);
      const receipt = simulateFinePayment(
        protocolNumbers,
        searchQuery,
        payerName,
        paymentMethod,
        currency,
        protocols
      );

      // Update protocols state to 'paid'
      setProtocols((prev) =>
        prev.map((p) => {
          if (protocolNumbers.includes(p.protocolNumber)) {
            return {
              ...p,
              status: 'paid',
              paidAt: new Date().toISOString(),
              paymentChannel: paymentMethod === 'AsanPay' ? 'AsanPay Dövlət Portalı' : 'Hökumət Ödəniş Portalı (HÖP)',
              paymentReceiptId: receipt.receiptNumber,
            };
          }
          return p;
        })
      );

      setIsProcessingPayment(false);
      setLastReceipt(receipt);
      setPaymentTargetProtocols(null);

      toastManager.add(
        lang === 'az'
          ? `${protocolNumbers.length} protokol üzrə ${receipt.paidAmountAzn} AZN ödənildi və sistemdə silindi.`
          : `${protocolNumbers.length} protocols cleared successfully.`,
        'success'
      );
    }, 600);
  };

  const handleCopyText = (text: string, label: string) => {
    copyToClipboard(text);
    toastManager.add(`${label} buferə kopyalandı.`, 'info');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      data-testid="traffic-fines-modal"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with Official Co-Branding */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-900 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-inner flex-shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                  BDYPİ MMX & AsanPay
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  Dövlət Yol Polisi İnzibati Protokollar Portalı
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
                {lang === 'az' 
                  ? 'MMX Radar Cərimələri & AsanPay İnteqrasiyası' 
                  : lang === 'ru' 
                  ? 'Радарные Штрафы MMX и Интеграция AsanPay' 
                  : 'Traffic Fines, Radar Protocols & Demerit Points'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              data-testid="close-fines-modal-btn"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Plate Search Bar & Quick Presets */}
        <div className="px-6 py-3.5 bg-slate-950/60 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Dövlət nömrə nişanı ilə axtarış (məs. 90-MJ-318, 99-KB-412)..."
              data-testid="fines-plate-search-input"
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors uppercase font-mono tracking-wider"
            />
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs text-slate-400">
            <span className="text-[11px] text-slate-500 whitespace-nowrap">Nümunələr:</span>
            {['90-MJ-318', '99-KB-412', '10-PP-911', '90-AA-530', '77-TC-070'].map((preset) => (
              <button
                key={preset}
                onClick={() => setSearchQuery(preset)}
                className={`px-2.5 py-1 rounded-lg border font-mono text-[11px] transition-all whitespace-nowrap ${
                  searchQuery.toUpperCase().includes(preset.replace('-', ''))
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Overview KPI Cards */}
        <div className="px-6 py-4 bg-slate-950/40 border-b border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Active Fines */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Aktiv Cərimə Sayı</span>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-black ${fineSummary.unpaidProtocols > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {fineSummary.unpaidProtocols}
              </span>
              <span className="text-xs text-slate-400 font-medium">protokol</span>
            </div>
          </div>

          {/* Payable Amount with 50% discount */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Ödənilməli Məbləğ</span>
              <CreditCard className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-amber-400">
                {formatPrice(fineSummary.totalDiscountedAmountAzn, currency)}
              </span>
              {fineSummary.totalSavingsAzn > 0 && (
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold">
                  -50%
                </span>
              )}
            </div>
          </div>

          {/* Demerit Points */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Cərimə Balı</span>
              <Gauge className="w-4 h-4 text-sky-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-black ${
                pointsSummary.riskLevel === 'safe'
                  ? 'text-emerald-400'
                  : pointsSummary.riskLevel === 'warning'
                  ? 'text-amber-400'
                  : 'text-rose-500'
              }`}>
                {pointsSummary.totalActivePoints}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ 12 bal</span>
            </div>
          </div>

          {/* Legal Status */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Hüquqi Status</span>
              {fineSummary.unpaidProtocols === 0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              )}
            </div>
            <div className="text-sm font-bold truncate">
              {fineSummary.unpaidProtocols === 0 ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Borcsuz / Təmiz
                </span>
              ) : (
                <span className="text-rose-400">
                  {fineSummary.unpaidProtocols} Aktiv Borc
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-800 flex items-center gap-2 overflow-x-auto bg-slate-950/20">
          <button
            onClick={() => setActiveTab('unpaid')}
            data-testid="tab-unpaid-fines"
            className={`py-3 px-3.5 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'unpaid'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Aktiv Cərimələr</span>
            <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-slate-800 font-mono">
              {unpaidProtocols.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            data-testid="tab-fines-history"
            className={`py-3 px-3.5 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Ödənilmiş Tarixçə</span>
            <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-slate-800 font-mono">
              {paidProtocols.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('demerit')}
            data-testid="tab-demerit-points"
            className={`py-3 px-3.5 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'demerit'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>Sürücü Balları & Şkala</span>
          </button>

          <button
            onClick={() => setActiveTab('certificate')}
            data-testid="tab-clean-certificate"
            className={`py-3 px-3.5 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'certificate'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Borcsuzluq Arayışı</span>
            {unpaidProtocols.length === 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
        </div>

        {/* Modal Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: UNPAID FINES */}
          {activeTab === 'unpaid' && (
            <div className="space-y-4">
              {unpaidProtocols.length > 0 ? (
                <>
                  <div className="flex items-center justify-between pb-1">
                    <p className="text-xs text-slate-400">
                      Dövlət nömrə nişanı üzrə aşkar edilmiş aktiv inzibati protokollar:
                    </p>
                    <button
                      onClick={handleOpenPaymentAll}
                      data-testid="pay-all-fines-btn"
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/25 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Hamısını Ödə ({formatPrice(fineSummary.totalDiscountedAmountAzn, currency)})</span>
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    {unpaidProtocols.map((protocol) => {
                      const payable = calculateProtocolPayable(protocol, currency);

                      return (
                        <div
                          key={protocol.protocolNumber}
                          data-testid={`protocol-card-${protocol.protocolNumber}`}
                          className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                                {protocol.protocolNumber}
                              </span>
                              <span className="text-xs text-slate-400 font-medium">
                                {protocol.legalArticle}
                              </span>
                              {protocol.penaltyPoints > 0 && (
                                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                  +{protocol.penaltyPoints} bal
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-xs text-slate-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                {new Date(protocol.date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-500" />
                                {new Date(protocol.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1.5 flex-1">
                              <h4 className="text-sm font-bold text-white">
                                {lang === 'az' ? protocol.titleAz : lang === 'ru' ? protocol.titleRu : protocol.titleEn}
                              </h4>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                {lang === 'az' ? protocol.descriptionAz : lang === 'ru' ? protocol.descriptionRu : protocol.descriptionEn}
                              </p>

                              <div className="flex items-center gap-2 pt-1 text-xs text-slate-400 flex-wrap">
                                <span className="flex items-center gap-1 text-slate-300">
                                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                                  {protocol.location}
                                </span>
                                {protocol.radarModel && (
                                  <span className="text-[11px] text-slate-500">
                                    • {protocol.radarModel}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Payment details & Button */}
                            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                              <div className="text-left md:text-right">
                                <div className="flex items-baseline gap-1.5 md:justify-end">
                                  <span className="text-lg font-black text-white">
                                    {formatPrice(payable.payableAzn, currency)}
                                  </span>
                                  {payable.isDiscountApplied && (
                                    <span className="text-xs text-slate-500 line-through">
                                      {formatPrice(protocol.amountAzn, currency)}
                                    </span>
                                  )}
                                </div>
                                {payable.isDiscountApplied && (
                                  <span className="text-[10px] text-emerald-400 font-semibold block">
                                    50% endirim müddəti aktivdir
                                  </span>
                                )}
                              </div>

                              <button
                                onClick={() => handleOpenPaymentSingle(protocol)}
                                data-testid={`pay-single-fine-${protocol.protocolNumber}`}
                                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>AsanPay ilə Ödə</span>
                              </button>
                            </div>
                          </div>

                          {/* Radar Camera Telemetry Preview */}
                          {protocol.hasPhoto && protocol.cameraTelemetry && (
                            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-2">
                              <div className="flex items-center justify-between text-[11px] text-slate-400">
                                <span className="flex items-center gap-1.5 text-slate-300 font-mono">
                                  <Camera className="w-3.5 h-3.5 text-rose-400" />
                                  MMX Foto-Nəzarət Telemetriyası
                                </span>
                                <span className="text-slate-500">
                                  Kamera Dəqiqliyi: {protocol.cameraTelemetry.confidence}%
                                </span>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center font-mono">
                                <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                                  <span className="text-[10px] text-slate-500 block">Qeydə Alınan</span>
                                  <span className="text-xs font-bold text-rose-400">
                                    {protocol.cameraTelemetry.detectedSpeed || protocol.speedRecordedKmh || 86} km/saat
                                  </span>
                                </div>
                                <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                                  <span className="text-[10px] text-slate-500 block">İcazə Verilən</span>
                                  <span className="text-xs font-bold text-slate-300">
                                    {protocol.cameraTelemetry.speedLimit || protocol.speedLimitKmh || 60} km/saat
                                  </span>
                                </div>
                                <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                                  <span className="text-[10px] text-slate-500 block">Hərəkət Zolağı</span>
                                  <span className="text-xs font-bold text-sky-400">
                                    Zolaq #{protocol.cameraTelemetry.lane}
                                  </span>
                                </div>
                                <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                                  <span className="text-[10px] text-slate-500 block">Protokol Tarixi</span>
                                  <span className="text-xs font-bold text-slate-300">
                                    {protocol.cameraTelemetry.timestampFormatted.split(' ')[0]}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="py-12 px-4 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Aktiv Cərimə Borcu Yoxdur!</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    {formatPlateDisplay(searchQuery)} dövlət qeydiyyat nişanlı nəqliyyat vasitəsi üzrə BDYPİ MMX bazasında ödənilməmiş protokol qeydə alınmayıb.
                  </p>
                  <button
                    onClick={() => setActiveTab('certificate')}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-600/30 transition-all cursor-pointer"
                  >
                    <Award className="w-4 h-4" />
                    <span>Rəsmi Borcsuzluq Arayışını Al</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Əvvəllər ödənilmiş və bağlanmış inzibati xəta protokolları:
              </p>

              {paidProtocols.length > 0 ? (
                <div className="space-y-3">
                  {paidProtocols.map((protocol) => (
                    <div
                      key={protocol.protocolNumber}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-300">
                            {protocol.protocolNumber}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Ödənilib
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white">
                          {protocol.titleAz}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          {protocol.location} • {protocol.legalArticle}
                        </p>
                      </div>

                      <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/60">
                        <span className="text-sm font-bold text-white">
                          {formatPrice(protocol.amountAzn, currency)}
                        </span>
                        <div className="text-[10px] text-slate-500">
                          {protocol.paymentChannel || 'AsanPay'} ({protocol.paymentReceiptId || 'Qəbz #1982'})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center text-slate-400 text-xs">
                  Bu nömrə üzrə ödənilmiş arxiv protokolu tapılmadı.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DEMERIT POINTS */}
          {activeTab === 'demerit' && (
            <div className="space-y-6">
              {/* Demerit Scale Visualizer */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-sky-400" />
                    <span>Azərbaycan Respublikası Sürücü Cərimə Balı Şkalası</span>
                  </h3>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    pointsSummary.riskLevel === 'safe'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : pointsSummary.riskLevel === 'warning'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {pointsSummary.riskLevel}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        pointsSummary.riskLevel === 'safe'
                          ? 'bg-emerald-500'
                          : pointsSummary.riskLevel === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, (pointsSummary.totalActivePoints / 12) * 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] font-mono text-slate-500">
                    <span>0 Bal (Təhlükəsiz)</span>
                    <span>4 Bal (Xəbərdarlıq)</span>
                    <span>8 Bal (Yüksək Risk)</span>
                    <span className="text-rose-400 font-bold">12 Bal (Məhrumetmə)</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  {lang === 'az' ? pointsSummary.warningMessageAz : lang === 'ru' ? pointsSummary.warningMessageRu : pointsSummary.warningMessageEn}
                </div>
              </div>

              {/* Legal Points Framework Reference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-400" />
                    <span>Balların Hesablanması Qaydası</span>
                  </h4>
                  <ul className="text-slate-400 space-y-1 list-disc list-inside text-[11px]">
                    <li>Sürət 20-40 km/saat aşılması: <strong>2 bal</strong></li>
                    <li>Sürət 40-60 km/saat aşılması: <strong>3 bal</strong></li>
                    <li>Qırmızı işıqda keçmə (İXM 327.2): <strong>3 bal</strong></li>
                    <li>Əks yola çıxma / qoşa xətt (İXM 327.4): <strong>4 bal</strong></li>
                    <li>Təhlükəsizlik kəməri (İXM 329.1): <strong>1 bal</strong></li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Balların Silinməsi & Bərpası</span>
                  </h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    İnzibati Xətalar Məcəlləsinin tələblərinə əsasən, sonuncu xətanın törədildiyi gündən <strong>1 il ərzində</strong> yeni ballı xəta törədilmədikdə toplanmış cərimə balları avtomatik silinir və sürücülük hüququ bərpa olunur.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CLEARANCE CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-4">
              {clearanceCertificate ? (
                <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border-2 border-emerald-500/30 text-center space-y-5 shadow-xl">
                  {/* Emblem / Badge */}
                  <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <Award className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                      Rəsmi Dövlət Arayışı • DYP E-ARAYIŞ
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      Cərimə Borcunun Olmaması Haqqında Arayış
                    </h3>
                    <p className="text-xs text-slate-400">
                      Baş Dövlət Yol Polisi İdarəsinin Mərkəzi Məlumat Xidməti (MMX)
                    </p>
                  </div>

                  {/* Certificate Body details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-left font-mono text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Dövlət Nişanı</span>
                      <span className="font-bold text-white">{clearanceCertificate.plateNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Arayış №</span>
                      <span className="font-bold text-emerald-400">{clearanceCertificate.certificateNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Verilmə Tarixi</span>
                      <span className="font-bold text-white">{clearanceCertificate.issueDate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Etibarlılıq</span>
                      <span className="font-bold text-sky-400">{clearanceCertificate.validUntil} (30 gün)</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 italic max-w-lg mx-auto leading-relaxed">
                    Təsdiq edilir ki, {clearanceCertificate.plateNumber} qeydiyyat nişanlı nəqliyyat vasitəsinin BDYPİ MMX sistemində heç bir ödənilməmiş cərimə borcu və ya məhdudiyyəti mövcud deyildir.
                  </p>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => handleCopyText(clearanceCertificate.securityHash, 'Təhlükəsizlik kodu')}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Kodu Kopyala</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Çap Et / PDF Yüklə</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">Borcsuzluq Arayışı Verilə Bilməz!</h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    Bu nəqliyyat vasitəsi üzrə <strong>{unpaidProtocols.length} aktiv cərimə</strong> mövcuddur. Rəsmi arayış almaq və notariatda alqı-satqını rəsmiləşdirmək üçün cərimələr tam ödənilməlidir.
                  </p>
                  <button
                    onClick={handleOpenPaymentAll}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
                  >
                    Cərimələri İndi Ödə və Arayış Al
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PAYMENT CHECKOUT SIMULATOR DRAWER/MODAL */}
        {paymentTargetProtocols && (
          <div 
            className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-6 flex flex-col justify-center animate-in fade-in duration-200"
            data-testid="fines-payment-simulator-modal"
          >
            <div className="max-w-md w-full mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">AsanPay Dövlət Ödəniş Gateway</h3>
                </div>
                <button
                  onClick={() => setPaymentTargetProtocols(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Payment Summary */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Protokollar:</span>
                  <span className="font-bold text-white">{paymentTargetProtocols.length} ədəd</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Dövlət Nişanı:</span>
                  <span className="font-mono font-bold text-rose-400">{formatPlateDisplay(searchQuery)}</span>
                </div>
                <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-2 font-bold">
                  <span className="text-white">Yekun Ödəniş:</span>
                  <span className="text-base text-emerald-400">
                    {formatPrice(
                      paymentTargetProtocols.reduce((sum, p) => sum + calculateProtocolPayable(p, 'AZN').payableAzn, 0),
                      currency
                    )}
                  </span>
                </div>
              </div>

              {/* Payer Name */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Ödəyici Sürücü / Vətəndaş:</label>
                <input
                  type="text"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Ödəniş Kanalı:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['AsanPay', 'HÖP', 'BankCard'] as PaymentMethodType[]).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                        paymentMethod === method
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Confirmation Button */}
              <button
                onClick={handleConfirmPayment}
                disabled={isProcessingPayment}
                data-testid="confirm-fines-payment-btn"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessingPayment ? (
                  <span>Ödəniş icra olunur...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Ödənişi Təsdiqlə və Sil</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>BDYPİ MMX Real-Time API Aktivdir</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Bağla
          </button>
        </div>

      </div>
    </div>
  );
};

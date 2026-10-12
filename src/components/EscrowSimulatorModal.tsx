import React, { useState, useMemo } from 'react';
import { Vehicle, Currency, Language } from '../types/vehicle';
import {
  EscrowBankPartner,
  EscrowFeePayer,
  EscrowDepositAgreement,
  EscrowStatus,
  EscrowActionPayload,
} from '../types/escrow';
import { MOCK_ESCROW_BANKS } from '../data/mockEscrowDatabase';
import {
  calculateEscrowFee,
  getRecommendedDepositAmount,
  getSellerTrustBadge,
  createInitialEscrowAgreement,
  transitionEscrowStatus,
  generateEscrowReceipt,
} from '../utils/escrow';
import { formatPrice } from '../utils/i18n';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  CheckCircle,
  AlertCircle,
  Lock,
  Unlock,
  FileCheck,
  Phone,
  UserCheck,
  CreditCard,
  ArrowRight,
  RotateCcw,
  Printer,
  Copy,
  Check,
  Building2,
  Calendar,
  AlertTriangle,
  Gavel,
  Clock,
  Sparkles,
  Info,
  BadgeCheck,
} from 'lucide-react';

export interface EscrowSimulatorModalProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  currency: Currency;
  lang: Language;
  onClose: () => void;
}

type TabType = 'identity' | 'escrow' | 'timeline' | 'certificate';

export const EscrowSimulatorModal: React.FC<EscrowSimulatorModalProps> = ({
  isOpen,
  vehicle,
  currency,
  lang,
  onClose,
}) => {
  if (!isOpen || !vehicle) return null;

  const [activeTab, setActiveTab] = useState<TabType>('identity');

  // Deposit input configuration
  const initialRecommended = useMemo(() => getRecommendedDepositAmount(vehicle.priceAzn), [vehicle.priceAzn]);
  const [depositAmount, setDepositAmount] = useState<number>(initialRecommended);
  const [selectedBank, setSelectedBank] = useState<EscrowBankPartner>('kapital_bank');
  const [feePayer, setFeePayer] = useState<EscrowFeePayer>('split');

  // Escrow Agreement state
  const [agreement, setAgreement] = useState<EscrowDepositAgreement>(() =>
    createInitialEscrowAgreement(vehicle, {
      depositAmountAzn: initialRecommended,
      bankPartner: 'kapital_bank',
      feePayer: 'split',
    })
  );

  // Security code input for notary confirmation
  const [inputPin, setInputPin] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Dispute and inspection reason inputs
  const [customNote, setCustomNote] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Dynamic fee calculation for active inputs
  const currentFees = useMemo(() => {
    return calculateEscrowFee(depositAmount, selectedBank, feePayer);
  }, [depositAmount, selectedBank, feePayer]);

  const sellerBadge = useMemo(() => {
    return getSellerTrustBadge(agreement.sellerDossier.trustScore);
  }, [agreement.sellerDossier.trustScore]);

  // Handle setting updates when still in DRAFT
  const handleDepositChange = (amount: number) => {
    setDepositAmount(amount);
    if (agreement.status === 'DRAFT') {
      const fees = calculateEscrowFee(amount, selectedBank, feePayer);
      setAgreement((prev) => ({
        ...prev,
        depositAmountAzn: amount,
        feeBreakdown: fees,
        totalBuyerPaymentAzn: fees.totalBuyerPaymentAzn,
        netSellerPayoutAzn: fees.netSellerPayoutAzn,
      }));
    }
  };

  const handleBankChange = (bankId: EscrowBankPartner) => {
    setSelectedBank(bankId);
    if (agreement.status === 'DRAFT') {
      const fees = calculateEscrowFee(depositAmount, bankId, feePayer);
      setAgreement((prev) => ({
        ...prev,
        bankPartner: bankId,
        feeBreakdown: fees,
        totalBuyerPaymentAzn: fees.totalBuyerPaymentAzn,
        netSellerPayoutAzn: fees.netSellerPayoutAzn,
      }));
    }
  };

  const handleFeePayerChange = (payer: EscrowFeePayer) => {
    setFeePayer(payer);
    if (agreement.status === 'DRAFT') {
      const fees = calculateEscrowFee(depositAmount, selectedBank, payer);
      setAgreement((prev) => ({
        ...prev,
        feePayer: payer,
        feeBreakdown: fees,
        totalBuyerPaymentAzn: fees.totalBuyerPaymentAzn,
        netSellerPayoutAzn: fees.netSellerPayoutAzn,
      }));
    }
  };

  // State machine transition dispatcher
  const dispatchAction = (payload: EscrowActionPayload) => {
    try {
      setPinError(null);
      const updated = transitionEscrowStatus(agreement, payload);
      setAgreement(updated);
    } catch (err: any) {
      setPinError(err.message || 'Əməliyyatı tamamlamaq mümkün olmadı');
    }
  };

  const resetSimulation = () => {
    const fresh = createInitialEscrowAgreement(vehicle, {
      depositAmountAzn: depositAmount,
      bankPartner: selectedBank,
      feePayer,
    });
    setAgreement(fresh);
    setInputPin('');
    setPinError(null);
    setCustomNote('');
  };

  const handleCopyCertificate = () => {
    const text = generateEscrowReceipt(agreement, lang);
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  // Status badge styling helper
  const getStatusBadge = (status: EscrowStatus) => {
    switch (status) {
      case 'DRAFT':
        return {
          labelAz: 'Qaralama (Danışıqlar)',
          labelEn: 'Draft (Negotiating)',
          labelRu: 'Черновик (Переговоры)',
          bg: 'bg-slate-700/40 text-slate-300 border-slate-600',
        };
      case 'FUNDS_LOCKED':
      case 'INSPECTION_PENDING':
        return {
          labelAz: 'Vəsait Dondurulub (Diaqnostika)',
          labelEn: 'Funds Held (Under Inspection)',
          labelRu: 'Средства Удержаны (Диагностика)',
          bg: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        };
      case 'INSPECTION_PASSED':
      case 'NOTARY_PENDING':
        return {
          labelAz: 'Yoxlanışdan Keçdi (Notariat Gözlənilir)',
          labelEn: 'Inspection Cleared (Pending Notary)',
          labelRu: 'Проверка Пройдена (Ожидает Нотариат)',
          bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        };
      case 'INSPECTION_FAILED':
        return {
          labelAz: 'Kritik Qüsur (Geri Qaytarılmalı)',
          labelEn: 'Inspection Failed (Refund Due)',
          labelRu: 'Критический Дефект (К Возврату)',
          bg: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
        };
      case 'RELEASED':
        return {
          labelAz: 'Tamamlandı (Vəsait Satıcıya Ödənildi)',
          labelEn: 'Completed (Funds Released to Seller)',
          labelRu: 'Завершено (Выплачено Продавцу)',
          bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        };
      case 'REFUNDED':
        return {
          labelAz: 'Geri Qaytarıldı (Alıcıya 100% Refund)',
          labelEn: 'Refunded (100% Refund to Buyer)',
          labelRu: 'Возвращено (100% Покупателю)',
          bg: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
        };
      case 'DISPUTED':
        return {
          labelAz: 'Mübahisə / Arbitraj Dondurması',
          labelEn: 'Disputed / Frozen Under Arbitration',
          labelRu: 'Спор / Заморожено Арбитражем',
          bg: 'bg-red-500/20 text-red-400 border-red-500/30',
        };
      default:
        return {
          labelAz: status,
          labelEn: status,
          labelRu: status,
          bg: 'bg-slate-700/40 text-slate-300 border-slate-600',
        };
    }
  };

  const statusBadge = getStatusBadge(agreement.status);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="escrow-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-5xl my-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="escrow-modal-title" className="text-lg font-bold text-white">
                  {lang === 'en'
                    ? 'Seller Identity & Digital Escrow Deposit'
                    : lang === 'ru'
                    ? 'Верификация Продавца & Цифровой Эскроу Задатка'
                    : 'Satıcı Şəxsiyyət Yoxlanışı & Rəqəmsal Beh (Escrow)'}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge.bg}`}>
                  {lang === 'en' ? statusBadge.labelEn : lang === 'ru' ? statusBadge.labelRu : statusBadge.labelAz}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {vehicle.title} ({vehicle.year}) • VIN: <span className="font-mono text-slate-300">{vehicle.vin}</span> • Ref:{' '}
                <span className="font-mono text-emerald-400 font-semibold">{agreement.escrowId}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-6 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('identity')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'identity'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>
              {lang === 'en'
                ? 'Seller Identity Dossier'
                : lang === 'ru'
                ? 'Досье Продавца & Доверие'
                : 'Satıcı Şəxsiyyəti & Etibarlılıq'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('escrow')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'escrow'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>
              {lang === 'en'
                ? 'Escrow Holding Simulator'
                : lang === 'ru'
                ? 'Симулятор Эскроу Задатка'
                : 'Rəqəmsal Beh & Escrow Simulyatoru'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>
              {lang === 'en'
                ? 'Audit Timeline'
                : lang === 'ru'
                ? 'История Сделки'
                : 'Əməliyyat Tarixçəsi'}
            </span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
              {agreement.timeline.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('certificate')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'certificate'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>
              {lang === 'en'
                ? 'Digital Escrow Certificate'
                : lang === 'ru'
                ? 'Электронный Сертификат'
                : 'Rəqəmsal Zəmanət Sənədi'}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: SELLER IDENTITY DOSSIER */}
          {activeTab === 'identity' && (
            <div className="space-y-6">
              {/* Trust Score Header Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 shadow-inner">
                    <span className="text-2xl font-black text-white">{agreement.sellerDossier.trustScore}</span>
                    <span className="text-[10px] text-slate-400 absolute bottom-1 font-medium">/ 100</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        {agreement.sellerDossier.fullName}
                      </h3>
                      <BadgeCheck className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${sellerBadge.badgeBg} ${sellerBadge.badgeBorder} ${sellerBadge.badgeText}`}>
                        {lang === 'en' ? sellerBadge.tierNameEn : lang === 'ru' ? sellerBadge.tierNameRu : sellerBadge.tierNameAz}
                      </span>
                      <span className="text-xs text-slate-400">
                        {agreement.sellerDossier.sellerType === 'official_dealer'
                          ? 'Rəsmi Diler Mərkəzi'
                          : agreement.sellerDossier.sellerType === 'autocenter'
                          ? 'Avtosalon / Partnyor'
                          : 'Fərdi Mülkiyyətçi'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-400 max-w-md bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-300 font-semibold block mb-0.5">
                    {lang === 'en' ? 'Verified Protection Guarantee:' : lang === 'ru' ? 'Гарантия безопасности:' : 'Təhlükəsizlik Zəmanəti:'}
                  </span>
                  {lang === 'en'
                    ? sellerBadge.descriptionEn
                    : lang === 'ru'
                    ? sellerBadge.descriptionRu
                    : sellerBadge.descriptionAz}
                </div>
              </div>

              {/* 6 Core Verification Pillars Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {/* 1. ASAN Login */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">ASAN Login & FİN</span>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-blue-400" />
                    <span>FİN: {agreement.sellerDossier.finCodeMasked}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Dövlət ASAN İnnovasiyalar Mərkəzi tərəfindən şəxsiyyət vəsiqəsi eyniləşdirilib.
                  </p>
                </div>

                {/* 2. DYP Texpasport */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">DYP Texpasport</span>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-cyan-400" />
                    <span>№ {agreement.sellerDossier.texpasportSeriesNumber}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {agreement.sellerDossier.dypTexpasportMatch === 'owner_matched'
                      ? 'Ad və soyad texniki pasport mülkiyyətçisi ilə 100% üst-üstə düşür.'
                      : 'Notariat tərəfindən verilmiş etibarnamə əsasında satış aparılır.'}
                  </p>
                </div>

                {/* 3. Biometric Verification */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Biometrik Üz Oxuma</span>
                    {agreement.sellerDossier.biometricVerified ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>
                      {agreement.sellerDossier.biometricVerified ? 'Liveness Test Təsdiqlənib' : 'Yoxlanılmayıb'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Kameraya canlı foto-verifikasiya ilə saxta profil ehtimalı tam aradan qaldırılıb.
                  </p>
                </div>

                {/* 4. Phone Verification */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Mobil Nömrə (OTP)</span>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span>{vehicle.seller?.phone || '+994 50 *** ** **'}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Azərsel / Bakcell / Nar şəbəkəsi üzərindən birdəfəlik SMS şifrə ilə təsdiqlənib.
                  </p>
                </div>

                {/* 5. Police / Legal Record */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Məhkəmə & DİN Axtarışı</span>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Axtarış & Həbs Yoxdur</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    İcra məmurları tərəfindən ödənilməmiş borc və ya məhdudiyyət qeydi yoxdur.
                  </p>
                </div>

                {/* 6. Completed Transactions */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Uğurlu Satışlar</span>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span>{agreement.sellerDossier.totalDealsCompleted} Uğurlu Əməliyyat</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    AutoNext platformasında {agreement.sellerDossier.memberSinceYear}-ci ildən etibarən aktivdir.
                  </p>
                </div>
              </div>

              {/* Safety Recommendation Banner */}
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-200 text-xs flex items-start gap-3">
                <Info className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="text-emerald-300 font-semibold">
                    {lang === 'en'
                      ? 'Buyer Protection Recommendation:'
                      : lang === 'ru'
                      ? 'Рекомендация для покупателя:'
                      : 'Alıcı üçün Təhlükəsizlik Tövsiyəsi:'}
                  </strong>
                  <p className="text-emerald-200/90 leading-relaxed">
                    {lang === 'en'
                      ? 'Never pay a direct cash deposit or make an unregulated card transfer to unverified individuals. Use AutoNext Digital Escrow to securely freeze the deposit until vehicle diagnostics and notary transfer are cleared.'
                      : lang === 'ru'
                      ? 'Никогда не переводите задаток напрямую на карту физлица. Используйте цифровой эскроу AutoNext, чтобы заморозить деньги в банке до завершения диагностики и оформления в нотариусе.'
                      : 'Heç vaxt kartdan-karta və ya nağd qaydada birbaşa beh ödəməyin. AutoNext Rəqəmsal Escrow xidməti ilə vəsaitiniz lisenziyalı bankın xüsusi klirinq hesabında dondurulur və avtomobil 150-nöqtəli ekspertizadan keçmədiyi təqdirdə dərhal kartınıza qaytarılır.'}
                  </p>
                </div>
              </div>

              {/* Quick Action Button to Simulator */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('escrow')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-emerald-950"
                >
                  <span>
                    {lang === 'en'
                      ? 'Configure Escrow Deposit'
                      : lang === 'ru'
                      ? 'Перейти к Эскроу Задатку'
                      : 'Rəqəmsal Beh Şərtlərini Tənzimlə'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: DIGITAL ESCROW SIMULATOR */}
          {activeTab === 'escrow' && (
            <div className="space-y-6">
              {/* Top Configuration Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Setup Controls */}
                <div className="lg:col-span-2 space-y-5">
                  {/* Deposit Amount Selector */}
                  <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs uppercase font-bold text-slate-300">
                        {lang === 'en' ? 'Deposit (Beh) Amount' : lang === 'ru' ? 'Сумма Задатка' : 'Beh (Depozit) Məbləği'}
                      </label>
                      <span className="text-xs text-emerald-400 font-semibold">
                        Tövsiyə olunan (≈5%): {formatPrice(initialRecommended, currency)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={200}
                        max={5000}
                        step={50}
                        disabled={agreement.status !== 'DRAFT'}
                        value={depositAmount}
                        onChange={(e) => handleDepositChange(Number(e.target.value))}
                        className="flex-1 accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-50"
                      />
                      <div className="text-lg font-black text-white px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 min-w-[110px] text-right">
                        {formatPrice(depositAmount, currency)}
                      </div>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {[300, 500, 1000, 1500, 2500].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          disabled={agreement.status !== 'DRAFT'}
                          onClick={() => handleDepositChange(preset)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                            depositAmount === preset
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                              : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-600 disabled:opacity-50'
                          }`}
                        >
                          {preset} AZN
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bank Vault Partner Selector */}
                  <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <label className="text-xs uppercase font-bold text-slate-300 block">
                      {lang === 'en'
                        ? 'Escrow Vault Banking Partner'
                        : lang === 'ru'
                        ? 'Банк-Хранитель Эскроу'
                        : 'Lisenziyalı Əmanət Bankı (Zamin Tərəf)'}
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {MOCK_ESCROW_BANKS.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          disabled={agreement.status !== 'DRAFT'}
                          onClick={() => handleBankChange(b.id)}
                          className={`p-3 rounded-xl border text-left transition-all relative ${
                            selectedBank === b.id
                              ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-slate-800/90'
                              : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 disabled:opacity-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-white text-xs">{b.shortName}</span>
                            <span className="text-[10px] font-mono text-emerald-400">{b.escrowFeePercent}%</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block line-clamp-1">{b.trustRating}</span>
                          <span className="text-[9px] text-slate-500 block mt-1">Min: {b.minFeeAzn} AZN</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fee Split Selector */}
                  <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <label className="text-xs uppercase font-bold text-slate-300 block">
                      {lang === 'en' ? 'Escrow Fee Allocation' : lang === 'ru' ? 'Оплата Комиссии Эскроу' : 'Xidmət Haqqının Bölünməsi'}
                    </label>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        disabled={agreement.status !== 'DRAFT'}
                        onClick={() => handleFeePayerChange('split')}
                        className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                          feePayer === 'split'
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                            : 'border-slate-800 bg-slate-900/60 text-slate-400 disabled:opacity-50'
                        }`}
                      >
                        50% / 50% Bərabər
                      </button>

                      <button
                        type="button"
                        disabled={agreement.status !== 'DRAFT'}
                        onClick={() => handleFeePayerChange('buyer')}
                        className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                          feePayer === 'buyer'
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                            : 'border-slate-800 bg-slate-900/60 text-slate-400 disabled:opacity-50'
                        }`}
                      >
                        Yalnız Alıcı Ödəyir
                      </button>

                      <button
                        type="button"
                        disabled={agreement.status !== 'DRAFT'}
                        onClick={() => handleFeePayerChange('seller')}
                        className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                          feePayer === 'seller'
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                            : 'border-slate-800 bg-slate-900/60 text-slate-400 disabled:opacity-50'
                        }`}
                      >
                        Yalnız Satıcı Ödəyir
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right 1 Col: Financial Breakdown Card */}
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-4">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-emerald-400" />
                      <h4 className="font-bold text-white text-sm">
                        {lang === 'en' ? 'Deposit Calculation' : lang === 'ru' ? 'Расчет Депозита' : 'Maliyyə Yekunu'}
                      </h4>
                    </div>

                    <div className="space-y-2.5 text-xs text-slate-300">
                      <div className="flex justify-between pb-2 border-b border-slate-800">
                        <span className="text-slate-400">Avtomobilin Qiyməti:</span>
                        <strong className="text-white">{formatPrice(vehicle.priceAzn, currency)}</strong>
                      </div>
                      <div className="flex justify-between pb-2 border-b border-slate-800">
                        <span className="text-slate-400">Qorunan Beh Məbləği:</span>
                        <strong className="text-emerald-400 font-bold">{formatPrice(depositAmount, currency)}</strong>
                      </div>
                      <div className="flex justify-between pb-2 border-b border-slate-800">
                        <span className="text-slate-400">Bank Escrow Komissiyası:</span>
                        <span className="text-slate-200">{currentFees.feeAzn} AZN</span>
                      </div>
                      <div className="flex justify-between pb-2 border-b border-slate-800">
                        <span className="text-slate-400">Alıcı Payı:</span>
                        <span className="text-white font-semibold">{currentFees.buyerPaysAzn} AZN</span>
                      </div>
                      <div className="flex justify-between pb-2 border-b border-slate-800">
                        <span className="text-slate-400">Satıcı Payı:</span>
                        <span className="text-white font-semibold">{currentFees.sellerPaysAzn} AZN</span>
                      </div>
                    </div>

                    <div className="pt-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Alıcının Cəmi Ödəyəcəyi:</div>
                      <div className="text-xl font-black text-white">
                        {formatPrice(currentFees.totalBuyerPaymentAzn, currency)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Satıcıya çatacaq xalis beh: {formatPrice(currentFees.netSellerPayoutAzn, currency)}
                      </div>
                    </div>

                    {/* Escrow Contingency Protection Checklist */}
                    <div className="space-y-1.5 pt-2 text-[11px]">
                      <span className="text-slate-400 font-semibold block mb-1">Müqavilə Zəmanətləri:</span>
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Kuzov zədəsi tapılsa 100% geri qaytarılma</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Yürüş saxtalığı aşkarlandıqda 100% refund</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>DYP-də rəsmiləşmədən sonra ödəniş</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SIMULATION CONTROLS BOX */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <h4 className="font-bold text-white text-base">
                      {lang === 'en'
                        ? 'Interactive Escrow Simulation Controls'
                        : lang === 'ru'
                        ? 'Интерактивное Управление Сделкой'
                        : 'İnteraktiv Escrow Əməliyyat İdarəetmə Paneli'}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={resetSimulation}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Sıfırla</span>
                  </button>
                </div>

                {pinError && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{pinError}</span>
                  </div>
                )}

                {/* State-Aware Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Step 1: Lock Funds */}
                  <button
                    type="button"
                    disabled={agreement.status !== 'DRAFT'}
                    onClick={() => dispatchAction({ action: 'LOCK_FUNDS' })}
                    data-testid="lock-funds-btn"
                    className="p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 bg-slate-900 border-slate-700 hover:border-emerald-500 hover:bg-slate-800 disabled:opacity-40 disabled:hover:border-slate-700"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">1. Behi Bloklaşdır</span>
                      <Lock className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Bank escrow hesabında {agreement.totalBuyerPaymentAzn} AZN dondurulur və 48 saatlıq yoxlanış aktivləşir.
                    </span>
                  </button>

                  {/* Step 2A: Pass Inspection */}
                  <button
                    type="button"
                    disabled={agreement.status !== 'INSPECTION_PENDING'}
                    onClick={() =>
                      dispatchAction({
                        action: 'PASS_INSPECTION',
                        notes: '150-nöqtəli diaqnostika keçdi. Mühərrik və lonjeronlar saz vəziyyətdədir.',
                      })
                    }
                    data-testid="pass-inspection-btn"
                    className="p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 bg-slate-900 border-slate-700 hover:border-emerald-500 hover:bg-slate-800 disabled:opacity-40 disabled:hover:border-slate-700"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">2A. Diaqnostika Keçdi</span>
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Qüsur aşkar edilmədi. Tərəflər notariatda rəsmiləşdirməyə dəvət edilir.
                    </span>
                  </button>

                  {/* Step 2B: Fail Inspection */}
                  <button
                    type="button"
                    disabled={agreement.status !== 'INSPECTION_PENDING'}
                    onClick={() =>
                      dispatchAction({
                        action: 'FAIL_INSPECTION',
                        reason: 'Gizli lonjeron qəzası və 80,000 km geri çəkilmiş yürüş aşkarlandı.',
                      })
                    }
                    data-testid="fail-inspection-btn"
                    className="p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 bg-slate-900 border-slate-700 hover:border-rose-500 hover:bg-slate-800 disabled:opacity-40 disabled:hover:border-slate-700"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">2B. Qüsur Aşkarlandı</span>
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Struktur qüsur tapıldıqda beh 100% alıcıya dərhal geri qaytarılır.
                    </span>
                  </button>

                  {/* Step 3: Confirm Notary Transfer & Payout */}
                  <button
                    type="button"
                    disabled={agreement.status !== 'NOTARY_PENDING'}
                    onClick={() =>
                      dispatchAction({
                        action: 'CONFIRM_NOTARY',
                        pinCode: agreement.securityReleaseCode,
                      })
                    }
                    data-testid="confirm-notary-btn"
                    className="p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 bg-slate-900 border-slate-700 hover:border-emerald-500 hover:bg-slate-800 disabled:opacity-40 disabled:hover:border-slate-700"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">3. Notariatı Təsdiqlə</span>
                      <Unlock className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-[11px] text-slate-400">
                      DYP-də alqı-satqı bitdi, PİN kod daxil edildi, {agreement.netSellerPayoutAzn} AZN satıcıya ödənildi.
                    </span>
                  </button>

                  {/* Refund Trigger */}
                  <button
                    type="button"
                    disabled={
                      agreement.status !== 'INSPECTION_FAILED' &&
                      agreement.status !== 'INSPECTION_PENDING' &&
                      agreement.status !== 'NOTARY_PENDING'
                    }
                    onClick={() =>
                      dispatchAction({
                        action: 'REQUEST_REFUND',
                        reason: 'Alıcı müqavilə şərtlərinə uyğun olaraq 100% geri qaytarılma tələb etdi.',
                      })
                    }
                    data-testid="request-refund-btn"
                    className="p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 bg-slate-900 border-slate-700 hover:border-indigo-500 hover:bg-slate-800 disabled:opacity-40 disabled:hover:border-slate-700"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">100% Behi Geri Qaytar</span>
                      <RotateCcw className="w-4 h-4 text-indigo-400" />
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Bank kartına dərhal tam məbləğ refund edilir.
                    </span>
                  </button>

                  {/* Dispute / Arbitration Trigger */}
                  <button
                    type="button"
                    disabled={
                      agreement.status === 'RELEASED' ||
                      agreement.status === 'REFUNDED' ||
                      agreement.status === 'DRAFT' ||
                      agreement.status === 'DISPUTED'
                    }
                    onClick={() =>
                      dispatchAction({
                        action: 'RAISE_DISPUTE',
                        reason: 'Tərəflər arasında texniki qüsurların məbləği üzrə mübahisə yarandı.',
                      })
                    }
                    data-testid="raise-dispute-btn"
                    className="p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 bg-slate-900 border-slate-700 hover:border-amber-500 hover:bg-slate-800 disabled:opacity-40 disabled:hover:border-slate-700"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Mübahisə / Arbitraj Aç</span>
                      <Gavel className="w-4 h-4 text-amber-400" />
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Vəsait dondurulur və AutoNext müstəqil ekspert komissiyasına yönləndirilir.
                    </span>
                  </button>
                </div>

                {/* Dispute resolution toolbar if in dispute */}
                {agreement.status === 'DISPUTED' && (
                  <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 space-y-3">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                      <Gavel className="w-4 h-4" />
                      <span>AutoNext Arbitraj Komissiyasının Qərar Paneli</span>
                    </div>
                    <p className="text-xs text-amber-200">
                      Sənədlər və ekspert rəyi araşdırıldı. Aşağıdakı yekun qərarlardan birini icra edin:
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          dispatchAction({
                            action: 'RESOLVE_DISPUTE',
                            arbitrationResolution: 'REFUND_TO_BUYER',
                            notes: 'Gizli qüsur təsdiqləndi, beh alıcıya qaytarılır.',
                          })
                        }
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs"
                      >
                        Qərar: Alıcıya Qaytar (Refund)
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          dispatchAction({
                            action: 'RESOLVE_DISPUTE',
                            arbitrationResolution: 'RELEASE_TO_SELLER',
                            notes: 'Satıcı şərtləri pozmayıb, beh satıcıya ödənilir.',
                          })
                        }
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                      >
                        Qərar: Satıcıya Ödə (Release)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-base">
                  {lang === 'en'
                    ? 'Cryptographically Logged Audit Timeline'
                    : lang === 'ru'
                    ? 'Аудиторский Журнал Эскроу'
                    : 'Kriptoqrafik Qeydə Alınmış Əməliyyat Jurnalı'}
                </h4>
                <span className="text-xs text-slate-400">
                  {agreement.timeline.length} Hadisə Qeydə Alınıb
                </span>
              </div>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {agreement.timeline.map((event, idx) => (
                  <div key={event.id || idx} className="relative flex items-start gap-4">
                    <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-slate-900 border-2 border-emerald-500 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>

                    <div className="flex-1 p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs sm:text-sm">
                          {lang === 'en' ? event.titleEn : lang === 'ru' ? event.titleRu : event.titleAz}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        {lang === 'en' ? event.descriptionEn : lang === 'ru' ? event.descriptionRu : event.descriptionAz}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          İştirakçı: {event.actor}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">Status: {event.stage}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DIGITAL CERTIFICATE & VOUCHER */}
          {activeTab === 'certificate' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-base">
                    {lang === 'en'
                      ? 'Official Digital Escrow Certificate'
                      : lang === 'ru'
                      ? 'Официальный Цифровой Сертификат'
                      : 'Rəsmi Rəqəmsal Beh & Escrow Şəhadətnaməsi'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Mərkəzi Bankın və Notariat palatasının standartlarına uyğun tərtib edilmiş hüquqi zəmanət vərəqi.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyCertificate}
                    className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span className="hidden sm:inline">{isCopied ? 'Kopyalandı' : 'Kopyala'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintCertificate}
                    className="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span className="hidden sm:inline">Çap Et</span>
                  </button>
                </div>
              </div>

              {/* Monospace Certificate Document Box */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed select-all">
                {generateEscrowReceipt(agreement, lang)}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/70 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>256-bit SSL ilə şifrələnmiş bank klirinq protokolu</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
          >
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
};

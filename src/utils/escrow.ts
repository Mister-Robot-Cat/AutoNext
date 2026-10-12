import { Vehicle, Language } from '../types/vehicle';
import {
  EscrowBankPartner,
  EscrowFeePayer,
  EscrowFeeBreakdown,
  EscrowDepositAgreement,
  EscrowActionPayload,
  SellerIdentityDossier,
  EscrowTimelineEvent,
  EscrowStatus,
} from '../types/escrow';
import { 
  MOCK_ESCROW_BANKS, 
  DEFAULT_CONTINGENCY_RULES, 
  getSellerDossierForVehicle 
} from '../data/mockEscrowDatabase';

/**
 * Calculates bank escrow protection fee and net participant shares
 */
export function calculateEscrowFee(
  depositAmountAzn: number,
  bankPartner: EscrowBankPartner,
  feePayer: EscrowFeePayer = 'split'
): EscrowFeeBreakdown {
  const bank = MOCK_ESCROW_BANKS.find((b) => b.id === bankPartner) || MOCK_ESCROW_BANKS[0];
  const rawFee = Math.round((depositAmountAzn * bank.escrowFeePercent) / 100);
  const feeAzn = Math.max(bank.minFeeAzn, Math.min(bank.maxFeeAzn, rawFee));

  let buyerPaysAzn = 0;
  let sellerPaysAzn = 0;

  if (feePayer === 'buyer') {
    buyerPaysAzn = feeAzn;
    sellerPaysAzn = 0;
  } else if (feePayer === 'seller') {
    buyerPaysAzn = 0;
    sellerPaysAzn = feeAzn;
  } else {
    // split 50/50
    buyerPaysAzn = Math.round(feeAzn / 2);
    sellerPaysAzn = feeAzn - buyerPaysAzn;
  }

  const totalBuyerPaymentAzn = depositAmountAzn + buyerPaysAzn;
  const netSellerPayoutAzn = Math.max(0, depositAmountAzn - sellerPaysAzn);

  return {
    feeAzn,
    buyerPaysAzn,
    sellerPaysAzn,
    totalBuyerPaymentAzn,
    netSellerPayoutAzn,
  };
}

/**
 * Recommends a balanced deposit (beh) amount based on vehicle total price
 * Typically 5% of price, rounded to nearest 50 AZN, between 200 AZN and 3,000 AZN
 */
export function getRecommendedDepositAmount(vehiclePriceAzn: number): number {
  if (vehiclePriceAzn <= 0) return 200;
  const rawDeposit = Math.round((vehiclePriceAzn * 0.05) / 50) * 50;
  return Math.max(200, Math.min(3000, rawDeposit));
}

/**
 * Evaluates an authentic trust rating score (0 to 100) for a vehicle seller
 */
export function calculateSellerTrustScore(dossier: Partial<SellerIdentityDossier>): number {
  let score = 0;

  // ASAN Login / Government Digital ID verification: 30 pts
  if (dossier.asanLoginVerified) {
    score += 30;
  }

  // DYP Technical Passport (Texpasport) ownership match: up to 25 pts
  if (dossier.dypTexpasportMatch === 'owner_matched') {
    score += 25;
  } else if (dossier.dypTexpasportMatch === 'attorney_valid') {
    score += 15;
  }

  // Biometric facial match: 15 pts
  if (dossier.biometricVerified) {
    score += 15;
  }

  // Phone / OTP verification: 10 pts
  if (dossier.phoneVerified) {
    score += 10;
  }

  // Clean court / judicial record: up to 15 pts
  if (dossier.legalStatus === 'clean') {
    score += 15;
  } else if (dossier.legalStatus === 'minor_fines') {
    score += 8;
  }

  // Penalties
  if (dossier.hasActiveEnforcement) {
    score -= 20;
  }
  if (dossier.hasPoliceWantedCheck === false) {
    score -= 30;
  }

  // Deals completed bonus (max 5 pts)
  const dealsBonus = Math.min(5, Math.floor((dossier.totalDealsCompleted || 0) / 5));
  score += dealsBonus;

  return Math.max(0, Math.min(100, score));
}

export interface SellerBadgeInfo {
  tierNameAz: string;
  tierNameEn: string;
  tierNameRu: string;
  colorClass: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  descriptionAz: string;
  descriptionEn: string;
  descriptionRu: string;
}

export function getSellerTrustBadge(score: number): SellerBadgeInfo {
  if (score >= 90) {
    return {
      tierNameAz: 'Doğrulanmış Elit Mülkiyyətçi',
      tierNameEn: 'Verified Elite Owner',
      tierNameRu: 'Проверенный Элитный Владелец',
      colorClass: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10',
      badgeBorder: 'border-emerald-500/30',
      badgeText: 'text-emerald-400',
      descriptionAz: 'ASAN Login, DİN texpasport və biometrik identifikasiya tam təsdiqlənib.',
      descriptionEn: 'Full ASAN Login, Police vehicle passport, and biometric verification confirmed.',
      descriptionRu: 'Полная верификация через ASAN Login, техпаспорт МВД и биометрию подтверждена.',
    };
  }

  if (score >= 75) {
    return {
      tierNameAz: 'Etibarlı Satıcı (Təsdiqlənmiş)',
      tierNameEn: 'Trusted Seller (Verified)',
      tierNameRu: 'Надежный Продавец (Проверен)',
      colorClass: 'text-blue-400',
      badgeBg: 'bg-blue-500/10',
      badgeBorder: 'border-blue-500/30',
      badgeText: 'text-blue-400',
      descriptionAz: 'Şəxsiyyət və sənədlər doğrulanıb, notariat etibarnaməsi qüvvədədir.',
      descriptionEn: 'Identity and documents verified, power of attorney in good standing.',
      descriptionRu: 'Личность и документы проверены, доверенность действительна.',
    };
  }

  if (score >= 50) {
    return {
      tierNameAz: 'Baza Yoxlanışlı Satıcı',
      tierNameEn: 'Basic Verified Seller',
      tierNameRu: 'Базовая Проверка',
      colorClass: 'text-amber-400',
      badgeBg: 'bg-amber-500/10',
      badgeBorder: 'border-amber-500/30',
      badgeText: 'text-amber-400',
      descriptionAz: 'Yalnız telefon və qismən şəxsiyyət yoxlanılıb. Əlavə diaqnostika tövsiyə edilir.',
      descriptionEn: 'Only phone and partial ID verified. Thorough diagnostic recommended.',
      descriptionRu: 'Проверен только телефон и базовые данные. Рекомендуется диагностика.',
    };
  }

  return {
    tierNameAz: 'Yoxlanılmamış / Yüksək Risk',
    tierNameEn: 'Unverified / High Risk',
    tierNameRu: 'Не проверен / Высокий Риск',
    colorClass: 'text-rose-400',
    badgeBg: 'bg-rose-500/10',
    badgeBorder: 'border-rose-500/30',
    badgeText: 'text-rose-400',
    descriptionAz: 'Məlumatlar doğrulanmayıb. Yalnız rəsmi bank escrow xidməti ilə beh ödəyin.',
    descriptionEn: 'Data unverified. Only pay deposit via official bank escrow protection.',
    descriptionRu: 'Данные не подтверждены. Оплачивайте задаток только через официальный эскроу.',
  };
}

/**
 * Generates a random 6-digit security code for escrow payout release
 */
export function generateEscrowSecurityPin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Initializes a full Escrow Deposit Agreement instance for a vehicle
 */
export function createInitialEscrowAgreement(
  vehicle: Vehicle,
  options?: {
    depositAmountAzn?: number;
    bankPartner?: EscrowBankPartner;
    feePayer?: EscrowFeePayer;
  }
): EscrowDepositAgreement {
  const depositAmountAzn = options?.depositAmountAzn ?? getRecommendedDepositAmount(vehicle.priceAzn);
  const bankPartner = options?.bankPartner ?? 'kapital_bank';
  const feePayer = options?.feePayer ?? 'split';
  const feeBreakdown = calculateEscrowFee(depositAmountAzn, bankPartner, feePayer);
  const sellerDossier = getSellerDossierForVehicle(vehicle);

  const now = new Date();
  const inspectionDate = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const notaryDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

  const initialTimeline: EscrowTimelineEvent[] = [
    {
      id: 'event-init',
      timestamp: now.toISOString(),
      stage: 'DRAFT',
      titleAz: 'Beh Müqaviləsi Qaralaması Yaradıldı',
      titleEn: 'Escrow Agreement Draft Created',
      titleRu: 'Черновик Соглашения Эскроу Создан',
      descriptionAz: `${depositAmountAzn} AZN məbləğində beh və texniki şərtlər müəyyən edildi.`,
      descriptionEn: `Deposit amount of ${depositAmountAzn} AZN and inspection contingencies defined.`,
      descriptionRu: `Определен задаток ${depositAmountAzn} AZN и условия технической проверки.`,
      actor: 'buyer',
    },
  ];

  const escrowId = `ESC-2026-AZ-${Math.floor(1000 + Math.random() * 9000)}`;
  const securityReleaseCode = generateEscrowSecurityPin();

  return {
    escrowId,
    vehicleId: vehicle.id,
    vehicleTitle: vehicle.title,
    vehicleVin: vehicle.vin,
    vehiclePriceAzn: vehicle.priceAzn,
    depositAmountAzn,
    feePayer,
    feeBreakdown,
    totalBuyerPaymentAzn: feeBreakdown.totalBuyerPaymentAzn,
    netSellerPayoutAzn: feeBreakdown.netSellerPayoutAzn,
    bankPartner,
    status: 'DRAFT',
    createdAt: now.toISOString(),
    inspectionDeadline: inspectionDate.toISOString(),
    notaryDeadline: notaryDate.toISOString(),
    sellerDossier,
    contingencyRules: { ...DEFAULT_CONTINGENCY_RULES },
    timeline: initialTimeline,
    securityReleaseCode,
  };
}

/**
 * State machine transition function for escrow lifecycle
 */
export function transitionEscrowStatus(
  current: EscrowDepositAgreement,
  payload: EscrowActionPayload
): EscrowDepositAgreement {
  const now = new Date().toISOString();
  const bank = MOCK_ESCROW_BANKS.find((b) => b.id === current.bankPartner) || MOCK_ESCROW_BANKS[0];

  switch (payload.action) {
    case 'LOCK_FUNDS': {
      if (current.status !== 'DRAFT') {
        throw new Error(`Cannot lock funds from current status: ${current.status}`);
      }
      const newEvent: EscrowTimelineEvent = {
        id: `event-${Date.now()}`,
        timestamp: now,
        stage: 'INSPECTION_PENDING',
        titleAz: `${bank.shortName} Escrow Hesabında Vəsait Bloklaşdırıldı`,
        titleEn: `Funds Locked in ${bank.shortName} Escrow Account`,
        titleRu: `Средства Заблокированы на Эскроу Счете ${bank.shortName}`,
        descriptionAz: `${current.totalBuyerPaymentAzn} AZN vəsait donduruldu. 48 saatlıq ekspertiza müddəti aktivdir.`,
        descriptionEn: `${current.totalBuyerPaymentAzn} AZN securely held. 48-hour inspection contingency active.`,
        descriptionRu: `${current.totalBuyerPaymentAzn} AZN надежно заморожены. Активировано 48ч на проверку.`,
        actor: 'bank',
      };
      return {
        ...current,
        status: 'INSPECTION_PENDING',
        timeline: [newEvent, ...current.timeline],
      };
    }

    case 'PASS_INSPECTION': {
      if (current.status !== 'INSPECTION_PENDING') {
        throw new Error(`Cannot pass inspection from status: ${current.status}`);
      }
      const newEvent: EscrowTimelineEvent = {
        id: `event-${Date.now()}`,
        timestamp: now,
        stage: 'NOTARY_PENDING',
        titleAz: 'Diaqnostika Uğurla Başa Çatdı (Şərtlər Ödənildi)',
        titleEn: 'Inspection Passed (Contingency Cleared)',
        titleRu: 'Диагностика Успешно Завершена (Условия Выполнены)',
        descriptionAz: 'Struktur zədə və yürüş müdaxiləsi aşkarlanmadı. Notariat qeydiyyatı gözlənilir.',
        descriptionEn: 'No structural defects or odometer tampering detected. Awaiting notary transfer.',
        descriptionRu: 'Дефекты кузова и скрутка пробега не обнаружены. Ожидается нотариат.',
        actor: 'expert',
      };
      return {
        ...current,
        status: 'NOTARY_PENDING',
        inspectionNotes: payload.notes || '150-nöqtəli yoxlanışdan keçdi. Əsas aqreqatlar saz vəziyyətdədir.',
        timeline: [newEvent, ...current.timeline],
      };
    }

    case 'FAIL_INSPECTION': {
      if (current.status !== 'INSPECTION_PENDING') {
        throw new Error(`Cannot fail inspection from status: ${current.status}`);
      }
      const reason = payload.reason || 'Kuzov lonjeronunda gizli təmir və mühərrikdə kritik sızma aşkar edildi.';
      const newEvent: EscrowTimelineEvent = {
        id: `event-${Date.now()}`,
        timestamp: now,
        stage: 'INSPECTION_FAILED',
        titleAz: 'Diaqnostikada Qüsur Aşkarlandı (Beh Qaytarılmalıdır)',
        titleEn: 'Inspection Failed (Eligible for Full Refund)',
        titleRu: 'Обнаружен Критический Дефект (Возврат Задатка)',
        descriptionAz: `Qüsur: ${reason}. Müqaviləyə əsasən beh alıcıya 100% geri qaytarılır.`,
        descriptionEn: `Defect: ${reason}. Pursuant to contract, 100% deposit is refunded to buyer.`,
        descriptionRu: `Дефект: ${reason}. По условиям договора задаток возвращается покупателю на 100%.`,
        actor: 'expert',
      };
      return {
        ...current,
        status: 'INSPECTION_FAILED',
        inspectionNotes: reason,
        timeline: [newEvent, ...current.timeline],
      };
    }

    case 'CONFIRM_NOTARY': {
      if (current.status !== 'NOTARY_PENDING') {
        throw new Error(`Cannot confirm notary transfer from status: ${current.status}`);
      }
      const isPinProvided = payload.pinCode && payload.pinCode.trim() === current.securityReleaseCode;
      const newEvent: EscrowTimelineEvent = {
        id: `event-${Date.now()}`,
        timestamp: now,
        stage: 'RELEASED',
        titleAz: 'ASAN Xidmət / DYP Qeydiyyatı Tamamlandı & Beh Ödənildi',
        titleEn: 'DYP Vehicle Transfer Completed & Escrow Payout Released',
        titleRu: 'Переоформление в ASAN/ГАИ Завершено & Задаток Выплачен',
        descriptionAz: `${current.netSellerPayoutAzn} AZN məbləğində vəsait satıcının bank hesabına köçürüldü. PIN: ${isPinProvided ? 'Təsdiqləndi' : 'İmzalandı'}.`,
        descriptionEn: `${current.netSellerPayoutAzn} AZN released to seller account. PIN: ${isPinProvided ? 'Verified' : 'Mutual release'}.`,
        descriptionRu: `${current.netSellerPayoutAzn} AZN выплачены продавцу. PIN: ${isPinProvided ? 'Подтвержден' : 'Одобрено'}.`,
        actor: 'notary',
      };
      return {
        ...current,
        status: 'RELEASED',
        timeline: [newEvent, ...current.timeline],
      };
    }

    case 'REQUEST_REFUND': {
      if (
        current.status !== 'INSPECTION_FAILED' &&
        current.status !== 'INSPECTION_PENDING' &&
        current.status !== 'NOTARY_PENDING'
      ) {
        throw new Error(`Refund not permitted from current status: ${current.status}`);
      }
      const refundReason = payload.reason || 'Avtomobildə gizli struktur qüsur aşkar olunduğu üçün beh geri qaytarıldı.';
      const newEvent: EscrowTimelineEvent = {
        id: `event-${Date.now()}`,
        timestamp: now,
        stage: 'REFUNDED',
        titleAz: 'Beh Alıcının Kartına Tam Geri Qaytarıldı (100% Refund)',
        titleEn: '100% Deposit Refunded to Buyer Account',
        titleRu: '100% Задаток Возвращен на Карту Покупателя',
        descriptionAz: `${current.totalBuyerPaymentAzn} AZN məbləğində vəsait dərhal alıcının hesabına bərpa edildi. Səbəb: ${refundReason}`,
        descriptionEn: `${current.totalBuyerPaymentAzn} AZN instantly restored to buyer account. Reason: ${refundReason}`,
        descriptionRu: `${current.totalBuyerPaymentAzn} AZN мгновенно возвращены на карту покупателя. Причина: ${refundReason}`,
        actor: 'bank',
      };
      return {
        ...current,
        status: 'REFUNDED',
        disputeNotes: refundReason,
        timeline: [newEvent, ...current.timeline],
      };
    }

    case 'RAISE_DISPUTE': {
      if (current.status === 'RELEASED' || current.status === 'REFUNDED' || current.status === 'DRAFT') {
        throw new Error(`Cannot dispute an already finalized or draft agreement`);
      }
      const disputeReason = payload.reason || 'Tərəflər arasında texniki və ya hüquqi anlaşılmazlıq yarandı.';
      const newEvent: EscrowTimelineEvent = {
        id: `event-${Date.now()}`,
        timestamp: now,
        stage: 'DISPUTED',
        titleAz: 'AutoNext Müstəqil Arbitrajına Müraciət Olundu (Vəsait Donduruldu)',
        titleEn: 'Dispute Raised: Escrow Funds Frozen Under Arbitration',
        titleRu: 'Открыт Спор: Средства Заморожены в Арбитраже',
        descriptionAz: `Mübahisə səbəbi: ${disputeReason}. Arbitraj komissiyası 24 saat ərzində qərar verəcək.`,
        descriptionEn: `Reason: ${disputeReason}. Arbitration board will issue ruling within 24 hours.`,
        descriptionRu: `Причина: ${disputeReason}. Арбитражная комиссия вынесет решение в течение 24 часов.`,
        actor: 'arbitrator',
      };
      return {
        ...current,
        status: 'DISPUTED',
        disputeNotes: disputeReason,
        timeline: [newEvent, ...current.timeline],
      };
    }

    case 'RESOLVE_DISPUTE': {
      if (current.status !== 'DISPUTED') {
        throw new Error(`Cannot resolve dispute when status is not DISPUTED`);
      }
      const resolution = payload.arbitrationResolution || 'REFUND_TO_BUYER';
      const targetStatus: EscrowStatus = resolution === 'REFUND_TO_BUYER' ? 'REFUNDED' : 'RELEASED';
      const resolutionDescAz = resolution === 'REFUND_TO_BUYER'
        ? `Arbitraj qərarı: Qüsurlar təsdiqləndi. ${current.totalBuyerPaymentAzn} AZN alıcıya qaytarıldı.`
        : `Arbitraj qərarı: Satıcının öhdəlikləri yerinə yetirildi. ${current.netSellerPayoutAzn} AZN satıcıya ödənildi.`;
      const resolutionDescEn = resolution === 'REFUND_TO_BUYER'
        ? `Arbitration ruling: Defects confirmed. ${current.totalBuyerPaymentAzn} AZN refunded to buyer.`
        : `Arbitration ruling: Seller terms fulfilled. ${current.netSellerPayoutAzn} AZN released to seller.`;
      const resolutionDescRu = resolution === 'REFUND_TO_BUYER'
        ? `Решение арбитража: Дефекты подтверждены. ${current.totalBuyerPaymentAzn} AZN возвращены покупателю.`
        : `Решение арбитража: Условия соблюдены. ${current.netSellerPayoutAzn} AZN выплачены продавцу.`;

      const newEvent: EscrowTimelineEvent = {
        id: `event-${Date.now()}`,
        timestamp: now,
        stage: targetStatus,
        titleAz: 'Arbitraj Qərarı İcra Olundu',
        titleEn: 'Arbitration Ruling Executed',
        titleRu: 'Решение Арбитража Исполнено',
        descriptionAz: resolutionDescAz,
        descriptionEn: resolutionDescEn,
        descriptionRu: resolutionDescRu,
        actor: 'arbitrator',
      };
      return {
        ...current,
        status: targetStatus,
        disputeNotes: `Həll edildi (${resolution}): ${payload.notes || 'Qərar icra olundu.'}`,
        timeline: [newEvent, ...current.timeline],
      };
    }

    default:
      return current;
  }
}

/**
 * Generates official formatted text certificate / receipt for the escrow holding
 */
export function generateEscrowReceipt(agreement: EscrowDepositAgreement, lang: Language = 'az'): string {
  const bank = MOCK_ESCROW_BANKS.find((b) => b.id === agreement.bankPartner) || MOCK_ESCROW_BANKS[0];

  if (lang === 'en') {
    return [
      `=============================================================`,
      `       AUTONEXT SECURE DIGITAL ESCROW CERTIFICATE            `,
      `=============================================================`,
      `Escrow Reference ID : ${agreement.escrowId}`,
      `Created At          : ${new Date(agreement.createdAt).toLocaleString('en-US')}`,
      `Escrow Vault Bank   : ${bank.name} (${bank.licensedBy})`,
      `Status              : ${agreement.status}`,
      `-------------------------------------------------------------`,
      `VEHICLE DETAILS:`,
      `Title               : ${agreement.vehicleTitle}`,
      `VIN                 : ${agreement.vehicleVin}`,
      `Agreed Sale Price   : ${agreement.vehiclePriceAzn.toLocaleString()} AZN`,
      `-------------------------------------------------------------`,
      `ESCROW FINANCIALS:`,
      `Protected Deposit   : ${agreement.depositAmountAzn.toLocaleString()} AZN`,
      `Service Escrow Fee  : ${agreement.feeBreakdown.feeAzn} AZN (Payer: ${agreement.feePayer})`,
      `Buyer Payment Total : ${agreement.feeBreakdown.totalBuyerPaymentAzn.toLocaleString()} AZN`,
      `Seller Net Payout   : ${agreement.feeBreakdown.netSellerPayoutAzn.toLocaleString()} AZN`,
      `-------------------------------------------------------------`,
      `SELLER VERIFICATION:`,
      `Verified Name       : ${agreement.sellerDossier.fullName}`,
      `ID FIN (Masked)     : ${agreement.sellerDossier.finCodeMasked}`,
      `ASAN Login Status   : ${agreement.sellerDossier.asanLoginVerified ? 'VERIFIED' : 'UNVERIFIED'}`,
      `Police Registration : ${agreement.sellerDossier.dypTexpasportMatch.toUpperCase()}`,
      `Trust Score         : ${agreement.sellerDossier.trustScore} / 100`,
      `Security Release PIN: ${agreement.securityReleaseCode}`,
      `=============================================================`,
    ].join('\n');
  }

  if (lang === 'ru') {
    return [
      `=============================================================`,
      `     СЕРТИФИКАТ ЦИФРОВОГО ЭСКРОУ ЗАДАТКА AUTONEXT           `,
      `=============================================================`,
      `Номер Сделки        : ${agreement.escrowId}`,
      `Дата Создания       : ${new Date(agreement.createdAt).toLocaleString('ru-RU')}`,
      `Банк-Хранитель      : ${bank.name} (${bank.licensedBy})`,
      `Текущий Статус      : ${agreement.status}`,
      `-------------------------------------------------------------`,
      `ДАННЫЕ АВТОМОБИЛЯ:`,
      `Модель              : ${agreement.vehicleTitle}`,
      `VIN-номер           : ${agreement.vehicleVin}`,
      `Стоимость Авто      : ${agreement.vehiclePriceAzn.toLocaleString()} AZN`,
      `-------------------------------------------------------------`,
      `ФИНАНСОВЫЕ УСЛОВИЯ:`,
      `Сумма Задатка       : ${agreement.depositAmountAzn.toLocaleString()} AZN`,
      `Комиссия Эскроу     : ${agreement.feeBreakdown.feeAzn} AZN (Плательщик: ${agreement.feePayer})`,
      `Итого к Оплате      : ${agreement.feeBreakdown.totalBuyerPaymentAzn.toLocaleString()} AZN`,
      `К Выплате Продавцу  : ${agreement.feeBreakdown.netSellerPayoutAzn.toLocaleString()} AZN`,
      `-------------------------------------------------------------`,
      `ВЕРИФИКАЦИЯ ПРОДАВЦА:`,
      `ФИО Продавца        : ${agreement.sellerDossier.fullName}`,
      `FIN-код             : ${agreement.sellerDossier.finCodeMasked}`,
      `ASAN Login Статус   : ${agreement.sellerDossier.asanLoginVerified ? 'ПОДТВЕРЖДЕН' : 'НЕ ПОДТВЕРЖДЕН'}`,
      `Сверка Техпаспорта  : ${agreement.sellerDossier.dypTexpasportMatch.toUpperCase()}`,
      `Рейтинг Доверия     : ${agreement.sellerDossier.trustScore} / 100`,
      `Код Разблокировки   : ${agreement.securityReleaseCode}`,
      `=============================================================`,
    ].join('\n');
  }

  // Azerbaijani default
  return [
    `=============================================================`,
    `      AUTONEXT RƏQƏMSAL BEH & ESCROW TƏHLÜKƏSİZLİK SERTİFİKATI`,
    `=============================================================`,
    `Əməliyyat Nömrəsi   : ${agreement.escrowId}`,
    `Yaradılma Tarixi    : ${new Date(agreement.createdAt).toLocaleString('az-AZ')}`,
    `Zamin Bank          : ${bank.name} (${bank.licensedBy})`,
    `Cari Status         : ${agreement.status}`,
    `-------------------------------------------------------------`,
    `AVTOMOBİL MƏLUMATLARI:`,
    `Marka və Model      : ${agreement.vehicleTitle}`,
    `VIN Kodu            : ${agreement.vehicleVin}`,
    `Razılaşdırılmış Qiymət: ${agreement.vehiclePriceAzn.toLocaleString()} AZN`,
    `-------------------------------------------------------------`,
    `RƏQƏMSAL BEH HESABATI:`,
    `Qorunan Beh Məbləği : ${agreement.depositAmountAzn.toLocaleString()} AZN`,
    `Escrow Xidmət Haqqı : ${agreement.feeBreakdown.feeAzn} AZN (Ödəyici: ${agreement.feePayer})`,
    `Alıcının Ödənişi    : ${agreement.feeBreakdown.totalBuyerPaymentAzn.toLocaleString()} AZN`,
    `Satıcıya Çatacaq    : ${agreement.feeBreakdown.netSellerPayoutAzn.toLocaleString()} AZN`,
    `-------------------------------------------------------------`,
    `SATICI EYNİLƏŞDİRMƏSİ (ŞƏXSİYYƏT DOSYESİ):`,
    `Satıcının Adı       : ${agreement.sellerDossier.fullName}`,
    `FİN Kodu            : ${agreement.sellerDossier.finCodeMasked}`,
    `ASAN Login Statusu  : ${agreement.sellerDossier.asanLoginVerified ? 'TƏSDİQLƏNDİ' : 'TƏSDİQLƏNMƏYİB'}`,
    `DYP Texpasport Uyğunluğu: ${agreement.sellerDossier.dypTexpasportMatch.toUpperCase()}`,
    `Etibarlılıq Balı    : ${agreement.sellerDossier.trustScore} / 100`,
    `Məxfilik Kodu (PİN) : ${agreement.securityReleaseCode}`,
    `=============================================================`,
  ].join('\n');
}

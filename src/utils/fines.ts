import { Currency } from '../types/vehicle';
import {
  ViolationProtocol,
  FineCalculationSummary,
  DriverPointsSummary,
  PointsRiskLevel,
  PaymentMethodType,
  FinePaymentReceipt,
  ClearanceCertificate,
} from '../types/fines';
import { MOCK_PROTOCOLS_DATABASE } from '../data/mockFinesData';
import { CURRENCY_RATES } from './i18n';

/**
 * Normalizes vehicle plate numbers by stripping whitespace and dashes, uppercasing
 * e.g. "90-mj-318" -> "90MJ318", "99 AA 777" -> "99AA777"
 */
export function normalizePlateNumber(plate: string): string {
  return (plate || '').replace(/[\s\-_]/g, '').toUpperCase();
}

/**
 * Formats a normalized or raw plate string into standard Azerbaijan display format
 * e.g. "90MJ318" -> "90-MJ-318"
 */
export function formatPlateDisplay(plate: string): string {
  const clean = normalizePlateNumber(plate);
  if (/^(\d{2})([A-Z]{2})(\d{3})$/.test(clean)) {
    return clean.replace(/^(\d{2})([A-Z]{2})(\d{3})$/, '$1-$2-$3');
  }
  return plate;
}

/**
 * Checks whether the legal 50% early payment discount is currently active
 * Under Azerbaijan Administrative Offences Code, 50% discount applies if paid within 30 days of notice
 */
export function isDiscountActive(discountDeadline: string, referenceDate: Date = new Date()): boolean {
  if (!discountDeadline) return false;
  const deadlineTime = new Date(discountDeadline).getTime();
  const currentTime = referenceDate.getTime();
  return currentTime <= deadlineTime;
}

export interface ProtocolPayableResult {
  payableAzn: number;
  isDiscountApplied: boolean;
  savingsAzn: number;
  convertedPayable: number;
  convertedSavings: number;
  currency: Currency;
}

/**
 * Calculates current payable amount for a single violation protocol
 */
export function calculateProtocolPayable(
  protocol: ViolationProtocol,
  currency: Currency = 'AZN',
  referenceDate: Date = new Date()
): ProtocolPayableResult {
  if (protocol.status === 'paid') {
    return {
      payableAzn: 0,
      isDiscountApplied: false,
      savingsAzn: 0,
      convertedPayable: 0,
      convertedSavings: 0,
      currency,
    };
  }

  const discountEligible = isDiscountActive(protocol.discountDeadline, referenceDate);
  let payableAzn = protocol.amountAzn;
  let savingsAzn = 0;

  if (discountEligible && protocol.discountPercent > 0) {
    const discounted = Math.round(protocol.amountAzn * (1 - protocol.discountPercent / 100));
    payableAzn = discounted;
    savingsAzn = protocol.amountAzn - discounted;
  }

  const rate = CURRENCY_RATES[currency] || 1.0;
  const convertedPayable = Math.round(payableAzn / rate);
  const convertedSavings = Math.round(savingsAzn / rate);

  return {
    payableAzn,
    isDiscountApplied: discountEligible,
    savingsAzn,
    convertedPayable,
    convertedSavings,
    currency,
  };
}

/**
 * Aggregates statistics and calculations across a set of protocols
 */
export function calculateFineSummary(
  protocols: ViolationProtocol[],
  currency: Currency = 'AZN',
  referenceDate: Date = new Date()
): FineCalculationSummary {
  let unpaidCount = 0;
  let paidCount = 0;
  let totalOriginalAmountAzn = 0;
  let totalDiscountedAmountAzn = 0;
  let totalSavingsAzn = 0;
  let totalPoints = 0;

  for (const protocol of protocols) {
    if (protocol.status === 'paid') {
      paidCount++;
    } else {
      unpaidCount++;
      totalOriginalAmountAzn += protocol.amountAzn;
      totalPoints += protocol.penaltyPoints;

      const calc = calculateProtocolPayable(protocol, currency, referenceDate);
      totalDiscountedAmountAzn += calc.payableAzn;
      totalSavingsAzn += calc.savingsAzn;
    }
  }

  const rate = CURRENCY_RATES[currency] || 1.0;

  return {
    totalProtocols: protocols.length,
    unpaidProtocols: unpaidCount,
    paidProtocols: paidCount,
    totalOriginalAmountAzn,
    totalDiscountedAmountAzn,
    totalSavingsAzn,
    totalPoints,
    convertedTotalAmount: Math.round(totalOriginalAmountAzn / rate),
    convertedDiscountedAmount: Math.round(totalDiscountedAmountAzn / rate),
    convertedSavings: Math.round(totalSavingsAzn / rate),
    currency,
  };
}

/**
 * Evaluates driver demerit points against Azerbaijan statutory limits
 * Under Article 342.1-1 of the Code of Administrative Offences, accumulating 12 points results in license suspension
 */
export function evaluateDriverPoints(points: number): DriverPointsSummary {
  const maxAllowedPoints = 12;
  const normalizedPoints = Math.max(0, points);
  const remaining = Math.max(0, maxAllowedPoints - normalizedPoints);

  let riskLevel: PointsRiskLevel = 'safe';
  let warningMessageAz = 'Sürücülük balınız təhlükəsiz zonadadır. Qaydalara riayət etməyə davam edin.';
  let warningMessageEn = 'Your driver demerit points are in the safe zone. Continue driving safely.';
  let warningMessageRu = 'Штрафные баллы водителя в безопасной зоне. Соблюдайте ПДД.';

  if (normalizedPoints >= maxAllowedPoints) {
    riskLevel = 'suspended';
    warningMessageAz = 'KRİTİK HƏDD: 12 bal toplanmışdır! İnzibati Xətalar Məcəlləsinin 342.1-1 maddəsinə əsasən sürücülük hüququ 6 aydan 1 ilədək məhdudlaşdırılır.';
    warningMessageEn = 'CRITICAL LIMIT: 12 demerit points accumulated! Under Article 342.1-1 of the Code, driving license is subject to suspension for 6 to 12 months.';
    warningMessageRu = 'КРИТИЧЕСКИЙ ПРЕДЕЛ: Набрано 12 баллов! Согласно ст. 342.1-1 КоАП, право управления подлежит лишению на срок от 6 месяцев до 1 года.';
  } else if (normalizedPoints >= 8) {
    riskLevel = 'critical';
    warningMessageAz = `YÜKSƏK RİSK: Cəmi ${remaining} bal qalıb! Növbəti qayda pozuntusu sürücülük hüququndan məhrumetmə ilə nəticələnə bilər.`;
    warningMessageEn = `HIGH RISK: Only ${remaining} point(s) remaining! A subsequent violation may trigger license suspension.`;
    warningMessageRu = `ВЫСОКИЙ РИСК: Осталось всего ${remaining} балла(ов)! Следующее нарушение может привести к лишению прав.`;
  } else if (normalizedPoints >= 4) {
    riskLevel = 'warning';
    warningMessageAz = `DİQQƏT: ${normalizedPoints} cərimə balınız qeydə alınıb. Sürücülük hüququnun məhdudlaşdırılmasına ${remaining} bal qalır.`;
    warningMessageEn = `CAUTION: ${normalizedPoints} active demerit points recorded. ${remaining} points remain until license suspension.`;
    warningMessageRu = `ВНИМАНИЕ: Накоплено ${normalizedPoints} штрафных баллов. До ограничения права управления осталось ${remaining} баллов.`;
  }

  return {
    totalActivePoints: normalizedPoints,
    maxAllowedPoints,
    riskLevel,
    remainingPointsBeforeSuspension: remaining,
    warningMessageAz,
    warningMessageEn,
    warningMessageRu,
  };
}

/**
 * Searches the protocols database by plate number, protocol number, or texpasport series
 */
export function searchProtocols(
  query: string,
  database: ViolationProtocol[] = MOCK_PROTOCOLS_DATABASE
): ViolationProtocol[] {
  const trimmed = (query || '').trim();
  if (!trimmed) return database;

  const cleanQuery = normalizePlateNumber(trimmed);

  return database.filter((p) => {
    const cleanPlate = normalizePlateNumber(p.plateNumber);
    const cleanProtocol = normalizePlateNumber(p.protocolNumber);
    const cleanTexpasport = normalizePlateNumber(p.texpasportSeries || '');

    return (
      cleanPlate.includes(cleanQuery) ||
      cleanProtocol.includes(cleanQuery) ||
      cleanTexpasport.includes(cleanQuery) ||
      p.location.toLowerCase().includes(trimmed.toLowerCase()) ||
      p.titleAz.toLowerCase().includes(trimmed.toLowerCase())
    );
  });
}

/**
 * Retrieves all protocols for a specific vehicle by plate number or VIN
 */
export function getProtocolsForVehicle(
  plateNumber?: string,
  vin?: string,
  database: ViolationProtocol[] = MOCK_PROTOCOLS_DATABASE
): ViolationProtocol[] {
  if (!plateNumber && !vin) return [];

  const cleanPlate = plateNumber ? normalizePlateNumber(plateNumber) : '';

  const matched = database.filter((p) => {
    if (cleanPlate && normalizePlateNumber(p.plateNumber) === cleanPlate) {
      return true;
    }
    return false;
  });

  return matched;
}

/**
 * Simulates fine payment execution through AsanPay or Government Payment Portal (HÖP)
 */
export function simulateFinePayment(
  protocolNumbers: string[],
  plateNumber: string,
  payerName: string,
  paymentMethod: PaymentMethodType = 'AsanPay',
  currency: Currency = 'AZN',
  protocolsList: ViolationProtocol[] = MOCK_PROTOCOLS_DATABASE
): FinePaymentReceipt {
  const targetProtocols = protocolsList.filter((p) => protocolNumbers.includes(p.protocolNumber));
  
  const totalPaidAzn = targetProtocols.reduce((sum, p) => {
    const calc = calculateProtocolPayable(p, 'AZN');
    return sum + calc.payableAzn;
  }, 0);

  const rate = CURRENCY_RATES[currency] || 1.0;
  const totalPaidConverted = Math.round(totalPaidAzn / rate);

  const randomHash = Math.random().toString(36).substring(2, 8).toUpperCase();
  const dateStr = new Date().toISOString();
  const receiptNumber = `ASAN-PAY-${new Date().getFullYear()}-${randomHash}`;
  const transactionReference = `TXN-BDYP-${Date.now().toString().slice(-8)}`;

  return {
    receiptNumber,
    protocolNumbers,
    plateNumber: formatPlateDisplay(plateNumber),
    paidAmountAzn: totalPaidAzn,
    paidAmountConverted: totalPaidConverted,
    currency,
    paymentDate: dateStr,
    transactionReference,
    paymentMethod,
    payerFullName: payerName || 'Vətəndaş (Sürücü)',
    status: 'completed',
  };
}

/**
 * Generates official BDYP "Cərimə Borcunun Olmaması Haqqında Arayış"
 * (Clean Traffic Record & No Outstanding Fines Certificate)
 */
export function generateClearanceCertificate(
  plateNumber: string,
  vin?: string,
  ownerName?: string
): ClearanceCertificate {
  const today = new Date();
  const validUntil = new Date(today);
  validUntil.setDate(today.getDate() + 30); // Valid for 30 calendar days

  const hashPart1 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const hashPart2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const securityHash = `BDYP-SEC-${hashPart1}-${hashPart2}`;

  const certNumber = `ARAYIS-BDYP-${today.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  return {
    certificateNumber: certNumber,
    plateNumber: formatPlateDisplay(plateNumber),
    vin: vin || 'VIN-MOCK-AZ-VERIFIED',
    ownerName: ownerName || 'Nəqliyyat Vasitəsinin Sahibi',
    issueDate: today.toISOString().split('T')[0],
    validUntil: validUntil.toISOString().split('T')[0],
    securityHash,
    issuingAuthority: 'Daxili İşlər Nazirliyi Baş Dövlət Yol Polisi İdarəsi (BDYPİ MMX)',
    isClean: true,
  };
}

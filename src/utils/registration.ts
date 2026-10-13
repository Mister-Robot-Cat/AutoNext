import { Vehicle, Currency } from '../types/vehicle';
import {
  PlateOptionType,
  VipPlateTier,
  PlateDetails,
  TransferDutyBreakdown,
  DocumentChecklistStatus,
  RegistrationAppointment,
} from '../types/registration';
import { MOCK_REGISTRATION_DIVISIONS } from '../data/mockRegistrationData';
import { formatPrice } from './i18n';

/**
 * Classifies Azerbaijan vehicle license plate into prestige tiers
 * according to national state duty tariffs and public auction guidelines.
 */
export function classifyLicensePlate(
  regionCode: string,
  letters: string,
  numbers: string
): PlateDetails {
  const cleanRegion = (regionCode || '99').trim();
  const cleanLetters = (letters || 'AA').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2).padEnd(2, 'A');
  const cleanNumbers = (numbers || '001').replace(/\D/g, '').slice(0, 3).padStart(3, '0');
  const fullPlate = `${cleanRegion}-${cleanLetters}-${cleanNumbers}`;

  const isTwinLetters = cleanLetters[0] === cleanLetters[1];
  const goldSingles = ['001', '002', '003', '004', '005', '006', '007', '008', '009', '777'];
  const triples = ['111', '222', '333', '444', '555', '666', '888', '999'];
  const hundreds = ['100', '200', '300', '400', '500', '600', '700', '800', '900'];
  const mirrors = [
    '010', '020', '030', '040', '050', '060', '070', '080', '090',
    '101', '202', '303', '404', '505', '606', '707', '808', '909',
  ];

  let tier: VipPlateTier = 'standard';
  let surchargeAzn = 0;
  let tierNameAz = 'Standart Dövlət Qeydiyyat Nişanı';
  let tierNameEn = 'Standard State License Plate';
  let tierNameRu = 'Стандартный государственный номер';

  if (goldSingles.includes(cleanNumbers) && isTwinLetters) {
    tier = 'elite_twin';
    surchargeAzn = 5000;
    tierNameAz = 'Elit Qoşa Hərf & Qızıl Seriya';
    tierNameEn = 'Elite Twin Letters & Gold Series';
    tierNameRu = 'Элитная серия с двойными буквами';
  } else if (goldSingles.includes(cleanNumbers)) {
    tier = 'prestige_gold';
    surchargeAzn = 3500;
    tierNameAz = 'Prestic Qızıl Nömrə (001-009 / 777)';
    tierNameEn = 'Prestige Gold Number (001-009 / 777)';
    tierNameRu = 'Престижный золотой номер (001-009 / 777)';
  } else if (triples.includes(cleanNumbers)) {
    tier = 'triple';
    surchargeAzn = 2000;
    tierNameAz = 'Üç Eyni Rəqəm (Tripl)';
    tierNameEn = 'Triple Identical Digits (Triple)';
    tierNameRu = 'Три одинаковые цифры (Трипл)';
  } else if (hundreds.includes(cleanNumbers)) {
    tier = 'double';
    surchargeAzn = 1000;
    tierNameAz = 'Dairəvi Yüzlük Nömrə';
    tierNameEn = 'Round Century Number';
    tierNameRu = 'Круглые сотни';
  } else if (mirrors.includes(cleanNumbers) || (cleanNumbers[0] === cleanNumbers[2] && cleanNumbers[0] !== cleanNumbers[1])) {
    tier = 'mirror';
    surchargeAzn = 500;
    tierNameAz = 'Güzgülü Nömrə Kombinasiyası';
    tierNameEn = 'Mirror Number Combination';
    tierNameRu = 'Зеркальная комбинация';
  }

  return {
    regionCode: cleanRegion,
    letters: cleanLetters,
    numbers: cleanNumbers,
    fullPlate,
    tier,
    tierNameAz,
    tierNameEn,
    tierNameRu,
    surchargeAzn,
  };
}

/**
 * Calculates official vehicle re-registration duties in Azerbaijan
 * in accordance with the Law on State Duties and BDYP regulations.
 */
export function calculateRegistrationDuties(
  vehicle: Vehicle,
  plateOption: PlateOptionType,
  plateDetails: PlateDetails,
  isUrgent: boolean = false
): TransferDutyBreakdown {
  // 1. Certificate fee (Texpasport rüsumu)
  const certificateFeeAzn = 30;

  // 2. Urgent processing fee (ASAN təcili rəsmiləşdirmə)
  const urgentProcessingSurchargeAzn = isUrgent ? 20 : 0;

  // 3. License plate fee
  let plateFeeAzn = 0;
  if (plateOption === 'new_standard') {
    plateFeeAzn = 35;
  } else if (plateOption === 'vip_combination') {
    plateFeeAzn = 35 + plateDetails.surchargeAzn;
  } else {
    // Keep current plate: 0 AZN
    plateFeeAzn = 0;
  }

  // 4. Engine displacement state duty / Eco incentive exemption
  const isGreenVehicle = vehicle.fuelType === 'electric' || vehicle.fuelType === 'hybrid';
  let engineDisplacementFeeAzn = 0;
  const isGreenExemptionApplied = isGreenVehicle;

  if (!isGreenVehicle) {
    const displacementCc = Math.round((vehicle.engineVolumeLiters || 2.0) * 1000);
    if (displacementCc <= 1500) {
      engineDisplacementFeeAzn = 20;
    } else if (displacementCc <= 2500) {
      engineDisplacementFeeAzn = 35;
    } else if (displacementCc <= 3500) {
      engineDisplacementFeeAzn = 60;
    } else if (displacementCc <= 4500) {
      engineDisplacementFeeAzn = 100;
    } else {
      engineDisplacementFeeAzn = 150;
    }
  }

  // 5. BDYP technical diagnostics check tally fee
  const technicalCheckTallyAzn = 10;

  // 6. Notary archive registration fee
  const notaryArchiveRecordAzn = 11;

  // 7. Bank & AsanPay operator processing commission
  const bankCommissionAzn = 2;

  // Total sum
  const totalAzn =
    certificateFeeAzn +
    urgentProcessingSurchargeAzn +
    plateFeeAzn +
    engineDisplacementFeeAzn +
    technicalCheckTallyAzn +
    notaryArchiveRecordAzn +
    bankCommissionAzn;

  const totalUsd = Math.round(totalAzn / 1.70);
  const totalEur = Math.round(totalAzn / 1.85);

  return {
    certificateFeeAzn,
    urgentProcessingSurchargeAzn,
    plateFeeAzn,
    engineDisplacementFeeAzn,
    isGreenExemptionApplied,
    technicalCheckTallyAzn,
    notaryArchiveRecordAzn,
    bankCommissionAzn,
    totalAzn,
    totalUsd,
    totalEur,
  };
}

/**
 * Calculates document readiness percentage and checklist completeness.
 */
export function calculateDocumentReadiness(status: DocumentChecklistStatus): {
  completedCount: number;
  totalCount: number;
  percentage: number;
  isFullyReady: boolean;
} {
  const values = Object.values(status);
  const completedCount = values.filter(Boolean).length;
  const totalCount = values.length;
  const percentage = Math.round((completedCount / totalCount) * 100);
  const isFullyReady = completedCount === totalCount;

  return {
    completedCount,
    totalCount,
    percentage,
    isFullyReady,
  };
}

/**
 * Generates an official BDYP electronic queue voucher / appointment.
 */
export function generateRegistrationAppointment(
  vehicle: Vehicle,
  buyerFullName: string,
  buyerFinCode: string,
  buyerPhone: string,
  divisionId: string,
  appointmentDate: string,
  appointmentTime: string,
  plateOption: PlateOptionType,
  targetPlate: string,
  totalFeeAzn: number,
  currency: Currency,
  isUrgent: boolean = false
): RegistrationAppointment {
  const division = MOCK_REGISTRATION_DIVISIONS.find((d) => d.id === divisionId) || MOCK_REGISTRATION_DIVISIONS[0];
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const voucherId = `BDYP-2026-${randomSuffix}`;

  const qrCodeData = `https://asanpay.az/bdyp/reg?v=${voucherId}&vin=${vehicle.vin}&fee=${totalFeeAzn}&fin=${buyerFinCode.toUpperCase()}`;

  return {
    voucherId,
    qrCodeData,
    vehicleVin: vehicle.vin,
    vehicleTitle: `${vehicle.make} ${vehicle.model} (${vehicle.year})`,
    buyerFullName: buyerFullName.trim() || 'Əli Məmmədov',
    buyerFinCode: (buyerFinCode.trim() || '7ABCD99').toUpperCase(),
    buyerPhone: buyerPhone.trim() || '+994 50 123-45-67',
    divisionId: division.id,
    divisionName: division.nameAz,
    appointmentDate,
    appointmentTime,
    plateOption,
    targetPlate,
    totalFeeAzn,
    totalFeeFormatted: formatPrice(totalFeeAzn, currency),
    isUrgent,
    generatedAt: new Date().toISOString(),
  };
}

import {
  SignalAuditInput,
  SignalAuditResult,
  SirenTone,
  OperativeCategory,
  SignalColor,
  DinPermitRecord,
} from '../types/specialSignal';

export interface ToneAudioConfig {
  baseFreq: number;
  peakFreq: number;
  rateHz: number;
  oscillatorType: OscillatorType;
  secondaryFreq?: number;
  descriptionAz: string;
}

export const TONE_CONFIGS: Record<Exclude<SirenTone, 'off'>, ToneAudioConfig> = {
  wail: {
    baseFreq: 600,
    peakFreq: 1350,
    rateHz: 0.2, // ~5 second slow sweep
    oscillatorType: 'sine',
    descriptionAz: 'Wail: Dinc dalğavari yavaş dəyişən siqnal (şose və geniş prospektlər üçün)',
  },
  yelp: {
    baseFreq: 800,
    peakFreq: 1550,
    rateHz: 2.5, // 2.5 Hz rapid modulation
    oscillatorType: 'triangle',
    descriptionAz: 'Yelp: Sürətli aqressiv kəsişmə siqnalı (dönmə və sıx kəsişmələr üçün)',
  },
  hi_lo: {
    baseFreq: 700,
    peakFreq: 1020,
    rateHz: 1.0, // 1 Hz alternate
    oscillatorType: 'square',
    secondaryFreq: 1020,
    descriptionAz: 'Hi-Lo: Avropa standartı ikitonlu siren (Təcili yardım və FHN xidməti)',
  },
  horn: {
    baseFreq: 370,
    peakFreq: 440,
    rateHz: 0,
    oscillatorType: 'sawtooth',
    secondaryFreq: 440,
    descriptionAz: 'Air Horn: Təcili pnevmatik səs siqnalı (qəza şəraiti xəbərdarlığı)',
  },
};

/**
 * Audit vehicle special signal and siren compliance adhering to:
 * - Law on Road Traffic (YHQ) Article 48
 * - YHQ Annex 1 Clause 7.16
 * - Code of Administrative Offences (İXM) Article 342.9 (500-800 AZN + confiscation)
 * - İXM Article 96.1.4 (Towing to impound lot until device is removed)
 */
export function auditSignalLegality(input: SignalAuditInput): SignalAuditResult {
  const {
    operativeCategory,
    signalColor,
    hasAudioSiren,
    hasOfficialDinPermit,
    isStrobeHiddenUnderGrille,
    sirenDecibels,
  } = input;

  // Case 1: Unauthorized Civilian Vehicle
  if (operativeCategory === 'civilian_unauthorized') {
    const hasIllegalEquipment =
      hasAudioSiren ||
      signalColor === 'blue_red' ||
      signalColor === 'blue' ||
      signalColor === 'white_strobe' ||
      isStrobeHiddenUnderGrille;

    if (hasIllegalEquipment) {
      return {
        isCompliant: false,
        legalityLevel: 'prohibited_civilian',
        statusTitleAz: 'Qanunsuz Xüsusi Sayrışan Mayak və ya Siren (DİN Sanksiyası)',
        statusDescriptionAz:
          'Mülki nəqliyyat vasitəsində xüsusi çoxavazlı səs siqnalı (siren), radiator barmaqlığı arxasında gizli flaşor və ya göy-qırmızı sayrışan mayakların quraşdırılması qəti qadağandır.',
        fineAmountAzn: 800, // Maximum of 500-800 AZN bracket
        confiscationRisk: true,
        immediateImpoundRisk: true,
        penaltyPoints: 0, // Article 342.9 is a heavy fiscal fine with device confiscation
        applicableArticles: [
          'YHQ Maddə 48',
          'YHQ Əlavə 1 Bənd 7.16',
          'İXM Maddə 342.9 (500–800 AZN + Cihazın Müsadirəsi)',
          'İXM Maddə 96.1.4 (Cərimə Meydançasına Məcburi Təxliyə)',
        ],
        recommendedActionAz:
          'Xüsusi səs və sayrışan işıq avadanlıqları təcili olaraq nəqliyyat vasitəsindən tam sökülməli və zavod konfiqurasiyası bərpa edilməlidir.',
      };
    }

    return {
      isCompliant: true,
      legalityLevel: 'authorized',
      statusTitleAz: 'Mülki Standarta Tam Uyğundur',
      statusDescriptionAz:
        'Avtomobildə qanunsuz xüsusi səs və ya sayrışan işıq avadanlığı aşkar edilmədi. YHQ tələblərinə tam cavab verir.',
      fineAmountAzn: 0,
      confiscationRisk: false,
      immediateImpoundRisk: false,
      penaltyPoints: 0,
      applicableArticles: ['YHQ Maddə 48'],
      recommendedActionAz: 'Standart istismar qaydalarına riayət etməyə davam edin.',
    };
  }

  // Case 2: Operative Transport without Official Permit
  if (!hasOfficialDinPermit) {
    return {
      isCompliant: false,
      legalityLevel: 'warning_improper_spec',
      statusTitleAz: 'DİN Xüsusi İcazəsi (Vərəqəsi) Çatışmır',
      statusDescriptionAz:
        'Xidməti nəqliyyat vasitəsi üçün DİN BDYP tərəfindən verilmiş rəsmi xüsusi siqnal icazə pasportu və Texpasportda müvafiq qeyd mövcud deyil.',
      fineAmountAzn: 500,
      confiscationRisk: false,
      immediateImpoundRisk: false,
      penaltyPoints: 0,
      applicableArticles: ['YHQ Maddə 48', 'İXM Maddə 342.9'],
      recommendedActionAz:
        'DİN Baş Dövlət Yol Polisi İdarəsinə müraciət edərək rəsmi DİN-OPR-2026 icazə şəhadətnaməsi əldə edilməlidir.',
    };
  }

  // Case 3: Municipal or Cash Transit with improper blue/red lights or siren
  if (operativeCategory === 'municipal_service' || operativeCategory === 'cash_transit') {
    if (signalColor !== 'amber' || hasAudioSiren) {
      return {
        isCompliant: false,
        legalityLevel: 'warning_improper_spec',
        statusTitleAz: 'Qeyri-Uyğun Rəng və ya Qadağan Edilmiş Siren',
        statusDescriptionAz:
          'Kommunal, təxliyə (evakuator) və ya inkassasiya avtomobillərində yalnız sarı/narıncı sayrışan mayaka icazə verilir. Göy/qırmızı işıq və səs siqnalı qadağandır.',
        fineAmountAzn: 500,
        confiscationRisk: true,
        immediateImpoundRisk: true,
        penaltyPoints: 0,
        applicableArticles: ['YHQ Maddə 48', 'YHQ Əlavə 1 Bənd 7.16', 'İXM Maddə 342.9'],
        recommendedActionAz:
          'Siren və qeyri-standart işıqlar sökülməli, yalnız AZS sertifikatlı sarı mayak saxlanılmalıdır.',
      };
    }
  }

  // Case 4: Medical / Rescue vehicle with Red beacon (Red only allowed for Police/Escort)
  if (operativeCategory === 'medical_fhn' && signalColor === 'blue_red') {
    return {
      isCompliant: false,
      legalityLevel: 'warning_improper_spec',
      statusTitleAz: 'Qırmızı Mayak Yalnız BDYP/DİN üçün Nəzərdə Tutulub',
      statusDescriptionAz:
        'Qırmızı rəngli sayrışan mayak yalnız DİN/BDYP və müşayiət eskort avtomobillərində istifadə edilə bilər. Təcili tibbi yardım və FHN avtomobillərində yalnız mavi mayak tətbiq olunur.',
      fineAmountAzn: 300,
      confiscationRisk: false,
      immediateImpoundRisk: false,
      penaltyPoints: 0,
      applicableArticles: ['YHQ Maddə 48', 'AZS 598'],
      recommendedActionAz: 'Sayrışan mayak blokunu tək mavi rəngli blokla əvəz edin.',
    };
  }

  // Case 5: Decibel limit check (>124 dBA exceeds acoustic norm)
  if (hasAudioSiren && sirenDecibels > 124) {
    return {
      isCompliant: false,
      legalityLevel: 'warning_improper_spec',
      statusTitleAz: 'Səs Şiddəti Normadan Artıqdır (>124 dBA)',
      statusDescriptionAz:
        'Siren səs təzyiqi 2 metr məsafədə 124 dBA həddini aşa bilməz (akustik travma riski).',
      fineAmountAzn: 150,
      confiscationRisk: false,
      immediateImpoundRisk: false,
      penaltyPoints: 0,
      applicableArticles: ['AZS Akustika Standartı', 'YHQ Əlavə 1'],
      recommendedActionAz: 'Elektron sirenin güc gücləndiricisini (PA amp) normativə uyğunlaşdırın.',
    };
  }

  // Fully Authorized Operative Transport
  return {
    isCompliant: true,
    legalityLevel: 'authorized',
    statusTitleAz: 'Rəsmi DİN Qeydiyyatlı Operativ Nəqliyyat',
    statusDescriptionAz:
      'Avtomobil YHQ Maddə 48 tələblərinə tam uyğundur. Göy-qırmızı/göy sayrışan mayak və siren birlikdə işə salındıqda tam hərəkət üstünlüyünə malikdir.',
    fineAmountAzn: 0,
    confiscationRisk: false,
    immediateImpoundRisk: false,
    penaltyPoints: 0,
    applicableArticles: ['YHQ Maddə 48', 'YHQ Maddə 49'],
    recommendedActionAz: 'Xüsusi icazə vərəqəsini avtomobildə saxlamaq və hər 2 ildən bir texniki baxışdan keçmək zəruridir.',
  };
}

/**
 * Calculates legal sanctions for ordinary drivers who fail to yield right of way to operative vehicles.
 * Governed by Code of Administrative Offences (İXM) Article 327.3.
 */
export function calculateYieldingFine(didYield: boolean): {
  fineAzn: number;
  penaltyPoints: number;
  article: string;
  descriptionAz: string;
} {
  if (didYield) {
    return {
      fineAzn: 0,
      penaltyPoints: 0,
      article: 'YHQ Maddə 48',
      descriptionAz: 'Qaydaya uyğun olaraq sağ zolağa çəkilərək maneəsiz keçid təmin edilmişdir.',
    };
  }

  return {
    fineAzn: 100,
    penaltyPoints: 3,
    article: 'İXM Maddə 327.3',
    descriptionAz:
      'Operativ nəqliyyat vasitəsinə (sayrışan işıq və səs siqnalı qoşulduqda) yol verməməyə görə 100 manat məbləğində cərimə və 3 cərimə balı tətbiq edilir.',
  };
}

/**
 * Generates an official DİN & BDYP electronic operative vehicle permit (`DIN-OPR-2026-XXXXX`).
 */
export function generateDinPermit(data: {
  vehiclePlate: string;
  vin: string;
  vehicleModel: string;
  agencyNameAz: string;
  category: OperativeCategory;
  authorizedColors: SignalColor[];
  maxSoundDecibels?: number;
}): DinPermitRecord {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const permitNumber = `DIN-OPR-2026-${randomSuffix}`;

  const cleanPlate = data.vehiclePlate.replace(/\s+/g, '').toUpperCase();
  const rawHashInput = `${permitNumber}:${cleanPlate}:${data.vin}:${data.category}:2026`;
  const securityHash = Array.from(rawHashInput)
    .reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0)
    .toString(16)
    .toUpperCase()
    .replace('-', '')
    .padStart(12, 'D8E2');

  const hologramUid = `DİN-AZS-${Math.floor(1000 + Math.random() * 9000)}-${data.category.toUpperCase().slice(0, 3)}`;

  const today = new Date();
  const issueDate = today.toISOString().split('T')[0];
  const expiryDate = new Date(today.getFullYear() + 2, today.getMonth(), today.getDate())
    .toISOString()
    .split('T')[0];

  return {
    permitNumber,
    securityHash: `DIN-${securityHash.slice(0, 4)}-${securityHash.slice(4, 8)}-${securityHash.slice(8, 12)}`,
    hologramUid,
    issueDate,
    expiryDate,
    vehiclePlate: cleanPlate,
    vin: data.vin.toUpperCase(),
    vehicleModel: data.vehicleModel,
    agencyNameAz: data.agencyNameAz,
    category: data.category,
    authorizedColors: data.authorizedColors,
    maxSoundDecibels: data.maxSoundDecibels ?? 122,
    chiefInspectorAz: 'Polis Polkovnik-Leytenantı E. M. Qasımov (DİN BDYP)',
    registryStatus: 'active',
  };
}

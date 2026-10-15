import { WindowTintConfig } from '../types/windowTint';

export interface TintInspectionCenter {
  id: string;
  name: {
    az: string;
    en: string;
    ru: string;
  };
  district: string;
  address: string;
  phone: string;
  operatingHours: string;
  photometerModel: string;
  certifiedLanes: number;
}

export interface TintPreset {
  id: string;
  title: {
    az: string;
    en: string;
    ru: string;
  };
  description: {
    az: string;
    en: string;
    ru: string;
  };
  config: WindowTintConfig;
  badge: {
    az: string;
    en: string;
    ru: string;
  };
  isLegalByDefault: boolean;
}

export const MOCK_TINT_PRESETS: TintPreset[] = [
  {
    id: 'factory_legal',
    title: {
      az: 'Zavod Standartı (Tam Qanuni)',
      en: 'Factory Standard (Fully Legal)',
      ru: 'Заводской стандарт (Законно)',
    },
    description: {
      az: 'Avtomobilin zavod şüşələri: heç bir tündləşdirici örtük yoxdur, bütün tələblərə 100% cavab verir.',
      en: 'Factory OEM glass without tint film: satisfies 100% of statutory VLT requirements.',
      ru: 'Заводские стекла без тонировки: 100% соответствие всем требованиям.',
    },
    config: {
      windshieldVlt: 80,
      frontSideVlt: 75,
      rearSideVlt: 70,
      rearVlt: 70,
      hasPermit: false,
      hasFactoryCurtains: false,
      hasAthermalFilm: false,
    },
    badge: {
      az: '100% Qanuni',
      en: '100% Legal',
      ru: '100% Законно',
    },
    isLegalByDefault: true,
  },
  {
    id: 'legal_rear_permit',
    title: {
      az: 'Rəsmi BDYP İcazəli Qara Arxa Şüşələr',
      en: 'Official BDYP Permitted Rear Tint',
      ru: 'Официальное разрешение BDYP (Задняя тонировка)',
    },
    description: {
      az: 'Ön şüşələr standart qanuni, arxa yan və arxa şüşələr isə 100% qara plyonka ilə illik dövlət icazəsinə malikdir.',
      en: 'Front glass compliant, rear side and rear windows tinted to 5% with official annual BDYP permit.',
      ru: 'Передние стекла в норме, задние затонированы по официальному годовому разрешению.',
    },
    config: {
      windshieldVlt: 78,
      frontSideVlt: 72,
      rearSideVlt: 5,
      rearVlt: 5,
      hasPermit: true,
      permitCoverage: 'all_rear',
      hasFactoryCurtains: false,
      hasAthermalFilm: false,
    },
    badge: {
      az: 'İcazəli Qara',
      en: 'Permitted Dark',
      ru: 'С разрешением',
    },
    isLegalByDefault: true,
  },
  {
    id: 'seasonal_curtains',
    title: {
      az: 'Mövsümi Pərdə / Jalüz (1 May - 15 Noyabr)',
      en: 'Seasonal Curtains / Blinds (May 1 - Nov 15)',
      ru: 'Сезонные шторки / жалюзи (1 мая - 15 ноября)',
    },
    description: {
      az: 'Zavod istehsalı sənaye pərdələri: yay-payız mövsümündə arxa yan şüşələrdə icazəsiz qanunidir.',
      en: 'Factory-made sun blinds: legally allowed on rear side windows during summer/autumn without fee.',
      ru: 'Заводские солнцезащитные шторки: разрешены на задних боковых стеклах летом и осенью без пошлины.',
    },
    config: {
      windshieldVlt: 80,
      frontSideVlt: 75,
      rearSideVlt: 25,
      rearVlt: 65,
      hasPermit: false,
      hasFactoryCurtains: true,
      hasAthermalFilm: false,
    },
    badge: {
      az: 'Mövsümi Qanuni',
      en: 'Seasonal Legal',
      ru: 'Сезонно законно',
    },
    isLegalByDefault: true,
  },
  {
    id: 'illegal_front_tint',
    title: {
      az: 'Qanunsuz Ön Tündləşdirmə (Cərimə Riski)',
      en: 'Illegal Front Tint (Fine Risk)',
      ru: 'Незаконная передняя тонировка (Штраф)',
    },
    description: {
      az: 'Ön yan şüşələrə və ya alın şüşəsinə qara plyonka çəkilib: BDYP tərəfindən 150 AZN cərimə tətbiq olunur.',
      en: 'Dark film applied to windshield or front sides: strictly prohibited, attracts 150 AZN fine under Article 342.2-2.',
      ru: 'Темная пленка на лобовом или передних боковых стеклах: запрещена, штраф 150 AZN по статье 342.2-2.',
    },
    config: {
      windshieldVlt: 45,
      frontSideVlt: 20,
      rearSideVlt: 5,
      rearVlt: 5,
      hasPermit: false,
      hasFactoryCurtains: false,
      hasAthermalFilm: false,
    },
    badge: {
      az: '150 AZN Cərimə',
      en: '150 AZN Fine',
      ru: 'Штраф 150 AZN',
    },
    isLegalByDefault: false,
  },
];

export const MOCK_TINT_CENTERS: TintInspectionCenter[] = [
  {
    id: 'bdyp_zabrat',
    name: {
      az: 'BDYP Zabrat Mərkəzi Diaqnostika və İmtahan İdarəsi',
      en: 'BDYP Zabrat Central Diagnostic & Inspection Center',
      ru: 'Центр диагностики и техосмотра BDYP Забрат',
    },
    district: 'Sabunçu r-nu',
    address: 'Bakı-Zabrat şosesi 14-cü km',
    phone: '+994 (12) 590-21-00',
    operatingHours: '09:00 - 18:00 (Hər gün)',
    photometerModel: 'Tonic-Lux OptoMeter 3000 (Standart QOST 27902)',
    certifiedLanes: 6,
  },
  {
    id: 'bdyp_badamdar',
    name: {
      az: 'BDYP Badamdar Stasionar Texniki Yoxlama Postu',
      en: 'BDYP Badamdar Stationary Technical Inspection Post',
      ru: 'Стационарный пост техосмотра BDYP Бадамдар',
    },
    district: 'Səbail r-nu',
    address: 'Badamdar qəsəbəsi, Mikayıl Müşfiq küç. 42',
    phone: '+994 (12) 590-21-12',
    operatingHours: '08:30 - 20:00 (Bazar ertəsi - Şənbə)',
    photometerModel: 'Svet-M Optical Photometer (Dəqiqlik ±1.0%)',
    certifiedLanes: 4,
  },
  {
    id: 'bdyp_ecoloq',
    name: {
      az: 'Sumqayıt Şosesi Ekoloji Post & Nəzarət Laboratoriyası',
      en: 'Sumgayit Highway Ecological Post & Optical Lab',
      ru: 'Экологический пост на Сумгаитском шоссе',
    },
    district: 'Binəqədi r-nu',
    address: 'Bakı-Quba şosesi km 18 (Ekoloji Post)',
    phone: '+994 (12) 590-21-55',
    operatingHours: '24/7 Növbəli Xidmət',
    photometerModel: 'Laser LuxScan Pro 5 (DİN Sertifikatlı)',
    certifiedLanes: 5,
  },
];

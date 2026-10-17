import {
  ExtinguisherType,
  PassengerSafetyCertificate,
  SafetySupplyCenter,
  VehicleRegulatoryClass,
} from '../utils/passengerSafety';

export interface VehicleRegulatoryClassOption {
  id: VehicleRegulatoryClass;
  code: string;
  title: string;
  description: string;
  minExtinguisherRule: string;
}

export interface ExtinguisherOption {
  id: ExtinguisherType;
  label: string;
  massKg: number;
  agentType: string;
  legalNote: string;
}

export interface FirstAidMandatoryItem {
  id: string;
  name: string;
  quantity: string;
  purpose: string;
  isCriticalForDyp: boolean;
}

export const VEHICLE_REGULATORY_CLASSES: VehicleRegulatoryClassOption[] = [
  {
    id: 'M1_PASSENGER',
    code: 'M1 (Minik)',
    title: 'M1 — Minik Avtomobilləri (Sedan, SUV, Hetçbek ≤8 yer)',
    description: 'Sürücü oturacağından əlavə maksimum 8 oturacaq yeri olan minik nəqliyyat vasitələri.',
    minExtinguisherRule: 'Minimum 1 ədəd ≥1 kq (OP-1 / OP-2 və ya OU-2)',
  },
  {
    id: 'N1_LIGHT_TRUCK',
    code: 'N1 (Pikap / Furqon ≤3.5t)',
    title: 'N1 — Yüngül Yük Avtomobilləri və Pikaplar (≤3.5 ton)',
    description: 'İcazə verilən maksimum kütləsi 3.5 tondan artıq olmayan yük və kommersiya furqonları.',
    minExtinguisherRule: 'Minimum 1 ədəd ≥2 kq (OP-2)',
  },
  {
    id: 'M2_MINIBUS',
    code: 'M2 (Mikroavtobus 9–16 yer)',
    title: 'M2 — Mikroavtobuslar (Sprinter, V-Class, Transit ≤5 ton)',
    description: 'Sərnişin daşımaq üçün nəzərdə tutulmuş, 8-dən çox oturacaq yeri olan mikroavtobuslar.',
    minExtinguisherRule: 'Minimum 2 ədəd (1-i kabinədə, 1-i salonda) + 2 təkər dayağı',
  },
  {
    id: 'M3_BUS',
    code: 'M3 (Avtobus >5 ton)',
    title: 'M3 — Şəhərdaxili və Şəhərlərarası Avtobuslar (>5 ton)',
    description: 'İri tutumlu sərnişin avtobusları (BakuBus, turizm və reys avtobusları).',
    minExtinguisherRule: 'Minimum 2 ədəd ≥5 kq (OP-5) + 2 təkər dayağı',
  },
  {
    id: 'N2_N3_HEAVY_TRUCK',
    code: 'N2/N3 (Ağır Yük >3.5t)',
    title: 'N2 / N3 — Ağır Yük Maşınları və Dartqılar (TIR / KamAZ >3.5 ton)',
    description: 'İcazə verilən maksimum kütləsi 3.5 tondan yuxarı olan yük avtomobilləri.',
    minExtinguisherRule: 'Minimum 2 ədəd ≥5 kq (OP-5) + 2 təkər dayağı',
  },
];

export const EXTINGUISHER_OPTIONS: ExtinguisherOption[] = [
  {
    id: 'OP2_POWDER_2KG',
    label: 'OP-2 (2 kq Quru Tozlu — FHN Standartı)',
    massKg: 2.0,
    agentType: 'ABC Quru Kimyəvi Toz',
    legalNote: 'M1 və N1 avtomobilləri üçün DYP texniki baxışında ən optimal və tövsiyə edilən model.',
  },
  {
    id: 'OU2_CO2_2KG',
    label: 'OU-2 (2 kq Karbon-Dioksid CO₂ — EV & Hibrid Üçün)',
    massKg: 2.0,
    agentType: 'Sıxılmış CO₂ Qazı',
    legalNote: 'Yüksək gərginlikli elektronikanı və mühərrik bölməsini çirkləndirmədən söndürür (EV/Hibrid üçün ideal).',
  },
  {
    id: 'OP1_POWDER_1KG',
    label: 'OP-1 (1 kq Quru Tozlu — M1 Minimum Norma)',
    massKg: 1.0,
    agentType: 'ABC Quru Kimyəvi Toz',
    legalNote: 'YHQ Əlavə 1 üzrə minik avtomobilləri üçün icazə verilən ən aşağı həcm həddi.',
  },
  {
    id: 'OP5_HEAVY_5KG',
    label: 'OP-5 (5 kq Quru Tozlu — Avtobus və Yük Üçün)',
    massKg: 5.0,
    agentType: 'ABC Sənaye Tozu',
    legalNote: 'M3 avtobusları və N2/N3 ağır yük avtomobilləri üçün məcburi həcm standartı.',
  },
  {
    id: 'AEROSOL_SPRAY_400ML',
    label: 'Aerozol Sprey Balon (400 ml — Qeyri-standart)',
    massKg: 0.4,
    agentType: 'Su-köpük aerozolu',
    legalNote: 'QADAĞANDIR: Manometri yoxdur və həcmi 1 kq-dan az olduğu üçün DYP texniki baxışında qəbul edilmir!',
  },
  {
    id: 'NONE',
    label: 'Yanğınsöndürən Yoxdur',
    massKg: 0,
    agentType: 'Yoxdur',
    legalNote: 'İXM Maddə 342.1.7 üzrə 50 AZN cərimə və texniki baxışdan imtina səbəbi.',
  },
];

export const MINISTRY_FIRST_AID_ITEMS: FirstAidMandatoryItem[] = [
  {
    id: 'tourniquet',
    name: 'Qankəsici Hemostatik Jqut (Turniket)',
    quantity: '1 ədəd',
    purpose: 'Arterial qanaxmanın təcili dayandırılması (qeyd vərəqəsi ilə)',
    isCriticalForDyp: true,
  },
  {
    id: 'sterile_bandages',
    name: 'Steril və Qeyri-steril Tənzif Bintlər (5m x 10sm)',
    quantity: '4 ədəd',
    purpose: 'Açıq yaraların sarınması və tamponadası',
    isCriticalForDyp: true,
  },
  {
    id: 'antiseptic_dressing',
    name: 'Antiseptik Yara Paketləri və Bakterisid Leykoplastır',
    quantity: '1 dəst (10+ ədəd)',
    purpose: 'Kiçik kəsiklərin və yanıqların infeksiyadan qorunması',
    isCriticalForDyp: true,
  },
  {
    id: 'cpr_mask',
    name: 'Süni Tənəffüs Üçün Qoruyucu Müştük (Klapanlı)',
    quantity: '1 ədəd',
    purpose: 'Ağızdan-ağıza ürək-ağciyər реанимаsiyası zamanı gigiyenik müdafiə',
    isCriticalForDyp: true,
  },
  {
    id: 'scissors_gloves',
    name: 'Küt Uclu Tibbi Qayçı və Nitril Tibbi Əlcək',
    quantity: '1 qayçı + 2 cüt əlcək',
    purpose: 'Təhlükəsizlik kəmərinin/paltarın kəsilməsi və xilasedicinin qorunması',
    isCriticalForDyp: true,
  },
  {
    id: 'thermal_blanket',
    name: 'İzotermik Xilasedici Yorğan (Qızılı/Gümüşü Folqa 160x210sm)',
    quantity: '1 ədəd',
    purpose: 'Qəza şoku zamanı bədən hərarətinin saxlanılması (hipotermiya/qızmar)',
    isCriticalForDyp: false,
  },
];

export const SAFETY_SUPPLY_CENTERS: SafetySupplyCenter[] = [
  {
    id: 'center-baku-babek',
    name: 'FHN & AvtoTəhlükəsizlik Mərkəzi — Babək Pr.',
    city: 'Bakı',
    address: 'Xətai r., Babək prospekti 44 (Maşın bazarı girişi)',
    fhnLicenseCode: 'FHN-DYMX-2026-014',
    hasExtinguisherRechargeStation: true,
    hasIsofixTestBench: true,
    op2ExtinguisherPriceAzn: 28,
    ou2Co2ExtinguisherPriceAzn: 55,
    extinguisherRechargeFeeAzn: 12,
    ministryFirstAidKitPriceAzn: 22,
    eceWarningTrianglePriceAzn: 15,
    reflectiveVestAndTowRopePriceAzn: 25,
    isofixChildSeatPriceAzn: 240,
    rating: 4.9,
    phone: '+994 12 490 11 01',
  },
  {
    id: 'center-baku-zabrat',
    name: 'BDYP Zabrat Texniki Baxış Yanı Təchizat Məntəqəsi',
    city: 'Bakı',
    address: 'Sabunçu r., Zabrat-Maştağa şossesi 1-ci km (BDYP Müayinə Mərkəzi yanı)',
    fhnLicenseCode: 'FHN-DYMX-2026-029',
    hasExtinguisherRechargeStation: true,
    hasIsofixTestBench: false,
    op2ExtinguisherPriceAzn: 26,
    ou2Co2ExtinguisherPriceAzn: 52,
    extinguisherRechargeFeeAzn: 10,
    ministryFirstAidKitPriceAzn: 20,
    eceWarningTrianglePriceAzn: 14,
    reflectiveVestAndTowRopePriceAzn: 22,
    isofixChildSeatPriceAzn: 215,
    rating: 4.8,
    phone: '+994 50 311 22 44',
  },
  {
    id: 'center-baku-narimanov',
    name: 'KidsSafe & ISOFIX Azerbaijan — Nərimanov',
    city: 'Bakı',
    address: 'Nərimanov r., Əhməd Rəcəbli küç. 19A',
    fhnLicenseCode: 'FHN-DYMX-2026-042',
    hasExtinguisherRechargeStation: false,
    hasIsofixTestBench: true,
    op2ExtinguisherPriceAzn: 30,
    ou2Co2ExtinguisherPriceAzn: 58,
    extinguisherRechargeFeeAzn: 15,
    ministryFirstAidKitPriceAzn: 25,
    eceWarningTrianglePriceAzn: 16,
    reflectiveVestAndTowRopePriceAzn: 28,
    isofixChildSeatPriceAzn: 265,
    rating: 4.9,
    phone: '+994 55 440 88 99',
  },
  {
    id: 'center-absheron-khirdalan',
    name: 'Abşeron Yanğın Mühafizə & AvtoTəchizat — Xırdalan',
    city: 'Xırdalan',
    address: 'Bakı-Quba şossesi 11-ci km (Ekologiya postu yaxınlığı)',
    fhnLicenseCode: 'FHN-DYMX-2026-061',
    hasExtinguisherRechargeStation: true,
    hasIsofixTestBench: true,
    op2ExtinguisherPriceAzn: 25,
    ou2Co2ExtinguisherPriceAzn: 50,
    extinguisherRechargeFeeAzn: 10,
    ministryFirstAidKitPriceAzn: 19,
    eceWarningTrianglePriceAzn: 13,
    reflectiveVestAndTowRopePriceAzn: 20,
    isofixChildSeatPriceAzn: 195,
    rating: 4.7,
    phone: '+994 70 612 34 56',
  },
  {
    id: 'center-sumgayit',
    name: 'Sumqayıt FHN Sertifikatlı Odluq & AvtoAptek Mərkəzi',
    city: 'Sumqayıt',
    address: 'Sumqayıt ş., Sülh küçəsi 38',
    fhnLicenseCode: 'FHN-DYMX-2026-077',
    hasExtinguisherRechargeStation: true,
    hasIsofixTestBench: false,
    op2ExtinguisherPriceAzn: 24,
    ou2Co2ExtinguisherPriceAzn: 49,
    extinguisherRechargeFeeAzn: 9,
    ministryFirstAidKitPriceAzn: 18,
    eceWarningTrianglePriceAzn: 12,
    reflectiveVestAndTowRopePriceAzn: 19,
    isofixChildSeatPriceAzn: 190,
    rating: 4.8,
    phone: '+994 50 774 11 22',
  },
  {
    id: 'center-ganja',
    name: 'Gəncə Regional Yanğın Təhlükəsizliyi & AvtoTəchizat',
    city: 'Gəncə',
    address: 'Gəncə ş., Nizami Gəncəvi pr. 112',
    fhnLicenseCode: 'FHN-DYMX-2026-093',
    hasExtinguisherRechargeStation: true,
    hasIsofixTestBench: true,
    op2ExtinguisherPriceAzn: 25,
    ou2Co2ExtinguisherPriceAzn: 52,
    extinguisherRechargeFeeAzn: 10,
    ministryFirstAidKitPriceAzn: 20,
    eceWarningTrianglePriceAzn: 14,
    reflectiveVestAndTowRopePriceAzn: 21,
    isofixChildSeatPriceAzn: 205,
    rating: 4.8,
    phone: '+994 55 812 90 00',
  },
];

export const VERIFIED_SAFETY_CERTIFICATES: PassengerSafetyCertificate[] = [
  {
    certificateNumber: 'BDYP-TEH-2026-10482',
    issueDate: '2026-10-05',
    expiryDate: '2027-10-05',
    plateNumber: '99-AZ-700',
    vin: 'JTMAB3FV80D110482',
    vehicleTitle: 'Toyota Land Cruiser 250 Prado',
    vehicleClass: 'M1_PASSENGER',
    extinguisherSpec: 'OP-2 (2 kq Quru Tozlu, 1.4 MPa Yaşıl Zona)',
    firstAidStatus: 'Tam Komplekt (AR Səhiyyə Nazirliyi Standartı)',
    crsIsofixStatus: 'İSOFIX Qrup 1/2/3 Uyğun + 7 Oturacaq Kəməri',
    inspectionCenterName: 'FHN & AvtoTəhlükəsizlik Mərkəzi — Babək Pr.',
    complianceVerdict: 'TAM UYĞUN (DYP & FHN STANDARTI)',
    qrVerificationHash: 'AZS-FHN-DYP-99AZ700-10482',
  },
  {
    certificateNumber: 'BDYP-TEH-2026-88319',
    issueDate: '2026-09-21',
    expiryDate: '2027-09-21',
    plateNumber: '77-EV-090',
    vin: 'LGXCE6CB4R0088319',
    vehicleTitle: 'BYD Song Plus DM-i Champion',
    vehicleClass: 'M1_PASSENGER',
    extinguisherSpec: 'OU-2 (2 kq CO₂ Karbon-Dioksid, 1.5 MPa)',
    firstAidStatus: 'Tam Komplekt (Steril Bint + Hemostatik Jqut)',
    crsIsofixStatus: 'ECE R129 i-Size İSOFIX + Top-Tether Aktiv',
    inspectionCenterName: 'KidsSafe & ISOFIX Azerbaijan — Nərimanov',
    complianceVerdict: 'TAM UYĞUN (DYP & FHN STANDARTI)',
    qrVerificationHash: 'AZS-FHN-DYP-77EV090-88319',
  },
  {
    certificateNumber: 'BDYP-TEH-2026-55901',
    issueDate: '2026-10-12',
    expiryDate: '2027-10-12',
    plateNumber: '10-bus-300',
    vin: 'WDB9066571S555901',
    vehicleTitle: 'Mercedes-Benz Sprinter 516 CDI',
    vehicleClass: 'M2_MINIBUS',
    extinguisherSpec: '2 ədəd OP-5 (5 kq) + 2 Təkər Dayağı',
    firstAidStatus: '2 ədəd Tam Komplekt AvtoAptek',
    crsIsofixStatus: '16 Sərnişin Yeri Kəmərlə Təchiz Edilib',
    inspectionCenterName: 'BDYP Zabrat Texniki Baxış Yanı Təchizat Məntəqəsi',
    complianceVerdict: 'TAM UYĞUN (DYP & FHN STANDARTI)',
    qrVerificationHash: 'AZS-FHN-DYP-10BUS300-55901',
  },
];

export function findSafetyCertificateByCode(
  query: string,
  customList: PassengerSafetyCertificate[] = []
): PassengerSafetyCertificate | null {
  const q = query.trim().toUpperCase();
  if (!q) return null;
  const all = [...customList, ...VERIFIED_SAFETY_CERTIFICATES];
  return (
    all.find(
      (c) =>
        c.certificateNumber.toUpperCase() === q ||
        c.plateNumber.toUpperCase() === q ||
        c.vin.toUpperCase() === q
    ) || null
  );
}

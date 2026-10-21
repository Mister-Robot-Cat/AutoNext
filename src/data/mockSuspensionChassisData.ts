export type SuspensionModId =
  | 'oem_standard'
  | 'oem_air_suspension'
  | 'certified_tuv_coilover'
  | 'peredok_front_lift'
  | 'cut_heated_springs'
  | 'extreme_stance_camber';

export type WheelFastenerConditionId =
  | 'intact_oem_bolts_rims'
  | 'missing_lug_bolt'
  | 'cracked_or_welded_rim'
  | 'wheel_spacer_unregistered'
  | 'worn_hub_bearing_cv';

export interface SuspensionModificationProfile {
  id: SuspensionModId;
  nameAz: string;
  legalStatus: 'LEGAL_OEM' | 'LEGAL_CERTIFIED' | 'ILLEgal_CONSTRUCTIVE_342_2_1';
  fineAzn: number;
  prohibitsOperation96: boolean;
  ixmArticle: string;
  yhqReference: string;
  descriptionAz: string;
}

export interface WheelFastenerConditionProfile {
  id: WheelFastenerConditionId;
  nameAz: string;
  isRoadworthy: boolean;
  fineAzn: number;
  prohibitsOperation: boolean;
  legalClause: string;
  technicalRiskAz: string;
}

export interface ChassisServicePackage {
  id: string;
  nameAz: string;
  category: '3D_ALIGNMENT' | 'SHOCK_ABSORBERS' | 'PEREDOK_SPRING_RESET' | 'WHEEL_HUB_BOLTS' | 'FRAME_GEOMETRY';
  partsCostAzn: number;
  laborCostAzn: number;
  durationMinutes: number;
  warrantyMonths: number;
  includesAzsProtocol: boolean;
  descriptionAz: string;
}

export interface AccreditedSuspensionCenter {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  workingHours: string;
  equipment: string[];
  rating: number;
  waitTimeMinutes: number;
  issuesOfficialCertificate: boolean;
}

export interface SuspensionComplianceCertificate {
  certificateNumber: string; // BDYP-ASQ-2026-XXXXX
  issueDate: string;
  expiryDate: string;
  plateNumber: string;
  vin: string;
  vehicleTitle: string;
  ownerName: string;
  centerName: string;
  frontEusamaAvgPercent: number;
  rearEusamaAvgPercent: number;
  maxAxleImbalancePercent: number;
  suspensionModId: SuspensionModId;
  frontToRearPitchDeltaMm: number;
  missingLugBoltsCount: number;
  longeronDiagonalDeltaMm: number;
  overallStatus: 'COMPLIANT' | 'CONDITIONAL_WARNING' | 'PROHIBITED_96_1_4';
  qrSecurityHash: string;
}

export const SUSPENSION_MODIFICATION_PROFILES: SuspensionModificationProfile[] = [
  {
    id: 'oem_standard',
    nameAz: 'Zavod Standart Asqı və Klirens (OEM Yaylar & Amortizatorlar)',
    legalStatus: 'LEGAL_OEM',
    fineAzn: 0,
    prohibitsOperation96: false,
    ixmArticle: 'İnzibati məsuliyyət yaranmır (Tam Qanuni)',
    yhqReference: 'YHQ Əlavə 1, Bənd 7.3 və 7.12 — Zavod konstruksiyası',
    descriptionAz:
      'İstehsalçı zavodun müəyyən etdiyi klirens, ağırlıq mərkəzi və ön-arxa ox balansı tam qorunub saxlanılıb.',
  },
  {
    id: 'oem_air_suspension',
    nameAz: 'Zavod Pnevmoasqı / Adaptiv Klirens Sistemi (OEM Air Suspension)',
    legalStatus: 'LEGAL_OEM',
    fineAzn: 0,
    prohibitsOperation96: false,
    ixmArticle: 'İnzibati məsuliyyət yaranmır (Zavod komplektasiyası)',
    yhqReference: 'YHQ Əlavə 1 — Elektron tənzimlənən zavod pnevmo-asqısı',
    descriptionAz:
      'Range Rover, Mercedes AIRMATIC, Porsche PASM və digər modellərdə zavod tərəfindən quraşdırılmış hermetik pnevmo-balon sistemi.',
  },
  {
    id: 'certified_tuv_coilover',
    nameAz: 'AZS & TÜV Sertifikatlı Tənzimlənən Asqı (Texpasport Qeydi ilə ≤30 mm)',
    legalStatus: 'LEGAL_CERTIFIED',
    fineAzn: 0,
    prohibitsOperation96: false,
    ixmArticle: 'Qanunidir (AZS Laboratoriya rəyi və Texpasport qeydi olduqda)',
    yhqReference: 'YHQ Maddə 27 & AZS 636 — Sertifikatlaşdırılmış asqı dəsti',
    descriptionAz:
      'Sükan idarəetməsinə və fara işıq selinə mənfi təsir etməyən, AZS laboratoriyasında sınaqdan keçmiş və Texpasportda qeyd olunmuş asqı dəsti.',
  },
  {
    id: 'peredok_front_lift',
    nameAz: 'Qanunsuz «Peredok» Qaldırılması / Arxa Hissənin Endirilməsi (Ön-Arxa Disbalans)',
    legalStatus: 'ILLEgal_CONSTRUCTIVE_342_2_1',
    fineAzn: 150,
    prohibitsOperation96: true,
    ixmArticle: 'İXM Maddə 342.2-1 (150 ₼) & Maddə 96.1.4 (Cərimə Meydançası)',
    yhqReference: 'YHQ Əlavə 1 — Normativ tələbləri pozmaqla avadanlığın quraşdırılması və ya dəyişdirilməsi',
    descriptionAz:
      'Ön asqının süni araqatlarla («prostafka») qaldırılması və ya arxanın endirilməsi avtomobilin ağırlıq mərkəzini pozur, aşma riskini artırır və yaxın işıq faralarını qarşıdakı sürücülərin gözünə yönəldir.',
  },
  {
    id: 'cut_heated_springs',
    nameAz: 'Kəsilmiş və ya Qızdırılmış Helezon Yaylar («Kəsilmiş Prujina / Pasadka»)',
    legalStatus: 'ILLEgal_CONSTRUCTIVE_342_2_1',
    fineAzn: 150,
    prohibitsOperation96: true,
    ixmArticle: 'İXM Maddə 342.2-1 (150 ₼) & Maddə 96.1.4 (İstismarın Qadağan Edilməsi)',
    yhqReference: 'YHQ Əlavə 1, Bənd 7.3 — Asqı elementlərinin konstruktiv bütövlüyünün pozulması',
    descriptionAz:
      'Helezon yayların laqonda ilə kəsilməsi və ya qazla qızdırılaraq oturdulması amortizatorun iş gedişini sıfırlayır, çuxurlarda təkərin yolla təmasını itirir və BDYP tərəfindən dərhal mühafizə olunan duracağa aparılır.',
  },
  {
    id: 'extreme_stance_camber',
    nameAz: 'Qanunsuz Ekstremal Mənfi «Stance / Razval» Qollar (> -3.5° Təkər Mailliyi)',
    legalStatus: 'ILLEgal_CONSTRUCTIVE_342_2_1',
    fineAzn: 150,
    prohibitsOperation96: true,
    ixmArticle: 'İXM Maddə 342.2-1 (150 ₼) — Konstruktiv dəyişiklik',
    yhqReference: 'YHQ Əlavə 1, Bölmə II & V — Sükan və şassi həndəsəsinin normativdən çıxması',
    descriptionAz:
      'Təkərlərin ekstremal bucaq altında əyilməsi («Stance») şinin yol səthi ilə təmas sahəsini 60%-dək azaldır, tormoz məsafəsini uzadır və stupitsa podşipniklərini sıradan çıxarır.',
  },
];

export const WHEEL_FASTENER_PROFILES: WheelFastenerConditionProfile[] = [
  {
    id: 'intact_oem_bolts_rims',
    nameAz: 'Tam Bolt/Qayka Dəsti və Çatsız Orijinal Disklər (YHQ Bənd 5.4 & 5.5 Uyğun)',
    isRoadworthy: true,
    fineAzn: 0,
    prohibitsOperation: false,
    legalClause: 'YHQ Əlavə 1, Bölmə V, Bənd 5.4 və 5.5 — Tam saz vəziyyət',
    technicalRiskAz: 'Bütün təkər bərkidici boltları/qaykaları yerindədir (dinamometrik açarla 110–140 Nm sıxılıb), disklərdə çat və ya qaynaq yoxdur.',
  },
  {
    id: 'missing_lug_bolt',
    nameAz: 'Təkər Bərkidici Bolt və ya Qaykasının Çatışmazlığı (YHQ Bənd 5.4 Qadağası)',
    isRoadworthy: false,
    fineAzn: 50,
    prohibitsOperation: true,
    legalClause: 'YHQ Əlavə 1, Bənd 5.4 & İXM Maddə 342.1.5 (50 ₼ cərimə)',
    technicalRiskAz:
      'YHQ Əlavə 1 Bənd 5.4-ə əsasən hətta 1 ədəd təkər boltu, şpilkası və ya qaykası çatışmadıqda nəqliyyat vasitəsinin istismarı qəti qadağandır (yüksək sürətdə təkərin qopma təhlükəsi).',
  },
  {
    id: 'cracked_or_welded_rim',
    nameAz: 'Çatlamış, Deformasiyalı və ya Arqon Qaynaqlı («Svarkalı») Təkər Diski',
    isRoadworthy: false,
    fineAzn: 50,
    prohibitsOperation: true,
    legalClause: 'YHQ Əlavə 1, Bənd 5.5 & İXM Maddə 342.1.5 (50 ₼ cərimə)',
    technicalRiskAz:
      'YHQ Əlavə 1 Bənd 5.5-ə əsasən disklərdə çat olduqda və ya çatlar qaynaqla («svarka») bərpa edildikdə istismar qadağandır — çuxura düşdükdə disk qəfil parçalanır.',
  },
  {
    id: 'wheel_spacer_unregistered',
    nameAz: 'Sertifikatsız Qalın Təkər Araqatı («Spayser / Prostafka» >20 mm, Kuzovdan Çıxan)',
    isRoadworthy: false,
    fineAzn: 150,
    prohibitsOperation: true,
    legalClause: 'YHQ Əlavə 1, Bənd 7.11 & İXM Maddə 342.2-1 (150 ₼ cərimə)',
    technicalRiskAz:
      'Təkər izinin (koleyanın) normadan artıq genişləndirilməsi stupitsa yastığına ikiqat yük verir və boltların yivini qırır.',
  },
  {
    id: 'worn_hub_bearing_cv',
    nameAz: 'Stupitsa Podşipniki Lüftü / Qranat (ŞRUS) Xırtıltısı və Kardan Vibrasiyası',
    isRoadworthy: false,
    fineAzn: 50,
    prohibitsOperation: false,
    legalClause: 'YHQ Əlavə 1, Bölmə V & VII — Hərəkət hissəsinin nasazlığı',
    technicalRiskAz:
      'Stupitsa podşipnikində normadan artıq radial lüft və ya cırılmış ŞRUS (qranat) pılniki döngələrdə ötürmənin kəsilməsinə və təkərin pərçimlənməsinə səbəb ola bilər.',
  },
];

export const CHASSIS_SERVICE_PACKAGES: ChassisServicePackage[] = [
  {
    id: 'pkg-hunter-3d-alignment',
    nameAz: 'Hunter HawkEye Elite 3D Lazer «Razval-Sxojdeniya» (Ön və Arxa Ox Tənzimlənməsi)',
    category: '3D_ALIGNMENT',
    partsCostAzn: 10,
    laborCostAzn: 40,
    durationMinutes: 45,
    warrantyMonths: 6,
    includesAzsProtocol: true,
    descriptionAz:
      '4 yüksək dəqiqlikli kamera ilə Camber (Razval), Caster və Toe (Sxojdeniya) bucaqlarının zavod dəqiqliyi ilə (0.01°) tənzimlənməsi və rəsmi çap protokolu.',
  },
  {
    id: 'pkg-maha-eusama-shock',
    nameAz: 'Ön/Arxa Amortizator Cütü və Stabilizator Dayağı («Sırğa / Vtulka») Dəyişimi + EUSAMA Testi',
    category: 'SHOCK_ABSORBERS',
    partsCostAzn: 240,
    laborCostAzn: 80,
    durationMinutes: 120,
    warrantyMonths: 12,
    includesAzsProtocol: true,
    descriptionAz:
      'Sachs / KYB / Bilstein OEM standartlı qaz-yağ amortizatorlarının və stabilizator dayaqlarının quraşdırılması, MAHA EUSAMA vibrostendində ≥65% yol tutumu sınağı.',
  },
  {
    id: 'pkg-oem-springs-peredok-reset',
    nameAz: '«Peredok» və Kəsilmiş Yayların Ləğvi — Zavod (OEM) Helezon Yay Dəstinin Bərpası',
    category: 'PEREDOK_SPRING_RESET',
    partsCostAzn: 220,
    laborCostAzn: 90,
    durationMinutes: 150,
    warrantyMonths: 24,
    includesAzsProtocol: true,
    descriptionAz:
      'Qanunsuz araqatların («prostafka») çıxarılması, kəsilmiş yayların zavod hündürlüklü OEM helezon yaylarla əvəzlənməsi və BDYP cərimə meydançasından çıxış üçün uyğunluq aktı.',
  },
  {
    id: 'pkg-hub-bolts-bearing',
    nameAz: 'Stupitsa Podşipniki, Qranat (ŞRUS) Pılniki və 20 ədəd Orijinal Təkər Bolt/Qayka Dəsti',
    category: 'WHEEL_HUB_BOLTS',
    partsCostAzn: 145,
    laborCostAzn: 65,
    durationMinutes: 90,
    warrantyMonths: 12,
    includesAzsProtocol: true,
    descriptionAz:
      'YHQ Əlavə 1 Bənd 5.4 tələbinə uyğun 10.9 möhkəmlik sinifli tam təkər bolt/qayka dəsti (dinamometrik sıxma ilə) və FAG/SKF stupitsa podşipnikinin yenilənməsi.',
  },
  {
    id: 'pkg-celette-frame-straightening',
    nameAz: 'Celette 3D Lazer Stapel Stendində Kuzov Diaqonalları və Lonjeron Həndəsəsinin Bərpası',
    category: 'FRAME_GEOMETRY',
    partsCostAzn: 80,
    laborCostAzn: 420,
    durationMinutes: 360,
    warrantyMonths: 24,
    includesAzsProtocol: true,
    descriptionAz:
      'Qəzadan sonra əyilmiş ön/arxa lonjeronların və alt çərçivənin («podramnik») 3D lazer ölçmə stendində ≤2 mm zavod tolerantlığına qaytaran hidravlik dartma paketi.',
  },
];

export const ACCREDITED_SUSPENSION_CENTERS: AccreditedSuspensionCenter[] = [
  {
    id: 'susp-center-1',
    name: 'BDYP Zabrat Baş Texniki Müayinə və MAHA EUSAMA Asqı Stendi',
    city: 'Bakı',
    address: 'Sabunçu r., Zabrat-Maştağa şossesi 1-ci km (BDYP Baş İdarəsi)',
    phone: '+994 12 590 81 25',
    workingHours: 'B.e. – Şənbə: 09:00 – 18:00',
    equipment: ['MAHA FWT-1 EUSAMA Vibrostend', 'Klirens & Peredok Lazer Ölçü', 'YHQ Bənd 5.4/5.5 Ekspertiza'],
    rating: 4.9,
    waitTimeMinutes: 20,
    issuesOfficialCertificate: true,
  },
  {
    id: 'susp-center-2',
    name: 'Hunter 3D & Bosch Car Service — Babək Şassi və Həndəsə Mərkəzi',
    city: 'Bakı',
    address: 'Xətai r., Babək prospekti 64',
    phone: '+994 12 496 77 10',
    workingHours: 'Hər gün: 08:30 – 20:00',
    equipment: ['Hunter HawkEye Elite 3D Razval', 'MAHA Amortizator Stendi', 'Celette Lazer Kuzov Diaqonalları'],
    rating: 4.8,
    waitTimeMinutes: 15,
    issuesOfficialCertificate: true,
  },
  {
    id: 'susp-center-3',
    name: 'AZS Milli Standartlaşdırma & Avto-Ekspertiza Asqı Laboratoriyası',
    city: 'Bakı',
    address: 'Nərimanov r., Ziya Bünyadov pr. 48 (Dərnəgül)',
    phone: '+994 12 567 42 90',
    workingHours: 'B.e. – Cümə: 09:00 – 18:00',
    equipment: ['AZS 636 Klirens Sertifikatlaşdırma', 'Pnevmoasqı Hermetiklik Stendi', 'Ultrasəs Disk Çat Detektoru'],
    rating: 4.9,
    waitTimeMinutes: 25,
    issuesOfficialCertificate: true,
  },
  {
    id: 'susp-center-4',
    name: 'Badamdar Avtomobil Satış və 3D Şassi Diaqnostika Kompleksi',
    city: 'Bakı',
    address: 'Səbail r., Badamdar şossesi 11 (Avtobazar girişi)',
    phone: '+994 50 255 88 19',
    workingHours: 'Hər gün: 08:00 – 19:00',
    equipment: ['Alqı-Satqı Öncəsi 3D Lonjeron Yoxlaması', 'Hunter 3D Razval-Sxojdeniya', 'Stupitsa & ŞRUS Stendi'],
    rating: 4.7,
    waitTimeMinutes: 10,
    issuesOfficialCertificate: true,
  },
  {
    id: 'susp-center-5',
    name: 'Sumqayıt Regional BDYP & 3D Şassi Həndəsə Stansiyası',
    city: 'Sumqayıt',
    address: 'Bakı-Quba şossesi 36-cı km, Sumqayıt girişi',
    phone: '+994 18 654 19 40',
    workingHours: 'B.e. – Şənbə: 09:00 – 18:00',
    equipment: ['MAHA EUSAMA Stendi', 'Hunter 3D Razval', 'Dinamometrik Təkər Bərkidici Yoxlaması'],
    rating: 4.7,
    waitTimeMinutes: 12,
    issuesOfficialCertificate: true,
  },
  {
    id: 'susp-center-6',
    name: 'Gəncə Qərb Regional Şassi, Asqı və 3D Həndəsə Mərkəzi',
    city: 'Gəncə',
    address: 'Nizami Gəncəvi pr. 188, Gəncə',
    phone: '+994 22 256 71 33',
    workingHours: 'B.e. – Şənbə: 09:00 – 18:00',
    equipment: ['3D Lazer Razval-Sxojdeniya', 'EUSAMA Amortizator Stendi', 'Lonjeron Diaqonal Ekspertizası'],
    rating: 4.8,
    waitTimeMinutes: 10,
    issuesOfficialCertificate: true,
  },
];

export const SAMPLE_SUSPENSION_CERTIFICATES: SuspensionComplianceCertificate[] = [
  {
    certificateNumber: 'BDYP-ASQ-2026-88412',
    issueDate: '2026-09-14',
    expiryDate: '2027-09-14',
    plateNumber: '10-AA-700',
    vin: 'JTJHY7AX6P4012988',
    vehicleTitle: 'Toyota Land Cruiser 300 3.5 Twin-Turbo',
    ownerName: 'Kərimov Rəşad İlham oğlu',
    centerName: 'BDYP Zabrat Baş Texniki Müayinə və MAHA EUSAMA Asqı Stendi',
    frontEusamaAvgPercent: 74,
    rearEusamaAvgPercent: 71,
    maxAxleImbalancePercent: 4,
    suspensionModId: 'oem_standard',
    frontToRearPitchDeltaMm: 2,
    missingLugBoltsCount: 0,
    longeronDiagonalDeltaMm: 1.0,
    overallStatus: 'COMPLIANT',
    qrSecurityHash: 'AZS-BDYP-ASQ-88412-OK-992A',
  },
  {
    certificateNumber: 'BDYP-ASQ-2026-51904',
    issueDate: '2026-08-22',
    expiryDate: '2027-08-22',
    plateNumber: '99-XX-099',
    vin: 'W1N1671591A448210',
    vehicleTitle: 'Mercedes-Benz GLE 53 AMG 4MATIC+',
    ownerName: 'Əliyev Orxan Vaqif oğlu',
    centerName: 'Hunter 3D & Bosch Car Service — Babək Şassi və Həndəsə Mərkəzi',
    frontEusamaAvgPercent: 68,
    rearEusamaAvgPercent: 66,
    maxAxleImbalancePercent: 5,
    suspensionModId: 'oem_air_suspension',
    frontToRearPitchDeltaMm: 0,
    missingLugBoltsCount: 0,
    longeronDiagonalDeltaMm: 1.5,
    overallStatus: 'COMPLIANT',
    qrSecurityHash: 'AZS-BDYP-ASQ-51904-AIR-71C4',
  },
  {
    certificateNumber: 'BDYP-ASQ-2026-30771',
    issueDate: '2026-10-03',
    expiryDate: '2026-11-03',
    plateNumber: '90-OO-077',
    vin: 'XTA21074072518902',
    vehicleTitle: 'LADA (VAZ) 2107 1.6i Classic',
    ownerName: 'Məmmədov Elvin Tofiq oğlu',
    centerName: 'BDYP Zabrat Baş Texniki Müayinə və MAHA EUSAMA Asqı Stendi',
    frontEusamaAvgPercent: 18,
    rearEusamaAvgPercent: 16,
    maxAxleImbalancePercent: 22,
    suspensionModId: 'peredok_front_lift',
    frontToRearPitchDeltaMm: 65,
    missingLugBoltsCount: 1,
    longeronDiagonalDeltaMm: 5.5,
    overallStatus: 'PROHIBITED_96_1_4',
    qrSecurityHash: 'AZS-BDYP-ASQ-30771-FAIL-9614',
  },
];

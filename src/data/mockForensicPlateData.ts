export type EngineForensicStatusId =
  | 'oem_matching'
  | 'swapped_declared'
  | 'swapped_undeclared'
  | 'corroded_illegible'
  | 'tampered_welded';

export type LicensePlateConditionId =
  | 'clean_standard'
  | 'dirty_faded_40azn'
  | 'bent_tailgate_us'
  | 'anti_radar_film_500azn'
  | 'magnetic_curtain_frame_800azn'
  | 'missing_plate_800azn';

export type RearRecessFormat = 'eu_wide_520x112' | 'us_jdm_square_288x206';

export type MountedPlateType = 'type1_single_line_520' | 'type2_two_line_288';

export interface EngineForensicProfile {
  id: EngineForensicStatusId;
  nameAz: string;
  badgeAz: string;
  legalBasisAz: string;
  passesMeroInspection: boolean;
  requiresForensicLab: boolean;
  requiresTexpasportUpdate: boolean;
  prohibitsOperation: boolean;
  fineAzn: number;
  stateDutyAzn: number;
  descriptionAz: string;
}

export interface LicensePlateConditionSpec {
  id: LicensePlateConditionId;
  nameAz: string;
  ixmArticle: string;
  daylightReadabilityMeters: number; // Statutory norm: >= 40m
  nightReadabilityMeters: number; // Statutory norm: >= 20m
  rfidSignalValid: boolean;
  isDeliberateObstruction: boolean; // Triggers İXM 342.7 (500-800 AZN + 4 points)
  fineMinAzn: number;
  fineMaxAzn: number;
  penaltyPoints: number;
  requiresConfiscationOrImpound: boolean;
  descriptionAz: string;
}

export interface ForensicServicePackage {
  id: string;
  nameAz: string;
  category: 'state_duty' | 'forensic_lab' | 'plate_lighting' | 'srs_airbag' | 'fluid_seal';
  officialFeeOrPartsAzn: number;
  serviceOrLaborAzn: number;
  durationMinutes: number;
  legalNoteAz: string;
}

export interface ForensicInspectionCenter {
  id: string;
  nameAz: string;
  city: 'Bakı' | 'Xırdalan' | 'Sumqayıt' | 'Gəncə';
  addressAz: string;
  phone: string;
  workingHours: string;
  hasAcidEtchingForensicLab: boolean;
  hasType2SquarePlatePress: boolean;
  hasRfidChipTester: boolean;
  averageWaitMinutes: number;
  rating: number;
}

export interface ForensicPlateCertificate {
  certificateNumber: string; // e.g. BDYP-EKS-2026-84920
  issueDate: string;
  expiryDate: string;
  vehiclePlate: string;
  vin: string;
  vehicleModel: string;
  recordedEngineNumber: string;
  inspectedEngineNumber: string;
  engineForensicVerdict: 'CLEAN_MATCH' | 'UPDATED_CONTRACT_ENGINE' | 'CORROSION_CERTIFIED';
  plateFormat: MountedPlateType;
  plateNightReadabilityMeters: number;
  rfidTagUid: string;
  srsSquibVerified: boolean;
  fluidHermeticityPassed: boolean;
  inspectingCenterAz: string;
  expertRankAndName: string;
  qrSecurityHash: string;
}

export const ENGINE_FORENSIC_PROFILES: EngineForensicProfile[] = [
  {
    id: 'oem_matching',
    nameAz: 'Zavod Mühərriki (Texpasport və Blok Nömrəsi Tam Uyğundur)',
    badgeAz: 'Tam Qanuni (OEM)',
    legalBasisAz: 'YHQ Maddə 27 & Əlavə 1 Bənd 7.15',
    passesMeroInspection: true,
    requiresForensicLab: false,
    requiresTexpasportUpdate: false,
    prohibitsOperation: false,
    fineAzn: 0,
    stateDutyAzn: 0,
    descriptionAz:
      'Mühərrik blokunun üzərindəki zavod şriftləri, lazer qravirovkası və VIN kod Texpasport qeydləri ilə 100% üst-üstə düşür.',
  },
  {
    id: 'swapped_declared',
    nameAz: 'Dəyişdirilmiş "Kontrakt" Mühərrik (DGK Gömrük Bəyannaməsi Var, Texpasportda Qeyd Edilməyib)',
    badgeAz: 'Texpasport Yenilənməlidir',
    legalBasisAz: 'YHQ Maddə 27, Hissə IV & "Dövlət rüsumu haqqında" Qanun Maddə 18',
    passesMeroInspection: false,
    requiresForensicLab: false,
    requiresTexpasportUpdate: true,
    prohibitsOperation: false,
    fineAzn: 0,
    stateDutyAzn: 50, // 30 AZN Texpasport + 20 AZN texniki baxış/müayinə
    descriptionAz:
      'Xaricdən idxal olunmuş mühərrikin DGK yük gömrük bəyannaməsi mövcuddur, lakin 10 gün ərzində BDYP MERO-da Texpasport dəyişdirilməlidir (30 AZN Texpasport + 20 AZN müayinə).',
  },
  {
    id: 'swapped_undeclared',
    nameAz: 'Sənədsiz Dəyişdirilmiş Mühərrik (Texpasportla Uyğun Gəlmir, Gömrük Bəyannaməsi Yoxdur)',
    badgeAz: 'İstismarı Qadağandır (İXM 342.2-1)',
    legalBasisAz: 'YHQ Əlavə 1 Bənd 7.15 & İXM Maddə 342.2-1',
    passesMeroInspection: false,
    requiresForensicLab: true,
    requiresTexpasportUpdate: true,
    prohibitsOperation: true,
    fineAzn: 150,
    stateDutyAzn: 50,
    descriptionAz:
      'Mühərrik nömrəsi qeydiyyat şəhadətnaməsindəki rəqəmlərlə uyğun gəlmir və mənşə sənədi (gömrük bəyannaməsi / alqı-satqı aktı) yoxdur. Alqı-satqı zamanı MERO qeydiyyatdan imtina edir.',
  },
  {
    id: 'corroded_illegible',
    nameAz: 'Koroziya (Paslanma) Nəticəsində Oxunmayan Mühərrik Nömrəsi',
    badgeAz: 'Məhkəmə Ekspertizası Tələb Olunur',
    legalBasisAz: 'Ədliyyə Nazirliyi Məhkəmə Ekspertizası Mərkəzi Təlimatı & YHQ Maddə 27',
    passesMeroInspection: false,
    requiresForensicLab: true,
    requiresTexpasportUpdate: true,
    prohibitsOperation: false,
    fineAzn: 0,
    stateDutyAzn: 110, // 60 AZN Ekspertiza + 30 AZN Texpasport "Xüsusi qeydlər: Mühərrik N/Z koroziya" + 20 AZN baxış
    descriptionAz:
      'Təbii paslanma nəticəsində nömrə silinib. Kimyəvi-kriminalistik ekspertiza ilə nömrənin süni silinmədiyi təsdiqlənməli və Texpasportda "Xüsusi qeydlər"ə fotoşəkilli möhür vurulmalıdır.',
  },
  {
    id: 'tampered_welded',
    nameAz: 'Saxtalaşdırılmış / Qaynaq Edilmiş və ya Yenidən Döyülmüş VIN / Mühərrik Nömrəsi',
    badgeAz: 'KRİMİNAL SAXTALAŞDIRMA (CM 320)',
    legalBasisAz: 'AR Cinayət Məcəlləsi Maddə 320 / İXM Maddə 96.1',
    passesMeroInspection: false,
    requiresForensicLab: true,
    requiresTexpasportUpdate: false,
    prohibitsOperation: true,
    fineAzn: 800,
    stateDutyAzn: 0,
    descriptionAz:
      'Maqnit-optik defektoskopiya zamanı VIN panelin kəsilib qaynaq edildiyi və ya şriftlərin zavoddan kənar üsulla döyüldüyü aşkarlanıb. Avtomobil dərhal DİN mühafizə olunan duracağına yerləşdirilir.',
  },
];

export const LICENSE_PLATE_CONDITIONS: LicensePlateConditionSpec[] = [
  {
    id: 'clean_standard',
    nameAz: 'AZS 598 Standart Təmiz DQN (20m Gecə İşıqlandırması & Aktiv RFID Çip)',
    ixmArticle: 'Normaya Uyğundur (AZS 598 / YHQ Əlavə 1 Bənd 7.2)',
    daylightReadabilityMeters: 45,
    nightReadabilityMeters: 25,
    rfidSignalValid: true,
    isDeliberateObstruction: false,
    fineMinAzn: 0,
    fineMaxAzn: 0,
    penaltyPoints: 0,
    requiresConfiscationOrImpound: false,
    descriptionAz:
      'Dövlət qeydiyyat nişanı gündüz 40 metrdən, gecə isə 20 metrdən tam oxunur, daxili UHF RFID mikroçip BDYP İ-Patrul tərəfindən problemsiz tanınır.',
  },
  {
    id: 'dirty_faded_40azn',
    nameAz: 'Çirkli, Palçıqlı və ya Boyası Solmuş DQN (20m Məsafədən Oxunmur)',
    ixmArticle: 'İXM Maddə 342.1.3',
    daylightReadabilityMeters: 15,
    nightReadabilityMeters: 8,
    rfidSignalValid: true,
    isDeliberateObstruction: false,
    fineMinAzn: 40,
    fineMaxAzn: 40,
    penaltyPoints: 0,
    requiresConfiscationOrImpound: false,
    descriptionAz:
      'Nömrə nişanının çirkli olması və ya arxa nömrə işığının yanmaması səbəbindən 20 metr məsafədən oxunmaması — 40 AZN cərimə (cərimə balı yazılmır, yerində təmizləndikdə duracağa aparılmır).',
  },
  {
    id: 'bent_tailgate_us',
    nameAz: 'Əyilmiş / Qatlanmış Uzun Nömrə (ABŞ/Yaponiya Kvadrat Baqaj Yuvasına Zorla Bərkidilmiş)',
    ixmArticle: 'İXM Maddə 342.1.3 & AZS 598',
    daylightReadabilityMeters: 18,
    nightReadabilityMeters: 10,
    rfidSignalValid: false,
    isDeliberateObstruction: false,
    fineMinAzn: 40,
    fineMaxAzn: 40,
    penaltyPoints: 0,
    requiresConfiscationOrImpound: false,
    descriptionAz:
      'Standart 520×112 mm birsətirli nömrənin qatlanması və ya kənarlarının kəsilməsi qadağandır və daxili RFID antenasını zədələyir. BDYP-dən rəsmi 288×206 mm (Tip 2 kvadrat) nömrə alınmalıdır (22 AZN).',
  },
  {
    id: 'anti_radar_film_500azn',
    nameAz: 'İnfraqırmızı (IR) Anti-Radar "Nano" Plyonka və ya İşıqqaytarıcı Lak/Sprey',
    ixmArticle: 'İXM Maddə 342.7',
    daylightReadabilityMeters: 35,
    nightReadabilityMeters: 4,
    rfidSignalValid: true,
    isDeliberateObstruction: true,
    fineMinAzn: 500,
    fineMaxAzn: 800,
    penaltyPoints: 4,
    requiresConfiscationOrImpound: true,
    descriptionAz:
      'MMX foto-radarların infraqırmızı flaşını kor etmək üçün nömrə rəqəmlərinin üzərinə qara IR-plyonka yapışdırılması qəsdən gizlətmə hesab olunur: 500–800 AZN cərimə və 4 bal!',
  },
  {
    id: 'magnetic_curtain_frame_800azn',
    nameAz: 'Pultlu Gizli Pərdə, Maqnit və ya Elektrikli Qatlanan Nömrə Çərçivəsi',
    ixmArticle: 'İXM Maddə 342.7 & İXM Maddə 96.1',
    daylightReadabilityMeters: 0,
    nightReadabilityMeters: 0,
    rfidSignalValid: false,
    isDeliberateObstruction: true,
    fineMinAzn: 500,
    fineMaxAzn: 800,
    penaltyPoints: 4,
    requiresConfiscationOrImpound: true,
    descriptionAz:
      'Salondan düymə ilə nömrənin üzərini bağlayan pərdə və ya elektromaqnit mexanizm quraşdırılması: 500–800 AZN cərimə, 4 cərimə balı, qurğunun müsadirəsi və cərimə meydançası!',
  },
  {
    id: 'missing_plate_800azn',
    nameAz: 'Dövlət Qeydiyyat Nişanı Olmadan (və ya Yalnız Bir Nömrə ilə) İdarəetmə',
    ixmArticle: 'İXM Maddə 342.7 & İXM Maddə 96.1.2',
    daylightReadabilityMeters: 0,
    nightReadabilityMeters: 0,
    rfidSignalValid: false,
    isDeliberateObstruction: true,
    fineMinAzn: 500,
    fineMaxAzn: 800,
    penaltyPoints: 4,
    requiresConfiscationOrImpound: true,
    descriptionAz:
      'Nəqliyyat vasitəsinin ön və ya arxa dövlət qeydiyyat nişanı yerində olmadıqda (o cümlədən ön buferdən çıxarıb alın şüşəsinin altına qoyduqda) İXM 342.7 ilə 500–800 AZN cərimə və 4 bal tətbiq edilir.',
  },
];

export const FORENSIC_SERVICE_PACKAGES: ForensicServicePackage[] = [
  {
    id: 'pkg_texpasport_engine_update',
    nameAz: 'BDYP Texpasportda Dəyişdirilmiş ("Kontrakt") Mühərrik Nömrəsinin Rəsmiləşdirilməsi',
    category: 'state_duty',
    officialFeeOrPartsAzn: 30,
    serviceOrLaborAzn: 20,
    durationMinutes: 45,
    legalNoteAz: 'AR "Dövlət rüsumu haqqında" Qanun Maddə 18 (30 AZN Şəhadətnamə + 20 AZN Baxış)',
  },
  {
    id: 'pkg_type2_square_plate',
    nameAz: 'Rəsmi BDYP Tip-2 Kvadrat (288×206 mm) və ya Yenilənmiş Çipli DQN Dublikatı',
    category: 'state_duty',
    officialFeeOrPartsAzn: 22,
    serviceOrLaborAzn: 0,
    durationMinutes: 25,
    legalNoteAz: 'AZS 598 standartına uyğun arxa kvadrat nömrə və ya solmuş nömrənin rəsmi əvəzlənməsi (22 AZN)',
  },
  {
    id: 'pkg_forensic_corrosion_lab',
    nameAz: 'Ədliyyə Nazirliyi Məhkəmə Ekspertizası — Koroziyalı Mühərrik/VIN Kimyəvi Ekspertizası',
    category: 'forensic_lab',
    officialFeeOrPartsAzn: 60,
    serviceOrLaborAzn: 15,
    durationMinutes: 120,
    legalNoteAz: 'Paslanmış blok nömrəsinin maqnit-optik və kimyəvi reaktivlə oxunması və rəsmi rəyin verilməsi',
  },
  {
    id: 'pkg_plate_led_frame',
    nameAz: 'Arxa DQN Ağ LED İşıqlandırma Plafonu (20m Görünüş) & GOST Çərçivə Quraşdırılması',
    category: 'plate_lighting',
    officialFeeOrPartsAzn: 20,
    serviceOrLaborAzn: 15,
    durationMinutes: 20,
    legalNoteAz: 'YHQ Əlavə 1 Bənd 3.6 və 7.2 tələblərinə uyğun qaranlıqda 20 metr oxunma təminatı',
  },
  {
    id: 'pkg_srs_airbag_restore',
    nameAz: 'SRS Airbag Pirotexniki Patron ("Obmanka" Müqavimətin Ləğvi) & Crash-Data Bərpası',
    category: 'srs_airbag',
    officialFeeOrPartsAzn: 130,
    serviceOrLaborAzn: 60,
    durationMinutes: 90,
    legalNoteAz: 'Saxta 2.2 Ω müqavimətlərin çıxarılması, orijinal piropatron və SRS ECU proqramlaşdırılması',
  },
  {
    id: 'pkg_fuel_oil_hermeticity',
    nameAz: 'Yanacaq Reykası Hermetikliyi & Mühərrik Karter/Salnik Yağ Sızmasının Aradan Qaldırılması',
    category: 'fluid_seal',
    officialFeeOrPartsAzn: 65,
    serviceOrLaborAzn: 55,
    durationMinutes: 75,
    legalNoteAz: 'YHQ Əlavə 1 Bənd 6.1 (Yanacaq sızması qadağası) üzrə tam hermetikləşdirmə',
  },
];

export const FORENSIC_INSPECTION_CENTERS: ForensicInspectionCenter[] = [
  {
    id: 'center_meyveli_mero',
    nameAz: 'BDYP Baş Qeydiyyat-İmtahan İdarəsi (Meyvəli Kriminalistik Ekspertiza Stendi)',
    city: 'Bakı',
    addressAz: 'Bakı ş., Qaradağ r., Lökbatan-Xocahəsən şossesi (Meyvəli MERO, 1–8-ci bokslar)',
    phone: '+994 12 590 81 25',
    workingHours: 'B.e. – Şənbə: 09:00 – 18:00',
    hasAcidEtchingForensicLab: true,
    hasType2SquarePlatePress: true,
    hasRfidChipTester: true,
    averageWaitMinutes: 25,
    rating: 4.9,
  },
  {
    id: 'center_justice_forensic',
    nameAz: 'Ədliyyə Nazirliyi Məhkəmə Ekspertizası Mərkəzi (Avtotexniki və Trasoloji Laboratoriya)',
    city: 'Bakı',
    addressAz: 'Bakı ş., Səbail r., Xəqani küçəsi 24',
    phone: '+994 12 493 18 42',
    workingHours: 'B.e. – Cümə: 09:00 – 18:00',
    hasAcidEtchingForensicLab: true,
    hasType2SquarePlatePress: false,
    hasRfidChipTester: true,
    averageWaitMinutes: 40,
    rating: 4.9,
  },
  {
    id: 'center_zabrat_mero',
    nameAz: 'BDYP Zabrat Regional Müayinə və DQN Dublikat Mərkəzi',
    city: 'Bakı',
    addressAz: 'Bakı ş., Sabunçu r., Zabrat-Maştağa şossesi 1-ci km',
    phone: '+994 12 550 22 10',
    workingHours: 'Hər gün: 09:00 – 18:00',
    hasAcidEtchingForensicLab: false,
    hasType2SquarePlatePress: true,
    hasRfidChipTester: true,
    averageWaitMinutes: 15,
    rating: 4.8,
  },
  {
    id: 'center_khirdalan_autolab',
    nameAz: 'Abşeron Avto-Kriminalistika, SRS Airbag & Hermetiklik Diaqnostika Mərkəzi',
    city: 'Xırdalan',
    addressAz: 'Xırdalan ş., Bakı-Quba şossesi 9-cu km (Riyad TM yanı)',
    phone: '+994 50 344 19 88',
    workingHours: 'Hər gün: 09:00 – 20:00',
    hasAcidEtchingForensicLab: true,
    hasType2SquarePlatePress: false,
    hasRfidChipTester: true,
    averageWaitMinutes: 10,
    rating: 4.7,
  },
  {
    id: 'center_sumgayit_mero',
    nameAz: 'Sumqayıt Regional Qeydiyyat-İmtahan və Kriminalistik Yoxlama Şöbəsi (1 №-li MERO)',
    city: 'Sumqayıt',
    addressAz: 'Sumqayıt ş., Sülh küçəsi, Giriş qovşağı',
    phone: '+994 18 655 14 02',
    workingHours: 'B.e. – Şənbə: 09:00 – 18:00',
    hasAcidEtchingForensicLab: true,
    hasType2SquarePlatePress: true,
    hasRfidChipTester: true,
    averageWaitMinutes: 20,
    rating: 4.8,
  },
  {
    id: 'center_ganja_mero',
    nameAz: 'Gəncə Regional BDYP Qeydiyyat-İmtahan və Ekspertiza İdarəsi',
    city: 'Gəncə',
    addressAz: 'Gəncə ş., Nizami Gəncəvi pr. 142 (Yevlax şossesi çıxışı)',
    phone: '+994 22 256 41 90',
    workingHours: 'B.e. – Şənbə: 09:00 – 18:00',
    hasAcidEtchingForensicLab: true,
    hasType2SquarePlatePress: true,
    hasRfidChipTester: true,
    averageWaitMinutes: 15,
    rating: 4.8,
  },
];

export const SAMPLE_FORENSIC_CERTIFICATES: ForensicPlateCertificate[] = [
  {
    certificateNumber: 'BDYP-EKS-2026-84920',
    issueDate: '2026-10-12',
    expiryDate: '2027-10-12',
    vehiclePlate: '90-AA-700',
    vin: 'WBA5A5C50FD918420',
    vehicleModel: 'BMW 528i (F10)',
    recordedEngineNumber: 'N20B20A-89412055',
    inspectedEngineNumber: 'N20B20A-89412055',
    engineForensicVerdict: 'CLEAN_MATCH',
    plateFormat: 'type2_two_line_288',
    plateNightReadabilityMeters: 26,
    rfidTagUid: 'AZ-UHF-90AA700-E280',
    srsSquibVerified: true,
    fluidHermeticityPassed: true,
    inspectingCenterAz: 'BDYP Baş Qeydiyyat-İmtahan İdarəsi (Meyvəli Kriminalistik Ekspertiza Stendi)',
    expertRankAndName: 'Polis mayoru R. Kərimov',
    qrSecurityHash: 'BDYP-EKS-HASH-90AA700-2026-VERIFIED',
  },
  {
    certificateNumber: 'BDYP-EKS-2026-51304',
    issueDate: '2026-09-25',
    expiryDate: '2027-09-25',
    vehiclePlate: '77-EK-505',
    vin: 'JTDKN3DU9E1782310',
    vehicleModel: 'Toyota Prius 30',
    recordedEngineNumber: '2ZRFXE-6104921 (Kontrakt Yenilənmiş)',
    inspectedEngineNumber: '2ZRFXE-6104921',
    engineForensicVerdict: 'UPDATED_CONTRACT_ENGINE',
    plateFormat: 'type2_two_line_288',
    plateNightReadabilityMeters: 24,
    rfidTagUid: 'AZ-UHF-77EK505-A914',
    srsSquibVerified: true,
    fluidHermeticityPassed: true,
    inspectingCenterAz: 'BDYP Zabrat Regional Müayinə və DQN Dublikat Mərkəzi',
    expertRankAndName: 'Polis kapitanı E. Məmmədov',
    qrSecurityHash: 'BDYP-EKS-HASH-77EK505-2026-VERIFIED',
  },
];

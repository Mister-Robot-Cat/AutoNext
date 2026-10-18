export type DriverFatigueLevelId =
  | 'normal_within_4h30'
  | 'needs_45min_break'
  | 'within_extended_10h_daily'
  | 'exceeds_daily_9h_limit'
  | 'weekly_or_rest_deficit';

export type TachographConditionId =
  | 'digital_g2_sealed_valid'
  | 'expired_2yr_calibration'
  | 'broken_metrological_plomb'
  | 'missing_or_shared_driver_card'
  | 'magnetic_impulse_sensor_bypass';

export type PassengerFreightRuleId =
  | 'compliant_manifest_and_route'
  | 'standing_intercity_passengers'
  | 'missing_electronic_ugl_waybill'
  | 'missing_pre_trip_medical_stamp'
  | 'unauthorized_hazardous_adr_cargo';

export interface TachographConditionProfile {
  id: TachographConditionId;
  nameAz: string;
  isCompliant: boolean;
  prohibitsDispatch: boolean;
  driverFineAzn: number;
  officialFineAzn: number; // IXM 326 / 348
  legalEntityFineAzn: number;
  legalBasisAz: string;
  descriptionAz: string;
}

export interface PassengerFreightViolationProfile {
  id: PassengerFreightRuleId;
  nameAz: string;
  isCompliant: boolean;
  prohibitsOperation: boolean;
  driverFineAzn: number;
  officialFineAzn: number;
  legalEntityFineAzn: number;
  legalBasisAz: string;
  descriptionAz: string;
}

export interface TachographServicePackage {
  id: string;
  nameAz: string;
  category: 'card_issuance' | 'calibration_seal' | 'medical_waybill' | 'hardware_install';
  stateDutyOrPartsAzn: number;
  laborCostAzn: number;
  durationMinutes: number;
  preventsFineAzn: number;
  descriptionAz: string;
}

export interface TachographCalibrationCenter {
  id: string;
  nameAz: string;
  city: 'Bakı' | 'Xırdalan' | 'Sumqayıt' | 'Gəncə';
  addressAz: string;
  authorityType: 'AYNA Rəqəmsal Kart' | 'AZS Metroloji Stend' | 'BDYP / AETR Ekspertiza';
  workshopStampCode: string; // e.g., AZ-TACHO-01
  workingHours: string;
  phone: string;
  servicesAz: string[];
}

export interface TachographComplianceCertificate {
  certificateNumber: string; // AYNA-TAXO-2026-XXXXX
  issueDate: string;
  expiryDate: string;
  vehiclePlate: string;
  vin: string;
  vehicleModel: string;
  driverCardNumber: string; // AZ-DRV-2026-XXXXXX
  tachographModelAndPlomb: string;
  calibrationStatusAz: string;
  workRestAuditVerdictAz: string;
  electronicWaybillNumber: string; // AYNA-UGL-2026-XXXXX
  inspectingCenterAz: string;
  verificationHash: string;
  overallStatus: 'PASS' | 'CONDITIONAL' | 'FAIL';
}

export const TACHOGRAPH_CONDITION_PROFILES: TachographConditionProfile[] = [
  {
    id: 'digital_g2_sealed_valid',
    nameAz: 'Smart Gen-2 Rəqəmsal Taxoqraf (Plomblu & 2 İllik Kalibrasiya Aktiv)',
    isCompliant: true,
    prohibitsDispatch: false,
    driverFineAzn: 0,
    officialFineAzn: 0,
    legalEntityFineAzn: 0,
    legalBasisAz: 'YHQ Əlavə 1 Bənd 7.4 & NK Qərar № 73 (Tam uyğun)',
    descriptionAz:
      'Avtomobildə VDO DTCO 4.0 / Stoneridge SE5000 rəqəmsal taxoqraf quraşdırılıb, metroloji plombu tamdır və 24 aylıq kalibrasiya sertifikatı qüvvədədir.',
  },
  {
    id: 'expired_2yr_calibration',
    nameAz: '24 Aylıq Metroloji Yoxlama (Kalibrasiya) Müddəti Bitib',
    isCompliant: false,
    prohibitsDispatch: true,
    driverFineAzn: 80,
    officialFineAzn: 250,
    legalEntityFineAzn: 1000,
    legalBasisAz: 'YHQ Əlavə 1 Bənd 7.4 & İXM Maddə 326-1 (Taxoqraf yoxlaması qaydası)',
    descriptionAz:
      'Taxoqraf hər 24 aydan bir (və ya şin ölçüsü dəyişdikdə) akkreditə olunmuş AZS laboratoriyasında kalibrasiya edilməlidir.',
  },
  {
    id: 'broken_metrological_plomb',
    nameAz: 'QADAĞAN: Taxoqraf və ya Sürətötürücü (KPP) Plombu Qırılıb / Yoxdur',
    isCompliant: false,
    prohibitsDispatch: true,
    driverFineAzn: 100,
    officialFineAzn: 300,
    legalEntityFineAzn: 1200,
    legalBasisAz: 'YHQ Əlavə 1 Bənd 7.4 & İXM Maddə 326-1 / 342.1',
    descriptionAz:
      'Sürətlər qutusu (KITAS sensoru) və ya taxoqraf korpusu üzərindəki rəsmi emalatxana plombunun zədələnməsi istismarı dərhal qadağan edir.',
  },
  {
    id: 'missing_or_shared_driver_card',
    nameAz: 'QADAĞAN: Sürücü Çip-Kartı Taxılmayıb və ya Başqa Sürücünün Kartı İstifadə Edilir',
    isCompliant: false,
    prohibitsDispatch: true,
    driverFineAzn: 100,
    officialFineAzn: 350,
    legalEntityFineAzn: 1500,
    legalBasisAz: 'İXM Maddə 326-1 & AETR Beynəlxalq Konvensiyası Maddə 12',
    descriptionAz:
      'Rəqəmsal taxoqrafa fərdi sürücü çip-kartı («OUT» rejimindən kənar) taxmadan hərəkət etmək və ya özgə kartdan istifadə kobud qanun pozuntusudur.',
  },
  {
    id: 'magnetic_impulse_sensor_bypass',
    nameAz: 'KRİTİK SAXTAKARLIQ: KPP Impuls Sensoruna Neodim Maqnit / «Obmanka» Qoşulub',
    isCompliant: false,
    prohibitsDispatch: true,
    driverFineAzn: 150,
    officialFineAzn: 400,
    legalEntityFineAzn: 2000,
    legalBasisAz: 'İXM Maddə 326-1 & Maddə 342.2-1 (Avtobus/Yük telemetriya saxtakarlığı)',
    descriptionAz:
      'Hərəkət zamanı taxoqrafı «İstirahət ( çarpayı )» rejimində saxlamaq üçün KITAS impuls datçikinə maqnit qoyulması ABS/ESP sistemini də söndürərək ağır qəza riski yaradır.',
  },
];

export const PASSENGER_FREIGHT_VIOLATION_PROFILES: PassengerFreightViolationProfile[] = [
  {
    id: 'compliant_manifest_and_route',
    nameAz: 'Tam Qanuni Daşıma (E-Uğur Yük/Sərnişin Vərəqəsi & Reysöncəsi Tibbi Müayinə)',
    isCompliant: true,
    prohibitsOperation: false,
    driverFineAzn: 0,
    officialFineAzn: 0,
    legalEntityFineAzn: 0,
    legalBasisAz: '«Avtomobil nəqliyyatı haqqında» Qanun Maddə 18 & 27 (Tam uyğun)',
    descriptionAz:
      'Rəqəmsal yol vərəqəsi (AYNA E-Uğur), reysöncəsi tibbi və texniki müayinə möhürü, habelə oturacaq sayına tam riayət olunur.',
  },
  {
    id: 'standing_intercity_passengers',
    nameAz: 'QADAĞAN: Şəhərlərarası Avtobusda Ayaqüstə və ya Normadan Artıq Sərnişin',
    isCompliant: false,
    prohibitsOperation: true,
    driverFineAzn: 100,
    officialFineAzn: 300,
    legalEntityFineAzn: 1000,
    legalBasisAz: 'YHQ Maddə 56 & İXM Maddə 326 / 327.2 (Sərnişin daşıma qaydalarının pozulması)',
    descriptionAz:
      'Şəhərlərarası və dağ marşrutlarında oturacaq sayından artıq (ayaqüstə və ya əlavə taburet qoymaqla) sərnişin daşınması qəti qadağandır.',
  },
  {
    id: 'missing_electronic_ugl_waybill',
    nameAz: 'QADAĞAN: AYNA Elektron Yol Vərəqəsi (E-Uğur) və ya Əmtəə-Nəqliyyat Qaiməsi Yoxdur',
    isCompliant: false,
    prohibitsOperation: true,
    driverFineAzn: 100,
    officialFineAzn: 300,
    legalEntityFineAzn: 1200,
    legalBasisAz: 'İXM Maddə 326.1 & Vergi Məcəlləsi (Qaiməsiz kommersiya daşıması)',
    descriptionAz:
      'Kommersiya yük və ya müntəzəm sərnişin daşımalarının AYNA informasiya sistemində elektron yol vərəqəsi olmadan həyata keçirilməsi qadağandır.',
  },
  {
    id: 'missing_pre_trip_medical_stamp',
    nameAz: 'QADAĞAN: Reysöncəsi Tibbi Müayinə (Alkotester/Təzyiq) və Mexanik Baxış Möhürü Yoxdur',
    isCompliant: false,
    prohibitsOperation: true,
    driverFineAzn: 100,
    officialFineAzn: 400,
    legalEntityFineAzn: 1500,
    legalBasisAz: 'YHQ Maddə 27 & İXM Maddə 348 (Vəzifəli şəxsin reysə buraxılış məsuliyyəti)',
    descriptionAz:
      'Sürücü reysöncəsi tibbi müayinədən, nəqliyyat vasitəsi isə mexanik nəzarətindən keçmədən xəttə buraxıldıqda vəzifəli şəxs cərimələnir.',
  },
  {
    id: 'unauthorized_hazardous_adr_cargo',
    nameAz: 'KRİTİK: Təhlükəli Yükün (ADR — Yanacaq/Qaz/Kimyəvi) Xüsusi Buraxılışsız Daşınması',
    isCompliant: false,
    prohibitsOperation: true,
    driverFineAzn: 200,
    officialFineAzn: 600,
    legalEntityFineAzn: 2500,
    legalBasisAz: 'YHQ Maddə 57 & İXM Maddə 352 (Təhlükəli yüklərin daşınması qaydaları)',
    descriptionAz:
      'Narıncı ADR nişanı, qığılcımsöndürən, FHN/BDYP marşrut razılaşdırması və ADR sürücü sertifikatı olmadan təhlükəli yük daşınması qadağandır.',
  },
];

export const TACHOGRAPH_SERVICE_PACKAGES: TachographServicePackage[] = [
  {
    id: 'ayna_driver_tachograph_card',
    nameAz: 'AYNA Fərdi Sürücü Rəqəmsal Taxoqraf Çip-Kartının Verilməsi (5 İllik)',
    category: 'card_issuance',
    stateDutyOrPartsAzn: 65,
    laborCostAzn: 10,
    durationMinutes: 30,
    preventsFineAzn: 100,
    descriptionAz:
      'Avropa AETR və milli standartlara uyğun mikroprosessorlu fərdi sürücü taxoqraf kartının (5 il müddətinə) rəsmiləşdirilməsi və 28 günlük yaddaş aktivasiyası.',
  },
  {
    id: 'azs_metrological_calibration_2yr',
    nameAz: 'AZS 24 Aylıq Rəqəmsal Taxoqraf Kalibrasiyası, KITAS Plomblanması və Etiket',
    category: 'calibration_seal',
    stateDutyOrPartsAzn: 50,
    laborCostAzn: 40,
    durationMinutes: 45,
    preventsFineAzn: 300,
    descriptionAz:
      'Təkər çevrəsi (L) və impuls əmsalının (W) rolikli stenddə ölçülməsi, KPP sürət sensoruna rəsmi qurğuşun/plastik plomb vurulması və qapı dirəyinə kalibrasiya lövhəciyinin yapışdırılması.',
  },
  {
    id: 'ayna_electronic_waybill_medical_pack',
    nameAz: 'AYNA «E-Uğur» Elektron Yol Vərəqəsi & Reysöncəsi Tele-Tibbi Müayinə Abunəliyi',
    category: 'medical_waybill',
    stateDutyOrPartsAzn: 35,
    laborCostAzn: 15,
    durationMinutes: 15,
    preventsFineAzn: 400,
    descriptionAz:
      'Rəqəmsal alkotester/tonometr terminalı vasitəsilə reysöncəsi tibbi müayinə rəyi və QR-kodlu elektron yol vərəqəsinin («E-Uğur») formalaşdırılması.',
  },
  {
    id: 'vdo_dtco_smart_tachograph_install',
    nameAz: 'VDO DTCO 4.0e / Stoneridge Smart Rəqəmsal Taxoqraf Quraşdırılması (Tam Komplekt)',
    category: 'hardware_install',
    stateDutyOrPartsAzn: 680,
    laborCostAzn: 120,
    durationMinutes: 150,
    preventsFineAzn: 1500,
    descriptionAz:
      'Köhnə analoq (şamlı) və ya nasaz taxoqrafın AETR sertifikatlı yeni nəsil rəqəmsal taxoqraf və şifrələnmiş KITAS-4 sürət sensoru ilə əvəzlənməsi.',
  },
  {
    id: 'tachograph_memory_28day_archive_audit',
    nameAz: '28 Günlük Sürücü Kartı & 365 Günlük Taxoqraf DDD Fayl Arxivləmə Auditi',
    category: 'calibration_seal',
    stateDutyOrPartsAzn: 20,
    laborCostAzn: 25,
    durationMinutes: 25,
    preventsFineAzn: 250,
    descriptionAz:
      'AYNA və AETR yoxlamaları üçün sürücü kartından (hər 28 gündən bir) və taxoqraf yaddaşından (hər 90 gündən bir) rəqəmsal imzalı .DDD fayllarının çıxarılması.',
  },
];

export const TACHOGRAPH_CALIBRATION_CENTERS: TachographCalibrationCenter[] = [
  {
    id: 'tacho_center_baku_ayna',
    nameAz: 'AYNA Rəqəmsal Taxoqraf Kartları və Daşıma Sənədləri Mərkəzi',
    city: 'Bakı',
    addressAz: 'Bakı ş., Nərimanov r-nu, Həsən Əliyev küç. 115 (5 saylı ASAN Xidmət yanı)',
    authorityType: 'AYNA Rəqəmsal Kart',
    workshopStampCode: 'AZ-AYNA-001',
    workingHours: 'B.e. – Cümə: 09:00 – 18:00, Şənbə: 09:00 – 14:00',
    phone: '141 (AYNA Çağrı Mərkəzi)',
    servicesAz: [
      'Sürücü, Şirkət və Nəzarətçi Rəqəmsal Taxoqraf Çip-Kartlarının verilməsi',
      '«E-Uğur» Elektron Yol Vərəqəsi və Bilet-Uçot vərəqi qeydiyyatı',
      'Beynəlxalq AETR və Buraxılış Kartı (M2/M3, N2/N3) rəsmiləşdirilməsi',
    ],
  },
  {
    id: 'tacho_center_baku_meyveli',
    nameAz: 'Bakı Beynəlxalq Avtovağzal & Meyvəli AZS Taxoqraf Kalibrasiya Stendi',
    city: 'Bakı',
    addressAz: 'Bakı ş., Qaradağ r-nu, Dairəvi yol, Meyvəli Gömrük-Logistika Terminalı korpus 3',
    authorityType: 'AZS Metroloji Stend',
    workshopStampCode: 'AZ-TACHO-014',
    workingHours: 'Hər gün: 08:30 – 20:00',
    phone: '+994 12 409 82 14',
    servicesAz: [
      'VDO Siemens, Stoneridge və Efkon rəqəmsal taxoqrafların 2 illik kalibrasiyası',
      'KITAS sürət ötürücüsünün plomblanması və maqnit müdaxiləsi ekspertizası',
      'Reysöncəsi tele-tibbi müayinə və mexanik baxış məntəqəsi',
    ],
  },
  {
    id: 'tacho_center_khirdalan_tir',
    nameAz: 'Abşeron-Xırdalan Ağır Tonnajlı (TIR) Taxoqraf & AETR Ekspertiza Mərkəzi',
    city: 'Xırdalan',
    addressAz: 'Xırdalan ş., Bakı-Quba şossesi 14-cü km (Ekologiya postu yaxınlığı)',
    authorityType: 'BDYP / AETR Ekspertiza',
    workshopStampCode: 'AZ-TACHO-022',
    workingHours: 'B.e. – Şənbə: 09:00 – 19:00',
    phone: '+994 12 342 77 90',
    servicesAz: [
      'N2/N3 yük dartıcıları və M3 turist avtobuslarında AETR iş-istirahət auditi',
      '28 günlük sürücü kartı (.DDD) məlumatlarının oxunması və pozuntu analizi',
      'ADR təhlükəli yük nəqliyyat vasitələrinin telemetriya yoxlaması',
    ],
  },
  {
    id: 'tacho_center_sumgayit',
    nameAz: 'Sumqayıt Regional AZS Taxoqraf & Sərnişin Daşıma Nəzarət Məntəqəsi',
    city: 'Sumqayıt',
    addressAz: 'Sumqayıt ş., Sülh prospekti 48 (Sumqayıt Avtovağzalı texniki zonası)',
    authorityType: 'AZS Metroloji Stend',
    workshopStampCode: 'AZ-TACHO-031',
    workingHours: 'B.e. – Şənbə: 09:00 – 18:00',
    phone: '+994 18 655 19 40',
    servicesAz: [
      'Şəhərlərarası M2/M3 avtobusların taxoqraf plomblanması və sürət məhdudlaşdırıcı testi',
      'Reysöncəsi tibbi müayinə (alkotester, arterial təzyiq) və elektron jurnal',
      'Yaxınməsafəli və magistral sərnişin tutumu uyğunluq sertifikatı',
    ],
  },
  {
    id: 'tacho_center_ganja',
    nameAz: 'Gəncə Qərb Regional AYNA & Taxoqraf Metroloji Laboratoriyası',
    city: 'Gəncə',
    addressAz: 'Gəncə ş., Nizami Gəncəvi pr. 112 (Qərb Avtovağzal Kompleksi)',
    authorityType: 'AYNA Rəqəmsal Kart',
    workshopStampCode: 'AZ-TACHO-045',
    workingHours: 'B.e. – Şənbə: 09:00 – 18:00',
    phone: '+994 22 256 64 18',
    servicesAz: [
      'Qərb regionu üzrə sürücü taxoqraf kartlarının qəbulu və təhvil verilməsi',
      'Qırmızı Körpü / Gürcüstan tranzit TIR parkı üçün AETR kalibrasiya protokolu',
      'Rəqəmsal taxoqraf termo-lent çapı və nasazlıq kodlarının silinməsi',
    ],
  },
];

export const SAMPLE_TACHOGRAPH_CERTIFICATES: TachographComplianceCertificate[] = [
  {
    certificateNumber: 'AYNA-TAXO-2026-84920',
    issueDate: '2026-04-05',
    expiryDate: '2028-04-05',
    vehiclePlate: '99-bus-404',
    vin: 'WDB9340321L849201',
    vehicleModel: 'Mercedes-Benz Travego 15 SHD (M3 / 49+1 yer)',
    driverCardNumber: 'AZ-DRV-2026-510842',
    tachographModelAndPlomb: 'VDO DTCO 4.0 Smart — Plomb № AZ-TACHO-014 (Tam saz)',
    calibrationStatusAz: 'Metroloji yoxlama aktivdir (W=8000 imp/km, L=3185 mm)',
    workRestAuditVerdictAz: 'AETR Normal (4s 15d fasiləsiz / 8s 30d gündəlik — Pozuntu yoxdur)',
    electronicWaybillNumber: 'AYNA-UGL-2026-90412',
    inspectingCenterAz: 'Bakı Beynəlxalq Avtovağzal & Meyvəli AZS Taxoqraf Kalibrasiya Stendi',
    verificationHash: '0x9f4c...e82a71b0',
    overallStatus: 'PASS',
  },
  {
    certificateNumber: 'AYNA-TAXO-2026-31055',
    issueDate: '2026-03-19',
    expiryDate: '2028-03-19',
    vehiclePlate: '77-TR-808',
    vin: 'YV2RT40A8PB310559',
    vehicleModel: 'Volvo FH 500 Globetrotter XL (N3 / 40t TIR)',
    driverCardNumber: 'AZ-DRV-2026-194027',
    tachographModelAndPlomb: 'Stoneridge SE5000 Exakt Duo² — Plomb № AZ-TACHO-022',
    calibrationStatusAz: 'AETR Beynəlxalq Sertifikatlı (24 aylıq müddət qüvvədədir)',
    workRestAuditVerdictAz: 'Həftəlik uzadılmış 9s 45d sürüş norması daxilindədir (Qanuni)',
    electronicWaybillNumber: 'AYNA-UGL-2026-66201',
    inspectingCenterAz: 'Abşeron-Xırdalan Ağır Tonnajlı (TIR) Taxoqraf & AETR Ekspertiza Mərkəzi',
    verificationHash: '0x3b18...c4902d11',
    overallStatus: 'PASS',
  },
];

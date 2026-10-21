export type DriverCategory = 
  | 'A1_A'
  | 'B'
  | 'BE'
  | 'C1_C'
  | 'CE'
  | 'D1_D'
  | 'TAXI';

export type ColorVisionDiagnosis = 
  | 'NORMAL_TRICHROMACY'
  | 'PROTANOPIA' // Red blindness / deficiency
  | 'DEUTERANOPIA' // Green blindness / deficiency
  | 'TOTAL_COLOR_BLINDNESS';

export type DispensaryStatus = 
  | 'CLEAN'
  | 'UNDER_OBSERVATION'
  | 'REGISTERED_ADDICTION'
  | 'RESTRICTED_DISORDER';

export interface RabkinPlateItem {
  id: string;
  plateNumber: number;
  imageAlt: string;
  normalAnswer: string;
  protanopeAnswer: string;
  deuteranopeAnswer: string;
  totalBlindAnswer: string;
  options: string[];
  explanation: string;
}

export interface DispensaryRecord {
  finCode: string;
  fullName: string;
  narcologyStatus: DispensaryStatus;
  psychoneurologyStatus: DispensaryStatus;
  lastClearanceDate: string;
  dispensaryDoctor: string;
  narcologyDocSerial: string;
  psychoDocSerial: string;
  notesAz: string;
}

export interface MedicalCenter {
  id: string;
  nameAz: string;
  addressAz: string;
  districtAz: string;
  city: 'Bakı' | 'Sumqayıt' | 'Gəncə';
  phone: string;
  workingHours: string;
  accreditedBy: 'Səhiyyə Nazirliyi & BDYP' | 'ASAN Xidmət & Səhiyyə Nazirliyi';
  isAsanIntegrated: boolean;
  baseFeeAzn: number;
  expressAvailable: boolean;
  rating: number;
  reviewsCount: number;
}

export interface MedicalServicePackage {
  id: string;
  titleAz: string;
  category: 'standard' | 'express' | 'professional' | 'reinstatement';
  feeAzn: number;
  processingHours: number;
  descriptionAz: string;
  includedSpecialists: string[];
  validityYearsDefault: number;
}

export interface DriverMedicalCertificate {
  certificateNumber: string; // e.g. SN-TIB-2026-XXXXX
  finCode: string;
  driverFullName: string;
  birthDate: string;
  bloodType: 'O(I) Rh+' | 'O(I) Rh-' | 'A(II) Rh+' | 'A(II) Rh-' | 'B(III) Rh+' | 'B(III) Rh-' | 'AB(IV) Rh+' | 'AB(IV) Rh-';
  allowedCategories: DriverCategory[];
  issueDate: string;
  expiryDate: string;
  issuingCenter: string;
  chiefPhysician: string;
  eyeCorrectionRequired: boolean; // Eynək / kontakt linza
  hearingAidRequired: boolean; // Eşitmə aparatı
  handControlsRequired: boolean; // Əl ilə idarəetmə
  colorVisionStatus: ColorVisionDiagnosis;
  visualAcuityLeft: number;
  visualAcuityRight: number;
  simaDigitalSignatureUid: string;
  qrHash: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
}

export const RABKIN_TEST_PLATES: RabkinPlateItem[] = [
  {
    id: 'rabkin_tab_1',
    plateNumber: 1,
    imageAlt: 'Cədvəl 1: Nümayiş lövhəsi (96 rəqəmi)',
    normalAnswer: '96',
    protanopeAnswer: '96',
    deuteranopeAnswer: '96',
    totalBlindAnswer: 'Görmürəm',
    options: ['96', '69', '12', 'Görmürəm'],
    explanation: 'Bütün rəng duyğusu normal və pozulmuş şəxslər 96 rəqəmini eyni aydınlıqda oxuyur (nümayiş cədvəli).'
  },
  {
    id: 'rabkin_tab_2',
    plateNumber: 2,
    imageAlt: 'Cədvəl 2: Dairə və Üçbucaq fiqurları',
    normalAnswer: 'Dairə və Üçbucaq',
    protanopeAnswer: 'Yalnız Üçbucaq',
    deuteranopeAnswer: 'Yalnız Dairə',
    totalBlindAnswer: 'Görmürəm',
    options: ['Dairə və Üçbucaq', 'Yalnız Üçbucaq', 'Yalnız Dairə', 'Görmürəm'],
    explanation: 'Normal göz hər iki həndəsi fiquru görür; protanop yalnız üçbucağı, deyteranop isə yalnız dairəni ayırd edir.'
  },
  {
    id: 'rabkin_tab_3',
    plateNumber: 3,
    imageAlt: 'Cədvəl 3: 13 rəqəmi',
    normalAnswer: '13',
    protanopeAnswer: '6',
    deuteranopeAnswer: 'Görmürəm',
    totalBlindAnswer: 'Görmürəm',
    options: ['13', '6', '18', 'Görmürəm'],
    explanation: 'Normal rənggörmə 13 rəqəmini oxuyur; qırmızı-yaşıl korluğu olanlar 6 görür və ya heç bir rəqəm ayırd etmir.'
  },
  {
    id: 'rabkin_tab_4',
    plateNumber: 4,
    imageAlt: 'Cədvəl 4: 74 rəqəmi',
    normalAnswer: '74',
    protanopeAnswer: '21',
    deuteranopeAnswer: '21',
    totalBlindAnswer: 'Görmürəm',
    options: ['74', '21', '14', 'Görmürəm'],
    explanation: 'Normal göz 74 görür; protanopiya və ya deyteranopiya anomaliyası olanlar lövhədə 21 oxuyur.'
  },
  {
    id: 'rabkin_tab_5',
    plateNumber: 5,
    imageAlt: 'Cədvəl 5: 29 rəqəmi',
    normalAnswer: '29',
    protanopeAnswer: '70',
    deuteranopeAnswer: 'Görmürəm',
    totalBlindAnswer: 'Görmürəm',
    options: ['29', '70', '26', 'Görmürəm'],
    explanation: 'Normal trixromat 29 oxuyur; rəng anomaliyası olan pasiyentlər 70 və ya qeyri-müəyyən rəqəm görür.'
  },
  {
    id: 'rabkin_tab_6',
    plateNumber: 6,
    imageAlt: 'Cədvəl 6: 5 rəqəmi',
    normalAnswer: '5',
    protanopeAnswer: '2',
    deuteranopeAnswer: 'Görmürəm',
    totalBlindAnswer: 'Görmürəm',
    options: ['5', '2', '3', 'Görmürəm'],
    explanation: 'Normal görmə 5 rəqəmini fərqləndirir; protanopiya korluğu olanlar 2 rəqəmini seçir.'
  }
];

export const MOCK_DISPENSARY_DATABASE: DispensaryRecord[] = [
  {
    finCode: '6ABC123',
    fullName: 'Rəşad Əliyev Məmməd oğlu',
    narcologyStatus: 'CLEAN',
    psychoneurologyStatus: 'CLEAN',
    lastClearanceDate: '2026-09-15',
    dispensaryDoctor: 'Dr. Təranə İsmayılova',
    narcologyDocSerial: 'NRK-2026-98124',
    psychoDocSerial: 'PSX-2026-44120',
    notesAz: 'Qeydiyyatda deyil. Psixi və narkoloji cəhətdən tam sağlamdır.'
  },
  {
    finCode: '7XYZ890',
    fullName: 'Eldar Qasımov Fikrət oğlu',
    narcologyStatus: 'CLEAN',
    psychoneurologyStatus: 'CLEAN',
    lastClearanceDate: '2026-10-01',
    dispensaryDoctor: 'Dr. Fərid Nəzərov',
    narcologyDocSerial: 'NRK-2026-10294',
    psychoDocSerial: 'PSX-2026-55911',
    notesAz: 'Profilaktik qeydiyyatda yoxdur. Sürücülük üçün tam yararlıdır.'
  },
  {
    finCode: '5MNK456',
    fullName: 'Namiq Babayev Samir oğlu',
    narcologyStatus: 'REGISTERED_ADDICTION',
    psychoneurologyStatus: 'CLEAN',
    lastClearanceDate: '2026-04-12',
    dispensaryDoctor: 'Dr. Cavanşir Hacıyev',
    narcologyDocSerial: 'NRK-ACT-33219',
    psychoDocSerial: 'PSX-2026-88123',
    notesAz: 'Respublika Narkoloji Mərkəzində aktiv dispanser qeydiyyatındadır (İXM Maddə 334 əsasında məhdudiyyət).'
  },
  {
    finCode: '4KLT789',
    fullName: 'Vüsal Həsənov Oqtay oğlu',
    narcologyStatus: 'CLEAN',
    psychoneurologyStatus: 'RESTRICTED_DISORDER',
    lastClearanceDate: '2026-06-20',
    dispensaryDoctor: 'Dr. Sevil Mirzəyeva',
    narcologyDocSerial: 'NRK-2026-77112',
    psychoDocSerial: 'PSX-ACT-99120',
    notesAz: 'Psixonevroloji dispanserdə paroksizmal pozuntu ilə dispanser müşahidəsindədir (Sürücülük qadağandır).'
  }
];

export const MOCK_MEDICAL_CENTERS: MedicalCenter[] = [
  {
    id: 'baku_health_center',
    nameAz: 'Bakı Sağlamlıq Mərkəzi (Kliniki Komissiya)',
    addressAz: 'Nəsimi rayonu, Azadlıq prospekti 112',
    districtAz: 'Nəsimi',
    city: 'Bakı',
    phone: '+994 12 505-70-00',
    workingHours: 'B.e - Şənbə: 08:30 - 18:00',
    accreditedBy: 'Səhiyyə Nazirliyi & BDYP',
    isAsanIntegrated: true,
    baseFeeAzn: 30,
    expressAvailable: true,
    rating: 4.9,
    reviewsCount: 342
  },
  {
    id: 'asan_med_baku_1',
    nameAz: '1 Saylı ASAN Xidmət Mərkəzi Tibb Komissiyası',
    addressAz: 'Nərimanov rayonu, Akademik Həsən Əliyev küç. 36',
    districtAz: 'Nərimanov',
    city: 'Bakı',
    phone: '108 (ASAN Qaynar Xətt)',
    workingHours: 'B.e - Cümə: 09:00 - 19:00, Şənbə: 09:00 - 16:00',
    accreditedBy: 'ASAN Xidmət & Səhiyyə Nazirliyi',
    isAsanIntegrated: true,
    baseFeeAzn: 35,
    expressAvailable: true,
    rating: 4.95,
    reviewsCount: 520
  },
  {
    id: 'city_polyclinic_1',
    nameAz: '1 Nömrəli Bakı Şəhər Poliklinikası',
    addressAz: 'Səbail rayonu, Nizami küçəsi 83 (Torqovaya yaxınlığı)',
    districtAz: 'Səbail',
    city: 'Bakı',
    phone: '+994 12 493-21-45',
    workingHours: 'B.e - Cümə: 08:00 - 17:00',
    accreditedBy: 'Səhiyyə Nazirliyi & BDYP',
    isAsanIntegrated: true,
    baseFeeAzn: 25,
    expressAvailable: false,
    rating: 4.7,
    reviewsCount: 198
  },
  {
    id: 'narcology_republican',
    nameAz: 'Respublika Narkoloji Mərkəzi Ekspertiza Şöbəsi',
    addressAz: 'Sabunçu rayonu, Maştağa qəsəbəsi, Albalılıq sahəsi',
    districtAz: 'Sabunçu',
    city: 'Bakı',
    phone: '+994 12 455-11-03',
    workingHours: 'Hər gün 24/7 (Toksikoloji laboratoriya fasiləsiz)',
    accreditedBy: 'Səhiyyə Nazirliyi & BDYP',
    isAsanIntegrated: true,
    baseFeeAzn: 20,
    expressAvailable: true,
    rating: 4.8,
    reviewsCount: 164
  },
  {
    id: 'sumgayit_hospital_1',
    nameAz: 'Sumqayıt 1 Nömrəli Şəhər Xəstəxanası Tibbi Komissiyası',
    addressAz: 'Sumqayıt şəhəri, Səməd Vurğun küçəsi 14',
    districtAz: 'Mərkəz',
    city: 'Sumqayıt',
    phone: '+994 18 655-40-12',
    workingHours: 'B.e - Cümə: 08:30 - 17:30',
    accreditedBy: 'Səhiyyə Nazirliyi & BDYP',
    isAsanIntegrated: true,
    baseFeeAzn: 25,
    expressAvailable: true,
    rating: 4.65,
    reviewsCount: 140
  },
  {
    id: 'ganja_diagnostic_center',
    nameAz: 'Gəncə Regional Diaqnostika və Tibbi Ekspertiza Mərkəzi',
    addressAz: 'Gəncə şəhəri, Heydər Əliyev prospekti 45',
    districtAz: 'Nizami',
    city: 'Gəncə',
    phone: '+994 22 266-02-18',
    workingHours: 'B.e - Şənbə: 09:00 - 18:00',
    accreditedBy: 'Səhiyyə Nazirliyi & BDYP',
    isAsanIntegrated: true,
    baseFeeAzn: 25,
    expressAvailable: true,
    rating: 4.75,
    reviewsCount: 182
  }
];

export const MOCK_MEDICAL_PACKAGES: MedicalServicePackage[] = [
  {
    id: 'pkg_standard_b',
    titleAz: 'Standart Forma AZS-083/e Arayışı (Kateqoriya A, B)',
    category: 'standard',
    feeAzn: 30,
    processingHours: 24,
    descriptionAz: 'Terapevt, Nevroloq, Oftalmoloq, Cərrah və LOR müayinəsi, rəqəmsal SİMA bazasına yüklənmə.',
    includedSpecialists: ['Terapevt', 'Oftalmoloq (Göz həkimi)', 'Nevroloq', 'LOR (Qulaq-Burun-Boğaz)', 'Cərrah'],
    validityYearsDefault: 10
  },
  {
    id: 'pkg_express_asan',
    titleAz: 'Ekspres ASAN Forma AZS-083/e (Təcili 1 Saatlıq)',
    category: 'express',
    feeAzn: 50,
    processingHours: 1,
    descriptionAz: 'ASAN Xidmət və BDYP bazasına dərhal (onlayn) ötürülən təcili tibbi arayış və dispanser sinxronizasiyası.',
    includedSpecialists: ['Bütün Komissiya Həkimləri', 'Elektron SİMA Reyestr Təsdiqi', 'E-Polis Əlaqəsi'],
    validityYearsDefault: 10
  },
  {
    id: 'pkg_professional_c_d',
    titleAz: 'Peşəkar Sürücü Tibbi Arayışı (Kateqoriya C, D, E, Taksi)',
    category: 'professional',
    feeAzn: 40,
    processingHours: 24,
    descriptionAz: 'Yüksək tələbli görmə itiliyi (≥0.8), səs audiometriyası, EKG kardioloji audit və psixoloji davamlılıq testi.',
    includedSpecialists: ['EKG Kardioqrafiya', 'Audiometriya (Eşitmə testi)', 'Oftalmoloq Refraktometriya', 'Psixoterapevt', 'Narkoloq'],
    validityYearsDefault: 1
  },
  {
    id: 'pkg_reinstatement_333',
    titleAz: 'Məhkəmə Sonrası Sürücülüyün Bərpası (İXM Maddə 333 / 334)',
    category: 'reinstatement',
    feeAzn: 60,
    processingHours: 48,
    descriptionAz: 'Sürücülük hüququndan məhrum edilmiş şəxslər üçün xüsusi genişləndirilmiş narkoloji və psixiatrik komissiya.',
    includedSpecialists: ['Respublika Narkoloji Mərkəzi Qan/Sidik Toksikologiyası', 'Psixiatrik Ekspertiza Şurası', 'BDYP İcra Protokolu'],
    validityYearsDefault: 1
  }
];

export const MOCK_EXISTING_CERTIFICATES: DriverMedicalCertificate[] = [
  {
    certificateNumber: 'SN-TIB-2026-88192',
    finCode: '6ABC123',
    driverFullName: 'Rəşad Əliyev Məmməd oğlu',
    birthDate: '1992-05-14',
    bloodType: 'A(II) Rh+',
    allowedCategories: ['A1_A', 'B', 'BE'],
    issueDate: '2026-09-15',
    expiryDate: '2036-09-15',
    issuingCenter: 'Bakı Sağlamlıq Mərkəzi',
    chiefPhysician: 'Prof. Dr. Rasim Quliyev',
    eyeCorrectionRequired: false,
    hearingAidRequired: false,
    handControlsRequired: false,
    colorVisionStatus: 'NORMAL_TRICHROMACY',
    visualAcuityLeft: 1.0,
    visualAcuityRight: 1.0,
    simaDigitalSignatureUid: 'SIMA-AZ-88192-MOH-2026',
    qrHash: 'e7f8a910bc44d012',
    status: 'ACTIVE'
  },
  {
    certificateNumber: 'SN-TIB-2026-44109',
    finCode: '7XYZ890',
    driverFullName: 'Eldar Qasımov Fikrət oğlu',
    birthDate: '1984-11-20',
    bloodType: 'O(I) Rh+',
    allowedCategories: ['B', 'C1_C', 'CE', 'TAXI'],
    issueDate: '2026-10-01',
    expiryDate: '2027-10-01',
    issuingCenter: '1 Saylı ASAN Xidmət Mərkəzi Tibb Komissiyası',
    chiefPhysician: 'Dr. Mehriban Səfərova',
    eyeCorrectionRequired: true,
    hearingAidRequired: false,
    handControlsRequired: false,
    colorVisionStatus: 'NORMAL_TRICHROMACY',
    visualAcuityLeft: 0.8,
    visualAcuityRight: 0.9,
    simaDigitalSignatureUid: 'SIMA-AZ-44109-MOH-2026',
    qrHash: 'a1b2c3d4e5f60718',
    status: 'ACTIVE'
  }
];

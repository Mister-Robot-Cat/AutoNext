export type AdasSystemKey = 'AEB' | 'ACC' | 'LKA' | 'BSM' | 'TSR' | 'AVM_360' | 'NIGHT_VISION';

export type CalibrationTriggerKey =
  | 'windshield_replacement'
  | 'bumper_collision'
  | 'suspension_alignment'
  | 'dtc_fault'
  | 'quarter_collision'
  | 'annual_audit';

export type CalibrationMethod = 'static' | 'dynamic' | 'dual';

export interface AdasSystemInfo {
  key: AdasSystemKey;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  sensorType: 'camera_mono' | 'camera_stereo' | 'radar_77ghz' | 'radar_24ghz' | 'ultrasonic_lidar' | 'camera_surround';
  defaultMethod: CalibrationMethod;
  descriptionAz: string;
  descriptionEn: string;
  uneceStandard: string;
  tolerancePitchDeg: number;
  toleranceYawDeg: number;
  iconName: string;
}

export interface CalibrationTriggerInfo {
  key: CalibrationTriggerKey;
  labelAz: string;
  labelEn: string;
  labelRu: string;
  severity: 'critical' | 'high' | 'medium';
  descriptionAz: string;
  requiredSystems: AdasSystemKey[];
  legalNoteAz: string;
}

export interface AdasCenter {
  id: string;
  nameAz: string;
  nameEn: string;
  addressAz: string;
  district: string;
  equipment: string;
  accreditation: string;
  phone: string;
  rating: number;
  reviewsCount: number;
  baysCount: number;
  liveQueueMinutes: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface AdasPackage {
  id: string;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  descriptionAz: string;
  basePriceAzn: number;
  systemsIncluded: AdasSystemKey[];
  estimatedDurationMinutes: number;
  method: CalibrationMethod;
}

export interface AdasDtcCode {
  code: string;
  systemKey: AdasSystemKey;
  descriptionAz: string;
  descriptionEn: string;
  severity: 'critical' | 'warning';
  recommendedActionAz: string;
}

export interface MockAdasCertificateRecord {
  id: string;
  certificateNo: string;
  vehiclePlate: string;
  vin: string;
  vehicleModel: string;
  calibrationDate: string;
  expiryDate: string;
  centerId: string;
  systemsCalibrated: AdasSystemKey[];
  status: 'PASSED' | 'FAILED';
  qrVerificationHash: string;
  technicianName: string;
  targetBoardModel: string;
  laserAlignmentPassed: boolean;
  dynamicRoadDrivePassed: boolean;
  telemetry: {
    cameraPitchDeg: number;
    cameraYawDeg: number;
    radarPitchDeg: number;
    radarYawDeg: number;
    centerlineOffsetMm: number;
  };
}

export const ADAS_SYSTEMS: Record<AdasSystemKey, AdasSystemInfo> = {
  AEB: {
    key: 'AEB',
    nameAz: 'Avtomatik Fövqəladə Tormozlanma (AEB)',
    nameEn: 'Autonomous Emergency Braking (AEB)',
    nameRu: 'Автономное экстренное торможение (AEB)',
    sensorType: 'radar_77ghz',
    defaultMethod: 'dual',
    descriptionAz: 'Ön 77 GHz radar və optik kamera vasitəsilə toqquşma təhlükəsini aşkarlayaraq avtomatik tormoz tətbiq edir.',
    descriptionEn: 'Detects collision risk using front 77 GHz radar and optical camera, applying automatic braking.',
    uneceStandard: 'UNECE R152 / AZS 638',
    tolerancePitchDeg: 0.3,
    toleranceYawDeg: 0.3,
    iconName: 'ShieldAlert'
  },
  ACC: {
    key: 'ACC',
    nameAz: 'Adaptiv Kruiz Kontrol (ACC Stop & Go)',
    nameEn: 'Adaptive Cruise Control (ACC)',
    nameRu: 'Адаптивный круиз-контроль (ACC)',
    sensorType: 'radar_77ghz',
    defaultMethod: 'dual',
    descriptionAz: 'Öndə gedən nəqliyyat vasitəsi ilə təhlükəsiz məsafəni və sürəti avtomatik tənzimləyir.',
    descriptionEn: 'Maintains safe speed and following distance behind preceding traffic automatically.',
    uneceStandard: 'ISO 15622 / UNECE R152',
    tolerancePitchDeg: 0.3,
    toleranceYawDeg: 0.3,
    iconName: 'Gauge'
  },
  LKA: {
    key: 'LKA',
    nameAz: 'Zolaqda Saxlama və Sükan Köməkçisi (LKA / LFA)',
    nameEn: 'Lane Keeping Assist (LKA / LFA)',
    nameRu: 'Ассистент удержания в полосе (LKA)',
    sensorType: 'camera_mono',
    defaultMethod: 'static',
    descriptionAz: 'Ön alın şüşəsi kamerası ilə yol xətlərini izləyir və zolaqdan kənara çıxdıqda sükanı aktiv istiqamətləndirir.',
    descriptionEn: 'Monitors road markings via windshield camera and actively steers vehicle to center lane.',
    uneceStandard: 'UNECE R79 / ISO 11270',
    tolerancePitchDeg: 0.2,
    toleranceYawDeg: 0.2,
    iconName: 'GitCommit'
  },
  BSM: {
    key: 'BSM',
    nameAz: 'Kor Nöqtə Radarı və Zolaq Dəyişmə Xəbərdarlığı (BSM / BSD)',
    nameEn: 'Blind Spot Monitoring (BSM / BSD)',
    nameRu: 'Мониторинг слепых зон (BSM)',
    sensorType: 'radar_24ghz',
    defaultMethod: 'static',
    descriptionAz: 'Arxa bamper künclərindəki mikrodalğalı radarlar ilə kor zonalardakı avtomobilləri güzgü indikatoru ilə göstərir.',
    descriptionEn: 'Detects vehicles in lateral blind spots via rear quarter radars, illuminating mirror LEDs.',
    uneceStandard: 'ISO 17387 / UNECE R151',
    tolerancePitchDeg: 0.5,
    toleranceYawDeg: 0.5,
    iconName: 'Eye'
  },
  TSR: {
    key: 'TSR',
    nameAz: 'Yol Nişanlarının İntellektual Tanınması (TSR)',
    nameEn: 'Traffic Sign Recognition (TSR)',
    nameRu: 'Распознавание дорожных знаков (TSR)',
    sensorType: 'camera_mono',
    defaultMethod: 'static',
    descriptionAz: 'Sürət hədləri, ötmə qadağaları və xəbərdarlıq nişanlarını optik analiz edərək sürücü panelinə ötürür.',
    descriptionEn: 'Optically detects speed limits and traffic restrictions, relaying them to head-up display.',
    uneceStandard: 'UNECE R157 / Euro NCAP',
    tolerancePitchDeg: 0.4,
    toleranceYawDeg: 0.4,
    iconName: 'Compass'
  },
  AVM_360: {
    key: 'AVM_360',
    nameAz: '360° Quşbaxışı Ətraf Görüntü Matrisi (AVM / SVM)',
    nameEn: '360° Surround View Monitor (AVM)',
    nameRu: 'Круговой обзор 360° (AVM)',
    sensorType: 'camera_surround',
    defaultMethod: 'static',
    descriptionAz: '4 ədəd genişbucaqlı kameranın təsvirlərini şahmat hədəf xalçaları ilə bir-birinə pikselsiz tikir.',
    descriptionEn: 'Calibrates 4 ultra-wide angle cameras using chessboard calibration mats for seamless stitching.',
    uneceStandard: 'ISO 20958',
    tolerancePitchDeg: 0.5,
    toleranceYawDeg: 0.5,
    iconName: 'Camera'
  },
  NIGHT_VISION: {
    key: 'NIGHT_VISION',
    nameAz: 'İnfraqırmızı Gecə Görmə və Piyada Termoqrafiyası',
    nameEn: 'Infrared Night Vision & Pedestrian Detection',
    nameRu: 'Инфракрасное ночное видение',
    sensorType: 'ultrasonic_lidar',
    defaultMethod: 'static',
    descriptionAz: 'Termal infraqırmızı kamera ilə qaranlıqda 150 metrə qədər olan piyadaları və canlıları fərqləndirir.',
    descriptionEn: 'Thermal FLIR camera distinguishing pedestrians and living obstacles up to 150m in total darkness.',
    uneceStandard: 'ISO 26262 ASIL-B',
    tolerancePitchDeg: 0.3,
    toleranceYawDeg: 0.3,
    iconName: 'Moon'
  }
};

export const CALIBRATION_TRIGGERS: Record<CalibrationTriggerKey, CalibrationTriggerInfo> = {
  windshield_replacement: {
    key: 'windshield_replacement',
    labelAz: 'Ön Alın Şüşəsinin Dəyişdirilməsi',
    labelEn: 'Windshield Replacement',
    labelRu: 'Замена лобового стекла',
    severity: 'critical',
    descriptionAz: 'Alın şüşəsi çıxarılıb yenisi quraşdırıldıqda optik bucaq dəyişir. Kamera yenidən hədəf lövhəsi ilə kalibrlənməlidir.',
    requiredSystems: ['AEB', 'LKA', 'TSR'],
    legalNoteAz: 'YHQ Maddə 30 & UNECE R152: Şüşə dəyişimindən sonra kalibrasiyasız istismar zəmanəti və sığorta məsuliyyətini ləğv edir.'
  },
  bumper_collision: {
    key: 'bumper_collision',
    labelAz: 'Ön Bamper və Radiator Barmaqlığı Zədəsi / Təmiri',
    labelEn: 'Front Bumper / Grille Impact or Repair',
    labelRu: 'Удар или замена переднего бампера',
    severity: 'critical',
    descriptionAz: 'Bamper söküldükdə və ya cüzi zərbə aldıqda 77 GHz radarın istiqaməti mikroskopik dərəcədə yayınır.',
    requiredSystems: ['AEB', 'ACC'],
    legalNoteAz: 'İXM Maddə 342.2-1: Təhlükəsizlik sistemlərinin qüsurlu olması 150 AZN cərimə və istismarın dayandırılmasına səbəb olur.'
  },
  suspension_alignment: {
    key: 'suspension_alignment',
    labelAz: 'Asqı Təmiri və 3D Razval (Təkər Bucaqları Tənzimi)',
    labelEn: 'Suspension Repair & 3D Wheel Alignment',
    labelRu: 'Ремонт подвески и 3D сход-развал',
    severity: 'high',
    descriptionAz: 'Kuzovun klirensi və təkər həndəsəsi dəyişdikdə optik sensorların yol səthinə nisbətən bucağı pozulur.',
    requiredSystems: ['AEB', 'ACC', 'LKA'],
    legalNoteAz: 'Sükan bucağı sensoru (SAS) və şassi həndəsəsi ADAS mərkəzi ilə sıfırlanmalıdır.'
  },
  quarter_collision: {
    key: 'quarter_collision',
    labelAz: 'Arxa Künc Qanad / Bamper Zədəsi (BSM)',
    labelEn: 'Rear Quarter / Bumper Collision (BSM)',
    labelRu: 'Удар в заднюю часть / крыло (BSM)',
    severity: 'high',
    descriptionAz: 'Arxa sağ/sol 24GHz və ya 77GHz kor nöqtə radarlarının bucağı kalibrasiya prizması ilə tənzimlənməlidir.',
    requiredSystems: ['BSM'],
    legalNoteAz: 'Zolaq dəyişmə zamanı qəza riskinin aradan qaldırılması üçün məcburidir.'
  },
  dtc_fault: {
    key: 'dtc_fault',
    labelAz: 'DTC Elektron İdarəetmə Xətası (Xəbərdarlıq İndikatoru)',
    labelEn: 'DTC Diagnostic Trouble Code Active',
    labelRu: 'Активная ошибка датчика (DTC)',
    severity: 'critical',
    descriptionAz: 'Avtomobilin tablosunda ADAS xəbərdarlıq üçbucağı yandıqda sensor şüasının bloklanması və ya itməsi baş verir.',
    requiredSystems: ['AEB', 'ACC', 'LKA', 'BSM', 'TSR'],
    legalNoteAz: 'BDYP texniki baxışı zamanı aktiv ADAS xətası olan nəqliyyat vasitələrinə baxış talonu verilmir.'
  },
  annual_audit: {
    key: 'annual_audit',
    labelAz: 'İllik Reqlament Baxışı və Metrologiya Yoxlaması',
    labelEn: 'Annual ADAS Metrological Verification',
    labelRu: 'Периодическая метрологическая проверка',
    severity: 'medium',
    descriptionAz: 'İldə bir dəfə sensorların çirklənmə, titrəyiş və dreyf amillərinə qarşı profilaktik auditindən keçirilməsi.',
    requiredSystems: ['AEB', 'ACC', 'LKA'],
    legalNoteAz: 'Azərbaycan Standartlaşdırma İnstitutu (AZS) tövsiyə olunan illik standartı.'
  }
};

export const ACCREDITED_ADAS_CENTERS: AdasCenter[] = [
  {
    id: 'baku-adas-lab',
    nameAz: 'Baku ADAS Precision Lab (Autolux Texnopark)',
    nameEn: 'Baku ADAS Precision Lab',
    addressAz: 'Bakı şəhəri, Babək prospekti 64 (Autolux arxası)',
    district: 'Xətai',
    equipment: 'Autel MaxiSys ADAS IA900 + Bosch DAS 3000 Premium',
    accreditation: 'AZS UNECE R152/R157 No. AZ-ADAS-001',
    phone: '+994 (12) 555-88-21',
    rating: 4.9,
    reviewsCount: 312,
    baysCount: 4,
    liveQueueMinutes: 20,
    coordinates: { lat: 40.384, lng: 49.888 }
  },
  {
    id: 'dernegul-adas-center',
    nameAz: 'Dərnəgül Texno-Diaqnostika və ADAS Mərkəzi',
    nameEn: 'Dernegul Techno-Diagnostic ADAS Center',
    addressAz: 'Bakı şəhəri, Ziya Bünyadov prospekti 118B (Dərnəgül körpüsü yanı)',
    district: 'Nərimanov',
    equipment: 'Texa RCCS 3 EVO + Snap-on EZ-ADAS 3D',
    accreditation: 'AZS UNECE R152/R157 No. AZ-ADAS-004',
    phone: '+994 (12) 449-33-10',
    rating: 4.8,
    reviewsCount: 245,
    baysCount: 3,
    liveQueueMinutes: 35,
    coordinates: { lat: 40.418, lng: 49.865 }
  },
  {
    id: 'white-city-adas',
    nameAz: 'Ağ Şəhər Hi-Tech Auto Calibration Center',
    nameEn: 'White City Hi-Tech Calibration Center',
    addressAz: 'Bakı şəhəri, Xətai rayonu, Ağ Şəhər Bulvar küçəsi 12',
    district: 'Xətai',
    equipment: 'Bosch DAS 3000 + Hunter Hawkeye Elite Laser 3D',
    accreditation: 'AZS UNECE R152/R157 No. AZ-ADAS-007',
    phone: '+994 (12) 505-19-00',
    rating: 4.9,
    reviewsCount: 189,
    baysCount: 3,
    liveQueueMinutes: 15,
    coordinates: { lat: 40.381, lng: 49.882 }
  },
  {
    id: 'khirdalan-adas-station',
    nameAz: 'Xırdalan MERO & Avto-Sensor Kalibrasiya Mərkəzi',
    nameEn: 'Khirdalan MERO ADAS Calibration Station',
    addressAz: 'Xırdalan şəhəri, Bakı-Quba magistralı 12-ci km',
    district: 'Abşeron',
    equipment: 'Hella Gutmann CSC-Tool SE + Radar Doppler Reflector',
    accreditation: 'AZS UNECE R152/R157 No. AZ-ADAS-012',
    phone: '+994 (12) 342-77-90',
    rating: 4.7,
    reviewsCount: 164,
    baysCount: 2,
    liveQueueMinutes: 45,
    coordinates: { lat: 40.453, lng: 49.758 }
  },
  {
    id: 'sumgayit-adas-center',
    nameAz: 'Sumqayıt Sənaye Avto-Audit & ADAS Laboratoriyası',
    nameEn: 'Sumgayit Industrial ADAS Laboratory',
    addressAz: 'Sumqayıt şəhəri, Sülh küçəsi 45 (Kimyaçılar sarayı yaxınlığı)',
    district: 'Sumqayıt',
    equipment: 'Autel MaxiSys ADAS IA800 + Digital Level Stand',
    accreditation: 'AZS UNECE R152/R157 No. AZ-ADAS-018',
    phone: '+994 (18) 654-22-11',
    rating: 4.8,
    reviewsCount: 142,
    baysCount: 2,
    liveQueueMinutes: 25,
    coordinates: { lat: 40.589, lng: 49.668 }
  },
  {
    id: 'ganja-regional-adas',
    nameAz: 'Gəncə Regional ADAS & Optoelektronika Mərkəzi',
    nameEn: 'Ganja Regional ADAS Center',
    addressAz: 'Gəncə şəhəri, Şah İsmayıl Xətai prospekti 210',
    district: 'Gəncə',
    equipment: 'Texa RCCS 3 + Bosch Radar Mirror Target',
    accreditation: 'AZS UNECE R152/R157 No. AZ-ADAS-025',
    phone: '+994 (22) 256-44-88',
    rating: 4.7,
    reviewsCount: 98,
    baysCount: 2,
    liveQueueMinutes: 30,
    coordinates: { lat: 40.682, lng: 46.36 }
  }
];

export const ADAS_PACKAGES: AdasPackage[] = [
  {
    id: 'front_camera_static',
    nameAz: 'Ön Alın Şüşəsi Kamerası Statik Kalibrasiyası',
    nameEn: 'Front Windshield Camera Static Calibration',
    nameRu: 'Статическая калибровка передней камеры',
    descriptionAz: 'LKA, TSR və optik AEB hədəf lövhəsi ilə optik ox və piksel fokuslaşdırması aparılır.',
    basePriceAzn: 80,
    systemsIncluded: ['LKA', 'TSR', 'AEB'],
    estimatedDurationMinutes: 45,
    method: 'static'
  },
  {
    id: 'front_radar_77ghz',
    nameAz: 'Ön 77 GHz Doopler Radarı Kalibrasiyası',
    nameEn: 'Front 77 GHz Radar Doppler Alignment',
    nameRu: 'Калибровка переднего радара 77 ГГц',
    descriptionAz: 'ACC və AEB radarının şüa bucağı korner reflektoru ilə ±0.3° dərəcə dözümlülüklə nizamlanır.',
    basePriceAzn: 110,
    systemsIncluded: ['ACC', 'AEB'],
    estimatedDurationMinutes: 50,
    method: 'static'
  },
  {
    id: 'full_adas_suite',
    nameAz: 'Kompleks Tam ADAS Kalibrasiyası (Statik + Dinamik)',
    nameEn: 'Full ADAS Suite (Static + Dynamic On-Road)',
    nameRu: 'Полный комплекс ADAS (Статический + Динамический)',
    descriptionAz: 'Kamera, 77 GHz radar, BSM, sükan bucağı sensoru və 15 km yol öyrənmə testi daxil tam reqlament.',
    basePriceAzn: 170,
    systemsIncluded: ['AEB', 'ACC', 'LKA', 'BSM', 'TSR'],
    estimatedDurationMinutes: 90,
    method: 'dual'
  },
  {
    id: 'blind_spot_bsm',
    nameAz: 'Arxa Kor Nöqtə (BSM) Radarları Kalibrasiyası',
    nameEn: 'Blind Spot Monitoring (BSM) Radar Alignment',
    nameRu: 'Калибровка радаров слепых зон (BSM)',
    descriptionAz: 'Sağ və sol arxa künc radarlarının 180° lazer koordinasiyası və kor zona xəbərdarlıq həddi.',
    basePriceAzn: 85,
    systemsIncluded: ['BSM'],
    estimatedDurationMinutes: 40,
    method: 'static'
  },
  {
    id: 'surround_view_360',
    nameAz: '360° Ətraf Görüntü Quşbaxışı Matris Kalibrasiyası',
    nameEn: '360° Surround View Bird-Eye Calibration',
    nameRu: 'Калибровка кругового обзора 360°',
    descriptionAz: '4 ədəd genişbucaqlı kameranın şahmat kalibrasiya xalçaları ilə pikselsiz tikiş tənzimi.',
    basePriceAzn: 90,
    systemsIncluded: ['AVM_360'],
    estimatedDurationMinutes: 60,
    method: 'static'
  }
];

export const ADAS_DTC_CODES: AdasDtcCode[] = [
  {
    code: 'C1A00',
    systemKey: 'AEB',
    descriptionAz: 'Ön intellektual kamera nəzarət blok xətası / optik ox sapması',
    descriptionEn: 'Forward recognition camera control module error / optical axis deviation',
    severity: 'critical',
    recommendedActionAz: 'Lazer şaquli və üfüqi hədəf lövhəsi ilə sıfırlama tələb olunur.'
  },
  {
    code: 'C1A14',
    systemKey: 'ACC',
    descriptionAz: 'Ön 77 GHz radar şüasının bucaq sapması (>0.5° pitch/yaw)',
    descriptionEn: 'Front radar beam mechanical misalignment exceeds tolerance',
    severity: 'critical',
    recommendedActionAz: 'Radar vintləri ilə mexaniki tənzimləmə və reflektor kalibrasiyası.'
  },
  {
    code: 'C1290',
    systemKey: 'LKA',
    descriptionAz: 'Sükan bucağı sensoru (SAS) sıfır nöqtəsi uyğunsuzluğu',
    descriptionEn: 'Steering angle sensor zero-point learning incomplete',
    severity: 'warning',
    recommendedActionAz: 'Elektron OBD-II sükan mərkəzləşdirməsi və adaptasiyası.'
  },
  {
    code: 'B124B',
    systemKey: 'BSM',
    descriptionAz: 'Arxa kor nöqtə radarı (Sağ/Sol) gövdə sapması',
    descriptionEn: 'Rear blind spot radar sensor angle offset',
    severity: 'warning',
    recommendedActionAz: 'Arxa bamper bərkidilməsi yoxlanılmalı və prizma stendi ilə test edilməlidir.'
  },
  {
    code: 'U0100',
    systemKey: 'AEB',
    descriptionAz: 'ADAS ECM ilə Mühərrik və Əyləc modulları arasında CAN-Bus rabitə itkisi',
    descriptionEn: 'Lost communication with ADAS Engine & Brake modules on CAN bus',
    severity: 'critical',
    recommendedActionAz: 'Naqil bütövlüyü yoxlanılmalı və sistem təkrar proqramlaşdırılmalıdır.'
  }
];

export const MOCK_ACTIVE_ADAS_CERTIFICATES: MockAdasCertificateRecord[] = [
  {
    id: 'cert-1',
    certificateNo: 'AZS-ADAS-2026-08412',
    vehiclePlate: '90-OJ-055',
    vin: 'WBA53AH07PCH28194',
    vehicleModel: 'BMW 530i xDrive (G30 LCI)',
    calibrationDate: '2026-03-14',
    expiryDate: '2027-03-14',
    centerId: 'baku-adas-lab',
    systemsCalibrated: ['AEB', 'ACC', 'LKA', 'TSR'],
    status: 'PASSED',
    qrVerificationHash: 'a7b8c9d0e1f24680fedcba9876543210',
    technicianName: 'Mühəndis Elçin Nəzərov (Sertifikat No: AZS-M-084)',
    targetBoardModel: 'Autel Target Pattern CSC0601/01',
    laserAlignmentPassed: true,
    dynamicRoadDrivePassed: true,
    telemetry: {
      cameraPitchDeg: 0.08,
      cameraYawDeg: -0.04,
      radarPitchDeg: 0.12,
      radarYawDeg: 0.05,
      centerlineOffsetMm: 2
    }
  },
  {
    id: 'cert-2',
    certificateNo: 'AZS-ADAS-2026-01934',
    vehiclePlate: '77-EV-100',
    vin: '5YJ3E1EB8NF192834',
    vehicleModel: 'Tesla Model 3 Long Range',
    calibrationDate: '2026-04-02',
    expiryDate: '2027-04-02',
    centerId: 'white-city-adas',
    systemsCalibrated: ['AEB', 'ACC', 'LKA', 'AVM_360', 'TSR'],
    status: 'PASSED',
    qrVerificationHash: '8493021948abcdef1029384756abcdef',
    technicianName: 'Aparıcı Ekspert Tural İsmayılov (Sertifikat No: AZS-M-041)',
    targetBoardModel: 'Bosch DAS 3000 Multi-Target Frame',
    laserAlignmentPassed: true,
    dynamicRoadDrivePassed: true,
    telemetry: {
      cameraPitchDeg: -0.05,
      cameraYawDeg: 0.02,
      radarPitchDeg: 0.0,
      radarYawDeg: 0.0,
      centerlineOffsetMm: 1
    }
  },
  {
    id: 'cert-3',
    certificateNo: 'AZS-ADAS-2026-05621',
    vehiclePlate: '99-XX-911',
    vin: 'JTDKBRFU9N0128491',
    vehicleModel: 'Toyota Camry 2.5 Hybrid',
    calibrationDate: '2026-02-18',
    expiryDate: '2027-02-18',
    centerId: 'dernegul-adas-center',
    systemsCalibrated: ['AEB', 'ACC', 'LKA'],
    status: 'PASSED',
    qrVerificationHash: '543210fedcba9876543210abcdef1234',
    technicianName: 'Diaqnostika Mütəxəssisi Fərid Məmmədov (Sertifikat No: AZS-M-112)',
    targetBoardModel: 'Texa RCCS 3 Laser Stand',
    laserAlignmentPassed: true,
    dynamicRoadDrivePassed: true,
    telemetry: {
      cameraPitchDeg: 0.11,
      cameraYawDeg: 0.06,
      radarPitchDeg: -0.15,
      radarYawDeg: 0.09,
      centerlineOffsetMm: 3
    }
  }
];

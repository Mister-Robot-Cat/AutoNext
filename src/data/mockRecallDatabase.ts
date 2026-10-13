import { AuthorizedServiceCenter, RecallCampaign } from '../types/recall';

export const MOCK_AUTHORIZED_SERVICE_CENTERS: AuthorizedServiceCenter[] = [
  {
    id: 'sc-improtex',
    name: 'Improtex Motors Rəsmi BMW & MINI Servis Mərkəzi',
    officialBrand: 'BMW',
    address: 'Babək prospekti 61C, Xətai rayonu',
    city: 'Bakı',
    phone: '+994 (12) 530-00-55',
    workingHours: 'B.e. - Şənbə: 09:00 - 18:30',
    availableSlots: ['09:30', '11:00', '13:30', '15:00', '16:30'],
    offersLoanerCar: true,
    rating: 4.9,
    reviewCount: 312,
  },
  {
    id: 'sc-autostar',
    name: 'Autostar Kaukasus Mercedes-Benz Baş Servis',
    officialBrand: 'Mercedes-Benz',
    address: 'Babək prospekti 1145, Nizami rayonu',
    city: 'Bakı',
    phone: '+994 (12) 496-54-54',
    workingHours: 'B.e. - Şənbə: 09:00 - 19:00',
    availableSlots: ['10:00', '11:30', '14:00', '15:30', '17:00'],
    offersLoanerCar: true,
    rating: 4.8,
    reviewCount: 420,
  },
  {
    id: 'sc-toyota-abseron',
    name: 'Toyota Abşeron Rəsmi Diler & Servis Mərkəzi',
    officialBrand: 'Toyota',
    address: 'Bakı-Sumqayıt şossesi, 6-cı km',
    city: 'Bakı / Abşeron',
    phone: '+994 (12) 349-00-60',
    workingHours: 'B.e. - Bazar: 09:00 - 18:00',
    availableSlots: ['09:00', '10:30', '12:00', '14:30', '16:00'],
    offersLoanerCar: true,
    rating: 4.9,
    reviewCount: 580,
  },
  {
    id: 'sc-porsche-baku',
    name: 'Porsche Centre Baku Servis Departamenti',
    officialBrand: 'Porsche',
    address: 'Heydər Əliyev prospekti 106A',
    city: 'Bakı',
    phone: '+994 (12) 511-39-11',
    workingHours: 'B.e. - Şənbə: 09:30 - 18:00',
    availableSlots: ['10:00', '12:00', '14:00', '16:00'],
    offersLoanerCar: true,
    rating: 5.0,
    reviewCount: 164,
  },
  {
    id: 'sc-electrobaku',
    name: 'ElectroBaku Sertifikatlaşdırılmış EV & Hybrid Texnoloji Mərkəzi',
    officialBrand: 'BYD / Tesla / EV Multi-Brand',
    address: 'Ağ Şəhər, Babək prospekti 24',
    city: 'Bakı',
    phone: '+994 (12) 525-44-88',
    workingHours: 'B.e. - Şənbə: 09:00 - 20:00',
    availableSlots: ['10:00', '11:30', '13:00', '15:00', '17:00', '18:30'],
    offersLoanerCar: false,
    rating: 4.8,
    reviewCount: 245,
  },
  {
    id: 'sc-auto-azerbaijan',
    name: 'Auto Azerbaijan Rəsmi Hyundai Baş Mərkəzi',
    officialBrand: 'Hyundai',
    address: 'Ziya Bünyadov prospekti 118',
    city: 'Bakı',
    phone: '+994 (12) 989-00-00',
    workingHours: 'B.e. - Şənbə: 09:00 - 18:00',
    availableSlots: ['09:30', '11:00', '14:00', '15:30', '17:00'],
    offersLoanerCar: false,
    rating: 4.7,
    reviewCount: 390,
  },
  {
    id: 'sc-grand-motors',
    name: 'Grand Motors Kia & Ford Rəsmi Servis Kompleksi',
    officialBrand: 'Kia',
    address: 'Ziya Bünyadov prospekti 11B',
    city: 'Bakı',
    phone: '+994 (12) 447-47-47',
    workingHours: 'B.e. - Şənbə: 09:00 - 18:30',
    availableSlots: ['10:00', '11:30', '13:30', '15:00', '16:30'],
    offersLoanerCar: false,
    rating: 4.6,
    reviewCount: 280,
  },
];

export const MOCK_RECALL_CAMPAIGNS_BY_VIN: Record<string, RecallCampaign[]> = {
  // BMW 530i M Sport (G30 LCI) - WBA5A7C50JB192841
  'WBA5A7C50JB192841': [
    {
      id: 'rc-bmw-1',
      campaignId: 'RC-BMW-2023-44',
      bulletinCode: 'KBA-012891 / NHTSA-23V410',
      category: 'brakes',
      severity: 'high',
      titleAz: 'İnteqrasiya Olunmuş Əyləc Sistemi (IBS) Hidravlik Klapan Proqram Təminatı',
      titleEn: 'Integrated Braking System (IBS) Hydraulic Valve Software Calibration',
      titleRu: 'Интегрированная тормозная система (IBS): калибровка ПО клапанов',
      descriptionAz:
        'Bəzi G30 modellərində IBS hidravlik idarəetmə blokunda siqnal fasiləsi yarana bilər. Bu halda mexaniki əyləc sistemi fəaliyyətini saxlayır, lakin əyləc pedalı üçün tələb olunan basma qüvvəsi arta bilər.',
      descriptionEn:
        'Signal interruption may occur in the IBS hydraulic control unit on select G30 vehicles. Mechanical braking remains fully operational, but manual pedal effort may increase.',
      descriptionRu:
        'В гидравлическом блоке управления IBS может произойти сбой сигнала. Механическое торможение сохраняется, но усилие на педаль может увеличиться.',
      consequenceAz: 'Əyləc məsafəsinin uzanması və ABS/DSC qəza xəbərdarlıq işığının yanması riski.',
      consequenceEn: 'Potential extended braking distance and activation of ABS/DSC warning light.',
      consequenceRu: 'Увеличение тормозного пути и загорание индикатора неисправности ABS/DSC.',
      remedyAz:
        'Rəsmi Improtex Motors mərkəzində IBS idarəetmə modulunun ən son I-Level proqram təminatı ilə pulsuz yenilənməsi və sensor testi.',
      remedyEn:
        'Free software update to the latest I-Level calibration and sensor diagnostics at authorized Improtex Motors dealer.',
      remedyRu:
        'Бесплатное обновление ПО блока управления IBS до последней версии I-Level и диагностика датчиков в дилерском центре.',
      announcementDate: '2023-11-14',
      estimatedLaborHours: 1.5,
      partsRequired: ['IBS Diagnostic Harness Check', 'I-Level ISTA Update Package'],
      isFreeDealerService: true,
      status: 'open_action_required',
    },
    {
      id: 'rc-bmw-2',
      campaignId: 'RC-BMW-2022-12',
      bulletinCode: 'EU-SG-2022-1104',
      category: 'powertrain',
      severity: 'critical',
      titleAz: 'EGR Soyuducu Modulunun Mikrosızma Yoxlanışı və Yenilənməsi',
      titleEn: 'EGR Cooler Micro-Leakage Inspection and Module Upgrade',
      titleRu: 'Проверка микротрещин охладителя EGR и замена модуля',
      descriptionAz:
        'EGR modulunun daxili soyuducu radiatorunda qlikol sızması nəticəsində his çöküntüsü ilə kimyəvi reaksiya ehtimalı müəyyən edilmişdir.',
      descriptionEn:
        'Potential coolant seepage inside the EGR cooler core reacting with soot deposits under high thermal loads.',
      descriptionRu:
        'Вероятность микроутечки охлаждающей жидкости внутри охладителя EGR с последующей реакцией с сажевыми отложениями.',
      consequenceAz: 'Emmə kollektorunun qızması və nadir hallarda alışma təhlükəsi.',
      consequenceEn: 'Thermal overload in intake manifold and potential fire risk.',
      consequenceRu: 'Термическая перегрузка впускного коллектора и риск воспламенения.',
      remedyAz: 'EGR soyuducu bloku təkmilləşdirilmiş BorgWarner modulu ilə əvəz olunmuşdur.',
      remedyEn: 'EGR cooler core replaced with upgraded BorgWarner unit under official campaign.',
      remedyRu: 'Охладитель EGR заменен на модернизированный узел BorgWarner по официальной отзывной кампании.',
      announcementDate: '2022-04-18',
      estimatedLaborHours: 3.0,
      partsRequired: ['Upgraded EGR Cooler Module v3', 'Reinforced Gasket Set', 'BMW Coolant Top-up'],
      isFreeDealerService: true,
      status: 'remedy_completed',
      completedDate: '2022-06-20',
      completedWorkshop: 'Improtex Motors Official BMW Service',
      technicianNotes: 'Modul nömrəsi 11718513691 quraşdırıldı. Sızma testindən uğurla keçdi.',
      certificateNumber: 'BMW-RC-2022-AZ-00912',
    },
  ],

  // Toyota Camry 2.5 Hybrid (XV70) - 4T1B11HK5LU821943
  '4T1B11HK5LU821943': [
    {
      id: 'rc-tyt-1',
      campaignId: 'RC-TYT-2023-09',
      bulletinCode: 'NHTSA-23V098 / KBA-011840',
      category: 'brakes',
      severity: 'high',
      titleAz: 'Əyləc Gücləndirici Nasosun Təzyiq Klapanının Yoxlanışı',
      titleEn: 'Brake Booster Pump Valve Seal Inspection',
      titleRu: 'Проверка уплотнительного клапана насоса усилителя тормозов',
      descriptionAz:
        'Camry Hybrid modellərində hidravlik əyləc gücləndirici nasosun daxili klapanında erkən aşınma müşahidə oluna bilər.',
      descriptionEn:
        'Premature wear may develop in the internal valve seal of the hydraulic brake booster pump in hybrid models.',
      descriptionRu:
        'На моделях Camry Hybrid может возникнуть преждевременный износ внутреннего клапана насоса усилителя тормозов.',
      consequenceAz: 'Əyləc pedalının yumşalması və rekuperasiya əyləc effektivliyinin azalması.',
      consequenceEn: 'Reduced power brake assist and decreased regenerative braking efficiency.',
      consequenceRu: 'Снижение эффективности торможения и работы рекуперативной системы.',
      remedyAz:
        'Rəsmi Toyota Abşeron mərkəzində əyləc nasosunun pulsuz diaqnostikası və təkmilləşdirilmiş nasosla əvəzlənməsi.',
      remedyEn:
        'Free diagnostic inspection and replacement with redesigned brake actuator assembly at Toyota Absheron.',
      remedyRu:
        'Бесплатная диагностика и замена актуатора тормозов на модернизированный узел в Toyota Absheron.',
      announcementDate: '2023-03-22',
      estimatedLaborHours: 2.5,
      partsRequired: ['Brake Actuator Valve Kit', 'Toyota DOT4 Fluid Flush'],
      isFreeDealerService: true,
      status: 'open_action_required',
    },
    {
      id: 'rc-tyt-2',
      campaignId: 'RC-TYT-2021-31',
      bulletinCode: 'NHTSA-20V682',
      category: 'fuel_system',
      severity: 'critical',
      titleAz: 'Aşağı Təzyiqli Yanacaq Nasosunun Pəri Əvəzlənməsi',
      titleEn: 'Low-Pressure Fuel Pump Impeller Replacement',
      titleRu: 'Замена крыльчатки топливного насоса низкого давления',
      descriptionAz:
        'Denso tərəfindən istehsal olunan yanacaq çəni daxili nasosun plastik pəri yanacaqla təmasda deformasiyaya uğraya bilərdi.',
      descriptionEn:
        'Fuel pump impellers manufactured by Denso may deform over time upon contact with certain fuel additives.',
      descriptionRu:
        'Крыльчатка топливного насоса Denso могла деформироваться при контакте с топливом определенного состава.',
      consequenceAz: 'Mühərrikin qəfil sönməsi və hərəkət zamanı işə düşməməsi riski.',
      consequenceEn: 'Engine stall while driving and inability to restart.',
      consequenceRu: 'Внезапная остановка двигателя во время движения и невозможность запуска.',
      remedyAz: 'Yanacaq nasosu yeni nəsil möhkəmləndirilmiş Denso modulu ilə pulsuz əvəz edildi.',
      remedyEn: 'Fuel pump replaced with redesigned Denso high-density composite pump free of charge.',
      remedyRu: 'Топливный насос бесплатно заменен на модернизированный композитный узел Denso.',
      announcementDate: '2021-02-15',
      estimatedLaborHours: 2.0,
      partsRequired: ['Fuel Pump Assembly Kit', 'Tank Gasket Seal'],
      isFreeDealerService: true,
      status: 'remedy_completed',
      completedDate: '2021-05-10',
      completedWorkshop: 'Toyota Abşeron Mərkəzi',
      technicianNotes: 'Kampaniya 20TA02 çərçivəsində nasos yeniləndi. Yanacaq təzyiqi normadadır (380 kPa).',
      certificateNumber: 'TYT-RC-2021-AZ-04192',
    },
  ],

  // Porsche Taycan 4S - WP1AA2AY3MLA71920
  'WP1AA2AY3MLA71920': [
    {
      id: 'rc-por-1',
      campaignId: 'RC-POR-2024-02',
      bulletinCode: 'KBA-013320 / NHTSA-24V312',
      category: 'brakes',
      severity: 'critical',
      titleAz: 'Ön Körpü Əyləc Şlanqlarının Əyilmə Bucaqlarının Optimallaşdırılması',
      titleEn: 'Front Axle Brake Hose Stress Relief and Routing Modification',
      titleRu: 'Модификация трассировки и замена передних тормозных шлангов',
      descriptionAz:
        'Sükanın maksimum dönmə bucaqlarında ön əyləc şlanqlarının elastik qatında mexaniki gərginlik yarana bilər.',
      descriptionEn:
        'At full steering lock, mechanical stress may concentrate on the outer casing of front flexible brake lines.',
      descriptionRu:
        'При крайних углах поворота руля на внешней оболочке передних тормозных шлангов может возникать напряжение.',
      consequenceAz: 'Hidravlik təzyiq itkisi və ön əyləc dövrəsinin zəifləməsi.',
      consequenceEn: 'Loss of front brake circuit pressure and pedal travel extension.',
      consequenceRu: 'Потеря давления в переднем контуре и увеличение хода педали тормоза.',
      remedyAz:
        'Porsche Centre Baku mərkəzində yeni həndəsi quruluşlu zirehli şlanqların quraşdırılması və əyləc mayesinin təzyiq testi.',
      remedyEn:
        'Installation of redesigned reinforced brake hoses and automated pressure testing at Porsche Centre Baku.',
      remedyRu:
        'Установка усиленных тормозных шлангов новой конфигурации и опрессовка системы в Porsche Centre Baku.',
      announcementDate: '2024-06-25',
      estimatedLaborHours: 2.0,
      partsRequired: ['Porsche Motorsport Spec Brake Lines', 'Brake Fluid DOT 4 Plus'],
      isFreeDealerService: true,
      status: 'open_action_required',
    },
    {
      id: 'rc-por-2',
      campaignId: 'RC-POR-2023-18',
      bulletinCode: 'EU-SG-2023-991',
      category: 'electrical_battery',
      severity: 'high',
      titleAz: 'Yüksək Gərginlikli Dartı Batareyası (HV BMS) Diaqnostika Alqoritmi',
      titleEn: 'High-Voltage Battery Cell Diagnostic and BMS Software Calibration',
      titleRu: 'Обновление алгоритма мониторинга ячеек тяговой батареи (HV BMS)',
      descriptionAz:
        '800V batareya blokunun ayrı-ayrı hüceyrələrində mikrogərginlik fərqlərini erkən aşkar edən qoruyucu proqram təminatı.',
      descriptionEn:
        'Enhanced diagnostic routine for early detection of potential cell anomalies within the 800V Performance Battery Plus.',
      descriptionRu:
        'Улучшенный диагностический алгоритм раннего обнаружения микроаномалий в ячейках 800V батареи.',
      consequenceAz: 'Batareya qızması riskinin qarşısının alınması və batareya ömrünün qorunması.',
      consequenceEn: 'Prevention of localized thermal stress and extension of battery pack lifespan.',
      consequenceRu: 'Предотвращение локального перегрева и продление срока службы ячеек.',
      remedyAz: 'BMS idarəetmə bloku proqram təminatı Porsche PIWIS 4 sistemi ilə uğurla yeniləndi.',
      remedyEn: 'BMS software flash completed via Porsche PIWIS 4 diagnostic platform.',
      remedyRu: 'ПО блока BMS успешно обновлено через дилерский комплекс Porsche PIWIS 4.',
      announcementDate: '2023-10-05',
      estimatedLaborHours: 1.5,
      partsRequired: ['PIWIS 4 Calibration Update Pack'],
      isFreeDealerService: true,
      status: 'remedy_completed',
      completedDate: '2023-11-12',
      completedWorkshop: 'Porsche Centre Baku',
      technicianNotes: 'Batareya SOH: 98.4%. Bütün 396 hüceyrə balanslaşdırıldı.',
      certificateNumber: 'POR-RC-2023-AZ-00108',
    },
  ],

  // BYD Seal Excellence AWD - LGXCF4CE2P1038192
  'LGXCF4CE2P1038192': [
    {
      id: 'rc-byd-1',
      campaignId: 'RC-BYD-2024-01',
      bulletinCode: 'CN-SAMR-2024-118 / AZ-EV-04',
      category: 'software',
      severity: 'medium',
      titleAz: 'Blade Battery İstilik Nasosu və İqlim İdarəetmə Mikrokodu Yenilənməsi',
      titleEn: 'Blade Battery Heat Pump & Thermal Management Firmware Update',
      titleRu: 'Обновление прошивки теплового насоса и термоменеджмента Blade Battery',
      descriptionAz:
        'Yüksək yay temperaturlarında (40°C+) kondisioner və batareya soyutma prioriteti arasında balansın təkmilləşdirilməsi.',
      descriptionEn:
        'Refined priority logic between cabin A/C cooling and Blade Battery chilling during extreme summer ambient heat (40°C+).',
      descriptionRu:
        'Оптимизация распределения мощности охлаждения между салоном и тяговой батареей при экстремальной жаре (+40°C).',
      consequenceAz: 'Yay aylarında sürətli şarj zamanı şarj gücünün sabit saxlanması.',
      consequenceEn: 'Maintains consistent peak DC fast charging speeds during hot summer days.',
      consequenceRu: 'Обеспечение стабильной высокой скорости зарядки DC в летний зной.',
      remedyAz:
        'ElectroBaku və ya rəsmi BYD mərkəzində V1.3.2 mikroproqram təminatının yazılması və klapan testi.',
      remedyEn:
        'Flashing of V1.3.2 microcode and electronic expansion valve calibration at certified EV hub.',
      remedyRu:
        'Установка прошивки V1.3.2 и калибровка электронного расширительного клапана в сертифицированном EV центре.',
      announcementDate: '2024-05-10',
      estimatedLaborHours: 1.0,
      partsRequired: ['BYD VDA Diagnostic Link', 'Thermal Firmware V1.3.2'],
      isFreeDealerService: true,
      status: 'open_action_required',
    },
  ],

  // Mercedes-Benz E 300 (W213) - WDD2130831A902831
  'WDD2130831A902831': [
    {
      id: 'rc-mb-1',
      campaignId: 'RC-MB-2023-55',
      bulletinCode: 'KBA-012750 / NHTSA-23V380',
      category: 'steering_suspension',
      severity: 'high',
      titleAz: 'Sükan Kolonkası İdarəetmə Modulunun Yerləbirləşmə Naqili Yoxlanışı',
      titleEn: 'Steering Column Module Ground Wire Harness Inspection',
      titleRu: 'Проверка жгута заземления модуля рулевой колонки',
      descriptionAz:
        'Sükan çarxı modulunun yerləbirləşmə kontaktında vibrasiya nəticəsində elektrostatik boşalma xətası riski.',
      descriptionEn:
        'Potential electrostatic discharge interruption in the steering column module ground contact under sustained vibration.',
      descriptionRu:
        'Возможность нарушения контакта заземления подрулевого модуля при вибрации.',
      consequenceAz: 'Sükan üzərindəki idarəetmə düymələrinin və ya hava yastığı xəbərdarlıq indikatorunun yanması.',
      consequenceEn: 'Intermittent failure of steering wheel controls or accidental SRS airbag warning illumination.',
      consequenceRu: 'Сбои кнопок управления на руле или ложное включение контрольной лампы SRS.',
      remedyAz:
        'Autostar Kaukasus mərkəzində əlavə möhkəmləndirilmiş yerləbirləşmə naqilinin quraşdırılması.',
      remedyEn:
        'Installation of supplemental ground bridge cable at authorized Autostar Kaukasus dealer.',
      remedyRu:
        'Монтаж дополнительного усиленного кабеля заземления в сервисном центре Autostar Kaukasus.',
      announcementDate: '2023-08-19',
      estimatedLaborHours: 1.0,
      partsRequired: ['Grounding Bridge Harness A2135400902'],
      isFreeDealerService: true,
      status: 'open_action_required',
    },
    {
      id: 'rc-mb-2',
      campaignId: 'RC-MB-2022-38',
      bulletinCode: 'EU-SG-2022-874',
      category: 'electrical_battery',
      severity: 'medium',
      titleAz: '48V Bort Elektrik Şəbəkəsi Akkumulyator Boltu Bərkitməsi',
      titleEn: '48V Mild-Hybrid Onboard Battery Terminal Fastener Torque Check',
      titleRu: 'Проверка момента затяжки клемм 48V аккумулятора мягкого гибрида',
      descriptionAz:
        '48V köməkçi litium akkumulyatorunun kabel terminallarında zavod bərkitmə momentinin yoxlanışı.',
      descriptionEn:
        'Verification of factory tightening torque on the 48V mild-hybrid lithium battery terminal studs.',
      descriptionRu:
        'Контроль заводского момента затяжки шпилек клемм 48V литиевого аккумулятора.',
      consequenceAz: 'EQ Boost sisteminin müvəqqəti qeyri-aktiv olması.',
      consequenceEn: 'Temporary unavailability of EQ Boost starter-alternator assist.',
      consequenceRu: 'Временное отключение функций гибридной системы EQ Boost.',
      remedyAz: 'Diler tərəfindən tork açarı ilə yoxlanış aparıldı və qoruyucu dielektrik örtük vuruldu.',
      remedyEn: 'Calibrated torque verification completed and anti-corrosion protective seal applied.',
      remedyRu: 'Выполнена динамометрическая протяжка и нанесено защитное диэлектрическое покрытие.',
      announcementDate: '2022-09-04',
      estimatedLaborHours: 0.8,
      partsRequired: ['Locking Nut Set', 'Dielectric Sealant'],
      isFreeDealerService: true,
      status: 'remedy_completed',
      completedDate: '2022-10-14',
      completedWorkshop: 'Autostar Kaukasus Baş Servis',
      technicianNotes: 'Bərkitmə 15 Nm normasına uyğunlaşdırıldı.',
      certificateNumber: 'MB-RC-2022-AZ-00441',
    },
  ],

  // Hyundai Santa Fe 2.2 CRDi - KMHD84LF7NU391024
  'KMHD84LF7NU391024': [
    {
      id: 'rc-hyu-1',
      campaignId: 'RC-HYU-2023-11',
      bulletinCode: 'NHTSA-23V651 / KBA-012490',
      category: 'electrical_battery',
      severity: 'critical',
      titleAz: 'ABS / ESC Hidravlik Elektron İdarəetmə Blokunun (HECU) Qoruyucu Dəsti',
      titleEn: 'Hydraulic Electronic Control Unit (HECU) Multi-Fuse Upgrade',
      titleRu: 'Замена мультипредохранителя гидроблока управления ABS/ESC (HECU)',
      descriptionAz:
        'HECU idarəetmə blokunun daxili mikrosxemində rütubət və duzlanma səbəbindən qısaqapanma riski.',
      descriptionEn:
        'Internal electrical short hazard within the HECU module due to micro-moisture ingress over severe duty cycles.',
      descriptionRu:
        'Риск внутреннего короткого замыкания в модуле HECU из-за возможного проникновения влаги.',
      consequenceAz: 'Mühərrik sönülü vəziyyətdə belə elektrik qısaqapanması təhlükəsi.',
      consequenceEn: 'Electrical short risk even when vehicle ignition is switched off.',
      consequenceRu: 'Опасность короткого замыкания даже при выключенном зажигании.',
      remedyAz:
        'Rəsmi Auto Azerbaijan mərkəzində yeni aşağı cərəyanlı HECU qoruyucusunun pulsuz quraşdırılması.',
      remedyEn:
        'Free installation of revised low-amperage HECU multi-fuse kit at authorized Auto Azerbaijan dealer.',
      remedyRu:
        'Бесплатная установка модернизированного мультипредохранителя HECU в Auto Azerbaijan.',
      announcementDate: '2023-09-28',
      estimatedLaborHours: 0.8,
      partsRequired: ['HECU Multi-Fuse Kit 40A', 'Terminal Cover Seal'],
      isFreeDealerService: true,
      status: 'open_action_required',
    },
  ],

  // Toyota Land Cruiser Prado 2.8 D-4D - JTEBU5JR9R8102941
  'JTEBU5JR9R8102941': [
    {
      id: 'rc-pra-1',
      campaignId: 'RC-TYT-2023-17',
      bulletinCode: 'NHTSA-23V401',
      category: 'powertrain',
      severity: 'medium',
      titleAz: 'Dizel Hissəcik Filtri (DPF) Diferensial Təzyiq Sensoru Proqramı',
      titleEn: 'DPF Differential Pressure Sensor Calibration & ECU Flash',
      titleRu: 'Калибровка датчика дифференциального давления DPF и прошивка ЭБУ',
      descriptionAz:
        'Şəhərdaxili tıxaclarda DPF filtrinin reqenerasiya temperaturunun daha tez çatması üçün idarəetmə proqramının yenilənməsi.',
      descriptionEn:
        'ECU logic update to enhance DPF soot burn-off regeneration during frequent low-speed city stop-and-go driving.',
      descriptionRu:
        'Обновление алгоритма ЭБУ для улучшения регенерации сажевого фильтра в городском цикле.',
      consequenceAz: 'Filtrin vaxtından əvvəl tutulması və yanacaq sərfiyyatının artması.',
      consequenceEn: 'Premature soot loading and slight increase in fuel consumption.',
      consequenceRu: 'Преждевременное засорение сажевого фильтра и повышенный расход топлива.',
      remedyAz: 'Toyota Abşeron mərkəzində ECU mühərrik idarəetmə bloku ən son kalibrasiyaya yeniləndi.',
      remedyEn: 'Engine control unit flashed to latest calibration at Toyota Absheron dealer.',
      remedyRu: 'ЭБУ двигателя обновлен до последней версии калибровки в Toyota Absheron.',
      announcementDate: '2023-04-12',
      estimatedLaborHours: 1.0,
      partsRequired: ['Toyota Techstream ECU Package'],
      isFreeDealerService: true,
      status: 'remedy_completed',
      completedDate: '2023-05-30',
      completedWorkshop: 'Toyota Abşeron Rəsmi Servis',
      technicianNotes: 'Diferensial təzyiq testi: 2.1 kPa (ideal norma).',
      certificateNumber: 'TYT-RC-2023-AZ-01994',
    },
  ],

  // Kia K5 1.6 T-GDI GT-Line - KNAFX4127N5109283
  'KNAFX4127N5109283': [
    {
      id: 'rc-kia-1',
      campaignId: 'RC-KIA-2023-04',
      bulletinCode: 'NHTSA-22V765 / KBA-012019',
      category: 'powertrain',
      severity: 'high',
      titleAz: '8 Pilləli Yaş İkili Muftalı Transmissiya (DCT) Elektrik Yağ Nasosu',
      titleEn: '8-Speed Wet Dual-Clutch Transmission (DCT) Electric Oil Pump Circuit',
      titleRu: 'Электрический масляный насос 8-ступенчатой коробки передач DCT',
      descriptionAz:
        'Transmissiyanın elektrik köməkçi yağ nasosunun çap lövhəsində lehim mikroçatı təhlükəsizlik rejiminin vaxtından əvvəl aktivləşməsinə səbəb ola bilər.',
      descriptionEn:
        'Solder micro-crack on electric oil pump circuit board could cause diagnostic fail-safe limp mode activation.',
      descriptionRu:
        'Микротрещина пайки на плате масляного насоса трансмиссии может вызвать переход в аварийный режим.',
      consequenceAz: 'Ötürücü qutunun təhlükəsizlik rejiminə keçməsi və dartı gücünün məhdudlaşdırılması.',
      consequenceEn: 'Transmission engages fail-safe mode and restricts engine torque.',
      consequenceRu: 'Переход трансмиссии в аварийный режим с ограничением мощности.',
      remedyAz:
        'Grand Motors mərkəzində transmissiya idarəetmə blokunun yenilənməsi və nasosun pulsuz testi.',
      remedyEn:
        'Transmission control module TCU reflash and pump diagnostic testing at Grand Motors.',
      remedyRu:
        'Перепрошивка блока TCU трансмиссии и тестирование насоса в Grand Motors.',
      announcementDate: '2023-01-20',
      estimatedLaborHours: 1.5,
      partsRequired: ['TCU Update V2', 'EOP Wire Loom Retainer'],
      isFreeDealerService: true,
      status: 'open_action_required',
    },
  ],
};

export const getFallbackRecallCampaigns = (
  vin: string,
  make: string,
  model: string,
  year: number
): RecallCampaign[] => {
  const isOlder = year < 2020;
  const isHighTech = ['BMW', 'Mercedes-Benz', 'Audi', 'Porsche', 'Tesla'].includes(make);

  return [
    {
      id: `rc-fallback-1-${vin.slice(-4)}`,
      campaignId: `RC-${make.slice(0, 3).toUpperCase()}-2023-01`,
      bulletinCode: `AZ-STD-${make.slice(0, 3).toUpperCase()}-${year}-01`,
      category: isHighTech ? 'software' : 'airbag',
      severity: isOlder ? 'high' : 'medium',
      titleAz: `${make} ${model} Zavod Təhlükəsizlik və Diaqnostika Kampaniyası`,
      titleEn: `${make} ${model} Factory Safety and Calibration Campaign`,
      titleRu: `Заводская кампания по безопасности и диагностике для ${make} ${model}`,
      descriptionAz: `İstehsalçı tərəfindən ${make} ${model} modelləri üçün təyin edilmiş planlı diler diaqnostikası və təhlükəsizlik yoxlanışı.`,
      descriptionEn: `Manufacturer-designated routine safety inspection and diagnostics campaign for ${make} ${model}.`,
      descriptionRu: `Плановая кампания завода-изготовителя по проверке систем безопасности ${make} ${model}.`,
      consequenceAz: 'Optimal idarəetmə və yol hərəkəti təhlükəsizliyinin qorunması.',
      consequenceEn: 'Preserves optimal vehicle drivability and certified passenger safety.',
      consequenceRu: 'Обеспечение оптимальной управляемости и безопасности движения.',
      remedyAz: 'Rəsmi akkreditə olunmuş servis mərkəzində pulsuz sistem yoxlanışı və diler rəyi.',
      remedyEn: 'Free system diagnostic inspection and certified clearance at authorized service center.',
      remedyRu: 'Бесплатная диагностика систем и заключение в официальном сервисном центре.',
      announcementDate: '2023-06-15',
      estimatedLaborHours: 1.0,
      partsRequired: ['Manufacturer Diagnostic Scan', 'Certified Inspection Checklist'],
      isFreeDealerService: true,
      status: 'open_action_required',
    },
  ];
};

import {
  TuningModificationItem,
  AccreditedLabCenter,
  ConstructiveSafetyCertificate
} from '../types/tuning';

export const TUNING_MODIFICATIONS: TuningModificationItem[] = [
  {
    id: 'lpg_propan_system',
    category: 'autogas',
    name: {
      az: 'LPG (Propan-Butan) Avtoqaz Sistemi (Avro-4 İtaliya)',
      en: 'LPG (Propane-Butane) Autogas System (Euro-4 Italian)',
      ru: 'ГБО LPG (Пропан-Бутан) Евро-4 (Италия)'
    },
    description: {
      az: 'Toroidal ehtiyat təkər yerinə quraşdırılan sertifikatlı BRC/Lovato qazbalon avadanlığı. Form 2A/2B sınaq aktı və Texpasportda "Qaz" qeydi tələb olunur.',
      en: 'Certified BRC/Lovato toroidal autogas system. Requires Form 2A/2B pressure test certificate and BDYP Texpasport fuel endorsement.',
      ru: 'Сертифицированное ГБО BRC/Lovato с тороидальным баллоном. Требует сертификат формы 2А/2Б и отметку в техпаспорте.'
    },
    legalStatus: 'requires_texpasport_endorsement',
    statutoryCitation: 'İXM Maddə 342.2-1 / AZS 636-2012',
    texpasportNoteAz: 'Qazbalon avadanlığı (LPG) quraşdırılıb',
    labCertificationFeeAzn: 90,
    installationEstimateAzn: 1150,
    fineRiskAzn: 150,
    impoundmentRisk: true
  },
  {
    id: 'cng_metan_system',
    category: 'autogas',
    name: {
      az: 'CNG (Sıxılmış Təbii Qaz - Metan) Yüksək Təzyiqli Balon',
      en: 'CNG (Compressed Natural Gas - Methane) High-Pressure System',
      ru: 'ГБО CNG (Метан) Высокого Давления'
    },
    description: {
      az: '200 bar təzyiqli kompozit metan balonu. SOCAR CNG məntəqələrində 0.45 ₼/m³ tariflə maksimum qənaət və AZS laboratoriya sertifikatı.',
      en: '200-bar composite methane cylinder. Maximum fuel economy at 0.45 AZN/m³ with mandatory AZS pressure test certification.',
      ru: 'Композитный метановый баллон 200 бар. Максимальная экономия (0.45 AZN/м³) с обязательной сертификацией AZS.'
    },
    legalStatus: 'requires_texpasport_endorsement',
    statutoryCitation: 'İXM Maddə 342.2-1 / AZS ISO 11439',
    texpasportNoteAz: 'CNG Metan qaz avadanlığı quraşdırılıb',
    labCertificationFeeAzn: 110,
    installationEstimateAzn: 1450,
    fineRiskAzn: 150,
    impoundmentRisk: true
  },
  {
    id: 'oem_body_kit_restyling',
    category: 'body_kit',
    name: {
      az: 'M-Tech / AMG / F-Sport və ya Restaylinq Kuzov Paketi (Body-Kit)',
      en: 'M-Tech / AMG / F-Sport or Facelift Body-Kit Conversion',
      ru: 'Обвес M-Tech / AMG / F-Sport или Рестайлинг Кузова'
    },
    description: {
      az: 'Avtomobilin zavod bufer, radiator barmaqlığı və qanadlarının M5, E63 AMG və ya yeni il restaylinq paketinə yığılması. Texpasportda "Xüsusi qeydlər" tələb edir.',
      en: 'Conversion of bumpers, grille, and fenders to M5, E63 AMG, or newer facelift look. Requires BDYP Texpasport special note.',
      ru: 'Переоборудование бамперов и оптики под пакет M5, E63 AMG или рестайлинг. Требует отметку в особых отметках техпаспорта.'
    },
    legalStatus: 'requires_texpasport_endorsement',
    statutoryCitation: 'İXM Maddə 342.2-1 / YHQ Maddə 30',
    texpasportNoteAz: 'Sport / Restaylinq (M / AMG) paketə yığılıb',
    labCertificationFeeAzn: 120,
    installationEstimateAzn: 2200,
    fineRiskAzn: 150,
    impoundmentRisk: true
  },
  {
    id: 'offroad_steel_bumper_winch',
    category: 'offroad_expedition',
    name: {
      az: 'Off-Road Gücləndirilmiş Dəmir Bufer (ARB) & Elektrikli Lebedka',
      en: 'Off-Road Heavy-Duty Steel Bumper (ARB) & Electric Winch',
      ru: 'Силовой Бампер Off-Road (ARB) и Электрическая Лебедка'
    },
    description: {
      az: 'Yolsuzluq ekspedisiyaları üçün zərbəyədavamlı polad bufer və dartıcı bucurqad (lebedka). Piyada təhlükəsizliyi ekspertizası və qeydiyyat tələb olunur.',
      en: 'Heavy-duty steel off-road bumper and recovery winch. Requires technical safety inspection and Texpasport endorsement.',
      ru: 'Силовой стальной бампер и лебедка для бездорожья. Требует экспертизы безопасности и регистрации в БДП.'
    },
    legalStatus: 'requires_texpasport_endorsement',
    statutoryCitation: 'İXM Maddə 342.2-1 / YHQ Əlavə 1',
    texpasportNoteAz: 'Gücləndirilmiş off-road bufer və lebedka quraşdırılıb',
    labCertificationFeeAzn: 140,
    installationEstimateAzn: 1600,
    fineRiskAzn: 150,
    impoundmentRisk: true
  },
  {
    id: 'offroad_snorkel_roofrack',
    category: 'offroad_expedition',
    name: {
      az: 'Ekspedisiya Dam Baqajı, Hava Şnorkeli & Örtüklü LED Projektor',
      en: 'Expedition Roof Rack, Air Intake Snorkel & Covered LED Bar',
      ru: 'Экспедиционный Багажник, Шноркель и Крытая LED-Балка'
    },
    description: {
      az: 'Su maneələrini keçmək üçün şnorkel və metal ekspedisiya səbəti. Əlavə projektorlar ümumi yollarda qapaqla örtülməlidir.',
      en: 'Wading snorkel and expedition roof rack. Auxiliary roof LED bars must remain covered on public roads.',
      ru: 'Шноркель и экспедиционный багажник. Дополнительные прожекторы на дорогах общего пользования должны быть закрыты чехлом.'
    },
    legalStatus: 'requires_texpasport_endorsement',
    statutoryCitation: 'İXM Maddə 342.2-1',
    texpasportNoteAz: 'Ekspedisiya dam baqajı və şnorkel quraşdırılıb',
    labCertificationFeeAzn: 80,
    installationEstimateAzn: 850,
    fineRiskAzn: 150,
    impoundmentRisk: true
  },
  {
    id: 'certified_lift_kit_50mm',
    category: 'suspension_wheels',
    name: {
      az: 'Sertifikatlı Off-Road Asqı Lift-Kit (+40mm / +50mm Hündürlük)',
      en: 'Certified Off-Road Suspension Lift Kit (+40mm / +50mm)',
      ru: 'Сертифицированный Лифт Подвески (+40мм / +50мм)'
    },
    description: {
      az: 'Old Man Emu / Bilstein zavod sertifikatlı amortizator və yay dəsti ilə klirensin artırılması. Ağırlıq mərkəzi sınağı ilə rəsmiləşdirilir.',
      en: 'Old Man Emu / Bilstein certified coil and shock lift kit. Legalized via center-of-gravity stability testing.',
      ru: 'Сертифицированный комплект амортизаторов и пружин Old Man Emu / Bilstein с испытанием устойчивости.'
    },
    legalStatus: 'requires_texpasport_endorsement',
    statutoryCitation: 'İXM Maddə 342.2-1 / AZS Standartı',
    texpasportNoteAz: 'Gücləndirilmiş asqı sistemi (+50mm lift) quraşdırılıb',
    labCertificationFeeAzn: 110,
    installationEstimateAzn: 1200,
    fineRiskAzn: 150,
    impoundmentRisk: true
  },
  {
    id: 'oem_alloy_wheels_upgrade',
    category: 'suspension_wheels',
    name: {
      az: 'Zavod Ölçülü Yüngüllehimli Disklər & Baqaj Lip-Spoyleri',
      en: 'Factory-Spec Alloy Wheels & Trunk Lip Spoiler',
      ru: 'Литые Диски Заводского Допуска и Лип-Спойлер'
    },
    description: {
      az: 'İstehsalçının qapı stikerində icazə verdiyi R17–R21 zavod ölçüləri daxilində disklər və elastik baqaj lip-spoyleri. Əlavə icazə tələb olunmur.',
      en: 'Alloy wheels within manufacturer door-jamb tire specification and soft trunk lip spoiler. Exempt from extra registration.',
      ru: 'Диски в пределах заводских допусков производителя и мягкий лип-спойлер крышки багажника. Регистрация не требуется.'
    },
    legalStatus: 'factory_exempt',
    statutoryCitation: 'YHQ Əlavə 1 (Zavod Normativi)',
    texpasportNoteAz: 'Zavod icazə həddindədir (Qeydiyyat tələb olunmur)',
    labCertificationFeeAzn: 0,
    installationEstimateAzn: 950,
    fineRiskAzn: 0,
    impoundmentRisk: false
  },
  {
    id: 'certified_sport_muffler',
    category: 'exhaust_engine',
    name: {
      az: 'AZS Sertifikatlı İdman Səsboğucu Qazan (Akustik < 82 dBA)',
      en: 'AZS Certified Sport Rear Muffler (Acoustic < 82 dBA)',
      ru: 'Сертифицированный Спортивный Глушитель (< 82 дБА)'
    },
    description: {
      az: 'Katalizator saxlanılmaqla və AZS dövlət standartı (maksimum 84 dBA) daxilində işləyən Akrapovič/Remus sertifikatlı arxa qazan.',
      en: 'Catalytic converter retained with certified Akrapovič/Remus muffler operating below the 84 dBA AZS statutory ceiling.',
      ru: 'Сертифицированный глушитель Akrapovič/Remus с сохранением катализатора и уровнем шума до 84 дБА.'
    },
    legalStatus: 'requires_texpasport_endorsement',
    statutoryCitation: 'AZS 597 / İXM Maddə 342.2-1',
    texpasportNoteAz: 'Sertifikatlı səsboğucu başlıq (AZS <84 dBA)',
    labCertificationFeeAzn: 95,
    installationEstimateAzn: 650,
    fineRiskAzn: 150,
    impoundmentRisk: false
  },
  {
    id: 'cut_springs_baku_style',
    category: 'suspension_wheels',
    name: {
      az: 'Yayların Kəsilməsi / Qızdırılması və ya "Peredok" Qaldırılması',
      en: 'Cut / Heated Coil Springs or Uncertified Front-End Lift ("Peredok")',
      ru: 'Подрезка / Нагрев Пружин или Незаконный Подъем Передка'
    },
    description: {
      az: 'Asqı yaylarının kəsilməsi, qızdırılması və ya ön hissənin süni qaldırılması tormozlama və sükan idarəetməsini pozduğu üçün qəti qadağandır.',
      en: 'Cutting or heating suspension springs or altering front/rear rake angle is strictly prohibited and triggers immediate impoundment.',
      ru: 'Подрезка или нагрев пружин, а также изменение геометрии подвески строго запрещены и влекут штрафстоянку.'
    },
    legalStatus: 'prohibited_impound',
    statutoryCitation: 'İXM Maddə 342.3 & 342.2-1 (Avtoxuliqanlıq / Konstruksiya)',
    texpasportNoteAz: 'QADAĞANDIR: Asqı həndəsəsinin təhlükəli dəyişdirilməsi',
    labCertificationFeeAzn: 0,
    installationEstimateAzn: 150,
    fineRiskAzn: 500,
    impoundmentRisk: true
  },
  {
    id: 'straight_pipe_popcorn_exhaust',
    category: 'exhaust_engine',
    name: {
      az: 'Katalizatorun Ləğvi, "Xor-Xor" Klapan və "Popcorn" Səs (>95 dBA)',
      en: 'Straight-Pipe Exhaust, Valvetronic Cutout & "Popcorn" Tune (>95 dBA)',
      ru: 'Прямоток, Удаление Катализатора, Клапан «Хор-Хор» и Попкорн (>95 дБА)'
    },
    description: {
      az: 'Ətraf mühitə atılan zərərli qazların və akustik səs normativinin (84 dBA) kobud pozulması. İXM Maddə 342.3 ilə 500–800 ₼ cərimə və cərimə meydançası!',
      en: 'Exceeding statutory acoustic limits (84 dBA) or removing catalytic converters carries a 500–800 AZN fine under Art. 342.3 and vehicle impoundment.',
      ru: 'Превышение нормы шума (84 дБА) и прямоточный выхлоп караются штрафом 500–800 AZN по ст. 342.3 КоАП и эвакуацией на штрафстоянку.'
    },
    legalStatus: 'prohibited_impound',
    statutoryCitation: 'İXM Maddə 342.3 (500 - 800 AZN Cərimə)',
    texpasportNoteAz: 'QADAĞANDIR: Akustik desibel və ekoloji normativin pozulması',
    labCertificationFeeAzn: 0,
    installationEstimateAzn: 400,
    fineRiskAzn: 800,
    impoundmentRisk: true
  },
  {
    id: 'uncertified_led_xenon',
    category: 'lighting_optics',
    name: {
      az: 'Sadə Reflektor Faralarda Lupasız Ksenon / LED və Sayrışan İşıqlar',
      en: 'Non-Projector Halogen Housing Xenon / LED & Strobe Lights',
      ru: 'Нелинзованный Ксенон / LED в Галогеновых Фарах и Стробоскопы'
    },
    description: {
      az: 'Avtokorrektoru və linzası olmayan faralara güclü LED/Ksenon quraşdırılması qarşıdan gələn sürücüləri kor edir və İXM 342.2-1 ilə qadağandır.',
      en: 'Installing high-lumen Xenon/LED bulbs in non-projector halogen reflectors dazzles oncoming traffic and is prohibited under Art. 342.2-1.',
      ru: 'Установка ксенона или LED в рефлекторные фары без линз ослепляет встречных водителей и запрещена ст. 342.2-1.'
    },
    legalStatus: 'prohibited_impound',
    statutoryCitation: 'İXM Maddə 342.2-1 / YHQ Əlavə 1 Bənd 3',
    texpasportNoteAz: 'QADAĞANDIR: Xarici işıq cihazlarının rejiminin pozulması',
    labCertificationFeeAzn: 0,
    installationEstimateAzn: 120,
    fineRiskAzn: 150,
    impoundmentRisk: true
  },
  {
    id: 'wheel_spacers_extreme',
    category: 'suspension_wheels',
    name: {
      az: 'Təkər Çıxıntısı ("Şayba / Spacer" >25mm Kuzovdan Kənara)',
      en: 'Extreme Wheel Spacers (>25mm Protrusion Beyond Fender Arch)',
      ru: 'Проставки Колес («Шайбы» >25мм с Вылетом за Арки Кузова)'
    },
    description: {
      az: 'Təkər izinin (koleyanın) zavod normativindən kənara çıxarılması stupitsa yastıqlarına həddindən artıq yük verir və BDYP tərəfindən qadağan edilir.',
      en: 'Widening wheel track beyond fender arches overloads wheel bearings and steering geometry, prohibited by BDYP technical rules.',
      ru: 'Расширение колеи проставками за пределы крыла разрушает ступичные подшипники и запрещено техрегламентом БДП.'
    },
    legalStatus: 'prohibited_impound',
    statutoryCitation: 'İXM Maddə 342.2-1',
    texpasportNoteAz: 'QADAĞANDIR: Təkər oxu həndəsəsinin pozulması',
    labCertificationFeeAzn: 0,
    installationEstimateAzn: 180,
    fineRiskAzn: 150,
    impoundmentRisk: true
  }
];

export const ACCREDITED_TUNING_LABS: AccreditedLabCenter[] = [
  {
    id: 'lab-baku-zabrat',
    name: 'BDYP Mərkəzi Texniki Ekspertiza və Diaqnostika Mərkəzi (Zabrat)',
    city: 'Bakı',
    address: 'Sabunçu r., Zabrat-Maştağa şossesi 1-ci km (Baş DYP İdarəsi yanı)',
    phone: '+994 12 590 81 15',
    accreditationCode: 'AZS-BDYP-001',
    specialties: ['body_kit', 'autogas', 'offroad_expedition', 'suspension_wheels', 'exhaust_engine', 'lighting_optics'],
    workingHours: 'B.e - Şənbə: 09:00 - 18:00',
    inspectionTimeMinutes: 35,
    rating: 4.9
  },
  {
    id: 'lab-baku-babek',
    name: 'AZS-AvtoTest Qazbalon (LPG/CNG) və Konstruktiv Sınaq Laboratoriyası',
    city: 'Bakı',
    address: 'Xətai r., Babək prospekti 64 (Avtoşəhər korpusu B)',
    phone: '+994 50 245 11 90',
    accreditationCode: 'AZAK-TL-0142',
    specialties: ['autogas', 'exhaust_engine', 'body_kit'],
    workingHours: 'B.e - Şənbə: 09:00 - 19:00',
    inspectionTimeMinutes: 25,
    rating: 4.8
  },
  {
    id: 'lab-absheron-khirdalan',
    name: 'Abşeron Avto-Ekspertiza & Off-Road Tüninq Sertifikatlaşdırma Mərkəzi',
    city: 'Xırdalan',
    address: 'Bakı-Quba şossesi 9-cu km, Xırdalan dairəsi yaxınlığı',
    phone: '+994 55 410 77 33',
    accreditationCode: 'AZAK-TL-0189',
    specialties: ['offroad_expedition', 'suspension_wheels', 'body_kit', 'lighting_optics'],
    workingHours: 'B.e - Cümə: 09:00 - 18:00, Şənbə: 10:00 - 16:00',
    inspectionTimeMinutes: 30,
    rating: 4.7
  },
  {
    id: 'lab-baku-badamdar',
    name: 'Badamdar Avtomobil Standartları və Akustik Sınaq Laboratoriyası',
    city: 'Bakı',
    address: 'Səbail r., Badamdar şossesi 27 (Avtomobil Satış Mərkəzi ərazisi)',
    phone: '+994 12 437 90 42',
    accreditationCode: 'AZAK-TL-0204',
    specialties: ['body_kit', 'exhaust_engine', 'lighting_optics', 'suspension_wheels'],
    workingHours: 'B.e - Şənbə: 09:30 - 18:00',
    inspectionTimeMinutes: 20,
    rating: 4.8
  },
  {
    id: 'lab-sumgayit-reg',
    name: 'Sumqayıt Regional BDYP Texniki Sınaq və Qazbalon Mərkəzi',
    city: 'Sumqayıt',
    address: 'Sumqayıt ş., Sülh küçəsi 112 (Qeydiyyat-İmtahan Şöbəsi yanı)',
    phone: '+994 18 655 21 09',
    accreditationCode: 'AZS-BDYP-004',
    specialties: ['autogas', 'body_kit', 'suspension_wheels'],
    workingHours: 'B.e - Şənbə: 09:00 - 18:00',
    inspectionTimeMinutes: 30,
    rating: 4.6
  },
  {
    id: 'lab-ganja-reg',
    name: 'Gəncə Qərb Regional Konstruktiv Dəyişiklik və Avtoqaz Laboratoriyası',
    city: 'Gəncə',
    address: 'Gəncə ş., Nizami Gəncəvi pr. 240 (Yevlax şossesi çıxışı)',
    phone: '+994 22 256 44 18',
    accreditationCode: 'AZS-BDYP-007',
    specialties: ['autogas', 'offroad_expedition', 'body_kit'],
    workingHours: 'B.e - Şənbə: 09:00 - 17:30',
    inspectionTimeMinutes: 30,
    rating: 4.7
  }
];

export const SAMPLE_TUNING_CERTIFICATES: ConstructiveSafetyCertificate[] = [
  {
    certificateNumber: 'BDYP-KD-2026-48102',
    azsLabProtocolNumber: 'AZS-LAB-2026-1094',
    issueDate: '2026-02-14',
    validUntil: 'Müddətsiz (Texpasport Xüsusi Qeyd)',
    ownerName: 'Fərid Məmmədov Əli oğlu',
    ownerFin: '5A9K2L1',
    vehicleTitle: 'BMW 530i (G30)',
    vin: 'WBAJA5C50JG892104',
    plateNumber: '10-MM-530',
    accreditedLabName: 'BDYP Mərkəzi Texniki Ekspertiza və Diaqnostika Mərkəzi (Zabrat)',
    approvedModifications: [
      'M-Tech / AMG / F-Sport və ya Restaylinq Kuzov Paketi (Body-Kit)',
      'AZS Sertifikatlı İdman Səsboğucu Qazan (Akustik < 82 dBA)'
    ],
    texpasportSpecialNotes: 'Xüsusi qeydlər: M5 paketə yığılıb; Sertifikatlı səsboğucu başlıq (AZS <84 dBA)',
    measuredDecibelDba: 79,
    suspensionDeltaMm: 0,
    totalStateFeePaidAzn: 267,
    qrVerificationHash: 'AZS-BDYP-48102-G30M5-VERIFIED'
  },
  {
    certificateNumber: 'BDYP-KD-2026-73915',
    azsLabProtocolNumber: 'AZS-LAB-2026-2381',
    issueDate: '2026-03-05',
    validUntil: 'Müddətsiz (Texpasport Xüsusi Qeyd)',
    ownerName: 'Rəşad Həsənov İlham oğlu',
    ownerFin: '3X8P4M9',
    vehicleTitle: 'Toyota Land Cruiser 250 Prado',
    vin: 'JTEBR3FJ50K112940',
    plateNumber: '90-OR-250',
    accreditedLabName: 'Abşeron Avto-Ekspertiza & Off-Road Tüninq Sertifikatlaşdırma Mərkəzi',
    approvedModifications: [
      'Off-Road Gücləndirilmiş Dəmir Bufer (ARB) & Elektrikli Lebedka',
      'Ekspedisiya Dam Baqajı, Hava Şnorkeli & Örtüklü LED Projektor',
      'Sertifikatlı Off-Road Asqı Lift-Kit (+40mm / +50mm Hündürlük)'
    ],
    texpasportSpecialNotes: 'Xüsusi qeydlər: Gücləndirilmiş off-road bufer, lebedka, şnorkel və +50mm lift quraşdırılıb',
    measuredDecibelDba: 75,
    suspensionDeltaMm: 50,
    totalStateFeePaidAzn: 382,
    qrVerificationHash: 'AZS-BDYP-73915-LC250-VERIFIED'
  },
  {
    certificateNumber: 'BDYP-KD-2026-91204',
    azsLabProtocolNumber: 'AZS-LAB-2026-3410',
    issueDate: '2026-04-01',
    validUntil: '2028-04-01 (2 İllik Balon Sınağı)',
    ownerName: 'Elvin Quliyev Tofiq oğlu',
    ownerFin: '7N2V9Q4',
    vehicleTitle: 'Toyota Camry Hybrid',
    vin: '4T1B21HK5KU094312',
    plateNumber: '77-EK-095',
    accreditedLabName: 'AZS-AvtoTest Qazbalon (LPG/CNG) və Konstruktiv Sınaq Laboratoriyası',
    approvedModifications: [
      'LPG (Propan-Butan) Avtoqaz Sistemi (Avro-4 İtaliya)'
    ],
    texpasportSpecialNotes: 'Xüsusi qeydlər: Qazbalon avadanlığı (LPG) quraşdırılıb (Yanacaq: Benzin/Qaz)',
    measuredDecibelDba: 71,
    suspensionDeltaMm: 0,
    totalStateFeePaidAzn: 142,
    qrVerificationHash: 'AZS-BDYP-91204-CAMRYLPG-VERIFIED'
  }
];

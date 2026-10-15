import { AynaTrainingCenter, AynaTaxiPass } from '../types/taxi';

export const MOCK_AYNA_CENTERS: AynaTrainingCenter[] = [
  {
    id: 'ayna-heydar-aliyev',
    name: {
      az: 'AYNA Baş İmtahan və Təlim Mərkəzi',
      en: 'AYNA Central Examination & Driver Training Center',
      ru: 'Главный экзаменационный и учебный центр AYNA'
    },
    city: 'Bakı',
    district: 'Nərimanov',
    address: 'Heydər Əliyev prospekti 105, Bakı',
    phone: '(012) 566-01-41 / Qaynar Xətt: 141',
    workingHours: '09:00 - 18:00 (B.e - Şənbə)',
    queueStatus: 'moderate',
    availableSlots: ['09:30', '11:00', '14:30', '16:00', '17:15'],
    services: [
      {
        az: 'Taksi Sürücüləri üçün Xüsusi Hazırlıq Təlimi və İmtahanı',
        en: 'Special Training Course and Examination for Taxi Drivers',
        ru: 'Специальный курс подготовки и экзамен для водителей такси'
      },
      {
        az: '7 İllik Daşıyıcı Buraxılış Kartının Tərtibatı (Hüquqi və Fiziki Şəxslər)',
        en: 'Issuance of 7-Year Carrier Operator Permit (Entities & Individuals)',
        ru: 'Оформление 7-летней карты допуска перевозчика (Юр. и физ. лица)'
      },
      {
        az: 'Nəqliyyat Vasitəsinin Texniki Standartlara Uyğunluq Müayinəsi',
        en: 'Vehicle Technical Standards Compliance Inspection',
        ru: 'Технический осмотр автомобиля на соответствие стандартам такси'
      }
    ]
  },
  {
    id: 'ayna-darnagul',
    name: {
      az: 'Dərnəgül Texniki Təftiş və Sertifikasiya Terminalı',
      en: 'Darnagul Technical Inspection & Certification Terminal',
      ru: 'Терминал техосмотра и сертификации Дарнагюль'
    },
    city: 'Bakı',
    district: 'Binaqədi',
    address: 'Ziya Bünyadov prospekti, 1965-ci məhəllə',
    phone: '(012) 567-88-22',
    workingHours: '08:30 - 19:00 (B.e - Cümə)',
    queueStatus: 'low',
    availableSlots: ['09:00', '10:15', '12:00', '15:00', '16:45'],
    services: [
      {
        az: 'Videoqeydiyyatçı və POS Terminalın Rəsmi Plomblanması',
        en: 'Official Sealing of Dashcam and POS Terminals',
        ru: 'Официальная пломбировка видеорегистратора и POS-терминала'
      },
      {
        az: 'Avtomobilin Yaş və Rəng Standartı Sertifikatı',
        en: 'Vehicle Age & Color Regulatory Compliance Certificate',
        ru: 'Сертификат соответствия цвета и возраста транспортного средства'
      }
    ]
  },
  {
    id: 'ayna-badamdar',
    name: {
      az: 'Badamdar AYNA Nəqliyyat Xidmət Mərkəzi',
      en: 'Badamdar AYNA Transport Service Center',
      ru: 'Транспортный сервисный центр AYNA Бадамдар'
    },
    city: 'Bakı',
    district: 'Səbail',
    address: 'Mikayıl Müşfiq küçəsi 12/B (Badamdar qəs.)',
    phone: '(012) 505-14-14',
    workingHours: '09:00 - 18:00 (B.e - Cümə)',
    queueStatus: 'low',
    availableSlots: ['10:00', '11:30', '14:00', '15:30'],
    services: [
      {
        az: 'Elektron Buraxılış Vərəqəsinin QR Kod Təsdiqi',
        en: 'Electronic Taxi Pass QR Verification & Activation',
        ru: 'Активация и верификация QR-кода электронного пропуска'
      },
      {
        az: 'Aqreqator Platforma İnteqrasiya Arayışı (Bolt, Yango, Uber)',
        en: 'Aggregator Platform Fleet Telemetry Integration Check',
        ru: 'Интеграция телеметрии для платформ агрегаторов'
      }
    ]
  },
  {
    id: 'ayna-khatai',
    name: {
      az: 'Xətai Sənədləşmə və Rəqəmsal Nəqliyyat Şöbəsi',
      en: 'Khatai Documentation & Digital Transport Bureau',
      ru: 'Хатаинский отдел документации и цифрового транспорта'
    },
    city: 'Bakı',
    district: 'Xətai',
    address: '8 Noyabr prospekti 64, Bakı',
    phone: '(012) 490-22-10',
    workingHours: '09:00 - 18:00 (B.e - Şənbə)',
    queueStatus: 'moderate',
    availableSlots: ['09:15', '11:45', '13:30', '16:15'],
    services: [
      {
        az: 'Fərdi Taksi Daşıyıcısı Qeydiyyatı (VÖEN və Bank Hesabı)',
        en: 'Sole Proprietor Taxi Registration (Tax ID & Bank Setup)',
        ru: 'Регистрация индивидуального предпринимателя в такси'
      },
      {
        az: 'Taksi Fənəri və Şahmat Damalarının Dövlət Qeydiyyatı',
        en: 'Official Registration of Taxi Roof Lamps & Checker Decals',
        ru: 'Регистрация плафонов TAXI и боковых шашечных полос'
      }
    ]
  },
  {
    id: 'ayna-sumgayit',
    name: {
      az: 'Sumqayıt Regional İmtahan və Nəqliyyat İdarəsi',
      en: 'Sumgayit Regional Examination & Transport Directorate',
      ru: 'Сумгаитское региональное транспортно-экзаменационное управление'
    },
    city: 'Sumqayıt',
    district: 'Mərkəz',
    address: 'Sülh küçəsi 34-cü məhəllə, Sumqayıt',
    phone: '(018) 655-14-11',
    workingHours: '09:00 - 18:00 (B.e - Cümə)',
    queueStatus: 'low',
    availableSlots: ['10:30', '12:00', '14:30', '16:00'],
    services: [
      {
        az: 'Sumqayıt-Bakı Şəhərlərarası Taksi İcazəsi və Təlimlər',
        en: 'Sumgayit-Baku Intercity Taxi Clearance & Training',
        ru: 'Межгородские разрешения и тренинги Сумгаит-Баку'
      }
    ]
  },
  {
    id: 'ayna-ganja',
    name: {
      az: 'Gəncə Regional Nəqliyyat Xidməti Departamenti',
      en: 'Ganja Regional Transport Service Department',
      ru: 'Гянджинский региональный департамент транспортных услуг'
    },
    city: 'Gəncə',
    district: 'Kəpəz',
    address: 'Şah İsmayıl Xətai prospekti 118, Gəncə',
    phone: '(022) 256-14-10',
    workingHours: '09:00 - 18:00 (B.e - Cümə)',
    queueStatus: 'low',
    availableSlots: ['09:45', '11:15', '14:00', '15:45'],
    services: [
      {
        az: 'Qərb Regionu Taksi Parkının Sertifikasiyası və Təlim Kursları',
        en: 'Western Region Taxi Fleet Certification & Training Hub',
        ru: 'Сертификация таксопарков и учебный центр Западного региона'
      }
    ]
  }
];

export const MOCK_TAXI_PASSES: AynaTaxiPass[] = [
  {
    passNumber: 'AYNA-TX-2026-77821',
    carrierType: 'individual',
    carrierName: 'Rəşad Vəliyev (F/Ş)',
    carrierVoen: '1504938291',
    driverName: 'Rəşad Vəliyev',
    driverFin: '7ABC109',
    driverLicense: 'AZ99023411',
    plateNumber: '99-TX-841',
    vin: 'JTDKN3DU5A1829304',
    vehicleMake: 'Toyota',
    vehicleModel: 'Prius',
    vehicleYear: 2021,
    vehicleColor: 'Ağ (White)',
    fuelType: 'hybrid',
    issueDate: '2026-02-10',
    expiryDate: '2027-02-10',
    validityYears: 1,
    stateDutyAzn: 25,
    securityChecksum: '0x4A81BC2F',
    qrVerificationUrl: 'https://ayna.gov.az/e-xidmetler/taksi-yoxla?pass=AYNA-TX-2026-77821&plate=99-TX-841',
    status: 'active'
  },
  {
    passNumber: 'AYNA-TX-2026-34190',
    carrierType: 'legal_entity',
    carrierName: 'Bakı Eko-Taksi MMC',
    carrierVoen: '2001492011',
    driverName: 'Elmir Qasımov',
    driverFin: '6KLM908',
    driverLicense: 'AZ99144890',
    plateNumber: '77-EV-204',
    vin: 'LC0CE4EC1P0019283',
    vehicleMake: 'BYD',
    vehicleModel: 'Song Plus EV',
    vehicleYear: 2023,
    vehicleColor: 'Ağ (White)',
    fuelType: 'ev',
    issueDate: '2026-01-15',
    expiryDate: '2029-01-15',
    validityYears: 3,
    stateDutyAzn: 65,
    securityChecksum: '0x992FE1A4',
    qrVerificationUrl: 'https://ayna.gov.az/e-xidmetler/taksi-yoxla?pass=AYNA-TX-2026-34190&plate=77-EV-204',
    status: 'active'
  }
];

export const MOCK_PRESET_VEHICLES = [
  {
    id: 'toyota-prius-2021-white',
    name: 'Toyota Prius Hybrid 2021 (Ağ)',
    year: 2021,
    color: 'white' as const,
    fuelType: 'hybrid' as const,
    plate: '99-TX-841',
    vin: 'JTDKN3DU5A1829304'
  },
  {
    id: 'hyundai-elantra-2022-white',
    name: 'Hyundai Elantra 2022 (Ağ)',
    year: 2022,
    color: 'white' as const,
    fuelType: 'petrol' as const,
    plate: '90-EL-912',
    vin: 'KMHD84LF7NU918273'
  },
  {
    id: 'byd-song-plus-2023-white',
    name: 'BYD Song Plus EV 2023 (Ağ)',
    year: 2023,
    color: 'white' as const,
    fuelType: 'ev' as const,
    plate: '77-EV-204',
    vin: 'LC0CE4EC1P0019283'
  },
  {
    id: 'kia-k5-2020-red',
    name: 'Kia K5 2020 (Qırmızı)',
    year: 2020,
    color: 'red' as const,
    fuelType: 'lpg' as const,
    plate: '10-TX-450',
    vin: 'KNAGM4A73M5102948'
  },
  {
    id: 'mercedes-e220-2016-silver',
    name: 'Mercedes-Benz E220d 2016 (Gümüşü - Keçid Rejimi)',
    year: 2016,
    color: 'silver' as const,
    fuelType: 'diesel' as const,
    plate: '99-MB-702',
    vin: 'WDD2130041A192834'
  },
  {
    id: 'daewoo-nexia-2009-white',
    name: 'Daewoo Nexia 2009 (Ağ - Qeyri-Uyğun, 15+ İl)',
    year: 2009,
    color: 'white' as const,
    fuelType: 'petrol' as const,
    plate: '10-DX-301',
    vin: 'XWB3L11ED9A019283'
  }
];

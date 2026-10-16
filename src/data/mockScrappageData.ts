import {
  CompletenessComponentItem,
  LocalManufacturedVehicle,
  ScrappageCollectionCenter,
  ScrappageConfirmationCertificate
} from '../types/scrappage';

export const SCRAPPAGE_COMPLETENESS_COMPONENTS: CompletenessComponentItem[] = [
  {
    id: 'body_chassis',
    name: {
      az: 'Ban karkası və şassi (Rama / Kuzov)',
      en: 'Body Shell & Chassis Frame',
      ru: 'Каркас кузова и рама (шасси)'
    },
    weightSharePercent: 32,
    isCritical: true,
    deductionIfMissingAzn: 500,
    materialType: 'ferrous_steel'
  },
  {
    id: 'engine_block',
    name: {
      az: 'Mühərrik bloku və silindr başlığı (DVS)',
      en: 'Engine Block & Cylinder Head Assembly',
      ru: 'Блок двигателя и головка блока цилиндров'
    },
    weightSharePercent: 18,
    isCritical: true,
    deductionIfMissingAzn: 350,
    materialType: 'aluminum_alloy'
  },
  {
    id: 'transmission_gearbox',
    name: {
      az: 'Sürətlər qutusu (Transmissiya / KP)',
      en: 'Transmission & Gearbox Unit',
      ru: 'Коробка передач (трансмиссия)'
    },
    weightSharePercent: 10,
    isCritical: true,
    deductionIfMissingAzn: 250,
    materialType: 'aluminum_alloy'
  },
  {
    id: 'axles_suspension',
    name: {
      az: 'Ön və arxa körpülər, asqı və reduktor',
      en: 'Front & Rear Axles, Differential & Suspension',
      ru: 'Передний и задний мосты, редуктор и подвеска'
    },
    weightSharePercent: 12,
    isCritical: false,
    deductionIfMissingAzn: 120,
    materialType: 'ferrous_steel'
  },
  {
    id: 'steering_column',
    name: {
      az: 'Sükan idarəetmə mexanizmi və kalonka',
      en: 'Steering Column & Rack Assembly',
      ru: 'Рулевой механизм и рулевая колонка'
    },
    weightSharePercent: 4,
    isCritical: false,
    deductionIfMissingAzn: 60,
    materialType: 'ferrous_steel'
  },
  {
    id: 'wheels_tires',
    name: {
      az: 'Təkər diskləri və şinlər (4 ədəd komplekt)',
      en: 'Wheels & Tires Set (4 Units)',
      ru: 'Колесные диски и шины (комплект 4 шт.)'
    },
    weightSharePercent: 6,
    isCritical: false,
    deductionIfMissingAzn: 80,
    materialType: 'aluminum_alloy'
  },
  {
    id: 'battery_electronics',
    name: {
      az: 'Akkumulyator (AKB), generator və elektrik naqilləri',
      en: 'Starter Battery, Alternator & Copper Wiring Harness',
      ru: 'Аккумулятор (АКБ), генератор и электропроводка'
    },
    weightSharePercent: 4,
    isCritical: false,
    deductionIfMissingAzn: 70,
    materialType: 'copper_electronics'
  },
  {
    id: 'catalytic_exhaust',
    name: {
      az: 'Qazburaxma sistemi və katalitik neytralizator',
      en: 'Exhaust System & Catalytic Converter',
      ru: 'Выхлопная система и каталитический нейтрализатор'
    },
    weightSharePercent: 4,
    isCritical: false,
    deductionIfMissingAzn: 90,
    materialType: 'precious_catalytic'
  },
  {
    id: 'seats_dashboard',
    name: {
      az: 'Oturacaqlar və ön cihazlar paneli (Torpedo)',
      en: 'Interior Seats & Instrument Dashboard',
      ru: 'Сиденья салона и приборная панель (торпедо)'
    },
    weightSharePercent: 5,
    isCritical: false,
    deductionIfMissingAzn: 50,
    materialType: 'polymers_glass'
  },
  {
    id: 'doors_glazing',
    name: {
      az: 'Qapılar, kapot, yük qapağı və şüşələr',
      en: 'Doors, Hood, Trunk Lid & Glazing',
      ru: 'Двери, капот, крышка багажника и остекление'
    },
    weightSharePercent: 5,
    isCritical: false,
    deductionIfMissingAzn: 80,
    materialType: 'ferrous_steel'
  }
];

export const LOCAL_MANUFACTURED_VEHICLES: LocalManufacturedVehicle[] = [
  {
    id: 'local-byd-destroyer-05',
    make: 'BYD',
    model: 'Destroyer 05 DM-i Plug-in Hybrid',
    assemblyPlant: {
      az: 'Sumqayıt Kimya Sənaye Parkı (BYD Azerbaijan)',
      en: 'Sumgayit Chemical Industrial Park (BYD Azerbaijan)',
      ru: 'Сумгаитский Химический Промышленный Парк (BYD Azerbaijan)'
    },
    retailPriceAzn: 31900,
    factoryExtraBonusAzn: 1000,
    engineSpec: '1.5L EHS Plug-in Hybrid (197 HP)',
    fuelType: 'hybrid',
    warrantyYears: 6,
    category: 'passenger_m1'
  },
  {
    id: 'local-chevrolet-cobalt',
    make: 'Chevrolet',
    model: 'Cobalt LTZ 1.5 AT',
    assemblyPlant: {
      az: 'Hacıqabul Sənaye Məhəlləsi (Azərmaş Zavodu)',
      en: 'Hajigabul Industrial District (Azermash Plant)',
      ru: 'Гаджигабульский Промышленный Квартал (Завод Азермаш)'
    },
    retailPriceAzn: 23500,
    factoryExtraBonusAzn: 800,
    engineSpec: '1.5L DOHC (106 HP) 6-AT',
    fuelType: 'petrol',
    warrantyYears: 3,
    category: 'passenger_m1'
  },
  {
    id: 'local-chevrolet-onix',
    make: 'Chevrolet',
    model: 'Onix Premier 1.2 Turbo',
    assemblyPlant: {
      az: 'Hacıqabul Sənaye Məhəlləsi (Azərmaş Zavodu)',
      en: 'Hajigabul Industrial District (Azermash Plant)',
      ru: 'Гаджигабульский Промышленный Квартал (Завод Азермаш)'
    },
    retailPriceAzn: 26900,
    factoryExtraBonusAzn: 900,
    engineSpec: '1.2L Turbo (132 HP) 6-AT',
    fuelType: 'petrol',
    warrantyYears: 3,
    category: 'passenger_m1'
  },
  {
    id: 'local-khazar-sd',
    make: 'Khazar',
    model: 'SD 1.7 Comfort Sedan',
    assemblyPlant: {
      az: 'Neftçala Sənaye Məhəlləsi (AzKron Zavodu)',
      en: 'Neftchala Industrial District (AzKron Plant)',
      ru: 'Нефтчалинский Промышленный Квартал (Завод АзКрон)'
    },
    retailPriceAzn: 18500,
    factoryExtraBonusAzn: 500,
    engineSpec: '1.7L MPI (115 HP) MT',
    fuelType: 'petrol',
    warrantyYears: 3,
    category: 'passenger_m1'
  },
  {
    id: 'local-jac-js4',
    make: 'JAC',
    model: 'JS4 Flagship Turbo SUV',
    assemblyPlant: {
      az: 'Hacıqabul Sənaye Məhəlləsi (Azərmaş Xətti)',
      en: 'Hajigabul Industrial District (Azermash Line)',
      ru: 'Гаджигабульский Промышленный Квартал (Линия Азермаш)'
    },
    retailPriceAzn: 29800,
    factoryExtraBonusAzn: 850,
    engineSpec: '1.5L Turbo CVT (147 HP)',
    fuelType: 'petrol',
    warrantyYears: 5,
    category: 'passenger_m1'
  },
  {
    id: 'local-gazelle-next',
    make: 'GAZelle',
    model: 'NEXT 2.8 TD Kommersiya Фургон (N1)',
    assemblyPlant: {
      az: 'Hacıqabul Sənaye Məhəlləsi (Azərmaş Kommersiya)',
      en: 'Hajigabul Industrial District (Azermash Commercial)',
      ru: 'Гаджигабульский Промышленный Квартал (Коммерческий сектор)'
    },
    retailPriceAzn: 44500,
    factoryExtraBonusAzn: 1200,
    engineSpec: '2.8L Turbo-Diesel (150 HP)',
    fuelType: 'diesel',
    warrantyYears: 3,
    category: 'truck_n1'
  }
];

export const TEMIZ_SEHER_COLLECTION_CENTERS: ScrappageCollectionCenter[] = [
  {
    id: 'ts-center-balakhani',
    code: 'TS-BAK-01',
    name: {
      az: 'Balaxanı Sənaye Parkı Mərkəzi Utilizasiya Poliqonu',
      en: 'Balakhani Industrial Park Central Utilization Hub',
      ru: 'Центральный полигон утилизации Балаханского Промпарка'
    },
    city: 'Bakı',
    address: {
      az: 'Sabunçu r., Balaxanı qəs., Təmiz Şəhər Sənaye Parkı korpus 4',
      en: 'Sabunchu dist., Balakhani Industrial Park, Bldg 4, Baku',
      ru: 'Сабунчинский р-н, пос. Балаханы, Промпарк Темиз Шехер, корп. 4'
    },
    operator: '"Təmiz Şəhər" ASC',
    dailyCapacityVehicles: 65,
    currentQueueCount: 8,
    waitMinutes: 20,
    phone: '*1611 / (+994 12) 464 41 11',
    workingHours: 'B.e. - Şənbə: 09:00 - 18:00',
    hasFreeTowService: true,
    certifiedScaleTons: 60
  },
  {
    id: 'ts-center-qaradag',
    code: 'TS-BAK-02',
    name: {
      az: 'Qaradağ (Lökbatan) Ağır Texnika və Metallom Qəbul Mərkəzi',
      en: 'Garadagh Heavy Vehicle & Scrap Acceptance Terminal',
      ru: 'Гарадагский терминал приема тяжелой техники и металлолома'
    },
    city: 'Bakı',
    address: {
      az: 'Qaradağ r., Salyan şossesi 17-ci km, Dairəvi yol kəsişməsi',
      en: 'Garadagh dist., Salyan Highway km 17, Baku Ring Road',
      ru: 'Гарадагский р-н, Сальянское шоссе 17-й км, Кольцевая дорога'
    },
    operator: '"Təmiz Şəhər" ASC / Baku Steel Recycling',
    dailyCapacityVehicles: 50,
    currentQueueCount: 5,
    waitMinutes: 15,
    phone: '(+994 12) 447 19 80',
    workingHours: 'B.e. - Şənbə: 09:00 - 18:00',
    hasFreeTowService: true,
    certifiedScaleTons: 80
  },
  {
    id: 'ts-center-sumgayit',
    code: 'TS-SUM-03',
    name: {
      az: 'Sumqayıt Təkrar Emal və Eko-Utilizasiya Məntəqəsi',
      en: 'Sumgayit Recycling & Eco-Utilization Station',
      ru: 'Сумгаитский пункт переработки и эко-утилизации'
    },
    city: 'Sumqayıt',
    address: {
      az: 'Sumqayıt ş., Sülh küçəsi, Sənaye Zonası 12-ci məhəllə',
      en: 'Sulh str., Industrial Zone Block 12, Sumgayit',
      ru: 'г. Сумгаит, ул. Сюльх, Промышленная зона, квартал 12'
    },
    operator: '"Təmiz Şəhər" ASC Abşeron Filialı',
    dailyCapacityVehicles: 40,
    currentQueueCount: 4,
    waitMinutes: 12,
    phone: '(+994 18) 654 22 90',
    workingHours: 'B.e. - Cümə: 09:00 - 17:30',
    hasFreeTowService: true,
    certifiedScaleTons: 40
  },
  {
    id: 'ts-center-ganja',
    code: 'TS-GAN-04',
    name: {
      az: 'Gəncə Qərb Regional Авто-Utilizasiya Məntəqəsi',
      en: 'Ganja Western Regional Auto-Utilization Hub',
      ru: 'Гянджинский Западный региональный пункт авто-утилизации'
    },
    city: 'Gəncə',
    address: {
      az: 'Gəncə ş., Yevlax şossesi 4-cü km, Alüminium Zavodu yaxınlığı',
      en: 'Yevlakh Highway km 4, near Aluminum Plant, Ganja',
      ru: 'г. Гянджа, Евлахское шоссе 4-й км, вблизи Алюминиевого завода'
    },
    operator: '"Təmiz Şəhər" ASC Qərb Regional İdarəsi',
    dailyCapacityVehicles: 35,
    currentQueueCount: 3,
    waitMinutes: 10,
    phone: '(+994 22) 256 81 04',
    workingHours: 'B.e. - Cümə: 09:00 - 17:30',
    hasFreeTowService: false,
    certifiedScaleTons: 40
  },
  {
    id: 'ts-center-mingachevir',
    code: 'TS-MNG-05',
    name: {
      az: 'Mingəçevir Mərkəzi Aran Utilizasiya Terminalı',
      en: 'Mingachevir Central Aran Utilization Terminal',
      ru: 'Мингячевирский Центрально-Аранский терминал утилизации'
    },
    city: 'Mingəçevir',
    address: {
      az: 'Mingəçevir ş., Sənaye Parkı prospekti 18',
      en: 'Industrial Park Ave 18, Mingachevir',
      ru: 'г. Мингячевир, пр. Промышленного Парка 18'
    },
    operator: '"Təmiz Şəhər" ASC Mərkəzi Aran Filialı',
    dailyCapacityVehicles: 25,
    currentQueueCount: 2,
    waitMinutes: 8,
    phone: '(+994 24) 274 33 19',
    workingHours: 'B.e. - Cümə: 09:00 - 17:00',
    hasFreeTowService: false,
    certifiedScaleTons: 30
  },
  {
    id: 'ts-center-lankaran',
    code: 'TS-LNK-06',
    name: {
      az: 'Lənkəran Cənub Regional Utilizasiya Qəbul Məntəqəsi',
      en: 'Lankaran Southern Regional Utilization Point',
      ru: 'Лянкяранский Южный региональный пункт приема на утилизацию'
    },
    city: 'Lənkəran',
    address: {
      az: 'Lənkəran ş., Ələt-Astara magistralı, Liman girişi',
      en: 'Alat-Astara Highway, Liman entrance, Lankaran',
      ru: 'г. Лянкяран, трасса Алят-Астара, въезд в Лиман'
    },
    operator: '"Təmiz Şəhər" ASC Cənub Filialı',
    dailyCapacityVehicles: 25,
    currentQueueCount: 1,
    waitMinutes: 5,
    phone: '(+994 25) 255 18 42',
    workingHours: 'B.e. - Cümə: 09:00 - 17:00',
    hasFreeTowService: false,
    certifiedScaleTons: 30
  }
];

export const SAMPLE_SCRAPPAGE_CERTIFICATES: ScrappageConfirmationCertificate[] = [
  {
    certificateNumber: 'TS-UTL-2026-84920',
    bdypDeregistrationCode: 'BDYP-CX-2026-44102',
    issueDate: '2026-09-18',
    expiryDate: '2027-09-18',
    applicantFullName: 'Həsənov İlqar Vaqif oğlu',
    applicantFin: '4KL92M1',
    vehicleTitle: 'VAZ (LADA) 21074 1.6 (1998)',
    vin: 'XTA210740W1094821',
    plateNumber: '10-DX-492',
    manufactureYear: 1998,
    category: 'passenger_m1',
    centerId: 'ts-center-balakhani',
    centerName: 'Balaxanı Sənaye Parkı Mərkəzi Utilizasiya Poliqonu',
    completenessScorePercent: 100,
    payoutMode: 'local_car_voucher',
    voucherAmountAzn: 1500,
    cashPayoutAmountAzn: 1050,
    qrVerificationHash: 'AZ-TS-UTL-84920-VERIFIED-M1',
    status: 'ACTIVE_VOUCHER'
  },
  {
    certificateNumber: 'TS-UTL-2026-51304',
    bdypDeregistrationCode: 'BDYP-CX-2026-38910',
    issueDate: '2026-08-12',
    expiryDate: '2027-08-12',
    applicantFullName: 'Quliyeva Sevinc Əli qızı',
    applicantFin: '5MN83P4',
    vehicleTitle: 'Opel Vectra B 1.8 (1997)',
    vin: 'W0L0JBF19V1183920',
    plateNumber: '90-KP-814',
    manufactureYear: 1997,
    category: 'passenger_m1',
    centerId: 'ts-center-sumgayit',
    centerName: 'Sumqayıt Təkrar Emal və Eko-Utilizasiya Məntəqəsi',
    completenessScorePercent: 95,
    payoutMode: 'cash_lump_sum_70',
    voucherAmountAzn: 1450,
    cashPayoutAmountAzn: 1015,
    qrVerificationHash: 'AZ-TS-UTL-51304-CASH-PAID',
    status: 'CASH_TRANSFERRED'
  },
  {
    certificateNumber: 'TS-UTL-2026-29411',
    bdypDeregistrationCode: 'BDYP-CX-2026-19205',
    issueDate: '2026-07-04',
    expiryDate: '2027-07-04',
    applicantFullName: 'Məmmədov Rəşad Tofiq oğlu',
    applicantFin: '3AB71K9',
    vehicleTitle: 'Ford Transit 2.4 TD Yük (2001)',
    vin: 'WF0VXXBDFV1J49201',
    plateNumber: '50-CC-702',
    manufactureYear: 2001,
    category: 'truck_n1',
    centerId: 'ts-center-ganja',
    centerName: 'Gəncə Qərb Regional Avto-Utilizasiya Məntəqəsi',
    completenessScorePercent: 100,
    payoutMode: 'local_car_voucher',
    voucherAmountAzn: 2000,
    cashPayoutAmountAzn: 1400,
    qrVerificationHash: 'AZ-TS-UTL-29411-REDEEMED-N1',
    status: 'REDEEMED_AT_DEALER'
  }
];

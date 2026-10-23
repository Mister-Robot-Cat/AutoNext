export interface RentalFleetVehicle {
  id: string;
  category: 'economy' | 'compact' | 'crossover' | 'business' | 'suv_premium' | 'luxury' | 'electric' | 'minivan';
  make: string;
  model: string;
  year: number;
  engine: string;
  fuelType: 'Benzin' | 'Dizel' | 'Hibrid' | 'Elektrik';
  transmission: 'Avtomat' | 'Mexanika';
  seats: number;
  doors: number;
  luggageCapacity: number; // in bags/liters
  fuelConsumptionLPer100Km: number;
  dailyRateAzn: number;
  securityDepositAzn: number;
  minAge: number;
  minExperienceYears: number;
  plate: string;
  image: string;
  features: string[];
}

export interface RentalStation {
  id: string;
  nameAz: string;
  nameEn: string;
  city: string;
  locationType: 'airport' | 'city_center' | 'mall' | 'resort';
  address: string;
  phone: string;
  hours: string;
  is24Hours: boolean;
  airportSurchargeAzn: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface RentalCompany {
  id: string;
  name: string;
  brand: string;
  licenseNumber: string;
  voen: string;
  rating: number;
  reviewCount: number;
  fleetSize: number;
  depositRefundDays: number;
  headquarters: string;
  phone: string;
  emergencySupportPhone: string;
  verifiedPartner: boolean;
}

export interface RentalInsuranceTier {
  id: 'basic' | 'medium' | 'premium';
  nameAz: string;
  nameEn: string;
  dailyFeeAzn: number;
  deductibleAzn: number;
  depositMultiplier: number;
  descriptionAz: string;
  featuresAz: string[];
}

export interface RentalAddon {
  id: string;
  nameAz: string;
  nameEn: string;
  priceType: 'per_day' | 'one_time';
  priceAzn: number;
  descriptionAz: string;
  iconName: string;
}

export interface MockActiveRentalContract {
  contractNumber: string;
  companyName: string;
  vehicleName: string;
  vehiclePlate: string;
  driverFullName: string;
  driverFin: string;
  pickupStation: string;
  dropoffStation: string;
  pickupDate: string;
  returnDate: string;
  totalDays: number;
  grandTotalAzn: number;
  depositAzn: number;
  status: 'active' | 'returned_pending_fines' | 'completed' | 'reserved';
  securityHash: string;
}

export const RENTAL_FLEET_VEHICLES: RentalFleetVehicle[] = [
  {
    id: 'rent-accent',
    category: 'economy',
    make: 'Hyundai',
    model: 'Accent',
    year: 2023,
    engine: '1.6L DOHC',
    fuelType: 'Benzin',
    transmission: 'Avtomat',
    seats: 5,
    doors: 4,
    luggageCapacity: 2,
    fuelConsumptionLPer100Km: 6.4,
    dailyRateAzn: 65,
    securityDepositAzn: 350,
    minAge: 21,
    minExperienceYears: 1,
    plate: '99-RN-102',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    features: ['Kondisioner', 'Bluetooth Audio', 'Kamera və Park Radar', 'Apple CarPlay / Android Auto']
  },
  {
    id: 'rent-cerato',
    category: 'compact',
    make: 'Kia',
    model: 'Cerato',
    year: 2024,
    engine: '2.0L MPI',
    fuelType: 'Benzin',
    transmission: 'Avtomat',
    seats: 5,
    doors: 4,
    luggageCapacity: 3,
    fuelConsumptionLPer100Km: 7.2,
    dailyRateAzn: 85,
    securityDepositAzn: 400,
    minAge: 21,
    minExperienceYears: 2,
    plate: '99-RN-214',
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80',
    features: ['Klimat-kontrol', 'Dəri sükan', 'Zolaq izləmə', 'Start/Stop açarsız daxilolma']
  },
  {
    id: 'rent-tucson',
    category: 'crossover',
    make: 'Hyundai',
    model: 'Tucson',
    year: 2024,
    engine: '2.0L HTRAC AWD',
    fuelType: 'Benzin',
    transmission: 'Avtomat',
    seats: 5,
    doors: 5,
    luggageCapacity: 4,
    fuelConsumptionLPer100Km: 8.1,
    dailyRateAzn: 110,
    securityDepositAzn: 500,
    minAge: 22,
    minExperienceYears: 2,
    plate: '77-RN-335',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80',
    features: ['HTRAC tam ötürücü (4WD)', 'Panorama dam', '360° dövrəvi kamera', 'Kor zona xəbərdarlığı']
  },
  {
    id: 'rent-camry',
    category: 'business',
    make: 'Toyota',
    model: 'Camry',
    year: 2024,
    engine: '2.5L Dynamic Force Hybrid',
    fuelType: 'Hibrid',
    transmission: 'Avtomat',
    seats: 5,
    doors: 4,
    luggageCapacity: 3,
    fuelConsumptionLPer100Km: 4.8,
    dailyRateAzn: 140,
    securityDepositAzn: 600,
    minAge: 23,
    minExperienceYears: 2,
    plate: '99-RN-550',
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80',
    features: ['JBL Premium Səs', 'Oturacaqların ventilyasiyası', 'Toyota Safety Sense 3.0', 'Simsiz enerji']
  },
  {
    id: 'rent-prado',
    category: 'suv_premium',
    make: 'Toyota',
    model: 'Land Cruiser Prado',
    year: 2024,
    engine: '2.8L D-4D Turbo Dizel',
    fuelType: 'Dizel',
    transmission: 'Avtomat',
    seats: 7,
    doors: 5,
    luggageCapacity: 5,
    fuelConsumptionLPer100Km: 8.9,
    dailyRateAzn: 220,
    securityDepositAzn: 1000,
    minAge: 24,
    minExperienceYears: 3,
    plate: '90-RN-777',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    features: ['7-nəfərlik salon', 'Pnevmatik asqı', 'Crawl Control dağ rejimi', 'Soyuducu qutu']
  },
  {
    id: 'rent-sclass',
    category: 'luxury',
    make: 'Mercedes-Benz',
    model: 'S-Class (W223)',
    year: 2023,
    engine: '3.0L Turbo 4MATIC Mild-Hybrid',
    fuelType: 'Benzin',
    transmission: 'Avtomat',
    seats: 5,
    doors: 4,
    luggageCapacity: 4,
    fuelConsumptionLPer100Km: 9.2,
    dailyRateAzn: 450,
    securityDepositAzn: 2000,
    minAge: 25,
    minExperienceYears: 5,
    plate: '10-RN-001',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
    features: ['VIP Masaj oturacaqlar', 'Burmester 4D High-End audio', 'Head-Up Display AR', 'Pnevmo-asqı AIRMATIC']
  },
  {
    id: 'rent-songplus',
    category: 'electric',
    make: 'BYD',
    model: 'Song Plus EV Flagship',
    year: 2024,
    engine: '160 kW Blade Battery (71.8 kWh)',
    fuelType: 'Elektrik',
    transmission: 'Avtomat',
    seats: 5,
    doors: 5,
    luggageCapacity: 4,
    fuelConsumptionLPer100Km: 0,
    dailyRateAzn: 120,
    securityDepositAzn: 500,
    minAge: 22,
    minExperienceYears: 2,
    plate: '99-RN-880',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
    features: ['505 km yürüş ehtiyatı', 'TokBaku & GB/T sürətli şarj', 'Fırlanan 15.6" sensor ekran', 'DiPilot ADAS']
  },
  {
    id: 'rent-vclass',
    category: 'minivan',
    make: 'Mercedes-Benz',
    model: 'V-Class V250d Avantgarde',
    year: 2023,
    engine: '2.0L CDI 190 a.g.',
    fuelType: 'Dizel',
    transmission: 'Avtomat',
    seats: 8,
    doors: 5,
    luggageCapacity: 6,
    fuelConsumptionLPer100Km: 7.9,
    dailyRateAzn: 280,
    securityDepositAzn: 1200,
    minAge: 24,
    minExperienceYears: 3,
    plate: '99-RN-990',
    image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80',
    features: ['8 tam ölçülü oturacaq', 'Konfrans masa qurğusu', 'Elektrikli sürüşən qapılar', 'Böyük yük baqajı']
  }
];

export const RENTAL_STATIONS: RentalStation[] = [
  {
    id: 'st-gyd-airport',
    nameAz: 'Heydər Əliyev Beynəlxalq Hava Limanı (GYD) — Terminal 1 & 2',
    nameEn: 'Heydar Aliyev International Airport (GYD) — Terminals 1 & 2',
    city: 'Bakı',
    locationType: 'airport',
    address: 'Bakı-Mərdəkan şossesi, GYD Hava Limanı Gəliş Zalı, 24/7 Stend',
    phone: '+994 (12) 497-27-27',
    hours: '24/7 Fasiləsiz',
    is24Hours: true,
    airportSurchargeAzn: 15,
    coordinates: { lat: 40.4675, lng: 50.0469 }
  },
  {
    id: 'st-baku-center',
    nameAz: 'Bakı Şəhər Mərkəzi — Nizami Küçəsi / Fəvvarələr Meydanı',
    nameEn: 'Baku City Center — Nizami Street / Fountains Square',
    city: 'Bakı',
    locationType: 'city_center',
    address: 'Nizami küç. 68 (Torqovaya), Əsas Müştəri Mərkəzi',
    phone: '+994 (12) 498-11-22',
    hours: '09:00 – 21:00',
    is24Hours: false,
    airportSurchargeAzn: 0,
    coordinates: { lat: 40.3708, lng: 49.8372 }
  },
  {
    id: 'st-port-baku',
    nameAz: 'Port Baku Mall — Neftçilər Prospekti',
    nameEn: 'Port Baku Mall — Neftchilar Avenue',
    city: 'Bakı',
    locationType: 'mall',
    address: 'Neftçilər pr. 151, Yeraltı Parkinq P1 Zonası',
    phone: '+994 (12) 599-10-10',
    hours: '10:00 – 22:00',
    is24Hours: false,
    airportSurchargeAzn: 0,
    coordinates: { lat: 40.3769, lng: 49.8582 }
  },
  {
    id: 'st-white-city',
    nameAz: 'Bakı Ağ Şəhər (White City) — Mərkəzi Bulvar',
    nameEn: 'Baku White City — Central Boulevard',
    city: 'Bakı',
    locationType: 'city_center',
    address: 'Ağ Şəhər Bulvarı, Yaşıl Ada 2, Ofis 14',
    phone: '+994 (12) 525-40-40',
    hours: '09:00 – 20:00',
    is24Hours: false,
    airportSurchargeAzn: 0,
    coordinates: { lat: 40.3802, lng: 49.8885 }
  },
  {
    id: 'st-ganja-airport',
    nameAz: 'Gəncə Beynəlxalq Hava Limanı (KVD) Hub',
    nameEn: 'Ganja International Airport (KVD) Hub',
    city: 'Gəncə',
    locationType: 'airport',
    address: 'Gəncə Hava Limanı Şossesi, Sərnişin Terminalı',
    phone: '+994 (22) 256-11-44',
    hours: '08:00 – 22:00',
    is24Hours: false,
    airportSurchargeAzn: 15,
    coordinates: { lat: 40.7381, lng: 46.3194 }
  },
  {
    id: 'st-gabala-resort',
    nameAz: 'Qəbələ & Şahdağ Qış-Yay Turizm Mərkəzi Stansiyası',
    nameEn: 'Gabala & Shahdag Tourism Hub',
    city: 'Qəbələ',
    locationType: 'resort',
    address: 'Qəbələ mərkəz, Heydər Əliyev pr. 82 (Tufandağ yolu)',
    phone: '+994 (24) 205-33-11',
    hours: '08:00 – 20:00',
    is24Hours: false,
    airportSurchargeAzn: 0,
    coordinates: { lat: 40.9825, lng: 47.8488 }
  }
];

export const RENTAL_COMPANIES: RentalCompany[] = [
  {
    id: 'comp-hertz',
    name: 'Hertz Azerbaijan (Silk Way Mobility ASC)',
    brand: 'Hertz',
    licenseNumber: 'AZ-RNT-001',
    voen: '1402283491',
    rating: 4.9,
    reviewCount: 382,
    fleetSize: 155,
    depositRefundDays: 14,
    headquarters: 'Bakı, Heydər Əliyev pr. 102',
    phone: '+994 (12) 497-27-27',
    emergencySupportPhone: '*1444',
    verifiedPartner: true
  },
  {
    id: 'comp-avis',
    name: 'Avis Azerbaijan (Baku Prestige Rent QSC)',
    brand: 'Avis',
    licenseNumber: 'AZ-RNT-002',
    voen: '1701194382',
    rating: 4.8,
    reviewCount: 294,
    fleetSize: 120,
    depositRefundDays: 14,
    headquarters: 'Bakı, Nizami küç. 45',
    phone: '+994 (12) 498-11-22',
    emergencySupportPhone: '*0222',
    verifiedPartner: true
  },
  {
    id: 'comp-enterprise',
    name: 'Enterprise Rent-A-Car Baku QSC',
    brand: 'Enterprise',
    licenseNumber: 'AZ-RNT-003',
    voen: '2001348821',
    rating: 4.8,
    reviewCount: 215,
    fleetSize: 98,
    depositRefundDays: 14,
    headquarters: 'Bakı, Neftçilər pr. 151',
    phone: '+994 (12) 599-10-10',
    emergencySupportPhone: '*8899',
    verifiedPartner: true
  },
  {
    id: 'comp-europcar',
    name: 'Europcar Azerbaijan Mobility MMC',
    brand: 'Europcar',
    licenseNumber: 'AZ-RNT-004',
    voen: '1302849910',
    rating: 4.7,
    reviewCount: 178,
    fleetSize: 85,
    depositRefundDays: 18,
    headquarters: 'Bakı, Azadlıq pr. 72',
    phone: '+994 (12) 441-20-30',
    emergencySupportPhone: '*3322',
    verifiedPartner: true
  },
  {
    id: 'comp-ram',
    name: 'Ram Servis Rent-A-Car QSC',
    brand: 'Ram Servis',
    licenseNumber: 'AZ-RNT-005',
    voen: '1500492811',
    rating: 4.9,
    reviewCount: 420,
    fleetSize: 135,
    depositRefundDays: 10,
    headquarters: 'Bakı, Babək pr. 28',
    phone: '+994 (12) 570-00-55',
    emergencySupportPhone: '*1551',
    verifiedPartner: true
  },
  {
    id: 'comp-aznur',
    name: 'Aznur Rent-A-Car MMC',
    brand: 'Aznur',
    licenseNumber: 'AZ-RNT-006',
    voen: '1002341902',
    rating: 4.6,
    reviewCount: 142,
    fleetSize: 70,
    depositRefundDays: 20,
    headquarters: 'Bakı, Tbilisi pr. 34',
    phone: '+994 (12) 430-10-15',
    emergencySupportPhone: '*7788',
    verifiedPartner: false
  }
];

export const RENTAL_INSURANCE_TIERS: RentalInsuranceTier[] = [
  {
    id: 'basic',
    nameAz: 'Standart KASKO & CDW (Baza Təminatı)',
    nameEn: 'Standard CDW (Basic Cover)',
    dailyFeeAzn: 0,
    deductibleAzn: 600,
    depositMultiplier: 1.0,
    descriptionAz: 'İcarə qiymətinə daxildir. Zərər zamanı françiza (məsuliyyət payı) tətbiq edilir. BDYP qəza protokolu tələb olunur.',
    featuresAz: [
      'İcbari avtomobil sığortası 100% daxildir',
      'KASKO zərər üzrə 600 AZN françiza payı',
      'Tam təhlükəsizlik depoziti bloklanması tələb edilir',
      'Şüşə və təkər zədələri baza sığortaya daxil deyil'
    ]
  },
  {
    id: 'medium',
    nameAz: 'Super CDW (Genişləndirilmiş Qoruma)',
    nameEn: 'Super CDW (Extended Cover)',
    dailyFeeAzn: 20,
    deductibleAzn: 200,
    depositMultiplier: 0.5,
    descriptionAz: 'Françiza və təhlükəsizlik depoziti 50% endirilir. Alın şüşəsi, faralar və təkər zədələri üzrə tam qoruma.',
    featuresAz: [
      'Zərər məsuliyyət payı (françiza) cəmi 200 AZN-ə endirilir',
      'Təhlükəsizlik depoziti 50% azaldılır',
      'Şüşə, güzgü və təkər yarıqları təminat altına alınır',
      'Pulsuz 24/7 evakuator və texniki servis yardımı'
    ]
  },
  {
    id: 'premium',
    nameAz: 'Tam Rahatlıq / Sıfır Məsuliyyət (Zero Deductible)',
    nameEn: 'Full Peace of Mind (Zero Excess)',
    dailyFeeAzn: 35,
    deductibleAzn: 0,
    depositMultiplier: 0.2,
    descriptionAz: 'Tam sıfır məsuliyyət! Heç bir françiza yoxdur. Depozit simvolik 100 AZN-ə endirilir (yalnız BDYP cərimə qarantı).',
    featuresAz: [
      '0 AZN françiza (hər hansı yol qəzasında sürücü 0 ₼ ödəyir)',
      'Təhlükəsizlik depoziti cəmi 100 AZN təşkil edir',
      'Şəxsi əşyaların və salonun sığortalanması',
      'VIP növbəsiz avtomobil təhvili və ekspres yoxlanış'
    ]
  }
];

export const RENTAL_ADDONS: RentalAddon[] = [
  {
    id: 'addon-child-seat',
    nameAz: 'Uşaq Avtokreslosu (CRS / ISOFIX)',
    nameEn: 'Child Safety Seat (ISOFIX)',
    priceType: 'per_day',
    priceAzn: 10,
    descriptionAz: 'YHQ Maddə 37 üzrə 12 yaşa qədər uşaqlar üçün təhlükəsizlik kreslosu (BDYP 60 ₼ cəriməsindən qoruyur).',
    iconName: 'Baby'
  },
  {
    id: 'addon-extra-driver',
    nameAz: 'İkinci (Əlavə) Sürücü Qeydiyyatı',
    nameEn: 'Additional Authorized Driver',
    priceType: 'per_day',
    priceAzn: 15,
    descriptionAz: 'Rəsmi icarə müqaviləsinə və sığorta polisinə ikinci sürücünün qanuni əlavə edilməsi.',
    iconName: 'UserCheck'
  },
  {
    id: 'addon-wifi-gps',
    nameAz: '4G LTE Sürətli Wi-Fi & GPS Qurğusu',
    nameEn: '4G LTE Wi-Fi Hotspot & GPS',
    priceType: 'per_day',
    priceAzn: 8,
    descriptionAz: 'Avtomobil daxilində limitsiz internet paylayıcı və Azərbaycanın bütün regionları yüklənmiş GPS xəritə.',
    iconName: 'Wifi'
  },
  {
    id: 'addon-georgia-transit',
    nameAz: 'Gürcüstana Çıxış Notariat İcazəsi & Sərhəd Paketi',
    nameEn: 'Cross-Border Georgia Transit Permit',
    priceType: 'one_time',
    priceAzn: 150,
    descriptionAz: 'Avtomobillə Qırmızı Körpü sərhəd məntəqəsindən Gürcüstana səfər üçün rəsmi notarial baş etibarnamə və yaşıl kart icazəsi.',
    iconName: 'Globe'
  },
  {
    id: 'addon-fuel-prepay',
    nameAz: 'Öncədən Yanacaq Çəni (Boş çənlə təhvil)',
    nameEn: 'Pre-paid Full Fuel Tank (Return Empty)',
    priceType: 'one_time',
    priceAzn: 60,
    descriptionAz: 'Avtomobili dolu çənlə götürüb sonradan yanacaqdoldurma məntəqəsinə baş çəkmədən boş çənlə qaytarmaq imkanı.',
    iconName: 'Fuel'
  },
  {
    id: 'addon-fines-escrow',
    nameAz: 'BDYP MMX Cərimə Avto-Hesablaşma Zəmanəti',
    nameEn: 'BDYP Fines Express Clearing Escrow',
    priceType: 'one_time',
    priceAzn: 50,
    descriptionAz: 'İcarə müddətində yaranan foto-radar cərimələrinin AsanPay vasitəsilə 50% endirimlə avtomatik ödənilməsi xidməti.',
    iconName: 'ShieldCheck'
  }
];

export const MOCK_ACTIVE_RENTAL_CONTRACTS: MockActiveRentalContract[] = [
  {
    contractNumber: 'CAR-RNT-2026-8812',
    companyName: 'Hertz Azerbaijan (Silk Way Mobility ASC)',
    vehicleName: 'Toyota Camry 2.5 Hybrid (2024)',
    vehiclePlate: '99-RN-550',
    driverFullName: 'Rəşad Qasımov',
    driverFin: '7K18942',
    pickupStation: 'Heydər Əliyev Beynəlxalq Hava Limanı (GYD)',
    dropoffStation: 'Heydər Əliyev Beynəlxalq Hava Limanı (GYD)',
    pickupDate: '2026-10-20',
    returnDate: '2026-10-27',
    totalDays: 7,
    grandTotalAzn: 980,
    depositAzn: 600,
    status: 'active',
    securityHash: '8b7a69f4e2c13d80a15ec97b'
  },
  {
    contractNumber: 'CAR-RNT-2026-7241',
    companyName: 'Avis Azerbaijan (Baku Prestige Rent QSC)',
    vehicleName: 'Hyundai Tucson 2.0 HTRAC AWD (2024)',
    vehiclePlate: '77-RN-335',
    driverFullName: 'David Miller',
    driverFin: 'TOURIST-USA-99',
    pickupStation: 'Bakı Şəhər Mərkəzi — Nizami Küçəsi',
    dropoffStation: 'Qəbələ & Şahdağ Turizm Stansiyası',
    pickupDate: '2026-10-18',
    returnDate: '2026-10-23',
    totalDays: 5,
    grandTotalAzn: 685,
    depositAzn: 500,
    status: 'returned_pending_fines',
    securityHash: '2f9a1c88d40e11894a7cb201'
  },
  {
    contractNumber: 'CAR-RNT-2026-6410',
    companyName: 'Enterprise Rent-A-Car Baku QSC',
    vehicleName: 'BYD Song Plus EV Flagship (2024)',
    vehiclePlate: '99-RN-880',
    driverFullName: 'Leyla Məmmədova',
    driverFin: '5T90184',
    pickupStation: 'Port Baku Mall — Neftçilər Prospekti',
    dropoffStation: 'Port Baku Mall — Neftçilər Prospekti',
    pickupDate: '2026-10-10',
    returnDate: '2026-10-14',
    totalDays: 4,
    grandTotalAzn: 512,
    depositAzn: 500,
    status: 'completed',
    securityHash: '91cb7704e5218d66fa19b084'
  },
  {
    contractNumber: 'CAR-RNT-2026-9530',
    companyName: 'Ram Servis Rent-A-Car QSC',
    vehicleName: 'Mercedes-Benz S-Class W223 (2023)',
    vehiclePlate: '10-RN-001',
    driverFullName: 'Elmir Nəcəfov',
    driverFin: '1A88203',
    pickupStation: 'Bakı Ağ Şəhər (White City)',
    dropoffStation: 'Heydər Əliyev Beynəlxalq Hava Limanı (GYD)',
    pickupDate: '2026-10-25',
    returnDate: '2026-10-28',
    totalDays: 3,
    grandTotalAzn: 1475,
    depositAzn: 2000,
    status: 'reserved',
    securityHash: '3e00b848cf614a8080de2117'
  }
];

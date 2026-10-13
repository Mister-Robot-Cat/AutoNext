import { Vehicle, Currency } from '../types/vehicle';
import {
  ServiceRecord,
  ScheduledMaintenanceItem,
  ServicePassportSummary,
  ServiceFilterOptions,
} from '../types/servicePassport';
import { MOCK_SERVICE_RECORDS_DATABASE } from '../data/mockServiceRecords';
import { CURRENCY_RATES } from './i18n';

/**
 * Multiplier for luxury car parts & labor
 */
function getBrandCostMultiplier(make: string): number {
  const luxuryBrands = ['Porsche', 'BMW', 'Mercedes-Benz', 'Audi', 'Land Rover', 'Jaguar', 'Lexus'];
  if (make === 'Porsche') return 1.85;
  if (luxuryBrands.includes(make)) return 1.45;
  return 1.0;
}

/**
 * Computes scheduled maintenance checklist and urgency based on vehicle mileage and powertrain
 */
export function calculateMaintenanceSchedule(
  vehicle: Vehicle,
  customMileageKm?: number
): ScheduledMaintenanceItem[] {
  const currentKm = customMileageKm !== undefined ? customMileageKm : vehicle.mileageKm;
  const brandMult = getBrandCostMultiplier(vehicle.make);

  let itemsConfig: Array<{
    id: string;
    category: ScheduledMaintenanceItem['category'];
    titleAz: string;
    titleEn: string;
    titleRu: string;
    descriptionAz: string;
    descriptionEn: string;
    descriptionRu: string;
    intervalKm: number;
    intervalMonths: number;
    importance: ScheduledMaintenanceItem['importance'];
    baseDealerCostAzn: number;
    baseIndepCostAzn: number;
    partsList: string[];
    estimatedHours: number;
  }> = [];

  if (vehicle.fuelType === 'electric') {
    itemsConfig = [
      {
        id: 'ev-hepa-filter',
        category: 'oil_filter',
        titleAz: 'Salon HEPA Mikrofiltri Dəyişimi',
        titleEn: 'Cabin HEPA Microfilter Replacement',
        titleRu: 'Замена салонного HEPA микрофильтра',
        descriptionAz: 'Salon havasının 99.97% təmizlənməsi və kondisioner buxarlandırıcısının dezinfeksiyası.',
        descriptionEn: '99.97% cabin air purification and AC evaporator antimicrobial sanitation.',
        descriptionRu: 'Очистка воздуха в салоне и антибактериальная обработка испарителя кондиционера.',
        intervalKm: 20000,
        intervalMonths: 12,
        importance: 'recommended',
        baseDealerCostAzn: 120,
        baseIndepCostAzn: 70,
        partsList: ['İkiqat aktiv kömürlü HEPA filtr'],
        estimatedHours: 0.5,
      },
      {
        id: 'ev-brake-fluid',
        category: 'fluids_coolant',
        titleAz: 'Tormoz Mayesi (DOT 4 LV) Vakuumla Dəyişimi',
        titleEn: 'Brake Fluid (DOT 4 LV) Replacement',
        titleRu: 'Замена тормозной жидкости (DOT 4 LV)',
        descriptionAz: 'Nəmlik dərəcəsi 2%-i keçdikdə sistemin təmizlənməsi və vakuumla doldurulması.',
        descriptionEn: 'Full vacuum flush when moisture absorption exceeds 2% threshold.',
        descriptionRu: 'Полная прокачка и замена тормозной жидкости при влажности выше 2%.',
        intervalKm: 40000,
        intervalMonths: 24,
        importance: 'critical',
        baseDealerCostAzn: 150,
        baseIndepCostAzn: 85,
        partsList: ['DOT 4 Low Viscosity tormoz mayesi (1L)'],
        estimatedHours: 1.0,
      },
      {
        id: 'ev-caliper-service',
        category: 'brakes',
        titleAz: 'Tormoz Supportlarının Yağlanması & Re-Gen Profilaktikası',
        titleEn: 'Brake Caliper Service & Regenerative Lubrication',
        titleRu: 'Обслуживание суппортов и профилактика рекуперации',
        descriptionAz: 'Elektromobillərdə rekuperasiya səbəbilə nadir işlənən mexaniki supportların təmizlənməsi.',
        descriptionEn: 'Brake pad and guide pin servicing to prevent seizure from frequent regenerative braking.',
        descriptionRu: 'Смазка направляющих суппортов во избежание закисания при рекуперации.',
        intervalKm: 30000,
        intervalMonths: 18,
        importance: 'recommended',
        baseDealerCostAzn: 140,
        baseIndepCostAzn: 80,
        partsList: ['Yüksək temperaturlu keramik support pastası'],
        estimatedHours: 1.2,
      },
      {
        id: 'ev-coolant-flush',
        category: 'fluids_coolant',
        titleAz: 'Yüksək Gərginlikli Batareya Soyutma Mayesi Dəyişimi',
        titleEn: 'High-Voltage Battery Coolant Flush',
        titleRu: 'Замена охлаждающей жидкости высоковольтной батареи',
        descriptionAz: 'Dielektrik xüsusiyyətli batareya soyuducu mayesinin laboratoriya standartı ilə yenilənməsi.',
        descriptionEn: 'Dielectric battery pack coolant replacement to maintain optimum thermal efficiency.',
        descriptionRu: 'Замена специального антифриза охлаждения батарейного блока.',
        intervalKm: 60000,
        intervalMonths: 36,
        importance: 'critical',
        baseDealerCostAzn: 350,
        baseIndepCostAzn: 210,
        partsList: ['Orijinal dielektrik EV soyutma mayesi (8L)'],
        estimatedHours: 2.5,
      },
      {
        id: 'ev-gearbox-oil',
        category: 'engine_transmission',
        titleAz: 'Reduktor (Transmissiya) Yağının Dəyişimi',
        titleEn: 'Electric Drive Reducer Fluid Service',
        titleRu: 'Замена масла в редукторе электропривода',
        descriptionAz: 'Tək pilləli elektromotor reduktorunun dişli çarx qoruyucu sintetik yağının yenilənməsi.',
        descriptionEn: 'Synthetic reduction gearbox fluid replacement to protect bearings and planetary gears.',
        descriptionRu: 'Замена трансмиссионного масла в редукторе электромотора.',
        intervalKm: 80000,
        intervalMonths: 48,
        importance: 'recommended',
        baseDealerCostAzn: 240,
        baseIndepCostAzn: 140,
        partsList: ['EV Reduktor sintetik yağı (2L)'],
        estimatedHours: 1.5,
      },
    ];
  } else if (vehicle.fuelType === 'hybrid' || vehicle.fuelType === 'plug_in_hybrid') {
    itemsConfig = [
      {
        id: 'hyb-oil-service',
        category: 'oil_filter',
        titleAz: 'Mühərrik Yağı (0W-16/0W-20) & Yağ Filtri',
        titleEn: 'Engine Synthetic Oil (0W-16/0W-20) & Filter',
        titleRu: 'Синтетическое моторное масло (0W-16/0W-20) и фильтр',
        descriptionAz: 'Hibrid mühərriklər üçün aşağı özlülüklü tam sintetik yağ və orijinal filtr dəyişimi.',
        descriptionEn: 'Low-viscosity full synthetic engine oil and OEM filter designed for hybrid stop-start cycles.',
        descriptionRu: 'Специальное синтетическое масло с низкой вязкостью для гибридных ДВС.',
        intervalKm: 10000,
        intervalMonths: 12,
        importance: 'critical',
        baseDealerCostAzn: 160,
        baseIndepCostAzn: 95,
        partsList: ['Tam sintetik mühərrik yağı 4.5L', 'Orijinal yağ filtri OEM'],
        estimatedHours: 0.8,
      },
      {
        id: 'hyb-air-filters',
        category: 'oil_filter',
        titleAz: 'Mühərrik Hava və Salon Mikrofiltri',
        titleEn: 'Engine Air & Cabin Microfilter Replacement',
        titleRu: 'Воздушный фильтр двигателя и салонный фильтр',
        descriptionAz: 'Mühərriyin hava axınının tənzimlənməsi və salon iqlim sisteminin təmizlənməsi.',
        descriptionEn: 'Engine intake airflow optimization and active charcoal cabin air filtration.',
        descriptionRu: 'Замена воздушного и угольного салонного фильтра.',
        intervalKm: 20000,
        intervalMonths: 12,
        importance: 'recommended',
        baseDealerCostAzn: 110,
        baseIndepCostAzn: 65,
        partsList: ['Hava filtri OEM', 'Salon kömürlü filtr'],
        estimatedHours: 0.5,
      },
      {
        id: 'hyb-battery-fan',
        category: 'electrical_battery',
        titleAz: 'Hibrid Batareya Ventilyatoru və Filtr Təmizliyi',
        titleEn: 'Hybrid Battery Fan & Duct Sanitation',
        titleRu: 'Очистка вентилятора и фильтра гибридной батареи',
        descriptionAz: 'Batareyanın qızmasının qarşısını almaq üçün soyutma pərinin tozdan təmizlənməsi.',
        descriptionEn: 'Cooling blower disassembly and lint removal to prevent battery pack overheating.',
        descriptionRu: 'Чистка охлаждающего вентилятора и воздуховода ВВБ от пыли.',
        intervalKm: 30000,
        intervalMonths: 24,
        importance: 'critical',
        baseDealerCostAzn: 130,
        baseIndepCostAzn: 70,
        partsList: ['Hibrid hava qəbuledici mikro-tor filtr'],
        estimatedHours: 1.0,
      },
      {
        id: 'hyb-spark-plugs',
        category: 'engine_transmission',
        titleAz: 'İridium Alışdırma Şamları Dəyişimi',
        titleEn: 'Iridium Spark Plugs Replacement',
        titleRu: 'Замена иридиевых свечей зажигания',
        descriptionAz: 'Uzunömürlü lazer qaynaqlı iridium şamlar ilə yanacaq sərfiyyatının sabit saxlanması.',
        descriptionEn: 'OEM laser-welded iridium spark plugs for optimal combustion and low emissions.',
        descriptionRu: 'Замена комплекта оригинальных иридиевых свечей зажигания.',
        intervalKm: 60000,
        intervalMonths: 36,
        importance: 'recommended',
        baseDealerCostAzn: 220,
        baseIndepCostAzn: 130,
        partsList: ['Iridium şam dəsti (4 ədəd)'],
        estimatedHours: 1.2,
      },
      {
        id: 'hyb-transaxle-fluid',
        category: 'engine_transmission',
        titleAz: 'e-CVT Hibrid Transmissiya Mayesi',
        titleEn: 'e-CVT Hybrid Transaxle Fluid Service',
        titleRu: 'Замена жидкости планетарной коробки e-CVT',
        descriptionAz: 'Planetar reduktor və elektrik motor generator qovşağının ATF WS mayesi yenilənməsi.',
        descriptionEn: 'Synthetic transaxle fluid renewal for smooth torque distribution.',
        descriptionRu: 'Замена специального трансмиссионного масла e-CVT.',
        intervalKm: 60000,
        intervalMonths: 48,
        importance: 'recommended',
        baseDealerCostAzn: 240,
        baseIndepCostAzn: 145,
        partsList: ['Toyota/Lexus ATF WS sintetik maye (4L)'],
        estimatedHours: 1.5,
      },
      {
        id: 'hyb-dual-coolant',
        category: 'fluids_coolant',
        titleAz: 'İkili Soyutma Dövriyyəsi (Mühərrik + İnverter) Antifriz',
        titleEn: 'Dual-Loop Engine & Inverter Coolant Flush',
        titleRu: 'Замена антифриза в обоих контурах (ДВС и Инвертор)',
        descriptionAz: 'Super Long Life (SLLC) çəhrayı antifriz ilə hər iki soyutma konturunun yenilənməsi.',
        descriptionEn: 'Full renewal of independent ICE and power electronics inverter cooling loops.',
        descriptionRu: 'Замена охлаждающей жидкости в контурах ДВС и гибридного инвертора.',
        intervalKm: 80000,
        intervalMonths: 48,
        importance: 'critical',
        baseDealerCostAzn: 260,
        baseIndepCostAzn: 155,
        partsList: ['Super Long Life Coolant (8L)'],
        estimatedHours: 2.0,
      },
    ];
  } else if (vehicle.fuelType === 'diesel') {
    itemsConfig = [
      {
        id: 'die-oil-service',
        category: 'oil_filter',
        titleAz: 'Dizel Mühərrik Yağı (Low SAPS C3) & Filtr',
        titleEn: 'Diesel Synthetic Oil (Low SAPS C3) & Filter',
        titleRu: 'Синтетическое масло для дизеля (Low SAPS C3) и фильтр',
        descriptionAz: 'DPF his filtrini qoruyan aşağı kül tərkibli C3 sintetik mühərrik yağı.',
        descriptionEn: 'DPF-safe Low SAPS synthetic oil for clean exhaust particulate filter performance.',
        descriptionRu: 'Масло Low SAPS для защиты сажевого фильтра (DPF) и турбины.',
        intervalKm: 8000,
        intervalMonths: 10,
        importance: 'critical',
        baseDealerCostAzn: 180,
        baseIndepCostAzn: 110,
        partsList: ['Dizel 5W-30 C3 sintetik yağ 6L', 'Yağ filtri OEM'],
        estimatedHours: 0.8,
      },
      {
        id: 'die-fuel-filter',
        category: 'oil_filter',
        titleAz: 'Dizel Yanacaq Filtri & Su Ayırıcı Kartric',
        titleEn: 'Diesel Fuel Filter & Water Separator',
        titleRu: 'Топливный фильтр дизеля с водоотделителем',
        descriptionAz: 'Common Rail yüksək təzyiqli yanacaq nasosunu (TNVD) qoruyan incə təmizləyici filtr.',
        descriptionEn: 'High-pressure fuel pump (HPFP) protection cartridge with moisture drain.',
        descriptionRu: 'Замена тонкого топливного фильтра для защиты форсунок Common Rail.',
        intervalKm: 20000,
        intervalMonths: 12,
        importance: 'critical',
        baseDealerCostAzn: 160,
        baseIndepCostAzn: 95,
        partsList: ['Yanacaq filtri kartrici OEM'],
        estimatedHours: 1.0,
      },
      {
        id: 'die-brake-system',
        category: 'brakes',
        titleAz: 'Ön/Arxa Tormoz Bəndləri və Disk Yoxlanışı',
        titleEn: 'Brake Pads & Rotor Wear Inspection',
        titleRu: 'Передние/задние тормозные колодки и проверка дисков',
        descriptionAz: 'Tormoz bəndlərinin aşınma sensorları ilə birlikdə yenilənməsi.',
        descriptionEn: 'Friction pad renewal and rotor thickness run-out measurement.',
        descriptionRu: 'Замена тормозных колодок и датчиков износа.',
        intervalKm: 30000,
        intervalMonths: 24,
        importance: 'critical',
        baseDealerCostAzn: 250,
        baseIndepCostAzn: 150,
        partsList: ['Keramik ön tormoz bəndləri', 'Aşınma ötürücüsü'],
        estimatedHours: 1.5,
      },
      {
        id: 'die-atf-gearbox',
        category: 'engine_transmission',
        titleAz: 'Avtomat Transmissiya Yağı (ATF) və Karter Filtri',
        titleEn: 'Automatic Transmission Fluid (ATF) & Pan Filter',
        titleRu: 'Замена масла в АКПП с поддоном-фильтром',
        descriptionAz: 'Sürətlər qutusunun hidrobölüşdürücüsünü təmiz saxlayan tam sintetik ATF.',
        descriptionEn: 'Full synthetic transmission fluid flush with integrated magnet pan replacement.',
        descriptionRu: 'Аппаратная замена трансмиссионного масла и поддона со встроенным фильтром.',
        intervalKm: 60000,
        intervalMonths: 48,
        importance: 'recommended',
        baseDealerCostAzn: 450,
        baseIndepCostAzn: 270,
        partsList: ['ATF sintetik maye 7L', 'Transmissiya karter-filtri'],
        estimatedHours: 2.5,
      },
      {
        id: 'die-timing-system',
        category: 'engine_transmission',
        titleAz: 'QRM Kəməri (və ya Zəncir), Roliklər və Su Pompası',
        titleEn: 'Timing Belt/Chain Kit, Pulleys & Water Pump',
        titleRu: 'Комплект ГРМ, ролики и водяной насос (помпа)',
        descriptionAz: 'Qazpaylama mexanizminin planlı profilaktikası və soyutma pompasının dəyişimi.',
        descriptionEn: 'Complete timing synchronization kit and water coolant pump overhaul.',
        descriptionRu: 'Замена ремня/цепи ГРМ, натяжных роликов и помпы охлаждения.',
        intervalKm: 90000,
        intervalMonths: 60,
        importance: 'critical',
        baseDealerCostAzn: 650,
        baseIndepCostAzn: 390,
        partsList: ['QRM kəmər/zəncir dəsti', 'Gərici roliklər', 'Su pompası'],
        estimatedHours: 4.5,
      },
    ];
  } else {
    // Standard Petrol
    itemsConfig = [
      {
        id: 'pet-oil-service',
        category: 'oil_filter',
        titleAz: 'Mühərrik Yağı (5W-30 / 0W-30) & Yağ Filtri',
        titleEn: 'Synthetic Engine Oil (5W-30 / 0W-30) & Filter',
        titleRu: 'Синтетическое моторное масло и масляный фильтр',
        descriptionAz: 'Yüksək temperaturlu turbo və atmosfer mühərrikləri üçün tam sintetik yağ.',
        descriptionEn: 'Full synthetic motor oil formulated for modern turbocharged and naturally aspirated engines.',
        descriptionRu: 'Полная замена синтетического моторного масла и оригинального фильтра.',
        intervalKm: 10000,
        intervalMonths: 12,
        importance: 'critical',
        baseDealerCostAzn: 190,
        baseIndepCostAzn: 110,
        partsList: ['Sintetik mühərrik yağı 5.5L', 'Orijinal yağ filtri OEM'],
        estimatedHours: 0.8,
      },
      {
        id: 'pet-filters',
        category: 'oil_filter',
        titleAz: 'Hava Filtri & Aktiv Kömürlü Salon Mikrofiltri',
        titleEn: 'Engine Air Filter & Carbon Cabin Microfilter',
        titleRu: 'Воздушный и угольный салонный фильтр',
        descriptionAz: 'Mühərrikə daxil olan havanın təmizlənməsi və salonda qoxu/toz izolyasiyası.',
        descriptionEn: 'Clean airflow delivery to the intake manifold and allergens removal.',
        descriptionRu: 'Очистка впускного воздуха и защита климатической установки.',
        intervalKm: 20000,
        intervalMonths: 12,
        importance: 'recommended',
        baseDealerCostAzn: 130,
        baseIndepCostAzn: 75,
        partsList: ['Hava filtri OEM', 'Salon mikrofiltri'],
        estimatedHours: 0.5,
      },
      {
        id: 'pet-brakes',
        category: 'brakes',
        titleAz: 'Ön və Arxa Tormoz Bəndləri & Tormoz Mayesi',
        titleEn: 'Front & Rear Brake Pads & DOT 4 Fluid',
        titleRu: 'Тормозные колодки и замена тормозной жидкости',
        descriptionAz: 'Yüksək sürtünmə əmsallı keramik tormoz bəndləri və mayenin yenilənməsi.',
        descriptionEn: 'High-performance brake pads and vacuum hydraulic fluid exchange.',
        descriptionRu: 'Замена тормозных колодок и прокачка тормозной системы.',
        intervalKm: 30000,
        intervalMonths: 24,
        importance: 'critical',
        baseDealerCostAzn: 290,
        baseIndepCostAzn: 170,
        partsList: ['Ön tormoz bəndləri', 'Aşınma ötürücüsü', 'DOT 4 maye'],
        estimatedHours: 1.5,
      },
      {
        id: 'pet-spark-plugs',
        category: 'engine_transmission',
        titleAz: 'Alışdırma Şamları (Platin / İridium)',
        titleEn: 'Platinum / Iridium Spark Plugs Replacement',
        titleRu: 'Платиновые / иридиевые свечи зажигания',
        descriptionAz: 'Düzgün alovlanma, sabit mühərrik dövriyyəsi və yanacaq qənaəti üçün şamlar.',
        descriptionEn: 'Precision electrode gap alignment and misfire prevention.',
        descriptionRu: 'Замена свечей зажигания для ровной работы двигателя и экономии топлива.',
        intervalKm: 50000,
        intervalMonths: 36,
        importance: 'recommended',
        baseDealerCostAzn: 260,
        baseIndepCostAzn: 155,
        partsList: ['Platin/İridium şam komplekti (4-6 ədəd)'],
        estimatedHours: 1.2,
      },
      {
        id: 'pet-atf-gearbox',
        category: 'engine_transmission',
        titleAz: 'Avtomat Sürətlər Qutusu Yağı (ATF / DSG / PDK)',
        titleEn: 'Automatic Transmission Fluid Flush & Filter',
        titleRu: 'Замена масла в коробке передач (АКПП / DSG / PDK)',
        descriptionAz: 'Pillə keçidlərinin rəvanlığı və ilişmə disklərinin uzunömürlülüyü üçün maye yenilənməsi.',
        descriptionEn: 'Hydraulic clutch protection and thermal control oil exchange.',
        descriptionRu: 'Аппаратная смена трансмиссионного масла с фильтрами.',
        intervalKm: 60000,
        intervalMonths: 48,
        importance: 'recommended',
        baseDealerCostAzn: 480,
        baseIndepCostAzn: 290,
        partsList: ['Orijinal ATF maye (6-8L)', 'Karter filtri və contası'],
        estimatedHours: 2.5,
      },
      {
        id: 'pet-drive-belt',
        category: 'engine_transmission',
        titleAz: 'Aksessuar Kəməri, Gərici Roliklər və Soyutma Antifrizi',
        titleEn: 'Serpentine Accessory Belt, Tensioner & Coolant',
        titleRu: 'Ремень навесного оборудования, натяжитель и антифриз',
        descriptionAz: 'Generator, kompressor kəmərinin və soyutma sisteminin tam yenilənməsi.',
        descriptionEn: 'Alternator drive belt replacement and complete radiator coolant drainage.',
        descriptionRu: 'Замена приводного поликлинового ремня и промывка системы охлаждения.',
        intervalKm: 80000,
        intervalMonths: 48,
        importance: 'critical',
        baseDealerCostAzn: 380,
        baseIndepCostAzn: 220,
        partsList: ['Poli-V kəmər', 'Mexaniki gərici', 'Antifriz (6L)'],
        estimatedHours: 2.0,
      },
    ];
  }

  // Calculate cycles and urgency for each item
  return itemsConfig.map((cfg) => {
    const cycle = Math.floor(currentKm / cfg.intervalKm);
    const lastPerformedKm = Math.max(0, cycle * cfg.intervalKm);
    const nextDueKm = (cycle + 1) * cfg.intervalKm;
    const remainingKm = nextDueKm - currentKm;

    let urgency: ScheduledMaintenanceItem['urgency'] = 'upcoming';
    if (remainingKm <= 0) {
      urgency = 'overdue';
    } else if (remainingKm <= 2000) {
      urgency = 'due_soon';
    }

    const dealerCost = Math.round(cfg.baseDealerCostAzn * brandMult);
    const indepCost = Math.round(cfg.baseIndepCostAzn * brandMult);

    return {
      id: cfg.id,
      category: cfg.category,
      titleAz: cfg.titleAz,
      titleEn: cfg.titleEn,
      titleRu: cfg.titleRu,
      descriptionAz: cfg.descriptionAz,
      descriptionEn: cfg.descriptionEn,
      descriptionRu: cfg.descriptionRu,
      intervalKm: cfg.intervalKm,
      intervalMonths: cfg.intervalMonths,
      lastPerformedKm,
      nextDueKm,
      remainingKm,
      urgency,
      importance: cfg.importance,
      dealerEstimatedCostAzn: dealerCost,
      independentEstimatedCostAzn: indepCost,
      partsList: cfg.partsList,
      estimatedHours: cfg.estimatedHours,
    };
  });
}

/**
 * Retrieve verified records from database or generate realistic historical records matching mileage
 */
export function getVehicleServiceRecords(vehicleVin: string, vehicle?: Vehicle): ServiceRecord[] {
  const existing = MOCK_SERVICE_RECORDS_DATABASE[vehicleVin];
  if (existing && existing.length > 0) {
    return existing;
  }

  // Synthesize realistic records if not explicitly stored
  if (!vehicle) return [];

  const mileage = vehicle.mileageKm;
  const brandMult = getBrandCostMultiplier(vehicle.make);
  const records: ServiceRecord[] = [];

  const currentYear = new Date().getFullYear();
  const carAge = Math.max(1, currentYear - vehicle.year);
  const kmPerYear = Math.round(mileage / carAge);

  const oilInterval = vehicle.fuelType === 'electric' ? 20000 : 10000;
  const numOilServices = Math.floor(mileage / oilInterval);

  for (let i = 1; i <= numOilServices; i++) {
    const recordKm = i * oilInterval - Math.floor(Math.random() * 800);
    const serviceYear = vehicle.year + Math.min(carAge - 1, Math.floor((recordKm / mileage) * carAge));
    const serviceMonth = String(((i * 3) % 12) + 1).padStart(2, '0');
    const serviceDay = String(((i * 7) % 28) + 1).padStart(2, '0');

    records.push({
      id: `synth-${vehicle.id}-${i}`,
      vehicleVin: vehicle.vin,
      date: `${serviceYear}-${serviceMonth}-${serviceDay}`,
      mileageKm: recordKm,
      category: 'oil_filter',
      serviceTitleAz: `Planlı ${i * oilInterval} km Servis Baxımı & Filtr Dəyişimi`,
      serviceTitleEn: `Scheduled ${i * oilInterval} km Service & Filter Renewal`,
      serviceTitleRu: `Плановое ТО ${i * oilInterval} км и замена фильтров`,
      workshopName: `${vehicle.make} Rəsmi Servis Mərkəzi Bakı`,
      workshopType: 'official_dealer',
      costAzn: Math.round(220 * brandMult),
      performedOperations: [
        'Sintetik mühərrik/aqreqat yağı dəyişimi',
        'Orijinal yağ və mikrofiltr yenilənməsi',
        'Kompüter diaqnostikası və asqı yoxlanışı',
      ],
      replacedParts: ['Mühərrik yağı', 'Yağ filtri', 'Salon filtri'],
      technicianNotes: 'Planlı xidmət uğurla icra edildi.',
      verifiedStamp: true,
      invoiceNumber: `SRV-${serviceYear}-${1000 + i * 17}`,
    });
  }

  return records.sort((a, b) => b.mileageKm - a.mileageKm);
}

/**
 * Calculates high-level summary KPIs and component life percentages
 */
export function calculatePassportSummary(
  vehicle: Vehicle,
  records: ServiceRecord[],
  schedule: ScheduledMaintenanceItem[]
): ServicePassportSummary {
  const totalHistoricalSpentAzn = records.reduce((sum, r) => sum + r.costAzn, 0);
  const verifiedDealerRecordsCount = records.filter(
    (r) => r.verifiedStamp && r.workshopType === 'official_dealer'
  ).length;

  const overdueItems = schedule.filter((s) => s.urgency === 'overdue');
  const dueSoonItems = schedule.filter((s) => s.urgency === 'due_soon');
  const upcomingItems = schedule.filter((s) => s.urgency === 'upcoming');

  const upcomingEstimatedSpentAzn = schedule
    .filter((s) => s.urgency === 'overdue' || s.urgency === 'due_soon')
    .reduce((sum, s) => sum + s.independentEstimatedCostAzn, 0);

  // Health Score algorithm: starts at 100, drops for overdue and due items
  let healthScore = 100;
  healthScore -= overdueItems.length * 18;
  healthScore -= dueSoonItems.length * 6;
  if (records.length === 0) healthScore -= 15;
  healthScore = Math.max(25, Math.min(100, healthScore));

  // Compliance Rate: based on percentage of overdue vs total items
  const complianceRate = Math.max(
    30,
    Math.round(((schedule.length - overdueItems.length) / (schedule.length || 1)) * 100)
  );

  // Life percentages
  const oilItem = schedule.find((s) => s.category === 'oil_filter');
  const brakeItem = schedule.find((s) => s.category === 'brakes');

  const oilLife = oilItem
    ? Math.max(0, Math.min(100, Math.round((oilItem.remainingKm / oilItem.intervalKm) * 100)))
    : 85;

  const brakeLife = brakeItem
    ? Math.max(0, Math.min(100, Math.round((brakeItem.remainingKm / brakeItem.intervalKm) * 100)))
    : 70;

  // Battery health (degradation based on mileage and age)
  const carAge = Math.max(0, new Date().getFullYear() - vehicle.year);
  let batteryHealth = 100 - carAge * 1.5 - (vehicle.mileageKm / 200000) * 8;
  batteryHealth = Math.max(75, Math.min(100, Math.round(batteryHealth)));

  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const lastRecord = sortedRecords[0];

  return {
    vehicleVin: vehicle.vin,
    overallHealthScore: healthScore,
    serviceComplianceRate: complianceRate,
    totalHistoricalSpentAzn,
    upcomingEstimatedSpentAzn,
    verifiedDealerRecordsCount,
    totalRecordsCount: records.length,
    lastServiceDate: lastRecord ? lastRecord.date : undefined,
    lastServiceMileageKm: lastRecord ? lastRecord.mileageKm : undefined,
    overdueCount: overdueItems.length,
    dueSoonCount: dueSoonItems.length,
    upcomingCount: upcomingItems.length,
    oilLifePercentage: oilLife,
    brakeLifePercentage: brakeLife,
    batteryHealthPercentage: batteryHealth,
  };
}

/**
 * Compares official dealership vs certified independent workshop pricing
 */
export function compareServiceWorkshopCosts(
  item: ScheduledMaintenanceItem,
  currency: Currency
): {
  dealerCost: number;
  independentCost: number;
  savingsAzn: number;
  savingsPercent: number;
  convertedDealerCost: number;
  convertedIndependentCost: number;
  convertedSavings: number;
} {
  const rate = CURRENCY_RATES[currency];
  const dealerCost = item.dealerEstimatedCostAzn;
  const independentCost = item.independentEstimatedCostAzn;
  const savingsAzn = Math.max(0, dealerCost - independentCost);
  const savingsPercent = dealerCost > 0 ? Math.round((savingsAzn / dealerCost) * 100) : 0;

  return {
    dealerCost,
    independentCost,
    savingsAzn,
    savingsPercent,
    convertedDealerCost: Math.round(dealerCost / rate),
    convertedIndependentCost: Math.round(independentCost / rate),
    convertedSavings: Math.round(savingsAzn / rate),
  };
}

/**
 * Filter service records based on user search criteria
 */
export function filterServiceRecords(
  records: ServiceRecord[],
  filters: ServiceFilterOptions
): ServiceRecord[] {
  return records.filter((r) => {
    if (filters.category && filters.category !== 'all' && r.category !== filters.category) {
      return false;
    }
    if (filters.workshopType && filters.workshopType !== 'all' && r.workshopType !== filters.workshopType) {
      return false;
    }
    if (filters.onlyVerifiedStamps && !r.verifiedStamp) {
      return false;
    }
    if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchTitle =
        r.serviceTitleAz.toLowerCase().includes(q) ||
        r.serviceTitleEn.toLowerCase().includes(q) ||
        r.serviceTitleRu.toLowerCase().includes(q);
      const matchWorkshop = r.workshopName.toLowerCase().includes(q);
      const matchInvoice = r.invoiceNumber.toLowerCase().includes(q);
      const matchOps = r.performedOperations.some((op) => op.toLowerCase().includes(q));
      if (!matchTitle && !matchWorkshop && !matchInvoice && !matchOps) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Generates official text extract for digital service passport certificate
 */
export function generateDigitalPassportReceipt(
  vehicle: Vehicle,
  summary: ServicePassportSummary,
  schedule: ScheduledMaintenanceItem[]
): string {
  const divider = '=======================================================';
  const subDivider = '-------------------------------------------------------';

  const lines = [
    divider,
    'AUTONEXT AZERBAIJAN - RƏQƏMSAL SERVİS PASPORTU VƏ PROTOKOL',
    divider,
    `Avtomobil: ${vehicle.make} ${vehicle.model} (${vehicle.year})`,
    `VIN Kod: ${vehicle.vin}`,
    `Cari Yürüş: ${vehicle.mileageKm.toLocaleString()} km`,
    `Yanacaq Növü: ${vehicle.fuelType.toUpperCase()}`,
    `Ümumi Sağlamlıq İndeksi: ${summary.overallHealthScore}/100`,
    `Servis İntizamı: ${summary.serviceComplianceRate}%`,
    `Tarixi Xərclər: ${summary.totalHistoricalSpentAzn.toLocaleString()} AZN`,
    `Təsdiqlənmiş Rəsmi Möhür Sayı: ${summary.verifiedDealerRecordsCount}`,
    subDivider,
    'TƏCİLİ VƏ YAXINLAŞAN TEXNİKİ QULLUQ ƏMƏLİYYATLARI:',
    ...schedule.map((item, idx) => {
      const statusLabel =
        item.urgency === 'overdue'
          ? '[GECİKMİŞ !]'
          : item.urgency === 'due_soon'
          ? '[TEZLİKLƏ LAZIMDIR]'
          : '[PLAN ÜZRƏ]';
      return `${idx + 1}. ${item.titleAz} ${statusLabel}\n   Interval: hər ${item.intervalKm.toLocaleString()} km | Qalıq: ${item.remainingKm.toLocaleString()} km | Təxmini: ~${item.independentEstimatedCostAzn} AZN`;
    }),
    subDivider,
    `Çıxarış Tarixi: ${new Date().toLocaleDateString('az-AZ')}`,
    'Təsdiq: AutoNext Verified Digital Passport System (Baku, Azerbaijan)',
    divider,
  ];

  return lines.join('\n');
}

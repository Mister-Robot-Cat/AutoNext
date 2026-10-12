import { Vehicle } from '../types/vehicle';
import {
  InspectionCategory,
  InspectionItem,
  InspectionStatus,
  DiagnosticTroubleCode,
  ReadinessMonitor,
  LiveSensorData,
  PaintThicknessPanel,
  PaintStatus,
  InspectionRecommendation,
  InspectionReport,
} from '../types/inspection';

export const INSPECTION_CATEGORIES: {
  id: InspectionCategory;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  descriptionAz: string;
}[] = [
  {
    id: 'engine_powertrain',
    nameAz: 'Mühərrik və Transmissiya',
    nameEn: 'Engine & Powertrain',
    nameRu: 'Двигатель и Трансмиссия',
    descriptionAz: 'Mühərrik kompressiyası, kəmər/zəncir, transmissiya keçidləri və sızmalar',
  },
  {
    id: 'chassis_suspension',
    nameAz: 'Şassi və Asqı Sistemi',
    nameEn: 'Chassis & Suspension',
    nameRu: 'Шасси и Подвеска',
    descriptionAz: 'Amortizatorlar, saylentbloklar, sükan reykası və körpü elementləri',
  },
  {
    id: 'brakes_tires',
    nameAz: 'Əyləc və Təkərlər',
    nameEn: 'Brakes & Tires',
    nameRu: 'Тормоза и Шины',
    descriptionAz: 'Əyləc bəndlərinin qalınlığı, disklər, ABS bloku və şin protektorunun dərəcəsi',
  },
  {
    id: 'obd2_diagnostics',
    nameAz: 'OBD-II Kompüter Diaqnostikası',
    nameEn: 'OBD-II Diagnostics',
    nameRu: 'Компьютерная диагностика OBD-II',
    descriptionAz: 'ECU xəta kodları (DTC), canlı sensor telemetriyası və emissiya monitorları',
  },
  {
    id: 'exterior_bodywork',
    nameAz: 'Kuzov və Boya Qalınlığı',
    nameEn: 'Bodywork & Paint Gauge',
    nameRu: 'Кузов и Толщиномер',
    descriptionAz: 'Mikrometr ilə detalbədətal boya qalınlığı, dayaq sütunları və deformasiyalar',
  },
  {
    id: 'interior_electronics',
    nameAz: 'Salon və Təhlükəsizlik Sistemləri',
    nameEn: 'Interior & Safety Systems',
    nameRu: 'Салон и Системы безопасности',
    descriptionAz: 'SRS təhlükəsizlik yastıqları, iqlim nəzarəti, multimedia və şüşə qaldırıcılar',
  },
];

export function evaluatePaintStatus(microns: number): PaintStatus {
  if (microns <= 150) return 'original';
  if (microns <= 320) return 'repainted';
  return 'putty_filler';
}

export function clearDtcCodes(): DiagnosticTroubleCode[] {
  return [];
}

export function filterInspectionItems(
  items: InspectionItem[],
  query: string,
  category: InspectionCategory | 'all',
  status: InspectionStatus | 'all'
): InspectionItem[] {
  const normalizedQuery = query.trim().toLowerCase();

  return items.filter((item) => {
    if (category !== 'all' && item.category !== category) {
      return false;
    }
    if (status !== 'all' && item.status !== status) {
      return false;
    }
    if (normalizedQuery) {
      const matchTitle = item.title.toLowerCase().includes(normalizedQuery);
      const matchDesc = item.description.toLowerCase().includes(normalizedQuery);
      return matchTitle || matchDesc;
    }
    return true;
  });
}

export function recalculateInspectionReport(
  base: Omit<InspectionReport, 'overallScore' | 'passedCount' | 'advisoryCount' | 'failedCount' | 'totalCount' | 'categoryScores' | 'totalEstimatedRepairAzn' | 'criticalIssuesCount' | 'recommendation' | 'recommendationLabel' | 'recommendationNotes'>,
  items: InspectionItem[],
  dtcCodes: DiagnosticTroubleCode[],
  paintPanels: PaintThicknessPanel[]
): InspectionReport {
  let passedCount = 0;
  let advisoryCount = 0;
  let failedCount = 0;
  let criticalIssuesCount = 0;
  let totalEstimatedRepairAzn = 0;

  const categoryItemScores: Record<InspectionCategory, { total: number; passed: number; deduction: number }> = {
    engine_powertrain: { total: 0, passed: 0, deduction: 0 },
    chassis_suspension: { total: 0, passed: 0, deduction: 0 },
    brakes_tires: { total: 0, passed: 0, deduction: 0 },
    obd2_diagnostics: { total: 0, passed: 0, deduction: 0 },
    exterior_bodywork: { total: 0, passed: 0, deduction: 0 },
    interior_electronics: { total: 0, passed: 0, deduction: 0 },
  };

  items.forEach((item) => {
    const cat = categoryItemScores[item.category];
    if (cat) cat.total += 1;

    if (item.status === 'pass') {
      passedCount += 1;
      if (cat) cat.passed += 1;
    } else if (item.status === 'advisory') {
      advisoryCount += 1;
      totalEstimatedRepairAzn += item.estimatedRepairAzn;
      if (cat) cat.deduction += 4;
      if (item.severity === 'critical') criticalIssuesCount += 1;
    } else if (item.status === 'fail') {
      failedCount += 1;
      totalEstimatedRepairAzn += item.estimatedRepairAzn;
      if (item.severity === 'critical') {
        criticalIssuesCount += 1;
        if (cat) cat.deduction += 15;
      } else if (item.severity === 'moderate') {
        if (cat) cat.deduction += 8;
      } else {
        if (cat) cat.deduction += 4;
      }
    }
  });

  // Factor in DTC codes
  dtcCodes.forEach((dtc) => {
    if (dtc.severity === 'critical') {
      criticalIssuesCount += 1;
      categoryItemScores.obd2_diagnostics.deduction += 18;
      totalEstimatedRepairAzn += 350;
    } else if (dtc.severity === 'moderate') {
      categoryItemScores.obd2_diagnostics.deduction += 10;
      totalEstimatedRepairAzn += 180;
    } else {
      categoryItemScores.obd2_diagnostics.deduction += 5;
      totalEstimatedRepairAzn += 80;
    }
  });

  // Factor in Paint Panels
  paintPanels.forEach((panel) => {
    if (panel.status === 'putty_filler') {
      categoryItemScores.exterior_bodywork.deduction += 10;
      criticalIssuesCount += 1;
    } else if (panel.status === 'repainted') {
      categoryItemScores.exterior_bodywork.deduction += 3;
    }
  });

  // Compute category scores (0-100)
  const categoryScores: Record<InspectionCategory, number> = {
    engine_powertrain: 100,
    chassis_suspension: 100,
    brakes_tires: 100,
    obd2_diagnostics: 100,
    exterior_bodywork: 100,
    interior_electronics: 100,
  };

  (Object.keys(categoryItemScores) as InspectionCategory[]).forEach((catKey) => {
    const data = categoryItemScores[catKey];
    const rawScore = 100 - data.deduction;
    categoryScores[catKey] = Math.max(15, Math.min(100, Math.round(rawScore)));
  });

  // Calculate weighted overall score
  const weights: Record<InspectionCategory, number> = {
    engine_powertrain: 0.25,
    chassis_suspension: 0.18,
    brakes_tires: 0.15,
    obd2_diagnostics: 0.20,
    exterior_bodywork: 0.12,
    interior_electronics: 0.10,
  };

  let weightedSum = 0;
  (Object.keys(categoryScores) as InspectionCategory[]).forEach((catKey) => {
    weightedSum += categoryScores[catKey] * weights[catKey];
  });

  const overallScore = Math.max(10, Math.min(100, Math.round(weightedSum)));

  let recommendation: InspectionRecommendation = 'recommended';
  let recommendationLabel = 'Tövsiyə olunur';
  let recommendationNotes = 'Avtomobil diaqnostik yoxlamadan uğurla keçdi. Əsas aqreqat və təhlükəsizlik sistemlərində heç bir kritik qüsur aşkarlanmadı.';

  if (overallScore < 60 || criticalIssuesCount >= 2) {
    recommendation = 'avoid';
    recommendationLabel = 'Tövsiyə edilmir';
    recommendationNotes = 'Avtomobildə ciddi mexaniki qüsurlar, yüksək təmir xərcləri və ya kritik təhlükəsizlik riskləri mövcuddur.';
  } else if (overallScore < 82 || criticalIssuesCount === 1 || advisoryCount >= 4) {
    recommendation = 'conditional';
    recommendationLabel = 'Şərtli tövsiyə';
    recommendationNotes = 'Avtomobil ümumilikdə yaxşı vəziyyətdədir, lakin yaxın zamanda təmir və ya xidmət tələb edən bəzi xırda qüsurlar mövcuddur.';
  }

  return {
    ...base,
    overallScore,
    recommendation,
    recommendationLabel,
    recommendationNotes,
    passedCount,
    advisoryCount,
    failedCount,
    totalCount: items.length,
    categoryScores,
    totalEstimatedRepairAzn,
    criticalIssuesCount,
    items,
    dtcCodes,
    paintPanels,
  };
}

export function generateInspectionReport(vehicle: Vehicle): InspectionReport {
  const isHighMileage = vehicle.mileageKm > 130000;
  const isOld = vehicle.year < 2018;
  const isHybridOrEv = vehicle.fuelType === 'hybrid' || vehicle.fuelType === 'plug_in_hybrid' || vehicle.fuelType === 'electric';

  // Check damaged parts from vehicle.damageReport
  const damageMap = new Map<string, string>();
  vehicle.damageReport.forEach((p) => {
    damageMap.set(p.partId, p.severity);
  });

  // 1. Generate Paint Panels
  const defaultPanels: { id: string; name: string }[] = [
    { id: 'hood', name: 'Mühərrik qapağı (Kapot)' },
    { id: 'roof', name: 'Dam' },
    { id: 'front_bumper', name: 'Ön bamper' },
    { id: 'left_fender', name: 'Ön sol qanad' },
    { id: 'right_fender', name: 'Ön sağ qanad' },
    { id: 'front_left_door', name: 'Sürücü qapısı' },
    { id: 'front_right_door', name: 'Ön sərnişin qapısı' },
    { id: 'rear_left_door', name: 'Arxa sol qapı' },
    { id: 'rear_right_door', name: 'Arxa sağ qapı' },
    { id: 'trunk', name: 'Baqaj qapağı' },
    { id: 'rear_bumper', name: 'Arxa bamper' },
  ];

  const paintPanels: PaintThicknessPanel[] = defaultPanels.map((panel) => {
    const damageSeverity = damageMap.get(panel.id);
    let microns = 110;
    if (damageSeverity === 'repaired') {
      microns = 480; // putty filler
    } else if (damageSeverity === 'cosmetic_paint' || damageSeverity === 'replaced') {
      microns = 230; // repainted
    } else if (damageSeverity === 'damaged') {
      microns = 550; // putty/damaged
    } else {
      // Small natural variation
      const pseudoRandom = ((panel.name.length * 17 + vehicle.year) % 25) - 10;
      microns = Math.max(85, Math.min(135, 110 + pseudoRandom));
    }

    return {
      panelId: panel.id,
      panelName: panel.name,
      microns,
      status: evaluatePaintStatus(microns),
      standardRange: '90 - 130 µm',
    };
  });

  // 2. Generate OBD-II Trouble Codes
  const dtcCodes: DiagnosticTroubleCode[] = [];
  if (isOld && isHighMileage) {
    dtcCodes.push({
      code: 'P0420',
      system: 'Katalizator və Emissiya',
      title: 'Katalizator Effektivliyi Aşağıdır (Bank 1)',
      description: 'Katalitik neytrallaşdırıcının effektivliyi zavod həddindən aşağı düşüb.',
      severity: 'moderate',
      milActive: true,
      freezeFrame: {
        rpm: 2150,
        coolantTempC: 92,
        vehicleSpeedKmh: 68,
        stftPercent: 3.2,
        ltftPercent: 9.8,
      },
    });
  }

  if (isHighMileage && vehicle.priceAzn < 30000 && !isHybridOrEv) {
    dtcCodes.push({
      code: 'P0171',
      system: 'Yanacaq Qarışığı Sistemi',
      title: 'Qarışıq Həddindən Artıq Kasıbdır (Bank 1)',
      description: 'Hava sızması və ya hava sərfiyyatı sensorunun (MAF) çirklənməsi ehtimalı.',
      severity: 'minor',
      milActive: false,
      freezeFrame: {
        rpm: 820,
        coolantTempC: 88,
        vehicleSpeedKmh: 0,
        stftPercent: 8.5,
        ltftPercent: 14.1,
      },
    });
  }

  // 3. Readiness Monitors
  const readinessMonitors: ReadinessMonitor[] = [
    { id: 'misfire', name: 'Alışma Qüsurları (Misfire)', status: 'ready' },
    { id: 'fuel', name: 'Yanacaq Sistemi (Fuel Trim)', status: 'ready' },
    { id: 'comp', name: 'Kompleks Komponentlər (CCM)', status: 'ready' },
    { id: 'cat', name: 'Katalizator Monitoru', status: dtcCodes.some((d) => d.code === 'P0420') ? 'not_ready' : 'ready' },
    { id: 'evap', name: 'Buxarlanma Nəzarəti (EVAP)', status: isOld ? 'not_ready' : 'ready' },
    { id: 'o2', name: 'Oksigen (Lambda) Sensoru', status: 'ready' },
    { id: 'egr', name: 'EGR / VVT Sistemi', status: 'ready' },
  ];

  // 4. Live Sensor Telemetry
  const liveSensors: LiveSensorData = {
    engineRpm: 750,
    batteryVoltage: 14.1,
    coolantTempC: 90,
    oilPressureBar: 2.3,
    mafFlowRateGps: isHybridOrEv ? 2.1 : 3.4,
    intakeAirTempC: 24,
  };

  // 5. Checklist Items across categories
  const items: InspectionItem[] = [
    // Engine & Powertrain
    {
      id: 'eng_compression',
      category: 'engine_powertrain',
      title: 'Silindrlərin Kompressiya Balansı',
      description: 'Bütün silindrlərdə təzyiq fərqi 10% daxilindədir',
      status: 'pass',
      severity: 'none',
      measuredValue: '12.4 - 12.8 bar',
      standardValue: '11.0 - 14.0 bar',
      estimatedRepairAzn: 0,
    },
    {
      id: 'eng_oil_leak',
      category: 'engine_powertrain',
      title: 'Mühərrik və Salniklərin Sızma Yoxlanışı',
      description: isHighMileage ? 'Klapan qapağında xırda yağ tərləməsi müşahidə olunur' : 'Heç bir yağ və ya maye sızması aşkar edilmədi',
      status: isHighMileage ? 'advisory' : 'pass',
      severity: isHighMileage ? 'minor' : 'none',
      measuredValue: isHighMileage ? 'Xırda tərləmə' : 'Təmiz və quru',
      standardValue: 'Sızmasız',
      estimatedRepairAzn: isHighMileage ? 85 : 0,
    },
    {
      id: 'eng_timing',
      category: 'engine_powertrain',
      title: 'Qazpaylayıcı Mexanizm (Zəncir/Kəmər) Vəziyyəti',
      description: 'Zəncir uzanması və fazatənzimləyici bucaqları norma daxilindədir',
      status: 'pass',
      severity: 'none',
      measuredValue: '+1.2° faza sapması',
      standardValue: '± 4.0°',
      estimatedRepairAzn: 0,
    },
    {
      id: 'eng_transmission',
      category: 'engine_powertrain',
      title: 'Transmissiya Keçidləri və Hidroblok Təzyiqi',
      description: 'Pillələr arası gecikmə və ya vuruntu müşahidə edilmir',
      status: 'pass',
      severity: 'none',
      measuredValue: '0.28 san keçid müddəti',
      standardValue: '< 0.45 san',
      estimatedRepairAzn: 0,
    },
    {
      id: 'eng_cooling',
      category: 'engine_powertrain',
      title: 'Soyutma Sistemi və Antifriz Sıxlığı',
      description: 'Radiator hermetikliyi və antifrizin donma həddi yoxlanıldı',
      status: 'pass',
      severity: 'none',
      measuredValue: '-38°C donma həddi',
      standardValue: '< -35°C',
      estimatedRepairAzn: 0,
    },

    // Chassis & Suspension
    {
      id: 'chs_shocks',
      category: 'chassis_suspension',
      title: 'Ön və Arxa Amortizatorların Effektivliyi',
      description: isHighMileage ? 'Ön sol amortizatorda yüngül yağlanma və effektivlik itkisi' : 'Vibrostend sınağında sönmə əmsalı əla səviyyədədir',
      status: isHighMileage ? 'advisory' : 'pass',
      severity: isHighMileage ? 'minor' : 'none',
      measuredValue: isHighMileage ? '68% effektivlik' : '88% effektivlik',
      standardValue: '> 70%',
      estimatedRepairAzn: isHighMileage ? 160 : 0,
    },
    {
      id: 'chs_bushings',
      category: 'chassis_suspension',
      title: 'Alt Qollar və Saylentblokların Vəziyyəti',
      description: 'Elastik elementlərdə çat və ya boşluq aşkar olunmadı',
      status: 'pass',
      severity: 'none',
      measuredValue: 'Boşluq yoxdur',
      standardValue: 'Norma daxili',
      estimatedRepairAzn: 0,
    },
    {
      id: 'chs_steering',
      category: 'chassis_suspension',
      title: 'Sükan Reykası və Sükan Ucluqları',
      description: 'Sükan çarxında sərbəst gediş və rels boşluğu yoxlanıldı',
      status: 'pass',
      severity: 'none',
      measuredValue: '4° sərbəst gediş',
      standardValue: '< 10°',
      estimatedRepairAzn: 0,
    },
    {
      id: 'chs_bearings',
      category: 'chassis_suspension',
      title: 'Təkər Topu Yataqları (Stupitsa Podşipnikləri)',
      description: 'Fırlanma zamanı kənar səs və lüft yoxdur',
      status: 'pass',
      severity: 'none',
      measuredValue: 'Səs yoxdur',
      standardValue: 'Səs/lüft olmamalıdır',
      estimatedRepairAzn: 0,
    },

    // Brakes & Tires
    {
      id: 'brk_pads',
      category: 'brakes_tires',
      title: 'Ön və Arxa Əyləc Bəndlərinin (Qəliblərin) Qalınlığı',
      description: isHighMileage ? 'Ön bəndlərin aşınması yüksəkdir, yaxın zamanda dəyişdirilməlidir' : 'Qəlib qalınlığı təhlükəsiz həddədir',
      status: isHighMileage ? 'advisory' : 'pass',
      severity: isHighMileage ? 'minor' : 'none',
      measuredValue: isHighMileage ? '3.5 mm qalıq' : '8.5 mm qalıq',
      standardValue: '> 3.0 mm',
      estimatedRepairAzn: isHighMileage ? 95 : 0,
    },
    {
      id: 'brk_discs',
      category: 'brakes_tires',
      title: 'Əyləc Disklərinin Qalınlığı və Əyriliyi (Runout)',
      description: 'Mikrometr ilə ölçülmüş disk qalınlığı minimum təhlükəsiz həddən yuxarıdır',
      status: 'pass',
      severity: 'none',
      measuredValue: '25.8 mm (əyrilik 0.02 mm)',
      standardValue: '> 23.0 mm (maks 0.05 mm)',
      estimatedRepairAzn: 0,
    },
    {
      id: 'brk_abs',
      category: 'brakes_tires',
      title: 'ABS / ESP Hidravlik Modulu və Əyləc Mayesi',
      description: 'Əyləc mayesində nəmlik payı təhlükəsiz norma daxilindədir',
      status: 'pass',
      severity: 'none',
      measuredValue: '1.2% nəmlik',
      standardValue: '< 2.5%',
      estimatedRepairAzn: 0,
    },
    {
      id: 'brk_tread',
      category: 'brakes_tires',
      title: 'Təkər Protektorunun Dərinliyi və İstehsal Tarixi',
      description: 'Bütün təkərlərdə protektor dərinliyi və bərabər aşınma',
      status: 'pass',
      severity: 'none',
      measuredValue: '6.2 mm (DOT 2024)',
      standardValue: '> 3.0 mm (son 5 il)',
      estimatedRepairAzn: 0,
    },

    // OBD-II Diagnostics
    {
      id: 'obd_mil',
      category: 'obd2_diagnostics',
      title: 'Check Engine (MIL) Xəbərdarlıq İşığı Vəziyyəti',
      description: dtcCodes.length > 0 ? 'ECU yaddaşında aktiv və ya yaddaşa yazılmış xəta kodları mövcuddur' : 'Panel üzərində xəbərdarlıq indikatoru sönülüdür',
      status: dtcCodes.length > 0 ? 'advisory' : 'pass',
      severity: dtcCodes.length > 0 ? 'moderate' : 'none',
      measuredValue: dtcCodes.length > 0 ? `${dtcCodes.length} DTC aşkarlandı` : '0 xəta',
      standardValue: '0 aktiv xəta',
      estimatedRepairAzn: dtcCodes.length > 0 ? 120 : 0,
    },
    {
      id: 'obd_monitors',
      category: 'obd2_diagnostics',
      title: 'Emissiya və Özünüdiaqnostika Hazırlıq Monitorları',
      description: readinessMonitors.some((m) => m.status === 'not_ready') ? 'Bəzi monitorlar tamamlanmayıb (kodlar yeni silinmiş ola bilər)' : 'Bütün monitorlar hazırdır (I/M Ready)',
      status: readinessMonitors.some((m) => m.status === 'not_ready') ? 'advisory' : 'pass',
      severity: readinessMonitors.some((m) => m.status === 'not_ready') ? 'minor' : 'none',
      measuredValue: `${readinessMonitors.filter((m) => m.status === 'ready').length}/${readinessMonitors.length} Hazırdır`,
      standardValue: 'Hamısı hazır olmalıdır',
      estimatedRepairAzn: 0,
    },
    {
      id: 'obd_telemetry',
      category: 'obd2_diagnostics',
      title: 'Canlı Sensor Telemetriyası və Generator Gərginliyi',
      description: 'Şarj gərginliyi və yanacaq korreksiyaları (STFT/LTFT) stabil norma daxilindədir',
      status: 'pass',
      severity: 'none',
      measuredValue: '14.1 V (LTFT +2.4%)',
      standardValue: '13.5 - 14.5 V (±7%)',
      estimatedRepairAzn: 0,
    },

    // Exterior Bodywork
    {
      id: 'ext_pillars',
      category: 'exterior_bodywork',
      title: 'Dayaq Sütunları (A, B, C) və Qaynaq Nöqtələri',
      description: 'Zavod nöqtəli qaynaq tikişləri və hermetik qoruyucu toxunulmazdır',
      status: 'pass',
      severity: 'none',
      measuredValue: 'Zavod qaynağı (105 µm)',
      standardValue: 'Deformasiyasız',
      estimatedRepairAzn: 0,
    },
    {
      id: 'ext_paint_consistency',
      category: 'exterior_bodywork',
      title: 'Boya Qatının Bərabərliyi və Mikrometr Ölçmələri',
      description: paintPanels.some((p) => p.status === 'putty_filler')
        ? 'Bəzi detallarda qalın şpatlyovka qatı (>350 µm) aşkar edildi'
        : paintPanels.some((p) => p.status === 'repainted')
        ? 'Bəzi detallarda ikinci qat lak-boya örtüyü mövcuddur'
        : 'Bütün detallar zavod boyasındadır',
      status: paintPanels.some((p) => p.status === 'putty_filler')
        ? 'fail'
        : paintPanels.some((p) => p.status === 'repainted')
        ? 'advisory'
        : 'pass',
      severity: paintPanels.some((p) => p.status === 'putty_filler') ? 'moderate' : 'none',
      measuredValue: `${paintPanels.filter((p) => p.status === 'original').length}/${paintPanels.length} Zavod detalı`,
      standardValue: 'Zavod qalınlığı: 90-130 µm',
      estimatedRepairAzn: paintPanels.some((p) => p.status === 'putty_filler') ? 220 : 0,
    },

    // Interior Electronics
    {
      id: 'int_airbags',
      category: 'interior_electronics',
      title: 'SRS Təhlükəsizlik Yastıqları Rezistans və Piropatron Testi',
      description: 'Bütün piropatronların daxili müqaviməti zavod standartındadır, manitoringdə müdaxilə yoxdur',
      status: 'pass',
      severity: 'none',
      measuredValue: '2.4 - 2.6 Ohm',
      standardValue: '2.0 - 3.2 Ohm',
      estimatedRepairAzn: 0,
    },
    {
      id: 'int_hvac',
      category: 'interior_electronics',
      title: 'Kondisioner və İqlim Nəzarəti (HVAC) Səmərəliliyi',
      description: 'Kompressor təzyiqi və deflektorlardan çıxan soyuq havanın temperaturu',
      status: 'pass',
      severity: 'none',
      measuredValue: '6.5°C çıxış temp',
      standardValue: '< 8.0°C',
      estimatedRepairAzn: 0,
    },
    {
      id: 'int_odometer',
      category: 'interior_electronics',
      title: 'Odometer (Yürüş) Əsillik Təsdiqi və Blok Sinxronizasiyası',
      description: 'Spidometr, ABS və transmissiya idarəetmə bloklarındakı qeydlər tam uzlaşır',
      status: 'pass',
      severity: 'none',
      measuredValue: 'Bloklararası fərq: 0 km',
      standardValue: '± 500 km',
      estimatedRepairAzn: 0,
    },
  ];

  const baseReport: Omit<InspectionReport, 'overallScore' | 'passedCount' | 'advisoryCount' | 'failedCount' | 'totalCount' | 'categoryScores' | 'totalEstimatedRepairAzn' | 'criticalIssuesCount' | 'recommendation' | 'recommendationLabel' | 'recommendationNotes'> = {
    vehicleVin: vehicle.vin,
    vehicleTitle: `${vehicle.make} ${vehicle.model} (${vehicle.year})`,
    items,
    dtcCodes,
    readinessMonitors,
    liveSensors,
    paintPanels,
    inspectionDate: '12.10.2026',
    inspectorName: 'Fərid Əliyev (Baş Diaqnostik)',
    inspectorBadgeNumber: 'AZ-CERT-98214',
    inspectionStation: 'AutoNext MasterLab Bakı (Böyükşor filialı)',
  };

  return recalculateInspectionReport(baseReport, items, dtcCodes, paintPanels);
}

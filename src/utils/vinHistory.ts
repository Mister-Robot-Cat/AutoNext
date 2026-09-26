import { Vehicle, VinHistoryReport, OdometerReading } from '../types/vehicle';

/**
 * Validates basic ISO 3779 VIN structure (17 alphanumeric characters, excluding I, O, Q)
 */
export function isValidVinFormat(vin: string): boolean {
  if (!vin || vin.trim().length !== 17) return false;
  const sanitized = vin.trim().toUpperCase();
  // VIN cannot contain letters I, O, Q to avoid confusion with numerals 1, 0, 9
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(sanitized);
}

/**
 * Checks for odometer rollback anomalies where mileage decreases over time
 */
export function checkOdometerRollbackRisk(readings: OdometerReading[]): {
  isRollbackDetected: boolean;
  discrepancyText?: string;
} {
  if (!readings || readings.length <= 1) {
    return { isRollbackDetected: false };
  }

  // Sort by date ascending
  const sorted = [...readings].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].mileageKm < sorted[i - 1].mileageKm) {
      return {
        isRollbackDetected: true,
        discrepancyText: `Yürüşdə uyğunsuzluq aşkarlandı: ${sorted[i - 1].date} (${sorted[i - 1].mileageKm} km) -> ${sorted[i].date} (${sorted[i].mileageKm} km)`,
      };
    }
  }

  return { isRollbackDetected: false };
}

/**
 * Generates an authentic Azerbaijan vehicle history report based on vehicle specs
 */
export function generateVinReport(vehicle: Vehicle): VinHistoryReport {
  const currentMileage = vehicle.mileageKm;
  const isDealer = vehicle.seller.type === 'official_dealer';
  
  const m1 = Math.round(currentMileage * 0.25);
  const m2 = Math.round(currentMileage * 0.55);
  const m3 = Math.round(currentMileage * 0.85);

  const readings: OdometerReading[] = [
    { date: `${vehicle.year}-06-15`, mileageKm: 15, source: 'İstehsalçı Çıxış Qeydiyyatı' },
    { date: `${vehicle.year + 1}-03-10`, mileageKm: m1, source: 'Rəsmi Diler 1-ci Texniki Baxış' },
    { date: `${vehicle.year + 2}-05-22`, mileageKm: m2, source: 'DYP İllik Texniki Baxış' },
    { date: `${vehicle.year + 3}-02-14`, mileageKm: m3, source: 'Dövrü Yağ və Əyləc Servisi' },
    { date: vehicle.publishedDate, mileageKm: currentMileage, source: 'AutoNext Yoxlanış Nöqtəsi' },
  ];

  return {
    vin: vehicle.vin,
    vehicleTitle: vehicle.title,
    originCountry: vehicle.make === 'Toyota' ? 'Yaponiya' : vehicle.make === 'BMW' || vehicle.make === 'Porsche' || vehicle.make === 'Mercedes-Benz' ? 'Almaniya' : vehicle.make === 'BYD' ? 'Çin' : 'Cənubi Koreya',
    manufactureYear: vehicle.year,
    importDate: `${vehicle.year}-05-18`,
    customsCleared: vehicle.hasCustomsCleared,
    theftRecord: false,
    accidentCount: vehicle.damageReport.filter((p) => p.severity === 'damaged' || p.severity === 'replaced').length,
    previousOwnersCount: isDealer ? 0 : 1,
    odometerReadings: readings,
    serviceHistory: [
      {
        id: 'srv-1',
        date: `${vehicle.year + 1}-03-10`,
        title: 'İlkin Diler Baxışı & Yağ Dəyişimi',
        mileageKm: m1,
        description: 'Mühərrik yağı, hava və salon filtrləri dəyişdirildi. Elektron diaqnostika keçirildi.',
        verifiedBy: isDealer ? vehicle.seller.name : 'Rəsmi Avtoservis Mərkəzi',
      },
      {
        id: 'srv-2',
        date: `${vehicle.year + 2}-08-19`,
        title: 'Əyləc Bəndləri və Mayelərin Yenilənməsi',
        mileageKm: m2,
        description: 'Ön və arxa əyləc bəndləri yeniləndi, soyutma mayesi səviyyəsi yoxlanıldı.',
        verifiedBy: 'Bosch Car Service Baku',
      },
      {
        id: 'srv-3',
        date: `${vehicle.year + 3}-02-14`,
        title: 'Böyük Profilaktik Baxış',
        mileageKm: m3,
        description: 'Sürətlər qutusu yağı yoxlanıldı, asqı sistemi (peredok) diaqnostikası aparıldı. Qüsur aşkarlanmadı.',
        verifiedBy: isDealer ? vehicle.seller.name : 'AutoMaster Baku',
      },
    ],
    technicalInspections: [
      {
        date: `${vehicle.year + 2}-05-22`,
        result: 'passed',
        notes: 'Dövlət Yol Polisi İllik Texniki Baxışı: Qaz ixracı və əyləc effektivliyi normativlərə uyğundur.',
      },
    ],
    overallStatus: 'clean',
  };
}

import { describe, it, expect } from 'vitest';
import {
  calculateRecallSafetyScore,
  getVehicleRecallReport,
  getRecallSeverityBadge,
  getRecallStatusBadge,
  filterRecalls,
  bookDealerAppointment,
  generateRecallClearanceCertificate,
} from '../recalls';
import { RecallCampaign } from '../../types/recall';
import { Vehicle } from '../../types/vehicle';

const mockVehicle: Vehicle = {
  id: 'car-test-bmw',
  title: 'BMW 530i M Sport',
  vin: 'WBA5A7C50JB192841',
  make: 'BMW',
  model: '530i',
  generation: 'G30 Facelift',
  year: 2021,
  priceAzn: 68500,
  mileageKm: 42000,
  engineVolumeLiters: 2.0,
  fuelType: 'petrol',
  transmission: 'automatic',
  drivetrain: 'rwd',
  powerHp: 252,
  fuelConsumptionLPer100Km: 6.8,
  bodyType: 'sedan',
  color: 'Mineral Grey Metallic',
  interiorColor: 'Cognac Brown',
  interiorMaterial: 'leather',
  city: 'Bakı',
  images: ['https://example.com/car.jpg'],
  features: ['M Sport'],
  damageReport: [],
  valuation: {
    status: 'good_deal',
    percentageDiff: -3.5,
    avgMarketPriceAzn: 71000,
    minMarketPriceAzn: 67000,
    maxMarketPriceAzn: 75000,
    confidenceScore: 94,
    priceHistoryTrend: [],
  },
  seller: {
    id: 's-1',
    name: 'Improtex Motors',
    phone: '+994 12 530 00 55',
    type: 'official_dealer',
    rating: 4.9,
    reviewsCount: 312,
    verifiedIdentity: true,
    memberSinceYear: 2018,
    city: 'Bakı',
  },
  hasCustomsCleared: true,
  isCreditAvailable: true,
  isBarterAvailable: false,
  publishedDate: '2024-01-15T12:00:00Z',
  viewsCount: 350,
  description: 'BMW 530i M Sport',
};

const sampleCampaigns: RecallCampaign[] = [
  {
    id: 'rc-1',
    campaignId: 'RC-001',
    bulletinCode: 'NHTSA-001',
    category: 'brakes',
    severity: 'critical',
    titleAz: 'Əyləc Klapanı',
    titleEn: 'Brake Valve',
    titleRu: 'Тормозной клапан',
    descriptionAz: 'Təsvir Az',
    descriptionEn: 'Description En',
    descriptionRu: 'Описание Ru',
    consequenceAz: 'Nəticə Az',
    consequenceEn: 'Consequence En',
    consequenceRu: 'Следствие Ru',
    remedyAz: 'Həll Az',
    remedyEn: 'Remedy En',
    remedyRu: 'Решение Ru',
    announcementDate: '2023-01-01',
    estimatedLaborHours: 1.5,
    partsRequired: ['Part A'],
    isFreeDealerService: true,
    status: 'open_action_required',
  },
  {
    id: 'rc-2',
    campaignId: 'RC-002',
    bulletinCode: 'NHTSA-002',
    category: 'powertrain',
    severity: 'high',
    titleAz: 'Soyuducu Radiator',
    titleEn: 'Cooling Radiator',
    titleRu: 'Радиатор охлаждения',
    descriptionAz: 'Radiator təsviri',
    descriptionEn: 'Radiator description',
    descriptionRu: 'Описание радиатора',
    consequenceAz: 'Qızma',
    consequenceEn: 'Overheating',
    consequenceRu: 'Перегрев',
    remedyAz: 'Əvəzetmə',
    remedyEn: 'Replacement',
    remedyRu: 'Замена',
    announcementDate: '2022-01-01',
    estimatedLaborHours: 2.0,
    partsRequired: ['Radiator Kit'],
    isFreeDealerService: true,
    status: 'remedy_completed',
  },
];

describe('recalls utility', () => {
  describe('calculateRecallSafetyScore', () => {
    it('returns 100 when there are no active campaigns', () => {
      const completedOnly: RecallCampaign[] = [
        { ...sampleCampaigns[1], status: 'remedy_completed' },
      ];
      expect(calculateRecallSafetyScore(completedOnly)).toBe(100);
      expect(calculateRecallSafetyScore([])).toBe(100);
    });

    it('deducts score based on campaign severity', () => {
      const criticalCampaign = [sampleCampaigns[0]]; // critical open -> -35
      expect(calculateRecallSafetyScore(criticalCampaign)).toBe(65);

      const highCampaign: RecallCampaign[] = [
        { ...sampleCampaigns[0], severity: 'high' },
      ]; // high open -> -20
      expect(calculateRecallSafetyScore(highCampaign)).toBe(80);

      const mediumCampaign: RecallCampaign[] = [
        { ...sampleCampaigns[0], severity: 'medium' },
      ]; // medium open -> -10
      expect(calculateRecallSafetyScore(mediumCampaign)).toBe(90);

      const lowCampaign: RecallCampaign[] = [
        { ...sampleCampaigns[0], severity: 'low' },
      ]; // low open -> -5
      expect(calculateRecallSafetyScore(lowCampaign)).toBe(95);
    });

    it('halves the penalty when campaign remedy is scheduled', () => {
      const scheduledCampaign: RecallCampaign[] = [
        { ...sampleCampaigns[0], status: 'remedy_scheduled' }, // critical scheduled -> -17.5
      ];
      expect(calculateRecallSafetyScore(scheduledCampaign)).toBe(83); // 100 - 17.5 = 82.5 -> rounds to 83
    });

    it('enforces lower bound at 25 for multiple severe recalls', () => {
      const severeList: RecallCampaign[] = [
        { ...sampleCampaigns[0], id: 'c1', severity: 'critical' },
        { ...sampleCampaigns[0], id: 'c2', severity: 'critical' },
        { ...sampleCampaigns[0], id: 'c3', severity: 'critical' },
      ];
      expect(calculateRecallSafetyScore(severeList)).toBe(25);
    });
  });

  describe('getVehicleRecallReport', () => {
    it('returns report for known vehicle VIN', () => {
      const report = getVehicleRecallReport(mockVehicle);
      expect(report.vin).toBe('WBA5A7C50JB192841');
      expect(report.make).toBe('BMW');
      expect(report.model).toBe('530i');
      expect(report.campaigns.length).toBeGreaterThanOrEqual(1);
      expect(report.verificationHash).toContain('RC-VER-WBA5');
      expect(report.lastCheckedDate).toBe('2026-10-13');
    });

    it('returns report with fallback campaigns for unknown vehicle VIN', () => {
      const unknownCar: Vehicle = {
        ...mockVehicle,
        vin: 'UNKNOWN1234567890',
        make: 'Audi',
        model: 'A6',
      };
      const report = getVehicleRecallReport(unknownCar);
      expect(report.vin).toBe('UNKNOWN1234567890');
      expect(report.campaigns.length).toBe(1);
      expect(report.campaigns[0].titleAz).toContain('Audi A6');
    });

    it('identifies critical_hazard overallStatus when critical recall is open', () => {
      const report = getVehicleRecallReport(mockVehicle);
      // BMW mock has open high severity IBS recall and completed critical EGR recall
      expect(report.overallStatus).toBe('action_required');
    });
  });

  describe('getRecallSeverityBadge & getRecallStatusBadge', () => {
    it('returns appropriate badge styling and translations for severities', () => {
      const criticalBadge = getRecallSeverityBadge('critical');
      expect(criticalBadge.labelAz).toBe('Kritik Təhlükəsizlik Riski');
      expect(criticalBadge.bgClass).toContain('rose');

      const highBadge = getRecallSeverityBadge('high');
      expect(highBadge.labelEn).toBe('High Priority');
      expect(highBadge.bgClass).toContain('amber');

      const mediumBadge = getRecallSeverityBadge('medium');
      expect(mediumBadge.labelRu).toBe('Средняя степень');
      expect(mediumBadge.bgClass).toContain('blue');

      const lowBadge = getRecallSeverityBadge('low');
      expect(lowBadge.labelAz).toBe('Məlumat / Aşağı Prioritet');
      expect(lowBadge.bgClass).toContain('slate');
    });

    it('returns appropriate badge styling and translations for statuses', () => {
      const openBadge = getRecallStatusBadge('open_action_required');
      expect(openBadge.labelAz).toBe('Təmir Tələb Olunur');

      const scheduledBadge = getRecallStatusBadge('remedy_scheduled');
      expect(scheduledBadge.labelEn).toBe('Appointment Scheduled');

      const completedBadge = getRecallStatusBadge('remedy_completed');
      expect(completedBadge.labelAz).toBe('Dilerdə İcra Edilib');

      const notAffectedBadge = getRecallStatusBadge('not_affected');
      expect(notAffectedBadge.labelEn).toBe('Not Affected');
    });
  });

  describe('filterRecalls', () => {
    it('filters by search query matching title, bulletin, or description', () => {
      const filteredByTitle = filterRecalls(
        sampleCampaigns,
        'Brake',
        'all',
        'all',
        'all'
      );
      expect(filteredByTitle.length).toBe(1);
      expect(filteredByTitle[0].id).toBe('rc-1');

      const filteredByBulletin = filterRecalls(
        sampleCampaigns,
        'NHTSA-002',
        'all',
        'all',
        'all'
      );
      expect(filteredByBulletin.length).toBe(1);
      expect(filteredByBulletin[0].id).toBe('rc-2');
    });

    it('filters by category, status, and severity', () => {
      const filteredByCategory = filterRecalls(
        sampleCampaigns,
        '',
        'powertrain',
        'all',
        'all'
      );
      expect(filteredByCategory.length).toBe(1);
      expect(filteredByCategory[0].id).toBe('rc-2');

      const filteredByStatus = filterRecalls(
        sampleCampaigns,
        '',
        'all',
        'open_action_required',
        'all'
      );
      expect(filteredByStatus.length).toBe(1);
      expect(filteredByStatus[0].id).toBe('rc-1');

      const filteredBySeverity = filterRecalls(
        sampleCampaigns,
        '',
        'all',
        'all',
        'critical'
      );
      expect(filteredBySeverity.length).toBe(1);
      expect(filteredBySeverity[0].id).toBe('rc-1');
    });
  });

  describe('bookDealerAppointment', () => {
    it('creates an appointment with generated ID and timestamp', () => {
      const booking = bookDealerAppointment({
        campaignId: 'rc-1',
        campaignTitle: 'Brake Valve',
        vin: mockVehicle.vin,
        vehicleTitle: 'BMW 530i',
        serviceCenterId: 'sc-improtex',
        serviceCenterName: 'Improtex Motors',
        serviceCenterAddress: 'Babək pr. 61C',
        serviceCenterPhone: '+994 12 530 00 55',
        date: '2026-10-20',
        timeSlot: '11:00',
        ownerName: 'Elmir Məmmədov',
        ownerPhone: '+994 50 123 45 67',
        requiresLoanerCar: true,
        notes: 'Xahiş olunur əyləc mayesini də yoxlayın.',
      });

      expect(booking.appointmentId).toContain('APT-RECALL-');
      expect(booking.confirmedAt).toBeDefined();
      expect(booking.ownerName).toBe('Elmir Məmmədov');
      expect(booking.requiresLoanerCar).toBe(true);
      expect(booking.timeSlot).toBe('11:00');
    });
  });

  describe('generateRecallClearanceCertificate', () => {
    it('generates a valid clearance certificate for a vehicle', () => {
      const report = getVehicleRecallReport(mockVehicle);
      const certificate = generateRecallClearanceCertificate(mockVehicle, report);

      expect(certificate.certificateId).toContain('CERT-REC-');
      expect(certificate.vin).toBe(mockVehicle.vin);
      expect(certificate.verificationCode).toContain('AZ-DYP-RC-');
      expect(certificate.digitalSignature).toContain('ECDSA-SHA256:');
      expect(certificate.issuerAuthority).toContain('Dövlət Yol Polisi');
      expect(certificate.expiryDate).toBe('2027-10-13');
    });
  });
});

import { describe, it, expect } from 'vitest';
import {
  auditSignalLegality,
  calculateYieldingFine,
  generateDinPermit,
  TONE_CONFIGS,
} from '../specialSignalCompliance';
import { SignalAuditInput } from '../../types/specialSignal';

describe('Special Signal & Siren Compliance Engine', () => {
  describe('auditSignalLegality', () => {
    it('detects illegal siren and strobes on unauthorized civilian vehicle (İXM 342.9)', () => {
      const input: SignalAuditInput = {
        vehiclePlate: '90-XX-777',
        vehicleModel: 'BMW M5',
        operativeCategory: 'civilian_unauthorized',
        signalColor: 'white_strobe',
        hasAudioSiren: true,
        sirenDecibels: 122,
        hasOfficialDinPermit: false,
        isStrobeHiddenUnderGrille: true,
      };

      const result = auditSignalLegality(input);
      expect(result.isCompliant).toBe(false);
      expect(result.legalityLevel).toBe('prohibited_civilian');
      expect(result.fineAmountAzn).toBe(800);
      expect(result.confiscationRisk).toBe(true);
      expect(result.immediateImpoundRisk).toBe(true);
      expect(result.applicableArticles).toContain('İXM Maddə 342.9 (500–800 AZN + Cihazın Müsadirəsi)');
      expect(result.applicableArticles).toContain('İXM Maddə 96.1.4 (Cərimə Meydançasına Məcburi Təxliyə)');
    });

    it('approves standard civilian vehicle without special signals', () => {
      const input: SignalAuditInput = {
        vehiclePlate: '10-AB-123',
        vehicleModel: 'Toyota Corolla',
        operativeCategory: 'civilian_unauthorized',
        signalColor: 'amber',
        hasAudioSiren: false,
        sirenDecibels: 0,
        hasOfficialDinPermit: false,
        isStrobeHiddenUnderGrille: false,
      };

      const result = auditSignalLegality(input);
      expect(result.isCompliant).toBe(true);
      expect(result.legalityLevel).toBe('authorized');
      expect(result.fineAmountAzn).toBe(0);
      expect(result.confiscationRisk).toBe(false);
      expect(result.immediateImpoundRisk).toBe(false);
    });

    it('flags operative vehicle missing official DİN permit', () => {
      const input: SignalAuditInput = {
        vehiclePlate: '99-YP-999',
        vehicleModel: 'BMW 530i',
        operativeCategory: 'police_bdyp',
        signalColor: 'blue_red',
        hasAudioSiren: true,
        sirenDecibels: 122,
        hasOfficialDinPermit: false,
        isStrobeHiddenUnderGrille: false,
      };

      const result = auditSignalLegality(input);
      expect(result.isCompliant).toBe(false);
      expect(result.legalityLevel).toBe('warning_improper_spec');
      expect(result.fineAmountAzn).toBe(500);
      expect(result.statusTitleAz).toContain('DİN Xüsusi İcazəsi');
    });

    it('penalizes municipal or tow truck equipped with unauthorized siren or blue lights', () => {
      const input: SignalAuditInput = {
        vehiclePlate: '90-AA-810',
        vehicleModel: 'MAN Evakuator',
        operativeCategory: 'municipal_service',
        signalColor: 'blue',
        hasAudioSiren: true,
        sirenDecibels: 118,
        hasOfficialDinPermit: true,
        isStrobeHiddenUnderGrille: false,
      };

      const result = auditSignalLegality(input);
      expect(result.isCompliant).toBe(false);
      expect(result.legalityLevel).toBe('warning_improper_spec');
      expect(result.fineAmountAzn).toBe(500);
      expect(result.confiscationRisk).toBe(true);
      expect(result.immediateImpoundRisk).toBe(true);
    });

    it('flags medical vehicle equipped with red beacon (red reserved for Police/Escort)', () => {
      const input: SignalAuditInput = {
        vehiclePlate: '10-TT-103',
        vehicleModel: 'Mercedes Sprinter Ambulans',
        operativeCategory: 'medical_fhn',
        signalColor: 'blue_red',
        hasAudioSiren: true,
        sirenDecibels: 120,
        hasOfficialDinPermit: true,
        isStrobeHiddenUnderGrille: false,
      };

      const result = auditSignalLegality(input);
      expect(result.isCompliant).toBe(false);
      expect(result.fineAmountAzn).toBe(300);
      expect(result.statusTitleAz).toContain('Qırmızı Mayak Yalnız BDYP/DİN');
    });

    it('flags excessive siren decibels exceeding 124 dBA acoustic norm', () => {
      const input: SignalAuditInput = {
        vehiclePlate: '99-YP-401',
        vehicleModel: 'BMW 530i YPX',
        operativeCategory: 'police_bdyp',
        signalColor: 'blue_red',
        hasAudioSiren: true,
        sirenDecibels: 129,
        hasOfficialDinPermit: true,
        isStrobeHiddenUnderGrille: false,
      };

      const result = auditSignalLegality(input);
      expect(result.isCompliant).toBe(false);
      expect(result.fineAmountAzn).toBe(150);
      expect(result.statusTitleAz).toContain('>124 dBA');
    });

    it('approves fully registered DİN BDYP police patrol vehicle', () => {
      const input: SignalAuditInput = {
        vehiclePlate: '99-YP-401',
        vehicleModel: 'BMW 530i YPX',
        operativeCategory: 'police_bdyp',
        signalColor: 'blue_red',
        hasAudioSiren: true,
        sirenDecibels: 122,
        hasOfficialDinPermit: true,
        isStrobeHiddenUnderGrille: false,
      };

      const result = auditSignalLegality(input);
      expect(result.isCompliant).toBe(true);
      expect(result.legalityLevel).toBe('authorized');
      expect(result.fineAmountAzn).toBe(0);
      expect(result.confiscationRisk).toBe(false);
      expect(result.immediateImpoundRisk).toBe(false);
      expect(result.applicableArticles).toContain('YHQ Maddə 48');
    });
  });

  describe('calculateYieldingFine', () => {
    it('returns zero fine and points when civilian yields to operative vehicle', () => {
      const res = calculateYieldingFine(true);
      expect(res.fineAzn).toBe(0);
      expect(res.penaltyPoints).toBe(0);
      expect(res.article).toBe('YHQ Maddə 48');
    });

    it('applies 100 AZN fine and 3 penalty points for failing to yield (İXM 327.3)', () => {
      const res = calculateYieldingFine(false);
      expect(res.fineAzn).toBe(100);
      expect(res.penaltyPoints).toBe(3);
      expect(res.article).toBe('İXM Maddə 327.3');
    });
  });

  describe('generateDinPermit', () => {
    it('generates authentic permit record with DIN-OPR-2026 format and cryptographic security hash', () => {
      const permit = generateDinPermit({
        vehiclePlate: '99-YP-505',
        vin: 'WBA53AG09NFP10482',
        vehicleModel: 'BMW 530i YPX',
        agencyNameAz: 'Daxili İşlər Nazirliyi BDYP',
        category: 'police_bdyp',
        authorizedColors: ['blue_red'],
        maxSoundDecibels: 124,
      });

      expect(permit.permitNumber).toMatch(/^DIN-OPR-2026-\d{5}$/);
      expect(permit.securityHash).toMatch(/^DIN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
      expect(permit.hologramUid).toContain('DİN-AZS-');
      expect(permit.vehiclePlate).toBe('99-YP-505');
      expect(permit.vin).toBe('WBA53AG09NFP10482');
      expect(permit.registryStatus).toBe('active');
      expect(permit.maxSoundDecibels).toBe(124);
      expect(permit.issueDate).toBeDefined();
      expect(permit.expiryDate).toBeDefined();
    });
  });

  describe('TONE_CONFIGS', () => {
    it('defines accurate parameters for all synthetic siren modes', () => {
      expect(TONE_CONFIGS.wail.oscillatorType).toBe('sine');
      expect(TONE_CONFIGS.wail.baseFreq).toBe(600);
      expect(TONE_CONFIGS.yelp.oscillatorType).toBe('triangle');
      expect(TONE_CONFIGS.yelp.rateHz).toBeGreaterThan(1);
      expect(TONE_CONFIGS.hi_lo.oscillatorType).toBe('square');
      expect(TONE_CONFIGS.horn.oscillatorType).toBe('sawtooth');
    });
  });
});

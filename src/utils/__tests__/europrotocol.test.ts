import { describe, expect, it } from 'vitest';
import {
  calculateEuroprotocolPayout,
  calculatePartDamageCost,
  calculateVehicleTotalDamage,
  findScenarioById,
  formatAzerbaijanPlate,
  generateProtocolNumber,
  generateSecurityHash,
  getInsuranceHotline,
  validateEuroprotocolEligibility,
} from '../europrotocol';
import { EuroprotocolEligibilityCriteria, PartyDetails } from '../../types/europrotocol';

describe('Europrotocol Utility Module', () => {
  describe('calculatePartDamageCost', () => {
    it('returns catalog price for front_bumper dent', () => {
      const cost = calculatePartDamageCost('front_bumper', 'dent');
      expect(cost).toBe(180);
    });

    it('returns catalog price for front_headlight_left replace', () => {
      const cost = calculatePartDamageCost('front_headlight_left', 'replace');
      expect(cost).toBe(380);
    });

    it('returns custom cost if specified', () => {
      const cost = calculatePartDamageCost('front_bumper', 'dent', 250);
      expect(cost).toBe(250);
    });

    it('returns fallback value if part is not in catalog', () => {
      // @ts-expect-error testing invalid part id
      const cost = calculatePartDamageCost('invalid_part', 'scratch');
      expect(cost).toBe(50);
    });
  });

  describe('calculateVehicleTotalDamage', () => {
    it('calculates 0 for empty damage list', () => {
      expect(calculateVehicleTotalDamage([])).toBe(0);
    });

    it('sums multiple damaged parts accurately', () => {
      const damages = [
        { partId: 'front_bumper' as const, degree: 'scratch' as const }, // 80
        { partId: 'radiator_grille' as const, degree: 'dent' as const }, // 75
      ];
      expect(calculateVehicleTotalDamage(damages)).toBe(155);
    });
  });

  describe('validateEuroprotocolEligibility', () => {
    const baseCriteria: EuroprotocolEligibilityCriteria = {
      twoVehiclesOnly: true,
      noInjuriesOrCasualties: true,
      validCompulsoryInsuranceBoth: true,
      noThirdPartyPropertyDamage: true,
      mutualAgreementOnFault: true,
      estimatedUnderLimit: true,
    };

    it('returns eligible when all criteria pass and damage is within 1000 AZN', () => {
      const res = validateEuroprotocolEligibility(baseCriteria, 450);
      expect(res.isEligible).toBe(true);
      expect(res.reasons.length).toBe(0);
    });

    it('fails when more than 2 vehicles are involved', () => {
      const res = validateEuroprotocolEligibility({ ...baseCriteria, twoVehiclesOnly: false }, 300);
      expect(res.isEligible).toBe(false);
      expect(res.reasons.some((r) => r.az.includes('2 nəqliyyat vasitəsinin'))).toBe(true);
    });

    it('fails immediately when there are bodily injuries', () => {
      const res = validateEuroprotocolEligibility(
        { ...baseCriteria, noInjuriesOrCasualties: false },
        300
      );
      expect(res.isEligible).toBe(false);
      expect(res.reasons.some((r) => r.az.includes('həyat və ya sağlamlığına'))).toBe(true);
    });

    it('fails when one party lacks compulsory insurance', () => {
      const res = validateEuroprotocolEligibility(
        { ...baseCriteria, validCompulsoryInsuranceBoth: false },
        300
      );
      expect(res.isEligible).toBe(false);
      expect(res.reasons.some((r) => r.az.includes('İcbari Avtomobil Sığorta'))).toBe(true);
    });

    it('fails when third-party road infrastructure is damaged', () => {
      const res = validateEuroprotocolEligibility(
        { ...baseCriteria, noThirdPartyPropertyDamage: false },
        300
      );
      expect(res.isEligible).toBe(false);
      expect(res.reasons.some((r) => r.az.includes('Yol kənarındakı maneələrə'))).toBe(true);
    });

    it('fails when drivers dispute fault', () => {
      const res = validateEuroprotocolEligibility(
        { ...baseCriteria, mutualAgreementOnFault: false },
        300
      );
      expect(res.isEligible).toBe(false);
      expect(res.reasons.some((r) => r.az.includes('təqsirdə tam razılığa gəlmədikdə'))).toBe(true);
    });

    it('fails when damage exceeds 1000 AZN statutory limit', () => {
      const res = validateEuroprotocolEligibility(baseCriteria, 1400);
      expect(res.isEligible).toBe(false);
      expect(res.reasons.some((r) => r.az.includes('1,000 AZN həddini aşır'))).toBe(true);
    });
  });

  describe('calculateEuroprotocolPayout', () => {
    const partyA: PartyDetails = {
      role: 'partyA',
      driverFullName: 'Məmmədov Rauf',
      driverLicense: '02-AA-492019',
      driverPhone: '+994 50 111 22 33',
      plateNumber: '99-BK-412',
      make: 'Toyota',
      model: 'Prius',
      year: 2014,
      vin: 'JTDKN36U0B1294821',
      insuranceCompany: 'PAŞA Sığorta ASC',
      policyNumber: 'ICB-PA-2026-99120',
      damages: [{ partId: 'front_bumper', degree: 'scratch' }], // 80 AZN
    };

    const partyB: PartyDetails = {
      role: 'partyB',
      driverFullName: 'Quliyeva Nərmin',
      driverLicense: '01-AB-193820',
      driverPhone: '+994 55 444 55 66',
      plateNumber: '77-TC-904',
      make: 'Hyundai',
      model: 'Elantra',
      year: 2021,
      vin: 'KMHD84LF7JU293810',
      insuranceCompany: 'Qala Sığorta ASC',
      policyNumber: 'ICB-QA-2026-44018',
      damages: [{ partId: 'rear_bumper', degree: 'dent' }], // 160 AZN
    };

    it('calculates full payout to Party B when Party A is 100% at fault', () => {
      const res = calculateEuroprotocolPayout({
        partyA,
        partyB,
        faultAllocation: 'partyA_100',
        currency: 'AZN',
      });

      expect(res.claimantParty).toBe('partyB');
      expect(res.partyADamageAzn).toBe(80);
      expect(res.partyBDamageAzn).toBe(160);
      expect(res.payablePayoutAzn).toBe(160);
      expect(res.excessUncoveredAzn).toBe(0);
      expect(res.payingInsurer).toBe('PAŞA Sığorta ASC');
      expect(res.payoutConverted.amount).toBe(160);
      expect(res.payoutConverted.currency).toBe('AZN');
    });

    it('caps payout at statutory 1000 AZN when damage exceeds limit', () => {
      const expensivePartyB: PartyDetails = {
        ...partyB,
        damages: [
          { partId: 'rear_bumper', degree: 'replace' }, // 390
          { partId: 'rear_quarter_right', degree: 'replace' }, // 480
          { partId: 'rear_taillight_right', degree: 'replace' }, // 240
        ], // Total = 1110 AZN
      };

      const res = calculateEuroprotocolPayout({
        partyA,
        partyB: expensivePartyB,
        faultAllocation: 'partyA_100',
        currency: 'AZN',
      });

      expect(res.partyBDamageAzn).toBe(1110);
      expect(res.payablePayoutAzn).toBe(1000);
      expect(res.excessUncoveredAzn).toBe(110);
      expect(res.isEligibleDamageLimit).toBe(false);
    });

    it('handles Party B 100% fault correctly', () => {
      const res = calculateEuroprotocolPayout({
        partyA,
        partyB,
        faultAllocation: 'partyB_100',
        currency: 'AZN',
      });

      expect(res.claimantParty).toBe('partyA');
      expect(res.payablePayoutAzn).toBe(80);
      expect(res.payingInsurer).toBe('Qala Sığorta ASC');
    });

    it('handles mutual 50/50 fault correctly', () => {
      const res = calculateEuroprotocolPayout({
        partyA,
        partyB,
        faultAllocation: 'mutual_50_50',
        currency: 'AZN',
      });

      expect(res.claimantParty).toBe('both');
      // 50% of 80 + 50% of 160 = 40 + 80 = 120 AZN
      expect(res.payablePayoutAzn).toBe(120);
    });

    it('converts payout to USD and EUR correctly', () => {
      const resUsd = calculateEuroprotocolPayout({
        partyA,
        partyB,
        faultAllocation: 'partyA_100',
        currency: 'USD',
      });
      // 160 / 1.70 = ~94.1
      expect(resUsd.payoutConverted.currency).toBe('USD');
      expect(resUsd.payoutConverted.amount).toBe(94.1);

      const resEur = calculateEuroprotocolPayout({
        partyA,
        partyB,
        faultAllocation: 'partyA_100',
        currency: 'EUR',
      });
      // 160 / 1.85 = ~86.5
      expect(resEur.payoutConverted.currency).toBe('EUR');
      expect(resEur.payoutConverted.amount).toBe(86.5);
    });
  });

  describe('generateProtocolNumber & generateSecurityHash', () => {
    it('generates properly formatted protocol number', () => {
      const num = generateProtocolNumber();
      expect(num).toMatch(/^ISB-AVRO-2026-\d{5}$/);
    });

    it('generates consistent security hash', () => {
      const hash1 = generateSecurityHash('ISB-AVRO-2026-12345', '99-BK-412', '77-TC-904');
      const hash2 = generateSecurityHash('ISB-AVRO-2026-12345', '99-BK-412', '77-TC-904');
      expect(hash1).toBe(hash2);
      expect(hash1.length).toBeGreaterThan(8);
    });
  });

  describe('formatAzerbaijanPlate', () => {
    it('formats raw string into Azerbaijani standard plate', () => {
      expect(formatAzerbaijanPlate('99yp420')).toBe('99-YP-420');
      expect(formatAzerbaijanPlate('10ax890')).toBe('10-AX-890');
      expect(formatAzerbaijanPlate('77-tc-904')).toBe('77-TC-904');
      expect(formatAzerbaijanPlate('')).toBe('');
    });
  });

  describe('findScenarioById & getInsuranceHotline', () => {
    it('finds scenario by ID', () => {
      const sc = findScenarioById('rear_end');
      expect(sc).toBeDefined();
      expect(sc?.code).toBe('SCEN-01');
    });

    it('returns undefined for invalid scenario ID', () => {
      // @ts-expect-error testing invalid ID
      const sc = findScenarioById('invalid_id');
      expect(sc).toBeUndefined();
    });

    it('resolves correct hotline for insurance company', () => {
      expect(getInsuranceHotline('PAŞA Sığorta ASC')).toBe('*7000');
      expect(getInsuranceHotline('Qala Sığorta ASC')).toBe('1540');
      expect(getInsuranceHotline('Nonexistent Insurance')).toBe('1540');
    });
  });
});

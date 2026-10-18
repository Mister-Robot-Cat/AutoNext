import { describe, it, expect } from 'vitest';
import {
  evaluateHvInsulationAndSafety,
  evaluateBatterySohAndCellDelta,
  evaluateAvasAndGreenPrivileges,
  calculateHvServiceCost,
  generateHvComplianceCertificate,
  lookupHvCertificate,
  convertFromAzn,
} from '../hvBatteryCompliance';

describe('hvBatteryCompliance utility engine', () => {
  describe('evaluateHvInsulationAndSafety (UNECE R100 & FHN Safety)', () => {
    it('passes healthy 400V EV with 185 MΩ insulation and intact HVIL/Pyro-fuse', () => {
      const res = evaluateHvInsulationAndSafety({
        systemVoltageV: 400,
        measuredInsulationMohm: 185,
        faultCondition: 'clean_oem_intact',
        hvilLoopIntact: true,
        pyroFuseIntact: true,
        maxPackTemperatureC: 30,
      });

      expect(res.isCompliant).toBe(true);
      expect(res.prohibitsOperationImmediately).toBe(false);
      expect(res.ohmPerVoltRatio).toBe(462500);
      expect(res.minRequiredOhmPerVolt).toBe(500);
      expect(res.minRequiredMohm).toBe(0.2);
      expect(res.fineAzn).toBe(0);
    });

    it('prohibits operation when insulation resistance drops below UNECE R100 500 Ω/V limit', () => {
      const res = evaluateHvInsulationAndSafety({
        systemVoltageV: 800,
        measuredInsulationMohm: 0.12, // 120,000 Ω / 800V = 150 Ω/V (< 500 Ω/V)
        faultCondition: 'p0aa6_insulation_leak',
        hvilLoopIntact: true,
        pyroFuseIntact: true,
        maxPackTemperatureC: 34,
      });

      expect(res.isCompliant).toBe(false);
      expect(res.insulationBelowR100Limit).toBe(true);
      expect(res.prohibitsOperationImmediately).toBe(true);
      expect(res.ohmPerVoltRatio).toBe(150);
      expect(res.fineAzn).toBe(150);
      expect(res.discountedFineAzn).toBe(75);
    });

    it('detects bypassed HVIL loop, shunted Pyro-fuse, and FHN Thermal Runaway (>55°C)', () => {
      const res = evaluateHvInsulationAndSafety({
        systemVoltageV: 400,
        measuredInsulationMohm: 90,
        faultCondition: 'clean_oem_intact',
        hvilLoopIntact: false,
        pyroFuseIntact: false,
        maxPackTemperatureC: 62,
      });

      expect(res.isCompliant).toBe(false);
      expect(res.thermalRunawayRisk).toBe(true);
      expect(res.prohibitsOperationImmediately).toBe(true);
      expect(res.fineAzn).toBe(150);
      expect(res.violationsAz.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('evaluateBatterySohAndCellDelta (SOH% & Cell Delta mV)', () => {
    it('grades optimal LFP Blade battery (96% SOH, 10 mV delta) as A_OPTIMAL with positive valuation bonus', () => {
      const res = evaluateBatterySohAndCellDelta({
        chemistryId: 'lfp_blade_400v',
        sohPercent: 96,
        cellDeltaMv: 10,
        internalResistanceMohm: 1.8,
        dcFastChargeRatioPercent: 25,
        wltpRatedRangeKm: 520,
      });

      expect(res.isHealthy).toBe(true);
      expect(res.healthGrade).toBe('A_OPTIMAL');
      expect(res.valuationAdjustmentAzn).toBe(1200);
      expect(res.estimatedBakuSummerRangeKm).toBeGreaterThan(
        res.estimatedBakuWinterRangeKm
      );
    });

    it('flags C_BALANCING_NEEDED when cell delta exceeds maxSafeCellDeltaMv', () => {
      const res = evaluateBatterySohAndCellDelta({
        chemistryId: 'nmc_ternary_400v',
        sohPercent: 88,
        cellDeltaMv: 34, // Safe <= 20 mV, Critical > 50 mV
        internalResistanceMohm: 2.5,
        dcFastChargeRatioPercent: 40,
        wltpRatedRangeKm: 480,
      });

      expect(res.cellImbalanceWarning).toBe(true);
      expect(res.cellImbalanceCritical).toBe(false);
      expect(res.healthGrade).toBe('C_BALANCING_NEEDED');
      expect(res.valuationAdjustmentAzn).toBe(-1400);
    });

    it('flags D_CRITICAL_REPLACE when SOH < 70% or cell delta exceeds critical threshold', () => {
      const res = evaluateBatterySohAndCellDelta({
        chemistryId: 'nimh_hev_245v',
        sohPercent: 64,
        cellDeltaMv: 135,
        internalResistanceMohm: 5.4,
        dcFastChargeRatioPercent: 0,
        wltpRatedRangeKm: 60,
      });

      expect(res.isHealthy).toBe(false);
      expect(res.healthGrade).toBe('D_CRITICAL_REPLACE');
      expect(res.valuationAdjustmentAzn).toBe(-4500);
    });
  });

  describe('evaluateAvasAndGreenPrivileges (UNECE R138, Tax Code 164.1.41 & AMB Green Loan)', () => {
    it('grants 0% VAT, 0% Customs Duty, and 10% AMB down payment for <=3 yr EV with active AVAS', () => {
      const res = evaluateAvasAndGreenPrivileges({
        powertrainType: 'ev',
        vehicleAgeYears: 1,
        engineVolumeCc: 0,
        customsValueAzn: 50000,
        avasSpeakerActive: true,
        avasMeasuredDba: 62,
        regenBrakeBlendingNormal: true,
      });

      expect(res.isAvasCompliant).toBe(true);
      expect(res.avasFineAzn).toBe(0);
      expect(res.qualifiesForZeroVat164).toBe(true);
      expect(res.qualifiesForZeroCustomsDuty).toBe(true);
      expect(res.estimatedTaxSavingsAzn).toBe(16500);
      expect(res.ambMinDownPaymentPercent).toBe(10);
      expect(res.ambMinDownPaymentAzn).toBe(5000);
      expect(res.downPaymentSavedVsIceAzn).toBe(15000);
    });

    it('grants 0% VAT and 20% AMB down payment for <=3 yr Hybrid with <=2500cc engine', () => {
      const res = evaluateAvasAndGreenPrivileges({
        powertrainType: 'phev_hev',
        vehicleAgeYears: 2,
        engineVolumeCc: 2487,
        customsValueAzn: 60000,
        avasSpeakerActive: true,
        avasMeasuredDba: 60,
        regenBrakeBlendingNormal: true,
      });

      expect(res.qualifiesForZeroVat164).toBe(true);
      expect(res.qualifiesForZeroCustomsDuty).toBe(false);
      expect(res.estimatedTaxSavingsAzn).toBe(10800);
      expect(res.ambMinDownPaymentPercent).toBe(20);
      expect(res.ambMinDownPaymentAzn).toBe(12000);
    });

    it('triggers 150 AZN IXM 342.2-1 fine when AVAS pedestrian speaker is disabled on EV', () => {
      const res = evaluateAvasAndGreenPrivileges({
        powertrainType: 'ev',
        vehicleAgeYears: 2,
        engineVolumeCc: 0,
        customsValueAzn: 40000,
        avasSpeakerActive: false,
        avasMeasuredDba: 42,
        regenBrakeBlendingNormal: false,
      });

      expect(res.isAvasCompliant).toBe(false);
      expect(res.avasFineAzn).toBe(150);
      expect(res.violationsAz.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Service cost, certificate generation & registry lookup', () => {
    it('calculates HV service package costs and currency conversion accurately', () => {
      const summary = calculateHvServiceCost(
        ['hv-pkg-megohm-r100', 'hv-pkg-cell-balancing'],
        'USD'
      );
      expect(summary.totalAzn).toBe(310);
      expect(summary.totalInCurrency).toBe(convertFromAzn(310, 'USD'));
      expect(summary.finesOrDamageAvoidedAzn).toBe(2550);
    });

    it('generates AZS-HV-2026 certificate and looks up existing sample certificates', () => {
      const cert = generateHvComplianceCertificate({
        plateNumber: '77-ev-555',
        vin: 'lgxc76c44r0999999',
        vehicleTitle: 'BYD Seal AWD',
        chemistryId: 'lfp_blade_400v',
        measuredInsulationMohm: 210,
        sohPercent: 95,
        cellDeltaMv: 11,
        avasCompliant: true,
        centerNameAz: 'AZS & BDYP Mərkəzi Elektromobil HV Laboratoriyası',
      });

      expect(cert.certificateNumber).toMatch(/^AZS-HV-2026-\d{5}$/);
      expect(cert.plateNumber).toBe('77-EV-555');
      expect(cert.overallStatus).toBe('PASS');

      const found = lookupHvCertificate('AZS-HV-2026-91408');
      expect(found).not.toBeNull();
      expect(found?.plateNumber).toBe('77-EV-099');

      expect(lookupHvCertificate('NON-EXISTENT-000')).toBeNull();
    });
  });
});

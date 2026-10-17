import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { HeadlightComplianceModal } from '../HeadlightComplianceModal';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('HeadlightComplianceModal component', () => {
  it('does not render when isOpen is false', () => {
    render(
      <HeadlightComplianceModal
        isOpen={false}
        onClose={vi.fn()}
        vehicle={MOCK_VEHICLES[0]}
        currency="AZN"
      />
    );
    expect(screen.queryByTestId('tab-headlight-auditor')).toBeNull();
  });

  it('renders Xenon/LED auditor tab and detects illegal HID Xenon or >6000K bulbs', () => {
    render(
      <HeadlightComplianceModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={MOCK_VEHICLES[0]}
        currency="AZN"
      />
    );

    expect(screen.getByTestId('headlight-audit-verdict-card')).toBeDefined();
    expect(screen.getByTestId('headlight-fine-amount').textContent).toContain('0 ₼');

    // Switch housing to HCR Halogen and install illegal HID Xenon kit
    fireEvent.click(screen.getByTestId('housing-option-HCR_HALOGEN'));
    fireEvent.change(screen.getByTestId('installed-bulb-select'), {
      target: { value: 'xenon_hid_retrofit' },
    });

    expect(screen.getByTestId('headlight-fine-amount').textContent).toContain('150 ₼');

    // Select unauthorized red/blue strobe beacon (IXM 342.9 -> 650 AZN + confiscation)
    fireEvent.change(screen.getByTestId('special-beacon-select'), {
      target: { value: 'RED_BLUE_UNAUTHORIZED_STROBE' },
    });
    expect(screen.getByTestId('headlight-fine-amount').textContent).toContain('650 ₼');
  });

  it('switches to Regloscope & Luxmeter tab and evaluates JDM RHD blinding beam vs ECE', () => {
    render(
      <HeadlightComplianceModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={MOCK_VEHICLES[0]}
        currency="AZN"
      />
    );

    fireEvent.click(screen.getByTestId('tab-headlight-regloscope'));
    expect(screen.getByTestId('regloscope-pass-badge').textContent).toContain('STENDDƏN KEÇDİ');

    // Change beam pattern to Japanese RHD left-traffic
    fireEvent.change(screen.getByTestId('beam-pattern-select'), {
      target: { value: 'JDM_UK_LEFT_TRAFFIC' },
    });
    expect(screen.getByTestId('regloscope-pass-badge').textContent).toContain(
      'KALİBRASİYA TƏLƏB OLUNUR'
    );
  });

  it('switches to Optical Service & Conversion tab and updates service estimate', () => {
    render(
      <HeadlightComplianceModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={MOCK_VEHICLES[0]}
        currency="AZN"
      />
    );

    fireEvent.click(screen.getByTestId('tab-headlight-centers'));
    expect(screen.getByTestId('lighting-service-total-cost').textContent).toContain('25 ₼');

    fireEvent.click(screen.getByTestId('srv-jdm-conversion'));
    expect(screen.getByTestId('lighting-service-total-cost').textContent).toContain('165 ₼');
  });

  it('switches to BDYP/AZS Certificate tab, generates certificate, and searches registry', () => {
    render(
      <HeadlightComplianceModal
        isOpen={true}
        onClose={vi.fn()}
        vehicle={MOCK_VEHICLES[0]}
        currency="AZN"
      />
    );

    fireEvent.click(screen.getByTestId('tab-headlight-certificate'));

    fireEvent.change(screen.getByTestId('cert-plate-input'), {
      target: { value: '77-LT-999' },
    });
    fireEvent.click(screen.getByTestId('generate-headlight-cert-btn'));

    const certNum = screen.getByTestId('active-headlight-cert-number').textContent || '';
    expect(certNum).toMatch(/^BDYP-FARA-2026-\d{5}$/);

    // Search registry by plate
    fireEvent.change(screen.getByTestId('headlight-registry-search-input'), {
      target: { value: '90-AA-777' },
    });
    fireEvent.click(screen.getByTestId('headlight-registry-search-btn'));
    expect(screen.getByTestId('headlight-registry-search-result').textContent).toContain(
      'BDYP-FARA-2026-10482'
    );
  });
});

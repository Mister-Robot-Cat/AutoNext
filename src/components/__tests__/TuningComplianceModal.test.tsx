import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TuningComplianceModal } from '../TuningComplianceModal';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('TuningComplianceModal component', () => {
  const sampleVehicle = MOCK_VEHICLES[0];

  it('does not render when isOpen is false', () => {
    render(
      <TuningComplianceModal
        isOpen={false}
        vehicle={sampleVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );
    expect(screen.queryByTestId('tuning-compliance-modal')).not.toBeInTheDocument();
  });

  it('renders auditor tab by default and updates compliance banner when toggling modifications', () => {
    render(
      <TuningComplianceModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );

    expect(screen.getByTestId('tuning-compliance-modal')).toBeInTheDocument();
    expect(screen.getByTestId('tuning-auditor-section')).toBeInTheDocument();
    expect(screen.getByTestId('texpasport-endorsement-preview')).toHaveTextContent(
      'Qazbalon avadanlığı (LPG)'
    );

    // Select a prohibited modification
    fireEvent.click(screen.getByTestId('mod-card-cut_springs_baku_style'));
    expect(screen.getByTestId('tuning-overall-status-banner')).toHaveTextContent(
      'CƏRİMƏ MEYDANÇASI RİSKİ'
    );
  });

  it('switches to telemetry tab and simulates illegal exhaust decibel (>84 dBA)', () => {
    render(
      <TuningComplianceModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('tab-tuning-telemetry'));
    expect(screen.getByTestId('tuning-telemetry-section')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('preset-illegal-exhaust-btn'));
    expect(screen.getByTestId('exhaust-dba-badge')).toHaveTextContent('98 dBA');
    expect(screen.getByTestId('statutory-fine-risk-value')).toHaveTextContent('800');
  });

  it('switches to autogas tab and computes LPG/CNG payback and savings', () => {
    render(
      <TuningComplianceModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('tab-tuning-autogas'));
    expect(screen.getByTestId('tuning-autogas-section')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('autogas-system-cng_methane'));
    expect(screen.getByTestId('autogas-monthly-savings')).toBeInTheDocument();
    expect(screen.getByTestId('autogas-payback-months')).toBeInTheDocument();
  });

  it('switches to labs tab, filters by city, and books an AZS lab inspection slot', () => {
    render(
      <TuningComplianceModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('tab-tuning-labs'));
    expect(screen.getByTestId('tuning-labs-section')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('book-lab-btn-lab-baku-zabrat'));
    expect(screen.getByTestId('lab-booking-confirmation-banner')).toHaveTextContent(
      'AZS-QEYD-2026-'
    );
  });

  it('switches to certificate tab, generates BDYP certificate, and verifies sample registry entry', () => {
    render(
      <TuningComplianceModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        lang="az"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('tab-tuning-certificate'));
    expect(screen.getByTestId('tuning-certificate-section')).toBeInTheDocument();
    expect(screen.getByTestId('generated-cert-number')).toHaveTextContent('BDYP-KD-2026-');

    fireEvent.click(screen.getByTestId('sample-cert-btn-10-MM-530'));
    expect(screen.getByTestId('verified-registry-result')).toHaveTextContent(
      'RƏSMİ REYESTRDƏ TƏSDİQLƏNDİ'
    );
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HvBatterySafetyModal } from '../HvBatterySafetyModal';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('HvBatterySafetyModal component', () => {
  const sampleVehicle = MOCK_VEHICLES[1]; // Toyota Camry 2.5 Hybrid

  it('does not render when isOpen is false', () => {
    render(
      <HvBatterySafetyModal
        isOpen={false}
        vehicle={sampleVehicle}
        currency="AZN"
        onClose={vi.fn()}
      />
    );
    expect(
      screen.queryByTestId('hv-battery-safety-modal')
    ).not.toBeInTheDocument();
  });

  it('renders Tab 1 (HV Insulation UNECE R100) by default and detects P0AA6 insulation leak (<500 Ω/V)', () => {
    render(
      <HvBatterySafetyModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        onClose={vi.fn()}
      />
    );

    expect(screen.getByTestId('hv-battery-safety-modal')).toBeInTheDocument();
    expect(screen.getByTestId('panel-hv-insulation')).toBeInTheDocument();
    expect(screen.getByTestId('insulation-fine-amount')).toHaveTextContent(
      '0 ₼'
    );

    // Click preset for P0AA6 insulation leak
    fireEvent.click(screen.getByTestId('preset-insulation-leak'));
    expect(screen.getByTestId('insulation-fine-amount')).toHaveTextContent(
      '150 ₼'
    );
    expect(
      screen.getByTestId('hv-insulation-verdict-banner')
    ).toHaveTextContent(/İstismar Qadağandır/i);
  });

  it('navigates to Tab 2 (Battery SOH% & Cell Delta mV) and updates SOH% & Cell Delta telemetry', () => {
    render(
      <HvBatterySafetyModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('tab-hv-soh-delta'));
    expect(screen.getByTestId('panel-hv-soh-delta')).toBeInTheDocument();

    const sohSlider = screen.getByTestId('soh-percent-slider');
    fireEvent.change(sohSlider, { target: { value: '65' } });
    expect(screen.getByTestId('soh-percent-display')).toHaveTextContent('65%');
    expect(screen.getByTestId('soh-valuation-impact')).toHaveTextContent(
      '-4500 ₼'
    );
  });

  it('navigates to Tab 3 (UNECE R138 AVAS & Tax Code 164.1.41 / AMB Green Credit) and verifies privileges', () => {
    render(
      <HvBatterySafetyModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('tab-hv-avas-green'));
    expect(screen.getByTestId('panel-hv-avas-green')).toBeInTheDocument();

    // Switch to full EV powertrain
    fireEvent.click(screen.getByTestId('powertrain-btn-ev'));
    expect(screen.getByTestId('amb-down-payment-value')).toBeInTheDocument();

    // Uncheck AVAS speaker to trigger 150 AZN violation
    fireEvent.click(screen.getByTestId('avas-active-checkbox'));
    expect(screen.getByTestId('panel-hv-avas-green')).toHaveTextContent(
      /UNECE R138 üzrə məcburi olan AVAS/i
    );
  });

  it('navigates to Tab 4 (Accredited HV Centers) & Tab 5 (AZS-HV-2026 Certificate & Registry Lookup)', () => {
    render(
      <HvBatterySafetyModal
        isOpen={true}
        vehicle={sampleVehicle}
        currency="AZN"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('tab-hv-centers'));
    expect(screen.getByTestId('panel-hv-centers')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('hv-pkg-hv-pkg-cell-balancing'));

    // Switch to Certificate tab
    fireEvent.click(screen.getByTestId('tab-hv-certificate'));
    expect(screen.getByTestId('panel-hv-certificate')).toBeInTheDocument();
    expect(
      screen.getByTestId('generated-hv-cert-number').textContent
    ).toMatch(/^AZS-HV-2026-\d{5}$/);

    // Verify sample lookup in registry
    fireEvent.click(screen.getByTestId('sample-hv-cert-77-EV-099'));
    expect(
      screen.getByTestId('hv-registry-lookup-result')
    ).toHaveTextContent('AZS-HV-2026-91408');
  });
});
